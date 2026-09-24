// Contenido de Aprender de Historia (Técnicas | Clases), fuente única:
//   - las Técnicas y Clases se escriben como objetos TS en tecnicas-<epoca>.ts /
//     clases-<epoca>.ts (uno por época: Prehistoria, Antigüedad, Edad Media, Edad
//     Moderna y Edad Contemporánea);
//   - TODO nombre y todo año sale de la TABLA CANÓNICA (src/lib/historia/hechos.ts y
//     personajes.ts) por id, con las ayudas de ayudas.ts; los visuales se arman con
//     ids y cada lección declara en `ensena` los hechos y personajes que enseña;
//   - la migración SQL se GENERA de acá (sql.ts) y lecciones.test.ts comprueba que
//     el archivo del repo coincida byte a byte;
//   - el camino de Aprender (src/lib/historia/path.ts) y el sidebar
//     (src/lib/aprender/grupos.ts) leen la época y el orden de acá;
//   - conceptos.ts define el grafo de dependencias que lecciones.test.ts verifica.
//
// PARA AGREGAR MÁS LECCIONES (por ejemplo, un bloque de historia nacional):
//   1. agregar filas a la tabla canónica (hechos.ts / personajes.ts) y regenerar
//      docs/HISTORIA_HECHOS.md (HISTORIA_ESCRIBIR_DOC=1 npx vitest run src/lib/historia);
//   2. sumar objetos al arreglo de la época (o, si es un bloque nuevo, una entrada
//      en src/lib/historia/epocas.ts y su archivo tecnicas-/clases-). Reglas: slug
//      con prefijo "historia-", `orden` correlativo dentro de la época, quiz con
//      `explicacion`, al menos un visual, `conceptos` y `ensena` con IDS válidos;
//   3. crear la migración con generarSqlHistoria (sql.ts) y un test que la compare,
//      igual que la de esta fase (ver lecciones.test.ts).
export { TECNICAS_HISTORIA } from "./tecnicas";
export { CLASES_HISTORIA } from "./clases";
export type { TecnicaHistoria, ClaseHistoria, LeccionHistoria, PreguntaLeccionHistoria, VisualLeccionHistoria, ConceptosLeccion, EnsenaLeccion } from "./tipos";
