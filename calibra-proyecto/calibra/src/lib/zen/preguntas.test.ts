import { describe, expect, it } from "vitest";
import { modificadorAritmetica, nivelDePregunta, normalizarConfigZen, opcionesZen, opcionVisible, rangosAritmetica, temasPorDefecto, type ConfigZen } from "./config";
import { rangoOperandos } from "@/lib/practica/problems";
import { estadisticasZen, formatearDuracion, resultadoDe, type RegistroZen } from "./estadisticas";
import { claveZen, esCorrectaZen, fallaZen, generarZen, solucionZen, temasZen, type PreguntaZen } from "./preguntas";

const MUNDOS = ["numeria", "geografia", "enigmia", "quimia", "anatomia", "melodia", "trigonometria", "historia", "calculia", "circuitia", "estadistica", "naipia", "codia", "dinamia", "vitalia"];

const correctaDe = (q: PreguntaZen) => (q.tipo === "mapa" ? q.id : q.p.entrada.tipo === "numero" ? String(q.p.entrada.respuesta) : q.p.entrada.tipo === "esqueleto" ? q.p.entrada.objetivo : q.p.entrada.respuesta);

function config(slug: string, parcial: Partial<ConfigZen>): ConfigZen {
  return { ...normalizarConfigZen(slug, null), ...parcial };
}

describe("Modo Zen: preguntas de los 15 mundos", () => {
  for (const mundo of MUNDOS) {
    it(`${mundo}: cada tema y todos juntos generan preguntas válidas en los niveles 1, 5 y 10`, () => {
      const temas = temasZen(mundo);
      expect(temas.length).toBeGreaterThan(0);
      for (const elegidos of [...temas.map((t) => [t.id]), temas.map((t) => t.id)]) {
        for (const nivel of [1, 5, 10]) {
          const usados = new Set<string>();
          const c = config(mundo, { temas: elegidos, nivelMin: nivel, nivelMax: nivel });
          for (let k = 0; k < 4; k++) {
            const q = generarZen(mundo, c, k, usados, []);
            expect(q, `${mundo}/${elegidos.join(",")}/${nivel}`).not.toBeNull();
            usados.add(claveZen(q!));
            if (q!.tipo === "mundo") {
              const e = q!.p.entrada;
              if (e.tipo === "opciones") expect(e.opciones, `${mundo}/${elegidos}`).toContain(e.respuesta);
              if (e.tipo === "numero") expect(Number.isFinite(e.respuesta)).toBe(true);
            }
            // La respuesta correcta se reconoce como correcta.
            expect(esCorrectaZen(q!, correctaDe(q!))).toBe(true);
            expect(solucionZen(q!).length).toBeGreaterThan(0);
          }
        }
      }
    }, 60_000);
  }

  it("Numeria: cada subtema de aritmética, fracciones, geometría, potencias y álgebra trae «cómo se resuelve»", () => {
    for (const t of temasZen("numeria")) {
      if (t.grupo === "decimales") continue; // el generador de decimales lo mantiene otro equipo
      const q = generarZen("numeria", config("numeria", { temas: [t.id], nivelMin: 5, nivelMax: 5 }), 0, new Set(), null);
      expect(q?.tipo === "mundo" && (q.p.pasos?.length ?? 0) > 0, t.id).toBe(true);
    }
  });

  it("Numeria: solo salen las operaciones elegidas y con sus opciones", () => {
    const c = config("numeria", { temas: ["aritmetica:multiplicacion"], opciones: { inverso: true, negativos: false, grandes: false } });
    for (let k = 0; k < 30; k++) {
      const q = generarZen("numeria", c, k % 10, new Set(), null);
      expect(q?.tipo === "mundo" && /^\d+ × \? = \d+$/.test(q.p.enunciado), q?.tipo === "mundo" ? q.p.enunciado : "").toBe(true);
    }
    const restas = config("numeria", { temas: ["aritmetica:resta"], nivelMin: 5, nivelMax: 5, opciones: { negativos: false } });
    for (let k = 0; k < 40; k++) {
      const q = generarZen("numeria", restas, 0, new Set(), null);
      expect(q?.tipo === "mundo" && q.p.entrada.tipo === "numero" && q.p.entrada.respuesta >= 0).toBe(true);
    }
  });

  it("Geografía: «solo el mapa» nunca trae preguntas de lugares y «solo lugares» no trae el mapa", () => {
    const mapa = config("geografia", { temas: ["europa"], nivelMin: 10, nivelMax: 10, opciones: { preguntas: "mapa" } });
    const lugares = config("geografia", { temas: ["europa"], nivelMin: 1, nivelMax: 1, opciones: { preguntas: "lugares" } });
    for (let k = 0; k < 20; k++) {
      expect(generarZen("geografia", mapa, k % 10, new Set(), null)?.tipo).toBe("mapa");
      expect(generarZen("geografia", lugares, k % 10, new Set(), null)?.tipo).toBe("mundo");
    }
  });

  it("Codia: el lenguaje elegido es el de todas las preguntas", () => {
    const c = config("codia", { temas: ["salida"], opciones: { filtro: "python" } });
    for (let k = 0; k < 10; k++) {
      const q = generarZen("codia", c, k, new Set(), null);
      const codigo = q?.tipo === "mundo" ? q.p.visuales?.find((v) => v.tipo === "codigo") : undefined;
      expect(codigo && codigo.tipo === "codigo" ? codigo.lenguaje : "Python").toBe("Python");
    }
  });

  it("fallaZen arma el repaso con los intentos, la correcta y los pasos", () => {
    const q = generarZen("numeria", config("numeria", { temas: ["aritmetica:suma"], nivelMin: 3, nivelMax: 3 }), 0, new Set(), null)!;
    const f = fallaZen(q, ["1.5", "7"], (p) => `¿Dónde está ${p}?`);
    expect(f.tuRespuesta).toBe("1,5  ·  7");
    expect(f.correcta).toBe(solucionZen(q));
    expect(f.pasos.length).toBeGreaterThan(0);
    expect(fallaZen(q, [], (p) => p).tuRespuesta).toBeNull();

    const mapa = generarZen("geografia", config("geografia", { temas: ["europa"], opciones: { preguntas: "mapa" } }), 0, new Set(), null)!;
    if (mapa.tipo !== "mapa") throw new Error("se esperaba el mapa");
    const fm = fallaZen(mapa, ["francia"], (p) => `¿Dónde está ${p}?`);
    expect(fm.enunciado).toBe(`¿Dónde está ${mapa.nombre}?`);
    expect(fm.correcta).toBe(mapa.nombre);
    expect(fm.pasos.length).toBeGreaterThan(0);
  });
});

