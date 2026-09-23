-- ============================================================
-- Prodigia — Geografía: retrofit completo a Técnicas | Clases por
-- continente (docs/PARIDAD_MUNDOS.md fila 1: "Aprender tiene solo 3
-- lecciones totales — 3 lecciones genéricas para 4 regiones, ninguna por
-- continente. Gap de contenido, no de código" — y fila 22/23). Geografía
-- era el mundo más flaco de contenido de Aprender de todo el proyecto:
-- solo 3 Técnicas genéricas (0027_geografia_lecciones.sql,
-- dividir-en-subregiones / anclar-por-vecinos / forma-caracteristica) y 0
-- Clases.
--
-- 20 Técnicas nuevas (requiere_pro=false), 5 por
-- continente — a diferencia de las 3 históricas (estrategias genéricas
-- que no mapean a un continente y quedan en el grupo "general", ver
-- src/lib/geografia/path.ts), cada una es un atajo de identificación
-- específico de un continente (forma, vecinos, fronteras, tamaño
-- relativo). Todas traen `contenido.visuales` con el primitivo nuevo
-- "geografia.mapa" (mapa real animado, ver más abajo).
--
-- 16 Clases nuevas (requiere_pro=true), 4 por
-- continente — un curso progresivo real, una lección por sub-región
-- curada en src/lib/geografia/subregiones.ts (Cono Sur, Región Andina,
-- Centroamérica y el Caribe, Norteamérica; Europa Occidental, Europa del
-- Este, Escandinavia y el Báltico, Región Mediterránea; Norte de África,
-- África Occidental, África Oriental, África Austral; Asia Oriental,
-- Sudeste Asiático y Asia Meridional, Oriente Medio, Oceanía). La primera
-- Clase de cada continente es preview gratis — ver
-- src/lib/geografia/path.ts.
--
-- Alcance de sub-regiones (decisión explícita, ver el comentario de
-- cabecera de src/lib/geografia/subregiones.ts): NO se curó la
-- sub-región de los 153 países de PAISES_POR_CONTINENTE — solo de los
-- ~40 países "ancla" que estas Clases usan como ejemplo.
--
-- 1 primitivo de visual NUEVO ("geografia.mapa",
-- src/components/geografia/visuales/Mapa.tsx, registro.ts): reusa
-- react-simple-maps + el mismo topojson real de /geografia/practica
-- (mismo recorte por continente, src/lib/geografia/proyeccion.ts), y va
-- revelando 1 a 4 países con su nombre superpuesto — primer visual del
-- proyecto que envuelve un mapa real en vez de un primitivo dibujado a
-- mano. Las coordenadas de cada país salen de una tabla curada y
-- verificada en src/lib/geografia/visualesDatos.ts (resolverPaisesResaltados),
-- nunca hardcodeadas en el componente.
--
-- Cada quiz trae 3-4 preguntas, todas con `explicacion` y la
-- `respuesta` literal dentro de `opciones`, verificadas contra hechos
-- geográficos reales (nunca inventadas a mano).
--
-- Este archivo se GENERA desde src/lib/geografia/lecciones/ (fuente
-- única) y lecciones.test.ts comprueba que coincida. No editar a mano.
-- Regenerar: GEOGRAFIA_ESCRIBIR_SQL=1 npx vitest run src/lib/geografia/lecciones
-- ============================================================

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

('geografia-tecnica-forma-sudamerica-vs-centroamerica', 'Sudamérica vs. Centroamérica: dos formas muy distintas',
  'Sudamérica es un triángulo ancho que se angosta hacia el sur; Centroamérica es una franja angosta en forma de istmo.',
  'geografia',
  $geografia${
  "pasos": [
    "América no es un bloque único: Sudamérica es un triángulo grande, ancho en el norte y angosto en el extremo sur (la Patagonia).",
    "Centroamérica es completamente distinta — un istmo, una franja de tierra angosta que conecta América del Norte con Sudamérica.",
    "Reconocer esta diferencia de forma es el primer paso antes de aprender los países de cada bloque por separado."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "america",
      "paisesIds": [
        "076",
        "320"
      ],
      "despuesDePaso": 2,
      "titulo": "Brasil (triángulo ancho) y Guatemala (istmo angosto)"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué forma general tiene Sudamérica?",
      "opciones": [
        "Un triángulo ancho que se angosta hacia el sur",
        "Una franja angosta de norte a sur",
        "Un círculo casi perfecto",
        "Un archipiélago de islas"
      ],
      "respuesta": "Un triángulo ancho que se angosta hacia el sur",
      "explicacion": "Sudamérica es ancha en el norte (cerca del ecuador) y se angosta hacia el extremo sur, en la Patagonia."
    },
    {
      "pregunta": "¿Cómo se llama la franja de tierra angosta que conecta América del Norte con Sudamérica?",
      "opciones": [
        "Istmo centroamericano",
        "Cono Sur",
        "Región andina",
        "Meseta mexicana"
      ],
      "respuesta": "Istmo centroamericano",
      "explicacion": "Un istmo es una franja angosta de tierra entre dos masas más grandes — exactamente la forma de Centroamérica."
    },
    {
      "pregunta": "¿Por qué conviene distinguir la forma de Sudamérica y Centroamérica antes de memorizar países sueltos?",
      "opciones": [
        "Porque ubicar el bloque grande primero hace más fácil ubicar los países de adentro",
        "Porque los países cambian de bloque según el año",
        "Porque no hay ninguna diferencia real entre ambos",
        "Porque Centroamérica no tiene países propios"
      ],
      "respuesta": "Porque ubicar el bloque grande primero hace más fácil ubicar los países de adentro",
      "explicacion": "Es la misma idea de la técnica general de sub-regiones: el bloque grande primero, los países sueltos después."
    }
  ]
}$geografia$::jsonb,
  1,
  false),

('geografia-tecnica-vecinos-de-brasil', 'Brasil como ancla: limita con casi todo el continente',
  'Brasil es el país más grande de Sudamérica y limita con casi todos los demás países sudamericanos, salvo Chile y Ecuador.',
  'geografia',
  $geografia${
  "pasos": [
    "Brasil ocupa casi la mitad del territorio de Sudamérica — es un ancla natural para ubicar a sus vecinos.",
    "Limita con casi todos los países sudamericanos: Argentina, Bolivia, Colombia, Paraguay, Perú, Uruguay y Venezuela, entre otros.",
    "Los dos países sudamericanos que NO tienen frontera con Brasil son Chile y Ecuador — ambos quedan del lado del Pacífico."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "america",
      "paisesIds": [
        "076",
        "032",
        "170"
      ],
      "despuesDePaso": 2,
      "titulo": "Brasil y dos de sus vecinos: Argentina y Colombia"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Por qué Brasil funciona como buen país ancla para ubicar a sus vecinos?",
      "opciones": [
        "Porque es el país más grande de Sudamérica y limita con casi todos los demás",
        "Porque está en el centro exacto del continente americano",
        "Porque es el único país que tiene costa en dos océanos",
        "Porque todos los demás países fueron parte de Brasil"
      ],
      "respuesta": "Porque es el país más grande de Sudamérica y limita con casi todos los demás",
      "explicacion": "Su tamaño y la cantidad de fronteras que comparte lo hacen un punto de referencia natural para ubicar al resto."
    },
    {
      "pregunta": "¿Cuáles son los dos países sudamericanos que NO limitan con Brasil?",
      "opciones": [
        "Chile y Ecuador",
        "Argentina y Uruguay",
        "Perú y Bolivia",
        "Colombia y Venezuela"
      ],
      "respuesta": "Chile y Ecuador",
      "explicacion": "Ambos quedan del lado del Pacífico, separados de Brasil por otros países — son la excepción a la regla."
    },
    {
      "pregunta": "¿Cuál de estos países SÍ limita con Brasil?",
      "opciones": [
        "Argentina",
        "Chile",
        "Ecuador",
        "Ninguno de los anteriores"
      ],
      "respuesta": "Argentina",
      "explicacion": "Argentina comparte una frontera larga con Brasil, a diferencia de Chile y Ecuador."
    }
  ]
}$geografia$::jsonb,
  2,
  false),

('geografia-tecnica-caribe-por-tamano-y-posicion', 'Islas del Caribe: tamaño y posición relativa',
  'Cuba es la isla más grande y la más al oeste del Caribe; Jamaica queda al sur; Haití y República Dominicana comparten una misma isla al este.',
  'geografia',
  $geografia${
  "pasos": [
    "Cuba es la isla más grande del Caribe y la más cercana a Estados Unidos y México — un buen punto de partida.",
    "Jamaica es una isla más chica, ubicada al sur de Cuba.",
    "Más al este, una misma isla (La Española) está dividida entre dos países: Haití al oeste y República Dominicana al este."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "america",
      "paisesIds": [
        "192",
        "388",
        "214"
      ],
      "despuesDePaso": 2,
      "titulo": "Cuba, Jamaica y República Dominicana"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la isla más grande del Caribe?",
      "opciones": [
        "Cuba",
        "Jamaica",
        "República Dominicana",
        "Haití"
      ],
      "respuesta": "Cuba",
      "explicacion": "Cuba es, por lejos, la isla más grande del Caribe y la más al oeste del archipiélago."
    },
    {
      "pregunta": "¿Qué dos países comparten la misma isla (La Española)?",
      "opciones": [
        "Haití y República Dominicana",
        "Cuba y Jamaica",
        "Jamaica y Haití",
        "Cuba y República Dominicana"
      ],
      "respuesta": "Haití y República Dominicana",
      "explicacion": "La Española es una sola isla dividida en dos países: Haití al oeste, República Dominicana al este."
    },
    {
      "pregunta": "¿Dónde queda Jamaica respecto de Cuba?",
      "opciones": [
        "Al sur",
        "Al norte",
        "Al este, mucho más lejos",
        "En la misma isla"
      ],
      "respuesta": "Al sur",
      "explicacion": "Jamaica es una isla independiente, ubicada al sur de Cuba."
    }
  ]
}$geografia$::jsonb,
  3,
  false),

