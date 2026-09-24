import { describe, it, expect } from "vitest";
import katex from "katex";
import { CATALOGO_MOLECULAS, INFO_GRUPO, fichaDe } from "./moleculas";
import { contarCondensada, desdeSmiles, formulaMolecular, gruposFuncionales, hibridacionDe, hidrogenos, igualesFormula, nombreIUPAC, dibujarMolecula, type IdGrupo } from "./organica";
import { contarAtomos } from "./formulas";
import { COMPUESTOS_ORGANICOS } from "@/lib/practica/quimicaOrganica";

// Verificación del motor orgánico contra una tabla de nombres IUPAC y
// fórmulas moleculares CURADA APARTE (escrita a mano de tablas de referencia
// y de la definición de cada compuesto), y contra el banco de la práctica.

const ESPERADOS: Record<string, [string, string]> = {
  metano: ["metano", "CH4"],
  etano: ["etano", "C2H6"],
  propano: ["propano", "C3H8"],
  butano: ["butano", "C4H10"],
  pentano: ["pentano", "C5H12"],
  hexano: ["hexano", "C6H14"],
  heptano: ["heptano", "C7H16"],
  octano: ["octano", "C8H18"],
  nonano: ["nonano", "C9H20"],
  decano: ["decano", "C10H22"],
  "2-metilpropano": ["2-metilpropano", "C4H10"],
  "2-metilbutano": ["2-metilbutano", "C5H12"],
  "2,2-dimetilpropano": ["2,2-dimetilpropano", "C5H12"],
  "2-metilpentano": ["2-metilpentano", "C6H14"],
  "3-metilpentano": ["3-metilpentano", "C6H14"],
  "2,3-dimetilbutano": ["2,3-dimetilbutano", "C6H14"],
  "2,2-dimetilbutano": ["2,2-dimetilbutano", "C6H14"],
  "2,4-dimetilhexano": ["2,4-dimetilhexano", "C8H18"],
  "3-etil-5-metilheptano": ["3-etil-5-metilheptano", "C10H22"],
  "3-etil-2-metilpentano": ["3-etil-2-metilpentano", "C8H18"],
  "2,2,4-trimetilpentano": ["2,2,4-trimetilpentano", "C8H18"],
  eteno: ["eteno", "C2H4"],
  propeno: ["propeno", "C3H6"],
  "but-1-eno": ["but-1-eno", "C4H8"],
  "cis-but-2-eno": ["cis-but-2-eno", "C4H8"],
  "trans-but-2-eno": ["trans-but-2-eno", "C4H8"],
  "2-metilpropeno": ["2-metilprop-1-eno", "C4H8"],
  "pent-1-eno": ["pent-1-eno", "C5H10"],
  "pent-2-eno": ["pent-2-eno", "C5H10"],
  "2-metilbut-2-eno": ["2-metilbut-2-eno", "C5H10"],
  "3-metilbut-1-eno": ["3-metilbut-1-eno", "C5H10"],
  "buta-1,3-dieno": ["buta-1,3-dieno", "C4H6"],
  etino: ["etino", "C2H2"],
  propino: ["propino", "C3H4"],
  "but-1-ino": ["but-1-ino", "C4H6"],
  "but-2-ino": ["but-2-ino", "C4H6"],
  ciclopropano: ["ciclopropano", "C3H6"],
  ciclobutano: ["ciclobutano", "C4H8"],
  ciclopentano: ["ciclopentano", "C5H10"],
  ciclohexano: ["ciclohexano", "C6H12"],
  ciclohexeno: ["ciclohexeno", "C6H10"],
  benceno: ["benceno", "C6H6"],
  metilbenceno: ["metilbenceno", "C7H8"],
  "1,2-dimetilbenceno": ["1,2-dimetilbenceno", "C8H10"],
  "1,3-dimetilbenceno": ["1,3-dimetilbenceno", "C8H10"],
  "1,4-dimetilbenceno": ["1,4-dimetilbenceno", "C8H10"],
  clorobenceno: ["clorobenceno", "C6H5Cl"],
  fenol: ["fenol", "C6H6O"],
  metilciclohexano: ["metilciclohexano", "C7H14"],
  metanol: ["metanol", "CH4O"],
  etanol: ["etanol", "C2H6O"],
  "propan-1-ol": ["propan-1-ol", "C3H8O"],
  "propan-2-ol": ["propan-2-ol", "C3H8O"],
  "butan-1-ol": ["butan-1-ol", "C4H10O"],
  "butan-2-ol": ["butan-2-ol", "C4H10O"],
  "2-metilpropan-2-ol": ["2-metilpropan-2-ol", "C4H10O"],
  "etano-1,2-diol": ["etano-1,2-diol", "C2H6O2"],
  "propano-1,2,3-triol": ["propano-1,2,3-triol", "C3H8O3"],
  metoximetano: ["metoximetano", "C2H6O"],
  metoxietano: ["metoxietano", "C3H8O"],
  etoxietano: ["etoxietano", "C4H10O"],
  metanal: ["metanal", "CH2O"],
  etanal: ["etanal", "C2H4O"],
  propanal: ["propanal", "C3H6O"],
  butanal: ["butanal", "C4H8O"],
  propanona: ["propanona", "C3H6O"],
  butanona: ["butanona", "C4H8O"],
  "pentan-2-ona": ["pentan-2-ona", "C5H10O"],
  "pentan-3-ona": ["pentan-3-ona", "C5H10O"],
  "acido-metanoico": ["ácido metanoico", "CH2O2"],
  "acido-etanoico": ["ácido etanoico", "C2H4O2"],
  "acido-propanoico": ["ácido propanoico", "C3H6O2"],
  "acido-butanoico": ["ácido butanoico", "C4H8O2"],
  "acido-2-metilpropanoico": ["ácido 2-metilpropanoico", "C4H8O2"],
  "metanoato-de-metilo": ["metanoato de metilo", "C2H4O2"],
  "metanoato-de-etilo": ["metanoato de etilo", "C3H6O2"],
  "etanoato-de-metilo": ["etanoato de metilo", "C3H6O2"],
  "etanoato-de-etilo": ["etanoato de etilo", "C4H8O2"],
  "propanoato-de-metilo": ["propanoato de metilo", "C4H8O2"],
  metanamina: ["metanamina", "CH5N"],
  etanamina: ["etanamina", "C2H7N"],
  "propan-1-amina": ["propan-1-amina", "C3H9N"],
  "propan-2-amina": ["propan-2-amina", "C3H9N"],
  metanamida: ["metanamida", "CH3NO"],
  etanamida: ["etanamida", "C2H5NO"],
  propanamida: ["propanamida", "C3H7NO"],
  clorometano: ["clorometano", "CH3Cl"],
  diclorometano: ["diclorometano", "CH2Cl2"],
  triclorometano: ["triclorometano", "CHCl3"],
  cloroetano: ["cloroetano", "C2H5Cl"],
  "1,2-dicloroetano": ["1,2-dicloroetano", "C2H4Cl2"],
  bromoetano: ["bromoetano", "C2H5Br"],
  "1-cloropropano": ["1-cloropropano", "C3H7Cl"],
  "2-cloropropano": ["2-cloropropano", "C3H7Cl"],
  "1,2-dibromoetano": ["1,2-dibromoetano", "C2H4Br2"],
  "2-cloro-2-metilpropano": ["2-cloro-2-metilpropano", "C4H9Cl"],
  "2-hidroxipropanal": ["2-hidroxipropanal", "C3H6O2"],
  "1-hidroxipropan-2-ona": ["1-hidroxipropan-2-ona", "C3H6O2"],
  "acido-3-oxobutanoico": ["ácido 3-oxobutanoico", "C4H6O3"],
  "glucosa-abierta": ["2,3,4,5,6-pentahidroxihexanal", "C6H12O6"],
  "acido-2-hidroxipropanoico": ["ácido 2-hidroxipropanoico", "C3H6O3"],
  "acido-2-aminoetanoico": ["ácido 2-aminoetanoico", "C2H5NO2"],
};

