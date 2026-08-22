import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireMundoAnatomia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import { IconAnatomia } from "@/components/icons";
import { NOMBRE_MODO_ANATOMIA, type ModoAnatomia } from "@/lib/practica/anatomia";
import { COLOR_ANATOMIA } from "../colores";

export const metadata: Metadata = {
  title: "Practicar",
  description: "Elegí un sistema de Anatomía para practicar.",
};

const MODOS: { modo: ModoAnatomia; desc: string; href: string }[] = [
  { modo: "oseo", desc: "Huesos del cuerpo", href: "/anatomia/practica" },
  { modo: "muscular", desc: "Músculos del cuerpo", href: "/anatomia/practica/muscular" },
  { modo: "organos", desc: "Órganos principales", href: "/anatomia/practica/organos" },
  { modo: "nervioso", desc: "Sistema nervioso y pares craneales", href: "/anatomia/practica/nervioso" },
];

// Fase 2 desde el día uno ("nace ya bien, no como las otras ciudades
// que hubo que corregir después"): hub de selección propio, cada modo
// con su nivel real.
export default async function AnatomiaElegirPage() {
  const supabase = await createClient();
  const { user } = await requireMundoAnatomia(supabase, "/anatomia/elegir");

  const { data: nivelRows } = await supabase
    .from("skill_levels")
    .select("problem_type, nivel")
    .eq("user_id", user.id)
    .in("problem_type", ["anatomia_oseo", "anatomia_muscular", "anatomia_organos", "anatomia_nervioso"]);
  const nivelDe = (modo: ModoAnatomia) => nivelRows?.find((r) => r.problem_type === `anatomia_${modo}`)?.nivel ?? 1;

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">¿Qué sistema practicamos?</h1>
          <p className="mt-2 text-sm text-texto-secundario">Elegí un sistema para arrancar.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MODOS.map((m) => (
            <Link
              key={m.modo}
              href={m.href}
              className="flex items-center gap-4 rounded-2xl border-2 border-border bg-surface px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primario/40 hover:shadow-lg"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: COLOR_ANATOMIA }}
              >
                <IconAnatomia className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-foreground">{NOMBRE_MODO_ANATOMIA[m.modo]}</p>
                <p className="text-xs text-texto-secundario">{m.desc}</p>
              </div>
              <LevelDial nivel={nivelDe(m.modo)} size={44} mostrarEtiqueta={false} colorHex={COLOR_ANATOMIA} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
