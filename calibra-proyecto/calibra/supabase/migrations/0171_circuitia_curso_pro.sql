-- ============================================================
-- Prodigia — "Curso estructurado (Pro)" en Aprender de Circuitia, mismo
-- patrón exacto que 0170_calculia_curso_pro.sql (Fase C de Calculia).
--
-- A diferencia de las 5 técnicas rápidas de 0167_mundo_circuitia.sql
-- (trucos de reconocimiento de patrón, independientes entre sí), esto
-- es un curso real con progresión pedagógica: explicación conceptual
-- más profunda, ejemplo resuelto paso a paso (con números reales,
-- verificados contra el mismo kernel que usa el generador), y un
-- mini-quiz de comprensión que hay que aprobar para desbloquear el
-- próximo módulo.
--
-- 1) `techniques.requiere_pro` YA es una columna GLOBAL (agregada en
--    0170, no específica de Calculia) — no hace falta ningún DDL nuevo
--    acá, solo insertar filas con requiere_pro=true.
-- 2) `contenido.quiz` (jsonb) YA es un campo opcional soportado por
--    src/app/api/aprender/completar/route.ts (genérico, no hardcodea
--    "calculia" en ningún lado — solo lee requiere_pro + contenido.quiz
--    de la fila de `techniques` que corresponda por technique_id) y por
--    src/components/CaminoContinuo.tsx (`ctaPro`, opcional por nodo).
-- 3) 7 lecciones nuevas de Circuitia (`problem_type='circuitia'`,
--    `requiere_pro=true`), orden 6-12 (continúa después de las 5
--    técnicas rápidas de 0167, que usan orden 1-5): 2 de fundamentos
--    (serie/paralelo), 1 de resistencia equivalente, 2 de circuitos
--    mixtos, 2 de razonamiento cualitativo — fundamentadas en el kernel
--    real de src/lib/circuitos/resolver.ts (resistenciaEquivalente /
--    resolverCircuito / compararTrasPerturbacion), jamás una fórmula
--    inventada: cada paso resuelto y cada respuesta de quiz se verificó
--    corriendo el mismo algoritmo de resolver.ts contra un script
--    aparte antes de escribir este archivo (ver detalle en el reporte
--    de esta tanda y en docs/PARIDAD_MUNDOS.md). El caso "no_cambia" de
--    la Lección 7 reutiliza EXACTAMENTE la topología del test real
--    "en paralelo con 3 ramas, duplicar una rama no cambia la corriente
--    de una rama hermana" de src/lib/circuitos/resolver.test.ts
--    (R1=4Ω, R2=6Ω, R3=12Ω, fuente 12V, R2 se duplica a 12Ω) — no es un
--    caso inventado para la lección, es el mismo caso ya probado.
--
-- La validación de las respuestas del quiz sigue siendo responsabilidad
-- del SERVER (src/app/api/aprender/completar/route.ts, sin cambios en
-- esta migración) — quien no sea Pro no puede aprobar un módulo
-- requiere_pro aunque le pegue directo al endpoint, y una respuesta
-- incorrecta nunca marca `dominado`.
-- ============================================================

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

