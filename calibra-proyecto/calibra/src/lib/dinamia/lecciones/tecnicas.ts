import type { LeccionDinamia } from "./tipos";

// Las 24 Técnicas de Dinamia (gratis): atajos cortos, uno por idea, con su
// animación y 2 preguntas para darla por aprendida. g = 10 m/s² en todas.
type Tecnica = Omit<LeccionDinamia, "orden" | "requierePro">;

const T: Tecnica[] = [
  // ---------- Cinemática ----------
  {
    slug: "dinamia-kmh-a-ms",
    grupo: "cinematica",
    nombre: "Pasar km/h a m/s de cabeza",
    descripcion: "Divide entre 3,6 para ir a m/s; multiplica por 3,6 para volver.",
    pasos: [
      "Una hora tiene $3600$ s y un kilómetro tiene $1000$ m. Por eso $1\\ \\text{km/h} = \\dfrac{1000}{3600}\\ \\text{m/s} = \\dfrac{1}{3{,}6}\\ \\text{m/s}$.",
      "Para pasar de km/h a m/s, **divide entre 3,6**: $72\\ \\text{km/h} \\div 3{,}6 = 20\\ \\text{m/s}$.",
      "Para volver, **multiplica por 3,6**: $15\\ \\text{m/s} \\cdot 3{,}6 = 54\\ \\text{km/h}$.",
      "Ancla para chequear: $36\\ \\text{km/h} = 10\\ \\text{m/s}$. Si tu resultado en m/s es más grande que en km/h, te equivocaste de operación.",
    ],
    visuales: [
      {
        tipo: "cuadros",
        cuadros: [
          { texto: "Una hora son 3600 segundos; un kilómetro, 1000 metros.", formula: "1\\ \\text{km/h} = \\frac{1000\\ \\text{m}}{3600\\ \\text{s}} = \\frac{1}{3{,}6}\\ \\text{m/s}" },
          { texto: "De km/h a m/s: divide.", formula: "90 \\div 3{,}6 = 25", resaltar: "$90\\ \\text{km/h} = 25\\ \\text{m/s}$" },
          { texto: "De m/s a km/h: multiplica.", formula: "20 \\cdot 3{,}6 = 72", resaltar: "$20\\ \\text{m/s} = 72\\ \\text{km/h}$" },
        ],
      },
    ],
    quiz: [
      { pregunta: "¿Cuánto es $108\\ \\text{km/h}$ en m/s?", opciones: ["30 m/s", "388,8 m/s", "10,8 m/s", "300 m/s"], respuesta: "30 m/s", explicacion: "$108 \\div 3{,}6 = 30$." },
      { pregunta: "¿Cuánto es $5\\ \\text{m/s}$ en km/h?", opciones: ["18 km/h", "1,4 km/h", "50 km/h", "36 km/h"], respuesta: "18 km/h", explicacion: "$5 \\cdot 3{,}6 = 18$." },
    ],
  },
  {
    slug: "dinamia-triangulo-dvt",
    grupo: "cinematica",
    nombre: "El triángulo d-v-t",
    descripcion: "Tapa lo que buscas y el triángulo te dice si multiplicar o dividir.",
    pasos: [
      "Dibuja un triángulo con $d$ arriba y $v$, $t$ abajo. Es la misma fórmula $d = v \\cdot t$ escrita de tres maneras.",
      "¿Buscas la distancia? Tapa $d$: quedan $v$ y $t$ lado a lado, así que se **multiplican**: $d = v \\cdot t$.",
      "¿Buscas la velocidad o el tiempo? Tapa esa letra: queda $d$ arriba de la otra, así que se **divide**: $v = \\dfrac{d}{t}$, $t = \\dfrac{d}{v}$.",
      "Solo vale con velocidad constante, y con unidades que combinen: metros con m/s y segundos.",
    ],
    visuales: [{ tipo: "dinamia.trayecto", v0: 6, a: 0, segundos: 5, titulo: "A 6 m/s, cada segundo suma 6 m: en 5 s, $d = 6 \\cdot 5 = 30$ m" }],
    quiz: [
      { pregunta: "Un ciclista recorre $120$ m en $8$ s a velocidad constante. ¿Qué velocidad lleva?", opciones: ["15 m/s", "960 m/s", "112 m/s", "0,07 m/s"], respuesta: "15 m/s", explicacion: "Tapa $v$: $v = \\dfrac{d}{t} = \\dfrac{120}{8} = 15$ m/s." },
      { pregunta: "¿Cuánto tarda en recorrer $200$ m alguien que va a $4$ m/s?", opciones: ["50 s", "800 s", "196 s", "0,02 s"], respuesta: "50 s", explicacion: "Tapa $t$: $t = \\dfrac{d}{v} = \\dfrac{200}{4} = 50$ s." },
    ],
  },
  {
    slug: "dinamia-caida-con-g-10",
    grupo: "cinematica",
    nombre: "Caída libre con g = 10",
    descripcion: "Velocidades 10, 20, 30…; distancias 5, 20, 45…: los cuadrados.",
    pasos: [
      "Con $g = 10\\ \\text{m/s}^2$, algo que se suelta gana $10$ m/s cada segundo: a los $1, 2, 3$ s va a $10, 20, 30$ m/s ($v = 10 \\cdot t$).",
      "La distancia caída es $d = 5 \\cdot t^2$: a los $1, 2, 3, 4$ s lleva $5, 20, 45, 80$ m. Son $5$ veces los cuadrados $1, 4, 9, 16$.",
      "Por eso cada segundo cae más que el anterior: $5, 15, 25, 35$ m (los impares por 5).",
      "Si te dan la altura, despeja el tiempo: $t = \\sqrt{\\dfrac{d}{5}}$. Desde $45$ m tarda $\\sqrt{9} = 3$ s.",
    ],
    visuales: [{ tipo: "dinamia.caida", g: 10, v0: 0, segundos: 3, titulo: "Marcas cada medio segundo: cada vez más separadas" }],
    quiz: [
      { pregunta: "Una piedra cae libre durante $4$ s ($g = 10$). ¿Cuántos metros cayó?", opciones: ["80 m", "40 m", "160 m", "20 m"], respuesta: "80 m", explicacion: "$d = 5 \\cdot t^2 = 5 \\cdot 16 = 80$ m." },
      { pregunta: "¿A qué velocidad va a los $2{,}5$ s de soltarla?", opciones: ["25 m/s", "12,5 m/s", "31,25 m/s", "10 m/s"], respuesta: "25 m/s", explicacion: "$v = 10 \\cdot 2{,}5 = 25$ m/s." },
    ],
  },
  {
    slug: "dinamia-leer-grafica",
    grupo: "cinematica",
    nombre: "Leer una gráfica sin calcular",
    descripcion: "Recta: velocidad constante. Curva: acelera. Horizontal: quieto.",
    pasos: [
      "En una gráfica **posición-tiempo** ($x$-$t$), la inclinación es la velocidad: más empinada, más rápido.",
      "Una **recta inclinada** es velocidad constante; una **horizontal**, que está quieto; una **curva** que se empina, que acelera.",
      "En una gráfica **velocidad-tiempo** ($v$-$t$), una horizontal es velocidad constante y una recta inclinada es aceleración constante.",
      "Bonus: en $v$-$t$, el **área** debajo de la línea es la distancia recorrida.",
    ],
    visuales: [
      { tipo: "dinamia.grafica", eje: "x-t", v0: 1, a: 1, segundos: 4, titulo: "Curva que se empina: el móvil acelera" },
      { tipo: "dinamia.grafica", eje: "v-t", v0: 8, a: 0, segundos: 4, titulo: "En $v$-$t$, horizontal = velocidad constante; el área es la distancia" },
    ],
    quiz: [
      { pregunta: "En una gráfica $x$-$t$, el tramo es una línea horizontal. ¿Qué hace el móvil?", opciones: ["Está quieto", "Va a velocidad constante", "Acelera", "Frena"], respuesta: "Está quieto", explicacion: "Si la posición no cambia con el tiempo, no se mueve." },
      { pregunta: "En una gráfica $v$-$t$, la línea es horizontal en $10$ m/s durante $3$ s. ¿Cuánto recorrió?", opciones: ["30 m", "10 m", "3,3 m", "13 m"], respuesta: "30 m", explicacion: "El área es un rectángulo: $10 \\cdot 3 = 30$ m." },
    ],
  },
  // ---------- Vectores ----------
  {
    slug: "dinamia-triangulos-conocidos",
    grupo: "vectores",
    nombre: "Triángulos que ya sabes",
    descripcion: "3-4-5 y sus múltiplos: el módulo sale sin hacer la raíz.",
    pasos: [
      "El módulo de un vector $(x, y)$ es $\\sqrt{x^2 + y^2}$. Pero hay ternas que conviene reconocer de vista.",
      "$3$-$4$-$5$: el vector $(3, 4)$ mide $5$. Sus múltiplos también: $(6, 8)$ mide $10$; $(9, 12)$, $15$.",
      "Otras dos útiles: $5$-$12$-$13$ y $8$-$15$-$17$.",
      "Los signos no cambian el módulo: $(-6, 8)$ y $(6, -8)$ también miden $10$.",
    ],
    visuales: [{ tipo: "dinamia.vectores", modo: "componentes", vectores: [{ nombre: "F", x: 6, y: 8 }], titulo: "$(6, 8)$ es el doble de $(3, 4)$: mide $10$" }],
    quiz: [
      { pregunta: "¿Cuánto mide el vector $(9, 12)$?", opciones: ["15", "21", "10,5", "225"], respuesta: "15", explicacion: "Es $3 \\cdot (3, 4)$, así que mide $3 \\cdot 5 = 15$." },
      { pregunta: "¿Cuánto mide el vector $(-5, 12)$?", opciones: ["13", "7", "17", "-13"], respuesta: "13", explicacion: "Terna $5$-$12$-$13$; el signo no importa." },
    ],
  },
  {
    slug: "dinamia-seno-o-coseno",
    grupo: "vectores",
    nombre: "Seno o coseno, ¿cuál va?",
    descripcion: "La componente pegada al ángulo lleva coseno; la de enfrente, seno.",
    pasos: [
      "Un vector de módulo $F$ forma un ángulo $\\theta$ con el eje $x$. Quieres sus componentes.",
      "La componente **pegada** al ángulo (la que forma el ángulo con el vector) lleva **coseno**: $F_x = F \\cos\\theta$.",
      "La de **enfrente** lleva **seno**: $F_y = F \\sin\\theta$.",
      "Si el ángulo se mide desde el eje $y$, se invierten: la pegada ahora es $F_y$. Por eso conviene mirar dónde está el ángulo y no memorizar «x es coseno».",
    ],
    visuales: [{ tipo: "dinamia.vectores", modo: "componentes", vectores: [{ nombre: "F", x: 8, y: 6 }], titulo: "$F = 10$; la pegada al ángulo con el eje $x$ es $F_x = 8$" }],
    quiz: [
      { pregunta: "Una fuerza de $20$ N forma $60^\\circ$ con el eje $x$. ¿Cuánto vale $F_x$? ($\\cos 60^\\circ = 0{,}5$)", opciones: ["10 N", "17,3 N", "20 N", "40 N"], respuesta: "10 N", explicacion: "La pegada al ángulo lleva coseno: $20 \\cdot 0{,}5 = 10$ N." },
      { pregunta: "Una cuerda tira con $10$ N formando $30^\\circ$ con la **vertical**. ¿Cuánto vale la componente vertical? ($\\cos 30^\\circ \\approx 0{,}87$)", opciones: ["8,7 N", "5 N", "10 N", "3 N"], respuesta: "8,7 N", explicacion: "El ángulo está pegado a la vertical, así que ella lleva coseno: $10 \\cdot 0{,}87 = 8{,}7$ N." },
    ],
  },
  {
    slug: "dinamia-sumar-por-componentes",
    grupo: "vectores",
    nombre: "Sumar por componentes",
    descripcion: "Suma todas las x, suma todas las y, y recién después saca el módulo.",
    pasos: [
      "Los módulos **no** se suman directamente: dos fuerzas de $3$ N y $4$ N pueden dar $1$, $5$ o $7$ N según hacia dónde apunten.",
      "Lo que sí se suma son las componentes: $R = (A_x + B_x,\\ A_y + B_y)$.",
      "Ejemplo: $A = (3, 0)$ y $B = (0, 4)$ dan $R = (3, 4)$, que mide $5$.",
      "Recién al final se saca el módulo de $R$ con Pitágoras.",
    ],
    visuales: [{ tipo: "dinamia.vectores", modo: "suma", vectores: [{ nombre: "A", x: 3, y: 0 }, { nombre: "B", x: 0, y: 4 }], titulo: "Punta con cola: la resultante va del inicio al final" }],
    quiz: [
      { pregunta: "Suma $A = (2, 5)$ y $B = (4, 3)$. ¿Cuál es la resultante?", opciones: ["(6, 8)", "(8, 6)", "(2, -2)", "(6, 15)"], respuesta: "(6, 8)", explicacion: "$x$: $2 + 4 = 6$; $y$: $5 + 3 = 8$." },
      { pregunta: "¿Cuánto mide esa resultante $(6, 8)$?", opciones: ["10", "14", "48", "100"], respuesta: "10", explicacion: "Terna $6$-$8$-$10$ (el doble de $3$-$4$-$5$)." },
    ],
  },
  {
    slug: "dinamia-equilibrante",
    grupo: "vectores",
    nombre: "La equilibrante",
    descripcion: "Es la resultante dada vuelta: mismo tamaño, sentido contrario.",
    pasos: [
      "Un cuerpo está en equilibrio cuando la suma de todas las fuerzas es cero.",
      "Si ya hay fuerzas con resultante $R$, la fuerza que falta para equilibrar es $E = -R$: mismo módulo, sentido contrario.",
      "Ejemplo: $F_1 = (5, 0)$ y $F_2 = (-2, 4)$ dan $R = (3, 4)$. La equilibrante es $E = (-3, -4)$, de módulo $5$.",
    ],
    visuales: [{ tipo: "dinamia.vectores", modo: "equilibrante", vectores: [{ nombre: "F₁", x: 5, y: 0 }, { nombre: "F₂", x: -2, y: 4 }], titulo: "La equilibrante cierra la suma en cero" }],
    quiz: [
      { pregunta: "Dos fuerzas suman $R = (6, -8)$ N. ¿Cuál es la equilibrante?", opciones: ["(-6, 8) N", "(6, -8) N", "(8, -6) N", "(0, 0) N"], respuesta: "(-6, 8) N", explicacion: "$E = -R$: se cambian los dos signos." },
      { pregunta: "¿Cuánto mide esa equilibrante?", opciones: ["10 N", "14 N", "2 N", "-10 N"], respuesta: "10 N", explicacion: "Mide lo mismo que la resultante: $\\sqrt{36 + 64} = 10$ N." },
    ],
  },
  // ---------- Leyes de Newton ----------
  {
    slug: "dinamia-masa-y-peso",
    grupo: "newton",
    nombre: "Masa y peso no son lo mismo",
    descripcion: "La masa (kg) no cambia; el peso (N) es masa por g y depende del lugar.",
    pasos: [
      "La **masa** es cuánta materia tiene un cuerpo y se mide en kilogramos. Es la misma en la Tierra, la Luna o el espacio.",
      "El **peso** es la fuerza con que la gravedad lo atrae: $P = m \\cdot g$, en newtons. En la Tierra, con $g = 10$, una persona de $50$ kg pesa $500$ N.",
      "En la Luna, $g \\approx 1{,}6\\ \\text{m/s}^2$: la misma persona sigue teniendo $50$ kg, pero pesa $80$ N.",
      "Para volver del peso a la masa, divide entre $g$: $300\\ \\text{N} \\div 10 = 30$ kg.",
    ],
    visuales: [
      {
        tipo: "cuadros",
        cuadros: [
          { texto: "Masa: cuánta materia hay. No depende del lugar.", resaltar: "$50$ kg en la Tierra = $50$ kg en la Luna" },
          { texto: "Peso: la fuerza de la gravedad sobre esa masa.", formula: "P = m \\cdot g" },
          { texto: "En la Tierra", formula: "P = 50 \\cdot 10 = 500\\ \\text{N}" },
          { texto: "En la Luna", formula: "P = 50 \\cdot 1{,}6 = 80\\ \\text{N}", resaltar: "Misma masa, otro peso" },
        ],
      },
    ],
    quiz: [
      { pregunta: "Un astronauta tiene $70$ kg en la Tierra. ¿Cuál es su masa en la Luna?", opciones: ["70 kg", "11,2 kg", "700 kg", "0 kg"], respuesta: "70 kg", explicacion: "La masa no depende del lugar; lo que cambia es el peso." },
      { pregunta: "Una caja pesa $250$ N en la Tierra ($g = 10$). ¿Qué masa tiene?", opciones: ["25 kg", "2500 kg", "250 kg", "2,5 kg"], respuesta: "25 kg", explicacion: "$m = \\dfrac{P}{g} = \\dfrac{250}{10} = 25$ kg." },
    ],
  },
  {
    slug: "dinamia-cuerpo-libre-4-pasos",
    grupo: "newton",
    nombre: "Diagrama de cuerpo libre en 4 pasos",
    descripcion: "Peso siempre; normal si toca algo; rozamiento contra el movimiento; tensión si hay cuerda.",
    pasos: [
      "Dibuja el cuerpo solo, como un punto o un bloque, y agrega las fuerzas en este orden:",
      "1) **Peso**, siempre, hacia abajo. 2) **Normal**, si apoya en una superficie, perpendicular a ella.",
      "3) **Rozamiento**, si hay roce, a lo largo de la superficie y en contra del movimiento. 4) **Tensión**, si hay una cuerda, tirando a lo largo de ella.",
      "Después suma: si la fuerza neta es cero, el cuerpo sigue igual; si no, acelera hacia donde apunta la neta.",
    ],
    visuales: [{ tipo: "dinamia.cuerpoLibre", situacion: "empujado", masa: 10, empuje: 50, mu: 0.2, titulo: "Una caja empujada sobre el piso, fuerza por fuerza" }],
    quiz: [
      { pregunta: "Un libro quieto sobre una mesa. ¿Qué fuerzas actúan sobre él?", opciones: ["Peso y normal", "Solo el peso", "Peso, normal y rozamiento", "Peso y tensión"], respuesta: "Peso y normal", explicacion: "Está apoyado (normal) y nada lo empuja de costado, así que no hay rozamiento." },
      { pregunta: "Una lámpara cuelga quieta de un cable. ¿Qué fuerzas actúan sobre ella?", opciones: ["Peso y tensión", "Peso y normal", "Solo la tensión", "Tensión y rozamiento"], respuesta: "Peso y tensión", explicacion: "No toca ninguna superficie: no hay normal; el cable tira hacia arriba." },
    ],
  },
  {
    slug: "dinamia-plano-inclinado-ejes",
    grupo: "newton",
    nombre: "Plano inclinado: el truco de los ejes",
    descripcion: "Inclina los ejes con la rampa: m·g·sen θ es lo que la tira hacia abajo.",
    pasos: [
      "En una rampa no conviene usar ejes horizontal y vertical. Inclínalos: un eje **a lo largo** de la rampa y otro **perpendicular**.",
      "Así, la normal y el rozamiento quedan sobre los ejes, y solo hay que descomponer el peso.",
      "La parte del peso que la tira rampa abajo es $m g \\sin\\theta$; la que aprieta contra la rampa es $m g \\cos\\theta$, y es igual a la normal.",
      "Sin rozamiento, la aceleración rampa abajo es $a = g \\sin\\theta$: no depende de la masa.",
    ],
    visuales: [{ tipo: "dinamia.cuerpoLibre", situacion: "plano", masa: 4, angulo: 30, mu: 0.1, titulo: "Rampa de $30^\\circ$: el peso se reparte entre los dos ejes" }],
    quiz: [
      { pregunta: "Un bloque de $6$ kg en una rampa de $30^\\circ$ sin rozamiento. ¿Qué fuerza lo tira rampa abajo? ($g = 10$; $\\sin 30^\\circ = 0{,}5$)", opciones: ["30 N", "60 N", "52 N", "3 N"], respuesta: "30 N", explicacion: "$m g \\sin\\theta = 6 \\cdot 10 \\cdot 0{,}5 = 30$ N." },
      { pregunta: "¿Con qué aceleración baja?", opciones: ["5 m/s²", "10 m/s²", "30 m/s²", "0,5 m/s²"], respuesta: "5 m/s²", explicacion: "$a = g \\sin\\theta = 10 \\cdot 0{,}5 = 5\\ \\text{m/s}^2$." },
    ],
  },
  {
    slug: "dinamia-bloques-como-uno",
    grupo: "newton",
    nombre: "Sistemas de bloques como uno solo",
    descripcion: "Aceleración = fuerza neta de afuera ÷ masa total.",
    pasos: [
      "Si varios bloques se mueven juntos (pegados o unidos por una cuerda tensa), tienen la misma aceleración.",
      "Trátalos como **un solo cuerpo** con la masa total. Las fuerzas entre ellos (tensiones, empujones de uno a otro) se cancelan.",
      "Entonces $a = \\dfrac{F_{\\text{neta de afuera}}}{m_{\\text{total}}}$.",
      "En una polea con dos masas colgando (máquina de Atwood), la fuerza neta es la diferencia de pesos: $a = \\dfrac{(m_1 - m_2) g}{m_1 + m_2}$.",
    ],
    visuales: [{ tipo: "dinamia.poleas", m1: 3, m2: 2, titulo: "Fuerza neta: $30 - 20 = 10$ N para $5$ kg en total" }],
    quiz: [
      { pregunta: "Empujas con $36$ N dos bloques juntos de $8$ kg y $4$ kg sobre hielo. ¿Qué aceleración tienen?", opciones: ["3 m/s²", "4,5 m/s²", "9 m/s²", "12 m/s²"], respuesta: "3 m/s²", explicacion: "$a = \\dfrac{36}{8 + 4} = 3\\ \\text{m/s}^2$." },
      { pregunta: "En una polea cuelgan $5$ kg y $3$ kg. ¿Qué aceleración tienen? ($g = 10$)", opciones: ["2,5 m/s²", "10 m/s²", "6,7 m/s²", "20 m/s²"], respuesta: "2,5 m/s²", explicacion: "$a = \\dfrac{(5 - 3) \\cdot 10}{5 + 3} = \\dfrac{20}{8} = 2{,}5\\ \\text{m/s}^2$." },
    ],
  },
  // ---------- Trabajo y energía ----------
  {
    slug: "dinamia-signo-del-trabajo",
    grupo: "energia",
    nombre: "El signo del trabajo",
    descripcion: "A favor del movimiento: positivo. En contra: negativo. Perpendicular: cero.",
    pasos: [
      "El trabajo de una fuerza es $W = F \\cdot d \\cdot \\cos\\theta$, con $\\theta$ el ángulo entre la fuerza y el movimiento.",
      "Fuerza **a favor** del movimiento ($\\theta = 0^\\circ$, $\\cos = 1$): trabajo positivo, le da energía.",
      "Fuerza **en contra** ($\\theta = 180^\\circ$, $\\cos = -1$): trabajo negativo, le quita energía. Así trabaja el rozamiento.",
      "Fuerza **perpendicular** ($\\theta = 90^\\circ$, $\\cos = 0$): trabajo cero. La normal y el peso no trabajan si el cuerpo se mueve en horizontal.",
    ],
    visuales: [{ tipo: "dinamia.cuerpoLibre", situacion: "empujado", masa: 10, empuje: 60, mu: 0.3, titulo: "El empuje hace trabajo positivo; el rozamiento, negativo; peso y normal, cero" }],
    quiz: [
      { pregunta: "Arrastras una caja $5$ m por el piso. ¿Cuánto trabajo hace el peso de la caja?", opciones: ["Cero", "Positivo", "Negativo", "Depende de la masa"], respuesta: "Cero", explicacion: "El peso es vertical y el movimiento horizontal: forman $90^\\circ$." },
      { pregunta: "Un rozamiento de $20$ N actúa sobre algo que se desliza $3$ m. ¿Cuánto trabajo hace?", opciones: ["-60 J", "60 J", "0 J", "-23 J"], respuesta: "-60 J", explicacion: "Va en contra del movimiento: $W = -20 \\cdot 3 = -60$ J." },
    ],
  },
  {
    slug: "dinamia-velocidad-abajo-sin-masa",
    grupo: "energia",
    nombre: "La velocidad abajo no depende de la masa",
    descripcion: "Sin rozamiento, v = √(2·g·h): la masa se cancela.",
    pasos: [
      "Algo baja desde una altura $h$ sin rozamiento. La energía potencial de arriba se vuelve cinética abajo: $m g h = \\dfrac{1}{2} m v^2$.",
      "La masa aparece de los dos lados y **se cancela**: $v = \\sqrt{2 g h}$.",
      "Con $g = 10$: desde $5$ m llega a $\\sqrt{100} = 10$ m/s; desde $20$ m, a $\\sqrt{400} = 20$ m/s.",
      "Al revés, para saber hasta dónde sube algo lanzado a $v$: $h = \\dfrac{v^2}{2g} = \\dfrac{v^2}{20}$.",
    ],
    visuales: [{ tipo: "dinamia.energia", masa: 2, altura: 5, titulo: "Toda la potencial se vuelve cinética: $v = \\sqrt{2 \\cdot 10 \\cdot 5} = 10$ m/s" }],
    quiz: [
      { pregunta: "Un carrito de $200$ kg y otro de $50$ kg bajan sin rozamiento desde $45$ m. ¿Cuál llega más rápido abajo?", opciones: ["Llegan igual de rápido", "El de 200 kg", "El de 50 kg", "Depende de la forma de la pista"], respuesta: "Llegan igual de rápido", explicacion: "$v = \\sqrt{2 g h}$ no depende de la masa: los dos llegan a $30$ m/s." },
      { pregunta: "Una patineta sube una rampa a $6$ m/s, sin rozamiento. ¿Hasta qué altura llega?", opciones: ["1,8 m", "3,6 m", "0,6 m", "18 m"], respuesta: "1,8 m", explicacion: "$h = \\dfrac{v^2}{20} = \\dfrac{36}{20} = 1{,}8$ m." },
    ],
  },
  {
    slug: "dinamia-rendimiento",
    grupo: "energia",
    nombre: "Rendimiento en un paso",
    descripcion: "Lo útil dividido entre lo que entra, por 100.",
    pasos: [
      "Ninguna máquina aprovecha toda la energía que recibe: una parte se va en calor, ruido o roce.",
      "El **rendimiento** es $\\eta = \\dfrac{\\text{energía útil}}{\\text{energía que entra}} \\cdot 100\\ \\%$.",
      "Un motor que recibe $1000$ J y entrega $750$ J de trabajo tiene $\\eta = 75\\ \\%$; los $250$ J restantes se fueron en calor.",
      "Nunca puede pasar de $100\\ \\%$: si te da más, invertiste la división.",
    ],
    visuales: [{ tipo: "dinamia.energia", masa: 1, altura: 20, perdida: 0.25, titulo: "Con rozamiento, una parte de la energía se vuelve calor" }],
    quiz: [
      { pregunta: "Una bombilla recibe $60$ J y da $9$ J de luz. ¿Cuál es su rendimiento?", opciones: ["15 %", "6,7 %", "85 %", "51 %"], respuesta: "15 %", explicacion: "$\\dfrac{9}{60} \\cdot 100 = 15\\ \\%$." },
      { pregunta: "Un motor de rendimiento $40\\ \\%$ recibe $500$ J. ¿Cuánto trabajo útil entrega?", opciones: ["200 J", "300 J", "1250 J", "460 J"], respuesta: "200 J", explicacion: "$500 \\cdot 0{,}40 = 200$ J." },
    ],
  },
  {
    slug: "dinamia-choques-suma-igual",
    grupo: "energia",
    nombre: "Choques: suma antes = suma después",
    descripcion: "La cantidad de movimiento total se conserva; plantéala con signos.",
    pasos: [
      "La cantidad de movimiento es $p = m \\cdot v$. En un choque, la **suma** de las de todos los cuerpos es la misma antes y después.",
      "Elige un sentido positivo (por ejemplo, a la derecha). Lo que va al revés lleva signo menos.",
      "Si quedan pegados (choque plástico), los dos salen con la misma velocidad: $v_f = \\dfrac{m_1 v_1 + m_2 v_2}{m_1 + m_2}$.",
      "Ejemplo: $2$ kg a $6$ m/s chocan con $1$ kg quieto y quedan pegados: $v_f = \\dfrac{12}{3} = 4$ m/s.",
    ],
    visuales: [{ tipo: "dinamia.choque", m1: 2, v1: 6, m2: 1, v2: 0, clase: "plastico", titulo: "Antes $12$ kg·m/s; después, también $12$" }],
    quiz: [
      { pregunta: "Un carrito de $3$ kg a $4$ m/s choca con otro de $1$ kg quieto y quedan pegados. ¿A qué velocidad salen?", opciones: ["3 m/s", "4 m/s", "12 m/s", "1 m/s"], respuesta: "3 m/s", explicacion: "$v_f = \\dfrac{3 \\cdot 4 + 0}{4} = 3$ m/s." },
      { pregunta: "Dos carritos de $1$ kg van uno hacia el otro a $5$ m/s cada uno y quedan pegados. ¿A qué velocidad salen?", opciones: ["0 m/s", "5 m/s", "10 m/s", "2,5 m/s"], respuesta: "0 m/s", explicacion: "$p = 1 \\cdot 5 + 1 \\cdot (-5) = 0$: quedan quietos." },
    ],
  },
  // ---------- Termodinámica ----------
  {
    slug: "dinamia-kelvin-en-un-paso",
    grupo: "termo",
    nombre: "Kelvin en un paso",
    descripcion: "Suma 273 a los °C. Y nunca hay kelvin negativos.",
    pasos: [
      "La escala Kelvin empieza en el **cero absoluto**, la temperatura más baja posible: $-273\\ ^\\circ\\text{C}$.",
      "Cada kelvin mide lo mismo que un grado Celsius, así que basta con correr el cero: $T_K = T_{^\\circ\\text{C}} + 273$.",
      "El agua se congela a $273$ K y hierve a $373$ K. Un día de $27\\ ^\\circ\\text{C}$ son $300$ K.",
      "Si te da un número negativo en kelvin, hay un error: no existe nada más frío que $0$ K.",
    ],
    visuales: [{ tipo: "dinamia.termometro", modo: "escalas", temperaturas: [0, 27, 100], titulo: "Las tres escalas suben juntas" }],
    quiz: [
      { pregunta: "¿Cuántos kelvin son $-73\\ ^\\circ\\text{C}$?", opciones: ["200 K", "-200 K", "346 K", "73 K"], respuesta: "200 K", explicacion: "$-73 + 273 = 200$ K." },
      { pregunta: "Un gas está a $350$ K. ¿Cuántos °C son?", opciones: ["77 °C", "623 °C", "-77 °C", "350 °C"], respuesta: "77 °C", explicacion: "$350 - 273 = 77\\ ^\\circ\\text{C}$." },
    ],
  },
  {
    slug: "dinamia-fahrenheit-de-cabeza",
    grupo: "termo",
    nombre: "°F aproximado de cabeza",
    descripcion: "Doble más 30 para estimar; la fórmula exacta para el resultado.",
    pasos: [
      "La fórmula exacta es $^\\circ\\text{F} = ^\\circ\\text{C} \\cdot \\dfrac{9}{5} + 32$.",
      "Para estimar rápido: **el doble, más 30**. $20\\ ^\\circ\\text{C} \\to 40 + 30 = 70$; la exacta da $68\\ ^\\circ\\text{F}$.",
      "Al revés, de °F a °C: **resta 30 y divide entre 2**. Para el resultado exacto: $^\\circ\\text{C} = (^\\circ\\text{F} - 32) \\cdot \\dfrac{5}{9}$.",
      "Ancla: $-40\\ ^\\circ\\text{C} = -40\\ ^\\circ\\text{F}$, el único punto donde coinciden.",
    ],
    visuales: [{ tipo: "dinamia.termometro", modo: "escalas", temperaturas: [-40, 20, 37], titulo: "°C, K y °F de la misma temperatura" }],
    quiz: [
      { pregunta: "¿Cuántos °F son $25\\ ^\\circ\\text{C}$ (exacto)?", opciones: ["77 °F", "80 °F", "45 °F", "57 °F"], respuesta: "77 °F", explicacion: "$25 \\cdot \\dfrac{9}{5} + 32 = 45 + 32 = 77$." },
      { pregunta: "Afuera hacen $86\\ ^\\circ\\text{F}$. ¿Cuántos °C son (exacto)?", opciones: ["30 °C", "28 °C", "54 °C", "43 °C"], respuesta: "30 °C", explicacion: "$(86 - 32) \\cdot \\dfrac{5}{9} = 54 \\cdot \\dfrac{5}{9} = 30$." },
    ],
  },
  {
    slug: "dinamia-gases-que-queda-fijo",
    grupo: "termo",
    nombre: "Gases: la tabla de qué queda fijo",
    descripcion: "Boyle (T fija), Charles (P fija), Gay-Lussac (V fijo).",
    pasos: [
      "Un gas tiene presión $P$, volumen $V$ y temperatura $T$ (siempre en **kelvin**). Si una queda fija, las otras dos cambian con una regla simple.",
      "**Boyle**, $T$ fija: $P_1 V_1 = P_2 V_2$. Si aprietas el gas a la mitad del volumen, la presión se duplica.",
      "**Charles**, $P$ fija: $\\dfrac{V_1}{T_1} = \\dfrac{V_2}{T_2}$. Si duplicas la temperatura en kelvin, se duplica el volumen.",
      "**Gay-Lussac**, $V$ fijo: $\\dfrac{P_1}{T_1} = \\dfrac{P_2}{T_2}$. Por eso no se calienta un aerosol.",
    ],
    visuales: [
      { tipo: "dinamia.particulas", modo: "boyle", valores: [4, 2, 1], inicial: 1, titulo: "Boyle: menos volumen, más choques contra las paredes" },
      { tipo: "dinamia.particulas", modo: "charles", valores: [300, 450, 600], inicial: 2, titulo: "Charles: más temperatura, más volumen" },
    ],
    quiz: [
      { pregunta: "Un gas ocupa $6$ L a $2$ atm. Con la temperatura fija, la presión sube a $3$ atm. ¿Qué volumen ocupa?", opciones: ["4 L", "9 L", "1 L", "12 L"], respuesta: "4 L", explicacion: "Boyle: $2 \\cdot 6 = 3 \\cdot V_2$, así que $V_2 = 4$ L." },
      { pregunta: "Un globo tiene $3$ L a $300$ K. Con la presión fija, se calienta a $400$ K. ¿Qué volumen tiene?", opciones: ["4 L", "2,25 L", "100 L", "3 L"], respuesta: "4 L", explicacion: "Charles: $V_2 = 3 \\cdot \\dfrac{400}{300} = 4$ L." },
    ],
  },
  {
    slug: "dinamia-mezclas-calor",
    grupo: "termo",
    nombre: "Mezclas: el calor que gana uno lo pierde el otro",
    descripcion: "Plantea calor ganado = calor cedido y despeja la temperatura final.",
    pasos: [
      "Si mezclas agua caliente con agua fría (sin pérdidas), el calor que **cede** la caliente es el que **gana** la fría: $m_1 c (T_1 - T_f) = m_2 c (T_f - T_2)$.",
      "Si las dos son agua, $c$ se cancela y la temperatura final es un **promedio pesado** por las masas: $T_f = \\dfrac{m_1 T_1 + m_2 T_2}{m_1 + m_2}$.",
      "Ejemplo: $2$ kg a $80\\ ^\\circ\\text{C}$ con $2$ kg a $20\\ ^\\circ\\text{C}$ dan $50\\ ^\\circ\\text{C}$, justo el medio.",
      "Chequeo: el resultado siempre queda **entre** las dos temperaturas, más cerca de la que tenía más masa.",
    ],
    visuales: [{ tipo: "dinamia.particulas", modo: "temperatura", valores: [280, 315, 350], titulo: "Más temperatura: las partículas se mueven más rápido" }],
    quiz: [
      { pregunta: "Mezclas $3$ kg de agua a $90\\ ^\\circ\\text{C}$ con $1$ kg a $10\\ ^\\circ\\text{C}$. ¿A qué temperatura queda?", opciones: ["70 °C", "50 °C", "40 °C", "80 °C"], respuesta: "70 °C", explicacion: "$\\dfrac{3 \\cdot 90 + 1 \\cdot 10}{4} = \\dfrac{280}{4} = 70\\ ^\\circ\\text{C}$." },
      { pregunta: "¿Cuál de estos resultados es imposible al mezclar agua a $20\\ ^\\circ\\text{C}$ con agua a $60\\ ^\\circ\\text{C}$?", opciones: ["70 °C", "30 °C", "45 °C", "55 °C"], respuesta: "70 °C", explicacion: "La mezcla siempre queda entre las dos temperaturas." },
    ],
  },
  // ---------- Fluidos ----------
  {
    slug: "dinamia-flota-compara-densidades",
    grupo: "fluidos",
    nombre: "¿Flota? Compara densidades",
    descripcion: "Si es menos denso que el líquido, flota; si es más denso, se hunde.",
    pasos: [
      "La **densidad** es masa por volumen: $\\rho = \\dfrac{m}{V}$. El agua tiene $1000\\ \\text{kg/m}^3$.",
      "Un cuerpo **menos denso** que el líquido flota; uno **más denso** se hunde. No importa si es grande o chico.",
      "Además, la fracción que queda bajo el líquido es la razón de densidades: un hielo ($920$) en agua queda $92\\ \\%$ sumergido.",
      "Por eso un barco de acero flota: con el aire de adentro, su densidad media es menor que la del agua.",
    ],
    visuales: [
      { tipo: "dinamia.fluido", modo: "flota", densidad: 600, liquido: 1000, titulo: "Madera ($600$) en agua ($1000$): flota con el $60\\ \\%$ adentro" },
      { tipo: "dinamia.fluido", modo: "flota", densidad: 2700, liquido: 1000, titulo: "Aluminio ($2700$) en agua: se hunde" },
    ],
    quiz: [
      { pregunta: "Un trozo de corcho ($240\\ \\text{kg/m}^3$) se pone en agua. ¿Qué pasa?", opciones: ["Flota", "Se hunde", "Queda a media agua", "Depende de su tamaño"], respuesta: "Flota", explicacion: "$240 < 1000$: es menos denso que el agua." },
      { pregunta: "Un objeto de $800\\ \\text{kg/m}^3$ flota en agua. ¿Qué porcentaje queda sumergido?", opciones: ["80 %", "20 %", "125 %", "8 %"], respuesta: "80 %", explicacion: "$\\dfrac{800}{1000} = 0{,}8$." },
    ],
  },
  {
    slug: "dinamia-cada-10-m-una-atmosfera",
    grupo: "fluidos",
    nombre: "Cada 10 m de agua, 1 atmósfera más",
    descripcion: "El agua suma 10 kPa por metro: 100 kPa (casi 1 atm) cada 10 m.",
    pasos: [
      "La presión del agua es $P = \\rho g h$. Con $\\rho = 1000$ y $g = 10$, son $10\\,000$ Pa por metro: **$10$ kPa por metro**.",
      "En $10$ m de agua se juntan $100$ kPa, casi una atmósfera ($101$ kPa).",
      "La presión **absoluta** suma también la del aire de arriba: a $20$ m, $101 + 200 = 301$ kPa, unas $3$ atmósferas.",
      "No importa la forma del recipiente: solo la profundidad.",
    ],
    visuales: [{ tipo: "dinamia.fluido", modo: "presion", profundidades: [1, 5, 10], titulo: "Cada metro más hondo, $10$ kPa más" }],
    quiz: [
      { pregunta: "¿Qué presión hace el agua sola a $30$ m de profundidad?", opciones: ["300 kPa", "30 kPa", "3 kPa", "3000 kPa"], respuesta: "300 kPa", explicacion: "$10$ kPa por metro: $10 \\cdot 30 = 300$ kPa." },
      { pregunta: "Un buzo está a $15$ m. ¿Cuál es la presión absoluta? (Aire: $101$ kPa)", opciones: ["251 kPa", "150 kPa", "116 kPa", "1515 kPa"], respuesta: "251 kPa", explicacion: "$101 + 10 \\cdot 15 = 251$ kPa." },
    ],
  },
  {
    slug: "dinamia-prensa-razon-de-areas",
    grupo: "fluidos",
    nombre: "La prensa multiplica por la razón de áreas",
    descripcion: "F₂ = F₁ · (A₂ / A₁): el pistón grande empuja tantas veces más como sea más grande.",
    pasos: [
      "En un líquido encerrado, la presión que haces en un punto llega igual a todos lados (principio de Pascal).",
      "Si empujas un pistón chico de área $A_1$ con $F_1$, el grande ($A_2$) recibe la misma presión y empuja con $F_2 = F_1 \\cdot \\dfrac{A_2}{A_1}$.",
      "Ejemplo: $100$ N sobre $0{,}01\\ \\text{m}^2$ levantan $5000$ N sobre $0{,}5\\ \\text{m}^2$ (área $50$ veces mayor).",
      "No es magia: el pistón grande sube $50$ veces menos de lo que baja el chico.",
    ],
    visuales: [{ tipo: "dinamia.fluido", modo: "prensa", f1: 100, a1: 0.01, a2: 0.5, titulo: "Prensa hidráulica: área $50$ veces mayor, fuerza $50$ veces mayor" }],
    quiz: [
      { pregunta: "En una prensa, el pistón grande tiene $20$ veces el área del chico. Empujas con $30$ N. ¿Con qué fuerza sube el grande?", opciones: ["600 N", "1,5 N", "50 N", "30 N"], respuesta: "600 N", explicacion: "$30 \\cdot 20 = 600$ N." },
      { pregunta: "Si el pistón chico baja $40$ cm, ¿cuánto sube el grande en esa misma prensa?", opciones: ["2 cm", "40 cm", "800 cm", "20 cm"], respuesta: "2 cm", explicacion: "El volumen que entra es el que sale: sube $20$ veces menos, $40 \\div 20 = 2$ cm." },
    ],
  },
  {
    slug: "dinamia-cano-angosto",
    grupo: "fluidos",
    nombre: "Caño angosto, agua rápida",
    descripcion: "Si el área baja a la mitad, la velocidad se duplica (A·v se mantiene).",
    pasos: [
      "Por un caño lleno pasa la misma cantidad de agua por segundo en todos lados: el **caudal** $Q = A \\cdot v$ es constante.",
      "Entonces $A_1 v_1 = A_2 v_2$: donde el caño se angosta, el agua va más rápido.",
      "Si el área baja a la mitad, la velocidad se duplica; si baja a un tercio, se triplica.",
      "Es lo que haces al tapar la punta de la manguera con el dedo.",
    ],
    visuales: [{ tipo: "dinamia.tubo", modo: "continuidad", v1: 2, k: 3, titulo: "Área a un tercio: velocidad por tres" }],
    quiz: [
      { pregunta: "El agua va a $1{,}5$ m/s y el caño se angosta a un cuarto del área. ¿A qué velocidad va ahí?", opciones: ["6 m/s", "0,375 m/s", "1,5 m/s", "3 m/s"], respuesta: "6 m/s", explicacion: "$1{,}5 \\cdot 4 = 6$ m/s." },
      { pregunta: "Un caño de $0{,}02\\ \\text{m}^2$ lleva agua a $3$ m/s. ¿Cuál es el caudal?", opciones: ["0,06 m³/s", "150 m³/s", "0,0067 m³/s", "3,02 m³/s"], respuesta: "0,06 m³/s", explicacion: "$Q = A \\cdot v = 0{,}02 \\cdot 3 = 0{,}06\\ \\text{m}^3/\\text{s}$." },
    ],
  },
];

export const TECNICAS_DINAMIA: LeccionDinamia[] = T.map((t, i) => ({ ...t, orden: i + 1, requierePro: false }));
