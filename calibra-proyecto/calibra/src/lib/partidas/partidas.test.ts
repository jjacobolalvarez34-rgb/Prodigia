import { describe, expect, it } from "vitest";
import { duracionRepeticion, estadisticasDe, estadoEnElInstante, normalizarRespuestas, rachaMaxima } from "./estadisticas";
import { aciertosTexto, codificarTarjeta, compartirFinPartida, decodificarTarjeta, esFuncionFaltante, filaATarjeta, type TarjetaPartida } from "./compartir";
import { armarDetalleDuelo, resultadoDuelo, tarjetaDeDetalle } from "./detalleDuelo";

const R = (correct: boolean, timeMs: number) => ({ correct, timeMs });

describe("estadísticas de una partida", () => {
  it("cuenta aciertos, errores, racha y tiempos", () => {
    const e = estadisticasDe([R(true, 1000), R(true, 2000), R(false, 3000), R(true, 500), R(true, 1500), R(true, 1000)]);
    expect(e.aciertos).toBe(5);
    expect(e.errores).toBe(1);
    expect(e.rachaMax).toBe(3);
    expect(e.tiempoTotalMs).toBe(9000);
    expect(e.tiempoPromedioMs).toBe(1500);
    expect(e.masRapidaMs).toBe(500);
    expect(e.masLentaMs).toBe(3000);
  });

  it("sin respuestas no divide por cero", () => {
    const e = estadisticasDe([]);
    expect(e.precision).toBeNull();
    expect(e.tiempoPromedioMs).toBeNull();
    expect(rachaMaxima([])).toBe(0);
  });

  it("normaliza el jsonb y descarta lo raro", () => {
    expect(normalizarRespuestas(null)).toBeNull();
    expect(normalizarRespuestas([])).toBeNull();
    expect(normalizarRespuestas([{ correct: true, timeMs: 1234.6 }, "x", { correct: "si", timeMs: -5 }])).toEqual([R(true, 1235), R(false, 0)]);
  });

  it("la repetición avanza con los tiempos reales", () => {
    const r = [R(true, 1000), R(false, 1000), R(true, 1000)];
    expect(estadoEnElInstante(r, 0)).toEqual({ respondidas: 0, correctas: 0 });
    expect(estadoEnElInstante(r, 1000)).toEqual({ respondidas: 1, correctas: 1 });
    expect(estadoEnElInstante(r, 2500)).toEqual({ respondidas: 2, correctas: 1 });
    expect(estadoEnElInstante(r, 99999)).toEqual({ respondidas: 3, correctas: 2 });
    expect(duracionRepeticion(r, [R(true, 5000)], null)).toBe(5000);
  });
});

describe("tarjeta para compartir", () => {
  const tarjeta: TarjetaPartida = {
    tipo: "duelo",
    mundo: "quimia",
    clasificatorio: true,
    fecha: "2026-10-21T12:00:00.000Z",
    rachaMax: 4,
    yo: { nombre: "Ana Núñez", correctos: 8, total: 10, precision: 0.8, puntaje: 120, tiempoPromedioMs: 2300, respuestas: [R(true, 2000), R(false, 2600)] },
    rival: { nombre: "Vector Rho", esBot: true, correctos: 6, total: 10, precision: 0.6, puntaje: 90, tiempoPromedioMs: 3100, respuestas: null },
    resultado: "victoria",
  };

  it("va y vuelve por la URL sin perder nada (con tildes)", () => {
    expect(decodificarTarjeta(codificarTarjeta(tarjeta))).toEqual(tarjeta);
  });

  it("rechaza basura y mundos que no existen", () => {
    expect(decodificarTarjeta("no-es-base64")).toBeNull();
    expect(decodificarTarjeta(codificarTarjeta({ ...tarjeta, mundo: "atlantida" }))).toBeNull();
    expect(decodificarTarjeta("")).toBeNull();
  });

  it("arma la tarjeta desde la fila pública", () => {
    const t = filaATarjeta({ tipo: "sprint", mundo: "numeria", jugador_nombre: "Leo", correctos: 9, total: 10, precision_partida: "0.9", experiencia: 85, tiempo_promedio_ms: 1800, racha_max: 6, respuestas: null, creado_at: "2026-10-21T00:00:00Z" });
    expect(t?.tipo).toBe("sprint");
    expect(t?.rival).toBeNull();
    expect(t?.yo.precision).toBe(0.9);
    expect(t && aciertosTexto(t.yo)).toBe("9/10");
    expect(filaATarjeta({ mundo: "nada" })).toBeNull();
  });

  it("aciertos: conteo, o precisión si no hay conteo", () => {
    expect(aciertosTexto({ correctos: null, total: null, precision: 0.75 })).toBe("75%");
    expect(aciertosTexto({ correctos: null, total: null, precision: null })).toBe("—");
  });

  it("reconoce que la función de la base todavía no existe", () => {
    expect(esFuncionFaltante({ code: "PGRST202", message: "Could not find the function" })).toBe(true);
    expect(esFuncionFaltante({ code: "P0001", message: "no autorizado" })).toBe(false);
    expect(esFuncionFaltante(null)).toBe(false);
  });
});