-- ---------- Módulo 1 (preview gratis siempre accesible) — Fundamentos: Ley de Ohm y circuitos en serie ----------
('circuitia-pro-fundamentos-ohm-serie', 'Curso Pro: Fundamentos — Ley de Ohm y circuitos en serie',
  'Qué dice la Ley de Ohm, por qué un circuito en serie comparte una sola corriente, y un ejemplo resuelto completo.',
  'circuitia',
  '{"pasos": [
    "Ley de Ohm: V = I·R. El voltaje sobre un resistor es directamente proporcional a la corriente que lo atraviesa, con la resistencia como factor de proporcionalidad — cuanto más grande R, más voltaje hace falta para la misma corriente.",
    "En un circuito en SERIE, los resistores están uno detrás de otro formando un único camino, sin bifurcaciones — la carga no tiene otro lugar por dónde irse, así que la MISMA corriente atraviesa a todos los resistores de la cadena.",
    "Ejemplo resuelto: un circuito en serie con R1=10Ω y R2=20Ω, alimentado por una fuente de 12V. Primero la resistencia equivalente: R_eq = R1 + R2 = 10 + 20 = 30Ω. Luego la corriente total con la Ley de Ohm: I = V/R_eq = 12/30 = 0.4A — esa es la corriente en TODO el circuito, en R1 y en R2 por igual.",
    "Con esa corriente, el voltaje de cada resistor sale de aplicar V=IR a cada uno por separado: V_R1 = 0.4·10 = 4V, V_R2 = 0.4·20 = 8V.",
    "Verificación (siempre se puede chequear): la suma de los voltajes de cada resistor tiene que dar exactamente el voltaje de la fuente. 4V + 8V = 12V ✓ — coincide con la fuente, confirma que el reparto está bien.",
    "Error común a evitar: pensar que la corriente también se \"reparte\" entre los resistores como el voltaje — en serie es al revés: la corriente es la misma en todos, y es el VOLTAJE el que se reparte según el tamaño de cada resistor."
  ],
  "quiz": [
    {"pregunta": "Un circuito en serie tiene R1=5Ω y R2=15Ω, con una fuente de 20V. ¿Cuál es la corriente total?", "opciones": ["1A", "4A", "0.75A", "20A"], "respuesta": "1A", "explicacion": "R_eq = 5+15 = 20Ω. Con la Ley de Ohm: I = V/R_eq = 20/20 = 1A."},
    {"pregunta": "¿Qué es cierto sobre la corriente en un circuito en serie simple (un solo camino, sin bifurcaciones)?", "opciones": ["Es la misma en todos los resistores", "Se reparte distinto en cada resistor", "Es cero en el segundo resistor", "Depende de qué resistor mires primero"], "respuesta": "Es la misma en todos los resistores", "explicacion": "En serie no hay otro camino para la carga — la misma corriente atraviesa cada resistor, uno tras otro."},
    {"pregunta": "En el circuito del ejemplo (R1=10Ω, R2=20Ω, fuente de 12V, corriente 0.4A), ¿cuánto vale el voltaje sobre R2?", "opciones": ["8V", "4V", "12V", "0.4V"], "respuesta": "8V", "explicacion": "V=IR: 0.4A×20Ω=8V. Y se puede comprobar: 4V (en R1) + 8V (en R2) = 12V, el total de la fuente."}
  ]}',
  6, true),

-- ---------- Módulo 2 — Circuitos en paralelo: voltaje compartido y reparto de corriente ----------
('circuitia-pro-paralelo-voltaje-corriente', 'Curso Pro: Circuitos en paralelo — voltaje compartido y reparto de corriente',
  'Por qué las ramas en paralelo comparten el mismo voltaje, cómo se reparte la corriente entre ellas, y un ejemplo resuelto.',
  'circuitia',
  '{"pasos": [
    "En un circuito en PARALELO, dos o más resistores están conectados a los mismos dos puntos (nodos) — por eso el voltaje sobre cada uno de ellos es EXACTAMENTE el mismo, sin importar cuánta resistencia tenga cada rama.",
    "Es lo contrario de lo que pasa en serie: ahí la corriente era compartida y el voltaje se repartía; en paralelo es el VOLTAJE el que es compartido y la CORRIENTE la que se reparte entre las ramas.",
    "Ejemplo resuelto: R1=10Ω y R2=20Ω en paralelo, con una fuente de 12V. Cada resistor ve el voltaje completo de la fuente: 12V sobre R1 y 12V sobre R2 también.",
    "Reparto de corriente (divisor de corriente): cada rama saca su propia corriente con Ley de Ohm usando SU resistencia: I_R1 = V/R1 = 12/10 = 1.2A. I_R2 = V/R2 = 12/20 = 0.6A.",
    "Verificación con la resistencia equivalente: 1/R_eq = 1/10 + 1/20 = 0.15, entonces R_eq = 6.6667Ω, y la corriente total que entrega la fuente es I_total = V/R_eq = 12/6.6667 = 1.8A — que coincide con I_R1 + I_R2 = 1.2 + 0.6 = 1.8A ✓.",
    "Insight clave: el resistor con MENOS resistencia se lleva MÁS corriente (es el camino \"más fácil\") — es la relación inversa. Error común: pensar que más resistencia atrae más corriente, es exactamente al revés."
  ],
  "quiz": [
    {"pregunta": "R1=10Ω y R2=20Ω están en paralelo con una fuente de 12V. ¿Cuál es la corriente que pasa por R1?", "opciones": ["1.2A", "0.6A", "1.8A", "2A"], "respuesta": "1.2A", "explicacion": "En paralelo cada resistor ve el voltaje completo de la fuente: I = V/R = 12/10 = 1.2A."},
    {"pregunta": "¿Qué es cierto sobre el voltaje en una conexión en paralelo?", "opciones": ["Es el mismo en todas las ramas", "Se reparte entre las ramas", "Es cero en la segunda rama", "Depende de la corriente que traiga cada rama"], "respuesta": "Es el mismo en todas las ramas", "explicacion": "Todas las ramas en paralelo están conectadas a los mismos dos nodos, así que ven exactamente el mismo voltaje."},
    {"pregunta": "Si dos resistores IGUALES están en paralelo, ¿cómo se reparte la corriente total entre ellos?", "opciones": ["Se reparte por igual entre los dos", "Toda va al primero", "Toda va al segundo", "Depende de cuál esté dibujado arriba"], "respuesta": "Se reparte por igual entre los dos", "explicacion": "Con la misma resistencia y el mismo voltaje compartido, I=V/R da exactamente el mismo valor para ambas ramas."}
  ]}',
  7, true),

