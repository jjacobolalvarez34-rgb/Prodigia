-- ============================================================
-- Prodigia — Trigonometría: rediseño del mundo, fase 1 (Aprender pasa a
-- Técnicas | Clases con 6 bloques en orden de colegio; docs/PARIDAD_MUNDOS.md
-- filas 22/23 y la sección "Trigonometría: rediseño del mundo (fase 1)").
--
-- Antes: 5 Técnicas mnemotécnicas (0108 + quiz de 0177 + fix de 0180), sin
-- Clases y sin visuales, con voseo rioplatense. Ahora:
--   - las 5 Técnicas existentes se REESCRIBEN por slug: español neutro, precisiones
--     matemáticas, quiz revisado y visuales (los ids de las filas no cambian, así
--     que el progreso de quien ya las completó se conserva);
--   - Técnicas nuevas por bloque (razones, círculo, gráficas, leyes, identidades y
--     ecuaciones);
--   - Clases nuevas: un curso lineal de 27 lecciones, de los lados del triángulo
--     rectángulo a las ecuaciones trigonométricas.
--
-- Los bloques 3 (gráficas y periodo) y 6 (ecuaciones) se enseñan acá pero todavía
-- no tienen modo de práctica: es la fase 2 (skill_levels, duelos, reto diario,
-- nivel de mundo y logros). Esta migración NO toca skill_levels.
--
-- Todo dato matemático sale de funciones puras con tests (src/lib/trigonometria/
-- {exactos,triangulos,ondas,ecuaciones,identidades}.ts): valores exactos
-- contrastados con Math.* y una tabla curada, triángulos resueltos con métodos
-- independientes, ondas con la función evaluada, ecuaciones verificadas por
-- sustitución y con barrido de soluciones, identidades evaluadas en decenas de
-- ángulos. Las lecciones traen `contenido.visuales` con los visuales
-- "trigonometria.*" y el primitivo genérico "cuadros".
--
-- Efecto conocido: agregar filas `techniques` cambia el total de lecciones del
-- nivel de mundo (registrar_puntos_mundo) para quien no tenga Pro: las Clases
-- cuentan en el total pero el plan gratuito no puede completarlas (mismo caso
-- documentado para Calculia en PARIDAD_MUNDOS.md). Se deja así a propósito.
--
-- Técnicas: 25 en total (razones 5, circulo 5, graficas 5, leyes 3, identidades 4, ecuaciones 3): 5 ya existían (se ACTUALIZAN) y 20 son nuevas.
-- Clases: 27 (razones 7, circulo 4, graficas 7, leyes 4, identidades 3, ecuaciones 2), requiere_pro = true.
--
-- Este archivo se GENERA desde src/lib/trigonometria/lecciones/ (fuente única) y
-- lecciones.test.ts comprueba que coincida. No editar a mano.
-- Regenerar: TRIGONOMETRIA_ESCRIBIR_SQL=1 npx vitest run src/lib/trigonometria/lecciones
-- ============================================================

-- 1) Técnicas que ya existían: se actualizan por slug (español neutro, quiz corregido, visuales, bloque y orden).

update public.techniques
set nombre = 'SOH-CAH-TOA: opuesto y adyacente dependen del ángulo',
  descripcion = 'Un acrónimo para no dudar nunca qué lado va arriba y cuál abajo, y la clave de por qué «opuesto» y «adyacente» cambian con el ángulo.',
  contenido = $trigonometria${
  "pasos": [
    "SOH-CAH-TOA: Seno = Opuesto / Hipotenusa, Coseno = Adyacente / Hipotenusa, Tangente = Opuesto / Adyacente.",
    "Primero ubica la hipotenusa: es el lado frente al ángulo recto y el más largo. Los otros dos lados son el opuesto o el adyacente según el ángulo que te pidan.",
    "El cateto opuesto es el que NO toca el ángulo que te interesa; el adyacente es el que sí lo toca (sin ser la hipotenusa). Si cambias de ángulo, el opuesto y el adyacente se intercambian; la hipotenusa nunca cambia.",
    "Dilo en voz alta un par de veces: la mayoría lo recuerda por el ritmo de la frase, no por el significado de cada letra."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.triangulo",
      "despuesDePaso": 2,
      "titulo": "El mismo triángulo, visto desde el ángulo $A$",
      "catetos": [
        3,
        4
      ],
      "vertice": "A",
      "pasos": [
        "hipotenusa",
        "opuesto",
        "adyacente",
        "sen",
        "cos",
        "tan"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "Según SOH-CAH-TOA, ¿qué razón trigonométrica es opuesto dividido entre adyacente?",
      "opciones": [
        "La tangente",
        "El seno",
        "El coseno",
        "La cosecante"
      ],
      "respuesta": "La tangente",
      "explicacion": "TOA: Tangente = Opuesto / Adyacente. El seno usa la hipotenusa abajo (SOH) y el coseno también (CAH)."
    },
    {
      "pregunta": "En un triángulo de catetos 3 y 4 e hipotenusa 5, con el cateto de 3 frente al ángulo $A$, ¿cuánto vale $\\cos(A)$?",
      "opciones": [
        "$\\dfrac{3}{5}$",
        "$\\dfrac{4}{5}$",
        "$\\dfrac{3}{4}$",
        "$\\dfrac{5}{4}$"
      ],
      "respuesta": "$\\dfrac{4}{5}$",
      "explicacion": "CAH: Coseno = Adyacente / Hipotenusa. El adyacente a $A$ es 4 y la hipotenusa 5. $\\frac{3}{5}$ es el seno y $\\frac{3}{4}$ la tangente."
    },
    {
      "pregunta": "Si pasas del ángulo $A$ al otro ángulo agudo del mismo triángulo, ¿qué cambia?",
      "opciones": [
        "Se intercambian el cateto opuesto y el adyacente",
        "Cambia la hipotenusa",
        "Nada: los tres lados conservan su nombre",
        "Solo cambia el ángulo recto"
      ],
      "respuesta": "Se intercambian el cateto opuesto y el adyacente",
      "explicacion": "Opuesto y adyacente se nombran respecto de un ángulo. Al cambiar de ángulo se intercambian; la hipotenusa siempre es el lado frente al ángulo recto."
    },
    {
      "pregunta": "¿Cuál es el cateto adyacente a un ángulo agudo?",
      "opciones": [
        "El cateto que toca al ángulo",
        "El lado más largo",
        "El cateto que está frente al ángulo",
        "El lado horizontal del dibujo"
      ],
      "respuesta": "El cateto que toca al ángulo",
      "explicacion": "El adyacente es el cateto que forma el ángulo con la hipotenusa. El lado más largo es la hipotenusa y el que está frente al ángulo es el opuesto."
    }
  ]
}$trigonometria$::jsonb,
  orden = 1,
  requiere_pro = false
where slug = 'trigonometria-sohcahtoa' and problem_type = 'trigonometria';

update public.techniques
set nombre = 'El truco de la mano para los valores notables',
  descripcion = 'Tu mano izquierda es una tabla del círculo unitario para el primer cuadrante: no hace falta memorizar nada suelto.',
  contenido = $trigonometria${
  "pasos": [
    "Los cinco ángulos notables (0°, 30°, 45°, 60°, 90°) se asocian a los cinco dedos de una mano: pulgar = 0°, índice = 30°, medio = 45°, anular = 60°, meñique = 90°.",
    "Para el SENO: cuenta los dedos desde el pulgar (SIN contarlo) hasta el dedo elegido (SÍ contándolo); llama k a esa cantidad. sen(ángulo) = √k / 2.",
    "Para el COSENO: cuenta los dedos desde el dedo elegido (SIN contarlo) hasta el meñique (SÍ contándolo); llama m a esa cantidad. cos(ángulo) = √m / 2.",
    "Ejemplo con el anular (60°): del pulgar al anular, sin contar el pulgar, hay 3 dedos, así que sen(60°) = √3/2. Del anular al meñique, sin contar el anular, hay 1 dedo, así que cos(60°) = √1/2 = 1/2.",
    "Usa el dibujo: toca un dedo y mira cómo se pintan de azul los dedos que cuentan para el seno y de naranja los que cuentan para el coseno."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.mano",
      "despuesDePaso": 3
    }
  ],
  "quiz": [
    {
      "pregunta": "Usando el truco de la mano, ¿cuánto vale $\\operatorname{sen}(90^{\\circ})$ (dedo meñique)?",
      "opciones": [
        "$\\frac{\\sqrt{3}}{2}$",
        "$\\frac{1}{2}$",
        "$0$",
        "$1$"
      ],
      "respuesta": "$1$",
      "explicacion": "Del pulgar al meñique, sin contar el pulgar, hay 4 dedos: $\\frac{\\sqrt{4}}{2}=1$, el valor máximo posible del seno."
    },
    {
      "pregunta": "Usando el truco de la mano, ¿cuánto vale $\\cos(0^{\\circ})$ (dedo pulgar)?",
      "opciones": [
        "$0$",
        "$\\frac{1}{2}$",
        "$1$",
        "$\\frac{\\sqrt{2}}{2}$"
      ],
      "respuesta": "$1$",
      "explicacion": "Del pulgar (sin contarlo) al meñique hay 4 dedos: $\\frac{\\sqrt{4}}{2}=1$."
    },
    {
      "pregunta": "Con el dedo anular ($60^{\\circ}$), el truco da $\\operatorname{sen}(60^{\\circ})=\\frac{\\sqrt{3}}{2}$ y $\\cos(60^{\\circ})=\\frac{1}{2}$. ¿Cuál afirmación es correcta?",
      "opciones": [
        "$\\operatorname{sen}(60^{\\circ})$ es igual a $\\cos(60^{\\circ})$",
        "$\\operatorname{sen}(60^{\\circ})$ es mayor que $\\cos(60^{\\circ})$",
        "$\\cos(60^{\\circ})$ es mayor que $\\operatorname{sen}(60^{\\circ})$",
        "Ninguno de los dos se puede saber sin calculadora"
      ],
      "respuesta": "$\\operatorname{sen}(60^{\\circ})$ es mayor que $\\cos(60^{\\circ})$",
      "explicacion": "$\\frac{\\sqrt{3}}{2}\\approx 0{,}87$ es mayor que $\\frac{1}{2}$: a $60^{\\circ}$, más cerca de $90^{\\circ}$ que de $0^{\\circ}$, el seno ya domina."
    },
    {
      "pregunta": "¿Con qué dedo el seno vale $\\dfrac{\\sqrt{2}}{2}$?",
      "opciones": [
        "Con el índice ($30^{\\circ}$)",
        "Con el anular ($60^{\\circ}$)",
        "Con el meñique ($90^{\\circ}$)",
        "Con el medio ($45^{\\circ}$)"
      ],
      "respuesta": "Con el medio ($45^{\\circ}$)",
      "explicacion": "Del pulgar (sin contarlo) al medio hay 2 dedos: $\\operatorname{sen}(45^{\\circ})=\\frac{\\sqrt{2}}{2}$. El índice da $\\frac{\\sqrt{1}}{2}=\\frac{1}{2}$ y el anular $\\frac{\\sqrt{3}}{2}$."
    }
  ]
}$trigonometria$::jsonb,
  orden = 2,
  requiere_pro = false
where slug = 'trigonometria-truco-mano-circulo' and problem_type = 'trigonometria';

update public.techniques
set nombre = 'Simetría por cuadrante: ángulo de referencia y signos',
  descripcion = 'Con el primer cuadrante memorizado, los otros tres se derivan por simetría: solo cambia el signo.',
  contenido = $trigonometria${
  "pasos": [
    "El ángulo de referencia es la distancia al eje horizontal más cercano: cuadrante II = 180° − θ; cuadrante III = θ − 180°; cuadrante IV = 360° − θ.",
    "El VALOR (sin signo) es el mismo que el del ángulo de referencia en el primer cuadrante: lo único que cambia entre cuadrantes es el signo.",
    "Los signos, en sentido antihorario desde el cuadrante I: Todas positivas; Seno positivo (II); Tangente positiva (III); Coseno positivo (IV). Se recuerda como «Todos, Seno, Tangente, Coseno» (en inglés, ASTC).",
    "Con el primer cuadrante memorizado y esta regla de signos, los cuatro cuadrantes salen sin tabla."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.cuadrantes",
      "despuesDePaso": 2,
      "titulo": "Referencia de $30^{\\circ}$ en los cuatro cuadrantes",
      "referencia": 30
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el ángulo de referencia de $150^{\\circ}$ (cuadrante II)?",
      "opciones": [
        "$60^{\\circ}$",
        "$150^{\\circ}$",
        "$210^{\\circ}$",
        "$30^{\\circ}$"
      ],
      "respuesta": "$30^{\\circ}$",
      "explicacion": "En el cuadrante II la referencia es $180^{\\circ}-150^{\\circ}=30^{\\circ}$."
    },
    {
      "pregunta": "Según la regla, ¿en qué cuadrante es POSITIVA la tangente (además del I)?",
      "opciones": [
        "Cuadrante III",
        "Cuadrante II",
        "Cuadrante IV",
        "En ninguno más"
      ],
      "respuesta": "Cuadrante III",
      "explicacion": "Todos, Seno, Tangente, Coseno: la tangente es la positiva del cuadrante III (allí $x$ e $y$ son negativos y su cociente es positivo)."
    },
    {
      "pregunta": "¿Qué es lo único que cambia entre el primer cuadrante y los otros tres, una vez que tienes el ángulo de referencia?",
      "opciones": [
        "El signo del valor",
        "El valor completo: hay que recalcularlo",
        "Nada: los cuatro cuadrantes dan lo mismo",
        "Solo cambia para el seno"
      ],
      "respuesta": "El signo del valor",
      "explicacion": "El valor absoluto es el del ángulo de referencia; lo que decide el cuadrante es el signo."
    },
    {
      "pregunta": "¿Cuánto vale $\\operatorname{sen}(300^{\\circ})$?",
      "opciones": [
        "$\\frac{\\sqrt{3}}{2}$",
        "$\\frac{1}{2}$",
        "$-\\frac{\\sqrt{3}}{2}$",
        "$-\\sqrt{3}$"
      ],
      "respuesta": "$-\\frac{\\sqrt{3}}{2}$",
      "explicacion": "$300^{\\circ}$ está en el cuadrante IV (seno negativo) con referencia $60^{\\circ}$: $-\\frac{\\sqrt{3}}{2}$. $\\frac{1}{2}$ es el coseno de $300^{\\circ}$."
    }
  ]
}$trigonometria$::jsonb,
  orden = 3,
  requiere_pro = false
where slug = 'trigonometria-simetria-cuadrantes' and problem_type = 'trigonometria';

update public.techniques
set nombre = 'Conversión rápida entre grados y radianes',
  descripcion = 'Un atajo mental para no multiplicar por π/180 cada vez que aparece un ángulo notable.',
  contenido = $trigonometria${
  "pasos": [
    "Regla general: de grados a radianes se multiplica por π/180; de radianes a grados, por 180/π. En el fondo todo sale de π radianes = 180°.",
    "Atajo: 180° = π, así que 90° = π/2, 60° = π/3, 45° = π/4 y 30° = π/6. Son los cuatro que conviene saber de memoria.",
    "El resto de los ángulos notables se arman sumando o restando esos: 120° = 2π/3 (el doble de π/3) y 210° = 7π/6 (π + π/6).",
    "Si dudas, escribe primero qué fracción de vuelta es (60° es 1/6 de 360°) y multiplícala por 2π: (1/6) · 2π = π/3. Es más lento, pero siempre funciona."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.circulo",
      "despuesDePaso": 2,
      "titulo": "Grados y radianes",
      "angulos": [
        30,
        45,
        60,
        90,
        120,
        210
      ],
      "unidad": "ambas",
      "valores": false
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos radianes son $60^{\\circ}$?",
      "opciones": [
        "$\\frac{\\pi}{6}$",
        "$\\frac{\\pi}{4}$",
        "$\\frac{\\pi}{2}$",
        "$\\frac{\\pi}{3}$"
      ],
      "respuesta": "$\\frac{\\pi}{3}$",
      "explicacion": "$60^{\\circ}$ es uno de los cuatro ángulos base: $90^{\\circ}=\\frac{\\pi}{2}$, $60^{\\circ}=\\frac{\\pi}{3}$, $45^{\\circ}=\\frac{\\pi}{4}$ y $30^{\\circ}=\\frac{\\pi}{6}$."
    },
    {
      "pregunta": "Con el atajo de sumar o restar los ángulos base, ¿cuántos radianes son $120^{\\circ}$?",
      "opciones": [
        "$\\frac{\\pi}{3}$",
        "$\\frac{2\\pi}{3}$",
        "$\\dfrac{4\\pi}{3}$",
        "$\\dfrac{3\\pi}{2}$"
      ],
      "respuesta": "$\\frac{2\\pi}{3}$",
      "explicacion": "$120^{\\circ}$ es el doble de $60^{\\circ}$, así que sus radianes son el doble de $\\frac{\\pi}{3}$: $\\frac{2\\pi}{3}$."
    },
    {
      "pregunta": "Con el atajo de sumar $180^{\\circ}$ y el ángulo base, ¿cuántos radianes son $210^{\\circ}$?",
      "opciones": [
        "$\\frac{7\\pi}{6}$",
        "$\\frac{\\pi}{6}$",
        "$\\dfrac{6\\pi}{7}$",
        "$\\frac{11\\pi}{6}$"
      ],
      "respuesta": "$\\frac{7\\pi}{6}$",
      "explicacion": "$210^{\\circ}=180^{\\circ}+30^{\\circ}$, es decir $\\pi+\\frac{\\pi}{6}=\\frac{7\\pi}{6}$."
    },
    {
      "pregunta": "¿Cuántos grados son $\\dfrac{\\pi}{4}$ radianes?",
      "opciones": [
        "$30^{\\circ}$",
        "$60^{\\circ}$",
        "$90^{\\circ}$",
        "$45^{\\circ}$"
      ],
      "respuesta": "$45^{\\circ}$",
      "explicacion": "Se reemplaza $\\pi$ por $180^{\\circ}$: $\\frac{180^{\\circ}}{4}=45^{\\circ}$."
    }
  ]
}$trigonometria$::jsonb,
  orden = 4,
  requiere_pro = false
where slug = 'trigonometria-grados-radianes' and problem_type = 'trigonometria';

update public.techniques
set nombre = 'Cuándo usar la ley del seno y cuándo la del coseno',
  descripcion = 'La pregunta que decide todo: ¿tienes una pareja ángulo–lado opuesto o no?',
  contenido = $trigonometria${
  "pasos": [
    "Si conoces un ángulo Y su lado opuesto (o te piden completar esa pareja), usa la ley del seno: a/sen(A) = b/sen(B) = c/sen(C).",
    "Si conoces 2 lados y el ángulo que está ENTRE ellos (SAS), o los 3 lados sin ningún ángulo (SSS), usa la ley del coseno: ahí no hay ninguna pareja ángulo–lado opuesto disponible.",
    "Truco para no confundirlas: la ley del coseno se parece a Pitágoras con un término extra (−2ab·cos C); es una versión generalizada de Pitágoras para triángulos que no son rectángulos.",
    "La ley del seno tiene forma de fracciones iguales: es más fácil despejar en cuanto tengas una fracción completa armada de un lado."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.ley",
      "despuesDePaso": 0,
      "titulo": "Con una pareja ángulo–lado opuesto: ley del seno",
      "ley": "seno",
      "datos": {
        "A": 30,
        "B": 45,
        "a": 10
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "Conoces un ángulo, el lado opuesto a ese ángulo y otro ángulo. ¿Qué ley usas para completar el triángulo?",
      "opciones": [
        "La ley del coseno",
        "Ninguna: siempre falta información",
        "La ley del seno",
        "El teorema de Pitágoras"
      ],
      "respuesta": "La ley del seno",
      "explicacion": "Tener una pareja ángulo–lado opuesto es la señal para usar la ley del seno: $\\frac{a}{\\operatorname{sen}(A)}=\\frac{b}{\\operatorname{sen}(B)}=\\frac{c}{\\operatorname{sen}(C)}$."
    },
    {
      "pregunta": "Conoces 2 lados de un triángulo y el ángulo que está ENTRE ellos (SAS). ¿Qué ley corresponde?",
      "opciones": [
        "La ley del seno",
        "El teorema de Pitágoras directo",
        "La ley del coseno",
        "No se puede resolver sin un tercer lado"
      ],
      "respuesta": "La ley del coseno",
      "explicacion": "En SAS no hay ninguna pareja ángulo–lado opuesto disponible: ahí se aplica la ley del coseno."
    },
    {
      "pregunta": "¿A qué fórmula conocida se parece la ley del coseno, con un término extra?",
      "opciones": [
        "Al teorema de Pitágoras, con el término extra $-2ab\\cos(C)$",
        "A la ley del seno, invertida",
        "A la fórmula del área de un triángulo",
        "No se parece a ninguna"
      ],
      "respuesta": "Al teorema de Pitágoras, con el término extra $-2ab\\cos(C)$",
      "explicacion": "$c^{2}=a^{2}+b^{2}-2ab\\cos(C)$ es Pitágoras generalizado: cuando $C=90^{\\circ}$, $\\cos(C)=0$ y queda Pitágoras puro."
    },
    {
      "pregunta": "Con $A=30^{\\circ}$, $B=45^{\\circ}$ y $a=10$, ¿cuánto mide $b$?",
      "opciones": [
        "14,14",
        "7,07",
        "5",
        "3,54"
      ],
      "respuesta": "14,14",
      "explicacion": "Ley del seno: $b=\\frac{10\\cdot\\operatorname{sen}(45^{\\circ})}{\\operatorname{sen}(30^{\\circ})}\\approx 14{,}14$. El valor 7,07 invierte las parejas."
    }
  ]
}$trigonometria$::jsonb,
  orden = 1,
  requiere_pro = false
where slug = 'trigonometria-cuando-usar-cada-ley' and problem_type = 'trigonometria';

-- 2) Técnicas nuevas (requiere_pro = false).
insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

('trigonometria-tecnica-elegir-la-razon', '¿Qué razón uso? Dato, incógnita y el lado que sobra',
  'Cómo elegir entre seno, coseno y tangente mirando qué lados intervienen, y cuándo multiplicar, dividir o usar la función inversa.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Marca en el dibujo el dato y la incógnita. El tercer lado, el que no interviene, se ignora.",
    "Mira qué dos lados intervienen: opuesto e hipotenusa, seno; adyacente e hipotenusa, coseno; opuesto y adyacente, tangente.",
    "Para hallar un lado: si la incógnita queda arriba en el cociente, se multiplica; si queda abajo, se divide. Para hallar un ángulo: se usa la inversa (sen⁻¹, cos⁻¹, tan⁻¹).",
    "Antes de calcular, pon la calculadora en modo grados (DEG). Comprueba al final que la hipotenusa sea el lado más largo."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.resolver",
      "despuesDePaso": 2,
      "titulo": "Un ejemplo completo",
      "modo": "lado",
      "angulo": 40,
      "dado": "c",
      "valor": 15,
      "pedido": "a"
    }
  ],
  "quiz": [
    {
      "pregunta": "Conoces el cateto opuesto y quieres hallar la hipotenusa. ¿Qué razón usas?",
      "opciones": [
        "El coseno",
        "La tangente",
        "Ninguna, falta el ángulo recto",
        "El seno"
      ],
      "respuesta": "El seno",
      "explicacion": "Opuesto e hipotenusa son los lados del seno (opuesto ÷ hipotenusa). El coseno usa el adyacente y la tangente no incluye la hipotenusa."
    },
    {
      "pregunta": "Conoces los dos catetos y quieres el ángulo agudo. ¿Qué usas?",
      "opciones": [
        "El seno inverso",
        "El coseno inverso",
        "La tangente inversa",
        "La cosecante"
      ],
      "respuesta": "La tangente inversa",
      "explicacion": "Los dos catetos son el opuesto y el adyacente: tangente. Como buscas el ángulo, se usa la función inversa, $\\tan^{-1}$."
    },
    {
      "pregunta": "Con $A=40^{\\circ}$ y la hipotenusa igual a 15, ¿cuánto mide el cateto opuesto?",
      "opciones": [
        "11,49",
        "23,34",
        "12,59",
        "9,64"
      ],
      "respuesta": "9,64",
      "explicacion": "Seno, y la incógnita queda arriba: se multiplica. $15\\cdot\\operatorname{sen}(40^{\\circ})\\approx 9{,}64$."
    },
    {
      "pregunta": "¿Qué se debe comprobar al terminar un problema de triángulos rectángulos?",
      "opciones": [
        "Que la suma de los catetos sea igual a la hipotenusa",
        "Que el resultado sea un número entero",
        "Que la hipotenusa sea el lado más largo",
        "Que el resultado sea menor que 1"
      ],
      "respuesta": "Que la hipotenusa sea el lado más largo",
      "explicacion": "La hipotenusa es siempre el lado más largo, pero no es la suma de los catetos (eso violaría Pitágoras). El resultado de un lado puede ser cualquier positivo, entero o no."
    }
  ]
}$trigonometria$::jsonb,
  2,
  false),

('trigonometria-tecnica-reciprocas-en-cruz', 'La «co» engaña: la cosecante es del seno',
  'Las recíprocas van «en cruz»: cosecante con seno, secante con coseno. Y no las confundas con las funciones inversas.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Las recíprocas dan vuelta la razón: $\\operatorname{cosec}(A)=\\dfrac{1}{\\operatorname{sen}(A)}$, $\\sec(A)=\\dfrac{1}{\\cos(A)}$ y $\\cot(A)=\\dfrac{1}{\\tan(A)}$.",
    "La trampa: la cosecante NO es la recíproca del coseno. Van «en cruz»: la que lleva «co» (cosecante) va con la que no lo lleva (seno); la secante va con el coseno.",
    "En la calculadora no hay teclas para ellas: se calculan dividiendo 1 entre la razón. Ojo: la tecla sen⁻¹ es la función inversa (da un ángulo), no la recíproca."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.triangulo",
      "despuesDePaso": 1,
      "titulo": "Recíprocas del ángulo $A$",
      "catetos": [
        3,
        4
      ],
      "vertice": "A",
      "pasos": [
        "cosec",
        "sec",
        "cot"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la recíproca del seno?",
      "opciones": [
        "La cosecante",
        "La secante",
        "La cotangente",
        "El arcoseno"
      ],
      "respuesta": "La cosecante",
      "explicacion": "Cosecante y seno van emparejados: $\\operatorname{cosec}(A)=\\frac{1}{\\operatorname{sen}(A)}$. La secante es del coseno y la cotangente de la tangente."
    },
    {
      "pregunta": "En un triángulo 3-4-5, con el cateto de 3 frente al ángulo $A$, ¿cuánto vale $\\sec(A)$?",
      "opciones": [
        "$\\dfrac{5}{3}$",
        "$\\dfrac{5}{4}$",
        "$\\dfrac{4}{3}$",
        "$\\dfrac{4}{5}$"
      ],
      "respuesta": "$\\dfrac{5}{4}$",
      "explicacion": "La secante es hipotenusa sobre adyacente: $\\frac{5}{4}$. $\\frac{5}{3}$ es la cosecante y $\\frac{4}{3}$ la cotangente; $\\frac{4}{5}$ es el coseno."
    },
    {
      "pregunta": "Con la calculadora en modo grados, ¿cuánto vale $\\cot(35^{\\circ})$?",
      "opciones": [
        "0,7",
        "1,74",
        "1,43",
        "1,22"
      ],
      "respuesta": "1,43",
      "explicacion": "1 dividido entre la tangente: $\\frac{1}{0{,}7002}\\approx 1{,}43$."
    },
    {
      "pregunta": "La tecla $\\operatorname{sen}^{-1}$ de la calculadora calcula…",
      "opciones": [
        "1 dividido entre el seno",
        "el ángulo cuyo seno es el número escrito",
        "la cosecante",
        "el seno de $-1$"
      ],
      "respuesta": "el ángulo cuyo seno es el número escrito",
      "explicacion": "Es la función inversa (arcoseno): devuelve un ángulo. La recíproca del seno, la cosecante, no tiene tecla propia."
    }
  ]
}$trigonometria$::jsonb,
  3,
  false),

('trigonometria-tecnica-medio-cuadrado-medio-equilatero', 'Medio cuadrado y medio equilátero',
  'De dónde salen los valores exactos de 30°, 45° y 60°: cortar un cuadrado o un triángulo equilátero por la mitad.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Medio cuadrado: un cuadrado de lado 1 cortado por su diagonal da un triángulo con catetos 1 y 1 e hipotenusa $\\sqrt{2}$. Sus ángulos agudos son de $45^{\\circ}$.",
    "Medio equilátero: un triángulo equilátero de lado 2 cortado por su altura da un triángulo con hipotenusa 2, un cateto de 1 y el otro de $\\sqrt{3}$. El cateto de 1 está frente al ángulo de $30^{\\circ}$.",
    "Con esos lados salen las razones: $\\operatorname{sen}(30^{\\circ})=\\frac{1}{2}$, $\\cos(30^{\\circ})=\\frac{\\sqrt{3}}{2}$, $\\operatorname{sen}(45^{\\circ})=\\cos(45^{\\circ})=\\frac{\\sqrt{2}}{2}$, $\\tan(45^{\\circ})=1$, $\\operatorname{sen}(60^{\\circ})=\\frac{\\sqrt{3}}{2}$ y $\\cos(60^{\\circ})=\\frac{1}{2}$.",
    "Una pista para no confundirte: el ángulo menor tiene el seno menor, porque está frente al lado más corto. Por eso $\\operatorname{sen}(30^{\\circ})<\\operatorname{sen}(60^{\\circ})$."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.triangulo",
      "despuesDePaso": 1,
      "titulo": "Medio equilátero: catetos 1 y $\\sqrt{3}$",
      "catetos": [
        1,
        1.7321
      ],
      "vertice": "A",
      "pasos": [
        "opuesto",
        "adyacente",
        "hipotenusa",
        "sen",
        "cos",
        "tan"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto vale $\\operatorname{sen}(30^{\\circ})$?",
      "opciones": [
        "$\\frac{1}{2}$",
        "$\\frac{\\sqrt{3}}{2}$",
        "$\\frac{\\sqrt{2}}{2}$",
        "$\\frac{\\sqrt{3}}{3}$"
      ],
      "respuesta": "$\\frac{1}{2}$",
      "explicacion": "En el medio equilátero, el cateto frente a $30^{\\circ}$ mide 1 y la hipotenusa 2: $\\frac{1}{2}$. $\\frac{\\sqrt{3}}{2}$ es el seno de $60^{\\circ}$."
    },
    {
      "pregunta": "¿Cuánto vale $\\tan(45^{\\circ})$?",
      "opciones": [
        "$1$",
        "$\\frac{\\sqrt{2}}{2}$",
        "$\\sqrt{2}$",
        "$0$"
      ],
      "respuesta": "$1$",
      "explicacion": "Con catetos iguales (1 y 1), opuesto ÷ adyacente vale 1. $\\frac{\\sqrt{2}}{2}$ es el seno y el coseno de $45^{\\circ}$."
    },
    {
      "pregunta": "Un triángulo rectángulo tiene un ángulo de $60^{\\circ}$ y la hipotenusa mide 8. ¿Cuánto mide el cateto adyacente a ese ángulo?",
      "opciones": [
        "$4\\sqrt{3}\\approx 6{,}93$",
        "4",
        "$8\\sqrt{3}\\approx 13{,}86$",
        "8"
      ],
      "respuesta": "4",
      "explicacion": "Como $\\cos(60^{\\circ})=\\frac{1}{2}$, el adyacente es la mitad de la hipotenusa: 4. $4\\sqrt{3}$ es el opuesto."
    },
    {
      "pregunta": "¿Cuál es la hipotenusa de un triángulo rectángulo con catetos 1 y 1?",
      "opciones": [
        "$2$",
        "$1$",
        "$\\dfrac{\\sqrt{2}}{2}$",
        "$\\sqrt{2}$"
      ],
      "respuesta": "$\\sqrt{2}$",
      "explicacion": "Por Pitágoras, $\\sqrt{1^{2}+1^{2}}=\\sqrt{2}$. La hipotenusa es siempre mayor que cada cateto, así que no puede ser 1 ni $\\frac{\\sqrt{2}}{2}$ (que es menor que 1)."
    }
  ]
}$trigonometria$::jsonb,
  4,
  false),

('trigonometria-tecnica-elevacion-y-depresion', 'Elevación y depresión: mide desde la horizontal',
  'Cómo dibujar el triángulo de un problema de alturas y distancias y qué hacer con el ángulo de depresión.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Los dos ángulos se miden desde la horizontal que sale del ojo del observador: hacia arriba es elevación; hacia abajo, depresión.",
    "Dibuja siempre el triángulo rectángulo: la altura es un cateto vertical, la distancia al suelo es el otro cateto y la visual es la hipotenusa.",
    "Con la depresión, el ángulo del triángulo en el suelo mide lo mismo (ángulos alternos internos entre las dos horizontales).",
    "Si el observador tiene estatura, suma la altura de sus ojos al resultado."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.resolver",
      "despuesDePaso": 2,
      "titulo": "Depresión de $25^{\\circ}$ desde un faro de 60 m",
      "modo": "lado",
      "angulo": 25,
      "dado": "a",
      "valor": 60,
      "pedido": "b"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Desde dónde se mide el ángulo de elevación?",
      "opciones": [
        "Desde la vertical hacia arriba",
        "Desde el suelo hacia la cima",
        "Desde la horizontal hacia arriba",
        "Desde la hipotenusa"
      ],
      "respuesta": "Desde la horizontal hacia arriba",
      "explicacion": "Elevación y depresión se miden respecto de la línea horizontal del ojo del observador: hacia arriba (elevación) o hacia abajo (depresión)."
    },
    {
      "pregunta": "Desde lo alto de un faro el ángulo de depresión de un barco es de $30^{\\circ}$. ¿Cuánto mide el ángulo en el barco entre el agua y la visual hacia el faro?",
      "opciones": [
        "$60^{\\circ}$",
        "$150^{\\circ}$",
        "$30^{\\circ}$",
        "$90^{\\circ}$"
      ],
      "respuesta": "$30^{\\circ}$",
      "explicacion": "Son ángulos alternos internos entre dos paralelas (la horizontal del faro y el agua): miden lo mismo."
    },
    {
      "pregunta": "A 20 m de la base de un árbol, el ángulo de elevación de la copa es de $45^{\\circ}$. ¿Qué altura tiene (sin contar la estatura del observador)?",
      "opciones": [
        "20 m",
        "$20\\sqrt{2}\\approx 28{,}3$ m",
        "10 m",
        "$\\dfrac{20}{\\sqrt{2}}\\approx 14{,}1$ m"
      ],
      "respuesta": "20 m",
      "explicacion": "Con $45^{\\circ}$, la tangente vale 1: la altura es igual a la distancia horizontal, 20 m."
    },
    {
      "pregunta": "Si el observador tiene los ojos a 1,6 m del suelo y calcula 8 m de altura desde el nivel de sus ojos, ¿qué altura tiene el objeto?",
      "opciones": [
        "8 m",
        "6,4 m",
        "12,8 m",
        "9,6 m"
      ],
      "respuesta": "9,6 m",
      "explicacion": "La visual sale de los ojos, así que hay que sumar los 1,6 m: $8+1{,}6=9{,}6$ m."
    }
  ]
}$trigonometria$::jsonb,
  5,
  false),

('trigonometria-tecnica-coseno-x-seno-y', 'Coseno es x, seno es y: léelos como coordenadas',
  'En el círculo de radio 1, el punto de un ángulo es (cos θ, sen θ): de ahí salen los valores de los ejes y la relación x² + y² = 1.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "En el círculo unitario (radio 1) el punto de un ángulo $\\theta$ es $(\\cos\\theta,\\ \\operatorname{sen}\\theta)$: el coseno es la coordenada $x$ (horizontal) y el seno la coordenada $y$ (vertical). En el alfabeto, la c va antes que la s, como la $x$ antes que la $y$.",
    "Con eso, los ejes se leen solos: $0^{\\circ}$ es el punto $(1,0)$; $90^{\\circ}$, $(0,1)$; $180^{\\circ}$, $(-1,0)$; y $270^{\\circ}$, $(0,-1)$.",
    "Como el punto está sobre el círculo, $x^{2}+y^{2}=1$, es decir $\\cos^{2}\\theta+\\operatorname{sen}^{2}\\theta=1$. Si conoces uno de los dos valores, el otro sale de ahí (su signo lo decide el cuadrante).",
    "La tangente es $\\frac{y}{x}$. Cuando $x=0$ (en $90^{\\circ}$ y en $270^{\\circ}$) no se puede dividir: la tangente no existe."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.circulo",
      "despuesDePaso": 0,
      "titulo": "El punto del círculo: (cos θ, sen θ)",
      "angulos": [
        30,
        120,
        225,
        315
      ],
      "unidad": "grados"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuáles son las coordenadas del punto del círculo unitario para $180^{\\circ}$?",
      "opciones": [
        "$(0,\\ -1)$",
        "$(1,\\ 0)$",
        "$(-1,\\ 0)$",
        "$(0,\\ 1)$"
      ],
      "respuesta": "$(-1,\\ 0)$",
      "explicacion": "En $180^{\\circ}$ se llegó al extremo izquierdo: $\\cos=-1$ y $\\operatorname{sen}=0$. $(0,-1)$ es el punto de $270^{\\circ}$."
    },
    {
      "pregunta": "¿Cuánto vale $\\cos(270^{\\circ})$?",
      "opciones": [
        "$0$",
        "$1$",
        "$-1$",
        "Es indefinido"
      ],
      "respuesta": "$0$",
      "explicacion": "En $270^{\\circ}$ el punto es $(0,-1)$: la coordenada $x$, el coseno, es 0. Solo la tangente sería indefinida."
    },
    {
      "pregunta": "¿Cuánto vale $\\tan(90^{\\circ})$?",
      "opciones": [
        "$0$",
        "$1$",
        "Es indefinida",
        "$-1$"
      ],
      "respuesta": "Es indefinida",
      "explicacion": "En $90^{\\circ}$ el punto es $(0,1)$ y la tangente sería $\\frac{1}{0}$: no existe."
    },
    {
      "pregunta": "Si $\\cos(\\theta)=0{,}6$ y $\\theta$ es agudo, ¿cuánto vale $\\operatorname{sen}(\\theta)$?",
      "opciones": [
        "$0{,}8$",
        "$0{,}4$",
        "$0{,}6$",
        "$1{,}6$"
      ],
      "respuesta": "$0{,}8$",
      "explicacion": "De $x^{2}+y^{2}=1$: $y^{2}=1-0{,}36=0{,}64$ y $y=0{,}8$. Restar $1-0{,}6=0{,}4$ no respeta los cuadrados."
    }
  ]
}$trigonometria$::jsonb,
  1,
  false),

