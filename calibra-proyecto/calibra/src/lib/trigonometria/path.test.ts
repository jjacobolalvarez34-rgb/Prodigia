import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ORDEN_GRUPOS_TRIGONOMETRIA,
  calcularCaminoTrigonometria,
  calcularNodosClases,
  calcularNodosTecnicas,
  construirUnidadesTrigonometria,
  grupoDeSlug,
  obtenerCaminoTrigonometria,
  ordenarPorGrupoYOrden,
  puedeAbrirNodoTrigonometria,
  type FilaTechnique,
  type NodoCaminoTrigonometria,
} from "./path";
import { NOMBRES_GRUPOS_TRIGONOMETRIA } from "./bloques";
import { TECNICAS_TRIGONOMETRIA, CLASES_TRIGONOMETRIA } from "./lecciones";
import { GRUPOS_APRENDER, agruparNodos } from "@/lib/aprender/grupos";
import { partirCaminoPorClases, hrefVolverAAprender } from "@/lib/aprender/clases";

// Desbloqueo de Aprender de Trigonometría. Se testea sobre funciones puras
// (calcularNodosTecnicas / calcularNodosClases) y, para lo que valida
// [slug]/page.tsx, sobre obtenerCaminoTrigonometria con un Supabase de mentira:
// la página vuelve a pedir el camino y redirige si el nodo está "bloqueado", así
// que el estado que ve el sidebar tiene que ser el de la FUENTE (bug real de
// Numeria, commit 648f2b7: el sidebar mostraba "activo" un nodo que la página
// rebotaba porque el camino real lo traía "bloqueado").
//
// Decisión documentada: TÉCNICAS con un puntero "activo" independiente POR
// BLOQUE (regla del usuario para todos los mundos) y CLASES como un curso
// lineal único (el temario es acumulativo: lecciones.test.ts verifica que cada
// Clase solo use conceptos ya enseñados por las anteriores).

const raiz = path.resolve(__dirname, "../../..");
const messages = (l: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${l}.json`), "utf8"));

function filaDe(l: { slug: string; nombre: string; descripcion: string; orden: number; requierePro: boolean }): FilaTechnique {
  return { id: `id-${l.slug}`, slug: l.slug, nombre: l.nombre, descripcion: l.descripcion, contenido: { pasos: [] }, orden: l.orden, requiere_pro: l.requierePro };
}
// Filas "de la base" en un orden que NO es el del curso (el cargador tiene que ordenarlas).
const FILAS: FilaTechnique[] = [...TECNICAS_TRIGONOMETRIA, ...CLASES_TRIGONOMETRIA].map(filaDe).sort((a, b) => a.slug.localeCompare(b.slug));
const TEC = TECNICAS_TRIGONOMETRIA.map((t) => `id-${t.slug}`);
const CLA = CLASES_TRIGONOMETRIA.map((c) => `id-${c.slug}`);
const idTec = (grupo: string, orden: number) => `id-${TECNICAS_TRIGONOMETRIA.find((t) => t.grupo === grupo && t.orden === orden)!.slug}`;
const idCla = (grupo: string, orden: number) => `id-${CLASES_TRIGONOMETRIA.find((c) => c.grupo === grupo && c.orden === orden)!.slug}`;

const estados = (nodos: NodoCaminoTrigonometria[]) => new Map(nodos.map((n) => [n.id, n]));

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
const NOMBRES = Object.fromEntries(ORDEN_GRUPOS_TRIGONOMETRIA.map((g) => [g, NOMBRES_GRUPOS_TRIGONOMETRIA[g].es])) as Record<(typeof ORDEN_GRUPOS_TRIGONOMETRIA)[number], string>;

describe("Trigonometría Técnicas: cada bloque tiene su propio 'activo' independiente y es lineal dentro del bloque", () => {
  const filas = ordenarPorGrupoYOrden(FILAS.filter((f) => !f.requiere_pro));

  it("con 0 dominadas, la primera Técnica de CADA bloque queda activa a la vez y el resto bloqueada", () => {
    const nodos = calcularNodosTecnicas(filas, new Set());
    const porId = estados(nodos);
    for (const g of ORDEN_GRUPOS_TRIGONOMETRIA) {
      expect(porId.get(idTec(g, 1))!.estado, `${g} #1`).toBe("activo");
      expect(porId.get(idTec(g, 2))!.estado, `${g} #2`).toBe("bloqueado");
    }
    expect(nodos.filter((n) => n.estado === "activo")).toHaveLength(6);
    expect(nodos.every((n) => !n.requierePro && !n.bloqueadoPorPlan)).toBe(true);
  });

  it("dentro de un bloque es estrictamente lineal: completar la 1 activa la 2, no las dos a la vez", () => {
    const porId = estados(calcularNodosTecnicas(filas, new Set([idTec("razones", 1)])));
    expect(porId.get(idTec("razones", 1))!.estado).toBe("completado");
    expect(porId.get(idTec("razones", 2))!.estado).toBe("activo");
    expect(porId.get(idTec("razones", 3))!.estado).toBe("bloqueado");
  });

  it("completar todas las de un bloque no afecta el progreso de los otros", () => {
    const razones = TECNICAS_TRIGONOMETRIA.filter((t) => t.grupo === "razones").map((t) => `id-${t.slug}`);
    const porId = estados(calcularNodosTecnicas(filas, new Set(razones)));
    for (const id of razones) expect(porId.get(id)!.estado).toBe("completado");
    for (const g of ORDEN_GRUPOS_TRIGONOMETRIA.slice(1)) expect(porId.get(idTec(g, 1))!.estado, g).toBe("activo");
  });

  it("las 5 Técnicas históricas quedan en el bloque correcto (y un slug desconocido cae en el primero: no se pierde ninguna fila)", () => {
    expect(grupoDeSlug("trigonometria-sohcahtoa")).toBe("razones");
    expect(grupoDeSlug("trigonometria-truco-mano-circulo")).toBe("circulo");
    expect(grupoDeSlug("trigonometria-simetria-cuadrantes")).toBe("circulo");
    expect(grupoDeSlug("trigonometria-grados-radianes")).toBe("circulo");
    expect(grupoDeSlug("trigonometria-cuando-usar-cada-ley")).toBe("leyes");
    expect(grupoDeSlug("slug-que-no-existe")).toBe("razones");
  });
});

