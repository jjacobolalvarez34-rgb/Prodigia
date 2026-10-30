"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import DibujoTema from "@/components/temas/DibujoTema";
import { createClient } from "@/lib/supabase/client";
import { COLECCIONES, slugEvento } from "@/lib/temas/colecciones";
import { escenaHuevos } from "@/lib/temas/escenasFiestas";
import { diaUtc, FICHAS_TODOS_HUEVOS, LUGARES_HUEVOS, lugarHuevoDe, PISTAS_HUEVOS, premiosMinievento, type PremioMinievento } from "@/lib/temas/minieventos";
import type { TemaActivo } from "@/lib/temas/temas";

// Pascua · «Huevos escondidos» (0311), en el Inicio: cuántos encontraste y la pista de
// dónde está el de hoy. El huevo en sí está en otra pantalla (HuevoEscondido).
export default function Huevos({ tema }: { tema: TemaActivo }) {
  const t = useTranslations("Minieventos.huevos");
  const en = useLocale() === "en";
  const hoy = diaUtc();
  const { desde, hasta } = tema.hoy.rango;
  const slug = slugEvento("pascua", desde);
  const ficha = COLECCIONES.pascua!.ficha;
  const [premios, setPremios] = useState<PremioMinievento[] | null>(null);

  useEffect(() => {
    let vivo = true;
    void premiosMinievento(createClient(), slug).then((r) => {
      if (vivo) setPremios(r ?? []);
    });
    return () => {
      vivo = false;
    };
  }, [slug]);

  const dias = useMemo(() => {
    const lista: string[] = [];
    for (let d = Date.parse(`${desde}T00:00:00Z`); d <= Date.parse(`${hasta}T00:00:00Z`) && lista.length < LUGARES_HUEVOS.length; d += 86_400_000) lista.push(new Date(d).toISOString().slice(0, 10));
    return lista;
  }, [desde, hasta]);
  const encontrado = (d: string) => !!premios?.some((p) => p.clave === `huevo:${d}`);
  const lugar = lugarHuevoDe(desde, hoy);
  const n = dias.filter(encontrado).length;
  const todos = !!premios?.some((p) => p.clave === "huevos:todos");

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B2A1F]">
        <DibujoTema dibujo={escenaHuevos(dias.map(encontrado))} className="block h-auto w-full" />
      </div>
      <p className="font-mono text-xs font-bold text-[#9BE7FF]">{premios ? t("encontrados", { n, total: dias.length }) : "…"}</p>
      {todos ? (
        <p className="text-sm font-bold text-[#FFD36B]">{t("todos", { fichas: FICHAS_TODOS_HUEVOS, ficha: en ? ficha.nombreEn : ficha.nombre })}</p>
      ) : encontrado(hoy) ? (
        <p className="text-sm text-texto-secundario">{t("hoyListo")}</p>
      ) : (
        lugar && <p className="text-sm font-semibold text-foreground">{en ? PISTAS_HUEVOS[lugar].en : PISTAS_HUEVOS[lugar].es}</p>
      )}
    </div>
  );
}
