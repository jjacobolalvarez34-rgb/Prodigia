import type { ModoHistoria } from "./historiaComun";
import { objetivoProminencia } from "./historiaComun";

// ESCALA DE DIFICULTAD de la práctica de Historia, declarativa (mismo patrón que
// trigonometriaEscala.ts). Para cada modo, una tabla «tipo de pregunta -> desde
// qué nivel aparece y con qué peso en cada nivel». Los generadores NO deciden la
// dificultad con `if (nivel ...)`: preguntan a activosEnNivel() qué tipos pueden
// salir y con qué probabilidad, y cada tipo recibe `dif` (0, 1, 2... = cuántos
// niveles lleva activo) para endurecer sus distractores y acortar distancias.
//
// La dificultad tiene DOS ejes, ambos crecientes de 1 a 10:
//   1. QUÉ TAN CONOCIDO es lo que se pregunta: cada hecho y personaje de la tabla
//      canónica tiene `prominencia` 1-10 y cada nivel apunta a una prominencia
//      objetivo (objetivoProminencia: 10 en el nivel 1, 3,25 en el 10);
//   2. QUÉ TIPO de pregunta: de ordenar tres hechos de épocas distintas y
//      elegir la época a saber el año exacto o encadenar dos causas.
//
// Reglas que historia.test.ts hace cumplir:
//  - cada modo cubre los niveles 1 a 10 sin huecos y la huella (tipos, pesos,
//    prominencia objetivo) de cada nivel es DISTINTA a la del anterior;
//  - todo tipo declarado sale de verdad del generador (con el `tipo` correcto);
//  - `conceptos` nombra los conceptos de Aprender que enseñan ese tipo de
//    pregunta (src/lib/historia/lecciones/conceptos.ts): cada uno lo introduce
//    alguna Clase y lo trata alguna Técnica.
//
// RECALIBRACIÓN: el «nivel N» de esta escala NO significa lo mismo que el de la
// escala vieja (13 personajes, 10 fechas y 8 ordenamientos fijos, sin tipos).
// Los usuarios ya calibrados (skill_levels historia_*) lo fueron contra esa
// escala. Ver docs/PARIDAD_MUNDOS.md, «Historia: rediseño del mundo».

export interface TipoEscala {
  tipo: string;
  // Primer nivel en que aparece; `pesos[i]` es su peso en el nivel desde + i
  // (0 = ya no sale). El último nivel activo es desde + pesos.length - 1.
  desde: number;
  pesos: number[];
  conceptos: string[];
  // Una línea: qué pide (documentación viva).
  descripcion: string;
}

