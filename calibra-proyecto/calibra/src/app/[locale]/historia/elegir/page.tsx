import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireMundoHistoria } from "@/lib/auth/guard";
import Header from "@/components/Header";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import { IconHistoria } from "@/components/icons";
import { COLOR_HISTORIA } from "../colores";

export const metadata: Metadata = {
  title: "Practicar",
  description: "Elegí un modo de Historia para practicar.",
};

const TIPOS_HISTORIA = ["historia_cronologia", "historia_personajes", "historia_causaefecto", "historia_fechas"];

export default async function HistoriaElegirPage() {
  const supabase = await createClient();
  const { user } = await requireMundoHistoria(supabase, "/historia/elegir");

  const { data: nivelRows } = await supabase
    .from("skill_levels")
    .select("problem_type, nivel")
    .eq("user_id", user.id)
    .in("problem_type", TIPOS_HISTORIA);
  const nivelDe = (tipo: string) => nivelRows?.find((r) => r.problem_type === tipo)?.nivel ?? 1;

  const modos = [
    { nombre: "Cronología", desc: "Ordenar eventos, o identificar el siglo", href: "/historia/practica", nivel: nivelDe("historia_cronologia") },
    { nombre: "Personajes", desc: "Identificá la figura histórica desde pistas", href: "/historia/practica/personajes", nivel: nivelDe("historia_personajes") },
    { nombre: "Causa y efecto", desc: "La consecuencia directa más reconocida", href: "/historia/practica/causaefecto", nivel: nivelDe("historia_causaefecto") },
    { nombre: "Fechas exactas 🔥", desc: "Año o década precisa — el más difícil", href: "/historia/practica/fechas", nivel: nivelDe("historia_fechas") },
  ];

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">¿Qué modo practicamos?</h1>
          <p className="mt-2 text-sm text-texto-secundario">Elegí un modo para arrancar.</p>
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
                style={{ background: COLOR_HISTORIA }}
              >
                <IconHistoria className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-foreground">{m.nombre}</p>
                <p className="text-xs text-texto-secundario">{m.desc}</p>
              </div>
              <LevelDial nivel={m.nivel} size={44} mostrarEtiqueta={false} colorHex={COLOR_HISTORIA} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
