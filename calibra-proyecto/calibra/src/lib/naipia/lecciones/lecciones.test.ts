import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { LECCIONES_NAIPIA, TECNICAS, CLASES } from "./index";
import { generarSqlNaipia } from "./sql";
import { esVisualLeccion, type VisualLeccion } from "@/lib/aprender/visuales";
import { REGISTRO_VISUALES_NAIPIA } from "@/components/naipia/visuales/registro";
import { esReglaRedondeo, esSistemaConteo, parsearCartas } from "../visualesDatos";

// Verificación del contenido visual de Aprender de Naipia:
//  - estructura: 5 Técnicas + 8 Clases con los mismos slug/orden/requiere_pro
//    que 0192 y el MISMO quiz que 0192 (contrato de /api/aprender/completar);
//  - ninguna lección queda solo con texto; los visuales tienen tipos
//    conocidos, cartas parseables y `despuesDePaso` válido;
//  - las respuestas de las preguntas de conteo se RECALCULAN con tablas
//    independientes (no las de naipia.ts);
//  - cero lenguaje ajeno al encuadre (memoria y conteo, sin apuestas);
//  - la migración 0196 es exactamente lo que se genera de este contenido.
// Regenerar 0196: NAIPIA_ESCRIBIR_SQL=1 npx vitest run src/lib/naipia/lecciones

const raiz = path.resolve(__dirname, "../../../..");
const ruta0192 = path.join(raiz, "supabase", "migrations", "0192_naipia_contenido.sql");
const ruta0196 = path.join(raiz, "supabase", "migrations", "0196_naipia_lecciones_visuales.sql");

interface FilaSql {
  slug: string;
  orden: number;
  requierePro: boolean;
  contenido: { pasos: string[]; visuales?: unknown[]; quiz: { pregunta: string; opciones: string[]; respuesta: string; explicacion?: string }[] };
}

function filas0192(): FilaSql[] {
  const sql = fs.readFileSync(ruta0192, "utf8");
  const re = /\('([^']+)', '(?:[^']|'')*',\n\s+'(?:[^']|'')*',\n\s+'naipia',\n\s+\$naipia\$([\s\S]*?)\$naipia\$::jsonb,\n\s+(\d+), (true|false)\)/g;
  const filas: FilaSql[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    filas.push({ slug: m[1], contenido: JSON.parse(m[2]), orden: Number(m[3]), requierePro: m[4] === "true" });
  }
  return filas;
}

function filas0196(): { slug: string; contenido: FilaSql["contenido"] }[] {
  const sql = fs.readFileSync(ruta0196, "utf8");
  const re = /update public\.techniques set contenido =\n\$naipia\$([\s\S]*?)\$naipia\$::jsonb\nwhere slug = '([^']+)' and problem_type = 'naipia';/g;
  const filas: { slug: string; contenido: FilaSql["contenido"] }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) filas.push({ slug: m[2], contenido: JSON.parse(m[1]) });
  return filas;
}

// Tablas INDEPENDIENTES de naipia.ts (escritas otra vez, a mano, por rango).
const RANGOS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const INDEPENDIENTE: Record<string, Record<string, number>> = {
  hilo: { "2": 1, "3": 1, "4": 1, "5": 1, "6": 1, "7": 0, "8": 0, "9": 0, "10": -1, J: -1, Q: -1, K: -1, A: -1 },
  ko: { "2": 1, "3": 1, "4": 1, "5": 1, "6": 1, "7": 1, "8": 0, "9": 0, "10": -1, J: -1, Q: -1, K: -1, A: -1 },
  hiopt2: { "2": 1, "3": 1, "4": 2, "5": 2, "6": 1, "7": 1, "8": 0, "9": 0, "10": -2, J: -2, Q: -2, K: -2, A: 0 },
  omega2: { "2": 1, "3": 1, "4": 2, "5": 2, "6": 2, "7": 1, "8": 0, "9": -1, "10": -2, J: -2, Q: -2, K: -2, A: 0 },
};
const NOMBRE_A_CLAVE: Record<string, string> = { "Hi-Lo": "hilo", KO: "ko", "Hi-Opt II": "hiopt2", "Omega II": "omega2" };

function contarIndependiente(sistema: string, secuencia: string): number {
  return secuencia.split(" ").reduce((acc, c) => {
    const rango = c.slice(0, -1);
    expect(RANGOS, `carta inválida ${c}`).toContain(rango);
    return acc + INDEPENDIENTE[sistema][rango];
  }, 0);
}

