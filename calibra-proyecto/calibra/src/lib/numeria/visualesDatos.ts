// Cálculos puros de los visuales de Numeria (sin React), mismo patrón que
// src/lib/naipia/visualesDatos.ts: los componentes solo dibujan lo que estas
// funciones calculan, y lecciones.test.ts contrasta cada resultado con
// aritmética nativa independiente (a+b, a*b, Math.floor(a/b), a%b...).

export function mcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

export function mcmValor(a: number, b: number): number {
  return (Math.abs(a) * Math.abs(b)) / mcd(a, b);
}

function digitos(n: number): number[] {
  return String(Math.trunc(Math.abs(n)))
    .split("")
    .map(Number);
}

// ---------- Clase 1: valor posicional, suma y resta en columna ----------

export interface ColumnaSumaResta {
  // Posición 0 = unidades, 1 = decenas, etc. (de derecha a izquierda).
  posicion: number;
  digitoA: number;
  digitoB: number;
  // Suma: lo que "entra" desde la posición anterior (acarreo). Resta: lo
  // que hay que "devolver" porque la posición anterior pidió prestado.
  entra: number;
  resultado: number;
  // Suma: 1 si esta columna genera acarreo a la siguiente. Resta: 1 si
  // esta columna tuvo que pedir prestado a la siguiente.
  sale: number;
}

export interface DatosColumnas {
  operacion: "suma" | "resta";
  a: number;
  b: number;
  // De la posición más alta a la más baja (para dibujar de izquierda a
  // derecha), aunque el cálculo interno va de derecha a izquierda.
  columnas: ColumnaSumaResta[];
  resultado: number;
}

// Suma en columna, de derecha a izquierda, con acarreo explícito.
export function columnasSuma(a: number, b: number): DatosColumnas {
  const da = digitos(a);
  const db = digitos(b);
  const largo = Math.max(da.length, db.length);
  const columnas: ColumnaSumaResta[] = [];
  let acarreo = 0;
  for (let i = 0; i < largo; i++) {
    const digitoA = da[da.length - 1 - i] ?? 0;
    const digitoB = db[db.length - 1 - i] ?? 0;
    const suma = digitoA + digitoB + acarreo;
    const resultado = suma % 10;
    const sale = Math.floor(suma / 10);
    columnas.push({ posicion: i, digitoA, digitoB, entra: acarreo, resultado, sale });
    acarreo = sale;
  }
  if (acarreo > 0) {
    columnas.push({ posicion: largo, digitoA: 0, digitoB: 0, entra: acarreo, resultado: acarreo, sale: 0 });
  }
  return { operacion: "suma", a, b, columnas: [...columnas].reverse(), resultado: a + b };
}

// Resta en columna (a >= b >= 0), de derecha a izquierda, "pidiendo
// prestado" cuando el dígito de arriba es menor que el de abajo.
export function columnasResta(a: number, b: number): DatosColumnas {
  const da = digitos(a);
  const db = digitos(b);
  const largo = Math.max(da.length, db.length);
  const columnas: ColumnaSumaResta[] = [];
  let prestamo = 0;
  for (let i = 0; i < largo; i++) {
    let digitoA = da[da.length - 1 - i] ?? 0;
    const digitoB = db[db.length - 1 - i] ?? 0;
    digitoA -= prestamo;
    let sale = 0;
    if (digitoA < digitoB) {
      digitoA += 10;
      sale = 1;
    }
    const resultado = digitoA - digitoB;
    columnas.push({ posicion: i, digitoA: da[da.length - 1 - i] ?? 0, digitoB, entra: prestamo, resultado, sale });
    prestamo = sale;
  }
  return { operacion: "resta", a, b, columnas: [...columnas].reverse(), resultado: a - b };
}

// ---------- Clase 2: multiplicación en columna con productos parciales ----------

export interface ProductoParcial {
  // Dígito del segundo factor (b) que generó este producto parcial.
  digito: number;
  // Posición de ese dígito (0 = unidades de b): el producto se corre
  // `posicion` lugares hacia la izquierda (se le agregan esa cantidad de
  // ceros).
  posicion: number;
  valor: number;
}

