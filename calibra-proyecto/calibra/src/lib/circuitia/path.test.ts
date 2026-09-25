import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calcularCaminoCircuitia,
  calcularNodosClases,
  calcularNodosTecnicas,
  construirUnidadesCircuitia,
  obtenerCaminoCircuitia,
  ordenarPorGrupoYOrden,
  puedeAbrirNodoCircuitia,
  type FilaTechnique,
  type NodoCaminoCircuitia,
} from "./path";
import { GRUPOS_CIRCUITIA, grupoDeSlug } from "./grupos";
import { TECNICAS, CLASES } from "./lecciones";
import { GRUPOS_APRENDER, agruparNodos } from "@/lib/aprender/grupos";
import { partirCaminoPorClases, hrefVolverAAprender } from "@/lib/aprender/clases";

// Desbloqueo de Aprender de Circuitia, POR TEMA en las dos pestañas (pedido del
// usuario para todos los mundos): la primera lección de cada tema está abierta
// a la vez, lineal dentro del tema, y las Clases NO son un curso lineal único.
// Se testea sobre funciones puras y, para lo que valida [slug]/page.tsx, sobre
// obtenerCaminoCircuitia con un Supabase de mentira: la página vuelve a pedir el
// camino y redirige si el nodo está "bloqueado", así que el estado que ve el
// sidebar tiene que ser el de la FUENTE (bug real de Numeria, commit 648f2b7).
// Mismo patrón que src/lib/historia/path.test.ts y src/lib/quimia/path.test.ts.

function filaDe(l: { slug: string; orden: number; requierePro: boolean }): FilaTechnique {
  return { id: `id-${l.slug}`, slug: l.slug, nombre: l.slug, descripcion: "d", contenido: { pasos: [] }, orden: l.orden, requiere_pro: l.requierePro };
}
// Filas "de la base" en un orden que NO es el del curso (el cargador tiene que ordenarlas).
const FILAS: FilaTechnique[] = [...TECNICAS, ...CLASES].map(filaDe).sort((a, b) => a.slug.localeCompare(b.slug));
const TEC = TECNICAS.map((t) => `id-${t.slug}`);
const CLA = CLASES.map((c) => `id-${c.slug}`);
const idT = (slug: string) => `id-${slug}`;
const primeraDe = (pestana: "tecnicas" | "clases", grupo: string) => idT(GRUPOS_CIRCUITIA[pestana].find((g) => g.id === grupo)!.slugs[0]);
const segundaDe = (pestana: "tecnicas" | "clases", grupo: string) => idT(GRUPOS_CIRCUITIA[pestana].find((g) => g.id === grupo)!.slugs[1]);
const estados = (nodos: NodoCaminoCircuitia[]) => new Map(nodos.map((n) => [n.id, n]));

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
const GRUPOS_T = GRUPOS_CIRCUITIA.tecnicas.map((g) => g.id);
const GRUPOS_C = GRUPOS_CIRCUITIA.clases.map((g) => g.id);

describe("Circuitia: los temas cubren exactamente las 5 Técnicas y las 7 Clases", () => {
  it("cada lección está en un solo tema de su pestaña y ninguna queda sin tema", () => {
    for (const [pestana, lista] of [
      ["tecnicas", TECNICAS],
      ["clases", CLASES],
    ] as const) {
      const cubiertos = GRUPOS_CIRCUITIA[pestana].flatMap((g) => g.slugs);
      expect(new Set(cubiertos).size).toBe(cubiertos.length);
      expect([...cubiertos].sort()).toEqual(lista.map((l) => l.slug).sort());
    }
    expect(TECNICAS).toHaveLength(5);
    expect(CLASES).toHaveLength(7);
  });

  it("dentro de un tema el orden de los slugs es el del contenido (orden ascendente)", () => {
    for (const [pestana, lista] of [
      ["tecnicas", TECNICAS],
      ["clases", CLASES],
    ] as const) {
      for (const g of GRUPOS_CIRCUITIA[pestana]) {
        const ordenes = g.slugs.map((s) => lista.find((l) => l.slug === s)!.orden);
        expect(ordenes, `${pestana}/${g.id}`).toEqual([...ordenes].sort((a, b) => a - b));
      }
    }
  });

  it("un slug desconocido cae en el primer tema (no se pierde ninguna fila)", () => {
    expect(grupoDeSlug("tecnicas", "slug-que-no-existe")).toBe("serie-paralelo");
    expect(grupoDeSlug("clases", "slug-que-no-existe")).toBe("fundamentos");
  });
});