-- ---------- Módulo 3 — Resistencia equivalente: series vs. paralelo ----------
('circuitia-pro-resistencia-equivalente-comparacion', 'Curso Pro: Resistencia equivalente — series vs. paralelo',
  'La fórmula de suma directa (series) contra la fórmula de recíprocos (paralelo), cuándo usar cada una, y un ejemplo comparado con los mismos números.',
  'circuitia',
  '{"pasos": [
    "En SERIE, la resistencia equivalente es la suma directa: R_eq = R1 + R2 + ... — agregar resistores en serie SIEMPRE aumenta (o deja igual) la resistencia total.",
    "En PARALELO, se suman los recíprocos y se invierte al final: 1/R_eq = 1/R1 + 1/R2 + ... — agregar resistores en paralelo SIEMPRE reduce (o deja igual) la resistencia total, porque se abren más caminos para la corriente.",
    "Ejemplo comparado: dos resistores de 8Ω cada uno. En serie: R_eq = 8 + 8 = 16Ω.",
    "Esos mismos dos resistores de 8Ω, ahora en paralelo: 1/R_eq = 1/8 + 1/8 = 2/8 = 1/4, entonces R_eq = 4Ω — el caso especial de dos resistores iguales en paralelo: la mitad de uno solo, nunca el doble.",
    "Con una fuente de 8V sobre cada configuración: en serie, I = 8/16 = 0.5A (la misma en ambos, y cada uno se queda con 4V ya que son iguales). En paralelo, I_total = 8/4 = 2A, repartida en partes iguales: 1A por cada resistor (porque tienen la misma resistencia y ven el mismo voltaje).",
    "Chequeo de sensatez rápido: el resultado en paralelo (4Ω) SIEMPRE tiene que ser menor o igual que el resistor más chico de la rama (8Ω) — si te da mayor, invertiste algo de más o de menos en la fórmula de recíprocos."
  ],
  "quiz": [
    {"pregunta": "Dos resistores de 8Ω cada uno están en serie. ¿Cuál es la resistencia equivalente?", "opciones": ["16Ω", "4Ω", "8Ω", "64Ω"], "respuesta": "16Ω", "explicacion": "En serie se suman directo: 8+8=16Ω."},
    {"pregunta": "Esos mismos dos resistores de 8Ω, ahora en paralelo. ¿Cuál es la resistencia equivalente?", "opciones": ["4Ω", "16Ω", "8Ω", "2Ω"], "respuesta": "4Ω", "explicacion": "1/R_eq=1/8+1/8=1/4, así que R_eq=4Ω — la mitad de uno solo, el caso especial de dos resistores iguales en paralelo."},
    {"pregunta": "¿Cuál es la fórmula correcta para la resistencia equivalente de varios resistores en PARALELO?", "opciones": ["1/R_eq = 1/R1 + 1/R2 + ...", "R_eq = R1 + R2 + ...", "R_eq = (R1 + R2) / 2", "R_eq = R1 + R2 + 10"], "respuesta": "1/R_eq = 1/R1 + 1/R2 + ...", "explicacion": "Es la suma de recíprocos, invertida al final — nunca la suma directa (esa es la fórmula de serie, no la de paralelo)."}
  ]}',
  8, true),

