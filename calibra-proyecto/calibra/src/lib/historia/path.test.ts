import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ORDEN_GRUPOS_HISTORIA,
  calcularCaminoHistoria,
  calcularNodosClases,
  calcularNodosTecnicas,
  construirUnidadesHistoria,
  grupoDeSlug,
  obtenerCaminoHistoria,
  ordenarPorGrupoYOrden,
  puedeAbrirNodoHistoria,
  type FilaTechnique,
  type NodoCaminoHistoria,
} from "./path";
import { NOMBRES_GRUPOS_HISTORIA } from "./bloques";
import { TECNICAS_HISTORIA, CLASES_HISTORIA } from "./lecciones";
import { GRUPOS_APRENDER, agruparNodos } from "@/lib/aprender/grupos";
import { partirCaminoPorClases, hrefVolverAAprender } from "@/lib/aprender/clases";

// Desbloqueo de Aprender de Historia. Se testea sobre funciones puras
// (calcularNodosTecnicas / calcularNodosClases) y, para lo que valida
// [slug]/page.tsx, sobre obtenerCaminoHistoria con un Supabase de mentira: la página
// vuelve a pedir el camino y redirige si el nodo está "bloqueado", así que el estado
// que ve el sidebar tiene que ser el de la FUENTE (bug real de Numeria, commit
// 648f2b7: el sidebar mostraba "activo" un nodo que la página rebotaba porque el
// camino real lo traía "bloqueado").
//
// Decisión documentada (pedido del usuario para todos los mundos): TÉCNICAS y CLASES
// con un puntero "activo" independiente POR ÉPOCA (Prehistoria, Antigüedad, Edad
// Media, Edad Moderna, Edad Contemporánea), lineal dentro de la época; entre épocas
// no se bloquea nada y el orden cronológico es solo el recomendado del menú lateral.

