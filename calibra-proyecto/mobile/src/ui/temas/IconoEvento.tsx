import { View } from "react-native";
import { PARTICULAS, PASANTES } from "@/lib/temas/dibujos";
import type { Tema } from "@/lib/temas/temas";
import DibujoTema from "./DibujoTema";

// El dibujo chico de una festividad para su franja minimizada (igual que la web): lo que
// cruza el cielo si tiene, o su partícula; si no, un punto con su color.
export default function IconoEvento({ tema }: { tema: Tema }) {
  if (tema.pasante) return <DibujoTema dibujo={PASANTES[tema.pasante]} ancho={36} />;
  const p = tema.particulas;
  if (p) return <DibujoTema dibujo={PARTICULAS[p.tipo]} ancho={24} color={p.colores[0]} />;
  return <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: tema.acento, boxShadow: `0px 0px 12px ${tema.acento}` }} />;
}
