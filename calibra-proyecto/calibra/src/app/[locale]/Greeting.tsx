"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

function claveSaludoPara(hora: number): "noche" | "manana" | "tarde" {
  if (hora < 6) return "noche";
  if (hora < 12) return "manana";
  if (hora < 20) return "tarde";
  return "noche";
}

function subscribe() {
  // El saludo no cambia mientras la pantalla está abierta, no hace falta
  // suscribirse a nada — solo leer el reloj del navegador una vez montado.
  return () => {};
}

function getSnapshot(): string {
  return claveSaludoPara(new Date().getHours());
}

function getServerSnapshot(): string {
  return "servidor";
}

export default function Greeting() {
  const t = useTranslations("Home.saludo");
  const clave = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <>{t(clave)}</>;
}