const TERMINOS_PROHIBIDOS: RegExp[] = [
  /casino/i, /blackjack/i, /black\s*jack/i, /apuest/i, /apostar/i, /apostad/i, /\bbanca\b/i, /banquero/i,
  /croupier|crupier/i, /\bdealer\b/i, /dinero/i, /plata\b/i, /ganancia/i, /jackpot/i, /ruleta/i,
  /tragamonedas|tragaperras/i, /p[oó]ker/i, /gambl/i, /wager/i, /\bbet(s|ting)?\b/i, /\bmoney\b/i,
  /\bcash\b/i, /bankroll/i, /house edge/i, /ventaja de la casa/i, /jugar contra/i,
  /play against the (house|dealer)/i, /\bwin(ning)? (money|cash)\b/i, /ganar (dinero|plata)/i, /\bfichas?\b/i,
  /\bchips\b/i, /\bslot/i, /loter[ií]a/i, /\bcasa de juego/i,
];
const prohibidos = (t: string) => TERMINOS_PROHIBIDOS.filter((re) => re.test(t)).map((re) => re.source);

function cadenas(valor: unknown, salida: string[] = []): string[] {
  if (typeof valor === "string") salida.push(valor);
  else if (Array.isArray(valor)) valor.forEach((v) => cadenas(v, salida));
  else if (valor && typeof valor === "object") Object.values(valor).forEach((v) => cadenas(v, salida));
  return salida;
}

const TIPOS_CONOCIDOS = new Set(["cuadros", ...Object.keys(REGISTRO_VISUALES_NAIPIA)]);

describe("Naipia: lecciones visuales (estructura)", () => {
  it("son 13: 5 técnicas gratis + 8 clases Pro, con orden continuo 1-13", () => {
    expect(TECNICAS).toHaveLength(5);
    expect(CLASES).toHaveLength(8);
    expect(LECCIONES_NAIPIA.map((l) => l.orden)).toEqual(Array.from({ length: 13 }, (_, i) => i + 1));
    expect(TECNICAS.every((l) => !l.requierePro)).toBe(true);
    expect(CLASES.every((l) => l.requierePro)).toBe(true);
  });

  it("mismos slug, orden y requiere_pro que 0192, y quiz IDÉNTICO", () => {
    const originales = filas0192();
    expect(originales).toHaveLength(13);
    for (const o of originales) {
      const l = LECCIONES_NAIPIA.find((x) => x.slug === o.slug);
      expect(l, `falta ${o.slug}`).toBeDefined();
      expect(l!.orden).toBe(o.orden);
      expect(l!.requierePro).toBe(o.requierePro);
      expect(l!.quiz).toEqual(o.contenido.quiz);
    }
  });

  it("cada quiz: respuesta entre las opciones, sin opciones repetidas", () => {
    for (const l of LECCIONES_NAIPIA) {
      expect(l.quiz.length).toBeGreaterThanOrEqual(2);
      for (const q of l.quiz) {
        expect(q.opciones, `${l.slug}: ${q.pregunta}`).toContain(q.respuesta);
        expect(new Set(q.opciones).size).toBe(q.opciones.length);
      }
    }
  });

  it("los pasos son una introducción corta (1-4 pasos, cada uno breve, sin $ sueltos)", () => {
    for (const l of LECCIONES_NAIPIA) {
      expect(l.pasos.length, l.slug).toBeGreaterThanOrEqual(2);
      expect(l.pasos.length, l.slug).toBeLessThanOrEqual(4);
      for (const p of l.pasos) {
        expect(p.length, `${l.slug}: paso demasiado largo`).toBeLessThanOrEqual(430);
        expect((p.match(/\$/g) ?? []).length % 2, `${l.slug}: $ desparejado en «${p}»`).toBe(0);
        expect(p).not.toMatch(/undefined|NaN/);
      }
    }
  });

  it("ninguna lección queda con solo texto y cada visual es válido", () => {
    for (const l of LECCIONES_NAIPIA) {
      expect(l.visuales.length, `${l.slug} sin visuales`).toBeGreaterThanOrEqual(1);
      for (const v of l.visuales) {
        expect(esVisualLeccion(v), l.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has(v.tipo), `${l.slug}: tipo ${v.tipo}`).toBe(true);
        expect(v.despuesDePaso, `${l.slug}: despuesDePaso obligatorio en el contenido real`).toBeDefined();
        expect(v.despuesDePaso!).toBeLessThan(l.pasos.length);
        validarVisual(l.slug, v);
      }
    }
  });
});

