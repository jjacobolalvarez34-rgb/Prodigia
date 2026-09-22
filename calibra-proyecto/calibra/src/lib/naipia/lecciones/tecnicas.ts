import { QUIZ_NAIPIA } from "./quiz";
import { cartas, cuenta, m, mazoCompleto, sumaEscrita, valor } from "./ayudas";
import type { LeccionNaipia } from "./tipos";

// Las 5 Técnicas (gratis) de Naipia en el formato visual. Fuente ÚNICA de
// la migración 0196: `pasos` es la introducción y la explicación real son
// los `visuales`. Los números de los textos salen de TABLA_SISTEMAS (ver
// ayudas.ts), no de memoria; lecciones.test.ts los verifica de nuevo con
// un cálculo independiente.

const SEC_PARES = "K♠ 3♥ 9♦ 5♣ A♠ 2♦ 7♥ Q♣";
const SEC_BLOQUES = "4♠ 6♥ 2♦ K♣ 8♠ A♥ 3♣ 10♦ 5♠";
const SEC_RITMO = "5♠ K♥ 2♦ 8♣ Q♠ 4♥ 9♦ 6♣ A♠ 3♥ 10♦ 7♠";
const SEC_VISTAS = "2♠ 3♥ 4♦ 9♣ K♠ 5♥ 7♦ 6♣ Q♥ 8♠";
const SEC_NEUTRAS = "8♠ 9♥ 7♦ 4♣";
const SEC_NEUTRAS_SISTEMAS = "7♠ 8♥ 9♦ A♣";

const bloques = (secuencia: string, tam: number): number[] => {
  const cs = cartas(secuencia);
  const salida: number[] = [];
  for (let i = 0; i < cs.length; i += tam) salida.push(cuenta("hilo", cs.slice(i, i + tam).join(" ")));
  return salida;
};
const [b1, b2, b3] = bloques(SEC_BLOQUES, 3);
const conteoVistas = cuenta("hilo", SEC_VISTAS);
const restoMazo = mazoCompleto("hilo") - conteoVistas;
const cartasRestantes = 52 - cartas(SEC_VISTAS).length;

