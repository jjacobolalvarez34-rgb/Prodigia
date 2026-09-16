import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoMelodia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import { IconMelodia } from "@/components/icons";
import { COLOR_MELODIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Melodia.elegir.metadata");
  return { title: t("title"), description: t("description") };
}

const TIPOS_MELODIA = ["melodia_fundamentos", "melodia_lectura", "melodia_alteraciones", "melodia_escalas", "melodia_acordes", "melodia_oido_absoluto"];

export default async function MelodiaElegirPage() {
  const t = await getTranslations("Melodia.elegir");
  const supabase = await createClient();
  const { user } = await requireMundoMelodia(supabase, "/melodia/elegir");

  const { data: nivelRows } = await supabase
    .from("skill_levels")
    .select("problem_type, nivel")
    .eq("user_id", user.id)
    .in("problem_type", TIPOS_MELODIA);
  const nivelDe = (tipo: string) => nivelRows?.find((r) => r.problem_type === tipo)?.nivel ?? 1;

  const modos = [
    { id: "fundamentos", nombre: t("modos.fundamentos.nombre"), desc: t("modos.fundamentos.descripcion"), href: "/melodia/practica", nivel: nivelDe("melodia_fundamentos") },
    { id: "lectura", nombre: t("modos.lectura.nombre"), desc: t("modos.lectura.descripcion"), href: "/melodia/practica/lectura", nivel: nivelDe("melodia_lectura") },
    { id: "alteraciones", nombre: t("modos.alteraciones.nombre"), desc: t("modos.alteraciones.descripcion"), href: "/melodia/practica/alteraciones", nivel: nivelDe("melodia_alteraciones") },
    { id: "escalas", nombre: t("modos.escalas.nombre"), desc: t("modos.escalas.descripcion"), href: "/melodia/practica/escalas", nivel: nivelDe("melodia_escalas") },
    { id: "acordes", nombre: t("modos.acordes.nombre"), desc: t("modos.acordes.descripcion"), href: "/melodia/practica/acordes", nivel: nivelDe("melodia_acordes") },
    { id: "oidoAbsoluto", nombre: t("modos.oidoAbsoluto.nombre"), desc: t("modos.oidoAbsoluto.descripcion"), href: "/melodia/practica/oido-absoluto", nivel: nivelDe("melodia_oido_absoluto") },
  ];

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
          <p className="mt-2 text-sm text-texto-secundario">{t("subtitulo")}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {modos.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className="flex items-center gap-4 rounded-2xl border-2 border-border bg-surface px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primario/40 hover:shadow-lg"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: COLOR_MELODIA }}
              >
                <IconMelodia className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-foreground">{m.nombre}</p>
                <p className="text-xs text-texto-secundario">{m.desc}</p>
              </div>
              <LevelDial nivel={m.nivel} size={44} mostrarEtiqueta={false} colorHex={COLOR_MELODIA} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
