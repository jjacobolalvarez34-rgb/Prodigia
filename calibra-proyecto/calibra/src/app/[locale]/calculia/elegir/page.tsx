import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoCalculia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import { IconCalculia } from "@/components/icons";
import { COLOR_CALCULIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Calculia.elegir.metadata");
  return { title: t("title"), description: t("description") };
}

const TIPOS_CALCULIA = ["calculia_derivadas", "calculia_integrales", "calculia_series", "calculia_multivariable"];

export default async function CalculiaElegirPage() {
  const t = await getTranslations("Calculia");
  const supabase = await createClient();
  const { user } = await requireMundoCalculia(supabase, "/calculia/elegir");

  const { data: nivelRows } = await supabase
    .from("skill_levels")
    .select("problem_type, nivel")
    .eq("user_id", user.id)
    .in("problem_type", TIPOS_CALCULIA);
  const nivelDe = (tipo: string) => nivelRows?.find((r) => r.problem_type === tipo)?.nivel ?? 1;

  const modos = [
    { nombre: t("modos.derivadas"), desc: t("elegir.descripciones.derivadas"), href: "/calculia/practica", nivel: nivelDe("calculia_derivadas") },
    { nombre: t("modos.integrales"), desc: t("elegir.descripciones.integrales"), href: "/calculia/practica/integrales", nivel: nivelDe("calculia_integrales") },
    { nombre: t("modos.series"), desc: t("elegir.descripciones.series"), href: "/calculia/practica/series", nivel: nivelDe("calculia_series") },
    { nombre: `${t("modos.multivariable")} 🔥`, desc: t("elegir.descripciones.multivariable"), href: "/calculia/practica/multivariable", nivel: nivelDe("calculia_multivariable") },
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
                style={{ background: COLOR_CALCULIA }}
              >
                <IconCalculia className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-foreground">{m.nombre}</p>
                <p className="text-xs text-texto-secundario">{m.desc}</p>
              </div>
              <LevelDial nivel={m.nivel} size={44} mostrarEtiqueta={false} colorHex={COLOR_CALCULIA} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
