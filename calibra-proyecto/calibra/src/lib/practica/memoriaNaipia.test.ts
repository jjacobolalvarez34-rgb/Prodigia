import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  INICIO_MEMORIA_MS,
  calendarioMemoria,
  estadoMemoriaEn,
  programarMemoria,
  crearCronometroRespuesta,
  type EstadoMemoria,
} from "./memoriaNaipia";

describe("calendarioMemoria / estadoMemoriaEn", () => {
  it("una carta cada msPorCarta después de la cuenta inicial; termina tras la última", () => {
    const cal = calendarioMemoria(4, 1000);
    expect(cal.apareceMs).toEqual([INICIO_MEMORIA_MS, INICIO_MEMORIA_MS + 1000, INICIO_MEMORIA_MS + 2000, INICIO_MEMORIA_MS + 3000]);
    expect(cal.finMs).toBe(INICIO_MEMORIA_MS + 4000);
  });

  it("estado en cada instante: preparando, carta i visible con i ocultas, terminada", () => {
    const cal = calendarioMemoria(3, 800);
    expect(estadoMemoriaEn(cal, 0)).toEqual({ fase: "preparando", visible: null, ocultas: 0 });
    expect(estadoMemoriaEn(cal, INICIO_MEMORIA_MS - 1)).toEqual({ fase: "preparando", visible: null, ocultas: 0 });
    expect(estadoMemoriaEn(cal, INICIO_MEMORIA_MS)).toEqual({ fase: "mostrando", visible: 0, ocultas: 0 });
    expect(estadoMemoriaEn(cal, INICIO_MEMORIA_MS + 799)).toEqual({ fase: "mostrando", visible: 0, ocultas: 0 });
    expect(estadoMemoriaEn(cal, INICIO_MEMORIA_MS + 800)).toEqual({ fase: "mostrando", visible: 1, ocultas: 1 });
    expect(estadoMemoriaEn(cal, cal.finMs - 1)).toEqual({ fase: "mostrando", visible: 2, ocultas: 2 });
    expect(estadoMemoriaEn(cal, cal.finMs)).toEqual({ fase: "terminada", visible: null, ocultas: 3 });
    expect(estadoMemoriaEn(cal, cal.finMs + 99999)).toEqual({ fase: "terminada", visible: null, ocultas: 3 });
  });

  it("cada carta queda visible exactamente msPorCarta", () => {
    const cal = calendarioMemoria(12, 500);
    for (let i = 1; i < cal.apareceMs.length; i++) expect(cal.apareceMs[i] - cal.apareceMs[i - 1]).toBe(500);
    expect(cal.finMs - cal.apareceMs[cal.apareceMs.length - 1]).toBe(500);
  });
});

describe("programarMemoria (fake timers)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("emite los estados en orden y onFin una sola vez, recién tras la última carta", () => {
    const cal = calendarioMemoria(3, 1000);
    const estados: EstadoMemoria[] = [];
    const onFin = vi.fn();
    programarMemoria(cal, { onEstado: (e) => estados.push(e), onFin });

    expect(estados).toEqual([{ fase: "preparando", visible: null, ocultas: 0 }]);
    vi.advanceTimersByTime(INICIO_MEMORIA_MS);
    expect(estados.at(-1)).toEqual({ fase: "mostrando", visible: 0, ocultas: 0 });
    vi.advanceTimersByTime(1000);
    expect(estados.at(-1)).toEqual({ fase: "mostrando", visible: 1, ocultas: 1 });
    vi.advanceTimersByTime(1000);
    expect(estados.at(-1)).toEqual({ fase: "mostrando", visible: 2, ocultas: 2 });
    expect(onFin).not.toHaveBeenCalled();
    vi.advanceTimersByTime(999);
    expect(onFin).not.toHaveBeenCalled(); // la última carta sigue visible
    vi.advanceTimersByTime(1);
    expect(onFin).toHaveBeenCalledTimes(1);
    expect(estados.at(-1)).toEqual({ fase: "terminada", visible: null, ocultas: 3 });
    vi.advanceTimersByTime(60_000);
    expect(onFin).toHaveBeenCalledTimes(1);
  });

  it("cancelar (desmontar o cambiar de pregunta) detiene todo: nunca se llama onFin", () => {
    const cal = calendarioMemoria(5, 500);
    const onFin = vi.fn();
    const cancelar = programarMemoria(cal, { onEstado: () => {}, onFin });
    vi.advanceTimersByTime(cal.finMs - 1);
    cancelar();
    vi.advanceTimersByTime(60_000);
    expect(onFin).not.toHaveBeenCalled();
  });

  it("el input se habilita solo tras la última carta y timeMs se mide desde ahí (no desde el reparto)", () => {
    const cal = calendarioMemoria(6, 1000);
    // Lógica que replica NaipiaSprintRunner: campo de respuesta bloqueado
    // mientras dura el reparto; el cronómetro arranca en onFin.
    let campoHabilitado = false;
    const crono = crearCronometroRespuesta(() => Date.now()); // Date se simula con los fake timers
    const t0 = Date.now();
    const cancelar = programarMemoria(cal, {
      onEstado: () => {},
      onFin: () => {
        campoHabilitado = true;
        crono.marcarInicio();
      },
    });
    const avanzar = (ms: number) => vi.advanceTimersByTime(ms);

    avanzar(INICIO_MEMORIA_MS + 5 * 1000 + 999); // última carta aún visible
    expect(campoHabilitado).toBe(false);
    expect(crono.transcurrido()).toBe(0);
    avanzar(1); // se da vuelta la última: reparto terminado
    expect(campoHabilitado).toBe(true);
    avanzar(2345); // el jugador tarda 2345 ms en dar su conteo
    expect(crono.transcurrido()).toBe(2345);
    // Desde el montaje pasó todo el reparto más la respuesta: eso NO es timeMs.
    expect(Date.now() - t0).toBe(cal.finMs + 2345);
    cancelar();
  });
});
