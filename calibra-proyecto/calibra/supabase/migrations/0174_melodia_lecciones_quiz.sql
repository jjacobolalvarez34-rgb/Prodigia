-- ============================================================
-- Prodigia — Proceso 1 (docs/PLAN_REVISION_CONTENIDO.md): Melodía,
-- tercer mundo. Las 5 técnicas (0089_mundo_melodia.sql) ya eran
-- correctas — se verificó cada dato de teoría musical usado en el
-- quiz: las 5 líneas de clave de sol son Mi-Sol-Si-Re-Fa y los 4
-- espacios Fa-La-Do-Mi (de abajo hacia arriba); tríada mayor = 3ra a 4
-- semitonos + 5ta a 7; disminuida = 5ta a 6 semitonos; séptima mayor
-- (maj7) = 7ma a 11 semitonos, dominante (7) = a 10; sostenido sube
-- medio tono, bemol baja medio tono, Do♯≡Re♭ es un enarmónico real.
-- No hizo falta corregir ningún paso, solo agregar el quiz (update
-- por slug, nunca se toca 0089).
--
-- Cada pregunta prueba la técnica específica de esa lección. Melodía
-- no usa notación matemática tipo LaTeX, así que no aplica la
-- convención $...$ (los símbolos ♯/♭ ya son unicode nativo).
-- ============================================================

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "En clave de sol, ¿qué nota es la 3ra línea del pentagrama (la del medio), contando desde abajo?",
    "opciones": ["Si", "Sol", "Re", "Fa"],
    "respuesta": "Si",
    "explicacion": "Las 5 líneas de abajo hacia arriba son Mi-Sol-Si-Re-Fa — la del medio es la 3ra: Si."
  },
  {
    "pregunta": "¿Cuál es la nota del espacio más bajo del pentagrama, en clave de sol?",
    "opciones": ["Fa", "Mi", "La", "Do"],
    "respuesta": "Fa",
    "explicacion": "Los 4 espacios de abajo hacia arriba son Fa-La-Do-Mi — el más bajo es Fa."
  },
  {
    "pregunta": "¿Qué son las \"líneas adicionales\" (ledger lines)?",
    "opciones": ["Líneas cortas que extienden el pentagrama para notas más agudas o graves", "Un tipo de alteración musical", "Las líneas que separan los compases", "Líneas que solo existen en clave de fa"],
    "respuesta": "Líneas cortas que extienden el pentagrama para notas más agudas o graves",
    "explicacion": "Siguen la misma lógica de posición que las 9 líneas/espacios de siempre, solo que fuera del pentagrama."
  }
]}'::jsonb
where slug = 'melodia-lineas-y-espacios';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Según esta técnica, ¿qué es lo más importante de la frase mnemotécnica que armes?",
    "opciones": ["El orden de las letras, no la frase exacta", "Que sea una frase oficial de un libro", "Que rime perfectamente", "Que use solo palabras musicales"],
    "respuesta": "El orden de las letras, no la frase exacta",
    "explicacion": "Cualquier frase que te resulte fácil de recordar sirve — lo que importa es el orden de las 9 letras."
  },
  {
    "pregunta": "¿Para qué sirve armar una frase con las 9 letras de líneas y espacios?",
    "opciones": ["Para reconocer la posición de un vistazo, sin contar de a una", "Para memorizar la letra de una canción", "Para afinar un instrumento", "Para escribir partituras más rápido"],
    "respuesta": "Para reconocer la posición de un vistazo, sin contar de a una",
    "explicacion": "Es el objetivo central de la técnica: reconocimiento inmediato, no conteo línea por línea."
  },
  {
    "pregunta": "En el ejemplo \"Mi Sobrina Siempre Repite Frases\", ¿qué representa cada palabra?",
    "opciones": ["Las 5 líneas: Mi-Sol-Si-Re-Fa", "Los 4 espacios: Fa-La-Do-Mi", "Una escala de Do mayor", "Las notas de un acorde"],
    "respuesta": "Las 5 líneas: Mi-Sol-Si-Re-Fa",
    "explicacion": "Es el ejemplo de frase para las líneas que trae la propia lección."
  }
]}'::jsonb
where slug = 'melodia-truco-lineas-espacios';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿Cuántos semitonos hay entre la fundamental y la 3ra de una tríada MAYOR?",
    "opciones": ["4", "3", "7", "6"],
    "respuesta": "4",
    "explicacion": "4 semitonos da 3ra mayor; 3 semitonos daría 3ra menor — esa diferencia decide si la tríada suena mayor o menor."
  },
  {
    "pregunta": "¿Cuántos semitonos hay entre la fundamental y la 5ta de una tríada DISMINUIDA?",
    "opciones": ["6", "7", "8", "4"],
    "respuesta": "6",
    "explicacion": "7 semitonos es la 5ta \"normal\"; 6 es la 5ta disminuida, 8 la aumentada."
  },
  {
    "pregunta": "¿Qué decide si una tríada suena mayor o menor?",
    "opciones": ["La distancia de la 3ra respecto de la fundamental (4 o 3 semitonos)", "La distancia de la 5ta únicamente", "El instrumento con el que se toque", "El volumen con el que se toque"],
    "respuesta": "La distancia de la 3ra respecto de la fundamental (4 o 3 semitonos)",
    "explicacion": "Es el único número que cambia entre la fórmula mayor y la menor."
  }
]}'::jsonb
where slug = 'melodia-triada-fundamental-3-5';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿Cuántos semitonos hay entre la fundamental y la 7ma en un acorde de séptima MAYOR (maj7)?",
    "opciones": ["11", "10", "7", "9"],
    "respuesta": "11",
    "explicacion": "11 semitonos arriba de la fundamental da séptima mayor (maj7)."
  },
  {
    "pregunta": "¿Cuántos semitonos hay entre la fundamental y la 7ma en una séptima dominante (7)?",
    "opciones": ["10", "11", "9", "12"],
    "respuesta": "10",
    "explicacion": "10 semitonos da séptima dominante — la misma distancia que la séptima menor, pero sobre una tríada mayor."
  },
  {
    "pregunta": "Según esta técnica, ¿cómo conviene pensar un acorde de séptima?",
    "opciones": ["Como una tríada de siempre con una nota más arriba", "Como un acorde totalmente nuevo, sin relación con la tríada", "Como dos tríadas superpuestas", "Como una escala completa"],
    "respuesta": "Como una tríada de siempre con una nota más arriba",
    "explicacion": "Es la idea central: \"tríada + una nota\", no una forma nueva que aprender desde cero."
  }
]}'::jsonb
where slug = 'melodia-de-triada-a-septima';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿Qué hace un sostenido (♯) a una nota?",
    "opciones": ["La sube medio tono", "La baja medio tono", "La sube un tono completo", "No cambia nada, es decorativo"],
    "respuesta": "La sube medio tono",
    "explicacion": "♯ sube medio tono; ♭ baja medio tono — son operaciones opuestas de la misma magnitud."
  },
  {
    "pregunta": "Do♯ y Re♭ son...",
    "opciones": ["La misma altura, con dos nombres distintos", "Dos alturas distintas, separadas por un semitono", "Notas que no existen en el mismo instrumento", "Siempre distintas según el instrumento"],
    "respuesta": "La misma altura, con dos nombres distintos",
    "explicacion": "Es un enarmónico: mismo sonido, nombre distinto según de qué nota natural vengas."
  },
  {
    "pregunta": "¿Qué le pasa a la posición de una nota en el pentagrama cuando se le agrega una alteración (♯ o ♭)?",
    "opciones": ["No cambia — sigue en la misma línea o espacio", "Se mueve una línea hacia arriba", "Se mueve un espacio hacia abajo", "Cambia de clave"],
    "respuesta": "No cambia — sigue en la misma línea o espacio",
    "explicacion": "La alteración solo agrega el símbolo al lado — la posición en el pentagrama queda igual."
  }
]}'::jsonb
where slug = 'melodia-sostenidos-bemoles';
