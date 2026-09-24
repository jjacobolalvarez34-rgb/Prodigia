import { aRad } from "@/lib/trigonometria/triangulos";
import { EQUIVALENCIAS } from "@/lib/trigonometria/identidades";
import { cosExacto, mulE, restaE, senExacto, sumaE, texE } from "@/lib/trigonometria/exactos";
import type { ClaseTrigonometria, PreguntaLeccionTrigonometria } from "./tipos";
import { cuadros, dt, m, preg, val } from "./ayudas";

// Clases del bloque "identidades" (Pro): las identidades fundamentales, el
// ángulo doble y la suma y diferencia de ángulos, y cómo simplificar y verificar
// identidades. Las expresiones equivalentes salen de EQUIVALENCIAS
// (identidades.ts), donde un test comprueba numéricamente que cada una vale en
// decenas de ángulos y que cada distractor falla en alguno; los valores exactos
// (sen 75°, cos 15°...) salen del anillo exacto de exactos.ts.

// Pregunta «¿cuál es equivalente a…?» armada desde el catálogo verificado.
function equivalente(id: string, explicacion: string): PreguntaLeccionTrigonometria {
  const q = EQUIVALENCIAS.find((x) => x.id === id);
  if (!q) throw new Error(`Equivalencia ${id} inexistente`);
  return preg(`¿Cuál de estas expresiones es equivalente a $${q.expr.tex}$?`, `$${q.correcta.tex}$`, q.incorrectas.map((e) => `$${e.tex}$`), explicacion);
}

const s30 = senExacto(30);
const c30 = cosExacto(30);
const s45 = senExacto(45);
const c45 = cosExacto(45);
// sen 75° = sen 45° cos 30° + cos 45° sen 30°  y su error típico sen 45° + sen 30°.
const sen75 = sumaE(mulE(s45, c30), mulE(c45, s30));
const cos15 = sumaE(mulE(c45, c30), mulE(s45, s30));
const errorSuma = sumaE(s45, s30);
const errorSigno = restaE(mulE(s45, c30), mulE(c45, s30)); // sen 15°
const errorProducto = mulE(s45, c30);

// Comprobaciones de construcción: si un dato cambia y esto deja de valer, el contenido no se genera.
if (texE(sen75) !== val("sen", 75) || texE(cos15) !== val("cos", 15) || texE(errorSigno) !== val("sen", 15)) throw new Error("Las cuentas exactas de las Clases de identidades no coinciden con la tabla");
const sen60 = Math.sin(aRad(60));
const dobleMal = 2 * Math.sin(aRad(30));
if (Math.abs(sen60 - dobleMal) < 0.1) throw new Error("El contraejemplo sen(A+B) ≠ sen A + sen B debe distinguirse");

