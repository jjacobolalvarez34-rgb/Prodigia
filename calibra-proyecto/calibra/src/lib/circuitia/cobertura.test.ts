import { describe, it, expect } from "vitest";
import { LECCIONES_CIRCUITIA, TECNICAS, CLASES } from "./lecciones";
import type { LeccionCircuitia } from "./lecciones";
import type { VisualCircuitia, VisualCircuitiaCircuito } from "./visuales";
import { clasificarCircuito, listarResistores, type TipoCircuito } from "./visualesDatos";
import { conRngSembrado, generarProblemaCircuitia, type ModoCircuitia } from "@/lib/practica/circuitia";

// COBERTURA práctica <-> lecciones de Circuitia.
//
// La fuente de verdad de lo que se EVALÚA es src/lib/practica/circuitia.ts:
// se muestrea el generador real (4 modos, niveles 1-10, muchas semillas) y se
// comprueba qué de eso muestran los visuales de las lecciones. Los HUECOS
// REALES no se rellenan aquí: se listan en las constantes HUECOS_* de abajo
// (y se reportan). Si alguien agrega un visual que cierra un hueco, el test
// falla hasta que la constante se actualice: la lista no puede quedar vieja.

type Accion = "duplica" | "reduce";
type Magnitud = "corriente" | "voltaje";

const circuitos = (l: LeccionCircuitia): VisualCircuitiaCircuito[] => l.visuales.filter((v): v is VisualCircuitiaCircuito => (v as VisualCircuitia).tipo === "circuitia.circuito");

const forma = (v: VisualCircuitiaCircuito) => `${clasificarCircuito(v.topologia)}${listarResistores(v.topologia).length}`;

// ---------- Lo que evalúa la práctica ----------

function muestrear(modo: ModoCircuitia) {
  const salida = [];
  for (let nivel = 1; nivel <= 10; nivel++) {
    for (let semilla = 1; semilla <= 40; semilla++) {
      let s = semilla * 7919 + nivel * 104729 + modo.length * 31;
      const rng = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32);
      salida.push(conRngSembrado(rng, () => generarProblemaCircuitia(modo, nivel)));
    }
  }
  return salida;
}

const MODOS: ModoCircuitia[] = ["serie", "paralelo", "mixto", "cualitativo"];
const problemas = Object.fromEntries(MODOS.map((m) => [m, muestrear(m)])) as Record<ModoCircuitia, ReturnType<typeof muestrear>>;

const formasPractica = new Set(MODOS.flatMap((m) => problemas[m].map((p) => `${clasificarCircuito(p.topologia)}${listarResistores(p.topologia).length}`)));

function comboPractica(p: (typeof problemas.cualitativo)[number]): string {
  const accion: Accion = /se duplica a/.test(p.enunciado) ? "duplica" : "reduce";
  const magnitud: Magnitud = /qué le pasa a la corriente/.test(p.enunciado) ? "corriente" : "voltaje";
  return `${clasificarCircuito(p.topologia)}/${accion}/${magnitud}`;
}
const combosPractica = new Set(problemas.cualitativo.map(comboPractica));

// ---------- Lo que muestran las lecciones ----------

const formasLecciones = new Set(LECCIONES_CIRCUITIA.flatMap((l) => circuitos(l).map(forma)));

// Un «par de perturbación» = dos circuitos de la misma lección con los mismos
// resistores donde solo cambia el valor de uno (x2 o /2).
function combosLecciones(lecciones: LeccionCircuitia[] = LECCIONES_CIRCUITIA): Set<string> {
  const combos = new Set<string>();
  for (const l of lecciones) {
    const cs = circuitos(l);
    for (let i = 0; i < cs.length; i++) {
      // Solo en el orden en que se presentan (antes -> después).
      for (let j = i + 1; j < cs.length; j++) {
        const a = listarResistores(cs[i].topologia);
        const b = listarResistores(cs[j].topologia);
        if (a.length !== b.length || a.some((x, k) => x.id !== b[k].id)) continue;
        const distintos = a.map((x, k) => [x.ohmios, b[k].ohmios]).filter(([x, y]) => x !== y);
        if (distintos.length !== 1) continue;
        const [antes, despues] = distintos[0];
        const accion: Accion | null = despues === antes * 2 ? "duplica" : despues === antes / 2 ? "reduce" : null;
        if (!accion) continue;
        const mostrado = cs[j].mostrarValores ?? "ninguna";
        for (const m of ["corriente", "voltaje"] as Magnitud[]) {
          if (mostrado === m || mostrado === "ambas") combos.add(`${clasificarCircuito(cs[j].topologia)}/${accion}/${m}`);
        }
      }
    }
  }
  return combos;
}

// ---------- HUECOS REALES (se reportan, no se rellenan) ----------

// Formas de circuito que genera la práctica y ningún visual de las lecciones
// dibuja. Vacío desde que Fundamentos (Clase 1) dibuja 3 resistores en serie.
const HUECOS_FORMAS: string[] = [];

// Combinaciones forma/acción/magnitud del modo cualitativo de la práctica que
// ninguna lección ilustra con un par antes/después. Vacío desde que las Clases
// de Razonamiento cualitativo cubren serie, paralelo y mixto, duplicando y
// reduciendo, en corriente y en voltaje. Si la práctica agrega una combinación
// nueva, el test de abajo falla hasta que se enseñe o se liste aquí.
const HUECOS_CUALITATIVO: string[] = [];

