import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ORDEN_GRUPOS_QUIMIA,
  calcularCaminoQuimia,
  calcularNodosClases,
  calcularNodosTecnicas,
  grupoDeSlug,
  obtenerCaminoQuimia,
  ordenarPorGrupoYOrden,
  puedeAbrirNodoQuimia,
  type FilaTechnique,
  type NodoCaminoQuimia,
} from "./path";
import { construirUnidadesQuimia } from "./unidades";
import { TECNICAS_QUIMIA, CLASES_QUIMIA } from "./lecciones";
import { GRUPOS_APRENDER, NOMBRES_GRUPOS_QUIMIA, agruparNodos } from "@/lib/aprender/grupos";
import { partirCaminoPorClases, hrefVolverAAprender } from "@/lib/aprender/clases";

// Desbloqueo de Aprender de Quimia. Se testea sobre funciones puras
// (calcularNodosTecnicas / calcularNodosClases) y, para lo que valida
// [slug]/page.tsx, sobre obtenerCaminoQuimia con un Supabase de mentira: la
// página vuelve a pedir el camino y redirige si el nodo está "bloqueado", así
// que el estado que ve el sidebar tiene que ser el de la FUENTE (bug real de
// Numeria, commit 648f2b7: el sidebar mostraba "activo" un nodo que la página
// rebotaba porque el camino real lo traía "bloqueado").

const raiz = path.resolve(__dirname, "../../..");
const messages = (l: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${l}.json`), "utf8"));

function filaDe(l: { slug: string; nombre: string; descripcion: string; orden: number; requierePro: boolean }): FilaTechnique {
  return { id: `id-${l.slug}`, slug: l.slug, nombre: l.nombre, descripcion: l.descripcion, contenido: { pasos: [] }, orden: l.orden, requiere_pro: l.requierePro };
}
// Filas "de la base" en un orden que NO es el del curso (el cargador tiene que ordenarlas).
const FILAS: FilaTechnique[] = [...TECNICAS_QUIMIA, ...CLASES_QUIMIA].map(filaDe).sort((a, b) => a.slug.localeCompare(b.slug));
const TEC = TECNICAS_QUIMIA.map((t) => `id-${t.slug}`);
const CLA = CLASES_QUIMIA.map((c) => `id-${c.slug}`);
const idTec = (grupo: string, orden: number) => `id-${TECNICAS_QUIMIA.find((t) => t.grupo === grupo && t.orden === orden)!.slug}`;
const idCla = (grupo: string, orden: number) => `id-${CLASES_QUIMIA.find((c) => c.grupo === grupo && c.orden === orden)!.slug}`;

const estados = (nodos: NodoCaminoQuimia[]) => new Map(nodos.map((n) => [n.id, n]));

// PRNG determinístico (mulberry32) para el test de propiedades.
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

// Supabase de mentira con las dos consultas que hace obtenerCaminoQuimia.
function supabaseFalso(dominadas: Set<string>): SupabaseClient {
  const falso = {
    from(tabla: string) {
      if (tabla === "techniques") {
        return {
          select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: FILAS.filter((f) => f) }) }) }),
        };
      }
      return {
        select: () => ({ eq: () => Promise.resolve({ data: [...dominadas].map((id) => ({ technique_id: id, dominado: true })) }) }),
      };
    },
  };
  return falso as unknown as SupabaseClient;
}

const CTA = { label: "Desbloquea con Pro", href: "/pro" };
const NOMBRES = Object.fromEntries(ORDEN_GRUPOS_QUIMIA.map((g) => [g, NOMBRES_GRUPOS_QUIMIA[g].es])) as Record<(typeof ORDEN_GRUPOS_QUIMIA)[number], string>;

describe("Quimia Técnicas: cada grupo tiene su propio 'activo' independiente y es lineal dentro del grupo", () => {
  const filas = ordenarPorGrupoYOrden(FILAS.filter((f) => !f.requiere_pro));

  it("con 0 dominadas, la primera Técnica de CADA grupo queda activa a la vez y el resto bloqueada", () => {
    const nodos = calcularNodosTecnicas(filas, new Set());
    const porId = estados(nodos);
    for (const g of ["tabla", "simbolos", "formulas", "nomenclatura", "redox", "organica"]) {
      expect(porId.get(idTec(g, 1))!.estado, `${g} #1`).toBe("activo");
      expect(porId.get(idTec(g, 2))!.estado, `${g} #2`).toBe("bloqueado");
    }
    expect(nodos.filter((n) => n.estado === "activo")).toHaveLength(6);
    expect(nodos.every((n) => !n.requierePro && !n.bloqueadoPorPlan)).toBe(true);
  });

  it("dentro de un grupo es estrictamente lineal: completar la 1 activa la 2, no las dos a la vez", () => {
    const nodos = calcularNodosTecnicas(filas, new Set([idTec("tabla", 1)]));
    const porId = estados(nodos);
    expect(porId.get(idTec("tabla", 1))!.estado).toBe("completado");
    expect(porId.get(idTec("tabla", 2))!.estado).toBe("activo");
    expect(porId.get(idTec("tabla", 3))!.estado).toBe("bloqueado");
  });

  it("completar todas las de un grupo no afecta el progreso de los otros", () => {
    const tabla = TECNICAS_QUIMIA.filter((t) => t.grupo === "tabla").map((t) => `id-${t.slug}`);
    const porId = estados(calcularNodosTecnicas(filas, new Set(tabla)));
    for (const id of tabla) expect(porId.get(id)!.estado).toBe("completado");
    expect(porId.get(idTec("simbolos", 1))!.estado).toBe("activo");
    expect(porId.get(idTec("formulas", 1))!.estado).toBe("activo");
    expect(porId.get(idTec("nomenclatura", 1))!.estado).toBe("activo");
  });

  it("las 4 Técnicas viejas quedan en el grupo correcto (patrones-en-formulas pasó a nomenclatura)", () => {
    expect(grupoDeSlug("agrupar-por-familia")).toBe("tabla");
    expect(grupoDeSlug("tabla-como-mapa")).toBe("tabla");
    expect(grupoDeSlug("asociacion-color-uso")).toBe("simbolos");
    expect(grupoDeSlug("patrones-en-formulas")).toBe("nomenclatura");
    expect(grupoDeSlug("slug-que-no-existe")).toBe("tabla"); // fallback: no se pierde ninguna fila
  });
});

