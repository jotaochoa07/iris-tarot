import { z } from "zod";

const provenance = z.enum([
  "source",
  "structural",
  "interpretation",
  "archetypal",
]);

const sourceRef = z.object({
  school: z.enum([
    "jodorowsky-costa",
    "ben-dov",
    "marteau",
    "pollack",
    "nichols",
    "jung",
    "iris",
  ]),
  author: z.string(),
  work: z.string().nullable(),
  locator: z.string().nullable(),
  via: z.enum(["structured-kb", "corpus-retrieval"]),
  note: z.string().nullable(),
});

export const claimSchema = z.object({
  text: z.string().min(1),
  provenance,
  sources: z.array(sourceRef).default([]),
});

/* --- Detección por visión -------------------------------------------------- */

export const detectionSchema = z.object({
  cards: z
    .array(
      z.object({
        order: z.number().int().min(1).default(1),
        slug: z.string(),
        orientation: z.enum(["upright", "reversed"]).default("upright"),
        confidence: z.number().min(0).max(1).default(0.5),
        alternative_slug: z.string().nullish().default(null),
        reasoning: z.string().nullish().default(""),
      }),
    )
    .max(12)
    .default([]),
  layout_note: z.string().nullish().default(null),
  overall_note: z.string().nullish().default(null),
});

export type DetectionResult = z.infer<typeof detectionSchema>;

/* --- Modo Reflexionar ------------------------------------------------------ */

export const reflectSchema = z.object({
  observes: z.array(claimSchema).min(1).max(4),
  movement: z
    .array(
      z.object({
        card_slug: z.string(),
        concept: z.string().min(1).max(40),
      }),
    )
    .min(1),
  movement_rationale: claimSchema,
  interprets: z.array(claimSchema).min(1).max(4),
  what_to_watch: z.array(z.string()).min(1).max(3),
  uncertainty: z.string().nullable(),
  reflection_question: z.string().min(1),
});

export type ReflectResult = z.infer<typeof reflectSchema>;

/* --- Modo Aprender --------------------------------------------------------- */

export const learnSchema = z.object({
  key_lesson: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
    concept_tags: z.array(z.string()).max(4).default([]),
  }),
  cards: z.array(
    z.object({
      card_slug: z.string(),
      family: z.string(),
      suit_territory: claimSchema.nullable(),
      degree: claimSchema.nullable(),
      visual_composition: claimSchema,
      in_this_spread: claimSchema,
      relation_to_next: claimSchema.nullable(),
    }),
  ),
  look_at_this: z
    .array(
      z.object({
        title: z.string(),
        body: z.string(),
        prompt: z.string().nullable(),
      }),
    )
    .max(3)
    .default([]),
});

export type LearnResult = z.infer<typeof learnSchema>;

/* --- Capa junguiana -------------------------------------------------------- */

export const archetypesSchema = z.object({
  applicable: z.boolean(),
  concepts: z.array(z.string()).max(4).default([]),
  body: z.array(claimSchema).max(3).default([]),
  disclaimer: z.string(),
});

export type ArchetypesResult = z.infer<typeof archetypesSchema>;
