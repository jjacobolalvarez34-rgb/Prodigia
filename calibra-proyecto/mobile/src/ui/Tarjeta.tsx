import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { vibrar } from "~/lib/efectos";
import { brillo as sombraBrillo, color, conAlfa, radio } from "~/tema";

// Tarjeta de 02-SISTEMA-VISUAL.md §4.2: surface-1, borde de 1 dp y un brillo
// superior interno que da sensación de vidrio. "Activa" (con `acento`): borde del
// color + resplandor. Si es tocable, se encoge con resorte al apretarla.

interface Props {
  children: ReactNode;
  acento?: string;
  // Intensidad del resplandor del acento (0 = solo borde).
  brillo?: number;
  onPress?: () => void;
  estilo?: StyleProp<ViewStyle>;
  // Orden en la cascada de entrada (cada tarjeta entra un poco después).
  indice?: number;
  sinEntrada?: boolean;
  relleno?: number;
}

export default function Tarjeta({ children, acento, brillo = 0, onPress, estilo, indice = 0, sinEntrada, relleno = 14 }: Props) {
  const escala = useSharedValue(1);
  const estiloEscala = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  const contenido = (
    <View
      style={[
        styles.tarjeta,
        { padding: relleno },
        acento ? { borderColor: conAlfa(acento, 0.55) } : null,
        acento && brillo > 0 ? { boxShadow: sombraBrillo(acento, 28, brillo) } : null,
        estilo,
      ]}
    >
      <LinearGradient colors={["rgba(255,255,255,0.055)", "rgba(255,255,255,0)"]} style={styles.vidrio} pointerEvents="none" />
      {children}
    </View>
  );

  const entrada = sinEntrada ? undefined : FadeInDown.delay(Math.min(indice, 10) * 70).springify().damping(17).stiffness(170);

  if (!onPress) {
    return <Animated.View entering={entrada}>{contenido}</Animated.View>;
  }
  return (
    <Animated.View entering={entrada} style={estiloEscala}>
      <Pressable
        onPressIn={() => escala.set(withSpring(0.965, { damping: 15, stiffness: 400 }))}
        onPressOut={() => escala.set(withSpring(1, { damping: 9, stiffness: 260 }))}
        onPress={() => {
          vibrar.seleccion();
          onPress();
        }}
      >
        {contenido}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: color.surface1,
    borderRadius: radio.tarjeta,
    borderWidth: 1,
    borderColor: color.border,
    overflow: "hidden",
  },
  vidrio: { position: "absolute", left: 0, right: 0, top: 0, height: 28 },
});
