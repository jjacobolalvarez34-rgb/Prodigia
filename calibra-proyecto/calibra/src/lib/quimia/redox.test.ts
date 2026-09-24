import { describe, it, expect } from "vitest";
import katex from "katex";
import {
  CASOS_BALANCEO,
  EJEMPLOS_REDOX,
  ELECTROLISIS,
  PILAS,
  POTENCIALES,
  armarPila,
  atomosDeLado,
  balancearSemirreaccion,
  cargaDeLado,
  desplaza,
  ecuacionConNumeros,
  ecuacionLatex,
  electronesDelEjemplo,
  numerosDeOxidacion,
  numerosDelEjemplo,
  resolverCaso,
  serieDeActividad,
  sp,
  t,
  verificarEcuacion,
  verificarSemirreaccion,
  voltios,
  ladoLatex,
  type EcuacionIonica,
  type TerminoRedox,
} from "./redox";
import { datosDe } from "./datos";
import { ELEMENTOS } from "@/lib/practica/quimia";

// Verificación de src/lib/quimia/redox.ts: números de oxidación contra una
// tabla de referencia curada aparte, conservación de átomos y de carga en cada
// ecuación, ecuaciones ion-electrón contra los coeficientes clásicos y la
// serie de actividad contra un orden independiente.

describe("números de oxidación calculados", () => {
  const esperados: [string, number, string, number, Record<string, number>?][] = [
    ["KMnO4", 0, "Mn", 7],
    ["K2Cr2O7", 0, "Cr", 6],
    ["HNO3", 0, "N", 5],
    ["H2SO4", 0, "S", 6],
    ["H2O2", 0, "O", -1, { O: -1 }],
    ["CH4", 0, "C", -4],
    ["CO2", 0, "C", 4],
    ["CO", 0, "C", 2],
    ["NH4", 1, "N", -3],
    ["MnO4", -1, "Mn", 7],
    ["Cr2O7", -2, "Cr", 6],
    ["ClO4", -1, "Cl", 7],
    ["ClO", -1, "Cl", 1],
    ["NO3", -1, "N", 5],
    ["SO4", -2, "S", 6],
    ["Fe2O3", 0, "Fe", 3],
    ["NO", 0, "N", 2],
    ["CrO4", -2, "Cr", 6],
    ["MnO2", 0, "Mn", 4],
    ["NaH", 0, "H", -1, { H: -1 }],
  ];
  for (const [formula, carga, simbolo, esperado, fijos] of esperados) {
    it(`${formula}${carga ? ` (carga ${carga})` : ""}: ${simbolo} = ${esperado}`, () => {
      expect(numerosDeOxidacion(sp(formula, carga), fijos)[simbolo]).toBe(esperado);
    });
  }

  it("elementos solos e iones simples: su carga por átomo", () => {
    expect(numerosDeOxidacion(sp("O2"))).toEqual({ O: 0 });
    expect(numerosDeOxidacion(sp("Cu", 2))).toEqual({ Cu: 2 });
    expect(numerosDeOxidacion(sp("Cl", -1))).toEqual({ Cl: -1 });
  });

  it("con dos incógnitas lanza (hay que aclarar); con números que no suman, también", () => {
    expect(() => numerosDeOxidacion(sp("MnCl2"))).toThrow(/más de una incógnita/);
    expect(numerosDeOxidacion(sp("MnCl2"), { Cl: -1 })).toEqual({ Cl: -1, Mn: 2 });
    expect(() => numerosDeOxidacion(sp("NaCl"), { Na: 1, Cl: -2 })).toThrow();
  });
});

