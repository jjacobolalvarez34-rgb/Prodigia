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
          if (q.tipo === "opcion") expect(q.opciones, `${modo} n${nivel}`).toHaveLength(4);
        }
      }
    }
  });
});

describe("Anatomía práctica: enunciados precisos y en español neutro", () => {
  it("el músculo de nivel alto ya no se llama 'de la cara' (incluye occipital y platisma)", () => {
    const q = generarPreguntaAnatomia("muscular", 9, new Set(), () => 0.1);
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
