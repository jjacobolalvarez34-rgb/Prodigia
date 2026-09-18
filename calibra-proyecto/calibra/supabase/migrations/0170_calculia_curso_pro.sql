-- ============================================================
-- Prodigia — Fase C: "Curso estructurado (Pro)" en Aprender de Calculia.
--
-- A diferencia de las 5 técnicas rápidas de 0165_mundo_calculia.sql
-- (trucos de reconocimiento de patrón, independientes entre sí), esto
-- es un curso real con progresión pedagógica: explicación conceptual
-- más profunda, ejemplo resuelto paso a paso, y un mini-quiz de
-- comprensión que hay que aprobar para desbloquear el próximo módulo.
-- Piloto ÚNICO en Calculia — no se replica en ningún otro mundo.
--
-- 1) `techniques.requiere_pro` es una columna GLOBAL (no específica de
--    Calculia) para que cualquier mundo futuro pueda tener su propio
--    curso Pro reutilizando la misma tabla — default false, riesgo cero
--    para las filas existentes (nada cambia para ellas).
-- 2) `contenido` (jsonb, sin validación de esquema más allá de lo que ya
--    tenía) gana un campo opcional `quiz`: [{ pregunta, opciones,
--    respuesta, explicacion? }]. Las técnicas rápidas viejas no tienen
--    esta clave, así que no se ven afectadas.
-- 3) 7 lecciones nuevas de Calculia (`problem_type='calculia'`,
--    `requiere_pro=true`), orden 6-12 (continúa después de las 5
--    técnicas rápidas de 0165, que usan orden 1-5): 2 de Derivadas, 2 de
--    Integrales, 1 de Series, 2 de Multivariable/EDOs — fundamentadas en
--    los generadores reales de src/lib/practica/calculia.ts (jamás se
--    inventa una fórmula: cada paso resuelto y cada respuesta de quiz se
--    verificó a mano contra las mismas reglas que usa el generador).
--
-- La validación de las respuestas del quiz es responsabilidad del
-- SERVER (src/app/api/aprender/completar/route.ts) — quien no sea Pro
-- no puede aprobar un módulo requiere_pro aunque le pegue directo al
-- endpoint, y una respuesta incorrecta nunca marca `dominado`.
-- ============================================================

alter table public.techniques add column if not exists requiere_pro boolean not null default false;

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

-- ---------- Módulo 1 (preview gratis siempre accesible) — Derivadas: la regla de la potencia desde cero ----------
('calculia-pro-derivadas-fundamentos', 'Curso Pro: Derivadas desde cero — la regla de la potencia',
  'Qué significa derivar y cómo aplicar la regla de la potencia paso a paso, con un ejemplo resuelto completo.',
  'calculia',
  '{"pasos": [
    "La derivada de f(x) en un punto es la pendiente de la recta tangente ahí — qué tan rápido cambia f(x) cuando x cambia un poquito. No es un truco algebraico suelto: es una medida de razón de cambio.",
    "Regla de la potencia: si f(x) = c·xⁿ, entonces f''(x) = c·n·xⁿ⁻¹. Se baja el exponente como factor multiplicando al coeficiente, y se le resta 1 al exponente.",
    "Ejemplo resuelto: deriva f(x) = 5x⁴. Coeficiente c=5, exponente n=4. Aplicando la regla: f''(x) = 5·4·x⁴⁻¹ = 20x³.",
    "Verificación rápida: el exponente de la derivada SIEMPRE es uno menos que el original (4 → 3), y el coeficiente nuevo es el coeficiente viejo multiplicado por el exponente viejo (5·4=20) — si tu resultado no cumple las dos cosas, revisá el paso.",
    "Caso especial: la derivada de una constante sola (como f(x)=7, que es 7·x⁰) es siempre 0 — no hay pendiente porque la función no cambia nunca.",
    "Error común a evitar: olvidarse de restar 1 al exponente (dejar x⁴ en vez de x³) o no multiplicar por el exponente original — son los dos errores más frecuentes de esta regla."
  ],
  "quiz": [
    {"pregunta": "Deriva f(x) = 6x³ respecto de x.", "opciones": ["18x²", "6x²", "18x³", "3x²"], "respuesta": "18x²", "explicacion": "Bajás el exponente (3) como factor: 6·3=18, y le restás 1 al exponente: x³ → x². Da 18x²."},
    {"pregunta": "¿Cuál es la derivada de una función constante, como f(x) = 9?", "opciones": ["0", "9", "1", "9x"], "respuesta": "0", "explicacion": "Una constante no cambia nunca — su pendiente (razón de cambio) es siempre 0, sin importar el valor de la constante."},
    {"pregunta": "Deriva f(x) = 2x⁵ respecto de x.", "opciones": ["10x⁴", "2x⁴", "10x⁵", "5x⁴"], "respuesta": "10x⁴", "explicacion": "Coeficiente 2 por exponente 5 = 10, y el exponente baja de 5 a 4: 10x⁴."}
  ]}',
  6, true),

