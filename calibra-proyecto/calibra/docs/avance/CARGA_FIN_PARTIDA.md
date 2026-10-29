# Carga al terminar una partida (2026-10-29)

Estado: terminado, sin subir (sin commit). Sin migración nueva (no hizo falta 0305).

## Qué tardaba (medido)

Latencia real a la base desde aquí: una lectura simple 160-500 ms (mediana ~200 ms).
20 consultas en serie: 3,9 s; las mismas 20 en paralelo: 0,67 s.
Hay 66 logros con 54 tipos de criterio distintos: a un jugador nuevo le faltan casi todos.

App, antes (`cerrarPartida`, todo en serie y antes de mostrar el resultado):
- espera fija mínima de 1,1 s del cartel;
- perfil, racha (daily_progress), registrar_xp_diario, consumir_boost, duelo,
  registrar_progreso_mundo, hito del feed: ~7 idas y vueltas;
- verificarLogros: 2 + una consulta POR TIPO pendiente, de a una (hasta ~54) + 2 inserciones;
- verificarTitulos: 1 + ~15 consultas de a una + una RPC por título;
- resolver_apuesta, revisar recompensas (cápsulas y constelaciones), racha otra vez.
Total: unas 70-80 idas y vueltas en serie, unos 10-15 s con buena conexión.

Web (`/api/practica/finish`, `/api/enigmia/finish`): ~15 idas en serie + logros y títulos
de a una, mismo problema (varios segundos).

## Qué cambió

App:
- `cerrarPartida` devuelve en cuanto está lo que se ve primero (Chispas, Exp, meta, nivel
  de cuenta y de mundo, racha): la racha previa y el chequeo del duelo se leen mientras se
  suben los últimos intentos; registrar_xp_diario y registrar_progreso_mundo van juntos;
  la racha de después se calcula sin volver a pedirla (`rachaDeFilas` en resumen.ts).
- Logros, títulos, apuesta, boost, hito del feed, cápsulas y constelaciones se cuentan en
  segundo plano (`contarEnSegundoPlano`); resultado.tsx los escucha con
  `useExtrasPartida(cierreId)` y la tarjeta del logro aparece con fundido (llega casi
  siempre antes de su paso de la cascada, a los 4,5 s).
- El resultado del duelo se registra en paralelo con el cierre.
- Cartel final: mínimo 450 ms (antes 1,1 s), entrada 220 ms.

Web:
- Las dos rutas de cierre: lecturas en paralelo; registro del día (luego boost) en paralelo
  con duelo/nivel de mundo/feed; luego logros, títulos, cápsulas y apuesta en paralelo.
- verificarLogros y verificarTitulos: todas las métricas en paralelo; títulos ganados
  también se otorgan en paralelo.

Orden que se respeta: consumir_boost después de registrar_xp_diario (lo lee); logros y
títulos después de sumar el día y el mundo; feed del logro después de user_achievements.
registrar_progreso_mundo solo toca world_progress, así que no choca con
registrar_xp_diario (que bloquea profiles y daily_progress).

## Después (estimado con la latencia medida)

App: subida de los últimos intentos + 1 ida y vuelta (~0,3-0,6 s), con piso de 0,45 s.
Web: ~4-5 idas y vueltas en serie (~0,6-1 s) en vez de decenas.

## Verificación

calibra: tsc sin errores, eslint limpio, vitest src/lib 2746 pasan.
mobile: tsc sin errores, eslint limpio.
