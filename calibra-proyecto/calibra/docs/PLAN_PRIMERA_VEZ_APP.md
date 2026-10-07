# Plan: la primera vez en la app de Prodigia

> **Estado: APROBADO (las 8 decisiones, 2026-10-07) e IMPLEMENTADO.** Migraciones 0258 (Kit del Pionero), 0259 (Constelaciones y Gran Alineación) y 0260 (Primeros pasos).
> Diferencias con lo propuesto: el premio final de «Primeros pasos» es 500 Chispas y el título «Bien encaminado» (el marco «Pionero» ya lo da el Kit); las cápsulas diaria y de ciudad también pasaron a estrellas (la de colección se queda); justo después de cada Gran Alineación hay unas horas en que ninguna ciudad está de noche (todas acaban de amanecer). Google necesita que se active el proveedor en Supabase y `prodigia://auth` en Redirect URLs.
> **Cambio del 7 de octubre de 2026 (tras probar el APK):** la entrada ya no exige cuenta antes de jugar; copia la web. «¿Ya conoces Prodigia?» → presentación animada de 4 escenas → elegir una ciudad misteriosa → cómo funciona → partida de prueba como invitado (5 preguntas, 30 s) → resultado → Prodigia Pro → elegir los 2 mundos → crear la cuenta (la cuenta de invitado pasa a ser real; los mundos se guardan recién ahí) → Kit del Pionero → recorrido (ahora empieza por las Chispas, que abren la tienda, y la racha). En el Inicio, «Jugar» va arriba y «Primeros pasos» y Recompensas son botones chicos.
> Fecha: 6 de octubre de 2026.
> Incluye: (1) el paso a paso desde que se abre la app por primera vez, con el tutorial; (2) cuenta obligatoria (sin modo invitado); (3) recompensa por usar la app; (4) rediseño de las cápsulas; (5) la Gran Alineación como evento.
> Al final hay una lista de **decisiones** con mi recomendación en cada una.

---

## 0. Cómo está hoy (lo que encontré)

- La app abre con la intro de Mamut, la pantalla de carga y, desde hoy, los **Términos** (aceptación obligatoria).
- Después va directo al **login**: correo o usuario y contraseña, o **«Entrar como invitado»**.
- **En la app no se puede crear una cuenta.** El login dice «Créala en la web de Prodigia y entra acá». Para alguien que descargó la app de la Play Store, eso es un muro: la mayoría se va o entra como invitado.
- Con sesión: se eligen los 2 mundos gratis y se cae en Inicio, **sin ninguna explicación**. Todo lo demás (duelos, cápsulas, misiones, Rankeds, tienda, clanes) hay que descubrirlo solo.
- El diagnóstico de cada mundo existe, pero aparece recién al entrar al mundo.

**Problema central:** la app tiene muchísimo (13 mundos, duelos en vivo, Rankeds, liga, clanes, chat, cápsulas, misiones, calendario, tienda, logros, Aprender con Técnicas y Clases, día y noche de las ciudades), y nadie se lo cuenta al jugador nuevo.

---

## 1. Principios del tutorial

1. **Se aprende jugando, no leyendo.** Cada explicación va pegada a una acción real (tocar, jugar, reclamar). Nada de pantallas de texto largas.
2. **Poco a poco.** El primer día se enseña lo básico (jugar, racha, Chispas). Lo demás (duelos, clanes, tienda, cápsulas) se va mostrando cuando el jugador llega ahí o en los días siguientes, con una lista de «Primeros pasos» que da premios.
3. **Siempre se puede saltar y siempre se puede repetir** (Ajustes → «Ver el tutorial otra vez»).
4. **Primero la emoción, después el formulario.** Antes de pedir la cuenta, el jugador ve qué es Prodigia y responde una pregunta de verdad.
5. **Español neutro, frases cortas, un dato por pantalla.**

---

## 2. Paso a paso desde el primer segundo

Duración estimada hasta la primera partida: **unos 2 minutos**. Hasta terminar el recorrido completo: **unos 4 minutos** (o menos, saltando).

### Paso 1 · Intro de Mamut (4 s) y carga
Igual que hoy. *(Arreglado hoy: ya no suena nada mientras está el logo de Mamut.)*

