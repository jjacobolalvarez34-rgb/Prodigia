// Cálculos puros de los visuales del curso completo de Numeria (pedido del
// usuario, 2026-10-06: "literal es dar un curso de matemáticas completo" —
// fracciones con todos sus métodos, decimales y porcentajes, potencias y raíces,
// álgebra básica y geometría básica). Mismo criterio que visualesDatos.ts: los
// componentes (web y app) solo dibujan lo que estas funciones calculan, y
// cursoDatos.test.ts recalcula cada resultado con aritmética independiente.
import { mcd } from "./visualesDatos";

// Un paso del pizarrón: la fórmula (LaTeX sin $) y la explicación corta.
export interface PasoCurso {
  tex: string;
  nota: string;
}

export function mcmLista(nums: number[]): number {
  return nums.reduce((acc, n) => (acc * Math.abs(n)) / (mcd(acc, n) || 1), 1);
}

export const fr = (n: number, d: number) => (d === 1 ? `${n}` : n < 0 ? `-\\frac{${-n}}{${d}}` : `\\frac{${n}}{${d}}`);
const signo = (op: "suma" | "resta") => (op === "suma" ? "+" : "-");

// Simplifica n/d (con d > 0). Devuelve también el divisor usado.
export function reducir(n: number, d: number): { n: number; d: number; k: number } {
  const k = mcd(n, d) || 1;
  return { n: n / k, d: d / k, k };
}

// Agrega el paso "simplifica" si hace falta.
function pasoSimplificar(pasos: PasoCurso[], n: number, d: number): [number, number] {
  const r = reducir(n, d);
  if (r.k > 1) pasos.push({ tex: `${fr(n, d)} = ${fr(r.n, r.d)}`, nota: `Simplifica: divide arriba y abajo entre ${r.k}.` });
  return [r.n, r.d];
}

// ============================================================
// Fracciones: todos los métodos
// ============================================================

export type ModoFraccion = "amplificar" | "simplificar" | "mixto" | "igualDen" | "carita" | "mcmVarias" | "multiplicar" | "cruz" | "oreja";

export interface EntradaFraccion {
  modo: ModoFraccion;
  fracciones: [number, number][];
  operacion?: "suma" | "resta";
  factor?: number;
}

export interface DatosMetodoFraccion {
  modo: ModoFraccion;
  fracciones: [number, number][];
  pasos: PasoCurso[];
  resultado: [number, number];
  // Productos que dibujan las flechas (carita, cruz, oreja, multiplicar).
  productos: number[];
  // mcmVarias: el MCM y el factor de cada fracción. amplificar: el factor.
  mcm?: number;
  factores?: number[];
  // mixto: parte entera y resto.
  entero?: number;
  resto?: number;
}

