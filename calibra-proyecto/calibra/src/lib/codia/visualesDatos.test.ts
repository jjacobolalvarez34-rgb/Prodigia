import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { LECCIONES_CODIA } from "./lecciones";
import { call, n, print, LENGUAJES, type Lenguaje, type Prog, type SId } from "./tipos";
import { ensamblar, renderizar } from "./render";
import { ejecutar, hayJava, hayPython, type ResultadoReal } from "./ejecutores";
import { datosComparar, datosCrecimiento, datosFlujo, datosTraza, nombreFallo, condicionDeLinea, type FlujoBucle, type FlujoCondicional } from "./visualesDatos";
import type { VisualCodiaComparar, VisualCodiaCrecimiento, VisualCodiaFlujo, VisualCodiaTraza } from "./visuales";
import { interpretar } from "./interprete";
import { TRAZA_REPETIR_TEXTO } from "./lecciones/programas";

// Los visuales de Codia NUNCA llevan una salida, una tabla de variables ni un
// veredicto tipeados a mano: los calculan visualesDatos.ts con el renderizador
// y el intérprete de la práctica. Este test los compara contra la EJECUCIÓN
// REAL de cada lenguaje (Python, Java, JavaScript, TypeScript con chequeo de
// tipos), y la tabla de variables y los veredicto del flujo contra un
// TRAZADOR INDEPENDIENTE de Python (sys.settrace sobre el intérprete real).

const TIMEOUT = 600_000;
const PY = hayPython();
const JAVA = hayJava();
const RUNTIME: Record<Lenguaje, boolean> = { python: PY, java: JAVA, javascript: true, typescript: true };

const TRAZAS = LECCIONES_CODIA.flatMap((l) => (l.visuales ?? []).filter((v): v is VisualCodiaTraza & { despuesDePaso?: number } => v.tipo === "codia.traza").map((v) => ({ slug: l.slug, v })));
const COMPARAR = LECCIONES_CODIA.flatMap((l) => (l.visuales ?? []).filter((v): v is VisualCodiaComparar => v.tipo === "codia.comparar").map((v) => ({ slug: l.slug, v })));
const FLUJOS = LECCIONES_CODIA.flatMap((l) => (l.visuales ?? []).filter((v): v is VisualCodiaFlujo => v.tipo === "codia.flujo").map((v) => ({ slug: l.slug, v })));
const CRECIMIENTOS = LECCIONES_CODIA.flatMap((l) => (l.visuales ?? []).filter((v): v is VisualCodiaCrecimiento => v.tipo === "codia.crecimiento").map((v) => ({ slug: l.slug, v })));

function ejecutable(programa: Prog, lang: Lenguaje): string {
  const r = renderizar(programa, lang);
  return ensamblar(lang, r.lineas, r.nImports, r.nFuncs).codigo;
}

function ejecutarRender(programas: { programa: Prog; lang: Lenguaje }[], lang: Lenguaje): ResultadoReal[] {
  return ejecutar(lang, programas.filter((p) => p.lang === lang).map((p) => ejecutable(p.programa, lang)));
}

// ---------- trazador independiente de Python ----------
const TRAZADOR = String.raw`
import sys, json
from collections import deque
progs = json.load(open(sys.argv[1], encoding="utf8"))

def norm(x):
    if isinstance(x, bool):
        return "True" if x else "False"
    if isinstance(x, int):
        return str(x)
    if isinstance(x, str):
        return json.dumps(x, ensure_ascii=False)
    if isinstance(x, (list, deque)):
        return "[" + ", ".join(norm(i) for i in x) + "]"
    if isinstance(x, set):
        return "{" + ", ".join(sorted((norm(i) for i in x), key=lambda t: int(t))) + "}"
    if isinstance(x, dict):
        return "{" + ", ".join(str(k) + ": " + norm(v) for k, v in x.items()) + "}"
    return None

def foto(loc):
    out = {}
    for k, v in loc.items():
        if k.startswith("__"):
            continue
        t = norm(v)
        if t is not None:
            out[k] = t
    return out

res = []
for code in progs:
    eventos = []
    def tr(frame, event, arg):
        if frame.f_code.co_filename != "<p>":
            return None
        if event == "line":
            eventos.append({"tipo": "line", "linea": frame.f_lineno, "frame": id(frame), "vars": foto(frame.f_locals)})
        elif event == "return":
            eventos.append({"tipo": "return", "linea": frame.f_lineno, "frame": id(frame), "vars": foto(frame.f_locals)})
        return tr
    salida = []
    class Buf:
        def write(self, s): salida.append(s)
        def flush(self): pass
    old = sys.stdout
    sys.stdout = Buf()
    sys.settrace(tr)
    try:
        exec(compile(code, "<p>", "exec"), {"__name__": "__main__"})
    except BaseException as e:
        sys.settrace(None)
        sys.stdout = old
        res.append({"error": type(e).__name__, "eventos": eventos, "stdout": "".join(salida)})
        continue
    sys.settrace(None)
    sys.stdout = old
    res.append({"error": None, "eventos": eventos, "stdout": "".join(salida)})
sys.stdout.write(json.dumps(res))
`;

