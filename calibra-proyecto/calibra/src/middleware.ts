import { createServerClient } from "@supabase/ssr";
import { hasLocale } from "next-intl";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { rutaBloqueadaParaInvitado } from "@/lib/auth/rutasInvitado";

// Mismo nombre de header que usa next-intl internamente (ver
// HEADER_LOCALE_NAME en su propio middleware) — con localePrefix "always"
// el locale ya vive en la URL, pero Server Components anidados que no
// reciben el param [locale] en su propia firma solo lo pueden leer vía
// este header en el request que sigue río abajo.
const HEADER_LOCALE = "X-NEXT-INTL-LOCALE";
const COOKIE_LOCALE = "NEXT_LOCALE";
const UN_ANIO_SEGUNDOS = 60 * 60 * 24 * 365;

const intlMiddleware = createIntlMiddleware(routing);

function localeDePathname(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) return locale;
  }
  return routing.defaultLocale;
}

function sinPrefijoLocale(pathname: string): string {
  const locale = localeDePathname(pathname);
  const resto = pathname.slice(locale.length + 1);
  return resto === "" ? "/" : resto;
}

// Refresca la sesión de auth en cada request, resuelve el idioma (next-intl
// — detección por cookie/Accept-Language, la cookie manual siempre gana),
// y — hallazgo de auditoría: un invitado real podía ver contenido de
// /rankeds, /social, /aprender, etc. brevemente porque el guard vivía SOLO
// a nivel de página (bloquearInvitado en guard.ts, llamado a mano en cada
// page.tsx — cualquier sección nueva que se agregue sin acordarse de
// llamarlo queda abierta, y aun llamándolo el redirect podía perder la
// carrera contra el streaming de RSC). Este chequeo corre ANTES de que
// cualquier página arranque a renderizar — ninguna sección bloqueada puede
// filtrar contenido real, sin importar qué haga la página en sí.
export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  // next-intl decidió redirigir (agregar/corregir el prefijo de idioma, o
  // pasar de un idioma a otro) — dejamos pasar ese redirect tal cual, sin
  // tocar la sesión acá; el pedido siguiente vuelve a entrar a este
  // middleware ya con el prefijo puesto, y ahí sí corre el resto.
  if (intlResponse.headers.get("location")) {
    return intlResponse;
  }

  const locale = localeDePathname(request.nextUrl.pathname);
  const headers = new Headers(request.headers);
  headers.set(HEADER_LOCALE, locale);

  let response = NextResponse.next({ request: { headers } });
  intlResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));

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
          response = NextResponse.next({ request: { headers } });
          intlResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
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

  // Fase 4 (idioma): la cookie NEXT_LOCALE es por navegador — un usuario
  // real que ya eligió idioma en otro dispositivo no tiene esa cookie acá
  // todavía. Solo en esa primera visita (sin cookie) vale la pena pagar
  // una consulta extra al perfil; en cualquier visita siguiente la cookie
  // ya alcanza y esto ni se ejecuta.
  if (user && !user.is_anonymous && !request.cookies.has(COOKIE_LOCALE)) {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("idioma")
      .eq("id", user.id)
      .maybeSingle();
    const idiomaPerfil = perfil?.idioma;

    if (idiomaPerfil && idiomaPerfil !== locale && hasLocale(routing.locales, idiomaPerfil)) {
      const resto = sinPrefijoLocale(request.nextUrl.pathname);
      const url = request.nextUrl.clone();
      url.pathname = resto === "/" ? `/${idiomaPerfil}` : `/${idiomaPerfil}${resto}`;
      const redirectResponse = NextResponse.redirect(url);
      redirectResponse.cookies.set(COOKIE_LOCALE, idiomaPerfil, { path: "/", maxAge: UN_ANIO_SEGUNDOS });
      return redirectResponse;
    }

    // Coincide con lo ya detectado (o no hay preferencia guardada) —
    // igual fijamos la cookie para no repetir esta consulta en cada
    // request de este mismo dispositivo.
    response.cookies.set(COOKIE_LOCALE, locale, { path: "/", maxAge: UN_ANIO_SEGUNDOS });
  }

  if (user?.is_anonymous) {
    const etiqueta = rutaBloqueadaParaInvitado(sinPrefijoLocale(request.nextUrl.pathname));
    if (etiqueta) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/invitado-bloqueado`;
      url.search = `?seccion=${encodeURIComponent(etiqueta)}`;
      const redirectResponse = NextResponse.redirect(url);
      intlResponse.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  // /api/* queda afuera a propósito: cada route handler ya llama
  // supabase.auth.getUser() por su cuenta para validar la sesión, así que
  // pasar también por acá duplicaría esa llamada de red en cada request —
  // y durante una partida eso pasa ~10 veces (una por problema).
  // /auth/callback también queda afuera: vive fuera de [locale] a
  // propósito, es la URL de redirect fija que Supabase tiene configurada
  // en su dashboard — no puede llevar prefijo de idioma ni pasar por la
  // lógica de next-intl.
  // /data/* también queda afuera (bug real, 2026-08-24): son assets
  // estáticos públicos servidos directo desde public/data/ con paths
  // absolutos sin prefijo de idioma (GeografiaMapa.tsx pide
  // "/data/countries-110m.json" a mano) — sin esta exclusión, next-intl
  // los redirigía a "/es/data/..." (que no existe) antes de que
  // pudieran servirse, rompiendo cualquier fetch de datos estáticos.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|auth/callback|data/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
