"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { VisualMelodiaMetronomo } from "@/lib/melodia/visuales";
import { formatoSegundos, resolverMetronomo, textoDeVisual, type Acento, type FilaMetronomo } from "@/lib/melodia/visualesDatos";
import { reproducirPulso } from "@/lib/sonido";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MarcoVisual, COLOR_MELODIA, fondoAcento } from "./comun";

// Cuenta los pulsos a `bpm` mientras `activo` (el setState va en el
// temporizador, nunca directo en el efecto). Cada pulso se agenda contra el
// reloj desde el inicio, así el temblor de setTimeout no se acumula.
function useLatido(bpm: number, activo: boolean): number {
  const [n, setN] = useState(-1);
  useEffect(() => {
    if (!activo) return;
    const ms = 60000 / bpm;
    const inicio = performance.now();
    let id: ReturnType<typeof setTimeout>;
    const tic = () => {
      const k = Math.floor((performance.now() - inicio) / ms);
      setN(k);
      id = setTimeout(tic, Math.max(0, inicio + (k + 1) * ms - performance.now()));
    };
    id = setTimeout(tic, 0);
    return () => clearTimeout(id);
  }, [bpm, activo]);
  return activo ? n : -1;
}

const TAM: Record<Acento, number> = { fuerte: 18, medio: 14, debil: 11 };

function Fila({ fila, acentos, visible, actual, animar, escuchar, idioma }: { fila: FilaMetronomo; acentos: Acento[]; visible: boolean; actual: boolean; animar: boolean; escuchar: boolean; idioma: "es" | "en" }) {
  const t = useTranslations("Melodia.visuales.metronomo");
  const latido = useLatido(fila.bpm, visible && animar);
  const tiempo = latido >= 0 ? latido % acentos.length : -1;
  return (
    <li
      className="flex flex-col gap-2 rounded-xl border-2 px-3 py-2 transition-opacity duration-300 motion-reduce:transition-none"
      style={{ opacity: visible ? 1 : 0.2, borderColor: visible ? COLOR_MELODIA : "var(--border)", background: actual ? fondoAcento(14) : "var(--surface)" }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-base font-bold tabular-nums">{fila.bpm} BPM</span>
        {fila.termino && <span className="text-xs font-semibold italic" style={{ color: COLOR_MELODIA }}>{fila.termino}</span>}
      </div>
      <div className="flex h-5 items-center gap-2">
        {acentos.map((a, i) => (
          <span
            key={i}
            className="rounded-full transition-transform duration-75 motion-reduce:transition-none"
            style={{
              width: TAM[a],
              height: TAM[a],
              background: COLOR_MELODIA,
              opacity: tiempo === i ? 1 : 0.22,
              transform: tiempo === i ? "scale(1.15)" : undefined,
              marginLeft: a === "medio" && i > 0 ? 6 : undefined,
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-texto-secundario">{t("cadaPulso", { segundos: formatoSegundos(fila.segundos, idioma) })}</span>
        {escuchar && (
          <button
            type="button"
            onClick={() => reproducirPulso(fila.bpm, acentos.length * 2, acentos.length)}
            className="inline-flex min-h-9 items-center rounded-lg border px-2.5 text-xs font-semibold transition-colors hover:bg-surface-2"
            style={{ borderColor: COLOR_MELODIA, color: COLOR_MELODIA }}
          >
            {t("escuchar")}
          </button>
        )}
      </div>
    </li>
  );
}

// melodia.metronomo: cada tempo en su fila, con una luz por tiempo del compás
// que late a ese BPM (la grande es el tiempo fuerte). Lo que dura un pulso
// sale de resolverMetronomo (60 / BPM) y el término italiano, de
// TEMPOS_ITALIANOS (los mismos que pregunta la Práctica).
export default function Metronomo({ visual }: { visual: VisualMelodiaMetronomo }) {
  const t = useTranslations("Melodia.visuales.metronomo");
  const idioma = useLocale() === "en" ? "en" : "es";
  const datos = resolverMetronomo(visual);
  const total = datos?.filas.length ?? 0;
  const { alVer, ...r } = useReproductor({ total, ms: 2600, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos) return null;

  const alternativa = <p>{textoDeVisual(visual as unknown as { tipo: string } & Record<string, unknown>, idioma)}</p>;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      nota={t("nota", { compas: datos.compas })}
      controles={<ControlesReproductor r={r} color={COLOR_MELODIA} />}
    >
      <ul className="mx-auto flex w-full max-w-sm flex-col gap-1.5">
        {datos.filas.map((f, i) => (
          <Fila key={i} fila={f} acentos={datos.acentos} visible={i < r.paso} actual={i === r.paso - 1} animar={!r.reducir} escuchar={Boolean(visual.escuchar)} idioma={idioma} />
        ))}
      </ul>
    </MarcoVisual>
  );
}
