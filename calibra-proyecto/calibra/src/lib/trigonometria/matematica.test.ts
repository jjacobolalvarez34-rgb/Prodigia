import { describe, it, expect } from "vitest";
import katex from "katex";
import {
  EXACTO_UNO,
  cosExacto,
  cosecExacto,
  cotExacto,
  divE,
  exacto,
  funcionExacta,
  funcionNumerica,
  igualE,
  invE,
  mulE,
  planoE,
  secExacto,
  senExacto,
  sumaE,
  tanExacto,
  texE,
  valorE,
  type FuncionTrig,
} from "./exactos";
import { coterminalesEn, cuadranteDe, fraccionDePi, radianesPlano, radianesTex, referenciaGrados } from "./angulos";
import { cosYTanDesdeSeno, planoRadical, raizSimplificada, texRadical, valorRadical } from "./radicales";
import {
  aGrados,
  aRad,
  areaHeron,
  areaSAS,
  cantidadSSA,
  oblicuoAAS,
  oblicuoSAS,
  oblicuoSSS,
  rectanguloDeAnguloYLado,
  rectanguloDeCatetos,
  redondear,
  solucionesSSA,
} from "./triangulos";
import {
  amplitud,
  asintotasTan,
  ecuacionPlano,
  ecuacionTex,
  maximo,
  minimo,
  muestrear,
  multiploPiTex,
  onda,
  periodo,
  periodoPi,
  puntosClave,
  valorOnda,
} from "./ondas";
import { frac, aNumero } from "./fracciones";
import {
  ANGULOS_DE_PRUEBA_GRADOS,
  EQUIVALENCIAS,
  IDENTIDADES_BASE,
  IDENTIDADES_DOS_ANGULOS,
} from "./identidades";

// Verificación de las funciones puras del mundo Trigonometría (la base de la
// práctica, de los visuales y de las lecciones): cada valor exacto se contrasta
// con Math.* y con una TABLA CURADA escrita aparte a mano (de un libro de
// texto), y cada resolución de triángulos con un método independiente.

const TOL = 1e-12;

// Tabla curada (independiente de exactos.ts): valores exactos de sen, cos y tan de
// los ángulos de una vuelta que son múltiplos de 30° o de 45°, en texto plano.
const TABLA_CURADA: Record<number, [string, string, string]> = {
  0: ["0", "1", "0"],
  30: ["1/2", "√3/2", "√3/3"],
  45: ["√2/2", "√2/2", "1"],
  60: ["√3/2", "1/2", "√3"],
  90: ["1", "0", "indefinido"],
  120: ["√3/2", "-1/2", "-√3"],
  135: ["√2/2", "-√2/2", "-1"],
  150: ["1/2", "-√3/2", "-√3/3"],
  180: ["0", "-1", "0"],
  210: ["-1/2", "-√3/2", "√3/3"],
  225: ["-√2/2", "-√2/2", "1"],
  240: ["-√3/2", "-1/2", "√3"],
  270: ["-1", "0", "indefinido"],
  300: ["-√3/2", "1/2", "-√3"],
  315: ["-√2/2", "√2/2", "-1"],
  330: ["-1/2", "√3/2", "-√3/3"],
};

const plano = (x: ReturnType<typeof tanExacto>): string => (x === null ? "indefinido" : planoE(x));

