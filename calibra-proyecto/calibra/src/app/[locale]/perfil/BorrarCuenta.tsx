"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Boton from "@/components/Boton";

export default function BorrarCuenta() {
  const t = useTranslations("Perfil");
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [texto, setTexto] = useState("");
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const palabraConfirmacion = t("borrarCuenta.palabraConfirmacion");

  async function borrar() {
    setBorrando(true);
    setError(null);
    const res = await fetch("/api/perfil/eliminar-cuenta", { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? t("borrarCuenta.errorGenerico"));
      setBorrando(false);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-error/30 bg-error/5 px-6 py-6">
      <h2 className="font-display text-sm font-bold text-error">{t("borrarCuenta.zonaPeligrosa")}</h2>
      {!confirmando ? (
        <button
          onClick={() => setConfirmando(true)}
          className="mt-3 text-sm font-medium text-error hover:underline"
        >
          {t("borrarCuenta.borrarMiCuenta")}
        </button>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          <p className="text-sm text-foreground">
            {t.rich("borrarCuenta.confirmacionTexto", {
              palabra: palabraConfirmacion,
              b: (chunks) => <span className="font-mono font-semibold">{chunks}</span>,
            })}
          </p>
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-error/40 bg-background px-3 py-2 font-mono text-foreground outline-none focus:border-error"
          />
          <div className="flex gap-3">
            <Boton variante="peligro" onClick={borrar} disabled={texto !== palabraConfirmacion} cargando={borrando} className="text-sm">
              {borrando ? t("borrarCuenta.borrando") : t("borrarCuenta.confirmarBorrado")}
            </Boton>
            <button
              onClick={() => {
                setConfirmando(false);
                setTexto("");
              }}
              className="text-sm text-texto-secundario hover:underline"
            >
              {t("borrarCuenta.cancelar")}
            </button>
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
        </div>
      )}
    </section>
  );
}
