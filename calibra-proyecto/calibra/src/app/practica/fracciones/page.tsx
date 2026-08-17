import { createClient } from "@/lib/supabase/server";
import { requireMundoNumeria } from "@/lib/auth/guard";
import { COLOR_DIAL_HEX, type ColorDial } from "@/types/database";
import Header from "@/components/Header";
import FraccionPracticaClient from "./FraccionPracticaClient";

export default async function FraccionesPracticaPage() {
  const supabase = await createClient();
  const { user } = await requireMundoNumeria(supabase, "/practica/fracciones");

  const [{ data: nivelRow }, { data: profile }] = await Promise.all([
    supabase.from("skill_levels").select("nivel").eq("user_id", user.id).eq("problem_type", "fracciones").maybeSingle(),
    supabase
      .from("profiles")
      .select("escudos_extra_pendientes, boost_multiplicador_pendiente, color_dial")
      .eq("id", user.id)
      .single(),
  ]);

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
        nivelInicial={nivelRow?.nivel ?? 1}
        escudosExtra={escudosExtra}
        boostActivo={boostActivo}
        colorDial={colorDial}
      />
    </>
  );
}
