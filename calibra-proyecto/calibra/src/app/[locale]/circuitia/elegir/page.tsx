import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoCircuitia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import { IconCircuitia } from "@/components/icons";
import { COLOR_CIRCUITIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Circuitia.elegir.metadata");
  return { title: t("title"), description: t("description") };
}

const TIPOS_CIRCUITIA = ["circuitia_serie", "circuitia_paralelo", "circuitia_mixto", "circuitia_cualitativo"];

export default async function CircuitiaElegirPage() {
  const t = await getTranslations("Circuitia");
  const supabase = await createClient();
  const { user } = await requireMundoCircuitia(supabase, "/circuitia/elegir");

  const { data: nivelRows } = await supabase
    .from("skill_levels")
    .select("problem_type, nivel")
    .eq("user_id", user.id)
    .in("problem_type", TIPOS_CIRCUITIA);
  const nivelDe = (tipo: string) => nivelRows?.find((r) => r.problem_type === tipo)?.nivel ?? 1;

  const modos = [
    { nombre: t("modos.serie"), desc: t("elegir.descripciones.serie"), href: "/circuitia/practica", nivel: nivelDe("circuitia_serie") },
    { nombre: t("modos.paralelo"), desc: t("elegir.descripciones.paralelo"), href: "/circuitia/practica/paralelo", nivel: nivelDe("circuitia_paralelo") },
    { nombre: t("modos.mixto"), desc: t("elegir.descripciones.mixto"), href: "/circuitia/practica/mixto", nivel: nivelDe("circuitia_mixto") },
    { nombre: `${t("modos.cualitativo")}`, desc: t("elegir.descripciones.cualitativo"), href: "/circuitia/practica/cualitativo", nivel: nivelDe("circuitia_cualitativo") },
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
                style={{ background: COLOR_CIRCUITIA }}
              >
                <IconCircuitia className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-foreground">{m.nombre}</p>
                <p className="text-xs text-texto-secundario">{m.desc}</p>
              </div>
              <LevelDial nivel={m.nivel} size={44} mostrarEtiqueta={false} colorHex={COLOR_CIRCUITIA} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
