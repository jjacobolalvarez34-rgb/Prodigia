"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { buscarDueloEnCurso, type ClienteMinimo, type DueloEnCurso } from "@/lib/duelos/enCurso";
import { hrefDuelo, type MundoDuelo } from "@/lib/duelos/rutas";
import type { ArithmeticProblemType } from "@/types/database";

// Reconexión (pedido 2026-10-14): si quedó un duelo tuyo a medias (cerraste la pestaña,
// recargaste o te fuiste a otra página), aparece este aviso para volver a entrar. Se
// revisa al cambiar de página y al volver a la pestaña. Igual que la app.
const EN_PARTIDA = /(practica|sprint|rankeds\/serie)/;

export default function BannerDueloEnCurso() {
  const t = useTranslations("Duelos.reconexion");
  const ruta = usePathname();
  const [duelo, setDuelo] = useState<DueloEnCurso | null>(null);

  useEffect(() => {
    if (EN_PARTIDA.test(ruta)) return;
    let vivo = true;
    const revisar = async () => {
      const sb = createClient();
      const { data } = await sb.auth.getSession();
      const uid = data.session?.user.id;
      if (!uid || data.session?.user.is_anonymous) return;
      const d = await buscarDueloEnCurso(sb as unknown as ClienteMinimo, uid).catch(() => null);
      if (vivo) setDuelo(d);
    };
    revisar();
    const alVolver = () => {
      if (document.visibilityState === "visible") revisar();
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      vivo = false;
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [ruta]);

  if (!duelo || EN_PARTIDA.test(ruta)) return null;
  const href = duelo.serieId ? `/rankeds/serie/${duelo.serieId}` : hrefDuelo(duelo.mundo as MundoDuelo, duelo.operacion as ArithmeticProblemType | null, duelo.id, duelo.subTipo);
  return (
    <div className="fixed inset-x-3 bottom-4 z-[85] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-[#FF5C7A]/60 bg-[#1A0E1A]/95 px-4 py-3 text-white shadow-[0_10px_30px_-10px_rgba(255,92,122,0.6)]" role="status">
      <span className="relative flex h-3 w-3 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF5C7A] opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-[#FF5C7A]" />
      </span>
      <p className="flex-1 text-sm font-semibold">{t("texto")}</p>
      <Link href={href} className="shrink-0 rounded-full bg-[#FF5C7A] px-4 py-2 text-sm font-bold text-white">
        {t("volver")}
      </Link>
    </div>
  );
}