describe("Modo Zen: configuración", () => {
  it("normaliza lo guardado: temas válidos, niveles en orden y dentro de 1-10, largo permitido", () => {
    const c = normalizarConfigZen("quimia", { temas: ["formulas", "nada", "formulas"], nivelMin: 12, nivelMax: -3, preguntas: 7, opciones: { x: 1 } });
    expect(c.temas).toEqual(["formulas"]);
    expect([c.nivelMin, c.nivelMax]).toEqual([1, 10]);
    expect(c.preguntas).toBe(10);
  });

  it("sin nada guardado usa los temas por defecto y el nivel inicial", () => {
    const c = normalizarConfigZen("numeria", undefined, 6);
    expect(c.temas).toEqual(["aritmetica:suma", "aritmetica:resta", "aritmetica:multiplicacion", "aritmetica:division"]);
    expect([c.nivelMin, c.nivelMax]).toEqual([6, 6]);
    expect(c.opciones).toEqual({ negativos: false, inverso: false, grandes: false });
    expect(normalizarConfigZen("historia", "basura").temas).toEqual(temasPorDefecto("historia"));
  });

  it("entiende la configuración de antes (un solo tema, mezcla, sección de Numeria)", () => {
    expect(normalizarConfigZen("numeria", { tema: "fracciones", nivel: 4 }).temas).toEqual(["fracciones:simplificar", "fracciones:comparar", "fracciones:sumar"]);
    expect(normalizarConfigZen("historia", { tema: "mezcla" }).temas).toHaveLength(temasZen("historia").length);
    expect(normalizarConfigZen("historia", { tema: "fechas", nivel: 8 })).toMatchObject({ temas: ["fechas"], nivelMin: 8, nivelMax: 8 });
  });

  it("Enigmia no ofrece su «mezcla» como tema (la mezcla es elegir varias)", () => {
    expect(temasZen("enigmia").map((t) => t.id)).not.toContain("mezcla");
  });

  it("las opciones de elección validan el valor guardado", () => {
    expect(normalizarConfigZen("codia", { opciones: { filtro: "cobol" } }).opciones.filtro).toBe("");
    expect(normalizarConfigZen("codia", { opciones: { filtro: "java" } }).opciones.filtro).toBe("java");
    expect(normalizarConfigZen("geografia", { opciones: { preguntas: "lugares" } }).opciones.preguntas).toBe("lugares");
    expect(opcionesZen("historia")).toEqual([]);
  });

  it("las opciones de aritmética solo se muestran con su operación elegida", () => {
    const [negativos] = opcionesZen("numeria");
    expect(opcionVisible(negativos, ["aritmetica:suma"])).toBe(false);
    expect(opcionVisible(negativos, ["aritmetica:resta"])).toBe(true);
  });

  it("el nivel sube parejo del mínimo al máximo", () => {
    const c = { nivelMin: 2, nivelMax: 8, preguntas: 10 };
    const niveles = Array.from({ length: 10 }, (_, i) => nivelDePregunta(c, i));
    expect(niveles[0]).toBe(2);
    expect(niveles[9]).toBe(8);
    for (let i = 1; i < 10; i++) expect(niveles[i]).toBeGreaterThanOrEqual(niveles[i - 1]);
    expect(nivelDePregunta({ nivelMin: 5, nivelMax: 5, preguntas: 20 }, 13)).toBe(5);
  });

  it("modificador de aritmética según las opciones", () => {
    expect(modificadorAritmetica("resta", { negativos: true })).toBe("negativos");
    expect(modificadorAritmetica("suma", { negativos: true })).toBeUndefined();
    expect(modificadorAritmetica("multiplicacion", { inverso: true, grandes: true }, () => 0)).toBe("inverso");
    expect(modificadorAritmetica("multiplicacion", { inverso: true, grandes: true }, () => 0.99)).toBe("numeros_grandes");
    expect(modificadorAritmetica("division", { inverso: true, grandes: true, negativos: true })).toBeUndefined();
  });

  it("anuncia el rango de números de cada operación elegida", () => {
    const lineas = rangosAritmetica({ temas: ["aritmetica:suma", "aritmetica:multiplicacion"], nivelMin: 1, nivelMax: 6, opciones: {} });
    // Se leen de las mismas tablas que el generador (problems.ts).
    const m1 = rangoOperandos("multiplicacion", 1);
    const m6 = rangoOperandos("multiplicacion", 6);
    const d3 = rangoOperandos("division", 3);
    expect(lineas).toEqual([
      { op: "suma", desde: "1–9", hasta: "1–99" },
      { op: "multiplicacion", desde: `${m1.a[1]} × ${m1.b[1]}`, hasta: `${m6.a[1]} × ${m6.b[1]}` },
    ]);
    expect(rangosAritmetica({ temas: ["aritmetica:division"], nivelMin: 3, nivelMax: 3, opciones: {} })).toEqual([{ op: "division", desde: `${d3.a[1] * d3.b[1]} ÷ ${d3.a[1]}`, hasta: null }]);
  });
});

