import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import RegistroForm from "./RegistroForm";

interface Props {
  searchParams: Promise<{ ref?: string }>;
}

export default async function RegistroPage({ searchParams }: Props) {
  const { ref } = await searchParams;
  const t = await getTranslations("Auth.registro");

  return (
    <>
      <Header />
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {t("titulo")}
          </h1>
          <p className="mt-2 mb-7 text-sm text-texto-secundario">{t("subtitulo")}</p>

          <RegistroForm refId={ref} />

          <p className="mt-6 text-sm text-texto-secundario">
            {t("yaTienesCuenta")}{" "}
            <Link href="/login" className="font-medium text-primario hover:underline">
              {t("iniciaSesion")}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
