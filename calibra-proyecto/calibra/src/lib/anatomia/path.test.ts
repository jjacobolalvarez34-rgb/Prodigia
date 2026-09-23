import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  calcularNodos,
  grupoDeSlug,
  obtenerCaminoAnatomia,
  ordenarPorGrupoYOrden,
  puedeAbrirNodoAnatomia,
  ORDEN_GRUPOS_ANATOMIA,
  type FilaTechnique,
  type NodoCaminoAnatomia,
} from "./path";
import { NOMBRES_GRUPOS_ANATOMIA } from "./grupos";
import { TECNICAS_ANATOMIA, CLASES_ANATOMIA } from "./lecciones";
import { GRUPOS_APRENDER, agruparNodos } from "@/lib/aprender/grupos";
import { partirCaminoPorClases } from "@/lib/aprender/clases";

// Desbloqueo por sistema de Anatomía (Técnicas | Clases, 2026-09-23). Mismo
// tipo de test que src/lib/geografia/path.test.ts, más el bug real de
// Numeria (commit 648f2b7): [slug]/page.tsx vuelve a pedir el camino y
// redirige si el nodo está "bloqueado", así que el estado se calcula en la
// FUENTE y el test fija que el nodo activo del sidebar es entrable.

function fila(id: string, slug: string, orden: number, requierePro = false): FilaTechnique {
  return { id, slug, nombre: slug, descripcion: null, contenido: {}, orden, requiere_pro: requierePro };
}

// Todas las filas reales (Técnicas y Clases), con ids sintéticos "id:<slug>".
function filasReales(): FilaTechnique[] {
  return [
    ...TECNICAS_ANATOMIA.map((t) => fila(`id:${t.slug}`, t.slug, t.orden, false)),
    ...CLASES_ANATOMIA.map((c) => fila(`id:${c.slug}`, c.slug, c.orden, true)),
  ];
}

function camino(dominadas: string[], esPro: boolean): NodoCaminoAnatomia[] {
  const todas = filasReales();
  const ids = new Set(dominadas.map((s) => `id:${s}`));
  const rapidas = ordenarPorGrupoYOrden(todas.filter((f) => !f.requiere_pro));
  const clases = ordenarPorGrupoYOrden(todas.filter((f) => f.requiere_pro));
  return [...calcularNodos(rapidas, ids, false, esPro, undefined), ...calcularNodos(clases, ids, true, esPro, clases[0]?.id)];
}

describe("Anatomía: grupos y contenido tipado", () => {
  it("ORDEN_GRUPOS_ANATOMIA: los 4 sistemas de la práctica, sin duplicados", () => {
    expect(ORDEN_GRUPOS_ANATOMIA).toEqual(["oseo", "muscular", "organos", "nervioso"]);
  });

  it("cada lección mapea al grupo que declara (una sola fuente de verdad: el contenido tipado)", () => {
    for (const l of [...TECNICAS_ANATOMIA, ...CLASES_ANATOMIA]) expect(grupoDeSlug(l.slug), l.slug).toBe(l.grupo);
  });

  it("orden correlativo 1..N dentro de cada grupo, en Técnicas y en Clases", () => {
    for (const g of ORDEN_GRUPOS_ANATOMIA) {
      const t = TECNICAS_ANATOMIA.filter((x) => x.grupo === g).map((x) => x.orden);
      const c = CLASES_ANATOMIA.filter((x) => x.grupo === g).map((x) => x.orden);
      expect(t, `técnicas ${g}`).toEqual(Array.from({ length: t.length }, (_, i) => i + 1));
      expect(c, `clases ${g}`).toEqual(Array.from({ length: c.length }, (_, i) => i + 1));
    }
  });

  it("los nombres del sidebar coinciden con Anatomia.elegir.modos de messages es/en", () => {
    const raiz = path.resolve(__dirname, "../../..");
    for (const idioma of ["es", "en"] as const) {
      const modos = JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8")).Anatomia.elegir.modos;
      for (const g of ORDEN_GRUPOS_ANATOMIA) expect(NOMBRES_GRUPOS_ANATOMIA[g][idioma], `${idioma} ${g}`).toBe(modos[g]);
    }
  });

  it("GRUPOS_APRENDER.anatomia deriva del contenido tipado (mismos slugs, mismo orden)", () => {
    const e = GRUPOS_APRENDER.anatomia;
    expect(e.tecnicas.flatMap((g) => g.slugs)).toEqual(TECNICAS_ANATOMIA.map((t) => t.slug));
    expect(e.clases.flatMap((g) => g.slugs)).toEqual(CLASES_ANATOMIA.map((c) => c.slug));
  });
});

