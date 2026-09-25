import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calcularCaminoEstadistica,
  calcularNodosClases,
  calcularNodosTecnicas,
  grupoDeSlug,
  obtenerCaminoEstadistica,
  puedeAbrirNodoEstadistica,
  type FilaTechnique,
  type NodoCaminoEstadistica,
} from "./path";
import { TECNICAS_ESTADISTICA, CLASES_ESTADISTICA } from "./lecciones";
import { GRUPOS_APRENDER, agruparNodos } from "@/lib/aprender/grupos";
import { partirCaminoPorClases, hrefVolverAAprender } from "@/lib/aprender/clases";

// Desbloqueo de Aprender de Estadística: un puntero "activo" independiente POR
// TEMA (los grupos de GRUPOS_APRENDER.estadistica), en Técnicas y en Clases
// (pedido del usuario para todos los mundos: poder hacer las Técnicas y las
// Clases por tema, no solo empezando por la primera). Se testea sobre
// funciones puras y, para lo que valida [slug]/page.tsx, sobre
// obtenerCaminoEstadistica con un Supabase de mentira: la página vuelve a pedir
// el camino y redirige si el nodo está "bloqueado", así que el estado que ve el
// sidebar tiene que ser el de la FUENTE (bug real de Numeria, commit 648f2b7).

function filaDe(l: { slug: string; nombre: string; descripcion: string; orden: number; requierePro: boolean }): FilaTechnique {
  return { id: `id-${l.slug}`, slug: l.slug, nombre: l.nombre, descripcion: l.descripcion, contenido: { pasos: [] }, orden: l.orden, requiere_pro: l.requierePro };
}
// Filas "de la base" en un orden que NO es el del curso (el cargador tiene que ordenarlas).
const FILAS: FilaTechnique[] = [...TECNICAS_ESTADISTICA, ...CLASES_ESTADISTICA].map(filaDe).sort((a, b) => a.slug.localeCompare(b.slug));
const TEC_ORDENADAS = FILAS.filter((f) => !f.requiere_pro).sort((a, b) => a.orden - b.orden);
const CLA_ORDENADAS = FILAS.filter((f) => f.requiere_pro).sort((a, b) => a.orden - b.orden);
const TEC = TECNICAS_ESTADISTICA.map((t) => `id-${t.slug}`);
const CLA = CLASES_ESTADISTICA.map((c) => `id-${c.slug}`);
const id = (slug: string) => `id-${slug}`;

const T = {
  media: "estadistica-media-desde-una-media-provisoria",
  mediana: "estadistica-mediana-por-posicion",
  cuartiles: "estadistica-cuartiles-por-mitades",
  varianza: "estadistica-varianza-con-desvios",
  combinatoria: "estadistica-combinatoria-sin-factoriales-enormes",
};
const C = CLASES_ESTADISTICA.map((c) => c.slug);

const estados = (nodos: NodoCaminoEstadistica[]) => new Map(nodos.map((n) => [n.id, n]));
const GRUPOS_TEC = GRUPOS_APRENDER.estadistica.tecnicas.map((g) => g.id);
const GRUPOS_CLA = GRUPOS_APRENDER.estadistica.clases.map((g) => g.id);

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

describe("Estadística Técnicas: cada tema tiene su propio 'activo' independiente y es lineal dentro del tema", () => {
  it("los temas son 3 (central, dispersion, probabilidad) y con 0 dominadas la primera Técnica de CADA tema queda activa a la vez", () => {
    expect(GRUPOS_TEC).toEqual(["central", "dispersion", "probabilidad"]);
    const nodos = calcularNodosTecnicas(TEC_ORDENADAS, new Set());
    const porId = estados(nodos);
    expect(porId.get(id(T.media))!.estado).toBe("activo");
    expect(porId.get(id(T.mediana))!.estado).toBe("bloqueado");
    expect(porId.get(id(T.cuartiles))!.estado).toBe("activo");
    expect(porId.get(id(T.varianza))!.estado).toBe("bloqueado");
    expect(porId.get(id(T.combinatoria))!.estado).toBe("activo");
    expect(nodos.filter((n) => n.estado === "activo")).toHaveLength(3);
    expect(nodos.every((n) => !n.requierePro && !n.bloqueadoPorPlan)).toBe(true);
  });

  it("dentro de un tema es estrictamente lineal: completar la 1 activa la 2 de ESE tema y no toca los demás", () => {
    const porId = estados(calcularNodosTecnicas(TEC_ORDENADAS, new Set([id(T.media)])));
    expect(porId.get(id(T.media))!.estado).toBe("completado");
    expect(porId.get(id(T.mediana))!.estado).toBe("activo");
    expect(porId.get(id(T.cuartiles))!.estado).toBe("activo");
  });

  it("cada Técnica cae en su tema y un slug desconocido cae en «otras» (no se pierde ninguna fila)", () => {
    expect(grupoDeSlug(T.media, "tecnicas")).toBe("central");
    expect(grupoDeSlug(T.varianza, "tecnicas")).toBe("dispersion");
    expect(grupoDeSlug(T.combinatoria, "tecnicas")).toBe("probabilidad");
    expect(grupoDeSlug("slug-que-no-existe", "tecnicas")).toBe("otras");
  });
});

