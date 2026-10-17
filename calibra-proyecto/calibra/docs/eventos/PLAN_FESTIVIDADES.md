# Plan: festividades del año como «temas» de Prodigia

Pedido del 2026-10-16: planear todas las festividades famosas a nivel internacional y
hacer cada una como un **tema**: no cambia la base de la app (mismos mundos, mismas
partidas, mismos botones), pero la viste y le suma la dinámica de la fecha. Ejemplo dado
para Navidad: ciudades nevadas, copos cayendo, Santa o renos pasando, más regalos,
eventos especiales semanales con premios especiales, gorritos, bordes de caramelo en los
botones, constelaciones y cápsulas con diseños y animaciones navideñas. Quedan
**prehechos y programados**: se encienden solos en su fecha, con unos días de
decoración antes.

Sigue lo ya decidido en `PLAN_CAPSULAS_Y_EVENTOS.md` §3 y `economy/PLAN_ECONOMIA.md` §7:
sin pase de batalla, cada evento trae su colección, nada da ventaja en partidas, todo se
puede hacer jugando ~15 minutos por día y lo que sobra se convierte en Chispas.

---

## 1. Qué es un tema (las 8 capas)

Cada festividad es un archivo de datos con estas capas. Ninguna es obligatoria: una
fecha chica (Día de Pi) usa 3; Navidad usa las 8.

| Capa | Qué cambia | Dónde se ve |
|---|---|---|
| **1. Ambiente** | Partículas que caen o suben por encima de todo, suaves y pocas (copos, hojas, pétalos, corazones, linternas, polvo de colores). Se apagan en Ajustes. | Web y app, todas las pantallas menos dentro de una partida |
| **2. Ciudades** | Una capa de adornos sobre las ciudades que ya existen: nieve en los techos, luces de colores, calabazas, papel picado, faroles. La ciudad debajo es la misma. | Tarjetas de mundos, Inicio, pantalla de carga, placa |
| **3. Pasantes** | Algo cruza el cielo cada tanto: el trineo de Santa con sus renos, una bruja en escoba, un dragón, un globo de corazón. Uno cada ~40 s, nunca en una partida. | Cielo de las ciudades y pantalla de carga |
| **4. Interfaz** | Color de acento, borde de los botones principales (caramelo rayado, rayas naranja y negro…), un accesorio sobre el avatar (gorro, sombrero de bruja, corona de flores) y un detalle en el logo. | Botones, avatar, encabezado |
| **5. Cápsulas** | Las cápsulas de la temporada se dibujan con la forma de la fecha (regalo con moño, calabaza, sobre rojo, huevo pintado) y al abrirse sueltan sus partículas. | Recompensas y apertura |
| **6. Constelaciones** | Las estrellas toman la forma y el color del tema (copos de nieve, faroles, corazones) y la celebración usa sus colores. | Constelaciones |
| **7. Evento** | Misiones semanales de la fecha que dan **Fichas del evento**; con ellas se elige qué pieza de la **colección** (8 piezas) llevarse; una **cápsula del evento**; a veces un mini juego (huevos escondidos, calendario de adviento). | Cartel en el Inicio, página del evento, tienda del evento |
| **8. Tienda** | Un puesto del Bazar con la colección y el **paquete del evento** (Cometas o US$2,99–4,99). Las colecciones vuelven el año siguiente: no hay apuro por perder algo para siempre. | Bazar (puesto del evento) |

**Fases de cada fecha:** *decoración* (unos días antes: ambiente, ciudades e interfaz, para
avisar que viene), *evento* (las 8 capas) y *cierre* (un día para canjear Fichas; las
que sobran pasan a Chispas).

**Respeto y alcance internacional.** Las fechas religiosas se tratan como fiestas de
luz y comunidad, sin símbolos sagrados. Los textos salen en español e inglés. Las
fechas que dependen de la luna se cargan por año y se confirman cada temporada.

---

## 2. Calendario del año

Las fechas móviles están calculadas para 2026–2028 (la Pascua se calcula sola; el resto
sale de una tabla que se revisa cada año).