('trigonometria-tecnica-coterminales', 'Suma o resta vueltas: ángulos coterminales',
  'Cómo reducir un ángulo negativo o de más de una vuelta a uno entre 0° y 360° con el que se calcula igual.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Un ángulo positivo gira en sentido antihorario y uno negativo en sentido horario. Una vuelta completa son $360^{\\circ}$ (o $2\\pi$ radianes).",
    "Ángulos coterminales terminan en el mismo lugar: $\\theta+360^{\\circ}\\cdot k$ (o $\\theta+2\\pi k$), con $k$ entero. Tienen las mismas razones trigonométricas.",
    "Para reducir un ángulo, suma o resta vueltas hasta quedar entre $0^{\\circ}$ y $360^{\\circ}$: $780^{\\circ}-2\\cdot 360^{\\circ}=60^{\\circ}$; $-45^{\\circ}+360^{\\circ}=315^{\\circ}$.",
    "Así, $\\operatorname{sen}(780^{\\circ})=\\operatorname{sen}(60^{\\circ})$ y $\\cos(-45^{\\circ})=\\cos(315^{\\circ})$, y con los valores exactos se calculan sin calculadora."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.circulo",
      "despuesDePaso": 2,
      "titulo": "$-45^{\\circ}$, $315^{\\circ}$ y $675^{\\circ}$ terminan en el mismo punto",
      "angulos": [
        -45,
        315,
        675
      ],
      "unidad": "grados"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿A qué ángulo entre $0^{\\circ}$ y $360^{\\circ}$ equivale $780^{\\circ}$?",
      "opciones": [
        "$60^{\\circ}$",
        "$420^{\\circ}$",
        "$300^{\\circ}$",
        "$140^{\\circ}$"
      ],
      "respuesta": "$60^{\\circ}$",
      "explicacion": "Se restan dos vueltas: $780-720=60$. $420^{\\circ}$ resta una sola vuelta y sigue pasando de $360^{\\circ}$."
    },
    {
      "pregunta": "¿A qué ángulo entre $0^{\\circ}$ y $360^{\\circ}$ equivale $-45^{\\circ}$?",
      "opciones": [
        "$45^{\\circ}$",
        "$135^{\\circ}$",
        "$225^{\\circ}$",
        "$315^{\\circ}$"
      ],
      "respuesta": "$315^{\\circ}$",
      "explicacion": "Se suma una vuelta: $-45+360=315$. $45^{\\circ}$ termina en el cuadrante I y $-45^{\\circ}$ en el IV."
    },
    {
      "pregunta": "¿Cuánto vale $\\operatorname{sen}(390^{\\circ})$?",
      "opciones": [
        "$\\frac{\\sqrt{3}}{2}$",
        "$-\\frac{1}{2}$",
        "$\\frac{\\sqrt{3}}{3}$",
        "$\\frac{1}{2}$"
      ],
      "respuesta": "$\\frac{1}{2}$",
      "explicacion": "$390^{\\circ}=360^{\\circ}+30^{\\circ}$ es coterminal con $30^{\\circ}$, así que $\\operatorname{sen}(390^{\\circ})=\\operatorname{sen}(30^{\\circ})=\\frac{1}{2}$."
    },
    {
      "pregunta": "¿Cuál de estos ángulos es coterminal con $30^{\\circ}$?",
      "opciones": [
        "$-30^{\\circ}$",
        "$210^{\\circ}$",
        "$150^{\\circ}$",
        "$-330^{\\circ}$"
      ],
      "respuesta": "$-330^{\\circ}$",
      "explicacion": "$-330^{\\circ}+360^{\\circ}=30^{\\circ}$. Los otros terminan en otro cuadrante."
    }
  ]
}$trigonometria$::jsonb,
  5,
  false),

('trigonometria-tecnica-la-onda', 'La onda: amplitud es la altura, periodo es el largo de un ciclo',
  'Las dos cantidades que definen una onda y cómo leerlas: cuánto sube (amplitud) y cuánto tarda en repetirse (periodo).',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Las gráficas de $y=a\\operatorname{sen}(x)$ y $y=a\\cos(x)$ son ondas que suben y bajan sin parar. La AMPLITUD es la altura: cuánto sube desde la línea media hasta el máximo, que vale $|a|$.",
    "El PERIODO es el largo de un ciclo completo, medido sobre el eje $x$. Para $\\operatorname{sen}(x)$ y $\\cos(x)$ es $2\\pi$: cada $2\\pi$ radianes la onda se repite.",
    "El seno arranca en 0 y sube; el coseno arranca en 1, su máximo. Es la misma onda con otro punto de partida: $\\cos(x)=\\operatorname{sen}\\left(x+\\frac{\\pi}{2}\\right)$.",
    "Los valores nunca salen de $[-|a|,\\ |a|]$. Si en la gráfica el máximo es 2 y el mínimo $-2$, la amplitud es 2 (no 4: 4 es la distancia de un extremo al otro)."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 1,
      "titulo": "$y=2\\operatorname{sen}(x)$: amplitud 2 y periodo $2\\pi$",
      "onda": {
        "fn": "sen",
        "a": 2
      },
      "base": {
        "fn": "sen"
      },
      "rango": [
        0,
        2
      ],
      "pasos": [
        "curva",
        "amplitud",
        "periodo"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la amplitud de $y=3\\operatorname{sen}\\left(x\\right)$?",
      "opciones": [
        "$6$",
        "$\\frac{1}{3}$",
        "$2\\pi$",
        "$3$"
      ],
      "respuesta": "$3$",
      "explicacion": "La amplitud es el valor absoluto del número que multiplica: 3. El 6 es la distancia de un extremo al otro."
    },
    {
      "pregunta": "¿Cuál es el periodo de $y=\\operatorname{sen}(x)$?",
      "opciones": [
        "$\\pi$",
        "$2\\pi$",
        "$1$",
        "$\\dfrac{\\pi}{2}$"
      ],
      "respuesta": "$2\\pi$",
      "explicacion": "La onda del seno se repite cada vuelta completa del círculo, $2\\pi$ radianes."
    },
    {
      "pregunta": "De las gráficas de seno y coseno, ¿cuál arranca en $y=1$ cuando $x=0$?",
      "opciones": [
        "El seno",
        "Las dos",
        "Ninguna",
        "El coseno"
      ],
      "respuesta": "El coseno",
      "explicacion": "$\\cos(0)=1$; en cambio $\\operatorname{sen}(0)=0$."
    },
    {
      "pregunta": "Una onda tiene máximo 5 y mínimo $-5$. ¿Cuál es su amplitud?",
      "opciones": [
        "$10$",
        "$0$",
        "$5$",
        "$2{,}5$"
      ],
      "respuesta": "$5$",
      "explicacion": "La amplitud es la altura desde la línea media (aquí $y=0$) hasta el máximo: 5. El 10 es la distancia entre extremos."
    }
  ]
}$trigonometria$::jsonb,
  1,
  false),

('trigonometria-tecnica-periodo-2pi-sobre-b', 'El periodo de y = a·sen(bx) es 2π/b',
  'Cómo el número que multiplica a x acelera la onda y la fórmula que da el largo de un ciclo.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "El número $b$ que multiplica a $x$ acelera la onda: en $\\operatorname{sen}(3x)$ caben 3 ciclos en el mismo tramo donde $\\operatorname{sen}(x)$ tiene 1.",
    "La fórmula: $P=\\frac{2\\pi}{b}$. Ejemplos: $y=\\operatorname{sen}\\left(2x\\right)$ tiene periodo $\\pi$; $y=\\cos\\left(\\frac{1}{2}x\\right)$ tiene periodo $4\\pi$.",
    "Piensa así: $b$ grande, ciclos angostos (periodo corto); $b$ chico, ciclos anchos (periodo largo). No lo dividas al revés: $\\frac{b}{2\\pi}$ es la frecuencia, cuántos ciclos caben en una unidad.",
    "Para la tangente, la onda se repite cada $\\pi$, así que el periodo de $\\tan(bx)$ es $\\frac{\\pi}{b}$."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 1,
      "titulo": "$y=\\operatorname{sen}(3x)$ contra $y=\\operatorname{sen}(x)$ (punteada)",
      "onda": {
        "fn": "sen",
        "b": 3
      },
      "base": {
        "fn": "sen"
      },
      "rango": [
        0,
        2
      ],
      "pasos": [
        "curva",
        "periodo"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el periodo de $y=\\operatorname{sen}\\left(4x\\right)$?",
      "opciones": [
        "$\\frac{\\pi}{2}$",
        "$2\\pi$",
        "$8\\pi$",
        "$4\\pi$"
      ],
      "respuesta": "$\\frac{\\pi}{2}$",
      "explicacion": "$P=\\frac{2\\pi}{4}=\\frac{\\pi}{2}$: se divide, no se multiplica."
    },
    {
      "pregunta": "¿Cuál es el periodo de $y=\\cos\\left(\\frac{1}{3}x\\right)$?",
      "opciones": [
        "$\\dfrac{2\\pi}{3}$",
        "$3\\pi$",
        "$6\\pi$",
        "$\\dfrac{\\pi}{3}$"
      ],
      "respuesta": "$6\\pi$",
      "explicacion": "$P=\\frac{2\\pi}{1/3}=6\\pi$: con $b$ chico la onda se estira."
    },
    {
      "pregunta": "Una onda $y=\\operatorname{sen}(bx)$ tiene periodo $\\dfrac{2\\pi}{5}$. ¿Cuánto vale $b$?",
      "opciones": [
        "$\\dfrac{1}{5}$",
        "$5$",
        "$2\\pi$",
        "$10\\pi$"
      ],
      "respuesta": "$5$",
      "explicacion": "De $P=\\frac{2\\pi}{b}$ se despeja $b=\\frac{2\\pi}{P}=5$."
    },
    {
      "pregunta": "¿Cuál es el periodo de $y=\\tan\\left(2x\\right)$?",
      "opciones": [
        "$\\pi$",
        "$2\\pi$",
        "$\\frac{\\pi}{2}$",
        "$4\\pi$"
      ],
      "respuesta": "$\\frac{\\pi}{2}$",
      "explicacion": "La tangente se repite cada $\\pi$: con $b=2$ el periodo es $\\frac{\\pi}{2}$."
    }
  ]
}$trigonometria$::jsonb,
  2,
  false),

('trigonometria-tecnica-desfase-y-desplazamiento', 'c corre, d sube: y = a·sen(b(x − c)) + d',
  'Qué hace cada letra de la ecuación general de una onda: el desfase la corre a los lados y el número final la sube o la baja.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "En $y=a\\operatorname{sen}(b(x-c))+d$ cada letra hace un trabajo: $a$ da la altura, $b$ el ritmo, $c$ corre la onda a los lados y $d$ la sube o la baja.",
    "$x-c$ corre la gráfica $c$ hacia la derecha; $x+c$, hacia la izquierda. La línea media es $y=d$, el máximo es $d+|a|$ y el mínimo $d-|a|$.",
    "Factoriza $b$ antes de leer $c$: $\\operatorname{sen}(2x-\\pi)=\\operatorname{sen}\\left(2\\left(x-\\frac{\\pi}{2}\\right)\\right)$, así que el desfase es $\\frac{\\pi}{2}$, no $\\pi$.",
    "Mover la onda no la estira: en $y=2\\cos\\left(x\\right)+1$ la amplitud sigue siendo $2$, la línea media es $y=1$ y el máximo es $3$."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 2,
      "titulo": "$y=\\operatorname{sen}(2x-\\pi)=\\operatorname{sen}\\left(2\\left(x-\\frac{\\pi}{2}\\right)\\right)$",
      "onda": {
        "fn": "sen",
        "b": 2,
        "c": [
          1,
          2
        ]
      },
      "base": {
        "fn": "sen",
        "b": 2
      },
      "rango": [
        0,
        2
      ],
      "pasos": [
        "curva",
        "desfase"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Hacia dónde se corre la gráfica de $y=\\operatorname{sen}\\left(x-\\dfrac{\\pi}{4}\\right)$ respecto de $y=\\operatorname{sen}(x)$?",
      "opciones": [
        "$\\dfrac{\\pi}{4}$ hacia la izquierda",
        "$\\dfrac{\\pi}{4}$ hacia la derecha",
        "$\\dfrac{\\pi}{4}$ hacia arriba",
        "$\\dfrac{\\pi}{2}$ hacia la derecha"
      ],
      "respuesta": "$\\dfrac{\\pi}{4}$ hacia la derecha",
      "explicacion": "Con $x-c$ la onda se corre $c$ hacia la derecha; con $x+c$ se correría hacia la izquierda."
    },
    {
      "pregunta": "¿Qué desfase tiene $y=\\operatorname{sen}(2x-\\pi)$?",
      "opciones": [
        "$\\pi$ hacia la derecha",
        "$2\\pi$ hacia la derecha",
        "$\\frac{\\pi}{2}$ hacia la izquierda",
        "$\\frac{\\pi}{2}$ hacia la derecha"
      ],
      "respuesta": "$\\frac{\\pi}{2}$ hacia la derecha",
      "explicacion": "Hay que factorizar: $2x-\\pi=2\\left(x-\\frac{\\pi}{2}\\right)$. El desfase es $\\frac{k}{b}=\\frac{\\pi}{2}$."
    },
    {
      "pregunta": "Para $y=2\\cos\\left(x\\right)+1$, ¿cuál es el máximo?",
      "opciones": [
        "$2$",
        "$1$",
        "$3$",
        "$-1$"
      ],
      "respuesta": "$3$",
      "explicacion": "Máximo $=d+|a|=1+2=3$. El 2 es la amplitud, el 1 la línea media y el $-1$ el mínimo."
    },
    {
      "pregunta": "Si a $y=\\cos(x)$ se le suma 4, ¿cambia la amplitud?",
      "opciones": [
        "Sí: pasa a valer 5",
        "Sí: pasa a valer 4",
        "No: solo sube la onda 4 unidades",
        "Sí: se duplica"
      ],
      "respuesta": "No: solo sube la onda 4 unidades",
      "explicacion": "El desplazamiento vertical mueve toda la gráfica; la distancia de la línea media al máximo sigue siendo 1."
    }
  ]
}$trigonometria$::jsonb,
  3,
  false),

('trigonometria-tecnica-de-la-grafica-a-la-ecuacion', 'De la gráfica a la ecuación en cuatro pasos',
  'Un método fijo para leer d, a, b y c de una onda dibujada y comprobar la ecuación con un punto.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Paso 1: con el máximo $M$ y el mínimo $m$ de la gráfica, la línea media es $d=\\frac{M+m}{2}$ y la amplitud $|a|=\\frac{M-m}{2}$.",
    "Paso 2: mide el periodo $P$ (la distancia entre dos máximos seguidos): $b=\\frac{2\\pi}{P}$.",
    "Paso 3: elige coseno (si conviene arrancar en un máximo) o seno (si arranca en la línea media) y busca el desfase $c$: para el coseno, es el $x$ de un máximo.",
    "Paso 4: comprueba con un punto. Por ejemplo, con $M=3$, $m=-1$, periodo $2\\pi$ y el primer máximo en $x=\\frac{\\pi}{2}$ sale $y=2\\cos\\left(x-\\frac{\\pi}{2}\\right)+1$. Hay más de una ecuación correcta para la misma gráfica."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 3,
      "titulo": "$y=2\\cos\\left(x-\\frac{\\pi}{2}\\right)+1$",
      "onda": {
        "fn": "cos",
        "a": 2,
        "c": [
          1,
          2
        ],
        "d": 1
      },
      "rango": [
        0,
        2
      ],
      "pasos": [
        "curva",
        "vertical",
        "amplitud",
        "periodo",
        "desfase",
        "puntos"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "Una onda tiene máximo 7 y mínimo 1. ¿Cuál es su línea media?",
      "opciones": [
        "$y=3$",
        "$y=6$",
        "$y=4$",
        "$y=7$"
      ],
      "respuesta": "$y=4$",
      "explicacion": "$d=\\frac{M+m}{2}=\\frac{7+1}{2}=4$. La amplitud es $\\frac{M-m}{2}=3$."
    },
    {
      "pregunta": "Una onda tiene periodo $\\pi$. ¿Cuánto vale $b$?",
      "opciones": [
        "$2$",
        "$\\dfrac{1}{2}$",
        "$\\pi$",
        "$2\\pi$"
      ],
      "respuesta": "$2$",
      "explicacion": "$b=\\frac{2\\pi}{P}=\\frac{2\\pi}{\\pi}=2$."
    },
    {
      "pregunta": "Una onda tipo coseno, de amplitud 1, periodo $2\\pi$ y sin desplazamiento vertical, tiene su primer máximo en $x=\\frac{\\pi}{3}$. ¿Cuál es su ecuación?",
      "opciones": [
        "$y=\\cos\\left(x+\\dfrac{\\pi}{3}\\right)$",
        "$y=\\cos(3x)$",
        "$y=\\cos\\left(x-\\dfrac{\\pi}{3}\\right)$",
        "$y=\\operatorname{sen}\\left(x-\\dfrac{\\pi}{3}\\right)$"
      ],
      "respuesta": "$y=\\cos\\left(x-\\dfrac{\\pi}{3}\\right)$",
      "explicacion": "El coseno tiene su máximo en $x=0$; para llevarlo a $\\frac{\\pi}{3}$ se corre a la derecha: $x-\\frac{\\pi}{3}$."
    },
    {
      "pregunta": "Una gráfica tiene periodo $4\\pi$. ¿Cuánto vale $b$?",
      "opciones": [
        "$2$",
        "$\\dfrac{1}{2}$",
        "$4\\pi$",
        "$\\dfrac{1}{4}$"
      ],
      "respuesta": "$\\dfrac{1}{2}$",
      "explicacion": "$b=\\frac{2\\pi}{4\\pi}=\\frac{1}{2}$: un periodo largo significa un $b$ chico."
    }
  ]
}$trigonometria$::jsonb,
  4,
  false),

('trigonometria-tecnica-tangente-y-asintotas', 'La tangente no es una onda: asíntotas en π/2 + kπ',
  'Por qué la tangente se dispara donde el coseno vale 0, cuál es su periodo y por qué no tiene amplitud.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "La tangente es $\\tan(x)=\\frac{\\operatorname{sen}(x)}{\\cos(x)}$: donde el coseno vale 0 no existe. Ahí la gráfica tiene asíntotas verticales, en $x=\\frac{\\pi}{2}+k\\pi$.",
    "Entre dos asíntotas sube de $-\\infty$ a $+\\infty$ pasando por 0. No tiene máximo, mínimo ni amplitud: su rango son todos los reales.",
    "Se repite cada $\\pi$ (no cada $2\\pi$): el periodo de $\\tan(bx)$ es $\\frac{\\pi}{b}$."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 0,
      "titulo": "$y=\\tan(x)$ y sus asíntotas",
      "onda": {
        "fn": "tan"
      },
      "rango": [
        -1,
        1
      ],
      "pasos": [
        "curva",
        "asintotas"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿En qué valores de $x$, entre $-\\pi$ y $\\pi$, tiene asíntotas $y=\\tan(x)$?",
      "opciones": [
        "$x=-\\dfrac{\\pi}{2}$ y $x=\\dfrac{\\pi}{2}$",
        "$x=-\\pi$, $x=0$ y $x=\\pi$",
        "$x=0$ solamente",
        "$x=-\\dfrac{\\pi}{4}$ y $x=\\dfrac{\\pi}{4}$"
      ],
      "respuesta": "$x=-\\dfrac{\\pi}{2}$ y $x=\\dfrac{\\pi}{2}$",
      "explicacion": "Están donde $\\cos(x)=0$."
    },
    {
      "pregunta": "¿Cuál es el periodo de $y=\\tan(x)$?",
      "opciones": [
        "$2\\pi$",
        "$\\pi$",
        "$\\dfrac{\\pi}{2}$",
        "No tiene periodo"
      ],
      "respuesta": "$\\pi$",
      "explicacion": "$\\tan(x+\\pi)=\\tan(x)$."
    },
    {
      "pregunta": "¿Cuál es la amplitud de $y=\\tan(x)$?",
      "opciones": [
        "$1$",
        "No tiene: no hay máximo ni mínimo",
        "$\\pi$",
        "$2$"
      ],
      "respuesta": "No tiene: no hay máximo ni mínimo",
      "explicacion": "La tangente se hace tan grande como se quiera cerca de una asíntota."
    },
    {
      "pregunta": "¿Cuál es el periodo de $y=\\tan(3x)$?",
      "opciones": [
        "$\\dfrac{2\\pi}{3}$",
        "$3\\pi$",
        "$\\dfrac{\\pi}{3}$",
        "$\\pi$"
      ],
      "respuesta": "$\\dfrac{\\pi}{3}$",
      "explicacion": "Para la tangente es $\\frac{\\pi}{b}$, no $\\frac{2\\pi}{b}$."
    }
  ]
}$trigonometria$::jsonb,
  5,
  false),

('trigonometria-tecnica-area-con-seno', 'Área = ½ · a · b · sen C',
  'El área de un triángulo con dos lados y el ángulo entre ellos, también con ángulos obtusos.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Con dos lados y el ángulo que está ENTRE ellos: $\\text{Área}=\\frac{1}{2}\\,a\\,b\\operatorname{sen}(C)$.",
    "De dónde sale: con base $b$, la altura sobre ese lado mide $h=a\\operatorname{sen}(C)$, y el área es $\\frac{1}{2}\\cdot b\\cdot h$.",
    "Sirve también si $C$ es obtuso, porque $\\operatorname{sen}(180^{\\circ}-C)=\\operatorname{sen}(C)$: los ángulos suplementarios tienen el mismo seno.",
    "Ejemplo: lados 10 y 7 con un ángulo de $35^{\\circ}$: $\\frac{1}{2}\\cdot 10\\cdot 7\\cdot\\operatorname{sen}(35^{\\circ})\\approx 20{,}08$."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.ley",
      "despuesDePaso": 1,
      "titulo": "La altura $h=a\\operatorname{sen}(C)$",
      "ley": "area",
      "datos": {
        "a": 10,
        "b": 7,
        "C": 35
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué datos necesita la fórmula $\\frac{1}{2}ab\\operatorname{sen}(C)$?",
      "opciones": [
        "Dos lados y un ángulo cualquiera",
        "Los tres ángulos",
        "Dos lados y el ángulo que está entre ellos",
        "Un lado y la altura"
      ],
      "respuesta": "Dos lados y el ángulo que está entre ellos",
      "explicacion": "$C$ tiene que ser el ángulo comprendido entre los lados $a$ y $b$; con otro ángulo la fórmula no vale."
    },
    {
      "pregunta": "Dos lados miden 10 y 7 y el ángulo entre ellos es $35^{\\circ}$. ¿Cuál es el área?",
      "opciones": [
        "40,15",
        "28,67",
        "20,08",
        "35"
      ],
      "respuesta": "20,08",
      "explicacion": "$\\frac{1}{2}\\cdot 10\\cdot 7\\cdot\\operatorname{sen}(35^{\\circ})\\approx 20{,}08$. El valor 40,15 olvida el $\\frac{1}{2}$."
    },
    {
      "pregunta": "¿Vale la fórmula si el ángulo entre los lados es de $130^{\\circ}$?",
      "opciones": [
        "No: el seno de un ángulo obtuso es negativo",
        "No: solo vale para ángulos agudos",
        "Sí, pero hay que usar el coseno",
        "Sí: $\\operatorname{sen}(130^{\\circ})=\\operatorname{sen}(50^{\\circ})$ es positivo"
      ],
      "respuesta": "Sí: $\\operatorname{sen}(130^{\\circ})=\\operatorname{sen}(50^{\\circ})$ es positivo",
      "explicacion": "Los ángulos suplementarios tienen el mismo seno: $\\operatorname{sen}(130^{\\circ})=\\operatorname{sen}(50^{\\circ})$, positivo."
    },
    {
      "pregunta": "La altura de un triángulo sobre el lado $b$ es $h=a\\operatorname{sen}(C)$. ¿Cuál es el área?",
      "opciones": [
        "$b\\,h$",
        "$\\dfrac{1}{2}\\,b\\,h$",
        "$\\dfrac{1}{2}\\,a\\,b$",
        "$a\\,h$"
      ],
      "respuesta": "$\\dfrac{1}{2}\\,b\\,h$",
      "explicacion": "El área de un triángulo es la mitad de la base por la altura: $\\frac{1}{2}\\cdot b\\cdot h$, y reemplazando $h$ sale $\\frac{1}{2}ab\\operatorname{sen}(C)$."
    }
  ]
}$trigonometria$::jsonb,
  2,
  false),

('trigonometria-tecnica-caso-ambiguo', 'SSA: compara a con la altura h = b·sen A',
  'Cuántos triángulos (0, 1 o 2) salen de dos lados y un ángulo que no está entre ellos, sin resolver nada.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Con dos lados y un ángulo que NO está entre ellos (SSA) puede haber 0, 1 o 2 triángulos. Se calcula primero la altura $h=b\\operatorname{sen}(A)$.",
    "Con $A$ agudo, se compara $a$ con $h$ y con $b$: si $a<h$, ninguno; si $a=h$, uno (rectángulo); si $h<a<b$, dos; si $a\\geq b$, uno.",
    "Cuando hay dos, los ángulos $B$ y $180^{\\circ}-B$ tienen el mismo seno: el segundo vale solo si $A+(180^{\\circ}-B)<180^{\\circ}$.",
    "Ejemplo: $a=7$, $b=10$ y $A=30^{\\circ}$. $h=5<7<10$: dos triángulos, con $B\\approx 45,6^{\\circ}$ y con $B\\approx 134,4^{\\circ}$."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.ley",
      "despuesDePaso": 3,
      "titulo": "$a=7$, $b=10$ y $A=30^{\\circ}$: dos triángulos",
      "ley": "ambiguo",
      "datos": {
        "a": 7,
        "b": 10,
        "A": 30
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "Con $a=4$, $b=10$ y $A=30^{\\circ}$, ¿cuántos triángulos hay?",
      "opciones": [
        "Uno",
        "Dos",
        "Ninguno",
        "Infinitos"
      ],
      "respuesta": "Ninguno",
      "explicacion": "$h=b\\operatorname{sen}(A)=5$ y $a=4<h$: el lado $a$ no llega hasta la base."
    },
    {
      "pregunta": "Con $a=7$, $b=10$ y $A=30^{\\circ}$, ¿cuántos triángulos hay?",
      "opciones": [
        "Ninguno",
        "Dos",
        "Uno",
        "Tres"
      ],
      "respuesta": "Dos",
      "explicacion": "$h=5<a=7<b=10$: el lado $a$ corta la base en dos puntos."
    },
    {
      "pregunta": "Con $a=12$, $b=10$ y $A=40^{\\circ}$, ¿cuántos triángulos hay?",
      "opciones": [
        "Uno",
        "Ninguno",
        "Dos",
        "Depende de la calculadora"
      ],
      "respuesta": "Uno",
      "explicacion": "Como $a\\geq b$, solo cabe el ángulo $B$ agudo (el suplementario haría pasar de $180^{\\circ}$ la suma de los ángulos)."
    },
    {
      "pregunta": "Si $\\operatorname{sen}(B)=0{,}5$, ¿cuáles son los ángulos $B$ posibles entre $0^{\\circ}$ y $180^{\\circ}$?",
      "opciones": [
        "$30^{\\circ}$ y $60^{\\circ}$",
        "$30^{\\circ}$ y $150^{\\circ}$",
        "$30^{\\circ}$ y $330^{\\circ}$",
        "Solo $30^{\\circ}$"
      ],
      "respuesta": "$30^{\\circ}$ y $150^{\\circ}$",
      "explicacion": "Los ángulos con el mismo seno son $B$ y $180^{\\circ}-B$: $30^{\\circ}$ y $150^{\\circ}$. El $330^{\\circ}$ está fuera de $0^{\\circ}$ a $180^{\\circ}$."
    }
  ]
}$trigonometria$::jsonb,
  3,
  false),

('trigonometria-tecnica-tres-identidades-base', 'Tres identidades que abren todas las puertas',
  'Recíprocas, cociente y pitagórica: con estas tres se pasa de cualquier razón a otra.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Recíprocas: $\\operatorname{cosec}(x)=\\frac{1}{\\operatorname{sen}(x)}$, $\\sec(x)=\\frac{1}{\\cos(x)}$ y $\\cot(x)=\\frac{1}{\\tan(x)}$.",
    "Cociente: $\\tan(x)=\\frac{\\operatorname{sen}(x)}{\\cos(x)}$ y $\\cot(x)=\\frac{\\cos(x)}{\\operatorname{sen}(x)}$.",
    "Pitagórica: $\\operatorname{sen}^{2}(x)+\\cos^{2}(x)=1$, que sale de $x^{2}+y^{2}=1$ en el círculo unitario. Dividiéndola entre $\\cos^{2}$ o entre $\\operatorname{sen}^{2}$ salen $1+\\tan^{2}=\\sec^{2}$ y $1+\\cot^{2}=\\operatorname{cosec}^{2}$.",
    "Si conoces una razón y el cuadrante, con estas tres puedes hallar todas las demás. El signo lo decide el cuadrante."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.identidad",
      "despuesDePaso": 2,
      "titulo": "Pitágoras sobre el círculo ($\\theta=60^{\\circ}$)",
      "angulo": 60,
      "forma": "derivadas"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿A qué es igual $1+\\tan^{2}(x)$?",
      "opciones": [
        "$\\sec^{2}(x)$",
        "$\\cos^{2}(x)$",
        "$\\operatorname{cosec}^{2}(x)$",
        "$\\cot^{2}(x)$"
      ],
      "respuesta": "$\\sec^{2}(x)$",
      "explicacion": "Al dividir $\\operatorname{sen}^{2}+\\cos^{2}=1$ entre $\\cos^{2}$ sale $\\tan^{2}+1=\\sec^{2}$."
    },
    {
      "pregunta": "Si $\\operatorname{sen}(x)=\\frac{5}{13}$ y $\\cos(x)=\\frac{12}{13}$, ¿cuánto vale $\\tan(x)$?",
      "opciones": [
        "$\\dfrac{12}{5}$",
        "$\\dfrac{5}{13}$",
        "$\\dfrac{60}{169}$",
        "$\\dfrac{5}{12}$"
      ],
      "respuesta": "$\\dfrac{5}{12}$",
      "explicacion": "$\\tan=\\frac{\\operatorname{sen}}{\\cos}=\\frac{5}{12}$. $\\frac{12}{5}$ es la cotangente."
    },
    {
      "pregunta": "Si $\\cos(x)=0{,}6$ y $x$ es agudo, ¿cuánto vale $\\operatorname{sen}(x)$?",
      "opciones": [
        "$0{,}8$",
        "$0{,}4$",
        "$0{,}6$",
        "$1{,}6$"
      ],
      "respuesta": "$0{,}8$",
      "explicacion": "$\\operatorname{sen}^{2}=1-0{,}36=0{,}64$, y la raíz es $0{,}8$. Restar $1-0{,}6$ no respeta los cuadrados."
    },
    {
      "pregunta": "¿Cuál es la recíproca del coseno?",
      "opciones": [
        "La secante",
        "La cosecante",
        "La cotangente",
        "El arcocoseno"
      ],
      "respuesta": "La secante",
      "explicacion": "Los nombres van «en cruz»: secante con coseno, cosecante con seno."
    }
  ]
}$trigonometria$::jsonb,
  1,
  false),

('trigonometria-tecnica-doble-y-suma', 'sen(A + B) no es sen A + sen B',
  'El error más común con las fórmulas de suma y ángulo doble, y las fórmulas correctas para calcular valores exactos como sen 75°.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "El seno NO se distribuye: con $A=B=30^{\\circ}$, $\\operatorname{sen}(60^{\\circ})\\approx 0{,}866$ pero $\\operatorname{sen}(30^{\\circ})+\\operatorname{sen}(30^{\\circ})=1$.",
    "Fórmula correcta: $\\operatorname{sen}(A+B)=\\operatorname{sen}(A)\\cos(B)+\\cos(A)\\operatorname{sen}(B)$. En el coseno, el signo del medio es el CONTRARIO: $\\cos(A+B)=\\cos(A)\\cos(B)-\\operatorname{sen}(A)\\operatorname{sen}(B)$.",
    "Ejemplo: $\\operatorname{sen}(75^{\\circ})=\\operatorname{sen}(45^{\\circ}+30^{\\circ})=\\frac{\\sqrt{6}+\\sqrt{2}}{4}$.",
    "Con $A=B=x$ salen las del ángulo doble: $\\operatorname{sen}(2x)=2\\operatorname{sen}(x)\\cos(x)$ y $\\cos(2x)=\\cos^{2}(x)-\\operatorname{sen}^{2}(x)=2\\cos^{2}(x)-1=1-2\\operatorname{sen}^{2}(x)$."
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 2,
      "titulo": "sen 75° = sen(45° + 30°)",
      "cuadros": [
        {
          "texto": "Se parte la suma.",
          "formula": "\\operatorname{sen}(45^{\\circ})\\cos(30^{\\circ})+\\cos(45^{\\circ})\\operatorname{sen}(30^{\\circ})"
        },
        {
          "texto": "Valores exactos.",
          "formula": "\\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{\\sqrt{3}}{2}+\\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{1}{2}"
        },
        {
          "texto": "Resultado:",
          "formula": "\\frac{\\sqrt{6}+\\sqrt{2}}{4}"
        }
      ],
      "msPorCuadro": 2800
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es correcta?",
      "opciones": [
        "$\\operatorname{sen}(A+B)=\\operatorname{sen}(A)+\\operatorname{sen}(B)$",
        "$\\operatorname{sen}(A+B)=\\operatorname{sen}(A)\\operatorname{sen}(B)+\\cos(A)\\cos(B)$",
        "$\\operatorname{sen}(A+B)=\\operatorname{sen}(A)\\cos(B)+\\cos(A)\\operatorname{sen}(B)$",
        "$\\operatorname{sen}(A+B)=\\operatorname{sen}(A)\\cos(B)-\\cos(A)\\operatorname{sen}(B)$"
      ],
      "respuesta": "$\\operatorname{sen}(A+B)=\\operatorname{sen}(A)\\cos(B)+\\cos(A)\\operatorname{sen}(B)$",
      "explicacion": "En el seno de una suma los dos términos se suman y se mezclan seno con coseno. La última es el seno de la diferencia."
    },
    {
      "pregunta": "¿Cuál es correcta?",
      "opciones": [
        "$\\cos(A+B)=\\cos(A)+\\cos(B)$",
        "$\\cos(A+B)=\\cos(A)\\cos(B)+\\operatorname{sen}(A)\\operatorname{sen}(B)$",
        "$\\cos(A+B)=\\cos(A)\\cos(B)-\\operatorname{sen}(A)\\operatorname{sen}(B)$",
        "$\\cos(A+B)=\\operatorname{sen}(A)\\cos(B)+\\cos(A)\\operatorname{sen}(B)$"
      ],
      "respuesta": "$\\cos(A+B)=\\cos(A)\\cos(B)-\\operatorname{sen}(A)\\operatorname{sen}(B)$",
      "explicacion": "En el coseno de una suma el signo del medio es contrario: menos."
    },
    {
      "pregunta": "¿Cuánto vale $\\operatorname{sen}(2x)$?",
      "opciones": [
        "$2\\operatorname{sen}(x)$",
        "$\\operatorname{sen}^{2}(x)$",
        "$2\\operatorname{sen}(x)\\cos(x)$",
        "$\\cos^{2}(x)-\\operatorname{sen}^{2}(x)$"
      ],
      "respuesta": "$2\\operatorname{sen}(x)\\cos(x)$",
      "explicacion": "Es $\\operatorname{sen}(x+x)$: $\\operatorname{sen}\\cos+\\cos\\operatorname{sen}$. Sin el coseno, con $x=30^{\\circ}$ daría 1 en lugar de $0{,}87$."
    },
    {
      "pregunta": "Si $\\cos(x)=\\frac{4}{5}$, ¿cuánto vale $\\cos(2x)$?",
      "opciones": [
        "$\\dfrac{7}{25}$",
        "$\\dfrac{8}{5}$",
        "$\\dfrac{16}{25}$",
        "$-\\dfrac{7}{25}$"
      ],
      "respuesta": "$\\dfrac{7}{25}$",
      "explicacion": "$\\cos(2x)=2\\cos^{2}(x)-1=2\\cdot\\frac{16}{25}-1=\\frac{7}{25}$."
    }
  ]
}$trigonometria$::jsonb,
  2,
  false),

