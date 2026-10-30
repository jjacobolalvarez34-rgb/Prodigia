"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import DibujoTema from "@/components/temas/DibujoTema";
import { createClient } from "@/lib/supabase/client";
import { CHISPAS_POR_FICHA } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { cerrarFichas, estadoEvento, eventosPorCerrar, mensajeErrorEvento } from "@/lib/temas/eventos";
import { TEMAS } from "@/lib/temas/temas";

interface Pendiente {
  slug: string;
  saldo: number;
  ficha: { nombre: string; nombreEn: string; dibujo: keyof typeof PARTICULAS };
  evento: string;
}

// Las Fichas que sobraron de un evento que ya terminó y cuyo día de cierre quedó tapado
// por otra fiesta (eventosPorCerrar): se cambian por Chispas desde la página del evento.
export default function CierrePendiente({ actual }: { actual: string | null }) {
  const t = useTranslations("Minieventos.cierrePendiente");
  const en = useLocale() === "en";
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    void (async () => {
      const sb = createClient();
      const lista: Pendiente[] = [];
      for (const e of eventosPorCerrar(actual)) {
        const est = await estadoEvento(sb, e.slug);
        if (est && !est.cerrado && est.saldo > 0) {
          const tema = TEMAS[e.coleccion.tema];
          lista.push({ slug: e.slug, saldo: est.saldo, ficha: e.coleccion.ficha, evento: en ? tema.nombreEn : tema.nombre });
        }
      }
      if (vivo) setPendientes(lista);
    })();
    return () => {
      vivo = false;
    };
  }, [actual, en]);

  async function cambiar(slug: string) {
    setOcupado(true);
    setAviso(null);
    try {
      const r = await cerrarFichas(createClient(), slug);
      window.dispatchEvent(new CustomEvent("prodigia:chispas", { detail: r.puntos_total }));
      setPendientes((antes) => antes.filter((p) => p.slug !== slug));
    } catch (e) {
      setAviso(mensajeErrorEvento(e));
    } finally {
      setOcupado(false);
    }
  }

  if (!pendientes.length && !aviso) return null;
  return (
    <div className="flex flex-col gap-3">
      {pendientes.map((p) => {
        const chispas = (p.saldo * CHISPAS_POR_FICHA).toLocaleString();
        return (
          <section key={p.slug} className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-[#05060F] bg-[#0B1022] p-4 text-white shadow-[3px_3px_0_0_#05060F]">
            <DibujoTema dibujo={PARTICULAS[p.ficha.dibujo]} className="h-10 w-10" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-bold">{t("titulo", { n: p.saldo, ficha: en ? p.ficha.nombreEn : p.ficha.nombre, evento: p.evento })}</p>
              <p className="text-xs text-white/60">{t("texto", { chispas })}</p>
            </div>
            <button type="button" disabled={ocupado} onClick={() => cambiar(p.slug)} className="rounded-xl border-2 border-[#05060F] bg-[#FFC53D] px-4 py-2 font-display text-sm font-bold text-[#1A1206] shadow-[3px_3px_0_0_#05060F] disabled:opacity-60">
              {t("boton", { chispas })}
            </button>
          </section>
        );
      })}
      {aviso && <p className="text-sm font-semibold text-error">{aviso}</p>}
    </div>
  );
}