-- ---------- Módulo 4 — Circuitos mixtos: identificar el bloque paralelo primero ----------
('circuitia-pro-mixtos-identificar-bloque', 'Curso Pro: Circuitos mixtos — identificar el bloque en paralelo primero',
  'La estrategia de lectura para un circuito mixto: encontrar el bloque en paralelo antes de calcular nada, y colapsarlo a un solo valor.',
  'circuitia',
  '{"pasos": [
    "Un circuito mixto combina una rama en serie con un bloque en paralelo incrustado adentro — se resuelve de ADENTRO hacia AFUERA, nunca sumando todo de una sola vez.",
    "Cómo encontrar el bloque en paralelo de un vistazo: buscá el grupo de resistores que comparten los mismos dos nodos — suele estar dibujado como el tramo más anidado o más chico del circuito, no en la línea principal.",
    "Ejemplo resuelto: un circuito en serie con Rs1=10Ω y un bloque en paralelo formado por Rp1=20Ω y Rp2=20Ω.",
    "Paso 1 — colapsar el bloque en paralelo SOLO (en aislamiento, antes de tocar Rs1): 1/R_bloque = 1/20 + 1/20 = 1/10, entonces R_bloque = 10Ω.",
    "Paso 2 — con el bloque ya colapsado a un único valor, el circuito completo queda como una serie simple de dos resistores: R_eq total = Rs1 + R_bloque = 10 + 10 = 20Ω.",
    "Error común a evitar: sumar Rs1 + Rp1 + Rp2 todos juntos como si los tres estuvieran en serie — Rp1 y Rp2 tienen que colapsarse a UN solo valor con la fórmula de recíprocos ANTES de poder sumarlos con el resto de la serie."
  ],
  "quiz": [
    {"pregunta": "En un circuito serie con Rs1=10Ω y un bloque en paralelo de Rp1=20Ω y Rp2=20Ω, ¿cuál es la resistencia equivalente del bloque en paralelo, antes de sumarlo al resto?", "opciones": ["10Ω", "20Ω", "40Ω", "5Ω"], "respuesta": "10Ω", "explicacion": "1/R_bloque=1/20+1/20=1/10, entonces R_bloque=10Ω — el caso de dos resistores iguales en paralelo, la mitad de uno solo."},
    {"pregunta": "Con Rs1=10Ω y el bloque en paralelo ya colapsado a 10Ω, ¿cuál es la resistencia equivalente del circuito completo?", "opciones": ["20Ω", "10Ω", "30Ω", "200Ω"], "respuesta": "20Ω", "explicacion": "Ahora es una serie simple de dos valores: 10Ω (Rs1) + 10Ω (el bloque colapsado) = 20Ω."},
    {"pregunta": "¿Cuál es el primer paso correcto para leer un circuito mixto (serie con un bloque en paralelo adentro)?", "opciones": ["Identificar el bloque en paralelo y calcular su resistencia equivalente primero", "Sumar directamente todas las resistencias sin mirar cómo están conectadas", "Ignorar el bloque en paralelo y tratarlo como si no estuviera", "Calcular la corriente antes de conocer ninguna resistencia"], "respuesta": "Identificar el bloque en paralelo y calcular su resistencia equivalente primero", "explicacion": "El bloque en paralelo tiene que colapsarse a UN solo valor antes de poder sumarlo en serie con el resto — nunca se mezclan las dos fórmulas sobre los mismos resistores sueltos."}
  ]}',
  9, true),

