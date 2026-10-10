# Prodigia — ficha completa (para la página de presentación)

Hecha el 2026-10-10 leyendo el código de ese día (web `calibra/` y app `mobile/`), no los
documentos viejos. Sirve para armar la página de presentación. Cada cosa dice si **ya
funciona**, si está **programada pero apagada** o si es **un plan**. En la página
pública no conviene prometer lo que no está encendido.

---

## 1. En una frase

**Prodigia es una app para estudiar jugando.** Tiene 15 mundos (matemática, ciencias,
música, historia, programación y más), cada uno con partidas cortas que se adaptan a tu
nivel, lecciones para aprender desde cero y un lado competitivo con duelos en vivo,
rangos, ligas y clanes. No es una app infantil: es para cualquier persona que quiera
aprender o mantenerse ágil.

**Ideas fuerza:**
- **Cada mundo es una ciudad** que se enciende de noche (skyline con ventanas de neón que
  se prenden y se apagan).
- **Partidas de 10 preguntas** contra el reloj (sprint), con dificultad del 1 al 10 que
  sube y baja sola según cómo te va.
- **Aprender + practicar + competir** en el mismo lugar.
- **Web y app Android**, con la misma cuenta y el mismo progreso.

---

## 2. Los 15 mundos (todos funcionan en la web y en la app)

Cada mundo tiene sus modos, un diagnóstico inicial que te ubica en tu nivel y una
sección Aprender con lecciones.

| Mundo | Tema | Modos |
|---|---|---|
| **Numeria** | Cálculo mental | Aritmética (las 4 operaciones), Geometría, Fracciones, Decimales y porcentajes, Potencias y raíces, Álgebra |
| **Enigmia** | Lógica | Memoria, Patrones, Deducción (acertijos de pistas), Pensamiento computacional, Mezcla |
| **Geografía** | Países y mapas | Encontrar el país en el mapa real, por continente (América, Europa, África, Asia y Oceanía); desde nivel 8, preguntas avanzadas (ciudades, ríos, lugares) |
| **Quimia** | Química | Símbolos y elementos, Fórmulas y compuestos, Tabla periódica, Nomenclatura, Química orgánica |
| **Anatomía** | Cuerpo humano | Sistema óseo (se toca el hueso en el esqueleto), Sistema muscular, Órganos, Sistema nervioso; 16 formatos de pregunta |
| **Melodía** | Música | Fundamentos, Lectura en pentagrama, Alteraciones, Escalas, Acordes, Oído absoluto (suena la nota y la nombras), Tempo y compás |
| **Trigonometría** | Ángulos | Razones básicas, Círculo unitario, Identidades, Leyes de seno y coseno |
| **Historia** | El pasado | Cronología, Personajes, Causa y efecto, Fechas exactas |
| **Calculia** | Cálculo | Derivadas, Integrales, Series, Multivariable y ecuaciones diferenciales |
| **Circuitia** | Electricidad | Circuitos en serie, en paralelo, mixtos y análisis cualitativo; cada pregunta dibuja su circuito |
| **Estadística** | Datos | Tendencia central, Dispersión, Probabilidad y combinatoria, Análisis de datos, Lectura de gráficos |
| **Naipia** | Memoria de cartas | Sistemas de conteo Hi-Lo, KO, Hi-Opt II, Omega II y Conteo verdadero; enfocado como deporte mental de memoria |
| **Codia** | Programación | Sintaxis, Salida del código, Encuentra el error, Estructuras y complejidad; en **Python, Java, JavaScript y TypeScript** |
| **Dinamia** | Física | Cinemática, Vectores, Leyes de Newton, Trabajo y energía, Termodinámica, Fluidos |
| **Vitalia** | Biología | La célula, Procesos celulares, Genética, Sistemas del cuerpo, Reinos y clasificación, Ecología |

**Detalles que lucen en una página:**
- Las fórmulas se ven como en un libro (LaTeX).
- Muchas preguntas traen su dibujo: circuitos, esqueleto, pentagrama, mapas reales,
  gráficos estadísticos, cartas, fragmentos de código y diagramas de física y biología.
- Las preguntas se generan, no salen de una lista fija, así que casi nunca se repiten.
  En Codia, las respuestas se comprueban ejecutando el código de verdad.

**Cómo se consiguen los mundos:** al empezar eliges **2 mundos gratis para siempre**. Los
demás se desbloquean con Chispas (la moneda que ganas jugando). Con Pro están todos
abiertos mientras dure la suscripción.

---

