import type { BottomTabBarProps } from "expo-router/tabs";
import { useEffect, useState, type ComponentType } from "react";
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { vibrar } from "~/lib/efectos";
import { useJugador } from "~/lib/jugador";
import { color, conAlfa, fuente } from "~/tema";
import { IconoCompetir, IconoHoy, IconoMundos, IconoPerfil, IconoSocial } from "./Iconos";
import Texto from "./Texto";

// Barra inferior de 5 pestañas (maquetas-android.html): la píldora violeta se
// desliza con resorte hasta la pestaña elegida y el ícono da un saltito.

const PESTANAS: Record<string, { titulo: string; Icono: ComponentType<{ tam?: number; c?: string }> }> = {
  index: { titulo: "Hoy", Icono: IconoHoy },
  mundos: { titulo: "Mundos", Icono: IconoMundos },
  competir: { titulo: "Competir", Icono: IconoCompetir },
  social: { titulo: "Social", Icono: IconoSocial },
  perfil: { titulo: "Perfil", Icono: IconoPerfil },
};

function Pestana({ nombre, activa, onPress, insignia }: { nombre: string; activa: boolean; onPress: () => void; insignia: number }) {
  const { titulo, Icono } = PESTANAS[nombre] ?? PESTANAS.index;
  const salto = useSharedValue(1);
  useEffect(() => {
    if (activa) salto.set(withSequence(withTiming(0.82, { duration: 70 }), withSpring(1, { damping: 7, stiffness: 320 })));
  }, [activa, salto]);
  const estiloIcono = useAnimatedStyle(() => ({ transform: [{ scale: salto.value }, { translateY: (1 - salto.value) * 6 }] }));
  return (
    <Pressable onPress={onPress} style={styles.pestana} accessibilityRole="tab" accessibilityState={{ selected: activa }} accessibilityLabel={titulo}>
      <View style={styles.zonaIcono}>
        <Animated.View style={estiloIcono}>
          <Icono tam={21} c={activa ? color.primarioClaro : color.texto2} />
        </Animated.View>
        {insignia > 0 && (
          <View style={styles.insignia}>
            <Texto style={styles.insigniaTexto}>{insignia > 9 ? "9+" : insignia}</Texto>
          </View>
        )}
      </View>
      <Texto style={[styles.titulo, { color: activa ? color.texto : color.texto2 }]}>{titulo}</Texto>
    </Pressable>
  );
}

export default function BarraPestanas({ state, navigation, insets }: BottomTabBarProps) {
  const [ancho, setAncho] = useState(0);
  const { resumen } = useJugador();
  const x = useSharedValue(0);
  const anchoPestana = ancho / state.routes.length;

  useEffect(() => {
    if (anchoPestana > 0) x.set(withSpring(state.index * anchoPestana, { damping: 17, stiffness: 190, mass: 0.8 }));
  }, [state.index, anchoPestana, x]);

  const estiloPildora = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View style={[styles.barra, { paddingBottom: Math.max(insets.bottom, 10) }]} onLayout={(e: LayoutChangeEvent) => setAncho(e.nativeEvent.layout.width - 12)}>
      {anchoPestana > 0 && (
        <Animated.View style={[styles.pildoraCarril, { width: anchoPestana }, estiloPildora]} pointerEvents="none">
          <View style={styles.pildora} />
        </Animated.View>
      )}
      {state.routes.map((ruta, i) => (
        <Pestana
          key={ruta.key}
          nombre={ruta.name}
          activa={state.index === i}
          insignia={ruta.name === "social" ? resumen?.mensajesSinLeer ?? 0 : 0}
          onPress={() => {
            const evento = navigation.emit({ type: "tabPress", target: ruta.key, canPreventDefault: true });
            if (state.index !== i && !evento.defaultPrevented) {
              vibrar.seleccion();
              navigation.navigate(ruta.name, ruta.params);
            }
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: "row",
    paddingTop: 8,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: color.border,
    backgroundColor: "rgba(9,12,20,0.97)",
  },
  pildoraCarril: { position: "absolute", top: 8, left: 6, height: 30, alignItems: "center" },
  pildora: { width: 52, height: 30, borderRadius: 999, backgroundColor: conAlfa(color.primario, 0.24), boxShadow: `0px 0px 14px ${conAlfa(color.primario, 0.35)}` },
  pestana: { flex: 1, alignItems: "center", gap: 3 },
  zonaIcono: { height: 30, width: 52, alignItems: "center", justifyContent: "center" },
  titulo: { fontFamily: fuente.cuerpoFuerte, fontSize: 10.5 },
  insignia: {
    position: "absolute",
    top: -1,
    right: 6,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: color.primario,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: color.bg,
  },
  insigniaTexto: { fontFamily: fuente.mono, fontSize: 9, color: "#fff" },
});
