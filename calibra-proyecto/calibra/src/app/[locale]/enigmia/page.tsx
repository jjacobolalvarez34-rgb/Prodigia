import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoEnigmia } from "@/lib/auth/guard";
import { NOMBRE_CATEGORIA_ENIGMIA, type CategoriaEnigmia } from "@/types/database";
import Header from "@/components/Header";
import FondoMundo from "@/components/FondoMundo";
import FondoCursorMundo from "@/components/FondoCursorMundo";
import ProgressDial from "@/components/ProgressDial";
import AccionMundo from "@/components/AccionMundo";
import NivelMundoBadge from "@/components/NivelMundoBadge";
import NivelMundoProgreso from "@/components/NivelMundoProgreso";
import type { SincronizarProgresoRow } from "@/lib/mundos/progresoNivel";
import TopicCard from "@/components/TopicCard";
import { IconCheck, IconLogica, IconLibro } from "@/components/icons";

const CATEGORIAS: CategoriaEnigmia[] = ["patrones", "deduccion", "memoria", "computacional"];

const COLOR = "#0E9F6E";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Enigmia.metadata");
  return { title: "Enigmia", description: t("description") };
}

export default async function EnigmiaHomePage() {
  const t = await getTranslations("Enigmia");
  const supabase = await createClient();
  const { user, profile } = await requireMundoEnigmia(supabase, "/enigmia");

  const hoyIso = new Date().toISOString().slice(0, 10);

  const [{ data: nivelRow }, { data: dailyHoy }, { data: mundoProgreso }] = await Promise.all([
    supabase.from("logic_skill_levels").select("nivel").eq("user_id", user.id).maybeSingle(),
    supabase.from("daily_progress").select("xp_ganado").eq("user_id", user.id).eq("fecha", hoyIso).maybeSingle(),
    supabase.rpc("sincronizar_progreso_mundo", { p_world: "enigmia" }).returns<SincronizarProgresoRow[]>().maybeSingle(),
  ]);

  const nivel = nivelRow?.nivel ?? 1;
  const nivelMundo = mundoProgreso?.nivel_mundo ?? 1;
  const progresoMundo = {
    puntos: mundoProgreso?.puntos_mundo ?? 0,
    nivel: nivelMundo,
    fracVolumen: mundoProgreso?.frac_volumen ?? 0,
    fracDominio: mundoProgreso?.frac_dominio ?? 0,
    fracLecciones: mundoProgreso?.frac_lecciones ?? 0,
  };
  const metaXpDiaria = profile.meta_xp_diaria ?? 500;
  const xpHoy = dailyHoy?.xp_ganado ?? 0;
  const metaCumplidaHoy = xpHoy >= metaXpDiaria;

  return (
    <>
      <FondoMundo mundo="enigmia" />
      <FondoCursorMundo mundo="enigmia" />
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR }}>
              Enigmia
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
            <div className="mt-2">
              <NivelMundoBadge nombreMundo="Enigmia" nivel={nivelMundo} colorHex={COLOR} />
            </div>
          </div>
          <ProgressDial value={nivel} max={10} size={56} colorDesde={COLOR} colorHasta="#3FB88B">
            <span className="font-mono text-lg font-bold text-foreground">{nivel}</span>
          </ProgressDial>
        </div>

        <NivelMundoProgreso nombreMundo="Enigmia" colorHex={COLOR} progreso={progresoMundo} />

        {metaCumplidaHoy && (
          <div className="flex items-center gap-3 rounded-2xl bg-correcto/10 px-5 py-4">
            <IconCheck className="h-5 w-5 shrink-0 text-correcto" />
            <p className="text-sm font-medium text-foreground">{t("metaCumplida")}</p>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <AccionMundo
            href="/enigmia/practica"
            titulo={t("practicar")}
            descripcion={t("practicarDescripcion")}
            Icono={IconLogica}
            colorHex={COLOR}
          />
          <AccionMundo
            href="/enigmia/aprender"
            titulo={t("aprender")}
            descripcion={t("aprenderDescripcion")}
            Icono={IconLibro}
            colorHex="#FFC53D"
          />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold text-foreground">{t("categoriasTitulo")}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIAS.map((cat) => (
              <TopicCard
                key={cat}
                nombre={NOMBRE_CATEGORIA_ENIGMIA[cat]}
                Icono={IconLogica}
                badge={{ tipo: "nivel", nivel }}
                colorHex={COLOR}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
