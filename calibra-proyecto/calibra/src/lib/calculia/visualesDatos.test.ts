import { describe, it, expect } from "vitest";
import {
  antiderivadaFuncion,
  areaExacta,
  datosArea,
  datosEdo,
  esVisualCalculiaEdo,
  solucionEdo,
  datosSerie,
  datosTangente,
  derivarFuncion,
  evaluarFuncion,
  esFuncionCalculia,
  esVisualCalculiaArea,
  esVisualCalculiaSerie,
  esVisualCalculiaTangente,
  rectangulosPuntoMedio,
  sumaInfinita,
  sumaParcial,
  sumaParcialCerrada,
} from "./visualesDatos";
import type { TerminoFuncionCalculia } from "./visuales";

// Verificación INDEPENDIENTE de cada dato de los visuales de Calculia:
//   - derivadas simbólicas (derivarFuncion) contra diferencias finitas
//     centradas de evaluarFuncion (dos cálculos que no comparten fórmula);
//   - antiderivadas simbólicas (antiderivadaFuncion) contra integración
//     numérica de Simpson de evaluarFuncion;
//   - sumas parciales de serie geométrica (iterativas) contra la fórmula
//     cerrada S_n = a(1-r^n)/(1-r), y su límite contra a/(1-r).

// ---------- diferencia finita centrada (derivada numérica independiente) ----------
function derivadaNumerica(fn: TerminoFuncionCalculia[], x: number): number {
  const h = 1e-5;
  return (evaluarFuncion(fn, x + h) - evaluarFuncion(fn, x - h)) / (2 * h);
}

// ---------- Simpson (integral numérica independiente) ----------
function integralSimpson(fn: TerminoFuncionCalculia[], desde: number, hasta: number, n = 200): number {
  const nPar = n % 2 === 0 ? n : n + 1;
  const h = (hasta - desde) / nPar;
  let suma = evaluarFuncion(fn, desde) + evaluarFuncion(fn, hasta);
  for (let i = 1; i < nPar; i++) {
    const x = desde + i * h;
    suma += (i % 2 === 0 ? 2 : 4) * evaluarFuncion(fn, x);
  }
  return (h / 3) * suma;
}

describe("Calculia visualesDatos: derivadas simbólicas contra diferencia finita", () => {
  const casos: TerminoFuncionCalculia[][] = [
    [{ tipo: "potencia", c: 5, n: 4 }],
    [{ tipo: "potencia", c: -3, n: 2 }],
    [{ tipo: "potencia", c: 6, n: 3 }],
    [{ tipo: "factorLineal", c: 1, a: 3, b: 2, n: 4 }],
    [{ tipo: "factorLineal", c: 2, a: -1, b: 5, n: 3 }],
    [
      { tipo: "potencia", c: 3, n: 2 },
      { tipo: "potencia", c: -2, n: 1 },
    ],
  ];

  it("derivarFuncion coincide con la diferencia finita centrada en varios puntos", () => {
    for (const fn of casos) {
      for (const x of [-2, -0.5, 0.3, 1, 2.7]) {
        const simbolica = evaluarFuncion(derivarFuncion(fn), x);
        const numerica = derivadaNumerica(fn, x);
        expect(Math.abs(simbolica - numerica), `fn=${JSON.stringify(fn)} x=${x}`).toBeLessThan(1e-3);
      }
    }
  });

  it("caso conocido de la lección: f(x)=5x^4 en x=1 -> f'(x)=20x^3, pendiente 20", () => {
    const fn: TerminoFuncionCalculia[] = [{ tipo: "potencia", c: 5, n: 4 }];
    const d = derivarFuncion(fn);
    expect(d).toEqual([{ tipo: "potencia", c: 20, n: 3 }]);
    expect(evaluarFuncion(d, 1)).toBe(20);
  });

  it("caso conocido: f(x)=(3x+2)^4 -> f'(x)=12(3x+2)^3 (regla de la cadena)", () => {
    const fn: TerminoFuncionCalculia[] = [{ tipo: "factorLineal", c: 1, a: 3, b: 2, n: 4 }];
    const d = derivarFuncion(fn);
    expect(d).toEqual([{ tipo: "factorLineal", c: 12, a: 3, b: 2, n: 3 }]);
  });
});

