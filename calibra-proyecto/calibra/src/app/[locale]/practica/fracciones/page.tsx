import { createClient } from "@/lib/supabase/server";
import { requireMundoNumeria, bloquearInvitado } from "@/lib/auth/guard";
import { COLOR_DIAL_HEX, type ColorDial } from "@/types/database";
import Header from "@/components/Header";
import { TIPOS_FRACCION, type TipoFraccion } from "@/lib/practica/fracciones";
import FraccionPracticaClient from "./FraccionPracticaClient";

export default async function FraccionesPracticaPage() {
  const supabase = await createClient();
  const { user } = await requireMundoNumeria(supabase, "/practica/fracciones");
  bloquearInvitado(user, "Fracciones");

  const [{ data: skillRows }, { data: profile }] = await Promise.all([
    supabase
      .from("skill_levels")
      .select("problem_type, nivel")
      .eq("user_id", user.id)
      .in(
        "problem_type",
        TIPOS_FRACCION.map((t) => `fracciones_${t}`)
      ),
    supabase
      .from("profiles")
      .select("escudos_extra_pendientes, boost_multiplicador_pendiente, color_dial")
      .eq("id", user.id)
      .single(),
  ]);

  const nivelPorTipo = Object.fromEntries(
    TIPOS_FRACCION.map((t) => [t, skillRows?.find((r) => r.problem_type === `fracciones_${t}`)?.nivel ?? 1])
  ) as Record<TipoFraccion, number>;

  const escudosExtra = profile?.escudos_extra_pendientes ?? 0;
  const boostActivo = (profile?.boost_multiplicador_pendiente ?? 1) > 1;
  if (escudosExtra > 0) {
    await supabase.rpc("consumir_escudos_pendientes");
  }

  const colorDial = COLOR_DIAL_HEX[(profile?.color_dial as ColorDial) ?? "violeta"];

  return (
    <>
      <Header autenticado />
      <FraccionPracticaClient
        nivelPorTipo={nivelPorTipo}
        escudosExtra={escudosExtra}
        boostActivo={boostActivo}
        colorDial={colorDial}
      />
    </>
  );
}
