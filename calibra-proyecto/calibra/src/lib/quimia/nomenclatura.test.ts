import { describe, it, expect } from "vitest";
import {
  ANIONES,
  CATIONES,
  COMPUESTOS_IONICOS,
  HIDRACIDOS,
  OTROS_COMPUESTOS,
  OXIDOS_NO_METALICOS,
  OXOACIDOS,
  armarFormula,
  buscarAnion,
  buscarCation,
  nombreDe,
  nombreSistematico,
  nombreStock,
  nombreTradicional,
  oxidacionCentral,
  prefijo,
  romano,
  type IonDef,
} from "./nomenclatura";
import { contarAtomos } from "./formulas";

// La tabla de referencia (COMPUESTOS_IONICOS, OXIDOS_NO_METALICOS, OXOACIDOS,
// HIDRACIDOS) está escrita a mano y estos tests la comprueban contra reglas
// calculadas de forma independiente: fórmula por cruce de cargas, cargas
// netas cero, número romano = carga, -oso/-ico según la valencia, prefijos
// = subíndices, formula del ácido = anhídrido + agua.

const ROMANOS_A_NUMERO: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7 };
const PREFIJOS_A_NUMERO: Record<string, number> = { mono: 1, di: 2, tri: 3, tetra: 4, penta: 5, hexa: 6, hepta: 7 };
const sinTildes = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

function sumaAtomos(...partes: [Record<string, number>, number][]): Record<string, number> {
  const t: Record<string, number> = {};
  for (const [c, n] of partes) for (const [k, v] of Object.entries(c)) t[k] = (t[k] ?? 0) + v * n;
  return t;
}

describe("iones", () => {
  it("ids únicos y coherentes con su carga", () => {
    for (const lista of [CATIONES, ANIONES]) {
      const ids = lista.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
    for (const c of CATIONES) expect(c.carga).toBeGreaterThan(0);
    for (const a of ANIONES) expect(a.carga).toBeLessThan(0);
  });

  it("los cationes con dos valencias tienen -oso (menor) e -ico (mayor)", () => {
    const porElemento = new Map<string, IonDef[]>();
    for (const c of CATIONES.filter((x) => x.trad)) porElemento.set(c.formula, [...(porElemento.get(c.formula) ?? []), c]);
    expect(porElemento.size).toBe(6); // Fe, Cu, Sn, Pb, Au, Co
    for (const [el, lista] of porElemento) {
      expect(lista, el).toHaveLength(2);
      const [menor, mayor] = [...lista].sort((a, b) => a.carga - b.carga);
      expect(menor.trad, `${el} valencia menor`).toMatch(/oso$/);
      expect(mayor.trad, `${el} valencia mayor`).toMatch(/ico$/);
    }
  });

  it("los cationes de una sola valencia no llevan sufijo tradicional", () => {
    for (const c of CATIONES.filter((x) => !x.trad)) {
      expect(CATIONES.filter((y) => y.formula === c.formula), c.id).toHaveLength(1);
    }
  });
});

describe("cruce de cargas (armarFormula)", () => {
  it("ejemplos clásicos", () => {
    const arma = (c: string, a: string) => armarFormula(buscarCation(c), buscarAnion(a)).formula;
    expect(arma("Na+", "Cl-")).toBe("NaCl");
    expect(arma("Ca2+", "O2-")).toBe("CaO");
    expect(arma("Al3+", "O2-")).toBe("Al2O3");
    expect(arma("Mg2+", "Cl-")).toBe("MgCl2");
    expect(arma("Ca2+", "OH-")).toBe("Ca(OH)2");
    expect(arma("Al3+", "SO4^2-")).toBe("Al2(SO4)3");
    expect(arma("Ca2+", "PO4^3-")).toBe("Ca3(PO4)2");
    expect(arma("NH4+", "SO4^2-")).toBe("(NH4)2SO4");
    expect(arma("Fe3+", "O2-")).toBe("Fe2O3");
  });

  it("el ion peróxido (O2, carga 2-) es un bloque: Ca -> CaO2, Na -> Na2O2, Al -> Al2(O2)3", () => {
    const arma = (c: string) => armarFormula(buscarCation(c), buscarAnion("O2^2-")).formula;
    expect(arma("Ca2+")).toBe("CaO2");
    expect(arma("Na+")).toBe("Na2O2");
    expect(arma("Al3+")).toBe("Al2(O2)3");
  });

  it("toda combinación catión-anión de las tablas da carga neta 0 y subíndices sin divisor común", () => {
    for (const c of CATIONES) {
      for (const a of ANIONES) {
        const { nCation, nAnion, formula } = armarFormula(c, a);
        expect(nCation * c.carga + nAnion * a.carga, `${c.id} + ${a.id} = ${formula}`).toBe(0);
        const mcd = (x: number, y: number): number => (y === 0 ? x : mcd(y, x % y));
        expect(mcd(nCation, nAnion), `${c.id} + ${a.id}`).toBe(1);
        // la fórmula resultante se puede leer (paréntesis balanceados)
        expect(() => contarAtomos(formula)).not.toThrow();
      }
    }
  });
});

describe("prefijos y romanos", () => {
  it("prefijos mono a hepta y romanos I a VII", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(prefijo)).toEqual(["mono", "di", "tri", "tetra", "penta", "hexa", "hepta"]);
    expect([1, 2, 3, 4, 5, 6, 7].map(romano)).toEqual(["I", "II", "III", "IV", "V", "VI", "VII"]);
    expect(() => romano(0)).toThrow();
  });
});

