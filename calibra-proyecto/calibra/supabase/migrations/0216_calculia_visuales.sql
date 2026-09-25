-- ============================================================
-- Prodigia — Calculia: visuales animados en Aprender (docs/PARIDAD_MUNDOS.md,
-- fila 23 y la sección "Calculia: visuales en Aprender").
--
-- Las 12 lecciones de Calculia (5 Técnicas y 7 Clases) eran solo texto. Esta
-- migración agrega `contenido.visuales` a cada una y cubre los huecos entre la
-- práctica y las lecciones (integrales con coeficiente en 1/x, seno y coseno,
-- integral definida, criterio de la razón y EDO dy/dx = k·x^n·y con n hasta 4).
--
-- Es un merge (`contenido || ...`) que escribe `pasos` y `visuales`:
--  - `pasos`: cuatro Clases ganan pasos NUEVOS AL FINAL (integrales desde cero:
--    1/x con coeficiente e integral definida; integrales avanzadas: seno y coseno
--    con coeficiente; series geométricas: criterio de la razón; EDOs separables:
--    caso general, n = 3 y n = 4, y k distinto de n+1), sin reordenar ni tocar los
--    existentes; el resto de las lecciones repite su texto (ya en español neutro,
--    igual que lo deja 0221, que corre después y es idempotente).
--  - `quiz`: NO se toca (se valida por igualdad exacta en
--    /api/aprender/completar).
-- No cambian nombre, descripción, orden ni requiere_pro.
--
-- Visuales: los propios "calculia.tangente" (pendiente de la recta tangente),
-- "calculia.area" (integral como área), "calculia.serie" (sumas parciales) y
-- "calculia.edo" (familia de soluciones de una EDO separable), más el primitivo
-- genérico "cuadros" para las reglas paso a paso. Todo número sale de funciones
-- puras (src/lib/calculia/visualesDatos.ts) verificadas contra diferencias
-- finitas, Simpson y sumas directas.
--
-- Este archivo se GENERA desde src/lib/calculia/lecciones/ (fuente única) y
-- lecciones.test.ts comprueba que coincida. No editar a mano.
-- Regenerar: CALCULIA_ESCRIBIR_SQL=1 npx vitest run src/lib/calculia/lecciones
-- Requiere que existan las 12 filas (0165 y 0170). Idempotente: volver a correrla
-- deja el mismo resultado.
-- ============================================================

update public.techniques
set contenido = contenido || $calculia${
  "pasos": [
    "¿Es una sola potencia de x (como $5x^4$)? Es la regla de la potencia: baja el exponente como factor y réstale 1 al exponente.",
    "¿Son dos expresiones MULTIPLICADAS entre sí (como $(2x)(3x^2)$)? Es la regla del producto — nunca multipliques las derivadas por separado.",
    "¿Es una división de dos expresiones? Es la regla del cociente — el orden de la resta en el numerador importa (alto por bajo, menos bajo por alto).",
    "¿Hay algo elevado a una potencia, y adentro del paréntesis no es solo x (como $(3x+2)^4$)? Es la regla de la cadena — nunca te olvides de multiplicar por la derivada de adentro."
  ],
  "visuales": [
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
  ]
}$calculia$::jsonb
where slug = 'calculia-reconocer-regla-derivacion' and problem_type = 'calculia';

update public.techniques
set contenido = contenido || $calculia${
  "pasos": [
    "$\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1} + C$ — sube el exponente uno y divide por el exponente nuevo (nunca el viejo).",
    "$\\int \\dfrac{1}{x}\\,dx = \\ln|x| + C$ — el único caso donde la potencia no funciona (n=-1 haría dividir por cero).",
    "$\\int e^x\\,dx = e^x + C$ — la única función que es su propia integral; con $e^{kx}$ se agrega un factor $1/k$ adelante.",
    "$\\int \\cos(x)\\,dx = \\sin(x) + C$ y $\\int \\sin(x)\\,dx = -\\cos(x) + C$ — el signo negativo va SOLO en la integral del seno, nunca en la del coseno.",
    "Si dudas el signo de una trigonométrica, deriva la respuesta mentalmente y fíjate si te devuelve el integrando original."
  ],
  "visuales": [
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
  ]
}$calculia$::jsonb
where slug = 'calculia-tabla-integrales-comunes' and problem_type = 'calculia';

update public.techniques
set contenido = contenido || $calculia${
  "pasos": [
    "¿Cada término se multiplica por la misma razón $r$ para llegar al siguiente (como 3, 6, 12, 24...)? Es geométrica — converge si y solo si $|r|<1$.",
    "¿Es 1 sobre n elevado a una potencia p (como $\\sum 1/n^2$)? Es una serie p — converge si y solo si $p>1$.",
    "¿La razón entre un término y el anterior tiende a un número fijo cuando n crece? Ahí aplica el criterio de la razón — el límite de ese cociente decide.",
    "Para una serie geométrica, la suma infinita es siempre $S=\\dfrac{a}{1-r}$ — solo tiene sentido si ya sabes que converge."
  ],
  "visuales": [
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
  ]
}$calculia$::jsonb
where slug = 'calculia-identificar-tipo-serie' and problem_type = 'calculia';

