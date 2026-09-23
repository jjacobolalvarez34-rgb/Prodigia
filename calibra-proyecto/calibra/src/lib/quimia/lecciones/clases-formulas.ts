import type { ClaseQuimia } from "./tipos";
import { preg, cuadro, f, ion, ox, en, coma, masa, atomosTexto } from "./ayudas";
import { masaMolar, numeroOxidacion } from "@/lib/quimia/formulas";
import { CATIONES, armarFormula, buscarAnion, buscarCation } from "@/lib/quimia/nomenclatura";
import { estructuraLewis, electronesTotales, textoEnlaces, textoLibres } from "@/lib/quimia/lewis";
import { REGLAS_BASICAS, resolverOxidacion } from "@/lib/quimia/valencia";
import { datosDe } from "@/lib/quimia/datos";

// Clases del grupo "formulas": enlace químico, fórmulas y masa molar, y
// valencia / número de oxidación con el cruce de cargas. Los números de los
// ejemplos salen de funciones con test (electronegatividad de datos.ts,
// estructuras de lewis.ts, masaMolar de formulas.ts, resolverOxidacion de
// valencia.ts, armarFormula de nomenclatura.ts).

const dif = (a: string, b: string) => coma(Math.abs(datosDe(a)!.electronegatividad! - datosDe(b)!.electronegatividad!), 2);
const arma = (c: string, a: string) => armarFormula(buscarCation(c), buscarAnion(a)).formula;
const oxN = (formula: string, incognita: string, carga = 0) => resolverOxidacion(formula, incognita, carga, REGLAS_BASICAS);
const filaLewis = (formula: string) => {
  const e = estructuraLewis(formula);
  return [f(formula), String(electronesTotales(e)), textoEnlaces(e), textoLibres(e)];
};
// Cargas de los metales con más de una valencia (desde la tabla de cationes).
const cargasDe = (simbolo: string) =>
  CATIONES.filter((c) => c.formula === simbolo)
    .map((c) => c.carga)
    .sort((a, b) => a - b)
    .map(numeroOxidacion)
    .join(" y ");

