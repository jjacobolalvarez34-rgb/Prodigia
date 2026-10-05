import { useEffect, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { G } from "react-native-svg";
import { color, conAlfa } from "~/tema";
import Texto from "../Texto";
import { textoConFormulas } from "../TextoMate";
import { ControlesReproductor, type Reproductor } from "./reproductor";

// Piezas comunes de los visuales de lecciones portados de la web
// (components/<mundo>/visuales/comun.tsx): marco con la franja del color del mundo,
// leyenda del paso actual y fundidos para lo que aparece paso a paso.

// Los colores de la web (var(--foreground), var(--border)…) en la app.
export const FG = color.texto;
export const BORDE = color.border;
export const SUPERFICIE = color.surface1;
export const FONDO = color.bg;
export const SECUNDARIO = color.texto2;

// color-mix(in oklab, <c> N%, var(--surface)) de la web: el color con N % de opacidad.
export function mezcla(c: string, porcentaje: number): string {
  return conAlfa(c, porcentaje / 100);
}

export function Marco({ acento, titulo, r, children, estilo }: { acento: string; titulo?: string; r?: Reproductor; children: ReactNode; estilo?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.marco, { borderTopColor: acento }, estilo]}>
      {titulo ? (
        <Texto v="fuerte" tam={13} centro>
          {textoConFormulas(titulo)}
        </Texto>
      ) : null}
      {children}
      {r && r.total > 1 && <ControlesReproductor r={r} acento={acento} />}
    </View>
  );
}

export function Leyenda({ acento, children }: { acento: string; children: ReactNode }) {
  return <View style={[styles.leyenda, { borderColor: acento, backgroundColor: mezcla(acento, 9) }]}>{children}</View>;
}

// Texto chico con fórmulas ($…$) ya pasadas a Unicode.
export function T({ children, tam = 13, c = FG, negrita, centro, estilo }: { children: string; tam?: number; c?: string; negrita?: boolean; centro?: boolean; estilo?: StyleProp<import("react-native").TextStyle> }) {
  return (
    <Texto v={negrita ? "fuerte" : "cuerpo"} tam={tam} c={c} centro={centro} style={estilo}>
      {textoConFormulas(children)}
    </Texto>
  );
}

// Aparece / se desvanece suave cuando cambia `visible` (las transiciones CSS de la web).
export function Aparece({ visible, opacidad = 1, ms = 450, estilo, children }: { visible: boolean; opacidad?: number; ms?: number; estilo?: StyleProp<ViewStyle>; children: ReactNode }) {
  const o = useSharedValue(visible ? opacidad : 0);
  useEffect(() => {
    o.set(withTiming(visible ? opacidad : 0, { duration: ms }));
  }, [visible, opacidad, ms, o]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[estilo, a]}>{children}</Animated.View>;
}

const GAnimado = Animated.createAnimatedComponent(G);

// Lo mismo dentro de un dibujo SVG.
export function GAparece({ visible, opacidad = 1, ms = 450, children }: { visible: boolean; opacidad?: number; ms?: number; children: ReactNode }) {
  const o = useSharedValue(visible ? opacidad : 0);
  useEffect(() => {
    o.set(withTiming(visible ? opacidad : 0, { duration: ms }));
  }, [visible, opacidad, ms, o]);
  const props = useAnimatedProps(() => ({ opacity: o.value }));
  return <GAnimado animatedProps={props}>{children}</GAnimado>;
}

// Paso actual (1..total) para leer "el elemento que acaba de aparecer".
export function indiceActual(paso: number, total: number): number {
  return Math.min(total, Math.max(1, paso)) - 1;
}

const styles = StyleSheet.create({
  marco: { gap: 10, padding: 12, borderRadius: 18, borderWidth: 1, borderTopWidth: 3, borderColor: color.border, backgroundColor: color.surface1, overflow: "hidden" },
  leyenda: { minHeight: 52, gap: 3, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
});
