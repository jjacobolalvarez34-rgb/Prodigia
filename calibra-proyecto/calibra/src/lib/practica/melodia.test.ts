import { describe, it, expect } from "vitest";
import { detectarVoseo } from "@/lib/texto/espanolNeutro";
import {
  generarPreguntaMelodia, MODOS_MELODIA, construirEscala, construirAcorde,
  semitonoAbsoluto, frecuenciaDeNota, LETRAS, type TipoEscala, type TipoAcorde, type NotaMusical,
} from "./melodia";

function fundamentalAlAzar(): NotaMusical {
  const letra = LETRAS[Math.floor(Math.random() * LETRAS.length)];
  const octava = 3 + Math.floor(Math.random() * 2);
  return { letra, octava, alteracion: null };
}

describe("frecuenciaDeNota — Fase 7, oído absoluto", () => {
  it("La4 = 440Hz exacto (referencia estándar)", () => {
    expect(frecuenciaDeNota({ letra: "La", octava: 4, alteracion: null })).toBeCloseTo(440, 5);
  });

  it("subir una octava duplica la frecuencia", () => {
    const do4 = frecuenciaDeNota({ letra: "Do", octava: 4, alteracion: null });
    const do5 = frecuenciaDeNota({ letra: "Do", octava: 5, alteracion: null });
    expect(do5 / do4).toBeCloseTo(2, 5);
  });

  it("un sostenido sube exactamente un semitono (razón 2^(1/12))", () => {
    const fa = frecuenciaDeNota({ letra: "Fa", octava: 4, alteracion: null });
    const faSost = frecuenciaDeNota({ letra: "Fa", octava: 4, alteracion: "sostenido" });
    expect(faSost / fa).toBeCloseTo(Math.pow(2, 1 / 12), 5);
  });
});

describe("generarPreguntaMelodia — contrato para todos los modos", () => {
  for (const modo of MODOS_MELODIA) {
    it(`modo ${modo}: en las 10 dificultades, 4 opciones únicas y la respuesta incluida`, () => {
      for (let nivel = 1; nivel <= 10; nivel++) {
        for (let i = 0; i < 30; i++) {
          const p = generarPreguntaMelodia(modo, nivel);
          expect(p.opciones.length, `${modo} nivel ${nivel}: ${JSON.stringify(p.opciones)}`).toBe(4);
          expect(new Set(p.opciones).size, `${modo} nivel ${nivel}: opciones duplicadas ${JSON.stringify(p.opciones)}`).toBe(4);
          expect(p.opciones, `${modo} nivel ${nivel}: falta la respuesta "${p.respuesta}"`).toContain(p.respuesta);
        }
      }
    });
  }
});

describe("construirEscala — la fórmula de intervalos suma una octava completa", () => {
  it("las 4 escalas, sobre 20 fundamentales al azar cada una, cierran en +12 semitonos", () => {
    const tipos: TipoEscala[] = ["mayor", "menor_natural", "pentatonica_mayor", "pentatonica_menor"];
    for (const tipo of tipos) {
      for (let i = 0; i < 20; i++) {
        const fundamental = fundamentalAlAzar();
        const notas = construirEscala(fundamental, tipo, i % 2 === 0);
        const inicio = semitonoAbsoluto(notas[0]);
        const fin = semitonoAbsoluto(notas[notas.length - 1]);
        expect(fin - inicio, `${tipo} desde ${fundamental.letra}${fundamental.octava}`).toBe(12);
      }
    }
  });
});

describe("construirAcorde — cada nota cae exactamente en el semitono de su fórmula", () => {
  it("los 14 tipos de acorde, sobre 10 fundamentales al azar cada uno, respetan la fórmula al semitono", () => {
    const formulas: Record<TipoAcorde, number[]> = {
      mayor: [0, 4, 7], menor: [0, 3, 7], disminuido: [0, 3, 6], aumentado: [0, 4, 8],
      maj7: [0, 4, 7, 11], dominante7: [0, 4, 7, 10], menor7: [0, 3, 7, 10], disminuido7: [0, 3, 6, 9],
      sus2: [0, 2, 7], sus4: [0, 5, 7], add9: [0, 4, 7, 14],
      novena: [0, 4, 7, 10, 14], oncena: [0, 4, 7, 10, 14, 17], trecena: [0, 4, 7, 10, 14, 17, 21],
    };
    for (const tipo of Object.keys(formulas) as TipoAcorde[]) {
      for (let i = 0; i < 10; i++) {
        const fundamental = fundamentalAlAzar();
        const notas = construirAcorde(fundamental, tipo, i % 2 === 0);
        const base = semitonoAbsoluto(fundamental);
        const offsets = notas.map((n) => semitonoAbsoluto(n) - base);
        expect(offsets, tipo).toEqual(formulas[tipo]);
      }
    }
  });
});

