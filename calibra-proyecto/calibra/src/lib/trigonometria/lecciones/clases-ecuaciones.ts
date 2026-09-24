import { ecuacion, solucionesConInversa, solucionesTex, type EcuacionTrig } from "@/lib/trigonometria/ecuaciones";
import type { ClaseTrigonometria } from "./tipos";
import { cuadros, dt, m, preg } from "./ayudas";

// Clases del bloque "ecuaciones" (Pro): ecuaciones trigonométricas básicas en
// [0, 2π) (con valores exactos y con la función inversa) y las que se resuelven
// con una identidad o factorizando. Todas las ecuaciones y sus soluciones salen
// del catálogo ecuaciones.ts, donde un test comprueba cada solución por
// sustitución y que no falte ninguna (barrido fino del intervalo).

const e = (id: string): EcuacionTrig => ecuacion(id);
const ec = (id: string): string => m(e(id).tex);
const sol = (id: string): string => m(solucionesTex(e(id)));

const inv03 = solucionesConInversa("sen", 0.3);
const inv04 = solucionesConInversa("cos", -0.4);
const inv2 = solucionesConInversa("tan", 2);

export const CLASES_TRIGONOMETRIA_ECUACIONES: ClaseTrigonometria[] = [
  // ---------------------------------------------------------------- 26
  {
    slug: "trigonometria-clase-26-ecuaciones-basicas",
    grupo: "ecuaciones",
    orden: 1,
    requierePro: true,
    nombre: "Ecuaciones trigonométricas básicas",
    descripcion: "Resolver sen x = k, cos x = k y tan x = k en [0, 2π): por qué una vuelta da dos soluciones y cómo hallarlas con valores exactos o con la función inversa.",
    conceptos: {
      introduce: ["ecuacion-trigonometrica", "soluciones-intervalo", "ecuacion-con-inversa"],
      usa: ["valores-exactos", "angulo-referencia", "signos-cuadrantes", "razones-inversas", "funcion-seno", "funcion-coseno", "funcion-tangente", "funcion-periodica", "circulo-unitario", "ecuacion-lineal"],
    },
    pasos: [
      "Objetivo: al terminar podrás resolver ecuaciones como $\\operatorname{sen}(x)=\\frac{1}{2}$ o $\\cos(x)=-0{,}4$ en el intervalo $[0,\\ 2\\pi)$, hallando todas las soluciones, con valores exactos o con la calculadora.",
      "Intuición. Una identidad se cumple para todo ángulo; una ecuación trigonométrica solo para algunos. Resolver $\\operatorname{sen}(x)=\\frac{1}{2}$ es preguntar: ¿en qué ángulos el punto del círculo unitario está a altura $\\frac{1}{2}$? Hay dos lugares en una vuelta: uno a cada lado del eje vertical. Por eso, en una vuelta, casi siempre hay DOS soluciones.",
      "Dos miradas. En la gráfica de $y=\\operatorname{sen}(x)$, se traza la recta horizontal $y=\\frac{1}{2}$ y se cuentan los cortes. En el círculo unitario, se ubican los puntos que tienen ese valor. Las dos miradas dan las mismas soluciones, como muestra el dibujo.",
      `El método con valores exactos, en tres pasos. 1) Aísla la razón: la ecuación queda $\\operatorname{sen}(x)=k$ (o cos, o tan). 2) Halla el ángulo de referencia: el ángulo agudo con el valor $|k|$ (de la tabla de valores exactos). 3) Ubica los cuadrantes por el signo de $k$ y arma las dos soluciones. Ejemplo: ${ec("sen-un-medio")}. La referencia es $\\frac{\\pi}{6}$; el seno es positivo en los cuadrantes I y II: $x=\\frac{\\pi}{6}$ y $x=\\pi-\\frac{\\pi}{6}=\\frac{5\\pi}{6}$.`,
      `Otro ejemplo con signo negativo: ${ec("cos-menos-raiz2-medio")}, es decir $\\cos(x)=-\\frac{\\sqrt{2}}{2}$. La referencia es $\\frac{\\pi}{4}$ y el coseno es negativo en los cuadrantes II y III: $x=\\pi-\\frac{\\pi}{4}=\\frac{3\\pi}{4}$ y $x=\\pi+\\frac{\\pi}{4}=\\frac{5\\pi}{4}$. Y con tangente: ${ec("tan-menos-uno")}, la tangente es negativa en los cuadrantes II y IV: ${sol("tan-menos-uno")}.`,
      `Casos especiales. ${ec("sen-uno")} tiene UNA solución, ${sol("sen-uno")} (la altura máxima se toca en un solo punto). ${ec("cos-cero")} tiene dos soluciones, ${sol("cos-cero")}. Y si $|k|>1$ en seno o coseno, no hay solución: la altura nunca llega a ese valor.`,
      `Con la calculadora (función inversa). Para $\\operatorname{sen}(x)=0{,}3$, la calculadora, en radianes, da solo UNA solución: $\\operatorname{sen}^{-1}(0{,}3)\\approx ${dt(inv03[0])}$. La otra es $\\pi-${dt(inv03[0])}\\approx ${dt(inv03[1])}$. Para $\\cos(x)=-0{,}4$: $\\cos^{-1}(-0{,}4)\\approx ${dt(inv04[0])}$ y la otra es $2\\pi-${dt(inv04[0])}\\approx ${dt(inv04[1])}$. Para $\\tan(x)=2$: $\\tan^{-1}(2)\\approx ${dt(inv2[0])}$ y la otra suma $\\pi$: $\\approx ${dt(inv2[1])}$. Regla: la calculadora da una; la otra la da la simetría del círculo.`,
      "Todas las soluciones. Si el enunciado no limita el intervalo, cada solución se repite cada vuelta: se añade $+2\\pi k$ (con $k$ entero) al seno y al coseno, y $+\\pi k$ a la tangente. Aquí se trabaja en $[0,\\ 2\\pi)$ para tener un número finito de respuestas. (Simplificación de nivel colegio.)",
      "Errores comunes. 1) Dar solo la solución de la calculadora y olvidar la otra. 2) Poner el signo equivocado al ubicar los cuadrantes. 3) Calculadora en grados cuando se piden radianes (o al revés). 4) Con la tangente, sumar $2\\pi$ en lugar de $\\pi$ para hallar la segunda. 5) Aceptar una «solución» con $|k|>1$ en seno o coseno.",
    ],
    visuales: [
      { tipo: "trigonometria.ecuacion", despuesDePaso: 2, titulo: "$\\operatorname{sen}(x)=\\frac{1}{2}$ en $[0,\\ 2\\pi)$", fn: "sen", gradosValor: 30 },
      { tipo: "trigonometria.ecuacion", despuesDePaso: 4, titulo: "$\\cos(x)=-\\frac{\\sqrt{2}}{2}$ en $[0,\\ 2\\pi)$", fn: "cos", gradosValor: 135 },
      { tipo: "trigonometria.ecuacion", despuesDePaso: 4, titulo: "$\\tan(x)=-1$ en $[0,\\ 2\\pi)$", fn: "tan", gradosValor: 135 },
      cuadros(6, "Con la calculadora: $\\operatorname{sen}(x)=0{,}3$", [
        { texto: "Función inversa en radianes: da UNA solución.", formula: `x_{1}=\\operatorname{sen}^{-1}(0{,}3)\\approx ${dt(inv03[0])}` },
        { texto: "La simetría del seno (cuadrantes I y II) da la otra: $\\pi-x_{1}$.", formula: `x_{2}=\\pi-${dt(inv03[0])}\\approx ${dt(inv03[1])}` },
        { texto: "Comprobación por sustitución con la calculadora:", formula: `\\operatorname{sen}(${dt(inv03[1])})\\approx 0{,}3` },
      ]),
    ],
    quiz: [
      preg(`¿Cuáles son las soluciones de ${ec("sen-un-medio")} en $[0,\\ 2\\pi)$?`, sol("sen-un-medio"), [m("\\dfrac{\\pi}{6},\\ \\dfrac{7\\pi}{6}"), m("\\dfrac{\\pi}{3},\\ \\dfrac{2\\pi}{3}"), m("\\dfrac{\\pi}{6}")], "La referencia es $\\frac{\\pi}{6}$ y el seno es positivo en los cuadrantes I y II: $\\frac{\\pi}{6}$ y $\\pi-\\frac{\\pi}{6}=\\frac{5\\pi}{6}$. $\\frac{7\\pi}{6}$ está en el cuadrante III (seno negativo) y $\\frac{\\pi}{3}$ tiene seno $\\frac{\\sqrt{3}}{2}$."),
      preg(`¿Cuáles son las soluciones de ${ec("cos-menos-raiz2-medio")} en $[0,\\ 2\\pi)$?`, sol("cos-menos-raiz2-medio"), [m("\\dfrac{\\pi}{4},\\ \\dfrac{7\\pi}{4}"), m("\\dfrac{\\pi}{4},\\ \\dfrac{3\\pi}{4}"), m("\\dfrac{3\\pi}{4}")], "Se aísla $\\cos(x)=-\\frac{\\sqrt{2}}{2}$. La referencia es $\\frac{\\pi}{4}$ y el coseno es negativo en los cuadrantes II y III: $\\frac{3\\pi}{4}$ y $\\frac{5\\pi}{4}$. Las otras opciones son ángulos con coseno positivo (cuadrantes I y IV) o solo una solución."),
      preg(`¿Cuáles son las soluciones de ${ec("tan-menos-uno")} en $[0,\\ 2\\pi)$?`, sol("tan-menos-uno"), [m("\\dfrac{\\pi}{4},\\ \\dfrac{5\\pi}{4}"), m("\\dfrac{3\\pi}{4},\\ \\dfrac{5\\pi}{4}"), m("\\dfrac{3\\pi}{4}")], "La tangente es negativa en los cuadrantes II y IV, con referencia $\\frac{\\pi}{4}$: $\\pi-\\frac{\\pi}{4}=\\frac{3\\pi}{4}$ y $2\\pi-\\frac{\\pi}{4}=\\frac{7\\pi}{4}$. La segunda solución de la tangente está $\\pi$ después de la primera."),
      preg(`¿Cuántas soluciones tiene ${ec("sen-uno")} en $[0,\\ 2\\pi)$?`, "Una: $\\dfrac{\\pi}{2}$", ["Dos: $\\dfrac{\\pi}{2}$ y $\\dfrac{3\\pi}{2}$", "Ninguna", "Infinitas"], "El seno solo vale 1 en el punto más alto del círculo, $\\frac{\\pi}{2}$. En $\\frac{3\\pi}{2}$ vale $-1$."),
      preg("¿Cuántas soluciones tiene $\\operatorname{sen}(x)=1{,}5$?", "Ninguna", ["Dos", "Una", "Depende del intervalo"], "El seno nunca supera 1. Un resultado de la calculadora como «error» al hacer $\\operatorname{sen}^{-1}(1{,}5)$ indica justamente que no hay solución real."),
      preg(`Con la calculadora en radianes, $\\operatorname{sen}^{-1}(0{,}3)\\approx ${dt(inv03[0])}$. ¿Cuál es la otra solución de $\\operatorname{sen}(x)=0{,}3$ en $[0,\\ 2\\pi)$?`, `$${dt(inv03[1])}$`, [`$${dt(Math.PI + inv03[0])}$`, `$${dt(2 * Math.PI - inv03[0])}$`, `$${dt(-inv03[0])}$`], `El seno es positivo en los cuadrantes I y II, y la simetría da $\\pi-x_{1}\\approx ${dt(inv03[1])}$. El valor ${dt(Math.PI + inv03[0])} tiene seno $-0{,}3$ y ${dt(2 * Math.PI - inv03[0])} también (cuadrante IV).`),
    ],
  },

  // ---------------------------------------------------------------- 27
  {
    slug: "trigonometria-clase-27-ecuaciones-con-identidades-y-factorizacion",
    grupo: "ecuaciones",
    orden: 2,
    requierePro: true,
    nombre: "Ecuaciones con identidades y con factorización",
    descripcion: "Cuando la ecuación mezcla funciones o tiene una potencia: cómo llegar a ecuaciones básicas usando identidades y factores, sin perder soluciones.",
    conceptos: {
      introduce: ["ecuacion-con-identidad", "ecuacion-factorizada"],
      usa: ["ecuacion-trigonometrica", "soluciones-intervalo", "identidad-pitagorica", "angulo-doble", "identidad-cociente", "factorizacion", "valores-exactos"],
    },
    pasos: [
      "Objetivo: al terminar podrás resolver ecuaciones trigonométricas que no son básicas: las que tienen dos funciones o el ángulo doble (con una identidad) y las que se factorizan, sin perder ninguna solución.",
      "Intuición. Una ecuación básica compara UNA razón con un número. Si aparecen dos razones distintas o una potencia, hay que reducirla hasta que quede una sola razón, o hasta que sea un producto igual a 0. Se usan dos herramientas: las identidades (para dejar una sola razón) y la factorización (para separar en ecuaciones básicas).",
      "Factorización. Un producto vale 0 solo si alguno de sus factores vale 0: si $A\\cdot B=0$, entonces $A=0$ o $B=0$. Se resuelve cada factor por separado y se juntan todas las soluciones.",
      `Ejemplo 1. ${ec("fact-sen-cos")}. O bien $\\operatorname{sen}(x)=0$ (en $0$ y $\\pi$), o bien $\\cos(x)=0$ (en $\\frac{\\pi}{2}$ y $\\frac{3\\pi}{2}$). Soluciones: ${sol("fact-sen-cos")}.`,
      `Ejemplo 2 (cuadrática). ${ec("fact-cuadratica-sen")}. Con $t=\\operatorname{sen}(x)$ es $2t^{2}+t-1=0$, que se factoriza $(2t-1)(t+1)=0$. Entonces $\\operatorname{sen}(x)=\\frac{1}{2}$ o $\\operatorname{sen}(x)=-1$. La primera da $\\frac{\\pi}{6}$ y $\\frac{5\\pi}{6}$; la segunda, $\\frac{3\\pi}{2}$. Soluciones: ${sol("fact-cuadratica-sen")}. Si en la cuadrática saliera un valor con $|t|>1$ en seno o coseno, se descarta.`,
      `Ejemplo 3 (con la identidad del ángulo doble). ${ec("id-doble-cos")}. Se reemplaza $\\cos(2x)=2\\cos^{2}(x)-1$: $2\\cos^{2}(x)-1=\\cos(x)$, es decir, ${ec("fact-cuadratica-cos")}, que factoriza como $(2\\cos(x)+1)(\\cos(x)-1)=0$. Entonces $\\cos(x)=-\\frac{1}{2}$ (en $\\frac{2\\pi}{3}$ y $\\frac{4\\pi}{3}$) o $\\cos(x)=1$ (en $0$). Soluciones: ${sol("id-doble-cos")}.`,
      `Ejemplo 4 (con la identidad pitagórica). ${ec("id-pitagorica")}. Se cambia $\\cos^{2}(x)=1-\\operatorname{sen}^{2}(x)$: $2-2\\operatorname{sen}^{2}(x)+3\\operatorname{sen}(x)=3$, o sea $2\\operatorname{sen}^{2}(x)-3\\operatorname{sen}(x)+1=0$, que factoriza como $(2\\operatorname{sen}(x)-1)(\\operatorname{sen}(x)-1)=0$. Da $\\operatorname{sen}(x)=\\frac{1}{2}$ o $\\operatorname{sen}(x)=1$: ${sol("id-pitagorica")}.`,
      `La trampa de dividir. En ${ec("id-doble-sen")}, con $\\operatorname{sen}(2x)=2\\operatorname{sen}(x)\\cos(x)$ queda $2\\operatorname{sen}(x)\\cos(x)-\\operatorname{sen}(x)=0$, es decir, $\\operatorname{sen}(x)\\,(2\\cos(x)-1)=0$. Si se dividiera entre $\\operatorname{sen}(x)$ se perderían las soluciones donde $\\operatorname{sen}(x)=0$ ($0$ y $\\pi$). Se factoriza en lugar de dividir: ${sol("id-doble-sen")}.`,
      "Comprueba siempre por sustitución (con al menos una solución) y revisa que estén todas dentro del intervalo pedido.",
      "Errores comunes. 1) Dividir entre una función que puede valer 0 (se pierden soluciones). 2) Resolver una ecuación con $\\operatorname{sen}^{2}(x)=k$ dando solo la raíz positiva: hay que considerar $\\pm\\sqrt{k}$ (por ejemplo, $\\operatorname{sen}^{2}(x)=\\frac{1}{4}$ tiene cuatro soluciones en $[0,\\ 2\\pi)$). 3) Mezclar en la misma ecuación $\\cos(2x)$ y $\\cos(x)$ sin usar una identidad. 4) Dejar soluciones con $|t|>1$.",
    ],
    visuales: [
      cuadros(3, "Ecuación con un producto igual a cero", [
        { texto: "Se parte de la ecuación.", formula: e("fact-sen-cos").tex },
        { texto: "Un producto es 0 cuando un factor es 0: dos ecuaciones básicas.", formula: "\\operatorname{sen}(x)=0\\quad\\text{o}\\quad\\cos(x)=0" },
        { texto: "Se juntan las soluciones en $[0,\\ 2\\pi)$.", formula: solucionesTex(e("fact-sen-cos")) },
      ]),
      cuadros(5, "Con la identidad del ángulo doble", [
        { texto: "Ecuación con $2x$ y con $x$.", formula: e("id-doble-cos").tex },
        { texto: "Se usa $\\cos(2x)=2\\cos^{2}(x)-1$ para dejar una sola razón.", formula: "2\\cos^{2}(x)-1=\\cos(x)\\ \\Rightarrow\\ 2\\cos^{2}(x)-\\cos(x)-1=0" },
        { texto: "Se factoriza.", formula: "(2\\cos(x)+1)(\\cos(x)-1)=0" },
        { texto: "Se resuelve cada factor.", formula: "\\cos(x)=-\\dfrac{1}{2}\\ \\text{o}\\ \\cos(x)=1" },
        { texto: "Soluciones:", resaltar: `x = ${solucionesTex(e("id-doble-cos"))}` },
      ], 3000),
      { tipo: "trigonometria.ecuacion", despuesDePaso: 6, titulo: "$\\operatorname{sen}(x)=\\frac{1}{2}$: el factor $2\\operatorname{sen}(x)-1=0$", fn: "sen", gradosValor: 30 },
    ],
    quiz: [
      preg(`¿Cuáles son las soluciones de ${ec("fact-sen-cos")} en $[0,\\ 2\\pi)$?`, sol("fact-sen-cos"), [m("0,\\ \\pi"), m("\\dfrac{\\pi}{2},\\ \\dfrac{3\\pi}{2}"), m("0,\\ \\dfrac{\\pi}{2}")], "Un producto es 0 si alguno de sus factores lo es: $\\operatorname{sen}(x)=0$ da $0$ y $\\pi$, y $\\cos(x)=0$ da $\\frac{\\pi}{2}$ y $\\frac{3\\pi}{2}$. Hay que juntar las cuatro."),
      preg(`¿Cuáles son las soluciones de ${ec("fact-cuadratica-sen")} en $[0,\\ 2\\pi)$?`, sol("fact-cuadratica-sen"), [m("\\dfrac{\\pi}{6},\\ \\dfrac{5\\pi}{6}"), m("\\dfrac{\\pi}{6},\\ \\dfrac{5\\pi}{6},\\ \\dfrac{\\pi}{2}"), m("\\dfrac{3\\pi}{2}")], "Se factoriza $(2\\operatorname{sen}(x)-1)(\\operatorname{sen}(x)+1)=0$: $\\operatorname{sen}(x)=\\frac{1}{2}$ (dos soluciones) o $\\operatorname{sen}(x)=-1$ (una: $\\frac{3\\pi}{2}$). La opción con $\\frac{\\pi}{2}$ confunde $-1$ con $1$."),
      preg(`¿Cuáles son las soluciones de ${ec("id-doble-cos")} en $[0,\\ 2\\pi)$?`, sol("id-doble-cos"), [m("\\dfrac{2\\pi}{3},\\ \\dfrac{4\\pi}{3}"), m("0,\\ \\dfrac{\\pi}{3},\\ \\dfrac{5\\pi}{3}"), m("0")], "Con $\\cos(2x)=2\\cos^{2}(x)-1$ queda $(2\\cos(x)+1)(\\cos(x)-1)=0$: $\\cos(x)=-\\frac{1}{2}$ da $\\frac{2\\pi}{3}$ y $\\frac{4\\pi}{3}$, y $\\cos(x)=1$ da $0$."),
      preg(`En ${ec("id-doble-sen")}, ¿por qué NO conviene dividir los dos miembros entre $\\operatorname{sen}(x)$?`, "Porque se pierden las soluciones donde $\\operatorname{sen}(x)=0$", ["Porque el seno no se puede dividir", "Porque cambia el signo de las soluciones", "Porque la ecuación deja de ser trigonométrica"], "Dividir entre algo que puede valer 0 elimina esas soluciones ($0$ y $\\pi$). Se pasa todo a un miembro y se factoriza: $\\operatorname{sen}(x)(2\\cos(x)-1)=0$."),
      preg(`¿Cuántas soluciones tiene ${ec("sen2-un-cuarto")} en $[0,\\ 2\\pi)$?`, "Cuatro: $\\operatorname{sen}(x)=\\pm\\dfrac{1}{2}$ da dos soluciones cada uno", ["Dos", "Una", "Ocho"], `Al sacar la raíz hay dos signos: $\\operatorname{sen}(x)=\\frac{1}{2}$ y $\\operatorname{sen}(x)=-\\frac{1}{2}$. Cada una tiene dos soluciones: ${sol("sen2-un-cuarto")}.`),
      preg("Al resolver una ecuación cuadrática en $\\cos(x)$ aparece $\\cos(x)=2$. ¿Qué se hace con ese valor?", "Se descarta: el coseno no puede valer 2", ["Se toma $x=\\cos^{-1}(2)$", "Se usa $x=2$ radianes", "Se resta $2\\pi$"], "El coseno siempre está entre $-1$ y $1$, así que $\\cos(x)=2$ no tiene solución. Solo aporta soluciones el otro factor."),
    ],
  },
];
