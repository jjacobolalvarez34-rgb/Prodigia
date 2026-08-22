import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import { IconGeometria } from "@/components/icons";
import { COLOR_GEOGRAFIA } from "../GeografiaMapa";

export const metadata: Metadata = {
  title: "Practicar",
  description: "Elegí una región de Geografía para practicar.",
};

// Fase 2 ("Practicar" estandarizado): la home ya no lleva directo a una
// región puntual — entra acá primero. Nivel único compartido entre las
// 4 regiones (no hay sub-tema por continente, a diferencia de Numeria).
export default async function GeografiaElegirPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/geografia/elegir");

  const { data: nivelRow } = await supabase
    .from("skill_levels")
    .select("nivel")
    .eq("user_id", user.id)
    .eq("problem_type", "geografia")
    .maybeSingle();
  const nivel = nivelRow?.nivel ?? 1;

  const regiones = [
    { nombre: "América", desc: "El continente de base", href: "/geografia/practica" },
    { nombre: "Europa", desc: "Países europeos", href: "/geografia/practica/europa" },
    { nombre: "África", desc: "Países africanos", href: "/geografia/practica/africa" },
    { nombre: "Asia y Oceanía", desc: "Países asiáticos y oceánicos", href: "/geografia/practica/asia-oceania" },
  ];

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">¿Qué región practicamos?</h1>
          <p className="mt-2 text-sm text-texto-secundario">Elegí una región para arrancar.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {regiones.map((r) => (
            <Link
              key={r.nombre}
              href={r.href}
              className="flex items-center gap-4 rounded-2xl border-2 border-border bg-surface px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primario/40 hover:shadow-lg"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: COLOR_GEOGRAFIA }}
              >
                <IconGeometria className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-foreground">{r.nombre}</p>
                <p className="text-xs text-texto-secundario">{r.desc}</p>
              </div>
              <LevelDial nivel={nivel} size={44} mostrarEtiqueta={false} colorHex={COLOR_GEOGRAFIA} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
