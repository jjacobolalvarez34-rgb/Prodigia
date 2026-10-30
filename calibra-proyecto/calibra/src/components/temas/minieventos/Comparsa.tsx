"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import DibujoTema from "@/components/temas/DibujoTema";
import { createClient } from "@/lib/supabase/client";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { escenaComparsa } from "@/lib/temas/escenasFiestas";
import { ACIERTOS_POR_BAILARIN, metaCobrada, metasDe, tablaComparsa, type FilaComparsa } from "@/lib/temas/minieventos";
import { useMetasMinievento } from "./useMetasMinievento";

// Carnaval · «Comparsa» (0311): cada 10 aciertos en Melodía suman un bailarín; con 20,
// 50 y 100 se ganan Máscaras (se cobran solas). Tabla de la comparsa del evento.
export default function Comparsa() {
  const t = useTranslations("Minieventos.comparsa");
  const en = useLocale() === "en";
  const ficha = COLECCIONES.carnaval!.ficha;
  const nombreFicha = en ? ficha.nombreEn : ficha.nombre;
  const { hoy, progreso, premios, cargado, error } = useMetasMinievento("carnaval", true);
  const [tabla, setTabla] = useState<FilaComparsa[] | null>(null);

  useEffect(() => {
    let vivo = true;
    void tablaComparsa(createClient()).then((r) => {
      if (vivo) setTabla(r ?? []);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const n = progreso?.total ?? 0;
  const bailarines = Math.min(10, Math.floor(n / ACIERTOS_POR_BAILARIN));
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#071A14]">
        <DibujoTema dibujo={escenaComparsa(bailarines)} className="block h-auto w-full" />
      </div>
      <p className="font-mono text-xs font-bold text-[#3DDC97]">{cargado ? t("progreso", { n, bailarines }) : "…"}</p>
      <div className="flex flex-wrap gap-2">
        {metasDe("carnaval").map((m) => {
          const ok = metaCobrada(m, premios, hoy);
          return (
            <span key={m.clave} className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold" style={{ borderColor: ok ? "#FFC53D" : "#ffffff22", color: ok ? "#FFC53D" : undefined }}>
              <DibujoTema dibujo={PARTICULAS.mascara} className={`h-4 w-4 ${ok ? "" : "opacity-40"}`} />
              {t("meta", { meta: m.meta })} · +{m.fichas} {nombreFicha}
            </span>
          );
        })}
      </div>
      {tabla && (
        <div className="rounded-xl border border-white/10 px-3 py-2">
          <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFC53D]">{t("tabla")}</p>
          {tabla.length === 0 ? (
            <p className="text-xs text-texto-secundario">{t("vacia")}</p>
          ) : (
            <ol className="flex flex-col gap-0.5">
              {tabla.map((f, i) => (
                <li key={i} className={`flex justify-between text-sm ${f.yo ? "font-bold text-[#3DDC97]" : "text-foreground"}`}>
                  <span>
                    {i + 1}. {f.nombre}
                  </span>
                  <span className="font-mono">{f.aciertos}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
      <Link href="/melodia" className="w-fit rounded-xl border-2 border-[#05060F] bg-[#3DDC97] px-3 py-1.5 font-display text-xs font-bold text-[#06231A] shadow-[2px_2px_0_0_#05060F]">
        {t("jugar")}
      </Link>
      {error && <p className="text-sm font-semibold text-error">{error}</p>}
    </div>
  );
}
