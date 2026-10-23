export type TipoDecimal = "convertir" | "porcentaje" | "redondear";

export interface ProblemaDecimal {
  problemType: "decimales";
  tipo: TipoDecimal;
  enunciado: string;
  respuesta: number;
  tolerancia: number;
  // «Cómo se resuelve» para el repaso de errores (repaso.ts).
  pasos?: string[];
}

// Auditoría de variedad (2026-10-23, docs/AUDITORIA_PREGUNTAS.md): «convertir» en
// nivel 1-2 tenía UNA sola pregunta posible (den = 2 y num = randomInt(1, 1) →
// siempre «1/2 a decimal»), en nivel 3-4 tres, y «porcentaje» usaba una única base
// por banda (20 preguntas en total por nivel, con redondeos que el enunciado no
// pedía). Ahora cada banda (niveles 1-2, 3-4, …, 9-10) mezcla varias clases de
// pregunta propias, los números crecen con el nivel y los redondeos se declaran
// siempre en el enunciado. Todas las respuestas son números positivos (en la app,
// la sección Decimales tiene tecla de coma pero no de signo).

// ---------- utilidades ----------

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function azar<T>(xs: readonly T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}

function banda(nivel: number): number {
  return Math.max(0, Math.min(4, Math.floor((nivel - 1) / 2)));
}

function mcd(a: number, b: number): number {
  return b === 0 ? a : mcd(b, a % b);
}

// Quita el ruido de coma flotante (0.1 + 0.2 → 0.3).
const limpio = (x: number) => Math.round(x * 1e9) / 1e9;

// Número en español sin separador de miles: 0,75 · 12,5 · 1250.
// (Un solo formateador: crear uno por llamada con toLocaleString es lento.)
const FORMATO = new Intl.NumberFormat("es", { maximumFractionDigits: 9, useGrouping: false });
const dec = (x: number) => FORMATO.format(limpio(x));

const frac = (n: number, d: number) => `$\\frac{${n}}{${d}}$`;

// ¿n/d tiene decimal exacto? (el denominador reducido solo tiene factores 2 y 5)
function esExacta(n: number, d: number): boolean {
  let r = d / mcd(n, d);
  while (r % 2 === 0) r /= 2;
  while (r % 5 === 0) r /= 5;
  return r === 1;
}

// Menor potencia de 10 que el denominador divide (solo para decimales exactos).
function potenciaDiez(d: number): number {
  let p = 10;
  while (p % d !== 0) p *= 10;
  return p;
}

// Fracción irreducible n/d con d de la lista y n entre 1 y d·maximo − 1 (sin enteros).
function fraccionIrreducible(dens: readonly number[], maximo = 1): [number, number] {
  for (;;) {
    const d = azar(dens);
    const n = randomInt(1, d * maximo - 1);
    if (mcd(n, d) === 1) return [n, d];
  }
}

// Desarrollo decimal por división larga: parte entera, cifras no periódicas y período.
export function desarrolloDecimal(n: number, d: number): { entero: number; anteperiodo: string; periodo: string } {
  const entero = Math.floor(n / d);
  let resto = n % d;
  const posicion = new Map<number, number>();
  let cifras = "";
  while (resto !== 0 && !posicion.has(resto)) {
    posicion.set(resto, cifras.length);
    resto *= 10;
    cifras += String(Math.floor(resto / d));
    resto %= d;
  }
  if (resto === 0) return { entero, anteperiodo: cifras, periodo: "" };
  const inicio = posicion.get(resto) ?? 0;
  return { entero, anteperiodo: cifras.slice(0, inicio), periodo: cifras.slice(inicio) };
}

// «0,2727…»: el período escrito las veces necesarias para que se note (≥ 4 cifras).
function textoPeriodico(n: number, d: number): string {
  const { entero, anteperiodo, periodo } = desarrolloDecimal(n, d);
  const repeticiones = Math.max(2, Math.ceil(4 / periodo.length));
  return `${entero},${anteperiodo}${periodo.repeat(repeticiones)}…`;
}

