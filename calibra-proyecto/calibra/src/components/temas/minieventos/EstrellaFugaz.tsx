"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import IconoCometa from "@/components/IconoCometa";
import VistaCosmetico from "@/components/recompensas/VistaCosmetico";
import DibujoTema from "@/components/temas/DibujoTema";
import RelojFalta from "@/components/temas/RelojFalta";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { ofertaEstelarAhora, type OfertaEstelar } from "@/lib/temas/minieventos";
import { useTemaHoy } from "@/components/temas/useTemaHoy";

// Hook: la Estrella fugaz que está cayendo ahora (se revisa cada 20 s). Sin vista previa:
// mientras no cae, no se dice cuál viene.
export function useOfertaEstelar(desde: string | null): OfertaEstelar | null {
  const [oferta, setOferta] = useState<OfertaEstelar | null>(null);
  useEffect(() => {
    if (!desde) return;
    const tic = () => setOferta((antes) => {
      const nueva = ofertaEstelarAhora(desde);
      return antes?.desdeMs === nueva?.desdeMs ? antes : nueva;
    });
    tic();
    const id = setInterval(tic, 20_000);
    return () => clearInterval(id);
  }, [desde]);
  return oferta;
}

// Viernes Estelar · «Estrella fugaz» (0309): cada día cae una oferta sorpresa de la
// colección, a mitad de precio, por 2 horas.
export default function EstrellaFugaz({ desde }: { desde: string }) {
  const t = useTranslations("Minieventos.estrella");
  const oferta = useOfertaEstelar(desde);
  const pieza = oferta ? COLECCIONES.viernes_estelar?.piezas.find((p) => p.item === oferta.item) : null;
  if (!oferta || !pieza) return <p className="text-xs text-texto-secundario">{t("sin")}</p>;
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-[#5DE4FF88] bg-[#050A24] p-4 text-white">
      <span className="flex h-16 w-16 items-center justify-center">
        <VistaCosmetico categoria={pieza.categoria} valor={pieza.valor} tam={56} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#5DE4FF]">{t("cayo")}</p>
        <p className="font-display text-base font-bold">{t("oferta", { pieza: pieza.nombre })}</p>
        <p className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1">
            <DibujoTema dibujo={PARTICULAS.estrella_fugaz} className="h-4 w-4" /> {oferta.fichas}
            <s className="text-white/40">{pieza.fichas}</s>
          </span>
          <span className="flex items-center gap-1">
            <IconoCometa className="h-3.5 w-3.5" /> {oferta.cometas}
            <s className="text-white/40">{pieza.cometas}</s>
          </span>
        </p>
        <p className="font-mono text-xs text-white/60">
          <RelojFalta hasta={oferta.hastaMs} texto={(tiempo) => t("quedan", { tiempo })} />
        </p>
      </div>
      <Link href="/evento" className="rounded-xl border-2 border-[#05060F] bg-[#5DE4FF] px-4 py-2 font-display text-sm font-bold text-[#05060F] shadow-[3px_3px_0_0_#05060F]">
        {t("ver")}
      </Link>
    </div>
  );
}

// En la portada del Bazar: la Estrella fugaz, solo durante el Viernes Estelar y mientras cae.
export function EstrellaEnBazar() {
  const tema = useTemaHoy();
  const desde = tema?.tema.id === "viernes_estelar" && tema.fase === "evento" ? tema.hoy.rango.desde : null;
  const oferta = useOfertaEstelar(desde);
  if (!desde || !oferta) return null;
  return <EstrellaFugaz desde={desde} />;
}