export const CLASES_TRIGONOMETRIA_IDENTIDADES: ClaseTrigonometria[] = [
  // ---------------------------------------------------------------- 23
  {
    slug: "trigonometria-clase-23-identidades-fundamentales",
    grupo: "identidades",
    orden: 1,
    requierePro: true,
    nombre: "Identidades fundamentales",
    descripcion: "Recíprocas, cociente, pitagóricas y cofunciones: las igualdades que traducen unas razones en otras.",
    conceptos: {
      introduce: ["identidad-reciproca", "identidad-cociente", "identidad-pitagorica", "cofunciones"],
      usa: ["razones-reciprocas", "razones-cualquier-angulo", "relacion-pitagorica-circulo", "razon-seno", "razon-coseno", "angulos-triangulo"],
    },
    pasos: [
      "Objetivo: al terminar conocerás las identidades trigonométricas fundamentales, sabrás de dónde salen y las usarás para hallar una razón conociendo otra.",
      "Intuición. Una identidad es una igualdad que se cumple para TODOS los ángulos en los que está definida (una ecuación, en cambio, se cumple solo para algunos). Las identidades fundamentales son reglas de traducción entre las seis razones: si conoces una, puedes conseguir las demás.",
      `Recíprocas. Ya las conoces de la clase 3, ahora escritas como identidades: ${m("\\operatorname{cosec}(x)=\\dfrac{1}{\\operatorname{sen}(x)}")}, ${m("\\sec(x)=\\dfrac{1}{\\cos(x)}")} y ${m("\\cot(x)=\\dfrac{1}{\\tan(x)}")}. Valen para todo ángulo en el que el denominador no sea 0.`,
      "Cociente. En el círculo unitario, $\\tan(x)=\\frac{y}{x}$ y las coordenadas son $x=\\cos(\\theta)$, $y=\\operatorname{sen}(\\theta)$. Entonces $\\tan(x)=\\dfrac{\\operatorname{sen}(x)}{\\cos(x)}$ y, dándola vuelta, $\\cot(x)=\\dfrac{\\cos(x)}{\\operatorname{sen}(x)}$.",
      "Pitagórica. Como el punto del círculo cumple $x^{2}+y^{2}=1$, se tiene $\\operatorname{sen}^{2}(x)+\\cos^{2}(x)=1$, para cualquier ángulo. Si se divide toda la igualdad entre $\\cos^{2}(x)$, sale $1+\\tan^{2}(x)=\\sec^{2}(x)$; y si se divide entre $\\operatorname{sen}^{2}(x)$, sale $1+\\cot^{2}(x)=\\operatorname{cosec}^{2}(x)$. Una sola identidad, tres formas.",
      "Cofunciones. En un triángulo rectángulo los dos ángulos agudos son complementarios (suman $90^{\\circ}$), y el cateto que es opuesto a uno es adyacente al otro. Por eso el seno de un ángulo es el coseno de su complemento: $\\operatorname{sen}(90^{\\circ}-x)=\\cos(x)$, $\\cos(90^{\\circ}-x)=\\operatorname{sen}(x)$ y $\\tan(90^{\\circ}-x)=\\cot(x)$.",
      "Cómo se usan. Si $\\operatorname{sen}(\\theta)=\\frac{3}{5}$ con $\\theta$ en el primer cuadrante: $\\cos^{2}(\\theta)=1-\\frac{9}{25}=\\frac{16}{25}$, así que $\\cos(\\theta)=\\frac{4}{5}$; luego $\\tan(\\theta)=\\frac{3}{4}$ y $\\sec(\\theta)=\\frac{5}{4}$. Otro caso: si $\\tan(\\theta)=2$, entonces $\\sec^{2}(\\theta)=1+4=5$ y $\\sec(\\theta)=\\sqrt{5}$ (con $\\theta$ agudo).",
      `Una cautela. Probar con un ángulo no demuestra una identidad, pero un solo contraejemplo sí la refuta. Por ejemplo, $\\operatorname{sen}(A+B)=\\operatorname{sen}(A)+\\operatorname{sen}(B)$ es falsa: con $A=B=30^{\\circ}$, $\\operatorname{sen}(60^{\\circ})\\approx ${dt(sen60, 3)}$ pero $\\operatorname{sen}(30^{\\circ})+\\operatorname{sen}(30^{\\circ})=1$.`,
      "Errores comunes. 1) Creer que $\\operatorname{sen}^{2}(x)$ significa $\\operatorname{sen}(x^{2})$: significa $(\\operatorname{sen}(x))^{2}$. 2) Confundir secante con cosecante (la secante va con el coseno). 3) Cancelar «sen» como si fuera un número: $\\operatorname{sen}(x)$ es una función. 4) Dividir entre una razón sin comprobar que no vale 0.",
    ],
    visuales: [
      { tipo: "trigonometria.identidad", despuesDePaso: 4, titulo: "Pitágoras sobre el círculo unitario ($\\theta=30^{\\circ}$)", angulo: 30, forma: "derivadas" },
      cuadros(6, "Las identidades fundamentales", [
        { texto: "Recíprocas.", formula: "\\operatorname{cosec}(x)=\\dfrac{1}{\\operatorname{sen}(x)},\\quad \\sec(x)=\\dfrac{1}{\\cos(x)},\\quad \\cot(x)=\\dfrac{1}{\\tan(x)}" },
        { texto: "Cociente.", formula: "\\tan(x)=\\dfrac{\\operatorname{sen}(x)}{\\cos(x)},\\quad \\cot(x)=\\dfrac{\\cos(x)}{\\operatorname{sen}(x)}" },
        { texto: "Pitagóricas.", formula: "\\operatorname{sen}^{2}(x)+\\cos^{2}(x)=1,\\quad 1+\\tan^{2}(x)=\\sec^{2}(x),\\quad 1+\\cot^{2}(x)=\\operatorname{cosec}^{2}(x)" },
        { texto: "Cofunciones.", formula: "\\operatorname{sen}(90^{\\circ}-x)=\\cos(x),\\quad \\cos(90^{\\circ}-x)=\\operatorname{sen}(x),\\quad \\tan(90^{\\circ}-x)=\\cot(x)" },
      ], 3200),
    ],
    quiz: [
      preg("¿Cuál es la identidad pitagórica fundamental?", "$\\operatorname{sen}^{2}(x)+\\cos^{2}(x)=1$", ["$\\operatorname{sen}(x)+\\cos(x)=1$", "$\\operatorname{sen}^{2}(x)-\\cos^{2}(x)=1$", "$\\operatorname{sen}(x^{2})+\\cos(x^{2})=1$"], "Viene de $x^{2}+y^{2}=1$ en el círculo unitario, con $x=\\cos$ e $y=\\operatorname{sen}$. Sin los cuadrados no se cumple (con $30^{\\circ}$ suma $1{,}37$), y $\\operatorname{sen}^{2}(x)$ significa $(\\operatorname{sen}(x))^{2}$."),
      preg("Si $\\operatorname{sen}(x)=\\frac{5}{13}$ y $\\cos(x)=\\frac{12}{13}$, ¿cuánto vale $\\tan(x)$?", "$\\dfrac{5}{12}$", ["$\\dfrac{12}{5}$", "$\\dfrac{5}{13}$", "$\\dfrac{60}{169}$"], "$\\tan=\\frac{\\operatorname{sen}}{\\cos}=\\frac{5/13}{12/13}=\\frac{5}{12}$. $\\frac{12}{5}$ es la cotangente y $\\frac{60}{169}$ es el producto."),
      preg("¿A qué es igual $1+\\tan^{2}(x)$?", "$\\sec^{2}(x)$", ["$\\cos^{2}(x)$", "$\\operatorname{cosec}^{2}(x)$", "$\\cot^{2}(x)$"], "Dividiendo $\\operatorname{sen}^{2}+\\cos^{2}=1$ entre $\\cos^{2}$ se obtiene $\\tan^{2}+1=\\sec^{2}$. La cosecante sale al dividir entre $\\operatorname{sen}^{2}$."),
      preg("¿Cuánto vale $\\operatorname{sen}(90^{\\circ}-20^{\\circ})$?", "$\\cos(20^{\\circ})$", ["$\\operatorname{sen}(20^{\\circ})$", "$-\\cos(20^{\\circ})$", "$\\tan(20^{\\circ})$"], "Cofunciones: $\\operatorname{sen}(90^{\\circ}-x)=\\cos(x)$. Es el seno de $70^{\\circ}$, que coincide con el coseno de $20^{\\circ}$."),
      preg("¿Qué significa $\\operatorname{sen}^{2}(x)$?", "$(\\operatorname{sen}(x))^{2}$", ["$\\operatorname{sen}(x^{2})$", "$2\\operatorname{sen}(x)$", "$\\operatorname{sen}(2x)$"], "El exponente sobre el nombre de la función eleva el resultado al cuadrado. $\\operatorname{sen}(x^{2})$ es otra cosa: el seno de $x$ al cuadrado."),
      preg("Si $\\tan(\\theta)=2$ y $\\theta$ es agudo, ¿cuánto vale $\\sec(\\theta)$?", "$\\sqrt{5}$", ["$3$", "$\\dfrac{1}{2}$", "$\\sqrt{3}$"], "$\\sec^{2}=1+\\tan^{2}=1+4=5$, así que $\\sec(\\theta)=\\sqrt{5}$ (positivo porque $\\theta$ es agudo). $3$ sale de sumar $1+2$ sin elevar al cuadrado."),
    ],
  },

  // ---------------------------------------------------------------- 24
  {
    slug: "trigonometria-clase-24-angulo-doble-suma-y-diferencia",
    grupo: "identidades",
    orden: 2,
    requierePro: true,
    nombre: "Ángulo doble, suma y diferencia de ángulos",
    descripcion: "Las razones de A + B, A − B y 2A, por qué sen(A + B) no es sen A + sen B y cómo hallar valores exactos como el de 75°.",
    conceptos: { introduce: ["angulo-doble", "suma-diferencia"], usa: ["valores-exactos", "identidad-pitagorica", "razon-seno", "razon-coseno", "razon-tangente"] },
    pasos: [
      "Objetivo: al terminar podrás calcular el seno, el coseno y la tangente de una suma, una diferencia o el doble de ángulos, y obtener valores exactos como $\\operatorname{sen}(75^{\\circ})$ o $\\cos(15^{\\circ})$.",
      "Intuición. Las razones trigonométricas no son «lineales»: el seno de una suma NO es la suma de los senos. Para calcular el seno de $A+B$ hace falta una regla nueva. Con ella se obtienen valores exactos de ángulos que no están en la tabla, como $75^{\\circ}=45^{\\circ}+30^{\\circ}$ o $15^{\\circ}=45^{\\circ}-30^{\\circ}$.",
      `El contraejemplo. Con $A=B=30^{\\circ}$: $\\operatorname{sen}(A+B)=\\operatorname{sen}(60^{\\circ})\\approx ${dt(sen60, 3)}$, pero $\\operatorname{sen}(A)+\\operatorname{sen}(B)=\\frac{1}{2}+\\frac{1}{2}=1$. Como las dos cuentas no coinciden, la igualdad «distribuir el seno» es FALSA.`,
      "Suma y diferencia. $\\operatorname{sen}(A\\pm B)=\\operatorname{sen}(A)\\cos(B)\\pm\\cos(A)\\operatorname{sen}(B)$ (en el seno, el signo del medio es el mismo). $\\cos(A\\pm B)=\\cos(A)\\cos(B)\\mp\\operatorname{sen}(A)\\operatorname{sen}(B)$ (en el coseno, el signo del medio es el CONTRARIO). $\\tan(A\\pm B)=\\dfrac{\\tan(A)\\pm\\tan(B)}{1\\mp\\tan(A)\\tan(B)}$.",
      `Ejemplo resuelto. ${m("\\operatorname{sen}(75^{\\circ})=\\operatorname{sen}(45^{\\circ}+30^{\\circ})=\\operatorname{sen}(45^{\\circ})\\cos(30^{\\circ})+\\cos(45^{\\circ})\\operatorname{sen}(30^{\\circ})")}. Con los valores exactos: ${m("\\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{\\sqrt{3}}{2}+\\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{1}{2}=\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}")} $\\approx ${dt(Math.sin(aRad(75)), 3)}$. Igual sale ${m("\\cos(15^{\\circ})=\\cos(45^{\\circ}-30^{\\circ})=\\cos(45^{\\circ})\\cos(30^{\\circ})+\\operatorname{sen}(45^{\\circ})\\operatorname{sen}(30^{\\circ})=" + texE(cos15))}, porque $\\operatorname{sen}(75^{\\circ})=\\cos(15^{\\circ})$ (son ángulos complementarios).`,
      "Ángulo doble. Es el caso $A=B=x$ de las fórmulas de suma: $\\operatorname{sen}(2x)=2\\operatorname{sen}(x)\\cos(x)$; $\\cos(2x)=\\cos^{2}(x)-\\operatorname{sen}^{2}(x)$, que con la identidad pitagórica también se escribe $2\\cos^{2}(x)-1$ o $1-2\\operatorname{sen}^{2}(x)$; y $\\tan(2x)=\\dfrac{2\\tan(x)}{1-\\tan^{2}(x)}$.",
      "Ejemplo del doble. Si $\\operatorname{sen}(x)=\\frac{3}{5}$ con $x$ agudo, entonces $\\cos(x)=\\frac{4}{5}$. Luego $\\operatorname{sen}(2x)=2\\cdot\\frac{3}{5}\\cdot\\frac{4}{5}=\\frac{24}{25}$ y $\\cos(2x)=1-2\\cdot\\frac{9}{25}=\\frac{7}{25}$. Se puede comprobar: $\\left(\\frac{24}{25}\\right)^{2}+\\left(\\frac{7}{25}\\right)^{2}=\\frac{576+49}{625}=1$.",
      "Errores comunes. 1) «Distribuir» el seno: $\\operatorname{sen}(A+B)\\neq\\operatorname{sen}(A)+\\operatorname{sen}(B)$. 2) Equivocar el signo del medio en el coseno (es contrario al del ángulo). 3) Escribir $\\operatorname{sen}(2x)=2\\operatorname{sen}(x)$: falta el coseno. 4) Olvidar que $\\cos(2x)$ tiene tres formas equivalentes.",
    ],
    visuales: [
      cuadros(4, "sen 75° con la fórmula de la suma", [
        { texto: "Se descompone el ángulo: $75^{\\circ}=45^{\\circ}+30^{\\circ}$.", formula: "\\operatorname{sen}(45^{\\circ}+30^{\\circ})=\\operatorname{sen}(45^{\\circ})\\cos(30^{\\circ})+\\cos(45^{\\circ})\\operatorname{sen}(30^{\\circ})" },
        { texto: "Se reemplazan los valores exactos.", formula: "\\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{\\sqrt{3}}{2}+\\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{1}{2}" },
        { texto: "Se calcula.", formula: `=${texE(sen75)}` },
      ]),
      cuadros(6, "El doble de un ángulo con $\\operatorname{sen}(x)=\\frac{3}{5}$", [
        { texto: "Del seno se obtiene el coseno con $\\operatorname{sen}^{2}+\\cos^{2}=1$ (x agudo).", formula: "\\cos(x)=\\sqrt{1-\\dfrac{9}{25}}=\\dfrac{4}{5}" },
        { texto: "Seno del doble.", formula: "\\operatorname{sen}(2x)=2\\cdot\\dfrac{3}{5}\\cdot\\dfrac{4}{5}=\\dfrac{24}{25}" },
        { texto: "Coseno del doble.", formula: "\\cos(2x)=1-2\\cdot\\dfrac{9}{25}=\\dfrac{7}{25}" },
      ]),
    ],
    quiz: [
      preg("¿Cuál es la fórmula correcta de $\\operatorname{sen}(A+B)$?", "$\\operatorname{sen}(A)\\cos(B)+\\cos(A)\\operatorname{sen}(B)$", ["$\\operatorname{sen}(A)+\\operatorname{sen}(B)$", "$\\operatorname{sen}(A)\\cos(B)-\\cos(A)\\operatorname{sen}(B)$", "$\\cos(A)\\cos(B)-\\operatorname{sen}(A)\\operatorname{sen}(B)$"], "En el seno de una suma, los dos términos se suman: seno-coseno más coseno-seno. La segunda opción es el seno de la diferencia y la tercera es el coseno de la suma."),
      preg("¿Cuál es la fórmula correcta de $\\cos(A+B)$?", "$\\cos(A)\\cos(B)-\\operatorname{sen}(A)\\operatorname{sen}(B)$", ["$\\cos(A)\\cos(B)+\\operatorname{sen}(A)\\operatorname{sen}(B)$", "$\\cos(A)+\\cos(B)$", "$\\operatorname{sen}(A)\\cos(B)+\\cos(A)\\operatorname{sen}(B)$"], "En el coseno de una suma el signo del medio es CONTRARIO: menos. Con signo más se calcula el coseno de la diferencia."),
      preg("¿Cuánto vale $\\operatorname{sen}(75^{\\circ})$?", `$${texE(sen75)}$`, [`$${texE(errorSuma)}$`, `$${texE(errorSigno)}$`, `$${texE(errorProducto)}$`], "$\\operatorname{sen}(45^{\\circ}+30^{\\circ})=\\frac{\\sqrt{2}}{2}\\cdot\\frac{\\sqrt{3}}{2}+\\frac{\\sqrt{2}}{2}\\cdot\\frac{1}{2}=\\frac{\\sqrt{6}+\\sqrt{2}}{4}$. La primera opción suma los senos (distribuye), la segunda es el seno de $15^{\\circ}$ (signo de la diferencia) y la tercera olvida el segundo término."),
      preg("Si $\\operatorname{sen}(x)=\\dfrac{3}{5}$ y $x$ es agudo, ¿cuánto vale $\\operatorname{sen}(2x)$?", "$\\dfrac{24}{25}$", ["$\\dfrac{6}{5}$", "$\\dfrac{9}{25}$", "$\\dfrac{12}{25}$"], "$\\cos(x)=\\frac{4}{5}$ y $\\operatorname{sen}(2x)=2\\cdot\\frac{3}{5}\\cdot\\frac{4}{5}=\\frac{24}{25}$. Con $2\\operatorname{sen}(x)=\\frac{6}{5}$ el resultado pasaría de 1, imposible para un seno."),
      preg("Si $\\cos(x)=\\dfrac{4}{5}$, ¿cuánto vale $\\cos(2x)$?", "$\\dfrac{7}{25}$", ["$\\dfrac{8}{5}$", "$\\dfrac{16}{25}$", "$-\\dfrac{7}{25}$"], "$\\cos(2x)=2\\cos^{2}(x)-1=2\\cdot\\frac{16}{25}-1=\\frac{7}{25}$. El $\\frac{16}{25}$ es solo $\\cos^{2}(x)$."),
      preg("¿Cuál de estas igualdades es FALSA?", "$\\operatorname{sen}(2x)=2\\operatorname{sen}(x)$", ["$\\operatorname{sen}(2x)=2\\operatorname{sen}(x)\\cos(x)$", "$\\cos(2x)=1-2\\operatorname{sen}^{2}(x)$", "$\\cos(2x)=\\cos^{2}(x)-\\operatorname{sen}^{2}(x)$"], "Falta el factor $\\cos(x)$: con $x=30^{\\circ}$, $\\operatorname{sen}(60^{\\circ})\\approx 0{,}87$ pero $2\\operatorname{sen}(30^{\\circ})=1$."),
    ],
  },

  // ---------------------------------------------------------------- 25
  {
    slug: "trigonometria-clase-25-simplificar-y-verificar-identidades",
    grupo: "identidades",
    orden: 3,
    requierePro: true,
    nombre: "Simplificar y verificar identidades",
    descripcion: "Un método para demostrar que dos expresiones son la misma, transformando un solo lado, y cómo descartar una falsa con un ángulo.",
    conceptos: {
      introduce: ["verificar-identidad", "simplificar-expresion"],
      usa: ["identidad-reciproca", "identidad-cociente", "identidad-pitagorica", "angulo-doble", "factorizacion"],
    },
    pasos: [
      "Objetivo: al terminar podrás verificar una identidad transformando uno de sus lados hasta llegar al otro, simplificar expresiones trigonométricas y descartar una igualdad falsa con un contraejemplo.",
      "Intuición. Verificar una identidad es mostrar que dos expresiones son la misma cosa escrita de dos formas. No se hace probando con un ángulo (eso no demuestra nada): se hace transformando una expresión, paso a paso y con reglas válidas, hasta que se parezca a la otra.",
      "El método. 1) Trabaja con el lado más complicado. 2) Pasa todo a senos y cosenos (con las recíprocas y el cociente). 3) Usa las pitagóricas para cambiar cuadrados ($1-\\cos^{2}(x)=\\operatorname{sen}^{2}(x)$). 4) Suma fracciones con denominador común, factoriza y simplifica. 5) NUNCA operes en los dos lados a la vez ni cambies términos de un lado al otro: eso supone lo que quieres demostrar.",
      "Ejemplo 1. Verificar $\\dfrac{1-\\cos^{2}(x)}{\\operatorname{sen}(x)}=\\operatorname{sen}(x)$. Se parte del lado izquierdo: por la pitagórica, $1-\\cos^{2}(x)=\\operatorname{sen}^{2}(x)$, y $\\dfrac{\\operatorname{sen}^{2}(x)}{\\operatorname{sen}(x)}=\\operatorname{sen}(x)$. Listo.",
      "Ejemplo 2. Verificar $\\tan(x)\\cdot\\cos(x)=\\operatorname{sen}(x)$. Se reemplaza $\\tan(x)=\\frac{\\operatorname{sen}(x)}{\\cos(x)}$: $\\dfrac{\\operatorname{sen}(x)}{\\cos(x)}\\cdot\\cos(x)=\\operatorname{sen}(x)$, porque el coseno se cancela (es un factor, no un sumando).",
      "Ejemplo 3. Verificar $\\sec(x)-\\cos(x)=\\operatorname{sen}(x)\\tan(x)$. El lado izquierdo, en senos y cosenos: $\\dfrac{1}{\\cos(x)}-\\cos(x)=\\dfrac{1-\\cos^{2}(x)}{\\cos(x)}=\\dfrac{\\operatorname{sen}^{2}(x)}{\\cos(x)}=\\operatorname{sen}(x)\\cdot\\dfrac{\\operatorname{sen}(x)}{\\cos(x)}=\\operatorname{sen}(x)\\tan(x)$.",
      `Descartar una falsa. Si dudas de una igualdad, prueba con un ángulo que no sea especial: un solo desacuerdo la refuta. Por ejemplo, ¿es $(\\operatorname{sen}(x)+\\cos(x))^{2}=1$? Con $x=30^{\\circ}$ da $(0{,}5+0{,}866)^{2}\\approx ${dt((0.5 + Math.cos(aRad(30))) ** 2)}$, no 1: es falsa. (En realidad vale $1+2\\operatorname{sen}(x)\\cos(x)=1+\\operatorname{sen}(2x)$.) Que dé bien con un ángulo no la demuestra.`,
      "Errores comunes. 1) Cancelar sumandos como si fueran factores: en $\\dfrac{1+\\cos(x)}{\\cos(x)}$ no se puede tachar el coseno. 2) Operar en los dos lados a la vez. 3) Escribir $(\\operatorname{sen}(x)+\\cos(x))^{2}=\\operatorname{sen}^{2}(x)+\\cos^{2}(x)$ olvidando el término del medio. 4) Olvidar las restricciones, por ejemplo $\\cos(x)\\neq 0$ al dividir.",
    ],
    visuales: [
      cuadros(3, "Verificar $\\dfrac{1-\\cos^{2}(x)}{\\operatorname{sen}(x)}=\\operatorname{sen}(x)$", [
        { texto: "Se parte del lado izquierdo.", formula: "\\dfrac{1-\\cos^{2}(x)}{\\operatorname{sen}(x)}" },
        { texto: "Identidad pitagórica: $1-\\cos^{2}(x)=\\operatorname{sen}^{2}(x)$.", formula: "=\\dfrac{\\operatorname{sen}^{2}(x)}{\\operatorname{sen}(x)}" },
        { texto: "Se simplifica un factor.", formula: "=\\operatorname{sen}(x)" },
      ]),
      cuadros(5, "Verificar $\\sec(x)-\\cos(x)=\\operatorname{sen}(x)\\tan(x)$", [
        { texto: "Recíproca: $\\sec(x)=\\frac{1}{\\cos(x)}$.", formula: "\\dfrac{1}{\\cos(x)}-\\cos(x)" },
        { texto: "Denominador común.", formula: "=\\dfrac{1-\\cos^{2}(x)}{\\cos(x)}" },
        { texto: "Pitagórica.", formula: "=\\dfrac{\\operatorname{sen}^{2}(x)}{\\cos(x)}" },
        { texto: "Se separa y se usa el cociente.", formula: "=\\operatorname{sen}(x)\\cdot\\dfrac{\\operatorname{sen}(x)}{\\cos(x)}=\\operatorname{sen}(x)\\tan(x)" },
      ]),
    ],
    quiz: [
      equivalente("tan-cos", "$\\tan(x)\\cdot\\cos(x)=\\frac{\\operatorname{sen}(x)}{\\cos(x)}\\cdot\\cos(x)=\\operatorname{sen}(x)$: el coseno se cancela porque es un factor."),
      equivalente("uno-menos-sen2", "Por la identidad pitagórica, $1-\\operatorname{sen}^{2}(x)=\\cos^{2}(x)$."),
      equivalente("cuadrado-de-suma", "$(\\operatorname{sen}(x)+\\cos(x))^{2}=\\operatorname{sen}^{2}(x)+2\\operatorname{sen}(x)\\cos(x)+\\cos^{2}(x)$; al restar $2\\operatorname{sen}(x)\\cos(x)$ queda $\\operatorname{sen}^{2}(x)+\\cos^{2}(x)=1$."),
      equivalente("cos-por-tan-mas-cot", "$\\cos(x)\\left(\\frac{\\operatorname{sen}}{\\cos}+\\frac{\\cos}{\\operatorname{sen}}\\right)=\\operatorname{sen}(x)+\\frac{\\cos^{2}(x)}{\\operatorname{sen}(x)}=\\frac{\\operatorname{sen}^{2}+\\cos^{2}}{\\operatorname{sen}(x)}=\\operatorname{cosec}(x)$."),
      preg("¿Alcanza con comprobar una identidad con un ángulo, por ejemplo $30^{\\circ}$, para demostrarla?", "No: solo sirve para descartarla si no coincide", ["Sí: si da igual con un ángulo, es cierta", "Sí, siempre que el ángulo sea notable", "No: nunca se puede comprobar con números"], "Un ángulo que coincide no prueba nada (podría ser casualidad); un ángulo que NO coincide sí refuta la identidad. Una demostración transforma una expresión con reglas válidas."),
      preg("¿Es una identidad $(\\operatorname{sen}(x)+\\cos(x))^{2}=1$?", "No: con $x=30^{\\circ}$ el primer miembro vale casi $1{,}87$", ["Sí: es la identidad pitagórica", "Sí, pero solo para ángulos agudos", "No: con $x=30^{\\circ}$ el primer miembro vale $0{,}5$"], `Con $x=30^{\\circ}$: $(0{,}5+0{,}866)^{2}\\approx ${dt((0.5 + Math.cos(aRad(30))) ** 2)}$. La pitagórica es $\\operatorname{sen}^{2}+\\cos^{2}=1$, sin el término del medio $2\\operatorname{sen}\\cos$.`),
    ],
  },
];
