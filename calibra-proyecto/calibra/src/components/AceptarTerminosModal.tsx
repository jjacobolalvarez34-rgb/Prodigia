"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { VERSION_TERMINOS } from "@/lib/legal/terminos";
import Boton from "@/components/Boton";

// Aceptación de los Términos y la Política de privacidad (0257). Se monta en
// Header.tsx para sesiones reales: si la cuenta todavía no aceptó la versión
// vigente, aparece este aviso y no se puede cerrar sin aceptar. Si la persona ya
// la aceptó al registrarse (casilla de RegistroForm, guardada en los metadatos
// de la cuenta), se registra sola y no se muestra nada. Si la base todavía no
// tiene la migración, no se muestra (no bloquea a nadie por un error).
export default function AceptarTerminosModal() {
  const t = useTranslations("Common.aceptarTerminos");
  const [abierto, setAbierto] = useState(false);
  const [marcado, setMarcado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || user.is_anonymous) return;
      const { data, error: e } = await supabase.from("profiles").select("terminos_aceptados_version").eq("id", user.id).single();
      if (cancelado || e || data?.terminos_aceptados_version === VERSION_TERMINOS) return;
      if (user.user_metadata?.terminos_version === VERSION_TERMINOS) {
        await supabase.rpc("aceptar_terminos", { p_version: VERSION_TERMINOS });
        return;
      }
      setAbierto(true);
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  async function aceptar() {
    setEnviando(true);
    setError(null);
    const { error: e } = await createClient().rpc("aceptar_terminos", { p_version: VERSION_TERMINOS });
    setEnviando(false);
    if (e) {
      setError(t("error"));
      return;
    }
    setAbierto(false);
  }

  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/85 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="titulo-terminos">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <h2 id="titulo-terminos" className="font-display text-lg font-bold text-foreground">
          {t("titulo")}
        </h2>
        <p className="mt-2 text-sm text-texto-secundario">{t("texto")}</p>
        <ul className="mt-3 flex flex-col gap-1 text-sm">
          <li>
            <Link href="/terminos" target="_blank" className="font-semibold text-primario hover:underline">
              {t("verTerminos")}
            </Link>
          </li>
          <li>
            <Link href="/privacidad" target="_blank" className="font-semibold text-primario hover:underline">
              {t("verPrivacidad")}
            </Link>
          </li>
        </ul>
        <label className="mt-4 flex items-start gap-2 text-sm text-foreground">
          <input type="checkbox" checked={marcado} onChange={(e) => setMarcado(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primario" />
          <span>{t("casilla")}</span>
        </label>
        <Boton onClick={aceptar} disabled={!marcado} cargando={enviando} className="mt-4 w-full">
          {t("boton")}
        </Boton>
        {error && <p className="mt-2 text-sm text-error">{error}</p>}
      </div>
    </div>
  );
}
