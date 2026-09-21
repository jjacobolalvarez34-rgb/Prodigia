// SOLO PARA TESTS (Node): ejecuta de verdad fragmentos de Python, Java,
// JavaScript y TypeScript en lote y devuelve stdout + causa de fallo.
// Nada de esto se importa desde código de la app.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ts from "typescript";

export interface ResultadoReal {
  stdout: string; // sin \r, sin \n final
  // null = corrió sin error.
  error: null | {
    tipo: string; // SyntaxError, NameError, ArrayIndexOutOfBoundsException, "compilacion"...
    linea: number | null; // línea del PROGRAMA EJECUTADO (1-based)
    mensaje: string;
    codigo?: number; // TS: código de diagnóstico
  };
  fase: "compilacion" | "ejecucion";
}

function norm(s: string): string {
  return s.replace(/\r\n/g, "\n").replace(/\n$/, "");
}

function tmp(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
}

// ---------------- Python ----------------
const PY_RUNNER = `
import sys, json, io
progs = json.load(open(sys.argv[1], encoding="utf8"))
res = []
for code in progs:
    try:
        c = compile(code, "<p>", "exec")
    except SyntaxError as e:
        res.append({"stdout": "", "error": {"tipo": type(e).__name__, "linea": e.lineno, "mensaje": str(e)}, "fase": "compilacion"})
        continue
    buf = io.StringIO()
    old = sys.stdout
    sys.stdout = buf
    err = None
    try:
        exec(c, {"__name__": "__main__"})
    except BaseException as e:
        tb = e.__traceback__
        linea = None
        while tb:
            if tb.tb_frame.f_code.co_filename == "<p>":
                linea = tb.tb_lineno
            tb = tb.tb_next
        err = {"tipo": type(e).__name__, "linea": linea, "mensaje": str(e)}
    finally:
        sys.stdout = old
    res.append({"stdout": buf.getvalue(), "error": err, "fase": "ejecucion"})
sys.stdout.write(json.dumps(res))
`;

export function hayPython(): boolean {
  return spawnSync("python", ["--version"]).status === 0;
}

