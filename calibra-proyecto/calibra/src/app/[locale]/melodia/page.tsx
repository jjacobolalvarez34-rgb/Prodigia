import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireMundoMelodia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import FondoMundo from "@/components/FondoMundo";
import FondoCursorMundo from "@/components/FondoCursorMundo";
import TopicCard from "@/components/TopicCard";
import NivelMundoBadge from "@/components/NivelMundoBadge";
import NivelMundoProgreso from "@/components/NivelMundoProgreso";
import type { SincronizarProgresoRow } from "@/lib/mundos/progresoNivel";
import AvisoPrimeraVez from "@/components/AvisoPrimeraVez";
import { IconCheck, IconMelodia } from "@/components/icons";
import { COLOR_MELODIA } from "./colores";

export const metadata: Metadata = {
  title: "Melodía",
  description: "Pentagrama, escalas y acordes, con dificultad adaptativa.",
};

const TIPOS_MELODIA = ["melodia_fundamentos", "melodia_lectura", "melodia_alteraciones", "melodia_escalas", "melodia_acordes", "melodia_oido_absoluto"];

export default async function MelodiaHomePage() {
  const supabase = await createClient();
  const { user, profile } = await requireMundoMelodia(supabase, "/melodia");

  const hoyIso = new Date().toISOString().slice(0, 10);
  const [{ data: nivelRows }, { data: dailyHoy }, { data: mundoProgreso }] = await Promise.all([
    supabase.from("skill_levels").select("problem_type, nivel").eq("user_id", user.id).in("problem_type", TIPOS_MELODIA),
    supabase.from("daily_progress").select("xp_ganado").eq("user_id", user.id).eq("fecha", hoyIso).maybeSingle(),
    supabase.rpc("sincronizar_progreso_mundo", { p_world: "melodia" }).returns<SincronizarProgresoRow[]>().maybeSingle(),
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
      <FondoMundo mundo="melodia" />
      <FondoCursorMundo mundo="melodia" />
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
        <AvisoPrimeraVez
          avisoKey="melodia-intro"
          texto="Pentagrama, escalas y acordes reales, construidos por fórmula — con dificultad que se adapta a vos, igual que en los demás mundos."
        >
          <div>
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR_MELODIA }}>
              Melodía
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Notas, escalas y acordes</h1>
            <div className="mt-2">
              <NivelMundoBadge nombreMundo="Melodía" nivel={nivelMundo} colorHex={COLOR_MELODIA} />
            </div>
          </div>
        </AvisoPrimeraVez>

        <NivelMundoProgreso nombreMundo="Melodía" colorHex={COLOR_MELODIA} progreso={progresoMundo} />

        {metaCumplidaHoy && (
          <div className="flex items-center gap-3 rounded-2xl bg-correcto/10 px-5 py-4">
            <IconCheck className="h-5 w-5 shrink-0 text-correcto" />
            <p className="text-sm font-medium text-foreground">Ya cumpliste tu meta de hoy.</p>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/melodia/elegir"
            className="group flex flex-col gap-3 rounded-2xl border-2 px-6 py-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{
              borderColor: `color-mix(in oklab, ${COLOR_MELODIA} 35%, transparent)`,
              background: `color-mix(in oklab, ${COLOR_MELODIA} 7%, var(--surface))`,
            }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full text-white" style={{ background: COLOR_MELODIA }}>
              <IconMelodia className="h-5 w-5" />
            </span>
            <div>
              <span className="font-display text-xl font-bold text-foreground">Practicar</span>
              <p className="mt-1 text-sm text-texto-secundario">Pentagrama, alteraciones, escalas y acordes.</p>
            </div>
          </Link>

          <Link
            href="/melodia/aprender"
            className="group flex flex-col gap-3 rounded-2xl border-2 px-6 py-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{
              borderColor: `color-mix(in oklab, ${COLOR_MELODIA} 35%, transparent)`,
              background: `color-mix(in oklab, ${COLOR_MELODIA} 7%, var(--surface))`,
            }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full text-white" style={{ background: COLOR_MELODIA }}>
              <IconMelodia className="h-5 w-5" />
            </span>
            <div>
              <span className="font-display text-xl font-bold text-foreground">Aprender</span>
              <p className="mt-1 text-sm text-texto-secundario">Cómo leer el pentagrama y armar acordes.</p>
            </div>
          </Link>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold text-foreground">Modos</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <TopicCard nombre="Fundamentos" Icono={IconMelodia} badge={{ tipo: "nivel", nivel: nivelDe("melodia_fundamentos") }} colorHex={COLOR_MELODIA} />
            <TopicCard nombre="Lectura en pentagrama" Icono={IconMelodia} badge={{ tipo: "nivel", nivel: nivelDe("melodia_lectura") }} colorHex={COLOR_MELODIA} />
            <TopicCard nombre="Alteraciones" Icono={IconMelodia} badge={{ tipo: "nivel", nivel: nivelDe("melodia_alteraciones") }} colorHex={COLOR_MELODIA} />
            <TopicCard nombre="Escalas" Icono={IconMelodia} badge={{ tipo: "nivel", nivel: nivelDe("melodia_escalas") }} colorHex={COLOR_MELODIA} />
            <TopicCard nombre="Acordes" Icono={IconMelodia} badge={{ tipo: "nivel", nivel: nivelDe("melodia_acordes") }} colorHex={COLOR_MELODIA} />
            <TopicCard nombre="Oído absoluto" Icono={IconMelodia} badge={{ tipo: "nivel", nivel: nivelDe("melodia_oido_absoluto") }} colorHex={COLOR_MELODIA} />
          </div>
        </section>
      </div>
    </>
  );
}
