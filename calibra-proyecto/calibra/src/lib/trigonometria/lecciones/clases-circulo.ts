import { cuadranteDe, coterminalesEn, normalizarGrados, referenciaGrados } from "@/lib/trigonometria/angulos";
import type { ClaseTrigonometria } from "./tipos";
import { cuadros, d, dt, f, gr, m, mgr, mrd, mval, preg, rd, val } from "./ayudas";

// Clases del bloque "circulo" (Pro): ángulos en el plano (cuadrantes y
// coterminales), radianes, el círculo unitario con los valores exactos, y el
// ángulo de referencia con los signos por cuadrante. Todos los valores exactos y
// las conversiones salen de código (exactos.ts, angulos.ts), no de la cabeza.

const grande = 1000;
const enCuadrante1000 = normalizarGrados(grande); // 1000° -> 280°
const coter780 = normalizarGrados(780); // 780° -> 60°

// Una fila de la tabla del primer cuadrante: 30° -> sen, cos y tan con valores exactos.
const fila = (g: number) => `${f("cos", gr(g))}=${val("cos", g)},\\quad ${f("sen", gr(g))}=${val("sen", g)},\\quad ${f("tan", gr(g))}=${val("tan", g)}`;

export const CLASES_TRIGONOMETRIA_CIRCULO: ClaseTrigonometria[] = [
  // ---------------------------------------------------------------- 8
  {
    slug: "trigonometria-clase-08-angulos-cuadrantes-coterminales",
    grupo: "circulo",
    orden: 1,
    requierePro: true,
    nombre: "Ángulos en el plano: cuadrantes y coterminales",
    descripcion: "Ángulos de cualquier tamaño (positivos, negativos, de más de una vuelta), su posición estándar y los que terminan en el mismo lugar.",
    conceptos: { introduce: ["posicion-estandar", "cuadrantes", "angulo-negativo", "angulo-coterminal"], usa: ["plano-cartesiano"] },
    pasos: [
      "Objetivo: al terminar podrás ubicar en el plano cualquier ángulo (positivo, negativo o de más de una vuelta), decir en qué cuadrante termina y encontrar otros ángulos que terminan en el mismo lugar.",
      "Intuición. Hasta ahora los ángulos vivían dentro de un triángulo, entre $0^{\\circ}$ y $90^{\\circ}$. Pero una rueda, un aspa o una persona que da media vuelta giran cualquier cantidad. Para hablar de esos giros, un ángulo se piensa como una rotación: cuánto se gira y en qué sentido.",
      "Posición estándar. El ángulo se dibuja en el plano cartesiano con el vértice en el origen. Su lado inicial es el semieje $x$ positivo; el lado terminal se obtiene girando. Si el giro es en sentido contrario a las agujas del reloj (antihorario), el ángulo es positivo; si es en el sentido de las agujas del reloj (horario), es negativo.",
      "Cuadrantes. Los ejes dividen el plano en cuatro cuadrantes, numerados en sentido antihorario: I ($0^{\\circ}$ a $90^{\\circ}$), II ($90^{\\circ}$ a $180^{\\circ}$), III ($180^{\\circ}$ a $270^{\\circ}$) y IV ($270^{\\circ}$ a $360^{\\circ}$). Los ángulos de $0^{\\circ}$, $90^{\\circ}$, $180^{\\circ}$ y $270^{\\circ}$ caen sobre los ejes y no pertenecen a ningún cuadrante.",
      `Ángulos negativos y de más de una vuelta. El ángulo $-60^{\\circ}$ gira $60^{\\circ}$ en sentido horario y termina en el cuadrante IV. El ángulo $390^{\\circ}$ da una vuelta completa ($360^{\\circ}$) y sigue otros $30^{\\circ}$: termina en el mismo lugar que $30^{\\circ}$.`,
      "Ángulos coterminales. Dos ángulos son coterminales si tienen el mismo lado terminal. Se obtienen sumando o restando vueltas completas: $\\theta+360^{\\circ}\\cdot k$, con $k$ entero. Por ejemplo, $30^{\\circ}$, $390^{\\circ}$ y $-330^{\\circ}$ son coterminales. Todos terminan en el mismo punto, así que después tendrán las mismas razones trigonométricas.",
      `Ejemplo resuelto. ¿En qué cuadrante termina un ángulo de $${grande}^{\\circ}$? Se le restan vueltas completas hasta quedar entre $0^{\\circ}$ y $360^{\\circ}$: $${grande}-2\\cdot 360=${enCuadrante1000}$, así que es coterminal con $${enCuadrante1000}^{\\circ}$, que está entre $270^{\\circ}$ y $360^{\\circ}$: cuadrante IV.`,
      "Errores comunes. 1) Girar en el sentido equivocado con un ángulo negativo. 2) Restar $180^{\\circ}$ en lugar de $360^{\\circ}$: una vuelta completa son $360^{\\circ}$. 3) Pensar que los ángulos negativos «no existen» o que un ángulo de más de $360^{\\circ}$ es un error: son giros válidos.",
    ],
    visuales: [
      { tipo: "trigonometria.circulo", despuesDePaso: 3, titulo: "Un ángulo en cada cuadrante", angulos: [30, 120, 210, 300], unidad: "grados", valores: false },
      { tipo: "trigonometria.circulo", despuesDePaso: 4, titulo: "Un giro horario y un giro de más de una vuelta", angulos: [-60, 390], unidad: "grados", valores: false },
      cuadros(6, "En qué cuadrante termina un ángulo de 1000°", [
        { texto: "Cuenta las vueltas completas que caben en el ángulo.", formula: `${grande}\\div 360\\approx 2{,}78\\ \\Rightarrow\\ 2\\ \\text{vueltas}` },
        { texto: "Réstalas.", formula: `${grande}-2\\cdot 360=${enCuadrante1000}` },
        { texto: `Ubica ${enCuadrante1000}° entre 270° y 360°.`, resaltar: `Cuadrante ${cuadranteDe(enCuadrante1000)}` },
      ]),
    ],
    quiz: [
      preg("¿En qué cuadrante termina un ángulo de $150^{\\circ}$?", "Cuadrante II", ["Cuadrante I", "Cuadrante III", "Cuadrante IV"], "$150^{\\circ}$ está entre $90^{\\circ}$ y $180^{\\circ}$: cuadrante II."),
      preg("El ángulo $-60^{\\circ}$ representa…", "un giro de $60^{\\circ}$ en sentido horario", ["un giro de $60^{\\circ}$ en sentido antihorario", "un giro de $-60$ vueltas", "un ángulo imposible"], "El signo indica el sentido: positivo, antihorario; negativo, horario. Por eso $-60^{\\circ}$ termina en el cuadrante IV, igual que $300^{\\circ}$."),
      preg(`¿Cuál es el ángulo coterminal con $780^{\\circ}$ que está entre $0^{\\circ}$ y $360^{\\circ}$?`, `$${coter780}^{\\circ}$`, ["$420^{\\circ}$", "$300^{\\circ}$", "$120^{\\circ}$"], `Se restan dos vueltas: $780-720=${coter780}$. El valor $420^{\\circ}$ solo resta una vuelta (y sigue siendo mayor que $360^{\\circ}$) y $300^{\\circ}$ es el reflejo $360^{\\circ}-60^{\\circ}$.`),
      preg("¿Cuál de estos ángulos es coterminal con $30^{\\circ}$?", "$-330^{\\circ}$", ["$210^{\\circ}$", "$-30^{\\circ}$", "$150^{\\circ}$"], "$-330^{\\circ}+360^{\\circ}=30^{\\circ}$: terminan en el mismo lugar. $-30^{\\circ}$ termina en el cuadrante IV y $150^{\\circ}$ en el II."),
      preg("El ángulo de $270^{\\circ}$ está…", "sobre el semieje $y$ negativo, sin pertenecer a ningún cuadrante", ["en el cuadrante III", "en el cuadrante IV", "sobre el semieje $x$ negativo"], "Los ángulos de $0^{\\circ}$, $90^{\\circ}$, $180^{\\circ}$ y $270^{\\circ}$ caen sobre los ejes. $270^{\\circ}$ es tres cuartos de vuelta: el semieje $y$ negativo."),
    ],
  },

  // ---------------------------------------------------------------- 9
  {
    slug: "trigonometria-clase-09-radianes",
    grupo: "circulo",
    orden: 2,
    requierePro: true,
    nombre: "Radianes",
    descripcion: "Qué es un radián, la regla π = 180° para convertir en los dos sentidos y los ángulos que más se usan.",
    conceptos: { introduce: ["radian", "conversion-grados-radianes"], usa: ["longitud-circunferencia", "posicion-estandar"] },
    pasos: [
      "Objetivo: al terminar entenderás qué es un radián, sabrás convertir entre grados y radianes con la regla $\\pi=180^{\\circ}$ y reconocerás los ángulos de uso frecuente en radianes.",
      "Intuición. Los grados son una convención humana: una vuelta se partió en 360 pedazos. El radián nace del propio círculo: un ángulo mide 1 radián cuando el arco que abarca mide lo mismo que el radio. Como la circunferencia mide $2\\pi$ veces el radio, en una vuelta completa caben $2\\pi$ radianes.",
      "La regla que necesitas: una vuelta completa son $360^{\\circ}=2\\pi$ radianes, y media vuelta es $180^{\\circ}=\\pi$ radianes. Todo lo demás sale de ahí: $90^{\\circ}$ es un cuarto de vuelta, $\\frac{\\pi}{2}$ radianes.",
      "Convertir. De grados a radianes se multiplica por $\\frac{\\pi}{180}$; de radianes a grados se multiplica por $\\frac{180}{\\pi}$. Es una regla de tres con $\\pi=180^{\\circ}$. Se suele dejar el resultado en fracciones de $\\pi$, sin pasar a decimales.",
      `Ejemplo resuelto. De grados a radianes: $150^{\\circ}=150\\cdot\\frac{\\pi}{180}=\\frac{5\\pi}{6}$ (se simplifica $\\frac{150}{180}=\\frac{5}{6}$). De radianes a grados: $\\frac{3\\pi}{4}=\\frac{3}{4}\\cdot 180^{\\circ}=135^{\\circ}$. Y para ${mrd(210)}: ${m(rd(210) + "=\\dfrac{7}{6}\\cdot 180^{\\circ}=210^{\\circ}")}.`,
      "Los ángulos de uso frecuente, para tener a la vista: $30^{\\circ}=\\frac{\\pi}{6}$, $45^{\\circ}=\\frac{\\pi}{4}$, $60^{\\circ}=\\frac{\\pi}{3}$, $90^{\\circ}=\\frac{\\pi}{2}$, $120^{\\circ}=\\frac{2\\pi}{3}$, $135^{\\circ}=\\frac{3\\pi}{4}$, $150^{\\circ}=\\frac{5\\pi}{6}$, $180^{\\circ}=\\pi$, $270^{\\circ}=\\frac{3\\pi}{2}$ y $360^{\\circ}=2\\pi$. Los demás se arman sumando: $210^{\\circ}=180^{\\circ}+30^{\\circ}=\\pi+\\frac{\\pi}{6}=\\frac{7\\pi}{6}$.",
      `Un radián son unos ${d(180 / Math.PI, 1)} grados (porque $\\frac{180}{\\pi}\\approx ${dt(180 / Math.PI, 1)}$). Si un número acompaña a $\\pi$ (como $\\frac{5\\pi}{6}$), casi seguro es un ángulo en radianes; si tiene el símbolo de grado, está en grados.`,
      `Errores comunes. 1) Calculadora en el modo equivocado: en radianes, $\\operatorname{sen}(30)$ vale $${dt(Math.sin(30))}$ y no $0{,}5$. Antes de cada cuenta mira si dice DEG (grados) o RAD (radianes). 2) Multiplicar por $\\frac{180}{\\pi}$ cuando se quería pasar a radianes (o al revés). 3) Olvidar que $\\frac{\\pi}{2}$ radianes son $90^{\\circ}$, no $180^{\\circ}$.`,
    ],
    visuales: [
      { tipo: "trigonometria.circulo", despuesDePaso: 3, titulo: "Grados y radianes del mismo giro", angulos: [30, 45, 60, 90, 150, 180, 270, 360], unidad: "ambas", valores: false },
      cuadros(4, "Convertir sin equivocarse", [
        { texto: "De grados a radianes: multiplica por π/180 y simplifica.", formula: "150^{\\circ}\\cdot\\dfrac{\\pi}{180}=\\dfrac{150\\pi}{180}=\\dfrac{5\\pi}{6}" },
        { texto: "De radianes a grados: reemplaza π por 180°.", formula: "\\dfrac{3\\pi}{4}=\\dfrac{3\\cdot 180^{\\circ}}{4}=135^{\\circ}" },
      ]),
    ],
    quiz: [
      preg("¿Cuántos radianes son $60^{\\circ}$?", mrd(60), [mrd(30), mrd(45), mrd(120)], "$60^{\\circ}=\\frac{60}{180}\\pi=\\frac{\\pi}{3}$. $\\frac{\\pi}{6}$ son $30^{\\circ}$, $\\frac{\\pi}{4}$ son $45^{\\circ}$ y $\\frac{2\\pi}{3}$ son $120^{\\circ}$."),
      preg("¿Cuántos grados son $\\dfrac{3\\pi}{4}$ radianes?", "$135^{\\circ}$", ["$120^{\\circ}$", "$225^{\\circ}$", "$270^{\\circ}$"], "Se reemplaza $\\pi$ por $180^{\\circ}$: $\\frac{3\\cdot 180^{\\circ}}{4}=135^{\\circ}$."),
      preg("¿A cuántos radianes equivale una vuelta completa?", "$2\\pi$", ["$\\pi$", "$360$", "$\\dfrac{\\pi}{2}$"], "Una vuelta completa son $360^{\\circ}=2\\pi$ radianes: la circunferencia mide $2\\pi$ veces el radio. $\\pi$ es media vuelta."),
      preg(`Con la calculadora en radianes, ¿qué muestra al calcular $\\operatorname{sen}(30)$?`, `$${dt(Math.sin(30))}$`, ["$0{,}5$", "$1$", "$0$"], `Interpreta 30 como 30 radianes y da $${dt(Math.sin(30))}$. Para obtener $\\operatorname{sen}(30^{\\circ})=0{,}5$ hay que cambiar a modo grados.`),
      preg("¿Cuál es, aproximadamente, la medida de un radián en grados?", "$57{,}3^{\\circ}$", ["$3{,}14^{\\circ}$", "$180^{\\circ}$", "$1^{\\circ}$"], "Como $\\pi$ radianes son $180^{\\circ}$, un radián son $\\frac{180}{\\pi}\\approx 57{,}3^{\\circ}$."),
    ],
  },

  // ---------------------------------------------------------------- 10
  {
    slug: "trigonometria-clase-10-circulo-unitario-y-valores-exactos",
    grupo: "circulo",
    orden: 3,
    requierePro: true,
    nombre: "El círculo unitario y los valores exactos",
    descripcion: "Seno y coseno como las coordenadas de un punto del círculo de radio 1, para ángulos de cualquier tamaño, y los valores exactos de los ángulos notables.",
    conceptos: {
      introduce: ["circulo-unitario", "valores-exactos", "razones-cualquier-angulo", "relacion-pitagorica-circulo"],
      usa: ["cuadrantes", "radian", "valores-notables-agudos", "razon-seno", "razon-coseno", "razon-tangente"],
    },
    pasos: [
      "Objetivo: al terminar podrás leer el seno y el coseno de un ángulo cualquiera como las coordenadas de un punto del círculo de radio 1, y conocerás los valores exactos de los ángulos notables.",
      "Intuición. En un triángulo rectángulo con hipotenusa 1, las razones se simplifican: $\\operatorname{sen}=\\frac{\\text{opuesto}}{1}$ y $\\cos=\\frac{\\text{adyacente}}{1}$ son directamente las longitudes de los catetos. Si ese triángulo se dibuja dentro de un círculo de radio 1, los catetos son las coordenadas del punto donde termina el lado del ángulo.",
      "El círculo unitario tiene centro en el origen y radio 1. Para un ángulo $\\theta$ en posición estándar, su lado terminal corta al círculo en un punto $P(x,y)$. Se define: $\\cos(\\theta)=x$ y $\\operatorname{sen}(\\theta)=y$, y también $\\tan(\\theta)=\\frac{y}{x}$ cuando $x\\neq 0$. Esta definición sirve para ángulos de cualquier tamaño, no solo los agudos.",
      "Coherencia con lo anterior. Para un ángulo agudo, el punto $P$, su pie sobre el eje $x$ y el origen forman un triángulo rectángulo de hipotenusa 1, con cateto adyacente $x$ y cateto opuesto $y$: $\\cos=\\frac{x}{1}$ y $\\operatorname{sen}=\\frac{y}{1}$, igual que antes. El círculo extiende esas razones a ángulos de cualquier tamaño (incluidos los negativos y los de más de una vuelta).",
      "Una relación que sale gratis: como $P$ está sobre el círculo de radio 1, cumple $x^{2}+y^{2}=1$. Es decir, $\\cos^{2}(\\theta)+\\operatorname{sen}^{2}(\\theta)=1$ para cualquier ángulo. Sirve, por ejemplo, para hallar $\\operatorname{sen}(\\theta)$ si se conoce $\\cos(\\theta)$: si $\\cos(\\theta)=0{,}6$, entonces $\\operatorname{sen}^{2}(\\theta)=1-0{,}36=0{,}64$ y $|\\operatorname{sen}(\\theta)|=0{,}8$ (el signo lo decide el cuadrante).",
      `Valores exactos del primer cuadrante. Con los triángulos especiales (clase 6): ${m(fila(30))}; ${m(fila(45))}; ${m(fila(60))}. Las razones de $0^{\\circ}$ y $90^{\\circ}$ salen de los ejes: ${m(fila(0))}; y en $90^{\\circ}$: ${m(`${f("cos", gr(90))}=${val("cos", 90)},\\quad ${f("sen", gr(90))}=${val("sen", 90)}`)}, mientras que $\\tan(90^{\\circ})$ no existe: $x=0$ y no se puede dividir entre 0.`,
      "En los otros ejes: $180^{\\circ}$ corresponde al punto $(-1,0)$, así que $\\cos(180^{\\circ})=-1$ y $\\operatorname{sen}(180^{\\circ})=0$; $270^{\\circ}$ corresponde a $(0,-1)$, así que $\\cos(270^{\\circ})=0$, $\\operatorname{sen}(270^{\\circ})=-1$ y su tangente tampoco existe. Cuando una razón no existe se dice que es indefinida.",
      "Errores comunes. 1) Confundir cuál coordenada es cuál: el coseno es la coordenada $x$ (horizontal) y el seno la $y$ (vertical); en el alfabeto, la c va antes que la s, como la $x$ antes que la $y$. 2) Decir que $\\tan(90^{\\circ})$ vale 0 o infinito: es indefinida. 3) Olvidar los signos fuera del primer cuadrante (la próxima clase los ordena).",
    ],
    visuales: [
      { tipo: "trigonometria.circulo", despuesDePaso: 2, titulo: "Seno y coseno como coordenadas", angulos: [30, 60, 120, 240], unidad: "ambas" },
      cuadros(5, "Valores exactos del primer cuadrante", [
        { texto: "Punto del círculo para $0^{\\circ}$: $(1,\\,0)$.", formula: fila(0) },
        { texto: "$30^{\\circ}$ (medio equilátero).", formula: fila(30) },
        { texto: "$45^{\\circ}$ (medio cuadrado).", formula: fila(45) },
        { texto: "$60^{\\circ}$.", formula: fila(60) },
        { texto: "$90^{\\circ}$: la tangente no existe.", formula: `${f("cos", gr(90))}=${val("cos", 90)},\\quad ${f("sen", gr(90))}=${val("sen", 90)}` },
      ]),
      { tipo: "trigonometria.circulo", despuesDePaso: 6, titulo: "Los ángulos que caen sobre los ejes", angulos: [90, 180, 270, 360], unidad: "ambas" },
    ],
    quiz: [
      preg("En el círculo unitario, ¿qué coordenada del punto es el coseno del ángulo?", "La coordenada $x$ (horizontal)", ["La coordenada $y$ (vertical)", "La distancia al origen", "El cociente $\\dfrac{y}{x}$"], "El coseno es $x$ y el seno es $y$. La distancia al origen es siempre 1 (el radio) y $\\frac{y}{x}$ es la tangente."),
      preg("Un punto del círculo unitario es $\\left(\\dfrac{\\sqrt{2}}{2},\\dfrac{\\sqrt{2}}{2}\\right)$. ¿Qué ángulo del primer cuadrante es y cuánto vale su tangente?", "$45^{\\circ}$ y $\\tan=1$", ["$30^{\\circ}$ y $\\tan=\\dfrac{\\sqrt{3}}{3}$", "$60^{\\circ}$ y $\\tan=\\sqrt{3}$", "$45^{\\circ}$ y $\\tan=\\dfrac{\\sqrt{2}}{2}$"], "Con $x=y$ el ángulo es de $45^{\\circ}$, y la tangente es $\\frac{y}{x}=1$. $\\frac{\\sqrt{2}}{2}$ es el valor del seno y del coseno, no de la tangente."),
      preg("¿Cuánto valen $\\cos(90^{\\circ})$ y $\\tan(90^{\\circ})$?", "$\\cos(90^{\\circ})=0$ y la tangente es indefinida", ["$\\cos(90^{\\circ})=1$ y $\\tan(90^{\\circ})=0$", "$\\cos(90^{\\circ})=0$ y $\\tan(90^{\\circ})=0$", "$\\cos(90^{\\circ})=1$ y $\\tan(90^{\\circ})$ es indefinida"], "En $90^{\\circ}$ el punto es $(0,1)$: $\\cos=0$ y $\\operatorname{sen}=1$. La tangente sería $\\frac{1}{0}$, que no se puede calcular: es indefinida."),
      preg("¿Cuánto vale $\\operatorname{sen}(180^{\\circ})$?", "$0$", ["$1$", "$-1$", "Es indefinido"], "En $180^{\\circ}$ el punto es $(-1,0)$: la coordenada $y$ es 0. El seno siempre existe; solo la tangente puede ser indefinida."),
      preg("Si $\\cos(\\theta)=0{,}6$, ¿cuánto vale $|\\operatorname{sen}(\\theta)|$?", "$0{,}8$", ["$0{,}4$", "$0{,}6$", "$1{,}6$"], "Como $\\cos^{2}+\\operatorname{sen}^{2}=1$: $\\operatorname{sen}^{2}=1-0{,}36=0{,}64$, y su raíz es $0{,}8$. $0{,}4=1-0{,}6$ no respeta los cuadrados."),
    ],
  },

  // ---------------------------------------------------------------- 11
  {
    slug: "trigonometria-clase-11-angulo-de-referencia-y-signos",
    grupo: "circulo",
    orden: 4,
    requierePro: true,
    nombre: "Ángulo de referencia y signos por cuadrante",
    descripcion: "Cómo obtener sen, cos y tan de cualquier ángulo a partir del primer cuadrante y decidir el signo con el cuadrante.",
    conceptos: {
      introduce: ["angulo-referencia", "signos-cuadrantes"],
      usa: ["cuadrantes", "circulo-unitario", "valores-exactos", "relacion-pitagorica-circulo", "razones-cualquier-angulo"],
    },
    pasos: [
      "Objetivo: al terminar podrás calcular el valor exacto del seno, el coseno y la tangente de cualquier ángulo notable (en cualquier cuadrante) usando el ángulo de referencia y los signos, sin memorizar cada caso.",
      "Intuición. Los puntos del círculo para $30^{\\circ}$, $150^{\\circ}$, $210^{\\circ}$ y $330^{\\circ}$ son reflejos unos de otros respecto de los ejes. Tienen la misma distancia al eje $x$ y al eje $y$, así que sus coordenadas son iguales en valor absoluto y solo cambia el signo. Por eso alcanza con conocer bien el primer cuadrante.",
      "Ángulo de referencia. Es el ángulo agudo que forma el lado terminal con el eje $x$ (el más cercano). En el cuadrante I es el propio ángulo $\\theta$; en el II, $180^{\\circ}-\\theta$; en el III, $\\theta-180^{\\circ}$; y en el IV, $360^{\\circ}-\\theta$. Se cuenta siempre desde el eje $x$, nunca desde el eje $y$.",
      "La regla: el valor absoluto de $\\operatorname{sen}(\\theta)$, $\\cos(\\theta)$ y $\\tan(\\theta)$ es el de su ángulo de referencia (los valores del primer cuadrante). Solo falta decidir el signo.",
      "El signo sale de las coordenadas: el seno tiene el signo de $y$, el coseno el de $x$ y la tangente el de $\\frac{y}{x}$. En el cuadrante I todas son positivas. En el II, $x<0$ y $y>0$: solo el seno es positivo. En el III, $x<0$ y $y<0$: solo la tangente es positiva. En el IV, $x>0$ y $y<0$: solo el coseno es positivo. Se recuerda como «Todos, Seno, Tangente, Coseno».",
      `Ejemplos resueltos. ${m(`${f("sen", gr(210))}`)}: $210^{\\circ}$ está en el cuadrante III, su referencia es $30^{\\circ}$ y el seno es negativo allí: ${mval("sen", 210)}. ${m(`${f("cos", gr(315))}`)}: cuadrante IV, referencia $45^{\\circ}$, coseno positivo: ${mval("cos", 315)}. ${m(`${f("tan", gr(120))}`)}: cuadrante II, referencia $60^{\\circ}$, tangente negativa: ${mval("tan", 120)}.`,
      "Otro problema típico: si $\\operatorname{sen}(\\theta)=\\frac{3}{5}$ y $\\theta$ está en el cuadrante II, ¿cuánto valen $\\cos(\\theta)$ y $\\tan(\\theta)$? Con $x^{2}+y^{2}=1$: $\\cos^{2}(\\theta)=1-\\frac{9}{25}=\\frac{16}{25}$, así que $|\\cos(\\theta)|=\\frac{4}{5}$. En el cuadrante II el coseno es negativo: $\\cos(\\theta)=-\\frac{4}{5}$. Entonces $\\tan(\\theta)=\\frac{3/5}{-4/5}=-\\frac{3}{4}$.",
      "Errores comunes. 1) Medir la referencia desde el eje $y$: la referencia de $120^{\\circ}$ es $60^{\\circ}$ (hasta el eje $x$ en $180^{\\circ}$), no $30^{\\circ}$. 2) Poner el signo del cuadrante equivocado: revisa qué coordenada es positiva. 3) Cambiar el valor además del signo: solo cambia el signo, la magnitud es la de la referencia.",
    ],
    visuales: [
      { tipo: "trigonometria.cuadrantes", despuesDePaso: 4, titulo: "Un ángulo de referencia de $30^{\\circ}$ en los cuatro cuadrantes", referencia: 30 },
      { tipo: "trigonometria.circulo", despuesDePaso: 2, titulo: "Ángulo de referencia", angulos: [150, 210, 330], unidad: "grados", mostrar: ["referencia"] },
      cuadros(5, "Tres ejemplos con referencia y signo", [
        { texto: "$210^{\\circ}$: cuadrante III, referencia $30^{\\circ}$, el seno es negativo.", formula: `${f("sen", gr(210))}=${val("sen", 210)}` },
        { texto: "$315^{\\circ}$: cuadrante IV, referencia $45^{\\circ}$, el coseno es positivo.", formula: `${f("cos", gr(315))}=${val("cos", 315)}` },
        { texto: "$120^{\\circ}$: cuadrante II, referencia $60^{\\circ}$, la tangente es negativa.", formula: `${f("tan", gr(120))}=${val("tan", 120)}` },
      ]),
    ],
    quiz: [
      preg("¿Cuánto vale $\\operatorname{sen}(210^{\\circ})$?", mval("sen", 210), [mval("sen", 30), mval("cos", 210), mval("tan", 210)], "$210^{\\circ}$ está en el cuadrante III (seno negativo) y su referencia es $30^{\\circ}$: $-\\frac{1}{2}$. $\\frac{1}{2}$ olvida el signo y $-\\frac{\\sqrt{3}}{2}$ es el coseno."),
      preg("¿Cuánto vale $\\cos(135^{\\circ})$?", mval("cos", 135), [mval("cos", 45), mval("cos", 120), mval("cos", 60)], "$135^{\\circ}$ está en el cuadrante II (coseno negativo) y su referencia es $45^{\\circ}$: $-\\frac{\\sqrt{2}}{2}$."),
      preg("¿Cuál es el ángulo de referencia de $300^{\\circ}$?", `$${referenciaGrados(300)}^{\\circ}$`, ["$30^{\\circ}$", "$120^{\\circ}$", "$240^{\\circ}$"], "En el cuadrante IV, la referencia es $360^{\\circ}-300^{\\circ}=60^{\\circ}$. El $30^{\\circ}$ sería medir hasta el eje $y$."),
      preg("Si $\\operatorname{sen}(\\theta)=\\dfrac{3}{5}$ y $\\theta$ está en el cuadrante II, ¿cuánto vale $\\cos(\\theta)$?", "$-\\dfrac{4}{5}$", ["$\\dfrac{4}{5}$", "$-\\dfrac{3}{4}$", "$\\dfrac{5}{4}$"], "Por $x^{2}+y^{2}=1$, $|\\cos|=\\frac{4}{5}$, y en el cuadrante II el coseno (la coordenada $x$) es negativo. $-\\frac{3}{4}$ sería la tangente."),
      preg("¿En qué cuadrante son negativos a la vez el seno y la tangente?", "Cuadrante IV", ["Cuadrante I", "Cuadrante II", "Cuadrante III"], "En el IV, $y<0$ y $x>0$: seno negativo, coseno positivo y tangente negativa. En el III el seno es negativo pero la tangente es positiva."),
      preg("¿Cuánto vale $\\tan(240^{\\circ})$?", mval("tan", 240), [mval("tan", 120), mval("tan", 30), mval("sen", 240)], "$240^{\\circ}$ está en el cuadrante III (tangente positiva) con referencia $60^{\\circ}$: $\\sqrt{3}$. Con $-\\sqrt{3}$ se usó un signo equivocado."),
    ],
  },
];

// Comprobaciones de construcción: si un dato cambia y esto deja de valer, el contenido no se genera.
if (enCuadrante1000 !== 280 || coter780 !== 60 || cuadranteDe(280) !== 4) throw new Error("Las cuentas de coterminales de las Clases del círculo no coinciden");
if (coterminalesEn(30, -400, 400).join() !== "-330,30,390" || mgr(30) !== "$30^{\\circ}$") throw new Error("Coterminales de 30° inesperados");
