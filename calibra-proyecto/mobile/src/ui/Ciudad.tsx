import { useEffect, useMemo, useState } from "react";
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, G, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";
import { aclarar, conAlfa } from "~/tema";

// "Cada mundo es una ciudad que se enciende de noche" (02-SISTEMA-VISUAL.md §1): el
// skyline se arma con una semilla (siempre el mismo para cada mundo), con ventanas
// encendidas en el neón del mundo, luna con halo y algunas ventanas que titilan.
// Apagada = mundo bloqueado: la ciudad en gris, sin luces.

const RectAnimado = Animated.createAnimatedComponent(Rect);

function rng(semilla: string) {
  let h = 2166136261;
  for (let i = 0; i < semilla.length; i++) h = Math.imul(h ^ semilla.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Edificio {
  x: number;
  w: number;
  h: number;
  ventanas: { x: number; y: number; on: boolean; blanca: boolean }[];
}

function armarSkyline(semilla: string, ancho: number, alto: number, densidad: number): Edificio[] {
  const r = rng(semilla);
  const edificios: Edificio[] = [];
  let x = 4 + r() * 6;
  while (x < ancho - 10) {
    const w = 18 + Math.round(r() * 26);
    const h = Math.round(alto * (0.32 + r() * 0.58 * densidad));
    const ventanas: Edificio["ventanas"] = [];
    for (let vy = alto - h + 6; vy < alto - 4; vy += 8) {
      for (let vx = x + 4; vx < x + w - 4; vx += 6) {
        const on = r() < 0.55;
        ventanas.push({ x: vx, y: vy, on, blanca: r() < 0.18 });
      }
    }
    edificios.push({ x, w, h, ventanas });
    x += w + 3 + Math.round(r() * 4);
  }
  return edificios;
}

function VentanaTitila({ x, y, c, demora }: { x: number; y: number; c: string; demora: number }) {
  const op = useSharedValue(0.15);
  useEffect(() => {
    op.set(withDelay(demora, withRepeat(withSequence(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), withTiming(0.15, { duration: 1300 })), -1, true)));
  }, [op, demora]);
  const props = useAnimatedProps(() => ({ opacity: op.value }));
  return <RectAnimado x={x} y={y} width={2.4} height={3} rx={0.6} fill={c} animatedProps={props} />;
}

interface Props {
  semilla: string;
  acento: string;
  alto?: number;
  apagada?: boolean;
  radio?: number;
  densidad?: number;
  estilo?: StyleProp<ViewStyle>;
  sinLuna?: boolean;
  // Menos detalle (listas largas): sin ventanas que titilan.
  quieta?: boolean;
}

export default function Ciudad({ semilla, acento, alto = 96, apagada, radio = 14, densidad = 1, estilo, sinLuna, quieta }: Props) {
  const [ancho, setAncho] = useState(0);
  const edificios = useMemo(() => (ancho > 0 ? armarSkyline(semilla, ancho, alto, densidad) : []), [semilla, ancho, alto, densidad]);
  const titilan = useMemo(() => {
    if (apagada || quieta) return [];
    const r = rng(semilla + "t");
    const todas = edificios.flatMap((e) => e.ventanas.filter((v) => v.on));
    return Array.from({ length: Math.min(7, todas.length) }, (_, i) => ({ ...todas[Math.floor(r() * todas.length)], demora: i * 430 }));
  }, [edificios, apagada, quieta, semilla]);

  const luz = apagada ? "#39405A" : aclarar(acento, 0.15);
  const id = `c${semilla.replace(/[^a-z0-9]/gi, "")}${apagada ? "o" : ""}`;

  return (
    <View onLayout={(e: LayoutChangeEvent) => setAncho(e.nativeEvent.layout.width)} style={[{ height: alto, borderRadius: radio, overflow: "hidden", backgroundColor: "#070913" }, estilo]}>
      {ancho > 0 && (
        <Svg width={ancho} height={alto}>
          <Defs>
            <LinearGradient id={`${id}cielo`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={apagada ? "#0B0D16" : "#0C1024"} />
              <Stop offset="1" stopColor="#070913" />
            </LinearGradient>
            <RadialGradient id={`${id}halo`} cx="70%" cy="0%" rx="80%" ry="90%">
              <Stop offset="0" stopColor={apagada ? "#30344A" : acento} stopOpacity={apagada ? 0.25 : 0.42} />
              <Stop offset="1" stopColor={acento} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id={`${id}luna`} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#F7F2E0" stopOpacity={apagada ? 0.15 : 0.5} />
              <Stop offset="1" stopColor="#F7F2E0" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={ancho} height={alto} fill={`url(#${id}cielo)`} />
          <Rect x={0} y={0} width={ancho} height={alto} fill={`url(#${id}halo)`} />
          {!sinLuna && (
            <G>
              <Circle cx={ancho - 30} cy={20} r={20} fill={`url(#${id}luna)`} />
              <Circle cx={ancho - 30} cy={20} r={8} fill={apagada ? "#5A5F70" : "#F7F2E0"} />
            </G>
          )}
          {edificios.map((e, i) => (
            <G key={i}>
              <Rect x={e.x} y={alto - e.h} width={e.w} height={e.h + 2} rx={2} fill={apagada ? "#0A0C14" : "#0A0E1D"} />
              {e.ventanas.map((v, j) =>
                v.on ? (
                  <Rect
                    key={j}
                    x={v.x}
                    y={v.y}
                    width={2.4}
                    height={3}
                    rx={0.6}
                    fill={apagada ? "#2A2F42" : v.blanca ? "#FFF3D6" : luz}
                    opacity={apagada ? 0.8 : v.blanca ? 0.85 : 0.9}
                  />
                ) : null
              )}
            </G>
          ))}
          {titilan.map((v, i) => (
            <VentanaTitila key={i} x={v.x} y={v.y} c="#FFFFFF" demora={v.demora} />
          ))}
          {!apagada && <Rect x={0} y={alto - 1.5} width={ancho} height={1.5} fill={conAlfa(acento, 0.5)} />}
        </Svg>
      )}
    </View>
  );
}
