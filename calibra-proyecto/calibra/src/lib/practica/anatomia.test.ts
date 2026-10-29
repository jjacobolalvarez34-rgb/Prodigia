import { describe, it, expect } from "vitest";
import {
  generarPreguntaAnatomia,
  terminosNoDistractores,
  OSEO_BAJO,
  OSEO_ALTO,
  MUSCULAR_BAJO,
  MUSCULAR_ALTO,
  ORGANOS,
  NERVIOSO_BAJO,
  NERVIOSO_ALTO,
  type ModoAnatomia,
} from "./anatomia";
import { detectarVoseo } from "@/lib/texto/espanolNeutro";
import { CAVIDADES, PARES_CRANEALES } from "@/lib/anatomia/datos";
import { MUSCULOS } from "./anatomiaFormatos";
import { CLASES_ANATOMIA, TECNICAS_ANATOMIA } from "@/lib/anatomia/lecciones";
import {
  CANTIDADES_OSEO_ALTO,
  CANTIDADES_OSEO_MEDIO,
  FORMA_HUESO,
  HUESO_POR_DENTRO,
  MUSCULAR_EXPERTO,
  MUSCULAR_MEDIO,
  NERVIOSO_EXPERTO,
  NERVIOSO_MEDIO,
  ORGANOS_MEDIO,
  OSEO_EXPERTO,
  type DatoAnatomia,
} from "./anatomiaFormatosExtra";

// Auditoría de contenido de Anatomía (2026-09-23). Tres errores reales de
// datos encontrados y corregidos en el generador:
//  1. Preguntas con DOS respuestas correctas: los términos compartidos
//     entre sistemas (Frontal, Temporal y Occipital son huesos Y músculos;
//     Cerebro es órgano Y parte del sistema nervioso) salían de distractor
//     de una pregunta cuya respuesta correcta era otra cosa del mismo
//     sistema (p. ej. "¿parte del sistema nervioso?" con Cerebelo correcto
//     y Cerebro entre las opciones).
//  2. "un músculo de la cara" para un pool que incluye el occipital (nuca)
//     y el platisma (cuello).
//  3. "un hueso" para Cráneo/Columna vertebral/Costillas/Pelvis, que son
//     conjuntos de huesos; y "Clickeá" (voseo) en el enunciado de click.

// PRNG determinista (mulberry32) para barrer muchas preguntas.
function semilla(n: number) {
  let a = n >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MODOS: ModoAnatomia[] = ["oseo", "muscular", "organos", "nervioso"];

// Reimplementación INDEPENDIENTE de "qué términos son una respuesta válida
// en este modo" (no llama a terminosNoDistractores).
const VALIDOS: Record<ModoAnatomia, Set<string>> = {
  oseo: new Set([...OSEO_BAJO, ...OSEO_ALTO]),
  muscular: new Set([...MUSCULAR_BAJO, ...MUSCULAR_ALTO]),
  organos: new Set([...ORGANOS, "Cerebro", "Cerebelo", "Médula espinal", "Nervio periférico"]),
  nervioso: new Set([...NERVIOSO_BAJO, ...NERVIOSO_ALTO]),
};

describe("Anatomía práctica: una sola respuesta correcta por pregunta", () => {
  it("ningún distractor es también una respuesta válida del mismo modo (todos los niveles, muchas semillas)", () => {
    for (const modo of MODOS) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        for (let i = 0; i < 150; i++) {
          const q = generarPreguntaAnatomia(modo, nivel, new Set(), semilla(nivel * 1000 + i));
          if (q.tipo !== "opcion") continue;
          const incorrectas = q.opciones.filter((o) => o !== q.respuesta);
          expect(q.opciones, `${modo} n${nivel}`).toContain(q.respuesta);
          expect(new Set(q.opciones).size).toBe(q.opciones.length);
          // Este chequeo es de la clasificación ("¿cuál es un músculo?"); los otros
          // formatos usan términos del mismo sistema a propósito (ver más abajo).
          if (q.formato !== "clasificacion") continue;
          for (const o of incorrectas) {
            expect(VALIDOS[modo].has(o), `${modo} nivel ${nivel}: «${o}» también es correcta (respuesta: ${q.respuesta})`).toBe(false);
          }
        }
      }
    }
  });

  it("terminosNoDistractores cubre los términos compartidos entre sistemas", () => {
    for (const compartido of ["Frontal", "Temporal", "Occipital"]) {
      expect(terminosNoDistractores("oseo").has(compartido)).toBe(true);
      expect(terminosNoDistractores("muscular").has(compartido)).toBe(true);
    }
    expect(terminosNoDistractores("organos").has("Cerebro")).toBe(true);
    expect(terminosNoDistractores("organos").has("Médula espinal")).toBe(true);
    expect(terminosNoDistractores("nervioso").has("Cerebro")).toBe(true);
  });

  it("siempre quedan al menos 3 distractores (4 opciones) en todos los modos y niveles", () => {
    for (const modo of MODOS) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        for (let i = 0; i < 40; i++) {
          const q = generarPreguntaAnatomia(modo, nivel, new Set(), semilla(i + 7));
          // "¿Sensitivo, motor o mixto?" tiene 3 opciones porque solo hay 3 tipos.
          if (q.tipo === "opcion") expect(q.opciones, `${modo} n${nivel}`).toHaveLength(q.formato === "tipo_de_par" ? 3 : q.formato === "leccion" || q.formato === "dato" ? q.opciones.length : 4);
        }
      }
    }
  });
});