export function metodoFraccion(e: EntradaFraccion): DatosMetodoFraccion | null {
  const fs = e.fracciones;
  if (!Array.isArray(fs) || fs.length === 0 || fs.some((f) => !Array.isArray(f) || f.length !== 2 || !Number.isInteger(f[0]) || !Number.isInteger(f[1]) || f[1] <= 0)) return null;
  const op = e.operacion ?? "suma";
  const pasos: PasoCurso[] = [];
  const [a, b] = fs[0];
  const [c, d] = fs[1] ?? [0, 1];

  switch (e.modo) {
    case "amplificar": {
      const k = e.factor && Number.isInteger(e.factor) && e.factor > 1 ? e.factor : 2;
      pasos.push({ tex: fr(a, b), nota: `${a} de ${b} partes iguales.` });
      pasos.push({ tex: `\\frac{${a} \\times ${k}}{${b} \\times ${k}}`, nota: `Multiplica arriba y abajo por el mismo número (${k}).` });
      pasos.push({ tex: `${fr(a, b)} = ${fr(a * k, b * k)}`, nota: "Es la misma cantidad, partida en piezas más chicas: son fracciones equivalentes." });
      return { modo: e.modo, fracciones: fs, pasos, resultado: [a * k, b * k], productos: [a * k, b * k], factores: [k] };
    }
    case "simplificar": {
      const r = reducir(a, b);
      pasos.push({ tex: fr(a, b), nota: "Busca el número más grande que divide a los dos (el MCD)." });
      pasos.push({ tex: `\\text{MCD}(${a}, ${b}) = ${r.k}`, nota: `${r.k} divide exacto a ${a} y a ${b}.` });
      pasos.push({ tex: `\\frac{${a} \\div ${r.k}}{${b} \\div ${r.k}} = ${fr(r.n, r.d)}`, nota: "Divide arriba y abajo: la fracción queda irreducible." });
      return { modo: e.modo, fracciones: fs, pasos, resultado: [r.n, r.d], productos: [], factores: [r.k] };
    }
    case "mixto": {
      const entero = Math.floor(a / b);
      const resto = a % b;
      pasos.push({ tex: fr(a, b), nota: `El numerador es más grande que el denominador: hay más de un entero.` });
      pasos.push({ tex: `${a} \\div ${b} = ${entero} \\text{ resto } ${resto}`, nota: `Caben ${entero} enteros y sobran ${resto} partes.` });
      pasos.push({ tex: `${fr(a, b)} = ${entero}${resto ? fr(resto, b) : ""}`, nota: "El cociente es la parte entera y el resto queda sobre el mismo denominador." });
      pasos.push({ tex: `${entero}${resto ? fr(resto, b) : ""} = \\frac{${entero} \\times ${b} + ${resto}}{${b}} = ${fr(a, b)}`, nota: "Y de vuelta: entero por denominador, más el numerador." });
      return { modo: e.modo, fracciones: fs, pasos, resultado: [a, b], productos: [], entero, resto };
    }
    case "igualDen": {
      if (d !== b) return null;
      const n = op === "suma" ? a + c : a - c;
      pasos.push({ tex: `${fr(a, b)} ${signo(op)} ${fr(c, d)}`, nota: "Las dos tienen el mismo denominador: las piezas son del mismo tamaño." });
      pasos.push({ tex: `\\frac{${a} ${signo(op)} ${c}}{${b}} = ${fr(n, b)}`, nota: `${op === "suma" ? "Suma" : "Resta"} solo los numeradores; el denominador se queda igual.` });
      const res = pasoSimplificar(pasos, n, b);
      return { modo: e.modo, fracciones: fs, pasos, resultado: res, productos: [n] };
    }
    case "carita": {
      const ojo1 = a * d;
      const ojo2 = b * c;
      const boca = b * d;
      const n = op === "suma" ? ojo1 + ojo2 : ojo1 - ojo2;
      pasos.push({ tex: `${fr(a, b)} ${signo(op)} ${fr(c, d)}`, nota: "Distinto denominador: dibuja una carita feliz." });
      pasos.push({ tex: `${a} \\times ${d} = ${ojo1}`, nota: "Primer ojo: el numerador de la primera por el denominador de la segunda." });
      pasos.push({ tex: `${b} \\times ${c} = ${ojo2}`, nota: "Segundo ojo: el denominador de la primera por el numerador de la segunda." });
      pasos.push({ tex: `${b} \\times ${d} = ${boca}`, nota: "La sonrisa: multiplica los dos denominadores." });
      pasos.push({ tex: `\\frac{${ojo1} ${signo(op)} ${ojo2}}{${boca}} = ${fr(n, boca)}`, nota: `Arriba ${op === "suma" ? "sumas" : "restas"} los ojos; abajo va la sonrisa.` });
      const res = pasoSimplificar(pasos, n, boca);
      return { modo: e.modo, fracciones: fs, pasos, resultado: res, productos: [ojo1, ojo2, boca] };
    }
    case "mcmVarias": {
      const dens = fs.map((f) => f[1]);
      const m = mcmLista(dens);
      const factores = dens.map((x) => m / x);
      const nums = fs.map((f, i) => f[0] * factores[i]);
      const n = nums.slice(1).reduce((acc, x) => (op === "suma" ? acc + x : acc - x), nums[0]);
      const s = ` ${signo(op)} `;
      pasos.push({ tex: fs.map((f) => fr(f[0], f[1])).join(s), nota: `Denominadores: ${dens.join(", ")}.` });
      pasos.push({ tex: `\\text{MCM}(${dens.join(", ")}) = ${m}`, nota: "El MCM es el denominador común más chico posible." });
      pasos.push({ tex: fs.map((f, i) => `\\frac{${f[0]} \\times ${factores[i]}}{${f[1]} \\times ${factores[i]}}`).join(s), nota: "Cada fracción se amplifica por lo que le falta para llegar al MCM." });
      pasos.push({ tex: `${nums.map((x) => fr(x, m)).join(s)} = ${fr(n, m)}`, nota: "Con el mismo denominador, opera solo los numeradores." });
      const res = pasoSimplificar(pasos, n, m);
      return { modo: e.modo, fracciones: fs, pasos, resultado: res, productos: nums, mcm: m, factores };
    }
    case "multiplicar": {
      // Simplificar en cruz antes de multiplicar.
      const k1 = mcd(a, d) || 1;
      const k2 = mcd(c, b) || 1;
      const a2 = a / k1;
      const d2 = d / k1;
      const c2 = c / k2;
      const b2 = b / k2;
      pasos.push({ tex: `${fr(a, b)} \\times ${fr(c, d)}`, nota: "Para multiplicar no hace falta denominador común." });
      if (k1 > 1 || k2 > 1) {
        pasos.push({ tex: `${fr(a2, b2)} \\times ${fr(c2, d2)}`, nota: `Antes, simplifica en cruz: ${k1 > 1 ? `${a} y ${d} entre ${k1}` : ""}${k1 > 1 && k2 > 1 ? "; " : ""}${k2 > 1 ? `${c} y ${b} entre ${k2}` : ""}. Así los números quedan chicos.` });
      }
      const n = a2 * c2;
      const den = b2 * d2;
      pasos.push({ tex: `\\frac{${a2} \\times ${c2}}{${b2} \\times ${d2}} = ${fr(n, den)}`, nota: "Numerador por numerador y denominador por denominador." });
      const res = pasoSimplificar(pasos, n, den);
      return { modo: e.modo, fracciones: fs, pasos, resultado: res, productos: [n, den], factores: [k1, k2] };
    }
    case "cruz": {
      const n = a * d;
      const den = b * c;
      if (c === 0) return null;
      pasos.push({ tex: `${fr(a, b)} \\div ${fr(c, d)}`, nota: "Para dividir en cruz, dibuja una X entre las dos fracciones." });
      pasos.push({ tex: `${a} \\times ${d} = ${n}`, nota: "Numerador de la primera por denominador de la segunda: va arriba." });
      pasos.push({ tex: `${b} \\times ${c} = ${den}`, nota: "Denominador de la primera por numerador de la segunda: va abajo." });
      pasos.push({ tex: `${fr(a, b)} \\div ${fr(c, d)} = ${fr(n, den)}`, nota: "Es lo mismo que multiplicar por la fracción dada vuelta." });
      const res = pasoSimplificar(pasos, n, den);
      return { modo: e.modo, fracciones: fs, pasos, resultado: res, productos: [n, den] };
    }
    case "oreja": {
      const n = a * d;
      const den = b * c;
      if (c === 0) return null;
      pasos.push({ tex: `\\dfrac{${fr(a, b)}}{${fr(c, d)}}`, nota: "Una fracción encima de otra: usa la regla de la oreja (extremos y medios)." });
      pasos.push({ tex: `${a} \\times ${d} = ${n}`, nota: "La oreja grande une los extremos (el de más arriba y el de más abajo): va arriba." });
      pasos.push({ tex: `${b} \\times ${c} = ${den}`, nota: "La oreja chica une los medios (los dos del centro): va abajo." });
      pasos.push({ tex: `\\dfrac{${fr(a, b)}}{${fr(c, d)}} = ${fr(n, den)}`, nota: "Extremos sobre medios." });
      const res = pasoSimplificar(pasos, n, den);
      return { modo: e.modo, fracciones: fs, pasos, resultado: res, productos: [n, den] };
    }
  }
  return null;
}

