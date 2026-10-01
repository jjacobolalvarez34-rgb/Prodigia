import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  Easing,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
  type SharedValue,
} from "react-native-reanimated";
import { sonar, vibrar } from "~/lib/efectos";
import { brillo, color, conAlfa, fuente, radio } from "~/tema";
import Anillo from "./Anillo";
import { IconoCerrar, IconoEscudo } from "./Iconos";
import Texto from "./Texto";

// Piezas del sprint (02-SISTEMA-VISUAL.md §7.2 y §9): cabecera con anillo de tiempo
// y combo, puntos de progreso, tarjeta del problema que "sella" al acertar, tiembla
// al fallar y enciende un borde giratorio con combo ≥ 5, "+XP" que sale flotando y
// teclado con volumen.

export function Cabecera({ onSalir, restanteMs, totalMs, combo, acento }: { onSalir: () => void; restanteMs: number; totalMs: number; combo: number; acento: string }) {
  const s = Math.ceil(restanteMs / 1000);
  const latido = useSharedValue(1);
  useEffect(() => {
    if (combo >= 2) latido.set(withRepeat(withSequence(withTiming(1.1, { duration: 450 }), withTiming(1, { duration: 450 })), -1));
    else latido.set(1);
  }, [combo >= 2, latido]); // eslint-disable-line react-hooks/exhaustive-deps
  const saltoCombo = useSharedValue(1);
  useEffect(() => {
    if (combo >= 2) saltoCombo.set(withSequence(withTiming(1.35, { duration: 90 }), withSpring(1, { damping: 6 })));
  }, [combo, saltoCombo]);
  const estiloCombo = useAnimatedStyle(() => ({ transform: [{ scale: latido.value * saltoCombo.value }] }));
  const urgente = s <= 10;
  return (
    <View style={styles.cabecera}>
      <Pressable onPress={onSalir} hitSlop={12} style={styles.x} accessibilityLabel="Salir de la partida">
        <IconoCerrar tam={16} c={color.texto2} />
      </Pressable>
      <Anillo valor={restanteMs / totalMs} tam={56} grosor={5} acento={urgente ? color.error : acento} duracion={160}>
        <Texto v="mono" tam={13} c={urgente ? color.error : color.texto}>
          0:{String(Math.max(0, s)).padStart(2, "0")}
        </Texto>
      </Anillo>
      <View style={{ width: 76, alignItems: "flex-end" }}>
        {combo >= 2 && (
          <Animated.View style={[styles.combo, estiloCombo, combo >= 5 && { boxShadow: brillo(color.racha, 16, 0.5) }]}>
            <Texto v="mono" tam={16} c={color.racha}>
              ×{combo} 🔥
            </Texto>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

export function Progreso({ resultados, total, acento, escudos }: { resultados: boolean[]; total: number; acento: string; escudos: number }) {
  const pulso = useSharedValue(1);
  useEffect(() => {
    pulso.set(withRepeat(withSequence(withTiming(1.4, { duration: 500 }), withTiming(1, { duration: 500 })), -1));
  }, [pulso]);
  const estiloAhora = useAnimatedStyle(() => ({ transform: [{ scale: pulso.value }] }));
  return (
    <View style={styles.progreso}>
      <View style={styles.puntos}>
        {Array.from({ length: total }, (_, i) => {
          if (i < resultados.length) return <Animated.View key={i} entering={ZoomIn.springify()} style={[styles.punto, { backgroundColor: resultados[i] ? color.correcto : color.error }]} />;
          if (i === resultados.length) return <Animated.View key={i} style={[styles.punto, { backgroundColor: acento, boxShadow: brillo(acento, 8, 0.6) }, estiloAhora]} />;
          return <View key={i} style={styles.punto} />;
        })}
      </View>
      <View style={styles.escudos}>
        {Array.from({ length: escudos }, (_, i) => (
          <IconoEscudo key={i} tam={16} />
        ))}
      </View>
    </View>
  );
}

// Tarjeta del problema. `sello` y `sacudida` se disparan desde el sprint.
export function TarjetaProblema({
  children,
  acento,
  combo,
  feedback,
  sello,
  sacudida,
}: {
  children: ReactNode;
  acento: string;
  combo: number;
  feedback: "idle" | "correcto" | "incorrecto";
  sello: SharedValue<number>;
  sacudida: SharedValue<number>;
}) {
  const [lado, setLado] = useState(0);
  const giro = useSharedValue(0);
  const enLlamas = combo >= 5;
  useEffect(() => {
    if (enLlamas) giro.set(withRepeat(withTiming(1, { duration: combo >= 10 ? 1400 : 2600, easing: Easing.linear }), -1));
    else giro.set(0);
  }, [enLlamas, combo >= 10, giro]); // eslint-disable-line react-hooks/exhaustive-deps
  const estiloGiro = useAnimatedStyle(() => ({ transform: [{ rotate: `${giro.value * 360}deg` }] }));
  const estilo = useAnimatedStyle(() => ({ transform: [{ scale: sello.value }, { translateX: sacudida.value }] }));
  const bordeColor = feedback === "correcto" ? color.correcto : feedback === "incorrecto" ? color.error : enLlamas ? "transparent" : conAlfa(acento, 0.55);
  return (
    <Animated.View
      onLayout={(e: LayoutChangeEvent) => setLado(Math.hypot(e.nativeEvent.layout.width, e.nativeEvent.layout.height))}
      style={[styles.marco, { borderColor: bordeColor, boxShadow: brillo(feedback === "correcto" ? color.correcto : feedback === "incorrecto" ? color.error : acento, 34, enLlamas ? 0.45 : 0.22) }, estilo]}
    >
      {enLlamas && feedback === "idle" && lado > 0 && (
        <Animated.View style={[{ position: "absolute", width: lado, height: lado, left: "50%", top: "50%", marginLeft: -lado / 2, marginTop: -lado / 2 }, estiloGiro]}>
          <LinearGradient colors={[acento, color.logro, color.racha, acento]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
      <View style={styles.tarjeta}>{children}</View>
    </Animated.View>
  );
}

// "+12" que sube y se desvanece.
export function Flotante({ texto, c = color.correcto }: { texto: string; c?: string }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.set(withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }));
  }, [y]);
  const estilo = useAnimatedStyle(() => ({ opacity: 1 - y.value * 0.9, transform: [{ translateY: -46 * y.value }, { scale: 0.8 + Math.min(1, y.value * 3) * 0.4 }] }));
  return (
    <Animated.View pointerEvents="none" exiting={FadeOut} style={[styles.flotante, estilo]}>
      <Texto style={{ fontFamily: fuente.mono, fontSize: 22, color: c, textShadowColor: c, textShadowRadius: 12 }}>{texto}</Texto>
    </Animated.View>
  );
}

// Animaciones de acierto (sello) y error (sacudida: 6 dp, 3 ciclos, 240 ms).
export function animarAcierto(sello: SharedValue<number>) {
  sello.set(withSequence(withTiming(1.07, { duration: 90 }), withSpring(1, { damping: 7, stiffness: 300 })));
}
export function animarError(sacudida: SharedValue<number>) {
  sacudida.set(withSequence(withTiming(-8, { duration: 40 }), withTiming(8, { duration: 40 }), withTiming(-6, { duration: 40 }), withTiming(6, { duration: 40 }), withTiming(-3, { duration: 40 }), withTiming(0, { duration: 40 })));
}

// ---------- Teclado ----------

function Tecla({ texto, onPress, deshabilitado, apagado }: { texto: string; onPress: () => void; deshabilitado?: boolean; apagado?: boolean }) {
  const y = useSharedValue(0);
  const estilo = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Pressable
      disabled={deshabilitado}
      onPressIn={() => {
        y.set(withTiming(4, { duration: 50 }));
        vibrar.seleccion();
        sonar("tecla");
      }}
      onPressOut={() => y.set(withSpring(0, { damping: 10, stiffness: 400 }))}
      onPress={onPress}
      style={[styles.teclaBase, deshabilitado && { opacity: 0.45 }]}
    >
      <Animated.View style={[styles.tecla, estilo]}>
        <Texto style={{ fontFamily: fuente.mono, fontSize: apagado ? 20 : 25, color: apagado ? color.texto2 : color.texto }}>{texto}</Texto>
      </Animated.View>
    </Pressable>
  );
}

export function Teclado({ onDigito, onBorrar, onMenos, deshabilitado }: { onDigito: (d: string) => void; onBorrar: () => void; onMenos: () => void; deshabilitado?: boolean }) {
  return (
    <View style={{ gap: 8 }}>
      {[
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
      ].map((fila) => (
        <View key={fila[0]} style={styles.filaTeclas}>
          {fila.map((d) => (
            <Tecla key={d} texto={d} onPress={() => onDigito(d)} deshabilitado={deshabilitado} />
          ))}
        </View>
      ))}
      <View style={styles.filaTeclas}>
        <Tecla texto="−" apagado onPress={onMenos} deshabilitado={deshabilitado} />
        <Tecla texto="0" onPress={() => onDigito("0")} deshabilitado={deshabilitado} />
        <Tecla texto="⌫" apagado onPress={onBorrar} deshabilitado={deshabilitado} />
      </View>
    </View>
  );
}

// Barra del rival (fantasma o en vivo): cuántas lleva respondidas.
export function BarraRival({ nombre, respondidos, total, yo, fantasma }: { nombre: string; respondidos: number; total: number; yo: number; fantasma: boolean }) {
  const texto = yo > respondidos ? `Le vas ganando a ${nombre}` : yo < respondidos ? `${nombre} va adelante` : `Parejos con ${nombre}`;
  return (
    <View style={styles.rival}>
      <Texto v="nota" tam={11} c={color.texto2}>
        {fantasma ? "👻 " : "⚔ "}
        {texto}
      </Texto>
      <View style={styles.puntos}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.puntoChico, i < respondidos && { backgroundColor: color.error }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecera: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 4 },
  x: { width: 38, height: 38, borderRadius: 19, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border, alignItems: "center", justifyContent: "center" },
  combo: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: conAlfa(color.racha, 0.15) },
  progreso: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, marginTop: 10 },
  puntos: { flexDirection: "row", gap: 6 },
  punto: { width: 10, height: 10, borderRadius: 5, backgroundColor: color.surface3 },
  puntoChico: { width: 7, height: 7, borderRadius: 4, backgroundColor: color.surface3 },
  escudos: { flexDirection: "row", gap: 3 },
  marco: { borderRadius: radio.sprint, borderWidth: 2, overflow: "hidden", padding: 0 },
  tarjeta: { backgroundColor: color.surface1, borderRadius: radio.sprint - 2, margin: 2, paddingVertical: 26, paddingHorizontal: 16, alignItems: "center", gap: 10 },
  flotante: { position: "absolute", top: 8, right: 18 },
  filaTeclas: { flexDirection: "row", gap: 8 },
  teclaBase: { flex: 1, height: 60, borderRadius: 14, backgroundColor: "#080B17" },
  tecla: { height: 56, borderRadius: 14, backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border, alignItems: "center", justifyContent: "center" },
  rival: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 18, marginTop: 8, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, backgroundColor: conAlfa(color.error, 0.08), borderWidth: 1, borderColor: conAlfa(color.error, 0.3) },
});
