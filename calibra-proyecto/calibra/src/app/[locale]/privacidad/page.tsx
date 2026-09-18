import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import Header from "@/components/Header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Legal.privacidad.metadata");
  return { title: t("title"), description: t("description") };
}

export default async function PrivacidadPage() {
  const t = await getTranslations("Legal.privacidad");
  return (
    <>
      <Header />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-16 sm:px-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
        <p className="text-sm text-texto-secundario">{t("intro")}</p>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">{t("datosTitulo")}</h2>
          <ul className="list-disc pl-5 text-sm text-texto-secundario">
            <li>{t("datosEmail")}</li>
            <li>{t("datosPerfil")}</li>
            <li>{t("datosActividad")}</li>
            <li>{t("datosDuelos")}</li>
            <li>{t("datosClan")}</li>
            <li>{t("datosAmistades")}</li>
            <li>{t("datosGrupo")}</li>
            <li>{t("datosEdad")}</li>
            <li>{t("datosPago")}</li>
            <li>{t("datosDocente")}</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">{t("usoTitulo")}</h2>
          <p className="text-sm text-texto-secundario">{t("usoTexto")}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">{t("tercerosTitulo")}</h2>
          <p className="text-sm text-texto-secundario">{t("tercerosTexto")}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">{t("menoresTitulo")}</h2>
          <p className="text-sm text-texto-secundario">{t("menoresTexto")}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">{t("borrarTitulo")}</h2>
          <p className="text-sm text-texto-secundario">
            {t.rich("borrarTexto", {
              link: (chunks) => (
                <Link href="/perfil" className="text-primario hover:underline">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </section>
      </div>
    </>
  );
}
