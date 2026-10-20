"use client";

import { DibujoCapsula } from "@/components/recompensas/DibujoCapsula";
import Constelacion from "@/components/recompensas/Constelacion";
import { coloresCapsula } from "@/lib/recompensas/catalogo";

// Landing (pendiente 93, diseño aprobado el 2026-10-19): qué te deja cada partida,
// además de aprender: cápsulas y constelaciones.
export default function SeccionRecompensas() {
  return (
    <section className="flex flex-col gap-6">
      <div className="text-center">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-[#B9A8FF]">Cada partida cuenta</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">Jugar te deja algo, siempre</h2>
        <p className="mt-1 text-sm text-texto-secundario">Además de aprender, cada día ganas cápsulas y enciendes las estrellas de tus ciudades.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-5 rounded-3xl border border-border bg-surface p-6">
          <div className="flex shrink-0 items-end">
            <DibujoCapsula colores={coloresCapsula("oro", null)} tam={86} adorno={null} />
            <DibujoCapsula colores={coloresCapsula("prisma", null)} tam={64} adorno={null} />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">Cápsulas</h3>
            <p className="mt-1 text-sm text-texto-secundario">Premios sorpresa por jugar el día, cumplir misiones o mantener tu racha. Traen Chispas, ayudas y cosméticos, y 3 iguales se fusionan en una mejor.</p>
          </div>
        </div>
        <div className="flex items-center gap-5 rounded-3xl border border-border bg-surface p-6">
          <Constelacion mundo="geografia" estrellas={7} tam={110} />
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">Constelaciones</h3>
            <p className="mt-1 text-sm text-texto-secundario">Cada ciudad tiene 7 estrellas en su cielo. Cada partida enciende una; con las 7, la figura se dibuja y te da su premio.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
