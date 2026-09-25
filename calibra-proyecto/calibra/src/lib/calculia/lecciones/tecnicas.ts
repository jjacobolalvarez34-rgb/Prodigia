// Las 5 Técnicas rápidas (gratis) de Calculia: EXACTAMENTE el contenido ya
// sembrado en la base (`pasos` de 0165 con la notación LaTeX de 0181, `quiz` de
// 0178 con la notación LaTeX de 0195). lecciones.test.ts lo compara contra esas
// migraciones. Lo único nuevo de este retrofit son los `visuales` (migración
// 0216, generada por sql.ts). Los `pasos` de estas Técnicas conservan el voseo
// original (deuda histórica documentada en PARIDAD_MUNDOS.md): no se reescribe.

import type { LeccionCalculia } from "./tipos";

export const TECNICAS_CALCULIA: LeccionCalculia[] = [
  {
    slug: "calculia-reconocer-regla-derivacion",
    grupo: "derivadas",
    orden: 1,
    requierePro: false,
    nombre: "Reconocer de un vistazo la regla de derivación correcta",
    descripcion: "Antes de derivar nada, mira la FORMA de la expresión — eso ya te dice qué regla usar, sin tener que probar varias.",
    pasos: [
      "¿Es una sola potencia de x (como $5x^4$)? Es la regla de la potencia: baja el exponente como factor y réstale 1 al exponente.",
      "¿Son dos expresiones MULTIPLICADAS entre sí (como $(2x)(3x^2)$)? Es la regla del producto — nunca multipliques las derivadas por separado.",
      "¿Es una división de dos expresiones? Es la regla del cociente — el orden de la resta en el numerador importa (alto por bajo, menos bajo por alto).",
      "¿Hay algo elevado a una potencia, y adentro del paréntesis no es solo x (como $(3x+2)^4$)? Es la regla de la cadena — nunca te olvides de multiplicar por la derivada de adentro.",
    ],
    quiz: [
      {
        pregunta: "¿Qué regla de derivación corresponde a $f(x) = (2x)(3x^{2})$?",
        opciones: ["Regla del producto", "Regla de la potencia", "Regla del cociente", "Regla de la cadena"],
        respuesta: "Regla del producto",
        explicacion: "Son dos expresiones MULTIPLICADAS entre sí — eso siempre pide la regla del producto, nunca multiplicar las derivadas por separado.",
      },
      {
        pregunta: "¿Qué regla corresponde a $f(x) = (3x+2)^{4}$?",
        opciones: ["Regla de la cadena", "Regla de la potencia sola", "Regla del producto", "Regla del cociente"],
        respuesta: "Regla de la cadena",
        explicacion: "Hay algo elevado a una potencia y adentro del paréntesis no es solo x — es una función dentro de otra, la señal clásica de la regla de la cadena.",
      },
      {
        pregunta: "¿Qué regla corresponde a $f(x) = 5x^{4}$?",
        opciones: ["Regla de la potencia", "Regla del producto", "Regla del cociente", "Regla de la cadena"],
        respuesta: "Regla de la potencia",
        explicacion: "Es una sola potencia de x, sin nada multiplicado, dividido, ni un paréntesis con algo distinto de x adentro.",
      },
    ],
    visuales: [
      {
        "tipo": "cuadros",
        "despuesDePaso": 3,
        "titulo": "Cuatro formas, cuatro reglas",
        "cuadros": [
          {
            "texto": "Una sola potencia de $x$: regla de la potencia",
            "formula": "\\dfrac{d}{dx}\\,5x^4 = 20x^3"
          },
          {
            "texto": "Dos expresiones multiplicadas: regla del producto",
            "formula": "\\dfrac{d}{dx}\\,(2x)(3x^2) = 2\\cdot 3x^2 + 2x\\cdot 6x = 18x^2"
          },
          {
            "texto": "Una división de expresiones: regla del cociente",
            "formula": "\\dfrac{d}{dx}\\,\\dfrac{x^2+1}{x+3} = \\dfrac{2x(x+3)-(x^2+1)\\cdot 1}{(x+3)^2} = \\dfrac{x^2+6x-1}{(x+3)^2}"
          },
          {
            "texto": "Un paréntesis elevado a una potencia, con algo más que $x$ adentro: regla de la cadena",
            "formula": "\\dfrac{d}{dx}\\,(3x+2)^4 = 4(3x+2)^3\\cdot 3 = 12(3x+2)^3",
            "resaltar": "Mira la forma y elige la regla"
          }
        ]
      }
    ],
  },
  {
    slug: "calculia-tabla-integrales-comunes",
    grupo: "integrales",
    orden: 2,
    requierePro: false,
    nombre: "Tabla mental de las 5 integrales más comunes",
    descripcion: "Cinco formas que aparecen todo el tiempo — memorizadas de memoria, ahorran tener que derivar al revés cada vez.",
    pasos: [
      "$\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1} + C$ — sube el exponente uno y divide por el exponente nuevo (nunca el viejo).",
      "$\\int \\dfrac{1}{x}\\,dx = \\ln|x| + C$ — el único caso donde la potencia no funciona (n=-1 haría dividir por cero).",
      "$\\int e^x\\,dx = e^x + C$ — la única función que es su propia integral; con $e^{kx}$ se agrega un factor $1/k$ adelante.",
      "$\\int \\cos(x)\\,dx = \\sin(x) + C$ y $\\int \\sin(x)\\,dx = -\\cos(x) + C$ — el signo negativo va SOLO en la integral del seno, nunca en la del coseno.",
      "Si dudas el signo de una trigonométrica, deriva la respuesta mentalmente y fíjate si te devuelve el integrando original.",
    ],
    quiz: [
      {
        pregunta: "¿Cuál es la fórmula de $\\int x^{n}\\,dx$ (con $n \\neq -1$)?",
        opciones: ["$\\frac{x^{n+1}}{n+1} + C$", "$\\frac{x^{n-1}}{n-1} + C$", "$n\\cdot x^{n-1} + C$", "$x^{n} + C$"],
        respuesta: "$\\frac{x^{n+1}}{n+1} + C$",
        explicacion: "Subes el exponente uno $(n+1)$ y divides por ese exponente NUEVO, nunca por el viejo.",
      },
      {
        pregunta: "¿Por qué $\\int (\\frac{1}{x})\\,dx$ no se resuelve con la regla de la potencia?",
        opciones: ["Porque sería $n=-1$, y dividir por $(n+1)=0$ no tiene sentido", "Porque $\\frac{1}{x}$ no es una potencia de x", "Porque siempre da 0", "Porque hace falta una calculadora"],
        respuesta: "Porque sería $n=-1$, y dividir por $(n+1)=0$ no tiene sentido",
        explicacion: "Es el único caso especial de la tabla: $\\int (\\frac{1}{x})\\,dx = \\ln|x| + C$, distinto de la fórmula general de potencias.",
      },
      {
        pregunta: "¿En cuál de las dos integrales trigonométricas va el signo negativo?",
        opciones: ["$\\int \\operatorname{sen}(x)\\,dx = -\\cos(x) + C$", "$\\int \\cos(x)\\,dx = -\\operatorname{sen}(x) + C$", "En ninguna de las dos", "En las dos"],
        respuesta: "$\\int \\operatorname{sen}(x)\\,dx = -\\cos(x) + C$",
        explicacion: "El signo negativo va SOLO en la integral del seno — $\\int \\cos(x)\\,dx = \\operatorname{sen}(x) + C$ nunca lleva signo negativo.",
      },
    ],
    visuales: [
      {
        "tipo": "cuadros",
        "despuesDePaso": 4,
        "titulo": "Cada integral se comprueba derivando",
        "cuadros": [
          {
            "texto": "Potencia (con $n=2$): sube el exponente y divide por el nuevo",
            "formula": "\\int 6x^2\\,dx = 2x^3 + C",
            "resaltar": "Comprobación: $(2x^3)' = 6x^2$"
          },
          {
            "texto": "El caso especial $n=-1$",
            "formula": "\\int \\dfrac{1}{x}\\,dx = \\ln|x| + C",
            "resaltar": "Comprobación: $(\\ln|x|)' = \\dfrac{1}{x}$"
          },
          {
            "texto": "Exponencial con $k=3$: aparece el factor $\\dfrac{1}{3}$",
            "formula": "\\int e^{3x}\\,dx = \\dfrac{1}{3}e^{3x} + C",
            "resaltar": "Comprobación: $\\left(\\dfrac{1}{3}e^{3x}\\right)' = e^{3x}$"
          },
          {
            "texto": "Coseno: sin signo negativo",
            "formula": "\\int \\cos(x)\\,dx = \\operatorname{sen}(x) + C",
            "resaltar": "Comprobación: $(\\operatorname{sen}(x))' = \\cos(x)$"
          },
          {
            "texto": "Seno: el signo negativo va aquí",
            "formula": "\\int \\operatorname{sen}(x)\\,dx = -\\cos(x) + C",
            "resaltar": "Comprobación: $(-\\cos(x))' = \\operatorname{sen}(x)$"
          }
        ]
      }
    ],
  },
  {
    slug: "calculia-identificar-tipo-serie",
    grupo: "series",
    orden: 3,
    requierePro: false,
    nombre: "Identificar el tipo de serie por su forma antes de aplicar un criterio",
    descripcion: "Cada serie tiene una \"pinta\" característica — reconocerla de entrada ahorra probar criterios al azar.",
    pasos: [
      "¿Cada término se multiplica por la misma razón $r$ para llegar al siguiente (como 3, 6, 12, 24...)? Es geométrica — converge si y solo si $|r|<1$.",
      "¿Es 1 sobre n elevado a una potencia p (como $\\sum 1/n^2$)? Es una serie p — converge si y solo si $p>1$.",
      "¿La razón entre un término y el anterior tiende a un número fijo cuando n crece? Ahí aplica el criterio de la razón — el límite de ese cociente decide.",
      "Para una serie geométrica, la suma infinita es siempre $S=\\dfrac{a}{1-r}$ — solo tiene sentido si ya sabes que converge.",
    ],
    quiz: [
      {
        pregunta: "Una serie donde cada término se multiplica por la misma razón r para llegar al siguiente (como 3, 6, 12, 24...) es de tipo...",
        opciones: ["Geométrica", "Serie p", "Ninguna de las dos, hace falta el criterio de la razón siempre", "Aritmética"],
        respuesta: "Geométrica",
        explicacion: "Es la \"pinta\" característica de una serie geométrica: razón constante entre términos consecutivos.",
      },
      {
        pregunta: "¿Cuándo converge una serie geométrica de razón r?",
        opciones: ["Cuando $|r| < 1$", "Cuando $r > 1$", "Siempre converge", "Cuando $r = 1$"],
        respuesta: "Cuando $|r| < 1$",
        explicacion: "Es el criterio de convergencia de una serie geométrica — si $|r| \\geq 1$, diverge.",
      },
      {
        pregunta: "¿Cuándo converge una serie p, $\\sum \\frac{1}{n^{p}}$?",
        opciones: ["Cuando $p > 1$", "Cuando $p < 1$", "Cuando $p = 0$", "Siempre converge"],
        respuesta: "Cuando $p > 1$",
        explicacion: "Es un criterio totalmente distinto al de las series geométricas $(|r|<1)$ — para series p el criterio es $p>1$, no hay que mezclarlos.",
      },
    ],
    visuales: [
      {
        "tipo": "calculia.serie",
        "despuesDePaso": 0,
        "titulo": "$3,\\ 6,\\ 12,\\ 24,\\ \\ldots$: razón $r=2$",
        "a": 3,
        "rNum": 2,
        "rDen": 1,
        "terminos": 6
      },
      {
        "tipo": "cuadros",
        "despuesDePaso": 1,
        "titulo": "Serie $p$: con $p=2$ converge, con $p=1$ no",
        "cuadros": [
          {
            "texto": "Serie $p$ con $p=2$",
            "formula": "1 + \\dfrac{1}{4} + \\dfrac{1}{9} + \\dfrac{1}{16} + \\cdots",
            "resaltar": "Suma de los primeros $10$ términos: $1.55$"
          },
          {
            "texto": "Serie $p$ con $p=1$ (armónica)",
            "formula": "1 + \\dfrac{1}{2} + \\dfrac{1}{3} + \\dfrac{1}{4} + \\cdots",
            "resaltar": "Con $p=1$ no converge: los primeros $1000$ términos ya suman más de $7$"
          }
        ]
      },
      {
        "tipo": "cuadros",
        "despuesDePaso": 2,
        "titulo": "Criterio de la razón con $a_n = 5\\cdot\\left(\\dfrac{1}{2}\\right)^n$",
        "cuadros": [
          {
            "texto": "Divide un término entre el anterior",
            "formula": "\\dfrac{a_{n+1}}{a_n} = \\dfrac{5\\cdot(1/2)^{n+1}}{5\\cdot(1/2)^{n}} = \\dfrac{1}{2}"
          },
          {
            "texto": "El límite del cociente es $\\dfrac{1}{2}$, menor que $1$",
            "resaltar": "Converge"
          }
        ]
      },
      {
        "tipo": "calculia.serie",
        "despuesDePaso": 3,
        "titulo": "$1 + \\dfrac{1}{2} + \\dfrac{1}{4} + \\cdots$: $S = \\dfrac{1}{1-\\frac{1}{2}} = 2$",
        "a": 1,
        "rNum": 1,
        "rDen": 2,
        "terminos": 8
      }
    ],
  },
  {
    slug: "calculia-separar-variables-edo",
    grupo: "multivariable",
    orden: 4,
    requierePro: false,
    nombre: "Separar variables en una EDO: reconocer cuándo es inmediato",
    descripcion: "No toda ecuación diferencial se separa fácil — pero cuando dy/dx es un producto de \"algo con x\" por \"algo con y\", siempre se puede.",
    pasos: [
      "Mira si puedes reescribir $\\dfrac{dy}{dx}=f(x)\\cdot g(y)$ — si es así, la ecuación es separable, sin excepción.",
      "Pasa todo lo de y (incluido dy) a un lado, y todo lo de x (incluido dx) al otro: $\\dfrac{dy}{g(y)}=f(x)\\,dx$.",
      "Integra cada lado por separado, con su propia constante — las dos constantes se juntan en una sola al final.",
      "Si aparece $\\ln|y|$ de un lado, despejar y significa aplicar exponencial en ambos lados — ahí es donde nace el factor $e^C$ que se vuelve la constante A.",
    ],
    quiz: [
      {
        pregunta: "¿Cuándo una EDO $\\frac{dy}{dx}$ es separable?",
        opciones: ["Cuando se puede reescribir como $\\frac{dy}{dx} = f(x)\\cdot g(y)$", "Solo cuando ya tiene y despejada", "Nunca, siempre hace falta un método numérico", "Solo si no tiene ninguna constante"],
        respuesta: "Cuando se puede reescribir como $\\frac{dy}{dx} = f(x)\\cdot g(y)$",
        explicacion: "Si $\\frac{dy}{dx}$ es un producto de \"algo con x\" por \"algo con y\", la ecuación siempre se puede resolver por separación de variables, sin excepción.",
      },
      {
        pregunta: "Al separar variables, ¿qué se hace primero?",
        opciones: ["Pasar todo lo de y (con $dy$) a un lado y todo lo de x (con $dx$) al otro", "Integrar directamente sin reordenar nada", "Derivar ambos lados", "Reemplazar y por una constante"],
        respuesta: "Pasar todo lo de y (con $dy$) a un lado y todo lo de x (con $dx$) al otro",
        explicacion: "Es el paso 1 de la técnica: $\\frac{dy}{g(y)} = f(x)\\,dx$, antes de poder integrar cada lado por separado.",
      },
      {
        pregunta: "Si al integrar te queda $\\ln|y| = x^{2} + C_{1}$, ¿qué operación despeja y?",
        opciones: ["Aplicar exponencial en ambos lados", "Aplicar logaritmo otra vez", "Dividir ambos lados por $x^{2}$", "Restar $C_{1}$ de ambos lados y listo"],
        respuesta: "Aplicar exponencial en ambos lados",
        explicacion: "$e^{\\ln|y|} = e^{x^{2}+C_{1}}$ da $|y| = e^{C_{1}}\\cdot e^{x^{2}}$ — como $e^{C_{1}}$ es solo otra constante, se renombra como $A$: $y = A\\cdot e^{x^{2}}$.",
      },
    ],
    visuales: [
      {
        "tipo": "cuadros",
        "despuesDePaso": 2,
        "titulo": "Separar e integrar $\\dfrac{dy}{dx} = 3x^2y$",
        "cuadros": [
          {
            "texto": "Es separable: $f(x)=3x^2$ y $g(y)=y$",
            "formula": "\\dfrac{dy}{dx} = 3x^2\\,y"
          },
          {
            "texto": "Cada variable con su diferencial",
            "formula": "\\dfrac{dy}{y} = 3x^2\\,dx"
          },
          {
            "texto": "Integra cada lado",
            "formula": "\\ln|y| = x^3 + C_1"
          },
          {
            "texto": "Aplica la exponencial: $e^{C_1}$ es la constante $A$",
            "formula": "y = A\\,e^{x^3}",
            "resaltar": "$A = e^{C_1}$"
          }
        ]
      },
      {
        "tipo": "calculia.edo",
        "despuesDePaso": 3,
        "k": 3,
        "n": 2,
        "x0": 1
      }
    ],
  },
  {
    slug: "calculia-derivar-parciales",
    grupo: "multivariable",
    orden: 5,
    requierePro: false,
    nombre: "Derivar parciales: congelar las otras variables como constantes",
    descripcion: "La derivada parcial es exactamente la misma regla de siempre — el único cambio de hábito es tratar la otra letra como si fuera un número fijo.",
    pasos: [
      "Si te piden $\\partial f/\\partial x$, todo lo que sea potencia de y (incluida y sola) se comporta como si fuera un coeficiente constante — no se deriva ni desaparece.",
      "Un término como $3x^2y$ se deriva respecto de x igual que $3y\\cdot x^2$: queda $6xy$.",
      "El error más común es derivar las DOS variables a la vez — si te piden $\\partial/\\partial x$, la potencia de y del resultado tiene que quedar IGUAL que en el original.",
      "Truco rápido: tapa con un dedo la letra que no te pidieron, deriva lo que queda visible como si fuera una sola variable, después destapa.",
    ],
    quiz: [
      {
        pregunta: "Al calcular $\\frac{\\partial f}{\\partial x}$ de $f(x,y) = 3x^{2}y$, ¿cómo se trata la y?",
        opciones: ["Como si fuera una constante (un coeficiente fijo)", "Se deriva igual que x", "Desaparece del resultado", "Se reemplaza por 0"],
        respuesta: "Como si fuera una constante (un coeficiente fijo)",
        explicacion: "El único cambio de hábito respecto de derivar de siempre es tratar la otra letra como un número fijo — nunca se deriva ni desaparece.",
      },
      {
        pregunta: "¿Cuál es el error más común al calcular una derivada parcial?",
        opciones: ["Derivar las dos variables a la vez, en vez de dejar fija la que no se pidió", "Olvidarse del signo", "Usar la regla del producto", "Multiplicar por 2 de más"],
        respuesta: "Derivar las dos variables a la vez, en vez de dejar fija la que no se pidió",
        explicacion: "Si te piden $\\frac{\\partial}{\\partial x}$, la potencia de y del resultado tiene que quedar EXACTAMENTE igual que en el original — derivarla también es el error típico.",
      },
      {
        pregunta: "Según el truco de \"tapar con un dedo\", ¿qué significa tapar la letra que no te pidieron?",
        opciones: ["Derivar lo que queda visible como si fuera una función de una sola variable", "Borrarla del resultado final", "Reemplazarla por 1", "Sumarle 1 al exponente de esa letra"],
        respuesta: "Derivar lo que queda visible como si fuera una función de una sola variable",
        explicacion: "Es el atajo mental de la técnica: tapas la letra que no te pidieron, derivas lo visible con la regla de siempre, y después destapas sin haber tocado esa letra.",
      },
    ],
    visuales: [
      {
        "tipo": "calculia.tangente",
        "despuesDePaso": 1,
        "titulo": "Con $y=2$ fija: $f(x,2) = 3x^2\\cdot 2 = 6x^2$",
        "funcion": [
          {
            "tipo": "potencia",
            "c": 6,
            "n": 2
          }
        ],
        "x0": 1,
        "rango": [
          -1.5,
          1.5
        ]
      },
      {
        "tipo": "cuadros",
        "despuesDePaso": 3,
        "titulo": "Tapa la letra que no piden",
        "cuadros": [
          {
            "texto": "Quieres $\\dfrac{\\partial f}{\\partial x}$ de $f(x,y)=3x^2y$: la $y$ es un número fijo",
            "formula": "3y\\cdot x^2"
          },
          {
            "texto": "Deriva lo que queda visible",
            "formula": "\\dfrac{\\partial f}{\\partial x} = 3y\\cdot 2x = 6xy"
          },
          {
            "texto": "Ahora tapa la $x$: solo se deriva $y$",
            "formula": "\\dfrac{\\partial f}{\\partial y} = 3x^2\\cdot 1 = 3x^2"
          },
          {
            "texto": "En el punto $(1,2)$",
            "formula": "\\dfrac{\\partial f}{\\partial x} = 6\\cdot 1\\cdot 2 = 12 \\qquad \\dfrac{\\partial f}{\\partial y} = 3\\cdot 1^2 = 3"
          }
        ]
      }
    ],
  },
];
