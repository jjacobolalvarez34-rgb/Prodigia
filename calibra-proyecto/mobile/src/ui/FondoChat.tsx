import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, Path, Pattern, Rect } from "react-native-svg";
import { puntosPatron, type FondoChat as Fondo } from "@/lib/mensajes/fondosChat";

// El fondo de una conversación (0262): degradé oscuro y, encima, su dibujo suave.
export default function FondoChat({ fondo, radio = 0 }: { fondo: Fondo; radio?: number }) {
  const puntos = useMemo(() => puntosPatron(fondo.patron === "puntos" ? 70 : 46), [fondo.patron]);
  return (
    <View style={[StyleSheet.absoluteFill, { borderRadius: radio, overflow: "hidden" }]} pointerEvents="none">
      <LinearGradient colors={fondo.colores} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={StyleSheet.absoluteFill} />
      {fondo.patron && (
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          {fondo.patron === "cuadricula" && (
            <>
              <Defs>
                <Pattern id="cuadros" width={6} height={6} patternUnits="userSpaceOnUse">
                  <Path d="M6 0H0V6" fill="none" stroke={fondo.tinta} strokeWidth={0.15} opacity={0.35} />
                </Pattern>
              </Defs>
              <Rect width={100} height={100} fill="url(#cuadros)" />
            </>
          )}
          {fondo.patron === "ondas" &&
            [12, 30, 48, 66, 84].map((y) => <Path key={y} d={`M0 ${y} Q12.5 ${y - 4} 25 ${y} T50 ${y} T75 ${y} T100 ${y}`} fill="none" stroke={fondo.tinta} strokeWidth={0.3} opacity={0.18} />)}
          {(fondo.patron === "estrellas" || fondo.patron === "puntos") &&
            puntos.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={fondo.patron === "puntos" ? p.r * 0.7 : p.r} fill={fondo.tinta} opacity={fondo.patron === "puntos" ? 0.22 : 0.15 + (i % 4) * 0.12} />)}
        </Svg>
      )}
    </View>
  );
}
