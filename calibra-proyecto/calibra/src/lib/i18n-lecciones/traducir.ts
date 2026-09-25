// Traducción de lecciones al inglés: contrato, validación y generador de SQL.
//
// Cada mundo tiene un archivo de traducciones (`en/<mundo>.ts`) con, por slug, el
// nombre, la descripción, los pasos, el quiz y los textos de los visuales en
// inglés. Este módulo:
//   - define el formato y lo valida contra la lección en español (mismo número de
//     pasos, preguntas, opciones y visuales; la respuesta correcta es la MISMA
//     posición; las fórmulas `$…$` y los bloques de código no se tocan);
//   - arma el `update` que llena `nombre_en`, `descripcion_en` y `contenido_en`
//     (la migración 0225 crea las columnas). `contenido_en` se calcula EN LA BASE
//     como el `contenido` en español con `pasos`, `quiz` y `visuales` reemplazados:
//     lo que la traducción no toca (claves extra, programas de Codia, ids) queda igual.

export interface PreguntaFuente {
  pregunta: string;
  opciones: string[];
  respuesta: string;
  explicacion?: string;
}

export interface LeccionFuente {
  slug: string;
  nombre: string;
  descripcion?: string | null;
  pasos: string[];
  quiz?: PreguntaFuente[];
  visuales?: unknown[];
}

export interface PreguntaTraducida {
  pregunta: string;
  opciones: string[];
  // Posición (0..n-1) de la opción correcta: SIEMPRE igual a la de la fuente.
  respuesta: number;
  explicacion?: string;
}

export interface TraduccionLeccion {
  nombre: string;
  descripcion?: string;
  pasos: string[];
  quiz?: PreguntaTraducida[];
  // Textos traducibles de los visuales, en el orden de `textosTraducibles`.
  visuales?: string[];
}

// Claves de un visual cuyo valor es texto para leer (no un id, un símbolo ni código).
export const CLAVES_TEXTO_VISUAL = new Set([
  "titulo",
  "texto",
  "detalle",
  "nombre",
  "filas",
  "columnas",
  "etiqueta",
  "etiquetaPosicion",
  "etiquetaCentro",
  "etiquetaX",
  "etiquetaY",
  "motivo",
  "items",
  "categorias",
  "raiz",
  "lugares",
  "t",
]);

// Recorre los visuales y devuelve, en orden, cada cadena traducible. `filas` y
// `columnas` son tablas de celdas: se extraen todas (la traducción puede dejar
// igual una celda que es un símbolo).
export function textosTraducibles(visuales: unknown[] | undefined): string[] {
  const out: string[] = [];
  recorrer(visuales ?? [], null, (v) => out.push(v));
  return out;
}

function recorrer(nodo: unknown, clave: string | null, alCadena: (v: string) => void): void {
  if (typeof nodo === "string") {
    if (clave !== null && CLAVES_TEXTO_VISUAL.has(clave)) alCadena(nodo);
    return;
  }
  if (Array.isArray(nodo)) {
    for (const x of nodo) recorrer(x, clave, alCadena);
    return;
  }
  if (nodo && typeof nodo === "object") {
    for (const [k, v] of Object.entries(nodo as Record<string, unknown>)) recorrer(v, k, alCadena);
  }
}

// Devuelve una copia de los visuales con las cadenas traducibles reemplazadas, en el
// mismo orden en que las entrega `textosTraducibles`.
export function aplicarTextos(visuales: unknown[] | undefined, nuevos: string[]): unknown[] {
  let i = 0;
  const copia = clonar(visuales ?? []);
  recorrerMutando(copia, null, () => nuevos[i++]);
  return copia as unknown[];
}

function clonar<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function recorrerMutando(nodo: unknown, clave: string | null, siguiente: () => string): void {
  if (Array.isArray(nodo)) {
    nodo.forEach((x, idx) => {
      if (typeof x === "string") {
        if (clave !== null && CLAVES_TEXTO_VISUAL.has(clave)) nodo[idx] = siguiente();
      } else recorrerMutando(x, clave, siguiente);
    });
    return;
  }
  if (nodo && typeof nodo === "object") {
    const o = nodo as Record<string, unknown>;
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === "string") {
        if (CLAVES_TEXTO_VISUAL.has(k)) o[k] = siguiente();
      } else recorrerMutando(v, k, siguiente);
    }
  }
}

const RE_FORMULA = /\$[^$]*\$/g;
const RE_BLOQUE_CODIGO = /```[\s\S]*?```/g;

// Las fórmulas `$…$` deben ser idénticas salvo el contenido de \text{…} (palabras).
// En inglés el seno y la cosecante se escriben \sin y \csc (en español \operatorname{sen} y
// \operatorname{cosec}): se comparan normalizados, así la traducción puede usar la notación inglesa.
function formulasSinTexto(s: string): string[] {
  return (s.match(RE_FORMULA) ?? []).map((f) =>
    f
      .replace(/\\text\{[^}]*\}/g, "\\text{}")
      .replace(/\\operatorname\{sen\}|\\sen\b/g, "\\sin")
      .replace(/\\operatorname\{cosec\}/g, "\\csc")
  );
}

