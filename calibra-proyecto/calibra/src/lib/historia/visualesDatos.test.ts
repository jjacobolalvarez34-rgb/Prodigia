import { describe, expect, it } from "vitest";
import { HECHOS } from "./tabla";
import { siglo } from "./tiempo";
import { EPOCAS } from "./epocas";
import {
  MEDIDAS_LINEA,
  MEDIDAS_SINCRONIA,
  SEPARACION_MINIMA,
  datosCausas,
  datosEpocas,
  datosLinea,
  datosPersonajes,
  datosSiglos,
  datosSincronia,
  textoCausas,
  textoLinea,
  textoSincronia,
} from "./visualesDatos";

// Funciones puras que calculan lo que dibujan los visuales de Historia. Los límites de
// estos tests salen de la regla de cada función (medidas fijas, redondeo a 2 decimales,
// separación mínima), no de una estimación.

const dosDecimales = (x: number) => Math.round(x * 100) / 100 === x;
const continuo = (a: number) => (a < 0 ? a + 1 : a);

describe("datosLinea: línea de tiempo", () => {
  const ids = ["escritura-cuneiforme", "piramide-de-keops", "batalla-de-maraton", "asesinato-de-julio-cesar", "caida-de-roma-occidente"];

  it("ordena por año, sin importar el orden dado, y las filas tienen altura fija (las etiquetas no se solapan)", () => {
    const d = datosLinea({ tipo: "historia.linea", hechos: [...ids].reverse() });
    expect(d.filas.map((f) => f.anio)).toEqual([...d.filas.map((f) => f.anio)].sort((a, b) => a - b));
    for (let i = 1; i < d.filas.length; i++) expect(d.filas[i].yFila - d.filas[i - 1].yFila, `fila ${i}`).toBe(MEDIDAS_LINEA.altoFila);
    expect(d.alto).toBe(d.filas.length * MEDIDAS_LINEA.altoFila + 2 * MEDIDAS_LINEA.margen);
  });

  it("en escala proporcional el punto del eje es proporcional al año (con el salto sin año 0) y crece con el tiempo", () => {
    const d = datosLinea({ tipo: "historia.linea", hechos: ids });
    const min = continuo(d.filas[0].anio);
    const max = continuo(d.filas[d.filas.length - 1].anio);
    const util = d.alto - 2 * MEDIDAS_LINEA.margen;
    for (const f of d.filas) {
      const esperado = MEDIDAS_LINEA.margen + ((continuo(f.anio) - min) / (max - min)) * util;
      expect(Math.abs(f.yEje - esperado), f.id).toBeLessThanOrEqual(0.005 + 1e-9);
    }
    for (let i = 1; i < d.filas.length; i++) expect(d.filas[i].yEje, `punto ${i}`).toBeGreaterThan(d.filas[i - 1].yEje);
    expect(d.cruzaEra).toBe(true);
    expect(d.eraY).not.toBeNull();
    expect(d.eraY!).toBeGreaterThan(d.filas[3].yEje);
    expect(d.eraY!).toBeLessThan(d.filas[4].yEje);
  });

  it("las marcas del eje son años redondos, ordenadas, dentro del rango y a lo sumo 6", () => {
    const d = datosLinea({ tipo: "historia.linea", hechos: ids });
    expect(d.marcas.length).toBeGreaterThan(0);
    expect(d.marcas.length).toBeLessThanOrEqual(6);
    for (let i = 1; i < d.marcas.length; i++) expect(d.marcas[i].y).toBeGreaterThan(d.marcas[i - 1].y);
    for (const m of d.marcas) {
      expect(m.y).toBeGreaterThanOrEqual(MEDIDAS_LINEA.margen);
      expect(m.y).toBeLessThanOrEqual(d.alto - MEDIDAS_LINEA.margen);
      expect(m.texto).toMatch(/^\d+( a\. C\.| d\. C\.)?$/);
    }
  });

  it("en modo «orden» el punto va a la altura de su etiqueta y no hay marcas de escala", () => {
    const d = datosLinea({ tipo: "historia.linea", hechos: ["herramientas-de-piedra", "uso-del-fuego", "homo-sapiens"], escala: "orden" });
    for (const f of d.filas) expect(f.yEje).toBe(f.yFila);
    expect(d.marcas).toEqual([]);
    expect(d.eraY).toBeNull();
  });

  it("señala la superposición de fechas por margen (Prehistoria) y no en hechos bien separados", () => {
    expect(datosLinea({ tipo: "historia.linea", hechos: ["uso-del-fuego", "homo-sapiens"], escala: "orden" }).superposicion).toBe(false);
    expect(datosLinea({ tipo: "historia.linea", hechos: ["pinturas-de-lascaux", "poblamiento-de-america"], escala: "orden" }).superposicion).toBe(true);
    expect(datosLinea({ tipo: "historia.linea", hechos: ids }).superposicion).toBe(false);
  });

  it("toda coordenada está redondeada a 2 decimales (Node y Chromium no difieren en el último bit)", () => {
    for (const hs of [ids, HECHOS.filter((h) => h.epoca === "contemporanea").slice(0, 10).map((h) => h.id)]) {
      const d = datosLinea({ tipo: "historia.linea", hechos: hs });
      for (const f of d.filas) {
        expect(dosDecimales(f.yEje), f.id).toBe(true);
        expect(dosDecimales(f.yFila), f.id).toBe(true);
      }
      for (const m of d.marcas) expect(dosDecimales(m.y)).toBe(true);
    }
  });

  it("rechaza datos inválidos: pocos o demasiados hechos, repetidos, ids desconocidos y escala proporcional con un solo año", () => {
    expect(() => datosLinea({ tipo: "historia.linea", hechos: ["homo-sapiens"] })).toThrow();
    expect(() => datosLinea({ tipo: "historia.linea", hechos: HECHOS.slice(0, MEDIDAS_LINEA.maxHechos + 1).map((h) => h.id) })).toThrow();
    expect(() => datosLinea({ tipo: "historia.linea", hechos: ["homo-sapiens", "homo-sapiens"] })).toThrow();
    expect(() => datosLinea({ tipo: "historia.linea", hechos: ["homo-sapiens", "no-existe"] })).toThrow();
    expect(() => datosLinea({ tipo: "historia.linea", hechos: ["toma-de-la-bastilla", "derechos-del-hombre"] })).toThrow();
    expect(() => datosLinea({ tipo: "historia.linea", hechos: "homo-sapiens" as unknown as string[] })).toThrow();
  });

  it("el texto alternativo lista todos los hechos con su año", () => {
    const t = textoLinea({ tipo: "historia.linea", hechos: ids });
    for (const id of ids) expect(t).toContain(HECHOS.find((h) => h.id === id)!.nombre);
    expect(t).toContain("44 a. C.");
    expect(t).toContain("476 d. C.");
  });
});

