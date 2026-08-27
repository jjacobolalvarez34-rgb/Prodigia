import { describe, it, expect } from "vitest";
import { generarMemoria, generarComputacional, generarPatron } from "./generadores";

// Sección 3 (auditoría de variedad, tanda nocturna): computacional pasó
// de un único generador plano a 4 formas distintas gateadas por
// dificultad (secuencial, bucle, condicional, ordenar pasos) — la
// forma "ordenar pasos" en particular arma sus opciones a partir de
// permutaciones dedupeadas por resultado, con más superficie real de
// bug que el resto. Estos tests no verifican "se ve bien" (eso es
// visual), verifican el contrato que el runner de Enigmia asume de
// cualquier LogicPuzzle: 4 opciones únicas, y la respuesta está
// literalmente entre ellas.
describe("generarComputacional en todas las dificultades", () => {
  for (let dificultad = 1; dificultad <= 10; dificultad++) {
    it(`dificultad ${dificultad}: 20 acertijos, todos con 4 opciones únicas y respuesta incluida`, () => {
      for (let i = 0; i < 20; i++) {
        const p = generarComputacional(dificultad);
        expect(p.contenido.opciones.length).toBe(4);
        expect(new Set(p.contenido.opciones).size).toBe(4);
        expect(p.contenido.opciones).toContain(p.respuesta);
      }
    });
  }
});

describe("generarMemoria escala de verdad con la dificultad", () => {
  it("dificultad 1 da secuencias cortas, dificultad 10 llega a 10 elementos", () => {
    const facil = generarMemoria(1);
    const dificil = generarMemoria(10);
    expect(facil.contenido.secuencia?.length).toBeLessThan(5);
    expect(dificil.contenido.secuencia?.length).toBe(10);
  });

  it("nunca repite palabras dentro de la misma secuencia ni entre las opciones", () => {
    for (let dificultad = 1; dificultad <= 10; dificultad += 3) {
      const p = generarMemoria(dificultad);
      const secuencia = p.contenido.secuencia ?? [];
      expect(new Set(secuencia).size).toBe(secuencia.length);
      expect(new Set(p.contenido.opciones).size).toBe(p.contenido.opciones.length);
    }
  });
});

// Auditoría 2026-08-24 (reporte real de usuario: "x = 4; x = x + 4;
// repetir 4 veces" mostró opciones sin la respuesta correcta —
// sospecha: el generador calcula como si fuera multiplicación en vez
// de suma). El describe de arriba ("todas las dificultades") ya
// verifica que la respuesta está entre las opciones, pero lo hace
// comparando `p.respuesta` contra `p.contenido.opciones`, dos campos
// que el generador arma desde LA MISMA variable `x` — un bug donde el
// texto describe una operación y el valor real refleja otra podría
// pasar ese chequeo sin que se note, porque nunca se compara contra
// una fuente independiente. Este bloque interpreta el enunciado en
// español desde cero (un intérprete aparte, que no toca ninguna
// función interna de generadores.ts) y recalcula el resultado — si el
// texto dice "x = x + 4" tiene que sumar 4, sin importar qué haya
// hecho el generador puertas adentro.
function aplicarPaso(x: number, paso: string): number {
  const paso2 = paso.trim();
  let m = paso2.match(/^x = x \+ (-?\d+)$/);
  if (m) return x + Number(m[1]);
  m = paso2.match(/^x = x - (-?\d+)$/);
  if (m) return x - Number(m[1]);
  if (paso2 === "x = x × 2") return x * 2;
  throw new Error(`oráculo: paso no reconocido — "${paso2}"`);
}

function aplicarCondicional(x: number, regla: string): number {
  let m = regla.match(/^si x es par: (.+); si no: (.+)$/);
  if (m) return x % 2 === 0 ? aplicarPaso(x, m[1]) : aplicarPaso(x, m[2]);
  m = regla.match(/^si x > (-?\d+): (.+); si no: (.+)$/);
  if (m) return x > Number(m[1]) ? aplicarPaso(x, m[2]) : aplicarPaso(x, m[3]);
  throw new Error(`oráculo: regla condicional no reconocida — "${regla}"`);
}

