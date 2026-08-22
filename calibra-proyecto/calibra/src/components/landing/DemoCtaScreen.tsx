"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ConvertirCuenta from "@/components/ConvertirCuenta";

interface Props {
  correctos: number;
  total: number;
  colorHex: string;
}

// Pantalla de cierre de la demo (landing pública, Fase 4) — reemplaza al
// resumen normal de partida solo acá. Reusa ConvertirCuenta tal cual
// (mismo componente de /perfil e /invitado-bloqueado): el usuario de la
// demo YA es una sesión anónima real (signInAnonymously desde la
// landing), así que "crear cuenta" es agregarle email+contraseña a ESE
// mismo user_id, no un registro nuevo — el resultado de la demo queda
// asociado de verdad.
export default function DemoCtaScreen({ correctos, total, colorHex }: Props) {
  const t = useTranslations("Landing.cta");

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-6 px-4 py-16 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full font-display text-2xl font-black text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${colorHex}, color-mix(in oklab, ${colorHex} 55%, white))` }}
      >
        {correctos}/{total}
      </div>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
        <p className="mt-1 text-sm text-texto-secundario">{t("resultado", { correctos, total })}</p>
      </div>
      <p className="font-display text-lg font-semibold text-foreground">{t("mensaje")}</p>
      <div className="w-full">
        <ConvertirCuenta />
      </div>
      <Link href="/" className="text-sm text-texto-secundario underline-offset-2 hover:underline">
        {t("seguirExplorando")}
      </Link>
    </div>
  );
}
