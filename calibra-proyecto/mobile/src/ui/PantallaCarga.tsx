import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from "react-native";
import { color, mono, MUNDOS } from "~/tema";

// Pantalla de carga al abrir la app: el logo late, los símbolos de los 13 mundos
// suben flotando con su neón, la barra muestra cuánto falta (el progreso es real:
// lo mueve el layout a medida que termina cada paso) y abajo rotan "pro tips".

const TIPS = [
  "Por 11 con dos cifras: suma las cifras y ponla en el medio. 43 × 11 → 4 (4+3) 3 = 473.",
  "Por 5: multiplica por 10 y divide entre 2. 68 × 5 → 680 ÷ 2 = 340.",
  "Restar 9: resta 10 y suma 1. 73 − 9 → 63 + 1 = 64.",
  "Cuadrado de un número que termina en 5: 35² → 3 × 4 = 12, y le pegas 25: 1225.",
  "Por 4: duplica dos veces. 17 × 4 → 34 → 68.",
  "Sumar 99: suma 100 y resta 1. 245 + 99 → 345 − 1 = 344.",
  "Por 25: multiplica por 100 y divide entre 4. 36 × 25 → 3600 ÷ 4 = 900.",
  "Si aciertas seguido, la dificultad sube sola. Si fallas, baja un poco: siempre juegas en tu nivel.",
  "Tu progreso es el mismo en la app y en la web: la racha y las Chispas se comparten.",
  "Un sprint de 60 segundos al día alcanza para que tu racha siga viva.",
  "En Avisos → ajustes eliges qué notificaciones recibir. Nunca te avisamos de noche.",
  "Agrega el widget de Prodigia a tu pantalla de inicio y mira tu racha sin abrir la app.",
];

const GLIFOS = MUNDOS.map((m) => ({ glifo: m.glifo, color: m.neon }));
const { width: ANCHO, height: ALTO } = Dimensions.get("window");

function GlifoFlotante({ glifo, color: tono, indice }: { glifo: string; color: string; indice: number }) {
  const subida = useState(() => new Animated.Value(0))[0];
  const x = ((indice * 83) % 100) / 100;
  const tamano = 18 + ((indice * 37) % 22);
  const duracion = 6000 + ((indice * 911) % 4000);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(subida, { toValue: 1, duration: duracion, delay: (indice * 420) % 3000, easing: Easing.linear, useNativeDriver: true })
    );
    anim.start();
    return () => anim.stop();
  }, [subida, duracion, indice]);

  return (
    <Animated.Text
      style={[
        styles.glifo,
        {
          left: x * (ANCHO - 40),
          fontSize: tamano,
          color: tono,
          opacity: subida.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 0.55, 0.35, 0] }),
          transform: [
            { translateY: subida.interpolate({ inputRange: [0, 1], outputRange: [ALTO + 40, -60] }) },
            { rotate: subida.interpolate({ inputRange: [0, 1], outputRange: ["-12deg", "12deg"] }) },
          ],
        },
      ]}
    >
      {glifo}
    </Animated.Text>
  );
}

interface Props {
  progreso: number; // 0 a 1
  etapa: string;
  onTerminada: () => void;
}

