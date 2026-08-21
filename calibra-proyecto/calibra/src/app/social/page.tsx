import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import SocialClient from "./SocialClient";
import type { PostFeed } from "./Feed";

export const metadata: Metadata = {
  title: "Social",
  description: "Feed, amigos y duelos en Prodigia.",
};

export default async function SocialPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/social");
  bloquearInvitado(user, "Social (Feed y Amigos)");

  const [
    { data: posts },
    { data: reacciones },
    { data: siguiendo },
    { data: solicitudes },
    { data: amigos },
    { data: retos },
    { data: nivelesMundo },
  ] = await Promise.all([
      supabase
        .from("feed_posts")
        .select(
          "id, user_id, tipo, created_at, operation_type, nivel, cantidad_problemas, mundo, rival_nombre, rango_nuevo, nivel_mundo_valor, achievements(nombre, descripcion), profiles(display_name, fuente_nombre), problemas_personalizados(pregunta)"
        )
        .order("created_at", { ascending: false })
        .limit(40),
      supabase.from("feed_reactions").select("post_id, user_id"),
      supabase.from("friendships").select("friend_id").eq("user_id", user.id).eq("estado", "aceptada"),
      supabase.rpc("mis_solicitudes_pendientes"),
      supabase.rpc("mis_amigos"),
      supabase.rpc("mis_duelos_pendientes"),
      supabase.from("world_progress").select("nivel_mundo").eq("user_id", user.id),
    ]);

  // Fase 6: desbloqueado a partir de nivel 10 en al menos un mundo —
  // mismo umbral que ya exige crear_problema_personalizado del lado del
  // servidor (esto es solo para no mostrar el botón si de entrada va a
  // fallar; el servidor es quien realmente lo hace cumplir).
  const puedeCrearProblemaPersonalizado = (nivelesMundo ?? []).some((w) => w.nivel_mundo >= 10);

  const idsSeguidos = new Set((siguiendo ?? []).map((f) => f.friend_id));

  const reaccionesPorPost = new Map<string, { total: number; reaccione: boolean }>();
  for (const r of reacciones ?? []) {
    const actual = reaccionesPorPost.get(r.post_id) ?? { total: 0, reaccione: false };
    actual.total++;
    if (r.user_id === user.id) actual.reaccione = true;
    reaccionesPorPost.set(r.post_id, actual);
  }

  const postsFormateados: PostFeed[] = (posts ?? []).map((p) => {
    const autor = p.profiles as unknown as { display_name: string | null; fuente_nombre: string | null } | null;
    const logro = p.achievements as unknown as { nombre: string; descripcion: string } | null;
    // Nunca se manda la respuesta al cliente en el listado — solo la
    // pregunta. La respuesta se valida server-side recién cuando alguien
    // arriesga una (responder_problema_personalizado).
    const problema = p.problemas_personalizados as unknown as { pregunta: string } | null;
    const reaccion = reaccionesPorPost.get(p.id) ?? { total: 0, reaccione: false };
    return {
      id: p.id,
      userId: p.user_id,
      tipo: p.tipo as PostFeed["tipo"],
      createdAt: p.created_at,
      autorNombre: autor?.display_name ?? "Jugador",
      autorFuente: (autor?.fuente_nombre as PostFeed["autorFuente"]) ?? "default",
      logroNombre: logro?.nombre ?? null,
      logroDescripcion: logro?.descripcion ?? null,
      operationType: p.operation_type,
      nivel: p.nivel,
      cantidadProblemas: p.cantidad_problemas,
      mundo: p.mundo,
      rivalNombre: p.rival_nombre,
      rangoNuevo: p.rango_nuevo,
      nivelMundoValor: p.nivel_mundo_valor,
      problemaPregunta: problema?.pregunta ?? null,
      problemaRespuesta: null,
      esDeUnSeguido: idsSeguidos.has(p.user_id),
      esPropio: p.user_id === user.id,
      reaccionesTotal: reaccion.total,
      yoReaccione: reaccion.reaccione,
    };
  });

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <SocialClient
        posts={postsFormateados}
        solicitudesIniciales={solicitudes ?? []}
        amigosIniciales={amigos ?? []}
        retosIniciales={retos ?? []}
        puedeCrearProblemaPersonalizado={puedeCrearProblemaPersonalizado}
      />
    </>
  );
}
