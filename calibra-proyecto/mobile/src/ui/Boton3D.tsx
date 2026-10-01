import { LinearGradient } from "expo-linear-gradient";
import { useEffect, type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { colorSolidoPrimario, paradasPrimario } from "@/lib/degradeBoton";
import { sonar, vibrar } from "~/lib/efectos";
import { useAnimacionActiva, useLiviano } from "~/lib/rendimiento";
import { color, conAlfa, fuente } from "~/tema";
import Texto from "./Texto";

// Botón de la app con el estilo de components/Boton.tsx de la web: píldora, color
// sólido de la marca (o del mundo) ajustado a contraste AA con el texto blanco,
// sombra del mismo color y, en el botón destacado (`brillo`), el borde con el
// degradé cálido del mundo que late y la plaquita redonda con el ▶. Al tocarlo se
// achica con resorte (hilo nativo).

type VarianteBoton = "primario" | "logro" | "secundario" | "peligro" | "pro";

interface Props {
  titulo: string;
  onPress: () => void;
  acento?: string;
  variante?: VarianteBoton;
  tamano?: "md" | "sm";
  icono?: ReactNode;
  deshabilitado?: boolean;
  cargando?: boolean;
  brillo?: boolean;
  estilo?: StyleProp<ViewStyle>;
  silencioso?: boolean;
}

const ALTO = { md: 52, sm: 40 } as const;

function IconoJugar({ c }: { c: string }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24">
      <Path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" fill={c} />
    </Svg>
  );
}

export default function Boton3D({
  titulo,
  onPress,
  acento,
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
  const activa = useAnimacionActiva();
  const liviano = useLiviano();
  const escala = useSharedValue(1);
  const pulso = useSharedValue(0);
  const alto = ALTO[tamano];
  const destacado = !!brillo && !inactivo && (variante === "primario" || variante === "logro" || variante === "pro");
  const paradas = paradasPrimario(acento) as [string, string, string];
  const solido = colorSolidoPrimario(acento);

  // El borde destacado late suave; se pausa si la pantalla no se ve.
  useEffect(() => {
    if (!destacado || !activa || liviano) {
      cancelAnimation(pulso);
      return;
    }
    pulso.set(withRepeat(withSequence(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 1300, easing: Easing.inOut(Easing.quad) })), -1));
    return () => cancelAnimation(pulso);
  }, [destacado, activa, liviano, pulso]);

  const estiloEscala = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));
  const estiloHalo = useAnimatedStyle(() => ({ opacity: 0.35 + pulso.value * 0.45 }));

  let fondo: ReactNode;
  let colorTexto = "#FFFFFF";
  let borde: string | undefined;
  let sombra: string | undefined;
  switch (variante) {
    case "logro":
      fondo = <LinearGradient colors={["#FFC94D", color.logro, "#F29A1F"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />;
      colorTexto = "#2A1A00";
      sombra = `0px 10px 24px -8px ${conAlfa(color.logro, 0.6)}`;
      break;
    case "pro":
      fondo = <LinearGradient colors={[color.primarioBase, "#B04BD8", color.logro]} start={{ x: 0, y: 0.2 }} end={{ x: 1, y: 0.8 }} style={StyleSheet.absoluteFill} />;
      sombra = `0px 10px 24px -8px ${conAlfa(color.primario, 0.6)}`;
      break;
    case "secundario":
      fondo = <View style={[StyleSheet.absoluteFill, { backgroundColor: color.surface2 }]} />;
      colorTexto = color.texto;
      borde = conAlfa(acento ?? color.primarioBase, 0.45);
      break;
    case "peligro":
      fondo = <View style={[StyleSheet.absoluteFill, { backgroundColor: color.error }]} />;
      break;
    default:
      fondo = <View style={[StyleSheet.absoluteFill, { backgroundColor: solido }]} />;
      sombra = `0px 10px 24px -8px ${conAlfa(solido, 0.6)}`;
  }

  const contenido = (
    <View style={[styles.cara, { height: alto, borderColor: borde ?? "transparent", borderWidth: borde ? 1 : 0 }]}>
      {fondo}
      {variante !== "secundario" && <LinearGradient colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0)"]} style={styles.reflejo} pointerEvents="none" />}
      {cargando ? (
        <ActivityIndicator color={colorTexto} />
      ) : (
        <View style={styles.fila}>
          {icono ? <View style={[styles.placa, tamano === "sm" && styles.placaChica, { backgroundColor: variante === "secundario" ? conAlfa(acento ?? color.primario, 0.2) : "rgba(255,255,255,0.25)" }]}>{icono}</View> : null}
          <Texto style={[styles.texto, { color: colorTexto, fontSize: tamano === "sm" ? 14 : 16 }]} numberOfLines={1}>
            {titulo}
          </Texto>
          {destacado && !icono ? (
            <View style={[styles.placa, tamano === "sm" && styles.placaChica, { backgroundColor: variante === "logro" ? "rgba(42,26,0,0.15)" : "rgba(255,255,255,0.25)" }]}>
              <IconoJugar c={colorTexto} />
            </View>
          ) : null}
        </View>
      )}
    </View>
  );

  return (
    <Animated.View style={[{ opacity: inactivo ? 0.45 : 1 }, estiloEscala, estilo]}>
      <Pressable
        disabled={inactivo}
        onPressIn={() => escala.set(withTiming(0.96, { duration: 80 }))}
        onPressOut={() => escala.set(withSpring(1, { damping: 10, stiffness: 320 }))}
        onPress={() => {
          vibrar.ligero();
          if (!silencioso) sonar("boton");
          onPress();
        }}
        accessibilityRole="button"
        accessibilityLabel={titulo}
        accessibilityState={{ disabled: inactivo }}
        style={{ borderRadius: 999, boxShadow: sombra }}
      >
        {destacado ? (
          <View style={styles.marcoDestacado}>
            <Animated.View style={[StyleSheet.absoluteFill, estiloHalo]}>
              <LinearGradient colors={variante === "logro" ? ["#FFE08A", color.logro, "#FF8A3D"] : paradas} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: 999 }]} />
            </Animated.View>
            {contenido}
          </View>
        ) : (
          contenido
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cara: { borderRadius: 999, overflow: "hidden", alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  marcoDestacado: { borderRadius: 999, padding: 2.5 },
  reflejo: { position: "absolute", left: 0, right: 0, top: 0, height: "50%" },
  fila: { flexDirection: "row", alignItems: "center", gap: 10 },
  texto: { fontFamily: fuente.displaySemi, letterSpacing: 0.2 },
  placa: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  placaChica: { width: 24, height: 24, borderRadius: 12 },
});
