import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View, type LayoutChangeEvent, type StyleProp, type TextStyle } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming, type SharedValue } from "react-native-reanimated";
import { useAnimacionActiva } from "~/lib/rendimiento";
import { FUENTE_FAMILIA } from "~/lib/placa";
import { color as colores, fuente as fuentes } from "~/tema";

// El nombre del jugador con la fuente, el color y la animación que compró en la
// tienda (las 10 de la web: NombreConFuente.tsx + globals.css). Shuffle y decrypted
// solo se animan donde hay un único nombre en pantalla (`animar`), igual que en la web.

interface Props {
  texto: string;
  fuente?: string;
  animacion?: string;
  color?: string | null;
  tam?: number;
  animar?: boolean;
  estilo?: StyleProp<TextStyle>;
  lineas?: number;
  // En listas (rankings, amigos): sin máscaras ni letras animadas. La máscara nativa
  // (MaskedView) recicla su imagen en cada cambio de tamaño y con varias filas
  // entrando animadas a la vez Android cerraba la app.
  ligero?: boolean;
}

const GRADIENTES: Record<string, string[]> = {
  arcoiris: ["#FF5D5D", "#FFB627", "#3DDC97", "#4CC9F0", "#9B85FF", "#E36BF2", "#FF5D5D"],
  prisma: ["#9B85FF", "#FFB627", "#4FE0F5", "#E36BF2", "#9B85FF"],
  brillo: ["#9B85FF", "#FFB627", "#9B85FF"],
};

function NombreDegradado({ texto, estiloTexto, colores: lista, duracion }: { texto: string; estiloTexto: StyleProp<TextStyle>; colores: string[]; duracion: number }) {
  const [ancho, setAncho] = useState(0);
  const x = useSharedValue(0);
  const activa = useAnimacionActiva();
  useEffect(() => {
    if (ancho === 0 || !activa) {
      cancelAnimation(x);
      return;
    }
    x.set(withRepeat(withTiming(1, { duration: duracion, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(x);
  }, [ancho, duracion, x, activa]);
  const estilo = useAnimatedStyle(() => ({ transform: [{ translateX: -x.value * ancho }] }));
  // El degradé se repite dos veces para que el bucle no tenga salto.
  const dobles = [...lista, ...lista.slice(1)];
  return (
    <MaskedView maskElement={<Text style={estiloTexto}>{texto}</Text>}>
      <Text style={[estiloTexto, { opacity: 0 }]} onLayout={(e: LayoutChangeEvent) => setAncho(e.nativeEvent.layout.width)}>
        {texto}
      </Text>
      {ancho > 0 && (
        <Animated.View style={[{ position: "absolute", top: 0, bottom: 0, left: 0, width: ancho * 2 }, estilo]}>
          <LinearGradient colors={dobles as [string, string, ...string[]]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
    </MaskedView>
  );
}

function NombreBrillo({ texto, estiloTexto, base }: { texto: string; estiloTexto: StyleProp<TextStyle>; base: string }) {
  const [ancho, setAncho] = useState(0);
  const x = useSharedValue(-0.4);
  const activa = useAnimacionActiva();
  useEffect(() => {
    if (ancho === 0 || !activa) {
      cancelAnimation(x);
      return;
    }
    x.set(withRepeat(withSequence(withTiming(-0.4, { duration: 0 }), withDelay(900, withTiming(1.2, { duration: 1300, easing: Easing.inOut(Easing.quad) }))), -1));
    return () => cancelAnimation(x);
  }, [ancho, x, activa]);
  const estilo = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * ancho }] }));
  return (
    <MaskedView maskElement={<Text style={estiloTexto}>{texto}</Text>}>
      <Text style={[estiloTexto, { color: base }]} onLayout={(e: LayoutChangeEvent) => setAncho(e.nativeEvent.layout.width)}>
        {texto}
      </Text>
      {ancho > 0 && (
        <Animated.View style={[{ position: "absolute", top: 0, bottom: 0, width: Math.max(30, ancho * 0.35) }, estilo]}>
          <LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.95)", "rgba(255,255,255,0)"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
    </MaskedView>
  );
}

function NombreNeon({ texto, estiloTexto, base }: { texto: string; estiloTexto: StyleProp<TextStyle>; base: string }) {
  const o = useSharedValue(0.4);
  const activa = useAnimacionActiva();
  useEffect(() => {
    if (!activa) {
      cancelAnimation(o);
      return;
    }
    o.set(withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0.35, { duration: 900 }), withTiming(0.9, { duration: 120 }), withTiming(0.5, { duration: 160 })), -1));
    return () => cancelAnimation(o);
  }, [o, activa]);
  const estilo = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <View>
      <Animated.Text style={[estiloTexto, { color: base, position: "absolute", textShadowColor: base, textShadowRadius: 18 }, estilo]}>{texto}</Animated.Text>
      <Text style={[estiloTexto, { color: "#FFFFFF", textShadowColor: base, textShadowRadius: 8 }]}>{texto}</Text>
    </View>
  );
}

