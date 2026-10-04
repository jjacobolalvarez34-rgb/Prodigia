import { useEffect, useState, type ReactNode } from "react";
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { color } from "~/tema";
import AvisoGlobal from "./Aviso";

// Hoja inferior (confirmar una compra, ver un clan del mapa, retar a un amigo): el
// fondo se oscurece y la hoja sube con resorte. Tocar afuera la cierra.
//
// Usa el Animated de React Native (con el driver nativo) y NO Reanimated: dentro de
// un Modal de Android las animaciones de Reanimated no avanzaban, la hoja quedaba
// invisible (opacidad 0, fuera de pantalla) y el toque caía en el fondo invisible y
// la cerraba: "toco y no pasa nada".
export default function Hoja({ visible, onCerrar, children }: { visible: boolean; onCerrar: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [montada, setMontada] = useState(visible);
  const [y] = useState(() => new Animated.Value(600));
  const [fondo] = useState(() => new Animated.Value(0));
  // Se monta apenas se pide mostrarla (estado derivado, sin efecto).
  if (visible && !montada) setMontada(true);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fondo, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(y, { toValue: 0, damping: 20, stiffness: 210, mass: 1, useNativeDriver: true }),
      ]).start();
    } else if (montada) {
      Animated.parallel([
        Animated.timing(fondo, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(y, { toValue: 600, duration: 220, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMontada(false);
      });
    }
  }, [visible, montada, fondo, y]);

  if (!montada) return null;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onCerrar} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, styles.fondo, { opacity: fondo }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCerrar} />
      </Animated.View>
      <Animated.View style={[styles.hoja, { paddingBottom: Math.max(insets.bottom, 16) + 8, transform: [{ translateY: y }] }]}>
        <View style={styles.asa} />
        {children}
      </Animated.View>
      <AvisoGlobal simple />
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
