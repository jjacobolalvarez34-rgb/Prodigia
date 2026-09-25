import { interpretar, textoSalida, type TipoFallo } from "./interprete";
import { renderizar, textoCodigo, type Render } from "./render";
import { call, LENGUAJES, n, print, type Func, type Lenguaje, type Prog, type SId } from "./tipos";
import type { SerieCrecimiento } from "./visuales";

// Datos de los visuales de Codia: funciones PURAS que arman su resultado
// ejecutando el MISMO renderizador (render.ts) y el MISMO intérprete
// (interprete.ts) que usa la práctica, nunca un resultado tipeado a mano.
// visualesDatos.test.ts compara todo esto contra la ejecución REAL de cada
// lenguaje (Python, Java, JavaScript y TypeScript) y contra un trazador
// independiente de Python (sys.settrace).

// ---------------------------- errores reales ----------------------------

// Nombre real del error que lanza el lenguaje (el test lo confirma
// ejecutando el código de verdad). null = no hay un nombre verificado para
// ese caso y el visual muestra solo la descripción general.
export function nombreFallo(fallo: TipoFallo, lang: Lenguaje): string | null {
  switch (fallo) {
    case "DivCero":
      return lang === "python" ? "ZeroDivisionError" : lang === "java" ? "ArithmeticException" : null;
    case "IndiceFuera":
      return lang === "python" ? "IndexError" : lang === "java" ? "ArrayIndexOutOfBoundsException" : null;
    case "Tipo":
      return lang === "python" ? "TypeError" : null;
    default:
      return null;
  }
}

// Un programa que viaja en el jsonb puede venir mal formado: los datos lanzan
// y el componente (que los pide dentro de un try) omite el visual.
function validar(programa: Prog): void {
  if (!programa || !Array.isArray(programa.main) || !Array.isArray(programa.funcs) || programa.main.length === 0) {
    throw new Error("programa de Codia mal formado");
  }
}

// ------------------------------- traza -------------------------------

export interface PasoTraza {
  // Línea de pantalla (1-based) que se resalta en este paso.
  linea: number;
  // Variables visibles en ese momento, en orden de declaración.
  variables: [string, string][];
}

export interface TrazaDatos {
  codigo: string;
  pasos: PasoTraza[];
  salida: string;
  fallo: TipoFallo | null;
}

// Traza paso a paso de `programa` renderizado y ejecutado en `lenguaje`
// (mismo IR que arma la práctica): una fila por cada sentencia con id que
// se ejecuta (declaración, asignación, print, cada evaluación de un if o
// cada vuelta de un bucle...), con la línea de pantalla y el estado de las
// variables DESPUÉS de esa línea.
export function datosTraza(programa: Prog, lenguaje: Lenguaje): TrazaDatos {
  validar(programa);
  const render = renderizar(programa, lenguaje);
  const pasos: PasoTraza[] = [];
  const r = interpretar(programa, { lang: lenguaje }, (id, variables, finDeBucle) => {
    if (finDeBucle) return;
    const linea = render.lineaDe[id];
    if (linea === undefined) return;
    pasos.push({ linea, variables: Object.entries(variables) });
  });
  return { codigo: textoCodigo(render), pasos, salida: textoSalida(r), fallo: r.fallo };
}

// ------------------------------ comparar ------------------------------

export interface ResultadoLenguaje {
  lenguaje: Lenguaje;
  codigo: string;
  salida: string;
  fallo: TipoFallo | null;
  // Nombre real del error en ese lenguaje (o null si no hay uno verificado).
  nombreError: string | null;
}

export interface CompararDatos {
  resultados: ResultadoLenguaje[];
}

