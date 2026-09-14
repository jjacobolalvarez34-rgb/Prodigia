"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  urlInicial: string | null;
}

const MAX_BYTES = 3 * 1024 * 1024;
const TIPOS_PERMITIDOS = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

// Fase 10b ("fondo personalizado, pero vale Chispas"): mismo patrón que
// SubirAvatar.tsx (Supabase Storage, carpeta propia por user_id), pero
// a diferencia de avatar_url esto SÍ necesita un guard de compra — por
// eso el guardado final va por la RPC guardar_fondo_perfil_url (que
// revisa 'personalizado' = any(fondos_desbloqueados)) en vez de un
// update directo a la tabla. Solo se muestra desde perfil/page.tsx
// cuando fondo_perfil === "personalizado" (ya implica que se compró).
export default function SubirFondoPerfil({ userId, urlInicial }: Props) {
  const t = useTranslations("Perfil");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(urlInicial);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);

    if (!TIPOS_PERMITIDOS.has(file.type)) {
      setError(t("subirFondoPerfil.tipoInvalido"));
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(t("subirFondoPerfil.tamanoExcedido"));
      return;
    }

    setSubiendo(true);
    const supabase = createClient();
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const ruta = `${userId}/fondo.${extension}`;

    const { error: subidaError } = await supabase.storage
      .from("fondos-perfil")
      .upload(ruta, file, { upsert: true, cacheControl: "3600" });

    if (subidaError) {
      console.error("[fondo-perfil] upload error", subidaError);
      setError(t("subirFondoPerfil.errorSubida"));
      setSubiendo(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("fondos-perfil").getPublicUrl(ruta);
    const urlConVersion = `${publicUrlData.publicUrl}?v=${Date.now()}`;

    const { error: rpcError } = await supabase.rpc("guardar_fondo_perfil_url", { p_url: urlConVersion });

    setSubiendo(false);
    if (rpcError) {
      console.error("[fondo-perfil] guardar_fondo_perfil_url error", rpcError);
      setError(t("subirFondoPerfil.errorGuardarPerfil"));
      return;
    }

    setUrl(urlConVersion);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          className="w-fit rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primario/40 disabled:opacity-60"
        >
          {subiendo ? t("subirFondoPerfil.subiendo") : url ? t("subirFondoPerfil.cambiarImagen") : t("subirFondoPerfil.subirImagen")}
        </button>
        {!url && <span className="text-xs text-texto-secundario">{t("subirFondoPerfil.subeUnaImagen")}</span>}
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
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
