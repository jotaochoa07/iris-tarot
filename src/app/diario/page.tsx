import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CardFace } from "@/components/CardFace";
import { Display, Rule, Screen, SectionTitle } from "@/components/ui";

export const dynamic = "force-dynamic";

type Filter = "mias" | "invitados" | "todas";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "mias", label: "Mis tiradas" },
  { id: "invitados", label: "Invitados" },
  { id: "todas", label: "Todas" },
];

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function DiarioPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string; p?: string }>;
}) {
  const { f, p } = await searchParams;
  const filter: Filter = (["mias", "invitados", "todas"] as const).includes(
    f as Filter,
  )
    ? (f as Filter)
    : "mias";

  const supabase = await createClient();

  let query = supabase
    .from("readings")
    .select(
      "id, created_at, question, card_order, outcome, person_id, persons!inner(display_name, type)",
    )
    .order("created_at", { ascending: false })
    .limit(60);

  if (filter === "mias") query = query.eq("persons.type", "owner");
  if (filter === "invitados") query = query.eq("persons.type", "guest");
  if (p) query = query.eq("person_id", p);

  const [{ data: readings }, { data: guests }] = await Promise.all([
    query,
    supabase
      .from("persons")
      .select("id, display_name")
      .eq("type", "guest")
      .eq("is_recurring", true)
      .order("display_name"),
  ]);

  return (
    <Screen>
      <header className="mb-9 flex items-center justify-between">
        <Link href="/" className="eyebrow hover:text-ink-700">
          ← IRIS
        </Link>
        <a href="/api/export" className="eyebrow hover:text-ink-700">
          Exportar
        </a>
      </header>

      <Display className="text-[2rem] leading-tight">Diario</Display>

      <nav className="mt-7 flex gap-2">
        {FILTERS.map((x) => (
          <Link
            key={x.id}
            href={`/diario?f=${x.id}`}
            className={`rounded-full border px-3.5 py-1.5 text-[0.8125rem] ${
              filter === x.id
                ? "border-ink-800 bg-ink-900 text-paper"
                : "border-ink-200 text-ink-600"
            }`}
          >
            {x.label}
          </Link>
        ))}
      </nav>

      {filter === "invitados" && (guests?.length ?? 0) > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/diario?f=invitados"
            className={`text-[0.75rem] underline underline-offset-4 ${
              p ? "text-ink-400" : "text-ink-800"
            }`}
          >
            Todos
          </Link>
          {guests!.map((g) => (
            <Link
              key={g.id}
              href={`/diario?f=invitados&p=${g.id}`}
              className={`text-[0.75rem] underline underline-offset-4 ${
                p === g.id ? "text-ink-800" : "text-ink-400"
              }`}
            >
              {g.display_name}
            </Link>
          ))}
        </div>
      )}

      {filter === "mias" && (
        <p className="mt-5 text-[0.75rem] leading-relaxed text-ink-400">
          Tus patrones personales se calculan solo con estas tiradas. Las lecturas
          hechas para otras personas no entran aquí.
        </p>
      )}

      <Rule />

      {(readings?.length ?? 0) === 0 ? (
        <p className="text-[0.9375rem] text-ink-500">
          Todavía no hay tiradas en esta vista.
        </p>
      ) : (
        <ul className="flex flex-col">
          {readings!.map((r) => {
            const person = Array.isArray(r.persons) ? r.persons[0] : r.persons;
            return (
              <li key={r.id} className="border-b border-ink-100 last:border-0">
                <Link href={`/tirada/${r.id}`} className="block py-6">
                  <div className="mb-3 flex items-baseline justify-between">
                    <span className="text-[0.6875rem] tracking-wide text-ink-400">
                      {formatDate(r.created_at)}
                    </span>
                    {person?.type === "guest" && (
                      <span className="text-[0.6875rem] tracking-wide text-ink-400">
                        para {person.display_name}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {(r.card_order ?? []).slice(0, 6).map((s: string, i: number) => (
                      <CardFace key={i} slug={s} size="sm" className="w-[42px]" />
                    ))}
                  </div>
                  {r.question && (
                    <p className="mt-3 font-quote text-[1.0625rem] leading-snug text-ink-700">
                      «{r.question}»
                    </p>
                  )}
                  {r.outcome && (
                    <p className="mt-2 text-[0.75rem] text-ink-400">
                      Ciclo cerrado · con desenlace registrado
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Rule />
      <SectionTitle>Portabilidad</SectionTitle>
      <p className="max-w-[42ch] text-[0.8125rem] leading-relaxed text-ink-400">
        El Diario es tuyo. «Exportar» descarga un JSON con todas las tiradas,
        personas y progreso, conservando la separación entre lo tuyo y lo de tus
        invitados.
      </p>
    </Screen>
  );
}