// El MISMO `programa` renderizado y ejecutado en los 4 lenguajes: sirve para
// mostrar lado a lado cómo se escribe (sintaxis real) y qué imprime cada uno
// (o si falla, con la semántica real de cada lenguaje: dividir por cero rompe
// en Python y Java y da Infinity en JavaScript y TypeScript).
export function datosComparar(programa: Prog): CompararDatos {
  validar(programa);
  return {
    resultados: LENGUAJES.map((lenguaje) => {
      const render = renderizar(programa, lenguaje);
      const r = interpretar(programa, { lang: lenguaje });
      return {
        lenguaje,
        codigo: textoCodigo(render),
        salida: textoSalida(r),
        fallo: r.fallo,
        nombreError: r.fallo ? nombreFallo(r.fallo, lenguaje) : null,
      };
    }),
  };
}

// -------------------------------- flujo --------------------------------

type Sentencia = SId;
type SiSt = Extract<Sentencia, { k: "si" }>;

export interface RamaFlujo {
  // Condición tal como se escribe en el lenguaje ("nota >= 90").
  condicion: string;
  // null = nunca se llegó a evaluar (una condición anterior ya fue verdadera).
  resultado: boolean | null;
  // Primera línea de la rama, tal como se escribe (print("A")).
  accion: string | null;
}

export interface FlujoCondicional {
  tipo: "si";
  // Variables justo antes de evaluar la primera condición.
  variables: [string, string][];
  ramas: RamaFlujo[];
  // La rama else / sino (null si el programa no la tiene).
  sino: { accion: string | null; tomada: boolean } | null;
  salida: string;
  fallo: TipoFallo | null;
}

export interface FlujoBucle {
  tipo: "bucle";
  forma: "mientras" | "para";
  // Encabezado del bucle tal como se escribe ("n > 0", "i in range(2, 6)").
  condicion: string;
  // Líneas del cuerpo (primer nivel), tal como se escriben.
  cuerpo: string[];
  // Variables al empezar cada vuelta (una fila por vuelta).
  vueltas: [string, string][][];
  // Variables cuando la condición dejó de cumplirse (null si no terminó normal).
  alSalir: [string, string][] | null;
  salida: string;
  fallo: TipoFallo | null;
}

export type FlujoDatos = FlujoCondicional | FlujoBucle;

function idsDe(ss: Sentencia[] | undefined): Set<string> {
  const ids = new Set<string>();
  const rec = (bloque: Sentencia[] | undefined) => {
    for (const st of bloque ?? []) {
      if (st.id) ids.add(st.id);
      if (st.k === "si") {
        rec(st.entonces);
        rec(st.sino);
      }
      if (st.k === "para" || st.k === "paraCada" || st.k === "mientras") rec(st.cuerpo);
    }
  };
  rec(ss);
  return ids;
}

function textoLinea(render: Render, id: string | undefined): string | null {
  const numero = id ? render.lineaDe[id] : undefined;
  return numero === undefined ? null : render.lineas[numero - 1].trim();
}

// Primera sentencia del bloque que se ve como línea propia.
function primeraAccion(render: Render, bloque: Sentencia[] | undefined): string | null {
  for (const st of bloque ?? []) {
    const t = textoLinea(render, st.id);
    if (t !== null) return t;
  }
  return null;
}

// "if nota >= 90:" / "} else if (nota >= 70) {" / "while (n > 0) {" -> la
// condición sola.
export function condicionDeLinea(linea: string, lang: Lenguaje): string {
  const m =
    lang === "python"
      ? /^(?:if|elif|while|for) (.*):$/.exec(linea)
      : /^(?:\} else )?(?:if|while|for) \((.*)\) \{$/.exec(linea);
  return m ? m[1] : linea;
}

function pares(variables: Record<string, string>): [string, string][] {
  return Object.entries(variables);
}

