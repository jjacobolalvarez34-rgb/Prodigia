export interface ProgresoMundo {
  puntos: number;
  nivel: number;
  fracVolumen: number;
  fracDominio: number;
  fracLecciones: number;
}

export interface SincronizarProgresoRow {
  puntos_mundo: number;
  nivel_mundo: number;
  frac_volumen: number;
  frac_dominio: number;
  frac_lecciones: number;
}

export type FaltanteNivel =
  | { tipo: "xp"; xpFaltante: number }
  | { tipo: "dominio" }
  | { tipo: "maximo" };

const UMBRAL_VOLUMEN = 25000;
const PESO_VOLUMEN = 0.34;
const PESO_DOMINIO = 0.45;
const PESO_APRENDER = 0.21;

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function nivelDesdeFracciones(fracVolumen: number, fracDominio: number, fracLecciones: number): number {
  const w =
    PESO_VOLUMEN * clamp01(fracVolumen) +
    PESO_DOMINIO * clamp01(fracDominio) +
    PESO_APRENDER * clamp01(fracLecciones);
  return Math.min(100, Math.max(1, Math.round(100 * w)));
}

export function faltanteParaSubir(p: ProgresoMundo): FaltanteNivel {
  if (p.nivel >= 100) return { tipo: "maximo" };

  const v = clamp01(p.fracVolumen);
  const d = clamp01(p.fracDominio);
  const l = clamp01(p.fracLecciones);

  const actual = PESO_VOLUMEN * v + PESO_DOMINIO * d + PESO_APRENDER * l;
  // El nivel mostrado es round(100*w): para ver `nivel+1` hay que cruzar
  // el punto medio del rango de redondeo del nivel nuevo.
  const meta = (p.nivel + 0.5) / 100;
  const falta = meta - actual;
  if (falta <= 0) return { tipo: "xp", xpFaltante: 0 };

  if (falta <= PESO_VOLUMEN * (1 - v)) {
    const xpFaltante = Math.ceil((falta / PESO_VOLUMEN) * UMBRAL_VOLUMEN);
    return { tipo: "xp", xpFaltante: Math.max(xpFaltante, 0) };
  }

  return { tipo: "dominio" };
}