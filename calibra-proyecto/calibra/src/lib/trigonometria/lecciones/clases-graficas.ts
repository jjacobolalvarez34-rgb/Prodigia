import { frac, aNumero } from "@/lib/trigonometria/fracciones";
import { amplitud, ecuacionTex, lineaMedia, maximo, minimo, multiploPiTex, onda, periodoPi, valorOnda, fracTex, type Onda } from "@/lib/trigonometria/ondas";
import type { ClaseTrigonometria } from "./tipos";
import { m, preg } from "./ayudas";

// Clases del bloque "graficas" (Pro): la función seno y la coseno, amplitud,
// periodo y frecuencia, desfase y desplazamiento vertical, la tangente con sus
// asíntotas y cómo leer y escribir la ecuación de una gráfica. Toda amplitud,
// periodo, máximo y mínimo de los ejemplos y del quiz se CALCULA con ondas.ts
// (contrastado con la función evaluada en sus tests), no se escribe a mano.

const pi = (f: ReturnType<typeof frac>): string => multiploPiTex(f);
const mpi = (f: ReturnType<typeof frac>): string => m(multiploPiTex(f));
const ec = (o: Onda): string => m(ecuacionTex(o));
const num = (f: ReturnType<typeof frac>): string => fracTex(f);
const mnum = (f: ReturnType<typeof frac>): string => m(fracTex(f));
const mper = (o: Onda): string => m(pi(periodoPi(o)));

// Ondas de los ejemplos.
const seno3 = onda("sen", 1, 3); // periodo 2π/3
const seno2 = onda("sen", 1, 2); // periodo π
const cosMedio = onda("cos", 1, frac(1, 2)); // periodo 4π
const seno4 = onda("sen", 4);
const cosMenos3 = onda("cos", -3);
const dosSeno = onda("sen", 2);
const ejDesfase = onda("sen", 1, 1, frac(1, 4)); // sen(x − π/4)
const ejDesfaseIzq = onda("cos", 1, 1, frac(-1, 6)); // cos(x + π/6)
const ejFactor = onda("sen", 1, 2, frac(1, 2)); // sen(2(x − π/2)) = sen(2x − π)
const ejVertical = onda("cos", 2, 1, 0, -3); // 2 cos x − 3
const ejCuatro = onda("sen", 3, 2, frac(1, 4), -1); // 3 sen(2(x − π/4)) − 1
const ejLectura = onda("cos", 3, 2, frac(1, 4), 2); // 3 cos(2(x − π/4)) + 2: máx 5, mín −1
const ejLecturaSeno = onda("sen", 3, 2, 0, 2); // 3 sen(2x) + 2: la MISMA gráfica
const ejNegativa = onda("sen", -2, frac(1, 2), 0, 1); // −2 sen(x/2) + 1
const ejCoseno = onda("cos", 1, 1, frac(1, 3)); // cos(x − π/3)

// Comprobaciones de construcción: la lectura del ejemplo de la Clase 18 y sus dos formas.
for (let k = 0; k <= 200; k++) {
  const x = (k / 200) * 4 * Math.PI - Math.PI;
  if (Math.abs(valorOnda(ejLectura, x) - valorOnda(ejLecturaSeno, x)) > 1e-9) throw new Error("3cos(2(x − π/4)) + 2 debe ser igual a 3sen(2x) + 2");
  if (Math.abs(valorOnda(ejFactor, x) - Math.sin(2 * x - Math.PI)) > 1e-9) throw new Error("sen(2(x − π/2)) debe ser igual a sen(2x − π)");
  if (Math.abs(Math.cos(x) - Math.sin(x + Math.PI / 2)) > 1e-9) throw new Error("cos x debe ser sen(x + π/2)");
}
if (aNumero(maximo(ejLectura)) !== 5 || aNumero(minimo(ejLectura)) !== -1 || aNumero(lineaMedia(ejLectura)) !== 2) throw new Error("La onda de la Clase 18 no tiene máximo 5 y mínimo −1");

