-- ============================================================
-- Prodigia — Proceso 1 (docs/PLAN_REVISION_CONTENIDO.md): Enigmia,
-- último mundo pendiente, y el único con un bug real de VERIFICACIÓN
-- (no solo de contenido): las 6 lecciones de logic_techniques ya
-- traían un "ejemplo" de una sola pregunta desde 0015/0020, pero
-- nunca se validaba si la respuesta elegida era la correcta —
-- LeccionEnigmiaClient.tsx solo deshabilitaba el botón "Listo"
-- mientras `respuesta === null` (cualquier opción, incluso la mal
-- elegida, lo habilitaba), y POST /api/enigmia/completar-leccion
-- marcaba dominado=true sin recibir ni mirar ninguna respuesta. Se
-- podía "aprobar" cualquier lección eligiendo la opción incorrecta a
-- propósito.
--
-- Se verificaron las 6 lecciones (patrón numérico, intruso, analogías,
-- condicional si-entonces, memoria por grupos, pensamiento
-- algorítmico) contra lógica real — ningún error encontrado. Se
-- convierte el `ejemplo` de 1 pregunta a `quiz` de 3 (mismo formato
-- TechniqueQuizPregunta que el resto de la app, con explicacion),
-- reescribiendo `contenido` completo por slug — nunca se edita
-- 0015/0020, es una migración nueva. La corrección real de
-- verificación va en el código (path.ts, LeccionEnigmiaClient.tsx,
-- completar-leccion/route.ts), no acá.
-- ============================================================

update public.logic_techniques
set contenido = jsonb_build_object(
  'pasos', contenido->'pasos',
  'quiz', '[
    {
      "pregunta": "1, 4, 7, 10, ?",
      "opciones": ["11", "12", "13", "14"],
      "respuesta": "13",
      "explicacion": "La diferencia entre términos es siempre +3 (4-1=3, 7-4=3, 10-7=3) — el siguiente es 10+3=13."
    },
    {
      "pregunta": "3, 6, 12, 24, ?",
      "opciones": ["30", "36", "48", "42"],
      "respuesta": "48",
      "explicacion": "Acá la diferencia NO es constante (6-3=3, 12-6=6) — cada término es el anterior multiplicado por 2, así que sigue 24×2=48."
    },
    {
      "pregunta": "Según esta técnica, si la diferencia entre términos no es siempre la misma, ¿qué deberías probar después?",
      "opciones": ["Si cada término es el anterior multiplicado por algo", "Sumar todos los términos", "Que la secuencia está mal escrita", "Contar cuántos términos hay"],
      "respuesta": "Si cada término es el anterior multiplicado por algo",
      "explicacion": "Es el segundo paso de la técnica: si restar no da un patrón constante, probar la multiplicación."
    }
  ]'::jsonb
)
where slug = 'patron-numerico';

update public.logic_techniques
set contenido = jsonb_build_object(
  'pasos', contenido->'pasos',
  'quiz', '[
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
      "pregunta": "Según esta técnica, ¿qué tenés que identificar primero?",
      "opciones": ["La característica que comparten la mayoría de los elementos", "El elemento que aparece primero en la lista", "El elemento más largo de escribir", "El orden alfabético de la lista"],
      "respuesta": "La característica que comparten la mayoría de los elementos",
      "explicacion": "Es el primer paso: agrupar por lo que comparten la mayoría, para que el que no encaja quede en evidencia."
    }
  ]'::jsonb
)
where slug = 'encontrar-intruso';

update public.logic_techniques
set contenido = jsonb_build_object(
  'pasos', contenido->'pasos',
  'quiz', '[
    {
      "pregunta": "Círculo es a Esfera como Cuadrado es a ___",
      "opciones": ["Rectángulo", "Cubo", "Triángulo", "Línea"],
      "respuesta": "Cubo",
      "explicacion": "La relación es \"figura 2D a su equivalente 3D\" — el equivalente 3D de un cuadrado es un cubo."
    },
    {
      "pregunta": "Perro es a Cachorro como Gato es a ___",
      "opciones": ["Gatito", "Felino", "Bigotes", "Ratón"],
      "respuesta": "Gatito",
      "explicacion": "La relación es \"animal adulto a su cría\" — la cría de un gato es un gatito."
    },
    {
      "pregunta": "Según esta técnica, ¿qué es lo más importante al elegir la respuesta de una analogía?",
      "opciones": ["Que aplique la MISMA relación entre el segundo par, no una parecida", "Que sea la opción más corta", "Que empiece con la misma letra", "Que sea la primera opción de la lista"],
      "respuesta": "Que aplique la MISMA relación entre el segundo par, no una parecida",
      "explicacion": "Una relación parecida pero distinta (por ejemplo, otro tipo de asociación) no cuenta como respuesta correcta."
    }
  ]'::jsonb
)
where slug = 'analogias';

