# Eventos en vivo (2026-10-28)

Pedido: cuando el contador de un evento (Gran Alineación, fiestas) llega a 0 con la app
abierta, la app reacciona sola: fundido, cinemática y todo actualizado sin reiniciar. En
una partida no se interrumpe: al salir del resultado se va al Inicio y sale el video.

## Cómo funciona

1. `src/lib/temas/momentosClave.ts` (compartido, puro, con tests):
   - `proximoMomentoClave(ahora)`: el próximo instante en que algo cambia: aparece el
     cartel de la Alineación (3 días antes), empieza, termina, se va el resumen (3 días
     después); la apertura exacta de cada fiesta (`inicioEventoMs`, que se corre si cruza
     una Alineación) y la próxima medianoche UTC (cambios de fase por día).
   - `crearRelojEventos({ alVolver })`: un único `setTimeout` a ese instante (+250 ms),
     que se reprograma al dispararse y al volver al frente; si se adelanta, solo se
     reprograma. Tope de 6 h por tramo.
   - `firmaEventos(ahora)`: resumen de lo que se ve (para tests: entre dos momentos clave no cambia).
2. `videoAperturaActual(ahora, { temas })`: con «Decoración de temporada» apagada no hay
   videos de fiestas (la Alineación sí, no es decoración). Sin vista previa: solo da algo
   si la fecha ya llegó.
3. App: `mobile/src/lib/relojEventos.ts` (AppState) y `mobile/src/lib/pantallasDeJuego.ts`.
   `useTemaHoy`, CapaAlineacion, Ciudad y CartelAlineacion se recalculan en el instante.
   VideoApertura queda siempre montado: revisa al abrir, en cada momento clave y al volver
   al frente; si toca un video no visto, entra con fundido y, tapado por el negro, la app
   vuelve al Inicio (`dismissAll` + `navigate("/")`). En partidas (sprint, duelo, reto,
   zen, diagnóstico, reto-finde), `resultado`, `pi`, lecciones (`aprender`), la primera
   vez y el acceso espera: al salir de ahí sale el video y la app va al Inicio.
4. Web: `src/components/temas/relojEventos.ts` (visibilitychange). Igual: `useTemaHoy`,
   CapaAlineacion, InsigniaAlineacion y CartelAlineacion; VideoApertura espera en
   `RUTAS_DE_JUEGO` + pi, aprender, demo, onboarding, login, registro, recuperar, auth.
5. Visto: igual que antes (AsyncStorage en la app, localStorage en la web, por edición).

## Avance

- [x] Lógica compartida y tests (`momentosClave.test.ts`).
- [x] App y web enganchadas.
- [x] Verificación: tsc web y app, eslint de lo tocado, vitest de temas y recompensas.
