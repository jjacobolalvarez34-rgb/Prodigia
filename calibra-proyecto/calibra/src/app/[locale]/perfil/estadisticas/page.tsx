import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, requirePro } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Perfil.estadisticas");
  return { title: t("metadata.title"), description: t("metadata.description") };
}

interface FilaEstadistica {
  mundo: string;
  intentos: number;
  correctos: number;
  precision: number;
}

// Fase 4 (infraestructura de pagos): primer beneficio de Prodigia Pro
// con gate real (requirePro, ver src/lib/auth/guard.ts) — precisión y
// volumen por mundo, agregado server-side por estadisticas_pro_perfil()
// (0146_prodigia_pro_gates_y_estadisticas.sql) en vez de traer todas
// las filas de attempts al cliente.
export default async function EstadisticasPage() {
  const t = await getTranslations("Perfil.estadisticas");
  const tPerfil = await getTranslations("Perfil");
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/perfil/estadisticas");
  requirePro(profile, "/perfil/estadisticas");

  const { data } = await supabase.rpc("estadisticas_pro_perfil");
  const filas = (data as FilaEstadistica[] | null) ?? [];
  const totalIntentos = filas.reduce((acc, f) => acc + f.intentos, 0);

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12 sm:px-6">
        <div>
          <Link href="/perfil" className="text-xs font-medium text-primario hover:underline">
            ← {t("volverAlPerfil")}
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
          <p className="text-sm text-texto-secundario">{t("subtitulo")}</p>
        </div>

        {filas.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface px-6 py-8 text-center text-sm text-texto-secundario">
            {t("vacio")}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filas.map((f) => (
              <div key={f.mundo} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3">
                <div>
                  <p className="font-display text-sm font-bold text-foreground">{tPerfil(`publico.nombreMundo.${f.mundo}`)}</p>
                  <p className="text-xs text-texto-secundario">{t("intentosCantidad", { n: f.intentos })}</p>
                </div>
                <p className="font-mono text-lg font-bold text-primario">{Math.round(f.precision * 100)}%</p>
              </div>
            ))}
            <p className="text-center text-xs text-texto-secundario">{t("totalIntentos", { n: totalIntentos })}</p>
          </div>
        )}
      </div>
    </>
  );
}
