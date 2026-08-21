import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import FondoMundo from "@/components/FondoMundo";
import FondoCursorMundo from "@/components/FondoCursorMundo";
import TopicCard from "@/components/TopicCard";
import NivelMundoBadge from "@/components/NivelMundoBadge";
import { IconCheck, IconGeometria } from "@/components/icons";
import { COLOR_GEOGRAFIA } from "./GeografiaMapa";

export const metadata: Metadata = {
  title: "Geografía",
  description: "Ubicá países de América en el mapa, con dificultad adaptativa.",
};

export default async function GeografiaHomePage() {
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/geografia");

  const hoyIso = new Date().toISOString().slice(0, 10);
  const [{ data: nivelRow }, { data: dailyHoy }, { data: worldRow }] = await Promise.all([
    // Nivel único compartido entre continentes (mismo patrón que el resto
    // del mundo: un problem_type = un nivel, sin importar qué región).
    supabase.from("skill_levels").select("nivel").eq("user_id", user.id).eq("problem_type", "geografia").maybeSingle(),
    supabase.from("daily_progress").select("xp_ganado").eq("user_id", user.id).eq("fecha", hoyIso).maybeSingle(),
    supabase.from("world_progress").select("nivel_mundo").eq("user_id", user.id).eq("world", "geografia").maybeSingle(),
  ]);

  const nivel = nivelRow?.nivel ?? 1;
  const nivelMundo = worldRow?.nivel_mundo ?? 1;
  const metaXpDiaria = profile.meta_xp_diaria ?? 500;
  const xpHoy = dailyHoy?.xp_ganado ?? 0;
  const metaCumplidaHoy = xpHoy >= metaXpDiaria;

  return (
    <>
      <FondoMundo mundo="geografia" />
      <FondoCursorMundo mundo="geografia" />
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR_GEOGRAFIA }}>
            Geografía
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Mapas del mundo</h1>
          <div className="mt-2">
            <NivelMundoBadge nombreMundo="Geografía" nivel={nivelMundo} colorHex={COLOR_GEOGRAFIA} />
          </div>
        </div>

        {metaCumplidaHoy && (
          <div className="flex items-center gap-3 rounded-2xl bg-correcto/10 px-5 py-4">
            <IconCheck className="h-5 w-5 shrink-0 text-correcto" />
            <p className="text-sm font-medium text-foreground">Ya cumpliste tu meta de hoy.</p>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/geografia/practica"
            className="group flex flex-col gap-3 rounded-2xl border-2 px-6 py-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{
              borderColor: `color-mix(in oklab, ${COLOR_GEOGRAFIA} 35%, transparent)`,
              background: `color-mix(in oklab, ${COLOR_GEOGRAFIA} 7%, var(--surface))`,
            }}
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-white"
              style={{ background: COLOR_GEOGRAFIA }}
            >
              <IconGeometria className="h-5 w-5" />
            </span>
            <div>
              <span className="font-display text-xl font-bold text-foreground">Practicar</span>
              <p className="mt-1 text-sm text-texto-secundario">Ubicá países de América en el mapa.</p>
            </div>
          </Link>

          <Link
            href="/geografia/aprender"
            className="group flex flex-col gap-3 rounded-2xl border-2 px-6 py-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{
              borderColor: `color-mix(in oklab, ${COLOR_GEOGRAFIA} 35%, transparent)`,
              background: `color-mix(in oklab, ${COLOR_GEOGRAFIA} 7%, var(--surface))`,
            }}
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-white"
              style={{ background: COLOR_GEOGRAFIA }}
            >
              <IconGeometria className="h-5 w-5" />
            </span>
            <div>
              <span className="font-display text-xl font-bold text-foreground">Aprender</span>
              <p className="mt-1 text-sm text-texto-secundario">Trucos mnemotécnicos para ubicar países más rápido.</p>
            </div>
          </Link>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold text-foreground">Regiones</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TopicCard
              nombre="América"
              Icono={IconGeometria}
              href="/geografia/practica"
              badge={{ tipo: "nivel", nivel }}
              colorHex={COLOR_GEOGRAFIA}
            />
            <TopicCard
              nombre="Europa"
              Icono={IconGeometria}
              href="/geografia/practica/europa"
              badge={{ tipo: "nivel", nivel }}
              colorHex={COLOR_GEOGRAFIA}
            />
            <TopicCard
              nombre="África"
              Icono={IconGeometria}
              href="/geografia/practica/africa"
              badge={{ tipo: "nivel", nivel }}
              colorHex={COLOR_GEOGRAFIA}
            />
            <TopicCard
              nombre="Asia y Oceanía"
              Icono={IconGeometria}
              href="/geografia/practica/asia-oceania"
              badge={{ tipo: "nivel", nivel }}
              colorHex={COLOR_GEOGRAFIA}
            />
          </div>
        </section>
      </div>
    </>
  );
}