describe("ejemplos de reacciones redox", () => {
  it("cada ecuación está balanceada en átomos y en carga", () => {
    for (const e of EJEMPLOS_REDOX) verificarEcuacion(e.reactivos, e.productos);
  });

  it("los números de oxidación declarados (de → a) salen del cálculo, y los electrones perdidos = ganados", () => {
    for (const e of EJEMPLOS_REDOX) {
      const nums = numerosDelEjemplo(e);
      const izq = nums.slice(0, e.reactivos.length);
      const der = nums.slice(e.reactivos.length);
      const hay = (lado: typeof nums, simbolo: string, n: number) =>
        lado.some((x) => x.numeros[simbolo] === n);
      expect(hay(izq, e.oxida.simbolo, e.oxida.de), `${e.id}: ${e.oxida.simbolo} antes`).toBe(true);
      expect(hay(der, e.oxida.simbolo, e.oxida.a), `${e.id}: ${e.oxida.simbolo} después`).toBe(true);
      expect(hay(izq, e.reduce.simbolo, e.reduce.de), `${e.id}: ${e.reduce.simbolo} antes`).toBe(true);
      expect(hay(der, e.reduce.simbolo, e.reduce.a), `${e.id}: ${e.reduce.simbolo} después`).toBe(true);
      expect(e.oxida.a, e.id).toBeGreaterThan(e.oxida.de);
      expect(e.reduce.a, e.id).toBeLessThan(e.reduce.de);
      const { perdidos, ganados } = electronesDelEjemplo(e);
      expect(perdidos, e.id).toBe(ganados);
      // cuántos átomos hay realmente con ese número de oxidación en cada lado
      const contar = (lado: TerminoRedox[], simbolo: string, n: number) =>
        lado.reduce((a, x) => {
          const nn = numerosDeOxidacion(x.especie, e.fijos?.[x.especie.formula]);
          return a + (nn[simbolo] === n ? x.coef * (atomosDeLado([{ coef: 1, especie: x.especie }])[simbolo] ?? 0) : 0);
        }, 0);
      expect(contar(e.reactivos, e.oxida.simbolo, e.oxida.de), `${e.id}: átomos que se oxidan`).toBeGreaterThanOrEqual(e.oxida.n);
      expect(contar(e.productos, e.oxida.simbolo, e.oxida.a), `${e.id}: átomos oxidados`).toBeGreaterThanOrEqual(e.oxida.n);
      expect(contar(e.reactivos, e.reduce.simbolo, e.reduce.de), `${e.id}: átomos que se reducen`).toBeGreaterThanOrEqual(e.reduce.n);
      expect(contar(e.productos, e.reduce.simbolo, e.reduce.a), `${e.id}: átomos reducidos`).toBeGreaterThanOrEqual(e.reduce.n);
    }
  });

  it("el agente reductor contiene el elemento que se oxida y el oxidante el que se reduce, y ambos son reactivos", () => {
    for (const e of EJEMPLOS_REDOX) {
      const formulas = e.reactivos.map((x) => x.especie.formula);
      expect(formulas, e.id).toContain(e.agenteReductor);
      expect(formulas, e.id).toContain(e.agenteOxidante);
      expect(Object.keys(atomosDeLado([t(1, e.agenteReductor, 0)])).length >= 1, e.id).toBe(true);
    }
  });

  it("valores clásicos: KMnO4 + HCl (Mn +7 → +2, 10 Cl⁻ → 5 Cl₂), Cu + HNO3 (6 e⁻), Fe₂O₃ + CO (6 e⁻)", () => {
    const k = EJEMPLOS_REDOX.find((e) => e.id === "kmno4-hcl")!;
    expect(electronesDelEjemplo(k)).toEqual({ perdidos: 10, ganados: 10 });
    expect(EJEMPLOS_REDOX.find((e) => e.id === "cu-hno3")!.productos.map((x) => x.coef)).toEqual([3, 2, 4]);
    expect(electronesDelEjemplo(EJEMPLOS_REDOX.find((e) => e.id === "fe2o3-co")!).perdidos).toBe(6);
  });

  it("la ecuación con números de oxidación es LaTeX válido", () => {
    for (const e of EJEMPLOS_REDOX) {
      const tex = ecuacionConNumeros(e);
      expect(() => katex.renderToString(tex, { throwOnError: true }), e.id).not.toThrow();
      expect(tex, e.id).toContain("\\overset");
    }
  });
});

