# Plan: más usos para las cápsulas y un calendario de eventos

Pedido del 2026-10-09: darles a las cápsulas usos distintos de «subir de nivel», usar
los distintos niveles de cápsula (eventos de fin de semana o algo así) y tener eventos
de verdad, aprovechando la sección «Novedades y eventos» que ya existe.

Las reglas de 0249 se mantienen: **las cápsulas no se compran** (ni con dinero ni con
Chispas), las probabilidades se ven antes de abrir, los repetidos se convierten en
Chispas y la base decide todos los premios. Nada de este plan crea un pase de batalla.

---

## 1. Qué hay hoy

| Cápsula | Cómo se gana | Qué trae |
|---|---|---|
| Diaria | Primera partida del día | Chispas 20–80 (70 %) o un hielo, +3 s o un escudo |
| Misiones | Las 3 misiones del día | Lo mismo que la diaria |
| Racha | Cada 7 días de racha y el día 7 del calendario | Chispas 150–400 o un cosmético común o raro |
| Nivel | Cada nivel de cuenta | Chispas 50–150 o un cosmético raro |
| Ciudad | Niveles 10, 20, 30… de una ciudad y completar sus Técnicas | Una pieza de la colección de esa ciudad |
| Liga (bronce/plata/oro) | Al cerrar la semana, según el puesto | Chispas y cosméticos raros a legendarios |
| Colección | Las 6 piezas de una ciudad | Su marco animado |

Eventos que ya existen: la **doble experiencia** diaria (un mundo por día, rota sola), la
**Gran Alineación** de las constelaciones (premio doble), los **retos diario y semanal**,
las **ligas** semanales, las **misiones de clan** y la tabla `anuncios` con el tipo
`evento`, que se ve en «Novedades y eventos» (app: `avisos.tsx`; web: `AnunciosModal`).

**El problema:** la diaria y la de misiones salen casi siempre y casi siempre traen
Chispas. Después de unas semanas, abrir una cápsula deja de emocionar. Además, todas
se abren apenas llegan: no hay nada que guardar, juntar ni esperar.

---

## 2. Cápsulas: cuatro niveles y cosas que hacer con ellas

### 2.1 Niveles de cápsula (la cápsula misma tiene rareza)

| Nivel | Color | De dónde sale | Qué trae (orientativo) |
|---|---|---|---|
| **Bronce** | cobre | Diaria y misiones (como hoy) | Chispas 20–80, consumibles |
| **Plata** | plateado | Racha de 7, nivel de cuenta, 3 bronces fusionadas | Chispas 100–250, cosmético común/raro, 2 consumibles |
| **Oro** | dorado | Ciudad, ligas, 3 platas fusionadas, eventos | Cosmético raro/épico, pieza de colección, fondo de chat |
| **Prisma** | arcoíris animado | Solo eventos y 3 oros fusionadas | Épico garantizado, 20 % legendario, cosméticos de evento |

Cada nivel tiene su propia caída, su propio sonido y una apertura más larga cuanto más
alto (ya existe la escena: `fx/Revelacion` en la app y `AbrirCapsula` en la web).

### 2.2 Fusionar: 3 iguales → 1 del nivel siguiente

- En Recompensas, un botón «Fusionar» junta 3 cápsulas del mismo nivel en una del
  siguiente, con una animación de las tres girando y chocando.
- Les da sentido a las bronces que hoy no emocionan: se pueden **guardar** para algo más
  grande.
- Base: RPC `fusionar_capsulas(p_nivel)` que borra 3 y crea 1 en la misma transacción.
- Límite: una fusión a Prisma por semana, para que el Prisma siga siendo especial.

### 2.3 La cápsula del finde (sellada)

- De lunes a viernes, cada día que cumples la meta diaria, se le enciende un sello
  (5 sellos).
- Se abre **solo el sábado o el domingo**. Con 3 sellos es de plata; con 5, de oro.
- Da una razón para volver el finde y premia la constancia sin castigar al que falla
  un día. Si no la abres el domingo, se guarda hasta el finde siguiente; no se pierde.

### 2.4 Otros usos nuevos

