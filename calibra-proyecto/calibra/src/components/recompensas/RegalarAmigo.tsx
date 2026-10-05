"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { aQuienRegaleHoy, mensajeError, regalarAAmigo } from "@/lib/recompensas/api";
import { reproducirTono } from "@/lib/sonido";

// Regalo del día a un amigo (0249): 1 hielo o 1 escudo por día, nunca Chispas.
// Igual que en el perfil de un amigo en la app.
export default function RegalarAmigo({ amigoId, nombre }: { amigoId: string; nombre: string }) {
  const t = useTranslations("Recompensas.regalos");
  const [regaleA, setRegaleA] = useState<string | null | undefined>(undefined);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    aQuienRegaleHoy(createClient())
      .then(setRegaleA)
      .catch(() => setRegaleA(undefined));
  }, []);

  if (regaleA === undefined) return null;

  async function regalar(tipo: "hielo" | "escudo") {
    setOcupado(true);
    try {
      await regalarAAmigo(createClient(), amigoId, tipo);
      reproducirTono("compra");
      setRegaleA(amigoId);
      setAviso(t("enviado", { regalo: tipo === "hielo" ? t("unHielo") : t("unEscudo"), nombre }));
    } catch (e) {
      setAviso(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl border border-logro/50 bg-logro/5 px-4 py-3 text-left">
      <p className="font-display font-bold text-foreground">🎁 {t("delDia")}</p>
      <p className="text-xs text-texto-secundario">{regaleA === amigoId ? t("yaAEste") : regaleA ? t("yaAOtro") : t("puedes")}</p>
      {!regaleA && (
        <div className="flex gap-2">
          <button type="button" disabled={ocupado} onClick={() => regalar("hielo")} className="flex-1 rounded-full border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground disabled:opacity-50">
            🧊 {t("hielo")}
          </button>
          <button type="button" disabled={ocupado} onClick={() => regalar("escudo")} className="flex-1 rounded-full border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground disabled:opacity-50">
            🛡️ {t("escudo")}
          </button>
        </div>
      )}
      {aviso && <p className="text-xs font-semibold text-logro" role="status">{aviso}</p>}
    </div>
  );
}
