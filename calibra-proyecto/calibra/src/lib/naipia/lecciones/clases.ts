import { QUIZ_NAIPIA } from "./quiz";
import { cartas, cuenta, dec, dividir, m, mazoCompleto, sumaEscrita, valor } from "./ayudas";
import type { LeccionNaipia } from "./tipos";

// Las 8 Clases (Pro) de Naipia en el formato visual. Misma fuente y mismas
// reglas que tecnicas.ts: los números de los textos salen de las tablas.

const SEC_UNO = "3♠ K♥ 6♦ 2♣ 9♠";
const SEC_UNO_REORDENADA = "9♠ 2♣ K♥ 6♦ 3♠";
const SEC_HILO = "7♠ K♥ 3♦ 10♣ 2♠ 5♥ A♦ 9♣ 6♠ J♥";
const SEC_CANCELACION = "Q♠ 4♥ 8♦ K♣ 6♠ 9♥ A♦ 2♣ 10♠ 3♦ 7♣ 5♥";
const SEC_KO = "7♠ K♥ 4♦ 9♣ 7♥ 2♠ A♦ 8♣ 6♠ 3♥";
const SEC_SISTEMAS = "6♠ K♥ 4♦ 9♣ 2♥ A♠ 5♦ 7♣";
const SEC_HIOPT2 = "4♠ 10♥ 6♦ A♣ 3♠ K♦ 5♥ 8♣ 2♠";
const SEC_HIOPT2_PARES = "5♠ Q♦ 4♥ J♣ 6♠ 3♦ 8♥ 7♣";
const SEC_OMEGA2 = "6♠ 9♥ 2♦ K♣ A♠ 7♦ 4♥ 10♠ 8♣";
const SEC_OMEGA2_COMPARA = "6♠ 9♥ A♦ 7♣";

const vistasKO = cartas(SEC_KO).length;

// Conteo verdadero: los tres ejemplos de la clase 8.
const EJ_A = { conteo: 10, mazosTotales: 4, cartasJugadas: 96, regla: "cercano" as const };
const restantesA = 52 * EJ_A.mazosTotales - EJ_A.cartasJugadas;
const mazosA = Math.round(restantesA / 26) / 2;
const EJ_B = { conteo: -7, mazosRestantes: 3 };
const EJ_C = { conteo: 11, mazosRestantes: 2.5 };