function Letra({ letra, i, t, estiloTexto, modo, total }: { letra: string; i: number; t: SharedValue<number>; estiloTexto: StyleProp<TextStyle>; modo: "ondulante" | "deconstruccion"; total: number }) {
  // Desplazamiento fijo por letra para la deconstrucción (pseudoaleatorio, puro).
  const dx = ((i * 37) % 13) - 6;
  const dy = ((i * 53) % 15) - 7;
  const rot = ((i * 71) % 41) - 20;
  const estilo = useAnimatedStyle(() => {
    if (modo === "ondulante") {
      const fase = t.value * Math.PI * 2 - (i / Math.max(1, total)) * Math.PI * 2;
      return { transform: [{ translateY: Math.sin(fase) * 3.5 }] };
    }
    const k = Math.max(0, Math.sin(t.value * Math.PI));
    return { opacity: 1 - k * 0.25, transform: [{ translateX: dx * k }, { translateY: dy * k }, { rotate: `${rot * k}deg` }] };
  });
  return <Animated.Text style={[estiloTexto, estilo]}>{letra === " " ? " " : letra}</Animated.Text>;
}

function NombrePorLetras({ texto, estiloTexto, modo }: { texto: string; estiloTexto: StyleProp<TextStyle>; modo: "ondulante" | "deconstruccion" }) {
  const t = useSharedValue(0);
  const activa = useAnimacionActiva();
  useEffect(() => {
    if (!activa) {
      cancelAnimation(t);
      return;
    }
    if (modo === "ondulante") t.set(withRepeat(withTiming(1, { duration: 1600, easing: Easing.linear }), -1, false));
    else t.set(withRepeat(withSequence(withDelay(1600, withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) })), withTiming(0, { duration: 0 })), -1));
    return () => cancelAnimation(t);
  }, [modo, t, activa]);
  const letras = Array.from(texto);
  return (
    <View style={{ flexDirection: "row", flexWrap: "nowrap" }}>
      {letras.map((l, i) => (
        <Letra key={i} letra={l} i={i} t={t} estiloTexto={estiloTexto} modo={modo} total={letras.length} />
      ))}
    </View>
  );
}

function NombreGlitch({ texto, estiloTexto, base, intenso }: { texto: string; estiloTexto: StyleProp<TextStyle>; base: string; intenso: boolean }) {
  const g = useSharedValue(0);
  const activa = useAnimacionActiva();
  useEffect(() => {
    if (!activa) {
      cancelAnimation(g);
      return;
    }
    const quieto = withTiming(0, { duration: intenso ? 900 : 1900 });
    const salto = (v: number, d: number) => withTiming(v, { duration: d, easing: Easing.steps(1) });
    g.set(withRepeat(withSequence(quieto, salto(1, 70), salto(-1, 70), salto(0.6, 60), salto(-0.8, 50), salto(0, 40)), -1));
    return () => cancelAnimation(g);
  }, [g, intenso, activa]);
  const fuerza = intenso ? 4 : 2;
  const rojo = useAnimatedStyle(() => ({ opacity: Math.abs(g.value) > 0.01 ? 0.9 : 0, transform: [{ translateX: -fuerza * g.value }] }));
  const cian = useAnimatedStyle(() => ({ opacity: Math.abs(g.value) > 0.01 ? 0.9 : 0, transform: [{ translateX: fuerza * g.value }] }));
  const principal = useAnimatedStyle(() => ({ transform: [{ translateX: g.value }, { skewX: `${-6 * g.value * (intenso ? 1.5 : 1)}deg` }] }));
  return (
    <View>
      <Animated.Text style={[estiloTexto, { position: "absolute", color: "#FF2BD6" }, rojo]}>{texto}</Animated.Text>
      <Animated.Text style={[estiloTexto, { position: "absolute", color: "#2DE2FF" }, cian]}>{texto}</Animated.Text>
      <Animated.Text style={[estiloTexto, { color: base, textShadowColor: base, textShadowRadius: 10 }, principal]}>{texto}</Animated.Text>
    </View>
  );
}

