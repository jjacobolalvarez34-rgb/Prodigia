import { describe, it, expect } from "vitest";
import {
  claveEstadistica,
  conRngSembrado,
  conjuntosYConRExacto,
  generarProblemaEstadistica,
  MODOS_ESTADISTICA,
  NOMBRE_MODO_ESTADISTICA,
  preguntaEstadistica,
  type ModoEstadistica,
  type ProblemaEstadistica,
  type ProblemaEstadisticaNumero,
} from "./estadistica";
import { mulberry32 } from "@/lib/rng";

// Verificación "recalculada por método independiente" del mundo
// Estadística. NO se reutiliza ninguna función del generador:
//  - Los datos se RE-PARSEAN del enunciado (siempre entre llaves).
//  - Toda la aritmética se hace con fracciones exactas (BigInt), no con
//    coma flotante: media, varianza (por la identidad E[x²] − μ², distinta
//    de Σ(x−μ)²/n del generador), cuartiles (índices de mitad distintos),
//    percentil (búsqueda lineal de la posición), regresión (fórmula
//    completa Sxy/Sxx), combinatoria (Pascal / producto) y las
//    probabilidades por ENUMERACIÓN de todos los casos posibles.
//  - La regla empírica se contrasta con la normal real (erf).
// Por cada modo y cada nivel 1-10 se hacen PULLS pulls: cero diferencias.

const PULLS = 200;

// ---------- Fracciones exactas ----------

const B0 = BigInt(0);
const B1 = BigInt(1);
const B10 = BigInt(10);

type Q = { n: bigint; d: bigint };

function mcdB(a: bigint, b: bigint): bigint {
  a = a < B0 ? -a : a;
  b = b < B0 ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a || B1;
}
function q(n: bigint | number, d: bigint | number = B1): Q {
  let nn = BigInt(n);
  let dd = BigInt(d);
  if (dd < B0) {
    nn = -nn;
    dd = -dd;
  }
  const g = mcdB(nn, dd);
  return { n: nn / g, d: dd / g };
}
const add = (a: Q, b: Q) => q(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a: Q, b: Q) => q(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a: Q, b: Q) => q(a.n * b.n, a.d * b.d);
const div = (a: Q, b: Q) => q(a.n * b.d, a.d * b.n);
const cmp = (a: Q, b: Q) => {
  const l = a.n * b.d;
  const r = b.n * a.d;
  return l < r ? -1 : l > r ? 1 : 0;
};
const toNum = (a: Q) => Number(a.n) / Number(a.d);
const ZERO = q(0);

function qDe(s: string): Q {
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(s.trim());
  if (!m) throw new Error(`número inválido: "${s}"`);
  const dec = m[3] ?? "";
  const n = BigInt(m[2] + dec) * (m[1] ? -B1 : B1);
  let den = B1;
  for (let i = 0; i < dec.length; i++) den *= B10;
  return q(n, den);
}

function sumaQ(xs: Q[]): Q {
  return xs.reduce(add, ZERO);
}
function ordenQ(xs: Q[]): Q[] {
  // Inserción (no reutiliza Array.sort del generador).
  const out: Q[] = [];
  for (const x of xs) {
    let i = out.length;
    while (i > 0 && cmp(out[i - 1], x) > 0) i--;
    out.splice(i, 0, x);
  }
  return out;
}
function mediaQ(xs: Q[]): Q {
  return div(sumaQ(xs), q(xs.length));
}
function medianaQ(xs: Q[]): Q {
  const s = ordenQ(xs);
  const n = s.length;
  return n % 2 === 1 ? s[(n - 1) / 2] : div(add(s[n / 2 - 1], s[n / 2]), q(2));
}
// Q1/Q3: mitad inferior = índices [0, ⌊n/2⌋), mitad superior = [⌈n/2⌉, n).
function cuartilesQ(xs: Q[]): { q1: Q; q3: Q } {
  const s = ordenQ(xs);
  const n = s.length;
  return { q1: medianaQ(s.slice(0, Math.floor(n / 2))), q3: medianaQ(s.slice(Math.ceil(n / 2))) };
}
// Varianza por la identidad E[x²] − μ² (poblacional) / con n−1 (muestral).
function varianzaPobQ(xs: Q[]): Q {
  const n = q(xs.length);
  const ex2 = div(sumaQ(xs.map((x) => mul(x, x))), n);
  const mu = mediaQ(xs);
  return sub(ex2, mul(mu, mu));
}
function varianzaMuestralQ(xs: Q[]): Q {
  const n = xs.length;
  return div(mul(varianzaPobQ(xs), q(n)), q(n - 1));
}

// ---------- Parseo del enunciado ----------

function grupos(enunciado: string): Q[][] {
  const out: Q[][] = [];
  for (const m of enunciado.matchAll(/\{([^}]*)\}/g)) out.push(m[1].split(",").map((s) => qDe(s)));
  return out;
}
function enteros(enunciado: string): number[] {
  return [...enunciado.matchAll(/\d+/g)].map((m) => Number(m[0]));
}
function numeroDeRespuesta(r: string): number {
  return Number(r.replace("%", ""));
}

// ---------- Comparación de respuestas numéricas ----------

