import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CAPSULAS, type TipoCapsula } from "./catalogo";
import { CAPSULAS_CON_TEMAS, COMO_SE_CONSIGUE, CONTENIDO_CAPSULAS, GRUPOS_CAPSULAS, nombrePremio, porcentaje } from "./contenidoCapsulas";

// La última definición de contenido_capsula() es la de 0297. Si otra migración la
// redefine, este test tiene que leer esa.
const MIGRACIONES = path.join(__dirname, "..", "..", "..", "supabase", "migrations");
const SQL = readFileSync(path.join(MIGRACIONES, "0297_temas_app.sql"), "utf8");

function filasSql(): Map<string, { premio: string; peso: number; minimo: number; maximo: number }[]> {
  const cuerpo = SQL.slice(SQL.indexOf("create or replace function public.contenido_capsula"), SQL.indexOf("as t(tipo, premio, peso, minimo, maximo)"));
  const m = new Map<string, { premio: string; peso: number; minimo: number; maximo: number }[]>();
  for (const x of cuerpo.matchAll(/\('(\w+)', '(\w+)', (\d+), (\d+), (\d+)\)/g)) {
    const lista = m.get(x[1]) ?? [];
    lista.push({ premio: x[2], peso: Number(x[3]), minimo: Number(x[4]), maximo: Number(x[5]) });
    m.set(x[1], lista);
  }
  return m;
}

describe("contenido de las cápsulas", () => {
  it("es exactamente contenido_capsula() de 0297", () => {
    const sql = filasSql();
    expect([...sql.keys()].sort()).toEqual(Object.keys(CONTENIDO_CAPSULAS).sort());
    for (const [tipo, filas] of sql) expect(CONTENIDO_CAPSULAS[tipo as TipoCapsula], tipo).toEqual(filas);
  });

  it("0297 es la última migración que define contenido_capsula y abrir_capsula", () => {
    const posteriores = readdirSync(MIGRACIONES).filter((f) => f > "0297_temas_app.sql" && f.endsWith(".sql"));
    for (const f of posteriores) {
      const texto = readFileSync(path.join(MIGRACIONES, f), "utf8");
      expect(texto.includes("function public.contenido_capsula") || texto.includes("function public.abrir_capsula"), f).toBe(false);
    }
  });

  it("cada cápsula suma 100 y los temas salen solo en las más poderosas", () => {
    for (const [tipo, filas] of Object.entries(CONTENIDO_CAPSULAS)) {
      expect(filas.reduce((a, x) => a + x.peso, 0), tipo).toBe(100);
    }
    expect([...CAPSULAS_CON_TEMAS].sort()).toEqual(["alineacion", "prisma", "pro", "supernova"]);
  });

  it("la guía tiene todas las cápsulas, cómo se consiguen y nombres legibles", () => {
    const enGuia = GRUPOS_CAPSULAS.flatMap((g) => g.tipos);
    expect([...enGuia].sort()).toEqual((Object.keys(CAPSULAS) as TipoCapsula[]).sort());
    for (const tipo of enGuia) {
      expect(COMO_SE_CONSIGUE[tipo].length, tipo).toBeGreaterThan(10);
      for (const fila of CONTENIDO_CAPSULAS[tipo]) expect(nombrePremio(fila.premio, fila.minimo, fila.maximo), `${tipo}/${fila.premio}`).not.toContain("_");
    }
    expect(porcentaje(CONTENIDO_CAPSULAS.pro, CONTENIDO_CAPSULAS.pro[3])).toBe("8 %");
    expect(porcentaje([{ peso: 1 }, { peso: 2 }], { peso: 1 })).toBe("33.3 %");
  });
});
