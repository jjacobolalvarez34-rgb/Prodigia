import { Image } from "expo-image";

// El logo de Prodigia: el mismo dibujo del ícono de la app (la "C" violeta con la
// chispa dorada del primer APK), como imagen para que se vea idéntico.
const LOGO = require("../../assets/images/logo.png");

export default function Logo({ tam = 64 }: { tam?: number }) {
  return <Image source={LOGO} style={{ width: tam, height: tam }} contentFit="contain" />;
}