describe("balanceo ion-electrón", () => {
  it("cada semirreacción y cada ecuación iónica de los casos conserva átomos y carga", () => {
    expect(CASOS_BALANCEO.length).toBeGreaterThanOrEqual(7);
    for (const c of CASOS_BALANCEO) {
      const r = resolverCaso(c.id);
      for (const p of [r.reduccion, r.oxidacion]) {
        verificarSemirreaccion(p.conElectrones);
        verificarSemirreaccion(p.final);
        if (p.basico) verificarSemirreaccion(p.basico.neutralizada);
      }
      verificarEcuacion(r.suma.reactivos, r.suma.productos);
      // medio básico: no queda ningún H⁺; medio ácido: no queda ningún OH⁻
      const especies = [...r.suma.reactivos, ...r.suma.productos].map((x) => `${x.especie.formula}|${x.especie.carga}`);
      if (c.medio === "basico") expect(especies, c.id).not.toContain("H|1");
      else expect(especies, c.id).not.toContain("OH|-1");
      // ya no quedan electrones libres: los multiplicadores igualan lo que se pierde y se gana
      expect(r.oxidacion.final.electrones * r.suma.multOxidacion, c.id).toBe(r.reduccion.final.electrones * r.suma.multReduccion);
    }
  });

  const coef = (lado: TerminoRedox[]) => Object.fromEntries(lado.map((x) => [`${x.especie.formula}${x.especie.carga ? (x.especie.carga > 0 ? `+${x.especie.carga}` : x.especie.carga) : ""}`, x.coef]));

  it("las ecuaciones finales coinciden con los coeficientes clásicos de los libros", () => {
    const clasicos: Record<string, { R: Record<string, number>; P: Record<string, number> }> = {
      "mno4-fe2": { R: { "MnO4-1": 1, "Fe+2": 5, "H+1": 8 }, P: { "Mn+2": 1, "Fe+3": 5, H2O: 4 } },
      "cr2o7-fe2": { R: { "Cr2O7-2": 1, "Fe+2": 6, "H+1": 14 }, P: { "Cr+3": 2, "Fe+3": 6, H2O: 7 } },
      "mno4-h2o2": { R: { "MnO4-1": 2, H2O2: 5, "H+1": 6 }, P: { "Mn+2": 2, O2: 5, H2O: 8 } },
      "mno4-cl": { R: { "MnO4-1": 2, "Cl-1": 10, "H+1": 16 }, P: { "Mn+2": 2, Cl2: 5, H2O: 8 } },
      "cu-no3": { R: { Cu: 3, "NO3-1": 2, "H+1": 8 }, P: { "Cu+2": 3, NO: 2, H2O: 4 } },
      "mno4-i": { R: { "MnO4-1": 2, "I-1": 6, H2O: 4 }, P: { MnO2: 2, I2: 3, "OH-1": 8 } },
      "cr-oh3-clo": { R: { "Cr(OH)3": 2, "ClO-1": 3, "OH-1": 4 }, P: { "CrO4-2": 2, "Cl-1": 3, H2O: 5 } },
    };
    for (const [id, esp] of Object.entries(clasicos)) {
      const r = resolverCaso(id).suma;
      expect(coef(r.reactivos), `${id} reactivos`).toEqual(esp.R);
      expect(coef(r.productos), `${id} productos`).toEqual(esp.P);
    }
  });

  it("paso a paso en medio ácido: MnO4⁻ → Mn²⁺ necesita 4 H₂O, 8 H⁺ y 5 e⁻ (una reducción)", () => {
    const p = balancearSemirreaccion([t(1, "MnO4", -1)], [t(1, "Mn", 2)], "acido");
    expect(p.conAgua).toMatchObject({ agregadas: 4, lado: "productos" });
    expect(p.conProtones).toMatchObject({ agregados: 8, lado: "reactivos" });
    expect(p.conElectrones).toMatchObject({ electrones: 5, tipo: "reduccion" });
  });

  it("paso a paso en medio básico: MnO4⁻ → MnO2 suma 4 OH⁻ y pierde el agua sobrante (2 H₂O y 3 e⁻)", () => {
    const p = balancearSemirreaccion([t(1, "MnO4", -1)], [t(1, "MnO2")], "basico");
    expect(p.conProtones).toMatchObject({ agregados: 4, lado: "reactivos" });
    expect(p.basico!.conOH.agregados).toBe(4);
    expect(coef(p.final.reactivos)).toEqual({ "MnO4-1": 1, H2O: 2 });
    expect(coef(p.final.productos)).toEqual({ MnO2: 1, "OH-1": 4 });
    expect(p.final.electrones).toBe(3);
  });

  it("el LaTeX de cada lado es válido", () => {
    for (const c of CASOS_BALANCEO) {
      const r = resolverCaso(c.id);
      for (const tex of [ecuacionLatex(r.suma.reactivos, r.suma.productos), ladoLatex(r.reduccion.final.reactivos, r.reduccion.final.electrones)]) {
        expect(() => katex.renderToString(tex, { throwOnError: true }), c.id).not.toThrow();
      }
    }
  });
});

