import { aRad, areaSAS, oblicuoAAS, solucionesSSA } from "@/lib/trigonometria/triangulos";
import type { TecnicaTrigonometria } from "./tipos";
import { d, dt, preg } from "./ayudas";

// Técnicas del bloque "leyes" (gratis): cuándo usar cada ley, el área con el
// seno y el caso ambiguo. Todos los números salen de código (triangulos.ts).

const s = (g: number): number => Math.sin(aRad(g));
const ar = areaSAS(10, 7, 35);
const tri = oblicuoAAS(30, 45, 10); // A = 30°, B = 45°, a = 10 -> b = 14,14
const amb = solucionesSSA(7, 10, 30);

export const TECNICAS_TRIGONOMETRIA_LEYES: TecnicaTrigonometria[] = [
  // ---------------------------------------------------------------- 1 (existente: 0108 + quiz 0177)
  {
    slug: "trigonometria-cuando-usar-cada-ley",
    grupo: "leyes",
    orden: 1,
    requierePro: false,
    existente: true,
    nombre: "Cuándo usar la ley del seno y cuándo la del coseno",
    descripcion: "La pregunta que decide todo: ¿tienes una pareja ángulo–lado opuesto o no?",
    conceptos: { introduce: ["triangulo-oblicuo", "ley-seno", "ley-coseno", "elegir-ley"], usa: ["razon-seno", "razon-coseno"] },
    pasos: [
      "Si conoces un ángulo Y su lado opuesto (o te piden completar esa pareja), usa la ley del seno: a/sen(A) = b/sen(B) = c/sen(C).",
      "Si conoces 2 lados y el ángulo que está ENTRE ellos (SAS), o los 3 lados sin ningún ángulo (SSS), usa la ley del coseno: ahí no hay ninguna pareja ángulo–lado opuesto disponible.",
      "Truco para no confundirlas: la ley del coseno se parece a Pitágoras con un término extra (−2ab·cos C); es una versión generalizada de Pitágoras para triángulos que no son rectángulos.",
      "La ley del seno tiene forma de fracciones iguales: es más fácil despejar en cuanto tengas una fracción completa armada de un lado.",
    ],
    visuales: [{ tipo: "trigonometria.ley", despuesDePaso: 0, titulo: "Con una pareja ángulo–lado opuesto: ley del seno", ley: "seno", datos: { A: 30, B: 45, a: 10 } }],
    quiz: [
      preg("Conoces un ángulo, el lado opuesto a ese ángulo y otro ángulo. ¿Qué ley usas para completar el triángulo?", "La ley del seno", ["La ley del coseno", "Ninguna: siempre falta información", "El teorema de Pitágoras"], "Tener una pareja ángulo–lado opuesto es la señal para usar la ley del seno: $\\frac{a}{\\operatorname{sen}(A)}=\\frac{b}{\\operatorname{sen}(B)}=\\frac{c}{\\operatorname{sen}(C)}$."),
      preg("Conoces 2 lados de un triángulo y el ángulo que está ENTRE ellos (SAS). ¿Qué ley corresponde?", "La ley del coseno", ["La ley del seno", "El teorema de Pitágoras directo", "No se puede resolver sin un tercer lado"], "En SAS no hay ninguna pareja ángulo–lado opuesto disponible: ahí se aplica la ley del coseno."),
      preg("¿A qué fórmula conocida se parece la ley del coseno, con un término extra?", "Al teorema de Pitágoras, con el término extra $-2ab\\cos(C)$", ["A la ley del seno, invertida", "A la fórmula del área de un triángulo", "No se parece a ninguna"], "$c^{2}=a^{2}+b^{2}-2ab\\cos(C)$ es Pitágoras generalizado: cuando $C=90^{\\circ}$, $\\cos(C)=0$ y queda Pitágoras puro."),
      preg(`Con $A=30^{\\circ}$, $B=45^{\\circ}$ y $a=10$, ¿cuánto mide $b$?`, d(tri.b), [d((10 * s(30)) / s(45)), d(10 * s(30)), d(10 * s(45) * s(30))], `Ley del seno: $b=\\frac{10\\cdot\\operatorname{sen}(45^{\\circ})}{\\operatorname{sen}(30^{\\circ})}\\approx ${dt(tri.b)}$. El valor ${d((10 * s(30)) / s(45))} invierte las parejas.`),
    ],
  },

  // ---------------------------------------------------------------- 2
  {
    slug: "trigonometria-tecnica-area-con-seno",
    grupo: "leyes",
    orden: 2,
    requierePro: false,
    nombre: "Área = ½ · a · b · sen C",
    descripcion: "El área de un triángulo con dos lados y el ángulo entre ellos, también con ángulos obtusos.",
    conceptos: { introduce: ["area-seno"], usa: ["ley-seno", "razon-seno"] },
    pasos: [
      "Con dos lados y el ángulo que está ENTRE ellos: $\\text{Área}=\\frac{1}{2}\\,a\\,b\\operatorname{sen}(C)$.",
      "De dónde sale: con base $b$, la altura sobre ese lado mide $h=a\\operatorname{sen}(C)$, y el área es $\\frac{1}{2}\\cdot b\\cdot h$.",
      "Sirve también si $C$ es obtuso, porque $\\operatorname{sen}(180^{\\circ}-C)=\\operatorname{sen}(C)$: los ángulos suplementarios tienen el mismo seno.",
      `Ejemplo: lados 10 y 7 con un ángulo de $35^{\\circ}$: $\\frac{1}{2}\\cdot 10\\cdot 7\\cdot\\operatorname{sen}(35^{\\circ})\\approx ${dt(ar)}$.`,
    ],
    visuales: [{ tipo: "trigonometria.ley", despuesDePaso: 1, titulo: "La altura $h=a\\operatorname{sen}(C)$", ley: "area", datos: { a: 10, b: 7, C: 35 } }],
    quiz: [
      preg("¿Qué datos necesita la fórmula $\\frac{1}{2}ab\\operatorname{sen}(C)$?", "Dos lados y el ángulo que está entre ellos", ["Dos lados y un ángulo cualquiera", "Los tres ángulos", "Un lado y la altura"], "$C$ tiene que ser el ángulo comprendido entre los lados $a$ y $b$; con otro ángulo la fórmula no vale."),
      preg("Dos lados miden 10 y 7 y el ángulo entre ellos es $35^{\\circ}$. ¿Cuál es el área?", d(ar), [d(10 * 7 * s(35)), d(0.5 * 10 * 7 * Math.cos(aRad(35))), d(0.5 * 10 * 7)], `$\\frac{1}{2}\\cdot 10\\cdot 7\\cdot\\operatorname{sen}(35^{\\circ})\\approx ${dt(ar)}$. El valor ${d(10 * 7 * s(35))} olvida el $\\frac{1}{2}$.`),
      preg("¿Vale la fórmula si el ángulo entre los lados es de $130^{\\circ}$?", "Sí: $\\operatorname{sen}(130^{\\circ})=\\operatorname{sen}(50^{\\circ})$ es positivo", ["No: el seno de un ángulo obtuso es negativo", "No: solo vale para ángulos agudos", "Sí, pero hay que usar el coseno"], "Los ángulos suplementarios tienen el mismo seno: $\\operatorname{sen}(130^{\\circ})=\\operatorname{sen}(50^{\\circ})$, positivo."),
      preg("La altura de un triángulo sobre el lado $b$ es $h=a\\operatorname{sen}(C)$. ¿Cuál es el área?", "$\\dfrac{1}{2}\\,b\\,h$", ["$b\\,h$", "$\\dfrac{1}{2}\\,a\\,b$", "$a\\,h$"], "El área de un triángulo es la mitad de la base por la altura: $\\frac{1}{2}\\cdot b\\cdot h$, y reemplazando $h$ sale $\\frac{1}{2}ab\\operatorname{sen}(C)$."),
    ],
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "trigonometria-tecnica-caso-ambiguo",
    grupo: "leyes",
    orden: 3,
    requierePro: false,
    nombre: "SSA: compara a con la altura h = b·sen A",
    descripcion: "Cuántos triángulos (0, 1 o 2) salen de dos lados y un ángulo que no está entre ellos, sin resolver nada.",
    conceptos: { introduce: ["caso-ambiguo"], usa: ["ley-seno", "angulo-referencia"] },
    pasos: [
      "Con dos lados y un ángulo que NO está entre ellos (SSA) puede haber 0, 1 o 2 triángulos. Se calcula primero la altura $h=b\\operatorname{sen}(A)$.",
      "Con $A$ agudo, se compara $a$ con $h$ y con $b$: si $a<h$, ninguno; si $a=h$, uno (rectángulo); si $h<a<b$, dos; si $a\\geq b$, uno.",
      "Cuando hay dos, los ángulos $B$ y $180^{\\circ}-B$ tienen el mismo seno: el segundo vale solo si $A+(180^{\\circ}-B)<180^{\\circ}$.",
      `Ejemplo: $a=7$, $b=10$ y $A=30^{\\circ}$. $h=5<7<10$: dos triángulos, con $B\\approx ${d(amb[0].B, 1)}^{\\circ}$ y con $B\\approx ${d(amb[1].B, 1)}^{\\circ}$.`,
    ],
    visuales: [{ tipo: "trigonometria.ley", despuesDePaso: 3, titulo: "$a=7$, $b=10$ y $A=30^{\\circ}$: dos triángulos", ley: "ambiguo", datos: { a: 7, b: 10, A: 30 } }],
    quiz: [
      preg("Con $a=4$, $b=10$ y $A=30^{\\circ}$, ¿cuántos triángulos hay?", "Ninguno", ["Uno", "Dos", "Infinitos"], "$h=b\\operatorname{sen}(A)=5$ y $a=4<h$: el lado $a$ no llega hasta la base."),
      preg("Con $a=7$, $b=10$ y $A=30^{\\circ}$, ¿cuántos triángulos hay?", "Dos", ["Ninguno", "Uno", "Tres"], "$h=5<a=7<b=10$: el lado $a$ corta la base en dos puntos."),
      preg("Con $a=12$, $b=10$ y $A=40^{\\circ}$, ¿cuántos triángulos hay?", "Uno", ["Ninguno", "Dos", "Depende de la calculadora"], "Como $a\\geq b$, solo cabe el ángulo $B$ agudo (el suplementario haría pasar de $180^{\\circ}$ la suma de los ángulos)."),
      preg("Si $\\operatorname{sen}(B)=0{,}5$, ¿cuáles son los ángulos $B$ posibles entre $0^{\\circ}$ y $180^{\\circ}$?", "$30^{\\circ}$ y $150^{\\circ}$", ["$30^{\\circ}$ y $60^{\\circ}$", "$30^{\\circ}$ y $330^{\\circ}$", "Solo $30^{\\circ}$"], "Los ángulos con el mismo seno son $B$ y $180^{\\circ}-B$: $30^{\\circ}$ y $150^{\\circ}$. El $330^{\\circ}$ está fuera de $0^{\\circ}$ a $180^{\\circ}$."),
    ],
  },
];