| Idea | Cómo funciona | Por qué |
|---|---|---|
| **Cápsula caída en la ciudad** | 1 o 2 veces por semana, a una hora al azar, cae una bronce en paracaídas sobre una de tus ciudades (igual que el paquete de la doble experiencia). Hay 3 horas para tocarla. | Sorpresa sin costo: hace mirar la app. |
| **Cápsula de récord** | Superar tu mejor puntaje de sprint en un modo da una bronce (máximo 1 por día). | Premia mejorar, no solo jugar más. |
| **Cápsula de duelo** | 3 victorias seguidas en Rankeds dan una plata con emotes y efectos de duelo. | Le da un premio propio a lo competitivo. |
| **Cápsula de clan** | Las misiones de clan llenan una barra común; al completarla, **cada miembro** recibe una oro. | Hace jugar en equipo. |
| **Regalar una cápsula** | Una vez por semana puedes mandarle una bronce tuya a un amigo (ya existe `regalos_amigos`). | Social y gratis. |
| **Ticket de evento** | Premio nuevo dentro de las cápsulas: sirve para la tienda del evento (ver §3.3). | Une cápsulas y eventos. |

### 2.5 Premios nuevos dentro de las cápsulas

Para que no sea siempre «Chispas»:

- **Estrellas de constelación** (+1 o +2 a una constelación a elección).
- **Turbo**: doble Exp durante tus próximas 3 partidas.
- **Comodín de racha** (equivale a un hielo, pero dura una semana guardado).
- **Fondos de chat** y **marcos temporales** de evento.
- **Fragmentos**: 5 fragmentos de una ciudad = una pieza de su colección a elección
  (evita depender de la suerte para la última pieza).

### 2.6 Cuidados

- Probabilidades siempre a la vista, por nivel.
- Garantía visible: «faltan N para un raro» por nivel.
- Las cápsulas no se venden con dinero (cajas al azar pagadas: problemas legales y de Google
  Play). Con dinero se venden cosas que se ven antes de pagar: ver `economy/PLAN_ECONOMIA.md`.
- **Los números (Chispas, Gemas, precios de fusión) salen de `economy/PLAN_ECONOMIA.md`**, que
  va antes que este plan.
- Todo en la base (RPC y tablas); la app y la web solo muestran (regla del proyecto).

---

## 3. Eventos

### 3.1 Un motor de eventos (lo que falta hoy)

Hoy cada evento es código suelto: la doble experiencia es una fórmula y la Gran Alineación
es otra. Para tener eventos variados sin programar cada uno:

- Tabla `eventos`: `id`, `tipo`, `titulo`/`titulo_en`, `descripcion`/`descripcion_en`,
  `inicio`, `fin`, `mundos` (o todos), `reglas` (jsonb: multiplicadores, metas) y
  `premios` (jsonb).
- RPC `eventos_activos()` y `progreso_evento(p_evento)`; la base aplica los
  multiplicadores al guardar cada intento, igual que hoy con la doble experiencia.
- Al crear un evento se crea solo su `anuncio` de tipo `evento`, así aparece en
  «Novedades y eventos» sin trabajo extra.
- Cartel en el Inicio (web y app) con cuenta regresiva y barra de progreso.
- Avisos push: la víspera, al empezar y 3 horas antes de terminar (con el límite de
  `push_throttle`).

### 3.2 Calendario fijo (se repite solo)

| Cuándo | Evento | Qué pasa |
|---|---|---|
| Todos los findes | **Finde de ciudad** | Una ciudad por finde, rotando las 15: doble Exp, una pieza de colección exclusiva del evento y una tabla de puntaje solo de ese finde. |
| Todos los findes | **Cápsula del finde** | La de §2.3. |
| 1 finde al mes | **Torneo relámpago** | Rankeds por puntos del sábado al domingo; premios por tramo (top 50 % plata, top 10 % oro, top 1 % prisma). |
| 1 vez al mes | **Noche de estrellas** | 24 h con el doble de estrellas de constelación. Se puede hacer coincidir con la luna llena. |
| 1 vez al mes | **Desafío de la comunidad** | Meta global (p. ej. «entre todos, 1 000 000 de aciertos en Vitalia»). Si se cumple, todos los que jugaron reciben una oro. Barra compartida en vivo. |
| Cada 3 meses | **Clanes contra clanes** | Una semana de puntaje por clan; los 3 primeros reciben marco de clan. |

