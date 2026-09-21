import { describe, expect, it } from "vitest";
import { hrefVolverAAprender, partirCaminoPorClases, resolverPestanaInicial } from "./clases";

describe("partirCaminoPorClases", () => {
  it("separa técnicas y clases según requierePro", () => {
    const r = partirCaminoPorClases([
      { id: "a", requierePro: false },
      { id: "b", requierePro: true },
      { id: "c", requierePro: false },
    ]);
    expect(r.tecnicas.map((n) => n.id)).toEqual(["a", "c"]);
    expect(r.clases.map((n) => n.id)).toEqual(["b"]);
    expect(r.hayClases).toBe(true);
  });

  it("un mundo sin filas Pro no tiene pestaña Clases", () => {
    expect(partirCaminoPorClases([{ requierePro: false }]).hayClases).toBe(false);
  });
});

describe("resolverPestanaInicial", () => {
  it("solo acepta clases si el mundo las tiene", () => {
    expect(resolverPestanaInicial("clases", true)).toBe("clases");
    expect(resolverPestanaInicial("clases", false)).toBe("tecnicas");
    expect(resolverPestanaInicial(["clases"], true)).toBe("clases");
    expect(resolverPestanaInicial("otra", true)).toBe("tecnicas");
    expect(resolverPestanaInicial(undefined, true)).toBe("tecnicas");
  });
});

describe("hrefVolverAAprender", () => {
  it("vuelve a la pestaña de origen", () => {
    expect(hrefVolverAAprender("/calculia/aprender", true)).toBe("/calculia/aprender?tab=clases");
    expect(hrefVolverAAprender("/calculia/aprender", false)).toBe("/calculia/aprender");
  });
});
