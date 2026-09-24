import { aRad, arcoSeno, arcoTangente, rectanguloDeAnguloYLado } from "@/lib/trigonometria/triangulos";
import type { ClaseTrigonometria } from "./tipos";
import { cuadros, d, dt, m, mval, preg, val } from "./ayudas";

// Clases del bloque "razones" (Pro): el triángulo rectángulo y sus lados según
// el ángulo, seno/coseno/tangente, recíprocas, hallar un lado, hallar un ángulo,
// triángulos especiales y ángulos de elevación y depresión. Todos los números
// de los ejemplos y del quiz salen de código (triangulos.ts y exactos.ts), no
// de la cabeza; lecciones.test.ts los contrasta con un cálculo independiente.

const seno = (g: number): number => Math.sin(aRad(g));
const coseno = (g: number): number => Math.cos(aRad(g));
const tangente = (g: number): number => Math.tan(aRad(g));

const SOHCAHTOA =
  "$\\operatorname{sen}(A)=\\dfrac{\\text{opuesto}}{\\text{hipotenusa}}$, $\\cos(A)=\\dfrac{\\text{adyacente}}{\\text{hipotenusa}}$ y $\\tan(A)=\\dfrac{\\text{opuesto}}{\\text{adyacente}}$";

// Cuentas de los ejemplos (verificadas en lecciones.test.ts).
const ej4a = rectanguloDeAnguloYLado(35, "c", 12); // a = 12·sen 35°
const ej4b = rectanguloDeAnguloYLado(52, "a", 8); // c = 8 / sen 52°
const radianes35 = Math.sin(35); // sen(35) en modo radianes (error típico de la calculadora)
const ej5 = arcoTangente(3 / 4);
const ej7a = rectanguloDeAnguloYLado(35, "b", 40); // altura = 40·tan 35°
const ej7b = rectanguloDeAnguloYLado(25, "a", 60); // distancia = 60 / tan 25°