// Diagrama de flujo del PRIMER condicional o bucle de `main`. Cada
// veredicto sale de la ejecución real (qué sentencia corrió justo después
// de evaluar la condición), no de un texto tipeado.
export function datosFlujo(programa: Prog, lenguaje: Lenguaje): FlujoDatos | null {
  validar(programa);
  const objetivo = programa.main.find((st) => st.k === "si" || st.k === "mientras" || st.k === "para" || st.k === "paraCada");
  if (!objetivo || !objetivo.id) return null;
  const render = renderizar(programa, lenguaje);
  const eventos: { id: string; variables: Record<string, string>; fin: boolean }[] = [];
  const r = interpretar(programa, { lang: lenguaje }, (id, variables, fin) => {
    eventos.push({ id, variables, fin: fin === true });
  });
  const salida = textoSalida(r);

  if (objetivo.k === "si") {
    const conds: SiSt[] = [objetivo];
    let resto = objetivo.sino;
    while (resto && resto.length === 1 && resto[0].k === "si") {
      conds.push(resto[0] as SiSt);
      resto = (resto[0] as SiSt).sino;
    }
    if (conds.some((c) => !c.id || textoLinea(render, c.id) === null)) return null;
    const ramas: RamaFlujo[] = conds.map((c) => {
      const idx = eventos.findIndex((e) => e.id === c.id);
      let resultado: boolean | null = null;
      if (idx >= 0) {
        const siguiente = eventos[idx + 1];
        resultado = siguiente !== undefined && idsDe(c.entonces).has(siguiente.id);
      }
      return { condicion: condicionDeLinea(textoLinea(render, c.id) ?? "", lenguaje), resultado, accion: primeraAccion(render, c.entonces) };
    });
    const primero = eventos.find((e) => e.id === objetivo.id);
    return {
      tipo: "si",
      variables: primero ? pares(primero.variables) : [],
      ramas,
      sino: resto ? { accion: primeraAccion(render, resto), tomada: ramas.every((x) => x.resultado === false) } : null,
      salida,
      fallo: r.fallo,
    };
  }

  const propios = eventos.filter((e) => e.id === objetivo.id);
  const vueltas = propios.filter((e) => !e.fin).map((e) => pares(e.variables));
  const salir = propios.find((e) => e.fin);
  const cuerpo = (objetivo.cuerpo as SId[]).map((st) => textoLinea(render, st.id)).filter((t): t is string => t !== null);
  return {
    tipo: "bucle",
    forma: objetivo.k === "mientras" ? "mientras" : "para",
    condicion: condicionDeLinea(textoLinea(render, objetivo.id) ?? "", lenguaje),
    cuerpo,
    vueltas,
    alSalir: salir ? pares(salir.variables) : null,
    salida,
    fallo: r.fallo,
  };
}

// ------------------------------ crecimiento ------------------------------

export interface SerieCrecimientoDatos {
  nombre: string;
  etiqueta: string;
  // Cuántas veces corre la operación principal para cada n de `ns`.
  valores: number[];
  // valores[i] / valores[i - 1] (null en la primera columna).
  factores: (number | null)[];
}

export interface CrecimientoDatos {
  ns: number[];
  series: SerieCrecimientoDatos[];
}

function ejecutarContar(funcion: Func, valorN: number): number {
  const programa: Prog = { funcs: [funcion], main: [print(call(funcion.nombre, n(valorN)))] as SId[] };
  const r = interpretar(programa, { lang: "python" });
  const valor = Number(r.salida[0]);
  if (r.fallo || !Number.isFinite(valor)) throw new Error(`No se pudo contar ${funcion.nombre}(${valorN})`);
  return valor;
}

// Ejecuta cada `contar(n)` (con el intérprete real) para cada n y calcula
// cuánto crece el trabajo de una columna a la siguiente.
export function datosCrecimiento(series: SerieCrecimiento[], ns: number[]): CrecimientoDatos {
  return {
    ns,
    series: series.map((s) => {
      const valores = ns.map((valorN) => ejecutarContar(s.funcion, valorN));
      const factores = valores.map((x, i) => (i === 0 || valores[i - 1] <= 0 ? null : Math.round((x / valores[i - 1]) * 10) / 10));
      return { nombre: s.nombre, etiqueta: s.etiqueta, valores, factores };
    }),
  };
}
