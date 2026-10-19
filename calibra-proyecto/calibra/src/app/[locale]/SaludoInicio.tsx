"use client";

import { useTemaHoy } from "@/components/temas/useTemaHoy";
import { celebracionDe, saludoDe } from "@/lib/temas/celebracion";
import Greeting from "./Greeting";

// Saludo del Inicio: durante un evento, el de la fecha («Truco o trato, Jacobo»,
// celebracion.ts); el resto del año, «Buenos días, …».
export default function SaludoInicio({ nombre }: { nombre: string }) {
  const saludo = saludoDe(celebracionDe(useTemaHoy()), nombre);
  if (saludo) return <>{saludo}</>;
  return (
    <>
      <Greeting />, {nombre}
    </>
  );
}
