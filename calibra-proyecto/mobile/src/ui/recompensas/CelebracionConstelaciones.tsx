import { useSegments } from "expo-router";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { leerPrimeraVezActiva, suscribirPrimeraVez } from "~/lib/bienvenida";
import { COLOR_RAREZA, NOMBRE_RAREZA, type Rareza } from "@/lib/recompensas/catalogo";
import { constelacionesPorVer, marcarConstelacionesVistas, NOMBRE_FUGAZ, type ConstelacionCompletada } from "@/lib/recompensas/constelaciones";
import { sonar, vibrar } from "~/lib/efectos";
import { recargarJugador } from "~/lib/jugador";
import { leerAvisoConstelaciones, limpiarAvisoConstelaciones, recargarCosmeticos, suscribirAvisoConstelaciones } from "~/lib/recompensas";
import { supabase } from "~/lib/supabase";
import { color, conAlfa, mundoDe } from "~/tema";
import Boton3D from "../Boton3D";
import { IconoChispa } from "../Iconos";
import Texto from "../Texto";
import Constelacion from "./Constelacion";

// Cuando se completa una constelación (0259), se celebra una vez: las 7 estrellas
// se encienden, las líneas se dibujan solas y aparece el premio. Se muestra al
// volver a las pestañas o a Recompensas (nunca en medio de una partida).
const { width: ANCHO } = Dimensions.get("window");
const LUGARES = new Set(["(tabs)", "recompensas"]);

function Fugaz() {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(2600, withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }));
  }, [p]);
  const estilo = useAnimatedStyle(() => ({
    opacity: p.value > 0 && p.value < 1 ? 1 - p.value * 0.6 : 0,
    transform: [{ translateX: -40 + p.value * (ANCHO + 80) }, { translateY: p.value * 160 }, { rotate: "25deg" }],
  }));
  return <Animated.View style={[styles.fugaz, estilo]} />;
}

function Una({ c, onSeguir, ultima }: { c: ConstelacionCompletada; onSeguir: () => void; ultima: boolean }) {
  const encendido = useSharedValue(0);
  const trazo = useSharedValue(0);
  const [listo, setListo] = useState(false);
  const m = mundoDe(c.mundo);

  useEffect(() => {
    encendido.value = withTiming(7, { duration: 1400, easing: Easing.linear });
    trazo.value = withDelay(1400, withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }));
    const t = [0, 1, 2, 3, 4, 5, 6].map((i) => setTimeout(() => sonar("tecla"), i * 200));
    const fin = setTimeout(() => {
      sonar("recompensa");
      vibrar.exito();
      setListo(true);
    }, 2600);
    return () => {
      t.forEach(clearTimeout);
      clearTimeout(fin);
    };
  }, [encendido, trazo]);

  const p = c.premio;
  return (
    <View style={styles.contenido}>
      <Texto v="micro" c={m?.neon ?? color.primarioClaro} centro>
        CONSTELACIÓN DE {(m?.nombre ?? c.mundo).toUpperCase()} · Nº {c.numero}
      </Texto>
      <View style={{ alignItems: "center" }}>
        <Constelacion mundo={c.mundo} estrellas={7} tam={Math.min(280, ANCHO - 80)} encendido={encendido} trazo={trazo} radio={28} />
      </View>
      {p.fugaz && <Fugaz />}
      {listo && (
        <Animated.View entering={FadeInDown.duration(380)} style={{ gap: 12 }}>
          <Texto v="h1" centro>
            ¡Se dibujó en el cielo!
          </Texto>
          <View style={styles.premios}>
            <View style={styles.fila}>
              <IconoChispa tam={20} />
              <Texto v="fuerte">{p.chispas} Chispas</Texto>
            </View>
            {p.pieza && (
              <View style={styles.fila}>
                <Texto tam={18}>🧩</Texto>
                <Texto v="fuerte" style={{ flex: 1 }}>
                  {p.pieza.nombre} <Texto v="nota" c={COLOR_RAREZA[p.pieza.rareza as Rareza]}>· {NOMBRE_RAREZA[p.pieza.rareza as Rareza] ?? ""}</Texto>
                </Texto>
              </View>
            )}
            {p.fugaz && (
              <View style={styles.fila}>
                <Texto tam={18}>🌠</Texto>
                <Texto v="fuerte" c={color.logro}>
                  Estrella fugaz: {NOMBRE_FUGAZ[p.fugaz.premio] ?? "premio extra"}
                </Texto>
              </View>
            )}
            {(c.de_noche || c.alineacion) && (
              <Texto v="nota" c={color.primarioClaro}>
                {c.alineacion ? "Gran Alineación: premio doble." : ""} {c.de_noche ? "Era de noche en la ciudad: +20 %." : ""}
              </Texto>
            )}
          </View>
          <Boton3D titulo={ultima ? "¡Genial!" : "Siguiente"} variante="logro" brillo onPress={onSeguir} />
        </Animated.View>
      )}
    </View>
  );
}

export default function CelebracionConstelaciones() {
  const segmentos = useSegments();
  const aviso = useSyncExternalStore(suscribirAvisoConstelaciones, leerAvisoConstelaciones);
  const primeraVez = useSyncExternalStore(suscribirPrimeraVez, leerPrimeraVezActiva);
  const [lista, setLista] = useState<ConstelacionCompletada[]>([]);
  const [i, setI] = useState(0);
  const permitido = LUGARES.has(segmentos[0] ?? "") && !primeraVez;

  useEffect(() => {
    if (!aviso || !permitido || lista.length > 0) return;
    limpiarAvisoConstelaciones();
    constelacionesPorVer(supabase).then((l) => {
      if (l.length > 0) {
        setI(0);
        setLista(l);
      }
    });
  }, [aviso, permitido, lista.length]);

  if (lista.length === 0 || !permitido) return null;
  const actual = lista[i];

  async function seguir() {
    if (i < lista.length - 1) {
      setI(i + 1);
      return;
    }
    setLista([]);
    await marcarConstelacionesVistas(supabase);
    recargarJugador();
    const { data } = await supabase.auth.getSession();
    if (data.session) recargarCosmeticos(data.session.user.id);
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.fondo}>
      <Una key={actual.id} c={actual} onSeguir={seguir} ultima={i === lista.length - 1} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fondo: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: conAlfa(color.bgHondo, 0.97), zIndex: 125, elevation: 125, justifyContent: "center", padding: 24 },
  contenido: { gap: 18 },
  premios: { gap: 10, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: conAlfa(color.logro, 0.4), backgroundColor: conAlfa(color.logro, 0.08) },
  fila: { flexDirection: "row", alignItems: "center", gap: 10 },
  fugaz: { position: "absolute", top: 60, left: 0, width: 90, height: 3, borderRadius: 2, backgroundColor: "#FFFFFF", boxShadow: `0px 0px 12px ${color.logro}` },
});