describe("datosCausas: cadena causal", () => {
  it("cada eslabón tiene que ser una relación de la tabla, y los roles son causa, hecho y consecuencia", () => {
    const n = datosCausas({ tipo: "historia.causas", cadena: ["asesinato-de-francisco-fernando", "primera-guerra-mundial", "revolucion-rusa", "fundacion-de-la-urss"] });
    expect(n.map((x) => x.rol)).toEqual(["causa", "hecho", "hecho", "consecuencia"]);
    expect(textoCausas({ tipo: "historia.causas", cadena: ["fin-de-la-glaciacion", "inicio-de-la-agricultura"] })).toContain("→");
  });

  it("rechaza una cadena cuyo eslabón no es causa del siguiente, en orden inverso, repetida o fuera de tamaño", () => {
    expect(() => datosCausas({ tipo: "historia.causas", cadena: ["primera-guerra-mundial", "asesinato-de-francisco-fernando"] })).toThrow();
    expect(() => datosCausas({ tipo: "historia.causas", cadena: ["homo-sapiens", "toma-de-la-bastilla"] })).toThrow();
    expect(() => datosCausas({ tipo: "historia.causas", cadena: ["primera-guerra-mundial"] })).toThrow();
    expect(() => datosCausas({ tipo: "historia.causas", cadena: ["a", "b", "c", "d", "e", "f"] })).toThrow();
  });
});

