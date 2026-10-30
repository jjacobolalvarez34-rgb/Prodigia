# Colecciones y minieventos de las fiestas, parte 2 (2026-10-30)

Pedido: las fiestas del calendario que todavía no tenían colección ni minievento propio
(de Año Nuevo Lunar en adelante), con el mismo patrón que la parte 1
(`COLECCIONES_FIESTAS.md`: Muertos, Diwali, Viernes Estelar, Navidad y Año Nuevo).
Orden de fecha en 2027 (los de 2026 ya pasaron).

Migración: `supabase/migrations/0311_colecciones_fiestas_2.sql` (una sola, idempotente,
validada con val.py: 71 sentencias, 8 cuerpos plpgsql). La parte de datos (piezas,
catálogo, restricción de marcos y fondos de profiles, eventos 2027 y 2028, metas de los
minieventos y anuncios) se genera desde `src/lib/temas/colecciones.ts` y `minieventos.ts`
entre las marcas: `EVENTOS_ESCRIBIR_SQL=1 npx vitest run src/lib/temas/eventos.test.ts`.
El resto es a mano. No redefine `_fichas_ganadas` ni `canjear_pieza_evento` (las de 0309
siguen siendo las últimas): todos los premios van a `minievento_premios`, que
`_fichas_ganadas` ya suma. Requiere 0289, 0291, 0292, 0295 y 0309.
0289 y 0309 generadas no cambian (el test lo comprueba; 0309 ahora solo toma los marcos y
fondos hasta 0309).

## Común a todas

- `colecciones.ts`: piezas con `migracion: "0311"`, `Coleccion.migracion = "0311"`.
- Calendario: todas estas fiestas tienen día de cierre (canjear el día siguiente).
- Mecánicas reutilizables nuevas (0311):
  - **Metas de aciertos** (`METAS_MINIEVENTOS` → tabla generada `minievento_metas`;
    `progreso_minievento(tema)`, `reclamar_meta_minievento(tema, clave)`): cuentan los
    aciertos desde que abrió el evento o de hoy, en cualquier mundo o en uno.
    Hooks `useMetasMinievento` (web y app).
  - **Pregunta del día** genérica (`pregunta_dia_respuestas`, `responder_pregunta_dia`).
- Dibujos nuevos (dibujos.ts, mismo estilo, sin destellos): fichas `moneda`, `carta`,
  `mascara`, `luna`, `pi`, `gulal`, `semilla`, `lapiz` (Pascua usa `huevo` y Música
  `nota`, que ya existían). Escenas en `src/lib/temas/escenasFiestas.ts`. Revisados en
  imagen (galería en el scratchpad de la sesión).
- Marcos: clases `.marco-evento-*` en `globals.css` (web); la app los toma de `MARCOS_EVENTO`.
- Mensajes es/en: namespace `Minieventos` (sobres, duo, comparsa, luna, pi, holi, huevos,
  bosque, musica, repaso). La app, en español como el resto de sus minieventos.
- Textos de `celebracion.ts` ajustados a lo que de verdad hace cada minievento.
  Amor y amistad y Noches de linternas pasan a `donde: "inicio"` (se ven en el Inicio).

## Año Nuevo Lunar (6 – 12 feb 2027) — COMPLETO
- Ficha: Monedas de la suerte. Colección (7): emote 🧧 ¡Prosperidad! (7/60), estela Dragón
  (14/120), efecto Faroles (14/120), fondo Faroles rojos (16/140), título «Danza del
  dragón» (21/220), marco Farol (26/300), marco Dragón dorado (legendario 40/600).
- Minievento «Sobres rojos»: 3 sobres por día, se abren (con un toque) con 5, 15 y 30
  aciertos del día: 2, 3 y 4 Monedas (metas por día). Componente `SobresRojos`.
- Nota: del 6 al 9 se ve Carnaval (el calendario ya lo resolvía así); las Fichas del Año
  Nuevo Lunar se ganan desde el 6 igual.

## Carnaval (6 – 9 feb 2027) — COMPLETO
- Ficha: Máscaras. Colección (7): emote 🥁 ¡Que suene! (5/60), estela Plumas (10/120),
  efecto Confeti de carnaval (10/120), fondo Comparsa (11/140), título «Alma de la
  comparsa» (15/220), marco Antifaz (18/300), marco Plumas de carnaval (legendario 28/600).
- Minievento «Comparsa»: cada 10 aciertos de Melodía suman un bailarín (hasta 10); con 20,
  50 y 100 aciertos de Melodía del evento, 3, 4 y 6 Máscaras (se cobran solas). Tabla de
  la comparsa (`tabla_comparsa`, top 10). Componente `Comparsa`.

## Amor y amistad (12 – 15 feb 2027) — COMPLETO
- Ficha: Cartas. Colección (7): emote 💌 ¡Para ti! (5/60), estela Corazones (10/120),
  efecto Lluvia de corazones (10/120), fondo Atardecer rosa (11/140), título «Amigo fiel»
  (15/220), marco Cupido (18/300), marco Lazo de amistad (legendario 28/600).
- Minievento «Dúo de la amistad»: cada duelo amistoso (no ranked) terminado con un amigo
  durante el evento da 3 Cartas a cada uno, una vez por amigo y hasta 5 amigos
  (`duo_amistad`, lo comprueba con duels + friendships). Componente `DuoAmistad`.

