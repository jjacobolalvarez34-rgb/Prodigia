"use client";

import { useCallback, useEffect, useState } from "react";
import { repetirVideo } from "@/components/VideoApertura";
import { VIDEO_DE_TEMA } from "@/lib/temas/videosApertura";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import IconoCometa from "@/components/IconoCometa";
import DibujoTema from "@/components/temas/DibujoTema";
import EscenaTema from "@/components/temas/EscenaTema";
import { useTemaHoy } from "@/components/temas/useTemaHoy";
import VistaCosmetico from "@/components/recompensas/VistaCosmetico";
import { createClient } from "@/lib/supabase/client";
import { COLOR_RAREZA } from "@/lib/recompensas/catalogo";
import { refrescarCosmeticosWeb } from "@/lib/recompensas/cosmeticosWeb";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { CHISPAS_POR_FICHA, EXP_POR_FICHA, FICHAS_MAX_DIA } from "@/lib/temas/colecciones";
import { canjearPieza, cerrarFichas, estadoEvento, eventoDeTema, faltaHasta, faltaPara, mensajeErrorEvento, type EstadoEvento } from "@/lib/temas/eventos";

// Página del evento de la festividad (docs/eventos/PLAN_FESTIVIDADES.md capas 7 y 8):
// cuántas Fichas llevas y cómo se ganan, la colección para elegir qué llevarte (con
// Fichas o con Cometas) y, al terminar, cambiar las que sobran por Chispas.
export default function EventoClient({ invitado }: { invitado: boolean }) {
  const t = useTranslations("Evento");
  const tRareza = useTranslations("Recompensas.tienda.rareza");
  const locale = useLocale();
  const en = locale === "en";
  const tema = useTemaHoy();
  const evento = eventoDeTema(tema);
  const [estado, setEstado] = useState<EstadoEvento | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; error: boolean } | null>(null);
  const [ahora, setAhora] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    if (!evento || invitado) return;
    setEstado(await estadoEvento(createClient(), evento.slug));
  }, [evento?.slug, invitado]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Estado del evento desde la base (sistema externo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);
  useEffect(() => {
    const tic = () => setAhora(Date.now());
    tic();
    const id = setInterval(tic, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!tema) return <p className="mx-auto max-w-md px-4 py-16 text-center text-texto-secundario">{t("sinEvento")}</p>;
  if (!evento) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="font-display text-2xl font-bold">{en ? tema.tema.nombreEn : tema.tema.nombre}</p>
        <p className="text-texto-secundario">{en ? tema.tema.frase.eventoEn : tema.tema.frase.evento}</p>
      </div>
    );
  }
  const ficha = PARTICULAS[evento.coleccion.ficha.dibujo];
  const nombreFicha = en ? evento.coleccion.ficha.nombreEn : evento.coleccion.ficha.nombre;
  const abierto = evento.estado === "abierto";

  async function canjear(item: string, conCometas: boolean) {
    if (!evento) return;
    setOcupado(item + conCometas);
    setAviso(null);
    try {
      const r = await canjearPieza(createClient(), evento.slug, item, conCometas);
      window.dispatchEvent(new CustomEvent("prodigia:cometas", { detail: r.cometas }));
      refrescarCosmeticosWeb();
      setAviso({ texto: t("tuya"), error: false });
      await cargar();
    } catch (e) {
      setAviso({ texto: mensajeErrorEvento(e), error: true });
    } finally {
      setOcupado(null);
    }
  }

  async function cerrar() {
    if (!evento) return;
    setOcupado("cerrar");
    try {
      const r = await cerrarFichas(createClient(), evento.slug);
      window.dispatchEvent(new CustomEvent("prodigia:chispas", { detail: r.puntos_total }));
      await cargar();
    } catch (e) {
      setAviso({ texto: mensajeErrorEvento(e), error: true });
    } finally {
      setOcupado(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      {/* Portada del evento */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-[#05060F] text-white shadow-[6px_6px_0_0_#05060F]">
        <EscenaTema tema={tema.tema} className="absolute inset-0" />
        <div className="relative flex min-h-[200px] flex-col justify-end gap-2 bg-gradient-to-t from-[#05060F]/90 via-[#05060F]/40 to-transparent p-6">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.25em]" style={{ color: tema.tema.acento }}>
            {evento.estado === "proximo" ? t("seAcerca") : t("evento")}
          </span>
          <h1 className="font-display text-4xl font-black leading-none tracking-tight">{en ? tema.tema.nombreEn : tema.tema.nombre}</h1>
          <p className="max-w-lg text-sm text-white/80">{en ? tema.tema.frase.eventoEn : tema.tema.frase.evento}</p>
          {ahora != null && (
            <span className="w-fit rounded-full bg-white/10 px-3 py-1 font-mono text-xs font-bold tabular-nums">
              {evento.estado === "proximo"
                ? t("empiezaEn", { tiempo: faltaPara(evento.inicioMs, ahora) })
                : evento.estado === "abierto"
                  ? t("terminaEn", { tiempo: faltaHasta(evento.hasta, ahora) })
                  : t("terminado")}
            </span>
          )}
          {evento.estado !== "proximo" && VIDEO_DE_TEMA[tema.tema.id] && (
            <button type="button" onClick={() => repetirVideo(VIDEO_DE_TEMA[tema.tema.id])} className="w-fit text-sm font-bold hover:underline" style={{ color: tema.tema.acento }}>
              ▶ {t("verVideo")}
            </button>
          )}
        </div>
      </div>

      {invitado ? (
        <p className="rounded-2xl border border-border bg-surface px-5 py-4 text-sm text-texto-secundario">{t("invitado")}</p>
      ) : (
        <>
          {/* Fichas */}
          <section className="flex flex-wrap items-center gap-5 rounded-3xl border-2 border-[#05060F] bg-[#0B1022] p-5 text-white shadow-[4px_4px_0_0_#05060F]">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: `${tema.tema.acento}22` }}>
              <DibujoTema dibujo={ficha} className="h-11 w-11" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest" style={{ color: tema.tema.acento }}>
                {t("tusFichas", { ficha: nombreFicha })}
              </p>
              <p className="font-display text-4xl font-black tabular-nums">{estado?.saldo ?? "…"}</p>
              <p className="text-xs text-white/60">{t("comoSeGanan", { exp: EXP_POR_FICHA, max: FICHAS_MAX_DIA, ficha: nombreFicha })}</p>
            </div>
            {evento.estado === "cierre" && estado && !estado.cerrado && estado.saldo > 0 && (
              <button type="button" onClick={cerrar} disabled={ocupado !== null} className="rounded-xl border-2 border-[#05060F] bg-[#FFC53D] px-4 py-2 font-display text-sm font-bold text-[#1A1206] shadow-[3px_3px_0_0_#05060F] disabled:opacity-60">
                {t("cambiarFichas", { chispas: (estado.saldo * CHISPAS_POR_FICHA).toLocaleString() })}
              </button>
            )}
            {estado?.cerrado && <p className="text-sm font-semibold text-[#3DDC97]">{t("cambiadas", { chispas: estado.chispas_cierre.toLocaleString() })}</p>}
          </section>

          {aviso && <p className={`text-sm font-semibold ${aviso.error ? "text-error" : "text-correcto"}`}>{aviso.texto}</p>}

          {/* Colección */}
          <section className="flex flex-col gap-3">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-xl font-bold">{t("coleccion")}</h2>
              <span className="text-sm text-texto-secundario">
                {estado?.piezas.length ?? 0}/{evento.coleccion.piezas.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {evento.coleccion.piezas.map((p, i) => {
                const tuya = estado?.piezas.includes(p.item);
                const alcanza = (estado?.saldo ?? 0) >= p.fichas;
                return (
                  <motion.div
                    key={p.item}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center gap-2 rounded-2xl border-2 bg-surface p-4 text-center"
                    style={{ borderColor: tuya ? "var(--correcto)" : `${COLOR_RAREZA[p.rareza]}88` }}
                  >
                    <span className="flex h-20 items-center justify-center">
                      <VistaCosmetico categoria={p.categoria} valor={p.valor} tam={64} />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLOR_RAREZA[p.rareza] }}>
                      {tRareza(p.rareza)}
                    </span>
                    <span className="min-h-[2.5rem] text-sm font-bold text-foreground">{p.nombre}</span>
                    {tuya ? (
                      <span className="text-sm font-bold text-correcto">{t("tuya")}</span>
                    ) : (
                      <div className="flex w-full flex-col gap-1.5">
                        <button
                          type="button"
                          disabled={!abierto || !alcanza || ocupado !== null}
                          onClick={() => canjear(p.item, false)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#05060F] px-3 py-2 font-display text-sm font-bold text-[#05060F] shadow-[2px_2px_0_0_#05060F] disabled:opacity-45"
                          style={{ background: tema.tema.acento }}
                        >
                          <DibujoTema dibujo={ficha} className="h-4 w-4" />
                          {p.fichas}
                        </button>
                        <button
                          type="button"
                          disabled={evento.estado === "proximo" || ocupado !== null}
                          onClick={() => canjear(p.item, true)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 px-3 py-1.5 text-xs font-bold text-foreground disabled:opacity-45"
                        >
                          <IconoCometa className="h-3.5 w-3.5" /> {p.cometas}
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <p className="text-xs text-texto-secundario">{t("nota", { ficha: nombreFicha, chispas: CHISPAS_POR_FICHA })}</p>
            <Link href="/tienda" className="w-fit text-sm font-semibold text-primario hover:underline">
              {t("irTienda")}
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
