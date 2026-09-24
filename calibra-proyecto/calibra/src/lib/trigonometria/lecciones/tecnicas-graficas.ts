import { frac } from "@/lib/trigonometria/fracciones";
import { amplitud, ecuacionTex, fracTex, lineaMedia, maximo, minimo, multiploPiTex, onda, periodoPi, type Onda } from "@/lib/trigonometria/ondas";
import type { TecnicaTrigonometria } from "./tipos";
import { m, preg } from "./ayudas";

// Técnicas del bloque "graficas" (gratis): la onda (amplitud y periodo), el
// periodo 2π/b, desfase y desplazamiento vertical, y cómo leer la ecuación de
// una gráfica. Amplitudes, periodos, máximos y mínimos se calculan con ondas.ts.

const ec = (o: Onda): string => m(ecuacionTex(o));
const mnum = (f: ReturnType<typeof frac>): string => m(fracTex(f));
const mper = (o: Onda): string => m(multiploPiTex(periodoPi(o)));

const tresSeno = onda("sen", 3);
const seno4 = onda("sen", 1, 4);
const cosTercio = onda("cos", 1, frac(1, 3));
const tan2 = onda("tan", 1, 2);
const senDesfasado = onda("sen", 1, 2, frac(1, 2)); // sen(2x − π) = sen(2(x − π/2))
const ejVertical = onda("cos", 2, 1, 0, 1); // 2cos x + 1
const ejLectura = onda("cos", 2, 1, frac(1, 2), 1); // 2cos(x − π/2) + 1

