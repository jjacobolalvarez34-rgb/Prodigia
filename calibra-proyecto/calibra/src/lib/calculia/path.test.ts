import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ORDEN_GRUPOS_CALCULIA,
  calcularCaminoCalculia,
  calcularNodosClases,
  calcularNodosTecnicas,
  construirUnidadesCalculia,
  grupoDeSlug,
  obtenerCaminoCalculia,
  ordenarPorGrupoYOrden,
  puedeAbrirNodoCalculia,
  type FilaTechnique,
  type NodoCaminoCalculia,
} from "./path";
import { NOMBRES_GRUPOS_CALCULIA } from "./bloques";
import { TECNICAS_CALCULIA, CLASES_CALCULIA } from "./lecciones";
import { partirCaminoPorClases } from "@/lib/aprender/clases";

// Desbloqueo de Aprender de Calculia. Se testea sobre funciones puras
// (calcularNodosTecnicas / calcularNodosClases) y, para lo que valida
// [slug]/page.tsx, sobre obtenerCaminoCalculia con un Supabase de mentira: la
// página vuelve a pedir el camino y redirige si el nodo está "bloqueado", así que
// el estado que ve el sidebar tiene que ser el de la FUENTE (bug real de Numeria,
// commit 648f2b7: el sidebar mostraba "activo" un nodo que la página rebotaba
// porque el camino real lo traía "bloqueado").
//
// Decisión (pedido del usuario para todos los mundos, también en f238e2a para
// Quimia y Trigonometría): TÉCNICAS y CLASES con un puntero "activo" independiente
// POR TEMA; nunca un curso lineal único. Antes Calculia usaba
// obtenerCaminoConClases (un solo puntero por pestaña).

const raiz = path.resolve(__dirname, "../../..");
const messages = (l: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${l}.json`), "utf8"));

function filaDe(l: { slug: string; nombre: string; descripcion: string; orden: number; requierePro: boolean }): FilaTechnique {
  return { id: `id-${l.slug}`, slug: l.slug, nombre: l.nombre, descripcion: l.descripcion, contenido: { pasos: [] }, orden: l.orden, requiere_pro: l.requierePro };
}
// Filas "de la base" en un orden que NO es el del currículo (el cargador tiene que ordenarlas).
const FILAS: FilaTechnique[] = [...TECNICAS_CALCULIA, ...CLASES_CALCULIA].map(filaDe).sort((a, b) => b.slug.localeCompare(a.slug));
const idTec = (grupo: string, k: number) => `id-${TECNICAS_CALCULIA.filter((t) => t.grupo === grupo).sort((a, b) => a.orden - b.orden)[k - 1].slug}`;
const idCla = (grupo: string, k: number) => `id-${CLASES_CALCULIA.filter((c) => c.grupo === grupo).sort((a, b) => a.orden - b.orden)[k - 1].slug}`;
const porId = (nodos: NodoCaminoCalculia[]) => new Map(nodos.map((n) => [n.id, n]));

function prng(semilla: number) {
  let a = semilla;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function supabaseFalso(dominadas: Set<string>): SupabaseClient {
  const falso = {
    from(tabla: string) {
      if (tabla === "techniques") return { select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: FILAS }) }) }) };
      return { select: () => ({ eq: () => Promise.resolve({ data: [...dominadas].map((id) => ({ technique_id: id, dominado: true })) }) }) };
    },
  };
  return falso as unknown as SupabaseClient;
}

const CTA = { label: "Desbloquea con Pro", href: "/pro" };
const NOMBRES = Object.fromEntries(ORDEN_GRUPOS_CALCULIA.map((g) => [g, NOMBRES_GRUPOS_CALCULIA[g].es])) as Record<(typeof ORDEN_GRUPOS_CALCULIA)[number], string>;

describe("Calculia Técnicas: cada tema tiene su propio 'activo' independiente y es lineal dentro del tema", () => {
  const filas = ordenarPorGrupoYOrden(FILAS.filter((f) => !f.requiere_pro));

  it("con 0 dominadas, la primera Técnica de CADA tema queda activa a la vez y la segunda del tema (multivariable) bloqueada", () => {
    const nodos = calcularNodosTecnicas(filas, new Set());
    const m = porId(nodos);
    for (const g of ORDEN_GRUPOS_CALCULIA) expect(m.get(idTec(g, 1))!.estado, `${g} #1`).toBe("activo");
    expect(m.get(idTec("multivariable", 2))!.estado).toBe("bloqueado");
    expect(nodos.filter((n) => n.estado === "activo")).toHaveLength(4);
    expect(nodos.every((n) => !n.requierePro && !n.bloqueadoPorPlan)).toBe(true);
  });

  it("dentro de un tema es estrictamente lineal: completar la 1 activa la 2", () => {
    const m = porId(calcularNodosTecnicas(filas, new Set([idTec("multivariable", 1)])));
    expect(m.get(idTec("multivariable", 1))!.estado).toBe("completado");
    expect(m.get(idTec("multivariable", 2))!.estado).toBe("activo");
  });

  it("completar todo un tema no afecta el progreso de los otros", () => {
    const derivadas = TECNICAS_CALCULIA.filter((t) => t.grupo === "derivadas").map((t) => `id-${t.slug}`);
    const m = porId(calcularNodosTecnicas(filas, new Set(derivadas)));
    for (const g of ORDEN_GRUPOS_CALCULIA.slice(1)) expect(m.get(idTec(g, 1))!.estado, g).toBe("activo");
  });

  it("el tema de cada slug sale del contenido tipado y un slug desconocido cae en el primer tema (no se pierde ninguna fila)", () => {
    expect(grupoDeSlug("calculia-tabla-integrales-comunes")).toBe("integrales");
    expect(grupoDeSlug("calculia-derivar-parciales")).toBe("multivariable");
    expect(grupoDeSlug("calculia-pro-edos-separables")).toBe("multivariable");
    expect(grupoDeSlug("slug-que-no-existe")).toBe("derivadas");
  });
});

