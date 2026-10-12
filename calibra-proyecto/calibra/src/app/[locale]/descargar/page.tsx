import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PanelDescarga, { FondoNoche } from "@/components/descargarApp/PanelDescarga";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DescargarApp" });
  return { title: t("paginaTitulo"), description: t("sub") };
}

// Página pública para compartir la app (en vez de un link de una web de descargas).
export default async function DescargarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("DescargarApp");
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <FondoNoche />
      <div className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[rgba(148,160,214,0.18)] bg-[#080B15] px-5 py-8 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]">
        <PanelDescarga />
      </div>
      <Link href="/" className="relative mt-6 text-sm font-semibold text-white/70 underline underline-offset-4 hover:text-white">
        {t("irWeb")}
      </Link>
    </main>
  );
}