describe("Quimia Clases: un puntero activo por tema (grupo), lineal dentro del grupo, primera del curso gratis, resto Pro", () => {
  const filas = ordenarPorGrupoYOrden(FILAS.filter((f) => f.requiere_pro));

  it("el cargador las ordena en orden de curso, aunque la base las devuelva mezcladas", () => {
    expect(filas.map((f) => f.slug)).toEqual(CLASES_QUIMIA.map((c) => c.slug));
  });

  it("usuario sin Pro, 0 dominadas: solo la Clase 1 (preview gratis) está activa; el resto bloqueadoPorPlan", () => {
    const nodos = calcularNodosClases(filas, new Set(), false);
    expect(nodos[0].estado).toBe("activo");
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
    expect(activas.map((n) => n.grupo)).toEqual(ORDEN_GRUPOS_QUIMIA);
    for (const g of ORDEN_GRUPOS_QUIMIA) {
      expect(activas.find((n) => n.grupo === g)!.slug, g).toBe(CLASES_QUIMIA.find((c) => c.grupo === g && c.orden === 1)!.slug);
    }
    expect(nodos.every((n) => !n.bloqueadoPorPlan)).toBe(true);
    // completar la 1 de un tema abre la 2 de ESE tema y no toca a los demás
    const tras1 = estados(calcularNodosClases(filas, new Set([idCla("nomenclatura", 1)]), true));
    expect(tras1.get(idCla("nomenclatura", 2))!.estado).toBe("activo");
    expect(tras1.get(idCla("redox", 1))!.estado).toBe("activo");
    expect(tras1.get(idCla("organica", 1))!.estado).toBe("activo");
  });

  it("el orden es lineal DENTRO de un tema, pero un tema no depende de otro: se puede empezar por 'nomenclatura' sin haber hecho 'tabla'", () => {
    const tabla = CLASES_QUIMIA.filter((c) => c.grupo === "tabla").map((c) => `id-${c.slug}`);
    const porId = estados(calcularNodosClases(filas, new Set(tabla), true));
    expect(porId.get(idCla("simbolos", 1))!.estado).toBe("activo");
    expect(porId.get(idCla("simbolos", 2))!.estado).toBe("bloqueado");
    // Sin haber hecho nada de 'tabla', la primera de 'nomenclatura' ya está abierta.
    const sinTabla = estados(calcularNodosClases(filas, new Set(), true));
    expect(sinTabla.get(idCla("tabla", 1))!.estado).toBe("activo");
    expect(sinTabla.get(idCla("nomenclatura", 1))!.estado).toBe("activo");
    // Dentro de un tema: solo la 4 de tabla completada (salteando 1-3): la 1 sigue siendo la activa.
    const salteada = estados(calcularNodosClases(filas, new Set([idCla("tabla", 4)]), true));
    expect(salteada.get(idCla("tabla", 1))!.estado).toBe("activo");
    expect(salteada.get(idCla("tabla", 2))!.estado).toBe("bloqueado");
  });

  it("propiedades sobre 400 combinaciones al azar de progreso: nunca más de una Clase ni una Técnica activa por grupo; un usuario Pro siempre tiene una Clase activa por cada tema con Clases pendientes", () => {
    const azar = prng(2026);
    for (let i = 0; i < 400; i++) {
      const dominadas = new Set([...TEC, ...CLA].filter(() => azar() < 0.4));
      const esPro = azar() < 0.5;
      const nodos = calcularCaminoQuimia(FILAS, dominadas, esPro);
      const clases = nodos.filter((n) => n.requierePro);
      const tecnicas = nodos.filter((n) => !n.requierePro);
      for (const g of ORDEN_GRUPOS_QUIMIA) {
        expect(tecnicas.filter((n) => n.grupo === g && n.estado === "activo").length, `iteración ${i} ${g}`).toBeLessThanOrEqual(1);
        const delGrupo = clases.filter((n) => n.grupo === g);
        expect(delGrupo.filter((n) => n.estado === "activo").length, `iteración ${i} clases ${g}`).toBeLessThanOrEqual(1);
        // Pro: si al tema le queda alguna Clase sin completar, hay exactamente una abierta.
        if (esPro && delGrupo.some((n) => n.estado !== "completado")) {
          expect(delGrupo.filter((n) => n.estado === "activo").length, `iteración ${i} ${g}: Pro sin Clase abierta`).toBe(1);
        }
      }
      for (const n of nodos) {
        expect(n.estado === "completado", n.slug).toBe(dominadas.has(n.id));
        if (n.bloqueadoPorPlan) expect(!esPro && n.requierePro && n.estado === "bloqueado", n.slug).toBe(true);
      }
      // Si el usuario no es Pro, las únicas Clases abiertas son la 1 (activa o completada) y las que ya tiene completadas.
      if (!esPro) for (const n of clases.slice(1)) expect(n.estado === "activo", n.slug).toBe(false);
    }
  });
});

