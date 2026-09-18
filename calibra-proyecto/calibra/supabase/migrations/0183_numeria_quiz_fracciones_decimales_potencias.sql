-- ============================================================
-- Prodigia — Proceso 1 (docs/PLAN_REVISION_CONTENIDO.md): Numeria,
-- segunda tanda de quiz — las 10 técnicas de Fracciones (0019),
-- Decimales (0026) y Potencias (0026). Mismos criterios que 0182:
-- cada técnica se verificó contra src/lib/practica/fracciones.ts,
-- decimales.ts y potencias.ts (los generadores reales de /practica) y
-- contra el ejemplo numérico que ya trae cada lección — no se
-- encontró ningún error factual.
--
-- Este es el primer grupo de Numeria con matemática real (fracciones,
-- exponentes, raíces), así que el contenido NUEVO de estas preguntas
-- (no una conversión de contenido viejo) ya usa la convención $...$ de
-- MathText desde el principio — la conversión de los `pasos` viejos
-- (contenido existente) queda en la migración separada 0185, para no
-- mezclar una migración de notación pura con contenido nuevo.
-- ============================================================

-- ---------- FRACCIONES ----------

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para sumar $\\dfrac{1}{5} + \\dfrac{2}{5}$ con esta técnica, ¿qué se suma?",
    "opciones": ["Los numeradores: 1+2", "Los denominadores: 5+5", "Numeradores y denominadores por igual", "Nada, hay que buscar denominador común primero"],
    "respuesta": "Los numeradores: 1+2",
    "explicacion": "Cuando el denominador ya es igual, solo se suman los numeradores."
  },
  {
    "pregunta": "¿Qué pasa con el denominador al sumar fracciones con igual denominador?",
    "opciones": ["Se deja igual", "Se suma también", "Se multiplica por 2", "Se resta"],
    "respuesta": "Se deja igual",
    "explicacion": "El denominador queda igual — solo cambia el numerador, que es la suma de los originales."
  },
  {
    "pregunta": "Con esta técnica, ¿cuánto es $\\dfrac{1}{5} + \\dfrac{2}{5}$?",
    "opciones": ["$\\dfrac{3}{5}$", "$\\dfrac{3}{10}$", "$\\dfrac{2}{5}$", "$\\dfrac{1}{5}$"],
    "respuesta": "$\\dfrac{3}{5}$",
    "explicacion": "1+2=3 en el numerador, denominador igual: $\\dfrac{3}{5}$."
  }
]}'::jsonb
where slug = 'sumar-fracciones-igual-denominador';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para simplificar $\\dfrac{8}{12}$, ¿qué se busca primero?",
    "opciones": ["El máximo común divisor (MCD) entre 8 y 12", "El mínimo común múltiplo entre 8 y 12", "La suma de 8 y 12", "El doble de 8 y 12"],
    "respuesta": "El máximo común divisor (MCD) entre 8 y 12",
    "explicacion": "La técnica busca el MCD para dividir numerador y denominador por el mismo número."
  },
  {
    "pregunta": "¿Cuál es el MCD entre 8 y 12?",
    "opciones": ["4", "2", "3", "6"],
    "respuesta": "4",
    "explicacion": "4 es el número más grande que divide exacto tanto a 8 como a 12."
  },
  {
    "pregunta": "¿Cuál es $\\dfrac{8}{12}$ ya simplificada?",
    "opciones": ["$\\dfrac{2}{3}$", "$\\dfrac{4}{6}$", "$\\dfrac{1}{2}$", "$\\dfrac{2}{4}$"],
    "respuesta": "$\\dfrac{2}{3}$",
    "explicacion": "8÷4=2 y 12÷4=3, así que $\\dfrac{8}{12}=\\dfrac{2}{3}$."
  }
]}'::jsonb
where slug = 'simplificar-con-mcd';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para sumar $\\dfrac{1}{4} + \\dfrac{1}{6}$, ¿qué hay que buscar primero?",
    "opciones": ["El mínimo común múltiplo de los denominadores (4 y 6)", "El máximo común divisor de los denominadores", "La suma de los denominadores", "Cuál fracción es más grande"],
    "respuesta": "El mínimo común múltiplo de los denominadores (4 y 6)",
    "explicacion": "Con denominadores distintos, primero hay que convertirlos a un denominador común: el mcm."
  },
  {
    "pregunta": "¿Cuál es el mínimo común múltiplo de 4 y 6?",
    "opciones": ["12", "24", "10", "6"],
    "respuesta": "12",
    "explicacion": "12 es el número más chico que es múltiplo tanto de 4 como de 6."
  },
  {
    "pregunta": "Con esta técnica, ¿cuánto es $\\dfrac{1}{4} + \\dfrac{1}{6}$?",
    "opciones": ["$\\dfrac{5}{12}$", "$\\dfrac{2}{10}$", "$\\dfrac{1}{12}$", "$\\dfrac{6}{12}$"],
    "respuesta": "$\\dfrac{5}{12}$",
    "explicacion": "$\\dfrac{1}{4}=\\dfrac{3}{12}$ y $\\dfrac{1}{6}=\\dfrac{2}{12}$; sumadas: $\\dfrac{3}{12}+\\dfrac{2}{12}=\\dfrac{5}{12}$."
  }
]}'::jsonb
where slug = 'minimo-comun-denominador';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para comparar $\\dfrac{3}{4}$ y $\\dfrac{4}{5}$ con producto cruzado, ¿qué multiplicás primero?",
    "opciones": ["El numerador de la primera por el denominador de la segunda: 3×5", "Los dos numeradores entre sí", "Los dos denominadores entre sí", "El numerador de la segunda por el numerador de la primera"],
    "respuesta": "El numerador de la primera por el denominador de la segunda: 3×5",
    "explicacion": "Ese es el primer producto cruzado: 3×5=15."
  },
  {
    "pregunta": "¿Qué se multiplica en el segundo producto cruzado?",
    "opciones": ["El numerador de la segunda por el denominador de la primera: 4×4", "El denominador de la segunda por el denominador de la primera", "El numerador de la primera por el numerador de la segunda", "4×5"],
    "respuesta": "El numerador de la segunda por el denominador de la primera: 4×4",
    "explicacion": "El segundo producto cruzado es 4×4=16."
  },
  {
    "pregunta": "Comparando 15 y 16, ¿qué fracción es más grande, $\\dfrac{3}{4}$ o $\\dfrac{4}{5}$?",
    "opciones": ["$\\dfrac{4}{5}$, porque 15<16", "$\\dfrac{3}{4}$, porque 15<16", "Son iguales", "No se puede saber sin denominador común"],
    "respuesta": "$\\dfrac{4}{5}$, porque 15<16",
    "explicacion": "Como el primer producto (15) es menor que el segundo (16), la primera fracción es menor: $\\dfrac{3}{4}<\\dfrac{4}{5}$."
  }
]}'::jsonb
where slug = 'comparar-con-producto-cruzado';

