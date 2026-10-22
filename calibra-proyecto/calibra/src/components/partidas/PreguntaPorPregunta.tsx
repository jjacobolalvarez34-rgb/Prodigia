"use client";

import { useLocale, useTranslations } from "next-intl";
import { IconCheck, IconX } from "@/components/icons";
import { segundosTexto, type RespuestaPartida } from "@/lib/partidas/estadisticas";

interface Props {
  yo: RespuestaPartida[];
  rival?: RespuestaPartida[] | null;
  nombreYo: string;
  nombreRival?: string | null;
  colorHex: string;
}

function Celda({ r, max, colorHex, derecha }: { r: RespuestaPartida | undefined; max: number; colorHex: string; derecha?: boolean }) {
  const t = useTranslations("Partidas.detalle");
  const locale = useLocale();
  if (!r) return <div className="flex-1" />;
  const ancho = Math.max(6, Math.round((r.timeMs / max) * 100));
  return (
    <div className={`flex flex-1 items-center gap-2 ${derecha ? "flex-row-reverse" : ""}`}>
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${r.correct ? "bg-correcto/15 text-correcto" : "bg-error/15 text-error"}`}
        aria-label={r.correct ? t("acierto") : t("error")}
      >
        {r.correct ? <IconCheck className="h-3.5 w-3.5" /> : <IconX className="h-3.5 w-3.5" />}
      </span>
      <div className={`flex h-2 flex-1 overflow-hidden rounded-full bg-foreground/[0.06] ${derecha ? "justify-end" : ""}`}>
        <div className="h-full rounded-full" style={{ width: `${ancho}%`, background: r.correct ? colorHex : "var(--error)" }} />
      </div>
      <span className="w-14 shrink-0 text-right font-mono text-xs text-texto-secundario">{segundosTexto(r.timeMs, locale)}</span>
    </div>
  );
}

// La partida otra vez, pregunta por pregunta: si acertaste y cuánto tardaste
// (lo único que se guarda de cada respuesta). En un duelo, el rival al lado.
export default function PreguntaPorPregunta({ yo, rival, nombreYo, nombreRival, colorHex }: Props) {
  const t = useTranslations("Partidas.detalle");
  const n = Math.max(yo.length, rival?.length ?? 0);
  const max = Math.max(1, ...yo.map((r) => r.timeMs), ...(rival ?? []).map((r) => r.timeMs));
  return (
    <div className="flex flex-col gap-2">
      {rival && (
        <div className="flex items-center gap-3 text-xs font-medium text-texto-secundario">
          <span className="w-8" />
          <span className="flex-1">{nombreYo}</span>
          <span className="flex-1 text-right">{nombreRival}</span>
        </div>
      )}
      <ol className="flex flex-col gap-1.5">
        {Array.from({ length: n }, (_, i) => (
          <li key={i} className="flex items-center gap-3 rounded-lg px-1 py-0.5" aria-label={t("pregunta", { n: i + 1 })}>
            <span className="w-8 shrink-0 font-mono text-xs text-texto-secundario">{i + 1}</span>
            <Celda r={yo[i]} max={max} colorHex={colorHex} />
            {rival && <Celda r={rival[i]} max={max} colorHex={colorHex} derecha />}
          </li>
        ))}
      </ol>
    </div>
  );
}
