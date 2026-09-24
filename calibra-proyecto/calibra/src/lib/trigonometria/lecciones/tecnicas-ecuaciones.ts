import { ecuacion, solucionesConInversa, solucionesTex } from "@/lib/trigonometria/ecuaciones";
import type { TecnicaTrigonometria } from "./tipos";
import { dt, m, preg } from "./ayudas";

// Técnicas del bloque "ecuaciones" (gratis): una vuelta da dos soluciones, la
// calculadora da una y la otra sale por simetría, y no dividir entre sen x sino
// factorizar. Ecuaciones y soluciones salen del catálogo ecuaciones.ts (cada
// solución verificada por sustitución y sin soluciones faltantes).

const ec = (id: string): string => m(ecuacion(id).tex);
const sol = (id: string): string => m(solucionesTex(ecuacion(id)));
const inv = solucionesConInversa("cos", -0.4);

export const TECNICAS_TRIGONOMETRIA_ECUACIONES: TecnicaTrigonometria[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "trigonometria-tecnica-una-vuelta-dos-soluciones",
    grupo: "ecuaciones",
    orden: 1,
    requierePro: false,
    nombre: "En una vuelta, casi siempre dos soluciones",
    descripcion: "Cómo resolver sen x = k, cos x = k o tan x = k en [0, 2π) con la referencia y el signo de cada cuadrante.",
    conceptos: { introduce: ["ecuacion-trigonometrica", "soluciones-intervalo"], usa: ["valores-exactos", "angulo-referencia", "signos-cuadrantes"] },
    pasos: [
      "En el círculo unitario hay dos puntos con la misma altura (seno), con la misma posición horizontal (coseno) o con la misma tangente. Por eso una ecuación básica tiene, en una vuelta, dos soluciones (salvo cuando $\\operatorname{sen}(x)=\\pm 1$ o $\\cos(x)=\\pm 1$, que tienen una).",
      "Método: 1) aísla la razón; 2) halla el ángulo de referencia, el agudo con valor $|k|$; 3) ubica los cuadrantes por el signo de $k$ y arma las dos soluciones.",
      `Ejemplo: ${ec("sen-un-medio")}: referencia $\\frac{\\pi}{6}$, seno positivo en los cuadrantes I y II: ${sol("sen-un-medio")}.`,
      "Si $|k|>1$ en seno o coseno, no hay solución: el punto nunca llega a esa altura.",
    ],
    visuales: [{ tipo: "trigonometria.ecuacion", despuesDePaso: 2, titulo: "$\\operatorname{sen}(x)=\\frac{1}{2}$", fn: "sen", gradosValor: 30 }],
    quiz: [
      preg(`¿Cuáles son las soluciones de ${ec("sen-un-medio")} en $[0,\\ 2\\pi)$?`, sol("sen-un-medio"), [m("\\dfrac{\\pi}{6},\\ \\dfrac{7\\pi}{6}"), m("\\dfrac{\\pi}{3},\\ \\dfrac{2\\pi}{3}"), m("\\dfrac{\\pi}{6}")], "Referencia $\\frac{\\pi}{6}$, seno positivo en I y II: $\\frac{\\pi}{6}$ y $\\frac{5\\pi}{6}$."),
      preg(`¿Cuáles son las soluciones de ${ec("sen-menos-raiz3-medio")} en $[0,\\ 2\\pi)$?`, sol("sen-menos-raiz3-medio"), [m("\\dfrac{2\\pi}{3},\\ \\dfrac{\\pi}{3}"), m("\\dfrac{\\pi}{3},\\ \\dfrac{4\\pi}{3}"), m("\\dfrac{4\\pi}{3}")], "Referencia $\\frac{\\pi}{3}$; el seno es negativo en III y IV: $\\pi+\\frac{\\pi}{3}=\\frac{4\\pi}{3}$ y $2\\pi-\\frac{\\pi}{3}=\\frac{5\\pi}{3}$."),
      preg(`¿Cuáles son las soluciones de ${ec("cos-un-medio")} en $[0,\\ 2\\pi)$?`, sol("cos-un-medio"), [m("\\dfrac{\\pi}{3},\\ \\dfrac{2\\pi}{3}"), m("\\dfrac{\\pi}{6},\\ \\dfrac{11\\pi}{6}"), m("\\dfrac{\\pi}{3}")], "El coseno es positivo en I y IV, con referencia $\\frac{\\pi}{3}$: $\\frac{\\pi}{3}$ y $2\\pi-\\frac{\\pi}{3}=\\frac{5\\pi}{3}$."),
      preg("¿Cuántas soluciones tiene $\\cos(x)=-2$?", "Ninguna", ["Dos", "Una", "Infinitas"], "El coseno nunca baja de $-1$."),
    ],
  },

  // ---------------------------------------------------------------- 2
  {
    slug: "trigonometria-tecnica-la-calculadora-da-una",
    grupo: "ecuaciones",
    orden: 2,
    requierePro: false,
    nombre: "La calculadora te da una: la otra sale por simetría",
    descripcion: "Cómo completar la segunda solución cuando se resuelve con la función inversa (arcsen, arccos, arctan).",
    conceptos: { introduce: ["ecuacion-con-inversa"], usa: ["razones-inversas", "ecuacion-trigonometrica", "soluciones-intervalo"] },
    pasos: [
      "La función inversa de la calculadora (en radianes) devuelve UNA solución: $\\operatorname{sen}^{-1}$ da un ángulo entre $-\\frac{\\pi}{2}$ y $\\frac{\\pi}{2}$; $\\cos^{-1}$, entre $0$ y $\\pi$; $\\tan^{-1}$, entre $-\\frac{\\pi}{2}$ y $\\frac{\\pi}{2}$.",
      "La otra sale de la simetría del círculo: con seno, $\\pi-x_{1}$; con coseno, $2\\pi-x_{1}$; con tangente, $x_{1}+\\pi$. Si algún resultado es negativo, se le suma $2\\pi$ para llevarlo a $[0,\\ 2\\pi)$.",
      `Ejemplo: $\\cos(x)=-0{,}4$. La calculadora da $x_{1}\\approx ${dt(inv[0])}$ y la otra es $2\\pi-x_{1}\\approx ${dt(inv[1])}$.`,
      "Comprueba sustituyendo. Antes de empezar, pon la calculadora en radianes si las soluciones se piden en radianes.",
    ],
    visuales: [{ tipo: "trigonometria.ecuacion", despuesDePaso: 1, titulo: "Dos soluciones de $\\cos(x)=-\\frac{\\sqrt{2}}{2}$", fn: "cos", gradosValor: 135 }],
    quiz: [
      preg(`Con la calculadora en radianes, $\\cos^{-1}(-0{,}4)\\approx ${dt(inv[0])}$. ¿Cuál es la otra solución de $\\cos(x)=-0{,}4$ en $[0,\\ 2\\pi)$?`, `$${dt(inv[1])}$`, [`$${dt(Math.PI - inv[0])}$`, `$${dt(Math.PI + inv[0])}$`, `$${dt(-inv[0])}$`], `Con el coseno la otra solución es $2\\pi-x_{1}\\approx ${dt(inv[1])}$ (simetría respecto del eje horizontal).`),
      preg("La calculadora da $\\tan^{-1}(2)\\approx 1{,}107$. ¿Cuál es la otra solución de $\\tan(x)=2$ en $[0,\\ 2\\pi)$?", "$1{,}107+\\pi\\approx 4{,}249$", ["$\\pi-1{,}107\\approx 2{,}034$", "$2\\pi-1{,}107\\approx 5{,}176$", "$1{,}107+2\\pi$"], "La tangente se repite cada $\\pi$: la segunda solución está $\\pi$ después de la primera."),
      preg("En $\\operatorname{sen}(x)=0{,}3$, si $x_{1}$ es la solución de la calculadora, ¿cuál es la otra?", "$\\pi-x_{1}$", ["$2\\pi-x_{1}$", "$\\pi+x_{1}$", "$-x_{1}$"], "El seno es positivo en I y II; el punto simétrico respecto del eje vertical está en $\\pi-x_{1}$."),
      preg(`Si $\\operatorname{sen}(x)=-\\dfrac{1}{2}$, ¿cuáles son las soluciones en $[0,\\ 2\\pi)$?`, m("\\dfrac{7\\pi}{6},\\ \\dfrac{11\\pi}{6}"), [m("-\\dfrac{\\pi}{6},\\ \\dfrac{5\\pi}{6}"), m("\\dfrac{5\\pi}{6},\\ \\dfrac{7\\pi}{6}"), m("\\dfrac{\\pi}{6},\\ \\dfrac{11\\pi}{6}")], "La calculadora da $-\\frac{\\pi}{6}$, que se lleva a $[0,2\\pi)$ sumando $2\\pi$: $\\frac{11\\pi}{6}$. La otra es $\\pi-\\left(-\\frac{\\pi}{6}\\right)=\\frac{7\\pi}{6}$."),
    ],
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "trigonometria-tecnica-no-dividas-factoriza",
    grupo: "ecuaciones",
    orden: 3,
    requierePro: false,
    nombre: "No dividas entre sen x: factoriza",
    descripcion: "Cómo resolver ecuaciones con potencias o con el ángulo doble sin perder soluciones.",
    conceptos: { introduce: ["ecuacion-con-identidad", "ecuacion-factorizada"], usa: ["ecuacion-trigonometrica", "angulo-doble", "identidad-pitagorica", "factorizacion"] },
    pasos: [
      "Un producto vale 0 solo si un factor vale 0. Pasa todo a un lado, factoriza y resuelve cada factor.",
      `Si dividieras entre una función que puede valer 0, perderías soluciones. En ${ec("id-doble-sen")}, con $\\operatorname{sen}(2x)=2\\operatorname{sen}(x)\\cos(x)$ queda $\\operatorname{sen}(x)(2\\cos(x)-1)=0$: ${sol("id-doble-sen")}.`,
      "Si hay $\\operatorname{sen}^{2}$ y $\\cos^{2}$ juntos, cambia uno con $\\cos^{2}=1-\\operatorname{sen}^{2}$ para tener una sola razón. Si sale una cuadrática, trátala como $2t^{2}+t-1=0$ con $t=\\operatorname{sen}(x)$.",
      "Descarta los valores con $|t|>1$ en seno o coseno y comprueba las soluciones por sustitución.",
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        titulo: "Factorizar en lugar de dividir",
        cuadros: [
          { texto: "Ecuación.", formula: ecuacion("id-doble-sen").tex },
          { texto: "Se usa el ángulo doble y se pasa todo a un lado.", formula: "2\\operatorname{sen}(x)\\cos(x)-\\operatorname{sen}(x)=0" },
          { texto: "Se factoriza $\\operatorname{sen}(x)$.", formula: "\\operatorname{sen}(x)\\,(2\\cos(x)-1)=0" },
          { texto: "Soluciones en $[0,\\ 2\\pi)$:", formula: solucionesTex(ecuacion("id-doble-sen")) },
        ],
        msPorCuadro: 2800,
      },
    ],
    quiz: [
      preg(`¿Cuáles son las soluciones de ${ec("fact-sen-cos")} en $[0,\\ 2\\pi)$?`, sol("fact-sen-cos"), [m("0,\\ \\pi"), m("\\dfrac{\\pi}{2},\\ \\dfrac{3\\pi}{2}"), m("0,\\ \\dfrac{\\pi}{2}")], "Cada factor da sus soluciones: $\\operatorname{sen}=0$ en $0$ y $\\pi$; $\\cos=0$ en $\\frac{\\pi}{2}$ y $\\frac{3\\pi}{2}$."),
      preg(`¿Cuáles son las soluciones de ${ec("fact-cuadratica-sen")} en $[0,\\ 2\\pi)$?`, sol("fact-cuadratica-sen"), [m("\\dfrac{\\pi}{6},\\ \\dfrac{5\\pi}{6}"), m("\\dfrac{\\pi}{6},\\ \\dfrac{5\\pi}{6},\\ \\dfrac{\\pi}{2}"), m("\\dfrac{3\\pi}{2}")], "$(2\\operatorname{sen}(x)-1)(\\operatorname{sen}(x)+1)=0$: $\\operatorname{sen}=\\frac{1}{2}$ (dos) o $\\operatorname{sen}=-1$ (una)."),
      preg("¿Por qué no conviene dividir los dos miembros entre $\\operatorname{sen}(x)$?", "Porque se pierden las soluciones donde $\\operatorname{sen}(x)=0$", ["Porque el seno no se puede dividir", "Porque cambia el signo de las soluciones", "Porque la ecuación deja de ser trigonométrica"], "Dividir entre algo que puede valer 0 elimina esas soluciones."),
      preg(`¿Cuántas soluciones tiene ${ec("sen2-un-cuarto")} en $[0,\\ 2\\pi)$?`, "Cuatro", ["Dos", "Una", "Ocho"], "$\\operatorname{sen}(x)=\\pm\\frac{1}{2}$: cada signo da dos soluciones."),
    ],
  },
];