describe("compuestos iónicos: tabla de referencia contra las reglas", () => {
  it("son más de 90, sin fórmulas repetidas", () => {
    expect(COMPUESTOS_IONICOS.length).toBeGreaterThan(90);
    expect(new Set(COMPUESTOS_IONICOS.map((c) => c.formula)).size).toBe(COMPUESTOS_IONICOS.length);
  });

  it("la fórmula sale del cruce de cargas, la carga neta es 0 y el conteo de átomos coincide", () => {
    for (const ref of COMPUESTOS_IONICOS) {
      const c = buscarCation(ref.cation);
      const a = buscarAnion(ref.anion);
      const { formula, nCation, nAnion } = armarFormula(c, a);
      expect(formula, `${ref.cation} + ${ref.anion}`).toBe(ref.formula);
      expect(nCation * c.carga + nAnion * a.carga, ref.formula).toBe(0);
      expect(contarAtomos(ref.formula), ref.formula).toEqual(sumaAtomos([contarAtomos(c.formula), nCation], [contarAtomos(a.formula), nAnion]));
    }
  });

  it("nombre Stock: coincide con la regla y el número romano es la carga del catión (valencias variables)", () => {
    for (const ref of COMPUESTOS_IONICOS) {
      const c = buscarCation(ref.cation);
      const a = buscarAnion(ref.anion);
      expect(nombreStock(c, a), ref.formula).toBe(ref.stock);
      const m = ref.stock.match(/\(([IVX]+)\)$/);
      if (c.trad) {
        expect(m, `${ref.formula}: falta el número romano`).not.toBeNull();
        expect(ROMANOS_A_NUMERO[m![1]], ref.formula).toBe(c.carga);
      } else {
        expect(m, `${ref.formula}: un metal de una sola valencia no lleva romano`).toBeNull();
      }
    }
  });

  it("nombre tradicional: -oso/-ico por valencia (los demás sin sufijo)", () => {
    const ES_ACIDA = new Set(["HCO3-", "HSO4-", "HSO3-", "HS-", "H2PO4-", "HPO4^2-"]);
    for (const ref of COMPUESTOS_IONICOS) {
      const c = buscarCation(ref.cation);
      const a = buscarAnion(ref.anion);
      if (ES_ACIDA.has(ref.anion)) continue; // se comprueba aparte
      expect(nombreTradicional(c, a), ref.formula).toBe(ref.tradicional);
    }
  });

  it("sales ácidas: el tradicional dice 'X ácido de M' (mono/diácido para fosfatos) y el Stock 'hidrogeno...'", () => {
    const acidas = COMPUESTOS_IONICOS.filter((r) => /^H/.test(buscarAnion(r.anion).formula) && buscarAnion(r.anion).poliatomico);
    expect(acidas.length).toBeGreaterThanOrEqual(7);
    for (const ref of acidas) {
      const a = buscarAnion(ref.anion);
      expect(ref.stock, ref.formula).toMatch(/^(di)?hidrogeno/);
      expect(ref.stock.startsWith(a.nombre), ref.formula).toBe(true);
      expect(ref.tradicional, ref.formula).toMatch(/ (ácido|diácido|monoácido) de /);
    }
    // cantidad de H del anión vs. prefijo (di/mono): H2PO4 -> diácido; HPO4 -> monoácido
    expect(COMPUESTOS_IONICOS.find((r) => r.formula === "NaH2PO4")!.tradicional).toContain("diácido");
    expect(COMPUESTOS_IONICOS.find((r) => r.formula === "Na2HPO4")!.tradicional).toContain("monoácido");
  });

  it("nombre sistemático con prefijos: cada prefijo es el subíndice de la fórmula (binarios e hidróxidos)", () => {
    let comprobados = 0;
    for (const ref of COMPUESTOS_IONICOS) {
      if (!ref.sistematica) continue;
      const c = buscarCation(ref.cation);
      const a = buscarAnion(ref.anion);
      expect(nombreSistematico(c, a), ref.formula).toBe(ref.sistematica);
      // Verificación independiente con el conteo de átomos de la fórmula escrita.
      const cont = contarAtomos(ref.formula);
      const nMetal = cont[c.formula];
      const nAnion = a.formula === "OH" ? cont["O"] : cont[a.formula];
      const [parteAnion, parteCation] = ref.sistematica.split(" de ");
      const pAn = Object.keys(PREFIJOS_A_NUMERO).find((p) => sinTildes(parteAnion).startsWith(p));
      expect(pAn, ref.formula).toBeDefined();
      expect(PREFIJOS_A_NUMERO[pAn!], `${ref.formula}: prefijo del anión`).toBe(nAnion);
      const pCat = Object.keys(PREFIJOS_A_NUMERO).find((p) => parteCation.startsWith(p) && parteCation.length > p.length + 2 && sinTildes(parteCation.slice(p.length)) === sinTildes(c.nombre));
      if (nMetal === 1) expect(parteCation, `${ref.formula}: el metal solo no lleva prefijo`).toBe(c.nombre);
      else expect(PREFIJOS_A_NUMERO[pCat!], `${ref.formula}: prefijo del metal`).toBe(nMetal);
      comprobados++;
    }
    expect(comprobados).toBeGreaterThanOrEqual(50);
  });

  it("los peróxidos llevan el ion O2 (2-): Na2O2, BaO2, CaO2 (nunca NaO ni Ba2O4)", () => {
    for (const f of ["Na2O2", "BaO2", "CaO2"]) {
      const ref = COMPUESTOS_IONICOS.find((r) => r.formula === f)!;
      expect(ref.anion).toBe("O2^2-");
      expect(ref.stock).toMatch(/^peróxido de /);
    }
  });

  it("nombreDe devuelve cada sistema y falla con datos que no existen", () => {
    expect(nombreDe("Fe2O3", "stock")).toBe("óxido de hierro (III)");
    expect(nombreDe("Fe2O3", "tradicional")).toBe("óxido férrico");
    expect(nombreDe("Fe2O3", "sistematica")).toBe("trióxido de dihierro");
    expect(() => nombreDe("Na2SO4", "sistematica")).toThrow();
    expect(() => nombreDe("XyZ9", "stock")).toThrow();
  });
});

