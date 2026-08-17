"use client";

import { useSyncExternalStore } from "react";

function saludoPara(hora: number): string {
  if (hora < 6) return "Buenas noches";
  if (hora < 12) return "Buenos días";
  if (hora < 20) return "Buenas tardes";
  return "Buenas noches";
}

function subscribe() {
  // El saludo no cambia mientras la pantalla está abierta, no hace falta
  // suscribirse a nada — solo leer el reloj del navegador una vez montado.
  return () => {};
}

function getSnapshot(): string {
  return saludoPara(new Date().getHours());
}

function getServerSnapshot(): string {
  return "Hola";
}

export default function Greeting() {
  const saludo = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <>{saludo}</>;
}
