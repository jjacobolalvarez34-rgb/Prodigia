"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type ClaveSaludo = "noche" | "manana" | "tarde";

function claveSaludoPara(hora: number): ClaveSaludo {
  if (hora < 6) return "noche";
  if (hora < 12) return "manana";
  if (hora < 20) return "tarde";
  return "noche";
}

// Bug real (2026-09-15): "el saludo no cambia aunque cambie el idioma"
// — la versión anterior usaba useSyncExternalStore con un
// getServerSnapshot que devolvía el string "servidor", una clave que NI
// SIQUIERA EXISTE en Home.saludo (solo hay "noche"/"manana"/"tarde") —
// t("servidor") cae al fallback de next-intl (la clave cruda) en vez de
// un saludo real durante SSR/primer paint. Reescrito con el patrón
// hydration-safe ya establecido en el resto del proyecto (ver
// DecryptedText.tsx/Shuffle.tsx: useEffect + setTimeout(...,0), nunca
// setState directo en el cuerpo del efecto) — más simple, sin esa clave
// inválida, y t() siempre lee la clave real así que reacciona bien a un
// cambio de idioma.
export default function Greeting() {
  const t = useTranslations("Home.saludo");
  const [clave, setClave] = useState<ClaveSaludo | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setClave(claveSaludoPara(new Date().getHours())), 0);
    return () => clearTimeout(id);
  }, []);

  if (!clave) return null;
  return <>{t(clave)}</>;
}
