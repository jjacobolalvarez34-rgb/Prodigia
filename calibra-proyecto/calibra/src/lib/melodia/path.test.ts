import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  calcularNodos,
  grupoDeSlug,
  obtenerCaminoMelodia,
  ordenarPorGrupoYOrden,
  puedeAbrirNodoMelodia,
  ORDEN_GRUPOS_MELODIA,
  type FilaTechnique,
  type NodoCaminoMelodia,
} from "./path";
import { NOMBRES_GRUPOS_MELODIA, CLAVE_MODO_I18N } from "./grupos";
import { MODOS_MELODIA } from "@/lib/practica/melodia";
import { TECNICAS_MELODIA, CLASES_MELODIA } from "./lecciones";
import { GRUPOS_APRENDER, agruparNodos } from "@/lib/aprender/grupos";
import { partirCaminoPorClases } from "@/lib/aprender/clases";

// Desbloqueo por grupo de Melodía (Técnicas | Clases, 2026-09-23). Mismo
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
    ...TECNICAS_MELODIA.map((t) => fila(`id:${t.slug}`, t.slug, t.orden, false)),
    ...CLASES_MELODIA.map((c) => fila(`id:${c.slug}`, c.slug, c.orden, true)),
  ];
}

function camino(dominadas: string[], esPro: boolean): NodoCaminoMelodia[] {
  const todas = filasReales();
  const ids = new Set(dominadas.map((s) => `id:${s}`));
  const rapidas = ordenarPorGrupoYOrden(todas.filter((f) => !f.requiere_pro));
  const clases = ordenarPorGrupoYOrden(todas.filter((f) => f.requiere_pro));
  return [...calcularNodos(rapidas, ids, false, esPro, undefined), ...calcularNodos(clases, ids, true, esPro, clases[0]?.id)];
}

describe("Melodía: grupos y contenido tipado", () => {
  it("ORDEN_GRUPOS_MELODIA: los 6 modos de la práctica (MODOS_MELODIA), en el mismo orden, sin duplicados", () => {
    expect([...ORDEN_GRUPOS_MELODIA]).toEqual([...MODOS_MELODIA]);
    expect(ORDEN_GRUPOS_MELODIA).toEqual(["fundamentos", "lectura", "alteraciones", "escalas", "acordes", "oido_absoluto"]);
  });

  it("cada lección mapea al grupo que declara (una sola fuente de verdad: el contenido tipado)", () => {
    for (const l of [...TECNICAS_MELODIA, ...CLASES_MELODIA]) expect(grupoDeSlug(l.slug), l.slug).toBe(l.grupo);
  });

  it("orden correlativo 1..N dentro de cada grupo, en Técnicas y en Clases", () => {
    for (const g of ORDEN_GRUPOS_MELODIA) {
      const t = TECNICAS_MELODIA.filter((x) => x.grupo === g).map((x) => x.orden);
      const c = CLASES_MELODIA.filter((x) => x.grupo === g).map((x) => x.orden);
      expect(t, `técnicas ${g}`).toEqual(Array.from({ length: t.length }, (_, i) => i + 1));
      expect(c, `clases ${g}`).toEqual(Array.from({ length: c.length }, (_, i) => i + 1));
    }
  });

  it("los nombres del sidebar coinciden con Melodia.home.modos de messages es/en", () => {
    const raiz = path.resolve(__dirname, "../../..");
    for (const idioma of ["es", "en"] as const) {
      const modos = JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8")).Melodia.home.modos;
      for (const g of ORDEN_GRUPOS_MELODIA) expect(NOMBRES_GRUPOS_MELODIA[g][idioma], `${idioma} ${g}`).toBe(modos[CLAVE_MODO_I18N[g]]);
    }
  });

  it("GRUPOS_APRENDER.melodia deriva del contenido tipado (mismos slugs, mismo orden)", () => {
    const e = GRUPOS_APRENDER.melodia;
    expect(e.tecnicas.flatMap((g) => g.slugs)).toEqual(TECNICAS_MELODIA.map((t) => t.slug));
    expect(e.clases.flatMap((g) => g.slugs)).toEqual(CLASES_MELODIA.map((c) => c.slug));
  });
});

