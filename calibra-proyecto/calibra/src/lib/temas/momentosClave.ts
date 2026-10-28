import { CICLO_TOTAL_MS, DURACION_EVENTO_MS, PRIMERA_ALINEACION_MS, proximaAlineacion } from "@/lib/ciudades/cicloDia";
import { AVISO_PREVIO_MS, momentoAlineacion } from "@/lib/recompensas/alineacion";
import { inicioEventoMs, rangosDelAnio } from "./calendario";
import { temaActivo } from "./temas";

// Eventos en vivo (pedido 2026-10-28): en vez de revisar cada tantos minutos, la web y la
// app programan un temporizador al próximo instante en que algo cambia (abre o cierra la
// Gran Alineación, empieza un evento, cambia el día y con él la fase de una fiesta). Al
// llegar, todo se recalcula y, si toca, sale la cinemática (videosApertura.ts).

const DIA = 86_400_000;

// Instantes de la Gran Alineación alrededor de «ahora»: cuándo aparece el cartel (3 días
// antes), cuándo empieza, cuándo termina y cuándo se va el resumen (3 días después).
function momentosAlineacion(ahora: number): number[] {
  const proxima = proximaAlineacion(ahora);
  const lista: number[] = [];
  for (const inicio of [proxima - CICLO_TOTAL_MS, proxima, proxima + CICLO_TOTAL_MS]) {
    if (inicio < PRIMERA_ALINEACION_MS) continue;
    lista.push(inicio - AVISO_PREVIO_MS, inicio, inicio + DURACION_EVENTO_MS, inicio + DURACION_EVENTO_MS + AVISO_PREVIO_MS);
  }
  return lista;
}

// Instantes de las festividades: la próxima medianoche UTC (las fases cambian por día) y
// la hora exacta de apertura de cada evento (si una Alineación la corre, no es medianoche).
function momentosTemas(ahora: number): number[] {
  const medianoche = Math.floor(ahora / DIA) * DIA + DIA;
  const anio = new Date(ahora).getUTCFullYear();
  const aperturas = [...rangosDelAnio(anio), ...rangosDelAnio(anio + 1)].map(inicioEventoMs);
  return [medianoche, ...aperturas];
}

// El próximo instante (estrictamente después de «ahora») en que puede cambiar algo de los
// eventos. Siempre existe: como mucho, la próxima medianoche UTC.
export function proximoMomentoClave(ahora: number): number {
  let mejor = Infinity;
  for (const t of [...momentosAlineacion(ahora), ...momentosTemas(ahora)]) {
    if (t > ahora && t < mejor) mejor = t;
  }
  return mejor;
}

// Resumen de lo que se ve por los eventos en un instante: si cambia de un momento a otro,
// hay que volver a pintar (tema, fase, edición y momento de la Alineación).
export function firmaEventos(ahora: number): string {
  const t = temaActivo(ahora);
  const m = momentoAlineacion(ahora);
  return `${t ? `${t.tema.id}:${t.fase}:${t.hoy.rango.desde}` : "-"}|${m.momento}:${m.numero}`;
}

// Reloj de eventos sin plataforma: un solo temporizador al próximo momento clave, que se
// reprograma al dispararse y cuando la app o la pestaña vuelven al frente («alVolver»;
// en segundo plano los temporizadores se pausan o se atrasan). Cada aviso sube la
// versión, que sirve de instantánea para useSyncExternalStore.
const MARGEN_MS = 250; // para caer ya del otro lado del instante
const TOPE_MS = 6 * 3_600_000; // los temporizadores muy largos se reprograman por tramos

export interface RelojEventos {
  suscribir: (oyente: () => void) => () => void;
  version: () => number;
  // Vuelve a calcular y avisa (al volver al frente, o cuando algo externo lo pide).
  revisar: () => void;
}

export function crearRelojEventos(opciones: { alVolver?: (avisar: () => void) => () => void; ahora?: () => number } = {}): RelojEventos {
  const reloj = opciones.ahora ?? (() => Date.now());
  const oyentes = new Set<() => void>();
  let version = 0;
  let temporizador: ReturnType<typeof setTimeout> | null = null;
  let soltarVolver: (() => void) | null = null;

  function avisar() {
    version++;
    oyentes.forEach((o) => o());
  }

  function programar() {
    if (temporizador) clearTimeout(temporizador);
    const ahora = reloj();
    const objetivo = proximoMomentoClave(ahora);
    const espera = Math.min(Math.max(0, objetivo - ahora) + MARGEN_MS, TOPE_MS);
    temporizador = setTimeout(() => {
      temporizador = null;
      // Si el temporizador se adelantó (o era un tramo del tope), solo se reprograma.
      if (reloj() < objetivo) programar();
      else revisar();
    }, espera);
  }

  function revisar() {
    if (oyentes.size === 0) return;
    programar();
    avisar();
  }

  return {
    suscribir(oyente) {
      oyentes.add(oyente);
      if (oyentes.size === 1) {
        programar();
        soltarVolver = opciones.alVolver?.(revisar) ?? null;
      }
      return () => {
        oyentes.delete(oyente);
        if (oyentes.size === 0) {
          if (temporizador) clearTimeout(temporizador);
          temporizador = null;
          soltarVolver?.();
          soltarVolver = null;
        }
      };
    },
    version: () => version,
    revisar,
  };
}
