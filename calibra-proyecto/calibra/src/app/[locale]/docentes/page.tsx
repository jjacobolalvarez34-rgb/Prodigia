import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { IconCheck } from "@/components/icons";
import { MUNDOS_LANDING } from "@/lib/mundos";
import LeadColegioForm from "./LeadColegioForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Docentes.metadata");
  return { title: t("title"), description: t("description") };
}

// Página pública de venta a colegios (/docentes), pedido en vivo
// (2026-09-15) "en base a" el dashboard de estadísticas recién armado
// (/perfil/estadisticas) — pública, sin requireUsuario, porque un
// colegio interesado no debería tener que crearse una cuenta de
// Prodigia solo para leer esto. Honesta sobre el estado real: no existe
// todavía un dashboard multi-alumno para docentes ni facturación B2B
// (marcado fuera de alcance en el plan de pagos aprobado) — esto es una
// página de venta + un formulario que deja un lead (leads_colegios,
// 0150) para que el dueño haga seguimiento a mano, "piloto" en vez de
// prometer algo que no está construido.
export default async function DocentesPage() {
  const t = await getTranslations("Docentes");

  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground">
            <Logo size={26} colorAro="#6C4CF1" />
            Prodigia
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-primario hover:underline">
              {t("iniciarSesion")}
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-16 px-4 py-16 sm:px-6">
        <section className="flex flex-col items-center gap-4 text-center">
          <span className="rounded-full bg-primario/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primario">
            {t("hero.marca")}
          </span>
          <h1 className="font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">{t("hero.titulo")}</h1>
          <p className="max-w-xl text-texto-secundario">{t("hero.subtitulo")}</p>
          <a
            href="#contacto"
            className="rounded-xl bg-primario px-5 py-3 font-display font-semibold text-white shadow-[0_10px_24px_-8px_color-mix(in_oklab,var(--primario)_55%,transparent)]"
          >
            {t("hero.boton")}
          </a>
        </section>

        <section className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="font-display text-xl font-bold text-foreground">{t("mundos.titulo")}</h2>
            <p className="text-sm text-texto-secundario">{t("mundos.descripcion")}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {MUNDOS_LANDING.map((mundo) => (
              <div
                key={mundo.slug}
                className="flex flex-col items-center gap-2 rounded-2xl px-4 py-5 text-center text-white"
                style={{ background: `linear-gradient(120deg, ${mundo.colorHex}, color-mix(in oklab, ${mundo.colorHex} 55%, white))` }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                  <mundo.Icono className="h-5 w-5" />
                </span>
                <p className="font-display text-sm font-bold">{mundo.nombre}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {(["adaptativo", "gamificado", "duelos", "seguimiento"] as const).map((clave) => (
            <div key={clave} className="flex gap-3 rounded-2xl border border-border bg-surface px-5 py-4">
              <IconCheck className="h-5 w-5 shrink-0 text-correcto" />
              <div>
                <p className="font-display text-sm font-bold text-foreground">{t(`beneficios.${clave}.titulo`)}</p>
                <p className="text-sm text-texto-secundario">{t(`beneficios.${clave}.descripcion`)}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-primario/30 bg-primario/5 px-6 py-6">
          <h2 className="font-display text-lg font-bold text-foreground">{t("estadisticas.titulo")}</h2>
          <p className="text-sm text-texto-secundario">{t("estadisticas.descripcion")}</p>
          <p className="text-sm text-texto-secundario">{t("estadisticas.piloto")}</p>
        </section>

        <section className="flex flex-col gap-2 text-center">
          <h2 className="font-display text-lg font-bold text-foreground">{t("precio.titulo")}</h2>
          <p className="mx-auto max-w-md text-sm text-texto-secundario">{t("precio.descripcion")}</p>
        </section>

        <LeadColegioForm />
      </div>
    </>
  );
}
