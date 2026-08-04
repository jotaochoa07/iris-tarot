import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SCHEMA_VERSION } from "@/lib/types";
import { requireUser, unauthorized } from "../_shared";

export const runtime = "nodejs";

/**
 * Exportación del Diario.
 *
 * Requisito no negociable del producto: los datos son del usuario y no dependen
 * de esta aplicación. El fichero conserva person_id, person_type y display_name
 * para que la separación propietario/invitado sobreviva a cualquier migración.
 */
export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();

  const supabase = await createClient();

  const [{ data: persons }, { data: readings }, { data: progress }] =
    await Promise.all([
      supabase.from("persons").select("*").order("created_at"),
      supabase.from("readings").select("*").order("created_at"),
      supabase.from("card_progress").select("*").order("card_slug"),
    ]);

  const personById = new Map((persons ?? []).map((p) => [p.id, p]));

  const bundle = {
    schema_version: SCHEMA_VERSION,
    exported_at: new Date().toISOString(),
    app: "iris" as const,
    persons: (persons ?? []).map((p) => ({
      id: p.id,
      type: p.type,
      display_name: p.display_name,
      is_recurring: p.is_recurring,
      created_at: p.created_at,
    })),
    readings: (readings ?? []).map((r) => {
      const person = personById.get(r.person_id);
      return {
        id: r.id,
        schema_version: r.schema_version,
        person_id: r.person_id,
        person_type: person?.type ?? "owner",
        person_display_name: person?.display_name ?? "—",
        created_at: r.created_at,
        question: r.question,
        spread_type: r.spread_type,
        positions: r.positions,
        cards: r.cards,
        card_order: r.card_order,
        orientation: r.orientation,
        image_reference: r.image_reference,
        structural_readout: r.structural_readout,
        tarot_analysis: r.tarot_analysis,
        learn_analysis: r.learn_analysis,
        archetypal_analysis: r.archetypal_analysis,
        reflection_question: r.reflection_question,
        user_notes: r.user_notes,
        outcome: r.outcome,
        outcome_added_at: r.outcome_added_at,
        learnings: r.learnings,
        sources: r.sources,
      };
    }),
    card_progress: (progress ?? []).map((p) => ({
      card_slug: p.card_slug,
      personal_count: p.personal_count,
      studied_count: p.studied_count,
      first_studied_at: p.first_studied_at,
      last_studied_at: p.last_studied_at,
    })),
  };

  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(bundle, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="iris-diario-${stamp}.json"`,
    },
  });
}
