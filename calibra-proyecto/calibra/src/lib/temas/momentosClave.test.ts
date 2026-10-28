import { afterEach, describe, expect, it, vi } from "vitest";
import { CICLO_TOTAL_MS, DURACION_EVENTO_MS, PRIMERA_ALINEACION_MS } from "@/lib/ciudades/cicloDia";
import { AVISO_PREVIO_MS } from "@/lib/recompensas/alineacion";
import { inicioEventoMs, rangosDelAnio } from "./calendario";
import { crearRelojEventos, firmaEventos, proximoMomentoClave } from "./momentosClave";
import { videoAperturaActual } from "./videosApertura";

const H = 3_600_000;
const utc = (s: string) => Date.parse(s);
const halloween2026 = rangosDelAnio(2026).find((r) => r.id === "halloween")!;

describe("próximo momento clave", () => {
  it("antes de la primera Gran Alineación, el siguiente es su comienzo exacto", () => {
    const ahora = PRIMERA_ALINEACION_MS - 10 * 60_000;
    expect(proximoMomentoClave(ahora)).toBe(PRIMERA_ALINEACION_MS);
  });

  it("durante la Alineación, el siguiente es su fin, que es también la apertura de Halloween 2026", () => {
    const fin = PRIMERA_ALINEACION_MS + DURACION_EVENTO_MS;
    expect(inicioEventoMs(halloween2026)).toBe(fin);
    expect(proximoMomentoClave(PRIMERA_ALINEACION_MS + H + 1)).toBe(fin);
    // Empieza a las 23:00 UTC: en medio cae la medianoche, que también es momento clave.
    expect(proximoMomentoClave(PRIMERA_ALINEACION_MS)).toBe(utc("2026-10-25T00:00:00Z"));
  });

  it("a mitad de un día cualquiera, el siguiente es la medianoche UTC", () => {
    expect(proximoMomentoClave(utc("2026-10-28T15:00:00Z"))).toBe(utc("2026-10-29T00:00:00Z"));
  });

  it("incluye cuándo aparece el cartel de la próxima Alineación y cuándo se va el resumen", () => {
    const segunda = PRIMERA_ALINEACION_MS + CICLO_TOTAL_MS;
    const aparece = segunda - AVISO_PREVIO_MS;
    expect(proximoMomentoClave(aparece - 1000)).toBe(aparece);
    const seVa = PRIMERA_ALINEACION_MS + DURACION_EVENTO_MS + AVISO_PREVIO_MS;
    expect(proximoMomentoClave(seVa - 1000)).toBe(seVa);
  });

  it("nunca devuelve un instante pasado y siempre llega dentro de un día", () => {
    for (let t = utc("2026-01-01T00:00:00Z"); t < utc("2028-01-01T00:00:00Z"); t += 7 * H + 13 * 60_000) {
      const p = proximoMomentoClave(t);
      expect(p).toBeGreaterThan(t);
      expect(p - t).toBeLessThanOrEqual(86_400_000);
    }
  });

  it("entre un momento clave y el siguiente nada cambia (la firma es la misma)", () => {
    let t = utc("2026-10-20T12:00:00Z");
    const hasta = utc("2026-11-12T00:00:00Z");
    while (t < hasta) {
      const p = proximoMomentoClave(t);
      expect(firmaEventos(p - 1)).toBe(firmaEventos(t));
      t = p;
    }
  });
});

describe("cinemática en el momento clave", () => {
  it("al terminar la Alineación sale la de Halloween, y no un instante antes", () => {
    const fin = PRIMERA_ALINEACION_MS + DURACION_EVENTO_MS;
    expect(videoAperturaActual(fin - 1)?.archivo).toBe("gran-alineacion");
    expect(videoAperturaActual(fin)).toMatchObject({ archivo: "halloween", clave: "halloween-2026" });
  });

  it("con la decoración de temporada apagada no hay video de fiestas, pero sí el de la Alineación", () => {
    const fin = PRIMERA_ALINEACION_MS + DURACION_EVENTO_MS;
    expect(videoAperturaActual(fin, { temas: false })).toBeNull();
    expect(videoAperturaActual(PRIMERA_ALINEACION_MS + H, { temas: false })?.archivo).toBe("gran-alineacion");
  });

  it("antes de la fecha no hay video (no hay vista previa)", () => {
    expect(videoAperturaActual(utc("2026-10-22T12:00:00Z"))).toBeNull();
  });
});

describe("reloj de eventos", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("avisa justo al llegar el momento clave y se reprograma solo", () => {
    vi.useFakeTimers();
    vi.setSystemTime(PRIMERA_ALINEACION_MS - 60_000);
    const reloj = crearRelojEventos();
    const oyente = vi.fn();
    const soltar = reloj.suscribir(oyente);
    vi.advanceTimersByTime(59_000);
    expect(oyente).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2_000);
    expect(oyente).toHaveBeenCalledTimes(1);
    expect(reloj.version()).toBe(1);
    // Los siguientes: la medianoche UTC (1 hora después) y el fin de la Alineación (3 horas).
    vi.advanceTimersByTime(H);
    expect(oyente).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(2 * H);
    expect(oyente).toHaveBeenCalledTimes(3);
    soltar();
  });

  it("revisa al volver al frente y deja de escuchar sin oyentes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(utc("2026-10-28T15:00:00Z"));
    let volver: (() => void) | null = null;
    const soltarVolver = vi.fn();
    const reloj = crearRelojEventos({
      alVolver: (avisar) => {
        volver = avisar;
        return soltarVolver;
      },
    });
    const oyente = vi.fn();
    const soltar = reloj.suscribir(oyente);
    volver!();
    expect(oyente).toHaveBeenCalledTimes(1);
    soltar();
    expect(soltarVolver).toHaveBeenCalled();
    vi.advanceTimersByTime(2 * 86_400_000);
    expect(oyente).toHaveBeenCalledTimes(1);
  });
});
