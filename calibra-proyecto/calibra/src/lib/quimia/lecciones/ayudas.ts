import { contarAtomos, f, ion, ox, numeroOxidacion, masaMolar, subindices } from "@/lib/quimia/formulas";
import { configuracionAbreviada, configuracionTexto, datosDe } from "@/lib/quimia/datos";
import { nombreDe, capitalizar, type SistemaNomenclatura } from "@/lib/quimia/nomenclatura";
import type { VisualQuimiaCuadro } from "@/lib/quimia/visuales";
import type { PreguntaLeccionQuimia } from "./tipos";

// Ayudas para ESCRIBIR el contenido de las lecciones sin repetir datos a
// mano: fórmulas siempre a través de f()/ion()/ox() (LaTeX correcto),
// nombres siempre desde las tablas de referencia de nomenclatura.ts (que
// tienen su propio test), masas molares calculadas desde DATOS_ELEMENTOS,
// reacciones que lanzan un error si no están balanceadas. Así un dato
// químico incorrecto no llega a una lección sin que algún test lo note.

export { f, ion, ox, numeroOxidacion, capitalizar };

// Número con coma decimal y `dec` decimales: 18,015 -> "18,0".
export function coma(n: number, dec = 1): string {
  return n.toFixed(dec).replace(".", ",");
}

// Nombre de un compuesto en el sistema pedido (de las tablas de referencia).
export function nom(formula: string, sistema: SistemaNomenclatura): string {
  return nombreDe(formula, sistema);
}
export function Nom(formula: string, sistema: SistemaNomenclatura): string {
  return capitalizar(nombreDe(formula, sistema));
}

// Masa molar con 1 decimal y coma ("98,1").
export function masa(formula: string): string {
  return coma(masaMolar(formula), 1);
}
// Masa atómica cargada de un elemento ("35,45").
export function masaAtomica(simbolo: string): string {
  const d = datosDe(simbolo);
  if (!d) throw new Error(`Sin masa atómica para ${simbolo}`);
  return coma(d.masa, 2);
}
// Electronegatividad ("3,16").
export function en(simbolo: string): string {
  const d = datosDe(simbolo);
  if (!d || d.electronegatividad === null) throw new Error(`Sin electronegatividad para ${simbolo}`);
  return coma(d.electronegatividad, 2);
}

// Configuración electrónica completa en LaTeX inline: $\mathrm{1s^{2}\,2s^{2}...}$.
function tokenConfig(t: string): string {
  const m = t.match(/^(\d)([spdf])(\d+)$/);
  return m ? `${m[1]}${m[2]}^{${m[3]}}` : t;
}
export function cfg(z: number): string {
  return `$\\mathrm{${configuracionTexto(z).split(" ").map(tokenConfig).join("\\,")}}$`;
}
// Configuración abreviada: $\mathrm{[Ar]\,4s^{2}\,3d^{6}}$.
export function cfgAbrev(z: number): string {
  return `$\\mathrm{${configuracionAbreviada(z).split(" ").map(tokenConfig).join("\\,")}}$`;
}

// Reacción balanceada en LaTeX: reaccion([[2, "Na"], [2, "H2O"]], [[2, "NaOH"], [1, "H2"]]).
// Lanza si los átomos no coinciden de ambos lados.
export type Termino = [number, string];
export function reaccion(reactivos: Termino[], productos: Termino[]): string {
  const total = (lado: Termino[]) => {
    const t: Record<string, number> = {};
    for (const [coef, formula] of lado) for (const [s, n] of Object.entries(contarAtomos(formula))) t[s] = (t[s] ?? 0) + coef * n;
    return t;
  };
  const a = total(reactivos);
  const b = total(productos);
  const claves = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of claves) {
    if (a[k] !== b[k]) throw new Error(`Reacción sin balancear (${k}): ${reactivos.map((r) => r[1]).join("+")} -> ${productos.map((r) => r[1]).join("+")}`);
  }
  const lado = (l: Termino[]) => l.map(([c, fo]) => `${c > 1 ? c : ""}${subindices(fo)}`).join(" + ");
  return `$\\mathrm{${lado(reactivos)}}\\rightarrow\\mathrm{${lado(productos)}}$`;
}

// Cuenta de átomos en texto: "4 H y 2 O" para `coef` × fórmula.
export function atomosTexto(formula: string, coef = 1): string {
  const partes = Object.entries(contarAtomos(formula)).map(([s, n]) => `${n * coef} ${s}`);
  return partes.length <= 1 ? partes.join("") : `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}

// Hash determinístico (mismo texto -> mismo número) para repartir la posición
// de la respuesta correcta sin usar azar: el contenido generado tiene que ser
// idéntico en cada corrida (la migración se compara byte a byte).
function hashTexto(t: string): number {
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) {
    h ^= t.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Opciones que ya tienen un orden natural (números crecientes, romanos): se
// dejan como se escribieron.
function tieneOrdenNatural(opciones: string[]): boolean {
  if (opciones.every((o) => /^[IVX]+$/.test(o))) return true;
  const nums = opciones.map((o) => {
    const m = o.replace(/−/g, "-").match(/-?\d+(?:,\d+)?/);
    return m ? parseFloat(m[0].replace(",", ".")) : NaN;
  });
  return nums.every((n) => !Number.isNaN(n)) && nums.every((n, i) => i === 0 || n > nums[i - 1]);
}

// Pregunta con la respuesta correcta en la posición `correcta` (0-based) del
// arreglo que se escribe acá. Para que la respuesta no quede casi siempre en
// el mismo lugar, se reubica en una posición que depende (de forma
// determinística) del texto de la pregunta, salvo que las opciones tengan un
// orden natural (números crecientes). `respuesta` sale de `opciones`, así que
// nunca queda fuera de ellas.
export function preg(pregunta: string, opciones: string[], correcta: number, explicacion: string): PreguntaLeccionQuimia {
  const respuesta = opciones[correcta];
  if (respuesta === undefined) throw new Error(`preg: índice ${correcta} fuera de las opciones de «${pregunta}»`);
  if (tieneOrdenNatural(opciones)) return { pregunta, opciones, respuesta, explicacion };
  const resto = opciones.filter((_, i) => i !== correcta);
  const pos = hashTexto(pregunta) % opciones.length;
  const ordenadas = [...resto.slice(0, pos), respuesta, ...resto.slice(pos)];
  return { pregunta, opciones: ordenadas, respuesta, explicacion };
}

// Visual de tabla de datos.
export function cuadro(despuesDePaso: number, columnas: string[], filas: string[][], titulo?: string): VisualQuimiaCuadro {
  return { tipo: "quimia.cuadro", despuesDePaso, ...(titulo ? { titulo } : {}), columnas, filas };
}

// Cuadro con los nombres de una lista de compuestos: fórmula + los sistemas
// pedidos (siempre desde las tablas de referencia).
const NOMBRE_SISTEMA: Record<SistemaNomenclatura, string> = { tradicional: "Tradicional", stock: "Stock", sistematica: "Sistemática" };
export function cuadroNombres(
  despuesDePaso: number,
  formulas: string[],
  sistemas: SistemaNomenclatura[] = ["tradicional", "stock", "sistematica"],
  titulo?: string
): VisualQuimiaCuadro {
  return cuadro(
    despuesDePaso,
    ["Fórmula", ...sistemas.map((s) => NOMBRE_SISTEMA[s])],
    formulas.map((fo) => [f(fo), ...sistemas.map((s) => nom(fo, s))]),
    titulo
  );
}