| Festividad | Fechas (decoración → evento) | Escala | Ciudades protagonistas |
|---|---|---|---|
| **Halloween** · Noche de los esqueletos | 20 oct → 24 oct – 1 nov | Grande | Anatomía (esqueleto fosforescente), todas |
| **Día de Muertos** · La ofrenda | 30 oct → 1 – 2 nov | Media | Historia |
| **Diwali** · Fiesta de las luces | 2 días antes → 5 días (2026: 8 nov · 2027: 29 oct · 2028: 17 oct) | Media | Quimia (fuegos de colores), todas |
| **Viernes Estelar** (Black Friday) | — → 4 días desde el 4.º jueves de noviembre | Tienda | Bazar |
| **Navidad** · Navidad en las ciudades | 26 nov → 1 – 26 dic | Grande | Todas |
| **Año Nuevo** · Cuenta regresiva | 27 dic → 31 dic – 2 ene | Media | Numeria (reto de 2027 operaciones) |
| **Año Nuevo Lunar** · Faroles y dragones | 3 días antes → 7 días (2027: 6 feb · 2028: 26 ene) | Media | Geografía, Historia |
| **Amor y Amistad** (San Valentín) | 9 feb → 12 – 15 feb | Chica | Melodía, todas |
| **Carnaval** | 3 días antes → sáb a mar antes del Miércoles de Ceniza (2027: 6 – 9 feb · 2028: 26 – 29 feb) | Media | Melodía, Geografía |
| **Día de Pi** | — → 14 mar | Chica | Numeria, Trigonometría |
| **Holi** · Festival de colores | 2 días antes → 2 días (2027: 22 mar · 2028: 11 mar) | Chica | Quimia (colores), todas |
| **Pascua** · Huevos escondidos | 5 días antes → del Viernes al Lunes de Pascua (2027: 26 – 29 mar · 2028: 14 – 17 abr) | Media | Vitalia, todas |
| **Noches de linternas** (fin del Ramadán) | — → 3 días (2027: ~10 mar · 2028: ~27 feb, se confirma con la luna) | Chica | Estadística (fases de la luna), todas |
| **Día de la Tierra** | — → 22 abr | Chica | Vitalia, Geografía |
| **Día de la Música** | — → 21 jun | Chica | Melodía |
| **Vuelta a clases** | — → primera semana de septiembre (sur: primera de marzo) | Chica | Todas |

Si dos fechas se tocan (Halloween y Día de Muertos, Navidad y Año Nuevo), la segunda
toma el relevo el día que empieza; nunca hay dos temas encendidos a la vez.

---

## 3. Cada festividad, capa por capa

### Halloween · Noche de los esqueletos (la primera, 31 oct)
- **Ambiente:** hojas secas y algún murciélago que cruza; niebla baja violeta al pie de las ciudades.
- **Ciudades:** calabazas con cara encendida al pie de los edificios, ventanas naranjas, luna llena grande.
- **Pasantes:** una bruja en escoba; una bandada de murciélagos.
- **Interfaz:** acento naranja calabaza; borde de botones con rayas naranja y negro; sombrero de bruja sobre el avatar; el logo con una calabacita.
- **Cápsulas:** cápsula **calabaza** (mitades naranjas con tallo y cara que se ilumina al cargar); al abrir, murciélagos y caramelos.
- **Constelaciones:** estrellas naranjas; la constelación completa forma un **murciélago**.
- **Evento:** el esqueleto de Anatomía se vuelve fosforescente; misiones «Truco o trato» (3 por semana); cápsula del evento; colección: marco Calabaza, fondo Noche de luna, estela de Murciélagos, efecto Fuego fatuo, emote ¡Buu!, título «Cazafantasmas», sonido Órgano, marco animado Calabaza encendida.

