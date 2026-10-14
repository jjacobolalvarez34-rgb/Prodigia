import { describe, expect, it } from "vitest";
import { desdeConMargen, dueloNuevo, estaBuscandoDuelo, marcarBuscandoDuelo, MARGEN_RELOJ_MS } from "./emparejamiento";

describe("emparejamiento de duelos (lado pasivo)", () => {
  it("encuentra el duelo nuevo aunque el reloj del dispositivo vaya adelantado", () => {
    // El teléfono cree que son las 12:00:30 pero la base creó el duelo a las 12:00:05.
    const inicioDispositivo = Date.parse("2026-10-13T12:00:30Z");
    const creadoEnLaBase = "2026-10-13T12:00:05Z";
    expect(creadoEnLaBase >= desdeConMargen(inicioDispositivo)).toBe(true);
    expect(Date.parse(desdeConMargen(inicioDispositivo))).toBe(inicioDispositivo - MARGEN_RELOJ_MS);
  });

  it("ignora los duelos pendientes que ya existían al empezar a buscar", () => {
    const conocidos = new Set(["reto-de-un-amigo"]);
    expect(dueloNuevo([{ id: "reto-de-un-amigo" }, { id: "emparejado" }], conocidos)).toEqual({ id: "emparejado" });
    expect(dueloNuevo([{ id: "reto-de-un-amigo" }], conocidos)).toBeNull();
    expect(dueloNuevo(null, conocidos)).toBeNull();
  });

  it("marca la búsqueda para callar el aviso de «te retaron»", () => {
    expect(estaBuscandoDuelo()).toBe(false);
    marcarBuscandoDuelo(true);
    expect(estaBuscandoDuelo()).toBe(true);
    marcarBuscandoDuelo(false);
    expect(estaBuscandoDuelo()).toBe(false);
  });
});
