import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { sonar, vibrar } from "~/lib/efectos";
import { brillo as sombraBrillo, color, fuente, oscurecer } from "~/tema";
import Texto from "./Texto";

// Botón con volumen (02-SISTEMA-VISUAL.md §4.1): cara de color sobre un labio más
// oscuro. Al tocarlo la cara baja y tapa el labio en 60 ms; al soltar vuelve con
// resorte. Los botones de recompensa (oro) y Pro llevan un destello que los recorre.

type VarianteBoton = "primario" | "logro" | "secundario" | "peligro" | "pro";

interface Props {
  titulo: string;
  onPress: () => void;
  // Color de la cara en la variante primaria (el color BASE del mundo, nunca el neón).
  acento?: string;
  variante?: VarianteBoton;
  // Compatibilidad con la API anterior.
  tamano?: "md" | "sm";
  icono?: ReactNode;
  deshabilitado?: boolean;
  cargando?: boolean;
  brillo?: boolean;
  estilo?: StyleProp<ViewStyle>;
  silencioso?: boolean;
}

const ALTO = { md: 54, sm: 40 } as const;
const LABIO = { md: 5, sm: 4 } as const;

function colores(variante: VarianteBoton, acento: string): { cara: string; labio: string; texto: string; borde?: string } {
  switch (variante) {
    case "logro":
      return { cara: color.logro, labio: color.logroLabio, texto: "#1F1400" };
    case "secundario":
      return { cara: color.surface2, labio: "#0B0F1F", texto: color.texto, borde: color.border };
    case "peligro":
      return { cara: color.error, labio: oscurecer(color.error, 0.55), texto: "#FFFFFF" };
    case "pro":
      return { cara: color.primario, labio: "#3A2A8A", texto: "#FFFFFF" };
    default:
      return { cara: acento, labio: oscurecer(acento, 0.6), texto: "#FFFFFF" };
  }
}

export default function Boton3D({
  titulo,
  onPress,
  acento = color.primarioBase,
  variante = "primario",
  tamano = "md",
  icono,
  deshabilitado,
  cargando,
  brillo,
  estilo,
  silencioso,
}: Props) {
  const inactivo = !!(deshabilitado || cargando);
  const { cara, labio, texto, borde } = colores(variante, acento);
  const alto = ALTO[tamano];
  const hundir = LABIO[tamano];
  const bajada = useSharedValue(0);
  const escala = useSharedValue(1);
  const destello = useSharedValue(-1);
  const [ancho, setAncho] = useState(0);
  const conDestello = (variante === "logro" || variante === "pro") && !inactivo;

  useEffect(() => {
    if (!conDestello) return;
    destello.set(
      withRepeat(withSequence(withTiming(-1, { duration: 0 }), withDelay(1400, withTiming(1.6, { duration: 900, easing: Easing.inOut(Easing.quad) }))), -1)
    );
  }, [conDestello, destello]);

  const estiloCara = useAnimatedStyle(() => ({
    transform: [{ translateY: bajada.value }, { scale: escala.value }],
  }));
  const estiloDestello = useAnimatedStyle(() => ({
    transform: [{ translateX: destello.value * ancho }, { skewX: "-20deg" }],
  }));

  return (
    <Pressable
      disabled={inactivo}
      onPressIn={() => {
        bajada.set(withTiming(hundir, { duration: 60 }));
        escala.set(withTiming(0.985, { duration: 60 }));
      }}
      onPressOut={() => {
        bajada.set(withSpring(0, { damping: 9, stiffness: 320, mass: 0.6 }));
        escala.set(withSpring(1, { damping: 10, stiffness: 300 }));
      }}
      onPress={() => {
        vibrar.ligero();
        if (!silencioso) sonar("boton");
        onPress();
      }}
      style={[{ opacity: inactivo ? 0.45 : 1 }, estilo]}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: inactivo }}
    >
      <View
        style={[
          styles.base,
          { height: alto + hundir, borderRadius: tamano === "sm" ? 12 : 16 },
          brillo && !inactivo ? { boxShadow: sombraBrillo(variante === "logro" ? color.logro : cara, 22, 0.45) } : null,
        ]}
      >
        <View style={[styles.labio, { top: hundir, height: alto, backgroundColor: labio, borderRadius: tamano === "sm" ? 12 : 16 }]} />
        <Animated.View
          onLayout={(e: LayoutChangeEvent) => setAncho(e.nativeEvent.layout.width)}
          style={[
            styles.cara,
            { height: alto, backgroundColor: cara, borderRadius: tamano === "sm" ? 12 : 16, borderColor: borde ?? "transparent" },
            estiloCara,
          ]}
        >
          {variante === "pro" && (
            <LinearGradient colors={[color.primario, "#B07CFF", color.logro]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          )}
          {/* Brillo superior: da la sensación de cara convexa. */}
          <LinearGradient colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"]} style={styles.reflejo} />
          {conDestello && ancho > 0 && (
            <Animated.View style={[styles.destello, estiloDestello]} pointerEvents="none">
              <LinearGradient
                colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.55)", "rgba(255,255,255,0)"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          )}
          {cargando ? (
            <ActivityIndicator color={texto} />
          ) : (
            <View style={styles.fila}>
              {icono}
              <Texto style={[styles.texto, { color: texto, fontSize: tamano === "sm" ? 13 : 16 }]} numberOfLines={1}>
                {titulo}
              </Texto>
            </View>
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { width: "100%" },
  labio: { position: "absolute", left: 0, right: 0 },
  cara: {
    overflow: "hidden",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  reflejo: { position: "absolute", left: 0, right: 0, top: 0, height: "55%" },
  destello: { position: "absolute", top: -10, bottom: -10, width: 46, left: 0 },
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  texto: { fontFamily: fuente.display, letterSpacing: 0.7, textTransform: "uppercase" },
});
