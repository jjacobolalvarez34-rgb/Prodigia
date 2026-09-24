import type { TecnicaQuimia } from "./tipos";
import { cuadro, f, preg } from "./ayudas";
import { condM, ecu, formM, molM, nomM, NomM } from "./ayudasTanda2";
import { ISOMEROS_ALCANOS, fichaDe } from "@/lib/quimia/moleculas";
import { formulaMolecular, hidrogenos } from "@/lib/quimia/organica";
import { coeficientesCombustion } from "@/lib/quimia/redox";

// Técnicas del grupo "organica" (gratis, atajos con visual y quiz): los
// cuatro enlaces del carbono, del esqueleto a la fórmula, los prefijos de la
// cadena, las terminaciones, nombrar un ramificado, reconocer el grupo
// funcional, isómeros y combustión. Nombres, fórmulas y hidrógenos salen del
// catálogo calculado (src/lib/quimia/moleculas.ts + organica.ts), nunca se
// tipean; las ecuaciones pasan por ecu(), que lanza si no están balanceadas.

const C = (id: string) => formulaMolecular(fichaDe(id).molecula).C ?? 0;
const H = (id: string) => formulaMolecular(fichaDe(id).molecula).H ?? 0;
// Hidrógenos de cada carbono de la cadena, en el orden de numeración.
const hPorCarbono = (id: string): number[] => {
  const fi = fichaDe(id);
  return fi.dibujo.atomos
    .filter((a) => a.enCadena)
    .sort((a, b) => (a.localizador ?? 0) - (b.localizador ?? 0))
    .map((a) => hidrogenos(fi.molecula, a.id));
};

const ALCANOS = ["metano", "etano", "propano", "butano", "pentano", "hexano", "heptano", "octano", "nonano", "decano"];
const sinAno = (id: string) => nomM(id).replace(/ano$/, "");

// Cuenta de insaturaciones: (2n + 2 − H) / 2 para un hidrocarburo.
const insaturaciones = (id: string) => (2 * C(id) + 2 - H(id)) / 2;

// Fila de la tabla de fórmulas generales.
const filaGeneral = (id: string, tipo: string, general: string): string[] => [NomM(id), tipo, `${general}, n = ${C(id)}`, formM(id)];
// Comprobaciones de construcción: la fórmula general se cumple en cada ejemplo.
const debeCumplir = (id: string, hEsperado: number) => {
  if (H(id) !== hEsperado) throw new Error(`${id}: ${molM(id)} no cumple la fórmula general (H esperado ${hEsperado})`);
};
for (const id of ["etano", "propano", "butano"]) debeCumplir(id, 2 * C(id) + 2);
for (const id of ["eteno", "propeno", "but-1-eno", "ciclohexano"]) debeCumplir(id, 2 * C(id));
for (const id of ["etino", "propino"]) debeCumplir(id, 2 * C(id) - 2);

const combustion = (formula: string, c: number, h: number) => {
  const k = coeficientesCombustion(c, h);
  return { k, ecuacion: ecu([[k.hc, formula], [k.o2, "O2"]], [[k.co2, "CO2"], [k.h2o, "H2O"]]) };
};
const cPropano = combustion("C3H8", 3, 8);
const cEtano = combustion("C2H6", 2, 6);
const cMetano = combustion("CH4", 1, 4);
const cButano = combustion("C4H10", 4, 10);
const cEteno = combustion("C2H4", 2, 4);
const cEtino = combustion("C2H2", 2, 2);

