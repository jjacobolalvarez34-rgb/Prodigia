import { aRad, arcoCoseno, arcoSeno, areaSAS, cantidadSSA, oblicuoAAS, oblicuoSAS, oblicuoSSS, solucionesSSA } from "@/lib/trigonometria/triangulos";
import type { ClaseTrigonometria } from "./tipos";
import { cuadros, d, dt, m, preg } from "./ayudas";

// Clases del bloque "leyes" (Pro): ley del seno, ley del coseno, cuál ley usar y
// el área con seno, y el caso ambiguo (SSA). Todos los lados, ángulos y áreas de
// los ejemplos y del quiz se calculan con triangulos.ts (contrastado en sus
// tests con la ley del seno cruzada, la fórmula de Herón y un conteo geométrico).

const s = (g: number): number => Math.sin(aRad(g));

// Ley del seno: A = 40°, B = 65°, a = 12.
const ls1 = oblicuoAAS(40, 65, 12);
// Ley del seno para un ángulo: a = 13, b = 10, A = 50° (a > b: una sola solución).
const lsB = arcoSeno((10 * s(50)) / 13);
// Ley del coseno SAS: a = 8, b = 11, C = 50°.
const lc1 = oblicuoSAS(8, 11, 50);
// Ley del coseno SSS: a = 7, b = 10, c = 12 (ángulo C).
const lc2 = oblicuoSSS(7, 10, 12);
// Un triángulo con un ángulo obtuso: lados 5, 7 y 10.
const lcObtuso = oblicuoSSS(5, 7, 10);
// Área: a = 10, b = 7, C = 35° y con ángulo obtuso a = 6, b = 9, C = 130°.
const ar1 = areaSAS(10, 7, 35);
const ar2 = areaSAS(6, 9, 130);
// Lago: PA = 120, PB = 90, ángulo APB = 65°.
const lago = oblicuoSAS(120, 90, 65);
// Caso ambiguo: a = 7, b = 10, A = 30° (dos triángulos) y a = 4 (ninguno).
const amb = solucionesSSA(7, 10, 30);
const ambB1 = amb[0].B;
const ambB2 = amb[1].B;

// Comprobaciones de construcción: si un dato cambia y esto deja de valer, el contenido no se genera.
if (cantidadSSA(7, 10, 30) !== 2 || cantidadSSA(4, 10, 30) !== 0 || cantidadSSA(5, 10, 30) !== 1 || cantidadSSA(12, 10, 40) !== 1) throw new Error("Casos SSA inesperados");
if (amb.length !== 2 || Math.abs(ambB1 + ambB2 - 180) > 1e-9) throw new Error("Los dos ángulos B del caso ambiguo deben ser suplementarios");

