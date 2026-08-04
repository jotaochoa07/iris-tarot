-- ===========================================================================
-- IRIS — esquema inicial
--
-- Dos principios gobiernan este esquema:
--
--   1. SEPARACIÓN DE PERSONAS. Una tirada pertenece a una `person`, que puede
--      ser el propietario o un invitado. Las estadísticas personales se
--      calculan SOLO sobre personas de tipo `owner`.
--
--   2. DOS MEMORIAS DISTINTAS. `card_progress` guarda dos contadores:
--      `personal_count` (solo tiradas propias) y `studied_count` (todo lo que
--      el propietario ha leído, incluidas tiradas para invitados). Nunca se
--      suman.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- persons
-- ---------------------------------------------------------------------------

create type person_type as enum ('owner', 'guest');

create table public.persons (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  type          person_type not null default 'guest',
  display_name  text not null,
  is_recurring  boolean not null default false,
  created_at    timestamptz not null default now()
);

create index persons_user_idx on public.persons (user_id);

-- Un solo perfil `owner` por cuenta.
create unique index persons_single_owner_idx
  on public.persons (user_id)
  where type = 'owner';

-- ---------------------------------------------------------------------------
-- readings
--
-- Los campos de análisis son jsonb a propósito: el motor de interpretación
-- evolucionará y no queremos migraciones cada vez que se añada una sección.
-- La forma canónica vive en src/lib/types.ts.
-- ---------------------------------------------------------------------------

create table public.readings (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  person_id            uuid not null references public.persons(id) on delete cascade,
  schema_version       integer not null default 1,

  created_at           timestamptz not null default now(),

  question             text,
  spread_type          text not null default 'open',
  positions            jsonb not null default '[]'::jsonb,

  cards                jsonb not null default '[]'::jsonb,
  card_order           text[] not null default '{}',
  orientation          jsonb not null default '{}'::jsonb,

  image_reference      text,

  structural_readout   jsonb,
  tarot_analysis       jsonb,
  learn_analysis       jsonb,
  archetypal_analysis  jsonb,
  reflection_question  text,

  user_notes           text,

  outcome              text,
  outcome_added_at     timestamptz,

  learnings            jsonb not null default '[]'::jsonb,
  sources              jsonb not null default '[]'::jsonb
);

create index readings_user_created_idx on public.readings (user_id, created_at desc);
create index readings_person_idx on public.readings (person_id);

-- ---------------------------------------------------------------------------
-- card_progress — las dos memorias
-- ---------------------------------------------------------------------------

create table public.card_progress (
  user_id           uuid not null references auth.users(id) on delete cascade,
  card_slug         text not null,
  personal_count    integer not null default 0,
  studied_count     integer not null default 0,
  first_studied_at  timestamptz,
  last_studied_at   timestamptz,
  primary key (user_id, card_slug)
);

-- ---------------------------------------------------------------------------
-- card_notes — anotaciones del propietario en la Biblioteca
-- ---------------------------------------------------------------------------

create table public.card_notes (
  user_id     uuid not null references auth.users(id) on delete cascade,
  card_slug   text not null,
  note        text not null default '',
  updated_at  timestamptz not null default now(),
  primary key (user_id, card_slug)
);

-- ---------------------------------------------------------------------------
-- Trigger: actualizar progreso al guardar una tirada
--
-- studied_count sube siempre: el propietario trabajó esa carta.
-- personal_count sube solo si la tirada era suya.
-- ---------------------------------------------------------------------------

create or replace function public.sync_card_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p_type person_type;
  slug   text;
begin
  select type into p_type from public.persons where id = new.person_id;

  foreach slug in array new.card_order loop
    insert into public.card_progress as cp (
      user_id, card_slug, personal_count, studied_count,
      first_studied_at, last_studied_at
    )
    values (
      new.user_id, slug,
      case when p_type = 'owner' then 1 else 0 end,
      1, new.created_at, new.created_at
    )
    on conflict (user_id, card_slug) do update set
      personal_count   = cp.personal_count + (case when p_type = 'owner' then 1 else 0 end),
      studied_count    = cp.studied_count + 1,
      first_studied_at = least(coalesce(cp.first_studied_at, new.created_at), new.created_at),
      last_studied_at  = greatest(coalesce(cp.last_studied_at, new.created_at), new.created_at);
  end loop;

  return new;
end;
$$;

create trigger readings_sync_progress
  after insert on public.readings
  for each row execute function public.sync_card_progress();

-- ---------------------------------------------------------------------------
-- Vista: patrones personales
--
-- Existe para que sea imposible calcular estadísticas del propietario mezclando
-- tiradas de invitados. Si alguien consulta patrones, consulta esta vista.
-- ---------------------------------------------------------------------------

create view public.personal_readings
with (security_invoker = true) as
  select r.*
  from public.readings r
  join public.persons p on p.id = r.person_id
  where p.type = 'owner';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.persons        enable row level security;
alter table public.readings       enable row level security;
alter table public.card_progress  enable row level security;
alter table public.card_notes     enable row level security;

create policy "persons: propias" on public.persons
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "readings: propias" on public.readings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "card_progress: propio" on public.card_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "card_notes: propias" on public.card_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Alta automática del perfil propietario
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.persons (user_id, type, display_name, is_recurring)
  values (
    new.id,
    'owner',
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    true
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Storage: fotografías de las tiradas
--
-- Bucket privado. Cada usuario solo accede a su carpeta: spreads/<uid>/...
-- Las fotos son del usuario. IRIS no redistribuye imágenes de baraja.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('spreads', 'spreads', false)
on conflict (id) do nothing;

create policy "spreads: leer lo propio" on storage.objects
  for select using (
    bucket_id = 'spreads' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "spreads: subir lo propio" on storage.objects
  for insert with check (
    bucket_id = 'spreads' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "spreads: borrar lo propio" on storage.objects
  for delete using (
    bucket_id = 'spreads' and (storage.foldername(name))[1] = auth.uid()::text
  );
