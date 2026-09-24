import type { ClaseQuimia } from "./tipos";
import { cfg, cuadro, en, preg } from "./ayudas";
import { condM, comunM, ecu, formM, molM, nomM, NomM, oxTexto } from "./ayudasTanda2";
import { ISOMEROS_ALCANOS, LONGITUD_ENLACE_PM, PUNTO_EBULLICION_C, fichaDe, INFO_GRUPO } from "@/lib/quimia/moleculas";
import { desdeSmiles, formulaMolecular, hibridacionDe, nombreIUPAC, tipoDeCarbono } from "@/lib/quimia/organica";
import { formulaLatex } from "@/lib/quimia/formulas";

// Clases del grupo "organica" (Pro): el carbono y sus enlaces, formas de
// escribir una molécula, alcanos y su nomenclatura, alquenos y alquinos,
// cíclicos y aromáticos, compuestos oxigenados, ácidos/ésteres/nitrogenados/
// haluros, isomería, reacciones básicas, y glucosa y polímeros. Todos los
// nombres, fórmulas, hibridaciones y tipos de carbono salen del catálogo
// calculado (src/lib/quimia/moleculas.ts + organica.ts, con su test contra una
// tabla curada y contra el banco de la práctica); las ecuaciones pasan por
// ecu(), que lanza si no están balanceadas en átomos y en carga.
//
// SIMPLIFICACIONES de nivel colegio (marcadas en las lecciones): la regla de
// cadena principal es la que da prioridad al grupo y a los enlaces múltiples
// (la IUPAC 2013 prioriza la longitud), la hibridación es un modelo (no se
// mide), se usan nombres comunes aceptados (ácido acético, acetona) junto a
// los IUPAC, y la isomería óptica queda fuera.

const F = (id: string) => fichaDe(id);
const mol = (id: string) => F(id).molecula;
const grupoId = (id: string) => F(id).grupos.map((g) => g.id);
const sinAno = (id: string) => nomM(id).replace(/ano$/, "");
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
// Fórmula empírica: la molecular dividida por el máximo común divisor.
const empirica = (id: string): string => {
  const cont = formulaMolecular(mol(id));
  const g = Object.values(cont).reduce((a, b) => gcd(a, b));
  const orden = Object.keys(cont).sort((a, b) => (a === "C" ? -1 : b === "C" ? 1 : a === "H" ? -1 : b === "H" ? 1 : a.localeCompare(b)));
  return orden.map((s) => `${s}${cont[s] / g > 1 ? cont[s] / g : ""}`).join("");
};
const ALCANOS = ["metano", "etano", "propano", "butano", "pentano", "hexano", "heptano", "octano", "nonano", "decano"];
const HIB = (id: string, i = 0) => hibridacionDe(mol(id), i);
const geometria: Record<string, string> = { sp3: "tetraédrica", sp2: "trigonal plana", sp: "lineal" };
const textoAngulo = (h: "sp3" | "sp2" | "sp") => (h === "sp3" ? "109,5°" : h === "sp2" ? "≈ 120°" : "180°");
const subH = (h: string) => (h === "sp3" ? "$\\mathrm{sp^{3}}$" : h === "sp2" ? "$\\mathrm{sp^{2}}$" : "$\\mathrm{sp}$");
const punto = (id: string) => `${PUNTO_EBULLICION_C[id] < 0 ? "−" : ""}${Math.abs(PUNTO_EBULLICION_C[id])} °C`;
// Radical CnH2n+1 en LaTeX.
const radical = (n: number) => `$${formulaLatex(`C${n}H${2 * n + 1}`)}$`;

// Comprobaciones de construcción de afirmaciones que las Clases hacen sobre datos.
const debe = (cond: boolean, msg: string) => {
  if (!cond) throw new Error(`Clase de orgánica: ${msg}`);
};
debe(nombreIUPAC(desdeSmiles("CC(CC)CC")) === "3-metilpentano", "2-etilbutano debería llamarse 3-metilpentano");
debe(nombreIUPAC(desdeSmiles("CC(C)(C)CC(C)C")) === "2,2,4-trimetilpentano", "isooctano");
debe(F("glucosa-abierta").grupos.filter((g) => g.id === "alcohol").length === 5 && F("glucosa-abierta").grupos.filter((g) => g.id === "aldehido").length === 1, "la glucosa tiene 5 alcoholes y 1 aldehído");
debe(PUNTO_EBULLICION_C.etanol > PUNTO_EBULLICION_C.metoximetano && PUNTO_EBULLICION_C.butano > PUNTO_EBULLICION_C["2-metilpropano"], "puntos de ebullición");
// unidad de repetición del almidón y la celulosa: glucosa menos una molécula de agua
const glucosa = formulaMolecular(mol("glucosa-abierta"));
debe(glucosa.C === 6 && glucosa.H === 12 && glucosa.O === 6, "fórmula de la glucosa");

// Conteo de tipos de carbono del 2,2,4-trimetilpentano.
const tiposIso: Record<string, number> = { primario: 0, secundario: 0, terciario: 0, cuaternario: 0 };
mol("2,2,4-trimetilpentano").atomos.forEach((_, i) => {
  const t = tipoDeCarbono(mol("2,2,4-trimetilpentano"), i);
  if (t) tiposIso[t]++;
});