### Paso 2 · Términos y privacidad
Ya está hecho: resumen en 4 puntos, enlaces a los textos completos, casilla obligatoria y botón «Aceptar y continuar».

### Paso 3 · Bienvenida animada (3 pantallas que se deslizan)
Fondo: el skyline de la ciudad con el ciclo de día y noche de verdad.

1. **«13 ciudades, 13 formas de pensar.»** Las ciudades se encienden una por una de izquierda a derecha, cada una con su color y su glifo (÷ ? ◎ ⚛ ♥ ♪ θ ⌛ ∫ Ω σ ♠ </>).
2. **«Partidas de 60 segundos que se adaptan a ti.»** Un temporizador que corre; aciertas, sube el nivel; fallas, baja. Texto chico: «Fallar no te quita nada».
3. **«Compite en vivo, sube de Bronce a Prodigio.»** Dos placas chocan como en la pantalla VS; las 6 insignias de rango aparecen una tras otra.

Botón «Saltar» siempre visible arriba a la derecha.

### Paso 4 · «Pruébalo ahora» (sin cuenta, 1 pregunta)
Una sola pregunta real de Numeria con el temporizador del sprint (por ejemplo, 7 × 8). Al responder suena el acierto y salta el combo.
- Si acierta: «¡Así se juega! Crea tu cuenta para guardar esto».
- Si falla: «Casi. La próxima vez te tocará una más fácil: así funciona Prodigia».
No se guarda nada: es solo para que sienta el juego antes del formulario.

### Paso 5 · Crear cuenta (obligatorio)
Pantalla «Guarda tu progreso»:
- **Botón grande: «Continuar con Google».** Es lo más rápido en Android: un toque, sin contraseña.
- Debajo: «Crear cuenta con correo» (correo y contraseña, con confirmación por correo como en la web).
- Abajo: «Ya tengo cuenta → Iniciar sesión».
- **Se elimina «Entrar como invitado».**
- Texto de venta, corto: «Con tu cuenta guardas tu racha, compites en duelos y te llevamos tu progreso a la web. Además, por estrenar la app te llevas un regalo de bienvenida 🎁».

### Paso 6 · Tu nombre y tu edad
- **Nombre de usuario** (único, con el filtro de palabras que ya existe).
- **Fecha de nacimiento**: hace falta para las reglas del chat de los menores y para Google Play. Texto: «Solo la usamos para cuidar el chat. No es pública».
- Si es menor de 13: aviso de que debe usar Prodigia con permiso de su familia, y el chat queda en modo frases rápidas (como ya funciona).

### Paso 7 · Tus 2 ciudades gratis
La pantalla de elegir mundos que ya existe, mejorada: se ve cada ciudad con su skyline animado y una frase de qué se practica. Se eligen 2 y se ve que las demás se desbloquean con Chispas.

### Paso 8 · Primera partida guiada
Se juega el sprint real del primer mundo elegido, con globos de ayuda que aparecen **una sola vez**:
1. Al empezar: «Tienes 60 segundos. Responde lo más rápido que puedas».
2. Al primer acierto: «Cada acierto seguido suma segundos ⏱️».
3. Al tercer acierto seguido: «¡Racha de 3! Subiste de nivel en este tema».
4. Al primer error: «Fallar no te quita nada. Bajas un poquito para afianzar».

El diagnóstico del mundo se ofrece **después**, no antes: primero tiene que divertirse.

### Paso 9 · Resultado y regalo de bienvenida
La pantalla de resultado de siempre, con tres explicaciones animadas (una por vez):
- **Experiencia**: «Sube tu nivel de cuenta y el de esta ciudad».
- **Chispas**: «La moneda del juego: con ella desbloqueas ciudades y cosas de la tienda».
- **Racha 🔥**: «Juega cada día para que crezca. Mañana vale más».

Después se abre el **regalo de bienvenida** (sección 4).

