"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { reproducirTono } from "@/lib/sonido";
import { faltaPara } from "@/lib/temas/eventos";
import {
  alturaSol,
  CHISPAS_COMUNIDAD,
  estadoAlineacionServidor,
  mensajeErrorAlineacion,
  momentoAlineacion,
  PARTIDAS_PARA_CAPSULA,
  reclamarPremioComunidad,
  SOLES,
  type EstadoAlineacionServidor,
} from "@/lib/recompensas/alineacion";
import { repetirVideo } from "@/components/VideoApertura";
import { relojEventos } from "@/components/temas/relojEventos";
import { VIDEO_ALINEACION } from "@/lib/temas/videosApertura";
import CartelPlegable, { faltaCorto } from "@/components/temas/CartelPlegable";

// Cartel de la Gran Alineación en el Inicio (decisiones del 2026-10-18): desde 3 días
// antes con la cuenta regresiva, durante las 3 horas con tu avance y la meta de
// comunidad, y 3 días después con el resumen y el premio de comunidad. Los 15 soles
// están a la altura real de su día en cada ciudad: se ve cómo se van alineando.
// Empieza minimizado en una franja (CartelPlegable) que avisa si hay premio por reclamar.
function suscribir(avisar: () => void) {
  const id = setInterval(avisar, 15_000);
  // Eventos en vivo: además, en el instante exacto de cada cambio de fase.
  const soltar = relojEventos.suscribir(avisar);
  return () => {
    clearInterval(id);
    soltar();
  };
}
const ahoraRedondeado = () => Math.floor(Date.now() / 15_000) * 15_000;
const sinHora = () => 0;

const ORO = "#F2C14E";
const MARFIL = "#F6EFE2";

function Soles({ ahora, alineados }: { ahora: number; alineados: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28" aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-7" style={{ background: `linear-gradient(180deg, ${alineados ? "rgba(255,182,39,0.45)" : "rgba(124,92,255,0.16)"}, transparent)` }} />
      <div className="absolute inset-x-0 bottom-7 h-px" style={{ background: alineados ? `linear-gradient(90deg, transparent, ${ORO}, transparent)` : "rgba(255,255,255,0.16)" }} />
      {SOLES.map((s, i) => {
        const x = 5 + (i * 90) / (SOLES.length - 1);
        const h = alineados ? 0 : alturaSol(s.slug, ahora);
        const tam = alineados ? 9 : 7;
        return (
          <span
            key={s.slug}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              bottom: 28 + h * 62 - tam / 2,
              width: tam,
              height: tam,
              marginLeft: -tam / 2,
              background: s.color,
              boxShadow: `0 0 ${alineados ? 14 : 9}px ${alineados ? 4 : 2}px ${s.color}66`,
              opacity: h < -0.25 ? 0.12 : h < 0 ? 0.35 : 1,
            }}
          />
        );
      })}
    </div>
  );
}

