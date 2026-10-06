import type { LeccionCalculia, PreguntaLeccionCalculia, VisualLeccionCalculia } from "./tipos";

// Curso de Calculia mejor dividido (pedido del usuario, 2026-10-06: «le falta a
// Calculia mejor división para clases y técnicas»). Antes cada tema tenía 1 o 2
// lecciones que mezclaban varias reglas; ahora cada regla tiene su Técnica
// (gratis, el atajo) y su Clase (Pro, desarrollada), en orden de dependencia:
//   - Derivadas: potencia, producto, cociente y cadena por separado; la Clase
//     vieja que juntaba las tres queda al final como repaso.
//   - Integrales: potencia, 1/x, exponencial, seno y coseno, sustitución y la
//     integral definida; la Clase vieja «avanzadas» queda como repaso.
//   - Series: sumas parciales, geométrica, serie p y criterio de la razón.
//   - Multivariable y EDOs: parciales de polinomios, qué es una EDO y el
//     crecimiento exponencial.
// Las 12 lecciones sembradas (tecnicas.ts / clases.ts) no cambian de contenido:
// solo se reubican con ORDEN_CURSO_CALCULIA. Todo se verifica en curso.test.ts
// (KaTeX, igualdades evaluadas numéricamente, respuestas recalculadas).
// Migración generada: 0254 (NO toca 0216).

// Pregunta con la respuesta en una posición que depende del texto (determinista,
// para que la migración generada no cambie entre corridas).
function p(pregunta: string, respuesta: string, otras: string[], explicacion: string): PreguntaLeccionCalculia {
  const opciones = [...otras];
  let h = 0;
  for (const c of pregunta) h = (h * 31 + c.charCodeAt(0)) % 9973;
  opciones.splice(h % (otras.length + 1), 0, respuesta);
  return { pregunta, opciones, respuesta, explicacion };
}

const cuadros = (despuesDePaso: number, titulo: string, lista: { texto?: string; formula?: string; resaltar?: string }[]): VisualLeccionCalculia => ({
  tipo: "cuadros",
  despuesDePaso,
  titulo,
  cuadros: lista,
});

// Orden nuevo de las 12 lecciones sembradas (Técnicas 1-20, Clases 21-40, con
// las nuevas intercaladas en orden de dependencia dentro de cada tema).
export const ORDEN_CURSO_CALCULIA: Record<string, number> = {
  "calculia-reconocer-regla-derivacion": 1,
  "calculia-tabla-integrales-comunes": 6,
  "calculia-identificar-tipo-serie": 12,
  "calculia-derivar-parciales": 17,
  "calculia-separar-variables-edo": 19,
  "calculia-pro-derivadas-fundamentos": 21,
  "calculia-pro-derivadas-producto-cociente-cadena": 25,
  "calculia-pro-integrales-fundamentos": 26,
  "calculia-pro-integrales-avanzadas": 31,
  "calculia-pro-series-geometricas": 33,
  "calculia-pro-multivariable-parciales": 36,
  "calculia-pro-edos-separables": 39,
};

