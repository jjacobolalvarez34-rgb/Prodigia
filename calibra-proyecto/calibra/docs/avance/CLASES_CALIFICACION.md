# Clases y técnicas: carga, calificación al momento y transición (2026-10-29)

Estado: terminado, sin commit. Sin migración (no hizo falta 0305).

## Qué tardaba

Web (`/api/aprender/completar`, `/api/enigmia/completar-leccion`), en serie:
getUser, lección, plan (si Pro), progreso previo, upsert del progreso, modificadores,
un upsert POR modificador, verificarLogros y verificarTitulos: ~10-12 idas y vueltas
(~2-3 s con la latencia medida en CARGA_FIN_PARTIDA.md). La pantalla esperaba todo eso
con el botón girando antes de pasar al festejo.

App (`completarLeccion` en mobile/src/lib/aprender.ts): RPC completar_leccion,
getSession, verificarLogros y verificarTitulos completos antes del festejo.

## Qué cambió

Servidor (web):
- Lección, plan y progreso previo se leen juntos (1 ida y vuelta en vez de 3).
- Upsert del progreso y lectura de modificadores juntos; desbloqueos en UNA inserción.
- verificarTitulos va en `after()` (no se ve en el festejo); verificarLogros sigue
  devolviéndose en la respuesta.
- La validación de respuestas no cambió: el servidor sigue exigiendo todas correctas
  (respuestaCorrecta es/en) y el 403 de Pro.

Pantallas (web, 14 clientes: Numeria, 12 mundos y Dinamia/Vitalia):
- `components/aprender/QuizLeccion.tsx`: cada pregunta se califica al tocar una opción
  (bien en verde con tilde, mal en rojo con sacudida; la opción errada queda tachada),
  con la explicación si existe; barra «n de N bien»; el botón dice cuántas faltan y
  solo envía con todas bien. Lógica pura en `lib/aprender/calificarQuiz.ts` (con test),
  compartida con la app. Si el servidor rechaza alguna (contenido desfasado), se reabre.
- `components/aprender/useCompletarLeccion.ts`: el festejo entra al instante y el
  guardado sigue debajo; si falla, «Reintentar» en el mismo festejo; router.refresh()
  al guardar (camino recalculado al volver).
- `components/aprender/CelebracionLeccion.tsx`: sello de «Lección completada» que se
  dibuja (círculo, anillo, tilde), título y acciones en cascada corta; respeta
  reduced-motion; reemplaza el emoji de fiesta. Logros entran con fundido al llegar.
- Mensajes nuevos: bloque `LeccionQuiz` en es/en.

App (mobile):
- `completarLeccion` (lib/aprender.ts) devuelve apenas la RPC completar_leccion
  confirma; logros y títulos se cuentan en paralelo en segundo plano
  (`logrosPendientes`), y la pantalla los muestra con fundido al llegar.
- `ui/aprender/QuizLeccion.tsx`: misma calificación al momento que la web
  (lib/aprender/calificarQuiz.ts compartido), con sonido y vibración por respuesta.
- Pantalla de la lección: festejo inmediato con sello (onda que se abre, medalla y
  tilde con resorte), título y botones en cascada; «Guardando tu avance...» discreto,
  error con «Reintentar»; «Siguiente» espera a que se guarde (si no, la siguiente
  aparecería todavía bloqueada).

## Después (estimado)

Web: el festejo aparece al tocar «Terminar» (0 s de espera); el guardado baja de
~10-12 idas y vueltas a ~5 (getUser, lecturas juntas, progreso+modificadores,
desbloqueos, logros). App: festejo inmediato; guardado = 1 RPC.

## Verificación

calibra: tsc sin errores propios (los únicos son de anatomiaFormatosExtra.ts, trabajo
de la auditoría de generadores), eslint limpio en lo tocado, vitest src/lib +
src/components: 3105 pasan; fallan 12 de variedad de generadores y cobertura de Codia,
ajenos a este cambio. mobile: tsc sin errores, eslint limpio en lo tocado.
Mensajes: bloque `LeccionQuiz` con las mismas claves en es y en.
Las claves viejas del quiz por mundo (respuestaIncorrecta, enviarRespuestas, enviando,
reintentaCuandoQuieras) quedan sin uso; no se borraron para no tocar los bloques de
cada mundo.
