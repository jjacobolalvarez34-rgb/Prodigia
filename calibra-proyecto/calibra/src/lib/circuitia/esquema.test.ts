import { describe, it, expect } from "vitest";
import { disenarEquivalente, disenarEsquema, textoResistor, textoValores, type Esquema } from "./esquema";
import { clasificarCircuito, resolverParaVisual } from "./visualesDatos";
import { resolverCircuito, type NodoCircuito } from "@/lib/circuitos/resolver";
import { LECCIONES_CIRCUITIA } from "./lecciones";
import type { VisualCircuitia } from "./visuales";
import { conRngSembrado, generarProblemaCircuitia, type ModoCircuitia } from "@/lib/practica/circuitia";

const r = (id: string, ohmios: number): NodoCircuito => ({ tipo: "resistor", id, ohmios });
const serie = (...hijos: NodoCircuito[]): NodoCircuito => ({ tipo: "serie", hijos });
const paralelo = (...hijos: NodoCircuito[]): NodoCircuito => ({ tipo: "paralelo", hijos });

function circuitosDeLecciones(): { donde: string; v: Extract<VisualCircuitia, { tipo: "circuitia.circuito" }> }[] {
  return LECCIONES_CIRCUITIA.flatMap((l) =>
    l.visuales.flatMap((x, i) => (x.tipo === "circuitia.circuito" ? [{ donde: `${l.slug}#${i}`, v: x as Extract<VisualCircuitia, { tipo: "circuitia.circuito" }> }] : []))
  );
}

function ids(n: NodoCircuito): string[] {
  return n.tipo === "resistor" ? [n.id] : n.hijos.flatMap(ids);
}

const dentro = (e: Esquema, x: number, y: number) => x >= 0 && x <= e.ancho && y >= 0 && y <= e.alto;

// Ancho estimado (px del viewBox) de un texto de 11.5 px: conservador.
const anchoTexto = (t: string) => t.length * 6.9;
interface Caja {
  nombre: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}
const cajaTexto = (nombre: string, xCentro: number, yBase: number, texto: string): Caja => ({
  nombre,
  x1: xCentro - anchoTexto(texto) / 2,
  x2: xCentro + anchoTexto(texto) / 2,
  y1: yBase - 11,
  y2: yBase + 3,
});
const seCruzan = (a: Caja, b: Caja) => a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;

