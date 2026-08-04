import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReadingView } from "./ReadingView";
import type { Reading } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TiradaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("readings")
    .select("*, persons(display_name, type)")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const person = Array.isArray(data.persons) ? data.persons[0] : data.persons;

  const reading = {
    ...data,
    person_type: person?.type ?? "owner",
    person_display_name: person?.display_name ?? "Yo",
  } as unknown as Reading;

  return <ReadingView reading={reading} />;
}
