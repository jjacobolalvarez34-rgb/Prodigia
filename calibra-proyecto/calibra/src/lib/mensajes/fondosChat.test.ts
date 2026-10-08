import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FONDOS_CHAT, fondoChatDe, puntosPatron } from "./fondosChat";

const sql = readFileSync(path.join(__dirname, "../../../supabase/migrations/0262_fondos_chat.sql"), "utf8");

describe("fondos de chat", () => {
  it("cada fondo cuesta lo mismo en la base que en la web y la app", () => {
    const enSql = Object.fromEntries([...sql.matchAll(/when '([a-z_]+)' then (\d+)/g)].map((m) => [m[1], Number(m[2])]));
    expect(Object.keys(enSql).sort()).toEqual(FONDOS_CHAT.map((f) => f.slug).sort());
    for (const f of FONDOS_CHAT) expect(enSql[f.slug]).toBe(f.precio);
  });

  it("los slugs no se repiten y desconocido es null", () => {
    expect(new Set(FONDOS_CHAT.map((f) => f.slug)).size).toBe(FONDOS_CHAT.length);
    expect(fondoChatDe("ninguno")).toBeNull();
    expect(fondoChatDe(null)).toBeNull();
  });

  it("el patrón de puntos es siempre el mismo y cae dentro del lienzo", () => {
    expect(puntosPatron()).toEqual(puntosPatron());
    for (const p of puntosPatron()) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThan(100);
      expect(p.y).toBeLessThan(100);
    }
  });
});
