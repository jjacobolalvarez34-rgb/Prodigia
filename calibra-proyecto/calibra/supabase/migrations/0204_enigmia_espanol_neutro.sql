-- ============================================================
-- Prodigia — Enigmia: español neutro (sin voseo) en las 6 Técnicas
-- históricas (fila 24 de docs/PARIDAD_MUNDOS.md).
--
-- 0015_mundo_enigmia.sql y 0020_enigmia_categorias.sql (deuda histórica,
-- YA APLICADAS en producción — editar esos archivos no cambiaría nada
-- real) sembraron `logic_techniques.contenido.pasos` en voseo rioplatense
-- ("Restá", "probá", "Agrupá", "Fijate", "Identificá", "Aplicá", "elegí",
-- "Separá", "podés", "Partí", "Repetí", "recorré", "Anotá"). 0186 después
-- reescribió `contenido` entero (pasos + quiz nuevo) pero copió el mismo
-- `pasos` viejo tal cual (`contenido->'pasos'`) y, sin querer, coló un
-- voseo nuevo en una pregunta de quiz de 'encontrar-intruso' ("¿qué
-- tenés que identificar primero?").
--
-- También había voseo en la columna `descripcion` (texto plano, NO dentro
-- del jsonb) de 2 filas: 'encontrar-intruso' ("...buscá qué categoría...")
-- y 'tecnicas-de-memoria' ("...si la partís en grupos chicos..."). Esta
-- migración corrige las 6 filas por slug: `contenido.pasos` (jsonb_set) en
-- las 6, `contenido.quiz` en 'encontrar-intruso' (el único con voseo real
-- en una pregunta: "¿qué tenés que identificar primero?"), y la columna
-- `descripcion` en 'encontrar-intruso' y 'tecnicas-de-memoria'. El resto
-- de cada fila (nombre, orden, categoria, el resto del quiz) no se toca.
--
-- Decisión sobre la excepción de espanolNeutro.test.ts (documentada acá
-- porque el test escanea el CONTENIDO DE LA MIGRACIÓN, no la base real —
-- y el archivo 0015/0020 completo, no solo las filas de logic_techniques):
-- se intentó sacar "0015_mundo_enigmia.sql"/"0020_enigmia_categorias.sql"
-- de DEUDA_HISTORICA_VOSEO y correr el test — siguen fallando, por DOS
-- motivos que quedan fuera del alcance de esta migración: (1) esos mismos
-- archivos también insertan `logic_puzzles` (el banco de Practicar, ver
-- src/lib/enigmia/generadores.ts — explícitamente fuera de alcance, no es
-- "Aprender"), con voseo real propio ("buscá", "Repetí", "partís" en sus
-- enunciados) que esta tanda no corrige por no ser su alcance; (2) el
-- detector de voseo da un falso positivo sobre el nombre propio "Tomás"
-- (termina en "á"+"s", igual que "tenés"/"podés") dentro de un enunciado
-- de logic_puzzles — un problema del detector en sí, no del contenido, y
-- tampoco corregible desde acá. Por eso 0015/0020 SIGUEN exceptuadas en
-- DEUDA_HISTORICA_VOSEO (son archivos viejos y ya aplicados, la deuda real
-- es imposible de saldar in situ) — lo único que cambia es que ahora la
-- excepción es más angosta de lo que hacía falta (la única razón real que
-- queda para necesitarla es logic_puzzles + el falso positivo de "Tomás",
-- no logic_techniques). Esta migración nueva (0204) NO se agrega a la
-- excepción — es nueva, su contenido tiene que pasar el chequeo de
-- español neutro sin ningún trato especial, y de hecho pasa.
-- ============================================================

update public.logic_techniques
set contenido = jsonb_set(
  contenido,
  '{pasos}',
  '[
    "Resta cada término menos el anterior: ¿la diferencia es siempre la misma?",
    "Si no es siempre la misma diferencia, prueba si cada término es el anterior multiplicado por algo.",
    "Con el patrón identificado, aplícalo al último término para hallar el que sigue."
  ]'::jsonb
)
where slug = 'patron-numerico';