describe("valores exactos (anillo Q(√2, √3))", () => {
  it("coinciden con la tabla curada en los 16 ángulos de tabla", () => {
    for (const [g, [s, c, t]] of Object.entries(TABLA_CURADA)) {
      const grados = Number(g);
      expect(planoE(senExacto(grados)), `sen ${g}°`).toBe(s);
      expect(planoE(cosExacto(grados)), `cos ${g}°`).toBe(c);
      expect(plano(tanExacto(grados)), `tan ${g}°`).toBe(t);
    }
  });

  it("valen lo mismo que Math.sin, Math.cos y Math.tan en todos los múltiplos de 15° de -720° a 720°", () => {
    const funciones: FuncionTrig[] = ["sen", "cos", "tan", "cosec", "sec", "cot"];
    let comparados = 0;
    for (let g = -720; g <= 720; g += 15) {
      for (const fn of funciones) {
        const exacta = funcionExacta(fn, g);
        const numerica = funcionNumerica(fn, g);
        // donde Math.* da un valor enorme o NaN, la función exacta es indefinida
        if (exacta === null) {
          expect(Math.abs(numerica) > 1e10 || Number.isNaN(numerica), `${fn} ${g}°`).toBe(true);
        } else {
          expect(Math.abs(valorE(exacta) - numerica), `${fn} ${g}°`).toBeLessThan(TOL * Math.max(1, Math.abs(numerica)) * 1e3);
          comparados++;
        }
      }
    }
    expect(comparados).toBeGreaterThan(400);
  });

  it("los valores de 15° y 75° son los conocidos", () => {
    expect(planoE(senExacto(15))).toBe("(√6-√2)/4");
    expect(planoE(cosExacto(15))).toBe("(√6+√2)/4");
    expect(plano(tanExacto(15))).toBe("2-√3");
    expect(planoE(senExacto(75))).toBe("(√6+√2)/4");
    expect(planoE(cosExacto(75))).toBe("(√6-√2)/4");
    expect(plano(tanExacto(75))).toBe("2+√3");
    expect(plano(tanExacto(105))).toBe("-2-√3");
    expect(planoE(cosExacto(105))).toBe("-(√6-√2)/4");
  });

  it("sen² + cos² = 1 y tan = sen/cos se cumplen de forma EXACTA (sin decimales)", () => {
    for (let g = 0; g < 360; g += 15) {
      const s = senExacto(g);
      const c = cosExacto(g);
      expect(igualE(sumaE(mulE(s, s), mulE(c, c)), EXACTO_UNO), `${g}°`).toBe(true);
      const t = tanExacto(g);
      if (t !== null) expect(igualE(mulE(t, c), s), `${g}°`).toBe(true);
      const cs = cosecExacto(g);
      if (cs !== null) expect(igualE(mulE(cs, s), EXACTO_UNO), `cosec ${g}°`).toBe(true);
      const se = secExacto(g);
      if (se !== null) expect(igualE(mulE(se, c), EXACTO_UNO), `sec ${g}°`).toBe(true);
      const ct = cotExacto(g);
      if (ct !== null && t !== null) expect(igualE(mulE(ct, t), EXACTO_UNO), `cot ${g}°`).toBe(true);
    }
  });

  it("el inverso y la división son exactos", () => {
    const x = exacto(1, 1, 1, 1); // 1 + √2 + √3 + √6
    expect(igualE(mulE(x, invE(x)), EXACTO_UNO)).toBe(true);
    expect(igualE(divE(x, x), EXACTO_UNO)).toBe(true);
    expect(() => invE(exacto(0))).toThrow();
  });

  it("solo acepta múltiplos de 15°", () => {
    expect(() => senExacto(10)).toThrow();
    expect(() => cosExacto(7.5)).toThrow();
  });

  it("el LaTeX de cada valor compila en KaTeX y no repite un mismo número escrito dos veces distinto", () => {
    const vistos = new Map<string, string>();
    for (let g = 0; g < 360; g += 15) {
      for (const fn of ["sen", "cos", "tan", "cosec", "sec", "cot"] as FuncionTrig[]) {
        const x = funcionExacta(fn, g);
        if (x === null) continue;
        katex.renderToString(texE(x), { throwOnError: true });
        const clave = valorE(x).toFixed(9);
        const previo = vistos.get(clave);
        if (previo !== undefined) expect(previo, `${fn} ${g}°`).toBe(texE(x));
        vistos.set(clave, texE(x));
      }
    }
  });
});