function verificarNumerica(p: ProblemaEstadisticaNumero, esperado: Q | number, ctx: string) {
  const e = typeof esperado === "number" ? esperado : toNum(esperado);
  const redondea = /Redondea a 2 decimales/.test(p.enunciado);
  const dif = Math.abs(p.respuesta - e);
  if (redondea) {
    expect(dif, `${ctx}: respuesta ${p.respuesta} vs exacto ${e}`).toBeLessThanOrEqual(0.005 + 1e-9);
    expect(p.tolerancia, ctx).toBe(0.01);
    expect(Math.abs(Math.round(p.respuesta * 100) - p.respuesta * 100), ctx).toBeLessThan(1e-7);
  } else {
    expect(dif, `${ctx}: respuesta ${p.respuesta} vs exacto ${e}`).toBeLessThan(1e-9);
    expect(p.tolerancia, ctx).toBe(Number.isInteger(p.respuesta) ? 0 : 0.005);
  }
}

// Mismo comparador que el SprintRunner: numérico, nunca por string.
function aceptada(p: ProblemaEstadisticaNumero, texto: string): boolean {
  return Math.abs(Number(texto) - p.respuesta) <= p.tolerancia + 1e-9;
}

// ---------- Enumeración de probabilidades ----------

const SG: Record<string, string> = { roja: "rojas", azul: "azules", verde: "verdes", amarilla: "amarillas", blanca: "blancas", negra: "negras" };
const RE_COLOR = "rojas|azules|verdes|amarillas|blancas|negras";

function parsearBolsa(enunciado: string): string[] {
  const frase = /Una bolsa tiene ([^.]*)\./.exec(enunciado)![1];
  const bolas: string[] = [];
  for (const m of frase.matchAll(new RegExp(`(\\d+) (?:bolas )?(${RE_COLOR})`, "g"))) {
    for (let i = 0; i < Number(m[1]); i++) bolas.push(m[2]);
  }
  return bolas;
}
function fraccionDeOpcion(s: string): Q {
  if (s.includes("/")) {
    const [a, b] = s.split("/");
    return q(BigInt(a), BigInt(b));
  }
  return q(BigInt(s));
}
function contar<T>(xs: T[], f: (x: T) => boolean): number {
  return xs.filter(f).length;
}

const PRED_DADO: Record<string, (x: number) => boolean> = {
  "un número par": (x) => x % 2 === 0,
  "un número impar": (x) => x % 2 === 1,
  "un número primo": (x) => x > 1 && Array.from({ length: x - 2 }, (_, i) => i + 2).every((d) => x % d !== 0),
  "un múltiplo de 3": (x) => x % 3 === 0,
  "un número mayor que 4": (x) => x > 4,
  "un número menor que 4": (x) => x < 4,
};

function esperadoProbabilidad(p: ProblemaEstadistica): Q {
  const e = p.enunciado;
  const tipo = p.detalle.tipo;
  if (tipo === "prob_dado") {
    const caras = Number(/dado justo de (\d+) caras/.exec(e)![1]);
    const txt = /obtener (un [^?]*)\?/.exec(e)![1];
    const f = PRED_DADO[txt];
    expect(f, `predicado desconocido: ${txt}`).toBeDefined();
    let fav = 0;
    for (let x = 1; x <= caras; x++) if (f(x)) fav++;
    return q(fav, caras);
  }
  if (tipo === "prob_condicional_tabla") {
    const [N, ab, anb, nab, nanb] = enteros(e.split(".")[0] + "."); // solo la primera oración con la tabla
    const gente: Array<{ a: boolean; b: boolean }> = [
      ...Array.from({ length: ab }, () => ({ a: true, b: true })),
      ...Array.from({ length: anb }, () => ({ a: true, b: false })),
      ...Array.from({ length: nab }, () => ({ a: false, b: true })),
      ...Array.from({ length: nanb }, () => ({ a: false, b: false })),
    ];
    expect(gente.length).toBe(N);
    if (p.detalle.params?.dadoA === 1) return q(contar(gente, (g) => g.a && g.b), contar(gente, (g) => g.a));
    return q(contar(gente, (g) => g.a && g.b), contar(gente, (g) => g.b));
  }
  const bolas = parsearBolsa(e);
  const T = bolas.length;
  const colorSg = (nombre: string) => SG[nombre];
  if (tipo === "prob_simple") {
    const c = colorSg(/sea (\w+)\?/.exec(e)![1]);
    return q(contar(bolas, (b) => b === c), T);
  }
  if (tipo === "prob_complemento") {
    const c = colorSg(/NO sea (\w+)\?/.exec(e)![1]);
    return q(contar(bolas, (b) => b !== c), T);
  }
  if (tipo === "prob_independientes") {
    const m = /la primera sea (\w+) y la segunda sea (\w+)\?/.exec(e)!;
    const c1 = colorSg(m[1]);
    const c2 = colorSg(m[2]);
    let fav = 0;
    for (const a of bolas) for (const b of bolas) if (a === c1 && b === c2) fav++;
    return q(fav, T * T);
  }
  if (tipo === "prob_sin_reposicion") {
    const ordenados: Array<[string, string]> = [];
    for (let i = 0; i < T; i++) for (let j = 0; j < T; j++) if (i !== j) ordenados.push([bolas[i], bolas[j]]);
    let m = /ambas sean (\w+)\?/.exec(e);
    if (m) return q(contar(ordenados, ([a, b]) => a === m![1] && b === m![1]), ordenados.length);
    m = /Si la primera fue (\w+), .* también sea (\w+)\?/.exec(e);
    if (m) {
      const c = colorSg(m[1]);
      const primeraC = ordenados.filter(([a]) => a === c);
      return q(contar(primeraC, ([, b]) => b === c), primeraC.length);
    }
    m = /la primera sea (\w+) y la segunda (\w+)\?/.exec(e)!;
    return q(contar(ordenados, ([a, b]) => a === colorSg(m![1]) && b === colorSg(m![2])), ordenados.length);
  }
  if (tipo === "prob_combinatoria") {
    const pares: Array<[string, string]> = [];
    for (let i = 0; i < T; i++) for (let j = i + 1; j < T; j++) pares.push([bolas[i], bolas[j]]);
    let m = /las dos sean (\w+)\?/.exec(e);
    if (m) return q(contar(pares, ([a, b]) => a === m![1] && b === m![1]), pares.length);
    m = /una sea (\w+) y la otra (\w+)\?/.exec(e)!;
    const c1 = colorSg(m[1]);
    const c2 = colorSg(m[2]);
    return q(contar(pares, ([a, b]) => (a === c1 && b === c2) || (a === c2 && b === c1)), pares.length);
  }
  throw new Error(`tipo de probabilidad sin verificador: ${tipo}`);
}

