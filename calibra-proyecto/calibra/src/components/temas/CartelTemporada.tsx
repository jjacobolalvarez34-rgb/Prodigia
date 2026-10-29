"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { eventoDeTema, finDelDiaMs } from "@/lib/temas/eventos";
import RelojFalta from "./RelojFalta";
import { inicioEventoMs } from "@/lib/temas/calendario";
import EscenaTema from "./EscenaTema";
import { useTemaHoy } from "./useTemaHoy";
import CartelPlegable, { faltaCorto } from "./CartelPlegable";
import IconoEvento from "./IconoEvento";

// Cartel de la festividad en el Inicio (capa 7): el nombre, la frase de la fase y
// cuánto falta; si la fiesta tiene colección, lleva a la página del evento. Empieza
// minimizado en una franja (CartelPlegable).
export default function CartelTemporada() {
  const t = useTranslations("Evento");
  const locale = useLocale();
  const tema = useTemaHoy();
  if (!tema || tema.tema.escala === "tienda") return null;
  const evento = eventoDeTema(tema);
  const en = locale === "en";
  const frase = tema.fase === "decoracion" ? (en ? tema.tema.frase.decoracionEn : tema.tema.frase.decoracion) || (en ? tema.tema.frase.eventoEn : tema.tema.frase.evento) : en ? tema.tema.frase.eventoEn : tema.tema.frase.evento;

  const reloj =
    tema.fase === "decoracion" ? (
      <RelojFalta hasta={inicioEventoMs(tema.hoy.rango)} texto={(tiempo) => t("empiezaEn", { tiempo })} />
    ) : (
      <RelojFalta hasta={finDelDiaMs(tema.hoy.rango.hasta)} texto={(tiempo) => t("terminaEn", { tiempo })} />
    );

  const contenido = (
    <div className="relative flex min-h-[132px] overflow-hidden rounded-3xl border-2 border-[#05060F] text-white shadow-[6px_6px_0_0_#05060F]">
      <EscenaTema tema={tema.tema} className="absolute inset-0" />
      <div className="relative flex flex-1 flex-col justify-center gap-1 bg-gradient-to-r from-[#05060F]/85 via-[#05060F]/55 to-transparent px-5 py-4">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: tema.tema.acento }}>
          {tema.fase === "decoracion" ? t("seAcerca") : t("evento")}
        </span>
        <span className="font-display text-2xl font-bold leading-tight">{en ? tema.tema.nombreEn : tema.tema.nombre}</span>
        <span className="max-w-xs text-sm text-white/80">{frase}</span>
        <span className="mt-1 w-fit rounded-full bg-white/10 px-3 py-1 font-mono text-xs font-bold tabular-nums empty:hidden">
          {reloj}
        </span>
      </div>
      {evento && tema.fase !== "decoracion" && (
        <span className="relative mr-4 self-center rounded-xl border-2 border-[#05060F] px-4 py-2 font-display text-sm font-bold text-[#05060F] shadow-[3px_3px_0_0_#05060F]" style={{ background: tema.tema.acento }}>
          {t("verEvento")}
        </span>
      )}
    </div>
  );
  return (
    <CartelPlegable
      id={`tema-${tema.tema.id}-${tema.hoy.rango.desde}`}
      franja={{
        icono: <IconoEvento tema={tema.tema} />,
        eyebrow: tema.fase === "decoracion" ? t("seAcerca") : t("evento"),
        titulo: en ? tema.tema.nombreEn : tema.tema.nombre,
        detalle:
          tema.fase === "decoracion" ? (
            <RelojFalta hasta={inicioEventoMs(tema.hoy.rango)} texto={(tiempo) => t("empiezaEn", { tiempo: faltaCorto(tiempo) })} />
          ) : (
            <RelojFalta hasta={finDelDiaMs(tema.hoy.rango.hasta)} texto={(tiempo) => t("terminaEn", { tiempo: faltaCorto(tiempo) })} />
          ),
        acento: tema.tema.acento,
        fondo: `radial-gradient(90% 160% at 0% 50%, ${tema.tema.acento2}55 0%, transparent 60%), radial-gradient(80% 180% at 100% 50%, ${tema.tema.acento}40 0%, transparent 65%), #0B0A1A`,
      }}
    >
      {evento ? (
        <Link href="/evento" className="block transition-transform hover:-translate-y-0.5">
          {contenido}
        </Link>
      ) : (
        contenido
      )}
    </CartelPlegable>
  );
}
