import type { Problem } from "./problems";
import type { ProblemaFraccion } from "./fracciones";

// Repaso de errores (pedido 2026-10-12): al terminar una partida, cada pregunta fallada
// se puede tocar para ver qué contestaste, cuál era la respuesta y cómo se resuelve.
// Este archivo tiene la forma común de un error (web y app) y los pasos de las preguntas
// que se arman con números (aritmética y fracciones). Decimales, potencias, álgebra y
// geometría traen sus pasos desde su generador (campo `pasos`).
//
// Los pasos son texto plano con símbolos Unicode (×, ÷, −, ², √): se leen igual en la
// web y en la app sin pasar por LaTeX.

export interface FallaRepaso {
  // La pregunta como se mostró (puede traer $…$ de LaTeX: la pantalla lo dibuja).
  enunciado: string;
  formato?: "formulas" | "quimica";
  // Lo que contestó el jugador. null = se acabó el tiempo sin responder.
  tuRespuesta: string | null;
  correcta: string;
  // «Cómo se resuelve». Vacío si esa pregunta todavía no tiene paso a paso.
  pasos: string[];
}

// Cuántos errores se guardan por partida (una partida tiene 10 preguntas; los duelos
// largos y el reto semanal pueden tener más).
export const MAX_FALLAS_REPASO = 15;

const n = (x: number) => (x < 0 ? `−${Math.abs(x).toLocaleString("es")}` : x.toLocaleString("es"));
const entre = (x: number) => (x < 0 ? `(${n(x)})` : n(x));

// 4.738 → [4000, 700, 30, 8] (sin ceros).
function porPosicion(x: number): number[] {
  const partes: number[] = [];
  let pos = 1;
  let resto = Math.abs(Math.trunc(x));
  while (resto > 0) {
    const d = resto % 10;
    if (d) partes.unshift(d * pos);
    resto = Math.floor(resto / 10);
    pos *= 10;
  }
  return partes.length ? partes : [0];
}

function nombrePosicion(x: number): string {
  if (x >= 1000) return "los miles";
  if (x >= 100) return "las centenas";
  if (x >= 10) return "las decenas";
  return "las unidades";
}

function pasosSumaPositiva(a: number, b: number): string[] {
  if (a < 10 && b < 10) {
    if (a + b <= 10) return [`${n(a)} + ${n(b)} = ${n(a + b)}`];
    const falta = 10 - a;
    return [`Completa la decena: ${n(a)} + ${n(falta)} = 10`, `Te quedan ${n(b - falta)} por sumar: 10 + ${n(b - falta)} = ${n(a + b)}`];
  }
  const partes = porPosicion(b);
  if (partes.length === 1) return [`${n(a)} + ${n(b)} = ${n(a + b)}`];
  const pasos = [`Separa ${n(b)} en ${partes.map(n).join(" + ")}`];
  let acumulado = a;
  for (const p of partes) {
    pasos.push(`Suma ${nombrePosicion(p)}: ${n(acumulado)} + ${n(p)} = ${n(acumulado + p)}`);
    acumulado += p;
  }
  return pasos;
}

function pasosRestaPositiva(a: number, b: number): string[] {
  if (b > a) return [`Como ${n(b)} es mayor que ${n(a)}, el resultado es negativo: resta al revés y ponle el signo.`, ...pasosRestaPositiva(b, a), `Entonces ${n(a)} − ${n(b)} = ${n(a - b)}`];
  const partes = porPosicion(b);
  if (partes.length === 1) return [`${n(a)} − ${n(b)} = ${n(a - b)}`, `Comprueba: ${n(a - b)} + ${n(b)} = ${n(a)}`];
  const pasos = [`Separa ${n(b)} en ${partes.map(n).join(" + ")}`];
  let acumulado = a;
  for (const p of partes) {
    pasos.push(`Resta ${nombrePosicion(p)}: ${n(acumulado)} − ${n(p)} = ${n(acumulado - p)}`);
    acumulado -= p;
  }
  pasos.push(`Comprueba: ${n(a - b)} + ${n(b)} = ${n(a)}`);
  return pasos;
}