('geografia-tecnica-istmo-centroamericano-en-cadena', 'El istmo centroamericano, país por país',
  'Centroamérica es una cadena de 7 países entre México y Colombia — aprenderlos en orden, de norte a sur, es más fácil que sueltos.',
  'geografia',
  $geografia${
  "pasos": [
    "Centroamérica tiene 7 países, dispuestos en cadena entre México (al norte) y Colombia (al sur, ya en Sudamérica).",
    "De norte a sur: Guatemala, Belice, Honduras, El Salvador, Nicaragua, Costa Rica y Panamá.",
    "Panamá es el último eslabón — el país que conecta el istmo con Sudamérica a través de su frontera con Colombia."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "america",
      "paisesIds": [
        "320",
        "340",
        "188",
        "591"
      ],
      "despuesDePaso": 2,
      "titulo": "Cadena centroamericana: Guatemala, Honduras, Costa Rica y Panamá"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos países forman la cadena centroamericana?",
      "opciones": [
        "7",
        "5",
        "9",
        "4"
      ],
      "respuesta": "7",
      "explicacion": "Guatemala, Belice, Honduras, El Salvador, Nicaragua, Costa Rica y Panamá — 7 países en total."
    },
    {
      "pregunta": "¿Cuál es el país centroamericano que conecta el istmo con Sudamérica?",
      "opciones": [
        "Panamá",
        "Guatemala",
        "Costa Rica",
        "Belice"
      ],
      "respuesta": "Panamá",
      "explicacion": "Panamá es el eslabón final: al sureste limita con Colombia, ya en Sudamérica."
    },
    {
      "pregunta": "¿Cuál de estos países está más al norte de la cadena centroamericana?",
      "opciones": [
        "Guatemala",
        "Panamá",
        "Costa Rica",
        "Nicaragua"
      ],
      "respuesta": "Guatemala",
      "explicacion": "Guatemala es el primer país de la cadena, el más cercano a México."
    }
  ]
}$geografia$::jsonb,
  4,
  false),

('geografia-tecnica-cono-sur-franja-y-bloque', 'Cono Sur: la franja angosta y el bloque grande',
  'Chile es una franja larga y angosta pegada a la cordillera; Argentina es el bloque grande al lado, con Uruguay y Paraguay más chicos.',
  'geografia',
  $geografia${
  "pasos": [
    "En el extremo sur de Sudamérica, Chile forma una franja larga y angosta, apretada entre la cordillera de los Andes y el océano Pacífico.",
    "Argentina, del otro lado de la cordillera, es un bloque mucho más ancho — casi el doble de largo que Chile de este a oeste.",
    "Uruguay y Paraguay son los dos países más chicos del grupo: Uruguay pegado a la costa atlántica, Paraguay sin salida al mar."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "america",
      "paisesIds": [
        "152",
        "032",
        "858",
        "600"
      ],
      "despuesDePaso": 2,
      "titulo": "Chile, Argentina, Uruguay y Paraguay"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué país del Cono Sur tiene forma de franja larga y angosta?",
      "opciones": [
        "Chile",
        "Argentina",
        "Uruguay",
        "Paraguay"
      ],
      "respuesta": "Chile",
      "explicacion": "Chile está apretado entre la cordillera de los Andes y el océano Pacífico — muy largo de norte a sur, muy angosto de este a oeste."
    },
    {
      "pregunta": "¿Cuál de estos 4 países del Cono Sur no tiene salida al mar?",
      "opciones": [
        "Paraguay",
        "Chile",
        "Uruguay",
        "Argentina"
      ],
      "respuesta": "Paraguay",
      "explicacion": "Paraguay es el único de los 4 completamente rodeado de tierra, sin costa sobre ningún océano."
    },
    {
      "pregunta": "¿Cuál de estos países es el más chico del grupo, pegado a la costa atlántica?",
      "opciones": [
        "Uruguay",
        "Argentina",
        "Chile",
        "Paraguay"
      ],
      "respuesta": "Uruguay",
      "explicacion": "Uruguay es el más chico de los cuatro y tiene costa sobre el océano Atlántico."
    }
  ]
}$geografia$::jsonb,
  5,
  false),

('geografia-tecnica-escandinavos-forma-y-orientacion', 'Países escandinavos: forma y orientación',
  'Noruega tiene una costa recortada por fiordos y se extiende en diagonal; Suecia es más ancha y está al este; Finlandia tiene miles de lagos.',
  'geografia',
  $geografia${
  "pasos": [
    "Noruega tiene una costa muy recortada, llena de fiordos, y se extiende en diagonal hacia el noreste, bien pegada al mar.",
    "Suecia queda al este de Noruega — es más ancha y su costa es mucho más regular, sin tantos fiordos.",
    "Finlandia, al este de Suecia, se distingue por tener miles de lagos repartidos por todo su territorio."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "europa",
      "paisesIds": [
        "578",
        "752",
        "246"
      ],
      "despuesDePaso": 2,
      "titulo": "Noruega, Suecia y Finlandia"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué país escandinavo se reconoce por su costa recortada en fiordos?",
      "opciones": [
        "Noruega",
        "Suecia",
        "Finlandia",
        "Dinamarca"
      ],
      "respuesta": "Noruega",
      "explicacion": "Los fiordos son entrantes de mar profundos entre montañas, típicos de la costa oeste de Noruega."
    },
    {
      "pregunta": "¿Qué país queda al este de Suecia, conocido por sus miles de lagos?",
      "opciones": [
        "Finlandia",
        "Noruega",
        "Dinamarca",
        "Islandia"
      ],
      "respuesta": "Finlandia",
      "explicacion": "Finlandia tiene una enorme cantidad de lagos repartidos por su territorio — un rasgo muy distintivo."
    },
    {
      "pregunta": "¿Cuál de estos tres países queda más al oeste, pegado al mar de Noruega?",
      "opciones": [
        "Noruega",
        "Suecia",
        "Finlandia",
        "Los tres están igual de al oeste"
      ],
      "respuesta": "Noruega",
      "explicacion": "Noruega ocupa la franja más occidental de la península escandinava, con Suecia a su este."
    }
  ]
}$geografia$::jsonb,
  1,
  false),

('geografia-tecnica-balcanes-muchos-paises-chicos', 'Los Balcanes: muchos países chicos y cercanos',
  'En el sureste de Europa hay muchos países chicos muy cerca uno del otro — Croacia, Serbia y Bulgaria son tres ejemplos.',
  'geografia',
  $geografia${
  "pasos": [
    "Los Balcanes son la región del sureste de Europa, entre Italia y Turquía — a diferencia de Francia o España, ahí conviven muchos países chicos, muy cerca uno del otro.",
    "Croacia tiene una forma curva, como una media luna, pegada a la costa del mar Adriático.",
    "Serbia y Bulgaria quedan más hacia el interior y el este de la región, ambos sin la misma costa larga que tiene Croacia."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "europa",
      "paisesIds": [
        "191",
        "688",
        "100"
      ],
      "despuesDePaso": 2,
      "titulo": "Croacia, Serbia y Bulgaria"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué caracteriza a la región de los Balcanes en el mapa de Europa?",
      "opciones": [
        "Tiene muchos países chicos muy cerca uno del otro",
        "Es la región con menos países de todo el continente",
        "Todos sus países comparten el mismo idioma",
        "No tiene ningún país con costa al mar"
      ],
      "respuesta": "Tiene muchos países chicos muy cerca uno del otro",
      "explicacion": "A diferencia de países grandes como Francia o España, el sureste de Europa está muy fragmentado."
    },
    {
      "pregunta": "¿Qué país balcánico tiene forma curva, como una media luna, sobre el mar Adriático?",
      "opciones": [
        "Croacia",
        "Serbia",
        "Bulgaria",
        "Rumania"
      ],
      "respuesta": "Croacia",
      "explicacion": "La costa de Croacia se curva siguiendo el mar Adriático, dándole esa forma característica."
    },
    {
      "pregunta": "¿Entre qué dos países queda la región de los Balcanes?",
      "opciones": [
        "Italia y Turquía",
        "Francia y Alemania",
        "España y Portugal",
        "Noruega y Rusia"
      ],
      "respuesta": "Italia y Turquía",
      "explicacion": "Los Balcanes ocupan el sureste de Europa, entre la península itálica y Turquía."
    }
  ]
}$geografia$::jsonb,
  2,
  false),

('geografia-tecnica-islas-europeas-separadas', 'Islas europeas separadas del continente',
  'Reino Unido e Irlanda comparten un archipiélago separado por el Canal de la Mancha; Islandia está mucho más aislada, en pleno Atlántico Norte.',
  'geografia',
  $geografia${
  "pasos": [
    "Reino Unido e Irlanda son dos islas vecinas, separadas del resto de Europa por el Canal de la Mancha — un mar angosto pero real.",
    "Islandia queda mucho más lejos, aislada en medio del océano Atlántico Norte, sin ningún vecino cercano.",
    "Reconocer estas tres islas como un grupo aparte ayuda a no confundirlas con países del continente pegados entre sí."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "europa",
      "paisesIds": [
        "826",
        "372"
      ],
      "despuesDePaso": 2,
      "titulo": "Reino Unido e Irlanda"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué separa a Reino Unido e Irlanda del resto de Europa continental?",
      "opciones": [
        "El Canal de la Mancha",
        "El mar Mediterráneo",
        "Los montes Urales",
        "El mar Báltico"
      ],
      "respuesta": "El Canal de la Mancha",
      "explicacion": "El Canal de la Mancha es el brazo de mar angosto que separa las islas británicas del continente."
    },
    {
      "pregunta": "¿Cuál de estas tres islas está más aislada, sin vecinos cercanos?",
      "opciones": [
        "Islandia",
        "Reino Unido",
        "Irlanda",
        "Ninguna está aislada"
      ],
      "respuesta": "Islandia",
      "explicacion": "Islandia está en pleno Atlántico Norte, mucho más lejos del continente que Reino Unido e Irlanda."
    },
    {
      "pregunta": "¿Reino Unido e Irlanda están en la misma isla o en islas distintas?",
      "opciones": [
        "En islas distintas, aunque vecinas",
        "En la misma isla, divididos por una frontera interna",
        "Reino Unido no es una isla",
        "Irlanda es parte del continente"
      ],
      "respuesta": "En islas distintas, aunque vecinas",
      "explicacion": "Son dos islas separadas por el mar de Irlanda, no una sola isla dividida."
    }
  ]
}$geografia$::jsonb,
  3,
  false),