describe("catálogo de moléculas: nombre IUPAC y fórmula calculados vs. tabla de referencia", () => {
  it("el catálogo y la tabla de referencia tienen exactamente los mismos ids, sin repetidos", () => {
    const ids = CATALOGO_MOLECULAS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(Object.keys(ESPERADOS).sort());
  });

  for (const e of CATALOGO_MOLECULAS) {
    it(`${e.id}: nombre y fórmula`, () => {
      const [nombre, formula] = ESPERADOS[e.id];
      const f = fichaDe(e.id);
      expect(f.nombre).toBe(nombre);
      expect(f.formula).toBe(formula);
    });
  }

  it("la fórmula condensada suma exactamente los átomos de la fórmula molecular", () => {
    let comprobadas = 0;
    for (const e of CATALOGO_MOLECULAS) {
      const f = fichaDe(e.id);
      if (f.condensada === null) continue;
      expect(contarCondensada(f.condensada), `${e.id}: ${f.condensada}`).toEqual(formulaMolecular(f.molecula));
      expect(igualesFormula(formulaMolecular(f.molecula), contarAtomos(f.formula)), e.id).toBe(true);
      comprobadas++;
    }
    expect(comprobadas).toBeGreaterThan(80);
  });

  it("algunas condensadas conocidas", () => {
    expect(fichaDe("2-metilbutano").condensada).toBe("CH3-CH(CH3)-CH2-CH3");
    expect(fichaDe("etanol").condensada).toBe("CH3-CH2OH");
    expect(fichaDe("acido-etanoico").condensada).toBe("CH3-COOH");
    expect(fichaDe("propanona").condensada).toBe("CH3-CO-CH3");
    expect(fichaDe("eteno").condensada).toBe("CH2=CH2");
    expect(fichaDe("etino").condensada).toBe("CH≡CH");
    expect(fichaDe("etanal").condensada).toBe("CH3-CHO");
    expect(fichaDe("etanoato-de-etilo").condensada).toBe("CH3-COO-CH2-CH3");
    expect(fichaDe("2,2-dimetilpropano").condensada).toBe("CH3-C(CH3)2-CH3");
  });

  it("el carbono siempre tiene 4 enlaces y ningún átomo excede su valencia", () => {
    for (const e of CATALOGO_MOLECULAS) {
      const m = fichaDe(e.id).molecula;
      m.atomos.forEach((el, i) => {
        expect(hidrogenos(m, i), `${e.id} átomo ${i}`).toBeGreaterThanOrEqual(0);
        if (el === "C") expect(hidrogenos(m, i) + m.ady[i].reduce((a, x) => a + x.orden, 0), `${e.id}`).toBe(4);
      });
    }
  });
});

