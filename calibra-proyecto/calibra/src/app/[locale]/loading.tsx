"use client";

import { usePathname } from "next/navigation";
import LogoSpinner from "@/components/LogoSpinner";
import { MUNDOS_LANDING } from "@/lib/mundos";

// Next.js muestra esto automáticamente como fallback de Suspense mientras
// carga la próxima página (incluye login/logout, que navegan con
// router.push) — así las transiciones grandes entre pantallas tienen un
// overlay con marca en vez de quedar en blanco (Fase AA). Dentro de una
// ciudad (p. ej. al terminar una partida) el aro y la barrita toman el color
// de esa ciudad (pedido 2026-10-09); /practica es Numeria.
function colorDeRuta(ruta: string): string {
  const partes = ruta.split("/").filter(Boolean);
  const mundo = MUNDOS_LANDING.find((m) => partes.includes(m.slug)) ?? (partes.includes("practica") ? MUNDOS_LANDING[0] : null);
  return mundo?.colorHex ?? "#6C4CF1";
}

export default function GlobalLoading() {
  const color = colorDeRuta(usePathname() ?? "");
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background/70 backdrop-blur-sm">
      <LogoSpinner size={96} colorAro={color} />
      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-foreground/10" aria-hidden="true">
        <div className="h-full w-1/3 animate-[carga-barra_1.1s_ease-in-out_infinite] rounded-full" style={{ background: color }} />
      </div>
    </div>
  );
}
