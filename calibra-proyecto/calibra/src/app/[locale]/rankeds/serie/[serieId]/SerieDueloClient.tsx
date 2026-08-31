"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { rangoDeElo, type ArithmeticProblemType } from "@/types/database";
import CountUp from "@/components/CountUp";
import RangoBadge from "@/components/RangoBadge";
import GestoLogo from "@/components/GestoLogo";
import LogroBanner from "@/components/LogroBanner";
import { hrefDuelo, type MundoDuelo } from "@/lib/duelos/rutas";
import type { Achievement } from "@/types/database";
import TextType from "@/components/reactbits/TextType";

export interface FilaRondaSerie {
  duel_id: string;
  ronda_numero: number;
  mundo: MundoDuelo;
  sub_tipo: string | null;
  operation_type: ArithmeticProblemType | null;
  estado: string;
  yo_jugue: boolean;
  rival_jugo: boolean;
  gane_ronda: boolean;
  empate_ronda: boolean;
  oponente_id: string;
  oponente_nombre: string | null;
  serie_finalizada: boolean;
  oponente_es_bot: boolean;
  mi_puntaje: number | null;
  rival_puntaje: number | null;
}

interface ResultadoFinal {
  finalizada: boolean;
  gane: boolean;
  empate: boolean;
  elo_nuevo: number | null;
  elo_anterior: number | null;
  victorias_propias: number;
  victorias_rival: number;
  oponente_id: string;
  oponente_nombre: string | null;
  oponente_es_bot: boolean;
  logrosNuevos?: Achievement[];
}

// Fase 3 (Clan de Bots): mismo tratamiento que la etiqueta "Casual" del
// historial de Rankeds — dato secundario discreto, nunca una alerta.
function TagClanDeBots() {
  return (
    <span className="ml-1.5 rounded-full bg-foreground/[0.06] px-2 py-0.5 align-middle text-[10px] font-medium uppercase tracking-wide text-texto-secundario">
      Clan de Bots
    </span>
  );
}

const POLL_MS = 3000;
const NOMBRE_MUNDO: Record<MundoDuelo, string> = {
  numeria: "Numeria",
  geografia: "Geografía",
  enigmia: "Enigmia",
  quimia: "Quimia",
  anatomia: "Anatomía",
  melodia: "Melodía",
  trigonometria: "Trigonometría",
  historia: "Historia",
};
// Mismos hex que Header.tsx (colorDelMundo) y RankedsClient.tsx.
const COLOR_MUNDO: Record<MundoDuelo, string> = {
  numeria: "#6C4CF1",
  enigmia: "#0E9F6E",
  geografia: "#1E7A8C",
  quimia: "#C026D3",
  anatomia: "#8B2942",
  melodia: "#B8860B",
  trigonometria: "#84CC16",
  historia: "#A0522D",
};
// Fase 2 (transición de ronda con TextType): velocidades elegidas para
// que la ceremonia completa (tipear el mundo anterior → borrarlo →
// tipear el siguiente) dure ~1.5-2s con nombres de mundo típicos — "es
// ceremonia, no un loading real", nunca debe sentirse como una demora.
const TT_TYPING_MS = 60;
const TT_DELETING_MS = 40;
const TT_PAUSE_MS = 500;
const TT_BUFFER_MS = 300;
// Fase 5 (auditoría de estabilización, 2026-08-30 — "el overlay tapa
// las estadísticas antes de poder leerlas"): antes la ceremonia de
// TextType arrancaba apenas se detectaba la próxima ronda, tapando a
// pantalla completa la fila de resultados que recién acababa de
// aparecer (vos: X pts · rival: Y pts) sin darle tiempo a nadie de
// leerla. Este piso de lectura corre ANTES de montar el overlay —
// durante esos ms la lista de rondas queda a la vista, sin nada
// encima.
const LECTURA_RESULTADO_MS = 3500;

