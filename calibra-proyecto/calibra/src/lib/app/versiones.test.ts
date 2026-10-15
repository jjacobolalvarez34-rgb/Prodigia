import { describe, expect, it } from "vitest";
import { compararVersiones, hayVersionNueva, partesVersion } from "./versiones";

describe("versiones de la app", () => {
  it("lee tags de GitHub y versiones de app.json", () => {
    expect(partesVersion("v0.4.0")).toEqual([0, 4, 0]);
    expect(partesVersion("0.10")).toEqual([0, 10, 0]);
    expect(partesVersion("APK")).toBeNull();
  });

  it("compara número por número, no como texto", () => {
    expect(compararVersiones("0.10.0", "0.9.0")).toBeGreaterThan(0);
    expect(compararVersiones("v0.4.0", "0.4.0")).toBe(0);
  });

  it("solo avisa si la publicada es más nueva", () => {
    expect(hayVersionNueva("0.4.0", "v0.5.0")).toBe(true);
    expect(hayVersionNueva("0.5.0", "v0.5.0")).toBe(false);
    expect(hayVersionNueva("0.6.0", "v0.5.0")).toBe(false);
    expect(hayVersionNueva("0.5.0", "APK")).toBe(false);
    expect(hayVersionNueva(null, "v0.5.0")).toBe(false);
  });
});
