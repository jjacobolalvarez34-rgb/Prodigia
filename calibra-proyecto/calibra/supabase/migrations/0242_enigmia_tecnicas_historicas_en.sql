-- ============================================================
-- Prodigia — Enigmia: las 6 técnicas históricas en inglés (0242).
--
-- Estas 6 técnicas (patron-numerico, encontrar-intruso, analogias,
-- condicional-si-entonces, tecnicas-de-memoria, pensar-como-algoritmo) son
-- las 4 originales de 0015_mundo_enigmia.sql más las 2 de
-- 0020_enigmia_categorias.sql — quedaron fuera del sistema de traducción
-- de src/lib/i18n-lecciones porque nunca se migraron a la fuente TS que usa
-- ese sistema (src/lib/enigmia/lecciones): viven solo en la base, con el
-- formato viejo `{"pasos": [...], "ejemplo": {...}}` en vez de
-- `{"pasos": [...], "quiz": [...], "visuales": [...]}`. `pathClases.ts` SÍ
-- las trae junto con las otras 21 (no están de baja), así que son
-- contenido real, no huérfano — de ahí que esta migración las traduzca a
-- mano, por fuera del generador automático (no hay fórmulas ni código que
-- deban coincidir carácter a carácter, así que no hace falta el validador).
--
-- Con esto, Enigmia queda con sus 27 técnicas/clases (21 + estas 6)
-- traducidas: REGISTRO_TRADUCCIONES.enigmia pasa a completo=true.
-- Requiere 0225_lecciones_en_columnas.sql. Solo UPDATE por slug.
-- ============================================================

update public.logic_techniques set
  nombre_en = 'Find the numeric pattern',
  descripcion_en = 'Most sequences are solved by looking at what changes from one term to the next.',
  contenido_en = contenido || jsonb_build_object(
    'pasos', jsonb_build_array(
      'Subtract each term minus the previous one: is the difference always the same?',
      'If the difference isn''t always the same, check whether each term is the previous one multiplied by something.',
      'Once you''ve found the pattern, apply it to the last term to find the next one.'
    ),
    'ejemplo', jsonb_build_object(
      'enunciado', '1, 4, 7, 10, ?',
      'opciones', jsonb_build_array('11', '12', '13', '14'),
      'respuesta', '13'
    )
  )
where slug = 'patron-numerico';

update public.logic_techniques set
  nombre_en = 'Find the odd one out',
  descripcion_en = 'When you''re given a list, look for the category most items share — the one that doesn''t fit is the answer.',
  contenido_en = contenido || jsonb_build_object(
    'pasos', jsonb_build_array(
      'Group the items by a common trait (color, category, shape).',
      'Find which item does NOT share that trait with the rest.',
      'That''s the odd one out — you don''t need to know why it''s there, just that it doesn''t fit.'
    ),
    'ejemplo', jsonb_build_object(
      'enunciado', 'Which one doesn''t belong? Apple, Banana, Carrot, Orange',
      'opciones', jsonb_build_array('Apple', 'Banana', 'Carrot', 'Orange'),
      'respuesta', 'Carrot'
    )
  )
where slug = 'encontrar-intruso';

update public.logic_techniques set
  nombre_en = 'Analogies: A is to B as C is to ___',
  descripcion_en = 'An analogy asks you to find the SAME relationship in a second pair of words.',
  contenido_en = contenido || jsonb_build_object(
    'pasos', jsonb_build_array(
      'Identify the relationship between the first two words (is it part of? is it a type of? is it used for?).',
      'Apply that same relationship to the third word.',
      'Of the options, pick the one that completes that exact relationship — not just a similar one.'
    ),
    'ejemplo', jsonb_build_object(
      'enunciado', 'Circle is to Sphere as Square is to ___',
      'opciones', jsonb_build_array('Rectangle', 'Cube', 'Triangle', 'Line'),
      'respuesta', 'Cube'
    )
  )
where slug = 'analogias';

update public.logic_techniques set
  nombre_en = 'Deduction with "if... then"',
  descripcion_en = 'The most common mistake in logic is confusing "if A then B" with "if B then A" — they are not the same.',
  contenido_en = contenido || jsonb_build_object(
    'pasos', jsonb_build_array(
      'Separate the condition (the "if...") from the conclusion (the "then...").',
      'The conclusion being true does NOT prove the condition was met — there could be other causes.',
      'You can only conclude with certainty in two cases: the condition is met (so the conclusion holds), or the conclusion is NOT met (so the condition definitely wasn''t met either).'
    ),
    'ejemplo', jsonb_build_object(
      'enunciado', 'If it rains, the floor gets wet. The floor is wet. Did it definitely rain?',
      'opciones', jsonb_build_array('Yes', 'No', 'Can''t tell', 'Always'),
      'respuesta', 'Can''t tell'
    )
  )
where slug = 'condicional-si-entonces';

update public.logic_techniques set
  nombre_en = 'Chunk it to remember it',
  descripcion_en = 'A long list is easier to remember if you split it into small chunks instead of memorizing it all at once.',
  contenido_en = contenido || jsonb_build_object(
    'pasos', jsonb_build_array(
      'Split the list into chunks of 2 or 3 items.',
      'Repeat each chunk separately before putting them together.',
      'At the end, go through the chunks in order to rebuild the full list.'
    ),
    'ejemplo', jsonb_build_object(
      'enunciado', 'Memorize: 7, 2, 9, 4. Which number came third?',
      'opciones', jsonb_build_array('7', '2', '9', '4'),
      'respuesta', '9'
    )
  )
where slug = 'tecnicas-de-memoria';

update public.logic_techniques set
  nombre_en = 'Think step by step like an algorithm',
  descripcion_en = 'A "computational thinking" problem is solved by simulating each step in order, one at a time, without skipping any.',
  contenido_en = contenido || jsonb_build_object(
    'pasos', jsonb_build_array(
      'Write down the variable''s starting value.',
      'Apply each instruction in the exact order it appears, updating the value each time.',
      'The final value after the last instruction is the answer.'
    ),
    'ejemplo', jsonb_build_object(
      'enunciado', 'x=2. Repeat 3 times: x=x×2. What is x at the end?',
      'opciones', jsonb_build_array('6', '8', '16', '12'),
      'respuesta', '16'
    )
  )
where slug = 'pensar-como-algoritmo';

notify pgrst, 'reload schema';