-- ---------- Módulo 5 — Circuitos mixtos: resolverlos paso a paso ----------
('circuitia-pro-mixtos-resolver-paso-a-paso', 'Curso Pro: Circuitos mixtos — resolverlos paso a paso',
  'El algoritmo completo de dos pasadas (igual al que usa el kernel de resolución): resistencia equivalente de abajo hacia arriba, y después repartir corriente/voltaje de arriba hacia abajo.',
  'circuitia',
  '{"pasos": [
    "El algoritmo completo tiene dos pasadas: 1) de ABAJO hacia ARRIBA, se calcula la resistencia equivalente total y con eso la corriente total que entrega la fuente; 2) de ARRIBA hacia ABAJO, se reparte esa corriente/voltaje desde la fuente hasta cada resistor, respetando que en serie la corriente es compartida y en paralelo el voltaje es compartido.",
    "Ejemplo resuelto: Rs1=5Ω en serie con un bloque en paralelo (Rp1=20Ω, Rp2=20Ω) y luego Rs2=5Ω, con una fuente de 20V.",
    "Pasada 1 (abajo hacia arriba): primero el bloque, 1/R_bloque = 1/20 + 1/20 = 1/10 → R_bloque = 10Ω. Después la serie completa: R_eq total = Rs1 + R_bloque + Rs2 = 5 + 10 + 5 = 20Ω. Y con eso, la corriente total: I_total = V/R_eq = 20/20 = 1A — esta corriente atraviesa Rs1, el bloque (como conjunto) y Rs2, porque los tres están en serie entre sí.",
    "Pasada 2 (arriba hacia abajo, primer nivel): cada tramo en serie se queda con V=I_total×R_tramo. V_Rs1 = 1×5 = 5V. V_bloque = 1×10 = 10V. V_Rs2 = 1×5 = 5V. Verificación: 5+10+5 = 20V, exactamente el voltaje de la fuente ✓.",
    "Pasada 2 (un nivel más adentro, dentro del bloque): ahora Rp1 y Rp2 comparten el voltaje del bloque que ya calculaste (10V) — cada uno saca su propia corriente con Ley de Ohm: I_Rp1 = 10/20 = 0.5A, I_Rp2 = 10/20 = 0.5A.",
    "Verificación final: toda la corriente que entra al bloque tiene que salir repartida entre sus ramas — I_Rp1 + I_Rp2 = 0.5 + 0.5 = 1A, que coincide exactamente con I_total. Si esa suma no coincidiera, algo se calculó mal en algún paso anterior."
  ],
  "quiz": [
    {"pregunta": "En el circuito Rs1=5Ω + bloque paralelo (10Ω equivalente) + Rs2=5Ω, con fuente de 20V, ¿cuál es la corriente total que entrega la fuente?", "opciones": ["1A", "2A", "0.5A", "4A"], "respuesta": "1A", "explicacion": "R_eq total = 5+10+5 = 20Ω. I = V/R = 20/20 = 1A."},
    {"pregunta": "Con esa corriente total de 1A, ¿cuál es el voltaje sobre el bloque en paralelo (10Ω equivalente)?", "opciones": ["10V", "5V", "20V", "1V"], "respuesta": "10V", "explicacion": "V=IR: 1A×10Ω=10V — el bloque completo actúa como un solo resistor de 10Ω dentro de la serie."},
    {"pregunta": "Sabiendo que el bloque en paralelo tiene 10V en sus terminales y Rp1=Rp2=20Ω, ¿cuánta corriente pasa por Rp1?", "opciones": ["0.5A", "1A", "0.25A", "2A"], "respuesta": "0.5A", "explicacion": "Dentro del bloque, cada rama ve el voltaje compartido del bloque (10V): I=V/R=10/20=0.5A."}
  ]}',
  10, true),