// En los .ts de Codia los bloques se escriben con ~~~ (para no chocar con los template literals) y
// el generador de SQL los pasa a ```: se tratan igual acá.
export function normalizarFences(s: string): string {
  return s.replace(/~~~/g, "```");
}

// Compara los bloques de código salvo dos cosas que sí se traducen: los comentarios (# en Python,
// // en Java, JavaScript y TypeScript, según el lenguaje del bloque) y el texto "error de
// compilación" de las salidas de ejemplo. El código, los identificadores, los textos entre comillas y
// el resto de la salida deben ser idénticos.
function bloquesDeCodigo(s: string): string[] {
  const bloques = normalizarFences(s).match(RE_BLOQUE_CODIGO) ?? [];
  return bloques.map((b) => {
    const lenguaje = /^```([a-z]+)/.exec(b)?.[1] ?? "";
    let limpio = b.replace(/error de compilación|compilation error/g, "<error de compilación>");
    if (lenguaje === "python") limpio = limpio.replace(/#[^\n]*/g, "#");
    else if (lenguaje === "java" || lenguaje === "javascript" || lenguaje === "typescript") limpio = limpio.replace(/\/\/[^\n]*/g, "//");
    return limpio;
  });
}

// Convierte ~~~ en ``` en todas las cadenas de un valor (para el SQL de Codia).
function conFencesNormalizados<T>(v: T): T {
  if (typeof v === "string") return normalizarFences(v) as T;
  if (Array.isArray(v)) return v.map((x) => conFencesNormalizados(x)) as T;
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, conFencesNormalizados(x)])) as T;
  }
  return v;
}

function distintos(a: string[], b: string[]): boolean {
  return a.length !== b.length || a.some((x, i) => x !== b[i]);
}

