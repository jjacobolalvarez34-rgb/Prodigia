import type { TecnicaVisualNumeria } from "./tipos";
import {
  columnasSuma,
  mcmPorListado,
  fraccionOperacion,
  simplificarFraccion,
  productoCruzado,
  decimalDeFraccion,
  porcentajeDeNumero,
  redondearDecimal,
  potenciaCadena,
  raizCuadradaPorTanteo,
  notacionCientifica,
  despejarLineal,
  verificarSustitucion,
  ternaPitagorica,
  areaCompuesta,
  areaCirculo,
  anguloComplementario,
  sumaDigitos,
  redondearAPosicion,
  divisionPorPartes,
  numerosCercanosA100,
  x11Trick,
} from "../visualesDatos";

// Las 39 Técnicas rápidas ya existentes de Numeria (requiere_pro = false,
// sembradas en 0007/0018/0019/0026/0032/0079/0101), a las que se les
// agrega su apartado visual (2026-09-22, pedido explícito del usuario:
// "revisa TODAS y colócales su apartado visual" — antes eran solo texto,
// a diferencia de las 5 Clases de clases.ts que ya nacieron con
// visuales). `slug` tiene que coincidir EXACTO con el sembrado en esas
// migraciones (y con GRUPOS_APRENDER.numeria.tecnicas en
// src/lib/aprender/grupos.ts) — esto es un UPDATE, no un INSERT: un slug
// mal escrito no rompe nada visiblemente (el WHERE no encuentra fila y
// el UPDATE no hace nada), así que lecciones.test.ts los valida contra
// esa misma lista.
//
// Cada número que aparece en un `visual` sale de una función pura de
// src/lib/numeria/visualesDatos.ts (o de una expresión aritmética real
// sobre los datos del ejemplo, nunca tipeado suelto) — verificado de
// nuevo con aritmética nativa independiente en lecciones.test.ts.

// ---------- Suma ----------

const s1a = 8;
const s1b = 5;
const s1Complemento = 10 - s1a; // 2
const s1Restante = s1b - s1Complemento; // 3
const s1Resultado = 10 + s1Restante; // 13

const s2a = 47;
const s2b = 38;
const s2Redondo = 40;
const s2Ajuste = s2Redondo - s2b; // 2
const s2Suma = s2a + s2Redondo; // 87
const s2Resultado = s2Suma - s2Ajuste; // 85

const s3a = 456;
const s3b = 327;
const s3Centenas = Math.floor(s3a / 100) * 100 + Math.floor(s3b / 100) * 100; // 700
const s3Decenas = Math.floor((s3a % 100) / 10) * 10 + Math.floor((s3b % 100) / 10) * 10; // 70
const s3TrasDecenas = s3Centenas + s3Decenas; // 770
const s3Unidades = (s3a % 10) + (s3b % 10); // 13
const s3Resultado = s3TrasDecenas + s3Unidades; // 783

const s4Chico = 48;
const s4Grande = 51;
const s4Duplicado = s4Chico * 2; // 96
const s4Diferencia = s4Grande - s4Chico; // 3
const s4Resultado = s4Duplicado + s4Diferencia; // 99

const s5A = 4827;
const s5B = 3956;

const s6A = 4827;
const s6B = 3956;
const s6RedondoA = redondearAPosicion(s6A, 3); // 5000
const s6RedondoB = redondearAPosicion(s6B, 3); // 4000
const s6Estimado = s6RedondoA + s6RedondoB; // 9000
const s6Datos = columnasSuma(s6A, s6B); // 8783

// ---------- Resta ----------

const r1a = 82;
const r1b = 47;
const r1Redondo = 50;
const r1Ajuste = r1Redondo - r1b; // 3
const r1Resta = r1a - r1Redondo; // 32
const r1Resultado = r1Resta + r1Ajuste; // 35

const r2Resultado100 = 63;
const r2Primer = 9 - Math.floor(r2Resultado100 / 10); // 3 (9 − 6)
const r2Ultimo = 10 - (r2Resultado100 % 10); // 7 (10 − 3)
const r2Resultado = 100 - r2Resultado100; // 37

const r3A = 8241;
const r3B = 3956;

const r4A = 9241;
const r4B = 6850;
const r4Redondo = redondearAPosicion(r4B, 3); // 7000
const r4Diferencia = r4Redondo - r4B; // 150
const r4RestaRedonda = r4A - r4Redondo; // 2241
const r4Resultado = r4RestaRedonda + r4Diferencia; // 2391

// ---------- Multiplicación ----------

const m1 = x11Trick(37); // 407, con acarreo

const m2a = 48;
const m2Por10 = m2a * 10; // 480
const m2Resultado = m2Por10 / 2; // 240

const m3Decena = 3; // de 35²
const m3Siguiente = m3Decena * (m3Decena + 1); // 12
const m3Resultado = m3Siguiente * 100 + 25; // 1225

const m4a = 47;
const m4Por10 = m4a * 10; // 470
const m4Resultado = m4Por10 - m4a; // 423

const m5 = numerosCercanosA100(98, 97); // 9506
const m5b = numerosCercanosA100(96, 94); // 9024
const m5c = numerosCercanosA100(88, 87); // 7656 (el producto de complementos pasa de 99)

