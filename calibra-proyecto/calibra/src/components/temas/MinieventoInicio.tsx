"use client";

import type { CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import { useTemaHoy } from "./useTemaHoy";
import { celebracionDe } from "@/lib/temas/celebracion";
import CartelPlegable from "./CartelPlegable";
import IconoEvento from "./IconoEvento";
import MinieventoFiesta from "./minieventos/MinieventoFiesta";

// El minievento de la fecha en el Inicio (celebracion.ts). Los que se juegan en una
// pantalla propia (el de π) llevan su botón. Empieza minimizado (CartelPlegable).
const PANTALLA: Partial<Record<string, string>> = { dia_pi: "/pi" };

export default function MinieventoInicio() {
  const tema = useTemaHoy();
  const m = celebracionDe(tema)?.minievento;
  if (!tema || !m || m.donde === "ranked" || m.donde === "amigos") return null;
  const ruta = PANTALLA[tema.tema.id];
  return (
    <CartelPlegable
      id={`mini-${tema.tema.id}-${tema.hoy.rango.desde}`}
      franja={{
        icono: <IconoEvento tema={tema.tema} />,
        eyebrow: "Minievento",
        titulo: m.nombre,
        acento: tema.tema.acento,
        fondo: `linear-gradient(100deg, ${tema.tema.acento}40, transparent 75%), #0B0A1A`,
      }}
    >
      <div className="flex flex-col gap-2 rounded-2xl border-2 py-4 pl-5 pr-14" style={{ borderColor: `${tema.tema.acento}88`, background: `linear-gradient(120deg, ${tema.tema.acento}1f, transparent 70%)` }}>
        <p className="texto-acento font-mono text-[11px] font-bold uppercase tracking-[0.2em]" style={{ "--acento": tema.tema.acento } as CSSProperties}>
          Minievento
        </p>
        <p className="font-display text-lg font-bold text-foreground">{m.nombre}</p>
        <p className="text-sm text-texto-secundario">{m.texto}</p>
        <MinieventoFiesta tema={tema} />
        {ruta && (
          <Link href={ruta} className="w-fit rounded-xl border-2 border-[#05060F] px-4 py-2 font-display text-sm font-bold text-[#120A00] shadow-[3px_3px_0_0_#05060F]" style={{ background: tema.tema.acento }}>
            Jugar
          </Link>
        )}
      </div>
    </CartelPlegable>
  );
}