export const TECNICAS_CURSO_CALCULIA: LeccionCalculia[] = [
  // ---------------- Derivadas ----------------
  {
    slug: "calculia-tec-potencia-baja-exponente",
    grupo: "derivadas",
    orden: 2,
    requierePro: false,
    nombre: "Regla de la potencia: baja el exponente y réstale uno",
    descripcion: "Para derivar $c\\cdot x^{n}$ multiplica el coeficiente por el exponente y baja el exponente en uno. Las constantes sueltas desaparecen y una suma se deriva término a término.",
    pasos: [
      "Mira cada término como $c\\cdot x^{n}$: un número (el coeficiente $c$) por x elevada a un exponente $n$. Su derivada es $c\\cdot n\\cdot x^{n-1}$.",
      "Dos movimientos, siempre en este orden: el exponente baja y multiplica al coeficiente, y al exponente le restas 1. Ejemplo: $(4x^{3})' = 12x^{2}$.",
      "Una suma se deriva término a término, y un número suelto (una constante) se va porque su derivada es 0: $(2x^{5} + 3x - 7)' = 10x^{4} + 3$.",
      "Control rápido: el exponente del resultado es uno menos que el original. Si x aparece sola (exponente 1), su derivada es el coeficiente: $(3x)' = 3$.",
    ],
    visuales: [
      cuadros(1, "Dos movimientos con $4x^3$", [
        { texto: "El exponente baja y multiplica", formula: "4\\cdot 3 = 12" },
        { texto: "Al exponente le restas 1", formula: "(4x^3)' = 12x^2" },
      ]),
      { tipo: "calculia.tangente", despuesDePaso: 3, titulo: "$f(x)=x^3$: en $x=1$ la pendiente es $3\\cdot 1^2 = 3$", funcion: [{ tipo: "potencia", c: 1, n: 3 }], x0: 1, rango: [-0.5, 1.6] },
    ],
    quiz: [
      p("Deriva $f(x) = 7x^{4}$.", "$28x^{3}$", ["$7x^{3}$", "$28x^{4}$", "$11x^{3}$"], "$7\\cdot 4 = 28$ y el exponente baja de 4 a 3: $28x^{3}$."),
      p("Deriva $f(x) = x^{6} - 5x + 2$.", "$6x^{5} - 5$", ["$6x^{5} - 5x$", "$x^{5} - 5$", "$6x^{5} - 3$"], "Término a término: $6x^{5}$, después $-5$, y la constante 2 desaparece."),
      p("¿Cuál es la derivada de $f(x) = 8x$?", "$8$", ["$8x$", "$0$", "$x$"], "x tiene exponente 1: $8\\cdot 1\\cdot x^{0} = 8$."),
    ],
  },
  {
    slug: "calculia-tec-producto-mnemotecnia",
    grupo: "derivadas",
    orden: 3,
    requierePro: false,
    nombre: "Regla del producto: «deriva una, deja la otra» dos veces",
    descripcion: "Para derivar $u\\cdot v$: derivas la primera y dejas la segunda, después dejas la primera y derivas la segunda, y sumas: $u'v + uv'$.",
    pasos: [
      "Cuando la función es un producto de dos factores, $u\\cdot v$, no alcanza con derivar cada uno y multiplicar: $(u\\cdot v)' \\neq u'\\cdot v'$.",
      "La regla: $(u\\cdot v)' = u'\\cdot v + u\\cdot v'$. Para recordarla: «deriva una, deja la otra; deja una, deriva la otra; suma».",
      "Ejemplo: $f(x) = x^{2}(x^{3}+1)$, con $u = x^{2}$ y $v = x^{3}+1$. Entonces $f'(x) = 2x(x^{3}+1) + x^{2}\\cdot 3x^{2} = 5x^{4} + 2x$.",
      "Comprobación: aquí podías multiplicar primero ($x^{5} + x^{2}$) y derivar: $(x^{5} + x^{2})' = 5x^{4} + 2x$. Da lo mismo; la regla sirve cuando multiplicar primero es largo o imposible.",
    ],
    visuales: [
      cuadros(2, "Regla del producto con $x^2(x^3+1)$", [
        { texto: "Deriva la primera, deja la segunda", formula: "(x^2)'\\cdot(x^3+1) = 2x(x^3+1)" },
        { texto: "Deja la primera, deriva la segunda", formula: "x^2\\cdot(x^3+1)' = 3x^4" },
        { texto: "Suma", formula: "(x^2(x^3+1))' = 5x^4 + 2x" },
      ]),
    ],
    quiz: [
      p("Con la regla del producto, deriva $f(x) = x^{3}(x^{2}+4)$.", "$5x^{4} + 12x^{2}$", ["$6x^{3}$", "$3x^{2}(x^{2}+4)$", "$5x^{4} + 4$"], "$3x^{2}(x^{2}+4) + x^{3}\\cdot 2x = 5x^{4} + 12x^{2}$."),
      p("¿Cuál es la regla del producto?", "$(uv)' = u'v + uv'$", ["$(uv)' = u'v'$", "$(uv)' = u'v - uv'$", "$(uv)' = \\dfrac{u'v - uv'}{v^{2}}$"], "Cada término deriva un factor y deja el otro; los dos términos se suman."),
      p("Al derivar $(2x)(x^{4})$, ¿cuál es el término «deja la primera, deriva la segunda»?", "$2x\\cdot 4x^{3}$", ["$2\\cdot x^{4}$", "$2\\cdot 4x^{3}$", "$2x\\cdot x^{4}$"], "La primera ($2x$) se deja igual y la segunda ($x^{4}$) se deriva: $4x^{3}$."),
    ],
  },
  {
    slug: "calculia-tec-cociente-mnemotecnia",
    grupo: "derivadas",
    orden: 4,
    requierePro: false,
    nombre: "Regla del cociente: «abajo por la derivada de arriba, menos arriba por la derivada de abajo»",
    descripcion: "Para derivar $\\dfrac{u}{v}$: $\\dfrac{u'v - uv'}{v^{2}}$. Empieza siempre por el de abajo sin derivar y no olvides el cuadrado del denominador.",
    pasos: [
      "La regla: $\\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'\\cdot v - u\\cdot v'}{v^{2}}$. El orden importa: en el numerador hay una resta, así que cambiarlo cambia el signo.",
      "Frase para recordarla: «abajo por la derivada de arriba, menos arriba por la derivada de abajo, todo sobre abajo al cuadrado». Arriba es $u$ (numerador) y abajo es $v$ (denominador).",
      "Ejemplo: $f(x) = \\dfrac{x^{2}}{x+1}$, con $u = x^{2}$ y $v = x+1$. Queda $f'(x) = \\dfrac{2x(x+1) - x^{2}\\cdot 1}{(x+1)^{2}} = \\dfrac{x^{2}+2x}{(x+1)^{2}}$.",
      "Atajo: si el denominador es solo un número, no hace falta la regla: $\\left(\\dfrac{x^{3}}{4}\\right)' = \\dfrac{3x^{2}}{4}$.",
    ],
    visuales: [
      cuadros(2, "Regla del cociente con $\\dfrac{x^2}{x+1}$", [
        { texto: "Abajo por la derivada de arriba", formula: "(x+1)\\cdot(x^2)' = 2x(x+1)" },
        { texto: "Menos arriba por la derivada de abajo", formula: "x^2\\cdot(x+1)' = x^2" },
        { texto: "Todo sobre abajo al cuadrado", formula: "\\left(\\dfrac{x^2}{x+1}\\right)' = \\dfrac{x^2+2x}{(x+1)^2}" },
      ]),
    ],
    quiz: [
      p("Deriva $f(x) = \\dfrac{2x}{x+3}$ con la regla del cociente.", "$\\dfrac{6}{(x+3)^{2}}$", ["$\\dfrac{4x+6}{(x+3)^{2}}$", "$2$", "$\\dfrac{-6}{(x+3)^{2}}$"], "$\\dfrac{2(x+3) - 2x\\cdot 1}{(x+3)^{2}} = \\dfrac{6}{(x+3)^{2}}$."),
      p("En la regla del cociente, ¿qué va en el denominador del resultado?", "El denominador original al cuadrado", ["La derivada del denominador", "El numerador al cuadrado", "El denominador sin cambios"], "El resultado siempre se divide entre $v^{2}$."),
      p("¿Qué pasa si cambias el orden de la resta del numerador?", "El resultado cambia de signo", ["No cambia nada", "Se duplica", "Se anula"], "$u'v - uv'$ y $uv' - u'v$ son opuestos."),
    ],
  },
  {
    slug: "calculia-tec-cadena-afuera-adentro",
    grupo: "derivadas",
    orden: 5,
    requierePro: false,
    nombre: "Regla de la cadena: de afuera hacia adentro",
    descripcion: "Para derivar una función dentro de otra, deriva la de afuera dejando intacta la de adentro y multiplica por la derivada de la de adentro.",
    pasos: [
      "Reconócela: hay una expresión entera metida dentro de una potencia, como $(3x+2)^{4}$. La de afuera es «algo a la 4» y la de adentro es $3x+2$.",
      "Paso 1, afuera: deriva como si lo de adentro fuera una sola letra, sin tocarlo: $4(3x+2)^{3}$. Paso 2, adentro: multiplica por la derivada de lo de adentro, que es 3.",
      "Resultado: $((3x+2)^{4})' = 4(3x+2)^{3}\\cdot 3 = 12(3x+2)^{3}$.",
      "El error típico es olvidar el paso 2. $4(3x+2)^{3}$ solo sería correcto si lo de adentro tuviera derivada 1, como en $(x+5)^{4}$.",
    ],
    visuales: [
      cuadros(1, "Cadena con $(3x+2)^4$", [
        { texto: "Afuera: baja el 4 sin tocar lo de adentro", formula: "4(3x+2)^3" },
        { texto: "Adentro: la derivada de $3x+2$", formula: "(3x+2)' = 3" },
        { texto: "Multiplica", formula: "((3x+2)^4)' = 12(3x+2)^3" },
      ]),
      { tipo: "calculia.tangente", despuesDePaso: 2, titulo: "$f(x)=(2x-1)^3$ y su pendiente en $x=1$", funcion: [{ tipo: "factorLineal", c: 1, a: 2, b: -1, n: 3 }], x0: 1, rango: [0, 1.5] },
    ],
    quiz: [
      p("Deriva $f(x) = (5x-1)^{3}$.", "$15(5x-1)^{2}$", ["$3(5x-1)^{2}$", "$15(5x-1)^{3}$", "$5(5x-1)^{2}$"], "Afuera: $3(5x-1)^{2}$; adentro: 5. Multiplicado: $15(5x-1)^{2}$."),
      p("Deriva $f(x) = (x^{2}+1)^{5}$.", "$10x(x^{2}+1)^{4}$", ["$5(x^{2}+1)^{4}$", "$10x(x^{2}+1)^{5}$", "$5x(x^{2}+1)^{4}$"], "Afuera: $5(x^{2}+1)^{4}$; adentro: $2x$. Multiplicado: $10x(x^{2}+1)^{4}$."),
      p("En $(7x+4)^{6}$, ¿cuál es «la de adentro»?", "$7x+4$", ["$u^{6}$", "$7$", "$6$"], "La de adentro es la expresión que está dentro del paréntesis."),
    ],
  },

  // ---------------- Integrales ----------------
  {
    slug: "calculia-tec-integral-potencia",
    grupo: "integrales",
    orden: 7,
    requierePro: false,
    nombre: "Integral de una potencia: súmale uno al exponente y divide",
    descripcion: "Es la regla de la potencia al revés: $\\int x^{n}\\,dx = \\dfrac{x^{n+1}}{n+1} + C$ (para $n \\neq -1$). Y no olvides la constante $C$.",
    pasos: [
      "Integrar es deshacer una derivada: buscas una función cuya derivada sea la que te dan. Para una potencia se hacen los dos movimientos de derivar al revés y en orden inverso.",
      "Primero súmale 1 al exponente y después divide entre el exponente nuevo: $\\int x^{n}\\,dx = \\dfrac{x^{n+1}}{n+1} + C$.",
      "Con coeficiente, el número se queda adelante y se simplifica al final: $6\\cdot\\dfrac{x^{3}}{3} = 2x^{3}$, así que $\\int 6x^{2}\\,dx = 2x^{3} + C$.",
      "Comprueba siempre derivando: $(2x^{3})' = 6x^{2}$, que es lo que había dentro de la integral. La $+ C$ va porque cualquier constante tiene derivada 0.",
    ],
    visuales: [
      cuadros(1, "Integra $3x^2$", [
        { texto: "Súmale 1 al exponente: de 2 a 3" },
        { texto: "Divide entre el exponente nuevo", formula: "\\int 3x^2\\,dx = x^3 + C" },
        { texto: "Comprueba derivando", formula: "(x^3)' = 3x^2" },
      ]),
      { tipo: "calculia.area", despuesDePaso: 3, titulo: "Área bajo $3x^2$ entre 0 y 2: $2^3 - 0^3 = 8$", funcion: [{ tipo: "potencia", c: 3, n: 2 }], desde: 0, hasta: 2 },
    ],
    quiz: [
      p("Calcula $\\int 8x^{3}\\,dx$.", "$2x^{4} + C$", ["$8x^{4} + C$", "$24x^{2} + C$", "$2x^{3} + C$"], "Exponente nuevo 4 y se divide entre 4: $\\dfrac{8}{4}x^{4} = 2x^{4}$."),
      p("Calcula $\\int 5\\,dx$.", "$5x + C$", ["$5 + C$", "$\\dfrac{5x^{2}}{2} + C$", "$\\dfrac{5}{x} + C$"], "$5 = 5x^{0}$: exponente nuevo 1, así que da $5x$."),
      p("¿Por qué se suma $C$ al integrar?", "Porque la derivada de cualquier constante es 0", ["Porque es la constante de la función original", "Para que el resultado sea positivo", "Porque así se escribe el área"], "Hay infinitas antiderivadas que solo difieren en una constante."),
    ],
  },
  {
    slug: "calculia-tec-integral-uno-sobre-x",
    grupo: "integrales",
    orden: 8,
    requierePro: false,
    nombre: "La excepción de la potencia: k sobre x da un logaritmo",
    descripcion: "Con exponente $-1$ la regla de la potencia dividiría entre 0. Por eso $\\int \\dfrac{k}{x}\\,dx = k\\ln|x| + C$: el coeficiente queda adelante y aparece el logaritmo natural.",
    pasos: [
      "$\\dfrac{1}{x}$ es $x^{-1}$. Si aplicas la regla de la potencia, el exponente nuevo sería 0 y tendrías que dividir entre 0: no funciona.",
      "La función cuya derivada es $\\dfrac{1}{x}$ es el logaritmo natural: $(\\ln|x|)' = \\dfrac{1}{x}$. Por eso $\\int \\dfrac{1}{x}\\,dx = \\ln|x| + C$.",
      "Con un número arriba, ese número sale adelante: $\\int \\dfrac{6}{x}\\,dx = 6\\ln|x| + C$.",
      "Las barras de valor absoluto están porque el logaritmo solo existe para números positivos; así la fórmula vale también para x negativa.",
    ],
    visuales: [
      cuadros(1, "Por qué aparece el logaritmo", [
        { texto: "Escribe la fracción como potencia", formula: "\\dfrac{1}{x} = x^{-1}" },
        { texto: "La regla de la potencia pediría dividir entre 0; el logaritmo resuelve el caso", formula: "(\\ln|x|)' = \\dfrac{1}{x}" },
        { texto: "Con coeficiente", formula: "\\int \\dfrac{3}{x}\\,dx = 3\\ln|x| + C" },
      ]),
    ],
    quiz: [
      p("Calcula $\\int \\dfrac{5}{x}\\,dx$.", "$5\\ln|x| + C$", ["$\\dfrac{5}{x^{2}} + C$", "$5x + C$", "$\\ln|5x| + C$"], "El 5 sale adelante y $\\int \\dfrac{1}{x}\\,dx = \\ln|x|$."),
      p("¿Por qué no sirve la regla de la potencia para $\\dfrac{1}{x}$?", "Porque habría que dividir entre 0", ["Porque x no tiene exponente", "Porque la integral no existe", "Porque da un número negativo"], "Con $n = -1$ el exponente nuevo es 0 y la fórmula divide entre $n+1 = 0$."),
      p("¿Cuál es la derivada de $\\ln|x|$?", "$\\dfrac{1}{x}$", ["$\\ln|x|$", "$x$", "$e^{x}$"], "$(\\ln|x|)' = \\dfrac{1}{x}$: por eso la integral de $\\dfrac{1}{x}$ es el logaritmo."),
    ],
  },
  {
    slug: "calculia-tec-integral-exponencial",
    grupo: "integrales",
    orden: 9,
    requierePro: false,
    nombre: "Exponencial: e a la ax se integra dividiendo entre a",
    descripcion: "$e^{x}$ es su propia derivada y su propia integral. Con $e^{ax}$, al derivar sale un factor $a$; al integrar hay que dividir entre $a$.",
    pasos: [
      "La función $e^{x}$ tiene una propiedad única: su derivada es ella misma, $(e^{x})' = e^{x}$. Por eso también $\\int e^{x}\\,dx = e^{x} + C$.",
      "Si el exponente es un número por x, la regla de la cadena saca ese número al derivar: $(e^{3x})' = 3e^{3x}$.",
      "Al integrar se hace lo contrario, se divide entre ese número: $\\int e^{3x}\\,dx = \\dfrac{e^{3x}}{3} + C$.",
      "Comprueba derivando: $\\left(\\dfrac{e^{3x}}{3}\\right)' = \\dfrac{3e^{3x}}{3} = e^{3x}$.",
    ],
    visuales: [
      cuadros(2, "Derivar multiplica, integrar divide", [
        { texto: "Derivar saca un factor 2", formula: "(e^{2x})' = 2e^{2x}" },
        { texto: "Integrar divide entre 2", formula: "\\int e^{2x}\\,dx = \\dfrac{e^{2x}}{2} + C" },
        { texto: "Con coeficiente", formula: "\\int 6e^{2x}\\,dx = 3e^{2x} + C" },
      ]),
    ],
    quiz: [
      p("Calcula $\\int e^{4x}\\,dx$.", "$\\dfrac{e^{4x}}{4} + C$", ["$4e^{4x} + C$", "$e^{4x} + C$", "$\\dfrac{e^{5x}}{5} + C$"], "Se divide entre el 4 del exponente."),
      p("Calcula $\\int 10e^{5x}\\,dx$.", "$2e^{5x} + C$", ["$50e^{5x} + C$", "$10e^{5x} + C$", "$5e^{5x} + C$"], "$\\dfrac{10}{5}e^{5x} = 2e^{5x}$; al derivar vuelve a dar $10e^{5x}$."),
      p("¿Cuál es la derivada de $e^{x}$?", "$e^{x}$", ["$xe^{x-1}$", "$e$", "$0$"], "La exponencial es su propia derivada (no se le aplica la regla de la potencia)."),
    ],
  },
  {
    slug: "calculia-tec-integral-seno-coseno",
    grupo: "integrales",
    orden: 10,
    requierePro: false,
    nombre: "Seno y coseno: el signo menos va con el coseno",
    descripcion: "$\\int \\cos(x)\\,dx = \\operatorname{sen}(x) + C$ y $\\int \\operatorname{sen}(x)\\,dx = -\\cos(x) + C$. Truco: al integrar, el menos aparece cuando el resultado es coseno.",
    pasos: [
      "Recuerda las derivadas: $(\\operatorname{sen}(x))' = \\cos(x)$ y $(\\cos(x))' = -\\operatorname{sen}(x)$.",
      "Integrar es deshacerlas: $\\int \\cos(x)\\,dx = \\operatorname{sen}(x) + C$ y $\\int \\operatorname{sen}(x)\\,dx = -\\cos(x) + C$.",
      "Para no confundir el signo: al integrar el seno, el menos queda delante del coseno. Compruébalo derivando: $(-\\cos(x))' = \\operatorname{sen}(x)$.",
      "Los coeficientes salen adelante: $\\int 4\\cos(x)\\,dx = 4\\operatorname{sen}(x) + C$ y $\\int 3\\operatorname{sen}(x)\\,dx = -3\\cos(x) + C$.",
    ],
    visuales: [
      cuadros(2, "El ciclo de seno y coseno", [
        { texto: "Derivar seno da coseno", formula: "(\\operatorname{sen}(x))' = \\cos(x)" },
        { texto: "Derivar coseno da menos seno", formula: "(\\cos(x))' = -\\operatorname{sen}(x)" },
        { texto: "Al integrar el seno, el menos queda con el coseno", formula: "\\int 2\\operatorname{sen}(x)\\,dx = -2\\cos(x) + C" },
      ]),
    ],
    quiz: [
      p("Calcula $\\int 6\\cos(x)\\,dx$.", "$6\\operatorname{sen}(x) + C$", ["$-6\\operatorname{sen}(x) + C$", "$6\\cos(x) + C$", "$-6\\cos(x) + C$"], "Integrar coseno da seno, sin signo menos."),
      p("Calcula $\\int 2\\operatorname{sen}(x)\\,dx$.", "$-2\\cos(x) + C$", ["$2\\cos(x) + C$", "$-2\\operatorname{sen}(x) + C$", "$2\\operatorname{sen}(x) + C$"], "Integrar seno da menos coseno: $(-2\\cos(x))' = 2\\operatorname{sen}(x)$."),
      p("¿Cuál es la derivada de $\\cos(x)$?", "$-\\operatorname{sen}(x)$", ["$\\operatorname{sen}(x)$", "$-\\cos(x)$", "$\\cos(x)$"], "Derivar coseno da menos seno."),
    ],
  },
  {
    slug: "calculia-tec-sustitucion-reconocer",
    grupo: "integrales",
    orden: 11,
    requierePro: false,
    nombre: "Sustitución: busca algo cuya derivada ya esté afuera",
    descripcion: "Si dentro de la integral hay una expresión elevada a una potencia y afuera está (salvo un número) su derivada, llámala $u$ y la integral se vuelve una potencia simple.",
    pasos: [
      "Señal: un paréntesis elevado a algo, como $(2x+3)^{4}$, y afuera un número relacionado con la derivada de lo de adentro (aquí, $(2x+3)' = 2$).",
      "Llama $u$ a lo de adentro: $u = 2x+3$. Como $du = 2\\,dx$, cada $dx$ se cambia por $\\dfrac{du}{2}$.",
      "Ejemplo: en $\\int 10(2x+3)^{4}\\,dx$, con $u = 2x+3$ queda $\\int 5u^{4}\\,du$, que da $u^{5} + C$. Al volver a x: $(2x+3)^{5} + C$.",
      "Comprueba con la regla de la cadena: $((2x+3)^{5})' = 5(2x+3)^{4}\\cdot 2 = 10(2x+3)^{4}$. Así que $\\int 10(2x+3)^{4}\\,dx = (2x+3)^{5} + C$.",
    ],
    visuales: [
      cuadros(1, "Sustitución en $\\int 10(2x+3)^4\\,dx$", [
        { texto: "Lo de adentro es $u$", formula: "u = 2x+3" },
        { texto: "Su derivada ya está afuera (el 10 es 5 veces 2)", formula: "(2x+3)' = 2" },
        { texto: "Integra la potencia y vuelve a x", formula: "\\int 10(2x+3)^4\\,dx = (2x+3)^5 + C" },
      ]),
    ],
    quiz: [
      p("Calcula $\\int 12(3x+1)^{3}\\,dx$ con $u = 3x+1$.", "$(3x+1)^{4} + C$", ["$3(3x+1)^{4} + C$", "$12(3x+1)^{4} + C$", "$(3x+1)^{3} + C$"], "$du = 3\\,dx$: queda $\\int 4u^{3}\\,du = u^{4} + C$."),
      p("En $\\int 8(4x-5)^{2}\\,dx$, ¿qué conviene llamar $u$?", "$4x-5$", ["$8$", "$(4x-5)^{2}$", "$x$"], "$u$ es lo de adentro del paréntesis; su derivada (4) divide al 8."),
      p("Si $u = 2x+3$, ¿por qué expresión se cambia $dx$?", "$\\dfrac{du}{2}$", ["$2\\,du$", "$du$", "$3\\,du$"], "$du = 2\\,dx$, así que $dx = \\dfrac{du}{2}$."),
    ],
  },

  // ---------------- Series ----------------
  {
    slug: "calculia-tec-geometrica-converge",
    grupo: "series",
    orden: 13,
    requierePro: false,
    nombre: "Serie geométrica: converge solo si la razón está entre −1 y 1",
    descripcion: "En $a + ar + ar^{2} + \\dots$ cada término es el anterior por $r$. Si $|r| < 1$ los términos se achican y la serie converge; si $|r| \\geq 1$, diverge.",
    pasos: [
      "Una serie geométrica suma términos que se multiplican siempre por el mismo número, la razón $r$. Por ejemplo, $3 + \\dfrac{3}{2} + \\dfrac{3}{4} + \\dots$ tiene razón un medio.",
      "Para hallar $r$, divide un término entre el anterior: $\\dfrac{3/4}{3/2} = \\dfrac{1}{2}$.",
      "Regla: si $|r| < 1$ (por ejemplo, dos tercios o menos un cuarto), la serie converge. Si $|r| \\geq 1$ (como 2 o menos tres medios), diverge.",
      "El signo no decide: mira el valor absoluto. Con razón menos cuatro quintos los términos cambian de signo pero se achican, así que converge.",
    ],
    visuales: [
      { tipo: "calculia.serie", despuesDePaso: 0, titulo: "Razón $\\frac{1}{2}$: las sumas parciales se acercan a 6", a: 3, rNum: 1, rDen: 2, terminos: 8 },
      { tipo: "calculia.serie", despuesDePaso: 2, titulo: "Razón $\\frac{3}{2}$: las sumas crecen sin límite", a: 1, rNum: 3, rDen: 2, terminos: 6 },
    ],
    quiz: [
      p("¿La serie geométrica con razón $r = -\\dfrac{2}{3}$ converge o diverge?", "Converge", ["Diverge"], "$|r| = \\dfrac{2}{3} < 1$: converge."),
      p("¿La serie geométrica con razón $r = \\dfrac{5}{4}$ converge o diverge?", "Diverge", ["Converge"], "$|r| = \\dfrac{5}{4} \\geq 1$: diverge."),
      p("¿Cuál es la razón de $2 + 6 + 18 + 54 + \\dots$?", "3", ["2", "4", "$\\dfrac{1}{3}$"], "Cada término es el anterior por 3: $\\dfrac{6}{2} = 3$."),
    ],
  },
  {
    slug: "calculia-tec-suma-geometrica",
    grupo: "series",
    orden: 14,
    requierePro: false,
    nombre: "Suma infinita de una geométrica: primer término sobre uno menos la razón",
    descripcion: "Si $|r| < 1$, la suma infinita es $\\dfrac{a}{1-r}$, con $a$ el primer término. Cuidado con los signos cuando la razón es negativa.",
    pasos: [
      "Solo se puede sumar «hasta el infinito» si la serie converge, es decir, si $|r| < 1$. Si no, la suma no existe.",
      "La fórmula de la suma es $\\dfrac{a}{1-r}$, donde $a$ es el primer término y $r$ la razón.",
      "Ejemplo: primer término 4 y razón un medio: $\\dfrac{4}{1-\\frac{1}{2}} = \\dfrac{4}{\\frac{1}{2}} = 8$.",
      "Con razón negativa, el menos se vuelve más: primer término 6 y razón menos un medio dan $\\dfrac{6}{1+\\frac{1}{2}} = 4$.",
    ],
    visuales: [{ tipo: "calculia.serie", despuesDePaso: 2, titulo: "$\\dfrac{4}{1-\\frac{1}{2}} = 8$", a: 4, rNum: 1, rDen: 2, terminos: 8 }],
    quiz: [
      p("Calcula la suma infinita con primer término 9 y razón $\\dfrac{2}{3}$.", "27", ["18", "13,5", "6"], "$\\dfrac{9}{1-\\frac{2}{3}} = \\dfrac{9}{\\frac{1}{3}} = 27$."),
      p("Calcula la suma infinita con primer término 10 y razón $-\\dfrac{1}{4}$.", "8", ["13,33", "40", "7,5"], "$\\dfrac{10}{1+\\frac{1}{4}} = \\dfrac{10}{\\frac{5}{4}} = 8$."),
      p("¿Cuándo existe la suma infinita de una serie geométrica?", "Cuando $|r| < 1$", ["Siempre", "Cuando $r > 1$", "Cuando $a < 1$"], "Solo si los términos se achican lo suficiente: $|r| < 1$."),
    ],
  },
  {
    slug: "calculia-tec-serie-p",
    grupo: "series",
    orden: 15,
    requierePro: false,
    nombre: "Serie p: converge si el exponente es mayor que 1",
    descripcion: "$\\sum \\dfrac{1}{n^{p}}$ converge si $p > 1$ y diverge si $p \\leq 1$. El caso frontera $p = 1$ es la serie armónica, que diverge.",
    pasos: [
      "Una serie p suma los inversos de las potencias de los números naturales: $\\sum_{n=1}^{\\infty} \\dfrac{1}{n^{p}}$, es decir, $1 + \\dfrac{1}{2^{p}} + \\dfrac{1}{3^{p}} + \\dots$",
      "Regla única: si $p > 1$ converge; si $p \\leq 1$ diverge. Con $p = 2$ converge; con $p = 0{,}5$ (raíz cuadrada en el denominador) diverge.",
      "Ojo con $p = 1$: es la serie armónica, $1 + \\dfrac{1}{2} + \\dfrac{1}{3} + \\dots$ Sus términos se achican, pero la suma crece sin límite. No basta con que los términos tiendan a 0.",
      "No la confundas con la geométrica: en la serie p la $n$ está en la base ($n^{p}$); en la geométrica, en el exponente ($r^{n}$).",
    ],
    visuales: [
      cuadros(1, "Tres series p", [
        { texto: "$p = 2$: converge", formula: "1 + \\dfrac{1}{4} + \\dfrac{1}{9} + \\dfrac{1}{16} + \\dots", resaltar: "Con 10 términos suma $1{,}55$" },
        { texto: "$p = 1$: la armónica diverge", formula: "1 + \\dfrac{1}{2} + \\dfrac{1}{3} + \\dfrac{1}{4} + \\dots", resaltar: "Con 1000 términos ya pasa de 7" },
        { texto: "$p = 0{,}5$: diverge", formula: "1 + \\dfrac{1}{\\sqrt{2}} + \\dfrac{1}{\\sqrt{3}} + \\dots" },
      ]),
    ],
    quiz: [
      p("¿La serie $\\sum \\dfrac{1}{n^{3}}$ converge o diverge?", "Converge", ["Diverge"], "Es una serie p con $p = 3 > 1$."),
      p("¿La serie armónica $\\sum \\dfrac{1}{n}$ converge o diverge?", "Diverge", ["Converge"], "Es la serie p con $p = 1$: diverge aunque sus términos tiendan a 0."),
      p("¿Para qué valores de $p$ converge la serie p?", "$p > 1$", ["$p \\geq 1$", "$p < 1$", "$p > 0$"], "Converge exactamente cuando $p > 1$."),
    ],
  },
  {
    slug: "calculia-tec-criterio-razon",
    grupo: "series",
    orden: 16,
    requierePro: false,
    nombre: "Criterio de la razón: divide un término entre el anterior",
    descripcion: "Calcula el límite de $\\left|\\dfrac{a_{n+1}}{a_{n}}\\right|$. Si es menor que 1 la serie converge, si es mayor que 1 diverge y si es 1 el criterio no decide.",
    pasos: [
      "El criterio de la razón compara cada término con el anterior. Calcula $L = \\lim_{n\\to\\infty}\\left|\\dfrac{a_{n+1}}{a_{n}}\\right|$.",
      "Decide: si $L < 1$ la serie converge; si $L > 1$ diverge; si L vale exactamente 1, el criterio no sirve y hay que usar otro.",
      "Para $a_{n} = c\\cdot r^{n}$, el cociente entre un término y el anterior es siempre $r$ (la $c$ se cancela), así que L es el valor absoluto de $r$.",
      "Ejemplo: con $a_{n} = 5\\cdot\\left(\\dfrac{2}{3}\\right)^{n}$, L es dos tercios, menor que 1: converge. Con $a_{n} = 2\\cdot\\left(-\\dfrac{3}{2}\\right)^{n}$, L es tres medios: diverge.",
    ],
    visuales: [
      cuadros(2, "Criterio de la razón con $a_n = 5\\cdot\\left(\\frac{2}{3}\\right)^n$", [
        { texto: "Término siguiente sobre el actual", formula: "\\dfrac{a_{n+1}}{a_{n}}" },
        { texto: "La $c$ se cancela y queda la razón", formula: "\\dfrac{5\\cdot(2/3)^{4}}{5\\cdot(2/3)^{3}} = \\dfrac{2}{3}" },
        { texto: "Es menor que 1", resaltar: "La serie converge" },
      ]),
    ],
    quiz: [
      p("Para $a_{n} = 4\\cdot\\left(\\dfrac{3}{5}\\right)^{n}$, ¿cuánto vale L en el criterio de la razón?", "$\\dfrac{3}{5}$", ["4", "$\\dfrac{12}{5}$", "$\\dfrac{5}{3}$"], "La $c = 4$ se cancela y L es el valor absoluto de la razón: $\\dfrac{3}{5}$."),
      p("Si el criterio de la razón da $L = 2$, la serie...", "Diverge", ["Converge", "El criterio no decide"], "$L > 1$: diverge."),
      p("Si el criterio de la razón da $L = 1$, ¿qué se concluye?", "Nada: hay que usar otro criterio", ["Que converge", "Que diverge"], "Con $L = 1$ hay series que convergen y otras que divergen."),
    ],
  },

  // ---------------- Multivariable y EDOs ----------------
  {
    slug: "calculia-tec-parcial-terminos-mixtos",
    grupo: "multivariable",
    orden: 18,
    requierePro: false,
    nombre: "Parciales término a término: la otra variable viaja como un número",
    descripcion: "Para derivar respecto de x, cada término se deriva con la regla de la potencia en x y la potencia de y se queda igual multiplicando. Los términos sin x desaparecen.",
    pasos: [
      "Recorre el polinomio término a término. En cada uno, separa la parte con x de la parte con y.",
      "Para $\\dfrac{\\partial f}{\\partial x}$: aplica la regla de la potencia solo a la x y deja la potencia de y tal cual. Así, $4x^{3}y^{2}$ da $12x^{2}y^{2}$.",
      "Un término que no tiene x (como $7y^{3}$) es una constante para $\\dfrac{\\partial f}{\\partial x}$: su parcial es 0. Y uno sin y (como $5x^{2}$) desaparece en $\\dfrac{\\partial f}{\\partial y}$.",
      "Ejemplo completo: para $f(x,y) = 4x^{3}y^{2} + 5x^{2} + 7y^{3}$, la parcial respecto de x es $12x^{2}y^{2} + 10x$ y la parcial respecto de y es $8x^{3}y + 21y^{2}$.",
    ],
    visuales: [
      cuadros(1, "Respecto de x en $4x^3y^2 + 5x^2 + 7y^3$", [
        { texto: "$4x^3y^2$: deriva la x, deja $y^2$", formula: "12x^2y^2" },
        { texto: "$5x^2$", formula: "10x" },
        { texto: "$7y^3$ no tiene x", formula: "0" },
      ]),
    ],
    quiz: [
      p("Para $f(x,y) = 3x^{2}y^{4} + 2y$, calcula $\\dfrac{\\partial f}{\\partial x}$.", "$6xy^{4}$", ["$6xy^{4} + 2$", "$24xy^{3}$", "$6x$"], "$3x^{2}y^{4}$ da $6xy^{4}$ y $2y$ no tiene x: da 0."),
      p("Para $f(x,y) = 3x^{2}y^{4} + 2y$, calcula $\\dfrac{\\partial f}{\\partial y}$.", "$12x^{2}y^{3} + 2$", ["$12x^{2}y^{3}$", "$12xy^{3} + 2$", "$6xy^{4} + 2$"], "$3x^{2}y^{4}$ da $12x^{2}y^{3}$ y $2y$ da 2."),
      p("Al calcular $\\dfrac{\\partial f}{\\partial x}$, ¿qué pasa con un término que solo tiene y?", "Su parcial es 0", ["Se queda igual", "Se deriva respecto de y", "Se multiplica por x"], "Para la parcial en x, la y es una constante, y la derivada de una constante es 0."),
    ],
  },
  {
    slug: "calculia-tec-edo-exponencial",
    grupo: "multivariable",
    orden: 20,
    requierePro: false,
    nombre: "Si la derivada es proporcional a la función, la solución es exponencial",
    descripcion: "La ecuación $\\dfrac{dy}{dx} = k\\cdot y$ (cambia en proporción a lo que hay) siempre tiene como solución $y = A\\cdot e^{kx}$.",
    pasos: [
      "Muchas cosas cambian en proporción a su tamaño: una población, el dinero con interés compuesto, una sustancia que se desintegra. Eso se escribe $\\dfrac{dy}{dx} = k\\cdot y$.",
      "La solución es siempre $y = A\\cdot e^{kx}$, donde $A$ es el valor en $x = 0$. Si $k > 0$ crece; si $k < 0$ decrece.",
      "Compruébalo: derivar $A\\cdot e^{kx}$ da $k\\cdot A\\cdot e^{kx}$, que es $k$ por la misma función.",
      "Ejemplo: $\\dfrac{dy}{dx} = 3y$ tiene solución $y = A\\cdot e^{3x}$. Comprobación: $(e^{3x})' = 3e^{3x}$.",
    ],
    visuales: [{ tipo: "calculia.edo", despuesDePaso: 1, titulo: "Soluciones de $\\dfrac{dy}{dx} = 2y$", k: 2, n: 0, x0: 0.5, rango: [-1.2, 1.2] }],
    quiz: [
      p("¿Cuál es la solución general de $\\dfrac{dy}{dx} = 5y$?", "$y = A\\cdot e^{5x}$", ["$y = A\\cdot e^{x/5}$", "$y = 5x + A$", "$y = A\\cdot x^{5}$"], "Si la derivada es 5 veces la función, la solución es $A\\cdot e^{5x}$."),
      p("Si $k < 0$ en $\\dfrac{dy}{dx} = k\\cdot y$, la cantidad...", "Decrece", ["Crece", "Se mantiene igual"], "Con $k < 0$, $e^{kx}$ se achica a medida que x crece."),
      p("En $y = A\\cdot e^{kx}$, ¿qué representa $A$?", "El valor de y cuando $x = 0$", ["La velocidad de crecimiento", "La derivada de y", "Un número que siempre vale 1"], "En $x = 0$, $e^{0} = 1$ y queda $y = A$."),
    ],
  },
];

