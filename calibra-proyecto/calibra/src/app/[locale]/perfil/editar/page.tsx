import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import type { TituloUsuario } from "@/types/database";
import Header from "@/components/Header";
import { Link } from "@/i18n/navigation";
import BorrarCuenta from "../BorrarCuenta";
import EditorPlaca from "./EditorPlaca";
import { COLUMNAS_COSMETICOS_NUEVOS, cosmeticosDesdeFila } from "@/lib/recompensas/api";
import type { EstadoPlaca } from "@/lib/placa/editorPlaca";

// Editar perfil (pedido 2026-10-19) → editor de la Placa (2026-10-30): la Placa en
// vivo y, por pestañas, todo lo que se le puede poner (EditorPlaca.tsx). Abajo, la
// zona de borrar la cuenta, como antes.
export default async function EditarPerfilPage() {
  const t = await getTranslations("Perfil.editar");
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/perfil/editar");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("perfil"));

  const [{ data: p }, { data: titulos }, { data: mundos }, { data: galeria }, { data: galeriaMia }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name, avatar_url, marco_perfil, marcos_desbloqueados, fuente_nombre, fuentes_desbloqueadas, animacion_nombre, animaciones_desbloqueadas, fondo_perfil, fondo_perfil_url, fondos_desbloqueados, titulo_activo, color_nombre, color_nombre_desbloqueado, elo_rating, nivel_cuenta, puntos_total, plan"
      )
      .eq("id", user.id)
      .single(),
    supabase.rpc("mis_titulos"),
    supabase.from("world_progress").select("world, nivel_mundo").eq("user_id", user.id),
    supabase.from("fondos_galeria").select("slug, nombre, url, costo").eq("activo", true).order("orden"),
    supabase.from("fondos_galeria_desbloqueados").select("slug").eq("user_id", user.id),
  ]);
  // Aparte, como en la tienda: si la base no tiene 0248/0294, el editor sigue andando.
  const [{ data: nuevos }, { data: filaPuntos }] = await Promise.all([
    supabase.from("profiles").select(COLUMNAS_COSMETICOS_NUEVOS).eq("id", user.id).maybeSingle(),
    supabase.from("profiles").select("fuente_puntos, fuentes_puntos_desbloqueadas").eq("id", user.id).maybeSingle(),
  ]);
  const fp = (filaPuntos ?? {}) as Record<string, unknown>;

  const inicial: EstadoPlaca = {
    marco: (p?.marco_perfil as string) ?? "ninguno",
    marcos: (p?.marcos_desbloqueados as string[] | null) ?? [],
    fuente: (p?.fuente_nombre as string) ?? "default",
    fuentes: (p?.fuentes_desbloqueadas as string[] | null) ?? [],
    animacion: (p?.animacion_nombre as string) ?? "ninguna",
    animaciones: (p?.animaciones_desbloqueadas as string[] | null) ?? [],
    fondo: (p?.fondo_perfil as string) ?? "ninguno",
    fondoUrl: (p?.fondo_perfil_url as string | null) ?? null,
    fondos: (p?.fondos_desbloqueados as string[] | null) ?? [],
    colorNombre: (p?.color_nombre as string | null) ?? null,
    colorDesbloqueado: !!p?.color_nombre_desbloqueado,
    titulo: (p?.titulo_activo as string | null) ?? null,
    titulos: ((titulos as TituloUsuario[] | null) ?? []).map((x) => ({ slug: x.slug, nombre: x.nombre })),
    fuentePuntos: (fp.fuente_puntos as string) ?? "clasica",
    fuentesPuntos: (fp.fuentes_puntos_desbloqueadas as string[] | null) ?? [],
    cos: cosmeticosDesdeFila(nuevos as Record<string, unknown> | null),
    galeria: (galeria as EstadoPlaca["galeria"] | null) ?? [],
    galeriaMia: ((galeriaMia as { slug: string }[] | null) ?? []).map((g) => g.slug),
    nivelesMundo: Object.fromEntries(((mundos as { world: string; nivel_mundo: number }[] | null) ?? []).map((m) => [m.world, m.nivel_mundo])),
    esPro: p?.plan === "pro",
  };

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{t("titulo")}</h1>
            <p className="mt-0.5 text-sm text-texto-secundario">{t("subtitulo")}</p>
          </div>
          <Link href="/perfil" className="shrink-0 rounded-xl border-2 border-border px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-primario/50">
            {t("volver")}
          </Link>
        </div>

        <EditorPlaca
          userId={user.id}
          inicial={inicial}
          perfil={{
            nombre: (p?.display_name as string | null) ?? profile.display_name,
            avatarUrl: (p?.avatar_url as string | null) ?? null,
            elo: (p?.elo_rating as number | null) ?? 1000,
            nivel: (p?.nivel_cuenta as number | null) ?? 1,
            chispas: (p?.puntos_total as number | null) ?? 0,
          }}
          hoy={new Date().toISOString().slice(0, 10)}
        />

        <div className="mx-auto w-full max-w-2xl">
          <BorrarCuenta />
        </div>
      </div>
    </>
  );
}
