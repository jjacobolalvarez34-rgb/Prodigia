// Contador de Pro (pedido 2026-10-13): cuánto le queda a la suscripción. Lógica pura,
// compartida por la web (/pro) y la app (Pro y Perfil). La fecha sale de
// subscriptions.current_period_end (cada uno puede leer la suya, RLS de 0145).
// Pro dado a mano, sin fila en subscriptions, no tiene fecha: no se muestra contador.

export interface SuscripcionPro {
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  status: string;
}

export interface VencimientoPro {
  fin: Date;
  // true = se cobra y sigue sola; false = termina en esa fecha (cancelada o vencida).
  renueva: boolean;
  dias: number;
  horas: number;
  minutos: number;
  // Faltan menos de 48 h: conviene mostrar horas y minutos.
  urgente: boolean;
}

export function calcularVencimientoPro(s: SuscripcionPro | null | undefined, ahora: number = Date.now()): VencimientoPro | null {
  if (!s?.current_period_end) return null;
  const fin = new Date(s.current_period_end);
  if (Number.isNaN(fin.getTime())) return null;
  const restanteMs = Math.max(0, fin.getTime() - ahora);
  const minutosTotales = Math.floor(restanteMs / 60_000);
  return {
    fin,
    renueva: !s.cancel_at_period_end && (s.status === "active" || s.status === "trialing"),
    dias: Math.floor(minutosTotales / 1440),
    horas: Math.floor((minutosTotales % 1440) / 60),
    minutos: minutosTotales % 60,
    urgente: restanteMs < 48 * 3600_000,
  };
}

// "5 d 3 h", "3 h 12 min", "12 min" — corto, para chips y contadores.
export function textoRestantePro(v: VencimientoPro): string {
  if (v.dias > 0) return `${v.dias} d ${v.horas} h`;
  if (v.horas > 0) return `${v.horas} h ${v.minutos} min`;
  return `${v.minutos} min`;
}