// ---------- Combinatoria independiente ----------

function pascal(n: number, r: number): number {
  const fila: number[][] = [[1]];
  for (let i = 1; i <= n; i++) {
    fila[i] = [1];
    for (let j = 1; j < i; j++) fila[i][j] = fila[i - 1][j - 1] + fila[i - 1][j];
    fila[i][i] = 1;
  }
  return fila[n][r];
}
function productoDescendente(n: number, r: number): number {
  let v = 1;
  for (let i = 0; i < r; i++) v *= n - i;
  return v;
}

// ---------- Normal real (erf, Abramowitz-Stegun 7.1.26) ----------

function erf(x: number): number {
  const s = Math.sign(x);
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
}

// ---------- Regresión (fórmula completa) ----------

function regresion(xs: Q[], ys: Q[]) {
  const mx = mediaQ(xs);
  const my = mediaQ(ys);
  const sxy = sumaQ(xs.map((x, i) => mul(sub(x, mx), sub(ys[i], my))));
  const sxx = sumaQ(xs.map((x) => mul(sub(x, mx), sub(x, mx))));
  const syy = sumaQ(ys.map((y) => mul(sub(y, my), sub(y, my))));
  const b = div(sxy, sxx);
  const a = sub(my, mul(b, mx));
  return { sxy, sxx, syy, a, b, mx, my };
}

// ---------- Verificador por problema ----------

