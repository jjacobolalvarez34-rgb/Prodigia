// Contenido de Aprender de Trigonometría (Técnicas | Clases), fuente única:
//   - las Técnicas y Clases se escriben como objetos TS en tecnicas-<bloque>.ts /
//     clases-<bloque>.ts (uno por bloque del currículo);
//   - la migración SQL se GENERA de acá (sql.ts) y lecciones.test.ts comprueba
//     que el archivo del repo coincida byte a byte;
//   - el camino de Aprender (src/lib/trigonometria/path.ts) y el sidebar
//     (src/lib/aprender/grupos.ts) leen el grupo y el orden de acá;
//   - conceptos.ts define el grafo de dependencias que lecciones.test.ts verifica.
//
// PARA AGREGAR MÁS LECCIONES:
//   1. sumar objetos al arreglo del bloque. Reglas: slug con prefijo
//      "trigonometria-", `orden` correlativo dentro del bloque, quiz con
//      `explicacion`, al menos un visual, `conceptos` (introduce/usa) con IDs de
//      conceptos.ts, y todo número o fórmula tomado de las funciones puras
//      (exactos.ts, triangulos.ts, ondas.ts, ecuaciones.ts, identidades.ts);
//   2. crear la migración con generarSqlTrigonometria (sql.ts) y un test que la
//      compare, igual que la de esta fase (ver lecciones.test.ts);
//   3. si hace falta un visual nuevo: src/lib/trigonometria/visuales.ts,
//      visualesDatos.ts y src/components/trigonometria/visuales/ (+ registro.ts).
// FASE 2 (modos de práctica de gráficas y ecuaciones): los bloques "graficas" y
// "ecuaciones" ya tienen su contenido; solo hay que poner el modo en
// src/lib/trigonometria/bloques.ts (modoPractica) y migrar skill_levels.
export { TECNICAS_TRIGONOMETRIA } from "./tecnicas";
export { CLASES_TRIGONOMETRIA } from "./clases";
export type { TecnicaTrigonometria, ClaseTrigonometria, PreguntaLeccionTrigonometria, VisualLeccionTrigonometria, ConceptosLeccion } from "./tipos";