describe("Anatomía Técnicas: cada sistema tiene su propio 'activo' independiente", () => {
  it("con 0 dominadas, la primera técnica de CADA grupo queda activa a la vez", () => {
    const nodos = camino([], false).filter((n) => !n.requierePro);
    for (const g of ORDEN_GRUPOS_ANATOMIA) {
      const delGrupo = nodos.filter((n) => n.grupo === g);
      expect(delGrupo[0].estado, `${g}: la primera debe estar activa`).toBe("activo");
      expect(delGrupo.slice(1).every((n) => n.estado === "bloqueado"), `${g}: el resto bloqueado`).toBe(true);
      expect(delGrupo.filter((n) => n.estado === "activo")).toHaveLength(1);
    }
  });

  it("dentro de un mismo grupo es estrictamente lineal (completar la 1 activa la 2, y solo la 2)", () => {
    const musculares = TECNICAS_ANATOMIA.filter((t) => t.grupo === "muscular");
    const nodos = camino([musculares[0].slug], false).filter((n) => n.grupo === "muscular" && !n.requierePro);
    expect(nodos[0].estado).toBe("completado");
    expect(nodos[1].estado).toBe("activo");
    expect(nodos.slice(2).every((n) => n.estado === "bloqueado")).toBe(true);
  });

  it("completar todo un sistema no afecta el progreso de otro", () => {
    const oseas = TECNICAS_ANATOMIA.filter((t) => t.grupo === "oseo").map((t) => t.slug);
    const nodos = camino(oseas, false).filter((n) => !n.requierePro);
    expect(nodos.filter((n) => n.grupo === "oseo").every((n) => n.estado === "completado")).toBe(true);
    for (const g of ["muscular", "organos", "nervioso"] as const) {
      expect(nodos.find((n) => n.grupo === g)!.estado, g).toBe("activo");
    }
  });

  it("las Técnicas nunca dependen del plan", () => {
    const libre = camino([], false).filter((n) => !n.requierePro);
    const pro = camino([], true).filter((n) => !n.requierePro);
    expect(libre.map((n) => n.estado)).toEqual(pro.map((n) => n.estado));
    expect(libre.some((n) => n.bloqueadoPorPlan)).toBe(false);
  });

  it("ordenarPorGrupoYOrden respeta el orden de grupos aunque las filas lleguen mezcladas y con `orden` repetido entre grupos", () => {
    const mezcladas = [
      fila("n1", "anatomia-arco-reflejo", 5),
      fila("o1", "anatomia-craneo-por-zona", 1),
      fila("m1", "anatomia-simple-a-compuesto", 1),
      fila("g1", "anatomia-organos-por-cavidad", 1),
    ];
    expect(ordenarPorGrupoYOrden(mezcladas).map((f) => f.id)).toEqual(["o1", "m1", "g1", "n1"]);
  });
});

describe("Anatomía Clases: gating Pro + un curso independiente por sistema", () => {
  it("usuario no-Pro: solo la primera Clase de todas (posición anatómica y planos) queda activa; las 'primeras de su sistema' quedan bloqueadoPorPlan", () => {
    const clases = camino([], false).filter((n) => n.requierePro);
    const activas = clases.filter((n) => n.estado === "activo");
    expect(activas.map((n) => n.slug)).toEqual(["anatomia-clase-posicion-y-planos"]);
    expect(activas[0].bloqueadoPorPlan).toBe(false);
    for (const g of ["muscular", "organos", "nervioso"] as const) {
      const primera = clases.find((n) => n.grupo === g)!;
      expect(primera.estado).toBe("bloqueado");
      expect(primera.bloqueadoPorPlan).toBe(true);
    }
  });

  it("usuario Pro: la primera Clase de CADA sistema queda activa a la vez; dentro del sistema es lineal", () => {
    const clases = camino([], true).filter((n) => n.requierePro);
    for (const g of ORDEN_GRUPOS_ANATOMIA) {
      const delGrupo = clases.filter((n) => n.grupo === g);
      expect(delGrupo[0].estado, g).toBe("activo");
      expect(delGrupo[0].bloqueadoPorPlan).toBe(false);
      expect(delGrupo.slice(1).every((n) => n.estado === "bloqueado" && !n.bloqueadoPorPlan), g).toBe(true);
    }
  });

  it("no-Pro con la preview completada: la 2ª clase del sistema óseo sigue bloqueada por progresión, no se abre sola por plan", () => {
    const nodos = camino(["anatomia-clase-posicion-y-planos"], false).filter((n) => n.requierePro && n.grupo === "oseo");
    expect(nodos[0].estado).toBe("completado");
    // Es la siguiente en su curso, pero es requierePro y NO es la preview: bloqueada por plan.
    expect(nodos[1].estado).toBe("bloqueado");
    expect(nodos[1].bloqueadoPorPlan).toBe(true);
  });

  it("Pro: al completar la 1ª clase del sistema, la 2ª pasa a activa", () => {
    const nodos = camino(["anatomia-clase-posicion-y-planos"], true).filter((n) => n.requierePro && n.grupo === "oseo");
    expect(nodos[1].estado).toBe("activo");
    expect(nodos[2].estado).toBe("bloqueado");
  });

  it("las Técnicas y las Clases tienen progresiones independientes (completar Técnicas no abre Clases)", () => {
    const todasTecnicas = TECNICAS_ANATOMIA.map((t) => t.slug);
    const nodos = camino(todasTecnicas, false).filter((n) => n.requierePro);
    expect(nodos.filter((n) => n.estado === "activo").map((n) => n.slug)).toEqual(["anatomia-clase-posicion-y-planos"]);
  });
});

