-- ============================================================
-- Prodigia — Proceso 1 (docs/PLAN_REVISION_CONTENIDO.md): Quimia,
-- cuarto mundo. Las 4 técnicas (0056_mundo_quimia.sql) ya eran
-- correctas — se verificó cada dato químico usado contra
-- src/lib/practica/quimia.ts (banco real de elementos/compuestos) y
-- contra nomenclatura química estándar:
--   * Au=Oro (número atómico 79), Fe=Hierro, Cu=Cobre — verificados
--     contra ELEMENTOS_CRUDOS en quimia.ts.
--   * Li, Na, K son los tres metales alcalinos (grupo 1 IUPAC) del
--     ejemplo — verificado contra el campo `grupo` de cada uno en
--     quimia.ts (los tres tienen grupo: 1).
--   * Na (período 3, grupo 1) y Mg (período 3, grupo 2) son vecinos
--     reales en la tabla — verificado contra quimia.ts.
--   * Patrón de nomenclatura "-ico" para oxiácidos (sulfúrico, H2SO4)
--     y "ácido ...hídrico" para hidrácidos (clorhídrico, HCl), y
--     "[segundo elemento] de [primer elemento]" para sales binarias
--     (cloruro DE sodio, NaCl) — nomenclatura química real, además
--     verificada contra COMPUESTOS/COMPUESTOS_NOMENCLATURA en
--     quimia.ts (NaCl = "Cloruro de sodio", HCl no está pero el
--     patrón "ácido clorhídrico" es estándar IUPAC/tradicional).
-- No se encontró ningún error factual en las 4 lecciones — no hizo
-- falta corregir ningún paso, solo agregar el quiz encima (update por
-- slug, nunca se toca 0056).
--
-- Cada pregunta prueba la técnica específica de esa lección, nunca
-- trivia suelta, mismo criterio que los mundos anteriores (0172-0174).
-- Quimia no usa notación LaTeX en estas 4 lecciones (son fórmulas
-- cortas tipo "H2SO4", ya legibles como texto plano), así que no
-- aplica la conversión $...$ acá.
-- ============================================================

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿Cuál es la ventaja principal de agrupar elementos por familia química en vez de memorizarlos sueltos?",
    "opciones": ["Compartir comportamiento significa que aprender uno te da información gratis de los demás", "Todos los elementos de una familia tienen el mismo número atómico", "Las familias químicas cambian según el compuesto", "No hace falta aprender ningún elemento individual"],
    "respuesta": "Compartir comportamiento significa que aprender uno te da información gratis de los demás",
    "explicacion": "Es la idea central: si el sodio es un metal alcalino reactivo, ya sabes algo real de sus vecinos de familia sin memorizarlos aparte."
  },
  {
    "pregunta": "¿Cuáles de estos tres elementos pertenecen a la misma familia química (metales alcalinos), según el ejemplo de la lección?",
    "opciones": ["Litio, sodio y potasio", "Cloro, flúor y bromo", "Helio, neón y argón", "Hierro, cobre y oro"],
    "respuesta": "Litio, sodio y potasio",
    "explicacion": "Li, Na y K son los tres metales alcalinos del ejemplo — mismo grupo 1 de la tabla periódica."
  },
  {
    "pregunta": "Si sabes que el sodio (Na) es un metal alcalino muy reactivo, ¿qué puedes deducir del litio (Li) y el potasio (K) sin memorizarlos aparte?",
    "opciones": ["Que también son metales alcalinos reactivos, por pertenecer a la misma familia", "Que tienen exactamente el mismo número atómico que el sodio", "Que no reaccionan con nada", "Que son gases nobles"],
    "respuesta": "Que también son metales alcalinos reactivos, por pertenecer a la misma familia",
    "explicacion": "Es el mismo ejemplo de la lección: conocer una familia te da el comportamiento de todos sus miembros."
  }
]}'::jsonb
where slug = 'agrupar-por-familia';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Según esta técnica, ¿qué elemento es \"Au\"?",
    "opciones": ["Oro", "Plata", "Aluminio", "Argón"],
    "respuesta": "Oro",
    "explicacion": "Au es oro — piensa en el brillo dorado de una joya, no en la letra sola (la plata es Ag, no Au)."
  },
  {
    "pregunta": "¿Qué imagen cotidiana ayuda a recordar que Fe es hierro, según esta técnica?",
    "opciones": ["El óxido rojizo (herrumbre) de un portón viejo", "El brillo dorado de una joya", "El tono anaranjado de un cable pelado", "El color plateado de una moneda"],
    "respuesta": "El óxido rojizo (herrumbre) de un portón viejo",
    "explicacion": "Es el mismo ejemplo de la lección — la herrumbre es la imagen que conecta Fe con hierro."
  },
  {
    "pregunta": "¿Cuál es el símbolo químico del cobre, según el ejemplo de esta técnica?",
    "opciones": ["Cu", "Co", "C", "Ca"],
    "respuesta": "Cu",
    "explicacion": "Cu es cobre — piensa en el tono anaranjado de un cable eléctrico pelado (Co es cobalto, un elemento distinto)."
  }
]}'::jsonb
where slug = 'asociacion-color-uso';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Según esta técnica, ¿qué dos coordenadas ubican a un elemento en la tabla periódica, igual que en un mapa?",
    "opciones": ["Período (fila) y grupo (columna)", "Número atómico y masa atómica", "Punto de fusión y punto de ebullición", "Color y estado de la materia"],
    "respuesta": "Período (fila) y grupo (columna)",
    "explicacion": "Es la idea central de la técnica: la tabla es un mapa con coordenadas de fila y columna, no una lista para memorizar."
  },
  {
    "pregunta": "Si el sodio (Na) está en el período 3, grupo 1, ¿en qué período está el magnesio (Mg), que está justo al lado?",
    "opciones": ["Período 3", "Período 1", "Período 4", "Período 12"],
    "respuesta": "Período 3",
    "explicacion": "Mg está en el período 3, grupo 2 — al lado de Na en la misma fila, exactamente el mismo ejemplo de la lección."
  },
  {
    "pregunta": "Según esta técnica, ¿qué tienen en común los elementos del mismo grupo (misma columna)?",
    "opciones": ["Se parecen entre sí en su comportamiento químico", "Tienen el mismo número atómico", "Están siempre en el mismo período", "No tienen ninguna relación entre sí"],
    "respuesta": "Se parecen entre sí en su comportamiento químico",
    "explicacion": "Es la pista que da la técnica: la cercanía en columna indica similitud de comportamiento, no hay que memorizar cada casillero suelto."
  }
]}'::jsonb
where slug = 'tabla-como-mapa';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Según esta técnica, ¿cómo suelen terminar los ácidos que contienen oxígeno?",
    "opciones": ["En \"-ico\" (como el ácido sulfúrico, H2SO4)", "En \"-uro\" (como el cloruro de sodio)", "Siempre con la palabra \"óxido\"", "Nunca llevan la palabra \"ácido\""],
    "respuesta": "En \"-ico\" (como el ácido sulfúrico, H2SO4)",
    "explicacion": "Es el mismo ejemplo de la lección — sulfúrico (con oxígeno) termina en \"-ico\"."
  },
  {
    "pregunta": "¿Cómo se nombra un compuesto de dos elementos, según el patrón \"[segundo elemento] de [primer elemento]\"?",
    "opciones": ["Cloruro de sodio (NaCl)", "Sodio de cloruro (ClNa)", "Cloro-sodio (NaCl)", "Sal de mesa (NaCl)"],
    "respuesta": "Cloruro de sodio (NaCl)",
    "explicacion": "Es el mismo ejemplo de la lección: cloruro DE sodio sigue el patrón [segundo elemento] DE [primer elemento]."
  },
  {
    "pregunta": "Un ácido que NO contiene oxígeno, como el HCl, ¿cómo suele nombrarse según esta técnica?",
    "opciones": ["Ácido clorhídrico (terminación \"-hídrico\")", "Ácido clórico (terminación \"-ico\")", "Cloruro de hidrógeno ácido", "Óxido de cloro"],
    "respuesta": "Ácido clorhídrico (terminación \"-hídrico\")",
    "explicacion": "Es el mismo ejemplo de la lección: los ácidos sin oxígeno empiezan con \"ácido ... hídrico\", como el clorhídrico."
  }
]}'::jsonb
where slug = 'patrones-en-formulas';
