import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoTrigonometria } from "@/lib/auth/guard";
import Header from "@/components/Header";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import { IconTrigonometria } from "@/components/icons";
import { COLOR_TRIGONOMETRIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Trigonometria.elegir.metadata");
  return { title: t("title"), description: t("description") };
}

const TIPOS_TRIGONOMETRIA = ["trigonometria_razones", "trigonometria_circulo", "trigonometria_identidades", "trigonometria_leyes"];

export default async function TrigonometriaElegirPage() {
  const t = await getTranslations("Trigonometria");
  const supabase = await createClient();
  const { user } = await requireMundoTrigonometria(supabase, "/trigonometria/elegir");

  const { data: nivelRows } = await supabase
    .from("skill_levels")
    .select("problem_type, nivel")
    .eq("user_id", user.id)
    .in("problem_type", TIPOS_TRIGONOMETRIA);
  const nivelDe = (tipo: string) => nivelRows?.find((r) => r.problem_type === tipo)?.nivel ?? 1;

  const modos = [
    { nombre: t("modos.razones"), desc: t("elegir.descripciones.razones"), href: "/trigonometria/practica", nivel: nivelDe("trigonometria_razones") },
    { nombre: t("modos.circulo"), desc: t("elegir.descripciones.circulo"), href: "/trigonometria/practica/circulo", nivel: nivelDe("trigonometria_circulo") },
    { nombre: t("modos.identidades"), desc: t("elegir.descripciones.identidades"), href: "/trigonometria/practica/identidades", nivel: nivelDe("trigonometria_identidades") },
    { nombre: `${t("modos.leyes")} 🔥`, desc: t("elegir.descripciones.leyes"), href: "/trigonometria/practica/leyes", nivel: nivelDe("trigonometria_leyes") },
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
                style={{ background: COLOR_TRIGONOMETRIA }}
              >
                <IconTrigonometria className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-foreground">{m.nombre}</p>
                <p className="text-xs text-texto-secundario">{m.desc}</p>
              </div>
              <LevelDial nivel={m.nivel} size={44} mostrarEtiqueta={false} colorHex={COLOR_TRIGONOMETRIA} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
