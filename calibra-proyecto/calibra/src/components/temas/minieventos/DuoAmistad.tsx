"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import DibujoTema from "@/components/temas/DibujoTema";
import { createClient } from "@/lib/supabase/client";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { DUO_MAX_AMIGOS, duoAmistad, FICHAS_POR_DUO, type DuoAmistad as Duo } from "@/lib/temas/minieventos";

// Amor y amistad · «Dúo de la amistad» (0311): cada duelo amistoso terminado con un
// amigo durante el evento da Cartas a los dos (una vez por amigo, hasta 5 amigos).
export default function DuoAmistad() {
  const t = useTranslations("Minieventos.duo");
  const en = useLocale() === "en";
  const ficha = COLECCIONES.amor_amistad!.ficha;
  const nombreFicha = en ? ficha.nombreEn : ficha.nombre;
  const [duos, setDuos] = useState<Duo[] | null>(null);

  useEffect(() => {
    let vivo = true;
    void duoAmistad(createClient()).then((r) => {
      if (vivo) setDuos(r ?? []);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const n = duos?.length ?? 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: DUO_MAX_AMIGOS }, (_, i) => (
          <DibujoTema key={i} dibujo={PARTICULAS.carta} className={`h-8 w-8 transition ${i < n ? "" : "opacity-20 grayscale"}`} />
        ))}
        <span className="ml-1 font-mono text-xs font-bold text-[#FF5D8F]">{duos ? t("lista", { n, max: DUO_MAX_AMIGOS }) : "…"}</span>
      </div>
      {duos && duos.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {duos.map((d) => (
            <li key={d.amigo_id} className="text-sm text-foreground">
              {t("amigo", { nombre: d.nombre, fichas: d.fichas, ficha: nombreFicha })}
            </li>
          ))}
        </ul>
      )}
      {n >= DUO_MAX_AMIGOS ? (
        <p className="text-sm font-bold text-[#FF5D8F]">{t("completo", { max: DUO_MAX_AMIGOS })}</p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-texto-secundario">{t("texto", { fichas: FICHAS_POR_DUO, ficha: nombreFicha })}</p>
          <Link href="/amigos" className="rounded-xl border-2 border-[#05060F] bg-[#FF5D8F] px-3 py-1.5 font-display text-xs font-bold text-[#2A0B1A] shadow-[2px_2px_0_0_#05060F]">
            {t("ir")}
          </Link>
        </div>
      )}
    </div>
  );
}
