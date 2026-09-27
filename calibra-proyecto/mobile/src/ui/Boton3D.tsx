import * as Haptics from "expo-haptics";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { color, radio } from "~/tema";

// Botón con volumen (02-SISTEMA-VISUAL.md §4.1): una cara de color sobre un borde
// inferior más oscuro; al tocarlo la cara baja y tapa el borde, como una tecla.
const ALTO_BORDE = 5;

interface Props {
  titulo: string;
  onPress: () => void;
  acento?: string;
  variante?: "lleno" | "contorno";
  deshabilitado?: boolean;
  cargando?: boolean;
  estilo?: StyleProp<ViewStyle>;
}

function oscurecer(hex: string, factor = 0.55): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export default function Boton3D({ titulo, onPress, acento = color.primario, variante = "lleno", deshabilitado, cargando, estilo }: Props) {
  const inactivo = deshabilitado || cargando;
  const cara = variante === "lleno" ? acento : color.surface2;
  const borde = variante === "lleno" ? oscurecer(acento) : color.border;

  return (
    <Pressable
      disabled={inactivo}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[{ opacity: inactivo ? 0.5 : 1 }, estilo]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactivo }}
    >
      {({ pressed }) => (
        <View style={[styles.base, { backgroundColor: borde }]}>
          <View
            style={[
              styles.cara,
              {
                backgroundColor: cara,
                borderColor: variante === "contorno" ? color.border : cara,
                transform: [{ translateY: pressed ? 0 : -ALTO_BORDE }],
              },
            ]}
          >
            {cargando ? (
              <ActivityIndicator color={color.texto} />
            ) : (
              <Text style={[styles.texto, variante === "contorno" && { color: color.texto }]}>{titulo}</Text>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radio.boton,
    marginTop: ALTO_BORDE,
  },
  cara: {
    minHeight: 54,
    borderRadius: radio.boton,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  texto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