describe("ángulos: radianes, cuadrantes, referencia y coterminales", () => {
  it("grados a radianes como fracción de π (contra la conversión numérica)", () => {
    for (let g = -720; g <= 720; g += 15) {
      const f = fraccionDePi(g);
      expect(aNumero(f) * Math.PI).toBeCloseTo(aRad(g), 12);
    }
    expect(radianesTex(150)).toBe("\\frac{5\\pi}{6}");
    expect(radianesTex(180)).toBe("\\pi");
    expect(radianesTex(360)).toBe("2\\pi");
    expect(radianesTex(-45)).toBe("-\\frac{\\pi}{4}");
    expect(radianesTex(0)).toBe("0");
    expect(radianesPlano(390)).toBe("13π/6");
    expect(radianesTex(60)).toBe("\\frac{\\pi}{3}");
  });

  it("cuadrante y ángulo de referencia", () => {
    expect([30, 120, 210, 330].map(cuadranteDe)).toEqual([1, 2, 3, 4]);
    expect([0, 90, 180, 270, 360, -90].map(cuadranteDe)).toEqual([null, null, null, null, null, null]);
    expect(referenciaGrados(150)).toBe(30);
    expect(referenciaGrados(210)).toBe(30);
    expect(referenciaGrados(315)).toBe(45);
    expect(referenciaGrados(-60)).toBe(60);
    expect(referenciaGrados(405)).toBe(45);
    // el valor absoluto de sen/cos de un ángulo es el de su referencia
    for (let g = -360; g <= 720; g += 15) {
      const r = referenciaGrados(g);
      expect(Math.abs(Math.sin(aRad(g)))).toBeCloseTo(Math.sin(aRad(r)), 12);
      expect(Math.abs(Math.cos(aRad(g)))).toBeCloseTo(Math.cos(aRad(r)), 12);
    }
  });

  it("los ángulos coterminales tienen las mismas razones", () => {
    expect(coterminalesEn(60, -360, 720)).toEqual([-300, 60, 420]);
    expect(coterminalesEn(-45, 0, 720)).toEqual([315, 675]);
    for (const c of coterminalesEn(30, -720, 720)) expect(Math.sin(aRad(c))).toBeCloseTo(0.5, 12);
  });
});

describe("radicales √n con coeficiente racional (dado sen θ, hallar cos y tan)", () => {
  it("raizSimplificada", () => {
    expect(raizSimplificada(8)).toEqual({ k: 2, m: 2 });
    expect(raizSimplificada(24)).toEqual({ k: 2, m: 6 });
    expect(raizSimplificada(16)).toEqual({ k: 4, m: 1 });
    expect(raizSimplificada(7)).toEqual({ k: 1, m: 7 });
  });

  it("cos y tan desde sen = p/q coinciden con Math.acos/Math.tan para muchos p/q", () => {
    for (let q = 2; q <= 30; q++) {
      for (let p = 1; p < q; p++) {
        const theta = Math.asin(p / q);
        const { cos, tan } = cosYTanDesdeSeno(p, q);
        expect(valorRadical(cos), `cos con sen ${p}/${q}`).toBeCloseTo(Math.cos(theta), 12);
        expect(valorRadical(tan), `tan con sen ${p}/${q}`).toBeCloseTo(Math.tan(theta), 10);
        katex.renderToString(texRadical(cos), { throwOnError: true });
        katex.renderToString(texRadical(tan), { throwOnError: true });
      }
    }
    expect(planoRadical(cosYTanDesdeSeno(1, 3).cos)).toBe("2√2/3");
    expect(planoRadical(cosYTanDesdeSeno(1, 3).tan)).toBe("√2/4");
    expect(planoRadical(cosYTanDesdeSeno(3, 5).cos)).toBe("4/5");
    expect(planoRadical(cosYTanDesdeSeno(3, 5).tan)).toBe("3/4");
  });
});

