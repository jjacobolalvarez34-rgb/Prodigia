# Plan: mundos 14 y 15 — Física y Biología

> **Estado: PROPUESTA, para aprobar.** Solo planeación: nombre, logo, modos de juego y lecciones (tema, división y animaciones). No hay código ni migraciones todavía.
> Fecha: 8 de octubre de 2026.
> Al final hay una lista de **decisiones** con mi recomendación en cada una.

---

## 0. Reglas que sigue este plan (las mismas de los otros 13 mundos)

- **Mundos normales en todo**: catálogo, Practicar, Rankeds, duelos, logros, tienda, día y noche de la ciudad, constelaciones, web y app. Ningún sistema los trata distinto.
- **Practicar** = partidas de 60 s con **modos**. Cada modo es un tema con **niveles 1 a 10** que se adaptan solos (tres bien seguidas, subes). Cada pregunta se arma por código y su respuesta se calcula al armarla: nunca hay una respuesta escrita a mano que pueda estar mal. Los duelos usan la misma pregunta para los dos jugadores (semilla).
- **Aprender** con dos pestañas: **Técnicas** (gratis, trucos cortos) y **Clases** (Pro: enseñan desde cero, en orden, con ejemplos resueltos y quiz; la primera del mundo es gratis).
- **División por tema** (lo que pediste para Calculia): cada modo de juego es un **bloque** en Aprender, con desbloqueo independiente. Dentro del bloque, cada tema tiene su Técnica y su Clase, en orden de dependencia.
- **Cada lección tiene al menos una animación** propia del mundo (regla de Quimia y Anatomía), y un test comprueba que todo lo que pregunta Practicar está enseñado en Aprender.
- **Qué no repiten**:
  - La electricidad ya está en **Circuitia**; Física no la toca.
  - **Anatomía** pregunta *nombres y ubicación* (huesos, músculos, órganos, nervios). Biología pregunta *cómo funciona* (recorridos, procesos, qué hormona hace qué); nunca «¿cómo se llama este hueso?».

Formas de responder que ya existen: **opciones**, **teclado numérico** (con coma y signo, con tolerancia) y **tocar en el dibujo** (hoy solo para el esqueleto de Anatomía). Biología necesita generalizar «tocar en el dibujo» para la célula y los sistemas (ver decisión 6). Las preguntas de «ordena los pasos» se hacen con opciones (4 órdenes posibles, uno correcto).

---

## 1. Nombre, color y logo

### 1.1 Física

| | Propuesta |
|---|---|
| **Nombre** | **Dinamia** (recomendado; de *dýnamis*, «fuerza», y termina en «-ia» como Numeria, Quimia o Circuitia). Otras opciones: **Newtonia**, o dejar **Física** a secas, como Geografía o Anatomía. |
| **Slug** | `dinamia` (o `fisica`, según el nombre) |
| **Tema** (subtítulo) | «Movimiento, fuerzas y energía» |
| **Color** | base `#2563EB` (azul rey), neón `#60A5FA`. Hoy no hay ningún azul puro: queda entre Codia (cian) y Calculia (índigo) sin confundirse. |
| **Glifo** | `⇀` (un vector). Glifos de fondo: `⇀ g Δt ΣF` |
| **Ícono** (trazo de 2 px, como los demás) | La trayectoria de un tiro: una línea de piso, una parábola que sale de abajo a la izquierda y cae a la derecha, una bolita arriba de todo y una flecha corta tangente a la curva. SVG: piso `M3 20h18`, curva `M4 19c3-13 13-13 16 0`, bolita `circle 12 9.2 r1.6`, flecha `M15.5 10.5l2 2.2M17.5 12.7l-.2-2.6`. |
| **Marco de colección** | Anillo con dos órbitas inclinadas y una partícula que gira, con su estela. |
| **Ciudad** | Horizonte con antenas y una rueda de la fortuna (gira de noche). |

### 1.2 Biología

| | Propuesta |
|---|---|
| **Nombre** | **Vitalia** (recomendado; de *vita*, «vida»). Otras opciones: **Biomia**, o dejar **Biología**. |
| **Slug** | `vitalia` (o `biologia`) |
| **Tema** (subtítulo) | «La vida, de la célula a los reinos» |
| **Color** | base `#16A34A` (verde hoja), neón `#4ADE80`. Es más amarillo que Enigmia (verde menta) y más oscuro que Trigonometría (lima). Si se parece demasiado a Enigmia en el teléfono, la alternativa es `#15803D` (bosque). |
| **Glifo** | `✿`. Glifos de fondo: `✿ ◉ ADN ⌬` |
| **Ícono** | Una célula: círculo grande, núcleo corrido arriba a la derecha y una mitocondria chiquita (una curva con un zigzag adentro). SVG: membrana `circle 12 12 r8.5`, núcleo `circle 14 10 r2.6`, mitocondria `M7 15.2c1.2-1.6 3.4-1.6 4.6 0` + `M7.8 15l.8-.8.8.8.8-.8.8.8`. Alternativa: una doble hélice. |
| **Marco de colección** | Anillo de enredadera con hojas y una doble hélice que se enrosca lento. |
| **Ciudad** | Horizonte con invernaderos y árboles entre los edificios (de noche brillan luciérnagas). |

---

## 2. Física (Dinamia): modos de juego

Seis modos, cada uno con su `problem_type` y niveles 1 a 10:
- **Cálculos:** el teclado numérico, con el redondeo dicho en el enunciado («redondea a 1 decimal»).
- **Conceptos:** opciones.
- **g (gravedad):** siempre se dice en el enunciado. `g = 10 m/s²` hasta el nivel 6 y `g = 9,8 m/s²` desde el 7 (decisión 2).

