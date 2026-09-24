import type { ClaseQuimia } from "./tipos";
import { cuadro, f, ion, ox, preg, en } from "./ayudas";
import { ecu, ecuacionIonicaLatex, fraccion, oxNum, oxTexto, semiLatex } from "./ayudasTanda2";
import {
  ELECTROLISIS,
  PILAS,
  POTENCIALES,
  armarPila,
  atomosDeLado,
  buscarEjemploRedox,
  desplaza,
  electronesDelEjemplo,
  estadosComunesPorGrupo,
  resolverCaso,
  serieDeActividad,
  t,
  textoFilaEstadoComun,
  voltios,
  type SemirreaccionBalanceada,
} from "@/lib/quimia/redox";

// Clases del grupo "redox" (Pro): el número de oxidación como herramienta,
// oxidación/reducción/agentes, balanceo por cambio del número de oxidación,
// método ion-electrón en medio ácido y en medio básico, serie de actividad y
// potenciales, y pilas y electrólisis. Todos los números de oxidación salen de
// numerosDeOxidacion (redox.ts), las semirreacciones del algoritmo
// balancearSemirreaccion y las ecuaciones pasan por ecu(), que lanza si no
// están balanceadas en átomos y en carga. Los potenciales son los estándar de
// reducción (25 °C, 1 mol/L, 1 atm) de la tabla POTENCIALES, sin ecuación de
// Nernst: es una simplificación de nivel colegio.

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const ej = (id: string) => buscarEjemploRedox(id)!;
const ionSemi = (simbolo: string, carga: number): SemirreaccionBalanceada => ({ reactivos: [t(1, simbolo, carga)], productos: [t(1, simbolo)], electrones: carga, tipo: "reduccion" });

// ---- Tablas de "estados de oxidación más comunes" (de la práctica) ----
const ESTADOS = estadosComunesPorGrupo();
const filaEstado = (fila: { titulo: string; items: { simbolos: string[]; valor: number }[] }) => [fila.titulo, textoFilaEstadoComun(fila)];
export const FILAS_ESTADOS_PRINCIPALES = ESTADOS.principales.map(filaEstado);
export const FILAS_ESTADOS_TRANSICION = ESTADOS.transicion.map(filaEstado);
export const FILAS_ESTADOS_INTERNA = ESTADOS.interna.map(filaEstado);

// ---- Cuentas verificadas de los ejemplos ----
const zncu = armarPila("Zn", "Cu");
const znag = armarPila("Zn", "Ag");
const cuag = armarPila("Cu", "Ag");
const casoMnFe = resolverCaso("mno4-fe2");
const casoCrFe = resolverCaso("cr2o7-fe2");
const casoCuNo3 = resolverCaso("cu-no3");
const casoMnCl = resolverCaso("mno4-cl");
const casoMnH2o2 = resolverCaso("mno4-h2o2");
const casoMnI = resolverCaso("mno4-i");
const casoCrClo = resolverCaso("cr-oh3-clo");
const electrolisisAgua = ELECTROLISIS.find((x) => x.id === "agua")!;
const electrolisisSal = ELECTROLISIS.find((x) => x.id === "nacl-fundido")!;

const feo2 = ej("fe-o2");
const cuHno3 = ej("cu-hno3");
const kmnoHcl = ej("kmno4-hcl");
const ch4 = ej("ch4-o2");
const mgo2 = ej("mg-o2");

// Reacciones de un cuadro de potenciales: cada una ya está armada como pila.
const ESPONTANEAS = [armarPila("Zn", "Cu"), armarPila("Fe", "Cu"), armarPila("Cu", "Ag"), armarPila("Mg", "Zn"), armarPila("Zn", "Ag")];

// Comprobaciones de construcción (si un dato cambia y esto deja de valer, el contenido no se genera).
if (!desplaza("Zn", "Cu") || desplaza("Cu", "Zn") || !desplaza("Fe", "H") || desplaza("Cu", "H") || !desplaza("Zn", "Fe") || desplaza("Ag", "Cu")) throw new Error("La serie de actividad no coincide con el texto de las Clases");