## Noches de linternas (10 – 12 mar 2027) — COMPLETO
- Ficha: Lunas. Colección (6): emote 🌙 ¡Buenas noches! (5/60), efecto Linternas que suben
  (9/120), fondo Luna creciente (10/140), título «Guardián de la luna» (13/220), marco
  Linterna (16/300), marco Luna creciente (legendario 24/600).
- Minievento «Noches de luna»: una pregunta tranquila por noche (banco de 7, es/en: fases,
  probabilidad, promedio, mareas…); acertarla sube una linterna y da 4 Lunas.
  Componente `NochesLuna`.

## Día de π (14 mar 2027) — COMPLETO
- Ficha: Dígitos. Colección (6, barata: es un día): emote 🥧 ¡3,14! (2/60), efecto Dígitos
  de π (4/120), fondo Círculo perfecto (4/140), título «Calculador de π» (5/220), marco π
  (6/300), marco Espiral de dígitos (legendario 9/600).
- Minievento: el «Dígitos de π» de siempre (0295, pantalla /pi) ahora da Dígitos con tu
  mejor marca del día: 10, 20 y 31 dígitos → 2, 3 y 4 (`premios_digitos_pi`, se cobran
  solos). Componente `DigitosPi` en el cartel del Inicio, junto al botón Jugar.

## Holi (22 – 23 mar 2027) — COMPLETO
- Ficha: Polvos de color. Colección (7): emote 🎨 ¡Colores! (4/60), estela Arcoíris (8/120),
  efecto Polvo de colores (8/120), fondo Ciudad pintada (9/140), título «Pintor de
  ciudades» (12/220), marco Gulal (14/300), marco Arcoíris de Holi (legendario 20/600).
- Minievento «Ciudad de colores»: cada acierto del evento pinta una mancha en la ciudad;
  con 60, 8 Polvos de color (meta, solo). Componente `CiudadColores`.

## Pascua (26 – 29 mar 2027) — COMPLETO
- Ficha: Huevos. Colección (7): emote 🐣 ¡Lo encontré! (5/60), estela Pastel (10/120),
  efecto Huevos de colores (10/120), fondo Prado de primavera (11/140), título «Buscador
  de huevos» (15/220), marco Huevo pintado (18/300), marco Conejo de primavera
  (legendario 28/600).
- Minievento «Huevos escondidos»: un huevo por día, cada día en otra pantalla (Bazar,
  Perfil, Recompensas y la página del evento, en ese orden: `LUGARES_HUEVOS`; la base
  tiene el mismo orden y solo acepta el de hoy en su lugar). 4 Huevos cada uno y 6 más con
  los 4 (`encontrar_huevo`). En el Inicio, la cuenta y una pista; el huevo es
  `HuevoEscondido` (web: en la esquina; app: tienda en la esquina, el resto al final).

## Día de la Tierra (22 abr 2027) — COMPLETO
- Ficha: Semillas. Colección (6): emote 🌱 ¡A plantar! (2/60), estela Hojas (4/120), fondo
  Planeta verde (4/140), título «Guardián del bosque» (5/220), marco Hoja (6/300), marco
  Planeta azul (legendario 9/600).
- Minievento «Bosque compartido» (reto de comunidad): cada 5 aciertos de cualquiera
  plantan un árbol; con 400 árboles, 6 Semillas a cada uno que plantó al menos uno
  (`bosque_compartido`, `reclamar_bosque`). Componente `Bosque`.

## Día de la Música (21 jun 2027) — COMPLETO
- Ficha: Notas. Colección (6): emote 🎵 ¡Suena bien! (3/60), efecto Notas al aire (5/120),
  fondo Escenario (6/140), título «Músico de la ciudad» (8/220), marco Vinilo (10/300),
  marco Pentagrama dorado (legendario 14/600).
- Minievento «Melodía al doble»: ese día la Exp de Melodía cuenta doble para las Notas y
  el tope sube a 24 (`eventos.dia_doble`/`mundo_doble`, de 0292); cada acierto de Melodía
  toca una nota del pentagrama, con 16 la melodía queda completa: 6 Notas (meta, sola).
  Componente `MelodiaCompleta`.

## Vuelta a clases (1 – 7 sep 2027) — COMPLETO
- Ficha: Lápices. Colección (7): emote ✏️ ¡Presente! (7/60), estela Tiza (14/120), efecto
  Fórmulas (14/120), fondo Pizarrón (16/140), título «Primero de la clase» (21/220), marco
  Cuaderno (26/300), marco Birrete (legendario 40/600).
- Minievento «Semana de repaso»: cada día con 10 aciertos llena una página del cuaderno
  (7 páginas): 3 Lápices por página (meta por día, sola). Componente `Repaso`.

## Verificado
- `npx tsc --noEmit` web y app: sin errores.
- eslint de lo tocado (web y app): sin errores.
- `npx vitest run src/lib/temas src/lib/recompensas`: 76 de 76.
- val.py sobre 0311: OK.
- es/en de `Minieventos`: mismas claves.

## Pendiente / notas
- 0311 no está aplicada: aplicarla antes del 6 de febrero de 2027 (requiere 0309). Sin
  ella la web y la app no se rompen: los minieventos no muestran nada o muestran el
  cartel sin progreso, y no hay canje.
- Las fichas de Año Nuevo Lunar y Carnaval se pisan (6 – 9 feb): cada uno cuenta sus
  propias Fichas; el Inicio muestra Carnaval esos días.
- Sin paquetes de cápsulas de temporada para estas fiestas.
- Las claves nuevas de `Minieventos` (es/en) ya quedaron en el commit 04628cdb (el agente
  de tickets de Pro commiteó los json completos); el resto de esta parte sigue sin commit.
