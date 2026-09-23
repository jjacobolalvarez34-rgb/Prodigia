import type { TecnicaQuimia } from "./tipos";
import { preg, cuadro, f, ion, atomosTexto } from "./ayudas";
import { armarFormula, buscarAnion, buscarCation } from "@/lib/quimia/nomenclatura";

// Técnicas del grupo "formulas": valencias por grupo, cruce de cargas y
// conteo de átomos. Todas nuevas. Las fórmulas correctas de cada quiz salen
// de armarFormula (cruce de cargas calculado), nunca escritas a mano.

const arma = (c: string, a: string) => armarFormula(buscarCation(c), buscarAnion(a)).formula;

export const TECNICAS_QUIMIA_FORMULAS: TecnicaQuimia[] = [
  {
    slug: "quimia-tecnica-valencia-por-grupo",
    grupo: "formulas",
    orden: 1,
    requierePro: false,
    nombre: "La carga sale del grupo",
    descripcion: "Deducir la carga típica de un elemento con solo mirar su grupo en la tabla.",
    pasos: [
      "El número del grupo te dice la carga típica de un elemento en sus compuestos, sin memorizar cada uno.",
      `Metales de los grupos 1, 2 y 13: pierden electrones y quedan con carga positiva igual al número de grupo (el 13 cuenta como 3). Grupo 1: +1, como ${ion("Na", 1)}. Grupo 2: +2, como ${ion("Mg", 2)}. Grupo 13: +3, como ${ion("Al", 3)}.`,
      `No metales de los grupos 15, 16 y 17: ganan electrones y quedan con carga negativa igual al número de grupo menos 18. Grupo 15: −3, como ${ion("N", -3)}. Grupo 16: −2, como ${ion("O", -2)}. Grupo 17: −1, como ${ion("Cl", -1)}.`,
      "El grupo 18 (gases nobles) no forma iones. El grupo 14 (C, Si) suele ser +4 o −4. Y los metales de transición (grupos 3 a 12) tienen varias cargas posibles: el hierro, por ejemplo, puede ser +2 o +3. Con ellos no alcanza con mirar el grupo.",
    ],
    visuales: [
      {
        tipo: "quimia.tabla",
        despuesDePaso: 1,
        pasos: [
          { seleccion: { por: "grupo", n: 1 }, etiqueta: "Grupo 1 (Li, Na, K...): carga +1." },
          { seleccion: { por: "grupo", n: 2 }, etiqueta: "Grupo 2 (Be, Mg, Ca...): carga +2." },
          { seleccion: { por: "grupo", n: 13 }, etiqueta: "Grupo 13 (B, Al, Ga...): carga +3." },
        ],
      },
      {
        tipo: "quimia.tabla",
        despuesDePaso: 2,
        pasos: [
          { seleccion: { por: "grupo", n: 15 }, etiqueta: "Grupo 15 (N, P, As...): carga −3." },
          { seleccion: { por: "grupo", n: 16 }, etiqueta: "Grupo 16 (O, S, Se...): carga −2." },
          { seleccion: { por: "grupo", n: 17 }, etiqueta: "Grupo 17 (F, Cl, Br...): carga −1." },
        ],
      },
    ],
    quiz: [
      preg("¿Qué carga típica tiene el aluminio (Al), del grupo 13?", [ion("Al", 1), ion("Al", 2), ion("Al", 3), ion("Al", -3)], 2, "El grupo 13 cuenta como 3: el aluminio pierde 3 electrones y forma Al³⁺."),
      preg("¿Qué carga típica tiene el oxígeno (O), del grupo 16?", [ion("O", 2), ion("O", -2), ion("O", -1), ion("O", -6)], 1, "Grupo 16: 16 − 18 = −2. El oxígeno gana 2 electrones y forma O²⁻."),
      preg("¿Qué carga típica tiene el cloro (Cl), del grupo 17?", [ion("Cl", 1), ion("Cl", -1), ion("Cl", -2), ion("Cl", 7)], 1, "Grupo 17: 17 − 18 = −1. El cloro gana 1 electrón y forma Cl⁻."),
      preg("¿Qué carga típica tiene el magnesio (Mg), del grupo 2?", [ion("Mg", 2), ion("Mg", -2), ion("Mg", 1), ion("Mg", 3)], 0, "Grupo 2: pierde 2 electrones y forma Mg²⁺."),
      preg(
        "¿Sirve esta regla para el hierro (Fe, grupo 8)?",
        ["Sí: siempre es +8", "No: los metales de transición tienen varias cargas (Fe²⁺ y Fe³⁺)", "Sí: siempre es −8", "Sí: siempre es +1"],
        1,
        "La regla es para los grupos principales. El hierro es de transición y puede ser +2 o +3, por eso en su nombre se indica cuál (hierro (II), hierro (III))."
      ),
    ],
  },
  {
    slug: "quimia-tecnica-cruzar-cargas",
    grupo: "formulas",
    orden: 2,
    requierePro: false,
    nombre: "Cruzar las cargas",
    descripcion: "Armar la fórmula de un compuesto iónico cruzando las cargas del catión y del anión.",
    pasos: [
      "Para armar la fórmula de un compuesto iónico, escribe el catión (el metal, con carga positiva) y el anión (el no metal, con carga negativa) con sus cargas.",
      `Cruza los números: la carga de cada ion, sin el signo, pasa a ser el subíndice del otro. Con ${ion("Al", 3)} y ${ion("O", -2)} queda ${f(arma("Al3+", "O2-"))}: el 3 del aluminio baja al oxígeno y el 2 del oxígeno baja al aluminio.`,
      `Si los dos subíndices se pueden dividir por un mismo número, simplifica. ${ion("Ca", 2)} y ${ion("O", -2)} dan primero ${f("Ca2O2")}, que se simplifica a ${f(arma("Ca2+", "O2-"))}.`,
      `Si el ion tiene varios átomos (como ${ion("OH", -1)} o ${ion("SO4", -2)}) y su subíndice es mayor que 1, va entre paréntesis: ${f(arma("Ca2+", "OH-"))}. Y comprueba siempre que las cargas sumen cero.`,
    ],
    visuales: [
      { tipo: "quimia.cruce", despuesDePaso: 1, cation: "Al3+", anion: "O2-" },
      { tipo: "quimia.cruce", despuesDePaso: 2, cation: "Ca2+", anion: "O2-" },
      { tipo: "quimia.cruce", despuesDePaso: 3, cation: "Ca2+", anion: "OH-" },
    ],
    quiz: [
      preg(
        "¿Cuál es la fórmula del compuesto de aluminio (Al³⁺) y oxígeno (O²⁻)?",
        [f("Al3O2"), f(arma("Al3+", "O2-")), f("AlO"), f("Al3O")],
        1,
        "Al cruzar, el 3 del aluminio pasa al oxígeno y el 2 del oxígeno pasa al aluminio: Al₂O₃. Comprobación: 2 × (+3) + 3 × (−2) = 0."
      ),
      preg(
        "¿Cuál es la fórmula del óxido de calcio (Ca²⁺ y O²⁻)?",
        [f("Ca2O2"), f(arma("Ca2+", "O2-")), f("Ca2O"), f("CaO2")],
        1,
        "Al cruzar sale Ca₂O₂, pero los dos subíndices se pueden dividir por 2: queda CaO."
      ),
      preg(
        "¿Cuál es la fórmula del compuesto de sodio (Na⁺) y sulfato (SO₄²⁻)?",
        [f("NaSO4"), f(arma("Na+", "SO4^2-")), f("Na(SO4)2"), f("Na2S4O")],
        1,
        "El 2 de la carga del sulfato pasa al sodio: Na₂SO₄. El sulfato lleva subíndice 1 (1 no se escribe), por eso no necesita paréntesis."
      ),
      preg(
        "¿Cuál es la fórmula del hidróxido de calcio (Ca²⁺ y OH⁻)?",
        [f("CaOH2"), f("CaOH"), f(arma("Ca2+", "OH-")), f("Ca2OH")],
        2,
        "El OH necesita subíndice 2 y, como es un grupo de átomos, va entre paréntesis: Ca(OH)₂."
      ),
    ],
  },
  {
    slug: "quimia-tecnica-contar-atomos",
    grupo: "formulas",
    orden: 3,
    requierePro: false,
    nombre: "Subíndice y coeficiente: cuenta los átomos",
    descripcion: "Distinguir el subíndice del coeficiente y contar cuántos átomos hay en una fórmula.",
    pasos: [
      `En una fórmula hay dos tipos de números. El subíndice (pequeño y bajo) multiplica solo al símbolo, o al paréntesis, que tiene delante: en ${f("H2O")} hay ${atomosTexto("H2O")}.`,
      `El coeficiente (grande y al principio) multiplica toda la fórmula: $3\\,\\mathrm{H_2O}$ son 3 moléculas de agua, o sea ${atomosTexto("H2O", 3)}.`,
      `Un paréntesis con subíndice multiplica todo lo que encierra: ${f("Ca(OH)2")} tiene ${atomosTexto("Ca(OH)2")}. ${f("Al2(SO4)3")} tiene ${atomosTexto("Al2(SO4)3")} (3 × 4 = 12 oxígenos).`,
      `Regla de oro: el subíndice define QUÉ sustancia es (${f("H2O")} es agua y ${f("H2O2")} es agua oxigenada); el coeficiente solo dice CUÁNTA hay. Por eso, para cambiar una cantidad se cambia el coeficiente, nunca el subíndice.`,
    ],
    visuales: [
      cuadro(
        2,
        ["Expresión", "Coeficiente", "Átomos"],
        [
          [f("H2O"), "1", atomosTexto("H2O")],
          ["$3\\,\\mathrm{H_2O}$", "3", atomosTexto("H2O", 3)],
          [f("Ca(OH)2"), "1", atomosTexto("Ca(OH)2")],
          [f("Al2(SO4)3"), "1", atomosTexto("Al2(SO4)3")],
          ["$2\\,\\mathrm{Al_2(SO_4)_3}$", "2", atomosTexto("Al2(SO4)3", 2)],
        ]
      ),
    ],
    quiz: [
      preg(`¿Cuántos átomos de oxígeno hay en ${f("Ca(OH)2")}?`, ["1", "2", "3", "4"], 1, "El subíndice 2 del paréntesis multiplica al O y al H: hay 1 Ca, 2 O y 2 H."),
      preg("¿Cuántos átomos de hidrógeno hay en $3\\,\\mathrm{H_2O}$?", ["3", "5", "6", "9"], 2, "3 moléculas × 2 átomos de H cada una = 6 átomos de hidrógeno."),
      preg(`¿Cuántos átomos de oxígeno hay en ${f("Al2(SO4)3")}?`, ["4", "7", "12", "3"], 2, "El paréntesis (SO₄)₃ tiene 4 O cada uno y se repite 3 veces: 3 × 4 = 12."),
      preg(
        "Para tener más moléculas de agua sin cambiar la sustancia, ¿qué número se modifica?",
        ["El subíndice", "El coeficiente", "Cualquiera de los dos", "Ninguno"],
        1,
        "El coeficiente dice cuántas moléculas hay. Cambiar un subíndice cambiaría la sustancia (H₂O pasaría a H₂O₂, agua oxigenada)."
      ),
    ],
  },
];