function duracionTransicionMs(mundoAnterior: string | null, mundoSiguiente: string): number {
  const siguiente = mundoSiguiente.length * TT_TYPING_MS;
  if (!mundoAnterior) return siguiente + TT_BUFFER_MS;
  const anterior = mundoAnterior.length * TT_TYPING_MS + TT_PAUSE_MS + mundoAnterior.length * TT_DELETING_MS;
  return anterior + siguiente + TT_BUFFER_MS;
}
const NOMBRE_OPERACION: Record<ArithmeticProblemType, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
};
const NOMBRE_CONTENIDO: Record<string, string> = {
  america: "América",
  europa: "Europa",
  africa: "África",
  asia_oceania: "Asia y Oceanía",
  memoria: "Memoria",
  patrones: "Patrones",
  deduccion: "Deducción",
  computacional: "Pensamiento computacional",
};

// Fase 5: comparativa liviana y persistente — se usa tanto en la
// pantalla normal como DENTRO del overlay de ceremonia, para que nunca
// dependa de una sola pantalla que tapa todo (pedido explícito).
function ComparativaSerie({
  victoriasMias,
  victoriasRival,
  oponenteNombre,
}: {
  victoriasMias: number;
  victoriasRival: number;
  oponenteNombre: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-texto-secundario">Vos</span>
        <span className="font-mono text-xl font-bold text-foreground">{victoriasMias}</span>
      </div>
      <span className="text-sm font-medium text-texto-secundario">-</span>
      <div className="flex flex-col items-center gap-0.5">
        <span className="max-w-24 truncate text-[10px] font-medium uppercase tracking-wide text-texto-secundario">{oponenteNombre}</span>
        <span className="font-mono text-xl font-bold text-foreground">{victoriasRival}</span>
      </div>
    </div>
  );
}

function etiquetaRonda(r: FilaRondaSerie): string {
  if (r.mundo === "numeria" && r.operation_type) return `Numeria · ${NOMBRE_OPERACION[r.operation_type]}`;
  if (r.sub_tipo) return `${NOMBRE_MUNDO[r.mundo]} · ${NOMBRE_CONTENIDO[r.sub_tipo] ?? r.sub_tipo}`;
  return NOMBRE_MUNDO[r.mundo];
}

