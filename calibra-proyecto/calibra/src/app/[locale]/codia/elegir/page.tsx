import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoCodia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import ModosCodiaClient from "./ModosCodiaClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Codia.elegir.metadata");
  return { title: t("title"), description: t("description") };
}

const TIPOS_CODIA = ["codia_sintaxis", "codia_salida", "codia_error", "codia_estructuras"];

export default async function CodiaElegirPage() {
  const t = await getTranslations("Codia");
  const supabase = await createClient();
  const { user } = await requireMundoCodia(supabase, "/codia/elegir");

  const { data: nivelRows } = await supabase
    .from("skill_levels")
    .select("problem_type, nivel")
    .eq("user_id", user.id)
    .in("problem_type", TIPOS_CODIA);
  const nivelDe = (tipo: string) => nivelRows?.find((r) => r.problem_type === tipo)?.nivel ?? 1;

  const modos = [
    { nombre: t("modos.sintaxis"), desc: t("elegir.descripciones.sintaxis"), href: "/codia/practica", nivel: nivelDe("codia_sintaxis") },
    { nombre: t("modos.salida"), desc: t("elegir.descripciones.salida"), href: "/codia/practica/salida", nivel: nivelDe("codia_salida") },
    { nombre: t("modos.error"), desc: t("elegir.descripciones.error"), href: "/codia/practica/error", nivel: nivelDe("codia_error") },
    { nombre: `${t("modos.estructuras")}`, desc: t("elegir.descripciones.estructuras"), href: "/codia/practica/estructuras", nivel: nivelDe("codia_estructuras") },
  ];

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("elegir.titulo")}</h1>
          <p className="mt-2 text-sm text-texto-secundario">{t("elegir.subtitulo")}</p>
        </div>
        <ModosCodiaClient modos={modos} />
      </div>
    </>
  );
}