-- ---------- Módulo 2 — Derivadas: producto, cociente y cadena ----------
('calculia-pro-derivadas-producto-cociente-cadena', 'Curso Pro: Derivadas — producto, cociente y cadena',
  'Las tres reglas que hacen falta cuando la potencia sola no alcanza: multiplicación de expresiones, división de expresiones, y funciones "adentro de otra función".',
  'calculia',
  '{"pasos": [
    "Regla del producto: si f(x) = u(x)·v(x), entonces f''(x) = u''(x)·v(x) + u(x)·v''(x) — la derivada del primero por el segundo SIN derivar, más el primero SIN derivar por la derivada del segundo. Nunca derives u y v por separado y los multipliques entre sí, eso da un resultado distinto.",
    "Ejemplo resuelto (producto): deriva f(x) = (2x)(3x²). u=2x, u''=2; v=3x², v''=6x. f''(x) = 2·3x² + 2x·6x = 6x² + 12x² = 18x².",
    "Regla del cociente: si f(x) = u(x)/v(x), entonces f''(x) = (u''v - uv'')/v² — el orden de la resta en el numerador importa (derivada de arriba por abajo, MENOS arriba por derivada de abajo).",
    "Regla de la cadena: si f(x) = (algo con x)ⁿ donde ese \"algo\" no es simplemente x, hay una función adentro de otra. Se deriva la función de afuera dejando lo de adentro igual, y se multiplica por la derivada de adentro.",
    "Ejemplo resuelto (cadena): deriva f(x) = (3x+2)⁴. La de afuera es (adentro)⁴ → 4(adentro)³; la derivada de adentro (3x+2) es 3. Entonces f''(x) = 4(3x+2)³·3 = 12(3x+2)³.",
    "Cómo elegir la regla correcta de un vistazo: ¿es una multiplicación de dos expresiones? Producto. ¿Es una división? Cociente. ¿Hay un paréntesis elevado a una potencia con algo más que x adentro? Cadena — y nunca te olvides del factor de adentro."
  ],
  "quiz": [
    {"pregunta": "Deriva f(x) = (2x+1)³ usando la regla de la cadena.", "opciones": ["6(2x+1)²", "3(2x+1)²", "6(2x+1)³", "2(2x+1)²"], "respuesta": "6(2x+1)²", "explicacion": "La de afuera da 3(2x+1)², y hay que multiplicar por la derivada de adentro (2x+1)'' = 2: 3·2=6, queda 6(2x+1)²."},
    {"pregunta": "¿Qué regla usás para derivar f(x) = (x²+1)/(x+3)?", "opciones": ["Regla del cociente", "Regla del producto", "Regla de la cadena", "Regla de la potencia sola"], "respuesta": "Regla del cociente", "explicacion": "Es una DIVISIÓN de dos expresiones — eso siempre pide la regla del cociente, con el orden alto''·bajo menos alto·bajo'' en el numerador."},
    {"pregunta": "Al aplicar la regla del producto a f(x) = u(x)v(x), ¿cuál es la fórmula correcta?", "opciones": ["u''v + uv''", "u''v''", "u''v - uv''", "uv"], "respuesta": "u''v + uv''", "explicacion": "Es una SUMA de dos términos — derivada del primero por el segundo sin derivar, más el primero sin derivar por la derivada del segundo. Multiplicar u''·v'' directamente es el error más común."}
  ]}',
  7, true),

