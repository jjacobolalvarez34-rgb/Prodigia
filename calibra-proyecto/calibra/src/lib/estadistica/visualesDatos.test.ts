import { describe, expect, it } from "vitest";
import {
  bandasNormal,
  calcularDesvios,
  caminosArbol,
  combinaciones,
  densidadNormal,
  esGraficoEstadistica,
  esListaNumeros,
  esNodoArbol,
  esRamas,
  factorial,
  media,
  ordenarYCuartiles,
  ordenarYMediana,
  permutaciones,
  productoDescendente,
  regresionLineal,
  REGLA_EMPIRICA,
  tablaFrecuencias,
  zScore,
} from "./visualesDatos";

// Los datos que muestran los visuales de Estadística salen de estas funciones
// puras. Cada valor esperado de acá abajo está hecho A MANO (papel y lápiz) o
// con un método distinto del de la implementación (triángulo de Pascal, la
// fórmula alternativa del coeficiente de Pearson, el área exacta de la normal
// con la función error): así un error de la implementación no puede
// "confirmarse a sí mismo".

describe("ordenarYMediana", () => {
  it("n impar: 9, 3, 7, 5, 11, 1, 8 -> 1, 3, 5, 7, 8, 9, 11 y mediana 7 (posición 4)", () => {
    const r = ordenarYMediana([9, 3, 7, 5, 11, 1, 8]);
    expect(r.ordenados).toEqual([1, 3, 5, 7, 8, 9, 11]);
    expect(r.mediana).toBe(7);
    expect(r.indicesMediana).toEqual([3]);
  });

  it("n par: 12, 4, 9, 7 -> 4, 7, 9, 12; centrales 7 y 9; mediana (7+9)/2 = 8", () => {
    const r = ordenarYMediana([12, 4, 9, 7]);
    expect(r.ordenados).toEqual([4, 7, 9, 12]);
    expect(r.indicesMediana).toEqual([1, 2]);
    expect(r.mediana).toBe(8);
  });

  it("un valor extremo no la mueve (12 -> 120) y no modifica el arreglo original", () => {
    const original = [120, 4, 9, 7];
    expect(ordenarYMediana(original).mediana).toBe(8);
    expect(original).toEqual([120, 4, 9, 7]);
  });

  it("sueldos 3, 5, 5, 7, 50: mediana 5; 8, 3, 5, 10: mediana (5+8)/2 = 6.5", () => {
    expect(ordenarYMediana([3, 5, 5, 7, 50]).mediana).toBe(5);
    expect(ordenarYMediana([8, 3, 5, 10]).mediana).toBe(6.5);
  });
});

describe("ordenarYCuartiles (método de las mitades)", () => {
  it("n = 8: 2, 4, 4, 5 | 7, 8, 9, 12 -> Q1 = (4+4)/2 = 4, Q3 = (8+9)/2 = 8.5, mediana (5+7)/2 = 6, IQR 4.5", () => {
    const r = ordenarYCuartiles([2, 4, 4, 5, 7, 8, 9, 12]);
    expect(r.q1).toBe(4);
    expect(r.q3).toBe(8.5);
    expect(r.mediana).toBe(6);
    expect(r.iqr).toBe(4.5);
    expect(r.indicesQ1).toEqual([1, 2]);
    expect(r.indicesQ3).toEqual([5, 6]);
    expect(r.indicesMedianaExcluida).toEqual([]);
  });

  it("n = 7: 1, 3, 4 | 6 | 8, 9, 11 -> Q1 = 3, Q3 = 9, IQR = 6 y el 6 queda afuera de las dos mitades", () => {
    const r = ordenarYCuartiles([1, 3, 4, 6, 8, 9, 11]);
    expect(r.q1).toBe(3);
    expect(r.q3).toBe(9);
    expect(r.mediana).toBe(6);
    expect(r.iqr).toBe(6);
    expect(r.indicesQ1).toEqual([1]);
    expect(r.indicesMedianaExcluida).toEqual([3]);
    expect(r.indicesQ3).toEqual([5]);
  });

  it("los índices de cada mitad son coherentes con los datos ordenados", () => {
    const r = ordenarYCuartiles([2, 4, 4, 5, 7, 8, 9, 12]);
    const prom = (idx: number[]) => idx.reduce((a, i) => a + r.ordenados[i], 0) / idx.length;
    expect(prom(r.indicesQ1)).toBe(r.q1);
    expect(prom(r.indicesQ3)).toBe(r.q3);
  });
});

