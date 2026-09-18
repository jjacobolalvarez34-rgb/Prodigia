-- ============================================================
-- Prodigia — Proceso 1, notación (docs/PLAN_REVISION_CONTENIDO.md):
-- primera conversión real de contenido a la convención $...$/KaTeX
-- (MathText.tsx ya estaba construido y probado, pero recién ahora se
-- usa en contenido real — antes no había NINGÚN texto con $...$, así
-- que no se veía ningún cambio visual todavía).
--
-- Se reescriben los `pasos` de las 5 técnicas rápidas de Calculia
-- (0165) envolviendo cada fragmento matemático en $...$ y pasando los
-- superíndices unicode sueltos (x⁴, xⁿ⁺¹) a LaTeX real (x^4, x^{n+1}).
-- El CONTENIDO matemático no cambia en absoluto, solo cómo se escribe
-- — mismo criterio que el resto del Proceso 1: nunca tocar lógica ni
-- significado en el mismo paso que se toca notación.
--
-- jsonb_set solo reemplaza la clave "pasos" — "quiz" (agregado en
-- 0178) queda intacto. Nunca se edita 0165 ni 0178, esta es una
-- migración nueva sobre las filas existentes.
-- ============================================================

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "¿Es una sola potencia de x (como $5x^4$)? Es la regla de la potencia: bajá el exponente como factor y restale 1 al exponente.",
  "¿Son dos expresiones MULTIPLICADAS entre sí (como $(2x)(3x^2)$)? Es la regla del producto — nunca multipliques las derivadas por separado.",
  "¿Es una división de dos expresiones? Es la regla del cociente — el orden de la resta en el numerador importa (alto por bajo, menos bajo por alto).",
  "¿Hay algo elevado a una potencia, y adentro del paréntesis no es solo x (como $(3x+2)^4$)? Es la regla de la cadena — nunca te olvides de multiplicar por la derivada de adentro."
]'::jsonb)
where slug = 'calculia-reconocer-regla-derivacion';

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "$\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1} + C$ — subí el exponente uno y dividí por el exponente nuevo (nunca el viejo).",
  "$\\int \\dfrac{1}{x}\\,dx = \\ln|x| + C$ — el único caso donde la potencia no funciona (n=-1 haría dividir por cero).",
  "$\\int e^x\\,dx = e^x + C$ — la única función que es su propia integral; con $e^{kx}$ se agrega un factor $1/k$ adelante.",
  "$\\int \\cos(x)\\,dx = \\sin(x) + C$ y $\\int \\sin(x)\\,dx = -\\cos(x) + C$ — el signo negativo va SOLO en la integral del seno, nunca en la del coseno.",
  "Si dudás el signo de una trigonométrica, derivá la respuesta mentalmente y fijate si te devuelve el integrando original."
]'::jsonb)
where slug = 'calculia-tabla-integrales-comunes';

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "¿Cada término se multiplica por la misma razón $r$ para llegar al siguiente (como 3, 6, 12, 24...)? Es geométrica — converge si y solo si $|r|<1$.",
  "¿Es 1 sobre n elevado a una potencia p (como $\\sum 1/n^2$)? Es una serie p — converge si y solo si $p>1$.",
  "¿La razón entre un término y el anterior tiende a un número fijo cuando n crece? Ahí aplica el criterio de la razón — el límite de ese cociente decide.",
  "Para una serie geométrica, la suma infinita es siempre $S=\\dfrac{a}{1-r}$ — solo tiene sentido si ya sabés que converge."
]'::jsonb)
where slug = 'calculia-identificar-tipo-serie';

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "Mirá si podés reescribir $\\dfrac{dy}{dx}=f(x)\\cdot g(y)$ — si es así, la ecuación es separable, sin excepción.",
  "Pasá todo lo de y (incluido dy) a un lado, y todo lo de x (incluido dx) al otro: $\\dfrac{dy}{g(y)}=f(x)\\,dx$.",
  "Integrá cada lado por separado, con su propia constante — las dos constantes se juntan en una sola al final.",
  "Si aparece $\\ln|y|$ de un lado, despejar y significa aplicar exponencial en ambos lados — ahí es donde nace el factor $e^C$ que se vuelve la constante A."
]'::jsonb)
where slug = 'calculia-separar-variables-edo';

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "Si te piden $\\partial f/\\partial x$, todo lo que sea potencia de y (incluida y sola) se comporta como si fuera un coeficiente constante — no se deriva ni desaparece.",
  "Un término como $3x^2y$ se deriva respecto de x igual que $3y\\cdot x^2$: queda $6xy$.",
  "El error más común es derivar las DOS variables a la vez — si te piden $\\partial/\\partial x$, la potencia de y del resultado tiene que quedar IGUAL que en el original.",
  "Truco rápido: tapá con un dedo la letra que no te pidieron, derivá lo que queda visible como si fuera una sola variable, después destapá."
]'::jsonb)
where slug = 'calculia-derivar-parciales';
