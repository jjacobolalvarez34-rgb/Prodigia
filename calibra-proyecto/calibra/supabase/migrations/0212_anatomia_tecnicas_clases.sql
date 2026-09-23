-- ============================================================
-- Prodigia — Anatomía: Técnicas | Clases completas (docs/PARIDAD_MUNDOS.md
-- filas 22 y 23). Antes Anatomía tenía 5 Técnicas (0081_mundo_anatomia.sql,
-- con quiz en 0173) y 0 Clases; la práctica evalúa huesos, músculos,
-- órganos y sistema nervioso, y Aprender no cubría casi nada de eso.
--
-- 21 Técnicas (requiere_pro=false): 5 históricas REESCRITAS por slug con UPDATE (corrige el
-- voseo de 0081 y errores de contenido, ver docs/PARIDAD_MUNDOS.md
-- "Anatomía: Técnicas | Clases") y 16 INSERT nuevas. Por sistema: óseo 5 Técnicas, muscular 6 Técnicas,
-- órganos 5 Técnicas, nervioso 5 Técnicas.
--
-- 22 Clases nuevas (requiere_pro=true): óseo 6 Clases, muscular 5 Clases,
-- órganos 5 Clases, nervioso 6 Clases. Cada sistema es un curso independiente (orden de
-- dependencia DENTRO del sistema); la primera Clase de todas (posición
-- anatómica y planos) es preview gratis. Ver src/lib/anatomia/path.ts.
--
-- 4 primitivos de visual nuevos (src/components/anatomia/visuales/):
-- "anatomia.esqueleto" (resalta huesos sobre el SVG real de dominio
-- público que ya usa la práctica), "anatomia.cuerpo" (esquema de regiones,
-- NO un dibujo anatómico), "anatomia.grupos" y "anatomia.flujo" (cajas y
-- flechas). Cada Técnica y Clase trae al menos un visual y un quiz con
-- `explicacion` y la `respuesta` literal dentro de `opciones`.
--
-- Orden de las sentencias: primero los UPDATE de las filas existentes,
-- después los INSERT — un slug nuevo nunca pisa uno existente
-- (unique (problem_type, slug)) y las columnas requiere_pro/orden ya
-- existen (0170). No se tocan technique_progress: quien ya dominó una
-- técnica histórica la sigue teniendo dominada.
--
-- Este archivo se GENERA desde src/lib/anatomia/lecciones/ (fuente única)
-- y lecciones.test.ts comprueba que coincida. No editar a mano.
-- Regenerar: ANATOMIA_ESCRIBIR_SQL=1 npx vitest run src/lib/anatomia/lecciones
-- ============================================================

