/**
 * IRIS — modelo de datos portable.
 *
 * Estos tipos son la fuente de verdad de la aplicación y del fichero de
 * exportación. Están definidos con independencia de Supabase, de Next.js y de
 * cualquier interfaz, de modo que el historial pueda migrarse íntegro a otra
 * plataforma sin transformaciones.
 *
 * Regla no negociable: nada importante vive solo en el estado de la sesión.
 */

export const SCHEMA_VERSION = 1;

/* ---------------------------------------------------------------------------
 * Personas
 * ------------------------------------------------------------------------- */

export type PersonType = "owner" | "guest";

export interface Person {
  id: string;
  type: PersonType;
  display_name: string;
  /** Un invitado ocasional no se guarda como perfil; uno recurrente sí. */
  is_recurring: boolean;
  created_at: string;
}

/* ---------------------------------------------------------------------------
 * Cartas
 * ------------------------------------------------------------------------- */

export type Arcana = "major" | "minor";
export type Suit = "bastos" | "copas" | "espadas" | "oros";
export type Orientation = "upright" | "reversed";

/** Identificador estable de carta. Ej.: "espadas-01", "arcano-09". */
export type CardSlug = string;

export interface DrawnCard {
  slug: CardSlug;
  /** Posición en la secuencia, empezando en 1. */
  order: number;
  orientation: Orientation;
  /** Confianza del reconocimiento visual, 0–1. null si se eligió a mano. */
  confidence: number | null;
  /** Alternativa cuando el reconocimiento duda entre dos cartas. */
  alternative_slug: CardSlug | null;
  /** true si el usuario corrigió o eligió la carta manualmente. */
  confirmed_by_user: boolean;
}

/* ---------------------------------------------------------------------------
 * Estructura de la tirada
 * ------------------------------------------------------------------------- */

export type SpreadType =
  | "open" // sin posiciones predefinidas
  | "past-present-future"
  | "situation-obstacle-advice"
  | "self-other-relationship"
  | "custom";

export interface SpreadPosition {
  order: number;
  label: string;
}

/* ---------------------------------------------------------------------------
 * Procedencia del conocimiento
 *
 * El principio central del producto: una afirmación o proviene del corpus, o es
 * una inferencia estructural, o es una interpretación contextual. Nunca se
 * mezclan silenciosamente.
 * ------------------------------------------------------------------------- */

export type Provenance =
  /** 📖 Atribuible a una fuente identificada. */
  | "source"
  /** 🧭 Deducción a partir de la estructura de la tirada (números, palos, orden). */
  | "structural"
  /** 💭 Lectura contextual propuesta por IRIS. */
  | "interpretation"
  /** 🧠 Lente psicológica. Nunca se atribuye a Jung un significado de carta. */
  | "archetypal";

export type SchoolId =
  | "jodorowsky-costa"
  | "ben-dov"
  | "marteau"
  | "pollack"
  | "jung"
  | "iris";

export interface SourceRef {
  school: SchoolId;
  author: string;
  work: string | null;
  /** Capítulo o sección solo si existe metadata fiable. Nunca inventar páginas. */
  locator: string | null;
  /** Cómo se obtuvo: base estructurada propia o recuperación sobre el corpus. */
  via: "structured-kb" | "corpus-retrieval";
  note: string | null;
}

export interface Claim {
  text: string;
  provenance: Provenance;
  sources: SourceRef[];
}

/* ---------------------------------------------------------------------------
 * Análisis
 * ------------------------------------------------------------------------- */

/** Lo que IRIS ve antes de interpretar. Se calcula en código, no con IA. */
export interface StructuralReadout {
  suits_present: Suit[];
  suits_absent: Suit[];
  dominant_suit: Suit | null;
  major_count: number;
  minor_count: number;
  court_count: number;
  numbers: number[];
  repeated_numbers: number[];
  numeric_direction: "ascending" | "descending" | "mixed" | "flat" | "n/a";
  has_reversed: boolean;
  notes: string[];
}

export interface MovementStep {
  card_slug: CardSlug;
  concept: string;
}

/** 🔮 Modo Reflexionar. */
export interface TarotAnalysis {
  observes: Claim[]; // IRIS OBSERVA — 2–4 párrafos
  movement: MovementStep[]; // EL MOVIMIENTO
  movement_rationale: Claim; // por qué ese movimiento
  interprets: Claim[]; // IRIS INTERPRETA, aplicado a la pregunta
  what_to_watch: string[]; // QUÉ OBSERVAR — 1 a 3, nunca predicciones
  uncertainty: string | null; // lo que IRIS no puede afirmar
}

export interface LookAtThis {
  title: string;
  body: string;
  /** Pregunta abierta que se le devuelve al lector. */
  prompt: string | null;
}

export interface CardLesson {
  card_slug: CardSlug;
  family: string;
  suit_territory: Claim | null;
  degree: Claim | null;
  visual_composition: Claim;
  in_this_spread: Claim;
  relation_to_next: Claim | null;
}

/** 🎓 Modo Aprender. */
export interface LearnAnalysis {
  /** La única idea que esta tirada debe dejar. El criterio pedagógico del brief. */
  key_lesson: {
    title: string;
    body: string;
    concept_tags: string[];
  };
  cards: CardLesson[];
  look_at_this: LookAtThis[];
}

/** 🧠 Capa junguiana, opcional y separada del canon del Tarot. */
export interface ArchetypalAnalysis {
  concepts: string[];
  body: Claim[];
  disclaimer: string;
}

/* ---------------------------------------------------------------------------
 * Tirada
 * ------------------------------------------------------------------------- */

export interface Reading {
  id: string;
  schema_version: number;

  person_id: string;
  person_type: PersonType;
  person_display_name: string;

  created_at: string;

  question: string | null;
  spread_type: SpreadType;
  positions: SpreadPosition[];

  cards: DrawnCard[];
  card_order: CardSlug[];
  orientation: Record<CardSlug, Orientation>;

  /** Ruta en Supabase Storage. La foto es del usuario, no se redistribuye. */
  image_reference: string | null;

  structural_readout: StructuralReadout | null;
  tarot_analysis: TarotAnalysis | null;
  learn_analysis: LearnAnalysis | null;
  archetypal_analysis: ArchetypalAnalysis | null;
  reflection_question: string | null;

  user_notes: string | null;

  outcome: string | null;
  outcome_added_at: string | null;

  learnings: string[];
  sources: SourceRef[];
}

/* ---------------------------------------------------------------------------
 * Progreso
 *
 * Dos memorias distintas, nunca fusionadas:
 *   - PERSONAL PATTERNS: solo tiradas propias.
 *   - TAROT LEARNING PROGRESS: todo lo que el propietario ha trabajado,
 *     incluidas las tiradas hechas para invitados.
 * ------------------------------------------------------------------------- */

export interface CardProgress {
  card_slug: CardSlug;
  /** Apariciones en tiradas del propietario. Alimenta patrones personales. */
  personal_count: number;
  /** Apariciones en cualquier tirada leída por el propietario. Alimenta estudio. */
  studied_count: number;
  first_studied_at: string | null;
  last_studied_at: string | null;
}

export interface ExportBundle {
  schema_version: number;
  exported_at: string;
  app: "iris";
  persons: Person[];
  readings: Reading[];
  card_progress: CardProgress[];
}