describe("óxidos no metálicos (anhídridos)", () => {
  // Fórmula esperada desde el número de oxidación: E2Ox si es impar, EO(x/2) si es par.
  function formulaDesdeOxidacion(e: string, ox: number): string {
    const nE = ox % 2 === 1 ? 2 : 1;
    const nO = (ox * nE) / 2;
    return `${e}${nE > 1 ? nE : ""}O${nO > 1 ? nO : ""}`;
  }
  // Sufijos tradicionales por familia y estado de oxidación (independiente de la tabla).
  const TRAD: Record<string, Record<number, RegExp>> = {
    Cl: { 1: /^anhídrido hipo\p{L}+oso$/u, 3: /^anhídrido \p{L}+oso$/u, 5: /^anhídrido \p{L}+ico$/u, 7: /^anhídrido per\p{L}+ico$/u },
    Br: { 5: /^anhídrido \p{L}+ico$/u },
    I: { 5: /^anhídrido \p{L}+ico$/u },
    S: { 4: /^anhídrido \p{L}+oso$/u, 6: /^anhídrido \p{L}+ico$/u },
    Se: { 4: /^anhídrido \p{L}+oso$/u, 6: /^anhídrido \p{L}+ico$/u },
    N: { 3: /^anhídrido \p{L}+oso$/u, 5: /^anhídrido \p{L}+ico$/u },
    P: { 3: /^anhídrido \p{L}+oso$/u, 5: /^anhídrido \p{L}+ico$/u },
    C: { 4: /^anhídrido \p{L}+ico$/u },
    Si: { 4: /^anhídrido \p{L}+ico$/u },
    B: { 3: /^anhídrido \p{L}+ico$/u },
  };

  it("la fórmula sale del número de oxidación; el romano del Stock es ese número", () => {
    for (const o of OXIDOS_NO_METALICOS) {
      expect(o.formula, o.formula).toBe(formulaDesdeOxidacion(o.elemento, o.oxidacion));
      const m = o.stock.match(/\(([IVX]+)\)$/);
      expect(ROMANOS_A_NUMERO[m![1]], o.formula).toBe(o.oxidacion);
      // Suma de números de oxidación = 0 (O = −2).
      const c = contarAtomos(o.formula);
      expect(c[o.elemento] * o.oxidacion + c.O * -2, o.formula).toBe(0);
    }
  });

  it("nombre sistemático: los prefijos son los subíndices de la fórmula", () => {
    for (const o of OXIDOS_NO_METALICOS) {
      const c = contarAtomos(o.formula);
      const [parteO, parteE] = o.sistematica.split(" de ");
      const pO = Object.keys(PREFIJOS_A_NUMERO)
        .sort((a, b) => b.length - a.length)
        .find((p) => sinTildes(parteO).startsWith(p));
      expect(PREFIJOS_A_NUMERO[pO!], `${o.formula}: prefijo del óxido`).toBe(c.O);
      const pE = Object.keys(PREFIJOS_A_NUMERO).find((p) => parteE.startsWith(p) && c[o.elemento] > 1);
      if (c[o.elemento] > 1) expect(PREFIJOS_A_NUMERO[pE!], `${o.formula}: prefijo del elemento`).toBe(c[o.elemento]);
      else expect(pE, `${o.formula}: sin prefijo si hay un solo átomo`).toBeUndefined();
    }
  });

  it("nombre tradicional: -oso / -ico / hipo- / per- según el estado de oxidación (donde existe)", () => {
    for (const o of OXIDOS_NO_METALICOS) {
      if (!o.tradicional) {
        expect(["CO", "NO", "NO2"], `${o.formula}: solo estos no tienen nombre tradicional`).toContain(o.formula);
        continue;
      }
      const regla = TRAD[o.elemento]?.[o.oxidacion];
      expect(regla, `${o.formula}: sin regla de referencia`).toBeDefined();
      expect(o.tradicional, o.formula).toMatch(regla);
    }
  });
});