describe("Circuitia Técnicas: cada tema tiene su propio 'activo' independiente y es lineal dentro del tema", () => {
  const filas = ordenarPorGrupoYOrden(FILAS.filter((f) => !f.requiere_pro), "tecnicas");

  it("con 0 dominadas, la primera Técnica de CADA tema queda activa a la vez y el resto bloqueada", () => {
    const nodos = calcularNodosTecnicas(filas, new Set());
    const porId = estados(nodos);
    for (const g of GRUPOS_T) expect(porId.get(primeraDe("tecnicas", g))!.estado, g).toBe("activo");
    expect(porId.get(segundaDe("tecnicas", "serie-paralelo"))!.estado).toBe("bloqueado");
    expect(nodos.filter((n) => n.estado === "activo")).toHaveLength(GRUPOS_T.length);
    expect(nodos.every((n) => !n.requierePro && !n.bloqueadoPorPlan)).toBe(true);
  });

  it("completar la 1 de un tema activa la 2 de ESE tema y no toca a los demás", () => {
    const porId = estados(calcularNodosTecnicas(filas, new Set([primeraDe("tecnicas", "serie-paralelo")])));
    expect(porId.get(primeraDe("tecnicas", "serie-paralelo"))!.estado).toBe("completado");
    expect(porId.get(segundaDe("tecnicas", "serie-paralelo"))!.estado).toBe("activo");
    expect(porId.get(idT(GRUPOS_CIRCUITIA.tecnicas[0].slugs[2]))!.estado).toBe("bloqueado");
    expect(porId.get(primeraDe("tecnicas", "mixtos"))!.estado).toBe("activo");
    expect(porId.get(primeraDe("tecnicas", "cualitativo"))!.estado).toBe("activo");
  });
});