function validarVisual(slug: string, v: VisualLeccion) {
  const v0 = v as unknown as Record<string, unknown>;
  switch (v.tipo) {
    case "naipia.valores":
    case "naipia.mazo":
      expect(esSistemaConteo(v0.sistema), slug).toBe(true);
      break;
    case "naipia.conteo":
    case "naipia.cancelacion":
      expect(esSistemaConteo(v0.sistema), slug).toBe(true);
      expect(parsearCartas(v0.cartas), `${slug}: cartas`).not.toBeNull();
      break;
    case "naipia.comparar":
      expect(Array.isArray(v0.sistemas) && (v0.sistemas as unknown[]).every(esSistemaConteo), slug).toBe(true);
      expect(parsearCartas(v0.cartas), `${slug}: cartas`).not.toBeNull();
      break;
    case "naipia.verdadero":
      expect(esReglaRedondeo(v0.regla), slug).toBe(true);
      expect(Number.isInteger(v0.conteo), slug).toBe(true);
      break;
    case "cuadros":
      expect(Array.isArray(v0.cuadros) && (v0.cuadros as unknown[]).length >= 2, slug).toBe(true);
      break;
  }
}

describe("Naipia: los números de las lecciones salen de un cálculo independiente", () => {
  it("las preguntas «conteo de …» del quiz coinciden con el cálculo independiente", () => {
    let verificadas = 0;
    for (const l of LECCIONES_NAIPIA) {
      for (const q of l.quiz) {
        const m = /Con (Hi-Lo|KO|Hi-Opt II|Omega II), ¿(?:cuál es el )?conteo de ([^?]+)\?/.exec(q.pregunta);
        if (!m) continue;
        const esperado = contarIndependiente(NOMBRE_A_CLAVE[m[1]], m[2]);
        expect(Number(q.respuesta.replace(",", ".")), `${l.slug}: ${q.pregunta}`).toBe(esperado);
        verificadas++;
      }
    }
    expect(verificadas).toBeGreaterThanOrEqual(10);
  });

  it("el conteo de cada visual coincide con el cálculo independiente (suma por rango)", () => {
    let secuencias = 0;
    for (const l of LECCIONES_NAIPIA) {
      for (const v of l.visuales) {
        const v0 = v as unknown as { sistema?: string; sistemas?: string[]; cartas?: string[] };
        if (!v0.cartas) continue;
        const sistemas = v0.sistemas ?? [v0.sistema as string];
        for (const s of sistemas) {
          const esperado = contarIndependiente(s, v0.cartas.join(" "));
          expect(esperado, `${l.slug} ${s}`).toBe(
            parsearCartas(v0.cartas)!.reduce((a, c) => a + INDEPENDIENTE[s][c.valor], 0)
          );
          secuencias++;
        }
      }
    }
    expect(secuencias).toBeGreaterThan(15);
  });

  it("los hechos que afirman los textos coinciden con las tablas independientes", () => {
    const ind = INDEPENDIENTE;
    const suma = (s: string) => RANGOS.reduce((a, r) => a + 4 * ind[s][r], 0);
    expect(suma("hilo")).toBe(0);
    expect(suma("ko")).toBe(4);
    expect(suma("hiopt2")).toBe(0);
    expect(suma("omega2")).toBe(0);
    const todo = LECCIONES_NAIPIA.flatMap((l) => l.pasos).join("\n");
    // "un mazo completo suma +4" en KO, y "$+4$" aparece en la clase de KO.
    expect(LECCIONES_NAIPIA.find((l) => l.slug === "naipia-clase-ko")!.pasos.join(" ")).toContain("suma $+4$");
    // El 7 de KO vale +1 y el 9 de Omega II vale -1 (lo dicen los textos).
    expect(todo).toContain("el 7 también vale $+1$");
    expect(todo).toContain("El 9 vale $-1$");
    // Ejemplo de conteo verdadero: quedan 112 cartas, 2 mazos, +10 / 2 = 5.
    const verdadero = LECCIONES_NAIPIA.find((l) => l.slug === "naipia-clase-conteo-verdadero")!.pasos.join(" ");
    expect(verdadero).toContain("Quedan 112 cartas");
    expect(verdadero).toContain("10 ÷ 2 = 5");
    expect(verdadero).toContain("-7 ÷ 3 = -2,33");
    expect(verdadero).toContain("hacia abajo: -3");
    expect(verdadero).toContain("11 ÷ 2,5 = 4,4");
  });
});

