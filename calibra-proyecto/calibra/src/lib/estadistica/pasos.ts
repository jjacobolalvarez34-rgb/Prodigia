import { fmt as fmtBase, fmtFraccion, fraccion, ordenar, redondear2, suma, medianaOrdenada } from "./util";

// «Cómo se resuelve» de cada pregunta de Estadística (pedido 2026-10-18: las
// explicaciones de cada pregunta). Texto plano con símbolos Unicode, igual que
// src/lib/practica/repaso.ts: se ve igual en la web y en la app. Cada función recibe
// los mismos datos con que el generador armó la pregunta.

// Negativos con el signo menos de verdad; «p» los pone entre paréntesis dentro de una cuenta.
const fmt = (x: number) => (fmtBase(x).startsWith("-") ? `−${fmtBase(x).slice(1)}` : fmtBase(x));
const p = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x));
const lista = (xs: readonly number[]) => xs.map(fmt).join(", ");
const sumaTexto = (xs: readonly number[]) => xs.map((x) => (x < 0 ? `(${fmt(x)})` : fmt(x))).join(" + ");
const frac = (a: number, b: number) => fmtFraccion(fraccion(a, b));
// a/b y, si se simplifica, «= simplificada».
const fracCompleta = (a: number, b: number) => {
  const s = frac(a, b);
  return s === `${a}/${b}` ? `${a}/${b}` : `${a}/${b} = ${s}`;
};

export function pasosMedia(datos: readonly number[]): string[] {
  const s = suma(datos);
  return [`Suma todos los datos: ${sumaTexto(datos)} = ${fmt(s)}`, `Divide entre la cantidad de datos (${datos.length}): ${fmt(s)} ÷ ${datos.length} = ${fmt(s / datos.length)}`];
}

export function pasosMediana(datos: readonly number[]): string[] {
  const o = ordenar(datos);
  const n = o.length;
  if (n % 2 === 1) return [`Ordena los datos de menor a mayor: ${lista(o)}`, `Son ${n} datos (impar): la mediana es el del medio, el de la posición ${(n + 1) / 2}: ${fmt(o[(n - 1) / 2])}`];
  const a = o[n / 2 - 1];
  const b = o[n / 2];
  return [`Ordena los datos de menor a mayor: ${lista(o)}`, `Son ${n} datos (par): la mediana es el promedio de los dos del medio, ${fmt(a)} y ${fmt(b)}`, `(${fmt(a)} + ${fmt(b)}) ÷ 2 = ${fmt((a + b) / 2)}`];
}

