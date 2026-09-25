import { describe, expect, it } from "vitest";
import {
  LARGO_CITA,
  canalAvisosClan,
  canalAvisosDirectos,
  chatDeClanVisible,
  citaDe,
  conversacionAbierta,
  recortar,
  textoInsignia,
} from "./util";

describe("mensajes: utilidades", () => {
  it("los canales de avisos son únicos por persona y por clan", () => {
    expect(canalAvisosDirectos("a")).toBe("avisos-dm:a");
    expect(canalAvisosDirectos("a")).not.toBe(canalAvisosDirectos("b"));
    expect(canalAvisosClan("c1")).toBe("avisos-clan:c1");
  });

  it("recortar deja intacto un texto corto y normaliza los espacios", () => {
    expect(recortar("  hola   mundo \n ")).toBe("hola mundo");
  });

  it("recortar agrega … solo cuando recorta y no parte un emoji", () => {
    const largo = "😀".repeat(200);
    const r = recortar(largo, 10);
    expect(Array.from(r)).toHaveLength(11); // 10 emojis + …
    expect(r.endsWith("…")).toBe(true);
    expect(r).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/); // ningún sustituto suelto
    expect(recortar("a".repeat(90))).toBe("a".repeat(90));
    expect(recortar("a".repeat(91))).toBe("a".repeat(90) + "…");
  });

  it("detecta la conversación abierta solo por el id exacto", () => {
    expect(conversacionAbierta("/social/mensajes/abc", "abc")).toBe(true);
    expect(conversacionAbierta("/social/mensajes/abc/", "abc")).toBe(true);
    expect(conversacionAbierta("/social/mensajes/abcd", "abc")).toBe(false);
    expect(conversacionAbierta("/social", "abc")).toBe(false);
    expect(conversacionAbierta(null, "abc")).toBe(false);
  });

  it("el chat de clan solo es visible en /clanes", () => {
    expect(chatDeClanVisible("/clanes")).toBe(true);
    expect(chatDeClanVisible("/clanes/mundo")).toBe(false);
    expect(chatDeClanVisible("/social")).toBe(false);
  });

  it("la cita recorta al mismo largo que el servidor", () => {
    const c = citaDe("m1", "u1", "x".repeat(500));
    expect(Array.from(c.texto)).toHaveLength(LARGO_CITA);
    expect(c.id).toBe("m1");
  });

  it("la insignia nunca pasa de 99+", () => {
    expect(textoInsignia(3)).toBe("3");
    expect(textoInsignia(99)).toBe("99");
    expect(textoInsignia(100)).toBe("99+");
  });
});
