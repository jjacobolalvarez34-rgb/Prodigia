import { alineacionEnCurso, proximaAlineacion } from "@/lib/ciudades/cicloDia";

// Contador de la Gran Alineación (web y app): cuánto falta para la próxima o, si
// está pasando, cuánto le queda. Las mismas fechas que en_gran_alineacion() (0259).
export interface EstadoAlineacion {
  enCurso: boolean;
  // Momento (ms) al que cuenta: el inicio de la próxima o el fin de la actual.
  objetivo: number;
  restanteMs: number;
}

export function estadoAlineacion(ahoraMs: number): EstadoAlineacion {
  const actual = alineacionEnCurso(ahoraMs);
  if (actual) return { enCurso: true, objetivo: actual.fin, restanteMs: actual.fin - ahoraMs };
  const proxima = proximaAlineacion(ahoraMs);
  return { enCurso: false, objetivo: proxima, restanteMs: proxima - ahoraMs };
}

export function partesTiempo(ms: number): { dias: number; horas: number; minutos: number; segundos: number } {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { dias: Math.floor(s / 86400), horas: Math.floor((s % 86400) / 3600), minutos: Math.floor((s % 3600) / 60), segundos: s % 60 };
}
