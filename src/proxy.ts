import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Refresco de sesión y protección de rutas.
 *
 * En Next 16 este archivo se llama `proxy.ts` y debe vivir junto a `app/`.
 * Con directorio `src/`, eso significa `src/proxy.ts` — no la raíz del
 * proyecto, donde Next no lo carga.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|cards/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
