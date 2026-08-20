import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { rutaBloqueadaParaInvitado } from "@/lib/auth/rutasInvitado";

// Refresca la sesión de auth en cada request, y — hallazgo de auditoría:
// un invitado real podía ver contenido de /rankeds, /social, /aprender,
// etc. brevemente porque el guard vivía SOLO a nivel de página
// (bloquearInvitado en guard.ts, llamado a mano en cada page.tsx —
// cualquier sección nueva que se agregue sin acordarse de llamarlo
// queda abierta, y aun llamándolo el redirect podía perder la carrera
// contra el streaming de RSC). Este chequeo corre ANTES de que
// cualquier página arranque a renderizar — ninguna sección bloqueada
// puede filtrar contenido real, sin importar qué haga la página en sí.
export async function middleware(request: NextRequest) {
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
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.is_anonymous) {
    const etiqueta = rutaBloqueadaParaInvitado(request.nextUrl.pathname);
    if (etiqueta) {
      const url = request.nextUrl.clone();
      url.pathname = "/invitado-bloqueado";
      url.search = `?seccion=${encodeURIComponent(etiqueta)}`;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  // /api/* queda afuera a propósito: cada route handler ya llama
  // supabase.auth.getUser() por su cuenta para validar la sesión, así que
  // pasar también por acá duplicaría esa llamada de red en cada request —
  // y durante una partida eso pasa ~10 veces (una por problema).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
