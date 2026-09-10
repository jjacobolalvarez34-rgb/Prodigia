import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireMundoAnatomia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import FondoMundo from "@/components/FondoMundo";
import FondoCursorMundo from "@/components/FondoCursorMundo";
import TopicCard from "@/components/TopicCard";
import NivelMundoBadge from "@/components/NivelMundoBadge";
import NivelMundoProgreso from "@/components/NivelMundoProgreso";
import type { SincronizarProgresoRow } from "@/lib/mundos/progresoNivel";
import AvisoPrimeraVez from "@/components/AvisoPrimeraVez";
import { IconCheck, IconAnatomia } from "@/components/icons";
import { NOMBRE_MODO_ANATOMIA, type ModoAnatomia } from "@/lib/practica/anatomia";
import { COLOR_ANATOMIA } from "./colores";

export const metadata: Metadata = {
  title: "Anatomía",
  description: "Huesos, músculos, órganos y sistema nervioso, con dificultad adaptativa.",
};

export default async function AnatomiaHomePage() {
  const supabase = await createClient();
  const { user, profile } = await requireMundoAnatomia(supabase, "/anatomia");

  const hoyIso = new Date().toISOString().slice(0, 10);
  const [{ data: nivelRows }, { data: dailyHoy }, { data: mundoProgreso }] = await Promise.all([
    supabase
      .from("skill_levels")
      .select("problem_type, nivel")
      .eq("user_id", user.id)
      .in("problem_type", ["anatomia_oseo", "anatomia_muscular", "anatomia_organos", "anatomia_nervioso"]),
    supabase.from("daily_progress").select("xp_ganado").eq("user_id", user.id).eq("fecha", hoyIso).maybeSingle(),
    supabase.rpc("sincronizar_progreso_mundo", { p_world: "anatomia" }).returns<SincronizarProgresoRow[]>().maybeSingle(),
  ]);

  const nivelDe = (modo: ModoAnatomia) => nivelRows?.find((r) => r.problem_type === `anatomia_${modo}`)?.nivel ?? 1;
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
      <FondoMundo mundo="anatomia" />
      <FondoCursorMundo mundo="anatomia" />
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
        <AvisoPrimeraVez
          avisoKey="anatomia-intro"
          texto="Huesos, músculos, órganos y sistema nervioso — con dificultad que se adapta a vos, igual que en los demás mundos."
        >
          <div>
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR_ANATOMIA }}>
              Anatomía
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">El cuerpo humano</h1>
            <div className="mt-2">
              <NivelMundoBadge nombreMundo="Anatomía" nivel={nivelMundo} colorHex={COLOR_ANATOMIA} />
            </div>
          </div>
        </AvisoPrimeraVez>

        <NivelMundoProgreso nombreMundo="Anatomía" colorHex={COLOR_ANATOMIA} progreso={progresoMundo} />

        {metaCumplidaHoy && (
          <div className="flex items-center gap-3 rounded-2xl bg-correcto/10 px-5 py-4">
            <IconCheck className="h-5 w-5 shrink-0 text-correcto" />
            <p className="text-sm font-medium text-foreground">Ya cumpliste tu meta de hoy.</p>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/anatomia/elegir"
            className="group flex flex-col gap-3 rounded-2xl border-2 px-6 py-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{
              borderColor: `color-mix(in oklab, ${COLOR_ANATOMIA} 35%, transparent)`,
              background: `color-mix(in oklab, ${COLOR_ANATOMIA} 7%, var(--surface))`,
            }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full text-white" style={{ background: COLOR_ANATOMIA }}>
              <IconAnatomia className="h-5 w-5" />
            </span>
            <div>
              <span className="font-display text-xl font-bold text-foreground">Practicar</span>
              <p className="mt-1 text-sm text-texto-secundario">Huesos, músculos, órganos y sistema nervioso.</p>
            </div>
          </Link>

          <Link
            href="/anatomia/aprender"
            className="group flex flex-col gap-3 rounded-2xl border-2 px-6 py-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{
              borderColor: `color-mix(in oklab, ${COLOR_ANATOMIA} 35%, transparent)`,
              background: `color-mix(in oklab, ${COLOR_ANATOMIA} 7%, var(--surface))`,
            }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full text-white" style={{ background: COLOR_ANATOMIA }}>
              <IconAnatomia className="h-5 w-5" />
            </span>
            <div>
              <span className="font-display text-xl font-bold text-foreground">Aprender</span>
              <p className="mt-1 text-sm text-texto-secundario">Técnicas de memorización, un sistema a la vez.</p>
            </div>
          </Link>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold text-foreground">Sistemas</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TopicCard nombre={NOMBRE_MODO_ANATOMIA.oseo} Icono={IconAnatomia} badge={{ tipo: "nivel", nivel: nivelDe("oseo") }} colorHex={COLOR_ANATOMIA} />
            <TopicCard nombre={NOMBRE_MODO_ANATOMIA.muscular} Icono={IconAnatomia} badge={{ tipo: "nivel", nivel: nivelDe("muscular") }} colorHex={COLOR_ANATOMIA} />
            <TopicCard nombre={NOMBRE_MODO_ANATOMIA.organos} Icono={IconAnatomia} badge={{ tipo: "nivel", nivel: nivelDe("organos") }} colorHex={COLOR_ANATOMIA} />
            <TopicCard nombre={NOMBRE_MODO_ANATOMIA.nervioso} Icono={IconAnatomia} badge={{ tipo: "nivel", nivel: nivelDe("nervioso") }} colorHex={COLOR_ANATOMIA} />
          </div>
        </section>
      </div>
    </>
  );
}
