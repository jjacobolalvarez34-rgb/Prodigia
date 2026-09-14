"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { MotivoReporte } from "@/types/database";
import Boton from "@/components/Boton";

// Fase 6: además de perfiles de usuario, también se puede reportar un
// problema personalizado específico. Fase (Chat de clan): mismo botón,
// mismo flujo otra vez, ahora para un mensaje puntual — solo cambia
// qué RPC llama (reportar_usuario / reportar_post / reportar_mensaje_clan).
type Props =
  | { userId: string; postId?: undefined; mensajeId?: undefined }
  | { userId?: undefined; postId: string; mensajeId?: undefined }
  | { userId?: undefined; postId?: undefined; mensajeId: string };

// Fase Q3: reporte manual — se guarda en reportes_usuario para revisión
// tuya después (sin sistema de moderación automática, a propósito).
export default function ReportarBoton({ userId, postId, mensajeId }: Props) {
  const t = useTranslations("Perfil");
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState<MotivoReporte | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MOTIVOS: { valor: MotivoReporte; nombre: string }[] = [
    { valor: "trampa", nombre: t("reportarBoton.motivos.trampa") },
    { valor: "imagen_inapropiada", nombre: t("reportarBoton.motivos.imagenInapropiada") },
    { valor: "nombre_inapropiado", nombre: t("reportarBoton.motivos.nombreInapropiado") },
    { valor: "contenido_ofensivo", nombre: t("reportarBoton.motivos.contenidoOfensivo") },
    { valor: "otro", nombre: t("reportarBoton.motivos.otro") },
  ];

  async function enviar() {
    if (!motivo) return;
    setEnviando(true);
    setError(null);
    const supabase = createClient();
    const { error: reportError } = mensajeId
      ? await supabase.rpc("reportar_mensaje_clan", { p_mensaje_id: mensajeId, p_motivo: motivo })
      : postId
        ? await supabase.rpc("reportar_post", { p_post_id: postId, p_motivo: motivo })
        : await supabase.rpc("reportar_usuario", { p_reportado_id: userId, p_motivo: motivo });
    setEnviando(false);
    if (reportError) {
      console.error("[reportar] error", reportError);
      setError(t("reportarBoton.errorEnviar"));
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
        {t("reportarBoton.reportar")}
      </button>
    );
  }

  if (enviado) {
    return <p className="text-xs text-texto-secundario">{t("reportarBoton.gracias")}</p>;
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3">
      <p className="text-xs font-medium text-foreground">{t("reportarBoton.porQueReportas")}</p>
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
          {t("reportarBoton.enviarReporte")}
        </Boton>
        <button onClick={() => setAbierto(false)} className="text-xs text-texto-secundario hover:underline">
          {t("reportarBoton.cancelar")}
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
