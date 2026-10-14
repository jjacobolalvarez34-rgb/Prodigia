import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import LoginForm from "./LoginForm";
import BotonGoogle from "@/components/BotonGoogle";

interface Props {
  searchParams: Promise<{ next?: string; error?: string; google?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.metadata");
  return { title: t("title"), description: t("description") };
}

export default async function LoginPage({ searchParams }: Props) {
  const { next, error, google } = await searchParams;
  const t = await getTranslations("Auth.login");

  return (
    <>
      <Header />
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {t("titulo")}
          </h1>
          <p className="mt-2 mb-7 text-sm text-texto-secundario">{t("subtitulo")}</p>

          {google === "existe" && (
            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-primario/40 bg-primario/10 p-4 text-sm text-foreground">
              <p>{t("googleExiste")}</p>
              <BotonGoogle cuentaExistente />
            </div>
          )}
          <LoginForm next={next} />

          {error && (
            <p className="mt-3 text-sm text-error">
              {t.rich("errorEnlace", {
                link: (chunks) => (
                  <Link href="/recuperar" className="underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-1.5 text-sm">
            <Link href="/recuperar" className="text-texto-secundario hover:underline">
              {t("olvidasteContrasena")}
            </Link>
            <p className="text-texto-secundario">
              {t("noTienesCuenta")}{" "}
              <Link href="/registro" className="font-medium text-primario hover:underline">
                {t("creaUna")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
