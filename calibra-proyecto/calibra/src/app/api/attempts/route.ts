import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ARITHMETIC_PROBLEM_TYPES, type ArithmeticProblemType, type NewAttempt } from "@/types/database";
import { calcularXpDetallado, tiempoEsperadoMs } from "@/lib/practica/formulas";
import { type ProblemTypeCalibrable } from "@/lib/practica/skillLevels";
import { respuestaError } from "@/lib/api/respuestaError";
import { operacionPermitidaInvitado, temaAvanzadoBloqueadoParaInvitado } from "@/lib/auth/accesoInvitado";

// Piso de tiempo plausible: nadie resuelve de forma legítima un problema
// en una fracción ínfima del tiempo "esperado" para ese nivel. No
// rechazamos el intento (podría ser solo jitter de red) — lo marcamos
// como sospechoso: se guarda igual, pero no suma XP ni mueve la
// calibración, así ni el ranking ni los duelos se pueden inflar así.
// El mismo cálculo vive en el RPC insertar_intento (0120), que es el
// que decide de verdad en la base — acá solo se replica para decidir
// qué copiar al desglose y si calibrar.
function esTiempoSospechoso(nivel: number, timeMs: number): boolean {
  const piso = Math.max(150, tiempoEsperadoMs(nivel) * 0.12);
  return timeMs < piso;
}

// POST /api/attempts
// Guarda un intento del sprint de cálculo. El front manda el resultado
// (correcto/incorrecto, tiempo, nivel) y acá lo validamos contra la
// matriz de acceso de invitado y lo enrutamos al RPC security definer
// insertar_intento (0120), que escribe la fila en attempts y actualiza
// skill_levels — el XP se calcula ahí, dentro de la base, nunca
// mirando valores que mande el cliente. Acá solo se replica la fórmula
// de sospechoso/desglose para decidir qué copiar al front.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as NewAttempt & { protegido?: boolean };

  // Deuda técnica invisible, Fase 1: la matriz de acceso de invitado
  // (src/lib/auth/accesoInvitado.ts) existía desde hace tiempo pero
  // nunca se validaba acá — un invitado podía mandar cualquier
  // problem_type directo por POST, sin pasar por ninguna página
  // bloqueada, y este endpoint lo guardaba igual. Esta es la defensa
  // real (server-side, no confía en que el cliente ya filtró la UI).
  if (user.is_anonymous) {
    const esOperacionAritmetica = (ARITHMETIC_PROBLEM_TYPES as string[]).includes(body.problem_type);
    if (esOperacionAritmetica && !operacionPermitidaInvitado(body.problem_type as ArithmeticProblemType)) {
      return NextResponse.json({ error: "Esa operación no está disponible para invitados." }, { status: 403 });
    }
    if (temaAvanzadoBloqueadoParaInvitado(body.problem_type)) {
      return NextResponse.json({ error: "Ese tema no está disponible para invitados." }, { status: 403 });
    }
  }

  const sospechoso = esTiempoSospechoso(body.level, body.time_ms);
  const desglose = calcularXpDetallado(body.level, body.time_ms);

  // Un intento sospechoso no mueve la calibración (ni para arriba ni para
  // abajo) — se descarta para ese propósito en vez de contaminarla.
  // Fase 2 ("Practicar" estandarizado): cada sub-tema real de Fracciones/
  // Decimales/Potencias/Álgebra/Geometría calibra su propio nivel — los
  // problem_type "de tema" viejos (fracciones/decimales/potencias/
  // algebra, sin sufijo) quedan afuera de la lista a propósito, ya no
  // se escriben más (ver 0079_practicar_subtemas.sql).
  const tiposCalibrables: ProblemTypeCalibrable[] = [
    ...ARITHMETIC_PROBLEM_TYPES,
    "geografia",
    "quimia_simbolos",
    "quimia_formulas",
    "quimia_tabla",
    "quimia_nomenclatura",
    "quimia_organica",
    "geometria_perimetro",
    "geometria_area",
    "geometria_angulos",
    "geometria_ternas",
    "fracciones_simplificar",
    "fracciones_comparar",
    "fracciones_sumar",
    "decimales_convertir",
    "decimales_porcentaje",
    "decimales_redondear",
    "potencias_potencia",
    "potencias_raiz",
    "potencias_notacion",
    "algebra_evaluar",
    "algebra_un-paso",
    "algebra_dos-pasos",
    "anatomia_oseo",
    "anatomia_muscular",
    "anatomia_organos",
    "anatomia_nervioso",
    "melodia_fundamentos",
    "melodia_lectura",
    "melodia_alteraciones",
    "melodia_escalas",
    "melodia_acordes",
    "melodia_oido_absoluto",
    "trigonometria_razones",
    "trigonometria_circulo",
    "trigonometria_identidades",
    "trigonometria_leyes",
    "historia_cronologia",
    "historia_personajes",
    "historia_causaefecto",
    "historia_fechas",
  ];
  const calibrar = !sospechoso && (tiposCalibrables as string[]).includes(body.problem_type);

  // El alta se hace por el RPC security definer insertar_intento (0120):
  // calcula XP y anti-apuro server-side dentro de la base, inserta el
  // intento y actualiza skill_levels. El cliente no puede escribir
  // attempts directo (policy sellada) ni inventar el xp.
  const { data: rpcRows, error } = await supabase.rpc("insertar_intento", {
    p_problem_type: body.problem_type,
    p_level: body.level,
    p_correct: body.correct,
    p_time_ms: body.time_ms,
    p_protegido: body.protegido ?? false,
    p_calibrar: calibrar,
  });

  if (error) {
    return respuestaError("attempts", error);
  }

  const fila = (rpcRows ?? [])[0];

  return NextResponse.json({
    ok: true,
    xp: fila?.xp ?? 0,
    xpBreakdown: body.correct && !sospechoso ? desglose : null,
    skillLevel: fila?.nivel != null ? { nivel: fila.nivel, racha_actual: fila.racha_actual } : null,
    sospechoso: fila?.sospechoso ?? sospechoso,
  });
}
