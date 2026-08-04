import type { DrawnCard, SourceRef } from "@/lib/types";
import { requireCard } from "./cards";
import { SUITS } from "./suits";
import { DEGREES } from "./degrees";
import { MAJORS_BY_SLUG } from "./majors";

/**
 * Recuperación de conocimiento.
 *
 * CAPA 1 — base estructurada (este archivo). Determinista, siempre disponible,
 * redacción original, atribución de escuela explícita.
 *
 * CAPA 2 — corpus privado (opcional, `IRIS_CORPUS_RAG_ENABLED`). Recuperación
 * semántica sobre los PDFs que el propietario haya cargado en su instalación.
 * Devuelve fragmentos con localizador verificable. Nunca se distribuye.
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

export function retrieveForSpread(cards: DrawnCard[]): RetrievedContext {
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
      source: c.arcana === "major" || suit || degree
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
    corpus_passages: retrieveFromCorpus(),
    corpus_enabled: corpusEnabled(),
  };
}

export function corpusEnabled(): boolean {
  return process.env.IRIS_CORPUS_RAG_ENABLED === "true";
}

/**
 * CAPA 2 — punto de extensión.
 *
 * Contrato previsto para la implementación real:
 *   1. Ingesta local: PDF → texto → chunks de ~800 tokens con solape.
 *   2. Embeddings → tabla `corpus_chunks` en Supabase con pgvector.
 *   3. Consulta: embedding de la tirada + filtro por `school`.
 *   4. Devolver pasajes con `locator` REAL. Si no hay localizador fiable, se
 *      deja en null y la interfaz muestra «página no disponible».
 *
 * Mientras esté deshabilitado devuelve vacío, y el motor trabaja solo con la
 * capa 1. Nunca simula pasajes.
 */
function retrieveFromCorpus(): CorpusPassage[] {
  if (!corpusEnabled()) return [];
  return [];
}