### Modo 1 · Cinemática (`dinamia_cinematica`)

| Niveles | Qué se pregunta | Cómo se responde |
|---|---|---|
| 1-2 | MRU: d = v·t y sus despejes; pasar km/h ↔ m/s | teclado |
| 3-4 | Encuentros (dos móviles que se acercan o se persiguen); leer una gráfica x-t: la pendiente es la velocidad | teclado / opciones |
| 5-6 | MRUA: v = v₀ + a·t, d = v₀·t + ½·a·t², v² = v₀² + 2·a·d; frenado hasta parar | teclado |
| 7-8 | Caída libre y tiro vertical: altura máxima, tiempo de subida, tiempo total de vuelo, velocidad al tocar el piso | teclado |
| 9-10 | Tiro parabólico con 30°, 45° o 60° (seno y coseno escritos en el enunciado): alcance, altura máxima, tiempo de vuelo; leer una gráfica v-t (el área es la distancia) | teclado / opciones |

- **Dibujo en la pregunta:**
  - el móvil sobre una regla con sus datos;
  - la gráfica x-t o v-t cuando la pregunta es de leerla;
  - la trayectoria punteada en tiro parabólico.
- **Animación al responder bien:** el móvil hace el recorrido con los números calculados (la bolita cae justo la altura de la respuesta).

### Modo 2 · Vectores (`dinamia_vectores`)

| Niveles | Qué se pregunta | Cómo se responde |
|---|---|---|
| 1-2 | Escalar o vectorial; sumar y restar vectores en la misma línea (con sentido) | opciones / teclado con signo |
| 3-4 | Suma en cuadrícula con componentes enteras; módulo con triángulos exactos (3-4-5, 5-12-13, 6-8-10) | teclado |
| 5-6 | Descomponer: Fx = F·cos θ, Fy = F·sen θ con 30°, 45°, 60° (valores escritos) | teclado |
| 7-8 | Resultante de 3 vectores; ángulo de la resultante (tabla de arcotangentes en el enunciado); restar vectores | teclado |
| 9-10 | Fuerza equilibrante (la que deja todo en cero); producto escalar y si dos vectores son perpendiculares | teclado / opciones |

- **Dibujo en la pregunta:** las flechas sobre la cuadrícula, con su módulo y su ángulo.
- **Animación al responder bien:** los vectores se ponen punta con cola y aparece la resultante.

### Modo 3 · Leyes de Newton (`dinamia_newton`)

| Niveles | Qué se pregunta | Cómo se responde |
|---|---|---|
| 1-2 | ¿Qué ley explica esta situación? (inercia, F = m·a, acción y reacción); peso P = m·g; masa o peso | opciones / teclado |
| 3-4 | F = m·a directo y despejes; fuerza neta con varias fuerzas en la misma línea | teclado |
| 5-6 | Normal y rozamiento (Fr = μ·N, estático o cinético); elegir el diagrama de cuerpo libre correcto entre 4 | teclado / opciones |
| 7-8 | Plano inclinado (con y sin rozamiento); dos bloques unidos por una cuerda; máquina de Atwood | teclado |
| 9-10 | Movimiento circular (fuerza centrípeta, velocidad máxima en una curva); gravitación universal (cuánto cambia la fuerza si se duplica la distancia) | teclado / opciones |

- **Dibujo en la pregunta:** el bloque en el piso, en el plano inclinado o colgando de la polea.
- **Animación al responder bien:** aparecen las fuerzas de a una y el bloque acelera con la aceleración calculada.

### Modo 4 · Trabajo y energía (`dinamia_energia`)

| Niveles | Qué se pregunta | Cómo se responde |
|---|---|---|
| 1-2 | Qué tipo de energía hay (cinética, potencial, térmica…); Ec = ½·m·v² y Ep = m·g·h directos | opciones / teclado |
| 3-4 | Trabajo W = F·d·cos θ (0°, 60°, 90°, 180°: positivo, negativo o nulo); potencia P = W/t; pasar kWh ↔ J | teclado |
| 5-6 | Conservación: velocidad abajo de una caída o un tobogán sin rozamiento; altura que alcanza al subir | teclado |
| 7-8 | Con rozamiento: energía que se pierde como calor; rendimiento (%) de una máquina | teclado |
| 9-10 | Resortes (Ley de Hooke, Ep elástica = ½·k·x²); teorema trabajo-energía; impulso y cantidad de movimiento en choques en línea (plásticos y elásticos) | teclado |

- **Dibujo en la pregunta:** el tobogán, la montaña rusa o el resorte con la altura y la masa.
- **Animación al responder bien:** la bolita baja y se ven las barras de Ec y Ep pasándose energía.

### Modo 5 · Termodinámica (`dinamia_termo`)

| Niveles | Qué se pregunta | Cómo se responde |
|---|---|---|
| 1-2 | Escalas: °C ↔ K ↔ °F; temperatura o calor (conceptos) | teclado con signo |
| 3-4 | Q = m·c·ΔT (tabla de calores específicos en el enunciado); temperatura final de una mezcla (equilibrio térmico) | teclado |
| 5-6 | Cambios de fase: calor latente; leer la curva de calentamiento (¿en qué tramo se derrite?) | teclado / opciones |
| 7-8 | Dilatación lineal; gases ideales: Boyle, Charles, Gay-Lussac y P·V = n·R·T (temperaturas siempre en K) | teclado |
| 9-10 | Primera ley: ΔU = Q − W (convención escrita en el enunciado); rendimiento de una máquina térmica y de Carnot | teclado |