export const CLASES_TRIGONOMETRIA_LEYES: ClaseTrigonometria[] = [
  // ---------------------------------------------------------------- 19
  {
    slug: "trigonometria-clase-19-ley-del-seno",
    grupo: "leyes",
    orden: 1,
    requierePro: true,
    nombre: "Ley del seno",
    descripcion: "Triángulos sin ángulo recto: de dónde sale la ley del seno y cómo hallar un lado o un ángulo cuando hay una pareja ángulo–lado opuesto.",
    conceptos: { introduce: ["triangulo-oblicuo", "ley-seno"], usa: ["razon-seno", "angulos-triangulo", "ecuacion-lineal"] },
    pasos: [
      "Objetivo: al terminar podrás resolver triángulos que no tienen ángulo recto usando la ley del seno para hallar un lado o un ángulo, siempre que conozcas una pareja completa: un ángulo y su lado opuesto.",
      "Intuición. Un triángulo sin ángulo recto se llama oblicuo. Aunque no tenga ángulo recto, se le puede trazar una altura que lo parte en dos triángulos rectángulos, y ahí aparece el seno. Esa altura mide $h=b\\operatorname{sen}(A)$ y también $h=a\\operatorname{sen}(B)$. Igualándolas, $b\\operatorname{sen}(A)=a\\operatorname{sen}(B)$, es decir, $\\frac{a}{\\operatorname{sen}(A)}=\\frac{b}{\\operatorname{sen}(B)}$.",
      "La ley del seno. En todo triángulo, con la convención de que el lado $a$ es opuesto al ángulo $A$, el $b$ al $B$ y el $c$ al $C$: $\\dfrac{a}{\\operatorname{sen}(A)}=\\dfrac{b}{\\operatorname{sen}(B)}=\\dfrac{c}{\\operatorname{sen}(C)}$. En palabras: cada lado dividido entre el seno de su ángulo opuesto da siempre el mismo número.",
      "Cuándo sirve. Cuando conoces una pareja completa (un ángulo y su lado opuesto) y un dato más: otro ángulo o otro lado. Es el caso de dos ángulos y un lado (ASA o AAS). Antes de empezar, si te dan dos ángulos, calcula el tercero: los tres suman $180^{\\circ}$.",
      `Ejemplo 1: hallar un lado. En un triángulo, $A=40^{\\circ}$, $B=65^{\\circ}$ y $a=12$. Primero, $C=180^{\\circ}-40^{\\circ}-65^{\\circ}=${ls1.C}^{\\circ}$. La pareja completa es $A$ y $a$. Entonces ${m("\\dfrac{b}{\\operatorname{sen}(65^{\\circ})}=\\dfrac{12}{\\operatorname{sen}(40^{\\circ})}")}, y ${m("b=12\\cdot\\dfrac{\\operatorname{sen}(65^{\\circ})}{\\operatorname{sen}(40^{\\circ})}\\approx " + dt(ls1.b) + "")}.`,
      `Ejemplo 2: hallar un ángulo. Un triángulo tiene $a=13$, $b=10$ y $A=50^{\\circ}$. La pareja completa es $A$ y $a$: ${m("\\dfrac{\\operatorname{sen}(B)}{10}=\\dfrac{\\operatorname{sen}(50^{\\circ})}{13}")}, así que ${m("\\operatorname{sen}(B)=\\dfrac{10\\cdot\\operatorname{sen}(50^{\\circ})}{13}\\approx " + dt((10 * s(50)) / 13, 4) + "")} y $B=\\operatorname{sen}^{-1}(${d((10 * s(50)) / 13, 4)})\\approx ${d(lsB, 1)}^{\\circ}$. Al ser $a>b$, el ángulo $B$ tiene que ser menor que $A$: es agudo y no hay otra posibilidad (la clase 22 explica qué pasa si $a<b$).`,
      "Errores comunes. 1) Usar la ley del seno cuando no hay una pareja completa (por ejemplo, con dos lados y el ángulo entre ellos: ahí se usa el coseno). 2) Poner un lado que no es el opuesto al ángulo en la fracción. 3) Despejar mal: si el seno queda en el denominador, se divide. 4) Tener la calculadora en radianes.",
    ],
    visuales: [
      { tipo: "trigonometria.ley", despuesDePaso: 2, titulo: "Ley del seno: $A=40^{\\circ}$, $B=65^{\\circ}$ y $a=12$", ley: "seno", datos: { A: 40, B: 65, a: 12 } },
      cuadros(5, "Hallar un ángulo con la ley del seno", [
        { texto: "Se conocen $a=13$, $b=10$ y $A=50^{\\circ}$. Se arma la igualdad con la pareja completa.", formula: "\\dfrac{\\operatorname{sen}(B)}{10}=\\dfrac{\\operatorname{sen}(50^{\\circ})}{13}" },
        { texto: "Se despeja el seno de $B$.", formula: `\\operatorname{sen}(B)=\\dfrac{10\\cdot\\operatorname{sen}(50^{\\circ})}{13}\\approx ${dt((10 * s(50)) / 13, 4)}` },
        { texto: "Se aplica el seno inverso:", resaltar: `B ≈ ${d(lsB, 1)}°` },
      ]),
    ],
    quiz: [
      preg("¿Cuál es la ley del seno para un triángulo con lados $a$, $b$ y ángulos opuestos $A$, $B$?", "$\\dfrac{a}{\\operatorname{sen}(A)}=\\dfrac{b}{\\operatorname{sen}(B)}$", ["$\\dfrac{a}{\\operatorname{sen}(B)}=\\dfrac{b}{\\operatorname{sen}(A)}$", "$a\\operatorname{sen}(A)=b\\operatorname{sen}(B)$", "$a^{2}=b^{2}+c^{2}-2bc\\cos(A)$"], "Cada lado va con el seno de SU ángulo opuesto. La segunda opción cruza las parejas y la última es la ley del coseno."),
      preg("En un triángulo, $A=30^{\\circ}$, $B=45^{\\circ}$ y $a=10$. ¿Cuánto mide $b$?", d((10 * s(45)) / s(30)), [d((10 * s(30)) / s(45)), d(10 * s(45) * s(30)), d(10 * s(30))], `$b=\\frac{10\\cdot\\operatorname{sen}(45^{\\circ})}{\\operatorname{sen}(30^{\\circ})}\\approx ${dt((10 * s(45)) / s(30))}$. El valor ${d((10 * s(30)) / s(45))} invierte las parejas.`),
      preg(`Un triángulo tiene $A=40^{\\circ}$ y $B=65^{\\circ}$. ¿Cuánto mide $C$?`, `$${ls1.C}^{\\circ}$`, ["$105^{\\circ}$", "$25^{\\circ}$", "$140^{\\circ}$"], `Los tres ángulos suman $180^{\\circ}$: $180-40-65=${ls1.C}$. El valor $105^{\\circ}$ es $40+65$, la suma de los dos que ya se conocían.`),
      preg("¿Con cuál de estos datos se puede usar la ley del seno directamente?", "Un ángulo, su lado opuesto y otro ángulo", ["Dos lados y el ángulo que está entre ellos", "Los tres lados", "Solo los tres ángulos"], "La ley del seno necesita una pareja completa (ángulo y lado opuesto) más un dato. Con dos lados y el ángulo entre ellos, o con tres lados, se usa la ley del coseno; con tres ángulos solo se conoce la forma, no el tamaño."),
      preg("Un triángulo tiene $a=13$, $b=10$ y $A=50^{\\circ}$. ¿Cuánto mide $B$ (un decimal)?", `$${dt(lsB, 1)}^{\\circ}$`, [`$${dt(180 - lsB, 1)}^{\\circ}$`, `$${dt(arcoSeno((13 * s(50)) / 10), 1)}^{\\circ}$`, `$${dt(arcoCoseno((10 * s(50)) / 13), 1)}^{\\circ}$`], `$\\operatorname{sen}(B)=\\frac{10\\cdot\\operatorname{sen}(50^{\\circ})}{13}\\approx ${dt((10 * s(50)) / 13, 4)}$, así que $B\\approx ${dt(lsB, 1)}^{\\circ}$. El valor ${d(180 - lsB, 1)}° no cabe (con $A=50^{\\circ}$ la suma pasaría de $180^{\\circ}$), ${d(arcoSeno((13 * s(50)) / 10), 1)}° intercambia $a$ y $b$ y ${d(arcoCoseno((10 * s(50)) / 13), 1)}° usó el coseno inverso.`),
    ],
  },

  // ---------------------------------------------------------------- 20
  {
    slug: "trigonometria-clase-20-ley-del-coseno",
    grupo: "leyes",
    orden: 2,
    requierePro: true,
    nombre: "Ley del coseno",
    descripcion: "El teorema de Pitágoras generalizado: hallar el tercer lado con dos lados y el ángulo entre ellos, o un ángulo con los tres lados.",
    conceptos: { introduce: ["ley-coseno"], usa: ["pitagoras", "razon-coseno", "signos-cuadrantes", "razones-inversas"] },
    pasos: [
      "Objetivo: al terminar podrás usar la ley del coseno para hallar el tercer lado de un triángulo cuando conoces dos lados y el ángulo entre ellos, o un ángulo cuando conoces los tres lados.",
      "Intuición. Cuando conoces dos lados y el ángulo que está ENTRE ellos (SAS), o los tres lados (SSS), no tienes ninguna pareja ángulo–lado opuesto: la ley del seno no puede arrancar. Hace falta otra herramienta. La ley del coseno es el teorema de Pitágoras con un término de corrección para los triángulos que no tienen ángulo recto.",
      `La ley del coseno. ${m("c^{2}=a^{2}+b^{2}-2ab\\cos(C)")}. Se lee: el cuadrado de un lado es la suma de los cuadrados de los otros dos menos el doble de su producto por el coseno del ángulo que está ENTRE esos dos lados. Hay una versión para cada lado ($a^{2}=b^{2}+c^{2}-2bc\\cos(A)$, etc.).`,
      "Relación con Pitágoras. Si $C=90^{\\circ}$, entonces $\\cos(C)=0$ y queda $c^{2}=a^{2}+b^{2}$. Si $C$ es agudo, el término restado es positivo y $c^{2}<a^{2}+b^{2}$; si $C$ es obtuso, $\\cos(C)$ es negativo y el término se suma: $c^{2}>a^{2}+b^{2}$. La ley funciona sola con cualquier ángulo, sin pensar en signos.",
      `Ejemplo 1: hallar el tercer lado (SAS). Dos lados miden $a=8$ y $b=11$ y el ángulo entre ellos es $C=50^{\\circ}$. ${m("c^{2}=8^{2}+11^{2}-2\\cdot 8\\cdot 11\\cdot\\cos(50^{\\circ})\\approx " + dt(lc1.c * lc1.c) + "")}. Entonces ${m("c=\\sqrt{" + dt(lc1.c * lc1.c) + "}\\approx " + dt(lc1.c) + "")}. Calcula el producto completo $2ab\\cos(C)$ antes de restar.`,
      `Ejemplo 2: hallar un ángulo (SSS). Un triángulo tiene lados $a=7$, $b=10$ y $c=12$. Para el ángulo $C$, se despeja el coseno: ${m("\\cos(C)=\\dfrac{a^{2}+b^{2}-c^{2}}{2ab}=\\dfrac{49+100-144}{140}\\approx " + dt(Math.cos(aRad(lc2.C)), 4) + "")}, así que $C\\approx ${d(lc2.C, 1)}^{\\circ}$.`,
      `Una ventaja al hallar ángulos. La calculadora devuelve con el coseno inverso el ángulo correcto entre $0^{\\circ}$ y $180^{\\circ}$, aunque sea obtuso. Por ejemplo, con lados 5, 7 y 10, el ángulo opuesto al 10 tiene $\\cos=\\frac{25+49-100}{70}\\approx ${dt(Math.cos(aRad(lcObtuso.C)), 3)}$: negativo, y por eso el ángulo es obtuso, ${d(lcObtuso.C, 1)}°. Con el seno inverso, en cambio, habría dado un ángulo agudo equivocado.`,
      "Errores comunes. 1) Olvidar el «−2ab» o el cuadrado de algún lado. 2) Restar antes de multiplicar: $a^{2}+b^{2}-2ab\\cos(C)$ no es $(a^{2}+b^{2}-2ab)\\cos(C)$. 3) Olvidar la raíz cuadrada al final: la fórmula da $c^{2}$. 4) Usar como $C$ el ángulo que no está entre los lados $a$ y $b$. 5) Calculadora en radianes.",
    ],
    visuales: [
      { tipo: "trigonometria.ley", despuesDePaso: 2, titulo: "Ley del coseno: $a=8$, $b=11$ y $C=50^{\\circ}$", ley: "coseno", datos: { a: 8, b: 11, C: 50 } },
      cuadros(5, "Hallar un ángulo con la ley del coseno", [
        { texto: "Lados $a=7$, $b=10$, $c=12$. Se despeja $\\cos(C)$ de la ley del coseno.", formula: "\\cos(C)=\\dfrac{a^{2}+b^{2}-c^{2}}{2ab}" },
        { texto: "Se reemplazan los lados.", formula: `\\cos(C)=\\dfrac{49+100-144}{140}\\approx ${dt(Math.cos(aRad(lc2.C)), 4)}` },
        { texto: "Coseno inverso:", resaltar: `C ≈ ${d(lc2.C, 1)}°` },
      ]),
    ],
    quiz: [
      preg("¿Cuál es la ley del coseno para el lado $c$?", "$c^{2}=a^{2}+b^{2}-2ab\\cos(C)$", ["$c^{2}=a^{2}+b^{2}+2ab\\cos(C)$", "$c=a^{2}+b^{2}-2ab\\cos(C)$", "$c^{2}=a^{2}+b^{2}-2\\cos(C)$"], "Es el cuadrado de $c$ y el término es $-2ab\\cos(C)$, con el ángulo $C$ entre los lados $a$ y $b$. Con signo más se calcularía el lado de un triángulo con el ángulo suplementario $180^{\\circ}-C$; las otras dos no tienen las unidades correctas (lado contra lado al cuadrado, o sin el producto $ab$)."),
      preg("Dos lados miden 8 y 11 y el ángulo entre ellos es $50^{\\circ}$. ¿Cuánto mide el tercer lado?", d(lc1.c), [d(lc1.c * lc1.c), d(Math.sqrt(8 * 8 + 11 * 11 + 2 * 8 * 11 * Math.cos(aRad(50)))), d(Math.sqrt(8 * 8 + 11 * 11))], `$c^{2}\\approx ${dt(lc1.c * lc1.c)}$ y $c\\approx ${dt(lc1.c)}$. El valor ${d(lc1.c * lc1.c)} olvida la raíz, ${d(Math.sqrt(8 * 8 + 11 * 11 + 2 * 8 * 11 * Math.cos(aRad(50))))} suma el término en lugar de restarlo y ${d(Math.sqrt(8 * 8 + 11 * 11))} aplica Pitágoras (ángulo recto).`),
      preg("Si el ángulo $C$ entre dos lados mide $90^{\\circ}$, ¿a qué se reduce la ley del coseno?", "Al teorema de Pitágoras: $c^{2}=a^{2}+b^{2}$", ["A la ley del seno", "A $c^{2}=a^{2}+b^{2}+2ab$", "A $c=a+b$"], "Como $\\cos(90^{\\circ})=0$, el término $-2ab\\cos(C)$ desaparece y queda $c^{2}=a^{2}+b^{2}$."),
      preg("Un triángulo tiene lados 5, 7 y 10. El ángulo opuesto al lado 10, ¿es agudo u obtuso?", "Obtuso: el coseno sale negativo", ["Agudo: el lado mayor siempre da un ángulo agudo", "Recto", "No se puede saber sin calcular el seno"], `$\\cos=\\frac{5^{2}+7^{2}-10^{2}}{2\\cdot 5\\cdot 7}=\\frac{-26}{70}\\approx ${dt(Math.cos(aRad(lcObtuso.C)), 3)}$: negativo, así que el ángulo es obtuso (${d(lcObtuso.C, 1)}°). Es un lado grande, pero $10^{2}=100>5^{2}+7^{2}=74$.`),
      preg("Un triángulo tiene lados $a=7$, $b=10$ y $c=12$. ¿Cuánto mide el ángulo $C$ (un decimal)?", `$${dt(lc2.C, 1)}^{\\circ}$`, [`$${dt(lc2.A, 1)}^{\\circ}$`, `$${dt(lc2.B, 1)}^{\\circ}$`, `$${dt(arcoCoseno(5 / 70), 1)}^{\\circ}$`], `$\\cos(C)=\\frac{49+100-144}{140}\\approx ${dt(Math.cos(aRad(lc2.C)), 4)}$ y $C\\approx ${dt(lc2.C, 1)}^{\\circ}$. Los ángulos ${d(lc2.A, 1)}° y ${d(lc2.B, 1)}° son los otros dos del triángulo, y ${d(arcoCoseno(5 / 70), 1)}° sale de olvidar el 2 del denominador.`),
    ],
  },

  // ---------------------------------------------------------------- 21
  {
    slug: "trigonometria-clase-21-cual-ley-usar-y-area",
    grupo: "leyes",
    orden: 3,
    requierePro: true,
    nombre: "Cuál ley usar y el área del triángulo",
    descripcion: "Cómo decidir entre la ley del seno y la del coseno mirando los datos, el área con ½·a·b·sen C y problemas de aplicación.",
    conceptos: { introduce: ["elegir-ley", "area-seno"], usa: ["ley-seno", "ley-coseno", "razon-seno"] },
    pasos: [
      "Objetivo: al terminar podrás elegir la ley correcta según los datos de un triángulo, calcular su área con dos lados y el ángulo entre ellos, y resolver problemas de aplicación.",
      "Intuición. La pregunta que decide todo: ¿tengo una pareja completa, un ángulo y su lado opuesto? Si sí, ley del seno. Si no, ley del coseno. Mira la tabla de casos en el cuadro.",
      "Área. Si conoces dos lados y el ángulo que está entre ellos, el área es $\\frac{1}{2}\\,a\\,b\\operatorname{sen}(C)$. Sale de $\\text{Área}=\\frac{1}{2}\\cdot\\text{base}\\cdot\\text{altura}$: con base $b$, la altura sobre ese lado mide $h=a\\operatorname{sen}(C)$ (es el cateto de un triángulo rectángulo con hipotenusa $a$).",
      `Ejemplo 1. Dos lados miden 10 y 7 y el ángulo entre ellos es $35^{\\circ}$: ${m("\\text{Área}=\\dfrac{1}{2}\\cdot 10\\cdot 7\\cdot\\operatorname{sen}(35^{\\circ})\\approx " + dt(ar1) + "")}.`,
      `Con un ángulo obtuso. La fórmula sirve igual, porque $\\operatorname{sen}(180^{\\circ}-C)=\\operatorname{sen}(C)$ (los dos ángulos suplementarios tienen el mismo seno). Por ejemplo, con lados 6 y 9 y un ángulo de $130^{\\circ}$: ${m("\\text{Área}=\\dfrac{1}{2}\\cdot 6\\cdot 9\\cdot\\operatorname{sen}(130^{\\circ})\\approx " + dt(ar2) + "")}.`,
      `Una aplicación. Para medir la distancia entre dos puntos $A$ y $B$ separados por un lago, se elige un punto $P$ desde el que $PA=120$ m, $PB=90$ m y el ángulo $APB$ mide $65^{\\circ}$. Son dos lados y el ángulo entre ellos: ley del coseno. ${m("AB^{2}=120^{2}+90^{2}-2\\cdot 120\\cdot 90\\cdot\\cos(65^{\\circ})\\approx " + dt(lago.c * lago.c, 0) + "")}, así que $AB\\approx ${d(lago.c)}$ m.`,
      "Errores comunes. 1) Usar la ley del seno sin pareja completa. 2) En el área, usar un ángulo que no está entre los dos lados dados. 3) Olvidar el $\\frac{1}{2}$. 4) En una aplicación, no dibujar el triángulo antes de decidir la ley.",
    ],
    visuales: [
      cuadros(1, "¿Qué ley uso?", [
        { texto: "Dos ángulos y un lado (ASA o AAS): halla primero el tercer ángulo. Hay pareja completa.", resaltar: "Ley del seno" },
        { texto: "Dos lados y el ángulo entre ellos (SAS): no hay pareja completa. Se busca el tercer lado.", resaltar: "Ley del coseno" },
        { texto: "Los tres lados (SSS): se busca un ángulo despejando su coseno.", resaltar: "Ley del coseno" },
        { texto: "Dos lados y un ángulo que NO está entre ellos (SSA): ley del seno, con cuidado: puede haber dos soluciones (clase 22)." },
      ], 3200),
      { tipo: "trigonometria.ley", despuesDePaso: 2, titulo: "Área con la altura: $a=10$, $b=7$ y $C=35^{\\circ}$", ley: "area", datos: { a: 10, b: 7, C: 35 } },
    ],
    quiz: [
      preg("Conoces dos lados y el ángulo que está entre ellos. ¿Qué ley usas para hallar el tercer lado?", "La ley del coseno", ["La ley del seno", "Solo el teorema de Pitágoras", "Ninguna: faltan datos"], "No hay ninguna pareja ángulo–lado opuesto, así que la ley del seno no arranca. La ley del coseno usa justo esos tres datos (SAS)."),
      preg("Te dan dos ángulos y un lado. ¿Qué haces primero?", "Calcular el tercer ángulo y usar la ley del seno", ["Usar la ley del coseno", "Calcular el área", "Restar los lados"], "Los tres ángulos suman $180^{\\circ}$, y con el tercer ángulo hay una pareja completa para la ley del seno."),
      preg("Dos lados miden 10 y 7 y el ángulo entre ellos es $35^{\\circ}$. ¿Cuál es el área del triángulo?", d(ar1), [d(10 * 7 * s(35)), d(0.5 * 10 * 7 * Math.cos(aRad(35))), d(0.5 * 10 * 7)], `$\\frac{1}{2}\\cdot 10\\cdot 7\\cdot\\operatorname{sen}(35^{\\circ})\\approx ${dt(ar1)}$. El valor ${d(10 * 7 * s(35))} olvida el $\\frac{1}{2}$ y ${d(0.5 * 10 * 7 * Math.cos(aRad(35)))} usa el coseno.`),
      preg("Los tres lados de un triángulo miden 5, 6 y 7. ¿Qué ley usas para hallar uno de sus ángulos?", "La ley del coseno", ["La ley del seno", "Ninguna: hace falta un ángulo", "El teorema de Pitágoras"], "Con tres lados y ningún ángulo no hay pareja completa: se despeja el coseno de la ley del coseno."),
      preg("Desde un punto $P$, $PA=120$ m, $PB=90$ m y el ángulo $APB$ mide $65^{\\circ}$. ¿Cuánto mide $AB$?", d(lago.c), [d(lago.c * lago.c), d(Math.sqrt(120 * 120 + 90 * 90)), d(120 + 90)], `Ley del coseno: $AB^{2}\\approx ${dt(lago.c * lago.c, 0)}$ y $AB\\approx ${dt(lago.c)}$ m. El valor 150 sería con ángulo recto y 210 es la suma de los lados.`),
    ],
  },

  // ---------------------------------------------------------------- 22
  {
    slug: "trigonometria-clase-22-el-caso-ambiguo",
    grupo: "leyes",
    orden: 4,
    requierePro: true,
    nombre: "El caso ambiguo (SSA)",
    descripcion: "Dos lados y un ángulo que no está entre ellos: cuándo hay 0, 1 o 2 triángulos y cómo hallarlos.",
    conceptos: { introduce: ["caso-ambiguo"], usa: ["ley-seno", "area-seno", "angulo-referencia", "signos-cuadrantes"] },
    pasos: [
      "Objetivo: al terminar podrás decidir cuántos triángulos existen con dos lados y un ángulo que no está entre ellos (SSA) y resolverlos.",
      "Intuición. Imagina el lado $a$ como una varilla que gira alrededor del punto $C$ tratando de tocar la base. Puede que no llegue, que la toque en un solo punto, que la corte en dos puntos (dos triángulos distintos) o, si es muy larga, que toque la base de un solo lado. Con los mismos datos puede haber entonces 0, 1 o 2 triángulos: por eso se llama caso ambiguo.",
      `Por qué pasa. Con la ley del seno, ${m("\\operatorname{sen}(B)=\\dfrac{b\\operatorname{sen}(A)}{a}")}. Pero hay dos ángulos entre $0^{\\circ}$ y $180^{\\circ}$ con el mismo seno: $B$ y $180^{\\circ}-B$ (son suplementarios, como en el ángulo de referencia). La calculadora solo da el agudo; el otro hay que buscarlo, y vale si $A+(180^{\\circ}-B)<180^{\\circ}$.`,
      "Cómo decidir sin resolver (con $A$ agudo). Se calcula la altura $h=b\\operatorname{sen}(A)$ y se compara $a$ con $h$ y con $b$: si $a<h$, ningún triángulo (no llega); si $a=h$, uno solo (es rectángulo); si $h<a<b$, dos triángulos; si $a\\geq b$, un triángulo. Si $A$ es obtuso o recto: con $a>b$ hay uno, y con $a\\leq b$ ninguno.",
      `Ejemplo con dos soluciones. $a=7$, $b=10$ y $A=30^{\\circ}$. La altura es $h=10\\operatorname{sen}(30^{\\circ})=5$ y $5<7<10$: hay dos triángulos. $\\operatorname{sen}(B)=\\frac{10\\cdot 0{,}5}{7}\\approx ${dt(10 * 0.5 / 7, 4)}$, así que $B_{1}\\approx ${d(ambB1, 1)}^{\\circ}$ y $B_{2}=180^{\\circ}-B_{1}\\approx ${d(ambB2, 1)}^{\\circ}$. Los terceros ángulos son $C_{1}\\approx ${d(amb[0].C, 1)}^{\\circ}$ y $C_{2}\\approx ${d(amb[1].C, 1)}^{\\circ}$, y los terceros lados $c_{1}\\approx ${d(amb[0].c)}$ y $c_{2}\\approx ${d(amb[1].c)}$.`,
      "Ejemplo sin solución. $a=4$, $b=10$ y $A=30^{\\circ}$. La altura es 5 y $a=4<5$: la varilla no llega a la base. En la cuenta, $\\operatorname{sen}(B)=\\frac{10\\cdot 0{,}5}{4}=1{,}25$, y la calculadora marca error porque ningún ángulo tiene seno mayor que 1.",
      "Una simplificación del colegio: en los ejercicios, casi siempre se pide decir cuántos triángulos hay y hallarlos. Los datos de la vida real (ASA, SAS, SSS) no tienen este problema; solo el SSA lo tiene.",
      "Errores comunes. 1) Dar solo el ángulo agudo sin revisar si el suplementario también cabe. 2) Descartar el segundo triángulo «por costumbre». 3) Creer que SSA siempre da dos triángulos: depende de cómo se compare $a$ con $h$ y con $b$. 4) Olvidar calcular la altura $h$ antes de resolver.",
    ],
    visuales: [
      { tipo: "trigonometria.ley", despuesDePaso: 4, titulo: "Dos triángulos: $a=7$, $b=10$ y $A=30^{\\circ}$", ley: "ambiguo", datos: { a: 7, b: 10, A: 30 } },
      { tipo: "trigonometria.ley", despuesDePaso: 5, titulo: "Ninguno: $a=4$, $b=10$ y $A=30^{\\circ}$", ley: "ambiguo", datos: { a: 4, b: 10, A: 30 } },
      { tipo: "trigonometria.ley", despuesDePaso: 3, titulo: "Uno solo: $a=12$, $b=10$ y $A=40^{\\circ}$", ley: "ambiguo", datos: { a: 12, b: 10, A: 40 } },
    ],
    quiz: [
      preg("Con $a=5$, $b=10$ y $A=30^{\\circ}$, ¿cuántos triángulos existen?", "Uno (rectángulo)", ["Ninguno", "Dos", "Infinitos"], "La altura es $h=10\\operatorname{sen}(30^{\\circ})=5=a$: la varilla toca la base en un solo punto, y el triángulo es rectángulo en $B$."),
      preg("Con $a=4$, $b=10$ y $A=30^{\\circ}$, ¿cuántos triángulos existen?", "Ninguno", ["Uno", "Dos", "Uno, pero obtuso"], "$h=5$ y $a=4<h$: no llega a la base. Con la ley del seno saldría $\\operatorname{sen}(B)=1{,}25$, imposible."),
      preg("Con $a=7$, $b=10$ y $A=30^{\\circ}$, ¿cuántos triángulos existen?", "Dos", ["Ninguno", "Uno", "Tres"], "$h=5<a=7<b=10$: la varilla corta la base en dos puntos. Dos triángulos distintos, con $B_{1}$ agudo y $B_{2}$ obtuso."),
      preg("Con $a=12$, $b=10$ y $A=40^{\\circ}$, ¿cuántos triángulos existen?", "Uno", ["Ninguno", "Dos", "Depende de la calculadora"], "Como $a\\geq b$, el ángulo $B$ (opuesto al lado menor) tiene que ser menor que $A$: solo cabe el agudo. Un triángulo."),
      preg(`Si $\\operatorname{sen}(B)=0{,}7$ con $B$ entre $0^{\\circ}$ y $180^{\\circ}$, ¿cuáles son los dos ángulos posibles?`, `$${dt(arcoSeno(0.7), 1)}^{\\circ}$ y $${dt(180 - arcoSeno(0.7), 1)}^{\\circ}$`, [`$${dt(arcoSeno(0.7), 1)}^{\\circ}$ y $${dt(90 + arcoSeno(0.7), 1)}^{\\circ}$`, `$${dt(arcoSeno(0.7), 1)}^{\\circ}$ y $${dt(360 - arcoSeno(0.7), 1)}^{\\circ}$`, `$${dt(arcoSeno(0.7), 1)}^{\\circ}$ y $${dt(-arcoSeno(0.7), 1)}^{\\circ}$`], "Los ángulos con el mismo seno son $B$ y $180^{\\circ}-B$ (suplementarios). El segundo, $180^{\\circ}-44{,}4^{\\circ}=135{,}6^{\\circ}$."),
      preg("¿Por qué existen dos soluciones en algunos problemas SSA?", "Porque $B$ y $180^{\\circ}-B$ tienen el mismo seno y los dos pueden cumplir que los ángulos sumen menos de $180^{\\circ}$", ["Porque la ley del seno es aproximada", "Porque el coseno es negativo en el segundo cuadrante", "Porque el lado $a$ es siempre más largo que $b$"], "La ley del seno solo determina el seno de $B$, y hay dos ángulos entre $0^{\\circ}$ y $180^{\\circ}$ con ese seno. Si el segundo no hace pasar de $180^{\\circ}$ la suma de los ángulos, da otro triángulo."),
    ],
  },
];