export const TECNICAS_QUIMIA_ORGANICA: TecnicaQuimia[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "quimia-tecnica-organica-cuatro-enlaces",
    grupo: "organica",
    orden: 1,
    requierePro: false,
    nombre: "El carbono siempre hace cuatro enlaces",
    descripcion: "La regla más útil de la química orgánica: contar los enlaces de un carbono para saber cuántos hidrógenos tiene.",
    pasos: [
      "El carbono forma siempre 4 enlaces. Es la regla más útil de la química orgánica: si sabes cuántos enlaces ya tiene un carbono, sabes cuántos hidrógenos le faltan.",
      "Cuenta cada enlace según su tipo: uno simple vale 1, uno doble vale 2 y uno triple vale 3. Los hidrógenos completan lo que falta hasta llegar a 4.",
      `Ejemplo con el ${nomM("but-1-eno")}: el primer carbono tiene un doble enlace (2), así que le faltan ${hPorCarbono("but-1-eno")[0]} hidrógenos; el segundo tiene un doble y uno simple (3), así que ${hPorCarbono("but-1-eno")[1]} hidrógeno; el tercero tiene dos simples (2), así que ${hPorCarbono("but-1-eno")[2]}; y el cuarto tiene uno simple (1), así que ${hPorCarbono("but-1-eno")[3]}. La fórmula condensada queda ${condM("but-1-eno")}.`,
      `Comprueba al final: si un carbono suma más de 4 enlaces, hay un error en la fórmula. Y un triple enlace deja un solo hidrógeno: en el ${nomM("etino")}, ${condM("etino")}, cada carbono tiene 1 H.`,
    ],
    visuales: [{ tipo: "quimia.cadena", despuesDePaso: 2, molecula: "but-1-eno", modo: "formulas" }],
    quiz: [
      preg(`¿Cuántos hidrógenos tiene el carbono central del ${nomM("propeno")}, ${condM("propeno")}?`, ["2", "1", "3", "0"], 1, `El carbono central tiene un doble enlace (2) y un enlace simple (1): suma 3, así que le falta 1 enlace, que es un hidrógeno.`),
      preg("En el grupo –CH₂– de una cadena, ¿con cuántos átomos distintos del hidrógeno está unido el carbono?", ["2", "1", "3", "4"], 0, "Tiene 2 hidrógenos, así que le quedan 2 enlaces: los que lo unen a sus dos vecinos de la cadena (uno a cada lado)."),
      preg(`En el ${nomM("etino")}, ¿cuántos hidrógenos tiene cada carbono?`, ["1", "2", "0", "3"], 0, "Cada carbono tiene un triple enlace con el otro carbono (3) y 1 enlace más, que es con un hidrógeno."),
      preg("¿Cuál de estas fórmulas condensadas es imposible?", ["CH₃–CH₂=CH₂", "CH₃–CH₂–CH₃", "CH₂=CH–CH₃", "CH≡C–CH₃"], 0, "En CH₃–CH₂=CH₂, el carbono del medio tiene un doble enlace (2), un enlace simple (1) y dos hidrógenos (2): suma 5. Un carbono nunca puede tener más de 4 enlaces."),
    ],
  },
  // ---------------------------------------------------------------- 2
  {
    slug: "quimia-tecnica-organica-esqueleto-a-formula",
    grupo: "organica",
    orden: 2,
    requierePro: false,
    nombre: "Del esqueleto a la fórmula molecular",
    descripcion: "Leer un dibujo en zigzag, completar los hidrógenos y usar las fórmulas generales de hidrocarburos.",
    pasos: [
      "En un esqueleto (el dibujo en zigzag) cada vértice y cada extremo es un carbono. Los hidrógenos no se dibujan: se completan hasta llegar a 4 enlaces por carbono.",
      `Para hallar la fórmula molecular, cuenta los carbonos, calcula los hidrógenos de cada uno y suma. Ejemplo: el ${nomM("2-metilbutano")} tiene ${C("2-metilbutano")} carbonos y ${H("2-metilbutano")} hidrógenos, o sea ${formM("2-metilbutano")}.`,
      "Atajo para los hidrocarburos: con solo enlaces simples y cadena abierta (alcano) la fórmula es CₙH₂ₙ₊₂; con un enlace doble (alqueno) es CₙH₂ₙ; con un triple (alquino) es CₙH₂ₙ₋₂. Un anillo simple (cicloalcano) también es CₙH₂ₙ.",
      `Cada doble enlace, triple enlace o anillo (una insaturación) quita 2 hidrógenos respecto del alcano. Para contar cuántas hay: (2n + 2 − H) / 2. El benceno, ${formM("benceno")}, da (2·6 + 2 − 6) / 2 = ${insaturaciones("benceno")}: tres dobles enlaces y un anillo.`,
    ],
    visuales: [
      { tipo: "quimia.cadena", despuesDePaso: 1, molecula: "2-metilbutano", modo: "formulas" },
      cuadro(
        2,
        ["Compuesto", "Tipo", "Fórmula general", "Fórmula molecular"],
        [
          filaGeneral("etano", "alcano", "$\\mathrm{C_nH_{2n+2}}$"),
          filaGeneral("butano", "alcano", "$\\mathrm{C_nH_{2n+2}}$"),
          filaGeneral("propeno", "alqueno", "$\\mathrm{C_nH_{2n}}$"),
          filaGeneral("but-1-eno", "alqueno", "$\\mathrm{C_nH_{2n}}$"),
          filaGeneral("etino", "alquino", "$\\mathrm{C_nH_{2n-2}}$"),
          filaGeneral("propino", "alquino", "$\\mathrm{C_nH_{2n-2}}$"),
          filaGeneral("ciclohexano", "cicloalcano", "$\\mathrm{C_nH_{2n}}$"),
        ],
        "Fórmulas generales de los hidrocarburos"
      ),
    ],
    quiz: [
      preg("¿Cuál es la fórmula molecular del alcano de 7 carbonos?", [f(fichaDe("heptano").formula), "C₇H₁₄", "C₇H₁₈", "C₇H₁₂"], 0, `Un alcano es CₙH₂ₙ₊₂: con n = 7 son 2·7 + 2 = ${2 * 7 + 2} hidrógenos, o sea ${molM("heptano")}.`),
      preg("¿Cuál es la fórmula de un alqueno de 5 carbonos con un solo doble enlace?", ["C₅H₁₂", "C₅H₁₀", "C₅H₈", "C₅H₁₄"], 1, `Un alqueno es CₙH₂ₙ: con n = 5 son 10 hidrógenos, como en el ${nomM("pent-1-eno")}, ${molM("pent-1-eno")}.`),
      preg("La fórmula C₄H₆ corresponde a un hidrocarburo con...", ["Dos insaturaciones (por ejemplo, un triple enlace, dos dobles, o un doble y un anillo)", "Solo enlaces simples y cadena abierta", "Un solo enlace doble y cadena abierta", "Ninguna estructura posible"], 0, `El alcano de 4 carbonos es C₄H₁₀; C₄H₆ tiene 4 hidrógenos menos, o sea 2 insaturaciones. Por ejemplo, el ${nomM("but-1-ino")} y el ${nomM("buta-1,3-dieno")}.`),
      preg("¿Cuál de estas fórmulas NO puede ser la de un alcano de cadena abierta?", ["C₅H₁₀", "C₃H₈", "C₆H₁₄", "C₂H₆"], 0, "Los alcanos son CₙH₂ₙ₊₂: con 5 carbonos serían 12 hidrógenos. C₅H₁₀ tiene 2 menos, por lo que tiene un doble enlace o un anillo."),
    ],
  },
  // ---------------------------------------------------------------- 3
  {
    slug: "quimia-tecnica-organica-prefijos",
    grupo: "organica",
    orden: 3,
    requierePro: false,
    nombre: "Los prefijos de la cadena",
    descripcion: "De 1 a 10 carbonos: met, et, prop, but, pent, hex, hept, oct, non y dec.",
    pasos: [
      "El nombre de un compuesto orgánico empieza con un prefijo que dice cuántos carbonos tiene la cadena principal.",
      `Los cuatro primeros hay que memorizarlos: met- (1 carbono), et- (2), prop- (3) y but- (4). Una frase para recordar el orden: «Mamá Es Pura Bondad» (Met, Et, Prop, But).`,
      "Desde el 5 se usan los números griegos, los mismos de pentágono, hexágono, heptágono y octógono: pent- (5), hex- (6), hept- (7), oct- (8), non- (9) y dec- (10).",
      "La terminación dice la familia de hidrocarburos: -ano si todos los enlaces son simples (alcano), -eno si hay un doble (alqueno) y -ino si hay un triple (alquino). Así, metano, etano, propano y butano son alcanos.",
    ],
    visuales: [
      cuadro(
        2,
        ["Carbonos", "Prefijo", "Alcano", "Fórmula"],
        ALCANOS.map((id, i) => [String(i + 1), `${sinAno(id)}-`, nomM(id), formM(id)]),
        "Los diez primeros alcanos"
      ),
    ],
    quiz: [
      preg(`¿Cuántos carbonos tiene el ${nomM("heptano")}?`, ["7", "6", "8", "5"], 0, "Hept- es 7, como en un heptágono (7 lados)."),
      preg("¿Qué prefijo corresponde a 5 carbonos?", ["pent-", "prop-", "hex-", "but-"], 0, "Pent- es 5, como en pentágono. Prop- es 3, but- es 4 y hex- es 6."),
      preg("¿Cuál es el alcano de 9 carbonos?", [nomM("nonano"), nomM("octano"), nomM("decano"), nomM("heptano")], 0, `Non- es 9. Su fórmula es ${formM("nonano")}.`),
      preg(`El prefijo «but-» de ${nomM("butano")} indica...`, ["4 carbonos en la cadena", "3 carbonos en la cadena", "Un enlace doble", "La presencia de un alcohol"], 0, "But- significa 4 carbonos. El enlace doble se indica con la terminación -eno y el alcohol con -ol."),
    ],
  },
  // ---------------------------------------------------------------- 4
  {
    slug: "quimia-tecnica-organica-terminaciones",
    grupo: "organica",
    orden: 4,
    requierePro: false,
    nombre: "La terminación dice la familia",
    descripcion: "-ano, -eno, -ino, -ol, -al, -ona, -oico, -oato, -amina y -amida: qué familia indica cada una.",
    pasos: [
      "Después del prefijo, la terminación dice a qué familia pertenece el compuesto. Con los mismos dos carbonos (et-) se pueden armar compuestos muy distintos solo cambiando la terminación.",
      `Las terminaciones más importantes: -ano, -eno, -ino (hidrocarburos), -ol (alcohol), -al (aldehído), -ona (cetona), -oico (ácido carboxílico), -oato de -ilo (éster), -amina (amina) y -amida (amida). Con dos carbonos: ${nomM("etano")}, ${nomM("eteno")}, ${nomM("etino")}, ${nomM("etanol")}, ${nomM("etanal")}, ${nomM("acido-etanoico")}, ${nomM("etanamina")} y ${nomM("etanamida")}.`,
      "Si la molécula tiene un grupo funcional principal, él manda en la terminación; los demás grupos se nombran como prefijos (hidroxi-, amino-, cloro-...).",
    ],
    visuales: [
      { tipo: "quimia.grupos", despuesDePaso: 1, moleculas: ["etanol", "etanal", "propanona", "acido-etanoico", "etanoato-de-metilo", "etanamina", "etanamida"] },
      cuadro(
        2,
        ["Terminación", "Familia", "Ejemplo"],
        [
          ["-ano", "alcano", nomM("propano")],
          ["-eno", "alqueno", nomM("propeno")],
          ["-ino", "alquino", nomM("propino")],
          ["-ol", "alcohol", nomM("propan-1-ol")],
          ["-al", "aldehído", nomM("propanal")],
          ["-ona", "cetona", nomM("propanona")],
          ["-oico (ácido)", "ácido carboxílico", nomM("acido-propanoico")],
          ["-oato de -ilo", "éster", nomM("propanoato-de-metilo")],
          ["-amina", "amina", nomM("propan-1-amina")],
          ["-amida", "amida", nomM("propanamida")],
        ],
        "Terminaciones de la familia con 3 carbonos"
      ),
    ],
    quiz: [
      preg(`El compuesto «${nomM("propanona")}» pertenece a la familia de...`, ["Las cetonas", "Los aldehídos", "Los alcoholes", "Los alquenos"], 0, "La terminación -ona indica una cetona. Los aldehídos terminan en -al y los alcoholes en -ol."),
      preg(`¿Qué es el ${nomM("propanal")}?`, ["Un aldehído", "Un alcohol", "Una cetona", "Un ácido carboxílico"], 0, "-al es la terminación de los aldehídos."),
      preg(`¿Qué familia indica la terminación de «${nomM("etanoato-de-metilo")}»?`, ["Éster", "Ácido carboxílico", "Éter", "Amida"], 0, "-oato de -ilo es la terminación de los ésteres (derivados de un ácido y un alcohol)."),
      preg(`Los nombres «${nomM("etanol")}» y «${nomM("etanamina")}» tienen el mismo prefijo. ¿Qué indica que sean distintos?`, ["La terminación: -ol es alcohol y -amina es amina", "El número de carbonos", "El tipo de enlace entre carbonos", "El estado de agregación"], 0, "Los dos tienen 2 carbonos (et-); la terminación define el grupo funcional."),
    ],
  },
  // ---------------------------------------------------------------- 5
  {
    slug: "quimia-tecnica-organica-nombrar-ramificado",
    grupo: "organica",
    orden: 5,
    requierePro: false,
    nombre: "Nombrar un ramificado en cuatro pasos",
    descripcion: "Cadena principal, numeración, ramificaciones y armado del nombre.",
    pasos: [
      "Paso 1: busca la cadena principal, la cadena continua de carbonos más larga (aunque el dibujo la presente doblada). Sus carbonos dan el prefijo y la terminación -ano.",
      "Paso 2: numera esa cadena por el extremo que le dé los números más bajos a las ramificaciones. Si la molécula tiene un grupo principal o un enlace doble o triple, esos tienen prioridad para recibir el número más bajo.",
      "Paso 3: nombra cada ramificación con su número (metil, etil, propil...). Si se repite, se usan di-, tri- o tetra- y se listan todos los números. Se ordenan alfabéticamente, sin contar di-, tri-.",
      `Paso 4: arma el nombre, con los números separados por comas, los números y las letras separados por guiones y todo pegado, en minúscula. Ejemplo: ${nomM("2,4-dimetilhexano")}: la cadena tiene 6 carbonos, los dos metilos están en los carbonos 2 y 4 (si se numerara al revés, serían 3 y 5, que son números más altos).`,
    ],
    visuales: [{ tipo: "quimia.cadena", despuesDePaso: 3, molecula: "2,4-dimetilhexano" }],
    quiz: [
      preg("Una cadena de 5 carbonos tiene un metilo en el carbono 2. ¿Cómo se llama?", [nomM("2-metilpentano"), "4-metilpentano", "2-metilhexano", "1-metilpentano"], 0, "Se numera desde el extremo más cercano a la ramificación: el metilo queda en el carbono 2. «4-metilpentano» sería numerar del lado equivocado."),
      preg("¿Por qué no existe el nombre «1-metilpropano»?", ["Porque la cadena más larga tendría 4 carbonos: es el butano", "Porque el metilo no puede estar en el extremo", "Porque el propano no admite ramificaciones", "Porque el número 1 no se usa nunca"], 0, "Un metilo en el extremo de un propano alarga la cadena a 4 carbonos: es butano (y la ramificación no existe). Por eso el metilo de un ramificado nunca lleva el número 1."),
      preg(`Un hexano con dos metilos, uno en el carbono 2 y otro en el 4, se llama...`, [nomM("2,4-dimetilhexano"), "2-metil-4-metilhexano", "2,4-dimetil hexano", "2,4-metilhexano"], 0, "Si el mismo radical se repite, se usa di-, se listan los números con comas y se escribe una sola vez: 2,4-dimetilhexano."),
      preg("En un compuesto con un etilo y un metilo, ¿cuál se nombra primero?", ["El etilo, por orden alfabético", "El metilo, porque es más chico", "El que tiene el número más alto", "Da lo mismo"], 0, `Se ordenan alfabéticamente: etil va antes que metil. Por ejemplo, ${nomM("3-etil-5-metilheptano")}.`),
    ],
  },
  // ---------------------------------------------------------------- 6
  {
    slug: "quimia-tecnica-organica-grupo-funcional",
    grupo: "organica",
    orden: 6,
    requierePro: false,
    nombre: "Reconocer el grupo funcional",
    descripcion: "Mirar qué átomos hay además de C y H, y cómo está unido el carbono del C=O.",
    pasos: [
      "Un grupo funcional es un átomo o grupo de átomos que da a la molécula sus propiedades características. Para reconocerlo, busca los átomos que no son carbono ni hidrógeno y cómo están unidos.",
      "Pistas: –OH es un alcohol; C–O–C es un éter; un halógeno (F, Cl, Br, I) es un haluro; N es una amina o una amida; un doble enlace C=C es un alqueno y un triple C≡C, un alquino.",
      "Si aparece un C=O (carbonilo), mira a qué está unido ese carbono: a un hidrógeno (y un carbono, o ninguno) es un aldehído; a dos carbonos, una cetona; a un –OH, un ácido carboxílico; a un –O–C, un éster; y a un –N, una amida.",
    ],
    visuales: [{ tipo: "quimia.grupos", despuesDePaso: 2, moleculas: ["propan-1-ol", "metoxietano", "propanal", "propanona", "acido-propanoico", "propanoato-de-metilo", "propan-1-amina", "propanamida", "1-cloropropano"] }],
    quiz: [
      preg(`¿A qué familia pertenece ${condM("propanona")}?`, ["Cetona", "Aldehído", "Éter", "Alcohol"], 0, "El C=O está en el medio de la cadena, unido a dos carbonos: es una cetona."),
      preg(`¿A qué familia pertenece ${condM("propanal")}?`, ["Aldehído", "Cetona", "Ácido carboxílico", "Éster"], 0, "El C=O está en el extremo, unido a un hidrógeno: es un aldehído."),
      preg(`¿A qué familia pertenece ${condM("metoxietano")}?`, ["Éter", "Alcohol", "Éster", "Cetona"], 0, "Hay un oxígeno entre dos carbonos (C–O–C) y ningún C=O: es un éter."),
      preg(`¿A qué familia pertenece ${condM("etanoato-de-metilo")}?`, ["Éster", "Ácido carboxílico", "Éter", "Amida"], 0, "El carbono del C=O está unido a un –O–C (un oxígeno que a su vez está unido a otro carbono): es un éster. Si estuviera unido a –OH sería un ácido."),
    ],
  },
  // ---------------------------------------------------------------- 7
  {
    slug: "quimia-tecnica-organica-isomeros",
    grupo: "organica",
    orden: 7,
    requierePro: false,
    nombre: "Isómeros: misma fórmula, distinta estructura",
    descripcion: "Cómo reconocer isómeros y de qué tipo son (cadena, posición, función).",
    pasos: [
      "Los isómeros son compuestos con la misma fórmula molecular pero distinta estructura (los átomos están unidos de otra manera). Tienen propiedades distintas.",
      `Para reconocerlos: calcula la fórmula molecular de cada uno. Si coincide y las estructuras son distintas, son isómeros. Por ejemplo, el ${nomM("butano")} y el ${nomM("2-metilpropano")} son ${molM("butano")}.`,
      "Hay tres tipos principales. De cadena: cambia el esqueleto de carbonos (lineal o ramificado). De posición: cambia dónde está el grupo o el enlace múltiple. De función: cambia el grupo funcional, o sea, la familia.",
      `Cuantos más carbonos, más isómeros de cadena: los alcanos de 4, 5 y 6 carbonos tienen ${ISOMEROS_ALCANOS[3]}, ${ISOMEROS_ALCANOS[4]} y ${ISOMEROS_ALCANOS[5]} isómeros respectivamente.`,
    ],
    visuales: [{ tipo: "quimia.isomeria", despuesDePaso: 1, moleculas: ["butano", "2-metilpropano"], isomeria: "cadena" }],
    quiz: [
      preg(`¿Qué tipo de isómeros son el ${nomM("etanol")} y el ${nomM("metoximetano")}?`, ["De función", "De cadena", "De posición", "No son isómeros"], 0, `Los dos son ${molM("etanol")}, pero uno es un alcohol y el otro un éter: cambia el grupo funcional.`),
      preg(`¿Qué tipo de isómeros son el ${nomM("propan-1-ol")} y el ${nomM("propan-2-ol")}?`, ["De posición", "De cadena", "De función", "Son el mismo compuesto"], 0, "Los dos son alcoholes de 3 carbonos, con el –OH en distinto carbono: isomería de posición."),
      preg("¿Cuántos isómeros de cadena tiene el pentano, C₅H₁₂ (contando el pentano mismo)?", ["3", "2", "5", "4"], 0, `Son el ${nomM("pentano")}, el ${nomM("2-metilbutano")} y el ${nomM("2,2-dimetilpropano")}.`),
      preg("Dos compuestos con fórmulas moleculares C₃H₈O y C₃H₆O, ¿son isómeros?", ["No: no tienen la misma fórmula molecular", "Sí: los dos tienen 3 carbonos", "Sí: los dos tienen oxígeno", "Solo si están en el mismo estado"], 0, "Para ser isómeros deben tener exactamente la misma fórmula molecular (los mismos átomos en la misma cantidad)."),
    ],
  },
  // ---------------------------------------------------------------- 8
  {
    slug: "quimia-tecnica-organica-combustion",
    grupo: "organica",
    orden: 8,
    requierePro: false,
    nombre: "Combustión de un hidrocarburo en tres pasos",
    descripcion: "Balancear la combustión completa: CO₂ igual a los carbonos, H₂O igual a la mitad de los hidrógenos y O₂ al final.",
    pasos: [
      "En la combustión completa un hidrocarburo reacciona con oxígeno (O₂) y produce dióxido de carbono (CO₂) y agua (H₂O). Se balancea en tres pasos, siempre en el mismo orden.",
      "Paso 1: el coeficiente del CO₂ es el número de carbonos. Paso 2: el coeficiente del H₂O es la mitad del número de hidrógenos. Paso 3: cuenta los oxígenos de la derecha y divide por 2 para obtener el O₂. Si da un número con «medio», multiplica toda la ecuación por 2.",
      `Ejemplo con el ${nomM("propano")} (${f("C3H8")}): 3 CO₂, 4 H₂O, y 3·2 + 4 = 10 oxígenos, o sea 5 O₂. ${cPropano.ecuacion}`,
      `Ejemplo con fracción, el ${nomM("etano")} (${f("C2H6")}): 2 CO₂, 3 H₂O y 2·2 + 3 = 7 oxígenos, o sea 7/2 de O₂ (tres moléculas y media). Como sale un medio, se duplica todo: ${cEtano.ecuacion}`,
    ],
    visuales: [
      cuadro(
        3,
        ["Hidrocarburo", "Combustión completa"],
        [
          [`${nomM("metano")}`, cMetano.ecuacion],
          [`${nomM("etano")}`, cEtano.ecuacion],
          [`${nomM("propano")}`, cPropano.ecuacion],
          [`${nomM("butano")}`, cButano.ecuacion],
          [`${nomM("eteno")}`, cEteno.ecuacion],
          [`${nomM("etino")}`, cEtino.ecuacion],
        ],
        "Combustión completa de seis hidrocarburos"
      ),
    ],
    quiz: [
      preg(`En la combustión completa del ${nomM("propano")}, ¿cuántos O₂ se necesitan por cada C₃H₈?`, ["5", "3", "4", "10"], 0, `${cPropano.ecuacion} Los oxígenos de la derecha son 3·2 + 4 = 10, o sea ${cPropano.k.o2} moléculas de O₂.`),
      preg(`En la combustión completa del ${nomM("metano")}, ¿cuántos H₂O se forman por cada CH₄?`, ["2", "1", "4", "3"], 0, `${cMetano.ecuacion} Los 4 hidrógenos forman 4/2 = ${cMetano.k.h2o} moléculas de agua.`),
      preg(`Al balancear la combustión del ${nomM("butano")}, ${f("C4H10")}, ¿cuántos O₂ se necesitan si se escriben 2 moléculas de butano?`, ["13", "6", "7", "26"], 0, `${cButano.ecuacion} Con 2 C₄H₁₀ se forman 8 CO₂ y 10 H₂O: 16 + 10 = 26 oxígenos, o sea ${cButano.k.o2} O₂.`),
      preg("¿Por qué a veces hay que duplicar todos los coeficientes en una combustión?", ["Porque el O₂ puede dar un «medio», y los coeficientes deben ser enteros", "Porque siempre se necesitan dos moléculas de hidrocarburo", "Porque el CO₂ tiene 2 oxígenos", "No hay que duplicar nunca"], 0, "Cuando el número de hidrógenos no es múltiplo de 4, el O₂ da un número con «medio» (como 7/2). Se multiplica todo por 2 para que los coeficientes sean enteros."),
    ],
  },
];