('trigonometria-tecnica-cofunciones', 'El seno de un ángulo es el coseno de su complemento',
  'Por qué sen(90° − x) = cos x y cómo usarlo para cambiar entre seno y coseno.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "En un triángulo rectángulo, los dos ángulos agudos son complementarios (suman $90^{\\circ}$): el cateto opuesto a uno es el adyacente del otro.",
    "Por eso $\\operatorname{sen}(90^{\\circ}-x)=\\cos(x)$, $\\cos(90^{\\circ}-x)=\\operatorname{sen}(x)$ y $\\tan(90^{\\circ}-x)=\\cot(x)$: se llaman cofunciones.",
    "Sirve para cambiar de razón: $\\operatorname{sen}(70^{\\circ})=\\cos(20^{\\circ})$. Y para ecuaciones: si $\\operatorname{sen}(35^{\\circ})=\\cos(\\theta)$ con $\\theta$ agudo, $\\theta=90^{\\circ}-35^{\\circ}=55^{\\circ}$."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.triangulo",
      "despuesDePaso": 1,
      "titulo": "El seno de $A$ es el coseno de $B$",
      "catetos": [
        3,
        4
      ],
      "vertice": "A",
      "pasos": [
        "sen"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿A qué es igual $\\operatorname{sen}(90^{\\circ}-20^{\\circ})$?",
      "opciones": [
        "$\\operatorname{sen}(20^{\\circ})$",
        "$-\\cos(20^{\\circ})$",
        "$\\cos(20^{\\circ})$",
        "$\\tan(20^{\\circ})$"
      ],
      "respuesta": "$\\cos(20^{\\circ})$",
      "explicacion": "$\\operatorname{sen}(90^{\\circ}-x)=\\cos(x)$."
    },
    {
      "pregunta": "Si $\\operatorname{sen}(35^{\\circ})=\\cos(\\theta)$ y $\\theta$ es agudo, ¿cuánto mide $\\theta$?",
      "opciones": [
        "$55^{\\circ}$",
        "$35^{\\circ}$",
        "$145^{\\circ}$",
        "$65^{\\circ}$"
      ],
      "respuesta": "$55^{\\circ}$",
      "explicacion": "Cofunciones: $\\theta=90^{\\circ}-35^{\\circ}=55^{\\circ}$."
    },
    {
      "pregunta": "¿A qué es igual $\\tan(90^{\\circ}-x)$?",
      "opciones": [
        "$\\tan(x)$",
        "$\\cot(x)$",
        "$-\\tan(x)$",
        "$\\sec(x)$"
      ],
      "respuesta": "$\\cot(x)$",
      "explicacion": "La tangente del complemento es la cotangente: opuesto y adyacente se intercambian."
    },
    {
      "pregunta": "En un triángulo 3-4-5, con el cateto de 3 frente al ángulo $A$, ¿qué relación hay entre $\\operatorname{sen}(A)$ y $\\cos(B)$?",
      "opciones": [
        "Son recíprocos",
        "Suman 1",
        "Son iguales ($\\frac{3}{5}$)",
        "No tienen relación"
      ],
      "respuesta": "Son iguales ($\\frac{3}{5}$)",
      "explicacion": "El opuesto a $A$ es el adyacente a $B$, con la misma hipotenusa: $\\operatorname{sen}(A)=\\cos(B)=\\frac{3}{5}$."
    }
  ]
}$trigonometria$::jsonb,
  3,
  false),

('trigonometria-tecnica-verificar-una-identidad', 'Cómo verificar una identidad: un solo lado, a senos y cosenos',
  'Un método fijo para demostrar una identidad y una forma rápida de descartar una falsa con un ángulo.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Trabaja con el lado más complicado y transfórmalo hasta que sea igual al otro. Nunca operes en los dos lados a la vez.",
    "Pasa todo a senos y cosenos (recíprocas y cociente) y usa la pitagórica para cambiar cuadrantes: $1-\\cos^{2}(x)=\\operatorname{sen}^{2}(x)$.",
    "Cancela solo FACTORES iguales, nunca sumandos: en $\\frac{1+\\cos(x)}{\\cos(x)}$ no se puede tachar el coseno.",
    "Para descartar una falsa, prueba con un ángulo que no sea especial: un desacuerdo la refuta. Que coincida con un ángulo no la demuestra."
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 1,
      "titulo": "Verificar $\\tan(x)\\cos(x)=\\operatorname{sen}(x)$",
      "cuadros": [
        {
          "texto": "Se parte del lado izquierdo.",
          "formula": "\\tan(x)\\cos(x)"
        },
        {
          "texto": "Cociente: $\\tan(x)=\\frac{\\operatorname{sen}(x)}{\\cos(x)}$.",
          "formula": "=\\dfrac{\\operatorname{sen}(x)}{\\cos(x)}\\cdot\\cos(x)"
        },
        {
          "texto": "El coseno es un factor: se cancela.",
          "formula": "=\\operatorname{sen}(x)"
        }
      ],
      "msPorCuadro": 2600
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estas expresiones es equivalente a $\\tan(x)\\cdot\\cos(x)$?",
      "opciones": [
        "$\\cos(x)$",
        "$\\operatorname{sen}(x)$",
        "$\\sec(x)$",
        "$1$"
      ],
      "respuesta": "$\\operatorname{sen}(x)$",
      "explicacion": "$\\tan(x)\\cos(x)=\\frac{\\operatorname{sen}(x)}{\\cos(x)}\\cdot\\cos(x)=\\operatorname{sen}(x)$."
    },
    {
      "pregunta": "¿Cuál de estas expresiones es equivalente a $1-\\cos^{2}(x)$?",
      "opciones": [
        "$\\cos^{2}(x)$",
        "$\\operatorname{sen}(x)$",
        "$\\tan^{2}(x)$",
        "$\\operatorname{sen}^{2}(x)$"
      ],
      "respuesta": "$\\operatorname{sen}^{2}(x)$",
      "explicacion": "Por la pitagórica, $1-\\cos^{2}(x)=\\operatorname{sen}^{2}(x)$."
    },
    {
      "pregunta": "¿Alcanza con comprobar una identidad con un solo ángulo para demostrarla?",
      "opciones": [
        "Sí: si coincide, es cierta",
        "No: solo sirve para descartarla si no coincide",
        "Sí, si el ángulo es notable",
        "No: nunca se comprueba con números"
      ],
      "respuesta": "No: solo sirve para descartarla si no coincide",
      "explicacion": "Coincidir en un ángulo puede ser casualidad; no coincidir prueba que es falsa."
    },
    {
      "pregunta": "En $\\frac{1+\\cos(x)}{\\cos(x)}$, ¿se puede tachar el coseno?",
      "opciones": [
        "Sí, y queda $1$",
        "No: el coseno del numerador es un sumando, no un factor",
        "Sí, y queda $1+1$",
        "Solo si $x$ es agudo"
      ],
      "respuesta": "No: el coseno del numerador es un sumando, no un factor",
      "explicacion": "Solo se cancelan factores comunes: la expresión es $\\frac{1}{\\cos(x)}+1=\\sec(x)+1$."
    }
  ]
}$trigonometria$::jsonb,
  4,
  false),

('trigonometria-tecnica-una-vuelta-dos-soluciones', 'En una vuelta, casi siempre dos soluciones',
  'Cómo resolver sen x = k, cos x = k o tan x = k en [0, 2π) con la referencia y el signo de cada cuadrante.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "En el círculo unitario hay dos puntos con la misma altura (seno), con la misma posición horizontal (coseno) o con la misma tangente. Por eso una ecuación básica tiene, en una vuelta, dos soluciones (salvo cuando $\\operatorname{sen}(x)=\\pm 1$ o $\\cos(x)=\\pm 1$, que tienen una).",
    "Método: 1) aísla la razón; 2) halla el ángulo de referencia, el agudo con valor $|k|$; 3) ubica los cuadrantes por el signo de $k$ y arma las dos soluciones.",
    "Ejemplo: $\\operatorname{sen}(x)=\\dfrac{1}{2}$: referencia $\\frac{\\pi}{6}$, seno positivo en los cuadrantes I y II: $\\frac{\\pi}{6},\\ \\frac{5\\pi}{6}$.",
    "Si $|k|>1$ en seno o coseno, no hay solución: el punto nunca llega a esa altura."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.ecuacion",
      "despuesDePaso": 2,
      "titulo": "$\\operatorname{sen}(x)=\\frac{1}{2}$",
      "fn": "sen",
      "gradosValor": 30
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuáles son las soluciones de $\\operatorname{sen}(x)=\\dfrac{1}{2}$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "$\\frac{\\pi}{6},\\ \\frac{5\\pi}{6}$",
        "$\\dfrac{\\pi}{6},\\ \\dfrac{7\\pi}{6}$",
        "$\\dfrac{\\pi}{3},\\ \\dfrac{2\\pi}{3}$",
        "$\\dfrac{\\pi}{6}$"
      ],
      "respuesta": "$\\frac{\\pi}{6},\\ \\frac{5\\pi}{6}$",
      "explicacion": "Referencia $\\frac{\\pi}{6}$, seno positivo en I y II: $\\frac{\\pi}{6}$ y $\\frac{5\\pi}{6}$."
    },
    {
      "pregunta": "¿Cuáles son las soluciones de $\\operatorname{sen}(x)=-\\dfrac{\\sqrt{3}}{2}$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "$\\dfrac{2\\pi}{3},\\ \\dfrac{\\pi}{3}$",
        "$\\frac{4\\pi}{3},\\ \\frac{5\\pi}{3}$",
        "$\\dfrac{\\pi}{3},\\ \\dfrac{4\\pi}{3}$",
        "$\\dfrac{4\\pi}{3}$"
      ],
      "respuesta": "$\\frac{4\\pi}{3},\\ \\frac{5\\pi}{3}$",
      "explicacion": "Referencia $\\frac{\\pi}{3}$; el seno es negativo en III y IV: $\\pi+\\frac{\\pi}{3}=\\frac{4\\pi}{3}$ y $2\\pi-\\frac{\\pi}{3}=\\frac{5\\pi}{3}$."
    },
    {
      "pregunta": "¿Cuáles son las soluciones de $\\cos(x)=\\dfrac{1}{2}$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "$\\dfrac{\\pi}{3},\\ \\dfrac{2\\pi}{3}$",
        "$\\dfrac{\\pi}{6},\\ \\dfrac{11\\pi}{6}$",
        "$\\frac{\\pi}{3},\\ \\frac{5\\pi}{3}$",
        "$\\dfrac{\\pi}{3}$"
      ],
      "respuesta": "$\\frac{\\pi}{3},\\ \\frac{5\\pi}{3}$",
      "explicacion": "El coseno es positivo en I y IV, con referencia $\\frac{\\pi}{3}$: $\\frac{\\pi}{3}$ y $2\\pi-\\frac{\\pi}{3}=\\frac{5\\pi}{3}$."
    },
    {
      "pregunta": "¿Cuántas soluciones tiene $\\cos(x)=-2$?",
      "opciones": [
        "Dos",
        "Una",
        "Ninguna",
        "Infinitas"
      ],
      "respuesta": "Ninguna",
      "explicacion": "El coseno nunca baja de $-1$."
    }
  ]
}$trigonometria$::jsonb,
  1,
  false),

('trigonometria-tecnica-la-calculadora-da-una', 'La calculadora te da una: la otra sale por simetría',
  'Cómo completar la segunda solución cuando se resuelve con la función inversa (arcsen, arccos, arctan).',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "La función inversa de la calculadora (en radianes) devuelve UNA solución: $\\operatorname{sen}^{-1}$ da un ángulo entre $-\\frac{\\pi}{2}$ y $\\frac{\\pi}{2}$; $\\cos^{-1}$, entre $0$ y $\\pi$; $\\tan^{-1}$, entre $-\\frac{\\pi}{2}$ y $\\frac{\\pi}{2}$.",
    "La otra sale de la simetría del círculo: con seno, $\\pi-x_{1}$; con coseno, $2\\pi-x_{1}$; con tangente, $x_{1}+\\pi$. Si algún resultado es negativo, se le suma $2\\pi$ para llevarlo a $[0,\\ 2\\pi)$.",
    "Ejemplo: $\\cos(x)=-0{,}4$. La calculadora da $x_{1}\\approx 1{,}98$ y la otra es $2\\pi-x_{1}\\approx 4{,}3$.",
    "Comprueba sustituyendo. Antes de empezar, pon la calculadora en radianes si las soluciones se piden en radianes."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.ecuacion",
      "despuesDePaso": 1,
      "titulo": "Dos soluciones de $\\cos(x)=-\\frac{\\sqrt{2}}{2}$",
      "fn": "cos",
      "gradosValor": 135
    }
  ],
  "quiz": [
    {
      "pregunta": "Con la calculadora en radianes, $\\cos^{-1}(-0{,}4)\\approx 1{,}98$. ¿Cuál es la otra solución de $\\cos(x)=-0{,}4$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "$4{,}3$",
        "$1{,}16$",
        "$5{,}12$",
        "$-1{,}98$"
      ],
      "respuesta": "$4{,}3$",
      "explicacion": "Con el coseno la otra solución es $2\\pi-x_{1}\\approx 4{,}3$ (simetría respecto del eje horizontal)."
    },
    {
      "pregunta": "La calculadora da $\\tan^{-1}(2)\\approx 1{,}107$. ¿Cuál es la otra solución de $\\tan(x)=2$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "$1{,}107+\\pi\\approx 4{,}249$",
        "$\\pi-1{,}107\\approx 2{,}034$",
        "$2\\pi-1{,}107\\approx 5{,}176$",
        "$1{,}107+2\\pi$"
      ],
      "respuesta": "$1{,}107+\\pi\\approx 4{,}249$",
      "explicacion": "La tangente se repite cada $\\pi$: la segunda solución está $\\pi$ después de la primera."
    },
    {
      "pregunta": "En $\\operatorname{sen}(x)=0{,}3$, si $x_{1}$ es la solución de la calculadora, ¿cuál es la otra?",
      "opciones": [
        "$2\\pi-x_{1}$",
        "$\\pi-x_{1}$",
        "$\\pi+x_{1}$",
        "$-x_{1}$"
      ],
      "respuesta": "$\\pi-x_{1}$",
      "explicacion": "El seno es positivo en I y II; el punto simétrico respecto del eje vertical está en $\\pi-x_{1}$."
    },
    {
      "pregunta": "Si $\\operatorname{sen}(x)=-\\dfrac{1}{2}$, ¿cuáles son las soluciones en $[0,\\ 2\\pi)$?",
      "opciones": [
        "$\\dfrac{7\\pi}{6},\\ \\dfrac{11\\pi}{6}$",
        "$-\\dfrac{\\pi}{6},\\ \\dfrac{5\\pi}{6}$",
        "$\\dfrac{5\\pi}{6},\\ \\dfrac{7\\pi}{6}$",
        "$\\dfrac{\\pi}{6},\\ \\dfrac{11\\pi}{6}$"
      ],
      "respuesta": "$\\dfrac{7\\pi}{6},\\ \\dfrac{11\\pi}{6}$",
      "explicacion": "La calculadora da $-\\frac{\\pi}{6}$, que se lleva a $[0,2\\pi)$ sumando $2\\pi$: $\\frac{11\\pi}{6}$. La otra es $\\pi-\\left(-\\frac{\\pi}{6}\\right)=\\frac{7\\pi}{6}$."
    }
  ]
}$trigonometria$::jsonb,
  2,
  false),

('trigonometria-tecnica-no-dividas-factoriza', 'No dividas entre sen x: factoriza',
  'Cómo resolver ecuaciones con potencias o con el ángulo doble sin perder soluciones.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Un producto vale 0 solo si un factor vale 0. Pasa todo a un lado, factoriza y resuelve cada factor.",
    "Si dividieras entre una función que puede valer 0, perderías soluciones. En $\\operatorname{sen}(2x)=\\operatorname{sen}(x)$, con $\\operatorname{sen}(2x)=2\\operatorname{sen}(x)\\cos(x)$ queda $\\operatorname{sen}(x)(2\\cos(x)-1)=0$: $0,\\ \\frac{\\pi}{3},\\ \\pi,\\ \\frac{5\\pi}{3}$.",
    "Si hay $\\operatorname{sen}^{2}$ y $\\cos^{2}$ juntos, cambia uno con $\\cos^{2}=1-\\operatorname{sen}^{2}$ para tener una sola razón. Si sale una cuadrática, trátala como $2t^{2}+t-1=0$ con $t=\\operatorname{sen}(x)$.",
    "Descarta los valores con $|t|>1$ en seno o coseno y comprueba las soluciones por sustitución."
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 1,
      "titulo": "Factorizar en lugar de dividir",
      "cuadros": [
        {
          "texto": "Ecuación.",
          "formula": "\\operatorname{sen}(2x)=\\operatorname{sen}(x)"
        },
        {
          "texto": "Se usa el ángulo doble y se pasa todo a un lado.",
          "formula": "2\\operatorname{sen}(x)\\cos(x)-\\operatorname{sen}(x)=0"
        },
        {
          "texto": "Se factoriza $\\operatorname{sen}(x)$.",
          "formula": "\\operatorname{sen}(x)\\,(2\\cos(x)-1)=0"
        },
        {
          "texto": "Soluciones en $[0,\\ 2\\pi)$:",
          "formula": "0,\\ \\frac{\\pi}{3},\\ \\pi,\\ \\frac{5\\pi}{3}"
        }
      ],
      "msPorCuadro": 2800
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuáles son las soluciones de $\\operatorname{sen}(x)\\cos(x)=0$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "$0,\\ \\pi$",
        "$\\dfrac{\\pi}{2},\\ \\dfrac{3\\pi}{2}$",
        "$0,\\ \\dfrac{\\pi}{2}$",
        "$0,\\ \\frac{\\pi}{2},\\ \\pi,\\ \\frac{3\\pi}{2}$"
      ],
      "respuesta": "$0,\\ \\frac{\\pi}{2},\\ \\pi,\\ \\frac{3\\pi}{2}$",
      "explicacion": "Cada factor da sus soluciones: $\\operatorname{sen}=0$ en $0$ y $\\pi$; $\\cos=0$ en $\\frac{\\pi}{2}$ y $\\frac{3\\pi}{2}$."
    },
    {
      "pregunta": "¿Cuáles son las soluciones de $2\\,\\operatorname{sen}^{2}(x)+\\operatorname{sen}(x)-1=0$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "$\\frac{\\pi}{6},\\ \\frac{5\\pi}{6},\\ \\frac{3\\pi}{2}$",
        "$\\dfrac{\\pi}{6},\\ \\dfrac{5\\pi}{6}$",
        "$\\dfrac{\\pi}{6},\\ \\dfrac{5\\pi}{6},\\ \\dfrac{\\pi}{2}$",
        "$\\dfrac{3\\pi}{2}$"
      ],
      "respuesta": "$\\frac{\\pi}{6},\\ \\frac{5\\pi}{6},\\ \\frac{3\\pi}{2}$",
      "explicacion": "$(2\\operatorname{sen}(x)-1)(\\operatorname{sen}(x)+1)=0$: $\\operatorname{sen}=\\frac{1}{2}$ (dos) o $\\operatorname{sen}=-1$ (una)."
    },
    {
      "pregunta": "¿Por qué no conviene dividir los dos miembros entre $\\operatorname{sen}(x)$?",
      "opciones": [
        "Porque el seno no se puede dividir",
        "Porque se pierden las soluciones donde $\\operatorname{sen}(x)=0$",
        "Porque cambia el signo de las soluciones",
        "Porque la ecuación deja de ser trigonométrica"
      ],
      "respuesta": "Porque se pierden las soluciones donde $\\operatorname{sen}(x)=0$",
      "explicacion": "Dividir entre algo que puede valer 0 elimina esas soluciones."
    },
    {
      "pregunta": "¿Cuántas soluciones tiene $\\operatorname{sen}^{2}(x)=\\dfrac{1}{4}$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "Dos",
        "Una",
        "Cuatro",
        "Ocho"
      ],
      "respuesta": "Cuatro",
      "explicacion": "$\\operatorname{sen}(x)=\\pm\\frac{1}{2}$: cada signo da dos soluciones."
    }
  ]
}$trigonometria$::jsonb,
  3,
  false);

-- 3) Clases (requiere_pro = true): un curso lineal en orden pedagógico; la primera es preview gratis.
insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

('trigonometria-clase-01-lados-segun-el-angulo', 'El triángulo rectángulo y sus lados según el ángulo',
  'Hipotenusa, cateto opuesto y cateto adyacente: el vocabulario con el que se escribe toda la trigonometría.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás señalar, en cualquier triángulo rectángulo, cuál es la hipotenusa, cuál es el cateto opuesto y cuál el cateto adyacente respecto de un ángulo agudo. Es el vocabulario con el que se escribe toda la trigonometría.",
    "Un triángulo rectángulo tiene un ángulo de $90^{\\circ}$ (el ángulo recto). El lado que está frente a ese ángulo se llama hipotenusa y siempre es el más largo. Los otros dos lados se llaman catetos. Ya lo conoces del teorema de Pitágoras: $a^{2}+b^{2}=c^{2}$. Los otros dos ángulos son agudos y suman $90^{\\circ}$, porque los tres ángulos de un triángulo suman $180^{\\circ}$.",
    "Intuición. La idea clave es que los nombres «opuesto» y «adyacente» no pertenecen al lado, dependen del ángulo agudo que elijas. El cateto opuesto es el que está frente al ángulo (no lo toca). El cateto adyacente es el que lo toca sin ser la hipotenusa. En el dibujo se ve paso a paso con el ángulo $A$.",
    "Cambia ahora de ángulo. Con el ángulo $A$, el opuesto es el cateto de 3 y el adyacente el de 4. Con el ángulo $B$ es al revés: el opuesto es el de 4 y el adyacente el de 3. La hipotenusa (5) no cambia nunca. Por eso, antes de escribir cualquier razón, hay que decir siempre «respecto de qué ángulo».",
    "Ejemplo resuelto. Un triángulo rectángulo tiene catetos de 5 y 12 y hipotenusa de 13. ¿Cuál es el opuesto y cuál el adyacente al ángulo menor? Sigue los pasos en el cuadro.",
    "Errores comunes. 1) Llamar «opuesto» siempre al cateto vertical: si el triángulo está girado, el vertical puede ser el adyacente. 2) Confundir el adyacente con la hipotenusa: los dos tocan el ángulo, pero la hipotenusa nunca es un cateto. 3) Olvidar que al cambiar de ángulo se intercambian el opuesto y el adyacente.",
    "Resumen. Hipotenusa: frente al ángulo recto, siempre el lado más largo. Opuesto: el cateto frente al ángulo elegido. Adyacente: el cateto que toca al ángulo elegido. El ángulo más pequeño está siempre frente al lado más corto."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.triangulo",
      "despuesDePaso": 2,
      "titulo": "Lados vistos desde el ángulo $A$",
      "catetos": [
        3,
        4
      ],
      "vertice": "A",
      "pasos": [
        "hipotenusa",
        "opuesto",
        "adyacente"
      ]
    },
    {
      "tipo": "trigonometria.triangulo",
      "despuesDePaso": 3,
      "titulo": "Los mismos lados vistos desde el ángulo $B$",
      "catetos": [
        3,
        4
      ],
      "vertice": "B",
      "pasos": [
        "hipotenusa",
        "opuesto",
        "adyacente"
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 4,
      "titulo": "Lados de un triángulo 5-12-13",
      "cuadros": [
        {
          "texto": "Paso 1: ubica el ángulo recto y marca la hipotenusa, el lado que está frente a él: mide 13."
        },
        {
          "texto": "Paso 2: elige el ángulo menor. El lado más corto (5) está frente al ángulo más pequeño, así que 5 es el cateto opuesto.",
          "resaltar": "Opuesto = 5"
        },
        {
          "texto": "Paso 3: el otro cateto (12) toca al ángulo elegido sin ser la hipotenusa.",
          "resaltar": "Adyacente = 12"
        }
      ],
      "msPorCuadro": 2800
    }
  ],
  "quiz": [
    {
      "pregunta": "Un triángulo rectángulo tiene lados de 6, 8 y 10. ¿Cuál es la hipotenusa?",
      "opciones": [
        "6",
        "8",
        "Depende del ángulo que se elija",
        "10"
      ],
      "respuesta": "10",
      "explicacion": "La hipotenusa es el lado frente al ángulo recto y el más largo; no depende del ángulo agudo que elijas. Además $6^{2}+8^{2}=36+64=100=10^{2}$."
    },
    {
      "pregunta": "En un triángulo rectángulo con catetos 3 y 4 e hipotenusa 5, el cateto de 3 está frente al ángulo $A$. ¿Cómo se llama respecto de $A$?",
      "opciones": [
        "Cateto opuesto",
        "Cateto adyacente",
        "Hipotenusa",
        "Depende de la posición del dibujo"
      ],
      "respuesta": "Cateto opuesto",
      "explicacion": "El lado que está frente al ángulo elegido es su cateto opuesto. El de 4 es el adyacente y el de 5 la hipotenusa; no importa cómo esté girado el dibujo."
    },
    {
      "pregunta": "Se cambia del ángulo $A$ al otro ángulo agudo $B$ del mismo triángulo. ¿Qué pasa con el opuesto y el adyacente?",
      "opciones": [
        "No cambian: dependen del triángulo, no del ángulo",
        "Se intercambian: el opuesto de $B$ es el adyacente de $A$",
        "El opuesto pasa a ser la hipotenusa",
        "Los dos catetos pasan a ser opuestos"
      ],
      "respuesta": "Se intercambian: el opuesto de $B$ es el adyacente de $A$",
      "explicacion": "Opuesto y adyacente se definen respecto de un ángulo. Al cambiar de ángulo, el cateto que estaba frente al primero pasa a tocar al segundo, y al revés. La hipotenusa sigue siendo la misma."
    },
    {
      "pregunta": "¿Cuál de estas afirmaciones sobre el cateto adyacente es correcta?",
      "opciones": [
        "Toca al ángulo elegido y no es la hipotenusa",
        "Es el lado más largo del triángulo",
        "Está frente al ángulo elegido",
        "Es siempre el lado horizontal del dibujo"
      ],
      "respuesta": "Toca al ángulo elegido y no es la hipotenusa",
      "explicacion": "El adyacente es el cateto que forma el ángulo junto con la hipotenusa. El lado más largo es la hipotenusa, el que está enfrente es el opuesto, y «horizontal» no significa nada si el triángulo está girado."
    },
    {
      "pregunta": "Un triángulo rectángulo está dibujado con la hipotenusa horizontal. El ángulo elegido está en el vértice izquierdo. ¿Cómo se reconoce el cateto opuesto?",
      "opciones": [
        "Es el cateto de abajo",
        "Es el cateto que no toca ese vértice",
        "Es el cateto más corto",
        "Es el cateto vertical"
      ],
      "respuesta": "Es el cateto que no toca ese vértice",
      "explicacion": "El opuesto es el que está frente al ángulo, es decir, el que no llega hasta su vértice. No depende de que esté arriba, abajo, vertical ni de su longitud."
    }
  ]
}$trigonometria$::jsonb,
  1,
  true),

('trigonometria-clase-02-seno-coseno-tangente', 'Seno, coseno y tangente',
  'Las tres razones básicas de un ángulo agudo como cocientes de lados, con SOH-CAH-TOA y ejemplos con números.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás escribir el seno, el coseno y la tangente de un ángulo agudo como cocientes de dos lados y calcularlos cuando se conocen los tres lados del triángulo rectángulo.",
    "Intuición. Dibuja dos triángulos rectángulos con el mismo ángulo agudo, uno chico y otro grande. Son semejantes: sus lados guardan las mismas proporciones, sin importar el tamaño. En un triángulo 3-4-5 el cateto opuesto es los $\\frac{3}{5}$ de la hipotenusa; en uno 6-8-10 también ($\\frac{6}{10}=\\frac{3}{5}$). Esa proporción solo depende del ángulo, y la trigonometría le pone nombre a esas proporciones.",
    "Definiciones. Para un ángulo agudo $A$ de un triángulo rectángulo: $\\operatorname{sen}(A)=\\dfrac{\\text{opuesto}}{\\text{hipotenusa}}$, $\\cos(A)=\\dfrac{\\text{adyacente}}{\\text{hipotenusa}}$ y $\\tan(A)=\\dfrac{\\text{opuesto}}{\\text{adyacente}}$. Se recuerdan con la frase SOH-CAH-TOA: Seno = Opuesto / Hipotenusa, Coseno = Adyacente / Hipotenusa, Tangente = Opuesto / Adyacente.",
    "Ejemplo resuelto con el triángulo 3-4-5 y el ángulo $A$ (opuesto 3, adyacente 4, hipotenusa 5): $\\operatorname{sen}(A)=\\dfrac{3}{5}=0{,}6$, $\\cos(A)=\\dfrac{4}{5}=0{,}8$ y $\\tan(A)=\\dfrac{3}{4}=0{,}75$.",
    "Ahora el otro ángulo, $B$: los papeles se intercambian (opuesto 4, adyacente 3). Entonces $\\operatorname{sen}(B)=\\dfrac{4}{5}=0{,}8$, $\\cos(B)=\\dfrac{3}{5}=0{,}6$ y $\\tan(B)=\\dfrac{4}{3}\\approx 1{,}33$. Fíjate: el seno de $A$ es igual al coseno de $B$.",
    "Propiedades útiles. La hipotenusa es el lado más largo, así que el seno y el coseno de un ángulo agudo siempre están entre 0 y 1. La tangente puede ser cualquier número positivo. Un seno o un coseno mayor que 1 es una señal de alarma: se puso la hipotenusa en el lugar equivocado.",
    "Errores comunes. 1) Poner el cociente al revés (por ejemplo, hipotenusa sobre opuesto): el resultado sería mayor que 1. 2) Usar la hipotenusa en la tangente: la tangente solo usa los dos catetos. 3) Escribir la razón con los lados respecto de otro ángulo: antes de escribirla, di en voz alta cuál es el opuesto y cuál el adyacente al ángulo pedido.",
    "Resumen. sen = opuesto ÷ hipotenusa; cos = adyacente ÷ hipotenusa; tan = opuesto ÷ adyacente. Solo dependen del ángulo, no del tamaño del triángulo."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.triangulo",
      "despuesDePaso": 2,
      "titulo": "Las tres razones del ángulo $A$",
      "catetos": [
        3,
        4
      ],
      "vertice": "A",
      "pasos": [
        "opuesto",
        "adyacente",
        "hipotenusa",
        "sen",
        "cos",
        "tan"
      ]
    },
    {
      "tipo": "trigonometria.triangulo",
      "despuesDePaso": 4,
      "titulo": "Las mismas razones desde el ángulo $B$",
      "catetos": [
        3,
        4
      ],
      "vertice": "B",
      "pasos": [
        "sen",
        "cos",
        "tan"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "En un triángulo rectángulo de lados 5, 12 y 13, el cateto de 5 está frente al ángulo $A$. ¿Cuánto vale $\\operatorname{sen}(A)$?",
      "opciones": [
        "$\\dfrac{12}{13}$",
        "$\\dfrac{5}{13}$",
        "$\\dfrac{5}{12}$",
        "$\\dfrac{13}{5}$"
      ],
      "respuesta": "$\\dfrac{5}{13}$",
      "explicacion": "El seno es opuesto sobre hipotenusa: el opuesto a $A$ es 5 y la hipotenusa 13. $\\frac{12}{13}$ es el coseno, $\\frac{5}{12}$ la tangente y $\\frac{13}{5}$ tiene la hipotenusa arriba."
    },
    {
      "pregunta": "En ese mismo triángulo (5, 12 y 13), ¿cuánto vale $\\cos(A)$?",
      "opciones": [
        "$\\dfrac{5}{13}$",
        "$\\dfrac{12}{13}$",
        "$\\dfrac{12}{5}$",
        "$\\dfrac{13}{12}$"
      ],
      "respuesta": "$\\dfrac{12}{13}$",
      "explicacion": "El coseno es adyacente sobre hipotenusa: el adyacente a $A$ es 12. $\\frac{5}{13}$ es el seno y $\\frac{12}{5}$ es una tangente (de $B$)."
    },
    {
      "pregunta": "Con el ángulo $B$ del mismo triángulo (opuesto 12, adyacente 5), ¿cuánto vale $\\tan(B)$?",
      "opciones": [
        "$\\dfrac{12}{5}$",
        "$\\dfrac{5}{12}$",
        "$\\dfrac{12}{13}$",
        "$\\dfrac{5}{13}$"
      ],
      "respuesta": "$\\dfrac{12}{5}$",
      "explicacion": "La tangente es opuesto sobre adyacente, y desde $B$ el opuesto es 12 y el adyacente 5. Con $\\frac{5}{12}$ se calcularía la tangente de $A$."
    },
    {
      "pregunta": "Un estudiante obtiene $\\operatorname{sen}(A)=1{,}3$ en un triángulo rectángulo. ¿Qué se puede afirmar?",
      "opciones": [
        "Es posible si el ángulo es grande",
        "Es correcto si el triángulo es muy grande",
        "Se equivocó: puso la hipotenusa abajo del cociente al revés; el seno de un ángulo agudo nunca pasa de 1",
        "Debió usar la tangente en lugar del seno"
      ],
      "respuesta": "Se equivocó: puso la hipotenusa abajo del cociente al revés; el seno de un ángulo agudo nunca pasa de 1",
      "explicacion": "La hipotenusa es el lado más largo, así que opuesto ÷ hipotenusa siempre es menor que 1. Un resultado como 1,3 indica que los lados se pusieron al revés. El tamaño del triángulo no cambia la razón."
    },
    {
      "pregunta": "En un triángulo rectángulo con el ángulo recto en $C$, ¿qué relación hay entre $\\operatorname{sen}(A)$ y $\\cos(B)$?",
      "opciones": [
        "Son recíprocos",
        "Son iguales",
        "Suman 1",
        "No tienen relación"
      ],
      "respuesta": "Son iguales",
      "explicacion": "El cateto opuesto a $A$ es el adyacente a $B$, y ambos se dividen entre la misma hipotenusa. Por eso $\\operatorname{sen}(A)=\\cos(B)$ (por ejemplo, ambos valen $\\frac{3}{5}$ en el triángulo 3-4-5)."
    }
  ]
}$trigonometria$::jsonb,
  2,
  true),

('trigonometria-clase-03-cosecante-secante-cotangente', 'Cosecante, secante y cotangente',
  'Las tres razones recíprocas: qué son, con cuál se emparejan y cómo se calculan con una calculadora que no tiene esas teclas.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar sabrás qué son la cosecante, la secante y la cotangente, con qué razón se emparejan cada una y cómo calcularlas con una calculadora normal.",
    "Intuición. Cada razón se puede «dar vuelta»: en lugar de opuesto sobre hipotenusa, hipotenusa sobre opuesto. Las tres razones dadas vuelta también tienen nombre. Se llaman recíprocas porque su producto con la original es 1.",
    "Definiciones: $\\operatorname{cosec}(A)=\\dfrac{1}{\\operatorname{sen}(A)}=\\dfrac{\\text{hipotenusa}}{\\text{opuesto}}$, $\\sec(A)=\\dfrac{1}{\\cos(A)}=\\dfrac{\\text{hipotenusa}}{\\text{adyacente}}$ y $\\cot(A)=\\dfrac{1}{\\tan(A)}=\\dfrac{\\text{adyacente}}{\\text{opuesto}}$.",
    "La trampa del nombre: la cosecante NO es la recíproca del coseno. Cada nombre está emparejado «en cruz»: la cosecante con el seno, la secante con el coseno. La cotangente sí se empareja con la tangente. Para no confundirte: la cosecante (que lleva «co») va con el seno (que no lo lleva), y la secante (sin «co») va con el coseno (con «co»).",
    "Ejemplo resuelto con el triángulo 3-4-5 y el ángulo $A$ (opuesto 3, adyacente 4, hipotenusa 5): la cosecante es $\\frac{5}{3}\\approx 1{,}67$, la secante es $\\frac{5}{4}=1{,}25$ y la cotangente es $\\frac{4}{3}\\approx 1{,}33$. Puedes comprobarlo: $1{,}67\\cdot\\operatorname{sen}(A)=1{,}67\\cdot 0{,}6\\approx 1$.",
    "En la calculadora no hay teclas para estas razones: se calculan con el botón de división. Por ejemplo, $\\cot(35^{\\circ})=\\dfrac{1}{\\tan(35^{\\circ})}=\\dfrac{1}{0{,}7002}\\approx 1{,}43$. Con calculadora en modo grados.",
    "Propiedades: en un ángulo agudo, la cosecante y la secante siempre son mayores que 1, porque la hipotenusa es el lado más largo y está arriba. La cotangente puede ser cualquier número positivo.",
    "Errores comunes. 1) Creer que la cosecante es la recíproca del coseno. 2) Confundir la recíproca con la función inversa: $\\operatorname{sen}^{-1}$ (el arcoseno) NO es $\\frac{1}{\\operatorname{sen}}$. La recíproca del seno es la cosecante. 3) Olvidar que $\\cot(A)$ es adyacente sobre opuesto (la tangente dada vuelta)."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.triangulo",
      "despuesDePaso": 4,
      "titulo": "Las recíprocas del ángulo $A$",
      "catetos": [
        3,
        4
      ],
      "vertice": "A",
      "pasos": [
        "cosec",
        "sec",
        "cot"
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 5,
      "titulo": "Cotangente de $35^{\\circ}$ con la calculadora",
      "cuadros": [
        {
          "texto": "No hay tecla de cotangente. Escribe la tangente y da vuelta el resultado.",
          "formula": "\\cot(35^{\\circ})=\\dfrac{1}{\\tan(35^{\\circ})}"
        },
        {
          "texto": "Con la calculadora en modo grados, $\\tan(35^{\\circ})\\approx 0{,}7002$.",
          "formula": "\\dfrac{1}{0{,}7002}"
        },
        {
          "texto": "Resultado:",
          "resaltar": "cot 35° ≈ 1,43"
        }
      ],
      "msPorCuadro": 2800
    }
  ],
  "quiz": [
    {
      "pregunta": "En un triángulo de lados 5, 12 y 13, el cateto de 5 está frente al ángulo $A$. ¿Cuánto vale $\\operatorname{cosec}(A)$?",
      "opciones": [
        "$\\dfrac{13}{12}\\approx 1{,}08$",
        "$\\dfrac{12}{5}=2{,}4$",
        "$\\dfrac{13}{5}=2{,}6$",
        "$\\dfrac{5}{13}\\approx 0{,}38$"
      ],
      "respuesta": "$\\dfrac{13}{5}=2{,}6$",
      "explicacion": "La cosecante es hipotenusa sobre opuesto: $\\frac{13}{5}$. $\\frac{13}{12}$ sería la secante, $\\frac{12}{5}$ la cotangente y $\\frac{5}{13}$ es el seno."
    },
    {
      "pregunta": "¿Cuál es la recíproca del coseno?",
      "opciones": [
        "La secante",
        "La cosecante",
        "La cotangente",
        "El arcocoseno"
      ],
      "respuesta": "La secante",
      "explicacion": "Los nombres se emparejan «en cruz»: secante con coseno y cosecante con seno. El arcocoseno es la función inversa, que no es lo mismo que la recíproca."
    },
    {
      "pregunta": "Con la calculadora en modo grados, ¿cuánto vale $\\cot(35^{\\circ})$?",
      "opciones": [
        "0,7",
        "1,74",
        "1,43",
        "1,22"
      ],
      "respuesta": "1,43",
      "explicacion": "La cotangente es 1 dividido entre la tangente: $\\frac{1}{0{,}7002}\\approx 1{,}43$. El valor 0,7 es la tangente, 1,74 es la cosecante y 1,22 la secante."
    },
    {
      "pregunta": "Si $\\tan(A)=\\dfrac{3}{4}$, ¿cuánto vale $\\cot(A)$?",
      "opciones": [
        "$\\dfrac{3}{5}$",
        "$\\dfrac{4}{3}$",
        "$-\\dfrac{3}{4}$",
        "$\\dfrac{5}{4}$"
      ],
      "respuesta": "$\\dfrac{4}{3}$",
      "explicacion": "La cotangente es la recíproca de la tangente: se da vuelta la fracción, $\\frac{4}{3}$. $\\frac{3}{5}$ sería el seno, y una razón positiva no cambia de signo al darla vuelta."
    },
    {
      "pregunta": "¿Qué significa $\\operatorname{sen}^{-1}(x)$ en una calculadora?",
      "opciones": [
        "La recíproca: $\\dfrac{1}{\\operatorname{sen}(x)}$",
        "El seno de $-x$",
        "La función inversa: el ángulo cuyo seno es $x$",
        "La razón entre el coseno y el seno"
      ],
      "respuesta": "La función inversa: el ángulo cuyo seno es $x$",
      "explicacion": "El exponente $-1$ en una función indica la función inversa (arcoseno), que devuelve un ángulo. La recíproca del seno es la cosecante. Son dos cosas distintas con una notación parecida."
    }
  ]
}$trigonometria$::jsonb,
  3,
  true),