describe("el motor de nombres respeta las reglas (numeración y orden alfabético)", () => {
  it("numeración: el localizador más bajo va al grupo principal, después a las insaturaciones y después a los sustituyentes", () => {
    expect(nombreIUPAC(desdeSmiles("CC(C)CC(C)CC"))).toBe("2,4-dimetilhexano");
    expect(nombreIUPAC(desdeSmiles("CCC(C)CC"))).toBe("3-metilpentano");
    expect(nombreIUPAC(desdeSmiles("CC(C)CCCO"))).toBe("4-metilpentan-1-ol");
    expect(nombreIUPAC(desdeSmiles("CC(O)CC=C"))).toBe("pent-4-en-2-ol");
    expect(nombreIUPAC(desdeSmiles("C=CCCO"))).toBe("but-3-en-1-ol");
    expect(nombreIUPAC(desdeSmiles("CC(Cl)C=C"))).toBe("3-clorobut-1-eno");
    // los enlaces múltiples ganan sobre los sustituyentes
    expect(nombreIUPAC(desdeSmiles("CC(C)=CC"))).toBe("2-metilbut-2-eno");
    expect(nombreIUPAC(desdeSmiles("C=CC(C)C"))).toBe("3-metilbut-1-eno");
  });

  it("empate de localizadores: el que se cita primero alfabéticamente recibe el número más bajo", () => {
    expect(nombreIUPAC(desdeSmiles("CCC(CC)CC(C)CC"))).toBe("3-etil-5-metilheptano");
    expect(nombreIUPAC(desdeSmiles("CC(Cl)CC(Br)C"))).toBe("2-bromo-4-cloropentano");
  });

  it("la cadena principal es la más larga, aunque el dibujo la presente torcida", () => {
    expect(nombreIUPAC(desdeSmiles("C(C)(C)CC(C)C"))).toBe("2,4-dimetilpentano");
    expect(nombreIUPAC(desdeSmiles("CCCC(C)CC"))).toBe("3-metilhexano");
    expect(nombreIUPAC(desdeSmiles("CC(CC)CCC"))).toBe("3-metilhexano");
  });

  it("el grupo principal manda sobre la longitud: la cadena tiene que contenerlo", () => {
    expect(nombreIUPAC(desdeSmiles("CCC(CO)CC"))).toBe("2-etilbutan-1-ol");
    expect(nombreIUPAC(desdeSmiles("CC(C)CC=O"))).toBe("3-metilbutanal");
    expect(nombreIUPAC(desdeSmiles("CC(=O)C(C)C"))).toBe("3-metilbutan-2-ona");
  });

  it("ácido > éster > amida > aldehído > cetona > alcohol > amina: los demás grupos van como prefijos", () => {
    expect(nombreIUPAC(desdeSmiles("OCC(=O)C"))).toBe("1-hidroxipropan-2-ona");
    expect(nombreIUPAC(desdeSmiles("CC(O)C=O"))).toBe("2-hidroxipropanal");
    expect(nombreIUPAC(desdeSmiles("CC(=O)CC(=O)O"))).toBe("ácido 3-oxobutanoico");
    expect(nombreIUPAC(desdeSmiles("NCCO"))).toBe("2-aminoetan-1-ol");
  });

  it("localizadores que se omiten solo cuando no hay ambigüedad", () => {
    expect(nombreIUPAC(desdeSmiles("CCO"))).toBe("etanol");
    expect(nombreIUPAC(desdeSmiles("CCCO"))).toBe("propan-1-ol");
    expect(nombreIUPAC(desdeSmiles("CC(=O)C"))).toBe("propanona");
    expect(nombreIUPAC(desdeSmiles("CCCC(=O)C"))).toBe("pentan-2-ona");
    expect(nombreIUPAC(desdeSmiles("C=CC"))).toBe("propeno");
    expect(nombreIUPAC(desdeSmiles("CCCl"))).toBe("cloroetano");
    expect(nombreIUPAC(desdeSmiles("CCCCl"))).toBe("1-cloropropano");
  });

  it("no inventa nombres: lo que no soporta lanza un error en vez de devolver algo falso", () => {
    expect(() => nombreIUPAC(desdeSmiles("CCNC"))).toThrow();
    expect(() => nombreIUPAC(desdeSmiles("CC1CC1CC1CC1"))).toThrow();
  });

  it("SMILES mal formados o con valencia excedida lanzan", () => {
    expect(() => desdeSmiles("C(C")).toThrow();
    expect(() => desdeSmiles("C1CC")).toThrow();
    expect(() => desdeSmiles("CC(C)(C)(C)C")).toThrow();
    expect(() => desdeSmiles("C#C#C")).toThrow();
  });
});

