import { describe, it, expect } from "vitest";
import katex from "katex";
import {
  VISTA_CIRCULO,
  VISTA_CUADRANTES,
  VISTA_ECUACION,
  VISTA_ECUACION_CIRCULO,
  VISTA_IDENTIDAD,
  VISTA_ONDA,
  datosCirculo,
  datosCuadrantes,
  datosEcuacion,
  datosIdentidad,
  datosOnda,
  datosResolver,
  datosTriangulo,
  esOndaJsonValida,
  solucionesEcuacion,
  textoCirculo,
  textoCuadrantes,
  textoOnda,
  textoResolver,
  textoTriangulo,
} from "./visualesDatos";
import { datosLey, VISTA_LEY } from "./visualesLey";
import { aRad, cantidadSSA, oblicuoAAS, oblicuoSAS, redondear } from "./triangulos";
import { cosExacto, senExacto, tanExacto, planoE } from "./exactos";
import { aNumero, frac } from "./fracciones";
import { periodoPi, valorOnda, amplitud } from "./ondas";
import { ondaDeJson } from "./visualesDatos";
import type { OndaJson } from "./visuales";

// Verificación de los datos de los visuales de Trigonometría con cálculos
// independientes: cada coordenada dibujada se comprueba contra la función que
// representa (Math.*), las leyes con geometría de coordenadas y las ondas con
// la fórmula y la escala de sus propios ejes. Nada de valores "a ojo".

