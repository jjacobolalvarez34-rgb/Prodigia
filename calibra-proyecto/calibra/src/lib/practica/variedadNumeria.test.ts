// Test de variedad de Numeria (reporte 2026-10-23: «decimales · convertir» daba
// SIEMPRE «1/2 a decimal» en nivel 1-2). Para cada modo y cada nivel se generan
// N preguntas con semillas distintas y se exige un mínimo de preguntas distintas,
// y que el nivel 10 pregunte cosas distintas que el nivel 1 (que la dificultad
// cambie de verdad). Para ver la tabla completa:
//   AUDITAR_VARIEDAD=1 npx vitest run src/lib/practica/variedadNumeria
import { describe, expect, it } from "vitest";
import { generarProblemaAlgebra, TIPOS_ALGEBRA, type TipoAlgebra } from "./algebra";
import { generarProblemaDecimal, TIPOS_DECIMAL, type TipoDecimal } from "./decimales";
import { generarProblemaFraccion, TIPOS_FRACCION, type TipoFraccion } from "./fracciones";
import { generarProblemaGeometria, TIPOS_GEOMETRIA, type TipoGeometria } from "./geometria";
import { generarProblemaPotencia, TIPOS_POTENCIA, type TipoPotencia } from "./potencias";
import { formatearProblema, generarProblema } from "./problems";
import { encabezadoTabla, filaTabla, medirVariedad, repetidasPorPartida } from "./variedad";

const N = 200;

const todos = <T extends string>(tipos: readonly T[], nivel: number) => Object.fromEntries(tipos.map((t) => [t, nivel])) as Record<T, number>;

const fraccionTexto = (f?: [number, number]) => (f ? `${f[0]}/${f[1]}` : "");

// Clave de cada modo = lo que ve el jugador (igual que las claves de dedup de web y app).
export const MODOS_NUMERIA: { nombre: string; generar: (nivel: number) => string }[] = [
  ...(["suma", "resta", "multiplicacion", "division"] as const).map((op) => ({
    nombre: `aritmética · ${op}`,
    generar: (nivel: number) => formatearProblema(generarProblema(op, nivel)),
  })),
  ...TIPOS_GEOMETRIA.map((t) => ({ nombre: `geometría · ${t}`, generar: (nivel: number) => generarProblemaGeometria(todos<TipoGeometria>(TIPOS_GEOMETRIA, nivel), [t]).enunciado })),
  ...TIPOS_FRACCION.map((t) => ({
    nombre: `fracciones · ${t}`,
    generar: (nivel: number) => {
      const p = generarProblemaFraccion(todos<TipoFraccion>(TIPOS_FRACCION, nivel), [t]);
      return `${fraccionTexto(p.frac)}${fraccionTexto(p.frac1)}?${fraccionTexto(p.frac2)}`;
    },
  })),
  ...TIPOS_DECIMAL.map((t) => ({ nombre: `decimales · ${t}`, generar: (nivel: number) => generarProblemaDecimal(todos<TipoDecimal>(TIPOS_DECIMAL, nivel), [t]).enunciado })),
  ...TIPOS_POTENCIA.map((t) => ({ nombre: `potencias · ${t}`, generar: (nivel: number) => generarProblemaPotencia(todos<TipoPotencia>(TIPOS_POTENCIA, nivel), [t]).enunciado })),
  ...TIPOS_ALGEBRA.map((t) => ({ nombre: `álgebra · ${t}`, generar: (nivel: number) => generarProblemaAlgebra(todos<TipoAlgebra>(TIPOS_ALGEBRA, nivel), [t]).enunciado })),
];

// Una partida son 10 preguntas: con menos de 30 distintas por nivel el
// deduplicador trabaja de más y entre partidas se nota la repetición.
const MINIMO_DISTINTAS = 30;
// Como mucho la mitad de lo que se pregunta en nivel 10 puede salir igual en nivel 1.
const MAXIMO_SOLAPAMIENTO = 0.5;
// Entre bandas consecutivas (1→3, 3→5, 5→7, 7→9), con la misma semilla, menos de
// la mitad de las preguntas puede salir idéntica: si no, subir de nivel no cambia nada.
const MAXIMA_MESETA = 0.5;
// Modos cuyo espacio de preguntas es chico por naturaleza en los niveles básicos
// (no hay 30 potencias o raíces exactas «de nivel 1»): piso propio, documentado.
const MINIMO_PROPIO: Record<string, number> = { "potencias · potencia": 16, "potencias · raiz": 14 };

describe("variedad de Numeria por modo y nivel", () => {
  const resultados = MODOS_NUMERIA.map((m) => ({ ...m, v: medirVariedad(m.generar, N) }));

  if (process.env.AUDITAR_VARIEDAD) {
    it("tabla", () => {
      const filas = resultados.map((r) => filaTabla(r.nombre, r.v));
      const repes = resultados.map((r) => `| ${r.nombre} | ${[1, 5, 10].map((n) => repetidasPorPartida(r.generar, n).toFixed(2)).join(" | ")} |`);
      console.log(`\n${encabezadoTabla()}\n${filas.join("\n")}\n\n| Modo | repes/partida N1 | N5 | N10 |\n|---|---:|---:|---:|\n${repes.join("\n")}\n`);
    });
  }

  for (const r of resultados) {
    const minimo = MINIMO_PROPIO[r.nombre] ?? MINIMO_DISTINTAS;
    it(`${r.nombre}: al menos ${minimo} preguntas distintas en cada nivel`, () => {
      const pobres = r.v.porNivel.filter((p) => p.distintas < minimo).map((p) => `N${p.nivel}=${p.distintas}`);
      expect(pobres, pobres.join(", ")).toEqual([]);
    });
    it(`${r.nombre}: el nivel 10 no pregunta lo mismo que el nivel 1`, () => {
      expect(r.v.solapamiento1a10).toBeLessThanOrEqual(MAXIMO_SOLAPAMIENTO);
    });
    it(`${r.nombre}: subir de banda cambia lo que se pregunta (sin mesetas)`, () => {
      expect(r.v.meseta, `N${r.v.mesetaEntre[0]}→N${r.v.mesetaEntre[1]}`).toBeLessThan(MAXIMA_MESETA);
    });
  }
});