-- ---------- Módulo 6 — Razonamiento cualitativo: cómo cambia una corriente o voltaje sin calcular todo ----------
('circuitia-pro-cualitativo-sube-o-baja', 'Curso Pro: Razonamiento cualitativo — cómo cambia una corriente sin calcular todo',
  'La regla rápida para saber si una corriente sube o baja cuando cambia un resistor, sin resolver el circuito entero — con un ejemplo que aumenta y uno que disminuye.',
  'circuitia',
  '{"pasos": [
    "Regla general: en un camino en serie único, aumentar la resistencia en cualquier punto SIEMPRE reduce (o deja igual) la corriente total; nunca la aumenta. Y al revés: reducir una resistencia siempre aumenta (o deja igual) la corriente.",
    "Circuito base: serie con R1=10Ω y R2=10Ω, fuente de 20V. R_eq = 20Ω, corriente base I = 20/20 = 1A — la misma en R1 y en R2, por estar en serie.",
    "Perturbación A — R1 se duplica a 20Ω: nuevo R_eq = 20+10 = 30Ω, nueva corriente I = 20/30 ≈ 0.667A. Resultado: DISMINUYE respecto de la base (de 1A a ≈0.667A), porque el camino ahora tiene más resistencia total.",
    "Perturbación B — en cambio, R1 se reduce a la mitad, a 5Ω: nuevo R_eq = 5+10 = 15Ω, nueva corriente I = 20/15 ≈ 1.333A. Resultado: AUMENTA respecto de la base (de 1A a ≈1.333A), porque el camino ahora tiene menos resistencia total.",
    "Por qué funciona sin resolver todo: en un camino en serie único, la corriente depende únicamente de la resistencia TOTAL de ese camino (I=V/R_eq) — si esa suma sube, la corriente baja (o queda igual); si esa suma baja, la corriente sube (o queda igual). Nunca al revés.",
    "Aplicación rápida: para estimar la DIRECCIÓN del cambio alcanza con preguntarse \"¿la resistencia total del camino subió o bajó?\" — no hace falta recalcular el circuito completo para eso, aunque para el VALOR exacto sí hay que resolverlo paso a paso."
  ],
  "quiz": [
    {"pregunta": "En un circuito en serie R1=10Ω y R2=10Ω con fuente de 20V (corriente base 1A), si R1 se duplica a 20Ω, ¿qué le pasa a la corriente total?", "opciones": ["Disminuye", "Aumenta", "No cambia", "Se vuelve cero"], "respuesta": "Disminuye", "explicacion": "La resistencia total sube de 20Ω a 30Ω, así que la corriente baja: de 1A a 20/30≈0.67A."},
    {"pregunta": "En el mismo circuito, si en cambio R1 se reduce a la mitad (a 5Ω), ¿qué le pasa a la corriente total?", "opciones": ["Aumenta", "Disminuye", "No cambia", "Se vuelve infinita"], "respuesta": "Aumenta", "explicacion": "La resistencia total baja de 20Ω a 15Ω, así que la corriente sube: de 1A a 20/15≈1.33A."},
    {"pregunta": "¿Por qué aumentar la resistencia de cualquier resistor en un circuito en serie simple SIEMPRE hace que la corriente baje o se mantenga, nunca que suba?", "opciones": ["Porque la resistencia total del circuito (la suma de todas) solo puede aumentar o quedar igual, nunca bajar", "Porque la fuente reduce su voltaje automáticamente al detectar el cambio", "Porque la corriente elige el camino más corto disponible", "Porque los resistores en serie se anulan entre sí"], "respuesta": "Porque la resistencia total del circuito (la suma de todas) solo puede aumentar o quedar igual, nunca bajar", "explicacion": "En serie, R_eq es una SUMA de resistencias positivas — agregar más nunca puede achicar esa suma, y una corriente mayor (I=V/R_eq) necesitaría un R_eq menor, no mayor."}
  ]}',
  11, true),

