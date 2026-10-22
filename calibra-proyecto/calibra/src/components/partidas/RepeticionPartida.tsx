"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Boton from "@/components/Boton";
import { duracionRepeticion, estadoEnElInstante, type RespuestaPartida } from "@/lib/partidas/estadisticas";

interface Lado {
  nombre: string;
  respuestas: RespuestaPartida[];
  color: string;
}

// Repetición de la partida: cada respuesta aparece en el momento en que se dio,
// con su tiempo real (el mismo ritmo del «fantasma» de los duelos). En un duelo,
// los dos a la vez. No necesita las preguntas: solo acierto + tiempo.
export default function RepeticionPartida({ lados, colorHex }: { lados: Lado[]; colorHex: string }) {
  const t = useTranslations("Partidas.detalle");
  const duracion = duracionRepeticion(...lados.map((l) => l.respuestas));
  const [ms, setMs] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const ultimo = useRef<number | null>(null);

  useEffect(() => {
    if (!corriendo) return;
    let raf = 0;
    const paso = (ahora: number) => {
      const antes = ultimo.current ?? ahora;
      ultimo.current = ahora;
      setMs((m) => {
        const siguiente = Math.min(duracion, m + (ahora - antes));
        if (siguiente >= duracion) setCorriendo(false);
        return siguiente;
      });
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => {
      cancelAnimationFrame(raf);
      ultimo.current = null;
    };
  }, [corriendo, duracion]);

  function alternar() {
    if (ms >= duracion) setMs(0);
    setCorriendo((c) => !c);
  }

  const terminado = ms >= duracion && duracion > 0;
  return (
    <div className="flex flex-col gap-4">
      {lados.map((l) => {
        const e = estadoEnElInstante(l.respuestas, ms);
        return (
          <div key={l.nombre} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="truncate font-medium text-foreground">{l.nombre}</span>
              <span className="font-mono text-texto-secundario">
                {e.correctas}/{l.respuestas.length}
              </span>
            </div>
            <div className="flex gap-1">
              {l.respuestas.map((r, i) => (
                <span
                  key={i}
                  className="h-3 flex-1 rounded-full transition-colors duration-200"
                  style={{ background: i < e.respondidas ? (r.correct ? l.color : "var(--error)") : "color-mix(in oklab, var(--foreground) 8%, transparent)" }}
                />
              ))}
            </div>
          </div>
        );
      })}
      <div className="h-1 overflow-hidden rounded-full bg-foreground/[0.06]">
        <div className="h-full rounded-full" style={{ width: `${duracion > 0 ? (ms / duracion) * 100 : 0}%`, background: colorHex }} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-texto-secundario">
          {(ms / 1000).toFixed(1)} / {(duracion / 1000).toFixed(1)} s
        </span>
        <Boton variante="secundario" colorHex={colorHex} tamano="sm" onClick={alternar} disabled={duracion <= 0}>
          {corriendo ? t("pausar") : terminado ? t("otraVez") : ms > 0 ? t("seguir") : t("verRepeticion")}
        </Boton>
      </div>
    </div>
  );
}