## 3. Aprender

- **Técnicas (gratis):** trucos y métodos cortos de cada mundo.
- **Clases (Pro; la primera de cada mundo es gratis):** cursos que enseñan el tema
  desde cero, en orden, con ejemplos resueltos paso a paso y un mini quiz entre lección y
  lección.
- **630 lecciones**, todas en español y en inglés.
- En la app, las lecciones se guardan en el teléfono y se pueden leer sin conexión.

---

## 4. Formas de jugar

- **Sprint (práctica normal):** 10 preguntas contra el reloj, con el nivel ajustándose solo.
  Al final hay un resumen con aciertos, experiencia, nivel del mundo, racha y logros.
- **Modo Zen:** 10 preguntas **sin reloj**; eliges tema y dificultad, con pistas gratis.
  No da Chispas, pero cuenta para la racha.
- **Diagnóstico:** una prueba corta al entrar a cada mundo que te ubica en tu nivel.
- **Reto diario** (5 preguntas mezcladas de tus mundos) y **reto semanal** (45), cada uno
  con su ranking y su racha.
- **Partida de prueba sin cuenta:** cualquiera puede probar como invitado antes de
  registrarse.

**Ayudas (consumibles):** hielo (congela el reloj), +3 segundos, escudo, boost de
experiencia y congelamiento de racha. Se ganan o se compran con Chispas y **no se usan en
duelos**.

---

## 5. Competir

- **Rankeds:** duelos en vivo contra jugadores reales, con matchmaking y **ELO**.
  - **Rangos:** Bronce, Plata, Oro, Platino, Diamante y Prodigio, cada uno con su título.
  - Se juegan en **series al mejor de 3**, en un mundo o en «todas las ciudades». La
    serie pasa sola de ronda y termina con una pantalla de versus (victoria o derrota,
    marcador, ELO ganado o perdido y la comparación contigo contra tu rival).
  - Se abren desde el nivel de cuenta 5.
- **Duelos amistosos y retos a amigos:** no tocan el ELO.
- **Liga semanal** y **rankings** (general y por mundo).
- **Progreso en vivo:** durante el duelo ves cómo va tu rival, y aparece la pantalla «VS»
  con el rango de cada uno.

---

## 6. Social

- **Amigos:** buscar, agregar, ver quién está en línea y ver su perfil.
- **Chat** privado, con fondos de chat a elegir.
- **Clanes:**
  - roles (fundador, guía, miembro) y nivel de clan;
  - **guerras de clanes** y misiones de clan;
  - el **Mundo del Clan**: una ciudad que crece de Asentamiento a Prodigio.
- **Feed:** la actividad de tus amigos (niveles, logros, duelos).
- **Regalos:** puedes mandarle uno por día a un amigo.
- **Bloquear y reportar** jugadores.

---

## 7. Progreso y recompensas

- **Experiencia y nivel de cuenta**, con premio cada vez que subes.
- **Nivel por mundo** y **dominio por modo**. Al llegar a nivel 40 en una ciudad
  ganas su **marco de ciudad**, con aro metálico y el motivo de esa ciudad.
- **Racha diaria** con meta de experiencia del día.
- **Constelaciones:**
  - Cada ciudad tiene en su cielo una constelación de 7 estrellas, y cada partida enciende
    estrellas.
  - Al completarla se revela su premio con una animación.
  - De noche en esa ciudad se gana un 20 % más.
  - 1 de cada 5 constelaciones trae una «estrella fugaz» con un premio extra.
- **Gran Alineación:** 3 horas cada 4 semanas con experiencia doble.
- **Calendario de 7 días**, con un premio distinto cada día.
- **Misiones del día** (3) y **cápsulas** que se abren con animación. Antes de abrir una
  ves las probabilidades de lo que puede salir.
- **Colecciones por ciudad:** piezas que, al completarse, dan un marco de colección.
- **Logros y unos 50 títulos.** Los títulos se ganan jugando y nunca se compran.
- **Estadísticas** de tu juego (las avanzadas son de Pro).

---

## 8. Tu placa, la tienda y el inventario

- **Placa de jugador:** avatar con foto, marco, fondo, título, fuente y animación del
  nombre, y ciudad favorita.
- **Cosméticos (más de 200):**
  - marcos (de rango, de ciudad, de temporada, neón y 18 de colores);
  - fondos de perfil (27);
  - estelas (28) y efectos de acierto (29);
  - sonidos de acierto (8);
  - emotes para los duelos (41);
  - títulos y paquetes temáticos con descuento.