function pasosMultiplicacionPositiva(a: number, b: number): string[] {
  if (a < 10 && b < 10) return [`Es de la tabla del ${n(Math.max(a, b))}: ${n(a)} × ${n(b)} = ${n(a * b)}`];
  // Se separa el factor con más cifras y se multiplica cada parte por el otro.
  const [grande, otro] = a >= b ? [a, b] : [b, a];
  const partes = porPosicion(grande);
  if (partes.length === 1) {
    const ceros = String(grande).length - 1;
    const cifra = grande / 10 ** ceros;
    return [`${n(cifra)} × ${n(otro)} = ${n(cifra * otro)}`, `Agrega ${ceros === 1 ? "un cero" : `${ceros} ceros`}: ${n(grande)} × ${n(otro)} = ${n(grande * otro)}`];
  }
  const pasos = [`Separa ${n(grande)} en ${partes.map(n).join(" + ")} y multiplica cada parte por ${n(otro)}`];
  for (const p of partes) pasos.push(`${n(p)} × ${n(otro)} = ${n(p * otro)}`);
  pasos.push(`Suma los resultados: ${partes.map((p) => n(p * otro)).join(" + ")} = ${n(grande * otro)}`);
  return pasos;
}

function pasosDivisionPositiva(a: number, b: number): string[] {
  const c = a / b;
  if (!Number.isInteger(c)) return [`${n(a)} ÷ ${n(b)} = ${n(Math.round(c * 100) / 100)}`];
  if (c < 10) return [`Busca qué número por ${n(b)} da ${n(a)}`, `${n(b)} × ${n(c)} = ${n(a)}, así que ${n(a)} ÷ ${n(b)} = ${n(c)}`];
  const partes = porPosicion(c);
  const pasos = [`Busca qué número por ${n(b)} da ${n(a)}, por partes`];
  let resto = a;
  for (const p of partes) {
    pasos.push(`${n(b)} × ${n(p)} = ${n(b * p)}. Te quedan ${n(resto)} − ${n(b * p)} = ${n(resto - b * p)}`);
    resto -= b * p;
  }
  pasos.push(`Juntas ${partes.map(n).join(" + ")} = ${n(c)}`, `Comprueba: ${n(c)} × ${n(b)} = ${n(a)}`);
  return pasos;
}

function pasosOperacion(simbolo: Problem["symbol"], a: number, b: number): string[] {
  const resultado = simbolo === "+" ? a + b : simbolo === "−" ? a - b : simbolo === "×" ? a * b : a / b;
  if (simbolo === "+") {
    if (a >= 0 && b >= 0) return pasosSumaPositiva(a, b);
    if (a >= 0) return [`Sumar un negativo es restar: ${n(a)} + ${entre(b)} = ${n(a)} − ${n(-b)}`, ...pasosRestaPositiva(a, -b)];
    if (b >= 0) return [`Ordénalo: ${entre(a)} + ${n(b)} = ${n(b)} − ${n(-a)}`, ...pasosRestaPositiva(b, -a)];
    return [`Dos negativos: suma sin signos y el resultado es negativo`, ...pasosSumaPositiva(-a, -b), `Entonces ${entre(a)} + ${entre(b)} = ${n(resultado)}`];
  }
  if (simbolo === "−") {
    if (b < 0) return [`Restar un negativo es sumar: ${entre(a)} − ${entre(b)} = ${entre(a)} + ${n(-b)}`, ...pasosOperacion("+", a, -b)];
    if (a < 0) return [`Partes de un negativo y bajas más: suma sin signos y el resultado es negativo`, ...pasosSumaPositiva(-a, b), `Entonces ${entre(a)} − ${n(b)} = ${n(resultado)}`];
    return pasosRestaPositiva(a, b);
  }
  const negativo = (a < 0) !== (b < 0);
  const base = simbolo === "×" ? pasosMultiplicacionPositiva(Math.abs(a), Math.abs(b)) : pasosDivisionPositiva(Math.abs(a), Math.abs(b));
  if (a >= 0 && b >= 0) return base;
  return [`Primero sin signos:`, ...base, negativo ? `Los signos son distintos, así que el resultado es negativo: ${n(resultado)}` : `Los dos son negativos, así que el resultado es positivo: ${n(resultado)}`];
}