describe("Quimia: el estado del sidebar es el de la fuente y coincide con lo que permite [slug]/page.tsx", () => {
  it("[bug Numeria 648f2b7] la primera Técnica de CADA grupo llega 'activo' desde el camino real y la página la deja abrir", async () => {
    const nodos = await obtenerCaminoQuimia(supabaseFalso(new Set()), "u1", false);
    for (const g of ["tabla", "simbolos", "formulas", "nomenclatura", "redox", "organica"] as const) {
      const primera = nodos.find((n) => !n.requierePro && n.grupo === g && n.slug === TECNICAS_QUIMIA.find((t) => t.grupo === g && t.orden === 1)!.slug)!;
      expect(primera.estado, g).toBe("activo");
      expect(puedeAbrirNodoQuimia(primera), `${g}: la página no debe redirigir`).toBe(true);
    }
  });

  it("para 60 progresos al azar y ambos planes, cada nodo del sidebar muestra el estado de la fuente y la página lo abre si y solo si no está bloqueado", async () => {
    const azar = prng(7);
    for (let i = 0; i < 60; i++) {
      const dominadas = new Set([...TEC, ...CLA].filter(() => azar() < 0.35));
      const esPro = azar() < 0.5;
      const nodos = await obtenerCaminoQuimia(supabaseFalso(dominadas), "u1", esPro);
      const { tecnicas, clases } = partirCaminoPorClases(nodos);
      for (const lista of [tecnicas, clases]) {
        const unidades = construirUnidadesQuimia(lista, NOMBRES, CTA);
        const enSidebar = new Map(unidades.flatMap((u) => u.nodos).map((n) => [n.slug, n]));
        expect(enSidebar.size).toBe(lista.length);
        for (const nodo of lista) {
          const s = enSidebar.get(nodo.slug)!;
          expect(s.estado, `${nodo.slug} (esPro=${esPro})`).toBe(nodo.estado);
          expect(puedeAbrirNodoQuimia(nodo), `${nodo.slug}: página vs sidebar`).toBe(s.estado !== "bloqueado");
          expect(!!s.ctaPro, `${nodo.slug}: CTA Pro solo si está bloqueado por el plan`).toBe(nodo.bloqueadoPorPlan);
        }
      }
    }
  });

  it("un usuario sin Pro que entra por URL a una Clase 2+ es redirigido a la pestaña Clases; a una Técnica bloqueada, a la pestaña Técnicas", async () => {
    const nodos = await obtenerCaminoQuimia(supabaseFalso(new Set()), "u1", false);
    const clase2 = nodos.find((n) => n.slug === CLASES_QUIMIA[1].slug)!;
    expect(puedeAbrirNodoQuimia(clase2)).toBe(false);
    expect(hrefVolverAAprender("/quimia/aprender", clase2.requierePro)).toBe("/quimia/aprender?tab=clases");
    const tecnica2 = nodos.find((n) => n.slug === TECNICAS_QUIMIA.find((t) => t.grupo === "tabla" && t.orden === 2)!.slug)!;
    expect(puedeAbrirNodoQuimia(tecnica2)).toBe(false);
    expect(hrefVolverAAprender("/quimia/aprender", tecnica2.requierePro)).toBe("/quimia/aprender");
  });

  it("con la tanda 2, los 6 grupos aparecen en el sidebar (Técnicas y Clases), en orden de curso: redox y orgánica al final", async () => {
    const nodos = await obtenerCaminoQuimia(supabaseFalso(new Set()), "u1", true);
    const { tecnicas, clases } = partirCaminoPorClases(nodos);
    for (const lista of [tecnicas, clases]) {
      expect(construirUnidadesQuimia(lista, NOMBRES, CTA).map((u) => u.id)).toEqual(["quimia-tabla", "quimia-simbolos", "quimia-formulas", "quimia-nomenclatura", "quimia-redox", "quimia-organica"]);
    }
  });

  it("redox y orgánica: cada una arranca con su propio nodo activo, tanto en las Técnicas como en las Clases (por tema, sin esperar a completar las anteriores)", () => {
    const nodos = calcularCaminoQuimia(FILAS, new Set(), true);
    const porId = estados(nodos);
    expect(porId.get(idTec("redox", 1))!.estado).toBe("activo");
    expect(porId.get(idTec("redox", 2))!.estado).toBe("bloqueado");
    expect(porId.get(idTec("organica", 1))!.estado).toBe("activo");
    expect(porId.get(idTec("organica", 2))!.estado).toBe("bloqueado");
    // Clases: la primera de redox y la de orgánica están abiertas desde el inicio (usuario Pro).
    expect(porId.get(idCla("redox", 1))!.estado).toBe("activo");
    expect(porId.get(idCla("redox", 2))!.estado).toBe("bloqueado");
    expect(porId.get(idCla("organica", 1))!.estado).toBe("activo");
    expect(porId.get(idCla("organica", 2))!.estado).toBe("bloqueado");
    // Completar la 1 de redox abre la 2 de redox, sin tocar orgánica.
    const luego = estados(calcularCaminoQuimia(FILAS, new Set([idCla("redox", 1)]), true));
    expect(luego.get(idCla("redox", 2))!.estado).toBe("activo");
    expect(luego.get(idCla("organica", 2))!.estado).toBe("bloqueado");
  });

  it("las Clases de redox y de orgánica son Pro: sin plan quedan bloqueadas por plan (CTA), la primera del curso sigue siendo la única gratis", () => {
    const nodos = calcularCaminoQuimia(FILAS, new Set(), false);
    for (const n of nodos.filter((x) => x.requierePro && x.grupo !== "tabla" || (x.requierePro && x.slug !== CLASES_QUIMIA[0].slug))) {
      expect(n.bloqueadoPorPlan, n.slug).toBe(true);
    }
    expect(nodos.find((n) => n.slug === CLASES_QUIMIA[0].slug)!.estado).toBe("activo");
  });
});