describe("datosSiglos: año a siglo con el cálculo a la vista", () => {
  it("calcula centenas, resto, siglo y límites (d. C. y a. C.), con años redondos que cierran el siglo", () => {
    const [a, b, c, d] = datosSiglos({ tipo: "historia.siglos", ejemplos: [1492, 1900, -44, "batalla-de-maraton"] });
    expect(a).toMatchObject({ centenas: 14, resto: 92, n: 15, romano: "XV", siglo: "Siglo XV", desde: "1401", hasta: "1500", cierra: false, aC: false });
    expect(b).toMatchObject({ centenas: 19, resto: 0, n: 19, romano: "XIX", siglo: "Siglo XIX", cierra: true });
    expect(c).toMatchObject({ n: 1, siglo: "Siglo I a. C.", aC: true, desde: "100 a. C.", hasta: "1 a. C." });
    expect(d).toMatchObject({ n: 5, siglo: "Siglo V a. C.", aC: true });
  });

  it("coincide con siglo() de tiempo.ts en todo el rango", () => {
    for (let a = -3000; a <= 2025; a += 7) {
      if (a === 0) continue;
      const [e] = datosSiglos({ tipo: "historia.siglos", ejemplos: [a] });
      expect({ n: e.n, aC: e.aC }, `año ${a}`).toEqual(siglo(a));
    }
  });

  it("rechaza hechos con un siglo inseguro y listas vacías o demasiado largas", () => {
    expect(() => datosSiglos({ tipo: "historia.siglos", ejemplos: ["ensenanzas-de-buda"] })).toThrow();
    expect(() => datosSiglos({ tipo: "historia.siglos", ejemplos: [] })).toThrow();
    expect(() => datosSiglos({ tipo: "historia.siglos", ejemplos: [1, 2, 3, 4, 5, 6, 7] })).toThrow();
    expect(() => datosSiglos({ tipo: "historia.siglos", ejemplos: [0] })).toThrow();
  });
});

describe("datosSincronia: carriles sobre un mismo eje", () => {
  const carriles = [
    { region: "europa" as const, hechos: ["batalla-de-maraton", "batalla-de-las-termopilas"] },
    { region: "oriente-proximo" as const, hechos: ["ciro-conquista-babilonia"] },
    { region: "asia-sur" as const, hechos: ["ensenanzas-de-buda"] },
  ];

  it("numera las marcas en orden cronológico, ubica cada una a escala y respeta la separación mínima", () => {
    const d = datosSincronia({ tipo: "historia.sincronia", carriles });
    expect(d.leyenda.map((m) => m.numero)).toEqual([1, 2, 3, 4]);
    const anios = d.leyenda.map((m) => m.anio);
    expect(anios).toEqual([...anios].sort((a, b) => a - b));
    const min = continuoMin(d.leyenda.map((m) => m.anio));
    const max = Math.max(...d.leyenda.map((m) => continuo(m.anio)));
    for (const m of d.leyenda) {
      const esperado = MEDIDAS_SINCRONIA.x0 + ((continuo(m.anio) - min) / (max - min)) * (MEDIDAS_SINCRONIA.x1 - MEDIDAS_SINCRONIA.x0);
      expect(Math.abs(m.x - esperado), m.id).toBeLessThanOrEqual(0.005 + 1e-9);
      expect(dosDecimales(m.x)).toBe(true);
    }
    for (const c of d.carriles) {
      const xs = c.marcas.map((m) => m.x).sort((a, b) => a - b);
      for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeGreaterThanOrEqual(SEPARACION_MINIMA);
    }
    expect(textoSincronia({ tipo: "historia.sincronia", carriles })).toContain("Europa");
  });

  it("rechaza carriles con marcas solapadas, repetidos, con pocos carriles o fuera de tamaño", () => {
    expect(() => datosSincronia({ tipo: "historia.sincronia", carriles: [{ region: "europa", hechos: ["batalla-de-maraton", "batalla-de-las-termopilas"] }, { region: "africa", hechos: ["fundacion-de-alejandria-inexistente"] }] })).toThrow();
    expect(() => datosSincronia({ tipo: "historia.sincronia", carriles: [{ region: "europa", hechos: ["toma-de-la-bastilla", "derechos-del-hombre"] }, { region: "america", hechos: ["guerra-de-los-siete-anios"] }] })).toThrow();
    expect(() => datosSincronia({ tipo: "historia.sincronia", carriles: [{ region: "europa", hechos: ["batalla-de-maraton"] }] })).toThrow();
    expect(() => datosSincronia({ tipo: "historia.sincronia", carriles: [{ region: "europa", hechos: ["batalla-de-maraton"] }, { region: "europa", hechos: ["muerte-de-socrates"] }] })).toThrow();
  });
});