- **Dibujo en la pregunta:** el termómetro, la curva de calentamiento o el pistón con su gas.
- **Animación al responder bien:** las partículas se aceleran o frenan y el pistón llega a su lugar.

### Modo 6 · Fluidos (`dinamia_fluidos`)

| Niveles | Qué se pregunta | Cómo se responde |
|---|---|---|
| 1-2 | Densidad ρ = m/V (tabla de densidades); ¿flota o se hunde? | teclado / opciones |
| 3-4 | Presión P = F/A (por qué un clavo entra y un ladrillo no); presión hidrostática P = ρ·g·h | teclado |
| 5-6 | Prensa hidráulica (Pascal): fuerza en el pistón grande; presión absoluta = atmosférica + manométrica | teclado |
| 7-8 | Arquímedes: empuje, peso aparente, qué fracción del cuerpo queda bajo el agua | teclado |
| 9-10 | Caudal y continuidad (A₁·v₁ = A₂·v₂); Torricelli (velocidad de salida por un agujero); Bernoulli cualitativo (¿dónde baja la presión?) | teclado / opciones |

- **Dibujo en la pregunta:** el recipiente con su líquido y la profundidad, la prensa o el tubo que se angosta.
- **Animación al responder bien:** el objeto se hunde hasta la línea de flotación calculada, o el líquido corre más rápido en la parte angosta.

> Fuera de este plan: electricidad y magnetismo (los ve Circuitia). **Ondas y óptica** quedarían como modo 7 en una segunda tanda (decisión 4).

---

## 3. Física (Dinamia): lecciones de Aprender

Seis **bloques** (uno por modo), con desbloqueo independiente. En cada bloque van primero las **Técnicas** (gratis) y después las **Clases** (Pro), en orden. **Total: 24 Técnicas + 30 Clases.** La Clase 1.1 es la gratis del mundo.

### 3.1 Animaciones propias de Dinamia (`dinamia.*`)

Cada animación recibe solo los datos (masas, ángulos, velocidades) y el código calcula todo lo que muestra, igual que Circuitia.

| Animación | Qué se ve |
|---|---|
| `trayecto` | Un móvil avanza sobre una regla y deja una marca cada segundo: en MRU las marcas quedan a la misma distancia; en MRUA se separan cada vez más. Arriba, la flecha de la velocidad crece o queda igual, y hay un reloj. |
| `grafica` | La gráfica x-t o v-t se dibuja en vivo al mismo tiempo que el móvil se mueve; después se resalta la pendiente (velocidad) o se sombrea el área (distancia). |
| `caida` | Una pelota cae al lado de una regla vertical con marcas cada 0,5 s y la flecha de v que crece; en tiro vertical sube, frena, se detiene un instante y baja. |
| `parabola` | Tiro parabólico con la trayectoria punteada; en cada punto se dibujan vx (siempre igual) y vy (achicándose, cero arriba, creciendo hacia abajo). |
| `vectores` | Flechas en una cuadrícula: se ponen punta con cola, se proyectan sus componentes y aparece la resultante; el ángulo se marca con un arco. |
| `cuerpoLibre` | Un bloque (en el piso, en un plano inclinado o colgando) y sus fuerzas, que aparecen de a una con su nombre: peso, normal, rozamiento, tensión. Al final se suman, aparece la fuerza neta y el bloque acelera (o queda quieto si la neta es cero). |
| `poleas` | Dos bloques unidos por una cuerda sobre una polea; se mueven con la aceleración calculada y se ve la tensión en la cuerda. |
| `circular` | Un objeto girando con la velocidad tangente y la fuerza hacia el centro; si se corta la cuerda, sale en línea recta por la tangente. |
| `energia` | Un péndulo o una montaña rusa con tres barras (cinética, potencial y calor) que se pasan energía; el total siempre mide lo mismo. Con rozamiento, la barra de calor crece. |
| `choque` | Dos carritos que chocan en una línea; antes y después se ve la cantidad de movimiento de cada uno y la suma, que no cambia. |
| `termometro` | Tres termómetros (°C, K, °F) que suben juntos; o la curva de calentamiento del agua, con las mesetas en 0 °C y 100 °C. |
| `particulas` | Una caja con partículas que se mueven más rápido cuando sube la temperatura; un pistón que sube y baja (Boyle, Charles, Gay-Lussac) con su manómetro. |
| `ciclo` | Diagrama P-V con un ciclo cuya área (el trabajo) se pinta; al lado, una máquina térmica con flechas de calor que entra, trabajo y calor que sale, de ancho proporcional. |
| `fluido` | Un recipiente con un medidor de presión que baja con la profundidad; una prensa hidráulica (el pistón chico baja mucho, el grande sube poco); un objeto que flota con las flechas de peso y empuje y la parte sumergida pintada. |
| `tubo` | Un caño que se angosta, con partículas que van más rápido en la parte angosta (continuidad); un tanque con un agujero y su chorro (Torricelli). |

Además está `cuadros` (la animación genérica de pasos que ya usan todos los mundos).

### 3.2 Lecciones por bloque

**Bloque 1 · Cinemática**