('trigonometria-clase-04-hallar-un-lado', 'Hallar un lado',
  'Con un ángulo y un lado, el método de cuatro pasos para plantear y resolver la ecuación que da otro lado.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás hallar cualquier lado de un triángulo rectángulo cuando conoces un ángulo agudo y otro lado, planteando y resolviendo una ecuación con seno, coseno o tangente.",
    "Intuición. Si conoces un ángulo agudo, ya conoces la forma del triángulo (los otros ángulos quedan fijos). Solo falta el tamaño, y un lado lo da. La razón trigonométrica conecta el ángulo con dos lados: si conoces uno de los dos, puedes obtener el otro.",
    "El método, en cuatro pasos. 1) Dibuja el triángulo y marca el ángulo, el lado que conoces (dato) y el que buscas (incógnita). 2) Nombra esos dos lados respecto del ángulo (opuesto, adyacente o hipotenusa) y elige la razón que los usa: el lado que no interviene se ignora. 3) Escribe la ecuación. 4) Despeja y calcula con la calculadora en modo grados.",
    "Ejemplo 1. En un triángulo rectángulo, el ángulo $A$ mide $35^{\\circ}$ y la hipotenusa mide 12. ¿Cuánto mide el cateto opuesto $a$? Dato: hipotenusa; incógnita: opuesto. La razón que los usa es el seno: $\\operatorname{sen}(35^{\\circ})=\\dfrac{a}{12}$. Despejando: $a=12\\cdot\\operatorname{sen}(35^{\\circ})\\approx 12\\cdot 0{,}5736\\approx 6{,}88$. Como la incógnita está arriba, se multiplica.",
    "Ejemplo 2. Ahora el ángulo $A$ mide $52^{\\circ}$ y el cateto opuesto mide 8. ¿Cuánto mide la hipotenusa $c$? Dato: opuesto; incógnita: hipotenusa. Otra vez el seno: $\\operatorname{sen}(52^{\\circ})=\\dfrac{8}{c}$. Ahora la incógnita está abajo: $c=\\dfrac{8}{\\operatorname{sen}(52^{\\circ})}\\approx\\dfrac{8}{0{,}788}\\approx 10{,}15$. Regla práctica: si la incógnita está arriba se multiplica; si está abajo se divide.",
    "Cuidado con la calculadora. Debe estar en modo grados (DEG o D en la pantalla), no en radianes (RAD o R). En modo radianes, $\\operatorname{sen}(35)$ da $-0{,}43$ y el resultado sale mal. Si un seno de un ángulo agudo te da un número negativo, mira el modo de la calculadora.",
    "Comprueba siempre: la hipotenusa tiene que ser el lado más largo. En el ejemplo 1, el cateto (6,88) es menor que la hipotenusa (12), y en el ejemplo 2 la hipotenusa (10,15) es mayor que el cateto (8).",
    "Errores comunes. 1) Calculadora en radianes. 2) Multiplicar cuando hay que dividir (o al revés): revisa dónde quedó la incógnita. 3) Elegir la razón que usa el lado que no interviene: el lado que ni es dato ni es incógnita no aparece en la ecuación. 4) Redondear los valores intermedios: deja todos los decimales hasta el resultado final."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.resolver",
      "despuesDePaso": 3,
      "titulo": "Ejemplo 1: hallar el cateto opuesto",
      "modo": "lado",
      "angulo": 35,
      "dado": "c",
      "valor": 12,
      "pedido": "a"
    },
    {
      "tipo": "trigonometria.resolver",
      "despuesDePaso": 4,
      "titulo": "Ejemplo 2: hallar la hipotenusa",
      "modo": "lado",
      "angulo": 52,
      "dado": "a",
      "valor": 8,
      "pedido": "c"
    }
  ],
  "quiz": [
    {
      "pregunta": "En un triángulo rectángulo, $A=40^{\\circ}$ y la hipotenusa mide 15. ¿Cuánto mide el cateto opuesto a $A$?",
      "opciones": [
        "11,49",
        "23,34",
        "9,64",
        "12,59"
      ],
      "respuesta": "9,64",
      "explicacion": "Dato y incógnita son hipotenusa y opuesto: seno. $a=15\\cdot\\operatorname{sen}(40^{\\circ})\\approx 9{,}64$. El valor 11,49 es 15·cos 40° (el adyacente), 23,34 divide en lugar de multiplicar y 12,59 usa la tangente."
    },
    {
      "pregunta": "Conoces el cateto adyacente a un ángulo y quieres hallar la hipotenusa. ¿Qué razón usas?",
      "opciones": [
        "El coseno",
        "El seno",
        "La tangente",
        "Ninguna: faltan datos"
      ],
      "respuesta": "El coseno",
      "explicacion": "Adyacente e hipotenusa son los dos lados del coseno (adyacente ÷ hipotenusa). El seno usa el opuesto y la tangente no usa la hipotenusa."
    },
    {
      "pregunta": "Al calcular $\\operatorname{sen}(35^{\\circ})$ la calculadora muestra $-0{,}43$. ¿Qué pasó?",
      "opciones": [
        "El seno de un ángulo agudo puede ser negativo",
        "Falta apretar la tecla de segunda función",
        "Está en modo radianes: hay que pasarla a grados (DEG)",
        "El ángulo es demasiado grande para el seno"
      ],
      "respuesta": "Está en modo radianes: hay que pasarla a grados (DEG)",
      "explicacion": "En modo radianes la calculadora interpreta 35 como 35 radianes y da $-0{,}43$. El seno de un ángulo agudo es siempre positivo; con la calculadora en grados da $0{,}57$."
    },
    {
      "pregunta": "Si $\\cos(25^{\\circ})=\\dfrac{6}{c}$, ¿cuánto vale $c$?",
      "opciones": [
        "5,44",
        "6,62",
        "2,54",
        "14,2"
      ],
      "respuesta": "6,62",
      "explicacion": "La incógnita está abajo, así que se divide: $c=\\frac{6}{\\cos(25^{\\circ})}\\approx 6{,}62$. El valor 5,44 multiplica en lugar de dividir y 14,2 usa el seno en lugar del coseno."
    },
    {
      "pregunta": "El cateto adyacente a un ángulo de $32^{\\circ}$ mide 10. ¿Cuánto mide el cateto opuesto?",
      "opciones": [
        "16",
        "5,3",
        "8,48",
        "6,25"
      ],
      "respuesta": "6,25",
      "explicacion": "Dato: adyacente; incógnita: opuesto. Los dos catetos usan la tangente: $\\tan(32^{\\circ})=\\frac{a}{10}$, de donde $a=10\\cdot\\tan(32^{\\circ})\\approx 6{,}25$."
    }
  ]
}$trigonometria$::jsonb,
  4,
  true),

('trigonometria-clase-05-hallar-un-angulo', 'Hallar un ángulo: las razones inversas',
  'Cuando el ángulo es la incógnita: seno, coseno y tangente inversos, con la calculadora y con un triángulo de dos lados dados.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás hallar un ángulo agudo de un triángulo rectángulo a partir de dos de sus lados, usando la función inversa correcta en la calculadora.",
    "Intuición. Hasta ahora el ángulo era un dato y se calculaba un lado. Ahora es al revés: conoces dos lados, así que conoces una razón, y quieres saber qué ángulo tiene esa razón. Si $\\operatorname{sen}(A)=0{,}6$, ¿qué ángulo es $A$? La función que «deshace» el seno se llama seno inverso o arcoseno.",
    "Notación. El seno inverso se escribe $\\operatorname{sen}^{-1}$ (o arcsen), el coseno inverso $\\cos^{-1}$ (o arccos) y la tangente inversa $\\tan^{-1}$ (o arctan). En la calculadora, se usa la tecla de segunda función (SHIFT o 2ND) más la tecla de la razón. Ojo: $\\operatorname{sen}^{-1}(x)$ NO es $\\frac{1}{\\operatorname{sen}(x)}$; eso es la cosecante.",
    "Ejemplo resuelto. Un triángulo rectángulo tiene catetos de 3 y 4. Hallar el ángulo $A$ opuesto al cateto de 3. Los dos lados son opuesto y adyacente: tangente. $\\tan(A)=\\dfrac{3}{4}$, así que $A=\\tan^{-1}\\!\\left(\\dfrac{3}{4}\\right)\\approx 36{,}9^{\\circ}$. El otro ángulo agudo es $B=90^{\\circ}-36,9^{\\circ}=53,1^{\\circ}$.",
    "Cuál inversa usar: mira los dos lados que conoces. Opuesto e hipotenusa: $\\operatorname{sen}^{-1}$. Adyacente e hipotenusa: $\\cos^{-1}$. Opuesto y adyacente: $\\tan^{-1}$. Es la misma elección de razón que al hallar un lado; solo cambia que al final usas la inversa.",
    "Un ejemplo con contexto. Una rampa de 5 m llega a una altura de 1,2 m. El ángulo con el suelo tiene el lado de 1,2 m como opuesto y el de 5 m como hipotenusa, así que se usa el seno inverso: $\\operatorname{sen}^{-1}\\!\\left(\\frac{1{,}2}{5}\\right)\\approx 13{,}9^{\\circ}$.",
    "Una simplificación del colegio. En un triángulo rectángulo el ángulo agudo siempre está entre $0^{\\circ}$ y $90^{\\circ}$, y las tres inversas de la calculadora dan justo un ángulo en ese rango. Cuando más adelante resuelvas ecuaciones con ángulos mayores, la calculadora seguirá dando solo UNA solución y habrá que buscar las demás.",
    "Errores comunes. 1) Usar $\\frac{1}{\\operatorname{sen}}$ en lugar de $\\operatorname{sen}^{-1}$. 2) Elegir la inversa equivocada por confundir el opuesto con el adyacente. 3) Obtener un error al calcular $\\operatorname{sen}^{-1}(1{,}2)$: ningún ángulo tiene seno mayor que 1, así que seguramente se dividió al revés (hipotenusa sobre cateto). 4) Trabajar con la calculadora en radianes."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.resolver",
      "despuesDePaso": 3,
      "titulo": "Hallar el ángulo con catetos de 3 y 4",
      "modo": "angulo",
      "lados": [
        {
          "lado": "a",
          "valor": 3
        },
        {
          "lado": "b",
          "valor": 4
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "Si $\\operatorname{sen}(A)=0{,}5$ y $A$ es agudo, ¿cuánto mide $A$?",
      "opciones": [
        "$60^{\\circ}$",
        "$45^{\\circ}$",
        "$0{,}5^{\\circ}$",
        "$30^{\\circ}$"
      ],
      "respuesta": "$30^{\\circ}$",
      "explicacion": "El seno inverso de 0,5 es $30^{\\circ}$ (el triángulo de $30^{\\circ}$ tiene el cateto opuesto igual a la mitad de la hipotenusa). $60^{\\circ}$ tiene seno 0,87 y $45^{\\circ}$ tiene seno 0,71."
    },
    {
      "pregunta": "Un triángulo rectángulo tiene catetos de 5 y 12. ¿Cuánto mide el ángulo opuesto al cateto de 5, redondeado a un decimal?",
      "opciones": [
        "$22{,}6^{\\circ}$",
        "$67{,}4^{\\circ}$",
        "$24{,}6^{\\circ}$",
        "$0{,}42^{\\circ}$"
      ],
      "respuesta": "$22{,}6^{\\circ}$",
      "explicacion": "Son dos catetos, opuesto y adyacente: tangente inversa. $\\tan^{-1}(5/12)\\approx 22{,}6^{\\circ}$. El ángulo de 67,4° es el otro ángulo agudo (el opuesto al 12), y 24,6° usó el seno con un cateto."
    },
    {
      "pregunta": "La calculadora da error al calcular $\\operatorname{sen}^{-1}(1{,}2)$. ¿Por qué?",
      "opciones": [
        "La calculadora está en radianes",
        "El ángulo es mayor que $90^{\\circ}$",
        "Ningún ángulo tiene seno mayor que 1: seguramente se dividió al revés",
        "Hay que usar el coseno inverso"
      ],
      "respuesta": "Ningún ángulo tiene seno mayor que 1: seguramente se dividió al revés",
      "explicacion": "El seno de cualquier ángulo está entre $-1$ y $1$. Un cociente mayor que 1 indica que se puso la hipotenusa (el lado más largo) en el numerador."
    },
    {
      "pregunta": "¿Es lo mismo $\\operatorname{sen}^{-1}(x)$ que $\\dfrac{1}{\\operatorname{sen}(x)}$?",
      "opciones": [
        "Sí, son dos formas de escribir lo mismo",
        "Sí, pero solo para ángulos agudos",
        "No: la primera es la función inversa (devuelve un ángulo) y la segunda la cosecante",
        "No: la primera es la tangente"
      ],
      "respuesta": "No: la primera es la función inversa (devuelve un ángulo) y la segunda la cosecante",
      "explicacion": "$\\operatorname{sen}^{-1}(x)$ es el ángulo cuyo seno es $x$; $\\frac{1}{\\operatorname{sen}(x)}$ es un número, la cosecante del ángulo $x$. Notación parecida, significados distintos."
    },
    {
      "pregunta": "Una rampa de 5 m de largo llega a 1,2 m de altura. ¿Qué ángulo forma con el suelo (un decimal)?",
      "opciones": [
        "$13{,}9^{\\circ}$",
        "$13{,}5^{\\circ}$",
        "$76{,}1^{\\circ}$",
        "$0{,}24^{\\circ}$"
      ],
      "respuesta": "$13{,}9^{\\circ}$",
      "explicacion": "El largo de la rampa es la hipotenusa y la altura es el opuesto: seno inverso, $\\operatorname{sen}^{-1}(1{,}2/5)\\approx 13{,}9^{\\circ}$. La tangente inversa daría 13,5° (tratando el largo como si fuera el adyacente) y 76,1° es el ángulo del extremo de arriba."
    }
  ]
}$trigonometria$::jsonb,
  5,
  true),

('trigonometria-clase-06-triangulos-especiales', 'Triángulos especiales: 45-45-90 y 30-60-90',
  'El medio cuadrado y el medio equilátero: de dónde salen los valores exactos de 30°, 45° y 60° sin calculadora.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás obtener, dibujando un triángulo, los valores exactos del seno, el coseno y la tangente de $30^{\\circ}$, $45^{\\circ}$ y $60^{\\circ}$, sin calculadora y sin memorizarlos a ciegas.",
    "Intuición. Hay dos triángulos rectángulos con lados tan «limpios» que las razones salen exactas: el que sale de cortar un cuadrado por su diagonal y el que sale de cortar un triángulo equilátero por su altura.",
    "Medio cuadrado ($45^{\\circ}$-$45^{\\circ}$-$90^{\\circ}$). Un cuadrado de lado 1 se corta por su diagonal. Quedan dos triángulos con catetos 1 y 1, y por Pitágoras la hipotenusa es $\\sqrt{2}$. Los dos ángulos agudos son iguales: $45^{\\circ}$. Entonces $\\operatorname{sen}(45^{\\circ})=\\dfrac{1}{\\sqrt{2}}=\\dfrac{\\sqrt{2}}{2}$, $\\cos(45^{\\circ})=\\dfrac{\\sqrt{2}}{2}$ y $\\tan(45^{\\circ})=1$. (Se «racionaliza» multiplicando arriba y abajo por $\\sqrt{2}$.)",
    "Medio equilátero ($30^{\\circ}$-$60^{\\circ}$-$90^{\\circ}$). Un triángulo equilátero de lado 2 se corta por su altura. Quedan dos triángulos rectángulos con hipotenusa 2, un cateto de 1 (la mitad de la base) y el otro cateto de $\\sqrt{3}$ (por Pitágoras, $2^{2}-1^{2}=3$). El cateto de 1 está frente al ángulo menor, $30^{\\circ}$: $\\operatorname{sen}(30^{\\circ})=\\dfrac{1}{2}$, $\\cos(30^{\\circ})=\\dfrac{\\sqrt{3}}{2}$ y $\\tan(30^{\\circ})=\\dfrac{1}{\\sqrt{3}}=\\dfrac{\\sqrt{3}}{3}$.",
    "Para $60^{\\circ}$ solo se cambia de ángulo en el mismo triángulo: el opuesto pasa a ser $\\sqrt{3}$ y el adyacente 1. Entonces $\\operatorname{sen}(60^{\\circ})=\\dfrac{\\sqrt{3}}{2}$, $\\cos(60^{\\circ})=\\dfrac{1}{2}$ y $\\tan(60^{\\circ})=\\sqrt{3}$. Observa que el seno de $30^{\\circ}$ es el coseno de $60^{\\circ}$.",
    "La tabla completa, para tenerla a la vista: $30^{\\circ}$: seno $\\frac{1}{2}$, coseno $\\frac{\\sqrt{3}}{2}$, tangente $\\frac{\\sqrt{3}}{3}$. $45^{\\circ}$: seno $\\frac{\\sqrt{2}}{2}$, coseno $\\frac{\\sqrt{2}}{2}$, tangente $1$. $60^{\\circ}$: seno $\\frac{\\sqrt{3}}{2}$, coseno $\\frac{1}{2}$, tangente $\\sqrt{3}$.",
    "Ejemplo resuelto. Un triángulo rectángulo tiene un ángulo de $30^{\\circ}$ y su hipotenusa mide 10. ¿Cuánto mide el cateto opuesto? Como $\\operatorname{sen}(30^{\\circ})=\\frac{1}{2}$, el cateto opuesto es la mitad de la hipotenusa: 5. Otro: la diagonal de un cuadrado de lado 4 es la hipotenusa de un triángulo 45-45-90 con catetos 4, así que mide $4\\sqrt{2}\\approx 5{,}66$.",
    "Errores comunes. 1) Confundir $\\frac{1}{2}$ y $\\frac{\\sqrt{3}}{2}$ entre $30^{\\circ}$ y $60^{\\circ}$: el ángulo menor tiene el seno menor (frente al lado más corto). 2) Olvidar que $\\frac{1}{\\sqrt{3}}$ y $\\frac{\\sqrt{3}}{3}$ valen lo mismo. 3) Confundir la tangente con el seno de $45^{\\circ}$: el seno vale $\\frac{\\sqrt{2}}{2}$, pero la tangente, con catetos iguales, vale 1."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.triangulo",
      "despuesDePaso": 2,
      "titulo": "Medio cuadrado: catetos 1 y 1",
      "catetos": [
        1,
        1
      ],
      "vertice": "A",
      "pasos": [
        "opuesto",
        "adyacente",
        "hipotenusa",
        "sen",
        "cos",
        "tan"
      ]
    },
    {
      "tipo": "trigonometria.triangulo",
      "despuesDePaso": 3,
      "titulo": "Medio equilátero: catetos 1 y $\\sqrt{3}$",
      "catetos": [
        1,
        1.7321
      ],
      "vertice": "A",
      "pasos": [
        "opuesto",
        "adyacente",
        "hipotenusa",
        "sen",
        "cos",
        "tan"
      ]
    },
    {
      "tipo": "trigonometria.triangulo",
      "despuesDePaso": 4,
      "titulo": "El mismo triángulo visto desde el ángulo de $60^{\\circ}$",
      "catetos": [
        1,
        1.7321
      ],
      "vertice": "B",
      "pasos": [
        "sen",
        "cos",
        "tan"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto vale $\\cos(60^{\\circ})$?",
      "opciones": [
        "$\\frac{\\sqrt{3}}{2}$",
        "$\\frac{1}{2}$",
        "$\\frac{\\sqrt{2}}{2}$",
        "$\\sqrt{3}$"
      ],
      "respuesta": "$\\frac{1}{2}$",
      "explicacion": "En el triángulo 30-60-90 (1, $\\sqrt{3}$, 2), el cateto adyacente a $60^{\\circ}$ es 1 y la hipotenusa 2: $\\cos(60^{\\circ})=\\frac{1}{2}$. $\\frac{\\sqrt{3}}{2}$ es el coseno de $30^{\\circ}$."
    },
    {
      "pregunta": "¿Cuánto vale $\\tan(30^{\\circ})$?",
      "opciones": [
        "$\\frac{\\sqrt{3}}{3}$",
        "$\\sqrt{3}$",
        "$\\frac{1}{2}$",
        "$\\frac{\\sqrt{3}}{2}$"
      ],
      "respuesta": "$\\frac{\\sqrt{3}}{3}$",
      "explicacion": "Frente a $30^{\\circ}$ está el cateto de 1 y al lado el de $\\sqrt{3}$: $\\tan(30^{\\circ})=\\frac{1}{\\sqrt{3}}=\\frac{\\sqrt{3}}{3}$. $\\sqrt{3}$ es la tangente de $60^{\\circ}$."
    },
    {
      "pregunta": "¿Cuánto vale $\\operatorname{sen}(45^{\\circ})$?",
      "opciones": [
        "$\\frac{\\sqrt{2}}{2}$",
        "$\\dfrac{1}{2}$",
        "$1$",
        "$\\sqrt{2}$"
      ],
      "respuesta": "$\\frac{\\sqrt{2}}{2}$",
      "explicacion": "Con catetos 1 y 1 la hipotenusa es $\\sqrt{2}$ y el seno es $\\frac{1}{\\sqrt{2}}=\\frac{\\sqrt{2}}{2}$. El seno de un ángulo agudo es menor que 1, así que $1$ y $\\sqrt{2}$ no pueden ser; $\\frac{1}{2}$ es el seno de $30^{\\circ}$."
    },
    {
      "pregunta": "Un triángulo rectángulo tiene un ángulo de $30^{\\circ}$ y la hipotenusa mide 10. ¿Cuánto mide el cateto opuesto a ese ángulo?",
      "opciones": [
        "$5\\sqrt{3}\\approx 8{,}66$",
        "$10\\sqrt{3}\\approx 17{,}32$",
        "5",
        "$10$"
      ],
      "respuesta": "5",
      "explicacion": "Como $\\operatorname{sen}(30^{\\circ})=\\frac{1}{2}$, el opuesto a $30^{\\circ}$ es la mitad de la hipotenusa: 5. $5\\sqrt{3}$ sería el cateto adyacente."
    },
    {
      "pregunta": "¿Cuánto mide la diagonal de un cuadrado de lado 4?",
      "opciones": [
        "$8$",
        "$4\\sqrt{2}\\approx 5{,}66$",
        "$4$",
        "$2\\sqrt{2}\\approx 2{,}83$"
      ],
      "respuesta": "$4\\sqrt{2}\\approx 5{,}66$",
      "explicacion": "La diagonal es la hipotenusa de un triángulo 45-45-90 de catetos 4: es el cateto por $\\sqrt{2}$, es decir, $4\\sqrt{2}$. Por Pitágoras: $\\sqrt{16+16}=\\sqrt{32}\\approx 5{,}66$."
    }
  ]
}$trigonometria$::jsonb,
  6,
  true),

('trigonometria-clase-07-elevacion-y-depresion', 'Ángulos de elevación y de depresión',
  'Problemas con enunciado: medir desde la horizontal, dibujar el triángulo y decidir qué razón usar.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás resolver problemas de alturas y distancias que hablan de ángulos de elevación y de depresión, dibujando primero el triángulo rectángulo.",
    "Intuición y definiciones. Ambos ángulos se miden desde una línea horizontal imaginaria, que sale del ojo del observador. El ángulo de elevación es el que se forma al mirar hacia ARRIBA (la línea de la visual sube). El ángulo de depresión es el que se forma al mirar hacia ABAJO (la visual baja).",
    "Una propiedad muy útil. Si desde lo alto de un edificio miras un objeto en el suelo con un ángulo de depresión de $25^{\\circ}$, el ángulo en el suelo, entre el piso y la visual hacia el edificio, también mide $25^{\\circ}$: son ángulos alternos internos entre dos horizontales paralelas. Así, el triángulo rectángulo que dibujas tiene ese ángulo en la base.",
    "Ejemplo 1 (elevación). Desde un punto a 40 m de la base de una torre, la cima se ve con un ángulo de elevación de $35^{\\circ}$. ¿Qué altura tiene la torre? El adyacente al ángulo es 40 (la distancia al suelo) y el opuesto es la altura: tangente. $\\tan(35^{\\circ})=\\dfrac{h}{40}$, así que $h=40\\cdot\\tan(35^{\\circ})\\approx 28{,}01\\ \\text{m}$.",
    "Ejemplo 2 (depresión). Desde lo alto de un faro de 60 m, un bote se ve con un ángulo de depresión de $25^{\\circ}$. ¿A qué distancia horizontal de la base del faro está el bote? En el triángulo, el ángulo de $25^{\\circ}$ está en el bote; el opuesto es la altura del faro (60) y el adyacente es la distancia buscada $d$: $\\tan(25^{\\circ})=\\dfrac{60}{d}$, así que $d=\\dfrac{60}{\\tan(25^{\\circ})}\\approx 128{,}67\\ \\text{m}$.",
    "Si el observador tiene estatura. La visual sale de sus ojos, no del suelo: la altura total es la que calculas más la altura de los ojos. Por ejemplo, con ojos a 1,7 m y $h=10$ m calculados desde el nivel de los ojos, el objeto mide 11,7 m.",
    "Errores comunes. 1) Medir el ángulo de depresión desde la vertical o desde el suelo del observador: siempre se mide desde la horizontal. 2) Poner el ángulo de depresión en el vértice de arriba del triángulo en lugar de en el de abajo (son iguales por ángulos alternos, pero el triángulo se arma con el de abajo). 3) Olvidar sumar la estatura del observador. 4) Usar el seno o el coseno cuando conoces las dos distancias horizontal y vertical: son los dos catetos, así que va la tangente."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.resolver",
      "despuesDePaso": 3,
      "titulo": "Ejemplo 1: altura de una torre",
      "modo": "lado",
      "angulo": 35,
      "dado": "b",
      "valor": 40,
      "pedido": "a"
    },
    {
      "tipo": "trigonometria.resolver",
      "despuesDePaso": 4,
      "titulo": "Ejemplo 2: distancia a un bote desde un faro",
      "modo": "lado",
      "angulo": 25,
      "dado": "a",
      "valor": 60,
      "pedido": "b"
    }
  ],
  "quiz": [
    {
      "pregunta": "Desde un punto a 50 m de la base de una torre, el ángulo de elevación de la cima es de $30^{\\circ}$. ¿Qué altura tiene la torre (ignora la estatura de quien mira)?",
      "opciones": [
        "86,6",
        "28,87",
        "25",
        "43,3"
      ],
      "respuesta": "28,87",
      "explicacion": "La distancia (50) es el adyacente y la altura es el opuesto: $h=50\\cdot\\tan(30^{\\circ})\\approx 28{,}87$ m. El valor 86,6 divide en lugar de multiplicar."
    },
    {
      "pregunta": "Desde lo alto de un acantilado de 80 m, el ángulo de depresión de un bote es de $20^{\\circ}$. ¿A qué distancia horizontal de la base está el bote?",
      "opciones": [
        "219,8",
        "29,12",
        "233,9",
        "75,18"
      ],
      "respuesta": "219,8",
      "explicacion": "El ángulo de $20^{\\circ}$ también está en el bote; la altura (80) es el opuesto y la distancia el adyacente: $d=\\frac{80}{\\tan(20^{\\circ})}\\approx 219{,}8$ m. El valor 233,9 es la distancia en línea recta (la visual), no la horizontal."
    },
    {
      "pregunta": "El ángulo de depresión se mide…",
      "opciones": [
        "desde la vertical hacia abajo",
        "desde el suelo hacia arriba",
        "desde la horizontal hacia abajo",
        "desde la base del objeto hasta los ojos"
      ],
      "respuesta": "desde la horizontal hacia abajo",
      "explicacion": "Elevación y depresión se miden siempre respecto de la línea horizontal que sale del ojo del observador: hacia arriba, elevación; hacia abajo, depresión."
    },
    {
      "pregunta": "Una persona con los ojos a 1,7 m del suelo está a 12 m de un árbol y ve la copa con un ángulo de elevación de $40^{\\circ}$. ¿Qué altura tiene el árbol?",
      "opciones": [
        "10,07",
        "16",
        "11,77",
        "9,41"
      ],
      "respuesta": "11,77",
      "explicacion": "Desde los ojos, la copa sube $12\\cdot\\tan(40^{\\circ})\\approx 10{,}07$ m, y a eso se le suman los 1,7 m de altura de los ojos: $11{,}77$ m. El valor 10,07 olvida la estatura."
    },
    {
      "pregunta": "Desde un faro, el ángulo de depresión de un bote es de $25^{\\circ}$. ¿Cuánto mide el ángulo del triángulo en el bote, entre el agua y la visual hacia el faro?",
      "opciones": [
        "$65^{\\circ}$",
        "$155^{\\circ}$",
        "$25^{\\circ}$",
        "$90^{\\circ}$"
      ],
      "respuesta": "$25^{\\circ}$",
      "explicacion": "Son ángulos alternos internos entre dos rectas paralelas (la horizontal del faro y el nivel del agua): miden lo mismo, $25^{\\circ}$. $65^{\\circ}$ es el ángulo en la cima entre la visual y la vertical."
    }
  ]
}$trigonometria$::jsonb,
  7,
  true),

('trigonometria-clase-08-angulos-cuadrantes-coterminales', 'Ángulos en el plano: cuadrantes y coterminales',
  'Ángulos de cualquier tamaño (positivos, negativos, de más de una vuelta), su posición estándar y los que terminan en el mismo lugar.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás ubicar en el plano cualquier ángulo (positivo, negativo o de más de una vuelta), decir en qué cuadrante termina y encontrar otros ángulos que terminan en el mismo lugar.",
    "Intuición. Hasta ahora los ángulos vivían dentro de un triángulo, entre $0^{\\circ}$ y $90^{\\circ}$. Pero una rueda, un aspa o una persona que da media vuelta giran cualquier cantidad. Para hablar de esos giros, un ángulo se piensa como una rotación: cuánto se gira y en qué sentido.",
    "Posición estándar. El ángulo se dibuja en el plano cartesiano con el vértice en el origen. Su lado inicial es el semieje $x$ positivo; el lado terminal se obtiene girando. Si el giro es en sentido contrario a las agujas del reloj (antihorario), el ángulo es positivo; si es en el sentido de las agujas del reloj (horario), es negativo.",
    "Cuadrantes. Los ejes dividen el plano en cuatro cuadrantes, numerados en sentido antihorario: I ($0^{\\circ}$ a $90^{\\circ}$), II ($90^{\\circ}$ a $180^{\\circ}$), III ($180^{\\circ}$ a $270^{\\circ}$) y IV ($270^{\\circ}$ a $360^{\\circ}$). Los ángulos de $0^{\\circ}$, $90^{\\circ}$, $180^{\\circ}$ y $270^{\\circ}$ caen sobre los ejes y no pertenecen a ningún cuadrante.",
    "Ángulos negativos y de más de una vuelta. El ángulo $-60^{\\circ}$ gira $60^{\\circ}$ en sentido horario y termina en el cuadrante IV. El ángulo $390^{\\circ}$ da una vuelta completa ($360^{\\circ}$) y sigue otros $30^{\\circ}$: termina en el mismo lugar que $30^{\\circ}$.",
    "Ángulos coterminales. Dos ángulos son coterminales si tienen el mismo lado terminal. Se obtienen sumando o restando vueltas completas: $\\theta+360^{\\circ}\\cdot k$, con $k$ entero. Por ejemplo, $30^{\\circ}$, $390^{\\circ}$ y $-330^{\\circ}$ son coterminales. Todos terminan en el mismo punto, así que después tendrán las mismas razones trigonométricas.",
    "Ejemplo resuelto. ¿En qué cuadrante termina un ángulo de $1000^{\\circ}$? Se le restan vueltas completas hasta quedar entre $0^{\\circ}$ y $360^{\\circ}$: $1000-2\\cdot 360=280$, así que es coterminal con $280^{\\circ}$, que está entre $270^{\\circ}$ y $360^{\\circ}$: cuadrante IV.",
    "Errores comunes. 1) Girar en el sentido equivocado con un ángulo negativo. 2) Restar $180^{\\circ}$ en lugar de $360^{\\circ}$: una vuelta completa son $360^{\\circ}$. 3) Pensar que los ángulos negativos «no existen» o que un ángulo de más de $360^{\\circ}$ es un error: son giros válidos."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.circulo",
      "despuesDePaso": 3,
      "titulo": "Un ángulo en cada cuadrante",
      "angulos": [
        30,
        120,
        210,
        300
      ],
      "unidad": "grados",
      "valores": false
    },
    {
      "tipo": "trigonometria.circulo",
      "despuesDePaso": 4,
      "titulo": "Un giro horario y un giro de más de una vuelta",
      "angulos": [
        -60,
        390
      ],
      "unidad": "grados",
      "valores": false
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 6,
      "titulo": "En qué cuadrante termina un ángulo de 1000°",
      "cuadros": [
        {
          "texto": "Cuenta las vueltas completas que caben en el ángulo.",
          "formula": "1000\\div 360\\approx 2{,}78\\ \\Rightarrow\\ 2\\ \\text{vueltas}"
        },
        {
          "texto": "Réstalas.",
          "formula": "1000-2\\cdot 360=280"
        },
        {
          "texto": "Ubica 280° entre 270° y 360°.",
          "resaltar": "Cuadrante 4"
        }
      ],
      "msPorCuadro": 2800
    }
  ],
  "quiz": [
    {
      "pregunta": "¿En qué cuadrante termina un ángulo de $150^{\\circ}$?",
      "opciones": [
        "Cuadrante I",
        "Cuadrante III",
        "Cuadrante II",
        "Cuadrante IV"
      ],
      "respuesta": "Cuadrante II",
      "explicacion": "$150^{\\circ}$ está entre $90^{\\circ}$ y $180^{\\circ}$: cuadrante II."
    },
    {
      "pregunta": "El ángulo $-60^{\\circ}$ representa…",
      "opciones": [
        "un giro de $60^{\\circ}$ en sentido antihorario",
        "un giro de $-60$ vueltas",
        "un giro de $60^{\\circ}$ en sentido horario",
        "un ángulo imposible"
      ],
      "respuesta": "un giro de $60^{\\circ}$ en sentido horario",
      "explicacion": "El signo indica el sentido: positivo, antihorario; negativo, horario. Por eso $-60^{\\circ}$ termina en el cuadrante IV, igual que $300^{\\circ}$."
    },
    {
      "pregunta": "¿Cuál es el ángulo coterminal con $780^{\\circ}$ que está entre $0^{\\circ}$ y $360^{\\circ}$?",
      "opciones": [
        "$60^{\\circ}$",
        "$420^{\\circ}$",
        "$300^{\\circ}$",
        "$120^{\\circ}$"
      ],
      "respuesta": "$60^{\\circ}$",
      "explicacion": "Se restan dos vueltas: $780-720=60$. El valor $420^{\\circ}$ solo resta una vuelta (y sigue siendo mayor que $360^{\\circ}$) y $300^{\\circ}$ es el reflejo $360^{\\circ}-60^{\\circ}$."
    },
    {
      "pregunta": "¿Cuál de estos ángulos es coterminal con $30^{\\circ}$?",
      "opciones": [
        "$210^{\\circ}$",
        "$-30^{\\circ}$",
        "$150^{\\circ}$",
        "$-330^{\\circ}$"
      ],
      "respuesta": "$-330^{\\circ}$",
      "explicacion": "$-330^{\\circ}+360^{\\circ}=30^{\\circ}$: terminan en el mismo lugar. $-30^{\\circ}$ termina en el cuadrante IV y $150^{\\circ}$ en el II."
    },
    {
      "pregunta": "El ángulo de $270^{\\circ}$ está…",
      "opciones": [
        "en el cuadrante III",
        "en el cuadrante IV",
        "sobre el semieje $x$ negativo",
        "sobre el semieje $y$ negativo, sin pertenecer a ningún cuadrante"
      ],
      "respuesta": "sobre el semieje $y$ negativo, sin pertenecer a ningún cuadrante",
      "explicacion": "Los ángulos de $0^{\\circ}$, $90^{\\circ}$, $180^{\\circ}$ y $270^{\\circ}$ caen sobre los ejes. $270^{\\circ}$ es tres cuartos de vuelta: el semieje $y$ negativo."
    }
  ]
}$trigonometria$::jsonb,
  1,
  true),

