"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";

interface Props {
  userId: string;
  nombre: string | null;
  avatarUrlInicial: string | null;
}

const MAX_BYTES = 2 * 1024 * 1024;
const TIPOS_PERMITIDOS = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

// Fase P3: sube a Supabase Storage (bucket "avatares", ver
// 0039_avatares.sql) en una carpeta con el propio user_id — la policy
// de Storage exige exactamente eso, no cualquier ruta. Siempre pisa el
// mismo archivo (nombre fijo "foto"), así no hace falta borrar el
// anterior a mano ni acumular basura.
export default function SubirAvatar({ userId, nombre, avatarUrlInicial }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(avatarUrlInicial);
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
    const ruta = `${userId}/foto.${extension}`;

    const { error: subidaError } = await supabase.storage
      .from("avatares")
      .upload(ruta, file, { upsert: true, cacheControl: "3600" });

    if (subidaError) {
      console.error("[avatar] upload error", subidaError);
      setError("No pudimos subir la imagen. Probá de nuevo.");
      setSubiendo(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("avatares").getPublicUrl(ruta);
    // Cache-bust: mismo nombre de archivo siempre, así que sin esto el
    // navegador podría seguir mostrando la foto vieja desde caché.
    const urlConVersion = `${publicUrlData.publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: urlConVersion })
      .eq("id", userId);

    setSubiendo(false);
    if (updateError) {
      console.error("[avatar] update profile error", updateError);
      setError("La imagen se subió pero no pudimos guardarla en tu perfil. Probá de nuevo.");
      return;
    }

    setAvatarUrl(urlConVersion);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar url={avatarUrl} nombre={nombre} size={64} />
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          className="w-fit rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primario/40 disabled:opacity-60"
        >
          {subiendo ? "Subiendo..." : avatarUrl ? "Cambiar foto" : "Subir foto"}
        </button>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
