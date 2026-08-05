"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { buildReadout } from "@/lib/knowledge/readout";
import type {
  ArchetypalAnalysis,
  DrawnCard,
  LearnAnalysis,
  SpreadPosition,
  SpreadType,
  TarotAnalysis,
} from "@/lib/types";

async function ctx() {
  return requireSession();
}

export async function getOwnerPerson() {
  const { supabase, user } = await ctx();
  const { data } = await supabase
    .from("persons")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", "owner")
    .maybeSingle();
  return data;
}

/**
 * Resuelve la persona de una tirada.
 * - Para mí → el perfil propietario.
 * - Para otra persona ocasional → se crea un registro no recurrente.
 * - Para invitado recurrente ya existente → se reutiliza.
 */
export async function resolvePerson(params: {
  forGuest: boolean;
  guestName?: string;
  guestPersonId?: string;
  saveAsRecurring?: boolean;
}) {
  const { supabase, user } = await ctx();

  if (!params.forGuest) {
    const owner = await getOwnerPerson();
    if (owner) return owner;
    const { data, error } = await supabase
      .from("persons")
      .insert({ user_id: user.id, type: "owner", display_name: "Yo", is_recurring: true })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (params.guestPersonId) {
    const { data } = await supabase
      .from("persons")
      .select("*")
      .eq("id", params.guestPersonId)
      .maybeSingle();
    if (data) return data;
  }

  const { data, error } = await supabase
    .from("persons")
    .insert({
      user_id: user.id,
      type: "guest",
      display_name: params.guestName?.trim() || "Invitado",
      is_recurring: Boolean(params.saveAsRecurring),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function listRecurringGuests() {
  const { supabase, user } = await ctx();
  const { data } = await supabase
    .from("persons")
    .select("id, display_name, created_at")
    .eq("user_id", user.id)
    .eq("type", "guest")
    .eq("is_recurring", true)
    .order("display_name");
  return data ?? [];
}

export interface SaveReadingInput {
  personId: string;
  question: string | null;
  spreadType: SpreadType;
  positions: SpreadPosition[];
  cards: DrawnCard[];
  imageReference: string | null;
  tarotAnalysis: TarotAnalysis;
  reflectionQuestion: string;
  /** true si las cartas salieron de un reparto aleatorio, no de una baraja. */
  simulated?: boolean;
}

export async function saveReading(input: SaveReadingInput) {
  const { supabase, user } = await ctx();

  const ordered = [...input.cards].sort((a, b) => a.order - b.order);
  const orientation: Record<string, string> = {};
  for (const c of ordered) orientation[c.slug] = c.orientation;

  const sources = [
    ...input.tarotAnalysis.observes,
    ...input.tarotAnalysis.interprets,
    input.tarotAnalysis.movement_rationale,
  ].flatMap((c) => c.sources);

  const { data, error } = await supabase
    .from("readings")
    .insert({
      user_id: user.id,
      person_id: input.personId,
      question: input.question,
      spread_type: input.spreadType,
      positions: input.positions,
      cards: ordered,
      card_order: ordered.map((c) => c.slug),
      orientation,
      image_reference: input.imageReference,
      simulated: input.simulated ?? false,
      structural_readout: buildReadout(ordered),
      tarot_analysis: input.tarotAnalysis,
      reflection_question: input.reflectionQuestion,
      sources,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/diario");
  return data.id as string;
}

export async function attachLearnAnalysis(
  readingId: string,
  analysis: LearnAnalysis,
) {
  const { supabase } = await ctx();
  const { error } = await supabase
    .from("readings")
    .update({
      learn_analysis: analysis,
      learnings: [analysis.key_lesson.title, ...analysis.key_lesson.concept_tags],
    })
    .eq("id", readingId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tirada/${readingId}`);
}

export async function attachArchetypalAnalysis(
  readingId: string,
  analysis: ArchetypalAnalysis,
) {
  const { supabase } = await ctx();
  const { error } = await supabase
    .from("readings")
    .update({ archetypal_analysis: analysis })
    .eq("id", readingId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tirada/${readingId}`);
}

export async function saveNotes(readingId: string, notes: string) {
  const { supabase } = await ctx();
  const { error } = await supabase
    .from("readings")
    .update({ user_notes: notes })
    .eq("id", readingId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tirada/${readingId}`);
}

/** ¿QUÉ OCURRIÓ? — cierra el ciclo tirada → experiencia → revisión. */
export async function saveOutcome(readingId: string, outcome: string) {
  const { supabase } = await ctx();
  const { error } = await supabase
    .from("readings")
    .update({ outcome, outcome_added_at: new Date().toISOString() })
    .eq("id", readingId);
  if (error) throw new Error(error.message);
  revalidatePath(`/tirada/${readingId}`);
  revalidatePath("/diario");
}
