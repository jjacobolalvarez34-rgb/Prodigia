"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import Boton from "@/components/Boton";

// SEG-03 (docs/audits/REVISION-GENERAL-2026-09-26.md): antes, quien nunca
// contestaba la edad (edad_ingresada = null) entraba a la Trastienda como si
// fuera adulto — el gate real solo vivía acá, en la página, y ninguna RPC lo
// verificaba. Ahora el servidor bloquea null también (puede_usar_trastienda,
// migración 0241): esta pantalla deja de dejar pasar por defecto y, en vez de
// solo decir "no podés entrar", te pide la edad ahí mismo para no perder a
// quien sí puede jugar.
export default function ConfirmarEdadTrastienda() {
  const t = useTranslations("Tienda.trastiendaGateEdad");
  const router = useRouter();
  const [edad, setEdad] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const edadNum = Number(edad);
    if (!edad || !Number.isInteger(edadNum) || edadNum < 1 || edadNum > 120) {
      setError(t("errorInvalida"));
      return;
    }
    setEnviando(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("guardar_edad_usuario", { p_edad: edadNum });
    setEnviando(false);
    if (rpcError) {
      setError(t("errorGenerico"));
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex w-full max-w-xs flex-col gap-2">
      <input
        type="number"
        required
        min={1}
        max={120}
        autoFocus
        value={edad}
        onChange={(ev) => setEdad(ev.target.value)}
        placeholder={t("placeholder")}
        className="rounded-xl border border-border bg-background px-4 py-3 text-center text-foreground outline-none focus:border-primario"
      />
      <Boton type="submit" cargando={enviando} className="w-full">
        {t("confirmarBoton")}
      </Boton>
      {error && <p className="text-sm text-error">{error}</p>}
    </form>
  );
}
