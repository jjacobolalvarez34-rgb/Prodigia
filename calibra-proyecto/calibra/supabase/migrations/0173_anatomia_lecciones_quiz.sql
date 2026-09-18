-- ============================================================
-- Prodigia — Proceso 1 (docs/PLAN_REVISION_CONTENIDO.md): Anatomía,
-- segundo mundo de la revisión pedagógica de Aprender. Las 5 técnicas
-- (0081_mundo_anatomia.sql) ya eran correctas — se verificó cada dato
-- anatómico usado en el quiz contra la clasificación estándar (huesos
-- del cráneo por zona, nombre de músculos, pares craneales por
-- función sensorial/motora/mixta, órganos por cavidad) — no hizo falta
-- corregir ningún paso, solo agregar el quiz encima (update por slug,
-- nunca se toca 0081).
--
-- Cada pregunta prueba la técnica específica de esa lección, nunca
-- trivia suelta, mismo criterio que Geografía (0172). Anatomía no usa
-- notación matemática, así que tampoco aplica la conversión $...$ acá.
-- ============================================================

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿A qué grupo pertenece el hueso frontal, según esta técnica?",
    "opciones": ["Bóveda", "Cara", "Internos"],
    "respuesta": "Bóveda",
    "explicacion": "El frontal es parte de la bóveda craneal, junto con parietal, temporal y occipital."
  },
  {
    "pregunta": "¿Cuáles de estos huesos forman parte de la cara, según esta técnica?",
    "opciones": ["Maxilar y mandíbula", "Frontal y occipital", "Esfenoides y etmoides", "Parietal y temporal"],
    "respuesta": "Maxilar y mandíbula",
    "explicacion": "Maxilar y mandíbula son huesos de la cara, junto con cigomático y nasal."
  },
  {
    "pregunta": "¿Qué dos huesos forman el grupo de los \"internos\", que no se tocan desde afuera?",
    "opciones": ["Esfenoides y etmoides", "Maxilar y mandíbula", "Frontal y parietal", "Cigomático y nasal"],
    "respuesta": "Esfenoides y etmoides",
    "explicacion": "Son los dos huesos internos del cráneo, a diferencia de los de la bóveda y la cara."
  }
]}'::jsonb
where slug = 'anatomia-craneo-por-zona';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿Por qué se llama \"orbicular\" al músculo que rodea el ojo?",
    "opciones": ["Porque forma un círculo (una órbita) alrededor del ojo", "Es un nombre arbitrario sin relación con su forma", "Porque está cerca del hueso orbital exclusivamente", "Porque solo se mueve en órbitas circulares grandes"],
    "respuesta": "Porque forma un círculo (una órbita) alrededor del ojo",
    "explicacion": "El nombre describe literalmente la forma circular del músculo — la técnica es leer el nombre como pista."
  },
  {
    "pregunta": "El músculo \"temporal\" está ubicado en...",
    "opciones": ["La sien", "La nuca", "La mandíbula", "El cuello"],
    "respuesta": "La sien",
    "explicacion": "Temporal está en la sien — la misma zona donde aparecen las canas (\"temporales\")."
  },
  {
    "pregunta": "¿Dónde se ancla el cigomático mayor?",
    "opciones": ["En el hueso cigomático (el pómulo)", "En el hueso frontal", "En la mandíbula", "En el hueso occipital"],
    "respuesta": "En el hueso cigomático (el pómulo)",
    "explicacion": "El nombre del músculo señala directamente el hueso donde se ancla."
  }
]}'::jsonb
where slug = 'anatomia-nombre-del-musculo';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿A qué grupo pertenece el nervio óptico (II), según esta técnica?",
    "opciones": ["Sensorial puro", "Motor puro", "Mixto"],
    "respuesta": "Sensorial puro",
    "explicacion": "Junto con el olfatorio y el vestibulococlear, solo manda información — no mueve nada."
  },
  {
    "pregunta": "¿Cuál de estos pares craneales es motor puro?",
    "opciones": ["Abducens (VI)", "Óptico (II)", "Trigémino (V)", "Vago (X)"],
    "respuesta": "Abducens (VI)",
    "explicacion": "Junto con oculomotor, troclear, accesorio e hipogloso, solo mueve algo — no manda información sensorial."
  },
  {
    "pregunta": "¿Qué tienen en común el trigémino, el facial, el glosofaríngeo y el vago?",
    "opciones": ["Son mixtos: mandan información Y mueven algo", "Son todos sensoriales puros", "Son todos motores puros", "No tienen ninguna función conocida"],
    "respuesta": "Son mixtos: mandan información Y mueven algo",
    "explicacion": "Es el tercer grupo de la técnica — los que hacen las dos cosas a la vez."
  }
]}'::jsonb
where slug = 'anatomia-nervios-por-funcion';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Según esta técnica, ¿qué grupo de músculos conviene dominar primero?",
    "opciones": ["Los grandes y cotidianos (bíceps, cuádriceps, pectoral...)", "Los de la cara (frontal, masetero...)", "Los dos grupos a la vez, sin orden", "Ninguno en particular"],
    "respuesta": "Los grandes y cotidianos (bíceps, cuádriceps, pectoral...)",
    "explicacion": "Son los que más se repiten en cualquier contexto — el mismo criterio que agrupar países grandes primero en Geografía."
  },
  {
    "pregunta": "¿Cuál de estos es un músculo del grupo grande y cotidiano?",
    "opciones": ["Cuádriceps", "Masetero", "Buccinador", "Orbicular"],
    "respuesta": "Cuádriceps",
    "explicacion": "Cuádriceps está en el grupo grande, junto con bíceps, tríceps, pectoral, trapecio y glúteos."
  },
  {
    "pregunta": "¿Cuál de estos es un músculo del grupo \"de la cara, más fino\"?",
    "opciones": ["Masetero", "Bíceps", "Trapecio", "Glúteos"],
    "respuesta": "Masetero",
    "explicacion": "Masetero es un músculo facial — el segundo grupo, más chico y específico."
  }
]}'::jsonb
where slug = 'anatomia-simple-a-compuesto';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿En qué cavidad está el hígado?",
    "opciones": ["Abdominal", "Torácica", "Pélvica", "Craneal"],
    "respuesta": "Abdominal",
    "explicacion": "El hígado vive en el cajón abdominal, junto con estómago, riñones, intestino, páncreas y bazo."
  },
  {
    "pregunta": "¿Qué órganos están en la cavidad torácica, según esta técnica?",
    "opciones": ["Corazón y pulmones", "Hígado y estómago", "Vejiga", "Cerebro"],
    "respuesta": "Corazón y pulmones",
    "explicacion": "Son los dos órganos del cajón torácico (el pecho)."
  },
  {
    "pregunta": "¿Cuál es el único órgano de esta lista que vive en la cavidad craneal?",
    "opciones": ["Cerebro", "Riñones", "Bazo", "Vejiga"],
    "respuesta": "Cerebro",
    "explicacion": "El cerebro es el único de los 10 órganos principales que vive fuera del tronco, en la cabeza."
  }
]}'::jsonb
where slug = 'anatomia-organos-por-cavidad';