describe("Calculia Clases: un puntero activo por tema (por tema, nunca un curso lineal único), primera gratis, resto Pro", () => {
  const filas = ordenarPorGrupoYOrden(FILAS.filter((f) => f.requiere_pro));

  it("el cargador las ordena en orden de currículo (tema, orden), aunque la base las devuelva mezcladas", () => {
    expect(filas.map((f) => f.slug)).toEqual(CLASES_CALCULIA.map((c) => c.slug));
    expect(ordenarPorGrupoYOrden(FILAS.filter((f) => f.requiere_pro)).map((f) => f.slug)).toEqual([
      "calculia-pro-derivadas-fundamentos",
      "calculia-pro-derivadas-producto-cociente-cadena",
      "calculia-pro-integrales-fundamentos",
      "calculia-pro-integrales-avanzadas",
      "calculia-pro-series-geometricas",
      "calculia-pro-multivariable-parciales",
      "calculia-pro-edos-separables",
    ]);
  });

  it("con Pro y 0 dominadas: la primera Clase de CADA tema está activa a la vez (se puede empezar por cualquier tema)", () => {
    const nodos = calcularNodosClases(filas, new Set(), true);
    const m = porId(nodos);
    for (const g of ORDEN_GRUPOS_CALCULIA) expect(m.get(idCla(g, 1))!.estado, `${g} #1`).toBe("activo");
    for (const g of ["derivadas", "integrales", "multivariable"]) expect(m.get(idCla(g, 2))!.estado, `${g} #2`).toBe("bloqueado");
    expect(nodos.filter((n) => n.estado === "activo")).toHaveLength(4);
    expect(nodos.every((n) => n.requierePro && !n.bloqueadoPorPlan)).toBe(true);
  });

  it("sin Pro: solo la primera del currículo (preview gratis) está abierta; el resto bloqueado por plan, aunque se haya 'dominado' otra cosa", () => {
    const nodos = calcularNodosClases(filas, new Set(), false);
    expect(nodos[0].estado).toBe("activo");
    expect(nodos[0].bloqueadoPorPlan).toBe(false);
    for (const n of nodos.slice(1)) {
      expect(n.estado, n.slug).toBe("bloqueado");
      expect(n.bloqueadoPorPlan, n.slug).toBe(true);
    }
    // con la primera completada, queda "completado" y el resto sigue bloqueado por plan
    const tras = calcularNodosClases(filas, new Set([nodos[0].id]), false);
    expect(tras[0].estado).toBe("completado");
    expect(tras.slice(1).every((n) => n.estado === "bloqueado" && n.bloqueadoPorPlan)).toBe(true);
  });

  it("dentro de un tema con Pro es lineal: completar la 1 de integrales activa la 2 sin tocar los otros temas", () => {
    const m = porId(calcularNodosClases(filas, new Set([idCla("integrales", 1)]), true));
    expect(m.get(idCla("integrales", 1))!.estado).toBe("completado");
    expect(m.get(idCla("integrales", 2))!.estado).toBe("activo");
    expect(m.get(idCla("derivadas", 1))!.estado).toBe("activo");
    expect(m.get(idCla("derivadas", 2))!.estado).toBe("bloqueado");
    expect(m.get(idCla("series", 1))!.estado).toBe("activo");
  });

  it("empezar por el último tema es posible: se puede abrir la primera Clase de multivariable sin haber hecho derivadas, integrales ni series", () => {
    const m = porId(calcularNodosClases(filas, new Set(), true));
    expect(puedeAbrirNodoCalculia(m.get(idCla("multivariable", 1))!)).toBe(true);
    expect(puedeAbrirNodoCalculia(m.get(idCla("series", 1))!)).toBe(true);
  });
});