('geografia-tecnica-europa-central-fronteras-compartidas', 'Alemania: el cruce de caminos de Europa central',
  'Alemania comparte frontera con Francia, Polonia, Austria y varios países más — usarla de centro ayuda a ubicar a sus vecinos.',
  'geografia',
  $geografia${
  "pasos": [
    "Alemania está en el centro de Europa y comparte frontera con más países que casi cualquier otro del continente.",
    "Al oeste queda Francia; al este, Polonia; al sur, Austria — tres de sus vecinos más grandes.",
    "Usar Alemania como centro es una forma rápida de ubicar a varios países vecinos a la vez, en vez de aprenderlos sueltos."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "europa",
      "paisesIds": [
        "276",
        "250",
        "616",
        "040"
      ],
      "despuesDePaso": 2,
      "titulo": "Alemania y tres de sus vecinos: Francia, Polonia y Austria"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Por qué Alemania es un buen país ancla en el mapa de Europa central?",
      "opciones": [
        "Porque comparte frontera con muchos países a la vez",
        "Porque es el país más grande de toda Europa",
        "Porque no tiene ningún vecino",
        "Porque es una isla en el centro del continente"
      ],
      "respuesta": "Porque comparte frontera con muchos países a la vez",
      "explicacion": "La cantidad de vecinos que tiene Alemania la convierte en un buen punto de referencia central."
    },
    {
      "pregunta": "¿Qué país queda al este de Alemania?",
      "opciones": [
        "Polonia",
        "Francia",
        "España",
        "Portugal"
      ],
      "respuesta": "Polonia",
      "explicacion": "Polonia limita con Alemania por el este."
    },
    {
      "pregunta": "¿Qué país queda al oeste de Alemania?",
      "opciones": [
        "Francia",
        "Polonia",
        "Austria",
        "Rumania"
      ],
      "respuesta": "Francia",
      "explicacion": "Francia limita con Alemania por el oeste."
    }
  ]
}$geografia$::jsonb,
  4,
  false),

('geografia-tecnica-peninsula-iberica-dos-paises', 'La península ibérica: dos países, un mismo bloque',
  'España y Portugal comparten la misma península, en el extremo suroeste de Europa; Portugal ocupa la franja pegada al Atlántico.',
  'geografia',
  $geografia${
  "pasos": [
    "España y Portugal comparten la misma península — la Ibérica — en el extremo suroeste del continente.",
    "Portugal ocupa la franja angosta pegada al océano Atlántico, en el borde oeste de la península.",
    "España ocupa el resto, mucho más grande, con costa sobre el Atlántico y también sobre el mar Mediterráneo."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "europa",
      "paisesIds": [
        "724",
        "620"
      ],
      "despuesDePaso": 2,
      "titulo": "España y Portugal en la península ibérica"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué dos países comparten la península ibérica?",
      "opciones": [
        "España y Portugal",
        "España e Italia",
        "Francia y España",
        "Portugal e Italia"
      ],
      "respuesta": "España y Portugal",
      "explicacion": "Ambos países ocupan la misma península, en el extremo suroeste de Europa."
    },
    {
      "pregunta": "¿Qué país ocupa la franja pegada al océano Atlántico, en el borde oeste?",
      "opciones": [
        "Portugal",
        "España",
        "Francia",
        "Italia"
      ],
      "respuesta": "Portugal",
      "explicacion": "Portugal es la franja angosta del oeste de la península, toda su costa mira al Atlántico."
    },
    {
      "pregunta": "¿Con qué mar tiene costa España, además del Atlántico?",
      "opciones": [
        "El Mediterráneo",
        "El Báltico",
        "El mar del Norte",
        "El mar Negro"
      ],
      "respuesta": "El Mediterráneo",
      "explicacion": "España tiene costa tanto en el Atlántico como en el Mediterráneo, a diferencia de Portugal."
    }
  ]
}$geografia$::jsonb,
  5,
  false),

('geografia-tecnica-costeros-vs-sin-salida-al-mar', 'Países africanos sin salida al mar',
  'Chad, Malí y Zambia están completamente rodeados de tierra — reconocerlos por estar ''encerrados'' ayuda a ubicarlos.',
  'geografia',
  $geografia${
  "pasos": [
    "En África hay varios países sin ninguna costa — están completamente rodeados de tierra por otros países.",
    "Chad y Malí, en el centro y oeste del continente, son dos ejemplos claros: ningún lado de su territorio toca el mar.",
    "Zambia, más al sur, es otro ejemplo — a diferencia de países costeros como Nigeria o Kenia, que sí tienen costa oceánica."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "africa",
      "paisesIds": [
        "148",
        "466",
        "894"
      ],
      "despuesDePaso": 2,
      "titulo": "Chad, Malí y Zambia: sin salida al mar"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué significa que un país no tenga salida al mar?",
      "opciones": [
        "Que está completamente rodeado de tierra, sin costa oceánica",
        "Que está en el centro exacto del continente",
        "Que no tiene ríos",
        "Que es el país más chico de la región"
      ],
      "respuesta": "Que está completamente rodeado de tierra, sin costa oceánica",
      "explicacion": "Un país sin salida al mar (landlocked) está rodeado de tierra por todos sus lados."
    },
    {
      "pregunta": "¿Cuál de estos países africanos SÍ tiene costa oceánica?",
      "opciones": [
        "Nigeria",
        "Chad",
        "Malí",
        "Zambia"
      ],
      "respuesta": "Nigeria",
      "explicacion": "Nigeria tiene costa sobre el golfo de Guinea, a diferencia de Chad, Malí y Zambia."
    },
    {
      "pregunta": "¿Cuál de estos países está completamente rodeado de tierra?",
      "opciones": [
        "Chad",
        "Kenia",
        "Nigeria",
        "Marruecos"
      ],
      "respuesta": "Chad",
      "explicacion": "Chad no tiene costa en ningún océano — está en el centro-norte de África, rodeado de otros países."
    }
  ]
}$geografia$::jsonb,
  1,
  false),

('geografia-tecnica-sahara-como-referencia', 'El Sahara como frontera natural',
  'El desierto del Sahara separa el norte de África (Marruecos, Argelia, Libia, Egipto) del resto del continente.',
  'geografia',
  $geografia${
  "pasos": [
    "El Sahara es el desierto más grande del mundo y ocupa casi todo el norte de África.",
    "Los países al norte del Sahara — Marruecos, Argelia, Libia y Egipto — forman un bloque bien diferenciado del resto del continente.",
    "Usar el Sahara como una gran frontera natural ayuda a separar mentalmente 'el norte árabe' del África subsahariana."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "africa",
      "paisesIds": [
        "504",
        "012",
        "434",
        "818"
      ],
      "despuesDePaso": 2,
      "titulo": "Marruecos, Argelia, Libia y Egipto: al norte del Sahara"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué desierto separa el norte de África del resto del continente?",
      "opciones": [
        "El Sahara",
        "El Kalahari",
        "El desierto de Namibia",
        "El desierto Árabe"
      ],
      "respuesta": "El Sahara",
      "explicacion": "El Sahara es el desierto más grande del mundo y ocupa casi todo el norte de África."
    },
    {
      "pregunta": "¿Cuál de estos países NO está en el bloque norteafricano al norte del Sahara?",
      "opciones": [
        "Kenia",
        "Marruecos",
        "Argelia",
        "Libia"
      ],
      "respuesta": "Kenia",
      "explicacion": "Kenia está en África Oriental, al sur del Sahara — no forma parte del bloque norteafricano."
    },
    {
      "pregunta": "¿Cuál de estos países SÍ queda al norte del Sahara?",
      "opciones": [
        "Egipto",
        "Nigeria",
        "Sudáfrica",
        "Tanzania"
      ],
      "respuesta": "Egipto",
      "explicacion": "Egipto está en el extremo noreste de África, al norte del Sahara."
    }
  ]
}$geografia$::jsonb,
  2,
  false),

('geografia-tecnica-cuerno-de-africa', 'El Cuerno de África: la punta que sobresale',
  'Somalia, Etiopía, Eritrea y Yibuti forman la península puntiaguda que sobresale hacia el océano Índico en el noreste del continente.',
  'geografia',
  $geografia${
  "pasos": [
    "El Cuerno de África es la península puntiaguda que sobresale hacia el este, hacia el océano Índico, en el noreste del continente.",
    "La forman cuatro países: Somalia (la punta misma), Etiopía (en el interior, sin costa), Eritrea y Yibuti (ambos con costa sobre el mar Rojo).",
    "Su forma puntiaguda es fácil de reconocer de un vistazo — muy distinta al resto de la costa africana."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "africa",
      "paisesIds": [
        "706",
        "231",
        "232",
        "262"
      ],
      "despuesDePaso": 2,
      "titulo": "Somalia, Etiopía, Eritrea y Yibuti: el Cuerno de África"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué país forma la punta misma del Cuerno de África?",
      "opciones": [
        "Somalia",
        "Etiopía",
        "Eritrea",
        "Yibuti"
      ],
      "respuesta": "Somalia",
      "explicacion": "Somalia ocupa la punta que sobresale hacia el océano Índico, dándole su forma característica al Cuerno de África."
    },
    {
      "pregunta": "¿Cuál de estos 4 países del Cuerno de África no tiene costa (está en el interior)?",
      "opciones": [
        "Etiopía",
        "Somalia",
        "Eritrea",
        "Yibuti"
      ],
      "respuesta": "Etiopía",
      "explicacion": "Etiopía es el único de los cuatro sin costa — está rodeada por los otros tres y por Kenia y Sudán."
    },
    {
      "pregunta": "¿Hacia qué océano sobresale la península del Cuerno de África?",
      "opciones": [
        "El océano Índico",
        "El océano Atlántico",
        "El mar Mediterráneo",
        "El océano Pacífico"
      ],
      "respuesta": "El océano Índico",
      "explicacion": "El Cuerno de África sobresale hacia el este, hacia el océano Índico."
    }
  ]
}$geografia$::jsonb,
  3,
  false),

