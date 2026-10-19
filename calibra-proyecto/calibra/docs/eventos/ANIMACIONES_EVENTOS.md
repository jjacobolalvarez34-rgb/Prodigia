# Animaciones de apertura de los eventos

Pedido del usuario (2026-10-18): cada evento abre con una **animación cinematográfica de
alta gama**. Es un **video ya renderizado** (no se dibuja en el momento), profesional y
dinámico, que dé emoción.

## Reglas para todos los videos

1. **Texto que no parezca «de IA».**
   - Nada de degradés violeta-azul en las letras, ni neón genérico, ni emojis ni destellos.
   - Buena tipografía y color sobrio (marfil, hueso, dorado o el color de la fecha).
   - El color de la fecha va solo en luces y acentos.
2. **Nada aparece forzado** (regla del 2026-10-19). Cada elemento importante entra con su
   propia animación: llega, se acomoda y recién ahí reacciona (se enciende, brilla…).
3. **Cola de 5 s animada** (regla del 2026-10-19). Después del cuadro final hay unos 5 s
   más sobre esa imagen, animada en modo fondo de pantalla:
   - loop sutil (estrellas, niebla, llamas, personajes que siguen moviéndose suave);
   - texto y logo fijos;
   - audio de ambiente que se apaga en los últimos 1,5 s.

   El video dura unos 15 s (10 de historia + 5 de cola) y la app hace el fundido desde ahí.
4. **Continuidad.** Siempre es la misma ciudad de Prodigia: los tres planos de skyline del
   video de la Alineación, con los adornos de la fecha (`ciudad` en src/lib/temas/temas.ts).
5. **Audio.**
   - Sintetizado propio, sin licencias de terceros.
   - Cada golpe visual tiene su sonido.
   - Mezcla sobria, sin saturar.
6. **Peso.** El vertical (app) pesa ≤ 4 MB, en H.264 a 30 fps con AAC.

## Cómo se muestra

- **Si el evento empieza mientras la app está abierta:** el video entra con un fundido a
  pantalla completa sobre lo que estés viendo. Dentro de una partida espera a que termine.
- **Si abres la app durante el evento y todavía no lo viste:** en lugar del menú se abre el
  video. Al terminar hace fundido a la interfaz.
- **Una sola vez por edición y por dispositivo:** se guarda «visto». Se puede volver a ver
  desde el cartel del evento («Ver el video del evento») o desde el de la Alineación.
- **Se puede saltar con un toque** a partir de 1 s, para que no se salte sin querer.
  En la web también con Esc; en Android con el botón atrás.
- **Sonido:** respeta el ajuste de sonido. En la web, si el navegador no deja empezar con
  sonido, arranca en silencio con un botón «Activar sonido».
- **Código:**
  - Cuál toca en cada momento lo decide `videoAperturaActual` en src/lib/temas/videosApertura.ts:
    la Alineación durante sus 3 h; si no, el evento abierto si su fiesta tiene video.
  - El reproductor de la web es src/components/VideoApertura.tsx.
  - El de la app es mobile/src/ui/VideoApertura.tsx.
- **Para sumar el video de una fiesta:**
  1. Agregarla en `VIDEO_DE_TEMA` (videosApertura.ts).
  2. Agregar su `require` en `VIDEOS` (VideoApertura.tsx de la app).
  3. Poner los archivos:
     - app: `mobile/assets/videos/<archivo>.mp4` (vertical 1080×1920);
     - web: `calibra/public/videos/<archivo>.mp4` (1920×1080), `<archivo>-vertical.mp4` y los
       pósters `<archivo>-poster.jpg` y `<archivo>-vertical-poster.jpg`.