### Paso 10 · Recorrido por las 5 pestañas (señalando, no explicando)
Una luz recorre la barra de abajo. En cada pestaña, un globo de una línea y el botón «Siguiente»:
1. **Inicio**: «Tu día: reto diario, misiones y tu racha».
2. **Mundos**: «Tus 13 ciudades. Cada una tiene su propio día y su propia noche».
3. **Competir**: «Duelos en vivo, Rankeds y la liga de la semana».
4. **Social**: «Amigos, clanes y chat».
5. **Perfil**: «Tu placa, logros, tienda y estadísticas».

### Paso 11 · Avisos
La pantalla de permisos de notificaciones que ya existe, explicando para qué sirven («Te avisamos cuando un amigo te reta a un duelo»), sin avisos de noche.

### Paso 12 · «Primeros pasos» (los días siguientes)
En Inicio aparece una tarjeta con una lista de 8 tareas. Cada una enseña algo y da un premio pequeño. Al completar todas, se da un premio grande (el marco «Pionero»):

| Tarea | Enseña | Premio |
|---|---|---|
| Juega el reto diario | Retos iguales para todos | 50 Chispas |
| Completa una Técnica en Aprender | Técnicas y Clases | 50 Chispas |
| Agrega un amigo | Social | 50 Chispas |
| Reta a un amigo a un duelo | Duelos en vivo | 100 Chispas |
| Completa las misiones del día | Misiones | 100 Chispas |
| Abre tu primera cápsula | Cápsulas | 1 hielo |
| Personaliza tu placa | Tienda y placa | 100 Chispas |
| Mantén una racha de 3 días | Constancia | 200 Chispas |

Cuando alguien entra por primera vez a una sección (por ejemplo, Rankeds o Clanes), aparece **una sola vez** un globo de 1 o 2 líneas explicando qué es.

### Cuentas que ya existían
Quien inicia sesión con una cuenta de la web que ya tiene progreso **no ve el tutorial completo**. Ve solo el recorrido corto por las pestañas (Paso 10) y recibe igual el regalo por usar la app.

---

## 3. Cuenta obligatoria (adiós al modo invitado)

- **Se quita el botón «Entrar como invitado» de la app.** La web puede mantener sus demos sin cuenta, porque es la puerta de entrada desde los anuncios.
- **Los invitados que ya existen en la app** ven, al abrirla, la pantalla «Guarda tu progreso». Su cuenta de invitado se convierte en cuenta real conservando todo, igual que `ConvertirCuenta` en la web.
- **Para que crear la cuenta no dé pereza**: Google en un toque, el regalo de bienvenida y el texto de lo que se pierde sin cuenta (racha, duelos, progreso en la web).
- **Hace falta construir**:
  - Registro dentro de la app con correo, y con Google, que requiere configurar Google en Supabase.
  - Conversión de invitado a cuenta en la app.
  - Pantalla de nombre y fecha de nacimiento.

---

## 4. Recompensa por usar la app

**«Kit del Pionero»**, una sola vez por cuenta, la primera vez que inicia sesión en la app:
- **1.000 Chispas.**
- **El marco de placa «Pionero de la app»**: exclusivo, solo se consigue así, con un borde animado en los colores de las 13 ciudades.
- **1 cápsula** (o, si se aprueba la sección 5, la primera constelación ya empezada).
- **El título «Pionero»** para mostrar en la placa.

Se entrega con una animación: la caja se abre, las 13 luces de las ciudades vuelan hacia la placa y aparece el marco puesto.

**Cómo se controla:** una función del servidor (`reclamar_kit_app`) que se puede reclamar una sola vez por cuenta y que se llama desde la app. Es un premio de una sola vez y de valor moderado, así que no hace falta más control.

**Para que sea «justo» con quien ya jugaba en la web:** también lo recibe, una vez, al entrar por primera vez a la app.

---

## 5. Cápsulas: qué pasó y propuesta nueva

### Por qué te llegaron de los 3 tipos de una
La primera vez que se revisan las recompensas, el servidor reparte **todo lo que ya ganaste antes**:
- la cápsula diaria;
- una de nivel por cada uno de tus últimos 5 niveles;
- una de ciudad por cada 10 niveles en cada mundo;
- una por cada ciudad con todas sus Técnicas completas;
- la de liga de la semana pasada.

Para alguien que ya venía jugando, son muchas cápsulas de golpe, sin explicación, y sin saber de dónde salió cada una.

