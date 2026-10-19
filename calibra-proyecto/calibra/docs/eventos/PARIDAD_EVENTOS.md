# Paridad de eventos

Pedido del usuario (2026-10-19): igual que `docs/PARIDAD_MUNDOS.md` para los mundos, esta
es la lista que **todo evento** tiene que cumplir antes de darse por terminado, sea grande
o chico. La regla de fondo: **todo en la app celebra la fecha**. Cuánto cambia cada parte
depende de la escala (tabla §6.1 de `PLAN_FESTIVIDADES.md`), pero ninguna fila queda vacía
sin una razón escrita.

Datos de cada evento:
- `src/lib/temas/temas.ts`: lo visual.
- `src/lib/temas/celebracion.ts`: saludo, botón, esquinas, acierto, minievento, rankeds,
  amigos y avisos.
- `src/lib/temas/colecciones.ts`: colección y fichas.
- `src/lib/temas/videosApertura.ts`: video.

Todo vale **en web y app a la vez**.

## La lista (24 filas)

| # | Fila | Qué se comprueba |
|---|---|---|
| 1 | Calendario | Fechas de decoración, evento y cierre en `calendario.ts`, con su test |
| 2 | Ambiente | Partículas propias (o una razón para no tenerlas) y que se apaguen en Ajustes |
| 3 | Ciudad | Adornos sobre las 15 ciudades (Inicio, carga, placa) |
| 4 | Pasante | Algo cruza el cielo (eventos grandes y medianos) |
| 5 | Botones | Borde de la fecha en los botones principales |
| 6 | Tarjetas | Adorno en las esquinas (mundos, misiones y la tarjeta de la pregunta) |
| 7 | Avatar | Accesorio de la fecha |
| 8 | Logo | Detalle de la fecha en el logo del encabezado |
| 9 | Acierto | El «+N» y el estallido con los colores de la fecha, y su sonido |
| 10 | Resultado | El fondo del resultado con la escena y la frase de partida perfecta |
| 11 | Inicio | Saludo, palabra del botón principal y cartel del evento |
| 12 | Minievento | Al menos uno, con dónde ocurre (partida, Inicio, rankeds, amigos o Bazar) |
| 13 | Rankeds | La fecha se ve en las rankeds (piel y, si tiene, su modo o premio) |
| 14 | Amigos | La fecha se ve en Amigos (piel y, si tiene, su acción de regalo) |
| 15 | Chat | El emote de la fecha abierto para todos mientras dura (grandes y medianos) |
| 16 | Avisos | Los 3 avisos (inicio, mitad y último día) con el tono de la fecha |
| 17 | Cápsulas | La piel de la cápsula y la cápsula de temporada en el Bazar (si hay colección) |
| 18 | Constelaciones | Forma y color de las estrellas de la fecha |
| 19 | Colección | Piezas, precio en fichas y en Cometas, y cierre que cambia lo que sobra por Chispas |
| 20 | Bazar | El puesto del evento y sus paquetes de temporada |
| 21 | Widgets | Acento, adornos y partículas en los widgets de Android |
| 22 | Ícono | El ícono de la fecha (grandes y medianos) |
| 23 | Video | Video de apertura con la cola de 5 s (ANIMACIONES_EVENTOS.md) |
| 24 | Anuncio | La tarjeta de novedades del evento, programada para su fecha |

## Estado (2026-10-19)

- ✅ hecho · 🟡 diseñado, falta construir · ⬜ falta.
- La «galería de diseño» (pendiente 83) muestra todas las filas visuales por evento.

| Evento | 1–5 | 6 | 7–8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Halloween | ✅ | 🟡 | ✅ | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ⬜ | 🟡 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Navidad | ✅ | 🟡 | ✅ | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ⬜ | 🟡 | ✅ | ✅ | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ |
| Los otros 14 | ✅ | 🟡 | ✅ | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ⬜ | 🟡 | ✅ | ✅ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |

## Regla para eventos nuevos

Un evento nuevo empieza copiando una fila de `celebracion.ts` y una de `temas.ts`, y no se
publica hasta que su fila de esta tabla esté completa o cada hueco tenga su razón escrita.
