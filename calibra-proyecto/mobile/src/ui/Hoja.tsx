import { useEffect, useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { color } from "~/tema";

// Hoja inferior (confirmar una compra, ver un clan del mapa, retar a un amigo): el
// fondo se oscurece y la hoja sube con resorte. Tocar afuera la cierra.
export default function Hoja({ visible, onCerrar, children }: { visible: boolean; onCerrar: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [montada, setMontada] = useState(visible);
  const y = useSharedValue(600);
  const fondo = useSharedValue(0);
  // Se monta apenas se pide mostrarla (estado derivado, sin efecto).
  if (visible && !montada) setMontada(true);

  useEffect(() => {
    if (visible) {
      fondo.set(withTiming(1, { duration: 200 }));
      y.set(withSpring(0, { damping: 20, stiffness: 210 }));
    } else if (montada) {
      fondo.set(withTiming(0, { duration: 180 }));
      y.set(
        withTiming(600, { duration: 220, easing: Easing.in(Easing.quad) }, (fin) => {
          if (fin) runOnJS(setMontada)(false);
        })
      );
    }
  }, [visible, montada, fondo, y]);

  const estiloFondo = useAnimatedStyle(() => ({ opacity: fondo.value }));
  const estiloHoja = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  if (!montada) return null;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onCerrar} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, styles.fondo, estiloFondo]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCerrar} />
      </Animated.View>
      <Animated.View style={[styles.hoja, { paddingBottom: Math.max(insets.bottom, 16) + 8 }, estiloHoja]}>
        <View style={styles.asa} />
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: { backgroundColor: "rgba(3,4,10,0.72)" },
  hoja: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(18,23,42,0.99)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: color.border,
    paddingHorizontal: 18,
    paddingTop: 10,
    gap: 12,
    boxShadow: "0px -20px 40px rgba(0,0,0,0.5)",
  },
  asa: { width: 40, height: 4, borderRadius: 4, backgroundColor: "#39405A", alignSelf: "center", marginBottom: 4 },
});