function verificar(p: ProblemaEstadistica, ctx: string) {
  const e = p.enunciado;
  const tipo = p.detalle.tipo;
  const g = grupos(e);
  const pr = p.detalle.params ?? {};
  if (p.entrada !== "numero") throw new Error("verificar() solo para numéricos");

  switch (tipo) {
    case "media":
      return verificarNumerica(p, mediaQ(g[0]), ctx);
    case "mediana":
      return verificarNumerica(p, medianaQ(g[0]), ctx);
    case "moda": {
      const conteo = new Map<string, number>();
      for (const x of g[0]) conteo.set(`${x.n}/${x.d}`, (conteo.get(`${x.n}/${x.d}`) ?? 0) + 1);
      const max = Math.max(...conteo.values());
      const modas = [...conteo.entries()].filter(([, c]) => c === max);
      expect(modas.length, `${ctx}: moda no única`).toBe(1);
      return verificarNumerica(p, toNum(fraccionDeOpcion(modas[0][0])), ctx);
    }
    case "rango": {
      const s = ordenQ(g[0]);
      return verificarNumerica(p, sub(s[s.length - 1], s[0]), ctx);
    }
    case "media_frecuencias": {
      const [v, f] = g;
      const total = sumaQ(f);
      const s = sumaQ(v.map((x, i) => mul(x, f[i])));
      return verificarNumerica(p, div(s, total), ctx);
    }
    case "dato_faltante": {
      const m = /La media de (\d+) datos es (\d+)/.exec(e)!;
      const total = q(Number(m[1])).n * q(Number(m[2])).n;
      const faltante = sub(q(total), sumaQ(g[0]));
      expect(g[0].length + 1).toBe(Number(m[1]));
      return verificarNumerica(p, faltante, ctx);
    }
    case "iqr": {
      const { q1, q3 } = cuartilesQ(g[0]);
      expect(cmp(q3, q1), ctx).toBeGreaterThan(0);
      return verificarNumerica(p, sub(q3, q1), ctx);
    }
    case "varianza_poblacional":
      return verificarNumerica(p, varianzaPobQ(g[0]), ctx);
    case "varianza_muestral":
      return verificarNumerica(p, varianzaMuestralQ(g[0]), ctx);
    case "desvio_poblacional":
      return verificarNumerica(p, Math.sqrt(toNum(varianzaPobQ(g[0]))), ctx);
    case "desvio_muestral":
      return verificarNumerica(p, Math.sqrt(toNum(varianzaMuestralQ(g[0]))), ctx);
    case "transformacion_varianza":
    case "transformacion_desvio": {
      const datos = g[0];
      const v0 = varianzaPobQ(datos);
      // El enunciado afirma varianza y desvío del conjunto original: comprobarlos.
      const vTxt = Number(/varianza poblacional (\d+)/.exec(e)![1]);
      const sTxt = Number(/desvío estándar poblacional (\d+)/.exec(e)![1]);
      expect(toNum(v0), `${ctx}: varianza declarada`).toBe(vTxt);
      expect(sTxt * sTxt, `${ctx}: desvío declarado`).toBe(vTxt);
      const valor = q(Number(pr.valor));
      expect(e.includes(String(pr.valor))).toBe(true);
      const nuevos = datos.map((x) => (pr.op === "suma" ? add(x, valor) : mul(x, valor)));
      const v1 = varianzaPobQ(nuevos);
      return verificarNumerica(p, tipo === "transformacion_varianza" ? toNum(v1) : Math.sqrt(toNum(v1)), ctx);
    }
    case "factorial": {
      const n = Number(/Calcula (\d+)!/.exec(e)![1]);
      return verificarNumerica(p, productoDescendente(n, n), ctx);
    }
    case "permutaciones": {
      const n = Number(pr.n);
      const r = Number(pr.r);
      expect(enteros(e)).toEqual(expect.arrayContaining([n, r]));
      return verificarNumerica(p, productoDescendente(n, r), ctx);
    }
    case "combinaciones": {
      const n = Number(pr.n);
      const r = Number(pr.r);
      expect(enteros(e)).toEqual(expect.arrayContaining([n, r]));
      return verificarNumerica(p, pascal(n, r), ctx);
    }
    case "percentil": {
      const n = Number(pr.n);
      const pp = Number(pr.p);
      expect(g[0].length).toBe(n);
      expect(e).toContain(`percentil ${pp} de`);
      const s = ordenQ(g[0]);
      let pos = 1;
      while (pos * 100 < pp * n) pos++; // menor posición con pos ≥ P·N/100
      return verificarNumerica(p, s[pos - 1], ctx);
    }
    case "rango_percentil": {
      const x = qDe(String(pr.x));
      const n = Number(pr.n);
      expect(g[0].length).toBe(n);
      const menores = g[0].filter((d) => cmp(d, x) <= 0).length;
      return verificarNumerica(p, div(q(menores * 100), q(n)), ctx);
    }
    case "z_score": {
      const [mu, sigma, x] = [Number(pr.mu), Number(pr.sigma), Number(pr.x)];
      expect(enteros(e)).toEqual(expect.arrayContaining([mu, sigma, x]));
      return verificarNumerica(p, div(q(x - mu), q(sigma)), ctx);
    }
    case "z_inverso": {
      const mu = q(Number(pr.mu));
      const sigma = q(Number(pr.sigma));
      const z = qDe(String(pr.z));
      expect(e).toContain(`z = ${pr.z}`);
      return verificarNumerica(p, add(mu, mul(z, sigma)), ctx);
    }
    case "atipicos_cantidad":
    case "atipicos_valor":
    case "atipicos_cerca": {
      const datos = g[0];
      const { q1, q3 } = cuartilesQ(datos);
      const iqr = sub(q3, q1);
      const k = q(3, 2);
      const inf = sub(q1, mul(k, iqr));
      const sup = add(q3, mul(k, iqr));
      expect(datos.some((x) => cmp(x, inf) === 0 || cmp(x, sup) === 0), `${ctx}: dato justo en la cerca`).toBe(false);
      const fuera = datos.filter((x) => cmp(x, inf) < 0 || cmp(x, sup) > 0);
      if (tipo === "atipicos_cantidad") return verificarNumerica(p, fuera.length, ctx);
      if (tipo === "atipicos_valor") {
        expect(fuera.length, ctx).toBe(1);
        return verificarNumerica(p, fuera[0], ctx);
      }
      return verificarNumerica(p, pr.lado === "superior" ? sup : inf, ctx);
    }
    case "regresion_pendiente":
      return verificarNumerica(p, regresion(g[0], g[1]).b, ctx);
    case "regresion_intercepto":
      return verificarNumerica(p, regresion(g[0], g[1]).a, ctx);
    case "regresion_prediccion": {
      const r = regresion(g[0], g[1]);
      return verificarNumerica(p, add(r.a, mul(r.b, q(Number(pr.xNuevo)))), ctx);
    }
    case "correlacion_r": {
      const r = regresion(g[0], g[1]);
      expect(g[0].length).toBe(5);
      const rr = toNum(r.sxy) / Math.sqrt(toNum(r.sxx) * toNum(r.syy));
      return verificarNumerica(p, rr, ctx);
    }
    default:
      break;
  }
  if (tipo.startsWith("grafico") || tipo.startsWith("histograma") || tipo.startsWith("boxplot") || tipo.startsWith("engano")) {
    return verificarGraficoNumerico(p, ctx);
  }
  throw new Error(`${ctx}: tipo numérico sin verificador: ${tipo}`);
}

