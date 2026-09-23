import { describe, expect, it } from "vitest";
import { calcularEstadosPorTema, ordenarPorTemaYOrden, type FilaTechnique } from "./pathClases";

// Regresión de un bug real reportado jugando (2026-09-23): en Numeria, con
// la segunda técnica de Multiplicación sin dominar, la primera técnica de
// Fracciones/Geometría (o cualquier tema posterior) aparecía "activo" y
// clickeable en el sidebar de /aprender (grupos.ts la recalculaba por
// grupo solo para esa pantalla), pero al hacer click, /aprender/[slug]
// volvía a pedir el camino con calcularEstadosSecuenciales — un solo
// puntero GLOBAL cruzando los 9 temas en orden — la encontraba
// "bloqueado" de verdad, y redirigía de vuelta a /aprender sin abrir
// nada. calcularEstadosPorTema (ahora la función real que usa
// obtenerCaminoConClasesNumeria) es la fuente de verdad correcta: cada
// tema tiene su propio puntero "activo" independiente.

function fila(id: string, problemType: string, orden: number): FilaTechnique {
  return { id, slug: id, nombre: id, descripcion: null, contenido: {}, orden, problem_type: problemType, requiere_pro: false };
}

describe("Numeria — calcularEstadosPorTema: desbloqueo por tema independiente", () => {
  it("con la 2da de Multiplicación sin dominar, la 1ra de Fracciones y de Geometría igual quedan 'activo' (no 'bloqueado')", () => {
    const filas = ordenarPorTemaYOrden([
      fila("mult-1", "multiplicacion", 1),
      fila("mult-2", "multiplicacion", 2),
      fila("frac-1", "fracciones", 1),
      fila("geo-1", "geometria", 1),
    ]);
    // mult-1 ya dominada, mult-2 todavía no (el escenario exacto reportado).
    const estados = calcularEstadosPorTema(new Set(["mult-1"]), filas);
    const porId = new Map(filas.map((f, i) => [f.id, estados[i]]));

    expect(porId.get("mult-1")).toBe("completado");
    expect(porId.get("mult-2")).toBe("activo");
    // Estas dos son las que antes del fix quedaban "bloqueado" pese a
    // mostrarse "activo" en el sidebar — clic en cualquiera de las dos
    // rebotaba a /aprender.
    expect(porId.get("frac-1")).toBe("activo");
    expect(porId.get("geo-1")).toBe("activo");
  });

  it("dentro de un mismo tema sigue siendo estrictamente lineal", () => {
    const filas = ordenarPorTemaYOrden([fila("s1", "suma", 1), fila("s2", "suma", 2), fila("s3", "suma", 3)]);
    const estados = calcularEstadosPorTema(new Set(), filas);
    const porId = new Map(filas.map((f, i) => [f.id, estados[i]]));
    expect(porId.get("s1")).toBe("activo");
    expect(porId.get("s2")).toBe("bloqueado");
    expect(porId.get("s3")).toBe("bloqueado");
  });

  it("completar todo un tema no afecta el progreso de otro tema", () => {
    const filas = ordenarPorTemaYOrden([fila("s1", "suma", 1), fila("r1", "resta", 1), fila("r2", "resta", 2)]);
    const estados = calcularEstadosPorTema(new Set(["s1"]), filas);
    const porId = new Map(filas.map((f, i) => [f.id, estados[i]]));
    expect(porId.get("s1")).toBe("completado");
    expect(porId.get("r1")).toBe("activo");
    expect(porId.get("r2")).toBe("bloqueado");
  });

  it("con 0 dominadas, la primera técnica de CADA uno de los 9 temas queda activa a la vez", () => {
    const temas = ["suma", "resta", "multiplicacion", "division", "fracciones", "decimales", "potencias", "algebra", "geometria"];
    const filas = ordenarPorTemaYOrden(temas.map((t) => fila(`${t}-1`, t, 1)));
    const estados = calcularEstadosPorTema(new Set(), filas);
    expect(estados.every((e) => e === "activo")).toBe(true);
  });
});
