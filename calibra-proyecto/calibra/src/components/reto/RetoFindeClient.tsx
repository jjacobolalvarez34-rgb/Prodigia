"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import Boton from "@/components/Boton";
import Avatar from "@/components/Avatar";
import IconoCometa from "@/components/IconoCometa";
import { createClient } from "@/lib/supabase/client";
import { reproducirTono } from "@/lib/sonido";
import { useRegistrarGuardiaSalida } from "@/lib/navegacion/guardiaSalida";
import type { MundoRetoDiario, PreguntaRetoDiario } from "@/lib/retoDiario";
import { chispasRetoFinde, ciudadesRetoFinde, INTENTOS_RETO_FINDE, MINIMO_ACIERTOS_PREMIO, msHastaCambioFinde, PREMIOS_RETO_FINDE } from "@/lib/retoFinde";
import { COLOR_MUNDO_RETO, TarjetaPreguntaReto } from "./RetoClient";

export interface IntentoFinde {
  intento: number;
  correctos: number | null;
  tiempo_ms: number | null;
  terminado_at: string | null;
}

export interface FilaRankingFinde {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  correctos: number;
  tiempo_ms: number;
  puesto: number;
}

interface Resultado {
  correctos: number;
  tiempo_ms: number;
  chispas: number;
  mejor_correctos: number;
  mejor_tiempo_ms: number;
  puesto: number;
}

type Fase = "intro" | "jugando" | "resumen";

const segundos = (ms: number | null | undefined) => (ms == null ? "—" : `${(ms / 1000).toFixed(1)} s`);

function textoFalta(ms: number) {
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(h / 24);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return d > 0 ? `${d} d ${h % 24} h` : `${h} h ${m} min`;
}