describe("Calculia visualesDatos: antiderivadas simbólicas contra Simpson", () => {
  const casos: { fn: TerminoFuncionCalculia[]; desde: number; hasta: number }[] = [
    { fn: [{ tipo: "potencia", c: 6, n: 2 }], desde: 0, hasta: 2 },
    { fn: [{ tipo: "potencia", c: 3, n: 1 }], desde: -1, hasta: 3 },
    { fn: [{ tipo: "factorLineal", c: 8, a: 2, b: 1, n: 3 }], desde: 0, hasta: 1.5 },
  ];

  it("areaExacta (antiderivada evaluada) coincide con la integral de Simpson", () => {
    for (const { fn, desde, hasta } of casos) {
      const exacta = areaExacta(fn, desde, hasta);
      const numerica = integralSimpson(fn, desde, hasta);
      expect(Math.abs(exacta - numerica), JSON.stringify({ fn, desde, hasta })).toBeLessThan(1e-6);
    }
  });

  it("caso conocido de la lección: ∫6x² dx de 0 a 2 -> antiderivada 2x³, área = 16", () => {
    const fn: TerminoFuncionCalculia[] = [{ tipo: "potencia", c: 6, n: 2 }];
    const F = antiderivadaFuncion(fn);
    expect(F).toEqual([{ tipo: "potencia", c: 2, n: 3 }]);
    expect(areaExacta(fn, 0, 2)).toBe(16);
  });

  it("caso conocido: ∫8(2x+1)³ dx -> antiderivada (2x+1)⁴ (sustitución simple, coeficiente 1)", () => {
    const fn: TerminoFuncionCalculia[] = [{ tipo: "factorLineal", c: 8, a: 2, b: 1, n: 3 }];
    const F = antiderivadaFuncion(fn);
    expect(F[0].c).toBeCloseTo(1, 10);
    expect(F[0].n).toBe(4);
  });

  it("antiderivadaTermino lanza para n=-1 (no soportado por este primitivo)", () => {
    expect(() => antiderivadaFuncion([{ tipo: "potencia", c: 1, n: -1 }])).toThrow();
  });
});

describe("Calculia visualesDatos: rectángulos de Riemann convergen al área exacta", () => {
  it("con más rectángulos, el punto medio se acerca más al área exacta", () => {
    const fn: TerminoFuncionCalculia[] = [{ tipo: "potencia", c: 1, n: 2 }];
    const exacta = areaExacta(fn, 0, 3);
    const suma = (rects: { ancho: number; alto: number }[]) => rects.reduce((s, r) => s + r.ancho * r.alto, 0);
    const error4 = Math.abs(suma(rectangulosPuntoMedio(fn, 0, 3, 4)) - exacta);
    const error12 = Math.abs(suma(rectangulosPuntoMedio(fn, 0, 3, 12)) - exacta);
    expect(error12).toBeLessThan(error4);
    expect(error12).toBeLessThan(0.2);
  });
});

describe("Calculia visualesDatos: series geométricas — suma iterativa contra fórmula cerrada", () => {
  it("sumaParcial (iterativa) coincide con sumaParcialCerrada para varios a, r, n", () => {
    const casos: [number, number][] = [[4, 0.5], [3, -0.5], [6, 1 / 3], [2, 0.75]];
    for (const [a, r] of casos) {
      for (const n of [1, 2, 5, 10]) {
        const it_ = sumaParcial(a, r, n);
        const cerrada = sumaParcialCerrada(a, r, n);
        expect(Math.abs(it_ - cerrada), `a=${a} r=${r} n=${n}`).toBeLessThan(1e-9);
      }
    }
  });

  it("caso conocido de la lección: a=4, r=1/2 -> suma infinita 8, y la suma parcial converge hacia ahí", () => {
    expect(sumaInfinita(4, 0.5)).toBe(8);
    const s10 = sumaParcial(4, 0.5, 10);
    expect(Math.abs(s10 - 8)).toBeLessThan(0.01);
    expect(sumaParcial(4, 0.5, 20)).toBeCloseTo(8, 3);
  });

  it("|r|>=1 diverge: datosSerie marca converge=false y sumaInfinita=null", () => {
    const d = datosSerie({ tipo: "calculia.serie", a: 3, rNum: 3, rDen: 2, terminos: 6 });
    expect(d.converge).toBe(false);
    expect(d.sumaInfinita).toBeNull();
  });

  it("datosSerie con a=4, r=1/2: parciales crecen monótonamente hacia 8 (dentro de la tolerancia de redondeo)", () => {
    const d = datosSerie({ tipo: "calculia.serie", a: 4, rNum: 1, rDen: 2, terminos: 8 });
    expect(d.converge).toBe(true);
    expect(d.sumaInfinita).toBe(8);
    for (let i = 1; i < d.parciales.length; i++) expect(d.parciales[i]).toBeGreaterThan(d.parciales[i - 1]);
    expect(d.parciales[d.parciales.length - 1]).toBeLessThan(8);
    expect(d.parciales[d.parciales.length - 1]).toBeGreaterThan(7.9);
  });
});