('geografia-tecnica-fronteras-rectas-coloniales', 'Fronteras rectas: herencia colonial',
  'Chad, Libia y Namibia tienen fronteras casi de regla y escuadra — trazadas por potencias coloniales sin seguir accidentes geográficos.',
  'geografia',
  $geografia${
  "pasos": [
    "Muchas fronteras africanas fueron trazadas por potencias coloniales europeas, casi con una regla, sin seguir ríos ni montañas.",
    "Chad y Libia son dos ejemplos claros: varios de sus límites son líneas rectas, no las curvas irregulares típicas de un río o una cordillera.",
    "Namibia es otro caso llamativo: tiene una larga franja angosta y recta (la Franja de Caprivi) que se extiende hacia el este."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "africa",
      "paisesIds": [
        "148",
        "434",
        "516"
      ],
      "despuesDePaso": 2,
      "titulo": "Chad, Libia y Namibia: fronteras casi rectas"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Por qué muchas fronteras africanas son líneas rectas?",
      "opciones": [
        "Porque las trazaron potencias coloniales sin seguir accidentes geográficos",
        "Porque siguen siempre el curso de un río",
        "Porque todos los países africanos tienen el mismo tamaño",
        "Porque las trazó la ONU en el siglo XXI"
      ],
      "respuesta": "Porque las trazaron potencias coloniales sin seguir accidentes geográficos",
      "explicacion": "A diferencia de fronteras naturales (ríos, montañas), muchas fronteras africanas son herencia de líneas trazadas en la época colonial."
    },
    {
      "pregunta": "¿Qué país tiene una larga franja angosta y recta que se extiende hacia el este (la Franja de Caprivi)?",
      "opciones": [
        "Namibia",
        "Chad",
        "Libia",
        "Sudáfrica"
      ],
      "respuesta": "Namibia",
      "explicacion": "La Franja de Caprivi es una prolongación angosta y recta del territorio de Namibia hacia el este."
    },
    {
      "pregunta": "¿Cuál de estos países es un ejemplo de fronteras casi rectas?",
      "opciones": [
        "Chad",
        "Italia",
        "Chile",
        "Reino Unido"
      ],
      "respuesta": "Chad",
      "explicacion": "Chad, en el centro-norte de África, tiene varios límites trazados como líneas rectas."
    }
  ]
}$geografia$::jsonb,
  4,
  false),

('geografia-tecnica-sudafrica-rodea-a-lesoto', 'Lesoto: un país rodeado por otro',
  'Lesoto está completamente rodeado por Sudáfrica — no tiene frontera con ningún otro país, un caso único en el continente.',
  'geografia',
  $geografia${
  "pasos": [
    "Lesoto es un país pequeño, montañoso, ubicado dentro del territorio de Sudáfrica.",
    "Está completamente rodeado por Sudáfrica: no comparte frontera con ningún otro país del mundo.",
    "Este tipo de país (rodeado por completo por otro) se llama enclave — Lesoto es el ejemplo más conocido de África."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "africa",
      "paisesIds": [
        "710",
        "426"
      ],
      "despuesDePaso": 2,
      "titulo": "Sudáfrica y Lesoto, el país que rodea por completo"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos países, además de Sudáfrica, limitan con Lesoto?",
      "opciones": [
        "Ninguno",
        "Uno",
        "Dos",
        "Tres"
      ],
      "respuesta": "Ninguno",
      "explicacion": "Lesoto está completamente rodeado por Sudáfrica — no tiene frontera con ningún otro país."
    },
    {
      "pregunta": "¿Cómo se llama un país completamente rodeado por otro, como Lesoto?",
      "opciones": [
        "Un enclave",
        "Una península",
        "Un istmo",
        "Un archipiélago"
      ],
      "respuesta": "Un enclave",
      "explicacion": "Un enclave es un territorio rodeado por completo por otro país — Lesoto es el ejemplo más conocido de África."
    },
    {
      "pregunta": "¿Qué país rodea por completo a Lesoto?",
      "opciones": [
        "Sudáfrica",
        "Namibia",
        "Botsuana",
        "Zimbabue"
      ],
      "respuesta": "Sudáfrica",
      "explicacion": "Todo el territorio de Lesoto está dentro de Sudáfrica."
    }
  ]
}$geografia$::jsonb,
  5,
  false),

('geografia-tecnica-peninsulas-asiaticas', 'Tres penínsulas asiáticas para ubicarse rápido',
  'Corea sobresale hacia el este, Indochina (Vietnam) hacia el sur, y la península arábiga (Arabia Saudita) es la más grande de las tres.',
  'geografia',
  $geografia${
  "pasos": [
    "Corea es una península que sobresale hacia el este de China, entre el mar Amarillo y el mar de Japón.",
    "Indochina, donde está Vietnam, es la península que sobresale hacia el sur, entre India y China.",
    "La península arábiga, donde está Arabia Saudita, es la más grande de las tres — ocupa casi todo el suroeste de Asia."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "asia_oceania",
      "paisesIds": [
        "410",
        "704",
        "682"
      ],
      "despuesDePaso": 2,
      "titulo": "Corea, Vietnam y Arabia Saudita: tres penínsulas"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Hacia qué dirección sobresale la península de Corea respecto de China?",
      "opciones": [
        "Hacia el este",
        "Hacia el sur",
        "Hacia el oeste",
        "Hacia el norte"
      ],
      "respuesta": "Hacia el este",
      "explicacion": "Corea sobresale hacia el este de China, entre el mar Amarillo y el mar de Japón."
    },
    {
      "pregunta": "¿Cuál es la península asiática más grande de las tres?",
      "opciones": [
        "La península arábiga",
        "Corea",
        "Indochina",
        "Todas son del mismo tamaño"
      ],
      "respuesta": "La península arábiga",
      "explicacion": "La península arábiga, donde está Arabia Saudita, ocupa casi todo el suroeste de Asia — mucho más grande que Corea o Indochina."
    },
    {
      "pregunta": "¿En qué península está Vietnam?",
      "opciones": [
        "Indochina",
        "Corea",
        "Arábiga",
        "Anatolia"
      ],
      "respuesta": "Indochina",
      "explicacion": "Vietnam está en la península de Indochina, que sobresale hacia el sur entre India y China."
    }
  ]
}$geografia$::jsonb,
  1,
  false),

('geografia-tecnica-islas-sudeste-asiatico', 'Indonesia y Filipinas: países archipiélago',
  'Indonesia y Filipinas están formados por miles de islas, no por un bloque de tierra continua como China o India.',
  'geografia',
  $geografia${
  "pasos": [
    "A diferencia de China o India (bloques de tierra continua), Indonesia y Filipinas son archipiélagos — países hechos de miles de islas.",
    "Indonesia, con más de 17.000 islas, es el archipiélago más grande del mundo, ubicado entre el océano Índico y el Pacífico.",
    "Filipinas, al norte de Indonesia, es otro archipiélago grande, formado por más de 7.000 islas."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "asia_oceania",
      "paisesIds": [
        "360",
        "608"
      ],
      "despuesDePaso": 2,
      "titulo": "Indonesia y Filipinas: países formados por miles de islas"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué tienen en común Indonesia y Filipinas?",
      "opciones": [
        "Ambos son archipiélagos, países formados por miles de islas",
        "Ambos son países sin salida al mar",
        "Ambos comparten la misma frontera terrestre",
        "Ambos están en la península arábiga"
      ],
      "respuesta": "Ambos son archipiélagos, países formados por miles de islas",
      "explicacion": "A diferencia de China o India, ninguno de los dos es un bloque de tierra continua."
    },
    {
      "pregunta": "¿Cuál de estos dos países queda más al norte?",
      "opciones": [
        "Filipinas",
        "Indonesia",
        "Quedan a la misma latitud",
        "Ninguno de los dos está en Asia"
      ],
      "respuesta": "Filipinas",
      "explicacion": "Filipinas está al norte de Indonesia, más cerca del ecuador pero por encima de él."
    },
    {
      "pregunta": "¿Aproximadamente cuántas islas forman Indonesia?",
      "opciones": [
        "Más de 17.000",
        "Alrededor de 100",
        "Solo 3",
        "Alrededor de 500"
      ],
      "respuesta": "Más de 17.000",
      "explicacion": "Indonesia es el archipiélago más grande del mundo, con más de 17.000 islas."
    }
  ]
}$geografia$::jsonb,
  2,
  false),

('geografia-tecnica-oceania-por-tamano-relativo', 'Oceanía: Australia enorme, el resto mucho más chico',
  'Australia es casi tan grande como toda Europa; Nueva Zelanda, Papúa Nueva Guinea y Fiyi son una fracción de su tamaño.',
  'geografia',
  $geografia${
  "pasos": [
    "Australia domina Oceanía en tamaño — es casi tan grande como toda Europa junta.",
    "Nueva Zelanda, al sureste, está formada por dos islas principales, mucho más chicas que Australia.",
    "Papúa Nueva Guinea y Fiyi son otros dos países de Oceanía, ambos bastante más chicos que Australia y ubicados más al norte."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "asia_oceania",
      "paisesIds": [
        "036",
        "554",
        "242"
      ],
      "despuesDePaso": 2,
      "titulo": "Australia, Nueva Zelanda y Fiyi: tamaños muy distintos"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Con qué continente se compara habitualmente el tamaño de Australia?",
      "opciones": [
        "Europa (es casi tan grande)",
        "La Antártida",
        "Groenlandia",
        "Ninguno, es mucho más chica que cualquier continente"
      ],
      "respuesta": "Europa (es casi tan grande)",
      "explicacion": "Australia es casi tan grande como toda Europa — domina el tamaño de Oceanía."
    },
    {
      "pregunta": "¿Cuántas islas principales forman Nueva Zelanda?",
      "opciones": [
        "Dos",
        "Una",
        "Cinco",
        "Diez"
      ],
      "respuesta": "Dos",
      "explicacion": "Nueva Zelanda está formada por dos islas principales (Isla Norte e Isla Sur), además de islas más chicas."
    },
    {
      "pregunta": "¿Cuál de estos países de Oceanía es mucho más chico que Australia?",
      "opciones": [
        "Fiyi",
        "Ninguno, todos son del mismo tamaño",
        "No hay otros países en Oceanía",
        "Australia es el más chico"
      ],
      "respuesta": "Fiyi",
      "explicacion": "Fiyi es un archipiélago pequeño, una fracción del tamaño de Australia."
    }
  ]
}$geografia$::jsonb,
  3,
  false),