export default function RetoFindeClient({
  sabado,
  proximo,
  preguntas,
  intentosIniciales,
  rankingInicial,
  miUserId,
  premio,
}: {
  // null de lunes a viernes.
  sabado: string | null;
  proximo: string;
  preguntas: PreguntaRetoDiario[];
  intentosIniciales: IntentoFinde[];
  rankingInicial: FilaRankingFinde[];
  miUserId: string;
  // Cometas del finde pasado, si recién se pagaron.
  premio: { puesto: number; cometas: number } | null;
}) {
  const t = useTranslations("RetoFinde");
  const tMundos = useTranslations("Reto.mundos");
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("intro");
  const [intentos, setIntentos] = useState(intentosIniciales);
  const [ranking, setRanking] = useState(rankingInicial);
  const [indice, setIndice] = useState(0);
  const [correctos, setCorrectos] = useState(0);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [inicio, setInicio] = useState<number | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useRegistrarGuardiaSalida({ activo: fase === "jugando" });

  // Reloj: el del intento mientras se juega; si no, la cuenta hasta el cambio de finde.
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), fase === "jugando" ? 100 : 30_000);
    return () => clearInterval(id);
  }, [fase]);

  const ciudades: MundoRetoDiario[] = ciudadesRetoFinde(sabado ?? proximo);
  const terminados = intentos.filter((i) => i.terminado_at);
  const quedan = INTENTOS_RETO_FINDE - terminados.length;
  const mejor = terminados.reduce<IntentoFinde | null>(
    (a, b) => (!a || (b.correctos ?? 0) > (a.correctos ?? 0) || ((b.correctos ?? 0) === (a.correctos ?? 0) && (b.tiempo_ms ?? 0) < (a.tiempo_ms ?? 0)) ? b : a),
    null
  );
  const total = preguntas.length;
  const pregunta = preguntas[indice];

  async function empezar() {
    setOcupado(true);
    setError(null);
    const { data, error: e } = await createClient().rpc("iniciar_reto_finde");
    setOcupado(false);
    if (e) {
      setError(e.message);
      return;
    }
    const fila = (data as { intento: number; iniciado_at: string }[])[0];
    // Si quedó un intento abierto, el reloj sigue desde cuando empezó (lo cuenta la base).
    setInicio(Date.parse(fila.iniciado_at) || Date.now());
    setIntentos((xs) => (xs.some((x) => x.intento === fila.intento) ? xs : [...xs, { intento: fila.intento, correctos: null, tiempo_ms: null, terminado_at: null }]));
    setIndice(0);
    setCorrectos(0);
    setSeleccion(null);
    setFeedback("idle");
    setResultado(null);
    setFase("jugando");
  }

  async function terminar(totalCorrectos: number) {
    setOcupado(true);
    const sb = createClient();
    const { data, error: e } = await sb.rpc("terminar_reto_finde", { p_correctos: totalCorrectos });
    if (e) {
      setOcupado(false);
      setError(e.message);
      setFase("intro");
      return;
    }
    const fila = (data as (Resultado & { intento: number; puntos_total: number })[])[0];
    setResultado(fila);
    setIntentos((xs) => xs.map((x) => (x.intento === fila.intento ? { ...x, correctos: fila.correctos, tiempo_ms: fila.tiempo_ms, terminado_at: new Date().toISOString() } : x)));
    if (fila.chispas > 0) window.dispatchEvent(new CustomEvent("prodigia:chispas", { detail: fila.puntos_total }));
    const { data: r } = await sb.rpc("ranking_reto_finde", { p_sabado: sabado });
    setRanking((r ?? []) as FilaRankingFinde[]);
    setOcupado(false);
    reproducirTono("logro");
    setFase("resumen");
  }

  function elegir(opcion: string) {
    if (feedback !== "idle" || !pregunta) return;
    const bien = opcion === pregunta.respuesta;
    setSeleccion(opcion);
    setFeedback(bien ? "correcto" : "incorrecto");
    reproducirTono(bien ? "correcto" : "error");
    const nuevos = bien ? correctos + 1 : correctos;
    setCorrectos(nuevos);
    setTimeout(() => {
      if (indice + 1 >= total) {
        terminar(nuevos);
      } else {
        setIndice(indice + 1);
        setSeleccion(null);
        setFeedback("idle");
      }
    }, bien ? 350 : 700);
  }

  const tablaPremios = (
    <div className="grid grid-cols-2 gap-2 text-left text-sm sm:grid-cols-4">
      {PREMIOS_RETO_FINDE.map((p, i) => (
        <div key={p.hasta} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface-2 px-2 py-2">
          <span className="text-[11px] font-bold uppercase text-texto-secundario">
            {i === 0 ? t("puesto1") : t("puestoHasta", { n: p.hasta })}
          </span>
          <span className="flex items-center gap-1 font-mono font-bold text-foreground">
            <IconoCometa className="h-4 w-4" /> {p.cometas}
          </span>
        </div>
      ))}
    </div>
  );

  const listaRanking = ranking.length > 0 && (
    <div className="w-full rounded-2xl border border-border bg-surface px-4 py-4 text-left">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-texto-secundario">{sabado ? t("rankingActual") : t("rankingPasado")}</p>
      <ol className="flex flex-col gap-1.5">
        {ranking.slice(0, 20).map((f) => (
          <li key={f.user_id} className={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-sm ${f.user_id === miUserId ? "bg-primario/10" : ""}`}>
            <span className="w-6 shrink-0 text-center font-mono text-xs text-texto-secundario">{f.puesto}</span>
            <Avatar url={f.avatar_url} nombre={f.display_name} size={24} />
            <span className="flex-1 truncate font-medium text-foreground">{f.display_name ?? "—"}</span>
            <span className="shrink-0 font-mono text-xs text-foreground">{f.correctos}/10</span>
            <span className="w-14 shrink-0 text-right font-mono text-xs text-texto-secundario">{segundos(f.tiempo_ms)}</span>
          </li>
        ))}
      </ol>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 px-4 py-12">
      {premio && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#5DE4FF]/50 bg-[#5DE4FF]/10 px-4 py-3 text-sm font-semibold text-foreground">
          <IconoCometa className="h-8 w-8 shrink-0" />
          {t("premioCobrado", { puesto: premio.puesto, cometas: premio.cometas })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {fase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5 text-center">
            <div>
              <span className="rounded-full bg-logro/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-logro">{t("etiqueta")}</span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
              <p className="mt-2 text-sm text-texto-secundario">{t("reglas", { chispas: chispasRetoFinde(10), minimo: MINIMO_ACIERTOS_PREMIO })}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {ciudades.map((m) => (
                <span key={m} className="rounded-full border-2 px-3 py-1 text-sm font-bold" style={{ borderColor: COLOR_MUNDO_RETO[m], color: COLOR_MUNDO_RETO[m] }}>
                  {tMundos(m)}
                </span>
              ))}
            </div>
            {tablaPremios}
            {sabado ? (
              <>
                {mejor && (
                  <p className="font-mono text-sm text-foreground">
                    {t("tuMejor", { correctos: mejor.correctos ?? 0, tiempo: segundos(mejor.tiempo_ms) })}
                  </p>
                )}
                {quedan > 0 ? (
                  <Boton onClick={empezar} cargando={ocupado} destacado className="py-4">
                    {terminados.length === 0 ? t("empezar") : t("segundoIntento")}
                  </Boton>
                ) : (
                  <p className="text-sm font-semibold text-texto-secundario">{t("sinIntentos")}</p>
                )}
                <p className="text-xs text-texto-secundario">{t("quedan", { n: quedan, termina: textoFalta(msHastaCambioFinde(new Date(ahora))) })}</p>
              </>
            ) : (
              <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground">{t("empiezaEn", { falta: textoFalta(msHastaCambioFinde(new Date(ahora))) })}</p>
            )}
            {error && <p className="text-sm text-error">{error}</p>}
            {listaRanking}
          </motion.div>
        )}

        {fase === "jugando" && pregunta && (
          <motion.div key={`p-${indice}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }} className="flex flex-col items-center gap-4">
            <div className="flex w-full items-center justify-between">
              <span className="font-display text-sm font-bold text-foreground">{t("preguntaXdeY", { actual: indice + 1, total })}</span>
              <span className="font-mono text-sm font-bold text-logro">{segundos(inicio ? ahora - inicio : 0)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full rounded-full transition-all" style={{ width: `${((indice + 1) / total) * 100}%`, background: COLOR_MUNDO_RETO[pregunta.mundo] }} />
            </div>
            <TarjetaPreguntaReto pregunta={pregunta} seleccion={seleccion} feedback={feedback} onElegir={elegir} />
          </motion.div>
        )}

        {fase === "resumen" && resultado && (
          <motion.div key="resumen" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("terminaste")}</h1>
            <p className="font-mono text-4xl font-bold text-logro">
              {resultado.correctos}/{total} · {segundos(resultado.tiempo_ms)}
            </p>
            {resultado.chispas > 0 && <p className="text-sm font-semibold text-foreground">{t("chispasGanadas", { n: resultado.chispas })}</p>}
            <p className="text-sm text-texto-secundario">
              {t("tuPuesto", { puesto: resultado.puesto, correctos: resultado.mejor_correctos, tiempo: segundos(resultado.mejor_tiempo_ms) })}
            </p>
            {quedan > 0 && (
              <Boton onClick={empezar} cargando={ocupado} destacado className="w-full py-4">
                {t("segundoIntento")}
              </Boton>
            )}
            {listaRanking}
            <Boton atras className="w-full py-3" onClick={() => router.push("/")}>
              {t("volver")}
            </Boton>
          </motion.div>
        )}
      </AnimatePresence>
      {ocupado && fase === "jugando" && <p className="text-center text-sm text-texto-secundario">{t("guardando")}</p>}
    </div>
  );
}
