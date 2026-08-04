import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Guarda de sesión para Server Components y Server Actions.
 *
 * El proxy ya redirige, pero esto es defensa en profundidad: si el proxy no
 * llegara a ejecutarse, la página lleva al acceso en lugar de reventar con un
 * error de servidor.
 */
export async function requireSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  return { supabase, user };
}
