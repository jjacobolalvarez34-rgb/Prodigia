-- ============================================================
-- Prodigia — Historia: rediseño del mundo (Aprender pasa a Técnicas | Clases con 5
-- bloques por época: Prehistoria, Antigüedad, Edad Media, Edad Moderna y Edad
-- Contemporánea; docs/PARIDAD_MUNDOS.md filas 22/23 y la sección "Historia: rediseño
-- del mundo").
--
-- Antes: 5 Técnicas mnemotécnicas genéricas (0109 + quiz de 0176), sin Clases, sin
-- visuales, sin contenido de historia y con voseo rioplatense. Ahora:
--   - las 5 Técnicas existentes se REESCRIBEN por slug: español neutro, ejemplos con
--     hechos reales, quiz revisado y visuales (los ids de las filas no cambian, así
--     que el progreso de quien ya las completó se conserva);
--   - Técnicas nuevas por época (4 a 6 por época), gratis;
--   - Clases nuevas por época (2 a 8 por época), Pro; se desbloquean por época y cada
--     una repasa en un paso "Contexto:" lo que usa de épocas anteriores. La primera
--     (Prehistoria) es preview gratis.
--
-- Alcance: SOLO historia universal (sin bloque nacional). Del siglo XX y hasta hoy solo
-- hechos de amplio consenso, con fecha y protagonistas, sin interpretación política ni
-- cifras discutidas. Todo nombre y todo año sale de la tabla canónica
-- src/lib/historia/{hechos,personajes}.ts (listada para revisión humana en
-- docs/HISTORIA_HECHOS.md); las lecciones traen `contenido.visuales` con los visuales
-- "historia.*" (que solo llevan ids de hechos y de personajes) y el primitivo genérico
-- "cuadros". Esta migración NO toca skill_levels.
--
-- Efecto conocido: agregar filas `techniques` cambia el total de lecciones del nivel de
-- mundo (registrar_puntos_mundo) para quien no tenga Pro: las Clases cuentan en el total
-- pero el plan gratuito no puede completarlas (mismo caso documentado para Calculia en
-- PARIDAD_MUNDOS.md). Se deja así a propósito.
--
-- Técnicas: 25 en total (prehistoria 4, antiguedad 5, edad-media 5, edad-moderna 5, contemporanea 6): 5 ya existían (se ACTUALIZAN) y 20 son nuevas.
-- Clases: 31 (prehistoria 2, antiguedad 8, edad-media 7, edad-moderna 6, contemporanea 8), requiere_pro = true.
--
-- Este archivo se GENERA desde src/lib/historia/lecciones/ (fuente única) y
-- lecciones.test.ts comprueba que coincida. No editar a mano.
-- Regenerar: HISTORIA_ESCRIBIR_SQL=1 npx vitest run src/lib/historia/lecciones
-- ============================================================

-- 1) Técnicas que ya existían: se actualizan por slug (español neutro, quiz revisado, visuales, época y orden).

