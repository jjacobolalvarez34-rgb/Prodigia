"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

interface Props {
  groupId: string;
  nombreGrupo: string;
}

export default function BorrarGrupo({ groupId, nombreGrupo }: Props) {
  const t = useTranslations("Profesor");
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function borrar() {
    setBorrando(true);
    setError(null);
    const res = await fetch("/api/profesor/borrar-grupo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group_id: groupId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? t("borrar.errorBorrar"));
      setBorrando(false);
      return;
    }
    router.push("/profesor");
    router.refresh();
  }

  if (!confirmando) {
    return (
      <button onClick={() => setConfirmando(true)} className="text-sm font-medium text-error hover:underline">
        {t("borrar.boton")}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2 rounded-xl border border-error/30 bg-error/5 px-4 py-3">
      <p className="text-sm text-foreground">
        {t("borrar.confirmarPrefijo")} <span className="font-semibold">{nombreGrupo}</span>
        {t("borrar.confirmarSufijo")}
      </p>
      <div className="flex gap-3">
        <button
          onClick={borrar}
          disabled={borrando}
          className="rounded-lg bg-error px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {borrando ? t("borrar.borrando") : t("borrar.botonConfirmar")}
        </button>
        <button onClick={() => setConfirmando(false)} className="text-sm text-texto-secundario hover:underline">
          {t("cancelar")}
        </button>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
