# Auditoría de variedad: Vitalia y Melodía (2026-10-29)

Plan y método: `docs/AUDITORIA_PREGUNTAS.md`. Test nuevo: `src/lib/practica/variedadVitaliaMelodia.test.ts`.

## Medición con clave estricta (sin opciones)

La clave de `variedadMundos.test.ts` incluye las opciones; barajar distractores distintos sobre la misma
pregunta inflaba la cuenta (Alteraciones «153» en nivel 1 eran 28 preguntas reales). El test nuevo cuenta
enunciado + respuesta + lo dibujado/sonado.

Antes (HEAD), sin opciones:

| Modo | N1 | N2 | N3 | N4 | N5 | N6 | N7 | N8 | N9 | N10 | Mín | Solap. | Meseta |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| vitalia · celula | 7 | 7 | 27 | 27 | 49 | 46 | 51 | 54 | 59 | 55 | 7 | 13 % | 5 % |
| vitalia · procesos | 6 | 6 | 14 | 14 | 22 | 23 | 42 | 48 | 55 | 58 | 6 | 9 % | 7 % |
| vitalia · genetica | 6 | 6 | 135 | 175 | 170 | 155 | 112 | 102 | 116 | 121 | 6 | 5 % | 8 % |
| vitalia · sistemas | 7 | 7 | 15 | 15 | 23 | 23 | 33 | 34 | 42 | 40 | 7 | 13 % | 5 % |
| vitalia · reinos | 16 | 16 | 21 | 21 | 32 | 38 | 46 | 47 | 59 | 54 | 16 | 26 % | 2 % |
| vitalia · ecologia | 16 | 16 | 16 | 16 | 29 | 34 | 35 | 41 | 39 | 36 | 16 | 36 % | 3 % |
| melodia · fundamentos | 5 | 5 | 8 | 8 | 22 | 22 | 42 | 40 | 49 | 49 | 5 | 10 % | 9 % |
| melodia · lectura | 6 | 6 | 8 | 8 | 10 | 10 | 12 | 12 | 14 | 14 | 6 | 43 % | 11 % |
| melodia · alteraciones | 28 | 28 | 28 | 28 | 28 | 28 | 28 | 28 | 28 | 28 | 28 | 100 % | 4 % |
| melodia · escalas | 44 | 42 | 43 | 44 | 82 | 81 | 84 | 82 | 81 | 84 | 42 | 44 % | 4 % |
| melodia · acordes | 44 | 43 | 43 | 44 | 44 | 83 | 78 | 86 | 54 | 73 | 43 | 0 % | 4 % |
| melodia · oido_absoluto | 4 | 4 | 5 | 5 | 7 | 7 | 34 | 33 | 26 | 26 | 4 | 12 % | 18 % |
| melodia · tempo | 17 | 18 | 22 | 23 | 43 | 40 | 41 | 42 | 40 | 41 | 17 | 32 % | 4 % |

## Causas

- Vitalia: `elegirPonderado` solo habilita los tipos con nivel mínimo ≤ nivel; en nivel 1-2 hay UN solo
  tipo (teoría 7, foto/resp 6, vocabulario 6). Además todo tipo sigue disponible hasta el nivel 10.
- Melodía alteraciones: 7 letras × 2 octavas × 2 alteraciones = 28 en todos los niveles; el nivel solo
  cambiaba un distractor.
- Melodía fundamentos: banda 0 = 2 figuras + 3 notas de cifrado (5 preguntas).
- Melodía oído: banda 0 = 4 notas; banda 1 = 5; banda 2 = 7.

## Avance

- [x] Test de variedad con clave estricta y tabla antes.
- [x] Vitalia, los 6 modos: `elegirTipo` con ventanas [desde, hasta] por tipo; tablas ampliadas; tipos calculados nuevos (microscopio, cubo superficie/volumen, ósmosis con %, difusión, divisiones, ecuación de fotosíntesis, ATP mixto, pulso, gasto cardíaco, densidad, captura-recaptura, 10 % inverso). Tests: `vitalia.test.ts` recalcula las cuentas nuevas desde el enunciado y verifica que los básicos no salen en N10. Mín (sin opciones): célula 53, procesos 35, genética 96, sistemas 49, reinos ≥32, ecología 42; solapamiento 0 %.
- [x] Melodía oído / fundamentos / alteraciones (formas nuevas por banda; ver AUDITORIA_PREGUNTAS.md §7).
- [x] Melodía lectura y tempo (también < 30 con clave estricta) y escalas (solapamiento 44-49 %): arreglados.
- [x] Tabla después en AUDITORIA_PREGUNTAS.md §7; umbrales en variedadVitaliaMelodia.test.ts (40 tests, sin pisos propios).
- [x] Verificado: tsc (calibra y mobile), eslint de lo tocado, vitest src/lib/practica + melodia + vitalia + mundosJugables (744 ok), retoDiario y visuales de Melodía.

Archivos: src/lib/practica/{vitalia,melodia}.ts, {vitalia,melodia}.test.ts, variedadVitaliaMelodia.test.ts (nuevo), src/lib/vitalia/pasos.ts, src/lib/melodia/pasos.ts, docs/AUDITORIA_PREGUNTAS.md.
