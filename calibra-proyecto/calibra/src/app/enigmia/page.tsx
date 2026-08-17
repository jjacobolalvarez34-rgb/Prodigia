import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoEnigmia } from "@/lib/auth/guard";
import { NOMBRE_CATEGORIA_ENIGMIA, type CategoriaEnigmia } from "@/types/database";
import Header from "@/components/Header";
import FondoMundo from "@/components/FondoMundo";
import FondoCursorMundo from "@/components/FondoCursorMundo";
import ProgressDial from "@/components/ProgressDial";
import AccionMundo from "@/components/AccionMundo";
import NivelMundoBadge from "@/components/NivelMundoBadge";
import TopicCard from "@/components/TopicCard";
import { IconCheck, IconLogica, IconLibro } from "@/components/icons";

const CATEGORIAS: CategoriaEnigmia[] = ["patrones", "deduccion", "memoria", "computacional"];

const COLOR = "#0E9F6E";

export const metadata: Metadata = {
  title: "Enigmia",
  description: "Acertijos de lógica: memoria, patrones, deducción y pensamiento computacional.",
};

export default async function EnigmiaHomePage() {
  const supabase = await createClient();
  const { user, profile } = await requireMundoEnigmia(supabase, "/enigmia");

  const hoyIso = new Date().toISOString().slice(0, 10);

  const [{ data: nivelRow }, { data: dailyHoy }, { data: worldRow }] = await Promise.all([
    supabase.from("logic_skill_levels").select("nivel").eq("user_id", user.id).maybeSingle(),
    supabase.from("daily_progress").select("xp_ganado").eq("user_id", user.id).eq("fecha", hoyIso).maybeSingle(),
    supabase.from("world_progress").select("nivel_mundo").eq("user_id", user.id).eq("world", "enigmia").maybeSingle(),
  ]);

  const nivel = nivelRow?.nivel ?? 1;
  const nivelMundo = worldRow?.nivel_mundo ?? 1;
  const metaXpDiaria = profile.meta_xp_diaria ?? 400;
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
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Lógica</h1>
            <div className="mt-2">
              <NivelMundoBadge nombreMundo="Enigmia" nivel={nivelMundo} colorHex={COLOR} />
            </div>
          </div>
          <ProgressDial value={nivel} max={10} size={56} colorDesde={COLOR} colorHasta="#3FB88B">
            <span className="font-mono text-lg font-bold text-foreground">{nivel}</span>
          </ProgressDial>
        </div>

        {metaCumplidaHoy && (
          <div className="flex items-center gap-3 rounded-2xl bg-correcto/10 px-5 py-4">
            <IconCheck className="h-5 w-5 shrink-0 text-correcto" />
            <p className="text-sm font-medium text-foreground">Ya cumpliste tu meta de hoy.</p>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <AccionMundo
            href="/enigmia/practica"
            titulo="Practicar"
            descripcion="Acertijos de lógica, calibrados a tu nivel."
            Icono={IconLogica}
            colorHex={COLOR}
          />
          <AccionMundo
            href="/enigmia/aprender"
            titulo="Aprender"
            descripcion="Estrategias de razonamiento, una a la vez."
            Icono={IconLibro}
            colorHex="#FFC53D"
          />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold text-foreground">Categorías</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIAS.map((cat) => (
              <TopicCard
                key={cat}
                nombre={NOMBRE_CATEGORIA_ENIGMIA[cat]}
                Icono={IconLogica}
                href="/enigmia/practica"
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