// ============================================================
// Decimales
// ============================================================

// Cantidad de decimales de un número escrito en texto ("3.47" → 2).
export function cantidadDecimales(s: string): number {
  const i = s.indexOf(".");
  return i < 0 ? 0 : s.length - i - 1;
}

// "3.47" → { entero: 347, decimales: 2 } (todo con enteros: sin errores de coma flotante).
export function aEntero(s: string, decimales = cantidadDecimales(s)): number {
  const neg = s.startsWith("-");
  const limpio = neg ? s.slice(1) : s;
  const [e, f = ""] = limpio.split(".");
  const v = Number(e + f.padEnd(decimales, "0"));
  return neg ? -v : v;
}

// 3472, 3 decimales → "3,472" (con coma).
export function deEntero(v: number, decimales: number, sep = ","): string {
  const neg = v < 0;
  const s = String(Math.abs(v)).padStart(decimales + 1, "0");
  const txt = decimales > 0 ? `${s.slice(0, s.length - decimales)}${sep}${s.slice(s.length - decimales)}` : s;
  return neg ? `-${txt}` : txt;
}

export const coma = (s: string) => s.replace(".", ",");

const NOMBRES_POSICION: Record<number, string> = { 2: "centenas", 1: "decenas", 0: "unidades", [-1]: "décimos", [-2]: "centésimos", [-3]: "milésimos", [-4]: "diezmilésimos" };