export function pasosModa(datos: readonly number[]): string[] {
  const cuentas = new Map<number, number>();
  for (const x of datos) cuentas.set(x, (cuentas.get(x) ?? 0) + 1);
  const orden = [...cuentas.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  return [`Cuenta cuántas veces aparece cada valor: ${orden.map(([v, c]) => `${fmt(v)} (${c})`).join(", ")}`, `La moda es el que más se repite: ${fmt(orden[0][0])}, que aparece ${orden[0][1]} veces`];
}

export function pasosRango(datos: readonly number[]): string[] {
  const max = Math.max(...datos);
  const min = Math.min(...datos);
  return [`El mayor dato es ${fmt(max)} y el menor es ${fmt(min)}`, `Rango = máximo − mínimo = ${fmt(max)} − ${fmt(min)} = ${fmt(max - min)}`];
}

export function pasosMediaFrecuencias(valores: readonly number[], f: readonly number[]): string[] {
  const productos = valores.map((v, i) => v * f[i]);
  const total = suma(f);
  return [
    `Multiplica cada valor por su frecuencia: ${valores.map((v, i) => `${fmt(v)}×${f[i]}`).join(" + ")} = ${sumaTexto(productos)} = ${fmt(suma(productos))}`,
    `Cuántos datos hay en total (suma de frecuencias): ${f.join(" + ")} = ${total}`,
    `Media = ${fmt(suma(productos))} ÷ ${total} = ${fmt(suma(productos) / total)}`,
  ];
}

export function pasosDatoFaltante(n: number, media: number, conocidos: readonly number[]): string[] {
  const total = n * media;
  const s = suma(conocidos);
  return [`Si la media de ${n} datos es ${fmt(media)}, entre todos suman ${n} × ${fmt(media)} = ${fmt(total)}`, `Los ${conocidos.length} conocidos suman ${sumaTexto(conocidos)} = ${fmt(s)}`, `El que falta es ${fmt(total)} − ${fmt(s)} = ${fmt(total - s)}`];
}

function mitades(datos: readonly number[]) {
  const o = ordenar(datos);
  const n = o.length;
  const m = Math.floor(n / 2);
  return { o, inferior: o.slice(0, m), superior: n % 2 === 1 ? o.slice(m + 1) : o.slice(m) };
}

export function pasosIqr(datos: readonly number[]): string[] {
  const { o, inferior, superior } = mitades(datos);
  const q1 = medianaOrdenada(inferior);
  const q3 = medianaOrdenada(superior);
  return [
    `Ordena los datos: ${lista(o)}`,
    `Mitad inferior: ${lista(inferior)} → su mediana es Q₁ = ${fmt(q1)}`,
    `Mitad superior: ${lista(superior)} → su mediana es Q₃ = ${fmt(q3)}`,
    `IQR = Q₃ − Q₁ = ${fmt(q3)} − ${fmt(q1)} = ${fmt(q3 - q1)}`,
  ];
}

// Varianza o desvío, poblacional (÷ n) o muestral (÷ n − 1).
export function pasosDispersion(datos: readonly number[], muestral: boolean, desvio: boolean): string[] {
  const n = datos.length;
  const media = suma(datos) / n;
  const cuadrados = datos.map((x) => (x - media) ** 2);
  const ss = suma(cuadrados);
  const div = muestral ? n - 1 : n;
  const varianza = ss / div;
  const pasos = [
    `Media: ${fmt(suma(datos))} ÷ ${n} = ${fmt(media)}`,
    `Resta la media a cada dato y eleva al cuadrado: ${datos.map((x) => `(${fmt(x)} − ${fmt(media)})² = ${fmt((x - media) ** 2)}`).join("; ")}`,
    `Suma de los cuadrados: ${fmt(ss)}`,
    muestral ? `Varianza muestral: divide entre n − 1 = ${div}: ${fmt(ss)} ÷ ${div} = ${fmt(varianza)}` : `Varianza poblacional: divide entre n = ${div}: ${fmt(ss)} ÷ ${div} = ${fmt(varianza)}`,
  ];
  if (desvio) pasos.push(`Desvío = √varianza = √${fmt(varianza)} ≈ ${fmt(redondear2(Math.sqrt(varianza)))}`);
  return pasos;
}

export function pasosTransformacion(suma_: boolean, valor: number, varianza: number, desvio: number, pideVarianza: boolean): string[] {
  if (suma_) {
    return [`Sumar ${valor} a todos los datos los corre a todos por igual: la distancia entre ellos no cambia`, `Por eso la dispersión queda igual: la ${pideVarianza ? `varianza sigue siendo ${fmt(varianza)}` : `desvío sigue siendo ${fmt(desvio)}`}`];
  }
  return pideVarianza
    ? [`Multiplicar cada dato por ${valor} multiplica las distancias por ${valor}; la varianza (que es un cuadrado) se multiplica por ${valor}² = ${valor * valor}`, `${fmt(varianza)} × ${valor * valor} = ${fmt(varianza * valor * valor)}`]
    : [`Multiplicar cada dato por ${valor} multiplica las distancias por ${valor}, y el desvío también`, `${fmt(desvio)} × ${valor} = ${fmt(desvio * valor)}`];
}

// ---------- Probabilidad ----------

export function pasosProbSimple(favorables: number, total: number, que: string): string[] {
  return [`Casos favorables (${que}): ${favorables}. Casos posibles: ${total}`, `P = favorables ÷ posibles = ${fracCompleta(favorables, total)}`];
}

export function pasosProbDado(caras: number, favorables: number[], que: string): string[] {
  return [`Las caras que cumplen (${que}): ${favorables.join(", ")} → ${favorables.length} de ${caras}`, `P = ${fracCompleta(favorables.length, caras)}`];
}

export function pasosComplemento(c: number, total: number, color: string): string[] {
  return [`P(${color}) = ${frac(c, total)}`, `P(no ${color}) = 1 − P(${color}) = (${total} − ${c}) ÷ ${total} = ${fracCompleta(total - c, total)}`];
}

export function pasosIndependientes(ci: number, cj: number, T: number, a: string, b: string): string[] {
  return [`Como la bola se devuelve, la segunda extracción no depende de la primera`, `P(1.ª ${a}) = ${ci}/${T}; P(2.ª ${b}) = ${cj}/${T}`, `Multiplica: ${ci}/${T} × ${cj}/${T} = ${fracCompleta(ci * cj, T * T)}`];
}

export function pasosCondicional(favorables: number, grupo: number, quienes: string, que: string): string[] {
  return [`Solo cuentan los que ${quienes}: son ${grupo}`, `De ellos, ${que}: ${favorables}`, `P = ${fracCompleta(favorables, grupo)}`];
}

export function pasosSinReposicion(variante: "ambas" | "condicional" | "distintas", c0: number, c1: number, T: number, a: string, b: string): string[] {
  if (variante === "condicional") return [`Ya salió una ${a}: quedan ${c0 - 1} ${a}s de ${T - 1} bolas`, `P = ${fracCompleta(c0 - 1, T - 1)}`];
  if (variante === "ambas") return [`Primera ${a}: ${c0}/${T}`, `Sin devolverla quedan ${c0 - 1} de ${T - 1}: ${c0 - 1}/${T - 1}`, `Multiplica: ${c0}/${T} × ${c0 - 1}/${T - 1} = ${fracCompleta(c0 * (c0 - 1), T * (T - 1))}`];
  return [`Primera ${a}: ${c0}/${T}`, `Sin devolverla quedan ${T - 1} bolas, ${c1} ${b}s: ${c1}/${T - 1}`, `Multiplica: ${c0}/${T} × ${c1}/${T - 1} = ${fracCompleta(c0 * c1, T * (T - 1))}`];
}

const factorial = (n: number) => {
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
};
const comb = (n: number, r: number) => factorial(n) / (factorial(r) * factorial(n - r));

export function pasosFactorial(n: number): string[] {
  return [`${n}! es multiplicar todos los números de ${n} hasta 1`, `${Array.from({ length: n }, (_, i) => n - i).join(" × ")} = ${factorial(n)}`];
}

export function pasosPermutaciones(n: number, r: number): string[] {
  const factores = Array.from({ length: r }, (_, i) => n - i);
  return [`El orden importa: para el 1.er lugar hay ${n} opciones, para el 2.º ${n - 1}, y así ${r} veces`, `${factores.join(" × ")} = ${factores.reduce((a, b) => a * b, 1)}`];
}

export function pasosCombinaciones(n: number, r: number): string[] {
  const factores = Array.from({ length: r }, (_, i) => n - i);
  const p = factores.reduce((a, b) => a * b, 1);
  return [`Si el orden importara serían ${factores.join(" × ")} = ${p}`, `Como no importa, cada grupo se contó ${r}! = ${factorial(r)} veces`, `${p} ÷ ${factorial(r)} = ${p / factorial(r)}`];
}

export function pasosProbCombinatoria(iguales: boolean, c0: number, c1: number, T: number, a: string, b: string): string[] {
  const total = comb(T, 2);
  if (iguales) return [`Formas de sacar 2 bolas de ${T}: C(${T}, 2) = ${total}`, `Formas de sacar 2 ${a}s de ${c0}: C(${c0}, 2) = ${comb(c0, 2)}`, `P = ${fracCompleta(comb(c0, 2), total)}`];
  return [`Formas de sacar 2 bolas de ${T}: C(${T}, 2) = ${total}`, `Una ${a} y una ${b}: ${c0} × ${c1} = ${c0 * c1}`, `P = ${fracCompleta(c0 * c1, total)}`];
}

// ---------- Análisis de datos ----------

export function pasosPercentil(datos: readonly number[], p: number): string[] {
  const o = ordenar(datos);
  const n = o.length;
  const pos = Math.floor((p * n + 99) / 100);
  return [`Ordena los ${n} datos: ${lista(o)}`, `Posición = ⌈${p} × ${n} ÷ 100⌉ = ⌈${fmt((p * n) / 100)}⌉ = ${pos}`, `El dato en la posición ${pos} es ${fmt(o[pos - 1])}`];
}

export function pasosRangoPercentil(datos: readonly number[], x: number): string[] {
  const k = datos.filter((d) => d <= x).length;
  return [`Cuenta los datos menores o iguales que ${fmt(x)}: ${k} de ${datos.length}`, `${k} ÷ ${datos.length} × 100 = ${fmt((k * 100) / datos.length)} %`];
}

export function pasosZ(mu: number, sigma: number, x: number): string[] {
  return [`z = (x − μ) ÷ σ`, `(${fmt(x)} − ${fmt(mu)}) ÷ ${fmt(sigma)} = ${p(x - mu)} ÷ ${fmt(sigma)} = ${fmt((x - mu) / sigma)}`];
}

export function pasosZInverso(mu: number, sigma: number, z: number): string[] {
  return [`x = μ + z · σ`, `${fmt(mu)} + ${p(z)} × ${fmt(sigma)} = ${fmt(mu)} + ${p(z * sigma)} = ${fmt(mu + z * sigma)}`];
}

export function pasosZComparar(x1: number, mu1: number, s1: number, x2: number, mu2: number, s2: number, correcta: string): string[] {
  return [
    `Matemática: z = (${fmt(x1)} − ${fmt(mu1)}) ÷ ${fmt(s1)} = ${fmt((x1 - mu1) / s1)}`,
    `Lengua: z = (${fmt(x2)} − ${fmt(mu2)}) ÷ ${fmt(s2)} = ${fmt((x2 - mu2) / s2)}`,
    `El z más alto es el mejor resultado comparado con su grupo: ${correcta}`,
  ];
}

export function pasosReglaEmpirica(k: number, centro: number, entre: boolean, respuesta: string): string[] {
  if (entre) return [`Entre μ − ${k}σ y μ + ${k}σ queda el ${centro} % de los datos (regla ${k === 1 ? "68" : k === 2 ? "95" : "99,7"})`, `Respuesta: ${respuesta}`];
  return [`Entre μ ± ${k}σ queda el ${centro} %; afuera queda 100 − ${centro} = ${fmt(100 - centro)} %`, `La curva es simétrica: ese resto se reparte en dos colas iguales: ${fmt(100 - centro)} ÷ 2 = ${respuesta}`];
}

export function pasosAtipicos(datos: readonly number[]): string[] {
  const { o, inferior, superior } = mitades(datos);
  const q1 = medianaOrdenada(inferior);
  const q3 = medianaOrdenada(superior);
  const iqr = q3 - q1;
  const inf = q1 - 1.5 * iqr;
  const sup = q3 + 1.5 * iqr;
  const fuera = o.filter((x) => x < inf || x > sup);
  return [
    `Ordena: ${lista(o)}`,
    `Q₁ = ${fmt(q1)}, Q₃ = ${fmt(q3)} → IQR = ${fmt(iqr)}`,
    `Límite inferior: ${fmt(q1)} − 1,5 × ${fmt(iqr)} = ${fmt(inf)}. Límite superior: ${fmt(q3)} + 1,5 × ${fmt(iqr)} = ${fmt(sup)}`,
    fuera.length ? `Quedan afuera de [${fmt(inf)}, ${fmt(sup)}]: ${lista(fuera)}` : `Ningún dato queda afuera de [${fmt(inf)}, ${fmt(sup)}]: no hay atípicos`,
  ];
}

const sxy = (ys: readonly number[]) => ys.reduce((a, y, i) => a + (i - 2) * y, 0);

export function pasosCorrelacionSigno(ys: readonly number[], correcta: string): string[] {
  const s = sxy(ys);
  return [
    `Las x van subiendo de a 1. Mira qué hacen las y: ${lista(ys)}`,
    `Suma de (x − x̄)·y con pesos −2, −1, 0, 1, 2: ${ys.map((y, i) => `${p(i - 2)}×${fmt(y)}`).join(" + ")} = ${fmt(s)}`,
    s > 0 ? `Es positiva: cuando x crece, y tiende a crecer → ${correcta}` : s < 0 ? `Es negativa: cuando x crece, y tiende a bajar → ${correcta}` : `Da 0: no hay tendencia lineal → ${correcta}`,
  ];
}

export function pasosRegresion(x0: number, ys: readonly number[], variante: "pendiente" | "intercepto" | "prediccion", xNuevo?: number): string[] {
  const xm = x0 + 2;
  const ym = suma(ys) / 5;
  const s = sxy(ys);
  const b = s / 10;
  const a = ym - b * xm;
  const pasos = [
    `x̄ = ${fmt(xm)}, ȳ = ${fmt(suma(ys))} ÷ 5 = ${fmt(ym)}`,
    `Sxx = Σ(x − x̄)² = 4 + 1 + 0 + 1 + 4 = 10. Sxy = Σ(x − x̄)·y = ${fmt(s)}`,
    `Pendiente b = Sxy ÷ Sxx = ${p(s)} ÷ 10 = ${fmt(b)}`,
  ];
  if (variante === "pendiente") return pasos;
  pasos.push(`Intercepto a = ȳ − b·x̄ = ${fmt(ym)} − ${p(b)} × ${fmt(xm)} = ${fmt(a)}`);
  if (variante === "prediccion" && xNuevo != null) pasos.push(`ŷ = a + b·x = ${fmt(a)} + ${p(b)} × ${fmt(xNuevo)} = ${fmt(a + b * xNuevo)}`);
  return pasos;
}

export function pasosCorrelacionR(ys: readonly number[]): string[] {
  const s = sxy(ys);
  const ym = suma(ys) / 5;
  const syy = suma(ys.map((y) => (y - ym) ** 2));
  const r = s / Math.sqrt(10 * syy);
  return [
    `ȳ = ${fmt(ym)}. Sxy = Σ(x − x̄)·y = ${fmt(s)}; Sxx = 10`,
    `Syy = Σ(y − ȳ)² = ${fmt(syy)}`,
    `r = Sxy ÷ √(Sxx · Syy) = ${p(s)} ÷ √(10 × ${fmt(syy)}) = ${fmt(redondear2(r))}`,
  ];
}

// ---------- Gráficos ----------

const GUIA_GRAFICO: Record<string, string> = {
  grafico_valor: "Busca la barra o el punto que pide y lee su altura en el eje (cada línea guía marca un valor)",
  grafico_mayor: "Compara las alturas: la más alta es la mayor",
  grafico_menor: "Compara las alturas: la más baja es la menor",
  grafico_diferencia: "Lee los dos valores en el eje y réstalos",
  grafico_total: "Lee cada valor y súmalos todos",
  grafico_tendencia: "Recorre la línea de izquierda a derecha: ¿sube, baja o se mantiene?",
  grafico_mayor_aumento: "Calcula cuánto sube de cada punto al siguiente; el salto más grande es la respuesta",
  histograma_total: "Cada barra es la cantidad de datos de su clase: suma todas las alturas",
  histograma_clase_modal: "La clase modal es la de la barra más alta",
  histograma_acumulado: "Suma las alturas de las clases que pide",
  boxplot_valor: "En el diagrama de caja: los bigotes son el mínimo y el máximo, los bordes de la caja son Q₁ y Q₃ y la línea del medio es la mediana",
  boxplot_iqr: "IQR = Q₃ − Q₁: el ancho de la caja",
  boxplot_atipicos: "Los atípicos son los puntos sueltos, fuera de los bigotes",
  boxplot_porcentaje: "Cada tramo (bigote–Q₁, Q₁–mediana, mediana–Q₃, Q₃–bigote) tiene el 25 % de los datos",
  engano_escala: "Mira dónde empieza el eje: si no empieza en 0, las diferencias parecen más grandes de lo que son",
  engano_porcentaje: "Compara los valores reales del eje, no el tamaño de las barras",
  engano_aparente: "Lee los números del eje antes de comparar: el dibujo puede exagerar",
};

export function pasosGrafico(tipo: string, respuesta: string | number): string[] {
  return [GUIA_GRAFICO[tipo] ?? "Lee con cuidado los valores del eje", `Respuesta: ${typeof respuesta === "number" ? fmt(respuesta) : respuesta}`];
}
