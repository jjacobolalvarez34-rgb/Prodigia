import { aRad, rectanguloDeAnguloYLado } from "@/lib/trigonometria/triangulos";
import type { TecnicaTrigonometria } from "./tipos";
import { d, dt, m, mval, preg } from "./ayudas";

// Técnicas del bloque "razones" (gratis, atajos cortos con visual y quiz):
// SOH-CAH-TOA con el «relativo al ángulo» bien explicado, cómo elegir la razón,
// la trampa de las recíprocas, los triángulos especiales y los ángulos de
// elevación y depresión. Los números salen de código (triangulos.ts).

const seno = (g: number): number => Math.sin(aRad(g));
const coseno = (g: number): number => Math.cos(aRad(g));
const tangente = (g: number): number => Math.tan(aRad(g));

const ej = rectanguloDeAnguloYLado(40, "c", 15); // ángulo 40°, hipotenusa 15

export const TECNICAS_TRIGONOMETRIA_RAZONES: TecnicaTrigonometria[] = [
  // ---------------------------------------------------------------- 1 (existente: 0108 + quiz de 0177)
  {
    slug: "trigonometria-sohcahtoa",
    grupo: "razones",
    orden: 1,
    requierePro: false,
    existente: true,
    nombre: "SOH-CAH-TOA: opuesto y adyacente dependen del ángulo",
    descripcion: "Un acrónimo para no dudar nunca qué lado va arriba y cuál abajo, y la clave de por qué «opuesto» y «adyacente» cambian con el ángulo.",
    conceptos: { introduce: ["lados-relativos", "razon-seno", "razon-coseno", "razon-tangente", "sohcahtoa"], usa: ["pitagoras"] },
    pasos: [
      "SOH-CAH-TOA: Seno = Opuesto / Hipotenusa, Coseno = Adyacente / Hipotenusa, Tangente = Opuesto / Adyacente.",
      "Primero ubica la hipotenusa: es el lado frente al ángulo recto y el más largo. Los otros dos lados son el opuesto o el adyacente según el ángulo que te pidan.",
      "El cateto opuesto es el que NO toca el ángulo que te interesa; el adyacente es el que sí lo toca (sin ser la hipotenusa). Si cambias de ángulo, el opuesto y el adyacente se intercambian; la hipotenusa nunca cambia.",
      "Dilo en voz alta un par de veces: la mayoría lo recuerda por el ritmo de la frase, no por el significado de cada letra.",
    ],
    visuales: [{ tipo: "trigonometria.triangulo", despuesDePaso: 2, titulo: "El mismo triángulo, visto desde el ángulo $A$", catetos: [3, 4], vertice: "A", pasos: ["hipotenusa", "opuesto", "adyacente", "sen", "cos", "tan"] }],
    quiz: [
      preg("Según SOH-CAH-TOA, ¿qué razón trigonométrica es opuesto dividido entre adyacente?", "La tangente", ["El seno", "El coseno", "La cosecante"], "TOA: Tangente = Opuesto / Adyacente. El seno usa la hipotenusa abajo (SOH) y el coseno también (CAH)."),
      preg("En un triángulo de catetos 3 y 4 e hipotenusa 5, con el cateto de 3 frente al ángulo $A$, ¿cuánto vale $\\cos(A)$?", "$\\dfrac{4}{5}$", ["$\\dfrac{3}{5}$", "$\\dfrac{3}{4}$", "$\\dfrac{5}{4}$"], "CAH: Coseno = Adyacente / Hipotenusa. El adyacente a $A$ es 4 y la hipotenusa 5. $\\frac{3}{5}$ es el seno y $\\frac{3}{4}$ la tangente."),
      preg("Si pasas del ángulo $A$ al otro ángulo agudo del mismo triángulo, ¿qué cambia?", "Se intercambian el cateto opuesto y el adyacente", ["Cambia la hipotenusa", "Nada: los tres lados conservan su nombre", "Solo cambia el ángulo recto"], "Opuesto y adyacente se nombran respecto de un ángulo. Al cambiar de ángulo se intercambian; la hipotenusa siempre es el lado frente al ángulo recto."),
      preg("¿Cuál es el cateto adyacente a un ángulo agudo?", "El cateto que toca al ángulo", ["El lado más largo", "El cateto que está frente al ángulo", "El lado horizontal del dibujo"], "El adyacente es el cateto que forma el ángulo con la hipotenusa. El lado más largo es la hipotenusa y el que está frente al ángulo es el opuesto."),
    ],
  },

  // ---------------------------------------------------------------- 2
  {
    slug: "trigonometria-tecnica-elegir-la-razon",
    grupo: "razones",
    orden: 2,
    requierePro: false,
    nombre: "¿Qué razón uso? Dato, incógnita y el lado que sobra",
    descripcion: "Cómo elegir entre seno, coseno y tangente mirando qué lados intervienen, y cuándo multiplicar, dividir o usar la función inversa.",
    conceptos: { introduce: ["hallar-lado", "hallar-angulo", "razones-inversas", "calculadora-grados"], usa: ["sohcahtoa", "razon-seno", "razon-coseno", "razon-tangente"] },
    pasos: [
      "Marca en el dibujo el dato y la incógnita. El tercer lado, el que no interviene, se ignora.",
      "Mira qué dos lados intervienen: opuesto e hipotenusa, seno; adyacente e hipotenusa, coseno; opuesto y adyacente, tangente.",
      "Para hallar un lado: si la incógnita queda arriba en el cociente, se multiplica; si queda abajo, se divide. Para hallar un ángulo: se usa la inversa (sen⁻¹, cos⁻¹, tan⁻¹).",
      "Antes de calcular, pon la calculadora en modo grados (DEG). Comprueba al final que la hipotenusa sea el lado más largo.",
    ],
    visuales: [{ tipo: "trigonometria.resolver", despuesDePaso: 2, titulo: "Un ejemplo completo", modo: "lado", angulo: 40, dado: "c", valor: 15, pedido: "a" }],
    quiz: [
      preg("Conoces el cateto opuesto y quieres hallar la hipotenusa. ¿Qué razón usas?", "El seno", ["El coseno", "La tangente", "Ninguna, falta el ángulo recto"], "Opuesto e hipotenusa son los lados del seno (opuesto ÷ hipotenusa). El coseno usa el adyacente y la tangente no incluye la hipotenusa."),
      preg("Conoces los dos catetos y quieres el ángulo agudo. ¿Qué usas?", "La tangente inversa", ["El seno inverso", "El coseno inverso", "La cosecante"], "Los dos catetos son el opuesto y el adyacente: tangente. Como buscas el ángulo, se usa la función inversa, $\\tan^{-1}$."),
      preg(`Con $A=40^{\\circ}$ y la hipotenusa igual a 15, ¿cuánto mide el cateto opuesto?`, d(ej.a), [d(15 * coseno(40)), d(15 / seno(40)), d(15 * tangente(40))], `Seno, y la incógnita queda arriba: se multiplica. $15\\cdot\\operatorname{sen}(40^{\\circ})\\approx ${dt(ej.a)}$.`),
      preg("¿Qué se debe comprobar al terminar un problema de triángulos rectángulos?", "Que la hipotenusa sea el lado más largo", ["Que la suma de los catetos sea igual a la hipotenusa", "Que el resultado sea un número entero", "Que el resultado sea menor que 1"], "La hipotenusa es siempre el lado más largo, pero no es la suma de los catetos (eso violaría Pitágoras). El resultado de un lado puede ser cualquier positivo, entero o no."),
    ],
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "trigonometria-tecnica-reciprocas-en-cruz",
    grupo: "razones",
    orden: 3,
    requierePro: false,
    nombre: "La «co» engaña: la cosecante es del seno",
    descripcion: "Las recíprocas van «en cruz»: cosecante con seno, secante con coseno. Y no las confundas con las funciones inversas.",
    conceptos: { introduce: ["razones-reciprocas"], usa: ["razon-seno", "razon-coseno", "razon-tangente"] },
    pasos: [
      `Las recíprocas dan vuelta la razón: ${m("\\operatorname{cosec}(A)=\\dfrac{1}{\\operatorname{sen}(A)}")}, ${m("\\sec(A)=\\dfrac{1}{\\cos(A)}")} y ${m("\\cot(A)=\\dfrac{1}{\\tan(A)}")}.`,
      "La trampa: la cosecante NO es la recíproca del coseno. Van «en cruz»: la que lleva «co» (cosecante) va con la que no lo lleva (seno); la secante va con el coseno.",
      "En la calculadora no hay teclas para ellas: se calculan dividiendo 1 entre la razón. Ojo: la tecla sen⁻¹ es la función inversa (da un ángulo), no la recíproca.",
    ],
    visuales: [{ tipo: "trigonometria.triangulo", despuesDePaso: 1, titulo: "Recíprocas del ángulo $A$", catetos: [3, 4], vertice: "A", pasos: ["cosec", "sec", "cot"] }],
    quiz: [
      preg("¿Cuál es la recíproca del seno?", "La cosecante", ["La secante", "La cotangente", "El arcoseno"], "Cosecante y seno van emparejados: $\\operatorname{cosec}(A)=\\frac{1}{\\operatorname{sen}(A)}$. La secante es del coseno y la cotangente de la tangente."),
      preg("En un triángulo 3-4-5, con el cateto de 3 frente al ángulo $A$, ¿cuánto vale $\\sec(A)$?", "$\\dfrac{5}{4}$", ["$\\dfrac{5}{3}$", "$\\dfrac{4}{3}$", "$\\dfrac{4}{5}$"], "La secante es hipotenusa sobre adyacente: $\\frac{5}{4}$. $\\frac{5}{3}$ es la cosecante y $\\frac{4}{3}$ la cotangente; $\\frac{4}{5}$ es el coseno."),
      preg(`Con la calculadora en modo grados, ¿cuánto vale $\\cot(35^{\\circ})$?`, d(1 / tangente(35)), [d(tangente(35)), d(1 / seno(35)), d(1 / coseno(35))], `1 dividido entre la tangente: $\\frac{1}{${dt(tangente(35), 4)}}\\approx ${dt(1 / tangente(35))}$.`),
      preg("La tecla $\\operatorname{sen}^{-1}$ de la calculadora calcula…", "el ángulo cuyo seno es el número escrito", ["1 dividido entre el seno", "la cosecante", "el seno de $-1$"], "Es la función inversa (arcoseno): devuelve un ángulo. La recíproca del seno, la cosecante, no tiene tecla propia."),
    ],
  },

  // ---------------------------------------------------------------- 4
  {
    slug: "trigonometria-tecnica-medio-cuadrado-medio-equilatero",
    grupo: "razones",
    orden: 4,
    requierePro: false,
    nombre: "Medio cuadrado y medio equilátero",
    descripcion: "De dónde salen los valores exactos de 30°, 45° y 60°: cortar un cuadrado o un triángulo equilátero por la mitad.",
    conceptos: { introduce: ["triangulo-45-45-90", "triangulo-30-60-90", "valores-notables-agudos"], usa: ["pitagoras", "razon-seno", "razon-coseno", "razon-tangente"] },
    pasos: [
      "Medio cuadrado: un cuadrado de lado 1 cortado por su diagonal da un triángulo con catetos 1 y 1 e hipotenusa $\\sqrt{2}$. Sus ángulos agudos son de $45^{\\circ}$.",
      "Medio equilátero: un triángulo equilátero de lado 2 cortado por su altura da un triángulo con hipotenusa 2, un cateto de 1 y el otro de $\\sqrt{3}$. El cateto de 1 está frente al ángulo de $30^{\\circ}$.",
      "Con esos lados salen las razones: $\\operatorname{sen}(30^{\\circ})=\\frac{1}{2}$, $\\cos(30^{\\circ})=\\frac{\\sqrt{3}}{2}$, $\\operatorname{sen}(45^{\\circ})=\\cos(45^{\\circ})=\\frac{\\sqrt{2}}{2}$, $\\tan(45^{\\circ})=1$, $\\operatorname{sen}(60^{\\circ})=\\frac{\\sqrt{3}}{2}$ y $\\cos(60^{\\circ})=\\frac{1}{2}$.",
      "Una pista para no confundirte: el ángulo menor tiene el seno menor, porque está frente al lado más corto. Por eso $\\operatorname{sen}(30^{\\circ})<\\operatorname{sen}(60^{\\circ})$.",
    ],
    visuales: [{ tipo: "trigonometria.triangulo", despuesDePaso: 1, titulo: "Medio equilátero: catetos 1 y $\\sqrt{3}$", catetos: [1, 1.7321], vertice: "A", pasos: ["opuesto", "adyacente", "hipotenusa", "sen", "cos", "tan"] }],
    quiz: [
      preg("¿Cuánto vale $\\operatorname{sen}(30^{\\circ})$?", mval("sen", 30), [mval("sen", 60), mval("cos", 45), mval("tan", 30)], "En el medio equilátero, el cateto frente a $30^{\\circ}$ mide 1 y la hipotenusa 2: $\\frac{1}{2}$. $\\frac{\\sqrt{3}}{2}$ es el seno de $60^{\\circ}$."),
      preg("¿Cuánto vale $\\tan(45^{\\circ})$?", "$1$", [mval("sen", 45), "$\\sqrt{2}$", "$0$"], "Con catetos iguales (1 y 1), opuesto ÷ adyacente vale 1. $\\frac{\\sqrt{2}}{2}$ es el seno y el coseno de $45^{\\circ}$."),
      preg("Un triángulo rectángulo tiene un ángulo de $60^{\\circ}$ y la hipotenusa mide 8. ¿Cuánto mide el cateto adyacente a ese ángulo?", "4", ["$4\\sqrt{3}\\approx 6{,}93$", "$8\\sqrt{3}\\approx 13{,}86$", "8"], "Como $\\cos(60^{\\circ})=\\frac{1}{2}$, el adyacente es la mitad de la hipotenusa: 4. $4\\sqrt{3}$ es el opuesto."),
      preg("¿Cuál es la hipotenusa de un triángulo rectángulo con catetos 1 y 1?", "$\\sqrt{2}$", ["$2$", "$1$", "$\\dfrac{\\sqrt{2}}{2}$"], "Por Pitágoras, $\\sqrt{1^{2}+1^{2}}=\\sqrt{2}$. La hipotenusa es siempre mayor que cada cateto, así que no puede ser 1 ni $\\frac{\\sqrt{2}}{2}$ (que es menor que 1)."),
    ],
  },

  // ---------------------------------------------------------------- 5
  {
    slug: "trigonometria-tecnica-elevacion-y-depresion",
    grupo: "razones",
    orden: 5,
    requierePro: false,
    nombre: "Elevación y depresión: mide desde la horizontal",
    descripcion: "Cómo dibujar el triángulo de un problema de alturas y distancias y qué hacer con el ángulo de depresión.",
    conceptos: { introduce: ["angulo-elevacion", "angulo-depresion", "problemas-rectangulo"], usa: ["hallar-lado", "hallar-angulo", "razon-tangente"] },
    pasos: [
      "Los dos ángulos se miden desde la horizontal que sale del ojo del observador: hacia arriba es elevación; hacia abajo, depresión.",
      "Dibuja siempre el triángulo rectángulo: la altura es un cateto vertical, la distancia al suelo es el otro cateto y la visual es la hipotenusa.",
      "Con la depresión, el ángulo del triángulo en el suelo mide lo mismo (ángulos alternos internos entre las dos horizontales).",
      "Si el observador tiene estatura, suma la altura de sus ojos al resultado.",
    ],
    visuales: [{ tipo: "trigonometria.resolver", despuesDePaso: 2, titulo: "Depresión de $25^{\\circ}$ desde un faro de 60 m", modo: "lado", angulo: 25, dado: "a", valor: 60, pedido: "b" }],
    quiz: [
      preg("¿Desde dónde se mide el ángulo de elevación?", "Desde la horizontal hacia arriba", ["Desde la vertical hacia arriba", "Desde el suelo hacia la cima", "Desde la hipotenusa"], "Elevación y depresión se miden respecto de la línea horizontal del ojo del observador: hacia arriba (elevación) o hacia abajo (depresión)."),
      preg("Desde lo alto de un faro el ángulo de depresión de un barco es de $30^{\\circ}$. ¿Cuánto mide el ángulo en el barco entre el agua y la visual hacia el faro?", "$30^{\\circ}$", ["$60^{\\circ}$", "$150^{\\circ}$", "$90^{\\circ}$"], "Son ángulos alternos internos entre dos paralelas (la horizontal del faro y el agua): miden lo mismo."),
      preg("A 20 m de la base de un árbol, el ángulo de elevación de la copa es de $45^{\\circ}$. ¿Qué altura tiene (sin contar la estatura del observador)?", "20 m", ["$20\\sqrt{2}\\approx 28{,}3$ m", "10 m", "$\\dfrac{20}{\\sqrt{2}}\\approx 14{,}1$ m"], "Con $45^{\\circ}$, la tangente vale 1: la altura es igual a la distancia horizontal, 20 m."),
      preg("Si el observador tiene los ojos a 1,6 m del suelo y calcula 8 m de altura desde el nivel de sus ojos, ¿qué altura tiene el objeto?", "9,6 m", ["8 m", "6,4 m", "12,8 m"], "La visual sale de los ojos, así que hay que sumar los 1,6 m: $8+1{,}6=9{,}6$ m."),
    ],
  },
];