describe("Naipia: sin lenguaje ajeno al encuadre (memoria y conteo)", () => {
  it("los textos de las lecciones (pasos y visuales) no tienen términos prohibidos", () => {
    const textos = LECCIONES_NAIPIA.flatMap((l) => [...cadenas(l.pasos), ...cadenas(l.visuales)]);
    expect(textos.length).toBeGreaterThan(50);
    expect(textos.filter((t) => prohibidos(t).length > 0)).toEqual([]);
  });

  it("el detector funciona (sanidad)", () => {
    expect(prohibidos("Jugar en un casino")).not.toEqual([]);
    expect(prohibidos("hacer una apuesta")).not.toEqual([]);
    expect(prohibidos("conteo corriente y mazos restantes")).toEqual([]);
  });

  it("el namespace Aprender.visual y Naipia.visuales (es/en) no tienen términos prohibidos", () => {
    for (const idioma of ["es", "en"]) {
      const json = JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8"));
      const malas = [...cadenas(json.Aprender.visual), ...cadenas(json.Naipia.visuales)].filter((c) => prohibidos(c).length > 0);
      expect(malas).toEqual([]);
    }
  });

  it("paridad exacta de claves es/en en Aprender.visual y Naipia.visuales", () => {
    const claves = (o: unknown, pre = ""): string[] =>
      o && typeof o === "object"
        ? Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? claves(v, `${pre}${k}.`) : [`${pre}${k}`]))
        : [];
    const es = JSON.parse(fs.readFileSync(path.join(raiz, "messages", "es.json"), "utf8"));
    const en = JSON.parse(fs.readFileSync(path.join(raiz, "messages", "en.json"), "utf8"));
    expect(claves(es.Aprender.visual).sort()).toEqual(claves(en.Aprender.visual).sort());
    expect(claves(es.Naipia.visuales).sort()).toEqual(claves(en.Naipia.visuales).sort());
    expect(claves(es.Naipia.visuales).length).toBeGreaterThan(30);
  });
});

describe("Naipia: migración 0196", () => {
  it("es exactamente lo que se genera de src/lib/naipia/lecciones/", () => {
    const esperado = generarSqlNaipia(LECCIONES_NAIPIA);
    if (process.env.NAIPIA_ESCRIBIR_SQL === "1") fs.writeFileSync(ruta0196, esperado, "utf8");
    expect(fs.existsSync(ruta0196), "falta 0196: NAIPIA_ESCRIBIR_SQL=1 npx vitest run src/lib/naipia/lecciones").toBe(true);
    expect(fs.readFileSync(ruta0196, "utf8")).toBe(esperado);
  });

  it("los 13 jsonb parsean; los visuales tienen tipos conocidos; el quiz sigue idéntico al de 0192", () => {
    const filas = filas0196();
    expect(filas).toHaveLength(13);
    const originales = filas0192();
    for (const f of filas) {
      const original = originales.find((o) => o.slug === f.slug);
      expect(original, `slug ${f.slug} no existe en 0192`).toBeDefined();
      expect(f.contenido.quiz).toEqual(original!.contenido.quiz);
      expect(Array.isArray(f.contenido.pasos) && f.contenido.pasos.length > 0).toBe(true);
      expect(Array.isArray(f.contenido.visuales) && f.contenido.visuales.length > 0, f.slug).toBe(true);
      for (const v of f.contenido.visuales!) {
        expect(esVisualLeccion(v), f.slug).toBe(true);
        expect(TIPOS_CONOCIDOS.has((v as VisualLeccion).tipo), `${f.slug}: ${(v as VisualLeccion).tipo}`).toBe(true);
        expect(((v as VisualLeccion).despuesDePaso ?? 0)).toBeLessThan(f.contenido.pasos.length);
      }
      for (const q of f.contenido.quiz) expect(q.opciones).toContain(q.respuesta);
    }
    // Sin términos ajenos al encuadre (mismo escaneo que 0192).
    expect(prohibidos(fs.readFileSync(ruta0196, "utf8"))).toEqual([]);
    // Solo actualiza filas que ya existen: nada de insert.
    expect(fs.readFileSync(ruta0196, "utf8")).not.toMatch(/insert into/i);
  });
});
