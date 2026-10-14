import { NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generarRetoFinde, sabadoDelFinde } from "@/lib/retoFinde";

// POST /api/reto-finde/terminar { respuestas: string[] } — corrige el intento del reto
// de fin de semana con la misma semilla que generó las preguntas y lo registra con la
// clave de servicio (registrar_reto_finde, 0281). Revisión 2026-10-14: antes la base
// creía el número de aciertos que mandaba el cliente. Sirve para la web (cookies) y
// para la app (Authorization: Bearer <token de la sesión>).
export async function POST(request: Request) {
  const usuario = await usuarioDe(request);
  if (!usuario) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (usuario.anonimo) return NextResponse.json({ error: "Crea tu cuenta para jugar el reto del finde." }, { status: 403 });

  const sabado = sabadoDelFinde();
  if (!sabado) return NextResponse.json({ error: "El reto del finde ya terminó." }, { status: 400 });

  const { respuestas } = (await request.json().catch(() => ({}))) as { respuestas?: unknown };
  const lista = Array.isArray(respuestas) ? respuestas.slice(0, 10).map((r) => (typeof r === "string" ? r : "")) : [];
  const preguntas = generarRetoFinde(sabado);
  const correctos = preguntas.reduce((n, p, i) => n + (lista[i] === p.respuesta ? 1 : 0), 0);

  const { data, error } = await createAdminClient().rpc("registrar_reto_finde", { p_user: usuario.id, p_correctos: correctos });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const fila = (data as Record<string, unknown>[] | null)?.[0] ?? null;
  // Para el repaso al final: cuáles acertaste (las respuestas recién ahora).
  return NextResponse.json({ ...fila, aciertos: preguntas.map((p, i) => lista[i] === p.respuesta), correctas: preguntas.map((p) => p.respuesta) });
}

async function usuarioDe(request: Request): Promise<{ id: string; anonimo: boolean } | null> {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (bearer) {
    const sb = createSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
    const { data } = await sb.auth.getUser(bearer);
    return data.user ? { id: data.user.id, anonimo: !!data.user.is_anonymous } : null;
  }
  const { data } = await (await createClient()).auth.getUser();
  return data.user ? { id: data.user.id, anonimo: !!data.user.is_anonymous } : null;
}