-- ---------- Módulo 3 — Integrales: antiderivada y la regla de la potencia inversa ----------
('calculia-pro-integrales-fundamentos', 'Curso Pro: Integrales desde cero — la antiderivada',
  'Qué es integrar (deshacer una derivada) y cómo aplicar la regla de la potencia al revés, con ejemplo resuelto y verificación.',
  'calculia',
  '{"pasos": [
    "Integrar es el proceso INVERSO de derivar: ∫f(x) dx busca una función F(x) cuya derivada sea f(x). Por eso siempre se agrega \"+ C\" — cualquier constante desaparece al derivar, así que hay infinitas respuestas válidas que difieren solo en una constante.",
    "Regla de la potencia (integrales): ∫xⁿ dx = xⁿ⁺¹/(n+1) + C, siempre que n ≠ -1. Subís el exponente en 1, y dividís por ese exponente NUEVO (nunca por el viejo).",
    "Ejemplo resuelto: calcula ∫6x² dx. Exponente n=2, sube a 3; coeficiente 6 dividido por 3 (el exponente nuevo) da 2. Entonces ∫6x² dx = 2x³ + C.",
    "Verificación (siempre se puede chequear derivando la respuesta): la derivada de 2x³ es 2·3·x² = 6x², que es exactamente el integrando original — confirma que la antiderivada está bien.",
    "Caso especial n=-1: ∫(1/x) dx = ln|x| + C — es el único caso donde la fórmula de arriba no funciona, porque dividir por (n+1)=0 sería indefinido.",
    "Error común: copiar el integrando tal cual como si ya fuera la respuesta (sin integrar de verdad), o subir el exponente pero olvidarse de dividir por el exponente nuevo."
  ],
  "quiz": [
    {"pregunta": "Calcula ∫12x³ dx.", "opciones": ["3x⁴ + C", "12x⁴ + C", "3x³ + C", "4x⁴ + C"], "respuesta": "3x⁴ + C", "explicacion": "El exponente sube de 3 a 4, y el coeficiente 12 se divide por ese exponente nuevo (4): 12/4=3. Queda 3x⁴ + C."},
    {"pregunta": "¿Por qué toda integral indefinida lleva \"+ C\"?", "opciones": ["Porque cualquier constante desaparece al derivar, así que hay infinitas antiderivadas posibles", "Es una convención sin motivo matemático", "Porque C siempre vale 0", "Solo se agrega en integrales de potencias"], "respuesta": "Porque cualquier constante desaparece al derivar, así que hay infinitas antiderivadas posibles", "explicacion": "Si F(x) es una antiderivada de f(x), F(x)+C también lo es para cualquier constante C, porque la derivada de una constante es 0."},
    {"pregunta": "Calcula ∫(1/x) dx.", "opciones": ["ln|x| + C", "1/x² + C", "x⁰ + C", "-1/x² + C"], "respuesta": "ln|x| + C", "explicacion": "Es el único caso donde la regla de la potencia no funciona (n=-1 haría dividir por cero) — la antiderivada de 1/x es siempre el logaritmo natural."}
  ]}',
  8, true),