update public.logic_techniques
set contenido = jsonb_build_object(
  'pasos', contenido->'pasos',
  'quiz', '[
    {
      "pregunta": "Si llueve, el piso se moja. El piso está mojado. ¿Llovió seguro?",
      "opciones": ["Sí", "No", "No se sabe", "Siempre"],
      "respuesta": "No se sabe",
      "explicacion": "El piso podría estar mojado por otra causa (alguien lo lavó) — que se cumpla la conclusión no prueba la condición."
    },
    {
      "pregunta": "Si llueve, el piso se moja. El piso NO está mojado. ¿Llovió?",
      "opciones": ["No", "Sí", "No se sabe", "Siempre"],
      "respuesta": "No",
      "explicacion": "Si hubiera llovido, el piso estaría mojado — como no lo está, seguro no llovió (uno de los dos casos válidos de la técnica)."
    },
    {
      "pregunta": "Si llueve, el piso se moja. Llovió. ¿El piso está mojado?",
      "opciones": ["Sí", "No", "No se sabe", "Depende del piso"],
      "respuesta": "Sí",
      "explicacion": "Se cumple la condición (llovió), así que la conclusión vale con certeza — el otro caso válido de la técnica."
    }
  ]'::jsonb
)
where slug = 'condicional-si-entonces';

update public.logic_techniques
set contenido = jsonb_build_object(
  'pasos', contenido->'pasos',
  'quiz', '[
    {
      "pregunta": "Memorizá: 7, 2, 9, 4. ¿Cuál número fue el tercero?",
      "opciones": ["7", "2", "9", "4"],
      "respuesta": "9",
      "explicacion": "La lista en orden es 7, 2, 9, 4 — el tercer número es 9."
    },
    {
      "pregunta": "Memorizá: 5, 8, 1, 3, 6. ¿Cuál número fue el cuarto?",
      "opciones": ["1", "8", "3", "6"],
      "respuesta": "3",
      "explicacion": "La lista en orden es 5, 8, 1, 3, 6 — el cuarto número es 3."
    },
    {
      "pregunta": "Según esta técnica, ¿qué conviene hacer con una lista larga antes de memorizarla de corrido?",
      "opciones": ["Partirla en grupos chicos de 2 o 3 elementos", "Leerla una sola vez muy rápido", "Memorizarla al revés", "Escribirla en mayúsculas"],
      "respuesta": "Partirla en grupos chicos de 2 o 3 elementos",
      "explicacion": "Es la idea central de la técnica: agrupar reduce la carga de memoria comparado con memorizar todo de corrido."
    }
  ]'::jsonb
)
where slug = 'tecnicas-de-memoria';

update public.logic_techniques
set contenido = jsonb_build_object(
  'pasos', contenido->'pasos',
  'quiz', '[
    {
      "pregunta": "x=2. Repetí 3 veces: x=x×2. ¿Cuánto vale x al final?",
      "opciones": ["6", "8", "16", "12"],
      "respuesta": "16",
      "explicacion": "2→4 (primera vez)→8 (segunda vez)→16 (tercera vez)."
    },
    {
      "pregunta": "x=5. Repetí 2 veces: x=x+3. ¿Cuánto vale x al final?",
      "opciones": ["8", "11", "13", "6"],
      "respuesta": "11",
      "explicacion": "5→8 (primera vez)→11 (segunda vez)."
    },
    {
      "pregunta": "Según esta técnica, ¿cómo se resuelve un problema de pensamiento computacional?",
      "opciones": ["Simulando cada paso en el orden exacto, sin saltarse ninguno", "Adivinando el resultado final directamente", "Resolviendo los pasos en orden inverso", "Ignorando los pasos repetidos"],
      "respuesta": "Simulando cada paso en el orden exacto, sin saltarse ninguno",
      "explicacion": "Saltarse un paso o cambiar el orden da un resultado distinto al real — hay que simular cada instrucción tal cual aparece."
    }
  ]'::jsonb
)
where slug = 'pensar-como-algoritmo';
