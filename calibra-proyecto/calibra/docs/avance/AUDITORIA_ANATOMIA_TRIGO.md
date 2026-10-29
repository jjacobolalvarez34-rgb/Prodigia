# Auditoría de variedad: Anatomía, Trigonometría y hallazgos medios (2026-10-29)

Plan: docs/AUDITORIA_PREGUNTAS.md §5 (hallazgos 3, 4, 5, 6, 7 y 8).

## Avance

- [x] Anatomía (HECHO, tests verdes): bandas propias 0-4 en los 4 modos (`formatosDe`, `formatosOseo`),
  formatos nuevos en `src/lib/practica/anatomiaFormatosExtra.ts` (forma de hueso, cantidades, hueso por dentro,
  suturas/articulaciones, axial/apendicular, origen-inserción, antagonistas de rodilla/tobillo, sangre, lóbulos,
  nervios espinales) + quiz de Técnicas (N3-6) y de Clases (N7-10). Test: cada respuesta aparece en las lecciones.
  Óseo mín 23 → 94; meseta 100 % → 20-32 %. Causa: — `banda()` va de 0 a 4 pero el generador solo distingue `band >= 3`
  (óseo, muscular, nervioso) y `formatosDe` igual: N7-8 y N9-10 dan exactamente lo mismo (meseta 100 %).
  Óseo N3-6: 9 huesos clicables + costillas = ~25 preguntas (un solo formato).
- [x] Trigonometría (HECHO, 144 tests verdes): razones N1 8 → 47 (3 ternas, ×1 o ×2, ángulo A o B);
  identidades N9-10 27/19 → 72/78 (`sumaConTernas` con dos ternas cualesquiera, dato por seno o coseno, resta
  desde dif 3; `suma-diferencia` sigue activo en N10). Oráculo del test ampliado a A − B.
- [x] Codia sintaxis (HECHO, 83 tests verdes con ejecución real en los 4 lenguajes): 2 acciones nuevas de nivel 1
  (`sumar-imprimir`, `declarar-booleano`) y 2 distractores más en las 3 de nivel 1 (catalogoSintaxis.ts);
  criterios de cobertura en lecciones/cobertura.test.ts.
- [x] Calculia derivadas: N1 24 → 123 (derivada de una suma con constante; oráculo del test evalúa polinomios).
- [x] Historia fechas: N1 29 → 51 (siglo desde el nivel 1 en historiaEscala.ts).
- [x] Geografía mapa: mín 9 → 18 (ventana ensanchada hasta 18 candidatos, peso por cercanía).
- [x] Test de variedad con mínimos: src/lib/practica/variedadAuditoria2.test.ts
- [x] AUDITORIA_PREGUNTAS.md §6
- [x] Verificación: tsc (web y app) sin errores, eslint limpio, vitest 53 archivos / 1087 tests verdes.
