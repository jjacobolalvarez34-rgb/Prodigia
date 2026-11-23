import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LandingPublica from "@/components/landing/LandingPublica";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Presentacion.metadata");
  return { title: t("title"), description: t("description") };
}

// La misma presentación que ve un visitante en «/», pero visible también con sesión
// (para compartirla o revisarla). Aquí «Jugar» es un link a «/».
export default function ConocePage() {
  return <LandingPublica />;
}