describe("Trigonometría Clases: un curso lineal único en orden de currículo, primera gratis, resto Pro", () => {
  const filas = ordenarPorGrupoYOrden(FILAS.filter((f) => f.requiere_pro));

  it("el cargador las ordena en orden de curso, aunque la base las devuelva mezcladas", () => {
    expect(filas.map((f) => f.slug)).toEqual(CLASES_TRIGONOMETRIA.map((c) => c.slug));
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

  it("usuario Pro: UNA sola Clase activa (la primera no completada del curso), las demás bloqueadas por progresión, no por plan", () => {
    const nodos = calcularNodosClases(filas, new Set(), true);
    expect(nodos.filter((n) => n.estado === "activo").map((n) => n.slug)).toEqual([CLASES_TRIGONOMETRIA[0].slug]);
    expect(nodos.every((n) => !n.bloqueadoPorPlan)).toBe(true);
    const tras1 = calcularNodosClases(filas, new Set([CLA[0]]), true);
    expect(tras1.filter((n) => n.estado === "activo").map((n) => n.slug)).toEqual([CLASES_TRIGONOMETRIA[1].slug]);
  });

  it("dependencia real entre bloques: completar todo 'razones' abre la primera de 'circulo'; saltear una no abre nada más", () => {
    const razones = CLASES_TRIGONOMETRIA.filter((c) => c.grupo === "razones").map((c) => `id-${c.slug}`);
    const porId = estados(calcularNodosClases(filas, new Set(razones), true));
    expect(porId.get(idCla("circulo", 1))!.estado).toBe("activo");
    expect(porId.get(idCla("circulo", 2))!.estado).toBe("bloqueado");
    const salteada = estados(calcularNodosClases(filas, new Set([idCla("razones", 4)]), true));
    expect(salteada.get(idCla("razones", 1))!.estado).toBe("activo");
    expect(salteada.get(idCla("circulo", 1))!.estado).toBe("bloqueado");
  });

  it("el curso recorre los 6 bloques en el orden del currículo: razones, círculo, gráficas, leyes, identidades y ecuaciones", () => {
    expect([...new Set(filas.map((f) => grupoDeSlug(f.slug)))]).toEqual(["razones", "circulo", "graficas", "leyes", "identidades", "ecuaciones"]);
    const todas = CLASES_TRIGONOMETRIA.map((c) => `id-${c.slug}`);
    const hastaIdentidades = new Set(todas.slice(0, 25));
    const luego = estados(calcularNodosClases(filas, hastaIdentidades, true));
    expect(luego.get(idCla("ecuaciones", 1))!.estado).toBe("activo");
    expect(luego.get(idCla("ecuaciones", 2))!.estado).toBe("bloqueado");
  });

  it("propiedades sobre 400 combinaciones al azar de progreso: nunca más de una Clase activa, nunca más de una Técnica activa por bloque", () => {
    const azar = prng(2026);
    for (let i = 0; i < 400; i++) {
      const dominadas = new Set([...TEC, ...CLA].filter(() => azar() < 0.4));
      const esPro = azar() < 0.5;
      const nodos = calcularCaminoTrigonometria(FILAS, dominadas, esPro);
      const clases = nodos.filter((n) => n.requierePro);
      const tecnicas = nodos.filter((n) => !n.requierePro);
      expect(clases.filter((n) => n.estado === "activo").length, `iteración ${i}`).toBeLessThanOrEqual(1);
      for (const g of ORDEN_GRUPOS_TRIGONOMETRIA) expect(tecnicas.filter((n) => n.grupo === g && n.estado === "activo").length, `iteración ${i} ${g}`).toBeLessThanOrEqual(1);
      for (const n of nodos) {
        expect(n.estado === "completado", n.slug).toBe(dominadas.has(n.id));
        if (n.bloqueadoPorPlan) expect(!esPro && n.requierePro && n.estado === "bloqueado", n.slug).toBe(true);
      }
      if (!esPro) for (const n of clases.slice(1)) expect(n.estado === "activo", n.slug).toBe(false);
    }
  });
});

describe("Trigonometría: el estado del sidebar es el de la fuente y coincide con lo que permite [slug]/page.tsx", () => {
  it("[bug Numeria 648f2b7] la primera Técnica de CADA bloque llega 'activo' desde el camino real y la página la deja abrir", async () => {
    const nodos = await obtenerCaminoTrigonometria(supabaseFalso(new Set()), "u1", false);
    for (const g of ORDEN_GRUPOS_TRIGONOMETRIA) {
      const primera = nodos.find((n) => !n.requierePro && n.slug === TECNICAS_TRIGONOMETRIA.find((t) => t.grupo === g && t.orden === 1)!.slug)!;
      expect(primera.estado, g).toBe("activo");
      expect(puedeAbrirNodoTrigonometria(primera), `${g}: la página no debe redirigir`).toBe(true);
    }
  });

  it("para 60 progresos al azar y ambos planes, cada nodo del sidebar muestra el estado de la fuente y la página lo abre si y solo si no está bloqueado", async () => {
    const azar = prng(7);
    for (let i = 0; i < 60; i++) {
      const dominadas = new Set([...TEC, ...CLA].filter(() => azar() < 0.35));
      const esPro = azar() < 0.5;
      const nodos = await obtenerCaminoTrigonometria(supabaseFalso(dominadas), "u1", esPro);
      const { tecnicas, clases } = partirCaminoPorClases(nodos);
      for (const lista of [tecnicas, clases]) {
        const unidades = construirUnidadesTrigonometria(lista, NOMBRES, CTA);
        const enSidebar = new Map(unidades.flatMap((u) => u.nodos).map((n) => [n.slug, n]));
        expect(enSidebar.size).toBe(lista.length);
        for (const nodo of lista) {
          const s = enSidebar.get(nodo.slug)!;
          expect(s.estado, `${nodo.slug} (esPro=${esPro})`).toBe(nodo.estado);
          expect(puedeAbrirNodoTrigonometria(nodo), `${nodo.slug}: página vs sidebar`).toBe(s.estado !== "bloqueado");
          expect(!!s.ctaPro, `${nodo.slug}: CTA Pro solo si está bloqueado por el plan`).toBe(nodo.bloqueadoPorPlan);
        }
      }
    }
  });

  it("el nodo ACTIVO del sidebar siempre es entrable (Técnicas y Clases, ambos planes)", async () => {
    for (const esPro of [false, true]) {
      const nodos = await obtenerCaminoTrigonometria(supabaseFalso(new Set()), "u1", esPro);
      for (const n of nodos.filter((x) => x.estado === "activo")) expect(puedeAbrirNodoTrigonometria(n), n.slug).toBe(true);
      expect(nodos.filter((x) => x.estado === "activo").length).toBeGreaterThanOrEqual(7); // 6 Técnicas + la Clase 1
    }
  });

  it("un usuario sin Pro que entra por URL a una Clase 2+ es redirigido a la pestaña Clases; a una Técnica bloqueada, a la pestaña Técnicas", async () => {
    const nodos = await obtenerCaminoTrigonometria(supabaseFalso(new Set()), "u1", false);
    const clase2 = nodos.find((n) => n.slug === CLASES_TRIGONOMETRIA[1].slug)!;
    expect(puedeAbrirNodoTrigonometria(clase2)).toBe(false);
    expect(hrefVolverAAprender("/trigonometria/aprender", clase2.requierePro)).toBe("/trigonometria/aprender?tab=clases");
    const tecnica2 = nodos.find((n) => n.slug === TECNICAS_TRIGONOMETRIA.find((t) => t.grupo === "razones" && t.orden === 2)!.slug)!;
    expect(puedeAbrirNodoTrigonometria(tecnica2)).toBe(false);
    expect(hrefVolverAAprender("/trigonometria/aprender", tecnica2.requierePro)).toBe("/trigonometria/aprender");
  });

  it("los 6 bloques aparecen en el sidebar (Técnicas y Clases), en orden de currículo", async () => {
    const nodos = await obtenerCaminoTrigonometria(supabaseFalso(new Set()), "u1", true);
    const { tecnicas, clases } = partirCaminoPorClases(nodos);
    for (const lista of [tecnicas, clases]) {
      expect(construirUnidadesTrigonometria(lista, NOMBRES, CTA).map((u) => u.id)).toEqual(ORDEN_GRUPOS_TRIGONOMETRIA.map((g) => `trigonometria-${g}`));
    }
  });
});

describe("Trigonometría: GRUPOS_APRENDER.trigonometria (presentación derivada del contenido tipado)", () => {
  it("cubre cada Técnica y cada Clase exactamente una vez, en el bloque correcto, y nada cae en «Otras»", () => {
    const g = GRUPOS_APRENDER.trigonometria;
    for (const [lista, esperados] of [
      [g.tecnicas, TECNICAS_TRIGONOMETRIA],
      [g.clases, CLASES_TRIGONOMETRIA],
    ] as const) {
      const cubiertos = lista.flatMap((x) => x.slugs);
      expect(new Set(cubiertos).size).toBe(cubiertos.length);
      expect([...cubiertos].sort()).toEqual(esperados.map((l) => l.slug).sort());
      for (const grupo of lista) for (const slug of grupo.slugs) expect(esperados.find((l) => l.slug === slug)!.grupo).toBe(grupo.id);
    }
    const grupos = agruparNodos(TECNICAS_TRIGONOMETRIA.map((t) => ({ slug: t.slug })), "trigonometria", "tecnicas", "es");
    expect(grupos.map((x) => x.nombre)).toEqual(ORDEN_GRUPOS_TRIGONOMETRIA.map((id) => NOMBRES_GRUPOS_TRIGONOMETRIA[id].es));
  });

  it("los nombres de los 6 bloques coinciden con messages/es.json y messages/en.json (Trigonometria.aprender.grupos)", () => {
    for (const idioma of ["es", "en"] as const) {
      const msg = messages(idioma).Trigonometria.aprender.grupos as Record<string, string>;
      for (const grupo of ORDEN_GRUPOS_TRIGONOMETRIA) expect(msg[grupo], `${idioma}.${grupo}`).toBe(NOMBRES_GRUPOS_TRIGONOMETRIA[grupo][idioma]);
    }
  });

  it("agruparNodos y path.ts dan el mismo 'activo' por bloque en las Técnicas (misma regla, dos capas)", () => {
    const nodos = calcularNodosTecnicas(ordenarPorGrupoYOrden(FILAS.filter((f) => !f.requiere_pro)), new Set([idTec("razones", 1), idTec("leyes", 1)]));
    const conSlug = nodos.map((n) => ({ slug: n.slug, estado: n.estado }));
    const agrupados = agruparNodos(conSlug, "trigonometria", "tecnicas", "es").flatMap((g) => g.nodos);
    for (const n of agrupados) expect(n.estado, n.slug).toBe(conSlug.find((x) => x.slug === n.slug)!.estado);
  });
});

describe("Trigonometría: mensajes es/en en paridad", () => {
  it("el bloque Trigonometria tiene exactamente las mismas claves en español e inglés", () => {
    const claves = (o: unknown, p = ""): string[] =>
      typeof o === "object" && o !== null ? Object.entries(o).flatMap(([k, v]) => claves(v, p ? `${p}.${k}` : k)) : [p];
    expect(claves(messages("es").Trigonometria).sort()).toEqual(claves(messages("en").Trigonometria).sort());
  });
});

describe("Trigonometría: /api/aprender/completar cubre las Clases Pro (no hay hueco de seguridad)", () => {
  const ruta = fs.readFileSync(path.join(raiz, "src/app/api/aprender/completar/route.ts"), "utf8");

  it("el endpoint es genérico por technique_id y toda Clase de Trigonometría tiene quiz (así el 403 para no Pro aplica)", () => {
    expect(ruta).toMatch(/from\("techniques"\)[\s\S]*?\.eq\("id", body\.technique_id\)/);
    for (const c of CLASES_TRIGONOMETRIA) expect(c.quiz.length, c.slug).toBeGreaterThan(0);
  });
});

