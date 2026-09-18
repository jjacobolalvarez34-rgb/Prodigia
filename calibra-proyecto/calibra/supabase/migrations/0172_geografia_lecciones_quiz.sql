-- ============================================================
-- Prodigia — Proceso 1 (docs/PLAN_REVISION_CONTENIDO.md): Geografía es
-- el primer mundo de la revisión pedagógica de Aprender. Sus 3 técnicas
-- (0027_geografia_lecciones.sql) ya eran correctas — son estrategias de
-- memoria (agrupar por sub-región, anclar por vecino, reconocer por
-- forma), no datos factuales, y no tenían ningún error real. Lo que les
-- faltaba, como a casi todas las técnicas de la app hoy, era un
-- ejercicio que probara si de verdad se entendió — nunca se agrega acá
-- editando 0027 (regla del plan: nunca tocar una migración vieja), se
-- agrega el quiz encima con un update por slug.
--
-- Cada pregunta del quiz prueba específicamente la técnica de ESA
-- lección (nunca un dato suelto de trivia sin relación) — pedido
-- explícito del usuario 2026-09-18. Los datos geográficos reales
-- usados (Argentina al sur de Brasil; Italia con forma de bota; Chile
-- como franja angosta) están verificados, y los dos últimos son
-- literalmente los mismos ejemplos que ya trae cada lección.
--
-- Geografía no usa ninguna notación matemática, así que no aplica la
-- convención $...$ de MathText en este mundo — no hay nada que
-- convertir.
-- ============================================================

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿Cuál es la ventaja principal de agrupar países en sub-regiones antes de memorizarlos?",
    "opciones": ["Es más fácil recordar pocos bloques grandes que muchos países sueltos", "Los países cambian de nombre según la región", "Todas las regiones tienen la misma cantidad de países", "No hace falta aprender ningún país individual"],
    "respuesta": "Es más fácil recordar pocos bloques grandes que muchos países sueltos",
    "explicacion": "Es la idea central de la técnica: 5 países de una región se recuerdan mucho más fácil que 25 sueltos."
  },
  {
    "pregunta": "¿Cuál de estos es un ejemplo real de sub-región dentro de un continente?",
    "opciones": ["Centroamérica (dentro de América)", "El hemisferio norte (dentro de la Tierra)", "El océano Pacífico (dentro de Asia)", "La capital de un país (dentro de ese país)"],
    "respuesta": "Centroamérica (dentro de América)",
    "explicacion": "Es el mismo ejemplo de la lección: Centroamérica es un bloque distinto de Sudamérica."
  },
  {
    "pregunta": "Según esta técnica, ¿qué conviene aprender primero?",
    "opciones": ["Dónde está el bloque de la sub-región completa en el mapa", "El nombre de la capital de cada país", "La bandera de cada país", "La población exacta de cada país"],
    "respuesta": "Dónde está el bloque de la sub-región completa en el mapa",
    "explicacion": "Recién después de ubicar el bloque grande conviene ubicar los países de adentro, uno por uno."
  }
]}'::jsonb
where slug = 'dividir-en-subregiones';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Según esta técnica, ¿qué necesitás primero para ubicar un país nuevo?",
    "opciones": ["Un país que ya ubicás sin dudar, para usar de referencia", "Memorizar las coordenadas exactas", "Aprenderte la bandera del país nuevo", "Saber cuántos habitantes tiene"],
    "respuesta": "Un país que ya ubicás sin dudar, para usar de referencia",
    "explicacion": "Esa es el ancla — el punto de partida desde el que se ubica todo lo demás."
  },
  {
    "pregunta": "Si tu ancla es Brasil (que ya ubicás bien), ¿en qué dirección aproximada buscás Argentina?",
    "opciones": ["Al sur", "Al norte", "Al este", "Al oeste"],
    "respuesta": "Al sur",
    "explicacion": "Argentina está al sur de Brasil — exactamente el tipo de pregunta que resuelve esta técnica."
  },
  {
    "pregunta": "¿Qué pasa con cada país que aprendés bien, según esta técnica?",
    "opciones": ["Se convierte en una nueva ancla para ubicar otros países", "Deja de servir como referencia una vez aprendido", "Solo sirve para ubicar países del mismo continente", "Se olvida apenas aprendés uno nuevo"],
    "respuesta": "Se convierte en una nueva ancla para ubicar otros países",
    "explicacion": "El mapa se arma en cadena: cada país nuevo aprendido se puede usar de ancla para el siguiente."
  }
]}'::jsonb
where slug = 'anclar-por-vecinos';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Según esta técnica, ¿qué conviene mirar primero para reconocer un país en el mapa?",
    "opciones": ["Su silueta general, antes que los detalles de la frontera", "El color con el que está pintado en el mapa", "El tamaño exacto en kilómetros cuadrados", "El nombre escrito arriba del país"],
    "respuesta": "Su silueta general, antes que los detalles de la frontera",
    "explicacion": "Muchos países se reconocen de un vistazo por su forma general, sin necesidad de ver los detalles finos de la frontera."
  },
  {
    "pregunta": "¿Qué país tiene una forma característica de bota?",
    "opciones": ["Italia", "Chile", "Egipto", "Japón"],
    "respuesta": "Italia",
    "explicacion": "Es el mismo ejemplo de la lección — la bota es la silueta más reconocible de Europa."
  },
  {
    "pregunta": "¿Qué país es una franja larga y angosta pegada a la cordillera?",
    "opciones": ["Chile", "Italia", "Brasil", "México"],
    "respuesta": "Chile",
    "explicacion": "Es el mismo ejemplo de la lección — Chile es alargado de norte a sur y muy angosto de este a oeste."
  }
]}'::jsonb
where slug = 'forma-caracteristica';
