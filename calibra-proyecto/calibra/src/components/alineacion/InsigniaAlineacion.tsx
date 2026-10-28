"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { alineacionEnCurso } from "@/lib/ciudades/cicloDia";
import { relojEventos } from "@/components/temas/relojEventos";

// Durante la Gran Alineación, en las partidas: una insignia dorada arriba que recuerda
// que todo cuenta doble (Exp, Chispas y constelaciones; 0259/0290).
// Las mismas rutas de juego que CapaTemporada, más los sprints.
const RUTAS_DE_JUEGO = /\/(practica|duelo|duelos\/|reto-|reto\/|zen|serie|diagnostico|partida|calibracion|sprint)/;

// Aparece y se va en el instante exacto (relojEventos), también en medio de una partida.
const suscribir = relojEventos.suscribir;
const enCurso = () => alineacionEnCurso(Date.now()) !== null;
const nunca = () => false;

export default function InsigniaAlineacion() {
  const t = useTranslations("Alineacion");
  const ruta = usePathname() ?? "";
  const activa = useSyncExternalStore(suscribir, enCurso, nunca);
  if (!activa || !RUTAS_DE_JUEGO.test(ruta)) return null;
  return (
    <div className="pointer-events-none fixed left-1/2 top-2 z-[60] -translate-x-1/2 rounded-full border border-[#05060F] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-[#1A1206] shadow-[0_0_16px_rgba(242,193,78,0.7)]" style={{ background: "linear-gradient(180deg,#FFE08A,#F2C14E)" }}>
      {t("x2")}
    </div>
  );
}
