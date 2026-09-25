import type { ClaseEstadistica, TecnicaEstadistica } from "./tipos";

// Genera la migración de visuales de Aprender de Estadística a partir del
// contenido tipado (fuente única). lecciones.test.ts compara este texto con el
// archivo del repo, así que la migración no puede quedar desincronizada.
// Mismo patrón que src/lib/naipia/lecciones/sql.ts.
//
// Solo UPDATE por slug de las 13 filas que ya existen (0191): nombre, orden y
// requiere_pro NO se tocan, no hay INSERT ni ALTER, y `technique_progress` y
// `skill_levels` no se tocan (nadie pierde lo que ya completó). Cada UPDATE
// reemplaza `contenido` (pasos + visuales + quiz) y `descripcion`, que en 0191
// tenían voseo; el quiz es IDÉNTICO al de 0191 (el contrato de
// /api/aprender/completar valida por igualdad exacta).

function escaparSql(s: string): string {
  return s.replace(/'/g, "''");
}

type Leccion = TecnicaEstadistica | ClaseEstadistica;

export function contenidoJson(l: Leccion): string {
  const contenido = {
    pasos: l.pasos,
    visuales: l.visuales,
    ...("quiz" in l
      ? { quiz: l.quiz.map((q) => ({ pregunta: q.pregunta, opciones: q.opciones, respuesta: q.respuesta, explicacion: q.explicacion })) }
      : {}),
  };
  return JSON.stringify(contenido, null, 2);
}

const actualizar = (l: Leccion) =>
  `update public.techniques\nset descripcion = '${escaparSql(l.descripcion)}',\n  contenido = $estadistica$${contenidoJson(l)}$estadistica$::jsonb\nwhere slug = '${escaparSql(l.slug)}' and problem_type = 'estadistica';`;

export interface OpcionesSqlEstadistica {
  // Encabezado (líneas de comentario SIN el "-- " inicial).
  cabecera: string[];
  tecnicas: TecnicaEstadistica[];
  clases: ClaseEstadistica[];
}

export function generarSqlEstadistica(o: OpcionesSqlEstadistica): string {
  const partes: string[] = [];
  partes.push(
    `-- ============================================================\n${[
      ...o.cabecera,
      "",
      "Este archivo se GENERA desde src/lib/estadistica/lecciones/ (fuente única) y",
      "lecciones.test.ts comprueba que coincida. No editar a mano.",
      "Regenerar: ESTADISTICA_ESCRIBIR_SQL=1 npx vitest run src/lib/estadistica/lecciones",
    ]
      .map((l) => (l === "" ? "--" : `-- ${l}`))
      .join("\n")}\n-- ============================================================`
  );
  partes.push(`-- 1) Técnicas (${o.tecnicas.length}, requiere_pro = false): se actualizan por slug.\n\n${o.tecnicas.map(actualizar).join("\n\n")}`);
  partes.push(`-- 2) Clases (${o.clases.length}, requiere_pro = true): se actualizan por slug.\n\n${o.clases.map(actualizar).join("\n\n")}`);
  return partes.join("\n\n") + "\n";
}

// Cabecera de la migración de visuales.
export const CABECERA_ESTADISTICA: string[] = [
  "Prodigia — Estadística: visuales animados en Aprender (docs/PARIDAD_MUNDOS.md,",
  "fila 23 y la sección \"Estadística: visuales en Aprender\").",
  "",
  "Antes: 5 Técnicas y 8 Clases (0191) sin `contenido.visuales`. Ahora cada una",
  "trae al menos un visual animado: conjunto de datos que se ordena y marca la",
  "mediana o los cuartiles, barras de frecuencia que resaltan la moda, desviaciones",
  "coloreadas (con sus cuadrados o su puntaje z), curva normal con la regla",
  "empírica, diagrama de dispersión con la recta de mínimos cuadrados, árbol de",
  "probabilidad, gráficos de barras, líneas, histograma y caja, y el primitivo",
  "genérico \"cuadros\" para la combinatoria y los tipos de variable.",
  "",
  "Solo UPDATE de las 13 filas existentes (mismos slugs, orden y requiere_pro):",
  "`pasos` y `quiz` conservan lo de 0191 (las preguntas sembradas, IDÉNTICAS y en",
  "el mismo orden, porque /api/aprender/completar valida cada respuesta contra el",
  "quiz guardado); lo único que cambia del texto sembrado es el voseo (imperativos",
  "rioplatenses, 12 palabras distintas), corregido a español neutro en `pasos` y",
  "`descripcion`. Además se AGREGAN, siempre al final, pasos y preguntas para lo",
  "que la práctica evalúa y ninguna lección enseñaba: el dato que falta a partir",
  "de la media y el rango percentil (Clases 2 y 6), y el entrenamiento con barras,",
  "líneas e histogramas de la Clase 8. No se toca technique_progress ni",
  "skill_levels.",
  "",
  "Todo número que muestra un visual sale de funciones puras",
  "(src/lib/estadistica/visualesDatos.ts) contrastadas con un cálculo",
  "independiente hecho a mano en los tests.",
];