export interface DatosMultiplicacion {
  a: number;
  b: number;
  parciales: ProductoParcial[];
  resultado: number;
}

export function multiplicacionColumnas(a: number, b: number): DatosMultiplicacion {
  const db = digitos(b);
  const parciales: ProductoParcial[] = db
    .slice()
    .reverse()
    .map((digito, posicion) => ({ digito, posicion, valor: a * digito * 10 ** posicion }));
  const resultado = parciales.reduce((acc, p) => acc + p.valor, 0);
  return { a, b, parciales, resultado };
}

// ---------- Clase 3: división larga ("casita") ----------

export interface PasoDivision {
  // Dígito del dividendo que se "baja" en este paso.
  bajado: number;
  // Resto que traía la posición anterior, antes de bajar el dígito.
  arrastreEntra: number;
  // arrastreEntra * 10 + bajado: el número contra el que se divide.
  numeroActual: number;
  digitoCociente: number;
  producto: number;
  resto: number;
}

export interface DatosDivision {
  dividendo: number;
  divisor: number;
  pasos: PasoDivision[];
  cociente: number;
  resto: number;
}

// divisor > 0. Sigue el algoritmo escolar dígito a dígito del dividendo,
// de izquierda a derecha ("bajar el dígito, ver cuántas veces entra,
// multiplicar, restar, bajar el siguiente").
export function divisionLarga(dividendo: number, divisor: number): DatosDivision {
  const dd = digitos(dividendo);
  const pasos: PasoDivision[] = [];
  let arrastre = 0;
  const cocienteDigitos: number[] = [];
  for (const bajado of dd) {
    const numeroActual = arrastre * 10 + bajado;
    const digitoCociente = Math.floor(numeroActual / divisor);
    const producto = digitoCociente * divisor;
    const resto = numeroActual - producto;
    pasos.push({ bajado, arrastreEntra: arrastre, numeroActual, digitoCociente, producto, resto });
    cocienteDigitos.push(digitoCociente);
    arrastre = resto;
  }
  const cocienteTexto = cocienteDigitos.join("").replace(/^0+(?=\d)/, "");
  return { dividendo, divisor, pasos, cociente: Number(cocienteTexto), resto: arrastre };
}

// ---------- Clase 4: MCM por listado de múltiplos ----------

export interface DatosMcm {
  a: number;
  b: number;
  multiplosA: number[];
  multiplosB: number[];
  // Primer múltiplo en común dentro de la lista (null si el listado es
  // demasiado corto — no debería pasar con los ejemplos reales).
  primerComun: number | null;
  mcm: number;
}

export function mcmPorListado(a: number, b: number, cantidad = 8): DatosMcm {
  const multiplosA = Array.from({ length: cantidad }, (_, i) => a * (i + 1));
  const multiplosB = Array.from({ length: cantidad }, (_, i) => b * (i + 1));
  const primerComun = multiplosA.find((m) => multiplosB.includes(m)) ?? null;
  return { a, b, multiplosA, multiplosB, primerComun, mcm: mcmValor(a, b) };
}

// ---------- Clase 5: operaciones entre fracciones ----------

export type OperacionFraccion = "suma" | "resta" | "multiplicacion" | "division";

export interface DatosFraccion {
  operacion: OperacionFraccion;
  num1: number;
  den1: number;
  num2: number;
  den2: number;
  // Suma/resta: denominador común (el MCM de los dos denominadores) y los
  // numeradores ya convertidos a ese denominador.
  denominadorComun?: number;
  num1Convertido?: number;
  num2Convertido?: number;
  // Multiplicación/división: el segundo factor tal cual entra a la
  // multiplicación (para división, la fracción recíproca de num2/den2).
  num2Operado?: number;
  den2Operado?: number;
  numResultado: number;
  denResultado: number;
  // Resultado simplificado (dividiendo por el MCD de num/den).
  numSimplificado: number;
  denSimplificado: number;
}