update public.logic_techniques
set
  descripcion = 'Cuando te dan una lista, busca qué categoría comparten la mayoría — el que no encaja es la respuesta.',
  contenido = jsonb_set(
  jsonb_set(
    contenido,
    '{pasos}',
    '[
      "Agrupa los elementos por una característica común (color, categoría, forma).",
      "Fíjate cuál de los elementos NO comparte esa característica con los demás.",
      "Ese es el intruso — no hace falta que sepas por qué está ahí, solo que no encaja."
    ]'::jsonb
  ),
  '{quiz}',
  '[
    {
      "pregunta": "¿Cuál no pertenece al grupo? Manzana, Banana, Zanahoria, Naranja",
      "opciones": ["Manzana", "Banana", "Zanahoria", "Naranja"],
      "respuesta": "Zanahoria",
      "explicacion": "Manzana, Banana y Naranja son frutas — Zanahoria es una verdura, no comparte la característica del resto."
    },
    {
      "pregunta": "¿Cuál no pertenece al grupo? Perro, Gato, Águila, Caballo",
      "opciones": ["Perro", "Gato", "Águila", "Caballo"],
      "respuesta": "Águila",
      "explicacion": "Perro, Gato y Caballo son mamíferos — Águila es un ave, no comparte la característica del resto."
    },
    {
      "pregunta": "Según esta técnica, ¿qué tienes que identificar primero?",
      "opciones": ["La característica que comparten la mayoría de los elementos", "El elemento que aparece primero en la lista", "El elemento más largo de escribir", "El orden alfabético de la lista"],
      "respuesta": "La característica que comparten la mayoría de los elementos",
      "explicacion": "Es el primer paso: agrupar por lo que comparten la mayoría, para que el que no encaja quede en evidencia."
    }
  ]'::jsonb
)
where slug = 'encontrar-intruso';

update public.logic_techniques
set contenido = jsonb_set(
  contenido,
  '{pasos}',
  '[
    "Identifica la relación entre las dos primeras palabras (¿es parte de?, ¿es un tipo de?, ¿lo usa para?).",
    "Aplica esa misma relación a la tercera palabra.",
    "De las opciones, elige la que completa esa relación exacta — no una relación parecida."
  ]'::jsonb
)
where slug = 'analogias';

update public.logic_techniques
set contenido = jsonb_set(
  contenido,
  '{pasos}',
  '[
    "Separa la condición (el \"si...\") de la conclusión (el \"entonces...\").",
    "Que se cumpla la conclusión NO prueba que se cumplió la condición — puede haber otras causas.",
    "Solo puedes concluir con certeza en dos casos: se cumple la condición (entonces sí vale la conclusión), o NO se cumple la conclusión (entonces seguro no se cumplió la condición)."
  ]'::jsonb
)
where slug = 'condicional-si-entonces';

update public.logic_techniques
set
  descripcion = 'Es más fácil recordar una lista larga si la partes en grupos chicos en vez de memorizarla de corrido.',
  contenido = jsonb_set(
  contenido,
  '{pasos}',
  '[
    "Parte la lista en grupos de 2 o 3 elementos.",
    "Repite cada grupo por separado antes de juntarlos.",
    "Al final, recorre los grupos en orden para reconstruir la lista completa."
  ]'::jsonb
)
where slug = 'tecnicas-de-memoria';

update public.logic_techniques
set contenido = jsonb_set(
  contenido,
  '{pasos}',
  '[
    "Anota el valor inicial de la variable.",
    "Aplica cada instrucción en el orden exacto en que aparece, actualizando el valor.",
    "El valor final después de la última instrucción es la respuesta."
  ]'::jsonb
)
where slug = 'pensar-como-algoritmo';