('geografia-tecnica-asia-central-los-stan', 'Asia Central: los cinco países terminados en ''-stán''',
  'Kazajistán, Uzbekistán, Turkmenistán, Kirguistán y Tayikistán forman un bloque entre Rusia y Afganistán.',
  'geografia',
  $geografia${
  "pasos": [
    "Cinco países de Asia Central terminan en '-stán': Kazajistán, Uzbekistán, Turkmenistán, Kirguistán y Tayikistán.",
    "Los cinco quedan en un mismo bloque, entre Rusia al norte y Afganistán/Irán al sur.",
    "Kazajistán es, de lejos, el más grande y el más al norte de los cinco; Tayikistán y Kirguistán son los más chicos y montañosos."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "asia_oceania",
      "paisesIds": [
        "398",
        "860",
        "762"
      ],
      "despuesDePaso": 2,
      "titulo": "Kazajistán, Uzbekistán y Tayikistán: Asia Central"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos países de Asia Central terminan en '-stán'?",
      "opciones": [
        "5",
        "3",
        "7",
        "2"
      ],
      "respuesta": "5",
      "explicacion": "Kazajistán, Uzbekistán, Turkmenistán, Kirguistán y Tayikistán — cinco países en total."
    },
    {
      "pregunta": "¿Cuál de los cinco '-stán' es el más grande y el más al norte?",
      "opciones": [
        "Kazajistán",
        "Tayikistán",
        "Kirguistán",
        "Turkmenistán"
      ],
      "respuesta": "Kazajistán",
      "explicacion": "Kazajistán es, de lejos, el más grande de los cinco y el que más al norte llega, pegado a Rusia."
    },
    {
      "pregunta": "¿Qué dos países quedan al sur del bloque de Asia Central?",
      "opciones": [
        "Afganistán e Irán",
        "China y Rusia",
        "India y Pakistán",
        "Turquía y Arabia Saudita"
      ],
      "respuesta": "Afganistán e Irán",
      "explicacion": "El bloque de los cinco '-stán' queda entre Rusia (al norte) y Afganistán/Irán (al sur)."
    }
  ]
}$geografia$::jsonb,
  4,
  false),

('geografia-tecnica-oriente-medio-alrededor-de-arabia', 'Oriente Medio alrededor de Arabia Saudita',
  'Arabia Saudita ocupa el centro de la península arábiga; a su alrededor, países más chicos como Catar, Kuwait y Emiratos.',
  'geografia',
  $geografia${
  "pasos": [
    "Arabia Saudita ocupa la mayor parte de la península arábiga — un buen punto de partida para ubicar a sus vecinos.",
    "A su alrededor hay varios países mucho más chicos, todos con costa sobre el golfo Pérsico: Catar, Kuwait y Emiratos Árabes Unidos.",
    "Los tres países chicos comparten esa posición costera sobre el golfo, en el borde este de la península."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "asia_oceania",
      "paisesIds": [
        "682",
        "634",
        "414",
        "784"
      ],
      "despuesDePaso": 2,
      "titulo": "Arabia Saudita, Catar, Kuwait y Emiratos Árabes Unidos"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué país ocupa la mayor parte de la península arábiga?",
      "opciones": [
        "Arabia Saudita",
        "Catar",
        "Kuwait",
        "Emiratos Árabes Unidos"
      ],
      "respuesta": "Arabia Saudita",
      "explicacion": "Arabia Saudita es, de lejos, el país más grande de la península arábiga."
    },
    {
      "pregunta": "¿Sobre qué golfo tienen costa Catar, Kuwait y Emiratos Árabes Unidos?",
      "opciones": [
        "El golfo Pérsico",
        "El golfo de Adén",
        "El mar Rojo",
        "El golfo de Omán"
      ],
      "respuesta": "El golfo Pérsico",
      "explicacion": "Los tres países chicos de la península arábiga comparten costa sobre el golfo Pérsico."
    },
    {
      "pregunta": "¿Cuál de estos países es mucho más chico que Arabia Saudita?",
      "opciones": [
        "Catar",
        "Ninguno, todos son similares en tamaño",
        "Todos son más grandes que Arabia Saudita",
        "Yemen"
      ],
      "respuesta": "Catar",
      "explicacion": "Catar es un país muy pequeño comparado con la extensión de Arabia Saudita."
    }
  ]
}$geografia$::jsonb,
  5,
  false);

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

('geografia-clase-cono-sur', 'Cono Sur: Argentina, Chile, Uruguay y Paraguay',
  'El bloque más al sur de Sudamérica: 4 países con climas templados, muy distintos entre sí en forma y tamaño.',
  'geografia',
  $geografia${
  "pasos": [
    "El Cono Sur es el bloque de países ubicado en el extremo sur de Sudamérica, donde el continente se angosta.",
    "Lo forman 4 países: Argentina (el más grande de los 4, con grandes llanuras — las pampas), Chile (una franja angosta pegada a los Andes), Uruguay (chico, entre Argentina y Brasil) y Paraguay (sin salida al mar).",
    "Un rasgo distintivo del grupo: de los 4, solo Paraguay no tiene costa oceánica — está completamente rodeado de tierra.",
    "Practicar identificando estos 4 países en el mapa antes de avanzar a la Región Andina, más al norte."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "america",
      "paisesIds": [
        "032",
        "152",
        "858",
        "600"
      ],
      "despuesDePaso": 2,
      "titulo": "Cono Sur: Argentina, Chile, Uruguay y Paraguay"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué 4 países forman el Cono Sur?",
      "opciones": [
        "Argentina, Chile, Uruguay y Paraguay",
        "Argentina, Brasil, Chile y Perú",
        "Chile, Perú, Bolivia y Ecuador",
        "Uruguay, Paraguay, Brasil y Bolivia"
      ],
      "respuesta": "Argentina, Chile, Uruguay y Paraguay",
      "explicacion": "Son los 4 países del extremo sur de Sudamérica, donde el continente se angosta hacia la Patagonia."
    },
    {
      "pregunta": "¿Cuál de los 4 países del Cono Sur no tiene salida al mar?",
      "opciones": [
        "Paraguay",
        "Argentina",
        "Chile",
        "Uruguay"
      ],
      "respuesta": "Paraguay",
      "explicacion": "Paraguay está completamente rodeado de tierra, sin costa sobre ningún océano."
    },
    {
      "pregunta": "¿Qué país del Cono Sur tiene grandes llanuras conocidas como las pampas?",
      "opciones": [
        "Argentina",
        "Chile",
        "Uruguay",
        "Paraguay"
      ],
      "respuesta": "Argentina",
      "explicacion": "Las pampas son las grandes llanuras fértiles del centro de Argentina."
    },
    {
      "pregunta": "¿Qué país del Cono Sur es una franja angosta pegada a la cordillera de los Andes?",
      "opciones": [
        "Chile",
        "Argentina",
        "Uruguay",
        "Paraguay"
      ],
      "respuesta": "Chile",
      "explicacion": "Chile está apretado entre los Andes y el océano Pacífico, muy largo y muy angosto."
    }
  ]
}$geografia$::jsonb,
  1,
  true),

('geografia-clase-region-andina', 'Región Andina: Colombia, Venezuela, Ecuador, Perú y Bolivia',
  '5 países atravesados por la cordillera de los Andes, en el norte y oeste de Sudamérica.',
  'geografia',
  $geografia${
  "pasos": [
    "La Región Andina agrupa a los países atravesados por la cordillera de los Andes, en el norte y oeste de Sudamérica.",
    "La forman 5 países: Colombia y Venezuela (los más al norte, con costa caribeña), Ecuador (el más chico, cruzado por el ecuador terrestre), Perú y Bolivia (los más al sur del grupo, con la meseta andina y el lago Titicaca).",
    "Un rasgo distintivo: Bolivia, como Paraguay, no tiene salida al mar — la perdió en una guerra con Chile en el siglo XIX.",
    "Los 5 países comparten la misma cordillera como columna vertebral, aunque su clima varía mucho de norte a sur."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "america",
      "paisesIds": [
        "170",
        "862",
        "218",
        "604"
      ],
      "despuesDePaso": 2,
      "titulo": "Región Andina: Colombia, Venezuela, Ecuador y Perú"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué cordillera atraviesa a los 5 países de la Región Andina?",
      "opciones": [
        "Los Andes",
        "Los Alpes",
        "El Himalaya",
        "Las Rocosas"
      ],
      "respuesta": "Los Andes",
      "explicacion": "La cordillera de los Andes recorre de norte a sur los 5 países de esta región."
    },
    {
      "pregunta": "¿Cuál de estos países andinos no tiene salida al mar?",
      "opciones": [
        "Bolivia",
        "Perú",
        "Colombia",
        "Ecuador"
      ],
      "respuesta": "Bolivia",
      "explicacion": "Bolivia perdió su salida al mar frente a Chile en el siglo XIX y hoy está rodeada de tierra."
    },
    {
      "pregunta": "¿Qué país andino es el más chico y está cruzado por el ecuador terrestre?",
      "opciones": [
        "Ecuador",
        "Colombia",
        "Perú",
        "Venezuela"
      ],
      "respuesta": "Ecuador",
      "explicacion": "Ecuador debe su nombre a la línea del ecuador terrestre, que cruza su territorio."
    },
    {
      "pregunta": "¿Qué dos países andinos tienen costa sobre el mar Caribe?",
      "opciones": [
        "Colombia y Venezuela",
        "Perú y Bolivia",
        "Ecuador y Perú",
        "Bolivia y Colombia"
      ],
      "respuesta": "Colombia y Venezuela",
      "explicacion": "Son los dos países andinos más al norte, ambos con costa caribeña además de la andina."
    }
  ]
}$geografia$::jsonb,
  2,
  true),