export function fraccionOperacion(
  operacion: OperacionFraccion,
  num1: number,
  den1: number,
  num2: number,
  den2: number
): DatosFraccion {
  let numResultado: number;
  let denResultado: number;
  let denominadorComun: number | undefined;
  let num1Convertido: number | undefined;
  let num2Convertido: number | undefined;
  let num2Operado: number | undefined;
  let den2Operado: number | undefined;

  if (operacion === "suma" || operacion === "resta") {
    denominadorComun = mcmValor(den1, den2);
    num1Convertido = num1 * (denominadorComun / den1);
    num2Convertido = num2 * (denominadorComun / den2);
    numResultado = operacion === "suma" ? num1Convertido + num2Convertido : num1Convertido - num2Convertido;
    denResultado = denominadorComun;
  } else {
    // división = multiplicar por la recíproca.
    num2Operado = operacion === "multiplicacion" ? num2 : den2;
    den2Operado = operacion === "multiplicacion" ? den2 : num2;
    numResultado = num1 * num2Operado;
    denResultado = den1 * den2Operado;
  }

  const divisorComun = mcd(numResultado, denResultado) || 1;
  return {
    operacion,
    num1,
    den1,
    num2,
    den2,
    denominadorComun,
    num1Convertido,
    num2Convertido,
    num2Operado,
    den2Operado,
    numResultado,
    denResultado,
    numSimplificado: numResultado / divisorComun,
    denSimplificado: denResultado / divisorComun,
  };
}

// ============================================================
// Técnicas de Numeria (2026-09-22): cálculos puros para las 39 técnicas
// rápidas (suma/resta/multiplicación/división/fracciones/decimales/
// potencias/álgebra/geometría) que hasta ahora eran solo texto. Mismo
// criterio que arriba: cada número que se ve en un visual sale de una de
// estas funciones (o de una expresión aritmética literal en
// src/lib/numeria/lecciones/tecnicas.ts), nunca tipeado a mano sin
// verificación — lecciones.test.ts reimplementa cada una con aritmética
// nativa independiente.
// ============================================================

// ---------- Fracciones: simplificar por MCD, comparar por producto cruzado ----------

export interface DatosSimplificarFraccion {
  num: number;
  den: number;
  divisorComun: number;
  numSimplificado: number;
  denSimplificado: number;
}

export function simplificarFraccion(num: number, den: number): DatosSimplificarFraccion {
  const divisorComun = mcd(num, den) || 1;
  return { num, den, divisorComun, numSimplificado: num / divisorComun, denSimplificado: den / divisorComun };
}

export interface DatosProductoCruzado {
  num1: number;
  den1: number;
  num2: number;
  den2: number;
  // num1 * den2 (compara la primera fracción)
  productoIzquierdo: number;
  // num2 * den1 (compara la segunda fracción)
  productoDerecho: number;
  mayor: "primera" | "segunda" | "igual";
}

export function productoCruzado(num1: number, den1: number, num2: number, den2: number): DatosProductoCruzado {
  const productoIzquierdo = num1 * den2;
  const productoDerecho = num2 * den1;
  const mayor = productoIzquierdo > productoDerecho ? "primera" : productoIzquierdo < productoDerecho ? "segunda" : "igual";
  return { num1, den1, num2, den2, productoIzquierdo, productoDerecho, mayor };
}

// ---------- Decimales ----------

export function decimalDeFraccion(num: number, den: number): number {
  return num / den;
}

export interface DatosPorcentaje {
  porcentaje: number;
  base: number;
  decimal: number;
  resultado: number;
}

export function porcentajeDeNumero(porcentaje: number, base: number): DatosPorcentaje {
  const decimal = porcentaje / 100;
  return { porcentaje, base, decimal, resultado: decimal * base };
}

export interface DatosRedondeoDecimal {
  valor: number;
  decimales: number;
  // El dígito inmediatamente después de la posición a la que se redondea
  // (el que decide si sube o se queda igual).
  digitoSiguiente: number;
  redondeado: number;
}

