import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contraste, itemTema, PRECIO_CHISPAS_RAREZA_TEMA, PRECIO_TEMA_COMETAS, TEMAS_APP, tokensTema, variablesCssTema } from "./temas";

const SQL = readFileSync(path.join(__dirname, "..", "..", "..", "supabase", "migrations", "0297_temas_app.sql"), "utf8");

describe("temas de la app", () => {
  it("cada tema está en el catálogo de 0297 con su rareza, su precio en Cometas y sin venderse con Chispas", () => {
    const filas = [...SQL.matchAll(/\('(tema_\w+)', 'tema', '(\w+)', '[^']+', '(\w+)', (\d+), (true|false), (true|false), null, null, (\d+)\)/g)];
    expect(filas).toHaveLength(TEMAS_APP.length);
    for (const t of TEMAS_APP) {
      const f = filas.find((m) => m[1] === itemTema(t.slug));
      expect(f, t.slug).toBeDefined();
      expect(f![2]).toBe(t.slug);
      expect(f![3], t.slug).toBe(t.rareza);
      expect(Number(f![4]), t.slug).toBe(PRECIO_CHISPAS_RAREZA_TEMA[t.rareza]);
      expect(f![5], `${t.slug} no se vende con Chispas`).toBe("false");
      expect(f![6], `${t.slug} no sale en las cápsulas comunes`).toBe("false");
      expect(Number(f![7]), t.slug).toBe(PRECIO_TEMA_COMETAS[t.rareza]);
    }
  });

  it("los precios en Chispas son los de precio_chispas_rareza (0280)", () => {
    const sql0280 = readFileSync(path.join(__dirname, "..", "..", "..", "supabase", "migrations", "0280_economia_nueva.sql"), "utf8");
    const { comun, raro, epico, legendario } = PRECIO_CHISPAS_RAREZA_TEMA;
    expect(sql0280).toContain(`select case p_rareza when 'comun' then ${comun} when 'raro' then ${raro} when 'epico' then ${epico} else ${legendario} end;`);
  });

  it("todo texto se lee en todos los temas (contraste WCAG)", () => {
    for (const t of TEMAS_APP) {
      const k = tokensTema(t.slug)!;
      const superficies = [k.fondo, k.superficie, k.superficie2, k.superficie3];
      for (const s of superficies) expect(contraste(k.texto, s), `${t.slug}: texto sobre ${s}`).toBeGreaterThanOrEqual(4.5);
      for (const s of [k.fondo, k.superficie, k.superficie2]) expect(contraste(k.texto2, s), `${t.slug}: texto secundario sobre ${s}`).toBeGreaterThanOrEqual(4.5);
      // Botón principal: texto blanco (web y app). Botón de logro: texto oscuro #2A1A00.
      expect(contraste("#FFFFFF", k.primario), `${t.slug}: blanco sobre el primario`).toBeGreaterThanOrEqual(4.5);
      expect(contraste("#2A1A00", k.logro), `${t.slug}: oscuro sobre el logro`).toBeGreaterThanOrEqual(4.5);
      // Acentos usados como texto (tintas) sobre las tarjetas.
      for (const tinta of [k.tintaPrimario, k.tintaLogro, k.tintaCorrecto, k.tintaError, k.tintaRacha, k.primarioClaro]) {
        expect(contraste(tinta, k.superficie), `${t.slug}: tinta ${tinta}`).toBeGreaterThanOrEqual(4.5);
        expect(contraste(tinta, k.superficie2), `${t.slug}: tinta ${tinta}`).toBeGreaterThanOrEqual(4.5);
      }
      // Claro u oscuro según su fondo.
      expect(contraste(k.fondo, "#000000") > contraste(k.fondo, "#FFFFFF"), `${t.slug}: claro`).toBe(k.claro);
    }
  });

  it("la web recibe todas las variables de globals.css", () => {
    const css = readFileSync(path.join(__dirname, "..", "..", "app", "globals.css"), "utf8");
    const v = variablesCssTema("suizo")!;
    for (const nombre of ["--background", "--foreground", "--texto-secundario", "--surface", "--surface-2", "--border", "--primario", "--correcto", "--racha", "--error", "--logro"]) {
      expect(v[nombre], nombre).toMatch(/^#[0-9A-F]{6}$/i);
      expect(css).toContain(`${nombre}:`);
    }
    expect(variablesCssTema("clasico")).toBeNull();
    expect(variablesCssTema(null)).toBeNull();
  });
});