export const CLASES_TRIGONOMETRIA_RAZONES: ClaseTrigonometria[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "trigonometria-clase-01-lados-segun-el-angulo",
    grupo: "razones",
    orden: 1,
    requierePro: true,
    nombre: "El triángulo rectángulo y sus lados según el ángulo",
    descripcion: "Hipotenusa, cateto opuesto y cateto adyacente: el vocabulario con el que se escribe toda la trigonometría.",
    conceptos: { introduce: ["triangulo-rectangulo", "lados-relativos"], usa: ["pitagoras", "angulos-triangulo"] },
    pasos: [
      "Objetivo: al terminar podrás señalar, en cualquier triángulo rectángulo, cuál es la hipotenusa, cuál es el cateto opuesto y cuál el cateto adyacente respecto de un ángulo agudo. Es el vocabulario con el que se escribe toda la trigonometría.",
      "Un triángulo rectángulo tiene un ángulo de $90^{\\circ}$ (el ángulo recto). El lado que está frente a ese ángulo se llama hipotenusa y siempre es el más largo. Los otros dos lados se llaman catetos. Ya lo conoces del teorema de Pitágoras: $a^{2}+b^{2}=c^{2}$. Los otros dos ángulos son agudos y suman $90^{\\circ}$, porque los tres ángulos de un triángulo suman $180^{\\circ}$.",
      "Intuición. La idea clave es que los nombres «opuesto» y «adyacente» no pertenecen al lado, dependen del ángulo agudo que elijas. El cateto opuesto es el que está frente al ángulo (no lo toca). El cateto adyacente es el que lo toca sin ser la hipotenusa. En el dibujo se ve paso a paso con el ángulo $A$.",
      "Cambia ahora de ángulo. Con el ángulo $A$, el opuesto es el cateto de 3 y el adyacente el de 4. Con el ángulo $B$ es al revés: el opuesto es el de 4 y el adyacente el de 3. La hipotenusa (5) no cambia nunca. Por eso, antes de escribir cualquier razón, hay que decir siempre «respecto de qué ángulo».",
      "Ejemplo resuelto. Un triángulo rectángulo tiene catetos de 5 y 12 y hipotenusa de 13. ¿Cuál es el opuesto y cuál el adyacente al ángulo menor? Sigue los pasos en el cuadro.",
      "Errores comunes. 1) Llamar «opuesto» siempre al cateto vertical: si el triángulo está girado, el vertical puede ser el adyacente. 2) Confundir el adyacente con la hipotenusa: los dos tocan el ángulo, pero la hipotenusa nunca es un cateto. 3) Olvidar que al cambiar de ángulo se intercambian el opuesto y el adyacente.",
      "Resumen. Hipotenusa: frente al ángulo recto, siempre el lado más largo. Opuesto: el cateto frente al ángulo elegido. Adyacente: el cateto que toca al ángulo elegido. El ángulo más pequeño está siempre frente al lado más corto.",
    ],
    visuales: [
      { tipo: "trigonometria.triangulo", despuesDePaso: 2, titulo: "Lados vistos desde el ángulo $A$", catetos: [3, 4], vertice: "A", pasos: ["hipotenusa", "opuesto", "adyacente"] },
      { tipo: "trigonometria.triangulo", despuesDePaso: 3, titulo: "Los mismos lados vistos desde el ángulo $B$", catetos: [3, 4], vertice: "B", pasos: ["hipotenusa", "opuesto", "adyacente"] },
      cuadros(4, "Lados de un triángulo 5-12-13", [
        { texto: "Paso 1: ubica el ángulo recto y marca la hipotenusa, el lado que está frente a él: mide 13." },
        { texto: "Paso 2: elige el ángulo menor. El lado más corto (5) está frente al ángulo más pequeño, así que 5 es el cateto opuesto.", resaltar: "Opuesto = 5" },
        { texto: "Paso 3: el otro cateto (12) toca al ángulo elegido sin ser la hipotenusa.", resaltar: "Adyacente = 12" },
      ]),
    ],
    quiz: [
      preg(
        "Un triángulo rectángulo tiene lados de 6, 8 y 10. ¿Cuál es la hipotenusa?",
        "10",
        ["6", "8", "Depende del ángulo que se elija"],
        "La hipotenusa es el lado frente al ángulo recto y el más largo; no depende del ángulo agudo que elijas. Además $6^{2}+8^{2}=36+64=100=10^{2}$."
      ),
      preg(
        "En un triángulo rectángulo con catetos 3 y 4 e hipotenusa 5, el cateto de 3 está frente al ángulo $A$. ¿Cómo se llama respecto de $A$?",
        "Cateto opuesto",
        ["Cateto adyacente", "Hipotenusa", "Depende de la posición del dibujo"],
        "El lado que está frente al ángulo elegido es su cateto opuesto. El de 4 es el adyacente y el de 5 la hipotenusa; no importa cómo esté girado el dibujo."
      ),
      preg(
        "Se cambia del ángulo $A$ al otro ángulo agudo $B$ del mismo triángulo. ¿Qué pasa con el opuesto y el adyacente?",
        "Se intercambian: el opuesto de $B$ es el adyacente de $A$",
        ["No cambian: dependen del triángulo, no del ángulo", "El opuesto pasa a ser la hipotenusa", "Los dos catetos pasan a ser opuestos"],
        "Opuesto y adyacente se definen respecto de un ángulo. Al cambiar de ángulo, el cateto que estaba frente al primero pasa a tocar al segundo, y al revés. La hipotenusa sigue siendo la misma."
      ),
      preg(
        "¿Cuál de estas afirmaciones sobre el cateto adyacente es correcta?",
        "Toca al ángulo elegido y no es la hipotenusa",
        ["Es el lado más largo del triángulo", "Está frente al ángulo elegido", "Es siempre el lado horizontal del dibujo"],
        "El adyacente es el cateto que forma el ángulo junto con la hipotenusa. El lado más largo es la hipotenusa, el que está enfrente es el opuesto, y «horizontal» no significa nada si el triángulo está girado."
      ),
      preg(
        "Un triángulo rectángulo está dibujado con la hipotenusa horizontal. El ángulo elegido está en el vértice izquierdo. ¿Cómo se reconoce el cateto opuesto?",
        "Es el cateto que no toca ese vértice",
        ["Es el cateto de abajo", "Es el cateto más corto", "Es el cateto vertical"],
        "El opuesto es el que está frente al ángulo, es decir, el que no llega hasta su vértice. No depende de que esté arriba, abajo, vertical ni de su longitud."
      ),
    ],
  },

  // ---------------------------------------------------------------- 2
  {
    slug: "trigonometria-clase-02-seno-coseno-tangente",
    grupo: "razones",
    orden: 2,
    requierePro: true,
    nombre: "Seno, coseno y tangente",
    descripcion: "Las tres razones básicas de un ángulo agudo como cocientes de lados, con SOH-CAH-TOA y ejemplos con números.",
    conceptos: { introduce: ["razon-seno", "razon-coseno", "razon-tangente", "sohcahtoa"], usa: ["lados-relativos", "semejanza", "fracciones-raices"] },
    pasos: [
      "Objetivo: al terminar podrás escribir el seno, el coseno y la tangente de un ángulo agudo como cocientes de dos lados y calcularlos cuando se conocen los tres lados del triángulo rectángulo.",
      "Intuición. Dibuja dos triángulos rectángulos con el mismo ángulo agudo, uno chico y otro grande. Son semejantes: sus lados guardan las mismas proporciones, sin importar el tamaño. En un triángulo 3-4-5 el cateto opuesto es los $\\frac{3}{5}$ de la hipotenusa; en uno 6-8-10 también ($\\frac{6}{10}=\\frac{3}{5}$). Esa proporción solo depende del ángulo, y la trigonometría le pone nombre a esas proporciones.",
      `Definiciones. Para un ángulo agudo $A$ de un triángulo rectángulo: ${SOHCAHTOA}. Se recuerdan con la frase SOH-CAH-TOA: Seno = Opuesto / Hipotenusa, Coseno = Adyacente / Hipotenusa, Tangente = Opuesto / Adyacente.`,
      `Ejemplo resuelto con el triángulo 3-4-5 y el ángulo $A$ (opuesto 3, adyacente 4, hipotenusa 5): ${m("\\operatorname{sen}(A)=\\dfrac{3}{5}=0{,}6")}, ${m("\\cos(A)=\\dfrac{4}{5}=0{,}8")} y ${m("\\tan(A)=\\dfrac{3}{4}=0{,}75")}.`,
      `Ahora el otro ángulo, $B$: los papeles se intercambian (opuesto 4, adyacente 3). Entonces ${m("\\operatorname{sen}(B)=\\dfrac{4}{5}=0{,}8")}, ${m("\\cos(B)=\\dfrac{3}{5}=0{,}6")} y ${m("\\tan(B)=\\dfrac{4}{3}\\approx 1{,}33")}. Fíjate: el seno de $A$ es igual al coseno de $B$.`,
      "Propiedades útiles. La hipotenusa es el lado más largo, así que el seno y el coseno de un ángulo agudo siempre están entre 0 y 1. La tangente puede ser cualquier número positivo. Un seno o un coseno mayor que 1 es una señal de alarma: se puso la hipotenusa en el lugar equivocado.",
      "Errores comunes. 1) Poner el cociente al revés (por ejemplo, hipotenusa sobre opuesto): el resultado sería mayor que 1. 2) Usar la hipotenusa en la tangente: la tangente solo usa los dos catetos. 3) Escribir la razón con los lados respecto de otro ángulo: antes de escribirla, di en voz alta cuál es el opuesto y cuál el adyacente al ángulo pedido.",
      "Resumen. sen = opuesto ÷ hipotenusa; cos = adyacente ÷ hipotenusa; tan = opuesto ÷ adyacente. Solo dependen del ángulo, no del tamaño del triángulo.",
    ],
    visuales: [
      { tipo: "trigonometria.triangulo", despuesDePaso: 2, titulo: "Las tres razones del ángulo $A$", catetos: [3, 4], vertice: "A", pasos: ["opuesto", "adyacente", "hipotenusa", "sen", "cos", "tan"] },
      { tipo: "trigonometria.triangulo", despuesDePaso: 4, titulo: "Las mismas razones desde el ángulo $B$", catetos: [3, 4], vertice: "B", pasos: ["sen", "cos", "tan"] },
    ],
    quiz: [
      preg(
        "En un triángulo rectángulo de lados 5, 12 y 13, el cateto de 5 está frente al ángulo $A$. ¿Cuánto vale $\\operatorname{sen}(A)$?",
        "$\\dfrac{5}{13}$",
        ["$\\dfrac{12}{13}$", "$\\dfrac{5}{12}$", "$\\dfrac{13}{5}$"],
        "El seno es opuesto sobre hipotenusa: el opuesto a $A$ es 5 y la hipotenusa 13. $\\frac{12}{13}$ es el coseno, $\\frac{5}{12}$ la tangente y $\\frac{13}{5}$ tiene la hipotenusa arriba."
      ),
      preg(
        "En ese mismo triángulo (5, 12 y 13), ¿cuánto vale $\\cos(A)$?",
        "$\\dfrac{12}{13}$",
        ["$\\dfrac{5}{13}$", "$\\dfrac{12}{5}$", "$\\dfrac{13}{12}$"],
        "El coseno es adyacente sobre hipotenusa: el adyacente a $A$ es 12. $\\frac{5}{13}$ es el seno y $\\frac{12}{5}$ es una tangente (de $B$)."
      ),
      preg(
        "Con el ángulo $B$ del mismo triángulo (opuesto 12, adyacente 5), ¿cuánto vale $\\tan(B)$?",
        "$\\dfrac{12}{5}$",
        ["$\\dfrac{5}{12}$", "$\\dfrac{12}{13}$", "$\\dfrac{5}{13}$"],
        "La tangente es opuesto sobre adyacente, y desde $B$ el opuesto es 12 y el adyacente 5. Con $\\frac{5}{12}$ se calcularía la tangente de $A$."
      ),
      preg(
        "Un estudiante obtiene $\\operatorname{sen}(A)=1{,}3$ en un triángulo rectángulo. ¿Qué se puede afirmar?",
        "Se equivocó: puso la hipotenusa abajo del cociente al revés; el seno de un ángulo agudo nunca pasa de 1",
        ["Es posible si el ángulo es grande", "Es correcto si el triángulo es muy grande", "Debió usar la tangente en lugar del seno"],
        "La hipotenusa es el lado más largo, así que opuesto ÷ hipotenusa siempre es menor que 1. Un resultado como 1,3 indica que los lados se pusieron al revés. El tamaño del triángulo no cambia la razón."
      ),
      preg(
        "En un triángulo rectángulo con el ángulo recto en $C$, ¿qué relación hay entre $\\operatorname{sen}(A)$ y $\\cos(B)$?",
        "Son iguales",
        ["Son recíprocos", "Suman 1", "No tienen relación"],
        "El cateto opuesto a $A$ es el adyacente a $B$, y ambos se dividen entre la misma hipotenusa. Por eso $\\operatorname{sen}(A)=\\cos(B)$ (por ejemplo, ambos valen $\\frac{3}{5}$ en el triángulo 3-4-5)."
      ),
    ],
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "trigonometria-clase-03-cosecante-secante-cotangente",
    grupo: "razones",
    orden: 3,
    requierePro: true,
    nombre: "Cosecante, secante y cotangente",
    descripcion: "Las tres razones recíprocas: qué son, con cuál se emparejan y cómo se calculan con una calculadora que no tiene esas teclas.",
    conceptos: { introduce: ["razones-reciprocas"], usa: ["razon-seno", "razon-coseno", "razon-tangente", "fracciones-raices"] },
    pasos: [
      "Objetivo: al terminar sabrás qué son la cosecante, la secante y la cotangente, con qué razón se emparejan cada una y cómo calcularlas con una calculadora normal.",
      "Intuición. Cada razón se puede «dar vuelta»: en lugar de opuesto sobre hipotenusa, hipotenusa sobre opuesto. Las tres razones dadas vuelta también tienen nombre. Se llaman recíprocas porque su producto con la original es 1.",
      `Definiciones: ${m("\\operatorname{cosec}(A)=\\dfrac{1}{\\operatorname{sen}(A)}=\\dfrac{\\text{hipotenusa}}{\\text{opuesto}}")}, ${m("\\sec(A)=\\dfrac{1}{\\cos(A)}=\\dfrac{\\text{hipotenusa}}{\\text{adyacente}}")} y ${m("\\cot(A)=\\dfrac{1}{\\tan(A)}=\\dfrac{\\text{adyacente}}{\\text{opuesto}}")}.`,
      "La trampa del nombre: la cosecante NO es la recíproca del coseno. Cada nombre está emparejado «en cruz»: la cosecante con el seno, la secante con el coseno. La cotangente sí se empareja con la tangente. Para no confundirte: la cosecante (que lleva «co») va con el seno (que no lo lleva), y la secante (sin «co») va con el coseno (con «co»).",
      "Ejemplo resuelto con el triángulo 3-4-5 y el ángulo $A$ (opuesto 3, adyacente 4, hipotenusa 5): la cosecante es $\\frac{5}{3}\\approx 1{,}67$, la secante es $\\frac{5}{4}=1{,}25$ y la cotangente es $\\frac{4}{3}\\approx 1{,}33$. Puedes comprobarlo: $1{,}67\\cdot\\operatorname{sen}(A)=1{,}67\\cdot 0{,}6\\approx 1$.",
      `En la calculadora no hay teclas para estas razones: se calculan con el botón de división. Por ejemplo, ${m("\\cot(35^{\\circ})=\\dfrac{1}{\\tan(35^{\\circ})}=\\dfrac{1}{" + dt(tangente(35), 4) + "}\\approx " + dt(1 / tangente(35)) + "")}. Con calculadora en modo grados.`,
      "Propiedades: en un ángulo agudo, la cosecante y la secante siempre son mayores que 1, porque la hipotenusa es el lado más largo y está arriba. La cotangente puede ser cualquier número positivo.",
      "Errores comunes. 1) Creer que la cosecante es la recíproca del coseno. 2) Confundir la recíproca con la función inversa: $\\operatorname{sen}^{-1}$ (el arcoseno) NO es $\\frac{1}{\\operatorname{sen}}$. La recíproca del seno es la cosecante. 3) Olvidar que $\\cot(A)$ es adyacente sobre opuesto (la tangente dada vuelta).",
    ],
    visuales: [
      { tipo: "trigonometria.triangulo", despuesDePaso: 4, titulo: "Las recíprocas del ángulo $A$", catetos: [3, 4], vertice: "A", pasos: ["cosec", "sec", "cot"] },
      cuadros(5, "Cotangente de $35^{\\circ}$ con la calculadora", [
        { texto: "No hay tecla de cotangente. Escribe la tangente y da vuelta el resultado.", formula: "\\cot(35^{\\circ})=\\dfrac{1}{\\tan(35^{\\circ})}" },
        { texto: `Con la calculadora en modo grados, $\\tan(35^{\\circ})\\approx ${dt(tangente(35), 4)}$.`, formula: `\\dfrac{1}{${dt(tangente(35), 4)}}` },
        { texto: "Resultado:", resaltar: `cot 35° ≈ ${d(1 / tangente(35))}` },
      ]),
    ],
    quiz: [
      preg(
        "En un triángulo de lados 5, 12 y 13, el cateto de 5 está frente al ángulo $A$. ¿Cuánto vale $\\operatorname{cosec}(A)$?",
        "$\\dfrac{13}{5}=2{,}6$",
        ["$\\dfrac{13}{12}\\approx 1{,}08$", "$\\dfrac{12}{5}=2{,}4$", "$\\dfrac{5}{13}\\approx 0{,}38$"],
        "La cosecante es hipotenusa sobre opuesto: $\\frac{13}{5}$. $\\frac{13}{12}$ sería la secante, $\\frac{12}{5}$ la cotangente y $\\frac{5}{13}$ es el seno."
      ),
      preg(
        "¿Cuál es la recíproca del coseno?",
        "La secante",
        ["La cosecante", "La cotangente", "El arcocoseno"],
        "Los nombres se emparejan «en cruz»: secante con coseno y cosecante con seno. El arcocoseno es la función inversa, que no es lo mismo que la recíproca."
      ),
      preg(
        `Con la calculadora en modo grados, ¿cuánto vale $\\cot(35^{\\circ})$?`,
        d(1 / tangente(35)),
        [d(tangente(35)), d(1 / seno(35)), d(1 / coseno(35))],
        `La cotangente es 1 dividido entre la tangente: $\\frac{1}{${dt(tangente(35), 4)}}\\approx ${dt(1 / tangente(35))}$. El valor ${d(tangente(35))} es la tangente, ${d(1 / seno(35))} es la cosecante y ${d(1 / coseno(35))} la secante.`
      ),
      preg(
        "Si $\\tan(A)=\\dfrac{3}{4}$, ¿cuánto vale $\\cot(A)$?",
        "$\\dfrac{4}{3}$",
        ["$\\dfrac{3}{5}$", "$-\\dfrac{3}{4}$", "$\\dfrac{5}{4}$"],
        "La cotangente es la recíproca de la tangente: se da vuelta la fracción, $\\frac{4}{3}$. $\\frac{3}{5}$ sería el seno, y una razón positiva no cambia de signo al darla vuelta."
      ),
      preg(
        "¿Qué significa $\\operatorname{sen}^{-1}(x)$ en una calculadora?",
        "La función inversa: el ángulo cuyo seno es $x$",
        ["La recíproca: $\\dfrac{1}{\\operatorname{sen}(x)}$", "El seno de $-x$", "La razón entre el coseno y el seno"],
        "El exponente $-1$ en una función indica la función inversa (arcoseno), que devuelve un ángulo. La recíproca del seno es la cosecante. Son dos cosas distintas con una notación parecida."
      ),
    ],
  },

  // ---------------------------------------------------------------- 4
  {
    slug: "trigonometria-clase-04-hallar-un-lado",
    grupo: "razones",
    orden: 4,
    requierePro: true,
    nombre: "Hallar un lado",
    descripcion: "Con un ángulo y un lado, el método de cuatro pasos para plantear y resolver la ecuación que da otro lado.",
    conceptos: { introduce: ["hallar-lado", "calculadora-grados"], usa: ["sohcahtoa", "razon-seno", "razon-coseno", "razon-tangente", "ecuacion-lineal"] },
    pasos: [
      "Objetivo: al terminar podrás hallar cualquier lado de un triángulo rectángulo cuando conoces un ángulo agudo y otro lado, planteando y resolviendo una ecuación con seno, coseno o tangente.",
      "Intuición. Si conoces un ángulo agudo, ya conoces la forma del triángulo (los otros ángulos quedan fijos). Solo falta el tamaño, y un lado lo da. La razón trigonométrica conecta el ángulo con dos lados: si conoces uno de los dos, puedes obtener el otro.",
      "El método, en cuatro pasos. 1) Dibuja el triángulo y marca el ángulo, el lado que conoces (dato) y el que buscas (incógnita). 2) Nombra esos dos lados respecto del ángulo (opuesto, adyacente o hipotenusa) y elige la razón que los usa: el lado que no interviene se ignora. 3) Escribe la ecuación. 4) Despeja y calcula con la calculadora en modo grados.",
      `Ejemplo 1. En un triángulo rectángulo, el ángulo $A$ mide $35^{\\circ}$ y la hipotenusa mide 12. ¿Cuánto mide el cateto opuesto $a$? Dato: hipotenusa; incógnita: opuesto. La razón que los usa es el seno: ${m("\\operatorname{sen}(35^{\\circ})=\\dfrac{a}{12}")}. Despejando: ${m("a=12\\cdot\\operatorname{sen}(35^{\\circ})\\approx 12\\cdot " + dt(seno(35), 4) + "\\approx " + dt(ej4a.a) + "")}. Como la incógnita está arriba, se multiplica.`,
      `Ejemplo 2. Ahora el ángulo $A$ mide $52^{\\circ}$ y el cateto opuesto mide 8. ¿Cuánto mide la hipotenusa $c$? Dato: opuesto; incógnita: hipotenusa. Otra vez el seno: ${m("\\operatorname{sen}(52^{\\circ})=\\dfrac{8}{c}")}. Ahora la incógnita está abajo: ${m("c=\\dfrac{8}{\\operatorname{sen}(52^{\\circ})}\\approx\\dfrac{8}{" + dt(seno(52), 4) + "}\\approx " + dt(ej4b.c) + "")}. Regla práctica: si la incógnita está arriba se multiplica; si está abajo se divide.`,
      `Cuidado con la calculadora. Debe estar en modo grados (DEG o D en la pantalla), no en radianes (RAD o R). En modo radianes, $\\operatorname{sen}(35)$ da $${dt(radianes35)}$ y el resultado sale mal. Si un seno de un ángulo agudo te da un número negativo, mira el modo de la calculadora.`,
      `Comprueba siempre: la hipotenusa tiene que ser el lado más largo. En el ejemplo 1, el cateto (${d(ej4a.a)}) es menor que la hipotenusa (12), y en el ejemplo 2 la hipotenusa (${d(ej4b.c)}) es mayor que el cateto (8).`,
      "Errores comunes. 1) Calculadora en radianes. 2) Multiplicar cuando hay que dividir (o al revés): revisa dónde quedó la incógnita. 3) Elegir la razón que usa el lado que no interviene: el lado que ni es dato ni es incógnita no aparece en la ecuación. 4) Redondear los valores intermedios: deja todos los decimales hasta el resultado final.",
    ],
    visuales: [
      {
        tipo: "trigonometria.resolver",
        despuesDePaso: 3,
        titulo: "Ejemplo 1: hallar el cateto opuesto",
        modo: "lado",
        angulo: 35,
        dado: "c",
        valor: 12,
        pedido: "a",
      },
      {
        tipo: "trigonometria.resolver",
        despuesDePaso: 4,
        titulo: "Ejemplo 2: hallar la hipotenusa",
        modo: "lado",
        angulo: 52,
        dado: "a",
        valor: 8,
        pedido: "c",
      },
    ],
    quiz: [
      preg(
        "En un triángulo rectángulo, $A=40^{\\circ}$ y la hipotenusa mide 15. ¿Cuánto mide el cateto opuesto a $A$?",
        d(15 * seno(40)),
        [d(15 * coseno(40)), d(15 / seno(40)), d(15 * tangente(40))],
        `Dato y incógnita son hipotenusa y opuesto: seno. $a=15\\cdot\\operatorname{sen}(40^{\\circ})\\approx ${dt(15 * seno(40))}$. El valor ${d(15 * coseno(40))} es 15·cos 40° (el adyacente), ${d(15 / seno(40))} divide en lugar de multiplicar y ${d(15 * tangente(40))} usa la tangente.`
      ),
      preg(
        "Conoces el cateto adyacente a un ángulo y quieres hallar la hipotenusa. ¿Qué razón usas?",
        "El coseno",
        ["El seno", "La tangente", "Ninguna: faltan datos"],
        "Adyacente e hipotenusa son los dos lados del coseno (adyacente ÷ hipotenusa). El seno usa el opuesto y la tangente no usa la hipotenusa."
      ),
      preg(
        `Al calcular $\\operatorname{sen}(35^{\\circ})$ la calculadora muestra $${dt(radianes35)}$. ¿Qué pasó?`,
        "Está en modo radianes: hay que pasarla a grados (DEG)",
        ["El seno de un ángulo agudo puede ser negativo", "Falta apretar la tecla de segunda función", "El ángulo es demasiado grande para el seno"],
        `En modo radianes la calculadora interpreta 35 como 35 radianes y da $${dt(radianes35)}$. El seno de un ángulo agudo es siempre positivo; con la calculadora en grados da $${dt(seno(35))}$.`
      ),
      preg(
        "Si $\\cos(25^{\\circ})=\\dfrac{6}{c}$, ¿cuánto vale $c$?",
        d(6 / coseno(25)),
        [d(6 * coseno(25)), d(6 * seno(25)), d(6 / seno(25))],
        `La incógnita está abajo, así que se divide: $c=\\frac{6}{\\cos(25^{\\circ})}\\approx ${dt(6 / coseno(25))}$. El valor ${d(6 * coseno(25))} multiplica en lugar de dividir y ${d(6 / seno(25))} usa el seno en lugar del coseno.`
      ),
      preg(
        "El cateto adyacente a un ángulo de $32^{\\circ}$ mide 10. ¿Cuánto mide el cateto opuesto?",
        d(10 * tangente(32)),
        [d(10 / tangente(32)), d(10 * seno(32)), d(10 * coseno(32))],
        `Dato: adyacente; incógnita: opuesto. Los dos catetos usan la tangente: $\\tan(32^{\\circ})=\\frac{a}{10}$, de donde $a=10\\cdot\\tan(32^{\\circ})\\approx ${dt(10 * tangente(32))}$.`
      ),
    ],
  },

  // ---------------------------------------------------------------- 5
  {
    slug: "trigonometria-clase-05-hallar-un-angulo",
    grupo: "razones",
    orden: 5,
    requierePro: true,
    nombre: "Hallar un ángulo: las razones inversas",
    descripcion: "Cuando el ángulo es la incógnita: seno, coseno y tangente inversos, con la calculadora y con un triángulo de dos lados dados.",
    conceptos: { introduce: ["razones-inversas", "hallar-angulo"], usa: ["hallar-lado", "calculadora-grados", "angulos-triangulo", "razon-seno", "razon-coseno", "razon-tangente"] },
    pasos: [
      "Objetivo: al terminar podrás hallar un ángulo agudo de un triángulo rectángulo a partir de dos de sus lados, usando la función inversa correcta en la calculadora.",
      "Intuición. Hasta ahora el ángulo era un dato y se calculaba un lado. Ahora es al revés: conoces dos lados, así que conoces una razón, y quieres saber qué ángulo tiene esa razón. Si $\\operatorname{sen}(A)=0{,}6$, ¿qué ángulo es $A$? La función que «deshace» el seno se llama seno inverso o arcoseno.",
      "Notación. El seno inverso se escribe $\\operatorname{sen}^{-1}$ (o arcsen), el coseno inverso $\\cos^{-1}$ (o arccos) y la tangente inversa $\\tan^{-1}$ (o arctan). En la calculadora, se usa la tecla de segunda función (SHIFT o 2ND) más la tecla de la razón. Ojo: $\\operatorname{sen}^{-1}(x)$ NO es $\\frac{1}{\\operatorname{sen}(x)}$; eso es la cosecante.",
      `Ejemplo resuelto. Un triángulo rectángulo tiene catetos de 3 y 4. Hallar el ángulo $A$ opuesto al cateto de 3. Los dos lados son opuesto y adyacente: tangente. ${m("\\tan(A)=\\dfrac{3}{4}")}, así que ${m("A=\\tan^{-1}\\!\\left(\\dfrac{3}{4}\\right)\\approx " + dt(ej5, 1) + "^{\\circ}")}. El otro ángulo agudo es $B=90^{\\circ}-${d(ej5, 1)}^{\\circ}=${d(90 - ej5, 1)}^{\\circ}$.`,
      "Cuál inversa usar: mira los dos lados que conoces. Opuesto e hipotenusa: $\\operatorname{sen}^{-1}$. Adyacente e hipotenusa: $\\cos^{-1}$. Opuesto y adyacente: $\\tan^{-1}$. Es la misma elección de razón que al hallar un lado; solo cambia que al final usas la inversa.",
      `Un ejemplo con contexto. Una rampa de 5 m llega a una altura de 1,2 m. El ángulo con el suelo tiene el lado de 1,2 m como opuesto y el de 5 m como hipotenusa, así que se usa el seno inverso: $\\operatorname{sen}^{-1}\\!\\left(\\frac{1{,}2}{5}\\right)\\approx ${dt(arcoSeno(1.2 / 5), 1)}^{\\circ}$.`,
      "Una simplificación del colegio. En un triángulo rectángulo el ángulo agudo siempre está entre $0^{\\circ}$ y $90^{\\circ}$, y las tres inversas de la calculadora dan justo un ángulo en ese rango. Cuando más adelante resuelvas ecuaciones con ángulos mayores, la calculadora seguirá dando solo UNA solución y habrá que buscar las demás.",
      "Errores comunes. 1) Usar $\\frac{1}{\\operatorname{sen}}$ en lugar de $\\operatorname{sen}^{-1}$. 2) Elegir la inversa equivocada por confundir el opuesto con el adyacente. 3) Obtener un error al calcular $\\operatorname{sen}^{-1}(1{,}2)$: ningún ángulo tiene seno mayor que 1, así que seguramente se dividió al revés (hipotenusa sobre cateto). 4) Trabajar con la calculadora en radianes.",
    ],
    visuales: [
      {
        tipo: "trigonometria.resolver",
        despuesDePaso: 3,
        titulo: "Hallar el ángulo con catetos de 3 y 4",
        modo: "angulo",
        lados: [
          { lado: "a", valor: 3 },
          { lado: "b", valor: 4 },
        ],
      },
    ],
    quiz: [
      preg("Si $\\operatorname{sen}(A)=0{,}5$ y $A$ es agudo, ¿cuánto mide $A$?", "$30^{\\circ}$", ["$60^{\\circ}$", "$45^{\\circ}$", "$0{,}5^{\\circ}$"], "El seno inverso de 0,5 es $30^{\\circ}$ (el triángulo de $30^{\\circ}$ tiene el cateto opuesto igual a la mitad de la hipotenusa). $60^{\\circ}$ tiene seno 0,87 y $45^{\\circ}$ tiene seno 0,71."),
      preg(
        "Un triángulo rectángulo tiene catetos de 5 y 12. ¿Cuánto mide el ángulo opuesto al cateto de 5, redondeado a un decimal?",
        `$${dt(arcoTangente(5 / 12), 1)}^{\\circ}$`,
        [`$${dt(arcoTangente(12 / 5), 1)}^{\\circ}$`, `$${dt(arcoSeno(5 / 12), 1)}^{\\circ}$`, `$${dt(5 / 12, 2)}^{\\circ}$`],
        `Son dos catetos, opuesto y adyacente: tangente inversa. $\\tan^{-1}(5/12)\\approx ${dt(arcoTangente(5 / 12), 1)}^{\\circ}$. El ángulo de ${d(arcoTangente(12 / 5), 1)}° es el otro ángulo agudo (el opuesto al 12), y ${d(arcoSeno(5 / 12), 1)}° usó el seno con un cateto.`
      ),
      preg(
        "La calculadora da error al calcular $\\operatorname{sen}^{-1}(1{,}2)$. ¿Por qué?",
        "Ningún ángulo tiene seno mayor que 1: seguramente se dividió al revés",
        ["La calculadora está en radianes", "El ángulo es mayor que $90^{\\circ}$", "Hay que usar el coseno inverso"],
        "El seno de cualquier ángulo está entre $-1$ y $1$. Un cociente mayor que 1 indica que se puso la hipotenusa (el lado más largo) en el numerador."
      ),
      preg(
        "¿Es lo mismo $\\operatorname{sen}^{-1}(x)$ que $\\dfrac{1}{\\operatorname{sen}(x)}$?",
        "No: la primera es la función inversa (devuelve un ángulo) y la segunda la cosecante",
        ["Sí, son dos formas de escribir lo mismo", "Sí, pero solo para ángulos agudos", "No: la primera es la tangente"],
        "$\\operatorname{sen}^{-1}(x)$ es el ángulo cuyo seno es $x$; $\\frac{1}{\\operatorname{sen}(x)}$ es un número, la cosecante del ángulo $x$. Notación parecida, significados distintos."
      ),
      preg(
        "Una rampa de 5 m de largo llega a 1,2 m de altura. ¿Qué ángulo forma con el suelo (un decimal)?",
        `$${dt(arcoSeno(1.2 / 5), 1)}^{\\circ}$`,
        [`$${dt(arcoTangente(1.2 / 5), 1)}^{\\circ}$`, `$${dt(90 - arcoSeno(1.2 / 5), 1)}^{\\circ}$`, `$${dt(1.2 / 5, 2)}^{\\circ}$`],
        `El largo de la rampa es la hipotenusa y la altura es el opuesto: seno inverso, $\\operatorname{sen}^{-1}(1{,}2/5)\\approx ${dt(arcoSeno(1.2 / 5), 1)}^{\\circ}$. La tangente inversa daría ${d(arcoTangente(1.2 / 5), 1)}° (tratando el largo como si fuera el adyacente) y ${d(90 - arcoSeno(1.2 / 5), 1)}° es el ángulo del extremo de arriba.`
      ),
    ],
  },

  // ---------------------------------------------------------------- 6
  {
    slug: "trigonometria-clase-06-triangulos-especiales",
    grupo: "razones",
    orden: 6,
    requierePro: true,
    nombre: "Triángulos especiales: 45-45-90 y 30-60-90",
    descripcion: "El medio cuadrado y el medio equilátero: de dónde salen los valores exactos de 30°, 45° y 60° sin calculadora.",
    conceptos: { introduce: ["triangulo-45-45-90", "triangulo-30-60-90", "valores-notables-agudos"], usa: ["pitagoras", "razon-seno", "razon-coseno", "razon-tangente", "fracciones-raices"] },
    pasos: [
      "Objetivo: al terminar podrás obtener, dibujando un triángulo, los valores exactos del seno, el coseno y la tangente de $30^{\\circ}$, $45^{\\circ}$ y $60^{\\circ}$, sin calculadora y sin memorizarlos a ciegas.",
      "Intuición. Hay dos triángulos rectángulos con lados tan «limpios» que las razones salen exactas: el que sale de cortar un cuadrado por su diagonal y el que sale de cortar un triángulo equilátero por su altura.",
      `Medio cuadrado ($45^{\\circ}$-$45^{\\circ}$-$90^{\\circ}$). Un cuadrado de lado 1 se corta por su diagonal. Quedan dos triángulos con catetos 1 y 1, y por Pitágoras la hipotenusa es $\\sqrt{2}$. Los dos ángulos agudos son iguales: $45^{\\circ}$. Entonces ${m("\\operatorname{sen}(45^{\\circ})=\\dfrac{1}{\\sqrt{2}}=\\dfrac{\\sqrt{2}}{2}")}, ${m("\\cos(45^{\\circ})=\\dfrac{\\sqrt{2}}{2}")} y ${m("\\tan(45^{\\circ})=1")}. (Se «racionaliza» multiplicando arriba y abajo por $\\sqrt{2}$.)`,
      `Medio equilátero ($30^{\\circ}$-$60^{\\circ}$-$90^{\\circ}$). Un triángulo equilátero de lado 2 se corta por su altura. Quedan dos triángulos rectángulos con hipotenusa 2, un cateto de 1 (la mitad de la base) y el otro cateto de $\\sqrt{3}$ (por Pitágoras, $2^{2}-1^{2}=3$). El cateto de 1 está frente al ángulo menor, $30^{\\circ}$: ${m("\\operatorname{sen}(30^{\\circ})=\\dfrac{1}{2}")}, ${m("\\cos(30^{\\circ})=\\dfrac{\\sqrt{3}}{2}")} y ${m("\\tan(30^{\\circ})=\\dfrac{1}{\\sqrt{3}}=\\dfrac{\\sqrt{3}}{3}")}.`,
      `Para $60^{\\circ}$ solo se cambia de ángulo en el mismo triángulo: el opuesto pasa a ser $\\sqrt{3}$ y el adyacente 1. Entonces ${m("\\operatorname{sen}(60^{\\circ})=\\dfrac{\\sqrt{3}}{2}")}, ${m("\\cos(60^{\\circ})=\\dfrac{1}{2}")} y ${m("\\tan(60^{\\circ})=\\sqrt{3}")}. Observa que el seno de $30^{\\circ}$ es el coseno de $60^{\\circ}$.`,
      `La tabla completa, para tenerla a la vista: $30^{\\circ}$: seno ${mval("sen", 30)}, coseno ${mval("cos", 30)}, tangente ${mval("tan", 30)}. $45^{\\circ}$: seno ${mval("sen", 45)}, coseno ${mval("cos", 45)}, tangente ${mval("tan", 45)}. $60^{\\circ}$: seno ${mval("sen", 60)}, coseno ${mval("cos", 60)}, tangente ${mval("tan", 60)}.`,
      "Ejemplo resuelto. Un triángulo rectángulo tiene un ángulo de $30^{\\circ}$ y su hipotenusa mide 10. ¿Cuánto mide el cateto opuesto? Como $\\operatorname{sen}(30^{\\circ})=\\frac{1}{2}$, el cateto opuesto es la mitad de la hipotenusa: 5. Otro: la diagonal de un cuadrado de lado 4 es la hipotenusa de un triángulo 45-45-90 con catetos 4, así que mide $4\\sqrt{2}\\approx 5{,}66$.",
      "Errores comunes. 1) Confundir $\\frac{1}{2}$ y $\\frac{\\sqrt{3}}{2}$ entre $30^{\\circ}$ y $60^{\\circ}$: el ángulo menor tiene el seno menor (frente al lado más corto). 2) Olvidar que $\\frac{1}{\\sqrt{3}}$ y $\\frac{\\sqrt{3}}{3}$ valen lo mismo. 3) Confundir la tangente con el seno de $45^{\\circ}$: el seno vale $\\frac{\\sqrt{2}}{2}$, pero la tangente, con catetos iguales, vale 1.",
    ],
    visuales: [
      { tipo: "trigonometria.triangulo", despuesDePaso: 2, titulo: "Medio cuadrado: catetos 1 y 1", catetos: [1, 1], vertice: "A", pasos: ["opuesto", "adyacente", "hipotenusa", "sen", "cos", "tan"] },
      { tipo: "trigonometria.triangulo", despuesDePaso: 3, titulo: "Medio equilátero: catetos 1 y $\\sqrt{3}$", catetos: [1, 1.7321], vertice: "A", pasos: ["opuesto", "adyacente", "hipotenusa", "sen", "cos", "tan"] },
      { tipo: "trigonometria.triangulo", despuesDePaso: 4, titulo: "El mismo triángulo visto desde el ángulo de $60^{\\circ}$", catetos: [1, 1.7321], vertice: "B", pasos: ["sen", "cos", "tan"] },
    ],
    quiz: [
      preg("¿Cuánto vale $\\cos(60^{\\circ})$?", mval("cos", 60), [mval("cos", 30), mval("sen", 45), mval("tan", 60)], "En el triángulo 30-60-90 (1, $\\sqrt{3}$, 2), el cateto adyacente a $60^{\\circ}$ es 1 y la hipotenusa 2: $\\cos(60^{\\circ})=\\frac{1}{2}$. $\\frac{\\sqrt{3}}{2}$ es el coseno de $30^{\\circ}$."),
      preg("¿Cuánto vale $\\tan(30^{\\circ})$?", mval("tan", 30), [mval("tan", 60), mval("sen", 30), mval("cos", 30)], "Frente a $30^{\\circ}$ está el cateto de 1 y al lado el de $\\sqrt{3}$: $\\tan(30^{\\circ})=\\frac{1}{\\sqrt{3}}=\\frac{\\sqrt{3}}{3}$. $\\sqrt{3}$ es la tangente de $60^{\\circ}$."),
      preg("¿Cuánto vale $\\operatorname{sen}(45^{\\circ})$?", mval("sen", 45), ["$\\dfrac{1}{2}$", "$1$", "$\\sqrt{2}$"], "Con catetos 1 y 1 la hipotenusa es $\\sqrt{2}$ y el seno es $\\frac{1}{\\sqrt{2}}=\\frac{\\sqrt{2}}{2}$. El seno de un ángulo agudo es menor que 1, así que $1$ y $\\sqrt{2}$ no pueden ser; $\\frac{1}{2}$ es el seno de $30^{\\circ}$."),
      preg("Un triángulo rectángulo tiene un ángulo de $30^{\\circ}$ y la hipotenusa mide 10. ¿Cuánto mide el cateto opuesto a ese ángulo?", "5", ["$5\\sqrt{3}\\approx 8{,}66$", "$10\\sqrt{3}\\approx 17{,}32$", "$10$"], "Como $\\operatorname{sen}(30^{\\circ})=\\frac{1}{2}$, el opuesto a $30^{\\circ}$ es la mitad de la hipotenusa: 5. $5\\sqrt{3}$ sería el cateto adyacente."),
      preg("¿Cuánto mide la diagonal de un cuadrado de lado 4?", "$4\\sqrt{2}\\approx 5{,}66$", ["$8$", "$4$", "$2\\sqrt{2}\\approx 2{,}83$"], "La diagonal es la hipotenusa de un triángulo 45-45-90 de catetos 4: es el cateto por $\\sqrt{2}$, es decir, $4\\sqrt{2}$. Por Pitágoras: $\\sqrt{16+16}=\\sqrt{32}\\approx 5{,}66$."),
    ],
  },

  // ---------------------------------------------------------------- 7
  {
    slug: "trigonometria-clase-07-elevacion-y-depresion",
    grupo: "razones",
    orden: 7,
    requierePro: true,
    nombre: "Ángulos de elevación y de depresión",
    descripcion: "Problemas con enunciado: medir desde la horizontal, dibujar el triángulo y decidir qué razón usar.",
    conceptos: { introduce: ["angulo-elevacion", "angulo-depresion", "problemas-rectangulo"], usa: ["hallar-lado", "hallar-angulo", "razones-inversas", "razon-tangente"] },
    pasos: [
      "Objetivo: al terminar podrás resolver problemas de alturas y distancias que hablan de ángulos de elevación y de depresión, dibujando primero el triángulo rectángulo.",
      "Intuición y definiciones. Ambos ángulos se miden desde una línea horizontal imaginaria, que sale del ojo del observador. El ángulo de elevación es el que se forma al mirar hacia ARRIBA (la línea de la visual sube). El ángulo de depresión es el que se forma al mirar hacia ABAJO (la visual baja).",
      "Una propiedad muy útil. Si desde lo alto de un edificio miras un objeto en el suelo con un ángulo de depresión de $25^{\\circ}$, el ángulo en el suelo, entre el piso y la visual hacia el edificio, también mide $25^{\\circ}$: son ángulos alternos internos entre dos horizontales paralelas. Así, el triángulo rectángulo que dibujas tiene ese ángulo en la base.",
      `Ejemplo 1 (elevación). Desde un punto a 40 m de la base de una torre, la cima se ve con un ángulo de elevación de $35^{\\circ}$. ¿Qué altura tiene la torre? El adyacente al ángulo es 40 (la distancia al suelo) y el opuesto es la altura: tangente. ${m("\\tan(35^{\\circ})=\\dfrac{h}{40}")}, así que ${m("h=40\\cdot\\tan(35^{\\circ})\\approx " + dt(ej7a.a) + "\\ \\text{m}")}.`,
      `Ejemplo 2 (depresión). Desde lo alto de un faro de 60 m, un bote se ve con un ángulo de depresión de $25^{\\circ}$. ¿A qué distancia horizontal de la base del faro está el bote? En el triángulo, el ángulo de $25^{\\circ}$ está en el bote; el opuesto es la altura del faro (60) y el adyacente es la distancia buscada $d$: ${m("\\tan(25^{\\circ})=\\dfrac{60}{d}")}, así que ${m("d=\\dfrac{60}{\\tan(25^{\\circ})}\\approx " + dt(ej7b.b) + "\\ \\text{m}")}.`,
      "Si el observador tiene estatura. La visual sale de sus ojos, no del suelo: la altura total es la que calculas más la altura de los ojos. Por ejemplo, con ojos a 1,7 m y $h=10$ m calculados desde el nivel de los ojos, el objeto mide 11,7 m.",
      "Errores comunes. 1) Medir el ángulo de depresión desde la vertical o desde el suelo del observador: siempre se mide desde la horizontal. 2) Poner el ángulo de depresión en el vértice de arriba del triángulo en lugar de en el de abajo (son iguales por ángulos alternos, pero el triángulo se arma con el de abajo). 3) Olvidar sumar la estatura del observador. 4) Usar el seno o el coseno cuando conoces las dos distancias horizontal y vertical: son los dos catetos, así que va la tangente.",
    ],
    visuales: [
      { tipo: "trigonometria.resolver", despuesDePaso: 3, titulo: "Ejemplo 1: altura de una torre", modo: "lado", angulo: 35, dado: "b", valor: 40, pedido: "a" },
      { tipo: "trigonometria.resolver", despuesDePaso: 4, titulo: "Ejemplo 2: distancia a un bote desde un faro", modo: "lado", angulo: 25, dado: "a", valor: 60, pedido: "b" },
    ],
    quiz: [
      preg(
        "Desde un punto a 50 m de la base de una torre, el ángulo de elevación de la cima es de $30^{\\circ}$. ¿Qué altura tiene la torre (ignora la estatura de quien mira)?",
        d(50 * tangente(30)),
        [d(50 / tangente(30)), d(50 * seno(30)), d(50 * coseno(30))],
        `La distancia (50) es el adyacente y la altura es el opuesto: $h=50\\cdot\\tan(30^{\\circ})\\approx ${dt(50 * tangente(30))}$ m. El valor ${d(50 / tangente(30))} divide en lugar de multiplicar.`
      ),
      preg(
        "Desde lo alto de un acantilado de 80 m, el ángulo de depresión de un bote es de $20^{\\circ}$. ¿A qué distancia horizontal de la base está el bote?",
        d(80 / tangente(20)),
        [d(80 * tangente(20)), d(80 / seno(20)), d(80 * coseno(20))],
        `El ángulo de $20^{\\circ}$ también está en el bote; la altura (80) es el opuesto y la distancia el adyacente: $d=\\frac{80}{\\tan(20^{\\circ})}\\approx ${dt(80 / tangente(20))}$ m. El valor ${d(80 / seno(20))} es la distancia en línea recta (la visual), no la horizontal.`
      ),
      preg(
        "El ángulo de depresión se mide…",
        "desde la horizontal hacia abajo",
        ["desde la vertical hacia abajo", "desde el suelo hacia arriba", "desde la base del objeto hasta los ojos"],
        "Elevación y depresión se miden siempre respecto de la línea horizontal que sale del ojo del observador: hacia arriba, elevación; hacia abajo, depresión."
      ),
      preg(
        "Una persona con los ojos a 1,7 m del suelo está a 12 m de un árbol y ve la copa con un ángulo de elevación de $40^{\\circ}$. ¿Qué altura tiene el árbol?",
        d(1.7 + 12 * tangente(40)),
        [d(12 * tangente(40)), d(12 / tangente(40) + 1.7), d(1.7 + 12 * seno(40))],
        `Desde los ojos, la copa sube $12\\cdot\\tan(40^{\\circ})\\approx ${dt(12 * tangente(40))}$ m, y a eso se le suman los 1,7 m de altura de los ojos: $${dt(1.7 + 12 * tangente(40))}$ m. El valor ${d(12 * tangente(40))} olvida la estatura.`
      ),
      preg(
        "Desde un faro, el ángulo de depresión de un bote es de $25^{\\circ}$. ¿Cuánto mide el ángulo del triángulo en el bote, entre el agua y la visual hacia el faro?",
        "$25^{\\circ}$",
        ["$65^{\\circ}$", "$155^{\\circ}$", "$90^{\\circ}$"],
        "Son ángulos alternos internos entre dos rectas paralelas (la horizontal del faro y el nivel del agua): miden lo mismo, $25^{\\circ}$. $65^{\\circ}$ es el ángulo en la cima entre la visual y la vertical."
      ),
    ],
  },
];

// Comprobaciones de construcción: si un dato cambia y esto deja de valer, el contenido no se genera.
if (val("sen", 30) !== "\\frac{1}{2}" || val("tan", 45) !== "1") throw new Error("Los valores exactos de las Clases de razones no coinciden con la tabla");