export const TECNICAS_TRIGONOMETRIA_GRAFICAS: TecnicaTrigonometria[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "trigonometria-tecnica-la-onda",
    grupo: "graficas",
    orden: 1,
    requierePro: false,
    nombre: "La onda: amplitud es la altura, periodo es el largo de un ciclo",
    descripcion: "Las dos cantidades que definen una onda y cómo leerlas: cuánto sube (amplitud) y cuánto tarda en repetirse (periodo).",
    conceptos: { introduce: ["funcion-seno", "funcion-coseno", "funcion-periodica", "amplitud", "periodo"], usa: ["valores-exactos", "radian"] },
    pasos: [
      "Las gráficas de $y=a\\operatorname{sen}(x)$ y $y=a\\cos(x)$ son ondas que suben y bajan sin parar. La AMPLITUD es la altura: cuánto sube desde la línea media hasta el máximo, que vale $|a|$.",
      "El PERIODO es el largo de un ciclo completo, medido sobre el eje $x$. Para $\\operatorname{sen}(x)$ y $\\cos(x)$ es $2\\pi$: cada $2\\pi$ radianes la onda se repite.",
      "El seno arranca en 0 y sube; el coseno arranca en 1, su máximo. Es la misma onda con otro punto de partida: $\\cos(x)=\\operatorname{sen}\\left(x+\\frac{\\pi}{2}\\right)$.",
      "Los valores nunca salen de $[-|a|,\\ |a|]$. Si en la gráfica el máximo es 2 y el mínimo $-2$, la amplitud es 2 (no 4: 4 es la distancia de un extremo al otro).",
    ],
    visuales: [{ tipo: "trigonometria.onda", despuesDePaso: 1, titulo: "$y=2\\operatorname{sen}(x)$: amplitud 2 y periodo $2\\pi$", onda: { fn: "sen", a: 2 }, base: { fn: "sen" }, rango: [0, 2], pasos: ["curva", "amplitud", "periodo"] }],
    quiz: [
      preg(`¿Cuál es la amplitud de ${ec(tresSeno)}?`, mnum(amplitud(tresSeno)), [mnum(frac(6)), mnum(frac(1, 3)), m("2\\pi")], "La amplitud es el valor absoluto del número que multiplica: 3. El 6 es la distancia de un extremo al otro."),
      preg("¿Cuál es el periodo de $y=\\operatorname{sen}(x)$?", "$2\\pi$", ["$\\pi$", "$1$", "$\\dfrac{\\pi}{2}$"], "La onda del seno se repite cada vuelta completa del círculo, $2\\pi$ radianes."),
      preg("De las gráficas de seno y coseno, ¿cuál arranca en $y=1$ cuando $x=0$?", "El coseno", ["El seno", "Las dos", "Ninguna"], "$\\cos(0)=1$; en cambio $\\operatorname{sen}(0)=0$."),
      preg(`Una onda tiene máximo 5 y mínimo $-5$. ¿Cuál es su amplitud?`, "$5$", ["$10$", "$0$", "$2{,}5$"], "La amplitud es la altura desde la línea media (aquí $y=0$) hasta el máximo: 5. El 10 es la distancia entre extremos."),
    ],
  },

  // ---------------------------------------------------------------- 2
  {
    slug: "trigonometria-tecnica-periodo-2pi-sobre-b",
    grupo: "graficas",
    orden: 2,
    requierePro: false,
    nombre: "El periodo de y = a·sen(bx) es 2π/b",
    descripcion: "Cómo el número que multiplica a x acelera la onda y la fórmula que da el largo de un ciclo.",
    conceptos: { introduce: ["frecuencia"], usa: ["periodo", "funcion-periodica"] },
    pasos: [
      "El número $b$ que multiplica a $x$ acelera la onda: en $\\operatorname{sen}(3x)$ caben 3 ciclos en el mismo tramo donde $\\operatorname{sen}(x)$ tiene 1.",
      `La fórmula: $P=\\frac{2\\pi}{b}$. Ejemplos: ${ec(onda("sen", 1, 2))} tiene periodo ${mper(onda("sen", 1, 2))}; ${ec(onda("cos", 1, frac(1, 2)))} tiene periodo ${mper(onda("cos", 1, frac(1, 2)))}.`,
      "Piensa así: $b$ grande, ciclos angostos (periodo corto); $b$ chico, ciclos anchos (periodo largo). No lo dividas al revés: $\\frac{b}{2\\pi}$ es la frecuencia, cuántos ciclos caben en una unidad.",
      "Para la tangente, la onda se repite cada $\\pi$, así que el periodo de $\\tan(bx)$ es $\\frac{\\pi}{b}$.",
    ],
    visuales: [{ tipo: "trigonometria.onda", despuesDePaso: 1, titulo: "$y=\\operatorname{sen}(3x)$ contra $y=\\operatorname{sen}(x)$ (punteada)", onda: { fn: "sen", b: 3 }, base: { fn: "sen" }, rango: [0, 2], pasos: ["curva", "periodo"] }],
    quiz: [
      preg(`¿Cuál es el periodo de ${ec(seno4)}?`, mper(seno4), [m("2\\pi"), m("8\\pi"), m("4\\pi")], "$P=\\frac{2\\pi}{4}=\\frac{\\pi}{2}$: se divide, no se multiplica."),
      preg(`¿Cuál es el periodo de ${ec(cosTercio)}?`, mper(cosTercio), [m("\\dfrac{2\\pi}{3}"), m("3\\pi"), m("\\dfrac{\\pi}{3}")], "$P=\\frac{2\\pi}{1/3}=6\\pi$: con $b$ chico la onda se estira."),
      preg("Una onda $y=\\operatorname{sen}(bx)$ tiene periodo $\\dfrac{2\\pi}{5}$. ¿Cuánto vale $b$?", "$5$", ["$\\dfrac{1}{5}$", "$2\\pi$", "$10\\pi$"], "De $P=\\frac{2\\pi}{b}$ se despeja $b=\\frac{2\\pi}{P}=5$."),
      preg(`¿Cuál es el periodo de ${ec(tan2)}?`, mper(tan2), [m("\\pi"), m("2\\pi"), m("4\\pi")], "La tangente se repite cada $\\pi$: con $b=2$ el periodo es $\\frac{\\pi}{2}$."),
    ],
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "trigonometria-tecnica-desfase-y-desplazamiento",
    grupo: "graficas",
    orden: 3,
    requierePro: false,
    nombre: "c corre, d sube: y = a·sen(b(x − c)) + d",
    descripcion: "Qué hace cada letra de la ecuación general de una onda: el desfase la corre a los lados y el número final la sube o la baja.",
    conceptos: { introduce: ["desfase", "desplazamiento-vertical"], usa: ["amplitud", "periodo"] },
    pasos: [
      "En $y=a\\operatorname{sen}(b(x-c))+d$ cada letra hace un trabajo: $a$ da la altura, $b$ el ritmo, $c$ corre la onda a los lados y $d$ la sube o la baja.",
      "$x-c$ corre la gráfica $c$ hacia la derecha; $x+c$, hacia la izquierda. La línea media es $y=d$, el máximo es $d+|a|$ y el mínimo $d-|a|$.",
      `Factoriza $b$ antes de leer $c$: $\\operatorname{sen}(2x-\\pi)=\\operatorname{sen}\\left(2\\left(x-\\frac{\\pi}{2}\\right)\\right)$, así que el desfase es ${m(multiploPiTex(senDesfasado.cPi))}, no $\\pi$.`,
      `Mover la onda no la estira: en ${ec(ejVertical)} la amplitud sigue siendo ${mnum(amplitud(ejVertical))}, la línea media es ${m("y=" + fracTex(lineaMedia(ejVertical)))} y el máximo es ${mnum(maximo(ejVertical))}.`,
    ],
    visuales: [{ tipo: "trigonometria.onda", despuesDePaso: 2, titulo: "$y=\\operatorname{sen}(2x-\\pi)=\\operatorname{sen}\\left(2\\left(x-\\frac{\\pi}{2}\\right)\\right)$", onda: { fn: "sen", b: 2, c: [1, 2] }, base: { fn: "sen", b: 2 }, rango: [0, 2], pasos: ["curva", "desfase"] }],
    quiz: [
      preg("¿Hacia dónde se corre la gráfica de $y=\\operatorname{sen}\\left(x-\\dfrac{\\pi}{4}\\right)$ respecto de $y=\\operatorname{sen}(x)$?", "$\\dfrac{\\pi}{4}$ hacia la derecha", ["$\\dfrac{\\pi}{4}$ hacia la izquierda", "$\\dfrac{\\pi}{4}$ hacia arriba", "$\\dfrac{\\pi}{2}$ hacia la derecha"], "Con $x-c$ la onda se corre $c$ hacia la derecha; con $x+c$ se correría hacia la izquierda."),
      preg("¿Qué desfase tiene $y=\\operatorname{sen}(2x-\\pi)$?", `${m(multiploPiTex(senDesfasado.cPi))} hacia la derecha`, [`${m("\\pi")} hacia la derecha`, `${m("2\\pi")} hacia la derecha`, `${m(multiploPiTex(frac(1, 2)))} hacia la izquierda`], "Hay que factorizar: $2x-\\pi=2\\left(x-\\frac{\\pi}{2}\\right)$. El desfase es $\\frac{k}{b}=\\frac{\\pi}{2}$."),
      preg(`Para ${ec(ejVertical)}, ¿cuál es el máximo?`, mnum(maximo(ejVertical)), [mnum(frac(2)), mnum(frac(1)), mnum(minimo(ejVertical))], "Máximo $=d+|a|=1+2=3$. El 2 es la amplitud, el 1 la línea media y el $-1$ el mínimo."),
      preg("Si a $y=\\cos(x)$ se le suma 4, ¿cambia la amplitud?", "No: solo sube la onda 4 unidades", ["Sí: pasa a valer 5", "Sí: pasa a valer 4", "Sí: se duplica"], "El desplazamiento vertical mueve toda la gráfica; la distancia de la línea media al máximo sigue siendo 1."),
    ],
  },

  // ---------------------------------------------------------------- 4
  {
    slug: "trigonometria-tecnica-de-la-grafica-a-la-ecuacion",
    grupo: "graficas",
    orden: 4,
    requierePro: false,
    nombre: "De la gráfica a la ecuación en cuatro pasos",
    descripcion: "Un método fijo para leer d, a, b y c de una onda dibujada y comprobar la ecuación con un punto.",
    conceptos: { introduce: ["ecuacion-de-grafica"], usa: ["amplitud", "periodo", "desfase", "desplazamiento-vertical"] },
    pasos: [
      "Paso 1: con el máximo $M$ y el mínimo $m$ de la gráfica, la línea media es $d=\\frac{M+m}{2}$ y la amplitud $|a|=\\frac{M-m}{2}$.",
      "Paso 2: mide el periodo $P$ (la distancia entre dos máximos seguidos): $b=\\frac{2\\pi}{P}$.",
      "Paso 3: elige coseno (si conviene arrancar en un máximo) o seno (si arranca en la línea media) y busca el desfase $c$: para el coseno, es el $x$ de un máximo.",
      `Paso 4: comprueba con un punto. Por ejemplo, con $M=${fracTex(maximo(ejLectura))}$, $m=${fracTex(minimo(ejLectura))}$, periodo ${mper(ejLectura)} y el primer máximo en $x=\\frac{\\pi}{2}$ sale ${ec(ejLectura)}. Hay más de una ecuación correcta para la misma gráfica.`,
    ],
    visuales: [{ tipo: "trigonometria.onda", despuesDePaso: 3, titulo: "$y=2\\cos\\left(x-\\frac{\\pi}{2}\\right)+1$", onda: { fn: "cos", a: 2, c: [1, 2], d: 1 }, rango: [0, 2], pasos: ["curva", "vertical", "amplitud", "periodo", "desfase", "puntos"] }],
    quiz: [
      preg("Una onda tiene máximo 7 y mínimo 1. ¿Cuál es su línea media?", "$y=4$", ["$y=3$", "$y=6$", "$y=7$"], "$d=\\frac{M+m}{2}=\\frac{7+1}{2}=4$. La amplitud es $\\frac{M-m}{2}=3$."),
      preg("Una onda tiene periodo $\\pi$. ¿Cuánto vale $b$?", "$2$", ["$\\dfrac{1}{2}$", "$\\pi$", "$2\\pi$"], "$b=\\frac{2\\pi}{P}=\\frac{2\\pi}{\\pi}=2$."),
      preg("Una onda tipo coseno, de amplitud 1, periodo $2\\pi$ y sin desplazamiento vertical, tiene su primer máximo en $x=\\frac{\\pi}{3}$. ¿Cuál es su ecuación?", m("y=\\cos\\left(x-\\dfrac{\\pi}{3}\\right)"), [m("y=\\cos\\left(x+\\dfrac{\\pi}{3}\\right)"), m("y=\\cos(3x)"), m("y=\\operatorname{sen}\\left(x-\\dfrac{\\pi}{3}\\right)")], "El coseno tiene su máximo en $x=0$; para llevarlo a $\\frac{\\pi}{3}$ se corre a la derecha: $x-\\frac{\\pi}{3}$."),
      preg("Una gráfica tiene periodo $4\\pi$. ¿Cuánto vale $b$?", "$\\dfrac{1}{2}$", ["$2$", "$4\\pi$", "$\\dfrac{1}{4}$"], "$b=\\frac{2\\pi}{4\\pi}=\\frac{1}{2}$: un periodo largo significa un $b$ chico."),
    ],
  },

  // ---------------------------------------------------------------- 5
  {
    slug: "trigonometria-tecnica-tangente-y-asintotas",
    grupo: "graficas",
    orden: 5,
    requierePro: false,
    nombre: "La tangente no es una onda: asíntotas en π/2 + kπ",
    descripcion: "Por qué la tangente se dispara donde el coseno vale 0, cuál es su periodo y por qué no tiene amplitud.",
    conceptos: { introduce: ["funcion-tangente", "asintotas"], usa: ["periodo", "funcion-seno", "funcion-coseno"] },
    pasos: [
      "La tangente es $\\tan(x)=\\frac{\\operatorname{sen}(x)}{\\cos(x)}$: donde el coseno vale 0 no existe. Ahí la gráfica tiene asíntotas verticales, en $x=\\frac{\\pi}{2}+k\\pi$.",
      "Entre dos asíntotas sube de $-\\infty$ a $+\\infty$ pasando por 0. No tiene máximo, mínimo ni amplitud: su rango son todos los reales.",
      "Se repite cada $\\pi$ (no cada $2\\pi$): el periodo de $\\tan(bx)$ es $\\frac{\\pi}{b}$.",
    ],
    visuales: [{ tipo: "trigonometria.onda", despuesDePaso: 0, titulo: "$y=\\tan(x)$ y sus asíntotas", onda: { fn: "tan" }, rango: [-1, 1], pasos: ["curva", "asintotas"] }],
    quiz: [
      preg("¿En qué valores de $x$, entre $-\\pi$ y $\\pi$, tiene asíntotas $y=\\tan(x)$?", "$x=-\\dfrac{\\pi}{2}$ y $x=\\dfrac{\\pi}{2}$", ["$x=-\\pi$, $x=0$ y $x=\\pi$", "$x=0$ solamente", "$x=-\\dfrac{\\pi}{4}$ y $x=\\dfrac{\\pi}{4}$"], "Están donde $\\cos(x)=0$."),
      preg("¿Cuál es el periodo de $y=\\tan(x)$?", "$\\pi$", ["$2\\pi$", "$\\dfrac{\\pi}{2}$", "No tiene periodo"], "$\\tan(x+\\pi)=\\tan(x)$."),
      preg("¿Cuál es la amplitud de $y=\\tan(x)$?", "No tiene: no hay máximo ni mínimo", ["$1$", "$\\pi$", "$2$"], "La tangente se hace tan grande como se quiera cerca de una asíntota."),
      preg("¿Cuál es el periodo de $y=\\tan(3x)$?", "$\\dfrac{\\pi}{3}$", ["$\\dfrac{2\\pi}{3}$", "$3\\pi$", "$\\pi$"], "Para la tangente es $\\frac{\\pi}{b}$, no $\\frac{2\\pi}{b}$."),
    ],
  },
];
