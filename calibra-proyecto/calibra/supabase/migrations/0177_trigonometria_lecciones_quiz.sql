-- ============================================================
-- Prodigia — Proceso 1 (docs/PLAN_REVISION_CONTENIDO.md): Trigonometría.
-- Las 5 técnicas de 0108_mundo_trigonometria.sql se verificaron contra
-- src/lib/practica/trigonometria.ts (fórmulas reales del generador) y
-- trigonometría estándar:
--   - SOHCAHTOA: correcto (Seno=Opuesto/Hipotenusa, etc.), coincide con
--     generarRazones().
--   - Simetría por cuadrante: ángulo de referencia (180-θ / θ-180 /
--     360-θ) y regla de signos ASTC (Todos+/Seno+/Tangente+/Coseno+ en
--     cuadrantes 1/2/3/4) — coincide exactamente con TABLA_CIRCULO.
--   - Grados-radianes: 180°=π, 90°=π/2, 60°=π/3, 45°=π/4, 30°=π/6, y
--     los ejemplos 120°=2π/3, 210°=7π/6 — coinciden con los
--     radianLabel de TABLA_CIRCULO.
--   - Cuándo usar ley de senos vs. cosenos: ASA/AAS (pareja
--     ángulo-lado opuesto) → senos; SAS/SSS → cosenos — coincide con
--     generarLeySeno()/generarLeyCoseno() (nunca SSA, caso ambiguo).
--   - BUG REAL ENCONTRADO (se flaggea en el reporte de la tarea, NO se
--     parchea acá por instrucción explícita — solo se agrega el quiz
--     de esta lección probando los VALORES finales correctos, que sí
--     coinciden con TABLA_CIRCULO, evitando reproducir la descripción
--     de conteo rota en ninguna pregunta): la lección
--     'trigonometria-truco-mano-circulo' describe el método de conteo
--     con la dirección invertida ("contá los dedos DESDE ESE HASTA el
--     meñique" para el seno, "DESDE EL PULGAR hasta ese" para el
--     coseno) — aplicado literalmente al pulgar (0°) da sen(0°)=√5/2
--     (imposible, sen nunca supera 1). El método real verificado a mano
--     es: sen(θ) = √(dedos ENTRE el pulgar y el dedo, SIN incluir el
--     propio dedo)/2, cos(θ) = √(dedos ENTRE el dedo y el meñique, SIN
--     incluirlo)/2 — el ejemplo final que ya trae la lección para el
--     anular (60°: sen=√3/2, cos=1/2) SÍ es correcto, solo la
--     explicación general del método está mal redactada/invertida.
--
-- Sin correcciones de pasos en esta migración (regla de "nunca editar
-- una migración vieja" — cualquier fix de texto sería una migración
-- NUEVA aparte, fuera del alcance de esta tarea). Solo se agrega el
-- quiz (update por slug).
--
-- Convención de notación $...$ (KaTeX) todavía no aplica de forma
-- retroactiva a estas 5 lecciones — se deja para cuando se procese
-- Trigonometría en el Proceso 1 de notación (fuera de alcance de esta
-- sesión, que es solo quiz).
-- ============================================================

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Según SOHCAHTOA, ¿qué razón trigonométrica es Opuesto/Adyacente?",
    "opciones": ["Tangente", "Seno", "Coseno", "Ninguna — esa razón no existe"],
    "respuesta": "Tangente",
    "explicacion": "SOHCAHTOA: Seno=Opuesto/Hipotenusa, Coseno=Adyacente/Hipotenusa, Tangente=Opuesto/Adyacente — es la última letra del acrónimo."
  },
  {
    "pregunta": "¿Cómo se identifica la hipotenusa de un triángulo rectángulo?",
    "opciones": ["Es el lado más largo, siempre opuesto al ángulo recto", "Es el lado que toca el ángulo que te interesa", "Es siempre el lado horizontal del dibujo", "Es el lado más corto"],
    "respuesta": "Es el lado más largo, siempre opuesto al ángulo recto",
    "explicacion": "Es el primer paso de la técnica: identificar la hipotenusa antes de decidir cuál lado es opuesto y cuál adyacente."
  },
  {
    "pregunta": "Para un ángulo A dado, ¿cómo se distingue el lado opuesto del adyacente?",
    "opciones": ["El opuesto NO toca el ángulo A; el adyacente sí lo toca (sin ser la hipotenusa)", "El opuesto es siempre el lado más largo", "El adyacente es siempre la hipotenusa", "Son intercambiables, da lo mismo"],
    "respuesta": "El opuesto NO toca el ángulo A; el adyacente sí lo toca (sin ser la hipotenusa)",
    "explicacion": "Es la regla que da la técnica para no dudar según el ángulo que te pregunten — opuesto y adyacente cambian según el ángulo, la hipotenusa nunca."
  }
]}'::jsonb
where slug = 'trigonometria-sohcahtoa';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Usando el truco de la mano, ¿cuánto vale sen(90°) (dedo meñique)?",
    "opciones": ["1", "√3/2", "1/2", "0"],
    "respuesta": "1",
    "explicacion": "El meñique es el extremo de 90° — sen(90°)=1, el valor máximo posible del seno."
  },
  {
    "pregunta": "Usando el truco de la mano, ¿cuánto vale cos(0°) (dedo pulgar)?",
    "opciones": ["1", "0", "1/2", "√2/2"],
    "respuesta": "1",
    "explicacion": "El pulgar es el extremo de 0° — cos(0°)=1, el valor máximo posible del coseno."
  },
  {
    "pregunta": "Para el dedo anular (60°), la técnica da sen(60°)=√3/2 y cos(60°)=1/2. ¿Cuál de estas afirmaciones es correcta?",
    "opciones": ["sen(60°) es mayor que cos(60°)", "sen(60°) es igual a cos(60°)", "cos(60°) es mayor que sen(60°)", "Ninguno de los dos se puede saber sin calculadora"],
    "respuesta": "sen(60°) es mayor que cos(60°)",
    "explicacion": "√3/2 ≈ 0.87 es mayor que 1/2 — tiene sentido porque a 60° (más cerca de 90° que de 0°) el seno ya domina sobre el coseno."
  }
]}'::jsonb
where slug = 'trigonometria-truco-mano-circulo';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿Cuál es el ángulo de referencia de 150° (cuadrante 2)?",
    "opciones": ["30°", "150°", "60°", "210°"],
    "respuesta": "30°",
    "explicacion": "En el cuadrante 2 el ángulo de referencia es 180°−θ = 180°−150° = 30°."
  },
  {
    "pregunta": "Según la regla ASTC, ¿en qué cuadrante es POSITIVA la tangente?",
    "opciones": ["Cuadrante 3", "Cuadrante 1", "Cuadrante 2", "Cuadrante 4"],
    "respuesta": "Cuadrante 3",
    "explicacion": "ASTC: Todos positivos en el 1, Seno positivo en el 2, Tangente positiva en el 3, Coseno positivo en el 4."
  },
  {
    "pregunta": "¿Qué es lo único que cambia entre el primer cuadrante y los otros 3, una vez que ya sabés el ángulo de referencia?",
    "opciones": ["El signo del valor", "El valor numérico completo, hay que recalcularlo todo", "Nada, los 4 cuadrantes dan siempre el mismo resultado", "Solo cambia para el seno, nunca para el coseno o la tangente"],
    "respuesta": "El signo del valor",
    "explicacion": "El VALOR siempre es el mismo que el del ángulo de referencia en el primer cuadrante — lo único que cambia entre cuadrantes es el signo, que decide la regla ASTC."
  }
]}'::jsonb
where slug = 'trigonometria-simetria-cuadrantes';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿Cuántos radianes son 60°?",
    "opciones": ["π/3", "π/6", "π/4", "π/2"],
    "respuesta": "π/3",
    "explicacion": "60° es uno de los 4 ángulos base a memorizar: 90°=π/2, 60°=π/3, 45°=π/4, 30°=π/6."
  },
  {
    "pregunta": "Usando el atajo de sumar/restar los denominadores base, ¿cuántos radianes son 120°?",
    "opciones": ["2π/3", "π/3", "4π/3", "3π/2"],
    "respuesta": "2π/3",
    "explicacion": "120° es el doble de 60°, así que su equivalente en radianes es el doble de π/3: 2π/3."
  },
  {
    "pregunta": "Usando el atajo de sumar 180°(=π) más el ángulo base, ¿cuántos radianes son 210°?",
    "opciones": ["7π/6", "π/6", "6π/7", "11π/6"],
    "respuesta": "7π/6",
    "explicacion": "210° = 180° + 30°, es decir π + π/6 = 7π/6."
  }
]}'::jsonb
where slug = 'trigonometria-grados-radianes';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Conocés un ángulo y el lado opuesto a ese ángulo, más otro ángulo. ¿Qué ley usás para completar el triángulo?",
    "opciones": ["Ley de senos", "Ley de cosenos", "Ninguna, falta información siempre", "Teorema de Pitágoras"],
    "respuesta": "Ley de senos",
    "explicacion": "Tener una pareja ángulo-lado opuesto (ASA/AAS) es exactamente la señal para usar ley de senos: a/sen(A) = b/sen(B) = c/sen(C)."
  },
  {
    "pregunta": "Conocés 2 lados de un triángulo y el ángulo QUE ESTÁ ENTRE ellos (SAS). ¿Qué ley corresponde?",
    "opciones": ["Ley de cosenos", "Ley de senos", "Teorema de Pitágoras directo", "No se puede resolver sin un tercer lado"],
    "respuesta": "Ley de cosenos",
    "explicacion": "SAS (2 lados + ángulo incluido) no tiene ninguna pareja ángulo-lado opuesto disponible — ahí es donde aplica la ley de cosenos."
  },
  {
    "pregunta": "¿A qué fórmula conocida se parece la ley de cosenos, con un término extra?",
    "opciones": ["Al teorema de Pitágoras, con el término extra −2ab·cos(C)", "A la ley de senos, invertida", "A la fórmula del área de un triángulo", "No se parece a ninguna fórmula conocida"],
    "respuesta": "Al teorema de Pitágoras, con el término extra −2ab·cos(C)",
    "explicacion": "c² = a² + b² − 2ab·cos(C) es una versión generalizada de Pitágoras para triángulos que no son rectángulos — cuando C=90°, cos(C)=0 y se reduce a Pitágoras puro."
  }
]}'::jsonb
where slug = 'trigonometria-cuando-usar-cada-ley';
