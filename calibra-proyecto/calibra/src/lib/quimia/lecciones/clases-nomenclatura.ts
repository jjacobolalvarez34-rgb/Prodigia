import type { ClaseQuimia } from "./tipos";
import { preg, cuadro, cuadroNombres, f, ion, ox, en, nom, Nom, reaccion } from "./ayudas";
import {
  ANIONES,
  CATIONES,
  COMPUESTOS_IONICOS,
  HIDRACIDOS,
  OTROS_COMPUESTOS,
  OXIDOS_NO_METALICOS,
  OXOACIDOS,
  armarFormula,
  buscarAnion,
  buscarCation,
  oxidacionCentral,
} from "@/lib/quimia/nomenclatura";
import { ionLatex, numeroOxidacion } from "@/lib/quimia/formulas";
import { resolverOxidacion, REGLAS_BASICAS } from "@/lib/quimia/valencia";

// Clases del grupo "nomenclatura": nombrar y escribir compuestos inorgánicos
// (óxidos, hidruros, peróxidos, hidróxidos, ácidos, sales) en los tres
// sistemas de colegio (tradicional, Stock y sistemática). TODOS los nombres
// salen de las tablas de referencia de src/lib/quimia/nomenclatura.ts (con su
// test contra reglas calculadas) y todas las reacciones pasan por reaccion(),
// que lanza si no están balanceadas.

const arma = (c: string, a: string) => armarFormula(buscarCation(c), buscarAnion(a)).formula;
const comunDe = (formula: string) => COMPUESTOS_IONICOS.find((c) => c.formula === formula)?.comun ?? "—";
const oxN = (formula: string, incognita: string, carga = 0) => resolverOxidacion(formula, incognita, carga, REGLAS_BASICAS);
const romano = (n: number) => ["", "I", "II", "III", "IV", "V", "VI", "VII"][n];
const aniónFormula = (id: string) => buscarAnion(id);

// Filas de la tabla de anhídridos (óxidos no metálicos).
const filaAnhidrido = (formula: string) => {
  const o = OXIDOS_NO_METALICOS.find((x) => x.formula === formula)!;
  return [f(formula), o.tradicional ?? "—", o.stock, o.sistematica];
};

// Filas de la tabla de oxoácidos: fórmula, N.º de oxidación del átomo central, nombre y anhídrido.
const filaOxoacido = (formula: string) => {
  const a = OXOACIDOS.find((x) => x.formula === formula)!;
  return [f(formula), numeroOxidacion(oxidacionCentral(formula)), a.tradicional, f(a.anhidrido)];
};

// Filas de la tabla de aniones poliatómicos.
const filaAnion = (id: string) => {
  const a = ANIONES.find((x) => x.id === id)!;
  return [a.nombre, `$${ionLatex(a.formula, a.carga)}$`];
};

