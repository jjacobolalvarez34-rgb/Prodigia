import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOGO_NUEVO, CIUDADES, EFECTOS, EMOTES, ESTELAS, PAQUETES, particulasDe, precioEnCometas, PREMIOS_CALENDARIO, temporadaActual, UTILIDADES_NUEVAS } from "./catalogo";
import { COSTOS, PRECIO_RAREZA_CHISPAS } from "../tienda/costos";

const MIGRACIONES = path.join(__dirname, "..", "..", "..", "supabase", "migrations");
// 0248 más la ampliación de 0275 (mismo formato de filas y de paquetes).
const sql0248 = readFileSync(path.join(MIGRACIONES, "0248_catalogo_cosmeticos_y_tienda.sql"), "utf8") + readFileSync(path.join(MIGRACIONES, "0275_tienda_ampliada_mas_cosmeticos.sql"), "utf8");
// Economía nueva (0280): precios por rareza, consumibles, paquetes y calendario vigentes.
const sql0280 = readFileSync(path.join(MIGRACIONES, "0280_economia_nueva.sql"), "utf8");

type RarezaPrecio = keyof typeof PRECIO_RAREZA_CHISPAS;

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
  it("cada artículo coincide en rareza y si se vende con 0248, y cuesta lo de su rareza (0280)", () => {
    expect(sql0280).toContain("select case p_rareza when 'comun' then 400 when 'raro' then 1200 when 'epico' then 3000 else 6000 end;");
    for (const it of CATALOGO_NUEVO) {
      const fila = fijas.get(it.item) ?? (it.mundo ? porCiudad.get(it.item.slice(0, it.item.length - it.mundo.length)) : undefined);
      expect(fila, it.item).toBeDefined();
      expect(it.precio, it.item).toBe(PRECIO_RAREZA_CHISPAS[it.rareza]);
      expect(fila!.rareza, it.item).toBe(it.rareza);
      expect(fila!.vendible, it.item).toBe(it.vendible);
      expect(fila!.categoria, it.item).toBe(it.categoria);
    }
  });

  it("los paquetes traen lo mismo que en la base y cuestan −25 % sobre la suma con los precios de 0280", () => {
    const precioDe = (slug: string) => {
      const fila = fijas.get(slug);
      return fila ? PRECIO_RAREZA_CHISPAS[fila.rareza as RarezaPrecio] : 0;
    };
    expect(sql0280).toContain("set precio = floor((select sum(c.precio) from public.catalogo_cosmeticos c where c.slug = any(pq.items)) * 0.75)::integer");
    for (const p of PAQUETES) {
      const fila = sql0248.match(new RegExp(`\\('${p.item}', '[^']+', array\\[([^\\]]+)\\], (\\d+)\\)`));
      expect(fila, p.item).not.toBeNull();
      expect(fila![1].split(",").map((s) => s.trim().replace(/'/g, ""))).toEqual(p.items);
      const suma = p.items.reduce((a, s) => a + precioDe(s), 0);
      expect(p.precio, p.item).toBe(Math.floor(suma * 0.75));
    }
  });

  it("lo legendario se compra con Cometas y lo demás con Chispas según su rareza", () => {
    expect(sql0280).toContain("when c.rareza = 'legendario' and c.vendible then 600");
    for (const it of CATALOGO_NUEVO.filter((x) => x.vendible)) {
      expect(precioEnCometas(it.item), it.item).toBe(it.rareza === "legendario" ? 600 : null);
    }
    for (const [slug, fila] of fijas) {
      if (!(slug in COSTOS) || !fila.vendible) continue;
      expect(precioEnCometas(slug), slug).toBe(fila.rareza === "legendario" ? 600 : null);
      expect(COSTOS[slug as keyof typeof COSTOS], slug).toBe(PRECIO_RAREZA_CHISPAS[fila.rareza as RarezaPrecio]);
    }
  });

  it("las utilidades y consumibles cuestan lo mismo que en comprar_item_tienda (0280)", () => {
    for (const u of UTILIDADES_NUEVAS) {
      expect(sql0280).toContain(`when '${u.item}' then ${u.precio}`);
    }
    for (const k of ["escudo", "congelamiento", "boost", "hielo", "tiempo_extra", "paquete_marcos_mundo", "fondo_personalizado", "color_nombre_personalizado", "animacion_prisma", "fondo_prodigio"] as const) {
      expect(sql0280).toContain(`when '${k}' then ${COSTOS[k]}`);
    }
  });

  it("el calendario da lo mismo que premios_calendario()", () => {
    for (const p of PREMIOS_CALENDARIO) {
      expect(sql0280).toContain(`(${p.dia}, '${p.premio}', ${p.cantidad})`);
    }
  });

  it("todo lo equipable tiene cómo dibujarse", () => {
    for (const it of CATALOGO_NUEVO) {
      if (it.categoria === "estela") expect(ESTELAS[it.valor], it.item).toBeDefined();
      if (it.categoria === "efecto") expect(EFECTOS[it.valor], it.item).toBeDefined();
      if (it.categoria === "emote") expect(EMOTES[it.valor], it.item).toBeDefined();
    }
    expect(CIUDADES).toHaveLength(15);
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