update public.techniques
set nombre = 'Anclaje cronológico: cuatro fechas que ordenan todo',
  descripcion = 'Usa unas pocas fechas que ya sabes como puntos de referencia y ubica cualquier hecho por su distancia a la más cercana.',
  contenido = $historia${
  "pasos": [
    "Una fecha ancla es una que ya conoces bien y usas como punto de referencia. En vez de memorizar cada año suelto, ubicas el hecho nuevo por su distancia a un ancla.",
    "La historia escolar tiene cuatro anclas naturales, las que separan las cinco épocas: 3500 a. C. (la invención de la escritura), 476 d. C. (la caída del Imperio romano de Occidente), 1492 (la llegada de Colón a América) y 1789 (la Revolución francesa).",
    "Son convenciones, no leyes de la naturaleza: otros textos ponen el final de la Edad Media en la caída de Constantinopla (1453) y el de la Edad Moderna en la independencia de Estados Unidos (1776) o en Waterloo (1815). Usa las cuatro anclas escolares, pero sabe que existen variantes.",
    "Ejemplo: «Batalla de Maratón» ocurrió en 490 a. C. Es posterior a 3500 a. C. y anterior a 476 d. C., así que cae en la Antigüedad. Y «Copérnico publica su teoría heliocéntrica», de 1543, está solo 51 años después de la llegada de Colón: pertenece a la Edad Moderna.",
    "Para ubicar un hecho nuevo, pregúntate primero entre qué dos anclas está y después a cuál queda más cerca."
  ],
  "visuales": [
    {
      "tipo": "historia.epocas",
      "despuesDePaso": 1,
      "titulo": "Las cuatro anclas entre las cinco épocas"
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 3,
      "titulo": "Dos ejemplos entre las anclas",
      "hechos": [
        "escritura-cuneiforme",
        "batalla-de-maraton",
        "caida-de-roma-occidente",
        "llegada-de-colon",
        "de-revolutionibus",
        "toma-de-la-bastilla"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué hecho marca, por convención escolar, el comienzo de la Edad Media?",
      "opciones": [
        "Llegada de Colón a América",
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Invención de la escritura en Sumeria",
        "Caída del Imperio romano de Occidente"
      ],
      "respuesta": "Caída del Imperio romano de Occidente",
      "explicacion": "Por convención escolar la Edad Media empieza con la caída del Imperio romano de Occidente (476 d. C.). La llegada de Colón abre la Edad Moderna, la Revolución francesa la Contemporánea y la escritura, la Antigüedad."
    },
    {
      "pregunta": "Según la periodización escolar, ¿en qué época ocurrió «Batalla de Hastings»?",
      "opciones": [
        "Antigüedad",
        "Edad Media",
        "Edad Moderna",
        "Prehistoria"
      ],
      "respuesta": "Edad Media",
      "explicacion": "1066 cae en la Edad Media (desde 476 d. C., por convención escolar)."
    },
    {
      "pregunta": "¿Por qué se dice que las fronteras entre épocas son convenciones?",
      "opciones": [
        "Porque esos hechos no ocurrieron de verdad",
        "Porque los años de esos hechos cambian cada siglo",
        "Porque cada país celebra su propia fecha oficial",
        "Porque las eligen los historiadores para ordenar el estudio, y otros textos usan fechas distintas"
      ],
      "respuesta": "Porque las eligen los historiadores para ordenar el estudio, y otros textos usan fechas distintas",
      "explicacion": "Una convención es un acuerdo útil para ordenar el estudio. Los hechos de las anclas sí ocurrieron, pero otros libros ponen las fronteras en otras fechas."
    },
    {
      "pregunta": "¿A cuál de estas anclas está más cerca «Copérnico publica su teoría heliocéntrica»?",
      "opciones": [
        "Invención de la escritura en Sumeria (3500 a. C.)",
        "Caída del Imperio romano de Occidente (476 d. C.)",
        "Toma de la Bastilla, comienzo de la Revolución francesa (1789)",
        "Llegada de Colón a América (1492)"
      ],
      "respuesta": "Llegada de Colón a América (1492)",
      "explicacion": "Copérnico publica su teoría heliocéntrica es de 1543: está 51 años después de la llegada de Colón y 246 años antes de la Revolución francesa."
    }
  ]
}$historia$::jsonb,
  orden = 1,
  requiere_pro = false
where slug = 'historia-anclaje-cronologico' and problem_type = 'historia';

update public.techniques
set nombre = 'Línea de tiempo mental',
  descripcion = 'Imagina los hechos como puntos de una línea que va del pasado más lejano a hoy, y recórrela en vez de recitar una lista.',
  contenido = $historia${
  "pasos": [
    "Imagina una línea recta: en un extremo, el pasado más lejano; en el otro, hoy. Cada hecho nuevo es un punto que colocas en ella, cerca de los que ya conoces.",
    "Cuando te pidan ordenar varios hechos, no recites una lista: recorre la línea de un extremo al otro. Así ordenar deja de ser calcular y pasa a ser leer.",
    "Aplícalo a la Prehistoria, que es la parte más larga de la línea. Estos seis hechos ocurrieron antes de que existiera la escritura y se ordenan de izquierda a derecha, del más antiguo al más reciente.",
    "Entre el primero y el último pasan millones de años, así que la línea de la Prehistoria no puede dibujarse a escala: se recuerda el orden de los hechos, no las distancias."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 2,
      "titulo": "Seis hechos de la Prehistoria, en orden (sin escala)",
      "hechos": [
        "herramientas-de-piedra",
        "uso-del-fuego",
        "homo-sapiens",
        "humanos-en-australia",
        "pinturas-de-lascaux",
        "poblamiento-de-america"
      ],
      "escala": "orden"
    }
  ],
  "quiz": [
    {
      "pregunta": "Según esta técnica, ¿cómo conviene imaginar los hechos de un período histórico?",
      "opciones": [
        "Como puntos ubicados en una línea, del pasado más lejano a hoy",
        "Como una lista ordenada alfabéticamente",
        "Como una tabla de filas y columnas",
        "Como un árbol genealógico"
      ],
      "respuesta": "Como puntos ubicados en una línea, del pasado más lejano a hoy",
      "explicacion": "La técnica propone una línea imaginaria: ordenar se convierte en recorrerla de un extremo al otro."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Uso controlado del fuego por los homínidos» o «Pinturas rupestres de Lascaux»?",
      "opciones": [
        "Uso controlado del fuego por los homínidos",
        "Pinturas rupestres de Lascaux",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Uso controlado del fuego por los homínidos",
      "explicacion": "Uso controlado del fuego por los homínidos es de hacia 800 000 a. C. y Pinturas rupestres de Lascaux, de hacia 17 000 a. C."
    },
    {
      "pregunta": "¿Por qué la línea de la Prehistoria no se dibuja a escala?",
      "opciones": [
        "Porque entre los primeros hechos y los últimos pasan millones de años",
        "Porque la Prehistoria no tiene hechos",
        "Porque las fechas a. C. no se pueden dibujar",
        "Porque la escala solo sirve para hechos con fecha exacta"
      ],
      "respuesta": "Porque entre los primeros hechos y los últimos pasan millones de años",
      "explicacion": "Entre «Primeras herramientas de piedra talladas» (hacia 2 500 000 a. C.) y «Pinturas rupestres de Lascaux» (hacia 17 000 a. C.) hay más de dos millones de años: los hechos más recientes quedarían pegados unos a otros."
    },
    {
      "pregunta": "Según la periodización escolar, ¿en qué época ocurrió «Pinturas rupestres de Lascaux»?",
      "opciones": [
        "Antigüedad",
        "Prehistoria",
        "Edad Media",
        "Edad Moderna"
      ],
      "respuesta": "Prehistoria",
      "explicacion": "hacia 17 000 a. C. cae en la Prehistoria (hasta 3500 a. C., por convención escolar)."
    }
  ]
}$historia$::jsonb,
  orden = 2,
  requiere_pro = false
where slug = 'historia-linea-de-tiempo-mental' and problem_type = 'historia';

update public.techniques
set nombre = 'Agrupar por siglo, no por fecha suelta',
  descripcion = 'Pasa de un año a su siglo con una regla y agrupa los hechos en bloques de tiempo: es mucho más fácil de repasar que una lista de fechas sueltas.',
  contenido = $historia${
  "pasos": [
    "Antes de aprender el año exacto de un hecho, ubica en qué siglo ocurrió. Un siglo son cien años, y agrupar los hechos por siglos convierte una lista de fechas sueltas en unos pocos bloques fáciles de repasar.",
    "Regla para los años d. C.: el siglo n va del año (n − 1) · 100 + 1 al año n · 100. Por eso el año 1900 es del siglo XIX y el 1901, del XX. Ejemplo: «Erupción del Vesubio y destrucción de Pompeya» ocurrió en 79 d. C., que es del siglo I.",
    "En los años a. C. se cuenta hacia atrás: el siglo I a. C. va del año 100 a. C. al año 1 a. C. Así, «Asesinato de Julio César» (44 a. C.) es del siglo I a. C. y «Batalla de Maratón» (490 a. C.), del siglo V a. C.",
    "Aplícalo a los primeros grandes hitos de la Antigüedad. El primer bloque llega hasta hacia 2500 a. C. y reúne la escritura, la unificación de Egipto, la Gran Pirámide y las ciudades del Indo; el segundo, la época de Hammurabi, la dinastía Shang y los olmecas; y solo después llega Cartago, ya en el siglo IX a. C.",
    "Conoce a dos protagonistas de esos bloques: Hammurabi (siglo XVIII a. C.) y Ramsés II (siglo XIII a. C.). Sus fechas de vida son aproximadas."
  ],
  "visuales": [
    {
      "tipo": "historia.siglos",
      "despuesDePaso": 1,
      "titulo": "De año a siglo",
      "ejemplos": [
        "erupcion-del-vesubio",
        1900,
        "batalla-de-maraton",
        "asesinato-de-julio-cesar"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 3,
      "titulo": "Los primeros grandes hitos, en bloques de siglos",
      "hechos": [
        "escritura-cuneiforme",
        "unificacion-de-egipto",
        "ciudades-del-indo",
        "piramide-de-keops",
        "codigo-de-hammurabi",
        "dinastia-shang",
        "olmecas",
        "fundacion-de-cartago"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 4,
      "titulo": "Dos protagonistas de los primeros bloques",
      "personajes": [
        "hammurabi",
        "ramses-ii"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿En qué siglo ocurrió «Batalla de Maratón»?",
      "opciones": [
        "Siglo VI a. C.",
        "Siglo IV a. C.",
        "Siglo V",
        "Siglo V a. C."
      ],
      "respuesta": "Siglo V a. C.",
      "explicacion": "490 a. C. pertenece al siglo V a. C.: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    },
    {
      "pregunta": "¿En qué siglo ocurrió «Asesinato de Julio César»?",
      "opciones": [
        "Siglo II a. C.",
        "Siglo I",
        "Siglo I a. C.",
        "Siglo III a. C."
      ],
      "respuesta": "Siglo I a. C.",
      "explicacion": "44 a. C. pertenece al siglo I a. C.: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    },
    {
      "pregunta": "¿A qué siglo pertenece el año 1900?",
      "opciones": [
        "Siglo XX",
        "Siglo XVIII",
        "Siglo XXI",
        "Siglo XIX"
      ],
      "respuesta": "Siglo XIX",
      "explicacion": "El siglo XIX va del año 1801 al año 1900: los años redondos cierran el siglo, no lo empiezan."
    },
    {
      "pregunta": "Según esta técnica, ¿qué conviene ubicar antes que el año exacto de un hecho?",
      "opciones": [
        "El nombre de la persona que lo escribió",
        "La ciudad donde se estudia",
        "El siglo o el bloque de tiempo al que pertenece",
        "El día y el mes"
      ],
      "respuesta": "El siglo o el bloque de tiempo al que pertenece",
      "explicacion": "Ubicar primero el siglo (el bloque) y después afinar el año dentro de él es más fácil que memorizar una lista plana de fechas."
    }
  ]
}$historia$::jsonb,
  orden = 1,
  requiere_pro = false
where slug = 'historia-bloques-por-siglo' and problem_type = 'historia';

update public.techniques
set nombre = 'Asociación memorable',
  descripcion = 'Conecta un hecho con una imagen o con un dato real y distintivo: se recuerda mejor que repetir una fecha en voz alta. Sin inventar nada.',
  contenido = $historia${
  "pasos": [
    "Para cada hecho que te cueste recordar, busca una imagen o un detalle real y distintivo que lo conecte con el dato clave. Cuanto más rara o vívida sea la imagen, más se queda, y no hace falta que tenga sentido para otra persona.",
    "Ejemplo con Carlomagno: su nombre viene del latín y significa «Carlos el Grande». Imagina una corona de Navidad, porque fue coronado emperador el día de Navidad de 800 d. C.",
    "Ejemplo con la «Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina»: «hégira» significa «migración». Imagina una caravana que sale de La Meca hacia Medina en 622 d. C., el punto de partida del calendario islámico.",
    "Regla de honestidad: la asociación ayuda a recordar, pero nunca inventes un dato para que rime o suene mejor. Si la imagen dice algo falso, mejor no usarla. Después, al día siguiente, revisa la asociación una vez más: ese segundo repaso la fija.",
    "Aplícalo a estos ocho hechos de los primeros siglos de la Edad Media y a cuatro protagonistas (Justiniano I, Mahoma, Carlomagno, Al-Juarismi)."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 4,
      "titulo": "Ocho hechos de la Alta Edad Media",
      "hechos": [
        "caida-de-roma-occidente",
        "santa-sofia",
        "dinastia-tang",
        "hegira",
        "musulmanes-en-iberia",
        "batalla-de-poitiers",
        "fundacion-de-bagdad",
        "coronacion-de-carlomagno"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 4,
      "titulo": "Cuatro protagonistas",
      "personajes": [
        "justiniano",
        "mahoma",
        "carlomagno",
        "al-juarismi"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "Según esta técnica, ¿qué hace que una asociación sea útil?",
      "opciones": [
        "Que invente una fecha que rime",
        "Que sea larga y complicada",
        "Que copie la de otro hecho",
        "Que conecte el hecho con una imagen o un dato real y distintivo"
      ],
      "respuesta": "Que conecte el hecho con una imagen o un dato real y distintivo",
      "explicacion": "La imagen o el dato debe ser real y llamativo; inventar datos para que rimen produce errores."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina» o «Carlomagno es coronado emperador»?",
      "opciones": [
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
        "Carlomagno es coronado emperador",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
      "explicacion": "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina es de 622 d. C. y Carlomagno es coronado emperador, de 800 d. C."
    },
    {
      "pregunta": "¿Qué significa «hégira»?",
      "opciones": [
        "Migración",
        "Batalla",
        "Coronación",
        "Peregrinación a La Meca"
      ],
      "respuesta": "Migración",
      "explicacion": "La Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina (622 d. C.) fue el traslado de Mahoma y sus seguidores de La Meca a Medina; la palabra significa «migración»."
    },
    {
      "pregunta": "¿Quién fue este personaje? Rey de los francos. Fue coronado emperador por el papa el día de Navidad del año 800.",
      "opciones": [
        "Mahoma",
        "Justiniano I",
        "Carlomagno",
        "Gengis Kan"
      ],
      "respuesta": "Carlomagno",
      "explicacion": "Carlomagno (742 d. C. – 814 d. C. (fechas aproximadas)): fue coronado emperador por el papa el día de Navidad del año 800."
    }
  ]
}$historia$::jsonb,
  orden = 1,
  requiere_pro = false
where slug = 'historia-asociacion-memorable' and problem_type = 'historia';

update public.techniques
set nombre = 'Siglas para recordar secuencias cortas',
  descripcion = 'Cuando debas memorizar el orden de tres o cuatro hechos, arma una sigla con la primera letra de cada uno.',
  contenido = $historia${
  "pasos": [
    "Toma la primera letra (o sílaba) de cada hecho, en el orden correcto. Arma con ellas una palabra o una frase corta; no hace falta que sea una palabra real, basta con que te resulte fácil de pronunciar.",
    "Ejemplo: «Cisma entre las Iglesias de Oriente y Occidente» (1054), «Batalla de Hastings» (1066), «Comienzo de la Primera Cruzada» (1096) y «Saladino recupera Jerusalén» (1187). Las iniciales, en ese orden, son C-H-C-S: «chics».",
    "La sigla te da el ORDEN, no el contexto. Combínala con la línea de tiempo mental: la sigla fija el orden y la línea te muestra dónde cae cada hecho.",
    "Aplícala a estos ocho hechos de los siglos IX a XII y a cinco protagonistas de la época. Dilo en voz alta un par de veces: el ritmo de la sigla ayuda más que mirar la lista."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 2,
      "titulo": "Ocho hechos de los siglos IX a XII",
      "hechos": [
        "casa-de-la-sabiduria",
        "dinastia-song",
        "leif-en-america",
        "cisma-de-oriente-y-occidente",
        "batalla-de-hastings",
        "primera-cruzada",
        "angkor-wat",
        "saladino-recupera-jerusalen"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 3,
      "titulo": "Cinco protagonistas",
      "personajes": [
        "murasaki-shikibu",
        "avicena",
        "leif-erikson",
        "guillermo-el-conquistador",
        "saladino"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué sigla resulta de ordenar «Cisma de Oriente y Occidente, Hastings, Primera Cruzada, Saladino»?",
      "opciones": [
        "H-C-S-C",
        "S-C-H-C",
        "C-H-C-S",
        "C-C-H-S"
      ],
      "respuesta": "C-H-C-S",
      "explicacion": "Las iniciales en orden cronológico son C (1054), H (1066), C (1096) y S (1187)."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Batalla de Hastings» o «Comienzo de la Primera Cruzada»?",
      "opciones": [
        "Comienzo de la Primera Cruzada",
        "Ocurrieron en el mismo año",
        "Batalla de Hastings",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Batalla de Hastings",
      "explicacion": "Batalla de Hastings es de 1066 y Comienzo de la Primera Cruzada, de 1096."
    },
    {
      "pregunta": "¿Qué conviene combinar con la sigla, según la técnica?",
      "opciones": [
        "Un mapa de la ciudad",
        "La línea de tiempo mental: la sigla da el orden y la línea da el contexto",
        "La lista alfabética de los nombres",
        "Una fecha inventada"
      ],
      "respuesta": "La línea de tiempo mental: la sigla da el orden y la línea da el contexto",
      "explicacion": "La sigla sirve para recordar el orden; la línea de tiempo muestra cuándo y dónde ocurrió cada hecho."
    },
    {
      "pregunta": "¿En qué siglo ocurrió «Batalla de Hastings»?",
      "opciones": [
        "Siglo XI",
        "Siglo XII",
        "Siglo X",
        "Siglo XI a. C."
      ],
      "respuesta": "Siglo XI",
      "explicacion": "1066 pertenece al siglo XI: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    }
  ]
}$historia$::jsonb,
  orden = 2,
  requiere_pro = false
where slug = 'historia-siglas-para-secuencias' and problem_type = 'historia';

-- 2) Técnicas nuevas (requiere_pro = false).
insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

('historia-tecnica-fechas-aproximadas', 'Cuando no hay años: fechas aproximadas y «hacia»',
  'Antes de la escritura las fechas son estimaciones: aprende a leer «hacia» y a guardar la época y el orden, no el año.',
  'historia',
  $historia${
  "pasos": [
    "Antes de la escritura nadie anotó fechas. Los especialistas estiman la edad de los restos con métodos científicos, y el resultado es una estimación con un margen de error, no un año exacto.",
    "Por eso las fechas de la Prehistoria se escriben con «hacia»: «Inicio de la agricultura en el Creciente Fértil» ocurrió hacia 9000 a. C. Cuanto más antiguo es un hecho, más grande es el margen: unos siglos para la agricultura, cientos de miles de años para las primeras herramientas.",
    "Otras fechas son convencionales: la escuela las fija aunque los libros discrepen un poco. La invención de la escritura se sitúa en 3500 a. C. por convención, y esa fecha marca el final de la Prehistoria.",
    "Regla práctica: si una fecha lleva «hacia», no la memorices como un año exacto. Guarda el orden de los hechos y la época en que ocurrieron; el año es solo un orden de magnitud."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 1,
      "titulo": "Cuatro hechos con fecha aproximada",
      "hechos": [
        "fin-de-la-glaciacion",
        "gobekli-tepe",
        "inicio-de-la-agricultura",
        "primeros-objetos-de-cobre"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué significa «hacia 9000 a. C.»?",
      "opciones": [
        "Que ocurrió exactamente ese año",
        "Que ocurrió aproximadamente en ese año, con un margen de error",
        "Que ocurrió después de ese año",
        "Que la fecha todavía es secreta"
      ],
      "respuesta": "Que ocurrió aproximadamente en ese año, con un margen de error",
      "explicacion": "«Hacia» avisa de que la fecha es una estimación: el hecho ocurrió alrededor de ese año, con un margen de error."
    },
    {
      "pregunta": "¿Por qué la fecha de la invención de la escritura se considera convencional?",
      "opciones": [
        "Porque la escuela fija un año de referencia aunque los libros discrepan un poco",
        "Porque nadie inventó la escritura",
        "Porque es la única fecha exacta de la Prehistoria",
        "Porque cambia cada vez que se abre un libro"
      ],
      "respuesta": "Porque la escuela fija un año de referencia aunque los libros discrepan un poco",
      "explicacion": "La escritura no apareció de un día para otro: se toma 3500 a. C. como referencia para separar la Prehistoria de la Antigüedad."
    },
    {
      "pregunta": "Según la periodización escolar, ¿en qué época ocurrió «Inicio de la agricultura en el Creciente Fértil»?",
      "opciones": [
        "Prehistoria",
        "Antigüedad",
        "Edad Media",
        "Edad Moderna"
      ],
      "respuesta": "Prehistoria",
      "explicacion": "hacia 9000 a. C. cae en la Prehistoria (hasta 3500 a. C., por convención escolar)."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Fin de la última glaciación» o «Primeros objetos de cobre fundido»?",
      "opciones": [
        "Primeros objetos de cobre fundido",
        "Fin de la última glaciación",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Fin de la última glaciación",
      "explicacion": "Fin de la última glaciación es de hacia 10 000 a. C. y Primeros objetos de cobre fundido, de hacia 5000 a. C."
    }
  ]
}$historia$::jsonb,
  3,
  false),

('historia-tecnica-causa-y-consecuencia', 'Causa, hecho y consecuencia',
  'Une los hechos con «porque» y «entonces»: qué provocó un hecho y qué provocó él.',
  'historia',
  $historia${
  "pasos": [
    "Un hecho rara vez ocurre solo: una causa lo empuja y él empuja una consecuencia. Buscar esa cadena ayuda a recordar el orden, porque una consecuencia nunca es anterior a su causa.",
    "Ejemplo: cuando terminó la última glaciación (hacia 10 000 a. C.) el clima se hizo más templado y estable, y en Oriente Próximo comenzó la agricultura (hacia 9000 a. C.). Con alimento almacenado, las aldeas crecieron y, en Sumeria, apareció la escritura (3500 a. C.); sus primeros usos conocidos fueron llevar cuentas.",
    "Para comprobar una cadena, léela hacia atrás con «porque» y hacia delante con «entonces». Si alguna frase no suena bien, hay un eslabón mal puesto.",
    "Cuidado: que un hecho ocurra después de otro no prueba que sea su consecuencia. Simplificación de nivel escolar: los hechos reales tienen varias causas; aquí se muestra la cadena principal."
  ],
  "visuales": [
    {
      "tipo": "historia.causas",
      "despuesDePaso": 1,
      "titulo": "De la glaciación a la escritura",
      "cadena": [
        "fin-de-la-glaciacion",
        "inicio-de-la-agricultura",
        "escritura-cuneiforme"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Inicio de la agricultura en el Creciente Fértil»?",
      "opciones": [
        "Uso controlado del fuego por los homínidos",
        "Invención de la escritura en Sumeria",
        "Pinturas rupestres de Lascaux",
        "Aparición de los primeros Homo sapiens en África"
      ],
      "respuesta": "Invención de la escritura en Sumeria",
      "explicacion": "Invención de la escritura en Sumeria (3500 a. C.) vino después y se apoya en «Inicio de la agricultura en el Creciente Fértil»; los otros hechos son anteriores a hacia 9000 a. C., así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos contribuyó a provocar «Inicio de la agricultura en el Creciente Fértil»?",
      "opciones": [
        "Invención de la escritura en Sumeria",
        "Fin de la última glaciación",
        "Unificación del Alto y el Bajo Egipto",
        "Construcción de la Gran Pirámide de Guiza"
      ],
      "respuesta": "Fin de la última glaciación",
      "explicacion": "Fin de la última glaciación (hacia 10 000 a. C.) fue anterior y contribuyó a provocarlo; los otros hechos ocurrieron después de hacia 9000 a. C., así que no pueden ser una causa."
    },
    {
      "pregunta": "Si un hecho ocurre después de otro, ¿se puede afirmar que es su consecuencia?",
      "opciones": [
        "No: ocurrir después no prueba que sea consecuencia; hay que conocer la relación entre ambos",
        "Sí, siempre",
        "Sí, si ocurrieron en el mismo siglo",
        "Solo si ocurrieron en la misma región"
      ],
      "respuesta": "No: ocurrir después no prueba que sea consecuencia; hay que conocer la relación entre ambos",
      "explicacion": "«Después de» no es lo mismo que «a causa de». Para hablar de causa y consecuencia hace falta una relación explicada por los historiadores."
    },
    {
      "pregunta": "¿Cómo se comprueba una cadena de causas y consecuencias?",
      "opciones": [
        "Ordenando los hechos por su nombre",
        "Sumando los años entre los hechos",
        "Buscando hechos de la misma región",
        "Leyéndola hacia atrás con «porque» y hacia delante con «entonces»"
      ],
      "respuesta": "Leyéndola hacia atrás con «porque» y hacia delante con «entonces»",
      "explicacion": "Si «esto ocurrió porque ocurrió lo anterior» y «entonces ocurrió lo siguiente» suenan bien, la cadena tiene sentido."
    }
  ]
}$historia$::jsonb,
  4,
  false),

('historia-tecnica-anios-antes-de-cristo', 'Los años a. C. se cuentan hacia atrás',
  'Cómo ordenar años antes de Cristo sin equivocarte: cuanto mayor es el número, más antiguo es el hecho.',
  'historia',
  $historia${
  "pasos": [
    "Los años antes de Cristo (a. C.) se cuentan hacia atrás: cuanto mayor es el número, más antiguo es el hecho. Por eso «Primeros Juegos Olímpicos de la Antigüedad» (776 a. C.) es anterior a «Batalla de Maratón» (490 a. C.).",
    "No existe el año 0: después del 1 a. C. viene el 1 d. C. Por eso entre «Augusto inicia el Imperio romano» (27 a. C.) y «Erupción del Vesubio y destrucción de Pompeya» (79 d. C.) pasaron 105 años y no 106 años.",
    "Para ordenar varios años a. C., escríbelos de mayor a menor número. Aplícalo a estos ocho hechos: leídos de arriba abajo, sus números bajan porque los hechos son cada vez más recientes.",
    "Trampa habitual: un hecho a. C. siempre es anterior a uno d. C., aunque el número del segundo sea pequeño. Comprueba siempre la era antes de comparar los números.",
    "Cuatro protagonistas de esta línea: Homero (siglo VIII a. C.), Ciro II el Grande (siglo VI a. C.), Buda (Siddhartha Gautama) y Confucio, que enseñaron hacia 500 a. C. en la India y en China."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 2,
      "titulo": "Ocho hechos a. C., del más antiguo al más reciente",
      "hechos": [
        "primeros-juegos-olimpicos",
        "fundacion-de-roma",
        "iliada-y-odisea",
        "republica-romana",
        "ciro-conquista-babilonia",
        "ensenanzas-de-buda",
        "ensenanzas-de-confucio",
        "batalla-de-maraton"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 4,
      "titulo": "Cuatro protagonistas",
      "personajes": [
        "homero",
        "ciro-ii",
        "buda",
        "confucio"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Primeros Juegos Olímpicos de la Antigüedad» o «Batalla de Maratón»?",
      "opciones": [
        "Batalla de Maratón",
        "Primeros Juegos Olímpicos de la Antigüedad",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Primeros Juegos Olímpicos de la Antigüedad",
      "explicacion": "Primeros Juegos Olímpicos de la Antigüedad es de 776 a. C. y Batalla de Maratón, de 490 a. C."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Fundación de Roma, según la tradición» o «Comienzo de la República romana»?",
      "opciones": [
        "Comienzo de la República romana",
        "Fundación de Roma, según la tradición",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Fundación de Roma, según la tradición",
      "explicacion": "Fundación de Roma, según la tradición es de 753 a. C. y Comienzo de la República romana, de 509 a. C."
    },
    {
      "pregunta": "¿Cuántos años hay entre el 10 a. C. y el 10 d. C.?",
      "opciones": [
        "20 años",
        "18 años",
        "0 años",
        "19 años"
      ],
      "respuesta": "19 años",
      "explicacion": "No existe el año 0: del 10 a. C. al 1 a. C. pasan 9 años, del 1 a. C. al 1 d. C. pasa 1 año y del 1 d. C. al 10 d. C. pasan 9 años; en total, 19."
    },
    {
      "pregunta": "¿En qué siglo ocurrió «Primeros Juegos Olímpicos de la Antigüedad»?",
      "opciones": [
        "Siglo IX a. C.",
        "Siglo VIII a. C.",
        "Siglo VII a. C.",
        "Siglo VIII"
      ],
      "respuesta": "Siglo VIII a. C.",
      "explicacion": "776 a. C. pertenece al siglo VIII a. C.: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    }
  ]
}$historia$::jsonb,
  2,
  false),

('historia-tecnica-sincronia', '¿Qué pasaba a la vez en otras partes?',
  'Compara civilizaciones en el mismo período en vez de estudiarlas por separado: es la clave para no mezclar épocas.',
  'historia',
  $historia${
  "pasos": [
    "La sincronía es lo que ocurre a la vez en lugares distintos. En vez de estudiar cada civilización por separado, pregúntate siempre: ¿cuándo fue esto?, ¿y qué pasaba mientras tanto en el resto del mundo?",
    "Ejemplo entre los siglos IV y III a. C.: mientras «Muerte de Alejandro Magno en Babilonia» (323 a. C.) cerraba una etapa en el Mediterráneo, en la India se fundaba el Imperio maurya (hacia 321 a. C.) y, un siglo después, en China se unificaba el país (221 a. C.).",
    "La figura pone los hechos en carriles por región sobre un mismo eje de tiempo. Lee de izquierda a derecha y fíjate en qué carril ocurre cada hecho: ese es el truco para no confundir civilizaciones.",
    "Cuidado: que dos cosas ocurran a la vez no significa que una provocó la otra. La sincronía sirve para ubicar, no para explicar. Estos otros hechos completan el panorama de la época.",
    "Protagonistas del período: Leónidas, Jerjes I, Pericles, Sócrates, Platón, Aristóteles, Alejandro Magno, Euclides."
  ],
  "visuales": [
    {
      "tipo": "historia.sincronia",
      "despuesDePaso": 1,
      "titulo": "Mismo período, tres regiones",
      "carriles": [
        {
          "region": "europa",
          "hechos": [
            "muerte-de-alejandro",
            "elementos-de-euclides"
          ]
        },
        {
          "region": "asia-sur",
          "hechos": [
            "imperio-maurya",
            "guerra-de-kalinga"
          ]
        },
        {
          "region": "asia-oriental",
          "hechos": [
            "unificacion-de-china"
          ]
        }
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 3,
      "titulo": "Ocho hechos de los siglos V a III a. C.",
      "hechos": [
        "batalla-de-las-termopilas",
        "construccion-del-partenon",
        "muerte-de-socrates",
        "inicio-conquista-persa",
        "muerte-de-alejandro",
        "elementos-de-euclides",
        "imperio-maurya",
        "guerra-de-kalinga"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 4,
      "titulo": "Protagonistas del período",
      "personajes": [
        "leonidas",
        "jerjes-i",
        "pericles",
        "socrates",
        "platon",
        "aristoteles",
        "alejandro-magno",
        "euclides"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué es la sincronía?",
      "opciones": [
        "Comparar lo que ocurría a la vez en distintas regiones del mundo",
        "Ordenar los hechos por su nombre",
        "Contar los años entre dos hechos",
        "Explicar la causa de un hecho"
      ],
      "respuesta": "Comparar lo que ocurría a la vez en distintas regiones del mundo",
      "explicacion": "Sincronía significa «al mismo tiempo»: es comparar civilizaciones en un mismo período."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Chandragupta funda el Imperio maurya» o «Qin Shi Huang unifica China»?",
      "opciones": [
        "Qin Shi Huang unifica China",
        "Chandragupta funda el Imperio maurya",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Chandragupta funda el Imperio maurya",
      "explicacion": "Chandragupta funda el Imperio maurya es de hacia 321 a. C. y Qin Shi Huang unifica China, de 221 a. C."
    },
    {
      "pregunta": "¿Cuál de estos hechos ocurrió en otra región, pero en el mismo período que «Chandragupta funda el Imperio maurya»?",
      "opciones": [
        "Caída del Imperio romano de Occidente",
        "Llegada de Colón a América",
        "Construcción de la Gran Pirámide de Guiza",
        "Muerte de Alejandro Magno en Babilonia"
      ],
      "respuesta": "Muerte de Alejandro Magno en Babilonia",
      "explicacion": "Chandragupta funda el Imperio maurya es de hacia 321 a. C. y Muerte de Alejandro Magno en Babilonia, de 323 a. C.: casi coinciden. Los otros hechos ocurrieron siglos o milenios antes o después."
    },
    {
      "pregunta": "Si dos hechos ocurren a la vez en regiones distintas, ¿se puede afirmar que uno provocó el otro?",
      "opciones": [
        "Sí, siempre",
        "Sí, si los dos son de la misma época",
        "No: la sincronía sirve para ubicar los hechos, no para explicarlos",
        "Solo si ocurrieron en el mismo mes"
      ],
      "respuesta": "No: la sincronía sirve para ubicar los hechos, no para explicarlos",
      "explicacion": "Para hablar de causa hace falta una relación explicada por los historiadores, no solo coincidencia en el tiempo."
    }
  ]
}$historia$::jsonb,
  3,
  false),

('historia-tecnica-personajes-por-rol', 'Reconocer personajes por su rol y su época',
  'Para no confundir a los protagonistas, fíjate en tres cosas: qué papel tuvieron, cuándo vivieron y con qué hecho se les asocia.',
  'historia',
  $historia${
  "pasos": [
    "Los nombres se confunden cuando se estudian sueltos. Para cada personaje guarda tres datos: su rol (gobernante, militar, científico...), su época y un hecho con el que se le asocia. Con eso casi nunca se mezclan.",
    "Ejemplo: Julio César fue un general y político romano asociado con «Julio César cruza el Rubicón» (49 a. C.) y «Asesinato de Julio César» (44 a. C.). No fue emperador: el primero fue Augusto, que inició el Imperio en 27 a. C.",
    "Otra ayuda: pregúntate si un personaje pudo estar vivo en un hecho. Aníbal no pudo conocer a Augusto: ocurrieron con más de un siglo de diferencia.",
    "Las fichas de abajo dan el rol, los años de vida, la época y los hechos de la tabla en los que figura cada personaje. Las fechas de nacimiento y muerte de algunos son aproximadas.",
    "Los ocho hechos de la línea de esta técnica son los que enmarcan a esos ocho personajes."
  ],
  "visuales": [
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 3,
      "titulo": "Ocho personajes, ocho roles",
      "personajes": [
        "qin-shi-huang",
        "anibal",
        "espartaco",
        "julio-cesar",
        "cleopatra",
        "augusto",
        "asoka",
        "chandragupta"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 4,
      "titulo": "Los hechos que enmarcan a esos personajes",
      "hechos": [
        "unificacion-de-china",
        "anibal-cruza-los-alpes",
        "dinastia-han",
        "destruccion-de-cartago",
        "cesar-cruza-el-rubicon",
        "asesinato-de-julio-cesar",
        "batalla-de-accio",
        "muerte-de-cleopatra"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Fue Julio César emperador romano?",
      "opciones": [
        "No: fue general y político; el primer emperador fue Augusto",
        "Sí, fue el primer emperador",
        "Sí, fue el último emperador",
        "No: fue un rey de Egipto"
      ],
      "respuesta": "No: fue general y político; el primer emperador fue Augusto",
      "explicacion": "Julio César murió asesinado en 44 a. C., antes de que empezara el Imperio (27 a. C.) con Augusto."
    },
    {
      "pregunta": "Según la técnica, ¿qué tres datos conviene guardar de cada personaje?",
      "opciones": [
        "Su color favorito, su ciudad y su comida",
        "Su altura, su peso y su edad",
        "Solo su nombre completo",
        "Su rol, su época y un hecho con el que se le asocia"
      ],
      "respuesta": "Su rol, su época y un hecho con el que se le asocia",
      "explicacion": "Rol, época y un hecho asociado permiten reconocerlo sin confundirlo con otro."
    },
    {
      "pregunta": "¿Cuál de estos personajes pudo estar vivo en «Batalla de Accio» (31 a. C.)?",
      "opciones": [
        "Augusto",
        "Aníbal",
        "Alejandro Magno",
        "Qin Shi Huang"
      ],
      "respuesta": "Augusto",
      "explicacion": "Augusto (63 a. C. – 14 d. C.) vivía en 31 a. C. y participó en ella; los otros tres murieron siglos antes."
    },
    {
      "pregunta": "Según la periodización escolar, ¿en qué época ocurrió «Fundación de la dinastía Han en China»?",
      "opciones": [
        "Prehistoria",
        "Antigüedad",
        "Edad Media",
        "Edad Moderna"
      ],
      "respuesta": "Antigüedad",
      "explicacion": "202 a. C. cae en la Antigüedad (desde 3500 a. C., por convención escolar)."
    }
  ]
}$historia$::jsonb,
  4,
  false),

('historia-tecnica-cadenas-causales', 'Cadenas de dos pasos: del hecho A al hecho C',
  'Para una consecuencia lejana, busca el hecho intermedio: A provoca B, y B provoca C.',
  'historia',
  $historia${
  "pasos": [
    "Una cadena de dos pasos une tres hechos: A provoca B y B provoca C. Cuando una pregunta une dos hechos lejanos, busca el hecho intermedio que hace de puente.",
    "Ejemplo romano: el asesinato de César (44 a. C.) desató una guerra civil; una de sus batallas decisivas fue «Batalla de Accio» (31 a. C.); y tras ella Augusto inició el Imperio (27 a. C.).",
    "Otra relación de la época: el Edicto de Milán (313 d. C.) permitió practicar el cristianismo en el Imperio, y en 380 d. C. el cristianismo se declaró religión oficial.",
    "Simplificación de nivel escolar: cada hecho tiene varias causas. Se elige la cadena más reconocida, pero conviene saber que hay más.",
    "Estos diez hechos completan la línea de tiempo desde el Imperio de Augusto hasta la división del Imperio romano, con lo que ocurría a la vez en otras regiones."
  ],
  "visuales": [
    {
      "tipo": "historia.causas",
      "despuesDePaso": 1,
      "titulo": "De los idus de marzo al Imperio",
      "cadena": [
        "asesinato-de-julio-cesar",
        "batalla-de-accio",
        "comienzo-del-imperio-romano"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 4,
      "titulo": "Diez hechos del final de la Antigüedad",
      "hechos": [
        "comienzo-del-imperio-romano",
        "erupcion-del-vesubio",
        "papel-de-cai-lun",
        "imperio-gupta",
        "periodo-clasico-maya",
        "edicto-de-milan",
        "fundacion-de-constantinopla",
        "ezana-de-aksum",
        "cristianismo-religion-oficial",
        "division-del-imperio-romano"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 4,
      "titulo": "Dos protagonistas",
      "personajes": [
        "cai-lun",
        "constantino"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Batalla de Accio»?",
      "opciones": [
        "Augusto inicia el Imperio romano",
        "Invención de la escritura en Sumeria",
        "Batalla de Maratón",
        "Qin Shi Huang unifica China"
      ],
      "respuesta": "Augusto inicia el Imperio romano",
      "explicacion": "Augusto inicia el Imperio romano (27 a. C.) vino después y se apoya en «Batalla de Accio»; los otros hechos son anteriores a 31 a. C., así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos contribuyó a provocar «Augusto inicia el Imperio romano»?",
      "opciones": [
        "Batalla de Accio",
        "Erupción del Vesubio y destrucción de Pompeya",
        "Edicto de Milán",
        "Caída del Imperio romano de Occidente"
      ],
      "respuesta": "Batalla de Accio",
      "explicacion": "Batalla de Accio (31 a. C.) fue anterior y contribuyó a provocarlo; los otros hechos ocurrieron después de 27 a. C., así que no pueden ser una causa."
    },
    {
      "pregunta": "En la cadena «asesinato de César → Accio → Imperio», ¿cuál es el hecho intermedio?",
      "opciones": [
        "Erupción del Vesubio y destrucción de Pompeya",
        "Edicto de Milán",
        "Fundación de Roma, según la tradición",
        "Batalla de Accio"
      ],
      "respuesta": "Batalla de Accio",
      "explicacion": "La cadena es Asesinato de Julio César (44 a. C.) → Batalla de Accio (31 a. C.) → Augusto inicia el Imperio romano (27 a. C.). Los otros hechos no están entre esos dos."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Edicto de Milán»?",
      "opciones": [
        "Invención de la escritura en Sumeria",
        "El cristianismo se declara religión oficial del Imperio romano",
        "Batalla de Maratón",
        "Erupción del Vesubio y destrucción de Pompeya"
      ],
      "respuesta": "El cristianismo se declara religión oficial del Imperio romano",
      "explicacion": "El cristianismo se declara religión oficial del Imperio romano (380 d. C.) vino después y se apoya en «Edicto de Milán»; los otros hechos son anteriores a 313 d. C., así que no pueden ser su consecuencia."
    }
  ]
}$historia$::jsonb,
  5,
  false),

('historia-tecnica-sincronia-siglo-xiii', 'El siglo XIII: cuatro regiones a la vez',
  'Aplica la sincronía al siglo XIII: qué pasaba a la vez en Europa, África, Asia central y Asia oriental.',
  'historia',
  $historia${
  "pasos": [
    "Recuerda: la sincronía consiste en comparar lo que ocurría a la vez en regiones distintas, sobre un mismo eje de tiempo, en vez de estudiar cada civilización por separado.",
    "Ejemplo del siglo XIII: en Asia central «Temüjin es proclamado Gengis Kan» (1206) dio origen al Imperio mongol; en Inglaterra se firmó la «Carta Magna en Inglaterra» (1215); en África occidental se formó el «Sundiata Keita funda el Imperio de Mali» (hacia 1235); y en China los mongoles fundaron la dinastía Yuan (1271).",
    "Lee el eje de izquierda a derecha y compara los carriles: un mismo siglo, cuatro mundos distintos. Así no confundes qué civilización estaba en qué momento.",
    "Los otros hechos del siglo, en la línea de abajo, y cinco protagonistas: Minamoto no Yoritomo, Gengis Kan, Kublai Kan, Sundiata Keita, Marco Polo."
  ],
  "visuales": [
    {
      "tipo": "historia.sincronia",
      "despuesDePaso": 1,
      "titulo": "De 1192 a 1271, cuatro regiones",
      "carriles": [
        {
          "region": "europa",
          "hechos": [
            "carta-magna"
          ]
        },
        {
          "region": "africa",
          "hechos": [
            "imperio-de-mali"
          ]
        },
        {
          "region": "asia-central",
          "hechos": [
            "gengis-kan-proclamado"
          ]
        },
        {
          "region": "asia-oriental",
          "hechos": [
            "shogunato-de-kamakura",
            "dinastia-yuan"
          ]
        }
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 3,
      "titulo": "Ocho hechos del siglo XIII (y de fines del XII)",
      "hechos": [
        "shogunato-de-kamakura",
        "gengis-kan-proclamado",
        "sultanato-de-delhi",
        "carta-magna",
        "imperio-de-mali",
        "dinastia-yuan",
        "marco-polo-en-china",
        "imperio-otomano"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 3,
      "titulo": "Cinco protagonistas",
      "personajes": [
        "minamoto-no-yoritomo",
        "gengis-kan",
        "kublai-kan",
        "sundiata-keita",
        "marco-polo"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué hecho ocurrió en otra región, pero en el mismo siglo que «Carta Magna en Inglaterra»?",
      "opciones": [
        "Caída del Imperio romano de Occidente",
        "Llegada de Colón a América",
        "Comienzo de la dinastía Tang en China",
        "Sundiata Keita funda el Imperio de Mali"
      ],
      "respuesta": "Sundiata Keita funda el Imperio de Mali",
      "explicacion": "Carta Magna en Inglaterra es de 1215, siglo XIII; Sundiata Keita funda el Imperio de Mali es de hacia 1235, del mismo siglo. Los otros hechos son de siglos muy distintos."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Temüjin es proclamado Gengis Kan» o «Kublai Kan funda la dinastía Yuan en China»?",
      "opciones": [
        "Temüjin es proclamado Gengis Kan",
        "Kublai Kan funda la dinastía Yuan en China",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Temüjin es proclamado Gengis Kan",
      "explicacion": "Temüjin es proclamado Gengis Kan es de 1206 y Kublai Kan funda la dinastía Yuan en China, de 1271."
    },
    {
      "pregunta": "¿En qué siglo ocurrió «Kublai Kan funda la dinastía Yuan en China»?",
      "opciones": [
        "Siglo XIV",
        "Siglo XII",
        "Siglo XIII",
        "Siglo XIII a. C."
      ],
      "respuesta": "Siglo XIII",
      "explicacion": "1271 pertenece al siglo XIII: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    },
    {
      "pregunta": "¿Quién fue este personaje? Emperador mongol de China. Nieto de Gengis Kan, fundó la dinastía Yuan en China.",
      "opciones": [
        "Gengis Kan",
        "Marco Polo",
        "Saladino",
        "Kublai Kan"
      ],
      "respuesta": "Kublai Kan",
      "explicacion": "Kublai Kan (1215 – 1294): nieto de Gengis Kan, fundó la dinastía Yuan en China."
    }
  ]
}$historia$::jsonb,
  3,
  false),

('historia-tecnica-causa-y-efecto-siglo-xiv', 'Causa y efecto en el siglo XIV',
  'Une con «porque» y «entonces» los hechos del siglo XIV: cómo un imperio lleva a otro y cómo un reino rico llega a ser famoso.',
  'historia',
  $historia${
  "pasos": [
    "Recuerda: una consecuencia nunca es anterior a su causa. Para comprobar una cadena léela hacia atrás con «porque» y hacia delante con «entonces».",
    "Ejemplo 1: el «Sundiata Keita funda el Imperio de Mali» (hacia 1235) se hizo rico con el comercio de oro; por eso su emperador Mansa Musa pudo hacer su famosa «Peregrinación de Mansa Musa a La Meca» (hacia 1324).",
    "Ejemplo 2: «Kublai Kan funda la dinastía Yuan en China» (1271), fundada por los mongoles en China, precedió a la «Comienzo de la dinastía Ming en China» (1368), que gobernó China tras la salida de los mongoles.",
    "Los otros hechos del siglo (la peste negra, la guerra de los Cien Años, los viajes de Ibn Battuta, el Gran Zimbabue, los maoríes y Tenochtitlan) no se muestran aquí en una cadena; se estudian igual como hitos del siglo."
  ],
  "visuales": [
    {
      "tipo": "historia.causas",
      "despuesDePaso": 1,
      "titulo": "Un reino rico y un viaje famoso",
      "cadena": [
        "imperio-de-mali",
        "peregrinacion-de-mansa-musa"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 2,
      "titulo": "De los mongoles a los Ming",
      "cadena": [
        "dinastia-yuan",
        "dinastia-ming"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 3,
      "titulo": "Ocho hechos del siglo XIV",
      "hechos": [
        "gran-zimbabue",
        "maories-en-nueva-zelanda",
        "peregrinacion-de-mansa-musa",
        "fundacion-de-tenochtitlan",
        "viajes-de-ibn-battuta",
        "guerra-de-los-cien-anios",
        "peste-negra",
        "dinastia-ming"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 3,
      "titulo": "Dos viajeros del siglo XIV",
      "personajes": [
        "mansa-musa",
        "ibn-battuta"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Kublai Kan funda la dinastía Yuan en China»?",
      "opciones": [
        "Comienzo de la dinastía Ming en China",
        "Caída del Imperio romano de Occidente",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
        "Comienzo de la dinastía Tang en China"
      ],
      "respuesta": "Comienzo de la dinastía Ming en China",
      "explicacion": "Comienzo de la dinastía Ming en China (1368) vino después y se apoya en «Kublai Kan funda la dinastía Yuan en China»; los otros hechos son anteriores a 1271, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Sundiata Keita funda el Imperio de Mali»?",
      "opciones": [
        "Peregrinación de Mansa Musa a La Meca",
        "Comienzo de la dinastía Tang en China",
        "Caída del Imperio romano de Occidente",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina"
      ],
      "respuesta": "Peregrinación de Mansa Musa a La Meca",
      "explicacion": "Peregrinación de Mansa Musa a La Meca (hacia 1324) vino después y se apoya en «Sundiata Keita funda el Imperio de Mali»; los otros hechos son anteriores a hacia 1235, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «La peste negra llega a Europa» o «Comienzo de la dinastía Ming en China»?",
      "opciones": [
        "Comienzo de la dinastía Ming en China",
        "Ocurrieron en el mismo año",
        "La peste negra llega a Europa",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "La peste negra llega a Europa",
      "explicacion": "La peste negra llega a Europa es de 1347 y Comienzo de la dinastía Ming en China, de 1368."
    },
    {
      "pregunta": "¿Quién fue este personaje? Emperador de Mali. Su peregrinación a La Meca, con grandes cantidades de oro, lo hizo famoso en todo el mundo.",
      "opciones": [
        "Sundiata Keita",
        "Mansa Musa",
        "Ibn Battuta",
        "Saladino"
      ],
      "respuesta": "Mansa Musa",
      "explicacion": "Mansa Musa (activo hacia 1324 (fechas aproximadas)): su peregrinación a La Meca, con grandes cantidades de oro, lo hizo famoso en todo el mundo."
    }
  ]
}$historia$::jsonb,
  4,
  false),

('historia-tecnica-cierre-de-la-edad-media', 'Cómo se cierra la Edad Media: 1453 o 1492',
  'Los hechos de los años finales de la Edad Media y las dos fechas que los libros proponen como frontera con la Edad Moderna.',
  'historia',
  $historia${
  "pasos": [
    "Recuerda: las fronteras entre épocas son convenciones. Esta lección usa la de la escuela, 1492 (la llegada de Colón a América), pero otros libros cierran la Edad Media en 1453, con la «Caída de Constantinopla en manos otomanas».",
    "Antes de esas fechas ocurrieron hechos que ya anuncian el mundo moderno: «Primera expedición marítima de Zheng He» (1405), «Juana de Arco libera Orleans» (1429) y «Gutenberg imprime la Biblia con tipos móviles» (hacia 1455).",
    "En América, «Pachacútec inicia la expansión del Imperio inca» (hacia 1438) y «Construcción de Machu Picchu» (hacia 1450) muestran que los Andes tenían un gran Estado sin ningún contacto con Europa.",
    "Consejo: si un texto dice «fin de la Edad Media», comprueba qué frontera usa. Ambas fechas son válidas, pero no son la misma."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 2,
      "titulo": "Seis hechos del siglo XV",
      "hechos": [
        "expediciones-de-zheng-he",
        "juana-de-arco-en-orleans",
        "expansion-inca",
        "machu-picchu",
        "caida-de-constantinopla",
        "biblia-de-gutenberg"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 3,
      "titulo": "Cinco protagonistas del siglo XV",
      "personajes": [
        "zheng-he",
        "juana-de-arco",
        "pachacutec",
        "mehmed-ii",
        "gutenberg"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué hecho proponen otros textos, en lugar de la llegada de Colón, como fin de la Edad Media?",
      "opciones": [
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Caída del Imperio romano de Occidente",
        "Caída de Constantinopla en manos otomanas",
        "Invención de la escritura en Sumeria"
      ],
      "respuesta": "Caída de Constantinopla en manos otomanas",
      "explicacion": "Otros textos usan 1453, la caída de Constantinopla, como fin de la Edad Media; la escuela usa 1492."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Juana de Arco libera Orleans» o «Caída de Constantinopla en manos otomanas»?",
      "opciones": [
        "Caída de Constantinopla en manos otomanas",
        "Ocurrieron en el mismo año",
        "Juana de Arco libera Orleans",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Juana de Arco libera Orleans",
      "explicacion": "Juana de Arco libera Orleans es de 1429 y Caída de Constantinopla en manos otomanas, de 1453."
    },
    {
      "pregunta": "¿Quién fue este personaje? Heroína militar francesa. Lideró tropas francesas en Orleans durante la guerra de los Cien Años y murió en la hoguera.",
      "opciones": [
        "Zheng He",
        "Pachacútec",
        "Juana de Arco",
        "Johannes Gutenberg"
      ],
      "respuesta": "Juana de Arco",
      "explicacion": "Juana de Arco (1412 – 1431 (fechas aproximadas)): lideró tropas francesas en Orleans durante la guerra de los Cien Años y murió en la hoguera."
    },
    {
      "pregunta": "Según la periodización escolar, ¿en qué época ocurrió «Construcción de Machu Picchu»?",
      "opciones": [
        "Antigüedad",
        "Edad Media",
        "Edad Moderna",
        "Prehistoria"
      ],
      "respuesta": "Edad Media",
      "explicacion": "hacia 1450 cae en la Edad Media (desde 476 d. C., por convención escolar)."
    }
  ]
}$historia$::jsonb,
  5,
  false),

('historia-tecnica-anclas-de-1492', 'Antes y después de 1492: usa la ancla de la Edad Moderna',
  'Ubica los hechos del cuarto de siglo posterior a la llegada de Colón según su distancia a esa ancla.',
  'historia',
  $historia${
  "pasos": [
    "Recuerda: una ancla es una fecha que sabes bien y usas como referencia. La de la Edad Moderna es 1492, la llegada de Colón a América: por convención escolar, la Edad Moderna empieza con ella.",
    "Ese mismo año ocurrió «Caída de Granada, último reino musulmán de la península ibérica». Dos años después, en 1494, Castilla y Portugal firmaron el Tratado de Tordesillas para repartirse las zonas de exploración; y en 1498 Vasco da Gama llegó a la India por mar, rodeando África.",
    "El Renacimiento, del que forman parte Leonardo da Vinci (la «Leonardo da Vinci comienza la Mona Lisa», hacia 1503) y Miguel Ángel (el techo de la Capilla Sixtina, 1508), sigue de cerca.",
    "Y solo 25 años después de la ancla, Lutero publicó sus 95 tesis (1517) y empezó la Reforma protestante. Ubicar cada hecho por su distancia a 1492 vuelve fácil recordar su orden."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 1,
      "titulo": "Un cuarto de siglo a partir de la ancla de 1492",
      "hechos": [
        "llegada-de-colon",
        "caida-de-granada",
        "tratado-de-tordesillas",
        "vasco-da-gama-en-la-india",
        "mona-lisa",
        "capilla-sixtina",
        "noventa-y-cinco-tesis"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 3,
      "titulo": "Seis protagonistas",
      "personajes": [
        "colon",
        "isabel-de-castilla",
        "vasco-da-gama",
        "leonardo-da-vinci",
        "miguel-angel",
        "lutero"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Tratado de Tordesillas entre Castilla y Portugal» o «Vasco da Gama llega a la India por mar»?",
      "opciones": [
        "Vasco da Gama llega a la India por mar",
        "Tratado de Tordesillas entre Castilla y Portugal",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Tratado de Tordesillas entre Castilla y Portugal",
      "explicacion": "Tratado de Tordesillas entre Castilla y Portugal es de 1494 y Vasco da Gama llega a la India por mar, de 1498."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Vasco da Gama llega a la India por mar» o «Lutero publica las 95 tesis y comienza la Reforma protestante»?",
      "opciones": [
        "Lutero publica las 95 tesis y comienza la Reforma protestante",
        "Vasco da Gama llega a la India por mar",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Vasco da Gama llega a la India por mar",
      "explicacion": "Vasco da Gama llega a la India por mar es de 1498 y Lutero publica las 95 tesis y comienza la Reforma protestante, de 1517."
    },
    {
      "pregunta": "Según la periodización escolar, ¿en qué época ocurrió «Miguel Ángel comienza a pintar el techo de la Capilla Sixtina»?",
      "opciones": [
        "Edad Media",
        "Edad Moderna",
        "Edad Contemporánea",
        "Prehistoria"
      ],
      "respuesta": "Edad Moderna",
      "explicacion": "1508 cae en la Edad Moderna (desde 1492, por convención escolar)."
    },
    {
      "pregunta": "¿Quién fue este personaje? Teólogo alemán. Sus 95 tesis dieron inicio a la Reforma protestante.",
      "opciones": [
        "Cristóbal Colón",
        "Martín Lutero",
        "Leonardo da Vinci",
        "Nicolás Copérnico"
      ],
      "respuesta": "Martín Lutero",
      "explicacion": "Martín Lutero (1483 – 1546): sus 95 tesis dieron inicio a la Reforma protestante."
    }
  ]
}$historia$::jsonb,
  1,
  false),

('historia-tecnica-cadenas-de-la-conquista', 'Cadenas de dos pasos: de Colón al Virreinato',
  'Une la llegada de Colón con la caída de Tenochtitlan y con el Virreinato de Nueva España, y otros hechos de la exploración.',
  'historia',
  $historia${
  "pasos": [
    "Recuerda: una cadena de dos pasos une tres hechos, A provoca B y B provoca C. Ante una pregunta que une dos hechos lejanos, busca el hecho intermedio.",
    "Ejemplo: el viaje de Colón (1492) abrió el camino a nuevas expediciones; una de ellas, la de Hernán Cortés, terminó con la «Caída de Tenochtitlan ante los españoles» (1521); y después se creó el «Se crea el Virreinato de Nueva España» (1535). Los historiadores señalan varias causas de esa caída, entre ellas las alianzas de los españoles con pueblos enemigos de los mexicas y las epidemias.",
    "Otra cadena: la expedición de Magallanes partió de España (1519) y, tras la muerte de Magallanes en Filipinas, Elcano la completó: la primera vuelta al mundo (1522).",
    "Estos hechos están en la línea de abajo, junto con la captura de Atahualpa por Pizarro (1532), la batalla de Panipat, que dio origen al Imperio mogol en la India, y la teoría de Copérnico (1543)."
  ],
  "visuales": [
    {
      "tipo": "historia.causas",
      "despuesDePaso": 1,
      "titulo": "De Colón al Virreinato",
      "cadena": [
        "llegada-de-colon",
        "caida-de-tenochtitlan",
        "virreinato-de-nueva-espana"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 3,
      "titulo": "Ocho hechos de 1492 a 1543",
      "hechos": [
        "magallanes-parte",
        "caida-de-tenochtitlan",
        "primera-vuelta-al-mundo",
        "batalla-de-panipat",
        "captura-de-atahualpa",
        "virreinato-de-nueva-espana",
        "de-revolutionibus",
        "llegada-de-colon"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 3,
      "titulo": "Ocho protagonistas",
      "personajes": [
        "magallanes",
        "elcano",
        "hernan-cortes",
        "moctezuma-ii",
        "pizarro",
        "atahualpa",
        "babur",
        "copernico"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Llegada de Colón a América»?",
      "opciones": [
        "Caída de Tenochtitlan ante los españoles",
        "Caída de Constantinopla en manos otomanas",
        "Gutenberg imprime la Biblia con tipos móviles",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina"
      ],
      "respuesta": "Caída de Tenochtitlan ante los españoles",
      "explicacion": "Caída de Tenochtitlan ante los españoles (1521) vino después y se apoya en «Llegada de Colón a América»; los otros hechos son anteriores a 1492, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos contribuyó a provocar «Se crea el Virreinato de Nueva España»?",
      "opciones": [
        "Copérnico publica su teoría heliocéntrica",
        "Derrota de la Armada Invencible",
        "Galileo observa el cielo con el telescopio",
        "Caída de Tenochtitlan ante los españoles"
      ],
      "respuesta": "Caída de Tenochtitlan ante los españoles",
      "explicacion": "Caída de Tenochtitlan ante los españoles (1521) fue anterior y contribuyó a provocarlo; los otros hechos ocurrieron después de 1535, así que no pueden ser una causa."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Magallanes parte de España con cinco naves hacia las Molucas»?",
      "opciones": [
        "Caída de Constantinopla en manos otomanas",
        "Gutenberg imprime la Biblia con tipos móviles",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
        "La expedición de Magallanes y Elcano completa la primera vuelta al mundo"
      ],
      "respuesta": "La expedición de Magallanes y Elcano completa la primera vuelta al mundo",
      "explicacion": "La expedición de Magallanes y Elcano completa la primera vuelta al mundo (1522) vino después y se apoya en «Magallanes parte de España con cinco naves hacia las Molucas»; los otros hechos son anteriores a 1519, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Quién fue este personaje? Navegante español. Completó la primera vuelta al mundo al mando de la nave Victoria.",
      "opciones": [
        "Juan Sebastián Elcano",
        "Fernando de Magallanes",
        "Cristóbal Colón",
        "Vasco da Gama"
      ],
      "respuesta": "Juan Sebastián Elcano",
      "explicacion": "Juan Sebastián Elcano (murió en 1526 (fechas aproximadas)): completó la primera vuelta al mundo al mando de la nave Victoria."
    }
  ]
}$historia$::jsonb,
  2,
  false),

('historia-tecnica-sincronia-siglo-xvi', 'Fines del siglo XVI y comienzos del XVII: cuatro regiones a la vez',
  'Aplica la sincronía: qué pasaba a la vez en la India, Europa, Japón y América del Norte.',
  'historia',
  $historia${
  "pasos": [
    "Recuerda: la sincronía es comparar lo que ocurría a la vez en regiones distintas sobre un mismo eje de tiempo, para no mezclar civilizaciones.",
    "Ejemplo: en la India comenzó el reinado de Akbar (1556); en Europa fue derrotada la «Derrota de la Armada Invencible» (1588) y Cervantes publicó «Cervantes publica la primera parte de Don Quijote» (1605); en Japón se inició el «Comienza el shogunato Tokugawa en Japón» (1603); y en América del Norte se fundó «Fundación de Jamestown, primer asentamiento inglés duradero en América del Norte» (1607).",
    "Estos hechos ocurrieron en aproximadamente medio siglo, pero en mundos casi sin contacto entre sí. Otros tres completan la línea: «Tokugawa Ieyasu vence en Sekigahara» (1600), «Galileo observa el cielo con el telescopio» (1609) y «Comienzo de la guerra de los Treinta Años» (1618).",
    "Cinco protagonistas de esa época: Akbar, Tokugawa Ieyasu, Shakespeare, Cervantes y Galileo."
  ],
  "visuales": [
    {
      "tipo": "historia.sincronia",
      "despuesDePaso": 1,
      "titulo": "De 1556 a 1607, cuatro regiones",
      "carriles": [
        {
          "region": "asia-sur",
          "hechos": [
            "reinado-de-akbar"
          ]
        },
        {
          "region": "europa",
          "hechos": [
            "armada-invencible",
            "don-quijote"
          ]
        },
        {
          "region": "asia-oriental",
          "hechos": [
            "shogunato-tokugawa"
          ]
        },
        {
          "region": "america",
          "hechos": [
            "fundacion-de-jamestown"
          ]
        }
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 2,
      "titulo": "Ocho hechos de 1556 a 1618",
      "hechos": [
        "reinado-de-akbar",
        "armada-invencible",
        "batalla-de-sekigahara",
        "shogunato-tokugawa",
        "don-quijote",
        "fundacion-de-jamestown",
        "telescopio-de-galileo",
        "guerra-de-los-treinta-anios"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 3,
      "titulo": "Cinco protagonistas",
      "personajes": [
        "akbar",
        "tokugawa-ieyasu",
        "shakespeare",
        "cervantes",
        "galileo"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Akbar comienza su reinado en el Imperio mogol» o «Derrota de la Armada Invencible»?",
      "opciones": [
        "Derrota de la Armada Invencible",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero",
        "Akbar comienza su reinado en el Imperio mogol"
      ],
      "respuesta": "Akbar comienza su reinado en el Imperio mogol",
      "explicacion": "Akbar comienza su reinado en el Imperio mogol es de 1556 y Derrota de la Armada Invencible, de 1588."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Derrota de la Armada Invencible» o «Comienza el shogunato Tokugawa en Japón»?",
      "opciones": [
        "Comienza el shogunato Tokugawa en Japón",
        "Ocurrieron en el mismo año",
        "Derrota de la Armada Invencible",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Derrota de la Armada Invencible",
      "explicacion": "Derrota de la Armada Invencible es de 1588 y Comienza el shogunato Tokugawa en Japón, de 1603."
    },
    {
      "pregunta": "¿En qué siglo ocurrió «Comienza el shogunato Tokugawa en Japón»?",
      "opciones": [
        "Siglo XVIII",
        "Siglo XVI",
        "Siglo XVII",
        "Siglo XVII a. C."
      ],
      "respuesta": "Siglo XVII",
      "explicacion": "1603 pertenece al siglo XVII: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    },
    {
      "pregunta": "¿Quién fue este personaje? Escritor español. Escribió Don Quijote de la Mancha.",
      "opciones": [
        "Miguel de Cervantes",
        "William Shakespeare",
        "Galileo Galilei",
        "Akbar"
      ],
      "respuesta": "Miguel de Cervantes",
      "explicacion": "Miguel de Cervantes (1547 – 1616): escribió Don Quijote de la Mancha."
    }
  ]
}$historia$::jsonb,
  3,
  false),

('historia-tecnica-personajes-siglo-xvii', 'Reconocer personajes del siglo XVII por su rol',
  'Distingue a una reina africana, un emperador mogol y un científico inglés por su rol, su época y el hecho que los identifica.',
  'historia',
  $historia${
  "pasos": [
    "Recuerda: para no confundir personajes, guarda tres datos de cada uno: su rol, su época y un hecho con el que se le asocia.",
    "Ejemplo: Nzinga fue reina de Ndongo y Matamba y resistió durante décadas la presión portuguesa (1624); Shah Jahan, emperador mogol, mandó construir el Taj Mahal (1632); e Isaac Newton, científico inglés, publicó los Principia (1687).",
    "Alrededor de ellos ocurren hechos de otros lugares: la llegada de los primeros africanos esclavizados a Virginia (1619), la Paz de Westfalia (1648), la dinastía Qing en China (1644) y la guerra de los Siete Años (1756)."
  ],
  "visuales": [
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 1,
      "titulo": "Tres personajes, tres roles",
      "personajes": [
        "nzinga",
        "shah-jahan",
        "newton"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 2,
      "titulo": "Siete hechos del siglo XVII y mediados del XVIII",
      "hechos": [
        "africanos-esclavizados-en-virginia",
        "nzinga-reina",
        "comienzo-del-taj-mahal",
        "paz-de-westfalia",
        "dinastia-qing",
        "principia-de-newton",
        "guerra-de-los-siete-anios"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Quién fue este personaje? Reina de Ndongo y Matamba. Resistió durante décadas la presión portuguesa en el África central.",
      "opciones": [
        "Nzinga",
        "Shah Jahan",
        "Isaac Newton",
        "Cleopatra VII"
      ],
      "respuesta": "Nzinga",
      "explicacion": "Nzinga (1583 – 1663): resistió durante décadas la presión portuguesa en el África central."
    },
    {
      "pregunta": "¿Quién fue este personaje? Científico inglés. Formuló la ley de la gravitación universal.",
      "opciones": [
        "Shah Jahan",
        "Galileo Galilei",
        "Isaac Newton",
        "Nicolás Copérnico"
      ],
      "respuesta": "Isaac Newton",
      "explicacion": "Isaac Newton (1643 – 1727 (fechas aproximadas)): formuló la ley de la gravitación universal."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Comienza la construcción del Taj Mahal» o «Guerra de los Siete Años»?",
      "opciones": [
        "Comienza la construcción del Taj Mahal",
        "Guerra de los Siete Años",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Comienza la construcción del Taj Mahal",
      "explicacion": "Comienza la construcción del Taj Mahal es de 1632 y Guerra de los Siete Años, de 1756."
    },
    {
      "pregunta": "¿Qué tres datos conviene guardar de cada personaje?",
      "opciones": [
        "Su altura, su peso y su edad",
        "Solo su nombre completo",
        "Su rol, su época y un hecho con el que se le asocia",
        "Su color favorito y su comida"
      ],
      "respuesta": "Su rol, su época y un hecho con el que se le asocia",
      "explicacion": "Con el rol, la época y un hecho asociado se reconoce a un personaje sin confundirlo con otro."
    }
  ]
}$historia$::jsonb,
  4,
  false),

('historia-tecnica-cadena-hacia-la-independencia-de-eeuu', 'Una cadena de tres hechos: de la guerra de los Siete Años a la Constitución',
  'Une la guerra de los Siete Años, la independencia de Estados Unidos y su Constitución, y ubica los hechos de fines del siglo XVIII.',
  'historia',
  $historia${
  "pasos": [
    "Recuerda: una consecuencia nunca es anterior a su causa, y una cadena se comprueba leyéndola hacia atrás con «porque» y hacia delante con «entonces».",
    "Ejemplo: la guerra de los Siete Años (1756) dejó al Reino Unido con grandes deudas; el gobierno británico impuso nuevos impuestos a sus colonias de América del Norte; las colonias protestaron y declararon su independencia (1776); y crearon su Constitución (1787).",
    "Fines del siglo XVIII fue también el tiempo del «Rousseau publica El contrato social» de Rousseau (1762), la máquina de vapor de Watt (1769), el viaje de Cook a Australia (1770) y la rebelión de Túpac Amaru II en los Andes (1780).",
    "Simplificación de nivel escolar: cada hecho tiene más de una causa. Aquí se muestra la cadena más reconocida."
  ],
  "visuales": [
    {
      "tipo": "historia.causas",
      "despuesDePaso": 1,
      "titulo": "De la guerra a la Constitución",
      "cadena": [
        "guerra-de-los-siete-anios",
        "independencia-de-estados-unidos",
        "constitucion-de-estados-unidos"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 2,
      "titulo": "Seis hechos de 1762 a 1787",
      "hechos": [
        "contrato-social",
        "maquina-de-vapor-de-watt",
        "cook-en-australia",
        "rebelion-de-tupac-amaru-ii",
        "independencia-de-estados-unidos",
        "constitucion-de-estados-unidos"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 3,
      "titulo": "Siete protagonistas",
      "personajes": [
        "rousseau",
        "franklin",
        "james-cook",
        "james-watt",
        "washington",
        "jefferson",
        "tupac-amaru-ii"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Guerra de los Siete Años»?",
      "opciones": [
        "Caída de Constantinopla en manos otomanas",
        "Gutenberg imprime la Biblia con tipos móviles",
        "Declaración de Independencia de Estados Unidos",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina"
      ],
      "respuesta": "Declaración de Independencia de Estados Unidos",
      "explicacion": "Declaración de Independencia de Estados Unidos (1776) vino después y se apoya en «Guerra de los Siete Años»; los otros hechos son anteriores a 1756, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Declaración de Independencia de Estados Unidos»?",
      "opciones": [
        "Caída de Constantinopla en manos otomanas",
        "Llegada de Colón a América",
        "Se redacta la Constitución de Estados Unidos",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina"
      ],
      "respuesta": "Se redacta la Constitución de Estados Unidos",
      "explicacion": "Se redacta la Constitución de Estados Unidos (1787) vino después y se apoya en «Declaración de Independencia de Estados Unidos»; los otros hechos son anteriores a 1776, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos contribuyó a provocar «Declaración de Independencia de Estados Unidos»?",
      "opciones": [
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Batalla de Waterloo",
        "Guerra de los Siete Años",
        "Comienzo de la Primera Guerra Mundial"
      ],
      "respuesta": "Guerra de los Siete Años",
      "explicacion": "Guerra de los Siete Años (1756) fue anterior y contribuyó a provocarlo; los otros hechos ocurrieron después de 1776, así que no pueden ser una causa."
    },
    {
      "pregunta": "¿Quién fue este personaje? Presidente de Estados Unidos. Redactó la Declaración de Independencia y fue el tercer presidente de Estados Unidos.",
      "opciones": [
        "George Washington",
        "Benjamin Franklin",
        "Jean-Jacques Rousseau",
        "Thomas Jefferson"
      ],
      "respuesta": "Thomas Jefferson",
      "explicacion": "Thomas Jefferson (1743 – 1826): redactó la Declaración de Independencia y fue el tercer presidente de Estados Unidos."
    }
  ]
}$historia$::jsonb,
  5,
  false),

('historia-tecnica-cadenas-de-las-revoluciones', 'Cadenas de dos pasos: de la Revolución francesa a Haití y a Hispanoamérica',
  'Une con dos cadenas los hechos de 1789 a 1810: las revoluciones, Napoleón y las independencias.',
  'historia',
  $historia${
  "pasos": [
    "Recuerda: una cadena de dos pasos une tres hechos, A provoca B y B provoca C. Ante una pregunta que une dos hechos lejanos, busca el hecho intermedio que hace de puente.",
    "Cadena 1: «Toma de la Bastilla, comienzo de la Revolución francesa» (1789), comienzo de la Revolución francesa, influyó en la «Comienza la revolución haitiana» (1791), que terminó en la «Independencia de Haití» (1804).",
    "Cadena 2: Napoleón se coronó emperador (1804); su invasión de España (1808) debilitó el poder español; y en hacia 1810 comenzaron las revoluciones de independencia en Hispanoamérica.",
    "Otros hechos del período: los Derechos del Hombre (1789), la vacuna de Jenner (1796) y la campaña de Napoleón en Egipto (1798), que trajo el hallazgo de la piedra de Rosetta (1799)."
  ],
  "visuales": [
    {
      "tipo": "historia.causas",
      "despuesDePaso": 1,
      "titulo": "De la Revolución francesa a Haití",
      "cadena": [
        "toma-de-la-bastilla",
        "rebelion-haitiana",
        "independencia-de-haiti"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 2,
      "titulo": "De Napoleón a las independencias hispanoamericanas",
      "cadena": [
        "napoleon-emperador",
        "invasion-napoleonica-de-espana",
        "independencias-hispanoamericanas"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 3,
      "titulo": "Diez hechos de 1789 a 1810",
      "hechos": [
        "toma-de-la-bastilla",
        "derechos-del-hombre",
        "rebelion-haitiana",
        "vacuna-de-jenner",
        "campana-de-egipto",
        "hallazgo-de-rosetta",
        "independencia-de-haiti",
        "napoleon-emperador",
        "invasion-napoleonica-de-espana",
        "independencias-hispanoamericanas"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 3,
      "titulo": "Tres protagonistas",
      "personajes": [
        "napoleon",
        "toussaint-louverture",
        "jenner"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Toma de la Bastilla, comienzo de la Revolución francesa»?",
      "opciones": [
        "Caída de Constantinopla en manos otomanas",
        "Comienza la revolución haitiana",
        "Llegada de Colón a América",
        "Declaración de Independencia de Estados Unidos"
      ],
      "respuesta": "Comienza la revolución haitiana",
      "explicacion": "Comienza la revolución haitiana (1791) vino después y se apoya en «Toma de la Bastilla, comienzo de la Revolución francesa»; los otros hechos son anteriores a 1789, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Napoleón se corona emperador de los franceses»?",
      "opciones": [
        "Caída de Constantinopla en manos otomanas",
        "Llegada de Colón a América",
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Napoleón invade España"
      ],
      "respuesta": "Napoleón invade España",
      "explicacion": "Napoleón invade España (1808) vino después y se apoya en «Napoleón se corona emperador de los franceses»; los otros hechos son anteriores a 1804, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos contribuyó a provocar «Comienzan las revoluciones de independencia en Hispanoamérica»?",
      "opciones": [
        "Comienzo de la Primera Guerra Mundial",
        "Construcción del Muro de Berlín",
        "Napoleón invade España",
        "Llegada del Apolo 11 a la Luna"
      ],
      "respuesta": "Napoleón invade España",
      "explicacion": "Napoleón invade España (1808) fue anterior y contribuyó a provocarlo; los otros hechos ocurrieron después de 1810, así que no pueden ser una causa."
    },
    {
      "pregunta": "¿Quién fue este personaje? Emperador de los franceses. Se coronó emperador de los franceses en 1804 y fue derrotado en Waterloo.",
      "opciones": [
        "Toussaint Louverture",
        "Edward Jenner",
        "George Washington",
        "Napoleón Bonaparte"
      ],
      "respuesta": "Napoleón Bonaparte",
      "explicacion": "Napoleón Bonaparte (1769 – 1821): se coronó emperador de los franceses en 1804 y fue derrotado en Waterloo."
    }
  ]
}$historia$::jsonb,
  1,
  false),

('historia-tecnica-sincronia-siglo-xix', 'Cuatro continentes a la vez: 1815 y 1839',
  'Aplica la sincronía a la primera mitad del siglo XIX: Europa, África, América y Asia oriental.',
  'historia',
  $historia${
  "pasos": [
    "Recuerda: la sincronía es comparar lo que ocurría a la vez en regiones distintas sobre un mismo eje de tiempo.",
    "Ejemplo: en Europa terminaron las guerras napoleónicas en «Batalla de Waterloo» (1815); casi a la vez, en África austral Shaka fundaba el reino zulú (hacia 1816), en América del Sur San Martín cruzaba los Andes (1817) y, unos veinte años después, en Asia oriental comenzaba la primera guerra del Opio (1839).",
    "Las dos líneas de abajo agregan los hechos de las décadas siguientes, hasta la emancipación de esclavizados en Estados Unidos.",
    "Siete protagonistas: Shaka, José de San Martín, Simón Bolívar, Jean-François Champollion, Karl Marx, Charles Darwin, Abraham Lincoln."
  ],
  "visuales": [
    {
      "tipo": "historia.sincronia",
      "despuesDePaso": 1,
      "titulo": "De 1815 a 1839, cuatro regiones",
      "carriles": [
        {
          "region": "europa",
          "hechos": [
            "waterloo"
          ]
        },
        {
          "region": "africa",
          "hechos": [
            "shaka-reino-zulu"
          ]
        },
        {
          "region": "america",
          "hechos": [
            "cruce-de-los-andes"
          ]
        },
        {
          "region": "asia-oriental",
          "hechos": [
            "primera-guerra-del-opio"
          ]
        }
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 2,
      "titulo": "De 1815 a 1824",
      "hechos": [
        "waterloo",
        "shaka-reino-zulu",
        "cruce-de-los-andes",
        "entrevista-de-guayaquil",
        "champollion-jeroglificos",
        "batalla-de-ayacucho"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 2,
      "titulo": "De 1830 a 1863",
      "hechos": [
        "primer-ferrocarril-publico",
        "abolicion-esclavitud-imperio-britanico",
        "primera-guerra-del-opio",
        "origen-de-las-especies",
        "guerra-de-secesion",
        "proclama-de-emancipacion"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 3,
      "titulo": "Siete protagonistas",
      "personajes": [
        "shaka",
        "jose-de-san-martin",
        "simon-bolivar",
        "champollion",
        "marx",
        "darwin",
        "lincoln"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Batalla de Waterloo» o «Comienza la primera guerra del Opio»?",
      "opciones": [
        "Comienza la primera guerra del Opio",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero",
        "Batalla de Waterloo"
      ],
      "respuesta": "Batalla de Waterloo",
      "explicacion": "Batalla de Waterloo es de 1815 y Comienza la primera guerra del Opio, de 1839."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «San Martín cruza los Andes» o «Comienzo de la guerra de Secesión de Estados Unidos»?",
      "opciones": [
        "San Martín cruza los Andes",
        "Comienzo de la guerra de Secesión de Estados Unidos",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "San Martín cruza los Andes",
      "explicacion": "San Martín cruza los Andes es de 1817 y Comienzo de la guerra de Secesión de Estados Unidos, de 1861."
    },
    {
      "pregunta": "¿En qué siglo ocurrió «Darwin publica El origen de las especies»?",
      "opciones": [
        "Siglo XX",
        "Siglo XIX",
        "Siglo XVIII",
        "Siglo XIX a. C."
      ],
      "respuesta": "Siglo XIX",
      "explicacion": "1859 pertenece al siglo XIX: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    },
    {
      "pregunta": "¿Quién fue este personaje? Presidente de Estados Unidos. Fue presidente durante la guerra de Secesión y proclamó la emancipación de los esclavizados.",
      "opciones": [
        "Charles Darwin",
        "Abraham Lincoln",
        "Karl Marx",
        "Simón Bolívar"
      ],
      "respuesta": "Abraham Lincoln",
      "explicacion": "Abraham Lincoln (1809 – 1865): fue presidente durante la guerra de Secesión y proclamó la emancipación de los esclavizados."
    }
  ]
}$historia$::jsonb,
  2,
  false),

('historia-tecnica-cambio-de-siglo', 'El cambio de siglo: los años redondos cierran el siglo',
  'Practica el año a siglo con años redondos como 1900 y 2000, y ubica los hechos entre 1868 y 1912.',
  'historia',
  $historia${
  "pasos": [
    "Recuerda: el siglo n va del año (n − 1) · 100 + 1 al año n · 100. Un año redondo cierra el siglo; no lo empieza.",
    "Por eso «Etiopía derrota a Italia en la batalla de Adua» (1896) es del siglo XIX, mientras que «Primer vuelo motorizado de los hermanos Wright» (1903) ya es del siglo XX. Y el año 1900 es todavía del siglo XIX y el 2000 del XX.",
    "El cambio de siglo del XIX al XX reúne hechos de todo el mundo: la «Restauración Meiji en Japón» en Japón (1868), el canal de Suez (1869), el teléfono de Bell (1876), la Conferencia de Berlín (1884), el voto femenino en Nueva Zelanda (1893), la relatividad de Einstein (1905) y la República china (1912).",
    "Ocho protagonistas: Otto von Bismarck, Emperador Meiji, Alexander Graham Bell, Menelik II, Marie Curie, Sun Yat-sen, Rabindranath Tagore, Albert Einstein."
  ],
  "visuales": [
    {
      "tipo": "historia.siglos",
      "despuesDePaso": 1,
      "titulo": "Años redondos y cambio de siglo",
      "ejemplos": [
        1900,
        2000,
        2001,
        "batalla-de-adua",
        "primer-vuelo-motorizado"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 2,
      "titulo": "Nueve hechos de 1868 a 1912",
      "hechos": [
        "restauracion-meiji",
        "canal-de-suez",
        "telefono-de-bell",
        "conferencia-de-berlin",
        "voto-femenino-nueva-zelanda",
        "batalla-de-adua",
        "primer-vuelo-motorizado",
        "relatividad-especial",
        "republica-china"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 3,
      "titulo": "Ocho protagonistas",
      "personajes": [
        "bismarck",
        "emperador-meiji",
        "bell",
        "menelik-ii",
        "marie-curie",
        "sun-yat-sen",
        "tagore",
        "einstein"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿En qué siglo ocurrió «Etiopía derrota a Italia en la batalla de Adua»?",
      "opciones": [
        "Siglo XX",
        "Siglo XIX",
        "Siglo XVIII",
        "Siglo XIX a. C."
      ],
      "respuesta": "Siglo XIX",
      "explicacion": "1896 pertenece al siglo XIX: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    },
    {
      "pregunta": "¿En qué siglo ocurrió «Primer vuelo motorizado de los hermanos Wright»?",
      "opciones": [
        "Siglo XXI",
        "Siglo XIX",
        "Siglo XX",
        "Siglo XX a. C."
      ],
      "respuesta": "Siglo XX",
      "explicacion": "1903 pertenece al siglo XX: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    },
    {
      "pregunta": "¿A qué siglo pertenece el año 2000?",
      "opciones": [
        "Siglo XXI",
        "Siglo XX",
        "Siglo XIX",
        "Siglo XXII"
      ],
      "respuesta": "Siglo XX",
      "explicacion": "El año 2000 cierra el siglo XX; el siglo XXI empezó en el año 2001."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Bell patenta el teléfono» o «Primer vuelo motorizado de los hermanos Wright»?",
      "opciones": [
        "Primer vuelo motorizado de los hermanos Wright",
        "Bell patenta el teléfono",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Bell patenta el teléfono",
      "explicacion": "Bell patenta el teléfono es de 1876 y Primer vuelo motorizado de los hermanos Wright, de 1903."
    }
  ]
}$historia$::jsonb,
  3,
  false),

('historia-tecnica-causas-de-la-primera-guerra', 'Causas y consecuencias: la Primera Guerra Mundial y la crisis de 1929',
  'Tres cadenas cortas de las primeras décadas del siglo XX: la guerra y la Revolución rusa, la guerra y Versalles, y la crisis de 1929.',
  'historia',
  $historia${
  "pasos": [
    "Recuerda: una consecuencia nunca es anterior a su causa. Para comprobar una cadena, léela hacia atrás con «porque» y hacia delante con «entonces».",
    "Cadena 1: «Asesinato del archiduque Francisco Fernando en Sarajevo» (1914) fue el detonante de la «Comienzo de la Primera Guerra Mundial» (1914); durante la guerra tuvo lugar la «Revolución de Octubre en Rusia» (1917), de la que surgió la «Fundación de la Unión Soviética» (1922).",
    "Cadena 2: la guerra terminó con el armisticio (1918) y las potencias vencedoras firmaron el Tratado de Versalles (1919). Cadena 3: la crisis bursátil de 1929 en Nueva York fue seguida por la Gran Depresión, una crisis económica mundial.",
    "Otros hechos de esas décadas: el descubrimiento de la penicilina (1928) y la Marcha de la Sal de Gandhi (1930). Protagonistas: Vladímir Lenin, Mahatma Gandhi, Alexander Fleming."
  ],
  "visuales": [
    {
      "tipo": "historia.causas",
      "despuesDePaso": 1,
      "titulo": "Del asesinato de Sarajevo a la URSS",
      "cadena": [
        "asesinato-de-francisco-fernando",
        "primera-guerra-mundial",
        "revolucion-rusa",
        "fundacion-de-la-urss"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 2,
      "titulo": "De la guerra a Versalles",
      "cadena": [
        "primera-guerra-mundial",
        "armisticio-de-1918",
        "tratado-de-versalles"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 2,
      "titulo": "De la crisis a la Depresión",
      "cadena": [
        "crisis-de-1929",
        "gran-depresion"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 3,
      "titulo": "Diez hechos de 1914 a 1930",
      "hechos": [
        "asesinato-de-francisco-fernando",
        "primera-guerra-mundial",
        "revolucion-rusa",
        "armisticio-de-1918",
        "tratado-de-versalles",
        "fundacion-de-la-urss",
        "penicilina",
        "crisis-de-1929",
        "gran-depresion",
        "marcha-de-la-sal"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 3,
      "titulo": "Tres protagonistas",
      "personajes": [
        "lenin",
        "gandhi",
        "fleming"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Asesinato del archiduque Francisco Fernando en Sarajevo»?",
      "opciones": [
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Batalla de Waterloo",
        "Restauración Meiji en Japón",
        "Comienzo de la Primera Guerra Mundial"
      ],
      "respuesta": "Comienzo de la Primera Guerra Mundial",
      "explicacion": "Comienzo de la Primera Guerra Mundial (1914) vino después y se apoya en «Asesinato del archiduque Francisco Fernando en Sarajevo»; los otros hechos son anteriores a 1914, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Comienzo de la Primera Guerra Mundial»?",
      "opciones": [
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Batalla de Waterloo",
        "Restauración Meiji en Japón",
        "Revolución de Octubre en Rusia"
      ],
      "respuesta": "Revolución de Octubre en Rusia",
      "explicacion": "Revolución de Octubre en Rusia (1917) vino después y se apoya en «Comienzo de la Primera Guerra Mundial»; los otros hechos son anteriores a 1914, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos contribuyó a provocar «Tratado de Versalles»?",
      "opciones": [
        "Comienzo de la Segunda Guerra Mundial",
        "Construcción del Muro de Berlín",
        "Armisticio que pone fin a la Primera Guerra Mundial",
        "Llegada del Apolo 11 a la Luna"
      ],
      "respuesta": "Armisticio que pone fin a la Primera Guerra Mundial",
      "explicacion": "Armisticio que pone fin a la Primera Guerra Mundial (1918) fue anterior y contribuyó a provocarlo; los otros hechos ocurrieron después de 1919, así que no pueden ser una causa."
    },
    {
      "pregunta": "¿Cuál de estos hechos contribuyó a provocar «Comienza la Gran Depresión»?",
      "opciones": [
        "Comienzo de la Segunda Guerra Mundial",
        "Construcción del Muro de Berlín",
        "Llegada del Apolo 11 a la Luna",
        "Crisis bursátil en Wall Street"
      ],
      "respuesta": "Crisis bursátil en Wall Street",
      "explicacion": "Crisis bursátil en Wall Street (1929) fue anterior y contribuyó a provocarlo; los otros hechos ocurrieron después de 1929, así que no pueden ser una causa."
    }
  ]
}$historia$::jsonb,
  4,
  false),

('historia-tecnica-personajes-de-la-segunda-guerra', 'Personajes por rol: la Segunda Guerra Mundial y la posguerra',
  'Reconoce a los protagonistas de 1939 a 1949 por su rol, su país y un hecho asociado, sin juicios.',
  'historia',
  $historia${
  "pasos": [
    "Recuerda: para no confundir personajes, guarda su rol, su época y un hecho asociado. En la historia reciente conviene registrar solo datos verificables, sin juicios.",
    "Ejemplos: Winston Churchill fue primer ministro del Reino Unido durante la mayor parte de la guerra; Franklin D. Roosevelt era presidente de Estados Unidos cuando entró en la guerra (1941); Iósif Stalin gobernaba la Unión Soviética; Adolf Hitler era canciller de Alemania cuando comenzó la guerra (1939).",
    "Tras la guerra (1945) surgieron nuevos protagonistas: Eleanor Roosevelt, que presidió el comité que redactó la Declaración Universal de Derechos Humanos (1948); Jawaharlal Nehru, primer jefe de gobierno de la India independiente (1947); y Mao Zedong, que proclamó la República Popular China (1949).",
    "Las dos líneas de abajo ordenan los doce hechos de la guerra y de la posguerra inmediata."
  ],
  "visuales": [
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 2,
      "titulo": "Siete protagonistas",
      "personajes": [
        "hitler",
        "churchill",
        "stalin",
        "franklin-roosevelt",
        "eleanor-roosevelt",
        "nehru",
        "mao-zedong"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 3,
      "titulo": "De 1939 a 1945",
      "hechos": [
        "invasion-de-polonia",
        "segunda-guerra-mundial",
        "pearl-harbor",
        "desembarco-de-normandia",
        "liberacion-de-auschwitz",
        "bombas-atomicas"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 3,
      "titulo": "De 1945 a 1949",
      "hechos": [
        "fin-de-la-segunda-guerra-mundial",
        "fundacion-de-la-onu",
        "comienzo-de-la-guerra-fria",
        "independencia-de-la-india",
        "declaracion-de-derechos-humanos",
        "republica-popular-china"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Quién fue este personaje? Primer ministro británico. Fue primer ministro del Reino Unido durante la mayor parte de la Segunda Guerra Mundial.",
      "opciones": [
        "Franklin D. Roosevelt",
        "Iósif Stalin",
        "Jawaharlal Nehru",
        "Winston Churchill"
      ],
      "respuesta": "Winston Churchill",
      "explicacion": "Winston Churchill (1874 – 1965): fue primer ministro del Reino Unido durante la mayor parte de la Segunda Guerra Mundial."
    },
    {
      "pregunta": "¿Quién fue este personaje? Diplomática estadounidense. Presidió el comité que redactó la Declaración Universal de Derechos Humanos.",
      "opciones": [
        "Eleanor Roosevelt",
        "Franklin D. Roosevelt",
        "Winston Churchill",
        "Marie Curie"
      ],
      "respuesta": "Eleanor Roosevelt",
      "explicacion": "Eleanor Roosevelt (1884 – 1962): presidió el comité que redactó la Declaración Universal de Derechos Humanos."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Ataque a Pearl Harbor» o «Declaración Universal de Derechos Humanos»?",
      "opciones": [
        "Declaración Universal de Derechos Humanos",
        "Ocurrieron en el mismo año",
        "Ataque a Pearl Harbor",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Ataque a Pearl Harbor",
      "explicacion": "Ataque a Pearl Harbor es de 1941 y Declaración Universal de Derechos Humanos, de 1948."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Fundación de la Organización de las Naciones Unidas» o «Independencia de la India y Pakistán»?",
      "opciones": [
        "Independencia de la India y Pakistán",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero",
        "Fundación de la Organización de las Naciones Unidas"
      ],
      "respuesta": "Fundación de la Organización de las Naciones Unidas",
      "explicacion": "Fundación de la Organización de las Naciones Unidas es de 1945 y Independencia de la India y Pakistán, de 1947."
    }
  ]
}$historia$::jsonb,
  5,
  false),

('historia-tecnica-hechos-y-opiniones', 'Hechos y opiniones: cómo estudiar la historia reciente',
  'Separa un hecho (con fecha y protagonistas) de un juicio o una interpretación, y ubica los hechos de 1957 a 2020.',
  'historia',
  $historia${
  "pasos": [
    "Un hecho tiene fecha, lugar y protagonistas y se puede comprobar. Una opinión o una interpretación dice si algo estuvo bien o mal, o por qué ocurrió «realmente»; los historiadores la discuten y puede cambiar.",
    "Ejemplos: «Llegada del Apolo 11 a la Luna ocurrió en 1969» es un hecho. «Fue el mayor logro de la humanidad» es una opinión. «Caída del Muro de Berlín ocurrió en 1989» es un hecho.",
    "Cuanto más reciente es un período, más cerca están las opiniones de los lectores. Por eso este curso enseña de la historia reciente solo lo de amplio consenso: qué pasó, cuándo y quiénes intervinieron. Las cifras discutidas y los juicios quedan afuera.",
    "Aplica la técnica a los hechos de 1957 a 2020: las dos líneas de abajo tienen solo hechos y la ficha de ocho protagonistas, sin juicios."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 3,
      "titulo": "De 1957 a 1969",
      "hechos": [
        "independencia-de-ghana",
        "sputnik",
        "anio-de-africa",
        "muro-de-berlin",
        "vuelo-de-gagarin",
        "crisis-de-los-misiles",
        "marcha-sobre-washington",
        "llegada-a-la-luna"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 3,
      "titulo": "De 1980 a 2020",
      "hechos": [
        "viruela-erradicada",
        "caida-del-muro-de-berlin",
        "mandela-libre",
        "reunificacion-de-alemania",
        "disolucion-de-la-urss",
        "mandela-presidente",
        "pandemia-de-covid-19"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 3,
      "titulo": "Ocho protagonistas",
      "personajes": [
        "nkrumah",
        "kennedy",
        "martin-luther-king",
        "gagarin",
        "armstrong",
        "mandela",
        "gorbachov",
        "berners-lee"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estas afirmaciones es un hecho?",
      "opciones": [
        "La llegada a la Luna fue el mayor logro de la humanidad",
        "La llegada a la Luna fue una pérdida de dinero",
        "La llegada a la Luna fue lo mejor que pasó en el siglo XX",
        "Llegada del Apolo 11 a la Luna ocurrió en 1969"
      ],
      "respuesta": "Llegada del Apolo 11 a la Luna ocurrió en 1969",
      "explicacion": "Un hecho se puede comprobar con una fecha y protagonistas; las otras opciones son opiniones o juicios."
    },
    {
      "pregunta": "Según esta técnica, ¿qué se enseña de la historia reciente?",
      "opciones": [
        "Las opiniones de cada autor",
        "Lo de amplio consenso: qué pasó, cuándo y quiénes intervinieron",
        "Solo las cifras discutidas",
        "Únicamente lo que ocurrió hace más de mil años"
      ],
      "respuesta": "Lo de amplio consenso: qué pasó, cuándo y quiénes intervinieron",
      "explicacion": "En la historia reciente conviene quedarse con fechas y protagonistas verificables y evitar juicios."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Lanzamiento del Sputnik 1» o «Caída del Muro de Berlín»?",
      "opciones": [
        "Caída del Muro de Berlín",
        "Ocurrieron en el mismo año",
        "Lanzamiento del Sputnik 1",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Lanzamiento del Sputnik 1",
      "explicacion": "Lanzamiento del Sputnik 1 es de 1957 y Caída del Muro de Berlín, de 1989."
    },
    {
      "pregunta": "¿Quién fue este personaje? Presidente de Sudáfrica. Pasó 27 años en prisión y fue el primer presidente de Sudáfrica elegido en votaciones multirraciales.",
      "opciones": [
        "John F. Kennedy",
        "Kwame Nkrumah",
        "Nelson Mandela",
        "Mijaíl Gorbachov"
      ],
      "respuesta": "Nelson Mandela",
      "explicacion": "Nelson Mandela (1918 – 2013): pasó 27 años en prisión y fue el primer presidente de Sudáfrica elegido en votaciones multirraciales."
    }
  ]
}$historia$::jsonb,
  6,
  false);

-- 3) Clases (requiere_pro = true): se desbloquean por época; la primera del mundo es preview gratis.
insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

('historia-clase-01-paleolitico', 'Los primeros humanos: el Paleolítico',
  'Cómo vivían los primeros humanos, qué cambió con el fuego y cómo nuestra especie llegó a todos los continentes.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás describir cómo vivían los primeros humanos y ordenar en el tiempo las herramientas de piedra, el fuego, la aparición de Homo sapiens y sus migraciones.",
    "Contexto: es la primera lección del curso y no necesitas saber nada antes. Solo ten presente que la Prehistoria es todo lo ocurrido antes de la escritura (que la escuela sitúa hacia 3500 a. C.), y que por eso sus fechas son siempre aproximadas.",
    "El Paleolítico («piedra antigua») es la etapa más larga de la humanidad: empieza con las primeras herramientas de piedra talladas (hacia 2 500 000 a. C.) y termina con el final de la última glaciación (hacia 10 000 a. C.). Simplificación de nivel escolar: los especialistas lo dividen en fases. Los grupos eran pequeños, nómadas, y vivían de la caza, la pesca y la recolección.",
    "Dominar el fuego (hacia 800 000 a. C.) permitió calentarse, cocinar, ahuyentar animales y prolongar el día. Fue obra de homínidos anteriores a nuestra especie.",
    "Los primeros Homo sapiens aparecen en África (hacia 300 000 a. C.); esa fecha se revisa cuando se descubren restos más antiguos. Desde allí nuestra especie se expandió: llegó a Australia (hacia 50 000 a. C.) y a América (hacia 15 000 a. C.); sobre cuándo llegó a América los especialistas siguen discutiendo.",
    "Los humanos del Paleolítico también dejaron arte: las pinturas rupestres de Lascaux (hacia 17 000 a. C.), en Francia, muestran sobre todo animales.",
    "Personajes clave: en la Prehistoria no conocemos nombres, porque nadie los escribió. Conocemos a esas personas por lo que dejaron: herramientas, huesos, restos de fogatas y pinturas.",
    "Causas y consecuencias: cada avance abrió el siguiente. Con fuego y mejores herramientas, los grupos pudieron sobrevivir en climas fríos y expandirse a nuevos territorios; esa expansión llevó a nuestra especie a casi todos los continentes.",
    "Conecta con: la siguiente lección, el Neolítico, donde la agricultura cambia la forma de vivir; y con la Antigüedad, donde la escritura permite por fin fechar por año.",
    "Errores comunes: (1) creer que los dinosaurios y los humanos convivieron: los dinosaurios no aviares se extinguieron millones de años antes de que apareciera nuestra especie; (2) imaginar un «primer humano» en un año concreto: fue un proceso gradual; (3) leer «hacia» como un año exacto."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 5,
      "titulo": "Del primer útil de piedra a las primeras migraciones",
      "hechos": [
        "herramientas-de-piedra",
        "uso-del-fuego",
        "homo-sapiens",
        "humanos-en-australia",
        "pinturas-de-lascaux",
        "poblamiento-de-america"
      ],
      "escala": "orden"
    }
  ],
  "quiz": [
    {
      "pregunta": "Según la periodización escolar, ¿en qué época ocurrió «Aparición de los primeros Homo sapiens en África»?",
      "opciones": [
        "Antigüedad",
        "Edad Media",
        "Edad Moderna",
        "Prehistoria"
      ],
      "respuesta": "Prehistoria",
      "explicacion": "hacia 300 000 a. C. cae en la Prehistoria (hasta 3500 a. C., por convención escolar)."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Uso controlado del fuego por los homínidos» o «Llegada de los primeros humanos a Australia»?",
      "opciones": [
        "Llegada de los primeros humanos a Australia",
        "Uso controlado del fuego por los homínidos",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Uso controlado del fuego por los homínidos",
      "explicacion": "Uso controlado del fuego por los homínidos es de hacia 800 000 a. C. y Llegada de los primeros humanos a Australia, de hacia 50 000 a. C."
    },
    {
      "pregunta": "¿Por qué en la Prehistoria no conocemos nombres de personas?",
      "opciones": [
        "Porque entonces nadie tenía nombre",
        "Porque todavía no existía la escritura y solo quedan restos materiales",
        "Porque los nombres se perdieron en una guerra",
        "Porque los historiadores decidieron no anotarlos"
      ],
      "respuesta": "Porque todavía no existía la escritura y solo quedan restos materiales",
      "explicacion": "La Prehistoria termina, por convención, con la invención de la escritura: antes de ella no hay textos y solo se estudian restos como herramientas, huesos y pinturas."
    },
    {
      "pregunta": "¿Cuál de estas afirmaciones sobre el Paleolítico es correcta?",
      "opciones": [
        "Vivían en grandes ciudades amuralladas",
        "Los grupos eran pequeños y nómadas, y vivían de la caza, la pesca y la recolección",
        "Cultivaban cereales en grandes campos",
        "Escribían tablillas para llevar cuentas"
      ],
      "respuesta": "Los grupos eran pequeños y nómadas, y vivían de la caza, la pesca y la recolección",
      "explicacion": "Las ciudades, la agricultura y la escritura aparecen mucho después, con el Neolítico y el final de la Prehistoria."
    },
    {
      "pregunta": "Una fecha como «hacia 300 000 a. C.» para la aparición de Homo sapiens es...",
      "opciones": [
        "El año exacto en que nació el primer ser humano",
        "Una fecha convencional que fija la escuela",
        "Una estimación con un gran margen de error",
        "Una fecha que ya no se discute nunca"
      ],
      "respuesta": "Una estimación con un gran margen de error",
      "explicacion": "Las fechas de la Prehistoria son aproximadas y se revisan cuando aparecen nuevos hallazgos."
    }
  ]
}$historia$::jsonb,
  1,
  true),

('historia-clase-02-neolitico', 'El Neolítico: la revolución agrícola y el fin de la Prehistoria',
  'Cómo la agricultura transformó la vida humana y por qué la aparición de la escritura cierra la Prehistoria.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar qué fue la revolución agrícola, qué cambió con ella y por qué la aparición de la escritura se toma como el final de la Prehistoria.",
    "Contexto: en la lección anterior viste que los grupos del Paleolítico eran nómadas. El clima cambió cuando terminó la última glaciación (hacia 10 000 a. C.) y eso abrió el camino a una forma de vida nueva.",
    "Con un clima más templado y estable, en el Creciente Fértil (una región en forma de arco en Oriente Próximo) algunas comunidades empezaron a cultivar cereales y a criar animales: es el inicio de la agricultura (hacia 9000 a. C.). Se lo llama «revolución neolítica» («piedra nueva») porque cambió la forma de vivir, aunque el proceso llevó muchos siglos.",
    "No todo el cambio fue solo agrícola. En Göbekli Tepe, en la actual Turquía, se levantó un templo de piedra monumental (hacia 9500 a. C.) que, según la mayoría de los especialistas, construyeron comunidades que aún no dependían de la agricultura. Y más tarde aparecen los primeros objetos de cobre fundido (hacia 5000 a. C.), el comienzo de la metalurgia.",
    "Al producir alimento y guardarlo, las comunidades se volvieron sedentarias: aparecieron las aldeas, los excedentes, los oficios especializados y las diferencias de riqueza. Con las aldeas grandes y los intercambios, en Sumeria surgió la escritura (3500 a. C., por convención), que se usó primero para llevar cuentas. Esa invención marca el final de la Prehistoria.",
    "Personajes clave: como en la lección anterior, no conocemos nombres. El protagonista colectivo son las primeras comunidades agrícolas.",
    "Causas y consecuencias: el fin de la glaciación favoreció la agricultura; la agricultura permitió aldeas y excedentes; y de ellos surgieron las ciudades y la escritura. Simplificación de nivel escolar: cada paso tuvo muchas causas y ocurrió en varias regiones.",
    "Conecta con: la Antigüedad, que empieza justo con «Invención de la escritura en Sumeria»; y con la Técnica «Causa, hecho y consecuencia», que usa esta misma cadena.",
    "Errores comunes: (1) la agricultura no apareció en un solo lugar ni en un solo año: surgió de forma independiente en varias regiones del mundo; (2) «revolución» no significa rápido, sino que cambió las cosas de raíz; (3) el Neolítico todavía es Prehistoria: la Antigüedad empieza con la escritura."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 2,
      "titulo": "Del fin de la glaciación a la escritura",
      "hechos": [
        "fin-de-la-glaciacion",
        "gobekli-tepe",
        "inicio-de-la-agricultura",
        "primeros-objetos-de-cobre",
        "escritura-cuneiforme"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 6,
      "titulo": "Una cadena de causas",
      "cadena": [
        "fin-de-la-glaciacion",
        "inicio-de-la-agricultura",
        "escritura-cuneiforme"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Construcción del templo de Göbekli Tepe» o «Primeros objetos de cobre fundido»?",
      "opciones": [
        "Primeros objetos de cobre fundido",
        "Ocurrieron en el mismo año",
        "Construcción del templo de Göbekli Tepe",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Construcción del templo de Göbekli Tepe",
      "explicacion": "Construcción del templo de Göbekli Tepe es de hacia 9500 a. C. y Primeros objetos de cobre fundido, de hacia 5000 a. C."
    },
    {
      "pregunta": "Según la periodización escolar, ¿en qué época ocurrió «Primeros objetos de cobre fundido»?",
      "opciones": [
        "Antigüedad",
        "Edad Media",
        "Prehistoria",
        "Edad Moderna"
      ],
      "respuesta": "Prehistoria",
      "explicacion": "hacia 5000 a. C. cae en la Prehistoria (hasta 3500 a. C., por convención escolar)."
    },
    {
      "pregunta": "¿Cuál de estos hechos contribuyó a provocar «Inicio de la agricultura en el Creciente Fértil»?",
      "opciones": [
        "Invención de la escritura en Sumeria",
        "Fin de la última glaciación",
        "Construcción de la Gran Pirámide de Guiza",
        "Código de Hammurabi en Babilonia"
      ],
      "respuesta": "Fin de la última glaciación",
      "explicacion": "Fin de la última glaciación (hacia 10 000 a. C.) fue anterior y contribuyó a provocarlo; los otros hechos ocurrieron después de hacia 9000 a. C., así que no pueden ser una causa."
    },
    {
      "pregunta": "¿Qué hecho marca, por convención, el final de la Prehistoria?",
      "opciones": [
        "Invención de la escritura en Sumeria",
        "Inicio de la agricultura en el Creciente Fértil",
        "Uso controlado del fuego por los homínidos",
        "Primeros objetos de cobre fundido"
      ],
      "respuesta": "Invención de la escritura en Sumeria",
      "explicacion": "La Prehistoria es lo ocurrido antes de la escritura; la escuela sitúa su invención hacia 3500 a. C."
    },
    {
      "pregunta": "¿Por qué se habla de «revolución» agrícola si el proceso llevó siglos?",
      "opciones": [
        "Porque cambió de raíz la forma de vivir, aunque el cambio fue lento",
        "Porque ocurrió en un solo año",
        "Porque la hicieron ejércitos",
        "Porque solo ocurrió en Europa"
      ],
      "respuesta": "Porque cambió de raíz la forma de vivir, aunque el cambio fue lento",
      "explicacion": "«Revolución» se refiere a la profundidad del cambio (vida sedentaria, excedentes, aldeas), no a su rapidez."
    }
  ]
}$historia$::jsonb,
  2,
  true),

('historia-clase-03-mesopotamia-y-egipto', 'Mesopotamia y Egipto: las primeras civilizaciones',
  'Dos civilizaciones nacidas junto a grandes ríos: la escritura y las leyes de Mesopotamia, y los faraones y las pirámides de Egipto.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar qué tienen en común las primeras civilizaciones de Mesopotamia y Egipto y ubicar sus grandes hitos: la escritura, el Código de Hammurabi, la unificación de Egipto y la Gran Pirámide.",
    "Contexto: la Antigüedad empieza con la escritura, que la escuela sitúa hacia 3500 a. C. Repaso de la Prehistoria: al terminar la última glaciación (hacia 10 000 a. C.) apareció la agricultura (hacia 9000 a. C.); con alimento guardado crecieron las aldeas y, después, surgió la escritura. Esa cadena de causas y consecuencias termina justo acá.",
    "Mesopotamia significa «entre ríos»: es la región entre el Tigris y el Éufrates, en el actual Irak. Allí, en Sumeria, hubo ciudades como Ur y Uruk y se desarrolló la escritura cuneiforme, hecha con signos en forma de cuña marcados con una caña sobre tablillas de arcilla.",
    "En Babilonia, el rey Hammurabi hizo grabar en una estela de piedra un conjunto de leyes: el Código de Hammurabi (hacia 1754 a. C.). Es uno de los primeros códigos legales escritos que se conservan y regulaba asuntos como el comercio, la propiedad y la familia. Es del siglo XVIII a. C.",
    "Egipto nació a lo largo del río Nilo, cuyas crecidas anuales dejaban tierra fértil. Hacia 3100 a. C. se unieron el Alto y el Bajo Egipto bajo un solo faraón. Los faraones eran considerados figuras sagradas y gobernaban con ayuda de escribas y sacerdotes. La Gran Pirámide de Guiza (hacia 2560 a. C.) fue la tumba del faraón Keops y es del siglo XXVI a. C.",
    "Personajes clave: Hammurabi, rey de Babilonia, y Ramsés II, faraón de Egipto durante más de sesenta años. Se los conoce por textos y monumentos, y algunas de sus fechas de vida son aproximadas.",
    "Causas y consecuencias: la escritura permitió registrar cuentas, leyes y noticias. Por eso, mucho después de su invención, un rey pudo publicar leyes por escrito para todo su reino. La figura de abajo une la cadena desde la Prehistoria hasta el Código de Hammurabi.",
    "Conecta con: las lecciones de India y China, donde otras grandes civilizaciones también surgieron junto a ríos; con la lección de Grecia, que heredará ideas de Egipto y Mesopotamia; y con la Técnica «Los años a. C. se cuentan hacia atrás», que sirve para ordenar todas estas fechas.",
    "Errores comunes: (1) confundir Mesopotamia (Tigris y Éufrates, Asia) con Egipto (Nilo, África); (2) creer que Hammurabi inventó las leyes: ya existían leyes escritas antes, pero su código es de los más completos que se conservan; (3) leer «hacia 2560 a. C.» como un año exacto: es una estimación."
  ],
  "visuales": [
    {
      "tipo": "historia.siglos",
      "despuesDePaso": 3,
      "titulo": "Siglos a. C.: se cuentan hacia atrás",
      "ejemplos": [
        "codigo-de-hammurabi",
        "piramide-de-keops"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 4,
      "titulo": "Egipto y Mesopotamia en la línea del tiempo",
      "hechos": [
        "escritura-cuneiforme",
        "unificacion-de-egipto",
        "piramide-de-keops",
        "codigo-de-hammurabi"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 5,
      "titulo": "Hammurabi y Ramsés II",
      "personajes": [
        "hammurabi",
        "ramses-ii"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 6,
      "titulo": "De la glaciación a las leyes escritas",
      "cadena": [
        "fin-de-la-glaciacion",
        "inicio-de-la-agricultura",
        "escritura-cuneiforme",
        "codigo-de-hammurabi"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿En qué siglo ocurrió «Código de Hammurabi en Babilonia»?",
      "opciones": [
        "Siglo XIX a. C.",
        "Siglo XVII a. C.",
        "Siglo XVIII",
        "Siglo XVIII a. C."
      ],
      "respuesta": "Siglo XVIII a. C.",
      "explicacion": "hacia 1754 a. C. pertenece al siglo XVIII a. C.: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Unificación del Alto y el Bajo Egipto» o «Construcción de la Gran Pirámide de Guiza»?",
      "opciones": [
        "Construcción de la Gran Pirámide de Guiza",
        "Ocurrieron en el mismo año",
        "Unificación del Alto y el Bajo Egipto",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Unificación del Alto y el Bajo Egipto",
      "explicacion": "Unificación del Alto y el Bajo Egipto es de hacia 3100 a. C. y Construcción de la Gran Pirámide de Guiza, de hacia 2560 a. C."
    },
    {
      "pregunta": "¿Qué significa «Mesopotamia»?",
      "opciones": [
        "«Tierra del Nilo»",
        "«Ciudad del rey»",
        "«Tierra de los faraones»",
        "«Entre ríos»: la región entre el Tigris y el Éufrates"
      ],
      "respuesta": "«Entre ríos»: la región entre el Tigris y el Éufrates",
      "explicacion": "Mesopotamia viene del griego y significa «entre ríos». El Nilo es el río de Egipto."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Invención de la escritura en Sumeria»?",
      "opciones": [
        "Uso controlado del fuego por los homínidos",
        "Pinturas rupestres de Lascaux",
        "Fin de la última glaciación",
        "Código de Hammurabi en Babilonia"
      ],
      "respuesta": "Código de Hammurabi en Babilonia",
      "explicacion": "Código de Hammurabi en Babilonia (hacia 1754 a. C.) vino después y se apoya en «Invención de la escritura en Sumeria»; los otros hechos son anteriores a 3500 a. C., así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Qué fue el Código de Hammurabi?",
      "opciones": [
        "Un poema épico de Grecia",
        "Un templo de Egipto",
        "Un conjunto de leyes escritas, grabado en una estela, del reino de Babilonia",
        "Una tablilla de cuentas de la Prehistoria"
      ],
      "respuesta": "Un conjunto de leyes escritas, grabado en una estela, del reino de Babilonia",
      "explicacion": "Fue un conjunto de leyes de Hammurabi, rey de Babilonia (hacia 1754 a. C.); su estela es de las pruebas legales escritas más antiguas que se conservan."
    }
  ]
}$historia$::jsonb,
  1,
  true),

('historia-clase-04-india-antigua', 'La India antigua: del valle del Indo a los Gupta',
  'Las ciudades del Indo, el nacimiento del budismo y los imperios Maurya y Gupta.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás ubicar las grandes etapas de la India antigua: las ciudades del Indo, el nacimiento del budismo y los imperios Maurya y Gupta.",
    "Contexto: en la lección de Mesopotamia y Egipto viste que las primeras civilizaciones nacieron junto a ríos; la India tuvo la suya en el valle del río Indo. Y recuerda que los años a. C. se cuentan hacia atrás: hacia 2600 a. C. es más antiguo que hacia 321 a. C.",
    "La civilización del Indo tuvo ciudades planificadas como Harappa y Mohenjo-Daro (hacia 2600 a. C.), con calles ordenadas, casas de ladrillo y sistemas de drenaje. Su escritura todavía no se ha logrado descifrar, así que sabemos de ella solo por lo que dejó bajo tierra.",
    "Hacia 500 a. C., Siddhartha Gautama, llamado Buda («el despierto»), enseñó en el norte de la India un camino para superar el sufrimiento; su enseñanza dio origen al budismo. Los especialistas discuten desde qué década vivió, por eso la fecha es aproximada.",
    "Chandragupta fundó el Imperio maurya (hacia 321 a. C.), el primero que unió gran parte del subcontinente. Su nieto Aśoka, tras la guerra de Kalinga (hacia 261 a. C.), abrazó el budismo y dejó edictos grabados en piedra y en pilares.",
    "El Imperio gupta (hacia 320 d. C.) suele recordarse como una época de gran desarrollo de las artes, las matemáticas y las ciencias en el norte de la India.",
    "Personajes clave: Buda, maestro espiritual; Chandragupta, fundador del Imperio maurya; y Aśoka, emperador que difundió el budismo. Las fechas de vida de los tres son aproximadas o discutidas.",
    "Causas y consecuencias: el Imperio maurya, formado por Chandragupta, dejó un reino grande que Aśoka gobernó; la guerra de Kalinga marcó su giro hacia el budismo y hacia una política de tolerancia declarada en sus edictos. Simplificación de nivel escolar: la relación entre esa guerra y su conversión se conoce sobre todo por sus propios edictos.",
    "Conecta con: la lección de Alejandro Magno, que llegó al valle del Indo en el mismo siglo en que se formó el Imperio maurya; y con la lección de China, donde el budismo llegará más tarde por la Ruta de la Seda.",
    "Errores comunes: (1) creer que Buda fue un dios: fue un maestro que vivió como persona; (2) pensar que el budismo nació en China: nació en la India y se extendió luego a otras regiones; (3) confundir el Imperio maurya (a partir del siglo IV a. C.) con el gupta (a partir del siglo IV d. C.)."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 5,
      "titulo": "De las ciudades del Indo al Imperio gupta",
      "hechos": [
        "ciudades-del-indo",
        "ensenanzas-de-buda",
        "imperio-maurya",
        "guerra-de-kalinga",
        "imperio-gupta"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 6,
      "titulo": "Buda, Chandragupta y Aśoka",
      "personajes": [
        "buda",
        "chandragupta",
        "asoka"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "El Imperio maurya y su giro hacia el budismo",
      "cadena": [
        "imperio-maurya",
        "guerra-de-kalinga"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Enseñanzas de Buda y nacimiento del budismo» o «Chandragupta funda el Imperio maurya»?",
      "opciones": [
        "Enseñanzas de Buda y nacimiento del budismo",
        "Chandragupta funda el Imperio maurya",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Enseñanzas de Buda y nacimiento del budismo",
      "explicacion": "Enseñanzas de Buda y nacimiento del budismo es de hacia 500 a. C. y Chandragupta funda el Imperio maurya, de hacia 321 a. C."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Chandragupta funda el Imperio maurya»?",
      "opciones": [
        "Auge de las ciudades del valle del Indo (Harappa y Mohenjo-Daro)",
        "Código de Hammurabi en Babilonia",
        "Guerra de Kalinga y conversión de Aśoka al budismo",
        "Construcción de la Gran Pirámide de Guiza"
      ],
      "respuesta": "Guerra de Kalinga y conversión de Aśoka al budismo",
      "explicacion": "Guerra de Kalinga y conversión de Aśoka al budismo (hacia 261 a. C.) vino después y se apoya en «Chandragupta funda el Imperio maurya»; los otros hechos son anteriores a hacia 321 a. C., así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Quién fue este personaje? Emperador maurya. Tras la guerra de Kalinga adoptó el budismo y difundió sus enseñanzas.",
      "opciones": [
        "Chandragupta Maurya",
        "Aśoka",
        "Buda (Siddhartha Gautama)",
        "Qin Shi Huang"
      ],
      "respuesta": "Aśoka",
      "explicacion": "Aśoka (304 a. C. – 232 a. C. (fechas aproximadas)): tras la guerra de Kalinga adoptó el budismo y difundió sus enseñanzas."
    },
    {
      "pregunta": "Según la periodización escolar, ¿en qué época ocurrió «Comienzo del Imperio gupta en la India»?",
      "opciones": [
        "Antigüedad",
        "Prehistoria",
        "Edad Media",
        "Edad Moderna"
      ],
      "respuesta": "Antigüedad",
      "explicacion": "hacia 320 d. C. cae en la Antigüedad (desde 3500 a. C., por convención escolar)."
    },
    {
      "pregunta": "¿Dónde nació el budismo?",
      "opciones": [
        "En China",
        "En Egipto",
        "En la India",
        "En Grecia"
      ],
      "respuesta": "En la India",
      "explicacion": "El budismo nació en el norte de la India a partir de las enseñanzas de Buda y luego se extendió a otras regiones de Asia."
    }
  ]
}$historia$::jsonb,
  2,
  true),

('historia-clase-05-china-antigua', 'La China antigua: de los Shang a los Han',
  'Los primeros textos, Confucio, el primer emperador y la dinastía Han, con la invención del papel.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás ubicar las grandes etapas de la China antigua: la dinastía Shang, Confucio, la unificación del país, la dinastía Han y el papel.",
    "Contexto: como Mesopotamia, Egipto y la India, China tuvo una gran civilización junto a un río, el río Amarillo. Y recuerda la regla de los siglos a. C.: 221 a. C. pertenece al siglo III a. C., que se cuenta hacia atrás.",
    "Según la cronología tradicional, la dinastía Shang comenzó hacia 1600 a. C. De ella se conservan las inscripciones más antiguas de China: preguntas a los dioses escritas sobre huesos de animales y caparazones de tortuga, los «huesos oraculares».",
    "Confucio enseñó hacia 500 a. C. Sus ideas sobre la conducta, el respeto a la familia y el buen gobierno formaron el confucianismo, que influyó en China durante muchos siglos.",
    "Qin Shi Huang unificó los reinos chinos bajo un solo emperador en 221 a. C. Unificó la escritura, las monedas y las medidas, se le asocia con la unión de muros defensivos anteriores (origen de la Gran Muralla) y se hizo enterrar con un ejército de figuras de terracota.",
    "La dinastía Han (202 a. C.) gobernó durante más de cuatro siglos. Durante ella se consolidó la Ruta de la Seda, una red de caminos que unía China con el Mediterráneo, y el confucianismo se volvió la base de la formación de los funcionarios. Hacia 105 d. C., Cai Lun presentó a la corte el papel hecho con fibras vegetales; hoy se sabe que ya se usaba antes, pero él mejoró y difundió su fabricación.",
    "Personajes clave: Confucio (filósofo), Qin Shi Huang (primer emperador) y Cai Lun (funcionario de la corte). Sus fechas de vida son aproximadas o poco precisas en el caso de Cai Lun.",
    "Causas y consecuencias: la unificación de Qin creó un Estado centralizado que los Han heredaron y consolidaron durante siglos. Simplificación de nivel escolar: entre ambas dinastías hubo guerras y cambios que aquí no se detallan.",
    "Conecta con: la India, donde nació el budismo que llegaría a China por la Ruta de la Seda; con Roma, el otro gran imperio de la época (a la vez que los Han); y con la Edad Media, cuando la dinastía Tang, y luego los mongoles, gobernarán China.",
    "Errores comunes: (1) tratar a China como una sola dinastía: hubo muchas; (2) creer que una sola persona construyó la Gran Muralla de una vez: se construyó y reconstruyó durante siglos; (3) creer que el papel lo inventó Cai Lun de la nada: mejoró y difundió una técnica que ya existía."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 5,
      "titulo": "De los Shang a la invención del papel",
      "hechos": [
        "dinastia-shang",
        "ensenanzas-de-confucio",
        "unificacion-de-china",
        "dinastia-han",
        "papel-de-cai-lun"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 6,
      "titulo": "Confucio, Qin Shi Huang y Cai Lun",
      "personajes": [
        "confucio",
        "qin-shi-huang",
        "cai-lun"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Comienzo de la dinastía Shang en China, según la cronología tradicional» o «Enseñanzas de Confucio en China»?",
      "opciones": [
        "Comienzo de la dinastía Shang en China, según la cronología tradicional",
        "Enseñanzas de Confucio en China",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Comienzo de la dinastía Shang en China, según la cronología tradicional",
      "explicacion": "Comienzo de la dinastía Shang en China, según la cronología tradicional es de hacia 1600 a. C. y Enseñanzas de Confucio en China, de hacia 500 a. C."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Qin Shi Huang unifica China» o «Fundación de la dinastía Han en China»?",
      "opciones": [
        "Fundación de la dinastía Han en China",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero",
        "Qin Shi Huang unifica China"
      ],
      "respuesta": "Qin Shi Huang unifica China",
      "explicacion": "Qin Shi Huang unifica China es de 221 a. C. y Fundación de la dinastía Han en China, de 202 a. C."
    },
    {
      "pregunta": "¿Quién fue este personaje? Primer emperador de China. Unificó China y se hizo enterrar con un ejército de terracota.",
      "opciones": [
        "Confucio",
        "Julio César",
        "Qin Shi Huang",
        "Alejandro Magno"
      ],
      "respuesta": "Qin Shi Huang",
      "explicacion": "Qin Shi Huang (259 a. C. – 210 a. C.): unificó China y se hizo enterrar con un ejército de terracota."
    },
    {
      "pregunta": "¿En qué siglo ocurrió «Qin Shi Huang unifica China»?",
      "opciones": [
        "Siglo III a. C.",
        "Siglo IV a. C.",
        "Siglo II a. C.",
        "Siglo III"
      ],
      "respuesta": "Siglo III a. C.",
      "explicacion": "221 a. C. pertenece al siglo III a. C.: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    },
    {
      "pregunta": "¿Qué era la Ruta de la Seda?",
      "opciones": [
        "Un canal que cruzaba China",
        "Una red de caminos que unía China con el Mediterráneo",
        "Una muralla en la frontera del norte",
        "Un imperio de la India"
      ],
      "respuesta": "Una red de caminos que unía China con el Mediterráneo",
      "explicacion": "La Ruta de la Seda permitió que circularan mercancías, religiones e ideas entre China y el Mediterráneo; se consolidó durante la dinastía Han."
    }
  ]
}$historia$::jsonb,
  3,
  true),

('historia-clase-06-grecia-y-persia', 'Grecia y Persia: polis, guerras médicas y filosofía',
  'Las ciudades-Estado griegas, el Imperio persa, las guerras entre ambos y el nacimiento de la filosofía.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar cómo era la Grecia clásica, qué enfrentó a griegos y persas y por qué se recuerda a Atenas por su democracia y su filosofía.",
    "Contexto: como en todas las fechas a. C. de esta lección, cuanto mayor es el número, más antiguo es el hecho: 776 a. C. es anterior a 490 a. C. Si vienes de las lecciones anteriores, recuerda que las civilizaciones de Mesopotamia y Egipto son mucho más antiguas que las de Grecia.",
    "Persia era un imperio enorme. Ciro II el Grande lo fundó y conquistó Babilonia en 539 a. C., en uno de los mayores imperios de su tiempo.",
    "Grecia, en cambio, no era un país unido sino muchas ciudades-Estado independientes (polis), como Atenas y Esparta. Compartían lengua, religión y competencias como los Juegos Olímpicos (776 a. C., según la tradición), y sus poemas más antiguos son la Ilíada y la Odisea, atribuidos a Homero (hacia 750 a. C.); se discute quién fue y si existió una sola persona.",
    "Los persas intentaron someter a las polis. Los atenienses vencieron en «Batalla de Maratón» (490 a. C.). En «Batalla de las Termópilas» (480 a. C.), un pequeño ejército griego, con el rey espartano Leónidas, resistió varios días al enorme ejército de Jerjes I antes de ser derrotado. Al final, los griegos ganaron la guerra.",
    "Con Pericles, Atenas vivió su época de mayor esplendor: la democracia ateniense, en la que votaban los ciudadanos varones adultos (no las mujeres, ni los esclavizados, ni los extranjeros), y la construcción del Partenón (447 a. C.) en la Acrópolis.",
    "En Atenas nació la filosofía como pregunta sobre la vida y el mundo. Sócrates enseñaba dialogando y no dejó nada escrito; fue juzgado y condenado a muerte (399 a. C.). Su discípulo Platón fundó la Academia.",
    "Personajes clave: Ciro II y Jerjes I (Persia), Leónidas (Esparta), Pericles, Sócrates y Platón (Atenas) y Homero, el poeta. Las fechas de vida de varios son aproximadas.",
    "Causas y consecuencias: los intentos persas de dominar Grecia llevaron a las guerras médicas; la victoria griega dio a Atenas prestigio y poder, y ese poder permitió la época de Pericles, con su democracia y su arte. Simplificación de nivel escolar: no todas las polis apoyaron a Atenas ni todas se beneficiaron por igual.",
    "Conecta con: la India y China, donde en esos mismos siglos enseñaron Buda y Confucio; la figura de sincronía de abajo lo muestra. También con la siguiente lección, donde Alejandro Magno conquistará el imperio persa.",
    "Errores comunes: (1) confundir Atenas con Esparta: la primera destacó por su democracia y su cultura; la segunda, por su organización militar; (2) creer que la Grecia antigua era un país: eran muchas polis; (3) pensar que Sócrates escribió libros: lo conocemos sobre todo por Platón."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 4,
      "titulo": "Grecia y Persia, de 776 a. C. a 399 a. C.",
      "hechos": [
        "primeros-juegos-olimpicos",
        "iliada-y-odisea",
        "ciro-conquista-babilonia",
        "batalla-de-maraton",
        "batalla-de-las-termopilas",
        "construccion-del-partenon",
        "muerte-de-socrates"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 7,
      "titulo": "Los protagonistas",
      "personajes": [
        "ciro-ii",
        "jerjes-i",
        "leonidas",
        "pericles",
        "homero",
        "socrates",
        "platon"
      ]
    },
    {
      "tipo": "historia.sincronia",
      "despuesDePaso": 9,
      "titulo": "Hacia 500 a. C., cuatro regiones a la vez",
      "carriles": [
        {
          "region": "europa",
          "hechos": [
            "batalla-de-maraton",
            "batalla-de-las-termopilas"
          ]
        },
        {
          "region": "oriente-proximo",
          "hechos": [
            "ciro-conquista-babilonia"
          ]
        },
        {
          "region": "asia-sur",
          "hechos": [
            "ensenanzas-de-buda"
          ]
        },
        {
          "region": "asia-oriental",
          "hechos": [
            "ensenanzas-de-confucio"
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Batalla de Maratón» o «Batalla de las Termópilas»?",
      "opciones": [
        "Batalla de las Termópilas",
        "Batalla de Maratón",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Batalla de Maratón",
      "explicacion": "Batalla de Maratón es de 490 a. C. y Batalla de las Termópilas, de 480 a. C."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Primeros Juegos Olímpicos de la Antigüedad» o «Comienzo de la construcción del Partenón»?",
      "opciones": [
        "Comienzo de la construcción del Partenón",
        "Primeros Juegos Olímpicos de la Antigüedad",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Primeros Juegos Olímpicos de la Antigüedad",
      "explicacion": "Primeros Juegos Olímpicos de la Antigüedad es de 776 a. C. y Comienzo de la construcción del Partenón, de 447 a. C."
    },
    {
      "pregunta": "¿Quién fue este personaje? Rey de Esparta. Murió defendiendo el paso de las Termópilas contra el ejército persa.",
      "opciones": [
        "Pericles",
        "Ciro II el Grande",
        "Platón",
        "Leónidas"
      ],
      "respuesta": "Leónidas",
      "explicacion": "Leónidas (murió en 480 a. C. (fechas aproximadas)): murió defendiendo el paso de las Termópilas contra el ejército persa."
    },
    {
      "pregunta": "¿Quién fue este personaje? Filósofo griego. Enseñaba dialogando con preguntas, no dejó nada escrito y fue condenado a muerte en Atenas.",
      "opciones": [
        "Platón",
        "Homero",
        "Jerjes I",
        "Sócrates"
      ],
      "respuesta": "Sócrates",
      "explicacion": "Sócrates (470 a. C. – 399 a. C. (fechas aproximadas)): enseñaba dialogando con preguntas, no dejó nada escrito y fue condenado a muerte en Atenas."
    },
    {
      "pregunta": "¿En qué siglo ocurrió «Juicio y muerte de Sócrates»?",
      "opciones": [
        "Siglo V a. C.",
        "Siglo III a. C.",
        "Siglo IV a. C.",
        "Siglo IV"
      ],
      "respuesta": "Siglo IV a. C.",
      "explicacion": "399 a. C. pertenece al siglo IV a. C.: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    },
    {
      "pregunta": "¿Qué eran las polis?",
      "opciones": [
        "Provincias de un solo reino griego",
        "Los barcos de guerra persas",
        "Ciudades-Estado independientes, como Atenas y Esparta",
        "Los templos de los Juegos Olímpicos"
      ],
      "respuesta": "Ciudades-Estado independientes, como Atenas y Esparta",
      "explicacion": "Grecia estaba formada por muchas ciudades-Estado independientes que compartían lengua y religión pero no un gobierno único."
    }
  ]
}$historia$::jsonb,
  4,
  true),

('historia-clase-07-alejandro-y-el-helenismo', 'Alejandro Magno y el mundo helenístico',
  'La conquista del Imperio persa, la mezcla de culturas del helenismo y la ciencia de Alejandría.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás contar quién fue Alejandro Magno, qué conquistó, qué es el helenismo y por qué se recuerda a Euclides.",
    "Contexto: en la lección anterior viste que Grecia eran muchas polis y que el Imperio persa era enorme. Al norte de Grecia estaba Macedonia, un reino que terminó dominando a las polis y atacando a Persia.",
    "Alejandro fue rey de Macedonia siendo muy joven y alumno de Aristóteles. En 334 a. C. inició la conquista del Imperio persa y avanzó hasta el valle del Indo, donde sus soldados, agotados, se negaron a seguir.",
    "Alejandro murió en Babilonia en 323 a. C. Su imperio no sobrevivió unido: sus generales se lo repartieron y formaron reinos separados.",
    "Esa mezcla de la cultura griega con las de Egipto y Oriente se llama helenismo. Uno de sus centros fue Alejandría, en Egipto, ciudad con biblioteca y museo donde trabajaron científicos y estudiosos.",
    "Según la tradición, allí trabajó Euclides, que escribió los Elementos (hacia 300 a. C.), un tratado de geometría que se siguió estudiando durante más de dos mil años.",
    "Personajes clave: Alejandro Magno (rey conquistador), Aristóteles (filósofo, su maestro) y Euclides (matemático). Para no confundirlos, fíjate en su rol: rey, filósofo y matemático.",
    "Causas y consecuencias: las conquistas de Alejandro difundieron el griego y las ideas griegas por Oriente, y también llevaron ideas orientales a Grecia. Es una sincronía notable: casi al mismo tiempo se formaba el Imperio maurya en la India.",
    "Conecta con: la lección de la India (Imperio maurya) y con la de Roma, que después heredará gran parte del mundo helenístico.",
    "Errores comunes: (1) creer que Alejandro fue griego de Atenas: era macedonio; (2) pensar que su imperio duró siglos: se dividió a su muerte; (3) confundir helenístico con helénico: el helenismo es la mezcla posterior a Alejandro."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 3,
      "titulo": "De la conquista de Persia a los Elementos",
      "hechos": [
        "inicio-conquista-persa",
        "muerte-de-alejandro",
        "elementos-de-euclides"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 6,
      "titulo": "Un rey, un filósofo y un matemático",
      "personajes": [
        "alejandro-magno",
        "aristoteles",
        "euclides"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Alejandro Magno inicia la conquista del Imperio persa» o «Muerte de Alejandro Magno en Babilonia»?",
      "opciones": [
        "Muerte de Alejandro Magno en Babilonia",
        "Ocurrieron en el mismo año",
        "Alejandro Magno inicia la conquista del Imperio persa",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Alejandro Magno inicia la conquista del Imperio persa",
      "explicacion": "Alejandro Magno inicia la conquista del Imperio persa es de 334 a. C. y Muerte de Alejandro Magno en Babilonia, de 323 a. C."
    },
    {
      "pregunta": "¿Quién fue este personaje? Filósofo griego. Fundó el Liceo y fue maestro de Alejandro Magno.",
      "opciones": [
        "Aristóteles",
        "Platón",
        "Sócrates",
        "Pericles"
      ],
      "respuesta": "Aristóteles",
      "explicacion": "Aristóteles (384 a. C. – 322 a. C.): fundó el Liceo y fue maestro de Alejandro Magno."
    },
    {
      "pregunta": "¿Quién fue este personaje? Matemático griego. Escribió los Elementos, el gran tratado de geometría de la Antigüedad.",
      "opciones": [
        "Aristóteles",
        "Homero",
        "Euclides",
        "Alejandro Magno"
      ],
      "respuesta": "Euclides",
      "explicacion": "Euclides (activo hacia 300 a. C. (fechas aproximadas)): escribió los Elementos, el gran tratado de geometría de la Antigüedad."
    },
    {
      "pregunta": "¿En qué siglo ocurrió «Muerte de Alejandro Magno en Babilonia»?",
      "opciones": [
        "Siglo V a. C.",
        "Siglo III a. C.",
        "Siglo IV a. C.",
        "Siglo IV"
      ],
      "respuesta": "Siglo IV a. C.",
      "explicacion": "323 a. C. pertenece al siglo IV a. C.: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    },
    {
      "pregunta": "¿Qué es el helenismo?",
      "opciones": [
        "La mezcla de la cultura griega con las de Egipto y Oriente tras las conquistas de Alejandro",
        "La cultura griega anterior a las polis",
        "Un imperio fundado por Roma",
        "Una religión de la India"
      ],
      "respuesta": "La mezcla de la cultura griega con las de Egipto y Oriente tras las conquistas de Alejandro",
      "explicacion": "Helenismo es la difusión de la cultura griega por Oriente y su mezcla con otras culturas después de las conquistas de Alejandro."
    }
  ]
}$historia$::jsonb,
  5,
  true),

('historia-clase-08-roma-republica', 'Roma: de la ciudad a la República',
  'La fundación de Roma, la República, las guerras contra Cartago y la figura de Julio César.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar cómo creció Roma desde una ciudad hasta dominar el Mediterráneo, qué fue la República y quién fue Julio César.",
    "Contexto: en esta lección las fechas también son a. C., así que recuerda que 753 a. C. es anterior a 509 a. C. Y para no confundir personajes, fíjate en su rol y en el hecho con el que se los asocia.",
    "Según la tradición, Roma fue fundada en 753 a. C.; según la leyenda, por Rómulo, que con su hermano Remo habría sido criado por una loba. Es una fecha convencional, no probada.",
    "Roma fue primero una monarquía. Hacia 509 a. C. los romanos crearon la República, gobernada por magistrados elegidos (los cónsules) y por el Senado. Simplificación de nivel escolar: solo una parte de la población tenía derechos políticos plenos.",
    "La rival de Roma en el Mediterráneo era Cartago, en el norte de África. En la segunda guerra púnica, el general cartaginés Aníbal cruzó los Alpes con elefantes (218 a. C.) para atacar Roma desde el norte. Al final, Roma ganó y destruyó Cartago (146 a. C.).",
    "Las conquistas trajeron riqueza pero también conflictos internos: rebeliones de esclavos, como la de Espartaco, y luchas entre generales. Uno de ellos fue Julio César, que conquistó la Galia y cruzó el Rubicón con su ejército (49 a. C.), lo que desató una guerra civil.",
    "Julio César fue nombrado dictador y murió asesinado por un grupo de senadores en 44 a. C. No fue emperador: el Imperio empezó después.",
    "Personajes clave: Julio César (general y político), Aníbal (general cartaginés) y Espartaco (líder de una rebelión de esclavos). Asócialos con su hecho: el Rubicón, los Alpes y la rebelión.",
    "Causas y consecuencias: las guerras contra Cartago hicieron de Roma una potencia; las guerras civiles del final de la República se relacionan con el fin de ese sistema, tema de la lección siguiente.",
    "Conecta con: la lección siguiente, sobre el Imperio romano, que empieza con las guerras civiles de esta etapa; la de Grecia (Roma heredó y adaptó buena parte de su cultura) y la de África antigua, donde está Cartago.",
    "Errores comunes: (1) creer que Julio César fue emperador: fue general y dictador; (2) confundir la República romana con una democracia moderna; (3) creer que Aníbal era romano: era de Cartago; (4) leer 753 a. C. como un año probado: es la fecha de la tradición."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 4,
      "titulo": "De la fundación de Roma al asesinato de César",
      "hechos": [
        "fundacion-de-roma",
        "republica-romana",
        "anibal-cruza-los-alpes",
        "destruccion-de-cartago",
        "cesar-cruza-el-rubicon",
        "asesinato-de-julio-cesar"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 7,
      "titulo": "Julio César, Aníbal y Espartaco",
      "personajes": [
        "julio-cesar",
        "anibal",
        "espartaco"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Fundación de Roma, según la tradición» o «Comienzo de la República romana»?",
      "opciones": [
        "Comienzo de la República romana",
        "Fundación de Roma, según la tradición",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Fundación de Roma, según la tradición",
      "explicacion": "Fundación de Roma, según la tradición es de 753 a. C. y Comienzo de la República romana, de 509 a. C."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Aníbal cruza los Alpes» o «Destrucción de Cartago por Roma»?",
      "opciones": [
        "Destrucción de Cartago por Roma",
        "Aníbal cruza los Alpes",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Aníbal cruza los Alpes",
      "explicacion": "Aníbal cruza los Alpes es de 218 a. C. y Destrucción de Cartago por Roma, de 146 a. C."
    },
    {
      "pregunta": "¿Quién fue este personaje? General cartaginés. Cruzó los Alpes con elefantes para atacar Roma.",
      "opciones": [
        "Julio César",
        "Espartaco",
        "Leónidas",
        "Aníbal"
      ],
      "respuesta": "Aníbal",
      "explicacion": "Aníbal (247 a. C. – 183 a. C. (fechas aproximadas)): cruzó los Alpes con elefantes para atacar Roma."
    },
    {
      "pregunta": "¿Quién fue este personaje? Líder de una rebelión de esclavos. Lideró una gran rebelión de esclavos y gladiadores contra Roma.",
      "opciones": [
        "Espartaco",
        "Aníbal",
        "Julio César",
        "Augusto"
      ],
      "respuesta": "Espartaco",
      "explicacion": "Espartaco (murió en 71 a. C. (fechas aproximadas)): lideró una gran rebelión de esclavos y gladiadores contra Roma."
    },
    {
      "pregunta": "¿Fue Julio César el primer emperador romano?",
      "opciones": [
        "No: fue general y dictador; el Imperio comenzó después de su muerte",
        "Sí, fue el primer emperador",
        "Sí, fue el último emperador de la República",
        "No: fue un rey de Egipto"
      ],
      "respuesta": "No: fue general y dictador; el Imperio comenzó después de su muerte",
      "explicacion": "Julio César murió en 44 a. C.; el Imperio empezó con Augusto, en 27 a. C."
    },
    {
      "pregunta": "¿Por qué 753 a. C. se considera una fecha convencional?",
      "opciones": [
        "Porque es el año en que murió Rómulo",
        "Porque es la fecha que fija la tradición, no un año probado",
        "Porque es la fecha exacta de la República",
        "Porque se calculó con satélites"
      ],
      "respuesta": "Porque es la fecha que fija la tradición, no un año probado",
      "explicacion": "La fundación de Roma se explica con una tradición y una leyenda; la fecha 753 a. C. es la que fijó la tradición."
    }
  ]
}$historia$::jsonb,
  6,
  true),

('historia-clase-09-imperio-romano-y-cristianismo', 'El Imperio romano y el cristianismo',
  'De la guerra civil al Imperio de Augusto, la erupción del Vesubio y el camino del cristianismo hasta ser religión oficial.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar cómo terminó la República y empezó el Imperio, qué ocurrió con el cristianismo y por qué el Imperio se dividió.",
    "Contexto: en la lección anterior viste que Julio César fue asesinado (44 a. C.) y que Roma vivía guerras civiles. De ahí parte esta lección: una cadena de causas y consecuencias que va de ese asesinato al Imperio.",
    "El asesinato de César desató una nueva guerra civil. Su heredero adoptivo, Octaviano, venció en «Batalla de Accio» (31 a. C.) a Marco Antonio y Cleopatra. Cleopatra murió en 30 a. C. y Egipto pasó a ser provincia romana.",
    "Poco después, Octaviano recibió el nombre de Augusto y se convirtió en el primer emperador (27 a. C.). Empezó un largo período de relativa paz y prosperidad, la Pax Romana, que duró unos dos siglos.",
    "Un episodio famoso de este período es la erupción del Vesubio (79 d. C.), que destruyó Pompeya y Herculano y las conservó bajo capas de ceniza y piedra pómez.",
    "El cristianismo, nacido en el Imperio, sufrió persecuciones durante un tiempo. El emperador Constantino dictó el Edicto de Milán (313 d. C.), que permitió practicarlo, y trasladó la capital a una nueva ciudad junto al Bósforo, Constantinopla (330 d. C.). Más tarde, en 380 d. C., el cristianismo se declaró religión oficial del Imperio.",
    "En 395 d. C. el Imperio quedó dividido definitivamente en dos partes, Oriente y Occidente. La de Occidente caerá, por convención escolar, en 476 d. C.: esa fecha abre la Edad Media.",
    "Personajes clave: Augusto (primer emperador), Cleopatra (última reina del Egipto ptolemaico) y Constantino (emperador que favoreció el cristianismo).",
    "Causas y consecuencias: la guerra civil llevó de César a Accio y de Accio al Imperio; el Edicto de Milán llevó a que el cristianismo se hiciera religión oficial. Las dos cadenas están en las figuras de abajo.",
    "Conecta con: la Edad Media, que empieza con la caída de Roma de Occidente; el Imperio bizantino, que continúa en Oriente con capital en Constantinopla; y la India y China, contemporáneas del Imperio romano.",
    "Errores comunes: (1) creer que «el Imperio romano cayó» en un solo día: la caída de Occidente en 476 es una fecha convencional de un proceso largo; (2) pensar que Roma terminó del todo: el Imperio de Oriente siguió mil años más; (3) confundir República con Imperio: la República termina con los conflictos que llevan a Augusto."
  ],
  "visuales": [
    {
      "tipo": "historia.causas",
      "despuesDePaso": 8,
      "titulo": "De los idus de marzo al Imperio",
      "cadena": [
        "asesinato-de-julio-cesar",
        "batalla-de-accio",
        "comienzo-del-imperio-romano"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 8,
      "titulo": "El cristianismo, religión oficial",
      "cadena": [
        "edicto-de-milan",
        "cristianismo-religion-oficial"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 10,
      "titulo": "Del Imperio de Augusto a la división del Imperio",
      "hechos": [
        "batalla-de-accio",
        "muerte-de-cleopatra",
        "comienzo-del-imperio-romano",
        "erupcion-del-vesubio",
        "edicto-de-milan",
        "fundacion-de-constantinopla",
        "cristianismo-religion-oficial",
        "division-del-imperio-romano"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 9,
      "titulo": "Augusto, Cleopatra y Constantino",
      "personajes": [
        "augusto",
        "cleopatra",
        "constantino"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Batalla de Accio»?",
      "opciones": [
        "Augusto inicia el Imperio romano",
        "Invención de la escritura en Sumeria",
        "Batalla de Maratón",
        "Qin Shi Huang unifica China"
      ],
      "respuesta": "Augusto inicia el Imperio romano",
      "explicacion": "Augusto inicia el Imperio romano (27 a. C.) vino después y se apoya en «Batalla de Accio»; los otros hechos son anteriores a 31 a. C., así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos contribuyó a provocar «El cristianismo se declara religión oficial del Imperio romano»?",
      "opciones": [
        "Caída del Imperio romano de Occidente",
        "Edicto de Milán",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
        "Inauguración de Santa Sofía en Constantinopla"
      ],
      "respuesta": "Edicto de Milán",
      "explicacion": "Edicto de Milán (313 d. C.) fue anterior y contribuyó a provocarlo; los otros hechos ocurrieron después de 380 d. C., así que no pueden ser una causa."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Erupción del Vesubio y destrucción de Pompeya» o «Edicto de Milán»?",
      "opciones": [
        "Erupción del Vesubio y destrucción de Pompeya",
        "Edicto de Milán",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Erupción del Vesubio y destrucción de Pompeya",
      "explicacion": "Erupción del Vesubio y destrucción de Pompeya es de 79 d. C. y Edicto de Milán, de 313 d. C."
    },
    {
      "pregunta": "¿Quién fue este personaje? Emperador romano. Dictó el Edicto de Milán y trasladó la capital a una nueva ciudad junto al Bósforo.",
      "opciones": [
        "Augusto",
        "Julio César",
        "Constantino I",
        "Cleopatra VII"
      ],
      "respuesta": "Constantino I",
      "explicacion": "Constantino I (272 d. C. – 337 d. C. (fechas aproximadas)): dictó el Edicto de Milán y trasladó la capital a una nueva ciudad junto al Bósforo."
    },
    {
      "pregunta": "¿En qué siglo ocurrió «Erupción del Vesubio y destrucción de Pompeya»?",
      "opciones": [
        "Siglo II",
        "Siglo I a. C.",
        "Siglo I",
        "Siglo III"
      ],
      "respuesta": "Siglo I",
      "explicacion": "79 d. C. pertenece al siglo I: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    },
    {
      "pregunta": "¿Cuándo termina la Antigüedad según la convención escolar?",
      "opciones": [
        "Con el Edicto de Milán, 313 d. C.",
        "Con la caída del Imperio romano de Occidente, 476 d. C.",
        "Con el asesinato de Julio César, 44 a. C.",
        "Con la llegada de Colón, 1492"
      ],
      "respuesta": "Con la caída del Imperio romano de Occidente, 476 d. C.",
      "explicacion": "Por convención escolar, la caída del Imperio romano de Occidente abre la Edad Media; otros libros usan otras fechas."
    }
  ]
}$historia$::jsonb,
  7,
  true),

('historia-clase-10-africa-y-america-antiguas', 'África y América antiguas: Cartago, Aksum, los olmecas y los mayas',
  'Civilizaciones que se desarrollaron lejos del Mediterráneo oriental: el comercio de Cartago y Aksum y las culturas de Mesoamérica.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás ubicar cuatro civilizaciones antiguas fuera de Europa y Asia: Cartago y Aksum, en África, y los olmecas y los mayas, en América.",
    "Contexto: la historia antigua no ocurrió solo en el Mediterráneo oriental. Como en toda la Antigüedad, los años a. C. se cuentan hacia atrás: hacia 1200 a. C. es anterior a 814 a. C.",
    "Cartago, en la costa de la actual Túnez, fue fundada según la tradición por colonos fenicios de Tiro hacia 814 a. C. Llegó a ser una gran potencia comercial marítima y rival de Roma; es la ciudad de Aníbal.",
    "Aksum fue un reino en el norte de la actual Etiopía y Eritrea, con comercio por el mar Rojo y el océano Índico. Su rey Ezana adoptó el cristianismo hacia 330 d. C.; Aksum fue uno de los primeros Estados cristianos.",
    "Los olmecas desarrollaron en la costa del golfo de México (hacia 1200 a. C.) la primera gran cultura de Mesoamérica; son famosas sus enormes cabezas de piedra.",
    "El período clásico de la civilización maya (hacia 250 d. C.) se conoce por sus ciudades con templos en forma de pirámide, una escritura jeroglífica, un calendario muy preciso y avanzados conocimientos de astronomía.",
    "Personajes clave: en esta lección los protagonistas son colectivos (los cartagineses, los aksumitas, los olmecas y los mayas). Sus gobernantes se conocen menos por fuentes escritas y no figuran en la tabla del curso.",
    "Causas y consecuencias: la escritura maya se desarrolló de forma independiente de las del Viejo Mundo. Simplificación de nivel escolar: se resume la historia de cuatro civilizaciones distintas a un hecho por cada una.",
    "Conecta con: la lección de la República romana (guerras contra Cartago), con la del Imperio romano (Aksum es contemporáneo de Constantino) y con la Edad Media, cuando surgirán Mali, los aztecas y los incas.",
    "Errores comunes: (1) confundir mayas, aztecas e incas: los mayas son mucho más antiguos que los aztecas y los incas, que son del final de la Edad Media; (2) creer que África no tuvo Estados antiguos: Cartago y Aksum son dos ejemplos; (3) pensar que Cartago era griega o romana: era fenicia de origen."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 5,
      "titulo": "Cuatro civilizaciones fuera del Mediterráneo oriental",
      "hechos": [
        "fundacion-de-cartago",
        "olmecas",
        "periodo-clasico-maya",
        "ezana-de-aksum"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Auge de la cultura olmeca en el golfo de México» o «Fundación de Cartago, según la tradición»?",
      "opciones": [
        "Fundación de Cartago, según la tradición",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero",
        "Auge de la cultura olmeca en el golfo de México"
      ],
      "respuesta": "Auge de la cultura olmeca en el golfo de México",
      "explicacion": "Auge de la cultura olmeca en el golfo de México es de hacia 1200 a. C. y Fundación de Cartago, según la tradición, de 814 a. C."
    },
    {
      "pregunta": "Según la periodización escolar, ¿en qué época ocurrió «Comienzo del período clásico maya»?",
      "opciones": [
        "Prehistoria",
        "Antigüedad",
        "Edad Media",
        "Edad Moderna"
      ],
      "respuesta": "Antigüedad",
      "explicacion": "hacia 250 d. C. cae en la Antigüedad (desde 3500 a. C., por convención escolar)."
    },
    {
      "pregunta": "¿En qué siglo ocurrió «Ezana, rey de Aksum, adopta el cristianismo»?",
      "opciones": [
        "Siglo V",
        "Siglo IV",
        "Siglo III",
        "Siglo IV a. C."
      ],
      "respuesta": "Siglo IV",
      "explicacion": "hacia 330 d. C. pertenece al siglo IV: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    },
    {
      "pregunta": "¿En qué región se desarrolló la cultura olmeca?",
      "opciones": [
        "En el norte de África",
        "En el valle del Indo",
        "En el mar Egeo",
        "En la costa del golfo de México (Mesoamérica)"
      ],
      "respuesta": "En la costa del golfo de México (Mesoamérica)",
      "explicacion": "Los olmecas fueron la primera gran cultura de Mesoamérica y se desarrollaron cerca del golfo de México."
    },
    {
      "pregunta": "¿Qué civilización adoptó el cristianismo hacia 330 d. C. con su rey Ezana?",
      "opciones": [
        "Aksum",
        "Cartago",
        "Los olmecas",
        "Los mayas"
      ],
      "respuesta": "Aksum",
      "explicacion": "Ezana, rey de Aksum, adoptó el cristianismo hacia 330 d. C.; Cartago fue destruida siglos antes y las culturas de Mesoamérica estaban en otro continente."
    }
  ]
}$historia$::jsonb,
  8,
  true),

('historia-clase-11-bizancio-y-los-otomanos', 'Bizancio: del fin de Roma de Occidente a la caída de Constantinopla',
  'El Imperio romano de Oriente, su gran época con Justiniano, la separación de las Iglesias y la conquista otomana de Constantinopla.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar qué ocurrió con el Imperio romano tras 476, qué fue el Imperio bizantino y cómo terminó.",
    "Contexto: la Edad Media empieza, por convención escolar, con la caída del Imperio romano de Occidente (476 d. C.). Repaso de la Antigüedad: el Imperio se había dividido en dos partes, Oriente y Occidente, y Constantinopla era la capital del Oriente; el cristianismo era la religión oficial, y una causa siempre precede a su consecuencia.",
    "Cuando cayó Roma de Occidente, el Imperio de Oriente siguió con capital en Constantinopla. Los historiadores lo llaman Imperio bizantino (un nombre posterior: sus habitantes se seguían llamando romanos). Su emperador Justiniano ordenó compilar el derecho romano y construir la basílica de Santa Sofía, inaugurada en 537 d. C.",
    "Con el tiempo, las Iglesias de Roma y de Constantinopla se distanciaron y se separaron en 1054: el llamado Cisma de Oriente y Occidente, origen de la Iglesia católica y de la ortodoxa.",
    "Al este apareció una nueva potencia. Según la tradición, Osmán I fundó el Imperio otomano hacia 1299, y en 1453 el sultán Mehmed II conquistó Constantinopla, poniendo fin al Imperio bizantino. La ciudad pasó a ser la capital otomana.",
    "Personajes clave: Justiniano I (emperador bizantino) y Mehmed II (sultán otomano, conquistador de Constantinopla).",
    "Causas y consecuencias: los otomanos, al crecer, fueron rodeando al Imperio bizantino, y la conquista de Constantinopla es la consecuencia de ese proceso. La figura muestra esa relación.",
    "Conecta con: la Técnica «Cómo se cierra la Edad Media: 1453 o 1492» (algunos textos usan 1453 como fin de la época); con la lección del mundo islámico y con la Edad Moderna, donde el Imperio otomano será una gran potencia.",
    "Errores comunes: (1) creer que en 476 terminó todo el Imperio romano: solo terminó el de Occidente, el de Oriente siguió hasta 1453 (977 años después); (2) pensar que «bizantino» es un pueblo distinto: es el nombre moderno del Imperio romano de Oriente; (3) creer que Constantinopla y Estambul son ciudades distintas: es la misma con nombres distintos."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 4,
      "titulo": "De 476 a 1453",
      "hechos": [
        "caida-de-roma-occidente",
        "santa-sofia",
        "cisma-de-oriente-y-occidente",
        "imperio-otomano",
        "caida-de-constantinopla"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 6,
      "titulo": "El ascenso otomano y la caída de Constantinopla",
      "cadena": [
        "imperio-otomano",
        "caida-de-constantinopla"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 5,
      "titulo": "Un emperador y un sultán",
      "personajes": [
        "justiniano",
        "mehmed-ii"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Inauguración de Santa Sofía en Constantinopla» o «Cisma entre las Iglesias de Oriente y Occidente»?",
      "opciones": [
        "Inauguración de Santa Sofía en Constantinopla",
        "Cisma entre las Iglesias de Oriente y Occidente",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Inauguración de Santa Sofía en Constantinopla",
      "explicacion": "Inauguración de Santa Sofía en Constantinopla es de 537 d. C. y Cisma entre las Iglesias de Oriente y Occidente, de 1054."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Osmán I funda el Imperio otomano»?",
      "opciones": [
        "Caída del Imperio romano de Occidente",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
        "Comienzo de la dinastía Tang en China",
        "Caída de Constantinopla en manos otomanas"
      ],
      "respuesta": "Caída de Constantinopla en manos otomanas",
      "explicacion": "Caída de Constantinopla en manos otomanas (1453) vino después y se apoya en «Osmán I funda el Imperio otomano»; los otros hechos son anteriores a 1299, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Quién fue este personaje? Emperador bizantino. Ordenó compilar el derecho romano y construir Santa Sofía.",
      "opciones": [
        "Mehmed II",
        "Justiniano I",
        "Carlomagno",
        "Mahoma"
      ],
      "respuesta": "Justiniano I",
      "explicacion": "Justiniano I (482 d. C. – 565 d. C.): ordenó compilar el derecho romano y construir Santa Sofía."
    },
    {
      "pregunta": "¿Quién fue este personaje? Sultán otomano. Conquistó Constantinopla en 1453.",
      "opciones": [
        "Mehmed II",
        "Justiniano I",
        "Saladino",
        "Gengis Kan"
      ],
      "respuesta": "Mehmed II",
      "explicacion": "Mehmed II (1432 – 1481): conquistó Constantinopla en 1453."
    },
    {
      "pregunta": "¿Qué pasó con el Imperio romano de Oriente en 476?",
      "opciones": [
        "Desapareció junto con el de Occidente",
        "Se unió a los francos",
        "Fue conquistado por los otomanos ese mismo año",
        "Siguió existiendo con capital en Constantinopla"
      ],
      "respuesta": "Siguió existiendo con capital en Constantinopla",
      "explicacion": "Solo cayó el Imperio de Occidente. El de Oriente, llamado bizantino, duró hasta 1453."
    }
  ]
}$historia$::jsonb,
  1,
  true),

('historia-clase-12-mundo-islamico', 'El mundo islámico: de Mahoma a Saladino',
  'El nacimiento del islam, su expansión, Bagdad como centro del saber y la reconquista de Jerusalén por Saladino.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar cómo nació y se expandió el islam, por qué Bagdad fue un gran centro del saber y quién fue Saladino.",
    "Contexto: en esta lección hay varias relaciones de causa y consecuencia: una causa provoca una consecuencia y esta puede ser, a su vez, causa de otra. Como antecedente, recuerda que del mundo antiguo se conservaban textos griegos, persas e indios que los sabios de Bagdad terminarán traduciendo.",
    "Mahoma predicó en La Meca en la península arábiga; su predicación dio origen al islam. En 622 d. C. él y sus seguidores se trasladaron a Medina: es la Hégira, año 1 del calendario islámico.",
    "Tras su muerte, el islam se expandió con rapidez. Los ejércitos musulmanes llegaron a la península ibérica en 711 d. C. y, según la tradición, los francos detuvieron un avance musulmán en la «Batalla de Poitiers, entre francos y ejércitos musulmanes» (732 d. C.); su importancia real se discute.",
    "Los abasíes fundaron Bagdad como capital (762 d. C.). Allí, hacia 830 d. C., floreció la Casa de la Sabiduría, un centro donde se traducían y estudiaban textos griegos, persas e indios. De su sabio Al-Juarismi derivan las palabras «álgebra» y «algoritmo»; y Avicena escribió el Canon de medicina, que se estudió durante siglos.",
    "Las Cruzadas fueron expediciones militares cristianas hacia Tierra Santa: la primera comenzó en 1096. El sultán Saladino recuperó Jerusalén para los musulmanes en 1187.",
    "Personajes clave: Mahoma, Al-Juarismi, Avicena, Saladino. Para no confundirlos: un profeta, un matemático, un médico y un sultán.",
    "Causas y consecuencias: la llegada a Iberia llevó a un enfrentamiento en Poitiers; la fundación de Bagdad llevó a la Casa de la Sabiduría; y la Primera Cruzada llevó a la reconquista de Jerusalén por Saladino. Las tres cadenas están en la figura.",
    "Conecta con: la lección del Imperio bizantino (las Cruzadas terminaron afectando a Constantinopla), con la de Europa feudal (Carlomagno y los francos) y con la Edad Moderna, donde el conocimiento del mundo islámico ayudó al Renacimiento europeo.",
    "Errores comunes: (1) creer que «islámico» y «árabe» son lo mismo: el mundo islámico incluyó pueblos muy distintos (persas, turcos, bereberes y otros); (2) confundir la Hégira con el nacimiento de Mahoma: es su traslado a Medina; (3) pensar que la batalla de Poitiers detuvo a todo el islam: fue un episodio y su importancia se discute."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 3,
      "titulo": "De la Hégira a Saladino",
      "hechos": [
        "hegira",
        "musulmanes-en-iberia",
        "batalla-de-poitiers",
        "fundacion-de-bagdad",
        "casa-de-la-sabiduria",
        "primera-cruzada",
        "saladino-recupera-jerusalen"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 6,
      "titulo": "Un profeta, un matemático, un médico y un sultán",
      "personajes": [
        "mahoma",
        "al-juarismi",
        "avicena",
        "saladino"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "Del avance en Iberia a Poitiers",
      "cadena": [
        "musulmanes-en-iberia",
        "batalla-de-poitiers"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "De Bagdad a la Casa de la Sabiduría",
      "cadena": [
        "fundacion-de-bagdad",
        "casa-de-la-sabiduria"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "De la Primera Cruzada a Jerusalén",
      "cadena": [
        "primera-cruzada",
        "saladino-recupera-jerusalen"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina» o «Fundación de Bagdad por los abasíes»?",
      "opciones": [
        "Fundación de Bagdad por los abasíes",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina"
      ],
      "respuesta": "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
      "explicacion": "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina es de 622 d. C. y Fundación de Bagdad por los abasíes, de 762 d. C."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Fundación de Bagdad por los abasíes»?",
      "opciones": [
        "Caída del Imperio romano de Occidente",
        "Auge de la Casa de la Sabiduría en Bagdad",
        "Inauguración de Santa Sofía en Constantinopla",
        "Comienzo de la dinastía Tang en China"
      ],
      "respuesta": "Auge de la Casa de la Sabiduría en Bagdad",
      "explicacion": "Auge de la Casa de la Sabiduría en Bagdad (hacia 830 d. C.) vino después y se apoya en «Fundación de Bagdad por los abasíes»; los otros hechos son anteriores a 762 d. C., así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Quién fue este personaje? Matemático del mundo islámico. De su nombre proviene la palabra «algoritmo» y de su libro, la palabra «álgebra».",
      "opciones": [
        "Avicena",
        "Al-Juarismi",
        "Mahoma",
        "Saladino"
      ],
      "respuesta": "Al-Juarismi",
      "explicacion": "Al-Juarismi (780 d. C. – 850 d. C. (fechas aproximadas)): de su nombre proviene la palabra «algoritmo» y de su libro, la palabra «álgebra»."
    },
    {
      "pregunta": "¿Quién fue este personaje? Sultán de Egipto y Siria. Reconquistó Jerusalén en 1187.",
      "opciones": [
        "Avicena",
        "Mahoma",
        "Saladino",
        "Gengis Kan"
      ],
      "respuesta": "Saladino",
      "explicacion": "Saladino (1137 – 1193 (fechas aproximadas)): reconquistó Jerusalén en 1187."
    },
    {
      "pregunta": "¿Qué fue la Hégira?",
      "opciones": [
        "El nacimiento de Mahoma",
        "Una batalla contra los francos",
        "El traslado de Mahoma y sus seguidores de La Meca a Medina",
        "La conquista de Jerusalén"
      ],
      "respuesta": "El traslado de Mahoma y sus seguidores de La Meca a Medina",
      "explicacion": "La Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina (622 d. C.) fue el traslado de La Meca a Medina; es el punto de partida del calendario islámico."
    }
  ]
}$historia$::jsonb,
  2,
  true),

('historia-clase-13-europa-feudal', 'Europa feudal: francos, vikingos, normandos y Cruzadas',
  'Carlomagno, el feudalismo, los viajes vikingos, la conquista normanda de Inglaterra, la Carta Magna y la Primera Cruzada.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar cómo se organizaba la Europa feudal y ubicar en orden a Carlomagno, los vikingos, Guillermo el Conquistador, la Carta Magna y la Primera Cruzada.",
    "Contexto: tras la caída de Roma de Occidente (476 d. C.) Europa occidental quedó dividida en reinos gobernados por pueblos germanos. Entre ellos destacaron los francos. Y recuerda que una causa siempre precede a su consecuencia.",
    "Carlomagno, rey de los francos, fue coronado emperador por el papa el día de Navidad de 800 d. C. Su imperio reunió gran parte de Europa occidental.",
    "La sociedad feudal se organizaba en una cadena de lealtades: el rey, los señores y los caballeros, y bajo ellos los campesinos, muchos de ellos siervos ligados a la tierra que trabajaban. Simplificación de nivel escolar: el feudalismo varió mucho según el lugar y el siglo.",
    "Los vikingos, navegantes escandinavos, recorrieron Europa. Uno de ellos, Leif Erikson, llegó a América del Norte hacia 1000: casi cinco siglos antes de Colón (492 años).",
    "En 1066, Guillermo, duque de Normandía, venció en Hastings y se convirtió en rey de Inglaterra. En 1215 los barones obligaron al rey a firmar la Carta Magna, que estableció que el poder del rey tenía límites.",
    "En 1096 comenzó la Primera Cruzada: expedición militar cristiana hacia Tierra Santa, convocada por el papa.",
    "Personajes clave: Carlomagno, Guillermo el Conquistador, Leif Erikson.",
    "Causas y consecuencias: la conquista normanda cambió la nobleza y la lengua de Inglaterra; la Carta Magna es un antecedente lejano de la idea de gobierno con límites; la Primera Cruzada abrió un siglo de enfrentamientos con el mundo islámico.",
    "Conecta con: la lección del mundo islámico (cruzadas y Saladino), la de Bizancio (el cisma entre Iglesias) y la Edad Moderna, donde los Estados europeos se harán más fuertes.",
    "Errores comunes: (1) creer que Colón fue el primer europeo en América: los vikingos llegaron antes, pero su contacto no tuvo continuidad; (2) confundir a Carlomagno (rey de los francos) con un emperador romano; (3) pensar que la Carta Magna dio derechos a todos: protegió sobre todo a los barones y con el tiempo se usó como ejemplo de límites al poder."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 6,
      "titulo": "De Carlomagno a la Primera Cruzada",
      "hechos": [
        "coronacion-de-carlomagno",
        "leif-en-america",
        "batalla-de-hastings",
        "carta-magna",
        "primera-cruzada"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 7,
      "titulo": "Un emperador, un explorador y un rey",
      "personajes": [
        "carlomagno",
        "guillermo-el-conquistador",
        "leif-erikson"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Carlomagno es coronado emperador» o «Batalla de Hastings»?",
      "opciones": [
        "Batalla de Hastings",
        "Carlomagno es coronado emperador",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Carlomagno es coronado emperador",
      "explicacion": "Carlomagno es coronado emperador es de 800 d. C. y Batalla de Hastings, de 1066."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Leif Erikson llega a América del Norte» o «Carta Magna en Inglaterra»?",
      "opciones": [
        "Leif Erikson llega a América del Norte",
        "Carta Magna en Inglaterra",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Leif Erikson llega a América del Norte",
      "explicacion": "Leif Erikson llega a América del Norte es de hacia 1000 y Carta Magna en Inglaterra, de 1215."
    },
    {
      "pregunta": "¿Quién fue este personaje? Duque de Normandía y rey de Inglaterra. Venció en la batalla de Hastings y se convirtió en rey de Inglaterra.",
      "opciones": [
        "Carlomagno",
        "Guillermo el Conquistador",
        "Leif Erikson",
        "Saladino"
      ],
      "respuesta": "Guillermo el Conquistador",
      "explicacion": "Guillermo el Conquistador (1028 – 1087 (fechas aproximadas)): venció en la batalla de Hastings y se convirtió en rey de Inglaterra."
    },
    {
      "pregunta": "¿Quién fue este personaje? Explorador nórdico. Llegó a América del Norte hacia el año 1000, siglos antes que Colón.",
      "opciones": [
        "Leif Erikson",
        "Marco Polo",
        "Ibn Battuta",
        "Zheng He"
      ],
      "respuesta": "Leif Erikson",
      "explicacion": "Leif Erikson (activo hacia 1000 (fechas aproximadas)): llegó a América del Norte hacia el año 1000, siglos antes que Colón."
    },
    {
      "pregunta": "¿Qué estableció la Carta Magna?",
      "opciones": [
        "Que el rey era dueño de todas las tierras",
        "Que los campesinos eran libres",
        "Que el poder del rey tenía límites",
        "Que Inglaterra pertenecía a Francia"
      ],
      "respuesta": "Que el poder del rey tenía límites",
      "explicacion": "La Carta Magna (1215) fue un acuerdo entre el rey y los barones que puso límites al poder real."
    }
  ]
}$historia$::jsonb,
  3,
  true),

('historia-clase-14-crisis-tardomedieval', 'La crisis de la Baja Edad Media: peste negra y guerra de los Cien Años',
  'La peste negra, la guerra entre Francia e Inglaterra, Juana de Arco y la imprenta de Gutenberg.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar qué fue la peste negra, por qué se recuerda la guerra de los Cien Años y qué cambió con la imprenta de Gutenberg.",
    "Contexto: la Europa feudal era una sociedad de reyes, señores y campesinos ligados a la tierra. En los siglos XIV y XV esa sociedad pasó por una crisis de epidemias, guerras y cambios económicos que marcó el final de la Edad Media. Recuerda también que una causa precede a su consecuencia: aquí una guerra y una epidemia cambian la sociedad.",
    "La guerra de los Cien Años enfrentó a Inglaterra y Francia desde 1337. En realidad fue una serie de guerras con treguas que se prolongó más de un siglo.",
    "La peste negra, una epidemia de peste bubónica, llegó a Europa en 1347 por las rutas comerciales y provocó la muerte de una parte muy grande de la población; las cifras exactas se discuten y por eso aquí no se dan. Con menos campesinos, escaseó la mano de obra y cambiaron las condiciones de trabajo.",
    "En plena guerra, Juana de Arco, una joven campesina francesa, lideró tropas francesas y liberó Orleans (1429). Fue capturada, juzgada y ejecutada en 1431.",
    "Poco después, Gutenberg desarrolló en Europa la imprenta de tipos móviles e imprimió la Biblia (hacia 1455): los libros se hicieron más rápidos y baratos de producir, y el conocimiento escrito se difundió mucho más.",
    "Personajes clave: Juana de Arco (heroína militar francesa) y Johannes Gutenberg (impresor alemán).",
    "Causas y consecuencias: la guerra de los Cien Años llevó a la aparición de figuras como Juana de Arco; la imprenta de Gutenberg será una herramienta clave para el Renacimiento y la Reforma, que se estudian en la Edad Moderna.",
    "Conecta con: la lección de Europa feudal, con la Técnica «Cómo se cierra la Edad Media: 1453 o 1492» y con la Edad Moderna.",
    "Errores comunes: (1) creer que la guerra de los Cien Años duró exactamente cien años: fue más larga, con treguas; (2) creer que Gutenberg inventó la imprenta en general: en China ya se imprimía con tipos móviles antes, y él desarrolló el sistema de tipos móviles en Europa; (3) tomar la fecha de la Biblia como exacta: es aproximada."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 5,
      "titulo": "De la guerra a la imprenta",
      "hechos": [
        "guerra-de-los-cien-anios",
        "peste-negra",
        "juana-de-arco-en-orleans",
        "biblia-de-gutenberg"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 6,
      "titulo": "Una heroína y un impresor",
      "personajes": [
        "juana-de-arco",
        "gutenberg"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "La guerra que trajo a Juana de Arco",
      "cadena": [
        "guerra-de-los-cien-anios",
        "juana-de-arco-en-orleans"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «La peste negra llega a Europa» o «Juana de Arco libera Orleans»?",
      "opciones": [
        "La peste negra llega a Europa",
        "Juana de Arco libera Orleans",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "La peste negra llega a Europa",
      "explicacion": "La peste negra llega a Europa es de 1347 y Juana de Arco libera Orleans, de 1429."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Comienzo de la guerra de los Cien Años»?",
      "opciones": [
        "Caída del Imperio romano de Occidente",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
        "Carlomagno es coronado emperador",
        "Juana de Arco libera Orleans"
      ],
      "respuesta": "Juana de Arco libera Orleans",
      "explicacion": "Juana de Arco libera Orleans (1429) vino después y se apoya en «Comienzo de la guerra de los Cien Años»; los otros hechos son anteriores a 1337, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Quién fue este personaje? Heroína militar francesa. Lideró tropas francesas en Orleans durante la guerra de los Cien Años y murió en la hoguera.",
      "opciones": [
        "Johannes Gutenberg",
        "Marco Polo",
        "Juana de Arco",
        "Guillermo el Conquistador"
      ],
      "respuesta": "Juana de Arco",
      "explicacion": "Juana de Arco (1412 – 1431 (fechas aproximadas)): lideró tropas francesas en Orleans durante la guerra de los Cien Años y murió en la hoguera."
    },
    {
      "pregunta": "¿Quién fue este personaje? Impresor alemán. Desarrolló en Europa la imprenta de tipos móviles.",
      "opciones": [
        "Juana de Arco",
        "Johannes Gutenberg",
        "Mehmed II",
        "Marco Polo"
      ],
      "respuesta": "Johannes Gutenberg",
      "explicacion": "Johannes Gutenberg (murió en 1468 (fechas aproximadas)): desarrolló en Europa la imprenta de tipos móviles."
    },
    {
      "pregunta": "¿Cuál fue una consecuencia de la imprenta de tipos móviles en Europa?",
      "opciones": [
        "Se dejó de escribir a mano para siempre",
        "El papel dejó de fabricarse",
        "Los libros se prohibieron",
        "Los libros se hicieron más rápidos y baratos de producir y el conocimiento se difundió más"
      ],
      "respuesta": "Los libros se hicieron más rápidos y baratos de producir y el conocimiento se difundió más",
      "explicacion": "Con la imprenta se pudieron producir muchos ejemplares con menos trabajo y menor costo; el resto de las opciones no ocurrió."
    }
  ]
}$historia$::jsonb,
  4,
  true),

('historia-clase-15-asia-oriental-y-los-mongoles', 'China, Japón, India y el Sudeste asiático: de los Tang a los Ming',
  'Las dinastías chinas, el Japón de los shogunes, el sultanato de Delhi, Angkor Wat y el imperio de los mongoles.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás ubicar las dinastías chinas de la Edad Media, el imperio mongol y las otras grandes civilizaciones de Asia: Japón, India y el Imperio jemer.",
    "Contexto: en la lección de la China antigua viste que los Han unificaron un gran Estado. Tras siglos de divisiones, China volvió a unificarse bajo nuevas dinastías. Y recuerda: una causa precede a su consecuencia; en esta lección hay una cadena de cuatro hechos.",
    "La dinastía Tang (618 d. C.) es recordada como una época de esplendor, con una gran capital, Chang'an, y una brillante poesía. La dinastía Song (960 d. C.) fue una época de gran desarrollo económico y de inventos como la imprenta, la pólvora y la brújula, aunque algunos ya existían antes.",
    "En Japón, el poder real pasó a los jefes militares: Minamoto no Yoritomo estableció el shogunato de Kamakura (1192). El emperador seguía existiendo, pero gobernaba el shogún. Antes, la dama de la corte Murasaki Shikibu había escrito El relato de Genji, considerada una de las primeras novelas del mundo.",
    "En la India, el sultanato de Delhi se fundó en 1206. En el Sudeste asiático, el Imperio jemer levantó el templo de Angkor Wat (hacia 1130), en la actual Camboya.",
    "Los mongoles: Temüjin fue proclamado Gengis Kan (1206) y con él nació el mayor imperio terrestre continuo de la historia. Su nieto Kublai Kan fundó en China la dinastía Yuan (1271). El veneciano Marco Polo llegó a su corte hacia 1275 y relató su viaje en un famoso libro.",
    "Los Ming expulsaron a los mongoles de China (1368). Con ellos, el almirante Zheng He dirigió grandes flotas hasta el océano Índico y las costas de África oriental (1405).",
    "Personajes clave: Murasaki Shikibu, Minamoto no Yoritomo, Gengis Kan, Kublai Kan, Marco Polo, Zheng He.",
    "Causas y consecuencias: la proclamación de Gengis Kan llevó al imperio mongol; de él nació la dinastía Yuan; y de la caída de los Yuan surgió la dinastía Ming, que impulsó las expediciones de Zheng He.",
    "Conecta con: la lección del mundo islámico (Bagdad y los mongoles), la de África medieval (Ibn Battuta viajó por Asia) y la Edad Moderna (el comercio con Asia impulsará los viajes de exploración europeos).",
    "Errores comunes: (1) confundir a Gengis Kan con Kublai Kan: Kublai era su nieto y fundó la dinastía Yuan; (2) confundir shogún con emperador: en Japón el emperador seguía, pero el poder real lo tenía el shogún; (3) creer que Zheng He llegó a América: llegó al océano Índico y a África oriental."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 5,
      "titulo": "Cinco hitos de los siglos VII a XII",
      "hechos": [
        "dinastia-tang",
        "dinastia-song",
        "angkor-wat",
        "shogunato-de-kamakura",
        "sultanato-de-delhi"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 7,
      "titulo": "Cinco hitos de los mongoles a los Ming",
      "hechos": [
        "gengis-kan-proclamado",
        "dinastia-yuan",
        "marco-polo-en-china",
        "dinastia-ming",
        "expediciones-de-zheng-he"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 8,
      "titulo": "Los protagonistas",
      "personajes": [
        "murasaki-shikibu",
        "minamoto-no-yoritomo",
        "gengis-kan",
        "kublai-kan",
        "marco-polo",
        "zheng-he"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 9,
      "titulo": "De Gengis Kan a Zheng He",
      "cadena": [
        "gengis-kan-proclamado",
        "dinastia-yuan",
        "dinastia-ming",
        "expediciones-de-zheng-he"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Comienzo de la dinastía Tang en China» o «Comienzo de la dinastía Song en China»?",
      "opciones": [
        "Comienzo de la dinastía Tang en China",
        "Comienzo de la dinastía Song en China",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Comienzo de la dinastía Tang en China",
      "explicacion": "Comienzo de la dinastía Tang en China es de 618 d. C. y Comienzo de la dinastía Song en China, de 960 d. C."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Temüjin es proclamado Gengis Kan»?",
      "opciones": [
        "Caída del Imperio romano de Occidente",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
        "Comienzo de la dinastía Tang en China",
        "Kublai Kan funda la dinastía Yuan en China"
      ],
      "respuesta": "Kublai Kan funda la dinastía Yuan en China",
      "explicacion": "Kublai Kan funda la dinastía Yuan en China (1271) vino después y se apoya en «Temüjin es proclamado Gengis Kan»; los otros hechos son anteriores a 1206, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos contribuyó a provocar «Comienzo de la dinastía Ming en China»?",
      "opciones": [
        "Primera expedición marítima de Zheng He",
        "Kublai Kan funda la dinastía Yuan en China",
        "Caída de Constantinopla en manos otomanas",
        "Gutenberg imprime la Biblia con tipos móviles"
      ],
      "respuesta": "Kublai Kan funda la dinastía Yuan en China",
      "explicacion": "Kublai Kan funda la dinastía Yuan en China (1271) fue anterior y contribuyó a provocarlo; los otros hechos ocurrieron después de 1368, así que no pueden ser una causa."
    },
    {
      "pregunta": "¿Quién fue este personaje? Emperador mongol de China. Nieto de Gengis Kan, fundó la dinastía Yuan en China.",
      "opciones": [
        "Gengis Kan",
        "Marco Polo",
        "Zheng He",
        "Kublai Kan"
      ],
      "respuesta": "Kublai Kan",
      "explicacion": "Kublai Kan (1215 – 1294): nieto de Gengis Kan, fundó la dinastía Yuan en China."
    },
    {
      "pregunta": "¿Quién fue este personaje? Almirante chino. Dirigió grandes flotas chinas hasta el océano Índico y las costas de África oriental.",
      "opciones": [
        "Marco Polo",
        "Gengis Kan",
        "Zheng He",
        "Kublai Kan"
      ],
      "respuesta": "Zheng He",
      "explicacion": "Zheng He (1371 – 1433 (fechas aproximadas)): dirigió grandes flotas chinas hasta el océano Índico y las costas de África oriental."
    },
    {
      "pregunta": "En el Japón medieval, ¿quién tenía el poder real?",
      "opciones": [
        "El emperador, que gobernaba solo",
        "El sultán de Delhi",
        "Los mongoles",
        "El shogún, jefe militar"
      ],
      "respuesta": "El shogún, jefe militar",
      "explicacion": "Con el shogunato de Kamakura (1192) el poder real pasó al shogún, aunque el emperador siguió existiendo."
    }
  ]
}$historia$::jsonb,
  5,
  true),

('historia-clase-16-africa-y-oceania-medievales', 'África y Oceanía medievales: Mali, Zimbabue y los maoríes',
  'El imperio de Mali y Mansa Musa, los viajes de Ibn Battuta, el Gran Zimbabue y la llegada de los maoríes a Nueva Zelanda.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar por qué fue famoso el imperio de Mali, quién fue Ibn Battuta y qué eran el Gran Zimbabue y el poblamiento de Nueva Zelanda.",
    "Contexto: en la Antigüedad hubo grandes Estados africanos, como Cartago y Aksum. En la Edad Media, en África occidental, el comercio a través del desierto del Sahara, de oro y de sal, hizo crecer nuevos imperios: una causa (el comercio) que provoca una consecuencia (la riqueza y el poder).",
    "Sundiata Keita fundó el imperio de Mali hacia 1235, una tradición que se conserva en la epopeya oral de Sundiata. Mali controlaba el comercio del oro, y ciudades como Tombuctú fueron centros comerciales y de estudio del islam.",
    "El emperador Mansa Musa hizo una famosa peregrinación a La Meca (hacia 1324). Según los cronistas árabes, llevó tanto oro que su viaje mostró la riqueza de Mali a todo el mundo islámico.",
    "Ibn Battuta, un viajero marroquí, salió de Tánger en 1325 y recorrió durante casi treinta años África, Asia y parte de Europa; dictó luego el libro de sus viajes.",
    "En el sur de África, el Gran Zimbabue fue una ciudad de piedra con gran comercio de oro con la costa del océano Índico (hacia 1300). Y en el Pacífico, los maoríes, navegantes polinesios, se establecieron en Nueva Zelanda (hacia 1300).",
    "Personajes clave: Sundiata Keita, Mansa Musa, Ibn Battuta.",
    "Causas y consecuencias: el imperio de Mali, rico por el comercio, hizo posible la famosa peregrinación de Mansa Musa. Simplificación de nivel escolar: los datos sobre el oro que llevó provienen de cronistas de la época y no se conocen con exactitud.",
    "Conecta con: la lección del mundo islámico (Mali era un imperio islámico), con la de Asia (Ibn Battuta viajó por Asia) y con la Edad Moderna, cuando los europeos llegarán a las costas africanas.",
    "Errores comunes: (1) creer que la actual República de Mali es el mismo territorio que el imperio medieval: no coinciden; (2) pensar que África carecía de historia escrita: hay tradición oral y fuentes árabes, además de las ruinas; (3) atribuir el Gran Zimbabue a otros pueblos: fue construido por pueblos africanos."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 5,
      "titulo": "Cinco hechos de África y Oceanía en el siglo XIII y XIV",
      "hechos": [
        "imperio-de-mali",
        "peregrinacion-de-mansa-musa",
        "viajes-de-ibn-battuta",
        "gran-zimbabue",
        "maories-en-nueva-zelanda"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 6,
      "titulo": "Un fundador, un emperador y un viajero",
      "personajes": [
        "sundiata-keita",
        "mansa-musa",
        "ibn-battuta"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "Un imperio rico y una peregrinación",
      "cadena": [
        "imperio-de-mali",
        "peregrinacion-de-mansa-musa"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Sundiata Keita funda el Imperio de Mali» o «Peregrinación de Mansa Musa a La Meca»?",
      "opciones": [
        "Peregrinación de Mansa Musa a La Meca",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero",
        "Sundiata Keita funda el Imperio de Mali"
      ],
      "respuesta": "Sundiata Keita funda el Imperio de Mali",
      "explicacion": "Sundiata Keita funda el Imperio de Mali es de hacia 1235 y Peregrinación de Mansa Musa a La Meca, de hacia 1324."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Sundiata Keita funda el Imperio de Mali»?",
      "opciones": [
        "Peregrinación de Mansa Musa a La Meca",
        "Caída del Imperio romano de Occidente",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
        "Comienzo de la dinastía Tang en China"
      ],
      "respuesta": "Peregrinación de Mansa Musa a La Meca",
      "explicacion": "Peregrinación de Mansa Musa a La Meca (hacia 1324) vino después y se apoya en «Sundiata Keita funda el Imperio de Mali»; los otros hechos son anteriores a hacia 1235, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Quién fue este personaje? Viajero marroquí. Recorrió África, Asia y parte de Europa durante casi treinta años y dictó el libro de sus viajes.",
      "opciones": [
        "Ibn Battuta",
        "Mansa Musa",
        "Marco Polo",
        "Zheng He"
      ],
      "respuesta": "Ibn Battuta",
      "explicacion": "Ibn Battuta (1304 – 1368 (fechas aproximadas)): recorrió África, Asia y parte de Europa durante casi treinta años y dictó el libro de sus viajes."
    },
    {
      "pregunta": "¿Quién fue este personaje? Fundador del Imperio de Mali. Fundó el Imperio de Mali en África occidental.",
      "opciones": [
        "Sundiata Keita",
        "Mansa Musa",
        "Ibn Battuta",
        "Gengis Kan"
      ],
      "respuesta": "Sundiata Keita",
      "explicacion": "Sundiata Keita (activo hacia 1235 (fechas aproximadas)): fundó el Imperio de Mali en África occidental."
    },
    {
      "pregunta": "¿Qué comerciaba sobre todo el imperio de Mali a través del Sahara?",
      "opciones": [
        "Seda y papel",
        "Oro y sal",
        "Petróleo y gas",
        "Especias y porcelana chinas"
      ],
      "respuesta": "Oro y sal",
      "explicacion": "El comercio de oro y sal a través del Sahara hizo rico al imperio de Mali."
    }
  ]
}$historia$::jsonb,
  6,
  true),

('historia-clase-17-america-precolombina', 'América precolombina: aztecas e incas',
  'Tenochtitlan, la capital azteca, y el Imperio inca de los Andes, con Machu Picchu.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás distinguir a los aztecas de los incas y ubicar la fundación de Tenochtitlan, la expansión inca y Machu Picchu.",
    "Contexto: en la Antigüedad, América tuvo culturas como la olmeca y la maya. En la Edad Media surgieron en Mesoamérica y en los Andes dos grandes Estados: el azteca y el inca. Ninguno tuvo contacto con Europa hasta 1492. Y una causa precede siempre a su consecuencia: aquí, la expansión precede a las grandes ciudades.",
    "Los mexicas, llamados también aztecas, fundaron Tenochtitlan, según la tradición, hacia 1325, en una isla del lago de Texcoco. Cultivaban en chinampas, islas artificiales de cultivo, y su ciudad llegó a ser la capital de un gran imperio.",
    "En los Andes, los incas tuvieron su capital en Cusco. Con el gobernante Pachacútec comenzó la expansión que convirtió al Cusco en el centro de un gran imperio (hacia 1438). El Estado inca tenía una red de caminos y usaba los quipus, cuerdas con nudos para registrar información.",
    "A esa expansión se asocia Machu Picchu (hacia 1450), una ciudad de piedra en los Andes, considerada una propiedad real de Pachacútec.",
    "Personajes clave: Pachacútec, gobernante inca. De los aztecas, la tabla del curso no incluye gobernantes de esta época.",
    "Causas y consecuencias: la expansión inca llevó a la construcción de ciudades como Machu Picchu. Ambos imperios serán conquistados por los españoles en la Edad Moderna; esa historia sigue en las lecciones siguientes.",
    "Conecta con: la lección de África y América antiguas (olmecas y mayas), con la Edad Moderna (la llegada de Colón y la conquista) y con el mundo actual, donde la lengua quechua y el náhuatl siguen vivas.",
    "Errores comunes: (1) confundir mayas, aztecas e incas: los mayas son mucho más antiguos; (2) creer que aztecas e incas eran vecinos: estaban muy lejos entre sí, en Mesoamérica y en los Andes; (3) leer la fecha de fundación de Tenochtitlan como un año exacto: es la fecha de la tradición."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 4,
      "titulo": "Tenochtitlan, la expansión inca y Machu Picchu",
      "hechos": [
        "fundacion-de-tenochtitlan",
        "expansion-inca",
        "machu-picchu"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 5,
      "titulo": "Pachacútec",
      "personajes": [
        "pachacutec"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 6,
      "titulo": "De la expansión al monumento",
      "cadena": [
        "expansion-inca",
        "machu-picchu"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Fundación de Tenochtitlan, según la tradición» o «Pachacútec inicia la expansión del Imperio inca»?",
      "opciones": [
        "Pachacútec inicia la expansión del Imperio inca",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero",
        "Fundación de Tenochtitlan, según la tradición"
      ],
      "respuesta": "Fundación de Tenochtitlan, según la tradición",
      "explicacion": "Fundación de Tenochtitlan, según la tradición es de 1325 y Pachacútec inicia la expansión del Imperio inca, de hacia 1438."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Pachacútec inicia la expansión del Imperio inca»?",
      "opciones": [
        "Caída del Imperio romano de Occidente",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
        "Comienzo de la dinastía Tang en China",
        "Construcción de Machu Picchu"
      ],
      "respuesta": "Construcción de Machu Picchu",
      "explicacion": "Construcción de Machu Picchu (hacia 1450) vino después y se apoya en «Pachacútec inicia la expansión del Imperio inca»; los otros hechos son anteriores a hacia 1438, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Quién fue este personaje? Gobernante inca. Transformó el señorío del Cusco en el Imperio inca.",
      "opciones": [
        "Mansa Musa",
        "Gengis Kan",
        "Pachacútec",
        "Mehmed II"
      ],
      "respuesta": "Pachacútec",
      "explicacion": "Pachacútec (activo hacia 1438 (fechas aproximadas)): transformó el señorío del Cusco en el Imperio inca."
    },
    {
      "pregunta": "Según la periodización escolar, ¿en qué época ocurrió «Construcción de Machu Picchu»?",
      "opciones": [
        "Antigüedad",
        "Edad Media",
        "Edad Moderna",
        "Prehistoria"
      ],
      "respuesta": "Edad Media",
      "explicacion": "hacia 1450 cae en la Edad Media (desde 476 d. C., por convención escolar)."
    },
    {
      "pregunta": "¿Qué eran los quipus?",
      "opciones": [
        "Barcos de los vikingos",
        "Templos de los aztecas",
        "Cuerdas con nudos que usaban los incas para registrar información",
        "Monedas de oro de los mayas"
      ],
      "respuesta": "Cuerdas con nudos que usaban los incas para registrar información",
      "explicacion": "Los quipus eran cuerdas con nudos: el Estado inca las usaba para llevar cuentas y registros."
    }
  ]
}$historia$::jsonb,
  7,
  true),

('historia-clase-18-renacimiento-y-reforma', 'El Renacimiento y la Reforma protestante',
  'El arte y las letras del Renacimiento, las 95 tesis de Lutero y las guerras de religión que terminaron con la Paz de Westfalia.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar qué fue el Renacimiento, qué desencadenó la Reforma protestante y cómo terminaron las guerras religiosas en Europa.",
    "Contexto: la Edad Moderna empieza, por convención escolar, con 1492. Repaso de la Edad Media: la imprenta de Gutenberg (hacia 1455) hizo que los libros fueran más baratos y las ideas circularan más; y recuerda que una causa siempre precede a su consecuencia.",
    "El Renacimiento fue un movimiento de renovación del arte, las letras y el pensamiento, que nació en Italia y se extendió por Europa; recuperó el interés por la cultura de la Antigüedad clásica y puso al ser humano en el centro. Leonardo da Vinci pintó la «Leonardo da Vinci comienza la Mona Lisa» (hacia 1503) y Miguel Ángel el techo de la Capilla Sixtina (1508).",
    "En la literatura, Cervantes publicó «Cervantes publica la primera parte de Don Quijote» (1605), considerada una de las grandes novelas de la literatura universal, y Shakespeare escribió obras de teatro como Hamlet y Romeo y Julieta.",
    "En 1517 el teólogo alemán Martín Lutero publicó sus 95 tesis, en las que criticaba prácticas de la Iglesia católica; así empezó la Reforma protestante, que dividió a los cristianos de Europa occidental entre católicos y protestantes.",
    "Los conflictos religiosos se mezclaron con la política. La guerra de los Treinta Años, que comenzó en 1618, enfrentó a muchos Estados europeos y terminó con la Paz de Westfalia (1648), que sentó bases del sistema de Estados soberanos.",
    "Personajes clave: Leonardo da Vinci, Miguel Ángel, Miguel de Cervantes, William Shakespeare, Martín Lutero. Los cuatro primeros, artistas y escritores; el último, un teólogo.",
    "Causas y consecuencias: las 95 tesis llevaron a la ruptura religiosa; esa ruptura contribuyó a la guerra de los Treinta Años; y la guerra terminó en la Paz de Westfalia. La figura une los tres hechos.",
    "Conecta con: la lección de la crisis de la Baja Edad Media (imprenta) y la de la exploración de América, que ocurrió a la vez; y con la Ilustración, que heredará el espíritu crítico del Renacimiento.",
    "Errores comunes: (1) creer que Renacimiento y Reforma son lo mismo: el primero es un movimiento cultural; la segunda, religioso; (2) pensar que Lutero quiso crear una Iglesia nueva desde el principio: empezó criticando prácticas; (3) creer que la Paz de Westfalia terminó con todas las guerras de Europa: cerró la guerra de los Treinta Años."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 5,
      "titulo": "Del arte del Renacimiento a la Paz de Westfalia",
      "hechos": [
        "mona-lisa",
        "capilla-sixtina",
        "don-quijote",
        "noventa-y-cinco-tesis",
        "guerra-de-los-treinta-anios",
        "paz-de-westfalia"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 7,
      "titulo": "Artistas, escritores y un teólogo",
      "personajes": [
        "leonardo-da-vinci",
        "miguel-angel",
        "cervantes",
        "shakespeare",
        "lutero"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 8,
      "titulo": "De las 95 tesis a la Paz de Westfalia",
      "cadena": [
        "noventa-y-cinco-tesis",
        "guerra-de-los-treinta-anios",
        "paz-de-westfalia"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Leonardo da Vinci comienza la Mona Lisa» o «Lutero publica las 95 tesis y comienza la Reforma protestante»?",
      "opciones": [
        "Lutero publica las 95 tesis y comienza la Reforma protestante",
        "Ocurrieron en el mismo año",
        "Leonardo da Vinci comienza la Mona Lisa",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Leonardo da Vinci comienza la Mona Lisa",
      "explicacion": "Leonardo da Vinci comienza la Mona Lisa es de hacia 1503 y Lutero publica las 95 tesis y comienza la Reforma protestante, de 1517."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Lutero publica las 95 tesis y comienza la Reforma protestante»?",
      "opciones": [
        "Caída del Imperio romano de Occidente",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
        "Gutenberg imprime la Biblia con tipos móviles",
        "Comienzo de la guerra de los Treinta Años"
      ],
      "respuesta": "Comienzo de la guerra de los Treinta Años",
      "explicacion": "Comienzo de la guerra de los Treinta Años (1618) vino después y se apoya en «Lutero publica las 95 tesis y comienza la Reforma protestante»; los otros hechos son anteriores a 1517, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Comienzo de la guerra de los Treinta Años»?",
      "opciones": [
        "Caída del Imperio romano de Occidente",
        "Paz de Westfalia",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
        "Gutenberg imprime la Biblia con tipos móviles"
      ],
      "respuesta": "Paz de Westfalia",
      "explicacion": "Paz de Westfalia (1648) vino después y se apoya en «Comienzo de la guerra de los Treinta Años»; los otros hechos son anteriores a 1618, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Quién fue este personaje? Escultor y pintor italiano. Esculpió el David y pintó el techo de la Capilla Sixtina.",
      "opciones": [
        "Leonardo da Vinci",
        "Martín Lutero",
        "Galileo Galilei",
        "Miguel Ángel"
      ],
      "respuesta": "Miguel Ángel",
      "explicacion": "Miguel Ángel (1475 – 1564): esculpió el David y pintó el techo de la Capilla Sixtina."
    },
    {
      "pregunta": "¿Quién fue este personaje? Escritor español. Escribió Don Quijote de la Mancha.",
      "opciones": [
        "Miguel de Cervantes",
        "William Shakespeare",
        "Miguel Ángel",
        "Martín Lutero"
      ],
      "respuesta": "Miguel de Cervantes",
      "explicacion": "Miguel de Cervantes (1547 – 1616): escribió Don Quijote de la Mancha."
    },
    {
      "pregunta": "¿Qué fue la Reforma protestante?",
      "opciones": [
        "Una guerra entre el Imperio romano y Persia",
        "Un movimiento artístico italiano",
        "Una ley del Imperio otomano",
        "Un movimiento religioso iniciado por Lutero que dividió a los cristianos de Europa occidental"
      ],
      "respuesta": "Un movimiento religioso iniciado por Lutero que dividió a los cristianos de Europa occidental",
      "explicacion": "La Reforma comenzó con las 95 tesis (1517); el movimiento artístico es el Renacimiento."
    }
  ]
}$historia$::jsonb,
  1,
  true),

('historia-clase-19-exploracion-y-conquista-de-america', 'Los viajes de exploración y la conquista de América',
  'Colón, Tordesillas, el camino a la India, la primera vuelta al mundo y la caída de los imperios azteca e inca.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar por qué los europeos se lanzaron al mar, qué ocurrió con la llegada de Colón y cómo cayeron los imperios azteca e inca.",
    "Contexto: la Edad Moderna empieza con 1492. Repaso de la Edad Media: los aztecas (Tenochtitlan, hacia 1325) y los incas (con Pachacútec) eran dos grandes Estados de América sin contacto con Europa, y las cadenas de causas y consecuencias sirven para ordenar los hechos.",
    "Las potencias ibéricas buscaban rutas marítimas hacia Asia, por sus especias, evitando las rutas controladas por otros. Portugal rodeó África y Vasco da Gama llegó a la India (1498). Castilla apoyó a Colón, que en 1492 llegó a América pensando que había llegado a Asia; por eso a los habitantes de América se los llamó «indios».",
    "Ese mismo año cayó Granada, último reino musulmán de la península ibérica (1492). Para evitar conflictos entre Castilla y Portugal, en 1494 firmaron el Tratado de Tordesillas, que repartió entre ambas las zonas de exploración.",
    "La expedición de Magallanes partió de España (1519). Magallanes murió en Filipinas en 1521 y Elcano completó el viaje: la primera vuelta al mundo (1522).",
    "Hernán Cortés dirigió una expedición que, con la ayuda de aliados indígenas enemigos de los mexicas, conquistó Tenochtitlan (1521); en 1535 se creó el Virreinato de Nueva España. Pizarro capturó al gobernante inca Atahualpa en Cajamarca (1532), en un Imperio inca debilitado por una guerra interna.",
    "Personajes clave: Cristóbal Colón, Isabel I de Castilla, Vasco da Gama, Fernando de Magallanes, Juan Sebastián Elcano, Hernán Cortés, Moctezuma II, Francisco Pizarro, Atahualpa.",
    "Causas y consecuencias: los viajes de Colón llevaron al Tratado de Tordesillas, a la conquista de Tenochtitlan y a la captura de Atahualpa; de la caída de Tenochtitlan surgió el Virreinato. Las epidemias traídas de Europa causaron una enorme mortalidad entre los pueblos americanos; las cifras se discuten y por eso aquí no se dan.",
    "Conecta con: la lección de América precolombina (aztecas e incas), la de los imperios de Asia, que tuvo contacto con los portugueses, y la Edad Contemporánea, donde las independencias de América cierran este período.",
    "Errores comunes: (1) creer que América era un territorio vacío: estaba habitada por millones de personas; y creer que Colón supo que había llegado a un continente nuevo: él creyó que había llegado a Asia; (2) creer que Magallanes completó la vuelta al mundo: murió antes; la completó Elcano; (3) creer que la conquista fue solo militar: influyeron alianzas, enfermedades y guerras internas."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 5,
      "titulo": "Nueve hechos de la exploración y la conquista",
      "hechos": [
        "llegada-de-colon",
        "caida-de-granada",
        "tratado-de-tordesillas",
        "vasco-da-gama-en-la-india",
        "magallanes-parte",
        "primera-vuelta-al-mundo",
        "caida-de-tenochtitlan",
        "captura-de-atahualpa",
        "virreinato-de-nueva-espana"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "De Colón a Tenochtitlan y al Virreinato",
      "cadena": [
        "llegada-de-colon",
        "caida-de-tenochtitlan",
        "virreinato-de-nueva-espana"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "De Magallanes a la primera vuelta al mundo",
      "cadena": [
        "magallanes-parte",
        "primera-vuelta-al-mundo"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 6,
      "titulo": "Los protagonistas (1)",
      "personajes": [
        "colon",
        "isabel-de-castilla",
        "vasco-da-gama",
        "magallanes",
        "elcano"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 6,
      "titulo": "Los protagonistas (2)",
      "personajes": [
        "hernan-cortes",
        "moctezuma-ii",
        "pizarro",
        "atahualpa"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Tratado de Tordesillas entre Castilla y Portugal» o «Vasco da Gama llega a la India por mar»?",
      "opciones": [
        "Vasco da Gama llega a la India por mar",
        "Tratado de Tordesillas entre Castilla y Portugal",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Tratado de Tordesillas entre Castilla y Portugal",
      "explicacion": "Tratado de Tordesillas entre Castilla y Portugal es de 1494 y Vasco da Gama llega a la India por mar, de 1498."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Llegada de Colón a América»?",
      "opciones": [
        "Tratado de Tordesillas entre Castilla y Portugal",
        "Caída de Constantinopla en manos otomanas",
        "Gutenberg imprime la Biblia con tipos móviles",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina"
      ],
      "respuesta": "Tratado de Tordesillas entre Castilla y Portugal",
      "explicacion": "Tratado de Tordesillas entre Castilla y Portugal (1494) vino después y se apoya en «Llegada de Colón a América»; los otros hechos son anteriores a 1492, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Caída de Tenochtitlan ante los españoles»?",
      "opciones": [
        "Se crea el Virreinato de Nueva España",
        "Caída de Constantinopla en manos otomanas",
        "Gutenberg imprime la Biblia con tipos móviles",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina"
      ],
      "respuesta": "Se crea el Virreinato de Nueva España",
      "explicacion": "Se crea el Virreinato de Nueva España (1535) vino después y se apoya en «Caída de Tenochtitlan ante los españoles»; los otros hechos son anteriores a 1521, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Quién fue este personaje? Navegante español. Completó la primera vuelta al mundo al mando de la nave Victoria.",
      "opciones": [
        "Juan Sebastián Elcano",
        "Fernando de Magallanes",
        "Cristóbal Colón",
        "Hernán Cortés"
      ],
      "respuesta": "Juan Sebastián Elcano",
      "explicacion": "Juan Sebastián Elcano (murió en 1526 (fechas aproximadas)): completó la primera vuelta al mundo al mando de la nave Victoria."
    },
    {
      "pregunta": "¿Quién fue este personaje? Conquistador español. Dirigió la conquista del Imperio inca.",
      "opciones": [
        "Hernán Cortés",
        "Cristóbal Colón",
        "Vasco da Gama",
        "Francisco Pizarro"
      ],
      "respuesta": "Francisco Pizarro",
      "explicacion": "Francisco Pizarro (murió en 1541 (fechas aproximadas)): dirigió la conquista del Imperio inca."
    },
    {
      "pregunta": "¿Por qué Colón llamó «indios» a los habitantes de América?",
      "opciones": [
        "Porque hablaban idiomas de la India",
        "Porque creía haber llegado a Asia, a las Indias",
        "Porque venían de la India",
        "Porque así se llamaba su pueblo"
      ],
      "respuesta": "Porque creía haber llegado a Asia, a las Indias",
      "explicacion": "Colón pensó que había llegado a las Indias, es decir, a Asia; el nombre se quedó, aunque no corresponde a los pueblos americanos."
    }
  ]
}$historia$::jsonb,
  2,
  true),

('historia-clase-20-imperios-de-asia-moderna', 'Los grandes imperios de Asia: mogoles, Tokugawa y Qing',
  'El Imperio mogol de la India, el shogunato Tokugawa de Japón y la dinastía Qing de China.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás ubicar tres grandes Estados asiáticos de la Edad Moderna: el Imperio mogol, el Japón de los Tokugawa y la China de los Qing.",
    "Contexto: en la Edad Media, el sultanato de Delhi gobernaba el norte de la India, en Japón el poder había pasado a los shogunes y en China gobernaba la dinastía Ming. En esta lección se ve qué las reemplazó, y cada hecho tiene una causa que lo precede.",
    "En la India, Babur, un príncipe de Asia central, venció en Panipat (1526) y fundó el Imperio mogol. Su nieto Akbar gobernó desde 1556 y es recordado por su política de tolerancia entre religiones.",
    "Shah Jahan, otro emperador mogol, mandó construir el Taj Mahal como mausoleo de su esposa (1632).",
    "En Japón, Tokugawa Ieyasu venció en Sekigahara (1600) y se convirtió en shogún en 1603. El shogunato Tokugawa gobernó Japón durante más de dos siglos y medio (hasta la Restauración Meiji, 1868).",
    "En China, los manchúes tomaron Pekín y comenzó el dominio de la dinastía Qing (1644), la última dinastía imperial de China.",
    "Personajes clave: Babur, Akbar, Shah Jahan, Tokugawa Ieyasu.",
    "Causas y consecuencias: la victoria de Ieyasu en Sekigahara llevó al shogunato Tokugawa. Simplificación de nivel escolar: el Imperio mogol, muy rico, también fue objetivo de los comerciantes europeos.",
    "Conecta con: la lección de Asia oriental medieval, la de los grandes viajes europeos (los portugueses ya estaban en la India) y la Edad Contemporánea, donde Japón se modernizará con la Restauración Meiji y China será afectada por el imperialismo.",
    "Errores comunes: (1) confundir a los mogoles con los mongoles: los primeros gobernaron la India (Babur descendía de los mongoles por vía materna), los segundos son los de Gengis Kan; (2) creer que el shogún era el emperador: el shogún gobernaba en nombre del emperador; (3) pensar que el Taj Mahal es un templo: es un mausoleo."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 5,
      "titulo": "Seis hechos de la India, Japón y China",
      "hechos": [
        "batalla-de-panipat",
        "reinado-de-akbar",
        "comienzo-del-taj-mahal",
        "batalla-de-sekigahara",
        "shogunato-tokugawa",
        "dinastia-qing"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 6,
      "titulo": "Cuatro protagonistas",
      "personajes": [
        "babur",
        "akbar",
        "shah-jahan",
        "tokugawa-ieyasu"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "De la batalla de Sekigahara al shogunato",
      "cadena": [
        "batalla-de-sekigahara",
        "shogunato-tokugawa"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Babur funda el Imperio mogol tras la batalla de Panipat» o «Tokugawa Ieyasu vence en Sekigahara»?",
      "opciones": [
        "Tokugawa Ieyasu vence en Sekigahara",
        "Ocurrieron en el mismo año",
        "Babur funda el Imperio mogol tras la batalla de Panipat",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Babur funda el Imperio mogol tras la batalla de Panipat",
      "explicacion": "Babur funda el Imperio mogol tras la batalla de Panipat es de 1526 y Tokugawa Ieyasu vence en Sekigahara, de 1600."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Tokugawa Ieyasu vence en Sekigahara»?",
      "opciones": [
        "Caída de Constantinopla en manos otomanas",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
        "Comienza el shogunato Tokugawa en Japón",
        "Comienzo de la dinastía Tang en China"
      ],
      "respuesta": "Comienza el shogunato Tokugawa en Japón",
      "explicacion": "Comienza el shogunato Tokugawa en Japón (1603) vino después y se apoya en «Tokugawa Ieyasu vence en Sekigahara»; los otros hechos son anteriores a 1600, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Quién fue este personaje? Emperador mogol. Mandó construir el Taj Mahal como mausoleo de su esposa.",
      "opciones": [
        "Akbar",
        "Babur",
        "Tokugawa Ieyasu",
        "Shah Jahan"
      ],
      "respuesta": "Shah Jahan",
      "explicacion": "Shah Jahan (1592 – 1666): mandó construir el Taj Mahal como mausoleo de su esposa."
    },
    {
      "pregunta": "¿Quién fue este personaje? Fundador del Imperio mogol. Venció en Panipat y fundó el Imperio mogol en la India.",
      "opciones": [
        "Akbar",
        "Babur",
        "Shah Jahan",
        "Tokugawa Ieyasu"
      ],
      "respuesta": "Babur",
      "explicacion": "Babur (1483 – 1530): venció en Panipat y fundó el Imperio mogol en la India."
    },
    {
      "pregunta": "¿Qué es el Taj Mahal?",
      "opciones": [
        "Un mausoleo que mandó construir Shah Jahan para su esposa",
        "Un templo de Japón",
        "Una fortaleza china",
        "Un palacio de Constantinopla"
      ],
      "respuesta": "Un mausoleo que mandó construir Shah Jahan para su esposa",
      "explicacion": "El Taj Mahal, cuya construcción comenzó hacia 1632, es un mausoleo del Imperio mogol."
    }
  ]
}$historia$::jsonb,
  3,
  true),

('historia-clase-21-revolucion-cientifica-e-ilustracion', 'La revolución científica y la Ilustración',
  'Copérnico, Galileo, Newton, la idea de razón y de soberanía popular de la Ilustración y la máquina de vapor.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar qué cambió en la ciencia con Copérnico, Galileo y Newton y qué ideas defendió la Ilustración.",
    "Contexto: el Renacimiento (lección anterior) devolvió a Europa el interés por observar y estudiar la naturaleza. De esa curiosidad nacieron los avances científicos de los siglos siguientes.",
    "Nicolás Copérnico propuso que la Tierra y los demás planetas giran alrededor del Sol, en su obra de 1543. Galileo observó el cielo con el telescopio (1609) y descubrió, entre otras cosas, las lunas de Júpiter; tuvo conflictos con la Iglesia por defender esas ideas.",
    "Isaac Newton publicó los Principia (1687), donde formuló la ley de la gravitación universal y las leyes del movimiento.",
    "La Ilustración fue un movimiento del siglo XVIII que defendió el uso de la razón, la libertad de pensamiento y la crítica a la autoridad. Sus ideas influyeron en las revoluciones que siguieron.",
    "Uno de sus autores, Rousseau, escribió «Rousseau publica El contrato social» (1762), donde sostiene que el poder político nace de un acuerdo de los ciudadanos.",
    "La técnica también avanzó: James Watt patentó una máquina de vapor mejorada (1769), que pronto se aplicó en fábricas y transportes.",
    "Personajes clave: Nicolás Copérnico, Galileo Galilei, Isaac Newton, Jean-Jacques Rousseau, James Watt.",
    "Causas y consecuencias: los descubrimientos científicos cambiaron la idea de universo; la Ilustración aplicó esa confianza en la razón a la política y a la sociedad; y la máquina de vapor abrió el camino de la Revolución Industrial, que se estudia en la Edad Contemporánea.",
    "Conecta con: la lección del Renacimiento (de ahí viene la curiosidad científica), con la de la exploración de América (la navegación usó la astronomía) y con la Edad Contemporánea, donde la ciencia impulsa la industrialización.",
    "Errores comunes: (1) creer que Galileo inventó el telescopio: lo perfeccionó y lo usó para observar el cielo; (2) confundir a Copérnico con Galileo: Copérnico propuso el heliocentrismo, Galileo aportó observaciones; (3) creer que Watt inventó la máquina de vapor de la nada: mejoró una máquina que ya existía."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 6,
      "titulo": "Cinco hitos de la ciencia y las ideas",
      "hechos": [
        "de-revolutionibus",
        "telescopio-de-galileo",
        "principia-de-newton",
        "contrato-social",
        "maquina-de-vapor-de-watt"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 8,
      "titulo": "Cinco protagonistas",
      "personajes": [
        "copernico",
        "galileo",
        "newton",
        "rousseau",
        "james-watt"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Copérnico publica su teoría heliocéntrica» o «Newton publica los Principia»?",
      "opciones": [
        "Newton publica los Principia",
        "Copérnico publica su teoría heliocéntrica",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Copérnico publica su teoría heliocéntrica",
      "explicacion": "Copérnico publica su teoría heliocéntrica es de 1543 y Newton publica los Principia, de 1687."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Galileo observa el cielo con el telescopio» o «Rousseau publica El contrato social»?",
      "opciones": [
        "Rousseau publica El contrato social",
        "Ocurrieron en el mismo año",
        "Galileo observa el cielo con el telescopio",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Galileo observa el cielo con el telescopio",
      "explicacion": "Galileo observa el cielo con el telescopio es de 1609 y Rousseau publica El contrato social, de 1762."
    },
    {
      "pregunta": "¿Quién fue este personaje? Astrónomo polaco. Propuso que la Tierra y los planetas giran alrededor del Sol.",
      "opciones": [
        "Galileo Galilei",
        "Isaac Newton",
        "Nicolás Copérnico",
        "Jean-Jacques Rousseau"
      ],
      "respuesta": "Nicolás Copérnico",
      "explicacion": "Nicolás Copérnico (1473 – 1543): propuso que la Tierra y los planetas giran alrededor del Sol."
    },
    {
      "pregunta": "¿Quién fue este personaje? Científico inglés. Formuló la ley de la gravitación universal.",
      "opciones": [
        "Galileo Galilei",
        "Nicolás Copérnico",
        "Isaac Newton",
        "James Watt"
      ],
      "respuesta": "Isaac Newton",
      "explicacion": "Isaac Newton (1643 – 1727 (fechas aproximadas)): formuló la ley de la gravitación universal."
    },
    {
      "pregunta": "¿Qué defendieron los pensadores de la Ilustración?",
      "opciones": [
        "La obediencia absoluta a los reyes",
        "El regreso a la vida nómada",
        "La prohibición de los libros",
        "El uso de la razón, la libertad de pensamiento y la crítica a la autoridad"
      ],
      "respuesta": "El uso de la razón, la libertad de pensamiento y la crítica a la autoridad",
      "explicacion": "La Ilustración confió en la razón y criticó las autoridades que no se basaban en ella."
    }
  ]
}$historia$::jsonb,
  4,
  true),

('historia-clase-22-colonias-comercio-y-esclavitud-atlantica', 'El mundo atlántico: colonias, esclavitud y rivalidades entre potencias',
  'La Armada Invencible, las colonias de América del Norte, la esclavización de africanos, la reina Nzinga, las expediciones de Cook y la rebelión de Túpac Amaru II.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás ubicar las principales potencias que compitieron en el Atlántico, cómo se fundaron las colonias inglesas de América del Norte y qué fue la trata de africanos esclavizados.",
    "Contexto: tras los viajes de exploración y la conquista de América, otras potencias europeas, como Inglaterra, Francia y los Países Bajos, se lanzaron a competir por territorios y comercio. Cada hecho de esta lección tiene causas y consecuencias que se encadenan.",
    "La rivalidad entre España e Inglaterra se vio en la derrota de la Armada Invencible, la flota que España envió contra Inglaterra (1588).",
    "En 1607 se fundó Jamestown, el primer asentamiento inglés duradero en América del Norte. En 1619 llegaron a Virginia los primeros africanos esclavizados. La trata transatlántica llevó a América a millones de personas africanas esclavizadas; las cifras se discuten y por eso aquí no se dan.",
    "En África, la reina Nzinga de Ndongo (1624) resistió durante décadas la presión portuguesa. En el Pacífico, James Cook exploró la costa este de Australia (1770). Y en los Andes, Túpac Amaru II encabezó una rebelión contra la administración colonial (1780).",
    "La guerra de los Siete Años (1756) enfrentó a las potencias europeas en varios continentes: dejó deudas y cambios en el mapa colonial.",
    "Personajes clave: Nzinga, James Cook, Túpac Amaru II.",
    "Causas y consecuencias: la fundación de Jamestown llevó a que en Virginia se asentaran plantaciones y, con ellas, a la llegada de africanos esclavizados; la guerra de los Siete Años tuvo efectos en las colonias británicas, tema de la próxima lección.",
    "Conecta con: la lección de exploración y conquista, la de la independencia de Estados Unidos, la de África medieval y la Edad Contemporánea (abolición de la esclavitud).",
    "Errores comunes: (1) creer que la esclavitud comenzó con la trata atlántica: existía antes en muchas sociedades; lo nuevo fue su escala y su carácter transoceánico; (2) pensar que los pueblos africanos solo sufrieron la trata y no resistieron: hubo resistencias, como la de Nzinga; (3) creer que Cook «descubrió» Australia, habitada desde hace decenas de miles de años."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 5,
      "titulo": "Siete hechos del mundo atlántico",
      "hechos": [
        "armada-invencible",
        "fundacion-de-jamestown",
        "africanos-esclavizados-en-virginia",
        "nzinga-reina",
        "cook-en-australia",
        "rebelion-de-tupac-amaru-ii",
        "guerra-de-los-siete-anios"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 6,
      "titulo": "Nzinga, Cook y Túpac Amaru II",
      "personajes": [
        "nzinga",
        "james-cook",
        "tupac-amaru-ii"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "De Jamestown a Virginia",
      "cadena": [
        "fundacion-de-jamestown",
        "africanos-esclavizados-en-virginia"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Derrota de la Armada Invencible» o «Fundación de Jamestown, primer asentamiento inglés duradero en América del Norte»?",
      "opciones": [
        "Fundación de Jamestown, primer asentamiento inglés duradero en América del Norte",
        "Ocurrieron en el mismo año",
        "Derrota de la Armada Invencible",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Derrota de la Armada Invencible",
      "explicacion": "Derrota de la Armada Invencible es de 1588 y Fundación de Jamestown, primer asentamiento inglés duradero en América del Norte, de 1607."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Fundación de Jamestown, primer asentamiento inglés duradero en América del Norte»?",
      "opciones": [
        "Llegan a Virginia los primeros africanos esclavizados",
        "Caída de Constantinopla en manos otomanas",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
        "Gutenberg imprime la Biblia con tipos móviles"
      ],
      "respuesta": "Llegan a Virginia los primeros africanos esclavizados",
      "explicacion": "Llegan a Virginia los primeros africanos esclavizados (1619) vino después y se apoya en «Fundación de Jamestown, primer asentamiento inglés duradero en América del Norte»; los otros hechos son anteriores a 1607, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Quién fue este personaje? Reina de Ndongo y Matamba. Resistió durante décadas la presión portuguesa en el África central.",
      "opciones": [
        "Nzinga",
        "Túpac Amaru II",
        "James Cook",
        "Atahualpa"
      ],
      "respuesta": "Nzinga",
      "explicacion": "Nzinga (1583 – 1663): resistió durante décadas la presión portuguesa en el África central."
    },
    {
      "pregunta": "¿Quién fue este personaje? Navegante británico. Exploró el Pacífico y llegó a la costa este de Australia.",
      "opciones": [
        "Túpac Amaru II",
        "Fernando de Magallanes",
        "James Cook",
        "Cristóbal Colón"
      ],
      "respuesta": "James Cook",
      "explicacion": "James Cook (1728 – 1779): exploró el Pacífico y llegó a la costa este de Australia."
    },
    {
      "pregunta": "¿En qué siglo ocurrió «Rebelión de Túpac Amaru II en los Andes»?",
      "opciones": [
        "Siglo XIX",
        "Siglo XVII",
        "Siglo XVIII",
        "Siglo XVIII a. C."
      ],
      "respuesta": "Siglo XVIII",
      "explicacion": "1780 pertenece al siglo XVIII: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    }
  ]
}$historia$::jsonb,
  5,
  true),

('historia-clase-23-independencia-de-estados-unidos', 'La independencia de Estados Unidos',
  'Del conflicto por los impuestos a la Declaración de Independencia y a la Constitución, y cómo cierra la Edad Moderna.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar por qué las colonias británicas de América del Norte se independizaron y qué se estableció en su Constitución.",
    "Contexto: las trece colonias británicas se habían fundado a lo largo de las costas de América del Norte (mundo atlántico), y las ideas de la Ilustración, como que el poder político nace de un acuerdo de los ciudadanos, circulaban entre sus habitantes. Una causa precede a su consecuencia; en esta lección hay una cadena.",
    "Tras la guerra de los Siete Años (1756), el Reino Unido quedó endeudado e impuso nuevos impuestos a sus colonias. Los colonos protestaron: sostenían que no debían pagar impuestos sin tener representantes en el Parlamento.",
    "Las colonias se enfrentaron al Reino Unido y declararon su independencia (1776). La Declaración, redactada sobre todo por Thomas Jefferson, afirmaba que todos los hombres han sido creados iguales y con derechos como la vida y la libertad, ideas de la Ilustración.",
    "George Washington comandó el ejército continental durante la guerra. Simplificación de nivel escolar: los ideales de igualdad y libertad no alcanzaron en la práctica a todos: la esclavitud continuó y las mujeres y los pueblos originarios quedaron sin esos derechos.",
    "En 1787 se redactó la Constitución de Estados Unidos, que estableció un gobierno federal con poderes divididos en tres ramas.",
    "Personajes clave: Thomas Jefferson, Benjamin Franklin, George Washington: el redactor, el científico y político que participó, y el comandante y primer presidente.",
    "Causas y consecuencias: la guerra de los Siete Años llevó a los impuestos, los impuestos a la protesta y la protesta a la independencia; la independencia llevó a la Constitución. La figura muestra la cadena principal.",
    "Conecta con: la Revolución francesa (que se apoyó en ideas similares), con las independencias de Hispanoamérica y con la Edad Contemporánea, que comienza con la Revolución francesa en 1789.",
    "Errores comunes: (1) confundir la fecha de la Declaración con el final de la guerra: la independencia se declaró antes y la guerra siguió después; (2) creer que la Constitución y la Declaración son el mismo documento; (3) pensar que la Edad Moderna termina con esta independencia: la convención escolar la cierra en 1789."
  ],
  "visuales": [
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "De la guerra a la Constitución",
      "cadena": [
        "guerra-de-los-siete-anios",
        "independencia-de-estados-unidos",
        "constitucion-de-estados-unidos"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 6,
      "titulo": "Tres protagonistas",
      "personajes": [
        "jefferson",
        "franklin",
        "washington"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Guerra de los Siete Años»?",
      "opciones": [
        "Caída de Constantinopla en manos otomanas",
        "Gutenberg imprime la Biblia con tipos móviles",
        "Declaración de Independencia de Estados Unidos",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina"
      ],
      "respuesta": "Declaración de Independencia de Estados Unidos",
      "explicacion": "Declaración de Independencia de Estados Unidos (1776) vino después y se apoya en «Guerra de los Siete Años»; los otros hechos son anteriores a 1756, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Declaración de Independencia de Estados Unidos»?",
      "opciones": [
        "Caída de Constantinopla en manos otomanas",
        "Llegada de Colón a América",
        "Se redacta la Constitución de Estados Unidos",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina"
      ],
      "respuesta": "Se redacta la Constitución de Estados Unidos",
      "explicacion": "Se redacta la Constitución de Estados Unidos (1787) vino después y se apoya en «Declaración de Independencia de Estados Unidos»; los otros hechos son anteriores a 1776, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos contribuyó a provocar «Declaración de Independencia de Estados Unidos»?",
      "opciones": [
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Batalla de Waterloo",
        "Guerra de los Siete Años",
        "Comienzo de la Primera Guerra Mundial"
      ],
      "respuesta": "Guerra de los Siete Años",
      "explicacion": "Guerra de los Siete Años (1756) fue anterior y contribuyó a provocarlo; los otros hechos ocurrieron después de 1776, así que no pueden ser una causa."
    },
    {
      "pregunta": "¿Quién fue este personaje? Presidente de Estados Unidos. Comandó el ejército continental y fue el primer presidente de Estados Unidos.",
      "opciones": [
        "Thomas Jefferson",
        "Benjamin Franklin",
        "Martín Lutero",
        "George Washington"
      ],
      "respuesta": "George Washington",
      "explicacion": "George Washington (1732 – 1799): comandó el ejército continental y fue el primer presidente de Estados Unidos."
    },
    {
      "pregunta": "¿Quién redactó principalmente la Declaración de Independencia de Estados Unidos?",
      "opciones": [
        "George Washington",
        "Benjamin Franklin",
        "Isaac Newton",
        "Thomas Jefferson"
      ],
      "respuesta": "Thomas Jefferson",
      "explicacion": "Thomas Jefferson redactó la mayor parte de la Declaración (1776); Washington comandó el ejército y Franklin participó del proceso."
    }
  ]
}$historia$::jsonb,
  6,
  true),

('historia-clase-24-revolucion-francesa-y-napoleon', 'La Revolución francesa y Napoleón',
  'El comienzo de la Edad Contemporánea: la Revolución francesa, los Derechos del Hombre, la Francia de Napoleón y su final en Waterloo.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar qué fue la Revolución francesa, por qué su comienzo se toma como frontera de la Edad Contemporánea y qué papel tuvo Napoleón.",
    "Contexto: por convención escolar, la Edad Moderna termina y la Contemporánea empieza con 1789 (otros textos usan otras fechas). Repaso de la Edad Moderna: las ideas de la Ilustración, como las de Rousseau en «Rousseau publica El contrato social» (1762), y la independencia de Estados Unidos (1776), que había seguido a la guerra de los Siete Años (1756), circulaban por Francia. Recuerda que una causa siempre precede a su consecuencia.",
    "En 1789, el pueblo de París tomó la Bastilla, una fortaleza-prisión; ese hecho simboliza el comienzo de la Revolución francesa. Poco después se aprobó la Declaración de los Derechos del Hombre y del Ciudadano (1789), que afirmó la igualdad de derechos ante la ley.",
    "Napoleón Bonaparte, un general, fue ganando poder y se coronó emperador de los franceses (1804). Su campaña en Egipto (1798) trajo el hallazgo de la piedra de Rosetta (1799), cuyo texto en tres escrituras permitió que Champollion descifrara los jeroglíficos egipcios (1822).",
    "Napoleón invadió España (1808), lo que tuvo grandes consecuencias en Hispanoamérica. Su poder terminó con la derrota en Waterloo (1815).",
    "Personajes clave: Napoleón Bonaparte y Jean-François Champollion.",
    "Causas y consecuencias: la independencia de Estados Unidos y las ideas de la Ilustración contribuyeron a la Revolución francesa; la Revolución llevó a la Declaración de Derechos. La figura une esas relaciones. Simplificación de nivel escolar: la Revolución tuvo muchas etapas y causas económicas y sociales que aquí no se detallan.",
    "Conecta con: la lección de las revoluciones de América (la haitiana y las hispanoamericanas), con la de independencia de Estados Unidos y con las que siguen sobre industrialización e imperialismo.",
    "Errores comunes: (1) creer que la Revolución francesa terminó con la toma de la Bastilla: fue el comienzo; (2) confundir a Napoleón con un rey: se coronó emperador; (3) pensar que Champollion halló la piedra de Rosetta: la halló el ejército de Napoleón y él descifró después los jeroglíficos."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 4,
      "titulo": "De 1776 a 1815",
      "hechos": [
        "independencia-de-estados-unidos",
        "contrato-social",
        "toma-de-la-bastilla",
        "derechos-del-hombre",
        "campana-de-egipto",
        "hallazgo-de-rosetta",
        "champollion-jeroglificos",
        "napoleon-emperador",
        "invasion-napoleonica-de-espana",
        "waterloo"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "De la independencia de Estados Unidos a los Derechos del Hombre",
      "cadena": [
        "guerra-de-los-siete-anios",
        "independencia-de-estados-unidos",
        "toma-de-la-bastilla",
        "derechos-del-hombre"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "De Rousseau a la Bastilla",
      "cadena": [
        "contrato-social",
        "toma-de-la-bastilla"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 6,
      "titulo": "Napoleón y Champollion",
      "personajes": [
        "napoleon",
        "champollion"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Toma de la Bastilla, comienzo de la Revolución francesa» o «Napoleón se corona emperador de los franceses»?",
      "opciones": [
        "Napoleón se corona emperador de los franceses",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero",
        "Toma de la Bastilla, comienzo de la Revolución francesa"
      ],
      "respuesta": "Toma de la Bastilla, comienzo de la Revolución francesa",
      "explicacion": "Toma de la Bastilla, comienzo de la Revolución francesa es de 1789 y Napoleón se corona emperador de los franceses, de 1804."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Toma de la Bastilla, comienzo de la Revolución francesa»?",
      "opciones": [
        "Caída de Constantinopla en manos otomanas",
        "Declaración de los Derechos del Hombre y del Ciudadano",
        "Llegada de Colón a América",
        "Guerra de los Siete Años"
      ],
      "respuesta": "Declaración de los Derechos del Hombre y del Ciudadano",
      "explicacion": "Declaración de los Derechos del Hombre y del Ciudadano (1789) vino después y se apoya en «Toma de la Bastilla, comienzo de la Revolución francesa»; los otros hechos son anteriores a 1789, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Campaña de Napoleón en Egipto»?",
      "opciones": [
        "Caída de Constantinopla en manos otomanas",
        "Llegada de Colón a América",
        "Guerra de los Siete Años",
        "Hallazgo de la piedra de Rosetta"
      ],
      "respuesta": "Hallazgo de la piedra de Rosetta",
      "explicacion": "Hallazgo de la piedra de Rosetta (1799) vino después y se apoya en «Campaña de Napoleón en Egipto»; los otros hechos son anteriores a 1798, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Quién fue este personaje? Egiptólogo francés. Descifró los jeroglíficos egipcios.",
      "opciones": [
        "Napoleón Bonaparte",
        "Jean-François Champollion",
        "Edward Jenner",
        "Charles Darwin"
      ],
      "respuesta": "Jean-François Champollion",
      "explicacion": "Jean-François Champollion (1790 – 1832): descifró los jeroglíficos egipcios."
    },
    {
      "pregunta": "Según la periodización escolar, ¿en qué época ocurrió «Batalla de Waterloo»?",
      "opciones": [
        "Edad Moderna",
        "Prehistoria",
        "Antigüedad",
        "Edad Contemporánea"
      ],
      "respuesta": "Edad Contemporánea",
      "explicacion": "1815 cae en la Edad Contemporánea (desde 1789, por convención escolar)."
    },
    {
      "pregunta": "¿Qué hecho se toma, por convención escolar, como comienzo de la Edad Contemporánea?",
      "opciones": [
        "Llegada de Colón a América",
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Caída del Imperio romano de Occidente",
        "Invención de la escritura en Sumeria"
      ],
      "respuesta": "Toma de la Bastilla, comienzo de la Revolución francesa",
      "explicacion": "La convención escolar abre la Edad Contemporánea con la Revolución francesa; otros textos proponen otras fechas."
    }
  ]
}$historia$::jsonb,
  1,
  true),

('historia-clase-25-revoluciones-e-independencias-de-america', 'La revolución haitiana y las independencias de Hispanoamérica',
  'Cómo Haití se independizó y cómo las colonias españolas de América dejaron de serlo con Bolívar y San Martín.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar cómo se independizó Haití y por qué comenzaron las independencias de Hispanoamérica, con sus protagonistas principales.",
    "Contexto: en la lección anterior viste la Revolución francesa (1789) y la invasión de España por Napoleón (1808). Repaso de la Edad Moderna: las colonias de América llevaban unos tres siglos bajo dominio europeo desde los viajes de exploración y la conquista.",
    "Haití era una colonia francesa con una economía de plantaciones sostenida por personas esclavizadas. La rebelión de 1791 fue una de las mayores rebeliones de esclavizados de la historia colonial y la única que terminó creando un Estado independiente (1804): Haití fue el primer país independiente de América Latina y el Caribe y el primero gobernado por antiguos esclavizados. Su principal líder fue Toussaint Louverture.",
    "En Hispanoamérica, la invasión napoleónica de España debilitó el poder español y comenzaron los movimientos de independencia (hacia 1810).",
    "José de San Martín cruzó los Andes con su ejército (1817) para liberar Chile y luego Perú. Simón Bolívar, desde el norte, lideró la independencia de varios países. Ambos se reunieron en la entrevista de Guayaquil (1822); los historiadores discuten qué acordaron. La batalla de Ayacucho (1824) fue decisiva para el fin del dominio español en Sudamérica.",
    "Personajes clave: Toussaint Louverture, José de San Martín, Simón Bolívar.",
    "Causas y consecuencias: la Revolución francesa influyó en la rebelión haitiana, que llevó a la independencia; la invasión napoleónica de España llevó a las independencias hispanoamericanas, que produjeron las expediciones de San Martín y las batallas como Ayacucho.",
    "Conecta con: la lección de la independencia de Estados Unidos (primer país que se independizó de un imperio europeo), la de la Revolución francesa y la de imperialismo, donde otras regiones perderán o ganarán autonomía.",
    "Errores comunes: (1) creer que todas las independencias ocurrieron a la vez: fueron procesos distintos a lo largo de años; (2) confundir a Bolívar con San Martín: uno actuó sobre todo en el norte de Sudamérica y el otro en el sur y el Pacífico; (3) creer que Haití fue una colonia española: fue francesa."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 4,
      "titulo": "De 1789 a 1824",
      "hechos": [
        "toma-de-la-bastilla",
        "rebelion-haitiana",
        "independencia-de-haiti",
        "invasion-napoleonica-de-espana",
        "independencias-hispanoamericanas",
        "cruce-de-los-andes",
        "entrevista-de-guayaquil",
        "batalla-de-ayacucho"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 6,
      "titulo": "De la Bastilla a la independencia de Haití",
      "cadena": [
        "toma-de-la-bastilla",
        "rebelion-haitiana",
        "independencia-de-haiti"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 6,
      "titulo": "De Napoleón a las independencias hispanoamericanas",
      "cadena": [
        "invasion-napoleonica-de-espana",
        "independencias-hispanoamericanas",
        "cruce-de-los-andes"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 5,
      "titulo": "Tres protagonistas",
      "personajes": [
        "toussaint-louverture",
        "jose-de-san-martin",
        "simon-bolivar"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Comienza la revolución haitiana» o «San Martín cruza los Andes»?",
      "opciones": [
        "San Martín cruza los Andes",
        "Ocurrieron en el mismo año",
        "Comienza la revolución haitiana",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Comienza la revolución haitiana",
      "explicacion": "Comienza la revolución haitiana es de 1791 y San Martín cruza los Andes, de 1817."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Comienza la revolución haitiana»?",
      "opciones": [
        "Caída de Constantinopla en manos otomanas",
        "Independencia de Haití",
        "Llegada de Colón a América",
        "Guerra de los Siete Años"
      ],
      "respuesta": "Independencia de Haití",
      "explicacion": "Independencia de Haití (1804) vino después y se apoya en «Comienza la revolución haitiana»; los otros hechos son anteriores a 1791, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Comienzan las revoluciones de independencia en Hispanoamérica»?",
      "opciones": [
        "Caída de Constantinopla en manos otomanas",
        "Llegada de Colón a América",
        "San Martín cruza los Andes",
        "Guerra de los Siete Años"
      ],
      "respuesta": "San Martín cruza los Andes",
      "explicacion": "San Martín cruza los Andes (1817) vino después y se apoya en «Comienzan las revoluciones de independencia en Hispanoamérica»; los otros hechos son anteriores a 1810, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Quién fue este personaje? Líder de la revolución haitiana. Fue el principal líder de la revolución de los esclavizados en Haití.",
      "opciones": [
        "Simón Bolívar",
        "Toussaint Louverture",
        "José de San Martín",
        "Napoleón Bonaparte"
      ],
      "respuesta": "Toussaint Louverture",
      "explicacion": "Toussaint Louverture (1743 – 1803 (fechas aproximadas)): fue el principal líder de la revolución de los esclavizados en Haití."
    },
    {
      "pregunta": "¿Quién fue este personaje? General de la independencia sudamericana. Cruzó los Andes con su ejército para liberar Chile y Perú.",
      "opciones": [
        "Simón Bolívar",
        "José de San Martín",
        "Toussaint Louverture",
        "George Washington"
      ],
      "respuesta": "José de San Martín",
      "explicacion": "José de San Martín (1778 – 1850): cruzó los Andes con su ejército para liberar Chile y Perú."
    },
    {
      "pregunta": "¿Qué potencia gobernaba Haití antes de su independencia?",
      "opciones": [
        "España",
        "El Reino Unido",
        "Portugal",
        "Francia"
      ],
      "respuesta": "Francia",
      "explicacion": "Haití era una colonia francesa; su independencia llegó en 1804."
    }
  ]
}$historia$::jsonb,
  2,
  true),

('historia-clase-26-industrializacion-y-ciencia', 'La industrialización y los avances científicos',
  'De la máquina de vapor y el ferrocarril a la vacuna, la evolución, el teléfono, el avión, la relatividad y la penicilina.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar cómo la máquina de vapor cambió el trabajo y el transporte y ubicar los grandes avances científicos y técnicos de los siglos XIX y XX.",
    "Contexto: la revolución científica de los siglos XVI y XVII y la Ilustración habían difundido la confianza en la razón y en la observación. Con ese impulso, la máquina de vapor de Watt (1769) llegó a las fábricas; y una causa siempre precede a su consecuencia.",
    "La Revolución Industrial comenzó en el Reino Unido: las fábricas y las máquinas reemplazaron muchas tareas manuales, las ciudades crecieron y cambió la vida de las familias. Un símbolo fue el ferrocarril de vapor entre Liverpool y Manchester (1830). También surgieron nuevas ideas sobre la sociedad, como las de Karl Marx.",
    "En la medicina, Jenner probó la primera vacuna, contra la viruela (1796); casi dos siglos más tarde, la Organización Mundial de la Salud declaró erradicada esa enfermedad (1980). Fleming descubrió la penicilina (1928), el primer antibiótico.",
    "En la biología, Darwin publicó El origen de las especies (1859), donde propuso la evolución por selección natural.",
    "Las comunicaciones y el transporte se aceleraron: el teléfono de Bell (1876) y el primer vuelo motorizado de los hermanos Wright (1903). En la física, Einstein publicó la teoría de la relatividad especial (1905).",
    "Personajes clave: Edward Jenner, Charles Darwin, Karl Marx, Alexander Graham Bell, Marie Curie, Albert Einstein, Alexander Fleming.",
    "Causas y consecuencias: la máquina de vapor de Watt hizo posible el ferrocarril; y la vacuna de Jenner, con el tiempo y la difusión de la vacunación, llevó a la erradicación de la viruela. Ambas cadenas están en la figura.",
    "Conecta con: la lección de imperialismo (las nuevas técnicas dieron ventajas a las potencias industriales), con la de la Primera Guerra Mundial y con el mundo actual, marcado por la ciencia y la tecnología.",
    "Errores comunes: (1) creer que Watt inventó la máquina de vapor: la mejoró; (2) confundir vacuna y antibiótico: la vacuna previene enfermedades y el antibiótico las trata; (3) creer que Darwin habló de que «el ser humano viene del mono»: propuso la selección natural como mecanismo de evolución."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 5,
      "titulo": "Del vapor a la penicilina",
      "hechos": [
        "maquina-de-vapor-de-watt",
        "primer-ferrocarril-publico",
        "vacuna-de-jenner",
        "viruela-erradicada",
        "origen-de-las-especies",
        "telefono-de-bell",
        "primer-vuelo-motorizado",
        "relatividad-especial",
        "penicilina"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 8,
      "titulo": "De la máquina de vapor al ferrocarril",
      "cadena": [
        "maquina-de-vapor-de-watt",
        "primer-ferrocarril-publico"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 8,
      "titulo": "De la vacuna a la erradicación de la viruela",
      "cadena": [
        "vacuna-de-jenner",
        "viruela-erradicada"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 7,
      "titulo": "Siete protagonistas",
      "personajes": [
        "jenner",
        "darwin",
        "marx",
        "bell",
        "marie-curie",
        "einstein",
        "fleming"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Watt patenta su máquina de vapor» o «Bell patenta el teléfono»?",
      "opciones": [
        "Bell patenta el teléfono",
        "Ocurrieron en el mismo año",
        "Watt patenta su máquina de vapor",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Watt patenta su máquina de vapor",
      "explicacion": "Watt patenta su máquina de vapor es de 1769 y Bell patenta el teléfono, de 1876."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Watt patenta su máquina de vapor»?",
      "opciones": [
        "Caída de Constantinopla en manos otomanas",
        "Llegada de Colón a América",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
        "Inauguración del ferrocarril de vapor entre Liverpool y Manchester"
      ],
      "respuesta": "Inauguración del ferrocarril de vapor entre Liverpool y Manchester",
      "explicacion": "Inauguración del ferrocarril de vapor entre Liverpool y Manchester (1830) vino después y se apoya en «Watt patenta su máquina de vapor»; los otros hechos son anteriores a 1769, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Jenner prueba la vacuna contra la viruela»?",
      "opciones": [
        "Caída de Constantinopla en manos otomanas",
        "Llegada de Colón a América",
        "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina",
        "La OMS declara erradicada la viruela"
      ],
      "respuesta": "La OMS declara erradicada la viruela",
      "explicacion": "La OMS declara erradicada la viruela (1980) vino después y se apoya en «Jenner prueba la vacuna contra la viruela»; los otros hechos son anteriores a 1796, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Quién fue este personaje? Naturalista inglés. Propuso la evolución por selección natural en El origen de las especies.",
      "opciones": [
        "Albert Einstein",
        "Alexander Fleming",
        "Charles Darwin",
        "Edward Jenner"
      ],
      "respuesta": "Charles Darwin",
      "explicacion": "Charles Darwin (1809 – 1882): propuso la evolución por selección natural en El origen de las especies."
    },
    {
      "pregunta": "¿Quién fue este personaje? Científico escocés. Descubrió la penicilina en 1928.",
      "opciones": [
        "Alexander Fleming",
        "Edward Jenner",
        "Charles Darwin",
        "Marie Curie"
      ],
      "respuesta": "Alexander Fleming",
      "explicacion": "Alexander Fleming (1881 – 1955): descubrió la penicilina en 1928."
    },
    {
      "pregunta": "¿En qué siglo ocurrió «Einstein publica la teoría de la relatividad especial»?",
      "opciones": [
        "Siglo XX",
        "Siglo XXI",
        "Siglo XIX",
        "Siglo XX a. C."
      ],
      "respuesta": "Siglo XX",
      "explicacion": "1905 pertenece al siglo XX: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás."
    }
  ]
}$historia$::jsonb,
  3,
  true),

('historia-clase-27-imperialismo-y-abolicion-de-la-esclavitud', 'Imperialismo, abolición de la esclavitud y nuevos Estados',
  'La abolición de la esclavitud en el Imperio británico y en Estados Unidos, la guerra del Opio, la modernización de Japón, el reparto de África y las resistencias.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar cómo terminó la esclavitud legal en el Imperio británico y en Estados Unidos, qué fue el imperialismo del siglo XIX y cómo respondieron algunos Estados de Asia y África.",
    "Contexto: la trata de africanos esclavizados había crecido en el mundo atlántico durante siglos. En Asia, Japón estaba bajo el shogunato Tokugawa y China bajo la dinastía Qing; en África había Estados como Mali en la Edad Media y otros después. Con la industrialización, las potencias europeas ganaron ventajas técnicas y extendieron su control. Una causa precede a su consecuencia.",
    "La abolición: el Reino Unido aprobó la Ley de Abolición de la Esclavitud en su Imperio (1833). En Estados Unidos, la guerra de Secesión (1861) llevó a la Proclamación de Emancipación de Lincoln (1863); la abolición completa en el país llegó después.",
    "El imperialismo: las potencias europeas ampliaron su dominio sobre Asia y África. La primera guerra del Opio (1839) enfrentó a China con el Reino Unido. El canal de Suez (1869) acortó la ruta a Asia, y la Conferencia de Berlín (1884) reguló el reparto colonial de África entre potencias europeas, sin participación de los pueblos africanos.",
    "No todos los Estados fueron dominados. Japón se modernizó tras la Restauración Meiji (1868); Etiopía derrotó a Italia en la batalla de Adua (1896); en África austral, Shaka formó el reino zulú (hacia 1816); China terminó el imperio y proclamó la República (1912); y Nueva Zelanda fue el primer país en conceder el voto a las mujeres (1893).",
    "Personajes clave: Abraham Lincoln, Otto von Bismarck, Emperador Meiji, Menelik II, Shaka, Sun Yat-sen, Rabindranath Tagore.",
    "Causas y consecuencias: la guerra de Secesión llevó a la Proclamación de Emancipación; el desequilibrio de poder entre potencias industriales y otros Estados llevó a guerras como la del Opio; y la Restauración Meiji fue una respuesta japonesa a ese mundo. Simplificación de nivel escolar: cada región tuvo su propia historia y sus propios protagonistas.",
    "Conecta con: la lección de las independencias americanas (otra forma de terminar el dominio colonial), la de la Primera Guerra Mundial (las rivalidades imperiales fueron una de sus causas) y la de la descolonización, siglo XX.",
    "Errores comunes: (1) creer que la esclavitud terminó en todo el mundo a la vez: fue un proceso con fechas distintas en cada lugar; (2) creer que todo África fue colonizado: Etiopía mantuvo su independencia (con una breve ocupación en el siglo XX); (3) confundir Meiji con el shogunato: Meiji lo terminó."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 5,
      "titulo": "De 1833 a 1869",
      "hechos": [
        "abolicion-esclavitud-imperio-britanico",
        "primera-guerra-del-opio",
        "guerra-de-secesion",
        "proclama-de-emancipacion",
        "restauracion-meiji",
        "canal-de-suez"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 5,
      "titulo": "De hacia 1816 a 1912",
      "hechos": [
        "shaka-reino-zulu",
        "conferencia-de-berlin",
        "voto-femenino-nueva-zelanda",
        "batalla-de-adua",
        "republica-china"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "De la guerra de Secesión a la Emancipación",
      "cadena": [
        "guerra-de-secesion",
        "proclama-de-emancipacion"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 6,
      "titulo": "Los protagonistas",
      "personajes": [
        "lincoln",
        "bismarck",
        "emperador-meiji",
        "menelik-ii",
        "shaka",
        "sun-yat-sen",
        "tagore"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Ley de Abolición de la Esclavitud en el Imperio británico» o «Comienzo de la guerra de Secesión de Estados Unidos»?",
      "opciones": [
        "Comienzo de la guerra de Secesión de Estados Unidos",
        "Ocurrieron en el mismo año",
        "Ley de Abolición de la Esclavitud en el Imperio británico",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Ley de Abolición de la Esclavitud en el Imperio británico",
      "explicacion": "Ley de Abolición de la Esclavitud en el Imperio británico es de 1833 y Comienzo de la guerra de Secesión de Estados Unidos, de 1861."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Comienzo de la guerra de Secesión de Estados Unidos»?",
      "opciones": [
        "Caída de Constantinopla en manos otomanas",
        "Proclamación de Emancipación de Lincoln",
        "Llegada de Colón a América",
        "Toma de la Bastilla, comienzo de la Revolución francesa"
      ],
      "respuesta": "Proclamación de Emancipación de Lincoln",
      "explicacion": "Proclamación de Emancipación de Lincoln (1863) vino después y se apoya en «Comienzo de la guerra de Secesión de Estados Unidos»; los otros hechos son anteriores a 1861, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Comienza la primera guerra del Opio» o «Conferencia de Berlín sobre el reparto colonial de África»?",
      "opciones": [
        "Conferencia de Berlín sobre el reparto colonial de África",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero",
        "Comienza la primera guerra del Opio"
      ],
      "respuesta": "Comienza la primera guerra del Opio",
      "explicacion": "Comienza la primera guerra del Opio es de 1839 y Conferencia de Berlín sobre el reparto colonial de África, de 1884."
    },
    {
      "pregunta": "¿Quién fue este personaje? Emperador de Etiopía. Derrotó a Italia en la batalla de Adua.",
      "opciones": [
        "Abraham Lincoln",
        "Otto von Bismarck",
        "Menelik II",
        "Sun Yat-sen"
      ],
      "respuesta": "Menelik II",
      "explicacion": "Menelik II (1844 – 1913): derrotó a Italia en la batalla de Adua."
    },
    {
      "pregunta": "¿Quién fue este personaje? Presidente de Estados Unidos. Fue presidente durante la guerra de Secesión y proclamó la emancipación de los esclavizados.",
      "opciones": [
        "Otto von Bismarck",
        "Abraham Lincoln",
        "Menelik II",
        "George Washington"
      ],
      "respuesta": "Abraham Lincoln",
      "explicacion": "Abraham Lincoln (1809 – 1865): fue presidente durante la guerra de Secesión y proclamó la emancipación de los esclavizados."
    },
    {
      "pregunta": "¿Qué reguló la Conferencia de Berlín?",
      "opciones": [
        "El fin de la guerra de Secesión",
        "La independencia de Haití",
        "El reparto colonial de África entre potencias europeas",
        "La unificación de China"
      ],
      "respuesta": "El reparto colonial de África entre potencias europeas",
      "explicacion": "La Conferencia de Berlín (1884) reguló el reparto colonial de África entre potencias europeas, sin participación de los pueblos africanos."
    }
  ]
}$historia$::jsonb,
  4,
  true),

('historia-clase-28-primera-guerra-mundial-revolucion-rusa-y-entreguerras', 'La Primera Guerra Mundial, la Revolución rusa y los años de entreguerras',
  'De Sarajevo a la Primera Guerra Mundial, la Revolución rusa, el Tratado de Versalles, la fundación de la URSS y la crisis de 1929.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar qué desencadenó la Primera Guerra Mundial, qué fue la Revolución rusa y qué ocurrió en los años de entreguerras, con sus fechas y protagonistas.",
    "Contexto: en la lección anterior viste que las potencias europeas competían por imperios. Y recuerda que una cadena de dos pasos une tres hechos: A provoca B y B provoca C; en esta lección hay varias.",
    "En 1914 fue asesinado en Sarajevo el archiduque Francisco Fernando, heredero del trono austrohúngaro. A partir de ese hecho, los sistemas de alianzas llevaron a que se enfrentaran las principales potencias europeas y comenzó la Primera Guerra Mundial (1914), que se extendió a otros continentes.",
    "Durante la guerra, en Rusia se produjo la revolución (1917): los bolcheviques, liderados por Lenin, tomaron el poder. Poco después se fundó la Unión Soviética (1922).",
    "La guerra terminó con un armisticio (1918) y las potencias vencedoras firmaron el Tratado de Versalles (1919).",
    "En 1929 se produjo el colapso de la bolsa de Nueva York y comenzó la Gran Depresión (1929), una crisis económica mundial con desempleo y cierres de empresas. En la India, Gandhi encabezó la Marcha de la Sal (1930), una acción no violenta contra el impuesto británico a la sal.",
    "Personajes clave: Vladímir Lenin (líder bolchevique) y Mahatma Gandhi (líder del movimiento de independencia de la India).",
    "Causas y consecuencias: el asesinato de Sarajevo llevó a la guerra; la guerra abrió el camino de la Revolución rusa y de la fundación de la URSS; la guerra terminó con el armisticio y con Versalles; y la crisis de 1929 llevó a la Gran Depresión. Las cuatro cadenas están en las figuras.",
    "Conecta con: la lección de imperialismo (causas de fondo), con la de la Segunda Guerra Mundial (que ocurrió pocos años después) y con la de descolonización (la Marcha de la Sal es un episodio de la independencia de la India).",
    "Errores comunes: (1) creer que el asesinato causó por sí solo la guerra: fue el detonante de tensiones acumuladas; (2) confundir armisticio con tratado de paz: el primero detiene los combates y el segundo fija las condiciones de la paz; (3) creer que la URSS se fundó en 1917: la Revolución fue en 1917 y la URSS en 1922."
  ],
  "visuales": [
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "De Sarajevo a la URSS",
      "cadena": [
        "asesinato-de-francisco-fernando",
        "primera-guerra-mundial",
        "revolucion-rusa",
        "fundacion-de-la-urss"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "De la guerra a Versalles",
      "cadena": [
        "primera-guerra-mundial",
        "armisticio-de-1918",
        "tratado-de-versalles"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 7,
      "titulo": "De la crisis de 1929 a la Depresión",
      "cadena": [
        "crisis-de-1929",
        "gran-depresion"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 6,
      "titulo": "De 1914 a 1930",
      "hechos": [
        "asesinato-de-francisco-fernando",
        "primera-guerra-mundial",
        "revolucion-rusa",
        "armisticio-de-1918",
        "tratado-de-versalles",
        "fundacion-de-la-urss",
        "crisis-de-1929",
        "gran-depresion",
        "marcha-de-la-sal"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 7,
      "titulo": "Lenin y Gandhi",
      "personajes": [
        "lenin",
        "gandhi"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Asesinato del archiduque Francisco Fernando en Sarajevo»?",
      "opciones": [
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Batalla de Waterloo",
        "Restauración Meiji en Japón",
        "Comienzo de la Primera Guerra Mundial"
      ],
      "respuesta": "Comienzo de la Primera Guerra Mundial",
      "explicacion": "Comienzo de la Primera Guerra Mundial (1914) vino después y se apoya en «Asesinato del archiduque Francisco Fernando en Sarajevo»; los otros hechos son anteriores a 1914, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Comienzo de la Primera Guerra Mundial»?",
      "opciones": [
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Batalla de Waterloo",
        "Restauración Meiji en Japón",
        "Revolución de Octubre en Rusia"
      ],
      "respuesta": "Revolución de Octubre en Rusia",
      "explicacion": "Revolución de Octubre en Rusia (1917) vino después y se apoya en «Comienzo de la Primera Guerra Mundial»; los otros hechos son anteriores a 1914, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Crisis bursátil en Wall Street»?",
      "opciones": [
        "Comienza la Gran Depresión",
        "Comienzo de la Primera Guerra Mundial",
        "Revolución de Octubre en Rusia",
        "Tratado de Versalles"
      ],
      "respuesta": "Comienza la Gran Depresión",
      "explicacion": "Comienza la Gran Depresión (1929) vino después y se apoya en «Crisis bursátil en Wall Street»; los otros hechos son anteriores a 1929, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Revolución de Octubre en Rusia» o «Crisis bursátil en Wall Street»?",
      "opciones": [
        "Revolución de Octubre en Rusia",
        "Crisis bursátil en Wall Street",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Revolución de Octubre en Rusia",
      "explicacion": "Revolución de Octubre en Rusia es de 1917 y Crisis bursátil en Wall Street, de 1929."
    },
    {
      "pregunta": "¿Quién fue este personaje? Líder bolchevique ruso. Encabezó a los bolcheviques en la Revolución de octubre de 1917.",
      "opciones": [
        "Mahatma Gandhi",
        "Winston Churchill",
        "Vladímir Lenin",
        "Jawaharlal Nehru"
      ],
      "respuesta": "Vladímir Lenin",
      "explicacion": "Vladímir Lenin (1870 – 1924): encabezó a los bolcheviques en la Revolución de octubre de 1917."
    },
    {
      "pregunta": "¿Cuál es la diferencia entre un armisticio y un tratado de paz?",
      "opciones": [
        "El armisticio detiene los combates; el tratado fija las condiciones de la paz",
        "Son lo mismo",
        "El armisticio lo firma solo un país y el tratado, todos",
        "El tratado detiene los combates y el armisticio fija la paz"
      ],
      "respuesta": "El armisticio detiene los combates; el tratado fija las condiciones de la paz",
      "explicacion": "El armisticio (1918) detuvo los combates de la Primera Guerra Mundial; el Tratado de Versalles (1919) fijó las condiciones de la paz."
    }
  ]
}$historia$::jsonb,
  5,
  true),

('historia-clase-29-segunda-guerra-mundial', 'La Segunda Guerra Mundial',
  'El comienzo de la guerra, Pearl Harbor, Normandía, la liberación de Auschwitz, las bombas atómicas y el final de la guerra, con sus fechas y protagonistas.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás ubicar en orden los hechos principales de la Segunda Guerra Mundial y reconocer a sus protagonistas, con fechas y sin juicios.",
    "Contexto: la Primera Guerra Mundial y la crisis de 1929 dejaron un mundo inestable. Como esta lección trata un tema reciente, recuerda la técnica «Hechos y opiniones»: aquí se enseñan solo los hechos de amplio consenso, con su fecha y sus protagonistas, sin juicios ni cifras discutidas.",
    "Alemania, gobernada por el régimen de Adolf Hitler, invadió Polonia (1939) y comenzó la Segunda Guerra Mundial (1939). La guerra se extendió a Europa, África, Asia y el Pacífico.",
    "En 1941, Japón atacó la base estadounidense de Pearl Harbor, en Hawái; después Estados Unidos entró en la guerra. En 1944 las fuerzas aliadas desembarcaron en Normandía, en el norte de Francia, el llamado Día D.",
    "En 1945, tropas soviéticas liberaron el campo de Auschwitz, uno de los campos de concentración y exterminio del régimen nazi. Los ejércitos aliados y soviéticos fueron encontrando otros campos al avanzar. Su estudio requiere más espacio del que tiene esta lección, por eso aquí no se dan cifras.",
    "Estados Unidos lanzó bombas atómicas sobre las ciudades japonesas de Hiroshima y Nagasaki (1945), y la guerra terminó (1945).",
    "Personajes clave: Adolf Hitler, Winston Churchill, Iósif Stalin, Franklin D. Roosevelt: el jefe de gobierno de Alemania, el primer ministro del Reino Unido, el líder de la Unión Soviética y el presidente de Estados Unidos.",
    "Causas y consecuencias: la invasión de Polonia llevó al comienzo de la guerra; el ataque a Pearl Harbor llevó a Estados Unidos a entrar en ella. Simplificación de nivel escolar: las causas de fondo de la guerra son numerosas y de ellas se ocupan los historiadores.",
    "Conecta con: la lección de la Primera Guerra Mundial y las crisis de entreguerras, y con la siguiente, donde se crean las Naciones Unidas y comienza la Guerra Fría.",
    "Errores comunes: (1) confundir la fecha de comienzo (1939) con la de la entrada de Estados Unidos (1941): son dos hechos distintos; (2) creer que la guerra fue solo europea: se combatió en varios continentes; (3) atribuir a una sola persona el desarrollo de la guerra: participaron gobiernos, ejércitos y sociedades enteras."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 6,
      "titulo": "De 1939 a 1945",
      "hechos": [
        "invasion-de-polonia",
        "segunda-guerra-mundial",
        "pearl-harbor",
        "desembarco-de-normandia",
        "liberacion-de-auschwitz",
        "bombas-atomicas",
        "fin-de-la-segunda-guerra-mundial"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 8,
      "titulo": "De la invasión de Polonia a la guerra",
      "cadena": [
        "invasion-de-polonia",
        "segunda-guerra-mundial"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 7,
      "titulo": "Cuatro protagonistas",
      "personajes": [
        "hitler",
        "churchill",
        "stalin",
        "franklin-roosevelt"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Alemania invade Polonia» o «Ataque a Pearl Harbor»?",
      "opciones": [
        "Alemania invade Polonia",
        "Ataque a Pearl Harbor",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Alemania invade Polonia",
      "explicacion": "Alemania invade Polonia es de 1939 y Ataque a Pearl Harbor, de 1941."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Desembarco de Normandía (Día D)» o «Bombas atómicas sobre Hiroshima y Nagasaki»?",
      "opciones": [
        "Bombas atómicas sobre Hiroshima y Nagasaki",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero",
        "Desembarco de Normandía (Día D)"
      ],
      "respuesta": "Desembarco de Normandía (Día D)",
      "explicacion": "Desembarco de Normandía (Día D) es de 1944 y Bombas atómicas sobre Hiroshima y Nagasaki, de 1945."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Alemania invade Polonia»?",
      "opciones": [
        "Comienzo de la Segunda Guerra Mundial",
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Batalla de Waterloo",
        "Restauración Meiji en Japón"
      ],
      "respuesta": "Comienzo de la Segunda Guerra Mundial",
      "explicacion": "Comienzo de la Segunda Guerra Mundial (1939) vino después y se apoya en «Alemania invade Polonia»; los otros hechos son anteriores a 1939, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Quién fue este personaje? Primer ministro británico. Fue primer ministro del Reino Unido durante la mayor parte de la Segunda Guerra Mundial.",
      "opciones": [
        "Franklin D. Roosevelt",
        "Iósif Stalin",
        "Adolf Hitler",
        "Winston Churchill"
      ],
      "respuesta": "Winston Churchill",
      "explicacion": "Winston Churchill (1874 – 1965): fue primer ministro del Reino Unido durante la mayor parte de la Segunda Guerra Mundial."
    },
    {
      "pregunta": "¿Quién fue este personaje? Presidente de Estados Unidos. Fue presidente durante la Gran Depresión y casi toda la Segunda Guerra Mundial.",
      "opciones": [
        "Winston Churchill",
        "Iósif Stalin",
        "Franklin D. Roosevelt",
        "Abraham Lincoln"
      ],
      "respuesta": "Franklin D. Roosevelt",
      "explicacion": "Franklin D. Roosevelt (1882 – 1945): fue presidente durante la Gran Depresión y casi toda la Segunda Guerra Mundial."
    },
    {
      "pregunta": "Según la periodización escolar, ¿en qué época ocurrió «Desembarco de Normandía (Día D)»?",
      "opciones": [
        "Edad Moderna",
        "Prehistoria",
        "Edad Contemporánea",
        "Antigüedad"
      ],
      "respuesta": "Edad Contemporánea",
      "explicacion": "1944 cae en la Edad Contemporánea (desde 1789, por convención escolar)."
    }
  ]
}$historia$::jsonb,
  6,
  true),

('historia-clase-30-onu-derechos-humanos-y-guerra-fria', 'Las Naciones Unidas, los derechos humanos y la Guerra Fría',
  'La ONU, la Declaración Universal de Derechos Humanos, el comienzo y los hitos de la Guerra Fría, la carrera espacial y el movimiento por los derechos civiles.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar qué son las Naciones Unidas y la Declaración Universal de Derechos Humanos y ubicar los hechos principales de la Guerra Fría hasta la llegada a la Luna, con fechas y protagonistas.",
    "Contexto: la lección anterior terminó con el final de la Segunda Guerra Mundial. Como este tema es reciente, se sigue la técnica «Hechos y opiniones»: aquí solo hay hechos de amplio consenso, sin juicios ni interpretación.",
    "Las Naciones Unidas, una organización internacional para mantener la paz y promover la cooperación entre países, se fundaron en 1945. En 1948, su Asamblea General aprobó la Declaración Universal de Derechos Humanos; el comité que la redactó lo presidió Eleanor Roosevelt. Es una declaración de principios: no es un tratado obligatorio.",
    "La Guerra Fría fue una rivalidad política, económica y militar entre Estados Unidos y la Unión Soviética y sus aliados, sin combate directo entre ambas potencias; se sitúa, por convención, a partir de 1947. En 1949, Mao Zedong proclamó la República Popular China.",
    "En Berlín se construyó el Muro (1961), que dividió la ciudad. En la crisis de los misiles de Cuba (1962), Estados Unidos y la Unión Soviética se enfrentaron por misiles soviéticos instalados en Cuba; la crisis se resolvió sin guerra.",
    "La rivalidad también fue tecnológica: la URSS lanzó el satélite Sputnik 1 (1957) y envió al primer ser humano al espacio, Yuri Gagarin (1961). Estados Unidos llevó a la Luna a Neil Armstrong con la misión Apolo 11 (1969).",
    "En Estados Unidos, el movimiento por los derechos civiles, liderado por Martin Luther King, reunió a una multitud en la Marcha sobre Washington (1963), donde pronunció el discurso «Tengo un sueño».",
    "Personajes clave: Eleanor Roosevelt, Mao Zedong, John F. Kennedy, Martin Luther King Jr., Yuri Gagarin, Neil Armstrong.",
    "Causas y consecuencias: la fundación de la ONU llevó a la Declaración Universal; el final de la guerra abrió la Guerra Fría; esta produjo el Muro, la crisis de los misiles y la carrera espacial; y el Sputnik llevó a Gagarin y a la llegada a la Luna. Las cadenas están en las figuras.",
    "Conecta con: la lección de la Segunda Guerra Mundial, con la de descolonización y el fin de la Guerra Fría, y con la lección de las revoluciones (los derechos del hombre de 1789).",
    "Errores comunes: (1) creer que la Guerra Fría fue una guerra con batallas entre las dos potencias: la rivalidad se expresó en otros terrenos; (2) confundir la ONU con la Declaración: la ONU es la organización; la Declaración es un documento que aprobó; (3) creer que la carrera espacial terminó con Gagarin: siguió hasta la llegada a la Luna."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 6,
      "titulo": "De 1945 a 1949",
      "hechos": [
        "fundacion-de-la-onu",
        "comienzo-de-la-guerra-fria",
        "declaracion-de-derechos-humanos",
        "republica-popular-china"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 6,
      "titulo": "De 1957 a 1969",
      "hechos": [
        "sputnik",
        "muro-de-berlin",
        "vuelo-de-gagarin",
        "crisis-de-los-misiles",
        "marcha-sobre-washington",
        "llegada-a-la-luna"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 9,
      "titulo": "De la ONU a la Declaración Universal",
      "cadena": [
        "segunda-guerra-mundial",
        "fundacion-de-la-onu",
        "declaracion-de-derechos-humanos"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 9,
      "titulo": "De la posguerra a la Guerra Fría y a los misiles",
      "cadena": [
        "fin-de-la-segunda-guerra-mundial",
        "comienzo-de-la-guerra-fria",
        "crisis-de-los-misiles"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 9,
      "titulo": "Del Sputnik a la Luna",
      "cadena": [
        "sputnik",
        "vuelo-de-gagarin",
        "llegada-a-la-luna"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 8,
      "titulo": "Seis protagonistas",
      "personajes": [
        "eleanor-roosevelt",
        "mao-zedong",
        "kennedy",
        "martin-luther-king",
        "gagarin",
        "armstrong"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Fundación de la Organización de las Naciones Unidas»?",
      "opciones": [
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Batalla de Waterloo",
        "Comienzo de la Primera Guerra Mundial",
        "Declaración Universal de Derechos Humanos"
      ],
      "respuesta": "Declaración Universal de Derechos Humanos",
      "explicacion": "Declaración Universal de Derechos Humanos (1948) vino después y se apoya en «Fundación de la Organización de las Naciones Unidas»; los otros hechos son anteriores a 1945, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Lanzamiento del Sputnik 1»?",
      "opciones": [
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Batalla de Waterloo",
        "Comienzo de la Primera Guerra Mundial",
        "Yuri Gagarin, primer ser humano en el espacio"
      ],
      "respuesta": "Yuri Gagarin, primer ser humano en el espacio",
      "explicacion": "Yuri Gagarin, primer ser humano en el espacio (1961) vino después y se apoya en «Lanzamiento del Sputnik 1»; los otros hechos son anteriores a 1957, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Yuri Gagarin, primer ser humano en el espacio»?",
      "opciones": [
        "Llegada del Apolo 11 a la Luna",
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Batalla de Waterloo",
        "Comienzo de la Primera Guerra Mundial"
      ],
      "respuesta": "Llegada del Apolo 11 a la Luna",
      "explicacion": "Llegada del Apolo 11 a la Luna (1969) vino después y se apoya en «Yuri Gagarin, primer ser humano en el espacio»; los otros hechos son anteriores a 1961, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál ocurrió primero: «Construcción del Muro de Berlín» o «Llegada del Apolo 11 a la Luna»?",
      "opciones": [
        "Construcción del Muro de Berlín",
        "Llegada del Apolo 11 a la Luna",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero"
      ],
      "respuesta": "Construcción del Muro de Berlín",
      "explicacion": "Construcción del Muro de Berlín es de 1961 y Llegada del Apolo 11 a la Luna, de 1969."
    },
    {
      "pregunta": "¿Quién fue este personaje? Diplomática estadounidense. Presidió el comité que redactó la Declaración Universal de Derechos Humanos.",
      "opciones": [
        "Eleanor Roosevelt",
        "Franklin D. Roosevelt",
        "Marie Curie",
        "John F. Kennedy"
      ],
      "respuesta": "Eleanor Roosevelt",
      "explicacion": "Eleanor Roosevelt (1884 – 1962): presidió el comité que redactó la Declaración Universal de Derechos Humanos."
    },
    {
      "pregunta": "¿Quién fue este personaje? Líder del movimiento por los derechos civiles. Lideró con métodos no violentos el movimiento por los derechos civiles en Estados Unidos.",
      "opciones": [
        "Martin Luther King Jr.",
        "John F. Kennedy",
        "Nelson Mandela",
        "Mahatma Gandhi"
      ],
      "respuesta": "Martin Luther King Jr.",
      "explicacion": "Martin Luther King Jr. (1929 – 1968): lideró con métodos no violentos el movimiento por los derechos civiles en Estados Unidos."
    }
  ]
}$historia$::jsonb,
  7,
  true),

('historia-clase-31-descolonizacion-y-mundo-actual', 'La descolonización, el fin de la Guerra Fría y el mundo actual',
  'La independencia de la India y de Ghana, el Año de África, Mandela, la caída del Muro de Berlín, la disolución de la URSS y la pandemia de COVID-19.',
  'historia',
  $historia${
  "pasos": [
    "Objetivo: al terminar podrás explicar qué fue la descolonización, ubicar el fin de la Guerra Fría y reconocer los hechos más importantes de las últimas décadas, con fechas y protagonistas.",
    "Contexto: en la lección anterior viste la Guerra Fría; en la de imperialismo, cómo las potencias europeas dominaron gran parte de Asia y África. Como este tema es reciente, se sigue la técnica «Hechos y opiniones»: solo hechos de amplio consenso, sin juicios ni cifras discutidas.",
    "Tras la Segunda Guerra Mundial, muchos pueblos de Asia y África dejaron de ser colonias. En 1947 la India y Pakistán se independizaron del Reino Unido, en una partición acompañada de grandes desplazamientos de población; Jawaharlal Nehru fue el primer jefe de gobierno de la India independiente. En 1957 Ghana, liderada por Kwame Nkrumah, fue uno de los primeros países del África subsahariana en lograrlo y 1960 se llama el «Año de África» por las muchas independencias.",
    "En Sudáfrica, el sistema de segregación racial legal, el apartheid, terminó con un proceso político. Nelson Mandela salió de prisión (1990) y fue elegido presidente en las primeras elecciones multirraciales (1994).",
    "En Europa, cayó el Muro de Berlín (1989) y Alemania se reunificó (1990). La Unión Soviética, dirigida por Mijaíl Gorbachov, se disolvió (1991), y con ella terminó la Guerra Fría.",
    "El mundo actual: en la década de 1990 se abrió al público la World Wide Web, inventada por Tim Berners-Lee, que cambió la comunicación; y la Organización Mundial de la Salud declaró la pandemia de COVID-19 (2020).",
    "Personajes clave: Jawaharlal Nehru, Kwame Nkrumah, Nelson Mandela, Mijaíl Gorbachov, Tim Berners-Lee.",
    "Causas y consecuencias: la independencia de Ghana llevó a que muchos países africanos siguieran ese camino; la salida de Mandela de la cárcel llevó a su elección como presidente; y la caída del Muro llevó a la reunificación alemana. Estas cadenas están en las figuras.",
    "Conecta con: la lección de la Guerra Fría, la de imperialismo, la de la Revolución industrial y la ciencia (la web) y todo el curso: la historia sigue.",
    "Errores comunes: (1) creer que todas las colonias se independizaron el mismo año: hubo procesos distintos a lo largo de décadas; (2) confundir la caída del Muro (1989) con la reunificación alemana (1990) o la disolución de la URSS (1991): son tres hechos distintos; (3) mezclar hechos con opiniones sobre ellos: en historia reciente conviene separarlos siempre."
  ],
  "visuales": [
    {
      "tipo": "historia.linea",
      "despuesDePaso": 7,
      "titulo": "De 1947 a 1990",
      "hechos": [
        "independencia-de-la-india",
        "independencia-de-ghana",
        "anio-de-africa",
        "caida-del-muro-de-berlin",
        "mandela-libre",
        "reunificacion-de-alemania"
      ]
    },
    {
      "tipo": "historia.linea",
      "despuesDePaso": 7,
      "titulo": "De 1991 a 2020",
      "hechos": [
        "disolucion-de-la-urss",
        "mandela-presidente",
        "pandemia-de-covid-19"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 8,
      "titulo": "De Ghana al Año de África",
      "cadena": [
        "independencia-de-ghana",
        "anio-de-africa"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 8,
      "titulo": "De la salida de prisión a la presidencia",
      "cadena": [
        "mandela-libre",
        "mandela-presidente"
      ]
    },
    {
      "tipo": "historia.causas",
      "despuesDePaso": 8,
      "titulo": "De la caída del Muro a la reunificación",
      "cadena": [
        "caida-del-muro-de-berlin",
        "reunificacion-de-alemania"
      ]
    },
    {
      "tipo": "historia.personaje",
      "despuesDePaso": 7,
      "titulo": "Cinco protagonistas",
      "personajes": [
        "nehru",
        "nkrumah",
        "mandela",
        "gorbachov",
        "berners-lee"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál ocurrió primero: «Independencia de Ghana» o «Caída del Muro de Berlín»?",
      "opciones": [
        "Caída del Muro de Berlín",
        "Ocurrieron en el mismo año",
        "No se puede saber cuál fue primero",
        "Independencia de Ghana"
      ],
      "respuesta": "Independencia de Ghana",
      "explicacion": "Independencia de Ghana es de 1957 y Caída del Muro de Berlín, de 1989."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Independencia de Ghana»?",
      "opciones": [
        "Año de África: independencia de numerosos países africanos",
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Batalla de Waterloo",
        "Comienzo de la Primera Guerra Mundial"
      ],
      "respuesta": "Año de África: independencia de numerosos países africanos",
      "explicacion": "Año de África: independencia de numerosos países africanos (1960) vino después y se apoya en «Independencia de Ghana»; los otros hechos son anteriores a 1957, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Nelson Mandela sale de prisión»?",
      "opciones": [
        "Mandela es elegido presidente en las primeras elecciones multirraciales de Sudáfrica",
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Batalla de Waterloo",
        "Comienzo de la Primera Guerra Mundial"
      ],
      "respuesta": "Mandela es elegido presidente en las primeras elecciones multirraciales de Sudáfrica",
      "explicacion": "Mandela es elegido presidente en las primeras elecciones multirraciales de Sudáfrica (1994) vino después y se apoya en «Nelson Mandela sale de prisión»; los otros hechos son anteriores a 1990, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Cuál de estos hechos fue consecuencia de «Caída del Muro de Berlín»?",
      "opciones": [
        "Reunificación de Alemania",
        "Toma de la Bastilla, comienzo de la Revolución francesa",
        "Batalla de Waterloo",
        "Comienzo de la Primera Guerra Mundial"
      ],
      "respuesta": "Reunificación de Alemania",
      "explicacion": "Reunificación de Alemania (1990) vino después y se apoya en «Caída del Muro de Berlín»; los otros hechos son anteriores a 1989, así que no pueden ser su consecuencia."
    },
    {
      "pregunta": "¿Quién fue este personaje? Líder de la independencia de Ghana. Lideró la independencia de Ghana y fue su primer jefe de gobierno.",
      "opciones": [
        "Kwame Nkrumah",
        "Nelson Mandela",
        "Jawaharlal Nehru",
        "Mijaíl Gorbachov"
      ],
      "respuesta": "Kwame Nkrumah",
      "explicacion": "Kwame Nkrumah (1909 – 1972): lideró la independencia de Ghana y fue su primer jefe de gobierno."
    },
    {
      "pregunta": "¿Quién fue este personaje? Último líder de la Unión Soviética. Fue el último líder de la Unión Soviética.",
      "opciones": [
        "Nelson Mandela",
        "Jawaharlal Nehru",
        "Kwame Nkrumah",
        "Mijaíl Gorbachov"
      ],
      "respuesta": "Mijaíl Gorbachov",
      "explicacion": "Mijaíl Gorbachov (1931 – 2022): fue el último líder de la Unión Soviética."
    }
  ]
}$historia$::jsonb,
  8,
  true);