describe("Circuitia Clases: un puntero activo por tema (no un curso lineal único), lineal dentro del tema, primera gratis, resto Pro", () => {
  const filas = ordenarPorGrupoYOrden(FILAS.filter((f) => f.requiere_pro), "clases");

  it("el cargador las ordena por tema y orden, aunque la base las devuelva mezcladas", () => {
    expect(filas.map((f) => f.slug)).toEqual(GRUPOS_CIRCUITIA.clases.flatMap((g) => g.slugs));
  });

  it("usuario sin Pro, 0 dominadas: solo la Clase 1 (preview gratis) está activa; el resto bloqueadoPorPlan", () => {
    const nodos = calcularNodosClases(filas, new Set(), false);
    expect(nodos[0].estado).toBe("activo");
    expect(nodos[0].grupo).toBe("fundamentos");
    expect(nodos[0].bloqueadoPorPlan).toBe(false);
    for (const n of nodos.slice(1)) {
      expect(n.estado, n.slug).toBe("bloqueado");
      expect(n.bloqueadoPorPlan, n.slug).toBe(true);
    }
  });

  it("usuario sin Pro con la Clase 1 completada: la 2 sigue bloqueada por el plan (no se abre sola)", () => {
    const nodos = calcularNodosClases(filas, new Set([CLA[0]]), false);
    expect(nodos[0].estado).toBe("completado");
    expect(nodos[1].estado).toBe("bloqueado");
    expect(nodos[1].bloqueadoPorPlan).toBe(true);
    expect(nodos.filter((n) => n.estado === "activo")).toHaveLength(0);
  });

  it("[pedido del usuario] usuario Pro: la primera Clase de CADA tema queda activa a la vez; las demás, bloqueadas por progresión y no por plan", () => {
    const nodos = calcularNodosClases(filas, new Set(), true);
    const activas = nodos.filter((n) => n.estado === "activo");
    expect(activas.map((n) => n.grupo)).toEqual(GRUPOS_C);
    for (const g of GRUPOS_C) expect(activas.find((n) => n.grupo === g)!.id, g).toBe(primeraDe("clases", g));
    expect(nodos.every((n) => !n.bloqueadoPorPlan)).toBe(true);
    // completar la 1 de Fundamentos abre la 2 de ESE tema y no toca a los demás
    const tras1 = estados(calcularNodosClases(filas, new Set([primeraDe("clases", "fundamentos")]), true));
    expect(tras1.get(segundaDe("clases", "fundamentos"))!.estado).toBe("activo");
    expect(tras1.get(primeraDe("clases", "mixtos"))!.estado).toBe("activo");
    expect(tras1.get(primeraDe("clases", "cualitativo"))!.estado).toBe("activo");
  });

  it("se puede empezar por Razonamiento cualitativo sin haber hecho Fundamentos ni Mixtos; dentro del tema sigue lineal", () => {
    const sinNada = estados(calcularNodosClases(filas, new Set(), true));
    expect(sinNada.get(primeraDe("clases", "cualitativo"))!.estado).toBe("activo");
    expect(sinNada.get(segundaDe("clases", "cualitativo"))!.estado).toBe("bloqueado");
    // Solo la 2 de un tema completada (salteando la 1): la 1 sigue siendo la activa y la 3 sigue cerrada.
    const salteada = estados(calcularNodosClases(filas, new Set([segundaDe("clases", "fundamentos")]), true));
    expect(salteada.get(primeraDe("clases", "fundamentos"))!.estado).toBe("activo");
    expect(salteada.get(idT(GRUPOS_CIRCUITIA.clases[0].slugs[2]))!.estado).toBe("bloqueado");
  });

  it("propiedades sobre 400 combinaciones al azar de progreso: nunca más de una lección activa por tema; un usuario Pro siempre tiene una Clase activa por cada tema con Clases pendientes", () => {
    const azar = prng(2026);
    for (let i = 0; i < 400; i++) {
      const dominadas = new Set([...TEC, ...CLA].filter(() => azar() < 0.4));
      const esPro = azar() < 0.5;
      const nodos = calcularCaminoCircuitia(FILAS, dominadas, esPro);
      const clases = nodos.filter((n) => n.requierePro);
      const tecnicas = nodos.filter((n) => !n.requierePro);
      for (const g of GRUPOS_T) expect(tecnicas.filter((n) => n.grupo === g && n.estado === "activo").length, `iteración ${i} técnicas ${g}`).toBeLessThanOrEqual(1);
      for (const g of GRUPOS_C) {
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

describe("Circuitia: el estado del sidebar es el de la fuente y coincide con lo que permite [slug]/page.tsx", () => {
  it("[bug Numeria 648f2b7] la primera Técnica de CADA tema y la primera Clase de CADA tema (Pro) llegan 'activo' y la página las deja abrir", async () => {
    const nodos = await obtenerCaminoCircuitia(supabaseFalso(new Set()), "u1", true);
    for (const g of GRUPOS_T) {
      const n = nodos.find((x) => !x.requierePro && x.id === primeraDe("tecnicas", g))!;
      expect(n.estado, g).toBe("activo");
      expect(puedeAbrirNodoCircuitia(n), `${g}: la página no debe redirigir`).toBe(true);
    }
    for (const g of GRUPOS_C) {
      const n = nodos.find((x) => x.requierePro && x.id === primeraDe("clases", g))!;
      expect(n.estado, g).toBe("activo");
      expect(puedeAbrirNodoCircuitia(n), `${g}: la página no debe redirigir`).toBe(true);
    }
  });

  it("para 60 progresos al azar y ambos planes, cada nodo del sidebar muestra el estado de la fuente y la página lo abre si y solo si no está bloqueado", async () => {
    const azar = prng(7);
    for (let i = 0; i < 60; i++) {
      const dominadas = new Set([...TEC, ...CLA].filter(() => azar() < 0.35));
      const esPro = azar() < 0.5;
      const nodos = await obtenerCaminoCircuitia(supabaseFalso(dominadas), "u1", esPro);
      const { tecnicas, clases } = partirCaminoPorClases(nodos);
      for (const [pestana, lista] of [
        ["tecnicas", tecnicas],
        ["clases", clases],
      ] as const) {
        const unidades = construirUnidadesCircuitia(lista, pestana, "es", CTA);
        const enSidebar = new Map(unidades.flatMap((u) => u.nodos).map((n) => [n.slug, n]));
        expect(enSidebar.size).toBe(lista.length);
        for (const nodo of lista) {
          const s = enSidebar.get(nodo.slug)!;
          expect(s.estado, `${nodo.slug} (esPro=${esPro})`).toBe(nodo.estado);
          expect(puedeAbrirNodoCircuitia(nodo), `${nodo.slug}: página vs sidebar`).toBe(s.estado !== "bloqueado");
          expect(!!s.ctaPro, `${nodo.slug}: CTA Pro solo si está bloqueado por el plan`).toBe(nodo.bloqueadoPorPlan);
        }
      }
    }
  });

  it("el nodo ACTIVO del sidebar siempre es entrable (ambos planes): 3 Técnicas + 1 Clase (free) o 3 Clases (Pro)", async () => {
    for (const esPro of [false, true]) {
      const nodos = await obtenerCaminoCircuitia(supabaseFalso(new Set()), "u1", esPro);
      const activos = nodos.filter((x) => x.estado === "activo");
      for (const n of activos) expect(puedeAbrirNodoCircuitia(n), n.slug).toBe(true);
      expect(activos.length).toBe(esPro ? 6 : 4);
    }
  });

  it("un usuario sin Pro que entra por URL a una Clase 2+ es redirigido a la pestaña Clases; a una Técnica bloqueada, a la pestaña Técnicas", async () => {
    const nodos = await obtenerCaminoCircuitia(supabaseFalso(new Set()), "u1", false);
    const clase2 = nodos.find((n) => n.id === segundaDe("clases", "fundamentos"))!;
    expect(puedeAbrirNodoCircuitia(clase2)).toBe(false);
    expect(hrefVolverAAprender("/circuitia/aprender", clase2.requierePro)).toBe("/circuitia/aprender?tab=clases");
    const tecnica2 = nodos.find((n) => n.id === segundaDe("tecnicas", "serie-paralelo"))!;
    expect(puedeAbrirNodoCircuitia(tecnica2)).toBe(false);
    expect(hrefVolverAAprender("/circuitia/aprender", tecnica2.requierePro)).toBe("/circuitia/aprender");
  });

  it("los 3 temas aparecen en el sidebar de cada pestaña, en orden recomendado", async () => {
    const nodos = await obtenerCaminoCircuitia(supabaseFalso(new Set()), "u1", true);
    const { tecnicas, clases } = partirCaminoPorClases(nodos);
    expect(construirUnidadesCircuitia(tecnicas, "tecnicas", "es", CTA).map((u) => u.id)).toEqual(GRUPOS_T.map((g) => `tecnicas-${g}`));
    expect(construirUnidadesCircuitia(clases, "clases", "en", CTA).map((u) => u.nombre)).toEqual(["Fundamentals", "Mixed circuits", "Qualitative reasoning"]);
  });
});

describe("Circuitia: GRUPOS_APRENDER.circuitia (presentación genérica) no se desincroniza de grupos.ts", () => {
  it("mismos temas, ids, nombres es/en y slugs", () => {
    for (const pestana of ["tecnicas", "clases"] as const) {
      const generico = GRUPOS_APRENDER.circuitia[pestana];
      expect(generico.map((g) => ({ id: g.id, nombre: g.nombre, slugs: g.slugs }))).toEqual(
        GRUPOS_CIRCUITIA[pestana].map((g) => ({ id: g.id, nombre: g.nombre, slugs: g.slugs }))
      );
    }
  });

  it("agruparNodos y path.ts dan el mismo 'activo' por tema en las Técnicas (misma regla, dos capas)", () => {
    const nodos = calcularNodosTecnicas(ordenarPorGrupoYOrden(FILAS.filter((f) => !f.requiere_pro), "tecnicas"), new Set([primeraDe("tecnicas", "serie-paralelo")]));
    const conSlug = nodos.map((n) => ({ slug: n.slug, estado: n.estado }));
    const agrupados = agruparNodos(conSlug, "circuitia", "tecnicas", "es").flatMap((g) => g.nodos);
    expect(agrupados).toHaveLength(conSlug.length);
    for (const n of agrupados) expect(n.estado, n.slug).toBe(conSlug.find((x) => x.slug === n.slug)!.estado);
  });
});
