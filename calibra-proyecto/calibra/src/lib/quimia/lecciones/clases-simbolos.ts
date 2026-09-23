import type { ClaseQuimia } from "./tipos";
import { preg, cuadro, f, cfgAbrev, en, masaAtomica } from "./ayudas";
import { ELEMENTOS } from "@/lib/practica/quimia";
import { datosDe, electronesDeValencia } from "@/lib/quimia/datos";
import { numeroOxidacion } from "@/lib/quimia/formulas";

// Clases del grupo "simbolos": cómo leer la ficha de un elemento y cómo se
// forman y recuerdan los símbolos y nombres. Los datos de las fichas salen de
// ELEMENTOS + DATOS_ELEMENTOS (con test) y los nombres de los elementos de
// las tablas de comparación salen de ELEMENTOS.

const nombreDe = (s: string) => {
  const e = ELEMENTOS.find((x) => x.simbolo === s);
  if (!e) throw new Error(`Elemento desconocido: ${s}`);
  return e.nombre.toLowerCase();
};
const oxidaciones = (s: string) => (datosDe(s)?.estadosOxidacion ?? []).map(numeroOxidacion).join(", ");

export const CLASES_QUIMIA_SIMBOLOS: ClaseQuimia[] = [
  {
    slug: "quimia-clase-ficha-elemento",
    grupo: "simbolos",
    orden: 1,
    requierePro: true,
    nombre: "Cómo leer la ficha de un elemento",
    descripcion: "Qué es y para qué sirve cada dato de un casillero de la tabla periódica.",
    pasos: [
      "Cada casillero de la tabla periódica es una ficha con los datos de un elemento. Según el libro, la ficha trae más o menos información, pero casi siempre incluye el número atómico, el símbolo, el nombre y la masa atómica, y muchas veces también los estados de oxidación, la electronegatividad, la configuración electrónica y el estado de agregación.",
      "Mira la ficha del hierro (Fe) y detente en cada dato: el visual te explica qué es y para qué sirve.",
      `Número atómico (Z = ${ELEMENTOS.find((e) => e.simbolo === "Fe")!.numeroAtomico}): dice cuántos protones tiene el núcleo y, en un átomo neutro, cuántos electrones. Es lo que identifica al elemento: no hay dos elementos con el mismo Z.`,
      `Masa atómica (${masaAtomica("Fe")} u): es la masa promedio de un átomo del elemento, en unidades de masa atómica. Redondeada, da una idea del número másico del isótopo más abundante: 56 − 26 = 30 neutrones, porque el hierro-56 domina. Ojo: eso solo funciona cuando un isótopo domina; en el cloro (${masaAtomica("Cl")} u) no, porque hay una mezcla de cloro-35 y cloro-37. Además, la masa atómica en u es el mismo número que la masa molar en g/mol: ${masaAtomica("Fe")} g de hierro contienen 1 mol de átomos.`,
      `Configuración electrónica (${cfgAbrev(26)}): dice cómo se reparten los electrones. De ahí salen los electrones de valencia y la ubicación en la tabla: la capa más alta es la 4 (período 4) y el último electrón entra en una subcapa d (bloque d).`,
      `Electronegatividad (${en("Fe")}): dice cuánto atrae el átomo los electrones de un enlace. Al comparar dos elementos, la diferencia sirve para decidir el tipo de enlace: mayor que 1,7, iónico; entre 0,4 y 1,7, covalente polar; menor que 0,4, covalente apolar (o casi).`,
      `Estados de oxidación (${oxidaciones("Fe")}): son las cargas que el átomo puede tener, o parecer tener, en sus compuestos. Un elemento puede tener varios: por eso en los nombres aparece «hierro (II)» o «hierro (III)». El signo indica si el átomo cede electrones (+) o los atrae (−). Los que trae la ficha son los más comunes.`,
      "Estado de agregación (sólido): indica si el elemento es sólido, líquido o gas a 25 °C y 1 atmósfera. Solo dos elementos son líquidos en esas condiciones: el bromo (Br) y el mercurio (Hg). Hay once gases: H, He, N, O, F, Ne, Cl, Ar, Kr, Xe y Rn.",
      `Ahora lee la ficha del cloro (Cl). Su número atómico es ${ELEMENTOS.find((e) => e.simbolo === "Cl")!.numeroAtomico}, su masa atómica ${masaAtomica("Cl")} u, su configuración ${cfgAbrev(17)} (${electronesDeValencia(17)} electrones de valencia), su electronegatividad ${en("Cl")}, es un gas del grupo 17 (un halógeno) y sus estados de oxidación son ${oxidaciones("Cl")}.`,
      "Estados de oxidación que conviene reconocer sin mirar la tabla: los metales alcalinos, +1; los alcalinotérreos, +2; el aluminio, +3; el oxígeno, −2 (salvo en los peróxidos, donde es −1); el hidrógeno, +1 (salvo en los hidruros metálicos, donde es −1); y los halógenos, −1 (el flúor, siempre). Los vas a usar mucho al armar fórmulas y al nombrar compuestos.",
    ],
    visuales: [
      { tipo: "quimia.elemento", despuesDePaso: 1, simbolo: "Fe", campos: ["numeroAtomico", "simbolo", "nombre", "masa", "configuracion", "electronegatividad", "oxidacion", "estado", "posicion", "familia"] },
      { tipo: "quimia.elemento", despuesDePaso: 8, simbolo: "Cl", campos: ["numeroAtomico", "masa", "configuracion", "electronegatividad", "oxidacion", "estado", "posicion", "familia"] },
      cuadro(
        9,
        ["Dato", "Qué te dice", "Para qué sirve"],
        [
          ["Número atómico (Z)", "protones del núcleo", "identificar el elemento y contar electrones"],
          ["Símbolo y nombre", "cómo se escribe y se nombra", "escribir fórmulas y nombres"],
          ["Masa atómica", "masa promedio de un átomo (u)", "calcular masas molares (g/mol)"],
          ["Configuración electrónica", "reparto de los electrones", "hallar los electrones de valencia"],
          ["Electronegatividad", "atracción por los electrones de un enlace", "decidir el tipo de enlace"],
          ["Estados de oxidación", "cargas posibles en los compuestos", "armar fórmulas y nombrar"],
          ["Estado de agregación", "sólido, líquido o gas a 25 °C", "conocer la sustancia en condiciones normales"],
        ],
        "Resumen: cada dato de la ficha y para qué sirve"
      ),
    ],
    quiz: [
      preg("¿Qué indica el número atómico (Z) de un elemento?", ["La cantidad de neutrones", "La cantidad de protones del núcleo", "La masa del átomo en gramos", "La cantidad de capas"], 1, "Z es la cantidad de protones: es el dato que identifica al elemento."),
      preg("La masa atómica del hierro es 55,85 u y su isótopo más abundante es el hierro-56. ¿Cuántos neutrones tiene ese isótopo? (Z = 26)", ["26", "30", "56", "82"], 1, "Neutrones = A − Z = 56 − 26 = 30."),
      preg("¿Qué dato de la ficha se usa para decidir si el enlace entre dos elementos es iónico o covalente?", ["El número atómico", "La masa atómica", "La electronegatividad", "El estado de agregación"], 2, "La diferencia de electronegatividad entre los dos elementos indica cuán desigualmente se reparten los electrones."),
      preg("¿Cuál de estos elementos es líquido a 25 °C y 1 atmósfera?", ["Cloro (Cl)", "Bromo (Br)", "Yodo (I)", "Flúor (F)"], 1, "El bromo es un líquido rojizo. El cloro y el flúor son gases y el yodo es un sólido."),
      preg("En la ficha del hierro aparecen los estados de oxidación +2 y +3. ¿Qué significa?", ["Que el hierro tiene dos isótopos", "Que puede formar iones con carga +2 y con carga +3", "Que tiene 2 o 3 electrones", "Que pertenece a los grupos 2 y 3"], 1, "Por eso el hierro necesita un número romano en su nombre: hierro (II) o hierro (III)."),
      preg(`El cloro tiene la configuración ${cfgAbrev(17)}. ¿Cuántos electrones de valencia tiene?`, ["1", "5", "7", "17"], 2, "Los electrones de la capa 3 son 2 + 5 = 7: es un halógeno, del grupo 17."),
    ],
  },
  {
    slug: "quimia-clase-simbolos-elementos-comunes",
    grupo: "simbolos",
    orden: 2,
    requierePro: true,
    nombre: "Símbolos y elementos comunes",
    descripcion: "Cómo se forman los símbolos, los nombres latinos, los elementos más importantes y los que forman moléculas de dos átomos.",
    pasos: [
      "Un símbolo químico tiene una o dos letras: la primera en mayúscula y la segunda, si hace falta, en minúscula. Suele salir de la primera letra del nombre y se agrega otra minúscula para distinguir elementos que empiezan igual: C (carbono), Ca (calcio), Cl (cloro), Co (cobalto), Cu (cobre).",
      "Los símbolos pueden venir del nombre en español o en inglés, del nombre en latín, o de lugares y personas: Am (americio, por América), Fr (francio, por Francia), Po (polonio, por Polonia), Cf (californio) y Es (einstenio, por Einstein).",
      "Los que vienen del latín son los que más confunden porque no se parecen al nombre: por ejemplo Na es el sodio (natrium) y Pb es el plomo (plumbum). Esta tabla reúne los más importantes.",
      "Los símbolos de los elementos con nombre latino están repartidos por toda la tabla: por eso conviene asociarlos con una palabra conocida (ferretería, plomero, Argentina).",
      "Otras confusiones frecuentes son símbolos que empiezan con la misma letra. Fíjate bien en la segunda letra: Ca calcio, Cu cobre, Co cobalto, C carbono, Cl cloro, Cr cromo, Cs cesio. Y no mezcles Mg (magnesio), Mn (manganeso) y Hg (mercurio), ni P (fósforo), Pb (plomo) y Pt (platino).",
      "Algunos elementos son muy importantes en la vida diaria. Casi el 96 % de la masa del cuerpo humano son cuatro elementos: oxígeno (O), carbono (C), hidrógeno (H) y nitrógeno (N). El aire es, sobre todo, nitrógeno (cerca del 78 %) y oxígeno (cerca del 21 %). En la corteza terrestre el oxígeno es casi la mitad de la masa y el silicio (Si), más de la cuarta parte.",
      "Algunos elementos, cuando están solos, no forman átomos sueltos sino moléculas de dos átomos. Son siete: hidrógeno, nitrógeno, oxígeno, flúor, cloro, bromo y yodo. Se recuerdan con «HOFBrINCl» (H, O, F, Br, I, N, Cl). Por eso el oxígeno que respiramos es O₂ y no O, y el cloro gaseoso es Cl₂.",
      "Los gases nobles (He, Ne, Ar...) son monoatómicos, y los metales se escriben con su símbolo (Fe, Cu, Au). Un mismo elemento puede presentarse de formas distintas, llamadas alótropos: el oxígeno como O₂ o como ozono (O₃); el carbono como grafito o como diamante.",
      "Error común: confundir la fórmula de una molécula con átomos sueltos. O₂ es una molécula de oxígeno; «2 O» son dos átomos sueltos. Y recuerda que Cl no se escribe CL ni cl.",
    ],
    visuales: [
      cuadro(
        2,
        ["Símbolo", "Nombre en latín", "Elemento"],
        [
          ["Na", "natrium", nombreDe("Na")],
          ["K", "kalium", nombreDe("K")],
          ["Fe", "ferrum", nombreDe("Fe")],
          ["Cu", "cuprum", nombreDe("Cu")],
          ["Ag", "argentum", nombreDe("Ag")],
          ["Au", "aurum", nombreDe("Au")],
          ["Sn", "stannum", nombreDe("Sn")],
          ["Pb", "plumbum", nombreDe("Pb")],
          ["Hg", "hydrargyrum", nombreDe("Hg")],
          ["Sb", "stibium", nombreDe("Sb")],
          ["W", "wolframium (del alemán Wolfram)", nombreDe("W")],
        ],
        "Símbolos que vienen del latín"
      ),
      {
        tipo: "quimia.tabla",
        despuesDePaso: 3,
        pasos: [{ seleccion: { por: "elementos", simbolos: ["Na", "K", "Fe", "Cu", "Ag", "Au", "Sn", "Sb", "W", "Hg", "Pb"] }, etiqueta: "Los elementos con símbolo de origen latino están repartidos por toda la tabla." }],
      },
      cuadro(
        4,
        ["Símbolo", "Elemento", "Símbolo", "Elemento"],
        [
          ["Ca", nombreDe("Ca"), "Mg", nombreDe("Mg")],
          ["Cu", nombreDe("Cu"), "Mn", nombreDe("Mn")],
          ["Co", nombreDe("Co"), "Hg", nombreDe("Hg")],
          ["C", nombreDe("C"), "P", nombreDe("P")],
          ["Cl", nombreDe("Cl"), "Pb", nombreDe("Pb")],
          ["Cr", nombreDe("Cr"), "Pt", nombreDe("Pt")],
          ["Cs", nombreDe("Cs"), "K", nombreDe("K")],
        ],
        "Símbolos que se confunden"
      ),
      {
        tipo: "quimia.tabla",
        despuesDePaso: 6,
        pasos: [{ seleccion: { por: "elementos", simbolos: ["H", "O", "F", "Br", "I", "N", "Cl"] }, etiqueta: "Los siete elementos que forman moléculas de dos átomos: H₂, O₂, F₂, Br₂, I₂, N₂ y Cl₂." }],
      },
    ],
    quiz: [
      preg("¿Cuál de estos elementos existe como molécula de dos átomos cuando está solo?", ["Neón (Ne)", "Cloro (Cl)", "Hierro (Fe)", "Helio (He)"], 1, "El cloro es uno de los siete diatómicos (HOFBrINCl): se escribe Cl₂."),
      preg("¿Cuál es el símbolo del potasio?", ["P", "Po", "K", "Pt"], 2, "K viene del latín kalium. El fósforo es P, el polonio Po y el platino Pt."),
      preg("¿Qué elemento tiene el símbolo Hg?", ["Magnesio", "Mercurio", "Manganeso", "Hidrógeno"], 1, "Hg viene de hydrargyrum, «plata líquida»: es el mercurio."),
      preg("¿Cuál es el elemento más abundante (en masa) de la corteza terrestre?", ["Hierro", "Silicio", "Oxígeno", "Aluminio"], 2, "El oxígeno es casi la mitad de la masa de la corteza, sobre todo formando óxidos y silicatos."),
      preg(`¿Cómo se escribe el oxígeno gaseoso que respiramos?`, [f("O"), f("O2"), f("O3"), "2O"], 1, "Es una molécula de dos átomos: O₂. O₃ es el ozono, otra forma del mismo elemento."),
    ],
  },
];
