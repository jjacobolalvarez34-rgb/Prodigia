import { PARTICULAS, PASANTES } from "@/lib/temas/dibujos";
import type { Tema } from "@/lib/temas/temas";
import DibujoTema from "./DibujoTema";

// Ilustración de una festividad para carteles y la página del evento: un cielo con el
// degradé de la fecha, sus partículas quietas repartidas y, si tiene, lo que cruza el
// cielo en grande. Todo con los mismos dibujos que el resto del tema.
const PUESTOS = [
  [8, 18, 22, -18],
  [22, 62, 16, 24],
  [38, 28, 12, 8],
  [58, 70, 20, -30],
  [74, 22, 15, 14],
  [88, 58, 24, -8],
  [48, 84, 13, 40],
  [94, 12, 11, 0],
] as const;

export default function EscenaTema({ tema, className = "" }: { tema: Tema; className?: string }) {
  const p = tema.particulas;
  const pasante = tema.pasante ? PASANTES[tema.pasante] : null;
  return (
    <div className={`overflow-hidden ${className}`} style={{ background: `radial-gradient(120% 90% at 30% 10%, ${tema.acento2}55 0%, transparent 55%), radial-gradient(90% 80% at 85% 90%, ${tema.acento}66 0%, transparent 60%), #0B0A1A` }} aria-hidden="true">
      {p &&
        PUESTOS.map(([x, y, tam, giro], i) => (
          <DibujoTema
            key={i}
            dibujo={PARTICULAS[p.tipo]}
            color={p.colores[i % p.colores.length]}
            className="absolute opacity-80"
            style={{ left: `${x}%`, top: `${y}%`, width: tam, height: tam, transform: `translate(-50%, -50%) rotate(${giro}deg)` }}
          />
        ))}
      {pasante && <DibujoTema dibujo={pasante} className="absolute right-[6%] top-[14%] w-[46%] max-w-[260px] drop-shadow-[0_6px_20px_rgba(0,0,0,0.5)]" />}
    </div>
  );
}
