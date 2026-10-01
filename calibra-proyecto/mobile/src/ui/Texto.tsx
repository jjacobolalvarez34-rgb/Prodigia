import { StyleSheet, Text, type TextProps } from "react-native";
import { color, fuente } from "~/tema";

// Escala tipográfica de 02-SISTEMA-VISUAL.md §3.
export type Variante = "display" | "h1" | "h2" | "h3" | "cuerpo" | "fuerte" | "nota" | "micro" | "mono" | "numero" | "contador";

interface Props extends TextProps {
  v?: Variante;
  c?: string;
  centro?: boolean;
  tam?: number;
}

export default function Texto({ v = "cuerpo", c, centro, tam, style, ...resto }: Props) {
  return (
    <Text
      {...resto}
      style={[estilos[v], c ? { color: c } : null, centro ? { textAlign: "center" } : null, tam ? { fontSize: tam, lineHeight: Math.round(tam * 1.2) } : null, style]}
    />
  );
}

const estilos = StyleSheet.create({
  display: { fontFamily: fuente.display, fontSize: 32, lineHeight: 36, color: color.texto, letterSpacing: -0.6 },
  h1: { fontFamily: fuente.display, fontSize: 26, lineHeight: 30, color: color.texto, letterSpacing: -0.5 },
  h2: { fontFamily: fuente.displaySemi, fontSize: 20, lineHeight: 26, color: color.texto, letterSpacing: -0.2 },
  h3: { fontFamily: fuente.displaySemi, fontSize: 16, lineHeight: 21, color: color.texto },
  cuerpo: { fontFamily: fuente.cuerpo, fontSize: 15, lineHeight: 22, color: color.texto },
  fuerte: { fontFamily: fuente.cuerpoFuerte, fontSize: 15, lineHeight: 22, color: color.texto },
  nota: { fontFamily: fuente.cuerpoMedio, fontSize: 13, lineHeight: 18, color: color.texto2 },
  micro: { fontFamily: fuente.cuerpoFuerte, fontSize: 11, lineHeight: 14, color: color.texto2, letterSpacing: 0.7, textTransform: "uppercase" },
  mono: { fontFamily: fuente.mono, fontSize: 15, lineHeight: 20, color: color.texto },
  numero: { fontFamily: fuente.mono, fontSize: 52, lineHeight: 60, color: color.texto, letterSpacing: -1 },
  contador: { fontFamily: fuente.mono, fontSize: 14, lineHeight: 18, color: color.texto },
});
