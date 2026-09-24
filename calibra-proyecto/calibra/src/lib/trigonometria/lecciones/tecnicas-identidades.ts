import { EQUIVALENCIAS } from "@/lib/trigonometria/identidades";
import { cosExacto, mulE, senExacto, sumaE, texE } from "@/lib/trigonometria/exactos";
import { aRad } from "@/lib/trigonometria/triangulos";
import type { PreguntaLeccionTrigonometria, TecnicaTrigonometria } from "./tipos";
import { dt, m, preg } from "./ayudas";

// Técnicas del bloque "identidades" (gratis): las tres identidades base, ángulo
// doble y suma («sen(A+B) no es sen A + sen B»), cofunciones y cómo verificar
// una identidad. Las expresiones equivalentes salen del catálogo verificado
// (identidades.ts) y los valores exactos del anillo de exactos.ts.

function equivalente(id: string, explicacion: string): PreguntaLeccionTrigonometria {
  const q = EQUIVALENCIAS.find((x) => x.id === id);
  if (!q) throw new Error(`Equivalencia ${id} inexistente`);
  return preg(`¿Cuál de estas expresiones es equivalente a $${q.expr.tex}$?`, `$${q.correcta.tex}$`, q.incorrectas.map((e) => `$${e.tex}$`), explicacion);
}

const sen75 = texE(sumaE(mulE(senExacto(45), cosExacto(30)), mulE(cosExacto(45), senExacto(30))));
const sen60 = Math.sin(aRad(60));

