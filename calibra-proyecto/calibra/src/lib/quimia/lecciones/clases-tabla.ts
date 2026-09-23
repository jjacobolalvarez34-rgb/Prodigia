import type { ClaseQuimia } from "./tipos";
import { preg, cuadro, ion, cfg, cfgAbrev, en } from "./ayudas";
import { ELEMENTOS } from "@/lib/practica/quimia";
import { electronesDeValencia } from "@/lib/quimia/datos";

// Clases del grupo "tabla": el átomo, cómo se organiza la tabla periódica,
// la configuración electrónica y las propiedades periódicas. Es el inicio del
// curso (la primera Clase es preview gratis). Todo dato numérico sale de
// funciones o tablas con test (datos.ts, tabla.ts); ver lecciones.test.ts.

const el = (s: string) => {
  const e = ELEMENTOS.find((x) => x.simbolo === s);
  if (!e) throw new Error(`Elemento desconocido: ${s}`);
  return e;
};

// Notación de isótopo: número másico arriba, atómico abajo ($^{35}_{17}\mathrm{Cl}$).
const iso = (a: number, z: number, simbolo: string) => `$^{${a}}_{${z}}\\mathrm{${simbolo}}$`;
// Fila de la tabla de isótopos: neutrones = A − Z.
const filaIsotopo = (nombre: string, simbolo: string, z: number, a: number) => [nombre, iso(a, z, simbolo), String(z), String(a - z), String(a)];

const filaPeriodo3 = (s: string) => {
  const e = el(s);
  return [s, String(e.numeroAtomico), cfgAbrev(e.numeroAtomico), String(electronesDeValencia(e.numeroAtomico)), String(e.grupo)];
};

