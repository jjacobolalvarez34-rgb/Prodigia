import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import type { TituloUsuario } from "@/types/database";
import Header from "@/components/Header";
import { Link } from "@/i18n/navigation";
import SubirAvatar from "../SubirAvatar";
import SubirFondoPerfil from "../SubirFondoPerfil";
import NombreEditable from "../NombreEditable";
import ColorNombrePicker from "../ColorNombrePicker";
import TitulosSection from "../TitulosSection";
import BorrarCuenta from "../BorrarCuenta";

// Editar perfil (pedido 2026-10-19): todo lo que se cambia del perfil en una página
// propia, en vez de estar encima de la tarjeta del perfil. Mismos componentes de
// antes (foto, nombre, color, fondo, título y la zona de borrar la cuenta).
function Bloque({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-5 py-5">
      <div>
        <h2 className="font-display text-base font-bold text-foreground">{titulo}</h2>
        {ayuda && <p className="mt-0.5 text-xs text-texto-secundario">{ayuda}</p>}
      </div>
      {children}
    </section>
  );
}

export default async function EditarPerfilPage() {
  const t = await getTranslations("Perfil.editar");
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/perfil/editar");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("perfil"));

  const [{ data: p }, { data: titulos }] = await Promise.all([
    supabase
      .from("profiles")
      .select("marco_perfil, fuente_nombre, animacion_nombre, fondo_perfil_url, fondos_desbloqueados, avatar_url, titulo_activo, color_nombre, color_nombre_desbloqueado")
      .eq("id", user.id)
      .single(),
    supabase.rpc("mis_titulos"),
  ]);
  const fondoPropio = ((p?.fondos_desbloqueados as string[] | null) ?? []).includes("personalizado");

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-foreground">{t("titulo")}</h1>
          <Link href="/perfil" className="rounded-xl border-2 border-border px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-primario/50">
            {t("volver")}
          </Link>
        </div>

        <Bloque titulo={t("foto")} ayuda={t("fotoAyuda")}>
          <SubirAvatar userId={user.id} nombre={profile.display_name} avatarUrlInicial={p?.avatar_url ?? null} marco={p?.marco_perfil ?? "ninguno"} />
        </Bloque>

        <Bloque titulo={t("nombre")}>
          <NombreEditable nombreActual={profile.display_name} fuente={p?.fuente_nombre ?? "default"} animacion={p?.animacion_nombre ?? "ninguna"} color={p?.color_nombre ?? null} />
          {p?.color_nombre_desbloqueado && <ColorNombrePicker colorActual={p?.color_nombre ?? null} claro={false} />}
        </Bloque>

        <Bloque titulo={t("fondo")} ayuda={fondoPropio ? t("fondoAyuda") : t("fondoSinComprar")}>
          {fondoPropio && <SubirFondoPerfil userId={user.id} urlInicial={(p?.fondo_perfil_url as string | null) ?? null} />}
          <Link href="/tienda?modo=inventario" className="w-fit text-sm font-semibold text-primario hover:underline">
            {t("aspecto")}
          </Link>
        </Bloque>

        <div className="rounded-2xl border border-border bg-surface px-5 py-5">
          <TitulosSection titulos={(titulos as TituloUsuario[]) ?? []} tituloActivo={p?.titulo_activo ?? null} />
        </div>

        <BorrarCuenta />
      </div>
    </>
  );
}
