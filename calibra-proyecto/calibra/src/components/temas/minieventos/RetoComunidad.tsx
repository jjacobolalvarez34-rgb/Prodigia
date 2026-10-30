"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { mensajeErrorMinievento, reclamarRetoComunidad, retoComunidad, type RetoComunidad as Reto } from "@/lib/temas/minieventos";

// Año Nuevo · «Reto 2027» (0309): entre toda la comunidad, tantas operaciones de Numeria
// bien resueltas en un día como el año que empieza; si se llega, cápsula para todos.
export default function RetoComunidad() {
  const t = useTranslations("Minieventos.reto");
  const en = useLocale() === "en";
  const [reto, setReto] = useState<Reto | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const r = await retoComunidad(createClient());
    if (r) setReto(r);
  }, []);

  useEffect(() => {
    // La cuenta de toda la comunidad (sistema externo): se refresca cada minuto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
    const id = setInterval(() => void cargar(), 60_000);
    return () => clearInterval(id);
  }, [cargar]);

  async function reclamar() {
    setOcupado(true);
    setError(null);
    try {
      await reclamarRetoComunidad(createClient());
      setReto((r) => (r ? { ...r, reclamado: true } : r));
    } catch (e) {
      setError(mensajeErrorMinievento(e, en));
    } finally {
      setOcupado(false);
    }
  }

  if (!reto) return null;
  const pct = Math.min(100, (reto.total / reto.meta) * 100);
  return (
    <div className="flex flex-col gap-2">
      <p className="font-display text-3xl font-black tabular-nums text-[#FFC53D]">
        {reto.total.toLocaleString()}
        <span className="text-base text-white/50"> / {reto.meta.toLocaleString()}</span>
      </p>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-[#A794FF] to-[#FFC53D] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="font-mono text-xs text-white/60">{t("progreso", { total: reto.total.toLocaleString(), meta: reto.meta.toLocaleString() })}</p>
      {reto.logrado ? (
        reto.reclamado ? (
          <p className="text-sm font-bold text-[#3DDC97]">{t("reclamado")}</p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-bold text-[#FFC53D]">{t("logrado")}</p>
            <button type="button" disabled={ocupado} onClick={reclamar} className="rounded-xl border-2 border-[#05060F] bg-[#FFC53D] px-4 py-2 font-display text-sm font-bold text-[#1A1206] shadow-[3px_3px_0_0_#05060F] disabled:opacity-60">
              {t("reclamar")}
            </button>
          </div>
        )
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-texto-secundario">{t("texto")}</p>
          <Link href="/numeria" className="rounded-xl border-2 border-[#05060F] bg-[#6C4CF1] px-3 py-1.5 font-display text-xs font-bold text-white shadow-[2px_2px_0_0_#05060F]">
            {t("jugar")}
          </Link>
        </div>
      )}
      {error && <p className="text-sm font-semibold text-error">{error}</p>}
    </div>
  );
}
