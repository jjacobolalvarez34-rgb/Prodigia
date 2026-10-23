# Avance: Modo Zen (estadísticas al final + personalización) — 2026-10-23

## Hecho
- `src/lib/zen/config.ts` (nuevo, compartido web y app): ConfigZen (varios temas, nivelMin–nivelMax que sube parejo, 10/15/20 preguntas, opciones por mundo), `normalizarConfigZen` (tolera lo guardado viejo), `opcionesZen` (Numeria: negativos / factor que falta / números grandes; Geografía: tipo de pregunta; Codia: lenguaje), `rangosAritmetica` (rango de números por nivel), `nivelSugerido`, `problemTypeDeTema`.
- `src/lib/zen/estadisticas.ts` (nuevo): promedio, más rápida/lenta, precisión, primer intento, racha máxima, pistas, `formatearDuracion`.
- `src/lib/zen/preguntas.ts`: `generarZen(slug, config, indice, usados, contexto)`; Numeria por subtema con pasos; `fallaZen` arma el repaso (tus intentos, la correcta, pasos).
- `src/lib/practica/problems.ts`: `rangoOperandos` (solo lectura de las tablas) + test en problems.test.ts.
- Tests: `src/lib/zen/preguntas.test.ts` (verdes).
- Web: `src/components/zen/ZenClient.tsx` reescrito (elegir + final con estadísticas, ritmo y RepasoErrores); `src/app/[locale]/zen/[mundo]/page.tsx` (niveles por tema); `src/components/practica/RepasoErrores.tsx` (prop className); `messages/es.json` y `en.json` (claves nuevas en `Zen`).

- Web verificada: tsc (solo fallan errores ajenos de decimales.test.ts), eslint limpio, vitest verde. Capturas con el banco `zz-galeria/zen.html` + `zen-captura.mjs` (servidor: `npx vite --config zz-galeria/vite.zen.config.mjs --port 3461` desde calibra/). Capturas en el scratchpad del agente (zen-elegir, zen-final, zen-final-repaso, y sus -oscuro).

- App hecha: `mobile/src/lib/zen.ts` (re-exporta la lógica compartida; agrega cargarNivelesZen, leerConfigZen/guardarConfigZen con AsyncStorage `prodigia:zen:<mundo>`) y `mobile/src/app/zen/[mundo].tsx` (misma pantalla de elegir, juego con niveles por pregunta y final con estadísticas, ritmo y RepasoErrores). Verificado: tsc, eslint y `npm run paridad` limpios.

## Estado
TERMINADO. Falta solo el commit (lo hace la sesión principal). No se tocó la base (sin migraciones): `registrar_partida_zen` sigue exigiendo >= 10 respuestas y los largos son 10/15/20.
