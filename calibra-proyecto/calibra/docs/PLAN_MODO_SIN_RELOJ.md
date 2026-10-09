# Plan: modo «Sin reloj» (para aprobar)

Pedido del usuario (2026-10-08): un modo de juego sin tiempo, que no estorbe la
forma normal de jugar. Este documento es solo la planeación; no hay código todavía.

## 1. Idea

Una partida de **10 preguntas sin cronómetro**, para aprender con calma. Cuando
fallas, el modo explica la respuesta en vez de apurarte. La contrarreloj de 60 s sigue
siendo el modo principal y por defecto: «Sin reloj» es una opción al lado, no un
reemplazo.

## 2. Dónde va (sin estorbar)

1. **En la pantalla de cada modo, antes de jugar.** Un selector de dos pastillas
   encima del botón Jugar: «⏱ Contrarreloj | ∞ Sin reloj».
   - Arranca en Contrarreloj.
   - Recuerda la última elección en cada mundo.
   - No agrega pantallas nuevas.
2. **Al terminar una lección de Aprender:** botón «Practicar sin reloj» con ese
   mismo tema, el momento más natural para practicar tranquilo.
3. **En el resultado de una partida con muchos errores:** sugerencia «¿Repasar sin reloj?».

**No aparece en** Rankeds, duelos, reto diario o semanal, ligas ni el diagnóstico.
Todo lo competitivo sigue igual.

## 3. Cómo se juega

- **Progreso:** en lugar del reloj, una barra «4 de 10». Las preguntas, su dificultad y
  el ajuste según cómo te va son los mismos de siempre.
- **Al fallar:** muestra la respuesta correcta y, si el mundo la tiene, la explicación
  paso a paso. No avanza solo: tocas «Siguiente». Una vez por pregunta puedes
  «Intentar de nuevo».
- **Pistas:** gratis en este modo, sin gastar la pista de la tienda.
- **Hielo y +3 s:** se ocultan, porque no sirven sin reloj, y no se gastan.
- **Efectos:** los sonidos y efectos de acierto se mantienen. El multiplicador de
  combo, que premia la velocidad, no.
- **Resumen final:**
  - aciertos;
  - temas para repasar, con link a su lección;
  - botón «Probar en contrarreloj».

## 4. Recompensas y justicia (para que no se pueda abusar)

| Sistema | En «Sin reloj» |
|---|---|
| Racha diaria | Sí cuenta: es jugar |
| XP del mundo | Sí, a la mitad |
| Chispas | A la mitad, con tope diario (p. ej. 3 partidas sin reloj con Chispas por día) |
| Misiones | Cuentan las de «juega / acierta N»; no las de puntaje o velocidad |
| Constelaciones | 1 estrella, como cualquier partida |
| Logros | Los de aciertos, sí; los de velocidad o puntaje, no |
| Ranking semanal, ligas, ELO | No |
| Calibración (nivel por tema) | Cuenta solo la precisión, con menos peso: puede bajar el nivel si fallas mucho, y lo sube a la mitad de ritmo |

**Antes de implementar hay que verificar** cómo usa el tiempo de respuesta la
calibración actual (`skill_levels` / `api/attempts`), para que las respuestas lentas
no se lean como «le cuesta».

## 5. Implementación (resumen)

- **Base:** una migración nueva (después de las que estén) con:
  - una marca `sin_tiempo` en la partida o los intentos;
  - el factor de XP y Chispas y el tope diario en las funciones de cierre de partida
    (siempre desde su última definición);
  - excluir estas partidas de rankings y ligas.
- **Web:** los runners de cada mundo reciben `sinTiempo`. Lo ideal es pasar el reloj
  a un hook compartido que, con `sinTiempo`, no corre; así son pocas líneas por
  runner. Además:
  - el selector en la pantalla del modo;
  - el botón en Aprender;
  - la sugerencia en el resultado.
- **App:** `Sprint.tsx` (y los sprints de Numeria y Geografía) con la misma prop, más
  el selector en la pantalla del modo.
- **Cierre:**
  - textos es/en;
  - `npm run paridad`;
  - un anuncio;
  - una fila nueva en PARIDAD_MUNDOS («Sin reloj» en todos los mundos).

Tamaño estimado: 1 migración y unos 20–25 archivos entre la web y la app.

## 6. Decisiones para aprobar (recomendada primero)

1. **Nombre:** «Sin reloj» (recomendado) · «Modo calma» · «Zen».
2. **Largo:** 10 preguntas fijas (recomendado) · elegir 10 / 20 / sin fin.
3. **Chispas y XP:** a la mitad con tope diario (recomendado) · normales · ninguna.
4. **Calibración:** cuenta con menos peso (recomendado) · no cuenta.
5. **Pistas gratis en este modo:** sí (recomendado) · no.