describe("serie de actividad, potenciales y pilas", () => {
  it("la serie calculada de la tabla coincide con el orden clásico de la serie de actividad (independiente)", () => {
    expect(serieDeActividad().map((x) => x.simbolo)).toEqual(["K", "Ca", "Na", "Mg", "Al", "Zn", "Fe", "Sn", "Pb", "H", "Cu", "Ag", "Au"]);
  });

  it("los potenciales tienen el signo esperado (metales más reactivos que el H: negativos; nobles: positivos)", () => {
    for (const s of ["K", "Ca", "Na", "Mg", "Al", "Zn", "Fe", "Sn", "Pb"]) expect(POTENCIALES.find((p) => p.simbolo === s)!.cV, s).toBeLessThan(0);
    for (const s of ["Cu", "Ag", "Au"]) expect(POTENCIALES.find((p) => p.simbolo === s)!.cV, s).toBeGreaterThan(0);
  });

  it("la carga del catión de cada par figura entre los estados de oxidación de la tabla (o el más común de la práctica)", () => {
    for (const p of POTENCIALES) {
      const datos = datosDe(p.simbolo);
      if (datos) expect(datos.estadosOxidacion, p.simbolo).toContain(p.carga);
      else expect(ELEMENTOS.find((e) => e.simbolo === p.simbolo)!.estadoOxidacionComun, p.simbolo).toBe(p.carga);
    }
  });

  it("voltios: coma decimal y signo menos tipográfico", () => {
    expect(voltios(110)).toBe("1,10");
    expect(voltios(-76)).toBe("−0,76");
    expect(voltios(0)).toBe("0,00");
  });

  it("pilas: el ánodo es el de menor potencial; E° pila = E° cátodo − E° ánodo (Daniell: 1,10 V; Zn/Ag: 1,56 V; Mg/Cu: 2,71 V)", () => {
    const esperado: Record<string, number> = { "Zn-Cu": 110, "Zn-Ag": 156, "Fe-Cu": 78, "Mg-Cu": 271, "Al-Cu": 200 };
    expect(PILAS).toHaveLength(5);
    for (const [a, c] of PILAS) {
      const p = armarPila(a, c);
      expect(p.cV, p.id).toBe(esperado[p.id]);
      expect(p.catodo.cV, p.id).toBeGreaterThan(p.anodo.cV);
      verificarSemirreaccion(p.oxidacion);
      verificarSemirreaccion(p.reduccion);
      verificarEcuacion(p.global.reactivos, p.global.productos);
      // ninguna especie de agua/H⁺ en una pila de metales
      expect(p.global.reactivos.every((x) => x.especie.formula !== "H2O"), p.id).toBe(true);
    }
    expect(() => armarPila("Cu", "Zn")).toThrow(/no es una pila espontánea/);
  });

  it("Zn + Ag⁺ → Zn²⁺ + Ag necesita 2 Ag⁺ por cada Zn; Al + Cu²⁺: 2 Al y 3 Cu²⁺", () => {
    const za = armarPila("Zn", "Ag").global;
    expect(za.reactivos.map((x) => [x.especie.formula, x.coef])).toEqual([["Zn", 1], ["Ag", 2]]);
    const ac = armarPila("Al", "Cu").global;
    expect(ac.reactivos.map((x) => [x.especie.formula, x.coef])).toEqual([["Al", 2], ["Cu", 3]]);
    expect(ac.electrones).toBe(6);
  });

  it("desplazamiento: Zn desplaza al Cu²⁺ pero no al revés; Fe reacciona con ácidos y Cu no", () => {
    expect(desplaza("Zn", "Cu")).toBe(true);
    expect(desplaza("Cu", "Zn")).toBe(false);
    expect(desplaza("Fe", "H")).toBe(true);
    expect(desplaza("Cu", "H")).toBe(false);
    expect(desplaza("Ag", "Cu")).toBe(false);
    expect(desplaza("Mg", "Fe")).toBe(true);
  });

  it("electrólisis: agua (2 H₂O → 2 H₂ + O₂, relación 2:1) y NaCl fundido (2 Na + Cl₂) conservan átomos y carga", () => {
    const suma = (e: EcuacionIonica) => Object.fromEntries([...e.reactivos, ...e.productos].map((x) => [x.especie.formula, x.coef]));
    const agua = ELECTROLISIS.find((x) => x.id === "agua")!;
    verificarSemirreaccion(agua.catodo);
    verificarSemirreaccion(agua.anodo);
    verificarEcuacion(agua.global.reactivos, agua.global.productos);
    expect(suma(agua.global)).toMatchObject({ H2O: 2, H2: 2, O2: 1 });
    const sal = ELECTROLISIS.find((x) => x.id === "nacl-fundido")!;
    verificarEcuacion(sal.global.reactivos, sal.global.productos);
    expect(suma(sal.global)).toMatchObject({ Na: 2, Cl2: 1 });
    expect(cargaDeLado(sal.global.reactivos)).toBe(0);
  });
});