describe("Anatomía: el nodo activo es entrable (bug de Numeria 648f2b7)", () => {
  it("todo nodo 'activo' o 'completado' se puede abrir; solo el 'bloqueado' redirige (puedeAbrirNodoAnatomia)", () => {
    for (const esPro of [false, true]) {
      const nodos = camino([], esPro);
      for (const n of nodos) expect(puedeAbrirNodoAnatomia(n), `${n.slug} (${n.estado})`).toBe(n.estado !== "bloqueado");
      const activos = nodos.filter((n) => n.estado === "activo");
      expect(activos.length).toBeGreaterThan(0);
      for (const a of activos) expect(puedeAbrirNodoAnatomia(a), a.slug).toBe(true);
    }
  });

  it("la primera técnica de cada uno de los 4 grupos se puede abrir por URL directa", () => {
    const nodos = camino([], false);
    for (const g of ORDEN_GRUPOS_ANATOMIA) {
      const primera = nodos.find((n) => !n.requierePro && n.grupo === g)!;
      expect(puedeAbrirNodoAnatomia(primera), g).toBe(true);
    }
  });

  it("el estado que ve el sidebar (nodos del grupo) es exactamente el que valida la página: mismo cálculo, sin capa de presentación aparte", () => {
    const nodos = camino([], false).filter((n) => !n.requierePro);
    // Lo que hace agruparNodos (sidebar de otros mundos) recalcularía el
    // estado por grupo: para Anatomía coincide con la fuente.
    const g = agruparNodos(nodos, "anatomia", "tecnicas", "es");
    for (const grupo of g) {
      for (const n of grupo.nodos) {
        const real = nodos.find((x) => x.slug === n.slug)!;
        expect(n.estado, n.slug).toBe(real.estado);
      }
    }
  });
});

describe("Anatomía: obtenerCaminoAnatomia (con Supabase simulado)", () => {
  function supabaseFalso(dominadasIds: string[]) {
    const filas = filasReales().map((f, i) => ({ ...f, contenido: { pasos: ["p"] }, id: `uuid-${i}-${f.slug}` }));
    return {
      filas,
      cliente: {
        from(tabla: string) {
          if (tabla === "techniques") {
            const cadena = {
              select: () => cadena,
              eq: () => cadena,
              order: () => Promise.resolve({ data: filas.slice().sort((a, b) => a.orden - b.orden) }),
            };
            return cadena;
          }
          return {
            select: () => ({
              eq: () => Promise.resolve({ data: dominadasIds.map((id) => ({ technique_id: id, dominado: true })) }),
            }),
          };
        },
      },
    };
  }

  it("devuelve [...técnicas, ...clases] y separa bien las pestañas", async () => {
    const { cliente } = supabaseFalso([]);
    const nodos = await obtenerCaminoAnatomia(cliente as never, "u1", false);
    expect(nodos).toHaveLength(TECNICAS_ANATOMIA.length + CLASES_ANATOMIA.length);
    const { tecnicas, clases, hayClases } = partirCaminoPorClases(nodos);
    expect(tecnicas).toHaveLength(TECNICAS_ANATOMIA.length);
    expect(clases).toHaveLength(CLASES_ANATOMIA.length);
    expect(hayClases).toBe(true);
  });

  it("con progreso real: lo dominado aparece 'completado' y desbloquea la siguiente de su grupo", async () => {
    const { cliente, filas } = supabaseFalso([]);
    const primera = filas.find((f) => f.slug === TECNICAS_ANATOMIA.find((t) => t.grupo === "nervioso" && t.orden === 1)!.slug)!;
    const { cliente: c2 } = supabaseFalso([primera.id]);
    const nodos = await obtenerCaminoAnatomia(c2 as never, "u1", false);
    const nerviosas = nodos.filter((n) => !n.requierePro && n.grupo === "nervioso");
    expect(nerviosas[0].estado).toBe("completado");
    expect(nerviosas[1].estado).toBe("activo");
    // Y con 0 progreso sigue habiendo un activo por grupo (sin `primera` dominada).
    const sin = await obtenerCaminoAnatomia(cliente as never, "u1", false);
    expect(sin.filter((n) => !n.requierePro && n.estado === "activo")).toHaveLength(4);
  });
});