describe("triángulos", () => {
  it("rectángulo: Pitágoras, ángulos que suman 90° y razones coherentes (varios puntos de partida)", () => {
    for (let A = 5; A <= 85; A += 5) {
      for (const lado of ["a", "b", "c"] as const) {
        const r = rectanguloDeAnguloYLado(A, lado, 10);
        expect(Math.hypot(r.a, r.b), `${A}° ${lado}`).toBeCloseTo(r.c, 10);
        expect(r.A + r.B).toBeCloseTo(90, 12);
        // método independiente: desde los catetos se recupera el mismo ángulo
        expect(rectanguloDeCatetos(r.a, r.b).A).toBeCloseTo(A, 9);
        expect(r.a / r.c).toBeCloseTo(Math.sin(aRad(A)), 12);
        expect(r.b / r.c).toBeCloseTo(Math.cos(aRad(A)), 12);
      }
    }
  });

  it("oblicuo por SAS, SSS y AAS: los ángulos suman 180° y se cumplen la ley del seno y la del coseno", () => {
    for (let a = 3; a <= 15; a += 3) {
      for (let b = 4; b <= 16; b += 4) {
        for (let C = 20; C <= 160; C += 20) {
          const t = oblicuoSAS(a, b, C);
          expect(t.A + t.B + t.C, `${a},${b},${C}`).toBeCloseTo(180, 9);
          // ley del seno con TODAS las parejas (independiente de cómo se calcularon los ángulos)
          expect(t.a / Math.sin(aRad(t.A))).toBeCloseTo(t.b / Math.sin(aRad(t.B)), 8);
          expect(t.b / Math.sin(aRad(t.B))).toBeCloseTo(t.c / Math.sin(aRad(t.C)), 8);
          // reconstruye desde SSS y vuelve a los mismos ángulos
          const s = oblicuoSSS(t.a, t.b, t.c);
          expect(s.A).toBeCloseTo(t.A, 7);
          expect(s.B).toBeCloseTo(t.B, 7);
          expect(s.C).toBeCloseTo(C, 7);
          // el área por ½ab·senC coincide con la fórmula de Herón
          expect(areaSAS(a, b, C)).toBeCloseTo(areaHeron(t.a, t.b, t.c), 8);
        }
      }
    }
    const asa = oblicuoAAS(40, 65, 12);
    expect(asa.C).toBe(75);
    expect(asa.b / Math.sin(aRad(65))).toBeCloseTo(12 / Math.sin(aRad(40)), 12);
    expect(() => oblicuoSSS(1, 2, 5)).toThrow();
    expect(() => oblicuoAAS(100, 90, 1)).toThrow();
  });

  it("un ángulo obtuso NO sale de asin: SAS con a=15, b=4, C=30° da A obtuso (regresión del generador viejo)", () => {
    const t = oblicuoSAS(15, 4, 30);
    expect(t.A).toBeGreaterThan(90);
    expect(t.A + t.B + t.C).toBeCloseTo(180, 9);
    // con asin(a·senC/c) se habría obtenido el suplementario
    const conAsin = aGrados(Math.asin((15 * Math.sin(aRad(30))) / t.c));
    expect(Math.abs(conAsin - t.A)).toBeGreaterThan(30);
  });

  it("caso ambiguo: la regla de la altura, la resolución por ley del seno y un conteo geométrico independiente coinciden", () => {
    // Conteo independiente: A=(0,0), C sobre el rayo de ángulo A a distancia b; B=(x,0) con |BC|=a
    // => (x − b·cosA)² + (b·senA)² = a²  => se cuentan las raíces x > 0.
    function contarPorCoordenadas(a: number, b: number, A: number): number {
      const disc = a * a - (b * Math.sin(aRad(A))) ** 2;
      if (disc < -1e-9) return 0;
      const raiz = Math.sqrt(Math.max(0, disc));
      const xs = disc < 1e-9 ? [b * Math.cos(aRad(A))] : [b * Math.cos(aRad(A)) + raiz, b * Math.cos(aRad(A)) - raiz];
      return xs.filter((x) => x > 1e-9).length;
    }
    const vistos = new Set<number>();
    for (let A = 10; A <= 170; A += 5) {
      for (let b = 4; b <= 20; b += 2) {
        for (let a = 2; a <= 24; a++) {
          const porAltura = cantidadSSA(a, b, A);
          expect(porAltura, `a=${a} b=${b} A=${A}`).toBe(contarPorCoordenadas(a, b, A));
          expect(solucionesSSA(a, b, A).length, `a=${a} b=${b} A=${A}`).toBe(porAltura);
          for (const s of solucionesSSA(a, b, A)) {
            expect(s.A + s.B + s.C).toBeCloseTo(180, 9);
            expect(s.a / Math.sin(aRad(s.A))).toBeCloseTo(s.b / Math.sin(aRad(s.B)), 8);
            expect(s.C).toBeGreaterThan(0);
          }
          vistos.add(porAltura);
        }
      }
    }
    expect([...vistos].sort()).toEqual([0, 1, 2]);
    // el caso "a = h" con h exacto: a = 5, b = 10, A = 30° -> un solo triángulo (rectángulo)
    expect(cantidadSSA(5, 10, 30)).toBe(1);
    expect(solucionesSSA(5, 10, 30)).toHaveLength(1);
    expect(solucionesSSA(5, 10, 30)[0].B).toBeCloseTo(90, 9);
  });

  it("redondear no se equivoca con x,xx5", () => {
    expect(redondear(1.005, 2)).toBe(1.01);
    expect(redondear(2.675, 2)).toBe(2.68);
    expect(redondear(0.125, 2)).toBe(0.13);
    expect(redondear(-1.005, 2)).toBe(-1);
    expect(redondear(36.8699, 1)).toBe(36.9);
  });
});

