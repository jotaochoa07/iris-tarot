import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CardFace } from "@/components/CardFace";
import { Display, Rule, Screen, SectionTitle } from "@/components/ui";
import { CARDS } from "@/lib/knowledge/cards";
import { SUITS, SUIT_ORDER } from "@/lib/knowledge/suits";

export const dynamic = "force-dynamic";

export default async function BibliotecaPage() {
  const supabase = await createClient();
  const { data: progress } = await supabase
    .from("card_progress")
    .select("card_slug, studied_count, personal_count");

  const studied = new Map(
    (progress ?? []).map((p) => [p.card_slug, p.studied_count as number]),
  );

  const majors = CARDS.filter((c) => c.arcana === "major");

  return (
    <Screen>
      <header className="mb-9 flex items-center justify-between">
        <Link href="/" className="eyebrow hover:text-ink-700">
          ← IRIS
        </Link>
        <span className="text-[0.6875rem] tracking-wide text-ink-400">
          {studied.size} de 78 estudiadas
        </span>
      </header>

      <Display className="text-[2rem] leading-tight">Biblioteca</Display>
      <p className="mt-4 max-w-[38ch] text-[0.9375rem] leading-relaxed text-ink-500">
        El Tarot es un lenguaje, no un diccionario. Aquí no hay significados
        definitivos: hay estructura, composición y preguntas para mirar.
      </p>

      <Rule />

      <SectionTitle>Arcanos Mayores</SectionTitle>
      <Grid slugs={majors.map((c) => c.slug)} studied={studied} />

      {SUIT_ORDER.map((suit) => (
        <div key={suit}>
          <Rule />
          <SectionTitle>{SUITS[suit].label}</SectionTitle>
          <Grid
            slugs={CARDS.filter((c) => c.suit === suit).map((c) => c.slug)}
            studied={studied}
          />
        </div>
      ))}
    </Screen>
  );
}

function Grid({
  slugs,
  studied,
}: {
  slugs: string[];
  studied: Map<string, number>;
}) {
  return (
    <div className="grid grid-cols-4 gap-x-3 gap-y-5">
      {slugs.map((slug) => {
        const seen = studied.get(slug) ?? 0;
        return (
          <Link key={slug} href={`/biblioteca/${slug}`} className="block">
            <CardFace slug={slug} size="sm" className="w-full" dimmed={seen === 0} />
            <p className="mt-1.5 text-[0.5625rem] leading-tight text-ink-400">
              {seen > 0 ? `${seen}×` : "sin estudiar"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
