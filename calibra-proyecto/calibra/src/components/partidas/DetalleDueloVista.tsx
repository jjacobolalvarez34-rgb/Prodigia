"use client";

import { useLocale, useTranslations } from "next-intl";
import BotonEnlace from "@/components/BotonEnlace";
import { COLOR_MUNDO, type MundoDuelo } from "@/lib/duelos/rutas";
import { tarjetaDeDetalle, type DetalleDuelo, type LadoDetalle } from "@/lib/partidas/detalleDuelo";
import { segundosTexto } from "@/lib/partidas/estadisticas";
import BotonCompartirPartida from "./BotonCompartirPartida";
import PreguntaPorPregunta from "./PreguntaPorPregunta";
import RepeticionPartida from "./RepeticionPartida";

function pct(p: number | null | undefined): string {
  return p == null ? "—" : `${Math.round(p * 100)}%`;
}

// Detalle de un duelo del historial: tú contra tu rival, con todo lo que se
// guardó de la partida (totales siempre; pregunta por pregunta si el duelo
// guardó las respuestas). Se puede compartir y ver la repetición.
export default function DetalleDueloVista({ detalle, miNombre }: { detalle: DetalleDuelo; miNombre: string | null }) {
  const t = useTranslations("Partidas");
  const tMundos = useTranslations("Mundos.nombres");
  const tOperaciones = useTranslations("Practica.operationPicker.operaciones");
  const locale = useLocale();
  const color = COLOR_MUNDO[detalle.mundo as MundoDuelo] ?? "#6C4CF1";
  const yo = detalle.yo;
  const rival = detalle.rival;
  const nombreYo = miNombre ?? t("detalle.tu");
  const nombreRival = detalle.rivalNombre ?? t("tarjeta.rival");
  const mundo = tMundos.has(detalle.mundo) ? tMundos(detalle.mundo) : detalle.mundo;
  const tema = detalle.mundo === "numeria" && detalle.operationType && tOperaciones.has(detalle.operationType) ? tOperaciones(detalle.operationType) : null;
  const tono =
    detalle.resultado === "victoria" ? "text-logro" : detalle.resultado === "derrota" ? "text-error" : "text-primario";

  const filas: { etiqueta: string; mio: (l: LadoDetalle) => string }[] = [
    { etiqueta: t("detalle.aciertos"), mio: (l) => (l.stats ? `${l.stats.aciertos}/${l.stats.total}` : pct(l.precision)) },
    { etiqueta: t("detalle.errores"), mio: (l) => (l.stats ? String(l.stats.errores) : "—") },
    { etiqueta: t("detalle.precision"), mio: (l) => pct(l.stats?.precision ?? l.precision) },
    { etiqueta: t("detalle.rachaMax"), mio: (l) => (l.stats ? String(l.stats.rachaMax) : "—") },
    { etiqueta: t("detalle.tiempoProm"), mio: (l) => segundosTexto(l.stats?.tiempoPromedioMs ?? l.tiempoPromedioMs, locale) },
    { etiqueta: t("detalle.masRapida"), mio: (l) => segundosTexto(l.stats?.masRapidaMs, locale) },
    { etiqueta: t("detalle.masLenta"), mio: (l) => segundosTexto(l.stats?.masLentaMs, locale) },
    { etiqueta: t("detalle.exp"), mio: (l) => `+${l.puntaje}` },
  ];

  const lados = [
    ...(yo?.respuestas ? [{ nombre: nombreYo, respuestas: yo.respuestas, color }] : []),
    ...(rival?.respuestas ? [{ nombre: nombreRival, respuestas: rival.respuestas, color: "var(--error)" }] : []),
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <BotonEnlace href="/rankeds" variante="secundario" atras tamano="sm" colorHex={color}>
          {t("detalle.volver")}
        </BotonEnlace>
        {yo && <BotonCompartirPartida origen={{ duelId: detalle.duelId }} tarjeta={tarjetaDeDetalle(detalle, miNombre)} colorHex={color} />}
      </div>

      <section className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-5 py-6 text-center" style={{ borderColor: `color-mix(in oklab, ${color} 40%, var(--border))` }}>
        <span className="text-xs font-medium uppercase tracking-wide text-texto-secundario">
          {[t("detalle.titulo"), mundo, tema, detalle.clasificatorio ? t("tarjeta.ranked") : t("tarjeta.casual")].filter(Boolean).join(" · ")}
        </span>
        {detalle.resultado && <h1 className={`font-display text-3xl font-bold ${tono}`}>{t(`tarjeta.${detalle.resultado}`)}</h1>}
        <div className="flex w-full items-center justify-center gap-4">
          <div className="flex flex-1 flex-col items-center">
            <span className="max-w-full truncate text-sm text-texto-secundario">{nombreYo}</span>
            <span className={`font-mono text-4xl font-bold ${detalle.resultado === "victoria" ? "text-logro" : "text-foreground"}`}>{yo?.puntaje ?? "—"}</span>
          </div>
          <span className="text-sm text-texto-secundario">vs</span>
          <div className="flex flex-1 flex-col items-center">
            <span className="max-w-full truncate text-sm text-texto-secundario">{nombreRival}</span>
            <span className={`font-mono text-4xl font-bold ${detalle.resultado === "derrota" ? "text-logro" : "text-foreground"}`}>{rival?.puntaje ?? "—"}</span>
          </div>
        </div>
        <span className="text-xs text-texto-secundario">{new Date(detalle.creadoAt).toLocaleString(locale === "en" ? "en-US" : "es-AR", { dateStyle: "medium", timeStyle: "short" })}</span>
      </section>

      {yo && (
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 border-b border-border px-4 py-2 text-xs font-medium text-texto-secundario">
            <span />
            <span className="w-20 truncate text-right">{nombreYo}</span>
            <span className="w-20 truncate text-right">{nombreRival}</span>
          </div>
          {filas.map((f) => (
            <div key={f.etiqueta} className="grid grid-cols-[1fr_auto_auto] gap-x-6 border-b border-border px-4 py-2.5 text-sm last:border-0">
              <span className="text-texto-secundario">{f.etiqueta}</span>
              <span className="w-20 text-right font-mono font-semibold text-foreground">{f.mio(yo)}</span>
              <span className="w-20 text-right font-mono text-texto-secundario">{rival ? f.mio(rival) : "—"}</span>
            </div>
          ))}
        </section>
      )}

      {!rival && <p className="text-center text-sm text-texto-secundario">{t("detalle.rivalSinJugar")}</p>}

      {lados.length > 0 ? (
        <>
          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{t("detalle.repeticion")}</h2>
            <RepeticionPartida lados={lados} colorHex={color} />
          </section>
          {yo?.respuestas && (
            <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
              <h2 className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{t("detalle.porPregunta")}</h2>
              <PreguntaPorPregunta yo={yo.respuestas} rival={rival?.respuestas ?? null} nombreYo={nombreYo} nombreRival={nombreRival} colorHex={color} />
            </section>
          )}
        </>
      ) : (
        yo && <p className="text-center text-sm text-texto-secundario">{t("detalle.sinDetalle")}</p>
      )}

      {detalle.clasificatorio && <p className="text-center text-xs text-texto-secundario">{t("detalle.notaElo")}</p>}
    </div>
  );
}
