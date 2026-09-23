import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoEnigmia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import LevelDial from "@/app/[locale]/practica/LevelDial";
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
// patrón que ya tienen los demás mundos con varios modos (ver
// quimia/elegir/page.tsx, anatomia/elegir/page.tsx): tarjeta con
// Link + LevelDial por modo/categoría.
//
// Corrección 2026-09-22 (docs/PARIDAD_MUNDOS.md, fila 1 — el único ❌
// real de la matriz completa): logic_skill_levels ahora calibra por
// categoría (0205_enigmia_niveles_por_categoria.sql), ya no es un nivel
// único repetido en las 4 tarjetas. La tarjeta "mezcla" (práctica libre
// sin categoría fija, /enigmia/practica sin ?categoria=) muestra el
// PROMEDIO de las 4 — mismo criterio que ya usa Numeria en
// /practica/temas para agrupar sub-niveles (p.ej. "Aritmética") en un
// solo número representativo.
export default async function EnigmiaElegirPage() {
  const t = await getTranslations("Enigmia");
  const supabase = await createClient();
  const { user } = await requireMundoEnigmia(supabase, "/enigmia/elegir");

  const { data: nivelRows } = await supabase.from("logic_skill_levels").select("categoria, nivel").eq("user_id", user.id);
  const nivelDe = (cat: CategoriaEnigmia) => nivelRows?.find((r) => r.categoria === cat)?.nivel ?? 1;
  const nivelPromedio = Math.round(CATEGORIAS.reduce((acc, cat) => acc + nivelDe(cat), 0) / CATEGORIAS.length);

  const tarjetas: { nombre: string; href: string; nivel: number }[] = [
    { nombre: t("practicaClient.categorias.mezcla"), href: "/enigmia/practica", nivel: nivelPromedio },
    ...CATEGORIAS.map((cat) => ({
      nombre: NOMBRE_CATEGORIA_ENIGMIA[cat],
      href: `/enigmia/practica?categoria=${cat}`,
      nivel: nivelDe(cat),
    })),
  ];

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("elegir.titulo")}</h1>
          <p className="mt-2 text-sm text-texto-secundario">{t("elegir.subtitulo")}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tarjetas.map((c) => (
            <Link
              key={c.nombre}
              href={c.href}
              className="flex items-center gap-4 rounded-2xl border-2 border-border bg-surface px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primario/40 hover:shadow-lg"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: COLOR }}
              >
                <IconLogica className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-foreground">{c.nombre}</p>
              </div>
              <LevelDial nivel={c.nivel} size={44} mostrarEtiqueta={false} colorHex={COLOR} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