export function pasosAritmetica(p: Problem): string[] {
  if (!p.incognitaB) return pasosOperacion(p.symbol, p.a, p.b);
  // «a ○ ? = b»: se despeja la incógnita con la operación contraria.
  const x = p.answer;
  if (p.symbol === "+") return [`Si ${entre(p.a)} + ? = ${n(p.b)}, entonces ? = ${n(p.b)} − ${entre(p.a)}`, ...pasosOperacion("−", p.b, p.a), `Comprueba: ${entre(p.a)} + ${entre(x)} = ${n(p.b)}`];
  if (p.symbol === "−") return [`Si ${entre(p.a)} − ? = ${n(p.b)}, entonces ? = ${entre(p.a)} − ${entre(p.b)}`, ...pasosOperacion("−", p.a, p.b), `Comprueba: ${entre(p.a)} − ${entre(x)} = ${n(p.b)}`];
  if (p.symbol === "×") return [`Si ${entre(p.a)} × ? = ${n(p.b)}, entonces ? = ${n(p.b)} ÷ ${entre(p.a)}`, ...pasosOperacion("÷", p.b, p.a), `Comprueba: ${entre(p.a)} × ${entre(x)} = ${n(p.b)}`];
  return [`Si ${entre(p.a)} ÷ ? = ${n(p.b)}, entonces ? = ${entre(p.a)} ÷ ${entre(p.b)}`, ...pasosOperacion("÷", p.a, p.b), `Comprueba: ${entre(p.a)} ÷ ${entre(x)} = ${n(p.b)}`];
}

function mcd(a: number, b: number): number {
  return b === 0 ? a : mcd(b, a % b);
}

const f = ([a, b]: [number, number]) => `${a}/${b}`;

export function enunciadoFraccion(p: ProblemaFraccion): string {
  if (p.tipo === "simplificar" && p.frac) return `Simplifica ${f(p.frac)}`;
  if (p.frac1 && p.frac2) return p.tipo === "comparar" ? `${f(p.frac1)}  ?  ${f(p.frac2)}` : `${f(p.frac1)} + ${f(p.frac2)}`;
  return "";
}

export function pasosFraccion(p: ProblemaFraccion): string[] {
  if (p.tipo === "simplificar" && p.frac && p.respuestaFraccion) {
    const [a, b] = p.frac;
    const d = mcd(a, b);
    return [
      `Busca el número más grande que divide a ${a} y a ${b}: es ${d}`,
      `Divide arriba y abajo por ${d}: ${a} ÷ ${d} = ${a / d} y ${b} ÷ ${d} = ${b / d}`,
      `Queda ${f(p.respuestaFraccion)}, que ya no se puede simplificar más`,
    ];
  }
  if (p.tipo === "comparar" && p.frac1 && p.frac2 && p.respuestaComparacion) {
    const [a, b] = p.frac1;
    const [c, d] = p.frac2;
    const comun = (b * d) / mcd(b, d);
    const x = a * (comun / b);
    const y = c * (comun / d);
    if (b === d) return [`Tienen el mismo denominador: gana la de numerador más grande`, `${a} ${p.respuestaComparacion} ${c}, así que ${f(p.frac1)} ${p.respuestaComparacion} ${f(p.frac2)}`];
    return [
      `Lleva las dos al mismo denominador, ${comun}`,
      `${f(p.frac1)} = ${x}/${comun} y ${f(p.frac2)} = ${y}/${comun}`,
      `Compara los numeradores: ${x} ${p.respuestaComparacion} ${y}, así que ${f(p.frac1)} ${p.respuestaComparacion} ${f(p.frac2)}`,
    ];
  }
  if (p.tipo === "sumar" && p.frac1 && p.frac2 && p.respuestaFraccion) {
    const [a, b] = p.frac1;
    const [c, d] = p.frac2;
    const comun = (b * d) / mcd(b, d);
    const x = a * (comun / b);
    const y = c * (comun / d);
    const pasos = b === d ? [`Tienen el mismo denominador: suma los numeradores`] : [`Busca un denominador común: ${comun}`, `${f(p.frac1)} = ${x}/${comun} y ${f(p.frac2)} = ${y}/${comun}`];
    pasos.push(`Suma los numeradores: ${x} + ${y} = ${x + y}, queda ${x + y}/${comun}`);
    const g = mcd(x + y, comun);
    if (g > 1) pasos.push(`Simplifica dividiendo por ${g}: ${f(p.respuestaFraccion)}`);
    return pasos;
  }
  return [];
}

// Superíndices para escribir potencias en texto plano (3⁴).
export function superindice(x: number): string {
  const s = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  return String(x)
    .split("")
    .map((c) => (c >= "0" && c <= "9" ? s[Number(c)] : c))
    .join("");
}