export const CLASES: LeccionNaipia[] = [
  {
    slug: "naipia-clase-por-que-valores",
    orden: 6,
    requierePro: true,
    pasos: [
      "Un mazo de 52 cartas es demasiada información para recordarla completa. Los sistemas de conteo la resumen en un solo número pequeño: el conteo corriente.",
      `Míralo con cinco cartas: cada una mueve el conteo según su valor. Con Hi-Lo, ${SEC_UNO} termina en ${m(cuenta("hilo", SEC_UNO))}.`,
      "El orden en que salen las cartas no cambia el conteo final: solo importa cuántas de cada valor viste.",
      "Entrenar conteo es entrenar atención sostenida y aritmética mental rápida, no memoria fotográfica.",
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 0,
        titulo: "De 52 cartas a un solo número",
        cuadros: [
          { texto: "Recordar cada carta vista es demasiado: la memoria de trabajo aguanta pocos elementos a la vez." },
          {
            texto: `En cambio, cada carta suma un valor pequeño: las bajas ${m(valor("hilo", "4"))}, las neutras ${m(valor("hilo", "8"))} y las altas ${m(valor("hilo", "K"))} (ejemplo: Hi-Lo).`,
          },
          { texto: "Solo llevas un número, el conteo corriente, que sube o baja carta a carta." },
          { texto: "Si salieron muchas cartas bajas, quedan más altas en lo que falta, y el número sube." },
        ],
      },
      {
        tipo: "naipia.conteo",
        sistema: "hilo",
        cartas: cartas(SEC_UNO),
        velocidad: 1500,
        despuesDePaso: 1,
        titulo: "Cada carta mueve el conteo",
      },
      {
        tipo: "cuadros",
        despuesDePaso: 2,
        titulo: "El orden no importa",
        cuadros: [
          { texto: `Las mismas cartas en otro orden: ${SEC_UNO_REORDENADA}.` },
          {
            texto: "Los mismos valores, sumados en otro orden:",
            formula: sumaEscrita("hilo", SEC_UNO_REORDENADA),
            resaltar: m(cuenta("hilo", SEC_UNO_REORDENADA)),
          },
          { texto: "Mismo conteo final: una suma no depende del orden de los sumandos." },
        ],
      },
    ],
    quiz: QUIZ_NAIPIA["naipia-clase-por-que-valores"],
  },
  {
    slug: "naipia-clase-hilo",
    orden: 7,
    requierePro: true,
    pasos: [
      `Hi-Lo tiene solo tres valores: las bajas valen ${m(valor("hilo", "4"))}, las neutras ${m(valor("hilo", "8"))} y las altas ${m(valor("hilo", "K"))}. El conteo empieza en ${m(0)}.`,
      `Cada carta que sale mueve el conteo según su valor; las neutras lo dejan igual. Esta secuencia termina en ${m(cuenta("hilo", SEC_HILO))}.`,
      `Comprobación: un mazo completo suma ${m(mazoCompleto("hilo"))}. Si contaste un mazo entero y no diste ${m(mazoCompleto("hilo"))}, revisa.`,
      `Errores típicos: contar el As como carta baja (aquí es una carta alta y vale ${m(valor("hilo", "A"))}) y contar el 7 como ${m(valor("ko", "7"))} (en Hi-Lo es neutro; solo en KO vale ${m(valor("ko", "7"))}).`,
    ],
    visuales: [
      { tipo: "naipia.valores", sistema: "hilo", despuesDePaso: 0, titulo: "Los valores de Hi-Lo" },
      {
        tipo: "naipia.conteo",
        sistema: "hilo",
        cartas: cartas(SEC_HILO),
        velocidad: 1100,
        despuesDePaso: 1,
        titulo: "Conteo corriente paso a paso",
      },
      { tipo: "naipia.mazo", sistema: "hilo", despuesDePaso: 2, titulo: "Por qué Hi-Lo es balanceado" },
    ],
    quiz: QUIZ_NAIPIA["naipia-clase-hilo"],
  },
  {
    slug: "naipia-clase-cancelacion",
    orden: 8,
    requierePro: true,
    pasos: [
      "La velocidad sale de tres hábitos: descartar las neutras sin mirarlas, cancelar pares de valor opuesto y resumir por bloques.",
      `Primero se apartan las neutras y luego se cancelan los pares. Lo que queda sin pareja es el conteo: aquí ${m(cuenta("hilo", SEC_CANCELACION))}.`,
      "El mismo conteo por bloques de 4 cartas: una sola actualización por bloque.",
      "Si el orden es desfavorable, el conteo se mueve mucho antes de recuperarse: no te asustes, cuenta con calma. Entrena primero el largo de la secuencia y solo después acorta el tiempo.",
    ],
    visuales: [
      {
        tipo: "naipia.cancelacion",
        sistema: "hilo",
        cartas: cartas(SEC_CANCELACION),
        despuesDePaso: 1,
        titulo: "Descartar neutras y cancelar pares",
      },
      {
        tipo: "naipia.conteo",
        sistema: "hilo",
        cartas: cartas(SEC_CANCELACION),
        bloque: 4,
        velocidad: 2400,
        despuesDePaso: 2,
        titulo: "Por bloques de 4",
      },
    ],
    quiz: QUIZ_NAIPIA["naipia-clase-cancelacion"],
  },
  {
    slug: "naipia-clase-ko",
    orden: 9,
    requierePro: true,
    pasos: [
      `KO usa los mismos grupos que Hi-Lo con una diferencia: el 7 también vale ${m(valor("ko", "7"))}.`,
      `Como hay más cartas de ${m(1)} que de ${m(-1)}, un mazo completo suma ${m(mazoCompleto("ko"))}, no ${m(0)}: KO es un sistema no balanceado.`,
      `Cuenta esta secuencia con KO: da ${m(cuenta("ko", SEC_KO))}. Con Hi-Lo la misma secuencia da ${m(cuenta("hilo", SEC_KO))}: los 7 cambian el resultado.`,
      `Como el mazo completo suma ${m(mazoCompleto("ko"))}, lo que queda se calcula restando desde ${m(mazoCompleto("ko"))}, no desde ${m(0)}.`,
    ],
    visuales: [
      { tipo: "naipia.valores", sistema: "ko", despuesDePaso: 0, titulo: "Los valores de KO" },
      { tipo: "naipia.mazo", sistema: "ko", despuesDePaso: 1, titulo: "El mazo completo no vuelve a 0" },
      {
        tipo: "naipia.conteo",
        sistema: "ko",
        cartas: cartas(SEC_KO),
        velocidad: 1100,
        despuesDePaso: 2,
        titulo: "Conteo con KO",
      },
      {
        tipo: "cuadros",
        despuesDePaso: 3,
        titulo: "Lo que queda del mazo con KO",
        cuadros: [
          { texto: `Viste las ${vistasKO} cartas ${SEC_KO} y el conteo KO fue ${m(cuenta("ko", SEC_KO))}.` },
          {
            texto: `Las ${52 - vistasKO} cartas que quedan suman el total del mazo menos lo visto:`,
            formula: `${mazoCompleto("ko")} - (${cuenta("ko", SEC_KO)}) = ${mazoCompleto("ko") - cuenta("ko", SEC_KO)}`,
            resaltar: m(mazoCompleto("ko") - cuenta("ko", SEC_KO)),
          },
        ],
      },
    ],
    quiz: QUIZ_NAIPIA["naipia-clase-ko"],
  },
  {
    slug: "naipia-clase-sistemas",
    orden: 10,
    requierePro: true,
    pasos: [
      "Todos los sistemas resumen la secuencia en un número, pero difieren en cuántos valores distinguen: Hi-Lo y KO usan tres; Hi-Opt II y Omega II usan hasta cinco.",
      `Mira la misma secuencia con los cuatro sistemas: Hi-Lo da ${m(cuenta("hilo", SEC_SISTEMAS))}, KO ${m(cuenta("ko", SEC_SISTEMAS))}, Hi-Opt II ${m(cuenta("hiopt2", SEC_SISTEMAS))} y Omega II ${m(cuenta("omega2", SEC_SISTEMAS))}.`,
      "Más valores capturan más detalle de las cartas que quedan, pero cada carta exige una decisión más fina y la velocidad baja. No hay un sistema mejor: es un equilibrio entre precisión y velocidad.",
      "Por eso los conteos de sistemas distintos no se comparan: cada uno tiene su propia escala. Domina uno antes de pasar al siguiente.",
    ],
    visuales: [
      {
        tipo: "naipia.comparar",
        sistemas: ["hilo", "ko", "hiopt2", "omega2"],
        cartas: cartas(SEC_SISTEMAS),
        despuesDePaso: 1,
        titulo: "La misma secuencia, cuatro sistemas",
      },
    ],
    quiz: QUIZ_NAIPIA["naipia-clase-sistemas"],
  },
  {
    slug: "naipia-clase-hiopt2",
    orden: 11,
    requierePro: true,
    pasos: [
      `Hi-Opt II usa cinco valores, de ${m(valor("hiopt2", "4"))} a ${m(valor("hiopt2", "K"))}: más precisión a cambio de más esfuerzo por carta.`,
      `Es balanceado: un mazo completo suma ${m(mazoCompleto("hiopt2"))}.`,
      `Diferencias con Hi-Lo que hay que grabar: el As y el 9 son neutros, el 7 vale ${m(valor("hiopt2", "7"))} y las cartas de ${m(valor("hiopt2", "4"))} y ${m(valor("hiopt2", "K"))} mueven el conteo el doble. Esta secuencia termina en ${m(cuenta("hiopt2", SEC_HIOPT2))}.`,
      `Cancelación: un ${m(valor("hiopt2", "4"))} (4 o 5) se anula con un ${m(valor("hiopt2", "K"))} (10, J, Q, K). Las cartas de ${m(valor("hiopt2", "6"))} no tienen pareja de ${m(-1)} en este sistema, así que se acumulan.`,
    ],
    visuales: [
      { tipo: "naipia.valores", sistema: "hiopt2", despuesDePaso: 0, titulo: "Los valores de Hi-Opt II" },
      { tipo: "naipia.mazo", sistema: "hiopt2", despuesDePaso: 1, titulo: "Un mazo completo suma 0" },
      {
        tipo: "naipia.conteo",
        sistema: "hiopt2",
        cartas: cartas(SEC_HIOPT2),
        velocidad: 1100,
        despuesDePaso: 2,
        titulo: "Conteo con Hi-Opt II",
      },
      {
        tipo: "naipia.cancelacion",
        sistema: "hiopt2",
        cartas: cartas(SEC_HIOPT2_PARES),
        despuesDePaso: 3,
        titulo: "Los +2 y los -2 se cancelan; los +1 se acumulan",
      },
    ],
    quiz: QUIZ_NAIPIA["naipia-clase-hiopt2"],
  },
  {
    slug: "naipia-clase-omega2",
    orden: 12,
    requierePro: true,
    pasos: [
      `Omega II también usa cinco valores. El 9 vale ${m(valor("omega2", "9"))} y el As es neutro (${m(valor("omega2", "A"))}).`,
      `Es un sistema balanceado: un mazo completo suma ${m(mazoCompleto("omega2"))}.`,
      `Diferencias con Hi-Opt II: aquí el 6 vale ${m(valor("omega2", "6"))} (allá ${m(valor("hiopt2", "6"))}) y el 9 vale ${m(valor("omega2", "9"))} (allá ${m(valor("hiopt2", "9"))}). Son los dos rangos que más se confunden al cambiar de sistema.`,
      `Ejemplo: ${SEC_OMEGA2} termina en ${m(cuenta("omega2", SEC_OMEGA2))}. En la cancelación, un ${m(1)} solo se anula con un ${m(-1)}, y el único ${m(-1)} es el 9.`,
    ],
    visuales: [
      { tipo: "naipia.valores", sistema: "omega2", despuesDePaso: 0, titulo: "Los valores de Omega II" },
      { tipo: "naipia.mazo", sistema: "omega2", despuesDePaso: 1, titulo: "Un mazo completo suma 0" },
      {
        tipo: "naipia.comparar",
        sistemas: ["hiopt2", "omega2"],
        cartas: cartas(SEC_OMEGA2_COMPARA),
        despuesDePaso: 2,
        titulo: "Omega II frente a Hi-Opt II",
      },
      {
        tipo: "naipia.conteo",
        sistema: "omega2",
        cartas: cartas(SEC_OMEGA2),
        velocidad: 1100,
        despuesDePaso: 3,
        titulo: "Conteo con Omega II",
      },
    ],
    quiz: QUIZ_NAIPIA["naipia-clase-omega2"],
  },
  {
    slug: "naipia-clase-conteo-verdadero",
    orden: 13,
    requierePro: true,
    pasos: [
      `Un conteo corriente de ${m(6)} significa cosas distintas si quedan 6 mazos o si queda solo 1. El conteo verdadero lo corrige dividiendo por los mazos restantes.`,
      `Ejemplo: en un conjunto de ${EJ_A.mazosTotales} mazos salieron ${EJ_A.cartasJugadas} cartas. Quedan ${restantesA} cartas, es decir ${dec(restantesA / 52)} mazos: al medio mazo más cercano, ${dec(mazosA)}. Con conteo corriente ${m(EJ_A.conteo)}: ${EJ_A.conteo} ÷ ${dec(mazosA)} = ${dec(EJ_A.conteo / mazosA)}.`,
      `El resultado casi nunca es entero, así que la regla de redondeo se declara siempre. Con valores negativos las reglas difieren: ${EJ_B.conteo} ÷ ${EJ_B.mazosRestantes} = ${dec(EJ_B.conteo / EJ_B.mazosRestantes)}. Más cercano: ${dividir(EJ_B.conteo, EJ_B.mazosRestantes, "cercano")}; truncando: ${dividir(EJ_B.conteo, EJ_B.mazosRestantes, "truncar")}; hacia abajo: ${dividir(EJ_B.conteo, EJ_B.mazosRestantes, "abajo")}.`,
      `Otro ejemplo: ${EJ_C.conteo} ÷ ${dec(EJ_C.mazosRestantes)} = ${dec(EJ_C.conteo / EJ_C.mazosRestantes)}. Más cercano: ${dividir(EJ_C.conteo, EJ_C.mazosRestantes, "cercano")}; truncando: ${dividir(EJ_C.conteo, EJ_C.mazosRestantes, "truncar")}.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 0,
        titulo: "La idea en una fórmula",
        cuadros: [
          {
            texto: "El conteo verdadero divide el conteo corriente por los mazos que quedan (se usa con sistemas balanceados, como Hi-Lo):",
            formula: "\\text{conteo verdadero} = \\dfrac{\\text{conteo corriente}}{\\text{mazos restantes}}",
          },
          { texto: "Con muchos mazos, el mismo conteo corriente pesa poco; con pocos mazos, pesa mucho." },
        ],
      },
      {
        tipo: "naipia.verdadero",
        conteo: EJ_A.conteo,
        mazosTotales: EJ_A.mazosTotales,
        cartasJugadas: EJ_A.cartasJugadas,
        regla: EJ_A.regla,
        despuesDePaso: 1,
        titulo: "Estimar los mazos, dividir y redondear",
      },
      {
        tipo: "naipia.verdadero",
        conteo: EJ_B.conteo,
        mazosRestantes: EJ_B.mazosRestantes,
        regla: "abajo",
        despuesDePaso: 2,
        titulo: "Con negativos, la regla importa",
      },
      {
        tipo: "naipia.verdadero",
        conteo: EJ_C.conteo,
        mazosRestantes: EJ_C.mazosRestantes,
        regla: "cercano",
        despuesDePaso: 3,
        titulo: "Con medio mazo",
      },
    ],
    quiz: QUIZ_NAIPIA["naipia-clase-conteo-verdadero"],
  },
];