describe("enunciados en español neutro (auditoría de Aprender de Melodía)", () => {
  it("ningún enunciado de los 6 modos usa voseo ni «acá» (se dice «aquí»)", () => {
    const vistos = new Set<string>();
    for (const modo of MODOS_MELODIA) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        for (let i = 0; i < 20; i++) vistos.add(generarPreguntaMelodia(modo, nivel).enunciado.replace(/"[^"]*"|(?:Do|Re|Mi|Fa|Sol|La|Si)[♯♭]?\d/g, ""));
      }
    }
    for (const e of vistos) {
      expect(e, e).not.toMatch(/acá/i);
      expect(detectarVoseo(e), e).toEqual([]);
    }
    expect(vistos.size).toBeGreaterThanOrEqual(6);
  });
});

// Auditoría de variedad 2026-10-29: las formas nuevas de pregunta se recalculan
// desde lo que ve el jugador (el enunciado y las notas dibujadas o la que suena).
describe("formas nuevas: la respuesta se recalcula desde el enunciado", () => {
  function parsear(nombre: string): NotaMusical {
    const m = /^(Do|Re|Mi|Fa|Sol|La|Si)([♯♭]?)(-?[0-9]+)$/.exec(nombre);
    if (!m) throw new Error(`nota ilegible: ${nombre}`);
    return { letra: m[1] as NotaMusical["letra"], octava: Number(m[3]), alteracion: m[2] === "♯" ? "sostenido" : m[2] === "♭" ? "bemol" : null };
  }
  const nombre = (n: NotaMusical) => `${n.letra}${n.alteracion === "sostenido" ? "♯" : n.alteracion === "bemol" ? "♭" : ""}${n.octava}`;
  const altura = (n: NotaMusical) => n.octava * 7 + LETRAS.indexOf(n.letra);
  const DUR: Record<string, number> = { redonda: 4, blanca: 2, negra: 1, corchea: 0.5, semicorchea: 0.25, fusa: 0.125, semifusa: 0.0625, "blanca con puntillo": 3, "negra con puntillo": 1.5 };
  const PLURAL: Record<string, string> = { redondas: "redonda", blancas: "blanca", negras: "negra", corcheas: "corchea", semicorcheas: "semicorchea", fusas: "fusa", semifusas: "semifusa" };
  const NUM: Record<string, number> = { una: 1, dos: 2, tres: 3, cuatro: 4 };
  // «una blanca, dos negras y una negra con puntillo» → suma en negras.
  function sumaTexto(t: string): number {
    return t.split(/, | y /).reduce((acc, parte) => {
      const m = /^(una|dos|tres|cuatro) (.+)$/.exec(parte.trim())!;
      const [primera, ...resto] = m[2].split(" ");
      const fig = [PLURAL[primera] ?? primera, ...resto].join(" ");
      expect(DUR[fig], fig).toBeDefined();
      return acc + NUM[m[1]] * DUR[fig];
    }, 0);
  }
  const muestras = (modo: (typeof MODOS_MELODIA)[number]) => Array.from({ length: 10 }, (_, k) => Array.from({ length: 150 }, () => generarPreguntaMelodia(modo, k + 1))).flat();

  it("alteraciones: nombrar, semitono/tono, enarmónico y distancia", () => {
    const formas = new Set<string>();
    for (const p of muestras("alteraciones")) {
      if (p.tipo !== "pentagrama") throw new Error("alteraciones sin pentagrama");
      const r = p.respuesta;
      const base = p.notas[0];
      if (/semitonos hay/.test(p.enunciado)) {
        formas.add("distancia");
        expect(Number(r)).toBe(semitonoAbsoluto(p.notas[1]) - semitonoAbsoluto(base));
      } else if (/enarmónico/.test(p.enunciado)) {
        formas.add("enarmonico");
        expect(semitonoAbsoluto(parsear(r)), p.enunciado + nombre(base)).toBe(semitonoAbsoluto(base));
        expect(parsear(r).letra).not.toBe(base.letra);
      } else if (/más (arriba|abajo) que esta/.test(p.enunciado)) {
        formas.add("paso");
        const d = (/un semitono/.test(p.enunciado) ? 1 : 2) * (/arriba/.test(p.enunciado) ? 1 : -1);
        expect(semitonoAbsoluto(parsear(r)) - semitonoAbsoluto(base), `${nombre(base)} → ${r}`).toBe(d);
      } else {
        formas.add("nombrar");
        expect(r).toBe(nombre(base));
      }
      // Ningún distractor suena igual que la respuesta, salvo el enarmónico a propósito de «nombrar».
      if (!/marcada/.test(p.enunciado) && !/semitonos hay/.test(p.enunciado)) {
        for (const o of p.opciones) if (o !== r) expect(semitonoAbsoluto(parsear(o)), `${p.enunciado} ${o} vs ${r}`).not.toBe(semitonoAbsoluto(parsear(r)));
      }
    }
    expect(formas.size).toBe(4);
  });

  it("oído absoluto: la respuesta es la nota que suena (y en «¿en qué octava?», su letra)", () => {
    for (const p of muestras("oido_absoluto")) {
      if (p.tipo !== "audio" || p.acorde) continue;
      expect(p.respuesta).toBe(nombre(p.nota));
      const letra = /Suena un (.+)\. ¿En qué octava/.exec(p.enunciado)?.[1];
      if (letra) for (const o of p.opciones) expect(o.replace(/\d+$/, "")).toBe(letra);
      else for (const o of p.opciones) if (o !== p.respuesta) expect(semitonoAbsoluto(parsear(o))).not.toBe(semitonoAbsoluto(p.nota));
    }
  });

  it("lectura: la más aguda, la más grave y la que va en cierto lugar", () => {
    const ordinales = ["primera", "segunda", "tercera", "cuarta", "quinta"];
    for (const p of muestras("lectura")) {
      if (p.tipo !== "pentagrama") throw new Error("lectura sin pentagrama");
      const alturas = p.notas.map(altura);
      if (/más aguda/.test(p.enunciado)) expect(p.respuesta).toBe(nombre(p.notas[alturas.indexOf(Math.max(...alturas))]));
      else if (/más grave/.test(p.enunciado)) expect(p.respuesta).toBe(nombre(p.notas[alturas.indexOf(Math.min(...alturas))]));
      else if (/de izquierda a derecha/.test(p.enunciado)) expect(p.respuesta).toBe(nombre(p.notas[ordinales.findIndex((o) => p.enunciado.includes(`la ${o} `))]));
      else expect(p.respuesta).toBe(nombre(p.notas[0]));
      expect(new Set(p.notas.map(altura)).size).toBe(p.notas.length);
    }
  });

  it("fundamentos: comparar, notas vecinas, sumar figuras y completar compases", () => {
    const formas = new Set<string>();
    for (const p of muestras("fundamentos")) {
      const e = p.enunciado;
      const r = p.respuesta.toLowerCase();
      const comparar = /dura (más|menos): la (.+) o la (.+)\?/.exec(e);
      if (comparar) {
        formas.add("comparar");
        const [a, b] = [DUR[comparar[2]], DUR[comparar[3]]];
        expect(r).toBe((a > b) === (comparar[1] === "más") ? comparar[2] : comparar[3]);
      }
      const suma = /dura lo mismo que (.+) juntas\?/.exec(e);
      if (suma) {
        formas.add("suma");
        expect(DUR[r], e).toBe(sumaTexto(suma[1]));
      }
      const completar = /compás de (\d)\/4 ya hay (.+)\. ¿Qué figura/.exec(e);
      if (completar) {
        formas.add("completar");
        expect(DUR[r], e).toBe(Number(completar[1]) - sumaTexto(completar[2]));
      }
      const vecina = /justo (después|antes) de (\w+)\?/.exec(e);
      const contar = /Desde (\w+), (subiendo|bajando) (\d) notas/.exec(e);
      if (vecina || contar) {
        formas.add("vecina");
        const desde = LETRAS.indexOf((vecina?.[2] ?? contar![1]) as NotaMusical["letra"]);
        const d = vecina ? (vecina[1] === "después" ? 1 : -1) : Number(contar![3]) * (contar![2] === "subiendo" ? 1 : -1);
        expect(p.respuesta, e).toBe(LETRAS[(((desde + d) % 7) + 7) % 7]);
      }
    }
    expect(formas.size).toBe(4);
  });

  it("tempo: pulsos en tantos segundos y opciones de BPM alrededor del pulso", () => {
    for (const p of muestras("tempo")) {
      const m = /A (\d+) BPM, ¿cuántos pulsos suenan en (\d+) segundos/.exec(p.enunciado);
      if (m) expect(Number(p.respuesta)).toBe((Number(m[1]) * Number(m[2])) / 60);
      if (p.tipo === "pulso") {
        expect(p.respuesta).toBe(`${p.bpm} BPM`);
        for (const o of p.opciones) expect(Number(o.replace(" BPM", ""))).toBeGreaterThanOrEqual(40);
      }
    }
  });
});
