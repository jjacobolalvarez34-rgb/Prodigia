import { describe, expect, it } from "vitest";
import { anotarDueloEmparejado, desdeConMargen, dueloNuevo, esDueloEmparejado, estaBuscandoDuelo, GRACIA_FIN_BUSQUEDA_MS, marcarBuscandoDuelo, MARGEN_RELOJ_MS } from "./emparejamiento";

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

  it("no avisa como reto el duelo casual que llega tarde por Realtime (2026-10-29)", () => {
    const t = Date.parse("2026-10-29T12:00:00Z");
    // Un reto de verdad, sin buscar: se avisa.
    expect(esDueloEmparejado({ id: "reto-amigo" }, t)).toBe(false);
    // La base ya marca los del emparejamiento.
    expect(esDueloEmparejado({ id: "x", emparejado: true }, t)).toBe(true);
    // Buscando: el duelo encontrado se anota y la búsqueda termina antes del INSERT.
    marcarBuscandoDuelo(true);
    anotarDueloEmparejado("casual-1", t);
    marcarBuscandoDuelo(false);
    expect(esDueloEmparejado({ id: "casual-1" }, t + 5_000)).toBe(true);
    // Otra ronda de la misma serie, dentro de la gracia: tampoco.
    expect(esDueloEmparejado({ id: "casual-ronda-2" }, t + 5_000)).toBe(true);
    // Pasada la gracia, un reto nuevo vuelve a avisarse; el anotado sigue callado.
    expect(esDueloEmparejado({ id: "reto-despues" }, t + GRACIA_FIN_BUSQUEDA_MS + 1)).toBe(false);
    expect(esDueloEmparejado({ id: "casual-1" }, t + GRACIA_FIN_BUSQUEDA_MS + 1)).toBe(true);
  });
});