export interface CeldaPosicional {
  posicion: number;
  nombre: string;
  digito: number;
  valor: string;
}

export type ModoDecimal = "posicional" | "sumaResta" | "multiplicar" | "fraccionADecimal";

export interface EntradaDecimal {
  modo: ModoDecimal;
  a?: string;
  b?: string;
  operacion?: "suma" | "resta";
  num?: number;
  den?: number;
}

export interface DatosDecimal {
  modo: ModoDecimal;
  pasos: PasoCurso[];
  // posicional: las celdas de la tabla. sumaResta/multiplicar: las filas alineadas.
  celdas?: CeldaPosicional[];
  filas?: string[];
  resultado: string;
  // fraccionADecimal: dígitos del cociente y si se repiten.
  periodico?: boolean;
}

export function decimal(e: EntradaDecimal): DatosDecimal | null {
  const pasos: PasoCurso[] = [];
  if (e.modo === "posicional") {
    const s = e.a ?? "";
    if (!/^\d+(\.\d+)?$/.test(s)) return null;
    const [ent, frac = ""] = s.split(".");
    const celdas: CeldaPosicional[] = [];
    ent.split("").forEach((dg, i) => {
      const pos = ent.length - 1 - i;
      celdas.push({ posicion: pos, nombre: NOMBRES_POSICION[pos] ?? `10^${pos}`, digito: Number(dg), valor: String(Number(dg) * 10 ** pos) });
    });
    frac.split("").forEach((dg, i) => {
      const pos = -(i + 1);
      celdas.push({ posicion: pos, nombre: NOMBRES_POSICION[pos] ?? `10^${pos}`, digito: Number(dg), valor: deEntero(Number(dg), i + 1) });
    });
    for (const c of celdas) {
      if (c.posicion >= 0) pasos.push({ tex: `${c.digito} \\text{ ${c.nombre}} = ${c.valor}`, nota: `El ${c.digito} está en las ${c.nombre}.` });
      else pasos.push({ tex: `${c.digito} \\text{ ${c.nombre}} = ${fr(c.digito, 10 ** -c.posicion)} = ${c.valor}`, nota: `Después de la coma, cada lugar vale diez veces menos: ${c.nombre}.` });
    }
    pasos.push({ tex: `${celdas.map((c) => c.valor).join(" + ")} = ${coma(s)}`, nota: "Sumando cada lugar se arma el número." });
    return { modo: e.modo, pasos, celdas, resultado: coma(s) };
  }
  if (e.modo === "sumaResta") {
    const a = e.a ?? "";
    const b = e.b ?? "";
    const op = e.operacion ?? "suma";
    if (!/^\d+(\.\d+)?$/.test(a) || !/^\d+(\.\d+)?$/.test(b)) return null;
    const dec = Math.max(cantidadDecimales(a), cantidadDecimales(b));
    const va = aEntero(a, dec);
    const vb = aEntero(b, dec);
    const r = op === "suma" ? va + vb : va - vb;
    const fa = deEntero(va, dec);
    const fb = deEntero(vb, dec);
    pasos.push({ tex: `${coma(a)} ${signo(op)} ${coma(b)}`, nota: "Escribe uno debajo del otro con las comas alineadas." });
    if (fa !== coma(a) || fb !== coma(b)) pasos.push({ tex: `${fa} ${signo(op)} ${fb}`, nota: "Completa con ceros para que los dos tengan los mismos decimales." });
    pasos.push({ tex: `${va} ${signo(op)} ${vb} = ${r}`, nota: "Opera como si no hubiera coma." });
    pasos.push({ tex: `${fa} ${signo(op)} ${fb} = ${deEntero(r, dec)}`, nota: "La coma del resultado baja en el mismo lugar." });
    return { modo: e.modo, pasos, filas: [fa, fb], resultado: deEntero(r, dec) };
  }
  if (e.modo === "multiplicar") {
    const a = e.a ?? "";
    const b = e.b ?? "";
    if (!/^\d+(\.\d+)?$/.test(a) || !/^\d+(\.\d+)?$/.test(b)) return null;
    const da = cantidadDecimales(a);
    const db = cantidadDecimales(b);
    const va = aEntero(a);
    const vb = aEntero(b);
    const r = va * vb;
    pasos.push({ tex: `${coma(a)} \\times ${coma(b)}`, nota: "Para multiplicar no hace falta alinear las comas." });
    pasos.push({ tex: `${va} \\times ${vb} = ${r}`, nota: "Multiplica como si fueran enteros." });
    pasos.push({ tex: `${da} + ${db} = ${da + db} \\text{ decimales}`, nota: `Cuenta los decimales de los dos factores: ${da} y ${db}.` });
    pasos.push({ tex: `${coma(a)} \\times ${coma(b)} = ${deEntero(r, da + db)}`, nota: `Pon la coma dejando ${da + db} cifras a la derecha.` });
    return { modo: e.modo, pasos, filas: [coma(a), coma(b)], resultado: deEntero(r, da + db) };
  }
  if (e.modo === "fraccionADecimal") {
    const num = e.num ?? 0;
    const den = e.den ?? 0;
    if (!Number.isInteger(num) || !Number.isInteger(den) || den <= 0 || num < 0) return null;
    const entero = Math.floor(num / den);
    let resto = num % den;
    const digitos: number[] = [];
    const vistos = new Map<number, number>();
    let periodico = false;
    pasos.push({ tex: `${fr(num, den)} = ${num} \\div ${den}`, nota: "La raya de fracción es una división." });
    while (resto !== 0 && digitos.length < 6) {
      if (vistos.has(resto)) {
        periodico = true;
        break;
      }
      vistos.set(resto, digitos.length);
      const q = Math.floor((resto * 10) / den);
      pasos.push({ tex: `${resto * 10} \\div ${den} = ${q} \\text{ resto } ${(resto * 10) % den}`, nota: digitos.length === 0 ? "Agrega un cero al resto y sigue dividiendo: ya estás después de la coma." : "Otra vez: baja un cero." });
      digitos.push(q);
      resto = (resto * 10) % den;
    }
    if (resto !== 0 && !periodico && vistos.has(resto)) periodico = true;
    const txt = `${entero}${digitos.length ? "," + digitos.join("") : ""}${periodico ? "…" : ""}`;
    pasos.push({ tex: `${fr(num, den)} = ${txt}`, nota: periodico ? "El resto se repite: la división no termina nunca (decimal periódico)." : "El resto llegó a cero: el decimal es exacto." });
    return { modo: e.modo, pasos, resultado: txt, periodico };
  }
  return null;
}