### Día de Muertos · La ofrenda (1 – 2 nov)
- **Ambiente:** pétalos de cempasúchil que caen.
- **Ciudades:** papel picado de colores entre los edificios; velas en las ventanas.
- **Interfaz:** acento cempasúchil; corona de flores sobre el avatar.
- **Cápsulas:** cápsula con **papel picado** y pétalos al abrir.
- **Evento:** «La ofrenda»: cada día una pregunta de Historia sobre personajes que ya no están, con su dato; colección chica (marco Papel picado, fondo Ofrenda, título «Memoria viva»).

### Diwali · Fiesta de las luces
- **Ambiente:** chispas doradas que suben.
- **Ciudades:** **diyas** (lámparas de barro) encendidas en las ventanas y guirnaldas de luces.
- **Interfaz:** acento dorado; borde de botones con un patrón rangoli.
- **Cápsulas:** cápsula **diya**; al abrir, fuegos de colores (Quimia: el color de cada metal).
- **Evento:** «Enciende 100 lámparas»: cada acierto enciende una lámpara de la ciudad.

### Viernes Estelar (Black Friday)
- Solo **tienda**: el Bazar se viste de noche con estrellas; 4 días con descuentos reales en paquetes y Cometas (+bono), y una cápsula premium de regalo con la primera compra. Sin decoración en el resto de la app.

### Navidad · Navidad en las ciudades (1 – 26 dic)
- **Ambiente:** nieve suave en todas las pantallas (menos en partida).
- **Ciudades:** nieve en los techos, guirnaldas de luces que titilan, un árbol encendido en cada ciudad, muñecos de nieve en la carretera de la pantalla de carga.
- **Pasantes:** el **trineo de Santa con sus renos** cruzando la luna; a veces un reno solo saltando.
- **Interfaz:** acento rojo y verde; **bordes de caramelo** (rayas rojas y blancas) en los botones principales; **gorrito navideño** sobre el avatar; el logo con un pompón.
- **Cápsulas:** cápsula **regalo** (caja envuelta con moño que se desata al cargar); al abrir, copos y caramelos.
- **Constelaciones:** las estrellas son **copos**; la completa enciende una estrella sobre el árbol.
- **Evento:** **calendario de adviento** (1 – 24 dic: una casilla por día con un regalo; los domingos, una cápsula del evento); **4 eventos semanales** con premio especial (semana 1 «Taller de Santa»: misiones de Numeria; semana 2 «Guerra de bolas de nieve»: duelos; semana 3 «Coro de villancicos»: Melodía; semana 4 «Noche buena»: doble de todo); colección de 8 piezas (marco Caramelo, fondo Pueblo nevado, estela de Nieve, efecto Copos, emote ¡Jo jo jo!, título «Duende de Santa», sonido Cascabeles, marco animado Luces que titilan) y **paquete Navidad**.

### Año Nuevo · Cuenta regresiva (31 dic – 2 ene)
- **Ambiente:** confeti dorado.
- **Ciudades:** **fuegos artificiales** sobre las ciudades la noche del 31.
- **Interfaz:** gafas «2027» sobre el avatar; botones con brillo dorado.
- **Evento:** reto «2027 operaciones» entre toda la comunidad (barra compartida); a las 00:00 locales, una cápsula de regalo.

### Año Nuevo Lunar · Faroles y dragones
- **Ambiente:** faroles rojos que suben despacio.
- **Ciudades:** **faroles** colgados entre los edificios.
- **Pasantes:** un **dragón** que serpentea por el cielo.
- **Interfaz:** acento rojo y dorado; borde de botones con nubes doradas.
- **Cápsulas:** **sobre rojo** (hongbao) que se abre con monedas doradas.
- **Evento:** el animal del año como pieza de colección (2027: cabra · 2028: mono).

### Amor y Amistad · San Valentín (12 – 15 feb)
- **Ambiente:** corazones que suben.
- **Ciudades:** corazones en algunas ventanas.
- **Pasantes:** un **globo de corazón**.
- **Interfaz:** acento rosa; borde de botones con corazoncitos.
- **Cápsulas:** cápsula **corazón**.
- **Evento:** «Regala a un amigo»: los regalos a amigos dan doble y cuentan para una misión de la semana (premia la amistad, no la pareja).

