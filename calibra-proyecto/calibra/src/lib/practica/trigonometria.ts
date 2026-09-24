// Mundo Trigonometría — 4 modos de dificultad creciente (nivel 1-10 vía
// skill_levels, igual que el resto de los mundos): razones en el triángulo
// rectángulo (respuesta numérica), círculo unitario (valores exactos, opción
// múltiple), identidades (opción múltiple, resueltas por sustitución con
// valores exactos, nunca con un parser simbólico) y leyes de seno y coseno
// (triángulos oblicuos, respuesta numérica).
//
// REDISEÑO FASE 1 (docs/PARIDAD_MUNDOS.md, "Trigonometría: rediseño del mundo
// (fase 1)"): la dificultad ya no está repartida en `if (nivel ...)` sino en
// una tabla declarativa (trigonometriaEscala.ts: tipo de problema -> desde qué
// nivel y con qué peso) que este archivo consulta; los generadores viven en
// trigonometriaRazones/Circulo/Identidades/Leyes.ts y todos los datos salen de
// funciones puras de src/lib/trigonometria/ que los tests contrastan con un
// cálculo independiente. La firma pública NO cambia: SprintRunner, duelos,
// Reto Diario, demo y diagnóstico siguen llamando a generarProblemaTrigonometria.
//
// Sin semilla compartida entre rivales de duelo — mismo criterio que
// Enigmia/Geografía/Anatomía/Melodía. El Reto Diario sí usa conRngSembrado():
// la misma semilla da EXACTAMENTE las mismas preguntas.

// FORMATO DE SALIDA (convención $...$ de MathText, ver
// docs/PLAN_REVISION_CONTENIDO.md): los valores exactos (\frac{\sqrt{3}}{2}),
// los ángulos en radianes (\frac{\pi}{6}), las funciones (sen, cos, tan) y los
// grados (30^{\circ}) salen entre $...$ con LaTeX real, y la opción correcta
// es EXACTAMENTE uno de los strings de `opciones`. "indefinido" es una palabra
// y queda como texto plano. Las respuestas NUMÉRICAS (input) no llevan marcas.

import { activosEnNivel, type ModoTrigonometria } from "./trigonometriaEscala";
import { conRngSembrado, elegirPonderado } from "./trigonometriaBase";
import type { ProblemaTrigonometria } from "./trigonometriaTipos";
import {
  generarAnguloInverso,
  generarDepresion,
  generarDosPasos,
  generarElevacion,
  generarLadoCalculadora,
  generarLadoNotable,
  generarRazonTernas,
  generarReciprocas,
} from "./trigonometriaRazones";
import { generarCoterminales, generarConversion, generarDadoValor, generarQ1Exactos, generarRefQ2Q3, generarTodosCuadrantes } from "./trigonometriaCirculo";
import {
  generarComplementarios,
  generarCociente,
  generarDoble,
  generarDobleDado,
  generarEquivalente,
  generarEquivalenteDoble,
  generarPitagorica,
  generarReciprocasId,
  generarSumaDiferencia,
} from "./trigonometriaIdentidades";
import { generarAmbiguo, generarAplicacion, generarArea, generarCosenoAngulo, generarCosenoLado, generarSenoLado } from "./trigonometriaLeyes";

export type { ModoTrigonometria };
export type { TrianguloDiagrama, ProblemaTrigonometriaNumero, ProblemaTrigonometriaOpciones, ProblemaTrigonometria } from "./trigonometriaTipos";
export { conRngSembrado };
export { ESCALA_TRIGONOMETRIA, activosEnNivel, firmaDeNivel } from "./trigonometriaEscala";

export const NOMBRE_MODO_TRIGONOMETRIA: Record<ModoTrigonometria, string> = {
  razones: "Razones básicas",
  circulo: "Círculo unitario",
  identidades: "Identidades",
  leyes: "Leyes de seno y coseno",
};

type Generador = (dif: number) => ProblemaTrigonometria;

// tipo (de la escala) -> generador. Un test comprueba que cada tipo declarado
// en la escala tiene su generador y que no sobra ninguno.
export const GENERADORES_TRIGONOMETRIA: Record<ModoTrigonometria, Record<string, Generador>> = {
  razones: {
    "razon-ternas": generarRazonTernas,
    "lado-notable": generarLadoNotable,
    "lado-calculadora": generarLadoCalculadora,
    "angulo-inverso": generarAnguloInverso,
    reciprocas: generarReciprocas,
    elevacion: generarElevacion,
    depresion: generarDepresion,
    "dos-pasos": generarDosPasos,
  },
  circulo: {
    "q1-exactos": generarQ1Exactos,
    conversion: generarConversion,
    "ref-q2q3": generarRefQ2Q3,
    "todos-cuadrantes": generarTodosCuadrantes,
    coterminales: generarCoterminales,
    "dado-valor": generarDadoValor,
  },
  identidades: {
    pitagorica: generarPitagorica,
    complementarios: generarComplementarios,
    cociente: generarCociente,
    "reciprocas-id": generarReciprocasId,
    doble: generarDoble,
    "doble-dado": generarDobleDado,
    "suma-diferencia": generarSumaDiferencia,
    equivalente: generarEquivalente,
    "equivalente-doble": generarEquivalenteDoble,
  },
  leyes: {
    "seno-lado": generarSenoLado,
    "coseno-lado": generarCosenoLado,
    "coseno-angulo": generarCosenoAngulo,
    area: generarArea,
    aplicacion: generarAplicacion,
    ambiguo: generarAmbiguo,
  },
};

export interface ProblemaDetallado {
  problema: ProblemaTrigonometria;
  tipo: string;
  dif: number;
}

// Igual que generarProblemaTrigonometria, pero dice qué tipo de problema salió
// (lo usan los tests de la escala).
export function generarProblemaTrigonometriaDetallado(modo: ModoTrigonometria, nivel: number): ProblemaDetallado {
  const activo = elegirPonderado(activosEnNivel(modo, nivel));
  return { problema: GENERADORES_TRIGONOMETRIA[modo][activo.tipo](activo.dif), tipo: activo.tipo, dif: activo.dif };
}

export function generarProblemaTrigonometria(modo: ModoTrigonometria, nivel: number): ProblemaTrigonometria {
  return generarProblemaTrigonometriaDetallado(modo, nivel).problema;
}
