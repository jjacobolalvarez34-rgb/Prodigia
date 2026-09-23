import { describe, expect, it } from "vitest";
import { ordenarPorGrupoYOrden, calcularNodos, ORDEN_GRUPOS_GEOGRAFIA, type FilaTechnique } from "./path";
import { TECNICAS_GEOGRAFIA } from "./lecciones/tecnicas";
import { CLASES_GEOGRAFIA } from "./lecciones/clases";

// Desbloqueo por continente de Geografía (retrofit 2026-09-23, ver
// docs/PARIDAD_MUNDOS.md fila 1 + fila 22/23): mismo tipo de test que ya
// existe para el resto de los mundos con grupo real (ver
// src/lib/aprender/grupos.test.ts, "Técnicas: cada grupo/tema tiene su
// propio 'activo' independiente" / "sigue siendo estrictamente lineal") —
// acá se testea directo sobre calcularNodos (sin mockear Supabase),
// porque es una función pura de fila+dominadas → estado.

function fila(id: string, slug: string, orden: number, requierePro = false): FilaTechnique {
  return { id, slug, nombre: slug, descripcion: null, contenido: {}, orden, requiere_pro: requierePro };
}

describe("Geografía: ORDEN_GRUPOS_GEOGRAFIA", () => {
  it("tiene 'general' + los 4 continentes, sin duplicados", () => {
    expect(ORDEN_GRUPOS_GEOGRAFIA).toHaveLength(5);
    expect(new Set(ORDEN_GRUPOS_GEOGRAFIA).size).toBe(5);
    expect(ORDEN_GRUPOS_GEOGRAFIA).toContain("general");
    expect(ORDEN_GRUPOS_GEOGRAFIA).toContain("america");
    expect(ORDEN_GRUPOS_GEOGRAFIA).toContain("europa");
    expect(ORDEN_GRUPOS_GEOGRAFIA).toContain("africa");
    expect(ORDEN_GRUPOS_GEOGRAFIA).toContain("asia_oceania");
  });
});

describe("Geografía Técnicas: cada continente (+ general) tiene su propio 'activo' independiente", () => {
  it("con 0 dominadas, la primera técnica de CADA grupo queda activa a la vez (no solo la del primer grupo)", () => {
    const filas = [
      fila("g1", "dividir-en-subregiones", 1),
      fila("g2", "anclar-por-vecinos", 2),
      fila("a1", "geografia-tecnica-forma-sudamerica-vs-centroamerica", 1),
      fila("a2", "geografia-tecnica-vecinos-de-brasil", 2),
      fila("e1", "geografia-tecnica-escandinavos-forma-y-orientacion", 1),
    ];
    const ordenadas = ordenarPorGrupoYOrden(filas);
    const nodos = calcularNodos(ordenadas, new Set(), false, false, undefined);
    const porId = new Map(nodos.map((n) => [n.id, n]));
    expect(porId.get("g1")!.estado).toBe("activo");
    expect(porId.get("g2")!.estado).toBe("bloqueado");
    expect(porId.get("a1")!.estado).toBe("activo");
    expect(porId.get("a2")!.estado).toBe("bloqueado");
    expect(porId.get("e1")!.estado).toBe("activo");
  });

  it("dentro de un mismo continente sigue siendo estrictamente lineal (completar la 1 activa la 2, no las dos a la vez)", () => {
    const filas = [fila("a1", "geografia-tecnica-forma-sudamerica-vs-centroamerica", 1), fila("a2", "geografia-tecnica-vecinos-de-brasil", 2)];
    const ordenadas = ordenarPorGrupoYOrden(filas);
    const nodos = calcularNodos(ordenadas, new Set(["a1"]), false, false, undefined);
    const porId = new Map(nodos.map((n) => [n.id, n]));
    expect(porId.get("a1")!.estado).toBe("completado");
    expect(porId.get("a2")!.estado).toBe("activo");
  });

  it("completar todas las técnicas de un continente no afecta al progreso de otro continente", () => {
    const filas = [
      fila("a1", "geografia-tecnica-forma-sudamerica-vs-centroamerica", 1),
      fila("e1", "geografia-tecnica-escandinavos-forma-y-orientacion", 1),
      fila("e2", "geografia-tecnica-balcanes-muchos-paises-chicos", 2),
    ];
    const ordenadas = ordenarPorGrupoYOrden(filas);
    // América ya completa entera; Europa sin tocar.
    const nodos = calcularNodos(ordenadas, new Set(["a1"]), false, false, undefined);
    const porId = new Map(nodos.map((n) => [n.id, n]));
    expect(porId.get("a1")!.estado).toBe("completado");
    expect(porId.get("e1")!.estado).toBe("activo");
    expect(porId.get("e2")!.estado).toBe("bloqueado");
  });
});