describe("Estadística Clases: un puntero activo por tema, lineal dentro del tema, primera gratis, resto Pro", () => {
  it("los temas de Clases son 4 y cubren las 8 Clases en orden", () => {
    expect(GRUPOS_CLA).toEqual(["datos-central", "dispersion", "probabilidad", "analisis"]);
    expect(CLA_ORDENADAS.map((f) => f.slug)).toEqual(C);
  });

  it("usuario sin Pro, 0 dominadas: solo la Clase 1 (preview gratis) está activa; el resto bloqueadoPorPlan", () => {
    const nodos = calcularNodosClases(CLA_ORDENADAS, new Set(), false);
    expect(nodos[0].estado).toBe("activo");
    expect(nodos[0].bloqueadoPorPlan).toBe(false);
    for (const n of nodos.slice(1)) {
      expect(n.estado, n.slug).toBe("bloqueado");
      expect(n.bloqueadoPorPlan, n.slug).toBe(true);
    }
  });

  it("usuario sin Pro con la Clase 1 completada: la 2 sigue bloqueada por el plan (no se abre sola)", () => {
    const nodos = calcularNodosClases(CLA_ORDENADAS, new Set([CLA[0]]), false);
    expect(nodos[0].estado).toBe("completado");
    expect(nodos[1].estado).toBe("bloqueado");
    expect(nodos[1].bloqueadoPorPlan).toBe(true);
    expect(nodos.filter((n) => n.estado === "activo")).toHaveLength(0);
  });

  it("[pedido del usuario] usuario Pro: la primera Clase de CADA tema queda activa a la vez, sin haber hecho la Clase 1", () => {
    const nodos = calcularNodosClases(CLA_ORDENADAS, new Set(), true);
    expect(nodos.filter((n) => n.estado === "activo").map((n) => n.slug)).toEqual([C[0], C[2], C[3], C[5]]); // Clases 1, 3, 4 y 6
    expect(nodos.filter((n) => n.estado === "activo").map((n) => n.grupo)).toEqual(GRUPOS_CLA);
    expect(nodos.every((n) => !n.bloqueadoPorPlan)).toBe(true);
    // Se puede empezar por «Análisis» (Clase 6) sin haber hecho nada antes.
    expect(estados(nodos).get(id(C[5]))!.estado).toBe("activo");
    expect(estados(nodos).get(id(C[6]))!.estado).toBe("bloqueado");
  });

  it("el orden es lineal DENTRO de un tema pero un tema no depende de otro", () => {
    // Completar la Clase 6 abre la 7 (mismo tema) y no cambia los otros temas.
    const tras6 = estados(calcularNodosClases(CLA_ORDENADAS, new Set([id(C[5])]), true));
    expect(tras6.get(id(C[6]))!.estado).toBe("activo");
    expect(tras6.get(id(C[7]))!.estado).toBe("bloqueado");
    expect(tras6.get(id(C[0]))!.estado).toBe("activo");
    expect(tras6.get(id(C[2]))!.estado).toBe("activo");
    // Saltear: solo la 2 completada (sin la 1): la 1 sigue siendo la activa del tema.
    const salteada = estados(calcularNodosClases(CLA_ORDENADAS, new Set([id(C[1])]), true));
    expect(salteada.get(id(C[0]))!.estado).toBe("activo");
  });

  it("propiedades sobre 400 combinaciones al azar de progreso: nunca más de una Clase ni una Técnica activa por tema; un usuario Pro siempre tiene una Clase abierta por cada tema con Clases pendientes", () => {
    const azar = prng(2026);
    for (let i = 0; i < 400; i++) {
      const dominadas = new Set([...TEC, ...CLA].filter(() => azar() < 0.4));
      const esPro = azar() < 0.5;
      const nodos = calcularCaminoEstadistica(FILAS, dominadas, esPro);
      const clases = nodos.filter((n) => n.requierePro);
      const tecnicas = nodos.filter((n) => !n.requierePro);
      for (const g of GRUPOS_TEC) expect(tecnicas.filter((n) => n.grupo === g && n.estado === "activo").length, `iteración ${i} técnicas ${g}`).toBeLessThanOrEqual(1);
      for (const g of GRUPOS_TEC) {
        const delGrupo = tecnicas.filter((n) => n.grupo === g);
        if (delGrupo.some((n) => n.estado !== "completado")) expect(delGrupo.filter((n) => n.estado === "activo").length, `iteración ${i} técnicas ${g}: sin Técnica abierta`).toBe(1);
      }
      for (const g of GRUPOS_CLA) {
        const delGrupo = clases.filter((n) => n.grupo === g);
        expect(delGrupo.filter((n) => n.estado === "activo").length, `iteración ${i} clases ${g}`).toBeLessThanOrEqual(1);
        if (esPro && delGrupo.some((n) => n.estado !== "completado")) {
          expect(delGrupo.filter((n) => n.estado === "activo").length, `iteración ${i} ${g}: Pro sin Clase abierta`).toBe(1);
        }
      }
      for (const n of nodos) {
        expect(n.estado === "completado", n.slug).toBe(dominadas.has(n.id));
        if (n.bloqueadoPorPlan) expect(!esPro && n.requierePro && n.estado === "bloqueado", n.slug).toBe(true);
      }
      if (!esPro) for (const n of clases.slice(1)) expect(n.estado === "activo", n.slug).toBe(false);
    }
  });
});