// Las primeras `m` cifras decimales de n/d (división larga): «0,1428…».
function primerasCifras(n: number, d: number, m: number): string {
  let resto = n % d;
  let cifras = "";
  for (let i = 0; i < m; i++) {
    resto *= 10;
    cifras += String(Math.floor(resto / d));
    resto %= d;
  }
  return `${Math.floor(n / d)},${cifras}…`;
}

// Redondeo «mitad hacia arriba» de n/d a k decimales, con enteros (sin ruido).
function redondearFraccion(n: number, d: number, k: number): number {
  const escala = 10 ** k;
  return Math.floor((2 * n * escala + d) / (2 * d)) / escala;
}

function problema(tipo: TipoDecimal, enunciado: string, respuesta: number, pasos: string[], tolerancia = 0): ProblemaDecimal {
  return { problemType: "decimales", tipo, enunciado, respuesta: limpio(respuesta), tolerancia, pasos };
}

// ---------- convertir: fracción ↔ decimal ↔ porcentaje ----------

function pasosFraccionADecimal(n: number, d: number): string[] {
  const p = potenciaDiez(d);
  if (p <= 1000) {
    const k = p / d;
    return [`Multiplica arriba y abajo por ${k} para que abajo quede ${p}: ${n}/${d} = ${n * k}/${p}`, `${n * k}/${p} = ${dec(n / d)}`];
  }
  return [`Divide el numerador entre el denominador: ${n} ÷ ${d} = ${dec(n / d)}`];
}

// Fracción → decimal (exacto).
function fraccionADecimal(dens: readonly number[], maximo = 1): ProblemaDecimal {
  const [n, d] = fraccionIrreducible(dens, maximo);
  return problema("convertir", `Convierte ${frac(n, d)} a decimal`, n / d, pasosFraccionADecimal(n, d));
}

// Decimal → porcentaje. `milesimas`: el decimal en milésimas (350 = 0,35).
function decimalAPorcentaje(milesimas: number): ProblemaDecimal {
  const x = milesimas / 1000;
  return problema("convertir", `${dec(x)} = ? %`, x * 100, [
    `Para pasar a porcentaje se multiplica por 100 (la coma corre dos lugares a la derecha)`,
    `${dec(x)} × 100 = ${dec(x * 100)}, o sea ${dec(x * 100)} %`,
  ]);
}

// Porcentaje → decimal. `decimasDePorcentaje`: 125 = 12,5 %.
function porcentajeADecimal(decimasDePorcentaje: number): ProblemaDecimal {
  const p = decimasDePorcentaje / 10;
  return problema("convertir", `Escribe ${dec(p)} % como decimal`, p / 100, [
    `«Por ciento» es «dividido entre 100» (la coma corre dos lugares a la izquierda)`,
    `${dec(p)} ÷ 100 = ${dec(p / 100)}`,
  ]);
}

// Fracción → porcentaje (exacto).
function fraccionAPorcentaje(dens: readonly number[], maximo = 1): ProblemaDecimal {
  const [n, d] = fraccionIrreducible(dens, maximo);
  const pct = (n * 100) / d;
  return problema("convertir", `${frac(n, d)} = ? %`, pct, [
    ...(100 % d === 0 ? [`Lleva el denominador a 100: ${n}/${d} = ${n * (100 / d)}/100`] : [`Pasa a decimal: ${n} ÷ ${d} = ${dec(n / d)}`]),
    `Multiplica por 100: ${dec(pct)} %`,
  ]);
}

// Decimal → fracción: falta el numerador de una fracción con denominador dado.
function decimalAFraccion(dens: readonly number[], maximo = 1): ProblemaDecimal {
  const [n, d] = fraccionIrreducible(dens, maximo);
  const p = potenciaDiez(d);
  const arriba = (n * p) / d;
  const g = mcd(arriba, p);
  return problema("convertir", `Completa: ${dec(n / d)} = $\\frac{?}{${d}}$`, n, [
    `Escribe el decimal sobre ${p}: ${dec(n / d)} = ${arriba}/${p}`,
    `Simplifica dividiendo arriba y abajo entre ${g}: ${arriba}/${p} = ${n}/${d}`,
  ]);
}