describe("Melodía Técnicas: cada grupo tiene su propio 'activo' independiente", () => {
  it("con 0 dominadas, la primera técnica de CADA grupo queda activa a la vez", () => {
    const nodos = camino([], false).filter((n) => !n.requierePro);
    for (const g of ORDEN_GRUPOS_MELODIA) {
      const delGrupo = nodos.filter((n) => n.grupo === g);
      expect(delGrupo[0].estado, `${g}: la primera debe estar activa`).toBe("activo");
      expect(delGrupo.slice(1).every((n) => n.estado === "bloqueado"), `${g}: el resto bloqueado`).toBe(true);
      expect(delGrupo.filter((n) => n.estado === "activo")).toHaveLength(1);
    }
  });

  it("dentro de un mismo grupo es estrictamente lineal (completar la 1 activa la 2, y solo la 2)", () => {
    const lecturas = TECNICAS_MELODIA.filter((t) => t.grupo === "lectura");
    const nodos = camino([lecturas[0].slug], false).filter((n) => n.grupo === "lectura" && !n.requierePro);
    expect(nodos[0].estado).toBe("completado");
    expect(nodos[1].estado).toBe("activo");
    expect(nodos.slice(2).every((n) => n.estado === "bloqueado")).toBe(true);
  });

  it("completar todo un grupo no afecta el progreso de otro", () => {
    const fundamentales = TECNICAS_MELODIA.filter((t) => t.grupo === "fundamentos").map((t) => t.slug);
    const nodos = camino(fundamentales, false).filter((n) => !n.requierePro);
    expect(nodos.filter((n) => n.grupo === "fundamentos").every((n) => n.estado === "completado")).toBe(true);
    for (const g of ["lectura", "alteraciones", "escalas", "acordes", "oido_absoluto"] as const) {
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
      fila("o1", "melodia-oido-ancla-la-440", 1),
      fila("a1", "melodia-triada-fundamental-3-5", 1),
      fila("f1", "melodia-cifrado-americano", 5),
      fila("l1", "melodia-lineas-y-espacios", 1),
    ];
    expect(ordenarPorGrupoYOrden(mezcladas).map((f) => f.id)).toEqual(["f1", "l1", "a1", "o1"]);
  });
});

describe("Melodía Clases: gating Pro + un curso independiente por grupo", () => {
  it("usuario no-Pro: solo la primera Clase de todas (el sonido y la nota) queda activa; las 'primeras de su grupo' quedan bloqueadoPorPlan", () => {
    const clases = camino([], false).filter((n) => n.requierePro);
    const activas = clases.filter((n) => n.estado === "activo");
    expect(activas.map((n) => n.slug)).toEqual(["melodia-clase-sonido-y-nota"]);
    expect(activas[0].bloqueadoPorPlan).toBe(false);
    for (const g of ["lectura", "alteraciones", "escalas", "acordes", "oido_absoluto"] as const) {
      const primera = clases.find((n) => n.grupo === g)!;
      expect(primera.estado).toBe("bloqueado");
      expect(primera.bloqueadoPorPlan).toBe(true);
    }
  });

  it("usuario Pro: la primera Clase de CADA grupo queda activa a la vez; dentro del grupo es lineal", () => {
    const clases = camino([], true).filter((n) => n.requierePro);
    for (const g of ORDEN_GRUPOS_MELODIA) {
      const delGrupo = clases.filter((n) => n.grupo === g);
      expect(delGrupo[0].estado, g).toBe("activo");
      expect(delGrupo[0].bloqueadoPorPlan).toBe(false);
      expect(delGrupo.slice(1).every((n) => n.estado === "bloqueado" && !n.bloqueadoPorPlan), g).toBe(true);
    }
  });

  it("no-Pro con la preview completada: la 2ª clase del grupo de fundamentos sigue bloqueada por progresión, no se abre sola por plan", () => {
    const nodos = camino(["melodia-clase-sonido-y-nota"], false).filter((n) => n.requierePro && n.grupo === "fundamentos");
    expect(nodos[0].estado).toBe("completado");
    // Es la siguiente en su curso, pero es requierePro y NO es la preview: bloqueada por plan.
    expect(nodos[1].estado).toBe("bloqueado");
    expect(nodos[1].bloqueadoPorPlan).toBe(true);
  });

  it("Pro: al completar la 1ª clase del grupo, la 2ª pasa a activa", () => {
    const nodos = camino(["melodia-clase-sonido-y-nota"], true).filter((n) => n.requierePro && n.grupo === "fundamentos");
    expect(nodos[1].estado).toBe("activo");
    expect(nodos[2].estado).toBe("bloqueado");
  });

  it("las Técnicas y las Clases tienen progresiones independientes (completar Técnicas no abre Clases)", () => {
    const todasTecnicas = TECNICAS_MELODIA.map((t) => t.slug);
    const nodos = camino(todasTecnicas, false).filter((n) => n.requierePro);
    expect(nodos.filter((n) => n.estado === "activo").map((n) => n.slug)).toEqual(["melodia-clase-sonido-y-nota"]);
  });
});