export const CLASES_QUIMIA_FORMULAS: ClaseQuimia[] = [
  {
    slug: "quimia-clase-enlace-quimico",
    grupo: "formulas",
    orden: 1,
    requierePro: true,
    nombre: "Enlace químico: iónico, covalente y metálico",
    descripcion: "Por qué se unen los átomos, la regla del octeto, los tres tipos de enlace y las estructuras de Lewis básicas.",
    pasos: [
      "Los átomos se unen para alcanzar una configuración más estable, casi siempre con 8 electrones en la capa externa (regla del octeto; el hidrógeno se conforma con 2). Un enlace químico es esa unión. Según cómo se comporten los electrones de valencia hay tres tipos: iónico, covalente y metálico.",
      `La regla del octeto es una guía, no una ley: el hidrógeno completa con 2, el berilio y el boro se quedan con menos de 8, y elementos desde el tercer período pueden tener más de 8 (el azufre en ${f("SF6")}, el fósforo en ${f("PCl5")}). En el colegio se usa como regla general.`,
      `Enlace iónico: un átomo transfiere electrones a otro. Se da entre un metal, que pierde electrones, y un no metal, que los gana, con una diferencia de electronegatividad grande (como convención, mayor que 1,7). Se forman iones y las cargas opuestas se atraen. Ejemplo: en el ${f("NaCl")} la diferencia es ${en("Cl")} − ${en("Na")} = ${dif("Cl", "Na")}.`,
      `El sodio tiene 1 electrón de valencia y el cloro necesita 1 para completar 8: el sodio cede su electrón y quedan ${ion("Na", 1)} y ${ion("Cl", -1)}. En el ${f("MgO")} pasan 2 electrones, del magnesio al oxígeno: ${ion("Mg", 2)} y ${ion("O", -2)}.`,
      "Los compuestos iónicos no forman moléculas sino redes cristalinas de iones: la fórmula (NaCl) solo indica la proporción entre iones (1 a 1). Son sólidos duros, de alto punto de fusión y quebradizos, y conducen la electricidad cuando están fundidos o disueltos, no en estado sólido.",
      "Enlace covalente: los átomos comparten pares de electrones. Se da entre no metales. Cada par compartido es un enlace: simple si es 1 par, doble si son 2 y triple si son 3. Cuantos más pares comparten dos átomos, más corto y más fuerte es el enlace. Los átomos comparten para que cada uno cuente esos electrones como propios y complete su capa.",
      `Hidrógeno (${f("H2")}): un enlace simple. Oxígeno (${f("O2")}): cada O tiene 6 electrones de valencia y comparte 2 pares (enlace doble). Nitrógeno (${f("N2")}): cada N tiene 5 y comparte 3 pares (enlace triple).`,
      `El enlace covalente puede ser apolar o polar. Si los dos átomos tienen igual electronegatividad (${f("H2")}, ${f("O2")}, ${f("N2")}, ${f("Cl2")}), el par se comparte por igual: apolar. Si difieren (diferencia entre 0,4 y 1,7), el par se desplaza hacia el más electronegativo, que queda con una carga parcial negativa (δ−): polar. En el ${f("HCl")}, ${en("Cl")} − ${en("H")} = ${dif("Cl", "H")}: polar, con el Cl δ−. En el agua, ${en("O")} − ${en("H")} = ${dif("O", "H")}: también polar.`,
      `Ojo: una molécula puede tener enlaces polares y ser apolar en conjunto si su forma es simétrica, como el ${f("CO2")}, que es lineal. La polaridad de una molécula depende también de su forma.`,
      "Estructuras de Lewis. Sirven para mostrar cómo se reparten los electrones de valencia en una molécula. Pasos: 1) suma los electrones de valencia de todos los átomos; 2) pon al átomo menos electronegativo en el centro (el hidrógeno nunca es central); 3) únelos con enlaces simples (cada uno son 2 electrones); 4) completa el octeto de los átomos de afuera con pares libres; 5) si sobran o faltan electrones, ajusta con enlaces dobles o triples hasta que todos tengan 8 (el H, 2).",
      `Ejemplo resuelto, el agua: los electrones de valencia son 2 × 1 + 6 = ${electronesTotales(estructuraLewis("H2O"))}. El O va en el centro con 2 enlaces simples con los H (4 electrones); los otros 4 quedan como 2 pares libres sobre el O. Así el O tiene 8 y cada H tiene 2. El dióxido de carbono: 4 + 2 × 6 = ${electronesTotales(estructuraLewis("CO2"))}; con dos enlaces dobles C=O y 2 pares libres en cada O, todos completan 8.`,
      "Enlace metálico: se da entre átomos de metales. Cada átomo libera sus electrones de valencia y queda como catión; los electrones liberados forman un «mar de electrones» que se mueve libremente entre los cationes y los mantiene unidos. Por eso los metales conducen la electricidad y el calor, brillan y se pueden deformar sin romperse.",
      "Cómo decidir el tipo de enlace: metal con no metal, iónico; no metal con no metal, covalente (polar o apolar según la diferencia de electronegatividad); solo metales, metálico. En química avanzada hay casos intermedios; a este nivel esta regla alcanza.",
    ],
    visuales: [
      { tipo: "quimia.enlace", despuesDePaso: 3, enlace: "ionico", ejemplo: "NaCl" },
      { tipo: "quimia.enlace", despuesDePaso: 3, enlace: "ionico", ejemplo: "MgO" },
      { tipo: "quimia.enlace", despuesDePaso: 6, enlace: "covalente", ejemplo: "O2" },
      { tipo: "quimia.enlace", despuesDePaso: 6, enlace: "covalente", ejemplo: "N2" },
      { tipo: "quimia.enlace", despuesDePaso: 7, enlace: "covalente", ejemplo: "HCl" },
      cuadro(10, ["Molécula", "e⁻ de valencia", "Enlaces", "Pares libres"], ["H2O", "NH3", "CH4", "CO2", "N2", "HCl"].map(filaLewis), "Estructuras de Lewis: el conteo de electrones"),
      { tipo: "quimia.enlace", despuesDePaso: 11, enlace: "metalico", ejemplo: "Na" },
      cuadro(
        12,
        ["Tipo", "Entre", "Electrones", "Ejemplo"],
        [
          ["Iónico", "metal + no metal", "se transfieren", f("NaCl")],
          ["Covalente", "no metal + no metal", "se comparten", f("H2O")],
          ["Metálico", "metal + metal", "forman un mar", "Fe, Cu"],
        ],
        "Comparación de los tres tipos de enlace"
      ),
    ],
    quiz: [
      preg(`¿Qué tipo de enlace hay en el ${f("NaCl")}?`, ["Covalente apolar", "Covalente polar", "Iónico", "Metálico"], 2, `Es un metal (Na) con un no metal (Cl) y la diferencia de electronegatividad es grande (${dif("Cl", "Na")}): hay transferencia de un electrón y se forman iones.`),
      preg(`¿Cuántos pares de electrones se comparten en el enlace del ${f("O2")}?`, ["1", "2", "3", "4"], 1, "Cada oxígeno tiene 6 electrones de valencia y necesita 2 más para llegar a 8: comparten 2 pares (enlace doble)."),
      preg(`Los átomos de ${f("N2")} están unidos por...`, ["un enlace simple", "un enlace doble", "un enlace triple", "un enlace iónico"], 2, "Cada nitrógeno tiene 5 electrones de valencia y necesita 3 más: comparten 3 pares."),
      preg("¿Cuál de estas descripciones corresponde al enlace metálico?", ["Transferencia de electrones de un metal a un no metal", "Pares de electrones compartidos entre dos no metales", "Cationes unidos por un mar de electrones libres", "Atracción entre moléculas polares"], 2, "En el enlace metálico los electrones de valencia se mueven libres entre los cationes, lo que explica la conducción eléctrica."),
      preg(`En la molécula de ${f("HCl")}, ¿cuál átomo tiene la carga parcial negativa?`, ["El hidrógeno", "El cloro", "Ninguno: es un enlace apolar", "Los dos por igual"], 1, `El cloro es más electronegativo (${en("Cl")} contra ${en("H")}) y atrae más el par compartido.`),
      preg(`¿Cuántos electrones de valencia hay en total en una molécula de ${f("CO2")}?`, ["12", "14", "16", "18"], 2, "4 del carbono + 2 × 6 de los oxígenos = 16."),
    ],
  },
  {
    slug: "quimia-clase-formulas-masa-molar",
    grupo: "formulas",
    orden: 2,
    requierePro: true,
    nombre: "Fórmulas químicas y masa molar",
    descripcion: "Fórmula molecular, empírica y estructural; subíndice y coeficiente; y cómo calcular la masa molar de un compuesto.",
    pasos: [
      `Una fórmula química representa una sustancia con símbolos y subíndices. La fórmula molecular indica la cantidad real de átomos de cada elemento en una molécula (${f("H2O2")}, ${f("C6H12O6")}). La fórmula empírica indica la proporción mínima entera: la de la glucosa es ${f("CH2O")} y la del agua oxigenada es $\\mathrm{HO}$. La fórmula estructural muestra cómo están unidos los átomos (H–O–H).`,
      `En los compuestos iónicos solo existe la fórmula empírica (la unidad fórmula): ${f("NaCl")} indica la proporción 1 a 1 entre iones en la red cristalina. No existe una «molécula de NaCl».`,
      `Subíndice y coeficiente son cosas distintas. El subíndice está dentro de la fórmula y define la sustancia: ${f("H2O")} es agua y ${f("H2O2")} es agua oxigenada. El coeficiente va delante y dice cuántas unidades hay: $3\\,\\mathrm{H_2O}$ son 3 moléculas de agua. Un paréntesis con subíndice multiplica todo lo que encierra: ${f("Ca(OH)2")} tiene ${atomosTexto("Ca(OH)2")}.`,
      "Error común: para «tener más» de una sustancia se cambia el coeficiente, nunca el subíndice. Cambiar un subíndice es cambiar de sustancia.",
      "La masa molecular relativa es la suma de las masas atómicas de todos los átomos de la fórmula, en u. La masa molar es ese mismo número expresado en g/mol: es la masa de 1 mol de la sustancia. Un mol contiene 6,02 × 10²³ entidades (átomos, moléculas o pares de iones): es el número de Avogadro.",
      `Ejemplo resuelto: el agua. ${f("H2O")} tiene 2 H y 1 O. Masa molar = 2 × ${coma(datosDe("H")!.masa, 2)} + ${coma(datosDe("O")!.masa, 2)} = ${coma(masaMolar("H2O"), 2)}, que se redondea a ${masa("H2O")} g/mol.`,
      `Ejemplo con paréntesis: el carbonato de calcio. ${f("CaCO3")} tiene 1 Ca, 1 C y 3 O: ${coma(datosDe("Ca")!.masa, 2)} + ${coma(datosDe("C")!.masa, 2)} + 3 × ${coma(datosDe("O")!.masa, 2)} = ${coma(masaMolar("CaCO3"), 2)}, o sea ${masa("CaCO3")} g/mol.`,
      `Otro con subíndices grandes: ${f("Al2(SO4)3")} tiene 2 Al, 3 S y 12 O: 2 × ${coma(datosDe("Al")!.masa, 2)} + 3 × ${coma(datosDe("S")!.masa, 2)} + 12 × ${coma(datosDe("O")!.masa, 2)} = ${coma(masaMolar("Al2(SO4)3"), 2)}, o sea ${masa("Al2(SO4)3")} g/mol.`,
      `La composición porcentual sale de dividir la masa de cada elemento por la masa molar. En el agua, el oxígeno aporta ${coma(datosDe("O")!.masa, 2)} de ${coma(masaMolar("H2O"), 2)}: ${coma((datosDe("O")!.masa / masaMolar("H2O")) * 100, 1)} % de oxígeno y ${coma(((2 * datosDe("H")!.masa) / masaMolar("H2O")) * 100, 1)} % de hidrógeno (suman 100 %).`,
      "Errores comunes: olvidar que el subíndice de un paréntesis multiplica a todos los átomos que encierra; sumar los símbolos en vez de sus masas; y confundir u (masa de un átomo) con g/mol (masa de un mol). Con las masas atómicas de la tabla, redondea al final, no en cada paso.",
    ],
    visuales: [
      cuadro(
        2,
        ["Expresión", "Qué significa", "Átomos"],
        [
          [f("H2O"), "1 molécula de agua", atomosTexto("H2O")],
          ["$2\\,\\mathrm{H_2O}$", "2 moléculas de agua", atomosTexto("H2O", 2)],
          ["$3\\,\\mathrm{Ca(OH)_2}$", "3 unidades de hidróxido de calcio", atomosTexto("Ca(OH)2", 3)],
          [f("Al2(SO4)3"), "1 unidad de sulfato de aluminio", atomosTexto("Al2(SO4)3")],
        ]
      ),
      cuadro(
        7,
        ["Compuesto", "Fórmula", "Masa molar (g/mol)"],
        [
          ["agua", f("H2O"), masa("H2O")],
          ["dióxido de carbono", f("CO2"), masa("CO2")],
          ["cloruro de sodio", f("NaCl"), masa("NaCl")],
          ["ácido sulfúrico", f("H2SO4"), masa("H2SO4")],
          ["hidróxido de calcio", f("Ca(OH)2"), masa("Ca(OH)2")],
          ["carbonato de calcio", f("CaCO3"), masa("CaCO3")],
          ["glucosa", f("C6H12O6"), masa("C6H12O6")],
        ],
        "Masas molares (con las masas atómicas de la tabla, redondeadas a 1 decimal)"
      ),
    ],
    quiz: [
      preg(`¿Cuál es la masa molar del dióxido de carbono (${f("CO2")})?`, [`${masa("CO")} g/mol`, `${masa("CO2")} g/mol`, "88,0 g/mol", "16,0 g/mol"], 1, `12,01 + 2 × 16,00 = ${coma(masaMolar("CO2"), 2)}, que se redondea a ${masa("CO2")} g/mol.`),
      preg(`¿Cuántos átomos de hidrógeno hay en $2\\,\\mathrm{Ca(OH)_2}$?`, ["2", "4", "6", "8"], 1, "Cada Ca(OH)₂ tiene 2 H y hay 2 unidades: 2 × 2 = 4."),
      preg(`¿Cuál es la fórmula empírica de la glucosa, ${f("C6H12O6")}?`, [f("C6H12O6"), f("CH2O"), f("C2H4O2"), f("CHO")], 1, "Se divide por el máximo común divisor (6): C₁H₂O₁ se escribe CH₂O."),
      preg(`¿Cuál es la masa molar del cloruro de sodio (${f("NaCl")})?`, [`${masa("NaCl")} g/mol`, "35,5 g/mol", "23,0 g/mol", "12,0 g/mol"], 0, `22,99 + 35,45 = ${coma(masaMolar("NaCl"), 2)}, o sea ${masa("NaCl")} g/mol.`),
      preg("Un mol de una sustancia contiene...", ["1 gramo de sustancia", "6,02 × 10²³ entidades (moléculas, átomos o unidades fórmula)", "1 litro de gas", "100 partículas"], 1, "Es el número de Avogadro. La masa de ese mol, en gramos, es la masa molar."),
      preg(`¿Cuál es la masa molar del ácido sulfúrico (${f("H2SO4")})?`, ["49,0 g/mol", "64,1 g/mol", `${masa("H2SO4")} g/mol`, "34,1 g/mol"], 2, `2 × 1,01 + 32,06 + 4 × 16,00 = ${coma(masaMolar("H2SO4"), 2)}, o sea ${masa("H2SO4")} g/mol.`),
    ],
  },
  {
    slug: "quimia-clase-valencia-oxidacion-cruce",
    grupo: "formulas",
    orden: 3,
    requierePro: true,
    nombre: "Valencia, número de oxidación y cómo armar fórmulas",
    descripcion: "Reglas básicas del número de oxidación, cargas típicas por grupo y el método de cruzar las cargas.",
    pasos: [
      `La valencia es la capacidad de combinación de un átomo. El número de oxidación es la carga que tendría el átomo si todos sus enlaces fueran iónicos: los electrones compartidos se le asignan al átomo más electronegativo. Se escribe con signo sobre el símbolo, como ${ox("Fe", 3)}, distinto de la carga de un ion, que se escribe con el signo después del número, como ${ion("Fe", 3)}. En los iones simples los dos coinciden.`,
      "Reglas básicas: 1) un elemento solo (Fe, O₂, H₂, Cl₂) tiene número de oxidación 0; 2) un ion monoatómico tiene como número de oxidación su carga (Na⁺ es +1, Cl⁻ es −1); 3) el hidrógeno es +1, salvo en los hidruros metálicos (NaH, CaH₂), donde es −1; 4) el oxígeno es −2, salvo en los peróxidos, donde es −1; 5) el flúor es siempre −1; 6) los metales alcalinos son +1, los alcalinotérreos +2 y el aluminio +3; 7) la suma de los números de oxidación de un compuesto neutro es 0, y en un ion es igual a su carga.",
      `Ejemplo resuelto 1: ¿cuál es el número de oxidación del azufre en ${f("H2SO4")}? Se plantea 2 × (+1) + x + 4 × (−2) = 0, que da x = ${numeroOxidacion(oxN("H2SO4", "S"))}. En el ion ${ion("SO4", -2)}: x + 4 × (−2) = −2, que da lo mismo: ${numeroOxidacion(oxN("SO4", "S", -2))}.`,
      `Ejemplo resuelto 2: el nitrógeno en ${f("HNO3")}: (+1) + x + 3 × (−2) = 0, o sea x = ${numeroOxidacion(oxN("HNO3", "N"))}. En el ion amonio ${ion("NH4", 1)}: x + 4 × (+1) = +1, o sea x = ${numeroOxidacion(oxN("NH4", "N", 1))}. El hierro en ${f("Fe2O3")}: 2x + 3 × (−2) = 0, o sea x = ${numeroOxidacion(oxN("Fe2O3", "Fe"))}.`,
      `Ejemplo resuelto 3: el manganeso en ${f("KMnO4")}: (+1) + x + 4 × (−2) = 0, o sea x = ${numeroOxidacion(oxN("KMnO4", "Mn"))}. El cromo en ${f("K2Cr2O7")}: 2 × (+1) + 2x + 7 × (−2) = 0, o sea x = ${numeroOxidacion(oxN("K2Cr2O7", "Cr"))}. Estos números también se usan en las reacciones de oxidación y reducción.`,
      "Cargas típicas de los grupos principales: grupo 1, +1; grupo 2, +2; grupo 13, +3; grupo 14, +4 (también −4); grupo 15, −3 (el nitrógeno y el fósforo también tienen +3 y +5); grupo 16, −2 (el azufre también +4 y +6); grupo 17, −1 (el cloro, el bromo y el yodo también +1, +3, +5 y +7; el flúor, solo −1). Los metales de transición pueden tener varios: hierro (+2 y +3), cobre (+1 y +2), estaño (+2 y +4), plomo (+2 y +4), oro (+1 y +3), cobalto (+2 y +3).",
      `Cómo armar una fórmula cruzando las cargas: 1) escribe el catión y el anión con sus cargas; 2) el número de la carga de cada uno (sin signo) pasa a ser el subíndice del otro; 3) simplifica si hay divisor común; 4) pon entre paréntesis los iones de varios átomos cuando su subíndice es mayor que 1; 5) verifica que la suma de las cargas sea cero. Ejemplos: ${ion("Al", 3)} con ${ion("O", -2)} da ${f(arma("Al3+", "O2-"))}; ${ion("Ca", 2)} con ${ion("OH", -1)} da ${f(arma("Ca2+", "OH-"))}; ${ion("Fe", 3)} con ${ion("SO4", -2)} da ${f(arma("Fe3+", "SO4^2-"))}; ${ion("NH4", 1)} con ${ion("PO4", -3)} da ${f(arma("NH4+", "PO4^3-"))}.`,
      "Errores comunes: olvidar simplificar (CaO, no Ca₂O₂); olvidar el paréntesis (Ca(OH)₂, no CaOH₂); cambiar el subíndice dentro de un ion (el sulfato es siempre SO₄, y si hacen falta dos se escribe (SO₄)₂ entre paréntesis); y escribir la carga como subíndice. Para comprobar una fórmula, suma las cargas: debe dar 0.",
      `Verificación final: en ${f(arma("Al3+", "O2-"))}, 2 × (+3) + 3 × (−2) = 0. En ${f(arma("Fe3+", "SO4^2-"))}, 2 × (+3) + 3 × (−2) = 0. En ${f(arma("Ca2+", "PO4^3-"))}, 3 × (+2) + 2 × (−3) = 0.`,
    ],
    visuales: [
      cuadro(
        1,
        ["Regla", "Ejemplo"],
        [
          ["Elemento solo: 0", `${f("O2")}: ${ox("O", 0)}`],
          ["Ion monoatómico: su carga", `${ion("Cl", -1)}: ${ox("Cl", -1)}`],
          ["Hidrógeno: +1 (en hidruros metálicos, −1)", `${f("H2O")}: ${ox("H", 1)}; ${f("NaH")}: ${ox("H", -1)}`],
          ["Oxígeno: −2 (en peróxidos, −1)", `${f("H2O")}: ${ox("O", -2)}; ${f("H2O2")}: ${ox("O", -1)}`],
          ["Flúor: siempre −1", `${f("HF")}: ${ox("F", -1)}`],
          ["Alcalinos +1, alcalinotérreos +2, Al +3", `${f("NaCl")}: ${ox("Na", 1)}; ${f("CaO")}: ${ox("Ca", 2)}`],
          ["La suma es 0 (neutro) o la carga (ion)", `${f("H2SO4")}: 2(+1) + (+6) + 4(−2) = 0`],
        ],
        "Reglas básicas del número de oxidación"
      ),
      cuadro(
        5,
        ["Grupo", "Número de oxidación típico", "Ejemplos"],
        [
          ["1", "+1", "Na, K"],
          ["2", "+2", "Mg, Ca"],
          ["13", "+3", "Al"],
          ["14", "+4 (y −4)", "C, Si"],
          ["15", "−3 (también +3, +5)", "N, P"],
          ["16", "−2 (el S también +4, +6)", "O, S"],
          ["17", "−1 (Cl, Br, I también +1, +3, +5, +7)", "F, Cl"],
        ],
        "Números de oxidación típicos por grupo"
      ),
      cuadro(
        5,
        ["Metal", "Cargas posibles"],
        [
          ["Hierro (Fe)", cargasDe("Fe")],
          ["Cobre (Cu)", cargasDe("Cu")],
          ["Estaño (Sn)", cargasDe("Sn")],
          ["Plomo (Pb)", cargasDe("Pb")],
          ["Oro (Au)", cargasDe("Au")],
          ["Cobalto (Co)", cargasDe("Co")],
        ],
        "Metales con más de una valencia"
      ),
      { tipo: "quimia.cruce", despuesDePaso: 6, cation: "Al3+", anion: "O2-" },
      { tipo: "quimia.cruce", despuesDePaso: 6, cation: "Ca2+", anion: "OH-" },
      { tipo: "quimia.cruce", despuesDePaso: 6, cation: "Fe3+", anion: "SO4^2-" },
      { tipo: "quimia.cruce", despuesDePaso: 6, cation: "NH4+", anion: "PO4^3-" },
    ],
    quiz: [
      preg(`¿Cuál es el número de oxidación del azufre en ${f("H2SO4")}?`, ["+2", "+4", "+6", "−2"], 2, "2 × (+1) + x + 4 × (−2) = 0, entonces x = +6."),
      preg(`¿Cuál es el número de oxidación del nitrógeno en ${f("HNO3")}?`, ["+1", "+3", "+5", "−3"], 2, "(+1) + x + 3 × (−2) = 0, entonces x = +5."),
      preg(`¿Cuál es el número de oxidación del manganeso en ${f("KMnO4")}?`, ["+2", "+4", "+6", "+7"], 3, "(+1) + x + 4 × (−2) = 0, entonces x = +7."),
      preg(`¿Cuál es la fórmula del fosfato de calcio (${ion("Ca", 2)} y ${ion("PO4", -3)})?`, [f("CaPO4"), f(arma("Ca2+", "PO4^3-")), f("Ca2(PO4)3"), f("Ca3PO4")], 1, "Se cruzan las cargas: el 2 del calcio va al fosfato y el 3 del fosfato va al calcio. El fosfato lleva paréntesis porque su subíndice es 2: Ca₃(PO₄)₂."),
      preg(`¿Qué número de oxidación tiene el oxígeno en el peróxido de hidrógeno, ${f("H2O2")}?`, ["−2", "−1", "0", "+1"], 1, "En los peróxidos el oxígeno es −1: 2 × (+1) + 2 × x = 0, entonces x = −1."),
      preg(`¿Qué número de oxidación tiene el hidrógeno en el hidruro de sodio, ${f("NaH")}?`, ["+1", "−1", "0", "−2"], 1, "El sodio es +1, así que el hidrógeno tiene que ser −1 para que la suma sea 0. Es uno de los pocos casos en que el H es negativo."),
    ],
  },
];