// Porcentaje → fracción irreducible: falta el denominador.
function porcentajeAFraccion(decimasDePorcentaje: readonly number[]): ProblemaDecimal {
  const dp = azar(decimasDePorcentaje);
  // dp décimas de porcentaje = dp / 1000
  const g = mcd(dp, 1000);
  const [n, d] = [dp / g, 1000 / g];
  const p = dp / 10;
  return problema("convertir", `${dec(p)} % escrito como fracción irreducible es $\\frac{${n}}{?}$`, d, [
    `${dec(p)} % = ${dec(p)}/100${Number.isInteger(p) ? "" : ` = ${dp}/1000`}`,
    `Simplifica dividiendo arriba y abajo entre ${Number.isInteger(p) ? mcd(p, 100) : g}: queda ${n}/${d}`,
  ]);
}

// Fracción con decimal periódico → decimal redondeado (el redondeo va en el enunciado).
function fraccionADecimalRedondeado(dens: readonly number[], k: number): ProblemaDecimal {
  for (;;) {
    const [n, d] = fraccionIrreducible(dens);
    if (esExacta(n, d)) continue;
    const r = redondearFraccion(n, d, k);
    return problema("convertir", `Convierte ${frac(n, d)} a decimal (redondea a ${k} decimales)`, r, [
      `Divide: ${n} ÷ ${d} = ${primerasCifras(n, d, k + 2)} (no termina nunca)`,
      `Redondeado a ${k} decimales: ${dec(r)}`,
    ]);
  }
}

// Fracción → porcentaje redondeado a 1 decimal.
function fraccionAPorcentajeRedondeado(dens: readonly number[]): ProblemaDecimal {
  for (;;) {
    const [n, d] = fraccionIrreducible(dens);
    if (esExacta(n * 100, d)) continue;
    const r = redondearFraccion(n * 100, d, 1);
    return problema("convertir", `${frac(n, d)} = ? % (redondea a 1 decimal)`, r, [
      `Pasa a decimal: ${n} ÷ ${d} = ${primerasCifras(n, d, 5)}`,
      `Multiplica por 100 y redondea a 1 decimal: ${dec(r)} %`,
    ]);
  }
}

// Decimal periódico → fracción irreducible (falta el numerador o el denominador).
function periodicoAFraccion(dens: readonly number[]): ProblemaDecimal {
  for (;;) {
    const [n, d] = fraccionIrreducible(dens);
    if (esExacta(n, d)) continue;
    const { anteperiodo, periodo } = desarrolloDecimal(n, d);
    const pideDenominador = Math.random() < 0.5;
    const enunciado = pideDenominador
      ? `El decimal periódico ${textoPeriodico(n, d)} es igual a $\\frac{${n}}{?}$`
      : `El decimal periódico ${textoPeriodico(n, d)} es igual a $\\frac{?}{${d}}$`;
    const nueves = "9".repeat(periodo.length);
    const ceros = "0".repeat(anteperiodo.length);
    const pasos =
      anteperiodo.length === 0
        ? [`Un período puro de ${periodo.length} cifra${periodo.length > 1 ? "s" : ""} va sobre ${nueves}: 0,(${periodo}) = ${Number(periodo)}/${nueves}`]
        : [
            `Con anteperíodo: arriba (todas las cifras) − (las que no se repiten) = ${Number(anteperiodo + periodo)} − ${Number(anteperiodo)} = ${Number(anteperiodo + periodo) - Number(anteperiodo)}`,
            `Abajo, un 9 por cifra del período y un 0 por cifra del anteperíodo: ${nueves}${ceros}`,
          ];
    pasos.push(`Simplificada: ${n}/${d}`);
    return problema("convertir", enunciado, pideDenominador ? d : n, pasos);
  }
}

const DECIMOS_Y_CUARTOS = [100, 200, 250, 300, 400, 500, 600, 700, 750, 800, 900];