function chequearTexto(etiqueta: string, es: string, en: string, errores: string[]): void {
  if (!en.trim()) errores.push(`${etiqueta}: vacío`);
  if (distintos(formulasSinTexto(es), formulasSinTexto(en))) errores.push(`${etiqueta}: las fórmulas $…$ no coinciden`);
  if (distintos(bloquesDeCodigo(es), bloquesDeCodigo(en))) errores.push(`${etiqueta}: los bloques de código no coinciden`);
  if ((en.match(/\$/g) ?? []).length % 2 !== 0) errores.push(`${etiqueta}: $ desparejado`);
  // Es válido que aparezcan si la lección en español también los menciona (p. ej. Codia enseña qué es undefined).
  if (/undefined|NaN|\[object/.test(en) && !/undefined|NaN|\[object/.test(es)) errores.push(`${etiqueta}: contiene undefined/NaN`);
}

// Lista de problemas (vacía = válida) de la traducción de UNA lección.
export function validarTraduccion(fuente: LeccionFuente, tr: TraduccionLeccion): string[] {
  const e: string[] = [];
  const p = fuente.slug;
  if (!tr.nombre?.trim()) e.push(`${p}: falta el nombre`);
  if (fuente.descripcion && !tr.descripcion?.trim()) e.push(`${p}: falta la descripción`);
  if (tr.pasos.length !== fuente.pasos.length) {
    e.push(`${p}: ${tr.pasos.length} pasos y la fuente tiene ${fuente.pasos.length}`);
  } else {
    fuente.pasos.forEach((paso, i) => chequearTexto(`${p} paso ${i + 1}`, paso, tr.pasos[i], e));
  }

  const qs = fuente.quiz ?? [];
  const qt = tr.quiz ?? [];
  if (qt.length !== qs.length) {
    e.push(`${p}: ${qt.length} preguntas y la fuente tiene ${qs.length}`);
  } else {
    qs.forEach((q, i) => {
      const t = qt[i];
      const etq = `${p} pregunta ${i + 1}`;
      chequearTexto(`${etq} (enunciado)`, q.pregunta, t.pregunta, e);
      if (t.opciones.length !== q.opciones.length) {
        e.push(`${etq}: ${t.opciones.length} opciones y la fuente tiene ${q.opciones.length}`);
      } else {
        q.opciones.forEach((o, j) => chequearTexto(`${etq} opción ${j + 1}`, o, t.opciones[j], e));
        if (new Set(t.opciones).size !== t.opciones.length) e.push(`${etq}: opciones repetidas en inglés`);
      }
      const idxEs = q.opciones.indexOf(q.respuesta);
      if (idxEs < 0) e.push(`${etq}: la respuesta de la fuente no está entre sus opciones`);
      else if (t.respuesta !== idxEs) e.push(`${etq}: la respuesta correcta es la opción ${idxEs + 1}, no la ${t.respuesta + 1}`);
      if (q.explicacion !== undefined) chequearTexto(`${etq} (explicación)`, q.explicacion, t.explicacion ?? "", e);
    });
  }

  const vs = textosTraducibles(fuente.visuales);
  const vt = tr.visuales ?? [];
  if (vt.length !== vs.length) {
    e.push(`${p}: ${vt.length} textos de visuales y la fuente tiene ${vs.length}`);
  } else {
    vs.forEach((s, i) => {
      // En los visuales una cadena puede ser un símbolo o una fórmula: solo se exige que no
      // pierda ni cambie sus fórmulas (las palabras sí cambian).
      if (distintos(formulasSinTexto(s), formulasSinTexto(vt[i]))) e.push(`${p} visual #${i + 1}: las fórmulas $…$ no coinciden`);
      if (s.trim() && !vt[i].trim()) e.push(`${p} visual #${i + 1}: vacío`);
    });
  }
  return e;
}

// Bloques de código de un texto (con su ~~~ o ```), en orden. Sirven de fuente para los marcadores.
function bloquesLiterales(s: string): string[] {
  return s.match(/~~~[\s\S]*?~~~|```[\s\S]*?```/g) ?? [];
}

// Un texto traducido puede referirse al N-ésimo bloque de código del texto en español con el marcador
// ⟦N⟧ (base 1) en vez de copiarlo: el bloque se inserta TAL CUAL. Así una lección con decenas de
// programas no obliga a reescribirlos (ni a arriesgar un error de tipeo). Un bloque cuyos comentarios
// sí se traducen se escribe completo, sin marcador.
function conBloques(fuente: string, traducido: string): string {
  const bloques = bloquesLiterales(fuente);
  return traducido.replace(/⟦(\d+)⟧/g, (m, n) => bloques[Number(n) - 1] ?? m);
}

// Devuelve la traducción con los marcadores ⟦N⟧ de pasos y enunciados ya reemplazados por el código.
export function resolverBloques(fuente: LeccionFuente, tr: TraduccionLeccion): TraduccionLeccion {
  return {
    ...tr,
    pasos: tr.pasos.map((p, i) => conBloques(fuente.pasos[i] ?? "", p)),
    quiz: tr.quiz?.map((q, i) => ({ ...q, pregunta: conBloques(fuente.quiz?.[i]?.pregunta ?? "", q.pregunta) })),
  };
}

// `quiz` traducido en el formato del contenido (respuesta = texto de la opción).
export function quizEnContenido(tr: TraduccionLeccion): PreguntaFuente[] | undefined {
  if (!tr.quiz) return undefined;
  return tr.quiz.map((q) => {
    const fila: PreguntaFuente = { pregunta: q.pregunta, opciones: q.opciones, respuesta: q.opciones[q.respuesta] };
    if (q.explicacion !== undefined) fila.explicacion = q.explicacion;
    return fila;
  });
}

function escaparSql(s: string): string {
  return s.replace(/'/g, "''");
}

export interface FilaTraduccion {
  fuente: LeccionFuente;
  traduccion: TraduccionLeccion;
}

// Un `update` por lección: nombre_en, descripcion_en y contenido_en (el `contenido` en
// español con pasos, quiz y visuales en inglés). `tabla` es `techniques` o
// `logic_techniques`; `problemType` restringe techniques (null para logic_techniques).
export function generarSqlTraducciones(
  encabezado: string,
  tabla: "techniques" | "logic_techniques",
  problemType: string | null,
  filas: FilaTraduccion[],
  etiqueta: string
): string {
  const tag = `$${etiqueta}$`;
  const bloques = filas.map(({ fuente, traduccion }) => {
    const piezas: string[] = [`'pasos', ${tag}${JSON.stringify(conFencesNormalizados(traduccion.pasos))}${tag}::jsonb`];
    const quiz = quizEnContenido(traduccion);
    if (quiz) piezas.push(`'quiz', ${tag}${JSON.stringify(conFencesNormalizados(quiz))}${tag}::jsonb`);
    if (fuente.visuales && fuente.visuales.length > 0) {
      const vis = aplicarTextos(fuente.visuales, traduccion.visuales ?? []);
      piezas.push(`'visuales', ${tag}${JSON.stringify(conFencesNormalizados(vis))}${tag}::jsonb`);
    }
    const desc = traduccion.descripcion === undefined ? "null" : `'${escaparSql(traduccion.descripcion)}'`;
    const donde =
      problemType === null
        ? `where slug = '${escaparSql(fuente.slug)}'`
        : `where slug = '${escaparSql(fuente.slug)}' and problem_type = '${escaparSql(problemType)}'`;
    return (
      `update public.${tabla}\n` +
      `set nombre_en = '${escaparSql(traduccion.nombre)}',\n` +
      `    descripcion_en = ${desc},\n` +
      `    contenido_en = contenido || jsonb_build_object(\n      ${piezas.join(",\n      ")}\n    )\n` +
      `${donde};`
    );
  });
  return `${encabezado}\n\n${bloques.join("\n\n")}\n`;
}