export default function CartelAlineacion({ invitado = false }: { invitado?: boolean }) {
  const t = useTranslations("Alineacion");
  const tc = useTranslations("Carteles");
  const locale = useLocale();
  const ahora = useSyncExternalStore(suscribir, ahoraRedondeado, sinHora);
  const [estado, setEstado] = useState<EstadoAlineacionServidor | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const m = ahora ? momentoAlineacion(ahora) : null;
  const visible = !!m && m.momento !== "nada";

  const cargar = useCallback(async () => {
    if (invitado) return;
    setEstado(await estadoAlineacionServidor(createClient()));
  }, [invitado]);

  useEffect(() => {
    if (!visible) return;
    // Estado de la base (sistema externo): avance, premios y meta de comunidad.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
    const id = setInterval(() => void cargar(), 60_000);
    return () => clearInterval(id);
  }, [visible, cargar]);

  if (!m || !visible) return null;
  const durante = m.momento === "durante";
  const despues = m.momento === "despues";
  const fecha = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }).format(new Date(m.inicio));
  const partidas = estado?.partidas ?? 0;

  async function reclamar() {
    setOcupado(true);
    setAviso(null);
    try {
      const r = await reclamarPremioComunidad(createClient());
      window.dispatchEvent(new CustomEvent("prodigia:chispas", { detail: r.puntos_total }));
      reproducirTono("logro");
      await cargar();
    } catch (e) {
      setAviso(mensajeErrorAlineacion(e));
    } finally {
      setOcupado(false);
    }
  }

  const pendiente = !invitado && (durante || despues) && !!estado && !estado.premio_comunidad;
  return (
    <CartelPlegable
      id={`alineacion-${m.numero}`}
      franja={{
        icono: <SolesMini alineados={durante || despues} />,
        eyebrow: t("eyebrow", { n: m.numero }),
        titulo: t("titulo"),
        detalle: durante ? tc("quedan", { tiempo: faltaCorto(faltaPara(m.fin, ahora)) }) : despues ? tc("terminada") : tc("empiezaEn", { tiempo: faltaCorto(faltaPara(m.inicio, ahora)) }),
        acento: ORO,
        fondo: durante ? "radial-gradient(120% 220% at 50% 130%, #6b3c0e 0%, #2a1631 45%, #0a0b16 80%)" : "linear-gradient(100deg, #12122a 0%, #07080d 80%)",
        borde: durante ? `${ORO}aa` : "#05060F",
        sombra: durante ? "0 0 26px -6px rgba(242,193,78,0.5), 4px 4px 0 0 #05060F" : undefined,
        pendiente: pendiente ? tc("premio") : null,
      }}
    >
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border text-white"
        style={{
          borderColor: durante ? `${ORO}aa` : "rgba(255,255,255,0.12)",
          background: durante ? "radial-gradient(120% 90% at 50% 105%, #6b3c0e 0%, #2a1631 38%, #0a0b16 72%)" : "linear-gradient(170deg, #12122a 0%, #07080d 75%)",
          boxShadow: durante ? "0 0 40px -10px rgba(242,193,78,0.45)" : undefined,
        }}
      >
        <Soles ahora={ahora} alineados={durante || despues} />
        <div className="relative flex flex-col gap-4 p-5 pb-28">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.28em]" style={{ color: ORO }}>
              {t("eyebrow", { n: m.numero })}
            </span>
            <h2 className="font-display text-3xl font-black leading-none tracking-tight" style={{ color: MARFIL }}>
              {t("titulo")}
            </h2>
            <p className="text-sm text-white/70">
              {durante ? t("durante", { tiempo: faltaPara(m.fin, ahora) }) : despues ? t("despues") : t("antes", { tiempo: faltaPara(m.inicio, ahora) })}
            </p>
            {!despues && (
              <p className="text-xs font-semibold tracking-wide" style={{ color: `${MARFIL}cc` }}>
                {t("bonos")} <span className="text-white/40">·</span> <span className="text-white/55">{t("cuando", { fecha })}</span>
              </p>
            )}
          </div>

          {invitado ? (
            <p className="text-sm text-white/70">{t("invitado")}</p>
          ) : (
            <>
              {despues && (
                <p className="font-mono text-sm font-bold" style={{ color: MARFIL }}>
                  {partidas > 0 ? t("resumen", { partidas, xp: estado?.xp ?? 0, chispas: estado?.chispas ?? 0 }) : t("sinJugar")}
                </p>
              )}
              <div className="grid gap-2 sm:grid-cols-3">
                <Premio titulo={t("sello", { n: m.numero })} como={t("selloComo")} hecho={!!estado?.sello} etiquetaHecho={t("ganado")} progreso={Math.min(1, partidas)} />
                <Premio
                  titulo={t("capsula")}
                  como={durante ? t("partidas", { n: Math.min(partidas, PARTIDAS_PARA_CAPSULA), total: PARTIDAS_PARA_CAPSULA }) : t("capsulaComo", { n: PARTIDAS_PARA_CAPSULA })}
                  hecho={!!estado?.capsula}
                  etiquetaHecho={t("ganado")}
                  progreso={Math.min(1, partidas / PARTIDAS_PARA_CAPSULA)}
                />
                <div className="flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/55">{t("comunidad")}</span>
                  <span className="text-xs text-white/75">{t("comunidadComo", { n: CHISPAS_COMUNIDAD })}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {durante && (
                  <Link href="/practica" className="rounded-xl border-2 border-[#05060F] px-5 py-2.5 font-display text-sm font-bold text-[#1A1206] shadow-[3px_3px_0_0_#05060F] transition-transform hover:-translate-y-0.5" style={{ background: `linear-gradient(180deg, #FFE08A, ${ORO})` }}>
                    {t("jugar")}
                  </Link>
                )}
                {(durante || despues) && estado && (
                  <button
                    type="button"
                    onClick={reclamar}
                    disabled={ocupado || estado.premio_comunidad}
                    className="rounded-xl border-2 border-[#05060F] bg-white px-5 py-2.5 font-display text-sm font-bold text-[#05060F] shadow-[3px_3px_0_0_#05060F] disabled:opacity-60"
                  >
                    {estado.premio_comunidad ? t("reclamado") : t("reclamar", { n: CHISPAS_COMUNIDAD })}
                  </button>
                )}
              </div>
              {aviso && <p className="text-sm font-semibold text-error">{aviso}</p>}
            </>
          )}
          {(durante || despues) && (
            <button type="button" onClick={() => repetirVideo(VIDEO_ALINEACION)} className="self-start text-sm font-bold hover:underline" style={{ color: ORO }}>
              ▶ {t("verVideo")}
            </button>
          )}
        </div>
      </motion.section>
    </CartelPlegable>
  );
}

// Los 15 soles en fila para la franja minimizada: alineados durante y después.
function SolesMini({ alineados }: { alineados: boolean }) {
  return (
    <span className="relative block h-8 w-9" aria-hidden="true">
      <span className="absolute inset-x-0 top-1/2 h-px" style={{ background: alineados ? ORO : "rgba(255,255,255,0.2)" }} />
      {SOLES.map((s, i) => (
        <span
          key={s.slug}
          className="absolute h-[4px] w-[4px] rounded-full"
          style={{ left: `${4 + (i * 92) / (SOLES.length - 1)}%`, top: `calc(50% - 2px + ${alineados ? 0 : Math.round(Math.sin(i * 1.7) * 9)}px)`, marginLeft: -2, background: s.color, boxShadow: `0 0 5px ${s.color}` }}
        />
      ))}
    </span>
  );
}

function Premio({ titulo, como, hecho, etiquetaHecho, progreso }: { titulo: string; como: string; hecho: boolean; etiquetaHecho: string; progreso: number }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border p-3" style={{ borderColor: hecho ? `${ORO}88` : "rgba(255,255,255,0.1)", background: hecho ? "rgba(242,193,78,0.08)" : "rgba(255,255,255,0.04)" }}>
      <span className="text-sm font-bold" style={{ color: MARFIL }}>
        {titulo}
      </span>
      <span className="text-xs text-white/65">{hecho ? etiquetaHecho : como}</span>
      <div className="h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${(hecho ? 1 : progreso) * 100}%`, background: ORO }} />
      </div>
    </div>
  );
}
