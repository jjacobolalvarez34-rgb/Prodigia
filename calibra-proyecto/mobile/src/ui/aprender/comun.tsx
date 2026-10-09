import { useEffect, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { G, Path, type PathProps } from "react-native-svg";
import { color, conAlfa } from "~/tema";
import TextoLatex from "../TextoLatex";
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
      {titulo ? <TextoLatex v="fuerte" centro texto={titulo} estilo={{ fontSize: 13, lineHeight: 18 }} /> : null}
      {children}
      {r && r.total > 1 && <ControlesReproductor r={r} acento={acento} />}
    </View>
  );
}

export function Leyenda({ acento, children }: { acento: string; children: ReactNode }) {
  return <View style={[styles.leyenda, { borderColor: acento, backgroundColor: mezcla(acento, 9) }]}>{children}</View>;
}

// Texto chico con fórmulas ($…$) dibujadas en LaTeX.
export function T({ children, tam = 13, c = FG, negrita, centro, estilo }: { children: string; tam?: number; c?: string; negrita?: boolean; centro?: boolean; estilo?: StyleProp<import("react-native").TextStyle> }) {
  return <TextoLatex v={negrita ? "fuerte" : "cuerpo"} c={c} centro={centro} texto={children} estilo={[{ fontSize: tam, lineHeight: Math.round(tam * 1.35) }, estilo]} />;
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

// Fórmula centrada (LaTeX sin "$", como en la web), dibujada con MathJax.
export function Formula({ tex, tam = 16 }: { tex: string; tam?: number }) {
  return <TextoLatex v="fuerte" centro texto={`$${tex.replace(/\$/g, "")}$`} estilo={{ fontSize: tam }} />;
}

// Largo de una poligonal (para dibujar un trazo de a poco).
export function largoPoligonal(puntos: { x: number; y: number }[]): number {
  let l = 0;
  for (let i = 1; i < puntos.length; i++) l += Math.hypot(puntos[i].x - puntos[i - 1].x, puntos[i].y - puntos[i - 1].y);
  return Math.max(1, l);
}

const PathAnimado = Animated.createAnimatedComponent(Path);

// Un trazo que se dibuja solo (en la web: pathLength=1 + stroke-dashoffset).
export function TrazoDibujado({ d, largo, visible, ms = 900, ...resto }: { d: string; largo: number; visible: boolean; ms?: number } & Omit<PathProps, "d">) {
  const off = useSharedValue(visible ? 0 : largo);
  useEffect(() => {
    off.set(withTiming(visible ? 0 : largo, { duration: ms }));
  }, [visible, largo, ms, off]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: off.value }));
  return <PathAnimado animatedProps={props} d={d} strokeDasharray={`${largo} ${largo}`} {...resto} />;
}
