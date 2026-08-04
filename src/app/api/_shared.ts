import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { IrisConfigError, IrisModelError } from "@/lib/iris/anthropic";
import type { SpreadInput } from "@/lib/iris/engine";

export const spreadInputSchema = z.object({
  cards: z
    .array(
      z.object({
        slug: z.string(),
        order: z.number().int().min(1),
        orientation: z.enum(["upright", "reversed"]).default("upright"),
        confidence: z.number().nullable().default(null),
        alternative_slug: z.string().nullable().default(null),
        confirmed_by_user: z.boolean().default(true),
      }),
    )
    .min(1)
    .max(12),
  question: z.string().max(600).nullable().default(null),
  spreadType: z
    .enum([
      "open",
      "past-present-future",
      "situation-obstacle-advice",
      "self-other-relationship",
      "custom",
    ])
    .default("open"),
  positions: z
    .array(z.object({ order: z.number().int(), label: z.string() }))
    .default([]),
  personLabel: z.string().max(80).default("Mi tirada"),
  isGuest: z.boolean().default(false),
});

export function toSpreadInput(
  parsed: z.infer<typeof spreadInputSchema>,
): SpreadInput {
  return parsed as SpreadInput;
}

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return user;
}

export function handleError(err: unknown) {
  if (err instanceof IrisConfigError) {
    return NextResponse.json(
      { error: err.message, kind: "config" },
      { status: 503 },
    );
  }
  if (err instanceof IrisModelError) {
    return NextResponse.json(
      { error: err.message, kind: "model" },
      { status: 502 },
    );
  }
  const message =
    err instanceof Error ? err.message : "Error inesperado en el servidor.";
  return NextResponse.json({ error: message, kind: "unknown" }, { status: 500 });
}

export const unauthorized = () =>
  NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