### Carnaval
- **Ambiente:** confeti y serpentinas.
- **Ciudades:** serpentinas entre los edificios y máscaras en las ventanas.
- **Interfaz:** **antifaz** sobre el avatar; botones con rombos de colores.
- **Evento:** «Comparsa»: Melodía con ritmos de carnaval (samba, cumbia) y una tabla de puntaje del finde.

### Día de Pi (14 mar)
- **Interfaz:** el logo con un π.
- **Evento:** reto de Numeria y Trigonometría con 3,14 minutos de duración; título «Irracional».

### Holi · Festival de colores
- **Ambiente:** nubes de polvo de colores que se deshacen.
- **Ciudades:** las fachadas con manchas de colores.
- **Cápsulas:** al abrir, una explosión de polvo de colores.
- **Evento:** cada acierto tiñe tu ciudad de un color; al final del día, se comparte.

### Pascua · Huevos escondidos
- **Ambiente:** pétalos de primavera.
- **Ciudades:** **huevos pintados escondidos** en las ciudades: tocarlos los encuentra (uno por ciudad y por día).
- **Pasantes:** un conejo que cruza saltando por la carretera de la pantalla de carga.
- **Interfaz:** **orejas de conejo** sobre el avatar.
- **Cápsulas:** cápsula **huevo pintado** que se resquebraja.
- **Evento:** encontrar los 15 huevos de la semana da la pieza grande de la colección.

### Noches de linternas (fin del Ramadán)
- **Ambiente:** linternas que brillan arriba; luna creciente.
- **Ciudades:** linternas colgadas y estrellas.
- **Evento:** «Noches de luna»: Estadística con las fases de la luna; tono sereno, sin premios de apuro.

### Día de la Tierra (22 abr)
- **Ambiente:** hojas verdes.
- **Ciudades:** árboles y plantas en los techos.
- **Evento:** misión de Vitalia y Geografía: cada misión cumplida «planta» un árbol en una ciudad compartida.

### Día de la Música (21 jun)
- **Ambiente:** notas musicales que flotan.
- **Interfaz:** botones con pentagrama.
- **Evento:** Melodía al doble de Chispas y un sonido de acierto de regalo.

### Vuelta a clases (septiembre / marzo)
- **Interfaz:** lápiz detrás de la oreja del avatar.
- **Evento:** misiones más fáciles y premio doble por la racha durante una semana.

---

## 4. Cómo se construye (una vez, para todas)

1. **Motor de temas** (`src/lib/temas/`): el calendario de arriba en datos, una función
   `temaDeHoy(fecha)` que dice qué tema y en qué fase está, y la ficha de cada tema
   (colores, partículas, adornos, pasante, accesorio, cápsula, constelación, borde de
   botones). La usan la web y la app; se prueba con tests (cada fecha da el tema
   correcto, nunca dos a la vez, la Pascua de cada año, etc.).
2. **Capas visuales** web (canvas y SVG) y app (Skia), livianas: pocas partículas,
   brillos ya dibujados, nada dentro de las partidas, y un ajuste **«Decoración de
   temporada»** para apagarlas.
3. **Motor de eventos en la base** (`PLAN_CAPSULAS_Y_EVENTOS.md` §3.1): tabla `eventos`,
   Fichas del evento, misiones del evento, tienda del evento, cápsula del evento; el
   anuncio de cada evento se crea solo.
4. **Contenido de cada fecha**: colección en el catálogo, misiones, textos en español e
   inglés y su anuncio. Se cargan de antemano y se activan solos.

## 5. Orden

| Paso | Qué | Para cuándo |
|---|---|---|
| 1 | Motor de temas + capas visuales + ajuste para apagarlas | Ya |
| 2 | **Halloween** completo (las 8 capas) | Antes del 20 oct (decoración) / 24 oct (evento) |
| 3 | Día de Muertos y Diwali | Antes del 30 oct |
| 4 | Viernes Estelar, **Navidad** completa y Año Nuevo | Antes del 26 nov |
| 5 | El resto (Año Nuevo Lunar → Vuelta a clases), prehechos y programados | Antes de enero |
