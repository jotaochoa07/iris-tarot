import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/entrar", "/auth"];

/**
 * Lista blanca de correos.
 *
 * Cada tirada dispara dos llamadas a la API que paga el dueño de la clave, y
 * Supabase deja registrarse a cualquiera con un correo. Sin esto, quien
 * descubra la URL puede vaciar la cuenta en una tarde.
 *
 * Vacía o sin definir, no filtra nada: en local todo sigue igual. En Vercel se
 * pone `IRIS_ALLOWED_EMAILS` con los correos separados por comas.
 */
const ALLOWED = (process.env.IRIS_ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAllowed(email: string | undefined): boolean {
  if (ALLOWED.length === 0) return true;
  return !!email && ALLOWED.includes(email.toLowerCase());
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Sesión válida pero fuera de la lista: se cierra y se dice por qué.
  if (user && !isPublic && !isAllowed(user.email)) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = "?error=sin-acceso";
    return NextResponse.redirect(url);
  }

  return response;
}