export function redondearDecimal(valor: number, decimales: number): DatosRedondeoDecimal {
  const factor = 10 ** decimales;
  // Redondeo bancarizado evitado a propósito: Math.round alcanza para los
  // ejemplos didácticos (siempre positivos, sin el caso ".5" exacto).
  const redondeado = Math.round(valor * factor) / factor;
  const digitoSiguiente = Math.floor(Math.abs(valor) * factor * 10) % 10;
  return { valor, decimales, digitoSiguiente, redondeado };
}

// ---------- Potencias y raíces ----------

export interface PasoPotencia {
  factor: number;
  acumulado: number;
}

export interface DatosPotencia {
  base: number;
  exponente: number;
  pasos: PasoPotencia[];
  resultado: number;
}

// Cadena de multiplicaciones repetidas: base, base×base, (base×base)×base...
export function potenciaCadena(base: number, exponente: number): DatosPotencia {
  const pasos: PasoPotencia[] = [];
  let acumulado = base;
  for (let i = 1; i < exponente; i++) {
    acumulado *= base;
    pasos.push({ factor: base, acumulado });
  }
  return { base, exponente, pasos, resultado: base ** exponente };
}

export interface DatosRaizPorTanteo {
  n: number;
  base: number;
  cuadrado: number;
  exacta: boolean;
}

// Busca (por tanteo, igual que la técnica) el entero cuyo cuadrado más se
// acerca a `n` sin pasarse.
export function raizCuadradaPorTanteo(n: number): DatosRaizPorTanteo {
  let base = Math.floor(Math.sqrt(Math.max(0, n)));
  while ((base + 1) * (base + 1) <= n) base++;
  return { n, base, cuadrado: base * base, exacta: base * base === n };
}

export interface DatosNotacionCientifica {
  valor: number;
  mantisa: number;
  exponente: number;
}

export function notacionCientifica(valor: number): DatosNotacionCientifica {
  if (valor === 0) return { valor, mantisa: 0, exponente: 0 };
  const exponente = Math.floor(Math.log10(Math.abs(valor)));
  const mantisa = Math.round((valor / 10 ** exponente) * 100) / 100;
  return { valor, mantisa, exponente };
}

// ---------- Álgebra: despejar una ecuación de un paso/dos pasos, y verificar ----------

export interface DatosDespeje {
  coefX: number;
  constante: number;
  resultado: number;
  // Paso 1: resta la constante de los dos lados.
  trasConstante: number;
  // Paso 2: divide los dos lados por el coeficiente de x.
  x: number;
}

// coefX·x + constante = resultado → x
export function despejarLineal(coefX: number, constante: number, resultado: number): DatosDespeje {
  const trasConstante = resultado - constante;
  const x = trasConstante / coefX;
  return { coefX, constante, resultado, trasConstante, x };
}

// Sustituye x de vuelta en coefX·x + constante, para verificar.
export function verificarSustitucion(coefX: number, constante: number, x: number): number {
  return coefX * x + constante;
}

// ---------- Geometría ----------

export interface DatosTerna {
  cateto1: number;
  cateto2: number;
  hipotenusaCuadrado: number;
  hipotenusa: number;
}

export function ternaPitagorica(cateto1: number, cateto2: number): DatosTerna {
  const hipotenusaCuadrado = cateto1 ** 2 + cateto2 ** 2;
  return { cateto1, cateto2, hipotenusaCuadrado, hipotenusa: Math.sqrt(hipotenusaCuadrado) };
}

export interface DatosAreaCompuesta {
  anchoGrande: number;
  altoGrande: number;
  anchoRecorte: number;
  altoRecorte: number;
  areaGrande: number;
  areaRecorte: number;
  areaFinal: number;
}

export function areaCompuesta(anchoGrande: number, altoGrande: number, anchoRecorte: number, altoRecorte: number): DatosAreaCompuesta {
  const areaGrande = anchoGrande * altoGrande;
  const areaRecorte = anchoRecorte * altoRecorte;
  return { anchoGrande, altoGrande, anchoRecorte, altoRecorte, areaGrande, areaRecorte, areaFinal: areaGrande - areaRecorte };
}

