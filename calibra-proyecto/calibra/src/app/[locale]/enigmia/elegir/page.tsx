import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoEnigmia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import TopicCard from "@/components/TopicCard";
import { NOMBRE_CATEGORIA_ENIGMIA, type CategoriaEnigmia } from "@/types/database";
import { IconLogica } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Enigmia.elegir.metadata");
  return { title: t("title"), description: t("description") };
}

const CATEGORIAS: CategoriaEnigmia[] = ["memoria", "patrones", "deduccion", "computacional"];
const COLOR = "#0E9F6E";

// Pedido en vivo (2026-09-15): "Enigmia es el único mundo que no tiene
// la pantalla de elegir habilidad/sector antes de practicar" — mismo
// patrón que ya tienen los demás (ver quimia/elegir/page.tsx): "Practicar"
// en la home ya no entra directo a la partida, primero pasa por acá.
// Enigmia no tiene nivel POR categoría (logic_skill_levels es un nivel
// único, a diferencia de skill_levels de Numeria/Quimia) — se muestra
// el mismo nivel general en las 5 tarjetas, no hay 5 niveles distintos
// que mostrar de verdad.
export default async function EnigmiaElegirPage() {
  const t = await getTranslations("Enigmia");
  const supabase = await createClient();
  const { user } = await requireMundoEnigmia(supabase, "/enigmia/elegir");

  const { data: nivelRow } = await supabase.from("logic_skill_levels").select("nivel").eq("user_id", user.id).maybeSingle();
  const nivel = nivelRow?.nivel ?? 1;

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("elegir.titulo")}</h1>
          <p className="mt-2 text-sm text-texto-secundario">{t("elegir.subtitulo")}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TopicCard
            nombre={t("practicaClient.categorias.mezcla")}
            Icono={IconLogica}
            href="/enigmia/practica"
            badge={{ tipo: "nivel", nivel }}
            colorHex={COLOR}
          />
          {CATEGORIAS.map((cat) => (
            <TopicCard
              key={cat}
              nombre={NOMBRE_CATEGORIA_ENIGMIA[cat]}
              Icono={IconLogica}
              href={`/enigmia/practica?categoria=${cat}`}
              badge={{ tipo: "nivel", nivel }}
              colorHex={COLOR}
            />
          ))}
        </div>
      </div>
    </>
  );
}