('trigonometria-clase-09-radianes', 'Radianes',
  'Qué es un radián, la regla π = 180° para convertir en los dos sentidos y los ángulos que más se usan.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar entenderás qué es un radián, sabrás convertir entre grados y radianes con la regla $\\pi=180^{\\circ}$ y reconocerás los ángulos de uso frecuente en radianes.",
    "Intuición. Los grados son una convención humana: una vuelta se partió en 360 pedazos. El radián nace del propio círculo: un ángulo mide 1 radián cuando el arco que abarca mide lo mismo que el radio. Como la circunferencia mide $2\\pi$ veces el radio, en una vuelta completa caben $2\\pi$ radianes.",
    "La regla que necesitas: una vuelta completa son $360^{\\circ}=2\\pi$ radianes, y media vuelta es $180^{\\circ}=\\pi$ radianes. Todo lo demás sale de ahí: $90^{\\circ}$ es un cuarto de vuelta, $\\frac{\\pi}{2}$ radianes.",
    "Convertir. De grados a radianes se multiplica por $\\frac{\\pi}{180}$; de radianes a grados se multiplica por $\\frac{180}{\\pi}$. Es una regla de tres con $\\pi=180^{\\circ}$. Se suele dejar el resultado en fracciones de $\\pi$, sin pasar a decimales.",
    "Ejemplo resuelto. De grados a radianes: $150^{\\circ}=150\\cdot\\frac{\\pi}{180}=\\frac{5\\pi}{6}$ (se simplifica $\\frac{150}{180}=\\frac{5}{6}$). De radianes a grados: $\\frac{3\\pi}{4}=\\frac{3}{4}\\cdot 180^{\\circ}=135^{\\circ}$. Y para $\\frac{7\\pi}{6}$: $\\frac{7\\pi}{6}=\\dfrac{7}{6}\\cdot 180^{\\circ}=210^{\\circ}$.",
    "Los ángulos de uso frecuente, para tener a la vista: $30^{\\circ}=\\frac{\\pi}{6}$, $45^{\\circ}=\\frac{\\pi}{4}$, $60^{\\circ}=\\frac{\\pi}{3}$, $90^{\\circ}=\\frac{\\pi}{2}$, $120^{\\circ}=\\frac{2\\pi}{3}$, $135^{\\circ}=\\frac{3\\pi}{4}$, $150^{\\circ}=\\frac{5\\pi}{6}$, $180^{\\circ}=\\pi$, $270^{\\circ}=\\frac{3\\pi}{2}$ y $360^{\\circ}=2\\pi$. Los demás se arman sumando: $210^{\\circ}=180^{\\circ}+30^{\\circ}=\\pi+\\frac{\\pi}{6}=\\frac{7\\pi}{6}$.",
    "Un radián son unos 57,3 grados (porque $\\frac{180}{\\pi}\\approx 57{,}3$). Si un número acompaña a $\\pi$ (como $\\frac{5\\pi}{6}$), casi seguro es un ángulo en radianes; si tiene el símbolo de grado, está en grados.",
    "Errores comunes. 1) Calculadora en el modo equivocado: en radianes, $\\operatorname{sen}(30)$ vale $-0{,}99$ y no $0{,}5$. Antes de cada cuenta mira si dice DEG (grados) o RAD (radianes). 2) Multiplicar por $\\frac{180}{\\pi}$ cuando se quería pasar a radianes (o al revés). 3) Olvidar que $\\frac{\\pi}{2}$ radianes son $90^{\\circ}$, no $180^{\\circ}$."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.circulo",
      "despuesDePaso": 3,
      "titulo": "Grados y radianes del mismo giro",
      "angulos": [
        30,
        45,
        60,
        90,
        150,
        180,
        270,
        360
      ],
      "unidad": "ambas",
      "valores": false
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 4,
      "titulo": "Convertir sin equivocarse",
      "cuadros": [
        {
          "texto": "De grados a radianes: multiplica por π/180 y simplifica.",
          "formula": "150^{\\circ}\\cdot\\dfrac{\\pi}{180}=\\dfrac{150\\pi}{180}=\\dfrac{5\\pi}{6}"
        },
        {
          "texto": "De radianes a grados: reemplaza π por 180°.",
          "formula": "\\dfrac{3\\pi}{4}=\\dfrac{3\\cdot 180^{\\circ}}{4}=135^{\\circ}"
        }
      ],
      "msPorCuadro": 2800
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos radianes son $60^{\\circ}$?",
      "opciones": [
        "$\\frac{\\pi}{6}$",
        "$\\frac{\\pi}{4}$",
        "$\\frac{2\\pi}{3}$",
        "$\\frac{\\pi}{3}$"
      ],
      "respuesta": "$\\frac{\\pi}{3}$",
      "explicacion": "$60^{\\circ}=\\frac{60}{180}\\pi=\\frac{\\pi}{3}$. $\\frac{\\pi}{6}$ son $30^{\\circ}$, $\\frac{\\pi}{4}$ son $45^{\\circ}$ y $\\frac{2\\pi}{3}$ son $120^{\\circ}$."
    },
    {
      "pregunta": "¿Cuántos grados son $\\dfrac{3\\pi}{4}$ radianes?",
      "opciones": [
        "$135^{\\circ}$",
        "$120^{\\circ}$",
        "$225^{\\circ}$",
        "$270^{\\circ}$"
      ],
      "respuesta": "$135^{\\circ}$",
      "explicacion": "Se reemplaza $\\pi$ por $180^{\\circ}$: $\\frac{3\\cdot 180^{\\circ}}{4}=135^{\\circ}$."
    },
    {
      "pregunta": "¿A cuántos radianes equivale una vuelta completa?",
      "opciones": [
        "$\\pi$",
        "$2\\pi$",
        "$360$",
        "$\\dfrac{\\pi}{2}$"
      ],
      "respuesta": "$2\\pi$",
      "explicacion": "Una vuelta completa son $360^{\\circ}=2\\pi$ radianes: la circunferencia mide $2\\pi$ veces el radio. $\\pi$ es media vuelta."
    },
    {
      "pregunta": "Con la calculadora en radianes, ¿qué muestra al calcular $\\operatorname{sen}(30)$?",
      "opciones": [
        "$0{,}5$",
        "$-0{,}99$",
        "$1$",
        "$0$"
      ],
      "respuesta": "$-0{,}99$",
      "explicacion": "Interpreta 30 como 30 radianes y da $-0{,}99$. Para obtener $\\operatorname{sen}(30^{\\circ})=0{,}5$ hay que cambiar a modo grados."
    },
    {
      "pregunta": "¿Cuál es, aproximadamente, la medida de un radián en grados?",
      "opciones": [
        "$3{,}14^{\\circ}$",
        "$180^{\\circ}$",
        "$1^{\\circ}$",
        "$57{,}3^{\\circ}$"
      ],
      "respuesta": "$57{,}3^{\\circ}$",
      "explicacion": "Como $\\pi$ radianes son $180^{\\circ}$, un radián son $\\frac{180}{\\pi}\\approx 57{,}3^{\\circ}$."
    }
  ]
}$trigonometria$::jsonb,
  2,
  true),

('trigonometria-clase-10-circulo-unitario-y-valores-exactos', 'El círculo unitario y los valores exactos',
  'Seno y coseno como las coordenadas de un punto del círculo de radio 1, para ángulos de cualquier tamaño, y los valores exactos de los ángulos notables.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás leer el seno y el coseno de un ángulo cualquiera como las coordenadas de un punto del círculo de radio 1, y conocerás los valores exactos de los ángulos notables.",
    "Intuición. En un triángulo rectángulo con hipotenusa 1, las razones se simplifican: $\\operatorname{sen}=\\frac{\\text{opuesto}}{1}$ y $\\cos=\\frac{\\text{adyacente}}{1}$ son directamente las longitudes de los catetos. Si ese triángulo se dibuja dentro de un círculo de radio 1, los catetos son las coordenadas del punto donde termina el lado del ángulo.",
    "El círculo unitario tiene centro en el origen y radio 1. Para un ángulo $\\theta$ en posición estándar, su lado terminal corta al círculo en un punto $P(x,y)$. Se define: $\\cos(\\theta)=x$ y $\\operatorname{sen}(\\theta)=y$, y también $\\tan(\\theta)=\\frac{y}{x}$ cuando $x\\neq 0$. Esta definición sirve para ángulos de cualquier tamaño, no solo los agudos.",
    "Coherencia con lo anterior. Para un ángulo agudo, el punto $P$, su pie sobre el eje $x$ y el origen forman un triángulo rectángulo de hipotenusa 1, con cateto adyacente $x$ y cateto opuesto $y$: $\\cos=\\frac{x}{1}$ y $\\operatorname{sen}=\\frac{y}{1}$, igual que antes. El círculo extiende esas razones a ángulos de cualquier tamaño (incluidos los negativos y los de más de una vuelta).",
    "Una relación que sale gratis: como $P$ está sobre el círculo de radio 1, cumple $x^{2}+y^{2}=1$. Es decir, $\\cos^{2}(\\theta)+\\operatorname{sen}^{2}(\\theta)=1$ para cualquier ángulo. Sirve, por ejemplo, para hallar $\\operatorname{sen}(\\theta)$ si se conoce $\\cos(\\theta)$: si $\\cos(\\theta)=0{,}6$, entonces $\\operatorname{sen}^{2}(\\theta)=1-0{,}36=0{,}64$ y $|\\operatorname{sen}(\\theta)|=0{,}8$ (el signo lo decide el cuadrante).",
    "Valores exactos del primer cuadrante. Con los triángulos especiales (clase 6): $\\cos(30^{\\circ})=\\frac{\\sqrt{3}}{2},\\quad \\operatorname{sen}(30^{\\circ})=\\frac{1}{2},\\quad \\tan(30^{\\circ})=\\frac{\\sqrt{3}}{3}$; $\\cos(45^{\\circ})=\\frac{\\sqrt{2}}{2},\\quad \\operatorname{sen}(45^{\\circ})=\\frac{\\sqrt{2}}{2},\\quad \\tan(45^{\\circ})=1$; $\\cos(60^{\\circ})=\\frac{1}{2},\\quad \\operatorname{sen}(60^{\\circ})=\\frac{\\sqrt{3}}{2},\\quad \\tan(60^{\\circ})=\\sqrt{3}$. Las razones de $0^{\\circ}$ y $90^{\\circ}$ salen de los ejes: $\\cos(0^{\\circ})=1,\\quad \\operatorname{sen}(0^{\\circ})=0,\\quad \\tan(0^{\\circ})=0$; y en $90^{\\circ}$: $\\cos(90^{\\circ})=0,\\quad \\operatorname{sen}(90^{\\circ})=1$, mientras que $\\tan(90^{\\circ})$ no existe: $x=0$ y no se puede dividir entre 0.",
    "En los otros ejes: $180^{\\circ}$ corresponde al punto $(-1,0)$, así que $\\cos(180^{\\circ})=-1$ y $\\operatorname{sen}(180^{\\circ})=0$; $270^{\\circ}$ corresponde a $(0,-1)$, así que $\\cos(270^{\\circ})=0$, $\\operatorname{sen}(270^{\\circ})=-1$ y su tangente tampoco existe. Cuando una razón no existe se dice que es indefinida.",
    "Errores comunes. 1) Confundir cuál coordenada es cuál: el coseno es la coordenada $x$ (horizontal) y el seno la $y$ (vertical); en el alfabeto, la c va antes que la s, como la $x$ antes que la $y$. 2) Decir que $\\tan(90^{\\circ})$ vale 0 o infinito: es indefinida. 3) Olvidar los signos fuera del primer cuadrante (la próxima clase los ordena)."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.circulo",
      "despuesDePaso": 2,
      "titulo": "Seno y coseno como coordenadas",
      "angulos": [
        30,
        60,
        120,
        240
      ],
      "unidad": "ambas"
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 5,
      "titulo": "Valores exactos del primer cuadrante",
      "cuadros": [
        {
          "texto": "Punto del círculo para $0^{\\circ}$: $(1,\\,0)$.",
          "formula": "\\cos(0^{\\circ})=1,\\quad \\operatorname{sen}(0^{\\circ})=0,\\quad \\tan(0^{\\circ})=0"
        },
        {
          "texto": "$30^{\\circ}$ (medio equilátero).",
          "formula": "\\cos(30^{\\circ})=\\frac{\\sqrt{3}}{2},\\quad \\operatorname{sen}(30^{\\circ})=\\frac{1}{2},\\quad \\tan(30^{\\circ})=\\frac{\\sqrt{3}}{3}"
        },
        {
          "texto": "$45^{\\circ}$ (medio cuadrado).",
          "formula": "\\cos(45^{\\circ})=\\frac{\\sqrt{2}}{2},\\quad \\operatorname{sen}(45^{\\circ})=\\frac{\\sqrt{2}}{2},\\quad \\tan(45^{\\circ})=1"
        },
        {
          "texto": "$60^{\\circ}$.",
          "formula": "\\cos(60^{\\circ})=\\frac{1}{2},\\quad \\operatorname{sen}(60^{\\circ})=\\frac{\\sqrt{3}}{2},\\quad \\tan(60^{\\circ})=\\sqrt{3}"
        },
        {
          "texto": "$90^{\\circ}$: la tangente no existe.",
          "formula": "\\cos(90^{\\circ})=0,\\quad \\operatorname{sen}(90^{\\circ})=1"
        }
      ],
      "msPorCuadro": 2800
    },
    {
      "tipo": "trigonometria.circulo",
      "despuesDePaso": 6,
      "titulo": "Los ángulos que caen sobre los ejes",
      "angulos": [
        90,
        180,
        270,
        360
      ],
      "unidad": "ambas"
    }
  ],
  "quiz": [
    {
      "pregunta": "En el círculo unitario, ¿qué coordenada del punto es el coseno del ángulo?",
      "opciones": [
        "La coordenada $y$ (vertical)",
        "La coordenada $x$ (horizontal)",
        "La distancia al origen",
        "El cociente $\\dfrac{y}{x}$"
      ],
      "respuesta": "La coordenada $x$ (horizontal)",
      "explicacion": "El coseno es $x$ y el seno es $y$. La distancia al origen es siempre 1 (el radio) y $\\frac{y}{x}$ es la tangente."
    },
    {
      "pregunta": "Un punto del círculo unitario es $\\left(\\dfrac{\\sqrt{2}}{2},\\dfrac{\\sqrt{2}}{2}\\right)$. ¿Qué ángulo del primer cuadrante es y cuánto vale su tangente?",
      "opciones": [
        "$30^{\\circ}$ y $\\tan=\\dfrac{\\sqrt{3}}{3}$",
        "$60^{\\circ}$ y $\\tan=\\sqrt{3}$",
        "$45^{\\circ}$ y $\\tan=\\dfrac{\\sqrt{2}}{2}$",
        "$45^{\\circ}$ y $\\tan=1$"
      ],
      "respuesta": "$45^{\\circ}$ y $\\tan=1$",
      "explicacion": "Con $x=y$ el ángulo es de $45^{\\circ}$, y la tangente es $\\frac{y}{x}=1$. $\\frac{\\sqrt{2}}{2}$ es el valor del seno y del coseno, no de la tangente."
    },
    {
      "pregunta": "¿Cuánto valen $\\cos(90^{\\circ})$ y $\\tan(90^{\\circ})$?",
      "opciones": [
        "$\\cos(90^{\\circ})=1$ y $\\tan(90^{\\circ})=0$",
        "$\\cos(90^{\\circ})=0$ y $\\tan(90^{\\circ})=0$",
        "$\\cos(90^{\\circ})=1$ y $\\tan(90^{\\circ})$ es indefinida",
        "$\\cos(90^{\\circ})=0$ y la tangente es indefinida"
      ],
      "respuesta": "$\\cos(90^{\\circ})=0$ y la tangente es indefinida",
      "explicacion": "En $90^{\\circ}$ el punto es $(0,1)$: $\\cos=0$ y $\\operatorname{sen}=1$. La tangente sería $\\frac{1}{0}$, que no se puede calcular: es indefinida."
    },
    {
      "pregunta": "¿Cuánto vale $\\operatorname{sen}(180^{\\circ})$?",
      "opciones": [
        "$0$",
        "$1$",
        "$-1$",
        "Es indefinido"
      ],
      "respuesta": "$0$",
      "explicacion": "En $180^{\\circ}$ el punto es $(-1,0)$: la coordenada $y$ es 0. El seno siempre existe; solo la tangente puede ser indefinida."
    },
    {
      "pregunta": "Si $\\cos(\\theta)=0{,}6$, ¿cuánto vale $|\\operatorname{sen}(\\theta)|$?",
      "opciones": [
        "$0{,}4$",
        "$0{,}8$",
        "$0{,}6$",
        "$1{,}6$"
      ],
      "respuesta": "$0{,}8$",
      "explicacion": "Como $\\cos^{2}+\\operatorname{sen}^{2}=1$: $\\operatorname{sen}^{2}=1-0{,}36=0{,}64$, y su raíz es $0{,}8$. $0{,}4=1-0{,}6$ no respeta los cuadrados."
    }
  ]
}$trigonometria$::jsonb,
  3,
  true),

('trigonometria-clase-11-angulo-de-referencia-y-signos', 'Ángulo de referencia y signos por cuadrante',
  'Cómo obtener sen, cos y tan de cualquier ángulo a partir del primer cuadrante y decidir el signo con el cuadrante.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás calcular el valor exacto del seno, el coseno y la tangente de cualquier ángulo notable (en cualquier cuadrante) usando el ángulo de referencia y los signos, sin memorizar cada caso.",
    "Intuición. Los puntos del círculo para $30^{\\circ}$, $150^{\\circ}$, $210^{\\circ}$ y $330^{\\circ}$ son reflejos unos de otros respecto de los ejes. Tienen la misma distancia al eje $x$ y al eje $y$, así que sus coordenadas son iguales en valor absoluto y solo cambia el signo. Por eso alcanza con conocer bien el primer cuadrante.",
    "Ángulo de referencia. Es el ángulo agudo que forma el lado terminal con el eje $x$ (el más cercano). En el cuadrante I es el propio ángulo $\\theta$; en el II, $180^{\\circ}-\\theta$; en el III, $\\theta-180^{\\circ}$; y en el IV, $360^{\\circ}-\\theta$. Se cuenta siempre desde el eje $x$, nunca desde el eje $y$.",
    "La regla: el valor absoluto de $\\operatorname{sen}(\\theta)$, $\\cos(\\theta)$ y $\\tan(\\theta)$ es el de su ángulo de referencia (los valores del primer cuadrante). Solo falta decidir el signo.",
    "El signo sale de las coordenadas: el seno tiene el signo de $y$, el coseno el de $x$ y la tangente el de $\\frac{y}{x}$. En el cuadrante I todas son positivas. En el II, $x<0$ y $y>0$: solo el seno es positivo. En el III, $x<0$ y $y<0$: solo la tangente es positiva. En el IV, $x>0$ y $y<0$: solo el coseno es positivo. Se recuerda como «Todos, Seno, Tangente, Coseno».",
    "Ejemplos resueltos. $\\operatorname{sen}(210^{\\circ})$: $210^{\\circ}$ está en el cuadrante III, su referencia es $30^{\\circ}$ y el seno es negativo allí: $-\\frac{1}{2}$. $\\cos(315^{\\circ})$: cuadrante IV, referencia $45^{\\circ}$, coseno positivo: $\\frac{\\sqrt{2}}{2}$. $\\tan(120^{\\circ})$: cuadrante II, referencia $60^{\\circ}$, tangente negativa: $-\\sqrt{3}$.",
    "Otro problema típico: si $\\operatorname{sen}(\\theta)=\\frac{3}{5}$ y $\\theta$ está en el cuadrante II, ¿cuánto valen $\\cos(\\theta)$ y $\\tan(\\theta)$? Con $x^{2}+y^{2}=1$: $\\cos^{2}(\\theta)=1-\\frac{9}{25}=\\frac{16}{25}$, así que $|\\cos(\\theta)|=\\frac{4}{5}$. En el cuadrante II el coseno es negativo: $\\cos(\\theta)=-\\frac{4}{5}$. Entonces $\\tan(\\theta)=\\frac{3/5}{-4/5}=-\\frac{3}{4}$.",
    "Errores comunes. 1) Medir la referencia desde el eje $y$: la referencia de $120^{\\circ}$ es $60^{\\circ}$ (hasta el eje $x$ en $180^{\\circ}$), no $30^{\\circ}$. 2) Poner el signo del cuadrante equivocado: revisa qué coordenada es positiva. 3) Cambiar el valor además del signo: solo cambia el signo, la magnitud es la de la referencia."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.cuadrantes",
      "despuesDePaso": 4,
      "titulo": "Un ángulo de referencia de $30^{\\circ}$ en los cuatro cuadrantes",
      "referencia": 30
    },
    {
      "tipo": "trigonometria.circulo",
      "despuesDePaso": 2,
      "titulo": "Ángulo de referencia",
      "angulos": [
        150,
        210,
        330
      ],
      "unidad": "grados",
      "mostrar": [
        "referencia"
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 5,
      "titulo": "Tres ejemplos con referencia y signo",
      "cuadros": [
        {
          "texto": "$210^{\\circ}$: cuadrante III, referencia $30^{\\circ}$, el seno es negativo.",
          "formula": "\\operatorname{sen}(210^{\\circ})=-\\frac{1}{2}"
        },
        {
          "texto": "$315^{\\circ}$: cuadrante IV, referencia $45^{\\circ}$, el coseno es positivo.",
          "formula": "\\cos(315^{\\circ})=\\frac{\\sqrt{2}}{2}"
        },
        {
          "texto": "$120^{\\circ}$: cuadrante II, referencia $60^{\\circ}$, la tangente es negativa.",
          "formula": "\\tan(120^{\\circ})=-\\sqrt{3}"
        }
      ],
      "msPorCuadro": 2800
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto vale $\\operatorname{sen}(210^{\\circ})$?",
      "opciones": [
        "$-\\frac{1}{2}$",
        "$\\frac{1}{2}$",
        "$-\\frac{\\sqrt{3}}{2}$",
        "$\\frac{\\sqrt{3}}{3}$"
      ],
      "respuesta": "$-\\frac{1}{2}$",
      "explicacion": "$210^{\\circ}$ está en el cuadrante III (seno negativo) y su referencia es $30^{\\circ}$: $-\\frac{1}{2}$. $\\frac{1}{2}$ olvida el signo y $-\\frac{\\sqrt{3}}{2}$ es el coseno."
    },
    {
      "pregunta": "¿Cuánto vale $\\cos(135^{\\circ})$?",
      "opciones": [
        "$-\\frac{\\sqrt{2}}{2}$",
        "$\\frac{\\sqrt{2}}{2}$",
        "$-\\frac{1}{2}$",
        "$\\frac{1}{2}$"
      ],
      "respuesta": "$-\\frac{\\sqrt{2}}{2}$",
      "explicacion": "$135^{\\circ}$ está en el cuadrante II (coseno negativo) y su referencia es $45^{\\circ}$: $-\\frac{\\sqrt{2}}{2}$."
    },
    {
      "pregunta": "¿Cuál es el ángulo de referencia de $300^{\\circ}$?",
      "opciones": [
        "$30^{\\circ}$",
        "$120^{\\circ}$",
        "$60^{\\circ}$",
        "$240^{\\circ}$"
      ],
      "respuesta": "$60^{\\circ}$",
      "explicacion": "En el cuadrante IV, la referencia es $360^{\\circ}-300^{\\circ}=60^{\\circ}$. El $30^{\\circ}$ sería medir hasta el eje $y$."
    },
    {
      "pregunta": "Si $\\operatorname{sen}(\\theta)=\\dfrac{3}{5}$ y $\\theta$ está en el cuadrante II, ¿cuánto vale $\\cos(\\theta)$?",
      "opciones": [
        "$-\\dfrac{4}{5}$",
        "$\\dfrac{4}{5}$",
        "$-\\dfrac{3}{4}$",
        "$\\dfrac{5}{4}$"
      ],
      "respuesta": "$-\\dfrac{4}{5}$",
      "explicacion": "Por $x^{2}+y^{2}=1$, $|\\cos|=\\frac{4}{5}$, y en el cuadrante II el coseno (la coordenada $x$) es negativo. $-\\frac{3}{4}$ sería la tangente."
    },
    {
      "pregunta": "¿En qué cuadrante son negativos a la vez el seno y la tangente?",
      "opciones": [
        "Cuadrante I",
        "Cuadrante II",
        "Cuadrante IV",
        "Cuadrante III"
      ],
      "respuesta": "Cuadrante IV",
      "explicacion": "En el IV, $y<0$ y $x>0$: seno negativo, coseno positivo y tangente negativa. En el III el seno es negativo pero la tangente es positiva."
    },
    {
      "pregunta": "¿Cuánto vale $\\tan(240^{\\circ})$?",
      "opciones": [
        "$-\\sqrt{3}$",
        "$\\frac{\\sqrt{3}}{3}$",
        "$-\\frac{\\sqrt{3}}{2}$",
        "$\\sqrt{3}$"
      ],
      "respuesta": "$\\sqrt{3}$",
      "explicacion": "$240^{\\circ}$ está en el cuadrante III (tangente positiva) con referencia $60^{\\circ}$: $\\sqrt{3}$. Con $-\\sqrt{3}$ se usó un signo equivocado."
    }
  ]
}$trigonometria$::jsonb,
  4,
  true),

('trigonometria-clase-12-la-funcion-seno', 'La función seno y su gráfica',
  'De un punto que gira sobre el círculo a la onda y = sen x: forma, valores clave, dominio, rango y periodo.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás dibujar la gráfica de $y=\\operatorname{sen}(x)$ a partir del círculo unitario y decir cuáles son sus valores clave, su dominio, su rango y su periodo.",
    "Intuición. Imagina un punto que da vueltas sobre el círculo unitario con velocidad constante. Su altura (la coordenada $y$) sube hasta 1, baja hasta $-1$ y vuelve a subir, una y otra vez. Esa altura, en función del ángulo recorrido $x$, es la función seno.",
    "La función seno asigna a cada número $x$ el valor $\\operatorname{sen}(x)$. En las gráficas, $x$ es un ángulo en RADIANES (se marca en múltiplos de $\\pi$) e $y$ es la altura del punto. Se puede calcular el seno de cualquier número real, así que el dominio son todos los reales.",
    "Los cinco puntos clave de un ciclo, entre $0$ y $2\\pi$: $x=0$ da $y=0$; $x=\\frac{\\pi}{2}$ da $y=1$; $x=\\pi$ da $y=0$; $x=\\frac{3\\pi}{2}$ da $y=-1$; y $x=2\\pi$ vuelve a dar $y=0$. Entre ellos la curva es suave, sin puntas.",
    "La forma. La gráfica sale del origen, sube hasta el máximo 1 en $\\frac{\\pi}{2}$, baja pasando por 0 en $\\pi$, llega al mínimo $-1$ en $\\frac{3\\pi}{2}$ y regresa a 0 en $2\\pi$. Después se repite igual, en los dos sentidos.",
    "Rango y periodo. Los valores del seno siempre están entre $-1$ y $1$: el rango es el intervalo $[-1,\\ 1]$. Y como después de una vuelta completa el punto vuelve al mismo lugar, $\\operatorname{sen}(x+2\\pi)=\\operatorname{sen}(x)$: se dice que es una función periódica de periodo $2\\pi$.",
    "Errores comunes. 1) Graficar con $x$ en grados en un eje marcado con $\\pi$: cuando el eje dice $\\pi$, $x$ está en radianes. 2) Dibujar la curva con picos o como una parábola: es una onda suave. 3) Olvidar que corta al eje $x$ en todos los múltiplos de $\\pi$, no solo en 0 y $2\\pi$."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 4,
      "titulo": "Un ciclo de $y=\\operatorname{sen}(x)$ con sus cinco puntos clave",
      "onda": {
        "fn": "sen"
      },
      "rango": [
        0,
        2
      ],
      "pasos": [
        "curva",
        "puntos"
      ]
    },
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 5,
      "titulo": "La gráfica se repite cada $2\\pi$",
      "onda": {
        "fn": "sen"
      },
      "rango": [
        -1,
        3
      ],
      "pasos": [
        "curva",
        "periodo"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto vale $\\operatorname{sen}\\!\\left(\\dfrac{\\pi}{2}\\right)$?",
      "opciones": [
        "$0$",
        "$1$",
        "$-1$",
        "$\\dfrac{1}{2}$"
      ],
      "respuesta": "$1$",
      "explicacion": "$\\frac{\\pi}{2}$ radianes son $90^{\\circ}$, donde el punto del círculo está arriba del todo, en $(0,1)$: el seno vale 1, el máximo."
    },
    {
      "pregunta": "¿Entre qué valores se mueve $y=\\operatorname{sen}(x)$?",
      "opciones": [
        "Entre $0$ y $1$",
        "Entre $-\\pi$ y $\\pi$",
        "Entre $0$ y $2\\pi$",
        "Entre $-1$ y $1$"
      ],
      "respuesta": "Entre $-1$ y $1$",
      "explicacion": "El seno es la altura de un punto sobre un círculo de radio 1, así que nunca sale de $[-1,1]$. Los valores $\\pi$ y $2\\pi$ son posiciones del eje $x$, no alturas."
    },
    {
      "pregunta": "¿En qué valores de $x$, entre $0$ y $2\\pi$, corta la gráfica de $y=\\operatorname{sen}(x)$ al eje $x$?",
      "opciones": [
        "$0$, $\\pi$ y $2\\pi$",
        "Solo en $0$ y $2\\pi$",
        "$\\dfrac{\\pi}{2}$ y $\\dfrac{3\\pi}{2}$",
        "Solo en $\\pi$"
      ],
      "respuesta": "$0$, $\\pi$ y $2\\pi$",
      "explicacion": "El seno vale 0 cuando el punto está sobre el eje horizontal: en $0$, $\\pi$ y $2\\pi$. En $\\frac{\\pi}{2}$ y $\\frac{3\\pi}{2}$ está en el máximo y en el mínimo."
    },
    {
      "pregunta": "Si $\\operatorname{sen}(x)=0{,}3$, ¿cuánto vale $\\operatorname{sen}(x+2\\pi)$?",
      "opciones": [
        "$-0{,}3$",
        "$0{,}3+2\\pi$",
        "$0{,}3$",
        "$0$"
      ],
      "respuesta": "$0{,}3$",
      "explicacion": "Sumar $2\\pi$ es dar una vuelta completa: el punto vuelve al mismo lugar y el seno no cambia. Esa es la definición de periodo."
    },
    {
      "pregunta": "¿Cuál de estas descripciones corresponde a la gráfica de $y=\\operatorname{sen}(x)$?",
      "opciones": [
        "Una onda que arranca en $y=1$ y baja",
        "Una parábola que abre hacia arriba",
        "Una onda con picos en los múltiplos de $\\pi$",
        "Una onda suave que arranca en el origen y sube hasta 1"
      ],
      "respuesta": "Una onda suave que arranca en el origen y sube hasta 1",
      "explicacion": "El seno sale del punto $(0,0)$ subiendo; la que arranca en 1 es el coseno. No es una parábola ni tiene picos: es suave."
    }
  ]
}$trigonometria$::jsonb,
  1,
  true),

('trigonometria-clase-13-la-funcion-coseno', 'La función coseno',
  'El coseno como la coordenada x del punto que gira, su gráfica y por qué es el seno corrido π/2 hacia la izquierda.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás dibujar la gráfica de $y=\\cos(x)$, reconocer en qué se diferencia de la del seno y explicar por qué son la misma onda desplazada.",
    "Intuición. Con el mismo punto que gira sobre el círculo unitario, el seno miraba la altura ($y$) y el coseno mira lo lejos que está hacia los lados ($x$). Al empezar, en $x=0$, el punto está en $(1,0)$: el coseno arranca en su máximo.",
    "Los cinco puntos clave de un ciclo: $x=0$ da $y=1$; $x=\\frac{\\pi}{2}$ da $y=0$; $x=\\pi$ da $y=-1$; $x=\\frac{3\\pi}{2}$ da $y=0$; y $x=2\\pi$ vuelve a dar $y=1$. También es periódica de periodo $2\\pi$ y su rango es $[-1,\\ 1]$.",
    "La gráfica del coseno y la del seno son la misma onda con otro punto de partida: $\\cos(x)=\\operatorname{sen}\\!\\left(x+\\frac{\\pi}{2}\\right)$. Es decir, la gráfica del coseno es la del seno corrida $\\frac{\\pi}{2}$ hacia la izquierda: lo que el seno hace en $x=\\frac{\\pi}{2}$ (llegar a 1), el coseno ya lo hace en $x=0$.",
    "Simetrías. El coseno es simétrico respecto del eje $y$: $\\cos(-x)=\\cos(x)$ (mira cómo la gráfica a la izquierda es un espejo de la de la derecha). El seno, en cambio, es simétrico respecto del origen: $\\operatorname{sen}(-x)=-\\operatorname{sen}(x)$.",
    "Errores comunes. 1) Confundir cuál de las dos arranca en 0 y cuál en 1: el coseno arranca en 1 (es $x$ en $(1,0)$). 2) Creer que son ondas de distinta forma: tienen exactamente la misma forma, solo cambia el punto de partida. 3) Trabajar con la calculadora en grados cuando el eje está en radianes."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 2,
      "titulo": "$y=\\cos(x)$ (línea continua) y $y=\\operatorname{sen}(x)$ (punteada)",
      "onda": {
        "fn": "cos"
      },
      "base": {
        "fn": "sen"
      },
      "rango": [
        0,
        2
      ],
      "pasos": [
        "curva",
        "puntos"
      ]
    },
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 3,
      "titulo": "El coseno es el seno corrido $\\frac{\\pi}{2}$ hacia la izquierda",
      "onda": {
        "fn": "cos"
      },
      "base": {
        "fn": "sen"
      },
      "rango": [
        -1,
        1
      ],
      "pasos": [
        "curva"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto vale $\\cos(0)$?",
      "opciones": [
        "$0$",
        "$-1$",
        "$1$",
        "$\\dfrac{\\pi}{2}$"
      ],
      "respuesta": "$1$",
      "explicacion": "En $x=0$ el punto del círculo está en $(1,0)$ y su coordenada $x$, el coseno, es 1."
    },
    {
      "pregunta": "¿Cuánto vale $\\cos(\\pi)$?",
      "opciones": [
        "$1$",
        "$-1$",
        "$0$",
        "$\\pi$"
      ],
      "respuesta": "$-1$",
      "explicacion": "En $x=\\pi$ (media vuelta) el punto está en $(-1,0)$: el coseno vale $-1$, su mínimo."
    },
    {
      "pregunta": "¿Cuál de las dos funciones, seno o coseno, arranca en su valor máximo en $x=0$?",
      "opciones": [
        "El seno",
        "Las dos",
        "Ninguna",
        "El coseno"
      ],
      "respuesta": "El coseno",
      "explicacion": "$\\cos(0)=1$ es el máximo del coseno, mientras que $\\operatorname{sen}(0)=0$ está a mitad de camino."
    },
    {
      "pregunta": "¿Qué desplazamiento transforma la gráfica del seno en la del coseno?",
      "opciones": [
        "$\\dfrac{\\pi}{2}$ hacia la izquierda",
        "$\\dfrac{\\pi}{2}$ hacia la derecha",
        "$\\pi$ hacia la izquierda",
        "$\\dfrac{\\pi}{2}$ hacia arriba"
      ],
      "respuesta": "$\\dfrac{\\pi}{2}$ hacia la izquierda",
      "explicacion": "$\\cos(x)=\\operatorname{sen}(x+\\frac{\\pi}{2})$: el seno de $x+\\frac{\\pi}{2}$ ya trae el valor que el seno tendrá $\\frac{\\pi}{2}$ más adelante, así que la gráfica se corre hacia la izquierda. Corrida a la derecha daría $\\operatorname{sen}(x-\\frac{\\pi}{2})=-\\cos(x)$, la gráfica invertida."
    },
    {
      "pregunta": "¿Cuánto vale $\\cos\\!\\left(\\dfrac{3\\pi}{2}\\right)$?",
      "opciones": [
        "$0$",
        "$-1$",
        "$1$",
        "$\\dfrac{3}{2}$"
      ],
      "respuesta": "$0$",
      "explicacion": "$\\frac{3\\pi}{2}$ son $270^{\\circ}$: el punto está en $(0,-1)$ y su coordenada $x$ vale 0. El $-1$ es el seno de ese ángulo."
    }
  ]
}$trigonometria$::jsonb,
  2,
  true),