describe("Calculia: el sidebar y la página de la lección ven el MISMO estado (bug de Numeria 648f2b7)", () => {
  it("obtenerCaminoCalculia con un Supabase de mentira: el estado es el de la fuente, con [...Técnicas, ...Clases]", async () => {
    const nodos = await obtenerCaminoCalculia(supabaseFalso(new Set()), "u1", true);
    expect(nodos).toHaveLength(12);
    expect(nodos.slice(0, 5).every((n) => !n.requierePro)).toBe(true);
    expect(nodos.slice(5).every((n) => n.requierePro)).toBe(true);
    expect(nodos.filter((n) => n.estado === "activo")).toHaveLength(8);
  });

  it("toda lección que el sidebar muestra como activa/completada se puede abrir; solo las 'bloqueado' rebotan", async () => {
    for (const esPro of [false, true]) {
      const rng = prng(esPro ? 11 : 7);
      for (let ronda = 0; ronda < 40; ronda++) {
        const dominadas = new Set(FILAS.filter(() => rng() < 0.3).map((f) => f.id));
        const nodos = await obtenerCaminoCalculia(supabaseFalso(dominadas), "u1", esPro);
        const { tecnicas, clases } = partirCaminoPorClases(nodos);
        const unidades = [...construirUnidadesCalculia(tecnicas, NOMBRES, CTA), ...construirUnidadesCalculia(clases, NOMBRES, CTA)];
        const porIdNodo = porId(nodos);
        for (const u of unidades) {
          for (const n of u.nodos) {
            const real = porIdNodo.get(n.id)!;
            expect(n.estado, `${n.slug}: el sidebar y el camino real difieren`).toBe(real.estado);
            expect(puedeAbrirNodoCalculia(real), n.slug).toBe(n.estado !== "bloqueado");
          }
        }
        // invariantes: como mucho un activo por tema y pestaña; lo completado es exactamente lo dominado
        for (const lista of [tecnicas, clases]) {
          for (const g of ORDEN_GRUPOS_CALCULIA) expect(lista.filter((n) => n.grupo === g && n.estado === "activo").length).toBeLessThanOrEqual(1);
        }
        for (const n of nodos) expect(n.estado === "completado", n.slug).toBe(dominadas.has(n.id));
      }
    }
  });

  it("el CTA a Pro solo aparece en las Clases bloqueadas por plan (no en las de progresión) y nunca en las Técnicas", async () => {
    const nodos = await obtenerCaminoCalculia(supabaseFalso(new Set()), "u1", false);
    const { tecnicas, clases } = partirCaminoPorClases(nodos);
    for (const u of construirUnidadesCalculia(tecnicas, NOMBRES, CTA)) for (const n of u.nodos) expect(n.ctaPro).toBeUndefined();
    const conCta = construirUnidadesCalculia(clases, NOMBRES, CTA).flatMap((u) => u.nodos.filter((n) => n.ctaPro));
    expect(conCta).toHaveLength(6); // las 7 Clases menos la primera (preview gratis)
    const pro = await obtenerCaminoCalculia(supabaseFalso(new Set()), "u1", true);
    const sinCta = construirUnidadesCalculia(partirCaminoPorClases(pro).clases, NOMBRES, CTA).flatMap((u) => u.nodos.filter((n) => n.ctaPro));
    expect(sinCta).toHaveLength(0);
  });

  it("las unidades siguen el orden del currículo y cada una tiene el nombre de su tema", () => {
    const nodos = calcularCaminoCalculia(FILAS, new Set(), true);
    const { tecnicas } = partirCaminoPorClases(nodos);
    const unidades = construirUnidadesCalculia(tecnicas, NOMBRES, CTA);
    expect(unidades.map((u) => u.nombre)).toEqual(["Derivadas", "Integrales", "Series", "Multivariable y EDOs"]);
    expect(unidades.map((u) => u.nodos.length)).toEqual([1, 1, 1, 2]);
  });
});

describe("Calculia: las páginas usan el camino como única fuente", () => {
  const leer = (ruta: string) => fs.readFileSync(path.join(raiz, "src/app/[locale]/calculia", ruta), "utf8");

  it("aprender/page.tsx arma las unidades desde el camino (construirUnidadesCalculia) y ya no recalcula el estado con agruparNodos", () => {
    const pagina = leer("aprender/page.tsx");
    expect(pagina).toContain("construirUnidadesCalculia");
    expect(pagina).not.toContain("agruparNodos");
  });

  it("[slug]/page.tsx valida con puedeAbrirNodoCalculia (el mismo criterio que el sidebar)", () => {
    const pagina = leer("aprender/[slug]/page.tsx");
    expect(pagina).toContain("puedeAbrirNodoCalculia");
    expect(pagina).not.toContain('nodo.estado === "bloqueado"');
  });

  it("los nombres de los 4 temas existen en es y en (Calculia.aprender.grupos) y coinciden con bloques.ts", () => {
    for (const idioma of ["es", "en"] as const) {
      const grupos = messages(idioma).Calculia.aprender.grupos as Record<string, string>;
      for (const g of ORDEN_GRUPOS_CALCULIA) expect(grupos[g], `${idioma}.${g}`).toBe(NOMBRES_GRUPOS_CALCULIA[g][idioma]);
    }
  });
});