update public.techniques
set nombre = 'Huesos del cráneo: agrúpalos por zona',
  descripcion = 'En vez de memorizar 10 huesos sueltos, divídelos en 3 zonas: la bóveda (frontal, parietales, temporales, occipital), el centro de la base (esfenoides y etmoides) y la cara (maxilar, mandíbula, cigomáticos, nasales).',
  contenido = $anatomia${
  "pasos": [
    "Bóveda, la «tapa» que rodea el cerebro por arriba y por los lados: frontal (la frente), 2 parietales, 2 temporales (las sienes) y occipital (la nuca).",
    "Centro de la base del cráneo, casi sin verse desde afuera: esfenoides y etmoides. Quedan entre la cara y el cerebro.",
    "Cara, los que se ven de frente: maxilar (la mandíbula superior), mandíbula (la única que se mueve), 2 cigomáticos (los pómulos) y 2 nasales (el puente de la nariz).",
    "Cifras: 8 huesos craneales (frontal, 2 parietales, 2 temporales, occipital, esfenoides y etmoides) y 14 faciales. Simplificación: aquí solo aprendes los 10 nombres que más se usan; entre los faciales faltan, por ejemplo, los lagrimales y los palatinos."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 2,
      "titulo": "Tres zonas en vez de diez huesos sueltos",
      "grupos": [
        {
          "nombre": "Bóveda",
          "items": [
            {
              "texto": "Frontal",
              "detalle": "la frente"
            },
            {
              "texto": "Parietal",
              "detalle": "2, los lados y el techo"
            },
            {
              "texto": "Temporal",
              "detalle": "2, las sienes"
            },
            {
              "texto": "Occipital",
              "detalle": "la nuca"
            }
          ]
        },
        {
          "nombre": "Centro de la base",
          "items": [
            {
              "texto": "Esfenoides",
              "detalle": "detrás de los ojos, en el centro"
            },
            {
              "texto": "Etmoides",
              "detalle": "entre los ojos, detrás de la nariz"
            }
          ]
        },
        {
          "nombre": "Cara",
          "items": [
            {
              "texto": "Maxilar",
              "detalle": "2, la mandíbula superior"
            },
            {
              "texto": "Mandíbula",
              "detalle": "la inferior, es móvil"
            },
            {
              "texto": "Cigomático",
              "detalle": "2, los pómulos"
            },
            {
              "texto": "Nasal",
              "detalle": "2, el puente de la nariz"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.esqueleto",
      "despuesDePaso": 3,
      "titulo": "El cráneo, en el esqueleto",
      "huesos": [
        "craneo"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿A qué zona pertenece el hueso frontal?",
      "opciones": [
        "Cara",
        "Bóveda",
        "Centro de la base"
      ],
      "respuesta": "Bóveda",
      "explicacion": "El frontal (la frente) forma parte de la bóveda, junto con los parietales, los temporales y el occipital."
    },
    {
      "pregunta": "¿Cuál es el hueso de la cabeza que se mueve al abrir y cerrar la boca?",
      "opciones": [
        "Maxilar",
        "Cigomático",
        "Mandíbula",
        "Occipital"
      ],
      "respuesta": "Mandíbula",
      "explicacion": "La mandíbula es el único hueso móvil del cráneo (sin contar los huesecillos del oído); el maxilar está fijo."
    },
    {
      "pregunta": "¿Qué dos huesos forman el centro de la base del cráneo, casi sin verse desde afuera?",
      "opciones": [
        "Maxilar y mandíbula",
        "Frontal y parietal",
        "Esfenoides y etmoides",
        "Cigomático y nasal"
      ],
      "respuesta": "Esfenoides y etmoides",
      "explicacion": "Esfenoides y etmoides quedan entre la cara y el cerebro, por eso casi no se ven desde afuera."
    },
    {
      "pregunta": "¿Cuántos huesos craneales (los que protegen el cerebro) hay en total?",
      "opciones": [
        "22",
        "14",
        "8",
        "10"
      ],
      "respuesta": "8",
      "explicacion": "Frontal, 2 parietales, 2 temporales, occipital, esfenoides y etmoides: 8. Los otros 14 son faciales (22 en total)."
    }
  ]
}$anatomia$::jsonb,
  orden = 1,
  requiere_pro = false
where problem_type = 'anatomia' and slug = 'anatomia-craneo-por-zona';

update public.techniques
set nombre = 'De lo simple a lo compuesto: primero el cuerpo, después la cabeza',
  descripcion = 'Los músculos grandes (bíceps, cuádriceps, pectoral, trapecio...) son los que ya conoces por el ejercicio: empieza por esos. Los de la cabeza y el cuello son un grupo aparte, más fino: déjalos para cuando el primer grupo esté firme.',
  contenido = $anatomia${
  "pasos": [
    "Grupo 1 (grande y cotidiano): bíceps, tríceps, deltoides, pectoral mayor, recto abdominal, trapecio, dorsal ancho, glúteos, cuádriceps y gastrocnemio.",
    "Domina ese grupo primero: son los que más se repiten y los que puedes notar en tu propio cuerpo al moverte.",
    "Grupo 2 (cabeza y cuello, más fino): frontal, orbicular de los ojos, orbicular de la boca, cigomático mayor, buccinador, masetero, temporal, occipital y platisma.",
    "Es el mismo truco que con los países en Geografía: lo grande y conocido primero, lo específico después."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 2,
      "titulo": "Dos grupos, en este orden de estudio",
      "grupos": [
        {
          "nombre": "1. Cuerpo (grandes)",
          "items": [
            {
              "texto": "Bíceps"
            },
            {
              "texto": "Tríceps"
            },
            {
              "texto": "Deltoides"
            },
            {
              "texto": "Pectoral mayor"
            },
            {
              "texto": "Recto abdominal"
            },
            {
              "texto": "Trapecio"
            },
            {
              "texto": "Dorsal ancho"
            },
            {
              "texto": "Glúteos"
            },
            {
              "texto": "Cuádriceps"
            },
            {
              "texto": "Gastrocnemio"
            }
          ]
        },
        {
          "nombre": "2. Cabeza y cuello (finos)",
          "items": [
            {
              "texto": "Frontal"
            },
            {
              "texto": "Orbicular de los ojos"
            },
            {
              "texto": "Orbicular de la boca"
            },
            {
              "texto": "Cigomático mayor"
            },
            {
              "texto": "Buccinador"
            },
            {
              "texto": "Masetero"
            },
            {
              "texto": "Temporal"
            },
            {
              "texto": "Occipital"
            },
            {
              "texto": "Platisma"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "Según esta técnica, ¿qué grupo de músculos conviene dominar primero?",
      "opciones": [
        "Los de la cabeza y el cuello",
        "Los dos grupos a la vez, sin orden",
        "Los grandes y cotidianos (bíceps, cuádriceps, pectoral...)",
        "Ninguno en particular"
      ],
      "respuesta": "Los grandes y cotidianos (bíceps, cuádriceps, pectoral...)",
      "explicacion": "Son los que más se repiten y los más fáciles de reconocer en tu propio cuerpo."
    },
    {
      "pregunta": "¿Cuál de estos es un músculo del grupo grande y cotidiano?",
      "opciones": [
        "Masetero",
        "Buccinador",
        "Cuádriceps",
        "Orbicular de la boca"
      ],
      "respuesta": "Cuádriceps",
      "explicacion": "El cuádriceps está en el grupo 1, junto con bíceps, tríceps, pectoral mayor y trapecio."
    },
    {
      "pregunta": "¿Cuál de estos es un músculo del grupo de la cabeza y el cuello?",
      "opciones": [
        "Bíceps",
        "Masetero",
        "Trapecio",
        "Glúteos"
      ],
      "respuesta": "Masetero",
      "explicacion": "El masetero (masticación) está en la mejilla: es del grupo 2."
    }
  ]
}$anatomia$::jsonb,
  orden = 1,
  requiere_pro = false
where problem_type = 'anatomia' and slug = 'anatomia-simple-a-compuesto';

update public.techniques
set nombre = 'El nombre del músculo ya te dice dónde está',
  descripcion = 'Muchos nombres de músculos de la cabeza son literales: «orbicular» rodea una órbita (ojo o boca), «temporal» está en la sien y «occipital» en la nuca. Lee el nombre antes de memorizarlo.',
  contenido = $anatomia${
  "pasos": [
    "Orbicular de los ojos: forma un círculo alrededor del ojo y cierra los párpados.",
    "Orbicular de la boca: el mismo patrón, alrededor de la boca; cierra y frunce los labios.",
    "Cigomático mayor: se ancla en el hueso cigomático (el pómulo) y sube la comisura de la boca: es el músculo de la sonrisa.",
    "Frontal (la frente), temporal (la sien) y occipital (la nuca) repiten el nombre del hueso que cubren. Cuidado: el mismo nombre sirve para el hueso y para el músculo; el contexto te dice cuál es."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "El nombre como pista",
      "grupos": [
        {
          "nombre": "Rodean algo",
          "items": [
            {
              "texto": "Orbicular de los ojos",
              "detalle": "círculo alrededor del ojo"
            },
            {
              "texto": "Orbicular de la boca",
              "detalle": "círculo alrededor de la boca"
            }
          ]
        },
        {
          "nombre": "Se anclan en un hueso",
          "items": [
            {
              "texto": "Cigomático mayor",
              "detalle": "hueso cigomático (pómulo)"
            }
          ]
        },
        {
          "nombre": "Cubren una zona",
          "items": [
            {
              "texto": "Frontal",
              "detalle": "la frente"
            },
            {
              "texto": "Temporal",
              "detalle": "la sien"
            },
            {
              "texto": "Occipital",
              "detalle": "la nuca"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Por qué se llama «orbicular» el músculo que rodea el ojo?",
      "opciones": [
        "Porque forma un círculo alrededor del ojo",
        "Es un nombre arbitrario",
        "Porque solo se mueve en órbitas grandes",
        "Porque está dentro de la órbita ósea"
      ],
      "respuesta": "Porque forma un círculo alrededor del ojo",
      "explicacion": "El nombre describe la forma circular del músculo: la técnica es leer el nombre como pista."
    },
    {
      "pregunta": "El músculo temporal está en...",
      "opciones": [
        "La nuca",
        "La sien",
        "El cuello",
        "La mandíbula inferior"
      ],
      "respuesta": "La sien",
      "explicacion": "Temporal designa la región de la sien, a los lados de la cabeza."
    },
    {
      "pregunta": "¿Dónde se ancla el cigomático mayor?",
      "opciones": [
        "En el hueso frontal",
        "En la mandíbula",
        "En el hueso cigomático (el pómulo)",
        "En el hueso occipital"
      ],
      "respuesta": "En el hueso cigomático (el pómulo)",
      "explicacion": "El nombre señala directamente el hueso al que se une."
    }
  ]
}$anatomia$::jsonb,
  orden = 5,
  requiere_pro = false
where problem_type = 'anatomia' and slug = 'anatomia-nombre-del-musculo';

update public.techniques
set nombre = 'Los órganos, por cavidad',
  descripcion = 'Los 10 órganos principales viven en 4 cavidades: craneal (cerebro), torácica (corazón, pulmones), abdominal (hígado, estómago, riñones, intestino, páncreas, bazo) y pélvica (vejiga). Ubícalos por cavidad, no como una lista suelta.',
  contenido = $anatomia${
  "pasos": [
    "Craneal (dentro de la cabeza): el cerebro.",
    "Torácica (el pecho): el corazón y los pulmones.",
    "Abdominal (la «panza»): hígado, estómago, riñones, intestino, páncreas y bazo.",
    "Pélvica (la parte más baja del tronco): la vejiga. Simplificación: algunos órganos quedan detrás de la membrana que envuelve el abdomen (riñones, páncreas) y el tramo final del intestino, el recto, está en la pelvis; a nivel colegio se ubican en la cavidad abdominal."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Cuatro cavidades",
      "grupos": [
        {
          "nombre": "Cavidad craneal (dentro del cráneo (cabeza))",
          "items": [
            {
              "texto": "Cerebro"
            }
          ]
        },
        {
          "nombre": "Cavidad torácica (el tórax (pecho), sobre el diafragma)",
          "items": [
            {
              "texto": "Corazón"
            },
            {
              "texto": "Pulmones"
            }
          ]
        },
        {
          "nombre": "Cavidad abdominal (bajo el diafragma, hasta el borde de la pelvis)",
          "items": [
            {
              "texto": "Hígado"
            },
            {
              "texto": "Estómago"
            },
            {
              "texto": "Riñones"
            },
            {
              "texto": "Intestino"
            },
            {
              "texto": "Páncreas"
            },
            {
              "texto": "Bazo"
            }
          ]
        },
        {
          "nombre": "Cavidad pélvica (dentro de la pelvis, la parte más baja del tronco)",
          "items": [
            {
              "texto": "Vejiga"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.cuerpo",
      "despuesDePaso": 3,
      "titulo": "Dónde queda cada órgano",
      "entradas": [
        {
          "nombre": "Cerebro",
          "regiones": [
            "cabeza"
          ],
          "detalle": "dentro del cráneo"
        },
        {
          "nombre": "Corazón",
          "regiones": [
            "torax"
          ],
          "detalle": "en el centro del tórax, algo inclinado a la izquierda"
        },
        {
          "nombre": "Pulmones",
          "regiones": [
            "torax"
          ],
          "detalle": "uno a cada lado del corazón"
        },
        {
          "nombre": "Hígado",
          "regiones": [
            "abdomen"
          ],
          "detalle": "arriba a la derecha del abdomen"
        },
        {
          "nombre": "Estómago",
          "regiones": [
            "abdomen"
          ],
          "detalle": "arriba a la izquierda del abdomen"
        },
        {
          "nombre": "Bazo",
          "regiones": [
            "abdomen"
          ],
          "detalle": "arriba a la izquierda, junto al estómago"
        },
        {
          "nombre": "Páncreas",
          "regiones": [
            "abdomen"
          ],
          "detalle": "detrás del estómago"
        },
        {
          "nombre": "Riñones",
          "regiones": [
            "abdomen"
          ],
          "detalle": "en la parte de atrás del abdomen, a cada lado de la columna"
        },
        {
          "nombre": "Intestino",
          "regiones": [
            "abdomen"
          ],
          "detalle": "ocupa gran parte del abdomen; el tramo final baja a la pelvis"
        },
        {
          "nombre": "Vejiga",
          "regiones": [
            "pelvis"
          ],
          "detalle": "en la pelvis, detrás del pubis"
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿En qué cavidad está el hígado?",
      "opciones": [
        "Torácica",
        "Abdominal",
        "Pélvica",
        "Craneal"
      ],
      "respuesta": "Abdominal",
      "explicacion": "El hígado está en la cavidad abdominal, arriba a la derecha, junto con estómago, riñones, intestino, páncreas y bazo."
    },
    {
      "pregunta": "¿Qué órganos están en la cavidad torácica?",
      "opciones": [
        "Hígado y estómago",
        "Corazón y pulmones",
        "Vejiga",
        "Cerebro"
      ],
      "respuesta": "Corazón y pulmones",
      "explicacion": "El tórax (el pecho) contiene el corazón y los pulmones."
    },
    {
      "pregunta": "¿Cuál de estos órganos está en la cavidad pélvica?",
      "opciones": [
        "Vejiga",
        "Riñones",
        "Bazo",
        "Páncreas"
      ],
      "respuesta": "Vejiga",
      "explicacion": "La vejiga es el órgano de la lista que queda dentro de la pelvis."
    },
    {
      "pregunta": "¿Qué órgano de la lista vive en la cavidad craneal?",
      "opciones": [
        "Corazón",
        "Cerebro",
        "Bazo",
        "Pulmones"
      ],
      "respuesta": "Cerebro",
      "explicacion": "El cerebro está dentro del cráneo, protegido por los huesos craneales."
    }
  ]
}$anatomia$::jsonb,
  orden = 1,
  requiere_pro = false
where problem_type = 'anatomia' and slug = 'anatomia-organos-por-cavidad';

update public.techniques
set nombre = 'Pares craneales: agrúpalos por función, no por número',
  descripcion = 'En vez de memorizar los 12 en fila, sepáralos en 3 grupos según lo que hacen: sensitivos (I olfatorio, II óptico, VIII vestibulococlear), motores (III oculomotor, IV troclear, VI abducens, XI accesorio, XII hipogloso) y mixtos (V trigémino, VII facial, IX glosofaríngeo, X vago).',
  contenido = $anatomia${
  "pasos": [
    "Sensitivos (solo llevan información al encéfalo): I olfatorio, II óptico y VIII vestibulococlear.",
    "Motores (solo llevan órdenes a un músculo): III oculomotor, IV troclear, VI abducens, XI accesorio y XII hipogloso.",
    "Mixtos (hacen las dos cosas): V trigémino, VII facial, IX glosofaríngeo y X vago.",
    "Son 3 categorías de 3 a 5 pares en vez de una lista de 12. Simplificación: algunos pares «motores» llevan además fibras del sistema autónomo (el III cierra la pupila) y algunos textos clasifican distinto el XI; esta es la clasificación clásica de colegio."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Tres grupos de pares craneales",
      "grupos": [
        {
          "nombre": "Sensitivos: solo llevan información al encéfalo",
          "items": [
            {
              "texto": "Olfatorio",
              "marca": "I"
            },
            {
              "texto": "Óptico",
              "marca": "II"
            },
            {
              "texto": "Vestibulococlear",
              "marca": "VIII"
            }
          ]
        },
        {
          "nombre": "Motores: solo llevan órdenes a un músculo",
          "items": [
            {
              "texto": "Oculomotor",
              "marca": "III"
            },
            {
              "texto": "Troclear",
              "marca": "IV"
            },
            {
              "texto": "Abducens",
              "marca": "VI"
            },
            {
              "texto": "Accesorio",
              "marca": "XI"
            },
            {
              "texto": "Hipogloso",
              "marca": "XII"
            }
          ]
        },
        {
          "nombre": "Mixtos: hacen las dos cosas",
          "items": [
            {
              "texto": "Trigémino",
              "marca": "V"
            },
            {
              "texto": "Facial",
              "marca": "VII"
            },
            {
              "texto": "Glosofaríngeo",
              "marca": "IX"
            },
            {
              "texto": "Vago",
              "marca": "X"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿A qué grupo pertenece el nervio óptico (II), según esta técnica?",
      "opciones": [
        "Motor",
        "Mixto",
        "Sensitivo"
      ],
      "respuesta": "Sensitivo",
      "explicacion": "Junto con el olfatorio y el vestibulococlear, solo lleva información al encéfalo: no mueve nada."
    },
    {
      "pregunta": "¿Cuál de estos pares craneales es motor?",
      "opciones": [
        "Óptico (II)",
        "Abducens (VI)",
        "Trigémino (V)",
        "Vago (X)"
      ],
      "respuesta": "Abducens (VI)",
      "explicacion": "Junto con oculomotor, troclear, accesorio e hipogloso, solo lleva órdenes a músculos."
    },
    {
      "pregunta": "¿Qué tienen en común el trigémino, el facial, el glosofaríngeo y el vago?",
      "opciones": [
        "Son todos sensitivos",
        "Son todos motores",
        "Son mixtos: llevan información y órdenes",
        "No se conoce su función"
      ],
      "respuesta": "Son mixtos: llevan información y órdenes",
      "explicacion": "Es el tercer grupo de la técnica: los que hacen las dos cosas."
    },
    {
      "pregunta": "¿Cuántos pares craneales son mixtos?",
      "opciones": [
        "3",
        "4",
        "5",
        "12"
      ],
      "respuesta": "4",
      "explicacion": "Los mixtos son el V, VII, IX y X: cuatro pares."
    }
  ]
}$anatomia$::jsonb,
  orden = 1,
  requiere_pro = false
where problem_type = 'anatomia' and slug = 'anatomia-nervios-por-funcion';

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

('anatomia-huesos-largos-de-los-miembros', 'Brazo y pierna: mismo plano, distinto nombre',
  'El brazo y la pierna se construyen igual: 1 hueso arriba (húmero o fémur) y 2 abajo (radio y cúbito, o tibia y peroné). Aprende el patrón una vez y sirve para los dos.',
  'anatomia',
  $anatomia${
  "pasos": [
    "Arriba hay un solo hueso largo: el húmero en el brazo y el fémur en el muslo. El fémur es el hueso más largo y más fuerte del cuerpo.",
    "Abajo hay dos huesos paralelos. En el antebrazo: radio y cúbito. En la pierna: tibia y peroné.",
    "Con la palma hacia adelante (posición anatómica), el radio queda del lado del pulgar y el cúbito del lado del meñique. En la pierna, la tibia es la gruesa, por delante y hacia adentro (la «espinilla»), y el peroné es el delgado, por fuera.",
    "Nombres alternativos: en la nomenclatura anatómica internacional el cúbito se llama ulna y el peroné se llama fíbula. Prodigia usa cúbito y peroné."
  ],
  "visuales": [
    {
      "tipo": "anatomia.esqueleto",
      "despuesDePaso": 2,
      "titulo": "Los seis huesos largos, uno por uno",
      "huesos": [
        "humero",
        "radio",
        "cubito",
        "femur",
        "tibia",
        "perone"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué dos huesos forman el antebrazo?",
      "opciones": [
        "Húmero y radio",
        "Radio y cúbito",
        "Tibia y peroné",
        "Fémur y tibia"
      ],
      "respuesta": "Radio y cúbito",
      "explicacion": "El antebrazo tiene radio y cúbito; el brazo tiene un solo hueso, el húmero."
    },
    {
      "pregunta": "¿Cuál es el hueso más largo del cuerpo?",
      "opciones": [
        "Húmero",
        "Tibia",
        "Fémur",
        "Cúbito"
      ],
      "respuesta": "Fémur",
      "explicacion": "El fémur (el hueso del muslo) es el más largo y el más fuerte."
    },
    {
      "pregunta": "En la posición anatómica, ¿qué hueso del antebrazo queda del lado del pulgar?",
      "opciones": [
        "Cúbito",
        "Radio",
        "Húmero",
        "Peroné"
      ],
      "respuesta": "Radio",
      "explicacion": "El radio está del lado del pulgar; el cúbito, del lado del meñique."
    },
    {
      "pregunta": "¿Cuál de estos huesos es delgado y queda en la parte externa de la pierna?",
      "opciones": [
        "Tibia",
        "Fémur",
        "Radio",
        "Peroné"
      ],
      "respuesta": "Peroné",
      "explicacion": "El peroné es el hueso delgado de la pierna; la tibia, a su lado, es la gruesa y soporta el peso."
    }
  ]
}$anatomia$::jsonb,
  2,
  false),

('anatomia-mano-y-pie-por-filas', 'Mano y pie: tres filas, de la muñeca a la punta',
  'La mano y el pie se organizan en tres filas de huesos: carpianos o tarsianos (la base), metacarpianos o metatarsianos (la palma o el empeine) y falanges (los dedos). Se cuentan 8-5-14 en la mano y 7-5-14 en el pie.',
  'anatomia',
  $anatomia${
  "pasos": [
    "Mano: 8 carpianos (huesos pequeños de la muñeca), 5 metacarpianos (la palma) y 14 falanges (los dedos).",
    "Pie: 7 tarsianos (talón y parte posterior del pie; entre ellos el calcáneo y el astrágalo), 5 metatarsianos y 14 falanges.",
    "Falanges: el pulgar de la mano y el dedo gordo del pie tienen 2; los otros cuatro dedos tienen 3 cada uno. Cuenta: 2 + 4 × 3 = 14.",
    "Regla: es el mismo esquema en las dos extremidades. La única diferencia de cifras está en la primera fila: 8 carpianos y 7 tarsianos."
  ],
  "visuales": [
    {
      "tipo": "anatomia.esqueleto",
      "despuesDePaso": 2,
      "titulo": "De la muñeca a los dedos, y del talón a los dedos del pie",
      "huesos": [
        "carpianos",
        "metacarpianos",
        "falanges_mano",
        "tarsianos",
        "metatarsianos",
        "falanges_pie"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos carpianos tiene cada mano?",
      "opciones": [
        "5",
        "7",
        "14",
        "8"
      ],
      "respuesta": "8",
      "explicacion": "Son 8 huesos pequeños en la muñeca. En el pie, la primera fila (tarsianos) tiene 7."
    },
    {
      "pregunta": "¿Cuántas falanges tiene cada dedo de la mano, salvo el pulgar?",
      "opciones": [
        "2",
        "3",
        "4",
        "5"
      ],
      "respuesta": "3",
      "explicacion": "El pulgar tiene 2 y cada uno de los otros cuatro dedos tiene 3: en total 14."
    },
    {
      "pregunta": "¿Qué huesos forman la palma de la mano?",
      "opciones": [
        "Carpianos",
        "Falanges",
        "Metacarpianos",
        "Metatarsianos"
      ],
      "respuesta": "Metacarpianos",
      "explicacion": "Los 5 metacarpianos forman la palma; los carpianos están en la muñeca y las falanges en los dedos."
    },
    {
      "pregunta": "¿Cuántos tarsianos tiene cada pie?",
      "opciones": [
        "7",
        "5",
        "8",
        "14"
      ],
      "respuesta": "7",
      "explicacion": "El tarso tiene 7 huesos (entre ellos el calcáneo, el del talón). El pie tiene además 5 metatarsianos y 14 falanges."
    }
  ]
}$anatomia$::jsonb,
  3,
  false),

('anatomia-columna-y-torax', 'Columna y tórax: el horario 7-12-5',
  'La columna se recuerda con un horario: 7 vértebras cervicales, 12 torácicas y 5 lumbares (7-12-5), más el sacro y el cóccix. Cada vértebra torácica se une a un par de costillas: 12 pares.',
  'anatomia',
  $anatomia${
  "pasos": [
    "De arriba abajo: 7 cervicales (el cuello), 12 torácicas (la espalda alta, donde se unen las costillas), 5 lumbares (la espalda baja), el sacro (5 vértebras fusionadas en un hueso) y el cóccix (unas 4 vértebras fusionadas).",
    "Truco del horario: desayuno a las 7, almuerzo a las 12 y cena a las 5, o sea 7 - 12 - 5.",
    "Costillas: 12 pares, uno por cada vértebra torácica (24 costillas). Los pares 1 a 7 llegan hasta el esternón (verdaderas); los pares 8 a 10 se unen al cartílago de la costilla de arriba (falsas); los pares 11 y 12 no llegan por delante (flotantes). Simplificación: algunos textos llaman «falsas» a los pares 8 a 12.",
    "Cifras: 24 vértebras móviles (7 + 12 + 5) más el sacro y el cóccix dan unas 33 vértebras; el cóccix puede tener de 3 a 5, por eso a veces se lee 32 o 34."
  ],
  "visuales": [
    {
      "tipo": "anatomia.esqueleto",
      "despuesDePaso": 1,
      "titulo": "La columna vertebral",
      "huesos": [
        "columna"
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Vértebras por región",
      "grupos": [
        {
          "nombre": "Cervicales",
          "items": [
            {
              "texto": "7 vértebras",
              "detalle": "cuello"
            }
          ]
        },
        {
          "nombre": "Torácicas",
          "items": [
            {
              "texto": "12 vértebras",
              "detalle": "espalda alta, con las costillas"
            }
          ]
        },
        {
          "nombre": "Lumbares",
          "items": [
            {
              "texto": "5 vértebras",
              "detalle": "espalda baja"
            }
          ]
        },
        {
          "nombre": "Sacro y cóccix",
          "items": [
            {
              "texto": "Sacro (5 fusionadas)"
            },
            {
              "texto": "Cóccix (unas 4 fusionadas)"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántas vértebras lumbares hay?",
      "opciones": [
        "7",
        "12",
        "5",
        "4"
      ],
      "respuesta": "5",
      "explicacion": "El horario 7-12-5 da las vértebras cervicales, torácicas y lumbares, en ese orden."
    },
    {
      "pregunta": "¿Por qué hay 12 pares de costillas?",
      "opciones": [
        "Porque hay 12 vértebras torácicas y cada una se une a un par",
        "Porque hay 12 vértebras cervicales",
        "Porque el esternón tiene 12 partes",
        "Es una cifra sin relación con la columna"
      ],
      "respuesta": "Porque hay 12 vértebras torácicas y cada una se une a un par",
      "explicacion": "Cada vértebra torácica se articula con un par de costillas."
    },
    {
      "pregunta": "¿Qué pares de costillas se llaman flotantes?",
      "opciones": [
        "Los pares 1 y 2",
        "Los pares 11 y 12",
        "Los pares 7 y 8",
        "Todos los pares"
      ],
      "respuesta": "Los pares 11 y 12",
      "explicacion": "Los pares 11 y 12 no llegan al esternón ni al cartílago de otra costilla: quedan libres por delante."
    },
    {
      "pregunta": "¿Cuántas vértebras móviles tiene la columna (sin contar sacro ni cóccix)?",
      "opciones": [
        "33",
        "24",
        "26",
        "12"
      ],
      "respuesta": "24",
      "explicacion": "7 cervicales + 12 torácicas + 5 lumbares = 24."
    }
  ]
}$anatomia$::jsonb,
  4,
  false),

('anatomia-clasificar-huesos-por-forma', 'Clasifica los huesos por su forma',
  'Hay cinco formas de hueso: largos, cortos, planos, irregulares y sesamoideos. Si reconoces la forma, deduces la función: los largos son palancas, los planos protegen, los cortos dan estabilidad.',
  'anatomia',
  $anatomia${
  "pasos": [
    "Largos: más largos que anchos, funcionan como palancas. Fémur, húmero, tibia, peroné, radio y cúbito; también los metacarpianos, los metatarsianos y las falanges.",
    "Cortos: tan anchos como largos. Los carpianos y los tarsianos: dan estabilidad y algo de movimiento.",
    "Planos: láminas delgadas que protegen o dan superficie a los músculos. Frontal, parietales, occipital, esternón, escápula y costillas.",
    "Irregulares: forma compleja, como las vértebras, el esfenoides, el etmoides y la mandíbula. Sesamoideos: pequeños, dentro de un tendón; el mayor es la rótula. Simplificación: algunos huesos (como el temporal) mezclan formas y se clasifican distinto según el texto."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Cinco formas de hueso",
      "grupos": [
        {
          "nombre": "Largos",
          "items": [
            {
              "texto": "Fémur"
            },
            {
              "texto": "Húmero"
            },
            {
              "texto": "Tibia"
            },
            {
              "texto": "Radio"
            }
          ]
        },
        {
          "nombre": "Cortos",
          "items": [
            {
              "texto": "Carpianos"
            },
            {
              "texto": "Tarsianos"
            }
          ]
        },
        {
          "nombre": "Planos",
          "items": [
            {
              "texto": "Frontal"
            },
            {
              "texto": "Parietal"
            },
            {
              "texto": "Esternón"
            },
            {
              "texto": "Escápula"
            },
            {
              "texto": "Costillas"
            }
          ]
        },
        {
          "nombre": "Irregulares",
          "items": [
            {
              "texto": "Vértebras"
            },
            {
              "texto": "Esfenoides"
            },
            {
              "texto": "Etmoides"
            },
            {
              "texto": "Mandíbula"
            }
          ]
        },
        {
          "nombre": "Sesamoideos",
          "items": [
            {
              "texto": "Rótula"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué forma tiene el fémur?",
      "opciones": [
        "Corto",
        "Plano",
        "Largo",
        "Irregular"
      ],
      "respuesta": "Largo",
      "explicacion": "Es mucho más largo que ancho y trabaja como palanca."
    },
    {
      "pregunta": "Los carpianos y los tarsianos son huesos...",
      "opciones": [
        "Largos",
        "Cortos",
        "Planos",
        "Sesamoideos"
      ],
      "respuesta": "Cortos",
      "explicacion": "Son tan anchos como largos: dan estabilidad a la muñeca y al tobillo."
    },
    {
      "pregunta": "El esternón, la escápula y las costillas son huesos...",
      "opciones": [
        "Planos",
        "Largos",
        "Irregulares",
        "Cortos"
      ],
      "respuesta": "Planos",
      "explicacion": "Son láminas que protegen los órganos del tórax y ofrecen superficie a los músculos."
    },
    {
      "pregunta": "La rótula es un hueso...",
      "opciones": [
        "Largo",
        "Plano",
        "Sesamoideo",
        "Corto"
      ],
      "respuesta": "Sesamoideo",
      "explicacion": "Está dentro de un tendón (el del cuádriceps) y es el hueso sesamoideo más grande."
    }
  ]
}$anatomia$::jsonb,
  5,
  false),

('anatomia-musculos-por-region', 'Ubica cada músculo por región del cuerpo',
  'En vez de una lista de 10 nombres, recórrelos por regiones, de arriba hacia abajo: hombro y pecho, brazo, tronco (por delante y por detrás), cadera y pierna.',
  'anatomia',
  $anatomia${
  "pasos": [
    "Hombro y pecho: deltoides (el hombro redondeado) y pectoral mayor (el pecho).",
    "Brazo: el bíceps está por delante (flexiona el codo) y el tríceps por detrás (lo extiende).",
    "Tronco: el recto abdominal está por delante (los «cuadritos» del abdomen); por detrás, el trapecio cubre el cuello y la espalda alta y el dorsal ancho la espalda baja y lateral.",
    "Cadera y pierna: los glúteos en la cadera (por detrás), el cuádriceps en el muslo (por delante) y el gastrocnemio en la pantorrilla (por detrás). Este visual es un esquema de regiones, no un dibujo anatómico."
  ],
  "visuales": [
    {
      "tipo": "anatomia.cuerpo",
      "despuesDePaso": 3,
      "titulo": "Cada músculo, en su región",
      "entradas": [
        {
          "nombre": "Deltoides",
          "regiones": [
            "hombro"
          ],
          "detalle": "levanta el brazo hacia el costado"
        },
        {
          "nombre": "Pectoral mayor",
          "regiones": [
            "torax"
          ],
          "detalle": "lleva el brazo hacia adelante y hacia adentro"
        },
        {
          "nombre": "Recto abdominal",
          "regiones": [
            "abdomen"
          ],
          "detalle": "flexiona el tronco hacia adelante"
        },
        {
          "nombre": "Bíceps",
          "regiones": [
            "brazo"
          ],
          "detalle": "flexiona el codo"
        },
        {
          "nombre": "Cuádriceps",
          "regiones": [
            "muslo"
          ],
          "detalle": "extiende la rodilla"
        },
        {
          "nombre": "Trapecio",
          "regiones": [
            "cuello",
            "torax"
          ],
          "vista": "posterior",
          "detalle": "sube y junta los omóplatos; sostiene el cuello"
        },
        {
          "nombre": "Dorsal ancho",
          "regiones": [
            "torax",
            "abdomen"
          ],
          "vista": "posterior",
          "detalle": "lleva el brazo hacia atrás y abajo"
        },
        {
          "nombre": "Tríceps",
          "regiones": [
            "brazo"
          ],
          "vista": "posterior",
          "detalle": "extiende el codo"
        },
        {
          "nombre": "Glúteos",
          "regiones": [
            "pelvis"
          ],
          "vista": "posterior",
          "detalle": "extienden la cadera"
        },
        {
          "nombre": "Gastrocnemio",
          "regiones": [
            "pierna"
          ],
          "vista": "posterior",
          "detalle": "la pantorrilla: levanta el talón (puntas de pie)"
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos músculos está en la cara posterior (de atrás) del brazo?",
      "opciones": [
        "Bíceps",
        "Deltoides",
        "Tríceps",
        "Pectoral mayor"
      ],
      "respuesta": "Tríceps",
      "explicacion": "El tríceps está detrás del brazo; el bíceps está por delante."
    },
    {
      "pregunta": "¿Dónde está el gastrocnemio?",
      "opciones": [
        "En el muslo, por delante",
        "En la pantorrilla, por detrás",
        "En el antebrazo",
        "En el abdomen"
      ],
      "respuesta": "En la pantorrilla, por detrás",
      "explicacion": "Es el músculo de la pantorrilla: forma el «bulto» de la parte de atrás de la pierna."
    },
    {
      "pregunta": "¿Qué músculo ocupa la parte delantera del muslo?",
      "opciones": [
        "Glúteos",
        "Cuádriceps",
        "Gastrocnemio",
        "Recto abdominal"
      ],
      "respuesta": "Cuádriceps",
      "explicacion": "Cuádriceps = cuatro cabezas en la parte delantera del muslo."
    },
    {
      "pregunta": "¿Qué dos músculos cubren la espalda?",
      "opciones": [
        "Trapecio y dorsal ancho",
        "Deltoides y pectoral mayor",
        "Bíceps y tríceps",
        "Recto abdominal y glúteos"
      ],
      "respuesta": "Trapecio y dorsal ancho",
      "explicacion": "El trapecio cubre el cuello y la espalda alta; el dorsal ancho, la espalda baja y lateral."
    }
  ]
}$anatomia$::jsonb,
  2,
  false),

('anatomia-nombre-por-forma-numero-y-accion', 'Lee el nombre: forma, número, ubicación y acción',
  'Muchos nombres de músculos describen algo: su forma (deltoides = triángulo), cuántas cabezas tiene (bíceps, tríceps, cuádriceps), dónde está (pectoral, glúteos) o lo que hace (masetero = masticador).',
  'anatomia',
  $anatomia${
  "pasos": [
    "Forma: deltoides viene de la letra griega delta (un triángulo); trapecio, de la figura del trapecio; orbicular, de «orbe»: circular.",
    "Número de cabezas (orígenes): bíceps tiene 2, tríceps tiene 3 y cuádriceps tiene 4.",
    "Ubicación: pectoral (del latín pectus, pecho), glúteos (nalgas), frontal, temporal y occipital (la región que cubren). Gastrocnemio viene del griego «vientre de la pierna».",
    "Dirección y tamaño: recto abdominal (fibras verticales, en el abdomen), dorsal ancho (el ancho de la espalda), pectoral mayor (hay también uno menor).",
    "Acción: masetero viene del griego «masticador»; flexor y extensor dicen si doblan o estiran una articulación."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 4,
      "titulo": "Del nombre a la pista",
      "grupos": [
        {
          "nombre": "Forma",
          "items": [
            {
              "texto": "Deltoides",
              "detalle": "triángulo (delta)"
            },
            {
              "texto": "Trapecio",
              "detalle": "figura de trapecio"
            }
          ]
        },
        {
          "nombre": "Número de cabezas",
          "items": [
            {
              "texto": "Bíceps",
              "marca": "2"
            },
            {
              "texto": "Tríceps",
              "marca": "3"
            },
            {
              "texto": "Cuádriceps",
              "marca": "4"
            }
          ]
        },
        {
          "nombre": "Ubicación y tamaño",
          "items": [
            {
              "texto": "Pectoral mayor",
              "detalle": "pecho; el mayor"
            },
            {
              "texto": "Glúteos",
              "detalle": "nalgas"
            },
            {
              "texto": "Dorsal ancho",
              "detalle": "espalda, el más ancho"
            },
            {
              "texto": "Recto abdominal",
              "detalle": "fibras rectas, en el abdomen"
            },
            {
              "texto": "Gastrocnemio",
              "detalle": "«vientre de la pierna»"
            }
          ]
        },
        {
          "nombre": "Acción",
          "items": [
            {
              "texto": "Masetero",
              "detalle": "«masticador»"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué indica que un músculo se llame «cuádriceps»?",
      "opciones": [
        "Que tiene cuatro cabezas",
        "Que tiene cuatro huesos",
        "Que está en el cuarto piso muscular",
        "Que se contrae cuatro veces"
      ],
      "respuesta": "Que tiene cuatro cabezas",
      "explicacion": "Bíceps (2), tríceps (3) y cuádriceps (4) cuentan las cabezas de origen del músculo."
    },
    {
      "pregunta": "«Deltoides» toma su nombre de...",
      "opciones": [
        "Su acción",
        "Su número de cabezas",
        "La letra delta: tiene forma de triángulo",
        "El hueso donde se ancla"
      ],
      "respuesta": "La letra delta: tiene forma de triángulo",
      "explicacion": "Es un ejemplo de nombre por forma, igual que trapecio."
    },
    {
      "pregunta": "Masetero viene del griego «masticador». ¿Qué hace este músculo?",
      "opciones": [
        "Levanta el brazo",
        "Cierra la mandíbula para masticar",
        "Flexiona el codo",
        "Extiende la rodilla"
      ],
      "respuesta": "Cierra la mandíbula para masticar",
      "explicacion": "El masetero es uno de los músculos de la masticación: eleva la mandíbula."
    },
    {
      "pregunta": "En «recto abdominal», ¿qué indica la palabra «recto»?",
      "opciones": [
        "Que sus fibras son verticales",
        "Que es un músculo del recto (intestino)",
        "Que es el más fuerte",
        "Que solo se mueve en línea recta al caminar"
      ],
      "respuesta": "Que sus fibras son verticales",
      "explicacion": "Recto describe la dirección de las fibras; abdominal, la región donde está."
    }
  ]
}$anatomia$::jsonb,
  3,
  false),

('anatomia-agonista-y-antagonista', 'Cada músculo tiene su opuesto',
  'Un músculo solo puede tirar, no empujar, así que trabajan en pares opuestos: cuando el agonista se contrae, el antagonista se relaja. Bíceps y tríceps, cuádriceps e isquiotibiales, pectoral y dorsal.',
  'anatomia',
  $anatomia${
  "pasos": [
    "Agonista es el músculo que hace el movimiento; antagonista es el que hace el movimiento contrario y devuelve el hueso a su posición. Saber uno te dice el otro.",
    "Codo: el bíceps lo flexiona (lo dobla) y el tríceps lo extiende (lo estira).",
    "Rodilla: el cuádriceps la extiende y los isquiotibiales, en la parte de atrás del muslo, la flexionan. Hombro: el pectoral mayor lleva el brazo hacia adelante y el dorsal ancho lo lleva hacia atrás y abajo.",
    "Pie: el gastrocnemio levanta el talón (te pones de puntas) y el tibial anterior levanta la punta del pie. Simplificación: en cada movimiento real participan también otros músculos ayudantes (sinergistas)."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Pares de músculos opuestos",
      "grupos": [
        {
          "nombre": "Codo",
          "items": [
            {
              "texto": "Bíceps",
              "marca": "flexiona"
            },
            {
              "texto": "Tríceps",
              "marca": "extiende"
            }
          ]
        },
        {
          "nombre": "Rodilla",
          "items": [
            {
              "texto": "Cuádriceps",
              "marca": "extiende"
            },
            {
              "texto": "Isquiotibiales",
              "marca": "flexionan"
            }
          ]
        },
        {
          "nombre": "Hombro",
          "items": [
            {
              "texto": "Pectoral mayor",
              "detalle": "brazo hacia adelante"
            },
            {
              "texto": "Dorsal ancho",
              "detalle": "brazo hacia atrás y abajo"
            }
          ]
        },
        {
          "nombre": "Pie",
          "items": [
            {
              "texto": "Gastrocnemio",
              "detalle": "levanta el talón"
            },
            {
              "texto": "Tibial anterior",
              "detalle": "levanta la punta del pie"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué músculo extiende (estira) el codo?",
      "opciones": [
        "Bíceps",
        "Tríceps",
        "Deltoides",
        "Gastrocnemio"
      ],
      "respuesta": "Tríceps",
      "explicacion": "El tríceps extiende el codo; su antagonista, el bíceps, lo flexiona."
    },
    {
      "pregunta": "¿Cuál es el antagonista del cuádriceps?",
      "opciones": [
        "Los isquiotibiales",
        "El bíceps",
        "El deltoides",
        "El recto abdominal"
      ],
      "respuesta": "Los isquiotibiales",
      "explicacion": "El cuádriceps extiende la rodilla; los isquiotibiales (parte de atrás del muslo) la flexionan."
    },
    {
      "pregunta": "Al ponerte de puntas, ¿qué músculo de la pantorrilla trabaja?",
      "opciones": [
        "Cuádriceps",
        "Glúteos",
        "Tibial anterior",
        "Gastrocnemio"
      ],
      "respuesta": "Gastrocnemio",
      "explicacion": "El gastrocnemio levanta el talón; el tibial anterior hace lo contrario con la punta del pie."
    },
    {
      "pregunta": "El músculo que realiza el movimiento se llama...",
      "opciones": [
        "Antagonista",
        "Agonista",
        "Tendón",
        "Ligamento"
      ],
      "respuesta": "Agonista",
      "explicacion": "El agonista hace el movimiento; el antagonista se le opone y lo equilibra."
    }
  ]
}$anatomia$::jsonb,
  4,
  false),

('anatomia-cara-expresion-y-masticacion', 'Cabeza y cuello: los que expresan y los que mastican',
  'Los 9 músculos de cabeza y cuello se dividen en dos grupos: los de la expresión (mueven la piel: frontal, orbiculares, cigomático mayor, buccinador, occipital, platisma) y los de la masticación (masetero y temporal, mueven la mandíbula).',
  'anatomia',
  $anatomia${
  "pasos": [
    "Expresión facial: mueven la piel de la cara, no un hueso. Frontal (sube las cejas), orbicular de los ojos, orbicular de la boca, cigomático mayor (sonrisa) y buccinador (la mejilla: sopla y ayuda a mantener el alimento entre los dientes).",
    "Occipital (la parte de atrás del cuero cabelludo) y platisma (una lámina delgada en el cuello) también son de este grupo. Por eso la práctica los llama músculos de la cabeza o del cuello, no solo de la cara.",
    "Masticación: masetero (en la mejilla, sobre el ángulo de la mandíbula) y temporal (en la sien). Los dos elevan la mandíbula para cerrar la boca.",
    "Nervios: los de la expresión facial los mueve el nervio facial (VII); los de la masticación, el trigémino (V)."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Dos grupos, dos nervios",
      "grupos": [
        {
          "nombre": "Expresión (nervio facial, VII)",
          "items": [
            {
              "texto": "Frontal",
              "detalle": "sube las cejas"
            },
            {
              "texto": "Orbicular de los ojos",
              "detalle": "cierra los párpados"
            },
            {
              "texto": "Orbicular de la boca",
              "detalle": "cierra y frunce los labios"
            },
            {
              "texto": "Cigomático mayor",
              "detalle": "sonrisa"
            },
            {
              "texto": "Buccinador",
              "detalle": "mejilla"
            },
            {
              "texto": "Occipital",
              "detalle": "nuca (cuero cabelludo)"
            },
            {
              "texto": "Platisma",
              "detalle": "cuello, superficial"
            }
          ]
        },
        {
          "nombre": "Masticación (nervio trigémino, V)",
          "items": [
            {
              "texto": "Masetero",
              "detalle": "mejilla; eleva la mandíbula"
            },
            {
              "texto": "Temporal",
              "detalle": "sien; eleva la mandíbula"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos es un músculo de la masticación?",
      "opciones": [
        "Cigomático mayor",
        "Frontal",
        "Platisma",
        "Masetero"
      ],
      "respuesta": "Masetero",
      "explicacion": "Masetero y temporal elevan la mandíbula al masticar."
    },
    {
      "pregunta": "¿Qué nervio craneal mueve los músculos de la expresión facial?",
      "opciones": [
        "Facial (VII)",
        "Trigémino (V)",
        "Vago (X)",
        "Óptico (II)"
      ],
      "respuesta": "Facial (VII)",
      "explicacion": "El nervio facial inerva los músculos de la expresión; el trigémino, los de la masticación."
    },
    {
      "pregunta": "¿Qué hace el cigomático mayor?",
      "opciones": [
        "Cierra los párpados",
        "Sube la comisura de la boca (sonrisa)",
        "Eleva la mandíbula",
        "Baja la lengua"
      ],
      "respuesta": "Sube la comisura de la boca (sonrisa)",
      "explicacion": "Se ancla en el pómulo y tira de la comisura de la boca hacia arriba."
    },
    {
      "pregunta": "¿Dónde está el platisma?",
      "opciones": [
        "En la frente",
        "En la nuca",
        "En el cuello, bajo la piel",
        "En la sien"
      ],
      "respuesta": "En el cuello, bajo la piel",
      "explicacion": "Es una lámina superficial del cuello; por eso no es solo un músculo «de la cara»."
    }
  ]
}$anatomia$::jsonb,
  6,
  false),

('anatomia-organos-por-aparato', 'Cada órgano, en su aparato',
  'Además de la cavidad, cada órgano trabaja en un aparato: digestivo (estómago, intestino, hígado, páncreas), respiratorio (pulmones), circulatorio (corazón), excretor (riñones, vejiga), linfático (bazo) y nervioso (cerebro).',
  'anatomia',
  $anatomia${
  "pasos": [
    "Digestivo: estómago e intestino forman el tubo por donde pasa el alimento; el hígado y el páncreas son glándulas que vierten sus jugos al intestino.",
    "Respiratorio: los pulmones. Circulatorio: el corazón, junto con los vasos sanguíneos.",
    "Excretor (urinario): los riñones filtran la sangre y forman la orina; la vejiga la almacena. Nervioso: el cerebro.",
    "Dos casos especiales: el bazo es del sistema linfático (filtra la sangre y ayuda a las defensas) y el páncreas, además de digestivo, es una glándula endocrina (produce insulina)."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Un aparato, sus órganos",
      "grupos": [
        {
          "nombre": "Digestivo",
          "items": [
            {
              "texto": "Estómago"
            },
            {
              "texto": "Intestino"
            },
            {
              "texto": "Hígado"
            },
            {
              "texto": "Páncreas"
            }
          ]
        },
        {
          "nombre": "Respiratorio",
          "items": [
            {
              "texto": "Pulmones"
            }
          ]
        },
        {
          "nombre": "Circulatorio",
          "items": [
            {
              "texto": "Corazón"
            }
          ]
        },
        {
          "nombre": "Excretor (urinario)",
          "items": [
            {
              "texto": "Riñones"
            },
            {
              "texto": "Vejiga"
            }
          ]
        },
        {
          "nombre": "Linfático",
          "items": [
            {
              "texto": "Bazo"
            }
          ]
        },
        {
          "nombre": "Nervioso",
          "items": [
            {
              "texto": "Cerebro"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿A qué aparato pertenecen los riñones y la vejiga?",
      "opciones": [
        "Digestivo",
        "Respiratorio",
        "Excretor (urinario)",
        "Circulatorio"
      ],
      "respuesta": "Excretor (urinario)",
      "explicacion": "Los riñones forman la orina y la vejiga la almacena: es el aparato excretor o urinario."
    },
    {
      "pregunta": "¿Cuál de estos órganos NO pertenece al aparato digestivo?",
      "opciones": [
        "Estómago",
        "Pulmones",
        "Páncreas",
        "Hígado"
      ],
      "respuesta": "Pulmones",
      "explicacion": "Los pulmones son del aparato respiratorio."
    },
    {
      "pregunta": "El bazo pertenece al sistema...",
      "opciones": [
        "Digestivo",
        "Linfático (defensas)",
        "Excretor",
        "Nervioso"
      ],
      "respuesta": "Linfático (defensas)",
      "explicacion": "El bazo filtra la sangre y participa en las defensas del cuerpo."
    },
    {
      "pregunta": "¿Qué dos funciones tiene el páncreas?",
      "opciones": [
        "Digestiva y endocrina",
        "Respiratoria y excretora",
        "Circulatoria y nerviosa",
        "Solo digestiva"
      ],
      "respuesta": "Digestiva y endocrina",
      "explicacion": "Produce jugo pancreático para digerir e insulina y glucagón, que son hormonas."
    }
  ]
}$anatomia$::jsonb,
  2,
  false),

('anatomia-camino-del-alimento', 'El camino del alimento, de la boca al ano',
  'Aprende el aparato digestivo como un recorrido: boca, faringe, esófago, estómago, intestino delgado, intestino grueso, recto y ano. Los órganos que están en el camino (estómago, intestino) y los que solo aportan jugos (hígado, páncreas) se distinguen fácil.',
  'anatomia',
  $anatomia${
  "pasos": [
    "El alimento recorre un tubo: boca, faringe, esófago, estómago, intestino delgado, intestino grueso y recto y ano.",
    "En la boca masticas y la saliva empieza a digerir el almidón. El esófago solo transporta. En el estómago, el jugo gástrico (ácido) lo convierte en una pasta.",
    "En el intestino delgado se absorbe casi todo lo que el cuerpo aprovecha. En el intestino grueso se absorbe agua y se forman las heces.",
    "El hígado y el páncreas no están en el camino: son glándulas que vierten sus jugos (la bilis y el jugo pancreático) en el intestino delgado."
  ],
  "visuales": [
    {
      "tipo": "anatomia.flujo",
      "despuesDePaso": 3,
      "titulo": "Recorrido del alimento",
      "etapas": [
        {
          "titulo": "Boca",
          "detalle": "se mastica y la saliva empieza a digerir el almidón"
        },
        {
          "titulo": "Faringe",
          "detalle": "cruce entre vía digestiva y vía respiratoria"
        },
        {
          "titulo": "Esófago",
          "detalle": "tubo que lleva el alimento al estómago"
        },
        {
          "titulo": "Estómago",
          "detalle": "el jugo gástrico convierte el alimento en una pasta"
        },
        {
          "titulo": "Intestino delgado",
          "detalle": "se absorbe la mayoría de los nutrientes"
        },
        {
          "titulo": "Intestino grueso",
          "detalle": "se absorbe agua y se forman las heces"
        },
        {
          "titulo": "Recto y ano",
          "detalle": "salida de las heces"
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué órgano viene justo después del esófago?",
      "opciones": [
        "Intestino delgado",
        "Faringe",
        "Hígado",
        "Estómago"
      ],
      "respuesta": "Estómago",
      "explicacion": "El esófago lleva el alimento hasta el estómago."
    },
    {
      "pregunta": "¿Dónde se absorbe la mayor parte de los nutrientes?",
      "opciones": [
        "Estómago",
        "Intestino delgado",
        "Intestino grueso",
        "Esófago"
      ],
      "respuesta": "Intestino delgado",
      "explicacion": "El intestino delgado es el lugar principal de absorción de nutrientes."
    },
    {
      "pregunta": "¿Qué ocurre principalmente en el intestino grueso?",
      "opciones": [
        "Se digiere la proteína",
        "Se produce la bilis",
        "Se absorbe agua y se forman las heces",
        "Se filtra la sangre"
      ],
      "respuesta": "Se absorbe agua y se forman las heces",
      "explicacion": "El intestino grueso recupera agua y da forma a las heces."
    },
    {
      "pregunta": "¿Cuál de estos órganos NO forma parte del camino del alimento?",
      "opciones": [
        "Estómago",
        "Esófago",
        "Hígado",
        "Intestino delgado"
      ],
      "respuesta": "Hígado",
      "explicacion": "El alimento no pasa por el hígado: esta glándula solo vierte bilis en el intestino."
    }
  ]
}$anatomia$::jsonb,
  3,
  false),

('anatomia-camino-del-aire', 'El camino del aire: de la nariz a los alvéolos',
  'El aire recorre siempre el mismo camino: nariz, faringe, laringe, tráquea, bronquios, bronquiolos y alvéolos. En los alvéolos, dentro de los pulmones, el oxígeno pasa a la sangre.',
  'anatomia',
  $anatomia${
  "pasos": [
    "Orden de las vías respiratorias: nariz, faringe, laringe, tráquea, bronquios, bronquiolos y alvéolos.",
    "Los alvéolos son sacos diminutos rodeados de capilares: allí el oxígeno pasa a la sangre y el dióxido de carbono sale.",
    "Los pulmones son dos y no son iguales: el derecho tiene 3 lóbulos y el izquierdo 2, porque comparte espacio con el corazón.",
    "El diafragma, un músculo bajo los pulmones, baja al inspirar y sube al espirar."
  ],
  "visuales": [
    {
      "tipo": "anatomia.flujo",
      "despuesDePaso": 1,
      "titulo": "Recorrido del aire",
      "etapas": [
        {
          "titulo": "Nariz",
          "detalle": "entra el aire, se calienta y se filtra"
        },
        {
          "titulo": "Faringe",
          "detalle": "vía común con el aparato digestivo"
        },
        {
          "titulo": "Laringe",
          "detalle": "contiene las cuerdas vocales"
        },
        {
          "titulo": "Tráquea",
          "detalle": "tubo con anillos de cartílago"
        },
        {
          "titulo": "Bronquios",
          "detalle": "uno para cada pulmón"
        },
        {
          "titulo": "Bronquiolos",
          "detalle": "ramas cada vez más finas"
        },
        {
          "titulo": "Alvéolos",
          "detalle": "el oxígeno pasa a la sangre y el dióxido de carbono sale"
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Dónde ocurre el intercambio de gases con la sangre?",
      "opciones": [
        "En la tráquea",
        "En los alvéolos",
        "En la laringe",
        "En el diafragma"
      ],
      "respuesta": "En los alvéolos",
      "explicacion": "Los alvéolos están rodeados de capilares: allí entra el oxígeno y sale el dióxido de carbono."
    },
    {
      "pregunta": "¿Cuántos lóbulos tiene el pulmón izquierdo?",
      "opciones": [
        "3",
        "2",
        "4",
        "1"
      ],
      "respuesta": "2",
      "explicacion": "El izquierdo tiene 2 lóbulos (el derecho tiene 3) porque deja lugar al corazón."
    },
    {
      "pregunta": "¿Qué estructura viene justo antes de los bronquios?",
      "opciones": [
        "Laringe",
        "Alvéolos",
        "Tráquea",
        "Faringe"
      ],
      "respuesta": "Tráquea",
      "explicacion": "La tráquea se divide en los dos bronquios, uno para cada pulmón."
    },
    {
      "pregunta": "¿Qué músculo baja cuando inspiras?",
      "opciones": [
        "Recto abdominal",
        "Diafragma",
        "Trapecio",
        "Masetero"
      ],
      "respuesta": "Diafragma",
      "explicacion": "Al bajar, el diafragma agranda el tórax y entra el aire."
    }
  ]
}$anatomia$::jsonb,
  4,
  false),

('anatomia-camino-de-la-sangre', 'El camino de la sangre: dos circuitos, cuatro cavidades',
  'El corazón tiene 4 cavidades (2 aurículas que reciben y 2 ventrículos que impulsan) y la sangre hace dos circuitos: el menor, por los pulmones, y el mayor, por el resto del cuerpo.',
  'anatomia',
  $anatomia${
  "pasos": [
    "El corazón tiene 4 cavidades: 2 aurículas (arriba, reciben la sangre) y 2 ventrículos (abajo, la impulsan). El lado derecho maneja sangre pobre en oxígeno; el izquierdo, sangre oxigenada.",
    "Truco: las Arterias se Alejan del corazón; las Venas Vuelven a él. Cuidado: «arteria» no significa «sangre oxigenada»: las arterias pulmonares llevan sangre pobre en oxígeno.",
    "Circuito completo: aurícula derecha, ventrículo derecho, pulmones, aurícula izquierda, ventrículo izquierdo, cuerpo y de nuevo aurícula derecha.",
    "El ventrículo izquierdo tiene la pared más gruesa porque impulsa la sangre a todo el cuerpo."
  ],
  "visuales": [
    {
      "tipo": "anatomia.flujo",
      "despuesDePaso": 2,
      "titulo": "Un ciclo de la sangre",
      "etapas": [
        {
          "titulo": "Aurícula derecha",
          "detalle": "recibe la sangre pobre en oxígeno del cuerpo"
        },
        {
          "titulo": "Ventrículo derecho",
          "detalle": "la envía hacia los pulmones"
        },
        {
          "titulo": "Arterias pulmonares",
          "detalle": "llevan la sangre a los pulmones"
        },
        {
          "titulo": "Pulmones",
          "detalle": "la sangre se carga de oxígeno"
        },
        {
          "titulo": "Venas pulmonares",
          "detalle": "traen la sangre oxigenada al corazón"
        },
        {
          "titulo": "Aurícula izquierda",
          "detalle": "recibe la sangre oxigenada"
        },
        {
          "titulo": "Ventrículo izquierdo",
          "detalle": "la impulsa con fuerza al resto del cuerpo"
        },
        {
          "titulo": "Aorta y arterias",
          "detalle": "reparten la sangre a todo el cuerpo"
        },
        {
          "titulo": "Venas cavas",
          "detalle": "devuelven la sangre al corazón"
        }
      ],
      "ciclo": true
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué cavidad del corazón impulsa la sangre al resto del cuerpo?",
      "opciones": [
        "Aurícula derecha",
        "Ventrículo derecho",
        "Aurícula izquierda",
        "Ventrículo izquierdo"
      ],
      "respuesta": "Ventrículo izquierdo",
      "explicacion": "Su pared gruesa impulsa la sangre oxigenada a través de la aorta."
    },
    {
      "pregunta": "¿Qué hacen las arterias?",
      "opciones": [
        "Traen la sangre al corazón",
        "Sacan la sangre del corazón",
        "Almacenan la sangre",
        "Filtran la sangre"
      ],
      "respuesta": "Sacan la sangre del corazón",
      "explicacion": "Arteria = se Aleja del corazón; vena = Vuelve al corazón."
    },
    {
      "pregunta": "¿Qué cavidad recibe la sangre oxigenada que viene de los pulmones?",
      "opciones": [
        "Aurícula izquierda",
        "Aurícula derecha",
        "Ventrículo derecho",
        "Aorta"
      ],
      "respuesta": "Aurícula izquierda",
      "explicacion": "Las venas pulmonares llevan la sangre oxigenada a la aurícula izquierda."
    },
    {
      "pregunta": "¿Cuántas cavidades tiene el corazón?",
      "opciones": [
        "2",
        "3",
        "4",
        "6"
      ],
      "respuesta": "4",
      "explicacion": "Dos aurículas y dos ventrículos."
    }
  ]
}$anatomia$::jsonb,
  5,
  false),

('anatomia-pares-craneales-en-orden', 'Los 12 pares en orden: de tres en tres',
  'Son 12 pares, se numeran con romanos de adelante hacia atrás y se recuerdan en cuatro tandas de tres: I-III, IV-VI, VII-IX y X-XII, cada una con su función.',
  'anatomia',
  $anatomia${
  "pasos": [
    "Son 12 pares y se nombran con números romanos, de adelante hacia atrás.",
    "I a III: olfatorio (olfato), óptico (visión) y oculomotor (mueve el ojo).",
    "IV a VI: troclear (mueve el ojo), trigémino (sensibilidad de la cara y masticación) y abducens (lleva el ojo hacia afuera).",
    "VII a IX: facial (expresión de la cara), vestibulococlear (oído y equilibrio) y glosofaríngeo (gusto y deglución).",
    "X a XII: vago (corazón, pulmones y digestivo), accesorio (hombro y cuello) e hipogloso (lengua). Los pares de los ojos son el II, III, IV y VI: «ver y mover»."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 4,
      "titulo": "Cuatro tandas de tres",
      "grupos": [
        {
          "nombre": "Pares I a III",
          "items": [
            {
              "texto": "Olfatorio",
              "marca": "I",
              "detalle": "olfato"
            },
            {
              "texto": "Óptico",
              "marca": "II",
              "detalle": "visión"
            },
            {
              "texto": "Oculomotor",
              "marca": "III",
              "detalle": "mueve el ojo y sube el párpado; cierra la pupila"
            }
          ]
        },
        {
          "nombre": "Pares IV a VI",
          "items": [
            {
              "texto": "Troclear",
              "marca": "IV",
              "detalle": "mueve el ojo (músculo oblicuo superior)"
            },
            {
              "texto": "Trigémino",
              "marca": "V",
              "detalle": "sensibilidad de la cara; mueve los músculos de la masticación"
            },
            {
              "texto": "Abducens",
              "marca": "VI",
              "detalle": "lleva el ojo hacia afuera"
            }
          ]
        },
        {
          "nombre": "Pares VII a IX",
          "items": [
            {
              "texto": "Facial",
              "marca": "VII",
              "detalle": "músculos de la expresión facial; gusto de la parte anterior de la lengua; lágrimas y saliva"
            },
            {
              "texto": "Vestibulococlear",
              "marca": "VIII",
              "detalle": "audición y equilibrio"
            },
            {
              "texto": "Glosofaríngeo",
              "marca": "IX",
              "detalle": "gusto de la parte posterior de la lengua; deglución"
            }
          ]
        },
        {
          "nombre": "Pares X a XII",
          "items": [
            {
              "texto": "Vago",
              "marca": "X",
              "detalle": "corazón, pulmones y aparato digestivo; voz y deglución"
            },
            {
              "texto": "Accesorio",
              "marca": "XI",
              "detalle": "mueve el trapecio y el esternocleidomastoideo"
            },
            {
              "texto": "Hipogloso",
              "marca": "XII",
              "detalle": "mueve la lengua"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué nervio craneal es el par número II?",
      "opciones": [
        "Olfatorio",
        "Óptico",
        "Oculomotor",
        "Troclear"
      ],
      "respuesta": "Óptico",
      "explicacion": "El I es el olfatorio y el II es el óptico: los dos sentidos «a distancia» abren la lista."
    },
    {
      "pregunta": "¿Qué número tiene el nervio vago?",
      "opciones": [
        "IX",
        "XI",
        "X",
        "VII"
      ],
      "respuesta": "X",
      "explicacion": "Los últimos tres son X vago, XI accesorio y XII hipogloso."
    },
    {
      "pregunta": "¿Cuál es el par craneal XII?",
      "opciones": [
        "Hipogloso",
        "Accesorio",
        "Glosofaríngeo",
        "Facial"
      ],
      "respuesta": "Hipogloso",
      "explicacion": "El XII, hipogloso, mueve la lengua."
    },
    {
      "pregunta": "¿Cuál de estos pares NO mueve el ojo?",
      "opciones": [
        "Oculomotor",
        "Troclear",
        "Abducens",
        "Facial"
      ],
      "respuesta": "Facial",
      "explicacion": "Los que mueven el ojo son el III, IV y VI; el facial mueve los músculos de la expresión."
    }
  ]
}$anatomia$::jsonb,
  2,
  false),

('anatomia-pares-craneales-nombre-pista', 'El nombre del nervio es una pista',
  'Los nombres de los pares craneales vienen del griego y del latín y casi siempre dicen qué hacen o dónde van: oculomotor (mueve el ojo), trigémino (tres ramas), glosofaríngeo (lengua y faringe), hipogloso (bajo la lengua).',
  'anatomia',
  $anatomia${
  "pasos": [
    "Oculomotor: «mueve el ojo» (ocular y motor). Troclear: mueve un músculo del ojo que pasa por una polea (tróclea). Abducens: abduce el ojo, o sea lo lleva hacia afuera.",
    "Trigémino: «tres gemelos», porque tiene tres ramas (oftálmica, maxilar y mandibular) que llevan la sensibilidad de la frente, la mejilla y la mandíbula.",
    "Vestibulococlear: el vestíbulo (equilibrio) y la cóclea (audición), las dos partes del oído interno. Glosofaríngeo: glosos es lengua, más la faringe. Hipogloso: hypo es «debajo», más glosos: corre por debajo de la lengua.",
    "Vago: del latín «vagabundo», porque recorre el cuello, el tórax y el abdomen. Accesorio: recibe fibras de la médula espinal además del encéfalo; mueve el trapecio y el esternocleidomastoideo."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "De la raíz del nombre a la función",
      "grupos": [
        {
          "nombre": "Los ojos",
          "items": [
            {
              "texto": "Oculomotor",
              "marca": "III",
              "detalle": "ocular + motor: mueve el ojo"
            },
            {
              "texto": "Troclear",
              "marca": "IV",
              "detalle": "tróclea = polea"
            },
            {
              "texto": "Abducens",
              "marca": "VI",
              "detalle": "abduce: lleva el ojo hacia afuera"
            }
          ]
        },
        {
          "nombre": "La cara",
          "items": [
            {
              "texto": "Trigémino",
              "marca": "V",
              "detalle": "tres ramas"
            }
          ]
        },
        {
          "nombre": "Oído, lengua y garganta",
          "items": [
            {
              "texto": "Vestibulococlear",
              "marca": "VIII",
              "detalle": "vestíbulo + cóclea"
            },
            {
              "texto": "Glosofaríngeo",
              "marca": "IX",
              "detalle": "glosos (lengua) + faringe"
            },
            {
              "texto": "Hipogloso",
              "marca": "XII",
              "detalle": "debajo (hypo) de la lengua"
            }
          ]
        },
        {
          "nombre": "Cuerpo y cuello",
          "items": [
            {
              "texto": "Vago",
              "marca": "X",
              "detalle": "«vagabundo»: cuello, tórax y abdomen"
            },
            {
              "texto": "Accesorio",
              "marca": "XI",
              "detalle": "trapecio y esternocleidomastoideo"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué indica el nombre «trigémino»?",
      "opciones": [
        "Que tiene tres ramas",
        "Que tiene tres núcleos en el ojo",
        "Que es el tercer par craneal",
        "Que mueve tres músculos"
      ],
      "respuesta": "Que tiene tres ramas",
      "explicacion": "Tri = tres: la rama oftálmica, la maxilar y la mandibular."
    },
    {
      "pregunta": "¿Qué hace el nervio abducens (VI)?",
      "opciones": [
        "Lleva el ojo hacia afuera",
        "Mueve la lengua",
        "Da el olfato",
        "Mueve el hombro"
      ],
      "respuesta": "Lleva el ojo hacia afuera",
      "explicacion": "Abducir es alejar del centro: el abducens lleva el ojo hacia afuera."
    },
    {
      "pregunta": "«Hipogloso» significa «debajo de la lengua». ¿Qué mueve este nervio?",
      "opciones": [
        "El ojo",
        "La mandíbula",
        "La lengua",
        "El hombro"
      ],
      "respuesta": "La lengua",
      "explicacion": "El hipogloso (XII) es el nervio motor de la lengua."
    },
    {
      "pregunta": "¿Por qué el nervio X se llama «vago»?",
      "opciones": [
        "Porque casi no hace nada",
        "Porque recorre el cuello, el tórax y el abdomen (vaga por el cuerpo)",
        "Porque solo sale por la espalda",
        "Porque nadie conoce su función"
      ],
      "respuesta": "Porque recorre el cuello, el tórax y el abdomen (vaga por el cuerpo)",
      "explicacion": "Vago viene del latín «errante»: es el nervio craneal que llega más lejos."
    }
  ]
}$anatomia$::jsonb,
  3,
  false),

('anatomia-snc-vs-snp', 'Central o periférico: lo que está dentro del hueso y lo que sale',
  'El sistema nervioso central (SNC) es el encéfalo y la médula espinal, protegidos por hueso. El sistema nervioso periférico (SNP) son los nervios que salen de ellos hacia todo el cuerpo.',
  'anatomia',
  $anatomia${
  "pasos": [
    "Sistema nervioso central (SNC): encéfalo y médula espinal. Están protegidos por hueso: el encéfalo, dentro del cráneo, y la médula espinal, dentro de la columna vertebral.",
    "En el encéfalo: el cerebro (pensamiento, movimiento voluntario, sentidos) y el cerebelo (coordinación y equilibrio), además del tronco encefálico.",
    "Sistema nervioso periférico (SNP): todos los nervios que salen del SNC, los 12 pares craneales y los 31 pares espinales, y llegan hasta la piel, los músculos y los órganos.",
    "Regla: dentro del hueso es central; lo que sale es periférico. Cerebro, cerebelo y médula espinal son centrales; un nervio periférico es periférico."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Central y periférico",
      "grupos": [
        {
          "nombre": "Sistema nervioso central (dentro del hueso)",
          "items": [
            {
              "texto": "Cerebro",
              "detalle": "pensamiento, movimiento voluntario y sentidos"
            },
            {
              "texto": "Cerebelo",
              "detalle": "coordinación y equilibrio"
            },
            {
              "texto": "Médula espinal",
              "detalle": "conduce las señales entre el encéfalo y el cuerpo"
            }
          ]
        },
        {
          "nombre": "Sistema nervioso periférico (lo que sale)",
          "items": [
            {
              "texto": "Nervio periférico",
              "detalle": "craneal o espinal: lleva señales al cuerpo y desde el cuerpo"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "La médula espinal pertenece al sistema nervioso...",
      "opciones": [
        "Periférico",
        "Central",
        "Digestivo",
        "Endocrino"
      ],
      "respuesta": "Central",
      "explicacion": "El SNC es el encéfalo más la médula espinal."
    },
    {
      "pregunta": "¿Qué parte del encéfalo coordina el equilibrio y los movimientos?",
      "opciones": [
        "Cerebelo",
        "Médula espinal",
        "Nervio periférico",
        "Bazo"
      ],
      "respuesta": "Cerebelo",
      "explicacion": "El cerebelo está detrás y debajo del cerebro y coordina el equilibrio y la precisión del movimiento."
    },
    {
      "pregunta": "¿Cuántos pares de nervios craneales hay?",
      "opciones": [
        "12",
        "31",
        "10",
        "8"
      ],
      "respuesta": "12",
      "explicacion": "Hay 12 pares craneales (los 31 pares son los nervios espinales)."
    },
    {
      "pregunta": "Un nervio periférico es una parte del sistema nervioso que...",
      "opciones": [
        "Está dentro del cráneo",
        "Sale del sistema nervioso central hacia el cuerpo",
        "Solo existe en el cerebro",
        "Es lo mismo que la médula"
      ],
      "respuesta": "Sale del sistema nervioso central hacia el cuerpo",
      "explicacion": "Los nervios periféricos conectan el SNC con la piel, los músculos y los órganos."
    }
  ]
}$anatomia$::jsonb,
  4,
  false),

('anatomia-arco-reflejo', 'El arco reflejo: una respuesta que no espera al cerebro',
  'Un reflejo es una respuesta rápida e involuntaria. Su camino tiene 5 pasos: receptor, neurona sensitiva, médula espinal, neurona motora y efector.',
  'anatomia',
  $anatomia${
  "pasos": [
    "Un reflejo es una respuesta rápida e involuntaria: la señal no espera a que el cerebro decida.",
    "Camino: estímulo, receptor, neurona sensitiva (aferente), médula espinal, neurona motora (eferente) y efector (un músculo o una glándula).",
    "Truco: aferente significa que llega al sistema nervioso central (como un afluente que llega a un río); eferente significa que sale (como el egreso).",
    "Ejemplo: al tocar algo muy caliente retiras la mano antes de sentir dolor. El cerebro se entera después, por otra vía."
  ],
  "visuales": [
    {
      "tipo": "anatomia.flujo",
      "despuesDePaso": 1,
      "titulo": "Arco reflejo",
      "etapas": [
        {
          "titulo": "Estímulo",
          "detalle": "por ejemplo, tocar algo muy caliente"
        },
        {
          "titulo": "Receptor",
          "detalle": "capta el estímulo (terminaciones nerviosas de la piel)"
        },
        {
          "titulo": "Neurona sensitiva (aferente)",
          "detalle": "lleva la señal hacia la médula espinal"
        },
        {
          "titulo": "Centro integrador",
          "detalle": "en la médula espinal: la señal pasa a la neurona motora"
        },
        {
          "titulo": "Neurona motora (eferente)",
          "detalle": "lleva la orden desde la médula hasta el músculo"
        },
        {
          "titulo": "Efector",
          "detalle": "el músculo se contrae y retira la mano"
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué neurona lleva la señal desde el receptor hasta la médula espinal?",
      "opciones": [
        "Motora (eferente)",
        "Sensitiva (aferente)",
        "Ninguna, va directo",
        "La del efector"
      ],
      "respuesta": "Sensitiva (aferente)",
      "explicacion": "Aferente = llega al sistema nervioso central."
    },
    {
      "pregunta": "En un reflejo simple, ¿dónde se integra la señal?",
      "opciones": [
        "En la médula espinal",
        "En el cerebelo",
        "En la piel",
        "En el corazón"
      ],
      "respuesta": "En la médula espinal",
      "explicacion": "La médula pasa la señal de la neurona sensitiva a la motora sin esperar una decisión del cerebro."
    },
    {
      "pregunta": "¿Qué es el efector?",
      "opciones": [
        "El receptor de la piel",
        "El músculo o la glándula que responde",
        "La neurona sensitiva",
        "El estímulo"
      ],
      "respuesta": "El músculo o la glándula que responde",
      "explicacion": "El efector es quien ejecuta la respuesta: por ejemplo, el músculo que retira la mano."
    },
    {
      "pregunta": "¿Por qué el reflejo es tan rápido?",
      "opciones": [
        "Porque la respuesta se decide en la médula, sin esperar al cerebro",
        "Porque las neuronas van más rápido de noche",
        "Porque no usa neuronas",
        "Porque sucede antes del estímulo"
      ],
      "respuesta": "Porque la respuesta se decide en la médula, sin esperar al cerebro",
      "explicacion": "El camino es corto: receptor, médula y efector."
    }
  ]
}$anatomia$::jsonb,
  5,
  false);

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

('anatomia-clase-posicion-y-planos', 'Posición anatómica, planos y direcciones',
  'El lenguaje común de la anatomía: la posición anatómica de referencia, los tres planos de corte y los términos de dirección (superior e inferior, anterior y posterior, medial y lateral, proximal y distal).',
  'anatomia',
  $anatomia${
  "pasos": [
    "Toda descripción anatómica parte de la misma postura de referencia, la posición anatómica: de pie, de frente, con los brazos a los costados y las palmas hacia adelante. Aunque una persona real esté sentada o de lado, las palabras se refieren a esa postura. Derecha e izquierda son siempre las de la persona descrita, no las de quien mira.",
    "Tres planos de corte imaginarios ordenan el cuerpo. El plano sagital lo divide en derecha e izquierda. El plano coronal (o frontal) lo divide en una parte de adelante y otra de atrás. El plano transversal (u horizontal) lo divide en una parte de arriba y otra de abajo.",
    "Las direcciones se dicen en pares opuestos: superior (hacia la cabeza) e inferior (hacia los pies); anterior (adelante) y posterior (atrás); medial (hacia la línea media del cuerpo) y lateral (hacia el costado); proximal (más cerca de la raíz del miembro) y distal (más lejos); superficial y profundo.",
    "Ejemplos: el corazón está por encima (superior) del estómago; el esternón es anterior a la columna; en posición anatómica el radio es lateral al cúbito (queda del lado del pulgar); el codo es proximal respecto a la muñeca.",
    "Errores comunes: creer que «medial» significa «en el medio» de cualquier cosa (significa hacia la línea media del cuerpo); creer que «anterior» significa «antes» (significa delante); y usar «superior» e «inferior» para los miembros, donde se prefiere proximal y distal."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 1,
      "titulo": "Los tres planos",
      "grupos": [
        {
          "nombre": "Sagital",
          "items": [
            {
              "texto": "derecha | izquierda"
            }
          ]
        },
        {
          "nombre": "Coronal (frontal)",
          "items": [
            {
              "texto": "anterior | posterior"
            }
          ]
        },
        {
          "nombre": "Transversal (horizontal)",
          "items": [
            {
              "texto": "superior | inferior"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 2,
      "titulo": "Direcciones, en pares",
      "grupos": [
        {
          "nombre": "Vertical",
          "items": [
            {
              "texto": "Superior",
              "detalle": "hacia la cabeza"
            },
            {
              "texto": "Inferior",
              "detalle": "hacia los pies"
            }
          ]
        },
        {
          "nombre": "Adelante y atrás",
          "items": [
            {
              "texto": "Anterior",
              "detalle": "adelante"
            },
            {
              "texto": "Posterior",
              "detalle": "atrás"
            }
          ]
        },
        {
          "nombre": "Respecto al centro",
          "items": [
            {
              "texto": "Medial",
              "detalle": "hacia la línea media"
            },
            {
              "texto": "Lateral",
              "detalle": "hacia el costado"
            }
          ]
        },
        {
          "nombre": "En los miembros",
          "items": [
            {
              "texto": "Proximal",
              "detalle": "cerca de la raíz"
            },
            {
              "texto": "Distal",
              "detalle": "lejos de la raíz"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué plano divide el cuerpo en una parte anterior y otra posterior?",
      "opciones": [
        "Sagital",
        "Transversal",
        "Coronal (frontal)",
        "Medial"
      ],
      "respuesta": "Coronal (frontal)",
      "explicacion": "El plano coronal separa el frente de la espalda; el sagital separa derecha e izquierda; el transversal, arriba y abajo."
    },
    {
      "pregunta": "¿Qué plano divide el cuerpo en derecha e izquierda?",
      "opciones": [
        "Sagital",
        "Coronal",
        "Transversal",
        "Proximal"
      ],
      "respuesta": "Sagital",
      "explicacion": "El plano sagital recorre el cuerpo de adelante hacia atrás, separando la mitad derecha de la izquierda."
    },
    {
      "pregunta": "En posición anatómica, el radio es ___ respecto al cúbito.",
      "opciones": [
        "Medial",
        "Lateral",
        "Posterior",
        "Proximal"
      ],
      "respuesta": "Lateral",
      "explicacion": "El radio queda del lado del pulgar, o sea hacia el costado; el cúbito queda del lado del meñique, más cerca de la línea media."
    },
    {
      "pregunta": "¿Cuál de estas afirmaciones es correcta?",
      "opciones": [
        "La muñeca es proximal respecto al codo",
        "El codo es proximal respecto a la muñeca",
        "El pie es superior respecto a la rodilla",
        "La columna es anterior al esternón"
      ],
      "respuesta": "El codo es proximal respecto a la muñeca",
      "explicacion": "Proximal es más cerca de la raíz del miembro (el tronco); el codo está más cerca que la muñeca."
    },
    {
      "pregunta": "¿Qué describe la posición anatómica?",
      "opciones": [
        "Sentado, con las manos sobre las rodillas",
        "De pie, de frente, con los brazos a los costados y las palmas hacia adelante",
        "Acostado boca abajo",
        "De pie, de espaldas, con los brazos cruzados"
      ],
      "respuesta": "De pie, de frente, con los brazos a los costados y las palmas hacia adelante",
      "explicacion": "Es la postura de referencia: todas las direcciones se describen como si el cuerpo estuviera así."
    }
  ]
}$anatomia$::jsonb,
  1,
  true),

('anatomia-clase-tejido-oseo', 'El hueso por dentro: funciones y tejido',
  'Qué hace un hueso (sostén, protección, movimiento, reserva de minerales y formación de sangre), de qué está hecho, las partes de un hueso largo y las cinco formas de hueso.',
  'anatomia',
  $anatomia${
  "pasos": [
    "El esqueleto adulto tiene 206 huesos (un recién nacido tiene más de 270, porque varios se fusionan al crecer). Sus funciones: sostén del cuerpo, protección de órganos (el cráneo y la caja torácica), palanca para el movimiento (los músculos tiran de los huesos), reserva de calcio y fósforo, y producción de células de la sangre en la médula ósea roja.",
    "El hueso es un tejido vivo. Su matriz combina colágeno, que da flexibilidad, y sales de calcio, que dan dureza. Tres tipos de células lo trabajan: los osteoblastos forman hueso nuevo, los osteocitos mantienen el hueso maduro y los osteoclastos lo reabsorben. Así el hueso se renueva durante toda la vida.",
    "Hay dos tipos de tejido óseo: el hueso compacto, denso, en la capa exterior, y el hueso esponjoso, con pequeñas cavidades, en el interior y sobre todo en los extremos. El esponjoso es más liviano y aloja la médula ósea roja.",
    "Un hueso largo, como el fémur, tiene la diáfisis (el cuerpo o eje), dos epífisis (los extremos, cubiertos de cartílago articular en la zona donde se une con otro hueso), el periostio (la membrana que lo envuelve, por donde entran vasos y nervios) y la cavidad medular (dentro de la diáfisis, con médula amarilla en el adulto). En los niños el hueso crece en longitud en el cartílago de crecimiento, entre la diáfisis y la epífisis.",
    "Por su forma, los huesos se clasifican en largos (fémur, húmero, tibia, peroné, radio, cúbito y falanges), cortos (carpianos y tarsianos), planos (frontal, parietales, occipital, esternón, escápula y costillas), irregulares (vértebras, esfenoides, etmoides y mandíbula) y sesamoideos (pequeños, dentro de un tendón: la rótula).",
    "Error común: pensar que el hueso es una pieza muerta y dura como una piedra. Es un tejido vivo, con vasos, nervios y células que lo renuevan; por eso puede repararse."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 0,
      "titulo": "Cinco funciones del esqueleto",
      "grupos": [
        {
          "nombre": "Sostén y forma",
          "items": [
            {
              "texto": "El cuerpo mantiene su postura"
            }
          ]
        },
        {
          "nombre": "Protección",
          "items": [
            {
              "texto": "Cráneo: cerebro. Caja torácica: corazón y pulmones"
            }
          ]
        },
        {
          "nombre": "Movimiento",
          "items": [
            {
              "texto": "Los músculos tiran de los huesos, que funcionan como palancas"
            }
          ]
        },
        {
          "nombre": "Reserva de minerales",
          "items": [
            {
              "texto": "Calcio y fósforo"
            }
          ]
        },
        {
          "nombre": "Formación de sangre",
          "items": [
            {
              "texto": "En la médula ósea roja"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Partes de un hueso largo",
      "grupos": [
        {
          "nombre": "Diáfisis",
          "items": [
            {
              "texto": "El cuerpo o eje del hueso"
            }
          ]
        },
        {
          "nombre": "Epífisis",
          "items": [
            {
              "texto": "Los dos extremos, con cartílago articular"
            }
          ]
        },
        {
          "nombre": "Periostio",
          "items": [
            {
              "texto": "Membrana que lo envuelve"
            }
          ]
        },
        {
          "nombre": "Cavidad medular",
          "items": [
            {
              "texto": "Hueco central con médula ósea"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 4,
      "titulo": "Cinco formas de hueso",
      "grupos": [
        {
          "nombre": "Largos",
          "items": [
            {
              "texto": "Fémur"
            },
            {
              "texto": "Húmero"
            },
            {
              "texto": "Tibia"
            },
            {
              "texto": "Peroné"
            },
            {
              "texto": "Radio"
            },
            {
              "texto": "Cúbito"
            },
            {
              "texto": "Falanges"
            }
          ]
        },
        {
          "nombre": "Cortos",
          "items": [
            {
              "texto": "Carpianos"
            },
            {
              "texto": "Tarsianos"
            }
          ]
        },
        {
          "nombre": "Planos",
          "items": [
            {
              "texto": "Frontal"
            },
            {
              "texto": "Parietal"
            },
            {
              "texto": "Occipital"
            },
            {
              "texto": "Esternón"
            },
            {
              "texto": "Escápula"
            },
            {
              "texto": "Costillas"
            }
          ]
        },
        {
          "nombre": "Irregulares",
          "items": [
            {
              "texto": "Vértebras"
            },
            {
              "texto": "Esfenoides"
            },
            {
              "texto": "Etmoides"
            },
            {
              "texto": "Mandíbula"
            }
          ]
        },
        {
          "nombre": "Sesamoideos",
          "items": [
            {
              "texto": "Rótula"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos huesos tiene el esqueleto de un adulto?",
      "opciones": [
        "106",
        "206",
        "306",
        "270"
      ],
      "respuesta": "206",
      "explicacion": "El adulto tiene 206 huesos; el recién nacido tiene más porque varios se fusionan durante el crecimiento."
    },
    {
      "pregunta": "¿Qué células forman hueso nuevo?",
      "opciones": [
        "Osteoclastos",
        "Osteoblastos",
        "Neuronas",
        "Glóbulos rojos"
      ],
      "respuesta": "Osteoblastos",
      "explicacion": "Los osteoblastos forman hueso; los osteoclastos lo reabsorben; los osteocitos lo mantienen."
    },
    {
      "pregunta": "¿Cómo se llama el cuerpo o eje de un hueso largo?",
      "opciones": [
        "Epífisis",
        "Periostio",
        "Diáfisis",
        "Cartílago articular"
      ],
      "respuesta": "Diáfisis",
      "explicacion": "La diáfisis es el eje; las epífisis son los dos extremos."
    },
    {
      "pregunta": "¿Dónde se producen las células de la sangre?",
      "opciones": [
        "En la médula ósea roja",
        "En el periostio",
        "En el cartílago articular",
        "En los ligamentos"
      ],
      "respuesta": "En la médula ósea roja",
      "explicacion": "La médula ósea roja, en el hueso esponjoso, fabrica glóbulos rojos, glóbulos blancos y plaquetas."
    },
    {
      "pregunta": "La rótula es un hueso...",
      "opciones": [
        "Largo",
        "Plano",
        "Corto",
        "Sesamoideo"
      ],
      "respuesta": "Sesamoideo",
      "explicacion": "Está incluida en un tendón (el del cuádriceps), como todos los sesamoideos."
    }
  ]
}$anatomia$::jsonb,
  2,
  true),

('anatomia-clase-craneo', 'El cráneo: 22 huesos y sus suturas',
  'El cráneo tiene 22 huesos: 8 craneales que protegen el encéfalo y 14 faciales. Cada uno con su ubicación, más las suturas que los unen.',
  'anatomia',
  $anatomia${
  "pasos": [
    "El cráneo se divide en neurocráneo (8 huesos que protegen el encéfalo) y viscerocráneo, la cara (14 huesos). Total: 22 huesos.",
    "Los 8 craneales son: frontal (1), parietales (2), temporales (2), occipital (1), esfenoides (1) y etmoides (1). El frontal forma la frente; los parietales, el techo y los lados; los temporales, las sienes (alojan el oído); el occipital, la nuca y la base, con el agujero magno por donde pasa la médula espinal; el esfenoides, con forma de mariposa, está en el centro de la base; el etmoides, entre las órbitas, forma parte de la nariz.",
    "Los 14 faciales son: 2 maxilares, 2 cigomáticos, 2 nasales, 2 lagrimales, 2 palatinos, 2 cornetes nasales inferiores, el vómer y la mandíbula. Los que evalúa Prodigia: el maxilar (la mandíbula superior, con los dientes de arriba), la mandíbula (la única móvil, con los dientes de abajo), el cigomático (el pómulo) y el nasal (el puente de la nariz).",
    "Las suturas son articulaciones inmóviles entre los huesos del cráneo: la coronal (entre el frontal y los parietales), la sagital (entre los dos parietales), la lambdoidea (entre los parietales y el occipital) y la escamosa (entre el temporal y el parietal). En el bebé, las fontanelas son espacios blandos entre los huesos, que se cierran durante los primeros años.",
    "Además, cada oído medio tiene 3 huesecillos (martillo, yunque y estribo, los huesos más pequeños del cuerpo) y en el cuello está el hioides, un hueso suelto que sostiene la lengua. No forman parte del cráneo, pero sí del esqueleto axial.",
    "Errores comunes: creer que maxilar y mandíbula son el mismo hueso (el maxilar es superior y fijo; la mandíbula es inferior y móvil) y olvidar que frontal, temporal y occipital son también nombres de músculos: el contexto dice si se habla del hueso o del músculo."
  ],
  "visuales": [
    {
      "tipo": "anatomia.esqueleto",
      "despuesDePaso": 0,
      "titulo": "El cráneo",
      "huesos": [
        "craneo"
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 2,
      "titulo": "8 craneales y los faciales que evalúa Prodigia",
      "grupos": [
        {
          "nombre": "8 huesos craneales",
          "items": [
            {
              "texto": "Frontal",
              "detalle": "1: la frente"
            },
            {
              "texto": "Parietal",
              "detalle": "2: techo y lados"
            },
            {
              "texto": "Temporal",
              "detalle": "2: las sienes"
            },
            {
              "texto": "Occipital",
              "detalle": "1: nuca y base"
            },
            {
              "texto": "Esfenoides",
              "detalle": "1: centro de la base"
            },
            {
              "texto": "Etmoides",
              "detalle": "1: entre las órbitas"
            }
          ]
        },
        {
          "nombre": "14 huesos faciales (los principales)",
          "items": [
            {
              "texto": "Maxilar",
              "detalle": "2: mandíbula superior"
            },
            {
              "texto": "Mandíbula",
              "detalle": "1: inferior y móvil"
            },
            {
              "texto": "Cigomático",
              "detalle": "2: pómulos"
            },
            {
              "texto": "Nasal",
              "detalle": "2: puente de la nariz"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Cuatro suturas",
      "grupos": [
        {
          "nombre": "Coronal",
          "items": [
            {
              "texto": "frontal y parietales"
            }
          ]
        },
        {
          "nombre": "Sagital",
          "items": [
            {
              "texto": "entre los dos parietales"
            }
          ]
        },
        {
          "nombre": "Lambdoidea",
          "items": [
            {
              "texto": "parietales y occipital"
            }
          ]
        },
        {
          "nombre": "Escamosa",
          "items": [
            {
              "texto": "temporal y parietal"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos huesos forman el cráneo en total (craneales y faciales)?",
      "opciones": [
        "8",
        "14",
        "22",
        "28"
      ],
      "respuesta": "22",
      "explicacion": "8 craneales más 14 faciales."
    },
    {
      "pregunta": "¿Qué hueso tiene el agujero por donde pasa la médula espinal?",
      "opciones": [
        "Frontal",
        "Occipital",
        "Esfenoides",
        "Mandíbula"
      ],
      "respuesta": "Occipital",
      "explicacion": "El agujero magno está en el occipital, en la base del cráneo."
    },
    {
      "pregunta": "¿Qué sutura une los dos huesos parietales?",
      "opciones": [
        "Coronal",
        "Lambdoidea",
        "Sagital",
        "Escamosa"
      ],
      "respuesta": "Sagital",
      "explicacion": "La sagital recorre el techo del cráneo, entre los dos parietales."
    },
    {
      "pregunta": "¿Cuál es el único hueso móvil del cráneo?",
      "opciones": [
        "Maxilar",
        "Mandíbula",
        "Cigomático",
        "Etmoides"
      ],
      "respuesta": "Mandíbula",
      "explicacion": "La mandíbula se articula con el temporal y permite abrir y cerrar la boca; el maxilar es fijo."
    },
    {
      "pregunta": "¿Cuál de estos es uno de los huesecillos del oído?",
      "opciones": [
        "Esfenoides",
        "Estribo",
        "Cigomático",
        "Nasal"
      ],
      "respuesta": "Estribo",
      "explicacion": "Martillo, yunque y estribo: el estribo es el hueso más pequeño del cuerpo."
    }
  ]
}$anatomia$::jsonb,
  3,
  true),

('anatomia-clase-columna-y-torax', 'Columna vertebral y caja torácica',
  'Las regiones de la columna (7-12-5 más sacro y cóccix), cómo es una vértebra, las curvas de la espalda y la caja torácica con sus 12 pares de costillas.',
  'anatomia',
  $anatomia${
  "pasos": [
    "La columna vertebral tiene unas 33 vértebras: 7 cervicales (C1 a C7), 12 torácicas (T1 a T12), 5 lumbares (L1 a L5), el sacro (5 vértebras fusionadas) y el cóccix (de 3 a 5 fusionadas, casi siempre 4). Las 24 primeras son móviles; sacro y cóccix se funden en un solo hueso cada uno. Regla del horario: 7 - 12 - 5.",
    "Las dos primeras cervicales tienen nombre propio: el atlas (C1), que sostiene el cráneo, y el axis (C2), cuyo diente permite girar la cabeza. Una vértebra típica tiene un cuerpo (adelante, soporta el peso), un arco con una apófisis espinosa (la que se palpa en la espalda) y un agujero; todos los agujeros juntos forman el conducto vertebral, por donde pasa la médula espinal.",
    "Vista de lado, la columna no es recta: tiene cuatro curvas. La cervical y la lumbar se curvan hacia adelante (lordosis); la torácica y la sacra, hacia atrás (cifosis). Las curvas reparten el peso y amortiguan. Entre una vértebra y otra hay discos intervertebrales de cartílago, que amortiguan y dan movilidad.",
    "La caja torácica está formada por el esternón (hueso plano en el centro del pecho, con manubrio, cuerpo y apófisis xifoides) y 12 pares de costillas unidas atrás a las vértebras torácicas. Los pares 1 a 7 son costillas verdaderas (llegan al esternón por su cartílago); los pares 8 a 10 son falsas (se unen al cartílago de la costilla de arriba); los pares 11 y 12 son flotantes (no llegan por delante). Simplificación: algunos textos llaman falsas a los pares 8 a 12.",
    "La caja torácica protege el corazón y los pulmones, y su movimiento junto con los músculos intercostales y el diafragma hace posible respirar. La columna, las costillas y el esternón son parte del esqueleto axial.",
    "Errores comunes: decir que hay 7 pares de costillas (son 12, aunque solo 7 sean verdaderas); creer que las costillas flotantes están sueltas (sí se unen atrás a la columna) y confundir el sacro y el cóccix con vértebras móviles."
  ],
  "visuales": [
    {
      "tipo": "anatomia.esqueleto",
      "despuesDePaso": 0,
      "titulo": "La columna vertebral",
      "huesos": [
        "columna"
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 0,
      "titulo": "Vértebras por región",
      "grupos": [
        {
          "nombre": "Cervicales",
          "items": [
            {
              "texto": "7 vértebras",
              "marca": "C",
              "detalle": "cuello"
            }
          ]
        },
        {
          "nombre": "Torácicas",
          "items": [
            {
              "texto": "12 vértebras",
              "marca": "T",
              "detalle": "con las costillas"
            }
          ]
        },
        {
          "nombre": "Lumbares",
          "items": [
            {
              "texto": "5 vértebras",
              "marca": "L",
              "detalle": "espalda baja"
            }
          ]
        },
        {
          "nombre": "Sacro y cóccix",
          "items": [
            {
              "texto": "Sacro",
              "detalle": "5 fusionadas"
            },
            {
              "texto": "Cóccix",
              "detalle": "unas 4 fusionadas"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Los 12 pares de costillas",
      "grupos": [
        {
          "nombre": "Verdaderas",
          "items": [
            {
              "texto": "Pares 1 a 7",
              "detalle": "llegan al esternón"
            }
          ]
        },
        {
          "nombre": "Falsas",
          "items": [
            {
              "texto": "Pares 8 a 10",
              "detalle": "se unen al cartílago de la costilla de arriba"
            }
          ]
        },
        {
          "nombre": "Flotantes",
          "items": [
            {
              "texto": "Pares 11 y 12",
              "detalle": "no llegan por delante"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántas vértebras cervicales hay?",
      "opciones": [
        "12",
        "5",
        "7",
        "4"
      ],
      "respuesta": "7",
      "explicacion": "Hay 7 cervicales (cuello), 12 torácicas y 5 lumbares."
    },
    {
      "pregunta": "¿Cómo se llama la primera vértebra cervical, la que sostiene el cráneo?",
      "opciones": [
        "Axis",
        "Atlas",
        "Sacro",
        "Cóccix"
      ],
      "respuesta": "Atlas",
      "explicacion": "El atlas es C1; el axis es C2."
    },
    {
      "pregunta": "¿Qué pares de costillas son las verdaderas?",
      "opciones": [
        "Los pares 1 a 7",
        "Los pares 8 a 10",
        "Los pares 11 y 12",
        "Todos los pares"
      ],
      "respuesta": "Los pares 1 a 7",
      "explicacion": "Son las que llegan hasta el esternón por su propio cartílago."
    },
    {
      "pregunta": "¿Qué regiones de la columna se curvan hacia adelante (lordosis)?",
      "opciones": [
        "Torácica y sacra",
        "Cervical y lumbar",
        "Solo la sacra",
        "Ninguna"
      ],
      "respuesta": "Cervical y lumbar",
      "explicacion": "La cervical y la lumbar son lordosis; la torácica y la sacra, cifosis."
    },
    {
      "pregunta": "¿Qué estructura pasa por el conducto vertebral?",
      "opciones": [
        "El esófago",
        "La médula espinal",
        "El corazón",
        "El diafragma"
      ],
      "respuesta": "La médula espinal",
      "explicacion": "Los agujeros de las vértebras forman un conducto que protege la médula espinal."
    }
  ]
}$anatomia$::jsonb,
  4,
  true),

('anatomia-clase-esqueleto-apendicular', 'Cinturas y extremidades: el esqueleto apendicular',
  'El esqueleto se divide en axial (80 huesos) y apendicular (126): las cinturas escapular y pélvica, el miembro superior y el inferior, con sus 30 huesos por lado.',
  'anatomia',
  $anatomia${
  "pasos": [
    "El esqueleto se divide en axial (el eje del cuerpo: cráneo, columna, costillas y esternón, con 80 huesos) y apendicular (los apéndices: las cinturas y las extremidades, con 126 huesos). 80 + 126 = 206.",
    "La cintura escapular une el brazo al tronco: la clavícula (adelante, con forma de S) y la escápula u omóplato (hueso plano en la espalda). Cada miembro superior tiene 30 huesos: húmero (brazo), radio y cúbito (antebrazo) y la mano, con 8 carpianos, 5 metacarpianos y 14 falanges.",
    "La cintura pélvica está formada por dos huesos coxales (cada uno con tres partes: ilion, isquion y pubis). Junto con el sacro y el cóccix forman la pelvis, que sostiene el peso del tronco y protege órganos como la vejiga. En promedio es más ancha en la mujer.",
    "Cada miembro inferior tiene 30 huesos: fémur (muslo), rótula (delante de la rodilla), tibia y peroné (pierna) y el pie, con 7 tarsianos, 5 metatarsianos y 14 falanges. El fémur es el hueso más largo y más fuerte del cuerpo.",
    "Cuentas del esqueleto apendicular: las cinturas suman 6 huesos (2 clavículas, 2 escápulas y 2 coxales), los dos miembros superiores 60 y los dos miembros inferiores 60. Total: 126.",
    "Errores comunes: llamar «pelvis» a un solo hueso (es un conjunto de cuatro: dos coxales, el sacro y el cóccix); confundir el húmero (brazo) con el fémur (muslo) y olvidar que la primera fila del pie tiene 7 huesos y la de la mano, 8."
  ],
  "visuales": [
    {
      "tipo": "anatomia.esqueleto",
      "despuesDePaso": 1,
      "titulo": "Miembro superior",
      "huesos": [
        "humero",
        "radio",
        "cubito",
        "carpianos",
        "metacarpianos",
        "falanges_mano"
      ]
    },
    {
      "tipo": "anatomia.esqueleto",
      "despuesDePaso": 3,
      "titulo": "Pelvis y miembro inferior",
      "huesos": [
        "pelvis",
        "femur",
        "tibia",
        "perone",
        "tarsianos",
        "metatarsianos",
        "falanges_pie"
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 4,
      "titulo": "126 huesos apendiculares",
      "grupos": [
        {
          "nombre": "Cinturas",
          "items": [
            {
              "texto": "6 huesos",
              "detalle": "2 clavículas, 2 escápulas, 2 coxales"
            }
          ]
        },
        {
          "nombre": "Miembros superiores",
          "items": [
            {
              "texto": "60 huesos",
              "detalle": "30 por lado"
            }
          ]
        },
        {
          "nombre": "Miembros inferiores",
          "items": [
            {
              "texto": "60 huesos",
              "detalle": "30 por lado"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos huesos tiene el esqueleto apendicular?",
      "opciones": [
        "80",
        "126",
        "206",
        "60"
      ],
      "respuesta": "126",
      "explicacion": "80 axiales + 126 apendiculares = 206."
    },
    {
      "pregunta": "¿Qué dos huesos forman la cintura escapular?",
      "opciones": [
        "Clavícula y escápula",
        "Húmero y radio",
        "Ilion y pubis",
        "Fémur y rótula"
      ],
      "respuesta": "Clavícula y escápula",
      "explicacion": "La cintura escapular une el miembro superior al tronco con la clavícula y la escápula."
    },
    {
      "pregunta": "¿Qué huesos forman la pelvis?",
      "opciones": [
        "Solo el sacro",
        "Los dos coxales, el sacro y el cóccix",
        "Los fémures y las tibias",
        "Las últimas costillas"
      ],
      "respuesta": "Los dos coxales, el sacro y el cóccix",
      "explicacion": "La pelvis no es un hueso, sino un conjunto de cuatro."
    },
    {
      "pregunta": "¿Cuántos huesos tiene cada miembro superior?",
      "opciones": [
        "30",
        "27",
        "60",
        "14"
      ],
      "respuesta": "30",
      "explicacion": "1 húmero + 2 huesos del antebrazo + 27 de la mano (8 + 5 + 14)."
    },
    {
      "pregunta": "¿Cuál es el hueso más largo y fuerte del cuerpo?",
      "opciones": [
        "Húmero",
        "Tibia",
        "Fémur",
        "Peroné"
      ],
      "respuesta": "Fémur",
      "explicacion": "El fémur es el hueso del muslo."
    }
  ]
}$anatomia$::jsonb,
  5,
  true),

('anatomia-clase-articulaciones', 'Las articulaciones: cómo se unen los huesos',
  'Los tres tipos de articulación según su movilidad, las partes de una articulación sinovial, la diferencia entre ligamento y tendón y los movimientos básicos.',
  'anatomia',
  $anatomia${
  "pasos": [
    "Una articulación es el lugar donde dos o más huesos se unen. Según su movilidad hay tres tipos: las fibrosas son casi inmóviles (las suturas del cráneo), las cartilaginosas son poco móviles (los discos entre las vértebras) y las sinoviales son muy móviles (hombro, codo, cadera, rodilla).",
    "Una articulación sinovial tiene cartílago articular (cubre los extremos de los huesos y reduce la fricción), una cápsula articular (la envuelve), una membrana sinovial que produce el líquido sinovial (lubrica y nutre) y ligamentos, que unen hueso con hueso. No confundas ligamento (hueso con hueso) con tendón (músculo con hueso).",
    "Tipos de articulación sinovial: la esférica, en el hombro y la cadera, se mueve en todas direcciones; la de bisagra, en el codo (y, con matices, la rodilla), hace flexión y extensión; la de pivote, entre el atlas y el axis, permite girar la cabeza; y la plana, entre los carpianos, permite deslizamientos. Simplificación: algunos textos clasifican la rodilla como bicondílea.",
    "Movimientos básicos: flexión (disminuye el ángulo entre dos huesos) y extensión (lo aumenta); abducción (alejar del plano medio) y aducción (acercar); rotación (girar sobre su eje) y circunducción (dibujar un círculo). Por ejemplo, el bíceps flexiona el codo y el tríceps lo extiende.",
    "Dos datos útiles: el hombro es la articulación con más libertad de movimiento y la rodilla es la más grande y compleja; esta última tiene además meniscos, láminas de cartílago que amortiguan.",
    "Errores comunes: creer que todas las articulaciones se mueven (las suturas del cráneo no) y llamar «hueso» al cartílago articular (es cartílago, otro tejido)."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 0,
      "titulo": "Tres tipos de articulación",
      "grupos": [
        {
          "nombre": "Fibrosas (casi inmóviles)",
          "items": [
            {
              "texto": "Suturas del cráneo"
            }
          ]
        },
        {
          "nombre": "Cartilaginosas (poco móviles)",
          "items": [
            {
              "texto": "Discos entre las vértebras"
            }
          ]
        },
        {
          "nombre": "Sinoviales (muy móviles)",
          "items": [
            {
              "texto": "Hombro"
            },
            {
              "texto": "Codo"
            },
            {
              "texto": "Cadera"
            },
            {
              "texto": "Rodilla"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 2,
      "titulo": "Tipos de articulación sinovial",
      "grupos": [
        {
          "nombre": "Esférica",
          "items": [
            {
              "texto": "Hombro y cadera",
              "detalle": "todas las direcciones"
            }
          ]
        },
        {
          "nombre": "Bisagra",
          "items": [
            {
              "texto": "Codo (y rodilla)",
              "detalle": "flexión y extensión"
            }
          ]
        },
        {
          "nombre": "Pivote",
          "items": [
            {
              "texto": "Atlas y axis",
              "detalle": "girar la cabeza"
            }
          ]
        },
        {
          "nombre": "Plana",
          "items": [
            {
              "texto": "Entre carpianos",
              "detalle": "deslizamientos"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Movimientos en pares",
      "grupos": [
        {
          "nombre": "Flexión y extensión",
          "items": [
            {
              "texto": "Flexión",
              "detalle": "cierra el ángulo"
            },
            {
              "texto": "Extensión",
              "detalle": "lo abre"
            }
          ]
        },
        {
          "nombre": "Abducción y aducción",
          "items": [
            {
              "texto": "Abducción",
              "detalle": "aleja del plano medio"
            },
            {
              "texto": "Aducción",
              "detalle": "acerca"
            }
          ]
        },
        {
          "nombre": "Giros",
          "items": [
            {
              "texto": "Rotación",
              "detalle": "sobre su eje"
            },
            {
              "texto": "Circunducción",
              "detalle": "dibuja un círculo"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "Las articulaciones entre los huesos del cráneo (suturas) son...",
      "opciones": [
        "Sinoviales",
        "Fibrosas, casi inmóviles",
        "Esféricas",
        "De bisagra"
      ],
      "respuesta": "Fibrosas, casi inmóviles",
      "explicacion": "Las suturas unen los huesos con tejido fibroso y prácticamente no permiten movimiento."
    },
    {
      "pregunta": "¿Qué une un ligamento?",
      "opciones": [
        "Un músculo con un hueso",
        "Un hueso con otro hueso",
        "Dos músculos",
        "La piel con el hueso"
      ],
      "respuesta": "Un hueso con otro hueso",
      "explicacion": "El tendón une músculo con hueso; el ligamento, hueso con hueso."
    },
    {
      "pregunta": "El hombro y la cadera son articulaciones...",
      "opciones": [
        "De bisagra",
        "Planas",
        "Esféricas",
        "De pivote"
      ],
      "respuesta": "Esféricas",
      "explicacion": "La cabeza redondeada de un hueso encaja en una cavidad: se mueve en todas direcciones."
    },
    {
      "pregunta": "¿Qué es la flexión?",
      "opciones": [
        "Aumentar el ángulo entre dos huesos",
        "Disminuir el ángulo entre dos huesos",
        "Girar sobre el eje",
        "Alejar del plano medio"
      ],
      "respuesta": "Disminuir el ángulo entre dos huesos",
      "explicacion": "Doblar el codo es una flexión; estirarlo, una extensión."
    },
    {
      "pregunta": "¿Para qué sirve el líquido sinovial?",
      "opciones": [
        "Fabrica sangre",
        "Une los huesos entre sí",
        "Lubrica y nutre la articulación",
        "Da dureza al hueso"
      ],
      "respuesta": "Lubrica y nutre la articulación",
      "explicacion": "Lo produce la membrana sinovial y reduce la fricción entre los cartílagos."
    }
  ]
}$anatomia$::jsonb,
  6,
  true),

('anatomia-clase-tipos-y-contraccion', 'Tipos de músculo y cómo se contraen',
  'Los tres tipos de tejido muscular (esquelético, liso y cardíaco), las partes de un músculo esquelético y cómo se contrae una fibra: actina, miosina, calcio y energía.',
  'anatomia',
  $anatomia${
  "pasos": [
    "Hay tres tipos de tejido muscular. El esquelético está unido a los huesos y se mueve a voluntad; se ve estriado al microscopio. El liso forma las paredes de órganos huecos y de vasos (estómago, intestino, vejiga, arterias) y es involuntario. El cardíaco forma el corazón: es estriado como el esquelético, pero involuntario.",
    "Un músculo esquelético se une al hueso mediante tendones. Tiene un vientre (la parte carnosa) y se ancla en dos huesos: el origen (el extremo más fijo) y la inserción (el extremo que se mueve). El cuerpo humano tiene más de 600 músculos esqueléticos.",
    "Funciones: producir movimiento, mantener la postura, generar calor (por eso tiritas de frío: contraes músculos para calentarte) y sostener y proteger órganos. Propiedades: contractilidad (acortarse), excitabilidad (responder a un estímulo), extensibilidad (estirarse) y elasticidad (volver a su forma).",
    "Cada fibra muscular contiene miofibrillas, formadas por filamentos de dos proteínas: actina y miosina. Cuando llega el impulso nervioso se libera calcio dentro de la fibra y los filamentos se deslizan uno sobre otro, acortándola. El proceso gasta energía en forma de ATP.",
    "Un músculo solo puede tirar, no empujar; por eso trabajan en pares: el agonista realiza el movimiento y el antagonista hace el contrario (bíceps y tríceps). La contracción es isotónica cuando el músculo cambia de longitud y hay movimiento, e isométrica cuando genera tensión sin cambiar de longitud, como al sostener un peso quieto.",
    "Errores comunes: creer que el corazón es músculo esquelético (es cardíaco e involuntario); pensar que los músculos «empujan» y confundir tendón (une músculo con hueso) con ligamento (une hueso con hueso)."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 0,
      "titulo": "Tres tipos de tejido muscular",
      "grupos": [
        {
          "nombre": "Esquelético",
          "items": [
            {
              "texto": "Estriado",
              "detalle": "voluntario; unido a los huesos"
            }
          ]
        },
        {
          "nombre": "Liso",
          "items": [
            {
              "texto": "No estriado",
              "detalle": "involuntario; paredes del estómago, intestino, vejiga y vasos"
            }
          ]
        },
        {
          "nombre": "Cardíaco",
          "items": [
            {
              "texto": "Estriado",
              "detalle": "involuntario; solo en el corazón"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.flujo",
      "despuesDePaso": 3,
      "titulo": "Cómo se contrae un músculo esquelético",
      "etapas": [
        {
          "titulo": "Neurona motora",
          "detalle": "envía el impulso al músculo"
        },
        {
          "titulo": "Unión neuromuscular",
          "detalle": "libera acetilcolina sobre la fibra muscular"
        },
        {
          "titulo": "Fibra muscular",
          "detalle": "libera calcio en su interior"
        },
        {
          "titulo": "Actina y miosina",
          "detalle": "los filamentos se deslizan, usando ATP"
        },
        {
          "titulo": "Contracción",
          "detalle": "el músculo se acorta y tira del hueso"
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué tipo de músculo es estriado pero involuntario?",
      "opciones": [
        "Esquelético",
        "Liso",
        "Cardíaco",
        "Ninguno"
      ],
      "respuesta": "Cardíaco",
      "explicacion": "El cardíaco tiene estrías como el esquelético, pero no lo controlas a voluntad."
    },
    {
      "pregunta": "¿Dónde se encuentra el músculo liso?",
      "opciones": [
        "En las paredes del estómago y de los vasos",
        "Unido a los huesos de las piernas",
        "Solo en la cara",
        "Solo en el corazón"
      ],
      "respuesta": "En las paredes del estómago y de los vasos",
      "explicacion": "El músculo liso forma las paredes de los órganos huecos y de los vasos sanguíneos."
    },
    {
      "pregunta": "¿Qué une un tendón?",
      "opciones": [
        "Hueso con hueso",
        "Músculo con hueso",
        "Piel con músculo",
        "Músculo con músculo"
      ],
      "respuesta": "Músculo con hueso",
      "explicacion": "Los ligamentos son los que unen hueso con hueso."
    },
    {
      "pregunta": "¿Qué dos proteínas se deslizan para acortar una fibra muscular?",
      "opciones": [
        "Colágeno y elastina",
        "Actina y miosina",
        "Hemoglobina y albúmina",
        "Queratina y melanina"
      ],
      "respuesta": "Actina y miosina",
      "explicacion": "Los filamentos de actina y miosina se deslizan y acortan la fibra; gastan ATP."
    },
    {
      "pregunta": "Sostener un peso sin moverlo es una contracción...",
      "opciones": [
        "Isotónica",
        "Isométrica",
        "Involuntaria",
        "Lisa"
      ],
      "respuesta": "Isométrica",
      "explicacion": "Isométrica: hay tensión, pero el músculo no cambia de longitud."
    }
  ]
}$anatomia$::jsonb,
  1,
  true),

('anatomia-clase-nomenclatura-origen-insercion', 'Nombres, origen e inserción de los músculos grandes',
  'Cómo leer el nombre de un músculo y dónde se ancla cada uno de los diez músculos grandes que evalúa la práctica: origen, inserción y acción principal.',
  'anatomia',
  $anatomia${
  "pasos": [
    "Los nombres de los músculos siguen criterios que puedes leer: forma (deltoides, trapecio), número de cabezas (bíceps, tríceps, cuádriceps), ubicación (pectoral, glúteos, frontal, temporal, occipital), dirección de las fibras (recto abdominal, oblicuos, transverso), tamaño (mayor, menor, ancho) y acción (masetero, flexor, extensor).",
    "Origen e inserción: el origen es el extremo unido al hueso más fijo (por lo general el más cercano al tronco) y la inserción es el extremo unido al hueso que se mueve. Al contraerse, el músculo acerca la inserción hacia el origen. Simplificación: las fichas reales tienen más puntos de anclaje; aquí van los principales.",
    "Miembro superior. Bíceps braquial: origen en la escápula, inserción en el radio; flexiona el codo. Tríceps braquial: origen en la escápula y el húmero, inserción en el cúbito (el olécranon, la punta del codo); extiende el codo. Deltoides: origen en la clavícula y la escápula, inserción en el húmero; levanta el brazo hacia el costado.",
    "Tronco. Pectoral mayor: origen en la clavícula, el esternón y los cartílagos de las costillas superiores, inserción en el húmero; lleva el brazo hacia adelante y adentro. Dorsal ancho: origen en las vértebras de la parte baja de la espalda, el sacro y la cresta ilíaca (hueso de la cadera), inserción en el húmero; lleva el brazo hacia atrás y abajo. Trapecio: origen en el occipital y en las vértebras cervicales y torácicas, inserción en la clavícula y la escápula; sube y junta los omóplatos. Recto abdominal: origen en el pubis, inserción en el esternón y en los cartílagos de las costillas 5 a 7; flexiona el tronco.",
    "Miembro inferior. Glúteos (sobre todo el mayor): origen en el ilion, el sacro y el cóccix, inserción en el fémur; extienden la cadera. Cuádriceps: origen en la cadera y el fémur, inserción en la tibia a través de la rótula; extiende la rodilla. Gastrocnemio: origen en el fémur, sobre la rodilla, inserción en el calcáneo a través del tendón de Aquiles; levanta el talón.",
    "Errores comunes: creer que el origen es siempre el extremo que no se mueve (en algunos movimientos se invierten los papeles) y olvidar que un músculo cruza al menos una articulación: por eso sus dos anclajes están en huesos distintos."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 0,
      "titulo": "Cómo leer un nombre",
      "grupos": [
        {
          "nombre": "Forma",
          "items": [
            {
              "texto": "Deltoides"
            },
            {
              "texto": "Trapecio"
            }
          ]
        },
        {
          "nombre": "Número de cabezas",
          "items": [
            {
              "texto": "Bíceps",
              "marca": "2"
            },
            {
              "texto": "Tríceps",
              "marca": "3"
            },
            {
              "texto": "Cuádriceps",
              "marca": "4"
            }
          ]
        },
        {
          "nombre": "Ubicación",
          "items": [
            {
              "texto": "Pectoral mayor"
            },
            {
              "texto": "Glúteos"
            },
            {
              "texto": "Recto abdominal"
            }
          ]
        },
        {
          "nombre": "Tamaño o dirección",
          "items": [
            {
              "texto": "Dorsal ancho"
            },
            {
              "texto": "Recto abdominal"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 4,
      "titulo": "Origen → inserción",
      "grupos": [
        {
          "nombre": "Brazo y hombro",
          "items": [
            {
              "texto": "Bíceps",
              "detalle": "escápula → radio: flexiona el codo"
            },
            {
              "texto": "Tríceps",
              "detalle": "escápula y húmero → cúbito: extiende el codo"
            },
            {
              "texto": "Deltoides",
              "detalle": "clavícula y escápula → húmero: levanta el brazo"
            }
          ]
        },
        {
          "nombre": "Tronco",
          "items": [
            {
              "texto": "Pectoral mayor",
              "detalle": "clavícula, esternón y costillas → húmero"
            },
            {
              "texto": "Dorsal ancho",
              "detalle": "espalda baja, sacro y cadera → húmero"
            },
            {
              "texto": "Trapecio",
              "detalle": "occipital y vértebras → clavícula y escápula"
            },
            {
              "texto": "Recto abdominal",
              "detalle": "pubis → esternón y costillas 5 a 7"
            }
          ]
        },
        {
          "nombre": "Cadera y pierna",
          "items": [
            {
              "texto": "Glúteos",
              "detalle": "ilion, sacro y cóccix → fémur"
            },
            {
              "texto": "Cuádriceps",
              "detalle": "cadera y fémur → tibia, por la rótula"
            },
            {
              "texto": "Gastrocnemio",
              "detalle": "fémur → calcáneo, por el tendón de Aquiles"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué es la inserción de un músculo?",
      "opciones": [
        "El extremo unido al hueso más fijo",
        "El extremo unido al hueso que se mueve",
        "El centro del vientre muscular",
        "La membrana que lo envuelve"
      ],
      "respuesta": "El extremo unido al hueso que se mueve",
      "explicacion": "El origen es el extremo más fijo; la inserción es el que se mueve al contraerse el músculo."
    },
    {
      "pregunta": "¿En qué hueso se inserta el bíceps braquial?",
      "opciones": [
        "Húmero",
        "Escápula",
        "Radio",
        "Fémur"
      ],
      "respuesta": "Radio",
      "explicacion": "Origen en la escápula e inserción en el radio: al contraerse, flexiona el codo."
    },
    {
      "pregunta": "¿Dónde se inserta el tríceps braquial?",
      "opciones": [
        "En el olécranon del cúbito",
        "En la tibia",
        "En la clavícula",
        "En el calcáneo"
      ],
      "respuesta": "En el olécranon del cúbito",
      "explicacion": "Por eso extiende el codo: tira de la punta del cúbito."
    },
    {
      "pregunta": "¿Qué tendón une el gastrocnemio con el talón?",
      "opciones": [
        "El tendón rotuliano",
        "El tendón de Aquiles",
        "El tendón del bíceps",
        "El ligamento cruzado"
      ],
      "respuesta": "El tendón de Aquiles",
      "explicacion": "El tendón de Aquiles (calcáneo) es el más grueso del cuerpo."
    },
    {
      "pregunta": "¿Cuál de estos músculos flexiona el tronco?",
      "opciones": [
        "Trapecio",
        "Recto abdominal",
        "Deltoides",
        "Gastrocnemio"
      ],
      "respuesta": "Recto abdominal",
      "explicacion": "Del pubis al esternón y las costillas: al contraerse, acerca el tórax a la pelvis."
    }
  ]
}$anatomia$::jsonb,
  2,
  true),

('anatomia-clase-musculos-cabeza-cuello', 'Músculos de la cabeza y el cuello',
  'Los músculos de la expresión facial (frontal, orbiculares, cigomático mayor, buccinador, occipital y platisma), los de la masticación (masetero y temporal), los del cuello y sus nervios.',
  'anatomia',
  $anatomia${
  "pasos": [
    "Los músculos de la cabeza se dividen en dos grupos: los de la expresión facial, que mueven la piel (se unen al hueso por un extremo y a la piel por el otro), y los de la masticación, que mueven la mandíbula.",
    "Expresión: el frontal (en la frente) sube las cejas y arruga la frente; el orbicular de los ojos cierra los párpados; el orbicular de la boca cierra y frunce los labios; el cigomático mayor tira de la comisura de la boca hacia arriba (es el de la sonrisa); el buccinador, en la mejilla, comprime la mejilla, como al soplar. Todos los mueve el nervio facial (VII).",
    "El occipital y el frontal son los dos vientres de un mismo músculo del cuero cabelludo (occipitofrontal), unidos por una lámina de tendón; el occipital, en la nuca, tira del cuero cabelludo hacia atrás. El platisma es una lámina fina bajo la piel del cuello que baja el labio inferior y la mandíbula. También los mueve el nervio facial.",
    "Masticación: el masetero (va del pómulo al ángulo de la mandíbula) y el temporal (en la sien) elevan la mandíbula para cerrar la boca. Los mueve el nervio trigémino (V).",
    "Cuello: el esternocleidomastoideo va del esternón y la clavícula hasta la apófisis mastoides del hueso temporal (detrás de la oreja) y gira e inclina la cabeza; el trapecio sube los hombros y sostiene la cabeza. Ambos los mueve el nervio accesorio (XI).",
    "Errores comunes: llamar «músculos de la cara» a todo el grupo (el occipital está en la nuca y el platisma en el cuello); confundir el hueso temporal con el músculo temporal y creer que los músculos de la masticación son de expresión."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Expresión y masticación",
      "grupos": [
        {
          "nombre": "Expresión (nervio facial, VII)",
          "items": [
            {
              "texto": "Frontal",
              "detalle": "sube las cejas"
            },
            {
              "texto": "Orbicular de los ojos",
              "detalle": "cierra los párpados"
            },
            {
              "texto": "Orbicular de la boca",
              "detalle": "cierra y frunce los labios"
            },
            {
              "texto": "Cigomático mayor",
              "detalle": "sonrisa"
            },
            {
              "texto": "Buccinador",
              "detalle": "comprime la mejilla"
            },
            {
              "texto": "Occipital",
              "detalle": "tira del cuero cabelludo hacia atrás"
            },
            {
              "texto": "Platisma",
              "detalle": "baja el labio inferior y la mandíbula"
            }
          ]
        },
        {
          "nombre": "Masticación (nervio trigémino, V)",
          "items": [
            {
              "texto": "Masetero",
              "detalle": "eleva la mandíbula"
            },
            {
              "texto": "Temporal",
              "detalle": "eleva la mandíbula"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 4,
      "titulo": "Cuello (nervio accesorio, XI)",
      "grupos": [
        {
          "nombre": "Cuello y hombros",
          "items": [
            {
              "texto": "Esternocleidomastoideo",
              "detalle": "gira e inclina la cabeza"
            },
            {
              "texto": "Trapecio",
              "detalle": "sube los hombros; sostiene la cabeza"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué nervio craneal mueve los músculos de la expresión facial?",
      "opciones": [
        "Trigémino (V)",
        "Facial (VII)",
        "Vago (X)",
        "Hipogloso (XII)"
      ],
      "respuesta": "Facial (VII)",
      "explicacion": "El facial (VII) inerva los músculos de la expresión; el trigémino (V), los de la masticación."
    },
    {
      "pregunta": "¿Qué hacen el masetero y el temporal?",
      "opciones": [
        "Cierran los párpados",
        "Elevan la mandíbula para masticar",
        "Suben las cejas",
        "Giran la cabeza"
      ],
      "respuesta": "Elevan la mandíbula para masticar",
      "explicacion": "Son los músculos de la masticación: cierran la boca con fuerza."
    },
    {
      "pregunta": "¿Dónde está el músculo occipital?",
      "opciones": [
        "En la frente",
        "En la parte de atrás de la cabeza (nuca)",
        "En la mejilla",
        "En la sien"
      ],
      "respuesta": "En la parte de atrás de la cabeza (nuca)",
      "explicacion": "Es el vientre posterior del músculo del cuero cabelludo; el frontal es el anterior."
    },
    {
      "pregunta": "¿Dónde se ubica el platisma?",
      "opciones": [
        "En el cuello, bajo la piel",
        "En la frente",
        "En el muslo",
        "En el abdomen"
      ],
      "respuesta": "En el cuello, bajo la piel",
      "explicacion": "Es una lámina superficial del cuello: por eso no es solo «de la cara»."
    },
    {
      "pregunta": "¿Qué nervio mueve el trapecio y el esternocleidomastoideo?",
      "opciones": [
        "Accesorio (XI)",
        "Óptico (II)",
        "Facial (VII)",
        "Oculomotor (III)"
      ],
      "respuesta": "Accesorio (XI)",
      "explicacion": "El nervio accesorio es motor de estos dos músculos del cuello y el hombro."
    }
  ]
}$anatomia$::jsonb,
  3,
  true),

('anatomia-clase-musculos-del-tronco', 'Músculos del tronco: pecho, abdomen y espalda',
  'Los músculos que mueven el brazo y la columna y sostienen el abdomen: pectoral mayor, recto abdominal, trapecio y dorsal ancho, más el diafragma, los músculos intercostales, los oblicuos y el transverso.',
  'anatomia',
  $anatomia${
  "pasos": [
    "El tronco tiene músculos que mueven el brazo, la columna y la respiración. Por delante están el pectoral mayor (pecho) y el recto abdominal (abdomen); por detrás, el trapecio y el dorsal ancho.",
    "Pecho: el pectoral mayor lleva el brazo hacia adelante y adentro, como para abrazar; debajo está el pectoral menor. Los músculos intercostales, entre las costillas, ayudan a respirar. El diafragma es el principal músculo de la respiración: separa el tórax del abdomen y baja al inspirar.",
    "Abdomen: la pared abdominal tiene cuatro músculos: el recto abdominal (vertical, flexiona el tronco), los oblicuos externo e interno (giran e inclinan el tronco) y el transverso del abdomen (el más profundo, comprime como un corsé). Sostienen y protegen las vísceras y ayudan a mantener la postura.",
    "Espalda: el trapecio (con forma de trapecio, del cuello hasta la mitad de la espalda) sube, junta y baja los omóplatos; el dorsal ancho, el más ancho de la espalda, lleva el brazo hacia atrás y abajo; los erectores de la columna, a lo largo de la columna, ayudan a mantenerla derecha.",
    "En el esquema puedes ubicar cada uno por región. Es un esquema de regiones, no un dibujo anatómico.",
    "Errores comunes: creer que los «abdominales» son solo el recto abdominal (la pared tiene cuatro músculos) y confundir el trapecio (cuello y espalda alta) con el deltoides (el hombro)."
  ],
  "visuales": [
    {
      "tipo": "anatomia.cuerpo",
      "despuesDePaso": 4,
      "titulo": "Músculos del tronco por región",
      "entradas": [
        {
          "nombre": "Pectoral mayor",
          "regiones": [
            "torax"
          ],
          "detalle": "lleva el brazo hacia adelante y hacia adentro"
        },
        {
          "nombre": "Recto abdominal",
          "regiones": [
            "abdomen"
          ],
          "detalle": "flexiona el tronco hacia adelante"
        },
        {
          "nombre": "Trapecio",
          "regiones": [
            "cuello",
            "torax"
          ],
          "vista": "posterior",
          "detalle": "sube y junta los omóplatos; sostiene el cuello"
        },
        {
          "nombre": "Dorsal ancho",
          "regiones": [
            "torax",
            "abdomen"
          ],
          "vista": "posterior",
          "detalle": "lleva el brazo hacia atrás y abajo"
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 2,
      "titulo": "Los cuatro músculos de la pared abdominal",
      "grupos": [
        {
          "nombre": "Pared abdominal",
          "items": [
            {
              "texto": "Recto abdominal",
              "detalle": "vertical; flexiona el tronco"
            },
            {
              "texto": "Oblicuo externo",
              "detalle": "gira e inclina el tronco"
            },
            {
              "texto": "Oblicuo interno",
              "detalle": "gira e inclina el tronco"
            },
            {
              "texto": "Transverso del abdomen",
              "detalle": "el más profundo; comprime"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el principal músculo de la respiración?",
      "opciones": [
        "Trapecio",
        "Diafragma",
        "Recto abdominal",
        "Deltoides"
      ],
      "respuesta": "Diafragma",
      "explicacion": "El diafragma separa el tórax del abdomen y baja al inspirar."
    },
    {
      "pregunta": "¿Qué músculo lleva el brazo hacia atrás y abajo?",
      "opciones": [
        "Pectoral mayor",
        "Dorsal ancho",
        "Bíceps",
        "Cuádriceps"
      ],
      "respuesta": "Dorsal ancho",
      "explicacion": "El dorsal ancho es antagonista del pectoral mayor en el hombro."
    },
    {
      "pregunta": "¿Cuántos músculos forman la pared abdominal descrita en esta clase?",
      "opciones": [
        "2",
        "3",
        "4",
        "6"
      ],
      "respuesta": "4",
      "explicacion": "Recto abdominal, oblicuo externo, oblicuo interno y transverso del abdomen."
    },
    {
      "pregunta": "¿Qué hace el trapecio con los omóplatos?",
      "opciones": [
        "Los sube y los junta",
        "Los separa del cuerpo",
        "Los deja fijos",
        "Los gira hacia el pecho"
      ],
      "respuesta": "Los sube y los junta",
      "explicacion": "Sus fibras superiores los suben y las medias los juntan."
    },
    {
      "pregunta": "¿Hacia dónde lleva el brazo el pectoral mayor?",
      "opciones": [
        "Hacia atrás y abajo",
        "Hacia adelante y adentro",
        "Solo hacia arriba",
        "Lo mantiene quieto"
      ],
      "respuesta": "Hacia adelante y adentro",
      "explicacion": "Como para abrazar: aduce y flexiona el brazo."
    }
  ]
}$anatomia$::jsonb,
  4,
  true),

('anatomia-clase-musculos-de-las-extremidades', 'Músculos de los brazos y las piernas',
  'Deltoides, bíceps y tríceps en el miembro superior; glúteos, cuádriceps, isquiotibiales y músculos de la pantorrilla en el inferior, con sus pares de antagonistas.',
  'anatomia',
  $anatomia${
  "pasos": [
    "Miembro superior: el deltoides cubre el hombro y levanta el brazo hacia el costado. En el brazo, el bíceps braquial, por delante, flexiona el codo (y gira el antebrazo para que la palma mire hacia arriba); el tríceps braquial, por detrás, lo extiende. En el antebrazo, los flexores (por delante) doblan la muñeca y los dedos y los extensores (por detrás) los estiran.",
    "Cadera y muslo: los glúteos (mayor, medio y menor) forman la nalga; el glúteo mayor es el más grande y extiende la cadera (al subir escaleras o levantarte de una silla). Delante del muslo, el cuádriceps (cuatro cabezas: recto femoral y tres vastos) extiende la rodilla; detrás, los isquiotibiales la flexionan; en la cara interna, los aductores juntan las piernas.",
    "Pierna: el gastrocnemio (la pantorrilla) y el sóleo, más profundo, se unen al calcáneo por el tendón de Aquiles, el más grueso del cuerpo, y levantan el talón. El tibial anterior, en la parte delantera de la pierna, levanta la punta del pie.",
    "Antagonistas por articulación: codo (bíceps y tríceps), rodilla (cuádriceps e isquiotibiales), tobillo (gastrocnemio y tibial anterior) y hombro (pectoral mayor y dorsal ancho). Si sabes uno, sabes su opuesto.",
    "Errores comunes: creer que el cuádriceps es un solo bulto (tiene cuatro cabezas); confundir el gastrocnemio (superficial, forma el bulto de la pantorrilla) con el sóleo (más profundo) y pensar que los glúteos son solo un relleno: están entre los músculos más potentes del cuerpo."
  ],
  "visuales": [
    {
      "tipo": "anatomia.cuerpo",
      "despuesDePaso": 2,
      "titulo": "Extremidades por región",
      "entradas": [
        {
          "nombre": "Deltoides",
          "regiones": [
            "hombro"
          ],
          "detalle": "levanta el brazo hacia el costado"
        },
        {
          "nombre": "Bíceps",
          "regiones": [
            "brazo"
          ],
          "detalle": "flexiona el codo"
        },
        {
          "nombre": "Cuádriceps",
          "regiones": [
            "muslo"
          ],
          "detalle": "extiende la rodilla"
        },
        {
          "nombre": "Tríceps",
          "regiones": [
            "brazo"
          ],
          "vista": "posterior",
          "detalle": "extiende el codo"
        },
        {
          "nombre": "Glúteos",
          "regiones": [
            "pelvis"
          ],
          "vista": "posterior",
          "detalle": "extienden la cadera"
        },
        {
          "nombre": "Gastrocnemio",
          "regiones": [
            "pierna"
          ],
          "vista": "posterior",
          "detalle": "la pantorrilla: levanta el talón (puntas de pie)"
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Pares de músculos opuestos",
      "grupos": [
        {
          "nombre": "Codo",
          "items": [
            {
              "texto": "Bíceps",
              "marca": "flexiona"
            },
            {
              "texto": "Tríceps",
              "marca": "extiende"
            }
          ]
        },
        {
          "nombre": "Rodilla",
          "items": [
            {
              "texto": "Cuádriceps",
              "marca": "extiende"
            },
            {
              "texto": "Isquiotibiales",
              "marca": "flexionan"
            }
          ]
        },
        {
          "nombre": "Tobillo",
          "items": [
            {
              "texto": "Gastrocnemio",
              "detalle": "levanta el talón"
            },
            {
              "texto": "Tibial anterior",
              "detalle": "levanta la punta"
            }
          ]
        },
        {
          "nombre": "Hombro",
          "items": [
            {
              "texto": "Pectoral mayor",
              "detalle": "adelante y adentro"
            },
            {
              "texto": "Dorsal ancho",
              "detalle": "atrás y abajo"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántas cabezas tiene el cuádriceps?",
      "opciones": [
        "2",
        "3",
        "4",
        "5"
      ],
      "respuesta": "4",
      "explicacion": "Recto femoral y tres vastos: por eso «cuádriceps»."
    },
    {
      "pregunta": "¿Qué tendón une el gastrocnemio y el sóleo con el calcáneo?",
      "opciones": [
        "Tendón de Aquiles",
        "Tendón rotuliano",
        "Ligamento colateral",
        "Tendón del bíceps"
      ],
      "respuesta": "Tendón de Aquiles",
      "explicacion": "Es el tendón más grueso del cuerpo."
    },
    {
      "pregunta": "¿Qué músculo extiende la cadera y forma la nalga?",
      "opciones": [
        "Glúteo mayor",
        "Cuádriceps",
        "Tibial anterior",
        "Deltoides"
      ],
      "respuesta": "Glúteo mayor",
      "explicacion": "El glúteo mayor es el más grande de los tres glúteos y extiende la cadera."
    },
    {
      "pregunta": "¿Cuál es el antagonista del tríceps braquial?",
      "opciones": [
        "Bíceps braquial",
        "Deltoides",
        "Gastrocnemio",
        "Sóleo"
      ],
      "respuesta": "Bíceps braquial",
      "explicacion": "El bíceps flexiona el codo y el tríceps lo extiende."
    },
    {
      "pregunta": "¿Qué hace el deltoides?",
      "opciones": [
        "Extiende la rodilla",
        "Levanta el brazo hacia el costado",
        "Flexiona el tronco",
        "Cierra los párpados"
      ],
      "respuesta": "Levanta el brazo hacia el costado",
      "explicacion": "Cubre el hombro y abduce el brazo."
    }
  ]
}$anatomia$::jsonb,
  5,
  true),

('anatomia-clase-cavidades-del-cuerpo', 'Las cavidades del cuerpo y sus órganos',
  'Las cavidades que alojan y protegen los órganos (craneal, torácica, abdominal y pélvica), el diafragma, las membranas que las recubren y los cuadrantes del abdomen.',
  'anatomia',
  $anatomia${
  "pasos": [
    "El cuerpo tiene espacios internos, las cavidades, que alojan y protegen los órganos. Hay dos grandes: la cavidad dorsal, hacia atrás, y la cavidad ventral, hacia adelante.",
    "La cavidad dorsal incluye la cavidad craneal, que aloja el encéfalo (en Prodigia, el cerebro), y el conducto vertebral, que aloja la médula espinal.",
    "La cavidad ventral se divide con el diafragma, un músculo en forma de cúpula. Arriba está la cavidad torácica, con el corazón y los pulmones (el espacio entre los dos pulmones se llama mediastino y contiene también la tráquea y el esófago). Abajo está la cavidad abdominopélvica, que se subdivide en la cavidad abdominal (hígado, estómago, intestinos, páncreas, bazo y riñones) y la cavidad pélvica (vejiga y el tramo final del intestino, el recto).",
    "Cada cavidad está tapizada por membranas serosas, con un poco de líquido que reduce la fricción: la pleura envuelve los pulmones, el pericardio el corazón y el peritoneo el abdomen. Los riñones y el páncreas quedan detrás del peritoneo (se dice que son retroperitoneales).",
    "Para ubicar algo en el abdomen se lo divide en cuatro cuadrantes: superior derecho, superior izquierdo, inferior derecho e inferior izquierdo. El hígado está en el cuadrante superior derecho; el estómago y el bazo, en el superior izquierdo.",
    "Errores comunes: creer que el corazón está entero en el lado izquierdo (está en el centro del tórax, con la punta inclinada a la izquierda); creer que la vejiga está en el abdomen (está en la pelvis) y creer que los riñones están «adelante» (están atrás, a cada lado de la columna)."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 2,
      "titulo": "Cuatro cavidades y sus órganos",
      "grupos": [
        {
          "nombre": "Cavidad craneal (dentro del cráneo (cabeza))",
          "items": [
            {
              "texto": "Cerebro"
            }
          ]
        },
        {
          "nombre": "Cavidad torácica (el tórax (pecho), sobre el diafragma)",
          "items": [
            {
              "texto": "Corazón"
            },
            {
              "texto": "Pulmones"
            }
          ]
        },
        {
          "nombre": "Cavidad abdominal (bajo el diafragma, hasta el borde de la pelvis)",
          "items": [
            {
              "texto": "Hígado"
            },
            {
              "texto": "Estómago"
            },
            {
              "texto": "Riñones"
            },
            {
              "texto": "Intestino"
            },
            {
              "texto": "Páncreas"
            },
            {
              "texto": "Bazo"
            }
          ]
        },
        {
          "nombre": "Cavidad pélvica (dentro de la pelvis, la parte más baja del tronco)",
          "items": [
            {
              "texto": "Vejiga"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.cuerpo",
      "despuesDePaso": 3,
      "titulo": "Dónde queda cada órgano",
      "entradas": [
        {
          "nombre": "Cerebro",
          "regiones": [
            "cabeza"
          ],
          "detalle": "dentro del cráneo"
        },
        {
          "nombre": "Corazón",
          "regiones": [
            "torax"
          ],
          "detalle": "en el centro del tórax, algo inclinado a la izquierda"
        },
        {
          "nombre": "Pulmones",
          "regiones": [
            "torax"
          ],
          "detalle": "uno a cada lado del corazón"
        },
        {
          "nombre": "Hígado",
          "regiones": [
            "abdomen"
          ],
          "detalle": "arriba a la derecha del abdomen"
        },
        {
          "nombre": "Estómago",
          "regiones": [
            "abdomen"
          ],
          "detalle": "arriba a la izquierda del abdomen"
        },
        {
          "nombre": "Bazo",
          "regiones": [
            "abdomen"
          ],
          "detalle": "arriba a la izquierda, junto al estómago"
        },
        {
          "nombre": "Páncreas",
          "regiones": [
            "abdomen"
          ],
          "detalle": "detrás del estómago"
        },
        {
          "nombre": "Riñones",
          "regiones": [
            "abdomen"
          ],
          "detalle": "en la parte de atrás del abdomen, a cada lado de la columna"
        },
        {
          "nombre": "Intestino",
          "regiones": [
            "abdomen"
          ],
          "detalle": "ocupa gran parte del abdomen; el tramo final baja a la pelvis"
        },
        {
          "nombre": "Vejiga",
          "regiones": [
            "pelvis"
          ],
          "detalle": "en la pelvis, detrás del pubis"
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 4,
      "titulo": "Cuadrantes del abdomen",
      "grupos": [
        {
          "nombre": "Superior derecho",
          "items": [
            {
              "texto": "Hígado"
            }
          ]
        },
        {
          "nombre": "Superior izquierdo",
          "items": [
            {
              "texto": "Estómago"
            },
            {
              "texto": "Bazo"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué estructura separa la cavidad torácica de la abdominal?",
      "opciones": [
        "El esternón",
        "El diafragma",
        "El peritoneo",
        "El mediastino"
      ],
      "respuesta": "El diafragma",
      "explicacion": "Es un músculo en forma de cúpula que separa el tórax del abdomen."
    },
    {
      "pregunta": "¿Dónde están los riñones?",
      "opciones": [
        "En la pelvis",
        "En el tórax",
        "Atrás en el abdomen, a cada lado de la columna",
        "Delante del estómago"
      ],
      "respuesta": "Atrás en el abdomen, a cada lado de la columna",
      "explicacion": "Son retroperitoneales: quedan detrás de la membrana que envuelve el abdomen."
    },
    {
      "pregunta": "¿Qué membrana serosa envuelve el corazón?",
      "opciones": [
        "Pleura",
        "Peritoneo",
        "Pericardio",
        "Meninges"
      ],
      "respuesta": "Pericardio",
      "explicacion": "Pleura (pulmones), pericardio (corazón), peritoneo (abdomen)."
    },
    {
      "pregunta": "¿En qué cuadrante del abdomen está el hígado?",
      "opciones": [
        "Superior derecho",
        "Inferior izquierdo",
        "Superior izquierdo",
        "Inferior derecho"
      ],
      "respuesta": "Superior derecho",
      "explicacion": "El hígado ocupa sobre todo el lado derecho, bajo el diafragma."
    },
    {
      "pregunta": "¿En qué cavidad está la vejiga?",
      "opciones": [
        "Abdominal",
        "Torácica",
        "Pélvica",
        "Craneal"
      ],
      "respuesta": "Pélvica",
      "explicacion": "La vejiga está dentro de la pelvis, detrás del pubis."
    }
  ]
}$anatomia$::jsonb,
  1,
  true),

('anatomia-clase-aparato-digestivo', 'Aparato digestivo: del bocado al ano',
  'El tubo digestivo paso a paso (boca, esófago, estómago, intestinos) y las glándulas que lo ayudan: hígado, vesícula, páncreas y glándulas salivales.',
  'anatomia',
  $anatomia${
  "pasos": [
    "El aparato digestivo transforma los alimentos en nutrientes que la sangre puede llevar a las células. Tiene un tubo digestivo (boca, faringe, esófago, estómago, intestino delgado, intestino grueso, recto y ano) y glándulas anexas (glándulas salivales, hígado, vesícula biliar y páncreas).",
    "Hay digestión mecánica (masticar, mezclar) y química (enzimas). En la boca, la saliva contiene amilasa, una enzima que empieza a digerir el almidón. El esófago empuja el alimento hasta el estómago con movimientos ondulatorios (peristaltismo).",
    "El estómago es una bolsa muscular en la parte superior izquierda del abdomen. Mezcla el alimento con el jugo gástrico (ácido clorhídrico y pepsina, una enzima que digiere proteínas) y lo convierte en una pasta. Una capa de moco protege sus paredes del ácido.",
    "El intestino delgado mide unos 6 metros y tiene tres partes: duodeno, yeyuno e íleon. Allí llegan la bilis y el jugo pancreático. Sus paredes tienen vellosidades, que aumentan la superficie por donde los nutrientes pasan a la sangre. El intestino grueso mide alrededor de 1,5 metros: absorbe agua y sales y forma las heces, que se almacenan en el recto y salen por el ano.",
    "El hígado es la glándula más grande del cuerpo. Produce la bilis, que ayuda a digerir las grasas, almacena glucosa en forma de glucógeno y transforma sustancias. La vesícula biliar guarda la bilis. El páncreas produce el jugo pancreático, con enzimas que vierte en el duodeno, y además las hormonas insulina y glucagón, que regulan la glucosa en la sangre.",
    "Errores comunes: creer que el alimento pasa por el hígado o el páncreas (solo llegan sus jugos); confundir digerir (descomponer) con absorber (pasar a la sangre) y pensar que el estómago absorbe la mayoría de los nutrientes (lo hace el intestino delgado)."
  ],
  "visuales": [
    {
      "tipo": "anatomia.flujo",
      "despuesDePaso": 1,
      "titulo": "Recorrido del alimento",
      "etapas": [
        {
          "titulo": "Boca",
          "detalle": "se mastica y la saliva empieza a digerir el almidón"
        },
        {
          "titulo": "Faringe",
          "detalle": "cruce entre vía digestiva y vía respiratoria"
        },
        {
          "titulo": "Esófago",
          "detalle": "tubo que lleva el alimento al estómago"
        },
        {
          "titulo": "Estómago",
          "detalle": "el jugo gástrico convierte el alimento en una pasta"
        },
        {
          "titulo": "Intestino delgado",
          "detalle": "se absorbe la mayoría de los nutrientes"
        },
        {
          "titulo": "Intestino grueso",
          "detalle": "se absorbe agua y se forman las heces"
        },
        {
          "titulo": "Recto y ano",
          "detalle": "salida de las heces"
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 4,
      "titulo": "Glándulas anexas",
      "grupos": [
        {
          "nombre": "Hígado",
          "items": [
            {
              "texto": "Bilis",
              "detalle": "digestión de las grasas"
            },
            {
              "texto": "Glucógeno",
              "detalle": "almacena glucosa"
            }
          ]
        },
        {
          "nombre": "Vesícula biliar",
          "items": [
            {
              "texto": "Guarda la bilis"
            }
          ]
        },
        {
          "nombre": "Páncreas",
          "items": [
            {
              "texto": "Jugo pancreático",
              "detalle": "enzimas al duodeno"
            },
            {
              "texto": "Insulina y glucagón",
              "detalle": "hormonas de la glucosa"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Dónde empieza la digestión química del almidón?",
      "opciones": [
        "En el estómago",
        "En la boca, con la saliva",
        "En el intestino grueso",
        "En el hígado"
      ],
      "respuesta": "En la boca, con la saliva",
      "explicacion": "La amilasa de la saliva empieza a digerir el almidón."
    },
    {
      "pregunta": "¿Qué contiene el jugo gástrico?",
      "opciones": [
        "Bilis",
        "Insulina",
        "Ácido clorhídrico y pepsina",
        "Amilasa"
      ],
      "respuesta": "Ácido clorhídrico y pepsina",
      "explicacion": "El ácido y la pepsina digieren las proteínas en el estómago."
    },
    {
      "pregunta": "¿Qué órgano absorbe la mayor parte de los nutrientes?",
      "opciones": [
        "Estómago",
        "Intestino delgado",
        "Esófago",
        "Intestino grueso"
      ],
      "respuesta": "Intestino delgado",
      "explicacion": "Sus vellosidades dan una gran superficie de absorción."
    },
    {
      "pregunta": "¿Qué produce el hígado que ayuda a digerir las grasas?",
      "opciones": [
        "Bilis",
        "Insulina",
        "Pepsina",
        "Saliva"
      ],
      "respuesta": "Bilis",
      "explicacion": "La bilis se guarda en la vesícula y se vierte en el intestino delgado."
    },
    {
      "pregunta": "¿Qué hormonas produce el páncreas para regular la glucosa?",
      "opciones": [
        "Adrenalina y cortisol",
        "Insulina y glucagón",
        "Tiroxina y calcitonina",
        "Bilis y saliva"
      ],
      "respuesta": "Insulina y glucagón",
      "explicacion": "Además de su función digestiva, el páncreas es una glándula endocrina."
    }
  ]
}$anatomia$::jsonb,
  2,
  true),

('anatomia-clase-aparato-respiratorio', 'Aparato respiratorio: vías, pulmones y alvéolos',
  'El camino del aire, la estructura de los pulmones (3 lóbulos a la derecha y 2 a la izquierda), los alvéolos donde ocurre el intercambio de gases y la mecánica de la respiración.',
  'anatomia',
  $anatomia${
  "pasos": [
    "El aparato respiratorio aporta oxígeno a la sangre y elimina dióxido de carbono. Tiene las vías respiratorias (nariz, faringe, laringe, tráquea, bronquios y bronquiolos) y los pulmones.",
    "En las vías: la nariz calienta, humedece y filtra el aire; la faringe es un cruce con el aparato digestivo; la laringe contiene las cuerdas vocales y la epiglotis, que tapa la vía al tragar; la tráquea es un tubo con anillos de cartílago que la mantienen abierta y se divide en dos bronquios, uno para cada pulmón.",
    "Los pulmones ocupan la mayor parte de la cavidad torácica, a cada lado del corazón. El derecho tiene 3 lóbulos y el izquierdo 2, porque comparte espacio con el corazón. Cada pulmón está envuelto por la pleura.",
    "Los bronquios se ramifican en bronquiolos cada vez más finos y terminan en los alvéolos: sacos diminutos (cientos de millones) rodeados de capilares. Allí el oxígeno pasa a la sangre y el dióxido de carbono pasa al aire para salir.",
    "Ventilación: al inspirar, el diafragma se contrae y baja y los músculos intercostales elevan las costillas; el tórax se agranda y entra el aire. Al espirar se relajan y el aire sale. Los pulmones no tienen músculo propio: se llenan y se vacían porque cambia el volumen del tórax.",
    "Errores comunes: creer que los dos pulmones son iguales; confundir ventilar (mover el aire) con el intercambio de gases (ocurre en los alvéolos) y pensar que el intercambio sucede en la tráquea."
  ],
  "visuales": [
    {
      "tipo": "anatomia.flujo",
      "despuesDePaso": 1,
      "titulo": "Recorrido del aire",
      "etapas": [
        {
          "titulo": "Nariz",
          "detalle": "entra el aire, se calienta y se filtra"
        },
        {
          "titulo": "Faringe",
          "detalle": "vía común con el aparato digestivo"
        },
        {
          "titulo": "Laringe",
          "detalle": "contiene las cuerdas vocales"
        },
        {
          "titulo": "Tráquea",
          "detalle": "tubo con anillos de cartílago"
        },
        {
          "titulo": "Bronquios",
          "detalle": "uno para cada pulmón"
        },
        {
          "titulo": "Bronquiolos",
          "detalle": "ramas cada vez más finas"
        },
        {
          "titulo": "Alvéolos",
          "detalle": "el oxígeno pasa a la sangre y el dióxido de carbono sale"
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 2,
      "titulo": "Los dos pulmones",
      "grupos": [
        {
          "nombre": "Pulmón derecho",
          "items": [
            {
              "texto": "3 lóbulos"
            }
          ]
        },
        {
          "nombre": "Pulmón izquierdo",
          "items": [
            {
              "texto": "2 lóbulos",
              "detalle": "deja lugar al corazón"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.cuerpo",
      "despuesDePaso": 2,
      "titulo": "Ubicación de los pulmones",
      "entradas": [
        {
          "nombre": "Corazón",
          "regiones": [
            "torax"
          ],
          "detalle": "en el centro del tórax, algo inclinado a la izquierda"
        },
        {
          "nombre": "Pulmones",
          "regiones": [
            "torax"
          ],
          "detalle": "uno a cada lado del corazón"
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos lóbulos tiene el pulmón derecho?",
      "opciones": [
        "2",
        "3",
        "4",
        "5"
      ],
      "respuesta": "3",
      "explicacion": "El derecho tiene 3 y el izquierdo 2."
    },
    {
      "pregunta": "¿Qué evita que la tráquea se cierre?",
      "opciones": [
        "Anillos de cartílago",
        "Válvulas cardíacas",
        "El diafragma",
        "Las cuerdas vocales"
      ],
      "respuesta": "Anillos de cartílago",
      "explicacion": "Los anillos de cartílago mantienen la tráquea abierta."
    },
    {
      "pregunta": "¿Dónde se intercambian el oxígeno y el dióxido de carbono con la sangre?",
      "opciones": [
        "En los bronquios",
        "En los alvéolos",
        "En la laringe",
        "En la pleura"
      ],
      "respuesta": "En los alvéolos",
      "explicacion": "Sus paredes finas y los capilares que los rodean permiten el intercambio."
    },
    {
      "pregunta": "¿Qué hace el diafragma al inspirar?",
      "opciones": [
        "Se relaja y sube",
        "Se contrae y baja",
        "Cierra la laringe",
        "Bombea sangre"
      ],
      "respuesta": "Se contrae y baja",
      "explicacion": "Así agranda el tórax y entra el aire."
    },
    {
      "pregunta": "¿Qué estructura tapa la laringe al tragar?",
      "opciones": [
        "La epiglotis",
        "La úvula",
        "El bronquio",
        "La pleura"
      ],
      "respuesta": "La epiglotis",
      "explicacion": "Evita que el alimento entre en las vías respiratorias."
    }
  ]
}$anatomia$::jsonb,
  3,
  true),

('anatomia-clase-corazon-sangre-y-bazo', 'Corazón, vasos, sangre y bazo',
  'El corazón y sus 4 cavidades, arterias, venas y capilares, los dos circuitos de la sangre, sus componentes y el bazo, órgano del sistema linfático.',
  'anatomia',
  $anatomia${
  "pasos": [
    "El aparato circulatorio lleva la sangre a todo el cuerpo. Lo forman el corazón (la bomba), los vasos sanguíneos (arterias, venas y capilares) y la sangre.",
    "El corazón, del tamaño aproximado de un puño, está en el centro del tórax, con la punta inclinada hacia la izquierda. Tiene cuatro cavidades: dos aurículas (arriba, reciben la sangre) y dos ventrículos (abajo, la impulsan), y válvulas que evitan el retroceso. Su músculo se llama miocardio.",
    "Las arterias sacan la sangre del corazón y tienen paredes gruesas y elásticas; las venas la traen de vuelta y tienen válvulas; los capilares son vasos finísimos donde se intercambian oxígeno y nutrientes con los tejidos. La aorta es la arteria más grande.",
    "Dos circuitos: la circulación menor (pulmonar) va del ventrículo derecho a los pulmones y vuelve a la aurícula izquierda; la circulación mayor (sistémica) va del ventrículo izquierdo a todo el cuerpo y vuelve a la aurícula derecha.",
    "La sangre tiene plasma (la parte líquida), glóbulos rojos (llevan el oxígeno con la hemoglobina), glóbulos blancos (defensa) y plaquetas (coagulación).",
    "El bazo, un órgano del sistema linfático de aproximadamente el tamaño de un puño, está arriba a la izquierda del abdomen, bajo el diafragma y junto al estómago. Filtra la sangre, elimina glóbulos rojos viejos, guarda plaquetas y participa en las defensas del cuerpo.",
    "Errores comunes: creer que todas las arterias llevan sangre oxigenada (las pulmonares no); creer que el corazón está en el lado izquierdo del pecho (está en el centro) y creer que el bazo es del aparato digestivo."
  ],
  "visuales": [
    {
      "tipo": "anatomia.flujo",
      "despuesDePaso": 3,
      "titulo": "Circulación de la sangre",
      "etapas": [
        {
          "titulo": "Aurícula derecha",
          "detalle": "recibe la sangre pobre en oxígeno del cuerpo"
        },
        {
          "titulo": "Ventrículo derecho",
          "detalle": "la envía hacia los pulmones"
        },
        {
          "titulo": "Arterias pulmonares",
          "detalle": "llevan la sangre a los pulmones"
        },
        {
          "titulo": "Pulmones",
          "detalle": "la sangre se carga de oxígeno"
        },
        {
          "titulo": "Venas pulmonares",
          "detalle": "traen la sangre oxigenada al corazón"
        },
        {
          "titulo": "Aurícula izquierda",
          "detalle": "recibe la sangre oxigenada"
        },
        {
          "titulo": "Ventrículo izquierdo",
          "detalle": "la impulsa con fuerza al resto del cuerpo"
        },
        {
          "titulo": "Aorta y arterias",
          "detalle": "reparten la sangre a todo el cuerpo"
        },
        {
          "titulo": "Venas cavas",
          "detalle": "devuelven la sangre al corazón"
        }
      ],
      "ciclo": true
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 4,
      "titulo": "Componentes de la sangre",
      "grupos": [
        {
          "nombre": "Plasma",
          "items": [
            {
              "texto": "Parte líquida"
            }
          ]
        },
        {
          "nombre": "Glóbulos rojos",
          "items": [
            {
              "texto": "Transportan oxígeno"
            }
          ]
        },
        {
          "nombre": "Glóbulos blancos",
          "items": [
            {
              "texto": "Defensa"
            }
          ]
        },
        {
          "nombre": "Plaquetas",
          "items": [
            {
              "texto": "Coagulación"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.cuerpo",
      "despuesDePaso": 5,
      "titulo": "Corazón y bazo",
      "entradas": [
        {
          "nombre": "Corazón",
          "regiones": [
            "torax"
          ],
          "detalle": "en el centro del tórax, algo inclinado a la izquierda"
        },
        {
          "nombre": "Bazo",
          "regiones": [
            "abdomen"
          ],
          "detalle": "arriba a la izquierda, junto al estómago"
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántas cavidades tiene el corazón?",
      "opciones": [
        "2",
        "3",
        "4",
        "6"
      ],
      "respuesta": "4",
      "explicacion": "Dos aurículas y dos ventrículos."
    },
    {
      "pregunta": "La circulación menor (pulmonar) va del ventrículo derecho hacia...",
      "opciones": [
        "Los pulmones",
        "La aorta",
        "Todo el cuerpo",
        "El hígado"
      ],
      "respuesta": "Los pulmones",
      "explicacion": "Lleva la sangre a oxigenarse y vuelve a la aurícula izquierda."
    },
    {
      "pregunta": "¿Qué células transportan el oxígeno?",
      "opciones": [
        "Plaquetas",
        "Glóbulos blancos",
        "Glóbulos rojos",
        "Neuronas"
      ],
      "respuesta": "Glóbulos rojos",
      "explicacion": "Lo transportan unidos a la hemoglobina."
    },
    {
      "pregunta": "El bazo pertenece al sistema...",
      "opciones": [
        "Digestivo",
        "Linfático",
        "Respiratorio",
        "Excretor"
      ],
      "respuesta": "Linfático",
      "explicacion": "Filtra la sangre y participa en las defensas."
    },
    {
      "pregunta": "¿En qué vasos se intercambian oxígeno y nutrientes con los tejidos?",
      "opciones": [
        "Arterias",
        "Venas",
        "Capilares",
        "Aorta"
      ],
      "respuesta": "Capilares",
      "explicacion": "Son los vasos más finos: sus paredes permiten el intercambio."
    }
  ]
}$anatomia$::jsonb,
  4,
  true),

('anatomia-clase-aparato-excretor', 'Aparato excretor: riñones y vejiga',
  'Cómo los riñones filtran la sangre y forman la orina, el recorrido por los uréteres, la vejiga y la uretra, y otras funciones de los riñones.',
  'anatomia',
  $anatomia${
  "pasos": [
    "El aparato excretor (o urinario) filtra la sangre, elimina desechos y regula el agua y las sales del cuerpo. Lo forman dos riñones, dos uréteres, la vejiga y la uretra.",
    "Los riñones tienen forma de frijol y miden unos 11 cm. Están en la parte de atrás del abdomen, a cada lado de la columna, protegidos por las últimas costillas. El derecho queda un poco más abajo que el izquierdo porque el hígado ocupa lugar.",
    "Cada riñón tiene alrededor de un millón de nefronas, las unidades que filtran la sangre. El filtrado pasa por tubos donde el cuerpo recupera el agua y las sustancias útiles; lo que sobra, con urea y sales, forma la orina.",
    "Los uréteres son dos tubos que llevan la orina a la vejiga. La vejiga es un órgano hueco, de músculo liso, que almacena la orina; está en la pelvis, detrás del pubis. La uretra la conduce al exterior.",
    "Los riñones cumplen además otras funciones: ayudan a regular la presión arterial y el equilibrio ácido-base, y producen eritropoyetina, la hormona que estimula la formación de glóbulos rojos.",
    "Errores comunes: creer que los riñones fabrican el agua de la orina (la toman de la sangre); creer que la vejiga está en el abdomen (está en la pelvis) y pensar que los riñones están adelante en el abdomen (están atrás)."
  ],
  "visuales": [
    {
      "tipo": "anatomia.flujo",
      "despuesDePaso": 3,
      "titulo": "Recorrido de la orina",
      "etapas": [
        {
          "titulo": "Riñones",
          "detalle": "filtran la sangre y forman la orina"
        },
        {
          "titulo": "Uréteres",
          "detalle": "dos tubos que llevan la orina a la vejiga"
        },
        {
          "titulo": "Vejiga",
          "detalle": "almacena la orina"
        },
        {
          "titulo": "Uretra",
          "detalle": "conducto de salida al exterior"
        }
      ]
    },
    {
      "tipo": "anatomia.cuerpo",
      "despuesDePaso": 3,
      "titulo": "Riñones y vejiga",
      "entradas": [
        {
          "nombre": "Riñones",
          "regiones": [
            "abdomen"
          ],
          "detalle": "en la parte de atrás del abdomen, a cada lado de la columna"
        },
        {
          "nombre": "Vejiga",
          "regiones": [
            "pelvis"
          ],
          "detalle": "en la pelvis, detrás del pubis"
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la unidad que filtra la sangre en el riñón?",
      "opciones": [
        "La nefrona",
        "El alvéolo",
        "La neurona",
        "La vellosidad"
      ],
      "respuesta": "La nefrona",
      "explicacion": "Cada riñón tiene alrededor de un millón."
    },
    {
      "pregunta": "¿Qué estructura lleva la orina del riñón a la vejiga?",
      "opciones": [
        "La uretra",
        "El uréter",
        "El esófago",
        "La aorta"
      ],
      "respuesta": "El uréter",
      "explicacion": "Los uréteres son dos, uno por riñón; la uretra sale de la vejiga."
    },
    {
      "pregunta": "¿Dónde se ubica la vejiga?",
      "opciones": [
        "En la cavidad pélvica",
        "En el tórax",
        "Detrás de los riñones",
        "En la cavidad craneal"
      ],
      "respuesta": "En la cavidad pélvica",
      "explicacion": "Está detrás del pubis, dentro de la pelvis."
    },
    {
      "pregunta": "¿Dónde están los riñones?",
      "opciones": [
        "A cada lado de la columna, atrás en el abdomen",
        "Delante del estómago",
        "Dentro de la pelvis",
        "En el tórax"
      ],
      "respuesta": "A cada lado de la columna, atrás en el abdomen",
      "explicacion": "Están protegidos por las últimas costillas."
    },
    {
      "pregunta": "¿Cuál es el orden correcto del recorrido de la orina?",
      "opciones": [
        "Vejiga, riñón, uréter, uretra",
        "Riñón, uréter, vejiga, uretra",
        "Riñón, vejiga, uréter, uretra",
        "Uretra, vejiga, uréter, riñón"
      ],
      "respuesta": "Riñón, uréter, vejiga, uretra",
      "explicacion": "Se forma en el riñón, baja por el uréter, se almacena en la vejiga y sale por la uretra."
    }
  ]
}$anatomia$::jsonb,
  5,
  true),

('anatomia-clase-neurona-y-sinapsis', 'La neurona y la sinapsis',
  'Las partes de una neurona, cómo viaja el impulso nervioso, qué pasa en la sinapsis y la diferencia entre neurona y nervio.',
  'anatomia',
  $anatomia${
  "pasos": [
    "El tejido nervioso está formado por neuronas, las células que transmiten señales, y por células de la glía, que las sostienen, las protegen y las nutren.",
    "Una neurona tiene un cuerpo celular (soma), con el núcleo; dendritas, ramificaciones que reciben señales; y un axón, una prolongación larga que las conduce hacia otras células y termina en los botones terminales. Muchos axones están cubiertos de mielina, una capa aislante que acelera el impulso.",
    "El impulso nervioso es una señal eléctrica (potencial de acción) que viaja por el axón. En la sinapsis, el espacio entre dos neuronas (o entre una neurona y un músculo), la señal pasa de forma química: el axón libera neurotransmisores, como la acetilcolina, que se unen a receptores de la célula siguiente.",
    "Por su función, las neuronas son sensitivas o aferentes (llevan la información desde los receptores hacia el sistema nervioso central), motoras o eferentes (llevan órdenes a los músculos y las glándulas) e interneuronas (conectan neuronas dentro del sistema nervioso central).",
    "Un nervio es un haz de axones envueltos en tejido conectivo que sale del sistema nervioso central: por eso es «periférico». Puede ser sensitivo, motor o mixto.",
    "Errores comunes: confundir neurona con nervio (el nervio es un conjunto de axones de muchas neuronas); creer que las neuronas se tocan directamente (hay un espacio, la sinapsis) y pensar que el impulso es una corriente eléctrica como la de un cable (es un cambio de cargas a través de la membrana)."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 1,
      "titulo": "Partes de una neurona",
      "grupos": [
        {
          "nombre": "Recibe",
          "items": [
            {
              "texto": "Dendritas",
              "detalle": "ramificaciones que reciben señales"
            }
          ]
        },
        {
          "nombre": "Integra",
          "items": [
            {
              "texto": "Cuerpo celular (soma)",
              "detalle": "contiene el núcleo"
            }
          ]
        },
        {
          "nombre": "Conduce",
          "items": [
            {
              "texto": "Axón",
              "detalle": "prolongación larga; a menudo con mielina"
            }
          ]
        },
        {
          "nombre": "Transmite",
          "items": [
            {
              "texto": "Botones terminales",
              "detalle": "liberan neurotransmisores"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.flujo",
      "despuesDePaso": 2,
      "titulo": "Camino del impulso nervioso",
      "etapas": [
        {
          "titulo": "Dendritas",
          "detalle": "reciben la señal de otras neuronas"
        },
        {
          "titulo": "Cuerpo celular (soma)",
          "detalle": "integra las señales recibidas"
        },
        {
          "titulo": "Axón",
          "detalle": "conduce el impulso eléctrico"
        },
        {
          "titulo": "Botones terminales",
          "detalle": "liberan neurotransmisores"
        },
        {
          "titulo": "Sinapsis",
          "detalle": "el neurotransmisor cruza el espacio entre las dos neuronas"
        },
        {
          "titulo": "Célula siguiente",
          "detalle": "otra neurona, un músculo o una glándula"
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Tres tipos de neurona",
      "grupos": [
        {
          "nombre": "Sensitivas (aferentes)",
          "items": [
            {
              "texto": "Llevan información al SNC"
            }
          ]
        },
        {
          "nombre": "Motoras (eferentes)",
          "items": [
            {
              "texto": "Llevan órdenes a músculos y glándulas"
            }
          ]
        },
        {
          "nombre": "Interneuronas",
          "items": [
            {
              "texto": "Conectan neuronas dentro del SNC"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué parte de la neurona recibe las señales de otras células?",
      "opciones": [
        "Las dendritas",
        "El axón",
        "La mielina",
        "Los botones terminales"
      ],
      "respuesta": "Las dendritas",
      "explicacion": "Las dendritas son ramificaciones que reciben señales; el axón las conduce hacia otras células."
    },
    {
      "pregunta": "¿Qué es la sinapsis?",
      "opciones": [
        "Un tipo de neurona",
        "El espacio de comunicación entre dos células nerviosas (o con un músculo)",
        "La capa aislante del axón",
        "El líquido que rodea el encéfalo"
      ],
      "respuesta": "El espacio de comunicación entre dos células nerviosas (o con un músculo)",
      "explicacion": "En la sinapsis la señal pasa de forma química, con neurotransmisores."
    },
    {
      "pregunta": "¿Qué acelera el impulso nervioso a lo largo del axón?",
      "opciones": [
        "La mielina",
        "El soma",
        "La glía",
        "El calcio óseo"
      ],
      "respuesta": "La mielina",
      "explicacion": "Es una capa aislante que rodea muchos axones."
    },
    {
      "pregunta": "¿Qué neurona lleva la información desde un receptor hacia el sistema nervioso central?",
      "opciones": [
        "Motora (eferente)",
        "Sensitiva (aferente)",
        "Interneurona",
        "Ninguna"
      ],
      "respuesta": "Sensitiva (aferente)",
      "explicacion": "Aferente = llega al SNC; eferente = sale."
    },
    {
      "pregunta": "¿Qué es un nervio?",
      "opciones": [
        "Una sola neurona muy larga",
        "Un haz de axones envueltos en tejido conectivo",
        "Una parte del cerebro",
        "Un tipo de músculo"
      ],
      "respuesta": "Un haz de axones envueltos en tejido conectivo",
      "explicacion": "Un nervio reúne los axones de muchas neuronas."
    }
  ]
}$anatomia$::jsonb,
  1,
  true),

('anatomia-clase-snc-y-snp', 'Sistema nervioso central y periférico',
  'Las dos grandes divisiones del sistema nervioso, cómo se protege el central, los 12 pares craneales, los 31 pares espinales y la división somática y autónoma del periférico.',
  'anatomia',
  $anatomia${
  "pasos": [
    "El sistema nervioso se divide en dos: el sistema nervioso central (SNC), formado por el encéfalo y la médula espinal, y el sistema nervioso periférico (SNP), formado por los nervios y ganglios que salen de ellos hacia el resto del cuerpo.",
    "El SNC está protegido por hueso (el cráneo y la columna vertebral), por tres capas de membranas llamadas meninges (duramadre, aracnoides y piamadre) y por el líquido cefalorraquídeo, que amortigua.",
    "El encéfalo incluye el cerebro, el cerebelo y el tronco encefálico. El cerebro es la parte más grande; el cerebelo coordina el equilibrio y el movimiento; el tronco encefálico conecta el encéfalo con la médula y controla funciones vitales. La médula espinal recorre el conducto vertebral.",
    "El SNP tiene 12 pares de nervios craneales (salen del encéfalo) y 31 pares de nervios espinales (salen de la médula: 8 cervicales, 12 torácicos, 5 lumbares, 5 sacros y 1 coccígeo).",
    "Según lo que controla, el SNP se divide en somático (movimientos voluntarios y sensibilidad consciente) y autónomo (funciones involuntarias: latidos, digestión, glándulas).",
    "Errores comunes: creer que los nervios craneales y espinales son parte del SNC (son periféricos, aunque nazcan en el SNC); creer que el cerebro es todo el sistema nervioso y pensar que hay 7 pares de nervios cervicales por haber 7 vértebras cervicales (son 8 pares)."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 2,
      "titulo": "Central y periférico",
      "grupos": [
        {
          "nombre": "SNC (dentro del hueso)",
          "items": [
            {
              "texto": "Cerebro",
              "detalle": "la parte más grande del encéfalo"
            },
            {
              "texto": "Cerebelo",
              "detalle": "equilibrio y coordinación"
            },
            {
              "texto": "Médula espinal",
              "detalle": "en el conducto vertebral"
            }
          ]
        },
        {
          "nombre": "SNP (lo que sale)",
          "items": [
            {
              "texto": "Nervio periférico",
              "detalle": "12 pares craneales y 31 espinales"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "31 pares de nervios espinales",
      "grupos": [
        {
          "nombre": "Cervicales",
          "items": [
            {
              "texto": "8 pares"
            }
          ]
        },
        {
          "nombre": "Torácicos",
          "items": [
            {
              "texto": "12 pares"
            }
          ]
        },
        {
          "nombre": "Lumbares",
          "items": [
            {
              "texto": "5 pares"
            }
          ]
        },
        {
          "nombre": "Sacros y coccígeo",
          "items": [
            {
              "texto": "5 pares sacros"
            },
            {
              "texto": "1 par coccígeo"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántas capas tienen las meninges?",
      "opciones": [
        "2",
        "3",
        "4",
        "5"
      ],
      "respuesta": "3",
      "explicacion": "Duramadre, aracnoides y piamadre."
    },
    {
      "pregunta": "¿Cuántos pares de nervios espinales hay?",
      "opciones": [
        "12",
        "31",
        "24",
        "8"
      ],
      "respuesta": "31",
      "explicacion": "8 cervicales, 12 torácicos, 5 lumbares, 5 sacros y 1 coccígeo."
    },
    {
      "pregunta": "¿Cuál de estas estructuras es parte del sistema nervioso central?",
      "opciones": [
        "Nervio periférico",
        "Médula espinal",
        "Nervio craneal",
        "Ganglio"
      ],
      "respuesta": "Médula espinal",
      "explicacion": "El SNC es el encéfalo más la médula espinal; los nervios son periféricos."
    },
    {
      "pregunta": "¿Qué parte del encéfalo coordina el equilibrio y el movimiento?",
      "opciones": [
        "Cerebelo",
        "Cerebro",
        "Meninges",
        "Médula espinal"
      ],
      "respuesta": "Cerebelo",
      "explicacion": "El cerebelo afina y coordina los movimientos."
    },
    {
      "pregunta": "¿Qué parte del sistema nervioso periférico controla las funciones involuntarias?",
      "opciones": [
        "Somática",
        "Autónoma",
        "Craneal",
        "Cerebelosa"
      ],
      "respuesta": "Autónoma",
      "explicacion": "El sistema autónomo regula los latidos, la digestión y las glándulas."
    }
  ]
}$anatomia$::jsonb,
  2,
  true),

('anatomia-clase-encefalo', 'El encéfalo: cerebro, cerebelo y tronco encefálico',
  'Las partes del encéfalo, los cuatro lóbulos del cerebro y sus funciones, el diencéfalo, el cerebelo y el tronco encefálico, de donde salen la mayoría de los pares craneales.',
  'anatomia',
  $anatomia${
  "pasos": [
    "El encéfalo pesa alrededor de 1,4 kg en un adulto y tiene tres partes principales: el cerebro, el cerebelo y el tronco encefálico. Está dentro de la cavidad craneal.",
    "El cerebro se divide en dos hemisferios, derecho e izquierdo, unidos por el cuerpo calloso. Su superficie, la corteza cerebral, está plegada en circunvoluciones, lo que aumenta su superficie. Cada hemisferio tiene cuatro lóbulos.",
    "Lóbulos: el frontal (movimiento voluntario, planificación y lenguaje hablado), el parietal (sensibilidad del tacto, la presión y la posición del cuerpo), el temporal (audición y memoria) y el occipital (visión).",
    "Bajo la corteza está el diencéfalo, con el tálamo (retransmite las señales sensoriales) y el hipotálamo (regula la temperatura, el hambre, la sed y el sueño).",
    "El cerebelo está en la parte de atrás y de abajo, bajo el lóbulo occipital. Coordina el movimiento, el equilibrio y la postura: no inicia el movimiento, lo afina.",
    "El tronco encefálico (mesencéfalo, puente y bulbo raquídeo) conecta el encéfalo con la médula espinal y controla funciones vitales como la respiración y el ritmo cardíaco. De él salen los pares craneales III a XII (el XI recibe además fibras de la médula cervical); solo el I y el II nacen más arriba.",
    "Errores comunes: decir «cerebro» para todo el encéfalo; pensar que el cerebelo está delante o que «piensa» (coordina) y creer que usamos «solo el 10 %» del cerebro: es un mito, se usa en su conjunto."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 2,
      "titulo": "Cuatro lóbulos",
      "grupos": [
        {
          "nombre": "Frontal",
          "items": [
            {
              "texto": "Movimiento voluntario, planificación y lenguaje"
            }
          ]
        },
        {
          "nombre": "Parietal",
          "items": [
            {
              "texto": "Tacto, presión y posición del cuerpo"
            }
          ]
        },
        {
          "nombre": "Temporal",
          "items": [
            {
              "texto": "Audición y memoria"
            }
          ]
        },
        {
          "nombre": "Occipital",
          "items": [
            {
              "texto": "Visión"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 5,
      "titulo": "Tres partes del encéfalo",
      "grupos": [
        {
          "nombre": "Cerebro",
          "items": [
            {
              "texto": "Pensamiento, movimiento voluntario y sentidos"
            }
          ]
        },
        {
          "nombre": "Cerebelo",
          "items": [
            {
              "texto": "Coordinación, equilibrio y postura"
            }
          ]
        },
        {
          "nombre": "Tronco encefálico",
          "items": [
            {
              "texto": "Respiración y ritmo cardíaco; salen los pares III a XII"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué lóbulo del cerebro se encarga principalmente de la visión?",
      "opciones": [
        "Frontal",
        "Parietal",
        "Occipital",
        "Temporal"
      ],
      "respuesta": "Occipital",
      "explicacion": "El lóbulo occipital, en la parte de atrás, procesa la información visual."
    },
    {
      "pregunta": "¿Qué estructura une los dos hemisferios cerebrales?",
      "opciones": [
        "El cuerpo calloso",
        "El tálamo",
        "El bulbo raquídeo",
        "El cerebelo"
      ],
      "respuesta": "El cuerpo calloso",
      "explicacion": "Es un haz de fibras que conecta el hemisferio derecho con el izquierdo."
    },
    {
      "pregunta": "¿Qué parte del encéfalo coordina el equilibrio y la postura?",
      "opciones": [
        "Cerebelo",
        "Corteza frontal",
        "Hipotálamo",
        "Cuerpo calloso"
      ],
      "respuesta": "Cerebelo",
      "explicacion": "Está bajo el occipital y afina los movimientos."
    },
    {
      "pregunta": "¿Qué funciones vitales controla el tronco encefálico?",
      "opciones": [
        "El lenguaje y la memoria",
        "La respiración y el ritmo cardíaco",
        "El tacto y la visión",
        "El equilibrio solamente"
      ],
      "respuesta": "La respiración y el ritmo cardíaco",
      "explicacion": "Por eso es tan importante: conecta además el encéfalo con la médula."
    },
    {
      "pregunta": "¿De qué parte del encéfalo salen la mayoría de los pares craneales (III a XII)?",
      "opciones": [
        "Del cerebelo",
        "Del tronco encefálico",
        "Del lóbulo frontal",
        "Del cuerpo calloso"
      ],
      "respuesta": "Del tronco encefálico",
      "explicacion": "Solo el I (olfatorio) y el II (óptico) nacen más arriba."
    }
  ]
}$anatomia$::jsonb,
  3,
  true),

('anatomia-clase-medula-y-reflejos', 'La médula espinal y los reflejos',
  'La médula espinal: dónde está, sustancia gris y blanca, raíces dorsal y ventral, y cómo funciona un arco reflejo.',
  'anatomia',
  $anatomia${
  "pasos": [
    "La médula espinal es un cordón de tejido nervioso de unos 45 cm que recorre el conducto vertebral. Empieza en el bulbo raquídeo y, en el adulto, termina a la altura de las vértebras L1-L2; más abajo, los nervios continúan como un manojo llamado cola de caballo.",
    "En un corte se ve una zona interior en forma de mariposa (o de H), la sustancia gris, con cuerpos de neuronas, rodeada de sustancia blanca: axones con mielina que forman las vías que suben al encéfalo y bajan de él.",
    "De la médula salen 31 pares de nervios espinales. Cada uno se forma con dos raíces: la raíz dorsal (posterior), que trae la información sensitiva, y la raíz ventral (anterior), que lleva las órdenes motoras. Fuera de la médula se unen en un nervio mixto.",
    "Un reflejo es una respuesta rápida e involuntaria cuya señal se procesa en la médula sin esperar al cerebro. El arco reflejo tiene cinco partes: receptor, neurona sensitiva, centro integrador (la médula), neurona motora y efector. Ejemplo: el reflejo rotuliano, en el que un golpe suave en el tendón bajo la rótula hace que la pierna se extienda sola.",
    "Además de los reflejos, la médula es una vía de comunicación: las señales sensitivas suben al encéfalo y las órdenes voluntarias bajan a los músculos. El nivel de la médula por el que sale cada nervio determina qué zona del cuerpo controla.",
    "Errores comunes: creer que la médula llega hasta el final de la columna (termina hacia L1-L2); creer que todos los reflejos pasan por el cerebro y creer que un nervio espinal es solo sensitivo o solo motor (es mixto)."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 2,
      "titulo": "Cómo se forma un nervio espinal",
      "grupos": [
        {
          "nombre": "Raíz dorsal (posterior)",
          "items": [
            {
              "texto": "Sensitiva",
              "detalle": "entra a la médula"
            }
          ]
        },
        {
          "nombre": "Raíz ventral (anterior)",
          "items": [
            {
              "texto": "Motora",
              "detalle": "sale de la médula"
            }
          ]
        },
        {
          "nombre": "Nervio espinal",
          "items": [
            {
              "texto": "Mixto",
              "detalle": "une las dos raíces"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.flujo",
      "despuesDePaso": 3,
      "titulo": "Arco reflejo",
      "etapas": [
        {
          "titulo": "Estímulo",
          "detalle": "por ejemplo, tocar algo muy caliente"
        },
        {
          "titulo": "Receptor",
          "detalle": "capta el estímulo (terminaciones nerviosas de la piel)"
        },
        {
          "titulo": "Neurona sensitiva (aferente)",
          "detalle": "lleva la señal hacia la médula espinal"
        },
        {
          "titulo": "Centro integrador",
          "detalle": "en la médula espinal: la señal pasa a la neurona motora"
        },
        {
          "titulo": "Neurona motora (eferente)",
          "detalle": "lleva la orden desde la médula hasta el músculo"
        },
        {
          "titulo": "Efector",
          "detalle": "el músculo se contrae y retira la mano"
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Por qué raíz entra la información sensitiva a la médula?",
      "opciones": [
        "Ventral",
        "Dorsal",
        "Ninguna, entra por el cerebro",
        "Por las dos"
      ],
      "respuesta": "Dorsal",
      "explicacion": "La raíz dorsal es sensitiva; la ventral, motora."
    },
    {
      "pregunta": "¿Qué contiene la sustancia gris de la médula?",
      "opciones": [
        "Cuerpos de neuronas",
        "Solo mielina",
        "Hueso",
        "Líquido cefalorraquídeo"
      ],
      "respuesta": "Cuerpos de neuronas",
      "explicacion": "La sustancia blanca está formada por axones con mielina."
    },
    {
      "pregunta": "¿Cuántos pares de nervios espinales salen de la médula?",
      "opciones": [
        "12",
        "24",
        "31",
        "33"
      ],
      "respuesta": "31",
      "explicacion": "8 + 12 + 5 + 5 + 1 = 31."
    },
    {
      "pregunta": "¿Dónde se procesa un reflejo simple?",
      "opciones": [
        "En la médula espinal",
        "En el lóbulo occipital",
        "En el cerebelo",
        "En el receptor"
      ],
      "respuesta": "En la médula espinal",
      "explicacion": "Por eso es más rápido: no espera al cerebro."
    },
    {
      "pregunta": "¿A qué altura termina la médula espinal en el adulto?",
      "opciones": [
        "Al final del sacro",
        "En L1-L2",
        "En C1",
        "En T1"
      ],
      "respuesta": "En L1-L2",
      "explicacion": "Más abajo solo hay nervios (la cola de caballo)."
    }
  ]
}$anatomia$::jsonb,
  4,
  true),

('anatomia-clase-pares-craneales', 'Los 12 pares craneales',
  'Cada par craneal con su número, su nombre, su función y su tipo (sensitivo, motor o mixto): olfatorio, óptico, oculomotor, troclear, trigémino, abducens, facial, vestibulococlear, glosofaríngeo, vago, accesorio e hipogloso.',
  'anatomia',
  $anatomia${
  "pasos": [
    "Los pares craneales son 12 pares de nervios que salen directamente del encéfalo, sobre todo del tronco encefálico, y pasan por agujeros del cráneo. Se nombran con números romanos, de adelante hacia atrás. Cada uno puede ser sensitivo, motor o mixto.",
    "Sensitivos: I olfatorio (olfato), II óptico (visión) y VIII vestibulococlear (audición y equilibrio).",
    "Motores: III oculomotor (mueve el ojo y sube el párpado; cierra la pupila), IV troclear (mueve el ojo), VI abducens (lleva el ojo hacia afuera), XI accesorio (mueve el trapecio y el esternocleidomastoideo) y XII hipogloso (mueve la lengua).",
    "Mixtos: V trigémino (sensibilidad de la cara y músculos de la masticación), VII facial (expresión facial, gusto de la parte anterior de la lengua, lágrimas y saliva), IX glosofaríngeo (gusto de la parte posterior de la lengua y deglución) y X vago (corazón, pulmones y aparato digestivo; voz y deglución).",
    "Los ojos usan cuatro pares: el II para ver y el III, IV y VI para moverlos. La lengua usa tres: el VII y el IX para el gusto y el XII para moverse. El vago es el más largo: llega hasta el abdomen.",
    "Simplificación de nivel colegio: la clasificación en sensitivo, motor y mixto es la clásica; además, algunos pares llevan fibras del sistema autónomo (III, VII, IX y X) y el XI se describe de distinta forma según el texto. Errores comunes: confundir el abducens con el accesorio y creer que el nervio óptico mueve el ojo (solo lleva la visión)."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Los 12 pares, por función",
      "grupos": [
        {
          "nombre": "Sensitivos: solo llevan información al encéfalo",
          "items": [
            {
              "texto": "Olfatorio",
              "marca": "I",
              "detalle": "olfato"
            },
            {
              "texto": "Óptico",
              "marca": "II",
              "detalle": "visión"
            },
            {
              "texto": "Vestibulococlear",
              "marca": "VIII",
              "detalle": "audición y equilibrio"
            }
          ]
        },
        {
          "nombre": "Motores: solo llevan órdenes a un músculo",
          "items": [
            {
              "texto": "Oculomotor",
              "marca": "III",
              "detalle": "mueve el ojo y sube el párpado; cierra la pupila"
            },
            {
              "texto": "Troclear",
              "marca": "IV",
              "detalle": "mueve el ojo (músculo oblicuo superior)"
            },
            {
              "texto": "Abducens",
              "marca": "VI",
              "detalle": "lleva el ojo hacia afuera"
            },
            {
              "texto": "Accesorio",
              "marca": "XI",
              "detalle": "mueve el trapecio y el esternocleidomastoideo"
            },
            {
              "texto": "Hipogloso",
              "marca": "XII",
              "detalle": "mueve la lengua"
            }
          ]
        },
        {
          "nombre": "Mixtos: hacen las dos cosas",
          "items": [
            {
              "texto": "Trigémino",
              "marca": "V",
              "detalle": "sensibilidad de la cara; mueve los músculos de la masticación"
            },
            {
              "texto": "Facial",
              "marca": "VII",
              "detalle": "músculos de la expresión facial; gusto de la parte anterior de la lengua; lágrimas y saliva"
            },
            {
              "texto": "Glosofaríngeo",
              "marca": "IX",
              "detalle": "gusto de la parte posterior de la lengua; deglución"
            },
            {
              "texto": "Vago",
              "marca": "X",
              "detalle": "corazón, pulmones y aparato digestivo; voz y deglución"
            }
          ]
        }
      ]
    },
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 4,
      "titulo": "Ojos y lengua",
      "grupos": [
        {
          "nombre": "Ojos",
          "items": [
            {
              "texto": "Óptico",
              "marca": "II",
              "detalle": "ver"
            },
            {
              "texto": "Oculomotor",
              "marca": "III",
              "detalle": "mover"
            },
            {
              "texto": "Troclear",
              "marca": "IV",
              "detalle": "mover"
            },
            {
              "texto": "Abducens",
              "marca": "VI",
              "detalle": "mover"
            }
          ]
        },
        {
          "nombre": "Lengua",
          "items": [
            {
              "texto": "Facial",
              "marca": "VII",
              "detalle": "gusto (parte anterior)"
            },
            {
              "texto": "Glosofaríngeo",
              "marca": "IX",
              "detalle": "gusto (parte posterior)"
            },
            {
              "texto": "Hipogloso",
              "marca": "XII",
              "detalle": "movimiento"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué nervio craneal lleva la información de la visión?",
      "opciones": [
        "Óptico (II)",
        "Oculomotor (III)",
        "Trigémino (V)",
        "Vago (X)"
      ],
      "respuesta": "Óptico (II)",
      "explicacion": "El óptico es sensitivo; el oculomotor solo mueve el ojo."
    },
    {
      "pregunta": "¿Qué par craneal es el motor de la lengua?",
      "opciones": [
        "Facial (VII)",
        "Glosofaríngeo (IX)",
        "Hipogloso (XII)",
        "Vago (X)"
      ],
      "respuesta": "Hipogloso (XII)",
      "explicacion": "Hipogloso: «debajo de la lengua»; la mueve."
    },
    {
      "pregunta": "¿Qué par mixto lleva la sensibilidad de la cara y mueve los músculos de la masticación?",
      "opciones": [
        "Trigémino (V)",
        "Facial (VII)",
        "Accesorio (XI)",
        "Abducens (VI)"
      ],
      "respuesta": "Trigémino (V)",
      "explicacion": "Tiene tres ramas: oftálmica, maxilar y mandibular."
    },
    {
      "pregunta": "¿Qué par lleva el ojo hacia afuera?",
      "opciones": [
        "Troclear (IV)",
        "Oculomotor (III)",
        "Abducens (VI)",
        "Óptico (II)"
      ],
      "respuesta": "Abducens (VI)",
      "explicacion": "Abducir es alejar del centro: mueve el ojo hacia afuera."
    },
    {
      "pregunta": "¿Cuántos pares craneales son sensitivos (según la clasificación clásica)?",
      "opciones": [
        "3",
        "4",
        "5",
        "12"
      ],
      "respuesta": "3",
      "explicacion": "Olfatorio (I), óptico (II) y vestibulococlear (VIII)."
    }
  ]
}$anatomia$::jsonb,
  5,
  true),

('anatomia-clase-sistema-autonomo', 'El sistema nervioso autónomo: simpático y parasimpático',
  'Qué controla el sistema autónomo y cómo se reparten el trabajo sus dos divisiones: la simpática («lucha o huida») y la parasimpática («reposo y digestión»).',
  'anatomia',
  $anatomia${
  "pasos": [
    "El sistema nervioso autónomo controla funciones involuntarias: los latidos, la respiración, la digestión, el tamaño de la pupila y las glándulas. Actúa sobre músculo liso, músculo cardíaco y glándulas, y forma parte del sistema nervioso periférico.",
    "Tiene dos divisiones que suelen actuar de forma opuesta: la simpática y la parasimpática.",
    "La simpática es la de «lucha o huida»: prepara al cuerpo para la acción. Aumenta la frecuencia cardíaca, dilata las pupilas y los bronquios y reduce la actividad digestiva. Su neurotransmisor principal en los órganos es la noradrenalina. Sus nervios salen de la médula torácica y de la lumbar alta.",
    "La parasimpática es la de «reposo y digestión»: ahorra energía. Disminuye la frecuencia cardíaca, contrae las pupilas y estimula la digestión. Su neurotransmisor es la acetilcolina. Sus fibras salen del tronco encefálico (con los pares craneales III, VII, IX y X) y de la médula sacra. El nervio vago (X) es el gran nervio parasimpático: llega al corazón, los pulmones y el aparato digestivo.",
    "La mayoría de los órganos reciben las dos divisiones y su actividad resulta de un equilibrio, como los pares de músculos agonista y antagonista. Simplificación: hay excepciones, y existe además un sistema nervioso entérico propio del intestino.",
    "Errores comunes: creer que el sistema autónomo es un sistema aparte del sistema nervioso (es parte del periférico); creer que la simpática solo actúa ante el miedo (siempre tiene cierta actividad) y confundir simpático con parasimpático."
  ],
  "visuales": [
    {
      "tipo": "anatomia.grupos",
      "despuesDePaso": 3,
      "titulo": "Dos divisiones, efectos opuestos",
      "grupos": [
        {
          "nombre": "Simpático: lucha o huida",
          "items": [
            {
              "texto": "Corazón",
              "detalle": "acelera los latidos"
            },
            {
              "texto": "Pupilas",
              "detalle": "las dilata"
            },
            {
              "texto": "Bronquios",
              "detalle": "los dilata"
            },
            {
              "texto": "Digestión",
              "detalle": "la reduce"
            }
          ]
        },
        {
          "nombre": "Parasimpático: reposo y digestión",
          "items": [
            {
              "texto": "Corazón",
              "detalle": "disminuye los latidos"
            },
            {
              "texto": "Pupilas",
              "detalle": "las contrae"
            },
            {
              "texto": "Digestión",
              "detalle": "la estimula"
            },
            {
              "texto": "Nervio vago (X)",
              "detalle": "el principal nervio parasimpático"
            }
          ]
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué división del sistema autónomo prepara al cuerpo para «lucha o huida»?",
      "opciones": [
        "Parasimpática",
        "Simpática",
        "Somática",
        "Entérica"
      ],
      "respuesta": "Simpática",
      "explicacion": "Acelera el corazón, dilata las pupilas y reduce la digestión."
    },
    {
      "pregunta": "¿Qué efecto tiene la parasimpática sobre la frecuencia cardíaca?",
      "opciones": [
        "La aumenta",
        "La disminuye",
        "No tiene efecto",
        "La detiene"
      ],
      "respuesta": "La disminuye",
      "explicacion": "Es la división de «reposo y digestión»."
    },
    {
      "pregunta": "¿Cuál es el principal nervio craneal parasimpático?",
      "opciones": [
        "Vago (X)",
        "Óptico (II)",
        "Hipogloso (XII)",
        "Trigémino (V)"
      ],
      "respuesta": "Vago (X)",
      "explicacion": "Llega al corazón, los pulmones y el aparato digestivo."
    },
    {
      "pregunta": "¿Qué hace la simpática con las pupilas?",
      "opciones": [
        "Las contrae",
        "Las dilata",
        "Las cierra",
        "No las controla"
      ],
      "respuesta": "Las dilata",
      "explicacion": "La parasimpática, en cambio, las contrae."
    },
    {
      "pregunta": "¿Qué controla el sistema nervioso autónomo?",
      "opciones": [
        "Los movimientos voluntarios",
        "Las funciones involuntarias",
        "Solo la visión",
        "Solo el equilibrio"
      ],
      "respuesta": "Las funciones involuntarias",
      "explicacion": "Latidos, digestión, tamaño de la pupila y glándulas."
    }
  ]
}$anatomia$::jsonb,
  6,
  true);