('geografia-clase-centroamerica-y-caribe', 'Centroamérica y el Caribe: el istmo y las islas',
  'El puente de tierra entre México y Sudamérica, más las islas del mar Caribe.',
  'geografia',
  $geografia${
  "pasos": [
    "Esta sub-región combina dos partes: el istmo centroamericano (una franja de tierra) y las islas del mar Caribe.",
    "En el istmo: Guatemala (el más al norte), Costa Rica y Panamá (los más al sur, antes de llegar a Sudamérica).",
    "En las islas: Cuba (la más grande), República Dominicana y Jamaica.",
    "Un rasgo distintivo: a diferencia de Sudamérica (un bloque continuo), acá se combinan tierra firme angosta e islas — dos tipos de geografía distintos en la misma sub-región."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "america",
      "paisesIds": [
        "320",
        "188",
        "591",
        "192"
      ],
      "despuesDePaso": 2,
      "titulo": "Guatemala, Costa Rica, Panamá y Cuba"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué dos tipos de geografía combina esta sub-región?",
      "opciones": [
        "Istmo (tierra firme) e islas",
        "Solo islas",
        "Solo cordillera",
        "Solo desierto"
      ],
      "respuesta": "Istmo (tierra firme) e islas",
      "explicacion": "Centroamérica es una franja de tierra firme; el Caribe son islas — dos geografías distintas en la misma sub-región."
    },
    {
      "pregunta": "¿Cuál es la isla más grande del Caribe, mencionada en esta lección?",
      "opciones": [
        "Cuba",
        "Jamaica",
        "República Dominicana",
        "Puerto Rico"
      ],
      "respuesta": "Cuba",
      "explicacion": "Cuba es la isla más grande del Caribe."
    },
    {
      "pregunta": "¿Cuál es el país centroamericano que conecta el istmo con Sudamérica?",
      "opciones": [
        "Panamá",
        "Guatemala",
        "Costa Rica",
        "Cuba"
      ],
      "respuesta": "Panamá",
      "explicacion": "Panamá, en el extremo sur del istmo, limita con Colombia."
    },
    {
      "pregunta": "¿Cuál de estos países pertenece al istmo centroamericano, no a las islas del Caribe?",
      "opciones": [
        "Costa Rica",
        "Cuba",
        "Jamaica",
        "República Dominicana"
      ],
      "respuesta": "Costa Rica",
      "explicacion": "Costa Rica es parte de la franja de tierra firme centroamericana, no una isla."
    }
  ]
}$geografia$::jsonb,
  3,
  true),

('geografia-clase-norteamerica', 'Norteamérica: Estados Unidos, Canadá y México',
  'Los 3 países grandes del norte del continente, de mayor a menor tamaño: Canadá, Estados Unidos y México.',
  'geografia',
  $geografia${
  "pasos": [
    "Norteamérica, en esta sub-región, agrupa a solo 3 países — pero entre los más grandes del mundo.",
    "Canadá, el más al norte, es el segundo país más grande del mundo por superficie, aunque con poca población comparada con su tamaño.",
    "Estados Unidos, al sur de Canadá, se extiende de costa a costa entre el océano Pacífico y el Atlántico.",
    "México, el más al sur de los 3, conecta Norteamérica con el istmo centroamericano."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "america",
      "paisesIds": [
        "124",
        "840",
        "484"
      ],
      "despuesDePaso": 2,
      "titulo": "Canadá, Estados Unidos y México"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de los 3 países de Norteamérica es el más grande por superficie?",
      "opciones": [
        "Canadá",
        "Estados Unidos",
        "México",
        "Los tres tienen el mismo tamaño"
      ],
      "respuesta": "Canadá",
      "explicacion": "Canadá es el segundo país más grande del mundo por superficie, más grande que Estados Unidos."
    },
    {
      "pregunta": "¿Qué país conecta Norteamérica con el istmo centroamericano?",
      "opciones": [
        "México",
        "Canadá",
        "Estados Unidos",
        "Guatemala"
      ],
      "respuesta": "México",
      "explicacion": "México es el país más al sur de los 3 y limita con Guatemala, ya en Centroamérica."
    },
    {
      "pregunta": "¿Entre qué dos océanos se extiende Estados Unidos, de costa a costa?",
      "opciones": [
        "El Pacífico y el Atlántico",
        "El Atlántico y el Índico",
        "El Pacífico y el Índico",
        "El Ártico y el Atlántico"
      ],
      "respuesta": "El Pacífico y el Atlántico",
      "explicacion": "Estados Unidos tiene costa sobre ambos océanos, de costa a costa."
    }
  ]
}$geografia$::jsonb,
  4,
  true),

('geografia-clase-europa-occidental', 'Europa Occidental: Francia, Alemania, Países Bajos y Bélgica',
  'El bloque de países más al oeste del centro de Europa, con algunas de las economías más grandes del continente.',
  'geografia',
  $geografia${
  "pasos": [
    "Europa Occidental agrupa a los países del oeste-centro del continente, entre el Atlántico y Alemania.",
    "Francia, el más grande de los 4, tiene costa tanto en el Atlántico como en el Mediterráneo.",
    "Alemania, al este de Francia, es el país más poblado de la región y comparte frontera con muchos vecinos.",
    "Países Bajos y Bélgica, los más chicos de los 4, quedan pegados al mar del Norte, entre Francia y Alemania."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "europa",
      "paisesIds": [
        "250",
        "276",
        "528",
        "056"
      ],
      "despuesDePaso": 2,
      "titulo": "Francia, Alemania, Países Bajos y Bélgica"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué país de Europa Occidental tiene costa tanto en el Atlántico como en el Mediterráneo?",
      "opciones": [
        "Francia",
        "Alemania",
        "Países Bajos",
        "Bélgica"
      ],
      "respuesta": "Francia",
      "explicacion": "Francia es el único de los 4 con costa en ambos mares."
    },
    {
      "pregunta": "¿Cuáles son los dos países más chicos del grupo, pegados al mar del Norte?",
      "opciones": [
        "Países Bajos y Bélgica",
        "Francia y Alemania",
        "Alemania y Bélgica",
        "Francia y Países Bajos"
      ],
      "respuesta": "Países Bajos y Bélgica",
      "explicacion": "Ambos son mucho más chicos que Francia o Alemania y quedan sobre el mar del Norte."
    },
    {
      "pregunta": "¿Qué país de Europa Occidental es el más poblado de la región?",
      "opciones": [
        "Alemania",
        "Bélgica",
        "Países Bajos",
        "Ninguno, todos tienen la misma población"
      ],
      "respuesta": "Alemania",
      "explicacion": "Alemania tiene la mayor población de los 4 países de esta sub-región."
    }
  ]
}$geografia$::jsonb,
  1,
  true),

('geografia-clase-europa-del-este', 'Europa del Este: Polonia, Ucrania, Hungría y Rumania',
  'El bloque entre Alemania y Rusia, con Ucrania como el país más grande de los 4 por superficie.',
  'geografia',
  $geografia${
  "pasos": [
    "Europa del Este agrupa a los países entre Alemania y Rusia, muchos de ellos antiguos miembros del bloque soviético.",
    "Polonia, al este de Alemania, es uno de los países más poblados de la región.",
    "Ucrania, más al este, es el país más grande de los 4 por superficie — una de las mayores llanuras agrícolas de Europa.",
    "Hungría y Rumania, más al sur, completan el grupo, ambos en la cuenca del río Danubio."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "europa",
      "paisesIds": [
        "616",
        "804",
        "348",
        "642"
      ],
      "despuesDePaso": 2,
      "titulo": "Polonia, Ucrania, Hungría y Rumania"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos 4 países de Europa del Este es el más grande por superficie?",
      "opciones": [
        "Ucrania",
        "Polonia",
        "Hungría",
        "Rumania"
      ],
      "respuesta": "Ucrania",
      "explicacion": "Ucrania es, por lejos, el más grande de los 4 por superficie."
    },
    {
      "pregunta": "¿Qué río atraviesa tanto a Hungría como a Rumania?",
      "opciones": [
        "El Danubio",
        "El Rin",
        "El Volga",
        "El Sena"
      ],
      "respuesta": "El Danubio",
      "explicacion": "El Danubio atraviesa varios países de Europa del Este, incluidos Hungría y Rumania."
    },
    {
      "pregunta": "¿Qué país queda al este de Alemania, iniciando el bloque de Europa del Este?",
      "opciones": [
        "Polonia",
        "Ucrania",
        "Rumania",
        "Hungría"
      ],
      "respuesta": "Polonia",
      "explicacion": "Polonia es el país que limita directamente con Alemania por el este."
    }
  ]
}$geografia$::jsonb,
  2,
  true),

('geografia-clase-escandinavia-baltico', 'Escandinavia y el Báltico: Suecia, Noruega, Dinamarca y Finlandia',
  'El bloque del norte de Europa, con climas fríos y una economía basada históricamente en el mar.',
  'geografia',
  $geografia${
  "pasos": [
    "Esta sub-región agrupa a los países nórdicos, en el extremo norte de Europa.",
    "Suecia y Noruega comparten la península escandinava; Noruega, con su costa de fiordos, mira al Atlántico, y Suecia al mar Báltico.",
    "Dinamarca, el más chico y el más al sur de los 4, conecta la península escandinava con el resto de Europa continental.",
    "Finlandia, al este de Suecia, se distingue por sus miles de lagos y su larga frontera con Rusia."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "europa",
      "paisesIds": [
        "752",
        "578",
        "208",
        "246"
      ],
      "despuesDePaso": 2,
      "titulo": "Suecia, Noruega, Dinamarca y Finlandia"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué dos países comparten la península escandinava?",
      "opciones": [
        "Suecia y Noruega",
        "Suecia y Dinamarca",
        "Noruega y Finlandia",
        "Dinamarca y Finlandia"
      ],
      "respuesta": "Suecia y Noruega",
      "explicacion": "Ambos países ocupan la misma península, con Noruega al oeste y Suecia al este."
    },
    {
      "pregunta": "¿Cuál de los 4 países nórdicos es el más chico y el más al sur?",
      "opciones": [
        "Dinamarca",
        "Suecia",
        "Noruega",
        "Finlandia"
      ],
      "respuesta": "Dinamarca",
      "explicacion": "Dinamarca es el más chico de los 4 y el que conecta la región con el resto de Europa continental."
    },
    {
      "pregunta": "¿Qué país nórdico tiene una larga frontera con Rusia?",
      "opciones": [
        "Finlandia",
        "Dinamarca",
        "Noruega",
        "Suecia"
      ],
      "respuesta": "Finlandia",
      "explicacion": "Finlandia limita al este con Rusia a lo largo de una frontera extensa."
    }
  ]
}$geografia$::jsonb,
  3,
  true),