describe("ondas: y = a·f(b(x − c)) + d", () => {
  it("amplitud, periodo, máximo, mínimo y puntos clave coinciden con la función evaluada", () => {
    const casos = [
      onda("sen", 2, 3, frac(1, 6), 1),
      onda("cos", 3, 2, 0, -1),
      onda("sen", 1, frac(1, 2), frac(1, 2), 0),
      onda("cos", frac(1, 2), 1, frac(-1, 4), 2),
      onda("sen", -2, 4, 0, 0),
    ];
    for (const o of casos) {
      const P = periodo(o);
      // periodicidad numérica
      for (const x of [0.1, 0.7, 1.9, 3.3]) expect(valorOnda(o, x + P)).toBeCloseTo(valorOnda(o, x), 9);
      // ningún periodo más corto: la mitad del periodo NO repite la función
      const enMitad = [0.1, 0.7, 1.9].some((x) => Math.abs(valorOnda(o, x + P / 2) - valorOnda(o, x)) > 1e-6);
      expect(enMitad, ecuacionPlano(o)).toBe(true);
      // extremos por muestreo fino
      let maxN = -Infinity;
      let minN = Infinity;
      for (let i = 0; i <= 20000; i++) {
        const y = valorOnda(o, (i / 20000) * P + aNumero(o.cPi) * Math.PI);
        maxN = Math.max(maxN, y);
        minN = Math.min(minN, y);
      }
      expect(maxN).toBeCloseTo(aNumero(maximo(o)), 5);
      expect(minN).toBeCloseTo(aNumero(minimo(o)), 5);
      expect(aNumero(maximo(o)) - aNumero(minimo(o))).toBeCloseTo(2 * aNumero(amplitud(o)), 12);
      // puntos clave: la función vale lo que dice en cada uno
      for (const p of puntosClave(o)) expect(valorOnda(o, aNumero(p.xPi) * Math.PI), `${ecuacionPlano(o)} en ${aNumero(p.xPi)}π`).toBeCloseTo(aNumero(p.y), 9);
      // el ciclo de 5 puntos tiene el ancho de un periodo
      const pk = puntosClave(o);
      expect(aNumero(pk[4].xPi) - aNumero(pk[0].xPi)).toBeCloseTo(aNumero(periodoPi(o)), 12);
    }
  });

  it("periodo = 2π/b (y π/b para la tangente)", () => {
    expect(periodoPi(onda("sen", 1, 3))).toEqual(frac(2, 3));
    expect(periodoPi(onda("sen", 1, 2))).toEqual(frac(1));
    expect(periodoPi(onda("cos", 1, frac(1, 2)))).toEqual(frac(4));
    expect(periodoPi(onda("tan", 1, 2))).toEqual(frac(1, 2));
    expect(periodoPi(onda("tan", 1, 1))).toEqual(frac(1));
  });

  it("tangente: las asíntotas están donde el coseno del argumento se anula y la función se dispara", () => {
    const o = onda("tan", 1, 2, frac(1, 4));
    const as = asintotasTan(o, frac(-1), frac(1));
    expect(as.length).toBeGreaterThan(3);
    for (const x of as) {
      const xr = aNumero(x) * Math.PI;
      expect(Math.abs(Math.cos(2 * (xr - Math.PI / 4)))).toBeLessThan(1e-9);
      expect(Math.abs(valorOnda(o, xr + 1e-4))).toBeGreaterThan(1000);
    }
    // entre dos asíntotas consecutivas hay un periodo
    expect(aNumero(as[1]) - aNumero(as[0])).toBeCloseTo(aNumero(periodoPi(o)), 12);
    expect(valorOnda(onda("tan", 1, 1), Math.PI / 4)).toBeCloseTo(1, 12);
  });

  it("el muestreo es determinista y redondeado (la misma salida siempre)", () => {
    const o = onda("sen", 2, 1, 0, 1);
    const m1 = muestrear(o, frac(0), frac(2), 40);
    const m2 = muestrear(o, frac(0), frac(2), 40);
    expect(m1).toEqual(m2);
    expect(m1).toHaveLength(41);
    for (const p of m1) expect(Math.abs(p.y * 1000 - Math.round(p.y * 1000))).toBeLessThan(1e-6);
    expect(m1[0]).toEqual({ x: 0, y: 1 });
    expect(m1[10].y).toBeCloseTo(3, 2); // x = π/2 -> 2·1 + 1
  });

  it("el LaTeX de la ecuación compila y tiene la forma esperada", () => {
    expect(ecuacionTex(onda("sen", 2, 3, frac(1, 6), 1))).toBe("y=2\\operatorname{sen}\\left(3\\left(x-\\frac{\\pi}{6}\\right)\\right)+1");
    expect(ecuacionTex(onda("cos"))).toBe("y=\\cos\\left(x\\right)");
    expect(ecuacionTex(onda("sen", 3, 1, frac(-1, 4), -2))).toBe("y=3\\operatorname{sen}\\left(x+\\frac{\\pi}{4}\\right)-2");
    expect(ecuacionTex(onda("tan", 1, 2))).toBe("y=\\tan\\left(2x\\right)");
    expect(ecuacionPlano(onda("sen", 2, 3, frac(1, 6), 1))).toBe("y = 2sen(3(x - π/6)) + 1");
    expect(multiploPiTex(frac(-3, 2))).toBe("-\\frac{3\\pi}{2}");
    for (const o of [onda("sen", 2, 3, frac(1, 6), 1), onda("cos", frac(1, 2), frac(1, 2), frac(-1, 3), frac(-3, 2))]) {
      katex.renderToString(ecuacionTex(o), { throwOnError: true });
    }
  });
});