describe("disenarEsquema: geometría del esquema", () => {
  const casos: { nombre: string; t: NodoCircuito }[] = [
    { nombre: "serie 2", t: serie(r("R1", 10), r("R2", 20)) },
    { nombre: "serie 3", t: serie(r("R1", 10), r("R2", 20), r("R3", 30)) },
    { nombre: "paralelo 2", t: paralelo(r("R1", 10), r("R2", 20)) },
    { nombre: "paralelo 3", t: paralelo(r("R1", 4), r("R2", 6), r("R3", 12)) },
    { nombre: "mixto 3", t: serie(r("Rs1", 10), paralelo(r("Rp1", 20), r("Rp2", 20))) },
    { nombre: "mixto 4", t: serie(r("Rs1", 5), paralelo(r("Rp1", 20), r("Rp2", 20)), r("Rs2", 5)) },
    { nombre: "un resistor", t: r("R1", 47) },
  ];

  for (const { nombre, t } of casos) {
    it(`${nombre}: cada resistor aparece una vez, todo queda dentro del lienzo y la batería tiene + a la derecha`, () => {
      const e = disenarEsquema(t, 12);
      expect(e.resistores.map((x) => x.id).sort()).toEqual(ids(t).sort());
      for (const c of e.cables) {
        expect(dentro(e, c.x1, c.y1) && dentro(e, c.x2, c.y2), `${nombre}: cable`).toBe(true);
      }
      for (const x of e.resistores) {
        for (const p of x.puntos) expect(dentro(e, p.x, p.y), `${nombre}: ${x.id}`).toBe(true);
        expect(x.puntos[0].y).toBe(x.y);
        // De izquierda a derecha, con 8 px de amplitud del zigzag.
        expect(x.puntos.every((p, i, a) => i === 0 || p.x > a[i - 1].x)).toBe(true);
        expect(Math.max(...x.puntos.map((p) => Math.abs(p.y - x.y)))).toBe(8);
      }
      for (const u of e.uniones) expect(dentro(e, u.x, u.y)).toBe(true);
      for (const f of e.flechas) expect(dentro(e, f.x, f.y)).toBe(true);
      expect(e.bateria.xNegativa).toBeLessThan(e.bateria.xPositiva);
      expect(dentro(e, e.bateria.xTexto, e.bateria.yTexto)).toBe(true);
    });

    it(`${nombre}: los caminos de la corriente respetan la ley de nodos y la corriente de cada resistor`, () => {
      const e = disenarEsquema(t, 12);
      const res = resolverCircuito(t, 12);
      // Cada resistor lo atraviesa exactamente un camino, con su propia corriente.
      for (const x of e.resistores) {
        const caminos = e.pulsos.filter((p) => x.puntos.every((q) => p.puntos.some((s) => s.x === q.x && s.y === q.y)));
        expect(caminos.length, `${nombre}: ${x.id}`).toBe(1);
        expect(Math.abs(caminos[0].corriente - res.get(x.id)!.corriente)).toBeLessThan(1e-12);
        // El camino recorre el zigzag de izquierda a derecha (sentido de la corriente).
        const i0 = caminos[0].puntos.findIndex((s) => s.x === x.puntos[0].x && s.y === x.puntos[0].y);
        expect(caminos[0].puntos[i0 + 1].x).toBeGreaterThan(x.puntos[0].x);
      }
      // Las ramas de un bloque suman la corriente total; el tronco lleva la total.
      const tronco = e.pulsos.filter((p) => Math.abs(p.corriente - e.corrienteTotal) < 1e-12);
      expect(tronco.length).toBeGreaterThanOrEqual(1);
      const ramas = e.pulsos.filter((p) => Math.abs(p.corriente - e.corrienteTotal) >= 1e-12);
      if (e.bloques.length > 0) {
        expect(Math.abs(ramas.reduce((a, p) => a + p.corriente, 0) - e.corrienteTotal)).toBeLessThan(1e-9);
        expect(ramas).toHaveLength(e.bloques.reduce((a, b) => a + b, 0));
      } else {
        expect(ramas).toHaveLength(0);
      }
    });

    it(`${nombre}: la velocidad de los pulsos es proporcional a la corriente (salvo el tope)`, () => {
      const e = disenarEsquema(t, 12);
      const referencia = e.pulsos.find((p) => Math.abs(p.corriente - e.corrienteTotal) < 1e-12)!;
      for (const p of e.pulsos) {
        if (p.duracionMs >= 2600) continue; // acotado
        expect(Math.abs(p.duracionMs * p.corriente - referencia.duracionMs * referencia.corriente) / (referencia.duracionMs * referencia.corriente)).toBeLessThan(0.01);
      }
    });
  }

  it("el sentido es el convencional: sale del + (derecha de la batería) por la cadena y vuelve al − por la izquierda", () => {
    const e = disenarEsquema(serie(r("R1", 10), r("R2", 20)), 12);
    const tronco = e.pulsos[0].puntos;
    expect(tronco[0]).toEqual({ x: e.bateria.xPositiva, y: e.bateria.y });
    const ultimo = tronco[tronco.length - 1];
    expect(ultimo.y).toBe(e.bateria.y);
    expect(ultimo.x).toBeLessThan(e.bateria.xNegativa + 1);
    // Baja por la derecha, vuelve por abajo hacia la izquierda y sube por la izquierda.
    const yAbajo = Math.max(...tronco.map((p) => p.y));
    expect(tronco.filter((p) => p.y === yAbajo).map((p) => p.x)).toEqual([336, 24]);
  });

  it("formas no soportadas o inválidas lanzan un error (el visual se omite)", () => {
    expect(() => disenarEsquema(serie(r("R1", 1), serie(r("R2", 1), r("R3", 1))), 12)).toThrow();
    expect(() => disenarEsquema(paralelo(r("R1", 1), serie(r("R2", 1), r("R3", 1))), 12)).toThrow();
    expect(() => disenarEsquema(paralelo(r("R1", 1)), 12)).toThrow();
    expect(() => disenarEsquema(serie(), 12)).toThrow();
  });

  it("todas las topologías que genera la práctica (4 modos, niveles 1-10) se pueden dibujar", () => {
    const formas = new Set<string>();
    for (const modo of ["serie", "paralelo", "mixto", "cualitativo"] as ModoCircuitia[]) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        for (let semilla = 1; semilla <= 12; semilla++) {
          let s = semilla * 7919 + nivel * 104729;
          const rng = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32);
          const p = conRngSembrado(rng, () => generarProblemaCircuitia(modo, nivel));
          const e = disenarEsquema(p.topologia, p.vFuente);
          expect(e.resistores.length).toBe(ids(p.topologia).length);
          formas.add(`${clasificarCircuito(p.topologia)}${e.resistores.length}`);
        }
      }
    }
    expect([...formas].sort()).toEqual(["mixto3", "mixto4", "paralelo2", "paralelo3", "serie2", "serie3"]);
  });
});