export interface DatosCirculo {
  radio: number;
  multiploDe7: boolean;
  piNumerador: number;
  piDenominador: number;
  area: number;
}

// π ≈ 22/7 cuando el radio es múltiplo de 7 (da un resultado exacto sin
// decimales); si no, 3.14 (314/100) como mejor aproximación rápida.
export function areaCirculo(radio: number): DatosCirculo {
  const multiploDe7 = radio > 0 && radio % 7 === 0;
  const piNumerador = multiploDe7 ? 22 : 314;
  const piDenominador = multiploDe7 ? 7 : 100;
  const area = (piNumerador / piDenominador) * radio * radio;
  return { radio, multiploDe7, piNumerador, piDenominador, area };
}

export interface DatosAngulos {
  tipo: "complementario" | "suplementario";
  total: number;
  conocido: number;
  otro: number;
}

export function anguloComplementario(tipo: "complementario" | "suplementario", conocido: number): DatosAngulos {
  const total = tipo === "complementario" ? 90 : 180;
  return { tipo, total, conocido, otro: total - conocido };
}

// ---------- Suma/resta/multiplicación/división: atajos puntuales ----------

export function sumaDigitos(n: number): number {
  return String(Math.trunc(Math.abs(n)))
    .split("")
    .reduce((acc, d) => acc + Number(d), 0);
}

// Redondea `valor` a la posición decimal dada (1 = decena, 2 = centena,
// 3 = mil...), para las técnicas de estimación con números grandes.
export function redondearAPosicion(valor: number, posicion: number): number {
  const factor = 10 ** posicion;
  return Math.round(valor / factor) * factor;
}

export interface DatosDivisionPorPartes {
  dividendo: number;
  divisor: number;
  // Múltiplo del divisor, redondo y cómodo, menor o igual al dividendo.
  multiploRedondo: number;
  cocienteParcial1: number;
  resto1: number;
  cocienteParcial2: number;
  cocienteTotal: number;
}

export function divisionPorPartes(dividendo: number, divisor: number): DatosDivisionPorPartes {
  const cocienteParcial1 = Math.floor(dividendo / divisor / 10) * 10;
  const multiploRedondo = cocienteParcial1 * divisor;
  const resto1 = dividendo - multiploRedondo;
  const cocienteParcial2 = Math.floor(resto1 / divisor);
  return { dividendo, divisor, multiploRedondo, cocienteParcial1, resto1, cocienteParcial2, cocienteTotal: cocienteParcial1 + cocienteParcial2 };
}

export interface DatosNumerosCercanosA100 {
  a: number;
  b: number;
  complementoA: number;
  complementoB: number;
  primeraParte: number;
  segundaParte: number;
  resultado: number;
}

// Método de bases para multiplicar dos números cercanos a 100.
export function numerosCercanosA100(a: number, b: number): DatosNumerosCercanosA100 {
  const complementoA = 100 - a;
  const complementoB = 100 - b;
  const primeraParte = a - complementoB;
  const segundaParte = complementoA * complementoB;
  return { a, b, complementoA, complementoB, primeraParte, segundaParte, resultado: primeraParte * 100 + segundaParte };
}

export interface DatosX11 {
  numero: number;
  d1: number;
  d2: number;
  sumaDigitos: number;
  acarreo: boolean;
  resultado: number;
}

// Truco de multiplicar por 11 un número de 2 dígitos: separar los dígitos
// y meter la suma de ambos en el medio (con acarreo si pasa de 9).
export function x11Trick(numero: number): DatosX11 {
  const d1 = Math.floor(numero / 10);
  const d2 = numero % 10;
  const suma = d1 + d2;
  return { numero, d1, d2, sumaDigitos: suma, acarreo: suma >= 10, resultado: numero * 11 };
}

// ---------- Recta numérica (decimales): posición porcentual de un valor ----------

export function posicionEnRecta(valor: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.min(100, Math.max(0, ((valor - min) / (max - min)) * 100));
}
