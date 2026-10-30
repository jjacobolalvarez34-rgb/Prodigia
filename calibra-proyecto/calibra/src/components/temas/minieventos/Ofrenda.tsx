"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import DibujoTema from "@/components/temas/DibujoTema";
import { createClient } from "@/lib/supabase/client";
import { COLECCIONES, slugEvento } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import {
  diaUtc,
  escenaOfrenda,
  FICHAS_POR_VELA,
  mensajeErrorMinievento,
  ordenOpcionesOfrenda,
  preguntaOfrendaDe,
  responderOfrenda,
  respuestasOfrenda,
  type RespuestaOfrenda,
} from "@/lib/temas/minieventos";
import type { TemaActivo } from "@/lib/temas/temas";

// Día de Muertos · «La ofrenda» (0309): una pregunta de Historia por día sobre alguien
// que ya no está; acertarla enciende una vela de tu ofrenda y da Fichas.
export default function Ofrenda({ tema }: { tema: TemaActivo }) {
  const t = useTranslations("Minieventos");
  const en = useLocale() === "en";
  const hoy = diaUtc();
  const { desde, hasta } = tema.hoy.rango;
  const slug = slugEvento("muertos", desde);
  const ficha = COLECCIONES.muertos!.ficha;
  const nombreFicha = en ? ficha.nombreEn : ficha.nombre;
  const dias = useMemo(() => {
    const lista: string[] = [];
    for (let d = Date.parse(`${desde}T00:00:00Z`); d <= Date.parse(`${hasta}T00:00:00Z`); d += 86_400_000) lista.push(new Date(d).toISOString().slice(0, 10));
    return lista;
  }, [desde, hasta]);
  const { pregunta } = preguntaOfrendaDe(hoy);
  const orden = ordenOpcionesOfrenda(hoy);
  const [respuestas, setRespuestas] = useState<RespuestaOfrenda[] | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setRespuestas((await respuestasOfrenda(createClient(), slug)) ?? []);
  }, [slug]);

  useEffect(() => {
    // Lo que ya respondiste (sistema externo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  const deHoy = respuestas?.find((r) => r.dia === hoy) ?? null;
  const velas = dias.map((d) => !!respuestas?.find((r) => r.dia === d && r.acierto));
  const encendidas = velas.filter(Boolean).length;
  const opciones = en ? pregunta.opcionesEn : pregunta.opciones;

  async function responder(opcion: number) {
    setOcupado(true);
    setError(null);
    try {
      const r = await responderOfrenda(createClient(), opcion);
      setRespuestas((antes) => [...(antes ?? []), { dia: hoy, opcion, acierto: r.acierto }]);
    } catch (e) {
      setError(mensajeErrorMinievento(e, en));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#120720]">
        <DibujoTema dibujo={escenaOfrenda(velas)} className="block h-auto w-full" />
        <span className="absolute bottom-2 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[11px] font-bold text-[#FFE08A]">
          <DibujoTema dibujo={PARTICULAS.vela} className="h-4 w-4" />
          {t("ofrenda.velas", { n: encendidas, total: dias.length })}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF9F1C]">
          {pregunta.personaje} · {pregunta.vida}
        </p>
        <p className="font-display text-base font-bold text-foreground">{en ? pregunta.preguntaEn : pregunta.pregunta}</p>
      </div>

      {respuestas === null ? (
        <p className="text-sm text-texto-secundario">…</p>
      ) : deHoy ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1.5 rounded-xl border px-4 py-3" style={{ borderColor: deHoy.acierto ? "#FF9F1C88" : "#ffffff22", background: deHoy.acierto ? "#FF9F1C14" : "transparent" }}>
          <p className="text-sm font-bold" style={{ color: deHoy.acierto ? "#FFB627" : undefined }}>
            {deHoy.acierto ? t("ofrenda.acierto", { fichas: FICHAS_POR_VELA, ficha: nombreFicha }) : t("ofrenda.fallo")}
          </p>
          {!deHoy.acierto && <p className="text-sm text-foreground">{t("ofrenda.respuesta", { texto: opciones[0] })}</p>}
          <p className="text-sm text-texto-secundario">{en ? pregunta.datoEn : pregunta.dato}</p>
          <p className="text-xs text-texto-secundario">{hoy >= hasta ? t("ofrenda.ultima") : t("ofrenda.manana")}</p>
        </motion.div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {orden.map((i) => (
            <button
              key={i}
              type="button"
              disabled={ocupado}
              onClick={() => responder(i)}
              className="rounded-xl border-2 border-[#05060F] bg-[#1A0B2E] px-3 py-2.5 text-left text-sm font-semibold text-white shadow-[2px_2px_0_0_#05060F] transition hover:bg-[#2A1240] disabled:opacity-60"
            >
              {opciones[i]}
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-sm font-semibold text-error">{error}</p>}
    </div>
  );
}
