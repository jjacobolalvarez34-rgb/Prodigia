-- ============================================================
-- Prodigia — Proceso 1 (docs/PLAN_REVISION_CONTENIDO.md): quiz para las
-- 5 técnicas rápidas GRATUITAS de Calculia (0165_mundo_calculia.sql,
-- requiere_pro=false) — NO son las 7 lecciones del "Curso estructurado
-- (Pro)" de 0170_calculia_curso_pro.sql, que ya tienen su propio quiz.
--
-- Las 5 técnicas son atajos de RECONOCIMIENTO DE PATRÓN (identificar
-- de un vistazo qué regla/tipo aplica), no lecciones completas paso a
-- paso — por eso el quiz de cada una es más corto (2-3 preguntas) y
-- pide clasificar, no resolver un cálculo completo. Cada dato se
-- verificó contra src/lib/practica/calculia.ts (el generador real):
--   - Regla de la potencia / producto / cociente / cadena: coincide
--     con derivadaPotencia/derivadaProducto/derivadaCociente/
--     derivadaCadena.
--   - Tabla de integrales (potencia, 1/x→ln|x|, e^x, seno/coseno con
--     signo solo en el seno): coincide con integralPotencia/
--     integralLn/integralExponencial/integralTrig.
--   - Series geométricas (|r|<1 converge) vs. series p (p>1 converge):
--     coincide con seriesClasificarGeometrica/seriesClasificarP.
--   - EDO separable dy/dx=f(x)g(y): coincide con el enfoque de
--     multivariableEdoSeparable (separar, integrar cada lado,
--     exponenciar para despejar y).
--   - Derivada parcial (tratar la otra variable como constante):
--     coincide con multivariableParcial (mismo distractor real de
--     "derivar las dos variables a la vez").
-- No se encontraron errores en estas 5 técnicas — solo se agrega el
-- quiz (update por slug, nunca se toca 0165).
-- ============================================================

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿Qué regla de derivación corresponde a f(x) = (2x)(3x²)?",
    "opciones": ["Regla del producto", "Regla de la potencia", "Regla del cociente", "Regla de la cadena"],
    "respuesta": "Regla del producto",
    "explicacion": "Son dos expresiones MULTIPLICADAS entre sí — eso siempre pide la regla del producto, nunca multiplicar las derivadas por separado."
  },
  {
    "pregunta": "¿Qué regla corresponde a f(x) = (3x+2)⁴?",
    "opciones": ["Regla de la cadena", "Regla de la potencia sola", "Regla del producto", "Regla del cociente"],
    "respuesta": "Regla de la cadena",
    "explicacion": "Hay algo elevado a una potencia y adentro del paréntesis no es solo x — es una función dentro de otra, la señal clásica de la regla de la cadena."
  },
  {
    "pregunta": "¿Qué regla corresponde a f(x) = 5x⁴?",
    "opciones": ["Regla de la potencia", "Regla del producto", "Regla del cociente", "Regla de la cadena"],
    "respuesta": "Regla de la potencia",
    "explicacion": "Es una sola potencia de x, sin nada multiplicado, dividido, ni un paréntesis con algo distinto de x adentro."
  }
]}'::jsonb
where slug = 'calculia-reconocer-regla-derivacion';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿Cuál es la fórmula de ∫xⁿ dx (con n ≠ -1)?",
    "opciones": ["xⁿ⁺¹/(n+1) + C", "xⁿ⁻¹/(n-1) + C", "n·xⁿ⁻¹ + C", "xⁿ + C"],
    "respuesta": "xⁿ⁺¹/(n+1) + C",
    "explicacion": "Subís el exponente uno (n+1) y dividís por ese exponente NUEVO, nunca por el viejo."
  },
  {
    "pregunta": "¿Por qué ∫(1/x) dx no se resuelve con la regla de la potencia?",
    "opciones": ["Porque sería n=-1, y dividir por (n+1)=0 no tiene sentido", "Porque 1/x no es una potencia de x", "Porque siempre da 0", "Porque hace falta una calculadora"],
    "respuesta": "Porque sería n=-1, y dividir por (n+1)=0 no tiene sentido",
    "explicacion": "Es el único caso especial de la tabla: ∫(1/x) dx = ln|x| + C, distinto de la fórmula general de potencias."
  },
  {
    "pregunta": "¿En cuál de las dos integrales trigonométricas va el signo negativo?",
    "opciones": ["∫sen(x) dx = -cos(x) + C", "∫cos(x) dx = -sen(x) + C", "En ninguna de las dos", "En las dos"],
    "respuesta": "∫sen(x) dx = -cos(x) + C",
    "explicacion": "El signo negativo va SOLO en la integral del seno — ∫cos(x) dx = sen(x) + C nunca lleva signo negativo."
  }
]}'::jsonb
where slug = 'calculia-tabla-integrales-comunes';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Una serie donde cada término se multiplica por la misma razón r para llegar al siguiente (como 3, 6, 12, 24...) es de tipo...",
    "opciones": ["Geométrica", "Serie p", "Ninguna de las dos, hace falta el criterio de la razón siempre", "Aritmética"],
    "respuesta": "Geométrica",
    "explicacion": "Es la \"pinta\" característica de una serie geométrica: razón constante entre términos consecutivos."
  },
  {
    "pregunta": "¿Cuándo converge una serie geométrica de razón r?",
    "opciones": ["Cuando |r| < 1", "Cuando r > 1", "Siempre converge", "Cuando r = 1"],
    "respuesta": "Cuando |r| < 1",
    "explicacion": "Es el criterio de convergencia de una serie geométrica — si |r| ≥ 1, diverge."
  },
  {
    "pregunta": "¿Cuándo converge una serie p, ∑1/nᵖ?",
    "opciones": ["Cuando p > 1", "Cuando p < 1", "Cuando p = 0", "Siempre converge"],
    "respuesta": "Cuando p > 1",
    "explicacion": "Es un criterio totalmente distinto al de las series geométricas (|r|<1) — para series p el criterio es p>1, no hay que mezclarlos."
  }
]}'::jsonb
where slug = 'calculia-identificar-tipo-serie';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿Cuándo una EDO dy/dx es separable?",
    "opciones": ["Cuando se puede reescribir como dy/dx = f(x)·g(y)", "Solo cuando ya tiene y despejada", "Nunca, siempre hace falta un método numérico", "Solo si no tiene ninguna constante"],
    "respuesta": "Cuando se puede reescribir como dy/dx = f(x)·g(y)",
    "explicacion": "Si dy/dx es un producto de \"algo con x\" por \"algo con y\", la ecuación siempre se puede resolver por separación de variables, sin excepción."
  },
  {
    "pregunta": "Al separar variables, ¿qué se hace primero?",
    "opciones": ["Pasar todo lo de y (con dy) a un lado y todo lo de x (con dx) al otro", "Integrar directamente sin reordenar nada", "Derivar ambos lados", "Reemplazar y por una constante"],
    "respuesta": "Pasar todo lo de y (con dy) a un lado y todo lo de x (con dx) al otro",
    "explicacion": "Es el paso 1 de la técnica: dy/g(y) = f(x) dx, antes de poder integrar cada lado por separado."
  },
  {
    "pregunta": "Si al integrar te queda ln|y| = x² + C₁, ¿qué operación despeja y?",
    "opciones": ["Aplicar exponencial en ambos lados", "Aplicar logaritmo otra vez", "Dividir ambos lados por x²", "Restar C₁ de ambos lados y listo"],
    "respuesta": "Aplicar exponencial en ambos lados",
    "explicacion": "e^(ln|y|) = e^(x²+C₁) da |y| = e^(C₁)·e^(x²) — como e^(C₁) es solo otra constante, se renombra como A: y = A·e^(x²)."
  }
]}'::jsonb
where slug = 'calculia-separar-variables-edo';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Al calcular ∂f/∂x de f(x,y) = 3x²y, ¿cómo se trata la y?",
    "opciones": ["Como si fuera una constante (un coeficiente fijo)", "Se deriva igual que x", "Desaparece del resultado", "Se reemplaza por 0"],
    "respuesta": "Como si fuera una constante (un coeficiente fijo)",
    "explicacion": "El único cambio de hábito respecto de derivar de siempre es tratar la otra letra como un número fijo — nunca se deriva ni desaparece."
  },
  {
    "pregunta": "¿Cuál es el error más común al calcular una derivada parcial?",
    "opciones": ["Derivar las dos variables a la vez, en vez de dejar fija la que no se pidió", "Olvidarse del signo", "Usar la regla del producto", "Multiplicar por 2 de más"],
    "respuesta": "Derivar las dos variables a la vez, en vez de dejar fija la que no se pidió",
    "explicacion": "Si te piden ∂/∂x, la potencia de y del resultado tiene que quedar EXACTAMENTE igual que en el original — derivarla también es el error típico."
  },
  {
    "pregunta": "Según el truco de \"tapar con un dedo\", ¿qué significa tapar la letra que no te pidieron?",
    "opciones": ["Derivar lo que queda visible como si fuera una función de una sola variable", "Borrarla del resultado final", "Reemplazarla por 1", "Sumarle 1 al exponente de esa letra"],
    "respuesta": "Derivar lo que queda visible como si fuera una función de una sola variable",
    "explicacion": "Es el atajo mental de la técnica: tapás la letra que no te pidieron, derivás lo visible con la regla de siempre, y después destapás sin haber tocado esa letra."
  }
]}'::jsonb
where slug = 'calculia-derivar-parciales';