// ============================================================
// Porcentajes
// ============================================================

export type ModoPorcentaje = "cuadricula" | "de" | "cambio";

export interface EntradaPorcentaje {
  modo: ModoPorcentaje;
  porcentaje: number;
  base?: number;
  tipo?: "aumento" | "descuento";
}

export interface DatosPorcentaje {
  modo: ModoPorcentaje;
  porcentaje: number;
  base: number;
  pasos: PasoCurso[];
  resultado: number;
  parte: number;
}

const num = (v: number) => String(Math.round(v * 1000) / 1000).replace(".", ",");

export function porcentaje(e: EntradaPorcentaje): DatosPorcentaje | null {
  const p = e.porcentaje;
  if (!Number.isFinite(p) || p < 0 || p > 100) return null;
  const pasos: PasoCurso[] = [];
  if (e.modo === "cuadricula") {
    pasos.push({ tex: `${p}\\%`, nota: `"Por ciento" quiere decir "de cada 100": ${p} de cada 100.` });
    pasos.push({ tex: `${p}\\% = ${fr(p, 100)}`, nota: "Un porcentaje es una fracción con denominador 100." });
    pasos.push({ tex: `${fr(p, 100)} = ${num(p / 100)}`, nota: "Y también un decimal: divide entre 100 (la coma corre dos lugares)." });
    return { modo: e.modo, porcentaje: p, base: 100, pasos, resultado: p / 100, parte: p };
  }
  const base = e.base ?? 0;
  if (!Number.isFinite(base) || base <= 0) return null;
  const parte = (p * base) / 100;
  if (e.modo === "de") {
    const decenas = Math.floor(p / 10);
    const unidades = p % 10;
    pasos.push({ tex: `${p}\\% \\text{ de } ${base}`, nota: "Truco: arma el porcentaje con 10 % y 1 %." });
    pasos.push({ tex: `10\\% \\text{ de } ${base} = ${num(base / 10)}`, nota: "El 10 % es dividir entre 10." });
    pasos.push({ tex: `1\\% \\text{ de } ${base} = ${num(base / 100)}`, nota: "El 1 % es dividir entre 100." });
    pasos.push({ tex: `${p}\\% = ${decenas} \\times 10\\% + ${unidades} \\times 1\\% = ${num((decenas * base) / 10)} + ${num((unidades * base) / 100)}`, nota: `${p} % son ${decenas} veces el 10 % y ${unidades} veces el 1 %.` });
    pasos.push({ tex: `${p}\\% \\text{ de } ${base} = ${num(parte)}`, nota: `También: ${base} × ${p} ÷ 100.` });
    return { modo: e.modo, porcentaje: p, base, pasos, resultado: parte, parte };
  }
  const aumento = (e.tipo ?? "aumento") === "aumento";
  const final = aumento ? base + parte : base - parte;
  pasos.push({ tex: `${base} ${aumento ? "+" : "-"} ${p}\\%`, nota: aumento ? "Un aumento suma una parte del precio." : "Un descuento resta una parte del precio." });
  pasos.push({ tex: `${p}\\% \\text{ de } ${base} = ${num(parte)}`, nota: "Primero calcula cuánto es ese porcentaje." });
  pasos.push({ tex: `${base} ${aumento ? "+" : "-"} ${num(parte)} = ${num(final)}`, nota: aumento ? "Súmalo al precio." : "Réstalo del precio." });
  pasos.push({ tex: `${base} \\times ${num(aumento ? (100 + p) / 100 : (100 - p) / 100)} = ${num(final)}`, nota: `Atajo: pagar el ${aumento ? 100 + p : 100 - p} % es multiplicar por ${num(aumento ? (100 + p) / 100 : (100 - p) / 100)}.` });
  return { modo: e.modo, porcentaje: p, base, pasos, resultado: final, parte };
}

