import type { TecnicaQuimia } from "./tipos";
import { cuadro, f, ion, preg } from "./ayudas";
import { ecu, oxTexto } from "./ayudasTanda2";
import {
  POTENCIALES,
  balancearSemirreaccion,
  desplaza,
  elementosQueCambian,
  electronesDelEjemplo,
  buscarEjemploRedox,
  serieDeActividad,
  t,
  type TerminoRedox,
} from "@/lib/quimia/redox";

// Técnicas del grupo "redox" (gratis, atajos cortos con visual y quiz):
// oxidar y reducir, calcular un número de oxidación, reconocer una reacción
// redox, balancear por electrones, ion-electrón (O, H, e⁻) y serie de
// actividad. Los números salen de src/lib/quimia/redox.ts (con su test) y las
// ecuaciones pasan por ecu(), que lanza si no están balanceadas en átomos y
// en carga.

// Reacciones analizadas en la Técnica "¿Es redox?": los elementos que
// cambian se CALCULAN (elementosQueCambian), no se escriben a mano.
interface ReaccionAnalizada {
  reactivos: [number, string][];
  productos: [number, string][];
}
const aT = (l: [number, string][]): TerminoRedox[] => l.map(([c, x]) => t(c, x));
const cambian = (r: ReaccionAnalizada): string[] => elementosQueCambian(aT(r.reactivos), aT(r.productos));

const HCL_NAOH: ReaccionAnalizada = { reactivos: [[1, "HCl"], [1, "NaOH"]], productos: [[1, "NaCl"], [1, "H2O"]] };
const PRECIPITACION: ReaccionAnalizada = { reactivos: [[1, "AgNO3"], [1, "NaCl"]], productos: [[1, "AgCl"], [1, "NaNO3"]] };
const CACO3: ReaccionAnalizada = { reactivos: [[1, "CaCO3"]], productos: [[1, "CaO"], [1, "CO2"]] };
const AGUA: ReaccionAnalizada = { reactivos: [[2, "H2O"]], productos: [[2, "H2"], [1, "O2"]] };
const ZN_HCL: ReaccionAnalizada = { reactivos: [[1, "Zn"], [2, "HCl"]], productos: [[1, "ZnCl2"], [1, "H2"]] };
const METANO: ReaccionAnalizada = { reactivos: [[1, "CH4"], [2, "O2"]], productos: [[1, "CO2"], [2, "H2O"]] };
const MG_HCL: ReaccionAnalizada = { reactivos: [[1, "Mg"], [2, "HCl"]], productos: [[1, "MgCl2"], [1, "H2"]] };
const NAOH_HNO3: ReaccionAnalizada = { reactivos: [[1, "NaOH"], [1, "HNO3"]], productos: [[1, "NaNO3"], [1, "H2O"]] };
const BACL2: ReaccionAnalizada = { reactivos: [[1, "BaCl2"], [1, "Na2SO4"]], productos: [[1, "BaSO4"], [2, "NaCl"]] };
const CAO_AGUA: ReaccionAnalizada = { reactivos: [[1, "CaO"], [1, "H2O"]], productos: [[1, "Ca(OH)2"]] };

const eqA = (r: ReaccionAnalizada) => ecu(r.reactivos, r.productos);
const filaAnalisis = (r: ReaccionAnalizada): string[] => {
  const c = cambian(r);
  return [eqA(r), c.length > 0 ? c.join(", ") : "ninguno", c.length > 0 ? "sí" : "no"];
};
// Comprobaciones de construcción: si un análisis no da lo esperado, el contenido no se genera.
const redox = (r: ReaccionAnalizada): boolean => cambian(r).length > 0;
if (!redox(ZN_HCL) || !redox(MG_HCL) || !redox(AGUA) || !redox(METANO)) throw new Error("Análisis redox inesperado");
if (redox(HCL_NAOH) || redox(PRECIPITACION) || redox(CACO3) || redox(NAOH_HNO3) || redox(BACL2) || redox(CAO_AGUA)) throw new Error("Análisis no redox inesperado");

// Cuentas del ion-electrón para el quiz (calculadas con el algoritmo).
const semi = (r: TerminoRedox[], p: TerminoRedox[]) => balancearSemirreaccion(r, p, "acido");
const mno4 = semi([t(1, "MnO4", -1)], [t(1, "Mn", 2)]);
const cr2o7 = semi([t(1, "Cr2O7", -2)], [t(2, "Cr", 3)]);
const no3 = semi([t(1, "NO3", -1)], [t(1, "NO")]);