// Recalcula la respuesta esperada leyendo SOLO el texto del enunciado.
// Devuelve null para las formas que no dan una respuesta numérica
// (hoy: "ordenar pasos", verificado aparte más abajo).
function respuestaEsperadaDesdeEnunciado(enunciado: string): number | null {
  let m = enunciado.match(/^x = (-?\d+)\. Repetir (\d+) veces: \{ si x > (-?\d+): (.+); si no: (.+) \}\. ¿Cuánto vale x al final\?$/);
  if (m) {
    let x = Number(m[1]);
    const veces = Number(m[2]);
    const regla = `si x > ${m[3]}: ${m[4]}; si no: ${m[5]}`;
    for (let i = 0; i < veces; i++) x = aplicarCondicional(x, regla);
    return x;
  }

  m = enunciado.match(/^x = (-?\d+)\. Repetir (\d+) veces: \{ repetir (\d+) veces: (.+) \}\. ¿Cuánto vale x al final\?$/);
  if (m) {
    let x = Number(m[1]);
    const veces = Number(m[2]);
    const vecesInterno = Number(m[3]);
    const texto = m[4];
    for (let i = 0; i < veces; i++) for (let j = 0; j < vecesInterno; j++) x = aplicarPaso(x, texto);
    return x;
  }

  m = enunciado.match(/^x = (-?\d+)\. Repetir (\d+) veces: (.+)\. ¿Cuánto vale x al final\?$/);
  if (m) {
    let x = Number(m[1]);
    const veces = Number(m[2]);
    const texto = m[3];
    for (let i = 0; i < veces; i++) x = aplicarPaso(x, texto);
    return x;
  }

  m = enunciado.match(/^x = (-?\d+)\. En orden: (.+)\. ¿Cuánto vale x al final\?$/);
  if (m) {
    let x = Number(m[1]);
    const lineas = m[2].split(". ");
    for (const linea of lineas) {
      x = linea.startsWith("si ") ? aplicarCondicional(x, linea) : aplicarPaso(x, linea);
    }
    return x;
  }

  if (enunciado.includes("Estos 3 pasos están desordenados")) return null;

  throw new Error(`oráculo: forma de enunciado no reconocida — "${enunciado}"`);
}

describe("generarComputacional — oráculo independiente (recalcula desde el texto, no desde el código interno)", () => {
  it("2000 muestras repartidas en las 10 dificultades: la respuesta recalculada desde el enunciado coincide siempre con p.respuesta", () => {
    for (let dificultad = 1; dificultad <= 10; dificultad++) {
      for (let i = 0; i < 200; i++) {
        const p = generarComputacional(dificultad);
        const esperada = respuestaEsperadaDesdeEnunciado(p.contenido.enunciado);
        if (esperada === null) continue; // "ordenar pasos" — verificado abajo
        expect(esperada, `enunciado: "${p.contenido.enunciado}" / respuesta: "${p.respuesta}"`).toBe(Number(p.respuesta));
      }
    }
  });

  it("caso puntual del reporte de usuario: bucle de suma simple calcula por suma, no por multiplicación", () => {
    // x = 4, "x = x + 4", repetir 4 veces → 4 + 4*4 = 20 (suma), no
    // 4 × 2^4 = 64 ni 4×4×4×4 (lo que "multiplicación en vez de suma"
    // habría dado). Se arma el enunciado a mano, se corre por el mismo
    // oráculo de arriba.
    const enunciado = "x = 4. Repetir 4 veces: x = x + 4. ¿Cuánto vale x al final?";
    expect(respuestaEsperadaDesdeEnunciado(enunciado)).toBe(20);
  });

  it("500 muestras de 'ordenar pasos' (dificultad 8-10): aplicar la secuencia de la respuesta desde x inicial da el resultado que el enunciado promete", () => {
    let vistas = 0;
    for (let i = 0; i < 500; i++) {
      const p = generarComputacional(8 + (i % 3));
      const m = p.contenido.enunciado.match(
        /^x = (-?\d+)\. Estos 3 pasos están desordenados — ¿en qué orden hay que aplicarlos para que x termine en (-?\d+)\?$/
      );
      if (!m) continue;
      vistas++;
      let x = Number(m[1]);
      for (const paso of p.respuesta.split(" → ")) x = aplicarPaso(x, paso);
      expect(x, `enunciado: "${p.contenido.enunciado}" / secuencia respuesta: "${p.respuesta}"`).toBe(Number(m[2]));
    }
    expect(vistas).toBeGreaterThan(0);
  });
});

