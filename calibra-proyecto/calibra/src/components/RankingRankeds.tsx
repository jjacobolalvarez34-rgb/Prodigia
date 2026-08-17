"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Filtro = "total" | "mundo";
type Mundo = "numeria" | "enigmia" | "geografia";

interface FilaRanking {
  user_id: string;
  display_name: string | null;
  xp_semana: number;
}

const MUNDOS: { id: Mundo; nombre: string; colorHex: string }[] = [
  { id: "numeria", nombre: "Numeria", colorHex: "#6C4CF1" },
  { id: "enigmia", nombre: "Enigmia", colorHex: "#0E9F6E" },
  { id: "geografia", nombre: "Geografía", colorHex: "#1E7A8C" },
];

// Fase Y2: ranking accesible sin salir de Rankeds (esta pantalla, la de
// duelos/amigos) — no hace falta ir a /leaderboard aparte. Con
// tratamiento visual propio (borde con degradé, no una tabla plana) y
// filtro de dos opciones: experiencia total o por mundo específico.
export default function RankingRankeds({ miUserId }: { miUserId: string }) {
  const [filtro, setFiltro] = useState<Filtro>("total");
  const [mundo, setMundo] = useState<Mundo>("numeria");
  const [filas, setFilas] = useState<FilaRanking[]>([]);
  const [cargando, setCargando] = useState(true);

  // Marca "cargando" apenas cambia el filtro, ajustando estado durante
  // el render (mismo patrón que MundoSelector usa para resetear en un
  // cambio de prop) — así el efecto de abajo solo hace setState dentro
  // del callback async de la consulta, nunca de forma síncrona en su
  // cuerpo.
  const [filtroAnterior, setFiltroAnterior] = useState(filtro);
  const [mundoAnterior, setMundoAnterior] = useState(mundo);
  if (filtro !== filtroAnterior || mundo !== mundoAnterior) {
    setFiltroAnterior(filtro);
    setMundoAnterior(mundo);
    setCargando(true);
  }

  useEffect(() => {
    let cancelado = false;
    const supabase = createClient();
    const consulta =
      filtro === "total"
        ? supabase.rpc("ranking_semanal")
        : supabase.rpc("ranking_semanal_por_mundo", { p_mundo: mundo });
    consulta.then(({ data }) => {
      if (cancelado) return;
      setFilas(((data ?? []) as FilaRanking[]).slice(0, 8));
      setCargando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [filtro, mundo]);

  const colorActivo = filtro === "mundo" ? MUNDOS.find((m) => m.id === mundo)!.colorHex : "#FFC53D";

  return (
    <section
      className="flex flex-col gap-4 rounded-2xl border-2 px-5 py-5"
      style={{
        borderColor: `color-mix(in oklab, ${colorActivo} 30%, transparent)`,
        background: `linear-gradient(150deg, color-mix(in oklab, ${colorActivo} 6%, var(--surface)), var(--surface))`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <h2 className="font-display text-sm font-bold text-foreground">Ranking de la semana</h2>
        </div>
        <div className="flex rounded-full border border-border bg-background p-0.5 text-xs">
          <button
            onClick={() => setFiltro("total")}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              filtro === "total" ? "bg-primario text-white" : "text-texto-secundario"
            }`}
          >
            Experiencia total
          </button>
          <button
            onClick={() => setFiltro("mundo")}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              filtro === "mundo" ? "bg-primario text-white" : "text-texto-secundario"
            }`}
          >
            Por mundo
          </button>
        </div>
      </div>

      {filtro === "mundo" && (
        <div className="flex gap-1.5">
          {MUNDOS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMundo(m.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                mundo === m.id ? "text-white" : "border-border text-texto-secundario"
              }`}
              style={mundo === m.id ? { background: m.colorHex, borderColor: m.colorHex } : undefined}
            >
              {m.nombre}
            </button>
          ))}
        </div>
      )}

      {cargando ? (
        <p className="py-4 text-center text-xs text-texto-secundario">Cargando...</p>
      ) : filas.length === 0 ? (
        <p className="py-4 text-center text-xs text-texto-secundario">
          Todavía nadie sumó experiencia acá esta semana.
        </p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {filas.map((f, i) => (
            <li
              key={f.user_id}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                f.user_id === miUserId ? "bg-primario/10" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full font-mono text-[11px] font-bold"
                  style={
                    i < 3
                      ? { background: `color-mix(in oklab, ${colorActivo} 25%, transparent)`, color: colorActivo }
                      : { color: "var(--texto-secundario)" }
                  }
                >
                  {i + 1}
                </span>
                <span className="font-medium text-foreground">{f.display_name ?? "Jugador"}</span>
              </div>
              <span className="font-mono text-xs font-semibold" style={{ color: colorActivo }}>
                {f.xp_semana} Exp
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