| # | Tipo | Lección | Qué enseña | Animación |
|---|---|---|---|---|
| T1 | Técnica | Pasar km/h a m/s de cabeza | Dividir por 3,6 (y multiplicar para volver); 36 km/h = 10 m/s como ancla | `cuadros` |
| T2 | Técnica | El triángulo d-v-t | Tapar lo que se busca para saber si se multiplica o se divide | `trayecto` |
| T3 | Técnica | Caída libre con g = 10 | Velocidades 10, 20, 30…; distancias 5, 20, 45… (los cuadrados) | `caida` |
| T4 | Técnica | Leer una gráfica sin calcular | Recta = velocidad constante, curva = acelera, horizontal = quieto | `grafica` |
| C1.1 | Clase (gratis) | Posición, distancia y velocidad | Sistema de referencia, desplazamiento y velocidad media | `trayecto` |
| C1.2 | Clase | Movimiento rectilíneo uniforme | d = v·t, gráficas x-t y v-t, encuentros | `trayecto`, `grafica` |
| C1.3 | Clase | Aceleración y MRUA | Las tres ecuaciones y cuándo usar cada una; frenado | `trayecto`, `grafica` |
| C1.4 | Clase | Caída libre y tiro vertical | Altura máxima, tiempo de vuelo y por qué tarda lo mismo en subir que en bajar | `caida` |
| C1.5 | Clase | Tiro parabólico | Dos movimientos a la vez: uniforme en x y MRUA en y; alcance máximo a 45° | `parabola` |

**Bloque 2 · Vectores**

| # | Tipo | Lección | Qué enseña | Animación |
|---|---|---|---|---|
| T5 | Técnica | Triángulos que ya sabes | 3-4-5 y sus múltiplos para sacar módulos sin raíz | `vectores` |
| T6 | Técnica | Seno o coseno, ¿cuál va? | El cateto pegado al ángulo lleva coseno | `vectores` |
| T7 | Técnica | Sumar por componentes | Sumar todas las x, sumar todas las y, recién después el módulo | `vectores` |
| T8 | Técnica | La equilibrante | Es la resultante dada vuelta | `vectores` |
| C2.1 | Clase | Escalares y vectores | Módulo, dirección y sentido; vectores en una línea | `vectores` |
| C2.2 | Clase | Sumar vectores | Punta con cola y paralelogramo | `vectores` |
| C2.3 | Clase | Componentes | Descomponer y recomponer con seno y coseno | `vectores` |
| C2.4 | Clase | Ángulo de la resultante y producto escalar | Arcotangente y cuándo dos vectores son perpendiculares | `vectores` |

**Bloque 3 · Leyes de Newton**

| # | Tipo | Lección | Qué enseña | Animación |
|---|---|---|---|---|
| T9 | Técnica | Masa y peso no son lo mismo | Peso = m·g; en la Luna cambia el peso, no la masa | `cuadros` |
| T10 | Técnica | Diagrama de cuerpo libre en 4 pasos | Peso siempre; normal si toca algo; rozamiento contra el movimiento; tensión si hay cuerda | `cuerpoLibre` |
| T11 | Técnica | Plano inclinado: el truco de los ejes | Inclinar los ejes con el plano; m·g·sen θ baja por la rampa | `cuerpoLibre` |
| T12 | Técnica | Sistemas de bloques como uno solo | Aceleración = fuerza neta ÷ masa total | `poleas` |
| C3.1 | Clase | Fuerza y primera ley | Inercia: sin fuerza neta, nada cambia | `cuerpoLibre` |
| C3.2 | Clase | Segunda ley: F = m·a | Fuerza neta, unidades (newton) y despejes | `cuerpoLibre` |
| C3.3 | Clase | Tercera ley y la normal | Acción y reacción en cuerpos distintos; por qué la normal no siempre es igual al peso | `cuerpoLibre` |
| C3.4 | Clase | Rozamiento | Estático y cinético, el coeficiente μ y cuándo empieza a moverse | `cuerpoLibre` |
| C3.5 | Clase | Plano inclinado y poleas | Problemas con dos cuerpos paso a paso | `cuerpoLibre`, `poleas` |
| C3.6 | Clase | Movimiento circular y gravitación | Fuerza centrípeta y la ley de gravitación universal | `circular` |

**Bloque 4 · Trabajo y energía**

| # | Tipo | Lección | Qué enseña | Animación |
|---|---|---|---|---|
| T13 | Técnica | El signo del trabajo | A favor = positivo, en contra = negativo, perpendicular = cero | `cuerpoLibre` |
| T14 | Técnica | La velocidad abajo no depende de la masa | v = √(2·g·h), la masa se cancela | `energia` |
| T15 | Técnica | Rendimiento en un paso | Lo útil ÷ lo que entra, por 100 | `energia` |
| T16 | Técnica | Choques: suma antes = suma después | Plantear la cantidad de movimiento con signos | `choque` |
| C4.1 | Clase | Trabajo y potencia | W = F·d·cos θ, P = W/t, el kWh | `cuerpoLibre` |
| C4.2 | Clase | Energía cinética y potencial | De dónde salen las fórmulas y qué significan | `energia` |
| C4.3 | Clase | Conservación de la energía | Toboganes, péndulos y montañas rusas sin rozamiento | `energia` |
| C4.4 | Clase | Rozamiento, calor y rendimiento | Adónde va la energía que «se pierde» | `energia` |
| C4.5 | Clase | Resortes y cantidad de movimiento | Ley de Hooke, impulso y choques | `energia`, `choque` |

**Bloque 5 · Termodinámica**

