import { describe, it, expect } from "vitest";
import { calcularNivelMundo, fraccionDominio, VOLUMEN_TECHO } from "./worldLevel";
import { calcularNuevoNivel } from "./skillLevels";

const SUBTEMAS_NUMERIA = [
  "suma", "resta", "multiplicacion", "division",
  "fracciones_simplificar", "fracciones_comparar", "fracciones_sumar",
  "decimales_convertir", "decimales_porcentaje", "decimales_redondear",
  "potencias_potencia", "potencias_raiz", "potencias_notacion",
  "algebra_evaluar", "algebra_un-paso", "algebra_dos-pasos",
  "geometria_perimetro", "geometria_area", "geometria_angulos", "geometria_ternas",
];

function simularCalibracion(aciertos: number): number {
  let nivel = 1;
  let racha = 0;
  for (let i = 0; i < aciertos; i++) {
    const r = calcularNuevoNivel(nivel, racha, true);
    nivel = r.nivel;
    racha = r.racha_actual;
  }
  return nivel;
}

interface Jugador {
  nombre: string;
  problemas: number;
  xpPorProblema: number;
  subtemasActivos: number;
  aciertosPorSubtema: number;
  leccionesFrac: number;
  npc: number;
}

function nivelJugador(j: Jugador): number {
  const xp = j.problemas * j.xpPorProblema;
  const nivelActivo = simularCalibracion(j.aciertosPorSubtema);
  const nivelesRecord: Record<string, number> = {};
  for (let s = 0; s < j.npc; s++) {
    nivelesRecord[SUBTEMAS_NUMERIA[s]] =
      s < j.subtemasActivos ? nivelActivo : 1;
  }
  const dominio = fraccionDominio(nivelesRecord, "numeria");
  return calcularNivelMundo(xp, dominio, j.leccionesFrac);
}

describe("nivel de mundo — curva escalable", () => {
  const NPC = 20;

  it("pequeño (~30 problemas): se queda en nivel 1", () => {
    const nivel = nivelJugador({
      nombre: "pequeño", problemas: 30, xpPorProblema: 11,
      subtemasActivos: 3, aciertosPorSubtema: 10, leccionesFrac: 0, npc: NPC,
    });
    expect(nivel).toBe(1);
  });

  it("medio (~400 problemas): sube claramente por encima de 1", () => {
    const nivel = nivelJugador({
      nombre: "medio", problemas: 400, xpPorProblema: 13,
      subtemasActivos: 10, aciertosPorSubtema: 40, leccionesFrac: 3 / 20, npc: NPC,
    });
    expect(nivel).toBeGreaterThanOrEqual(15);
  });

  it("avanzado (~800 problemas, caso reportado): destraba el estancamiento", () => {
    const xp = 800 * 15;
    const niveles: Record<string, number> = {};
    for (let s = 0; s < 18; s++) niveles[SUBTEMAS_NUMERIA[s]] = 8;
    const dominio = fraccionDominio(niveles, "numeria");
    const nivel = calcularNivelMundo(xp, dominio, 0.5);
    expect(nivel).toBeGreaterThan(40);
  });

  it("extremo (~5000 problemas, todo dominado): cerca del techo", () => {
    const xp = 5000 * 15;
    const niveles: Record<string, number> = {};
    for (let s = 0; s < 20; s++) niveles[SUBTEMAS_NUMERIA[s]] = 9;
    const dominio = fraccionDominio(niveles, "numeria");
    const nivel = calcularNivelMundo(xp, dominio, 1);
    expect(nivel).toBeGreaterThan(85);
  });

  it("anti-farm: dominar un solo subtema al infinito no supera un nivel medio", () => {
    const xp = 2000000;
    const soloUnSubtema = fraccionDominio({ suma: 10 }, "numeria");
    expect(soloUnSubtema).toBeLessThan(1 / 10);
    const nivel = calcularNivelMundo(xp, soloUnSubtema, 0);
    expect(nivel).toBeLessThanOrEqual(40);
  });

  it("el volumen por sí solo no puede llevar el nivel al techo", () => {
    const nivelSinDominioNiLecciones = calcularNivelMundo(10 * VOLUMEN_TECHO, 0, 0);
    expect(nivelSinDominioNiLecciones).toBeLessThanOrEqual(40);
  });
});
