import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CIUDADES, EFECTOS, EMOTES, ESTELAS, SONIDOS, marcoTemporadaDe } from "./catalogo";
import { FONDOS_ESTILO, filasCatalogoAmpliado, MARCOS_ESTILO, PAQUETES_NUEVOS } from "./catalogoAmpliado";
import { ESTILO_MARCO_PERFIL, FONDO_PERFIL_ESTILO, type FondoPerfil } from "@/types/database";

// La migración 0275 se genera desde catalogoAmpliado.ts. Para regenerarla:
// TIENDA_ESCRIBIR_SQL=1 npx vitest run src/lib/recompensas/catalogoAmpliado.test.ts
const RAIZ = path.resolve(__dirname, "../../..");
const MIGRACION = path.join(RAIZ, "supabase", "migrations", "0275_tienda_ampliada_mas_cosmeticos.sql");

// Valores permitidos hasta 0263 (profiles_marco_perfil_check / profiles_fondo_perfil_check).
const MARCOS_ANTES = [
  "ninguno", "bronce", "plata", "oro", "platino", "diamante", "prodigio",
  ...CIUDADES.map((c) => c.slug),
  "neon_violeta", "neon_cian", "neon_magenta",
  "temporada_aurora", "temporada_brasas", "temporada_escarcha", "temporada_cosmos",
  ...CIUDADES.map((c) => `coleccion_${c.slug}`),
  "pionero",
];
const FONDOS_ANTES = ["ninguno", "aurora", "nebulosa", "dorado", "oceano", "bosque", "personalizado", "prodigio", ...CIUDADES.map((c) => `ciudad_${c.slug}`)];

const sql = (s: string) => `'${s.replace(/'/g, "''")}'`;
const lista = (xs: string[]) => xs.map(sql).join(", ");

export function generarSql0275(): string {
  const filas = filasCatalogoAmpliado();
  return `-- ============================================================
-- Prodigia — Tienda ampliada: más cosméticos de todo tipo (0275).
--
-- Pedido del 2026-10-10: «agrega MÁS cosas a la tienda, de todo tipo». Suma
-- ${MARCOS_ESTILO.length} marcos de colores, ${FONDOS_ESTILO.length} fondos, estelas, efectos, sonidos,
-- emotes, títulos y ${PAQUETES_NUEVOS.length} paquetes. Todo pasa por el catálogo de 0248: comprar
-- (comprar_item_tienda), tenerlo (_tiene_cosmetico) y darlo (_dar_cosmetico) ya
-- funcionan con cualquier fila nueva; solo hay que ampliar los valores permitidos
-- de marco_perfil y fondo_perfil.
--
-- Se GENERA desde src/lib/recompensas/catalogoAmpliado.ts y
-- catalogoAmpliado.test.ts comprueba que coincida. No editar a mano.
-- Requiere 0248 y 0263. Idempotente.
-- ============================================================

alter table public.profiles drop constraint if exists profiles_marco_perfil_check;
alter table public.profiles add constraint profiles_marco_perfil_check
  check (marco_perfil in (${lista([...MARCOS_ANTES, ...MARCOS_ESTILO.map((m) => m.slug)])}));

alter table public.profiles drop constraint if exists profiles_fondo_perfil_check;
alter table public.profiles add constraint profiles_fondo_perfil_check
  check (fondo_perfil in (${lista([...FONDOS_ANTES, ...FONDOS_ESTILO.map((f) => f.valor)])}));

insert into public.catalogo_cosmeticos (slug, categoria, valor, nombre, rareza, precio, vendible, en_capsulas, mundo, temporada) values
${filas.map((f) => `  (${sql(f.item)}, ${sql(f.categoria)}, ${sql(f.valor)}, ${sql(f.nombre)}, ${sql(f.rareza)}, ${f.precio}, true, true, null, null)`).join(",\n")}
on conflict (slug) do update set categoria = excluded.categoria, valor = excluded.valor, nombre = excluded.nombre, rareza = excluded.rareza, precio = excluded.precio, vendible = excluded.vendible, en_capsulas = excluded.en_capsulas;

insert into public.paquetes_tienda (slug, nombre, items, precio) values
${PAQUETES_NUEVOS.map((p) => `  (${sql(p.item)}, ${sql(p.nombre)}, array[${lista(p.items)}], ${p.precio})`).join(",\n")}
on conflict (slug) do update set nombre = excluded.nombre, items = excluded.items, precio = excluded.precio;

notify pgrst, 'reload schema';
`;
}

describe("tienda ampliada (0275)", () => {
  it("la migración es exactamente lo generado", () => {
    const esperado = generarSql0275();
    if (process.env.TIENDA_ESCRIBIR_SQL === "1") fs.writeFileSync(MIGRACION, esperado, "utf8");
    expect(fs.readFileSync(MIGRACION, "utf8").replace(/\r\n/g, "\n")).toBe(esperado);
  });

  it("los slugs no se repiten ni chocan con el catálogo anterior", () => {
    const slugs = filasCatalogoAmpliado().map((f) => f.item);
    expect(new Set(slugs).size).toBe(slugs.length);
    const sql0248 = fs.readFileSync(path.join(RAIZ, "supabase", "migrations", "0248_catalogo_cosmeticos_y_tienda.sql"), "utf8");
    for (const s of slugs) expect(sql0248.includes(`'${s}'`), s).toBe(false);
    for (const f of FONDOS_ESTILO) expect(FONDOS_ANTES).not.toContain(f.valor);
  });

  it("todo lo nuevo tiene cómo dibujarse en la web y en la app", () => {
    for (const f of filasCatalogoAmpliado()) {
      if (f.categoria === "marco") {
        expect(marcoTemporadaDe(f.valor), f.item).not.toBeNull();
        expect(ESTILO_MARCO_PERFIL[f.valor], f.item).toBeDefined();
      }
      if (f.categoria === "fondo") expect(FONDO_PERFIL_ESTILO[f.valor as FondoPerfil], f.item).toMatch(/linear-gradient/);
      if (f.categoria === "estela") expect(ESTELAS[f.valor], f.item).toBeDefined();
      if (f.categoria === "efecto") expect(EFECTOS[f.valor], f.item).toBeDefined();
      if (f.categoria === "sonido") expect(SONIDOS[f.valor], f.item).toBeDefined();
      if (f.categoria === "emote") expect(EMOTES[f.valor], f.item).toBeDefined();
    }
  });

  it("cada marco de colores tiene su clase en globals.css", () => {
    const css = fs.readFileSync(path.join(RAIZ, "src", "app", "globals.css"), "utf8");
    for (const m of MARCOS_ESTILO) expect(css, m.slug).toContain(`.marco-${m.slug.replace(/_/g, "-")} {`);
  });

  it("los paquetes tienen −25 % sobre la suma y solo cosas del catálogo", () => {
    const precio = new Map(filasCatalogoAmpliado().map((f) => [f.item, f.precio]));
    for (const p of PAQUETES_NUEVOS) {
      for (const s of p.items) expect(precio.has(s), `${p.item}: ${s}`).toBe(true);
      expect(p.precio).toBe(Math.floor(p.items.reduce((a, s) => a + precio.get(s)!, 0) * 0.75));
    }
  });
});
