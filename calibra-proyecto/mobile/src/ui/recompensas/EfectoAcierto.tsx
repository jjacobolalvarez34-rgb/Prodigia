import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, Circle, Group, RadialGradient, vec } from "@shopify/react-native-skia";
import Animated, { Easing, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated";
import { particulasDe, type Efecto, type Particula as PiezaTexto } from "@/lib/recompensas/catalogo";
import { fuente } from "~/tema";
import { Onda, Particulas } from "../fx/capas";
import { crearExplosion, type FormaParticula } from "../fx/particulas";
import Texto from "../Texto";

// Lo que estalla al acertar (efecto de acierto de la tienda, 0248). Antes eran 12
// vistas que se abrían en círculo a la misma velocidad: se veía rústico (2026-10-17).
// Ahora es un estallido de verdad, en Skia y en el hilo de la interfaz: destello en el
// centro, onda que se abre y partículas con física (salen rápido, las frena el aire,
// las tira la gravedad, titilan y dejan estela). Cada efecto elige sus formas y
// colores; las notas y los glifos de ciudad suman sus símbolos encima.

const DURACION = 1.15;

function formasDe(forma: Efecto["forma"]): { formas: FormaParticula[]; gravedad: number; velocidad: number } {
  switch (forma) {
    case "confeti":
      return { formas: ["confeti", "confeti", "punto"], gravedad: 520, velocidad: 430 };
    case "burbujas":
      // Suben (gravedad negativa) y casi sin frenar.
      return { formas: ["punto"], gravedad: -260, velocidad: 220 };
    case "pixeles":
      return { formas: ["confeti", "punto"], gravedad: 380, velocidad: 400 };
    case "estrellas":
      return { formas: ["estrella", "estrella", "punto"], gravedad: 260, velocidad: 420 };
    case "notas":
    case "glifo":
      return { formas: ["punto", "chispa"], gravedad: 200, velocidad: 380 };
    default:
      return { formas: ["chispa", "chispa", "punto", "estrella"], gravedad: 340, velocidad: 480 };
  }
}

function Simbolo({ p, t, forma }: { p: PiezaTexto; t: SharedValue<number>; forma: Efecto["forma"] }) {
  const estilo = useAnimatedStyle(() => {
    const v = Math.min(1, t.value / DURACION);
    const sale = 1 - Math.pow(1 - v, 3);
    return {
      opacity: v < 0.7 ? 1 : (1 - v) / 0.3,
      transform: [{ translateX: p.dx * sale }, { translateY: p.dy * sale - 18 * v }, { rotate: `${Math.sin(v * 6 + p.dx) * 14}deg` }, { scale: 0.5 + Math.sin(Math.min(1, v * 2.2) * Math.PI * 0.5) * 0.7 }],
    };
  });
  return (
    <Animated.View style={[styles.simbolo, estilo]}>
      <Texto style={{ fontFamily: fuente.display, fontSize: forma === "glifo" ? 16 : 19, color: p.color, textShadowColor: p.color, textShadowRadius: 8 }}>{p.texto}</Texto>
    </Animated.View>
  );
}

export default function EfectoAcierto({ efecto, cantidad = 12 }: { efecto: Efecto; cantidad?: number }) {
  const [tam, setTam] = useState<{ w: number; h: number } | null>(null);
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withTiming(DURACION, { duration: DURACION * 1000, easing: Easing.linear }));
  }, [t]);
  const liviano = cantidad < 10;
  const { formas, gravedad, velocidad } = formasDe(efecto.forma);
  const lista = useMemo(
    () =>
      crearExplosion({
        cantidad: liviano ? 14 : 26,
        colores: [...efecto.colores, "#FFFFFF"],
        formas,
        gravedad,
        velocidad,
        vida: efecto.forma === "burbujas" ? 1.05 : 0.95,
        tam: efecto.forma === "burbujas" ? 6 : 7,
        radioSalida: 14,
        semilla: 3 + efecto.colores.length,
      }),
    [efecto, liviano] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const simbolos = efecto.forma === "notas" || efecto.forma === "glifo" ? particulasDe(efecto, 6, 64) : [];
  const principal = efecto.colores[0];
  // Destello: aparece en 60 ms y se apaga en 300 ms.
  const destello = useDerivedValue(() => (t.value < 0.06 ? t.value / 0.06 : Math.max(0, 1 - (t.value - 0.06) / 0.3)));
  const radioDestello = useDerivedValue(() => 30 + Math.min(1, t.value / 0.35) * 50);
  const onda = useDerivedValue(() => Math.min(1, t.value / 0.55));

  return (
    <View pointerEvents="none" style={styles.capa} onLayout={(e) => setTam({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {tam && (
        <Canvas style={StyleSheet.absoluteFill}>
          <Group opacity={destello} blendMode="plus">
            <Circle cx={tam.w / 2} cy={tam.h / 2} r={radioDestello}>
              <RadialGradient c={vec(tam.w / 2, tam.h / 2)} r={80} colors={["rgba(255,255,255,0.75)", `${principal}88`, `${principal}00`]} positions={[0, 0.35, 1]} />
            </Circle>
          </Group>
          {!liviano && <Onda cx={tam.w / 2} cy={tam.h / 2} desde={18} hasta={Math.max(tam.w, tam.h) * 0.55} color={principal} avance={onda} />}
          <Particulas lista={lista} tiempo={t} cx={tam.w / 2} cy={tam.h / 2} ancho={tam.w} alto={tam.h} brillo={!liviano} />
        </Canvas>
      )}
      {simbolos.map((p, i) => (
        <Simbolo key={i} p={p} t={t} forma={efecto.forma} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  capa: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  simbolo: { position: "absolute" },
});