export default function SerieDueloClient({
  serieId,
  rondasIniciales,
}: {
  serieId: string;
  rondasIniciales: FilaRondaSerie[];
}) {
  const router = useRouter();
  const [rondas, setRondas] = useState(rondasIniciales);
  const [resultadoFinal, setResultadoFinal] = useState<ResultadoFinal | null>(null);
  // Fase 2 (auditoría 2026-08-25 — "sacá el botón manual, no debe
  // existir bajo ninguna circunstancia"): antes esto marcaba cuándo la
  // ceremonia de TextType terminaba de tipear para RECIÉN AHÍ mostrar
  // un botón "Jugar ronda" que había que clickear a mano. Ahora el
  // mismo timer, al cumplirse, navega solo — la ceremonia entera
  // (mostrar la ciudad que acaba de jugarse, borrarla, tipear la
  // siguiente) corre en un overlay a pantalla completa mientras tanto,
  // sin ninguna acción del usuario en el medio.
  const [navegandoA, setNavegandoA] = useState<string | null>(null);
  // Guarda el duel_id de la ronda para la que YA se cumplió el piso de
  // lectura — no un boolean reseteado a mano en el efecto (eso disparaba
  // react-hooks/set-state-in-effect por el setState síncrono al toque de
  // cada render). Comparar contra el duel_id actual hace el "reset" solo,
  // sin necesitar una línea que lo resetee explícitamente.
  const [rondaListaParaCeremonia, setRondaListaParaCeremonia] = useState<string | null>(null);
  const cancelarRef = useRef(false);

  // Fase 6 (auditoría de estabilización, 2026-08-30 — BUG: "mejor de 3
  // fuerza la 3ra ronda incluso ganando 2-0"): las 3 rondas se crean de
  // entrada como filas reales de `duels` cuando arranca la serie, así
  // que la 3ra existe y es jugable aunque la serie ya esté decidida en
  // 2. `estado_serie_duelo` (RPC) ya calcula esto server-side y lo
  // expone como `serie_finalizada` en cada fila — antes este componente
  // nunca lo miraba acá, solo miraba "¿tengo una ronda sin jugar?" sin
  // preguntar si hacía falta jugarla. Con la serie decidida, no hay
  // "próxima ronda" real aunque la fila siga ahí sin jugar.
  const serieFinalizada = rondas.some((r) => r.serie_finalizada);
  const proximaRonda = serieFinalizada ? undefined : rondas.find((r) => !r.yo_jugue);
  const indiceProxima = proximaRonda ? rondas.findIndex((r) => r.duel_id === proximaRonda.duel_id) : -1;
  const rondaAnterior = indiceProxima > 0 ? rondas[indiceProxima - 1] : null;
  const listoParaCeremonia = !!proximaRonda && rondaListaParaCeremonia === proximaRonda.duel_id;
  const enCeremonia = !!proximaRonda && navegandoA !== proximaRonda.duel_id && listoParaCeremonia;

  // Piso de lectura: arranca a correr apenas se conoce la próxima ronda
  // — recién cuando el timer cumple, marca ESA ronda como lista. Una
  // ronda nueva queda "no lista" automáticamente porque su duel_id no
  // coincide con `rondaListaParaCeremonia` todavía, sin necesitar
  // resetear nada a mano.
  useEffect(() => {
    if (!proximaRonda || navegandoA === proximaRonda.duel_id || resultadoFinal?.finalizada) return;
    const t = setTimeout(() => setRondaListaParaCeremonia(proximaRonda.duel_id), LECTURA_RESULTADO_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proximaRonda?.duel_id, resultadoFinal?.finalizada]);

  // Fase 6: `resultadoFinal?.finalizada` en la guarda (y en las deps) es
  // lo que de verdad evita forzar una 3ra ronda innecesaria — no alcanza
  // con que `proximaRonda` dé undefined more tarde (depende de que
  // `rondas` ya se haya refrescado con serie_finalizada=true, que puede
  // no pasar todavía si finalizar-serie recién terminó de resolver):
  // este efecto sigue vivo aunque el render ya esté mostrando la
  // pantalla de resultado final (los hooks no se "cancelan" solo porque
  // otra rama del JSX se esté mostrando), así que sin este chequeo
  // podía navegar a la ronda 3 por atrás de la pantalla de resultado ya
  // visible.
  useEffect(() => {
    if (!proximaRonda || navegandoA === proximaRonda.duel_id || !listoParaCeremonia || resultadoFinal?.finalizada) return;
    const duracion = duracionTransicionMs(rondaAnterior ? NOMBRE_MUNDO[rondaAnterior.mundo] : null, NOMBRE_MUNDO[proximaRonda.mundo]);
    const t = setTimeout(() => {
      setNavegandoA(proximaRonda.duel_id);
      router.push(hrefDuelo(proximaRonda.mundo, proximaRonda.operation_type, proximaRonda.duel_id));
    }, duracion);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proximaRonda?.duel_id, listoParaCeremonia, resultadoFinal?.finalizada]);

  useEffect(() => {
    cancelarRef.current = false;
    const supabase = createClient();

    async function ciclo() {
      while (!cancelarRef.current) {
        const resFinal = await fetch("/api/duelos/finalizar-serie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serie_id: serieId }),
        });
        if (cancelarRef.current) return;
        if (resFinal.ok) {
          const dataFinal = (await resFinal.json()) as ResultadoFinal;
          if (dataFinal.finalizada) {
            setResultadoFinal(dataFinal);
            return;
          }
        }

        const { data } = await supabase.rpc("estado_serie_duelo", { p_serie_id: serieId });
        if (cancelarRef.current) return;
        if (data) setRondas(data as FilaRondaSerie[]);

        await new Promise((resolve) => setTimeout(resolve, POLL_MS));
      }
    }

    ciclo();
    return () => {
      cancelarRef.current = true;
    };
  }, [serieId]);

  const oponenteNombre = rondas[0]?.oponente_nombre ?? "tu rival";
  const oponenteId = rondas[0]?.oponente_id ?? null;
  const oponenteEsBot = rondas[0]?.oponente_es_bot ?? false;
  const victoriasMias = rondas.filter((r) => r.gane_ronda).length;
  const victoriasRival = rondas.filter((r) => r.estado === "completado" && !r.gane_ronda && !r.empate_ronda).length;

  if (resultadoFinal?.finalizada) {
    const rangoAnterior = resultadoFinal.elo_anterior !== null ? rangoDeElo(resultadoFinal.elo_anterior) : null;
    const rangoNuevo = resultadoFinal.elo_nuevo !== null ? rangoDeElo(resultadoFinal.elo_nuevo) : null;
    const subioDeRango = resultadoFinal.gane && rangoAnterior && rangoNuevo && rangoAnterior.slug !== rangoNuevo.slug;

    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-20 text-center">
        <LogroBanner logros={resultadoFinal.logrosNuevos ?? []} />
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className={`relative flex flex-col items-center gap-2 rounded-2xl px-6 pb-5 pt-3 text-center ${
            resultadoFinal.empate ? "bg-surface-2" : resultadoFinal.gane ? "bg-correcto/10" : "border border-border bg-surface"
          }`}
        >
          {resultadoFinal.gane && (
            <div className="pointer-events-none -mb-4 -mt-6">
              <GestoLogo size={subioDeRango ? 130 : 90} colorHex={subioDeRango ? undefined : "#3FB88B"} />
            </div>
          )}
          <p
            className={`font-display text-3xl font-black uppercase tracking-tight sm:text-4xl ${
              resultadoFinal.gane ? "text-correcto" : "text-foreground"
            }`}
          >
            {resultadoFinal.empate ? "Empate" : resultadoFinal.gane ? "Victoria" : "Derrota"}
          </p>
          <p className="text-sm font-medium text-texto-secundario">
            {resultadoFinal.empate
              ? `Empataron la serie con ${oponenteNombre}`
              : resultadoFinal.gane
                ? `Ganaste la serie a ${oponenteNombre}`
                : `Esta vez ganó ${oponenteNombre}`}
            {resultadoFinal.oponente_es_bot && <TagClanDeBots />}
          </p>
          <p className="font-mono text-2xl font-bold text-foreground">
            {resultadoFinal.victorias_propias} - {resultadoFinal.victorias_rival}
          </p>
          {resultadoFinal.elo_anterior !== null && resultadoFinal.elo_nuevo !== null && (
            <div className="mt-2 flex flex-col items-center gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-texto-secundario">ELO</span>
              <CountUp
                from={resultadoFinal.elo_anterior}
                value={resultadoFinal.elo_nuevo}
                className="font-display text-6xl font-black leading-none tabular-nums text-foreground sm:text-7xl"
              />
            </div>
          )}
          {subioDeRango && resultadoFinal.elo_nuevo !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "backOut" }}
              className="mt-1 flex flex-col items-center gap-1 rounded-xl bg-logro/15 px-4 py-3"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">Subiste de rango</span>
              <RangoBadge elo={resultadoFinal.elo_nuevo} size="lg" />
            </motion.div>
          )}
          {oponenteId && !resultadoFinal.oponente_es_bot && (
            <Link href={`/perfil/${oponenteId}`} className="mt-1 text-xs font-semibold text-primario hover:underline">
              Ver perfil
            </Link>
          )}
        </motion.div>

        <div className="flex w-full flex-col gap-2">
          {rondas.map((r) => (
            <FilaRondaResumen key={r.duel_id} ronda={r} />
          ))}
        </div>

        <div className="flex w-full max-w-md gap-3">
          <Link
            href="/rankeds?tab=buscar"
            className="flex-1 rounded-2xl px-4 py-4 text-center font-display font-semibold text-white shadow-lg"
            style={{ background: "linear-gradient(120deg, var(--primario), var(--logro))" }}
          >
            Otra partida
          </Link>
          <Link
            href="/rankeds"
            className="flex items-center justify-center rounded-2xl border-2 border-border px-6 py-4 font-display font-semibold text-foreground transition-colors hover:border-primario/40"
          >
            Volver
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <span className="rounded-full bg-primario/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primario">
        Todas las ciudades · Mejor de 3
      </span>
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
        Vs. {oponenteNombre}
        {oponenteEsBot && <TagClanDeBots />}
      </h1>
      <ComparativaSerie victoriasMias={victoriasMias} victoriasRival={victoriasRival} oponenteNombre={oponenteNombre} />

      <div className="flex w-full flex-col gap-2">
        {rondas.map((r) => (
          <FilaRondaResumen key={r.duel_id} ronda={r} />
        ))}
      </div>

      {!proximaRonda && (
        <p className="text-sm text-texto-secundario">
          Ya jugaste tus 3 rondas — esperando a que {oponenteNombre} termine las suyas.
        </p>
      )}

      <AnimatePresence>
        {proximaRonda && enCeremonia && (
          <motion.div
            key={proximaRonda.duel_id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background px-6"
          >
            <ComparativaSerie victoriasMias={victoriasMias} victoriasRival={victoriasRival} oponenteNombre={oponenteNombre} />
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-texto-secundario">
              {rondaAnterior ? "Siguiente ciudad" : "Arrancamos en"}
            </span>
            <TextType
              as="span"
              text={rondaAnterior ? [NOMBRE_MUNDO[rondaAnterior.mundo], NOMBRE_MUNDO[proximaRonda.mundo]] : [NOMBRE_MUNDO[proximaRonda.mundo]]}
              textColors={rondaAnterior ? [COLOR_MUNDO[rondaAnterior.mundo], COLOR_MUNDO[proximaRonda.mundo]] : [COLOR_MUNDO[proximaRonda.mundo]]}
              typingSpeed={TT_TYPING_MS}
              deletingSpeed={TT_DELETING_MS}
              pauseDuration={TT_PAUSE_MS}
              loop={false}
              showCursor={false}
              className="font-display text-3xl font-black tracking-tight text-center sm:text-5xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilaRondaResumen({ ronda }: { ronda: FilaRondaSerie }) {
  const resuelta = ronda.estado === "completado";
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left ${
        resuelta ? (ronda.empate_ronda ? "border-border bg-surface" : ronda.gane_ronda ? "border-correcto/30 bg-correcto/5" : "border-border bg-surface") : "border-dashed border-border bg-surface"
      }`}
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">
          Ronda {ronda.ronda_numero} · {etiquetaRonda(ronda)}
        </span>
        <span className="text-xs text-texto-secundario">
          {!resuelta
            ? ronda.yo_jugue
              ? `Esperando al rival…${ronda.mi_puntaje != null ? ` · vos: ${ronda.mi_puntaje} pts` : ""}`
              : "Todavía sin jugar"
            : `${ronda.empate_ronda ? "Empate" : ronda.gane_ronda ? "Ganaste" : "Perdiste"}${
                ronda.mi_puntaje != null && ronda.rival_puntaje != null
                  ? ` · vos: ${ronda.mi_puntaje} pts · rival: ${ronda.rival_puntaje} pts`
                  : ""
              }`}
        </span>
      </div>
      <span className="text-lg">{resuelta ? (ronda.empate_ronda ? "🤝" : ronda.gane_ronda ? "✅" : "❌") : "⏳"}</span>
    </div>
  );
}