-- ---------- Módulo 4 — Integrales: exponencial, trigonométricas y sustitución simple ----------
('calculia-pro-integrales-avanzadas', 'Curso Pro: Integrales — exponencial, trigonométricas y sustitución',
  'Tres formas más allá de la potencia: la exponencial, seno/coseno, y cómo reconocer cuándo conviene sustitución simple.',
  'calculia',
  '{"pasos": [
    "∫eᵃˣ dx = (1/a)eᵃˣ + C — la exponencial es la única función que reaparece intacta al derivar, pero con coeficiente a adentro hay que dividir por a al integrar (se puede verificar derivando: la derivada de (1/a)eᵃˣ es (1/a)·a·eᵃˣ = eᵃˣ, correcto).",
    "∫cos(x) dx = sen(x) + C, y ∫sen(x) dx = -cos(x) + C — el signo negativo va SOLO en la integral del seno, nunca en la del coseno. Si dudás, derivá la respuesta: la derivada de sen(x) es cos(x) (correcto), la derivada de -cos(x) es sen(x) (correcto).",
    "Sustitución simple (u = ax+b): sirve cuando el integrando es una potencia de una expresión LINEAL, como (ax+b)ⁿ. La fórmula es ∫(ax+b)ⁿ dx = (1/(a(n+1)))(ax+b)ⁿ⁺¹ + C.",
    "Ejemplo resuelto: calcula ∫8(2x+1)³ dx. Acá a=2, n=3, y el coeficiente 8 ya incluye el factor a(n+1)=2·4=8 — así que el coeficiente que queda en la respuesta es 8/8=1. Resultado: (2x+1)⁴ + C.",
    "Verificación: la derivada de (2x+1)⁴ es 4(2x+1)³·2 (regla de la cadena) = 8(2x+1)³, que es exactamente el integrando original.",
    "Cómo no perderse: identificá primero si hay una potencia externa con un binomio linear adentro (pide sustitución), si es eᵃˣ (pide dividir por a), o si es seno/coseno (cuidado con el signo) — nunca se mezclan las tres reglas en el mismo paso."
  ],
  "quiz": [
    {"pregunta": "Calcula ∫e^(3x) dx.", "opciones": ["(1/3)e^3x + C", "e^3x + C", "3e^3x + C", "(1/3)e^x + C"], "respuesta": "(1/3)e^3x + C", "explicacion": "La exponencial se mantiene igual, pero hay que dividir por el coeficiente del exponente (3) para que la derivada de la respuesta vuelva a dar e^3x·3."},
    {"pregunta": "Calcula ∫sen(x) dx.", "opciones": ["-cos(x) + C", "cos(x) + C", "-sen(x) + C", "sen(x) + C"], "respuesta": "-cos(x) + C", "explicacion": "La derivada de -cos(x) es sen(x) (porque la derivada de cos(x) es -sen(x), y el signo se cancela) — coincide con el integrando original."},
    {"pregunta": "Calcula ∫10(2x+3)⁴ dx usando sustitución u=2x+3.", "opciones": ["(2x+3)⁵ + C", "5(2x+3)⁵ + C", "10(2x+3)⁵ + C", "(2x+3)⁴ + C"], "respuesta": "(2x+3)⁵ + C", "explicacion": "a(n+1)=2·5=10, y el integrando ya trae ese coeficiente (10), así que en la respuesta queda 10/10=1: (2x+3)⁵ + C."}
  ]}',
  9, true),