export const CLASES_QUIMIA_REDOX: ClaseQuimia[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "quimia-clase-redox-numero-oxidacion-herramienta",
    grupo: "redox",
    orden: 1,
    requierePro: true,
    nombre: "El número de oxidación como herramienta",
    descripcion: "Reglas ordenadas, casos especiales, compuestos covalentes y los estados de oxidación más comunes de la tabla.",
    pasos: [
      "El número de oxidación (o estado de oxidación) es la carga que tendría un átomo si los electrones de cada enlace se le asignaran al átomo más electronegativo. Es una herramienta contable: en los compuestos covalentes no es una carga real, pero permite seguir a los electrones en una reacción, decidir quién se oxida y quién se reduce, balancear ecuaciones y armar nombres. Las reglas básicas ya aparecen en la Clase «Valencia, número de oxidación y cómo armar fórmulas»; aquí se ordenan, se completan con los casos especiales y se usan para calcular.",
      `Cuando dos reglas parecen chocar, gana la que está más arriba en esta lista. 1) La suma de los números de oxidación es la carga de la especie: 0 si es neutra y la carga si es un ion. 2) Un elemento libre (Fe, ${f("O2")}, ${f("S8")}, ${f("Cl2")}) vale 0. 3) El flúor es siempre −1. 4) Los metales alcalinos son +1, los alcalinotérreos +2 y el aluminio +3 (el zinc +2 y la plata +1 también son casi fijos). 5) El hidrógeno es +1, salvo unido a un metal, donde es −1. 6) El oxígeno es −2, salvo en los peróxidos (−1) y en ${f("OF2")} (+2). El número de los demás elementos se calcula con la suma.`,
      `Los casos especiales son los que más se preguntan. En los hidruros metálicos el hidrógeno es −1, porque el metal es menos electronegativo que él: ${f("NaH")}, ${f("CaH2")}. En los peróxidos el oxígeno es −1, porque cada oxígeno comparte un enlace con el otro oxígeno (esos electrones se reparten por igual): ${f("H2O2")}, ${f("Na2O2")}. Y en ${f("OF2")} el oxígeno es +2, porque el flúor (${en("F")}) es más electronegativo que el oxígeno (${en("O")}). La tabla muestra cada caso con su cuenta.`,
      `Ejemplos resueltos. En ${ion("NH4", 1)}: x + 4·(+1) = +1, así que el nitrógeno es ${oxTexto("NH4", 1, "N")}. En ${f("K2Cr2O7")}: 2·(+1) + 2x + 7·(−2) = 0, así que el cromo es ${oxTexto("K2Cr2O7", 0, "Cr")}. En ${ion("ClO4", -1)}: x + 4·(−2) = −1, así que el cloro es ${oxTexto("ClO4", -1, "Cl")}. En cada caso se suma como en la Técnica de tres pasos: números conocidos, suma igual a la carga y despeje.`,
      `A veces el resultado no es un número entero. En ${f("Fe3O4")}: 3x + 4·(−2) = 0 da x = ${fraccion(4 * 2, 3)}. Un número fraccionario indica que hay átomos del mismo elemento con números distintos: en el ${f("Fe3O4")} hay un hierro con +2 y dos hierros con +3 (1·2 + 2·3 = 8 = 3 × ${fraccion(8, 3)}). En el colegio se trabaja con el promedio o se evita.`,
      `Los compuestos covalentes también tienen números de oxidación: se reparten los electrones de cada enlace según la electronegatividad. El carbono es un buen ejemplo, porque en sus compuestos toma casi todos los valores entre −4 y +4: ${f("CH4")} (${oxTexto("CH4", 0, "C")}), ${f("CH3OH")} (${oxTexto("CH3OH", 0, "C")}), ${f("CH2O")} (${oxTexto("CH2O", 0, "C")}), ${f("HCOOH")} (${oxTexto("HCOOH", 0, "C")}) y ${f("CO2")} (${oxTexto("CO2", 0, "C")}). Cada paso es una oxidación de 2 unidades. Esto se retoma en química orgánica, con la oxidación de los alcoholes.`,
      "Cada elemento también tiene un estado de oxidación «más común», el que suelen dar las tablas escolares. En los grupos principales sale, casi siempre, de la regla por grupo: todos los del grupo 1 son +1, todos los del 2 son +2 y todos los del 17 son −1; en el 13 es +3 (salvo el talio, +1); en el 16 es −2 (salvo el polonio, +4); en el 14 es +4 (salvo el plomo, +2); y en el 15 el nitrógeno es −3, el fósforo +5 y los demás +3. Es un criterio de tabla: casi todos los elementos tienen más de un estado (el hierro tiene +2 y +3, el azufre −2, +4 y +6), así que «el más común» no es «el único». Las tres tablas siguientes reúnen los valores de todos los elementos hasta el 103 (los posteriores no tienen un estado de oxidación establecido).",
      "Los metales de transición siguen menos la regla por grupo: cada grupo trae un valor distinto según el elemento. Conviene recordar las familias más habituales: Sc e Y son +3; Ti, Zr y Hf, +4; V, Nb y Ta, +5; el cromo es +3 y el molibdeno y el wolframio, +6; el manganeso es +2; el hierro, +3; el cobalto y el níquel, +2; el cobre, +2; el zinc, el cadmio y el mercurio, +2; la plata, +1. Los lantánidos son casi todos +3, y los actínidos varían (el uranio es +6, el torio +4).",
      "Los números de oxidación de los ejemplos de colegio van de −4 (el carbono en el metano) a +7 (el manganeso en el permanganato y el cloro en el perclorato). Los valores positivos altos aparecen cuando el elemento está unido a oxígeno o flúor, que son muy electronegativos; los negativos, cuando está unido a hidrógeno o a metales.",
      `Errores frecuentes: confundir la carga de un ion (${ion("Fe", 3)}, con el signo después del número) con el número de oxidación (${ox("Fe", 3)}, con el signo antes); olvidar multiplicar por el subíndice; dar por hecho que el oxígeno es siempre −2 o el hidrógeno siempre +1; y creer que en un compuesto covalente el número de oxidación es una carga real.`,
    ],
    visuales: [
      cuadro(
        2,
        ["Sustancia", "Elemento", "Número", "Motivo"],
        [
          [f("NaH"), "H", oxTexto("NaH", 0, "H", { H: -1 }), "está unido a un metal (menos electronegativo)"],
          [f("CaH2"), "H", oxTexto("CaH2", 0, "H", { H: -1 }), "hidruro metálico"],
          [f("H2O2"), "O", oxTexto("H2O2", 0, "O", { O: -1 }), "peróxido: enlace O–O"],
          [f("Na2O2"), "O", oxTexto("Na2O2", 0, "O", { O: -1 }), "peróxido: enlace O–O"],
          [f("OF2"), "O", oxTexto("OF2", 0, "O", { O: 2 }), "el flúor es más electronegativo"],
          [f("O2"), "O", oxTexto("O2", 0, "O"), "elemento libre"],
        ],
        "Casos especiales"
      ),
      { tipo: "quimia.oxidacion", despuesDePaso: 3, formula: "NH4", carga: 1, incognita: "N" },
      { tipo: "quimia.oxidacion", despuesDePaso: 3, formula: "K2Cr2O7", incognita: "Cr" },
      cuadro(
        5,
        ["Sustancia", "Número del carbono", "Nombre"],
        [
          [f("CH4"), oxTexto("CH4", 0, "C"), "metano"],
          [f("CH3OH"), oxTexto("CH3OH", 0, "C"), "metanol"],
          [f("CH2O"), oxTexto("CH2O", 0, "C"), "metanal"],
          [f("HCOOH"), oxTexto("HCOOH", 0, "C"), "ácido metanoico"],
          [f("CO2"), oxTexto("CO2", 0, "C"), "dióxido de carbono"],
        ],
        "El carbono, de −4 a +4"
      ),
      cuadro(6, ["Grupos principales", "Estado de oxidación más común"], FILAS_ESTADOS_PRINCIPALES, "Estados de oxidación más comunes: grupos principales"),
      cuadro(7, ["Metales de transición", "Estado de oxidación más común"], FILAS_ESTADOS_TRANSICION, "Estados de oxidación más comunes: metales de transición"),
      cuadro(7, ["Bloque f", "Estado de oxidación más común"], FILAS_ESTADOS_INTERNA, "Estados de oxidación más comunes: lantánidos y actínidos"),
    ],
    quiz: [
      preg(`¿Qué número de oxidación tiene el nitrógeno en el ion amonio, ${ion("NH4", 1)}?`, ["+3", "−3", "+5", "+1"], 1, `x + 4·(+1) = +1, así que x = ${oxTexto("NH4", 1, "N")}. Es uno de los pocos casos en que el nitrógeno es negativo con hidrógeno.`),
      preg(`¿Qué número de oxidación tiene el oxígeno en el peróxido de sodio, ${f("Na2O2")}?`, ["−2", "0", "+1", "−1"], 3, `El sodio es +1: 2·(+1) + 2x = 0, así que x = ${oxTexto("Na2O2", 0, "O", { O: -1 })}. En los peróxidos el oxígeno es −1, no −2.`),
      preg(`¿Qué número de oxidación tiene el hidrógeno en el hidruro de calcio, ${f("CaH2")}?`, ["+1", "−1", "0", "+2"], 1, `El calcio es +2: (+2) + 2x = 0, así que x = ${oxTexto("CaH2", 0, "H", { H: -1 })}. Unido a un metal, el hidrógeno es −1.`),
      preg(`¿Qué número de oxidación tiene el carbono en el metanol, ${f("CH3OH")}?`, ["0", "−4", "+2", "−2"], 3, `x + 4·(+1) + (−2) = 0, así que x = ${oxTexto("CH3OH", 0, "C")}. Está entre el metano (−4) y el metanal (0).`),
      preg(`En el ${f("Fe3O4")} el número de oxidación promedio del hierro es ${fraccion(8, 3)}. ¿Qué significa?`, ["Hay átomos de hierro con +2 y otros con +3", "El hierro tiene una carga fraccionaria real", "Hay un error: el número de oxidación siempre es entero", "Todos los hierros están en +2"], 0, "Un promedio no entero indica que hay átomos del mismo elemento con números distintos. En este óxido, uno con +2 y dos con +3."),
      preg("Según la tabla de estados de oxidación más comunes, ¿cuál se asigna al nitrógeno?", ["−3", "+3", "+5", "0"], 0, `El nitrógeno es del grupo 15, cuyo valor por grupo es −3 (aunque también tiene +1, +2, +3, +4 y +5 en distintos compuestos).`),
    ],
  },
  // ---------------------------------------------------------------- 2
  {
    slug: "quimia-clase-redox-oxidacion-reduccion-agentes",
    grupo: "redox",
    orden: 2,
    requierePro: true,
    nombre: "Oxidación, reducción y agentes",
    descripcion: "Qué es oxidarse y reducirse, semirreacciones, agentes oxidante y reductor, tipos de reacciones redox y ejemplos clásicos.",
    pasos: [
      "Oxidación y reducción son procesos con electrones. Históricamente «oxidar» era combinarse con oxígeno (de ahí el nombre) y «reducir» era quitarle el oxígeno a un óxido, como se hace en la metalurgia. Hoy se definen por los electrones: oxidarse es perder electrones y reducirse es ganarlos, haya o no oxígeno. En los dos casos cambia el número de oxidación: sube al oxidarse y baja al reducirse.",
      `Toda reacción redox se puede separar en dos semirreacciones. En la oxidación los electrones aparecen a la derecha (se liberan): ${semiLatex(zncu.oxidacion)} En la reducción aparecen a la izquierda (se captan): ${semiLatex(zncu.reduccion)} Al sumar las dos, los electrones se cancelan y queda la reacción completa: ${ecuacionIonicaLatex(zncu.global)}`,
      "Mira la reacción entre el zinc y los iones cobre (II) paso a paso: los números de oxidación, quién sube, quién baja, los electrones y los agentes.",
      "El agente oxidante es la sustancia que se reduce (le quita electrones a otra y por eso la oxida); el agente reductor es la que se oxida (le da electrones a otra y por eso la reduce). Un buen agente oxidante es una sustancia que se reduce con facilidad (O₂, Cl₂, KMnO₄, HNO₃, K₂Cr₂O₇). Un buen agente reductor se oxida con facilidad (los metales como Na, Zn o Mg, el H₂, el C, el CO).",
      `Ejemplo clásico 1: la combustión. ${ecu([[1, "CH4"], [2, "O2"]], [[1, "CO2"], [2, "H2O"]])} El carbono pasa de ${oxTexto("CH4", 0, "C")} a ${oxTexto("CO2", 0, "C")}: pierde ${ch4.oxida.n * (ch4.oxida.a - ch4.oxida.de)} electrones y se oxida. Los 4 átomos de oxígeno de los ${f("O2")} pasan de 0 a ${oxTexto("H2O", 0, "O")}: ganan ${ch4.reduce.n * (ch4.reduce.de - ch4.reduce.a)} electrones y se reducen. El oxígeno es el agente oxidante y el metano el reductor. Toda combustión completa es una reacción redox, desde una vela hasta un motor.`,
      `Ejemplo clásico 2: la síntesis a partir de elementos. ${ecu([[2, "Mg"], [1, "O2"]], [[2, "MgO"]])} Cada magnesio pasa de 0 a ${oxTexto("MgO", 0, "Mg")} (pierde 2 electrones, y son 2 átomos: ${mgo2.oxida.n * (mgo2.oxida.a - mgo2.oxida.de)}) y cada oxígeno pasa de 0 a ${oxTexto("MgO", 0, "O")} (gana 2, y son 2 átomos: ${mgo2.reduce.n * (mgo2.reduce.de - mgo2.reduce.a)}). Lo mismo pasa con ${ecu([[2, "Na"], [1, "Cl2"]], [[2, "NaCl"]])} Aquí no hay oxígeno y también es una oxidación del sodio y una reducción del cloro.`,
      `Ejemplo clásico 3: el desplazamiento de un metal por otro. En forma molecular: ${ecu([[1, "Zn"], [1, "CuSO4"]], [[1, "ZnSO4"], [1, "Cu"]])} El ion sulfato aparece igual a los dos lados: es un ion espectador y no participa (por eso la ecuación iónica neta es solo ${ecuacionIonicaLatex(zncu.global)}).`,
      `Ejemplo clásico 4: la reducción de un óxido. En los altos hornos, el monóxido de carbono le quita el oxígeno al óxido de hierro (III) y libera hierro: ${ecu([[1, "Fe2O3"], [3, "CO"]], [[2, "Fe"], [3, "CO2"]])} El hierro baja de ${oxTexto("Fe2O3", 0, "Fe")} a 0 (se reduce, el Fe₂O₃ es el oxidante) y el carbono sube de ${oxTexto("CO", 0, "C")} a ${oxTexto("CO2", 0, "C")} (se oxida, el CO es el reductor).`,
      "Agentes oxidantes y reductores comunes, con el cambio que suelen tener. Los oxidantes fuertes (KMnO₄, K₂Cr₂O₇, HNO₃) contienen un elemento en un número muy alto que baja mucho al reducirse; los reductores suelen ser metales o especies con el elemento en un número bajo.",
      `La dismutación (o desproporción) es un caso especial: una misma sustancia se oxida y se reduce a la vez. El agua oxigenada lo hace: ${ecu([[2, "H2O2"]], [[2, "H2O"], [1, "O2"]])} Cada oxígeno del ${f("H2O2")} tiene ${oxTexto("H2O2", 0, "O", { O: -1 })}; una parte sube a 0 (en el ${f("O2")}) y otra baja a ${oxTexto("H2O", 0, "O")} (en el agua). Otro caso clásico es el cloro en una base: ${ecu([[1, "Cl2"], [2, "OH", -1]], [[1, "Cl", -1], [1, "ClO", -1], [1, "H2O"]])} El cloro pasa de 0 a ${oxTexto("Cl", -1, "Cl")} y a ${oxTexto("ClO", -1, "Cl")}.`,
      `La vida cotidiana está llena de reacciones redox. La respiración celular quema la glucosa con oxígeno: ${ecu([[1, "C6H12O6"], [6, "O2"]], [[6, "CO2"], [6, "H2O"]])} El carbono de la glucosa tiene un promedio de ${oxTexto("C6H12O6", 0, "C")} y pasa a ${oxTexto("CO2", 0, "C")}. Y la oxidación del hierro (la herrumbre) empieza con ${ecu([[4, "Fe"], [3, "O2"]], [[2, "Fe2O3"]])} (en la realidad el óxido es hidratado y necesita agua). El hierro pasa de 0 a ${oxTexto("Fe2O3", 0, "Fe")}.`,
      "Errores frecuentes: confundir el proceso con el agente (el agente oxidante es el que se reduce); creer que oxidar siempre necesita oxígeno (el sodio se oxida con cloro); pensar que solo se pierden electrones (siempre hay alguien que los gana); y olvidar que en la ecuación balanceada los electrones perdidos y ganados son iguales.",
    ],
    visuales: [
      { tipo: "quimia.redox", despuesDePaso: 2, ejemplo: "zn-cu" },
      { tipo: "quimia.redox", despuesDePaso: 4, ejemplo: "ch4-o2" },
      { tipo: "quimia.redox", despuesDePaso: 5, ejemplo: "mg-o2" },
      { tipo: "quimia.redox", despuesDePaso: 7, ejemplo: "fe2o3-co" },
      cuadro(
        8,
        ["Agente oxidante", "Elemento que se reduce", "Cambio"],
        [
          [f("KMnO4"), "Mn", `${oxTexto("KMnO4", 0, "Mn")} → ${oxTexto("Mn", 2, "Mn")} (medio ácido)`],
          [f("K2Cr2O7"), "Cr", `${oxTexto("K2Cr2O7", 0, "Cr")} → ${oxTexto("Cr", 3, "Cr")}`],
          [f("HNO3"), "N", `${oxTexto("HNO3", 0, "N")} → ${oxTexto("NO", 0, "N")} (diluido)`],
          [f("O2"), "O", `0 → ${oxTexto("H2O", 0, "O")}`],
          [f("Cl2"), "Cl", `0 → ${oxTexto("Cl", -1, "Cl")}`],
          [f("H2O2"), "O", `${oxTexto("H2O2", 0, "O", { O: -1 })} → ${oxTexto("H2O", 0, "O")}`],
        ],
        "Agentes oxidantes comunes"
      ),
      cuadro(
        8,
        ["Agente reductor", "Elemento que se oxida", "Cambio"],
        [
          [f("Zn"), "Zn", `0 → ${oxTexto("Zn", 2, "Zn")}`],
          [f("Na"), "Na", `0 → ${oxTexto("Na", 1, "Na")}`],
          [f("H2"), "H", `0 → ${oxTexto("H2O", 0, "H")}`],
          [f("CO"), "C", `${oxTexto("CO", 0, "C")} → ${oxTexto("CO2", 0, "C")}`],
          [ion("Fe", 2), "Fe", `${oxTexto("Fe", 2, "Fe")} → ${oxTexto("Fe", 3, "Fe")}`],
          [ion("I", -1), "I", `${oxTexto("I", -1, "I")} → 0`],
        ],
        "Agentes reductores comunes"
      ),
      { tipo: "quimia.redox", despuesDePaso: 9, ejemplo: "h2o2" },
    ],
    quiz: [
      preg(`En ${ecu([[1, "CH4"], [2, "O2"]], [[1, "CO2"], [2, "H2O"]])} ¿qué elemento se oxida?`, ["El oxígeno", "El carbono", "El hidrógeno", "Ninguno: es una combustión, no una reacción redox"], 1, `El carbono pasa de ${oxTexto("CH4", 0, "C")} a ${oxTexto("CO2", 0, "C")}: su número sube, así que se oxida. El hidrógeno se mantiene en +1 y el oxígeno baja de 0 a −2.`),
      preg("En esa misma combustión, ¿cuál es el agente oxidante?", [f("CH4"), f("O2"), f("CO2"), f("H2O")], 1, "El agente oxidante es el que se reduce: el oxígeno (0 → −2). El metano es el agente reductor."),
      preg(`En ${ecu([[2, "Mg"], [1, "O2"]], [[2, "MgO"]])} ¿cuántos electrones pierde cada átomo de magnesio?`, ["4", "1", "2", "8"], 2, `Cada magnesio pasa de 0 a ${oxTexto("MgO", 0, "Mg")}: pierde 2 electrones. Los 2 átomos pierden 4 en total, que son los 4 que ganan los 2 átomos de oxígeno.`),
      preg("¿Qué es una dismutación?", ["Una reacción en la que una misma sustancia se oxida y se reduce a la vez", "Una reacción en la que no cambia ningún número de oxidación", "Una reacción en la que dos sustancias intercambian iones", "Una reacción que solo ocurre en medio básico"], 0, `Por ejemplo, el agua oxigenada: el oxígeno pasa de ${oxTexto("H2O2", 0, "O", { O: -1 })} a 0 (en el O₂) y a ${oxTexto("H2O", 0, "O")} (en el H₂O).`),
      preg("¿Cuál de estas afirmaciones es correcta?", ["Un elemento puede oxidarse sin que haya oxígeno en la reacción", "Oxidarse significa siempre ganar oxígeno y ganar electrones", "El agente reductor es el que se reduce", "En una reacción redox pueden perderse más electrones de los que se ganan"], 0, "En la reacción del sodio con el cloro, el sodio se oxida (0 → +1) sin que haya oxígeno. Los electrones perdidos y ganados siempre son iguales."),
      preg(`En ${ecu([[1, "Zn"], [1, "CuSO4"]], [[1, "ZnSO4"], [1, "Cu"]])} ¿qué papel tiene el ion sulfato?`, ["Es un ion espectador: no cambia y no participa", "Es el agente oxidante", "Es el agente reductor", "Se reduce a azufre"], 0, `El azufre sigue en ${oxTexto("SO4", -2, "S")} a los dos lados: el ion sulfato no gana ni pierde electrones.`),
    ],
  },
  // ---------------------------------------------------------------- 3
  {
    slug: "quimia-clase-redox-balanceo-numero-oxidacion",
    grupo: "redox",
    orden: 3,
    requierePro: true,
    nombre: "Balanceo por cambio del número de oxidación",
    descripcion: "El método paso a paso: cambios de número, mínimo común múltiplo de los electrones y tanteo, con cuatro ejemplos resueltos.",
    pasos: [
      "El método del cambio del número de oxidación se basa en una sola idea: los electrones que pierde un elemento son los que gana otro. Sirve para ecuaciones moleculares, escritas con las fórmulas completas.",
      "Los pasos son cinco. 1) Escribe la ecuación sin balancear. 2) Calcula el número de oxidación de cada elemento y detecta los que cambian. 3) Anota cuántos electrones gana o pierde cada átomo y multiplica por la cantidad de átomos. 4) Iguala los electrones (con el mínimo común múltiplo) y coloca esos coeficientes. 5) Completa el resto por tanteo, en este orden: metales, no metales, hidrógeno y, al final, oxígeno. Después, verifica.",
      `Ejemplo 1: el hierro con el oxígeno, $\\mathrm{Fe} + \\mathrm{O_2} \\rightarrow \\mathrm{Fe_2O_3}$. El hierro sube de 0 a ${oxTexto("Fe2O3", 0, "Fe")}: pierde 3 electrones por átomo. Cada átomo de oxígeno baja de 0 a ${oxTexto("Fe2O3", 0, "O")}: gana 2, o sea 4 por cada ${f("O2")}. El mínimo común múltiplo de 3 y 4 es 12: 4 átomos de hierro pierden 12 electrones y 3 moléculas de ${f("O2")} ganan 12. Resultado: ${ecu([[4, "Fe"], [3, "O2"]], [[2, "Fe2O3"]])}`,
      `Ejemplo 2: el cobre con el ácido nítrico diluido, $\\mathrm{Cu} + \\mathrm{HNO_3} \\rightarrow \\mathrm{Cu(NO_3)_2} + \\mathrm{NO} + \\mathrm{H_2O}$. El cobre sube de 0 a ${oxTexto("Cu", 2, "Cu")} (pierde 2). El nitrógeno baja de ${oxTexto("HNO3", 0, "N")} a ${oxTexto("NO", 0, "N")} (gana 3). El mínimo común múltiplo es 6: 3 Cu y 2 N. Se colocan 3 Cu y 2 NO. Falta el nitrógeno que queda como nitrato: 3 ${f("Cu(NO3)2")} llevan 6 nitratos, en total 2 + 6 = 8 HNO₃; el hidrógeno da 4 ${f("H2O")}. ${ecu([[3, "Cu"], [8, "HNO3"]], [[3, "Cu(NO3)2"], [2, "NO"], [4, "H2O"]])}`,
      `Fíjate que en el ejemplo 2 el ácido nítrico cumple dos funciones: 2 de sus 8 moléculas se reducen (el nitrógeno pasa de +5 a +2) y las otras 6 solo aportan los nitratos que acompañan al cobre (el nitrógeno queda en +5). Por eso el coeficiente del HNO₃ no sale de la cuenta de electrones, sino del tanteo posterior.`,
      `Ejemplo 3: el permanganato con el ácido clorhídrico, $\\mathrm{KMnO_4} + \\mathrm{HCl} \\rightarrow \\mathrm{KCl} + \\mathrm{MnCl_2} + \\mathrm{Cl_2} + \\mathrm{H_2O}$. El manganeso baja de ${oxTexto("KMnO4", 0, "Mn")} a ${oxTexto("MnCl2", 0, "Mn", { Cl: -1 })} (gana 5). Parte del cloro sube de −1 a 0 (pierde 1 por átomo, o 2 por cada ${f("Cl2")}). El mínimo común múltiplo es 10: 2 Mn ganan 10 y 10 Cl pierden 10 (5 ${f("Cl2")}). Después se completa: 2 KCl, 2 ${f("MnCl2")}, y el cloro total de la derecha (2 + 4 + 10 = 16) fija 16 HCl y 8 ${f("H2O")}. ${ecu([[2, "KMnO4"], [16, "HCl"]], [[2, "KCl"], [2, "MnCl2"], [5, "Cl2"], [8, "H2O"]])}`,
      `En el ejemplo 3, de los 16 HCl solo 10 actúan como agente reductor (el cloro pasa a ${f("Cl2")}); los otros 6 quedan como cloruro en KCl y ${f("MnCl2")}. Verificación de átomos: ${Object.entries(atomosDeLado([t(2, "KMnO4"), t(16, "HCl")])).map(([s, n]) => `${n} ${s}`).join(", ")} a la izquierda y ${Object.entries(atomosDeLado([t(2, "KCl"), t(2, "MnCl2"), t(5, "Cl2"), t(8, "H2O")])).map(([s, n]) => `${n} ${s}`).join(", ")} a la derecha.`,
      "Consejos para no perderse. Trabaja primero con los elementos que cambian y deja el hidrógeno y el oxígeno para el final. Si un elemento cambia en una sustancia pero aparece en otras sin cambiar (como el nitrógeno del nitrato), su coeficiente total sale del tanteo. Si todos los coeficientes tienen un divisor común, simplifícalos. Y verifica siempre al terminar: mismos átomos de cada elemento y, si hay iones, la misma carga.",
      "¿Cuándo conviene este método? Cuando la ecuación está en forma molecular y no hay un medio (ácido o básico) que importe. Si hay iones en solución y el medio es parte de la reacción, es más ordenado el método ion-electrón, que se ve en las dos Clases siguientes.",
      "Errores frecuentes: olvidar multiplicar el cambio del número por la cantidad de átomos (por ejemplo, contar 2 y no 4 electrones para el O₂); usar el mínimo común múltiplo del cambio y olvidar volver a los coeficientes; dejar de tantear el hidrógeno y el oxígeno; y no verificar al final.",
    ],
    visuales: [
      { tipo: "quimia.redox", despuesDePaso: 2, ejemplo: "fe-o2" },
      { tipo: "quimia.redox", despuesDePaso: 3, ejemplo: "cu-hno3" },
      { tipo: "quimia.redox", despuesDePaso: 5, ejemplo: "kmno4-hcl" },
    ],
    quiz: [
      preg(`En ${ecu([[4, "Fe"], [3, "O2"]], [[2, "Fe2O3"]])} ¿cuántos electrones pasan del hierro al oxígeno en total?`, ["3", "6", "12", "24"], 2, `${feo2.oxida.n} átomos de hierro pierden 3 cada uno: ${electronesDelEjemplo(feo2).perdidos} electrones. Los ${feo2.reduce.n} átomos de oxígeno ganan 2 cada uno: ${electronesDelEjemplo(feo2).ganados}.`),
      preg(`En ${ecu([[3, "Cu"], [8, "HNO3"]], [[3, "Cu(NO3)2"], [2, "NO"], [4, "H2O"]])} ¿cuántas moléculas de HNO₃ se reducen (pasan a NO)?`, ["8", "6", "3", "2"], 3, `Solo las que forman NO: ${cuHno3.reduce.n} moléculas. Las otras 6 quedan como nitrato en el ${f("Cu(NO3)2")}.`),
      preg(`En la reacción del permanganato con el HCl, ¿cuántos HCl actúan como agente reductor (el cloro pasa a ${f("Cl2")})?`, ["16", "10", "5", "6"], 1, `Se forman 5 ${f("Cl2")}, o sea 10 átomos de cloro que suben de −1 a 0: ${kmnoHcl.oxida.n} HCl. Los otros 6 quedan como cloruro.`),
      preg("Para igualar los electrones, una especie pierde 3 y otra gana 2 por unidad. ¿Cuántos electrones se transfieren en total al equilibrar?", ["5", "6", "3", "2"], 1, "El mínimo común múltiplo de 3 y 2 es 6: 2 unidades de la primera pierden 6 electrones y 3 de la segunda ganan 6."),
      preg(`En ${ecu([[2, "KMnO4"], [16, "HCl"]], [[2, "KCl"], [2, "MnCl2"], [5, "Cl2"], [8, "H2O"]])} ¿cuántos electrones gana cada átomo de manganeso?`, ["2", "5", "7", "10"], 1, `Baja de ${oxTexto("KMnO4", 0, "Mn")} a ${oxTexto("MnCl2", 0, "Mn", { Cl: -1 })}: gana 5 electrones. Los 2 manganesos ganan 10 en total.`),
      preg("¿En qué orden conviene completar el tanteo después de igualar los electrones?", ["Metales, no metales, hidrógeno y, al final, oxígeno", "Oxígeno primero y después todo lo demás", "Hidrógeno y oxígeno primero, porque aparecen en más sustancias", "El orden no importa nunca"], 0, "Los elementos que aparecen en una sola sustancia por lado se ajustan primero; el hidrógeno y el oxígeno suelen estar en varias (como el agua) y se dejan para el final, además el oxígeno sirve de verificación."),
    ],
  },
  // ---------------------------------------------------------------- 4
  {
    slug: "quimia-clase-redox-ion-electron-acido",
    grupo: "redox",
    orden: 4,
    requierePro: true,
    nombre: "Método ion-electrón en medio ácido",
    descripcion: "Semirreacciones balanceadas con H₂O, H⁺ y e⁻ en medio ácido: cinco ejemplos y el paso de la ecuación iónica a la molecular.",
    pasos: [
      "Muchas reacciones redox ocurren en solución acuosa y entre iones (MnO₄⁻, Cr₂O₇²⁻, NO₃⁻...). Para ellas se usa el método ion-electrón: se divide la reacción en dos semirreacciones, se balancea cada una por separado, se igualan los electrones y se suman. En medio ácido hay H⁺ y agua disponibles para completar la cuenta.",
      `El orden dentro de cada semirreacción es siempre el mismo (O, H, e⁻). 1) Escribe la semirreacción con el elemento principal ya igualado (por ejemplo, 2 Cr a cada lado). 2) Iguala los oxígenos agregando ${f("H2O")} del lado que falta. 3) Iguala los hidrógenos agregando ${ion("H", 1)} del lado que falta. 4) Iguala las cargas agregando electrones del lado con más carga positiva. 5) Multiplica cada semirreacción para que los electrones sean iguales, suma y simplifica. 6) Verifica átomos y carga.`,
      `Ejemplo 1: el permanganato oxida al hierro (II). Reducción: ${semiLatex(casoMnFe.reduccion.final)} Oxidación: ${semiLatex(casoMnFe.oxidacion.final)} Se multiplica la oxidación por ${casoMnFe.suma.multOxidacion} para llegar a ${casoMnFe.suma.electrones} electrones, y al sumar: ${ecuacionIonicaLatex(casoMnFe.suma)}`,
      `Ejemplo 2: el dicromato oxida al hierro (II). El cromo se escribe con 2 átomos a cada lado (2 Cr). Reducción: ${semiLatex(casoCrFe.reduccion.final)} Como esa semirreacción tiene ${casoCrFe.reduccion.final.electrones} electrones y la del hierro 1, esta última se multiplica por ${casoCrFe.suma.multOxidacion}. Resultado: ${ecuacionIonicaLatex(casoCrFe.suma)}`,
      `Ejemplo 3: el cobre con el ion nitrato en medio ácido. Reducción: ${semiLatex(casoCuNo3.reduccion.final)} Oxidación: ${semiLatex(casoCuNo3.oxidacion.final)} Los electrones (3 y 2) se igualan en 6: la reducción se multiplica por ${casoCuNo3.suma.multReduccion} y la oxidación por ${casoCuNo3.suma.multOxidacion}. Resultado: ${ecuacionIonicaLatex(casoCuNo3.suma)} Es la ecuación iónica de la reacción del cobre con el ácido nítrico diluido de la Clase anterior.`,
      `Ejemplo 4: un elemento que forma una molécula. El permanganato con el ion cloruro produce cloro: al escribir la oxidación se pone 2 ${ion("Cl", -1)} para tener el ${f("Cl2")}. Oxidación: ${semiLatex(casoMnCl.oxidacion.final)} Resultado: ${ecuacionIonicaLatex(casoMnCl.suma)}`,
      `Ejemplo 5: el agua oxigenada como agente reductor. Frente a un oxidante fuerte como el permanganato, el ${f("H2O2")} se oxida a oxígeno (de −1 a 0). Oxidación: ${semiLatex(casoMnH2o2.oxidacion.final)} Resultado: ${ecuacionIonicaLatex(casoMnH2o2.suma)}`,
      `De la ecuación iónica a la molecular. Los iones que no cambian (los espectadores) se agregan al final, con los coeficientes que hagan falta. Para el ejemplo 1 con sulfato de hierro (II) en ácido sulfúrico: ${ecu([[2, "KMnO4"], [10, "FeSO4"], [8, "H2SO4"]], [[1, "K2SO4"], [2, "MnSO4"], [5, "Fe2(SO4)3"], [8, "H2O"]])} Se verifica contando átomos de cada elemento, incluidos K, S y O.`,
      "Errores frecuentes: no multiplicar las dos semirreacciones hasta igualar los electrones; poner los electrones del lado equivocado (en la reducción van a la izquierda y en la oxidación a la derecha); olvidar que el H⁺ y el H₂O que sobran a los dos lados se simplifican; y no verificar la carga al final (la suma de cargas a la izquierda debe ser igual a la de la derecha).",
    ],
    visuales: [
      { tipo: "quimia.balanceo", despuesDePaso: 2, caso: "mno4-fe2" },
      { tipo: "quimia.balanceo", despuesDePaso: 3, caso: "cr2o7-fe2" },
      { tipo: "quimia.balanceo", despuesDePaso: 4, caso: "cu-no3" },
      { tipo: "quimia.balanceo", despuesDePaso: 5, caso: "mno4-cl" },
      { tipo: "quimia.balanceo", despuesDePaso: 6, caso: "mno4-h2o2" },
    ],
    quiz: [
      preg(`En la ecuación iónica de ${ion("MnO4", -1)} con ${ion("Fe", 2)} en medio ácido, ¿cuántos ${ion("Fe", 2)} reaccionan por cada ${ion("MnO4", -1)}?`, ["1", "2", "5", "8"], 2, `La reducción del Mn tiene ${casoMnFe.reduccion.final.electrones} electrones y cada Fe²⁺ pierde 1, así que hacen falta ${casoMnFe.suma.multOxidacion} Fe²⁺.`),
      preg(`En la reacción de ${ion("MnO4", -1)} con ${ion("Cl", -1)}, ¿cuántos electrones se transfieren en total (en la ecuación neta)?`, ["5", "10", "16", "2"], 1, `2 ${ion("MnO4", -1)} ganan 5 cada uno y 10 ${ion("Cl", -1)} pierden 1 cada uno: ${casoMnCl.suma.electrones} electrones.`),
      preg(`¿Cuántos ${ion("H", 1)} se consumen en la ecuación ${ecuacionIonicaLatex(casoCrFe.suma)} ?`, ["6", "7", "14", "12"], 2, `Se necesitan ${casoCrFe.reduccion.conProtones.agregados} H⁺ por cada ${ion("Cr2O7", -2)}, y aparecen 7 H₂O.`),
      preg("En una reducción, ¿de qué lado de la semirreacción aparecen los electrones?", ["A la izquierda, con los reactivos", "A la derecha, con los productos", "Depende de la carga del ion", "No aparecen: se cancelan antes"], 0, "Reducirse es ganar electrones: se consumen, y los reactivos incluyen los electrones. En la oxidación aparecen a la derecha, como productos."),
      preg(`En ${semiLatex(casoMnH2o2.oxidacion.final)} ¿qué le pasa al agua oxigenada?`, ["Se oxida: el oxígeno pasa de −1 a 0", "Se reduce: el oxígeno pasa de −1 a −2", "No cambia", "Se dismuta en agua y oxígeno"], 0, `El oxígeno pasa de ${oxTexto("H2O2", 0, "O", { O: -1 })} a 0 en el O₂: sube, así que se oxida. Frente al permanganato, actúa como reductor.`),
      preg("Al balancear en medio ácido, ¿qué se usa para igualar los hidrógenos?", ["H⁺", "OH⁻", "H₂O", "Electrones"], 0, "Los oxígenos se igualan con H₂O y después los hidrógenos con H⁺. Los OH⁻ se usan solo en medio básico."),
    ],
  },
  // ---------------------------------------------------------------- 5
  {
    slug: "quimia-clase-redox-ion-electron-basico",
    grupo: "redox",
    orden: 5,
    requierePro: true,
    nombre: "Método ion-electrón en medio básico",
    descripcion: "Cómo pasar de medio ácido a básico con OH⁻, y qué productos da el permanganato según el medio.",
    pasos: [
      "En medio básico (con NaOH o KOH, por ejemplo) no hay H⁺ libres: lo que abunda es el OH⁻. El método es el mismo que en medio ácido, con un paso más al final para eliminar los H⁺ y reemplazarlos por OH⁻.",
      `El método en medio básico. 1) Balancea la semirreacción como si fuera medio ácido (O con ${f("H2O")}, H con ${ion("H", 1)}, cargas con electrones). 2) Por cada ${ion("H", 1)} que aparezca, suma un ${ion("OH", -1)} a los DOS lados. 3) En el lado donde estaba el ${ion("H", 1)}, cada ${ion("H", 1)} con un ${ion("OH", -1)} forma un ${f("H2O")}. 4) Simplifica el agua que quede a los dos lados. 5) Iguala los electrones, suma y verifica: en la ecuación final no debe quedar ningún ${ion("H", 1)}.`,
      `Ejemplo 1: el permanganato oxida al yoduro y se forma dióxido de manganeso, ${ion("MnO4", -1)} + ${ion("I", -1)} → ${f("MnO2")} + ${f("I2")}. Reducción en medio ácido: ${semiLatex(casoMnI.reduccion.conElectrones)} Se suman ${casoMnI.reduccion.basico!.conOH.agregados} ${ion("OH", -1)} a los dos lados; los ${casoMnI.reduccion.conProtones.agregados} ${ion("H", 1)} se transforman en agua y se simplifica. Reducción en medio básico: ${semiLatex(casoMnI.reduccion.final)}`,
      `La oxidación es ${semiLatex(casoMnI.oxidacion.final)} (se escribe 2 ${ion("I", -1)} para obtener el ${f("I2")}). La reducción tiene ${casoMnI.reduccion.final.electrones} electrones y la oxidación 2: se multiplican por ${casoMnI.suma.multReduccion} y ${casoMnI.suma.multOxidacion}. Resultado: ${ecuacionIonicaLatex(casoMnI.suma)}`,
      `Ejemplo 2: el hidróxido de cromo (III) se oxida a cromato con hipoclorito, ${f("Cr(OH)3")} + ${ion("ClO", -1)} → ${ion("CrO4", -2)} + ${ion("Cl", -1)}. Reducción: ${semiLatex(casoCrClo.reduccion.final)} Oxidación: ${semiLatex(casoCrClo.oxidacion.final)} Los electrones (2 y 3) se igualan en 6, y queda: ${ecuacionIonicaLatex(casoCrClo.suma)}`,
      "Comparación. En medio ácido, la ecuación final tiene H⁺ y H₂O; en medio básico, OH⁻ y H₂O; y en los dos, ningún electrón. Una forma de verificar es que la ecuación básica no tenga H⁺ y que la ácida no tenga OH⁻.",
      `El medio importa: una misma especie da productos distintos. El permanganato es un buen ejemplo. En medio ácido se reduce a ${ion("Mn", 2)} (${ox("Mn", oxNum("Mn", 2, "Mn"))}); en medio neutro o débilmente básico, a ${f("MnO2")} (${ox("Mn", oxNum("MnO2", 0, "Mn"))}); y en un medio fuertemente básico, a ${ion("MnO4", -2)} (${ox("Mn", oxNum("MnO4", -2, "Mn"))}).`,
      "Errores frecuentes: sumar los OH⁻ solo de un lado; olvidarse de simplificar el agua que queda a los dos lados; dejar H⁺ en la ecuación final de un medio básico; y balancear la carga sin haber igualado antes los oxígenos y los hidrógenos.",
    ],
    visuales: [
      { tipo: "quimia.balanceo", despuesDePaso: 3, caso: "mno4-i" },
      { tipo: "quimia.balanceo", despuesDePaso: 4, caso: "cr-oh3-clo" },
      cuadro(
        6,
        ["Medio", "Producto del MnO₄⁻", "Número del Mn"],
        [
          ["Ácido", ion("Mn", 2), oxTexto("Mn", 2, "Mn")],
          ["Neutro o débilmente básico", f("MnO2"), oxTexto("MnO2", 0, "Mn")],
          ["Fuertemente básico", ion("MnO4", -2), oxTexto("MnO4", -2, "Mn")],
        ],
        "El permanganato según el medio"
      ),
    ],
    quiz: [
      preg(`En medio básico, ¿qué se hace con los ${ion("H", 1)} que aparecen al balancear como si fuera medio ácido?`, ["Se suma un OH⁻ por cada H⁺ a los dos lados y se forma agua", "Se dejan en la ecuación final", "Se restan de un solo lado", "Se reemplazan por electrones"], 0, "Cada H⁺ más un OH⁻ da H₂O. Se suman los OH⁻ a los dos lados para no romper el balance, y el agua sobrante se simplifica."),
      preg(`En ${semiLatex(casoMnI.reduccion.final)} ¿cuántos ${ion("OH", -1)} aparecen a la derecha?`, ["2", "3", "4", "8"], 2, `Se agregaron ${casoMnI.reduccion.basico!.conOH.agregados} OH⁻ a los dos lados y todos quedaron a la derecha, porque los H⁺ estaban a la izquierda.`),
      preg(`En la ecuación iónica neta del permanganato con el yoduro en medio básico, ¿cuántos ${ion("OH", -1)} hay a la derecha?`, ["4", "6", "8", "12"], 2, `${ecuacionIonicaLatex(casoMnI.suma)} Salen ${casoMnI.suma.productos.find((x) => x.especie.formula === "OH")!.coef} OH⁻.`),
      preg("¿Cuál de estas ecuaciones finales no puede ser de un medio básico?", ["La que tiene H⁺ entre los reactivos", "La que tiene OH⁻ entre los productos", "La que tiene H₂O entre los reactivos", "La que no tiene electrones"], 0, "En medio básico no hay H⁺ libres: si la ecuación final tiene H⁺, quedó a medias."),
      preg(`Cuando el permanganato se reduce a ${f("MnO2")}, ¿cuántos electrones gana cada manganeso?`, ["1", "3", "5", "7"], 1, `Pasa de ${oxTexto("MnO4", -1, "Mn")} a ${oxTexto("MnO2", 0, "Mn")}: baja 3 unidades.`),
    ],
  },
  // ---------------------------------------------------------------- 6
  {
    slug: "quimia-clase-redox-serie-actividad-potenciales",
    grupo: "redox",
    orden: 6,
    requierePro: true,
    nombre: "Serie de actividad y potenciales",
    descripcion: "El potencial estándar de reducción, la serie de actividad de los metales y cómo predecir si una reacción ocurre.",
    pasos: [
      `Cada semirreacción de reducción tiene un potencial estándar de reducción, E°, que se mide en voltios (V). Se compara con la del hidrógeno, ${f("H2")}/${ion("H", 1)}, a la que se le asigna ${voltios(0)} V por convención. «Estándar» quiere decir a 25 °C, con soluciones 1 mol/L y gases a 1 atm. Cuanto MÁS POSITIVO es E°, más fuerte es la tendencia del catión a reducirse (mejor agente oxidante); cuanto más NEGATIVO, más fácil es que el metal se oxide (mejor agente reductor).`,
      "La tabla muestra los potenciales de reducción de los metales más comunes, del más negativo al más positivo. Como son valores de referencia, no se calculan: se consultan.",
      `Si se ordenan de menor a mayor E°, se obtiene la serie de actividad: ${serieDeActividad().map((x) => x.simbolo).join(" > ")} (de más a menos reactivo; el H se ubica por su potencial). El orden exacto de algunos metales puede variar entre libros (por ejemplo, el sodio y el calcio), porque la reactividad práctica depende también de la velocidad de la reacción. Aquí se usa el orden que sale de los potenciales estándar.`,
      `Desplazamiento de un metal. Un metal reacciona con el catión de otro cuando el potencial de reducción del catión es MAYOR que el del metal: es lo mismo que decir que el metal está arriba del otro en la serie. Zinc con ${ion("Cu", 2)}: ${voltios(POTENCIALES.find((p) => p.simbolo === "Cu")!.cV)} − (${voltios(POTENCIALES.find((p) => p.simbolo === "Zn")!.cV)}) = ${voltios(zncu.cV)} V, positivo, así que ocurre: ${ecuacionIonicaLatex(zncu.global)} Cobre con ${ion("Zn", 2)}: la cuenta da −${voltios(zncu.cV)} V, negativo, no ocurre.`,
      `Otro ejemplo: el cobre desplaza a la plata. ${ecuacionIonicaLatex(cuag.global)} E° = ${voltios(parPotencial("Ag"))} − ${voltios(parPotencial("Cu"))} = ${voltios(cuag.cV)} V. Fíjate que el coeficiente 2 no cambia el potencial: E° no depende de cuántas veces se escriba la reacción.`,
      `Reacción con ácidos. El ${ion("H", 1)} de un ácido actúa como oxidante y su potencial es ${voltios(0)} V. Los metales con E° negativo lo reducen y desprenden hidrógeno: ${ecu([[1, "Fe"], [2, "H", 1]], [[1, "Fe", 2], [1, "H2"]])} Los de E° positivo (Cu, Ag, Au) no lo hacen con ácidos como el clorhídrico. El cobre y la plata sí los ataca un ácido oxidante como el nítrico, pero entonces el que se reduce es el ion nitrato, no el H⁺: es lo que se vio en la reacción del cobre con el ácido nítrico. El oro resiste incluso al nítrico (solo se disuelve en agua regia, una mezcla de ácidos).`,
      "Regla general de espontaneidad: para una reacción redox, E°(reacción) = E°(reducción) − E°(oxidación), o sea E°(cátodo) − E°(ánodo). Si es positivo, la reacción es espontánea en condiciones estándar; si es negativo, no lo es (ocurriría al revés). La tabla muestra cinco reacciones con su potencial, calculado de la tabla de arriba.",
      "Aplicación: proteger al hierro de la corrosión. Un metal más reactivo que el hierro (el zinc o el magnesio) se oxida antes que él; por eso se galvaniza el hierro (se lo recubre con zinc) o se atornillan bloques de magnesio a los cascos de los barcos: se llaman ánodos de sacrificio. El metal protector se gasta en lugar del hierro.",
      "Límites de esta herramienta. Los potenciales son estándar: cambian con la concentración y la temperatura (la ecuación de Nernst, que queda fuera del colegio). Y que una reacción sea posible no dice que sea rápida: el aluminio tiene un potencial muy negativo pero parece inerte, porque se cubre de una fina capa de óxido que lo protege. La tabla es una guía, no una garantía.",
    ],
    visuales: [
      cuadro(
        1,
        ["Metal", "Semirreacción de reducción", "E° (V)"],
        [...POTENCIALES].sort((a, b) => a.cV - b.cV).map((p) => [`${cap(p.nombre)} (${p.simbolo})`, semiLatex(ionSemi(p.simbolo, p.carga)), voltios(p.cV)]),
        "Potenciales estándar de reducción (25 °C, 1 mol/L)"
      ),
      { tipo: "quimia.redox", despuesDePaso: 3, ejemplo: "zn-cu" },
      cuadro(
        6,
        ["Reacción", "E° de la reacción (V)", "¿Espontánea?"],
        ESPONTANEAS.map((p) => [ecuacionIonicaLatex(p.global), voltios(p.cV), "sí"]),
        "Reacciones espontáneas y su potencial"
      ),
    ],
    quiz: [
      preg(`¿Cuál es el potencial estándar de la reacción ${ecuacionIonicaLatex(zncu.global)}?`, [`${voltios(zncu.cV)} V`, `${voltios(zncu.catodo.cV)} V`, `${voltios(zncu.anodo.cV)} V`, `−${voltios(zncu.cV)} V`], 0, `E° = E°(Cu²⁺/Cu) − E°(Zn²⁺/Zn) = ${voltios(zncu.catodo.cV)} − (${voltios(zncu.anodo.cV)}) = ${voltios(zncu.cV)} V.`),
      preg("Un metal con un potencial de reducción muy negativo es...", ["Un buen agente reductor: se oxida con facilidad", "Un buen agente oxidante", "Un metal noble que no reacciona", "Un metal que se reduce con facilidad"], 0, "El catión de ese metal se reduce con dificultad, y por lo tanto el metal se oxida con facilidad: es un buen reductor."),
      preg("¿Cuál de estos metales desprende hidrógeno al ponerlo en ácido clorhídrico diluido?", ["Cobre", "Plata", "Hierro", "Oro"], 2, `El hierro (${voltios(POTENCIALES.find((p) => p.simbolo === "Fe")!.cV)} V) tiene un potencial menor que el del hidrógeno (${voltios(0)} V), así que lo reduce. El cobre, la plata y el oro tienen potenciales positivos.`),
      preg(`Si el E° calculado de una reacción es −${voltios(zncu.cV)} V (como el del cobre con ${ion("Zn", 2)}), ¿qué se concluye?`, ["No es espontánea en condiciones estándar", "Es espontánea pero lenta", "Es espontánea y rápida", "Es una reacción sin transferencia de electrones"], 0, "Un potencial negativo indica que la reacción no es espontánea en esas condiciones (sí lo es la inversa)."),
      preg("¿Por qué se atornillan bloques de magnesio a un casco de acero?", ["Porque el magnesio se oxida antes que el hierro y lo protege", "Porque el magnesio es más pesado que el hierro", "Porque el magnesio es un metal noble", "Porque reduce el óxido de hierro ya formado y lo elimina"], 0, "El magnesio está más arriba que el hierro en la serie: se oxida en lugar del hierro (ánodo de sacrificio)."),
    ],
  },
  // ---------------------------------------------------------------- 7
  {
    slug: "quimia-clase-redox-pilas-electrolisis",
    grupo: "redox",
    orden: 7,
    requierePro: true,
    nombre: "Pilas y electrólisis",
    descripcion: "Cómo una reacción redox espontánea produce corriente (pila) y cómo la corriente fuerza una reacción que no ocurre sola (electrólisis).",
    pasos: [
      "Como una reacción redox transfiere electrones, se puede aprovechar esa transferencia. Si la reacción es espontánea, se puede obligar a los electrones a pasar por un cable y obtener corriente eléctrica: es una pila (celda galvánica). Si la reacción NO es espontánea, se puede forzar con una fuente de corriente externa: es una electrólisis.",
      "Una pila tiene dos semiceldas, cada una con un electrodo metálico sumergido en una solución de sus propios iones. Los electrodos se conectan con un cable (por ahí circulan los electrones) y las soluciones, con un puente salino, un tubo con una solución de una sal inerte (por ahí circulan los iones y se cierra el circuito).",
      "En una pila, el ÁNODO es el electrodo donde ocurre la oxidación y el CÁTODO donde ocurre la reducción. Regla para recordarlo: vocal con vocal (Ánodo–Oxidación) y consonante con consonante (Cátodo–Reducción). Los electrones viajan siempre del ánodo al cátodo por el cable, y en la pila el ánodo es el polo negativo y el cátodo el positivo. Mira cómo funciona la pila de Daniell, de zinc y cobre.",
      `El potencial de la pila es E°(pila) = E°(cátodo) − E°(ánodo). Para la pila de Daniell: ${voltios(zncu.catodo.cV)} − (${voltios(zncu.anodo.cV)}) = ${voltios(zncu.cV)} V. El ánodo siempre es el metal con el menor potencial de reducción (el más reactivo). En una pila, la reacción global es la suma de las dos semirreacciones: ${ecuacionIonicaLatex(zncu.global)}`,
      `Se acostumbra escribir la pila con una notación abreviada: el ánodo a la izquierda, el cátodo a la derecha y el puente salino como una doble barra. Para la pila de Daniell: $\\mathrm{Zn(s)\\,|\\,Zn^{2+}(aq)\\;\\|\\;Cu^{2+}(aq)\\,|\\,Cu(s)}$. Cada barra simple separa fases distintas (el metal y su solución).`,
      `Cuando los iones tienen cargas distintas, hay que igualar los electrones. En la pila de zinc y plata, el zinc pierde 2 electrones y cada ${ion("Ag", 1)} gana 1, así que reaccionan 2 ${ion("Ag", 1)} por cada Zn: ${ecuacionIonicaLatex(znag.global)} E°(pila) = ${voltios(znag.catodo.cV)} − (${voltios(znag.anodo.cV)}) = ${voltios(znag.cV)} V. El potencial no se duplica por escribir 2 ${ion("Ag", 1)}.`,
      `La electrólisis hace lo contrario. Con una fuente de corriente se obliga a ocurrir una reacción que no es espontánea. Sigue valiendo que en el cátodo hay reducción y en el ánodo oxidación, pero los signos se invierten respecto de la pila: en la electrólisis el cátodo es el polo negativo y el ánodo el positivo (la fuente externa los conecta así). Ejemplos: la electrólisis del agua (con un poco de ácido), ${ecuacionIonicaLatex(electrolisisAgua.global)} donde en el cátodo se obtiene el doble de volumen de gas (${f("H2")}) que en el ánodo (${f("O2")}); y la del cloruro de sodio fundido, ${ecuacionIonicaLatex(electrolisisSal.global)} que produce sodio metálico en el cátodo y cloro gaseoso en el ánodo.`,
      `Las semirreacciones de la electrólisis del agua son ${semiLatex(electrolisisAgua.catodo)} en el cátodo y ${semiLatex(electrolisisAgua.anodo)} en el ánodo. En solución acuosa de cloruro de sodio el resultado es otro (se forman hidrógeno, cloro e hidróxido de sodio), porque el agua también participa.`,
      "La tabla siguiente resume las diferencias entre una pila y una electrólisis.",
      "Aplicaciones. Las pilas de uso diario funcionan con el mismo principio: la pila seca clásica usa un envase de zinc como ánodo, y las baterías recargables (como las de ion litio) actúan como pila cuando se descargan y como electrólisis cuando se recargan. La electrólisis sirve para obtener metales muy reactivos (como el sodio o el aluminio, a partir de sus compuestos fundidos), para recubrir objetos con una capa de otro metal (niquelado, cromado) y para producir gases como el hidrógeno.",
      "Limitaciones. Los potenciales de una pila son estándar: al gastarse los reactivos y cambiar las concentraciones, el voltaje real baja hasta que la pila deja de funcionar (cuando se llega al equilibrio, el potencial es 0). Y en las electrólisis reales aparecen otros efectos (sobrepotenciales, reacciones del agua) que este nivel no incluye.",
    ],
    visuales: [
      { tipo: "quimia.pila", despuesDePaso: 2, anodo: "Zn", catodo: "Cu" },
      cuadro(
        3,
        ["Pila (ánodo / cátodo)", "Reacción global", "E° (V)"],
        PILAS.map(([a, c]) => {
          const p = armarPila(a, c);
          return [`${a} / ${c}`, ecuacionIonicaLatex(p.global), voltios(p.cV)];
        }),
        "Cinco pilas de metales"
      ),
      { tipo: "quimia.pila", despuesDePaso: 5, anodo: "Zn", catodo: "Ag" },
      cuadro(
        8,
        ["", "Pila", "Electrólisis"],
        [
          ["¿La reacción es espontánea?", "sí", "no: se fuerza"],
          ["Energía", "la reacción produce corriente", "la corriente produce la reacción"],
          ["Ánodo", "oxidación, polo negativo", "oxidación, polo positivo"],
          ["Cátodo", "reducción, polo positivo", "reducción, polo negativo"],
          ["Sentido de los electrones", "del ánodo al cátodo", "del ánodo al cátodo"],
          ["Ejemplo", "pila de Daniell", "electrólisis del agua"],
        ],
        "Pila y electrólisis"
      ),
    ],
    quiz: [
      preg("En una pila, ¿en qué electrodo ocurre la oxidación?", ["En el ánodo", "En el cátodo", "En el puente salino", "En los dos"], 0, "Vocal con vocal: Ánodo–Oxidación. El cátodo es donde ocurre la reducción."),
      preg(`En la pila de Daniell (zinc y cobre), ¿cuál es el potencial estándar y cuál es el ánodo?`, [`${voltios(zncu.cV)} V y el ánodo es el zinc`, `${voltios(zncu.cV)} V y el ánodo es el cobre`, `${voltios(zncu.catodo.cV)} V y el ánodo es el zinc`, `${voltios(zncu.cV * 2)} V y el ánodo es el cobre`], 0, `E° = ${voltios(zncu.catodo.cV)} − (${voltios(zncu.anodo.cV)}) = ${voltios(zncu.cV)} V. El zinc es el de menor potencial de reducción, por eso se oxida y es el ánodo.`),
      preg("¿Por dónde viajan los electrones en una pila?", ["Por el cable, del ánodo al cátodo", "Por el puente salino, del cátodo al ánodo", "Por la solución, del cátodo al ánodo", "Por el cable, del cátodo al ánodo"], 0, "Los electrones salen del ánodo (donde se liberan por la oxidación) y llegan al cátodo (donde se consumen por la reducción). Los iones, en cambio, circulan por el puente salino."),
      preg("¿Para qué sirve el puente salino?", ["Cierra el circuito y mantiene neutras las dos soluciones", "Provee los electrones de la pila", "Es el electrodo donde ocurre la reducción", "Aumenta el potencial de la pila"], 0, "Por el puente se mueven iones: los aniones hacia el ánodo y los cationes hacia el cátodo, y así las soluciones no acumulan carga."),
      preg("¿Qué diferencia una electrólisis de una pila?", ["La electrólisis usa corriente externa para forzar una reacción no espontánea", "En la electrólisis no hay oxidación ni reducción", "En la electrólisis los electrones van del cátodo al ánodo por el cable", "La electrólisis produce energía y la pila la consume"], 0, "En la pila una reacción espontánea produce corriente; en la electrólisis la corriente produce una reacción que no ocurriría sola."),
      preg(`En la electrólisis del agua, ${ecuacionIonicaLatex(electrolisisAgua.global)} ¿qué volumen relativo de gases se obtiene en cada electrodo?`, ["El doble de H₂ (cátodo) que de O₂ (ánodo)", "El doble de O₂ (ánodo) que de H₂ (cátodo)", "Iguales", "Solo se obtiene O₂"], 0, "Por cada 2 H₂O se forman 2 H₂ y 1 O₂: la relación de volúmenes de gases, en las mismas condiciones, es 2 a 1."),
    ],
  },
];

function parPotencial(simbolo: string): number {
  return POTENCIALES.find((p) => p.simbolo === simbolo)!.cV;
}