-- ---------- Módulo 7 — Razonamiento cualitativo: cuándo algo genuinamente NO cambia ----------
('circuitia-pro-cualitativo-cuando-no-cambia', 'Curso Pro: Razonamiento cualitativo — cuándo algo genuinamente NO cambia',
  'El caso legítimo (y a veces contraintuitivo) de "no cambia": una rama en paralelo conectada directo a la fuente no se ve afectada por cambios en sus ramas hermanas.',
  'circuitia',
  '{"pasos": [
    "En un bloque en paralelo conectado DIRECTO a la fuente, cada rama ve siempre el mismo voltaje (el de la fuente), sin importar qué pase en las ramas hermanas — y como la corriente de cada rama es I=V/R_propia, esa corriente TAMPOCO depende de las hermanas.",
    "Caso concreto, ya verificado en el kernel de resolución (resolver.test.ts): circuito en paralelo con R1=4Ω, R2=6Ω y R3=12Ω, fuente de 12V. Corrientes base: I_R1 = 12/4 = 3A, I_R2 = 12/6 = 2A, I_R3 = 12/12 = 1A.",
    "Perturbación: R2 se duplica a 12Ω. Nueva I_R2 = 12/12 = 1A — esa SÍ cambió (de 2A a 1A), tiene sentido porque cambió SU PROPIA resistencia.",
    "Pero I_R3 sigue siendo 12/12 = 1A, exactamente igual que antes — NO CAMBIA, aunque R2 (su \"hermana\" en el mismo bloque) haya cambiado. Por la misma razón, I_R1 tampoco cambia (sigue en 3A).",
    "Por qué no es un error de cálculo: el voltaje que ve R3 es siempre el de la fuente (12V, fijo), porque R3 está conectado directo a los mismos dos nodos que la fuente — la resistencia de R2 no entra en ninguna cuenta de I_R3=V/R3. Cambiar R2 sí cambia cuánta corriente TOTAL entrega la fuente (de 6A a 5A), pero esa diferencia la absorbe SOLO la rama que cambió, no las hermanas.",
    "Error común a evitar: asumir que \"cambiar algo en el circuito siempre afecta a todo el circuito\". En un bloque en paralelo puro conectado directo a la fuente, un cambio en una rama queda aislado en esa rama; solo se propagaría a las hermanas si hubiera algo en serie compartido entre el bloque y la fuente (como en las lecciones de circuitos mixtos)."
  ],
  "quiz": [
    {"pregunta": "En un circuito en paralelo con R1=4Ω, R2=6Ω y R3=12Ω conectados directo a una fuente de 12V, si R2 se duplica a 12Ω, ¿qué le pasa a la corriente en R3?", "opciones": ["No cambia", "Aumenta", "Disminuye", "Se vuelve cero"], "respuesta": "No cambia", "explicacion": "I_R3=V/R3=12/12=1A antes y después — no depende de R2 porque R3 sigue viendo el mismo voltaje de la fuente."},
    {"pregunta": "¿Por qué la corriente de R3 no cambia en ese caso, aunque R2 sí haya cambiado?", "opciones": ["Porque en un bloque en paralelo conectado directo a la fuente, cada rama ve siempre el mismo voltaje fijo, y su corriente depende solo de su propia resistencia", "Porque R3 está dibujado más lejos de la fuente que R2", "Porque la corriente total del circuito nunca cambia", "Porque R2 y R3 se cancelan entre sí"], "respuesta": "Porque en un bloque en paralelo conectado directo a la fuente, cada rama ve siempre el mismo voltaje fijo, y su corriente depende solo de su propia resistencia", "explicacion": "El voltaje de un bloque en paralelo puro conectado a la fuente es siempre el de la fuente — ninguna rama hermana puede cambiar ese valor para R3."},
    {"pregunta": "¿Qué SÍ cambia en ese mismo circuito cuando R2 se duplica?", "opciones": ["La corriente que pasa por R2 mismo, y la corriente total que entrega la fuente", "La corriente de R1", "El voltaje de R3", "Nada cambia en absoluto"], "respuesta": "La corriente que pasa por R2 mismo, y la corriente total que entrega la fuente", "explicacion": "I_R2 baja de 2A a 1A (su propia resistencia cambió), y por lo tanto la corriente total de la fuente baja de 6A a 5A — pero eso no altera a las ramas hermanas que no cambiaron."}
  ]}',
  12, true)

on conflict (slug) do nothing;