function verificarOpciones(p: ProblemaEstadistica, ctx: string) {
  if (p.entrada !== "opciones") throw new Error("solo opciones");
  const tipo = p.detalle.tipo;
  const e = p.enunciado;
  const pr = p.detalle.params ?? {};
  if (tipo.startsWith("prob_")) {
    const esperado = esperadoProbabilidad(p);
    expect(cmp(fraccionDeOpcion(p.respuesta), esperado), `${ctx}: ${p.respuesta} vs ${esperado.n}/${esperado.d}\n${e}`).toBe(0);
    // Todas las opciones: fracción reducida, valor en (0,1), distintas en VALOR.
    const valores = p.opciones.map((o) => {
      const f = fraccionDeOpcion(o);
      expect(`${f.n}${f.d === B1 ? "" : "/" + f.d}`, `${ctx}: opción no reducida ${o}`).toBe(o);
      expect(cmp(f, ZERO)).toBeGreaterThan(0);
      expect(cmp(f, q(1))).toBeLessThan(0);
      return `${f.n}/${f.d}`;
    });
    expect(new Set(valores).size, `${ctx}: opciones repetidas en valor`).toBe(p.opciones.length);
    expect(p.opciones.length, ctx).toBeGreaterThanOrEqual(4);
    return;
  }
  if (tipo === "z_comparar") {
    const m = /Matemática \(μ = (\d+), σ = (\d+)\) un estudiante sacó (\d+); en Lengua \(μ = (\d+), σ = (\d+)\) sacó (\d+)/.exec(e)!;
    const z1 = div(q(Number(m[3]) - Number(m[1])), q(Number(m[2])));
    const z2 = div(q(Number(m[6]) - Number(m[4])), q(Number(m[5])));
    expect(cmp(z1, z2)).not.toBe(0);
    expect(p.respuesta).toBe(cmp(z1, z2) > 0 ? "Matemática" : "Lengua");
    return;
  }
  if (tipo === "regla_empirica") {
    const mu = Number(pr.mu);
    const sigma = Number(pr.sigma);
    const k = Number(pr.k);
    const m = /(?:entre (\d+) y (\d+)|mayor que (\d+)|menor que (\d+))\?$/.exec(e)!;
    let exacto: number;
    if (m[1] !== undefined) {
      expect([Number(m[1]), Number(m[2])]).toEqual([mu - k * sigma, mu + k * sigma]);
      exacto = 100 * erf(k / Math.SQRT2);
    } else {
      expect(Number(m[3] ?? m[4])).toBe(m[3] !== undefined ? mu + k * sigma : mu - k * sigma);
      exacto = (100 * (1 - erf(k / Math.SQRT2))) / 2;
    }
    expect(Math.abs(numeroDeRespuesta(p.respuesta) - exacto), `${ctx}: regla empírica vs normal real`).toBeLessThanOrEqual(0.5);
    return;
  }
  if (tipo === "correlacion_signo") {
    const g = grupos(e);
    const { sxy } = regresion(g[0], g[1]);
    const s = cmp(sxy, ZERO);
    expect(p.respuesta).toBe(s > 0 ? "Positiva" : s < 0 ? "Negativa" : "Cero (no hay relación lineal)");
    return;
  }
  return verificarGraficoOpciones(p, ctx);
}

// ---------- Gráficos ----------

const CATS_RE = /«([^»]+)»/g;

function verificarEje(g: NonNullable<ProblemaEstadistica["grafico"]>, nivelPistas: boolean, ctx: string) {
  const { eje } = g;
  expect(eje.tick, ctx).toBeGreaterThan(0);
  expect(eje.max, ctx).toBeGreaterThan(eje.min);
  expect((eje.max - eje.min) % eje.tick, `${ctx}: eje no múltiplo de tick`).toBe(0);
  const valores: number[] =
    g.tipo === "barras" || g.tipo === "lineas" ? g.valores : g.tipo === "histograma" ? g.frecuencias : [g.min, g.q1, g.mediana, g.q3, g.max, ...g.atipicos];
  for (const v of valores) {
    expect(v, ctx).toBeGreaterThanOrEqual(eje.min);
    expect(v, ctx).toBeLessThanOrEqual(eje.max);
    if (g.tipo === "barras" || g.tipo === "lineas") {
      expect(((v - eje.min) * 2) % eje.tick, `${ctx}: valor ${v} fuera de las guías (tick/2)`).toBe(0);
    }
  }
  void nivelPistas;
}

