import { describe, expect, it } from "vitest";
import { mulberry32 } from "@/lib/rng";
import { resolverCircuito, compararTrasPerturbacion, type NodoCircuito } from "@/lib/circuitos/resolver";
import {
  generarProblemaCircuitia,
  conRngSembrado,
  type ProblemaCircuitiaNumero,
  type ProblemaCircuitiaOpciones,
} from "./circuitia";

const ITERACIONES = 220;

// Regex sobre el enunciado (formato controlado por circuitia.ts) — se
// usa para extraer, de forma INDEPENDIENTE del generador (nunca
// importando sus funciones internas), qué magnitud se preguntó y sobre
// qué resistor, para poder recalcular la respuesta esperada desde cero
// contra el kernel real (resolverCircuito/compararTrasPerturbacion).
const RE_PREGUNTA_NUMERO = /¿Cuál es (la corriente que pasa por|el voltaje sobre) (R\w+)\?/;
const RE_PREGUNTA_CUALITATIVA =
  /Si (R\w+) \(([\d.]+)Ω\) (se duplica a|se reduce a la mitad, a) ([\d.]+)Ω, ¿qué le pasa a (la corriente|el voltaje) en (R\w+)\?/;

// Clon independiente de "reemplazar el ohmiaje de un resistor" — a
// propósito NO se importa la función interna homónima de circuitia.ts,
// para que esta verificación sea de verdad independiente del generador.
function reemplazarOhmiosIndependiente(nodo: NodoCircuito, id: string, nuevoOhmios: number): NodoCircuito {
  if (nodo.tipo === "resistor") {
    return nodo.id === id ? { ...nodo, ohmios: nuevoOhmios } : { ...nodo };
  }
  return { tipo: nodo.tipo, hijos: nodo.hijos.map((h) => reemplazarOhmiosIndependiente(h, id, nuevoOhmios)) };
}

function contarResistores(nodo: NodoCircuito): number {
  if (nodo.tipo === "resistor") return 1;
  return nodo.hijos.reduce((acc, h) => acc + contarResistores(h), 0);
}

function profundidad(nodo: NodoCircuito): number {
  if (nodo.tipo === "resistor") return 0;
  return 1 + Math.max(0, ...nodo.hijos.map(profundidad));
}

describe("circuitia — modos numéricos (serie/paralelo/mixto)", () => {
  const modos: Array<{ modo: "serie" | "paralelo" | "mixto"; minNivel: number }> = [
    { modo: "serie", minNivel: 1 },
    { modo: "paralelo", minNivel: 1 },
    { modo: "mixto", minNivel: 4 },
  ];

  for (const { modo, minNivel } of modos) {
    it(`${modo}: ${ITERACIONES} problemas — respuesta coincide con un re-solve independiente vía resolverCircuito`, () => {
      for (let i = 0; i < ITERACIONES; i++) {
        const rng = mulberry32(1000 + i * 97 + modo.length);
        const nivel = minNivel + (i % (11 - minNivel));
        const p = conRngSembrado(rng, () => generarProblemaCircuitia(modo, nivel)) as ProblemaCircuitiaNumero;

        expect(p.entrada).toBe("numero");
        expect(p.modo).toBe(modo);

        const m = p.enunciado.match(RE_PREGUNTA_NUMERO);
        expect(m, `enunciado no matcheó el formato esperado: ${p.enunciado}`).not.toBeNull();
        const magnitud: "corriente" | "voltaje" = m![1].startsWith("la corriente") ? "corriente" : "voltaje";
        const targetId = m![2];
        expect(targetId).toBe(p.resaltarId);

        // Re-solve independiente: se llama a resolverCircuito de nuevo
        // sobre la MISMA topología guardada en el problema — esto
        // atrapa un bug donde el generador leyera la clave equivocada
        // del mapa o desalineara vFuente respecto de la topología.
        const resultado = resolverCircuito(p.topologia, p.vFuente);
        const valor = resultado.get(targetId);
        expect(valor, `resistor ${targetId} no está en la resolución`).toBeDefined();
        expect(Math.abs(valor![magnitud] - p.respuesta)).toBeLessThan(0.006);

        // Conteo de resistores dentro de rango por modo.
        const n = contarResistores(p.topologia);
        if (modo === "serie" || modo === "paralelo") {
          expect(n).toBeGreaterThanOrEqual(2);
          expect(n).toBeLessThanOrEqual(3);
          expect(p.topologia.tipo).toBe(modo);
        } else {
          expect(n).toBeGreaterThanOrEqual(3);
          expect(n).toBeLessThanOrEqual(4);
          expect(p.topologia.tipo).toBe("serie");
          expect(profundidad(p.topologia)).toBeLessThanOrEqual(2);
        }

        // Cross-check formulaico a mano para los casos puros.
        const entradas = Array.from(resultado.values());
        if (modo === "serie") {
          // V = IR sumado: misma corriente en todos los resistores, la
          // suma de voltajes tiene que dar la tensión de la fuente.
          const corrienteRef = entradas[0].corriente;
          for (const e of entradas) expect(Math.abs(e.corriente - corrienteRef)).toBeLessThan(1e-9);
          const sumaVoltajes = entradas.reduce((acc, e) => acc + e.voltaje, 0);
          expect(Math.abs(sumaVoltajes - p.vFuente)).toBeLessThan(1e-6);
        } else if (modo === "paralelo") {
          // Mismo voltaje en todos los resistores (= vFuente); la suma
          // de corrientes de cada rama tiene que dar I_total = V/Req,
          // con Req calculada acá de forma independiente (recíprocos).
          for (const e of entradas) expect(Math.abs(e.voltaje - p.vFuente)).toBeLessThan(1e-9);
          if (p.topologia.tipo === "paralelo") {
            const sumaInversos = p.topologia.hijos.reduce((acc, h) => acc + (h.tipo === "resistor" ? 1 / h.ohmios : 0), 0);
            const reqIndependiente = 1 / sumaInversos;
            const iTotalIndependiente = p.vFuente / reqIndependiente;
            const sumaCorrientes = entradas.reduce((acc, e) => acc + e.corriente, 0);
            expect(Math.abs(sumaCorrientes - iTotalIndependiente)).toBeLessThan(1e-6);
          }
        }
      }
    });
  }
});