describe("grupos funcionales detectados", () => {
  const ids = (smiles: string): IdGrupo[] =>
    gruposFuncionales(desdeSmiles(smiles))
      .map((g) => g.id)
      .sort();
  it("un grupo por familia", () => {
    expect(ids("CCO")).toEqual(["alcohol"]);
    expect(ids("COC")).toEqual(["eter"]);
    expect(ids("CC=O")).toEqual(["aldehido"]);
    expect(ids("CC(=O)C")).toEqual(["cetona"]);
    expect(ids("CC(=O)O")).toEqual(["acido"]);
    expect(ids("CC(=O)OC")).toEqual(["ester"]);
    expect(ids("CCN")).toEqual(["amina"]);
    expect(ids("CC(N)=O")).toEqual(["amida"]);
    expect(ids("CCCl")).toEqual(["haluro"]);
    expect(ids("C=C")).toEqual(["alqueno"]);
    expect(ids("C#C")).toEqual(["alquino"]);
    expect(ids("C1=CC=CC=C1")).toEqual(["aromatico"]);
    expect(ids("CCC")).toEqual([]);
  });
  it("la glucosa (cadena abierta): 1 aldehído y 5 alcoholes", () => {
    const g = ids("OCC(O)C(O)C(O)C(O)C=O");
    expect(g.filter((x) => x === "alcohol")).toHaveLength(5);
    expect(g.filter((x) => x === "aldehido")).toHaveLength(1);
  });
  it("el OH del ácido no se cuenta como alcohol y el ácido no es cetona ni aldehído", () => {
    expect(ids("CC(=O)O")).not.toContain("alcohol");
    expect(ids("CC(=O)O")).not.toContain("cetona");
  });
});