const fe2o3 = buscarEjemploRedox("fe2o3-co")!;

const SERIE = serieDeActividad();
if (desplaza("Cu", "H") || !desplaza("Fe", "Cu") || !desplaza("Mg", "Zn") || desplaza("Ag", "Cu")) throw new Error("La serie de actividad no coincide con el texto de la Técnica");
const nombreDe = (s: string) => (s === "H" ? "hidrógeno" : POTENCIALES.find((p) => p.simbolo === s)!.nombre);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const TECNICAS_QUIMIA_REDOX: TecnicaQuimia[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "quimia-tecnica-redox-oxidar-reducir",
    grupo: "redox",
    orden: 1,
    requierePro: false,
    nombre: "Oxidar y reducir sin confundirse",
    descripcion: "Oxidarse es perder electrones y reducirse es ganarlos: cómo recordarlo, cómo verlo en el número de oxidación y quién es el agente.",
    pasos: [
      "Oxidarse es perder electrones y reducirse es ganarlos. Como los electrones tienen carga negativa, al perderlos el número de oxidación SUBE (se vuelve más positivo) y al ganarlos BAJA.",
      "Truco para recordarlo: «reducir» suena a bajar, y el número de oxidación baja cuando algo se reduce. Lo contrario, oxidarse, es subir.",
      `Nunca ocurre solo uno de los dos procesos: si algo pierde electrones, otra cosa los gana. Por eso se habla de reacciones redox (reducción y oxidación a la vez). Ejemplo: ${ecu([[1, "Zn"], [1, "Cu", 2]], [[1, "Zn", 2], [1, "Cu"]])} El zinc pasa de ${oxTexto("Zn", 0, "Zn")} a ${oxTexto("Zn", 2, "Zn")}: sube, pierde 2 electrones y se oxida. El cobre pasa de ${oxTexto("Cu", 2, "Cu")} a ${oxTexto("Cu", 0, "Cu")}: baja, gana 2 electrones y se reduce.`,
      "El agente oxidante es la sustancia que se REDUCE: le quita electrones a la otra y por eso la oxida. El agente reductor es la sustancia que se OXIDA: le da electrones a la otra y por eso la reduce. Suena al revés; para no confundirte, mira siempre primero qué le pasa a esa sustancia.",
      `En el ejemplo, el ${ion("Cu", 2)} es el agente oxidante (se reduce) y el zinc es el agente reductor (se oxida).`,
    ],
    visuales: [
      { tipo: "quimia.redox", despuesDePaso: 2, ejemplo: "zn-cu" },
      cuadro(
        3,
        ["", "Oxidación", "Reducción"],
        [
          ["Electrones", "se pierden", "se ganan"],
          ["Número de oxidación", "sube", "baja"],
          ["La sustancia", "se oxida", "se reduce"],
          ["Se llama", "agente reductor", "agente oxidante"],
        ],
        "Oxidación y reducción"
      ),
    ],
    quiz: [
      preg(
        `En la semirreacción $\\mathrm{Zn} \\rightarrow \\mathrm{Zn^{2+}} + 2\\,\\mathrm{e^{-}}$, ¿qué le pasa al zinc?`,
        ["Se oxida: pierde electrones y su número de oxidación sube", "Se reduce: gana electrones y su número de oxidación baja", "Se oxida: gana electrones y su número de oxidación sube", "No cambia: solo pasa de sólido a ion"],
        0,
        `El zinc pasa de ${oxTexto("Zn", 0, "Zn")} a ${oxTexto("Zn", 2, "Zn")}: el número sube porque pierde 2 electrones, y perder electrones es oxidarse.`
      ),
      preg(
        `Un átomo de manganeso pasa de ${oxTexto("KMnO4", 0, "Mn")} a ${oxTexto("Mn", 2, "Mn")}. ¿Qué ocurrió?`,
        ["Se redujo: ganó 5 electrones", "Se oxidó: perdió 5 electrones", "Se redujo: perdió 5 electrones", "Se oxidó: ganó 7 electrones"],
        0,
        `El número bajó de +7 a +2, o sea 5 unidades: cada átomo ganó 5 electrones, y ganar electrones es reducirse.`
      ),
      preg("¿Qué es un agente oxidante?", ["La sustancia que se reduce y hace que otra se oxide", "La sustancia que se oxida y hace que otra se reduzca", "Cualquier sustancia que contiene oxígeno", "El electrón que se transfiere"], 0, "El agente oxidante oxida a la otra sustancia quitándole electrones, y por eso él mismo se reduce."),
      preg(`En ${ecu([[1, "Zn"], [1, "Cu", 2]], [[1, "Zn", 2], [1, "Cu"]])} ¿cuál es el agente reductor?`, [f("Zn"), ion("Cu", 2), ion("Zn", 2), f("Cu")], 0, "El zinc es el que se oxida (cede los electrones), así que es el agente reductor."),
    ],
  },
  // ---------------------------------------------------------------- 2
  {
    slug: "quimia-tecnica-redox-calcular-numero",
    grupo: "redox",
    orden: 2,
    requierePro: false,
    nombre: "Calcular un número de oxidación en tres pasos",
    descripcion: "Anotar los números conocidos, plantear la suma y despejar la incógnita: el método para cualquier fórmula o ion.",
    pasos: [
      "Paso 1: anota los números que ya conoces, en este orden de prioridad: el flúor es −1; los metales alcalinos son +1 y los alcalinotérreos +2; el oxígeno es −2 y el hidrógeno es +1. El oxígeno (peróxidos) y el hidrógeno (hidruros) tienen excepciones.",
      "Paso 2: plantea la suma. Cada número se multiplica por la cantidad de átomos de ese elemento, y el total tiene que dar la carga: 0 si la especie es neutra, o la carga del ion.",
      `Paso 3: despeja la incógnita. Manganeso en ${f("KMnO4")}: (+1) + x + 4·(−2) = 0, así que x = ${oxTexto("KMnO4", 0, "Mn")}.`,
      `Con un ion se hace igual, pero la suma da la carga del ion. Cromo en ${ion("Cr2O7", -2)}: 2x + 7·(−2) = −2, así que x = ${oxTexto("Cr2O7", -2, "Cr")}.`,
      "Comprueba siempre volviendo a sumar. Si la incógnita no da un número entero, revisa: o hay un error de cuenta o es una excepción (como un peróxido).",
    ],
    visuales: [
      { tipo: "quimia.oxidacion", despuesDePaso: 2, formula: "KMnO4", incognita: "Mn" },
      { tipo: "quimia.oxidacion", despuesDePaso: 3, formula: "Cr2O7", carga: -2, incognita: "Cr" },
    ],
    quiz: [
      preg(`¿Qué número de oxidación tiene el fósforo en ${f("H3PO4")}?`, ["+3", "+5", "−3", "+7"], 1, `3·(+1) + x + 4·(−2) = 0, así que x = ${oxTexto("H3PO4", 0, "P")}.`),
      preg(`¿Qué número de oxidación tiene el cloro en el ion ${ion("ClO3", -1)}?`, ["+1", "+3", "+5", "+7"], 2, `x + 3·(−2) = −1, así que x = ${oxTexto("ClO3", -1, "Cl")}.`),
      preg(`¿Qué número de oxidación tiene el manganeso en ${f("MnO2")}?`, ["+2", "+4", "+6", "+7"], 1, `x + 2·(−2) = 0, así que x = ${oxTexto("MnO2", 0, "Mn")}.`),
      preg(`En el ion ${ion("SO4", -2)}, la suma de los números de oxidación tiene que dar...`, ["0", "−2", "+6", "−8"], 1, "Cuando la especie es un ion, la suma de los números de oxidación es la carga del ion, no cero. Aquí: (+6) + 4·(−2) = −2."),
    ],
  },
  // ---------------------------------------------------------------- 3
  {
    slug: "quimia-tecnica-redox-es-redox",
    grupo: "redox",
    orden: 3,
    requierePro: false,
    nombre: "¿Es redox? Busca el cambio de número",
    descripcion: "Una reacción es redox si el número de oxidación de algún elemento cambia: cómo comprobarlo rápido.",
    pasos: [
      "Una reacción es redox cuando el número de oxidación de algún elemento cambia. Si todos los elementos conservan su número, no es redox.",
      "Pistas rápidas: si un elemento libre (Zn, O₂, Cl₂, H₂...) aparece o desaparece, es redox, porque un elemento libre siempre tiene número 0 y al combinarse cambia. Las neutralizaciones (ácido más base), las precipitaciones y los intercambios de iones no son redox.",
      "Para estar seguro, calcula los números de los elementos sospechosos a los dos lados. La tabla muestra seis reacciones ya analizadas.",
      `Las descomposiciones pueden ser o no redox: ${eqA(CACO3)} no lo es (ningún número cambia), pero ${eqA(AGUA)} sí (aparecen elementos libres).`,
    ],
    visuales: [
      cuadro(2, ["Reacción", "Elementos que cambian", "¿Redox?"], [HCL_NAOH, PRECIPITACION, CACO3, AGUA, ZN_HCL, METANO].map(filaAnalisis), "Seis reacciones, analizadas"),
    ],
    quiz: [
      preg(
        "¿Cuál de estas reacciones es redox?",
        [eqA(NAOH_HNO3), eqA(BACL2), eqA(MG_HCL), eqA(CAO_AGUA)],
        2,
        `En ${eqA(MG_HCL)} cambian ${cambian(MG_HCL).join(" y ")}: el magnesio pasa de 0 a +2 y el hidrógeno de +1 a 0. En las otras tres ningún número cambia.`
      ),
      preg("En una reacción de neutralización (ácido más base), ¿cambian los números de oxidación?", ["No: es una reacción sin transferencia de electrones", "Sí: el hidrógeno siempre se reduce", "Sí: el oxígeno siempre se oxida", "Depende del ácido, pero siempre cambia alguno"], 0, `En ${eqA(HCL_NAOH)} el hidrógeno sigue en +1, el cloro en −1, el sodio en +1 y el oxígeno en −2.`),
      preg(`¿Es redox ${eqA(CACO3)}?`, ["Sí: el carbono se reduce", "Sí: se libera CO₂", "No: ningún número de oxidación cambia", "No: porque no hay oxígeno libre y eso basta para descartarla siempre"], 2, "Calcio +2, carbono +4 y oxígeno −2 en los dos lados: no hay transferencia de electrones. Que se libere un gas no significa que sea redox."),
      preg("¿Qué pista rápida indica que una reacción probablemente es redox?", ["Aparece o desaparece un elemento libre (como Zn, O₂ o H₂)", "Hay un ácido entre los reactivos", "Se forma un precipitado", "Los reactivos son líquidos"], 0, "Un elemento libre tiene número de oxidación 0; si aparece como producto (o desaparece como reactivo) su número cambió."),
    ],
  },
  // ---------------------------------------------------------------- 4
  {
    slug: "quimia-tecnica-redox-balanceo-electrones",
    grupo: "redox",
    orden: 4,
    requierePro: false,
    nombre: "Balancear por electrones: el truco de la cruz",
    descripcion: "Igualar los electrones que se pierden con los que se ganan y completar el resto por tanteo.",
    pasos: [
      "En una reacción redox los electrones que se pierden son los mismos que se ganan. Balancear es hacer que esa cuenta cierre.",
      `Paso 1: calcula los números y anota cuánto cambia cada elemento. Ejemplo: $\\mathrm{Fe_2O_3} + \\mathrm{CO} \\rightarrow \\mathrm{Fe} + \\mathrm{CO_2}$. El hierro baja de ${oxTexto("Fe2O3", 0, "Fe")} a 0: gana 3 electrones por átomo y hay 2 átomos, o sea ${fe2o3.reduce.n * (fe2o3.reduce.de - fe2o3.reduce.a)} electrones por cada ${f("Fe2O3")}. El carbono sube de ${oxTexto("CO", 0, "C")} a ${oxTexto("CO2", 0, "C")}: pierde ${fe2o3.oxida.a - fe2o3.oxida.de} electrones por átomo.`,
      `Paso 2: la cruz. Los electrones totales tienen que ser iguales: 6 se ganan por cada ${f("Fe2O3")} y 2 se pierden por cada CO. El mínimo común múltiplo es 6, así que hacen falta 3 CO por cada ${f("Fe2O3")}.`,
      `Paso 3: completa los coeficientes que faltan por tanteo, en este orden: metales, no metales y, al final, hidrógeno y oxígeno. Resultado: ${ecu([[1, "Fe2O3"], [3, "CO"]], [[2, "Fe"], [3, "CO2"]])}`,
      "Paso 4: verifica que haya la misma cantidad de átomos de cada elemento a los dos lados (y la misma carga si hay iones). Si no cierra, revisa los coeficientes.",
    ],
    visuales: [{ tipo: "quimia.redox", despuesDePaso: 3, ejemplo: "fe2o3-co" }],
    quiz: [
      preg(`En ${ecu([[1, "Fe2O3"], [3, "CO"]], [[2, "Fe"], [3, "CO2"]])} ¿cuántos electrones se transfieren por cada ${f("Fe2O3")}?`, ["2", "3", "6", "12"], 2, `Los 2 hierros bajan de +3 a 0: 2 × 3 = ${electronesDelEjemplo(fe2o3).ganados} electrones ganados. Los 3 CO suben de +2 a +4: 3 × 2 = ${electronesDelEjemplo(fe2o3).perdidos} electrones perdidos.`),
      preg(`En la reacción del permanganato con el ácido clorhídrico, el manganeso pasa de ${oxTexto("KMnO4", 0, "Mn")} a ${oxTexto("MnCl2", 0, "Mn", { Cl: -1 })}. ¿Cuántos electrones gana cada átomo de manganeso?`, ["2", "5", "7", "9"], 1, "El número baja de +7 a +2: 5 unidades, o sea 5 electrones por átomo."),
      preg("Una sustancia A pierde 2 electrones por unidad y una sustancia B gana 3 electrones por unidad. ¿En qué proporción reaccionan para que los electrones coincidan?", ["3 de A por cada 2 de B", "2 de A por cada 3 de B", "1 de A por cada 1 de B", "5 de A por cada 1 de B"], 0, "El mínimo común múltiplo de 2 y 3 es 6: 3 unidades de A pierden 6 electrones y 2 unidades de B ganan 6 electrones."),
      preg("Al completar el balanceo por tanteo, ¿qué elementos conviene dejar para el final?", ["El hidrógeno y el oxígeno", "Los metales", "Los que cambian de número de oxidación", "El elemento que aparece en más sustancias"], 0, "Los metales y los no metales se ajustan primero; el hidrógeno y el oxígeno suelen aparecer en varias sustancias (como el agua) y se ajustan al final."),
    ],
  },
  // ---------------------------------------------------------------- 5
  {
    slug: "quimia-tecnica-redox-ion-electron-ohe",
    grupo: "redox",
    orden: 5,
    requierePro: false,
    nombre: "Ion-electrón: el orden O, H, e⁻",
    descripcion: "Balancear una semirreacción en medio ácido siguiendo siempre el mismo orden: oxígenos, hidrógenos y cargas.",
    pasos: [
      "El método ion-electrón divide la reacción en dos semirreacciones (una de oxidación y una de reducción) y balancea cada una por separado. Esta Técnica es para medio ácido.",
      "Recuerda el orden con las letras O, H, e: primero los Oxígenos con H₂O, después los Hidrógenos con H⁺ y al final las cargas con electrones (e⁻).",
      `Ejemplo: ${ion("MnO4", -1)} → ${ion("Mn", 2)}. Oxígenos: hay 4 a la izquierda, así que se agregan ${mno4.conAgua.agregadas} H₂O a la derecha. Hidrógenos: ahora hay 8 a la derecha, así que se agregan ${mno4.conProtones.agregados} H⁺ a la izquierda. Cargas: −1 + 8 = +7 a la izquierda y +2 a la derecha; los electrones van del lado con más carga positiva, o sea ${mno4.conElectrones.electrones} e⁻ a la izquierda.`,
      `Cuando las dos semirreacciones están listas, se multiplican para igualar los electrones, se suman y se simplifican. Con el ${ion("Fe", 2)} da: ${ecu([[1, "MnO4", -1], [5, "Fe", 2], [8, "H", 1]], [[1, "Mn", 2], [5, "Fe", 3], [4, "H2O"]])}`,
    ],
    visuales: [{ tipo: "quimia.balanceo", despuesDePaso: 3, caso: "mno4-fe2" }],
    quiz: [
      preg(`Al balancear ${ion("Cr2O7", -2)} → ${ion("Cr", 3)} (con 2 Cr a la derecha) en medio ácido, ¿cuántos H₂O hacen falta?`, ["3", "5", "7", "14"], 2, `Hay 7 oxígenos a la izquierda, así que se agregan ${cr2o7.conAgua.agregadas} H₂O a la derecha.`),
      preg(`En la misma semirreacción, ¿cuántos H⁺ hacen falta después de agregar el agua?`, ["7", "12", "14", "16"], 2, `Los 7 H₂O aportan 14 hidrógenos a la derecha, así que se agregan ${cr2o7.conProtones.agregados} H⁺ a la izquierda.`),
      preg(`¿Cuántos electrones tiene la semirreacción ${ion("Cr2O7", -2)} → 2${ion("Cr", 3)} balanceada?`, ["3", "4", "6", "12"], 2, `A la izquierda: −2 + 14 = +12; a la derecha: +6. Se agregan ${cr2o7.conElectrones.electrones} e⁻ a la izquierda (el lado más positivo).`),
      preg(`Para ${ion("NO3", -1)} → NO en medio ácido, ¿qué se agrega?`, ["2 H₂O, 4 H⁺ y 3 e⁻", "1 H₂O, 2 H⁺ y 1 e⁻", "3 H₂O, 6 H⁺ y 3 e⁻", "2 H₂O, 2 H⁺ y 5 e⁻"], 0, `Oxígenos: 3 a la izquierda y 1 a la derecha, así que ${no3.conAgua.agregadas} H₂O a la derecha. Hidrógenos: ${no3.conProtones.agregados} H⁺ a la izquierda. Cargas: −1 + 4 = +3 contra 0, así que ${no3.conElectrones.electrones} e⁻ a la izquierda.`),
    ],
  },
  // ---------------------------------------------------------------- 6
  {
    slug: "quimia-tecnica-redox-serie-actividad",
    grupo: "redox",
    orden: 6,
    requierePro: false,
    nombre: "Serie de actividad: quién desplaza a quién",
    descripcion: "Ordenar los metales por su facilidad para oxidarse y predecir si un metal desplaza a otro o reacciona con un ácido.",
    pasos: [
      "Los metales se ordenan en una serie de actividad según su facilidad para oxidarse. Arriba están los más reactivos (K, Ca, Na, Mg, Al) y abajo los menos reactivos (Cu, Ag, Au). El hidrógeno se ubica en medio, como referencia.",
      `Regla del desplazamiento: un metal desplaza de una solución al catión de cualquier metal que esté DEBAJO de él en la serie. Zn + CuSO₄ sí reacciona (el zinc está arriba del cobre): ${ecu([[1, "Zn"], [1, "Cu", 2]], [[1, "Zn", 2], [1, "Cu"]])} En cambio, Cu + ZnSO₄ no reacciona.`,
      `Regla de los ácidos: los metales que están arriba del hidrógeno reaccionan con los ácidos comunes (como el clorhídrico) y desprenden H₂: ${ecu([[1, "Zn"], [2, "H", 1]], [[1, "Zn", 2], [1, "H2"]])} Los que están debajo (Cu, Ag, Au) no reaccionan con estos ácidos.`,
      "El orden exacto puede variar un poco entre libros (por ejemplo, entre el sodio y el calcio). Aquí se usa el que sale de los potenciales estándar de reducción, que se ven en la Clase de serie de actividad y potenciales.",
    ],
    visuales: [
      cuadro(
        0,
        ["Lugar", "Elemento", "¿Reacciona con un ácido como el HCl?"],
        SERIE.map((x, i) => [String(i + 1), cap(nombreDe(x.simbolo)) + (x.simbolo === "H" ? " (referencia)" : ` (${x.simbolo})`), x.simbolo === "H" ? "—" : desplaza(x.simbolo, "H") ? "sí" : "no"]),
        "Serie de actividad (de más a menos reactivo)"
      ),
    ],
    quiz: [
      preg(`¿Reacciona el cobre con el ácido clorhídrico diluido?`, ["No: el cobre está debajo del hidrógeno en la serie", "Sí: todos los metales reaccionan con los ácidos", "Sí: desprende hidrógeno", "Solo si se calienta mucho"], 0, "El cobre está debajo del hidrógeno en la serie, así que no lo desplaza de un ácido: no reacciona."),
      preg("¿Cuál de estos metales desplaza al cobre de una solución de sulfato de cobre (II)?", ["Plata", "Oro", "Hierro", "Ninguno"], 2, "El hierro está arriba del cobre en la serie, así que lo desplaza. La plata y el oro están debajo."),
      preg("¿Cuál de estos metales es el más reactivo?", ["Cobre", "Plata", "Zinc", "Magnesio"], 3, "En la serie, el magnesio está más arriba que el zinc, el cobre y la plata: es el que se oxida con más facilidad."),
      preg(`¿Qué ocurre al poner un trozo de plata en una solución que contiene ${ion("Cu", 2)}?`, ["No hay reacción: la plata está debajo del cobre", "La plata desplaza al cobre", "Se forma hidrógeno", "La solución se vuelve más ácida"], 0, "Solo desplaza el metal que está más arriba. La plata está debajo del cobre, así que no lo desplaza."),
    ],
  },
];
