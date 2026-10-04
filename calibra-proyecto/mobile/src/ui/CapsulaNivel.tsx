import { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Defs, Ellipse, LinearGradient, Path, RadialGradient, Stop } from "react-native-svg";
import { sonar, vibrar } from "~/lib/efectos";
import { useLiviano } from "~/lib/rendimiento";
import { color, conAlfa, fuente } from "~/tema";
import Boton3D from "./Boton3D";
import { IconoChispa } from "./Iconos";
import NumeroAnimado from "./NumeroAnimado";
import Texto from "./Texto";

// "Cápsula de Chispas" al subir de nivel DE CUENTA (NivelCuentaSubio.tsx de la web,
// mismo diseño: dos mitades en el degradé de marca violeta → dorado). En la app:
// 1) la cápsula cae desde arriba y rebota en el piso; 2) queda latiendo esperando
// que la toques; 3) al tocarla tiembla, se abre de golpe y salen estrellas y
// Chispas volando; 4) aparece "¡NIVEL N!" con las Chispas contando.
// Las Chispas del regalo ya las acreditó la base al cerrar la partida: esto es la
// entrega. Todo corre en el hilo nativo (Reanimated).

const { height: ALTO } = Dimensions.get("window");
const PARTICULAS = 22;
const CHISPAS_VOLANDO = 8;

type Fase = "cae" | "espera" | "abre" | "premio";

function Capsula({ abierta }: { abierta: SharedValue<number> }) {
  const arriba = useAnimatedStyle(() => ({
    opacity: 1 - abierta.value,
    transform: [{ translateY: -60 * abierta.value }, { translateX: -18 * abierta.value }, { rotate: `${-28 * abierta.value}deg` }],
  }));
  const abajo = useAnimatedStyle(() => ({
    opacity: 1 - abierta.value,
    transform: [{ translateY: 60 * abierta.value }, { translateX: 18 * abierta.value }, { rotate: `${28 * abierta.value}deg` }],
  }));
  return (
    <View style={{ width: 110, height: 150 }}>
      <Animated.View style={[StyleSheet.absoluteFill, arriba]}>
        <Svg width={110} height={150} viewBox="0 0 100 140">
          <Defs>
            <LinearGradient id="capArriba" x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0" stopColor="#7C5CFF" />
              <Stop offset="1" stopColor="#A794FF" />
            </LinearGradient>
          </Defs>
          <Path d="M20 70 V50 A30 30 0 0 1 80 50 V70 Z" fill="url(#capArriba)" />
          <Path d="M30 44 A20 20 0 0 1 48 30" stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={5} strokeLinecap="round" fill="none" />
        </Svg>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, abajo]}>
        <Svg width={110} height={150} viewBox="0 0 100 140">
          <Defs>
            <LinearGradient id="capAbajo" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFC53D" />
              <Stop offset="1" stopColor="#E4CBA0" />
            </LinearGradient>
          </Defs>
          <Path d="M20 70 V90 A30 30 0 0 0 80 90 V70 Z" fill="url(#capAbajo)" />
          <Path d="M17 69 H83 V73 H17 Z" fill="#2A1A00" fillOpacity={0.25} />
        </Svg>
      </Animated.View>
    </View>
  );
}

// Estrellita de 4 puntas que sale disparada desde el centro.
function Particula({ i, estallido }: { i: number; estallido: SharedValue<number> }) {
  const angulo = (i / PARTICULAS) * Math.PI * 2 + (i % 2 === 0 ? 0.15 : -0.15);
  const distancia = 90 + (i % 3) * 34;
  const dorada = i % 2 === 0;
  const estilo = useAnimatedStyle(() => {
    const t = estallido.value;
    return {
      opacity: t <= 0 ? 0 : t < 0.7 ? 1 : (1 - t) / 0.3,
      transform: [{ translateX: Math.cos(angulo) * distancia * t }, { translateY: Math.sin(angulo) * distancia * t }, { scale: 0.5 + Math.sin(t * Math.PI) * 0.8 }, { rotate: `${t * (dorada ? 180 : -180)}deg` }],
    };
  });
  return <Animated.View style={[styles.particula, { backgroundColor: dorada ? "#FFC53D" : "#A794FF" }, estilo]} />;
}