describe("hibridación del carbono (calculada de los enlaces)", () => {
  const hib = (smiles: string) => {
    const m = desdeSmiles(smiles);
    return m.atomos.map((el, i) => (el === "C" ? hibridacionDe(m, i).hibridacion : null)).filter((x) => x !== null);
  };
  it("metano y etano: sp³; eteno y benceno: sp²; etino: sp", () => {
    expect(hib("C")).toEqual(["sp3"]);
    expect(hib("CC")).toEqual(["sp3", "sp3"]);
    expect(hib("C=C")).toEqual(["sp2", "sp2"]);
    expect(hib("C1=CC=CC=C1")).toEqual(Array(6).fill("sp2"));
    expect(hib("C#C")).toEqual(["sp", "sp"]);
  });
  it("carbonilo y carboxilo: sp²; el carbono del metilo: sp³; nitrilo no se usa", () => {
    expect(hib("CC(=O)C")).toEqual(["sp3", "sp2", "sp3"]);
    expect(hib("CC(=O)O")).toEqual(["sp3", "sp2"]);
    expect(hib("CC#C")).toEqual(["sp3", "sp", "sp"]);
  });
  it("enlaces sigma y pi: 4σ sp³, 3σ + 1π sp², 2σ + 2π sp; el ángulo de cada uno", () => {
    const m = desdeSmiles("C");
    expect(hibridacionDe(m, 0)).toMatchObject({ sigma: 4, pi: 0, angulo: 109.5 });
    const e = desdeSmiles("C=C");
    expect(hibridacionDe(e, 0)).toMatchObject({ sigma: 3, pi: 1, angulo: 120 });
    const a = desdeSmiles("C#C");
    expect(hibridacionDe(a, 0)).toMatchObject({ sigma: 2, pi: 2, angulo: 180 });
  });
});

