export type TipoDecimal = "convertir" | "porcentaje" | "redondear";

export interface ProblemaDecimal {
  problemType: "decimales";
  tipo: TipoDecimal;
  enunciado: string;
  respuesta: number;
  tolerancia: number;
}

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
    enunciado: `Convertí ${num}/${den} a decimal`,
    respuesta,
    tolerancia: 0.01,
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
    enunciado: `Redondeá ${numero} a ${lugares} decimal${lugares > 1 ? "es" : ""}`,
    respuesta,
    tolerancia: 0,
  };
}

const GENERADORES: Record<TipoDecimal, (nivel: number) => ProblemaDecimal> = {
  convertir: generarConvertir,
  porcentaje: generarPorcentaje,
  redondear: generarRedondear,
};

export function generarProblemaDecimal(nivel: number, tipos: TipoDecimal[] = ["convertir", "porcentaje", "redondear"]): ProblemaDecimal {
  const disponibles = tipos.length > 0 ? tipos : (["convertir", "porcentaje", "redondear"] as TipoDecimal[]);
  const tipo = disponibles[Math.floor(Math.random() * disponibles.length)];
  return GENERADORES[tipo](nivel);
}