const m6a = 37;
const m6Primero = m6a * 2; // 74
const m6Resultado = m6Primero * 2; // 148

const m7Factor = 6;
const m7C = 200;
const m7D = 30;
const m7U = 4;
const m7ParcialC = m7C * m7Factor; // 1200
const m7ParcialD = m7D * m7Factor; // 180
const m7ParcialU = m7U * m7Factor; // 24
const m7Resultado = m7ParcialC + m7ParcialD + m7ParcialU; // 1404

const m8a = 98;
const m8b = 47;
const m8Redondo = 100;
const m8ConRedondo = m8Redondo * m8b; // 4700
const m8Diferencia = (m8Redondo - m8a) * m8b; // 94
const m8Resultado = m8ConRedondo - m8Diferencia; // 4606

// ---------- División ----------

const d1n = 471;
const d1Suma = sumaDigitos(d1n); // 12
const d1Divisible = d1Suma % 3 === 0; // true

const d2n = 84;
const d2Doble = d2n * 2; // 168
const d2Resultado = d2Doble / 10; // 16.8

const d3 = divisionPorPartes(288, 12); // 20 + 4 = 24

const d4Dividendo = 8916;
const d4Divisor = 4;
const d4Redondo = redondearAPosicion(d4Dividendo, 3); // 9000
const d4Estimado = d4Redondo / d4Divisor; // 2250
const d4Real = d4Dividendo / d4Divisor; // 2229

// ---------- Fracciones ----------

const f1 = fraccionOperacion("suma", 1, 5, 2, 5); // 3/5

const f2 = simplificarFraccion(8, 12); // 2/3, MCD 4

const f3Mcm = mcmPorListado(4, 6); // 12

const f4 = productoCruzado(3, 4, 4, 5); // 15 vs 16 → 3/4 < 4/5

// ---------- Decimales ----------

const dec1 = decimalDeFraccion(3, 4); // 0.75

const dec2 = porcentajeDeNumero(15, 200); // 0.15, 30

const dec3 = redondearDecimal(3.14159, 2); // 3.14

// ---------- Potencias ----------

const pot1 = potenciaCadena(2, 4); // 16

const pot2 = raizCuadradaPorTanteo(49); // 7

const pot3a = notacionCientifica(3000); // 3 × 10³
const pot3b = notacionCientifica(45000); // 4.5 × 10⁴

// ---------- Álgebra ----------

const alg1 = despejarLineal(1, 5, 12); // x = 7

const alg2 = despejarLineal(2, 3, 11); // x = 4

const alg3Comprobado = verificarSustitucion(2, 3, 4); // 11

// ---------- Geometría ----------

const geo1 = ternaPitagorica(8, 6); // hipotenusa 10

const geo2 = areaCompuesta(10, 8, 3, 2); // 74

const geo3 = areaCirculo(7); // 154 (22/7 exacto)

const geo4 = anguloComplementario("suplementario", 125); // 55