| # | Tipo | Lección | Qué enseña | Animación |
|---|---|---|---|---|
| T17 | Técnica | Kelvin en un paso | Sumar 273 (y nunca hay K negativos) | `termometro` |
| T18 | Técnica | °F aproximado de cabeza | Doble más 30 para estimar; la fórmula exacta para el resultado | `termometro` |
| T19 | Técnica | Gases: la tabla de qué queda fijo | Boyle (T fija), Charles (P fija), Gay-Lussac (V fijo) | `particulas` |
| T20 | Técnica | Mezclas: el calor que gana uno lo pierde el otro | Plantear Q ganado = Q cedido | `termometro` |
| C5.1 | Clase | Temperatura y calor | Qué mide cada uno; escalas | `termometro`, `particulas` |
| C5.2 | Clase | Calor específico | Q = m·c·ΔT y por qué el agua tarda en calentarse | `termometro` |
| C5.3 | Clase | Cambios de fase | Calor latente y la curva de calentamiento | `termometro` |
| C5.4 | Clase | Dilatación y gases ideales | Las tres leyes y P·V = n·R·T | `particulas` |
| C5.5 | Clase | Primera ley y máquinas térmicas | ΔU = Q − W, ciclos y rendimiento de Carnot | `ciclo` |

**Bloque 6 · Fluidos**

| # | Tipo | Lección | Qué enseña | Animación |
|---|---|---|---|---|
| T21 | Técnica | ¿Flota? Compara densidades | Menos denso que el líquido, flota | `fluido` |
| T22 | Técnica | Cada 10 m de agua, 1 atmósfera más | Estimar la presión en el fondo | `fluido` |
| T23 | Técnica | La prensa multiplica por la razón de áreas | F₂ = F₁·(A₂/A₁) | `fluido` |
| T24 | Técnica | Caño angosto, agua rápida | Si el área baja a la mitad, la velocidad se duplica | `tubo` |
| C6.1 | Clase | Densidad y presión | ρ = m/V, P = F/A | `fluido` |
| C6.2 | Clase | Presión en los líquidos | P = ρ·g·h, presión atmosférica y manométrica | `fluido` |
| C6.3 | Clase | Principio de Pascal | Prensa y frenos hidráulicos | `fluido` |
| C6.4 | Clase | Principio de Arquímedes | Empuje, peso aparente y flotación | `fluido` |
| C6.5 | Clase | Fluidos en movimiento | Caudal, continuidad, Torricelli y Bernoulli | `tubo` |

---

## 4. Biología (Vitalia): modos de juego

Cinco modos (y un sexto opcional, decisión 5).
- **Conceptos:** opciones.
- **Genética:** con cálculo, en teclado o en opciones de proporciones.
- **Reconocer una parte en un dibujo:** se toca en el dibujo (decisión 6).

Lo que no se calcula sale de **tablas curadas** (como los hechos de Historia), listadas en un documento para revisarlas a mano antes de publicarlas.

### Modo 1 · La célula (`vitalia_celula`)

| Niveles | Qué se pregunta | Cómo se responde |
|---|---|---|
| 1-2 | Teoría celular; procariota o eucariota; unicelular o pluricelular | opciones |
| 3-4 | Qué hace cada organelo (núcleo, mitocondria, ribosoma, retículo, Golgi, lisosoma, cloroplasto, vacuola, pared) | opciones |
| 5-6 | Señalar el organelo en el dibujo; ¿es célula animal o vegetal? (por pared, cloroplastos, vacuola) | tocar / opciones |
| 7-8 | Membrana y transporte: difusión, ósmosis, transporte activo; ¿la célula se hincha o se arruga? (medio hipotónico, isotónico, hipertónico) | opciones |
| 9-10 | Biomoléculas: su unidad (glucosa, aminoácido, nucleótido, ácido graso) y su función; enzimas (qué pasa con la temperatura y el pH) | opciones |

- **Dibujo en la pregunta:** la célula con una flecha, o con su forma (animal o vegetal) para clasificarla.
- **Animación al responder bien:** el organelo se ilumina y muestra su nombre; en ósmosis, la célula se hincha o se arruga.

### Modo 2 · Procesos celulares (`vitalia_procesos`)

| Niveles | Qué se pregunta | Cómo se responde |
|---|---|---|
| 1-2 | Fotosíntesis y respiración: qué entra y qué sale (CO₂, O₂, agua, glucosa, luz, ATP) | opciones |
| 3-4 | Dónde ocurre cada cosa (cloroplasto, mitocondria, citoplasma); quién hace fotosíntesis | opciones |
| 5-6 | Mitosis: nombre de la fase en el dibujo; el orden correcto de las fases | opciones |
| 7-8 | Meiosis o mitosis; cromosomas: si 2n = X, ¿cuántos tiene un gameto? ¿y después de la mitosis? (números generados) | teclado / opciones |
| 9-10 | Ciclo celular (G1, S, G2, M); fermentación láctica y alcohólica; cuánto ATP rinde cada vía (aeróbica ≈ 36-38, fermentación = 2) | opciones / teclado |

- **Dibujo en la pregunta:** la célula en una fase de la división, o el esquema con entradas y salidas vacías.
- **Animación al responder bien:** los cromosomas avanzan a la fase siguiente, o las moléculas fluyen al lugar correcto.

### Modo 3 · Genética (`vitalia_genetica`)

| Niveles | Qué se pregunta | Cómo se responde |
|---|---|---|
| 1-2 | Gen, alelo, genotipo, fenotipo, homocigoto, heterocigoto; dominante o recesivo | opciones |
| 3-4 | Hebra complementaria de ADN (A-T, G-C); transcribir ADN a ARN mensajero (U en vez de T) | opciones (4 secuencias) |
| 5-6 | Traducir codones a aminoácidos con la tabla de codones a la vista; Punnett de un rasgo (Aa × Aa): probabilidad de cada fenotipo | opciones / teclado (%) |
| 7-8 | Punnett de dos rasgos (9:3:3:1 y otros cruces); dominancia incompleta y codominancia; grupos sanguíneos ABO (¿qué grupos pueden tener los hijos?) | opciones / teclado |
| 9-10 | Herencia ligada al X (daltonismo, hemofilia); leer un árbol genealógico; Chargaff (si hay 30 % de A, ¿cuánta G?); tipos de mutación | opciones / teclado |

