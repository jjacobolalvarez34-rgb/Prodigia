"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { sellosAlineacionDe } from "@/lib/recompensas/alineacion";

// Los sellos de la Gran Alineación en la Placa (0290): uno por cada Alineación en la
// que jugó, numerados. Solo aparece si tiene alguno.
export function Sello({ numero, tam = 64 }: { numero: number; tam?: number }) {
  return (
    <span
      className="relative inline-flex flex-col items-center justify-center rounded-full border-[1.5px] border-[#05060F] shadow-[0_0_16px_rgba(242,193,78,0.45)]"
      style={{ width: tam, height: tam, background: "linear-gradient(150deg, #FFE9A8 0%, #E8A317 55%, #9A5B0C 100%)" }}
      title={`Testigo de la Alineación #${numero}`}
    >
      <span className="absolute inset-1 rounded-full border border-[#4A2A05]/45" />
      <span className="font-mono font-bold tracking-widest text-[#4A2A05]" style={{ fontSize: tam * 0.12 }}>
        TESTIGO
      </span>
      <span className="font-display font-black leading-none text-[#2A1602]" style={{ fontSize: tam * 0.32 }}>
        #{numero}
      </span>
    </span>
  );
}

export default function SellosAlineacion({ userId }: { userId: string }) {
  const t = useTranslations("Alineacion");
  const [sellos, setSellos] = useState<number[]>([]);
  useEffect(() => {
    let vivo = true;
    sellosAlineacionDe(createClient(), userId).then((s) => vivo && setSellos(s));
    return () => {
      vivo = false;
    };
  }, [userId]);
  if (sellos.length === 0) return null;
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="mb-3 font-display text-lg font-bold text-foreground">{t("sellos")}</h2>
      <div className="flex flex-wrap gap-3">
        {sellos.map((n) => (
          <Sello key={n} numero={n} />
        ))}
      </div>
    </motion.section>
  );
}