-- ---------- DECIMALES ----------

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para convertir $\\dfrac{3}{4}$ a decimal, ¿qué operación se hace?",
    "opciones": ["Dividir el numerador por el denominador: 3÷4", "Multiplicar numerador por denominador", "Sumar numerador y denominador", "Restar el denominador al numerador"],
    "respuesta": "Dividir el numerador por el denominador: 3÷4",
    "explicacion": "Un decimal es, ni más ni menos, el resultado de esa división."
  },
  {
    "pregunta": "¿Cuál es el decimal equivalente a $\\dfrac{3}{4}$?",
    "opciones": ["0.75", "0.34", "0.43", "1.33"],
    "respuesta": "0.75",
    "explicacion": "3÷4=0.75."
  }
]}'::jsonb
where slug = 'convertir-fraccion-decimal';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para calcular 15% de 200, ¿a qué decimal se convierte primero el 15%?",
    "opciones": ["0.15", "1.5", "15", "0.015"],
    "respuesta": "0.15",
    "explicacion": "Un porcentaje se convierte a decimal dividiéndolo por 100: 15÷100=0.15."
  },
  {
    "pregunta": "Después de convertir el porcentaje a decimal, ¿qué se hace?",
    "opciones": ["Multiplicarlo por el número (200)", "Sumarlo al número", "Dividir el número por el decimal", "Restarle el decimal al número"],
    "respuesta": "Multiplicarlo por el número (200)",
    "explicacion": "0.15 × 200 = 30 es el resultado final: el 15% de 200."
  },
  {
    "pregunta": "¿Cuánto es 15% de 200 con esta técnica?",
    "opciones": ["30", "15", "20", "150"],
    "respuesta": "30",
    "explicacion": "0.15×200=30."
  }
]}'::jsonb
where slug = 'porcentaje-como-decimal';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para redondear 3.14159 a 2 decimales, ¿qué dígito hay que mirar?",
    "opciones": ["El tercer decimal (1)", "El primer decimal (1)", "El último decimal (9)", "La parte entera (3)"],
    "respuesta": "El tercer decimal (1)",
    "explicacion": "Para redondear a N lugares, se mira el dígito que sigue — en este caso, el tercer decimal."
  },
  {
    "pregunta": "Como ese dígito es menor a 5, ¿qué pasa con el segundo decimal?",
    "opciones": ["Se queda igual", "Sube en 1", "Se convierte en 0", "Se elimina junto con el tercero"],
    "respuesta": "Se queda igual",
    "explicacion": "La regla es: 5 o más, sube; menos de 5, se queda igual — y 1 < 5."
  },
  {
    "pregunta": "¿Cuánto es 3.14159 redondeado a 2 decimales?",
    "opciones": ["3.14", "3.15", "3.1", "3.142"],
    "respuesta": "3.14",
    "explicacion": "El tercer decimal (1) es menor a 5, así que el resultado es 3.14."
  }
]}'::jsonb
where slug = 'redondear-decimales';

