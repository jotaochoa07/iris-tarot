-- ===========================================================================
-- IRIS — capa 2: corpus privado
--
-- Recuperación por texto completo en español sobre los libros que el
-- propietario ha cargado en SU instalación. Ni embeddings ni servicios
-- externos: el vocabulario del Tarot es concreto y la búsqueda léxica basta.
--
-- El corpus es común a la instalación, no por usuario. Cualquier usuario
-- autenticado puede leerlo; solo la clave de servicio puede escribirlo, y eso
-- ocurre únicamente en el script de ingesta.
-- ===========================================================================

create table if not exists public.corpus_documents (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  authors     text not null,
  -- Debe coincidir con SchoolId en src/lib/types.ts.
  school      text not null,
  year        integer,
  created_at  timestamptz not null default now()
);

create table if not exists public.corpus_chunks (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.corpus_documents(id) on delete cascade,
  ordinal      integer not null,
  -- Capítulo o sección real, tomado del índice del EPUB. Nunca inventado.
  locator      text,
  content      text not null,
  tsv          tsvector generated always as (to_tsvector('spanish', content)) stored,
  created_at   timestamptz not null default now()
);

create index if not exists corpus_chunks_tsv_idx on public.corpus_chunks using gin (tsv);
create index if not exists corpus_chunks_doc_idx on public.corpus_chunks (document_id, ordinal);

alter table public.corpus_documents enable row level security;
alter table public.corpus_chunks    enable row level security;

drop policy if exists "corpus_documents: lectura autenticada" on public.corpus_documents;
create policy "corpus_documents: lectura autenticada" on public.corpus_documents
  for select to authenticated using (true);

drop policy if exists "corpus_chunks: lectura autenticada" on public.corpus_chunks;
create policy "corpus_chunks: lectura autenticada" on public.corpus_chunks
  for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Búsqueda
--
-- Devuelve pasajes ordenados por relevancia, con su libro y su localizador.
-- El filtro por escuela permite pedir solo Tarot o solo psicología, para que
-- la capa junguiana no contamine la lectura canónica.
-- ---------------------------------------------------------------------------

create or replace function public.search_corpus(
  q        text,
  schools  text[] default null,
  k        integer default 6
)
returns table (
  content  text,
  locator  text,
  title    text,
  authors  text,
  school   text,
  rank     real
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    c.content,
    c.locator,
    d.title,
    d.authors,
    d.school,
    ts_rank(c.tsv, websearch_to_tsquery('spanish', q)) as rank
  from public.corpus_chunks c
  join public.corpus_documents d on d.id = c.document_id
  where c.tsv @@ websearch_to_tsquery('spanish', q)
    and (schools is null or d.school = any(schools))
  order by rank desc
  limit greatest(1, least(k, 20));
$$;

grant execute on function public.search_corpus(text, text[], integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Nombre del propietario
--
-- IRIS se dirige a la persona por su nombre. Hasta que lo diga, no lo sabe:
-- el prefijo del correo no es un nombre.
-- ---------------------------------------------------------------------------

alter table public.persons
  add column if not exists onboarded_at timestamptz;