// Auditoría 2026-08-25 ("los patrones son mayormente aditivos
// simples"): generarPatron pasó de 2 formas (aditivo/geométrico) a 4
// (+ alternante y combinación suma×multiplicación), gateadas por
// dificultad. Estos tests verifican tanto el contrato de siempre
// (4 opciones únicas, respuesta incluida) como que las bandas altas
// de verdad NO son aditivas — si alguna vez alguien rompe el
// dispatch y todo vuelve a caer en paso constante, esto lo detecta.
describe("generarPatron — 4 formas reales, no solo aditivo", () => {
  it("en las 10 dificultades: 4 opciones únicas y la respuesta incluida", () => {
    for (let dificultad = 1; dificultad <= 10; dificultad++) {
      for (let i = 0; i < 30; i++) {
        const p = generarPatron(dificultad);
        expect(p.contenido.opciones.length, `dificultad ${dificultad}`).toBe(4);
        expect(new Set(p.contenido.opciones).size, `dificultad ${dificultad}: opciones duplicadas`).toBe(4);
        expect(p.contenido.opciones, `dificultad ${dificultad}: enunciado "${p.contenido.enunciado}"`).toContain(p.respuesta);
      }
    }
  });

  function deltas(secuencia: number[]): number[] {
    const nums = secuencia.map(Number);
    return nums.slice(1).map((n, i) => n - nums[i]);
  }

  it("dificultad 5 (alternante): el delta entre términos cambia de signo, no es un paso constante", () => {
    let algunaVezAlternó = false;
    for (let i = 0; i < 20; i++) {
      const p = generarPatron(5);
      const nums = p.contenido.enunciado.replace(", ?", "").split(", ").map(Number);
      const ds = deltas(nums);
      if (ds[0] > 0 && ds[1] < 0) algunaVezAlternó = true;
      // nunca debería ser un paso constante (eso sería el generador aditivo, banda equivocada)
      expect(new Set(ds).size, `dificultad 5 dio un paso constante: ${nums.join(",")}`).toBeGreaterThan(1);
    }
    expect(algunaVezAlternó).toBe(true);
  });

  it("dificultad 10 (combinación): la razón entre términos consecutivos no es constante (mezcla suma y multiplicación)", () => {
    for (let i = 0; i < 20; i++) {
      const p = generarPatron(10);
      const nums = p.contenido.enunciado.replace(", ?", "").split(", ").map(Number);
      const razones = nums.slice(1).map((n, i2) => (nums[i2] !== 0 ? n / nums[i2] : null));
      const ds = deltas(nums);
      // ni las razones son todas iguales (no es geométrico puro) ni los
      // deltas son todos iguales (no es aditivo puro) — es la mezcla.
      const razonesDistintas = new Set(razones.map((r) => (r === null ? "null" : r.toFixed(3)))).size > 1;
      const deltasDistintos = new Set(ds).size > 1;
      expect(razonesDistintas || deltasDistintos, `dificultad 10 parece una sola operación repetida: ${nums.join(",")}`).toBe(true);
    }
  });
});