describe("cobertura práctica <-> lecciones de Circuitia", () => {
  it("el muestreo del generador real encuentra las formas y combinaciones esperadas (si esto falla, cambió la práctica)", () => {
    expect([...formasPractica].sort()).toEqual(["mixto3", "mixto4", "paralelo2", "paralelo3", "serie2", "serie3"]);
    expect(combosPractica.size).toBe(12);
  });

  it("cada modo de la práctica tiene al menos una Técnica y una Clase con un visual de su forma de circuito", () => {
    const formasDe = (ls: LeccionCircuitia[]) => new Set(ls.flatMap((l) => circuitos(l).map((v) => clasificarCircuito(v.topologia))));
    for (const modo of ["serie", "paralelo", "mixto"] as TipoCircuito[]) {
      expect(formasDe(TECNICAS).has(modo), `Técnicas: ${modo}`).toBe(true);
      expect(formasDe(CLASES).has(modo), `Clases: ${modo}`).toBe(true);
    }
    // Cualitativo: hay pares antes/después en una Técnica y en una Clase.
    expect(combosLecciones(TECNICAS).size).toBeGreaterThan(0);
    expect(combosLecciones(CLASES).size).toBeGreaterThan(0);
  });

  it("toda forma de circuito de la práctica (incluida serie3) tiene un visual en las lecciones (huecos = HUECOS_FORMAS)", () => {
    const huecos = [...formasPractica].filter((f) => !formasLecciones.has(f)).sort();
    expect(huecos).toEqual(HUECOS_FORMAS);
  });

  it("cada magnitud que pide la práctica (corriente y voltaje) se muestra en serie, paralelo y mixto", () => {
    const cubierto = new Set<string>();
    for (const l of LECCIONES_CIRCUITIA) {
      for (const v of circuitos(l)) {
        const m = v.mostrarValores ?? "ninguna";
        const t = clasificarCircuito(v.topologia);
        if (m === "corriente" || m === "ambas") cubierto.add(`${t}/corriente`);
        if (m === "voltaje" || m === "ambas") cubierto.add(`${t}/voltaje`);
      }
    }
    const pedido = ["serie", "paralelo", "mixto"].flatMap((t) => ["corriente", "voltaje"].map((m) => `${t}/${m}`));
    expect(pedido.filter((x) => !cubierto.has(x))).toEqual([]);
  });

  it("las 12 combinaciones forma/acción/magnitud del modo cualitativo tienen su par antes/después (huecos = HUECOS_CUALITATIVO)", () => {
    const enLecciones = combosLecciones();
    const huecos = [...combosPractica].filter((c) => !enLecciones.has(c)).sort();
    expect(huecos).toEqual([...HUECOS_CUALITATIVO].sort());
    // Lo que sí ilustran las lecciones es un subconjunto de lo que evalúa la práctica.
    for (const c of enLecciones) expect(combosPractica.has(c), c).toBe(true);
  });

  it("conceptos que evalúa la práctica y su lección: Ley de Ohm, R_eq serie/paralelo (incl. R/2), corriente en serie, voltaje en paralelo, colapsar el bloque y «no cambia»", () => {
    const todos = LECCIONES_CIRCUITIA.flatMap((l) => l.visuales as VisualCircuitia[]);
    expect(todos.some((v) => v.tipo === "circuitia.leyOhm")).toBe(true);
    const eq = todos.filter((v) => v.tipo === "circuitia.resistenciaEquivalente");
    expect(eq.some((v) => v.modo === "serie")).toBe(true);
    expect(eq.some((v) => v.modo === "paralelo")).toBe(true);
    // Caso especial de dos resistores iguales en paralelo (R/2).
    expect(eq.some((v) => v.modo === "paralelo" && v.ohmios.length === 2 && v.ohmios[0] === v.ohmios[1])).toBe(true);
    const cs = todos.filter((v): v is VisualCircuitiaCircuito => v.tipo === "circuitia.circuito");
    expect(cs.some((v) => clasificarCircuito(v.topologia) === "serie" && v.mostrarValores === "corriente")).toBe(true);
    expect(cs.some((v) => clasificarCircuito(v.topologia) === "paralelo" && v.mostrarValores === "voltaje")).toBe(true);
    // Colapsar el bloque en paralelo de un mixto.
    const conBloque = LECCIONES_CIRCUITIA.filter((l) => circuitos(l).some((v) => clasificarCircuito(v.topologia) === "mixto") && (l.visuales as VisualCircuitia[]).some((v) => v.tipo === "circuitia.resistenciaEquivalente" && v.modo === "paralelo"));
    expect(conBloque.length).toBeGreaterThanOrEqual(2);
    // «No cambia»: rama hermana de un paralelo que conserva su corriente al cambiar otra.
    const hermana = LECCIONES_CIRCUITIA.some((l) => {
      const ps = circuitos(l).filter((v) => clasificarCircuito(v.topologia) === "paralelo" && v.resaltarId);
      return ps.length >= 2 && ps.some((a, i) => ps.some((b, j) => i !== j && a.resaltarId === b.resaltarId));
    });
    expect(hermana).toBe(true);
  });

  it("TODA Técnica y Clase tiene al menos un visual", () => {
    for (const l of LECCIONES_CIRCUITIA) expect(l.visuales.length, l.slug).toBeGreaterThanOrEqual(1);
  });
});
