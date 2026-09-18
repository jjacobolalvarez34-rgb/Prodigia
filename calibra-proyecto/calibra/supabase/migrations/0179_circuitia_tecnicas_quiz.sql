-- ============================================================
-- Prodigia — Proceso 1 (docs/PLAN_REVISION_CONTENIDO.md): quiz para las
-- 5 técnicas rápidas GRATUITAS de Circuitia (0167_mundo_circuitia.sql,
-- requiere_pro=false) — NO son las 7 lecciones del "Curso estructurado
-- (Pro)" de 0171_circuitia_curso_pro.sql, que ya tienen su propio quiz.
--
-- Las 5 técnicas son atajos de RECONOCIMIENTO/RAZONAMIENTO CUALITATIVO
-- (identificar de un vistazo el tipo de circuito, o razonar sin
-- calcular), no cálculos completos — por eso el quiz de cada una es
-- más corto (3 preguntas) y pide clasificar/razonar, no resolver un
-- circuito entero. Cada dato se verificó contra
-- src/lib/circuitos/resolver.ts (el kernel real que resuelve todo
-- circuito) y src/lib/practica/circuitia.ts:
--   - Serie vs. paralelo vs. mixto: coincide con NodoCircuito (tipo
--     "serie"/"paralelo") y construirMixto (una rama en serie con un
--     bloque en paralelo adentro).
--   - R_eq en serie = suma directa; en paralelo = recíproco de la suma
--     de recíprocos (y el caso especial R/2 para 2 iguales): coincide
--     con resistenciaEquivalente().
--   - En serie la corriente es compartida y el voltaje se reparte; en
--     paralelo el voltaje es compartido y la corriente se reparte:
--     coincide EXACTAMENTE con la lógica de repartir() en
--     resolverCircuito (serie: misma corriente, voltaje=corriente×R;
--     paralelo: mismo voltaje, corriente=voltaje/R).
--   - Circuito mixto: colapsar primero el bloque en paralelo a un
--     resistor equivalente, después tratarlo como serie simple:
--     coincide con cómo construirMixto anida paralelo dentro de serie
--     y con cómo resolverCircuito resuelve top-down.
--   - Estimar sin calcular (más resistencia en un tramo nunca baja la
--     corriente total; una rama hermana en paralelo directo a la
--     fuente no cambia si otra rama cambia; en serie todos se ven
--     afectados): coincide EXACTAMENTE con el comportamiento
--     documentado y probado de compararTrasPerturbacion() en
--     resolver.ts, incluido el caso "no_cambia" como resultado
--     legítimo.
-- No se encontraron errores en estas 5 técnicas — solo se agrega el
-- quiz (update por slug, nunca se toca 0167).
-- ============================================================

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Los resistores forman un único camino, uno detrás del otro, sin bifurcaciones. ¿Qué tipo de conexión es?",
    "opciones": ["Serie", "Paralelo", "Mixto", "Ninguna de las anteriores"],
    "respuesta": "Serie",
    "explicacion": "Es la definición de serie: un solo camino, la corriente es la misma en todos los resistores."
  },
  {
    "pregunta": "Cada resistor tiene sus dos extremos conectados a los mismos dos puntos (nodos). ¿Qué tipo de conexión es?",
    "opciones": ["Paralelo", "Serie", "Mixto", "No se puede saber sin los valores de resistencia"],
    "respuesta": "Paralelo",
    "explicacion": "Es la definición de paralelo: mismos dos nodos compartidos, el voltaje es el mismo en todos los resistores."
  },
  {
    "pregunta": "Una rama en serie que en algún tramo se abre en 2 o más caminos que después se vuelven a juntar, ¿qué tipo de circuito es?",
    "opciones": ["Mixto", "Serie puro", "Paralelo puro", "No es un circuito válido"],
    "respuesta": "Mixto",
    "explicacion": "Combina las dos reglas por partes — el bloque que se abre y se vuelve a juntar es la parte en paralelo, el resto sigue las reglas de serie."
  }
]}'::jsonb
where slug = 'circuitia-reconocer-serie-vs-paralelo';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿Cómo se calcula la resistencia equivalente de resistores en SERIE?",
    "opciones": ["Se suman directo: R_eq = R1 + R2 + R3", "Se suman los recíprocos y se invierte", "Se promedian", "Se multiplican entre sí"],
    "respuesta": "Se suman directo: R_eq = R1 + R2 + R3",
    "explicacion": "En serie, mientras más resistores agregues, más resistencia total — la suma es directa, sin recíprocos."
  },
  {
    "pregunta": "¿Cómo se calcula la resistencia equivalente de resistores en PARALELO?",
    "opciones": ["1/R_eq = 1/R1 + 1/R2 + 1/R3, y al final se invierte el resultado", "Se suman directo, igual que en serie", "Se resta la más chica de la más grande", "Se toma solo la resistencia más chica del grupo"],
    "respuesta": "1/R_eq = 1/R1 + 1/R2 + 1/R3, y al final se invierte el resultado",
    "explicacion": "En paralelo se suman los RECÍPROCOS — mientras más resistores agregues, MENOS resistencia total, al revés que en serie."
  },
  {
    "pregunta": "Dos resistores iguales de valor R, conectados en paralelo, dan una resistencia equivalente de...",
    "opciones": ["R/2", "2R", "R", "R²"],
    "respuesta": "R/2",
    "explicacion": "Es el caso especial fácil de recordar: la mitad, no el doble — sirve como chequeo rápido de sensatez de cualquier cálculo en paralelo."
  }
]}'::jsonb
where slug = 'circuitia-formula-resistencia-paralelo';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "En un grupo de resistores conectados en SERIE, ¿qué es igual en todos ellos?",
    "opciones": ["La corriente", "El voltaje", "La resistencia", "La potencia"],
    "respuesta": "La corriente",
    "explicacion": "En serie la corriente no tiene otro camino por donde irse — es la misma para todos; el voltaje se reparte según el tamaño de cada resistor."
  },
  {
    "pregunta": "En un grupo de resistores conectados en PARALELO, ¿qué es igual en todos ellos?",
    "opciones": ["El voltaje", "La corriente", "La resistencia", "La potencia"],
    "respuesta": "El voltaje",
    "explicacion": "En paralelo todos están conectados a los mismos 2 puntos, así que el voltaje es el mismo — la corriente se reparte según la resistencia de cada rama."
  },
  {
    "pregunta": "En SERIE, un resistor con más resistencia que sus vecinos (misma corriente para todos) se queda con...",
    "opciones": ["Más voltaje", "Menos voltaje", "La misma corriente que los demás, pero cero voltaje", "Más corriente que los demás"],
    "respuesta": "Más voltaje",
    "explicacion": "Por V=IR con la misma I para todos, a mayor R le corresponde mayor V — es la relación inversa de lo que pasa en paralelo (ahí, a mayor R le corresponde MENOS corriente)."
  }
]}'::jsonb
where slug = 'circuitia-voltaje-vs-corriente-compartidos';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Al leer un circuito mixto, ¿qué se busca y se resuelve PRIMERO?",
    "opciones": ["El bloque de resistores en paralelo (colapsarlo a un solo valor equivalente)", "El resistor con el valor más grande", "La fuente de voltaje", "El resistor más cercano a la fuente, sin importar cómo esté conectado"],
    "respuesta": "El bloque de resistores en paralelo (colapsarlo a un solo valor equivalente)",
    "explicacion": "Un circuito mixto se resuelve de adentro hacia afuera — el primer paso siempre es encontrar el grupo que comparte los mismos 2 nodos y calcular su resistencia equivalente."
  },
  {
    "pregunta": "Una vez que el bloque en paralelo ya está colapsado a un solo resistor \"virtual\", ¿cómo queda el circuito completo?",
    "opciones": ["Como una serie simple, sumando ese valor con los demás resistores en serie", "Como un nuevo bloque en paralelo", "Ya no se puede resolver más", "Igual que antes, sin cambios"],
    "respuesta": "Como una serie simple, sumando ese valor con los demás resistores en serie",
    "explicacion": "Es el segundo paso de la técnica: con el bloque ya reducido a un número, el resto del circuito se trata con las reglas simples de serie."
  },
  {
    "pregunta": "Para hallar el voltaje de un resistor específico DENTRO del bloque en paralelo, ¿qué necesitás calcular primero?",
    "opciones": ["El voltaje que le llega a todo el bloque en paralelo", "La corriente de la fuente completa", "La resistencia de un resistor cualquiera fuera del bloque", "No hace falta ningún cálculo previo"],
    "respuesta": "El voltaje que le llega a todo el bloque en paralelo",
    "explicacion": "Recién con el voltaje del bloque completo (que se reparte igual a todas sus ramas, por ser paralelo) se puede calcular la corriente de un resistor específico adentro."
  }
]}'::jsonb
where slug = 'circuitia-leer-mixto-por-el-bloque-paralelo';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Si aumenta la resistencia de un tramo del circuito, ¿qué le pasa a la corriente TOTAL que entrega la fuente?",
    "opciones": ["Nunca sube (baja o queda igual)", "Siempre sube", "Se duplica siempre", "No depende de la resistencia total"],
    "respuesta": "Nunca sube (baja o queda igual)",
    "explicacion": "Más resistencia total en el camino siempre frena más (o igual) la corriente que la fuente puede entregar — nunca la aumenta."
  },
  {
    "pregunta": "En un bloque en PARALELO conectado directo a la fuente, si cambia la resistencia de UNA rama, ¿qué le pasa a la corriente de una rama HERMANA?",
    "opciones": ["No cambia", "Siempre aumenta", "Siempre disminuye", "Se vuelve cero"],
    "respuesta": "No cambia",
    "explicacion": "Cada rama en paralelo sigue viendo el mismo voltaje de siempre (compartido), así que su propia corriente (I=V/R con su propia R, sin cambios) no se ve afectada por lo que pase en una rama hermana."
  },
  {
    "pregunta": "En SERIE, si cambia la resistencia de un resistor, ¿qué le pasa a los demás resistores de esa misma rama?",
    "opciones": ["A todos los afecta — la misma corriente (ahora distinta) atraviesa a todos por igual", "No les pasa nada, cada uno es independiente", "Solo afecta al resistor inmediatamente siguiente", "Solo afecta a la fuente, nunca a otros resistores"],
    "respuesta": "A todos los afecta — la misma corriente (ahora distinta) atraviesa a todos por igual",
    "explicacion": "En serie todos comparten la misma corriente — si esa corriente cambia (porque cambió la resistencia total), afecta a todos los resistores de la rama por igual, a diferencia de una rama en paralelo."
  }
]}'::jsonb
where slug = 'circuitia-estimar-sube-o-baja-sin-calcular';