export const TECNICAS_NUMERIA: TecnicaVisualNumeria[] = [
  // ---------------- Suma ----------------
  {
    slug: "complemento-a-10",
    pasos: [
      "Cuando un sumando está a poca distancia de una decena, completa esa decena primero y suma el resto después.",
      `Con $${s1a} + ${s1b}$: al $${s1a}$ le faltan $${s1Complemento}$ para llegar a $10$. Ese $${s1Complemento}$ sale del $${s1b}$, así que quedan $${s1Restante}$ por sumar.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { texto: `$${s1a} + ${s1b}$: al $${s1a}$ le faltan $${s1Complemento}$ para llegar a $10$` },
          { formula: `${s1a} + ${s1Complemento} = 10` },
          { texto: `Quedan $${s1Restante}$ del $${s1b}$ (ya usaste $${s1Complemento}$)` },
          { formula: `10 + ${s1Restante} = ${s1Resultado}`, resaltar: `${s1a} + ${s1b} = ${s1Resultado}` },
        ],
      },
    ],
  },
  {
    slug: "redondear-decena",
    pasos: [
      "Redondea el número más difícil a la decena más cercana, suma, y corrige el ajuste al final.",
      `Con $${s2a} + ${s2b}$: redondea $${s2b}$ a $${s2Redondo}$, suma, y después resta lo que sobró de más.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { texto: `$${s2a} + ${s2b}$: redondea $${s2b}$ a $${s2Redondo}$` },
          { formula: `${s2a} + ${s2Redondo} = ${s2Suma}` },
          { texto: `Se sumó $${s2Ajuste}$ de más ($${s2Redondo}$ en vez de $${s2b}$)` },
          { formula: `${s2Suma} - ${s2Ajuste} = ${s2Resultado}`, resaltar: `${s2a} + ${s2b} = ${s2Resultado}` },
        ],
      },
    ],
  },
  {
    slug: "sumar-por-la-izquierda",
    pasos: [
      "Suma de mayor a menor posición (centenas, decenas, unidades) en vez de empezar por las unidades.",
      `Con $${s3a} + ${s3b}$: primero las centenas, después las decenas, y las unidades al final.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { texto: `Suma las centenas: ${Math.floor(s3a / 100)} + ${Math.floor(s3b / 100)} = ${Math.floor(s3a / 100) + Math.floor(s3b / 100)} → ${s3Centenas}` },
          {
            texto: `Suma las decenas: ${Math.floor((s3a % 100) / 10)} + ${Math.floor((s3b % 100) / 10)} = ${Math.floor((s3a % 100) / 10) + Math.floor((s3b % 100) / 10)} → ${s3Centenas} + ${s3Decenas} = ${s3TrasDecenas}`,
          },
          {
            texto: `Suma las unidades: ${s3a % 10} + ${s3b % 10} = ${s3Unidades}`,
            resaltar: `${s3TrasDecenas} + ${s3Unidades} = ${s3Resultado}`,
          },
        ],
      },
    ],
  },
  {
    slug: "duplicar-y-ajustar",
    pasos: [
      "Para dos números casi iguales, duplica el más chico y ajusta por la diferencia.",
      `Con $${s4Chico} + ${s4Grande}$: duplica el más chico ($${s4Chico}$) y suma la diferencia con el otro.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { formula: `${s4Chico} + ${s4Chico} = ${s4Duplicado}` },
          { texto: `La diferencia entre $${s4Grande}$ y $${s4Chico}$ es $${s4Diferencia}$` },
          { formula: `${s4Duplicado} + ${s4Diferencia} = ${s4Resultado}`, resaltar: `${s4Chico} + ${s4Grande} = ${s4Resultado}` },
        ],
      },
    ],
  },
  {
    slug: "sumar-por-posicion-numeros-grandes",
    pasos: [
      "Con 4 o 5 dígitos, sumar todo junto de una se presta a errores — separar por posición lo hace manejable.",
      "Es la misma idea del complemento a 10, columna por columna, solo que con números más largos.",
    ],
    visuales: [{ tipo: "numeria.columnas", operacion: "suma", a: s5A, b: s5B, despuesDePaso: 1, titulo: `${s5A} + ${s5B}, posición por posición` }],
  },
  {
    slug: "estimar-antes-de-sumar-grande",
    pasos: [
      "Una estimación rápida avisa si hay un error antes de confiar en el resultado exacto.",
      `Redondea cada número a su posición más alta, suma esos redondeos, y compara con el resultado real.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { texto: `Redondea cada número: $${s6A}$ → $${s6RedondoA}$, y $${s6B}$ → $${s6RedondoB}$` },
          { formula: `${s6RedondoA} + ${s6RedondoB} = ${s6Estimado}`, resaltar: `Estimación: ${s6Estimado}` },
          { texto: `Ahora suma los números reales, posición por posición: $${s6A} + ${s6B} = ${s6Datos.resultado}$` },
          { resaltar: `Resultado real: ${s6Datos.resultado} (cerca de la estimación de ${s6Estimado})` },
        ],
      },
    ],
  },
  // ---------------- Resta ----------------
  {
    slug: "resta-compensacion",
    pasos: [
      "Para restar, redondea el número que se resta a la decena y ajusta el resultado al final.",
      `Con $${r1a} - ${r1b}$: redondea $${r1b}$ a $${r1Redondo}$, resta, y devuelve el ajuste.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { texto: `$${r1a} - ${r1b}$: redondea $${r1b}$ a $${r1Redondo}$` },
          { formula: `${r1a} - ${r1Redondo} = ${r1Resta}` },
          { texto: `Se restó $${r1Ajuste}$ de más ($${r1Redondo}$ en vez de $${r1b}$)` },
          { formula: `${r1Resta} + ${r1Ajuste} = ${r1Resultado}`, resaltar: `${r1a} - ${r1b} = ${r1Resultado}` },
        ],
      },
    ],
  },
  {
    slug: "complemento-a-100",
    pasos: [
      "Para restar de un número redondo como 100, cada dígito se resta de 9 excepto el último, que se resta de 10.",
      `Con $100 - ${r2Resultado100}$: el primer dígito se resta de $9$ y el último de $10$.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { texto: "Resta cada dígito de 9, excepto el último, que se resta de 10" },
          { formula: `9 - ${Math.floor(r2Resultado100 / 10)} = ${r2Primer}` },
          { formula: `10 - ${r2Resultado100 % 10} = ${r2Ultimo}`, resaltar: `100 - ${r2Resultado100} = ${r2Resultado}` },
        ],
      },
    ],
  },
  {
    slug: "restar-por-posicion-numeros-grandes",
    pasos: [
      "La misma idea de \"pedir prestado\" de restas chicas, encadenada a través de varias posiciones.",
      "Se resta de derecha a izquierda, y el préstamo puede encadenarse varias veces seguidas.",
    ],
    visuales: [{ tipo: "numeria.columnas", operacion: "resta", a: r3A, b: r3B, despuesDePaso: 1, titulo: `${r3A} - ${r3B}, pidiendo prestado` }],
  },
  {
    slug: "restar-completando-al-redondo-mas-cercano",
    pasos: [
      "Para números grandes, a veces es más rápido \"completar\" hasta el redondo más cercano que restar directo.",
      "El paso que más se olvida es el ajuste final — sin él, el resultado queda desviado exactamente por esa diferencia.",
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { texto: `Para $${r4A} - ${r4B}$, usa el redondo más cercano a $${r4B}$: $${r4Redondo}$` },
          { formula: `${r4A} - ${r4Redondo} = ${r4RestaRedonda}` },
          { texto: `Ajusta sumando la diferencia entre $${r4Redondo}$ y $${r4B}$: $${r4Redondo} - ${r4B} = ${r4Diferencia}$` },
          { formula: `${r4RestaRedonda} + ${r4Diferencia} = ${r4Resultado}`, resaltar: `${r4A} - ${r4B} = ${r4Resultado}` },
        ],
      },
    ],
  },
  // ---------------- Multiplicación ----------------
  {
    slug: "x11-segundo",
    pasos: [
      "Separa los dígitos del número, súmalos, y coloca ese resultado en el medio (con acarreo si pasa de 9).",
      `Con $${m1.numero} \\times 11$: separa los dígitos $${m1.d1}$ y $${m1.d2}$, y súmalos.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { texto: `$${m1.numero} \\times 11$: separa los dígitos: $${m1.d1}$ _ $${m1.d2}$` },
          { formula: `${m1.d1} + ${m1.d2} = ${m1.sumaDigitos}` },
          m1.acarreo
            ? { texto: `Como pasa de 9, se lleva el 1: $(${m1.d1}+1)\\ 0\\ ${m1.d2}$` }
            : { texto: `Como no pasa de 9, va directo en el medio: $${m1.d1}\\ ${m1.sumaDigitos}\\ ${m1.d2}$` },
          { formula: `${m1.numero} \\times 11 = ${m1.resultado}`, resaltar: `${m1.numero} × 11 = ${m1.resultado}` },
        ],
      },
    ],
  },
  {
    slug: "x5-mitad-de-x10",
    pasos: [
      "Multiplicar por 10 es agregar un cero. Multiplicar por 5 es hacer eso y dividir a la mitad.",
      `Con $${m2a} \\times 5$: multiplica por $10$ primero y divide el resultado a la mitad.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { formula: `${m2a} \\times 10 = ${m2Por10}` },
          { texto: "Divide ese resultado a la mitad" },
          { formula: `${m2Por10} \\div 2 = ${m2Resultado}`, resaltar: `${m2a} × 5 = ${m2Resultado}` },
        ],
      },
    ],
  },
  {
    slug: "cuadrado-terminado-en-5",
    pasos: [
      "Para elevar al cuadrado un número que termina en 5: toma el dígito de las decenas, multiplícalo por sí mismo más uno, y agrega 25 al final.",
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 0,
        cuadros: [
          { texto: `$35^2$: el dígito de las decenas es $${m3Decena}$` },
          { formula: `${m3Decena} \\times ${m3Decena + 1} = ${m3Siguiente}` },
          { texto: 'Agrega "25" al final' },
          { formula: `35^2 = ${m3Resultado}`, resaltar: `35² = ${m3Resultado}` },
        ],
      },
    ],
  },
  {
    slug: "x9-es-x10-menos-el-numero",
    pasos: [
      "Multiplicar por 9 es multiplicar por 10 y restarle el número original.",
      `Con $${m4a} \\times 9$: multiplica por $10$ y resta $${m4a}$.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { formula: `${m4a} \\times 10 = ${m4Por10}` },
          { formula: `${m4Por10} - ${m4a} = ${m4Resultado}`, resaltar: `${m4a} × 9 = ${m4Resultado}` },
        ],
      },
    ],
  },
  {
    slug: "numeros-cercanos-a-100",
    // Reescrita 2026-09-25 (el usuario no entendía el método hasta contestar la
    // última pregunta del cuestionario): cada paso del método es un paso de la
    // lección, con su animación, y se explica POR QUÉ funciona y qué hacer si
    // el producto de los complementos se pasa de dos cifras.
    pasos: [
      "Método de bases: sirve para multiplicar dos números que están cerca de $100$ (como $98 \\times 97$). En vez de multiplicar en columna, trabajas con lo que le FALTA a cada número para llegar a $100$: su complemento.",
      `Paso 1, los complementos: $100 - ${m5.a} = ${m5.complementoA}$ y $100 - ${m5.b} = ${m5.complementoB}$.`,
      `Paso 2, las primeras cifras: resta en cruz. A un número réstale el complemento del OTRO: $${m5.a} - ${m5.complementoB} = ${m5.primeraParte}$. Si lo haces al revés, $${m5.b} - ${m5.complementoA} = ${m5.b - m5.complementoA}$: siempre da lo mismo.`,
      `Paso 3, las últimas dos cifras: multiplica los complementos, $${m5.complementoA} \\times ${m5.complementoB} = ${m5.segundaParte}$. Como el resultado ocupa DOS cifras, se escribe con un cero delante: $${String(m5.segundaParte).padStart(2, "0")}$.`,
      `Paso 4, juntar: $${m5.primeraParte}$ adelante y $${String(m5.segundaParte).padStart(2, "0")}$ atrás. Entonces $${m5.a} \\times ${m5.b} = ${m5.resultado}$.`,
      `¿Por qué funciona? $${m5.a} = 100 - ${m5.complementoA}$ y $${m5.b} = 100 - ${m5.complementoB}$. Al multiplicar: $(100 - ${m5.complementoA})(100 - ${m5.complementoB}) = 10000 - ${100 * m5.complementoB} - ${100 * m5.complementoA} + ${m5.segundaParte} = ${m5.primeraParte * 100} + ${m5.segundaParte}$. Los $${m5.primeraParte * 100}$ son las primeras cifras ($${m5.primeraParte}$ por cien) y el $${m5.segundaParte}$ son las últimas.`,
      `Otro ejemplo, $${m5b.a} \\times ${m5b.b}$: complementos $${m5b.complementoA}$ y $${m5b.complementoB}$; primeras cifras $${m5b.a} - ${m5b.complementoB} = ${m5b.primeraParte}$; últimas $${m5b.complementoA} \\times ${m5b.complementoB} = ${m5b.segundaParte}$. Resultado: $${m5b.resultado}$. Si los complementos dan más de dos cifras, como en $${m5c.a} \\times ${m5c.b}$ ($${m5c.complementoA} \\times ${m5c.complementoB} = ${m5c.segundaParte}$), suma ese número: $${m5c.primeraParte * 100} + ${m5c.segundaParte} = ${m5c.resultado}$.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { texto: `Lo que le falta a cada número para llegar a 100` },
          { formula: `100 - ${m5.a} = ${m5.complementoA}` },
          { resaltar: `100 - ${m5.b} = ${m5.complementoB}` },
        ],
      },
      {
        tipo: "cuadros",
        despuesDePaso: 2,
        cuadros: [
          { texto: `Resta en cruz: un número menos el complemento del otro` },
          { formula: `${m5.a} - ${m5.complementoB} = ${m5.primeraParte}` },
          { resaltar: `${m5.b} - ${m5.complementoA} = ${m5.b - m5.complementoA}` },
        ],
      },
      {
        tipo: "cuadros",
        despuesDePaso: 3,
        cuadros: [
          { texto: `Complemento por complemento (dos cifras)` },
          { formula: `${m5.complementoA} \\times ${m5.complementoB} = ${m5.segundaParte}` },
          { resaltar: `${m5.segundaParte} \\to ${String(m5.segundaParte).padStart(2, "0")}` },
        ],
      },
      {
        tipo: "cuadros",
        despuesDePaso: 4,
        cuadros: [
          { texto: `Complemento a 100: $${m5.a} \\to ${m5.complementoA}$, $${m5.b} \\to ${m5.complementoB}$` },
          { formula: `${m5.a} - ${m5.complementoB} = ${m5.primeraParte}` },
          { formula: `${m5.complementoA} \\times ${m5.complementoB} = ${m5.segundaParte}` },
          { resaltar: `${m5.a} × ${m5.b} = ${m5.primeraParte}${String(m5.segundaParte).padStart(2, "0")} = ${m5.resultado}` },
        ],
      },
      {
        tipo: "cuadros",
        despuesDePaso: 5,
        cuadros: [
          { formula: `(100 - ${m5.complementoA})(100 - ${m5.complementoB}) = 10000 - ${100 * m5.complementoB} - ${100 * m5.complementoA} + ${m5.segundaParte}` },
          { resaltar: `= ${m5.primeraParte * 100} + ${m5.segundaParte} = ${m5.resultado}` },
        ],
      },
      {
        tipo: "cuadros",
        despuesDePaso: 6,
        cuadros: [
          { texto: `${m5b.a} × ${m5b.b}: complementos ${m5b.complementoA} y ${m5b.complementoB}` },
          { formula: `${m5b.a} - ${m5b.complementoB} = ${m5b.primeraParte}` },
          { formula: `${m5b.complementoA} \\times ${m5b.complementoB} = ${m5b.segundaParte}` },
          { resaltar: `${m5b.a} × ${m5b.b} = ${m5b.primeraParte}${String(m5b.segundaParte).padStart(2, "0")} = ${m5b.resultado}` },
        ],
      },
    ],
  },
  {
    slug: "x4-duplicar-dos-veces",
    pasos: ["Multiplicar por 4 es duplicar el número y volver a duplicar el resultado.", `Con $${m6a} \\times 4$: duplica dos veces seguidas.`],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { formula: `${m6a} \\times 2 = ${m6Primero}` },
          { formula: `${m6Primero} \\times 2 = ${m6Resultado}`, resaltar: `${m6a} × 4 = ${m6Resultado}` },
        ],
      },
    ],
  },
  {
    slug: "multiplicar-por-partes",
    pasos: [
      "Separar un factor en centenas + decenas + unidades convierte una multiplicación grande en varias chicas.",
      `Con $234 \\times ${m7Factor}$: separa $234$ en $${m7C} + ${m7D} + ${m7U}$ y multiplica cada parte.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { formula: `${m7C} \\times ${m7Factor} = ${m7ParcialC}` },
          { formula: `${m7D} \\times ${m7Factor} = ${m7ParcialD}` },
          { formula: `${m7U} \\times ${m7Factor} = ${m7ParcialU}` },
          { formula: `${m7ParcialC} + ${m7ParcialD} + ${m7ParcialU} = ${m7Resultado}`, resaltar: `234 × ${m7Factor} = ${m7Resultado}` },
        ],
      },
    ],
  },
  {
    slug: "multiplicar-redondeando-primero",
    pasos: [
      "Redondear un factor, multiplicar, y ajustar después suele ser más rápido que multiplicar el número real de una.",
      `Con $${m8a} \\times ${m8b}$: redondea $${m8a}$ a $${m8Redondo}$ y ajusta la diferencia.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { formula: `${m8Redondo} \\times ${m8b} = ${m8ConRedondo}` },
          { texto: `Te pasaste por $${m8Redondo - m8a}$ veces $${m8b}$` },
          { formula: `${m8Redondo - m8a} \\times ${m8b} = ${m8Diferencia}` },
          { formula: `${m8ConRedondo} - ${m8Diferencia} = ${m8Resultado}`, resaltar: `${m8a} × ${m8b} = ${m8Resultado}` },
        ],
      },
    ],
  },
  // ---------------- División ----------------
  {
    slug: "divisibilidad-por-3",
    pasos: [
      "Suma los dígitos del número; si esa suma es múltiplo de 3, el número original también lo es.",
      `Con $${d1n}$: la suma de los dígitos es $${d1Suma}$.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { formula: `4 + 7 + 1 = ${d1Suma}` },
          { texto: "Si esa suma es múltiplo de 3, el número original también lo es" },
          { resaltar: d1Divisible ? `${d1Suma} es múltiplo de 3 → ${d1n} es divisible por 3` : `${d1Suma} no es múltiplo de 3` },
        ],
      },
    ],
  },
  {
    slug: "dividir-por-5",
    pasos: [
      "Dividir por 5 es multiplicar por 2 y correr el punto decimal un lugar.",
      `Con $${d2n} \\div 5$: multiplica por $2$ y corre el punto.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { formula: `${d2n} \\times 2 = ${d2Doble}` },
          { texto: "Corre el punto decimal un lugar a la izquierda (divide por 10)" },
          { formula: `${d2Doble} \\div 10 = ${d2Resultado}`, resaltar: `${d2n} ÷ 5 = ${d2Resultado}` },
        ],
      },
    ],
  },
  {
    slug: "dividir-numeros-grandes-por-partes",
    pasos: [
      "Separar el dividendo en un múltiplo cómodo del divisor más un resto simplifica divisiones grandes.",
      `Con $${d3.dividendo} \\div ${d3.divisor}$: busca el múltiplo cómodo más grande y divide lo que sobra.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { formula: `${d3.divisor} \\times ${d3.cocienteParcial1} = ${d3.multiploRedondo}` },
          { formula: `${d3.dividendo} - ${d3.multiploRedondo} = ${d3.resto1}` },
          { formula: `${d3.resto1} \\div ${d3.divisor} = ${d3.cocienteParcial2}` },
          {
            formula: `${d3.cocienteParcial1} + ${d3.cocienteParcial2} = ${d3.cocienteTotal}`,
            resaltar: `${d3.dividendo} ÷ ${d3.divisor} = ${d3.cocienteTotal}`,
          },
        ],
      },
    ],
  },
  {
    slug: "estimar-el-cociente-grande",
    pasos: [
      "Saber más o menos cuántas cifras va a tener el resultado evita errores grandes al dividir.",
      "Una estimación rápida con el número redondeado da una referencia antes de dividir de verdad.",
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { texto: `Redondea el dividendo: $${d4Dividendo} \\to ${d4Redondo}$` },
          { formula: `${d4Redondo} \\div ${d4Divisor} = ${d4Estimado}`, resaltar: `Estimación: ${d4Estimado}` },
          { formula: `${d4Dividendo} \\div ${d4Divisor} = ${d4Real}`, resaltar: `Resultado real: ${d4Real} (cerca de la estimación)` },
        ],
      },
    ],
  },
  // ---------------- Fracciones ----------------
  {
    slug: "sumar-fracciones-igual-denominador",
    pasos: [
      "Cuando dos fracciones tienen el mismo denominador, suma los numeradores y deja el denominador igual.",
    ],
    visuales: [{ tipo: "numeria.fraccion", operacion: "suma", num1: f1.num1, den1: f1.den1, num2: f1.num2, den2: f1.den2, despuesDePaso: 0, titulo: `${f1.num1}/${f1.den1} + ${f1.num2}/${f1.den2}` }],
  },
  {
    slug: "simplificar-con-mcd",
    pasos: [
      "Encuentra el número más grande que divide exacto al numerador y al denominador, y divide ambos por él.",
      `Con $\\dfrac{${f2.num}}{${f2.den}}$: el máximo común divisor es $${f2.divisorComun}$.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { formula: `\\text{MCD}(${f2.num},${f2.den}) = ${f2.divisorComun}` },
          { formula: `${f2.num} \\div ${f2.divisorComun} = ${f2.numSimplificado}` },
          {
            formula: `${f2.den} \\div ${f2.divisorComun} = ${f2.denSimplificado}`,
            resaltar: `\\dfrac{${f2.num}}{${f2.den}} = \\dfrac{${f2.numSimplificado}}{${f2.denSimplificado}}`,
          },
        ],
      },
    ],
  },
  {
    slug: "minimo-comun-denominador",
    pasos: [
      "Para sumar fracciones con denominadores distintos, primero se convierten a un denominador común.",
      `Con $\\dfrac{1}{${f3Mcm.a}} + \\dfrac{1}{${f3Mcm.b}}$: el mínimo común múltiplo de los denominadores es $${f3Mcm.mcm}$.`,
    ],
    visuales: [
      { tipo: "numeria.mcm", a: f3Mcm.a, b: f3Mcm.b, despuesDePaso: 1, titulo: `MCM de ${f3Mcm.a} y ${f3Mcm.b}` },
      {
        tipo: "numeria.fraccion",
        operacion: "suma",
        num1: 1,
        den1: f3Mcm.a,
        num2: 1,
        den2: f3Mcm.b,
        despuesDePaso: 1,
        titulo: `1/${f3Mcm.a} + 1/${f3Mcm.b} con denominador común`,
      },
    ],
  },
  {
    slug: "comparar-con-producto-cruzado",
    pasos: [
      "Para saber cuál fracción es más grande sin buscar denominador común, se multiplica en cruz.",
      `Con $\\dfrac{${f4.num1}}{${f4.den1}}$ y $\\dfrac{${f4.num2}}{${f4.den2}}$: multiplica cada numerador por el denominador de la otra.`,
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { formula: `${f4.num1} \\times ${f4.den2} = ${f4.productoIzquierdo}` },
          { formula: `${f4.num2} \\times ${f4.den1} = ${f4.productoDerecho}` },
          {
            resaltar:
              f4.mayor === "segunda"
                ? `${f4.productoIzquierdo} < ${f4.productoDerecho} → \\dfrac{${f4.num1}}{${f4.den1}} < \\dfrac{${f4.num2}}{${f4.den2}}`
                : `${f4.productoIzquierdo} > ${f4.productoDerecho} → \\dfrac{${f4.num1}}{${f4.den1}} > \\dfrac{${f4.num2}}{${f4.den2}}`,
          },
        ],
      },
    ],
  },
  // ---------------- Decimales ----------------
  {
    slug: "convertir-fraccion-decimal",
    pasos: ["Un decimal no es más que el resultado de dividir el numerador por el denominador.", `$\\dfrac{3}{4}$ dividido da $${dec1}$.`],
    visuales: [
      {
        tipo: "numeria.recta",
        despuesDePaso: 1,
        min: 0,
        max: 1,
        marcas: [{ valor: dec1, etiqueta: `$\\dfrac{3}{4} = ${dec1}$` }],
        titulo: "3/4 en la recta numérica",
      },
    ],
  },
  {
    slug: "porcentaje-como-decimal",
    pasos: [
      "Para calcular X% de un número, convierte el porcentaje a decimal (÷100) y multiplica.",
      `El $15\\%$ de $${dec2.base}$ es $${dec2.decimal} \\times ${dec2.base} = ${dec2.resultado}$.`,
    ],
    visuales: [
      {
        tipo: "numeria.recta",
        despuesDePaso: 1,
        min: 0,
        max: 1,
        marcas: [{ valor: dec2.decimal, etiqueta: `$15\\% = ${dec2.decimal}$` }],
        titulo: `15% de ${dec2.base} = ${dec2.resultado}`,
      },
    ],
  },
  {
    slug: "redondear-decimales",
    pasos: [
      "Para redondear a N lugares, mira el dígito que sigue: 5 o más, sube; menos de 5, se queda igual.",
      `Redondeando $3.14159$ a $2$ decimales: el tercer decimal es $${dec3.digitoSiguiente}$.`,
    ],
    visuales: [
      {
        tipo: "numeria.recta",
        despuesDePaso: 1,
        min: 3.1,
        max: 3.2,
        marcas: [
          { valor: 3.14159, etiqueta: "3.14159" },
          { valor: dec3.redondeado, etiqueta: `${dec3.redondeado} (redondeado)` },
        ],
        titulo: "3.14159 redondeado a 2 decimales",
      },
    ],
  },
  // ---------------- Potencias ----------------
  {
    slug: "potencia-como-multiplicacion-repetida",
    pasos: [`$a^n$ significa multiplicar "a" por sí mismo "n" veces.`, `$${pot1.base}^${pot1.exponente}$ significa $${pot1.base}$ multiplicado por sí mismo $${pot1.exponente}$ veces.`],
    visuales: [{ tipo: "numeria.potencia", modo: "cadena", base: pot1.base, exponente: pot1.exponente, despuesDePaso: 1, titulo: `$${pot1.base}^${pot1.exponente} = ${pot1.resultado}$` }],
  },
  {
    slug: "raiz-cuadrada-por-tanteo",
    pasos: ["Para estimar una raíz cuadrada, busca qué número al cuadrado se acerca más.", `Para $\\sqrt{${pot2.n}}$: $${pot2.base} \\times ${pot2.base} = ${pot2.cuadrado}$.`],
    visuales: [{ tipo: "numeria.potencia", modo: "cuadricula", base: pot2.base, exponente: 2, despuesDePaso: 1, titulo: `$\\sqrt{${pot2.n}} = ${pot2.base}$` }],
  },
  {
    slug: "notacion-cientifica-basica",
    pasos: [
      "Un número grande en notación científica es un dígito × 10 elevado a la cantidad de lugares que se corrió la coma.",
      "Se cuentan los ceros (o lugares) para saber el exponente.",
    ],
    visuales: [
      {
        tipo: "cuadros",
        despuesDePaso: 1,
        cuadros: [
          { texto: `$3.000$ se escribe como $${pot3a.mantisa} \\times 10^${pot3a.exponente}$` },
          { texto: `$45.000$ se escribe como $${pot3b.mantisa} \\times 10^${pot3b.exponente}$` },
        ],
      },
    ],
  },
  // ---------------- Álgebra ----------------
  {
    slug: "que-es-una-variable",
    pasos: [
      "x no es un misterio: es un número que todavía no se conoce, con un valor fijo que se puede encontrar.",
      `En $x + ${alg1.constante} = ${alg1.resultado}$, solo hay un número que hace que la cuenta cierre: $x = ${alg1.x}$.`,
    ],
    visuales: [{ tipo: "numeria.balanza", modo: "despejar", coefX: alg1.coefX, constante: alg1.constante, resultado: alg1.resultado, despuesDePaso: 1 }],
  },
  {
    slug: "despejar-paso-a-paso",
    pasos: [
      "Para encontrar x, deshace las operaciones en orden inverso — lo último que se le hizo a x es lo primero que se deshace.",
      `Con $2x + 3 = 11$: primero resta $3$ de los dos lados, y después divide por $2$.`,
    ],
    visuales: [{ tipo: "numeria.balanza", modo: "despejar", coefX: alg2.coefX, constante: alg2.constante, resultado: alg2.resultado, despuesDePaso: 1 }],
  },
  {
    slug: "verificar-sustituyendo",
    pasos: [
      "Una vez despejada x, siempre se puede comprobar si está bien reemplazándola de nuevo en la ecuación original.",
      `Con $x = ${alg2.x}$ en $2x + 3 = 11$: $2(${alg2.x}) + 3 = ${alg3Comprobado}$, coincide.`,
    ],
    visuales: [{ tipo: "numeria.balanza", modo: "verificar", coefX: alg2.coefX, constante: alg2.constante, resultado: alg2.resultado, despuesDePaso: 1 }],
  },
  // ---------------- Geometría ----------------
  {
    slug: "geometria-ternas-pitagoricas",
    pasos: [
      "Memorizar 3-4-5, 5-12-13 y 8-15-17 (y sus múltiplos) permite saber el tercer lado de un triángulo rectángulo sin calcular ninguna raíz.",
      `Un triángulo rectángulo con catetos $${geo1.cateto1}$ y $${geo1.cateto2}$: es la terna $3$-$4$-$5$ multiplicada por $2$.`,
    ],
    visuales: [{ tipo: "numeria.figura", modo: "triangulo", cateto1: geo1.cateto1, cateto2: geo1.cateto2, despuesDePaso: 1 }],
  },
  {
    slug: "geometria-area-compuestas",
    pasos: [
      "Una figura rara casi siempre es un rectángulo grande menos (o más) uno chico. Calcula cada parte por separado y suma o resta al final.",
      `Un rectángulo de $${geo2.anchoGrande} \\times ${geo2.altoGrande}$ con una esquina de $${geo2.anchoRecorte} \\times ${geo2.altoRecorte}$ recortada.`,
    ],
    visuales: [
      {
        tipo: "numeria.figura",
        modo: "areaCompuesta",
        anchoGrande: geo2.anchoGrande,
        altoGrande: geo2.altoGrande,
        anchoRecorte: geo2.anchoRecorte,
        altoRecorte: geo2.altoRecorte,
        despuesDePaso: 1,
      },
    ],
  },
  {
    slug: "geometria-pi-fraccion",
    pasos: [
      "Con radios múltiplos de 7, usar 22/7 en vez de 3.14 deja cuentas exactas sin decimales. Con cualquier otro radio, 3.14 sigue siendo la mejor aproximación rápida.",
      `Círculo de radio $${geo3.radio}$: área $= \\pi \\times ${geo3.radio}^2$.`,
    ],
    visuales: [{ tipo: "numeria.figura", modo: "circulo", radio: geo3.radio, despuesDePaso: 1 }],
  },
  {
    slug: "geometria-angulos-complementarios",
    pasos: [
      "Complementarios suman 90°, suplementarios suman 180°. Se resta directo del total — no hace falta plantear una ecuación para esto.",
      `Dos ángulos suplementarios, uno mide $${geo4.conocido}°$: el otro mide $${geo4.otro}°$.`,
    ],
    visuales: [{ tipo: "numeria.figura", modo: "angulos", tipoAngulo: "suplementario", conocido: geo4.conocido, despuesDePaso: 1 }],
  },
];
