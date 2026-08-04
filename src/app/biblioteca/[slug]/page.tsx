import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CardFace } from "@/components/CardFace";
import { Display, Notice, Rule, Screen, SectionTitle } from "@/components/ui";
import { getCard } from "@/lib/knowledge/cards";
import { SUITS } from "@/lib/knowledge/suits";
import { DEGREES } from "@/lib/knowledge/degrees";
import { MAJORS_BY_SLUG } from "@/lib/knowledge/majors";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function FichaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const card = getCard(slug);
  if (!card) notFound();

  const supabase = await createClient();
  const [{ data: progress }, { data: readings }] = await Promise.all([
    supabase
      .from("card_progress")
      .select("*")
      .eq("card_slug", slug)
      .maybeSingle(),
    supabase
      .from("readings")
      .select("id, created_at, question, persons(display_name, type)")
      .contains("card_order", [slug])
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const suit = card.suit ? SUITS[card.suit] : null;
  const degree = card.degree ? DEGREES[card.degree] : null;
  const major = card.arcana === "major" ? MAJORS_BY_SLUG[card.slug] : null;

  return (
    <Screen>
      <header className="mb-9">
        <Link href="/biblioteca" className="eyebrow hover:text-ink-700">
          ← Biblioteca
        </Link>
      </header>

      <div className="flex items-start gap-5">
        <CardFace slug={card.slug} size="lg" />
        <div className="pt-1">
          <p className="eyebrow mb-2">
            {card.arcana === "major" ? "Arcano Mayor" : "Arcano Menor"}
            {suit ? ` · ${suit.label}` : ""}
          </p>
          <Display className="text-[1.75rem] leading-tight">{card.name}</Display>
          {major?.name_fr && major.name_fr !== "—" && (
            <p className="mt-1 font-quote text-[1rem] text-ink-400">
              {major.name_fr}
            </p>
          )}
        </div>
      </div>

      <Rule />

      <SectionTitle>Estructura</SectionTitle>
      <dl className="flex flex-col gap-3">
        <Row label="Tipo" value={card.arcana === "major" ? "Arcano Mayor" : "Arcano Menor"} />
        {card.roman !== "—" && <Row label="Número" value={card.roman} />}
        {suit && <Row label="Palo" value={suit.label} />}
        {degree && <Row label="Grado" value={`${degree.label} — ${degree.in_one_line}`} />}
      </dl>

      <Rule />

      <SectionTitle>Simbología visual</SectionTitle>
      <p className="font-serif text-[1.0625rem] leading-relaxed text-ink-700">
        {card.visual}
      </p>
      {suit && (
        <p className="mt-4 font-serif text-[0.9375rem] leading-relaxed text-ink-500">
          {suit.sign_construction}
        </p>
      )}

      <Rule />

      <SectionTitle>Lectura según Jodorowsky / Costa</SectionTitle>
      {major ? (
        <p className="font-serif text-[1.0625rem] leading-relaxed text-ink-700">
          {major.axis}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {degree && (
            <p className="font-serif text-[1.0625rem] leading-relaxed text-ink-700">
              {degree.gesture}
            </p>
          )}
          {suit && (
            <p className="font-serif text-[1.0625rem] leading-relaxed text-ink-700">
              {suit.territory}
            </p>
          )}
          {degree && suit && (
            <Notice>
              Primero el grado, después el palo. Comprende qué hace un{" "}
              {degree.label.toLowerCase()} antes de mirar qué ocurre cuando ese
              gesto se expresa en {suit.label}.
            </Notice>
          )}
        </div>
      )}
      <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-400">
        Redacción original de IRIS sobre el sistema atribuido a Jodorowsky/Costa.
        Localizador no verificado.
      </p>

      <Rule />

      <SectionTitle>Preguntas para observarla</SectionTitle>
      <ul className="flex flex-col gap-3">
        {[degree?.observe, major?.observe, suit ? `¿Qué ocurre cuando este palo aparece junto a otro distinto?` : null]
          .filter(Boolean)
          .map((q, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-[0.45rem] h-[3px] w-[3px] shrink-0 rounded-full bg-ink-400" />
              <span className="font-serif text-[1rem] leading-relaxed text-ink-700">
                {q}
              </span>
            </li>
          ))}
      </ul>

      <Rule />

      <SectionTitle>Mis tiradas con esta carta</SectionTitle>
      {(readings?.length ?? 0) === 0 ? (
        <p className="text-[0.9375rem] text-ink-500">
          Todavía no ha aparecido en ninguna tirada.
        </p>
      ) : (
        <>
          {progress && (
            <p className="mb-4 text-[0.75rem] text-ink-400">
              {progress.personal_count} vez/veces en tiradas propias ·{" "}
              {progress.studied_count} en total estudiadas
            </p>
          )}
          <ul className="flex flex-col">
            {readings!.map((r) => {
              const person = Array.isArray(r.persons) ? r.persons[0] : r.persons;
              return (
                <li key={r.id} className="border-b border-ink-100 last:border-0">
                  <Link href={`/tirada/${r.id}`} className="block py-4">
                    <p className="text-[0.6875rem] tracking-wide text-ink-400">
                      {formatDate(r.created_at)}
                      {person?.type === "guest" ? ` · para ${person.display_name}` : ""}
                    </p>
                    {r.question && (
                      <p className="mt-1 font-quote text-[1rem] leading-snug text-ink-700">
                        «{r.question}»
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <dt className="w-24 shrink-0 text-[0.75rem] tracking-wide text-ink-400">
        {label}
      </dt>
      <dd className="font-serif text-[1rem] text-ink-800">{value}</dd>
    </div>
  );
}