export function ejecutarPython(codigos: string[]): ResultadoReal[] {
  const dir = tmp("codia-py");
  fs.writeFileSync(path.join(dir, "runner.py"), PY_RUNNER);
  fs.writeFileSync(path.join(dir, "in.json"), JSON.stringify(codigos));
  const r = spawnSync("python", ["-X", "utf8", path.join(dir, "runner.py"), path.join(dir, "in.json")], { encoding: "utf8", maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`python falló: ${r.stderr}`);
  const arr = JSON.parse(r.stdout) as ResultadoReal[];
  return arr.map((x) => ({ ...x, stdout: norm(x.stdout) }));
}

// ---------------- JavaScript ----------------
const JS_RUNNER = `
const vm = require("vm"), util = require("util"), fs = require("fs");
const progs = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
function linea(e) { const m = /p\\.js:(\\d+)/.exec(String(e && e.stack)); return m ? Number(m[1]) : null; }
const out = progs.map((code) => {
  const lines = [];
  const ctx = vm.createContext({ console: { log: (...a) => { lines.push(util.format(...a)); } } });
  try { new vm.Script(code, { filename: "p.js" }); }
  catch (e) { return { stdout: "", error: { tipo: e.name, linea: linea(e), mensaje: e.message }, fase: "compilacion" }; }
  try {
    vm.runInContext(code, ctx, { filename: "p.js", timeout: 5000 });
    return { stdout: lines.join("\\n"), error: null, fase: "ejecucion" };
  } catch (e) {
    return { stdout: lines.join("\\n"), error: { tipo: e.name, linea: linea(e), mensaje: e.message }, fase: "ejecucion" };
  }
});
process.stdout.write(JSON.stringify(out));
`;

export function ejecutarJs(codigos: string[]): ResultadoReal[] {
  const dir = tmp("codia-js");
  fs.writeFileSync(path.join(dir, "runner.js"), JS_RUNNER);
  fs.writeFileSync(path.join(dir, "in.json"), JSON.stringify(codigos));
  const r = spawnSync(process.execPath, [path.join(dir, "runner.js"), path.join(dir, "in.json")], { encoding: "utf8", maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`node falló: ${r.stderr}`);
  return (JSON.parse(r.stdout) as ResultadoReal[]).map((x) => ({ ...x, stdout: norm(x.stdout) }));
}

// ---------------- TypeScript ----------------
const OPCIONES_TS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2020,
  lib: ["lib.es2020.d.ts", "lib.dom.d.ts"],
  strict: true,
  noEmit: true,
  types: [],
  skipLibCheck: true,
};

// Type-check de TODOS los programas en una sola Program (cada archivo es
// un módulo con `export {};` para que sus nombres no choquen) y luego
// ejecución del JS transpilado de los que compilan.
export function ejecutarTs(codigos: string[]): ResultadoReal[] {
  const nombres = codigos.map((_, i) => `/virtual/p${i}.ts`);
  const contenido = new Map<string, string>();
  codigos.forEach((c, i) => contenido.set(nombres[i], `export {}; ${c}`));
  const host = ts.createCompilerHost(OPCIONES_TS);
  const getSF = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, lang, onErr, should) => {
    const c = contenido.get(fileName);
    if (c !== undefined) return ts.createSourceFile(fileName, c, ts.ScriptTarget.ES2020, true);
    return getSF(fileName, lang, onErr, should);
  };
  const fe = host.fileExists.bind(host);
  host.fileExists = (f) => contenido.has(f) || fe(f);
  const rf = host.readFile.bind(host);
  host.readFile = (f) => contenido.get(f) ?? rf(f);
  const program = ts.createProgram(nombres, OPCIONES_TS, host);
  const diags = ts.getPreEmitDiagnostics(program);
  const porArchivo = new Map<string, ts.Diagnostic[]>();
  for (const d of diags) {
    const f = d.file?.fileName;
    if (!f || !contenido.has(f)) continue;
    porArchivo.set(f, [...(porArchivo.get(f) ?? []), d]);
  }
  // Los que compilan se ejecutan como JS.
  const aEjecutar: { i: number; js: string }[] = [];
  const res: ResultadoReal[] = codigos.map((c, i) => {
    const ds = porArchivo.get(nombres[i]);
    if (ds && ds.length > 0) {
      const d = ds[0];
      const linea = d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start).line + 1 : null;
      return {
        stdout: "",
        error: { tipo: "compilacion", linea, mensaje: ts.flattenDiagnosticMessageText(d.messageText, " "), codigo: d.code },
        fase: "compilacion",
      };
    }
    const js = ts.transpileModule(c, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None } }).outputText;
    aEjecutar.push({ i, js });
    return { stdout: "", error: null, fase: "ejecucion" };
  });
  if (aEjecutar.length > 0) {
    const reales = ejecutarJs(aEjecutar.map((a) => a.js));
    aEjecutar.forEach((a, k) => {
      res[a.i] = reales[k];
    });
  }
  return res;
}

// ---------------- Java ----------------
const JAVA_RUNNER = `
import java.io.*;
import java.lang.reflect.*;
public class Runner {
  public static void main(String[] args) throws Exception {
    PrintStream orig = System.out;
    for (String name : args) {
      ByteArrayOutputStream bo = new ByteArrayOutputStream();
      System.setOut(new PrintStream(bo, true, "UTF-8"));
      String tipo = "";
      String msg = "";
      int linea = -1;
      try {
        Class.forName(name).getMethod("main", String[].class).invoke(null, (Object) new String[0]);
      } catch (InvocationTargetException e) {
        Throwable t = e.getCause();
        tipo = t.getClass().getName();
        msg = String.valueOf(t.getMessage()).replace("\\n", " ");
        for (StackTraceElement el : t.getStackTrace()) {
          if (el.getClassName().equals(name)) { linea = el.getLineNumber(); break; }
        }
      }
      System.setOut(orig);
      orig.println("@@@BEGIN@@@" + name + "@@@" + tipo + "@@@" + linea + "@@@" + msg);
      orig.print(bo.toString("UTF-8"));
      orig.println("@@@END@@@");
    }
  }
}
`;

