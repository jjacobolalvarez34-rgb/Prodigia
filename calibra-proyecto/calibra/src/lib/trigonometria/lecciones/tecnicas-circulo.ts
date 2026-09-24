import { normalizarGrados } from "@/lib/trigonometria/angulos";
import type { TecnicaTrigonometria } from "./tipos";
import { m, mrd, mval, preg } from "./ayudas";

// Técnicas del bloque "circulo" (gratis): coseno y seno como coordenadas, el
// truco de la mano, la simetría por cuadrantes (ángulo de referencia y signos),
// grados y radianes, y los ángulos coterminales. Los valores exactos y las
// conversiones salen de código (exactos.ts, angulos.ts).

const red780 = normalizarGrados(780);
const red390 = normalizarGrados(-45);

export const TECNICAS_TRIGONOMETRIA_CIRCULO: TecnicaTrigonometria[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "trigonometria-tecnica-coseno-x-seno-y",
    grupo: "circulo",
    orden: 1,
    requierePro: false,
    nombre: "Coseno es x, seno es y: léelos como coordenadas",
    descripcion: "En el círculo de radio 1, el punto de un ángulo es (cos θ, sen θ): de ahí salen los valores de los ejes y la relación x² + y² = 1.",
    conceptos: { introduce: ["circulo-unitario", "razones-cualquier-angulo", "relacion-pitagorica-circulo"], usa: ["razon-seno", "razon-coseno", "razon-tangente"] },
    pasos: [
      "En el círculo unitario (radio 1) el punto de un ángulo $\\theta$ es $(\\cos\\theta,\\ \\operatorname{sen}\\theta)$: el coseno es la coordenada $x$ (horizontal) y el seno la coordenada $y$ (vertical). En el alfabeto, la c va antes que la s, como la $x$ antes que la $y$.",
      "Con eso, los ejes se leen solos: $0^{\\circ}$ es el punto $(1,0)$; $90^{\\circ}$, $(0,1)$; $180^{\\circ}$, $(-1,0)$; y $270^{\\circ}$, $(0,-1)$.",
      "Como el punto está sobre el círculo, $x^{2}+y^{2}=1$, es decir $\\cos^{2}\\theta+\\operatorname{sen}^{2}\\theta=1$. Si conoces uno de los dos valores, el otro sale de ahí (su signo lo decide el cuadrante).",
      "La tangente es $\\frac{y}{x}$. Cuando $x=0$ (en $90^{\\circ}$ y en $270^{\\circ}$) no se puede dividir: la tangente no existe.",
    ],
    visuales: [{ tipo: "trigonometria.circulo", despuesDePaso: 0, titulo: "El punto del círculo: (cos θ, sen θ)", angulos: [30, 120, 225, 315], unidad: "grados" }],
    quiz: [
      preg("¿Cuáles son las coordenadas del punto del círculo unitario para $180^{\\circ}$?", "$(-1,\\ 0)$", ["$(0,\\ -1)$", "$(1,\\ 0)$", "$(0,\\ 1)$"], "En $180^{\\circ}$ se llegó al extremo izquierdo: $\\cos=-1$ y $\\operatorname{sen}=0$. $(0,-1)$ es el punto de $270^{\\circ}$."),
      preg("¿Cuánto vale $\\cos(270^{\\circ})$?", "$0$", ["$1$", "$-1$", "Es indefinido"], "En $270^{\\circ}$ el punto es $(0,-1)$: la coordenada $x$, el coseno, es 0. Solo la tangente sería indefinida."),
      preg("¿Cuánto vale $\\tan(90^{\\circ})$?", "Es indefinida", ["$0$", "$1$", "$-1$"], "En $90^{\\circ}$ el punto es $(0,1)$ y la tangente sería $\\frac{1}{0}$: no existe."),
      preg("Si $\\cos(\\theta)=0{,}6$ y $\\theta$ es agudo, ¿cuánto vale $\\operatorname{sen}(\\theta)$?", "$0{,}8$", ["$0{,}4$", "$0{,}6$", "$1{,}6$"], "De $x^{2}+y^{2}=1$: $y^{2}=1-0{,}36=0{,}64$ y $y=0{,}8$. Restar $1-0{,}6=0{,}4$ no respeta los cuadrados."),
    ],
  },

  // ---------------------------------------------------------------- 2 (existente: 0108 + quiz 0177 + fix 0180)
  {
    slug: "trigonometria-truco-mano-circulo",
    grupo: "circulo",
    orden: 2,
    requierePro: false,
    existente: true,
    nombre: "El truco de la mano para los valores notables",
    descripcion: "Tu mano izquierda es una tabla del círculo unitario para el primer cuadrante: no hace falta memorizar nada suelto.",
    conceptos: { introduce: ["valores-exactos"], usa: ["valores-notables-agudos"] },
    pasos: [
      "Los cinco ángulos notables (0°, 30°, 45°, 60°, 90°) se asocian a los cinco dedos de una mano: pulgar = 0°, índice = 30°, medio = 45°, anular = 60°, meñique = 90°.",
      "Para el SENO: cuenta los dedos desde el pulgar (SIN contarlo) hasta el dedo elegido (SÍ contándolo); llama k a esa cantidad. sen(ángulo) = √k / 2.",
      "Para el COSENO: cuenta los dedos desde el dedo elegido (SIN contarlo) hasta el meñique (SÍ contándolo); llama m a esa cantidad. cos(ángulo) = √m / 2.",
      "Ejemplo con el anular (60°): del pulgar al anular, sin contar el pulgar, hay 3 dedos, así que sen(60°) = √3/2. Del anular al meñique, sin contar el anular, hay 1 dedo, así que cos(60°) = √1/2 = 1/2.",
      "Usa el dibujo: toca un dedo y mira cómo se pintan de azul los dedos que cuentan para el seno y de naranja los que cuentan para el coseno.",
    ],
    visuales: [{ tipo: "trigonometria.mano", despuesDePaso: 3 }],
    quiz: [
      preg("Usando el truco de la mano, ¿cuánto vale $\\operatorname{sen}(90^{\\circ})$ (dedo meñique)?", "$1$", [mval("sen", 60), mval("sen", 30), "$0$"], "Del pulgar al meñique, sin contar el pulgar, hay 4 dedos: $\\frac{\\sqrt{4}}{2}=1$, el valor máximo posible del seno."),
      preg("Usando el truco de la mano, ¿cuánto vale $\\cos(0^{\\circ})$ (dedo pulgar)?", "$1$", ["$0$", mval("cos", 60), mval("cos", 45)], "Del pulgar (sin contarlo) al meñique hay 4 dedos: $\\frac{\\sqrt{4}}{2}=1$."),
      preg("Con el dedo anular ($60^{\\circ}$), el truco da $\\operatorname{sen}(60^{\\circ})=\\frac{\\sqrt{3}}{2}$ y $\\cos(60^{\\circ})=\\frac{1}{2}$. ¿Cuál afirmación es correcta?", "$\\operatorname{sen}(60^{\\circ})$ es mayor que $\\cos(60^{\\circ})$", ["$\\operatorname{sen}(60^{\\circ})$ es igual a $\\cos(60^{\\circ})$", "$\\cos(60^{\\circ})$ es mayor que $\\operatorname{sen}(60^{\\circ})$", "Ninguno de los dos se puede saber sin calculadora"], "$\\frac{\\sqrt{3}}{2}\\approx 0{,}87$ es mayor que $\\frac{1}{2}$: a $60^{\\circ}$, más cerca de $90^{\\circ}$ que de $0^{\\circ}$, el seno ya domina."),
      preg("¿Con qué dedo el seno vale $\\dfrac{\\sqrt{2}}{2}$?", "Con el medio ($45^{\\circ}$)", ["Con el índice ($30^{\\circ}$)", "Con el anular ($60^{\\circ}$)", "Con el meñique ($90^{\\circ}$)"], "Del pulgar (sin contarlo) al medio hay 2 dedos: $\\operatorname{sen}(45^{\\circ})=\\frac{\\sqrt{2}}{2}$. El índice da $\\frac{\\sqrt{1}}{2}=\\frac{1}{2}$ y el anular $\\frac{\\sqrt{3}}{2}$."),
    ],
  },

  // ---------------------------------------------------------------- 3 (existente: 0108 + quiz 0177)
  {
    slug: "trigonometria-simetria-cuadrantes",
    grupo: "circulo",
    orden: 3,
    requierePro: false,
    existente: true,
    nombre: "Simetría por cuadrante: ángulo de referencia y signos",
    descripcion: "Con el primer cuadrante memorizado, los otros tres se derivan por simetría: solo cambia el signo.",
    conceptos: { introduce: ["cuadrantes", "signos-cuadrantes", "angulo-referencia"], usa: ["valores-exactos"] },
    pasos: [
      "El ángulo de referencia es la distancia al eje horizontal más cercano: cuadrante II = 180° − θ; cuadrante III = θ − 180°; cuadrante IV = 360° − θ.",
      "El VALOR (sin signo) es el mismo que el del ángulo de referencia en el primer cuadrante: lo único que cambia entre cuadrantes es el signo.",
      "Los signos, en sentido antihorario desde el cuadrante I: Todas positivas; Seno positivo (II); Tangente positiva (III); Coseno positivo (IV). Se recuerda como «Todos, Seno, Tangente, Coseno» (en inglés, ASTC).",
      "Con el primer cuadrante memorizado y esta regla de signos, los cuatro cuadrantes salen sin tabla.",
    ],
    visuales: [{ tipo: "trigonometria.cuadrantes", despuesDePaso: 2, titulo: "Referencia de $30^{\\circ}$ en los cuatro cuadrantes", referencia: 30 }],
    quiz: [
      preg("¿Cuál es el ángulo de referencia de $150^{\\circ}$ (cuadrante II)?", "$30^{\\circ}$", ["$60^{\\circ}$", "$150^{\\circ}$", "$210^{\\circ}$"], "En el cuadrante II la referencia es $180^{\\circ}-150^{\\circ}=30^{\\circ}$."),
      preg("Según la regla, ¿en qué cuadrante es POSITIVA la tangente (además del I)?", "Cuadrante III", ["Cuadrante II", "Cuadrante IV", "En ninguno más"], "Todos, Seno, Tangente, Coseno: la tangente es la positiva del cuadrante III (allí $x$ e $y$ son negativos y su cociente es positivo)."),
      preg("¿Qué es lo único que cambia entre el primer cuadrante y los otros tres, una vez que tienes el ángulo de referencia?", "El signo del valor", ["El valor completo: hay que recalcularlo", "Nada: los cuatro cuadrantes dan lo mismo", "Solo cambia para el seno"], "El valor absoluto es el del ángulo de referencia; lo que decide el cuadrante es el signo."),
      preg("¿Cuánto vale $\\operatorname{sen}(300^{\\circ})$?", mval("sen", 300), [mval("sen", 60), mval("cos", 300), mval("tan", 300)], "$300^{\\circ}$ está en el cuadrante IV (seno negativo) con referencia $60^{\\circ}$: $-\\frac{\\sqrt{3}}{2}$. $\\frac{1}{2}$ es el coseno de $300^{\\circ}$."),
    ],
  },

  // ---------------------------------------------------------------- 4 (existente: 0108 + quiz 0177)
  {
    slug: "trigonometria-grados-radianes",
    grupo: "circulo",
    orden: 4,
    requierePro: false,
    existente: true,
    nombre: "Conversión rápida entre grados y radianes",
    descripcion: "Un atajo mental para no multiplicar por π/180 cada vez que aparece un ángulo notable.",
    conceptos: { introduce: ["radian", "conversion-grados-radianes"], usa: [] },
    pasos: [
      "Regla general: de grados a radianes se multiplica por π/180; de radianes a grados, por 180/π. En el fondo todo sale de π radianes = 180°.",
      "Atajo: 180° = π, así que 90° = π/2, 60° = π/3, 45° = π/4 y 30° = π/6. Son los cuatro que conviene saber de memoria.",
      "El resto de los ángulos notables se arman sumando o restando esos: 120° = 2π/3 (el doble de π/3) y 210° = 7π/6 (π + π/6).",
      "Si dudas, escribe primero qué fracción de vuelta es (60° es 1/6 de 360°) y multiplícala por 2π: (1/6) · 2π = π/3. Es más lento, pero siempre funciona.",
    ],
    visuales: [{ tipo: "trigonometria.circulo", despuesDePaso: 2, titulo: "Grados y radianes", angulos: [30, 45, 60, 90, 120, 210], unidad: "ambas", valores: false }],
    quiz: [
      preg("¿Cuántos radianes son $60^{\\circ}$?", mrd(60), [mrd(30), mrd(45), mrd(90)], "$60^{\\circ}$ es uno de los cuatro ángulos base: $90^{\\circ}=\\frac{\\pi}{2}$, $60^{\\circ}=\\frac{\\pi}{3}$, $45^{\\circ}=\\frac{\\pi}{4}$ y $30^{\\circ}=\\frac{\\pi}{6}$."),
      preg("Con el atajo de sumar o restar los ángulos base, ¿cuántos radianes son $120^{\\circ}$?", mrd(120), [mrd(60), m("\\dfrac{4\\pi}{3}"), m("\\dfrac{3\\pi}{2}")], "$120^{\\circ}$ es el doble de $60^{\\circ}$, así que sus radianes son el doble de $\\frac{\\pi}{3}$: $\\frac{2\\pi}{3}$."),
      preg("Con el atajo de sumar $180^{\\circ}$ y el ángulo base, ¿cuántos radianes son $210^{\\circ}$?", mrd(210), [mrd(30), m("\\dfrac{6\\pi}{7}"), mrd(330)], "$210^{\\circ}=180^{\\circ}+30^{\\circ}$, es decir $\\pi+\\frac{\\pi}{6}=\\frac{7\\pi}{6}$."),
      preg("¿Cuántos grados son $\\dfrac{\\pi}{4}$ radianes?", "$45^{\\circ}$", ["$30^{\\circ}$", "$60^{\\circ}$", "$90^{\\circ}$"], "Se reemplaza $\\pi$ por $180^{\\circ}$: $\\frac{180^{\\circ}}{4}=45^{\\circ}$."),
    ],
  },

  // ---------------------------------------------------------------- 5
  {
    slug: "trigonometria-tecnica-coterminales",
    grupo: "circulo",
    orden: 5,
    requierePro: false,
    nombre: "Suma o resta vueltas: ángulos coterminales",
    descripcion: "Cómo reducir un ángulo negativo o de más de una vuelta a uno entre 0° y 360° con el que se calcula igual.",
    conceptos: { introduce: ["posicion-estandar", "angulo-negativo", "angulo-coterminal"], usa: ["cuadrantes"] },
    pasos: [
      "Un ángulo positivo gira en sentido antihorario y uno negativo en sentido horario. Una vuelta completa son $360^{\\circ}$ (o $2\\pi$ radianes).",
      "Ángulos coterminales terminan en el mismo lugar: $\\theta+360^{\\circ}\\cdot k$ (o $\\theta+2\\pi k$), con $k$ entero. Tienen las mismas razones trigonométricas.",
      `Para reducir un ángulo, suma o resta vueltas hasta quedar entre $0^{\\circ}$ y $360^{\\circ}$: $780^{\\circ}-2\\cdot 360^{\\circ}=${red780}^{\\circ}$; $-45^{\\circ}+360^{\\circ}=${red390}^{\\circ}$.`,
      `Así, ${m(`\\operatorname{sen}(780^{\\circ})=\\operatorname{sen}(${red780}^{\\circ})`)} y ${m(`\\cos(-45^{\\circ})=\\cos(${red390}^{\\circ})`)}, y con los valores exactos se calculan sin calculadora.`,
    ],
    visuales: [{ tipo: "trigonometria.circulo", despuesDePaso: 2, titulo: "$-45^{\\circ}$, $315^{\\circ}$ y $675^{\\circ}$ terminan en el mismo punto", angulos: [-45, 315, 675], unidad: "grados" }],
    quiz: [
      preg("¿A qué ángulo entre $0^{\\circ}$ y $360^{\\circ}$ equivale $780^{\\circ}$?", `$${red780}^{\\circ}$`, ["$420^{\\circ}$", "$300^{\\circ}$", "$140^{\\circ}$"], `Se restan dos vueltas: $780-720=${red780}$. $420^{\\circ}$ resta una sola vuelta y sigue pasando de $360^{\\circ}$.`),
      preg("¿A qué ángulo entre $0^{\\circ}$ y $360^{\\circ}$ equivale $-45^{\\circ}$?", `$${red390}^{\\circ}$`, ["$45^{\\circ}$", "$135^{\\circ}$", "$225^{\\circ}$"], `Se suma una vuelta: $-45+360=${red390}$. $45^{\\circ}$ termina en el cuadrante I y $-45^{\\circ}$ en el IV.`),
      preg("¿Cuánto vale $\\operatorname{sen}(390^{\\circ})$?", mval("sen", 30), [mval("sen", 60), mval("sen", 210), mval("tan", 30)], "$390^{\\circ}=360^{\\circ}+30^{\\circ}$ es coterminal con $30^{\\circ}$, así que $\\operatorname{sen}(390^{\\circ})=\\operatorname{sen}(30^{\\circ})=\\frac{1}{2}$."),
      preg("¿Cuál de estos ángulos es coterminal con $30^{\\circ}$?", "$-330^{\\circ}$", ["$-30^{\\circ}$", "$210^{\\circ}$", "$150^{\\circ}$"], "$-330^{\\circ}+360^{\\circ}=30^{\\circ}$. Los otros terminan en otro cuadrante."),
    ],
  },
];