describe("detalle de un duelo", () => {
  const duelo = {
    id: "d1",
    mundo: "numeria",
    sub_tipo: null,
    operation_type: "suma",
    clasificatorio: true,
    creado_at: "2026-10-21T00:00:00Z",
    estado: "completado",
    ganador_id: "yo",
    retador_id: "yo",
    retado_id: "el",
  };

  it("separa tu lado y el del rival", () => {
    const d = armarDetalleDuelo(
      duelo,
      [
        { user_id: "el", precision: "0.5", tiempo_promedio: "3000", puntaje_final: 40, respuestas: null },
        { user_id: "yo", precision: 0.9, tiempo_promedio: 2000, puntaje_final: 80, respuestas: [R(true, 2000), R(true, 2000)] },
      ],
      "yo",
      { nombre: "Rival", esBot: false }
    );
    expect(d?.resultado).toBe("victoria");
    expect(d?.yo?.stats?.rachaMax).toBe(2);
    expect(d?.rival?.precision).toBe(0.5);
    expect(d?.rival?.stats).toBeNull();
    const t = d && tarjetaDeDetalle(d, "Yo");
    expect(t?.rival?.nombre).toBe("Rival");
    expect(t?.yo.correctos).toBe(2);
  });

  it("no muestra duelos ajenos", () => {
    expect(armarDetalleDuelo(duelo, [], "otro", null)).toBeNull();
  });

  it("resultado según estado y ganador", () => {
    expect(resultadoDuelo({ estado: "pendiente", ganador_id: null }, "yo")).toBe("pendiente");
    expect(resultadoDuelo({ estado: "completado", ganador_id: null }, "yo")).toBe("empate");
    expect(resultadoDuelo({ estado: "abandonado", ganador_id: "el" }, "yo")).toBe("derrota");
  });
});

describe("compartir desde la pantalla del resultado", () => {
  const sprint = { total: 10, correctos: 7, xpGanado: 64, avgTimeMs: null };

  it("partida sola: el enlace sale de las últimas respuestas de ese mundo", () => {
    const { origen, tarjeta } = compartirFinPartida({ mundo: "codia", desde: "2026-10-21T10:00:00Z", sprint, respuestas: [R(true, 1000), R(true, 3000), R(false, 2000)] });
    expect(origen).toEqual({ mundo: "codia", cantidad: 3, desde: "2026-10-21T10:00:00Z" });
    expect(tarjeta.tipo).toBe("sprint");
    expect(tarjeta.rachaMax).toBe(2);
    expect(tarjeta.yo.tiempoPromedioMs).toBe(2000);
    expect(tarjeta.yo.precision).toBe(0.7);
    expect(tarjeta.fecha).toBeNull();
  });

  it("duelo: usa el id del duelo y el resultado si ya se resolvió", () => {
    const pendiente = compartirFinPartida({ mundo: "numeria", desde: null, sprint, duelId: "d1", duelo: { resuelto: false }, rivalNombre: "Rho" });
    expect(pendiente.origen).toEqual({ duelId: "d1" });
    expect(pendiente.tarjeta.resultado).toBe("pendiente");
    expect(pendiente.tarjeta.rival?.puntaje).toBeNull();
    const ganado = compartirFinPartida({ mundo: "numeria", desde: null, sprint, duelId: "d1", duelo: { resuelto: true, gane: true, mi_puntaje: 64, rival_puntaje: 40, oponente_nombre: "Rho" } });
    expect(ganado.tarjeta.resultado).toBe("victoria");
    expect(ganado.tarjeta.rival?.puntaje).toBe(40);
    expect(codificarTarjeta(ganado.tarjeta)).toBe(codificarTarjeta(compartirFinPartida({ mundo: "numeria", desde: null, sprint, duelId: "d1", duelo: { resuelto: true, gane: true, mi_puntaje: 64, rival_puntaje: 40, oponente_nombre: "Rho" } }).tarjeta));
  });
});
