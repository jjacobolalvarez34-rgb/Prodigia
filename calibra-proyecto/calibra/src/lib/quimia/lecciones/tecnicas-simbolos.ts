import type { TecnicaQuimia } from "./tipos";
import { preg, cuadro, f } from "./ayudas";

// Técnicas del grupo "simbolos": recordar símbolos y nombres de elementos.
// asociacion-color-uso ya existía (0056 + quiz de 0175) y se reescribe en
// español neutro; las otras dos son nuevas.

export const TECNICAS_QUIMIA_SIMBOLOS: TecnicaQuimia[] = [
  {
    slug: "asociacion-color-uso",
    existente: true,
    grupo: "simbolos",
    orden: 1,
    requierePro: false,
    nombre: "Asociación por color o uso cotidiano",
    descripcion: "Conectar el símbolo con algo visual conocido en vez de memorizar la letra sola.",
    pasos: [
      "Au es oro: piensa en el brillo dorado de una joya, no en la letra sola (viene del latín aurum).",
      "Fe es hierro: piensa en el óxido rojizo, la herrumbre, que ves en un portón viejo.",
      "Cu es cobre: piensa en el tono anaranjado de un cable eléctrico pelado.",
      "Una imagen cotidiana se recuerda mejor que una letra abstracta. Ojo con los parecidos: Ag es plata (Au es oro) y Co es cobalto (Cu es cobre).",
    ],
    visuales: [
      cuadro(
        2,
        ["Símbolo", "Elemento", "Imagen que ayuda"],
        [
          ["Au", "oro", "el brillo dorado de una joya"],
          ["Fe", "hierro", "la herrumbre rojiza de un portón viejo"],
          ["Cu", "cobre", "un cable eléctrico pelado, anaranjado"],
          ["Ag", "plata", "los cubiertos y las monedas plateados"],
        ]
      ),
    ],
    quiz: [
      preg("Según esta técnica, ¿qué elemento es \"Au\"?", ["Plata", "Oro", "Aluminio", "Argón"], 1, "Au es oro: piensa en el brillo dorado de una joya, no en la letra sola (la plata es Ag, no Au)."),
      preg(
        "¿Qué imagen cotidiana ayuda a recordar que Fe es hierro, según esta técnica?",
        [
          "El brillo dorado de una joya",
          "El óxido rojizo (herrumbre) de un portón viejo",
          "El tono anaranjado de un cable pelado",
          "El color plateado de una moneda",
        ],
        1,
        "La herrumbre es el óxido del hierro: es la imagen que conecta Fe con hierro."
      ),
      preg("¿Cuál es el símbolo químico del cobre, según el ejemplo de esta técnica?", ["Co", "Cu", "C", "Ca"], 1, "Cu es cobre: piensa en el tono anaranjado de un cable eléctrico pelado (Co es cobalto, un elemento distinto)."),
      preg("¿Cuál es el símbolo de la plata?", ["Au", "Ag", "Pt", "Al"], 1, "Ag viene del latín argentum, plata. Au es el oro (aurum)."),
    ],
  },
  {
    slug: "quimia-tecnica-nombres-latinos",
    grupo: "simbolos",
    orden: 2,
    requierePro: false,
    nombre: "Nombres latinos: cuando el símbolo no se parece",
    descripcion: "Recordar los símbolos que salen del nombre en latín (Na, K, Fe, Cu, Ag, Au, Sn, Pb, Hg).",
    pasos: [
      "Algunos símbolos no se parecen al nombre en español porque salen del nombre en latín: Na es el sodio (natrium) y K es el potasio (kalium).",
      "Lo mismo pasa con metales conocidos desde la antigüedad: Fe es el hierro (ferrum), Cu el cobre (cuprum), Ag la plata (argentum), Au el oro (aurum), Sn el estaño (stannum) y Pb el plomo (plumbum).",
      "Usa palabras parecidas como ancla: la ferretería trabaja con hierro (ferrum, Fe); el plomero, con plomo (plumbum, Pb); Argentina lleva el nombre de la plata (argentum, Ag); y áureo significa dorado (aurum, Au).",
      "El mercurio es Hg por hydrargyrum, que quiere decir «plata líquida». No lo confundas con Mg, que es el magnesio.",
    ],
    visuales: [
      cuadro(
        1,
        ["Símbolo", "Nombre en latín", "Elemento", "Ancla"],
        [
          ["Na", "natrium", "sodio", "—"],
          ["K", "kalium", "potasio", "—"],
          ["Fe", "ferrum", "hierro", "ferretería"],
          ["Cu", "cuprum", "cobre", "—"],
          ["Ag", "argentum", "plata", "Argentina"],
          ["Au", "aurum", "oro", "áureo"],
          ["Sn", "stannum", "estaño", "—"],
          ["Pb", "plumbum", "plomo", "plomero"],
          ["Hg", "hydrargyrum", "mercurio", "plata líquida"],
        ]
      ),
    ],
    quiz: [
      preg("¿Por qué el símbolo del sodio es Na?", ["Porque su nombre en inglés empieza con N", "Porque viene de natrium, su nombre en latín", "Porque tiene número atómico 1", "Porque es un gas noble"], 1, "Na viene del latín natrium. Es un símbolo que no se parece al nombre en español."),
      preg("¿Qué elemento tiene el símbolo Pb?", ["Fósforo", "Plata", "Plomo", "Platino"], 2, "Pb viene del latín plumbum, plomo (de ahí «plomero»). El fósforo es P y la plata es Ag."),
      preg("¿Cuál es el símbolo del mercurio?", ["Mg", "Hg", "Me", "Mc"], 1, "Hg viene de hydrargyrum, «plata líquida». Mg es el magnesio."),
      preg("Argentum es el nombre en latín de...", ["el oro", "la plata", "el aluminio", "el argón"], 1, "Argentum es la plata (símbolo Ag); el oro es aurum (Au)."),
    ],
  },
  {
    slug: "quimia-tecnica-mayuscula-minuscula",
    grupo: "simbolos",
    orden: 3,
    requierePro: false,
    nombre: "Una mayúscula abre un elemento",
    descripcion: "Leer un símbolo o una fórmula sin confundir elementos con compuestos, contando las mayúsculas.",
    pasos: [
      "Un símbolo químico tiene una o dos letras: la primera siempre en mayúscula y la segunda, si existe, siempre en minúscula. Cl es el cloro; CL, cl o cL no existen.",
      "La mayúscula es una señal: cada mayúscula abre un elemento nuevo. Por eso Co (una mayúscula) es un elemento, el cobalto, y CO (dos mayúsculas) es un compuesto: carbono (C) con oxígeno (O), el monóxido de carbono.",
      `Cuenta las mayúsculas para saber cuántos elementos distintos hay en una fórmula: ${f("NaCl")} tiene 2 (Na y Cl) y ${f("H2SO4")} tiene 3 (H, S y O).`,
      `Los números pequeños que vienen después de un símbolo o de un paréntesis son subíndices: dicen cuántos átomos hay. En ${f("H2O")} hay 2 átomos de H y 1 de O.`,
    ],
    visuales: [
      cuadro(
        1,
        ["Se escribe", "Qué es"],
        [
          ["Co", "cobalto: un solo elemento"],
          ["CO", "monóxido de carbono: C y O"],
          ["Hf", "hafnio: un solo elemento"],
          ["HF", "fluoruro de hidrógeno: H y F"],
          ["No", "nobelio: un solo elemento"],
          ["NO", "monóxido de nitrógeno: N y O"],
        ]
      ),
    ],
    quiz: [
      preg("«Co» y «CO» significan cosas distintas. ¿Cuál de las dos es un compuesto?", ["Co", "CO", "Las dos", "Ninguna"], 1, "CO tiene dos mayúsculas: dos elementos (carbono y oxígeno), o sea un compuesto. Co es el elemento cobalto."),
      preg(`¿Cuántos elementos distintos hay en ${f("H2SO4")}?`, ["2", "3", "4", "7"], 1, "Tres mayúsculas: H, S y O. Los números son subíndices y no cuentan como elementos."),
      preg("¿Cómo se escribe correctamente el símbolo del cloro?", ["CL", "cl", "Cl", "cL"], 2, "La primera letra va en mayúscula y la segunda en minúscula: Cl."),
      preg("¿Qué significa «No» (con una N mayúscula y una o minúscula)?", ["Un compuesto de nitrógeno y oxígeno", "El elemento nobelio", "La palabra «no», sin sentido químico", "El elemento nitrógeno"], 1, "No es el nobelio. El compuesto de nitrógeno y oxígeno se escribe NO, con dos mayúsculas."),
    ],
  },
];