- **Todo se calcula:** las secuencias, los cuadros de Punnett, las proporciones y los porcentajes salen del código; no hay ninguna respuesta escrita a mano.
- **Dibujo en la pregunta:** la hebra de ADN, el cuadro de Punnett vacío o el árbol genealógico.
- **Animación al responder bien:** el cuadro se llena con los gametos y se arma la barra de proporciones.

### Modo 4 · Sistemas del cuerpo (`vitalia_sistemas`), cómo funcionan

| Niveles | Qué se pregunta | Cómo se responde |
|---|---|---|
| 1-2 | Qué sistema hace qué (digestivo, circulatorio, respiratorio, excretor, nervioso, endocrino, inmune, reproductor) | opciones |
| 3-4 | Digestión: dónde se digiere y dónde se absorbe cada nutriente; qué enzima actúa (amilasa, pepsina, lipasa) | opciones |
| 5-6 | El recorrido de la sangre (circulación mayor y menor, en orden); arterias, venas y capilares; intercambio de gases en el alvéolo | opciones / tocar |
| 7-8 | Riñón y nefrona (filtrar, reabsorber, secretar); hormonas: glándula → hormona → efecto (insulina, glucagón, adrenalina, tiroxina, ADH) | opciones |
| 9-10 | Defensas: inmunidad innata y adquirida, anticuerpos, vacunas; homeostasis y retroalimentación (glucosa en sangre, temperatura); sinapsis y reflejo (cómo viaja el impulso, no los nombres de los nervios) | opciones |

- **Dibujo en la pregunta:** la silueta del sistema con el camino marcado hasta un punto.
- **Animación al responder bien:** un punto recorre el camino completo; la sangre pasa de azul a roja al cruzar los pulmones.

### Modo 5 · Reinos y clasificación (`vitalia_reinos`)

| Niveles | Qué se pregunta | Cómo se responde |
|---|---|---|
| 1-2 | ¿A qué reino pertenece? (organismos comunes: perro, helecho, champiñón, ameba, bacteria) | opciones |
| 3-4 | Rasgos de cada reino: núcleo, pared celular, cómo se alimenta (autótrofo o heterótrofo), una o muchas células | opciones |
| 5-6 | Animales: las 5 clases de vertebrados (rasgos: piel, respiración, reproducción, temperatura) e invertebrados (artrópodos, moluscos, anélidos, cnidarios…) | opciones |
| 7-8 | Plantas: musgos, helechos, gimnospermas, angiospermas (vasos, semillas, flores, frutos); hongos (levaduras, mohos, setas) y protistas | opciones |
| 9-10 | Taxonomía: orden de las categorías (dominio → especie); nombre científico bien escrito (*Homo sapiens*); los 3 dominios | opciones |

- **Dibujo en la pregunta:** la silueta del organismo, o las tarjetas de rasgos.
- **Animación al responder bien:** el organismo vuela a su columna del reino.

### Modo 6 (opcional) · Ecología (`vitalia_ecologia`)

| Niveles | Qué se pregunta | Cómo se responde |
|---|---|---|
| 1-4 | Productor, consumidor y descomponedor; armar la cadena alimentaria | opciones |
| 5-7 | Regla del 10 %: cuánta energía llega al nivel 3 o 4 (calculado) | teclado |
| 8-10 | Relaciones (mutualismo, parasitismo, competencia); ciclos del carbono y del agua | opciones |

---

## 5. Biología (Vitalia): lecciones de Aprender

Cinco bloques (más Ecología si se aprueba), con desbloqueo independiente. **Total: 22 Técnicas + 30 Clases**, y 4 + 4 más con Ecología. La Clase 1.1 es la gratis del mundo.

### 5.1 Animaciones propias de Vitalia (`vitalia.*`)

| Animación | Qué se ve |
|---|---|
| `celula` | Una célula donde los organelos se iluminan de a uno con su nombre y su función en una línea. Con un interruptor animal ↔ vegetal, aparecen o se van la pared, los cloroplastos y la vacuola grande. También hay una vista procariota al lado (sin núcleo, con su ADN suelto). |
| `membrana` | La bicapa con partículas que cruzan: difusión (de donde hay más a donde hay menos), ósmosis (el agua entra o sale y la célula se hincha o se arruga) y la bomba que gasta ATP para empujar contra la corriente. |
| `division` | Los cromosomas pasan por las fases de la mitosis (se condensan, se alinean, se separan, se forman dos células); en meiosis, el entrecruzamiento y las dos divisiones, con un contador 2n → n. |
| `energia` | El cloroplasto y la mitocondria lado a lado: CO₂, agua y luz entran a uno y sale glucosa y O₂, que entran al otro y sale ATP. El ciclo se cierra. |
| `adn` | La doble hélice se abre, las bases se emparejan (A-T, G-C); en la transcripción se arma el ARN mensajero (con U); en la traducción, el ribosoma lee de a 3 letras y suelta un aminoácido por codón. |
| `punnett` | Los gametos de cada padre entran por los bordes, llenan el cuadro casilla por casilla, las casillas se colorean por fenotipo y se arma la barra de proporciones (3:1, 9:3:3:1…). |
| `pedigri` | Un árbol genealógico con los símbolos que se van rellenando generación por generación; en herencia ligada al X, se marca qué X lleva el alelo. |
| `recorrido` | La silueta de un sistema (circulatorio, digestivo, respiratorio, urinario) con un punto que recorre el camino en orden y deja su rastro; en la sangre, el color cambia al pasar por los pulmones. |
| `hormona` | Una glándula suelta su hormona, que viaja por la sangre hasta el órgano blanco; en la retroalimentación, un medidor (glucosa o temperatura) sube y baja y el cuerpo lo corrige. |
| `defensa` | Un patógeno entra, llegan los glóbulos blancos y los anticuerpos se pegan; con vacuna, la segunda vez la respuesta llega más rápido y más fuerte (dos curvas). |
| `arbol` | El árbol de clasificación se despliega de dominio a especie con un ejemplo (el ser humano, el perro, el roble), y cada nivel agrega su rasgo. |
| `reinos` | Tarjetas de organismos que se reparten en columnas por reino según sus rasgos (núcleo, pared, cómo se alimenta). |
| `plantas` | La línea de las plantas: musgo → helecho → pino → planta con flor, y en cada paso aparece lo nuevo (vasos, semilla, flor y fruto). |
| `cadena` | (Si va Ecología) la pirámide trófica con la energía que se achica al 10 % en cada nivel. |