export const ESCALA_HISTORIA: Record<ModoHistoria, TipoEscala[]> = {
  cronologia: [
    { tipo: "ordenar-epocas", desde: 1, pesos: [7, 7, 5, 3, 1], conceptos: ["linea-de-tiempo", "epocas-historicas"], descripcion: "ordenar 3 hechos de épocas distintas" },
    { tipo: "ordenar-misma-epoca", desde: 3, pesos: [2, 4, 5, 5, 4, 2], conceptos: ["linea-de-tiempo", "epocas-historicas"], descripcion: "ordenar 3 hechos de la misma época, separados por siglos" },
    { tipo: "entre", desde: 5, pesos: [2, 4, 5, 5, 4, 3], conceptos: ["linea-de-tiempo"], descripcion: "cuál de estos hechos ocurrió entre otros dos" },
    { tipo: "ordenar-cercanos", desde: 6, pesos: [3, 4, 5, 5, 5], conceptos: ["linea-de-tiempo"], descripcion: "ordenar 3 hechos cercanos en el tiempo (décadas)" },
    { tipo: "siglo", desde: 7, pesos: [3, 4, 4, 4], conceptos: ["siglos", "anio-antes-de-cristo"], descripcion: "en qué siglo ocurrió un hecho, con trampas (a. C. y años redondos)" },
    { tipo: "mas-antiguo", desde: 8, pesos: [3, 4, 5], conceptos: ["sincronia"], descripcion: "cuál de cuatro hechos de regiones distintas ocurrió primero" },
    { tipo: "mismo-siglo", desde: 9, pesos: [3, 5], conceptos: ["sincronia", "siglos"], descripcion: "cuál ocurrió en el mismo siglo que otro, en otra región" },
  ],
  personajes: [
    { tipo: "pistas-completas", desde: 1, pesos: [7, 7, 5, 2], conceptos: ["personajes-por-rol"], descripcion: "identificar con tres pistas: rol, años de vida y un dato" },
    { tipo: "rol-y-dato", desde: 3, pesos: [3, 5, 5, 4, 1], conceptos: ["personajes-por-rol"], descripcion: "identificar con el rol y un dato" },
    { tipo: "personaje-de-hecho", desde: 4, pesos: [2, 3, 3, 3, 3, 3, 3], conceptos: ["personajes-y-hechos"], descripcion: "quién estaba vivo y participó en un hecho" },
    { tipo: "solo-dato", desde: 5, pesos: [3, 5, 5, 4, 3, 2], conceptos: ["personajes-por-rol"], descripcion: "identificar con un solo dato" },
    { tipo: "hecho-de-personaje", desde: 6, pesos: [2, 3, 4, 4, 4], conceptos: ["personajes-y-hechos"], descripcion: "con qué hecho se relaciona un personaje" },
    { tipo: "rol-y-vida", desde: 7, pesos: [3, 5, 6, 6], conceptos: ["personajes-por-rol", "siglos"], descripcion: "identificar con el rol y los años de vida, sin más datos" },
  ],
  causaefecto: [
    { tipo: "consecuencia", desde: 1, pesos: [7, 7, 6, 5, 4, 3, 2], conceptos: ["causa-y-consecuencia"], descripcion: "cuál de estos hechos fue una consecuencia de otro" },
    { tipo: "causa", desde: 1, pesos: [4, 5, 6, 6, 6, 5, 4, 3, 3, 3], conceptos: ["causa-y-consecuencia"], descripcion: "cuál de estos hechos contribuyó a provocar otro" },
    { tipo: "cadena-intermedia", desde: 7, pesos: [3, 5, 7, 7], conceptos: ["cadenas-causales"], descripcion: "qué hecho une una causa con su consecuencia (cadena de dos pasos)" },
    { tipo: "cadena-remota", desde: 8, pesos: [4, 6, 7], conceptos: ["cadenas-causales"], descripcion: "qué hecho fue consecuencia, en dos pasos, de otro" },
  ],
  fechas: [
    { tipo: "epoca", desde: 1, pesos: [7, 6, 3, 1], conceptos: ["epocas-historicas"], descripcion: "en qué época ocurrió un hecho (periodización escolar)" },
    { tipo: "siglo", desde: 2, pesos: [4, 6, 6, 5, 3, 2], conceptos: ["siglos", "anio-antes-de-cristo"], descripcion: "en qué siglo ocurrió un hecho" },
    { tipo: "decada", desde: 4, pesos: [3, 5, 5, 4, 2], conceptos: ["siglos"], descripcion: "en qué década ocurrió un hecho de fecha exacta" },
    { tipo: "anio", desde: 6, pesos: [3, 5, 6, 7, 7], conceptos: ["anio-antes-de-cristo"], descripcion: "en qué año ocurrió un hecho de fecha exacta, con años cercanos como distractores" },
  ],
};

export interface ActivoEscala {
  tipo: string;
  peso: number;
  // 0 en el primer nivel del tipo, 1 en el siguiente...
  dif: number;
}

export function pesoEnNivel(t: TipoEscala, nivel: number): number {
  const i = nivel - t.desde;
  return i >= 0 && i < t.pesos.length ? t.pesos[i] : 0;
}

export function nivelValido(nivel: number): number {
  return Math.min(10, Math.max(1, Math.round(nivel)));
}

// Tipos que pueden salir en un nivel (peso > 0), con su peso y su `dif`.
export function activosEnNivel(modo: ModoHistoria, nivel: number): ActivoEscala[] {
  const n = nivelValido(nivel);
  return ESCALA_HISTORIA[modo]
    .map((t) => ({ tipo: t.tipo, peso: pesoEnNivel(t, n), dif: n - t.desde }))
    .filter((a) => a.peso > 0);
}

// Huella de un nivel (tipos, pesos, dif y prominencia objetivo): lo que cambia
// de un nivel al siguiente.
export function firmaDeNivel(modo: ModoHistoria, nivel: number): string {
  const tipos = activosEnNivel(modo, nivel)
    .map((a) => `${a.tipo}:${a.peso}:${a.dif}`)
    .join("|");
  return `${tipos}@${objetivoProminencia(nivel)}`;
}

// Conjunto de tipos de un nivel (sin pesos): para comprobar que cada banda de
// niveles trae algo nuevo.
export function tiposDeNivel(modo: ModoHistoria, nivel: number): string[] {
  return activosEnNivel(modo, nivel).map((a) => a.tipo);
}
