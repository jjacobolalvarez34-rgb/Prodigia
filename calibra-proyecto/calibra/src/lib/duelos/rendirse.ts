// Llama a POST /api/duelos/rendirse (rendirse_duelo, 0088_rendirse_duelo.sql):
// cuenta como derrota real con su ELO correspondiente. Extraído de
// BotonRendirse.tsx (pedido en vivo 2026-09-24) para que la guardia de
// salida (src/lib/navegacion/guardiaSalida.tsx) pueda disparar el mismo
// rendirse cuando alguien abandona un duelo Ranked desde el Header (la
// casita, el logo, un link del nav) en vez de con el botón explícito.
export async function rendirseDuelo(duelId: string): Promise<void> {
  const res = await fetch("/api/duelos/rendirse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ duel_id: duelId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "No se pudo rendir el duelo.");
  }
}
