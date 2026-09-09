// La ruleta de la Trastienda (Mecánica 4 de TRASTIENDA-ECONOMIA.md).
//
// Este archivo es fuente de verdad del CLIENTE: las probabilidades y el
// ORDEN deben espejar exactamente la cadena if/elsif de girar_ruleta()
// en supabase/migrations/0121_trastienda_economia.sql (el server es la
// autoridad; acá solo se renderiza la rueda y se calcula el ángulo de
// aterrizaje de la aguja sobre el segmento que el server decidió).

export type SegmentoRuleta =
  | "boost"
  | "escudo"
  | "congelamiento"
  | "chispas_50"
  | "chispas_25"
  | "chispas_100"
  | "fuente"
  | "marco"
  | "titulo"
  | "nada";

export interface SegmentoRuletaInfo {
  slug: SegmentoRuleta;
  probabilidad: number; // 0-100; suman 100 en el orden del SQL
  color: string;
}

// Mismo orden que el SQL (acumulado): boost, escudo, congelamiento,
// chispas 50/25/100, fuente, marco, titulo, nada.
export const SEGMENTOS_RULETA: SegmentoRuletaInfo[] = [
  { slug: "boost", probabilidad: 5, color: "#ff8a3d" },
  { slug: "escudo", probabilidad: 8, color: "#7c5cff" },
  { slug: "congelamiento", probabilidad: 6, color: "#3fb88b" },
  { slug: "chispas_50", probabilidad: 12, color: "#ffd75e" },
  { slug: "chispas_25", probabilidad: 20, color: "#f4c542" },
  { slug: "chispas_100", probabilidad: 3, color: "#ffb020" },
  { slug: "fuente", probabilidad: 2, color: "#a794ff" },
  { slug: "marco", probabilidad: 1.5, color: "#e8b34d" },
  { slug: "titulo", probabilidad: 0.5, color: "#9d7bff" },
  { slug: "nada", probabilidad: 42, color: "#262b36" },
];

export const RULETA_COSTO_PRIMERO = 120;
export const RULETA_COSTO_NORMAL = 150;
export const RULETA_LIMITE_DIARIO = 5;
export const RULETA_PITY_TRES_SIN_PREMIO = 3;

// Valor en Chispas que paga cada segmento (para el test de EV). El
// segmento 'titulo' entrega un escudo (placeholder hasta Mecánica 3),
// igual que el SQL — por eso su valor es el del escudo.
export const VALOR_SEGMENTO_CHISPAS: Record<SegmentoRuleta, number> = {
  boost: 600,
  escudo: 350,
  congelamiento: 450,
  chispas_50: 50,
  chispas_25: 25,
  chispas_100: 100,
  fuente: 800,
  marco: 900,
  titulo: 350,
  nada: 0,
};

export interface PorcionAngulos {
  slug: SegmentoRuleta;
  color: string;
  inicio: number;
  fin: number;
  centro: number;
}

export function angulosRuleta(): PorcionAngulos[] {
  let acumulado = 0;
  return SEGMENTOS_RULETA.map((s) => {
    const inicio = acumulado;
    const fin = inicio + (s.probabilidad / 100) * 360;
    acumulado = fin;
    return { slug: s.slug, color: s.color, inicio, fin, centro: (inicio + fin) / 2 };
  });
}

export function conicGradientRuleta(): string {
  const stops = angulosRuleta().map((p) => `${p.color} ${p.inicio}deg ${p.fin}deg`);
  return `conic-gradient(${stops.join(", ")})`;
}

// Rotación (en grados, sentido horario) para que la aguja fija en el
// norte termine sobre el centro del segmento elegido por el server.
export function rotacionParaSegmento(slug: SegmentoRuleta, vueltas: number): number {
  const porcion = angulosRuleta().find((p) => p.slug === slug);
  if (!porcion) return 360 * vueltas;
  return 360 - porcion.centro + 360 * vueltas;
}

// EV por giro (costo normal), con pity incluido: cada 4 giros (3 tiradas
// + 1 pity con premio menor asegurado) promedia el valor esperado.
export function evGiroRuleta(costo = RULETA_COSTO_NORMAL): number {
  const evTirada = SEGMENTOS_RULETA.reduce(
    (acc, s) => acc + (s.probabilidad / 100) * VALOR_SEGMENTO_CHISPAS[s.slug],
    0
  );
  const premioPity =
    (VALOR_SEGMENTO_CHISPAS.chispas_25 + VALOR_SEGMENTO_CHISPAS.chispas_50 + VALOR_SEGMENTO_CHISPAS.escudo) / 3;
  const evConPity = (evTirada * RULETA_PITY_TRES_SIN_PREMIO + premioPity) / (RULETA_PITY_TRES_SIN_PREMIO + 1);
  return evConPity / costo;
}