function verificarGraficoNumerico(p: ProblemaEstadistica, ctx: string) {
  if (p.entrada !== "numero" || !p.grafico) throw new Error(`${ctx}: sin gráfico`);
  const g = p.grafico;
  verificarEje(g, true, ctx);
  const e = p.enunciado;
  const tipo = p.detalle.tipo;
  const nombres = [...e.matchAll(CATS_RE)].map((m) => m[1]);
  if (g.tipo === "barras" && tipo === "grafico_valor") {
    return verificarNumerica(p, g.valores[g.categorias.indexOf(nombres[0])], ctx);
  }
  if (g.tipo === "lineas" && tipo === "grafico_valor") {
    return verificarNumerica(p, g.valores[g.etiquetas.indexOf(nombres[0])], ctx);
  }
  if (g.tipo === "barras" && tipo === "grafico_diferencia") {
    const [a, b] = nombres.map((n) => g.categorias.indexOf(n));
    expect(g.valores[a]).toBeGreaterThan(g.valores[b]);
    return verificarNumerica(p, g.valores[a] - g.valores[b], ctx);
  }
  if (g.tipo === "barras" && tipo === "grafico_total") {
    return verificarNumerica(p, g.valores.reduce((s, v) => s + v, 0), ctx);
  }
  if (g.tipo === "histograma" && tipo === "histograma_total") {
    return verificarNumerica(p, g.frecuencias.reduce((s, v) => s + v, 0), ctx);
  }
  if (g.tipo === "histograma" && tipo === "histograma_acumulado") {
    const lim = Number(p.detalle.params!.limite);
    expect(e).toContain(`menores que ${lim}?`);
    const acum = g.frecuencias.reduce((s, f, i) => (g.limites[i + 1] <= lim ? s + f : s), 0);
    return verificarNumerica(p, acum, ctx);
  }
  if (g.tipo === "boxplot") {
    // Coherencia interna del diagrama de caja + regla de Tukey.
    const iqr = g.q3 - g.q1;
    expect(g.min <= g.q1 && g.q1 < g.mediana && g.mediana < g.q3 && g.q3 <= g.max, `${ctx}: orden del boxplot`).toBe(true);
    expect(g.min, ctx).toBeGreaterThanOrEqual(g.q1 - 1.5 * iqr);
    expect(g.max, ctx).toBeLessThanOrEqual(g.q3 + 1.5 * iqr);
    for (const a of g.atipicos) expect(a < g.q1 - 1.5 * iqr || a > g.q3 + 1.5 * iqr, `${ctx}: atípico ${a} dentro de la cerca`).toBe(true);
    if (tipo === "boxplot_iqr") return verificarNumerica(p, iqr, ctx);
    if (tipo === "boxplot_atipicos") return verificarNumerica(p, g.atipicos.length, ctx);
    if (tipo === "boxplot_valor") return verificarNumerica(p, p.detalle.params!.estadistico === "mediana" ? g.mediana : g.q3, ctx);
  }
  if (g.tipo === "barras" && tipo === "engano_porcentaje") {
    const [a, b] = g.valores;
    expect(g.eje.min, `${ctx}: el eje debe estar truncado`).toBeGreaterThan(0);
    return verificarNumerica(p, ((b - a) * 100) / a, ctx);
  }
  if (g.tipo === "barras" && tipo === "engano_aparente") {
    const [a, b] = g.valores;
    expect(g.eje.min).toBeGreaterThan(0);
    expect(e).toContain(`es ${g.eje.min}`);
    return verificarNumerica(p, (b - g.eje.min) / (a - g.eje.min), ctx);
  }
  throw new Error(`${ctx}: gráfico numérico sin verificador: ${g.tipo}/${tipo}`);
}

function tendenciaIndependiente(v: number[], tick: number): string {
  const difs = v.slice(1).map((x, i) => x - v[i]);
  if (difs.every((d) => d > 0)) return "Crece";
  if (difs.every((d) => d < 0)) return "Decrece";
  if (Math.max(...v) - Math.min(...v) <= tick / 2) return "Se mantiene casi constante";
  return "Sube y luego baja";
}

function verificarGraficoOpciones(p: ProblemaEstadistica, ctx: string) {
  if (p.entrada !== "opciones" || !p.grafico) throw new Error(`${ctx}: sin gráfico`);
  const g = p.grafico;
  verificarEje(g, true, ctx);
  const tipo = p.detalle.tipo;
  if (g.tipo === "barras" && (tipo === "grafico_mayor" || tipo === "grafico_menor")) {
    const orden = g.valores.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]);
    const objetivo = tipo === "grafico_mayor" ? orden[orden.length - 1] : orden[0];
    const segundo = tipo === "grafico_mayor" ? orden[orden.length - 2] : orden[1];
    expect(objetivo[0], `${ctx}: extremo no único`).not.toBe(segundo[0]);
    expect(p.respuesta).toBe(g.categorias[objetivo[1]]);
    return;
  }
  if (g.tipo === "lineas" && tipo === "grafico_mayor") {
    const max = Math.max(...g.valores);
    expect(g.valores.filter((v) => v === max).length, ctx).toBe(1);
    expect(p.respuesta).toBe(g.etiquetas[g.valores.indexOf(max)]);
    return;
  }
  if (g.tipo === "lineas" && tipo === "grafico_tendencia") {
    expect(p.respuesta).toBe(tendenciaIndependiente(g.valores, g.eje.tick));
    return;
  }
  if (g.tipo === "lineas" && tipo === "grafico_mayor_aumento") {
    const difs = g.valores.slice(1).map((x, i) => x - g.valores[i]);
    const max = Math.max(...difs);
    expect(max).toBeGreaterThan(0);
    expect(difs.filter((d) => d === max).length, `${ctx}: mayor aumento no único`).toBe(1);
    const i = difs.indexOf(max);
    expect(p.respuesta).toBe(`Entre ${g.etiquetas[i]} y ${g.etiquetas[i + 1]}`);
    return;
  }
  if (g.tipo === "histograma" && tipo === "histograma_clase_modal") {
    const max = Math.max(...g.frecuencias);
    expect(g.frecuencias.filter((f) => f === max).length, ctx).toBe(1);
    const i = g.frecuencias.indexOf(max);
    expect(p.respuesta).toBe(`${g.limites[i]}–${g.limites[i + 1]}`);
    return;
  }
  if (g.tipo === "boxplot" && tipo === "boxplot_porcentaje") {
    expect(p.respuesta).toBe("50%");
    return;
  }
  if (g.tipo === "barras" && tipo === "engano_escala") {
    expect(g.eje.min, `${ctx}: el eje debe estar truncado`).toBeGreaterThan(0);
    expect(g.categorias.length).toBe(2);
    expect(p.respuesta).toBe("El eje vertical no empieza en 0");
    // Los distractores deben ser falsos: 2 barras, misma escala, con título.
    expect(g.titulo.length).toBeGreaterThan(0);
    return;
  }
  throw new Error(`${ctx}: gráfico de opciones sin verificador: ${g.tipo}/${tipo}`);
}

