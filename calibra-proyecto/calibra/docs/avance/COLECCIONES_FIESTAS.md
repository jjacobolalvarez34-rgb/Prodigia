# Colecciones y minieventos de las fiestas (2026-10-29)

Pedido: cada fiesta que viene con su colección propia y su minievento funcionando de
verdad (web y app), como Halloween. Orden: Día de Muertos (1-2 nov), Diwali (8 nov),
Viernes Estelar, Navidad, Año Nuevo.

Migración: `supabase/migrations/0309_colecciones_fiestas.sql` (una sola, idempotente,
validada con val.py). La parte de datos (piezas, catálogo, restricción de marcos y
fondos de profiles, eventos 2026 y 2027, ofertas y anuncios) se genera desde
`src/lib/temas/colecciones.ts` y `minieventos.ts`:
`EVENTOS_ESCRIBIR_SQL=1 npx vitest run src/lib/temas/eventos.test.ts`.
El resto (tablas de minieventos y funciones) es a mano, partiendo de la última versión
de cada función: `_fichas_ganadas` (0292) y `canjear_pieza_evento` (0290).

## Común a todas

- `colecciones.ts`: piezas con `migracion: "0309"`; `Coleccion.migracion` para que la
  0289 generada siga igual (el test lo comprueba).
- Fichas de los minieventos: tabla `minievento_premios`; `_fichas_ganadas` las suma.
- Calendario: Muertos, Diwali, Viernes Estelar y Año Nuevo ahora tienen día de cierre.
- Cierre tapado: Halloween cierra el 1 de noviembre, que es Día de Muertos. La página
  del evento (web y app) muestra «Te quedaron N Caramelos de Halloween» para cambiarlos
  por Chispas (`eventosPorCerrar`, componente CierrePendiente) durante 14 días.
- Dibujos nuevos (dibujos.ts, mismo estilo): fichas `cempasuchil`, `vela`, `diya`,
  `estrella_fugaz`, `regalo`, `campana`; escenas `escenaOfrenda` y `escenaLamparas`
  (minieventos.ts). Revisados en imagen: `zz-galeria/fiestas/fiestas.png`.
- Mensajes es/en: namespace `Minieventos`.

## Día de Muertos — COMPLETO

- Ficha: Cempasúchil (flor).
- Colección (7): emote 🌼 ¡Te recuerdo! (común 4 / 60), estela Vela (raro 8 / 120),
  efecto Papel picado (raro 8 / 120), fondo Ofrenda (raro 9 / 140), título «Memoria viva»
  (épico 12 / 220), marco Papel picado (épico 14 / 300), marco Calavera de azúcar
  (legendario 20 / 600). Fichas más baratas que Halloween: son 2 días.
- Evento: `muertos-2026` (1-2 nov, cierre el 3) y `muertos-2027`.
- Minievento «La ofrenda» (Inicio, dentro del cartel del minievento): una pregunta de
  Historia por día (banco de 14 personajes, es/en, con su dato; el 1 y 2 de nov de 2026
  tocan Frida Kahlo y Nezahualcóyotl). Acertar enciende una vela de la ofrenda y da 4
  Cempasúchil (`responder_ofrenda`, una respuesta por día). La ofrenda dibujada muestra
  las velas encendidas.
- «Dejar una flor» a un amigo ya funciona con `dar_dulce` (genérico de 0292).
- Archivos: `src/components/temas/minieventos/{Ofrenda,MinieventoFiesta}.tsx`,
  `mobile/src/ui/temas/minieventos/{Ofrenda,MinieventoFiesta}.tsx`, MinieventoInicio
  (web) e `(tabs)/index.tsx` (app).
- Verificado: tsc web y app, eslint de lo tocado, vitest temas y recompensas (74 ok).

## Diwali — COMPLETO
- Ficha: Diyas. Colección (7): emote 🪔 ¡Que brille! (6/60), estela Bengala (12/120),
  efecto Fuegos de colores (12/120), fondo Noche de diyas (13/140), título «Portador de
  luz» (18/220), marco Diya (22/300), marco Rangoli (legendario 34/600).
- Minievento «Enciende 100 lámparas»: `lamparas_evento()` cuenta los aciertos desde que
  abrió el evento; con 100 da 10 Diyas (una vez). Escena con 100 diyas que se encienden.
- Componentes: `Lamparas.tsx` (web y app).

## Viernes Estelar — COMPLETO
- Ficha: Estrellas fugaces. Colección (6): emote ⭐ ¡Estelar! (5/60), efecto Lluvia de
  estrellas (10/120), fondo Noche estelar (11/140), título «Cazaofertas» (15/220), marco
  Cometa (18/300), marco Constelación (legendario 28/600).
- Minievento «Estrella fugaz»: 4 ofertas de 2 horas a mitad de precio (Fichas y Cometas),
  en `OFERTAS_ESTELARES` → tabla `eventos_ofertas` (generada; la política solo deja ver
  las que ya cayeron). `canjear_pieza_evento` cobra el precio de la oferta. Se ve en el
  Inicio, en la portada del Bazar y en la página del evento (precio rebajado). Nunca dice
  cuál viene.

## Navidad — COMPLETO
- Ficha: Regalos. Colección (7): emote 🎅 ¡Jo jo jo! (10/60), estela Nieve (20/120),
  efecto Copos (20/120), fondo Pueblo nevado (22/140), título «Duende de Santa» (34/220),
  marco Bastón de caramelo (40/300), marco Luces que titilan (legendario 60/600).
- Minievento «Calendario de adviento»: grilla 1-24; solo se abre la casilla de hoy
  (`abrir_casilla_adviento`): 3 Regalos; los domingos, una cápsula de temporada de
  Navidad (capsulas_usuario, en Recompensas).

## Año Nuevo — COMPLETO
- Ficha: Campanadas. Colección (7): emote 🥂 ¡Salud! (5/60), estela Serpentina (9/120),
  efecto Bengalas (9/120), fondo Medianoche (10/140), título «Primera luz del año»
  (14/220), marco Fuegos artificiales (16/300), marco Medianoche dorada (legendario 24/600).
- Minievento «Reto 2027»: `reto_comunidad()` cuenta las operaciones de Numeria bien
  resueltas hoy por toda la comunidad (meta = el año que empieza); al llegar,
  `reclamar_reto_comunidad()` da una cápsula de temporada a cada uno (una por día).
  Índice nuevo `attempts_created_at_idx`.

## Pendiente / notas
- 0309 no está aplicada en la base: aplicarla antes del 1 de noviembre. Sin ella, la
  web y la app no se rompen (los minieventos muestran un aviso), pero no hay canje.
- No hay paquetes de cápsulas de temporada para las fiestas nuevas (solo Halloween, 0291).
- El resto del calendario (Año Nuevo Lunar en adelante) queda sin colección propia.