('trigonometria-clase-14-amplitud', 'Amplitud',
  'Cómo el número a en y = a·sen(x) estira la onda en vertical y cómo leer la amplitud de una gráfica.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar sabrás qué es la amplitud, cómo el número $a$ de $y=a\\operatorname{sen}(x)$ la determina y cómo leerla en una gráfica.",
    "Intuición. Multiplicar la función por un número estira o achata la gráfica en vertical: cada altura se multiplica por ese número. Es como subir el volumen: la onda sube más y baja más, pero sigue con el mismo ritmo.",
    "Definición. En $y=a\\operatorname{sen}(x)$ o $y=a\\cos(x)$, el máximo es $|a|$ y el mínimo $-|a|$. La AMPLITUD es $|a|$: la altura desde la línea media hasta el máximo (no de un extremo al otro). Por ejemplo, $y=4\\operatorname{sen}\\left(x\\right)$ tiene amplitud $4$: oscila entre $-4$ y $4$.",
    "Lo que NO cambia. Los cruces con el eje $x$ y el periodo son los mismos que en $y=\\operatorname{sen}(x)$: solo se estira la altura. En $y=2\\operatorname{sen}\\left(x\\right)$ el máximo se alcanza en el mismo $x=\\frac{\\pi}{2}$, pero vale $2$ en lugar de 1.",
    "Si $a$ es negativo. En $y=-3\\cos\\left(x\\right)$ la amplitud es $3$ (la amplitud nunca es negativa: es $|a|$) pero la gráfica se refleja: en lugar de arrancar en el máximo, arranca en el mínimo $-3$.",
    "Leer la amplitud de una gráfica. Si conoces el máximo $M$ y el mínimo $m$, la amplitud es $\\frac{M-m}{2}$. Por ejemplo, una onda con máximo 5 y mínimo $-1$ tiene amplitud $\\frac{5-(-1)}{2}=3$. (Más adelante verás que su línea media es $2$.)",
    "Errores comunes. 1) Tomar como amplitud la distancia de un extremo al otro: eso es el doble de la amplitud. 2) Escribir una amplitud negativa: $|a|$ siempre es positiva, el signo solo refleja la gráfica. 3) Creer que $a$ cambia el periodo: no lo cambia."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 2,
      "titulo": "$y=4\\operatorname{sen}(x)$ contra $y=\\operatorname{sen}(x)$ (punteada)",
      "onda": {
        "fn": "sen",
        "a": 4
      },
      "base": {
        "fn": "sen"
      },
      "rango": [
        0,
        2
      ],
      "pasos": [
        "curva",
        "amplitud"
      ]
    },
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 4,
      "titulo": "$y=-3\\cos(x)$: amplitud 3, pero reflejada",
      "onda": {
        "fn": "cos",
        "a": -3
      },
      "base": {
        "fn": "cos"
      },
      "rango": [
        0,
        2
      ],
      "pasos": [
        "curva",
        "amplitud"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la amplitud de $y=4\\operatorname{sen}\\left(x\\right)$?",
      "opciones": [
        "$4$",
        "$8$",
        "$\\frac{1}{4}$",
        "$2$"
      ],
      "respuesta": "$4$",
      "explicacion": "La amplitud es el valor absoluto del número que multiplica: 4. El 8 sería la distancia de un extremo al otro (de $-4$ a $4$)."
    },
    {
      "pregunta": "¿Cuál es la amplitud de $y=-3\\cos\\left(x\\right)$?",
      "opciones": [
        "$3$",
        "$-3$",
        "$\\frac{1}{3}$",
        "$6$"
      ],
      "respuesta": "$3$",
      "explicacion": "La amplitud es $|a|=|-3|=3$: nunca es negativa. El signo negativo solo refleja la gráfica."
    },
    {
      "pregunta": "Una onda tiene máximo 5 y mínimo $-1$. ¿Cuál es su amplitud?",
      "opciones": [
        "$6$",
        "$2$",
        "$3$",
        "$5$"
      ],
      "respuesta": "$3$",
      "explicacion": "Amplitud $=\\frac{M-m}{2}=\\frac{5-(-1)}{2}=3$. El 6 es la distancia total de un extremo al otro."
    },
    {
      "pregunta": "Si se multiplica por 2 la función $y=\\operatorname{sen}(x)$, ¿qué cambia?",
      "opciones": [
        "La altura de la onda (máximo y mínimo), pero no el periodo",
        "El periodo, que se duplica",
        "La posición de los cruces con el eje $x$",
        "Nada"
      ],
      "respuesta": "La altura de la onda (máximo y mínimo), pero no el periodo",
      "explicacion": "Multiplicar por 2 estira la gráfica en vertical: el máximo pasa a 2 y el mínimo a $-2$. Los cruces con el eje $x$ y el periodo se mantienen."
    },
    {
      "pregunta": "¿Cuál es el rango de $y=2\\operatorname{sen}(x)$?",
      "opciones": [
        "$[-1,\\ 1]$",
        "$[0,\\ 2]$",
        "$[-2,\\ 2]$",
        "$[-4,\\ 4]$"
      ],
      "respuesta": "$[-2,\\ 2]$",
      "explicacion": "Los valores van de $-|a|$ a $|a|$: de $-2$ a $2$. $[-1,1]$ es el rango sin multiplicar."
    }
  ]
}$trigonometria$::jsonb,
  3,
  true),

('trigonometria-clase-15-periodo-y-frecuencia', 'Periodo y frecuencia',
  'Cómo el número b en y = sen(bx) acelera o frena la onda, y la fórmula del periodo 2π/b.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás calcular el periodo de $y=a\\operatorname{sen}(bx)$ o $y=a\\cos(bx)$ con la fórmula $\\frac{2\\pi}{b}$, entender la frecuencia y leer el periodo de una gráfica.",
    "Intuición. Multiplicar la $x$ por un número acelera o frena la onda. En $y=\\operatorname{sen}(3x)$ el ángulo avanza tres veces más rápido: en el mismo tramo del eje $x$ caben tres ciclos. Los ciclos se hacen más angostos: es como pedalear más rápido, se dan más vueltas en el mismo camino.",
    "El periodo $P$ es el largo (en el eje $x$) de un ciclo completo. En $y=a\\operatorname{sen}(bx)$ con $b>0$: $P=\\frac{2\\pi}{b}$. Por ejemplo, $y=\\operatorname{sen}\\left(3x\\right)$ tiene periodo $\\frac{2\\pi}{3}$ (tres ciclos entre 0 y $2\\pi$).",
    "Más ejemplos. $y=\\operatorname{sen}\\left(2x\\right)$: periodo $\\pi$ (dos ciclos en una vuelta). $y=\\cos\\left(\\frac{1}{2}x\\right)$: $b=\\frac{1}{2}$, así que el periodo es $4\\pi$: la onda se estira y hace medio ciclo entre 0 y $2\\pi$.",
    "La frecuencia es cuántos ciclos caben en una unidad del eje $x$: $f=\\frac{1}{P}=\\frac{b}{2\\pi}$. Periodo largo, frecuencia baja; periodo corto, frecuencia alta. En sonido, por ejemplo, un tono agudo es una onda de frecuencia alta y periodo corto.",
    "La regla práctica: $b$ grande significa ciclos angostos (periodo corto); $b$ chico significa ciclos anchos (periodo largo). Y $b=1$ es el caso base, de periodo $2\\pi$. Para la tangente el periodo es $\\frac{\\pi}{b}$ (no $\\frac{2\\pi}{b}$).",
    "Errores comunes. 1) Dividir al revés: el periodo es $\\frac{2\\pi}{b}$, no $\\frac{b}{2\\pi}$ (eso es la frecuencia). 2) Confundir periodo con frecuencia. 3) Usar $\\frac{2\\pi}{b}$ en la tangente, cuya onda se repite cada $\\frac{\\pi}{b}$. 4) Creer que $b$ cambia la amplitud: no la cambia."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 2,
      "titulo": "$y=\\operatorname{sen}(3x)$ contra $y=\\operatorname{sen}(x)$ (punteada)",
      "onda": {
        "fn": "sen",
        "b": 3
      },
      "base": {
        "fn": "sen"
      },
      "rango": [
        0,
        2
      ],
      "pasos": [
        "curva",
        "periodo"
      ]
    },
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 3,
      "titulo": "$y=\\cos\\left(\\frac{x}{2}\\right)$: un ciclo cada $4\\pi$",
      "onda": {
        "fn": "cos",
        "b": [
          1,
          2
        ]
      },
      "base": {
        "fn": "cos"
      },
      "rango": [
        0,
        4
      ],
      "pasos": [
        "curva",
        "periodo"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el periodo de $y=\\operatorname{sen}\\left(4x\\right)$?",
      "opciones": [
        "$\\frac{\\pi}{2}$",
        "$2\\pi$",
        "$8\\pi$",
        "$4\\pi$"
      ],
      "respuesta": "$\\frac{\\pi}{2}$",
      "explicacion": "$P=\\frac{2\\pi}{4}=\\frac{\\pi}{2}$. Con $b=4$ la onda hace 4 ciclos entre $0$ y $2\\pi$. $8\\pi$ sale de multiplicar por $b$ en lugar de dividir."
    },
    {
      "pregunta": "¿Cuál es el periodo de $y=\\cos\\left(\\frac{1}{3}x\\right)$?",
      "opciones": [
        "$\\dfrac{2\\pi}{3}$",
        "$\\dfrac{\\pi}{3}$",
        "$6\\pi$",
        "$3\\pi$"
      ],
      "respuesta": "$6\\pi$",
      "explicacion": "$P=\\frac{2\\pi}{1/3}=6\\pi$: con $b=\\frac{1}{3}$ la onda se estira y tarda tres vueltas en completar un ciclo. $\\frac{2\\pi}{3}$ multiplicó por $b$."
    },
    {
      "pregunta": "Una onda $y=\\operatorname{sen}(bx)$ tiene periodo $\\dfrac{2\\pi}{5}$. ¿Cuánto vale $b$?",
      "opciones": [
        "$\\dfrac{1}{5}$",
        "$5$",
        "$2\\pi$",
        "$\\dfrac{2\\pi}{5}$"
      ],
      "respuesta": "$5$",
      "explicacion": "De $P=\\frac{2\\pi}{b}$ se despeja $b=\\frac{2\\pi}{P}=\\frac{2\\pi}{2\\pi/5}=5$."
    },
    {
      "pregunta": "¿Cuántos ciclos completos de $y=\\operatorname{sen}(3x)$ hay entre $0$ y $2\\pi$?",
      "opciones": [
        "$3$",
        "$1$",
        "$6$",
        "$\\dfrac{1}{3}$"
      ],
      "respuesta": "$3$",
      "explicacion": "El periodo es $\\frac{2\\pi}{3}$ y $2\\pi$ contiene $2\\pi\\div\\frac{2\\pi}{3}=3$ periodos."
    },
    {
      "pregunta": "¿Cuál es el periodo de $y=\\tan(2x)$?",
      "opciones": [
        "$\\pi$",
        "$\\dfrac{\\pi}{2}$",
        "$4\\pi$",
        "$2\\pi$"
      ],
      "respuesta": "$\\dfrac{\\pi}{2}$",
      "explicacion": "La tangente se repite cada $\\pi$, así que con $b=2$ el periodo es $\\frac{\\pi}{b}=\\frac{\\pi}{2}$. No se usa $2\\pi$ como en el seno y el coseno."
    }
  ]
}$trigonometria$::jsonb,
  4,
  true),

('trigonometria-clase-16-desfase-y-desplazamiento-vertical', 'Desfase y desplazamiento vertical',
  'Correr la onda a los lados (desfase) o hacia arriba y abajo (línea media) y la forma general y = a·sen(b(x − c)) + d.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás identificar amplitud, periodo, desfase y desplazamiento vertical en la ecuación $y=a\\operatorname{sen}(b(x-c))+d$ y dibujar la onda correspondiente.",
    "Intuición. A una onda se le puede cambiar el tamaño ($a$), el ritmo ($b$) y también la posición: correrla a los lados o subirla y bajarla, como mover una escultura de lugar sin cambiarle la forma. Esos dos movimientos se llaman desfase y desplazamiento vertical.",
    "La forma general que se usa en este curso es $y=a\\operatorname{sen}(b(x-c))+d$ (o con coseno). Sus cuatro números: $a$ da la amplitud $|a|$; $b$, el periodo $\\frac{2\\pi}{b}$; $c$, el desfase (cuánto se corre hacia la derecha si es positivo); y $d$, el desplazamiento vertical (la línea media es $y=d$).",
    "Desfase. En $y=\\operatorname{sen}\\left(x-\\frac{\\pi}{4}\\right)$, el ciclo que empezaba en $x=0$ ahora empieza en $x=\\frac{\\pi}{4}$: la gráfica se corrió $\\frac{\\pi}{4}$ hacia la derecha. Con signo más, la corrida es hacia la izquierda: $y=\\cos\\left(x+\\frac{\\pi}{6}\\right)$ está corrida $\\frac{\\pi}{6}$ hacia la izquierda.",
    "Desplazamiento vertical. En $y=2\\cos\\left(x\\right)-3$, toda la gráfica baja 3 unidades: la línea media pasa a ser $y=-3$, el máximo es $-1$ y el mínimo $-5$. La amplitud ($2$) no cambia: mover la onda no la estira.",
    "Cuidado: hay que factorizar $b$. Si la ecuación está escrita como $y=\\operatorname{sen}(2x-\\pi)$, el desfase NO es $\\pi$: se factoriza $2x-\\pi=2\\left(x-\\frac{\\pi}{2}\\right)$ y el desfase es $\\frac{\\pi}{2}$. En general, en $\\operatorname{sen}(bx-k)$ el desfase es $\\frac{k}{b}$.",
    "Las cuatro cantidades juntas. Para $y=3\\operatorname{sen}\\left(2\\left(x-\\frac{\\pi}{4}\\right)\\right)-1$: amplitud $3$, periodo $\\pi$, desfase $\\frac{\\pi}{4}$, línea media $y=-1$, máximo $2$ y mínimo $-4$.",
    "Errores comunes. 1) Invertir el sentido del desfase: $x-c$ corre hacia la derecha y $x+c$ hacia la izquierda. 2) No factorizar $b$ y tomar como desfase el número suelto. 3) Creer que el desplazamiento vertical cambia la amplitud: solo mueve la línea media. 4) Mezclar $d$ con el máximo: el máximo es $d+|a|$."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 3,
      "titulo": "Desfase: $y=\\operatorname{sen}\\left(x-\\frac{\\pi}{4}\\right)$ contra $y=\\operatorname{sen}(x)$",
      "onda": {
        "fn": "sen",
        "c": [
          1,
          4
        ]
      },
      "base": {
        "fn": "sen"
      },
      "rango": [
        0,
        2
      ],
      "pasos": [
        "curva",
        "desfase"
      ]
    },
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 4,
      "titulo": "Desplazamiento vertical: $y=2\\cos(x)-3$",
      "onda": {
        "fn": "cos",
        "a": 2,
        "d": -3
      },
      "base": {
        "fn": "cos"
      },
      "rango": [
        0,
        2
      ],
      "pasos": [
        "curva",
        "amplitud",
        "vertical"
      ]
    },
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 6,
      "titulo": "Las cuatro cantidades: $y=3\\operatorname{sen}\\left(2\\left(x-\\frac{\\pi}{4}\\right)\\right)-1$",
      "onda": {
        "fn": "sen",
        "a": 3,
        "b": 2,
        "c": [
          1,
          4
        ],
        "d": -1
      },
      "rango": [
        0,
        2
      ],
      "pasos": [
        "curva",
        "amplitud",
        "periodo",
        "desfase",
        "vertical",
        "puntos"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué desfase tiene $y=\\operatorname{sen}\\left(x-\\frac{\\pi}{4}\\right)$?",
      "opciones": [
        "$\\frac{\\pi}{4}$ hacia la derecha",
        "$\\frac{\\pi}{4}$ hacia la izquierda",
        "$\\frac{\\pi}{2}$ hacia la derecha",
        "$\\pi$ hacia la derecha"
      ],
      "respuesta": "$\\frac{\\pi}{4}$ hacia la derecha",
      "explicacion": "Con $x-c$ la gráfica se corre $c$ hacia la derecha. Aquí $c=\\frac{\\pi}{4}$, así que se corre $\\frac{\\pi}{4}$ a la derecha; con signo más iría a la izquierda."
    },
    {
      "pregunta": "¿Qué desfase tiene $y=\\cos\\left(x+\\frac{\\pi}{6}\\right)$?",
      "opciones": [
        "$\\frac{\\pi}{6}$ hacia la derecha",
        "$\\frac{\\pi}{3}$ hacia la izquierda",
        "$\\frac{\\pi}{6}$ hacia la izquierda",
        "No tiene desfase"
      ],
      "respuesta": "$\\frac{\\pi}{6}$ hacia la izquierda",
      "explicacion": "$\\cos\\left(x+\\frac{\\pi}{6}\\right)=\\cos\\left(x-\\left(-\\frac{\\pi}{6}\\right)\\right)$: el desfase es $-\\frac{\\pi}{6}$, es decir, $\\frac{\\pi}{6}$ hacia la izquierda."
    },
    {
      "pregunta": "¿Qué desfase tiene $y=\\operatorname{sen}(2x-\\pi)$?",
      "opciones": [
        "$\\pi$ hacia la derecha",
        "$2\\pi$ hacia la derecha",
        "$\\frac{\\pi}{2}$ hacia la izquierda",
        "$\\frac{\\pi}{2}$ hacia la derecha"
      ],
      "respuesta": "$\\frac{\\pi}{2}$ hacia la derecha",
      "explicacion": "Hay que factorizar: $2x-\\pi=2\\left(x-\\frac{\\pi}{2}\\right)$, así que el desfase es $\\frac{\\pi}{2}$ a la derecha. El desfase no es $\\pi$: se divide entre $b=2$."
    },
    {
      "pregunta": "Para $y=2\\cos\\left(x\\right)-3$, ¿cuál es la línea media y cuál el máximo?",
      "opciones": [
        "$y=-3$ y máximo $-1$",
        "$y=2$ y máximo $5$",
        "$y=0$ y máximo $2$",
        "$y=-3$ y máximo $-5$"
      ],
      "respuesta": "$y=-3$ y máximo $-1$",
      "explicacion": "La línea media es $y=d=-3$ y el máximo es $d+|a|=-3+2=-1$. El máximo no es $d$ ni $|a|$: es su suma."
    },
    {
      "pregunta": "Se le suma 4 a $y=\\operatorname{sen}(x)$ para obtener $y=\\operatorname{sen}(x)+4$. ¿Qué pasa con la amplitud?",
      "opciones": [
        "Pasa a ser 4",
        "Pasa a ser 5",
        "Se reduce a la mitad",
        "No cambia: sigue siendo 1; la onda sube 4 unidades"
      ],
      "respuesta": "No cambia: sigue siendo 1; la onda sube 4 unidades",
      "explicacion": "El desplazamiento vertical solo sube la gráfica: el máximo es 5 y el mínimo 3, pero la distancia de la línea media al máximo sigue siendo 1."
    },
    {
      "pregunta": "Para $y=3\\operatorname{sen}\\left(2\\left(x-\\frac{\\pi}{4}\\right)\\right)-1$, ¿cuánto vale el máximo?",
      "opciones": [
        "$2$",
        "$3$",
        "$-1$",
        "$-4$"
      ],
      "respuesta": "$2$",
      "explicacion": "Máximo $=d+|a|=-1+3=2$. El 3 es la amplitud, $-1$ es la línea media y $-4$ es el mínimo."
    }
  ]
}$trigonometria$::jsonb,
  5,
  true),

('trigonometria-clase-17-la-tangente-y-sus-asintotas', 'La tangente y sus asíntotas',
  'Por qué la gráfica de la tangente se dispara en π/2 + kπ, qué es una asíntota y por qué su periodo es π.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás dibujar la gráfica de $y=\\tan(x)$, ubicar sus asíntotas verticales y calcular su periodo, también cuando el argumento es $bx$.",
    "Intuición. La tangente es el cociente $\\tan(x)=\\frac{\\operatorname{sen}(x)}{\\cos(x)}$. Cuando el coseno se acerca a 0 (el punto del círculo está casi arriba o casi abajo), el cociente se hace enorme; y cuando el coseno es 0, no se puede dividir: la tangente no existe. Por eso su gráfica se dispara hacia arriba o hacia abajo cerca de esos valores.",
    "Las rectas verticales a las que se acerca la gráfica sin tocarlas se llaman asíntotas verticales. Para $y=\\tan(x)$ están donde $\\cos(x)=0$: en $x=\\frac{\\pi}{2}+k\\pi$, con $k$ entero (por ejemplo $-\\frac{\\pi}{2}$, $\\frac{\\pi}{2}$, $\\frac{3\\pi}{2}$). Entre dos asíntotas consecutivas la tangente crece de $-\\infty$ a $+\\infty$ pasando por 0 en el medio.",
    "Valores para orientarse: $\\tan(0)=0$; $\\tan\\left(\\frac{\\pi}{4}\\right)=1$; $\\tan\\left(-\\frac{\\pi}{4}\\right)=-1$. Corta al eje $x$ en todos los múltiplos de $\\pi$ (donde el seno vale 0).",
    "Periodo. La tangente se repite cada $\\pi$, no cada $2\\pi$: al sumar $\\pi$ (media vuelta) el seno y el coseno cambian de signo a la vez, y el cociente no cambia: $\\tan(x+\\pi)=\\tan(x)$. Además, no tiene amplitud: no hay máximo ni mínimo, y su rango son todos los números reales.",
    "Con $y=\\tan(bx)$ el periodo es $\\frac{\\pi}{b}$ y las asíntotas quedan en $x=\\frac{\\pi}{2b}+k\\frac{\\pi}{b}$. Por ejemplo, $y=\\tan(2x)$ tiene periodo $\\frac{\\pi}{2}$ y sus asíntotas cerca del origen están en $x=-\\frac{\\pi}{4}$ y $x=\\frac{\\pi}{4}$.",
    "Errores comunes. 1) Dibujar la tangente como una onda que sube y baja entre dos valores: no está acotada. 2) Olvidar las asíntotas o cruzarlas con la curva. 3) Usar $2\\pi$ como periodo. 4) Buscar la amplitud de la tangente: no existe."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 2,
      "titulo": "$y=\\tan(x)$ y sus asíntotas",
      "onda": {
        "fn": "tan"
      },
      "rango": [
        -1,
        1
      ],
      "pasos": [
        "curva",
        "asintotas"
      ]
    },
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 5,
      "titulo": "$y=\\tan(2x)$ contra $y=\\tan(x)$ (punteada)",
      "onda": {
        "fn": "tan",
        "b": 2
      },
      "base": {
        "fn": "tan"
      },
      "rango": [
        -1,
        1
      ],
      "pasos": [
        "curva",
        "periodo",
        "asintotas"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿En qué valores de $x$, entre $-\\pi$ y $\\pi$, tiene asíntotas verticales $y=\\tan(x)$?",
      "opciones": [
        "$x=-\\pi$, $x=0$ y $x=\\pi$",
        "$x=0$ solamente",
        "$x=-\\dfrac{\\pi}{2}$ y $x=\\dfrac{\\pi}{2}$",
        "$x=-\\dfrac{\\pi}{4}$ y $x=\\dfrac{\\pi}{4}$"
      ],
      "respuesta": "$x=-\\dfrac{\\pi}{2}$ y $x=\\dfrac{\\pi}{2}$",
      "explicacion": "Las asíntotas están donde $\\cos(x)=0$, es decir, en $\\frac{\\pi}{2}+k\\pi$. En los múltiplos de $\\pi$ la tangente vale 0 y en $\\pm\\frac{\\pi}{4}$ vale $\\pm 1$."
    },
    {
      "pregunta": "¿Cuál es el periodo de $y=\\tan(x)$?",
      "opciones": [
        "$2\\pi$",
        "$\\pi$",
        "$\\dfrac{\\pi}{2}$",
        "No tiene periodo"
      ],
      "respuesta": "$\\pi$",
      "explicacion": "$\\tan(x+\\pi)=\\tan(x)$: al sumar media vuelta, el seno y el coseno cambian de signo juntos y el cociente no cambia."
    },
    {
      "pregunta": "¿Por qué $\\tan\\!\\left(\\dfrac{\\pi}{2}\\right)$ no existe?",
      "opciones": [
        "Porque $\\operatorname{sen}\\!\\left(\\dfrac{\\pi}{2}\\right)=0$",
        "Porque $\\dfrac{\\pi}{2}$ es un ángulo demasiado pequeño",
        "Porque $\\cos\\!\\left(\\dfrac{\\pi}{2}\\right)=0$ y no se puede dividir entre 0",
        "Porque la tangente solo se define para ángulos agudos"
      ],
      "respuesta": "Porque $\\cos\\!\\left(\\dfrac{\\pi}{2}\\right)=0$ y no se puede dividir entre 0",
      "explicacion": "$\\tan=\\frac{\\operatorname{sen}}{\\cos}$ y en $\\frac{\\pi}{2}$ el coseno vale 0. El seno vale 1 allí."
    },
    {
      "pregunta": "¿Cuál es el periodo de $y=\\tan(2x)$?",
      "opciones": [
        "$\\pi$",
        "$\\frac{\\pi}{2}$",
        "$2\\pi$",
        "$4\\pi$"
      ],
      "respuesta": "$\\frac{\\pi}{2}$",
      "explicacion": "Con $b=2$, el periodo de la tangente es $\\frac{\\pi}{b}=\\frac{\\pi}{2}$: la gráfica se repite el doble de rápido que $y=\\tan(x)$."
    },
    {
      "pregunta": "¿Cuál es el rango de la función tangente?",
      "opciones": [
        "Entre $-1$ y $1$",
        "Entre $0$ y $\\pi$",
        "Los reales positivos",
        "Todos los números reales"
      ],
      "respuesta": "Todos los números reales",
      "explicacion": "Cerca de una asíntota la tangente se hace tan grande como se quiera, positiva o negativa. No tiene máximo ni mínimo, y por eso tampoco amplitud."
    }
  ]
}$trigonometria$::jsonb,
  6,
  true),

('trigonometria-clase-18-leer-y-escribir-la-ecuacion-de-una-grafica', 'Leer y escribir la ecuación de una gráfica',
  'El método de cuatro pasos para pasar de una onda dibujada a su ecuación y comprobarla.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás escribir la ecuación $y=a\\operatorname{sen}(b(x-c))+d$ (o con coseno) de una onda a partir de su gráfica, y dibujar la onda a partir de la ecuación.",
    "Intuición. La ecuación es el «código» de la onda: cada número describe una característica que se puede leer en el dibujo. Leer la ecuación de una gráfica es encontrar esos cuatro números, uno por uno.",
    "El método. 1) Con el máximo $M$ y el mínimo $m$: línea media $d=\\frac{M+m}{2}$ y amplitud $|a|=\\frac{M-m}{2}$. 2) Con la distancia $P$ entre dos máximos consecutivos (el periodo): $b=\\frac{2\\pi}{P}$. 3) Elige coseno (si conviene arrancar en un máximo) o seno (si arranca en la línea media) y halla el desfase $c$ desde donde empieza el ciclo. 4) Comprueba con un punto de la gráfica.",
    "Ejemplo resuelto. Una onda tiene máximo $5$, mínimo $-1$, periodo $\\pi$ y su primer máximo positivo está en $x=\\frac{\\pi}{4}$. Paso 1: $d=\\frac{5+(-1)}{2}=2$ y $a=\\frac{5-(-1)}{2}=3$. Paso 2: $b=\\frac{2\\pi}{\\pi}=2$. Paso 3: con coseno, el desfase es donde hay un máximo: $c=\\frac{\\pi}{4}$. Resultado: $y=3\\cos\\left(2\\left(x-\\frac{\\pi}{4}\\right)\\right)+2$.",
    "Comprobación. En $x=\\frac{\\pi}{4}$: $3\\cos(2\\cdot 0)+2=3+2=5$, el máximo. Y en $x=\\frac{3\\pi}{4}$: $3\\cos\\left(2\\cdot\\frac{\\pi}{2}\\right)+2=3\\cdot(-1)+2=-1$, el mínimo. La ecuación está bien.",
    "Varias ecuaciones para la misma gráfica. Con seno es más simple, porque la misma onda arranca en la línea media: $y=3\\operatorname{sen}\\left(2x\\right)+2$. Las dos ecuaciones describen exactamente la misma gráfica: $3\\cos\\left(2\\left(x-\\frac{\\pi}{4}\\right)\\right)+2=3\\operatorname{sen}(2x)+2$. Se elige la que dé el desfase más simple (a menudo 0). Sumar un periodo entero al desfase también da una ecuación válida.",
    "Del lado contrario, leer la ecuación. Dada $y=-2\\operatorname{sen}\\left(\\frac{1}{2}x\\right)+1$: $a=-2$, así que la amplitud es 2 y la gráfica está reflejada (baja primero); $b=\\frac{1}{2}$, así que el periodo es $4\\pi$; la línea media es $y=1$, con máximo $3$ y mínimo $-1$.",
    "Errores comunes. 1) Tomar el mínimo como punto de partida del desfase del coseno: el coseno sin reflejar arranca en un MÁXIMO. 2) Calcular $b=\\frac{P}{2\\pi}$ en lugar de $\\frac{2\\pi}{P}$. 3) Confundir la línea media con la amplitud. 4) Olvidar comprobar con un punto: un error de signo en el desfase se nota al reemplazar."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 3,
      "titulo": "$y=3\\cos\\left(2\\left(x-\\frac{\\pi}{4}\\right)\\right)+2$",
      "onda": {
        "fn": "cos",
        "a": 3,
        "b": 2,
        "c": [
          1,
          4
        ],
        "d": 2
      },
      "rango": [
        0,
        2
      ],
      "pasos": [
        "curva",
        "vertical",
        "amplitud",
        "periodo",
        "desfase",
        "puntos"
      ]
    },
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 5,
      "titulo": "La misma gráfica escrita con seno: $y=3\\operatorname{sen}(2x)+2$",
      "onda": {
        "fn": "sen",
        "a": 3,
        "b": 2,
        "d": 2
      },
      "base": {
        "fn": "cos",
        "a": 3,
        "b": 2,
        "c": [
          1,
          4
        ],
        "d": 2
      },
      "rango": [
        0,
        2
      ],
      "pasos": [
        "curva",
        "puntos"
      ]
    },
    {
      "tipo": "trigonometria.onda",
      "despuesDePaso": 6,
      "titulo": "$y=-2\\operatorname{sen}\\left(\\frac{x}{2}\\right)+1$",
      "onda": {
        "fn": "sen",
        "a": -2,
        "b": [
          1,
          2
        ],
        "d": 1
      },
      "rango": [
        0,
        4
      ],
      "pasos": [
        "curva",
        "vertical",
        "amplitud",
        "periodo"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "Una onda tiene máximo 7 y mínimo 1. ¿Cuál es su línea media y cuál su amplitud?",
      "opciones": [
        "Línea media $y=4$ y amplitud $3$",
        "Línea media $y=3$ y amplitud $4$",
        "Línea media $y=6$ y amplitud $4$",
        "Línea media $y=4$ y amplitud $6$"
      ],
      "respuesta": "Línea media $y=4$ y amplitud $3$",
      "explicacion": "$d=\\frac{7+1}{2}=4$ y $|a|=\\frac{7-1}{2}=3$. El 6 es la distancia total de un extremo al otro."
    },
    {
      "pregunta": "Una onda tiene periodo $\\pi$. ¿Cuánto vale $b$ en su ecuación?",
      "opciones": [
        "$2$",
        "$\\dfrac{1}{2}$",
        "$\\pi$",
        "$2\\pi$"
      ],
      "respuesta": "$2$",
      "explicacion": "$b=\\frac{2\\pi}{P}=\\frac{2\\pi}{\\pi}=2$. Con $b=\\frac{1}{2}$ el periodo sería $4\\pi$."
    },
    {
      "pregunta": "Una onda tipo coseno de amplitud 1, periodo $2\\pi$, sin desplazamiento vertical, tiene su primer máximo positivo en $x=\\frac{\\pi}{3}$. ¿Cuál es su ecuación?",
      "opciones": [
        "$y=\\cos\\left(x-\\frac{\\pi}{3}\\right)$",
        "$y=\\cos\\left(x+\\dfrac{\\pi}{3}\\right)$",
        "$y=\\cos(3x)$",
        "$y=\\operatorname{sen}\\left(x-\\dfrac{\\pi}{3}\\right)$"
      ],
      "respuesta": "$y=\\cos\\left(x-\\frac{\\pi}{3}\\right)$",
      "explicacion": "El coseno sin desplazar tiene el máximo en $x=0$; para que esté en $\\frac{\\pi}{3}$ se corre a la derecha: $\\cos\\left(x-\\frac{\\pi}{3}\\right)$. Con signo más iría a la izquierda, y $\\cos(3x)$ cambia el periodo."
    },
    {
      "pregunta": "¿Son $y=3\\cos\\left(2\\left(x-\\frac{\\pi}{4}\\right)\\right)+2$ e $y=3\\operatorname{sen}\\left(2x\\right)+2$ la misma gráfica?",
      "opciones": [
        "Sí: son dos ecuaciones de la misma onda",
        "No: tienen distinta amplitud",
        "No: tienen distinto periodo",
        "Solo coinciden en el máximo"
      ],
      "respuesta": "Sí: son dos ecuaciones de la misma onda",
      "explicacion": "Las dos tienen amplitud 3, periodo $\\pi$ y línea media 2. La del seno arranca en la línea media y la del coseno en un máximo corrido $\\frac{\\pi}{4}$; comparten todos sus puntos."
    },
    {
      "pregunta": "Una gráfica tiene periodo $4\\pi$. ¿Cuánto vale $b$?",
      "opciones": [
        "$2$",
        "$\\dfrac{1}{2}$",
        "$4\\pi$",
        "$\\dfrac{1}{4}$"
      ],
      "respuesta": "$\\dfrac{1}{2}$",
      "explicacion": "$b=\\frac{2\\pi}{4\\pi}=\\frac{1}{2}$. Un periodo largo significa un $b$ chico."
    }
  ]
}$trigonometria$::jsonb,
  7,
  true),

('trigonometria-clase-19-ley-del-seno', 'Ley del seno',
  'Triángulos sin ángulo recto: de dónde sale la ley del seno y cómo hallar un lado o un ángulo cuando hay una pareja ángulo–lado opuesto.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás resolver triángulos que no tienen ángulo recto usando la ley del seno para hallar un lado o un ángulo, siempre que conozcas una pareja completa: un ángulo y su lado opuesto.",
    "Intuición. Un triángulo sin ángulo recto se llama oblicuo. Aunque no tenga ángulo recto, se le puede trazar una altura que lo parte en dos triángulos rectángulos, y ahí aparece el seno. Esa altura mide $h=b\\operatorname{sen}(A)$ y también $h=a\\operatorname{sen}(B)$. Igualándolas, $b\\operatorname{sen}(A)=a\\operatorname{sen}(B)$, es decir, $\\frac{a}{\\operatorname{sen}(A)}=\\frac{b}{\\operatorname{sen}(B)}$.",
    "La ley del seno. En todo triángulo, con la convención de que el lado $a$ es opuesto al ángulo $A$, el $b$ al $B$ y el $c$ al $C$: $\\dfrac{a}{\\operatorname{sen}(A)}=\\dfrac{b}{\\operatorname{sen}(B)}=\\dfrac{c}{\\operatorname{sen}(C)}$. En palabras: cada lado dividido entre el seno de su ángulo opuesto da siempre el mismo número.",
    "Cuándo sirve. Cuando conoces una pareja completa (un ángulo y su lado opuesto) y un dato más: otro ángulo o otro lado. Es el caso de dos ángulos y un lado (ASA o AAS). Antes de empezar, si te dan dos ángulos, calcula el tercero: los tres suman $180^{\\circ}$.",
    "Ejemplo 1: hallar un lado. En un triángulo, $A=40^{\\circ}$, $B=65^{\\circ}$ y $a=12$. Primero, $C=180^{\\circ}-40^{\\circ}-65^{\\circ}=75^{\\circ}$. La pareja completa es $A$ y $a$. Entonces $\\dfrac{b}{\\operatorname{sen}(65^{\\circ})}=\\dfrac{12}{\\operatorname{sen}(40^{\\circ})}$, y $b=12\\cdot\\dfrac{\\operatorname{sen}(65^{\\circ})}{\\operatorname{sen}(40^{\\circ})}\\approx 16{,}92$.",
    "Ejemplo 2: hallar un ángulo. Un triángulo tiene $a=13$, $b=10$ y $A=50^{\\circ}$. La pareja completa es $A$ y $a$: $\\dfrac{\\operatorname{sen}(B)}{10}=\\dfrac{\\operatorname{sen}(50^{\\circ})}{13}$, así que $\\operatorname{sen}(B)=\\dfrac{10\\cdot\\operatorname{sen}(50^{\\circ})}{13}\\approx 0{,}5893$ y $B=\\operatorname{sen}^{-1}(0,5893)\\approx 36,1^{\\circ}$. Al ser $a>b$, el ángulo $B$ tiene que ser menor que $A$: es agudo y no hay otra posibilidad (la clase 22 explica qué pasa si $a<b$).",
    "Errores comunes. 1) Usar la ley del seno cuando no hay una pareja completa (por ejemplo, con dos lados y el ángulo entre ellos: ahí se usa el coseno). 2) Poner un lado que no es el opuesto al ángulo en la fracción. 3) Despejar mal: si el seno queda en el denominador, se divide. 4) Tener la calculadora en radianes."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.ley",
      "despuesDePaso": 2,
      "titulo": "Ley del seno: $A=40^{\\circ}$, $B=65^{\\circ}$ y $a=12$",
      "ley": "seno",
      "datos": {
        "A": 40,
        "B": 65,
        "a": 12
      }
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 5,
      "titulo": "Hallar un ángulo con la ley del seno",
      "cuadros": [
        {
          "texto": "Se conocen $a=13$, $b=10$ y $A=50^{\\circ}$. Se arma la igualdad con la pareja completa.",
          "formula": "\\dfrac{\\operatorname{sen}(B)}{10}=\\dfrac{\\operatorname{sen}(50^{\\circ})}{13}"
        },
        {
          "texto": "Se despeja el seno de $B$.",
          "formula": "\\operatorname{sen}(B)=\\dfrac{10\\cdot\\operatorname{sen}(50^{\\circ})}{13}\\approx 0{,}5893"
        },
        {
          "texto": "Se aplica el seno inverso:",
          "resaltar": "B ≈ 36,1°"
        }
      ],
      "msPorCuadro": 2800
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la ley del seno para un triángulo con lados $a$, $b$ y ángulos opuestos $A$, $B$?",
      "opciones": [
        "$\\dfrac{a}{\\operatorname{sen}(B)}=\\dfrac{b}{\\operatorname{sen}(A)}$",
        "$\\dfrac{a}{\\operatorname{sen}(A)}=\\dfrac{b}{\\operatorname{sen}(B)}$",
        "$a\\operatorname{sen}(A)=b\\operatorname{sen}(B)$",
        "$a^{2}=b^{2}+c^{2}-2bc\\cos(A)$"
      ],
      "respuesta": "$\\dfrac{a}{\\operatorname{sen}(A)}=\\dfrac{b}{\\operatorname{sen}(B)}$",
      "explicacion": "Cada lado va con el seno de SU ángulo opuesto. La segunda opción cruza las parejas y la última es la ley del coseno."
    },
    {
      "pregunta": "En un triángulo, $A=30^{\\circ}$, $B=45^{\\circ}$ y $a=10$. ¿Cuánto mide $b$?",
      "opciones": [
        "7,07",
        "14,14",
        "3,54",
        "5"
      ],
      "respuesta": "14,14",
      "explicacion": "$b=\\frac{10\\cdot\\operatorname{sen}(45^{\\circ})}{\\operatorname{sen}(30^{\\circ})}\\approx 14{,}14$. El valor 7,07 invierte las parejas."
    },
    {
      "pregunta": "Un triángulo tiene $A=40^{\\circ}$ y $B=65^{\\circ}$. ¿Cuánto mide $C$?",
      "opciones": [
        "$105^{\\circ}$",
        "$25^{\\circ}$",
        "$75^{\\circ}$",
        "$140^{\\circ}$"
      ],
      "respuesta": "$75^{\\circ}$",
      "explicacion": "Los tres ángulos suman $180^{\\circ}$: $180-40-65=75$. El valor $105^{\\circ}$ es $40+65$, la suma de los dos que ya se conocían."
    },
    {
      "pregunta": "¿Con cuál de estos datos se puede usar la ley del seno directamente?",
      "opciones": [
        "Dos lados y el ángulo que está entre ellos",
        "Los tres lados",
        "Solo los tres ángulos",
        "Un ángulo, su lado opuesto y otro ángulo"
      ],
      "respuesta": "Un ángulo, su lado opuesto y otro ángulo",
      "explicacion": "La ley del seno necesita una pareja completa (ángulo y lado opuesto) más un dato. Con dos lados y el ángulo entre ellos, o con tres lados, se usa la ley del coseno; con tres ángulos solo se conoce la forma, no el tamaño."
    },
    {
      "pregunta": "Un triángulo tiene $a=13$, $b=10$ y $A=50^{\\circ}$. ¿Cuánto mide $B$ (un decimal)?",
      "opciones": [
        "$143{,}9^{\\circ}$",
        "$84{,}8^{\\circ}$",
        "$36{,}1^{\\circ}$",
        "$53{,}9^{\\circ}$"
      ],
      "respuesta": "$36{,}1^{\\circ}$",
      "explicacion": "$\\operatorname{sen}(B)=\\frac{10\\cdot\\operatorname{sen}(50^{\\circ})}{13}\\approx 0{,}5893$, así que $B\\approx 36{,}1^{\\circ}$. El valor 143,9° no cabe (con $A=50^{\\circ}$ la suma pasaría de $180^{\\circ}$), 84,8° intercambia $a$ y $b$ y 53,9° usó el coseno inverso."
    }
  ]
}$trigonometria$::jsonb,
  1,
  true),

