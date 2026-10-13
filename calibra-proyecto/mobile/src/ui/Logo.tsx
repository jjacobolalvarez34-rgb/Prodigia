import { Image } from "expo-image";

// El logo de Prodigia: el mismo dibujo del ícono de la app (la "C" violeta con la
// chispa dorada del primer APK), como imagen para que se vea idéntico.
const LOGO = require("../../assets/images/logo.png");

// `color`: el logo entero de un solo color. El cartel del final de partida lo usaba con
// el color de la ciudad; desde 2026-10-13 va con sus colores (la chispa siempre dorada).
export default function Logo({ tam = 64, color }: { tam?: number; color?: string }) {
  return <Image source={LOGO} style={{ width: tam, height: tam }} contentFit="contain" tintColor={color} />;
}