// ============================================================
// Potencias: leyes de los exponentes
// ============================================================

export type LeyExponente = "producto" | "cociente" | "potencia" | "cero";

export interface DatosExponentes {
  ley: LeyExponente;
  base: number;
  m: number;
  n: number;
  // Fichas de factores (cada una es la base) por grupo, para dibujarlas.
  grupos: number[];
  exponenteFinal: number;
  pasos: PasoCurso[];
}

export function exponentes(ley: LeyExponente, base: number, m: number, n: number): DatosExponentes | null {
  if (![base, m, n].every(Number.isInteger) || base < 2 || m < 0 || n < 0 || m > 8 || n > 8) return null;
  const pasos: PasoCurso[] = [];
  const pot = (e: number) => `${base}^{${e}}`;
  const factores = (k: number) => Array.from({ length: k }, () => String(base)).join(" \\cdot ");
  if (ley === "producto") {
    pasos.push({ tex: `${pot(m)} \\cdot ${pot(n)}`, nota: "Dos potencias con la misma base que se multiplican." });
    pasos.push({ tex: `(${factores(m)}) \\cdot (${factores(n)})`, nota: `${m} veces el ${base} y después ${n} veces más.` });
    pasos.push({ tex: `${pot(m)} \\cdot ${pot(n)} = ${pot(m + n)}`, nota: "En total hay m + n factores: los exponentes se suman." });
    return { ley, base, m, n, grupos: [m, n], exponenteFinal: m + n, pasos };
  }
  if (ley === "cociente") {
    if (n > m) return null;
    pasos.push({ tex: `\\frac{${pot(m)}}{${pot(n)}}`, nota: "Dos potencias con la misma base que se dividen." });
    pasos.push({ tex: `\\frac{${factores(m)}}{${factores(n)}}`, nota: `Cada ${base} de abajo se tacha con uno de arriba.` });
    pasos.push({ tex: `\\frac{${pot(m)}}{${pot(n)}} = ${pot(m - n)}`, nota: "Quedan m − n factores: los exponentes se restan." });
    return { ley, base, m, n, grupos: [m, n], exponenteFinal: m - n, pasos };
  }
  if (ley === "potencia") {
    pasos.push({ tex: `(${pot(m)})^{${n}}`, nota: `La potencia ${pot(m)} elevada a ${n}.` });
    pasos.push({ tex: Array.from({ length: n }, () => pot(m)).join(" \\cdot "), nota: `Es ${n} veces ${pot(m)}: ${n} grupos de ${m} factores.` });
    pasos.push({ tex: `(${pot(m)})^{${n}} = ${base}^{${m} \\cdot ${n}} = ${pot(m * n)}`, nota: "Los exponentes se multiplican." });
    return { ley, base, m, n, grupos: Array.from({ length: n }, () => m), exponenteFinal: m * n, pasos };
  }
  pasos.push({ tex: `\\frac{${pot(m)}}{${pot(m)}} = 1`, nota: "Cualquier número dividido por sí mismo da 1." });
  pasos.push({ tex: `\\frac{${pot(m)}}{${pot(m)}} = ${pot(0)}`, nota: "Con la ley del cociente: m − m = 0." });
  pasos.push({ tex: `${pot(0)} = 1`, nota: "Por eso cualquier base (menos el 0) elevada a 0 vale 1." });
  return { ley, base, m, n: m, grupos: [m, m], exponenteFinal: 0, pasos };
}

