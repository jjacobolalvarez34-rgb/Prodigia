"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import Logo from "@/components/Logo";
import Boton from "@/components/Boton";

// Error boundary de toda la app (Next.js App Router): cubre fallas no
// manejadas — típicamente Supabase sin conexión — con una pantalla con
// los colores de marca en vez de la página de error genérica de Next.
export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Common.errorBoundario");

  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-20 text-center">
      <Logo size={40} className="opacity-70" />
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
          {t("titulo")}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-texto-secundario">
          {t("descripcion")}
        </p>
      </div>
      <Boton onClick={reset} className="px-5 py-2.5">
        {t("reintentar")}
      </Boton>
    </div>
  );
}
