// Contenido de Aprender de Estadística (Técnicas | Clases), fuente única:
//   - las Técnicas y Clases se escriben como objetos TS en tecnicas.ts / clases.ts
//     (el texto y el quiz son los sembrados en la migración 0191);
//   - la migración de visuales se GENERA de acá (sql.ts) y lecciones.test.ts
//     comprueba que el archivo del repo coincida byte a byte;
//   - los temas del sidebar y del desbloqueo (src/lib/aprender/grupos.ts y
//     src/lib/estadistica/path.ts) tienen que cubrir exactamente estos slugs
//     (lecciones.test.ts y path.test.ts lo comprueban).
//
// PARA AGREGAR MÁS LECCIONES: sumar el objeto (slug con prefijo "estadistica-",
// `orden` correlativo, al menos un visual, quiz con `explicacion` si es Clase),
// agregar el slug a su tema en grupos.ts, crear la migración con
// generarSqlEstadistica (sql.ts) y mantener el test que la compara. Si hace
// falta un visual nuevo: src/lib/estadistica/visuales.ts, visualesDatos.ts y
// src/components/estadistica/visuales/ (+ registro.ts).
export { TECNICAS_ESTADISTICA } from "./tecnicas";
export { CLASES_ESTADISTICA } from "./clases";
export type { TecnicaEstadistica, ClaseEstadistica, PreguntaLeccionEstadistica, VisualLeccionEstadistica } from "./tipos";