describe("Melodía: el nodo activo es entrable (bug de Numeria 648f2b7)", () => {
  it("todo nodo 'activo' o 'completado' se puede abrir; solo el 'bloqueado' redirige (puedeAbrirNodoMelodia)", () => {
    for (const esPro of [false, true]) {
      const nodos = camino([], esPro);
      for (const n of nodos) expect(puedeAbrirNodoMelodia(n), `${n.slug} (${n.estado})`).toBe(n.estado !== "bloqueado");
      const activos = nodos.filter((n) => n.estado === "activo");
      expect(activos.length).toBeGreaterThan(0);
      for (const a of activos) expect(puedeAbrirNodoMelodia(a), a.slug).toBe(true);
    }
  });

  it("la primera técnica de cada uno de los 6 grupos se puede abrir por URL directa", () => {
    const nodos = camino([], false);
    for (const g of ORDEN_GRUPOS_MELODIA) {
      const primera = nodos.find((n) => !n.requierePro && n.grupo === g)!;
      expect(puedeAbrirNodoMelodia(primera), g).toBe(true);
    }
  });

  it("el estado que ve el sidebar (nodos del grupo) es exactamente el que valida la página: mismo cálculo, sin capa de presentación aparte", () => {
    const nodos = camino([], false).filter((n) => !n.requierePro);
    // Lo que hace agruparNodos (sidebar de otros mundos) recalcularía el
    // estado por grupo: para Melodía coincide con la fuente.
    const g = agruparNodos(nodos, "melodia", "tecnicas", "es");
    for (const grupo of g) {
      for (const n of grupo.nodos) {
        const real = nodos.find((x) => x.slug === n.slug)!;
        expect(n.estado, n.slug).toBe(real.estado);
      }
    }
  });
});

describe("Melodía: obtenerCaminoMelodia (con Supabase simulado)", () => {
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
    const nodos = await obtenerCaminoMelodia(cliente as never, "u1", false);
    expect(nodos).toHaveLength(TECNICAS_MELODIA.length + CLASES_MELODIA.length);
    const { tecnicas, clases, hayClases } = partirCaminoPorClases(nodos);
    expect(tecnicas).toHaveLength(TECNICAS_MELODIA.length);
    expect(clases).toHaveLength(CLASES_MELODIA.length);
    expect(hayClases).toBe(true);
  });

  it("con progreso real: lo dominado aparece 'completado' y desbloquea la siguiente de su grupo", async () => {
    const { cliente, filas } = supabaseFalso([]);
    const primera = filas.find((f) => f.slug === TECNICAS_MELODIA.find((t) => t.grupo === "oido_absoluto" && t.orden === 1)!.slug)!;
    const { cliente: c2 } = supabaseFalso([primera.id]);
    const nodos = await obtenerCaminoMelodia(c2 as never, "u1", false);
    const deOido = nodos.filter((n) => !n.requierePro && n.grupo === "oido_absoluto");
    expect(deOido[0].estado).toBe("completado");
    expect(deOido[1].estado).toBe("activo");
    // Y con 0 progreso sigue habiendo un activo por grupo (sin `primera` dominada).
    const sin = await obtenerCaminoMelodia(cliente as never, "u1", false);
    expect(sin.filter((n) => !n.requierePro && n.estado === "activo")).toHaveLength(6);
  });
});
