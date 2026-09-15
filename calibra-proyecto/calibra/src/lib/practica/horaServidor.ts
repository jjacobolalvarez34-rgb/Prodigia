// Ver el comment completo en src/app/api/hora-servidor/route.ts — esto
// es el lado cliente: pide la hora real del servidor para reemplazar
// el started_at que se manda a cada /api/*/finish, sin bloquear el
// arranque visual de la partida (se llama en paralelo, nunca con await
// antes de setFase("sprint")).
export async function obtenerHoraServidor(): Promise<string | null> {
  try {
    const res = await fetch("/api/hora-servidor");
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.ahora === "string" ? data.ahora : null;
  } catch {
    return null;
  }
}
