"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import DibujoTema from "@/components/temas/DibujoTema";
import { createClient } from "@/lib/supabase/client";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { escenaBosque } from "@/lib/temas/escenasFiestas";
import { bosqueCompartido, FICHAS_BOSQUE, mensajeErrorMinievento, reclamarBosque, type BosqueCompartido } from "@/lib/temas/minieventos";

// Día de la Tierra · «Bosque compartido» (0311): cada 5 aciertos de toda la comunidad
// plantan un árbol; con 400, Semillas para cada uno que haya plantado.
export default function Bosque() {
  const t = useTranslations("Minieventos.bosque");
  const en = useLocale() === "en";
  const ficha = COLECCIONES.dia_tierra!.ficha;
  const nombreFicha = en ? ficha.nombreEn : ficha.nombre;
  const [bosque, setBosque] = useState<BosqueCompartido | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const r = await bosqueCompartido(createClient());
    if (r) setBosque(r);
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
      await reclamarBosque(createClient());
      setBosque((b) => (b ? { ...b, reclamado: true } : b));
    } catch (e) {
      setError(mensajeErrorMinievento(e, en));
    } finally {
      setOcupado(false);
    }
  }

  if (!bosque) return null;
  const fraccion = Math.min(1, bosque.arboles / bosque.meta);
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B2018]">
        <DibujoTema dibujo={escenaBosque(fraccion)} className="block h-auto w-full" />
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-[#1F8A5B] to-[#3DDC97] transition-all" style={{ width: `${fraccion * 100}%` }} />
      </div>
      <p className="font-mono text-xs font-bold text-[#3DDC97]">
        {t("arboles", { n: bosque.arboles.toLocaleString(), meta: bosque.meta.toLocaleString() })} · {t("mios", { n: bosque.mios })}
      </p>
      {bosque.arboles >= bosque.meta ? (
        bosque.reclamado ? (
          <p className="text-sm font-bold text-[#3DDC97]">{t("reclamado", { ficha: nombreFicha })}</p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-bold text-[#3DDC97]">{t("logrado")}</p>
            <button type="button" disabled={ocupado} onClick={reclamar} className="rounded-xl border-2 border-[#05060F] bg-[#3DDC97] px-4 py-2 font-display text-sm font-bold text-[#06231A] shadow-[3px_3px_0_0_#05060F] disabled:opacity-60">
              {t("reclamar", { fichas: FICHAS_BOSQUE, ficha: nombreFicha })}
            </button>
          </div>
        )
      ) : (
        <p className="text-xs text-texto-secundario">{t("texto")}</p>
      )}
      {error && <p className="text-sm font-semibold text-error">{error}</p>}
    </div>
  );
}