interface EventoReal {
  tipo: "line" | "return";
  linea: number;
  frame: number;
  vars: Record<string, string>;
}
interface TrazaReal {
  error: string | null;
  eventos: EventoReal[];
  stdout: string;
}

function trazarPython(codigos: string[]): TrazaReal[] {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "codia-traza-"));
  fs.writeFileSync(path.join(dir, "t.py"), TRAZADOR);
  fs.writeFileSync(path.join(dir, "in.json"), JSON.stringify(codigos));
  const r = spawnSync("python", ["-X", "utf8", path.join(dir, "t.py"), path.join(dir, "in.json")], { encoding: "utf8", maxBuffer: 1 << 28 });
  fs.rmSync(dir, { recursive: true, force: true });
  if (r.status !== 0) throw new Error(`trazador falló: ${r.stderr}`);
  return JSON.parse(r.stdout) as TrazaReal[];
}

// Lo mismo que muestra el visual pero en el formato del trazador: sin el
// sufijo (tope/frente) de pilas y colas y con los conjuntos ordenados.
function normalizarNuestro(valor: string): string {
  const sinSufijo = valor.replace(/ \((?:tope|frente): -?\d+\)$/, "");
  if (/^\{[^:]*\}$/.test(sinSufijo)) {
    const items = sinSufijo.slice(1, -1).split(", ").filter((x) => x !== "");
    return `{${items.sort((a, b) => Number(a) - Number(b)).join(", ")}}`;
  }
  return sinSufijo;
}

function posteriorMismoFrame(eventos: EventoReal[], desde: number): EventoReal | undefined {
  for (let j = desde + 1; j < eventos.length; j++) if (eventos[j].frame === eventos[desde].frame) return eventos[j];
  return undefined;
}

// Alinea cada paso de la traza con el evento de línea real correspondiente:
// hacia adelante en el tiempo y, si la sentencia contiene una llamada (nuestro
// paso ocurre DESPUÉS de la función), hacia atrás. El estado que muestra el
// visual es el de "después de ejecutar la línea" = el estado real en el
// siguiente evento del mismo marco.
function alinear(pasos: { linea: number }[], eventos: EventoReal[]): number[] {
  const consumidos = new Set<number>();
  const indices: number[] = [];
  let puntero = 0;
  for (const paso of pasos) {
    let hallado = -1;
    for (let j = puntero; j < eventos.length; j++) {
      if (eventos[j].tipo === "line" && eventos[j].linea === paso.linea && !consumidos.has(j)) {
        hallado = j;
        break;
      }
    }
    if (hallado < 0) {
      for (let j = puntero - 1; j >= 0; j--) {
        if (eventos[j].tipo === "line" && eventos[j].linea === paso.linea && !consumidos.has(j)) {
          hallado = j;
          break;
        }
      }
    }
    indices.push(hallado);
    if (hallado >= 0) {
      consumidos.add(hallado);
      puntero = Math.max(puntero, hallado + 1);
    }
  }
  return indices;
}

