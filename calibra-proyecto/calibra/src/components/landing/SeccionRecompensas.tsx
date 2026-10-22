"use client";

import { DibujoCapsula } from "@/components/recompensas/DibujoCapsula";
import Constelacion from "@/components/recompensas/Constelacion";
import { coloresCapsula } from "@/lib/recompensas/catalogo";

// Landing (pendiente 93, diseño aprobado el 2026-10-19): qué te deja cada partida,
// además de aprender: cápsulas y constelaciones.
function Bono({ titulo, texto, dibujo }: { titulo: string; texto: string; dibujo: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0">{dibujo}</div>
      <div>
        <h3 className="font-display text-base font-bold text-foreground">{titulo}</h3>
        <p className="mt-0.5 text-sm text-texto-secundario">{texto}</p>
      </div>
    </div>
  );
}

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
      {/* Los bonos (2026-10-21: «eso no está explicado en el tutorial ni en la landing»). */}
      <div className="grid gap-4 rounded-3xl border border-border bg-surface p-6 sm:grid-cols-3">
        <Bono
          titulo="Doble experiencia"
          texto="Cada día una ciudad distinta da el doble de Exp en todas sus partidas. Es la que tiene el paquete en paracaídas."
          dibujo={
            <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden="true">
              <path d="M6 20 C6 8 42 8 42 20 Z" fill="#FFC53D" />
              <path d="M6 20 Q14 15 24 20 Q34 15 42 20" fill="none" stroke="#B07A00" strokeWidth="1.5" />
              <path d="M8 20 L20 34 M40 20 L28 34 M24 20 V34" stroke="#C9CED8" strokeWidth="1.2" />
              <rect x="17" y="32" width="14" height="11" rx="2" fill="#7C5CFF" />
              <text x="24" y="40.5" textAnchor="middle" fontSize="7" fontWeight="800" fill="#fff">×2</text>
            </svg>
          }
        />
        <Bono
          titulo="De noche, más Chispas"
          texto="Cada ciudad tiene su propio día y su noche. Si completas una constelación mientras allí es de noche, su premio trae 20 % más Chispas."
          dibujo={
            <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden="true">
              <circle cx="24" cy="24" r="20" fill="#141A3A" />
              <path d="M28 10 A14 14 0 1 0 38 30 A11 11 0 1 1 28 10 Z" fill="#F7F2E0" />
              <circle cx="13" cy="15" r="1.2" fill="#fff" />
              <circle cx="16" cy="34" r="0.9" fill="#fff" />
            </svg>
          }
        />
        <Bono
          titulo="Gran Alineación"
          texto="Cada 28 días las 15 ciudades amanecen juntas durante 3 horas: las constelaciones dan el doble y hay una cápsula por jugar 3 partidas."
          dibujo={
            <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden="true">
              <circle cx="24" cy="26" r="9" fill="#FFD15C" />
              <circle cx="24" cy="26" r="14" fill="none" stroke="#FFD15C" strokeWidth="1.5" opacity="0.8" />
              <rect x="4" y="36" width="40" height="8" rx="2" fill="#2A2350" />
            </svg>
          }
        />
      </div>
    </section>
  );
}
