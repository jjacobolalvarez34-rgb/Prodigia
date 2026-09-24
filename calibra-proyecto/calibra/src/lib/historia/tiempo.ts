// Aritmética del tiempo histórico: año -> siglo, década, formato con a. C. No
// existe el año 0: el año anterior a 1 d. C. es 1 a. C. (-1). Un siglo n agrupa
// los años (n-1)·100+1 a n·100, tanto en d. C. como en a. C. (el siglo I a. C. va
// del 100 a. C. al 1 a. C.). Funciones puras, sin dependencias.

const ROMANOS: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export function aRomano(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) throw new Error(`Número romano fuera de rango: ${n}`);
  let resto = n;
  let salida = "";
  for (const [valor, simbolo] of ROMANOS) {
    while (resto >= valor) {
      salida += simbolo;
      resto -= valor;
    }
  }
  return salida;
}

export function validarAnio(anio: number): void {
  if (!Number.isInteger(anio) || anio === 0) throw new Error(`Año inválido: ${anio} (entero distinto de 0; a. C. negativo)`);
}

// Número del siglo (1, 2, 3...) y si es a. C.
export function siglo(anio: number): { n: number; aC: boolean } {
  validarAnio(anio);
  return { n: Math.ceil(Math.abs(anio) / 100), aC: anio < 0 };
}

export function sigloTexto(anio: number): string {
  const s = siglo(anio);
  return `siglo ${aRomano(s.n)}${s.aC ? " a. C." : ""}`;
}

// «Siglo XV» con mayúscula inicial (para opciones de respuesta).
export function sigloEtiqueta(anio: number): string {
  const t = sigloTexto(anio);
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// Igual que sigloEtiqueta pero a partir de (n, aC).
export function sigloEtiquetaDe(n: number, aC: boolean): string {
  return `Siglo ${aRomano(n)}${aC ? " a. C." : ""}`;
}

// Año en el que empieza un siglo (el primero) y en el que termina (el último).
export function limitesSiglo(n: number, aC: boolean): { primero: number; ultimo: number } {
  return aC ? { primero: -(n * 100), ultimo: -((n - 1) * 100 + 1) } : { primero: (n - 1) * 100 + 1, ultimo: n * 100 };
}

// Separador de miles con espacio duro (300 000) solo desde 10 000: los años de
// cuatro cifras (1492, 2560 a. C.) se escriben sin separador.
function miles(n: number): string {
  const s = String(Math.abs(n));
  return Math.abs(n) < 10000 ? s : s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// 44 a. C., 476 d. C., 1492, 300 000 a. C. Los años d. C. de tres cifras o menos
// llevan «d. C.» para que no se confundan con a. C.
export function formatoAnio(anio: number): string {
  validarAnio(anio);
  if (anio < 0) return `${miles(anio)} a. C.`;
  return anio < 1000 ? `${anio} d. C.` : miles(anio);
}

// Década de un año d. C. (1969 -> 1960). Solo para años positivos.
export function decada(anio: number): number {
  if (anio <= 0) throw new Error(`La década solo se usa con años d. C.: ${anio}`);
  return Math.floor(anio / 10) * 10;
}

export function decadaTexto(anio: number): string {
  return `Años ${decada(anio)}`;
}

// Un año no cruza el límite de un siglo aunque se le sume o reste su margen.
export function mismoSigloConMargen(anio: number, margen: number): boolean {
  const desde = anio - margen;
  const hasta = anio + margen;
  if (desde === 0 || hasta === 0) return false;
  if (desde < 0 && hasta > 0) return false;
  return siglo(desde).n === siglo(hasta).n && siglo(desde).aC === siglo(hasta).aC;
}