// ---------- pruebas ----------
describe("Codia visuales: hay de todos los tipos", () => {
  it("las lecciones traen trazas, comparaciones, flujos y crecimientos", () => {
    expect(TRAZAS.length).toBeGreaterThan(15);
    expect(COMPARAR.length).toBeGreaterThan(10);
    expect(FLUJOS.length).toBeGreaterThanOrEqual(5);
    expect(CRECIMIENTOS.length).toBeGreaterThanOrEqual(3);
  });
});

describe("Codia visuales: la traza (código, salida y tabla de variables) coincide con la ejecución REAL", () => {
  it.skipIf(!PY)(
    "cada traza en Python: stdout real, mismas líneas y mismas variables paso a paso que sys.settrace",
    () => {
      const unicas = [...new Map(TRAZAS.map(({ v }) => [JSON.stringify([v.programa, v.lenguaje]), v])).values()];
      expect(unicas.every((v) => v.lenguaje === "python")).toBe(true);
      const reales = trazarPython(unicas.map((v) => ejecutable(v.programa, "python")));
      unicas.forEach((v, k) => {
        const datos = datosTraza(v.programa, "python");
        const real = reales[k];
        const donde = `${JSON.stringify(v.titulo)}\n${datos.codigo}`;
        // El código mostrado es el ejecutable (Python no lleva envoltorio).
        expect(datos.codigo.trimEnd(), donde).toBe(ejecutable(v.programa, "python").trimEnd());
        expect(datos.fallo, donde).toBeNull();
        expect(real.error, donde).toBeNull();
        expect(datos.salida, `salida mostrada vs real\n${donde}`).toBe(real.stdout.replace(/\r?\n$/, ""));
        expect(datos.pasos.length, donde).toBeGreaterThan(0);
        const indices = alinear(datos.pasos, real.eventos);
        datos.pasos.forEach((p, i) => {
          expect(indices[i], `paso ${i + 1} (línea ${p.linea}) sin evento real\n${donde}`).toBeGreaterThanOrEqual(0);
          const despues = posteriorMismoFrame(real.eventos, indices[i]);
          expect(despues, `paso ${i + 1} sin estado posterior real\n${donde}`).toBeDefined();
          const nuestras = Object.fromEntries(p.variables.map(([nombre, valor]) => [nombre, normalizarNuestro(valor)]));
          expect(nuestras, `variables del paso ${i + 1} (línea ${p.linea})\n${donde}`).toEqual(despues!.vars);
        });
      });
    },
    TIMEOUT
  );

  it("cada paso resalta una línea que existe en el código mostrado", () => {
    for (const { slug, v } of TRAZAS) {
      const datos = datosTraza(v.programa, v.lenguaje);
      const lineas = datos.codigo.split("\n");
      for (const p of datos.pasos) {
        expect(p.linea, slug).toBeGreaterThanOrEqual(1);
        expect(p.linea, slug).toBeLessThanOrEqual(lineas.length);
        expect(lineas[p.linea - 1].trim().length, `${slug}: línea ${p.linea} vacía`).toBeGreaterThan(0);
      }
    }
  });
});

describe.each(["python", "java", "javascript", "typescript"] as Lenguaje[])("Codia visuales: la comparación en %s coincide con la ejecución REAL", (lang) => {
  it.skipIf(!RUNTIME[lang])(
    "código mostrado = código ejecutado, salida real o error real",
    () => {
      const programas = [...new Map(COMPARAR.map(({ v }) => [JSON.stringify(v.programa), v.programa])).values()];
      const reales = ejecutarRender(programas.map((programa) => ({ programa, lang })), lang);
      programas.forEach((programa, k) => {
        const mostrado = datosComparar(programa).resultados.find((r) => r.lenguaje === lang)!;
        const real = reales[k];
        const donde = `${lang}\n${mostrado.codigo}\n-> real ${JSON.stringify(real)} vs mostrado ${JSON.stringify(mostrado)}`;
        expect(mostrado.codigo.trimEnd(), donde).toBe(renderizar(programa, lang).lineas.join("\n").trimEnd());
        if (mostrado.fallo === null) {
          expect(real.error, `debía correr sin error\n${donde}`).toBeNull();
          expect(mostrado.salida, `salida mostrada vs real\n${donde}`).toBe(real.stdout);
        } else {
          expect(real.error, `debía fallar\n${donde}`).not.toBeNull();
          if (mostrado.nombreError !== null) expect(real.error!.tipo, `nombre real del error\n${donde}`).toBe(mostrado.nombreError);
        }
      });
    },
    TIMEOUT
  );
});

