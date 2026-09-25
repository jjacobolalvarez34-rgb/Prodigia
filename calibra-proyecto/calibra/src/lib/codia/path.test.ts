import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calcularCaminoCodia,
  calcularNodosClases,
  calcularNodosTecnicas,
  obtenerCaminoCodia,
  ordenarPorTemaYOrden,
  puedeAbrirNodoCodia,
  temaDeSlug,
  type FilaTechnique,
  type NodoCaminoCodia,
} from "./path";
import { TECNICAS, CLASES } from "./lecciones";
import { GRUPOS_APRENDER, agruparNodos } from "@/lib/aprender/grupos";
import { partirCaminoPorClases } from "@/lib/aprender/clases";

// Desbloqueo de Aprender de Codia: por tema (Técnicas y Clases), nunca como un
// curso lineal único (pedido del usuario, commit f238e2a para Quimia y
// Trigonometría). Se testea sobre las funciones puras y, para lo que valida
// [slug]/page.tsx, sobre obtenerCaminoCodia con un Supabase de mentira: la
// página vuelve a pedir el camino y redirige si el nodo está "bloqueado", así
// que el estado que ve el sidebar tiene que ser el de la FUENTE (bug real de
// Numeria, commit 648f2b7).

function filaDe(l: { slug: string; nombre: string; descripcion: string; orden: number; requierePro: boolean }): FilaTechnique {
  return { id: `id-${l.slug}`, slug: l.slug, nombre: l.nombre, descripcion: l.descripcion, contenido: { pasos: [] }, orden: l.orden, requiere_pro: l.requierePro };
}
// Filas "de la base" en un orden que NO es el del curso (el cargador tiene que ordenarlas).
const FILAS: FilaTechnique[] = [...TECNICAS, ...CLASES].map(filaDe).sort((a, b) => a.slug.localeCompare(b.slug));
const id = (slug: string) => `id-${slug}`;
const porId = (nodos: NodoCaminoCodia[]) => new Map(nodos.map((n) => [n.id, n]));

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
  return {
    from(tabla: string) {
      if (tabla === "techniques") return { select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: FILAS }) }) }) };
      return { select: () => ({ eq: () => Promise.resolve({ data: [...dominadas].map((d) => ({ technique_id: d, dominado: true })) }) }) };
    },
  } as unknown as SupabaseClient;
}

const TEMAS_TECNICAS = GRUPOS_APRENDER.codia.tecnicas;
const TEMAS_CLASES = GRUPOS_APRENDER.codia.clases;