export const TECNICAS: LeccionNaipia[] = [
  {
    slug: "naipia-tecnica-pares",
    orden: 1,
    requierePro: false,
    pasos: [
      `En Hi-Lo, una carta baja vale ${m(valor("hilo", "4"))} y una alta vale ${m(valor("hilo", "K"))}. Si ves una de cada una, se cancelan: juntas valen ${m(0)}.`,
      `Mira la secuencia de abajo: primero se apartan las neutras y luego se buscan los pares. Solo cuenta lo que queda sin pareja: aquí el conteo es ${m(cuenta("hilo", SEC_PARES))}.`,
      "Los pares no tienen que estar juntos, pero no uses la misma carta en dos pares.",
    ],
    visuales: [
      { tipo: "naipia.valores", sistema: "hilo", despuesDePaso: 0, titulo: "Bajas, neutras y altas en Hi-Lo" },
      {
        tipo: "naipia.cancelacion",
        sistema: "hilo",
        cartas: cartas(SEC_PARES),
        despuesDePaso: 1,
        titulo: "Los pares se tocan y desaparecen",
      },
    ],
    quiz: QUIZ_NAIPIA["naipia-tecnica-pares"],
  },
  {
    slug: "naipia-tecnica-bloques",
    orden: 2,
    requierePro: false,
    pasos: [
      "Sumar carta por carta obliga a actualizar el conteo muchas veces, y cada actualización es una oportunidad de error. Con bloques resumes tres cartas de un vistazo y actualizas una sola vez.",
      `Mira un bloque, calcula su valor completo y recién ahí súmalo al conteo corriente. Aquí los bloques valen ${m(b1)}, ${m(b2)} y ${m(b3)}, y el conteo final es ${m(cuenta("hilo", SEC_BLOQUES))}.`,
      "Con práctica el bloque crece solo. Si empiezas a fallar, vuelve a bloques más chicos: la precisión importa más que la velocidad al principio.",
    ],
    visuales: [
      {
        tipo: "naipia.conteo",
        sistema: "hilo",
        cartas: cartas(SEC_BLOQUES),
        bloque: 3,
        velocidad: 2200,
        despuesDePaso: 1,
        titulo: "Un bloque de 3 cartas, una sola actualización",
      },
    ],
    quiz: QUIZ_NAIPIA["naipia-tecnica-bloques"],
  },
  {
    slug: "naipia-tecnica-ritmo",
    orden: 3,
    requierePro: false,
    pasos: [
      "La mayor causa de errores no es la aritmética sino el ritmo irregular: acelerar en las cartas fáciles y trabarse en las difíciles hace perder el hilo.",
      "Elige un ritmo que puedas sostener y mantenlo carta tras carta. Lleva solo el conteo corriente en la cabeza, sin repetir la lista de cartas.",
      "Si pierdes el hilo, no adivines: vuelve a un conteo que conozcas y sigue con el mismo ritmo.",
    ],
    visuales: [
      {
        tipo: "naipia.conteo",
        sistema: "hilo",
        cartas: cartas(SEC_RITMO),
        velocidad: 1100,
        despuesDePaso: 1,
        titulo: "Una carta cada cierto tiempo, siempre igual",
      },
      {
        tipo: "cuadros",
        despuesDePaso: 2,
        titulo: "Cómo entrenar el ritmo",
        cuadros: [
          { texto: "Primero, precisión: cuenta sin apuro hasta que no falles.", resaltar: "0 errores" },
          { texto: "Cuando ya no fallas, acorta el tiempo por carta de a poco." },
          { texto: "Si vuelves a fallar, retrocede un paso: el ritmo parejo se construye, no se fuerza." },
        ],
      },
    ],
    quiz: QUIZ_NAIPIA["naipia-tecnica-ritmo"],
  },
  {
    slug: "naipia-tecnica-mazo-cero",
    orden: 4,
    requierePro: false,
    pasos: [
      `Un mazo tiene 52 cartas, 4 de cada rango. En Hi-Lo, sumadas todas, dan exactamente ${m(mazoCompleto("hilo"))}: por eso es un sistema balanceado.`,
      `Sirve para comprobar tu conteo: si contaste un mazo entero y no te dio ${m(mazoCompleto("hilo"))}, hubo un error.`,
      "Y sirve al revés: lo que queda del mazo suma lo opuesto de lo que ya viste.",
    ],
    visuales: [
      { tipo: "naipia.mazo", sistema: "hilo", despuesDePaso: 0, titulo: "La suma de un mazo completo" },
      {
        tipo: "cuadros",
        despuesDePaso: 2,
        titulo: "Lo que queda del mazo",
        cuadros: [
          { texto: `Viste ${cartas(SEC_VISTAS).length} cartas de un mazo: ${SEC_VISTAS}.` },
          { texto: "Su conteo con Hi-Lo:", formula: sumaEscrita("hilo", SEC_VISTAS), resaltar: m(conteoVistas) },
          {
            texto: `El mazo completo suma ${m(mazoCompleto("hilo"))}, así que las ${cartasRestantes} cartas que quedan suman:`,
            formula: `${mazoCompleto("hilo")} - (${conteoVistas > 0 ? "+" : ""}${conteoVistas}) = ${restoMazo}`,
            resaltar: m(restoMazo),
          },
        ],
      },
    ],
    quiz: QUIZ_NAIPIA["naipia-tecnica-mazo-cero"],
  },
  {
    slug: "naipia-tecnica-neutras",
    orden: 5,
    requierePro: false,
    pasos: [
      `En Hi-Lo, los 7, 8 y 9 valen ${m(valor("hilo", "8"))}: cuando salen no hay que hacer nada, el conteo se queda igual.`,
      `Ejemplo: ${SEC_NEUTRAS} son tres neutras y un 4 que vale ${m(valor("hilo", "4"))}. El conteo es ${m(cuenta("hilo", SEC_NEUTRAS))}.`,
      `Ojo: las neutras cambian de un sistema a otro. En KO el 7 pasa a valer ${m(valor("ko", "7"))}, y en Hi-Opt II el As vale ${m(valor("hiopt2", "A"))}.`,
    ],
    visuales: [
      { tipo: "naipia.valores", sistema: "hilo", enfatizar: 0, despuesDePaso: 0, titulo: "Las neutras de Hi-Lo" },
      {
        tipo: "naipia.conteo",
        sistema: "hilo",
        cartas: cartas(SEC_NEUTRAS),
        velocidad: 1500,
        despuesDePaso: 1,
        titulo: "Las neutras no mueven el conteo",
      },
      {
        tipo: "naipia.comparar",
        sistemas: ["hilo", "ko", "hiopt2", "omega2"],
        cartas: cartas(SEC_NEUTRAS_SISTEMAS),
        despuesDePaso: 2,
        titulo: "Las neutras cambian según el sistema",
      },
    ],
    quiz: QUIZ_NAIPIA["naipia-tecnica-neutras"],
  },
];
