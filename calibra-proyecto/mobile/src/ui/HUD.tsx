import { useRouter } from "expo-router";
import { useEffect, useRef, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useAnimacionActiva } from "~/lib/rendimiento";
import { registrarMedidorHud, type Rect } from "~/lib/ayudas";
import { sonar, vibrar } from "~/lib/efectos";
import { useJugador } from "~/lib/jugador";
import { color } from "~/tema";
import { IconoCampana, IconoChispa, IconoLlama } from "./Iconos";
import NumeroAnimado from "./NumeroAnimado";
import AvatarMarco from "./placa/AvatarMarco";

// HUD de las pestañas (03-PANTALLAS-Y-NAVEGACION.md §1): avatar (Placa Mini) · racha
// · Chispas (abre la tienda) · campana de avisos con punto rojo que late.

export function Pildora({ children, onPress, resaltar }: { children: ReactNode; onPress?: () => void; resaltar?: string }) {
  const escala = useSharedValue(1);
  const estilo = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));
  return (
    <Animated.View style={estilo}>
      <Pressable
        disabled={!onPress}
        onPressIn={() => escala.set(withSpring(0.92, { damping: 14, stiffness: 400 }))}
        onPressOut={() => escala.set(withSpring(1, { damping: 8, stiffness: 260 }))}
        onPress={() => {
          vibrar.seleccion();
          onPress?.();
        }}
        style={[styles.pildora, resaltar ? { borderColor: resaltar } : null]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function HUD({ derecha }: { derecha?: ReactNode }) {
  const router = useRouter();
  const { placa, resumen } = useJugador();
  const racha = resumen?.racha ?? 0;
  const chispas = resumen?.chispas ?? placa?.chispas ?? 0;
  const avisos = (resumen?.mensajesSinLeer ?? 0) + (resumen?.novedadesSinLeer ?? 0);

  // Cuando suben las Chispas, la píldora da un saltito dorado.
  const salto = useSharedValue(1);
  const anterior = useRef(chispas);
  useEffect(() => {
    if (chispas > anterior.current && anterior.current > 0) {
      salto.set(withSequence(withSpring(1.18, { damping: 6, stiffness: 300 }), withSpring(1, { damping: 10 })));
    }
    anterior.current = chispas;
  }, [chispas, salto]);
  const estiloSalto = useAnimatedStyle(() => ({ transform: [{ scale: salto.value }] }));

  const punto = useSharedValue(1);
  const activa = useAnimacionActiva();
  useEffect(() => {
    if (avisos === 0 || !activa) {
      cancelAnimation(punto);
      return;
    }
    punto.set(withRepeat(withSequence(withTiming(1.35, { duration: 600, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 600 })), -1));
    return () => cancelAnimation(punto);
  }, [avisos, activa, punto]);
  const estiloPunto = useAnimatedStyle(() => ({ transform: [{ scale: punto.value }] }));

  const refRacha = useRef<View>(null);
  const refChispas = useRef<View>(null);
  useEffect(() => {
    const medir = (ref: { current: View | null }) => () =>
      new Promise<Rect | null>((resolver) => {
        if (!ref.current) resolver(null);
        else ref.current.measureInWindow((x, y, w, h) => resolver({ x, y, w, h }));
      });
    const a = registrarMedidorHud("racha", medir(refRacha));
    const b = registrarMedidorHud("chispas", medir(refChispas));
    return () => {
      a();
      b();
    };
  }, []);

  return (
    <View style={styles.hud}>
      <Pressable onPress={() => router.push("/perfil")} hitSlop={6}>
        {placa ? (
          <AvatarMarco url={placa.avatarUrl} nombre={placa.nombre} marco={placa.marco} tam={36} animar={false} />
        ) : (
          <View style={styles.avatarVacio} />
        )}
      </Pressable>
      <View ref={refRacha} collapsable={false}>
        <Pildora>
          <IconoLlama tam={16} estado={racha === 0 ? "apagada" : racha >= 7 ? "llamas" : "encendida"} />
          <NumeroAnimado valor={racha} v="contador" formato={(n) => String(Math.round(n))} />
        </Pildora>
      </View>
      <Animated.View ref={refChispas} collapsable={false} style={estiloSalto}>
        <Pildora onPress={() => router.push("/tienda")}>
          <IconoChispa tam={16} />
          <NumeroAnimado valor={chispas} v="contador" onTic={() => sonar("moneda")} />
        </Pildora>
      </Animated.View>
      <View style={{ flex: 1 }} />
      {derecha}
      <Pressable
        onPress={() => {
          vibrar.seleccion();
          router.push("/avisos");
        }}
        hitSlop={8}
        style={styles.campana}
        accessibilityLabel={`Avisos: ${avisos} sin leer`}
      >
        <IconoCampana tam={18} c={color.texto2} />
        {avisos > 0 && <Animated.View style={[styles.punto, estiloPunto]} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 },
  avatarVacio: { width: 36, height: 36, borderRadius: 18, backgroundColor: color.surface2 },
  pildora: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: color.surface1,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: 999,
    paddingLeft: 8,
    paddingRight: 11,
    paddingVertical: 5,
  },
  campana: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.surface1,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: "center",
    justifyContent: "center",
  },
  punto: { position: "absolute", top: 7, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: color.error, borderWidth: 2, borderColor: color.surface1 },
});
