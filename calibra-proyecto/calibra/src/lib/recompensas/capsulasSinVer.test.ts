import { describe, expect, it } from "vitest";
import { clasificarMarcas, conMarca, leerMarcas, premioDeFila, revisarMarcas, sinMarca } from "./capsulasSinVer";

const DIA = 24 * 3600 * 1000;

function fila(id: string, abierta: boolean, premio: unknown = null) {
  return { id, tipo: "diaria" as const, mundo: null, detalle: null, creada_at: "2026-10-23T00:00:00Z", abierta_at: abierta ? "2026-10-23T01:00:00Z" : null, premio };
}

describe("marcas de cápsulas abriéndose", () => {
  it("lee lo guardado y descarta basura", () => {
    expect(leerMarcas(null)).toEqual([]);
    expect(leerMarcas("no es json")).toEqual([]);
    expect(leerMarcas('{"id":"a"}')).toEqual([]);
    expect(leerMarcas('[{"id":"a","t":1},{"id":2,"t":1},null]')).toEqual([{ id: "a", t: 1 }]);
  });

  it("anota una sola vez cada cápsula y la borra", () => {
    const a = conMarca([], "a", 1);
    const b = conMarca(a, "a", 5);
    expect(b).toEqual([{ id: "a", t: 5 }]);
    expect(sinMarca(conMarca(b, "b", 6), "a")).toEqual([{ id: "b", t: 6 }]);
  });

  it("arma el premio guardado en la fila", () => {
    expect(premioDeFila(null)).toBeNull();
    expect(premioDeFila({ nombre: "x" })).toBeNull();
    expect(premioDeFila({ premio: "chispas", slug: null, nombre: null, rareza: null, cantidad: 40, convertido: false })).toEqual({
      premio: "chispas",
      slug: null,
      nombre: null,
      rareza: null,
      cantidad: 40,
      convertido: false,
    });
  });

  it("cerrada: se olvida; abierta con premio: se muestra; sin fila: espera unos días", () => {
    const ahora = 100 * DIA;
    const marcas = [
      { id: "cerrada", t: ahora },
      { id: "abierta", t: ahora },
      { id: "fusionada", t: ahora },
      { id: "ajena", t: ahora - DIA },
      { id: "vieja", t: ahora - 30 * DIA },
    ];
    const r = clasificarMarcas(marcas, [fila("cerrada", false), fila("abierta", true, { premio: "hielo", cantidad: 1 }), fila("fusionada", true, null)], ahora);
    expect(r.sinVer.map((x) => x.capsula.id)).toEqual(["abierta"]);
    expect(r.sinVer[0].premio.premio).toBe("hielo");
    // La que se muestra sigue anotada hasta que se vea.
    expect(r.quedan.map((m) => m.id)).toEqual(["abierta", "ajena"]);
  });

  it("si la consulta falla, no borra nada", async () => {
    const marcas = [{ id: "a", t: 1 }];
    const sb = { from: () => ({ select: () => ({ in: async () => ({ data: null, error: { message: "sin red" } }) }) }) };
    expect(await revisarMarcas(sb, marcas, 2)).toEqual({ sinVer: [], quedan: marcas });
    expect(await revisarMarcas(sb, [], 2)).toEqual({ sinVer: [], quedan: [] });
  });
});