function generarConvertir(nivel: number): ProblemaDecimal {
  switch (banda(nivel)) {
    case 0: // décimos, medios, cuartos y quintos
      return azar([
        () => fraccionADecimal([2, 4, 5, 10]),
        () => decimalAPorcentaje(azar(DECIMOS_Y_CUARTOS)),
        () => porcentajeADecimal(azar(DECIMOS_Y_CUARTOS)), // mismas cifras: 0,25 ↔ 25 %
        () => fraccionAPorcentaje([2, 4, 5, 10]),
      ])();
    case 1: // centésimos, octavos, veinteavos; decimal → fracción
      return azar([
        () => fraccionADecimal([4, 5, 8, 10, 20, 25]),
        () => decimalAPorcentaje(randomInt(1, 99) * 10),
        () => porcentajeADecimal(randomInt(1, 99) * 10),
        () => fraccionAPorcentaje([4, 5, 10, 20, 25, 50]),
        () => decimalAFraccion([4, 5, 8, 20, 25]),
      ])();
    case 2: // milésimas, fracciones impropias, porcentajes > 100 y con coma
      return azar([
        () => fraccionADecimal([8, 16, 20, 25, 40, 50], 3),
        () => decimalAPorcentaje(randomInt(1, 40) * 25 + azar([0, 0, 1000])),
        () => porcentajeADecimal(azar([randomInt(1, 39) * 5, randomInt(101, 300) * 10])),
        () => fraccionAPorcentaje([8, 20, 25, 40, 50], 2),
        () => decimalAFraccion([8, 16, 40, 50, 125]),
        () => porcentajeAFraccion([50, 100, 150, 200, 250, 300, 350, 400, 450, 600, 700, 750, 800, 900, 950]),
      ])();
    case 3: // decimales periódicos: redondear y reconocer los simples
      return azar([
        () => fraccionADecimalRedondeado([3, 6, 7, 9, 11, 12], 2),
        () => periodicoAFraccion([3, 9, 11]),
        () => fraccionAPorcentajeRedondeado([3, 6, 7, 9, 12]),
        () => fraccionADecimal([16, 32, 40, 80, 125]),
        () => porcentajeAFraccion([25, 75, 125, 175, 225, 375, 625, 875]),
      ])();
    default: // períodos largos y mixtos, 3 decimales
      return azar([
        () => fraccionADecimalRedondeado([7, 13, 17, 21, 27, 37], 3),
        () => periodicoAFraccion([6, 12, 15, 18, 22, 27, 30, 33, 45, 90, 99]),
        () => fraccionAPorcentajeRedondeado([7, 11, 13, 15, 18, 21]),
        () => decimalAFraccion([16, 32, 40, 80, 125, 250], 2),
        () => porcentajeAFraccion([5, 15, 35, 45, 55, 65, 85, 95, 1125, 1375, 1625, 1875]),
      ])();
  }
}

// ---------- porcentaje: «el p % de b», aumentos y descuentos, al revés ----------

function porcentajeDe(p: number, base: number): ProblemaDecimal {
  const r = (p * base) / 100;
  return problema("porcentaje", `¿Cuánto es ${dec(p)} % de ${base}?`, r, [
    `El 1 % de ${base} es ${base} ÷ 100 = ${dec(base / 100)}`,
    `El ${dec(p)} % es ${dec(p)} veces eso: ${dec(base / 100)} × ${dec(p)} = ${dec(r)}`,
  ]);
}

// Base múltiplo de lo necesario para que el p % dé exacto con a lo sumo `decimales` cifras.
function baseExacta(p: number, maxBase: number, decimales = 0): number {
  for (;;) {
    const base = randomInt(2, maxBase);
    if (Number.isInteger(limpio(((p * base) / 100) * 10 ** decimales))) return base;
  }
}

