import type { DrawnCard, SourceRef } from "@/lib/types";
import { requireCard } from "./cards";
import { SUITS } from "./suits";
import { DEGREES } from "./degrees";
import { MAJORS_BY_SLUG } from "./majors";
import { createClient } from "@/lib/supabase/server";

/**
 * Recuperación de conocimiento.
 *
 * CAPA 1 — base estructurada (este archivo). Determinista, siempre disponible,
 * redacción original, atribución de escuela explícita.
 *
 * CAPA 2 — corpus privado. Búsqueda de texto completo en español sobre los
 * libros que el propietario ha cargado en su instalación. Devuelve pasajes con
 * el capítulo real del libro, tomado de su índice. Si un fragmento no tiene
 * localizador fiable, viaja con locator null y la interfaz lo dice.
 *
 * El motor nunca mezcla ambas capas sin marcar el origen: cada dato lleva su
 * `SourceRef.via`, y el prompt obliga al modelo a conservarlo.
 */

export interface RetrievedContext {
  cards: CardContext[];
  degrees: string[];
  suits: string[];
  corpus_passages: CorpusPassage[];
  corpus_enabled: boolean;
}

export interface CardContext {
  slug: string;
  name: string;
  arcana: "major" | "minor";
  suit_label: string | null;
  suit_territory: string | null;
  suit_sign_construction: string | null;
  degree_label: string | null;
  degree_gesture: string | null;
  degree_observe: string | null;
  visual: string;
  major_axis: string | null;
  major_observe: string | null;
  source: SourceRef;
}

export interface CorpusPassage {
  text: string;
  source: SourceRef;
  score: number;
}

const KB_SOURCE = (note: string): SourceRef => ({
  school: "jodorowsky-costa",
  author: "Alejandro Jodorowsky y Marianne Costa",
  work: "La vía del Tarot",
  locator: null,
  via: "structured-kb",
  note,
});

const STRUCTURAL_SOURCE: SourceRef = {
  school: "iris",
  author: "IRIS",
  work: null,
  locator: null,
  via: "structured-kb",
  note: "Propiedad estructural verificable de la baraja. No requiere atribución de autor.",
};

export function corpusEnabled(): boolean {
  return process.env.IRIS_CORPUS_RAG_ENABLED === "true";
}

export async function retrieveForSpread(
  cards: DrawnCard[],
  options: { schools?: string[]; perCard?: number } = {},
): Promise<RetrievedContext> {
  const ordered = [...cards].sort((a, b) => a.order - b.order);

  const cardContexts: CardContext[] = ordered.map((d) => {
    const c = requireCard(d.slug);
    const suit = c.suit ? SUITS[c.suit] : null;
    const degree = c.degree ? DEGREES[c.degree] : null;
    const major = c.arcana === "major" ? MAJORS_BY_SLUG[c.slug] : null;

    return {
      slug: c.slug,
      name: c.name,
      arcana: c.arcana,
      suit_label: suit?.label ?? null,
      suit_territory: suit?.territory ?? null,
      suit_sign_construction: suit?.sign_construction ?? null,
      degree_label: degree?.label ?? null,
      degree_gesture: degree?.gesture ?? null,
      degree_observe: degree?.observe ?? null,
      visual: c.visual,
      major_axis: major?.axis ?? null,
      major_observe: major?.observe ?? null,
      source:
        c.arcana === "major" || suit || degree
          ? KB_SOURCE(
              "Sistema atribuido a Jodorowsky/Costa. Redacción original de IRIS; localizador no verificado.",
            )
          : STRUCTURAL_SOURCE,
    };
  });

  const degreeSet = new Set<number>();
  const suitSet = new Set<string>();
  for (const d of ordered) {
    const c = requireCard(d.slug);
    if (c.degree) degreeSet.add(c.degree);
    if (c.suit) suitSet.add(c.suit);
  }

  return {
    cards: cardContexts,
    degrees: [...degreeSet]
      .sort((a, b) => a - b)
      .map((v) => `${DEGREES[v].label} (${DEGREES[v].roman}) — ${DEGREES[v].gesture}`),
    suits: [...suitSet].map((s) => {
      const e = SUITS[s as keyof typeof SUITS];
      return `${e.label} — ${e.territory} Cuando domina: ${e.when_dominant} Cuando falta: ${e.when_absent}`;
    }),
    corpus_passages: await retrieveFromCorpus(ordered, options),
    corpus_enabled: corpusEnabled(),
  };
}

/* ---------------------------------------------------------------------------
 * Capa 2
 * ------------------------------------------------------------------------- */

const AUTHOR_BY_SCHOOL: Record<string, string> = {
  "jodorowsky-costa": "Alejandro Jodorowsky y Marianne Costa",
  nichols: "Sallie Nichols",
  jung: "Carl G. Jung",
  "ben-dov": "Yoav Ben-Dov",
  marteau: "Paul Marteau",
  pollack: "Rachel Pollack",
};

/**
 * Una consulta por carta. Cada una busca el nombre exacto, el grado en letra y
 * el palo, unidos por OR para que el índice pondere lo que más coincide.
 */
function queriesFor(cards: DrawnCard[]): string[] {
  const out: string[] = [];
  for (const d of cards) {
    const c = requireCard(d.slug);
    const terms = [`"${c.name}"`];
    if (c.degree && DEGREES[c.degree]) terms.push(DEGREES[c.degree].label);
    if (c.suit) terms.push(SUITS[c.suit].label);
    if (c.arcana === "major") {
      const m = MAJORS_BY_SLUG[c.slug];
      if (m?.name_fr && m.name_fr !== "—") terms.push(`"${m.name_fr}"`);
    }
    out.push(terms.join(" OR "));
  }
  return out;
}

async function retrieveFromCorpus(
  cards: DrawnCard[],
  { schools, perCard = 2 }: { schools?: string[]; perCard?: number },
): Promise<CorpusPassage[]> {
  if (!corpusEnabled() || cards.length === 0) return [];

  try {
    const supabase = await createClient();
    const queries = queriesFor(cards);

    const results = await Promise.all(
      queries.map((q) =>
        supabase.rpc("search_corpus", {
          q,
          schools: schools ?? null,
          k: perCard,
        }),
      ),
    );

    const seen = new Set<string>();
    const passages: CorpusPassage[] = [];

    for (const { data, error } of results) {
      if (error) {
        console.error("[IRIS] búsqueda en corpus:", error.message);
        continue;
      }
      for (const row of data ?? []) {
        const key = row.content.slice(0, 120);
        if (seen.has(key)) continue;
        seen.add(key);
        passages.push({
          text: row.content,
          score: row.rank ?? 0,
          source: {
            school: row.school,
            author: row.authors ?? AUTHOR_BY_SCHOOL[row.school] ?? "—",
            work: row.title,
            locator: row.locator,
            via: "corpus-retrieval",
            note: null,
          },
        });
      }
    }

    passages.sort((a, b) => b.score - a.score);
    const top = passages.slice(0, 10);
    console.log(`[IRIS] corpus: ${top.length} pasajes recuperados`);
    return top;
  } catch (e) {
    // Un fallo del corpus nunca debe impedir una lectura: se cae a la capa 1.
    console.error("[IRIS] corpus no disponible:", e);
    return [];
  }
}
