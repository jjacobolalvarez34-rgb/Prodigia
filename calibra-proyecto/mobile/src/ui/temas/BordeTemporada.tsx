import { useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Svg, { Defs, LinearGradient, Pattern, Rect, Stop } from "react-native-svg";
import { BORDES, capaVisible } from "@/lib/temas/temas";
import { useTemaHoy } from "~/lib/temporada";

// Borde de la festividad alrededor de un botón principal (caramelo en Navidad, rayas
// naranja y negro en Halloween…), igual que `boton-tema` en la web. Va detrás del
// botón, 3 px por fuera, y no recibe toques.
export default function BordeTemporada({ radio }: { radio: number }) {
  const tema = useTemaHoy();
  const [tam, setTam] = useState<{ w: number; h: number } | null>(null);
  const borde = tema && capaVisible(tema, "interfaz") ? tema.tema.borde : undefined;
  if (!borde) return null;
  const b = BORDES[borde];
  const paso = 6;
  return (
    <View pointerEvents="none" style={styles.capa} onLayout={(e: LayoutChangeEvent) => setTam({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {tam && (
        <Svg width={tam.w} height={tam.h}>
          <Defs>
            {b.tipo === "rayas" ? (
              <Pattern id="bordeTemporada" patternUnits="userSpaceOnUse" width={paso * b.colores.length} height={paso * b.colores.length} patternTransform="rotate(45)">
                {b.colores.map((c, i) => (
                  <Rect key={c + i} x={i * paso} y={0} width={paso} height={paso * b.colores.length} fill={c} />
                ))}
              </Pattern>
            ) : (
              <LinearGradient id="bordeTemporada" x1="0" y1="0" x2="1" y2="1">
                {b.colores.map((c, i) => (
                  <Stop key={c + i} offset={i / (b.colores.length - 1)} stopColor={c} />
                ))}
              </LinearGradient>
            )}
          </Defs>
          <Rect x={1.5} y={1.5} width={tam.w - 3} height={tam.h - 3} rx={Math.min(radio + 1.5, (tam.h - 3) / 2)} fill="none" stroke="url(#bordeTemporada)" strokeWidth={3} />
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  capa: { position: "absolute", left: -3, right: -3, top: -3, bottom: -3 },
});
