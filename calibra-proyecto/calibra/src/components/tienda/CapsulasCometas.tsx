"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import IconoCometa from "@/components/IconoCometa";
import { Link } from "@/i18n/navigation";
import AbrirCapsula from "@/components/recompensas/AbrirCapsula";
import CapsulasSinVer from "@/components/recompensas/CapsulasSinVer";
import { DibujoCapsula } from "@/components/recompensas/DibujoCapsula";
import { createClient } from "@/lib/supabase/client";
import { comprarCapsulaConCometas, contenidoCapsula, mensajeError, type Capsula, type ContenidoCapsula } from "@/lib/recompensas/api";
import { CAPSULAS, CAPSULAS_CON_COMETAS, COLOR_RAREZA, type Rareza } from "@/lib/recompensas/catalogo";

// Cápsulas premium (0287): solo se compran con Cometas. Dos modalidades (pedido
// 2026-10-15): «Abrir ya», con la animación al momento, o «Guardar», que la deja en
// Recompensas para abrirla cuando quieras, como las demás. Las probabilidades se ven
// antes de pagar.
export default function CapsulasCometas() {
  const t = useTranslations("CapsulasCometas");
  const tNombre = useTranslations("Recompensas.capsulas.nombres");
  const tRareza = useTranslations("Recompensas.tienda.rareza");
  const [contenido, setContenido] = useState<Record<string, ContenidoCapsula[]>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardada, setGuardada] = useState<string | null>(null);
  const [abriendo, setAbriendo] = useState<Capsula | null>(null);

  useEffect(() => {
    const sb = createClient();
    Promise.all(CAPSULAS_CON_COMETAS.map(async (c) => [c.tipo, await contenidoCapsula(sb, c.tipo)] as const)).then((filas) => setContenido(Object.fromEntries(filas)));
  }, []);

  async function comprar(tipo: "estelar" | "supernova", abrirYa: boolean) {
    setOcupado(tipo);
    setError(null);
    setGuardada(null);
    try {
      const r = await comprarCapsulaConCometas(createClient(), tipo);
      window.dispatchEvent(new CustomEvent("prodigia:cometas", { detail: r.cometas }));
      if (abrirYa) setAbriendo({ id: r.id, tipo, mundo: null, detalle: null, creada_at: new Date().toISOString() });
      else setGuardada(tNombre(tipo));
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(null);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-3xl border-2 border-[#05060F] bg-[#0B1022] p-5 text-white shadow-[6px_6px_0_0_#05060F] sm:p-6">
      <div>
        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#B07CFF]">{t("eyebrow")}</span>
        <h2 className="font-display text-2xl font-bold">{t("titulo")}</h2>
        <p className="mt-1 text-sm text-white/70">{t("texto")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {CAPSULAS_CON_COMETAS.map((c) => {
          const filas = contenido[c.tipo] ?? [];
          const total = filas.reduce((a, f) => a + f.peso, 0);
          return (
            <div key={c.tipo} className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.04] p-4">
              <DibujoCapsula colores={CAPSULAS[c.tipo].colores} tam={92} />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="font-display text-lg font-bold">{tNombre(c.tipo)}</span>
                <ul className="flex flex-col gap-0.5 text-xs">
                  {filas.map((f) => {
                    const rareza = f.premio.replace("cosmetico_", "") as Rareza;
                    return (
                      <li key={f.premio} className="flex justify-between gap-2">
                        <span style={{ color: COLOR_RAREZA[rareza] }}>{tRareza(rareza)}</span>
                        <span className="font-mono text-white/70">{total ? Math.round((f.peso / total) * 100) : 0} %</span>
                      </li>
                    );
                  })}
                </ul>
                <span className="flex items-center gap-1 font-mono text-sm font-bold">
                  <IconoCometa className="h-4 w-4" /> {c.costo}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={ocupado !== null}
                    onClick={() => comprar(c.tipo, true)}
                    className="rounded-xl border-2 border-[#05060F] bg-[#5DE4FF] px-3 py-2 font-display text-sm font-bold text-[#04121A] shadow-[3px_3px_0_0_#05060F] transition-all enabled:hover:translate-x-[1px] enabled:hover:translate-y-[1px] enabled:hover:shadow-[2px_2px_0_0_#05060F] disabled:opacity-60"
                  >
                    {ocupado === c.tipo ? t("comprando") : t("abrirYa")}
                  </button>
                  <button
                    type="button"
                    disabled={ocupado !== null}
                    onClick={() => comprar(c.tipo, false)}
                    className="rounded-xl border-2 border-white/30 px-3 py-2 font-display text-sm font-bold text-white transition-colors enabled:hover:border-white/60 disabled:opacity-60"
                  >
                    {t("guardar")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {error && <p className="text-sm font-semibold text-[#FF8A8A]">{error}</p>}
      {/* «Abrir ya»: la escena va en un portal a pantalla completa (RevelacionWeb). */}
      {abriendo && (
        <AbrirCapsula
          capsula={abriendo}
          onCerrar={(abierta) => {
            // Cerrada sin tocarla: quedó guardada en Recompensas, como «Guardar».
            if (!abierta) setGuardada(tNombre(abriendo.tipo));
            setAbriendo(null);
          }}
        />
      )}
      <CapsulasSinVer pausado={!!abriendo} />
      {guardada && (
        <p className="text-sm font-semibold text-[#3DDC97]">
          {t("guardada", { nombre: guardada })}{" "}
          <Link href="/recompensas" className="underline">
            {t("irRecompensas")}
          </Link>
        </p>
      )}
    </section>
  );
}
