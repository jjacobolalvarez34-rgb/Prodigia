"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  clanId: string;
  onSubida: (url: string) => void;
}

const MAX_BYTES = 2 * 1024 * 1024;
const TIPOS_PERMITIDOS = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

// Fase 3 ("Rankeds/Clanes: bugs y ranking visible"): mismo patrón que
// SubirAvatar.tsx — sube directo a Storage desde el cliente (bucket
// "clanes", ver 0084_imagen_clan.sql), después guarda la URL vía RPC
// (acá SÍ hace falta la RPC en vez de un update directo — clanes.* no
// es una columna client-writable, todo pasa por funciones security
// definer, a diferencia de profiles.avatar_url). Solo se monta para
// el fundador — el chequeo real de todos modos vive en la policy de
// Storage y en la RPC, esto es solo para no ofrecer el botón a quien
// no puede usarlo.
export default function SubirImagenClan({ clanId, onSubida }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);

    if (!TIPOS_PERMITIDOS.has(file.type)) {
      setError("Tiene que ser una imagen (PNG, JPG, WEBP o GIF).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("La imagen no puede pesar más de 2MB.");
      return;
    }

    setSubiendo(true);
    const supabase = createClient();
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const ruta = `${clanId}/estandarte.${extension}`;

    const { error: subidaError } = await supabase.storage
      .from("clanes")
      .upload(ruta, file, { upsert: true, cacheControl: "3600" });

    if (subidaError) {
      console.error("[imagen-clan] upload error", subidaError);
      setError("No pudimos subir la imagen. Probá de nuevo.");
      setSubiendo(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("clanes").getPublicUrl(ruta);
    const urlConVersion = `${publicUrlData.publicUrl}?v=${Date.now()}`;

    const { error: rpcError } = await supabase.rpc("actualizar_imagen_clan", { p_clan_id: clanId, p_url: urlConVersion });

    setSubiendo(false);
    if (rpcError) {
      console.error("[imagen-clan] rpc error", rpcError);
      setError("La imagen se subió pero no pudimos guardarla. Probá de nuevo.");
      return;
    }

    onSubida(urlConVersion);
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={subiendo}
        className="w-fit rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primario/40 disabled:opacity-60"
      >
        {subiendo ? "Subiendo..." : "Cambiar imagen del clan"}
      </button>
      {error && <p className="text-xs text-error">{error}</p>}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFile} className="hidden" />
    </div>
  );
}
