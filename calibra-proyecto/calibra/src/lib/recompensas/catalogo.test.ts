import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOGO_NUEVO, CIUDADES, EFECTOS, EMOTES, ESTELAS, PAQUETES, particulasDe, PREMIOS_CALENDARIO, temporadaActual, UTILIDADES_NUEVAS } from "./catalogo";

const MIGRACIONES = path.join(__dirname, "..", "..", "..", "supabase", "migrations");
const sql0248 = readFileSync(path.join(MIGRACIONES, "0248_catalogo_cosmeticos_y_tienda.sql"), "utf8");
const sql0249 = readFileSync(path.join(MIGRACIONES, "0249_capsulas_misiones_calendario.sql"), "utf8");

// Filas fijas: ('slug', 'categoria', 'valor', 'nombre', 'rareza', precio, vendible, …)
const fijas = new Map<string, { categoria: string; valor: string; rareza: string; precio: number; vendible: boolean }>();
for (const m of sql0248.matchAll(/\('(\w+)', '(\w+)', '([\w-]+)', '[^']*', '(\w+)', (\d+), (true|false)/g)) {
  fijas.set(m[1], { categoria: m[2], valor: m[3], rareza: m[4], precio: Number(m[5]), vendible: m[6] === "true" });
}
// Filas por ciudad: select 'prefijo_' || m.slug, 'categoria', …, 'rareza', precio, vendible
const porCiudad = new Map<string, { categoria: string; rareza: string; precio: number; vendible: boolean }>();
for (const m of sql0248.matchAll(/select '(\w+_)' \|\| m\.slug(?: as slug)?, '(\w+)'(?: as categoria)?, [^\n]*?'(\w+)'(?: as rareza)?, (\d+)(?: as precio)?, (true|false)/g)) {
  porCiudad.set(m[1], { categoria: m[2], rareza: m[3], precio: Number(m[4]), vendible: m[5] === "true" });
}

describe("catálogo de la tienda ampliada", () => {
  it("cada artículo coincide en precio, rareza y si se vende con la migración 0248", () => {
    for (const it of CATALOGO_NUEVO) {
      const fila = fijas.get(it.item) ?? (it.mundo ? porCiudad.get(it.item.slice(0, it.item.length - it.mundo.length)) : undefined);
      expect(fila, it.item).toBeDefined();
      expect(fila!.precio, it.item).toBe(it.precio);
      expect(fila!.rareza, it.item).toBe(it.rareza);
      expect(fila!.vendible, it.item).toBe(it.vendible);
      expect(fila!.categoria, it.item).toBe(it.categoria);
    }
  });

  it("los paquetes cuestan lo mismo que en la base y tienen −25 % sobre la suma", () => {
    const precioDe = (slug: string) => fijas.get(slug)?.precio ?? 0;
    for (const p of PAQUETES) {
      const fila = sql0248.match(new RegExp(`\\('${p.item}', '[^']+', array\\[([^\\]]+)\\], (\\d+)\\)`));
      expect(fila, p.item).not.toBeNull();
      expect(Number(fila![2])).toBe(p.precio);
      expect(fila![1].split(",").map((s) => s.trim().replace(/'/g, ""))).toEqual(p.items);
      const suma = p.items.reduce((a, s) => a + precioDe(s), 0);
      expect(p.precio).toBe(Math.floor(suma * 0.75));
    }
  });

  it("las utilidades nuevas cuestan lo mismo que en comprar_item_tienda", () => {
    for (const u of UTILIDADES_NUEVAS) {
      expect(sql0248).toContain(`when '${u.item}' then ${u.precio}`);
    }
  });

  it("el calendario da lo mismo que premios_calendario()", () => {
    for (const p of PREMIOS_CALENDARIO) {
      expect(sql0249).toContain(`(${p.dia}, '${p.premio}', ${p.cantidad})`);
    }
  });

  it("todo lo equipable tiene cómo dibujarse", () => {
    for (const it of CATALOGO_NUEVO) {
      if (it.categoria === "estela") expect(ESTELAS[it.valor], it.item).toBeDefined();
      if (it.categoria === "efecto") expect(EFECTOS[it.valor], it.item).toBeDefined();
      if (it.categoria === "emote") expect(EMOTES[it.valor], it.item).toBeDefined();
    }
    expect(CIUDADES).toHaveLength(13);
  });

  it("la temporada sigue la misma cuenta que temporada_actual()", () => {
    expect(temporadaActual(new Date(Date.UTC(2026, 0, 15)))).toBe(1);
    expect(temporadaActual(new Date(Date.UTC(2026, 9, 5)))).toBe(2);
    expect(temporadaActual(new Date(Date.UTC(2026, 11, 31)))).toBe(4);
  });

  it("las partículas de un efecto son siempre las mismas", () => {
    const a = particulasDe(EFECTOS.confeti, 8);
    expect(a).toEqual(particulasDe(EFECTOS.confeti, 8));
    expect(a).toHaveLength(8);
  });
});
