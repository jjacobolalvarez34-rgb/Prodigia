import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";
import MemoriaCartas, { MemoriaCartasVista } from "./MemoriaCartas";
import { DorsoSVG } from "./CartaSVG";
import { generarProblemaNaipia, type Carta } from "@/lib/practica/naipia";
import { calendarioMemoria, estadoInicialMemoria, type EstadoMemoria } from "@/lib/practica/memoriaNaipia";

// Render real (no solo tipos): el crash de Codia pasó por no ejercitar el
// render. Se renderiza el componente con next-intl y los mensajes reales de
// es.json/en.json en el estado inicial, en mitad del reparto y al final.

const raiz = path.resolve(__dirname, "../../..");
const mensajes = {
  es: JSON.parse(readFileSync(path.join(raiz, "messages", "es.json"), "utf8")),
  en: JSON.parse(readFileSync(path.join(raiz, "messages", "en.json"), "utf8")),
};

const CARTAS: Carta[] = [
  { valor: "7", palo: "picas" },
  { valor: "K", palo: "corazones" },
  { valor: "3", palo: "treboles" },
  { valor: "A", palo: "diamantes" },
  { valor: "10", palo: "picas" },
];

function conIntl(locale: "es" | "en", hijo: React.ReactElement): string {
  return renderToStaticMarkup(
    createElement(NextIntlClientProvider, { locale, messages: mensajes[locale] } as React.ComponentProps<typeof NextIntlClientProvider>, hijo)
  );
}

function contar(html: string, patron: RegExp): number {
  return (html.match(patron) ?? []).length;
}

function vista(estado: EstadoMemoria, locale: "es" | "en" = "es", cartas: Carta[] = CARTAS): string {
  return conIntl(locale, createElement(MemoriaCartasVista, { cartas, msPorCarta: 1000, estado }));
}

describe("MemoriaCartas — render", () => {
  it("estado inicial (componente completo): indicador de modo, 'prepárate', huecos vacíos y NINGUNA carta visible", () => {
    const html = conIntl(
      "es",
      createElement(MemoriaCartas, { cartas: CARTAS, msPorCarta: 1000, onTerminar: () => {} })
    );
    expect(html).toContain("Modo memoria");
    expect(html).toContain("Las cartas desaparecen: cuenta de memoria.");
    expect(html).toContain("Prepárate");
    expect(contar(html, /data-hueco/g)).toBe(5);
    expect(contar(html, /data-dorso/g)).toBe(0);
    expect(html).toContain('aria-live="polite"');
    // ninguna carta de la secuencia aparece (ni dibujada ni por aria-label)
    expect(html).not.toMatch(/de picas|de corazones|de diamantes|de tr/);
    expect(html).not.toContain("<text");
  });

  it("en mitad del reparto: 'Carta 3 de 5', solo la carta actual dibujada y 2 dorsos", () => {
    const html = vista({ fase: "mostrando", visible: 2, ocultas: 2 });
    expect(html).toContain("Carta 3 de 5");
    expect(html).toContain("Carta 3 de 5: 3 de tréboles"); // anuncio sr-only
    expect(contar(html, /data-dorso/g)).toBe(2);
    expect(contar(html, /data-hueco/g)).toBe(3); // la actual + las 2 que faltan
    // solo UNA carta con cara (una sola carta con su <text> de valor)
    expect(contar(html, /<text/g)).toBe(1);
    // las cartas ya vistas y las futuras NO están en el DOM
    expect(html).not.toContain("7 de picas");
    expect(html).not.toContain("rey de corazones");
    expect(html).not.toContain("as de diamantes");
  });

  it("estado final: 5 dorsos, ninguna carta con cara y aviso de que ya salieron todas", () => {
    const cal = calendarioMemoria(CARTAS.length, 1000);
    const html = vista({ fase: "terminada", visible: null, ocultas: cal.nCartas });
    expect(html).toContain("Ya salieron las 5 cartas");
    expect(contar(html, /data-dorso/g)).toBe(5);
    expect(contar(html, /data-hueco/g)).toBe(0);
    expect(contar(html, /<text/g)).toBe(0);
    expect(html).not.toMatch(/de picas|de corazones|de diamantes|de tr/);
  });

  it("en inglés: mismos estados con textos en inglés", () => {
    expect(vista({ fase: "preparando", visible: null, ocultas: 0 }, "en")).toContain("Memory mode");
    expect(vista({ fase: "mostrando", visible: 0, ocultas: 0 }, "en")).toContain("Card 1 of 5: 7 of spades");
    expect(vista({ fase: "terminada", visible: null, ocultas: 5 }, "en")).toContain("All 5 cards are out");
  });

  it("con una secuencia real de nivel alto (12+ cartas) renderiza sin errores en todos los estados", () => {
    const p = generarProblemaNaipia("omega2", 9);
    expect(p.memoria).toBeDefined();
    const n = p.cartas.length;
    const estados: EstadoMemoria[] = [estadoInicialMemoria(calendarioMemoria(n, p.memoria!.msPorCarta))];
    for (let i = 0; i < n; i++) estados.push({ fase: "mostrando", visible: i, ocultas: i });
    estados.push({ fase: "terminada", visible: null, ocultas: n });
    for (const e of estados) {
      const html = vista(e, "es", p.cartas);
      expect(contar(html, /data-dorso/g)).toBe(e.ocultas);
      expect(contar(html, /<text/g)).toBe(e.visible === null ? 0 : 1);
    }
  });

  it("el dorso decorativo va oculto a lectores de pantalla y el no decorativo tiene etiqueta", () => {
    const deco = conIntl("es", createElement(DorsoSVG, { ancho: 20, decorativo: true }));
    expect(deco).toContain('aria-hidden="true"');
    expect(deco).not.toContain('role="img"');
    const normal = conIntl("es", createElement(DorsoSVG, { ancho: 20 }));
    expect(normal).toContain('role="img"');
    expect(normal).toContain("Carta boca abajo");
  });
});