function quePorcentaje(): ProblemaDecimal {
  const total = azar([20, 25, 40, 50, 80, 120, 150, 200, 250, 300, 400, 500, 600, 800]);
  for (;;) {
    const p = randomInt(1, 99);
    const parte = (total * p) / 100;
    if (!Number.isInteger(parte)) continue;
    return problema("porcentaje", `¿Qué porcentaje de ${total} es ${parte}?`, p, [
      `Divide la parte entre el total: ${parte} ÷ ${total} = ${dec(parte / total)}`,
      `Multiplica por 100: ${p} %`,
    ]);
  }
}

function aumentoODescuento(maxBase: number): ProblemaDecimal {
  const sube = Math.random() < 0.5;
  const p = randomInt(1, 9) * 5;
  const base = randomInt(1, maxBase / 20) * 20; // p múltiplo de 5 y base de 20: exacto
  const cambio = (p * base) / 100;
  const r = sube ? base + cambio : base - cambio;
  return problema("porcentaje", `Un precio de ${base} ${sube ? "sube" : "baja"} un ${p} %. ¿Cuánto queda?`, r, [
    `El ${p} % de ${base} es ${dec(cambio)}`,
    `${base} ${sube ? "+" : "−"} ${dec(cambio)} = ${dec(r)}`,
  ]);
}

function porcentajeInverso(): ProblemaDecimal {
  const p = randomInt(1, 19) * 5;
  let total = randomInt(2, 60) * 10;
  while (!Number.isInteger((p * total) / 100)) total = randomInt(2, 60) * 10;
  const parte = (p * total) / 100;
  return problema("porcentaje", `El ${p} % de un número es ${dec(parte)}. ¿Cuál es el número?`, total, [
    `Si el ${p} % es ${dec(parte)}, el 1 % es ${dec(parte)} ÷ ${p} = ${dec(parte / p)}`,
    `El 100 % es ${dec(parte / p)} × 100 = ${total}`,
  ]);
}

function cambiosSucesivos(): ProblemaDecimal {
  const a = randomInt(1, 5) * 10;
  const b = randomInt(1, 5) * 10;
  const primeroSube = Math.random() < 0.5;
  const fa = primeroSube ? 100 + a : 100 - a;
  const fb = primeroSube ? 100 - b : 100 + b;
  const r = (fa * fb) / 100;
  return problema(
    "porcentaje",
    `Un precio ${primeroSube ? "sube" : "baja"} un ${a} % y después ${primeroSube ? "baja" : "sube"} un ${b} %. ¿Qué porcentaje del precio original queda?`,
    r,
    [`Cada cambio multiplica: ×${dec(fa / 100)} y después ×${dec(fb / 100)}`, `${dec(fa / 100)} × ${dec(fb / 100)} = ${dec(r / 100)}, o sea ${dec(r)} %`]
  );
}

function generarPorcentaje(nivel: number): ProblemaDecimal {
  switch (banda(nivel)) {
    case 0: {
      const p = azar([10, 20, 25, 50, 75, 100]);
      return porcentajeDe(p, baseExacta(p, 200));
    }
    case 1: {
      const p = randomInt(1, 19) * 5;
      return porcentajeDe(p, randomInt(1, 20) * 20);
    }
    case 2:
      return Math.random() < 0.6 ? porcentajeDe(randomInt(1, 99), randomInt(1, 9) * 100) : quePorcentaje();
    case 3:
      return azar([
        () => aumentoODescuento(400),
        () => {
          const p = azar([12.5, 37.5, 62.5, 87.5, 120, 125, 150, 175, 250]);
          return porcentajeDe(p, baseExacta(p, 400));
        },
        () => quePorcentaje(),
      ])();
    default:
      return azar([
        () => porcentajeInverso(),
        () => cambiosSucesivos(),
        () => {
          // Resultado con decimales (a lo sumo 2): «15 % de 42 = 6,3».
          const p = randomInt(1, 19) * 5;
          return porcentajeDe(p, baseExacta(p, 300, 2));
        },
        () => aumentoODescuento(1000),
      ])();
  }
}

// ---------- redondear ----------