describe("media", () => {
  it("61, 64, 58, 67, 60 -> 310 / 5 = 62; 3, 5, 5, 7, 50 -> 70 / 5 = 14; 4, 8, 6, 5, 12 -> 35 / 5 = 7", () => {
    expect(media([61, 64, 58, 67, 60])).toBe(62);
    expect(media([3, 5, 5, 7, 50])).toBe(14);
    expect(media([4, 8, 6, 5, 12])).toBe(7);
  });

  it("tabla de frecuencias 1, 2, 3 con frecuencias 2, 5, 3: (1·2 + 2·5 + 3·3) / 10 = 21 / 10 = 2.1", () => {
    expect(media([1, 1, 2, 2, 2, 2, 2, 3, 3, 3])).toBe(2.1);
  });
});

describe("tablaFrecuencias y moda", () => {
  it("3, 5, 5, 7, 50: el 5 aparece dos veces y es la moda", () => {
    const t = tablaFrecuencias([3, 5, 5, 7, 50]);
    expect(t.valores).toEqual([3, 5, 7, 50]);
    expect(t.frecuencias).toEqual([1, 2, 1, 1]);
    expect(t.maxFrecuencia).toBe(2);
    expect(t.indicesModa).toEqual([1]);
  });

  it("valores 1, 2, 3 con frecuencias 2, 5, 3: moda 2", () => {
    const t = tablaFrecuencias([1, 1, 2, 2, 2, 2, 2, 3, 3, 3]);
    expect(t.frecuencias).toEqual([2, 5, 3]);
    expect(t.indicesModa.map((i) => t.valores[i])).toEqual([2]);
  });

  it("sin repetidos no hay moda; con empate hay dos modas", () => {
    expect(tablaFrecuencias([1, 2, 3]).indicesModa).toEqual([]);
    const t = tablaFrecuencias([1, 1, 2, 2, 3]);
    expect(t.indicesModa.map((i) => t.valores[i])).toEqual([1, 2]);
  });
});

describe("calcularDesvios", () => {
  it("media provisoria 60 con 61, 64, 58, 67, 60: diferencias +1, +4, −2, +7, 0 que suman 10 (10 / 5 = 2 -> media 62)", () => {
    const d = calcularDesvios([61, 64, 58, 67, 60], 60);
    expect(d.desviaciones).toEqual([1, 4, -2, 7, 0]);
    expect(d.sumaDesviaciones).toBe(10);
    expect(60 + d.sumaDesviaciones / 5).toBe(62);
  });

  it("2, 4, 4, 4, 5, 5, 7, 9 con media 5: desviaciones −3, −1, −1, −1, 0, 0, 2, 4; cuadrados 9, 1, 1, 1, 0, 0, 4, 16; suma 32 (varianza 32/8 = 4, desvío 2)", () => {
    const d = calcularDesvios([2, 4, 4, 4, 5, 5, 7, 9], 5);
    expect(d.desviaciones).toEqual([-3, -1, -1, -1, 0, 0, 2, 4]);
    expect(d.cuadrados).toEqual([9, 1, 1, 1, 0, 0, 4, 16]);
    expect(d.sumaCuadrados).toBe(32);
    expect(d.sumaCuadrados / 8).toBe(4);
    expect(Math.sqrt(d.sumaCuadrados / 8)).toBe(2);
  });

  it("4, 8, 6, 5, 12 con media 7: −3, 1, −1, −2, 5; cuadrados 9, 1, 1, 4, 25 (suma 40: poblacional 8, muestral 10)", () => {
    const d = calcularDesvios([4, 8, 6, 5, 12], 7);
    expect(d.desviaciones).toEqual([-3, 1, -1, -2, 5]);
    expect(d.cuadrados).toEqual([9, 1, 1, 4, 25]);
    expect(d.sumaCuadrados).toBe(40);
    expect(d.sumaCuadrados / 5).toBe(8);
    expect(d.sumaCuadrados / 4).toBe(10);
  });

  it("los datos multiplicados por 2 (8, 16, 12, 10, 24, media 14): cuadrados 36, 4, 4, 16, 100; varianza 160/5 = 32 = 4 · 8", () => {
    const d = calcularDesvios([8, 16, 12, 10, 24], 14);
    expect(d.cuadrados).toEqual([36, 4, 4, 16, 100]);
    expect(d.sumaCuadrados).toBe(160);
    expect(d.sumaCuadrados / 5).toBe(32);
  });

  it("3, 5, 5, 7, 50 respecto de su media 14: −11, −9, −9, −7, +36, que suman 0 (la media es el punto de equilibrio)", () => {
    const d = calcularDesvios([3, 5, 5, 7, 50], 14);
    expect(d.desviaciones).toEqual([-11, -9, -9, -7, 36]);
    expect(d.sumaDesviaciones).toBe(0);
  });

  it("4, 5, 6 (media 5) tiene suma de cuadrados 2 y 0, 5, 10 (media 5) tiene 50: la dispersión se ve en los cuadrados", () => {
    expect(calcularDesvios([4, 5, 6], 5).sumaCuadrados).toBe(2);
    expect(calcularDesvios([0, 5, 10], 5).sumaCuadrados).toBe(50);
  });
});