const raiz = path.resolve(__dirname, "../../..");
const messages = (l: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${l}.json`), "utf8"));

function filaDe(l: { slug: string; nombre: string; descripcion: string; orden: number; requierePro: boolean }): FilaTechnique {
  return { id: `id-${l.slug}`, slug: l.slug, nombre: l.nombre, descripcion: l.descripcion, contenido: { pasos: [] }, orden: l.orden, requiere_pro: l.requierePro };
}
// Filas "de la base" en un orden que NO es el del curso (el cargador tiene que ordenarlas).
const FILAS: FilaTechnique[] = [...TECNICAS_HISTORIA, ...CLASES_HISTORIA].map(filaDe).sort((a, b) => a.slug.localeCompare(b.slug));
const TEC = TECNICAS_HISTORIA.map((t) => `id-${t.slug}`);
const CLA = CLASES_HISTORIA.map((c) => `id-${c.slug}`);
const idTec = (grupo: string, orden: number) => `id-${TECNICAS_HISTORIA.find((t) => t.grupo === grupo && t.orden === orden)!.slug}`;
const idCla = (grupo: string, orden: number) => `id-${CLASES_HISTORIA.find((c) => c.grupo === grupo && c.orden === orden)!.slug}`;

const estados = (nodos: NodoCaminoHistoria[]) => new Map(nodos.map((n) => [n.id, n]));

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
const NOMBRES = Object.fromEntries(ORDEN_GRUPOS_HISTORIA.map((g) => [g, NOMBRES_GRUPOS_HISTORIA[g].es])) as Record<(typeof ORDEN_GRUPOS_HISTORIA)[number], string>;

describe("Historia Técnicas: cada época tiene su propio 'activo' independiente y es lineal dentro de la época", () => {
  const filas = ordenarPorGrupoYOrden(FILAS.filter((f) => !f.requiere_pro));

  it("con 0 dominadas, la primera Técnica de CADA época queda activa a la vez y el resto bloqueada", () => {
    const nodos = calcularNodosTecnicas(filas, new Set());
    const porId = estados(nodos);
    for (const g of ORDEN_GRUPOS_HISTORIA) {
      expect(porId.get(idTec(g, 1))!.estado, `${g} #1`).toBe("activo");
      expect(porId.get(idTec(g, 2))!.estado, `${g} #2`).toBe("bloqueado");
    }
    expect(nodos.filter((n) => n.estado === "activo")).toHaveLength(5);
    expect(nodos.every((n) => !n.requierePro && !n.bloqueadoPorPlan)).toBe(true);
  });

  it("dentro de una época es estrictamente lineal: completar la 1 activa la 2, no las dos a la vez", () => {
    const porId = estados(calcularNodosTecnicas(filas, new Set([idTec("antiguedad", 1)])));
    expect(porId.get(idTec("antiguedad", 1))!.estado).toBe("completado");
    expect(porId.get(idTec("antiguedad", 2))!.estado).toBe("activo");
    expect(porId.get(idTec("antiguedad", 3))!.estado).toBe("bloqueado");
  });

  it("completar todas las de una época no afecta el progreso de las otras", () => {
    const prehistoria = TECNICAS_HISTORIA.filter((t) => t.grupo === "prehistoria").map((t) => `id-${t.slug}`);
    const porId = estados(calcularNodosTecnicas(filas, new Set(prehistoria)));
    for (const id of prehistoria) expect(porId.get(id)!.estado).toBe("completado");
    for (const g of ORDEN_GRUPOS_HISTORIA.slice(1)) expect(porId.get(idTec(g, 1))!.estado, g).toBe("activo");
  });

  it("las 5 Técnicas históricas quedan en la época correcta (y un slug desconocido cae en la primera: no se pierde ninguna fila)", () => {
    expect(grupoDeSlug("historia-anclaje-cronologico")).toBe("prehistoria");
    expect(grupoDeSlug("historia-linea-de-tiempo-mental")).toBe("prehistoria");
    expect(grupoDeSlug("historia-bloques-por-siglo")).toBe("antiguedad");
    expect(grupoDeSlug("historia-asociacion-memorable")).toBe("edad-media");
    expect(grupoDeSlug("historia-siglas-para-secuencias")).toBe("edad-media");
    expect(grupoDeSlug("slug-que-no-existe")).toBe("prehistoria");
  });
});

