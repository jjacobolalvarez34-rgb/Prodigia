import { createContext, useContext, type ReactNode } from "react";
import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";
import { contraste, luminancia, tintaLegible } from "@/lib/recompensas/temas";
import { color, COLOR_NOCHE, fuente, temaClaro } from "~/tema";

// Temas de la app de fondo claro (0297): el texto de siempre pasa a oscuro. Dos ajustes
// para que nada quede ilegible (con el tema de siempre no cambia nada):
//   - SobreOscuro: los paneles que son oscuros a propósito (escenas, carteles, la
//     Placa, la apertura de cápsulas…) envuelven su contenido y adentro el texto
//     vuelve a la tinta clara de siempre.
//   - Un color de acento pedido para un texto (c o style.color: el neón de un mundo,
//     el dorado…) que no se lee sobre las tarjetas claras se oscurece lo justo.
const SobreOscuroCtx = createContext(false);

export function SobreOscuro({ children }: { children: ReactNode }) {
  return <SobreOscuroCtx.Provider value>{children}</SobreOscuroCtx.Provider>;
}

// Para quien dibuja su propio texto (el nombre estilizado de la Placa, por ejemplo).
export function useSobreOscuro(): boolean {
  return useContext(SobreOscuroCtx);
}

const tintas = new Map<string, string>();
function tintaClara(pedido: string): string {
  let t = tintas.get(pedido);
  if (!t) {
    // Casi blanco: va sobre un botón o una pastilla de color; se deja.
    t = !/^#[0-9a-f]{6}$/i.test(pedido) || luminancia(pedido) > 0.8 || contraste(pedido, color.surface1) >= 4.5 ? pedido : tintaLegible(pedido, [color.surface1, color.surface2]);
    tintas.set(pedido, t);
  }
  return t;
}

function tintaDe(v: Variante, pedido: string | undefined, sobreOscuro: boolean): string | null {
  if (!temaClaro) return null;
  const secundario = v === "nota" || v === "micro";
  if (sobreOscuro) {
    if (!pedido) return secundario ? COLOR_NOCHE.texto2 : COLOR_NOCHE.texto;
    if (pedido === color.texto) return COLOR_NOCHE.texto;
    if (pedido === color.texto2) return COLOR_NOCHE.texto2;
    return null;
  }
  return pedido ? tintaClara(pedido) : null;
}

// Escala tipográfica de 02-SISTEMA-VISUAL.md §3.
export type Variante = "display" | "h1" | "h2" | "h3" | "cuerpo" | "fuerte" | "nota" | "micro" | "mono" | "numero" | "contador";

interface Props extends TextProps {
  v?: Variante;
  c?: string;
  centro?: boolean;
  tam?: number;
}

export default function Texto({ v = "cuerpo", c, centro, tam, style, ...resto }: Props) {
  const sobreOscuro = useContext(SobreOscuroCtx);
  // Si el estilo agranda la letra sin decir el interlineado, se calcula: con el
  // interlineado fijo de la variante el texto grande se encimaba con lo de abajo.
  const plano = StyleSheet.flatten(style) as TextStyle | undefined;
  const interlineado = plano?.fontSize && !plano.lineHeight ? { lineHeight: Math.round(plano.fontSize * 1.22) } : null;
  const pedido = typeof plano?.color === "string" ? plano.color : c;
  const tinta = tintaDe(v, pedido, sobreOscuro);
  return (
    <Text
      {...resto}
      style={[estilos[v], c ? { color: c } : null, centro ? { textAlign: "center" } : null, tam ? { fontSize: tam, lineHeight: Math.round(tam * 1.22) } : null, style, interlineado, tinta ? { color: tinta } : null]}
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
