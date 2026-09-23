import type { TecnicaQuimia } from "./tipos";
import { preg, cuadro, f, ion, nom } from "./ayudas";
import { armarFormula, buscarAnion, buscarCation, oxidacionCentral } from "@/lib/quimia/nomenclatura";

// Técnicas del grupo "nomenclatura". patrones-en-formulas ya existía (0056 +
// quiz de 0175, entonces en el grupo "formulas") y se reescribe en español
// neutro, con dos precisiones: los oxoácidos terminan en -ico O en -oso, y
// «ácido clorhídrico» es el nombre de la SOLUCIÓN en agua (el gas HCl puro
// es el cloruro de hidrógeno). El resto son nuevas. Todos los nombres salen
// de las tablas de referencia de src/lib/quimia/nomenclatura.ts.

const arma = (c: string, a: string) => armarFormula(buscarCation(c), buscarAnion(a)).formula;

export const TECNICAS_QUIMIA_NOMENCLATURA: TecnicaQuimia[] = [
  {
    slug: "patrones-en-formulas",
    existente: true,
    grupo: "nomenclatura",
    orden: 1,
    requierePro: false,
    nombre: "Patrones en cómo se nombran los compuestos",
    descripcion: "Reconocer patrones comunes en los nombres de compuestos en vez de memorizar cada uno suelto.",
    pasos: [
      `Muchos ácidos que contienen oxígeno terminan en «-ico» o en «-oso»: sulfúrico (${f("H2SO4")}), sulfuroso (${f("H2SO3")}). Los que no tienen oxígeno se nombran «ácido … hídrico»: clorhídrico (${f("HCl")}).`,
      `Un compuesto de dos elementos suele nombrarse «[segundo elemento]-uro de [primer elemento]»: ${nom("NaCl", "stock")} (${f("NaCl")}). Con el oxígeno el nombre es «óxido de»: ${nom("CaO", "stock")} (${f("CaO")}).`,
      "Reconocer el patrón te ahorra memorizar cada fórmula suelta: puedes deducir varias a partir de una sola regla.",
    ],
    visuales: [
      cuadro(
        2,
        ["Fórmula", "Nombre", "Pista"],
        [
          [f("NaCl"), nom("NaCl", "stock"), "dos elementos: -uro"],
          [f("CaO"), nom("CaO", "stock"), "con oxígeno: óxido"],
          [f("HCl"), nom("HCl", "tradicional"), "ácido sin oxígeno: hídrico"],
          [f("H2SO4"), nom("H2SO4", "tradicional"), "ácido con oxígeno: -ico"],
        ]
      ),
    ],
    quiz: [
      preg(
        "Según esta técnica, ¿cómo suelen terminar los ácidos que contienen oxígeno?",
        ["En «-ico» o «-oso» (como el sulfúrico, H₂SO₄)", "En «-uro» (como el cloruro de sodio)", "Siempre con la palabra «óxido»", "Nunca llevan la palabra «ácido»"],
        0,
        "Los oxoácidos terminan en -ico (sulfúrico, H₂SO₄) o en -oso (sulfuroso, H₂SO₃), según cuánto oxígeno tengan."
      ),
      preg(
        "¿Cómo se nombra un compuesto de dos elementos, según el patrón «[segundo elemento]-uro de [primer elemento]»?",
        ["Cloruro de sodio (NaCl)", "Sodio de cloruro (ClNa)", "Cloro-sodio (NaCl)", "Sal de mesa (NaCl)"],
        0,
        "Cloruro DE sodio sigue el patrón: primero se nombra el elemento más electronegativo (con -uro) y después «de» y el otro elemento."
      ),
      preg(
        "Un ácido que NO contiene oxígeno, como el HCl disuelto en agua, ¿cómo se nombra según esta técnica?",
        ["Ácido clorhídrico (terminación «-hídrico»)", "Ácido clórico (terminación «-ico»)", "Óxido de cloro", "Clorito de hidrógeno"],
        0,
        "Los ácidos sin oxígeno se nombran «ácido … hídrico»: clorhídrico. (El HCl gaseoso puro se llama cloruro de hidrógeno.)"
      ),
    ],
  },
  {
    slug: "quimia-tecnica-uro-ato-ito",
    grupo: "nomenclatura",
    orden: 2,
    requierePro: false,
    nombre: "hídrico-uro, ico-ato, oso-ito",
    descripcion: "Pasar del nombre de un ácido al de su sal con tres reglas de cambio de terminación.",
    pasos: [
      "Cuando un ácido pierde su hidrógeno para formar una sal, su nombre cambia de terminación siguiendo tres reglas fijas: «hídrico» se vuelve «-uro», «-ico» se vuelve «-ato» y «-oso» se vuelve «-ito».",
      `Un truco para no confundirte: repite en voz alta «ico-ato, oso-ito». Ejemplos: ${nom("HCl", "tradicional")} da cloruro; ${nom("H2SO4", "tradicional")} da sulfato; ${nom("H2SO3", "tradicional")} da sulfito.`,
      `Lo mismo con el nitrógeno: ${nom("HNO3", "tradicional")} da nitrato y ${nom("HNO2", "tradicional")} da nitrito. Y con el carbono: ${nom("H2CO3", "tradicional")} da carbonato.`,
      "Con los prefijos pasa igual: se conservan. El ácido hipocloroso da hipoclorito, y el ácido perclórico da perclorato.",
    ],
    visuales: [
      cuadro(
        2,
        ["Ácido", "Termina en", "Sal → nombre", "Ejemplo"],
        [
          [`${f("HCl")} ${nom("HCl", "tradicional")}`, "-hídrico", "-uro", `${f("NaCl")} ${nom("NaCl", "stock")}`],
          [`${f("H2SO4")} ${nom("H2SO4", "tradicional")}`, "-ico", "-ato", `${f("Na2SO4")} ${nom("Na2SO4", "stock")}`],
          [`${f("H2SO3")} ${nom("H2SO3", "tradicional")}`, "-oso", "-ito", `${f("Na2SO3")} ${nom("Na2SO3", "stock")}`],
          [`${f("HNO3")} ${nom("HNO3", "tradicional")}`, "-ico", "-ato", `${f("KNO3")} ${nom("KNO3", "stock")}`],
          [`${f("HNO2")} ${nom("HNO2", "tradicional")}`, "-oso", "-ito", `${f("NaNO2")} ${nom("NaNO2", "stock")}`],
          [`${f("H2CO3")} ${nom("H2CO3", "tradicional")}`, "-ico", "-ato", `${f("CaCO3")} ${nom("CaCO3", "stock")}`],
        ]
      ),
    ],
    quiz: [
      preg(`Si el ácido es el nítrico (${f("HNO3")}), ¿cómo se llama su sal de sodio (${f("NaNO3")})?`, ["Nitrito de sodio", "Nitrato de sodio", "Nitruro de sodio", "Nítrico de sodio"], 1, "-ico pasa a -ato: ácido nítrico → nitrato."),
      preg(`El ácido sulfuroso (${f("H2SO3")}) termina en «-oso». ¿Cómo se llama la sal ${f("Na2SO3")}?`, ["Sulfato de sodio", "Sulfuro de sodio", "Sulfito de sodio", "Sulfoso de sodio"], 2, "-oso pasa a -ito: ácido sulfuroso → sulfito de sodio."),
      preg(`El ácido clorhídrico (${f("HCl")}) da sales con la terminación...`, ["-ato", "-ito", "-uro", "-ico"], 2, "El ácido sin oxígeno «-hídrico» da la terminación «-uro»: cloruro."),
      preg(`¿Cuál es el nombre de ${f("Na2SO4")}?`, ["Sulfito de sodio", "Sulfuro de sodio", "Sulfato de sodio", "Sulfuro ácido de sodio"], 2, "Viene del ácido sulfúrico (-ico), y -ico pasa a -ato: sulfato de sodio."),
    ],
  },
  {
    slug: "quimia-tecnica-prefijos-numericos",
    grupo: "nomenclatura",
    orden: 3,
    requierePro: false,
    nombre: "Los prefijos cuentan los átomos",
    descripcion: "Nombrar y escribir compuestos con los prefijos mono-, di-, tri-... que indican los subíndices.",
    pasos: [
      "En la nomenclatura sistemática, un prefijo dice cuántos átomos hay de cada elemento, o sea, repite el subíndice: mono- (1), di- (2), tri- (3), tetra- (4), penta- (5), hexa- (6), hepta- (7).",
      `Lee los subíndices y pon los prefijos: ${f("N2O5")} tiene 2 N y 5 O, así que es ${nom("N2O5", "sistematica")}. ${f("Cl2O7")} es ${nom("Cl2O7", "sistematica")}.`,
      `El prefijo «mono» se omite en el primer elemento: ${f("CO2")} es ${nom("CO2", "sistematica")} (no «monocarbono»), pero se conserva en el segundo cuando hace falta: ${f("CO")} es ${nom("CO", "sistematica")}.`,
      "Para escribir la fórmula haz el camino inverso: cada prefijo es un subíndice. «Trióxido de azufre» es un azufre (sin prefijo) y tres oxígenos.",
    ],
    visuales: [
      cuadro(
        1,
        ["Prefijo", "Número", "Ejemplo"],
        [
          ["mono-", "1", `${f("CO")} ${nom("CO", "sistematica")}`],
          ["di-", "2", `${f("CO2")} ${nom("CO2", "sistematica")}`],
          ["tri-", "3", `${f("SO3")} ${nom("SO3", "sistematica")}`],
          ["tetra-", "4", `${f("CCl4")} ${nom("CCl4", "sistematica")}`],
          ["penta-", "5", `${f("N2O5")} ${nom("N2O5", "sistematica")}`],
          ["hexa-", "6", `${f("SF6")} ${nom("SF6", "sistematica")}`],
          ["hepta-", "7", `${f("Cl2O7")} ${nom("Cl2O7", "sistematica")}`],
        ]
      ),
    ],
    quiz: [
      preg(`¿Cuál es el nombre sistemático de ${f("SO3")}?`, ["Óxido de azufre", "Dióxido de azufre", nom("SO3", "sistematica").replace(/^./, (c) => c.toUpperCase()), "Trióxido de azufre (VI)"], 2, "Tres oxígenos: trióxido. El azufre es uno solo, por eso no lleva prefijo."),
      preg(`¿Cuál es la fórmula del ${nom("Cl2O7", "sistematica")}?`, [f("ClO7"), f("Cl7O2"), f("Cl2O7"), f("Cl2O")], 2, "«di» = 2 cloros y «hepta» = 7 oxígenos: Cl₂O₇."),
      preg(`¿Cómo se llama ${f("CO")}?`, ["Dióxido de carbono", "Monóxido de carbono", "Carbono monóxido", "Óxido de carbonito"], 1, "Un carbono y un oxígeno: monóxido de carbono. El CO₂ es el dióxido."),
      preg(`¿Cuál es el nombre de ${f("CCl4")}?`, ["Cloruro de carbono", "Tetracloruro de carbono", "Carbono tetracloro", "Tetracarburo de cloro"], 1, "Cuatro cloros: tetracloruro de carbono. El elemento con -uro (cloro) se nombra primero."),
    ],
  },
  {
    slug: "quimia-tecnica-oxacidos-por-oxigenos",
    grupo: "nomenclatura",
    orden: 4,
    requierePro: false,
    nombre: "Los oxácidos del cloro se ordenan por sus oxígenos",
    descripcion: "Nombrar los oxoácidos de los halógenos contando oxígenos: hipo-oso, oso, ico, per-ico.",
    pasos: [
      `Los oxoácidos del cloro (y del bromo y el yodo) forman una escalera según cuántos oxígenos tienen: 1 oxígeno, ${nom("HClO", "tradicional")} (${f("HClO")}); 2, ${nom("HClO2", "tradicional")} (${f("HClO2")}); 3, ${nom("HClO3", "tradicional")} (${f("HClO3")}); 4, ${nom("HClO4", "tradicional")} (${f("HClO4")}).`,
      "El orden de los nombres es siempre el mismo: hipo…oso (el que menos oxígeno tiene), …oso, …ico y per…ico (el que más tiene). El «ico» sin prefijo es el tercero.",
      `La escalera sigue el número de oxidación del cloro, que sube de a 2: +1, +3, +5 y +7. Para calcularlo: 2 × (oxígenos) − (hidrógenos). En ${f("HClO3")}: 2 × 3 − 1 = +5.`,
      `Con un solo par pasa igual: más oxígeno, más alto el número de oxidación. El azufre tiene ${nom("H2SO3", "tradicional")} (${f("H2SO3")}, +4) y ${nom("H2SO4", "tradicional")} (${f("H2SO4")}, +6): el de más oxígeno termina en «-ico».`,
    ],
    visuales: [
      cuadro(
        2,
        ["Ácido", "Oxígenos", "N.º de oxidación del Cl", "Nombre"],
        ["HClO", "HClO2", "HClO3", "HClO4"].map((fo) => [f(fo), String(fo.match(/O(\d?)/)![1] || 1), `+${oxidacionCentral(fo)}`, nom(fo, "tradicional")])
      ),
    ],
    quiz: [
      preg(`¿Cómo se llama ${f("HClO4")}, el oxoácido del cloro con más oxígenos?`, ["Ácido hipocloroso", "Ácido clórico", "Ácido perclórico", "Ácido cloroso"], 2, "Con 4 oxígenos y número de oxidación +7 es el ácido perclórico."),
      preg(`¿Cuál es el nombre de ${f("HClO2")}?`, ["Ácido hipocloroso", "Ácido cloroso", "Ácido clórico", "Ácido clorhídrico"], 1, "Dos oxígenos, número de oxidación +3: ácido cloroso."),
      preg(`Entre ${f("H2SO3")} y ${f("H2SO4")}, ¿cuál termina en «-ico»?`, [f("H2SO3"), f("H2SO4"), "Los dos", "Ninguno"], 1, "El que tiene más oxígeno termina en -ico: H₂SO₄ es el ácido sulfúrico; H₂SO₃ es el sulfuroso."),
      preg(`¿Cuántos oxígenos tiene el ácido hipocloroso (${f("HClO")})?`, ["1", "2", "3", "4"], 0, "Hipocloroso es el que menos oxígeno tiene: 1, con número de oxidación +1."),
    ],
  },
  {
    slug: "quimia-tecnica-stock-romano",
    grupo: "nomenclatura",
    orden: 5,
    requierePro: false,
    nombre: "El número romano es la carga del metal",
    descripcion: "Usar el número romano del nombre Stock para escribir la fórmula (y viceversa).",
    pasos: [
      `En la nomenclatura Stock, el número romano entre paréntesis es la carga del metal. En «${nom("Fe2O3", "stock")}», el (III) significa que el hierro es ${ion("Fe", 3)}.`,
      `Con esa carga y la del oxígeno (${ion("O", -2)}) cruzas los números y obtienes la fórmula: ${f(arma("Fe3+", "O2-"))}.`,
      `Si el romano cambia, cambia la fórmula: «${nom("FeO", "stock")}» es ${ion("Fe", 2)} con ${ion("O", -2)}, y se simplifica a ${f(arma("Fe2+", "O2-"))}.`,
      `Para pasar a la nomenclatura tradicional: la carga menor lleva «-oso» y la mayor «-ico». Hierro (II) es ferroso (${nom("FeO", "tradicional")}) y hierro (III) es férrico (${nom("Fe2O3", "tradicional")}).`,
    ],
    visuales: [
      { tipo: "quimia.cruce", despuesDePaso: 1, cation: "Fe3+", anion: "O2-" },
      { tipo: "quimia.cruce", despuesDePaso: 2, cation: "Fe2+", anion: "O2-" },
    ],
    quiz: [
      preg(`¿Cuál es la fórmula del ${nom("CuO", "stock")}?`, [f("Cu2O"), f("CuO"), f("Cu2O3"), f("CuO2")], 1, "Cobre (II) es Cu²⁺; con O²⁻ los subíndices quedan iguales y se simplifican: CuO."),
      preg(`En «${nom("Fe2O3", "stock")}», ¿qué carga tiene el hierro?`, [ion("Fe", 2), ion("Fe", 3), ion("Fe", 6), ion("Fe", -3)], 1, "El número romano (III) es la carga del hierro: Fe³⁺."),
      preg("El óxido cuproso, ¿con qué nombre Stock equivale?", ["Óxido de cobre (I)", "Óxido de cobre (II)", "Óxido de cobre (III)", "Óxido de cobre"], 0, "Cobre tiene dos cargas: Cu⁺ (la menor) es cuproso y Cu²⁺ (la mayor) es cúprico. Cuproso = cobre (I)."),
      preg(`En ${f("FeCl2")}, ¿qué número romano lleva el hierro en su nombre Stock?`, ["I", "II", "III", "IV"], 1, "Hay dos Cl⁻ (carga total −2), así que el hierro es Fe²⁺: cloruro de hierro (II)."),
    ],
  },
];
