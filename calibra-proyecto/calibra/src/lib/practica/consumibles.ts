// Consumibles de partida (hielo/tiempo_extra, pedido en vivo
// 2026-09-15) — usados A MITAD de un sprint, distinto de comprar()
// (que gasta Chispas) o de los escudos/boost que ya se aplican al
// arrancar. usar_consumible_partida (0148) decrementa 1 unidad server-
// side y re-deriva auth.uid(), nunca confía en nada del cliente más
// allá de "qué item". El gate de "prohibido en duelos" es 100% de UI
// (ConsumiblesPartida.tsx no se renderiza si hay un duelo activo).
export type TipoConsumible = "hielo" | "tiempo_extra";

interface RespuestaConsumible {
  hielos_disponibles: number;
  tiempos_extra_disponibles: number;
}

export async function usarConsumible(item: TipoConsumible): Promise<RespuestaConsumible | null> {
  try {
    const res = await fetch("/api/consumibles/usar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      hielos_disponibles: typeof data.hielos_disponibles === "number" ? data.hielos_disponibles : 0,
      tiempos_extra_disponibles: typeof data.tiempos_extra_disponibles === "number" ? data.tiempos_extra_disponibles : 0,
    };
  } catch {
    return null;
  }
}
