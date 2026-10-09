import { Image } from "expo-image";

// El logo de Prodigia: el mismo dibujo del ícono de la app (la "C" violeta con la
// chispa dorada del primer APK), como imagen para que se vea idéntico.
const LOGO = require("../../assets/images/logo.png");

// `color`: el logo entero de un solo color (el cartel del final de cada partida lo
// pinta del color de la ciudad, pedido 2026-10-09).
export default function Logo({ tam = 64, color }: { tam?: number; color?: string }) {
  return <Image source={LOGO} style={{ width: tam, height: tam }} contentFit="contain" tintColor={color} />;
}
