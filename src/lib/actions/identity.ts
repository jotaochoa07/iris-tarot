"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";

/**
 * Identidad de quien lee.
 *
 * IRIS se dirige a la persona por su nombre, así que el nombre es un dato del
 * producto, no un adorno de perfil. Mientras no lo diga, IRIS no lo inventa:
 * "Yo" es el marcador de posición con el que nace el perfil propietario y no
 * cuenta como nombre.
 */

const PLACEHOLDER = "yo";

export interface OwnerIdentity {
  name: string | null;
  onboarded: boolean;
}

export async function getOwnerIdentity(): Promise<OwnerIdentity> {
  const { supabase, user } = await requireSession();
  const { data } = await supabase
    .from("persons")
    .select("display_name, onboarded_at")
    .eq("user_id", user.id)
    .eq("type", "owner")
    .maybeSingle();

  const name = data?.display_name?.trim() ?? "";
  const usable = name && name.toLowerCase() !== PLACEHOLDER ? name : null;

  return { name: usable, onboarded: Boolean(data?.onboarded_at) && Boolean(usable) };
}

export async function saveOwnerName(formData: FormData) {
  const raw = String(formData.get("name") ?? "").trim();
  // Un nombre, no una biografía. Cortamos por si acaso.
  const name = raw.slice(0, 40);

  if (!name) redirect("/bienvenida?error=vacio");

  const { supabase, user } = await requireSession();

  const { data: existing } = await supabase
    .from("persons")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", "owner")
    .maybeSingle();

  const patch = {
    display_name: name,
    onboarded_at: new Date().toISOString(),
  };

  const { error } = existing
    ? await supabase.from("persons").update(patch).eq("id", existing.id)
    : await supabase.from("persons").insert({
        user_id: user.id,
        type: "owner" as const,
        is_recurring: true,
        ...patch,
      });

  if (error) redirect("/bienvenida?error=guardado");

  revalidatePath("/", "layout");
  redirect("/");
}