- **Cómo se hacen:**
  - Con HyperFrames: canvas dibujado a mano y controlado por el tiempo, con GSAP y fuentes
    locales.
  - El proyecto de cada video queda en `D:\Repositorios\prodigia-marketing\videos\<evento>\`.
  - Antes de renderizar se aprueban 6 a 8 cuadros clave.
- **Ojo con las fechas:** el video va dentro del APK. Tiene que estar en una versión
  publicada antes de que empiece el evento; en la web basta con subirlo.

## Hechos

| Evento | Estado |
| --- | --- |
| Gran Alineación (cada 28 días, la primera el 24/10/2026 18:00 Colombia) | Aprobado el 2026-10-18. En la web y la app desde la 0.6.1. Se le agrega la cola de 5 s. |
| Halloween · Noche de los esqueletos (24/10 21:00 → 31/10) | Cuadros aprobados el 2026-10-19. La calabaza grande ahora entra y se enciende con su animación. Con la cola de 5 s. Va en la 0.6.2. |

## Planeados, en orden de fecha (no se hacen hasta que el usuario lo pida)

Cada guion dura 10 s más la cola de 5 s. Los tiempos son aproximados.

### 1. Día de Muertos · «La ofrenda» (1–2 nov) — ⚠️ el próximo: tiene que estar en un APK antes del 1/11

- **Paleta:** noche azul profundo; naranja cempasúchil #FF9F1C y rosa mexicano #FF5D8F en
  luces y papel; blanco hueso para el texto.
- **Tipografía:** título en una romana con serifas cálida (Cormorant SC o similar), línea en
  cursiva.
- **Guion:**
  - **0–1,5 s:** la ciudad de noche, quieta. Una sola vela se enciende en primer plano, con
    su chispa y su llama que respira.
  - **1,5–3,5 s:** de esa vela nace un camino de pétalos de cempasúchil que avanza hacia la
    ciudad. A su paso se encienden velas en fila, de cerca hacia lejos, con desenfoque de
    profundidad.
  - **3,5–5 s:** el papel picado se despliega entre los techos, de izquierda a derecha.
    Cuelga, se mece con el viento y su luz se cuela entre los recortes.
  - **5–6,5 s:** la cámara sube hasta la ofrenda en el techo más alto: escalones con velas,
    flores y fotos sin rostro (marcos con luz). Una calaverita de azúcar con el logo de
    Prodigia en la frente sonríe.
  - **6,5–8,5 s:** título «LA OFRENDA» y la línea «Día de Muertos en las 15 ciudades».
  - **8,5–10 s:** la fila de datos y el logo.
- **Cola:** las velas titilan, los pétalos caen lentos y el papel picado se mece.
- **Audio:** guitarra pulsada suave (sintetizada), campanitas, un soplo de viento; cada vela
  suena como un tic cálido.
- **Datos de la fila:** según lo que tenga el evento. Hoy Muertos no tiene colección:
  definirlo antes de hacer el video. Si no hay colección, poner «2 días» y lo que se gane.

### 2. Diwali · «Fiesta de las luces» (8–12 nov)

- **Paleta:** índigo de noche; dorado #FFC53D y rosa #FF5D8F en las luces; marfil para el
  texto.
- **Guion:**
  - **0–2 s:** la ciudad a oscuras, sin ninguna ventana encendida. Una mano de luz enciende
    la primera diya (lámpara de barro) en un balcón de abajo.
  - **2–4,5 s:** las diyas se encienden de balcón en balcón, de abajo hacia arriba, como una
    ola que trepa los edificios. Las ventanas se van prendiendo detrás.
  - **4,5–6 s:** guirnaldas de luces cruzan entre los techos. Un patrón de rangoli (mandala
    de colores) se dibuja en el suelo del primer plano, trazo a trazo.
  - **6–7,5 s:** fuegos artificiales dorados sincronizados abren el cielo, y su reflejo cae
    en la ciudad.
  - **7,5–10 s:** título «FIESTA DE LAS LUCES», la línea y el logo.
- **Cola:** las diyas titilan, cae alguna chispa lejana y el rangoli brilla suave.
- **Audio:** sitar o tambura sintetizada (drone), una campanita por diya y el estallido
  grave de los fuegos.

### 3. Viernes Estelar (fin de noviembre; evento de la tienda)

- **Paleta:** azul noche; cian #5DE4FF y dorado #FFC53D; marfil para el texto.
- **Guion:**
  - **0–2 s:** el cielo de la ciudad, quieto. Cae una estrella fugaz y deja una estela.
  - **2–4,5 s:** una lluvia de estrellas fugaces cae hacia los puestos del Bazar (la calle de
    la tienda). Al tocar los toldos, los encienden uno por uno.
  - **4,5–6,5 s:** cada estrella que cae se convierte en una etiqueta de precio que gira y
    muestra el descuento (−20 %, −35 %…). Los números ruedan como en un contador mecánico.
  - **6,5–8,5 s:** título «VIERNES ESTELAR» y «Ofertas en el Bazar», con el reloj del tiempo
    que queda.
  - **8,5–10 s:** fila de datos (las ofertas reales) y logo.
- **Cola:** los toldos se mecen y cae alguna estrella lejana.
- **Audio:** campanitas brillantes, un «clac» de contador mecánico y un pulso alegre de
  fondo.

### 4. Navidad en las ciudades (1–26 dic)

- **Paleta:** azul nieve nocturno; rojo profundo #E63946 y verde #2A9D5C solo en luces y
  adornos; blanco para el texto.
- **Tipografía:** título en serifa clásica (como un libro de cuentos), línea en cursiva.
- **Guion:**
  - **0–2 s:** nevada lenta sobre la ciudad dormida, con copos en tres profundidades. La
    nieve se acumula en los techos.
  - **2–4 s:** las luces de los techos se encienden en cadena por toda la ciudad, de un
    extremo al otro, con un «tin» por tramo.
  - **4–5,5 s:** en la plaza, el árbol grande recibe su estrella de arriba hacia abajo y se
    ilumina por anillos.
  - **5,5–7 s:** el trineo cruza frente a la luna dejando una estela de nieve brillante. Los
    renos de silueta tienen trote animado.
  - **7–10 s:** título «NAVIDAD EN LAS CIUDADES», la fila (lo que traiga el evento) y el
    logo.
- **Cola:** nevada suave, luces que respiran y alguna ventana que se apaga y se prende.
- **Audio:** campanas de trineo, celesta (caja de música) con un villancico propio (melodía
  original, no una conocida) y viento suave.

### 5. Año Nuevo · «Cuenta regresiva» (31 dic – 2 ene)

- **Paleta:** noche negra-azul; dorado #FFC53D y lila #A794FF solo en los fuegos; marfil
  para el texto.
- **Guion:**
  - **0–1 s:** el skyline de noche y silencio; la ciudad entera mira al cielo.
  - **1–4 s:** la cuenta regresiva 3-2-1 gigante sobre el skyline. Cada número se arma con
    las luces de las ventanas de los edificios (como un tablero) y late con un pulso grave.
  - **4–6,5 s:** en el «0», todos los fuegos artificiales a la vez, sincronizados en
    oleadas, con desenfoque y humo realista.
  - **6,5–8,5 s:** el año nuevo («2027») se escribe con chispas que se quedan suspendidas;
    llueve confeti en primer plano.
  - **8,5–10 s:** título «¡FELIZ AÑO NUEVO!» y el logo.
- **Cola:** fuegos lejanos de vez en cuando, confeti que cae lento y el año que brilla suave.
- **Audio:** tic-tac de reloj, golpe en cada número, estallidos con eco y vítores lejanos
  sintetizados.

### 6. Año Nuevo Lunar · «Faroles y dragones» (enero–febrero)

- **Paleta:** noche roja muy oscura; rojo #E63946 y dorado #FFC53D; marfil para el texto.
- **Guion:**
  - **0–2 s:** faroles rojos se encienden en las calles y empiezan a subir despacio.
  - **2–5 s:** el dragón de papel serpentea entre los edificios, cerca de la cámara, con
    cuerpo segmentado, bigotes que flotan y escamas que reflejan los faroles.
  - **5–6,5 s:** el dragón se enrosca alrededor de la torre más alta y ruge con una
    bocanada de chispas doradas.
  - **6,5–10 s:** título «AÑO NUEVO LUNAR», el animal del año en dorado y el logo.
- **Cola:** faroles que suben lentos y el dragón respira enroscado en la torre.
- **Audio:** tambores y platillos sintetizados, gong al rugido y flauta.

### 7. Carnaval (febrero)

- **Paleta:** noche violeta muy oscura (solo de fondo); verde #3DDC97 y dorado #FFC53D más
  ráfagas de color; marfil para el texto.
- **Guion (ritmo rápido, cortes al compás):**
  - **0–1,5 s:** silencio y un redoble; una máscara de carnaval cae girando hacia la cámara.
  - **1,5–4,5 s:** ráfagas de serpentinas y confeti de colores salen de los techos en cada
    golpe de tambor. La cámara salta entre tres planos de la ciudad.
  - **4,5–6,5 s:** las máscaras giran y se acomodan en fila sobre la calle, como un desfile.
  - **6,5–10 s:** título «¡CARNAVAL!» con letras que rebotan al ritmo, y el logo.
- **Cola:** serpentinas que se mecen y confeti que cae lento.
- **Audio:** batucada sintetizada, silbato y platillos.

### 8. Amor y amistad (12–15 feb)

- **Paleta:** azul noche suave; rosa sobrio #FF5D8F y rosa claro #FFB3C7; marfil para el
  texto.
- **Guion:**
  - **0–2,5 s:** globos de corazón suben desde los balcones, de a uno, con sus cuerdas que
    se mecen.
  - **2,5–5 s:** en el cielo, dos constelaciones (dos figuras de estrellas, como las de la
    app) se buscan y sus líneas se unen formando un corazón.
  - **5–6,5 s:** el corazón late una vez y suelta un anillo de luz que recorre la ciudad.
  - **6,5–10 s:** título «AMOR Y AMISTAD», «Regala a tus amigos» y el logo.
- **Cola:** globos que flotan lentos y el corazón de estrellas que respira.
- **Audio:** piano suave y cálido, con una nota por estrella que se une.

### 9. Día de Pi (14 mar)

- **Paleta:** pizarra verde muy oscura; trazos de tiza blanco hueso; lila #9B85FF y cian
  #5DE4FF de acento.
- **Guion:**
  - **0–3 s:** los dígitos de π (3,14159…) se escriben en tiza, en espiral.
  - **3–5,5 s:** la espiral se cierra en un círculo perfecto; el radio y la fórmula 2πr se
    trazan solos.
  - **5,5–7 s:** el círculo rueda una vuelta y deja una línea de longitud 2πr medida con una
    regla de tiza.
  - **7–10 s:** título «DÍA DE PI», «3,14 minutos de reto» y el logo.
- **Cola:** polvo de tiza que flota y el círculo que gira muy lento.
- **Audio:** tiza en pizarra, un tic por dígito y una nota limpia al cerrarse el círculo.

### 10. Noches de linternas (febrero–marzo)

- **Paleta:** índigo profundo; dorado #FFC53D y verde #3DDC97 muy sobrio; marfil para el
  texto.
- **Guion:**
  - **0–2,5 s:** la luna creciente sobre la ciudad; una linterna de papel se enciende en un
    techo.
  - **2,5–6 s:** cientos de linternas se sueltan y suben lentas en tres profundidades. Su
    reflejo se ve en el río o en la plaza.
  - **6–7,5 s:** las linternas forman un camino hacia la luna.
  - **7,5–10 s:** título «NOCHES DE LINTERNAS» y el logo.
- **Cola:** linternas que siguen subiendo lentas.
- **Audio:** cuerdas suaves, viento y una campanita lejana.

### 11. Holi · «Festival de colores» (marzo)

- **Paleta:** fondo claro de atardecer; polvo rosa #FF5D8F, amarillo, verde #3DDC97, cian y
  lila; texto en marfil con sombra oscura.
- **Guion:**
  - **0–1,5 s:** la ciudad blanca, sin color, a pleno sol.
  - **1,5–5 s:** nubes de polvo de colores estallan en cámara lenta desde los techos, se
    mezclan en el aire y tiñen los edificios donde caen.
  - **5–7 s:** el último estallido llena la pantalla de color y se disipa, dejando la
    ciudad pintada.
  - **7–10 s:** título «FESTIVAL DE COLORES» y el logo.
- **Cola:** polvo flotando y partículas de color que bajan.
- **Audio:** tambores dhol sintetizados y un «puf» grave en cada estallido.

### 12. Pascua · «Huevos escondidos» (marzo–abril)

- **Paleta:** mañana de primavera; celeste #9BE7FF y rosa #FFB3C7 en pastel; texto oscuro
  cálido.
- **Guion:**
  - **0–2 s:** amanece sobre la ciudad con plantas en los techos; un huevo decorado asoma
    entre las hojas.
  - **2–4,5 s:** el conejo cruza saltando de techo en techo; donde pisa aparecen huevos
    escondidos.
  - **4,5–6,5 s:** los huevos ruedan, se detienen y se abren dejando salir luz suave.
  - **6,5–10 s:** título «HUEVOS ESCONDIDOS», «Encuentra los huevos» y el logo.
- **Cola:** hojas que se mecen y algún huevo que se balancea.
- **Audio:** pájaros, xilófono alegre y un «pop» en cada huevo.

### 13. Día de la Tierra (22 abr)

- **Paleta:** amanecer verde-dorado; verde #3DDC97 y cian #5DE4FF; texto marfil.
- **Guion:**
  - **0–2 s:** la ciudad gris; una semilla cae en un techo.
  - **2–5,5 s:** brota y en cadena crecen enredaderas y árboles sobre todos los techos,
    cubriendo la ciudad de verde (timelapse).
  - **5,5–7 s:** pájaros salen de los árboles y el cielo se aclara.
  - **7–10 s:** título «DÍA DE LA TIERRA», «Planta árboles jugando» y el logo.
- **Cola:** hojas que se mueven con el viento y pájaros lejanos.
- **Audio:** crecimiento (cuerdas que suben), pájaros y viento en las hojas.

### 14. Día de la Música (21 jun)

- **Paleta:** noche; dorado #FFC53D y lila #A794FF; marfil para el texto.
- **Guion:**
  - **0–2 s:** la ciudad a oscuras; suena la primera nota.
  - **2–6 s:** las ventanas de los edificios se encienden al ritmo de una melodía propia,
    como un ecualizador gigante; cada edificio es una barra.
  - **6–7,5 s:** las notas salen de las ventanas y forman un pentagrama en el cielo.
  - **7,5–10 s:** título «DÍA DE LA MÚSICA», «Melodía al doble» y el logo.
- **Cola:** las ventanas siguen latiendo suave al ritmo.
- **Audio:** una melodía original corta (piano y bajo) sincronizada con las ventanas.

### 15. Vuelta a clases (1–7 sep)

- **Paleta:** mañana clara; cian #5DE4FF y dorado #FFC53D; tiza blanca.
- **Guion:**
  - **0–2 s:** una pizarra en primer plano y la ciudad detrás.
  - **2–5 s:** útiles escolares (lápiz, regla, compás, libros) vuelan desde las ventanas y
    se ordenan en el aire formando el logo de Prodigia.
  - **5–7 s:** el título se escribe en tiza: «VUELTA A CLASES».
  - **7–10 s:** «Misiones más fáciles esta semana» y el logo.
- **Cola:** polvo de tiza y una hoja que cae.
- **Audio:** campana de escuela, lápiz que escribe y un ritmo alegre.

## Pendiente de decidir con el usuario

- **Muertos, Diwali y las demás no tienen colección todavía.** Solo Halloween la tiene. La
  fila de datos de cada video depende de qué traiga el evento; definirlo antes de hacer
  cada uno.
- **Peso del APK.** Cada video agrega unos 4 MB. Con más de 4 o 5 videos conviene bajarlos
  bajo demanda (desde Supabase Storage) en vez de meterlos en el APK.