describe("Modo Zen: estadísticas del final", () => {
  const r = (correcto: boolean, ms: number, intentos: string[], pista = false): RegistroZen => ({ correcto, ms, intentos, pista, nivel: 3 });

  it("promedio, más rápida, más lenta, precisión, primer intento y racha", () => {
    const e = estadisticasZen([r(true, 3000, ["1"]), r(true, 5000, ["2", "3"], true), r(false, 9000, ["4", "5"]), r(true, 1000, ["6"]), r(true, 2000, ["7"])]);
    expect(e).toMatchObject({ total: 5, aciertos: 4, precision: 80, alPrimero: 3, alSegundo: 1, pistas: 1, totalMs: 20000, promedioMs: 4000, masRapida: 3, masLenta: 2, rachaMax: 2 });
    expect(estadisticasZen([])).toMatchObject({ total: 0, precision: 0, promedioMs: 0, masRapida: null, masLenta: null, rachaMax: 0 });
  });

  it("resultado de cada barra", () => {
    expect(resultadoDe(r(true, 1, ["a"]))).toBe("primero");
    expect(resultadoDe(r(true, 1, ["a", "b"]))).toBe("segundo");
    expect(resultadoDe(r(false, 1, []))).toBe("fallada");
  });

  it("formatea la duración", () => {
    expect(formatearDuracion(4230)).toBe("4,2 s");
    expect(formatearDuracion(4230, ".")).toBe("4.2 s");
    expect(formatearDuracion(12400)).toBe("12 s");
    expect(formatearDuracion(65000)).toBe("1 min 05 s");
  });
});

describe("Modo Zen: nivel del jugador", () => {
  it("problem_type de cada tema y nivel sugerido", async () => {
    const { problemTypeDeTema, nivelSugerido } = await import("./config");
    expect(problemTypeDeTema("numeria", "aritmetica:suma")).toBe("suma");
    expect(problemTypeDeTema("numeria", "algebra:un-paso")).toBe("algebra_un-paso");
    expect(problemTypeDeTema("historia", "fechas")).toBe("historia_fechas");
    expect(nivelSugerido(["a", "b", "c"], { a: 3, b: 6 })).toBe(5);
    expect(nivelSugerido(["c"], { a: 3 })).toBeNull();
  });
});