describe("Quimia: GRUPOS_APRENDER.quimia (presentación derivada del contenido tipado)", () => {
  it("cubre cada Técnica y cada Clase exactamente una vez, en el grupo correcto, y nada cae en «Otras»", () => {
    const g = GRUPOS_APRENDER.quimia;
    for (const [lista, esperados] of [
      [g.tecnicas, TECNICAS_QUIMIA],
      [g.clases, CLASES_QUIMIA],
    ] as const) {
      const cubiertos = lista.flatMap((x) => x.slugs);
      expect(new Set(cubiertos).size).toBe(cubiertos.length);
      expect(cubiertos.sort()).toEqual(esperados.map((l) => l.slug).sort());
      for (const grupo of lista) for (const slug of grupo.slugs) expect(esperados.find((l) => l.slug === slug)!.grupo).toBe(grupo.id);
    }
    const nodos = TECNICAS_QUIMIA.map((t) => ({ slug: t.slug }));
    const grupos = agruparNodos(nodos, "quimia", "tecnicas", "es");
    expect(grupos.map((x) => x.nombre)).toEqual(["Átomo y tabla periódica", "Símbolos y elementos", "Enlaces y fórmulas", "Nomenclatura inorgánica", "Estados de oxidación y redox", "Química orgánica"]);
  });

  it("los nombres de los 6 grupos coinciden con messages/es.json y messages/en.json (Quimia.aprenderPagina.grupos)", () => {
    for (const idioma of ["es", "en"] as const) {
      const msg = messages(idioma).Quimia.aprenderPagina.grupos as Record<string, string>;
      for (const grupo of ORDEN_GRUPOS_QUIMIA) expect(msg[grupo], `${idioma}.${grupo}`).toBe(NOMBRES_GRUPOS_QUIMIA[grupo][idioma]);
    }
  });

  it("agruparNodos y path.ts dan el mismo 'activo' por grupo en las Técnicas (misma regla, dos capas)", () => {
    const nodos = calcularNodosTecnicas(ordenarPorGrupoYOrden(FILAS.filter((f) => !f.requiere_pro)), new Set([idTec("tabla", 1), idTec("formulas", 1)]));
    const conSlug = nodos.map((n) => ({ slug: n.slug, estado: n.estado }));
    const agrupados = agruparNodos(conSlug, "quimia", "tecnicas", "es").flatMap((g) => g.nodos);
    for (const n of agrupados) expect(n.estado, n.slug).toBe(conSlug.find((x) => x.slug === n.slug)!.estado);
  });
});