('trigonometria-clase-20-ley-del-coseno', 'Ley del coseno',
  'El teorema de Pitágoras generalizado: hallar el tercer lado con dos lados y el ángulo entre ellos, o un ángulo con los tres lados.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás usar la ley del coseno para hallar el tercer lado de un triángulo cuando conoces dos lados y el ángulo entre ellos, o un ángulo cuando conoces los tres lados.",
    "Intuición. Cuando conoces dos lados y el ángulo que está ENTRE ellos (SAS), o los tres lados (SSS), no tienes ninguna pareja ángulo–lado opuesto: la ley del seno no puede arrancar. Hace falta otra herramienta. La ley del coseno es el teorema de Pitágoras con un término de corrección para los triángulos que no tienen ángulo recto.",
    "La ley del coseno. $c^{2}=a^{2}+b^{2}-2ab\\cos(C)$. Se lee: el cuadrado de un lado es la suma de los cuadrados de los otros dos menos el doble de su producto por el coseno del ángulo que está ENTRE esos dos lados. Hay una versión para cada lado ($a^{2}=b^{2}+c^{2}-2bc\\cos(A)$, etc.).",
    "Relación con Pitágoras. Si $C=90^{\\circ}$, entonces $\\cos(C)=0$ y queda $c^{2}=a^{2}+b^{2}$. Si $C$ es agudo, el término restado es positivo y $c^{2}<a^{2}+b^{2}$; si $C$ es obtuso, $\\cos(C)$ es negativo y el término se suma: $c^{2}>a^{2}+b^{2}$. La ley funciona sola con cualquier ángulo, sin pensar en signos.",
    "Ejemplo 1: hallar el tercer lado (SAS). Dos lados miden $a=8$ y $b=11$ y el ángulo entre ellos es $C=50^{\\circ}$. $c^{2}=8^{2}+11^{2}-2\\cdot 8\\cdot 11\\cdot\\cos(50^{\\circ})\\approx 71{,}87$. Entonces $c=\\sqrt{71{,}87}\\approx 8{,}48$. Calcula el producto completo $2ab\\cos(C)$ antes de restar.",
    "Ejemplo 2: hallar un ángulo (SSS). Un triángulo tiene lados $a=7$, $b=10$ y $c=12$. Para el ángulo $C$, se despeja el coseno: $\\cos(C)=\\dfrac{a^{2}+b^{2}-c^{2}}{2ab}=\\dfrac{49+100-144}{140}\\approx 0{,}0357$, así que $C\\approx 88^{\\circ}$.",
    "Una ventaja al hallar ángulos. La calculadora devuelve con el coseno inverso el ángulo correcto entre $0^{\\circ}$ y $180^{\\circ}$, aunque sea obtuso. Por ejemplo, con lados 5, 7 y 10, el ángulo opuesto al 10 tiene $\\cos=\\frac{25+49-100}{70}\\approx -0{,}371$: negativo, y por eso el ángulo es obtuso, 111,8°. Con el seno inverso, en cambio, habría dado un ángulo agudo equivocado.",
    "Errores comunes. 1) Olvidar el «−2ab» o el cuadrado de algún lado. 2) Restar antes de multiplicar: $a^{2}+b^{2}-2ab\\cos(C)$ no es $(a^{2}+b^{2}-2ab)\\cos(C)$. 3) Olvidar la raíz cuadrada al final: la fórmula da $c^{2}$. 4) Usar como $C$ el ángulo que no está entre los lados $a$ y $b$. 5) Calculadora en radianes."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.ley",
      "despuesDePaso": 2,
      "titulo": "Ley del coseno: $a=8$, $b=11$ y $C=50^{\\circ}$",
      "ley": "coseno",
      "datos": {
        "a": 8,
        "b": 11,
        "C": 50
      }
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 5,
      "titulo": "Hallar un ángulo con la ley del coseno",
      "cuadros": [
        {
          "texto": "Lados $a=7$, $b=10$, $c=12$. Se despeja $\\cos(C)$ de la ley del coseno.",
          "formula": "\\cos(C)=\\dfrac{a^{2}+b^{2}-c^{2}}{2ab}"
        },
        {
          "texto": "Se reemplazan los lados.",
          "formula": "\\cos(C)=\\dfrac{49+100-144}{140}\\approx 0{,}0357"
        },
        {
          "texto": "Coseno inverso:",
          "resaltar": "C ≈ 88°"
        }
      ],
      "msPorCuadro": 2800
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la ley del coseno para el lado $c$?",
      "opciones": [
        "$c^{2}=a^{2}+b^{2}+2ab\\cos(C)$",
        "$c=a^{2}+b^{2}-2ab\\cos(C)$",
        "$c^{2}=a^{2}+b^{2}-2ab\\cos(C)$",
        "$c^{2}=a^{2}+b^{2}-2\\cos(C)$"
      ],
      "respuesta": "$c^{2}=a^{2}+b^{2}-2ab\\cos(C)$",
      "explicacion": "Es el cuadrado de $c$ y el término es $-2ab\\cos(C)$, con el ángulo $C$ entre los lados $a$ y $b$. Con signo más se calcularía el lado de un triángulo con el ángulo suplementario $180^{\\circ}-C$; las otras dos no tienen las unidades correctas (lado contra lado al cuadrado, o sin el producto $ab$)."
    },
    {
      "pregunta": "Dos lados miden 8 y 11 y el ángulo entre ellos es $50^{\\circ}$. ¿Cuánto mide el tercer lado?",
      "opciones": [
        "71,87",
        "17,27",
        "13,6",
        "8,48"
      ],
      "respuesta": "8,48",
      "explicacion": "$c^{2}\\approx 71{,}87$ y $c\\approx 8{,}48$. El valor 71,87 olvida la raíz, 17,27 suma el término en lugar de restarlo y 13,6 aplica Pitágoras (ángulo recto)."
    },
    {
      "pregunta": "Si el ángulo $C$ entre dos lados mide $90^{\\circ}$, ¿a qué se reduce la ley del coseno?",
      "opciones": [
        "A la ley del seno",
        "Al teorema de Pitágoras: $c^{2}=a^{2}+b^{2}$",
        "A $c^{2}=a^{2}+b^{2}+2ab$",
        "A $c=a+b$"
      ],
      "respuesta": "Al teorema de Pitágoras: $c^{2}=a^{2}+b^{2}$",
      "explicacion": "Como $\\cos(90^{\\circ})=0$, el término $-2ab\\cos(C)$ desaparece y queda $c^{2}=a^{2}+b^{2}$."
    },
    {
      "pregunta": "Un triángulo tiene lados 5, 7 y 10. El ángulo opuesto al lado 10, ¿es agudo u obtuso?",
      "opciones": [
        "Agudo: el lado mayor siempre da un ángulo agudo",
        "Recto",
        "No se puede saber sin calcular el seno",
        "Obtuso: el coseno sale negativo"
      ],
      "respuesta": "Obtuso: el coseno sale negativo",
      "explicacion": "$\\cos=\\frac{5^{2}+7^{2}-10^{2}}{2\\cdot 5\\cdot 7}=\\frac{-26}{70}\\approx -0{,}371$: negativo, así que el ángulo es obtuso (111,8°). Es un lado grande, pero $10^{2}=100>5^{2}+7^{2}=74$."
    },
    {
      "pregunta": "Un triángulo tiene lados $a=7$, $b=10$ y $c=12$. ¿Cuánto mide el ángulo $C$ (un decimal)?",
      "opciones": [
        "$35{,}7^{\\circ}$",
        "$56{,}4^{\\circ}$",
        "$85{,}9^{\\circ}$",
        "$88^{\\circ}$"
      ],
      "respuesta": "$88^{\\circ}$",
      "explicacion": "$\\cos(C)=\\frac{49+100-144}{140}\\approx 0{,}0357$ y $C\\approx 88^{\\circ}$. Los ángulos 35,7° y 56,4° son los otros dos del triángulo, y 85,9° sale de olvidar el 2 del denominador."
    }
  ]
}$trigonometria$::jsonb,
  2,
  true),

('trigonometria-clase-21-cual-ley-usar-y-area', 'Cuál ley usar y el área del triángulo',
  'Cómo decidir entre la ley del seno y la del coseno mirando los datos, el área con ½·a·b·sen C y problemas de aplicación.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás elegir la ley correcta según los datos de un triángulo, calcular su área con dos lados y el ángulo entre ellos, y resolver problemas de aplicación.",
    "Intuición. La pregunta que decide todo: ¿tengo una pareja completa, un ángulo y su lado opuesto? Si sí, ley del seno. Si no, ley del coseno. Mira la tabla de casos en el cuadro.",
    "Área. Si conoces dos lados y el ángulo que está entre ellos, el área es $\\frac{1}{2}\\,a\\,b\\operatorname{sen}(C)$. Sale de $\\text{Área}=\\frac{1}{2}\\cdot\\text{base}\\cdot\\text{altura}$: con base $b$, la altura sobre ese lado mide $h=a\\operatorname{sen}(C)$ (es el cateto de un triángulo rectángulo con hipotenusa $a$).",
    "Ejemplo 1. Dos lados miden 10 y 7 y el ángulo entre ellos es $35^{\\circ}$: $\\text{Área}=\\dfrac{1}{2}\\cdot 10\\cdot 7\\cdot\\operatorname{sen}(35^{\\circ})\\approx 20{,}08$.",
    "Con un ángulo obtuso. La fórmula sirve igual, porque $\\operatorname{sen}(180^{\\circ}-C)=\\operatorname{sen}(C)$ (los dos ángulos suplementarios tienen el mismo seno). Por ejemplo, con lados 6 y 9 y un ángulo de $130^{\\circ}$: $\\text{Área}=\\dfrac{1}{2}\\cdot 6\\cdot 9\\cdot\\operatorname{sen}(130^{\\circ})\\approx 20{,}68$.",
    "Una aplicación. Para medir la distancia entre dos puntos $A$ y $B$ separados por un lago, se elige un punto $P$ desde el que $PA=120$ m, $PB=90$ m y el ángulo $APB$ mide $65^{\\circ}$. Son dos lados y el ángulo entre ellos: ley del coseno. $AB^{2}=120^{2}+90^{2}-2\\cdot 120\\cdot 90\\cdot\\cos(65^{\\circ})\\approx 13371$, así que $AB\\approx 115,63$ m.",
    "Errores comunes. 1) Usar la ley del seno sin pareja completa. 2) En el área, usar un ángulo que no está entre los dos lados dados. 3) Olvidar el $\\frac{1}{2}$. 4) En una aplicación, no dibujar el triángulo antes de decidir la ley."
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 1,
      "titulo": "¿Qué ley uso?",
      "cuadros": [
        {
          "texto": "Dos ángulos y un lado (ASA o AAS): halla primero el tercer ángulo. Hay pareja completa.",
          "resaltar": "Ley del seno"
        },
        {
          "texto": "Dos lados y el ángulo entre ellos (SAS): no hay pareja completa. Se busca el tercer lado.",
          "resaltar": "Ley del coseno"
        },
        {
          "texto": "Los tres lados (SSS): se busca un ángulo despejando su coseno.",
          "resaltar": "Ley del coseno"
        },
        {
          "texto": "Dos lados y un ángulo que NO está entre ellos (SSA): ley del seno, con cuidado: puede haber dos soluciones (clase 22)."
        }
      ],
      "msPorCuadro": 3200
    },
    {
      "tipo": "trigonometria.ley",
      "despuesDePaso": 2,
      "titulo": "Área con la altura: $a=10$, $b=7$ y $C=35^{\\circ}$",
      "ley": "area",
      "datos": {
        "a": 10,
        "b": 7,
        "C": 35
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "Conoces dos lados y el ángulo que está entre ellos. ¿Qué ley usas para hallar el tercer lado?",
      "opciones": [
        "La ley del seno",
        "Solo el teorema de Pitágoras",
        "Ninguna: faltan datos",
        "La ley del coseno"
      ],
      "respuesta": "La ley del coseno",
      "explicacion": "No hay ninguna pareja ángulo–lado opuesto, así que la ley del seno no arranca. La ley del coseno usa justo esos tres datos (SAS)."
    },
    {
      "pregunta": "Te dan dos ángulos y un lado. ¿Qué haces primero?",
      "opciones": [
        "Calcular el tercer ángulo y usar la ley del seno",
        "Usar la ley del coseno",
        "Calcular el área",
        "Restar los lados"
      ],
      "respuesta": "Calcular el tercer ángulo y usar la ley del seno",
      "explicacion": "Los tres ángulos suman $180^{\\circ}$, y con el tercer ángulo hay una pareja completa para la ley del seno."
    },
    {
      "pregunta": "Dos lados miden 10 y 7 y el ángulo entre ellos es $35^{\\circ}$. ¿Cuál es el área del triángulo?",
      "opciones": [
        "40,15",
        "28,67",
        "20,08",
        "35"
      ],
      "respuesta": "20,08",
      "explicacion": "$\\frac{1}{2}\\cdot 10\\cdot 7\\cdot\\operatorname{sen}(35^{\\circ})\\approx 20{,}08$. El valor 40,15 olvida el $\\frac{1}{2}$ y 28,67 usa el coseno."
    },
    {
      "pregunta": "Los tres lados de un triángulo miden 5, 6 y 7. ¿Qué ley usas para hallar uno de sus ángulos?",
      "opciones": [
        "La ley del coseno",
        "La ley del seno",
        "Ninguna: hace falta un ángulo",
        "El teorema de Pitágoras"
      ],
      "respuesta": "La ley del coseno",
      "explicacion": "Con tres lados y ningún ángulo no hay pareja completa: se despeja el coseno de la ley del coseno."
    },
    {
      "pregunta": "Desde un punto $P$, $PA=120$ m, $PB=90$ m y el ángulo $APB$ mide $65^{\\circ}$. ¿Cuánto mide $AB$?",
      "opciones": [
        "13371,45",
        "150",
        "210",
        "115,63"
      ],
      "respuesta": "115,63",
      "explicacion": "Ley del coseno: $AB^{2}\\approx 13371$ y $AB\\approx 115{,}63$ m. El valor 150 sería con ángulo recto y 210 es la suma de los lados."
    }
  ]
}$trigonometria$::jsonb,
  3,
  true),

('trigonometria-clase-22-el-caso-ambiguo', 'El caso ambiguo (SSA)',
  'Dos lados y un ángulo que no está entre ellos: cuándo hay 0, 1 o 2 triángulos y cómo hallarlos.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás decidir cuántos triángulos existen con dos lados y un ángulo que no está entre ellos (SSA) y resolverlos.",
    "Intuición. Imagina el lado $a$ como una varilla que gira alrededor del punto $C$ tratando de tocar la base. Puede que no llegue, que la toque en un solo punto, que la corte en dos puntos (dos triángulos distintos) o, si es muy larga, que toque la base de un solo lado. Con los mismos datos puede haber entonces 0, 1 o 2 triángulos: por eso se llama caso ambiguo.",
    "Por qué pasa. Con la ley del seno, $\\operatorname{sen}(B)=\\dfrac{b\\operatorname{sen}(A)}{a}$. Pero hay dos ángulos entre $0^{\\circ}$ y $180^{\\circ}$ con el mismo seno: $B$ y $180^{\\circ}-B$ (son suplementarios, como en el ángulo de referencia). La calculadora solo da el agudo; el otro hay que buscarlo, y vale si $A+(180^{\\circ}-B)<180^{\\circ}$.",
    "Cómo decidir sin resolver (con $A$ agudo). Se calcula la altura $h=b\\operatorname{sen}(A)$ y se compara $a$ con $h$ y con $b$: si $a<h$, ningún triángulo (no llega); si $a=h$, uno solo (es rectángulo); si $h<a<b$, dos triángulos; si $a\\geq b$, un triángulo. Si $A$ es obtuso o recto: con $a>b$ hay uno, y con $a\\leq b$ ninguno.",
    "Ejemplo con dos soluciones. $a=7$, $b=10$ y $A=30^{\\circ}$. La altura es $h=10\\operatorname{sen}(30^{\\circ})=5$ y $5<7<10$: hay dos triángulos. $\\operatorname{sen}(B)=\\frac{10\\cdot 0{,}5}{7}\\approx 0{,}7143$, así que $B_{1}\\approx 45,6^{\\circ}$ y $B_{2}=180^{\\circ}-B_{1}\\approx 134,4^{\\circ}$. Los terceros ángulos son $C_{1}\\approx 104,4^{\\circ}$ y $C_{2}\\approx 15,6^{\\circ}$, y los terceros lados $c_{1}\\approx 13,56$ y $c_{2}\\approx 3,76$.",
    "Ejemplo sin solución. $a=4$, $b=10$ y $A=30^{\\circ}$. La altura es 5 y $a=4<5$: la varilla no llega a la base. En la cuenta, $\\operatorname{sen}(B)=\\frac{10\\cdot 0{,}5}{4}=1{,}25$, y la calculadora marca error porque ningún ángulo tiene seno mayor que 1.",
    "Una simplificación del colegio: en los ejercicios, casi siempre se pide decir cuántos triángulos hay y hallarlos. Los datos de la vida real (ASA, SAS, SSS) no tienen este problema; solo el SSA lo tiene.",
    "Errores comunes. 1) Dar solo el ángulo agudo sin revisar si el suplementario también cabe. 2) Descartar el segundo triángulo «por costumbre». 3) Creer que SSA siempre da dos triángulos: depende de cómo se compare $a$ con $h$ y con $b$. 4) Olvidar calcular la altura $h$ antes de resolver."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.ley",
      "despuesDePaso": 4,
      "titulo": "Dos triángulos: $a=7$, $b=10$ y $A=30^{\\circ}$",
      "ley": "ambiguo",
      "datos": {
        "a": 7,
        "b": 10,
        "A": 30
      }
    },
    {
      "tipo": "trigonometria.ley",
      "despuesDePaso": 5,
      "titulo": "Ninguno: $a=4$, $b=10$ y $A=30^{\\circ}$",
      "ley": "ambiguo",
      "datos": {
        "a": 4,
        "b": 10,
        "A": 30
      }
    },
    {
      "tipo": "trigonometria.ley",
      "despuesDePaso": 3,
      "titulo": "Uno solo: $a=12$, $b=10$ y $A=40^{\\circ}$",
      "ley": "ambiguo",
      "datos": {
        "a": 12,
        "b": 10,
        "A": 40
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "Con $a=5$, $b=10$ y $A=30^{\\circ}$, ¿cuántos triángulos existen?",
      "opciones": [
        "Ninguno",
        "Dos",
        "Infinitos",
        "Uno (rectángulo)"
      ],
      "respuesta": "Uno (rectángulo)",
      "explicacion": "La altura es $h=10\\operatorname{sen}(30^{\\circ})=5=a$: la varilla toca la base en un solo punto, y el triángulo es rectángulo en $B$."
    },
    {
      "pregunta": "Con $a=4$, $b=10$ y $A=30^{\\circ}$, ¿cuántos triángulos existen?",
      "opciones": [
        "Uno",
        "Dos",
        "Ninguno",
        "Uno, pero obtuso"
      ],
      "respuesta": "Ninguno",
      "explicacion": "$h=5$ y $a=4<h$: no llega a la base. Con la ley del seno saldría $\\operatorname{sen}(B)=1{,}25$, imposible."
    },
    {
      "pregunta": "Con $a=7$, $b=10$ y $A=30^{\\circ}$, ¿cuántos triángulos existen?",
      "opciones": [
        "Ninguno",
        "Dos",
        "Uno",
        "Tres"
      ],
      "respuesta": "Dos",
      "explicacion": "$h=5<a=7<b=10$: la varilla corta la base en dos puntos. Dos triángulos distintos, con $B_{1}$ agudo y $B_{2}$ obtuso."
    },
    {
      "pregunta": "Con $a=12$, $b=10$ y $A=40^{\\circ}$, ¿cuántos triángulos existen?",
      "opciones": [
        "Uno",
        "Ninguno",
        "Dos",
        "Depende de la calculadora"
      ],
      "respuesta": "Uno",
      "explicacion": "Como $a\\geq b$, el ángulo $B$ (opuesto al lado menor) tiene que ser menor que $A$: solo cabe el agudo. Un triángulo."
    },
    {
      "pregunta": "Si $\\operatorname{sen}(B)=0{,}7$ con $B$ entre $0^{\\circ}$ y $180^{\\circ}$, ¿cuáles son los dos ángulos posibles?",
      "opciones": [
        "$44{,}4^{\\circ}$ y $134{,}4^{\\circ}$",
        "$44{,}4^{\\circ}$ y $135{,}6^{\\circ}$",
        "$44{,}4^{\\circ}$ y $315{,}6^{\\circ}$",
        "$44{,}4^{\\circ}$ y $-44{,}4^{\\circ}$"
      ],
      "respuesta": "$44{,}4^{\\circ}$ y $135{,}6^{\\circ}$",
      "explicacion": "Los ángulos con el mismo seno son $B$ y $180^{\\circ}-B$ (suplementarios). El segundo, $180^{\\circ}-44{,}4^{\\circ}=135{,}6^{\\circ}$."
    },
    {
      "pregunta": "¿Por qué existen dos soluciones en algunos problemas SSA?",
      "opciones": [
        "Porque la ley del seno es aproximada",
        "Porque el coseno es negativo en el segundo cuadrante",
        "Porque $B$ y $180^{\\circ}-B$ tienen el mismo seno y los dos pueden cumplir que los ángulos sumen menos de $180^{\\circ}$",
        "Porque el lado $a$ es siempre más largo que $b$"
      ],
      "respuesta": "Porque $B$ y $180^{\\circ}-B$ tienen el mismo seno y los dos pueden cumplir que los ángulos sumen menos de $180^{\\circ}$",
      "explicacion": "La ley del seno solo determina el seno de $B$, y hay dos ángulos entre $0^{\\circ}$ y $180^{\\circ}$ con ese seno. Si el segundo no hace pasar de $180^{\\circ}$ la suma de los ángulos, da otro triángulo."
    }
  ]
}$trigonometria$::jsonb,
  4,
  true),

('trigonometria-clase-23-identidades-fundamentales', 'Identidades fundamentales',
  'Recíprocas, cociente, pitagóricas y cofunciones: las igualdades que traducen unas razones en otras.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar conocerás las identidades trigonométricas fundamentales, sabrás de dónde salen y las usarás para hallar una razón conociendo otra.",
    "Intuición. Una identidad es una igualdad que se cumple para TODOS los ángulos en los que está definida (una ecuación, en cambio, se cumple solo para algunos). Las identidades fundamentales son reglas de traducción entre las seis razones: si conoces una, puedes conseguir las demás.",
    "Recíprocas. Ya las conoces de la clase 3, ahora escritas como identidades: $\\operatorname{cosec}(x)=\\dfrac{1}{\\operatorname{sen}(x)}$, $\\sec(x)=\\dfrac{1}{\\cos(x)}$ y $\\cot(x)=\\dfrac{1}{\\tan(x)}$. Valen para todo ángulo en el que el denominador no sea 0.",
    "Cociente. En el círculo unitario, $\\tan(x)=\\frac{y}{x}$ y las coordenadas son $x=\\cos(\\theta)$, $y=\\operatorname{sen}(\\theta)$. Entonces $\\tan(x)=\\dfrac{\\operatorname{sen}(x)}{\\cos(x)}$ y, dándola vuelta, $\\cot(x)=\\dfrac{\\cos(x)}{\\operatorname{sen}(x)}$.",
    "Pitagórica. Como el punto del círculo cumple $x^{2}+y^{2}=1$, se tiene $\\operatorname{sen}^{2}(x)+\\cos^{2}(x)=1$, para cualquier ángulo. Si se divide toda la igualdad entre $\\cos^{2}(x)$, sale $1+\\tan^{2}(x)=\\sec^{2}(x)$; y si se divide entre $\\operatorname{sen}^{2}(x)$, sale $1+\\cot^{2}(x)=\\operatorname{cosec}^{2}(x)$. Una sola identidad, tres formas.",
    "Cofunciones. En un triángulo rectángulo los dos ángulos agudos son complementarios (suman $90^{\\circ}$), y el cateto que es opuesto a uno es adyacente al otro. Por eso el seno de un ángulo es el coseno de su complemento: $\\operatorname{sen}(90^{\\circ}-x)=\\cos(x)$, $\\cos(90^{\\circ}-x)=\\operatorname{sen}(x)$ y $\\tan(90^{\\circ}-x)=\\cot(x)$.",
    "Cómo se usan. Si $\\operatorname{sen}(\\theta)=\\frac{3}{5}$ con $\\theta$ en el primer cuadrante: $\\cos^{2}(\\theta)=1-\\frac{9}{25}=\\frac{16}{25}$, así que $\\cos(\\theta)=\\frac{4}{5}$; luego $\\tan(\\theta)=\\frac{3}{4}$ y $\\sec(\\theta)=\\frac{5}{4}$. Otro caso: si $\\tan(\\theta)=2$, entonces $\\sec^{2}(\\theta)=1+4=5$ y $\\sec(\\theta)=\\sqrt{5}$ (con $\\theta$ agudo).",
    "Una cautela. Probar con un ángulo no demuestra una identidad, pero un solo contraejemplo sí la refuta. Por ejemplo, $\\operatorname{sen}(A+B)=\\operatorname{sen}(A)+\\operatorname{sen}(B)$ es falsa: con $A=B=30^{\\circ}$, $\\operatorname{sen}(60^{\\circ})\\approx 0{,}866$ pero $\\operatorname{sen}(30^{\\circ})+\\operatorname{sen}(30^{\\circ})=1$.",
    "Errores comunes. 1) Creer que $\\operatorname{sen}^{2}(x)$ significa $\\operatorname{sen}(x^{2})$: significa $(\\operatorname{sen}(x))^{2}$. 2) Confundir secante con cosecante (la secante va con el coseno). 3) Cancelar «sen» como si fuera un número: $\\operatorname{sen}(x)$ es una función. 4) Dividir entre una razón sin comprobar que no vale 0."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.identidad",
      "despuesDePaso": 4,
      "titulo": "Pitágoras sobre el círculo unitario ($\\theta=30^{\\circ}$)",
      "angulo": 30,
      "forma": "derivadas"
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 6,
      "titulo": "Las identidades fundamentales",
      "cuadros": [
        {
          "texto": "Recíprocas.",
          "formula": "\\operatorname{cosec}(x)=\\dfrac{1}{\\operatorname{sen}(x)},\\quad \\sec(x)=\\dfrac{1}{\\cos(x)},\\quad \\cot(x)=\\dfrac{1}{\\tan(x)}"
        },
        {
          "texto": "Cociente.",
          "formula": "\\tan(x)=\\dfrac{\\operatorname{sen}(x)}{\\cos(x)},\\quad \\cot(x)=\\dfrac{\\cos(x)}{\\operatorname{sen}(x)}"
        },
        {
          "texto": "Pitagóricas.",
          "formula": "\\operatorname{sen}^{2}(x)+\\cos^{2}(x)=1,\\quad 1+\\tan^{2}(x)=\\sec^{2}(x),\\quad 1+\\cot^{2}(x)=\\operatorname{cosec}^{2}(x)"
        },
        {
          "texto": "Cofunciones.",
          "formula": "\\operatorname{sen}(90^{\\circ}-x)=\\cos(x),\\quad \\cos(90^{\\circ}-x)=\\operatorname{sen}(x),\\quad \\tan(90^{\\circ}-x)=\\cot(x)"
        }
      ],
      "msPorCuadro": 3200
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la identidad pitagórica fundamental?",
      "opciones": [
        "$\\operatorname{sen}^{2}(x)+\\cos^{2}(x)=1$",
        "$\\operatorname{sen}(x)+\\cos(x)=1$",
        "$\\operatorname{sen}^{2}(x)-\\cos^{2}(x)=1$",
        "$\\operatorname{sen}(x^{2})+\\cos(x^{2})=1$"
      ],
      "respuesta": "$\\operatorname{sen}^{2}(x)+\\cos^{2}(x)=1$",
      "explicacion": "Viene de $x^{2}+y^{2}=1$ en el círculo unitario, con $x=\\cos$ e $y=\\operatorname{sen}$. Sin los cuadrados no se cumple (con $30^{\\circ}$ suma $1{,}37$), y $\\operatorname{sen}^{2}(x)$ significa $(\\operatorname{sen}(x))^{2}$."
    },
    {
      "pregunta": "Si $\\operatorname{sen}(x)=\\frac{5}{13}$ y $\\cos(x)=\\frac{12}{13}$, ¿cuánto vale $\\tan(x)$?",
      "opciones": [
        "$\\dfrac{12}{5}$",
        "$\\dfrac{5}{13}$",
        "$\\dfrac{60}{169}$",
        "$\\dfrac{5}{12}$"
      ],
      "respuesta": "$\\dfrac{5}{12}$",
      "explicacion": "$\\tan=\\frac{\\operatorname{sen}}{\\cos}=\\frac{5/13}{12/13}=\\frac{5}{12}$. $\\frac{12}{5}$ es la cotangente y $\\frac{60}{169}$ es el producto."
    },
    {
      "pregunta": "¿A qué es igual $1+\\tan^{2}(x)$?",
      "opciones": [
        "$\\sec^{2}(x)$",
        "$\\cos^{2}(x)$",
        "$\\operatorname{cosec}^{2}(x)$",
        "$\\cot^{2}(x)$"
      ],
      "respuesta": "$\\sec^{2}(x)$",
      "explicacion": "Dividiendo $\\operatorname{sen}^{2}+\\cos^{2}=1$ entre $\\cos^{2}$ se obtiene $\\tan^{2}+1=\\sec^{2}$. La cosecante sale al dividir entre $\\operatorname{sen}^{2}$."
    },
    {
      "pregunta": "¿Cuánto vale $\\operatorname{sen}(90^{\\circ}-20^{\\circ})$?",
      "opciones": [
        "$\\cos(20^{\\circ})$",
        "$\\operatorname{sen}(20^{\\circ})$",
        "$-\\cos(20^{\\circ})$",
        "$\\tan(20^{\\circ})$"
      ],
      "respuesta": "$\\cos(20^{\\circ})$",
      "explicacion": "Cofunciones: $\\operatorname{sen}(90^{\\circ}-x)=\\cos(x)$. Es el seno de $70^{\\circ}$, que coincide con el coseno de $20^{\\circ}$."
    },
    {
      "pregunta": "¿Qué significa $\\operatorname{sen}^{2}(x)$?",
      "opciones": [
        "$(\\operatorname{sen}(x))^{2}$",
        "$\\operatorname{sen}(x^{2})$",
        "$2\\operatorname{sen}(x)$",
        "$\\operatorname{sen}(2x)$"
      ],
      "respuesta": "$(\\operatorname{sen}(x))^{2}$",
      "explicacion": "El exponente sobre el nombre de la función eleva el resultado al cuadrado. $\\operatorname{sen}(x^{2})$ es otra cosa: el seno de $x$ al cuadrado."
    },
    {
      "pregunta": "Si $\\tan(\\theta)=2$ y $\\theta$ es agudo, ¿cuánto vale $\\sec(\\theta)$?",
      "opciones": [
        "$3$",
        "$\\dfrac{1}{2}$",
        "$\\sqrt{5}$",
        "$\\sqrt{3}$"
      ],
      "respuesta": "$\\sqrt{5}$",
      "explicacion": "$\\sec^{2}=1+\\tan^{2}=1+4=5$, así que $\\sec(\\theta)=\\sqrt{5}$ (positivo porque $\\theta$ es agudo). $3$ sale de sumar $1+2$ sin elevar al cuadrado."
    }
  ]
}$trigonometria$::jsonb,
  1,
  true),