update public.techniques
set contenido = contenido || $calculia${
  "pasos": [
    "Mira si puedes reescribir $\\dfrac{dy}{dx}=f(x)\\cdot g(y)$ — si es así, la ecuación es separable, sin excepción.",
    "Pasa todo lo de y (incluido dy) a un lado, y todo lo de x (incluido dx) al otro: $\\dfrac{dy}{g(y)}=f(x)\\,dx$.",
    "Integra cada lado por separado, con su propia constante — las dos constantes se juntan en una sola al final.",
    "Si aparece $\\ln|y|$ de un lado, despejar y significa aplicar exponencial en ambos lados — ahí es donde nace el factor $e^C$ que se vuelve la constante A."
  ],
  "visuales": [
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
  ]
}$calculia$::jsonb
where slug = 'calculia-separar-variables-edo' and problem_type = 'calculia';

update public.techniques
set contenido = contenido || $calculia${
  "pasos": [
    "Si te piden $\\partial f/\\partial x$, todo lo que sea potencia de y (incluida y sola) se comporta como si fuera un coeficiente constante — no se deriva ni desaparece.",
    "Un término como $3x^2y$ se deriva respecto de x igual que $3y\\cdot x^2$: queda $6xy$.",
    "El error más común es derivar las DOS variables a la vez — si te piden $\\partial/\\partial x$, la potencia de y del resultado tiene que quedar IGUAL que en el original.",
    "Truco rápido: tapa con un dedo la letra que no te pidieron, deriva lo que queda visible como si fuera una sola variable, después destapa."
  ],
  "visuales": [
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
  ]
}$calculia$::jsonb
where slug = 'calculia-derivar-parciales' and problem_type = 'calculia';

