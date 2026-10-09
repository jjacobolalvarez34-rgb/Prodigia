# Plan: modo «Zen» (sin reloj)

Pedido del usuario (2026-10-08): un modo de juego sin tiempo, que no estorbe la
forma normal de jugar. Decisiones del usuario: nombre **Zen**, **10 preguntas**,
**dificultad y tema elegibles**, **sin Chispas** y **pistas gratis**. Es solo la
planeación; se implementa cuando el usuario diga «continuar».

## 1. Idea

Una partida de **10 preguntas sin cronómetro**, en la que eliges el tema y la
dificultad. Sirve para practicar con calma lo que quieras, sin premios ni presión.
La contrarreloj de 60 s sigue siendo el modo principal y por defecto.

## 2. Dónde va (sin estorbar)

1. **En la pantalla de cada modo, antes de jugar.** Un selector de dos pastillas
   encima del botón Jugar: «⏱ Contrarreloj | ☯ Zen».
   - Arranca en Contrarreloj.
   - Recuerda la última elección en cada mundo.
   - Al elegir Zen aparecen dos filas más:
     - **Tema:** los modos o temas del mundo, más «Mezcla».
     - **Dificultad:** nivel 1 a 10, en una barra deslizable con palabras guía (Fácil · Media · Difícil · Experto). Arranca en tu nivel actual de ese tema.
2. **Al terminar una lección de Aprender:** botón «Practicar en Zen», ya con el tema
   de la lección elegido.
3. **En el resultado de una partida con muchos errores:** sugerencia «¿Repasar en Zen?»,
   con ese tema y un nivel menos.

**No aparece en** Rankeds, duelos, reto diario o semanal, ligas ni el diagnóstico.

## 3. Cómo se juega

- **Progreso:** barra «4 de 10» en lugar del reloj.
- **Dificultad fija:** la que elegiste, sin ajuste automático durante la partida.
- **Al fallar:** muestra la respuesta correcta y, si el mundo la tiene, la explicación
  paso a paso. No avanza solo: tocas «Siguiente». Una vez por pregunta puedes
  «Intentar de nuevo».
- **Pistas:** gratis, sin gastar la pista de la tienda.
- **Hielo y +3 s:** se ocultan y no se gastan.
- **Efectos:** los sonidos y efectos de acierto se mantienen. No hay multiplicador de
  combo ni puntaje.
- **Resumen final:**
  - aciertos;
  - preguntas falladas con su respuesta;
  - «Otra vez», «Subir un nivel» y «Probar en contrarreloj».

## 4. Qué cuenta (sin Chispas)

| Sistema | En Zen |
|---|---|
| Chispas | **No** (decisión del usuario) |
| Misiones, constelaciones, cápsulas | No: todas dan Chispas o premios, así que no avanzan |
| Racha diaria | Sí cuenta *(a confirmar)*: es jugar, y no da Chispas por sí sola |
| XP del mundo | No (con dificultad elegida a mano se podría inflar) |
| Calibración (nivel por tema) | No: la dificultad la eligió el jugador, así que no mide su nivel real |
| Ranking, ligas, ELO, logros | No |

Zen queda como práctica pura: no cambia la economía ni el nivel.

## 5. Implementación (resumen)

- **Base:** probablemente sin migración.
  - Si Zen no guarda nada, la partida no pasa por el cierre normal (`api/practica/finish`) ni por `api/attempts`.
  - Solo hace falta registrar la racha si se confirma que cuenta, con una RPC chica que marque el día jugado; esa RPC sí sería una migración.
- **Generadores:** ya reciben `(modo, nivel)`, así que Zen solo pasa el tema y el nivel elegidos. «Mezcla» elige un modo al azar por pregunta.
- **Web:**
  - Lo ideal es un runner Zen genérico (como `SprintRunnerMundo`) que use el generador de cada mundo; así no se tocan los ~15 runners con reloj.
  - El selector Tema/Dificultad va en la pantalla de cada modo, más el botón en Aprender y la sugerencia en el resultado.
  - Hay que revisar cada mundo con visuales propios (mapa de Geografía, cartas de Naipia, pentagrama de Melodía…) para que el runner Zen los muestre igual.
- **App:**
  - una pantalla `zen/[mundo]` que reusa `PreguntaVista` y los adaptadores de `mundosJugables` (ya generan por modo y nivel);
  - el selector en la pantalla del modo.
- **Cierre:**
  - textos es/en;
  - `npm run paridad`;
  - un anuncio;
  - una fila en PARIDAD_MUNDOS («Zen» en todos los mundos).

Tamaño estimado: un runner nuevo en la web y una pantalla nueva en la app, más el
selector en ~15 pantallas de modo (o en una sola, si la de elegir modo es compartida).

## 6. Pendiente de confirmar

1. ¿La racha diaria cuenta con una partida Zen? (Recomendado: sí.)