('trigonometria-clase-24-angulo-doble-suma-y-diferencia', 'Ángulo doble, suma y diferencia de ángulos',
  'Las razones de A + B, A − B y 2A, por qué sen(A + B) no es sen A + sen B y cómo hallar valores exactos como el de 75°.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás calcular el seno, el coseno y la tangente de una suma, una diferencia o el doble de ángulos, y obtener valores exactos como $\\operatorname{sen}(75^{\\circ})$ o $\\cos(15^{\\circ})$.",
    "Intuición. Las razones trigonométricas no son «lineales»: el seno de una suma NO es la suma de los senos. Para calcular el seno de $A+B$ hace falta una regla nueva. Con ella se obtienen valores exactos de ángulos que no están en la tabla, como $75^{\\circ}=45^{\\circ}+30^{\\circ}$ o $15^{\\circ}=45^{\\circ}-30^{\\circ}$.",
    "El contraejemplo. Con $A=B=30^{\\circ}$: $\\operatorname{sen}(A+B)=\\operatorname{sen}(60^{\\circ})\\approx 0{,}866$, pero $\\operatorname{sen}(A)+\\operatorname{sen}(B)=\\frac{1}{2}+\\frac{1}{2}=1$. Como las dos cuentas no coinciden, la igualdad «distribuir el seno» es FALSA.",
    "Suma y diferencia. $\\operatorname{sen}(A\\pm B)=\\operatorname{sen}(A)\\cos(B)\\pm\\cos(A)\\operatorname{sen}(B)$ (en el seno, el signo del medio es el mismo). $\\cos(A\\pm B)=\\cos(A)\\cos(B)\\mp\\operatorname{sen}(A)\\operatorname{sen}(B)$ (en el coseno, el signo del medio es el CONTRARIO). $\\tan(A\\pm B)=\\dfrac{\\tan(A)\\pm\\tan(B)}{1\\mp\\tan(A)\\tan(B)}$.",
    "Ejemplo resuelto. $\\operatorname{sen}(75^{\\circ})=\\operatorname{sen}(45^{\\circ}+30^{\\circ})=\\operatorname{sen}(45^{\\circ})\\cos(30^{\\circ})+\\cos(45^{\\circ})\\operatorname{sen}(30^{\\circ})$. Con los valores exactos: $\\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{\\sqrt{3}}{2}+\\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{1}{2}=\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}$ $\\approx 0{,}966$. Igual sale $\\cos(15^{\\circ})=\\cos(45^{\\circ}-30^{\\circ})=\\cos(45^{\\circ})\\cos(30^{\\circ})+\\operatorname{sen}(45^{\\circ})\\operatorname{sen}(30^{\\circ})=\\frac{\\sqrt{6}+\\sqrt{2}}{4}$, porque $\\operatorname{sen}(75^{\\circ})=\\cos(15^{\\circ})$ (son ángulos complementarios).",
    "Ángulo doble. Es el caso $A=B=x$ de las fórmulas de suma: $\\operatorname{sen}(2x)=2\\operatorname{sen}(x)\\cos(x)$; $\\cos(2x)=\\cos^{2}(x)-\\operatorname{sen}^{2}(x)$, que con la identidad pitagórica también se escribe $2\\cos^{2}(x)-1$ o $1-2\\operatorname{sen}^{2}(x)$; y $\\tan(2x)=\\dfrac{2\\tan(x)}{1-\\tan^{2}(x)}$.",
    "Ejemplo del doble. Si $\\operatorname{sen}(x)=\\frac{3}{5}$ con $x$ agudo, entonces $\\cos(x)=\\frac{4}{5}$. Luego $\\operatorname{sen}(2x)=2\\cdot\\frac{3}{5}\\cdot\\frac{4}{5}=\\frac{24}{25}$ y $\\cos(2x)=1-2\\cdot\\frac{9}{25}=\\frac{7}{25}$. Se puede comprobar: $\\left(\\frac{24}{25}\\right)^{2}+\\left(\\frac{7}{25}\\right)^{2}=\\frac{576+49}{625}=1$.",
    "Errores comunes. 1) «Distribuir» el seno: $\\operatorname{sen}(A+B)\\neq\\operatorname{sen}(A)+\\operatorname{sen}(B)$. 2) Equivocar el signo del medio en el coseno (es contrario al del ángulo). 3) Escribir $\\operatorname{sen}(2x)=2\\operatorname{sen}(x)$: falta el coseno. 4) Olvidar que $\\cos(2x)$ tiene tres formas equivalentes."
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 4,
      "titulo": "sen 75° con la fórmula de la suma",
      "cuadros": [
        {
          "texto": "Se descompone el ángulo: $75^{\\circ}=45^{\\circ}+30^{\\circ}$.",
          "formula": "\\operatorname{sen}(45^{\\circ}+30^{\\circ})=\\operatorname{sen}(45^{\\circ})\\cos(30^{\\circ})+\\cos(45^{\\circ})\\operatorname{sen}(30^{\\circ})"
        },
        {
          "texto": "Se reemplazan los valores exactos.",
          "formula": "\\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{\\sqrt{3}}{2}+\\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{1}{2}"
        },
        {
          "texto": "Se calcula.",
          "formula": "=\\frac{\\sqrt{6}+\\sqrt{2}}{4}"
        }
      ],
      "msPorCuadro": 2800
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 6,
      "titulo": "El doble de un ángulo con $\\operatorname{sen}(x)=\\frac{3}{5}$",
      "cuadros": [
        {
          "texto": "Del seno se obtiene el coseno con $\\operatorname{sen}^{2}+\\cos^{2}=1$ (x agudo).",
          "formula": "\\cos(x)=\\sqrt{1-\\dfrac{9}{25}}=\\dfrac{4}{5}"
        },
        {
          "texto": "Seno del doble.",
          "formula": "\\operatorname{sen}(2x)=2\\cdot\\dfrac{3}{5}\\cdot\\dfrac{4}{5}=\\dfrac{24}{25}"
        },
        {
          "texto": "Coseno del doble.",
          "formula": "\\cos(2x)=1-2\\cdot\\dfrac{9}{25}=\\dfrac{7}{25}"
        }
      ],
      "msPorCuadro": 2800
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la fórmula correcta de $\\operatorname{sen}(A+B)$?",
      "opciones": [
        "$\\operatorname{sen}(A)\\cos(B)+\\cos(A)\\operatorname{sen}(B)$",
        "$\\operatorname{sen}(A)+\\operatorname{sen}(B)$",
        "$\\operatorname{sen}(A)\\cos(B)-\\cos(A)\\operatorname{sen}(B)$",
        "$\\cos(A)\\cos(B)-\\operatorname{sen}(A)\\operatorname{sen}(B)$"
      ],
      "respuesta": "$\\operatorname{sen}(A)\\cos(B)+\\cos(A)\\operatorname{sen}(B)$",
      "explicacion": "En el seno de una suma, los dos términos se suman: seno-coseno más coseno-seno. La segunda opción es el seno de la diferencia y la tercera es el coseno de la suma."
    },
    {
      "pregunta": "¿Cuál es la fórmula correcta de $\\cos(A+B)$?",
      "opciones": [
        "$\\cos(A)\\cos(B)+\\operatorname{sen}(A)\\operatorname{sen}(B)$",
        "$\\cos(A)+\\cos(B)$",
        "$\\cos(A)\\cos(B)-\\operatorname{sen}(A)\\operatorname{sen}(B)$",
        "$\\operatorname{sen}(A)\\cos(B)+\\cos(A)\\operatorname{sen}(B)$"
      ],
      "respuesta": "$\\cos(A)\\cos(B)-\\operatorname{sen}(A)\\operatorname{sen}(B)$",
      "explicacion": "En el coseno de una suma el signo del medio es CONTRARIO: menos. Con signo más se calcula el coseno de la diferencia."
    },
    {
      "pregunta": "¿Cuánto vale $\\operatorname{sen}(75^{\\circ})$?",
      "opciones": [
        "$\\frac{1+\\sqrt{2}}{2}$",
        "$\\frac{\\sqrt{6}-\\sqrt{2}}{4}$",
        "$\\frac{\\sqrt{6}}{4}$",
        "$\\frac{\\sqrt{6}+\\sqrt{2}}{4}$"
      ],
      "respuesta": "$\\frac{\\sqrt{6}+\\sqrt{2}}{4}$",
      "explicacion": "$\\operatorname{sen}(45^{\\circ}+30^{\\circ})=\\frac{\\sqrt{2}}{2}\\cdot\\frac{\\sqrt{3}}{2}+\\frac{\\sqrt{2}}{2}\\cdot\\frac{1}{2}=\\frac{\\sqrt{6}+\\sqrt{2}}{4}$. La primera opción suma los senos (distribuye), la segunda es el seno de $15^{\\circ}$ (signo de la diferencia) y la tercera olvida el segundo término."
    },
    {
      "pregunta": "Si $\\operatorname{sen}(x)=\\dfrac{3}{5}$ y $x$ es agudo, ¿cuánto vale $\\operatorname{sen}(2x)$?",
      "opciones": [
        "$\\dfrac{24}{25}$",
        "$\\dfrac{6}{5}$",
        "$\\dfrac{9}{25}$",
        "$\\dfrac{12}{25}$"
      ],
      "respuesta": "$\\dfrac{24}{25}$",
      "explicacion": "$\\cos(x)=\\frac{4}{5}$ y $\\operatorname{sen}(2x)=2\\cdot\\frac{3}{5}\\cdot\\frac{4}{5}=\\frac{24}{25}$. Con $2\\operatorname{sen}(x)=\\frac{6}{5}$ el resultado pasaría de 1, imposible para un seno."
    },
    {
      "pregunta": "Si $\\cos(x)=\\dfrac{4}{5}$, ¿cuánto vale $\\cos(2x)$?",
      "opciones": [
        "$\\dfrac{8}{5}$",
        "$\\dfrac{16}{25}$",
        "$\\dfrac{7}{25}$",
        "$-\\dfrac{7}{25}$"
      ],
      "respuesta": "$\\dfrac{7}{25}$",
      "explicacion": "$\\cos(2x)=2\\cos^{2}(x)-1=2\\cdot\\frac{16}{25}-1=\\frac{7}{25}$. El $\\frac{16}{25}$ es solo $\\cos^{2}(x)$."
    },
    {
      "pregunta": "¿Cuál de estas igualdades es FALSA?",
      "opciones": [
        "$\\operatorname{sen}(2x)=2\\operatorname{sen}(x)$",
        "$\\operatorname{sen}(2x)=2\\operatorname{sen}(x)\\cos(x)$",
        "$\\cos(2x)=1-2\\operatorname{sen}^{2}(x)$",
        "$\\cos(2x)=\\cos^{2}(x)-\\operatorname{sen}^{2}(x)$"
      ],
      "respuesta": "$\\operatorname{sen}(2x)=2\\operatorname{sen}(x)$",
      "explicacion": "Falta el factor $\\cos(x)$: con $x=30^{\\circ}$, $\\operatorname{sen}(60^{\\circ})\\approx 0{,}87$ pero $2\\operatorname{sen}(30^{\\circ})=1$."
    }
  ]
}$trigonometria$::jsonb,
  2,
  true),

('trigonometria-clase-25-simplificar-y-verificar-identidades', 'Simplificar y verificar identidades',
  'Un método para demostrar que dos expresiones son la misma, transformando un solo lado, y cómo descartar una falsa con un ángulo.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás verificar una identidad transformando uno de sus lados hasta llegar al otro, simplificar expresiones trigonométricas y descartar una igualdad falsa con un contraejemplo.",
    "Intuición. Verificar una identidad es mostrar que dos expresiones son la misma cosa escrita de dos formas. No se hace probando con un ángulo (eso no demuestra nada): se hace transformando una expresión, paso a paso y con reglas válidas, hasta que se parezca a la otra.",
    "El método. 1) Trabaja con el lado más complicado. 2) Pasa todo a senos y cosenos (con las recíprocas y el cociente). 3) Usa las pitagóricas para cambiar cuadrados ($1-\\cos^{2}(x)=\\operatorname{sen}^{2}(x)$). 4) Suma fracciones con denominador común, factoriza y simplifica. 5) NUNCA operes en los dos lados a la vez ni cambies términos de un lado al otro: eso supone lo que quieres demostrar.",
    "Ejemplo 1. Verificar $\\dfrac{1-\\cos^{2}(x)}{\\operatorname{sen}(x)}=\\operatorname{sen}(x)$. Se parte del lado izquierdo: por la pitagórica, $1-\\cos^{2}(x)=\\operatorname{sen}^{2}(x)$, y $\\dfrac{\\operatorname{sen}^{2}(x)}{\\operatorname{sen}(x)}=\\operatorname{sen}(x)$. Listo.",
    "Ejemplo 2. Verificar $\\tan(x)\\cdot\\cos(x)=\\operatorname{sen}(x)$. Se reemplaza $\\tan(x)=\\frac{\\operatorname{sen}(x)}{\\cos(x)}$: $\\dfrac{\\operatorname{sen}(x)}{\\cos(x)}\\cdot\\cos(x)=\\operatorname{sen}(x)$, porque el coseno se cancela (es un factor, no un sumando).",
    "Ejemplo 3. Verificar $\\sec(x)-\\cos(x)=\\operatorname{sen}(x)\\tan(x)$. El lado izquierdo, en senos y cosenos: $\\dfrac{1}{\\cos(x)}-\\cos(x)=\\dfrac{1-\\cos^{2}(x)}{\\cos(x)}=\\dfrac{\\operatorname{sen}^{2}(x)}{\\cos(x)}=\\operatorname{sen}(x)\\cdot\\dfrac{\\operatorname{sen}(x)}{\\cos(x)}=\\operatorname{sen}(x)\\tan(x)$.",
    "Descartar una falsa. Si dudas de una igualdad, prueba con un ángulo que no sea especial: un solo desacuerdo la refuta. Por ejemplo, ¿es $(\\operatorname{sen}(x)+\\cos(x))^{2}=1$? Con $x=30^{\\circ}$ da $(0{,}5+0{,}866)^{2}\\approx 1{,}87$, no 1: es falsa. (En realidad vale $1+2\\operatorname{sen}(x)\\cos(x)=1+\\operatorname{sen}(2x)$.) Que dé bien con un ángulo no la demuestra.",
    "Errores comunes. 1) Cancelar sumandos como si fueran factores: en $\\dfrac{1+\\cos(x)}{\\cos(x)}$ no se puede tachar el coseno. 2) Operar en los dos lados a la vez. 3) Escribir $(\\operatorname{sen}(x)+\\cos(x))^{2}=\\operatorname{sen}^{2}(x)+\\cos^{2}(x)$ olvidando el término del medio. 4) Olvidar las restricciones, por ejemplo $\\cos(x)\\neq 0$ al dividir."
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 3,
      "titulo": "Verificar $\\dfrac{1-\\cos^{2}(x)}{\\operatorname{sen}(x)}=\\operatorname{sen}(x)$",
      "cuadros": [
        {
          "texto": "Se parte del lado izquierdo.",
          "formula": "\\dfrac{1-\\cos^{2}(x)}{\\operatorname{sen}(x)}"
        },
        {
          "texto": "Identidad pitagórica: $1-\\cos^{2}(x)=\\operatorname{sen}^{2}(x)$.",
          "formula": "=\\dfrac{\\operatorname{sen}^{2}(x)}{\\operatorname{sen}(x)}"
        },
        {
          "texto": "Se simplifica un factor.",
          "formula": "=\\operatorname{sen}(x)"
        }
      ],
      "msPorCuadro": 2800
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 5,
      "titulo": "Verificar $\\sec(x)-\\cos(x)=\\operatorname{sen}(x)\\tan(x)$",
      "cuadros": [
        {
          "texto": "Recíproca: $\\sec(x)=\\frac{1}{\\cos(x)}$.",
          "formula": "\\dfrac{1}{\\cos(x)}-\\cos(x)"
        },
        {
          "texto": "Denominador común.",
          "formula": "=\\dfrac{1-\\cos^{2}(x)}{\\cos(x)}"
        },
        {
          "texto": "Pitagórica.",
          "formula": "=\\dfrac{\\operatorname{sen}^{2}(x)}{\\cos(x)}"
        },
        {
          "texto": "Se separa y se usa el cociente.",
          "formula": "=\\operatorname{sen}(x)\\cdot\\dfrac{\\operatorname{sen}(x)}{\\cos(x)}=\\operatorname{sen}(x)\\tan(x)"
        }
      ],
      "msPorCuadro": 2800
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estas expresiones es equivalente a $\\tan(x)\\cdot\\cos(x)$?",
      "opciones": [
        "$\\cos(x)$",
        "$\\operatorname{sen}(x)$",
        "$\\sec(x)$",
        "$1$"
      ],
      "respuesta": "$\\operatorname{sen}(x)$",
      "explicacion": "$\\tan(x)\\cdot\\cos(x)=\\frac{\\operatorname{sen}(x)}{\\cos(x)}\\cdot\\cos(x)=\\operatorname{sen}(x)$: el coseno se cancela porque es un factor."
    },
    {
      "pregunta": "¿Cuál de estas expresiones es equivalente a $1-\\operatorname{sen}^{2}(x)$?",
      "opciones": [
        "$\\operatorname{sen}^{2}(x)$",
        "$\\cos^{2}(x)$",
        "$\\cos(x)$",
        "$1$"
      ],
      "respuesta": "$\\cos^{2}(x)$",
      "explicacion": "Por la identidad pitagórica, $1-\\operatorname{sen}^{2}(x)=\\cos^{2}(x)$."
    },
    {
      "pregunta": "¿Cuál de estas expresiones es equivalente a $(\\operatorname{sen}(x)+\\cos(x))^{2}-2\\,\\operatorname{sen}(x)\\cos(x)$?",
      "opciones": [
        "$1+2\\,\\operatorname{sen}(x)\\cos(x)$",
        "$\\operatorname{sen}^{2}(x)-\\cos^{2}(x)$",
        "$1$",
        "$2$"
      ],
      "respuesta": "$1$",
      "explicacion": "$(\\operatorname{sen}(x)+\\cos(x))^{2}=\\operatorname{sen}^{2}(x)+2\\operatorname{sen}(x)\\cos(x)+\\cos^{2}(x)$; al restar $2\\operatorname{sen}(x)\\cos(x)$ queda $\\operatorname{sen}^{2}(x)+\\cos^{2}(x)=1$."
    },
    {
      "pregunta": "¿Cuál de estas expresiones es equivalente a $\\cos(x)\\,(\\tan(x)+\\cot(x))$?",
      "opciones": [
        "$\\sec(x)$",
        "$\\tan(x)$",
        "$\\operatorname{cosec}(x)$",
        "$\\cot(x)$"
      ],
      "respuesta": "$\\operatorname{cosec}(x)$",
      "explicacion": "$\\cos(x)\\left(\\frac{\\operatorname{sen}}{\\cos}+\\frac{\\cos}{\\operatorname{sen}}\\right)=\\operatorname{sen}(x)+\\frac{\\cos^{2}(x)}{\\operatorname{sen}(x)}=\\frac{\\operatorname{sen}^{2}+\\cos^{2}}{\\operatorname{sen}(x)}=\\operatorname{cosec}(x)$."
    },
    {
      "pregunta": "¿Alcanza con comprobar una identidad con un ángulo, por ejemplo $30^{\\circ}$, para demostrarla?",
      "opciones": [
        "Sí: si da igual con un ángulo, es cierta",
        "No: solo sirve para descartarla si no coincide",
        "Sí, siempre que el ángulo sea notable",
        "No: nunca se puede comprobar con números"
      ],
      "respuesta": "No: solo sirve para descartarla si no coincide",
      "explicacion": "Un ángulo que coincide no prueba nada (podría ser casualidad); un ángulo que NO coincide sí refuta la identidad. Una demostración transforma una expresión con reglas válidas."
    },
    {
      "pregunta": "¿Es una identidad $(\\operatorname{sen}(x)+\\cos(x))^{2}=1$?",
      "opciones": [
        "Sí: es la identidad pitagórica",
        "Sí, pero solo para ángulos agudos",
        "No: con $x=30^{\\circ}$ el primer miembro vale casi $1{,}87$",
        "No: con $x=30^{\\circ}$ el primer miembro vale $0{,}5$"
      ],
      "respuesta": "No: con $x=30^{\\circ}$ el primer miembro vale casi $1{,}87$",
      "explicacion": "Con $x=30^{\\circ}$: $(0{,}5+0{,}866)^{2}\\approx 1{,}87$. La pitagórica es $\\operatorname{sen}^{2}+\\cos^{2}=1$, sin el término del medio $2\\operatorname{sen}\\cos$."
    }
  ]
}$trigonometria$::jsonb,
  3,
  true),

('trigonometria-clase-26-ecuaciones-basicas', 'Ecuaciones trigonométricas básicas',
  'Resolver sen x = k, cos x = k y tan x = k en [0, 2π): por qué una vuelta da dos soluciones y cómo hallarlas con valores exactos o con la función inversa.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás resolver ecuaciones como $\\operatorname{sen}(x)=\\frac{1}{2}$ o $\\cos(x)=-0{,}4$ en el intervalo $[0,\\ 2\\pi)$, hallando todas las soluciones, con valores exactos o con la calculadora.",
    "Intuición. Una identidad se cumple para todo ángulo; una ecuación trigonométrica solo para algunos. Resolver $\\operatorname{sen}(x)=\\frac{1}{2}$ es preguntar: ¿en qué ángulos el punto del círculo unitario está a altura $\\frac{1}{2}$? Hay dos lugares en una vuelta: uno a cada lado del eje vertical. Por eso, en una vuelta, casi siempre hay DOS soluciones.",
    "Dos miradas. En la gráfica de $y=\\operatorname{sen}(x)$, se traza la recta horizontal $y=\\frac{1}{2}$ y se cuentan los cortes. En el círculo unitario, se ubican los puntos que tienen ese valor. Las dos miradas dan las mismas soluciones, como muestra el dibujo.",
    "El método con valores exactos, en tres pasos. 1) Aísla la razón: la ecuación queda $\\operatorname{sen}(x)=k$ (o cos, o tan). 2) Halla el ángulo de referencia: el ángulo agudo con el valor $|k|$ (de la tabla de valores exactos). 3) Ubica los cuadrantes por el signo de $k$ y arma las dos soluciones. Ejemplo: $\\operatorname{sen}(x)=\\dfrac{1}{2}$. La referencia es $\\frac{\\pi}{6}$; el seno es positivo en los cuadrantes I y II: $x=\\frac{\\pi}{6}$ y $x=\\pi-\\frac{\\pi}{6}=\\frac{5\\pi}{6}$.",
    "Otro ejemplo con signo negativo: $2\\cos(x)+\\sqrt{2}=0$, es decir $\\cos(x)=-\\frac{\\sqrt{2}}{2}$. La referencia es $\\frac{\\pi}{4}$ y el coseno es negativo en los cuadrantes II y III: $x=\\pi-\\frac{\\pi}{4}=\\frac{3\\pi}{4}$ y $x=\\pi+\\frac{\\pi}{4}=\\frac{5\\pi}{4}$. Y con tangente: $\\tan(x)=-1$, la tangente es negativa en los cuadrantes II y IV: $\\frac{3\\pi}{4},\\ \\frac{7\\pi}{4}$.",
    "Casos especiales. $\\operatorname{sen}(x)=1$ tiene UNA solución, $\\frac{\\pi}{2}$ (la altura máxima se toca en un solo punto). $\\cos(x)=0$ tiene dos soluciones, $\\frac{\\pi}{2},\\ \\frac{3\\pi}{2}$. Y si $|k|>1$ en seno o coseno, no hay solución: la altura nunca llega a ese valor.",
    "Con la calculadora (función inversa). Para $\\operatorname{sen}(x)=0{,}3$, la calculadora, en radianes, da solo UNA solución: $\\operatorname{sen}^{-1}(0{,}3)\\approx 0{,}3$. La otra es $\\pi-0{,}3\\approx 2{,}84$. Para $\\cos(x)=-0{,}4$: $\\cos^{-1}(-0{,}4)\\approx 1{,}98$ y la otra es $2\\pi-1{,}98\\approx 4{,}3$. Para $\\tan(x)=2$: $\\tan^{-1}(2)\\approx 1{,}11$ y la otra suma $\\pi$: $\\approx 4{,}25$. Regla: la calculadora da una; la otra la da la simetría del círculo.",
    "Todas las soluciones. Si el enunciado no limita el intervalo, cada solución se repite cada vuelta: se añade $+2\\pi k$ (con $k$ entero) al seno y al coseno, y $+\\pi k$ a la tangente. Aquí se trabaja en $[0,\\ 2\\pi)$ para tener un número finito de respuestas. (Simplificación de nivel colegio.)",
    "Errores comunes. 1) Dar solo la solución de la calculadora y olvidar la otra. 2) Poner el signo equivocado al ubicar los cuadrantes. 3) Calculadora en grados cuando se piden radianes (o al revés). 4) Con la tangente, sumar $2\\pi$ en lugar de $\\pi$ para hallar la segunda. 5) Aceptar una «solución» con $|k|>1$ en seno o coseno."
  ],
  "visuales": [
    {
      "tipo": "trigonometria.ecuacion",
      "despuesDePaso": 2,
      "titulo": "$\\operatorname{sen}(x)=\\frac{1}{2}$ en $[0,\\ 2\\pi)$",
      "fn": "sen",
      "gradosValor": 30
    },
    {
      "tipo": "trigonometria.ecuacion",
      "despuesDePaso": 4,
      "titulo": "$\\cos(x)=-\\frac{\\sqrt{2}}{2}$ en $[0,\\ 2\\pi)$",
      "fn": "cos",
      "gradosValor": 135
    },
    {
      "tipo": "trigonometria.ecuacion",
      "despuesDePaso": 4,
      "titulo": "$\\tan(x)=-1$ en $[0,\\ 2\\pi)$",
      "fn": "tan",
      "gradosValor": 135
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 6,
      "titulo": "Con la calculadora: $\\operatorname{sen}(x)=0{,}3$",
      "cuadros": [
        {
          "texto": "Función inversa en radianes: da UNA solución.",
          "formula": "x_{1}=\\operatorname{sen}^{-1}(0{,}3)\\approx 0{,}3"
        },
        {
          "texto": "La simetría del seno (cuadrantes I y II) da la otra: $\\pi-x_{1}$.",
          "formula": "x_{2}=\\pi-0{,}3\\approx 2{,}84"
        },
        {
          "texto": "Comprobación por sustitución con la calculadora:",
          "formula": "\\operatorname{sen}(2{,}84)\\approx 0{,}3"
        }
      ],
      "msPorCuadro": 2800
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuáles son las soluciones de $\\operatorname{sen}(x)=\\dfrac{1}{2}$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "$\\frac{\\pi}{6},\\ \\frac{5\\pi}{6}$",
        "$\\dfrac{\\pi}{6},\\ \\dfrac{7\\pi}{6}$",
        "$\\dfrac{\\pi}{3},\\ \\dfrac{2\\pi}{3}$",
        "$\\dfrac{\\pi}{6}$"
      ],
      "respuesta": "$\\frac{\\pi}{6},\\ \\frac{5\\pi}{6}$",
      "explicacion": "La referencia es $\\frac{\\pi}{6}$ y el seno es positivo en los cuadrantes I y II: $\\frac{\\pi}{6}$ y $\\pi-\\frac{\\pi}{6}=\\frac{5\\pi}{6}$. $\\frac{7\\pi}{6}$ está en el cuadrante III (seno negativo) y $\\frac{\\pi}{3}$ tiene seno $\\frac{\\sqrt{3}}{2}$."
    },
    {
      "pregunta": "¿Cuáles son las soluciones de $2\\cos(x)+\\sqrt{2}=0$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "$\\frac{3\\pi}{4},\\ \\frac{5\\pi}{4}$",
        "$\\dfrac{\\pi}{4},\\ \\dfrac{7\\pi}{4}$",
        "$\\dfrac{\\pi}{4},\\ \\dfrac{3\\pi}{4}$",
        "$\\dfrac{3\\pi}{4}$"
      ],
      "respuesta": "$\\frac{3\\pi}{4},\\ \\frac{5\\pi}{4}$",
      "explicacion": "Se aísla $\\cos(x)=-\\frac{\\sqrt{2}}{2}$. La referencia es $\\frac{\\pi}{4}$ y el coseno es negativo en los cuadrantes II y III: $\\frac{3\\pi}{4}$ y $\\frac{5\\pi}{4}$. Las otras opciones son ángulos con coseno positivo (cuadrantes I y IV) o solo una solución."
    },
    {
      "pregunta": "¿Cuáles son las soluciones de $\\tan(x)=-1$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "$\\dfrac{\\pi}{4},\\ \\dfrac{5\\pi}{4}$",
        "$\\dfrac{3\\pi}{4},\\ \\dfrac{5\\pi}{4}$",
        "$\\dfrac{3\\pi}{4}$",
        "$\\frac{3\\pi}{4},\\ \\frac{7\\pi}{4}$"
      ],
      "respuesta": "$\\frac{3\\pi}{4},\\ \\frac{7\\pi}{4}$",
      "explicacion": "La tangente es negativa en los cuadrantes II y IV, con referencia $\\frac{\\pi}{4}$: $\\pi-\\frac{\\pi}{4}=\\frac{3\\pi}{4}$ y $2\\pi-\\frac{\\pi}{4}=\\frac{7\\pi}{4}$. La segunda solución de la tangente está $\\pi$ después de la primera."
    },
    {
      "pregunta": "¿Cuántas soluciones tiene $\\operatorname{sen}(x)=1$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "Una: $\\dfrac{\\pi}{2}$",
        "Dos: $\\dfrac{\\pi}{2}$ y $\\dfrac{3\\pi}{2}$",
        "Ninguna",
        "Infinitas"
      ],
      "respuesta": "Una: $\\dfrac{\\pi}{2}$",
      "explicacion": "El seno solo vale 1 en el punto más alto del círculo, $\\frac{\\pi}{2}$. En $\\frac{3\\pi}{2}$ vale $-1$."
    },
    {
      "pregunta": "¿Cuántas soluciones tiene $\\operatorname{sen}(x)=1{,}5$?",
      "opciones": [
        "Dos",
        "Ninguna",
        "Una",
        "Depende del intervalo"
      ],
      "respuesta": "Ninguna",
      "explicacion": "El seno nunca supera 1. Un resultado de la calculadora como «error» al hacer $\\operatorname{sen}^{-1}(1{,}5)$ indica justamente que no hay solución real."
    },
    {
      "pregunta": "Con la calculadora en radianes, $\\operatorname{sen}^{-1}(0{,}3)\\approx 0{,}3$. ¿Cuál es la otra solución de $\\operatorname{sen}(x)=0{,}3$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "$3{,}45$",
        "$2{,}84$",
        "$5{,}98$",
        "$-0{,}3$"
      ],
      "respuesta": "$2{,}84$",
      "explicacion": "El seno es positivo en los cuadrantes I y II, y la simetría da $\\pi-x_{1}\\approx 2{,}84$. El valor 3{,}45 tiene seno $-0{,}3$ y 5{,}98 también (cuadrante IV)."
    }
  ]
}$trigonometria$::jsonb,
  1,
  true),

('trigonometria-clase-27-ecuaciones-con-identidades-y-factorizacion', 'Ecuaciones con identidades y con factorización',
  'Cuando la ecuación mezcla funciones o tiene una potencia: cómo llegar a ecuaciones básicas usando identidades y factores, sin perder soluciones.',
  'trigonometria',
  $trigonometria${
  "pasos": [
    "Objetivo: al terminar podrás resolver ecuaciones trigonométricas que no son básicas: las que tienen dos funciones o el ángulo doble (con una identidad) y las que se factorizan, sin perder ninguna solución.",
    "Intuición. Una ecuación básica compara UNA razón con un número. Si aparecen dos razones distintas o una potencia, hay que reducirla hasta que quede una sola razón, o hasta que sea un producto igual a 0. Se usan dos herramientas: las identidades (para dejar una sola razón) y la factorización (para separar en ecuaciones básicas).",
    "Factorización. Un producto vale 0 solo si alguno de sus factores vale 0: si $A\\cdot B=0$, entonces $A=0$ o $B=0$. Se resuelve cada factor por separado y se juntan todas las soluciones.",
    "Ejemplo 1. $\\operatorname{sen}(x)\\cos(x)=0$. O bien $\\operatorname{sen}(x)=0$ (en $0$ y $\\pi$), o bien $\\cos(x)=0$ (en $\\frac{\\pi}{2}$ y $\\frac{3\\pi}{2}$). Soluciones: $0,\\ \\frac{\\pi}{2},\\ \\pi,\\ \\frac{3\\pi}{2}$.",
    "Ejemplo 2 (cuadrática). $2\\,\\operatorname{sen}^{2}(x)+\\operatorname{sen}(x)-1=0$. Con $t=\\operatorname{sen}(x)$ es $2t^{2}+t-1=0$, que se factoriza $(2t-1)(t+1)=0$. Entonces $\\operatorname{sen}(x)=\\frac{1}{2}$ o $\\operatorname{sen}(x)=-1$. La primera da $\\frac{\\pi}{6}$ y $\\frac{5\\pi}{6}$; la segunda, $\\frac{3\\pi}{2}$. Soluciones: $\\frac{\\pi}{6},\\ \\frac{5\\pi}{6},\\ \\frac{3\\pi}{2}$. Si en la cuadrática saliera un valor con $|t|>1$ en seno o coseno, se descarta.",
    "Ejemplo 3 (con la identidad del ángulo doble). $\\cos(2x)=\\cos(x)$. Se reemplaza $\\cos(2x)=2\\cos^{2}(x)-1$: $2\\cos^{2}(x)-1=\\cos(x)$, es decir, $2\\cos^{2}(x)-\\cos(x)-1=0$, que factoriza como $(2\\cos(x)+1)(\\cos(x)-1)=0$. Entonces $\\cos(x)=-\\frac{1}{2}$ (en $\\frac{2\\pi}{3}$ y $\\frac{4\\pi}{3}$) o $\\cos(x)=1$ (en $0$). Soluciones: $0,\\ \\frac{2\\pi}{3},\\ \\frac{4\\pi}{3}$.",
    "Ejemplo 4 (con la identidad pitagórica). $2\\cos^{2}(x)+3\\,\\operatorname{sen}(x)=3$. Se cambia $\\cos^{2}(x)=1-\\operatorname{sen}^{2}(x)$: $2-2\\operatorname{sen}^{2}(x)+3\\operatorname{sen}(x)=3$, o sea $2\\operatorname{sen}^{2}(x)-3\\operatorname{sen}(x)+1=0$, que factoriza como $(2\\operatorname{sen}(x)-1)(\\operatorname{sen}(x)-1)=0$. Da $\\operatorname{sen}(x)=\\frac{1}{2}$ o $\\operatorname{sen}(x)=1$: $\\frac{\\pi}{6},\\ \\frac{\\pi}{2},\\ \\frac{5\\pi}{6}$.",
    "La trampa de dividir. En $\\operatorname{sen}(2x)=\\operatorname{sen}(x)$, con $\\operatorname{sen}(2x)=2\\operatorname{sen}(x)\\cos(x)$ queda $2\\operatorname{sen}(x)\\cos(x)-\\operatorname{sen}(x)=0$, es decir, $\\operatorname{sen}(x)\\,(2\\cos(x)-1)=0$. Si se dividiera entre $\\operatorname{sen}(x)$ se perderían las soluciones donde $\\operatorname{sen}(x)=0$ ($0$ y $\\pi$). Se factoriza en lugar de dividir: $0,\\ \\frac{\\pi}{3},\\ \\pi,\\ \\frac{5\\pi}{3}$.",
    "Comprueba siempre por sustitución (con al menos una solución) y revisa que estén todas dentro del intervalo pedido.",
    "Errores comunes. 1) Dividir entre una función que puede valer 0 (se pierden soluciones). 2) Resolver una ecuación con $\\operatorname{sen}^{2}(x)=k$ dando solo la raíz positiva: hay que considerar $\\pm\\sqrt{k}$ (por ejemplo, $\\operatorname{sen}^{2}(x)=\\frac{1}{4}$ tiene cuatro soluciones en $[0,\\ 2\\pi)$). 3) Mezclar en la misma ecuación $\\cos(2x)$ y $\\cos(x)$ sin usar una identidad. 4) Dejar soluciones con $|t|>1$."
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 3,
      "titulo": "Ecuación con un producto igual a cero",
      "cuadros": [
        {
          "texto": "Se parte de la ecuación.",
          "formula": "\\operatorname{sen}(x)\\cos(x)=0"
        },
        {
          "texto": "Un producto es 0 cuando un factor es 0: dos ecuaciones básicas.",
          "formula": "\\operatorname{sen}(x)=0\\quad\\text{o}\\quad\\cos(x)=0"
        },
        {
          "texto": "Se juntan las soluciones en $[0,\\ 2\\pi)$.",
          "formula": "0,\\ \\frac{\\pi}{2},\\ \\pi,\\ \\frac{3\\pi}{2}"
        }
      ],
      "msPorCuadro": 2800
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 5,
      "titulo": "Con la identidad del ángulo doble",
      "cuadros": [
        {
          "texto": "Ecuación con $2x$ y con $x$.",
          "formula": "\\cos(2x)=\\cos(x)"
        },
        {
          "texto": "Se usa $\\cos(2x)=2\\cos^{2}(x)-1$ para dejar una sola razón.",
          "formula": "2\\cos^{2}(x)-1=\\cos(x)\\ \\Rightarrow\\ 2\\cos^{2}(x)-\\cos(x)-1=0"
        },
        {
          "texto": "Se factoriza.",
          "formula": "(2\\cos(x)+1)(\\cos(x)-1)=0"
        },
        {
          "texto": "Se resuelve cada factor.",
          "formula": "\\cos(x)=-\\dfrac{1}{2}\\ \\text{o}\\ \\cos(x)=1"
        },
        {
          "texto": "Soluciones:",
          "resaltar": "x = 0,\\ \\frac{2\\pi}{3},\\ \\frac{4\\pi}{3}"
        }
      ],
      "msPorCuadro": 3000
    },
    {
      "tipo": "trigonometria.ecuacion",
      "despuesDePaso": 6,
      "titulo": "$\\operatorname{sen}(x)=\\frac{1}{2}$: el factor $2\\operatorname{sen}(x)-1=0$",
      "fn": "sen",
      "gradosValor": 30
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuáles son las soluciones de $\\operatorname{sen}(x)\\cos(x)=0$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "$0,\\ \\pi$",
        "$\\dfrac{\\pi}{2},\\ \\dfrac{3\\pi}{2}$",
        "$0,\\ \\dfrac{\\pi}{2}$",
        "$0,\\ \\frac{\\pi}{2},\\ \\pi,\\ \\frac{3\\pi}{2}$"
      ],
      "respuesta": "$0,\\ \\frac{\\pi}{2},\\ \\pi,\\ \\frac{3\\pi}{2}$",
      "explicacion": "Un producto es 0 si alguno de sus factores lo es: $\\operatorname{sen}(x)=0$ da $0$ y $\\pi$, y $\\cos(x)=0$ da $\\frac{\\pi}{2}$ y $\\frac{3\\pi}{2}$. Hay que juntar las cuatro."
    },
    {
      "pregunta": "¿Cuáles son las soluciones de $2\\,\\operatorname{sen}^{2}(x)+\\operatorname{sen}(x)-1=0$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "$\\frac{\\pi}{6},\\ \\frac{5\\pi}{6},\\ \\frac{3\\pi}{2}$",
        "$\\dfrac{\\pi}{6},\\ \\dfrac{5\\pi}{6}$",
        "$\\dfrac{\\pi}{6},\\ \\dfrac{5\\pi}{6},\\ \\dfrac{\\pi}{2}$",
        "$\\dfrac{3\\pi}{2}$"
      ],
      "respuesta": "$\\frac{\\pi}{6},\\ \\frac{5\\pi}{6},\\ \\frac{3\\pi}{2}$",
      "explicacion": "Se factoriza $(2\\operatorname{sen}(x)-1)(\\operatorname{sen}(x)+1)=0$: $\\operatorname{sen}(x)=\\frac{1}{2}$ (dos soluciones) o $\\operatorname{sen}(x)=-1$ (una: $\\frac{3\\pi}{2}$). La opción con $\\frac{\\pi}{2}$ confunde $-1$ con $1$."
    },
    {
      "pregunta": "¿Cuáles son las soluciones de $\\cos(2x)=\\cos(x)$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "$\\dfrac{2\\pi}{3},\\ \\dfrac{4\\pi}{3}$",
        "$0,\\ \\frac{2\\pi}{3},\\ \\frac{4\\pi}{3}$",
        "$0,\\ \\dfrac{\\pi}{3},\\ \\dfrac{5\\pi}{3}$",
        "$0$"
      ],
      "respuesta": "$0,\\ \\frac{2\\pi}{3},\\ \\frac{4\\pi}{3}$",
      "explicacion": "Con $\\cos(2x)=2\\cos^{2}(x)-1$ queda $(2\\cos(x)+1)(\\cos(x)-1)=0$: $\\cos(x)=-\\frac{1}{2}$ da $\\frac{2\\pi}{3}$ y $\\frac{4\\pi}{3}$, y $\\cos(x)=1$ da $0$."
    },
    {
      "pregunta": "En $\\operatorname{sen}(2x)=\\operatorname{sen}(x)$, ¿por qué NO conviene dividir los dos miembros entre $\\operatorname{sen}(x)$?",
      "opciones": [
        "Porque el seno no se puede dividir",
        "Porque se pierden las soluciones donde $\\operatorname{sen}(x)=0$",
        "Porque cambia el signo de las soluciones",
        "Porque la ecuación deja de ser trigonométrica"
      ],
      "respuesta": "Porque se pierden las soluciones donde $\\operatorname{sen}(x)=0$",
      "explicacion": "Dividir entre algo que puede valer 0 elimina esas soluciones ($0$ y $\\pi$). Se pasa todo a un miembro y se factoriza: $\\operatorname{sen}(x)(2\\cos(x)-1)=0$."
    },
    {
      "pregunta": "¿Cuántas soluciones tiene $\\operatorname{sen}^{2}(x)=\\dfrac{1}{4}$ en $[0,\\ 2\\pi)$?",
      "opciones": [
        "Dos",
        "Una",
        "Cuatro: $\\operatorname{sen}(x)=\\pm\\dfrac{1}{2}$ da dos soluciones cada uno",
        "Ocho"
      ],
      "respuesta": "Cuatro: $\\operatorname{sen}(x)=\\pm\\dfrac{1}{2}$ da dos soluciones cada uno",
      "explicacion": "Al sacar la raíz hay dos signos: $\\operatorname{sen}(x)=\\frac{1}{2}$ y $\\operatorname{sen}(x)=-\\frac{1}{2}$. Cada una tiene dos soluciones: $\\frac{\\pi}{6},\\ \\frac{5\\pi}{6},\\ \\frac{7\\pi}{6},\\ \\frac{11\\pi}{6}$."
    },
    {
      "pregunta": "Al resolver una ecuación cuadrática en $\\cos(x)$ aparece $\\cos(x)=2$. ¿Qué se hace con ese valor?",
      "opciones": [
        "Se toma $x=\\cos^{-1}(2)$",
        "Se descarta: el coseno no puede valer 2",
        "Se usa $x=2$ radianes",
        "Se resta $2\\pi$"
      ],
      "respuesta": "Se descarta: el coseno no puede valer 2",
      "explicacion": "El coseno siempre está entre $-1$ y $1$, así que $\\cos(x)=2$ no tiene solución. Solo aporta soluciones el otro factor."
    }
  ]
}$trigonometria$::jsonb,
  2,
  true);
