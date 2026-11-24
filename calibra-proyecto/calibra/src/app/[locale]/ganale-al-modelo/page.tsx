import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import JuegoPublico from "@/components/ganaleModelo/JuegoPublico";
import ModoMesa from "@/components/ganaleModelo/ModoMesa";
import ModoSala from "@/components/ganaleModelo/ModoSala";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("GanaleModelo.metadata");
  return { title: t("title"), description: t("description") };
}

// «Gánale al modelo» (2026-11-24): minievento de Naipia para la jornada de proyectos de
// la Konrad Lorenz. Pública a propósito: el público entra desde un QR sin cuenta, así
// que no llama a requireUsuario ni redirige a /login. Con ?modo=mesa es la pantalla del
// presentador para jugar con cartas reales.
export default async function GanaleAlModeloPage({ searchParams }: { searchParams: Promise<{ [k: string]: string | string[] | undefined }> }) {
  const { modo } = await searchParams;
  if (modo === "mesa") return <ModoMesa />;
  if (modo === "sala") return <ModoSala />;
  return <JuegoPublico />;
}