describe("Calculia visualesDatos: datosTangente / datosArea — geometría dibujable", () => {
  it("datosTangente: el punto de tangencia está sobre la curva y las secantes convergen a la pendiente exacta", () => {
    const v = { tipo: "calculia.tangente" as const, funcion: [{ tipo: "potencia" as const, c: 1, n: 2 }], x0: 1 };
    const d = datosTangente(v);
    expect(d.y0).toBe(1); // f(1) = 1^2 = 1
    expect(d.pendiente).toBe(2); // f'(1) = 2·1 = 2
    // La pendiente de la secante más cercana (h chico) está más próxima a
    // la pendiente exacta que la más lejana (h grande) — muestra la
    // convergencia secante -> tangente que anima el visual.
    const pendienteSecante = (s: { x1: number; y1: number; x2: number; y2: number }) => (s.y2 - s.y1) / (s.x2 - s.x1);
    const err1 = Math.abs(pendienteSecante(d.secante1) - d.pendiente);
    const err2 = Math.abs(pendienteSecante(d.secante2) - d.pendiente);
    expect(err2).toBeLessThan(err1);
    expect(d.curva.length).toBeGreaterThan(10);
    // Todos los puntos de la curva están dentro del rango dibujado.
    for (const p of d.curva) expect(p.x).toBeGreaterThanOrEqual(d.rango[0] - 0.01);
  });

  it("datosArea: el área calculada coincide con areaExacta y los rectángulos están dentro de [desde, hasta]", () => {
    const v = { tipo: "calculia.area" as const, funcion: [{ tipo: "potencia" as const, c: 6, n: 2 }], desde: 0, hasta: 2 };
    const d = datosArea(v);
    expect(d.area).toBe(16);
    expect(d.rectangulos4).toHaveLength(4);
    expect(d.rectangulos12).toHaveLength(12);
    for (const r of d.rectangulos4) {
      expect(r.x).toBeGreaterThanOrEqual(v.desde);
      expect(r.x + r.ancho).toBeLessThanOrEqual(v.hasta + 1e-9);
    }
  });
});

describe("Calculia visualesDatos: validadores tolerantes a datos malos", () => {
  it("esFuncionCalculia rechaza listas vacías, no-listas y términos inválidos", () => {
    expect(esFuncionCalculia([])).toBe(false);
    expect(esFuncionCalculia("no es lista")).toBe(false);
    expect(esFuncionCalculia([{ tipo: "potencia", c: 1, n: "2" }])).toBe(false);
    expect(esFuncionCalculia([{ tipo: "factorLineal", c: 1, a: 0, b: 1, n: 2 }])).toBe(false); // a=0 no es lineal
    expect(esFuncionCalculia([{ tipo: "desconocido" }])).toBe(false);
    expect(esFuncionCalculia([{ tipo: "potencia", c: 1, n: 2 }])).toBe(true);
  });

  it("esVisualCalculiaTangente / Area / Serie rechazan formas rotas", () => {
    expect(esVisualCalculiaTangente({ tipo: "calculia.tangente", funcion: [], x0: 1 })).toBe(false);
    expect(esVisualCalculiaTangente({ tipo: "calculia.tangente", funcion: [{ tipo: "potencia", c: 1, n: 2 }], x0: "1" })).toBe(false);
    expect(esVisualCalculiaTangente({ tipo: "calculia.tangente", funcion: [{ tipo: "potencia", c: 1, n: 2 }], x0: 1, rango: [3, 1] })).toBe(false);
    expect(esVisualCalculiaTangente({ tipo: "calculia.tangente", funcion: [{ tipo: "potencia", c: 1, n: 2 }], x0: 1 })).toBe(true);

    expect(esVisualCalculiaArea({ tipo: "calculia.area", funcion: [{ tipo: "potencia", c: 1, n: 2 }], desde: 2, hasta: 1 })).toBe(false);
    expect(esVisualCalculiaArea({ tipo: "calculia.area", funcion: [{ tipo: "potencia", c: 1, n: -1 }], desde: 1, hasta: 2 })).toBe(false);
    expect(esVisualCalculiaArea({ tipo: "calculia.area", funcion: [{ tipo: "potencia", c: 1, n: 2 }], desde: 0, hasta: 2 })).toBe(true);

    expect(esVisualCalculiaSerie({ tipo: "calculia.serie", a: 0, rNum: 1, rDen: 2, terminos: 5 })).toBe(false);
    expect(esVisualCalculiaSerie({ tipo: "calculia.serie", a: 4, rNum: 1, rDen: 0, terminos: 5 })).toBe(false);
    expect(esVisualCalculiaSerie({ tipo: "calculia.serie", a: 4, rNum: 1, rDen: 2, terminos: 1 })).toBe(false);
    expect(esVisualCalculiaSerie({ tipo: "calculia.serie", a: 4, rNum: 1, rDen: 2, terminos: 6 })).toBe(true);
  });
});

