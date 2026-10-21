import { useEffect, useMemo, useState } from "react";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { estadoCielo, faseDelDia } from "@/lib/ciudades/cicloDia";
import { useAnimacionActiva, useLiviano } from "~/lib/rendimiento";
import { conAlfa } from "~/tema";
import Ciudad from "./Ciudad";
import { ParticulasTema } from "./temas/CapaTemporada";

// Fondo de las pantallas de carga (pedido 2026-10-13: «el fondo negro se ve simple»):
// el cielo de la ciudad, la ciudad grande con sus ventanas que titilan y lo que pasa
// volando (aviones, pájaros, algún ovni, de Ciudad/Cielo), y abajo una carretera con
// farolas y las líneas del medio corriendo. Es opaco: tapa lo que haya detrás.
// 2026-10-21 («se corta muy feo»): antes el cielo de arriba era siempre de noche y la
// ciudad traía su propio cielo (de día, un rectángulo celeste). Ahora el cielo es UNO
// solo, de arriba abajo, con la hora real de esa ciudad; las estrellas se ven según
// cuánto es de noche y la ciudad va sin cielo propio, así no hay costura.

const ALTO_CARRETERA = 86;
const SEPARACION_LINEAS = 46;

// Estrellas siempre en el mismo lugar (generador con semilla fija).
function armarEstrellas(ancho: number, alto: number) {
  let s = 7;
  const azar = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: 46 }, () => ({ x: azar() * ancho, y: azar() * alto, r: 0.5 + azar() * 1.1, o: 0.25 + azar() * 0.6 }));
}

// El cielo entero (de arriba hasta la carretera) con sus estrellas, que se apagan de día.
function CieloCompleto({ ancho, alto, altoEstrellas, arriba, abajo, noche }: { ancho: number; alto: number; altoEstrellas: number; arriba: string; abajo: string; noche: number }) {
  const puntos = useMemo(() => armarEstrellas(ancho, altoEstrellas), [ancho, altoEstrellas]);
  const brillo = Math.max(0, (noche - 0.15) / 0.85);
  return (
    <Svg width={ancho} height={alto} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="cieloCarga" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={arriba} />
          <Stop offset="1" stopColor={abajo} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={ancho} height={alto} fill="url(#cieloCarga)" />
      {brillo > 0 &&
        puntos.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#FFFFFF" opacity={p.o * brillo} />
        ))}
    </Svg>
  );
}

function Carretera({ ancho, acento, activa }: { ancho: number; acento: string; activa: boolean }) {
  const avance = useSharedValue(0);
  useEffect(() => {
    if (!activa) {
      cancelAnimation(avance);
      return;
    }
    avance.set(0);
    avance.set(withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1));
    return () => cancelAnimation(avance);
  }, [activa, avance]);
  const estiloLineas = useAnimatedStyle(() => ({ transform: [{ translateX: -avance.value * SEPARACION_LINEAS }] }));
  const lineas = Math.ceil(ancho / SEPARACION_LINEAS) + 2;
  const farolas = Math.max(3, Math.round(ancho / 110));
  return (
    <View style={[styles.carretera, { width: ancho }]} pointerEvents="none">
      <Svg width={ancho} height={ALTO_CARRETERA} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="asfalto" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#11142A" />
            <Stop offset="1" stopColor="#080A16" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={ancho} height={ALTO_CARRETERA} fill="url(#asfalto)" />
        <Rect x={0} y={0} width={ancho} height={10} fill="#1A1E38" />
        <Rect x={0} y={10} width={ancho} height={1.5} fill={conAlfa(acento, 0.55)} />
        <Rect x={0} y={ALTO_CARRETERA - 12} width={ancho} height={12} fill="#1A1E38" />
        {Array.from({ length: farolas }, (_, i) => {
          const x = ((i + 0.5) * ancho) / farolas;
          return <Circle key={i} cx={x} cy={11} r={26} fill="#FFD27A" opacity={0.07} />;
        })}
      </Svg>
      {Array.from({ length: farolas }, (_, i) => (
        <View key={i} style={[styles.farola, { left: ((i + 0.5) * ancho) / farolas - 1 }]}>
          <View style={styles.farolaLuz} />
        </View>
      ))}
      <Animated.View style={[styles.lineas, estiloLineas]}>
        {Array.from({ length: lineas }, (_, i) => (
          <View key={i} style={[styles.linea, { left: i * SEPARACION_LINEAS }]} />
        ))}
      </Animated.View>
    </View>
  );
}

export default function FondoCiudad({ semilla = "prodigia", acento }: { semilla?: string; acento: string }) {
  const [tam, setTam] = useState({ ancho: 0, alto: 0 });
  const activa = useAnimacionActiva();
  const liviano = useLiviano();
  const altoCiudad = Math.round(Math.min(320, tam.alto * 0.36));
  // Con la hora real de la ciudad (cambia despacio: basta con calcularla al abrir).
  const [cielo] = useState(() => estadoCielo(faseDelDia(semilla, Date.now())));
  return (
    <View
      style={[StyleSheet.absoluteFill, styles.base]}
      pointerEvents="none"
      onLayout={(e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        if (Math.round(width) !== tam.ancho || Math.round(height) !== tam.alto) setTam({ ancho: Math.round(width), alto: Math.round(height) });
      }}
    >
      {tam.ancho > 0 && (
        <>
          <CieloCompleto ancho={tam.ancho} alto={tam.alto - ALTO_CARRETERA + 2} altoEstrellas={tam.alto - altoCiudad - ALTO_CARRETERA} arriba={cielo.arriba} abajo={cielo.abajo} noche={cielo.noche} />
          <View style={[styles.halo, { backgroundColor: conAlfa(acento, 0.06 + 0.1 * cielo.noche), boxShadow: `0px 0px 120px ${conAlfa(acento, 0.1 + 0.25 * cielo.noche)}` }]} />
          <View style={{ position: "absolute", left: 0, right: 0, bottom: ALTO_CARRETERA }}>
            <Ciudad semilla={semilla} acento={acento} alto={altoCiudad} radio={0} densidad={liviano ? 1 : 1.25} sinLuna sinCielo />
          </View>
          <View style={{ position: "absolute", left: 0, bottom: 0 }}>
            <Carretera ancho={tam.ancho} acento={acento} activa={activa} />
          </View>
          {/* En las festividades, sus partículas también en la carga del final. */}
          <ParticulasTema z={1} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: "#06080F", overflow: "hidden" },
  halo: { position: "absolute", width: 360, height: 360, borderRadius: 180, alignSelf: "center", top: "18%", opacity: 0.8 },
  carretera: { height: ALTO_CARRETERA, overflow: "hidden" },
  farola: { position: "absolute", top: -18, width: 2, height: 28, backgroundColor: "#3A4060" },
  farolaLuz: { position: "absolute", top: -3, left: -3, width: 8, height: 4, borderRadius: 2, backgroundColor: "#FFD27A" },
  lineas: { position: "absolute", left: 0, top: ALTO_CARRETERA / 2 - 2, height: 4, width: "200%" },
  linea: { position: "absolute", width: 22, height: 4, borderRadius: 2, backgroundColor: "#F2C14E", opacity: 0.85 },
});
