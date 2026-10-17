import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { PARTICULAS, PASANTES } from "@/lib/temas/dibujos";
import type { Tema } from "@/lib/temas/temas";
import DibujoTema from "./DibujoTema";

// Ilustración de una festividad (igual que la web, components/temas/EscenaTema): el
// cielo con los colores de la fecha, sus partículas quietas y lo que cruza el cielo.
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

export default function EscenaTema({ tema, ancho, estilo }: { tema: Tema; ancho: number; estilo?: StyleProp<ViewStyle> }) {
  const p = tema.particulas;
  const pasante = tema.pasante ? PASANTES[tema.pasante] : null;
  return (
    <View style={[StyleSheet.absoluteFill, { overflow: "hidden", backgroundColor: "#0B0A1A" }, estilo]} pointerEvents="none">
      <LinearGradient colors={[`${tema.acento2}66`, "transparent", `${tema.acento}77`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      {p &&
        PUESTOS.map(([x, y, tam, giro], i) => (
          <View key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, opacity: 0.8, transform: [{ translateX: -tam / 2 }, { translateY: -tam / 2 }, { rotate: `${giro}deg` }] }}>
            <DibujoTema dibujo={PARTICULAS[p.tipo]} ancho={tam} color={p.colores[i % p.colores.length]} />
          </View>
        ))}
      {pasante && (
        <View style={{ position: "absolute", right: "5%", top: "12%" }}>
          <DibujoTema dibujo={pasante} ancho={Math.min(220, ancho * 0.46)} />
        </View>
      )}
    </View>
  );
}