('geografia-clase-region-mediterranea', 'Región Mediterránea: España, Italia, Grecia y Portugal',
  'El sur de Europa, con climas cálidos y costa sobre el mar Mediterráneo (salvo Portugal, sobre el Atlántico).',
  'geografia',
  $geografia${
  "pasos": [
    "La Región Mediterránea agrupa a los países del sur de Europa, la mayoría con costa sobre el mar Mediterráneo.",
    "España e Italia son los dos más grandes del grupo — España en la península ibérica, Italia en la península itálica.",
    "Grecia, en el extremo sureste, tiene miles de islas propias repartidas por el mar Egeo.",
    "Portugal es la excepción: comparte península con España, pero toda su costa mira al océano Atlántico, no al Mediterráneo."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "europa",
      "paisesIds": [
        "724",
        "380",
        "300",
        "620"
      ],
      "despuesDePaso": 2,
      "titulo": "España, Italia, Grecia y Portugal"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos 4 países NO tiene costa sobre el mar Mediterráneo?",
      "opciones": [
        "Portugal",
        "España",
        "Italia",
        "Grecia"
      ],
      "respuesta": "Portugal",
      "explicacion": "Toda la costa de Portugal mira al océano Atlántico, no al Mediterráneo."
    },
    {
      "pregunta": "¿Qué país mediterráneo tiene miles de islas propias en el mar Egeo?",
      "opciones": [
        "Grecia",
        "España",
        "Italia",
        "Portugal"
      ],
      "respuesta": "Grecia",
      "explicacion": "Grecia tiene miles de islas repartidas por el mar Egeo, un rasgo muy distintivo del país."
    },
    {
      "pregunta": "¿Qué dos países comparten la península ibérica dentro de esta sub-región?",
      "opciones": [
        "España y Portugal",
        "España e Italia",
        "Italia y Grecia",
        "Portugal e Italia"
      ],
      "respuesta": "España y Portugal",
      "explicacion": "Ambos comparten la misma península, en el suroeste de Europa."
    }
  ]
}$geografia$::jsonb,
  4,
  true),

('geografia-clase-norte-de-africa-magreb', 'Norte de África (Magreb): Marruecos, Argelia, Túnez y Libia',
  'El bloque al norte del Sahara, entre el Mediterráneo y el gran desierto.',
  'geografia',
  $geografia${
  "pasos": [
    "El Magreb es el bloque de países del norte de África, al norte del desierto del Sahara y con costa sobre el mar Mediterráneo.",
    "Marruecos, el más al oeste, es el más cercano a Europa — separado de España por el estrecho de Gibraltar.",
    "Argelia, al este de Marruecos, es el país más grande de África por superficie.",
    "Túnez y Libia completan el bloque hacia el este, ambos también con costa mediterránea."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "africa",
      "paisesIds": [
        "504",
        "012",
        "788",
        "434"
      ],
      "despuesDePaso": 2,
      "titulo": "Marruecos, Argelia, Túnez y Libia"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué mar separa a Marruecos de España, en su punto más angosto?",
      "opciones": [
        "El estrecho de Gibraltar",
        "El mar Rojo",
        "El golfo Pérsico",
        "El canal de Suez"
      ],
      "respuesta": "El estrecho de Gibraltar",
      "explicacion": "El estrecho de Gibraltar es el paso angosto que separa el norte de Marruecos del sur de España."
    },
    {
      "pregunta": "¿Cuál de estos 4 países del Magreb es el más grande de África por superficie?",
      "opciones": [
        "Argelia",
        "Marruecos",
        "Túnez",
        "Libia"
      ],
      "respuesta": "Argelia",
      "explicacion": "Argelia es el país más grande de todo el continente africano por superficie."
    },
    {
      "pregunta": "¿Sobre qué mar tienen costa los 4 países del Magreb?",
      "opciones": [
        "El mar Mediterráneo",
        "El mar Rojo",
        "El océano Índico",
        "El golfo de Guinea"
      ],
      "respuesta": "El mar Mediterráneo",
      "explicacion": "Los 4 países del Magreb comparten costa sobre el mar Mediterráneo, al norte del Sahara."
    }
  ]
}$geografia$::jsonb,
  1,
  true),

('geografia-clase-africa-occidental', 'África Occidental: Nigeria, Ghana, Senegal y Costa de Marfil',
  'El bloque costero sobre el golfo de Guinea, con Nigeria como el país más poblado de todo el continente.',
  'geografia',
  $geografia${
  "pasos": [
    "África Occidental agrupa a los países costeros sobre el golfo de Guinea, en el oeste del continente.",
    "Nigeria, el más al este de los 4, es el país más poblado de toda África.",
    "Ghana, más al oeste, tiene costa directa sobre el golfo de Guinea, igual que Costa de Marfil, su vecino.",
    "Senegal, el más al norte y al oeste de los 4, es la punta más occidental del continente africano."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "africa",
      "paisesIds": [
        "566",
        "288",
        "686",
        "384"
      ],
      "despuesDePaso": 2,
      "titulo": "Nigeria, Ghana, Senegal y Costa de Marfil"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué país de África Occidental es el más poblado de todo el continente?",
      "opciones": [
        "Nigeria",
        "Ghana",
        "Senegal",
        "Costa de Marfil"
      ],
      "respuesta": "Nigeria",
      "explicacion": "Nigeria es, por lejos, el país más poblado de África."
    },
    {
      "pregunta": "¿Sobre qué golfo tienen costa Nigeria, Ghana y Costa de Marfil?",
      "opciones": [
        "El golfo de Guinea",
        "El golfo Pérsico",
        "El golfo de Adén",
        "El golfo de Omán"
      ],
      "respuesta": "El golfo de Guinea",
      "explicacion": "Los tres países comparten costa sobre el golfo de Guinea, en el oeste de África."
    },
    {
      "pregunta": "¿Cuál de estos 4 países queda en la punta más occidental del continente africano?",
      "opciones": [
        "Senegal",
        "Nigeria",
        "Ghana",
        "Costa de Marfil"
      ],
      "respuesta": "Senegal",
      "explicacion": "Senegal ocupa el extremo más al oeste de todo el continente africano."
    }
  ]
}$geografia$::jsonb,
  2,
  true),

('geografia-clase-africa-oriental', 'África Oriental: Kenia, Etiopía, Tanzania y Uganda',
  'El bloque del este del continente, atravesado por el Gran Valle del Rift y algunos de los lagos más grandes de África.',
  'geografia',
  $geografia${
  "pasos": [
    "África Oriental agrupa a los países del este del continente, atravesados por el Gran Valle del Rift.",
    "Kenia y Tanzania tienen costa sobre el océano Índico y comparten algunas de las sabanas más conocidas de África.",
    "Etiopía, más al norte, no tiene salida al mar y es uno de los países más antiguos del continente en mantener su independencia.",
    "Uganda, en el interior, está atravesada por el lago Victoria, uno de los lagos más grandes del mundo, compartido con Kenia y Tanzania."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "africa",
      "paisesIds": [
        "404",
        "231",
        "834",
        "800"
      ],
      "despuesDePaso": 2,
      "titulo": "Kenia, Etiopía, Tanzania y Uganda"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué gran accidente geográfico atraviesa a los países de África Oriental?",
      "opciones": [
        "El Gran Valle del Rift",
        "El desierto del Sahara",
        "La cordillera del Atlas",
        "El río Congo"
      ],
      "respuesta": "El Gran Valle del Rift",
      "explicacion": "El Gran Valle del Rift es una enorme fractura geológica que recorre África Oriental de norte a sur."
    },
    {
      "pregunta": "¿Cuál de estos 4 países de África Oriental no tiene salida al mar?",
      "opciones": [
        "Etiopía",
        "Kenia",
        "Tanzania",
        "Ninguno, los 4 tienen costa"
      ],
      "respuesta": "Etiopía",
      "explicacion": "Etiopía está en el interior, rodeada por Eritrea, Yibuti, Somalia, Kenia, Sudán del Sur y Sudán."
    },
    {
      "pregunta": "¿Qué lago grande comparten Uganda, Kenia y Tanzania?",
      "opciones": [
        "El lago Victoria",
        "El lago Titicaca",
        "El mar Muerto",
        "El lago Baikal"
      ],
      "respuesta": "El lago Victoria",
      "explicacion": "El lago Victoria es uno de los lagos más grandes del mundo y está compartido por los tres países."
    }
  ]
}$geografia$::jsonb,
  3,
  true),