export const CLASES_QUIMIA_NOMENCLATURA: ClaseQuimia[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "quimia-clase-nomenclatura-vision-general",
    grupo: "nomenclatura",
    orden: 1,
    requierePro: true,
    nombre: "Nomenclatura inorgánica: visión general",
    descripcion: "Los tres sistemas de nomenclatura, cuándo se usa cada uno y cómo se escriben los nombres y las fórmulas.",
    pasos: [
      "La nomenclatura es el conjunto de reglas para darle nombre a los compuestos y escribir sus fórmulas. En el colegio se enseñan tres sistemas: el tradicional (o clásico), el de Stock y el sistemático (con prefijos, llamado también de atomicidad). La IUPAC, que es la entidad que fija las normas internacionales, recomienda los dos últimos; el tradicional ya no se recomienda, pero sigue en muchos libros, etiquetas y exámenes, así que se aprende igual.",
      "Un mismo compuesto tiene un nombre en cada sistema. Observa cómo cambia el nombre del mismo óxido de hierro según el sistema.",
      `Sistema tradicional. Distingue las valencias de un elemento con terminaciones: si tiene una sola, se dice «de» y el nombre (${nom("Na2O", "tradicional")}); si tiene dos, la menor lleva «-oso» y la mayor «-ico» (${nom("FeO", "tradicional")} y ${nom("Fe2O3", "tradicional")}). Los halógenos (que tienen cuatro estados de oxidación positivos) usan además los prefijos «hipo-» (el menor) y «per-» (el mayor): hipo…oso, …oso, …ico, per…ico.`,
      `Sistema de Stock. Indica el número de oxidación del elemento con un número romano entre paréntesis, pegado al nombre: ${nom("FeO", "stock")} y ${nom("Fe2O3", "stock")}. Si el elemento tiene una sola valencia, no se pone el número: ${nom("Na2O", "stock")}.`,
      `Sistema sistemático (de atomicidad). Indica con prefijos cuántos átomos hay de cada elemento: mono-, di-, tri-, tetra-, penta-, hexa-, hepta-. ${f("Fe2O3")} es ${nom("Fe2O3", "sistematica")}. El prefijo «mono» se omite en el primer elemento.`,
      `Cómo se escriben las FÓRMULAS: 1) primero el elemento menos electronegativo (el metal o el catión) y después el más electronegativo: ${f("NaCl")}, ${f("Al2O3")}. Las excepciones son históricas: el hidrógeno de los ácidos va primero (${f("HCl")}, ${f("H2SO4")}) y se mantienen NH₃ y CH₄. 2) El subíndice 1 no se escribe. 3) Se usan paréntesis cuando un grupo de átomos se repite: ${f("Ca(OH)2")}, ${f("Al2(SO4)3")}; nunca con subíndice 1: ${f("NaOH")}, no Na(OH). 4) Cada símbolo empieza con mayúscula y la segunda letra, si hay, va en minúscula.`,
      `Cómo se escriben los NOMBRES: 1) se nombra primero el anión (el más electronegativo) y después «de» y el catión: ${f("NaCl")} es ${nom("NaCl", "stock")}, o sea, se lee al revés que la fórmula. 2) Se escriben en minúscula (salvo al empezar una oración): «cloruro de sodio», no «Cloruro De Sodio». 3) Llevan tilde óxido, peróxido, hidróxido y anhídrido, y también los ácidos como sulfúrico, nítrico, clórico o carbónico; en cambio sulfato, nitrato o cloruro no. 4) El número romano va entre paréntesis pegado al nombre del metal: hierro (III); los textos de la IUPAC lo escriben sin espacio, «hierro(III)», y en el colegio suele verse con espacio: las dos formas se entienden. 5) Los prefijos se pegan a la palabra, sin espacio ni guion: trióxido de dihierro.`,
      "¿Cuál sistema conviene? El tradicional es el de los ácidos y las sales comunes (ácido sulfúrico, sulfato de sodio, carbonato de calcio). El de Stock es el más práctico cuando el metal tiene varias valencias (óxido de hierro (III)). El sistemático es el más claro para óxidos y compuestos de no metales (dióxido de carbono, pentacloruro de fósforo), porque el nombre dice la fórmula. Los tres son válidos: tu docente o tu libro indican cuál usar.",
      "Mapa de lo que sigue en el curso: los compuestos inorgánicos se ordenan en familias según los elementos que los forman. Cada una tiene su fórmula general y su forma de nombrar; las siguientes clases recorren una por una.",
    ],
    visuales: [
      cuadroNombres(1, ["FeO", "Fe2O3", "CuO", "SO3", "CO2", "FeCl3"], ["tradicional", "stock", "sistematica"], "Un mismo compuesto, tres nombres"),
      cuadro(
        6,
        ["Regla", "Bien", "Mal"],
        [
          ["Subíndice 1", f("NaCl"), "Na₁Cl₁"],
          ["Paréntesis solo si el grupo se repite", `${f("NaOH")} y ${f("Ca(OH)2")}`, "Na(OH) y CaOH₂"],
          ["Nombre en minúscula", nom("NaCl", "stock"), "Cloruro De Sodio"],
          ["Romano entre paréntesis", nom("Fe2O3", "stock"), "óxido de hierro III"],
          ["Prefijos pegados", nom("Fe2O3", "sistematica"), "tri óxido de di hierro"],
        ],
        "Cómo se escribe: bien y mal"
      ),
      cuadro(
        8,
        ["Tipo de compuesto", "Fórmula general", "Ejemplo", "Nombre"],
        [
          ["Óxido básico", "metal + O", f("Na2O"), nom("Na2O", "stock")],
          ["Óxido ácido (anhídrido)", "no metal + O", f("SO3"), `${nom("SO3", "tradicional")} / ${nom("SO3", "sistematica")}`],
          ["Hidruro metálico", "metal + H", f("CaH2"), nom("CaH2", "stock")],
          ["Peróxido", "metal + $\\mathrm{O_2}$", f("Na2O2"), nom("Na2O2", "stock")],
          ["Hidróxido", "metal + OH", f("Ca(OH)2"), nom("Ca(OH)2", "stock")],
          ["Hidrácido", "H + no metal", f("HCl"), nom("HCl", "tradicional")],
          ["Oxoácido", "H + no metal + O", f("H2SO4"), nom("H2SO4", "tradicional")],
          ["Sal binaria", "metal + no metal", f("NaCl"), nom("NaCl", "stock")],
          ["Oxisal", "metal + no metal + O", f("Na2SO4"), nom("Na2SO4", "stock")],
          ["Sal ácida", "como una oxisal, con H", f("NaHCO3"), nom("NaHCO3", "stock")],
        ],
        "Mapa de los compuestos inorgánicos"
      ),
    ],
    quiz: [
      preg(`¿Cuál es el nombre en nomenclatura Stock de ${f("FeCl3")}?`, [Nom("FeCl3", "stock"), Nom("FeCl3", "tradicional"), Nom("FeCl3", "sistematica"), Nom("FeCl2", "stock")], 0, "En Stock el número romano es la carga del hierro: hay tres Cl⁻, así que Fe³⁺ y el nombre es cloruro de hierro (III). «Cloruro férrico» es el nombre tradicional y «tricloruro de hierro» el sistemático."),
      preg(`¿Cuál es el nombre sistemático de ${f("Fe2O3")}?`, [Nom("Fe2O3", "sistematica"), Nom("FeO", "sistematica"), Nom("Fe2O3", "stock"), "Dióxido de hierro"], 0, "Dos hierros (di) y tres oxígenos (tri): trióxido de dihierro."),
      preg(`¿Cuál es el nombre tradicional de ${f("FeO")}?`, [Nom("Fe2O3", "tradicional"), Nom("FeO", "tradicional"), Nom("FeO", "stock"), "Óxido de hierro"], 1, "El hierro tiene dos valencias: la menor (+2) lleva -oso. FeO es óxido ferroso y Fe₂O₃ (+3) es óxido férrico."),
      preg("¿Cuál de estas escrituras es la correcta?", ["Cloruro De Sodio", "cloruro de sodio", "Cloruro de Sodio", "CLORURO DE SODIO"], 1, "Los nombres de compuestos se escriben en minúscula (salvo al empezar una oración)."),
      preg(`En ${f("Ca(OH)2")}, ¿por qué el OH va entre paréntesis?`, ["Porque es un ácido", "Porque el grupo OH se repite 2 veces", "Porque el calcio es un metal", "No hace falta: es opcional"], 1, "El paréntesis indica que el subíndice 2 multiplica a todo el grupo OH: 1 Ca, 2 O y 2 H."),
      preg("¿Qué sistema indica el número de oxidación con un número romano entre paréntesis?", ["El tradicional", "El de Stock", "El sistemático", "Ninguno"], 1, "El sistema Stock: óxido de hierro (III), cloruro de cobre (II)."),
    ],
  },
  // ---------------------------------------------------------------- 2
  {
    slug: "quimia-clase-oxidos",
    grupo: "nomenclatura",
    orden: 2,
    requierePro: true,
    nombre: "Óxidos básicos y óxidos ácidos",
    descripcion: "Cómo se forman, se nombran (en los tres sistemas) y se escriben los óxidos de metales y de no metales.",
    pasos: [
      `Un óxido es un compuesto binario de un elemento con oxígeno, donde el oxígeno tiene número de oxidación −2. Se forman cuando un elemento reacciona con el oxígeno: ${reaccion([[4, "Fe"], [3, "O2"]], [[2, "Fe2O3"]])} ${reaccion([[2, "Mg"], [1, "O2"]], [[2, "MgO"]])} ${reaccion([[1, "S"], [1, "O2"]], [[1, "SO2"]])} ${reaccion([[1, "C"], [1, "O2"]], [[1, "CO2"]])}`,
      `Óxidos básicos (metal + oxígeno). Se llaman básicos porque al reaccionar con agua dan hidróxidos, que son bases: ${reaccion([[1, "Na2O"], [1, "H2O"]], [[2, "NaOH"]])} ${reaccion([[1, "CaO"], [1, "H2O"]], [[1, "Ca(OH)2"]])}`,
      `Cómo se escribe la fórmula de un óxido básico: cruzando las cargas del metal con la del oxígeno (${ion("O", -2)}). Con ${ion("Al", 3)} da ${f(arma("Al3+", "O2-"))}; con ${ion("Ca", 2)} da ${f(arma("Ca2+", "O2-"))} (se simplifica); con ${ion("Na", 1)} da ${f(arma("Na+", "O2-"))}.`,
      "Cómo se nombran: en el sistema tradicional, «óxido de» + el metal si tiene una sola valencia, u «óxido» + el metal con -oso o -ico si tiene dos (óxido ferroso, óxido férrico). En Stock, «óxido de» + el metal con su número romano si hace falta. En el sistemático se agregan prefijos. La tabla muestra varios casos.",
      "Los metales con dos valencias son un punto de error frecuente. Para hallar la valencia del metal en un óxido: los subíndices cruzados la delatan. En Fe₂O₃ hay 3 oxígenos (carga −6 en total) repartidos entre 2 hierros: cada uno es +3. En FeO hay 1 oxígeno (−2) para 1 hierro: es +2.",
      `Óxidos ácidos o anhídridos (no metal + oxígeno). Se llaman ácidos porque al reaccionar con agua dan oxoácidos: ${reaccion([[1, "SO3"], [1, "H2O"]], [[1, "H2SO4"]])} ${reaccion([[1, "CO2"], [1, "H2O"]], [[1, "H2CO3"]])} ${reaccion([[1, "N2O5"], [1, "H2O"]], [[2, "HNO3"]])} ${reaccion([[1, "Cl2O7"], [1, "H2O"]], [[2, "HClO4"]])}`,
      "Nomenclatura tradicional de los anhídridos: la palabra «anhídrido» + el no metal con la terminación según su número de oxidación. Los halógenos (Cl, Br, I) usan cuatro: +1 hipo…oso, +3 …oso, +5 …ico y +7 per…ico. El azufre, el selenio y el telurio usan dos: +4 …oso y +6 …ico. El nitrógeno, el fósforo y el arsénico también dos: +3 …oso y +5 …ico. El carbono y el silicio, uno solo: +4 …ico. Con Stock: «óxido de» + el no metal con su número romano; con el sistemático, los prefijos.",
      `Cómo escribir la fórmula de un óxido no metálico a partir del número de oxidación n del no metal: si n es impar, la fórmula es E₂Oₙ; si n es par, se simplifica a EO(n/2). El nitrógeno con +5 da ${f("N2O5")}; el azufre con +6 da ${f("SO3")}; el carbono con +4 da ${f("CO2")}; el cloro con +7 da ${f("Cl2O7")}. Comprobación: en ${f("N2O5")}, 2 × (+5) + 5 × (−2) = 0.`,
      `Casos especiales. El monóxido de carbono (${f("CO")}, óxido de carbono (II)) es distinto del dióxido de carbono (${f("CO2")}). El ${f("NO")} es el monóxido de nitrógeno y el ${f("NO2")}, el dióxido de nitrógeno: a estos óxidos no se les aplica bien el nombre tradicional. El ${f("N2O")} se conoce como óxido nitroso (nombre común) o monóxido de dinitrógeno. Y el agua, ${f("H2O")}, es en rigor el óxido de hidrógeno, pero conserva su nombre común.`,
      "Errores frecuentes: confundir monóxido y dióxido de carbono (uno es venenoso y el otro es el gas que exhalamos); escribir prefijos donde no corresponde en el sistema Stock; y olvidar simplificar (SO₂ y no S₂O₄ para el azufre +4).",
    ],
    visuales: [
      cuadroNombres(3, ["Na2O", "CaO", "Al2O3", "FeO", "Fe2O3", "Cu2O", "CuO", "SnO2", "PbO2", "Au2O3"], ["tradicional", "stock", "sistematica"], "Óxidos básicos en los tres sistemas"),
      { tipo: "quimia.cruce", despuesDePaso: 2, cation: "Al3+", anion: "O2-" },
      cuadro(
        6,
        ["Fórmula", "Tradicional", "Stock", "Sistemática"],
        ["Cl2O", "Cl2O3", "Cl2O5", "Cl2O7", "SO2", "SO3", "N2O3", "N2O5", "CO2", "P2O5"].map(filaAnhidrido),
        "Óxidos ácidos (anhídridos) en los tres sistemas"
      ),
    ],
    quiz: [
      preg("¿Cuál es la fórmula del óxido de aluminio?", [f("AlO"), f("Al2O3"), f("Al3O2"), f("AlO3")], 1, "Se cruzan las cargas Al³⁺ y O²⁻: el 3 va al oxígeno y el 2 al aluminio: Al₂O₃."),
      preg(`¿Cuál es el nombre tradicional de ${f("Fe2O3")}?`, [Nom("FeO", "tradicional"), Nom("Fe2O3", "tradicional"), Nom("Fe2O3", "stock"), "Anhídrido férrico"], 1, "El hierro tiene +3, la valencia mayor: -ico. Es óxido férrico (óxido de hierro (III) en Stock)."),
      preg(`¿Cuál es el nombre tradicional de ${f("SO3")}?`, [Nom("SO2", "tradicional"), Nom("SO3", "tradicional"), Nom("SO3", "sistematica"), "Óxido sulfúrico"], 1, "Es un óxido de un no metal (anhídrido) y el azufre tiene +6: el más alto lleva -ico. Anhídrido sulfúrico."),
      preg("¿Cuál es la fórmula del anhídrido nítrico (nitrógeno +5)?", [f("NO2"), f("N2O3"), f("N2O5"), f("NO5")], 2, "Con un número de oxidación impar (+5), la fórmula es E₂Oₙ: N₂O₅."),
      preg(`¿Cuál es el nombre sistemático de ${f("Cl2O7")}?`, [Nom("Cl2O7", "sistematica"), Nom("Cl2O", "sistematica"), Nom("Cl2O7", "stock"), "Dióxido de cloro"], 0, "Dos cloros y siete oxígenos: heptaóxido de dicloro."),
      preg("¿Qué se obtiene cuando un óxido básico reacciona con agua?", ["Un ácido", "Un hidróxido", "Una sal", "Un hidruro"], 1, "Óxido básico + agua da un hidróxido (una base): CaO + H₂O → Ca(OH)₂."),
    ],
  },
  // ---------------------------------------------------------------- 3
  {
    slug: "quimia-clase-hidruros-peroxidos",
    grupo: "nomenclatura",
    orden: 3,
    requierePro: true,
    nombre: "Hidruros y peróxidos",
    descripcion: "Hidruros metálicos y no metálicos, con sus nombres comunes, y peróxidos: fórmula y nomenclatura.",
    pasos: [
      `Un hidruro es un compuesto de hidrógeno con otro elemento. El número de oxidación del hidrógeno depende de con quién se une: si el otro elemento es menos electronegativo (un metal), el hidrógeno es −1; si es más electronegativo, el hidrógeno es +1. Por ejemplo, el sodio (${en("Na")}) es menos electronegativo que el hidrógeno (${en("H")}), pero el nitrógeno (${en("N")}) es más.`,
      `Hidruros metálicos (metal + hidrógeno, con H = −1). Se forman así: ${reaccion([[2, "Na"], [1, "H2"]], [[2, "NaH"]])} ${reaccion([[1, "Ca"], [1, "H2"]], [[1, "CaH2"]])} La fórmula sale de cruzar las cargas del metal con la del ${ion("H", -1)}: ${f("NaH")}, ${f("CaH2")}, ${f("AlH3")}.`,
      "Nombres de los hidruros metálicos: «hidruro de» + el metal (con -oso o -ico o número romano si tiene varias valencias) y, en el sistemático, con prefijos. La tabla los muestra.",
      "Hidruros no metálicos (con el hidrógeno en +1). Los de los grupos 13, 14 y 15 tienen nombres comunes que son los que se usan: el metano (CH₄), el amoníaco (NH₃), la fosfina (PH₃), el silano (SiH₄) y el diborano (B₂H₆). No se nombran con las reglas de sales. Los de los grupos 16 y 17 son el agua y los hidrácidos (HCl, H₂S...), que se ven en la clase de ácidos.",
      `Se forman a partir de los elementos: ${reaccion([[1, "N2"], [3, "H2"]], [[2, "NH3"]])} ${reaccion([[2, "H2"], [1, "O2"]], [[2, "H2O"]])} ${reaccion([[1, "C"], [2, "H2"]], [[1, "CH4"]])}`,
      `Peróxidos. Contienen el ion peróxido ${ion("O2", -2)}, dos oxígenos unidos, en el que cada oxígeno tiene número de oxidación −1 (en los óxidos es −2). Se nombran «peróxido de» + el metal: ${f("Na2O2")} es ${nom("Na2O2", "stock")}, ${f("BaO2")} es ${nom("BaO2", "stock")}, ${f("CaO2")} es ${nom("CaO2", "stock")}. El más conocido es el ${f("H2O2")}, el peróxido de hidrógeno (agua oxigenada).`,
      `Cuidado con no simplificar mal: el peróxido de sodio es ${f("Na2O2")} y no NaO, porque los dos oxígenos van juntos. Al cruzar las cargas de ${ion("Na", 1)} y ${ion("O2", -2)} da ${f(arma("Na+", "O2^2-"))}. Los de metales con carga +2 (como Ca) se simplifican y quedan ${f("CaO2")}.`,
      `Se forman al reaccionar algunos metales muy activos con exceso de oxígeno, y se descomponen liberando oxígeno: ${reaccion([[2, "Na"], [1, "O2"]], [[1, "Na2O2"]])} ${reaccion([[2, "H2O2"]], [[2, "H2O"], [1, "O2"]])} Por eso el agua oxigenada burbujea en una herida.`,
      "Error frecuente: confundir óxido con peróxido. El óxido de calcio (CaO) tiene O²⁻ y el peróxido de calcio (CaO₂) tiene O₂²⁻. También se confunde el hidruro (H es −1) con los compuestos donde el H es +1, como el agua o el amoníaco.",
    ],
    visuales: [
      cuadroNombres(2, ["NaH", "CaH2", "AlH3", "FeH2", "FeH3"], ["tradicional", "stock", "sistematica"], "Hidruros metálicos en los tres sistemas"),
      cuadro(
        3,
        ["Fórmula", "Nombre", "Grupo del no metal"],
        [
          [f("B2H6"), OTROS_COMPUESTOS.find((c) => c.formula === "B2H6")!.nombre, "13"],
          [f("CH4"), OTROS_COMPUESTOS.find((c) => c.formula === "CH4")!.nombre, "14"],
          [f("SiH4"), OTROS_COMPUESTOS.find((c) => c.formula === "SiH4")!.nombre, "14"],
          [f("NH3"), OTROS_COMPUESTOS.find((c) => c.formula === "NH3")!.nombre, "15"],
          [f("PH3"), OTROS_COMPUESTOS.find((c) => c.formula === "PH3")!.nombre, "15"],
          [f("H2O"), OTROS_COMPUESTOS.find((c) => c.formula === "H2O")!.nombre, "16"],
        ],
        "Hidruros no metálicos: nombres comunes"
      ),
      cuadro(
        5,
        ["Fórmula", "Nombre", "N.º de oxidación del oxígeno"],
        [
          [f("Na2O2"), nom("Na2O2", "stock"), ox("O", -1)],
          [f("CaO2"), nom("CaO2", "stock"), ox("O", -1)],
          [f("BaO2"), nom("BaO2", "stock"), ox("O", -1)],
          [f("H2O2"), OTROS_COMPUESTOS.find((c) => c.formula === "H2O2")!.nombre, ox("O", -1)],
        ],
        "Peróxidos"
      ),
    ],
    quiz: [
      preg(`¿Qué número de oxidación tiene el hidrógeno en ${f("CaH2")}?`, ["+1", "−1", "0", "+2"], 1, "El calcio es un metal (menos electronegativo que el H), así que el hidrógeno es −1: es un hidruro metálico."),
      preg(`¿Cómo se llama ${f("NaH")}?`, [Nom("NaH", "stock"), Nom("Na2O2", "stock"), "Hidróxido de sodio", "Sodio de hidrógeno"], 0, "Es un hidruro metálico: hidruro de sodio."),
      preg(`¿Cómo se llama ${f("Na2O2")}?`, [Nom("Na2O", "stock"), Nom("Na2O2", "stock"), "Dióxido de sodio", "Óxido de sodio (II)"], 1, "Contiene el ion peróxido O₂²⁻: peróxido de sodio."),
      preg("¿Qué número de oxidación tiene el oxígeno en un peróxido?", ["−2", "−1", "0", "+1"], 1, "En el ion peróxido, O₂²⁻, cada oxígeno tiene −1."),
      preg(`¿Cuál es el nombre de ${f("H2O2")}?`, ["Óxido de hidrógeno", "Hidruro de oxígeno", "Peróxido de hidrógeno (agua oxigenada)", "Ácido peróxico"], 2, "Es el peróxido de hidrógeno, conocido como agua oxigenada."),
      preg(`¿Cómo se llama el ${f("NH3")} en el uso corriente?`, ["Amonio", "Amoníaco", "Nitruro de hidrógeno", "Hidróxido de nitrógeno"], 1, "Su nombre común (y aceptado) es amoníaco. No confundir con el ion amonio, NH₄⁺."),
    ],
  },
  // ---------------------------------------------------------------- 4
  {
    slug: "quimia-clase-hidroxidos",
    grupo: "nomenclatura",
    orden: 4,
    requierePro: true,
    nombre: "Hidróxidos (bases)",
    descripcion: "Qué son, cómo se forman, se escriben y se nombran los hidróxidos, y ejemplos de la vida diaria.",
    pasos: [
      `Un hidróxido, o base, tiene el ion hidróxido ${ion("OH", -1)} unido a un metal (o al ion amonio). Su fórmula general es M(OH)ₙ, donde n es la carga del metal. Al disolverse en agua liberan iones OH⁻, tienen tacto jabonoso y son corrosivos (nunca se prueban ni se tocan sin protección), viran la fenolftaleína a rosado intenso y el papel tornasol rojo a azul.`,
      `Se forman de dos maneras. Un óxido básico con agua: ${reaccion([[1, "Na2O"], [1, "H2O"]], [[2, "NaOH"]])} ${reaccion([[1, "CaO"], [1, "H2O"]], [[1, "Ca(OH)2"]])} ${reaccion([[1, "Fe2O3"], [3, "H2O"]], [[2, "Fe(OH)3"]])} O un metal muy activo con agua, que además libera hidrógeno: ${reaccion([[2, "Na"], [2, "H2O"]], [[2, "NaOH"], [1, "H2"]])}`,
      `Cómo se escribe la fórmula: se cruzan las cargas del metal con la del OH (${ion("OH", -1)}). ${ion("Na", 1)} da ${f(arma("Na+", "OH-"))}; ${ion("Ca", 2)} da ${f(arma("Ca2+", "OH-"))}; ${ion("Al", 3)} da ${f(arma("Al3+", "OH-"))}. El OH va entre paréntesis solo cuando el subíndice es mayor que 1.`,
      "Cómo se nombra: tradicional, «hidróxido de» + el metal (o «hidróxido ferroso», «hidróxido férrico» si tiene dos valencias); Stock, «hidróxido de» + el metal con su número romano; sistemático, con prefijos delante de «hidróxido» (dihidróxido de calcio).",
      `Ejemplo resuelto: ${f("Fe(OH)3")}. Hay 3 OH⁻ (carga −3), así que el hierro es +3. Tradicional: ${nom("Fe(OH)3", "tradicional")}; Stock: ${nom("Fe(OH)3", "stock")}; sistemático: ${nom("Fe(OH)3", "sistematica")}. Y ${f("Fe(OH)2")} tiene 2 OH⁻: hierro +2, ${nom("Fe(OH)2", "stock")}.`,
      `El hidróxido de amonio, ${f("NH4OH")}, es el nombre que se usa en el colegio y en las etiquetas para la solución de amoníaco en agua. En rigor, ese compuesto no existe aislado: lo que hay es amoníaco disuelto, que en parte se convierte en iones: $\\mathrm{NH_3 + H_2O \\rightleftharpoons NH_4^+ + OH^-}$.`,
      "Hidróxidos de uso cotidiano: la soda cáustica (NaOH) destapa cañerías y se usa para fabricar jabón; la cal apagada (Ca(OH)₂) se usa en la construcción; la leche de magnesia (Mg(OH)₂) es un antiácido; y el hidróxido de aluminio (Al(OH)₃) también se usa en antiácidos.",
      "Errores frecuentes: escribir CaOH₂ en lugar de Ca(OH)₂; escribir Na(OH) con un paréntesis innecesario; y confundir el ion hidróxido, OH⁻, con el agua, H₂O. Para saber la carga del metal, mira el número romano del nombre o cuenta los OH de la fórmula.",
    ],
    visuales: [
      cuadroNombres(2, ["NaOH", "KOH", "Ca(OH)2", "Mg(OH)2", "Al(OH)3", "Zn(OH)2", "Fe(OH)2", "Fe(OH)3", "Cu(OH)2"], ["tradicional", "stock", "sistematica"], "Hidróxidos en los tres sistemas"),
      { tipo: "quimia.cruce", despuesDePaso: 2, cation: "Al3+", anion: "OH-" },
      cuadro(
        6,
        ["Fórmula", "Nombre", "Nombre común"],
        [
          [f("NaOH"), nom("NaOH", "stock"), comunDe("NaOH")],
          [f("KOH"), nom("KOH", "stock"), comunDe("KOH")],
          [f("Ca(OH)2"), nom("Ca(OH)2", "stock"), comunDe("Ca(OH)2")],
          [f("Mg(OH)2"), nom("Mg(OH)2", "stock"), comunDe("Mg(OH)2")],
        ],
        "Hidróxidos de la vida diaria"
      ),
    ],
    quiz: [
      preg("¿Cuál es la fórmula del hidróxido de calcio?", [f("CaOH"), f("CaOH2"), f("Ca(OH)2"), f("Ca2OH")], 2, "El calcio es +2 y el OH es −1: se necesitan dos OH, que van entre paréntesis: Ca(OH)₂."),
      preg(`¿Cuál es el nombre Stock de ${f("Fe(OH)3")}?`, [Nom("Fe(OH)2", "stock"), Nom("Fe(OH)3", "stock"), Nom("Fe(OH)3", "tradicional"), Nom("Fe(OH)3", "sistematica")], 1, "Tres OH⁻ suman −3, así que el hierro es +3: hidróxido de hierro (III)."),
      preg(`¿Cuál es el nombre tradicional de ${f("Cu(OH)2")}?`, [Nom("Cu(OH)2", "tradicional"), Nom("CuOH", "tradicional"), Nom("Cu(OH)2", "stock"), "Hidróxido de cobre"], 0, "El Cu(OH)₂ tiene cobre +2, la valencia mayor: -ico. Es hidróxido cúprico (y el CuOH, con cobre +1, sería el cuproso)."),
      preg(`¿Qué se obtiene al mezclar el óxido de calcio (${f("CaO")}) con agua?`, [f("CaH2"), f("Ca(OH)2"), f("CaCO3"), f("Ca2O2")], 1, "Óxido básico + agua da hidróxido: CaO + H₂O → Ca(OH)₂ (cal viva + agua = cal apagada)."),
      preg("¿Cómo se comporta una base frente a la fenolftaleína?", ["Queda incolora", "Vira a rosado intenso", "Vira a amarillo", "Se vuelve verde"], 1, "Las bases viran la fenolftaleína a rosado o fucsia; en un ácido queda incolora."),
    ],
  },
  // ---------------------------------------------------------------- 5
  {
    slug: "quimia-clase-acidos",
    grupo: "nomenclatura",
    orden: 5,
    requierePro: true,
    nombre: "Ácidos: hidrácidos y oxoácidos",
    descripcion: "Cómo se forman, se escriben y se nombran los ácidos sin oxígeno y con oxígeno, y qué aniones producen.",
    pasos: [
      "Un ácido es una sustancia que, disuelta en agua, libera iones hidrógeno (H⁺). Tienen sabor agrio (no se prueban), viran el papel tornasol azul a rojo y reaccionan con muchos metales liberando hidrógeno. Hay dos tipos: los hidrácidos (hidrógeno + un no metal, sin oxígeno) y los oxoácidos u oxácidos (hidrógeno + un no metal + oxígeno).",
      `Hidrácidos. Su fórmula es HₙX, donde X es un halógeno (F, Cl, Br, I) o un elemento del grupo 16 (S, Se, Te). Se forman a partir de los elementos y se disuelven en agua: ${reaccion([[1, "H2"], [1, "Cl2"]], [[2, "HCl"]])} ${reaccion([[1, "H2"], [1, "S"]], [[1, "H2S"]])} Con el grupo 17 (carga −1) hay 1 H; con el grupo 16 (carga −2) hay 2 H.`,
      `Nombres de los hidrácidos: disueltos en agua se llaman «ácido» + la raíz del no metal + «hídrico»: ${nom("HCl", "tradicional")}. Como gas puro se usa el nombre de la sal: ${nom("HCl", "stock")}. Ojo: ${f("HCl")} es el gas y «ácido clorhídrico» es su solución en agua.`,
      `Oxoácidos. Su fórmula general es H_aX_bO_c. Se forman cuando un óxido ácido (anhídrido) reacciona con agua, así que una forma práctica de escribirlos es sumar el anhídrido y una molécula de agua y simplificar: ${reaccion([[1, "SO3"], [1, "H2O"]], [[1, "H2SO4"]])} ${reaccion([[1, "CO2"], [1, "H2O"]], [[1, "H2CO3"]])} ${reaccion([[1, "N2O5"], [1, "H2O"]], [[2, "HNO3"]])} ${reaccion([[1, "Cl2O"], [1, "H2O"]], [[2, "HClO"]])}`,
      "Nomenclatura tradicional: «ácido» + el nombre del anhídrido con la misma terminación. Los halógenos dan cuatro ácidos, de menos a más oxígeno: hipo…oso (HClO), …oso (HClO₂), …ico (HClO₃) y per…ico (HClO₄). El azufre da dos: sulfuroso (H₂SO₃) y sulfúrico (H₂SO₄). El nitrógeno también dos: nitroso (HNO₂) y nítrico (HNO₃). El carbono da el carbónico (H₂CO₃).",
      "Una regla para escribir la fórmula sin memorizar: si el número de oxidación del no metal es impar, el ácido es HXO((n+1)/2); si es par, es H₂XO((n+2)/2). Así, cloro +5 da HClO₃, azufre +6 da H₂SO₄ y azufre +4 da H₂SO₃. Esta regla da el ácido más simple; el fósforo y el boro forman otros más hidratados: el más común del fósforo (+5) es el H₃PO₄, el ácido fosfórico (u ortofosfórico), y el del boro, el H₃BO₃.",
      "También existen nombres sistemáticos y Stock de los oxoácidos (por ejemplo, «tetraoxosulfato (VI) de hidrógeno» para el H₂SO₄), pero se usan poco: el nombre tradicional es el que se emplea en la práctica y es el que la IUPAC mantiene como aceptado para los ácidos más comunes.",
      "Cuando un ácido pierde sus H⁺ queda un anión, y esos aniones forman las sales. La terminación cambia: «-hídrico» pasa a «-uro», «-ico» pasa a «-ato» y «-oso» pasa a «-ito», y los prefijos hipo- y per- se conservan. La carga del anión es negativa e igual a la cantidad de H⁺ perdidos: el ácido nítrico (1 H) da NO₃⁻; el sulfúrico (2 H), SO₄²⁻; el fosfórico (3 H), PO₄³⁻.",
      "Errores frecuentes: confundir ácido clorhídrico (HCl, sin oxígeno) con ácido clórico (HClO₃, con oxígeno); escribir el H al final de la fórmula; y olvidar que el gas HCl y su solución tienen nombres distintos. El «ácido muriático» que se vende para limpiar es una solución diluida e impura de HCl.",
    ],
    visuales: [
      cuadro(
        2,
        ["Fórmula", "Disuelto en agua", "Gas puro"],
        ["HF", "HCl", "HBr", "HI", "H2S", "H2Se", "H2Te", "HCN"].map((fo) => {
          const h = HIDRACIDOS.find((x) => x.formula === fo)!;
          return [f(fo), h.acido, h.puro];
        }),
        "Hidrácidos"
      ),
      cuadro(
        4,
        ["Fórmula", "N.º de oxidación del no metal", "Nombre", "Anhídrido"],
        ["HClO", "HClO2", "HClO3", "HClO4", "H2SO3", "H2SO4", "HNO2", "HNO3", "H2CO3", "H3PO4", "H2SiO3", "H3BO3"].map(filaOxoacido),
        "Oxoácidos"
      ),
      cuadro(
        7,
        ["Ácido", "Anión", "Carga"],
        ["HClO", "HClO3", "HClO4", "H2SO3", "H2SO4", "HNO2", "HNO3", "H2CO3", "H3PO4"].map((fo) => {
          const a = OXOACIDOS.find((x) => x.formula === fo)!;
          const an = aniónFormula(a.anion!);
          return [`${f(fo)} ${a.tradicional}`, an.nombre, `$${ionLatex(an.formula, an.carga)}$`];
        }),
        "De ácido a anión"
      ),
    ],
    quiz: [
      preg(`¿Cómo se llama el ${f("HCl")} disuelto en agua?`, ["Ácido clórico", "Ácido clorhídrico", "Ácido hipocloroso", "Cloruro de hidrógeno"], 1, "Los hidrácidos disueltos en agua se llaman «ácido …hídrico»: ácido clorhídrico. El gas puro es el cloruro de hidrógeno."),
      preg(`¿Cuál es la fórmula del ácido sulfúrico?`, [f("H2SO3"), f("H2SO4"), f("HSO4"), f("H2S")], 1, "Se forma con SO₃ + H₂O: H₂SO₄. El H₂SO₃ es el sulfuroso y el H₂S es el sulfhídrico."),
      preg(`¿Cómo se llama ${f("HNO3")}?`, [Nom("HNO2", "tradicional"), Nom("HNO3", "tradicional"), "Ácido hiponitroso", "Nitrato de hidrógeno"], 1, "El nitrógeno tiene +5 (el más alto): terminación -ico. Es el ácido nítrico."),
      preg(`¿Cuál es el nombre de ${f("HClO4")}?`, [Nom("HClO", "tradicional"), Nom("HClO3", "tradicional"), Nom("HClO4", "tradicional"), Nom("HClO2", "tradicional")], 2, "Con el cloro en +7 (el más alto) y 4 oxígenos: ácido perclórico."),
      preg("¿Qué anión resulta cuando el ácido sulfúrico pierde sus dos H⁺?", ["Sulfito", "Sulfuro", "Sulfato", "Hidrógeno sulfato"], 2, "El ácido termina en -ico, así que el anión termina en -ato: sulfato, SO₄²⁻."),
      preg(`¿Cuál es la fórmula del ácido fosfórico?`, [f("HPO4"), f("H3PO4"), f("H2PO3"), f("H3P")], 1, "El fosfórico es el ácido del fósforo +5 en su forma más común: H₃PO₄."),
    ],
  },
  // ---------------------------------------------------------------- 6
  {
    slug: "quimia-clase-sales-binarias-oxisales",
    grupo: "nomenclatura",
    orden: 6,
    requierePro: true,
    nombre: "Sales binarias y oxisales",
    descripcion: "Sales de ácidos con y sin oxígeno: cómo se forman, se escriben y se nombran, y cómo deducir la carga del metal.",
    pasos: [
      `Una sal es un compuesto iónico que resulta de reemplazar los H⁺ de un ácido por un catión metálico (o por el amonio). Se obtienen por neutralización, la reacción entre un ácido y un hidróxido, que forma la sal y agua: ${reaccion([[1, "HCl"], [1, "NaOH"]], [[1, "NaCl"], [1, "H2O"]])} ${reaccion([[1, "H2SO4"], [1, "Ca(OH)2"]], [[1, "CaSO4"], [2, "H2O"]])} ${reaccion([[2, "HNO3"], [1, "Mg(OH)2"]], [[1, "Mg(NO3)2"], [2, "H2O"]])}`,
      "Sales binarias (sin oxígeno). Vienen de los hidrácidos: metal + no metal. El no metal lleva la terminación «-uro»: cloruro, bromuro, yoduro, fluoruro, sulfuro. Se nombran «[no metal]uro de [metal]» y, si el metal tiene varias valencias, con -oso/-ico o número romano.",
      `Fórmula: se cruzan las cargas del metal con las del no metal. ${ion("Mg", 2)} con ${ion("Cl", -1)} da ${f(arma("Mg2+", "Cl-"))}; ${ion("Al", 3)} con ${ion("Cl", -1)} da ${f(arma("Al3+", "Cl-"))}; ${ion("Fe", 3)} con ${ion("S", -2)} da ${f(arma("Fe3+", "S2-"))}.`,
      "Compuestos binarios de dos no metales (moleculares) se nombran con el sistema de prefijos: el elemento más electronegativo va al final con «-uro» y se nombra primero, y el otro va después de «de». Por ejemplo, el CCl₄ es el tetracloruro de carbono, y el PCl₅ el pentacloruro de fósforo.",
      `Oxisales u oxosales (ternarias: metal + no metal + oxígeno). Vienen de los oxoácidos. El anión cambia su terminación: ácido «-ico» da «-ato» y ácido «-oso» da «-ito», con hipo- y per- conservados. Se nombran «[anión] de [metal]». Por ejemplo, ${f("H2SO4")} da sulfato, ${f("HNO2")} da nitrito, ${f("HClO")} da hipoclorito y ${f("HClO4")} da perclorato.`,
      `Fórmula: se cruzan las cargas del metal con la del anión poliatómico, y el anión va entre paréntesis si su subíndice es mayor que 1. ${ion("Al", 3)} con ${ion("SO4", -2)} da ${f(arma("Al3+", "SO4^2-"))}; ${ion("Ca", 2)} con ${ion("PO4", -3)} da ${f(arma("Ca2+", "PO4^3-"))}; ${ion("Cu", 2)} con ${ion("NO3", -1)} da ${f(arma("Cu2+", "NO3-"))}.`,
      `Cómo deducir la carga de un metal con varias valencias a partir de la fórmula. En ${f("FeSO4")} hay un sulfato (−2), así que el hierro es +2: ${nom("FeSO4", "stock")} o ${nom("FeSO4", "tradicional")}. En ${f("Fe2(SO4)3")} hay tres sulfatos (−6) repartidos entre 2 hierros: cada uno es +3: ${nom("Fe2(SO4)3", "stock")} o ${nom("Fe2(SO4)3", "tradicional")}. En ${f("Cu(NO3)2")} hay dos nitratos (−2) para un cobre: +2, ${nom("Cu(NO3)2", "stock")}.`,
      `El proceso inverso, de nombre a fórmula: para el «${nom("Fe2(SO4)3", "stock")}», el romano dice que el hierro es +3 y el sulfato es SO₄²⁻; al cruzar sale ${f(arma("Fe3+", "SO4^2-"))}. Y para «${nom("Ca3(PO4)2", "stock")}», calcio es +2 y fosfato es PO₄³⁻: ${f(arma("Ca2+", "PO4^3-"))}.`,
      "Sales que se usan a diario: la sal común (cloruro de sodio, NaCl), la piedra caliza y el mármol (carbonato de calcio, CaCO₃), la lavandina (una solución de hipoclorito de sodio, NaClO) y los fertilizantes (nitrato de amonio, NH₄NO₃; fosfato de calcio).",
      "Errores frecuentes: confundir -ato con -ito (el sulfato SO₄²⁻ tiene un oxígeno más que el sulfito SO₃²⁻); olvidar el paréntesis en Ca₃(PO₄)₂; confundir cloruro (Cl⁻, sin oxígeno) con clorato (ClO₃⁻, con oxígeno); y olvidar que el número romano del metal se deduce de la fórmula.",
    ],
    visuales: [
      cuadroNombres(2, ["NaCl", "KBr", "CaF2", "AlCl3", "FeCl2", "FeCl3", "CuCl2", "Na2S", "Fe2S3", "Mg3N2"], ["tradicional", "stock", "sistematica"], "Sales binarias en los tres sistemas"),
      cuadro(
        3,
        ["Fórmula", "Nombre"],
        ["CCl4", "PCl3", "PCl5", "CS2", "SF6"].map((fo) => [f(fo), OTROS_COMPUESTOS.find((c) => c.formula === fo)!.nombre]),
        "Compuestos binarios de dos no metales"
      ),
      cuadroNombres(4, ["Na2SO4", "Na2SO3", "KNO3", "NaNO2", "Na3PO4", "NaClO", "NaClO2", "KClO3", "KClO4", "KMnO4", "CaCO3"], ["tradicional", "stock"], "Oxisales: -ato, -ito, hipo-, per-"),
      { tipo: "quimia.cruce", despuesDePaso: 5, cation: "Al3+", anion: "SO4^2-" },
      { tipo: "quimia.cruce", despuesDePaso: 5, cation: "Ca2+", anion: "PO4^3-" },
      cuadroNombres(6, ["FeSO4", "Fe2(SO4)3", "CuSO4", "Cu(NO3)2"], ["tradicional", "stock"], "Deducir la carga del metal"),
    ],
    quiz: [
      preg("¿Cuál es la fórmula del sulfato de aluminio?", [f("AlSO4"), f("Al2SO4"), f("Al2(SO4)3"), f("Al3(SO4)2")], 2, "Al³⁺ y SO₄²⁻: el 3 va al sulfato y el 2 al aluminio; el sulfato lleva paréntesis porque su subíndice es 3: Al₂(SO₄)₃."),
      preg(`¿Cómo se llama ${f("Na2SO3")}?`, [Nom("Na2SO4", "stock"), Nom("Na2SO3", "stock"), Nom("Na2S", "stock"), "Sulfato ácido de sodio"], 1, "Viene del ácido sulfuroso (-oso), y -oso pasa a -ito: sulfito de sodio."),
      preg(`¿Cuál es el nombre Stock de ${f("Cu(NO3)2")}?`, [Nom("Cu(NO3)2", "stock"), "Nitrato de cobre (I)", "Nitrito de cobre (II)", "Nitruro de cobre (II)"], 0, "Dos nitratos (−2) para un cobre: el cobre es +2. Nitrato de cobre (II)."),
      preg(`¿Cuál es la fórmula del hipoclorito de sodio?`, [f("NaClO"), f("NaClO2"), f("NaClO3"), f("NaCl")], 0, "Hipoclorito viene del ácido hipocloroso (HClO), el de menos oxígeno: ClO⁻. Con Na⁺ da NaClO (la lavandina)."),
      preg(`¿Cómo se llama ${f("FeCl3")} en el sistema tradicional?`, [Nom("FeCl2", "tradicional"), Nom("FeCl3", "tradicional"), Nom("FeCl3", "stock"), "Clorato férrico"], 1, "Hierro +3 (la valencia mayor) lleva -ico: cloruro férrico."),
      preg(`¿Cuál es la fórmula del nitrato de plata?`, [f("AgNO3"), f("Ag2NO3"), f("AgNO2"), f("Ag(NO3)2")], 0, "Ag⁺ y NO₃⁻ tienen cargas iguales y opuestas: AgNO₃."),
    ],
  },
  // ---------------------------------------------------------------- 7
  {
    slug: "quimia-clase-sales-acidas-basicas-iones",
    grupo: "nomenclatura",
    orden: 7,
    requierePro: true,
    nombre: "Sales ácidas, sales básicas e iones comunes",
    descripcion: "Sales con hidrógeno o con hidroxilo, y las tablas de cationes y aniones más usados.",
    pasos: [
      `Sales ácidas. Si un ácido con más de un hidrógeno se neutraliza solo en parte, queda una sal que conserva algún H unido al anión: ${reaccion([[1, "H2CO3"], [1, "NaOH"]], [[1, "NaHCO3"], [1, "H2O"]])} ${reaccion([[1, "H2SO4"], [1, "NaOH"]], [[1, "NaHSO4"], [1, "H2O"]])} El anión resultante tiene una carga menos negativa: el carbonato ${ion("CO3", -2)} pasa a ${ion("HCO3", -1)}. La carga es siempre −(cantidad de H⁺ perdidos).`,
      "Nombres de las sales ácidas: en el sistema tradicional se agrega «ácido» (o «monoácido», «diácido» si hay más de un H) después del anión: «carbonato ácido de sodio». En el sistema IUPAC se antepone «hidrogeno» (o «dihidrogeno») al anión: «hidrogenocarbonato de sodio». Y hay un nombre común muy difundido: «bicarbonato de sodio». El prefijo «bi-» del uso común no significa «dos carbonatos»: es solo una costumbre histórica.",
      `Con más H: el ácido fosfórico (${f("H3PO4")}) da tres aniones: ${ion("H2PO4", -1)} (dihidrogenofosfato, «fosfato diácido»), ${ion("HPO4", -2)} (hidrogenofosfato, «fosfato monoácido») y ${ion("PO4", -3)} (fosfato).`,
      `Sales básicas. Son sales que conservan algún ion hidróxido, OH⁻, porque un hidróxido con más de un OH se neutralizó solo en parte: ${reaccion([[1, "Ca(OH)2"], [1, "HCl"]], [[1, "Ca(OH)Cl"], [1, "H2O"]])} En el sistema tradicional se llaman «cloruro básico de calcio»; en la nomenclatura IUPAC los aniones se ordenan alfabéticamente: «cloruro hidróxido de calcio». Otro ejemplo es el carbonato básico de cobre (II), $\\mathrm{Cu_2(OH)_2CO_3}$, el mineral malaquita. A este nivel se ven solo de forma introductoria.`,
      "Sales hidratadas: algunas sales cristalizan con moléculas de agua unidas. Se nombran agregando «hidratado» con un prefijo: el $\\mathrm{CuSO_4 \\cdot 5H_2O}$ es el sulfato de cobre (II) pentahidratado (el «vitriolo azul»).",
      "Iones poliatómicos comunes. Conviene aprender esta lista, porque aparecen en casi todas las sales. Una forma de ordenarla es por el ácido de origen: los que terminan en -ato vienen de un ácido -ico y los que terminan en -ito, de un ácido -oso. Y las cargas crecen con la cantidad de H del ácido: nitrato (−1, del HNO₃), sulfato (−2, del H₂SO₄) y fosfato (−3, del H₃PO₄).",
      "Cationes con más de una valencia. El hierro, el cobre, el estaño, el plomo, el oro y el cobalto forman dos cationes distintos. En el sistema tradicional el de menor carga lleva -oso y el de mayor -ico, con la raíz latina: ferroso y férrico (hierro), cuproso y cúprico (cobre), estannoso y estánnico (estaño), plumboso y plúmbico (plomo), auroso y áurico (oro), cobaltoso y cobáltico (cobalto). En Stock, el número romano es la carga.",
      `El ion amonio, ${ion("NH4", 1)}, es un catión poliatómico que se comporta como un metal alcalino: forma sales como el nitrato de amonio (${f("NH4NO3")}), el sulfato de amonio (${f("(NH4)2SO4")}) y el cloruro de amonio (${f("NH4Cl")}). En la fórmula del sulfato de amonio va entre paréntesis porque se repite dos veces.`,
      "Errores frecuentes: escribir mal la carga del hidrogenocarbonato (es −1, no −2); olvidar el paréntesis con NH₄ ((NH₄)₂SO₄, no NH₄₂SO₄); y confundir los cationes -oso con -ico (el de menor carga es -oso).",
    ],
    visuales: [
      cuadro(
        3,
        ["Fórmula", "Tradicional", "IUPAC / Stock", "Nombre común"],
        ["NaHCO3", "Ca(HCO3)2", "NaHSO4", "NaHSO3", "NaHS", "NaH2PO4", "Na2HPO4"].map((fo) => {
          const r = COMPUESTOS_IONICOS.find((c) => c.formula === fo)!;
          return [f(fo), r.tradicional, r.stock, r.comun ?? "—"];
        }),
        "Sales ácidas"
      ),
      cuadro(
        6,
        ["Anión", "Fórmula y carga", "Anión", "Fórmula y carga"],
        [
          [...filaAnion("NO3-"), ...filaAnion("NO2-")],
          [...filaAnion("SO4^2-"), ...filaAnion("SO3^2-")],
          [...filaAnion("CO3^2-"), ...filaAnion("HCO3-")],
          [...filaAnion("PO4^3-"), ...filaAnion("H2PO4-")],
          [...filaAnion("ClO-"), ...filaAnion("ClO2-")],
          [...filaAnion("ClO3-"), ...filaAnion("ClO4-")],
          [...filaAnion("MnO4-"), ...filaAnion("CrO4^2-")],
          [...filaAnion("Cr2O7^2-"), ...filaAnion("OH-")],
          [...filaAnion("CN-"), ...filaAnion("O2^2-")],
        ],
        "Iones poliatómicos comunes (aniones)"
      ),
      cuadro(
        7,
        ["Ion", "Stock", "Tradicional"],
        CATIONES.filter((c) => c.trad).map((c) => [`$${ionLatex(c.formula, c.carga)}$`, `${c.nombre} (${romano(c.carga)})`, c.trad!]),
        "Cationes con dos valencias"
      ),
    ],
    quiz: [
      preg(`¿Cuál es la fórmula del hidrogenocarbonato de sodio (bicarbonato de sodio)?`, [f("Na2CO3"), f("NaHCO3"), f("NaCO3"), f("Na(HCO3)2")], 1, "Es una sal ácida: Na⁺ con HCO₃⁻ (carga −1): NaHCO₃."),
      preg(`¿Cuál es la carga del ion hidrogenosulfato, ${f("HSO4")}?`, ["−2", "−1", "+1", "0"], 1, "El ácido sulfúrico perdió un solo H⁺: la carga es −1."),
      preg(`¿Cómo se llama el ${ion("NO2", -1)}?`, ["Nitrato", "Nitrito", "Nitruro", "Nitrógeno"], 1, "Viene del ácido nitroso (-oso): nitrito. El nitrato, NO₃⁻, viene del ácido nítrico."),
      preg("¿Cuál de estos iones es el amonio?", [ion("NH4", 1), ion("NO3", -1), ion("OH", -1), ion("NH2", -1)], 0, "El amonio es NH₄⁺, un catión poliatómico."),
      preg("¿Qué significa «sulfato cúprico» en el sistema Stock?", ["Sulfato de cobre (I)", "Sulfato de cobre (II)", "Sulfato de cobre (III)", "Sulfato de cobalto (II)"], 1, "Cúprico es la valencia mayor del cobre, +2: sulfato de cobre (II)."),
      preg(`¿Cuál es la fórmula del sulfato de amonio?`, [f("NH4SO4"), f("(NH4)2SO4"), f("NH4(SO4)2"), f("(NH3)2SO4")], 1, "Dos NH₄⁺ (carga +2) para un SO₄²⁻: (NH₄)₂SO₄, con paréntesis en el amonio."),
    ],
  },
  // ---------------------------------------------------------------- 8
  {
    slug: "quimia-clase-metodo-nombrar",
    grupo: "nomenclatura",
    orden: 8,
    requierePro: true,
    nombre: "Método para nombrar cualquier compuesto",
    descripcion: "Un diagrama de decisión, el paso a paso y práctica guiada para pasar de la fórmula al nombre y del nombre a la fórmula.",
    pasos: [
      "Para nombrar un compuesto inorgánico hay que responder unas pocas preguntas, en orden. Este es el diagrama de decisión que reúne todo lo aprendido.",
      "Método en cuatro pasos: 1) identifica la clase de compuesto con el diagrama; 2) identifica el metal (o el no metal central) y calcula su número de oxidación, sabiendo que la suma de los números de oxidación es 0; 3) nombra el anión o el grupo característico (óxido, hidróxido, -uro, -ato, -ito); 4) escribe el nombre en el sistema que pidan, con el orden y las mayúsculas correctos.",
      `Práctica 1: ${f("Fe2O3")}. Tiene dos elementos y uno es oxígeno: es un óxido; el otro es un metal, un óxido básico. Tres oxígenos suman −6; los dos hierros aportan +6, y cada uno es +3. Nombres: ${nom("Fe2O3", "stock")} (Stock), ${nom("Fe2O3", "tradicional")} (tradicional) y ${nom("Fe2O3", "sistematica")} (sistemático).`,
      `Práctica 2: ${f("H2SO3")}. Empieza con H y tiene oxígeno: es un oxoácido. El azufre: 2 × (+1) + x + 3 × (−2) = 0, entonces x = ${numeroOxidacion(oxN("H2SO3", "S"))}; con +4 (el menor de los dos) lleva -oso. Es el ${nom("H2SO3", "tradicional")}.`,
      `Práctica 3: ${f("Cu(NO3)2")}. Tiene un metal, un no metal y oxígeno, y el grupo NO₃ entre paréntesis: es una oxisal. El nitrato es NO₃⁻ y hay dos: el cobre es +2. Nombres: ${nom("Cu(NO3)2", "stock")} o ${nom("Cu(NO3)2", "tradicional")}.`,
      `Práctica 4: ${f("NaHCO3")}. Tiene un H dentro del anión: es una sal ácida. Nombres: ${nom("NaHCO3", "stock")} (IUPAC), ${nom("NaHCO3", "tradicional")} (tradicional) y bicarbonato de sodio (uso común).`,
      `Práctica 5: ${f("PCl5")}. Dos no metales, sin oxígeno ni hidrógeno: un compuesto molecular binario. Sistema de prefijos: ${nom("PCl5", "sistematica")}. Y ${f("CaH2")}: un hidruro metálico, ${nom("CaH2", "stock")}. Y ${f("HBr")}: un hidrácido, ${nom("HBr", "tradicional")} disuelto en agua (${nom("HBr", "stock")} como gas).`,
      `Del nombre a la fórmula: 1) escribe los símbolos de cada parte (el anión por el nombre y el catión por el «de…»); 2) escribe las cargas (el romano da la del metal); 3) cruza las cargas y simplifica; 4) pon paréntesis a los iones poliatómicos con subíndice mayor que 1; 5) verifica que la suma sea cero. Por ejemplo: «${nom("Al2(SO4)3", "stock")}» es ${ion("Al", 3)} con ${ion("SO4", -2)}, que da ${f(arma("Al3+", "SO4^2-"))}.`,
      `Otro ejemplo: «${nom("Fe(OH)2", "stock")}» es ${ion("Fe", 2)} con ${ion("OH", -1)}, o sea ${f(arma("Fe2+", "OH-"))}. Y «${nom("P2O5", "sistematica")}»: los prefijos son los subíndices (2 fósforos, 5 oxígenos), o sea ${f("P2O5")}.`,
      "Muchos compuestos tienen también un nombre común, y conviene conocerlo: es el que aparece en los envases y en la vida diaria. La tabla reúne los más frecuentes con su nombre químico.",
      "Lista de control antes de dar una respuesta: ¿las cargas suman cero?; ¿pusiste paréntesis solo donde el grupo se repite?; ¿el nombre va en minúscula y en el orden anión-«de»-catión?; ¿pusiste las tildes (óxido, hidróxido, sulfúrico) y no las pusiste donde no van (sulfato, nitrato)?; ¿el número romano coincide con la carga del metal?",
    ],
    visuales: [
      cuadro(
        0,
        ["Pregunta sobre la fórmula", "Si la respuesta es sí", "Ejemplo"],
        [
          ["¿Empieza con H y tiene oxígeno?", "Oxoácido (ácido …ico / …oso)", `${f("H2SO4")}: ${nom("H2SO4", "tradicional")}`],
          ["¿Empieza con H y no tiene oxígeno?", "Hidrácido (ácido …hídrico) o hidruro no metálico", `${f("HCl")}: ${nom("HCl", "tradicional")}`],
          ["¿Tiene un metal unido a OH?", "Hidróxido", `${f("Ca(OH)2")}: ${nom("Ca(OH)2", "stock")}`],
          ["¿Tiene solo dos elementos y uno es O (con O₂ si es peróxido)?", "Óxido (metal: básico; no metal: ácido) o peróxido", `${f("Al2O3")}: ${nom("Al2O3", "stock")}`],
          ["¿Tiene solo dos elementos y uno es H, y el otro es un metal?", "Hidruro metálico", `${f("CaH2")}: ${nom("CaH2", "stock")}`],
          ["¿Tiene solo un metal y un no metal, sin O ni H?", "Sal binaria (…uro)", `${f("FeCl3")}: ${nom("FeCl3", "stock")}`],
          ["¿Tiene metal, no metal y oxígeno?", "Oxisal (…ato / …ito)", `${f("Na2SO4")}: ${nom("Na2SO4", "stock")}`],
          ["¿Tiene además un H unido al anión?", "Sal ácida (hidrogeno…)", `${f("NaHCO3")}: ${nom("NaHCO3", "stock")}`],
          ["¿Tiene dos no metales, sin O ni H?", "Compuesto molecular (prefijos)", `${f("PCl5")}: ${nom("PCl5", "sistematica")}`],
        ],
        "Diagrama de decisión para nombrar un compuesto"
      ),
      { tipo: "quimia.cruce", despuesDePaso: 7, cation: "Al3+", anion: "SO4^2-" },
      { tipo: "quimia.cruce", despuesDePaso: 8, cation: "Fe2+", anion: "OH-" },
      cuadro(
        9,
        ["Fórmula", "Nombre químico", "Nombre común"],
        [
          [f("H2O"), "agua", "agua"],
          [f("NaCl"), nom("NaCl", "stock"), comunDe("NaCl")],
          [f("NaClO"), nom("NaClO", "stock"), comunDe("NaClO")],
          [f("NaOH"), nom("NaOH", "stock"), comunDe("NaOH")],
          [f("CaO"), nom("CaO", "stock"), comunDe("CaO")],
          [f("Ca(OH)2"), nom("Ca(OH)2", "stock"), comunDe("Ca(OH)2")],
          [f("NaHCO3"), nom("NaHCO3", "stock"), comunDe("NaHCO3")],
          [f("CaCO3"), nom("CaCO3", "stock"), comunDe("CaCO3")],
          [f("H2O2"), "peróxido de hidrógeno", "agua oxigenada"],
          [f("NH3"), "amoníaco", "amoníaco"],
          [f("HCl"), nom("HCl", "tradicional"), "en solución impura y diluida, «ácido muriático»"],
          [f("Mg(OH)2"), nom("Mg(OH)2", "stock"), comunDe("Mg(OH)2")],
        ],
        "Nombres comunes de compuestos cotidianos"
      ),
    ],
    quiz: [
      preg(`¿A qué clase de compuesto corresponde ${f("Na2SO4")}?`, ["Oxoácido", "Sal binaria", "Oxisal", "Hidróxido"], 2, "Tiene un metal (Na), un no metal (S) y oxígeno: es una oxisal. Su nombre es sulfato de sodio."),
      preg(`¿Cuál es el nombre de ${f("Cu(NO3)2")} en el sistema Stock?`, [Nom("Cu(NO3)2", "stock"), "Nitrato de cobre (I)", "Nitruro de cobre (II)", Nom("Cu(NO3)2", "tradicional")], 0, "Hay dos nitratos (−2) para un cobre, así que el cobre es +2: nitrato de cobre (II)."),
      preg(`¿Cuál es el nombre de ${f("PCl5")}?`, [Nom("PCl3", "sistematica"), Nom("PCl5", "sistematica"), "Cloruro de fósforo (V)", "Pentacloruro de difósforo"], 1, "Son dos no metales: se usan prefijos, uno por átomo de cloro: pentacloruro de fósforo (sin prefijo en el fósforo, que es uno solo)."),
      preg(`¿Cuál es la fórmula del ${nom("Fe(OH)2", "stock")}?`, [f("Fe(OH)3"), f("Fe(OH)2"), f("FeOH2"), f("Fe2OH")], 1, "El romano (II) dice que el hierro es +2; con OH⁻ (−1) se necesitan 2: Fe(OH)₂."),
      preg(`Según la lista de nombres comunes, ¿qué compuesto es la soda cáustica?`, [f("NaCl"), f("NaOH"), f("CaO"), f("NaHCO3")], 1, "La soda cáustica es el hidróxido de sodio, NaOH."),
      preg(`¿Cómo se llama ${f("H2SO3")} en el sistema tradicional?`, [Nom("H2SO4", "tradicional"), Nom("H2SO3", "tradicional"), "Ácido sulfhídrico", "Ácido hiposulfuroso"], 1, "El azufre tiene +4 (el menor de sus dos estados): -oso. Es el ácido sulfuroso."),
    ],
  },
];
