import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import BotonEnlace from "@/components/BotonEnlace";
import RecuperarForm from "./RecuperarForm";
import PreguntasRecuperar from "./PreguntasRecuperar";

export default async function RecuperarPage() {
  const t = await getTranslations("Auth.recuperar");

  return (
    <>
      <Header />
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {t("titulo")}
          </h1>
          <p className="mt-2 mb-7 text-sm text-texto-secundario">
            {t("subtitulo")}
          </p>

          <PreguntasRecuperar />

          {/* El enlace por correo queda como segunda opción (sirve cuando haya SMTP propio). */}
          <details className="mt-6 text-sm">
            <summary className="cursor-pointer text-texto-secundario hover:text-foreground">{t("porCorreo")}</summary>
            <div className="mt-3">
              <RecuperarForm />
            </div>
          </details>

          <div className="mt-6 flex justify-center">
            <BotonEnlace href="/login" variante="secundario" atras tamano="sm">
              {t("volverIniciarSesion")}
            </BotonEnlace>
          </div>
        </div>
      </div>
    </>
  );
}
