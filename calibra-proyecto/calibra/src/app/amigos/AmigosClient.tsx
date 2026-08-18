"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ARITHMETIC_PROBLEM_TYPES, type ArithmeticProblemType } from "@/types/database";
import RankingRankeds from "@/components/RankingRankeds";
import Boton from "@/components/Boton";

interface Solicitud {
  user_id: string;
  display_name: string | null;
}

interface Amigo {
  friend_id: string;
  display_name: string | null;
  elo_rating: number;
}

interface Resultado {
  id: string;
  display_name: string | null;
}

const NOMBRES_OPERACION: Record<ArithmeticProblemType, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
};

interface Props {
  miUserId: string;
  solicitudesIniciales: Solicitud[];
  amigosIniciales: Amigo[];
}

export default function AmigosClient({ miUserId, solicitudesIniciales, amigosIniciales }: Props) {
  const router = useRouter();
  const [consulta, setConsulta] = useState("");
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [solicitudes, setSolicitudes] = useState(solicitudesIniciales);
  const [amigos, setAmigos] = useState(amigosIniciales);
  const [enviadas, setEnviadas] = useState<Set<string>>(new Set());
  const [retandoA, setRetandoA] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    if (consulta.trim().length < 2) return;
    setBuscando(true);
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("buscar_usuarios", { p_query: consulta.trim() });
    setBuscando(false);
    if (rpcError) {
      setError("No se pudo buscar. Probá de nuevo.");
      return;
    }
    setResultados((data ?? []) as Resultado[]);
  }

  async function enviarSolicitud(friendId: string) {
    setError(null);
    const res = await fetch("/api/amigos/solicitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friend_id: friendId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo enviar la solicitud.");
      return;
    }
    setEnviadas((prev) => new Set(prev).add(friendId));
  }

  async function responder(userId: string, aceptar: boolean) {
    setError(null);
    const res = await fetch("/api/amigos/responder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, aceptar }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo procesar la solicitud.");
      return;
    }
    const solicitud = solicitudes.find((s) => s.user_id === userId);
    setSolicitudes((prev) => prev.filter((s) => s.user_id !== userId));
    if (aceptar && solicitud) {
      setAmigos((prev) => [...prev, { friend_id: userId, display_name: solicitud.display_name, elo_rating: 1200 }]);
    }
  }

  async function retar(friendId: string, operacion: ArithmeticProblemType) {
    setError(null);
    const res = await fetch("/api/amigos/retar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friend_id: friendId, operation_type: operacion }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el duelo.");
      return;
    }
    router.push(`/practica?operacion=${operacion}&duelo=${data.duel_id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground">Amigos</h2>
        <p className="mt-1 text-sm text-texto-secundario">Buscá gente, aceptá solicitudes y retalos a duelo.</p>
      </div>

      <RankingRankeds miUserId={miUserId} />

      <form onSubmit={buscar} className="flex gap-2">
        <input
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Buscar por nombre..."
          className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none focus:border-primario"
        />
        <Boton type="submit" disabled={consulta.trim().length < 2} cargando={buscando} className="px-4 py-2.5 text-sm">
          Buscar
        </Boton>
      </form>

      {resultados.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Resultados</h2>
          {resultados.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
              <span className="font-medium text-foreground">{r.display_name ?? "Jugador"}</span>
              <Boton onClick={() => enviarSolicitud(r.id)} disabled={enviadas.has(r.id)} className="px-3 py-1.5 text-sm">
                {enviadas.has(r.id) ? "Enviada" : "Enviar solicitud"}
              </Boton>
            </div>
          ))}
        </section>
      )}

      {solicitudes.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Solicitudes pendientes</h2>
          {solicitudes.map((s) => (
            <div key={s.user_id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
              <span className="font-medium text-foreground">{s.display_name ?? "Jugador"}</span>
              <div className="flex gap-2">
                <Boton onClick={() => responder(s.user_id, true)} className="px-3 py-1.5 text-sm">
                  Aceptar
                </Boton>
                <Boton variante="secundario" onClick={() => responder(s.user_id, false)} className="px-3 py-1.5 text-sm">
                  Rechazar
                </Boton>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-texto-secundario">Tus amigos</h2>
        {amigos.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-texto-secundario">
            Todavía no tenés amigos agregados — buscalos arriba.
          </p>
        ) : (
          amigos.map((a) => (
            <div key={a.friend_id} className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <Link href={`/perfil/${a.friend_id}`} className="font-medium text-foreground hover:underline">
                    {a.display_name ?? "Jugador"}
                  </Link>
                  <span className="ml-2 font-mono text-xs text-texto-secundario">{a.elo_rating} ELO</span>
                </div>
                <Boton onClick={() => setRetandoA(retandoA === a.friend_id ? null : a.friend_id)} className="px-3 py-1.5 text-sm">
                  Retar a duelo
                </Boton>
              </div>
              {retandoA === a.friend_id && (
                <div className="flex flex-wrap gap-2 border-t border-border pt-2">
                  {ARITHMETIC_PROBLEM_TYPES.map((op) => (
                    <button
                      key={op}
                      onClick={() => retar(a.friend_id, op)}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:border-primario/40"
                    >
                      {NOMBRES_OPERACION[op]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </section>

      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
