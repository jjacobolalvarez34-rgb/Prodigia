import { createClient } from "@/lib/supabase/server";
import { requireUsuarioOnboarded } from "@/lib/auth/guard";
import {
  ARITHMETIC_PROBLEM_TYPES,
  COLOR_DIAL_HEX,
  type ArithmeticProblemType,
  type ColorDial,
  type ModifierSlug,
} from "@/types/database";
import Header from "@/components/Header";
import PracticaClient from "./PracticaClient";

interface Props {
  searchParams: Promise<{ operacion?: string; duelo?: string }>;
}

export interface RespuestaDuelo {
  correct: boolean;
  timeMs: number;
}

export interface DueloInfo {
  duelId: string;
  operacion: ArithmeticProblemType;
  nivel: number;
  rivalNombre: string;
  miElo: number;
  rivalElo: number;
  rivalRespuestas: RespuestaDuelo[] | null;
}

export default async function PracticaPage({ searchParams }: Props) {
  const { operacion, duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireUsuarioOnboarded(supabase, "/practica");

  let dueloInfo: DueloInfo | null = null;
  if (duelo) {
    const { data } = await supabase.rpc("obtener_duelo", { p_duel_id: duelo });
    const fila = (data as Array<Record<string, unknown>> | null)?.[0];
    if (fila && fila.estado === "pendiente") {
      const rivalYaJugo = fila.rival_ya_jugo === true;
      dueloInfo = {
        duelId: duelo,
        operacion: fila.operation_type as ArithmeticProblemType,
        nivel: fila.nivel as number,
        rivalNombre: (fila.rival_nombre as string | null) ?? "Rival",
        miElo: fila.mi_elo as number,
        rivalElo: fila.rival_elo as number,
        // El fantasma solo existe si el rival ya jugó su lado del duelo
        // antes que vos — si no, jugás normal y tu secuencia de
        // respuestas queda guardada para cuando él juegue la suya.
        rivalRespuestas: rivalYaJugo ? (fila.rival_respuestas as RespuestaDuelo[] | null) ?? null : null,
      };
    }
  }

  const operacionPreseleccionada = (ARITHMETIC_PROBLEM_TYPES as string[]).includes(operacion ?? "")
    ? (operacion as ArithmeticProblemType)
    : undefined;

  const [{ data: skillRows }, { data: unlockedRows }, { data: profile }] = await Promise.all([
    supabase.from("skill_levels").select("problem_type, nivel").eq("user_id", user.id),
    supabase
      .from("unlocked_modifiers")
      .select("modifiers(slug, problem_type)")
      .eq("user_id", user.id),
    supabase
      .from("profiles")
      .select("escudos_extra_pendientes, boost_multiplicador_pendiente, color_dial")
      .eq("id", user.id)
      .single(),
  ]);

  const colorDial = COLOR_DIAL_HEX[(profile?.color_dial as ColorDial) ?? "violeta"];

  // Los escudos extra comprados en la tienda son "para la próxima
  // partida": se consumen acá apenas se cargan, sin importar si el
  // usuario termina usándolos o no. El boost NO se consume acá — recién
  // se apaga cuando la partida termina (/api/practica/finish), porque
  // /api/attempts necesita seguir leyéndolo activo mientras la partida
  // está en curso.
  const escudosExtra = profile?.escudos_extra_pendientes ?? 0;
  const boostActivo = (profile?.boost_multiplicador_pendiente ?? 1) > 1;
  if (escudosExtra > 0) {
    await supabase.rpc("consumir_escudos_pendientes");
  }

  const nivelPorOperacion = Object.fromEntries(
    ARITHMETIC_PROBLEM_TYPES.map((tipo) => [
      tipo,
      skillRows?.find((r) => r.problem_type === tipo)?.nivel ?? 1,
    ])
  ) as Record<ArithmeticProblemType, number>;

  const modificadoresPorOperacion = Object.fromEntries(
    ARITHMETIC_PROBLEM_TYPES.map((tipo) => [tipo, [] as ModifierSlug[]])
  ) as Record<ArithmeticProblemType, ModifierSlug[]>;

  for (const row of unlockedRows ?? []) {
    const modifier = row.modifiers as unknown as { slug: ModifierSlug; problem_type: ArithmeticProblemType } | null;
    if (modifier) modificadoresPorOperacion[modifier.problem_type].push(modifier.slug);
  }

  return (
    <>
      <Header autenticado />
      <PracticaClient
        nivelInicial={nivelPorOperacion}
        modificadoresPorOperacion={modificadoresPorOperacion}
        operacionPreseleccionada={operacionPreseleccionada}
        escudosExtra={escudosExtra}
        boostActivo={boostActivo}
        duelo={dueloInfo}
        colorDial={colorDial}
      />
    </>
  );
}
