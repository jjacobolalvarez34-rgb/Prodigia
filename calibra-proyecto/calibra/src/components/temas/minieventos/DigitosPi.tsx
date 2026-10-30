"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import DibujoTema from "@/components/temas/DibujoTema";
import { createClient } from "@/lib/supabase/client";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { METAS_PI, premiosDigitosPi } from "@/lib/temas/minieventos";

// Día de π · «Dígitos de π» (0295) con Fichas (0311): tu mejor marca del día da Dígitos
// con 10, 20 y 31 dígitos (se cobran solos al abrir el Inicio).
export default function DigitosPi() {
  const t = useTranslations("Minieventos.pi");
  const en = useLocale() === "en";
  const ficha = COLECCIONES.dia_pi!.ficha;
  const nombreFicha = en ? ficha.nombreEn : ficha.nombre;
  const [estado, setEstado] = useState<{ mejor: number; fichas: number } | null>(null);

  useEffect(() => {
    let vivo = true;
    void premiosDigitosPi(createClient()).then((r) => {
      if (vivo && r) setEstado(r);
    });
    return () => {
      vivo = false;
    };
  }, []);

  if (!estado) return null;
  const tope = METAS_PI[METAS_PI.length - 1].digitos;
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-xs font-bold text-[#9B85FF]">{t("mejor", { n: estado.mejor })}</p>
      <div className="relative h-3 overflow-visible rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-[#9B85FF] to-[#5DE4FF] transition-all" style={{ width: `${Math.min(100, (estado.mejor / tope) * 100)}%` }} />
      </div>
      <div className="flex flex-wrap gap-2">
        {METAS_PI.map((m) => {
          const ok = estado.mejor >= m.digitos;
          return (
            <span key={m.digitos} className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold" style={{ borderColor: ok ? "#5DE4FF" : "#ffffff22", color: ok ? "#5DE4FF" : undefined }}>
              <DibujoTema dibujo={PARTICULAS.pi} className={`h-4 w-4 ${ok ? "" : "opacity-40"}`} />
              {t("meta", { digitos: m.digitos })} · +{m.fichas} {nombreFicha}
            </span>
          );
        })}
      </div>
      {estado.fichas > 0 && <p className="text-sm font-bold text-[#5DE4FF]">{t("ganadas", { n: estado.fichas, ficha: nombreFicha })}</p>}
    </div>
  );
}
