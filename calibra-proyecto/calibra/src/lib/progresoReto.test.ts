import { describe, it, expect } from "vitest";
import { crearSnapshotProgreso, leerProgresoGuardado, type ProgresoReto } from "./progresoReto";

const CLAVE_DIARIO = "prodigia-reto-diario-progreso-2026-09-07";

function memoria(contenido: Record<string, string>): Pick<Storage, "getItem"> {
  return {
    getItem: (k: string) => (k in contenido ? contenido[k] : null),
  };
}

describe("leerProgresoGuardado", () => {
  it("devuelve null si no hay progreso guardado", () => {
    expect(leerProgresoGuardado(CLAVE_DIARIO, 5, memoria({}))).toBeNull();
  });

  it("devuelve null si no hay storage disponible (SSR / modo privado)", () => {
    expect(leerProgresoGuardado(CLAVE_DIARIO, 5, undefined)).toBeNull();
  });

  it("devuelve el progreso si está en rango (0 < indice < total)", () => {
    const storage = memoria({ [CLAVE_DIARIO]: JSON.stringify({ indice: 3, correctos: 2 }) });
    expect(leerProgresoGuardado(CLAVE_DIARIO, 5, storage)).toEqual({ indice: 3, correctos: 2 });
  });

  it("devuelve null para JSON corrupto", () => {
    const storage = memoria({ [CLAVE_DIARIO]: "no-json{" });
    expect(leerProgresoGuardado(CLAVE_DIARIO, 5, storage)).toBeNull();
  });

  it("devuelve null si el progreso apunta al final (reto ya terminado)", () => {
    const storage = memoria({ [CLAVE_DIARIO]: JSON.stringify({ indice: 5, correctos: 5 }) });
    expect(leerProgresoGuardado(CLAVE_DIARIO, 5, storage)).toBeNull();
  });

  it("documenta el bug original: la lectura directa NO es estable entre llamadas (objetos nuevos)", () => {
    const storage = memoria({ [CLAVE_DIARIO]: JSON.stringify({ indice: 3, correctos: 2 }) });
    const a: ProgresoReto | null = leerProgresoGuardado(CLAVE_DIARIO, 5, storage);
    const b: ProgresoReto | null = leerProgresoGuardado(CLAVE_DIARIO, 5, storage);
    expect(a).toEqual(b);
    // useSyncExternalStore compara con Object.is: si cada llamada devuelve
    // un objeto nuevo, React cree que "la store cambió" y re-renderiza en
    // loop infinito. Este test documenta por qué pasarla directo rompía.
    expect(Object.is(a, b)).toBe(false);
  });
});

describe("crearSnapshotProgreso (regresión P0 retos diario/semanal)", () => {
  it("REGRESIÓN: la snapshot consumida por useSyncExternalStore es estable (Object.is) entre llamadas sin cambios", () => {
    const storage = memoria({ [CLAVE_DIARIO]: JSON.stringify({ indice: 3, correctos: 2 }) });
    const getSnapshot = crearSnapshotProgreso(CLAVE_DIARIO, 5, storage);
    expect(Object.is(getSnapshot(), getSnapshot())).toBe(true);
  });

  it("lee una sola vez y mantiene el mismo valor aunque la store cambie por fuera", () => {
    const storage: Record<string, string> = { [CLAVE_DIARIO]: JSON.stringify({ indice: 2, correctos: 1 }) };
    const getSnapshot = crearSnapshotProgreso(CLAVE_DIARIO, 5, memoria(storage));
    expect(getSnapshot()).toEqual({ indice: 2, correctos: 1 });
    // Muta "por fuera" a mitad de un render — la snapshot no debe cambiar
    // su identidad ni su valor en curso (eso disparaba el loop).
    storage[CLAVE_DIARIO] = JSON.stringify({ indice: 4, correctos: 3 });
    expect(getSnapshot()).toEqual({ indice: 2, correctos: 1 });
    expect(Object.is(getSnapshot(), getSnapshot())).toBe(true);
  });

  it("recalcula al cambiar la clave (otro día/semana) — cada snapshot es independiente", () => {
    const storage = memoria({ [CLAVE_DIARIO]: JSON.stringify({ indice: 1, correctos: 1 }) });
    const getDiario = crearSnapshotProgreso(CLAVE_DIARIO, 5, storage);
    const getSemanal = crearSnapshotProgreso("prodigia-reto-semanal-progreso-2026-09-07", 45, storage);
    expect(getDiario()?.indice).toBe(1);
    expect(getSemanal()).toBeNull();
  });
});