export const CLASES_TRIGONOMETRIA_GRAFICAS: ClaseTrigonometria[] = [
  // ---------------------------------------------------------------- 12
  {
    slug: "trigonometria-clase-12-la-funcion-seno",
    grupo: "graficas",
    orden: 1,
    requierePro: true,
    nombre: "La función seno y su gráfica",
    descripcion: "De un punto que gira sobre el círculo a la onda y = sen x: forma, valores clave, dominio, rango y periodo.",
    conceptos: { introduce: ["funcion-seno", "funcion-periodica"], usa: ["circulo-unitario", "valores-exactos", "radian", "funcion-grafica"] },
    pasos: [
      "Objetivo: al terminar podrás dibujar la gráfica de $y=\\operatorname{sen}(x)$ a partir del círculo unitario y decir cuáles son sus valores clave, su dominio, su rango y su periodo.",
      "Intuición. Imagina un punto que da vueltas sobre el círculo unitario con velocidad constante. Su altura (la coordenada $y$) sube hasta 1, baja hasta $-1$ y vuelve a subir, una y otra vez. Esa altura, en función del ángulo recorrido $x$, es la función seno.",
      "La función seno asigna a cada número $x$ el valor $\\operatorname{sen}(x)$. En las gráficas, $x$ es un ángulo en RADIANES (se marca en múltiplos de $\\pi$) e $y$ es la altura del punto. Se puede calcular el seno de cualquier número real, así que el dominio son todos los reales.",
      "Los cinco puntos clave de un ciclo, entre $0$ y $2\\pi$: $x=0$ da $y=0$; $x=\\frac{\\pi}{2}$ da $y=1$; $x=\\pi$ da $y=0$; $x=\\frac{3\\pi}{2}$ da $y=-1$; y $x=2\\pi$ vuelve a dar $y=0$. Entre ellos la curva es suave, sin puntas.",
      "La forma. La gráfica sale del origen, sube hasta el máximo 1 en $\\frac{\\pi}{2}$, baja pasando por 0 en $\\pi$, llega al mínimo $-1$ en $\\frac{3\\pi}{2}$ y regresa a 0 en $2\\pi$. Después se repite igual, en los dos sentidos.",
      "Rango y periodo. Los valores del seno siempre están entre $-1$ y $1$: el rango es el intervalo $[-1,\\ 1]$. Y como después de una vuelta completa el punto vuelve al mismo lugar, $\\operatorname{sen}(x+2\\pi)=\\operatorname{sen}(x)$: se dice que es una función periódica de periodo $2\\pi$.",
      "Errores comunes. 1) Graficar con $x$ en grados en un eje marcado con $\\pi$: cuando el eje dice $\\pi$, $x$ está en radianes. 2) Dibujar la curva con picos o como una parábola: es una onda suave. 3) Olvidar que corta al eje $x$ en todos los múltiplos de $\\pi$, no solo en 0 y $2\\pi$.",
    ],
    visuales: [
      { tipo: "trigonometria.onda", despuesDePaso: 4, titulo: "Un ciclo de $y=\\operatorname{sen}(x)$ con sus cinco puntos clave", onda: { fn: "sen" }, rango: [0, 2], pasos: ["curva", "puntos"] },
      { tipo: "trigonometria.onda", despuesDePaso: 5, titulo: "La gráfica se repite cada $2\\pi$", onda: { fn: "sen" }, rango: [-1, 3], pasos: ["curva", "periodo"] },
    ],
    quiz: [
      preg("¿Cuánto vale $\\operatorname{sen}\\!\\left(\\dfrac{\\pi}{2}\\right)$?", "$1$", ["$0$", "$-1$", "$\\dfrac{1}{2}$"], "$\\frac{\\pi}{2}$ radianes son $90^{\\circ}$, donde el punto del círculo está arriba del todo, en $(0,1)$: el seno vale 1, el máximo."),
      preg("¿Entre qué valores se mueve $y=\\operatorname{sen}(x)$?", "Entre $-1$ y $1$", ["Entre $0$ y $1$", "Entre $-\\pi$ y $\\pi$", "Entre $0$ y $2\\pi$"], "El seno es la altura de un punto sobre un círculo de radio 1, así que nunca sale de $[-1,1]$. Los valores $\\pi$ y $2\\pi$ son posiciones del eje $x$, no alturas."),
      preg("¿En qué valores de $x$, entre $0$ y $2\\pi$, corta la gráfica de $y=\\operatorname{sen}(x)$ al eje $x$?", "$0$, $\\pi$ y $2\\pi$", ["Solo en $0$ y $2\\pi$", "$\\dfrac{\\pi}{2}$ y $\\dfrac{3\\pi}{2}$", "Solo en $\\pi$"], "El seno vale 0 cuando el punto está sobre el eje horizontal: en $0$, $\\pi$ y $2\\pi$. En $\\frac{\\pi}{2}$ y $\\frac{3\\pi}{2}$ está en el máximo y en el mínimo."),
      preg("Si $\\operatorname{sen}(x)=0{,}3$, ¿cuánto vale $\\operatorname{sen}(x+2\\pi)$?", "$0{,}3$", ["$-0{,}3$", "$0{,}3+2\\pi$", "$0$"], "Sumar $2\\pi$ es dar una vuelta completa: el punto vuelve al mismo lugar y el seno no cambia. Esa es la definición de periodo."),
      preg("¿Cuál de estas descripciones corresponde a la gráfica de $y=\\operatorname{sen}(x)$?", "Una onda suave que arranca en el origen y sube hasta 1", ["Una onda que arranca en $y=1$ y baja", "Una parábola que abre hacia arriba", "Una onda con picos en los múltiplos de $\\pi$"], "El seno sale del punto $(0,0)$ subiendo; la que arranca en 1 es el coseno. No es una parábola ni tiene picos: es suave."),
    ],
  },

  // ---------------------------------------------------------------- 13
  {
    slug: "trigonometria-clase-13-la-funcion-coseno",
    grupo: "graficas",
    orden: 2,
    requierePro: true,
    nombre: "La función coseno",
    descripcion: "El coseno como la coordenada x del punto que gira, su gráfica y por qué es el seno corrido π/2 hacia la izquierda.",
    conceptos: { introduce: ["funcion-coseno"], usa: ["funcion-seno", "circulo-unitario", "valores-exactos"] },
    pasos: [
      "Objetivo: al terminar podrás dibujar la gráfica de $y=\\cos(x)$, reconocer en qué se diferencia de la del seno y explicar por qué son la misma onda desplazada.",
      "Intuición. Con el mismo punto que gira sobre el círculo unitario, el seno miraba la altura ($y$) y el coseno mira lo lejos que está hacia los lados ($x$). Al empezar, en $x=0$, el punto está en $(1,0)$: el coseno arranca en su máximo.",
      "Los cinco puntos clave de un ciclo: $x=0$ da $y=1$; $x=\\frac{\\pi}{2}$ da $y=0$; $x=\\pi$ da $y=-1$; $x=\\frac{3\\pi}{2}$ da $y=0$; y $x=2\\pi$ vuelve a dar $y=1$. También es periódica de periodo $2\\pi$ y su rango es $[-1,\\ 1]$.",
      "La gráfica del coseno y la del seno son la misma onda con otro punto de partida: $\\cos(x)=\\operatorname{sen}\\!\\left(x+\\frac{\\pi}{2}\\right)$. Es decir, la gráfica del coseno es la del seno corrida $\\frac{\\pi}{2}$ hacia la izquierda: lo que el seno hace en $x=\\frac{\\pi}{2}$ (llegar a 1), el coseno ya lo hace en $x=0$.",
      "Simetrías. El coseno es simétrico respecto del eje $y$: $\\cos(-x)=\\cos(x)$ (mira cómo la gráfica a la izquierda es un espejo de la de la derecha). El seno, en cambio, es simétrico respecto del origen: $\\operatorname{sen}(-x)=-\\operatorname{sen}(x)$.",
      "Errores comunes. 1) Confundir cuál de las dos arranca en 0 y cuál en 1: el coseno arranca en 1 (es $x$ en $(1,0)$). 2) Creer que son ondas de distinta forma: tienen exactamente la misma forma, solo cambia el punto de partida. 3) Trabajar con la calculadora en grados cuando el eje está en radianes.",
    ],
    visuales: [
      { tipo: "trigonometria.onda", despuesDePaso: 2, titulo: "$y=\\cos(x)$ (línea continua) y $y=\\operatorname{sen}(x)$ (punteada)", onda: { fn: "cos" }, base: { fn: "sen" }, rango: [0, 2], pasos: ["curva", "puntos"] },
      { tipo: "trigonometria.onda", despuesDePaso: 3, titulo: "El coseno es el seno corrido $\\frac{\\pi}{2}$ hacia la izquierda", onda: { fn: "cos" }, base: { fn: "sen" }, rango: [-1, 1], pasos: ["curva"] },
    ],
    quiz: [
      preg("¿Cuánto vale $\\cos(0)$?", "$1$", ["$0$", "$-1$", "$\\dfrac{\\pi}{2}$"], "En $x=0$ el punto del círculo está en $(1,0)$ y su coordenada $x$, el coseno, es 1."),
      preg("¿Cuánto vale $\\cos(\\pi)$?", "$-1$", ["$1$", "$0$", "$\\pi$"], "En $x=\\pi$ (media vuelta) el punto está en $(-1,0)$: el coseno vale $-1$, su mínimo."),
      preg("¿Cuál de las dos funciones, seno o coseno, arranca en su valor máximo en $x=0$?", "El coseno", ["El seno", "Las dos", "Ninguna"], "$\\cos(0)=1$ es el máximo del coseno, mientras que $\\operatorname{sen}(0)=0$ está a mitad de camino."),
      preg("¿Qué desplazamiento transforma la gráfica del seno en la del coseno?", "$\\dfrac{\\pi}{2}$ hacia la izquierda", ["$\\dfrac{\\pi}{2}$ hacia la derecha", "$\\pi$ hacia la izquierda", "$\\dfrac{\\pi}{2}$ hacia arriba"], "$\\cos(x)=\\operatorname{sen}(x+\\frac{\\pi}{2})$: el seno de $x+\\frac{\\pi}{2}$ ya trae el valor que el seno tendrá $\\frac{\\pi}{2}$ más adelante, así que la gráfica se corre hacia la izquierda. Corrida a la derecha daría $\\operatorname{sen}(x-\\frac{\\pi}{2})=-\\cos(x)$, la gráfica invertida."),
      preg("¿Cuánto vale $\\cos\\!\\left(\\dfrac{3\\pi}{2}\\right)$?", "$0$", ["$-1$", "$1$", "$\\dfrac{3}{2}$"], "$\\frac{3\\pi}{2}$ son $270^{\\circ}$: el punto está en $(0,-1)$ y su coordenada $x$ vale 0. El $-1$ es el seno de ese ángulo."),
    ],
  },

  // ---------------------------------------------------------------- 14
  {
    slug: "trigonometria-clase-14-amplitud",
    grupo: "graficas",
    orden: 3,
    requierePro: true,
    nombre: "Amplitud",
    descripcion: "Cómo el número a en y = a·sen(x) estira la onda en vertical y cómo leer la amplitud de una gráfica.",
    conceptos: { introduce: ["amplitud"], usa: ["funcion-seno", "funcion-coseno"] },
    pasos: [
      "Objetivo: al terminar sabrás qué es la amplitud, cómo el número $a$ de $y=a\\operatorname{sen}(x)$ la determina y cómo leerla en una gráfica.",
      "Intuición. Multiplicar la función por un número estira o achata la gráfica en vertical: cada altura se multiplica por ese número. Es como subir el volumen: la onda sube más y baja más, pero sigue con el mismo ritmo.",
      `Definición. En $y=a\\operatorname{sen}(x)$ o $y=a\\cos(x)$, el máximo es $|a|$ y el mínimo $-|a|$. La AMPLITUD es $|a|$: la altura desde la línea media hasta el máximo (no de un extremo al otro). Por ejemplo, ${ec(seno4)} tiene amplitud ${mnum(amplitud(seno4))}: oscila entre ${mnum(minimo(seno4))} y ${mnum(maximo(seno4))}.`,
      `Lo que NO cambia. Los cruces con el eje $x$ y el periodo son los mismos que en $y=\\operatorname{sen}(x)$: solo se estira la altura. En ${ec(dosSeno)} el máximo se alcanza en el mismo $x=\\frac{\\pi}{2}$, pero vale ${mnum(maximo(dosSeno))} en lugar de 1.`,
      `Si $a$ es negativo. En ${ec(cosMenos3)} la amplitud es ${mnum(amplitud(cosMenos3))} (la amplitud nunca es negativa: es $|a|$) pero la gráfica se refleja: en lugar de arrancar en el máximo, arranca en el mínimo ${mnum(minimo(cosMenos3))}.`,
      "Leer la amplitud de una gráfica. Si conoces el máximo $M$ y el mínimo $m$, la amplitud es $\\frac{M-m}{2}$. Por ejemplo, una onda con máximo 5 y mínimo $-1$ tiene amplitud $\\frac{5-(-1)}{2}=3$. (Más adelante verás que su línea media es $2$.)",
      "Errores comunes. 1) Tomar como amplitud la distancia de un extremo al otro: eso es el doble de la amplitud. 2) Escribir una amplitud negativa: $|a|$ siempre es positiva, el signo solo refleja la gráfica. 3) Creer que $a$ cambia el periodo: no lo cambia.",
    ],
    visuales: [
      { tipo: "trigonometria.onda", despuesDePaso: 2, titulo: "$y=4\\operatorname{sen}(x)$ contra $y=\\operatorname{sen}(x)$ (punteada)", onda: { fn: "sen", a: 4 }, base: { fn: "sen" }, rango: [0, 2], pasos: ["curva", "amplitud"] },
      { tipo: "trigonometria.onda", despuesDePaso: 4, titulo: "$y=-3\\cos(x)$: amplitud 3, pero reflejada", onda: { fn: "cos", a: -3 }, base: { fn: "cos" }, rango: [0, 2], pasos: ["curva", "amplitud"] },
    ],
    quiz: [
      preg(`¿Cuál es la amplitud de ${ec(seno4)}?`, mnum(amplitud(seno4)), [mnum(frac(8)), mnum(frac(1, 4)), mnum(frac(2))], "La amplitud es el valor absoluto del número que multiplica: 4. El 8 sería la distancia de un extremo al otro (de $-4$ a $4$)."),
      preg(`¿Cuál es la amplitud de ${ec(cosMenos3)}?`, mnum(amplitud(cosMenos3)), [mnum(frac(-3)), mnum(frac(1, 3)), mnum(frac(6))], "La amplitud es $|a|=|-3|=3$: nunca es negativa. El signo negativo solo refleja la gráfica."),
      preg("Una onda tiene máximo 5 y mínimo $-1$. ¿Cuál es su amplitud?", "$3$", ["$6$", "$2$", "$5$"], "Amplitud $=\\frac{M-m}{2}=\\frac{5-(-1)}{2}=3$. El 6 es la distancia total de un extremo al otro."),
      preg("Si se multiplica por 2 la función $y=\\operatorname{sen}(x)$, ¿qué cambia?", "La altura de la onda (máximo y mínimo), pero no el periodo", ["El periodo, que se duplica", "La posición de los cruces con el eje $x$", "Nada"], "Multiplicar por 2 estira la gráfica en vertical: el máximo pasa a 2 y el mínimo a $-2$. Los cruces con el eje $x$ y el periodo se mantienen."),
      preg("¿Cuál es el rango de $y=2\\operatorname{sen}(x)$?", "$[-2,\\ 2]$", ["$[-1,\\ 1]$", "$[0,\\ 2]$", "$[-4,\\ 4]$"], "Los valores van de $-|a|$ a $|a|$: de $-2$ a $2$. $[-1,1]$ es el rango sin multiplicar."),
    ],
  },

  // ---------------------------------------------------------------- 15
  {
    slug: "trigonometria-clase-15-periodo-y-frecuencia",
    grupo: "graficas",
    orden: 4,
    requierePro: true,
    nombre: "Periodo y frecuencia",
    descripcion: "Cómo el número b en y = sen(bx) acelera o frena la onda, y la fórmula del periodo 2π/b.",
    conceptos: { introduce: ["periodo", "frecuencia"], usa: ["funcion-periodica", "amplitud", "funcion-seno"] },
    pasos: [
      "Objetivo: al terminar podrás calcular el periodo de $y=a\\operatorname{sen}(bx)$ o $y=a\\cos(bx)$ con la fórmula $\\frac{2\\pi}{b}$, entender la frecuencia y leer el periodo de una gráfica.",
      "Intuición. Multiplicar la $x$ por un número acelera o frena la onda. En $y=\\operatorname{sen}(3x)$ el ángulo avanza tres veces más rápido: en el mismo tramo del eje $x$ caben tres ciclos. Los ciclos se hacen más angostos: es como pedalear más rápido, se dan más vueltas en el mismo camino.",
      `El periodo $P$ es el largo (en el eje $x$) de un ciclo completo. En $y=a\\operatorname{sen}(bx)$ con $b>0$: $P=\\frac{2\\pi}{b}$. Por ejemplo, ${ec(seno3)} tiene periodo ${mper(seno3)} (tres ciclos entre 0 y $2\\pi$).`,
      `Más ejemplos. ${ec(seno2)}: periodo ${mper(seno2)} (dos ciclos en una vuelta). ${ec(cosMedio)}: $b=\\frac{1}{2}$, así que el periodo es ${mper(cosMedio)}: la onda se estira y hace medio ciclo entre 0 y $2\\pi$.`,
      "La frecuencia es cuántos ciclos caben en una unidad del eje $x$: $f=\\frac{1}{P}=\\frac{b}{2\\pi}$. Periodo largo, frecuencia baja; periodo corto, frecuencia alta. En sonido, por ejemplo, un tono agudo es una onda de frecuencia alta y periodo corto.",
      "La regla práctica: $b$ grande significa ciclos angostos (periodo corto); $b$ chico significa ciclos anchos (periodo largo). Y $b=1$ es el caso base, de periodo $2\\pi$. Para la tangente el periodo es $\\frac{\\pi}{b}$ (no $\\frac{2\\pi}{b}$).",
      "Errores comunes. 1) Dividir al revés: el periodo es $\\frac{2\\pi}{b}$, no $\\frac{b}{2\\pi}$ (eso es la frecuencia). 2) Confundir periodo con frecuencia. 3) Usar $\\frac{2\\pi}{b}$ en la tangente, cuya onda se repite cada $\\frac{\\pi}{b}$. 4) Creer que $b$ cambia la amplitud: no la cambia.",
    ],
    visuales: [
      { tipo: "trigonometria.onda", despuesDePaso: 2, titulo: "$y=\\operatorname{sen}(3x)$ contra $y=\\operatorname{sen}(x)$ (punteada)", onda: { fn: "sen", b: 3 }, base: { fn: "sen" }, rango: [0, 2], pasos: ["curva", "periodo"] },
      { tipo: "trigonometria.onda", despuesDePaso: 3, titulo: "$y=\\cos\\left(\\frac{x}{2}\\right)$: un ciclo cada $4\\pi$", onda: { fn: "cos", b: [1, 2] }, base: { fn: "cos" }, rango: [0, 4], pasos: ["curva", "periodo"] },
    ],
    quiz: [
      preg(`¿Cuál es el periodo de ${ec(onda("sen", 1, 4))}?`, mper(onda("sen", 1, 4)), [m("2\\pi"), m("8\\pi"), m("4\\pi")], "$P=\\frac{2\\pi}{4}=\\frac{\\pi}{2}$. Con $b=4$ la onda hace 4 ciclos entre $0$ y $2\\pi$. $8\\pi$ sale de multiplicar por $b$ en lugar de dividir."),
      preg(`¿Cuál es el periodo de ${ec(onda("cos", 1, frac(1, 3)))}?`, mper(onda("cos", 1, frac(1, 3))), [m("\\dfrac{2\\pi}{3}"), m("\\dfrac{\\pi}{3}"), m("3\\pi")], "$P=\\frac{2\\pi}{1/3}=6\\pi$: con $b=\\frac{1}{3}$ la onda se estira y tarda tres vueltas en completar un ciclo. $\\frac{2\\pi}{3}$ multiplicó por $b$."),
      preg("Una onda $y=\\operatorname{sen}(bx)$ tiene periodo $\\dfrac{2\\pi}{5}$. ¿Cuánto vale $b$?", "$5$", ["$\\dfrac{1}{5}$", "$2\\pi$", "$\\dfrac{2\\pi}{5}$"], "De $P=\\frac{2\\pi}{b}$ se despeja $b=\\frac{2\\pi}{P}=\\frac{2\\pi}{2\\pi/5}=5$."),
      preg("¿Cuántos ciclos completos de $y=\\operatorname{sen}(3x)$ hay entre $0$ y $2\\pi$?", "$3$", ["$1$", "$6$", "$\\dfrac{1}{3}$"], "El periodo es $\\frac{2\\pi}{3}$ y $2\\pi$ contiene $2\\pi\\div\\frac{2\\pi}{3}=3$ periodos."),
      preg("¿Cuál es el periodo de $y=\\tan(2x)$?", "$\\dfrac{\\pi}{2}$", ["$\\pi$", "$4\\pi$", "$2\\pi$"], "La tangente se repite cada $\\pi$, así que con $b=2$ el periodo es $\\frac{\\pi}{b}=\\frac{\\pi}{2}$. No se usa $2\\pi$ como en el seno y el coseno."),
    ],
  },

  // ---------------------------------------------------------------- 16
  {
    slug: "trigonometria-clase-16-desfase-y-desplazamiento-vertical",
    grupo: "graficas",
    orden: 5,
    requierePro: true,
    nombre: "Desfase y desplazamiento vertical",
    descripcion: "Correr la onda a los lados (desfase) o hacia arriba y abajo (línea media) y la forma general y = a·sen(b(x − c)) + d.",
    conceptos: { introduce: ["desfase", "desplazamiento-vertical"], usa: ["amplitud", "periodo", "funcion-seno", "funcion-coseno"] },
    pasos: [
      "Objetivo: al terminar podrás identificar amplitud, periodo, desfase y desplazamiento vertical en la ecuación $y=a\\operatorname{sen}(b(x-c))+d$ y dibujar la onda correspondiente.",
      "Intuición. A una onda se le puede cambiar el tamaño ($a$), el ritmo ($b$) y también la posición: correrla a los lados o subirla y bajarla, como mover una escultura de lugar sin cambiarle la forma. Esos dos movimientos se llaman desfase y desplazamiento vertical.",
      "La forma general que se usa en este curso es $y=a\\operatorname{sen}(b(x-c))+d$ (o con coseno). Sus cuatro números: $a$ da la amplitud $|a|$; $b$, el periodo $\\frac{2\\pi}{b}$; $c$, el desfase (cuánto se corre hacia la derecha si es positivo); y $d$, el desplazamiento vertical (la línea media es $y=d$).",
      `Desfase. En ${ec(ejDesfase)}, el ciclo que empezaba en $x=0$ ahora empieza en $x=${pi(ejDesfase.cPi)}$: la gráfica se corrió ${mpi(ejDesfase.cPi)} hacia la derecha. Con signo más, la corrida es hacia la izquierda: ${ec(ejDesfaseIzq)} está corrida ${mpi(frac(1, 6))} hacia la izquierda.`,
      `Desplazamiento vertical. En ${ec(ejVertical)}, toda la gráfica baja 3 unidades: la línea media pasa a ser ${m("y=" + num(lineaMedia(ejVertical)))}, el máximo es ${mnum(maximo(ejVertical))} y el mínimo ${mnum(minimo(ejVertical))}. La amplitud (${mnum(amplitud(ejVertical))}) no cambia: mover la onda no la estira.`,
      `Cuidado: hay que factorizar $b$. Si la ecuación está escrita como $y=\\operatorname{sen}(2x-\\pi)$, el desfase NO es $\\pi$: se factoriza $2x-\\pi=2\\left(x-\\frac{\\pi}{2}\\right)$ y el desfase es ${mpi(ejFactor.cPi)}. En general, en $\\operatorname{sen}(bx-k)$ el desfase es $\\frac{k}{b}$.`,
      `Las cuatro cantidades juntas. Para ${ec(ejCuatro)}: amplitud ${mnum(amplitud(ejCuatro))}, periodo ${mper(ejCuatro)}, desfase ${mpi(ejCuatro.cPi)}, línea media ${m("y=" + num(lineaMedia(ejCuatro)))}, máximo ${mnum(maximo(ejCuatro))} y mínimo ${mnum(minimo(ejCuatro))}.`,
      "Errores comunes. 1) Invertir el sentido del desfase: $x-c$ corre hacia la derecha y $x+c$ hacia la izquierda. 2) No factorizar $b$ y tomar como desfase el número suelto. 3) Creer que el desplazamiento vertical cambia la amplitud: solo mueve la línea media. 4) Mezclar $d$ con el máximo: el máximo es $d+|a|$.",
    ],
    visuales: [
      { tipo: "trigonometria.onda", despuesDePaso: 3, titulo: "Desfase: $y=\\operatorname{sen}\\left(x-\\frac{\\pi}{4}\\right)$ contra $y=\\operatorname{sen}(x)$", onda: { fn: "sen", c: [1, 4] }, base: { fn: "sen" }, rango: [0, 2], pasos: ["curva", "desfase"] },
      { tipo: "trigonometria.onda", despuesDePaso: 4, titulo: "Desplazamiento vertical: $y=2\\cos(x)-3$", onda: { fn: "cos", a: 2, d: -3 }, base: { fn: "cos" }, rango: [0, 2], pasos: ["curva", "amplitud", "vertical"] },
      { tipo: "trigonometria.onda", despuesDePaso: 6, titulo: "Las cuatro cantidades: $y=3\\operatorname{sen}\\left(2\\left(x-\\frac{\\pi}{4}\\right)\\right)-1$", onda: { fn: "sen", a: 3, b: 2, c: [1, 4], d: -1 }, rango: [0, 2], pasos: ["curva", "amplitud", "periodo", "desfase", "vertical", "puntos"] },
    ],
    quiz: [
      preg(`¿Qué desfase tiene ${ec(ejDesfase)}?`, `${mpi(ejDesfase.cPi)} hacia la derecha`, [`${mpi(ejDesfase.cPi)} hacia la izquierda`, `${mpi(frac(1, 2))} hacia la derecha`, `${mpi(frac(1))} hacia la derecha`], "Con $x-c$ la gráfica se corre $c$ hacia la derecha. Aquí $c=\\frac{\\pi}{4}$, así que se corre $\\frac{\\pi}{4}$ a la derecha; con signo más iría a la izquierda."),
      preg(`¿Qué desfase tiene ${ec(ejDesfaseIzq)}?`, `${mpi(frac(1, 6))} hacia la izquierda`, [`${mpi(frac(1, 6))} hacia la derecha`, `${mpi(frac(1, 3))} hacia la izquierda`, "No tiene desfase"], "$\\cos\\left(x+\\frac{\\pi}{6}\\right)=\\cos\\left(x-\\left(-\\frac{\\pi}{6}\\right)\\right)$: el desfase es $-\\frac{\\pi}{6}$, es decir, $\\frac{\\pi}{6}$ hacia la izquierda."),
      preg("¿Qué desfase tiene $y=\\operatorname{sen}(2x-\\pi)$?", `${mpi(ejFactor.cPi)} hacia la derecha`, [`${mpi(frac(1))} hacia la derecha`, `${mpi(frac(2))} hacia la derecha`, `${mpi(frac(1, 2))} hacia la izquierda`], "Hay que factorizar: $2x-\\pi=2\\left(x-\\frac{\\pi}{2}\\right)$, así que el desfase es $\\frac{\\pi}{2}$ a la derecha. El desfase no es $\\pi$: se divide entre $b=2$."),
      preg(`Para ${ec(ejVertical)}, ¿cuál es la línea media y cuál el máximo?`, `${m("y=" + num(lineaMedia(ejVertical)))} y máximo ${mnum(maximo(ejVertical))}`, [`${m("y=2")} y máximo ${mnum(frac(5))}`, `${m("y=0")} y máximo ${mnum(frac(2))}`, `${m("y=-3")} y máximo ${mnum(frac(-5))}`], "La línea media es $y=d=-3$ y el máximo es $d+|a|=-3+2=-1$. El máximo no es $d$ ni $|a|$: es su suma."),
      preg("Se le suma 4 a $y=\\operatorname{sen}(x)$ para obtener $y=\\operatorname{sen}(x)+4$. ¿Qué pasa con la amplitud?", "No cambia: sigue siendo 1; la onda sube 4 unidades", ["Pasa a ser 4", "Pasa a ser 5", "Se reduce a la mitad"], "El desplazamiento vertical solo sube la gráfica: el máximo es 5 y el mínimo 3, pero la distancia de la línea media al máximo sigue siendo 1."),
      preg(`Para ${ec(ejCuatro)}, ¿cuánto vale el máximo?`, mnum(maximo(ejCuatro)), [mnum(frac(3)), mnum(frac(-1)), mnum(frac(-4))], "Máximo $=d+|a|=-1+3=2$. El 3 es la amplitud, $-1$ es la línea media y $-4$ es el mínimo."),
    ],
  },

  // ---------------------------------------------------------------- 17
  {
    slug: "trigonometria-clase-17-la-tangente-y-sus-asintotas",
    grupo: "graficas",
    orden: 6,
    requierePro: true,
    nombre: "La tangente y sus asíntotas",
    descripcion: "Por qué la gráfica de la tangente se dispara en π/2 + kπ, qué es una asíntota y por qué su periodo es π.",
    conceptos: { introduce: ["funcion-tangente", "asintotas"], usa: ["razones-cualquier-angulo", "periodo", "funcion-seno", "funcion-coseno"] },
    pasos: [
      "Objetivo: al terminar podrás dibujar la gráfica de $y=\\tan(x)$, ubicar sus asíntotas verticales y calcular su periodo, también cuando el argumento es $bx$.",
      "Intuición. La tangente es el cociente $\\tan(x)=\\frac{\\operatorname{sen}(x)}{\\cos(x)}$. Cuando el coseno se acerca a 0 (el punto del círculo está casi arriba o casi abajo), el cociente se hace enorme; y cuando el coseno es 0, no se puede dividir: la tangente no existe. Por eso su gráfica se dispara hacia arriba o hacia abajo cerca de esos valores.",
      "Las rectas verticales a las que se acerca la gráfica sin tocarlas se llaman asíntotas verticales. Para $y=\\tan(x)$ están donde $\\cos(x)=0$: en $x=\\frac{\\pi}{2}+k\\pi$, con $k$ entero (por ejemplo $-\\frac{\\pi}{2}$, $\\frac{\\pi}{2}$, $\\frac{3\\pi}{2}$). Entre dos asíntotas consecutivas la tangente crece de $-\\infty$ a $+\\infty$ pasando por 0 en el medio.",
      "Valores para orientarse: $\\tan(0)=0$; $\\tan\\left(\\frac{\\pi}{4}\\right)=1$; $\\tan\\left(-\\frac{\\pi}{4}\\right)=-1$. Corta al eje $x$ en todos los múltiplos de $\\pi$ (donde el seno vale 0).",
      "Periodo. La tangente se repite cada $\\pi$, no cada $2\\pi$: al sumar $\\pi$ (media vuelta) el seno y el coseno cambian de signo a la vez, y el cociente no cambia: $\\tan(x+\\pi)=\\tan(x)$. Además, no tiene amplitud: no hay máximo ni mínimo, y su rango son todos los números reales.",
      "Con $y=\\tan(bx)$ el periodo es $\\frac{\\pi}{b}$ y las asíntotas quedan en $x=\\frac{\\pi}{2b}+k\\frac{\\pi}{b}$. Por ejemplo, $y=\\tan(2x)$ tiene periodo $\\frac{\\pi}{2}$ y sus asíntotas cerca del origen están en $x=-\\frac{\\pi}{4}$ y $x=\\frac{\\pi}{4}$.",
      "Errores comunes. 1) Dibujar la tangente como una onda que sube y baja entre dos valores: no está acotada. 2) Olvidar las asíntotas o cruzarlas con la curva. 3) Usar $2\\pi$ como periodo. 4) Buscar la amplitud de la tangente: no existe.",
    ],
    visuales: [
      { tipo: "trigonometria.onda", despuesDePaso: 2, titulo: "$y=\\tan(x)$ y sus asíntotas", onda: { fn: "tan" }, rango: [-1, 1], pasos: ["curva", "asintotas"] },
      { tipo: "trigonometria.onda", despuesDePaso: 5, titulo: "$y=\\tan(2x)$ contra $y=\\tan(x)$ (punteada)", onda: { fn: "tan", b: 2 }, base: { fn: "tan" }, rango: [-1, 1], pasos: ["curva", "periodo", "asintotas"] },
    ],
    quiz: [
      preg("¿En qué valores de $x$, entre $-\\pi$ y $\\pi$, tiene asíntotas verticales $y=\\tan(x)$?", "$x=-\\dfrac{\\pi}{2}$ y $x=\\dfrac{\\pi}{2}$", ["$x=-\\pi$, $x=0$ y $x=\\pi$", "$x=0$ solamente", "$x=-\\dfrac{\\pi}{4}$ y $x=\\dfrac{\\pi}{4}$"], "Las asíntotas están donde $\\cos(x)=0$, es decir, en $\\frac{\\pi}{2}+k\\pi$. En los múltiplos de $\\pi$ la tangente vale 0 y en $\\pm\\frac{\\pi}{4}$ vale $\\pm 1$."),
      preg("¿Cuál es el periodo de $y=\\tan(x)$?", "$\\pi$", ["$2\\pi$", "$\\dfrac{\\pi}{2}$", "No tiene periodo"], "$\\tan(x+\\pi)=\\tan(x)$: al sumar media vuelta, el seno y el coseno cambian de signo juntos y el cociente no cambia."),
      preg("¿Por qué $\\tan\\!\\left(\\dfrac{\\pi}{2}\\right)$ no existe?", "Porque $\\cos\\!\\left(\\dfrac{\\pi}{2}\\right)=0$ y no se puede dividir entre 0", ["Porque $\\operatorname{sen}\\!\\left(\\dfrac{\\pi}{2}\\right)=0$", "Porque $\\dfrac{\\pi}{2}$ es un ángulo demasiado pequeño", "Porque la tangente solo se define para ángulos agudos"], "$\\tan=\\frac{\\operatorname{sen}}{\\cos}$ y en $\\frac{\\pi}{2}$ el coseno vale 0. El seno vale 1 allí."),
      preg("¿Cuál es el periodo de $y=\\tan(2x)$?", mper(onda("tan", 1, 2)), ["$\\pi$", "$2\\pi$", "$4\\pi$"], "Con $b=2$, el periodo de la tangente es $\\frac{\\pi}{b}=\\frac{\\pi}{2}$: la gráfica se repite el doble de rápido que $y=\\tan(x)$."),
      preg("¿Cuál es el rango de la función tangente?", "Todos los números reales", ["Entre $-1$ y $1$", "Entre $0$ y $\\pi$", "Los reales positivos"], "Cerca de una asíntota la tangente se hace tan grande como se quiera, positiva o negativa. No tiene máximo ni mínimo, y por eso tampoco amplitud."),
    ],
  },

  // ---------------------------------------------------------------- 18
  {
    slug: "trigonometria-clase-18-leer-y-escribir-la-ecuacion-de-una-grafica",
    grupo: "graficas",
    orden: 7,
    requierePro: true,
    nombre: "Leer y escribir la ecuación de una gráfica",
    descripcion: "El método de cuatro pasos para pasar de una onda dibujada a su ecuación y comprobarla.",
    conceptos: { introduce: ["ecuacion-de-grafica"], usa: ["amplitud", "periodo", "desfase", "desplazamiento-vertical", "funcion-seno", "funcion-coseno"] },
    pasos: [
      "Objetivo: al terminar podrás escribir la ecuación $y=a\\operatorname{sen}(b(x-c))+d$ (o con coseno) de una onda a partir de su gráfica, y dibujar la onda a partir de la ecuación.",
      "Intuición. La ecuación es el «código» de la onda: cada número describe una característica que se puede leer en el dibujo. Leer la ecuación de una gráfica es encontrar esos cuatro números, uno por uno.",
      "El método. 1) Con el máximo $M$ y el mínimo $m$: línea media $d=\\frac{M+m}{2}$ y amplitud $|a|=\\frac{M-m}{2}$. 2) Con la distancia $P$ entre dos máximos consecutivos (el periodo): $b=\\frac{2\\pi}{P}$. 3) Elige coseno (si conviene arrancar en un máximo) o seno (si arranca en la línea media) y halla el desfase $c$ desde donde empieza el ciclo. 4) Comprueba con un punto de la gráfica.",
      `Ejemplo resuelto. Una onda tiene máximo ${mnum(maximo(ejLectura))}, mínimo ${mnum(minimo(ejLectura))}, periodo ${mper(ejLectura)} y su primer máximo positivo está en $x=${pi(ejLectura.cPi)}$. Paso 1: $d=\\frac{5+(-1)}{2}=${num(lineaMedia(ejLectura))}$ y $a=\\frac{5-(-1)}{2}=${num(amplitud(ejLectura))}$. Paso 2: $b=\\frac{2\\pi}{\\pi}=2$. Paso 3: con coseno, el desfase es donde hay un máximo: $c=${pi(ejLectura.cPi)}$. Resultado: ${ec(ejLectura)}.`,
      `Comprobación. En $x=${pi(ejLectura.cPi)}$: $3\\cos(2\\cdot 0)+2=3+2=5$, el máximo. Y en $x=${pi(frac(3, 4))}$: $3\\cos\\left(2\\cdot\\frac{\\pi}{2}\\right)+2=3\\cdot(-1)+2=-1$, el mínimo. La ecuación está bien.`,
      `Varias ecuaciones para la misma gráfica. Con seno es más simple, porque la misma onda arranca en la línea media: ${ec(ejLecturaSeno)}. Las dos ecuaciones describen exactamente la misma gráfica: $3\\cos\\left(2\\left(x-\\frac{\\pi}{4}\\right)\\right)+2=3\\operatorname{sen}(2x)+2$. Se elige la que dé el desfase más simple (a menudo 0). Sumar un periodo entero al desfase también da una ecuación válida.`,
      `Del lado contrario, leer la ecuación. Dada ${ec(ejNegativa)}: $a=-2$, así que la amplitud es 2 y la gráfica está reflejada (baja primero); $b=\\frac{1}{2}$, así que el periodo es ${mper(ejNegativa)}; la línea media es ${m("y=" + num(lineaMedia(ejNegativa)))}, con máximo ${mnum(maximo(ejNegativa))} y mínimo ${mnum(minimo(ejNegativa))}.`,
      "Errores comunes. 1) Tomar el mínimo como punto de partida del desfase del coseno: el coseno sin reflejar arranca en un MÁXIMO. 2) Calcular $b=\\frac{P}{2\\pi}$ en lugar de $\\frac{2\\pi}{P}$. 3) Confundir la línea media con la amplitud. 4) Olvidar comprobar con un punto: un error de signo en el desfase se nota al reemplazar.",
    ],
    visuales: [
      { tipo: "trigonometria.onda", despuesDePaso: 3, titulo: "$y=3\\cos\\left(2\\left(x-\\frac{\\pi}{4}\\right)\\right)+2$", onda: { fn: "cos", a: 3, b: 2, c: [1, 4], d: 2 }, rango: [0, 2], pasos: ["curva", "vertical", "amplitud", "periodo", "desfase", "puntos"] },
      { tipo: "trigonometria.onda", despuesDePaso: 5, titulo: "La misma gráfica escrita con seno: $y=3\\operatorname{sen}(2x)+2$", onda: { fn: "sen", a: 3, b: 2, d: 2 }, base: { fn: "cos", a: 3, b: 2, c: [1, 4], d: 2 }, rango: [0, 2], pasos: ["curva", "puntos"] },
      { tipo: "trigonometria.onda", despuesDePaso: 6, titulo: "$y=-2\\operatorname{sen}\\left(\\frac{x}{2}\\right)+1$", onda: { fn: "sen", a: -2, b: [1, 2], d: 1 }, rango: [0, 4], pasos: ["curva", "vertical", "amplitud", "periodo"] },
    ],
    quiz: [
      preg("Una onda tiene máximo 7 y mínimo 1. ¿Cuál es su línea media y cuál su amplitud?", "Línea media $y=4$ y amplitud $3$", ["Línea media $y=3$ y amplitud $4$", "Línea media $y=6$ y amplitud $4$", "Línea media $y=4$ y amplitud $6$"], "$d=\\frac{7+1}{2}=4$ y $|a|=\\frac{7-1}{2}=3$. El 6 es la distancia total de un extremo al otro."),
      preg("Una onda tiene periodo $\\pi$. ¿Cuánto vale $b$ en su ecuación?", "$2$", ["$\\dfrac{1}{2}$", "$\\pi$", "$2\\pi$"], "$b=\\frac{2\\pi}{P}=\\frac{2\\pi}{\\pi}=2$. Con $b=\\frac{1}{2}$ el periodo sería $4\\pi$."),
      preg(`Una onda tipo coseno de amplitud 1, periodo $2\\pi$, sin desplazamiento vertical, tiene su primer máximo positivo en $x=\\frac{\\pi}{3}$. ¿Cuál es su ecuación?`, ec(ejCoseno), [m("y=\\cos\\left(x+\\dfrac{\\pi}{3}\\right)"), m("y=\\cos(3x)"), m("y=\\operatorname{sen}\\left(x-\\dfrac{\\pi}{3}\\right)")], "El coseno sin desplazar tiene el máximo en $x=0$; para que esté en $\\frac{\\pi}{3}$ se corre a la derecha: $\\cos\\left(x-\\frac{\\pi}{3}\\right)$. Con signo más iría a la izquierda, y $\\cos(3x)$ cambia el periodo."),
      preg(`¿Son ${ec(ejLectura)} e ${ec(ejLecturaSeno)} la misma gráfica?`, "Sí: son dos ecuaciones de la misma onda", ["No: tienen distinta amplitud", "No: tienen distinto periodo", "Solo coinciden en el máximo"], "Las dos tienen amplitud 3, periodo $\\pi$ y línea media 2. La del seno arranca en la línea media y la del coseno en un máximo corrido $\\frac{\\pi}{4}$; comparten todos sus puntos."),
      preg("Una gráfica tiene periodo $4\\pi$. ¿Cuánto vale $b$?", "$\\dfrac{1}{2}$", ["$2$", "$4\\pi$", "$\\dfrac{1}{4}$"], "$b=\\frac{2\\pi}{4\\pi}=\\frac{1}{2}$. Un periodo largo significa un $b$ chico."),
    ],
  },
];
