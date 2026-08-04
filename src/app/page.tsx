import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CardFace } from "@/components/CardFace";
import { ButtonLink, Display, Screen } from "@/components/ui";
import { CARDS } from "@/lib/knowledge/cards";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

export default async function Home() {
  const supabase = await createClient();

  const [{ data: last }, { data: progress }, { count: personalCount }] =
    await Promise.all([
      supabase
        .from("readings")
        .select("id, created_at, question, card_order, person_id, persons(display_name, type)")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("card_progress").select("card_slug, studied_count"),
      supabase
        .from("personal_readings")
        .select("id", { count: "exact", head: true }),
    ]);

  const studied = progress?.length ?? 0;
  const person = Array.isArray(last?.persons) ? last?.persons[0] : last?.persons;
  const isGuest = person?.type === "guest";

  return (
    <Screen>
      <header className="flex items-baseline justify-between">
        <p className="eyebrow">IRIS</p>
        <Link href="/diario" className="eyebrow hover:text-ink-700">
          Diario
        </Link>
      </header>

      <div className="rise mt-20">
        <Display className="text-[2.5rem] leading-[1.06] tracking-[-0.03em]">
          ¿Qué muestran
          <br />
          hoy las cartas?
        </Display>
      </div>

      <div className="rise d-1 mt-9">
        <ButtonLink href="/tirada/nueva" size="lg" className="w-full">
          Nueva tirada
        </ButtonLink>
      </div>

      {last ? (
        <section className="rise d-2 mt-16">
          <div className="rule-solid mb-6" />
          <div className="mb-4 flex items-baseline justify-between">
            <p className="eyebrow">Última tirada</p>
            <p className="text-[0.6875rem] tracking-wide text-ink-300">
              {formatDate(last.created_at)}
              {isGuest && person?.display_name
                ? ` · para ${person.display_name}`
                : ""}
            </p>
          </div>
          <Link href={`/tirada/${last.id}`} className="block">
            <div className="flex gap-2">
              {(last.card_order ?? []).slice(0, 5).map((slug: string, i: number) => (
                <CardFace key={`${slug}-${i}`} slug={slug} size="sm" />
              ))}
            </div>
            {last.question && (
              <p className="mt-4 font-quote text-[1.0625rem] leading-snug text-ink-700">
                «{last.question}»
              </p>
            )}
          </Link>
        </section>
      ) : (
        <section className="fade d-2 mt-16">
          <div className="rule-solid mb-6" />
          <p className="max-w-[34ch] text-[0.9375rem] leading-relaxed text-ink-500">
            Todavía no hay ninguna tirada. Coloca tres cartas sobre la mesa,
            hazles una pregunta y fotografíalas.
          </p>
        </section>
      )}

      <section className="fade d-4 mt-16">
        <div className="rule-solid mb-6" />
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
          <Stat
            value={`${studied}`}
            total={`${CARDS.length}`}
            label="cartas estudiadas"
          />
          <Stat value={`${personalCount ?? 0}`} label="tiradas propias" />
        </div>
        <nav className="mt-8 flex gap-6">
          <Link href="/diario" className="eyebrow hover:text-ink-700">
            Diario
          </Link>
          <Link href="/biblioteca" className="eyebrow hover:text-ink-700">
            Biblioteca
          </Link>
          <a href="/api/export" className="eyebrow hover:text-ink-700">
            Exportar
          </a>
        </nav>
      </section>
    </Screen>
  );
}

function Stat({
  value,
  total,
  label,
}: {
  value: string;
  total?: string;
  label: string;
}) {
  return (
    <p className="text-ink-500">
      <span className="font-display text-[1.5rem] text-ink-900">{value}</span>
      {total && <span className="font-display text-[1.1rem] text-ink-300"> / {total}</span>}
      <span className="ml-2 text-[0.8125rem]">{label}</span>
    </p>
  );
}
