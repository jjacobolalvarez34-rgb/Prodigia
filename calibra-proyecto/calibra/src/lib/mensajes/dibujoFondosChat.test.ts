import { describe, expect, it } from "vitest";
import { FONDOS_CHAT } from "./fondosChat";
import { svgFondoChat, tieneDibujoFondoChat, urlFondoChat } from "./dibujoFondosChat";
import { estadoVisible, hayRetoPendiente, textoRestante, type RetoChat } from "./retosChat";

describe("dibujo de los fondos de chat", () => {
  it("cada fondo del catálogo tiene escena y siempre sale igual", () => {
    for (const f of FONDOS_CHAT) {
      expect(tieneDibujoFondoChat(f.slug)).toBe(true);
      const a = svgFondoChat(f.slug, 390, 700);
      expect(a).toBe(svgFondoChat(f.slug, 390, 700));
      expect(a?.startsWith("<svg")).toBe(true);
      expect(a?.endsWith("</svg>")).toBe(true);
      // Sin atributos repetidos en una misma etiqueta (SVG inválido = fondo vacío).
      for (const etiqueta of a?.match(/<[a-zA-Z][^>]*>/g) ?? []) {
        const nombres = [...etiqueta.matchAll(/\s([a-zA-Z:-]+)=/g)].map((m) => m[1]);
        expect(new Set(nombres).size).toBe(nombres.length);
      }
      // Tope de elementos para que la app no se trabe.
      expect((a?.match(/<(circle|rect|path|ellipse)/g) ?? []).length).toBeLessThan(700);
    }
  });

  it("slug desconocido no dibuja nada", () => {
    expect(svgFondoChat("ninguno", 300, 300)).toBeNull();
    expect(urlFondoChat("ninguno", 300, 300)).toBeNull();
  });
});

describe("retos en el chat", () => {
  const reto: RetoChat = { mensajeId: "m", duelId: "d", retadorId: "a", mundo: "numeria", subTipo: null, operationType: "suma", estado: "pendiente", expiraAt: "2026-10-21T12:02:00Z" };
  const antes = Date.parse("2026-10-21T12:00:30Z");
  const despues = Date.parse("2026-10-21T12:02:01Z");

  it("un reto pendiente vence solo al pasar el plazo", () => {
    expect(estadoVisible(reto, antes)).toBe("pendiente");
    expect(estadoVisible(reto, despues)).toBe("vencida");
    expect(estadoVisible({ ...reto, estado: "aceptada" }, despues)).toBe("aceptada");
    expect(hayRetoPendiente({ m: reto }, antes)).toBe(true);
    expect(hayRetoPendiente({ m: reto }, despues)).toBe(false);
  });

  it("la cuenta regresiva se escribe en minutos y segundos", () => {
    expect(textoRestante(reto, antes)).toBe("1:30");
    expect(textoRestante(reto, despues)).toBe("0:00");
  });
});