describe("banco de práctica (quimicaOrganica.ts): cada compuesto está en el catálogo y coincide", () => {
  it("las 10 moléculas de la práctica figuran en el catálogo con la misma fórmula molecular", () => {
    expect(COMPUESTOS_ORGANICOS).toHaveLength(10);
    for (const c of COMPUESTOS_ORGANICOS) {
      const e = CATALOGO_MOLECULAS.find((x) => x.practica === c.id);
      expect(e, `${c.id} falta en el catálogo`).toBeDefined();
      const f = fichaDe(e!.id);
      expect(igualesFormula(formulaMolecular(f.molecula), contarAtomos(c.formula)), `${c.id}: ${f.formula} vs ${c.formula}`).toBe(true);
    }
  });

  it("el nombre de la práctica es el IUPAC calculado o un nombre común aceptado (fórmico, acético, etileno, glucosa)", () => {
    const sinTildes = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    for (const c of COMPUESTOS_ORGANICOS) {
      const e = CATALOGO_MOLECULAS.find((x) => x.practica === c.id)!;
      const f = fichaDe(e.id);
      const nombrePractica = sinTildes(c.nombre);
      const candidatos = [f.nombre, e.comun ?? ""].map(sinTildes).filter(Boolean);
      const coincide = candidatos.some((n) => n === nombrePractica || n.startsWith(`${nombrePractica} (`) || nombrePractica.startsWith(`${n} (`));
      expect(coincide, `${c.id}: «${c.nombre}» vs ${candidatos.join(" / ")}`).toBe(true);
    }
    // los tres casos con nombre común, explícitos
    expect(CATALOGO_MOLECULAS.find((x) => x.practica === "acido-formico")!.comun).toBe("ácido fórmico");
    expect(CATALOGO_MOLECULAS.find((x) => x.practica === "acido-acetico")!.comun).toBe("ácido acético");
    expect(fichaDe("acido-metanoico").nombre).toBe("ácido metanoico");
    expect(fichaDe("acido-etanoico").nombre).toBe("ácido etanoico");
  });

  it("la fórmula condensada del banco (grupos) es la misma cadena que calcula el motor (mismos grupos, mismo orden)", () => {
    const sub = (s: string) => s.replace(/[₀-₉]/g, (d) => String(d.charCodeAt(0) - 0x2080));
    for (const c of COMPUESTOS_ORGANICOS) {
      if (c.anillo || c.id === "glucosa") continue;
      const e = CATALOGO_MOLECULAS.find((x) => x.practica === c.id)!;
      const motor = fichaDe(e.id).condensada!.split(/[-=≡]/);
      const banco = c.grupos.map(sub);
      // el orden puede estar invertido (el motor numera desde el grupo principal)
      const igual = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);
      const directo = igual(motor, banco) || igual([...motor].reverse(), banco);
      // metanol: el banco escribe CH3-OH y el motor CH3OH (mismo compuesto, otra forma de partir el texto)
      const pegado = motor.join("") === banco.join("");
      expect(directo || pegado, `${c.id}: motor ${motor.join("|")} vs banco ${banco.join("|")}`).toBe(true);
    }
  });
});

