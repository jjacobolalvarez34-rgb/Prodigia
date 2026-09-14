import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoQuimia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import { IconQuimica } from "@/components/icons";
import { COLOR_QUIMIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Quimia.elegir.metadata");
  return { title: t("title"), description: t("description") };
}

// Fase 2 ("Practicar" estandarizado): la home ya no lleva directo a un
// modo puntual — entra acá primero, con el nivel real de cada modo
// (ya son sub-temas propios en skill_levels desde antes).
export default async function QuimiaElegirPage() {
  const t = await getTranslations("Quimia");
  const supabase = await createClient();
  const { user } = await requireMundoQuimia(supabase, "/quimia/elegir");

  const { data: nivelRows } = await supabase
    .from("skill_levels")
    .select("problem_type, nivel")
    .eq("user_id", user.id)
    .in("problem_type", ["quimia_simbolos", "quimia_formulas", "quimia_tabla", "quimia_nomenclatura", "quimia_organica"]);
  const nivelDe = (tipo: string) => nivelRows?.find((r) => r.problem_type === tipo)?.nivel ?? 1;

  const modos = [
    { nombre: t("modos.simbolos"), desc: t("elegir.descSimbolos"), href: "/quimia/practica", nivel: nivelDe("quimia_simbolos") },
    { nombre: t("modos.formulas"), desc: t("elegir.descFormulas"), href: "/quimia/practica/formulas", nivel: nivelDe("quimia_formulas") },
    { nombre: t("modos.tabla"), desc: t("elegir.descTabla"), href: "/quimia/practica/tabla", nivel: nivelDe("quimia_tabla") },
    { nombre: t("modos.nomenclatura"), desc: t("elegir.descNomenclatura"), href: "/quimia/practica/nomenclatura", nivel: nivelDe("quimia_nomenclatura") },
    { nombre: t("modos.organica"), desc: t("elegir.descOrganica"), href: "/quimia/practica/organica", nivel: nivelDe("quimia_organica") },
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
          {modos.map((m) => (
            <Link
              key={m.nombre}
              href={m.href}
              className="flex items-center gap-4 rounded-2xl border-2 border-border bg-surface px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primario/40 hover:shadow-lg"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: COLOR_QUIMIA }}
              >
                <IconQuimica className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-foreground">{m.nombre}</p>
                <p className="text-xs text-texto-secundario">{m.desc}</p>
              </div>
              <LevelDial nivel={m.nivel} size={44} mostrarEtiqueta={false} colorHex={COLOR_QUIMIA} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