### 3.3 Eventos de fecha especial (con su ciudad)

| Fecha | Evento | Ciudad |
|---|---|---|
| 31 oct | **Noche de los esqueletos**: el esqueleto de Anatomía se vuelve fosforescente, piezas de colección de calabaza | Anatomía |
| 2 nov | **Día de Muertos**: ofrenda con datos históricos | Historia |
| 14 nov | **Día de la diabetes**: insulina y glucagón | Vitalia |
| Diciembre | **Navidad en las ciudades**: nieve sobre las ciudades, calendario de 12 días con una cápsula por día | Todas |
| 1 ene | **Año nuevo**: reto de 2027 operaciones | Numeria |
| 14 mar | **Día de Pi** | Numeria, Trigonometría |
| 22 abr | **Día de la Tierra**: ciclos de la materia | Vitalia, Geografía |
| 23 abr | **Día del Libro** | Historia |
| 21 jun | **Día de la Música** | Melodía |
| Vuelta a clases | **Semana del regreso**: misiones más fáciles y premio doble por la racha | Todas |

Cada evento especial puede tener una **tienda del evento**: se gana un ticket por
partida (máximo 5 por día) y por cápsulas, y con los tickets se elige un cosmético del
evento. Al terminar, los tickets que sobran se convierten en Chispas; no se pierde nada.

**Lo más cercano es Halloween (31 de octubre, en 3 semanas):** sirve de primer evento para
probar el motor.

### 3.4 Cuidados (público general)

- Todo evento se puede completar jugando unos 15 minutos por día; nadie queda afuera por
  no jugar horas.
- Nada que se pierda para siempre por faltar un día: lo que sobra se convierte en Chispas.
- El pase de evento tiene un carril gratis completo; el carril premium (US$4,99 o incluido en
  Pro) es solo cosmético (ver `economy/PLAN_ECONOMIA.md` §7). Nada pago da ventaja en
  partidas, duelos ni ligas.
- Los avisos respetan las horas de silencio y el límite de avisos por día que ya existen.

---

## 4. Orden de trabajo

| Fase | Qué | Base | Web y app |
|---|---|---|---|
| **1** | Niveles de cápsula (bronce/plata/oro/prisma) y fusión | `capsulas_usuario.nivel`, tabla de contenido por nivel, `fusionar_capsulas` | Recompensas con niveles, botón Fusionar y su animación |
| **2** | Motor de eventos y Finde de ciudad | Tabla `eventos`, `eventos_activos`, multiplicadores al guardar | Cartel en el Inicio, página del evento, anuncios automáticos |
| **3** | Cápsula del finde, caída en la ciudad, récord y duelo | Sellos semanales, `origen` por tipo nuevo | Sellos en el Inicio, paracaídas en las ciudades |
| **4** | Halloween (primer evento especial) con tienda y tickets | Tickets, catálogo del evento | Esqueleto fosforescente, tienda del evento |
| **5** | Desafío de la comunidad, Torneo relámpago, Clanes contra clanes | Contadores globales, tablas por evento | Barras en vivo, tablas de puntaje |
| **6** | Calendario de fechas especiales cargado para todo 2027 | Filas en `eventos` | Contenido de cada evento |

Cada fase sale en la web y en la app al mismo tiempo (`PARIDAD_APP_WEB.md`), con pruebas
de la base (probabilidades que suman 100, nadie fusiona sin tener 3 cápsulas, un evento
fuera de fecha no multiplica nada).

## 5. Decisiones

1. **Decidido (2026-10-10): los cuatro niveles reemplazan los tipos actuales**, con
   animaciones nuevas: diaria y misiones pasan a bronce; racha y nivel, a plata; ciudad y
   ligas, a oro. Va **después** de la fase 1 de `economy/PLAN_ECONOMIA.md`.
2. ¿Halloween como primer evento? Sí, si se quiere tener listo para el 31 de octubre.
3. ¿El Desafío de la comunidad cuenta a todos los jugadores o solo a los de cada país?
