-- ============================================================
-- Prodigia — Proceso 1, notación (docs/PLAN_REVISION_CONTENIDO.md):
-- conversión de los `pasos` VIEJOS de Numeria a la convención $...$ de
-- MathText, mismo patrón que 0181 (Calculia) — jsonb_set reemplaza
-- SOLO la clave "pasos", dejando "quiz" (agregado en 0182/0183/0184)
-- intacto. El CONTENIDO no cambia en absoluto, solo cómo se escribe:
-- unicode suelto (x⁴, √49, 22/7) pasa a LaTeX real (x^4, \sqrt{49},
-- \dfrac{22}{7}) para que se renderice con KaTeX en vez de quedar
-- como texto plano con superíndices unicode.
--
-- Se convierten las 13 técnicas de Numeria que de verdad tienen
-- notación matemática (exponentes, raíces o fracciones) en sus
-- `pasos`: 'cuadrado-terminado-en-5' (multiplicación), las 4 de
-- Fracciones, 'convertir-fraccion-decimal' (Decimales), las 3 de
-- Potencias, las 3 de Álgebra, y 'geometria-pi-fraccion' (Geometría).
--
-- 'porcentaje-como-decimal' (Decimales) queda afuera a propósito: solo
-- tiene el símbolo "%", que dentro de $...$ es el carácter de
-- comentario de LaTeX y necesitaría escaparse (\%) sin ganar legibilidad
-- real — se deja como texto plano, igual que el resto de las técnicas
-- de aritmética básica (suma/resta/multiplicación/división) y las
-- técnicas "avanzadas" de números grandes, que son puramente
-- aritméticas (sin exponentes, raíces ni fracciones) y no necesitan
-- ninguna conversión.
-- ============================================================

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "$35^2$: el dígito de las decenas es 3",
  "Multiplicalo por sí mismo más uno: $3 \\times 4 = 12$",
  "Pegale \"25\" al final",
  "$35^2 = 1225$"
]'::jsonb)
where slug = 'cuadrado-terminado-en-5';

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "Fijate que las dos fracciones tengan el mismo denominador",
  "Sumá los numeradores: $\\dfrac{1}{5} + \\dfrac{2}{5}$ → 1+2=3",
  "Dejá el denominador igual: $\\dfrac{3}{5}$"
]'::jsonb)
where slug = 'sumar-fracciones-igual-denominador';

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "Buscá el máximo común divisor (MCD) entre numerador y denominador: MCD(8,12)=4",
  "Dividí el numerador por el MCD: 8÷4=2",
  "Dividí el denominador por el MCD: 12÷4=3 → $\\dfrac{8}{12}$ simplificada es $\\dfrac{2}{3}$"
]'::jsonb)
where slug = 'simplificar-con-mcd';

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "Buscá el mínimo común múltiplo de los denominadores: mcm(4,6)=12",
  "Convertí cada fracción a ese denominador: $\\dfrac{1}{4}=\\dfrac{3}{12}$, $\\dfrac{1}{6}=\\dfrac{2}{12}$",
  "Ahora sumalas normal: $\\dfrac{3}{12}+\\dfrac{2}{12}=\\dfrac{5}{12}$"
]'::jsonb)
where slug = 'minimo-comun-denominador';

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "Multiplicá el numerador de la primera por el denominador de la segunda: 3×5=15",
  "Multiplicá el numerador de la segunda por el denominador de la primera: 4×4=16",
  "Comparás esos resultados: como 15<16, entonces $\\dfrac{3}{4} < \\dfrac{4}{5}$"
]'::jsonb)
where slug = 'comparar-con-producto-cruzado';

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "Tomá la fracción $\\dfrac{3}{4}$: dividí el numerador por el denominador",
  "3 ÷ 4 = 0.75",
  "Ese es el decimal equivalente: $\\dfrac{3}{4} = 0.75$"
]'::jsonb)
where slug = 'convertir-fraccion-decimal';

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "$2^4$ significa 2 multiplicado por sí mismo 4 veces",
  "2×2=4, 4×2=8, 8×2=16",
  "$2^4 = 16$"
]'::jsonb)
where slug = 'potencia-como-multiplicacion-repetida';

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "Para $\\sqrt{49}$: pensá qué número al cuadrado da 49",
  "7×7=49",
  "$\\sqrt{49} = 7$"
]'::jsonb)
where slug = 'raiz-cuadrada-por-tanteo';

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "3.000 se escribe como $3 \\times 10^3$ (corriste la coma 3 lugares)",
  "45.000 se escribe como $4.5 \\times 10^4$",
  "Contás los ceros (o lugares) para saber el exponente"
]'::jsonb)
where slug = 'notacion-cientifica-basica';

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "Una variable (casi siempre la letra x) representa un número desconocido, pero que tiene un valor fijo y único.",
  "En $x + 5 = 12$, x no puede ser cualquier cosa: solo hay un número que hace que la cuenta cierre.",
  "Resolver la ecuación es, ni más ni menos, encontrar ese número."
]'::jsonb)
where slug = 'que-es-una-variable';

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "Tomá $2x + 3 = 11$. A x primero se la multiplicó por 2, después se le sumó 3.",
  "Deshacé en orden inverso: primero restá 3 en los dos lados → $2x = 8$.",
  "Después dividí los dos lados por 2 → $x = 4$."
]'::jsonb)
where slug = 'despejar-paso-a-paso';

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "Si despejaste $x = 4$ en $2x + 3 = 11$, reemplazá x por 4 en la ecuación original: $2(4) + 3$.",
  "Resolvé: 2×4 = 8, 8 + 3 = 11.",
  "Como da 11 (el mismo número del otro lado), $x = 4$ es correcto — si no coincide, hay que revisar el despeje."
]'::jsonb)
where slug = 'verificar-sustituyendo';

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "Círculo de radio 7: área = $\\pi \\times 7^2$",
  "Con $\\dfrac{22}{7}$: $\\dfrac{22}{7} \\times 49 = 22 \\times 7 = 154$ (exacto, sin decimales)",
  "Círculo de radio 5: 5 no es múltiplo de 7",
  "Usá 3.14 × 25 = 78.5"
]'::jsonb)
where slug = 'geometria-pi-fraccion';
