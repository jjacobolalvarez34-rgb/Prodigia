// Contenido de Aprender de Quimia (Técnicas | Clases), fuente única:
//   - las Técnicas y Clases se escriben como objetos TS en
//     tecnicas-<grupo>.ts / clases-<grupo>.ts (uno por grupo temático);
//   - la migración SQL se GENERA de acá (sql.ts) y lecciones.test.ts
//     comprueba que el archivo del repo coincida byte a byte;
//   - el camino de Aprender (src/lib/quimia/path.ts) y el sidebar
//     (src/lib/aprender/grupos.ts) leen el grupo y el orden de acá.
//
// PARA AGREGAR MÁS LECCIONES (ya están las dos tandas: 0209 y 0211):
//   1. sumar objetos al arreglo del grupo (tecnicas-<grupo>.ts,
//      clases-<grupo>.ts). Reglas: slug con prefijo "quimia-", `orden`
//      correlativo dentro del grupo, quiz con `explicacion`, al menos un visual,
//      fórmulas con f()/ion()/ox() y nombres desde las tablas de
//      src/lib/quimia/nomenclatura.ts (ver ayudas.ts) o, en la tanda 2, desde
//      ayudasTanda2.ts (ecu() lanza si una ecuación no está balanceada);
//   2. crear la migración con generarSqlQuimia (sql.ts) y un test que la
//      compare, igual que 0209 y 0211 (ver lecciones.test.ts);
//   3. si hace falta un visual nuevo: src/lib/quimia/visuales.ts,
//      src/components/quimia/visuales/ y registro.ts.
// No hace falta tocar path.ts ni las páginas: los grupos sin lecciones no
// aparecen en el sidebar y los nuevos se ordenan solos por (grupo, orden).
export { TECNICAS_QUIMIA, TECNICAS_QUIMIA_TANDA1, TECNICAS_QUIMIA_TANDA2 } from "./tecnicas";
export { CLASES_QUIMIA, CLASES_QUIMIA_TANDA1, CLASES_QUIMIA_TANDA2 } from "./clases";
export type { TecnicaQuimia, ClaseQuimia, PreguntaLeccionQuimia, VisualLeccionQuimia } from "./tipos";
