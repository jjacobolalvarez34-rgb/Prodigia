import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireMundoQuimia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import FondoMundo from "@/components/FondoMundo";
import FondoCursorMundo from "@/components/FondoCursorMundo";
import TopicCard from "@/components/TopicCard";
import NivelMundoBadge from "@/components/NivelMundoBadge";
import AvisoPrimeraVez from "@/components/AvisoPrimeraVez";
import { IconCheck, IconQuimica } from "@/components/icons";
import { COLOR_QUIMIA } from "./colores";

export const metadata: Metadata = {
  title: "Quimia",
  description: "Elementos, símbolos y fórmulas químicas, con dificultad adaptativa.",
};

export default async function QuimiaHomePage() {
  const supabase = await createClient();
  const { user, profile } = await requireMundoQuimia(supabase, "/quimia");

  const hoyIso = new Date().toISOString().slice(0, 10);
  const [{ data: nivelRows }, { data: dailyHoy }, { data: worldRow }] = await Promise.all([
    supabase
      .from("skill_levels")
      .select("problem_type, nivel")
      .eq("user_id", user.id)
      .in("problem_type", ["quimia_simbolos", "quimia_formulas", "quimia_tabla"]),
    supabase.from("daily_progress").select("xp_ganado").eq("user_id", user.id).eq("fecha", hoyIso).maybeSingle(),
    supabase.from("world_progress").select("nivel_mundo").eq("user_id", user.id).eq("world", "quimia").maybeSingle(),
  ]);

  const nivelDe = (tipo: string) => nivelRows?.find((r) => r.problem_type === tipo)?.nivel ?? 1;
  const nivelMundo = worldRow?.nivel_mundo ?? 1;
  const metaXpDiaria = profile.meta_xp_diaria ?? 400;
  const xpHoy = dailyHoy?.xp_ganado ?? 0;
  const metaCumplidaHoy = xpHoy >= metaXpDiaria;

  return (
    <>
      <FondoMundo mundo="quimia" />
      <FondoCursorMundo mundo="quimia" />
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
        <AvisoPrimeraVez
          avisoKey="quimia-intro"
          texto="Elementos, símbolos, fórmulas y la tabla periódica — con dificultad que se adapta a vos, igual que en los demás mundos."
        >
          <div>
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR_QUIMIA }}>
              Quimia
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Elementos y compuestos</h1>
            <div className="mt-2">
              <NivelMundoBadge nombreMundo="Quimia" nivel={nivelMundo} colorHex={COLOR_QUIMIA} />
            </div>
          </div>
        </AvisoPrimeraVez>

        {metaCumplidaHoy && (
          <div className="flex items-center gap-3 rounded-2xl bg-correcto/10 px-5 py-4">
            <IconCheck className="h-5 w-5 shrink-0 text-correcto" />
            <p className="text-sm font-medium text-foreground">Ya cumpliste tu meta de hoy.</p>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/quimia/practica"
            className="group flex flex-col gap-3 rounded-2xl border-2 px-6 py-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{
              borderColor: `color-mix(in oklab, ${COLOR_QUIMIA} 35%, transparent)`,
              background: `color-mix(in oklab, ${COLOR_QUIMIA} 7%, var(--surface))`,
            }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full text-white" style={{ background: COLOR_QUIMIA }}>
              <IconQuimica className="h-5 w-5" />
            </span>
            <div>
              <span className="font-display text-xl font-bold text-foreground">Practicar</span>
              <p className="mt-1 text-sm text-texto-secundario">Elementos, fórmulas y la tabla periódica.</p>
            </div>
          </Link>

          <Link
            href="/quimia/aprender"
            className="group flex flex-col gap-3 rounded-2xl border-2 px-6 py-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{
              borderColor: `color-mix(in oklab, ${COLOR_QUIMIA} 35%, transparent)`,
              background: `color-mix(in oklab, ${COLOR_QUIMIA} 7%, var(--surface))`,
            }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full text-white" style={{ background: COLOR_QUIMIA }}>
              <IconQuimica className="h-5 w-5" />
            </span>
            <div>
              <span className="font-display text-xl font-bold text-foreground">Aprender</span>
              <p className="mt-1 text-sm text-texto-secundario">Trucos mnemotécnicos para memorizar más rápido.</p>
            </div>
          </Link>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold text-foreground">Modos</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <TopicCard
              nombre="Símbolos y elementos"
              Icono={IconQuimica}
              href="/quimia/practica"
              badge={{ tipo: "nivel", nivel: nivelDe("quimia_simbolos") }}
              colorHex={COLOR_QUIMIA}
            />
            <TopicCard
              nombre="Fórmulas y compuestos"
              Icono={IconQuimica}
              href="/quimia/practica/formulas"
              badge={{ tipo: "nivel", nivel: nivelDe("quimia_formulas") }}
              colorHex={COLOR_QUIMIA}
            />
            <TopicCard
              nombre="Tabla periódica"
              Icono={IconQuimica}
              href="/quimia/practica/tabla"
              badge={{ tipo: "nivel", nivel: nivelDe("quimia_tabla") }}
              colorHex={COLOR_QUIMIA}
            />
          </div>
        </section>
      </div>
    </>
  );
}