Además, hoy hay **10 tipos de cápsula** (diaria, misiones, racha, nivel, ciudad, liga, liga bronce, plata y oro, colección). Es demasiado para entenderlo.

### Propuesta: **Constelaciones** (en vez de cajas)
Algo propio de Prodigia: aprovecha el cielo de cada ciudad y el ciclo de día y noche nuevo.

- **Cada ciudad tiene una constelación en su cielo** con la forma de su glifo (÷ en Numeria, ♪ en Melodía, </> en Codia…).
- **Cada partida enciende estrellas** en la constelación de esa ciudad: 1 estrella por partida terminada y +1 si la precisión fue del 80 % o más.
- Una constelación tiene **7 estrellas**. Cuando se completa, **se dibuja sola en el cielo de la ciudad** (las estrellas se unen con líneas de luz) y suelta su premio.
- **El premio se ve desde antes**: cada constelación muestra qué da al completarse (por ejemplo, «300 Chispas y una pieza de la colección de Melodía»). Nada de sorpresa engañosa.
- **El toque de suerte, honesto**: al completar una constelación puede cruzar una **estrella fugaz** con un premio extra. La probabilidad se muestra («1 de cada 5 veces»), como ya se hace con las cápsulas.
- **De noche brilla más**: si completas una constelación mientras en esa ciudad es de noche, el premio sube un 20 %. Le da sentido al día y la noche y no castiga a nadie (siempre hay alguna ciudad de noche).
- **La Gran Alineación** (cada 28 días): ese día todas las constelaciones dan premio doble.

**Qué pasa con lo de hoy:**
- Las cápsulas de racha, nivel y liga **se reemplazan por estrellas extra** (por ejemplo, subir de nivel enciende 3 estrellas en tu ciudad favorita).
- Las cápsulas que ya tienes sin abrir **se pueden abrir igual**: no se pierde nada.

**Por qué es mejor que los cofres:**
- No es «abrir cajas»: es dibujar en el cielo de tu ciudad. Es visual, propio y se entiende de un vistazo.
- Premia **jugar**, no esperar timers.
- Es transparente: el premio se ve antes y la suerte está acotada y a la vista. Eso también es más seguro frente a las reglas de Google Play sobre «cajas de botín».

---

## 6. La Gran Alineación (evento cada 28 días)

**Ya está hecho (hoy):**
- Cada ciudad tiene su propio largo de día, de 12 h (Codia) a 112 h (Historia).
- Cada 28 días exactos las 13 amanecen juntas. La primera es el **sábado 24 de octubre de 2026 a las 18:00 (hora de Colombia)**.
- Durante 3 horas el sol sale dorado con un anillo y Mundos lo anuncia; los demás días dice cuánto falta.

**Propuesta de qué se gana** (para aprobar):
- **Experiencia doble** en todas las ciudades durante las 3 horas.
- **Constelaciones con premio doble** (si se aprueba la sección 5).
- **Logro «Testigo de la Alineación»** por jugar al menos una partida durante el evento.
- **Aviso** el día anterior y 10 minutos antes (avisos de «Novedades», nunca de noche).

---

## 7. Decisiones para que apruebes

| # | Decisión | Mi recomendación |
|---|---|---|
| 1 | ¿Se aprueba el paso a paso de la sección 2 tal como está? | Sí, con los cambios que quieras |
| 2 | ¿Una pregunta de prueba antes de crear la cuenta (Paso 4)? | Sí: sube mucho las cuentas creadas |
| 3 | ¿Registro con Google en la app? | Sí (hay que configurarlo en Supabase y Google Cloud) |
| 4 | ¿Quitar «Entrar como invitado» de la app? | Sí, y convertir a los invitados que ya existen |
| 5 | ¿Kit del Pionero: 1.000 Chispas, marco y título exclusivos? | Sí |
| 6 | ¿Reemplazar las cápsulas por Constelaciones? | Sí, conservando las cápsulas que ya tiene cada uno |
| 7 | ¿Premios de la Gran Alineación (Exp doble 3 h, logro, avisos)? | Sí |
| 8 | ¿Lista de «Primeros pasos» con premios? | Sí |
