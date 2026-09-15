"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

interface Props {
  colorActual: string | null;
  claro: boolean;
}

const COLOR_DEFECTO = "#6C4CF1";

// Pedido en vivo (2026-09-15): "¿podrías permitir cambiar el color del
// nombre? sería bueno" — mismo criterio que SubirFondoPerfil.tsx
// (guardado vía RPC que revisa el desbloqueo, nunca un update directo a
// la tabla), pero sin subir nada: un <input type="color"> nativo, así
// no hay que mantener un catálogo fijo de swatches — cualquier color.
// Solo se monta cuando profiles.color_nombre_desbloqueado es true (ver
// perfil/page.tsx), es decir, después de comprar
// "color_nombre_personalizado" en la Tienda.
export default function ColorNombrePicker({ colorActual, claro }: Props) {
  const t = useTranslations("Perfil");
  const router = useRouter();
  const [color, setColor] = useState(colorActual ?? COLOR_DEFECTO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(nuevoColor: string) {
    setColor(nuevoColor);
    setGuardando(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("guardar_color_nombre", { p_color: nuevoColor });
    setGuardando(false);
    if (rpcError) {
      console.error("[color-nombre] guardar_color_nombre error", rpcError);
      setError(t("colorNombre.errorGuardar"));
      return;
    }
    router.refresh();
  }

  async function quitar() {
    setGuardando(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("guardar_color_nombre", { p_color: null });
    setGuardando(false);
    if (rpcError) {
      setError(t("colorNombre.errorGuardar"));
      return;
    }
    router.refresh();
  }

  return (
    <div className="-mt-2 flex items-center gap-2">
      <label
        className={`flex items-center gap-1.5 text-xs font-medium ${claro ? "text-white/75" : "text-texto-secundario"}`}
      >
        {t("colorNombre.etiqueta")}
        <input
          type="color"
          value={color}
          disabled={guardando}
          onChange={(e) => void guardar(e.target.value)}
          className="h-6 w-8 cursor-pointer rounded border border-border bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>
      {colorActual && (
        <button
          type="button"
          onClick={quitar}
          disabled={guardando}
          className={`text-xs underline ${claro ? "text-white/60 hover:text-white" : "text-texto-secundario hover:text-foreground"}`}
        >
          {t("colorNombre.quitar")}
        </button>
      )}
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
