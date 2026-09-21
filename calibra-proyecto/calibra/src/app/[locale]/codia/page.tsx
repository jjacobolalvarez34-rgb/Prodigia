import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoCodia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import FondoMundo from "@/components/FondoMundo";
import FondoCursorMundo from "@/components/FondoCursorMundo";
import TopicCard from "@/components/TopicCard";
import NivelMundoBadge from "@/components/NivelMundoBadge";
import NivelMundoProgreso from "@/components/NivelMundoProgreso";
import type { SincronizarProgresoRow } from "@/lib/mundos/progresoNivel";
import AvisoPrimeraVez from "@/components/AvisoPrimeraVez";
import { IconCheck, IconCodia } from "@/components/icons";
import { COLOR_CODIA } from "./colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Codia.metadata");
  return { title: t("title"), description: t("description") };
}

const TIPOS_CODIA = ["codia_sintaxis", "codia_salida", "codia_error", "codia_estructuras"];

export default async function CodiaHomePage() {
  const t = await getTranslations("Codia");
  const supabase = await createClient();
  const { user, profile } = await requireMundoCodia(supabase, "/codia");

  const hoyIso = new Date().toISOString().slice(0, 10);
  const [{ data: nivelRows }, { data: dailyHoy }, { data: mundoProgreso }] = await Promise.all([
    supabase.from("skill_levels").select("problem_type, nivel").eq("user_id", user.id).in("problem_type", TIPOS_CODIA),
    supabase.from("daily_progress").select("xp_ganado").eq("user_id", user.id).eq("fecha", hoyIso).maybeSingle(),
    supabase.rpc("sincronizar_progreso_mundo", { p_world: "codia" }).returns<SincronizarProgresoRow[]>().maybeSingle(),
  ]);

  const nivelDe = (tipo: string) => nivelRows?.find((r) => r.problem_type === tipo)?.nivel ?? 1;
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
      <FondoMundo mundo="codia" />
      <FondoCursorMundo mundo="codia" />
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
        <AvisoPrimeraVez avisoKey="codia-intro" texto={t("aviso")}>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR_CODIA }}>
              {t("nombreMundo")}
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
            <div className="mt-2">
              <NivelMundoBadge nombreMundo={t("nombreMundo")} nivel={nivelMundo} colorHex={COLOR_CODIA} />
            </div>
          </div>
        </AvisoPrimeraVez>

        <NivelMundoProgreso nombreMundo={t("nombreMundo")} colorHex={COLOR_CODIA} progreso={progresoMundo} />

        {metaCumplidaHoy && (
          <div className="flex items-center gap-3 rounded-2xl bg-correcto/10 px-5 py-4">
            <IconCheck className="h-5 w-5 shrink-0 text-correcto" />
            <p className="text-sm font-medium text-foreground">{t("metaCumplida")}</p>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/codia/elegir"
            className="group flex flex-col gap-3 rounded-2xl border-2 px-6 py-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{
              borderColor: `color-mix(in oklab, ${COLOR_CODIA} 35%, transparent)`,
              background: `color-mix(in oklab, ${COLOR_CODIA} 7%, var(--surface))`,
            }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full text-white" style={{ background: COLOR_CODIA }}>
              <IconCodia className="h-5 w-5" />
            </span>
            <div>
              <span className="font-display text-xl font-bold text-foreground">{t("practicar")}</span>
              <p className="mt-1 text-sm text-texto-secundario">{t("practicarDescripcion")}</p>
            </div>
          </Link>

          <Link
            href="/codia/aprender"
            className="group flex flex-col gap-3 rounded-2xl border-2 px-6 py-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{
              borderColor: `color-mix(in oklab, ${COLOR_CODIA} 35%, transparent)`,
              background: `color-mix(in oklab, ${COLOR_CODIA} 7%, var(--surface))`,
            }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full text-white" style={{ background: COLOR_CODIA }}>
              <IconCodia className="h-5 w-5" />
            </span>
            <div>
              <span className="font-display text-xl font-bold text-foreground">{t("aprenderCard")}</span>
              <p className="mt-1 text-sm text-texto-secundario">{t("aprenderDescripcion")}</p>
            </div>
          </Link>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold text-foreground">{t("modosTitulo")}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TopicCard nombre={t("modos.sintaxis")} Icono={IconCodia} badge={{ tipo: "nivel", nivel: nivelDe("codia_sintaxis") }} colorHex={COLOR_CODIA} />
            <TopicCard nombre={t("modos.salida")} Icono={IconCodia} badge={{ tipo: "nivel", nivel: nivelDe("codia_salida") }} colorHex={COLOR_CODIA} />
            <TopicCard nombre={t("modos.error")} Icono={IconCodia} badge={{ tipo: "nivel", nivel: nivelDe("codia_error") }} colorHex={COLOR_CODIA} />
            <TopicCard nombre={t("modos.estructuras")} Icono={IconCodia} badge={{ tipo: "nivel", nivel: nivelDe("codia_estructuras") }} colorHex={COLOR_CODIA} />
          </div>
        </section>
      </div>
    </>
  );
}