describe("Quimia: /api/aprender/completar cubre las Clases Pro (no hay hueco de seguridad)", () => {
  const ruta = fs.readFileSync(path.join(raiz, "src/app/api/aprender/completar/route.ts"), "utf8");

  it("el endpoint es genérico por technique_id (sirve a Quimia) y exige plan Pro a toda lección requiere_pro con quiz", () => {
    expect(ruta).toMatch(/from\("techniques"\)[\s\S]*?\.eq\("id", body\.technique_id\)/);
    // La consulta de la lección no filtra por mundo (problem_type): vale para cualquier fila de `techniques`.
    const consulta = ruta.match(/from\("techniques"\)[\s\S]*?\.maybeSingle\(\)/)![0];
    expect(consulta).not.toMatch(/problem_type/);
    expect(ruta).toMatch(/tecnica\.requiere_pro/);
    expect(ruta).toMatch(/profile\?\.plan !== "pro"/);
    expect(ruta).toMatch(/status: 403/);
  });

  it("toda Clase de Quimia (Pro) tiene quiz: es la condición para que el 403 del endpoint aplique (una Clase sin quiz se podría completar sin Pro)", () => {
    for (const c of CLASES_QUIMIA) expect(c.quiz.length, c.slug).toBeGreaterThan(0);
  });
});