describe("Anatomía práctica: enunciados precisos y en español neutro", () => {
  it("el músculo de nivel alto ya no se llama 'de la cara' (incluye occipital y platisma)", () => {
    const q = generarPreguntaAnatomia("muscular", 7, new Set(), () => 0.1);
    expect(q.enunciado).toContain("cabeza o del cuello");
    expect(q.enunciado).not.toContain("de la cara");
  });

  it("los huesos de nivel bajo se llaman 'hueso o parte del esqueleto' (cráneo, columna y pelvis son conjuntos)", () => {
    const q = generarPreguntaAnatomia("oseo", 1, new Set(), () => 0.1);
    expect(q.tipo).toBe("opcion");
    expect(q.enunciado).toContain("parte del esqueleto");
  });

  it("ningún enunciado (opción ni click) tiene voseo", () => {
    for (const modo of MODOS) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        for (let i = 0; i < 60; i++) {
          const q = generarPreguntaAnatomia(modo, nivel, new Set(), semilla(nivel * 77 + i));
          expect(detectarVoseo(q.enunciado), q.enunciado).toEqual([]);
        }
      }
    }
    const click = generarPreguntaAnatomia("oseo", 5, new Set(["Tibia"]), () => 0);
    if (click.tipo === "click") expect(click.enunciado).toMatch(/^Haz clic/);
  });
});

// Variedad (pedido 2026-10-09: "en las habilidades distintas a óseo las preguntas son
// muy pocas o muy iguales"): los modos muscular, órganos y nervioso mezclan formatos
// sacados de datos verificados de las lecciones (anatomiaFormatos.ts).
describe("Anatomía práctica: variedad de formatos", () => {
  const MODOS_VARIADOS: ModoAnatomia[] = ["muscular", "organos", "nervioso"];

  it("cada modo y nivel mezcla varios formatos y la clasificación no domina", () => {
    for (const modo of MODOS_VARIADOS) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        const cuenta = new Map<string, number>();
        const rng = semilla(nivel * 31 + modo.length);
        for (let i = 0; i < 300; i++) {
          const q = generarPreguntaAnatomia(modo, nivel, new Set(), rng);
          const f = q.tipo === "opcion" ? (q.formato ?? "clasificacion") : "click";
          cuenta.set(f, (cuenta.get(f) ?? 0) + 1);
        }
        expect(cuenta.size, `${modo} n${nivel}: ${[...cuenta.keys()]}`).toBeGreaterThanOrEqual(2);
        expect(cuenta.get("clasificacion") ?? 0, `${modo} n${nivel}`).toBeLessThan(300 * 0.55);
      }
    }
  });

  it("un sprint de 10 preguntas casi no repite enunciados", () => {
    for (const modo of MODOS_VARIADOS) {
      for (const nivel of [1, 5, 9]) {
        const usados = new Set<string>();
        const enunciados = new Set<string>();
        const rng = semilla(nivel + 500);
        for (let i = 0; i < 10; i++) {
          const q = generarPreguntaAnatomia(modo, nivel, usados, rng);
          usados.add(q.clave);
          enunciados.add(`${q.enunciado}|${q.respuesta}`);
        }
        expect(enunciados.size, `${modo} n${nivel}`).toBeGreaterThanOrEqual(8);
      }
    }
  });

  it("en los formatos nuevos ningún distractor cumple también el enunciado", () => {
    const accion = new Map(MUSCULOS.map((m) => [m.nombre, m.accion]));
    const accionDeOpcion = new Map(MUSCULOS.map((m) => [m.accion.charAt(0).toUpperCase() + m.accion.slice(1), m.nombre]));
    for (const modo of MODOS_VARIADOS) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        for (let i = 0; i < 200; i++) {
          const q = generarPreguntaAnatomia(modo, nivel, new Set(), semilla(nivel * 977 + i));
          if (q.tipo !== "opcion") continue;
          const otras = q.opciones.filter((o) => o !== q.respuesta);
          if (q.formato === "funcion_a_musculo") for (const o of otras) expect(accion.get(o), q.enunciado).not.toBe(accion.get(q.respuesta));
          if (q.formato === "musculo_a_funcion") for (const o of otras) expect(accionDeOpcion.has(o), o).toBe(true);
          if (q.formato === "par_por_numero" || q.formato === "par_por_funcion") {
            const par = PARES_CRANEALES.find((p) => p.nombre === q.respuesta)!;
            expect(par, q.enunciado).toBeDefined();
            if (q.formato === "par_por_numero") expect(q.enunciado).toContain(` ${par.romano}?`);
          }
          if (q.formato === "cavidad_de_organo") {
            const organo = CAVIDADES.flatMap((c) => c.organos).find((o) => q.enunciado.includes(o.toLowerCase()))!;
            expect(CAVIDADES.find((c) => c.organos.includes(organo))!.nombre).toBe(q.respuesta);
          }
          if (q.formato === "organo_en_cavidad") {
            const cav = CAVIDADES.find((c) => q.enunciado.includes(c.nombre.toLowerCase()))!;
            expect(cav.organos).toContain(q.respuesta);
            for (const o of otras) expect(cav.organos).not.toContain(o);
          }
          expect(detectarVoseo(q.enunciado), q.enunciado).toEqual([]);
        }
      }
    }
  });
});