describe("Geografía Clases: gating Pro + activo por continente independiente", () => {
  it("usuario no-Pro: solo la clase de orden global más bajo queda activa; el resto de las 'primeras de su continente' quedan bloqueadoPorPlan", () => {
    const filas = [
      fila("ca1", "geografia-clase-cono-sur", 1, true),
      fila("ce1", "geografia-clase-europa-occidental", 1, true),
    ];
    const ordenadas = ordenarPorGrupoYOrden(filas);
    const previewGlobalId = ordenadas[0].id; // américa antes que europa en ORDEN_GRUPOS_GEOGRAFIA
    const nodos = calcularNodos(ordenadas, new Set(), true, false, previewGlobalId);
    const porId = new Map(nodos.map((n) => [n.id, n]));
    expect(porId.get("ca1")!.estado).toBe("activo");
    expect(porId.get("ca1")!.bloqueadoPorPlan).toBe(false);
    expect(porId.get("ce1")!.estado).toBe("bloqueado");
    expect(porId.get("ce1")!.bloqueadoPorPlan).toBe(true);
  });

  it("usuario Pro: todas las 'primeras de su continente' quedan activas a la vez", () => {
    const filas = [
      fila("ca1", "geografia-clase-cono-sur", 1, true),
      fila("ce1", "geografia-clase-europa-occidental", 1, true),
    ];
    const ordenadas = ordenarPorGrupoYOrden(filas);
    const previewGlobalId = ordenadas[0].id;
    const nodos = calcularNodos(ordenadas, new Set(), true, true, previewGlobalId);
    for (const n of nodos) {
      expect(n.estado).toBe("activo");
      expect(n.bloqueadoPorPlan).toBe(false);
    }
  });

  it("Técnicas nunca dependen del plan (requierePro=false ignora esPro y previewGlobalId)", () => {
    const filas = [fila("a1", "geografia-tecnica-forma-sudamerica-vs-centroamerica", 1)];
    const nodos = calcularNodos(filas, new Set(), false, false, undefined);
    expect(nodos[0].estado).toBe("activo");
    expect(nodos[0].bloqueadoPorPlan).toBe(false);
  });
});

describe("Geografía: el contenido real de TECNICAS_GEOGRAFIA/CLASES_GEOGRAFIA cae en el grupo correcto", () => {
  it("cada técnica nueva mapea a un continente real (no 'general')", () => {
    const continentesValidos = new Set(["america", "europa", "africa", "asia_oceania"]);
    for (const t of TECNICAS_GEOGRAFIA) expect(continentesValidos.has(t.continente), t.slug).toBe(true);
  });

  it("cada clase nueva mapea a un continente real", () => {
    const continentesValidos = new Set(["america", "europa", "africa", "asia_oceania"]);
    for (const c of CLASES_GEOGRAFIA) expect(continentesValidos.has(c.continente), c.slug).toBe(true);
  });

  it("orden por continente: 5 técnicas correlativas 1..5 por continente, 4 clases correlativas 1..4 por continente", () => {
    for (const continente of ["america", "europa", "africa", "asia_oceania"] as const) {
      const tecnicas = TECNICAS_GEOGRAFIA.filter((t) => t.continente === continente).map((t) => t.orden);
      expect(tecnicas.slice().sort((a, b) => a - b), continente).toEqual([1, 2, 3, 4, 5]);
      const clases = CLASES_GEOGRAFIA.filter((c) => c.continente === continente).map((c) => c.orden);
      expect(clases.slice().sort((a, b) => a - b), continente).toEqual([1, 2, 3, 4]);
    }
  });
});