describe("Estadística: el estado del sidebar es el de la fuente y coincide con lo que permite [slug]/page.tsx", () => {
  it("[bug Numeria 648f2b7] la primera Técnica de CADA tema llega 'activo' desde el camino real y la página la deja abrir", async () => {
    const nodos = await obtenerCaminoEstadistica(supabaseFalso(new Set()), "u1", false);
    for (const slug of [T.media, T.cuartiles, T.combinatoria]) {
      const n = nodos.find((x) => x.slug === slug)!;
      expect(n.estado, slug).toBe("activo");
      expect(puedeAbrirNodoEstadistica(n), `${slug}: la página no debe redirigir`).toBe(true);
    }
  });

  it("para 60 progresos al azar y ambos planes, agruparNodos (sidebar) muestra el estado de la fuente y la página abre un nodo si y solo si no está bloqueado", async () => {
    const azar = prng(7);
    for (let i = 0; i < 60; i++) {
      const dominadas = new Set([...TEC, ...CLA].filter(() => azar() < 0.35));
      const esPro = azar() < 0.5;
      const nodos = await obtenerCaminoEstadistica(supabaseFalso(dominadas), "u1", esPro);
      const { tecnicas, clases } = partirCaminoPorClases(nodos);
      for (const [lista, pestana] of [
        [tecnicas, "tecnicas"],
        [clases, "clases"],
      ] as const) {
        const grupos = agruparNodos(lista, "estadistica", pestana, "es");
        const enSidebar = new Map(grupos.flatMap((g) => g.nodos).map((n) => [n.slug, n]));
        expect(enSidebar.size).toBe(lista.length);
        for (const nodo of lista) {
          const s = enSidebar.get(nodo.slug)!;
          expect(s.estado, `${nodo.slug} (esPro=${esPro})`).toBe(nodo.estado);
          expect(puedeAbrirNodoEstadistica(nodo), `${nodo.slug}: página vs sidebar`).toBe(s.estado !== "bloqueado");
        }
      }
    }
  });

  it("el nodo ACTIVO del sidebar siempre es entrable, y un usuario sin Pro que entra por URL a una Clase 2+ es redirigido a la pestaña Clases", async () => {
    for (const esPro of [false, true]) {
      const nodos = await obtenerCaminoEstadistica(supabaseFalso(new Set()), "u1", esPro);
      for (const n of nodos.filter((x) => x.estado === "activo")) expect(puedeAbrirNodoEstadistica(n), n.slug).toBe(true);
    }
    const nodos = await obtenerCaminoEstadistica(supabaseFalso(new Set()), "u1", false);
    const clase2 = nodos.find((n) => n.slug === C[1])!;
    expect(puedeAbrirNodoEstadistica(clase2)).toBe(false);
    expect(hrefVolverAAprender("/estadistica/aprender", clase2.requierePro)).toBe("/estadistica/aprender?tab=clases");
    const tecnica2 = nodos.find((n) => n.slug === T.mediana)!;
    expect(puedeAbrirNodoEstadistica(tecnica2)).toBe(false);
    expect(hrefVolverAAprender("/estadistica/aprender", tecnica2.requierePro)).toBe("/estadistica/aprender");
  });

  it("el cargador devuelve [...Técnicas, ...Clases] en el orden de la base (orden 1-13) aunque las filas lleguen mezcladas", async () => {
    const nodos = await obtenerCaminoEstadistica(supabaseFalso(new Set()), "u1", true);
    expect(nodos.map((n) => n.slug)).toEqual([...TECNICAS_ESTADISTICA.map((t) => t.slug), ...CLASES_ESTADISTICA.map((c) => c.slug)]);
  });
});