// Número positivo dado como entero `n` con `d` cifras decimales (n = 12345, d = 3 → 12,345).
function textoFijo(n: number, d: number): string {
  if (d <= 0) return String(n);
  const escala = 10 ** d;
  return `${Math.floor(n / escala)},${String(n % escala).padStart(d, "0")}`;
}

const NOMBRE_POSICION: Record<number, string> = { [-3]: "al millar", [-2]: "a la centena", [-1]: "a la decena", 0: "al entero", 1: "a 1 decimal", 2: "a 2 decimales", 3: "a 3 decimales" };

// Redondea el número n·10^(−d) a k decimales (k < d; k negativo = decenas, centenas…).
function redondearNumero(entero: number, d: number, k: number, forzarAcarreo: boolean): ProblemaDecimal {
  const cifras = Array.from({ length: d }, () => randomInt(0, 9));
  if (d > 0) cifras[d - 1] = randomInt(1, 9); // la última cifra nunca es 0
  // Acarreo en cascada: …9|≥5 → sube varias posiciones (3,996 → 4,00).
  if (forzarAcarreo && k >= 0 && k < d) {
    cifras[k] = randomInt(5, 9);
    for (let i = k - 1; i >= Math.max(0, k - 2); i--) cifras[i] = 9;
  }
  const n = Number(`${entero}${cifras.join("")}`);
  const salto = 10 ** (d - k); // unidades de la última cifra que se quedan
  const r = Math.floor((n + salto / 2) / salto) * salto; // mitad hacia arriba, con enteros
  const respuesta = r / 10 ** d;
  const siguiente = k < 0 ? Number(String(entero).padStart(-k + 1, "0").slice(k)[0]) : cifras[k];
  return problema("redondear", `Redondea ${textoFijo(n, d)} ${NOMBRE_POSICION[k]}`, respuesta, [
    `Mira la cifra que viene justo después de la posición pedida: es ${siguiente}`,
    siguiente >= 5 ? `Es 5 o más: la cifra anterior sube uno (y si es 9, se lleva)` : `Es menor que 5: la cifra anterior queda igual`,
    `Queda ${k > 0 ? textoFijo(r / 10 ** (d - k), k) : dec(respuesta)}`,
  ]);
}

function generarRedondear(nivel: number): ProblemaDecimal {
  const b = banda(nivel);
  switch (b) {
    case 0:
      return redondearNumero(randomInt(0, 20), 2, azar([0, 1]), false);
    case 1:
      return redondearNumero(randomInt(0, 50), 3, azar([0, 1, 1]), false);
    case 2:
      return redondearNumero(randomInt(0, 100), azar([3, 4]), 2, Math.random() < 0.25);
    case 3:
      return Math.random() < 0.25
        ? redondearNumero(randomInt(100, 9999), 0, azar([-1, -2]), false)
        : redondearNumero(randomInt(0, 200), 4, azar([2, 3]), Math.random() < 0.4);
    default:
      return Math.random() < 0.25
        ? redondearNumero(randomInt(1000, 99999), 0, azar([-2, -3]), false)
        : redondearNumero(randomInt(0, 999), azar([4, 5]), azar([1, 2, 3]), Math.random() < 0.5);
  }
}

const GENERADORES: Record<TipoDecimal, (nivel: number) => ProblemaDecimal> = {
  convertir: generarConvertir,
  porcentaje: generarPorcentaje,
  redondear: generarRedondear,
};

export const TIPOS_DECIMAL: TipoDecimal[] = ["convertir", "porcentaje", "redondear"];

// Fase 2 ("Practicar" estandarizado): calibración propia por sub-tema
// (nivelPorTipo), mismo criterio que fracciones.ts/algebra.ts.
export function generarProblemaDecimal(
  nivelPorTipo: Record<TipoDecimal, number>,
  tipos: TipoDecimal[] = TIPOS_DECIMAL
): ProblemaDecimal {
  const disponibles = tipos.length > 0 ? tipos : TIPOS_DECIMAL;
  const tipo = disponibles[Math.floor(Math.random() * disponibles.length)];
  return GENERADORES[tipo](nivelPorTipo[tipo] ?? 1);
}