describe("Codia: los temas cubren TODAS las lecciones", () => {
  it("cada Técnica y cada Clase cae en un tema definido (ninguna en 'otras')", () => {
    for (const t of TECNICAS) expect(temaDeSlug("tecnicas", t.slug), t.slug).not.toBe("otras");
    for (const c of CLASES) expect(temaDeSlug("clases", c.slug), c.slug).not.toBe("otras");
    expect(temaDeSlug("clases", "slug-que-no-existe")).toBe("otras");
  });

  it("hay varios temas con Técnicas y varios con Clases (si no, 'por tema' no cambiaría nada)", () => {
    expect(TEMAS_TECNICAS.length).toBeGreaterThanOrEqual(2);
    expect(TEMAS_CLASES.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Codia Técnicas: cada tema tiene su propio 'activo' y es lineal dentro del tema", () => {
  const filas = ordenarPorTemaYOrden("tecnicas", FILAS.filter((f) => !f.requiere_pro));

  it("con 0 dominadas, la primera Técnica de CADA tema queda activa a la vez y el resto bloqueada", () => {
    const nodos = calcularNodosTecnicas(filas, new Set());
    const m = porId(nodos);
    for (const tema of TEMAS_TECNICAS) {
      tema.slugs.forEach((slug, i) => expect(m.get(id(slug))!.estado, `${tema.id} #${i + 1}`).toBe(i === 0 ? "activo" : "bloqueado"));
    }
    expect(nodos.filter((n) => n.estado === "activo")).toHaveLength(TEMAS_TECNICAS.length);
    expect(nodos.every((n) => !n.requierePro && !n.bloqueadoPorPlan)).toBe(true);
  });

  it("completar la primera de un tema activa la segunda de ESE tema y no toca los otros", () => {
    const tema = TEMAS_TECNICAS.find((t) => t.slugs.length >= 2)!;
    const nodos = calcularNodosTecnicas(filas, new Set([id(tema.slugs[0])]));
    const m = porId(nodos);
    expect(m.get(id(tema.slugs[0]))!.estado).toBe("completado");
    expect(m.get(id(tema.slugs[1]))!.estado).toBe("activo");
    for (const otro of TEMAS_TECNICAS.filter((t) => t !== tema)) expect(m.get(id(otro.slugs[0]))!.estado).toBe("activo");
  });
});

describe("Codia Clases: un puntero activo por tema, primera del curso gratis, resto Pro", () => {
  const filas = ordenarPorTemaYOrden("clases", FILAS.filter((f) => f.requiere_pro));
  const primeras = TEMAS_CLASES.map((t) => t.slugs[0]);

  it("el cargador las ordena por tema y, dentro del tema, por orden", () => {
    expect(filas.map((f) => f.slug)).toEqual(TEMAS_CLASES.flatMap((t) => [...t.slugs].sort((a, b) => FILAS.find((f) => f.slug === a)!.orden - FILAS.find((f) => f.slug === b)!.orden)));
  });

  it("Pro con 0 dominadas: la primera Clase de CADA tema queda abierta a la vez (no solo la Clase 1)", () => {
    const nodos = calcularNodosClases(filas, new Set(), true);
    const m = porId(nodos);
    for (const slug of primeras) expect(m.get(id(slug))!.estado, slug).toBe("activo");
    expect(nodos.filter((n) => n.estado === "activo")).toHaveLength(TEMAS_CLASES.length);
    // Lineal dentro del tema: la segunda de cada tema sigue bloqueada (y no por el plan).
    for (const t of TEMAS_CLASES.filter((x) => x.slugs.length >= 2)) {
      expect(m.get(id(t.slugs[1]))!.estado).toBe("bloqueado");
      expect(m.get(id(t.slugs[1]))!.bloqueadoPorPlan).toBe(false);
    }
  });

  it("sin Pro: solo la Clase 1 (preview gratis) está abierta; el resto bloqueado por el plan", () => {
    const nodos = calcularNodosClases(filas, new Set(), false);
    const activas = nodos.filter((n) => n.estado === "activo");
    expect(activas.map((n) => n.slug)).toEqual([CLASES[0].slug]);
    for (const n of nodos.filter((x) => x.slug !== CLASES[0].slug)) {
      expect(n.estado).toBe("bloqueado");
      expect(n.bloqueadoPorPlan).toBe(true);
    }
  });

  it("completar una Clase activa la siguiente de su tema, sin tocar los otros temas", () => {
    const tema = TEMAS_CLASES.find((t) => t.slugs.length >= 2)!;
    const m = porId(calcularNodosClases(filas, new Set([id(tema.slugs[0])]), true));
    expect(m.get(id(tema.slugs[0]))!.estado).toBe("completado");
    expect(m.get(id(tema.slugs[1]))!.estado).toBe("activo");
    for (const otro of TEMAS_CLASES.filter((t) => t !== tema)) expect(m.get(id(otro.slugs[0]))!.estado).toBe("activo");
  });

  it("propiedad (400 combinaciones): un usuario Pro siempre tiene una Clase abierta por cada tema con Clases pendientes", () => {
    const azar = prng(2026);
    for (let i = 0; i < 400; i++) {
      const dominadas = new Set<string>();
      for (const t of TEMAS_CLASES) {
        // Dominadas = un prefijo del tema (así se juega de verdad: en orden dentro del tema).
        const hasta = Math.floor(azar() * (t.slugs.length + 1));
        t.slugs.slice(0, hasta).forEach((s) => dominadas.add(id(s)));
      }
      const m = porId(calcularNodosClases(filas, dominadas, true));
      for (const t of TEMAS_CLASES) {
        const pendientes = t.slugs.filter((s) => !dominadas.has(id(s)));
        const estados = pendientes.map((s) => m.get(id(s))!.estado);
        if (pendientes.length === 0) continue;
        expect(estados.filter((e) => e === "activo"), `${t.id} ${JSON.stringify([...dominadas])}`).toHaveLength(1);
        expect(estados[0]).toBe("activo");
      }
    }
  });
});

describe("Codia: el estado que ve el sidebar es el de la fuente (bug de Numeria 648f2b7)", () => {
  it("obtenerCaminoCodia devuelve el mismo estado que muestra agruparNodos, para Técnicas y Clases", async () => {
    const azar = prng(7);
    for (let i = 0; i < 40; i++) {
      const dominadas = new Set<string>();
      for (const l of [...TECNICAS, ...CLASES]) if (azar() < 0.3) dominadas.add(id(l.slug));
      const esPro = azar() < 0.5;
      const nodos = await obtenerCaminoCodia(supabaseFalso(dominadas), "u1", esPro);
      const { tecnicas, clases } = partirCaminoPorClases(nodos);
      const tecnicasSidebar = agruparNodos(tecnicas, "codia", "tecnicas", "es").flatMap((g) => g.nodos);
      for (const s of tecnicasSidebar) expect(s.estado, s.slug).toBe(tecnicas.find((n) => n.slug === s.slug)!.estado);
      const clasesSidebar = agruparNodos(clases, "codia", "clases", "es").flatMap((g) => g.nodos);
      for (const s of clasesSidebar) expect(s.estado, s.slug).toBe(clases.find((n) => n.slug === s.slug)!.estado);
      // Lo que abre la página de lección = todo lo que el sidebar muestra clickeable.
      for (const n of nodos) expect(puedeAbrirNodoCodia(n)).toBe(n.estado !== "bloqueado");
    }
  });

  it("una Técnica activa de cualquier tema se puede abrir (la página no la rebota)", async () => {
    const nodos = await obtenerCaminoCodia(supabaseFalso(new Set()), "u1", false);
    for (const tema of TEMAS_TECNICAS) {
      const primera = nodos.find((n) => n.slug === tema.slugs[0])!;
      expect(puedeAbrirNodoCodia(primera), tema.id).toBe(true);
    }
  });

  it("el camino completo son [...Técnicas, ...Clases] y no pierde ninguna fila", () => {
    const camino = calcularCaminoCodia(FILAS, new Set(), true);
    expect(camino).toHaveLength(TECNICAS.length + CLASES.length);
    expect(camino.slice(0, TECNICAS.length).every((n) => !n.requierePro)).toBe(true);
    expect(camino.slice(TECNICAS.length).every((n) => n.requierePro)).toBe(true);
  });
});