function verificarEstructuraGrafico(p: ProblemaEstadistica, ctx: string) {
  const g = p.grafico!;
  if (g.tipo === "barras") expect(g.valores.length, ctx).toBe(g.categorias.length);
  if (g.tipo === "lineas") expect(g.valores.length, ctx).toBe(g.etiquetas.length);
  if (g.tipo === "histograma") {
    expect(g.limites.length, ctx).toBe(g.frecuencias.length + 1);
    for (let i = 1; i < g.limites.length; i++) expect(g.limites[i], ctx).toBeGreaterThan(g.limites[i - 1]);
    for (const f of g.frecuencias) expect(Number.isInteger(f) && f >= 0, ctx).toBe(true);
  }
}

// ---------- Chequeos comunes ----------

const ESPERADOS: Record<ModoEstadistica, string[]> = {
  central: ["media", "mediana", "moda", "rango", "media_frecuencias", "dato_faltante"],
  dispersion: ["iqr", "varianza_poblacional", "desvio_poblacional", "varianza_muestral", "desvio_muestral", "transformacion_varianza", "transformacion_desvio"],
  probabilidad: ["prob_simple", "prob_dado", "prob_complemento", "prob_independientes", "prob_condicional_tabla", "prob_sin_reposicion", "factorial", "permutaciones", "combinaciones", "prob_combinatoria"],
  datos: [
    "percentil",
    "rango_percentil",
    "z_score",
    "z_inverso",
    "z_comparar",
    "regla_empirica",
    "atipicos_cantidad",
    "atipicos_valor",
    "atipicos_cerca",
    "correlacion_signo",
    "regresion_pendiente",
    "regresion_intercepto",
    "regresion_prediccion",
    "correlacion_r",
  ],
  graficos: [
    "grafico_valor",
    "grafico_mayor",
    "grafico_menor",
    "grafico_diferencia",
    "grafico_total",
    "grafico_tendencia",
    "grafico_mayor_aumento",
    "histograma_total",
    "histograma_clase_modal",
    "histograma_acumulado",
    "boxplot_valor",
    "boxplot_iqr",
    "boxplot_atipicos",
    "boxplot_porcentaje",
    "engano_escala",
    "engano_porcentaje",
    "engano_aparente",
  ],
};

// Banda autoral de cada modo (el nivel más alto de la banda muestra todos los tipos).
const NIVEL_TECHO: Record<ModoEstadistica, number> = { central: 3, dispersion: 6, probabilidad: 7, datos: 10, graficos: 9 };

function chequeosComunes(p: ProblemaEstadistica, modo: ModoEstadistica, ctx: string) {
  expect(p.modo).toBe(modo);
  expect(p.enunciado.length).toBeGreaterThan(10);
  expect(p.enunciado, ctx).not.toMatch(/NaN|undefined|Infinity/);
  if (p.entrada === "numero") {
    expect(Number.isFinite(p.respuesta), ctx).toBe(true);
    // Solo respuestas "limpias": <= 2 decimales, sin ruido de coma flotante.
    expect(Math.abs(p.respuesta * 100 - Math.round(p.respuesta * 100)), `${ctx}: ${p.respuesta}`).toBeLessThan(1e-7);
    expect(String(p.respuesta), ctx).not.toMatch(/e[+-]|\d{4,}\d*\.\d{3,}/);
    // 5.20 == 5.2: cualquier forma de escribir la respuesta se acepta.
    for (const t of [String(p.respuesta), p.respuesta.toFixed(2), p.respuesta.toFixed(1), `${p.respuesta.toFixed(2)}0`]) {
      if (Math.abs(Number(t) - p.respuesta) < 1e-9) expect(aceptada(p, t), `${ctx}: "${t}"`).toBe(true);
    }
    // Un valor claramente distinto nunca se acepta.
    expect(aceptada(p, String(p.respuesta + 0.5 + p.tolerancia)), ctx).toBe(false);
  } else {
    expect(p.opciones.length, ctx).toBeGreaterThanOrEqual(3);
    expect(new Set(p.opciones).size, `${ctx}: opciones repetidas`).toBe(p.opciones.length);
    expect(p.opciones.filter((o) => o === p.respuesta).length, `${ctx}: la correcta debe ser única`).toBe(1);
    for (const o of p.opciones) {
      // Formato numérico sin ambigüedad: nunca "5.20" ni "-0".
      expect(o, ctx).not.toMatch(/^-?\d+\.\d*0%?$/);
      expect(o, ctx).not.toBe("-0");
    }
  }
}

describe("estadistica: exports compartidos", () => {
  it("expone los nombres de modo usados por SelectorMundoDuelo y hrefDuelo", () => {
    expect(MODOS_ESTADISTICA).toEqual(["central", "dispersion", "probabilidad", "datos", "graficos"]);
    expect(NOMBRE_MODO_ESTADISTICA).toEqual({
      central: "Tendencia central",
      dispersion: "Dispersión",
      probabilidad: "Probabilidad y combinatoria",
      datos: "Análisis de datos",
      graficos: "Lectura de gráficos",
    });
  });
});

