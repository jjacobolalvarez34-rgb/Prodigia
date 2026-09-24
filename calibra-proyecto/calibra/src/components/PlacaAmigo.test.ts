import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Amigo } from "@/app/[locale]/social/useAmigos";
import PlacaAmigo from "./PlacaAmigo";

// next-intl/navigation's createNavigation() internamente importa
// "next/navigation" con un subpath que el resolvedor de módulos de
// Vitest (fuera del bundler real de Next) no logra resolver ("Cannot
// find module 'next/navigation'... Did you mean 'next/navigation.js'?")
// — no es un bug de este componente, es un problema de entorno de
// test. Se mockea acá, local a este archivo (nada de tocar
// vitest.config.ts global), con un <a> real hecho con React.createElement
// — mismo comportamiento observable que import("./PlacaAmigo") necesita
// para renderizar sin excepción.
vi.mock("@/i18n/navigation", async () => {
  const React = await import("react");
  return {
    Link: ({ href, children, ...rest }: Record<string, unknown>) =>
      React.createElement("a", { href, ...rest }, children as React.ReactNode),
    useRouter: () => ({ push: () => {} }),
    usePathname: () => "/",
    redirect: () => {},
    getPathname: () => "/",
  };
});

// Rediseño "placa de amigo" (2026-09-22): render real (no solo tipos)
// con next-intl y los mensajes reales de es.json/en.json, con varias
// combinaciones de datos (con/sin fondo de perfil, con/sin marco de
// mundo, con/sin título activo) — mismo criterio que
// naipia/MemoriaCartas.test.ts, para no repetir el crash de Codia (un
// componente que solo se probó por tipos, nunca se ejercitó el render).

const raiz = path.resolve(__dirname, "../..");
const mensajes = {
  es: JSON.parse(readFileSync(path.join(raiz, "messages", "es.json"), "utf8")),
  en: JSON.parse(readFileSync(path.join(raiz, "messages", "en.json"), "utf8")),
};

function conIntl(locale: "es" | "en", hijo: React.ReactElement): string {
  return renderToStaticMarkup(
    createElement(
      NextIntlClientProvider,
      { locale, timeZone: "UTC", messages: mensajes[locale] } as React.ComponentProps<typeof NextIntlClientProvider>,
      hijo
    )
  );
}

const AMIGO_COMPLETO: Amigo = {
  friend_id: "11111111-1111-1111-1111-111111111111",
  display_name: "Ada Lovelace",
  elo_rating: 1450,
  avatar_url: null,
  marco_perfil: "numeria",
  fondo_perfil: "dorado",
  fondo_perfil_url: null,
  titulo_activo: "bautismo_de_fuego",
  titulo_nombre: "Bautismo de Fuego",
  color_nombre: "#FF00AA",
  fuente_nombre: "impacto",
  animacion_nombre: "arcoiris",
  nivel_cuenta: 26,
  puntos_total: 272,
};

const AMIGO_NEUTRO: Amigo = {
  friend_id: "22222222-2222-2222-2222-222222222222",
  display_name: "Jugador Nuevo",
  elo_rating: 800,
  avatar_url: null,
  marco_perfil: "ninguno",
  fondo_perfil: "ninguno",
  fondo_perfil_url: null,
  titulo_activo: null,
  titulo_nombre: null,
  color_nombre: null,
  fuente_nombre: "default",
  animacion_nombre: "ninguna",
  nivel_cuenta: 1,
  puntos_total: 0,
};

const AMIGO_FONDO_PERSONALIZADO_SIN_URL: Amigo = {
  ...AMIGO_NEUTRO,
  friend_id: "33333333-3333-3333-3333-333333333333",
  display_name: "Sin Imagen Todavía",
  fondo_perfil: "personalizado",
  fondo_perfil_url: null,
};

const AMIGO_FONDO_PERSONALIZADO_CON_URL: Amigo = {
  ...AMIGO_NEUTRO,
  friend_id: "44444444-4444-4444-4444-444444444444",
  display_name: "Con Fondo Propio",
  fondo_perfil: "personalizado",
  fondo_perfil_url: "https://ejemplo.test/fondo.png",
};

function placa(amigo: Amigo, compacto = false, locale: "es" | "en" = "es"): string {
  return conIntl(locale, createElement(PlacaAmigo, { amigo, onRetar: () => {}, onQuitar: () => {}, compacto }));
}