Además está `cuadros`, la genérica.

### 5.2 Lecciones por bloque

**Bloque 1 · La célula**

| # | Tipo | Lección | Qué enseña | Animación |
|---|---|---|---|---|
| T1 | Técnica | Animal o vegetal en 3 pistas | Pared, cloroplastos y una vacuola grande = vegetal | `celula` |
| T2 | Técnica | Cada organelo, un oficio | La mitocondria es la central de energía, el ribosoma la fábrica, el Golgi el correo… | `celula` |
| T3 | Técnica | Ósmosis sin confundirse | El agua va hacia donde hay más sal | `membrana` |
| T4 | Técnica | Biomoléculas por su ladrillo | Glucosa → carbohidratos, aminoácido → proteínas, nucleótido → ADN | `cuadros` |
| C1.1 | Clase (gratis) | ¿Qué es una célula? | Teoría celular; procariotas y eucariotas | `celula` |
| C1.2 | Clase | Los organelos | Estructura y función de cada uno | `celula` |
| C1.3 | Clase | Célula animal y vegetal | En qué se parecen y en qué no | `celula` |
| C1.4 | Clase | La membrana y el transporte | Difusión, ósmosis, transporte activo; medios hipo, iso e hipertónicos | `membrana` |
| C1.5 | Clase | Biomoléculas y enzimas | Las cuatro familias y cómo trabaja una enzima | `cuadros`, `membrana` |

**Bloque 2 · Procesos celulares**

| # | Tipo | Lección | Qué enseña | Animación |
|---|---|---|---|---|
| T5 | Técnica | Fotosíntesis y respiración son espejo | Lo que una toma, la otra lo da | `energia` |
| T6 | Técnica | PMAT: el orden de la mitosis | Profase, metafase, anafase, telofase | `division` |
| T7 | Técnica | Contar cromosomas | Mitosis conserva 2n; meiosis deja n | `division` |
| T8 | Técnica | ¿Con oxígeno o sin? | Respiración (≈36 ATP) o fermentación (2 ATP) | `energia` |
| C2.1 | Clase | Fotosíntesis | Fase luminosa y ciclo de Calvin, dónde ocurren y para qué | `energia` |
| C2.2 | Clase | Respiración celular | Glucólisis, ciclo de Krebs y cadena respiratoria, en simple | `energia` |
| C2.3 | Clase | Fermentación | Láctica y alcohólica: el pan, el yogur, el músculo cansado | `energia` |
| C2.4 | Clase | Ciclo celular y mitosis | G1, S, G2 y M; las fases con dibujo | `division` |
| C2.5 | Clase | Meiosis | Por qué existe, entrecruzamiento y variedad | `division` |

**Bloque 3 · Genética**

| # | Tipo | Lección | Qué enseña | Animación |
|---|---|---|---|---|
| T9 | Técnica | La hebra complementaria al toque | A con T, G con C; en ARN, A con U | `adn` |
| T10 | Técnica | Punnett en 30 segundos | Armar el cuadro y contar casillas | `punnett` |
| T11 | Técnica | 9:3:3:1 sin dibujar 16 casillas | Multiplicar las probabilidades de cada rasgo | `punnett` |
| T12 | Técnica | Chargaff en un paso | A = T y G = C; las cuatro suman 100 % | `adn` |
| T13 | Técnica | Leer la tabla de codones | Primera letra a la izquierda, segunda arriba, tercera a la derecha | `adn` |
| C3.1 | Clase | ADN, genes y cromosomas | Qué es cada cosa y cómo se guarda la información | `adn` |
| C3.2 | Clase | De ADN a proteína | Transcripción y traducción | `adn` |
| C3.3 | Clase | Mendel y la herencia | Dominante, recesivo, genotipo y fenotipo; cruces de un rasgo | `punnett` |
| C3.4 | Clase | Cruces de dos rasgos | Segregación independiente y 9:3:3:1 | `punnett` |
| C3.5 | Clase | Más allá de Mendel | Dominancia incompleta, codominancia y grupos ABO | `punnett` |
| C3.6 | Clase | Herencia ligada al sexo y árboles genealógicos | Daltonismo, hemofilia y cómo leer un pedigrí | `pedigri` |

**Bloque 4 · Sistemas del cuerpo**