export function hayJava(): boolean {
  const c = spawnSync("javac", ["--release", "8", "-version"], { encoding: "utf8" });
  const j = spawnSync("java", ["-version"], { encoding: "utf8" });
  return c.status === 0 && j.status === 0;
}

// Cada código debe ser un programa con `public class Main`. Se renombra a P<i>.
export function ejecutarJava(codigos: string[]): ResultadoReal[] {
  const dir = tmp("codia-java");
  const out = path.join(dir, "out");
  fs.mkdirSync(out);
  fs.writeFileSync(path.join(dir, "Runner.java"), JAVA_RUNNER);
  codigos.forEach((c, i) => {
    fs.writeFileSync(path.join(dir, `P${i}.java`), c.replace(/public class Main\b/, `public class P${i}`));
  });

  const compilar = (indices: number[]) => {
    const archivos = [...indices.map((i) => path.join(dir, `P${i}.java`)), path.join(dir, "Runner.java")];
    fs.writeFileSync(path.join(dir, "args.txt"), archivos.map((a) => `"${a.replace(/\\/g, "/")}"`).join("\n"));
    return spawnSync("javac", ["--release", "8", "-Xlint:-options", "-Xmaxerrs", "5000", "-encoding", "UTF-8", "-d", out, `@${path.join(dir, "args.txt")}`], {
      encoding: "utf8",
      maxBuffer: 1 << 28,
    });
  };

  const res: ResultadoReal[] = codigos.map(() => ({ stdout: "", error: null, fase: "ejecucion" as const }));
  let vivos = codigos.map((_, i) => i);
  // javac no llega a la fase semántica si hay errores de sintaxis en algún
  // archivo: se recompila sin los fallidos hasta que compile limpio.
  for (let pasada = 0; pasada < 12; pasada++) {
    const c = compilar(vivos);
    if (c.status === 0) break;
    const texto = c.stderr + c.stdout;
    const re = /P(\d+)\.java:(\d+): error: (.*)/g;
    let m: RegExpExecArray | null;
    let nuevos = 0;
    while ((m = re.exec(texto)) !== null) {
      const i = Number(m[1]);
      if (res[i].fase === "compilacion" && res[i].error) continue;
      res[i] = { stdout: "", error: { tipo: "compilacion", linea: Number(m[2]), mensaje: m[3] }, fase: "compilacion" };
      nuevos++;
    }
    if (nuevos === 0) throw new Error(`javac falló sin errores de programa:
${texto}`);
    vivos = vivos.filter((i) => res[i].fase !== "compilacion");
  }

  for (let k = 0; k < vivos.length; k += 100) {
    const lote = vivos.slice(k, k + 100);
    const r = spawnSync("java", ["-cp", out, "Runner", ...lote.map((i) => `P${i}`)], { encoding: "utf8", maxBuffer: 1 << 28 });
    if (r.status !== 0) throw new Error(`java falló: ${r.stderr}`);
    const bloques = r.stdout.split("@@@BEGIN@@@").slice(1);
    bloques.forEach((b) => {
      const [cab, ...resto] = b.split("@@@END@@@")[0].split("\n");
      const [name, tipo, linea, ...msg] = cab.replace(/\r$/, "").split("@@@");
      const i = Number(name.slice(1));
      const stdout = norm(resto.join("\n"));
      res[i] = tipo
        ? { stdout, error: { tipo: tipo.replace("java.lang.", ""), linea: Number(linea) > 0 ? Number(linea) : null, mensaje: msg.join("@@@") }, fase: "ejecucion" }
        : { stdout, error: null, fase: "ejecucion" };
    });
  }
  return res;
}

export function ejecutar(lang: "python" | "java" | "javascript" | "typescript", codigos: string[]): ResultadoReal[] {
  if (codigos.length === 0) return [];
  if (lang === "python") return ejecutarPython(codigos);
  if (lang === "java") return ejecutarJava(codigos);
  if (lang === "javascript") return ejecutarJs(codigos);
  return ejecutarTs(codigos);
}