// Auditoría de variedad 2026-10-29: los bancos nuevos (anatomiaFormatosExtra.ts) solo
// usan datos de las lecciones. Cada respuesta tiene que aparecer en el texto de las
// lecciones de su sistema, y el quiz de las lecciones se usa tal cual.
describe("Anatomía práctica: los formatos nuevos salen de las lecciones", () => {
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const textoDe = (grupo: ModoAnatomia) =>
    norm(
      [...TECNICAS_ANATOMIA, ...CLASES_ANATOMIA]
        .filter((l) => l.grupo === grupo)
        .map((l) => [l.nombre, l.descripcion, ...l.pasos, ...l.quiz.flatMap((q) => [q.pregunta, q.respuesta, q.explicacion]), JSON.stringify(l.visuales)].join(" "))
        .join(" ")
    );
  const enLecciones = (texto: string, r: string) => {
    const n = norm(r);
    if (texto.includes(n)) return true;
    // Respuestas compuestas («Neuronas motoras», «Frontal y parietales»): cada palabra con contenido.
    return n.split(/[^a-zñ0-9]+/).filter((p) => p.length >= 4 || /^\d+$/.test(p)).every((p) => texto.includes(p.replace(/s$/, "")));
  };
  const BANCOS: [ModoAnatomia, DatoAnatomia[]][] = [
    ["oseo", CANTIDADES_OSEO_MEDIO],
    ["oseo", CANTIDADES_OSEO_ALTO],
    ["oseo", HUESO_POR_DENTRO],
    ["oseo", OSEO_EXPERTO],
    ["muscular", MUSCULAR_MEDIO],
    ["muscular", MUSCULAR_EXPERTO],
    ["organos", ORGANOS_MEDIO],
    ["nervioso", NERVIOSO_MEDIO],
    ["nervioso", NERVIOSO_EXPERTO],
  ];

  it("cada respuesta de los bancos está enseñada en una lección del sistema y no es también una alternativa", () => {
    for (const [grupo, banco] of BANCOS) {
      const texto = textoDe(grupo);
      for (const d of banco) {
        expect(enLecciones(texto, d.r), `${grupo}: «${d.r}» (${d.e})`).toBe(true);
        expect(d.alt.filter((a) => a !== d.r).length, d.e).toBeGreaterThanOrEqual(2);
        expect(new Set(banco.map((x) => x.e)).size).toBe(banco.length);
      }
    }
    const oseo = textoDe("oseo");
    for (const h of FORMA_HUESO) expect(enLecciones(oseo, h.nombre), h.nombre).toBe(true);
  });

  it("las preguntas de los formatos nuevos tienen la respuesta entre las opciones, sin repetidas, y pasos propios", () => {
    for (const modo of MODOS) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        for (let i = 0; i < 200; i++) {
          const q = generarPreguntaAnatomia(modo, nivel, new Set(), semilla(nivel * 4243 + i));
          if (q.tipo !== "opcion") continue;
          expect(q.opciones, q.enunciado).toContain(q.respuesta);
          expect(new Set(q.opciones).size, q.enunciado).toBe(q.opciones.length);
          expect(q.opciones.length, q.enunciado).toBeGreaterThanOrEqual(3);
          expect(q.pasos?.length ?? 0, q.enunciado).toBeGreaterThan(0);
          if (q.formato === "forma_hueso") {
            const h = FORMA_HUESO.find((x) => q.enunciado.includes(` ${x.nombre.toLowerCase()}?`))!;
            expect(h.forma, q.enunciado).toBe(q.respuesta);
          }
          if (q.formato === "hueso_de_forma") {
            const forma = /es (\w+)\?$/.exec(q.enunciado)![1];
            for (const o of q.opciones) expect(FORMA_HUESO.find((h) => h.nombre === o)!.forma.toLowerCase() === forma, `${q.enunciado} ${o}`).toBe(o === q.respuesta);
          }
        }
      }
    }
  });

  it("los niveles 9-10 ya no son iguales a los 7-8 (misma semilla)", () => {
    for (const modo of MODOS) {
      let iguales = 0;
      for (let i = 0; i < 100; i++) {
        const a = generarPreguntaAnatomia(modo, 7, new Set(), semilla(i + 9000));
        const b = generarPreguntaAnatomia(modo, 9, new Set(), semilla(i + 9000));
        if (a.enunciado === b.enunciado && a.respuesta === b.respuesta) iguales++;
      }
      expect(iguales, modo).toBeLessThan(50);
    }
  });
});