const deg = (r: number): number => (r * 180) / Math.PI;
const noHayBasura = (t: string, donde: string) => expect(t, donde).not.toMatch(/NaN|undefined|Infinity|\[object|null/);

function tramos(d: string[]): { x: number; y: number }[][] {
  return d.map((tramo) => {
    const pts = [...tramo.matchAll(/[ML] (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
    expect(pts.length, tramo).toBeGreaterThan(1);
    expect(tramo.replace(/[ML] -?\d+(?:\.\d+)? -?\d+(?:\.\d+)?/g, "").trim(), `comandos inesperados en ${tramo.slice(0, 60)}`).toBe("");
    return pts;
  });
}

function distanciaAPolilinea(p: { x: number; y: number }, tr: { x: number; y: number }[][]): number {
  let mejor = Infinity;
  for (const t of tr) {
    for (let i = 1; i < t.length; i++) {
      const a = t[i - 1];
      const b = t[i];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const l2 = dx * dx + dy * dy || 1;
      const u = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
      mejor = Math.min(mejor, Math.hypot(p.x - (a.x + u * dx), p.y - (a.y + u * dy)));
    }
  }
  return mejor;
}

describe("trigonometria.triangulo", () => {
  it("las razones con los números del dibujo coinciden con Math.sin/cos/tan del ángulo real (y sus recíprocas)", () => {
    for (const catetos of [[3, 4], [5, 12], [8, 15], [1, 1], [2, 5], [7, 3]] as [number, number][]) {
      for (const vertice of ["A", "B"] as const) {
        const d = datosTriangulo({ catetos, vertice, pasos: ["hipotenusa", "opuesto", "adyacente", "sen", "cos", "tan", "cosec", "sec", "cot"] });
        // el ángulo real, con atan2 (independiente de las razones que se muestran)
        const angulo = vertice === "A" ? Math.atan2(catetos[0], catetos[1]) : Math.atan2(catetos[1], catetos[0]);
        expect(d.anguloGrados).toBeCloseTo(deg(angulo), 9);
        expect(d.c).toBeCloseTo(Math.hypot(...catetos), 12);
        const esperado = { sen: Math.sin(angulo), cos: Math.cos(angulo), tan: Math.tan(angulo), cosec: 1 / Math.sin(angulo), sec: 1 / Math.cos(angulo), cot: 1 / Math.tan(angulo) };
        for (const p of d.pasos.filter((x) => x.razon)) expect(p.razon!.valor, `${catetos} ${vertice} ${p.id}`).toBeCloseTo(esperado[p.razon!.fn], 9);
        // roles: en el vértice A el cateto a (vertical) es el opuesto; en el B es el adyacente
        expect(d.rolDe.c).toBe("hipotenusa");
        expect(d.rolDe.a).toBe(vertice === "A" ? "opuesto" : "adyacente");
        expect(d.rolDe.b).toBe(vertice === "A" ? "adyacente" : "opuesto");
        expect(new Set(d.pasos.map((p) => p.id)).size).toBe(9);
      }
    }
  });

  it("sen y cos nunca superan 1 y la hipotenusa es siempre el lado mayor; entradas inválidas fallan", () => {
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        const d = datosTriangulo({ catetos: [a, b], vertice: "A", pasos: ["sen", "cos"] });
        for (const p of d.pasos) expect(p.razon!.valor).toBeLessThan(1);
        expect(d.c).toBeGreaterThan(Math.max(a, b));
      }
    }
    expect(() => datosTriangulo({ catetos: [0, 3], vertice: "A" })).toThrow();
    expect(() => datosTriangulo({ catetos: [-1, 3], vertice: "B" })).toThrow();
  });

  it("texto alternativo completo y sin basura", () => {
    const t = textoTriangulo({ catetos: [3, 4], vertice: "A", pasos: ["opuesto", "sen", "cos", "tan"] });
    expect(t).toContain("catetos 3 y 4");
    expect(t).toContain("sen(A) = opuesto / hipotenusa = 3 / 5 = 0,6");
    noHayBasura(t, "triangulo");
  });
});

describe("trigonometria.resolver", () => {
  it("hallar un lado: el resultado coincide con la ley del seno en el triángulo (A, 90° − A, 90°) para todas las combinaciones", () => {
    let casos = 0;
    for (const angulo of [15, 20, 30, 35, 45, 52, 60, 68, 75]) {
      for (const dado of ["a", "b", "c"] as const) {
        for (const pedido of ["a", "b", "c"] as const) {
          if (dado === pedido) continue;
          const d = datosResolver({ tipo: "trigonometria.resolver", modo: "lado", angulo, dado, valor: 12, pedido });
          const opuesto = { a: rad(angulo), b: rad(90 - angulo), c: rad(90) };
          const esperado = (12 * Math.sin(opuesto[pedido])) / Math.sin(opuesto[dado]);
          expect(d.resultado, `${angulo}° ${dado}->${pedido}`).toBeCloseTo(redondear(esperado, 2), 9);
          // la razón elegida es la que usa los dos lados: (op,hip)→sen, (ady,hip)→cos, (op,ady)→tan
          const par = new Set([dado, pedido]);
          expect(d.fn).toBe(par.has("c") ? (par.has("a") ? "sen" : "cos") : "tan");
          // el lado pedido dibujado coincide con el real y la figura es un triángulo rectángulo
          expect(d.a ** 2 + d.b ** 2).toBeCloseTo(d.c ** 2, 9);
          expect(d.pasos.map((p) => p.clave)).toEqual(["figura", "roles", "razon", "plantear", "despejar", "calcular", "comprobar"]);
          for (const p of d.pasos) for (const f of p.formulas) katex.renderToString(f, { throwOnError: true });
          casos++;
        }
      }
    }
    expect(casos).toBe(54);
  });

  it("hallar un ángulo: coincide con la ley del coseno (cálculo independiente) y el complemento suma 90°", () => {
    const pares: [{ lado: "a" | "b" | "c"; valor: number }, { lado: "a" | "b" | "c"; valor: number }][] = [
      [{ lado: "a", valor: 3 }, { lado: "b", valor: 4 }],
      [{ lado: "a", valor: 5 }, { lado: "c", valor: 13 }],
      [{ lado: "b", valor: 12 }, { lado: "c", valor: 13 }],
      [{ lado: "b", valor: 7 }, { lado: "a", valor: 2 }],
    ];
    for (const lados of pares) {
      const d = datosResolver({ tipo: "trigonometria.resolver", modo: "angulo", lados });
      const a = d.a;
      const b = d.b;
      const c = d.c;
      // ley del coseno para el vértice A: cos A = (b² + c² − a²) / (2bc)
      expect(d.resultado).toBeCloseTo(redondear(deg(Math.acos((b * b + c * c - a * a) / (2 * b * c))), 1), 9);
      expect(a * a + b * b).toBeCloseTo(c * c, 9);
      for (const p of d.pasos) for (const f of p.formulas) katex.renderToString(f, { throwOnError: true });
      expect(d.pasos[5].formulas[0]).toContain(String(d.resultado).replace(".", "{,}"));
    }
    // 3-4: tan A = 3/4 -> 36,9°
    const t = datosResolver({ tipo: "trigonometria.resolver", modo: "angulo", lados: [{ lado: "a", valor: 3 }, { lado: "b", valor: 4 }] });
    expect(t.fn).toBe("tan");
    expect(t.resultado).toBe(36.9);
    expect(t.pasos[4].formulas[0]).toBe("A=\\tan^{-1}\\left(\\dfrac{3}{4}\\right)");
  });

  it("valores inválidos se rechazan", () => {
    expect(() => datosResolver({ tipo: "trigonometria.resolver", modo: "lado", angulo: 30, dado: "a", valor: 5, pedido: "a" })).toThrow();
    expect(() => datosResolver({ tipo: "trigonometria.resolver", modo: "lado", angulo: 90, dado: "a", valor: 5, pedido: "b" })).toThrow();
    expect(() => datosResolver({ tipo: "trigonometria.resolver", modo: "angulo", lados: [{ lado: "a", valor: 3 }, { lado: "a", valor: 4 }] })).toThrow();
    expect(() => datosResolver({ tipo: "trigonometria.resolver", modo: "angulo", lados: [{ lado: "a", valor: 5 }, { lado: "c", valor: 3 }] })).toThrow();
  });

  it("separador decimal por idioma y texto alternativo", () => {
    const es = datosResolver({ tipo: "trigonometria.resolver", modo: "lado", angulo: 35, dado: "c", valor: 12, pedido: "a" }, ",");
    const en = datosResolver({ tipo: "trigonometria.resolver", modo: "lado", angulo: 35, dado: "c", valor: 12, pedido: "a" }, ".");
    expect(es.pasos[5].formulas[0]).toContain("6{,}88");
    expect(en.pasos[5].formulas[0]).toContain("6.88");
    noHayBasura(textoResolver({ tipo: "trigonometria.resolver", modo: "lado", angulo: 35, dado: "c", valor: 12, pedido: "a" }), "resolver");
  });
});

const rad = aRad;

describe("trigonometria.circulo", () => {
  it("el punto dibujado está en (cos θ, sen θ) para todos los múltiplos de 15° de -360° a 720°", () => {
    const angulos: number[] = [];
    for (let g = -360; g <= 720; g += 15) angulos.push(g);
    const pasos = datosCirculo({ angulos });
    expect(pasos).toHaveLength(angulos.length);
    for (const p of pasos) {
      expect((p.punto.x - VISTA_CIRCULO.cx) / VISTA_CIRCULO.radio, `${p.grados}°`).toBeCloseTo(Math.cos(rad(p.grados)), 2);
      expect((VISTA_CIRCULO.cy - p.punto.y) / VISTA_CIRCULO.radio, `${p.grados}°`).toBeCloseTo(Math.sin(rad(p.grados)), 2);
      expect(p.rotacion).toBe(-p.grados);
      expect(p.normalizado).toBeGreaterThanOrEqual(0);
      expect(p.normalizado).toBeLessThan(360);
      // coordenadas con a lo sumo 2 decimales
      for (const n of [p.punto.x, p.punto.y]) expect(Math.abs(n * 100 - Math.round(n * 100))).toBeLessThan(1e-6);
      if (p.arco) expect(p.arco).toMatch(/^M [\d.]+ [\d.]+ A 24 24 0 [01] 0 [\d.]+ [\d.]+$/);
      if (p.cuadrante !== null) expect(p.arcoReferencia).toMatch(/^M /);
      else expect(p.arcoReferencia).toBeNull();
      for (const f of [p.cosTex, p.senTex, p.gradosTex, p.radianesTex]) katex.renderToString(f.replace("\\text{indefinida}", "x"), { throwOnError: true });
    }
  });

  it("los valores exactos coinciden con la tabla curada (30°, 45°, 60° y ejes) y la tangente de 90° es indefinida", () => {
    const [p30, p150, p210, p330, p90, p270] = datosCirculo({ angulos: [30, 150, 210, 330, 90, 270] });
    expect([p30.cosPlano, p30.senPlano, p30.tanPlano]).toEqual(["√3/2", "1/2", "√3/3"]);
    expect([p150.cosPlano, p150.senPlano, p150.tanPlano]).toEqual(["-√3/2", "1/2", "-√3/3"]);
    expect([p210.cosPlano, p210.senPlano, p210.tanPlano]).toEqual(["-√3/2", "-1/2", "√3/3"]);
    expect([p330.cosPlano, p330.senPlano, p330.tanPlano]).toEqual(["√3/2", "-1/2", "-√3/3"]);
    expect(p90.tanPlano).toBe("indefinida");
    expect(p270.tanPlano).toBe("indefinida");
    expect(p150.radianesPlano).toBe("5π/6");
    expect(p330.referencia).toBe(30);
    expect(p210.cuadrante).toBe(3);
    expect(p90.cuadrante).toBeNull();
  });

  it("solo admite múltiplos enteros de 15°", () => {
    expect(() => datosCirculo({ angulos: [10] })).toThrow();
    expect(() => datosCirculo({ angulos: [7.5] })).toThrow();
  });

  it("texto alternativo", () => {
    const t = textoCirculo({ angulos: [30, 150] });
    expect(t).toContain("Ángulo 150° (5π/6 rad): cos = -√3/2, sen = 1/2, tan = -√3/3.");
    noHayBasura(t, "circulo");
  });
});

describe("trigonometria.cuadrantes", () => {
  it("los signos coinciden con los de Math.sin/cos/tan en cada cuadrante y la regla ASTC (Todos, Seno, Tangente, Coseno)", () => {
    for (const referencia of [30, 45, 60] as const) {
      const q = datosCuadrantes({ referencia });
      expect(q.map((x) => x.grados)).toEqual([referencia, 180 - referencia, 180 + referencia, 360 - referencia]);
      for (const c of q) {
        const s = Math.sin(rad(c.grados));
        const co = Math.cos(rad(c.grados));
        expect(c.signo.sen).toBe(s > 0 ? "+" : "-");
        expect(c.signo.cos).toBe(co > 0 ? "+" : "-");
        expect(c.signo.tan).toBe(s / co > 0 ? "+" : "-");
        // exactamente las razones positivas de ese cuadrante
        const positivas = (["sen", "cos", "tan"] as const).filter((f) => c.signo[f] === "+");
        expect(c.positivas).toEqual(positivas.length === 3 ? ["todas"] : positivas);
        expect((c.punto.x - VISTA_CUADRANTES.cx) / VISTA_CUADRANTES.radio).toBeCloseTo(co, 2);
        expect((VISTA_CUADRANTES.cy - c.punto.y) / VISTA_CUADRANTES.radio).toBeCloseTo(s, 2);
      }
      expect(q.map((x) => x.positivas[0])).toEqual(["todas", "sen", "tan", "cos"]);
      // el valor absoluto es el del ángulo de referencia en todos
      const abs = q.map((x) => x.senTex.replace("-", ""));
      expect(abs[0]).toBe(abs[1]);
    }
    noHayBasura(textoCuadrantes({ referencia: 45 }), "cuadrantes");
  });
});

const ONDAS: { nombre: string; v: { onda: OndaJson; base?: OndaJson; rango: [number | [number, number], number | [number, number]]; pasos?: ("curva" | "amplitud" | "periodo" | "desfase" | "vertical" | "puntos" | "asintotas")[] } }[] = [
  { nombre: "sen x", v: { onda: { fn: "sen" }, rango: [0, 2], pasos: ["curva", "amplitud", "periodo", "puntos"] } },
  { nombre: "cos x", v: { onda: { fn: "cos" }, rango: [0, 2], pasos: ["curva", "puntos"] } },
  { nombre: "2 sen x", v: { onda: { fn: "sen", a: 2 }, base: { fn: "sen" }, rango: [0, 2], pasos: ["curva", "amplitud"] } },
  { nombre: "sen 3x", v: { onda: { fn: "sen", b: 3 }, base: { fn: "sen" }, rango: [0, 2], pasos: ["curva", "periodo"] } },
  { nombre: "sen(x/2)", v: { onda: { fn: "sen", b: [1, 2] }, rango: [0, 4], pasos: ["curva", "periodo"] } },
  { nombre: "sen(x − π/3)", v: { onda: { fn: "sen", c: [1, 3] }, base: { fn: "sen" }, rango: [-1, 3], pasos: ["curva", "desfase"] } },
  { nombre: "cos x + 1", v: { onda: { fn: "cos", d: 1 }, base: { fn: "cos" }, rango: [0, 2], pasos: ["curva", "vertical"] } },
  { nombre: "3 sen(2(x − π/4)) − 1", v: { onda: { fn: "sen", a: 3, b: 2, c: [1, 4], d: -1 }, rango: [0, 2], pasos: ["curva", "amplitud", "periodo", "desfase", "vertical", "puntos"] } },
  { nombre: "(1/2) cos x", v: { onda: { fn: "cos", a: [1, 2] }, rango: [-1, 1], pasos: ["curva", "amplitud"] } },
  { nombre: "tan x", v: { onda: { fn: "tan" }, rango: [-1, 1], pasos: ["curva", "asintotas"] } },
  { nombre: "tan 2x", v: { onda: { fn: "tan", b: 2 }, base: { fn: "tan" }, rango: [-1, 1], pasos: ["curva", "periodo", "asintotas"] } },
];

describe("trigonometria.onda", () => {
  it("cada punto clave y cada muestra caen sobre la curva dibujada; la curva es la función (contra valorOnda)", () => {
    for (const { nombre, v } of ONDAS) {
      const d = datosOnda(v);
      const tr = tramos(d.curva);
      expect(tr.length, nombre).toBeGreaterThan(0);
      // x crece dentro de cada tramo y todo está dentro del lienzo
      for (const t of tr) {
        for (let i = 1; i < t.length; i++) expect(t[i].x, nombre).toBeGreaterThanOrEqual(t[i - 1].x);
        for (const p of t) {
          expect(p.x, nombre).toBeGreaterThanOrEqual(VISTA_ONDA.izq - 0.01);
          expect(p.x, nombre).toBeLessThanOrEqual(VISTA_ONDA.ancho - VISTA_ONDA.der + 0.01);
        }
      }
      for (const p of d.puntos) expect(distanciaAPolilinea(p, tr), `${nombre}: punto (${p.x}, ${p.y}) fuera de la curva`).toBeLessThan(0.8);
      noHayBasura(d.textoPlano, nombre);
    }
  });

  it("la escala de los ejes es coherente: amplitud, periodo, desfase y línea media miden lo que dicen (con los ticks como regla)", () => {
    for (const { nombre, v } of ONDAS) {
      const d = datosOnda({ ...v, pasos: ["curva", "amplitud", "periodo", "desfase", "vertical", "puntos", "asintotas"] });
      const o = ondaDeJson(v.onda);
      // px por radián a partir de dos ticks del eje x; px por unidad de y a partir de dos ticks del eje y
      const [x1, x2] = d.ticksX;
      const pxPorPi = (x2.pos - x1.pos) / (aNumero(pasoTick(d.ticksX)) || 1);
      void pxPorPi;
      const anchoRango = aNumero(fracRango(v.rango[1])) - aNumero(fracRango(v.rango[0]));
      const pxPorPiReal = (VISTA_ONDA.ancho - VISTA_ONDA.izq - VISTA_ONDA.der) / anchoRango;
      const t0 = d.ticksX[0];
      // el primer tick es un múltiplo de π/2 (o π) dentro del rango y su posición en px es lineal
      expect(t0.pos, nombre).toBeCloseTo(VISTA_ONDA.izq + (etiquetaAPi(t0.etiqueta) - aNumero(fracRango(v.rango[0]))) * pxPorPiReal, 1);
      // amplitud
      if (d.amplitud) {
        const pxPorY = (d.ticksY[1].pos - d.ticksY[0].pos) / (Number(evalEtiquetaY(d.ticksY[1].etiqueta)) - Number(evalEtiquetaY(d.ticksY[0].etiqueta)));
        expect(Math.abs(d.amplitud.yMedio - d.amplitud.yExtremo), `${nombre} amplitud`).toBeCloseTo(Math.abs(aNumero(amplitud(o)) * pxPorY), 1);
      }
      // periodo: ancho del corchete = periodo en π × px por π
      if (d.periodo && o.fn !== undefined) {
        expect(d.periodo.x1 - d.periodo.x0, `${nombre} periodo`).toBeCloseTo(aNumero(periodoPi(o)) * pxPorPiReal, 1);
      }
      if (d.desfase) expect(d.desfase.x, `${nombre} desfase`).toBeCloseTo(VISTA_ONDA.izq + (aNumero(o.cPi) - aNumero(fracRango(v.rango[0]))) * pxPorPiReal, 1);
      // asíntotas de la tangente: donde el coseno del argumento se anula
      for (const xPx of d.asintotas) {
        const xRad = (aNumero(fracRango(v.rango[0])) + ((xPx - VISTA_ONDA.izq) / pxPorPiReal)) * Math.PI;
        expect(Math.abs(Math.cos(aNumero(o.b) * (xRad - aNumero(o.cPi) * Math.PI))), `${nombre} asíntota`).toBeLessThan(1e-2);
      }
    }
  });

  it("la curva no cruza una asíntota (la tangente se corta) y las etiquetas del eje x no se solapan (≥ 30 px entre marcas)", () => {
    for (const { nombre, v } of ONDAS) {
      const d = datosOnda(v);
      for (let i = 1; i < d.ticksX.length; i++) expect(d.ticksX[i].pos - d.ticksX[i - 1].pos, `${nombre}: marcas x muy juntas`).toBeGreaterThanOrEqual(30);
      for (let i = 1; i < d.ticksY.length; i++) expect(Math.abs(d.ticksY[i].pos - d.ticksY[i - 1].pos), `${nombre}: marcas y muy juntas`).toBeGreaterThanOrEqual(14);
      if (v.onda.fn === "tan") {
        const dd = datosOnda({ ...v, pasos: ["asintotas"] });
        for (const t of tramos(dd.curva)) {
          const xmin = t[0].x;
          const xmax = t[t.length - 1].x;
          for (const a of dd.asintotas) expect(a > xmin + 0.5 && a < xmax - 0.5, `${nombre}: un tramo cruza la asíntota ${a}`).toBe(false);
        }
      }
    }
  });

  it("valida la entrada: JSON de onda y rango", () => {
    expect(esOndaJsonValida({ fn: "sen", a: 2, b: [1, 2], c: [1, 6], d: -1 })).toBe(true);
    expect(esOndaJsonValida({ fn: "sin" })).toBe(false);
    expect(esOndaJsonValida({ fn: "sen", b: 0 })).toBe(false);
    expect(esOndaJsonValida({ fn: "sen", a: 0 })).toBe(false);
    expect(esOndaJsonValida({ fn: "cos", c: [1, 0] })).toBe(false);
    expect(esOndaJsonValida({ fn: "cos", a: "2" })).toBe(false);
    expect(esOndaJsonValida(null)).toBe(false);
    expect(() => datosOnda({ onda: { fn: "sen" }, rango: [2, 0] })).toThrow();
  });

  it("los textos y los valores para los mensajes salen bien (amplitud, periodo, ecuación en LaTeX)", () => {
    const d = datosOnda({ onda: { fn: "sen", a: 2, b: 3, c: [1, 6], d: 1 }, rango: [0, 2], pasos: ["curva"] });
    expect(d.valores.amplitud).toBe("2");
    expect(d.valores.periodo).toBe("2π/3");
    expect(d.valores.medio).toBe("1");
    expect(d.valores.maximo).toBe("3");
    expect(d.valores.minimo).toBe("-1");
    expect(d.valores.desfase).toBe("π/6");
    katex.renderToString(d.valores.ecuacion, { throwOnError: true });
    expect(textoOnda({ onda: { fn: "cos" }, rango: [0, 2] })).toContain("Amplitud 1, periodo 2π");
    void valorOnda;
  });
});

function fracRango(v: number | [number, number]) {
  return Array.isArray(v) ? frac(v[0], v[1]) : frac(v);
}
function pasoTick(ticks: { etiqueta: string }[]) {
  return frac(Math.round((etiquetaAPi(ticks[1].etiqueta) - etiquetaAPi(ticks[0].etiqueta)) * 2), 2);
}
function etiquetaAPi(e: string): number {
  if (e === "0") return 0;
  const m = /^(-?)(\d*)π(?:\/(\d+))?$/.exec(e);
  if (!m) throw new Error(`Etiqueta de eje inesperada: ${e}`);
  return (m[1] === "-" ? -1 : 1) * (m[2] === "" ? 1 : Number(m[2])) / (m[3] ? Number(m[3]) : 1);
}
function evalEtiquetaY(e: string): number {
  const m = /^(-?\d+)\/(\d+)$/.exec(e);
  return m ? Number(m[1]) / Number(m[2]) : Number(e);
}

describe("trigonometria.ley", () => {
  const angulo = (P: { x: number; y: number }, Q: { x: number; y: number }, R: { x: number; y: number }): number =>
    deg(Math.acos(((Q.x - P.x) * (R.x - P.x) + (Q.y - P.y) * (R.y - P.y)) / (Math.hypot(Q.x - P.x, Q.y - P.y) * Math.hypot(R.x - P.x, R.y - P.y))));

  it("seno / coseno / área: el dibujo (en px) tiene los ángulos y las proporciones reales del triángulo", () => {
    const casos = [
      { ley: "seno" as const, datos: { A: 40, B: 65, a: 12 } },
      { ley: "seno" as const, datos: { A: 100, B: 30, a: 9 } },
      { ley: "coseno" as const, datos: { a: 8, b: 11, C: 50 } },
      { ley: "coseno" as const, datos: { a: 15, b: 4, C: 30 } },
      { ley: "area" as const, datos: { a: 10, b: 7, C: 35 } },
      { ley: "area" as const, datos: { a: 6, b: 9, C: 130 } },
    ];
    for (const c of casos) {
      const d = datosLey(c);
      const { A, B, C, t } = d.triangulo;
      expect(angulo(A, B, C), JSON.stringify(c)).toBeCloseTo(t.A, 0);
      expect(angulo(B, A, C), JSON.stringify(c)).toBeCloseTo(t.B, 0);
      expect(angulo(C, A, B), JSON.stringify(c)).toBeCloseTo(t.C, 0);
      // proporciones de los lados
      const px = { c: Math.hypot(A.x - B.x, A.y - B.y), b: Math.hypot(A.x - C.x, A.y - C.y), a: Math.hypot(B.x - C.x, B.y - C.y) };
      expect(px.b / px.c, JSON.stringify(c)).toBeCloseTo(t.b / t.c, 1);
      expect(px.a / px.c, JSON.stringify(c)).toBeCloseTo(t.a / t.c, 1);
      // todo entra en el lienzo
      for (const p of [A, B, C]) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(VISTA_LEY.ancho);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(VISTA_LEY.alto);
      }
      // los resultados
      if (c.ley === "seno") {
        const k = oblicuoAAS(c.datos.A, c.datos.B, c.datos.a);
        expect(d.resultado).toBeCloseTo(redondear(k.b, 2), 9);
        expect(k.a / Math.sin(rad(k.A))).toBeCloseTo(k.b / Math.sin(rad(k.B)), 9);
      } else if (c.ley === "coseno") {
        const k = oblicuoSAS(c.datos.a, c.datos.b, c.datos.C);
        expect(d.resultado).toBeCloseTo(redondear(k.c, 2), 9);
      } else {
        // área: ½·b·h con h = distancia real del vértice B a la recta AC (geometría de coordenadas, no a·sen C)
        const k = oblicuoSAS(c.datos.a, c.datos.b, c.datos.C);
        const Bp = { x: k.c, y: 0 };
        const Cp = { x: k.b * Math.cos(rad(k.A)), y: k.b * Math.sin(rad(k.A)) };
        const h = Math.abs(Cp.x * Bp.y - Cp.y * Bp.x) / Math.hypot(Cp.x, Cp.y); // distancia de B a la recta por A y C
        expect(d.resultado).toBeCloseTo(redondear(0.5 * k.b * h, 2), 9);
        expect(d.altura!.valor).toBeCloseTo(h, 9);
        // la altura dibujada es perpendicular a AC: (desde - hasta) · (C - A) ≈ 0
        const vAltura = { x: d.altura!.desde.x - d.altura!.hasta.x, y: d.altura!.desde.y - d.altura!.hasta.y };
        const vBase = { x: C.x - A.x, y: C.y - A.y };
        expect(Math.abs(vAltura.x * vBase.x + vAltura.y * vBase.y) / (Math.hypot(vAltura.x, vAltura.y) * Math.hypot(vBase.x, vBase.y) || 1)).toBeLessThan(0.02);
        expect(Math.hypot(vAltura.x, vAltura.y) / px.b).toBeCloseTo(h / k.b, 1);
      }
      for (const p of d.pasos) for (const f of p.formulas) katex.renderToString(f, { throwOnError: true });
      noHayBasura(d.textoPlano, JSON.stringify(c));
      expect(d.triangulo.arcos.A).toMatch(/^M /);
    }
  });

  it("ambiguo: cuenta 0, 1 o 2 triángulos igual que la geometría de coordenadas y dibuja B sobre la base a distancia a de C", () => {
    const vistos = new Set<number>();
    for (const [a, b, A] of [[4, 10, 30], [5, 10, 30], [7, 10, 30], [12, 10, 30], [9, 8, 110], [6, 8, 110], [8, 12, 40], [9, 12, 40]] as [number, number, number][]) {
      const d = datosLey({ ley: "ambiguo", datos: { a, b, A } });
      expect(d.cantidad, `a=${a} b=${b} A=${A}`).toBe(cantidadSSA(a, b, A));
      vistos.add(d.cantidad);
      expect(d.segundo !== null).toBe(d.cantidad === 2);
      // escala px/unidad a partir de b: |A C| en px / b
      const escala = Math.hypot(d.triangulo.C.x - d.triangulo.A.x, d.triangulo.C.y - d.triangulo.A.y) / b;
      const tris = [d.triangulo, ...(d.segundo ? [d.segundo] : [])];
      if (d.cantidad > 0) {
        for (const t of tris) {
          expect(Math.hypot(t.B.x - t.C.x, t.B.y - t.C.y) / escala, `a=${a} b=${b} A=${A}`).toBeCloseTo(a, 0);
          expect(t.B.y, "B sobre la base").toBeCloseTo(d.triangulo.A.y, 1);
        }
      }
      if (d.cantidad === 2) expect(Math.abs(d.triangulo.B.x - d.segundo!.B.x)).toBeGreaterThan(5);
      expect(d.altura!.valor).toBeCloseTo(b * Math.sin(rad(A)), 9);
      expect(d.arcoCircunferencia).toMatch(/^M /);
      // El arco de la circunferencia de radio a con centro en C: su radio es a en px, y los B (si existen) caen DENTRO de su tramo angular
      // (bug real del primer dibujo: el arco salía en otro lugar de la pantalla).
      const m = /^M (\S+) (\S+) A (\S+) \S+ 0 [01] 0 (\S+) (\S+)$/.exec(d.arcoCircunferencia!)!;
      const C = d.triangulo.C;
      expect(Number(m[3]), `a=${a} b=${b} A=${A}`).toBeCloseTo(a * escala, 0);
      const angulo = (x: number, y: number): number => (Math.atan2(-(y - C.y), x - C.x) * 180) / Math.PI;
      expect(Math.hypot(Number(m[1]) - C.x, Number(m[2]) - C.y)).toBeCloseTo(a * escala, 0);
      expect(Math.hypot(Number(m[4]) - C.x, Number(m[5]) - C.y)).toBeCloseTo(a * escala, 0);
      const desde = angulo(Number(m[1]), Number(m[2]));
      const hasta = angulo(Number(m[4]), Number(m[5]));
      for (const t of tris) {
        if (d.cantidad === 0) break;
        const ang = angulo(t.B.x, t.B.y);
        const dentro = ((ang - desde + 720) % 360) <= ((hasta - desde + 720) % 360) + 1e-6;
        expect(dentro, `a=${a} b=${b} A=${A}: B fuera del arco`).toBe(true);
      }
      for (const p of d.pasos) for (const f of p.formulas) katex.renderToString(f, { throwOnError: true });
      noHayBasura(d.textoPlano, `a=${a} b=${b} A=${A}`);
    }
    expect([...vistos].sort()).toEqual([0, 1, 2]);
  });

  it("datos que faltan o inválidos se rechazan", () => {
    expect(() => datosLey({ ley: "seno", datos: { A: 40, a: 12 } })).toThrow();
    expect(() => datosLey({ ley: "coseno", datos: { a: 8, b: 11 } })).toThrow();
    expect(() => datosLey({ ley: "area", datos: { a: 8, b: 11, C: 180 } })).toThrow();
    expect(() => datosLey({ ley: "ambiguo", datos: { a: 8, b: 11 } })).toThrow();
  });
});

describe("trigonometria.ecuacion", () => {
  it("las soluciones de fn(x) = fn(g°) en [0°, 360°) coinciden con la búsqueda numérica con Math.* y con arcsen/arccos/arctan", () => {
    let comprobadas = 0;
    for (const fn of ["sen", "cos", "tan"] as const) {
      for (let g = 0; g < 360; g += 15) {
        if (fn === "tan" && (g === 90 || g === 270)) {
          expect(() => solucionesEcuacion(fn, g)).toThrow();
          continue;
        }
        const soluciones = solucionesEcuacion(fn, g);
        const f = (x: number) => (fn === "sen" ? Math.sin(rad(x)) : fn === "cos" ? Math.cos(rad(x)) : Math.tan(rad(x)));
        // búsqueda independiente: en una malla de 5° todo x con el mismo valor
        const numericas: number[] = [];
        for (let x = 0; x < 360; x += 15) if (!(fn === "tan" && (x === 90 || x === 270)) && Math.abs(f(x) - f(g)) < 1e-9) numericas.push(x);
        expect(soluciones, `${fn} x = ${fn} ${g}°`).toEqual(numericas);
        // fórmula analítica: sen: x y 180 − x; cos: x y 360 − x; tan: x y x + 180
        const candidatas = fn === "sen" ? [g, 180 - g] : fn === "cos" ? [g, 360 - g] : [g, g + 180];
        const esperado = [...new Set(candidatas.map((x) => ((x % 360) + 360) % 360))].sort((p, q) => p - q);
        expect(soluciones, `${fn} ${g}° (fórmula)`).toEqual(esperado);
        for (const s of soluciones) expect(f(s)).toBeCloseTo(f(g), 9);
        comprobadas++;
      }
    }
    expect(comprobadas).toBeGreaterThan(60);
  });

  it("los cortes de la gráfica y los puntos del círculo son las soluciones, sobre la curva y sobre la circunferencia", () => {
    for (const [fn, g] of [["sen", 30], ["sen", 150], ["cos", 60], ["cos", 135], ["tan", 45], ["tan", 240], ["sen", 90], ["cos", 180]] as const) {
      const d = datosEcuacion({ fn, gradosValor: g });
      const tr = tramos(d.curva);
      expect(d.cortes.length).toBe(d.soluciones.length);
      for (const c of d.cortes) {
        expect(distanciaAPolilinea(c, tr), `${fn} ${g}°`).toBeLessThan(1.6);
        expect(c.y).toBeCloseTo(d.rectaY, 1);
      }
      for (const p of d.puntosCirculo) {
        expect(Math.hypot(p.x - VISTA_ECUACION_CIRCULO.cx, p.y - VISTA_ECUACION_CIRCULO.cy), `${fn} ${g}°`).toBeCloseTo(VISTA_ECUACION_CIRCULO.radio, 1);
      }
      // cada punto del círculo satisface la ecuación (con la función de Math)
      d.soluciones.forEach((s, i) => {
        const px = (d.puntosCirculo[i].x - VISTA_ECUACION_CIRCULO.cx) / VISTA_ECUACION_CIRCULO.radio;
        const py = (VISTA_ECUACION_CIRCULO.cy - d.puntosCirculo[i].y) / VISTA_ECUACION_CIRCULO.radio;
        const valor = fn === "sen" ? py : fn === "cos" ? px : py / px;
        expect(valor).toBeCloseTo(d.valorNumerico, 1);
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThan(360);
      });
      expect(d.solucionesPiPlano.length).toBe(d.soluciones.length);
      for (const f of [...d.solucionesPiTex, d.valorTex]) katex.renderToString(f, { throwOnError: true });
      noHayBasura(d.textoPlano, `${fn} ${g}`);
      // las marcas del eje x no se solapan
      for (let i = 1; i < d.ticksX.length; i++) expect(d.ticksX[i].pos - d.ticksX[i - 1].pos).toBeGreaterThanOrEqual(30);
      expect(VISTA_ECUACION.ancho).toBeGreaterThan(0);
    }
    expect(() => datosEcuacion({ fn: "tan", gradosValor: 90 })).toThrow();
  });

  it("el texto dice la cantidad de soluciones y sus valores en π", () => {
    expect(datosEcuacion({ fn: "sen", gradosValor: 30 }).textoPlano).toContain("2 soluciones: x = π/6 y x = 5π/6");
    expect(datosEcuacion({ fn: "sen", gradosValor: 90 }).textoPlano).toContain("una solución: x = π/2");
  });
});

describe("trigonometria.identidad", () => {
  it("el triángulo inscripto tiene hipotenusa 1 (el radio) y catetos cos θ y sen θ; la identidad y sus derivadas se cumplen de forma EXACTA", () => {
    for (const g of [15, 30, 45, 60, 75]) {
      const d = datosIdentidad({ angulo: g, forma: "derivadas" });
      expect(d.cumple, `${g}°`).toBe(true);
      expect(Math.hypot(d.punto.x - d.origen.x, d.punto.y - d.origen.y)).toBeCloseTo(VISTA_IDENTIDAD.radio, 1);
      expect((d.pie.x - d.origen.x) / VISTA_IDENTIDAD.radio).toBeCloseTo(Math.cos(rad(g)), 2);
      expect((d.origen.y - d.punto.y) / VISTA_IDENTIDAD.radio).toBeCloseTo(Math.sin(rad(g)), 2);
      // numéricamente, con las dos fórmulas del texto
      expect(Math.sin(rad(g)) ** 2 + Math.cos(rad(g)) ** 2).toBeCloseTo(1, 12);
      expect(1 + Math.tan(rad(g)) ** 2).toBeCloseTo(1 / Math.cos(rad(g)) ** 2, 9);
      expect(1 + 1 / Math.tan(rad(g)) ** 2).toBeCloseTo(1 / Math.sin(rad(g)) ** 2, 9);
      for (const f of [d.pitagorica.general, d.pitagorica.conNumeros, d.pitagorica.suma, d.tangente!.general, d.tangente!.conNumeros, d.cotangente!.general, d.cotangente!.conNumeros]) katex.renderToString(f, { throwOnError: true });
      expect(d.pitagorica.suma).toBe("1");
      noHayBasura(d.textoPlano, `${g}°`);
    }
    const d30 = datosIdentidad({ angulo: 30, forma: "pitagorica" });
    expect(d30.pitagorica.conNumeros).toBe("\\left(\\frac{1}{2}\\right)^{2}+\\left(\\frac{\\sqrt{3}}{2}\\right)^{2}=\\frac{1}{4}+\\frac{3}{4}");
    expect(d30.tangente).toBeNull();
    const d45 = datosIdentidad({ angulo: 45, forma: "derivadas" });
    expect(d45.tangente!.conNumeros).toBe("1+\\left(1\\right)^{2}=2=\\left(\\sqrt{2}\\right)^{2}");
    expect(() => datosIdentidad({ angulo: 90 })).toThrow();
    expect(() => datosIdentidad({ angulo: 0 })).toThrow();
  });
});

describe("los valores exactos usados en los textos son los de la tabla", () => {
  it("planoE de sen/cos/tan de 30, 45 y 60", () => {
    expect([senExacto(30), cosExacto(30), tanExacto(30)!].map(planoE)).toEqual(["1/2", "√3/2", "√3/3"]);
    expect([senExacto(45), cosExacto(45), tanExacto(45)!].map(planoE)).toEqual(["√2/2", "√2/2", "1"]);
    expect([senExacto(60), cosExacto(60), tanExacto(60)!].map(planoE)).toEqual(["√3/2", "1/2", "√3"]);
  });
});