describe("Codia visuales: nombres de error", () => {
  it("cubren los errores que muestran las lecciones y no inventan otros", () => {
    expect(nombreFallo("DivCero", "python")).toBe("ZeroDivisionError");
    expect(nombreFallo("DivCero", "java")).toBe("ArithmeticException");
    expect(nombreFallo("IndiceFuera", "python")).toBe("IndexError");
    expect(nombreFallo("IndiceFuera", "java")).toBe("ArrayIndexOutOfBoundsException");
    expect(nombreFallo("Tipo", "python")).toBe("TypeError");
    expect(nombreFallo("DivCero", "javascript")).toBeNull();
  });

  it("todo fallo que aparece en una comparación tiene nombre real verificado (y se ejecutó arriba)", () => {
    const vistos = new Set<string>();
    for (const { v } of COMPARAR)
      for (const r of datosComparar(v.programa).resultados)
        if (r.fallo) {
          vistos.add(`${r.fallo}/${r.lenguaje}`);
          expect(r.nombreError, `${r.fallo} en ${r.lenguaje}`).not.toBeNull();
        }
    expect(vistos.size).toBeGreaterThanOrEqual(4);
  });
});

describe("Codia visuales: el diagrama de flujo coincide con la ejecución REAL", () => {
  it.skipIf(!PY)(
    "cada rama evaluada (y su veredicto), cada vuelta y las variables al salir salen del trazador de Python",
    () => {
      const unicas = [...new Map(FLUJOS.map(({ v }) => [JSON.stringify([v.programa, v.lenguaje]), v])).values()];
      const reales = trazarPython(unicas.map((v) => ejecutable(v.programa, "python")));
      let condicionales = 0;
      let bucles = 0;
      unicas.forEach((v, k) => {
        expect(v.lenguaje).toBe("python");
        const datos = datosFlujo(v.programa, "python");
        expect(datos, JSON.stringify(v.titulo)).not.toBeNull();
        const real = reales[k];
        const render = renderizar(v.programa, "python");
        expect(datos!.salida).toBe(real.stdout.replace(/\r?\n$/, ""));
        const eventos = real.eventos;
        const lineaDeId = (id: string) => render.lineaDe[id];
        if (datos!.tipo === "si") {
          condicionales++;
          const d = datos as FlujoCondicional;
          const objetivo = v.programa.main.find((st) => st.k === "si")!;
          // La cadena de ids if / elif del programa.
          const ids: string[] = [];
          let cur: SId | undefined = objetivo;
          while (cur && cur.k === "si") {
            ids.push(cur.id!);
            const sino: SId[] | undefined = cur.sino;
            cur = sino && sino.length === 1 && sino[0].k === "si" ? sino[0] : undefined;
          }
          expect(d.ramas).toHaveLength(ids.length);
          ids.forEach((id, i) => {
            const idx = eventos.findIndex((e) => e.tipo === "line" && e.linea === lineaDeId(id));
            const evaluada = idx >= 0;
            expect(d.ramas[i].resultado !== null, `rama ${i} evaluada`).toBe(evaluada);
            if (evaluada) {
              // Verdadera si la siguiente línea real es la primera de su rama.
              const siguiente = posteriorMismoFrame(eventos, idx)!;
              const primeraDeLaRama = lineaDeId(objetivoRama(objetivo, i));
              expect(d.ramas[i].resultado, `veredicto de la rama ${i}`).toBe(siguiente.linea === primeraDeLaRama);
              // Además la condición mostrada evalúa igual en Python real.
              const texto = condicionDeLinea(render.lineas[lineaDeId(id) - 1].trim(), "python");
              expect(d.ramas[i].condicion).toBe(texto);
            }
          });
        } else {
          bucles++;
          const d = datos as FlujoBucle;
          const objetivo = v.programa.main.find((st) => st.k === "mientras" || st.k === "para" || st.k === "paraCada")!;
          const linea = lineaDeId(objetivo.id!);
          const cabeceras = eventos.filter((e) => e.tipo === "line" && e.linea === linea);
          // Vueltas reales = evaluaciones del encabezado menos la última (la que corta).
          expect(d.vueltas.length, "vueltas").toBe(cabeceras.length - 1);
          expect(d.alSalir, "variables al salir").not.toBeNull();
          const ultimaCabecera = cabeceras[cabeceras.length - 1];
          const mostradas = Object.fromEntries(d.alSalir!.map(([nombre, valor]) => [nombre, normalizarNuestro(valor)]));
          expect(mostradas).toEqual(ultimaCabecera.vars);
        }
      });
      expect(condicionales).toBeGreaterThanOrEqual(3);
      expect(bucles).toBeGreaterThanOrEqual(2);
    },
    TIMEOUT
  );
});