update public.techniques
set contenido = contenido || $calculia${
  "pasos": [
    "La derivada de $f(x)$ en un punto es la pendiente de la recta tangente ahí — qué tan rápido cambia $f(x)$ cuando x cambia un poquito. No es un truco algebraico suelto: es una medida de razón de cambio.",
    "Regla de la potencia: si $f(x) = c\\cdot x^{n}$, entonces $f'(x) = c\\cdot n\\cdot x^{n-1}$. Se baja el exponente como factor multiplicando al coeficiente, y se le resta 1 al exponente.",
    "Ejemplo resuelto: deriva $f(x) = 5x^{4}$. Coeficiente $c=5$, exponente $n=4$. Aplicando la regla: $f'(x) = 5\\cdot 4\\cdot x^{4-1} = 20x^{3}$.",
    "Verificación rápida: el exponente de la derivada SIEMPRE es uno menos que el original (4 $\\to 3$), y el coeficiente nuevo es el coeficiente viejo multiplicado por el exponente viejo $(5\\cdot 4=20)$ — si tu resultado no cumple las dos cosas, revisa el paso.",
    "Caso especial: la derivada de una constante sola (como $f(x)=7$, que es $7\\cdot x^{0}$) es siempre 0 — no hay pendiente porque la función no cambia nunca.",
    "Error común a evitar: olvidarse de restar 1 al exponente (dejar $x^{4}$ en vez de $x^{3}$) o no multiplicar por el exponente original — son los dos errores más frecuentes de esta regla."
  ],
  "visuales": [
    {
      "tipo": "calculia.tangente",
      "despuesDePaso": 0,
      "titulo": "La derivada es la pendiente de la recta tangente",
      "funcion": [
        {
          "tipo": "potencia",
          "c": 1,
          "n": 2
        }
      ],
      "x0": 1.5,
      "rango": [
        -0.5,
        3
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 2,
      "titulo": "Regla de la potencia con $f(x)=5x^4$",
      "cuadros": [
        {
          "texto": "$c=5$ y $n=4$",
          "formula": "f(x) = 5x^4"
        },
        {
          "texto": "Baja el exponente y réstale 1",
          "formula": "f'(x) = 5\\cdot 4\\cdot x^{4-1}"
        },
        {
          "texto": "Multiplica",
          "formula": "f'(x) = 20x^3",
          "resaltar": "En $x=1$ la pendiente es $20$"
        }
      ]
    },
    {
      "tipo": "calculia.tangente",
      "despuesDePaso": 3,
      "titulo": "$f(x)=5x^4$ en $x=1$",
      "funcion": [
        {
          "tipo": "potencia",
          "c": 5,
          "n": 4
        }
      ],
      "x0": 1,
      "rango": [
        0,
        1.6
      ]
    }
  ]
}$calculia$::jsonb
where slug = 'calculia-pro-derivadas-fundamentos' and problem_type = 'calculia';

update public.techniques
set contenido = contenido || $calculia${
  "pasos": [
    "Regla del producto: si $f(x) = u(x)\\cdot v(x)$, entonces $f'(x) = u'(x)\\cdot v(x) + u(x)\\cdot v'(x)$ — la derivada del primero por el segundo SIN derivar, más el primero SIN derivar por la derivada del segundo. Nunca derives u y v por separado y los multipliques entre sí, eso da un resultado distinto.",
    "Ejemplo resuelto (producto): deriva $f(x) = (2x)(3x^{2})$. $u=2x$, $u'=2$; $v=3x^{2}$, $v'=6x$. $f'(x) = 2\\cdot 3x^{2} + 2x\\cdot 6x = 6x^{2} + 12x^{2} = 18x^{2}$.",
    "Regla del cociente: si $f(x) = \\frac{u(x)}{v(x)}$, entonces $f'(x) = \\frac{u'v - uv'}{v^{2}}$ — el orden de la resta en el numerador importa (derivada de arriba por abajo, MENOS arriba por derivada de abajo).",
    "Regla de la cadena: si $f(x) = (\\text{algo con } x)^{n}$ donde ese \"algo\" no es simplemente x, hay una función adentro de otra. Se deriva la función de afuera dejando lo de adentro igual, y se multiplica por la derivada de adentro.",
    "Ejemplo resuelto (cadena): deriva $f(x) = (3x+2)^{4}$. La de afuera es $(\\text{adentro})^{4} \\to 4(\\text{adentro})^{3}$; la derivada de adentro $(3x+2)$ es $3$. Entonces $f'(x) = 4(3x+2)^{3}\\cdot 3 = 12(3x+2)^{3}$.",
    "Cómo elegir la regla correcta de un vistazo: ¿es una multiplicación de dos expresiones? Producto. ¿Es una división? Cociente. ¿Hay un paréntesis elevado a una potencia con algo más que x adentro? Cadena — y nunca te olvides del factor de adentro."
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 1,
      "titulo": "Producto: $(2x)(3x^2)$",
      "cuadros": [
        {
          "texto": "$u=2x$, $u'=2$ y $v=3x^2$, $v'=6x$"
        },
        {
          "texto": "Aplica la regla",
          "formula": "u'v + uv' = 2\\cdot 3x^2 + 2x\\cdot 6x"
        },
        {
          "texto": "Suma",
          "formula": "f'(x) = 6x^2 + 12x^2 = 18x^2",
          "resaltar": "Comprobación: $(2x)(3x^2) = 6x^3$ y $(6x^3)' = 18x^2$"
        }
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 2,
      "titulo": "Cociente: $\\dfrac{x^2+1}{x+3}$",
      "cuadros": [
        {
          "texto": "$u=x^2+1$, $u'=2x$ y $v=x+3$, $v'=1$"
        },
        {
          "texto": "Arriba menos abajo, en ese orden",
          "formula": "\\dfrac{u'v - uv'}{v^2} = \\dfrac{2x(x+3) - (x^2+1)\\cdot 1}{(x+3)^2}"
        },
        {
          "texto": "Simplifica el numerador",
          "formula": "f'(x) = \\dfrac{x^2+6x-1}{(x+3)^2}",
          "resaltar": "En $x=1$ la pendiente es $\\dfrac{6}{16} = \\dfrac{3}{8}$"
        }
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 4,
      "titulo": "Cadena: $(3x+2)^4$",
      "cuadros": [
        {
          "texto": "Afuera: baja el exponente y déjalo con la expresión de adentro",
          "formula": "4(3x+2)^3"
        },
        {
          "texto": "Adentro: la derivada de $3x+2$ es $3$"
        },
        {
          "texto": "Multiplica",
          "formula": "f'(x) = 4(3x+2)^3\\cdot 3 = 12(3x+2)^3",
          "resaltar": "En $x=0$ la pendiente es $12\\cdot 2^3 = 96$"
        }
      ]
    },
    {
      "tipo": "calculia.tangente",
      "despuesDePaso": 4,
      "titulo": "Otra cadena: $f(x)=(2x+1)^3$ en $x=0$",
      "funcion": [
        {
          "tipo": "factorLineal",
          "c": 1,
          "a": 2,
          "b": 1,
          "n": 3
        }
      ],
      "x0": 0,
      "rango": [
        -1,
        0.8
      ]
    }
  ]
}$calculia$::jsonb
where slug = 'calculia-pro-derivadas-producto-cociente-cadena' and problem_type = 'calculia';

update public.techniques
set contenido = contenido || $calculia${
  "pasos": [
    "Integrar es el proceso INVERSO de derivar: $\\int f(x)\\,dx$ busca una función F(x) cuya derivada sea $f(x)$. Por eso siempre se agrega \"+ C\" — cualquier constante desaparece al derivar, así que hay infinitas respuestas válidas que difieren solo en una constante.",
    "Regla de la potencia (integrales): $\\int x^{n}\\,dx = \\frac{x^{n+1}}{n+1} + C$, siempre que $n \\neq -1$. Subes el exponente en 1, y divides por ese exponente NUEVO (nunca por el viejo).",
    "Ejemplo resuelto: calcula $\\int 6x^{2}\\,dx$. Exponente $n=2$, sube a 3; coeficiente 6 dividido por 3 (el exponente nuevo) da 2. Entonces $\\int 6x^{2}\\,dx = 2x^{3} + C$.",
    "Verificación (siempre se puede chequear derivando la respuesta): la derivada de $2x^{3}$ es $2\\cdot 3\\cdot x^{2} = 6x^{2}$, que es exactamente el integrando original — confirma que la antiderivada está bien.",
    "Caso especial $n=-1$: $\\int (\\frac{1}{x})\\,dx = \\ln|x| + C$ — es el único caso donde la fórmula de arriba no funciona, porque dividir por $(n+1)=0$ sería indefinido.",
    "Error común: copiar el integrando tal cual como si ya fuera la respuesta (sin integrar de verdad), o subir el exponente pero olvidarse de dividir por el exponente nuevo.",
    "Con un coeficiente k arriba, $\\int \\frac{k}{x}\\,dx = k\\ln|x| + C$: el número k sale de la integral como factor y solo se integra $\\frac{1}{x}$. Ejemplo resuelto: $\\int \\frac{4}{x}\\,dx = 4\\ln|x| + C$. Verificación: la derivada de $4\\ln|x|$ es $4\\cdot\\frac{1}{x} = \\frac{4}{x}$, el integrando original. Errores comunes: dejar $\\ln|x| + C$ sin el coeficiente, o copiar el integrando $\\frac{4}{x} + C$.",
    "Integral definida: si $F$ es una antiderivada de $f$, entonces $\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)$ — se evalúa la antiderivada en el extremo derecho y se resta su valor en el izquierdo. No lleva \"+ C\": la constante se cancela en la resta. Ejemplo resuelto: $\\int_{0}^{2} 6x^{2}\\,dx$. Una antiderivada es $F(x) = 2x^{3}$, así que $F(2) - F(0) = 16 - 0 = 16$. Ese 16 es el área bajo la curva entre 0 y 2 (el dibujo la va rellenando)."
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 0,
      "titulo": "Integrar deshace derivar",
      "cuadros": [
        {
          "texto": "Derivar",
          "formula": "F(x) = 2x^3 \\;\\longrightarrow\\; F'(x) = 6x^2"
        },
        {
          "texto": "Integrar deshace esa derivación",
          "formula": "6x^2 \\;\\longrightarrow\\; \\int 6x^2\\,dx = 2x^3 + C"
        }
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 2,
      "titulo": "Ejemplo: $\\int 6x^2\\,dx$",
      "cuadros": [
        {
          "texto": "El exponente $2$ sube a $3$; el coeficiente se divide entre $3$",
          "formula": "\\int 6x^2\\,dx = \\dfrac{6}{3}x^3 + C"
        },
        {
          "texto": "Simplifica",
          "formula": "\\int 6x^2\\,dx = 2x^3 + C"
        }
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 3,
      "titulo": "Comprobación",
      "cuadros": [
        {
          "texto": "Deriva la respuesta",
          "formula": "(2x^3)' = 2\\cdot 3x^2 = 6x^2",
          "resaltar": "Es el integrando original"
        }
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 6,
      "titulo": "Con coeficiente: $\\int \\dfrac{4}{x}\\,dx$",
      "cuadros": [
        {
          "texto": "El $4$ sale como factor y solo se integra $\\dfrac{1}{x}$",
          "formula": "\\int \\dfrac{4}{x}\\,dx = 4\\ln|x| + C"
        },
        {
          "texto": "Deriva la respuesta",
          "formula": "(4\\ln|x|)' = 4\\cdot\\dfrac{1}{x} = \\dfrac{4}{x}",
          "resaltar": "Es el integrando original"
        }
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 7,
      "titulo": "Integral definida: $\\int_0^2 6x^2\\,dx$",
      "cuadros": [
        {
          "texto": "Una antiderivada de $6x^2$",
          "formula": "F(x) = 2x^3"
        },
        {
          "texto": "Evalúa en los extremos y resta",
          "formula": "F(2) - F(0) = 2\\cdot 2^3 - 2\\cdot 0^3 = 16",
          "resaltar": "El área bajo la curva es $16$"
        }
      ]
    },
    {
      "tipo": "calculia.area",
      "despuesDePaso": 7,
      "titulo": "La integral como área: $\\int_0^2 6x^2\\,dx$",
      "funcion": [
        {
          "tipo": "potencia",
          "c": 6,
          "n": 2
        }
      ],
      "desde": 0,
      "hasta": 2
    }
  ]
}$calculia$::jsonb
where slug = 'calculia-pro-integrales-fundamentos' and problem_type = 'calculia';

update public.techniques
set contenido = contenido || $calculia${
  "pasos": [
    "$\\int e^{ax}\\,dx = \\frac{1}{a}e^{ax} + C$ — la exponencial es la única función que reaparece intacta al derivar, pero con coeficiente a adentro hay que dividir por a al integrar (se puede verificar derivando: la derivada de $\\frac{1}{a}e^{ax}$ es $(\\frac{1}{a})\\cdot a\\cdot e^{ax} = e^{ax}$, correcto).",
    "$\\int \\cos(x)\\,dx = \\operatorname{sen}(x) + C$, y $\\int \\operatorname{sen}(x)\\,dx = -\\cos(x) + C$ — el signo negativo va SOLO en la integral del seno, nunca en la del coseno. Si dudas, deriva la respuesta: la derivada de $\\operatorname{sen}(x)$ es $\\cos(x)$ (correcto), la derivada de $-\\cos(x)$ es $\\operatorname{sen}(x)$ (correcto).",
    "Sustitución simple (u $= ax+b$): sirve cuando el integrando es una potencia de una expresión LINEAL, como $(ax+b)^{n}$. La fórmula es $\\int (ax+b)^{n}\\,dx = (\\frac{1}{a(n+1)})(ax+b)^{n+1} + C$.",
    "Ejemplo resuelto: calcula $\\int 8(2x+1)^{3}\\,dx$. Acá $a=2$, $n=3$, y el coeficiente 8 ya incluye el factor $a(n+1)=2\\cdot 4=8$ — así que el coeficiente que queda en la respuesta es $\\frac{8}{8}=1$. Resultado: $(2x+1)^{4} + C$.",
    "Verificación: la derivada de $(2x+1)^{4}$ es $4(2x+1)^{3}\\cdot 2$ (regla de la cadena) $= 8(2x+1)^{3}$, que es exactamente el integrando original.",
    "Cómo no perderse: identifica primero si hay una potencia externa con un binomio linear adentro (pide sustitución), si es $e^{ax}$ (pide dividir por a), o si es seno/coseno (cuidado con el signo) — nunca se mezclan las tres reglas en el mismo paso.",
    "Cuando el seno o el coseno traen un coeficiente k, el número sale como factor: $\\int k\\cos(x)\\,dx = k\\operatorname{sen}(x) + C$ y $\\int k\\operatorname{sen}(x)\\,dx = -k\\cos(x) + C$. Ejemplos resueltos: $\\int 5\\cos(x)\\,dx = 5\\operatorname{sen}(x) + C$ y $\\int 7\\operatorname{sen}(x)\\,dx = -7\\cos(x) + C$. El signo negativo sigue yendo solo en la integral del seno, y el coeficiente nunca se pierde: quedarse con $-\\cos(x) + C$ sin el 7 es un error."
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 0,
      "titulo": "Exponencial: $\\int e^{3x}\\,dx$",
      "cuadros": [
        {
          "texto": "Con $a=3$ hay que dividir entre $3$",
          "formula": "\\int e^{3x}\\,dx = \\dfrac{1}{3}e^{3x} + C"
        },
        {
          "texto": "Deriva la respuesta",
          "formula": "\\left(\\dfrac{1}{3}e^{3x}\\right)' = \\dfrac{1}{3}\\cdot 3\\,e^{3x} = e^{3x}",
          "resaltar": "Vuelve el integrando"
        }
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 1,
      "titulo": "Seno y coseno: cuida el signo",
      "cuadros": [
        {
          "texto": "$(\\operatorname{sen}(x))' = \\cos(x)$",
          "formula": "\\int \\cos(x)\\,dx = \\operatorname{sen}(x) + C"
        },
        {
          "texto": "$(-\\cos(x))' = \\operatorname{sen}(x)$",
          "formula": "\\int \\operatorname{sen}(x)\\,dx = -\\cos(x) + C",
          "resaltar": "El signo negativo solo va en la integral del seno"
        }
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 3,
      "titulo": "Sustitución: $\\int 8(2x+1)^3\\,dx$",
      "cuadros": [
        {
          "texto": "Con $a=2$ y $n=3$, el factor es $\\dfrac{1}{a(n+1)} = \\dfrac{1}{8}$"
        },
        {
          "texto": "El coeficiente $8$ se cancela con ese factor",
          "formula": "8\\cdot\\dfrac{1}{8}(2x+1)^4 + C = (2x+1)^4 + C"
        }
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 4,
      "titulo": "Comprobación con la regla de la cadena",
      "cuadros": [
        {
          "texto": "Deriva la respuesta",
          "formula": "\\left((2x+1)^4\\right)' = 4(2x+1)^3\\cdot 2 = 8(2x+1)^3",
          "resaltar": "Es el integrando original"
        }
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 6,
      "titulo": "Con coeficiente: seno y coseno",
      "cuadros": [
        {
          "texto": "El $5$ sale como factor; la derivada lo confirma",
          "formula": "\\int 5\\cos(x)\\,dx = 5\\operatorname{sen}(x) + C",
          "resaltar": "$(5\\operatorname{sen}(x))' = 5\\cos(x)$"
        },
        {
          "texto": "El $7$ también sale, y el signo negativo se queda en el seno",
          "formula": "\\int 7\\operatorname{sen}(x)\\,dx = -7\\cos(x) + C",
          "resaltar": "$(-7\\cos(x))' = 7\\operatorname{sen}(x)$"
        }
      ]
    },
    {
      "tipo": "calculia.area",
      "despuesDePaso": 4,
      "titulo": "Área bajo $8(2x+1)^3$ entre $0$ y $1$",
      "funcion": [
        {
          "tipo": "factorLineal",
          "c": 8,
          "a": 2,
          "b": 1,
          "n": 3
        }
      ],
      "desde": 0,
      "hasta": 1
    }
  ]
}$calculia$::jsonb
where slug = 'calculia-pro-integrales-avanzadas' and problem_type = 'calculia';

update public.techniques
set contenido = contenido || $calculia${
  "pasos": [
    "Una serie geométrica tiene la forma $a + ar + ar^{2} + ar^{3} + \\cdots$ — cada término se multiplica por la misma razón r para llegar al siguiente. Converge (tiene una suma finita) si y solo si $|r| < 1$.",
    "Fórmula de la suma infinita (solo válida si $|r|<1$): $S = \\frac{a}{1-r}$, donde a es el primer término.",
    "Ejemplo resuelto: calcula la suma de la serie geométrica con primer término $a=4$ y razón $r=\\frac{1}{2}$. Primero se confirma que converge: $\\left|\\frac{1}{2}\\right|<1$, sí converge. Luego: $S = \\frac{4}{1-\\frac{1}{2}} = \\frac{4}{\\frac{1}{2}} = 8$.",
    "Si $|r| \\geq 1$ la serie geométrica DIVERGE (no tiene suma finita) — no tiene sentido aplicar la fórmula $\\frac{a}{1-r}$ en ese caso, daría un número sin significado real.",
    "Una serie p, $\\sum \\frac{1}{n^{p}}$, es un tipo distinto de serie (no geométrica) — converge si y solo si $p>1$. No confundir el criterio: para geométricas es $|r|<1$, para series p es $p>1$.",
    "Ejemplo de clasificación: la serie p con $p=3$ ($\\sum \\frac{1}{n^{3}}$) converge porque 3>1. La serie geométrica con $r=2$ diverge porque $|2|\\geq 1$ (cada término es más grande que el anterior, nunca se estabiliza).",
    "Criterio de la razón: para los términos $a_{n}$ se calcula $L = \\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_{n}}\\right|$, el valor al que se acerca el cociente entre un término y el anterior. Si $L<1$ la serie converge, si $L>1$ diverge y si $L=1$ el criterio no decide.",
    "Ejemplo resuelto: para $a_{n} = 3\\cdot\\left(\\frac{2}{3}\\right)^{n}$ el cociente es $\\frac{a_{n+1}}{a_{n}} = \\frac{3\\cdot(2/3)^{n+1}}{3\\cdot(2/3)^{n}} = \\frac{2}{3}$ para todo n (el 3 y las potencias comunes se cancelan), así que $L=\\frac{2}{3}<1$ y la serie converge. Cuando $a_{n} = c\\cdot r^{n}$ siempre sale $L=|r|$: para $a_{n} = 5\\cdot\\left(-\\frac{3}{2}\\right)^{n}$ da $L=\\frac{3}{2}=1.5>1$ y la serie diverge."
  ],
  "visuales": [
    {
      "tipo": "calculia.serie",
      "despuesDePaso": 1,
      "titulo": "$8 - 4 + 2 - 1 + \\cdots$: $r=-\\dfrac{1}{2}$",
      "a": 8,
      "rNum": -1,
      "rDen": 2,
      "terminos": 10
    },
    {
      "tipo": "calculia.serie",
      "despuesDePaso": 2,
      "titulo": "$4 + 2 + 1 + \\cdots$: $S = \\dfrac{4}{1-\\frac{1}{2}} = 8$",
      "a": 4,
      "rNum": 1,
      "rDen": 2,
      "terminos": 10
    },
    {
      "tipo": "calculia.serie",
      "despuesDePaso": 3,
      "titulo": "$1 + 2 + 4 + 8 + \\cdots$: $|r| \\geq 1$",
      "a": 1,
      "rNum": 2,
      "rDen": 1,
      "terminos": 8
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 5,
      "titulo": "Serie $p$ y serie geométrica, lado a lado",
      "cuadros": [
        {
          "texto": "Serie $p$ con $p=3$: como $3>1$, converge",
          "formula": "1 + \\dfrac{1}{8} + \\dfrac{1}{27} + \\dfrac{1}{64} + \\cdots",
          "resaltar": "Suma de los primeros $10$ términos: $1.1975$"
        },
        {
          "texto": "Serie geométrica con $r=2$: como $|2|\\geq 1$, diverge",
          "formula": "1 + 2 + 4 + 8 + \\cdots",
          "resaltar": "Cada término es mayor que el anterior"
        }
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 7,
      "titulo": "Criterio de la razón: $a_n = 3\\cdot(2/3)^n$",
      "cuadros": [
        {
          "texto": "El cociente entre un término y el anterior",
          "formula": "\\dfrac{a_{n+1}}{a_n} = \\dfrac{3\\cdot(2/3)^{n+1}}{3\\cdot(2/3)^{n}} = \\dfrac{2}{3}"
        },
        {
          "texto": "Como $\\dfrac{2}{3}<1$, la serie converge"
        },
        {
          "texto": "Con $a_n = 5\\cdot\\left(-\\dfrac{3}{2}\\right)^n$ el valor absoluto de la razón es",
          "formula": "L = \\left|-\\dfrac{3}{2}\\right| = \\dfrac{3}{2}",
          "resaltar": "Como $1.5>1$, la serie diverge"
        }
      ]
    },
    {
      "tipo": "calculia.serie",
      "despuesDePaso": 7,
      "titulo": "$\\sum 3\\cdot(2/3)^n$ desde $n=1$: converge",
      "a": 2,
      "rNum": 2,
      "rDen": 3,
      "terminos": 12
    },
    {
      "tipo": "calculia.serie",
      "despuesDePaso": 7,
      "titulo": "$\\sum 5\\cdot(-3/2)^n$ desde $n=1$: diverge",
      "a": -7.5,
      "rNum": -3,
      "rDen": 2,
      "terminos": 6
    }
  ]
}$calculia$::jsonb
where slug = 'calculia-pro-series-geometricas' and problem_type = 'calculia';

update public.techniques
set contenido = contenido || $calculia${
  "pasos": [
    "Una derivada parcial mide cómo cambia $f(x,y)$ cuando UNA sola variable se mueve y la otra se mantiene fija. Se escribe $\\frac{\\partial f}{\\partial x}$ (respecto de x) o $\\frac{\\partial f}{\\partial y}$ (respecto de y).",
    "La técnica es exactamente la regla de la potencia de siempre — el único cambio de hábito es tratar la otra letra como si fuera un número fijo (un coeficiente constante), nunca derivarla ni hacerla desaparecer.",
    "Ejemplo resuelto: calcula $\\frac{\\partial f}{\\partial x}$ para $f(x,y) = 3x^{2}y^{3}$. Tratando $y^{3}$ como constante: es como derivar $3(y^{3})\\cdot x^{2}$ respecto de $x \\to 3(y^{3})\\cdot 2\\cdot x = 6xy^{3}$. Entonces $\\frac{\\partial f}{\\partial x} = 6xy^{3}$.",
    "Ahora $\\frac{\\partial f}{\\partial y}$ de la MISMA función $f(x,y) = 3x^{2}y^{3}$: tratando $x^{2}$ como constante, derivas $3(x^{2})\\cdot y^{3}$ respecto de y $\\to 3(x^{2})\\cdot 3\\cdot y^{2} = 9x^{2}y^{2}$. Entonces $\\frac{\\partial f}{\\partial y} = 9x^{2}y^{2}$.",
    "Verificación de que no te comiste la otra variable: en $\\frac{\\partial f}{\\partial x}$, la potencia de y $(y^{3})$ debe quedar EXACTAMENTE igual que en la función original — si desapareció, es el error más común de esta técnica.",
    "Truco rápido: tapa con un dedo la letra que no te pidieron, deriva lo que queda visible como si fuera una función de una sola variable, después destapa y multiplica."
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 2,
      "titulo": "$\\dfrac{\\partial f}{\\partial x}$ de $f(x,y)=3x^2y^3$",
      "cuadros": [
        {
          "texto": "$y^3$ es un coeficiente fijo",
          "formula": "\\dfrac{\\partial f}{\\partial x} = 3y^3\\cdot 2x = 6xy^3"
        },
        {
          "texto": "Evalúa en $(1,2)$",
          "formula": "\\dfrac{\\partial f}{\\partial x}(1,2) = 6\\cdot 1\\cdot 2^3 = 48"
        }
      ]
    },
    {
      "tipo": "calculia.tangente",
      "despuesDePaso": 2,
      "titulo": "Con $y=2$ fija: $f(x,2) = 3x^2\\cdot 2^3 = 24x^2$",
      "funcion": [
        {
          "tipo": "potencia",
          "c": 24,
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
      "titulo": "$\\dfrac{\\partial f}{\\partial y}$ de la misma función",
      "cuadros": [
        {
          "texto": "$x^2$ es un coeficiente fijo",
          "formula": "\\dfrac{\\partial f}{\\partial y} = 3x^2\\cdot 3y^2 = 9x^2y^2"
        },
        {
          "texto": "Evalúa en $(1,2)$",
          "formula": "\\dfrac{\\partial f}{\\partial y}(1,2) = 9\\cdot 1^2\\cdot 2^2 = 36"
        }
      ]
    }
  ]
}$calculia$::jsonb
where slug = 'calculia-pro-multivariable-parciales' and problem_type = 'calculia';

update public.techniques
set contenido = contenido || $calculia${
  "pasos": [
    "Una EDO (ecuación diferencial ordinaria) separable es aquella donde $\\frac{dy}{dx}$ se puede reescribir como $f(x)\\cdot g(y)$ — un factor que solo tiene x, multiplicado por otro que solo tiene y. Si puedes hacer eso, siempre se puede resolver por separación de variables.",
    "Paso 1: reordenar para dejar todo lo de $y$ (incluido $dy$) de un lado, y todo lo de $x$ (incluido $dx$) del otro: $\\frac{dy}{g(y)} = f(x)\\,dx$.",
    "Paso 2: integrar cada lado por separado, cada uno con su propia constante — las dos constantes se combinan en una sola al final.",
    "Ejemplo resuelto: resuelve $\\frac{dy}{dx} = 2xy$. Separando: $\\frac{dy}{y} = 2x\\,dx$. Integrando ambos lados: $\\ln|y| = x^{2} + C_{1}$ (usando la regla de la potencia de integrales del lado derecho, y $\\int \\frac{dy}{y} = \\ln|y|$ del lado izquierdo).",
    "Paso 3 (despejar $y$): aplicar exponencial en ambos lados de $\\ln|y| = x^{2} + C_{1}$ da $|y| = e^{x^{2}+C_{1}} = e^{C_{1}}\\cdot e^{x^{2}}$. Como $e^{C_{1}}$ es solo otra constante positiva, se renombra como $A$: $y = A\\cdot e^{x^{2}}$.",
    "Verificación: si $y = A\\cdot e^{x^{2}}$, entonces $\\frac{dy}{dx} = A\\cdot e^{x^{2}}\\cdot 2x = 2x\\cdot y$ (usando que $A\\cdot e^{x^{2}}=y$) — coincide exactamente con la ecuación original $\\frac{dy}{dx} = 2xy$, confirma que la solución está bien.",
    "La misma receta sirve para cualquier ecuación $\\frac{dy}{dx} = k\\cdot x^{n}\\cdot y$. Separando: $\\frac{dy}{y} = k\\cdot x^{n}\\,dx$. Integrando con la regla de la potencia (el exponente nuevo es $n+1$): $\\ln|y| = \\frac{k}{n+1}x^{n+1} + C_{1}$. Con la exponencial y $A = e^{C_{1}}$: $y = A\\cdot e^{\\frac{k}{n+1}x^{n+1}}$.",
    "Ejemplos con exponentes mayores. Con $n=3$: $\\frac{dy}{dx} = 4x^{3}y$ da $\\frac{k}{n+1} = \\frac{4}{4} = 1$ y la solución es $y = A\\cdot e^{x^{4}}$. Con $n=4$: $\\frac{dy}{dx} = 5x^{4}y$ da $\\frac{5}{5} = 1$ y $y = A\\cdot e^{x^{5}}$. En los dos casos el exponente de x sube en 1, igual que en $2xy$ y $3x^{2}y$.",
    "Cuando k no es igual a $n+1$, el cociente $\\frac{k}{n+1}$ queda como coeficiente del exponente. Ejemplo: $\\frac{dy}{dx} = 8x^{3}y$ da $\\frac{8}{4} = 2$ y $y = A\\cdot e^{2x^{4}}$. Verificación: la derivada de $A\\cdot e^{2x^{4}}$ es $A\\cdot e^{2x^{4}}\\cdot 8x^{3}$, y como $y = A\\cdot e^{2x^{4}}$, eso es $8x^{3}y$, la ecuación original. Errores comunes: dejar $e^{8x^{4}}$ (sin dividir por $n+1$) o $e^{2x^{3}}$ (sin subir el exponente de x)."
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 3,
      "titulo": "Resolver $\\dfrac{dy}{dx} = 2xy$",
      "cuadros": [
        {
          "texto": "Separa las variables",
          "formula": "\\dfrac{dy}{y} = 2x\\,dx"
        },
        {
          "texto": "Integra cada lado",
          "formula": "\\ln|y| = x^2 + C_1"
        },
        {
          "texto": "Aplica la exponencial y renombra $A = e^{C_1}$",
          "formula": "y = A\\,e^{x^2}"
        }
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 5,
      "titulo": "Verificación",
      "cuadros": [
        {
          "texto": "Deriva la solución",
          "formula": "y' = A\\,e^{x^2}\\cdot 2x = 2x\\,y",
          "resaltar": "Coincide con la ecuación original"
        }
      ]
    },
    {
      "tipo": "calculia.edo",
      "despuesDePaso": 5,
      "k": 2,
      "n": 1,
      "x0": 1
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 6,
      "titulo": "Caso general: $\\dfrac{dy}{dx} = k\\,x^n\\,y$",
      "cuadros": [
        {
          "texto": "Separa las variables",
          "formula": "\\dfrac{dy}{y} = k\\,x^n\\,dx"
        },
        {
          "texto": "Integra con la regla de la potencia",
          "formula": "\\ln|y| = \\dfrac{k}{n+1}\\,x^{n+1} + C_1"
        },
        {
          "texto": "Aplica la exponencial y renombra $A = e^{C_1}$",
          "formula": "y = A\\,e^{\\frac{k}{n+1}x^{n+1}}"
        }
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 7,
      "titulo": "Resolver $\\dfrac{dy}{dx} = 4x^3\\,y$",
      "cuadros": [
        {
          "texto": "Separa las variables",
          "formula": "\\dfrac{dy}{y} = 4x^3\\,dx"
        },
        {
          "texto": "Integra cada lado: $\\dfrac{4}{4} = 1$",
          "formula": "\\ln|y| = x^4 + C_1"
        },
        {
          "texto": "Aplica la exponencial y renombra $A = e^{C_1}$",
          "formula": "y = A\\,e^{x^4}"
        }
      ]
    },
    {
      "tipo": "calculia.edo",
      "despuesDePaso": 7,
      "titulo": "$n=3$: $\\dfrac{dy}{dx} = 4x^3\\,y$",
      "k": 4,
      "n": 3,
      "x0": 1
    },
    {
      "tipo": "calculia.edo",
      "despuesDePaso": 7,
      "titulo": "$n=4$: $\\dfrac{dy}{dx} = 5x^4\\,y$",
      "k": 5,
      "n": 4,
      "x0": 1
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 8,
      "titulo": "Con coeficiente: $\\dfrac{dy}{dx} = 8x^3\\,y$",
      "cuadros": [
        {
          "texto": "Aquí $\\dfrac{8}{4} = 2$",
          "formula": "y = A\\,e^{2x^4}"
        },
        {
          "texto": "Deriva la solución",
          "formula": "y' = A\\,e^{2x^4}\\cdot 8x^3 = 8x^3\\,y",
          "resaltar": "Coincide con la ecuación original"
        }
      ]
    },
    {
      "tipo": "calculia.edo",
      "despuesDePaso": 8,
      "titulo": "$\\dfrac{dy}{dx} = 8x^3\\,y$: $y = A\\,e^{2x^4}$",
      "k": 8,
      "n": 3,
      "x0": 0.8,
      "rango": [
        -1,
        1
      ]
    }
  ]
}$calculia$::jsonb
where slug = 'calculia-pro-edos-separables' and problem_type = 'calculia';