- **Tienda:** solo muestra lo que todavía no tienes. Cada cosa tiene su rareza y su vista
  previa.
- **Inventario:** todo lo que ya tienes, para equiparlo.
- **Kit del Pionero:** regalo de bienvenida para quien entra desde la app.

---

## 9. Plataformas e idiomas

- **Web:** cualquier navegador, instalable como aplicación (PWA). Interfaz en **español e
  inglés**.
- **App Android nativa:** las 15 ciudades y todos los modos, Rankeds, social, recompensas y
  tienda.
  - Tiene animaciones propias, sonido y vibración.
  - Se puede jugar **sin conexión**: lo que hagas se sube después.
  - **Widgets** de racha y progreso para la pantalla de inicio.
  - Notificaciones de duelo, racha y mensajes.
  - Hoy la interfaz de la app está en español; las lecciones sí están en los dos idiomas.
  - **Estado:** el APK ya se compila; falta publicarla en Google Play.
- **Una sola cuenta:** el progreso, las compras y el plan se comparten entre la web y la
  app.

---

## 10. Prodigia Pro

**Hoy funciona:**
- **Todos los mundos abiertos** mientras dure la suscripción.
- **Todas las Clases.**
- **Estadísticas avanzadas.**
- **Cosméticos exclusivos.**
- **Sin anuncios.**
- **Al vencer:** Pro se apaga solo y avisa. Lo comprado y el progreso se quedan.

**Precio previsto:** US$4,99 al mes o US$39,99 al año, con precio regional en
Latinoamérica. **El cobro todavía no está encendido**, así que en la página conviene
decir «Pro» sin botón de compra, o con «muy pronto».

**Cambios planeados** (`docs/economy/PLAN_ECONOMIA.md`):
- +25 % de Chispas.
- Cometas cada mes.
- Prueba gratis de 7 días.
- La pieza Pro de cada evento.

---

## 11. Monedas y compras (lo que existe y lo que viene)

- **Chispas:** la moneda que se gana jugando. Ya funciona.
- **Cometas:** moneda premium que se compra. **Plan**, todavía no existe.
- **Principio:** nada pagado da ventaja en partidas, duelos ni rankings. Con dinero se
  compra tiempo, contenido y estilo.
- **Anuncios:** programados, pero apagados hasta tener las cuentas reales. Serán solo
  para cuentas gratis: opcionales con premio, y uno entre partidas cada 3.
- **Eventos:** **plan.** Habrá colecciones de temporada, como Halloween y Navidad, y no
  habrá pase de batalla.

---

## 12. Colegios y docentes

- **Panel de profesor:** grupos de alumnos y su progreso.
- **Página para colegios** (`/docentes`): formulario de contacto. El plan para colegios
  es un producto aparte del público general.

---

## 13. Cuidados para la página pública

- **No mostrar la Trastienda.** Es una sección con juegos de azar (ruleta, doble o nada)
  con Chispas, solo para mayores de edad y con la edad verificada. No conviene asociarla
  a la marca en la presentación.
- **Naipia:** presentarla como memoria y cálculo mental. Nunca hablar de casinos ni de
  apuestas.
- **No prometer como disponible** lo que está apagado: cobro de Pro, Cometas, anuncios,
  eventos y la app en Google Play.
- **Español neutro, sin voseo** («juegas», «elige»): es la convención de todo el proyecto.

---

## 14. Marca y material ya hecho

- **Paleta:**

  | Uso | Color |
  |---|---|
  | Fondo | `#090C14` |
  | Violeta principal | `#7C5CFF` |
  | Dorado de logros | `#FFB627` |
  | Verde de acierto | `#3DDC97` |
  | Naranja de racha | `#FF8A3D` |

  Cada mundo tiene su color: tabla en `mobile/src/tema.ts` y en
  `calibra/src/lib/mundos/precios.ts`.
- **Logos:** `docs/Logo principal@2x.png` y `docs/Logo animado@2x.png`. Hay videos de la
  intro del mamut en `docs/mamut-intro-*`.
- **Marketing:** `docs/marketing/`, en especial `BRAND.md`, `VOZ-TONO.md`,
  `PRODUCT-MESSAGING.md`, `SLOGANS.md`, `SCREENSHOTS.md` y
  `TECNICAS-Y-CLASES-POR-MUNDO.md`.
- **Lo que ya existe en la web:** una landing con demo jugable sin cuenta (`/demo/<mundo>`)
  y la página de descarga de la app (`/descargar`).