export const CLASES_CURSO_CALCULIA: LeccionCalculia[] = [
  // ---------------- Derivadas ----------------
  {
    slug: "calculia-clase-regla-producto",
    grupo: "derivadas",
    orden: 22,
    requierePro: true,
    nombre: "Regla del producto: derivar una multiplicación de funciones",
    descripcion: "Por qué la derivada de un producto no es el producto de las derivadas, de dónde sale $u'v + uv'$, ejemplos resueltos y cómo comprobarlos.",
    pasos: [
      "Cuando $f(x)$ es un producto de dos funciones, $u\\cdot v$, la tentación es derivar cada una y multiplicar. Está mal: con $u = x$ y $v = x$ el producto es $x^{2}$, cuya derivada es $2x$, pero el producto de las derivadas es $1\\cdot 1 = 1$.",
      "La regla correcta: $(u\\cdot v)' = u'\\cdot v + u\\cdot v'$. Cada término deriva un factor y deja el otro intacto. Con $u = v = x$: $1\\cdot x + x\\cdot 1 = 2x$.",
      "Idea de por qué funciona: si $u$ y $v$ son los lados de un rectángulo, su área es $u\\cdot v$. Cuando los dos crecen un poco, el área gana una franja a lo largo de cada lado, una de tamaño $u'\\cdot v$ y otra de $u\\cdot v'$; la esquinita que sobra es despreciable.",
      "Ejemplo resuelto: $f(x) = 3x^{2}(x^{4} - 2)$, con $u = 3x^{2}$ y $v = x^{4} - 2$. Entonces $f'(x) = 6x(x^{4} - 2) + 3x^{2}\\cdot 4x^{3} = 18x^{5} - 12x$.",
      "Comprobación: multiplicando primero, $(3x^{6} - 6x^{2})' = 18x^{5} - 12x$. Coincide. La regla es imprescindible cuando no se puede multiplicar primero, como en $x^{2}e^{x}$: $(x^{2}e^{x})' = 2xe^{x} + x^{2}e^{x}$.",
      "Errores comunes: multiplicar las derivadas; olvidar uno de los dos términos; y equivocar el signo cuando un factor tiene una resta. Con tres factores la regla se extiende: se deriva uno por vez y se suman los tres términos.",
    ],
    visuales: [
      cuadros(3, "Regla del producto con $3x^2(x^4-2)$", [
        { texto: "Deriva la primera, deja la segunda", formula: "(3x^2)'\\cdot(x^4-2) = 6x(x^4-2)" },
        { texto: "Deja la primera, deriva la segunda", formula: "3x^2\\cdot(x^4-2)' = 12x^5" },
        { texto: "Suma y simplifica", formula: "6x(x^4-2) + 12x^5 = 18x^5 - 12x" },
      ]),
      { tipo: "calculia.tangente", despuesDePaso: 4, titulo: "$f(x)=3x^6-6x^2$: en $x=1$ la pendiente es $18 - 12 = 6$", funcion: [{ tipo: "potencia", c: 3, n: 6 }, { tipo: "potencia", c: -6, n: 2 }], x0: 1, rango: [0, 1.25] },
    ],
    quiz: [
      p("Deriva $f(x) = x^{2}(x^{3} + 5)$.", "$5x^{4} + 10x$", ["$6x^{3}$", "$5x^{4} + 5$", "$2x(x^{3}+5)$"], "$2x(x^{3}+5) + x^{2}\\cdot 3x^{2} = 5x^{4} + 10x$."),
      p("Deriva $f(x) = x\\cdot e^{x}$.", "$e^{x} + xe^{x}$", ["$e^{x}$", "$xe^{x}$", "$xe^{x-1}$"], "$u = x$, $v = e^{x}$: $1\\cdot e^{x} + x\\cdot e^{x}$."),
      p("¿Cuál es la regla del producto?", "$(uv)' = u'v + uv'$", ["$(uv)' = u'v'$", "$(uv)' = u'v - uv'$", "$(uv)' = \\dfrac{u'}{v'}$"], "Deriva uno y deja el otro, dos veces, y suma."),
      p("Con $u = 2x$ y $v = x^{3}$, ¿cuánto vale $u'\\cdot v$?", "$2x^{3}$", ["$6x^{3}$", "$6x^{2}$", "$2$"], "$u' = 2$, así que $u'\\cdot v = 2x^{3}$."),
      p("¿Cuál es el error más común con la regla del producto?", "Multiplicar las dos derivadas", ["Sumar las funciones", "Dividir entre $v^{2}$", "Restar 1 al exponente"], "$(uv)'$ no es $u'v'$: faltan los términos cruzados."),
    ],
  },
  {
    slug: "calculia-clase-regla-cociente",
    grupo: "derivadas",
    orden: 23,
    requierePro: true,
    nombre: "Regla del cociente: derivar una división",
    descripcion: "La fórmula $\\dfrac{u'v - uv'}{v^{2}}$, por qué el orden importa, ejemplos resueltos y cuándo conviene evitarla.",
    pasos: [
      "Si $f(x) = \\dfrac{u}{v}$, su derivada es $f'(x) = \\dfrac{u'\\cdot v - u\\cdot v'}{v^{2}}$, siempre que $v$ no sea 0.",
      "A diferencia del producto, aquí hay una resta: si inviertes el orden del numerador, el resultado cambia de signo. Frase para recordarla: «abajo por la derivada de arriba, menos arriba por la derivada de abajo, sobre abajo al cuadrado».",
      "Ejemplo resuelto: $f(x) = \\dfrac{3x+1}{x-2}$, con $u' = 3$ y $v' = 1$. Entonces $f'(x) = \\dfrac{3(x-2) - (3x+1)\\cdot 1}{(x-2)^{2}} = \\dfrac{-7}{(x-2)^{2}}$.",
      "Otro ejemplo: para $\\dfrac{x^{2}}{x^{2}+1}$ la derivada es $\\dfrac{2x(x^{2}+1) - x^{2}\\cdot 2x}{(x^{2}+1)^{2}} = \\dfrac{2x}{(x^{2}+1)^{2}}$.",
      "Cuándo evitarla: si el denominador es un número, divide y usa la potencia: $\\left(\\dfrac{x^{4}}{2}\\right)' = 2x^{3}$. Si es una potencia de x, reescribe con exponente negativo: $\\dfrac{5}{x^{2}} = 5x^{-2}$, cuya derivada es $-10x^{-3}$.",
      "Errores comunes: invertir la resta del numerador (cambia el signo de todo); olvidar elevar al cuadrado el denominador; y simplificar mal el numerador: expande y reduce antes de dar el resultado.",
    ],
    visuales: [
      cuadros(2, "Regla del cociente con $\\dfrac{3x+1}{x-2}$", [
        { texto: "Abajo por la derivada de arriba", formula: "(x-2)\\cdot(3x+1)' = 3(x-2)" },
        { texto: "Menos arriba por la derivada de abajo", formula: "(3x+1)\\cdot(x-2)' = 3x+1" },
        { texto: "Sobre abajo al cuadrado", formula: "\\left(\\dfrac{3x+1}{x-2}\\right)' = \\dfrac{-7}{(x-2)^2}" },
      ]),
    ],
    quiz: [
      p("Deriva $f(x) = \\dfrac{x}{x+1}$.", "$\\dfrac{1}{(x+1)^{2}}$", ["$\\dfrac{-1}{(x+1)^{2}}$", "$\\dfrac{2x+1}{(x+1)^{2}}$", "$1$"], "$\\dfrac{1\\cdot(x+1) - x\\cdot 1}{(x+1)^{2}} = \\dfrac{1}{(x+1)^{2}}$."),
      p("Deriva $f(x) = \\dfrac{2x^{2}}{x+3}$.", "$\\dfrac{2x^{2}+12x}{(x+3)^{2}}$", ["$\\dfrac{6x^{2}+12x}{(x+3)^{2}}$", "$4x$", "$\\dfrac{-2x^{2}-12x}{(x+3)^{2}}$"], "$\\dfrac{4x(x+3) - 2x^{2}}{(x+3)^{2}} = \\dfrac{2x^{2}+12x}{(x+3)^{2}}$."),
      p("¿Qué cambia si inviertes el orden de la resta en el numerador?", "El signo del resultado", ["Nada", "El denominador", "El exponente"], "$u'v - uv'$ y $uv' - u'v$ son opuestos."),
      p("¿Cuál es la derivada de $\\dfrac{3}{x}$?", "$-\\dfrac{3}{x^{2}}$", ["$\\dfrac{3}{x^{2}}$", "$3\\ln|x|$", "$0$"], "$\\dfrac{3}{x} = 3x^{-1}$, cuya derivada es $-3x^{-2}$."),
      p("En $\\dfrac{u'v - uv'}{v^{2}}$, ¿qué es $v$?", "El denominador", ["El numerador", "La derivada del numerador", "El resultado"], "$u$ es lo de arriba y $v$ lo de abajo."),
    ],
  },
  {
    slug: "calculia-clase-regla-cadena",
    grupo: "derivadas",
    orden: 24,
    requierePro: true,
    nombre: "Regla de la cadena: funciones dentro de funciones",
    descripcion: "Cómo reconocer una composición, derivar de afuera hacia adentro y aplicarla a potencias de binomios, exponenciales y funciones trigonométricas.",
    pasos: [
      "Una composición es una función dentro de otra: en $(2x+5)^{3}$ la de afuera es «elevar al cubo» y la de adentro es $2x+5$. En $e^{4x}$, la de afuera es la exponencial y la de adentro, $4x$.",
      "La regla: deriva la de afuera dejando la de adentro igual, y multiplica por la derivada de la de adentro. Con símbolos, la derivada de $g(u(x))$ es $g'(u)\\cdot u'(x)$.",
      "Potencias de un binomio: $((2x+5)^{3})' = 3(2x+5)^{2}\\cdot 2 = 6(2x+5)^{2}$.",
      "Exponenciales y trigonométricas siguen la misma idea: $(e^{4x})' = 4e^{4x}$ y $(\\operatorname{sen}(3x))' = 3\\cos(3x)$.",
      "Con algo más complejo adentro: $((x^{2}+1)^{4})' = 4(x^{2}+1)^{3}\\cdot 2x = 8x(x^{2}+1)^{3}$.",
      "Errores comunes: olvidar multiplicar por la derivada de adentro (es el error número uno); derivar también lo de adentro en el primer paso (se deja intacto); y confundir composición con producto: $x^{2}\\cdot e^{x}$ es un producto, $e^{x^{2}}$ es una composición.",
    ],
    visuales: [
      cuadros(2, "Cadena con $(2x+5)^3$", [
        { texto: "Afuera: el cubo, sin tocar lo de adentro", formula: "3(2x+5)^2" },
        { texto: "Adentro: la derivada de $2x+5$", formula: "(2x+5)' = 2" },
        { texto: "Multiplica", formula: "((2x+5)^3)' = 6(2x+5)^2" },
      ]),
      { tipo: "calculia.tangente", despuesDePaso: 2, titulo: "$f(x)=(2x+5)^3$: en $x=-2$ la pendiente es $6\\cdot 1^2 = 6$", funcion: [{ tipo: "factorLineal", c: 1, a: 2, b: 5, n: 3 }], x0: -2, rango: [-3, -1.5] },
    ],
    quiz: [
      p("Deriva $f(x) = (4x-3)^{5}$.", "$20(4x-3)^{4}$", ["$5(4x-3)^{4}$", "$20(4x-3)^{5}$", "$4(4x-3)^{4}$"], "Afuera $5(4x-3)^{4}$, adentro 4: $20(4x-3)^{4}$."),
      p("Deriva $f(x) = e^{6x}$.", "$6e^{6x}$", ["$e^{6x}$", "$6xe^{6x}$", "$\\dfrac{e^{6x}}{6}$"], "La exponencial se queda igual y se multiplica por la derivada de $6x$."),
      p("Deriva $f(x) = \\cos(2x)$.", "$-2\\operatorname{sen}(2x)$", ["$-\\operatorname{sen}(2x)$", "$2\\operatorname{sen}(2x)$", "$-2\\cos(2x)$"], "Afuera: $-\\operatorname{sen}(2x)$; adentro: 2."),
      p("Deriva $f(x) = (x^{3}+2)^{2}$.", "$6x^{2}(x^{3}+2)$", ["$2(x^{3}+2)$", "$3x^{2}(x^{3}+2)$", "$6x^{2}(x^{3}+2)^{2}$"], "$2(x^{3}+2)\\cdot 3x^{2} = 6x^{2}(x^{3}+2)$."),
      p("¿Cuál de estas funciones es una composición?", "$e^{x^{2}}$", ["$x^{2}\\cdot e^{x}$", "$x^{2} + e^{x}$", "$3x^{2}$"], "En $e^{x^{2}}$ la función $x^{2}$ está dentro de la exponencial."),
    ],
  },

  // ---------------- Integrales ----------------
  {
    slug: "calculia-clase-integral-definida",
    grupo: "integrales",
    orden: 27,
    requierePro: true,
    nombre: "La integral definida: área bajo la curva y regla de Barrow",
    descripcion: "Qué mide $\\int_{a}^{b} f(x)\\,dx$, cómo se calcula con una antiderivada, y qué pasa cuando la curva está debajo del eje.",
    pasos: [
      "La integral definida $\\int_{a}^{b} f(x)\\,dx$ suma el área entre la curva de $f$ y el eje x, desde a hasta b. Se puede aproximar con rectángulos cada vez más finos (sumas de Riemann).",
      "La regla de Barrow (el teorema fundamental del cálculo) da el valor exacto: si $F$ es una antiderivada de $f$, la integral definida es $F(b) - F(a)$. La constante $C$ se cancela al restar, así que no hace falta.",
      "Ejemplo resuelto: $\\int_{1}^{3} 2x\\,dx$. Una antiderivada es $x^{2}$, así que el resultado es $3^{2} - 1^{2} = 8$.",
      "Otro: $\\int_{0}^{2} (3x^{2} + 1)\\,dx$. Con la antiderivada $x^{3} + x$, queda $(2^{3} + 2) - (0^{3} + 0) = 10$.",
      "Si la curva está por debajo del eje, la integral da negativo: $\\int_{0}^{1} (-4x^{3})\\,dx$ vale $-1$. Para el área geométrica se toma el valor absoluto de cada parte.",
      "Errores comunes: restar al revés ($F(a) - F(b)$ cambia el signo); evaluar la función $f$ en vez de la antiderivada; y olvidar que una integral definida es un número, no una función.",
    ],
    visuales: [
      { tipo: "calculia.area", despuesDePaso: 2, titulo: "$\\int_1^3 2x\\,dx$: $3^2 - 1^2 = 8$", funcion: [{ tipo: "potencia", c: 2, n: 1 }], desde: 1, hasta: 3 },
      { tipo: "calculia.area", despuesDePaso: 3, titulo: "$\\int_0^2 (3x^2+1)\\,dx$: $(2^3 + 2) - 0 = 10$", funcion: [{ tipo: "potencia", c: 3, n: 2 }, { tipo: "potencia", c: 1, n: 0 }], desde: 0, hasta: 2 },
    ],
    quiz: [
      p("Calcula $\\int_{0}^{3} 2x\\,dx$.", "9", ["6", "3", "18"], "Antiderivada $x^{2}$: $3^{2} - 0^{2} = 9$."),
      p("Calcula $\\int_{1}^{2} 3x^{2}\\,dx$.", "7", ["8", "9", "3"], "Antiderivada $x^{3}$: $2^{3} - 1^{3} = 7$."),
      p("Si $F$ es una antiderivada de $f$, ¿cuánto vale $\\int_{a}^{b} f(x)\\,dx$?", "$F(b) - F(a)$", ["$F(a) - F(b)$", "$f(b) - f(a)$", "$F(b) + F(a)$"], "Regla de Barrow: la antiderivada en el extremo de arriba menos en el de abajo."),
      p("¿Por qué no se escribe $+ C$ en una integral definida?", "Porque se cancela al restar", ["Porque vale 0 siempre", "Porque solo va en derivadas", "Porque el área es positiva"], "$(F(b) + C) - (F(a) + C) = F(b) - F(a)$."),
      p("Calcula $\\int_{0}^{1} (-4x^{3})\\,dx$.", "-1", ["1", "-4", "0"], "Antiderivada $-x^{4}$: $-1 - 0 = -1$ (la curva está debajo del eje)."),
    ],
  },
  {
    slug: "calculia-clase-exponencial-y-logaritmo",
    grupo: "integrales",
    orden: 28,
    requierePro: true,
    nombre: "Integrales de la exponencial y de k sobre x",
    descripcion: "Por qué $e^{x}$ es su propia integral, cómo se integra $e^{ax}$ dividiendo entre $a$, y por qué $\\dfrac{k}{x}$ da $k\\ln|x|$.",
    pasos: [
      "La exponencial $e^{x}$ (con e aproximadamente $2{,}718$) es la única función que es su propia derivada: $(e^{x})' = e^{x}$. Por eso $\\int e^{x}\\,dx = e^{x} + C$.",
      "Con un número por x en el exponente, la regla de la cadena saca ese número al derivar, y al integrar hay que dividir entre él. Ejemplos: $\\int e^{2x}\\,dx = \\dfrac{e^{2x}}{2} + C$ y $\\int 12e^{3x}\\,dx = 4e^{3x} + C$.",
      "El logaritmo aparece con $\\dfrac{1}{x}$: como $(\\ln|x|)' = \\dfrac{1}{x}$, resulta $\\int \\dfrac{1}{x}\\,dx = \\ln|x| + C$.",
      "Con coeficiente, el número sale adelante: $\\int \\dfrac{7}{x}\\,dx = 7\\ln|x| + C$.",
      "Es justo el caso de exponente $-1$ que la regla de la potencia no cubre. Para cualquier otro exponente la regla sigue valiendo, también con negativos: $\\int x^{-2}\\,dx = -x^{-1} + C$.",
      "Errores comunes: multiplicar por el número del exponente en vez de dividir al integrar $e^{ax}$; escribir el logaritmo sin valor absoluto (falla para x negativa); y aplicar la regla de la potencia a $\\dfrac{1}{x}$.",
    ],
    visuales: [
      cuadros(1, "Exponencial y logaritmo", [
        { texto: "Derivar multiplica por 3", formula: "(e^{3x})' = 3e^{3x}" },
        { texto: "Integrar divide entre 3", formula: "\\int e^{3x}\\,dx = \\dfrac{e^{3x}}{3} + C" },
        { texto: "El caso de k sobre x", formula: "\\int \\dfrac{2}{x}\\,dx = 2\\ln|x| + C" },
      ]),
    ],
    quiz: [
      p("Calcula $\\int e^{5x}\\,dx$.", "$\\dfrac{e^{5x}}{5} + C$", ["$5e^{5x} + C$", "$e^{5x} + C$", "$\\dfrac{e^{6x}}{6} + C$"], "Se divide entre el 5 del exponente."),
      p("Calcula $\\int 8e^{2x}\\,dx$.", "$4e^{2x} + C$", ["$16e^{2x} + C$", "$8e^{2x} + C$", "$2e^{2x} + C$"], "$\\dfrac{8}{2}e^{2x} = 4e^{2x}$."),
      p("Calcula $\\int \\dfrac{3}{x}\\,dx$.", "$3\\ln|x| + C$", ["$-\\dfrac{3}{x^{2}} + C$", "$3x + C$", "$\\ln|3x| + C$"], "El 3 sale adelante: $3\\ln|x|$."),
      p("Calcula $\\int x^{-3}\\,dx$.", "$-\\dfrac{1}{2}x^{-2} + C$", ["$-3x^{-4} + C$", "$\\ln|x^{3}| + C$", "$\\dfrac{1}{2}x^{-2} + C$"], "Exponente nuevo $-2$ y se divide entre $-2$."),
      p("¿Por qué el logaritmo de la integral de $\\dfrac{1}{x}$ lleva valor absoluto?", "Para que la fórmula sirva también con x negativa", ["Para que el resultado sea entero", "Porque así se deriva más fácil", "Porque el logaritmo de 1 es 0"], "El logaritmo solo existe para positivos; con el valor absoluto vale para todo x distinto de 0."),
    ],
  },
  {
    slug: "calculia-clase-integrales-trigonometricas",
    grupo: "integrales",
    orden: 29,
    requierePro: true,
    nombre: "Integrales de seno y coseno",
    descripcion: "Las derivadas de seno y coseno al revés, el signo menos que más se olvida, los coeficientes y el caso de un número dentro del coseno.",
    pasos: [
      "Las dos derivadas base: $(\\operatorname{sen}(x))' = \\cos(x)$ y $(\\cos(x))' = -\\operatorname{sen}(x)$. Todo lo demás sale de ahí.",
      "Al revés: $\\int \\cos(x)\\,dx = \\operatorname{sen}(x) + C$ y $\\int \\operatorname{sen}(x)\\,dx = -\\cos(x) + C$.",
      "Con coeficiente, el número sale adelante: $\\int 5\\cos(x)\\,dx = 5\\operatorname{sen}(x) + C$ y $\\int 7\\operatorname{sen}(x)\\,dx = -7\\cos(x) + C$.",
      "Con un número dentro, se divide entre él (es la cadena al revés): $\\int \\cos(2x)\\,dx = \\dfrac{\\operatorname{sen}(2x)}{2} + C$.",
      "Para no equivocar el signo, deriva tu resultado y compara con lo que estaba dentro de la integral: $(-7\\cos(x))' = 7\\operatorname{sen}(x)$, correcto.",
      "Errores comunes: poner el menos en el seno en vez de en el coseno; olvidar dividir entre el número de adentro; y confundir integrar con derivar (integrar coseno da seno, derivar coseno da menos seno).",
    ],
    visuales: [
      cuadros(2, "Seno y coseno al integrar", [
        { texto: "Integrar coseno da seno", formula: "\\int 3\\cos(x)\\,dx = 3\\operatorname{sen}(x) + C" },
        { texto: "Integrar seno da menos coseno", formula: "\\int 4\\operatorname{sen}(x)\\,dx = -4\\cos(x) + C" },
        { texto: "Comprueba derivando", formula: "(-4\\cos(x))' = 4\\operatorname{sen}(x)" },
      ]),
    ],
    quiz: [
      p("Calcula $\\int 3\\operatorname{sen}(x)\\,dx$.", "$-3\\cos(x) + C$", ["$3\\cos(x) + C$", "$-3\\operatorname{sen}(x) + C$", "$3\\operatorname{sen}(x) + C$"], "Integrar seno da menos coseno."),
      p("Calcula $\\int 4\\cos(x)\\,dx$.", "$4\\operatorname{sen}(x) + C$", ["$-4\\operatorname{sen}(x) + C$", "$4\\cos(x) + C$", "$-4\\cos(x) + C$"], "Integrar coseno da seno, sin signo menos."),
      p("Calcula $\\int \\cos(3x)\\,dx$.", "$\\dfrac{\\operatorname{sen}(3x)}{3} + C$", ["$3\\operatorname{sen}(3x) + C$", "$\\operatorname{sen}(3x) + C$", "$-\\dfrac{\\operatorname{sen}(3x)}{3} + C$"], "Se divide entre el 3 de adentro."),
      p("¿Cuál es la derivada de $\\operatorname{sen}(x)$?", "$\\cos(x)$", ["$-\\cos(x)$", "$-\\operatorname{sen}(x)$", "$\\operatorname{sen}(x)$"], "Derivar seno da coseno."),
      p("Al integrar el seno, ¿dónde va el signo menos?", "Delante del coseno del resultado", ["Delante del seno", "No lleva signo menos", "En la constante C"], "$\\int \\operatorname{sen}(x)\\,dx = -\\cos(x) + C$."),
    ],
  },
  {
    slug: "calculia-clase-sustitucion",
    grupo: "integrales",
    orden: 30,
    requierePro: true,
    nombre: "Integración por sustitución: el cambio de variable u",
    descripcion: "Cómo detectar cuándo sirve, elegir $u$, cambiar $dx$ por $du$, integrar y volver a x, con ejemplos como los de la Práctica.",
    pasos: [
      "La sustitución es la regla de la cadena al revés. Sirve cuando dentro de la integral hay una función compuesta y, multiplicando, la derivada de lo de adentro (o un múltiplo de ella).",
      "Paso 1: elige $u$ igual a lo de adentro. Paso 2: deriva para obtener $du$ y despeja $dx$. Paso 3: reescribe toda la integral en $u$ (no debe quedar ninguna x). Paso 4: integra. Paso 5: vuelve a poner lo de adentro en lugar de $u$.",
      "Ejemplo resuelto: en $\\int 12(3x-1)^{3}\\,dx$, con $u = 3x-1$ se tiene $du = 3\\,dx$, así que $dx = \\dfrac{du}{3}$. Queda $\\int 4u^{3}\\,du$, que da $u^{4} + C$, es decir, $(3x-1)^{4} + C$.",
      "Comprobación con la regla de la cadena: $((3x-1)^{4})' = 4(3x-1)^{3}\\cdot 3 = 12(3x-1)^{3}$. Por eso $\\int 12(3x-1)^{3}\\,dx = (3x-1)^{4} + C$.",
      "Con la x multiplicando afuera: en $\\int 2x(x^{2}+1)^{5}\\,dx$, con $u = x^{2}+1$ el $du$ reemplaza justo a $2x\\,dx$. Resultado: $\\int 2x(x^{2}+1)^{5}\\,dx = \\dfrac{(x^{2}+1)^{6}}{6} + C$.",
      "Errores comunes: olvidar cambiar $dx$ (y quedarse con un factor de más o de menos); dejar mezcladas x y $u$; y no volver a x al final. Comprueba siempre derivando el resultado.",
    ],
    visuales: [
      cuadros(2, "Sustitución en $\\int 12(3x-1)^3\\,dx$", [
        { texto: "Elige $u$", formula: "u = 3x-1" },
        { texto: "El 12 es 4 veces la derivada de $u$", formula: "(3x-1)' = 3" },
        { texto: "Integra en $u$ y vuelve a x", formula: "\\int 12(3x-1)^3\\,dx = (3x-1)^4 + C" },
      ]),
      { tipo: "calculia.area", despuesDePaso: 3, titulo: "Área bajo $12(3x-1)^3$ entre $0{,}5$ y 1", funcion: [{ tipo: "factorLineal", c: 12, a: 3, b: -1, n: 3 }], desde: 0.5, hasta: 1 },
    ],
    quiz: [
      p("Calcula $\\int 8(2x+1)^{3}\\,dx$.", "$(2x+1)^{4} + C$", ["$2(2x+1)^{4} + C$", "$4(2x+1)^{4} + C$", "$8(2x+1)^{3} + C$"], "$u = 2x+1$, $du = 2\\,dx$: queda $\\int 4u^{3}\\,du = u^{4} + C$."),
      p("Calcula $\\int 6x(x^{2}-4)^{2}\\,dx$.", "$(x^{2}-4)^{3} + C$", ["$3(x^{2}-4)^{3} + C$", "$2x(x^{2}-4)^{3} + C$", "$(x^{2}-4)^{2} + C$"], "$u = x^{2}-4$, $du = 2x\\,dx$: queda $\\int 3u^{2}\\,du = u^{3} + C$."),
      p("En $\\int 15(5x+2)^{2}\\,dx$, ¿qué conviene llamar $u$?", "$5x+2$", ["$15$", "$(5x+2)^{2}$", "$x$"], "$u$ es lo de adentro; su derivada (5) divide al 15."),
      p("Si $u = 4x - 7$, ¿por qué expresión se cambia $dx$?", "$\\dfrac{du}{4}$", ["$4\\,du$", "$du$", "$-7\\,du$"], "$du = 4\\,dx$, así que $dx = \\dfrac{du}{4}$."),
      p("¿Qué es lo último que hay que hacer en una sustitución?", "Volver a escribir el resultado en x", ["Derivar $u$", "Sumar 1 al exponente", "Multiplicar por $du$"], "El resultado tiene que quedar en la variable original."),
    ],
  },

  // ---------------- Series ----------------
  {
    slug: "calculia-clase-sucesiones-y-series",
    grupo: "series",
    orden: 32,
    requierePro: true,
    nombre: "Sucesiones, series y sumas parciales",
    descripcion: "Qué es una sucesión, qué significa sumar infinitos términos, cómo se usan las sumas parciales para decidir si una serie converge, y por qué los términos tienen que tender a 0.",
    pasos: [
      "Una sucesión es una lista infinita de números con una regla: $a_{n} = \\dfrac{1}{n}$ da $1, \\dfrac{1}{2}, \\dfrac{1}{3}, \\dots$ Una serie es la suma de todos sus términos: $\\sum_{n=1}^{\\infty} a_{n}$.",
      "No se pueden sumar infinitos números de una vez, así que se miran las sumas parciales: $S_{1}$ es el primer término, $S_{2}$ la suma de los dos primeros, $S_{3}$ la de los tres primeros, y así. $S_{n}$ es la suma de los primeros n términos.",
      "Si las sumas parciales se acercan a un número, la serie converge y su suma es ese número. Si crecen sin límite o no se estabilizan, diverge.",
      "Ejemplo: $1 + \\dfrac{1}{2} + \\dfrac{1}{4} + \\dfrac{1}{8} + \\dots$ tiene sumas parciales $1, \\dfrac{3}{2}, \\dfrac{7}{4}, \\dfrac{15}{8}$..., cada vez más cerca de 2: converge a 2.",
      "Condición necesaria: si una serie converge, sus términos tienden a 0. Por eso $1 + 1 + 1 + \\dots$ y $1 - 1 + 1 - 1 + \\dots$ divergen. Pero no alcanza: la serie armónica $1 + \\dfrac{1}{2} + \\dfrac{1}{3} + \\dots$ tiene términos que tienden a 0 y aun así diverge.",
      "Errores comunes: confundir la sucesión (los términos) con la serie (su suma); pensar que si los términos se achican la serie converge siempre (la armónica muestra que no); y creer que una suma infinita siempre da infinito.",
    ],
    visuales: [{ tipo: "calculia.serie", despuesDePaso: 3, titulo: "Sumas parciales de $1 + \\frac{1}{2} + \\frac{1}{4} + \\dots$", a: 1, rNum: 1, rDen: 2, terminos: 8 }],
    quiz: [
      p("¿Cuánto vale $S_{3}$ para la serie $2 + 4 + 6 + 8 + \\dots$?", "12", ["6", "20", "8"], "La suma de los tres primeros términos: $2 + 4 + 6 = 12$."),
      p("¿Qué diferencia hay entre una sucesión y una serie?", "La serie es la suma de los términos de la sucesión", ["Son lo mismo", "La sucesión es infinita y la serie no", "La serie solo tiene números positivos"], "La sucesión es la lista; la serie, su suma."),
      p("Si los términos de una serie no tienden a 0, la serie...", "Diverge", ["Converge", "Puede converger o divergir"], "Tender a 0 es condición necesaria para converger."),
      p("Los términos de la serie armónica tienden a 0. ¿La serie converge?", "No, diverge", ["Sí, converge a 1", "Sí, converge a 2"], "Que los términos tiendan a 0 no alcanza: la armónica diverge."),
      p("Las sumas parciales de $1 + \\dfrac{1}{2} + \\dfrac{1}{4} + \\dots$ se acercan a...", "2", ["1", "$\\dfrac{3}{2}$", "Infinito"], "Es una geométrica con razón un medio: $\\dfrac{1}{1-\\frac{1}{2}} = 2$."),
    ],
  },
  {
    slug: "calculia-clase-serie-p",
    grupo: "series",
    orden: 34,
    requierePro: true,
    nombre: "La serie p y la serie armónica",
    descripcion: "Cuándo converge $\\sum \\dfrac{1}{n^{p}}$, por qué la armónica diverge aunque sus términos tiendan a 0, y cómo distinguirla de una geométrica.",
    pasos: [
      "Una serie p tiene la forma $\\sum_{n=1}^{\\infty} \\dfrac{1}{n^{p}}$, con $p$ un número fijo. Con $p = 2$ es $1 + \\dfrac{1}{4} + \\dfrac{1}{9} + \\dots$; con $p = 1$ es la serie armónica.",
      "La regla: converge si $p > 1$ y diverge si $p \\leq 1$. Es todo lo que hace falta para clasificarla.",
      "Por qué la armónica diverge: agrupa sus términos. $\\dfrac{1}{3} + \\dfrac{1}{4} > \\dfrac{1}{2}$, y $\\dfrac{1}{5} + \\dfrac{1}{6} + \\dfrac{1}{7} + \\dfrac{1}{8} > \\dfrac{1}{2}$, y así siempre: sumas infinitos bloques que superan un medio, y la suma crece sin límite.",
      "Con $p = 2$ las sumas parciales se estabilizan cerca de $1{,}64$; con $p = 0{,}5$ crecen todavía más rápido que la armónica. Un $p$ mayor achica más rápido los términos.",
      "No la confundas con la geométrica: en $\\dfrac{1}{n^{2}}$ la $n$ está en la base y el exponente es fijo (serie p); en $\\left(\\dfrac{1}{2}\\right)^{n}$ la $n$ está en el exponente (geométrica).",
      "Errores comunes: decir que $p = 1$ converge porque los términos tienden a 0; aplicar la fórmula $\\dfrac{a}{1-r}$ a una serie p (solo vale para geométricas); y confundir $p > 1$ con $p \\geq 1$.",
    ],
    visuales: [
      cuadros(2, "Converge o diverge según p", [
        { texto: "$p = 2$", formula: "1 + \\dfrac{1}{4} + \\dfrac{1}{9} + \\dfrac{1}{16} + \\dots", resaltar: "Con 10 términos suma $1{,}55$: converge" },
        { texto: "$p = 1$, la armónica", formula: "1 + \\dfrac{1}{2} + \\dfrac{1}{3} + \\dfrac{1}{4} + \\dots", resaltar: "Con 1000 términos ya pasa de 7: diverge" },
        { texto: "Agrupando la armónica", formula: "\\dfrac{1}{3} + \\dfrac{1}{4} > \\dfrac{1}{2}" },
      ]),
    ],
    quiz: [
      p("¿La serie $\\sum \\dfrac{1}{n^{4}}$ converge o diverge?", "Converge", ["Diverge"], "Serie p con $p = 4 > 1$."),
      p("¿La serie $\\sum \\dfrac{1}{n^{0{,}5}}$ converge o diverge?", "Diverge", ["Converge"], "Serie p con $p = 0{,}5 \\leq 1$."),
      p("¿Por qué diverge la serie armónica?", "Sus términos se agrupan en infinitos bloques mayores que un medio", ["Porque sus términos no tienden a 0", "Porque $p > 1$", "Porque es geométrica"], "Cada bloque suma más de un medio, y hay infinitos bloques."),
      p("¿Cuál de estas es una serie p?", "$\\sum \\dfrac{1}{n^{3}}$", ["$\\sum \\left(\\dfrac{1}{3}\\right)^{n}$", "$\\sum 3^{n}$", "$\\sum \\dfrac{3}{2^{n}}$"], "En la serie p la $n$ está en la base con exponente fijo."),
      p("¿Para qué valores de $p$ diverge la serie p?", "$p \\leq 1$", ["$p > 1$", "$p < 0$", "Solo $p = 1$"], "Diverge exactamente cuando $p \\leq 1$."),
    ],
  },
  {
    slug: "calculia-clase-criterio-de-la-razon",
    grupo: "series",
    orden: 35,
    requierePro: true,
    nombre: "El criterio de la razón",
    descripcion: "Cómo comparar cada término con el siguiente para decidir si una serie converge, qué hacer cuando el límite es 1 y cómo se aplica a $a_{n} = c\\cdot r^{n}$, el caso de la Práctica.",
    pasos: [
      "Idea: si a partir de cierto punto cada término es una fracción fija del anterior, menor que 1, los términos se achican como en una geométrica convergente. El criterio de la razón mide esa fracción.",
      "Se calcula $L = \\lim_{n\\to\\infty}\\left|\\dfrac{a_{n+1}}{a_{n}}\\right|$. Si $L < 1$, converge; si $L > 1$, diverge; si L vale 1, el criterio no decide.",
      "En la Práctica las sucesiones son $a_{n} = c\\cdot r^{n}$. Al dividir un término entre el anterior, la $c$ se cancela y queda $r$, así que L es el valor absoluto de $r$.",
      "Ejemplo resuelto: para $a_{n} = 7\\cdot\\left(-\\dfrac{3}{4}\\right)^{n}$ el cociente es menos tres cuartos y su valor absoluto es $0{,}75$, menor que 1: converge.",
      "Con otra forma: para $a_{n} = \\dfrac{2^{n}}{n}$, el cociente es $\\dfrac{2n}{n+1}$, que tiende a 2. Como L es 2, mayor que 1, diverge.",
      "Errores comunes: olvidar el valor absoluto (con razón negativa, L es positivo); invertir el cociente ($\\dfrac{a_{n}}{a_{n+1}}$ da el inverso y cambia la conclusión); y concluir algo cuando L es 1: la armónica y la serie p con $p = 2$ dan las dos 1, y una diverge y la otra converge.",
    ],
    visuales: [{ tipo: "calculia.serie", despuesDePaso: 2, titulo: "$a_n = 4\\cdot\\left(\\frac{1}{2}\\right)^n$: L es $\\frac{1}{2}$ y converge", a: 2, rNum: 1, rDen: 2, terminos: 8 }],
    quiz: [
      p("Para $a_{n} = 6\\cdot\\left(\\dfrac{2}{5}\\right)^{n}$, ¿cuánto vale L?", "0,4", ["6", "2,4", "2,5"], "La $c = 6$ se cancela y L es $\\dfrac{2}{5} = 0{,}4$."),
      p("Para $a_{n} = 3\\cdot\\left(-\\dfrac{5}{4}\\right)^{n}$, ¿qué dice el criterio de la razón?", "Diverge", ["Converge", "El criterio no decide"], "L es $\\dfrac{5}{4}$, mayor que 1."),
      p("Si L vale 1, ¿qué concluye el criterio de la razón?", "Nada: hay que usar otro criterio", ["Que converge", "Que diverge"], "Con L igual a 1 hay series que convergen y otras que divergen."),
      p("¿Por qué en $a_{n} = c\\cdot r^{n}$ el valor de $c$ no importa para L?", "Porque se cancela al dividir", ["Porque siempre vale 1", "Porque es negativo", "Porque está en el exponente"], "$\\dfrac{c\\cdot r^{n+1}}{c\\cdot r^{n}} = r$."),
      p("Para $a_{n} = 2\\cdot\\left(-\\dfrac{1}{3}\\right)^{n}$, ¿cuánto vale L?", "$\\dfrac{1}{3}$", ["$-\\dfrac{1}{3}$", "$\\dfrac{2}{3}$", "3"], "Valor absoluto de la razón: $\\dfrac{1}{3}$."),
    ],
  },

  // ---------------- Multivariable y EDOs ----------------
  {
    slug: "calculia-clase-parciales-polinomios",
    grupo: "multivariable",
    orden: 37,
    requierePro: true,
    nombre: "Derivadas parciales de polinomios en x e y",
    descripcion: "Cómo derivar respecto de una variable un polinomio con varios términos mixtos, qué pasa con los términos sin esa variable y cómo leer el resultado.",
    pasos: [
      "Una función de dos variables, como $f(x,y) = 3x^{2}y + 5xy^{3} - 2y^{2}$, da un valor para cada par (x, y). Su derivada parcial respecto de x mide cómo cambia $f$ si mueves solo x.",
      "Para $\\dfrac{\\partial f}{\\partial x}$, la y es un número fijo: deriva cada término con la regla de la potencia en x y deja las potencias de y multiplicando sin cambios.",
      "Término a término: $3x^{2}y$ da $6xy$; $5xy^{3}$ da $5y^{3}$; $-2y^{2}$ no tiene x y da 0. Resultado: la parcial respecto de x es $6xy + 5y^{3}$.",
      "Respecto de y, al revés: $3x^{2}y$ da $3x^{2}$; $5xy^{3}$ da $15xy^{2}$; $-2y^{2}$ da $-4y$. Resultado: la parcial respecto de y es $3x^{2} + 15xy^{2} - 4y$.",
      "Interpretación: en el punto (1, 2), la parcial respecto de x vale $6\\cdot 1\\cdot 2 + 5\\cdot 2^{3} = 52$. Si mueves un poquito x con y fija en 2, $f$ cambia unas 52 veces lo que moviste.",
      "Errores comunes: derivar también la otra variable (multiplicar por los dos exponentes); hacer desaparecer la otra variable en vez de dejarla multiplicando; y olvidar que un término sin la variable de la parcial da 0.",
    ],
    visuales: [
      cuadros(2, "Respecto de x en $3x^2y + 5xy^3 - 2y^2$", [
        { texto: "$3x^2y$", formula: "6xy" },
        { texto: "$5xy^3$: la $y^3$ se queda", formula: "5y^3" },
        { texto: "$-2y^2$ no tiene x", formula: "0", resaltar: "Total: $6xy + 5y^3$" },
      ]),
    ],
    quiz: [
      p("Para $f(x,y) = 2x^{3}y^{2} + 4y$, calcula $\\dfrac{\\partial f}{\\partial x}$.", "$6x^{2}y^{2}$", ["$6x^{2}y^{2} + 4$", "$12x^{2}y$", "$6x^{2}$"], "$2x^{3}y^{2}$ da $6x^{2}y^{2}$ y $4y$ no tiene x."),
      p("Para $f(x,y) = 2x^{3}y^{2} + 4y$, calcula $\\dfrac{\\partial f}{\\partial y}$.", "$4x^{3}y + 4$", ["$4x^{3}y$", "$6x^{2}y^{2} + 4$", "$12x^{2}y + 4$"], "$2x^{3}y^{2}$ da $4x^{3}y$ y $4y$ da 4."),
      p("Para $f(x,y) = x^{2} + xy + y^{2}$, calcula $\\dfrac{\\partial f}{\\partial x}$.", "$2x + y$", ["$2x + 2y$", "$2x$", "$x + 2y$"], "$x^{2}$ da $2x$, $xy$ da $y$ e $y^{2}$ da 0."),
      p("Al calcular $\\dfrac{\\partial f}{\\partial x}$, ¿qué pasa con $y^{3}$ dentro de $5xy^{3}$?", "Se queda multiplicando igual", ["Desaparece", "Se deriva a $3y^{2}$", "Se vuelve 1"], "Para la parcial en x, $y^{3}$ es un número fijo."),
      p("Para $f(x,y) = 3x^{2}y + 5xy^{3} - 2y^{2}$, ¿cuánto vale $\\dfrac{\\partial f}{\\partial x}$ en (1, 2)?", "52", ["12", "40", "56"], "$6\\cdot 1\\cdot 2 + 5\\cdot 2^{3} = 12 + 40 = 52$."),
    ],
  },
  {
    slug: "calculia-clase-que-es-una-edo",
    grupo: "multivariable",
    orden: 38,
    requierePro: true,
    nombre: "¿Qué es una ecuación diferencial?",
    descripcion: "Una ecuación cuya incógnita es una función: qué significa resolverla, por qué la solución general lleva una constante y cómo comprobar una solución.",
    pasos: [
      "En una ecuación común la incógnita es un número. En una ecuación diferencial (EDO) la incógnita es una función $y(x)$, y la ecuación relaciona $y$ con su derivada. Por ejemplo: $\\dfrac{dy}{dx} = 2x$.",
      "Resolverla es encontrar todas las funciones que la cumplen. Para $\\dfrac{dy}{dx} = 2x$ basta integrar: $y = x^{2} + C$. Hay infinitas soluciones, una por cada valor de $C$: esa familia es la solución general.",
      "Para comprobar una solución, deriva y reemplaza. Con $x^{2} + 3$: $(x^{2} + 3)' = 2x$, que es lo que pide la ecuación.",
      "Muchas EDO mezclan $y$ con su derivada, como $\\dfrac{dy}{dx} = 3y$: la derivada depende de la función misma. Su solución general es $y = A\\cdot e^{3x}$. Comprobación con A igual a 1: $(e^{3x})' = 3e^{3x}$.",
      "Una condición inicial elige una sola curva de la familia: si además y vale 5 en x igual a 0, entonces A es 5 (porque $e^{0} = 1$) y la solución es $y = 5e^{3x}$.",
      "Errores comunes: olvidar la constante (sin ella falta toda la familia de soluciones); confundir la EDO con su solución; y no comprobar: derivar la solución propuesta y reemplazar siempre dice si está bien.",
    ],
    visuales: [{ tipo: "calculia.edo", despuesDePaso: 3, titulo: "Familia de soluciones de $\\dfrac{dy}{dx} = 3y$", k: 3, n: 0, x0: 0.3, rango: [-1, 0.8] }],
    quiz: [
      p("¿Qué es la incógnita en una ecuación diferencial?", "Una función", ["Un número", "Una derivada en un punto", "Una constante"], "Se busca una función $y(x)$ que cumpla la ecuación."),
      p("¿Cuál es la solución general de $\\dfrac{dy}{dx} = 6x^{2}$?", "$y = 2x^{3} + C$", ["$y = 12x + C$", "$y = 6x^{3} + C$", "$y = 2x^{3}$"], "Integrando $6x^{2}$ sale $2x^{3}$, y la solución general lleva la constante."),
      p("¿Es $y = 4e^{2x}$ solución de $\\dfrac{dy}{dx} = 2y$?", "Sí", ["No"], "Su derivada es $8e^{2x}$, que es 2 veces $4e^{2x}$."),
      p("¿Para qué sirve una condición inicial?", "Para elegir una sola solución de la familia", ["Para derivar la ecuación", "Para eliminar la derivada", "Para saber si la EDO es separable"], "Fija el valor de la constante."),
      p("¿Por qué la solución general lleva una constante?", "Porque al integrar aparece una constante arbitraria", ["Porque toda función tiene una", "Porque la derivada de la constante es 1", "Porque así se escribe la condición inicial"], "Dos soluciones que difieren en esa constante tienen la misma derivada."),
    ],
  },
  {
    slug: "calculia-clase-crecimiento-exponencial",
    grupo: "multivariable",
    orden: 40,
    requierePro: true,
    nombre: "Crecimiento y decaimiento exponencial",
    descripcion: "El modelo de EDO más usado, la derivada proporcional a la función: cómo resolverlo separando variables, qué significan sus constantes y dónde aparece (poblaciones, dinero, isótopos).",
    pasos: [
      "La ecuación $\\dfrac{dy}{dx} = k\\cdot y$ dice que la cantidad cambia en proporción a lo que hay. Es el caso $n = 0$ de las EDO separables $\\dfrac{dy}{dx} = k\\cdot x^{n}\\cdot y$ de la Práctica.",
      "Separando variables: $\\dfrac{dy}{y} = k\\,dx$. Integrando los dos lados, el logaritmo de y es $kx$ más una constante; despejando, $y = A\\cdot e^{kx}$.",
      "Interpretación: $A$ es el valor inicial (cuando x vale 0) y $k$ la tasa. Con $k > 0$ es crecimiento (una población, un capital con interés compuesto); con $k < 0$ es decaimiento (un isótopo radiactivo, un medicamento que se elimina).",
      "Ejemplo: una colonia de 200 bacterias crece con $k = 0{,}5$ por hora. Entonces $y = 200e^{0{,}5x}$ y, a las 2 horas, hay $200e$, unas 544 bacterias.",
      "Tiempo de duplicación: con $k > 0$ la cantidad se duplica cada $\\dfrac{\\ln 2}{k}$ unidades de tiempo. Con $k = 0{,}5$, cada $1{,}39$ horas aproximadamente.",
      "Errores comunes: escribir $e^{kx} + A$ (la constante multiplica, no suma); confundir el signo de $k$ con el de $A$; y olvidar que $A$ es el valor en x igual a 0.",
    ],
    visuales: [
      { tipo: "calculia.edo", despuesDePaso: 2, titulo: "Crecimiento: $\\dfrac{dy}{dx} = y$", k: 1, n: 0, x0: 0.5, rango: [-1.2, 1.2] },
      { tipo: "calculia.edo", despuesDePaso: 2, titulo: "Decaimiento: $\\dfrac{dy}{dx} = -y$", k: -1, n: 0, x0: 0.5, rango: [-1.2, 1.2] },
    ],
    quiz: [
      p("¿Cuál es la solución general de $\\dfrac{dy}{dx} = -2y$?", "$y = A\\cdot e^{-2x}$", ["$y = A\\cdot e^{2x}$", "$y = -2x + A$", "$y = e^{-2x} + A$"], "La derivada es $-2$ veces la función: $A\\cdot e^{-2x}$."),
      p("En $y = A\\cdot e^{kx}$ con $k < 0$, la cantidad...", "Decrece con el tiempo", ["Crece con el tiempo", "Se queda igual", "Oscila"], "Con $k$ negativo, la exponencial se achica."),
      p("Si $y = 300e^{0{,}1x}$, ¿cuánto vale y en x igual a 0?", "300", ["0", "30", "1"], "$e^{0} = 1$, así que y vale 300."),
      p("¿Qué caso de $\\dfrac{dy}{dx} = k\\cdot x^{n}\\cdot y$ es el crecimiento exponencial?", "$n = 0$", ["$n = 1$", "$k = 0$", "$n = -1$"], "Con $n = 0$, $x^{0} = 1$ y queda $\\dfrac{dy}{dx} = k\\cdot y$."),
      p("Con $k = 0{,}5$, ¿cada cuánto se duplica la cantidad, aproximadamente?", "1,39", ["2", "0,5", "0,69"], "$\\dfrac{\\ln 2}{0{,}5} \\approx 1{,}39$."),
    ],
  },
];
