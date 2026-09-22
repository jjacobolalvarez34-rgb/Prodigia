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