export const TECNICAS_TRIGONOMETRIA_IDENTIDADES: TecnicaTrigonometria[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "trigonometria-tecnica-tres-identidades-base",
    grupo: "identidades",
    orden: 1,
    requierePro: false,
    nombre: "Tres identidades que abren todas las puertas",
    descripcion: "Recíprocas, cociente y pitagórica: con estas tres se pasa de cualquier razón a otra.",
    conceptos: { introduce: ["identidad-reciproca", "identidad-cociente", "identidad-pitagorica"], usa: ["razones-reciprocas", "relacion-pitagorica-circulo"] },
    pasos: [
      "Recíprocas: $\\operatorname{cosec}(x)=\\frac{1}{\\operatorname{sen}(x)}$, $\\sec(x)=\\frac{1}{\\cos(x)}$ y $\\cot(x)=\\frac{1}{\\tan(x)}$.",
      "Cociente: $\\tan(x)=\\frac{\\operatorname{sen}(x)}{\\cos(x)}$ y $\\cot(x)=\\frac{\\cos(x)}{\\operatorname{sen}(x)}$.",
      "Pitagórica: $\\operatorname{sen}^{2}(x)+\\cos^{2}(x)=1$, que sale de $x^{2}+y^{2}=1$ en el círculo unitario. Dividiéndola entre $\\cos^{2}$ o entre $\\operatorname{sen}^{2}$ salen $1+\\tan^{2}=\\sec^{2}$ y $1+\\cot^{2}=\\operatorname{cosec}^{2}$.",
      "Si conoces una razón y el cuadrante, con estas tres puedes hallar todas las demás. El signo lo decide el cuadrante.",
    ],
    visuales: [{ tipo: "trigonometria.identidad", despuesDePaso: 2, titulo: "Pitágoras sobre el círculo ($\\theta=60^{\\circ}$)", angulo: 60, forma: "derivadas" }],
    quiz: [
      preg("¿A qué es igual $1+\\tan^{2}(x)$?", "$\\sec^{2}(x)$", ["$\\cos^{2}(x)$", "$\\operatorname{cosec}^{2}(x)$", "$\\cot^{2}(x)$"], "Al dividir $\\operatorname{sen}^{2}+\\cos^{2}=1$ entre $\\cos^{2}$ sale $\\tan^{2}+1=\\sec^{2}$."),
      preg("Si $\\operatorname{sen}(x)=\\frac{5}{13}$ y $\\cos(x)=\\frac{12}{13}$, ¿cuánto vale $\\tan(x)$?", "$\\dfrac{5}{12}$", ["$\\dfrac{12}{5}$", "$\\dfrac{5}{13}$", "$\\dfrac{60}{169}$"], "$\\tan=\\frac{\\operatorname{sen}}{\\cos}=\\frac{5}{12}$. $\\frac{12}{5}$ es la cotangente."),
      preg("Si $\\cos(x)=0{,}6$ y $x$ es agudo, ¿cuánto vale $\\operatorname{sen}(x)$?", "$0{,}8$", ["$0{,}4$", "$0{,}6$", "$1{,}6$"], "$\\operatorname{sen}^{2}=1-0{,}36=0{,}64$, y la raíz es $0{,}8$. Restar $1-0{,}6$ no respeta los cuadrados."),
      preg("¿Cuál es la recíproca del coseno?", "La secante", ["La cosecante", "La cotangente", "El arcocoseno"], "Los nombres van «en cruz»: secante con coseno, cosecante con seno."),
    ],
  },

  // ---------------------------------------------------------------- 2
  {
    slug: "trigonometria-tecnica-doble-y-suma",
    grupo: "identidades",
    orden: 2,
    requierePro: false,
    nombre: "sen(A + B) no es sen A + sen B",
    descripcion: "El error más común con las fórmulas de suma y ángulo doble, y las fórmulas correctas para calcular valores exactos como sen 75°.",
    conceptos: { introduce: ["angulo-doble", "suma-diferencia"], usa: ["valores-exactos", "identidad-pitagorica"] },
    pasos: [
      `El seno NO se distribuye: con $A=B=30^{\\circ}$, $\\operatorname{sen}(60^{\\circ})\\approx ${dt(sen60, 3)}$ pero $\\operatorname{sen}(30^{\\circ})+\\operatorname{sen}(30^{\\circ})=1$.`,
      "Fórmula correcta: $\\operatorname{sen}(A+B)=\\operatorname{sen}(A)\\cos(B)+\\cos(A)\\operatorname{sen}(B)$. En el coseno, el signo del medio es el CONTRARIO: $\\cos(A+B)=\\cos(A)\\cos(B)-\\operatorname{sen}(A)\\operatorname{sen}(B)$.",
      `Ejemplo: ${m("\\operatorname{sen}(75^{\\circ})=\\operatorname{sen}(45^{\\circ}+30^{\\circ})=" + sen75)}.`,
      "Con $A=B=x$ salen las del ángulo doble: $\\operatorname{sen}(2x)=2\\operatorname{sen}(x)\\cos(x)$ y $\\cos(2x)=\\cos^{2}(x)-\\operatorname{sen}^{2}(x)=2\\cos^{2}(x)-1=1-2\\operatorname{sen}^{2}(x)$.",
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 2,
        titulo: "sen 75° = sen(45° + 30°)",
        cuadros: [
          { texto: "Se parte la suma.", formula: "\\operatorname{sen}(45^{\\circ})\\cos(30^{\\circ})+\\cos(45^{\\circ})\\operatorname{sen}(30^{\\circ})" },
          { texto: "Valores exactos.", formula: "\\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{\\sqrt{3}}{2}+\\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{1}{2}" },
          { texto: "Resultado:", formula: sen75 },
        ],
        msPorCuadro: 2800,
      },
    ],
    quiz: [
      preg("¿Cuál es correcta?", "$\\operatorname{sen}(A+B)=\\operatorname{sen}(A)\\cos(B)+\\cos(A)\\operatorname{sen}(B)$", ["$\\operatorname{sen}(A+B)=\\operatorname{sen}(A)+\\operatorname{sen}(B)$", "$\\operatorname{sen}(A+B)=\\operatorname{sen}(A)\\operatorname{sen}(B)+\\cos(A)\\cos(B)$", "$\\operatorname{sen}(A+B)=\\operatorname{sen}(A)\\cos(B)-\\cos(A)\\operatorname{sen}(B)$"], "En el seno de una suma los dos términos se suman y se mezclan seno con coseno. La última es el seno de la diferencia."),
      preg("¿Cuál es correcta?", "$\\cos(A+B)=\\cos(A)\\cos(B)-\\operatorname{sen}(A)\\operatorname{sen}(B)$", ["$\\cos(A+B)=\\cos(A)+\\cos(B)$", "$\\cos(A+B)=\\cos(A)\\cos(B)+\\operatorname{sen}(A)\\operatorname{sen}(B)$", "$\\cos(A+B)=\\operatorname{sen}(A)\\cos(B)+\\cos(A)\\operatorname{sen}(B)$"], "En el coseno de una suma el signo del medio es contrario: menos."),
      preg("¿Cuánto vale $\\operatorname{sen}(2x)$?", "$2\\operatorname{sen}(x)\\cos(x)$", ["$2\\operatorname{sen}(x)$", "$\\operatorname{sen}^{2}(x)$", "$\\cos^{2}(x)-\\operatorname{sen}^{2}(x)$"], "Es $\\operatorname{sen}(x+x)$: $\\operatorname{sen}\\cos+\\cos\\operatorname{sen}$. Sin el coseno, con $x=30^{\\circ}$ daría 1 en lugar de $0{,}87$."),
      preg("Si $\\cos(x)=\\frac{4}{5}$, ¿cuánto vale $\\cos(2x)$?", "$\\dfrac{7}{25}$", ["$\\dfrac{8}{5}$", "$\\dfrac{16}{25}$", "$-\\dfrac{7}{25}$"], "$\\cos(2x)=2\\cos^{2}(x)-1=2\\cdot\\frac{16}{25}-1=\\frac{7}{25}$."),
    ],
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "trigonometria-tecnica-cofunciones",
    grupo: "identidades",
    orden: 3,
    requierePro: false,
    nombre: "El seno de un ángulo es el coseno de su complemento",
    descripcion: "Por qué sen(90° − x) = cos x y cómo usarlo para cambiar entre seno y coseno.",
    conceptos: { introduce: ["cofunciones"], usa: ["razon-seno", "razon-coseno", "angulos-triangulo"] },
    pasos: [
      "En un triángulo rectángulo, los dos ángulos agudos son complementarios (suman $90^{\\circ}$): el cateto opuesto a uno es el adyacente del otro.",
      "Por eso $\\operatorname{sen}(90^{\\circ}-x)=\\cos(x)$, $\\cos(90^{\\circ}-x)=\\operatorname{sen}(x)$ y $\\tan(90^{\\circ}-x)=\\cot(x)$: se llaman cofunciones.",
      "Sirve para cambiar de razón: $\\operatorname{sen}(70^{\\circ})=\\cos(20^{\\circ})$. Y para ecuaciones: si $\\operatorname{sen}(35^{\\circ})=\\cos(\\theta)$ con $\\theta$ agudo, $\\theta=90^{\\circ}-35^{\\circ}=55^{\\circ}$.",
    ],
    visuales: [{ tipo: "trigonometria.triangulo", despuesDePaso: 1, titulo: "El seno de $A$ es el coseno de $B$", catetos: [3, 4], vertice: "A", pasos: ["sen"] }],
    quiz: [
      preg("¿A qué es igual $\\operatorname{sen}(90^{\\circ}-20^{\\circ})$?", "$\\cos(20^{\\circ})$", ["$\\operatorname{sen}(20^{\\circ})$", "$-\\cos(20^{\\circ})$", "$\\tan(20^{\\circ})$"], "$\\operatorname{sen}(90^{\\circ}-x)=\\cos(x)$."),
      preg("Si $\\operatorname{sen}(35^{\\circ})=\\cos(\\theta)$ y $\\theta$ es agudo, ¿cuánto mide $\\theta$?", "$55^{\\circ}$", ["$35^{\\circ}$", "$145^{\\circ}$", "$65^{\\circ}$"], "Cofunciones: $\\theta=90^{\\circ}-35^{\\circ}=55^{\\circ}$."),
      preg("¿A qué es igual $\\tan(90^{\\circ}-x)$?", "$\\cot(x)$", ["$\\tan(x)$", "$-\\tan(x)$", "$\\sec(x)$"], "La tangente del complemento es la cotangente: opuesto y adyacente se intercambian."),
      preg("En un triángulo 3-4-5, con el cateto de 3 frente al ángulo $A$, ¿qué relación hay entre $\\operatorname{sen}(A)$ y $\\cos(B)$?", "Son iguales ($\\frac{3}{5}$)", ["Son recíprocos", "Suman 1", "No tienen relación"], "El opuesto a $A$ es el adyacente a $B$, con la misma hipotenusa: $\\operatorname{sen}(A)=\\cos(B)=\\frac{3}{5}$."),
    ],
  },

  // ---------------------------------------------------------------- 4
  {
    slug: "trigonometria-tecnica-verificar-una-identidad",
    grupo: "identidades",
    orden: 4,
    requierePro: false,
    nombre: "Cómo verificar una identidad: un solo lado, a senos y cosenos",
    descripcion: "Un método fijo para demostrar una identidad y una forma rápida de descartar una falsa con un ángulo.",
    conceptos: { introduce: ["verificar-identidad", "simplificar-expresion"], usa: ["identidad-reciproca", "identidad-cociente", "identidad-pitagorica"] },
    pasos: [
      "Trabaja con el lado más complicado y transfórmalo hasta que sea igual al otro. Nunca operes en los dos lados a la vez.",
      "Pasa todo a senos y cosenos (recíprocas y cociente) y usa la pitagórica para cambiar cuadrantes: $1-\\cos^{2}(x)=\\operatorname{sen}^{2}(x)$.",
      "Cancela solo FACTORES iguales, nunca sumandos: en $\\frac{1+\\cos(x)}{\\cos(x)}$ no se puede tachar el coseno.",
      "Para descartar una falsa, prueba con un ángulo que no sea especial: un desacuerdo la refuta. Que coincida con un ángulo no la demuestra.",
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        titulo: "Verificar $\\tan(x)\\cos(x)=\\operatorname{sen}(x)$",
        cuadros: [
          { texto: "Se parte del lado izquierdo.", formula: "\\tan(x)\\cos(x)" },
          { texto: "Cociente: $\\tan(x)=\\frac{\\operatorname{sen}(x)}{\\cos(x)}$.", formula: "=\\dfrac{\\operatorname{sen}(x)}{\\cos(x)}\\cdot\\cos(x)" },
          { texto: "El coseno es un factor: se cancela.", formula: "=\\operatorname{sen}(x)" },
        ],
        msPorCuadro: 2600,
      },
    ],
    quiz: [
      equivalente("tan-cos", "$\\tan(x)\\cos(x)=\\frac{\\operatorname{sen}(x)}{\\cos(x)}\\cdot\\cos(x)=\\operatorname{sen}(x)$."),
      equivalente("uno-menos-cos2", "Por la pitagórica, $1-\\cos^{2}(x)=\\operatorname{sen}^{2}(x)$."),
      preg("¿Alcanza con comprobar una identidad con un solo ángulo para demostrarla?", "No: solo sirve para descartarla si no coincide", ["Sí: si coincide, es cierta", "Sí, si el ángulo es notable", "No: nunca se comprueba con números"], "Coincidir en un ángulo puede ser casualidad; no coincidir prueba que es falsa."),
      preg("En $\\frac{1+\\cos(x)}{\\cos(x)}$, ¿se puede tachar el coseno?", "No: el coseno del numerador es un sumando, no un factor", ["Sí, y queda $1$", "Sí, y queda $1+1$", "Solo si $x$ es agudo"], "Solo se cancelan factores comunes: la expresión es $\\frac{1}{\\cos(x)}+1=\\sec(x)+1$."),
    ],
  },
];