describe("circuitia — modo cualitativo", () => {
  it(`${ITERACIONES} problemas — respuesta coincide con compararTrasPerturbacion re-derivada de forma independiente, e incluye casos reales de "no cambia"`, () => {
    let noCambiaCount = 0;
    let aumentaODisminuyeCount = 0;

    for (let i = 0; i < ITERACIONES; i++) {
      const rng = mulberry32(5000 + i * 131);
      const nivel = 1 + (i % 10);
      const p = conRngSembrado(rng, () => generarProblemaCircuitia("cualitativo", nivel)) as ProblemaCircuitiaOpciones;

      expect(p.entrada).toBe("opciones");
      expect(p.modo).toBe("cualitativo");
      expect([...p.opciones].sort()).toEqual(["Aumenta", "Disminuye", "No cambia"].sort());
      expect(p.opciones).toContain(p.respuesta);

      const m = p.enunciado.match(RE_PREGUNTA_CUALITATIVA);
      expect(m, `enunciado no matcheó el formato esperado: ${p.enunciado}`).not.toBeNull();
      const idPerturbado = m![1];
      const nuevoOhmios = Number(m![4]);
      const magnitud: "corriente" | "voltaje" = m![5] === "la corriente" ? "corriente" : "voltaje";
      const idObjetivo = m![6];
      expect(idObjetivo).toBe(p.resaltarId);
      expect(idObjetivo).not.toBe(idPerturbado);

      // Reconstruye la topología perturbada de forma INDEPENDIENTE
      // (clon propio, no el del generador) y llama al kernel real de
      // nuevo — si la respuesta guardada no coincide, es porque el
      // generador la hardcodeó o la calculó mal.
      const topologiaPerturbada = reemplazarOhmiosIndependiente(p.topologia, idPerturbado, nuevoOhmios);
      const resultado = compararTrasPerturbacion(p.topologia, topologiaPerturbada, p.vFuente, idObjetivo, magnitud);
      const etiqueta = resultado === "aumenta" ? "Aumenta" : resultado === "disminuye" ? "Disminuye" : "No cambia";
      expect(etiqueta).toBe(p.respuesta);

      if (resultado === "no_cambia") noCambiaCount++;
      else aumentaODisminuyeCount++;
    }

    // El plan pide explícitamente que "no_cambia" sea un resultado real
    // y no filtrado — se da de forma garantizada cuando la topología
    // base es un "paralelo" puro (root) y se pregunta por un resistor
    // HERMANO del perturbado: tanto su voltaje (= vFuente, compartido)
    // como su corriente (= vFuente / R propio) son matemáticamente
    // independientes de la resistencia de la rama hermana. Con ~1/3 a
    // 1/2 de probabilidad de caer en topología "paralelo" en cada
    // iteración, 220 pulls deberían dar muchas decenas de casos.
    expect(noCambiaCount).toBeGreaterThanOrEqual(2);
    expect(aumentaODisminuyeCount).toBeGreaterThan(0);
  });

  it('caso construido a mano: paralelo puro, perturbar R1 y preguntar por R2 → siempre "No cambia"', () => {
    // Verificación directa del razonamiento de arriba, sin depender del
    // azar: R1 y R2 en paralelo, V=12V. Duplicar R1 no debería tocar ni
    // la corriente ni el voltaje de R2.
    const original: NodoCircuito = {
      tipo: "paralelo",
      hijos: [
        { tipo: "resistor", id: "R1", ohmios: 100 },
        { tipo: "resistor", id: "R2", ohmios: 220 },
      ],
    };
    const perturbado = reemplazarOhmiosIndependiente(original, "R1", 200);
    expect(compararTrasPerturbacion(original, perturbado, 12, "R2", "voltaje")).toBe("no_cambia");
    expect(compararTrasPerturbacion(original, perturbado, 12, "R2", "corriente")).toBe("no_cambia");
    // Y el propio R1 sí cambia en ambas magnitudes al duplicarse.
    expect(compararTrasPerturbacion(original, perturbado, 12, "R1", "corriente")).toBe("disminuye");
  });
});
