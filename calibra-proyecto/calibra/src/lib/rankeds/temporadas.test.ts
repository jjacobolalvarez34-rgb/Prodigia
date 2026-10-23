import { describe, expect, it } from "vitest";
import { fijarUmbralProdigio, rangoDeElo } from "@/types/database";
import { capsulasAgrupadas, finTemporadaMs, temporadaRankedDe, tierTemporada } from "./temporadas";

describe("temporadas de rankeds", () => {
  it("la temporada 1 termina al acabar la primera Gran Alineación y cada una dura 28 días", () => {
    const fin1 = Date.UTC(2026, 9, 25, 2, 0, 0);
    expect(temporadaRankedDe(fin1 - 1)).toBe(1);
    expect(temporadaRankedDe(fin1)).toBe(2);
    expect(finTemporadaMs(1)).toBe(fin1);
    expect(finTemporadaMs(2) - finTemporadaMs(1)).toBe(28 * 86_400_000);
    expect(temporadaRankedDe(Date.UTC(2020, 0, 1))).toBe(1);
  });

  it("agrupa cápsulas repetidas y arma la tier", () => {
    expect(capsulasAgrupadas(["supernova", "supernova", "prisma"])).toEqual([
      { tipo: "supernova", nombre: "Cápsula supernova", cantidad: 2 },
      { tipo: "prisma", nombre: "Cápsula prisma", cantidad: 1 },
    ]);
    expect(tierTemporada(3)).toBe("v3");
    expect(tierTemporada(0)).toBe("v1");
  });
});

describe("rangos como Brawlhalla (0296)", () => {
  it("umbrales: Hierro, Bronce 800, Plata 1100, Oro 1400, Platino 1700, Diamante 2000", () => {
    expect(rangoDeElo(500).slug).toBe("hierro");
    expect(rangoDeElo(799).slug).toBe("hierro");
    expect(rangoDeElo(800).slug).toBe("bronce");
    expect(rangoDeElo(1100).slug).toBe("plata");
    expect(rangoDeElo(1400).slug).toBe("oro");
    expect(rangoDeElo(1700).slug).toBe("platino");
    expect(rangoDeElo(2000).slug).toBe("diamante");
    // Sin saber el corte del top 100, nadie es Prodigio aunque tenga mucho ELO.
    expect(rangoDeElo(2600).slug).toBe("diamante");
  });

  it("Prodigio es estar en el top 100 (y nunca por debajo de 2000)", () => {
    fijarUmbralProdigio(2150);
    expect(rangoDeElo(2149).slug).toBe("diamante");
    expect(rangoDeElo(2150).slug).toBe("prodigio");
    fijarUmbralProdigio(900);
    expect(rangoDeElo(1999).slug).toBe("platino");
    expect(rangoDeElo(2000).slug).toBe("prodigio");
  });
});