describe("dibujo esquemático: sin átomos apilados ni sobre una línea ajena", () => {
  const distanciaASegmento = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
    const dx = bx - ax;
    const dy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  };
  for (const e of CATALOGO_MOLECULAS) {
    it(`${e.id}: átomos separados y enlaces de longitud 1`, () => {
      const d = fichaDe(e.id).dibujo;
      expect(d.atomos.length).toBe(fichaDe(e.id).molecula.atomos.length);
      for (let i = 0; i < d.atomos.length; i++) {
        for (let j = i + 1; j < d.atomos.length; j++) {
          expect(Math.hypot(d.atomos[i].x - d.atomos[j].x, d.atomos[i].y - d.atomos[j].y), `${e.id}: átomos ${d.atomos[i].id} y ${d.atomos[j].id}`).toBeGreaterThan(0.7);
        }
      }
      const por = new Map(d.atomos.map((a) => [a.id, a]));
      for (const b of d.enlaces) {
        const a1 = por.get(b.a)!;
        const a2 = por.get(b.b)!;
        expect(Math.hypot(a1.x - a2.x, a1.y - a2.y), `${e.id}: enlace ${b.a}-${b.b}`).toBeGreaterThan(0.95);
        expect(Math.hypot(a1.x - a2.x, a1.y - a2.y), `${e.id}: enlace ${b.a}-${b.b}`).toBeLessThan(1.05);
        for (const a of d.atomos) {
          if (a.id === b.a || a.id === b.b) continue;
          expect(distanciaASegmento(a.x, a.y, a1.x, a1.y, a2.x, a2.y), `${e.id}: átomo ${a.id} sobre el enlace ${b.a}-${b.b}`).toBeGreaterThan(0.3);
        }
      }
    });
  }

  it("cis y trans: el cis pone los dos metilos del mismo lado del doble enlace y el trans en lados opuestos", () => {
    const lado = (id: string) => {
      const f = fichaDe(id);
      const d = dibujarMolecula(f.molecula, { cis: f.entrada.geometria === "cis" });
      const cadena = d.atomos.filter((a) => a.enCadena).sort((a, b) => (a.localizador ?? 0) - (b.localizador ?? 0));
      const [c1, c2, c3, c4] = cadena;
      const eje = { x: c3.x - c2.x, y: c3.y - c2.y };
      const cruz = (p: { x: number; y: number }, o: { x: number; y: number }) => eje.x * (p.y - o.y) - eje.y * (p.x - o.x);
      return Math.sign(cruz(c1, c2)) * Math.sign(cruz(c4, c3));
    };
    expect(lado("cis-but-2-eno")).toBe(1);
    expect(lado("trans-but-2-eno")).toBe(-1);
  });

  it("los triples enlaces se dibujan colineales (alquinos lineales)", () => {
    const d = fichaDe("but-2-ino").dibujo;
    const c = d.atomos.filter((a) => a.enCadena).sort((a, b) => (a.localizador ?? 0) - (b.localizador ?? 0));
    for (let i = 0; i < c.length; i++) expect(Math.abs(c[i].y - c[0].y)).toBeLessThan(1e-6);
  });

  it("los anillos son polígonos regulares de lado 1", () => {
    const d = fichaDe("benceno").dibujo;
    const bordes = d.enlaces.filter((e) => e.enCadena);
    expect(bordes).toHaveLength(6);
    expect(bordes.filter((b) => b.orden === 2)).toHaveLength(3);
  });
});

describe("ecuaciones de las Clases que no pasan por ecu() (con n)", () => {
  it("almidón: n C6H12O6 -> H(C6H10O5)nOH + (n-1) H2O conserva átomos para n = 1, 2, 3, 10", () => {
    for (const n of [1, 2, 3, 10]) {
      const izq = contarAtomos(`C${6 * n}H${12 * n}O${6 * n}`);
      const cadena = contarAtomos(`HOH(C6H10O5)${n}`.replace("HOH", "H2O"));
      // H(C6H10O5)nOH = (C6H10O5)n + H2O
      const der: Record<string, number> = {};
      for (const [k, v] of Object.entries(cadena)) der[k] = (der[k] ?? 0) + v;
      const agua = contarAtomos("H2O");
      for (const [k, v] of Object.entries(agua)) der[k] = (der[k] ?? 0) + v * (n - 1);
      expect(der, `n = ${n}`).toEqual(izq);
    }
  });
});

describe("fórmulas generales de los grupos funcionales (LaTeX)", () => {
  it("las 12 se renderizan con KaTeX sin error y traen \\mathrm (un backslash perdido las mostraría como «mathrmR…»)", () => {
    expect(Object.keys(INFO_GRUPO)).toHaveLength(12);
    for (const [id, g] of Object.entries(INFO_GRUPO)) {
      expect(g.general, id).toContain("\\mathrm{");
      expect(() => katex.renderToString(g.general, { throwOnError: true }), id).not.toThrow();
    }
  });
});