// ============================================================
// Raíz cuadrada (exacta o estimada entre dos cuadrados)
// ============================================================

export interface DatosRaiz {
  n: number;
  exacta: boolean;
  abajo: number;
  arriba: number;
  estimado: number;
  pasos: PasoCurso[];
}

export function raiz(n: number): DatosRaiz | null {
  if (!Number.isInteger(n) || n < 1 || n > 400) return null;
  const abajo = Math.floor(Math.sqrt(n));
  const exacta = abajo * abajo === n;
  const arriba = exacta ? abajo : abajo + 1;
  const pasos: PasoCurso[] = [];
  if (exacta) {
    pasos.push({ tex: `\\sqrt{${n}}`, nota: `¿Qué número multiplicado por sí mismo da ${n}?` });
    pasos.push({ tex: `${abajo} \\times ${abajo} = ${n}`, nota: `Un cuadrado de ${n} cuadritos tiene lados de ${abajo}.` });
    pasos.push({ tex: `\\sqrt{${n}} = ${abajo}`, nota: "La raíz cuadrada es el lado del cuadrado." });
    return { n, exacta, abajo, arriba, estimado: abajo, pasos };
  }
  const estimado = Math.round((abajo + (n - abajo * abajo) / (arriba * arriba - abajo * abajo)) * 10) / 10;
  pasos.push({ tex: `\\sqrt{${n}}`, nota: `${n} no es un cuadrado perfecto.` });
  pasos.push({ tex: `${abajo}^2 = ${abajo * abajo} < ${n} < ${arriba * arriba} = ${arriba}^2`, nota: "Busca los dos cuadrados perfectos entre los que está." });
  pasos.push({ tex: `${abajo} < \\sqrt{${n}} < ${arriba}`, nota: `Entonces la raíz está entre ${abajo} y ${arriba}.` });
  pasos.push({ tex: `\\sqrt{${n}} \\approx ${String(estimado).replace(".", ",")}`, nota: `${n} está más cerca de ${n - abajo * abajo < arriba * arriba - n ? abajo * abajo : arriba * arriba}: la raíz queda más cerca de ${n - abajo * abajo < arriba * arriba - n ? abajo : arriba}.` });
  return { n, exacta, abajo, arriba, estimado, pasos };
}

// ============================================================
// Álgebra: términos semejantes, distributiva, ecuaciones
// ============================================================

export interface Termino {
  coef: number;
  // "" = término numérico (constante).
  var: string;
}

export function terminoTex(t: Termino, primero: boolean): string {
  const s = t.coef < 0 ? "-" : primero ? "" : "+";
  const abs = Math.abs(t.coef);
  const cuerpo = t.var ? `${abs === 1 ? "" : abs}${t.var}` : String(abs);
  return primero ? `${s}${cuerpo}` : ` ${s} ${cuerpo}`;
}

export function expresionTex(ts: Termino[]): string {
  const sin = ts.filter((t) => t.coef !== 0);
  return sin.length ? sin.map((t, i) => terminoTex(t, i === 0)).join("") : "0";
}

export interface DatosTerminos {
  terminos: Termino[];
  grupos: { var: string; terminos: Termino[]; total: number }[];
  resultado: Termino[];
  pasos: PasoCurso[];
}