export const CLASES_QUIMIA_TABLA: ClaseQuimia[] = [
  {
    slug: "quimia-clase-atomo-particulas",
    grupo: "tabla",
    orden: 1,
    requierePro: true,
    nombre: "Materia, átomo y partículas",
    descripcion: "De qué está hecha la materia, cómo es un átomo, qué son el número atómico, los isótopos y los iones.",
    pasos: [
      "La materia es todo lo que tiene masa y ocupa un lugar en el espacio, y está formada por átomos. Una sustancia con un solo tipo de átomo es un elemento (oxígeno, hierro, oro). Una sustancia con átomos de distintos elementos unidos en proporciones fijas es un compuesto (agua, sal común).",
      "Un átomo tiene un núcleo diminuto en el centro y electrones que lo rodean. En el núcleo hay protones (carga positiva, +1) y neutrones (sin carga). Los electrones tienen carga negativa (−1) y una masa unas 1800 veces menor que la de un protón, así que casi toda la masa del átomo está en el núcleo.",
      "El número atómico (Z) es la cantidad de protones del núcleo. Es lo que define al elemento: todos los átomos con Z = 8 son de oxígeno. En un átomo neutro, los electrones son tantos como los protones (Z), porque las cargas positivas y negativas se compensan.",
      "El número másico (A) es la suma de protones y neutrones: A = Z + N. De ahí sale el número de neutrones: N = A − Z. Se escribe con A arriba y Z abajo del símbolo.",
      `Ejemplo resuelto. El carbono-12 ${iso(12, 6, "C")} tiene 6 protones (Z = 6), 6 electrones y 12 − 6 = 6 neutrones. El sodio-23 ${iso(23, 11, "Na")} tiene 11 protones, 11 electrones y 23 − 11 = 12 neutrones.`,
      "Los isótopos son átomos del mismo elemento (mismo Z) con distinta cantidad de neutrones, y por lo tanto distinto A. Se comportan casi igual en química. Por eso la masa atómica que figura en la tabla es un promedio de los isótopos naturales: la del cloro, 35,45 u, sale de una mezcla de cloro-35 y cloro-37.",
      `Un ion es un átomo (o un grupo de átomos) con carga eléctrica, porque ganó o perdió electrones. Los protones NO cambian. Si pierde electrones queda con carga positiva y se llama catión: ${ion("Na", 1)} perdió 1 electrón. Si gana electrones queda con carga negativa y se llama anión: ${ion("Cl", -1)} ganó 1 electrón.`,
      `La carga del ion es (protones − electrones). El ion ${ion("Mg", 2)} tiene Z = 12 y perdió 2 electrones: 12 protones y 10 electrones. El ion ${ion("O", -2)} tiene Z = 8 y ganó 2 electrones: 8 protones y 10 electrones.`,
      "Error común: para formar un catión no se pierden protones (eso convertiría al átomo en otro elemento), solo se pierden o se ganan electrones. Otro error frecuente es confundir el número atómico (Z) con el másico (A): el Z es chico y define al elemento; el A siempre es mayor o igual.",
    ],
    visuales: [
      cuadro(
        1,
        ["Partícula", "Carga", "Masa", "Dónde está"],
        [
          ["Protón", "+1", "1 u", "núcleo"],
          ["Neutrón", "0", "1 u (casi igual que el protón)", "núcleo"],
          ["Electrón", "−1", "casi 0 (unas 1800 veces menos que un protón)", "alrededor del núcleo, en capas"],
        ],
        "Las tres partículas del átomo"
      ),
      cuadro(
        5,
        ["Isótopo", "Notación", "Protones (Z)", "Neutrones", "A"],
        [filaIsotopo("Protio", "H", 1, 1), filaIsotopo("Deuterio", "H", 1, 2), filaIsotopo("Tritio", "H", 1, 3), filaIsotopo("Cloro-35", "Cl", 17, 35), filaIsotopo("Cloro-37", "Cl", 17, 37)],
        "Isótopos: mismo Z, distinto A"
      ),
    ],
    quiz: [
      preg("¿Cuántos neutrones tiene un átomo con Z = 17 y A = 35?", ["17", "18", "35", "52"], 1, "N = A − Z = 35 − 17 = 18."),
      preg("¿Qué determina que un átomo sea de un elemento y no de otro?", ["Su número de neutrones", "Su número de protones", "Su número de electrones libres", "Su masa en gramos"], 1, "El número atómico Z (la cantidad de protones) identifica al elemento. Los neutrones pueden variar (isótopos) y los electrones también (iones)."),
      preg("Los isótopos de un mismo elemento tienen...", ["distinto número de protones y el mismo de neutrones", "el mismo número de protones y distinto número de neutrones", "distinto número de electrones y de protones", "la misma masa siempre"], 1, "Mismo Z (mismos protones) y distinto A por tener distinta cantidad de neutrones: por ejemplo, protio, deuterio y tritio."),
      preg(`El ion ${ion("Ca", 2)} viene del calcio, cuyo Z es ${el("Ca").numeroAtomico}. ¿Cuántos electrones tiene?`, ["18", "20", "22", "2"], 0, "El átomo neutro tiene 20 electrones; el ion 2+ perdió 2, así que le quedan 18. Sus protones siguen siendo 20."),
      preg("¿Qué partícula tiene carga negativa?", ["Protón", "Neutrón", "Electrón", "El núcleo"], 2, "El electrón tiene carga −1. El protón es +1 y el neutrón no tiene carga."),
      preg(`Un átomo neutro tiene Z = 13 y A = 27. ¿Cuántos protones, neutrones y electrones tiene?`, ["13, 14 y 13", "13, 13 y 14", "14, 13 y 14", "27, 13 y 13"], 0, "Protones = Z = 13; electrones = 13 (es neutro); neutrones = 27 − 13 = 14. Es el aluminio-27."),
    ],
  },
  {
    slug: "quimia-clase-organizacion-tabla",
    grupo: "tabla",
    orden: 2,
    requierePro: true,
    nombre: "Cómo se organiza la tabla periódica",
    descripcion: "Períodos, grupos, bloques, familias, y metales, no metales y metaloides.",
    pasos: [
      "La tabla periódica ordena los elementos por número atómico creciente (Z) y los acomoda de modo que los de propiedades parecidas queden en la misma columna. La propuso Mendeléyev en 1869 ordenando por masa atómica; hoy se ordena por Z.",
      "Los períodos son las 7 filas horizontales. El número de período indica cuántas capas de electrones tiene el átomo. El período 1 tiene solo 2 elementos (H y He); los períodos 2 y 3 tienen 8; los períodos 4 y 5, 18; y los períodos 6 y 7, 32 (contando las dos filas que se dibujan aparte, debajo).",
      "Los grupos son las 18 columnas verticales, numeradas de 1 a 18. Los elementos de un mismo grupo tienen propiedades parecidas porque, en los grupos principales, tienen los mismos electrones de valencia. Los grupos 1, 2 y 13 a 18 son los grupos principales; los grupos 3 a 12 son los metales de transición. En libros antiguos los principales se llaman IA a VIIIA (IA es el grupo 1, IIA el 2, IIIA el 13... VIIIA el 18): es la misma información con otra etiqueta.",
      "Los bloques (s, p, d y f) indican cuál subcapa recibe los últimos electrones. El bloque s son los grupos 1 y 2 (más el helio); el bloque p, los grupos 13 a 18; el bloque d, los grupos 3 a 12; y el bloque f, los lantánidos y actínidos de las filas de abajo.",
      "Las familias son grupos de elementos con nombre propio. Los metales alcalinos (Li, Na, K, Rb, Cs, Fr) son blandos y muy reactivos: reaccionan con el agua. Los alcalinotérreos (Be, Mg, Ca, Sr, Ba, Ra) son algo menos reactivos. Los metales de transición (Fe, Cu, Zn, Ag, Au...) son duros, buenos conductores y con varios estados de oxidación. Los halógenos (F, Cl, Br, I, At) son no metales muy reactivos que forman sales con los metales. Los gases nobles (He, Ne, Ar, Kr, Xe, Rn) casi no reaccionan. Los lantánidos y los actínidos completan la tabla por debajo.",
      "En el colegio también se usan los nombres de los otros grupos: térreos (grupo 13: B, Al...), carbonoideos (grupo 14: C, Si...), nitrogenoideos (grupo 15: N, P...) y anfígenos o calcógenos (grupo 16: O, S...).",
      "Los metales son la gran mayoría de los elementos, están a la izquierda y en el centro; brillan, conducen el calor y la electricidad, se pueden estirar y aplastar, y son sólidos salvo el mercurio, que es líquido. Los no metales están arriba a la derecha, más el hidrógeno: no conducen bien, son quebradizos si son sólidos y muchos son gases. Los metaloides (B, Si, Ge, As, Sb y Te) tienen propiedades intermedias; el silicio, por ejemplo, es un semiconductor.",
      "Cómo leer una posición. El cloro está en el período 3 y en el grupo 17: tiene 3 capas y 7 electrones de valencia, y es un halógeno. El calcio está en el período 4 y en el grupo 2: tiene 4 capas y 2 electrones de valencia, y es un alcalinotérreo.",
      "Nota de nivel colegio: los lantánidos (Z 57 a 71) y los actínidos (Z 89 a 103) se dibujan debajo para que la tabla no sea demasiado ancha, pero pertenecen a los períodos 6 y 7. Los libros no coinciden del todo en cómo asignan el grupo 3, y a este nivel no hace falta entrar en esa discusión.",
    ],
    visuales: [
      {
        tipo: "quimia.tabla",
        despuesDePaso: 1,
        pasos: [
          { seleccion: { por: "periodo", n: 1 }, etiqueta: "Período 1: solo H y He." },
          { seleccion: { por: "periodo", n: 2 }, etiqueta: "Período 2: de Li a Ne (8 elementos)." },
          { seleccion: { por: "periodo", n: 3 }, etiqueta: "Período 3: de Na a Ar (8 elementos)." },
          { seleccion: { por: "periodo", n: 4 }, etiqueta: "Período 4: de K a Kr (18 elementos)." },
        ],
      },
      {
        tipo: "quimia.tabla",
        despuesDePaso: 2,
        pasos: [
          { seleccion: { por: "grupo", n: 1 }, etiqueta: "Grupo 1: H, Li, Na, K, Rb, Cs y Fr." },
          { seleccion: { por: "grupo", n: 2 }, etiqueta: "Grupo 2: Be, Mg, Ca, Sr, Ba y Ra." },
          { seleccion: { por: "grupo", n: 17 }, etiqueta: "Grupo 17: los halógenos." },
          { seleccion: { por: "grupo", n: 18 }, etiqueta: "Grupo 18: los gases nobles." },
        ],
      },
      {
        tipo: "quimia.tabla",
        despuesDePaso: 3,
        pasos: [
          { seleccion: { por: "bloque", bloque: "s" }, etiqueta: "Bloque s: grupos 1 y 2, más el helio." },
          { seleccion: { por: "bloque", bloque: "p" }, etiqueta: "Bloque p: grupos 13 a 18." },
          { seleccion: { por: "bloque", bloque: "d" }, etiqueta: "Bloque d: grupos 3 a 12." },
          { seleccion: { por: "bloque", bloque: "f" }, etiqueta: "Bloque f: lantánidos y actínidos." },
        ],
      },
      {
        tipo: "quimia.tabla",
        despuesDePaso: 4,
        pasos: [
          { seleccion: { por: "familia", familia: "alcalino" }, etiqueta: "Metales alcalinos: blandos y muy reactivos." },
          { seleccion: { por: "familia", familia: "alcalinoterreo" }, etiqueta: "Metales alcalinotérreos." },
          { seleccion: { por: "familia", familia: "transicion" }, etiqueta: "Metales de transición." },
          { seleccion: { por: "familia", familia: "halogeno" }, etiqueta: "Halógenos." },
          { seleccion: { por: "familia", familia: "gasNoble" }, etiqueta: "Gases nobles." },
          { seleccion: { por: "familia", familia: "lantanido" }, etiqueta: "Lantánidos." },
          { seleccion: { por: "familia", familia: "actinido" }, etiqueta: "Actínidos." },
        ],
      },
      {
        tipo: "quimia.tabla",
        despuesDePaso: 6,
        pasos: [
          { seleccion: { por: "tipo", tipo: "metal" }, etiqueta: "Metales: izquierda, centro y abajo." },
          { seleccion: { por: "tipo", tipo: "metaloide" }, etiqueta: "Metaloides: B, Si, Ge, As, Sb y Te." },
          { seleccion: { por: "tipo", tipo: "nometal" }, etiqueta: "No metales: arriba a la derecha, más el hidrógeno." },
        ],
      },
      {
        tipo: "quimia.tabla",
        despuesDePaso: 7,
        pasos: [
          { seleccion: { por: "elementos", simbolos: ["Cl"] }, etiqueta: "Cloro: período 3, grupo 17 (halógeno)." },
          { seleccion: { por: "elementos", simbolos: ["Ca"] }, etiqueta: "Calcio: período 4, grupo 2 (alcalinotérreo)." },
        ],
      },
    ],
    quiz: [
      preg("El número de período de un elemento indica...", ["cuántos electrones de valencia tiene", "cuántas capas de electrones tiene", "cuántos neutrones tiene", "su masa atómica"], 1, "El período es la fila: coincide con la cantidad de capas del átomo. El grupo (columna) es lo que indica los electrones de valencia."),
      preg("¿Cuál de estos elementos es un halógeno?", ["Sodio (Na)", "Bromo (Br)", "Argón (Ar)", "Hierro (Fe)"], 1, "El bromo está en el grupo 17. El sodio es alcalino, el argón es un gas noble y el hierro es un metal de transición."),
      preg("El calcio (Ca) está en el grupo 2. ¿A qué familia pertenece?", ["Metales alcalinos", "Metales alcalinotérreos", "Halógenos", "Gases nobles"], 1, "El grupo 2 son los alcalinotérreos: Be, Mg, Ca, Sr, Ba y Ra."),
      preg("¿A qué bloque pertenece el hierro (Fe)?", ["Bloque s", "Bloque p", "Bloque d", "Bloque f"], 2, "El hierro está en el grupo 8, entre los grupos 3 a 12: bloque d."),
      preg("¿Cuál de estas listas contiene solo metaloides?", ["Na, Mg y Al", "B, Si y Ge", "O, S y Se", "Fe, Cu y Zn"], 1, "Los metaloides son B, Si, Ge, As, Sb y Te."),
      preg("El hidrógeno está en el grupo 1. ¿Es un metal alcalino?", ["Sí, como el litio y el sodio", "No: es un no metal", "Sí, pero es un gas", "Es un metaloide"], 1, "El hidrógeno es un no metal. Se ubica arriba del grupo 1 por su configuración electrónica, pero no es alcalino."),
    ],
  },
  {
    slug: "quimia-clase-configuracion-electronica",
    grupo: "tabla",
    orden: 3,
    requierePro: true,
    nombre: "Configuración electrónica y electrones de valencia",
    descripcion: "Cómo se reparten los electrones en capas y subcapas, la regla de Aufbau, los electrones de valencia y por qué el grupo determina la valencia.",
    pasos: [
      "Los electrones se ubican en capas o niveles de energía (n = 1, 2, 3...) y, dentro de cada capa, en subcapas: s, p, d y f. Cada subcapa admite un máximo de electrones: s, 2; p, 6; d, 10; f, 14. La capa n = 1 solo tiene la subcapa 1s; la n = 2 tiene 2s y 2p; la n = 3 tiene 3s, 3p y 3d; desde la n = 4 aparece también la 4f.",
      "La regla de Aufbau (de construcción) dice que los electrones ocupan primero las subcapas de menor energía. El orden lo da el diagrama de Moeller: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, 5s, 4d, 5p, 6s, 4f, 5d, 6p, 7s, 5f, 6d, 7p. Fíjate que la 4s se llena antes que la 3d. Truco: se llenan de menor a mayor suma n + l (con s = 0, p = 1, d = 2, f = 3), y a igual suma, primero la de menor n.",
      `Ejemplos que puedes verificar sumando los exponentes. Hidrógeno (Z = 1): ${cfg(1)}. Oxígeno (Z = 8): ${cfg(8)}, 8 electrones. Sodio (Z = 11): ${cfg(11)}. Cloro (Z = 17): ${cfg(17)}. Hierro (Z = 26): ${cfg(26)}: 2 + 2 + 6 + 2 + 6 + 2 + 6 = 26.`,
      `La configuración abreviada reemplaza la parte igual a la del gas noble anterior por su símbolo entre corchetes. Sodio: ${cfgAbrev(11)}. Cloro: ${cfgAbrev(17)}. Hierro: ${cfgAbrev(26)}.`,
      `Hay excepciones a la regla. El cromo (Z = 24) es ${cfgAbrev(24)} y el cobre (Z = 29) es ${cfgAbrev(29)}, y no ${"$\\mathrm{[Ar]\\,4s^{2}\\,3d^{4}}$"} ni ${"$\\mathrm{[Ar]\\,4s^{2}\\,3d^{9}}$"}: una subcapa d llena o semillena es especialmente estable. Hay más excepciones en los períodos 5 y 6 (plata, oro, paladio...). A este nivel se aceptan como excepciones conocidas.`,
      "Los electrones de valencia son los de la capa más externa (la de mayor n). En los grupos principales coinciden con el número de grupo (grupos 1 y 2) o con el número de grupo menos 10 (grupos 13 a 18). Por eso cada columna de la tabla se comporta de manera parecida: sus elementos tienen la misma cantidad de electrones de valencia.",
      "Los átomos tienden a quedar con 8 electrones en la capa externa (2 en el caso del hidrógeno y el helio), como el gas noble más cercano: es la regla del octeto. Los elementos de los grupos 1, 2 y 13 lo logran perdiendo electrones, y los de los grupos 15, 16 y 17, ganándolos. Por eso el grupo determina la valencia: el sodio (1 electrón de valencia) pierde 1 y queda con carga +1; el cloro (7) gana 1 y queda con carga −1.",
      "Cómo se ve en la tabla: el período es el número de la última capa (la n más alta) y el bloque indica cuál subcapa recibió el último electrón. El hierro termina en 3d (bloque d) y su capa más alta es la 4 (período 4).",
    ],
    visuales: [
      { tipo: "quimia.orbitales", despuesDePaso: 2, z: 8 },
      { tipo: "quimia.orbitales", despuesDePaso: 2, z: 26 },
      cuadro(
        5,
        ["Elemento", "Z", "Configuración", "e⁻ de valencia", "Grupo"],
        ["Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"].map(filaPeriodo3),
        "Período 3: los electrones de valencia siguen al grupo"
      ),
    ],
    quiz: [
      preg("¿Cuántos electrones caben como máximo en una subcapa p?", ["2", "6", "10", "14"], 1, "s admite 2, p admite 6, d admite 10 y f admite 14."),
      preg("¿Cuál es la configuración electrónica del sodio (Z = 11)?", [cfg(11), "$\\mathrm{1s^{2}\\,2s^{2}\\,2p^{7}}$", "$\\mathrm{1s^{2}\\,2s^{2}\\,2p^{6}\\,3s^{2}}$", "$\\mathrm{1s^{1}\\,2s^{2}\\,2p^{6}\\,3s^{2}}$"], 0, "1s² 2s² 2p⁶ 3s¹: suma 2 + 2 + 6 + 1 = 11. El único electrón de la capa 3 es su electrón de valencia."),
      preg("El azufre (S) está en el grupo 16. ¿Cuántos electrones de valencia tiene?", ["2", "4", "6", "16"], 2, "Grupo 16 menos 10 = 6 electrones de valencia."),
      preg("Según la regla de Aufbau, ¿qué subcapa se llena justo después de la 3p?", ["3d", "4s", "4p", "2p"], 1, "El orden es ... 3s, 3p, 4s, 3d: la 4s tiene menor energía que la 3d y se llena antes."),
      preg("¿Cuál es la configuración electrónica abreviada real del cobre (Cu, Z = 29)?", [cfgAbrev(29), cfgAbrev(26), "$\\mathrm{[Ar]\\,4s^{2}\\,3d^{9}}$", "$\\mathrm{[Ne]\\,3s^{1}}$"], 0, "El cobre es una excepción: [Ar] 4s¹ 3d¹⁰, porque la subcapa d llena es más estable que 4s² 3d⁹."),
      preg("El hierro (Fe, Z = 26) tiene la configuración 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶. ¿Cuántos electrones hay en la capa n = 4?", ["0", "2", "6", "8"], 1, "En la capa 4 solo está la subcapa 4s con 2 electrones (los 6 de la 3d pertenecen a la capa 3)."),
    ],
  },
  {
    slug: "quimia-clase-propiedades-periodicas",
    grupo: "tabla",
    orden: 4,
    requierePro: true,
    nombre: "Propiedades periódicas",
    descripcion: "Radio atómico, energía de ionización, afinidad electrónica y electronegatividad: cómo cambian por período y por grupo, y por qué.",
    pasos: [
      "Las propiedades periódicas son propiedades de los átomos que cambian de forma regular al recorrer la tabla. Las cuatro principales son el radio atómico, la energía de ionización, la afinidad electrónica y la electronegatividad. Todas dependen de dos cosas: cuántas capas tiene el átomo y cuánta carga positiva del núcleo siente el electrón externo.",
      "El radio atómico es el tamaño del átomo. En un grupo aumenta hacia abajo, porque hay más capas. En un período disminuye hacia la derecha: el núcleo tiene más protones y atrae con más fuerza a las mismas capas. Además, un catión es más chico que su átomo (perdió electrones) y un anión es más grande (ganó electrones).",
      "La energía de ionización es la energía necesaria para arrancarle un electrón a un átomo gaseoso neutro. Cuanto más fuerte lo retiene el núcleo, más energía hace falta. Aumenta hacia la derecha en un período y hacia arriba en un grupo (al revés que el radio): es más difícil arrancar un electrón de un átomo chico. El helio tiene la más alta de todas. Hay pequeñas irregularidades (entre Be y B, o entre N y O) que a este nivel no se estudian.",
      "La afinidad electrónica es la energía que se libera, en general, cuando un átomo gaseoso neutro gana un electrón. Cuanto mayor es, más «quiere» el átomo ese electrón. Tiende a aumentar hacia la derecha y hacia arriba: los halógenos tienen valores muy altos y los gases nobles, casi nulos. Tiene excepciones conocidas: el cloro tiene más afinidad electrónica que el flúor.",
      `La electronegatividad mide cuánto atrae un átomo los electrones cuando está unido a otro. No es una energía medida directamente, sino una escala (la de Pauling, de aproximadamente 0,7 a 4,0). Aumenta hacia la derecha y hacia arriba. El flúor (${en("F")}) es el más electronegativo; los metales alcalinos y alcalinotérreos están por debajo de 1,6. Los gases nobles casi no forman enlaces y a este nivel no se les asigna valor.`,
      "Regla para recordar: todo lo que tiene que ver con atraer electrones (energía de ionización, afinidad electrónica y electronegatividad) crece hacia arriba y hacia la derecha, hacia el flúor. El radio atómico hace lo contrario: crece hacia abajo y hacia la izquierda, hacia el francio. Con eso puedes comparar dos elementos cualesquiera.",
      "Ejemplos resueltos. ¿Quién tiene mayor radio, el Na o el Mg? Los dos son del período 3 y el Na está más a la izquierda: el Na. ¿Quién tiene mayor energía de ionización, el K o el Li? Los dos son del grupo 1 y el Li está más arriba: el Li. ¿Quién es más electronegativo, el S o el Cl? Los dos son del período 3 y el Cl está más a la derecha: el Cl.",
      "El carácter metálico (qué tan metal es un elemento) sigue el camino del radio: aumenta hacia abajo y hacia la izquierda. Por eso los metales más reactivos están abajo a la izquierda (Cs, Fr) y los no metales más reactivos, arriba a la derecha (F, O, Cl).",
    ],
    visuales: [
      {
        tipo: "quimia.tabla",
        despuesDePaso: 1,
        pasos: [
          { flecha: "abajo", etiqueta: "Radio atómico: aumenta hacia abajo en un grupo (más capas)." },
          { flecha: "izquierda", etiqueta: "Radio atómico: aumenta hacia la izquierda en un período (menos protones que atraen)." },
        ],
      },
      {
        tipo: "quimia.tabla",
        despuesDePaso: 2,
        pasos: [
          { flecha: "derecha", etiqueta: "Energía de ionización: aumenta hacia la derecha en un período." },
          { flecha: "arriba", etiqueta: "Energía de ionización: aumenta hacia arriba en un grupo." },
        ],
      },
      cuadro(
        4,
        ["Período 2", "Electronegatividad", "Grupo 17", "Electronegatividad"],
        [
          ["Li", en("Li"), "F", en("F")],
          ["Be", en("Be"), "Cl", en("Cl")],
          ["B", en("B"), "Br", en("Br")],
          ["C", en("C"), "I", en("I")],
          ["N", en("N"), "", ""],
          ["O", en("O"), "", ""],
          ["F", en("F"), "", ""],
        ],
        "La electronegatividad sube hacia el flúor"
      ),
      cuadro(
        5,
        ["Propiedad", "En un período (→)", "En un grupo (↓)"],
        [
          ["Radio atómico", "disminuye", "aumenta"],
          ["Energía de ionización", "aumenta", "disminuye"],
          ["Afinidad electrónica", "aumenta (con excepciones)", "disminuye (con excepciones)"],
          ["Electronegatividad", "aumenta", "disminuye"],
          ["Carácter metálico", "disminuye", "aumenta"],
        ],
        "Resumen de tendencias"
      ),
    ],
    quiz: [
      preg("¿Cómo cambia el radio atómico al bajar por un grupo?", ["Disminuye", "Aumenta", "No cambia", "Se hace cero"], 1, "Al bajar hay más capas de electrones, así que el átomo es más grande."),
      preg("¿Cuál de estos átomos tiene mayor radio?", ["Litio (Li)", "Sodio (Na)", "Cloro (Cl)", "Flúor (F)"], 1, "El sodio (período 3, grupo 1) está más abajo que el litio y más a la izquierda que el cloro: es el más grande de los cuatro."),
      preg("¿Cuál de estos elementos tiene mayor energía de ionización?", ["Sodio (Na)", "Potasio (K)", "Neón (Ne)", "Calcio (Ca)"], 2, "El neón está arriba y a la derecha: retiene muy fuerte sus electrones y cuesta mucho arrancarle uno."),
      preg("Entre el azufre (S) y el cloro (Cl), ¿cuál es más electronegativo?", ["El azufre", "El cloro", "Los dos por igual", "Ninguno"], 1, `El cloro está más a la derecha en el período 3: ${en("Cl")} contra ${en("S")}.`),
      preg("Un catión, comparado con su átomo neutro, es...", ["más grande", "más chico", "igual", "depende del elemento"], 1, "Al perder electrones, los que quedan son atraídos con más fuerza por el núcleo: el ion positivo es más chico."),
      preg("¿Hacia dónde crecen la energía de ionización, la afinidad electrónica y la electronegatividad?", ["Hacia abajo y a la izquierda", "Hacia arriba y a la derecha", "Hacia abajo y a la derecha", "Hacia arriba y a la izquierda"], 1, "Crecen hacia el flúor, arriba a la derecha. El radio atómico es lo contrario."),
    ],
  },
];