// Chispas que salen volando hacia arriba (hacia tu saldo).
function ChispaVolando({ i, estallido }: { i: number; estallido: SharedValue<number> }) {
  const x = (i - (CHISPAS_VOLANDO - 1) / 2) * 26;
  const estilo = useAnimatedStyle(() => {
    const t = Math.max(0, Math.min(1, estallido.value * 1.2 - i * 0.04));
    return {
      opacity: t <= 0 ? 0 : t < 0.8 ? 1 : (1 - t) * 5,
      transform: [{ translateX: x * t }, { translateY: -ALTO * 0.45 * t * t }, { scale: 1 + t * 0.4 }],
    };
  });
  return (
    <Animated.View style={[styles.chispaVolando, estilo]}>
      <IconoChispa tam={22} />
    </Animated.View>
  );
}

export default function CapsulaNivel({ nivel, bonus, onCerrar }: { nivel: number; bonus: number; onCerrar: () => void }) {
  const liviano = useLiviano();
  const [fase, setFase] = useState<Fase>("cae");
  const caida = useSharedValue(-ALTO * 0.7);
  const giro = useSharedValue(-14);
  const latido = useSharedValue(0);
  const temblor = useSharedValue(0);
  const abierta = useSharedValue(0);
  const estallido = useSharedValue(0);
  const brilloCentro = useSharedValue(0);
  const sombra = useSharedValue(0);

  // 1) Cae y rebota; al quedar quieta, empieza a latir.
  useEffect(() => {
    sonar("swoosh");
    caida.set(
      withSpring(0, { damping: 9, stiffness: 120, mass: 1.1 }, (fin) => {
        if (fin) runOnJS(setFase)("espera");
      })
    );
    giro.set(withSequence(withTiming(10, { duration: 420 }), withSpring(0, { damping: 6, stiffness: 140 })));
    sombra.set(withTiming(1, { duration: 650, easing: Easing.in(Easing.quad) }));
    const t = setTimeout(() => {
      sonar("moneda");
      vibrar.medio();
    }, 520);
    return () => clearTimeout(t);
  }, [caida, giro, sombra]);

  useEffect(() => {
    if (fase !== "espera") return;
    latido.set(withRepeat(withSequence(withTiming(1, { duration: 650, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 650, easing: Easing.inOut(Easing.quad) })), -1));
    return () => cancelAnimation(latido);
  }, [fase, latido]);

  // 2) Tocar: tiembla cargando luz, se abre y estalla.
  function abrir() {
    if (fase !== "espera") return;
    setFase("abre");
    cancelAnimation(latido);
    latido.set(withTiming(0, { duration: 120 }));
    vibrar.fuerte();
    sonar("combo");
    temblor.set(withSequence(...Array.from({ length: 6 }, (_, k) => withTiming(k % 2 ? -7 : 7, { duration: 45 })), withTiming(0, { duration: 45 })));
    brilloCentro.set(withSequence(withTiming(0.6, { duration: 320 }), withTiming(1, { duration: 120 }), withTiming(0, { duration: 700 })));
    abierta.set(withDelay(330, withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) })));
    estallido.set(
      withDelay(
        330,
        withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }, (fin) => {
          if (fin) runOnJS(setFase)("premio");
        })
      )
    );
    setTimeout(() => {
      sonar("nivel_cuenta");
      vibrar.exito();
    }, 330);
  }

  useEffect(() => {
    if (fase === "premio") sonar("recompensa");
  }, [fase]);

  const estiloCapsula = useAnimatedStyle(() => ({
    transform: [{ translateY: caida.value }, { translateX: temblor.value }, { rotate: `${giro.value}deg` }, { scale: 1 + latido.value * 0.06 }],
  }));
  const estiloSombra = useAnimatedStyle(() => ({ opacity: sombra.value * (1 - abierta.value) * 0.5, transform: [{ scaleX: 0.4 + sombra.value * 0.6 - latido.value * 0.08 }] }));
  const estiloBrillo = useAnimatedStyle(() => ({ opacity: Math.max(brilloCentro.value, latido.value * 0.35), transform: [{ scale: 0.6 + brilloCentro.value * 2.4 + latido.value * 0.15 }] }));

  return (
    <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(220)} style={styles.capa}>
      <View style={styles.centro}>
        {fase !== "premio" && (
          <Animated.View entering={FadeInDown.duration(300)} style={{ alignItems: "center", gap: 4, marginBottom: 26 }}>
            <Texto v="micro" c={color.primarioClaro}>
              ¡Subiste de nivel!
            </Texto>
            <Texto v="h2" centro>
              Te llegó una cápsula
            </Texto>
          </Animated.View>
        )}

        <View style={styles.escenario}>
          <Animated.View style={[styles.brillo, estiloBrillo]} pointerEvents="none">
            <Svg width={180} height={180}>
              <Defs>
                <RadialGradient id="capBrillo" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor="#FFF6DE" stopOpacity={0.95} />
                  <Stop offset="1" stopColor="#FFC53D" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Ellipse cx={90} cy={90} rx={90} ry={90} fill="url(#capBrillo)" />
            </Svg>
          </Animated.View>
          {Array.from({ length: liviano ? 12 : PARTICULAS }, (_, i) => (
            <Particula key={i} i={i} estallido={estallido} />
          ))}
          {Array.from({ length: CHISPAS_VOLANDO }, (_, i) => (
            <ChispaVolando key={`c${i}`} i={i} estallido={estallido} />
          ))}
          <Animated.View style={[styles.sombra, estiloSombra]} />
          <Pressable onPress={abrir} disabled={fase !== "espera"} hitSlop={30}>
            <Animated.View style={estiloCapsula}>
              <Capsula abierta={abierta} />
            </Animated.View>
          </Pressable>
        </View>

        {fase === "espera" && (
          <Animated.View entering={FadeIn.delay(150).duration(300)} style={{ marginTop: 18 }}>
            <Texto v="fuerte" c={color.logro} centro>
              ¡Tócala para abrirla!
            </Texto>
          </Animated.View>
        )}

        {fase === "premio" && (
          <View style={{ alignItems: "center", gap: 6, marginTop: -40 }}>
            <Animated.View entering={ZoomIn.springify().damping(9)}>
              <Texto style={{ fontFamily: fuente.display, fontSize: 46, color: color.texto, textShadowColor: color.primario, textShadowRadius: 20 }}>¡NIVEL {nivel}!</Texto>
            </Animated.View>
            {bonus > 0 && (
              <Animated.View entering={FadeInDown.delay(150).duration(320)} style={styles.bonus}>
                <IconoChispa tam={26} />
                <NumeroAnimado valor={bonus} desde={0} prefijo="+" v="mono" c={color.logro} duracion={1100} estilo={{ fontSize: 30 }} onTic={() => sonar("moneda")} />
                <Texto v="fuerte" c={color.logro}>
                  Chispas
                </Texto>
              </Animated.View>
            )}
            <Animated.View entering={FadeIn.delay(400).duration(300)}>
              <Texto v="nota" centro>
                Sigue sumando para el nivel {nivel + 1}
              </Texto>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(600).duration(300)} style={{ alignSelf: "stretch", marginTop: 14 }}>
              <Boton3D titulo="¡Continuar!" brillo onPress={onCerrar} />
            </Animated.View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  capa: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(3,4,10,0.86)", zIndex: 300, elevation: 300, alignItems: "center", justifyContent: "center" },
  centro: { width: "86%", maxWidth: 380, alignItems: "center" },
  escenario: { width: 260, height: 240, alignItems: "center", justifyContent: "center" },
  brillo: { position: "absolute", width: 180, height: 180 },
  particula: { position: "absolute", width: 9, height: 9, borderRadius: 2 },
  chispaVolando: { position: "absolute" },
  sombra: { position: "absolute", bottom: 24, width: 96, height: 14, borderRadius: 50, backgroundColor: conAlfa("#000000", 0.9) },
  bonus: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: conAlfa(color.logro, 0.5), backgroundColor: conAlfa(color.logro, 0.12) },
});
