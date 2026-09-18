-- ============================================================
-- Prodigia — Proceso 1 (docs/PLAN_REVISION_CONTENIDO.md): Historia,
-- quinto mundo. Las 5 técnicas (0109_mundo_historia.sql) ya eran
-- correctas — son estrategias de memoria (anclaje cronológico, bloques
-- por siglo, asociación memorable, línea de tiempo mental, siglas
-- para secuencias), no trivia factual fija, así que la verificación
-- acá fue sobre la lógica de la técnica misma, no sobre datos
-- históricos sueltos:
--   * La única cuenta numérica citada por una lección ("un evento de
--     1969 es simplemente treinta y un años antes" de un ancla en el
--     año 2000) es aritmética real: 2000 - 1969 = 31. Verificado.
--   * "Esta técnica [línea de tiempo mental] es la que mejor funciona
--     para el modo Cronología" — Cronología es un modo real de
--     práctica de Historia (Historia.modos en messages/es.json y
--     modo_historia_aleatorio_por_rango en 0090_duelos_anatomia_
--     melodia.sql), verificado que sigue existiendo con ese nombre.
-- No se encontró ningún error factual/lógico en las 5 lecciones — no
-- hizo falta corregir ningún paso, solo agregar el quiz encima (update
-- por slug, nunca se toca 0109).
--
-- src/lib/historia/path.ts sigue siendo una lista plana (sin GRUPO_POR_
-- SLUG como Anatomía/Quimia) — se confirmó leyendo el archivo, no se
-- asumió: las 5 técnicas de Historia no se agrupan por modo de
-- práctica, es una sola unidad, tal como anticipaba el rollout de
-- AprenderLayout.
--
-- Cada pregunta prueba la técnica específica de esa lección, nunca
-- trivia suelta, mismo criterio que los mundos anteriores (0172-0175).
-- Historia no usa notación matemática, así que no aplica la
-- conversión $...$ acá.
-- ============================================================

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Según esta técnica, ¿qué necesitás elegir primero antes de ubicar fechas nuevas?",
    "opciones": ["Una fecha que ya tengas memorizada, para usar de referencia", "La fecha exacta de todos los eventos que vas a estudiar", "Un mapa del lugar donde ocurrió el evento", "El nombre de la persona involucrada"],
    "respuesta": "Una fecha que ya tengas memorizada, para usar de referencia",
    "explicacion": "Ese es el ancla — el punto de partida desde el que se calcula la distancia hacia cualquier fecha nueva."
  },
  {
    "pregunta": "Si tu ancla es el año 2000 y un evento ocurrió en 1969, según esta técnica ¿cómo lo ubicás?",
    "opciones": ["Calculando la distancia en años hacia el ancla (31 años antes)", "Memorizando 1969 como un dato completamente aparte", "Buscando otro evento del mismo año", "Ignorando el ancla y aprendiendo el año de memoria"],
    "respuesta": "Calculando la distancia en años hacia el ancla (31 años antes)",
    "explicacion": "2000 menos 1969 son 31 años — es el mismo ejemplo de la lección, calcular la distancia en vez de memorizar suelto."
  },
  {
    "pregunta": "Según esta técnica, ¿qué pasa a medida que acumulás más fechas bien aprendidas?",
    "opciones": ["Cada una puede servir como un nuevo ancla para ubicar otras fechas", "Dejan de ser útiles una vez aprendidas", "Solo sirven para fechas del mismo siglo exacto", "Hay que aprender un ancla nueva por cada evento"],
    "respuesta": "Cada una puede servir como un nuevo ancla para ubicar otras fechas",
    "explicacion": "Con el tiempo se acumulan varios anclas (una por siglo o tema) y cualquier fecha nueva se ubica contra la más cercana."
  }
]}'::jsonb
where slug = 'historia-anclaje-cronologico';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Según esta técnica, ¿qué conviene ubicar primero, antes del año exacto de un evento?",
    "opciones": ["El siglo o era en que ocurrió", "El nombre completo de todas las personas involucradas", "La ubicación geográfica exacta", "El día y el mes exactos"],
    "respuesta": "El siglo o era en que ocurrió",
    "explicacion": "Es el orden que pide la técnica: primero el bloque grande (siglo/era), recién después el año exacto adentro."
  },
  {
    "pregunta": "¿Por qué conviene agrupar los eventos en bloques grandes (como \"edad media\") antes de memorizar años exactos?",
    "opciones": ["Un bloque con pocos eventos es más fácil de repasar que una lista plana de muchas fechas sueltas", "Porque los años exactos no existen en la edad media", "Porque todos los eventos de un bloque ocurrieron el mismo año", "Porque los bloques reemplazan la necesidad de aprender años"],
    "respuesta": "Un bloque con pocos eventos es más fácil de repasar que una lista plana de muchas fechas sueltas",
    "explicacion": "Es la razón que da la propia lección para agrupar antes de afinar el año exacto."
  },
  {
    "pregunta": "Según esta técnica, ¿en qué orden conviene aprender un evento nuevo?",
    "opciones": ["Primero el bloque (siglo/era), después el año exacto adentro de ese bloque", "Primero el año exacto, después ubicarlo en un bloque", "Los dos al mismo tiempo, sin ningún orden particular", "Ninguno de los dos hace falta si conocés el nombre del evento"],
    "respuesta": "Primero el bloque (siglo/era), después el año exacto adentro de ese bloque",
    "explicacion": "La lección lo dice explícitamente: \"nunca al revés\" — el bloque siempre va antes que la precisión del año."
  }
]}'::jsonb
where slug = 'historia-bloques-por-siglo';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Según esta técnica, ¿qué hace que una asociación mental se recuerde mejor?",
    "opciones": ["Que sea exagerada o graciosa, aunque no tenga sentido para otra persona", "Que sea una frase oficial tomada de un libro de historia", "Que use únicamente números, sin imágenes", "Que sea la más seria y formal posible"],
    "respuesta": "Que sea exagerada o graciosa, aunque no tenga sentido para otra persona",
    "explicacion": "La lección lo dice de forma explícita: cuanto más rara o graciosa, mejor se queda — no hace falta que tenga sentido para otro."
  },
  {
    "pregunta": "¿Qué se recomienda hacer al día siguiente de crear una asociación memorable, según esta técnica?",
    "opciones": ["Revisarla una vez más — ese segundo repaso es el que la fija de verdad", "Olvidarla y crear una nueva distinta", "Repetirla 20 veces en el mismo momento en que se creó", "Nada — con crearla una vez ya alcanza para siempre"],
    "respuesta": "Revisarla una vez más — ese segundo repaso es el que la fija de verdad",
    "explicacion": "Es el último paso que da la lección: el repaso del día siguiente es el que realmente fija el recuerdo."
  },
  {
    "pregunta": "Según el ejemplo de esta técnica, ¿qué podrías imaginar para recordar una fecha con varios cuatros?",
    "opciones": ["Cuatro objetos relacionados con el evento", "Un solo objeto gigante", "Una lista escrita de números", "Nada, los números no se asocian con imágenes"],
    "respuesta": "Cuatro objetos relacionados con el evento",
    "explicacion": "Es el mismo ejemplo de la lección: convertir el número en una imagen concreta y exagerada."
  }
]}'::jsonb
where slug = 'historia-asociacion-memorable';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Según esta técnica, ¿cómo conviene imaginar los eventos de un período histórico?",
    "opciones": ["Como puntos ubicados en una línea recta, no como una lista para recitar", "Como una tabla con filas y columnas", "Como un árbol genealógico", "Como una lista alfabética por nombre de evento"],
    "respuesta": "Como puntos ubicados en una línea recta, no como una lista para recitar",
    "explicacion": "Es la imagen central de la técnica: una línea imaginaria que cruza el cuarto, del pasado más lejano a hoy."
  },
  {
    "pregunta": "Cuando te preguntan el orden de varios eventos, según esta técnica, ¿qué conviene hacer?",
    "opciones": ["\"Caminar\" mentalmente por la línea de un extremo al otro, en vez de recordar una lista", "Recitar la lista completa desde el principio cada vez", "Ordenarlos alfabéticamente", "Adivinar el orden al azar"],
    "respuesta": "\"Caminar\" mentalmente por la línea de un extremo al otro, en vez de recordar una lista",
    "explicacion": "Es la palabra exacta que usa la lección: \"caminar\" la línea convierte ordenar en leer, no en calcular."
  },
  {
    "pregunta": "¿Para qué modo de práctica funciona mejor esta técnica, según la lección?",
    "opciones": ["Cronología", "Fechas exactas", "Causa y efecto", "Personajes"],
    "respuesta": "Cronología",
    "explicacion": "La lección lo dice explícitamente: esta técnica es la que mejor funciona para el modo Cronología."
  }
]}'::jsonb
where slug = 'historia-linea-de-tiempo-mental';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Según esta técnica, ¿de dónde se toma cada letra de la sigla?",
    "opciones": ["De la primera letra (o sílaba) de cada evento, en el orden correcto", "De una palabra elegida al azar sin relación con los eventos", "Del nombre del país donde ocurrió cada evento", "De la última letra de cada evento"],
    "respuesta": "De la primera letra (o sílaba) de cada evento, en el orden correcto",
    "explicacion": "Es el primer paso de la técnica: tomar la primera letra o sílaba de cada evento, respetando el orden real."
  },
  {
    "pregunta": "¿Hace falta que la sigla armada sea una palabra real del diccionario, según esta técnica?",
    "opciones": ["No, alcanza con que sea fácil de pronunciar para vos", "Sí, siempre tiene que ser una palabra oficial", "Sí, pero solo si el evento es antiguo", "No se puede usar ninguna sigla que no sea real"],
    "respuesta": "No, alcanza con que sea fácil de pronunciar para vos",
    "explicacion": "La lección lo aclara explícitamente: no hace falta que sea una palabra real, alcanza con que resulte fácil de pronunciar."
  },
  {
    "pregunta": "Según esta técnica, ¿qué combinación funciona mejor para recordar el orden Y el contexto de una secuencia de eventos?",
    "opciones": ["La sigla (para el orden) combinada con la línea de tiempo mental (para el contexto)", "La sigla sola, sin ninguna otra técnica", "Memorizar cada evento por separado sin ningún truco", "Un mapa geográfico de cada evento"],
    "respuesta": "La sigla (para el orden) combinada con la línea de tiempo mental (para el contexto)",
    "explicacion": "La lección lo dice explícitamente: la sigla da el ORDEN, la línea de tiempo mental da el CONTEXTO."
  }
]}'::jsonb
where slug = 'historia-siglas-para-secuencias';
