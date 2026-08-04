import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Dos formas de entrar, ambas legítimas:
 *
 *  - `code`: el enlace mágico que llega por correo (flujo PKCE). Requiere que
 *    la sesión se haya iniciado en ESTE navegador, porque el verificador vive
 *    en una cookie.
 *  - `token_hash` + `type`: un enlace emitido por el servidor. No necesita
 *    verificador previo, así que sirve cuando el correo no puede salir —por
 *    ejemplo con el límite de envíos de Supabase agotado— y es lo que usa
 *    `scripts/enlace.mjs`.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/entrar?error=enlace-no-valido`);
}