describe("PlacaAmigo — render", () => {
  it("amigo con placa completa (fondo, marco de mundo, título, color, fuente y animación): no tira excepción y muestra nombre y rango", () => {
    const html = placa(AMIGO_COMPLETO);
    expect(html).toContain("Ada Lovelace");
    expect(html).toContain("Bautismo de Fuego");
    // RangoBadge (mostrarElo=false por defecto, mismo criterio que en
    // /perfil/[userId]) no imprime el ELO crudo — 1450 cae en Platino.
    expect(html).toContain("Platino");
    expect(html).toContain("marco_numeria.png");
  });

  it("amigo neutro (sin fondo, sin marco, sin título): no tira excepción", () => {
    const html = placa(AMIGO_NEUTRO);
    expect(html).toContain("Jugador Nuevo");
    expect(html).not.toContain("Bautismo de Fuego");
  });

  it("fondo personalizado sin imagen subida todavía: no tira excepción (no debe intentar pintar background-image con url null)", () => {
    const html = placa(AMIGO_FONDO_PERSONALIZADO_SIN_URL);
    expect(html).toContain("Sin Imagen Todavía");
  });

  it("fondo personalizado con imagen: no tira excepción", () => {
    const html = placa(AMIGO_FONDO_PERSONALIZADO_CON_URL);
    expect(html).toContain("Con Fondo Propio");
    expect(html).toContain("ejemplo.test/fondo.png");
  });

  it("versión compacta (FeedSidebar): no tira excepción", () => {
    const html = placa(AMIGO_COMPLETO, true);
    expect(html).toContain("Ada Lovelace");
  });

  it("sin display_name (null): cae al nombre genérico traducido, en los dos idiomas", () => {
    const sinNombre = { ...AMIGO_NEUTRO, display_name: null };
    expect(placa(sinNombre, false, "es")).toContain("Jugador");
    expect(placa(sinNombre, false, "en")).toContain("Player");
  });

  it("el menú de acciones arranca cerrado (sin role=menu en el HTML inicial)", () => {
    const html = placa(AMIGO_COMPLETO);
    expect(html).not.toContain('role="menu"');
  });
});

// Pedido en vivo (2026-09-24): "dos columnas con un cuadrado relativamente
// más largo de arriba hacia abajo" — variante "tarjeta" (vertical, con
// nivel y chispas), sin tocar la placa horizontal que usa FeedSidebar.
function tarjeta(amigo: Amigo, locale: "es" | "en" = "es"): string {
  return conIntl(locale, createElement(PlacaAmigo, { amigo, onRetar: () => {}, onQuitar: () => {}, variante: "tarjeta" }));
}

describe("PlacaAmigo — variante tarjeta (cuadrícula de Tus amigos)", () => {
  it("es vertical (más alta que ancha), muestra nombre, rango, título, nivel y chispas", () => {
    const html = tarjeta(AMIGO_COMPLETO);
    expect(html).toContain("aspect-[4/5]");
    expect(html).toContain("flex-col");
    expect(html).toContain("Ada Lovelace");
    expect(html).toContain("Platino");
    expect(html).toContain("Bautismo de Fuego");
    expect(html).toContain("Nivel 26");
    expect(html).toContain("272 chispas");
  });

  it("en inglés traduce nivel y chispas", () => {
    const html = tarjeta(AMIGO_COMPLETO, "en");
    expect(html).toContain("Level 26");
    expect(html).toContain("272 Chispas");
  });

  it("amigo neutro (sin fondo, sin marco, sin título): no tira excepción y muestra nivel 1 y 0 chispas", () => {
    const html = tarjeta(AMIGO_NEUTRO);
    expect(html).toContain("Jugador Nuevo");
    expect(html).toContain("Nivel 1");
    expect(html).toContain("0 chispas");
  });

  it("con fondo personalizado con imagen: no tira excepción y conserva la imagen", () => {
    const html = tarjeta(AMIGO_FONDO_PERSONALIZADO_CON_URL);
    expect(html).toContain("ejemplo.test/fondo.png");
  });

  it("la placa horizontal (default y compacta) NO cambia: no lleva nivel/chispas ni la forma vertical", () => {
    for (const html of [placa(AMIGO_COMPLETO), placa(AMIGO_COMPLETO, true)]) {
      expect(html).not.toContain("aspect-[4/5]");
      expect(html).not.toContain("Nivel 26");
    }
  });

  it("el menú de acciones de la tarjeta arranca cerrado", () => {
    expect(tarjeta(AMIGO_COMPLETO)).not.toContain('role="menu"');
  });

  it("antes de aplicar la migración 0220 (mis_amigos() sin nivel_cuenta/puntos_total) no tira excepción y muestra Nivel 1 y 0 chispas", () => {
    const { nivel_cuenta: _n, puntos_total: _p, ...sinCamposNuevos } = AMIGO_COMPLETO;
    void _n;
    void _p;
    const html = tarjeta(sinCamposNuevos as unknown as Amigo);
    expect(html).toContain("Ada Lovelace");
    expect(html).toContain("Nivel 1");
    expect(html).toContain("0 chispas");
    expect(html).not.toContain("undefined");
  });
});