describe("Calculia visualesDatos: EDO separable dy/dx = k·x^n·y", () => {
  const h = 1e-5;
  const dif = (f: (x: number) => number, x: number) => (f(x + h) - f(x - h)) / (2 * h);

  it("solucionEdo satisface la ecuación diferencial (diferencia finita), para varias k, n, A y x", () => {
    for (const [k, n] of [
      [2, 1],
      [3, 2],
      [-2, 1],
      [4, 3],
      [1, 0],
    ]) {
      for (const A of [0.5, 1, 2]) {
        for (const x of [-0.9, -0.3, 0.4, 1]) {
          const y = (t: number) => solucionEdo(k, n, A, t);
          const pendienteNumerica = dif(y, x);
          const pendienteEcuacion = k * Math.pow(x, n) * y(x);
          expect(Math.abs(pendienteNumerica - pendienteEcuacion), `k=${k} n=${n} A=${A} x=${x}`).toBeLessThan(1e-4 * Math.max(1, Math.abs(pendienteEcuacion)));
        }
      }
    }
  });

  it("casos de las lecciones: dy/dx = 2xy -> y = A·e^(x²) y dy/dx = 3x²y -> y = A·e^(x³)", () => {
    expect(solucionEdo(2, 1, 1, 1)).toBeCloseTo(Math.E, 12);
    expect(solucionEdo(2, 1, 2, 0)).toBe(2);
    expect(solucionEdo(3, 2, 1, 1)).toBeCloseTo(Math.E, 12);
    expect(solucionEdo(3, 2, 1, -1)).toBeCloseTo(Math.exp(-1), 12);
  });

  it("datosEdo: 3 curvas, el punto está en la de A=1, la pendiente coincide con la ecuación y con la diferencia finita, y la tangente pasa por el punto", () => {
    const d = datosEdo({ tipo: "calculia.edo", k: 2, n: 1, x0: 1 });
    expect(d.curvas.map((c) => c.A)).toEqual([0.5, 1, 2]);
    expect(d.y0).toBeCloseTo(Math.E, 2);
    expect(d.pendiente).toBeCloseTo(2 * Math.E, 2);
    const numerica = dif((t) => solucionEdo(2, 1, 1, t), 1);
    expect(Math.abs(d.pendiente - numerica)).toBeLessThan(0.01);
    const { x1, y1, x2, y2 } = d.tangente;
    expect((y2 - y1) / (x2 - x1)).toBeCloseTo(d.pendiente, 0);
    // la recta pasa por (x0, y0)
    expect(y1 + d.pendiente * (1 - x1)).toBeCloseTo(d.y0, 1);
    for (const c of d.curvas) {
      expect(c.puntos).toHaveLength(41);
      expect(c.puntos.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
    }
    // a mayor A, más arriba (misma x)
    expect(d.curvas[2].puntos[20].y).toBeGreaterThan(d.curvas[1].puntos[20].y);
    expect(d.curvas[1].puntos[20].y).toBeGreaterThan(d.curvas[0].puntos[20].y);
  });

  it("esVisualCalculiaEdo rechaza formas rotas y exponenciales desbordadas", () => {
    expect(esVisualCalculiaEdo({ tipo: "calculia.edo", k: 0, n: 1, x0: 1 })).toBe(false);
    expect(esVisualCalculiaEdo({ tipo: "calculia.edo", k: 1.5, n: 1, x0: 1 })).toBe(false);
    expect(esVisualCalculiaEdo({ tipo: "calculia.edo", k: 2, n: -1, x0: 1 })).toBe(false);
    expect(esVisualCalculiaEdo({ tipo: "calculia.edo", k: 2, n: 1, x0: "1" })).toBe(false);
    expect(esVisualCalculiaEdo({ tipo: "calculia.edo", k: 2, n: 1, x0: 1, rango: [2, 1] })).toBe(false);
    expect(esVisualCalculiaEdo({ tipo: "calculia.edo", k: 50, n: 1, x0: 3 })).toBe(false);
    expect(esVisualCalculiaEdo({ tipo: "calculia.edo", k: 2, n: 1, x0: 1 })).toBe(true);
    expect(esVisualCalculiaEdo({ tipo: "calculia.edo", k: 3, n: 2, x0: 1 })).toBe(true);
  });
});

describe("Calculia visualesDatos: el relleno del área llega exactamente a los extremos", () => {
  it("datosArea.relleno empieza en `desde` y termina en `hasta` y sigue a f", () => {
    const v = { tipo: "calculia.area" as const, funcion: [{ tipo: "potencia" as const, c: 6, n: 2 }], desde: 0, hasta: 2 };
    const d = datosArea(v);
    expect(d.relleno[0]).toEqual({ x: 0, y: 0 });
    expect(d.relleno[d.relleno.length - 1]).toEqual({ x: 2, y: 24 });
    for (const p of d.relleno) expect(Math.abs(p.y - 6 * p.x * p.x)).toBeLessThan(0.006);
  });
});