describe("identidades: cada una se verifica numéricamente en decenas de ángulos", () => {
  it("las identidades de un ángulo valen en todos los ángulos de prueba", () => {
    for (const id of IDENTIDADES_BASE) {
      katex.renderToString(id.tex, { throwOnError: true });
      for (const g of ANGULOS_DE_PRUEBA_GRADOS) {
        const x = aRad(g);
        expect(id.izq(x), `${id.id} en ${g}°`).toBeCloseTo(id.der(x), 9);
      }
    }
  });

  it("las identidades de suma y diferencia valen para muchos pares (a, b)", () => {
    for (const id of IDENTIDADES_DOS_ANGULOS) {
      katex.renderToString(id.tex, { throwOnError: true });
      for (const a of ANGULOS_DE_PRUEBA_GRADOS.slice(0, 10)) {
        for (const b of ANGULOS_DE_PRUEBA_GRADOS.slice(5, 15)) {
          const va = id.izq(aRad(a), aRad(b));
          const vb = id.der(aRad(a), aRad(b));
          if (!Number.isFinite(va) || !Number.isFinite(vb) || Math.abs(va) > 1e6) continue;
          expect(va, `${id.id} a=${a} b=${b}`).toBeCloseTo(vb, 7);
        }
      }
    }
  });

  it("cada equivalencia: la correcta coincide en todos los ángulos y cada distractor FALLA en alguno", () => {
    const ids = new Set<string>();
    for (const q of EQUIVALENCIAS) {
      expect(ids.has(q.id), `id repetido ${q.id}`).toBe(false);
      ids.add(q.id);
      expect(q.incorrectas.length, q.id).toBeGreaterThanOrEqual(3);
      for (const t of [q.expr, q.correcta, ...q.incorrectas]) katex.renderToString(t.tex, { throwOnError: true });
      for (const g of ANGULOS_DE_PRUEBA_GRADOS) {
        const x = aRad(g);
        expect(q.expr.f(x), `${q.id} en ${g}°`).toBeCloseTo(q.correcta.f(x), 9);
      }
      const textos = new Set([q.correcta.tex, ...q.incorrectas.map((e) => e.tex)]);
      expect(textos.size, `${q.id}: opciones repetidas`).toBe(q.incorrectas.length + 1);
      for (const mala of q.incorrectas) {
        const falla = ANGULOS_DE_PRUEBA_GRADOS.some((g) => Math.abs(q.expr.f(aRad(g)) - mala.f(aRad(g))) > 1e-6);
        expect(falla, `${q.id}: «${mala.tex}» es equivalente a la expresión`).toBe(true);
      }
    }
    expect(EQUIVALENCIAS.filter((q) => q.nivel === 0).length).toBeGreaterThanOrEqual(5);
    expect(EQUIVALENCIAS.filter((q) => q.nivel === 1).length).toBeGreaterThanOrEqual(5);
    expect(EQUIVALENCIAS.filter((q) => q.nivel === 2).length).toBeGreaterThanOrEqual(5);
  });
});