-- ---------- Módulo 5 — Series: geométricas, convergencia y suma infinita ----------
('calculia-pro-series-geometricas', 'Curso Pro: Series — geométricas, convergencia y suma infinita',
  'Cuándo una serie geométrica converge, cómo calcular su suma infinita, y la diferencia con una serie p.',
  'calculia',
  '{"pasos": [
    "Una serie geométrica tiene la forma a + ar + ar² + ar³ + ... — cada término se multiplica por la misma razón r para llegar al siguiente. Converge (tiene una suma finita) si y solo si |r| < 1.",
    "Fórmula de la suma infinita (solo válida si |r|<1): S = a/(1-r), donde a es el primer término.",
    "Ejemplo resuelto: calcula la suma de la serie geométrica con primer término a=4 y razón r=1/2. Primero se confirma que converge: |1/2|<1, sí converge. Luego: S = 4/(1-1/2) = 4/(1/2) = 8.",
    "Si |r| ≥ 1 la serie geométrica DIVERGE (no tiene suma finita) — no tiene sentido aplicar la fórmula a/(1-r) en ese caso, daría un número sin significado real.",
    "Una serie p, ∑1/nᵖ, es un tipo distinto de serie (no geométrica) — converge si y solo si p>1. No confundir el criterio: para geométricas es |r|<1, para series p es p>1.",
    "Ejemplo de clasificación: la serie p con p=3 (∑1/n³) converge porque 3>1. La serie geométrica con r=2 diverge porque |2|≥1 (cada término es más grande que el anterior, nunca se estabiliza)."
  ],
  "quiz": [
    {"pregunta": "Calcula la suma de la serie geométrica infinita con primer término a=6 y razón r=1/3.", "opciones": ["9", "18", "6", "2"], "respuesta": "9", "explicacion": "S = a/(1-r) = 6/(1-1/3) = 6/(2/3) = 6·3/2 = 9. Primero se confirma que |1/3|<1, así que converge."},
    {"pregunta": "¿La serie geométrica con razón r = 3/2 converge o diverge?", "opciones": ["Diverge", "Converge", "Converge solo si a>0", "No se puede saber sin el primer término"], "respuesta": "Diverge", "explicacion": "|3/2| = 1.5, que es mayor o igual a 1 — la condición de convergencia |r|<1 no se cumple, así que diverge."},
    {"pregunta": "¿Para qué valores de p converge la serie p, ∑1/nᵖ?", "opciones": ["p > 1", "p < 1", "Cualquier p", "p = 1"], "respuesta": "p > 1", "explicacion": "El criterio de convergencia de una serie p es p>1 — un criterio totalmente distinto al de la razón |r|<1 de las series geométricas, no hay que mezclarlos."}
  ]}',
  10, true),

-- ---------- Módulo 6 — Multivariable: derivadas parciales ----------
('calculia-pro-multivariable-parciales', 'Curso Pro: Multivariable — derivadas parciales desde cero',
  'Cómo derivar una función de dos variables tratando la otra como si fuera una constante, con ejemplo resuelto completo.',
  'calculia',
  '{"pasos": [
    "Una derivada parcial mide cómo cambia f(x,y) cuando UNA sola variable se mueve y la otra se mantiene fija. Se escribe ∂f/∂x (respecto de x) o ∂f/∂y (respecto de y).",
    "La técnica es exactamente la regla de la potencia de siempre — el único cambio de hábito es tratar la otra letra como si fuera un número fijo (un coeficiente constante), nunca derivarla ni hacerla desaparecer.",
    "Ejemplo resuelto: calcula ∂f/∂x para f(x,y) = 3x²y³. Tratando y³ como constante: es como derivar 3(y³)·x² respecto de x → 3(y³)·2·x = 6xy³. Entonces ∂f/∂x = 6xy³.",
    "Ahora ∂f/∂y de la MISMA función f(x,y) = 3x²y³: tratando x² como constante, derivás 3(x²)·y³ respecto de y → 3(x²)·3·y² = 9x²y². Entonces ∂f/∂y = 9x²y².",
    "Verificación de que no te comiste la otra variable: en ∂f/∂x, la potencia de y (y³) debe quedar EXACTAMENTE igual que en la función original — si desapareció, es el error más común de esta técnica.",
    "Truco rápido: tapá con un dedo la letra que no te pidieron, derivá lo que queda visible como si fuera una función de una sola variable, después destapá y multiplicá."
  ],
  "quiz": [
    {"pregunta": "Para f(x,y) = 5x³y², calcula ∂f/∂x.", "opciones": ["15x²y²", "5x²y²", "15x³y", "10x³y"], "respuesta": "15x²y²", "explicacion": "Tratando y² como constante: 5·3=15, el exponente de x baja de 3 a 2, y la potencia de y (y²) queda igual: 15x²y²."},
    {"pregunta": "Para la misma f(x,y) = 5x³y², calcula ∂f/∂y.", "opciones": ["10x³y", "5x³y", "15x²y²", "10x²y"], "respuesta": "10x³y", "explicacion": "Tratando x³ como constante: 5·2=10, el exponente de y baja de 2 a 1, y la potencia de x (x³) queda igual: 10x³y."},
    {"pregunta": "Al calcular ∂f/∂x de f(x,y)=x²y⁴, ¿qué error es más común?", "opciones": ["Derivar también la y, en vez de tratarla como constante fija", "Olvidarse del signo negativo", "Multiplicar por y en vez de x", "Usar la regla del producto"], "respuesta": "Derivar también la y, en vez de tratarla como constante fija", "explicacion": "El error típico es derivar las DOS variables a la vez — cuando piden ∂/∂x, la potencia de y del resultado tiene que quedar IGUAL que en el original, sin tocarla."}
  ]}',
  11, true),

