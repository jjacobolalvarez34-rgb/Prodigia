"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MotivoReporte } from "@/types/database";
import Boton from "@/components/Boton";

const MOTIVOS: { valor: MotivoReporte; nombre: string }[] = [
  { valor: "trampa", nombre: "Hizo trampa" },
  { valor: "imagen_inapropiada", nombre: "Foto de perfil inapropiada" },
  { valor: "nombre_inapropiado", nombre: "Nombre inapropiado" },
  { valor: "otro", nombre: "Otro motivo" },
];

interface Props {
  userId: string;
}

// Fase Q3: reporte manual — se guarda en reportes_usuario para revisión
// tuya después (sin sistema de moderación automática, a propósito).
export default function ReportarBoton({ userId }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState<MotivoReporte | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar() {
    if (!motivo) return;
    setEnviando(true);
    setError(null);
    const supabase = createClient();
    const { error: reportError } = await supabase.rpc("reportar_usuario", {
      p_reportado_id: userId,
      p_motivo: motivo,
    });
    setEnviando(false);
    if (reportError) {
      console.error("[reportar] error", reportError);
      setError("No pudimos enviar el reporte. Probá de nuevo.");
      return;
    }
    setEnviado(true);
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="text-xs font-medium text-texto-secundario transition-colors hover:text-error"
      >
        Reportar
      </button>
    );
  }

  if (enviado) {
    return <p className="text-xs text-texto-secundario">Gracias, lo vamos a revisar.</p>;
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3">
      <p className="text-xs font-medium text-foreground">¿Por qué lo reportás?</p>
      <div className="flex flex-col gap-1.5">
        {MOTIVOS.map((m) => (
          <label key={m.valor} className="flex items-center gap-2 text-xs text-texto-secundario">
            <input
              type="radio"
              name="motivo-reporte"
              checked={motivo === m.valor}
              onChange={() => setMotivo(m.valor)}
            />
            {m.nombre}
          </label>
        ))}
      </div>
      <div className="mt-1 flex items-center gap-2">
        <Boton onClick={enviar} disabled={!motivo} cargando={enviando} className="px-3 py-1.5 text-xs">
          Enviar reporte
        </Boton>
        <button onClick={() => setAbierto(false)} className="text-xs text-texto-secundario hover:underline">
          Cancelar
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