const SIMBOLOS = "!<>-_\\/[]{}—=+*^?#01ABCDEFXYZ";

// Shuffle / decrypted: las letras se revuelven y se acomodan una por una, cada 2,6 s.
function NombreRevuelto({ texto, estiloTexto, base, modo }: { texto: string; estiloTexto: StyleProp<TextStyle>; base: string; modo: "shuffle" | "decrypted" }) {
  const [mostrado, setMostrado] = useState(texto);
  const activa = useAnimacionActiva();
  useEffect(() => {
    if (!activa) return;
    let paso = 0;
    let intervalo: ReturnType<typeof setInterval> | null = null;
    const letras = Array.from(texto);
    const ciclo = () => {
      paso = 0;
      intervalo = setInterval(() => {
        paso++;
        const fijas = Math.floor(paso / 2);
        setMostrado(
          letras
            .map((l, i) => {
              if (l === " " || i < fijas) return l;
              if (modo === "shuffle") return letras[(i + paso * 3) % letras.length];
              return SIMBOLOS[(i * 7 + paso * 13) % SIMBOLOS.length];
            })
            .join("")
        );
        if (fijas >= letras.length && intervalo) {
          clearInterval(intervalo);
          intervalo = null;
        }
      }, 45);
    };
    ciclo();
    const repetir = setInterval(ciclo, 2600);
    return () => {
      clearInterval(repetir);
      if (intervalo) clearInterval(intervalo);
    };
  }, [texto, modo, activa]);
  return <Text style={[estiloTexto, { color: base }, modo === "decrypted" ? { fontFamily: fuentes.mono } : null]}>{mostrado}</Text>;
}

export default function NombreEstilizado({ texto, fuente = "default", animacion = "ninguna", color, tam = 18, animar = false, estilo, lineas = 1, ligero = false }: Props) {
  const familia = FUENTE_FAMILIA[fuente] ?? fuentes.display;
  const base = color ?? colores.texto;
  const estiloTexto = useMemo<StyleProp<TextStyle>>(
    () => [{ fontFamily: familia, fontSize: tam, lineHeight: Math.round(tam * 1.25), color: base, includeFontPadding: false }, fuente === "impacto" || fuente === "urbana" ? { letterSpacing: 0.8 } : null, estilo],
    [familia, tam, base, fuente, estilo]
  );

  if (ligero && animacion !== "neon") {
    const lista = GRADIENTES[animacion];
    const tono = lista ? lista[Math.floor(lista.length / 2)] : animacion.startsWith("glitch") ? color ?? "#8F7BFF" : null;
    return (
      <Text style={[estiloTexto, tono ? { color: tono, textShadowColor: tono, textShadowRadius: 8 } : null]} numberOfLines={lineas}>
        {texto}
      </Text>
    );
  }

  switch (animacion) {
    case "arcoiris":
      return <NombreDegradado texto={texto} estiloTexto={estiloTexto} colores={GRADIENTES.arcoiris} duracion={2600} />;
    case "prisma":
      return <NombreDegradado texto={texto} estiloTexto={estiloTexto} colores={GRADIENTES.prisma} duracion={3000} />;
    case "brillo":
      return <NombreBrillo texto={texto} estiloTexto={estiloTexto} base={base} />;
    case "neon":
      return <NombreNeon texto={texto} estiloTexto={estiloTexto} base={color ?? "#B9A8FF"} />;
    case "ondulante":
      return <NombrePorLetras texto={texto} estiloTexto={estiloTexto} modo="ondulante" />;
    case "deconstruccion":
      return <NombrePorLetras texto={texto} estiloTexto={estiloTexto} modo="deconstruccion" />;
    case "glitch":
      return <NombreGlitch texto={texto} estiloTexto={estiloTexto} base={color ?? "#8F7BFF"} intenso={false} />;
    case "glitch_intenso":
      return <NombreGlitch texto={texto} estiloTexto={estiloTexto} base={color ?? "#8F7BFF"} intenso />;
    case "shuffle":
    case "decrypted":
      if (animar) return <NombreRevuelto texto={texto} estiloTexto={estiloTexto} base={base} modo={animacion} />;
      return (
        <Text style={estiloTexto} numberOfLines={lineas}>
          {texto}
        </Text>
      );
    default:
      return (
        <Text style={estiloTexto} numberOfLines={lineas}>
          {texto}
        </Text>
      );
  }
}