describe("textos del esquema: legibles y sin pisarse (viewBox de 360 px)", () => {
  it("en cada circuito de las lecciones, con los valores ya revelados, ningún texto se cruza con otro ni con un zigzag ajeno", () => {
    const lista = circuitosDeLecciones();
    expect(lista.length).toBeGreaterThanOrEqual(15);
    for (const { donde, v } of lista) {
      const e = disenarEsquema(v.topologia, v.vFuente);
      const valores = new Map(resolverParaVisual(v.topologia, v.vFuente).map((x) => [x.id, { voltaje: x.voltaje, corriente: x.corriente }]));
      const mostrar = v.mostrarValores ?? "ninguna";
      const cajas: Caja[] = [];
      for (const x of e.resistores) {
        cajas.push(cajaTexto(`${x.id} etiqueta`, x.xCentro, x.yEtiqueta, textoResistor(x)));
        const tv = textoValores(valores.get(x.id), mostrar);
        if (tv) cajas.push(cajaTexto(`${x.id} valores`, x.xCentro, x.yValor, tv));
      }
      cajas.push(cajaTexto("fuente", e.bateria.xTexto, e.bateria.yTexto, `${v.vFuente} V`));
      for (const c of cajas) {
        expect(c.x1, `${donde}: ${c.nombre} se sale por la izquierda`).toBeGreaterThanOrEqual(0);
        expect(c.x2, `${donde}: ${c.nombre} se sale por la derecha`).toBeLessThanOrEqual(e.ancho);
        expect(c.y1, `${donde}: ${c.nombre} se sale por arriba`).toBeGreaterThanOrEqual(0);
        expect(c.y2, `${donde}: ${c.nombre} se sale por abajo`).toBeLessThanOrEqual(e.alto);
      }
      for (let i = 0; i < cajas.length; i++) {
        for (let j = i + 1; j < cajas.length; j++) expect(seCruzan(cajas[i], cajas[j]), `${donde}: ${cajas[i].nombre} pisa a ${cajas[j].nombre}`).toBe(false);
      }
      // Ningún texto cruza un cable (rieles y lazo).
      for (const c of cajas) {
        for (const w of e.cables) {
          const caja: Caja = { nombre: "cable", x1: Math.min(w.x1, w.x2) - 1, x2: Math.max(w.x1, w.x2) + 1, y1: Math.min(w.y1, w.y2) - 1, y2: Math.max(w.y1, w.y2) + 1 };
          expect(seCruzan(c, caja), `${donde}: ${c.nombre} cruza un cable en (${w.x1},${w.y1})-(${w.x2},${w.y2})`).toBe(false);
        }
      }
      // Ningún texto queda sobre el zigzag de OTRO resistor.
      for (const c of cajas) {
        for (const x of e.resistores) {
          if (c.nombre.startsWith(`${x.id} `)) continue;
          const zig: Caja = { nombre: x.id, x1: x.x1, x2: x.x2, y1: x.y - 8, y2: x.y + 8 };
          expect(seCruzan(c, zig), `${donde}: ${c.nombre} pisa el zigzag de ${x.id}`).toBe(false);
        }
      }
    }
  });
});

describe("disenarEquivalente", () => {
  it("serie y paralelo (2 y 3 resistores): todo dentro del lienzo, el equivalente lleva el total y los cables aparecen de a uno", () => {
    for (const modo of ["serie", "paralelo"] as const) {
      for (const oh of [[8, 8], [10, 20], [10, 20, 30]]) {
        const e = disenarEquivalente(modo, oh, 1);
        expect(e.resistores.map((x) => x.ohmios)).toEqual(oh);
        for (const x of [...e.resistores, e.equivalente]) {
          for (const p of x.puntos) expect(p.x >= 0 && p.x <= e.ancho && p.y >= 0 && p.y <= e.alto, `${modo} ${oh}`).toBe(true);
        }
        for (const c of e.cables) {
          expect(c.desde).toBeGreaterThanOrEqual(1);
          expect(c.desde).toBeLessThanOrEqual(oh.length);
          expect(c.x1 >= 0 && c.x2 <= e.ancho && c.y1 >= 0 && c.y2 <= e.alto).toBe(true);
        }
        // Las etiquetas de resistores vecinos no se pisan.
        for (let i = 0; i + 1 < e.resistores.length; i++) {
          const a = cajaTexto("a", e.resistores[i].xCentro, e.resistores[i].yEtiqueta, textoResistor(e.resistores[i]));
          const b = cajaTexto("b", e.resistores[i + 1].xCentro, e.resistores[i + 1].yEtiqueta, textoResistor(e.resistores[i + 1]));
          expect(seCruzan(a, b), `${modo} ${oh}: etiquetas`).toBe(false);
        }
      }
    }
  });
  it("rechaza menos de 2 resistores", () => {
    expect(() => disenarEquivalente("serie", [1], 1)).toThrow();
  });
});
