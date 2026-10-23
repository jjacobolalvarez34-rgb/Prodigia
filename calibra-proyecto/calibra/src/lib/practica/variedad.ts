// Medición de variedad de los generadores de preguntas (auditoría 2026-10-23,
// docs/AUDITORIA_PREGUNTAS.md). Lo usan los tests de variedad: para cada modo y
// cada nivel se generan N preguntas, cada una con su propia semilla (Math.random
// se reemplaza por un mulberry32 sembrado), y se cuenta cuántas son distintas.
// Nada de esto corre en la app ni en la web: es solo para vigilar los generadores.
import { mulberry32 } from "@/lib/rng";

export const NIVELES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

// Las semillas consecutivas se dispersan para que la primera salida de cada
// mulberry32 no quede correlacionada con la anterior.
function semillaDispersa(i: number): number {
  return Math.imul(i + 1, 2654435761) ^ 0x5bd1e995;
}

// Corre `fn` con Math.random sembrado y lo restaura siempre.
export function conSemilla<T>(semilla: number, fn: () => T): T {
  const original = Math.random;
  Math.random = mulberry32(semillaDispersa(semilla));
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

export interface VariedadNivel {
  nivel: number;
  distintas: number;
  // Tamaño de la muestra (N).
  muestras: number;
}

export interface VariedadModo {
  porNivel: VariedadNivel[];
  // Mínimo de distintas entre los 10 niveles (el peor nivel).
  minimo: number;
  // Qué fracción de las preguntas del nivel 10 ya salían en el nivel 1. Cerca de 1
  // = la dificultad no cambia lo que se pregunta.
  solapamiento1a10: number;
  // «Meseta»: con la MISMA semilla, qué fracción de preguntas sale idéntica en dos
  // niveles de bandas consecutivas (1→3, 3→5, 5→7, 7→9); se guarda el peor par.
  // Cerca de 1 = subir de nivel no cambia nada (el generador ignora el nivel ahí).
  meseta: number;
  mesetaEntre: [number, number];
}

const PARES_MESETA: [number, number][] = [
  [1, 3],
  [3, 5],
  [5, 7],
  [7, 9],
];

function igualesMismaSemilla(generar: (nivel: number) => string, a: number, b: number, n: number): number {
  let iguales = 0;
  for (let i = 0; i < n; i++) if (conSemilla(424_242 + i, () => generar(a)) === conSemilla(424_242 + i, () => generar(b))) iguales++;
  return iguales / n;
}

// `generar(nivel)` devuelve la clave canónica de la pregunta (el enunciado, o
// enunciado + respuesta + opciones si el enunciado solo no la distingue).
export function medirVariedad(generar: (nivel: number) => string, n = 200, niveles: readonly number[] = NIVELES): VariedadModo {
  const conjuntos = new Map<number, Set<string>>();
  const porNivel = niveles.map((nivel) => {
    const vistos = new Set<string>();
    for (let i = 0; i < n; i++) vistos.add(conSemilla(nivel * 100_003 + i, () => generar(nivel)));
    conjuntos.set(nivel, vistos);
    return { nivel, distintas: vistos.size, muestras: n };
  });
  const bajo = conjuntos.get(niveles[0]) ?? new Set<string>();
  const alto = conjuntos.get(niveles[niveles.length - 1]) ?? new Set<string>();
  let comunes = 0;
  for (const c of alto) if (bajo.has(c)) comunes++;
  let meseta = 0;
  let mesetaEntre: [number, number] = PARES_MESETA[0];
  for (const [a, b] of PARES_MESETA) {
    const m = igualesMismaSemilla(generar, a, b, Math.min(n, 100));
    if (m > meseta) [meseta, mesetaEntre] = [m, [a, b]];
  }
  return {
    porNivel,
    minimo: Math.min(...porNivel.map((p) => p.distintas)),
    solapamiento1a10: alto.size === 0 ? 0 : comunes / alto.size,
    meseta,
    mesetaEntre,
  };
}

// Repeticiones dentro de una partida SIN la deduplicación de generarSinRepetir:
// cuántas preguntas de `largo` seguidas son repetidas (promedio sobre `partidas`).
// Sirve para ver qué tan seguido tiene que trabajar el deduplicador.
export function repetidasPorPartida(generar: (nivel: number) => string, nivel: number, largo = 10, partidas = 50): number {
  let total = 0;
  for (let p = 0; p < partidas; p++) {
    conSemilla(nivel * 7919 + p, () => {
      const vistos = new Set<string>();
      for (let i = 0; i < largo; i++) {
        const c = generar(nivel);
        if (vistos.has(c)) total++;
        vistos.add(c);
      }
    });
  }
  return total / partidas;
}

// Fila de tabla Markdown: «modo | n1 … n10 | mín | solap. | meseta».
export function filaTabla(nombre: string, v: VariedadModo): string {
  const celdas = v.porNivel.map((p) => String(p.distintas));
  const meseta = `${Math.round(v.meseta * 100)} %${v.meseta >= 0.5 ? ` (N${v.mesetaEntre[0]}→N${v.mesetaEntre[1]})` : ""}`;
  return `| ${nombre} | ${celdas.join(" | ")} | ${v.minimo} | ${Math.round(v.solapamiento1a10 * 100)} % | ${meseta} |`;
}

export function encabezadoTabla(niveles: readonly number[] = NIVELES): string {
  return [`| Modo | ${niveles.map((n) => `N${n}`).join(" | ")} | Mín | Solap. 1↔10 | Meseta |`, `|---|${niveles.map(() => "---:").join("|")}|---:|---:|---:|`].join("\n");
}