export function terminosSemejantes(terminos: Termino[]): DatosTerminos | null {
  if (!Array.isArray(terminos) || terminos.length < 2 || terminos.some((t) => !Number.isInteger(t.coef) || typeof t.var !== "string")) return null;
  const orden: string[] = [];
  for (const t of terminos) if (!orden.includes(t.var)) orden.push(t.var);
  orden.sort((x, y) => (x === "" ? 1 : y === "" ? -1 : x.localeCompare(y)));
  const grupos = orden.map((v) => {
    const ts = terminos.filter((t) => t.var === v);
    return { var: v, terminos: ts, total: ts.reduce((a, t) => a + t.coef, 0) };
  });
  const resultado = grupos.map((g) => ({ coef: g.total, var: g.var }));
  const pasos: PasoCurso[] = [
    { tex: expresionTex(terminos), nota: "Términos semejantes: los que tienen la misma letra (o ninguna)." },
    ...grupos.map((g) => ({
      tex: `${expresionTex(g.terminos)} = ${expresionTex([{ coef: g.total, var: g.var }])}`,
      nota: g.var ? `Junta los términos con ${g.var}: suma sus coeficientes.` : "Junta los números solos.",
    })),
    { tex: `${expresionTex(terminos)} = ${expresionTex(resultado)}`, nota: "La expresión queda reducida." },
  ];
  return { terminos, grupos, resultado, pasos };
}

export interface DatosDistributiva {
  factor: number;
  sumandos: Termino[];
  productos: Termino[];
  pasos: PasoCurso[];
}

export function distributiva(factor: number, sumandos: Termino[]): DatosDistributiva | null {
  if (!Number.isInteger(factor) || factor === 0 || !Array.isArray(sumandos) || sumandos.length < 2 || sumandos.length > 3) return null;
  const productos = sumandos.map((t) => ({ coef: t.coef * factor, var: t.var }));
  const pasos: PasoCurso[] = [
    { tex: `${factor}(${expresionTex(sumandos)})`, nota: "El número de afuera multiplica a todo lo de adentro." },
    { tex: sumandos.map((t, i) => `${i ? " + " : ""}${factor} \\cdot ${t.coef < 0 ? `(${terminoTex(t, true)})` : terminoTex(t, true)}`).join(""), nota: "Reparte la multiplicación: cada término del paréntesis por el de afuera." },
    { tex: `${factor}(${expresionTex(sumandos)}) = ${expresionTex(productos)}`, nota: "Es el área de un rectángulo partido en pedazos." },
  ];
  return { factor, sumandos, productos, pasos };
}

export interface DatosEcuacion {
  a: number;
  b: number;
  c: number;
  d: number;
  // Cada etapa: lado izquierdo y derecho como términos.
  etapas: { izq: Termino[]; der: Termino[]; nota: string }[];
  x: number;
}

// a·x + b = c·x + d (c puede ser 0: ecuación de dos pasos).
export function ecuacion(a: number, b: number, c: number, d: number): DatosEcuacion | null {
  if (![a, b, c, d].every(Number.isInteger) || a === c) return null;
  const x = (d - b) / (a - c);
  if (!Number.isInteger(x)) return null;
  const etapas: DatosEcuacion["etapas"] = [{ izq: [{ coef: a, var: "x" }, { coef: b, var: "" }], der: [{ coef: c, var: "x" }, { coef: d, var: "" }], nota: "La balanza está equilibrada: los dos lados valen lo mismo." }];
  if (c !== 0) {
    etapas.push({ izq: [{ coef: a - c, var: "x" }, { coef: b, var: "" }], der: [{ coef: d, var: "" }], nota: `Quita ${expresionTex([{ coef: c, var: "x" }])} de los dos lados: las x quedan de un solo lado.` });
  }
  if (b !== 0) {
    etapas.push({ izq: [{ coef: a - c, var: "x" }], der: [{ coef: d - b, var: "" }], nota: `${b > 0 ? "Resta" : "Suma"} ${Math.abs(b)} a los dos lados: el número suelto se va.` });
  }
  if (a - c !== 1) {
    etapas.push({ izq: [{ coef: 1, var: "x" }], der: [{ coef: x, var: "" }], nota: `Divide los dos lados entre ${a - c}.` });
  }
  return { a, b, c, d, etapas, x };
}

// ============================================================
// Geometría
// ============================================================

export function rectangulo(ancho: number, alto: number) {
  return { ancho, alto, perimetro: 2 * (ancho + alto), area: ancho * alto };
}

export function areaTriangulo(base: number, altura: number) {
  return { base, altura, rectangulo: base * altura, area: (base * altura) / 2 };
}

export function sumaAngulos(a: number, b: number) {
  return { a, b, c: 180 - a - b };
}

export function volumen(largo: number, ancho: number, alto: number) {
  return { largo, ancho, alto, capa: largo * ancho, volumen: largo * ancho * alto };
}

export function pitagorasCuadrados(c1: number, c2: number) {
  const h2 = c1 * c1 + c2 * c2;
  return { c1, c2, a1: c1 * c1, a2: c2 * c2, h2, h: Math.sqrt(h2) };
}
