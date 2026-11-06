import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contraste, FORMA_CLASICA, formaTema, itemTema, LETRA_LIBRE, LETRAS_APP, letraDe, letraEfectiva, PRECIO_CHISPAS_RAREZA_TEMA, PRECIO_TEMA_COMETAS, TEMAS_APP, tokensTema, variablesCssTema } from "./temas";

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

  it("cada tema tiene su letra de títulos y su forma; sin tema, nada cambia", () => {
    for (const t of TEMAS_APP) {
      expect(letraDe(t.letra), t.slug).not.toBeNull();
      const f = formaTema(t.slug)!;
      expect(f.radioTarjeta, t.slug).toBe(t.radio * 2.5);
      expect(f.radioBoton, t.slug).toBe(t.radio * 2);
      if (t.radio === 0) expect([f.radioTarjeta, f.radioBoton, f.radioChip, f.radioHoja], `${t.slug}: esquinas rectas`).toEqual([0, 0, 0, 0]);
      expect(f.borde, t.slug).toBe(t.borde);
      expect(f.sombra, t.slug).toBe(t.sombra);
    }
    // Cada tema con una letra distinta (que se note el cambio).
    expect(new Set(TEMAS_APP.map((t) => t.letra)).size).toBe(TEMAS_APP.length);
    expect(formaTema("clasico")).toBeNull();
    expect(formaTema(null)).toBeNull();
    expect(FORMA_CLASICA.radioBoton).toBe(999);
    expect(letraEfectiva("clasico", null)).toBeNull();
    expect(letraEfectiva(null, undefined)).toBeNull();
  });

  it("la letra elegida (Letra libre) gana sobre la del tema", () => {
    expect(letraEfectiva("arcade", null)?.id).toBe("arcade");
    expect(letraEfectiva("arcade", "cursiva")?.id).toBe("cursiva");
    expect(letraEfectiva("arcade", "siempre")?.id).toBe("siempre");
    expect(letraEfectiva("clasico", "romana")?.id).toBe("romana");
    // Una letra desconocida no rompe nada: vale la del tema.
    expect(letraEfectiva("suizo", "comic-sans")?.id).toBe("imprenta");
  });

  it("las letras están cargadas en la web y en la app, con su escala", () => {
    const layoutWeb = readFileSync(path.join(__dirname, "..", "..", "app", "layout.tsx"), "utf8");
    const layoutApp = readFileSync(path.join(__dirname, "..", "..", "..", "..", "mobile", "src", "app", "_layout.tsx"), "utf8");
    for (const l of LETRAS_APP) {
      const variable = l.web.match(/^var\((--font-[\w-]+)\)$/)?.[1];
      expect(variable, l.id).toBeDefined();
      expect(layoutWeb, `${l.id}: ${variable} en layout.tsx`).toContain(`variable: "${variable}"`);
      for (const familia of [l.app.display, l.app.semi]) {
        expect(new RegExp(`\\b${familia}\\b`).test(layoutApp), `${l.id}: ${familia} en useFonts`).toBe(true);
      }
      expect(l.escala, l.id).toBeGreaterThan(0.5);
      expect(l.escala, l.id).toBeLessThanOrEqual(1.1);
      expect(l.interlineado, l.id).toBeGreaterThanOrEqual(1.1);
    }
    expect(letraDe("siempre")?.escala).toBe(1);
  });

  it("la web recibe la letra y la forma del tema", () => {
    const css = readFileSync(path.join(__dirname, "..", "..", "app", "globals.css"), "utf8");
    expect(css).toContain("--font-display: var(--fuente-titulos, var(--font-space-grotesk));");
    const v = variablesCssTema("arcade")!;
    expect(v["--fuente-titulos"]).toBe("var(--font-press-start)");
    expect(v["--escala-letra"]).toBe("0.62");
    expect(v["--radius-2xl"]).toBe("0px");
    expect(v["--radio-boton"]).toBe("0px");
    expect(variablesCssTema("rpg")!["--radius-2xl"]).toBe("17.5px");
  });

  it("la Letra libre de 0314 coincide con temas.ts", () => {
    const sql = readFileSync(path.join(__dirname, "..", "..", "..", "supabase", "migrations", "0314_letra_libre.sql"), "utf8");
    const fila = sql.match(/\('letra_libre', '(\w+)', '(\w+)', '([^']+)', '(\w+)', (\d+), (true|false), (true|false), null, null, (\d+)\)/);
    expect(fila).not.toBeNull();
    expect(fila![1]).toBe(LETRA_LIBRE.categoria);
    expect(fila![2]).toBe(LETRA_LIBRE.valor);
    expect(fila![3]).toBe(LETRA_LIBRE.nombre);
    expect(fila![4]).toBe(LETRA_LIBRE.rareza);
    expect(Number(fila![5])).toBe(PRECIO_CHISPAS_RAREZA_TEMA[LETRA_LIBRE.rareza]);
    expect(fila![6], "no se vende con Chispas").toBe("false");
    expect(fila![7], "no sale en las cápsulas comunes").toBe("false");
    expect(Number(fila![8])).toBe(LETRA_LIBRE.precioCometas);
    const lista = sql.match(/p_letra not in \(([^)]+)\)/)![1].split(",").map((x) => x.trim().replace(/'/g, ""));
    expect(lista.sort()).toEqual(LETRAS_APP.map((l) => l.id).sort());
    // Sale en las cápsulas de temas.
    expect(sql).toContain("c.categoria in ('tema', 'letra_app') and not public._tiene_cosmetico");
  });
});