| # | Tipo | Lección | Qué enseña | Animación |
|---|---|---|---|---|
| T14 | Técnica | Arterias salen, venas vuelven | La regla del corazón, con la excepción pulmonar | `recorrido` |
| T15 | Técnica | La digestión por estaciones | Boca (almidón), estómago (proteínas), intestino delgado (todo y se absorbe) | `recorrido` |
| T16 | Técnica | Insulina baja, glucagón sube | Para no confundirlas nunca | `hormona` |
| T17 | Técnica | Innata o adquirida | Rápida y general, o lenta y con memoria | `defensa` |
| C4.1 | Clase | Digestión | Mecánica y química, enzimas y absorción | `recorrido` |
| C4.2 | Clase | Circulación | Corazón, circulación mayor y menor, vasos y sangre | `recorrido` |
| C4.3 | Clase | Respiración | Del aire al alvéolo y a la sangre | `recorrido` |
| C4.4 | Clase | Excreción | El riñón y la nefrona | `recorrido` |
| C4.5 | Clase | Hormonas y homeostasis | Glándulas, hormonas y retroalimentación | `hormona` |
| C4.6 | Clase | Defensas del cuerpo | Barreras, glóbulos blancos, anticuerpos y vacunas | `defensa` |
| C4.7 | Clase | El impulso nervioso | Neurona, sinapsis y arco reflejo (cómo funciona, sin repetir los nombres de Anatomía) | `recorrido` |

**Bloque 5 · Reinos y clasificación**

| # | Tipo | Lección | Qué enseña | Animación |
|---|---|---|---|---|
| T18 | Técnica | El reino en 3 preguntas | ¿Tiene núcleo? ¿Tiene pared? ¿Fabrica su comida? | `reinos` |
| T19 | Técnica | Vertebrados por la piel | Pelo, plumas, escamas secas, escamas húmedas o piel desnuda | `reinos` |
| T20 | Técnica | Plantas: vasos, semillas, flores | Cada grupo agrega una cosa | `plantas` |
| T21 | Técnica | «Doña Reina Fue Con Once Feos Gatos Enanos» | Recordar el orden de las categorías: dominio, reino, filo, clase, orden, familia, género, especie | `arbol` |
| T22 | Técnica | Escribir un nombre científico | Género con mayúscula, especie con minúscula, en cursiva | `arbol` |
| C5.1 | Clase | Clasificar a los seres vivos | Por qué y cómo; los reinos | `reinos` |
| C5.2 | Clase | Bacterias y protistas | Lo más pequeño y lo más antiguo | `celula`, `reinos` |
| C5.3 | Clase | Hongos | Ni planta ni animal: levaduras, mohos y setas | `reinos` |
| C5.4 | Clase | Plantas | De los musgos a las flores | `plantas` |
| C5.5 | Clase | Animales invertebrados | Los grandes grupos y sus rasgos | `reinos` |
| C5.6 | Clase | Animales vertebrados | Las 5 clases | `reinos` |
| C5.7 | Clase | Taxonomía y los 3 dominios | Categorías, nombre científico, Bacteria, Archaea y Eukarya | `arbol` |

**Bloque 6 (opcional) · Ecología:** 4 Técnicas (cadena en 3 eslabones, regla del 10 %, relaciones por «quién gana», ciclo del carbono en 4 flechas) y 4 Clases (ecosistema y niveles tróficos, flujo de energía, relaciones entre especies, ciclos de la materia), con `cadena`, `recorrido` y `cuadros`.

---

## 6. Lo que no entra en este plan (para la etapa de hacerlos)

Cuando se aprueben nombre, modos y lecciones, se hacen igual que Estadística, Naipia y Codia:
- la fontanería compartida de los 2 mundos en una pasada;
- un mundo a la vez: generador con tests, Aprender, demo, app y anuncio;
- las migraciones (mundo y contenido);
- la traducción al inglés;
- la fila de PARIDAD.

Eso viene después de aprobar este documento.

---

## 7. Decisiones (con mi recomendación)

1. **Nombres:** Dinamia y Vitalia (recomendado), o Física y Biología a secas. *Recomiendo Dinamia y Vitalia: siguen el estilo de las ciudades inventadas y suenan a lugar.*
2. **Gravedad:** g = 10 m/s² hasta el nivel 6 y 9,8 desde el 7, siempre escrita en el enunciado. *Recomendado:* deja hacer cuentas de cabeza al principio sin enseñar algo falso.
3. **Física, 6 modos:** cinemática, vectores, Newton, energía, termodinámica, fluidos. *Recomendado:* «energía» va aparte de Newton porque si no, el modo Newton queda demasiado largo.
4. **Ondas y óptica:** ¿entran ya como modo 7 o en una segunda tanda? *Recomiendo segunda tanda,* para no alargar este lanzamiento.
5. **Ecología en Biología:** ¿entra como modo 6? *Recomiendo que sí:* es corta, se juega bien y cierra el mundo (de la célula al ecosistema).
6. **«Tocar en el dibujo»:** generalizar lo del esqueleto de Anatomía para señalar organelos y partes de los sistemas. *Recomendado:* sin eso, Biología queda solo con opciones.
7. **Clasificación:** los 5 reinos de colegio (Monera, Protista, Fungi, Plantae, Animalia) como base y los 3 dominios en el nivel 9-10 y en la Clase 5.7. *Recomendado:* es lo que se ve en el colegio, sin esconder lo actual.
8. **Colores:** azul rey para Física y verde hoja para Biología. *Si al verlo en el teléfono Vitalia se confunde con Enigmia, se pasa a verde bosque.*