describe("Historia Clases: un puntero activo por época (no un curso lineal único), lineal dentro de la época, primera gratis, resto Pro", () => {
  const filas = ordenarPorGrupoYOrden(FILAS.filter((f) => f.requiere_pro));

  it("el cargador las ordena en el orden cronológico recomendado, aunque la base las devuelva mezcladas", () => {
    expect(filas.map((f) => f.slug)).toEqual(CLASES_HISTORIA.map((c) => c.slug));
  });

  it("usuario sin Pro, 0 dominadas: solo la Clase 1 (preview gratis, Prehistoria) está activa; el resto bloqueadoPorPlan", () => {
    const nodos = calcularNodosClases(filas, new Set(), false);
    expect(nodos[0].estado).toBe("activo");
    expect(nodos[0].grupo).toBe("prehistoria");
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

  it("[pedido del usuario] usuario Pro: la primera Clase de CADA época queda activa a la vez; las demás, bloqueadas por progresión y no por plan", () => {
    const nodos = calcularNodosClases(filas, new Set(), true);
    const activas = nodos.filter((n) => n.estado === "activo");
    expect(activas.map((n) => n.grupo)).toEqual(ORDEN_GRUPOS_HISTORIA);
    for (const g of ORDEN_GRUPOS_HISTORIA) {
      expect(activas.find((n) => n.grupo === g)!.slug, g).toBe(CLASES_HISTORIA.find((c) => c.grupo === g && c.orden === 1)!.slug);
    }
    expect(nodos.every((n) => !n.bloqueadoPorPlan)).toBe(true);
    // completar la 1 de una época abre la 2 de ESA época y no toca a las demás
    const tras1 = estados(calcularNodosClases(filas, new Set([idCla("antiguedad", 1)]), true));
    expect(tras1.get(idCla("antiguedad", 2))!.estado).toBe("activo");
    expect(tras1.get(idCla("edad-media", 1))!.estado).toBe("activo");
    expect(tras1.get(idCla("contemporanea", 1))!.estado).toBe("activo");
  });

  it("el orden es lineal DENTRO de una época, pero una época no depende de otra: se puede empezar por la Edad Contemporánea sin haber hecho la Antigüedad", () => {
    const prehistoria = CLASES_HISTORIA.filter((c) => c.grupo === "prehistoria").map((c) => `id-${c.slug}`);
    const porId = estados(calcularNodosClases(filas, new Set(prehistoria), true));
    expect(porId.get(idCla("antiguedad", 1))!.estado).toBe("activo");
    expect(porId.get(idCla("antiguedad", 2))!.estado).toBe("bloqueado");
    const sinNada = estados(calcularNodosClases(filas, new Set(), true));
    expect(sinNada.get(idCla("prehistoria", 1))!.estado).toBe("activo");
    expect(sinNada.get(idCla("contemporanea", 1))!.estado).toBe("activo");
    // Dentro de una época: solo la 4 de la Antigüedad completada (salteando 1-3): la 1 sigue siendo la activa.
    const salteada = estados(calcularNodosClases(filas, new Set([idCla("antiguedad", 4)]), true));
    expect(salteada.get(idCla("antiguedad", 1))!.estado).toBe("activo");
    expect(salteada.get(idCla("antiguedad", 2))!.estado).toBe("bloqueado");
  });

  it("el curso recomendado recorre las 5 épocas en orden cronológico", () => {
    expect([...new Set(filas.map((f) => grupoDeSlug(f.slug)))]).toEqual(["prehistoria", "antiguedad", "edad-media", "edad-moderna", "contemporanea"]);
    const luego = estados(calcularNodosClases(filas, new Set([idCla("contemporanea", 1)]), true));
    expect(luego.get(idCla("contemporanea", 2))!.estado).toBe("activo");
    expect(luego.get(idCla("edad-moderna", 2))!.estado).toBe("bloqueado");
  });

  it("propiedades sobre 400 combinaciones al azar de progreso: nunca más de una Clase ni una Técnica activa por época; un usuario Pro siempre tiene una Clase activa por cada época con Clases pendientes", () => {
    const azar = prng(2026);
    for (let i = 0; i < 400; i++) {
      const dominadas = new Set([...TEC, ...CLA].filter(() => azar() < 0.4));
      const esPro = azar() < 0.5;
      const nodos = calcularCaminoHistoria(FILAS, dominadas, esPro);
      const clases = nodos.filter((n) => n.requierePro);
      const tecnicas = nodos.filter((n) => !n.requierePro);
      for (const g of ORDEN_GRUPOS_HISTORIA) {
        expect(tecnicas.filter((n) => n.grupo === g && n.estado === "activo").length, `iteración ${i} ${g}`).toBeLessThanOrEqual(1);
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

describe("Historia: el estado del sidebar es el de la fuente y coincide con lo que permite [slug]/page.tsx", () => {
  it("[bug Numeria 648f2b7] la primera Técnica de CADA época llega 'activo' desde el camino real y la página la deja abrir", async () => {
    const nodos = await obtenerCaminoHistoria(supabaseFalso(new Set()), "u1", false);
    for (const g of ORDEN_GRUPOS_HISTORIA) {
      const primera = nodos.find((n) => !n.requierePro && n.slug === TECNICAS_HISTORIA.find((t) => t.grupo === g && t.orden === 1)!.slug)!;
      expect(primera.estado, g).toBe("activo");
      expect(puedeAbrirNodoHistoria(primera), `${g}: la página no debe redirigir`).toBe(true);
    }
  });

  it("[bug Numeria 648f2b7] la primera Clase de CADA época llega 'activo' para un usuario Pro y la página la deja abrir", async () => {
    const nodos = await obtenerCaminoHistoria(supabaseFalso(new Set()), "u1", true);
    for (const g of ORDEN_GRUPOS_HISTORIA) {
      const primera = nodos.find((n) => n.requierePro && n.slug === CLASES_HISTORIA.find((c) => c.grupo === g && c.orden === 1)!.slug)!;
      expect(primera.estado, g).toBe("activo");
      expect(puedeAbrirNodoHistoria(primera), `${g}: la página no debe redirigir`).toBe(true);
    }
  });

  it("para 60 progresos al azar y ambos planes, cada nodo del sidebar muestra el estado de la fuente y la página lo abre si y solo si no está bloqueado", async () => {
    const azar = prng(7);
    for (let i = 0; i < 60; i++) {
      const dominadas = new Set([...TEC, ...CLA].filter(() => azar() < 0.35));
      const esPro = azar() < 0.5;
      const nodos = await obtenerCaminoHistoria(supabaseFalso(dominadas), "u1", esPro);
      const { tecnicas, clases } = partirCaminoPorClases(nodos);
      for (const lista of [tecnicas, clases]) {
        const unidades = construirUnidadesHistoria(lista, NOMBRES, CTA);
        const enSidebar = new Map(unidades.flatMap((u) => u.nodos).map((n) => [n.slug, n]));
        expect(enSidebar.size).toBe(lista.length);
        for (const nodo of lista) {
          const s = enSidebar.get(nodo.slug)!;
          expect(s.estado, `${nodo.slug} (esPro=${esPro})`).toBe(nodo.estado);
          expect(puedeAbrirNodoHistoria(nodo), `${nodo.slug}: página vs sidebar`).toBe(s.estado !== "bloqueado");
          expect(!!s.ctaPro, `${nodo.slug}: CTA Pro solo si está bloqueado por el plan`).toBe(nodo.bloqueadoPorPlan);
        }
      }
    }
  });

  it("el nodo ACTIVO del sidebar siempre es entrable (Técnicas y Clases, ambos planes)", async () => {
    for (const esPro of [false, true]) {
      const nodos = await obtenerCaminoHistoria(supabaseFalso(new Set()), "u1", esPro);
      const activos = nodos.filter((x) => x.estado === "activo");
      for (const n of activos) expect(puedeAbrirNodoHistoria(n), n.slug).toBe(true);
      // 5 Técnicas (una por época) + 1 Clase (free) o 5 Clases (Pro)
      expect(activos.length).toBe(esPro ? 10 : 6);
    }
  });

  it("un usuario sin Pro que entra por URL a una Clase 2+ es redirigido a la pestaña Clases; a una Técnica bloqueada, a la pestaña Técnicas", async () => {
    const nodos = await obtenerCaminoHistoria(supabaseFalso(new Set()), "u1", false);
    const clase2 = nodos.find((n) => n.slug === CLASES_HISTORIA[1].slug)!;
    expect(puedeAbrirNodoHistoria(clase2)).toBe(false);
    expect(hrefVolverAAprender("/historia/aprender", clase2.requierePro)).toBe("/historia/aprender?tab=clases");
    const tecnica2 = nodos.find((n) => n.slug === TECNICAS_HISTORIA.find((t) => t.grupo === "antiguedad" && t.orden === 2)!.slug)!;
    expect(puedeAbrirNodoHistoria(tecnica2)).toBe(false);
    expect(hrefVolverAAprender("/historia/aprender", tecnica2.requierePro)).toBe("/historia/aprender");
  });

  it("las 5 épocas aparecen en el sidebar (Técnicas y Clases), en orden cronológico", async () => {
    const nodos = await obtenerCaminoHistoria(supabaseFalso(new Set()), "u1", true);
    const { tecnicas, clases } = partirCaminoPorClases(nodos);
    for (const lista of [tecnicas, clases]) {
      expect(construirUnidadesHistoria(lista, NOMBRES, CTA).map((u) => u.id)).toEqual(ORDEN_GRUPOS_HISTORIA.map((g) => `historia-${g}`));
    }
  });
});

describe("Historia: GRUPOS_APRENDER.historia (presentación derivada del contenido tipado)", () => {
  it("cubre cada Técnica y cada Clase exactamente una vez, en la época correcta, y nada cae en «Otras»", () => {
    const g = GRUPOS_APRENDER.historia;
    for (const [lista, esperados] of [
      [g.tecnicas, TECNICAS_HISTORIA],
      [g.clases, CLASES_HISTORIA],
    ] as const) {
      const cubiertos = lista.flatMap((x) => x.slugs);
      expect(new Set(cubiertos).size).toBe(cubiertos.length);
      expect([...cubiertos].sort()).toEqual(esperados.map((l) => l.slug).sort());
      for (const grupo of lista) for (const slug of grupo.slugs) expect(esperados.find((l) => l.slug === slug)!.grupo).toBe(grupo.id);
    }
    const grupos = agruparNodos(TECNICAS_HISTORIA.map((t) => ({ slug: t.slug })), "historia", "tecnicas", "es");
    expect(grupos.map((x) => x.nombre)).toEqual(ORDEN_GRUPOS_HISTORIA.map((id) => NOMBRES_GRUPOS_HISTORIA[id].es));
  });

  it("los nombres de las 5 épocas coinciden con messages/es.json y messages/en.json (Historia.aprenderPage.grupos)", () => {
    for (const idioma of ["es", "en"] as const) {
      const msg = messages(idioma).Historia.aprenderPage.grupos as Record<string, string>;
      for (const grupo of ORDEN_GRUPOS_HISTORIA) expect(msg[grupo], `${idioma}.${grupo}`).toBe(NOMBRES_GRUPOS_HISTORIA[grupo][idioma]);
    }
  });

  it("agruparNodos y path.ts dan el mismo 'activo' por época en las Técnicas (misma regla, dos capas)", () => {
    const nodos = calcularNodosTecnicas(ordenarPorGrupoYOrden(FILAS.filter((f) => !f.requiere_pro)), new Set([idTec("prehistoria", 1), idTec("edad-media", 1)]));
    const conSlug = nodos.map((n) => ({ slug: n.slug, estado: n.estado }));
    const agrupados = agruparNodos(conSlug, "historia", "tecnicas", "es").flatMap((g) => g.nodos);
    for (const n of agrupados) expect(n.estado, n.slug).toBe(conSlug.find((x) => x.slug === n.slug)!.estado);
  });
});

describe("Historia: mensajes es/en en paridad", () => {
  it("el bloque Historia tiene exactamente las mismas claves en español e inglés", () => {
    const claves = (o: unknown, p = ""): string[] =>
      typeof o === "object" && o !== null ? Object.entries(o).flatMap(([k, v]) => claves(v, p ? `${p}.${k}` : k)) : [p];
    expect(claves(messages("es").Historia).sort()).toEqual(claves(messages("en").Historia).sort());
  });
});

describe("Historia: /api/aprender/completar cubre las Clases Pro (no hay hueco de seguridad)", () => {
  const ruta = fs.readFileSync(path.join(raiz, "src/app/api/aprender/completar/route.ts"), "utf8");

  it("el endpoint es genérico por technique_id y toda Clase de Historia tiene quiz (así el 403 para no Pro aplica)", () => {
    expect(ruta).toMatch(/from\("techniques"\)[\s\S]*?\.eq\("id", body\.technique_id\)/);
    for (const c of CLASES_HISTORIA) expect(c.quiz.length, c.slug).toBeGreaterThan(0);
  });
});