describe("hidrácidos", () => {
  const H: IonDef = { id: "H+", formula: "H", carga: 1, nombre: "hidrógeno" };
  it("fórmula por cruce de cargas y nombres consistentes con el anión", () => {
    for (const h of HIDRACIDOS.filter((x) => x.formula !== "H2Se" && x.formula !== "H2Te" && x.formula !== "HCN")) {
      const anion = ANIONES.find((a) => contarAtomos(h.formula)[a.formula] === 1 && a.poliatomico !== true && a.formula !== "H");
      expect(anion, h.formula).toBeDefined();
      expect(armarFormula(H, anion!).formula, h.formula).toBe(h.formula);
      expect(h.puro, h.formula).toBe(`${anion!.nombre} de hidrógeno`);
    }
    for (const h of HIDRACIDOS) expect(h.acido, h.formula).toMatch(/^ácido \p{L}+hídrico$/u);
  });
});

describe("oxoácidos", () => {
  it("fórmula del ácido = anhídrido + agua (balance de átomos con coeficiente entero)", () => {
    for (const a of OXOACIDOS) {
      const anh = contarAtomos(a.anhidrido);
      const suma = sumaAtomos([anh, 1], [contarAtomos("H2O"), a.agua]);
      const acido = contarAtomos(a.formula);
      // suma = k × ácido, con k entero
      const claves = Object.keys(suma);
      const k = suma[claves[0]] / (acido[claves[0]] ?? NaN);
      expect(Number.isInteger(k) && k >= 1, a.formula).toBe(true);
      expect(Object.keys(acido).sort(), a.formula).toEqual(claves.sort());
      for (const s of claves) expect(suma[s], `${a.formula}: ${s}`).toBe(acido[s] * k);
    }
  });

  it("el átomo central conserva el número de oxidación del anhídrido (2c − a) / b", () => {
    for (const a of OXOACIDOS) {
      const oxAnh = OXIDOS_NO_METALICOS.find((o) => o.formula === a.anhidrido)?.oxidacion;
      // SiO2 y B2O3 no están en la tabla de "no metálicos" con anhídrido tradicional distinto: sí están.
      expect(oxAnh, `${a.formula}: anhídrido ${a.anhidrido} no está en la tabla`).toBeDefined();
      expect(oxidacionCentral(a.formula), a.formula).toBe(oxAnh);
    }
  });

  it("el nombre del ácido es el del anhídrido cambiando 'anhídrido' por 'ácido'", () => {
    for (const a of OXOACIDOS) {
      const o = OXIDOS_NO_METALICOS.find((x) => x.formula === a.anhidrido)!;
      expect(a.tradicional, a.formula).toBe(o.tradicional!.replace("anhídrido", "ácido"));
    }
  });

  it("el anión es el ácido sin sus H (carga = −cantidad de H) y -ico↔-ato, -oso↔-ito", () => {
    for (const a of OXOACIDOS) {
      if (!a.anion) continue;
      const an = buscarAnion(a.anion);
      const acido = contarAtomos(a.formula);
      const sinH = { ...acido };
      delete sinH.H;
      expect(contarAtomos(an.formula), a.formula).toEqual(sinH);
      expect(an.carga, a.formula).toBe(-acido.H);
      if (/ico$/.test(a.tradicional)) expect(an.nombre, a.formula).toMatch(/ato$/);
      else expect(an.nombre, `${a.formula} (-oso)`).toMatch(/ito$/);
      // misma raíz: primeras 3 letras sin prefijos hipo-/per- ni tildes
      const raiz = (s: string) => sinTildes(s.replace(/^ácido /, "").replace(/^(hipo|per)/, "")).slice(0, 3);
      expect(raiz(an.nombre), a.formula).toBe(raiz(a.tradicional));
    }
  });
});

describe("otros compuestos (moleculares y nombres comunes)", () => {
  it("cada fórmula se lee y los prefijos de los nombres con prefijo coinciden con los subíndices", () => {
    for (const o of OTROS_COMPUESTOS) {
      const cont = contarAtomos(o.formula);
      const m = o.nombre.match(/^(mono|di|tri|tetra|penta|hexa)(\p{L}+) de (\p{L}+)$/u);
      if (!m) continue;
      const n = PREFIJOS_A_NUMERO[m[1]];
      // el primer anión-nombre (cloruro, sulfuro...) corresponde a un elemento del compuesto con ese subíndice
      const cuenta = Object.entries(cont).filter(([, v]) => v === n).map(([k]) => k);
      expect(cuenta.length, `${o.formula}: ${o.nombre}`).toBeGreaterThan(0);
    }
    expect(OTROS_COMPUESTOS.find((o) => o.formula === "CCl4")!.nombre).toBe("tetracloruro de carbono");
    expect(contarAtomos("CCl4").Cl).toBe(4);
    expect(contarAtomos("PCl5").Cl).toBe(5);
    expect(contarAtomos("SF6").F).toBe(6);
    expect(contarAtomos("CS2").S).toBe(2);
  });
});
