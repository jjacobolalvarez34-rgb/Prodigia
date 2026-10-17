import { View } from "react-native";
import { ACCESORIOS } from "@/lib/temas/dibujos";
import { capaVisible } from "@/lib/temas/temas";
import { useTemaHoy } from "~/lib/temporada";
import DibujoTema from "./DibujoTema";

// Accesorio de la festividad sobre un avatar (igual que la web): arriba a la izquierda
// si va en la cabeza, sobre la cara si es un antifaz o gafas. Solo en avatares medianos.
export default function AccesorioTemporada({ tam }: { tam: number }) {
  const tema = useTemaHoy();
  const id = tema?.tema.accesorio;
  if (!id || tam < 36 || !capaVisible(tema, "interfaz")) return null;
  const d = ACCESORIOS[id];
  const cabeza = d.lugar === "cabeza";
  const lado = tam * (cabeza ? 0.66 : 0.76);
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: cabeza ? -tam * 0.14 : tam * 0.12, top: cabeza ? -tam * 0.3 : tam * 0.06, transform: cabeza ? [{ rotate: "-14deg" }] : undefined }}>
      <DibujoTema dibujo={d} ancho={lado} />
    </View>
  );
}