-- ---------- POTENCIAS ----------

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿Qué significa $2^4$?",
    "opciones": ["2 multiplicado por sí mismo 4 veces", "2 sumado 4 veces", "2 multiplicado por 4", "4 multiplicado por sí mismo 2 veces"],
    "respuesta": "2 multiplicado por sí mismo 4 veces",
    "explicacion": "El exponente indica cuántas veces se multiplica la base por sí misma."
  },
  {
    "pregunta": "¿Cuánto es $2^4$?",
    "opciones": ["16", "8", "32", "6"],
    "respuesta": "16",
    "explicacion": "2×2=4, 4×2=8, 8×2=16."
  }
]}'::jsonb
where slug = 'potencia-como-multiplicacion-repetida';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para estimar $\\sqrt{49}$ por tanteo, ¿qué se busca?",
    "opciones": ["Qué número al cuadrado da 49", "La mitad de 49", "El doble de 49", "Un número que sumado a sí mismo dé 49"],
    "respuesta": "Qué número al cuadrado da 49",
    "explicacion": "La raíz cuadrada de 49 es el número que, elevado al cuadrado, da 49."
  },
  {
    "pregunta": "¿Cuánto es $\\sqrt{49}$?",
    "opciones": ["7", "24.5", "14", "49"],
    "respuesta": "7",
    "explicacion": "7×7=49, así que $\\sqrt{49}=7$."
  }
]}'::jsonb
where slug = 'raiz-cuadrada-por-tanteo';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para escribir 3.000 en notación científica, ¿qué se cuenta?",
    "opciones": ["Cuántos lugares se corrió la coma", "Cuántos dígitos tiene el número", "El primer dígito del número", "La mitad del número"],
    "respuesta": "Cuántos lugares se corrió la coma",
    "explicacion": "El exponente de 10 es la cantidad de lugares que se corrió la coma decimal."
  },
  {
    "pregunta": "¿Cómo se escribe 3.000 en notación científica?",
    "opciones": ["$3 \\times 10^3$", "$3 \\times 10^4$", "$30 \\times 10^2$", "$3 \\times 10^2$"],
    "respuesta": "$3 \\times 10^3$",
    "explicacion": "La coma se corrió 3 lugares, así que el exponente es 3: $3 \\times 10^3$."
  },
  {
    "pregunta": "¿Cómo se escribe 45.000 en notación científica?",
    "opciones": ["$4.5 \\times 10^4$", "$45 \\times 10^3$", "$4.5 \\times 10^3$", "$45 \\times 10^4$"],
    "respuesta": "$4.5 \\times 10^4$",
    "explicacion": "45.000 = 4.5 × 10.000, y $10.000=10^4$."
  }
]}'::jsonb
where slug = 'notacion-cientifica-basica';
