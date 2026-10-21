"use client";

import { usePathname } from "next/navigation";
import LogoSpinner from "@/components/LogoSpinner";
import { AccesorioCarga, NombreTemaCarga, ParticulasCarga, useAcentoCarga } from "@/components/temas/CargaTemporada";
import { MUNDOS_LANDING } from "@/lib/mundos";

// Next.js muestra esto automáticamente como fallback de Suspense mientras
// carga la próxima página (incluye login/logout, que navegan con
// router.push) — así las transiciones grandes entre pantallas tienen un
// overlay con marca en vez de quedar en blanco (Fase AA). Dentro de una
// ciudad (p. ej. al terminar una partida) el aro y la barrita toman el color
// de esa ciudad (pedido 2026-10-09); /practica es Numeria. En las festividades
// (2026-10-21) fuera de una ciudad toma el color del evento, caen sus partículas,
// el logo lleva el accesorio de la fecha y debajo aparece el nombre de la fiesta.
function colorDeRuta(ruta: string): string | null {
  const partes = ruta.split("/").filter(Boolean);
  const mundo = MUNDOS_LANDING.find((m) => partes.includes(m.slug)) ?? (partes.includes("practica") ? MUNDOS_LANDING[0] : null);
  return mundo?.colorHex ?? null;
}

export default function GlobalLoading() {
  const acentoTema = useAcentoCarga();
  const color = colorDeRuta(usePathname() ?? "") ?? acentoTema ?? "#6C4CF1";
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background/70 backdrop-blur-sm">
      <ParticulasCarga />
      <div className="relative">
        <LogoSpinner size={96} colorAro={color} />
        <AccesorioCarga size={96} />
      </div>
      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-foreground/10" aria-hidden="true">
        <div className="h-full w-1/3 animate-[carga-barra_1.1s_ease-in-out_infinite] rounded-full" style={{ background: color }} />
      </div>
      <NombreTemaCarga />
    </div>
  );
}