describe("estadistica: cada respuesta recalculada por un método independiente", () => {
  for (const modo of MODOS_ESTADISTICA) {
    describe(modo, () => {
      const vistos = new Set<string>();

      for (let nivel = 1; nivel <= 10; nivel++) {
        it(`nivel ${nivel}: ${PULLS} problemas, cero diferencias`, () => {
          for (let i = 0; i < PULLS; i++) {
            const p = generarProblemaEstadistica(modo, nivel);
            const ctx = `[${modo} n${nivel} #${i}] ${p.enunciado}`;
            chequeosComunes(p, modo, ctx);
            if (p.grafico) verificarEstructuraGrafico(p, ctx);
            if (nivel === NIVEL_TECHO[modo]) vistos.add(p.detalle.tipo);
            if (p.entrada === "numero") verificar(p, ctx);
            else verificarOpciones(p, ctx);
          }
        });
      }

      it("el nivel techo de la banda produce todos los tipos de pregunta", () => {
        // Pulls extra en el techo para cubrir también los tipos de baja frecuencia.
        for (let i = 0; i < 1500; i++) vistos.add(generarProblemaEstadistica(modo, NIVEL_TECHO[modo]).detalle.tipo);
        expect([...vistos].sort()).toEqual([...ESPERADOS[modo]].sort());
      });
    });
  }
});

describe("estadistica: bandas de nivel", () => {
  it("un nivel por debajo/encima de la banda se satura (mismo abanico de tipos)", () => {
    const tipos = (modo: ModoEstadistica, nivel: number) => {
      const s = new Set<string>();
      for (let i = 0; i < 800; i++) s.add(generarProblemaEstadistica(modo, nivel).detalle.tipo);
      return s;
    };
    // Central: 1-3. Nivel 10 == nivel 3; nivel 1 nunca trae tabla de frecuencias.
    expect(tipos("central", 10)).toEqual(tipos("central", 3));
    expect(tipos("central", 1).has("media_frecuencias")).toBe(false);
    // Dispersión: 3-6. Nivel 1 == nivel 3 (sin varianza muestral); nivel 9 == nivel 6.
    expect(tipos("dispersion", 1).has("varianza_muestral")).toBe(false);
    expect(tipos("dispersion", 9)).toEqual(tipos("dispersion", 6));
    // Probabilidad: 4-7. Nivel 1 == nivel 4 (solo probabilidad simple y dado).
    expect([...tipos("probabilidad", 1)].sort()).toEqual(["prob_dado", "prob_simple"]);
    // Datos: 6-10. Nivel 1 no incluye regresión ni correlación.
    expect(tipos("datos", 1).has("correlacion_r")).toBe(false);
    expect(tipos("datos", 1).has("regresion_pendiente")).toBe(false);
    // Gráficos: 5-9. Nivel 1 == nivel 5 (solo barras); nivel 10 == nivel 9.
    for (const t of tipos("graficos", 1)) expect(t).toMatch(/^grafico_(valor|mayor|menor|diferencia)$/);
    expect(tipos("graficos", 10)).toEqual(tipos("graficos", 9));
  });
});

describe("estadistica: rigor de declaraciones en el enunciado", () => {
  it("varianza/desvío dicen si son poblacionales o muestrales", () => {
    for (let i = 0; i < 600; i++) {
      const p = generarProblemaEstadistica("dispersion", 6);
      if (/varianza|desvío/.test(p.enunciado) && /^Calcula/.test(p.enunciado)) {
        expect(p.enunciado).toMatch(/poblacional \(σ.?, se divide por n\)|muestral \(s.?, se divide por n − 1\)/);
      }
    }
  });
  it("percentil, cuartiles y atípicos declaran su método", () => {
    for (let i = 0; i < 600; i++) {
      const d = generarProblemaEstadistica("datos", 10);
      if (d.detalle.tipo === "percentil") expect(d.enunciado).toContain("Método del rango más cercano");
      if (d.detalle.tipo.startsWith("atipicos")) {
        expect(d.enunciado).toContain("método de las mitades");
        expect(d.enunciado).toContain("1.5·IQR");
      }
      const s = generarProblemaEstadistica("dispersion", 6);
      if (s.detalle.tipo === "iqr") expect(s.enunciado).toContain("método de las mitades");
    }
  });
});

describe("estadistica: datos de apoyo", () => {
  it("hay suficientes conjuntos y con r exacto para el nivel 10", () => {
    const ys = conjuntosYConRExacto();
    expect(ys.length).toBeGreaterThan(20);
  });

  it("es determinista con el mismo rng sembrado", () => {
    for (const modo of MODOS_ESTADISTICA) {
      const a = conRngSembrado(mulberry32(123), () => generarProblemaEstadistica(modo, 7));
      const b = conRngSembrado(mulberry32(123), () => generarProblemaEstadistica(modo, 7));
      expect(claveEstadistica(a)).toBe(claveEstadistica(b));
    }
  });
});

describe("estadistica: preguntaEstadistica (reto diario)", () => {
  it("siempre opción múltiple bien formada y con la correcta entre las opciones", () => {
    for (let i = 0; i < 400; i++) {
      const pr = preguntaEstadistica(mulberry32(i + 1));
      expect(pr.mundo).toBe("estadistica");
      expect(pr.opciones).toContain(pr.respuesta);
      expect(new Set(pr.opciones).size).toBe(pr.opciones.length);
      expect(pr.opciones.length).toBeGreaterThanOrEqual(3);
    }
  });
  it("es determinista por semilla", () => {
    expect(preguntaEstadistica(mulberry32(9))).toEqual(preguntaEstadistica(mulberry32(9)));
  });
  it("las opciones numéricas incluyen la respuesta exacta y solo números limpios", () => {
    for (let i = 0; i < 400; i++) {
      const pr = preguntaEstadistica(mulberry32(1000 + i));
      for (const o of pr.opciones) expect(o).not.toMatch(/^-?\d+\.\d*0$/);
    }
  });
});