function continuoMin(anios: number[]): number {
  return Math.min(...anios.map(continuo));
}

describe("datosEpocas y datosPersonajes", () => {
  it("las 5 épocas con su hecho frontera; la Prehistoria no tiene", () => {
    const b = datosEpocas({ tipo: "historia.epocas" });
    expect(b.map((x) => x.id)).toEqual(EPOCAS.map((e) => e.id));
    expect(b[0].frontera).toBeNull();
    expect(b.slice(1).map((x) => x.frontera!.id)).toEqual(["escritura-cuneiforme", "caida-de-roma-occidente", "llegada-de-colon", "toma-de-la-bastilla"]);
    expect(b.every((x) => x.resaltada)).toBe(true);
    const r = datosEpocas({ tipo: "historia.epocas", resaltar: ["edad-media"] });
    expect(r.filter((x) => x.resaltada).map((x) => x.id)).toEqual(["edad-media"]);
    expect(b[0].rango).toBe("hasta 3500 a. C.");
    expect(b[1].rango).toBe("3500 a. C. – 475 d. C.");
    expect(b[4].rango).toBe("desde 1789");
  });

  it("los ejemplos de una época tienen que ser de esa época y como máximo 3", () => {
    expect(datosEpocas({ tipo: "historia.epocas", ejemplos: { antiguedad: ["batalla-de-maraton"] } })[1].ejemplos[0].nombre).toBe("Batalla de Maratón");
    expect(() => datosEpocas({ tipo: "historia.epocas", ejemplos: { antiguedad: ["waterloo"] } })).toThrow();
    expect(() => datosEpocas({ tipo: "historia.epocas", ejemplos: { antiguedad: ["batalla-de-maraton", "batalla-de-las-termopilas", "muerte-de-socrates", "muerte-de-alejandro"] } })).toThrow();
  });

  it("las fichas traen rol, vida, época, región, dato y hechos de la tabla; un id desconocido lanza", () => {
    const [f] = datosPersonajes({ tipo: "historia.personaje", personajes: ["julio-cesar"] });
    expect(f).toMatchObject({ nombre: "Julio César", epocaEs: "Antigüedad", epocaEn: "Antiquity", regionEs: "Europa" });
    expect(f.vida).toContain("44 a. C.");
    expect(f.hechos.map((h) => h.id)).toContain("asesinato-de-julio-cesar");
    expect(() => datosPersonajes({ tipo: "historia.personaje", personajes: ["nadie"] })).toThrow();
    expect(() => datosPersonajes({ tipo: "historia.personaje", personajes: [] })).toThrow();
  });
});
