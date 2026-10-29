import { PARTICULAS, PASANTES } from "@/lib/temas/dibujos";
import type { Tema } from "@/lib/temas/temas";
import DibujoTema from "./DibujoTema";

// El dibujo chico de una festividad para su franja minimizada: lo que cruza el cielo
// si tiene, o su partícula; si no, un punto con su color.
export default function IconoEvento({ tema }: { tema: Tema }) {
  if (tema.pasante) return <DibujoTema dibujo={PASANTES[tema.pasante]} className="h-9 w-9" />;
  const p = tema.particulas;
  if (p) return <DibujoTema dibujo={PARTICULAS[p.tipo]} color={p.colores[0]} className="h-6 w-6" />;
  return <span className="h-3.5 w-3.5 rounded-full" style={{ background: tema.acento, boxShadow: `0 0 12px ${tema.acento}` }} />;
}
