import { memo, useEffect, useMemo, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { useAnimacionActiva, useLiviano } from "~/lib/rendimiento";
import { aclarar, conAlfa } from "~/tema";
import { alineacionEnCurso, estadoCielo, faseDelDia } from "@/lib/ciudades/cicloDia";
import Cielo from "./Cielo";

// "Cada mundo es una ciudad que se enciende de noche" (02-SISTEMA-VISUAL.md §1): el
// skyline se arma con una semilla (siempre el mismo para cada mundo), con ventanas
// encendidas en el neón del mundo y luna con halo. El dibujo es ESTÁTICO (un solo
// SVG que no se vuelve a pintar); lo que se mueve va encima en vistas aparte, en el
// hilo nativo: ventanas que se prenden y apagan y, de vez en cuando, algo que
// cruza el cielo (Cielo.tsx: avión, pájaros, ovni o el paquete de doble experiencia).
// Apagada = mundo bloqueado: en gris, sin luces ni movimiento.
//
// Día y noche (2026-10-06): cada ciudad tiene su propio largo de día
// (lib/ciudades/cicloDia.ts), así que el cielo, el sol o la luna y cuántas ventanas
// se ven encendidas dependen de la hora de ESA ciudad. Cada 28 días las 13 amanecen
// juntas («La Gran Alineación») y el sol sale dorado con un anillo.

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

interface Ventana {
  x: number;
  y: number;
  on: boolean;
  blanca: boolean;
}

interface Edificio {
  x: number;
  w: number;
  h: number;
  ventanas: Ventana[];
}

function armarSkyline(semilla: string, ancho: number, alto: number, densidad: number): Edificio[] {
  const r = rng(semilla);
  const edificios: Edificio[] = [];
  let x = 4 + r() * 6;
  while (x < ancho - 10) {
    const w = 18 + Math.round(r() * 26);
    const h = Math.round(alto * (0.32 + r() * 0.58 * densidad));
    const ventanas: Ventana[] = [];
    for (let vy = alto - h + 6; vy < alto - 4; vy += 8) {
      for (let vx = x + 4; vx < x + w - 4; vx += 6) ventanas.push({ x: vx, y: vy, on: r() < 0.55, blanca: r() < 0.18 });
    }
    edificios.push({ x, w, h, ventanas });
    x += w + 3 + Math.round(r() * 4);
  }
  return edificios;
}

// Un grupo de ventanas que se prenden y se apagan juntas. Antes cada ventana era
// una animación aparte (10 por ciudad × 13 ciudades): en teléfonos de gama baja eso
// trababa la pantalla. Ahora son 3 grupos por ciudad, cada uno con su ritmo.
function GrupoVentanas({ ventanas, periodo, demora, activa }: { ventanas: { x: number; y: number; c: string }[]; periodo: number; demora: number; activa: boolean }) {
  const op = useSharedValue(1);
  useEffect(() => {
    if (!activa) {
      cancelAnimation(op);
      return;
    }
    op.set(
      withDelay(
        demora,
        withRepeat(withSequence(withTiming(1, { duration: periodo }), withTiming(0.05, { duration: 160 }), withTiming(0.05, { duration: periodo * 0.5 }), withTiming(1, { duration: 200 })), -1)
      )
    );
    return () => cancelAnimation(op);
  }, [activa, op, periodo, demora]);
  const estilo = useAnimatedStyle(() => ({ opacity: op.value }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, estilo]} pointerEvents="none">
      {ventanas.map((v, i) => (
        <View key={i} style={[styles.ventana, { left: v.x, top: v.y, backgroundColor: v.c }]} />
      ))}
    </Animated.View>
  );
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
  // Lista larga: menos cosas moviéndose.
  quieta?: boolean;
  sinAvion?: boolean;
}