describe("zScore", () => {
  it("μ = 70 y σ = 8: 86 -> 2, 62 -> −1, 78 -> 1; Lengua μ = 75, σ = 6: 84 -> 1.5", () => {
    expect(zScore(86, 70, 8)).toBe(2);
    expect(zScore(62, 70, 8)).toBe(-1);
    expect(zScore(78, 70, 8)).toBe(1);
    expect(zScore(84, 75, 6)).toBe(1.5);
  });

  it("inverso: x = μ + zσ (z = 1.5 -> 82) y μ + 2σ = 130 con μ = 100, σ = 15 tiene z = 2", () => {
    expect(70 + 1.5 * 8).toBe(82);
    expect(zScore(82, 70, 8)).toBe(1.5);
    expect(zScore(130, 100, 15)).toBe(2);
  });
});

describe("regresionLineal", () => {
  it("x = 1..5, y = 1, 3, 2, 5, 4: Sxy = 8, Sxx = 10, Syy = 10, r = 0.8, b = 0.8, a = 0.6 y para x = 6, ŷ = 5.4", () => {
    const r = regresionLineal([1, 2, 3, 4, 5], [1, 3, 2, 5, 4]);
    expect(r.xMedia).toBe(3);
    expect(r.yMedia).toBe(3);
    expect(r.sxy).toBe(8);
    expect(r.sxx).toBe(10);
    expect(r.syy).toBe(10);
    expect(r.r).toBe(0.8);
    expect(r.pendiente).toBe(0.8);
    expect(r.intercepto).toBe(0.6);
    expect(Math.round((r.intercepto + r.pendiente * 6) * 100) / 100).toBe(5.4);
  });

  it("relación curva perfecta x = 1..5, y = 4, 1, 0, 1, 4: Sxy = 0 y por lo tanto r = 0 (sin relación LINEAL)", () => {
    const r = regresionLineal([1, 2, 3, 4, 5], [4, 1, 0, 1, 4]);
    expect(r.sxy).toBe(0);
    expect(r.syy).toBe(14);
    expect(r.r).toBe(0);
    expect(r.pendiente).toBe(0);
    expect(r.intercepto).toBe(2);
  });

  it("coincide con la fórmula alternativa r = (nΣxy − ΣxΣy) / √((nΣx² − (Σx)²)(nΣy² − (Σy)²)) en varios conjuntos", () => {
    const conjuntos: [number[], number[]][] = [
      [[1, 2, 3, 4, 5], [2, 4, 5, 4, 5]],
      [[2, 4, 6, 8], [9, 7, 4, 1]],
      [[10, 20, 30, 40, 50, 60], [12, 15, 21, 30, 34, 41]],
    ];
    for (const [x, y] of conjuntos) {
      const n = x.length;
      const sx = x.reduce((a, b) => a + b, 0);
      const sy = y.reduce((a, b) => a + b, 0);
      const sxy = x.reduce((a, xi, i) => a + xi * y[i], 0);
      const sxx = x.reduce((a, xi) => a + xi * xi, 0);
      const syy = y.reduce((a, yi) => a + yi * yi, 0);
      const r = (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
      const b = (n * sxy - sx * sy) / (n * sxx - sx * sx);
      const a = (sy - b * sx) / n;
      const calc = regresionLineal(x, y);
      expect(calc.r).toBeCloseTo(r, 2);
      expect(calc.pendiente).toBeCloseTo(b, 2);
      expect(calc.intercepto).toBeCloseTo(a, 2);
    }
  });
});

describe("caminosArbol (probabilidad conjunta = producto de las ramas)", () => {
  it("con reposición: roja (3/10) y luego azul (5/10) = 15/100 = 0.15 y todos los caminos suman 1", () => {
    const caminos = caminosArbol([
      { etiqueta: "roja", probabilidad: 0.3, hijos: [{ etiqueta: "azul", probabilidad: 0.5 }, { etiqueta: "no azul", probabilidad: 0.5 }] },
      { etiqueta: "no roja", probabilidad: 0.7, hijos: [{ etiqueta: "azul", probabilidad: 0.5 }, { etiqueta: "no azul", probabilidad: 0.5 }] },
    ]);
    expect(caminos.map((c) => c.probabilidad)).toEqual([0.15, 0.15, 0.35, 0.35]);
    expect(caminos[0].factores).toEqual([0.3, 0.5]);
    expect(caminos[0].etiquetas).toEqual(["roja", "azul"]);
    expect(caminos.reduce((a, c) => a + c.probabilidad, 0)).toBeCloseTo(1, 10);
  });

  it("40 estudiantes (18 estudiaron y aprobaron, 6 estudiaron y reprobaron, 4 no estudiaron y aprobaron, 12 no estudiaron y reprobaron): las ramas condicionales dan 18/40, 6/40, 4/40 y 12/40", () => {
    const tabla = { estudioAprobo: 18, estudioReprobo: 6, noEstudioAprobo: 4, noEstudioReprobo: 12 };
    const N = 40;
    const estudio = tabla.estudioAprobo + tabla.estudioReprobo; // 24
    const noEstudio = tabla.noEstudioAprobo + tabla.noEstudioReprobo; // 16
    expect(estudio + noEstudio).toBe(N);
    const caminos = caminosArbol([
      { etiqueta: "estudió", probabilidad: estudio / N, hijos: [{ etiqueta: "aprobó", probabilidad: tabla.estudioAprobo / estudio }, { etiqueta: "reprobó", probabilidad: tabla.estudioReprobo / estudio }] },
      { etiqueta: "no estudió", probabilidad: noEstudio / N, hijos: [{ etiqueta: "aprobó", probabilidad: tabla.noEstudioAprobo / noEstudio }, { etiqueta: "reprobó", probabilidad: tabla.noEstudioReprobo / noEstudio }] },
    ]);
    expect(caminos.map((c) => c.probabilidad)).toEqual([18 / 40, 6 / 40, 4 / 40, 12 / 40].map((p) => Math.round(p * 100) / 100));
    expect(caminos.map((c) => c.probabilidad)).toEqual([0.45, 0.15, 0.1, 0.3]);
  });

  it("validadores: una probabilidad fuera de [0, 1], una etiqueta vacía o hijos vacíos no son un árbol válido", () => {
    expect(esNodoArbol({ etiqueta: "a", probabilidad: 0.5 })).toBe(true);
    expect(esNodoArbol({ etiqueta: "a", probabilidad: 1.5 })).toBe(false);
    expect(esNodoArbol({ etiqueta: "", probabilidad: 0.5 })).toBe(false);
    expect(esNodoArbol({ etiqueta: "a", probabilidad: 0.5, hijos: [] })).toBe(false);
    expect(esRamas([])).toBe(false);
    expect(esRamas([{ etiqueta: "a", probabilidad: 0.5, hijos: [{ etiqueta: "b", probabilidad: 2 }] }])).toBe(false);
  });
});

describe("combinatoria (contra el triángulo de Pascal)", () => {
  it("valores de las lecciones: 5! = 120, P(8,3) = 336, C(8,3) = 56, C(10,3) = 120, C(10,8) = C(10,2) = 45, C(4,2) = 6", () => {
    expect(factorial(5)).toBe(120);
    expect(permutaciones(8, 3)).toBe(336);
    expect(combinaciones(8, 3)).toBe(56);
    expect(combinaciones(10, 3)).toBe(120);
    expect(combinaciones(10, 8)).toBe(45);
    expect(combinaciones(10, 2)).toBe(45);
    expect(combinaciones(4, 2)).toBe(6);
    expect(permutaciones(10, 3)).toBe(720);
  });

  it("C(n, r) coincide con el triángulo de Pascal para todo n <= 14, y P(n, r) = C(n, r) · r!", () => {
    const pascal: number[][] = [[1]];
    for (let n = 1; n <= 14; n++) {
      const fila = [1];
      for (let k = 1; k < n; k++) fila.push(pascal[n - 1][k - 1] + pascal[n - 1][k]);
      fila.push(1);
      pascal.push(fila);
    }
    for (let n = 0; n <= 14; n++) {
      for (let r = 0; r <= n; r++) {
        expect(combinaciones(n, r), `C(${n},${r})`).toBe(pascal[n][r]);
        expect(permutaciones(n, r), `P(${n},${r})`).toBe(pascal[n][r] * factorial(r));
        expect(combinaciones(n, r)).toBe(combinaciones(n, n - r));
      }
    }
  });

  it("0! = 1 y el producto descendente de P(10,3) es 10, 9, 8", () => {
    expect(factorial(0)).toBe(1);
    expect(productoDescendente(10, 3)).toBe("10 \\cdot 9 \\cdot 8");
    expect(productoDescendente(3, 3)).toBe("3 \\cdot 2 \\cdot 1");
  });
});

// Función error por su serie de Maclaurin (independiente de cualquier otra
// implementación del proyecto): erf(x) = 2/√π · Σ (−1)^n x^(2n+1) / (n! (2n+1)).
function erf(x: number): number {
  let suma = 0;
  let termino = x;
  for (let n = 0; n < 60; n++) {
    suma += termino / (2 * n + 1);
    termino = (-termino * x * x) / (n + 1);
  }
  return (2 / Math.sqrt(Math.PI)) * suma;
}

describe("regla empírica y curva normal", () => {
  it("los porcentajes nominales 68 / 95 / 99.7 coinciden con el área exacta de la normal (erf) con menos de 0.5 puntos de diferencia", () => {
    for (const { k, porcentaje } of REGLA_EMPIRICA) {
      const exacto = erf(k / Math.SQRT2) * 100;
      expect(Math.abs(exacto - porcentaje), `±${k}σ: exacto ${exacto.toFixed(3)}`).toBeLessThan(0.5);
    }
    expect(erf(1 / Math.SQRT2)).toBeCloseTo(0.6827, 3);
    expect(erf(2 / Math.SQRT2)).toBeCloseTo(0.9545, 3);
    expect(erf(3 / Math.SQRT2)).toBeCloseTo(0.9973, 3);
  });

  it("μ = 100, σ = 15: 85–115 (68 %), 70–130 (95 %) y 55–145 (99.7 %)", () => {
    expect(bandasNormal(100, 15)).toEqual([
      { k: 1, porcentaje: 68, desde: 85, hasta: 115 },
      { k: 2, porcentaje: 95, desde: 70, hasta: 130 },
      { k: 3, porcentaje: 99.7, desde: 55, hasta: 145 },
    ]);
  });

  it("colas: si el 95 % está en ±2σ, queda 5 % afuera y 2.5 % por encima de 130", () => {
    expect((100 - 95) / 2).toBe(2.5);
  });

  it("densidad de la normal: máximo 1/(σ√(2π)) en la media y e^(−1/2) veces eso a un desvío", () => {
    expect(densidadNormal(100, 100, 15)).toBeCloseTo(1 / (15 * Math.sqrt(2 * Math.PI)), 12);
    expect(densidadNormal(115, 100, 15) / densidadNormal(100, 100, 15)).toBeCloseTo(Math.exp(-0.5), 12);
    expect(densidadNormal(85, 100, 15)).toBeCloseTo(densidadNormal(115, 100, 15), 12);
  });
});

describe("validadores", () => {
  it("esListaNumeros exige la cantidad mínima y números finitos", () => {
    expect(esListaNumeros([1, 2])).toBe(true);
    expect(esListaNumeros([1])).toBe(false);
    expect(esListaNumeros([1], 1)).toBe(true);
    expect(esListaNumeros([1, NaN])).toBe(false);
    expect(esListaNumeros([1, "2"])).toBe(false);
    expect(esListaNumeros("nada")).toBe(false);
  });

  it("esGraficoEstadistica valida cada tipo de gráfico y rechaza los rotos", () => {
    const eje = { min: 0, max: 10, tick: 2, etiqueta: "Valor" };
    expect(esGraficoEstadistica({ tipo: "barras", titulo: "t", categorias: ["a", "b"], valores: [1, 2], eje })).toBe(true);
    expect(esGraficoEstadistica({ tipo: "barras", titulo: "t", categorias: ["a"], valores: [1, 2], eje })).toBe(false);
    expect(esGraficoEstadistica({ tipo: "histograma", titulo: "t", limites: [0, 1, 2], frecuencias: [3, 4], eje, etiquetaX: "x" })).toBe(true);
    expect(esGraficoEstadistica({ tipo: "histograma", titulo: "t", limites: [0, 1, 2], frecuencias: [3], eje, etiquetaX: "x" })).toBe(false);
    expect(esGraficoEstadistica({ tipo: "boxplot", titulo: "t", min: 1, q1: 2, mediana: 3, q3: 4, max: 5, atipicos: [], eje })).toBe(true);
    expect(esGraficoEstadistica({ tipo: "otro", titulo: "t", eje })).toBe(false);
    expect(esGraficoEstadistica(null)).toBe(false);
  });
});