// Primera sentencia (id) de la rama `i` de la cadena if / elif.
function objetivoRama(objetivo: SId, i: number): string {
  let cur: SId = objetivo;
  for (let k = 0; k < i; k++) cur = (cur as Extract<SId, { k: "si" }>).sino![0];
  return ((cur as Extract<SId, { k: "si" }>).entonces[0] as SId).id!;
}

describe.each(["python", "java", "javascript", "typescript"] as Lenguaje[])("Codia visuales: el crecimiento en %s coincide con la ejecución REAL", (lang) => {
  it.skipIf(!RUNTIME[lang])(
    "cada contar(n) real da los mismos números que muestra el visual",
    () => {
      const pares: { programa: Prog; esperado: number }[] = [];
      for (const { v } of CRECIMIENTOS) {
        const datos = datosCrecimiento(v.series, v.ns);
        v.series.forEach((serie, si) =>
          v.ns.forEach((valorN, ni) => {
            const programa: Prog = { funcs: [serie.funcion], main: [print(call(serie.funcion.nombre, n(valorN))) as SId] };
            pares.push({ programa, esperado: datos.series[si].valores[ni] });
          })
        );
      }
      expect(pares.length).toBeGreaterThan(20);
      const unicos = [...new Map(pares.map((p) => [ejecutable(p.programa, lang), p.esperado])).entries()];
      const res = ejecutar(lang, unicos.map(([codigo]) => codigo));
      unicos.forEach(([codigo, esperado], k) => {
        expect(res[k].error, codigo).toBeNull();
        expect(Number(res[k].stdout), `${lang}\n${codigo}`).toBe(esperado);
      });
    },
    TIMEOUT
  );

  it("los factores son cocientes de los conteos reales y las clases crecen como dicen", () => {
    for (const { v } of CRECIMIENTOS) {
      const datos = datosCrecimiento(v.series, v.ns);
      for (const serie of datos.series) {
        serie.valores.forEach((x, i) => {
          if (i === 0) expect(serie.factores[i]).toBeNull();
          else expect(serie.factores[i]).toBe(Math.round((x / serie.valores[i - 1]) * 10) / 10);
        });
      }
    }
    // Duplicar n: O(n) ×2, O(n²) ×4 (a n grande), O(log n) casi no cambia.
    const uno = datosCrecimiento(CRECIMIENTOS[0].v.series, [8, 16]);
    expect(uno.series.find((s) => s.etiqueta === "O(n)")!.factores[1]).toBe(2);
    expect(uno.series.find((s) => s.etiqueta === "O(n²)")!.factores[1]).toBe(4);
  });
});

describe("Codia visuales: los programas de las lecciones no fallan en el intérprete salvo lo esperado", () => {
  it("toda traza y todo flujo corre sin error en su lenguaje", () => {
    for (const { slug, v } of [...TRAZAS, ...FLUJOS]) {
      // Repetir un texto con * solo existe en Python (en los otros tres no compila).
      const langs = v.programa === TRAZA_REPETIR_TEXTO ? (["python"] as Lenguaje[]) : LENGUAJES;
      for (const lang of langs) {
        const r = interpretar(v.programa, { lang });
        expect(r.fallo, `${slug} ${lang}`).toBeNull();
      }
    }
  });
});
