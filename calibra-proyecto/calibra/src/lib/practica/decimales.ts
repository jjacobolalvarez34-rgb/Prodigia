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

const fmt = (x: number) => x.toLocaleString("es", { maximumFractionDigits: 3 });

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function banda(nivel: number): number {
  return Math.min(4, Math.floor((nivel - 1) / 2));
}

function generarConvertir(nivel: number): ProblemaDecimal {
  const denominadores = [2, 4, 5, 10, 20];
  const den = denominadores[banda(nivel)];
  const num = randomInt(1, den - 1);
  const respuesta = Math.round((num / den) * 100) / 100;
  return {
    problemType: "decimales",
    tipo: "convertir",
    enunciado: `Convierte $\\frac{${num}}{${den}}$ a decimal`,
    respuesta,
    tolerancia: 0.01,
    pasos:
      100 % den === 0
        ? [`Multiplica arriba y abajo por ${100 / den} para que abajo quede 100: ${num}/${den} = ${num * (100 / den)}/100`, `${num * (100 / den)}/100 = ${fmt(respuesta)}`]
        : [`Divide el numerador entre el denominador: ${num} ÷ ${den} = ${fmt(respuesta)}`],
  };
}

function generarPorcentaje(nivel: number): ProblemaDecimal {
  const bases = [20, 50, 100, 200, 500];
  const base = bases[banda(nivel)];
  const porcentaje = randomInt(1, 20) * 5;
  const respuesta = Math.round((porcentaje / 100) * base);
  return {
    problemType: "decimales",
    tipo: "porcentaje",
    enunciado: `¿Cuánto es ${porcentaje}% de ${base}?`,
    respuesta,
    tolerancia: 0,
    pasos: [
      `El 1 % de ${base} es ${base} ÷ 100 = ${fmt(base / 100)}`,
      `El ${porcentaje} % es ${porcentaje} veces eso: ${fmt(base / 100)} × ${porcentaje} = ${fmt((base * porcentaje) / 100)}`,
      ...((base * porcentaje) % 100 === 0 ? [] : [`Redondeado al entero más cercano: ${respuesta}`]),
    ],
  };
}

function generarRedondear(nivel: number): ProblemaDecimal {
  const lugares = nivel < 6 ? 1 : 2;
  const entero = randomInt(1, 20 + banda(nivel) * 10);
  const decimales = randomInt(100, 999);
  const numero = Number(`${entero}.${decimales}`);
  const factor = 10 ** lugares;
  const respuesta = Math.round(numero * factor) / factor;
  return {
    problemType: "decimales",
    tipo: "redondear",
    enunciado: `Redondea ${numero} a ${lugares} decimal${lugares > 1 ? "es" : ""}`,
    respuesta,
    tolerancia: 0,
    pasos: [
      `Mira la cifra que viene después del ${lugares === 1 ? "primer" : "segundo"} decimal: es ${String(decimales)[lugares]}`,
      Number(String(decimales)[lugares]) >= 5 ? `Es 5 o más: el decimal anterior sube uno` : `Es menor que 5: el decimal anterior queda igual`,
      `Queda ${fmt(respuesta)}`,
    ],
  };
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
  return GENERADORES[tipo](nivelPorTipo[tipo]);
}