-- ---------- Módulo 7 — EDOs separables de primer orden ----------
('calculia-pro-edos-separables', 'Curso Pro: EDOs separables — separar variables e integrar',
  'Cómo resolver una ecuación diferencial separable paso a paso, desde separar las variables hasta despejar y.',
  'calculia',
  '{"pasos": [
    "Una EDO (ecuación diferencial ordinaria) separable es aquella donde dy/dx se puede reescribir como f(x)·g(y) — un factor que solo tiene x, multiplicado por otro que solo tiene y. Si podés hacer eso, siempre se puede resolver por separación de variables.",
    "Paso 1: reordenar para dejar todo lo de y (incluido dy) de un lado, y todo lo de x (incluido dx) del otro: dy/g(y) = f(x) dx.",
    "Paso 2: integrar cada lado por separado, cada uno con su propia constante — las dos constantes se combinan en una sola al final.",
    "Ejemplo resuelto: resuelve dy/dx = 2xy. Separando: dy/y = 2x dx. Integrando ambos lados: ln|y| = x² + C₁ (usando la regla de la potencia de integrales del lado derecho, y ∫dy/y = ln|y| del lado izquierdo).",
    "Paso 3 (despejar y): aplicar exponencial en ambos lados de ln|y| = x² + C₁ da |y| = e^(x²+C₁) = e^(C₁)·e^(x²). Como e^(C₁) es solo otra constante positiva, se renombra como A: y = A·e^(x²).",
    "Verificación: si y = A·eˣ², entonces dy/dx = A·eˣ²·2x = 2x·y (usando que A·eˣ²=y) — coincide exactamente con la ecuación original dy/dx = 2xy, confirma que la solución está bien."
  ],
  "quiz": [
    {"pregunta": "¿Cuál es el primer paso para resolver una EDO separable dy/dx = f(x)·g(y)?", "opciones": ["Separar: dy/g(y) = f(x) dx", "Integrar directamente sin reordenar", "Derivar ambos lados", "Reemplazar y por una constante"], "respuesta": "Separar: dy/g(y) = f(x) dx", "explicacion": "El nombre \"separable\" viene de este paso — hay que dejar toda la y (con dy) de un lado y toda la x (con dx) del otro ANTES de integrar."},
    {"pregunta": "Resuelve la EDO separable dy/dx = 3x²y (deja la respuesta en términos de la constante A).", "opciones": ["y = A·e^x³", "y = A·e^3x²", "y = A·x³", "y = A·e^x²"], "respuesta": "y = A·e^x³", "explicacion": "Separando: dy/y=3x² dx. Integrando: ln|y|=x³+C₁ (la antiderivada de 3x² es x³). Despejando y con exponencial: y=A·e^x³."},
    {"pregunta": "Al despejar y de ln|y| = x² + C₁, ¿qué operación hay que aplicar en ambos lados?", "opciones": ["La función exponencial (elevar e a cada lado)", "El logaritmo otra vez", "Elevar al cuadrado", "Dividir por x²"], "respuesta": "La función exponencial (elevar e a cada lado)", "explicacion": "Exponencial y logaritmo natural son operaciones inversas — aplicar e^(...) a ambos lados de ln|y|=... deshace el logaritmo y despeja y."}
  ]}',
  12, true)

on conflict (slug) do nothing;
