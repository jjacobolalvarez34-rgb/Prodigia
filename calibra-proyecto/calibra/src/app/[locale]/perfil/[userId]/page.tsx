import { notFound, redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import { ESTILO_MARCO_PERFIL, type PerfilPublico, type TituloUsuario, type FondoPerfil } from "@/types/database";
import Header from "@/components/Header";
import AvatarConMarco from "@/components/AvatarConMarco";
import RangoBadge from "@/components/RangoBadge";
import NombreConFuente from "@/components/NombreConFuente";
import LogroMedalla from "@/components/LogroMedalla";
import ReportarBoton from "./ReportarBoton";
import AmistadBoton, { type EstadoAmistad } from "./AmistadBoton";
import EstandarteClan from "@/components/clanes/EstandarteClan";
import FondoPerfilCapa, { tieneFondoPerfil } from "@/components/FondoPerfilCapa";

interface Props {
  params: Promise<{ userId: string }>;
}

interface LogroPublico {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  desbloqueado: boolean;
}

const MUNDOS: string[] = [
  "numeria",
  "enigmia",
  "geografia",
  "quimia",
  "anatomia",
  "melodia",
  "trigonometria",
  "historia",
];

function formatearFecha(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "es-AR", { year: "numeric", month: "long" });
}

// Grupo B, Fase 5: perfil público de OTRO usuario con el mismo nivel de
// detalle que ya tenía el propio (rango, nivel por mundo, marco/
// títulos activos, logros, récords) — todo de solo lectura, ninguna
// interacción de edición (nada de elegir_titulo_activo/elegir_marco_
// perfil acá). Si el userId es el propio, manda a /perfil (la versión
// completa, editable).
export default async function PerfilPublicoPage({ params }: Props) {
  const { userId } = await params;
  const t = await getTranslations("Perfil");
  const locale = (await getLocale()) as string;
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, `/perfil/${userId}`);

  if (userId === user.id) {
    redirect("/perfil");
  }

  const [
    { data, error },
    { data: clanRows },
    { data: mundosRows },
    { data: titulosRows },
    { data: logrosRows },
    { data: recordsRows },
    { data: duelosRows },
    { data: amistadRows },
  ] = await Promise.all([
    supabase.rpc("obtener_perfil_publico", { p_user_id: userId }),
    supabase.rpc("clan_de_usuario", { p_user_id: userId }),
    supabase.rpc("progreso_mundos_publico", { p_user_id: userId }),
    supabase.rpc("titulos_publico", { p_user_id: userId }),
    supabase.rpc("logros_publico", { p_user_id: userId }),
    supabase.rpc("records_publico", { p_user_id: userId }),
    supabase.rpc("duelos_stats_publico", { p_user_id: userId }),
    supabase
      .from("friendships")
      .select("user_id, friend_id, estado")
      .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`)
      .maybeSingle(),
  ]);
  const perfil = (data as PerfilPublico[] | null)?.[0];
  const clan = (clanRows as { clan_id: string; nombre: string; tag: string | null; color_estandarte: string; nivel_clan: number }[] | null)?.[0] ?? null;
  const mundos = (mundosRows as { world: string; nivel_mundo: number }[] | null) ?? [];
  const titulos = (titulosRows as TituloUsuario[] | null) ?? [];
  const logros = (logrosRows as LogroPublico[] | null) ?? [];
  const records = (recordsRows as { racha_maxima: number; mejor_tiempo_ms: number | null; mejor_precision: number | null }[] | null)?.[0];
  const duelos = (duelosRows as { jugados: number; victorias: number; derrotas: number }[] | null)?.[0];

  if (error || !perfil) {
    notFound();
  }

  const marcoPerfil = perfil.marco_perfil ?? "ninguno";
  const fondoPerfil = (perfil.fondo_perfil as FondoPerfil | undefined) ?? "ninguno";
  const fondoPerfilUrl = perfil.fondo_perfil_url ?? null;
  const claro = tieneFondoPerfil(fondoPerfil, fondoPerfilUrl);
  const claseTexto = claro ? "text-white" : "text-foreground";
  const claseTextoSec = claro ? "text-white/75" : "text-texto-secundario";
  const claseCaja = claro ? "border-white/25 bg-white/10" : "border-border bg-background";

  const amistad = amistadRows as { user_id: string; friend_id: string; estado: string } | null;
  let estadoAmistad: EstadoAmistad = "ninguno";
  if (amistad?.estado === "aceptada") estadoAmistad = "amigos";
  else if (amistad?.estado === "pendiente") estadoAmistad = amistad.user_id === user.id ? "enviada" : "recibida";

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <section
          className={`relative overflow-hidden rounded-2xl border-2 text-center shadow-sm ${claro ? "" : "bg-surface"} ${ESTILO_MARCO_PERFIL[marcoPerfil] ?? ESTILO_MARCO_PERFIL.ninguno}`}
        >
          <FondoPerfilCapa fondoPerfil={fondoPerfil} fondoPerfilUrl={fondoPerfilUrl} />
          <div className="relative flex flex-col items-center gap-3 px-6 py-8">
          <AvatarConMarco url={perfil.avatar_url} nombre={perfil.display_name} marco={marcoPerfil} size={88} />
          <h1 className={`font-display text-2xl font-bold tracking-tight ${claseTexto}`}>
            <NombreConFuente
              nombre={perfil.display_name}
              fuente={perfil.fuente_nombre}
              animacion={perfil.animacion_nombre}
              color={perfil.color_nombre}
              permitirEfectosPesados
            />
          </h1>
          {perfil.titulo_nombre && (
            <span className={`-mt-2 rounded-full px-3 py-1 text-xs font-semibold ${claro ? "bg-white/15 text-white" : "bg-primario/10 text-primario"}`}>
              {perfil.titulo_nombre}
            </span>
          )}
          <p className={`text-sm ${claseTextoSec}`}>{t("enProdigiaDesde", { fecha: formatearFecha(perfil.created_at, locale) })}</p>
          {clan && (
            <div className="flex items-center gap-2">
              <EstandarteClan color={clan.color_estandarte} nivel={clan.nivel_clan} size={22} />
              <span className={`text-sm ${claseTextoSec}`}>
                {clan.nombre} {clan.tag && `[${clan.tag}]`}
              </span>
            </div>
          )}

          <div className="mt-2 grid w-full grid-cols-3 gap-3">
            <div className={`rounded-xl border px-4 py-3 ${claseCaja}`}>
              <p className={`text-xs font-medium uppercase tracking-wide ${claseTextoSec}`}>{t("rango")}</p>
              <p className="mt-1"><RangoBadge elo={perfil.elo_rating} tituloNombre={perfil.titulo_nombre} size="md" /></p>
              <p className={`text-xs ${claseTextoSec}`}>{t("publico.eloValor", { n: perfil.elo_rating })}</p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${claseCaja}`}>
              <p className={`text-xs font-medium uppercase tracking-wide ${claseTextoSec}`}>{t("publico.nivelLabel")}</p>
              <p className={`mt-1 font-mono text-lg font-bold ${claseTexto}`}>{perfil.nivel_cuenta}</p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${claseCaja}`}>
              <p className={`text-xs font-medium uppercase tracking-wide ${claseTextoSec}`}>{t("publico.chispasLabel")}</p>
              <p className={`mt-1 font-mono text-lg font-bold ${claseTexto}`}>{perfil.puntos_total}</p>
            </div>
          </div>

          {/* Pedido en vivo (2026-09-15): "quizá mostrar un poco más de
              información no estaría mal, solo un poco" — un dato
              competitivo liviano más, sin duplicar records/logros de
              abajo. */}
          {duelos && duelos.jugados > 0 && (
            <p className={`text-sm ${claseTextoSec}`}>
              {t("publico.duelosResumen", { jugados: duelos.jugados, victorias: duelos.victorias, derrotas: duelos.derrotas })}
            </p>
          )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">{t("publico.nivelPorMundo")}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MUNDOS.map((mundo) => {
              const fila = mundos.find((m) => m.world === mundo);
              const tieneMarco = marcoPerfil === mundo;
              return (
                <div key={mundo} className="rounded-xl border border-border bg-surface px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">
                    {t(`publico.nombreMundo.${mundo}`)}
                    {tieneMarco && " · 🖼️"}
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold text-foreground">{fila?.nivel_mundo ?? 1}</p>
                  <p className="text-xs text-texto-secundario">{t("publico.de100")}</p>
                </div>
              );
            })}
          </div>
        </section>

        {records && (
          <section>
            <h2 className="mb-4 font-display text-lg font-bold text-foreground">{t("recordsPersonales")}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{t("respuestaMasRapida")}</p>
                <p className="mt-1 font-mono text-xl font-bold text-foreground">
                  {records.mejor_tiempo_ms !== null ? `${(records.mejor_tiempo_ms / 1000).toFixed(2)}s` : t("publico.sinDatos")}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{t("rachaMasLarga")}</p>
                <p className="mt-1 font-mono text-xl font-bold text-foreground">{t("diasCantidad", { n: records.racha_maxima })}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{t("mejorPrecisionUnDia")}</p>
                <p className="mt-1 font-mono text-xl font-bold text-foreground">
                  {records.mejor_precision !== null ? `${Math.round(records.mejor_precision * 100)}%` : t("publico.sinDatos")}
                </p>
              </div>
            </div>
          </section>
        )}

        {titulos.length > 0 && (
          <section>
            <h2 className="mb-3 font-display text-lg font-bold text-foreground">{t("titulosSection.titulo")}</h2>
            <div className="flex flex-wrap gap-2">
              {titulos.map((tit) => (
                <span
                  key={tit.slug}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    tit.slug === perfil.titulo_activo ? "border-primario bg-primario/10 text-primario" : "border-border text-texto-secundario"
                  }`}
                >
                  {tit.nombre}
                  {tit.slug === perfil.titulo_activo && t("publico.activoSufijo")}
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">{t("logros")}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {logros.map((a) => (
              <LogroMedalla key={a.slug} nombre={a.nombre} descripcion={a.descripcion} desbloqueado={a.desbloqueado} />
            ))}
          </div>
        </section>

        <div className="flex flex-col items-center gap-3">
          <AmistadBoton userId={perfil.id} estadoInicial={estadoAmistad} />
          <ReportarBoton userId={perfil.id} />
        </div>
      </div>
    </>
  );
}
