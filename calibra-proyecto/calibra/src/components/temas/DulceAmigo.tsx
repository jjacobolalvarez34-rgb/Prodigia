"use client";

import { useState } from "react";
import { useTemaHoy } from "./useTemaHoy";
import { createClient } from "@/lib/supabase/client";
import { celebracionDe } from "@/lib/temas/celebracion";
import { darDulce, mensajeErrorDulce } from "@/lib/temas/eventos";

// La acción de la fecha con un amigo («Dar un dulce» en Halloween; dar_dulce, 0292):
// una vez al día, los dos ganan 1 ficha del evento.
export default function DulceAmigo({ amigoId }: { amigoId: string }) {
  const tema = useTemaHoy();
  const a = celebracionDe(tema)?.amigos;
  const [estado, setEstado] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  if (!tema || !a) return null;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border-2 px-5 py-4" style={{ borderColor: `${tema.tema.acento}99`, background: `linear-gradient(120deg, ${tema.tema.acento}1f, transparent 70%)` }}>
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: tema.tema.acento }}>
        {tema.tema.nombre}
      </p>
      <p className="font-display text-base font-bold text-foreground">{a.accion}</p>
      <p className="text-sm text-texto-secundario">{estado ?? a.texto}</p>
      {!estado && (
        <button
          type="button"
          disabled={ocupado}
          onClick={async () => {
            setOcupado(true);
            try {
              await darDulce(createClient(), amigoId);
              setEstado("¡Listo! Los dos ganaron 1 ficha del evento.");
            } catch (e) {
              setEstado(mensajeErrorDulce(e));
            } finally {
              setOcupado(false);
            }
          }}
          className="w-fit rounded-xl border-2 border-[#05060F] px-4 py-2 font-display text-sm font-bold text-[#120A00] shadow-[3px_3px_0_0_#05060F] disabled:opacity-60"
          style={{ background: tema.tema.acento }}
        >
          {a.accion}
        </button>
      )}
    </div>
  );
}