('geografia-clase-africa-austral', 'África Austral: Sudáfrica, Namibia, Botsuana y Zimbabue',
  'El bloque del extremo sur del continente, con Sudáfrica como el país más desarrollado económicamente de la región.',
  'geografia',
  $geografia${
  "pasos": [
    "África Austral agrupa a los países del extremo sur del continente.",
    "Sudáfrica, en la punta sur, tiene costa sobre dos océanos: el Atlántico y el Índico.",
    "Namibia, al noroeste de Sudáfrica, tiene costa sobre el Atlántico y una larga franja recta hacia el este (la Franja de Caprivi).",
    "Botsuana y Zimbabue, en el interior, no tienen salida al mar y comparten frontera tanto con Sudáfrica como con Namibia o Zambia."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "africa",
      "paisesIds": [
        "710",
        "516",
        "072",
        "716"
      ],
      "despuesDePaso": 2,
      "titulo": "Sudáfrica, Namibia, Botsuana y Zimbabue"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Sobre qué dos océanos tiene costa Sudáfrica?",
      "opciones": [
        "El Atlántico y el Índico",
        "El Atlántico y el Pacífico",
        "El Índico y el Pacífico",
        "Solo el Índico"
      ],
      "respuesta": "El Atlántico y el Índico",
      "explicacion": "Sudáfrica está en la punta sur del continente, con costa sobre ambos océanos."
    },
    {
      "pregunta": "¿Cuáles de estos 4 países de África Austral no tienen salida al mar?",
      "opciones": [
        "Botsuana y Zimbabue",
        "Sudáfrica y Namibia",
        "Solo Sudáfrica",
        "Ninguno, los 4 tienen costa"
      ],
      "respuesta": "Botsuana y Zimbabue",
      "explicacion": "Ambos están en el interior del continente, rodeados de tierra."
    },
    {
      "pregunta": "¿Qué país de África Austral tiene una larga franja recta hacia el este (la Franja de Caprivi)?",
      "opciones": [
        "Namibia",
        "Sudáfrica",
        "Botsuana",
        "Zimbabue"
      ],
      "respuesta": "Namibia",
      "explicacion": "La Franja de Caprivi es una prolongación angosta y recta del territorio de Namibia."
    }
  ]
}$geografia$::jsonb,
  4,
  true),

('geografia-clase-asia-oriental', 'Asia Oriental: China, Japón, Corea del Sur y Mongolia',
  'El bloque del este de Asia, con China como el país más grande y poblado de la región.',
  'geografia',
  $geografia${
  "pasos": [
    "Asia Oriental agrupa a los países del extremo este del continente asiático.",
    "China, el más grande de los 4, domina la región tanto en territorio como en población.",
    "Japón, un archipiélago frente a la costa este de China, está separado del continente por el mar de Japón.",
    "Corea del Sur, en la península coreana, y Mongolia, en el interior entre China y Rusia, completan el bloque."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "asia_oceania",
      "paisesIds": [
        "156",
        "392",
        "410",
        "496"
      ],
      "despuesDePaso": 2,
      "titulo": "China, Japón, Corea del Sur y Mongolia"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué país de Asia Oriental es un archipiélago, separado del continente por el mar de Japón?",
      "opciones": [
        "Japón",
        "China",
        "Corea del Sur",
        "Mongolia"
      ],
      "respuesta": "Japón",
      "explicacion": "Japón está formado por varias islas, separadas del continente asiático por el mar de Japón."
    },
    {
      "pregunta": "¿Qué país de Asia Oriental queda en el interior, entre China y Rusia, sin salida al mar?",
      "opciones": [
        "Mongolia",
        "Japón",
        "Corea del Sur",
        "China"
      ],
      "respuesta": "Mongolia",
      "explicacion": "Mongolia está en el interior del continente, rodeada por China y Rusia."
    },
    {
      "pregunta": "¿En qué península está ubicada Corea del Sur?",
      "opciones": [
        "La península coreana",
        "La península arábiga",
        "Indochina",
        "La península itálica"
      ],
      "respuesta": "La península coreana",
      "explicacion": "Corea del Sur ocupa la mitad sur de la península coreana, que sobresale hacia el este de China."
    }
  ]
}$geografia$::jsonb,
  1,
  true),

('geografia-clase-sudeste-asiatico-y-meridional', 'Sudeste Asiático y Asia Meridional: Indonesia, Filipinas, Vietnam e India',
  'Dos regiones vecinas: los archipiélagos e Indochina al sureste, y el subcontinente indio al sur.',
  'geografia',
  $geografia${
  "pasos": [
    "Esta Clase combina dos regiones vecinas: el Sudeste Asiático (islas y la península de Indochina) y Asia Meridional (el subcontinente indio).",
    "Indonesia y Filipinas son archipiélagos, países formados por miles de islas, en el Sudeste Asiático.",
    "Vietnam, en la península de Indochina, se extiende como una franja larga y curva a lo largo de la costa este.",
    "India, en Asia Meridional, domina un subcontinente propio, separado del resto de Asia por el Himalaya al norte."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "asia_oceania",
      "paisesIds": [
        "360",
        "608",
        "704",
        "356"
      ],
      "despuesDePaso": 2,
      "titulo": "Indonesia, Filipinas, Vietnam e India"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué cordillera separa a India del resto de Asia por el norte?",
      "opciones": [
        "El Himalaya",
        "Los Andes",
        "Los Alpes",
        "El Atlas"
      ],
      "respuesta": "El Himalaya",
      "explicacion": "El Himalaya, la cordillera más alta del mundo, separa el subcontinente indio del resto de Asia."
    },
    {
      "pregunta": "¿Qué país de esta lección tiene forma de franja larga y curva a lo largo de la costa de Indochina?",
      "opciones": [
        "Vietnam",
        "India",
        "Indonesia",
        "Filipinas"
      ],
      "respuesta": "Vietnam",
      "explicacion": "Vietnam se extiende en una franja larga y curva a lo largo de la costa este de la península de Indochina."
    },
    {
      "pregunta": "¿Cuáles de estos 4 países son archipiélagos?",
      "opciones": [
        "Indonesia y Filipinas",
        "Vietnam e India",
        "India e Indonesia",
        "Vietnam y Filipinas"
      ],
      "respuesta": "Indonesia y Filipinas",
      "explicacion": "Ambos están formados por miles de islas, a diferencia de Vietnam e India, que son bloques de tierra continua."
    }
  ]
}$geografia$::jsonb,
  2,
  true),

('geografia-clase-oriente-medio', 'Oriente Medio: Arabia Saudita, Irán, Turquía e Israel',
  'El bloque entre el Mediterráneo y el golfo Pérsico, con Arabia Saudita como el país más grande por territorio.',
  'geografia',
  $geografia${
  "pasos": [
    "Oriente Medio agrupa a los países entre el mar Mediterráneo y el golfo Pérsico, en el suroeste de Asia.",
    "Arabia Saudita, en la península arábiga, es el país más grande de la región por territorio.",
    "Turquía, al noroeste, tiene una pequeña porción de su territorio en Europa — es el único país de esta lección con territorio en dos continentes.",
    "Irán, al este, y su vecino más pequeño, Israel, sobre la costa del Mediterráneo, completan el bloque."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "asia_oceania",
      "paisesIds": [
        "682",
        "364",
        "792",
        "376"
      ],
      "despuesDePaso": 2,
      "titulo": "Arabia Saudita, Irán, Turquía e Israel"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué país de esta lección tiene territorio en dos continentes (Asia y Europa)?",
      "opciones": [
        "Turquía",
        "Arabia Saudita",
        "Irán",
        "Israel"
      ],
      "respuesta": "Turquía",
      "explicacion": "Una pequeña porción de Turquía, al noroeste, está en Europa; el resto está en Asia."
    },
    {
      "pregunta": "¿Cuál de estos 4 países es el más grande por territorio?",
      "opciones": [
        "Arabia Saudita",
        "Israel",
        "Turquía",
        "Irán"
      ],
      "respuesta": "Arabia Saudita",
      "explicacion": "Arabia Saudita ocupa la mayor parte de la península arábiga, el más grande de los 4."
    },
    {
      "pregunta": "¿Qué país de esta lección tiene costa directa sobre el mar Mediterráneo, en el extremo oeste del grupo?",
      "opciones": [
        "Israel",
        "Irán",
        "Arabia Saudita",
        "Ninguno tiene costa mediterránea"
      ],
      "respuesta": "Israel",
      "explicacion": "Israel tiene costa sobre el mar Mediterráneo, a diferencia de Arabia Saudita e Irán."
    }
  ]
}$geografia$::jsonb,
  3,
  true),

('geografia-clase-oceania', 'Oceanía: Australia, Nueva Zelanda, Papúa Nueva Guinea y Fiyi',
  'La región más aislada de las cuatro: un continente-isla enorme y varios archipiélagos mucho más chicos.',
  'geografia',
  $geografia${
  "pasos": [
    "Oceanía es la región más aislada de las cuatro: está formada por Australia y una serie de islas repartidas por el océano Pacífico.",
    "Australia es, a la vez, un país y un continente propio — casi tan grande como toda Europa.",
    "Nueva Zelanda, al sureste de Australia, está formada por dos islas principales, con un clima mucho más frío y montañoso.",
    "Papúa Nueva Guinea, al norte de Australia, y Fiyi, más al este, son dos archipiélagos mucho más chicos, cerca del ecuador."
  ],
  "visuales": [
    {
      "tipo": "geografia.mapa",
      "continente": "asia_oceania",
      "paisesIds": [
        "036",
        "554",
        "598",
        "242"
      ],
      "despuesDePaso": 2,
      "titulo": "Australia, Nueva Zelanda, Papúa Nueva Guinea y Fiyi"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué país de Oceanía es, a la vez, un continente propio?",
      "opciones": [
        "Australia",
        "Nueva Zelanda",
        "Papúa Nueva Guinea",
        "Fiyi"
      ],
      "respuesta": "Australia",
      "explicacion": "Australia es el único país del mundo que ocupa un continente entero."
    },
    {
      "pregunta": "¿Cuál de estos países de Oceanía queda al norte de Australia, cerca del ecuador?",
      "opciones": [
        "Papúa Nueva Guinea",
        "Nueva Zelanda",
        "Ninguno, todos están al sur",
        "Fiyi"
      ],
      "respuesta": "Papúa Nueva Guinea",
      "explicacion": "Papúa Nueva Guinea está al norte de Australia, mucho más cerca del ecuador que Nueva Zelanda."
    },
    {
      "pregunta": "¿Cuántas islas principales forman Nueva Zelanda?",
      "opciones": [
        "Dos",
        "Una",
        "Cinco",
        "Ninguna, es parte del continente australiano"
      ],
      "respuesta": "Dos",
      "explicacion": "Nueva Zelanda está formada por dos islas principales, Isla Norte e Isla Sur."
    }
  ]
}$geografia$::jsonb,
  4,
  true);