function CiudadBase({ semilla, acento, alto = 96, apagada, radio = 14, densidad = 1, estilo, sinLuna, quieta, sinAvion }: Props) {
  const [ancho, setAncho] = useState(0);
  const activa = useAnimacionActiva();
  const liviano = useLiviano();
  // La hora avanza despacio (el día más corto dura 12 h): con refrescar cada minuto alcanza.
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    if (!activa || apagada) return;
    const id = setInterval(() => setAhora(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [activa, apagada]);
  const cielo = apagada ? null : estadoCielo(faseDelDia(semilla, ahora));
  const alineacion = !apagada && alineacionEnCurso(ahora) !== null;
  const noche = cielo ? cielo.noche : 1;
  const edificios = useMemo(() => (ancho > 0 ? armarSkyline(semilla, ancho, alto, densidad) : []), [semilla, ancho, alto, densidad]);
  const luz = apagada ? "#39405A" : aclarar(acento, 0.15);
  const ventanasDelDibujo = useMemo(() => {
    let comunes = "";
    let blancas = "";
    for (const e of edificios) {
      for (const v of e.ventanas) {
        if (!v.on) continue;
        const r = `M${v.x} ${v.y}h2.4v3h-2.4z`;
        if (v.blanca && !apagada) blancas += r;
        else comunes += r;
      }
    }
    return { comunes, blancas };
  }, [edificios, apagada]);

  // Ventanas que parpadean: unas pocas de las encendidas, repartidas en 3 grupos.
  const grupos = useMemo(() => {
    if (apagada) return [];
    const r = rng(semilla + "v");
    const encendidas = edificios.flatMap((e) => e.ventanas.filter((v) => v.on));
    const cuantas = Math.min(quieta ? 3 : liviano ? 6 : 12, encendidas.length);
    const n = quieta ? 1 : 3;
    const lista = Array.from({ length: n }, (_, g) => ({ periodo: 2200 + Math.round(r() * 3800), demora: g * 900 + Math.round(r() * 1500), ventanas: [] as { x: number; y: number; c: string }[] }));
    for (let k = 0; k < cuantas; k++) {
      const v = encendidas[Math.floor(r() * encendidas.length)];
      lista[k % n].ventanas.push({ x: v.x, y: v.y, c: v.blanca ? "#FFF3D6" : luz });
    }
    return lista.filter((g) => g.ventanas.length > 0);
  }, [edificios, apagada, quieta, liviano, semilla, luz]);
  const conAvion = !apagada && !quieta && !sinAvion && alto >= 80;
  const id = `c${semilla.replace(/[^a-z0-9]/gi, "")}${apagada ? "o" : ""}`;

  return (
    <View onLayout={(e: LayoutChangeEvent) => { const w = Math.round(e.nativeEvent.layout.width); if (w > 0 && w !== ancho) setAncho(w); }} style={[{ height: alto, borderRadius: radio, overflow: "hidden", backgroundColor: "#070913" }, estilo]}>
      {ancho > 0 && (
        <>
          <Svg width={ancho} height={alto}>
            <Defs>
              <LinearGradient id={`${id}cielo`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={cielo ? cielo.arriba : "#0B0D16"} />
                <Stop offset="1" stopColor={cielo ? cielo.abajo : "#070913"} />
              </LinearGradient>
              <RadialGradient id={`${id}halo`} cx="70%" cy="0%" rx="80%" ry="90%">
                <Stop offset="0" stopColor={apagada ? "#30344A" : acento} stopOpacity={apagada ? 0.25 : 0.12 + 0.3 * noche} />
                <Stop offset="1" stopColor={acento} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id={`${id}luna`} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#F7F2E0" stopOpacity={apagada ? 0.15 : 0.5} />
                <Stop offset="1" stopColor="#F7F2E0" stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id={`${id}sol`} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={alineacion ? "#FFD15C" : "#FFE6A3"} stopOpacity={0.75} />
                <Stop offset="1" stopColor="#FFB347" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect x={0} y={0} width={ancho} height={alto} fill={`url(#${id}cielo)`} />
            <Rect x={0} y={0} width={ancho} height={alto} fill={`url(#${id}halo)`} />
            {!sinLuna && apagada && (
              <G>
                <Circle cx={ancho - 30} cy={20} r={20} fill={`url(#${id}luna)`} />
                <Circle cx={ancho - 30} cy={20} r={8} fill="#5A5F70" />
              </G>
            )}
            {!sinLuna && cielo?.luna && (
              <G>
                <Circle cx={cielo.luna.x * ancho} cy={cielo.luna.y * alto} r={20} fill={`url(#${id}luna)`} />
                <Circle cx={cielo.luna.x * ancho} cy={cielo.luna.y * alto} r={8} fill="#F7F2E0" />
              </G>
            )}
            {!sinLuna && cielo?.sol && (
              <G>
                <Circle cx={cielo.sol.x * ancho} cy={cielo.sol.y * alto} r={alineacion ? 30 : 24} fill={`url(#${id}sol)`} />
                <Circle cx={cielo.sol.x * ancho} cy={cielo.sol.y * alto} r={9} fill={alineacion ? "#FFD15C" : "#FFF1C4"} />
                {alineacion && <Circle cx={cielo.sol.x * ancho} cy={cielo.sol.y * alto} r={15} fill="none" stroke="#FFD15C" strokeWidth={1.5} opacity={0.8} />}
              </G>
            )}
            {edificios.map((e, i) => (
              <Rect key={i} x={e.x} y={alto - e.h} width={e.w} height={e.h + 2} rx={2} fill={apagada ? "#0A0C14" : "#0A0E1D"} />
            ))}
            {/* Todas las ventanas de un mismo color en UN solo trazo (antes eran cientos de
                rectángulos sueltos por ciudad, cada uno una vista nativa). */}
            {ventanasDelDibujo.comunes ? <Path d={ventanasDelDibujo.comunes} fill={apagada ? "#2A2F42" : luz} opacity={apagada ? 0.8 : 0.15 + 0.75 * noche} /> : null}
            {ventanasDelDibujo.blancas ? <Path d={ventanasDelDibujo.blancas} fill="#FFF3D6" opacity={0.15 + 0.75 * noche} /> : null}
            {!apagada && <Rect x={0} y={alto - 1.5} width={ancho} height={1.5} fill={conAlfa(acento, 0.5)} />}
          </Svg>
          {/* De día casi no se ven luces encendidas: las que parpadean, solo de noche. */}
          {noche > 0.35 && (
            <View style={[StyleSheet.absoluteFill, { opacity: noche }]} pointerEvents="none">
              {grupos.map((g, i) => (
                <GrupoVentanas key={i} ventanas={g.ventanas} periodo={g.periodo} demora={g.demora} activa={activa} />
              ))}
            </View>
          )}
          {conAvion && <Cielo semilla={semilla} ancho={ancho} alto={alto} activa={activa} liviano={liviano} />}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ventana: { position: "absolute", width: 2.4, height: 3, borderRadius: 0.6 },
});

// Sin volver a calcular ni redibujar el skyline si no cambió nada (la lista de Mundos
// y los hubs vuelven a pintarse seguido).
const Ciudad = memo(CiudadBase);
export default Ciudad;