export default function PantallaCarga({ progreso, etapa, onTerminada }: Props) {
  const barra = useState(() => new Animated.Value(0))[0];
  const pulso = useState(() => new Animated.Value(0))[0];
  const giro = useState(() => new Animated.Value(0))[0];
  const salida = useState(() => new Animated.Value(1))[0];
  const tipOpacidad = useState(() => new Animated.Value(1))[0];
  const [porcentaje, setPorcentaje] = useState(0);
  const [tip, setTip] = useState(() => Math.floor(Math.random() * TIPS.length));
  const terminadaRef = useRef(false);

  // Logo que late y aro que gira.
  useEffect(() => {
    const latido = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulso, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const vuelta = Animated.loop(Animated.timing(giro, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true }));
    latido.start();
    vuelta.start();
    return () => {
      latido.stop();
      vuelta.stop();
    };
  }, [pulso, giro]);

  // Número del porcentaje, siempre en sincronía con la barra.
  useEffect(() => {
    const id = barra.addListener(({ value }) => setPorcentaje(Math.round(value * 100)));
    return () => barra.removeListener(id);
  }, [barra]);

  // La barra avanza suave hacia el progreso real; al llegar a 100 % se desvanece.
  useEffect(() => {
    Animated.timing(barra, { toValue: progreso, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(({ finished }) => {
      if (finished && progreso >= 1 && !terminadaRef.current) {
        terminadaRef.current = true;
        Animated.timing(salida, { toValue: 0, duration: 380, delay: 250, useNativeDriver: true }).start(() => onTerminada());
      }
    });
  }, [progreso, barra, salida, onTerminada]);

  // Un tip distinto cada 3,2 s, con fundido.
  useEffect(() => {
    const id = setInterval(() => {
      Animated.timing(tipOpacidad, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
        setTip((t) => (t + 1) % TIPS.length);
        Animated.timing(tipOpacidad, { toValue: 1, duration: 260, useNativeDriver: true }).start();
      });
    }, 3200);
    return () => clearInterval(id);
  }, [tipOpacidad]);

  const escalaLogo = pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });
  const brillo = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.8] });
  const rotacion = giro.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const anchoBarra = barra.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.pantalla, { opacity: salida }]} pointerEvents="none">
      <LinearGradient colors={["#1B1440", color.bg, color.bgHondo]} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      {GLIFOS.map((g, i) => (
        <GlifoFlotante key={i} glifo={g.glifo} color={g.color} indice={i} />
      ))}

      <View style={styles.centro}>
        <View style={styles.logoCaja}>
          <Animated.View style={[styles.halo, { opacity: brillo, transform: [{ scale: escalaLogo }] }]} />
          <Animated.View style={[styles.orbita, { transform: [{ rotate: rotacion }] }]}>
            <View style={styles.orbitaPunto} />
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: escalaLogo }] }}>
            <Image source={require("../../assets/images/android-icon-foreground.png")} style={styles.logo} contentFit="contain" />
          </Animated.View>
        </View>
        <Text style={styles.marca}>Prodigia</Text>
        <Text style={styles.lema}>Tu cabeza, en modo juego.</Text>
      </View>

      <View style={styles.abajo}>
        <View style={styles.filaProgreso}>
          <Text style={styles.etapa} numberOfLines={1}>
            {etapa}
          </Text>
          <Text style={styles.porcentaje}>{porcentaje}%</Text>
        </View>
        <View style={styles.barraFondo}>
          <Animated.View style={[styles.barraRelleno, { width: anchoBarra }]}>
            <LinearGradient colors={[color.primario, "#B79CFF", color.logro]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>

        <Animated.View style={[styles.tip, { opacity: tipOpacidad }]}>
          <Text style={styles.tipEtiqueta}>✦ PRO TIP</Text>
          <Text style={styles.tipTexto}>{TIPS[tip]}</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pantalla: { backgroundColor: color.bg, zIndex: 100, elevation: 100 },
  glifo: { position: "absolute", top: 0, fontWeight: "800" },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
  logoCaja: { width: 180, height: 180, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  halo: { position: "absolute", width: 170, height: 170, borderRadius: 85, backgroundColor: color.primario, shadowColor: color.primario, shadowRadius: 40, shadowOpacity: 1, elevation: 20 },
  orbita: { position: "absolute", width: 176, height: 176, borderRadius: 88, borderWidth: 1.5, borderColor: "#9B85FF55" },
  orbitaPunto: { position: "absolute", top: -5, left: 83, width: 10, height: 10, borderRadius: 5, backgroundColor: color.logro, shadowColor: color.logro, shadowRadius: 8, shadowOpacity: 1 },
  logo: { width: 190, height: 190 },
  marca: { color: color.texto, fontSize: 38, fontWeight: "800", letterSpacing: -0.5 },
  lema: { color: color.texto2, fontSize: 15 },
  abajo: { paddingHorizontal: 28, paddingBottom: 56, gap: 12 },
  filaProgreso: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 12 },
  etapa: { flex: 1, color: color.texto2, fontSize: 14, fontWeight: "600" },
  porcentaje: { color: color.texto, fontFamily: mono, fontSize: 22, fontWeight: "800" },
  barraFondo: { height: 12, borderRadius: 6, backgroundColor: color.surface2, overflow: "hidden", borderWidth: 1, borderColor: color.border },
  barraRelleno: { height: "100%", borderRadius: 6, overflow: "hidden" },
  tip: { marginTop: 10, backgroundColor: "#12172ACC", borderRadius: 18, borderWidth: 1, borderColor: color.border, padding: 14, gap: 6, minHeight: 92 },
  tipEtiqueta: { color: color.logro, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  tipTexto: { color: color.texto, fontSize: 14, lineHeight: 20 },
});