export const CLASES_QUIMIA_ORGANICA: ClaseQuimia[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "quimia-clase-organica-carbono",
    grupo: "organica",
    orden: 1,
    requierePro: true,
    nombre: "El carbono y sus enlaces",
    descripcion: "Por qué el carbono forma tantos compuestos: tetravalencia, enlaces simples, dobles y triples, hibridación sp³, sp² y sp, y tipos de carbono.",
    pasos: [
      "La química orgánica estudia los compuestos del carbono. Casi todas las sustancias de los seres vivos (azúcares, grasas, proteínas, ADN) son orgánicas, y también los combustibles, los plásticos, los medicamentos y las fibras textiles. Además del carbono, casi siempre tienen hidrógeno, y muchas veces oxígeno, nitrógeno, azufre, fósforo o halógenos. Por tradición, unos pocos compuestos del carbono se estudian como inorgánicos: los óxidos (CO, CO₂), los carbonatos (CaCO₃) y los cianuros.",
      `¿Por qué el carbono? Tiene 4 electrones de valencia (su configuración es ${cfg(6)}), una electronegatividad intermedia (${en("C")}, ni muy baja ni muy alta) y un tamaño pequeño. Eso le permite formar 4 enlaces covalentes fuertes con otros átomos, incluso con otros carbonos, y por eso arma cadenas y anillos casi ilimitados (esta propiedad se llama concatenación).`,
      `Tetravalencia: en casi todos sus compuestos, el carbono forma 4 enlaces (cada enlace covalente comparte un par de electrones). Pueden ser cuatro enlaces simples, dos simples y uno doble, uno simple y uno triple, o dos dobles; la suma siempre da 4. En el ${nomM("propano")}, ${condM("propano")}, cada carbono tiene sus 4 enlaces: los carbonos de los extremos se unen a un carbono y a 3 hidrógenos, y el del medio a dos carbonos y a 2 hidrógenos.`,
      `Entre dos carbonos puede haber un enlace simple (C–C), doble (C=C) o triple (C≡C). Cuantos más enlaces, más corto y más fuerte es el conjunto: aproximadamente ${LONGITUD_ENLACE_PM.simple} pm el simple, ${LONGITUD_ENLACE_PM.doble} pm el doble y ${LONGITUD_ENLACE_PM.triple} pm el triple (1 pm es $10^{-12}$ m). Pero los enlaces múltiples son más reactivos, como se verá enseguida.`,
      "Un enlace doble o triple no es solo «más de lo mismo»: tiene un enlace σ (sigma), que se forma por solapamiento frontal de orbitales y une los dos átomos, y uno (doble) o dos (triple) enlaces π (pi), que se forman por solapamiento lateral. Los enlaces π son más débiles y más accesibles, y por eso los dobles y triples reaccionan con más facilidad que los simples.",
      `Hibridación (un modelo de nivel colegio). El carbono tiene un orbital s y tres p, pero forma 4 enlaces iguales: para explicarlo se dice que mezcla sus orbitales. Con 4 enlaces σ el carbono es sp³ (mezcla 1 s y 3 p), con geometría tetraédrica y ángulos de ${textoAngulo("sp3")}. Ejemplo: el ${nomM("metano")}, ${formM("metano")}: 4 enlaces σ y 0 π, hibridación ${subH(HIB("metano").hibridacion)}. El dibujo es plano: la cuña indica un enlace que sale hacia adelante y la línea punteada, uno que va hacia atrás.`,
      `Con 3 enlaces σ (y 1 π) el carbono es sp² (mezcla 1 s y 2 p): geometría trigonal plana, ángulos de ${textoAngulo("sp2")}. Ejemplo: el ${nomM("eteno")}, ${formM("eteno")}: cada carbono tiene ${HIB("eteno").sigma} enlaces σ y ${HIB("eteno").pi} π, hibridación ${subH(HIB("eteno").hibridacion)}, y los seis átomos están en un mismo plano. También son sp² los carbonos del benceno y el carbono de un grupo C=O.`,
      `Con 2 enlaces σ (y 2 π) el carbono es sp (mezcla 1 s y 1 p): geometría lineal, ángulo de ${textoAngulo("sp")}. Ejemplo: el ${nomM("etino")}, ${formM("etino")}: cada carbono tiene ${HIB("etino").sigma} enlaces σ y ${HIB("etino").pi} π, hibridación ${subH(HIB("etino").hibridacion)}, y los cuatro átomos quedan en línea.`,
      "Resumen, calculado de la conectividad de cada molécula: el número de enlaces σ del carbono (contando los de hidrógeno) determina la hibridación.",
      `Tipos de carbono según a cuántos carbonos está unido: primario (1), secundario (2), terciario (3) y cuaternario (4). En el ${nomM("2,2,4-trimetilpentano")} (${condM("2,2,4-trimetilpentano")}) hay ${tiposIso.primario} carbonos primarios, ${tiposIso.secundario} secundario, ${tiposIso.terciario} terciario y ${tiposIso.cuaternario} cuaternario. Además, las cadenas pueden ser lineales, ramificadas o cíclicas, y saturadas (solo enlaces simples) o insaturadas (con dobles o triples).`,
      "Errores frecuentes: creer que el carbono puede tener más de 4 enlaces (al contar, un doble vale 2 y un triple 3); confundir la hibridación con la forma de la molécula entera (la hibridación es de cada carbono); pensar que los dibujos planos son la forma real de la molécula; y olvidar que CO₂ y los carbonatos se estudian como inorgánicos.",
    ],
    visuales: [
      { tipo: "quimia.cadena", despuesDePaso: 2, molecula: "propano", modo: "formulas" },
      { tipo: "quimia.hibridacion", despuesDePaso: 5, molecula: "metano" },
      { tipo: "quimia.hibridacion", despuesDePaso: 6, molecula: "eteno" },
      { tipo: "quimia.hibridacion", despuesDePaso: 7, molecula: "etino" },
      cuadro(
        8,
        ["Molécula", "Enlaces σ del carbono", "Enlaces π", "Hibridación", "Ángulo", "Geometría"],
        ["metano", "eteno", "etino", "benceno"].map((id) => {
          const h = HIB(id);
          return [`${NomM(id)} (${formM(id)})`, String(h.sigma), String(h.pi), subH(h.hibridacion), textoAngulo(h.hibridacion), geometria[h.hibridacion]];
        }),
        "Hibridación del carbono"
      ),
    ],
    quiz: [
      preg("¿Cuántos enlaces forma el carbono en casi todos sus compuestos?", ["4", "2", "3", "6"], 0, "El carbono es tetravalente: forma 4 enlaces. Un doble enlace cuenta como 2 y un triple como 3."),
      preg(`¿Qué hibridación tienen los carbonos del ${nomM("eteno")}?`, ["sp²", "sp³", "sp", "No tienen hibridación"], 0, `Cada carbono tiene ${HIB("eteno").sigma} enlaces σ (2 con hidrógeno y 1 con el otro carbono) y 1 π: es sp², con geometría trigonal plana.`),
      preg("¿Cuántos enlaces σ y π tiene un enlace triple entre dos carbonos?", ["1 σ y 2 π", "2 σ y 1 π", "3 σ", "3 π"], 0, "Todo enlace múltiple tiene un solo σ (el que une los átomos); los demás son π. El triple es 1 σ y 2 π."),
      preg("¿Cuál es el ángulo entre los enlaces de un carbono sp³, como en el metano?", ["109,5°", "120°", "180°", "90°"], 0, "Los cuatro enlaces se reparten en un tetraedro: 109,5°. El sp² tiene ≈120° y el sp, 180°."),
      preg(`En ${condM("2-metilpropano")}, ¿qué tipo de carbono es el carbono central?`, ["Terciario", "Primario", "Secundario", "Cuaternario"], 0, "El carbono central está unido a 3 carbonos (los tres metilos): es terciario."),
      preg("¿Cuál de estas sustancias se estudia tradicionalmente como inorgánica, aunque tiene carbono?", ["El dióxido de carbono, CO₂", "El metano, CH₄", "El etanol, C₂H₅OH", "El benceno, C₆H₆"], 0, "El CO₂, los carbonatos y los cianuros son las excepciones tradicionales: contienen carbono pero se estudian con la química inorgánica."),
    ],
  },
  // ---------------------------------------------------------------- 2
  {
    slug: "quimia-clase-organica-formulas",
    grupo: "organica",
    orden: 2,
    requierePro: true,
    nombre: "Formas de escribir una molécula orgánica",
    descripcion: "Fórmula molecular, empírica, desarrollada, semidesarrollada (condensada) y de esqueleto, y cómo pasar de una a otra.",
    pasos: [
      "Una misma molécula se puede describir con distintas fórmulas, según cuánta información se quiera dar: molecular, empírica, desarrollada, semidesarrollada (o condensada) y de esqueleto. Los libros no siempre usan los mismos nombres para las dos últimas; en la práctica de Prodigia, por ejemplo, se muestra la fórmula estructural condensada (como CH₃–CH₂–OH).",
      `La fórmula molecular dice cuántos átomos de cada elemento hay: el ${nomM("etanol")} es ${formM("etanol")}. No dice cómo están unidos, y por eso puede corresponder a más de un compuesto: el ${nomM("metoximetano")} (éter dimetílico) también es ${formM("metoximetano")}.`,
      `La fórmula empírica (o mínima) es la proporción más simple de átomos: se divide la molecular por su máximo común divisor. Sirve para comparar compuestos, pero no dice la molécula real: el ${nomM("etano")} es ${formM("etano")} y su fórmula empírica es $${formulaLatex(empirica("etano"))}$, que no existe como molécula estable.`,
      `La fórmula desarrollada muestra todos los átomos y todos los enlaces (una línea por enlace). El ${nomM("etanol")} tiene ${mol("etanol").enlaces.length + (formulaMolecular(mol("etanol")).H ?? 0)} enlaces: ${mol("etanol").enlaces.length} entre átomos que no son hidrógeno (C–C y C–O) y ${formulaMolecular(mol("etanol")).H} con hidrógeno (5 C–H y 1 O–H). Es completa pero larga, por eso casi siempre se usa una versión abreviada.`,
      `La fórmula semidesarrollada (o condensada) agrupa cada carbono con sus hidrógenos y deja los enlaces entre carbonos. Las ramificaciones se escriben entre paréntesis. Es la que más se usa para nombrar compuestos.`,
      "La fórmula de esqueleto (o «de líneas») es el dibujo en zigzag: cada vértice y cada extremo es un carbono, cada línea es un enlace, los hidrógenos unidos a carbono no se dibujan y los demás átomos (O, N, halógenos) sí. Es muy práctica, pero hay que completar mentalmente los hidrógenos hasta 4 enlaces por carbono. Es un esquema plano de la conectividad, no la forma real de la molécula.",
      `Para pasar de una a otra, sigue el orden: esqueleto, condensada y molecular. Ejemplo con el ${nomM("2-metilbutano")}: en el esqueleto hay 5 vértices (5 carbonos); completando los hidrógenos queda ${condM("2-metilbutano")}; y al sumar los hidrógenos, ${formM("2-metilbutano")}.`,
      "¿Cuál conviene? La molecular sirve para contar átomos y calcular masas. La condensada, para nombrar y reconocer grupos. El esqueleto, para dibujar rápido moléculas grandes. La desarrollada, para ver cada enlace. Y la empírica, para comparar composiciones.",
      "Errores frecuentes: creer que una fórmula molecular identifica un solo compuesto (los isómeros comparten la molecular); confundir la empírica con la molecular (el benceno es C₆H₆, no CH); olvidar los hidrógenos al leer un esqueleto; y no cerrar los paréntesis de las ramificaciones al escribir la condensada.",
    ],
    visuales: [
      cuadro(
        2,
        ["Compuesto", "Fórmula molecular", "Fórmula empírica"],
        ([["etano", NomM("etano")], ["eteno", NomM("eteno")], ["etino", NomM("etino")], ["benceno", NomM("benceno")], ["butano", NomM("butano")], ["acido-etanoico", `${NomM("acido-etanoico")} (ácido acético)`], ["glucosa-abierta", "Glucosa"]] as [string, string][]).map(([id, etiqueta]) => [etiqueta, formM(id), `$${formulaLatex(empirica(id))}$`]),
        "De la fórmula molecular a la empírica"
      ),
      cuadro(
        4,
        ["Compuesto", "Fórmula semidesarrollada"],
        ["etanol", "propan-2-ol", "2-metilbutano", "propanona", "acido-etanoico", "etanoato-de-etilo"].map((id) => [NomM(id), condM(id)]),
        "Fórmulas condensadas"
      ),
      { tipo: "quimia.cadena", despuesDePaso: 5, molecula: "propan-2-ol", modo: "formulas" },
      { tipo: "quimia.cadena", despuesDePaso: 6, molecula: "2-metilbutano", modo: "formulas" },
      cuadro(
        7,
        ["Fórmula", "Qué muestra", `Ejemplo: ${nomM("etanol")}`],
        [
          ["Molecular", "cuántos átomos de cada elemento", formM("etanol")],
          ["Empírica", "la proporción más simple", `$${formulaLatex(empirica("etanol"))}$`],
          ["Desarrollada", "todos los átomos y todos los enlaces", "8 enlaces"],
          ["Semidesarrollada", "cada carbono con sus hidrógenos", condM("etanol")],
          ["Esqueleto", "solo el esqueleto de carbonos", "zigzag de 2 vértices y OH"],
        ],
        "Las cinco formas"
      ),
    ],
    quiz: [
      preg(`¿Cuál es la fórmula empírica de la glucosa, ${formM("glucosa-abierta")}?`, [`$${formulaLatex(empirica("glucosa-abierta"))}$`, "$\\mathrm{CHO}$", `$${formulaLatex("C2H4O2")}$`, `$${formulaLatex("C3H6O3")}$`], 0, "Se divide por el máximo común divisor (6): C₁H₂O₁ se escribe CH₂O. También es la empírica del ácido etanoico."),
      preg(`¿Cuántos hidrógenos tiene ${condM("2-metilbutano")}?`, ["12", "10", "14", "8"], 0, `Los tres metilos aportan 9, el CH₂ aporta 2 y el CH aporta 1: ${molM("2-metilbutano")}.`),
      preg(`La fórmula molecular ${formM("etanol")} corresponde a...`, ["Al menos dos compuestos distintos: el etanol y el metoximetano", "Solo al etanol", "Solo al metoximetano", "A un alcano"], 0, "La molecular no dice cómo están unidos los átomos: el etanol (un alcohol) y el metoximetano (un éter) son isómeros con la misma fórmula."),
      preg("En una fórmula de esqueleto, ¿qué representa cada vértice y cada extremo?", ["Un átomo de carbono", "Un átomo de hidrógeno", "Un enlace doble", "Un grupo funcional"], 0, "Cada vértice y cada extremo es un carbono; los hidrógenos unidos a carbono no se dibujan."),
      preg(`¿Cuál es la fórmula empírica del benceno, ${formM("benceno")}?`, ["$\\mathrm{CH}$", "$\\mathrm{C_6H_6}$", "$\\mathrm{C_2H_2}$", "$\\mathrm{C_3H_3}$"], 0, "Se divide por 6: C₁H₁ se escribe CH. La molecular sigue siendo C₆H₆."),
    ],
  },
  // ---------------------------------------------------------------- 3
  {
    slug: "quimia-clase-organica-alcanos",
    grupo: "organica",
    orden: 3,
    requierePro: true,
    nombre: "Alcanos y su nomenclatura",
    descripcion: "Los hidrocarburos saturados, sus propiedades, los radicales alquilo y las reglas IUPAC para nombrar cadenas ramificadas.",
    pasos: [
      `Los alcanos son hidrocarburos saturados: solo tienen carbono e hidrógeno y todos sus enlaces son simples. Su fórmula general es $\\mathrm{C_nH_{2n+2}}$ (cadena abierta). El más simple, el ${nomM("metano")} (${formM("metano")}), es el componente principal del gas natural.`,
      `Los alcanos forman una serie homóloga: cada uno se diferencia del anterior en un grupo –CH₂–. Los nombres de los diez primeros combinan el prefijo de carbonos con la terminación -ano.`,
      "Propiedades a este nivel. Los primeros cuatro (metano, etano, propano y butano) son gases a temperatura ambiente; a partir del pentano y hasta unos 15 carbonos son líquidos; con más carbonos son sólidos, como la parafina. Son insolubles en agua y menos densos que ella (flotan). Sus puntos de ebullición aumentan con el largo de la cadena y bajan con las ramificaciones. Son poco reactivos, salvo para la combustión.",
      `Usos. El metano es el gas natural; el propano y el butano forman el gas envasado en garrafas; la mezcla de alcanos de 5 a 12 carbonos es la nafta; y los de cadena más larga forman el gasoil y las parafinas. Su reacción más importante es la combustión, que se estudia más adelante.`,
      `Radicales alquilo. Si a un alcano se le quita un hidrógeno se obtiene un grupo que puede colgar de otra cadena: el radical. Se nombra cambiando -ano por -il, y su fórmula general es $\\mathrm{C_nH_{2n+1}}$. Hay dos con nombre propio que se derivan del propano y del butano: el isopropil, ${"$\\mathrm{CH_3{-}CH(CH_3){-}}$"}, y el terc-butil, ${"$\\mathrm{(CH_3)_3C{-}}$"}.`,
      `Isomería de cadena. Desde el butano, un mismo número de carbonos se puede ordenar de más de una manera: el butano tiene ${ISOMEROS_ALCANOS[3]} isómeros de cadena, el pentano ${ISOMEROS_ALCANOS[4]} y el hexano ${ISOMEROS_ALCANOS[5]}. Son compuestos distintos, con propiedades distintas.`,
      "Reglas de la IUPAC para nombrar un alcano ramificado. 1) Se elige la cadena principal: la cadena continua de carbonos más larga, aunque el dibujo la presente doblada. 2) Se numera desde el extremo que da los números más bajos a las ramificaciones (si hay empate, se compara la lista completa). 3) Se nombran las ramificaciones con su número; si se repiten, se usa di-, tri-, tetra-. 4) Se ordenan alfabéticamente (sin contar di-, tri-) y se pega todo con el nombre de la cadena.",
      `Ejemplo 1: ${nomM("2-metilbutano")}. La cadena más larga tiene 4 carbonos (butano) y hay un metilo. Numerando de un extremo, el metilo queda en el carbono 2; del otro, en el 3. Se elige el número más bajo: 2.`,
      `Ejemplo 2: ${nomM("2,4-dimetilhexano")}. La cadena tiene 6 carbonos y dos metilos. Numerando de izquierda a derecha, quedan en 2 y 4; de derecha a izquierda, en 3 y 5. Se elige {2, 4}, porque 2 es menor que 3 en el primer punto de diferencia. Como el radical se repite, se usa «di».`,
      `Ejemplo 3: ${nomM("3-etil-5-metilheptano")}. La cadena tiene 7 carbonos, un etilo y un metilo. De los dos lados los números son 3 y 5 (empate). Se le da el número más bajo al radical que se cita primero en orden alfabético: etil antes que metil, así que el etilo queda en el 3.`,
      `Cómo se escribe el nombre: los números se separan con comas, los números de las letras con guiones, y todo se pega y va en minúscula. Alfabetización: etil, metil y propil se ordenan por su inicial; isopropil va en la «i» y terc-butil en la «b» (no cuenta «terc»). Los prefijos di-, tri- y tetra- no cuentan: «etil» va antes que «dimetil».`,
      `Errores frecuentes: elegir la cadena «recta» del dibujo en lugar de la más larga; numerar por el extremo equivocado; poner «1-metil» o «2-etil» (el metilo del extremo alargaría la cadena, y un etilo en el carbono 2 también: ${nomM("3-metilpentano")}, no «2-etilbutano»); olvidar el guion o la coma; y no repetir el número de cada radical repetido (2,4-dimetilhexano, no 2-4-dimetil).`,
    ],
    visuales: [
      cuadro(
        1,
        ["Carbonos", "Nombre", "Fórmula molecular", "Fórmula condensada"],
        ALCANOS.map((id, i) => [String(i + 1), NomM(id), formM(id), condM(id)]),
        "Los diez primeros alcanos"
      ),
      { tipo: "quimia.cadena", despuesDePaso: 1, molecula: "etano", modo: "formulas" },
      cuadro(
        4,
        ["Radical", "Se obtiene de", "Fórmula"],
        [1, 2, 3, 4].map((n) => [`${sinAno(ALCANOS[n - 1])}il`, nomM(ALCANOS[n - 1]), radical(n)]),
        "Radicales alquilo (CₙH₂ₙ₊₁)"
      ),
      { tipo: "quimia.isomeria", despuesDePaso: 5, moleculas: ["butano", "2-metilpropano"], isomeria: "cadena" },
      { tipo: "quimia.isomeria", despuesDePaso: 5, moleculas: ["pentano", "2-metilbutano", "2,2-dimetilpropano"], isomeria: "cadena" },
      { tipo: "quimia.cadena", despuesDePaso: 7, molecula: "2-metilbutano" },
      { tipo: "quimia.cadena", despuesDePaso: 8, molecula: "2,4-dimetilhexano" },
      { tipo: "quimia.cadena", despuesDePaso: 9, molecula: "3-etil-5-metilheptano" },
    ],
    quiz: [
      preg(`¿Cuál es la fórmula molecular del ${nomM("decano")}?`, [molM("decano"), "C₁₀H₂₀", "C₁₀H₂₄", "C₁₀H₁₈"], 0, "Un alcano es CₙH₂ₙ₊₂: con n = 10 son 22 hidrógenos."),
      preg(`¿Cómo se llama ${condM("2,4-dimetilhexano")}?`, [nomM("2,4-dimetilhexano"), "3,5-dimetilhexano", "2,4-metilhexano", "2-metil-4-metilhexano"], 0, "La cadena principal es de 6 carbonos y numerando por el extremo correcto los metilos quedan en 2 y 4 (por el otro serían 3 y 5). Se usa di- porque el radical se repite."),
      preg("Un alcano tiene un etilo y un metilo colgando de una cadena de 7 carbonos, ambos en posiciones que dan el mismo conjunto de números por los dos lados (3 y 5). ¿Cuál lleva el número 3?", ["El etilo, por orden alfabético", "El metilo, porque es más chico", "El que está más cerca del extremo derecho", "Da lo mismo"], 0, `Cuando hay empate, el radical que se cita primero alfabéticamente recibe el número más bajo: ${nomM("3-etil-5-metilheptano")}.`),
      preg("¿Por qué «2-etilbutano» no es un nombre correcto?", ["Porque la cadena más larga tiene 5 carbonos: es 3-metilpentano", "Porque el etilo no puede estar en el carbono 2", "Porque falta un guion", "Porque el butano no admite ramificaciones"], 0, "Con un etilo en el carbono 2 de un butano, la cadena continua más larga tiene 5 carbonos. El compuesto es el 3-metilpentano."),
      preg("¿Qué tienen en común el butano y el 2-metilpropano?", ["Tienen la misma fórmula molecular, C₄H₁₀, y distinta estructura", "Tienen la misma estructura", "Tienen distinto número de carbonos", "Los dos tienen un enlace doble"], 0, `Son isómeros de cadena: ambos son ${molM("butano")}. Sus puntos de ebullición son distintos (${punto("butano")} y ${punto("2-metilpropano")}).`),
      preg(`En los alcanos, ¿qué fórmula general se cumple (cadena abierta)?`, ["$\\mathrm{C_nH_{2n+2}}$", "$\\mathrm{C_nH_{2n}}$", "$\\mathrm{C_nH_{2n-2}}$", "$\\mathrm{C_nH_n}$"], 0, "Un alcano tiene 2 hidrógenos más que el doble de sus carbonos: CₙH₂ₙ₊₂."),
    ],
  },
  // ---------------------------------------------------------------- 4
  {
    slug: "quimia-clase-organica-alquenos-alquinos",
    grupo: "organica",
    orden: 4,
    requierePro: true,
    nombre: "Alquenos y alquinos",
    descripcion: "Hidrocarburos con enlaces dobles y triples: fórmula, nomenclatura, dienos y propiedades.",
    pasos: [
      `Los alquenos tienen al menos un enlace doble C=C y los alquinos, al menos un triple C≡C. Como tienen menos hidrógenos que los alcanos con los mismos carbonos, se llaman insaturados. Con un solo enlace doble la fórmula general es $\\mathrm{C_nH_{2n}}$ y con un solo triple, $\\mathrm{C_nH_{2n-2}}$. Los más simples son el ${nomM("eteno")} (${formM("eteno")}), también llamado ${comunM("eteno")}, y el ${nomM("etino")} (${formM("etino")}), llamado ${comunM("etino")}.`,
      "Nomenclatura. Se cambia la terminación -ano del alcano por -eno (doble) o -ino (triple), y se indica con un número la posición: el del primer carbono del enlace múltiple. La cadena se numera por el extremo que da el número más bajo al enlace múltiple. En eteno, etino y propeno se omite el número porque no hay ambigüedad.",
      `Ejemplos: ${nomM("eteno")}, ${nomM("propeno")}, ${nomM("but-1-eno")}, ${nomM("pent-2-eno")}, ${nomM("etino")}, ${nomM("propino")}, ${nomM("but-1-ino")}, ${nomM("but-2-ino")}. El número es la posición del primer carbono del enlace: en but-1-eno el doble está entre los carbonos 1 y 2; en but-2-eno, entre el 2 y el 3.`,
      `La cadena principal debe contener el enlace múltiple, aunque no sea la más larga. Ejemplo: ${nomM("3-metilbut-1-eno")}. Se numera para que el doble enlace reciba el número más bajo (no las ramificaciones). Aviso de nivel: en las recomendaciones de 2013 de la IUPAC pasó a priorizarse la cadena más larga; en el colegio se enseña esta regla anterior, que es la que se usa aquí.`,
      "Si hay dos enlaces dobles, la molécula es un dieno y se usa el prefijo di-: se agrega una «a» delante (buta-1,3-dieno) y se dan los dos números. El buta-1,3-dieno es una materia prima para fabricar caucho sintético.",
      `Isomería. Los alquenos pueden tener isomería de posición (${nomM("but-1-eno")} y but-2-eno, con el doble enlace en otro lugar de la misma cadena) y también geométrica: cuando cada carbono del doble enlace tiene dos sustituyentes distintos, no puede girar libremente y los sustituyentes pueden quedar del mismo lado (cis) o de lados opuestos (trans). Son compuestos distintos, con propiedades distintas.`,
      "Propiedades y reacciones. Los alquenos y los alquinos son más reactivos que los alcanos, porque el enlace π es más débil y accesible. Su reacción típica es la adición: se rompe el π y se unen nuevos átomos (por ejemplo, hidrógeno o bromo). Se ven en la Clase de reacciones. El eteno es una hormona vegetal que acelera la maduración de los frutos y la materia prima del polietileno; el etino se usa en soldadura, porque con oxígeno da una llama muy caliente.",
      "Errores frecuentes: numerar desde el extremo equivocado (el enlace múltiple manda sobre las ramificaciones); olvidar el número en but-1-eno o but-2-eno; escribir «buteno» sin el número; y creer que cualquier alqueno tiene isomería cis-trans (necesita dos sustituyentes distintos en cada carbono del doble enlace).",
    ],
    visuales: [
      { tipo: "quimia.grupos", despuesDePaso: 0, moleculas: ["eteno", "etino"] },
      cuadro(
        2,
        ["Nombre", "Nombre común", "Fórmula molecular", "Fórmula condensada"],
        ["eteno", "propeno", "but-1-eno", "pent-2-eno", "etino", "propino", "but-1-ino", "but-2-ino"].map((id) => [NomM(id), F(id).entrada.comun ?? "—", formM(id), condM(id)]),
        "Alquenos y alquinos"
      ),
      { tipo: "quimia.cadena", despuesDePaso: 3, molecula: "3-metilbut-1-eno" },
      { tipo: "quimia.cadena", despuesDePaso: 4, molecula: "buta-1,3-dieno" },
      { tipo: "quimia.isomeria", despuesDePaso: 5, moleculas: ["cis-but-2-eno", "trans-but-2-eno"], isomeria: "geometrica" },
      { tipo: "quimia.isomeria", despuesDePaso: 5, moleculas: ["but-1-eno", "cis-but-2-eno"], isomeria: "posicion" },
    ],
    quiz: [
      preg(`¿Cuál es la fórmula molecular del ${nomM("but-1-eno")}?`, [molM("but-1-eno"), "C₄H₁₀", "C₄H₆", "C₄H₄"], 0, "Un alqueno con un enlace doble es CₙH₂ₙ: con n = 4, C₄H₈."),
      preg(`¿Cómo se llama ${condM("pent-2-eno")}?`, [nomM("pent-2-eno"), "pent-3-eno", "2-penteno-1", "pentano-2-eno"], 0, "El doble enlace está entre los carbonos 2 y 3; se numera por el extremo que le da el número más bajo (2)."),
      preg("¿Qué terminación indica un enlace triple?", ["-ino", "-eno", "-ano", "-ona"], 0, "-ino es la terminación de los alquinos; -eno la de los alquenos y -ano la de los alcanos."),
      preg("¿Qué condición debe cumplirse para que un alqueno tenga isomería geométrica (cis-trans)?", ["Que cada carbono del doble enlace tenga dos sustituyentes distintos", "Que tenga más de cuatro carbonos", "Que el doble enlace esté en el extremo", "Que sea un dieno"], 0, `Por ejemplo, el but-2-eno la tiene (cada carbono tiene un H y un CH₃); el ${nomM("but-1-eno")}, no (un carbono tiene dos H).`),
      preg("¿Por qué los alquenos son más reactivos que los alcanos?", ["Porque el enlace π es más débil y accesible que el σ", "Porque tienen más carbonos", "Porque tienen oxígeno", "Porque son gases"], 0, "El enlace π se forma por solapamiento lateral, es más débil y queda expuesto: permite las reacciones de adición."),
    ],
  },
  // ---------------------------------------------------------------- 5
  {
    slug: "quimia-clase-organica-ciclicos-aromaticos",
    grupo: "organica",
    orden: 5,
    requierePro: true,
    nombre: "Cicloalcanos y compuestos aromáticos",
    descripcion: "Hidrocarburos cíclicos, el benceno y sus derivados, y por qué los aromáticos se comportan distinto de los alquenos.",
    pasos: [
      `Algunos hidrocarburos tienen la cadena cerrada en un anillo. Los cicloalcanos tienen solo enlaces simples y fórmula general $\\mathrm{C_nH_{2n}}$ (dos hidrógenos menos que el alcano de cadena abierta, porque los extremos se unen). Se nombran con el prefijo «ciclo» delante del nombre del alcano: ${nomM("ciclopropano")}, ${nomM("ciclobutano")}, ${nomM("ciclopentano")} y ${nomM("ciclohexano")}.`,
      `Se dibujan como polígonos: cada vértice es un carbono. El ${nomM("ciclohexano")} es un hexágono, ${formM("ciclohexano")}. Con un doble enlace, la terminación cambia: ${nomM("ciclohexeno")}, ${formM("ciclohexeno")}. Si el anillo lleva un sustituyente, no se numera: ${nomM("metilciclohexano")}. Los dibujos de esta Clase son esquemas planos de la conectividad.`,
      `El benceno, ${formM("benceno")}, es el compuesto aromático más importante: un anillo de seis carbonos, plano, con enlaces dobles alternados en la estructura de Kekulé. En realidad los electrones de los enlaces π están repartidos (deslocalizados) por todo el anillo, y los seis enlaces C–C son iguales, de una longitud intermedia entre un simple y un doble. Cada carbono es sp² (${HIB("benceno").sigma} enlaces σ y 1 π).`,
      "Por esa deslocalización el benceno es mucho más estable que un alqueno: no da fácilmente reacciones de adición, sino de sustitución (un hidrógeno se reemplaza por otro grupo y el anillo se conserva). Por eso los compuestos «aromáticos» (nombre histórico, por sus olores) se estudian aparte de los alquenos.",
      `Derivados del benceno. Con un sustituyente: ${nomM("metilbenceno")} (tolueno), ${nomM("clorobenceno")}, y ${nomM("fenol")} (con un –OH, que no es un alcohol común). Con dos, se numeran los carbonos del anillo: ${nomM("1,2-dimetilbenceno")}, ${nomM("1,3-dimetilbenceno")} y ${nomM("1,4-dimetilbenceno")}. Son los tres isómeros de posición (en nombres antiguos: orto, meta y para).`,
      "El benceno es tóxico y cancerígeno (está clasificado por la Agencia Internacional para la Investigación sobre el Cáncer en el grupo 1), por lo que su uso como disolvente está muy restringido. Muchos otros aromáticos, como el tolueno, son materia prima de plásticos, colorantes y medicamentos.",
      "En la práctica de Quimia el benceno aparece dibujado como un hexágono con enlaces dobles alternados: es la misma estructura de Kekulé de esta Clase.",
      "Errores frecuentes: creer que el benceno tiene tres enlaces dobles «fijos» (los electrones están repartidos); confundir «aromático» con «que huele bien» (varios aromáticos son tóxicos); numerar los sustituyentes del anillo con los números más altos en lugar de los más bajos; y pensar que un cicloalcano es lo mismo que el alqueno de igual fórmula (por ejemplo, el ciclobutano y el but-1-eno son isómeros distintos).",
    ],
    visuales: [
      { tipo: "quimia.cadena", despuesDePaso: 1, molecula: "ciclohexano" },
      { tipo: "quimia.cadena", despuesDePaso: 2, molecula: "benceno" },
      { tipo: "quimia.grupos", despuesDePaso: 3, moleculas: ["benceno", "metilbenceno", "fenol"] },
      { tipo: "quimia.isomeria", despuesDePaso: 4, moleculas: ["1,2-dimetilbenceno", "1,3-dimetilbenceno", "1,4-dimetilbenceno"], isomeria: "posicion" },
    ],
    quiz: [
      preg(`¿Cuál es la fórmula molecular del ${nomM("ciclopentano")}?`, [molM("ciclopentano"), "C₅H₁₂", "C₅H₈", "C₅H₁₄"], 0, "Un cicloalcano es CₙH₂ₙ: con n = 5, C₅H₁₀ (2 hidrógenos menos que el pentano, porque se cierra el anillo)."),
      preg(`¿Qué hibridación tiene cada carbono del benceno?`, ["sp²", "sp³", "sp", "Depende del carbono"], 0, `Cada carbono tiene ${HIB("benceno").sigma} enlaces σ y 1 π (deslocalizado): es sp², y el anillo es plano.`),
      preg("¿Por qué el benceno no se comporta como un alqueno común?", ["Porque sus electrones π están deslocalizados y el anillo es muy estable", "Porque no tiene carbono", "Porque no tiene hidrógeno", "Porque es un gas"], 0, "La deslocalización de los electrones π estabiliza el anillo: prefiere reemplazar hidrógenos (sustitución) antes que romper el anillo (adición)."),
      preg(`¿Cómo se llama el benceno con un metilo?`, [nomM("metilbenceno"), "metilciclohexano", "bencenometano", "1-metilbenceno-2"], 0, "Se nombra con el sustituyente delante: metilbenceno (tolueno). Con un solo sustituyente no se numera."),
      preg("¿Cuántos isómeros de posición tiene el dimetilbenceno?", ["3", "2", "4", "1"], 0, `Los metilos pueden estar en las posiciones 1 y 2 (${nomM("1,2-dimetilbenceno")}), 1 y 3, o 1 y 4: tres isómeros.`),
    ],
  },
  // ---------------------------------------------------------------- 6
  {
    slug: "quimia-clase-organica-oxigenados",
    grupo: "organica",
    orden: 6,
    requierePro: true,
    nombre: "Alcoholes, éteres, aldehídos y cetonas",
    descripcion: "Los grupos funcionales oxigenados, cómo se nombran, la prioridad entre grupos y el caso de la glucosa.",
    pasos: [
      "Un grupo funcional es un átomo o grupo de átomos que da a una familia de compuestos sus propiedades químicas características. Escribiendo R para el resto de la cadena de carbonos, un alcohol es R–OH, un éter R–O–R′, un aldehído R–CHO y una cetona R–CO–R′. Mismo esqueleto, distinto grupo: comportamientos muy distintos.",
      `Alcoholes: tienen un grupo hidroxilo –OH unido a un carbono saturado. Terminación -ol, con el número del carbono del –OH si hace falta: ${nomM("metanol")}, ${nomM("etanol")}, ${nomM("propan-1-ol")}, ${nomM("propan-2-ol")}. Se clasifican por los carbonos unidos al carbono del –OH: primario (${nomM("propan-1-ol")}), secundario (${nomM("propan-2-ol")}) y terciario (${nomM("2-metilpropan-2-ol")}). Con varios –OH: ${nomM("etano-1,2-diol")} (etilenglicol) y ${nomM("propano-1,2,3-triol")} (glicerina).`,
      `Los alcoholes tienen puntos de ebullición altos para su tamaño, porque las moléculas se unen entre sí por puentes de hidrógeno (el H del –OH con el O de otra molécula). Ejemplo: el ${nomM("etanol")} hierve a ${punto("etanol")}, mientras que su isómero, el ${nomM("metoximetano")}, que no tiene –OH, hierve a ${punto("metoximetano")}. El etanol es el alcohol de las bebidas y un disolvente muy usado; el metanol es tóxico.`,
      `Éteres: un oxígeno entre dos carbonos, R–O–R′. Se nombran como un alcano con un sustituyente «alcoxi»: ${nomM("metoximetano")}, ${nomM("metoxietano")} y ${nomM("etoxietano")} (éter etílico, que se usó como anestésico). Son poco reactivos y son isómeros de función de los alcoholes con la misma fórmula (por ejemplo, ${formM("etanol")}).`,
      `Aldehídos: un grupo carbonilo C=O en el extremo de la cadena, unido a un hidrógeno (R–CHO). Terminación -al: ${nomM("metanal")} (en solución acuosa se llama formol) y ${nomM("etanal")}. El carbono del –CHO es siempre el número 1, por eso no lleva número en el nombre.`,
      `Cetonas: un carbonilo C=O en el interior de la cadena, unido a dos carbonos (R–CO–R′). Terminación -ona, con número si hace falta: ${nomM("propanona")} (acetona, un disolvente), ${nomM("butanona")}, ${nomM("pentan-2-ona")} y ${nomM("pentan-3-ona")}.`,
      `Aldehído y cetona con los mismos átomos son isómeros de función: el ${nomM("propanal")} y la ${nomM("propanona")} son ${molM("propanal")}. La diferencia es dónde está el C=O: en el extremo (aldehído) o en el medio (cetona).`,
      `Prioridad entre grupos. Si una molécula tiene más de un grupo, uno solo define la terminación (el principal) y los demás se nombran como prefijos. El orden de prioridad de los grupos que se ven en esta Clase y la siguiente es: ácido carboxílico > éster > amida > aldehído > cetona > alcohol > amina. Ejemplos: ${nomM("2-hidroxipropanal")} (el aldehído gana al alcohol), ${nomM("1-hidroxipropan-2-ona")} (la cetona gana al alcohol) y ${nomM("acido-3-oxobutanoico")} (el ácido gana a la cetona, que pasa a «oxo»).`,
      `La glucosa es un buen ejemplo de una molécula con varios grupos. En su forma de cadena abierta tiene un aldehído y cinco alcoholes: se nombra ${nomM("glucosa-abierta")} (${formM("glucosa-abierta")}). Como el aldehído es el grupo principal, recibe el carbono 1 y los cinco alcoholes son prefijos «hidroxi». Sus muchos –OH forman puentes de hidrógeno con el agua, por eso es muy soluble. En agua, casi toda la glucosa está en forma de anillo, pero la cadena abierta es la representación más simple.`,
      "Errores frecuentes: confundir aldehído y cetona (el C=O en el extremo o en el medio); confundir alcohol con éter; olvidar el número del –OH (propan-1-ol y propan-2-ol son compuestos distintos); y creer que en una molécula con dos grupos se nombran los dos como sufijo (solo el principal lleva terminación).",
    ],
    visuales: [
      { tipo: "quimia.grupos", despuesDePaso: 1, moleculas: ["metanol", "etanol", "propan-1-ol", "propan-2-ol", "2-metilpropan-2-ol", "etano-1,2-diol"] },
      { tipo: "quimia.grupos", despuesDePaso: 3, moleculas: ["metoximetano", "metoxietano", "etoxietano"] },
      { tipo: "quimia.grupos", despuesDePaso: 4, moleculas: ["metanal", "etanal", "propanal"] },
      { tipo: "quimia.grupos", despuesDePaso: 5, moleculas: ["propanona", "butanona", "pentan-2-ona", "pentan-3-ona"] },
      { tipo: "quimia.isomeria", despuesDePaso: 6, moleculas: ["propanal", "propanona"], isomeria: "funcion" },
      cuadro(
        7,
        ["Prioridad", "Grupo", "Como sufijo (principal)", "Como prefijo"],
        [
          ["1", "ácido carboxílico", "-oico", "carboxi-"],
          ["2", "éster", "-oato de -ilo", "—"],
          ["3", "amida", "-amida", "carbamoil-"],
          ["4", "aldehído", "-al", "oxo- (formil-)"],
          ["5", "cetona", "-ona", "oxo-"],
          ["6", "alcohol", "-ol", "hidroxi-"],
          ["7", "amina", "-amina", "amino-"],
        ],
        "Orden de prioridad de los grupos"
      ),
      { tipo: "quimia.cadena", despuesDePaso: 8, molecula: "glucosa-abierta" },
    ],
    quiz: [
      preg(`¿A qué familia pertenece ${condM("propan-2-ol")}?`, ["Alcohol (secundario)", "Alcohol (primario)", "Éter", "Cetona"], 0, `El –OH está en un carbono unido a dos carbonos: alcohol secundario. El ${nomM("propan-1-ol")} es primario.`),
      preg("¿Qué diferencia hay entre un aldehído y una cetona?", ["El C=O está en el extremo (aldehído) o en el interior de la cadena (cetona)", "El aldehído tiene oxígeno y la cetona no", "La cetona es un alcohol", "El aldehído tiene doble enlace C=C"], 0, `Los dos tienen un C=O. En el ${nomM("propanal")} está en el extremo (unido a un H); en la ${nomM("propanona")}, en el medio.`),
      preg(`¿Por qué el ${nomM("etanol")} hierve a mayor temperatura que su isómero, el ${nomM("metoximetano")}?`, ["Porque el etanol forma puentes de hidrógeno entre sus moléculas", "Porque tiene más átomos", "Porque tiene distinta fórmula molecular", "Porque es un gas"], 0, `El –OH del etanol forma puentes de hidrógeno; el éter no. El etanol hierve a ${punto("etanol")} y el éter a ${punto("metoximetano")}.`),
      preg(`¿Cómo se llama ${condM("metoxietano")}?`, [nomM("metoxietano"), "etoximetano", "dietil éter", "metanol etilado"], 0, "Se nombra como un alcano (el de la cadena más larga, etano) con un sustituyente alcoxi (metoxi)."),
      preg(`En la ${nomM("glucosa-abierta")} (cadena abierta), ¿qué grupos funcionales hay?`, ["Un aldehído y cinco alcoholes", "Una cetona y cinco alcoholes", "Un ácido y cinco éteres", "Un alcohol solamente"], 0, "El carbono 1 es un aldehído (–CHO) y los carbonos 2 a 6 tienen un –OH cada uno."),
      preg(`Si una molécula tiene un aldehído y un alcohol, ¿cuál define la terminación?`, ["El aldehído: el alcohol pasa a «hidroxi-»", "El alcohol, porque es más pequeño", "Los dos, con -al-ol", "Ninguno: se nombra como alcano"], 0, "El aldehído tiene mayor prioridad que el alcohol. Por ejemplo, 2-hidroxipropanal."),
    ],
  },
  // ---------------------------------------------------------------- 7
  {
    slug: "quimia-clase-organica-acidos-esteres-nitrogenados",
    grupo: "organica",
    orden: 7,
    requierePro: true,
    nombre: "Ácidos carboxílicos, ésteres, aminas, amidas y haluros",
    descripcion: "Los demás grupos funcionales: cómo se reconocen y se nombran, con una tabla resumen de todos los grupos.",
    pasos: [
      `Ácidos carboxílicos: tienen el grupo carboxilo, –COOH (un carbonilo con un –OH en el mismo carbono). Se nombran «ácido» + la cadena + terminación -oico: ${nomM("acido-metanoico")}, ${nomM("acido-etanoico")}, ${nomM("acido-propanoico")}. El carbono del –COOH es siempre el 1. Son ácidos débiles. Tienen nombres comunes muy usados, que la práctica de Quimia también usa: el ${comunM("acido-metanoico")} (presente en las hormigas, del latín formica) y el ${comunM("acido-etanoico")} (el del vinagre).`,
      `Ésteres: son derivados de un ácido carboxílico y un alcohol, y tienen el grupo –COO– (R–COO–R′). Se nombran con la terminación -oato del ácido, «de» y el radical del alcohol con terminación -ilo: ${nomM("etanoato-de-metilo")}, ${nomM("etanoato-de-etilo")} y ${nomM("propanoato-de-metilo")}. Muchos ésteres tienen olores agradables de frutas y flores y se usan como aromatizantes.`,
      `Cómo se nombra un éster: 1) se mira la parte del ácido (la que tiene el C=O): el ${nomM("etanoato-de-etilo")} viene de un ácido de 2 carbonos (ácido etanoico), y esa parte se nombra «etanoato»; 2) la otra parte, unida al oxígeno, viene de un alcohol de 2 carbonos (etanol) y se nombra «de etilo». El nombre empieza por la parte del ácido (la que tiene el C=O) y sigue con la del alcohol (la que está unida al oxígeno).`,
      `Aminas: se pueden ver como derivadas del amoníaco, NH₃, con hidrógenos reemplazados por radicales. La más simple es R–NH₂ (amina primaria). Se nombran con la terminación -amina: ${nomM("metanamina")}, ${nomM("etanamina")}, ${nomM("propan-1-amina")} y ${nomM("propan-2-amina")}. Son bases débiles y muchas tienen olor fuerte, como el del pescado en descomposición.`,
      `Amidas: un carbonilo unido a un nitrógeno, R–CONH₂. Terminación -amida: ${nomM("etanamida")}, ${nomM("propanamida")}. Son importantes porque el enlace que une los aminoácidos en las proteínas es un enlace amida (enlace peptídico). Un aminoácido tiene una amina y un ácido en la misma molécula: la glicina es el ${nomM("acido-2-aminoetanoico")} (${formM("acido-2-aminoetanoico")}), donde el ácido manda y la amina pasa a prefijo «amino».`,
      `Haluros de alquilo: un halógeno (F, Cl, Br, I) unido a un carbono, R–X. Se nombran como un alcano con un prefijo (fluoro-, cloro-, bromo-, yodo-): ${nomM("clorometano")}, ${nomM("cloroetano")}, ${nomM("1-cloropropano")}, ${nomM("2-cloropropano")}, ${nomM("1,2-dicloroetano")} y ${nomM("triclorometano")} (cloroformo, que se usó como anestésico y hoy está muy restringido por su toxicidad).`,
      "La tabla resume todos los grupos funcionales vistos, con su fórmula general y su terminación o prefijo.",
      "Errores frecuentes: confundir éster con éter (el éster tiene un C=O); confundir amida con amina (la amida tiene el C=O); confundir cuál es la parte del ácido (la que tiene el C=O) y cuál la del alcohol al armar el nombre del éster; y nombrar el ácido como «alcohol» por el –OH (el –OH del carboxilo no es un alcohol).",
    ],
    visuales: [
      { tipo: "quimia.grupos", despuesDePaso: 0, moleculas: ["acido-metanoico", "acido-etanoico", "acido-propanoico"] },
      { tipo: "quimia.grupos", despuesDePaso: 1, moleculas: ["etanoato-de-metilo", "etanoato-de-etilo", "propanoato-de-metilo"] },
      { tipo: "quimia.cadena", despuesDePaso: 2, molecula: "etanoato-de-etilo" },
      { tipo: "quimia.grupos", despuesDePaso: 3, moleculas: ["metanamina", "etanamina", "propan-2-amina"] },
      { tipo: "quimia.grupos", despuesDePaso: 4, moleculas: ["etanamida", "acido-2-aminoetanoico"] },
      { tipo: "quimia.grupos", despuesDePaso: 5, moleculas: ["clorometano", "1,2-dicloroetano", "triclorometano"] },
      cuadro(
        6,
        ["Grupo", "Fórmula general", "Terminación o prefijo", "Ejemplo"],
        (
          [
            ["alcohol", "propan-1-ol"],
            ["eter", "metoxietano"],
            ["aldehido", "propanal"],
            ["cetona", "propanona"],
            ["acido", "acido-propanoico"],
            ["ester", "etanoato-de-etilo"],
            ["amina", "propan-1-amina"],
            ["amida", "propanamida"],
            ["haluro", "1-cloropropano"],
            ["alqueno", "propeno"],
            ["alquino", "propino"],
            ["aromatico", "metilbenceno"],
          ] as const
        ).map(([g, id]) => {
          debe(grupoId(id).includes(g), `${id} debería tener el grupo ${g}`);
          const nombresGrupo: Record<string, string> = { alcohol: "alcohol", eter: "éter", aldehido: "aldehído", cetona: "cetona", acido: "ácido carboxílico", ester: "éster", amina: "amina", amida: "amida", haluro: "haluro", alqueno: "alqueno", alquino: "alquino", aromatico: "aromático" };
          return [nombresGrupo[g], `$${INFO_GRUPO[g].general}$`, INFO_GRUPO[g].nombre, nomM(id)];
        }),
        "Los grupos funcionales de esta Clase y las anteriores"
      ),
    ],
    quiz: [
      preg(`¿A qué familia pertenece ${condM("acido-etanoico")}?`, ["Ácido carboxílico", "Alcohol", "Éster", "Cetona"], 0, "Tiene el grupo –COOH (un carbono con un C=O y un –OH). Se llama ácido etanoico o, en su nombre común, ácido acético."),
      preg(`¿A qué familia pertenece ${condM("etanoato-de-etilo")}?`, ["Éster", "Éter", "Ácido carboxílico", "Cetona"], 0, "El grupo –COO– (un C=O con un oxígeno unido a otro carbono) es un éster."),
      preg("Un éster se forma a partir de...", ["Un ácido carboxílico y un alcohol", "Dos alcoholes", "Un aldehído y una amina", "Un éter y agua"], 0, "R–COOH + R′–OH forman el éster R–COO–R′ y agua."),
      preg(`¿Cómo se llama ${condM("etanamida")}?`, [nomM("etanamida"), nomM("etanamina"), "ácido etanoico", "etanoato de amonio"], 0, "El carbonilo unido al nitrógeno es una amida: terminación -amida. La amina, sin C=O, se llamaría etanamina."),
      preg(`¿Cómo se llama ${condM("2-cloropropano")}?`, [nomM("2-cloropropano"), "1-cloropropano", "cloruro de propilo", "propanol cloro"], 0, "El cloro es un prefijo sobre la cadena de 3 carbonos, en el carbono 2."),
      preg("En la glicina, ácido 2-aminoetanoico, ¿por qué el nombre termina en -oico y no en -amina?", ["Porque el ácido carboxílico tiene más prioridad que la amina", "Porque la amina no puede ser prefijo", "Porque tiene 2 carbonos", "Porque el nitrógeno no es un grupo funcional"], 0, "Cuando una molécula tiene un ácido y una amina, el ácido define la terminación y la amina pasa a prefijo «amino»."),
    ],
  },
  // ---------------------------------------------------------------- 8
  {
    slug: "quimia-clase-organica-isomeria",
    grupo: "organica",
    orden: 8,
    requierePro: true,
    nombre: "Isomería",
    descripcion: "Isómeros de cadena, de posición, de función y geométricos (cis-trans), y por qué tienen propiedades distintas.",
    pasos: [
      "Los isómeros son compuestos con la misma fórmula molecular y distinta estructura: los mismos átomos, unidos de otra manera. Como la estructura decide las propiedades, los isómeros son sustancias diferentes. Para reconocerlos: primero se calcula la fórmula molecular de cada uno, y si coincide, se compara la estructura.",
      `Isomería de cadena: cambia el esqueleto de carbonos (lineal o ramificado) con la misma fórmula. Los alcanos de 4, 5 y 6 carbonos tienen ${ISOMEROS_ALCANOS[3]}, ${ISOMEROS_ALCANOS[4]} y ${ISOMEROS_ALCANOS[5]} isómeros respectivamente, y la cantidad crece rápido: el de 10 carbonos tiene ${ISOMEROS_ALCANOS[9]}. Los de 5 carbonos son ${nomM("pentano")}, ${nomM("2-metilbutano")} y ${nomM("2,2-dimetilpropano")}.`,
      `Isomería de posición: el mismo esqueleto y el mismo grupo o enlace múltiple, pero en otro carbono. Por ejemplo, ${nomM("propan-1-ol")} y ${nomM("propan-2-ol")}, o ${nomM("but-1-eno")} y but-2-eno.`,
      `Isomería de función: la misma fórmula, pero con grupos funcionales distintos, o sea familias distintas. Ejemplos: ${nomM("etanol")} (alcohol) y ${nomM("metoximetano")} (éter), ambos ${molM("etanol")}; ${nomM("propanal")} (aldehído) y ${nomM("propanona")} (cetona), ambos ${molM("propanal")}; y ${nomM("acido-propanoico")} (ácido) con ${nomM("etanoato-de-metilo")} (éster), ambos ${molM("acido-propanoico")}.`,
      `Isomería geométrica (cis-trans): se da en los alquenos cuando cada carbono del doble enlace tiene dos sustituyentes distintos. Como el doble enlace no gira, los sustituyentes pueden quedar del mismo lado (cis) o de lados opuestos (trans). Ejemplo: ${nomM("cis-but-2-eno")} y ${nomM("trans-but-2-eno")}. También aparece en los cicloalcanos sustituidos.`,
      `Los isómeros tienen propiedades distintas. Los de cadena: el ${nomM("butano")} hierve a ${punto("butano")} y el ${nomM("2-metilpropano")} a ${punto("2-metilpropano")}: la ramificación baja el punto de ebullición porque hace la molécula más compacta. Los de función: el ${nomM("etanol")} hierve a ${punto("etanol")} y el ${nomM("metoximetano")} a ${punto("metoximetano")}, porque solo el alcohol forma puentes de hidrógeno.`,
      "Hay otro tipo de isomería, la óptica (moléculas que son imágenes especulares no superponibles, que aparecen cuando un carbono tiene cuatro sustituyentes distintos), que queda fuera de este nivel.",
      "Errores frecuentes: creer que basta con que tengan los mismos elementos (tienen que tener los mismos átomos en la misma cantidad); llamar isómeros a compuestos con el mismo número de carbonos pero distinta cantidad de hidrógenos (como propano y propeno); y confundir el isómero de posición con el mismo compuesto numerado de otro lado (el propan-1-ol y el propan-3-ol son el mismo: se numera desde el lado que da el número más bajo).",
    ],
    visuales: [
      { tipo: "quimia.isomeria", despuesDePaso: 1, moleculas: ["pentano", "2-metilbutano", "2,2-dimetilpropano"], isomeria: "cadena" },
      { tipo: "quimia.isomeria", despuesDePaso: 2, moleculas: ["propan-1-ol", "propan-2-ol"], isomeria: "posicion" },
      { tipo: "quimia.isomeria", despuesDePaso: 3, moleculas: ["etanol", "metoximetano"], isomeria: "funcion" },
      { tipo: "quimia.isomeria", despuesDePaso: 3, moleculas: ["acido-propanoico", "etanoato-de-metilo", "metanoato-de-etilo"], isomeria: "funcion" },
      { tipo: "quimia.isomeria", despuesDePaso: 4, moleculas: ["cis-but-2-eno", "trans-but-2-eno"], isomeria: "geometrica" },
      cuadro(
        5,
        ["Isómeros", "Tipo", "Punto de ebullición (°C)"],
        [
          [`${NomM("butano")} y ${nomM("2-metilpropano")}`, "de cadena", `${PUNTO_EBULLICION_C.butano} y ${PUNTO_EBULLICION_C["2-metilpropano"]}`.replace(/-/g, "−")],
          [`${NomM("etanol")} y ${nomM("metoximetano")}`, "de función", `${PUNTO_EBULLICION_C.etanol} y ${PUNTO_EBULLICION_C.metoximetano}`.replace(/-/g, "−")],
        ],
        "Isómeros con propiedades distintas"
      ),
    ],
    quiz: [
      preg(`¿Qué tipo de isomería hay entre el ${nomM("propanal")} y la ${nomM("propanona")}?`, ["De función", "De cadena", "De posición", "Geométrica"], 0, `Los dos son ${molM("propanal")}, pero uno es un aldehído y el otro una cetona: cambia la familia.`),
      preg(`¿Qué tipo de isomería hay entre el ${nomM("propan-1-ol")} y el ${nomM("propan-2-ol")}?`, ["De posición", "De cadena", "De función", "Óptica"], 0, "El esqueleto y el grupo son los mismos (–OH), pero el –OH está en un carbono distinto."),
      preg(`¿Cuántos isómeros de cadena tiene el hexano, ${molM("hexano")}, contando el hexano mismo?`, ["5", "3", "4", "9"], 0, `Son ${ISOMEROS_ALCANOS[5]}: hexano, 2-metilpentano, 3-metilpentano, 2,2-dimetilbutano y 2,3-dimetilbutano.`),
      preg(`¿Qué necesita un alqueno para tener isomería geométrica?`, ["Dos sustituyentes distintos en cada carbono del doble enlace", "Más de 4 carbonos", "Un triple enlace", "Un grupo –OH"], 0, `El but-2-eno la tiene (cada carbono tiene H y CH₃); el ${nomM("but-1-eno")}, no.`),
      preg(`¿Por qué el ${nomM("2-metilpropano")} hierve a menor temperatura que el ${nomM("butano")}?`, ["La ramificación hace la molécula más compacta y las fuerzas entre moléculas son menores", "Porque tiene menos carbonos", "Porque tiene otra fórmula molecular", "Porque tiene un enlace doble"], 0, `Los dos son ${molM("butano")}. El ramificado hierve a ${punto("2-metilpropano")} y el lineal a ${punto("butano")}.`),
    ],
  },
  // ---------------------------------------------------------------- 9
  {
    slug: "quimia-clase-organica-reacciones",
    grupo: "organica",
    orden: 9,
    requierePro: true,
    nombre: "Reacciones orgánicas básicas",
    descripcion: "Combustión, sustitución, adición, esterificación, oxidación de alcoholes y fermentación, con ecuaciones balanceadas.",
    pasos: [
      "Una reacción orgánica rompe y forma enlaces alrededor de los grupos funcionales. A este nivel se ven cinco tipos: combustión, sustitución, adición, esterificación (una condensación) y oxidación. En los ejemplos, las ecuaciones están balanceadas y verificadas.",
      `Combustión. Es la reacción con oxígeno y libera energía. Si el oxígeno alcanza, es completa y produce CO₂ y H₂O: ${ecu([[1, "CH4"], [2, "O2"]], [[1, "CO2"], [2, "H2O"]])} ${ecu([[1, "C2H5OH"], [3, "O2"]], [[2, "CO2"], [3, "H2O"]])} Si el oxígeno falta, es incompleta y se forma monóxido de carbono (CO), que es un gas tóxico, o carbono (hollín): ${ecu([[2, "CH4"], [3, "O2"]], [[2, "CO"], [4, "H2O"]])} Por eso hay que ventilar los ambientes donde se queman combustibles. La combustión es una reacción redox: el carbono se oxida (por ejemplo, de ${oxTexto("CH4", 0, "C")} a ${oxTexto("CO2", 0, "C")}).`,
      `Sustitución. Un átomo (un hidrógeno) se reemplaza por otro. Los alcanos, poco reactivos, reaccionan con los halógenos en presencia de luz: ${ecu([[1, "CH4"], [1, "Cl2"]], [[1, "CH3Cl"], [1, "HCl"]])} Se forma ${nomM("clorometano")}. También es típica de los compuestos aromáticos: el benceno reemplaza hidrógenos sin perder el anillo.`,
      `Adición. Se rompe el enlace π de un doble o triple enlace y se agregan átomos, sin perder ninguno. Con hidrógeno (hidrogenación): ${ecu([[1, "C2H4"], [1, "H2"]], [[1, "C2H6"]])} el ${nomM("eteno")} pasa a ${nomM("etano")}. Con bromo: ${ecu([[1, "C2H4"], [1, "Br2"]], [[1, "C2H4Br2"]])} se forma el ${nomM("1,2-dibromoetano")}; como el bromo se decolora, sirve para reconocer un enlace múltiple. Con agua: ${ecu([[1, "C2H4"], [1, "H2O"]], [[1, "C2H5OH"]])} se forma ${nomM("etanol")}. Con HCl: ${ecu([[1, "C2H4"], [1, "HCl"]], [[1, "C2H5Cl"]])} se forma ${nomM("cloroetano")}.`,
      `Si el alqueno es asimétrico, la adición de HX sigue la regla de Markovnikov: el hidrógeno se une al carbono del doble enlace que ya tiene más hidrógenos. Con propeno: ${ecu([[1, "C3H6"], [1, "HCl"]], [[1, "C3H7Cl"]])} el producto principal es el ${nomM("2-cloropropano")} y no el ${nomM("1-cloropropano")}. Muchos alquenos también se unen entre sí (polimerización), como se verá con el polietileno.`,
      `Esterificación. Un ácido carboxílico y un alcohol forman un éster y agua, con un ácido fuerte como catalizador. Es reversible: ${ecu([[1, "CH3COOH"], [1, "C2H5OH"]], [[1, "CH3COOC2H5"], [1, "H2O"]], "<->")} Se forma el ${nomM("etanoato-de-etilo")} a partir del ${nomM("acido-etanoico")} y del ${nomM("etanol")}. Se comprobó con oxígeno marcado que el agua sale del –OH del ácido y del H del alcohol. La reacción inversa (con agua) se llama hidrólisis.`,
      `Oxidación de alcoholes (redox en orgánica). Con un agente oxidante como el dicromato de potasio o el permanganato, un alcohol primario se oxida a aldehído y después a ácido carboxílico; uno secundario, a cetona; y uno terciario no se oxida en condiciones suaves. Si O es el oxígeno que aporta el oxidante: ${ecu([[1, "C2H5OH"], [1, "O"]], [[1, "CH3CHO"], [1, "H2O"]])} ${ecu([[1, "CH3CHO"], [1, "O"]], [[1, "CH3COOH"]])} ${ecu([[1, "CH3CH(OH)CH3"], [1, "O"]], [[1, "CH3COCH3"], [1, "H2O"]])} En cada paso el carbono se oxida: su número de oxidación promedio pasa de ${oxTexto("C2H5OH", 0, "C")} en el ${nomM("etanol")} a ${oxTexto("CH3CHO", 0, "C")} en el ${nomM("etanal")} y a ${oxTexto("CH3COOH", 0, "C")} en el ${nomM("acido-etanoico")}.`,
      `Fermentación. Algunos microorganismos (las levaduras) transforman la glucosa en etanol y CO₂ sin oxígeno: ${ecu([[1, "C6H12O6"]], [[2, "C2H5OH"], [2, "CO2"]])} Es la base de la elaboración de vino y cerveza, y el CO₂ es el que hace crecer el pan.`,
      "La tabla resume los cinco tipos de reacción con un ejemplo de cada uno.",
      "Errores frecuentes: confundir sustitución con adición (en la sustitución sale un producto más, como el HCl; en la adición no sale nada); olvidar balancear el oxígeno al final en la combustión; creer que la combustión incompleta forma solo CO₂; y aplicar Markovnikov al revés (el H va al carbono con más H).",
    ],
    visuales: [
      { tipo: "quimia.redox", despuesDePaso: 1, ejemplo: "ch4-o2" },
      cuadro(
        8,
        ["Tipo", "Qué ocurre", "Ejemplo"],
        [
          ["Combustión", "reacciona con O₂ y libera energía", ecu([[1, "CH4"], [2, "O2"]], [[1, "CO2"], [2, "H2O"]])],
          ["Sustitución", "un átomo reemplaza a otro", ecu([[1, "CH4"], [1, "Cl2"]], [[1, "CH3Cl"], [1, "HCl"]])],
          ["Adición", "se rompe un enlace π y se agregan átomos", ecu([[1, "C2H4"], [1, "H2"]], [[1, "C2H6"]])],
          ["Esterificación", "ácido + alcohol → éster + agua", ecu([[1, "CH3COOH"], [1, "C2H5OH"]], [[1, "CH3COOC2H5"], [1, "H2O"]], "<->")],
          ["Oxidación", "un alcohol pasa a aldehído, cetona o ácido", ecu([[1, "C2H5OH"], [1, "O"]], [[1, "CH3CHO"], [1, "H2O"]])],
        ],
        "Cinco tipos de reacción"
      ),
    ],
    quiz: [
      preg(`En la combustión completa del ${nomM("metano")}, ¿qué productos se forman?`, ["CO₂ y H₂O", "CO y H₂", "C y H₂O", "CH₃OH y O₂"], 0, "La combustión completa de un hidrocarburo da dióxido de carbono y agua. Si falta oxígeno se forma CO (incompleta)."),
      preg(`¿Qué tipo de reacción es ${ecu([[1, "C2H4"], [1, "H2"]], [[1, "C2H6"]])} ?`, ["Adición", "Sustitución", "Combustión", "Esterificación"], 0, "Se rompe el enlace π del eteno y se agregan dos hidrógenos, sin que salga ningún producto adicional: es una adición (hidrogenación)."),
      preg(`¿Qué tipo de reacción es ${ecu([[1, "CH4"], [1, "Cl2"]], [[1, "CH3Cl"], [1, "HCl"]])} ?`, ["Sustitución", "Adición", "Esterificación", "Polimerización"], 0, "Un hidrógeno del metano se reemplaza por un cloro y sale HCl: es una sustitución."),
      preg("¿Qué se forma al reaccionar un ácido carboxílico con un alcohol?", ["Un éster y agua", "Un aldehído y agua", "Una amida y agua", "Un éter y CO₂"], 0, "La esterificación produce un éster y agua, y es reversible."),
      preg(`Al oxidar suavemente el ${nomM("propan-2-ol")} (alcohol secundario), se obtiene...`, [nomM("propanona"), nomM("propanal"), nomM("acido-propanoico"), "no se oxida"], 0, "Un alcohol secundario se oxida a una cetona; el primario, a aldehído y después a ácido; el terciario no se oxida en condiciones suaves."),
      preg("Según la regla de Markovnikov, en la adición de HCl al propeno, ¿a qué carbono del doble enlace se une el hidrógeno?", ["Al que ya tiene más hidrógenos", "Al que tiene menos hidrógenos", "A cualquiera, en partes iguales", "Al carbono del metilo"], 0, "El H se une al carbono con más H (el CH₂ terminal), y el Cl queda en el carbono del medio: se forma sobre todo 2-cloropropano."),
    ],
  },
  // ---------------------------------------------------------------- 10
  {
    slug: "quimia-clase-organica-glucosa-polimeros",
    grupo: "organica",
    orden: 10,
    requierePro: true,
    nombre: "Glucosa y polímeros",
    descripcion: "De la molécula pequeña a la grande: la glucosa y los carbohidratos, el eteno y el polietileno, y los polímeros naturales.",
    pasos: [
      `Los carbohidratos (o hidratos de carbono) son compuestos orgánicos cuyas fórmulas son del tipo $\\mathrm{C_n(H_2O)_n}$, de ahí su nombre. La glucosa, ${formM("glucosa-abierta")}, es el más importante: es la principal fuente de energía de las células. Su fórmula empírica es $${formulaLatex(empirica("glucosa-abierta"))}$, que es la misma del ${nomM("acido-etanoico")}, aunque son moléculas muy distintas.`,
      `Estructura. En su forma de cadena abierta la glucosa tiene 6 carbonos, un aldehído en el primero y un –OH en cada uno de los otros cinco: ${nomM("glucosa-abierta")}. Por eso es un polialcohol con un grupo aldehído, muy soluble en agua (los –OH forman puentes de hidrógeno). En agua, casi toda la glucosa se cierra en un anillo, pero la cadena abierta es la representación más simple.`,
      `La glucosa es el punto de partida y de llegada de dos procesos biológicos que son reacciones redox. En la respiración celular se oxida con oxígeno: ${ecu([[1, "C6H12O6"], [6, "O2"]], [[6, "CO2"], [6, "H2O"]])} y en la fotosíntesis se forma a partir de CO₂ y agua con energía de la luz: ${ecu([[6, "CO2"], [6, "H2O"]], [[1, "C6H12O6"], [6, "O2"]])} El carbono pasa de ${oxTexto("CO2", 0, "C")} en el CO₂ a un promedio de ${oxTexto("C6H12O6", 0, "C")} en la glucosa (reducción).`,
      `Polímeros. Un polímero es una molécula muy grande formada por la repetición de unidades pequeñas, los monómeros. Ejemplo: el polietileno se forma al unirse muchas moléculas de ${nomM("eteno")}. La reacción es una polimerización por adición: $n\\,\\mathrm{CH_2{=}CH_2} \\rightarrow \\mathrm{(CH_2{-}CH_2)_n}$, donde cada unidad conserva sus átomos (${formM("eteno")}). Es la base de muchos plásticos.`,
      `Polímeros naturales. Los polisacáridos (almidón, celulosa, glucógeno) son polímeros de la glucosa: se unen con pérdida de agua. Para una cadena de n unidades: $n\\,\\mathrm{C_6H_{12}O_6} \\rightarrow \\mathrm{H(C_6H_{10}O_5)_nOH} + (n-1)\\,\\mathrm{H_2O}$ (cada unión libera una molécula de agua, y los extremos de la cadena completan H y OH). El almidón es la reserva de energía de las plantas, el glucógeno la de los animales, y la celulosa forma las paredes de las células vegetales.`,
      `Las proteínas son polímeros de aminoácidos. Cada aminoácido tiene una amina y un ácido carboxílico (como la glicina, ${nomM("acido-2-aminoetanoico")}), y se unen con enlaces amida (enlaces peptídicos) que liberan agua, igual que los polisacáridos.`,
      "Comparación: en un polímero de adición (polietileno) las unidades se suman sin perder átomos; en uno de condensación (polisacáridos, proteínas) cada unión libera una molécula pequeña, como el agua. Las moléculas pequeñas se llaman monómeros y la molécula grande, polímero.",
      "Errores frecuentes: creer que la glucosa y el ácido acético son la misma sustancia porque tienen igual fórmula empírica (CH₂O); confundir monómero con polímero; olvidar que en los polisacáridos se pierde agua en cada enlace; y creer que la cadena abierta es la única forma de la glucosa (en solución es un anillo).",
    ],
    visuales: [
      { tipo: "quimia.cadena", despuesDePaso: 1, molecula: "glucosa-abierta" },
      { tipo: "quimia.grupos", despuesDePaso: 1, moleculas: ["glucosa-abierta"] },
      { tipo: "quimia.grupos", despuesDePaso: 5, moleculas: ["acido-2-aminoetanoico"] },
    ],
    quiz: [
      preg(`¿Cuál es la fórmula molecular de la glucosa?`, [molM("glucosa-abierta"), "C₆H₁₂O₅", "C₆H₆O₆", "C₁₂H₂₂O₁₁"], 0, "La glucosa es C₆H₁₂O₆, o sea C₆(H₂O)₆: de ahí el nombre «hidrato de carbono»."),
      preg("¿Qué grupos funcionales hay en la glucosa de cadena abierta?", ["Un aldehído y cinco alcoholes", "Una cetona y cinco éteres", "Un ácido y un alcohol", "Solo alcoholes"], 0, `${nomM("glucosa-abierta")}: el aldehído es el carbono 1 y los carbonos 2 a 6 tienen un –OH cada uno.`),
      preg(`¿Qué es la reacción ${ecu([[6, "CO2"], [6, "H2O"]], [[1, "C6H12O6"], [6, "O2"]])} ?`, ["La fotosíntesis, en la que el carbono se reduce", "La respiración celular, en la que el carbono se oxida", "Una combustión de la glucosa", "Una fermentación"], 0, "Es la fotosíntesis: el carbono baja de +4 en el CO₂ a un promedio de 0 en la glucosa. La respiración es la reacción inversa."),
      preg("¿Qué polímero se forma con muchas moléculas de eteno?", ["El polietileno", "El almidón", "La celulosa", "Una proteína"], 0, "El eteno (etileno) es el monómero del polietileno, por polimerización por adición."),
      preg("Cuando n moléculas de glucosa se unen para formar almidón, ¿qué más se forma?", ["n − 1 moléculas de agua", "n moléculas de CO₂", "Una molécula de oxígeno", "Nada más"], 0, "Cada unión entre dos unidades libera una molécula de agua; para unir n unidades hacen falta n − 1 uniones."),
    ],
  },
];
