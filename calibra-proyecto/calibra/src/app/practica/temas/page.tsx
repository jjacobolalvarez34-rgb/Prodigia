import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireMundoNumeria } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { ARITHMETIC_PROBLEM_TYPES } from "@/types/database";
import LevelDial from "@/app/practica/LevelDial";
import { IconSuma, IconFracciones, IconDecimalesPorcentajes, IconPotenciasRaices, IconAlgebra } from "@/components/icons";

export const metadata: Metadata = {
  title: "Practicar",
  description: "Elegí un tema de Numeria para practicar.",
};

// Fase XX: "Practicar" ya no lleva directo al selector de operaciones
// de aritmética — primero elegís el TEMA (esta pantalla), y recién
// adentro de cada tema elegís qué practicar. Aritmética conserva su
// selector de operaciones existente; Fracciones/Decimales/Potencias
// van directo a su propia partida (cada una mezcla sus sub-tipos sola).
export default async function TemasPage() {
  const supabase = await createClient();
  const { user } = await requireMundoNumeria(supabase, "/practica/temas");

  const { data: skillRows } = await supabase.from("skill_levels").select("problem_type, nivel").eq("user_id", user.id);

  const nivelesAritmetica = (skillRows ?? []).filter((r) => (ARITHMETIC_PROBLEM_TYPES as string[]).includes(r.problem_type));
  const nivelAritmetica =
    nivelesAritmetica.length > 0
      ? Math.round(nivelesAritmetica.reduce((acc, r) => acc + r.nivel, 0) / nivelesAritmetica.length)
      : 1;
  const nivelDe = (tipo: string) => skillRows?.find((r) => r.problem_type === tipo)?.nivel ?? 1;

  const temas = [
    { nombre: "Aritmética", desc: "Suma, resta, multiplicación, división", Icono: IconSuma, href: "/practica", nivel: nivelAritmetica },
    { nombre: "Fracciones", desc: "Simplificar, comparar, sumar", Icono: IconFracciones, href: "/practica/fracciones", nivel: nivelDe("fracciones") },
    { nombre: "Decimales y porcentajes", desc: "Convertir, calcular %, redondear", Icono: IconDecimalesPorcentajes, href: "/practica/decimales", nivel: nivelDe("decimales") },
    { nombre: "Potencias y raíces", desc: "Potencias, raíces, notación", Icono: IconPotenciasRaices, href: "/practica/potencias", nivel: nivelDe("potencias") },
    { nombre: "Álgebra básica", desc: "Evaluar expresiones, despejar x", Icono: IconAlgebra, href: "/practica/algebra", nivel: nivelDe("algebra") },
  ];

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">¿Qué tema practicamos?</h1>
          <p className="mt-2 text-sm text-texto-secundario">Elegí un tema — adentro vas a poder elegir qué practicar.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {temas.map((tema) => (
            <Link
              key={tema.nombre}
              href={tema.href}
              className="flex items-center gap-4 rounded-2xl border-2 border-border bg-surface px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primario/40 hover:shadow-lg"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primario/10 text-primario">
                <tema.Icono className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-foreground">{tema.nombre}</p>
                <p className="text-xs text-texto-secundario">{tema.desc}</p>
              </div>
              <LevelDial nivel={tema.nivel} size={44} mostrarEtiqueta={false} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
