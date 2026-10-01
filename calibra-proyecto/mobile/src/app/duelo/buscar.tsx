import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { cancelarBusqueda, pasoBusqueda } from "~/lib/competir";
import { sonar, vibrar } from "~/lib/efectos";
import { useJugador } from "~/lib/jugador";
import { useSesion } from "~/lib/sesion";
import Boton3D from "~/ui/Boton3D";
import Glifos from "~/ui/Glifos";
import AvatarMarco from "~/ui/placa/AvatarMarco";
import Texto from "~/ui/Texto";
import { color, conAlfa, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";

const POLL_MS = 2200;
const MAX_SEGUNDOS = 60;

function Onda({ demora, c }: { demora: number; c: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(demora, withRepeat(withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }), -1)));
  }, [t, demora]);
  const estilo = useAnimatedStyle(() => ({ opacity: 0.6 * (1 - t.value), transform: [{ scale: 0.4 + t.value * 1.6 }] }));
  return <Animated.View style={[styles.onda, { borderColor: c }, estilo]} />;
}

// Matchmaking: radar que late mientras se busca rival de tu rango (mismo bucle que
// RankedsClient.tsx de la web, con el mismo tope de 60 s).
export default function BuscarDuelo() {
  const router = useRouter();
  const { mundo, ranked } = useLocalSearchParams<{ mundo: string; ranked: string }>();
  const esRanked = ranked !== "0";
  const { sesion } = useSesion();
  const { placa } = useJugador();
  const [segundos, setSegundos] = useState(0);
  const [rango, setRango] = useState(30);
  const [sinRivales, setSinRivales] = useState(false);
  const cancelado = useRef(false);
  const m = mundo && mundo !== "aleatorio" ? MUNDO_POR_SLUG[mundo as MundoSlug] : null;
  const acento = m?.neon ?? color.logro;

  const giro = useSharedValue(0);
  useEffect(() => {
    giro.set(withRepeat(withTiming(1, { duration: 2200, easing: Easing.linear }), -1));
  }, [giro]);
  const estiloBarrido = useAnimatedStyle(() => ({ transform: [{ rotate: `${giro.value * 360}deg` }] }));

  useEffect(() => {
    if (!sesion || !mundo) return;
    cancelado.current = false;
    const inicio = new Date().toISOString();
    (async () => {
      while (!cancelado.current) {
        try {
          const p = await pasoBusqueda(sesion.user.id, mundo, esRanked, inicio);
          if (cancelado.current) return;
          if (p.encontrado && p.duelId) {
            sonar("swoosh");
            vibrar.fuerte();
            router.replace({ pathname: "/duelo/[id]", params: { id: p.duelId } });
            return;
          }
          setSegundos(p.segundos);
          setRango(p.rango);
          if (p.segundos >= MAX_SEGUNDOS) {
            await cancelarBusqueda();
            setSinRivales(true);
            return;
          }
        } catch {
          setSinRivales(true);
          return;
        }
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    })();
    return () => {
      cancelado.current = true;
      cancelarBusqueda();
    };
  }, [sesion, mundo, esRanked, router]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      cancelado.current = true;
      cancelarBusqueda();
      return false;
    });
    return () => sub.remove();
  }, []);

  const elo = placa?.elo ?? 1000;

  return (
    <SafeAreaView style={styles.pantalla}>
      <Glifos glifos={m?.glifos ?? ["⚔", "✦", "?"]} acento={acento} cantidad={10} />
      <View style={{ alignItems: "center", gap: 4, marginTop: 20 }}>
        <Texto v="micro" c={acento}>
          {esRanked ? "Rankeds" : "Duelo casual"} · {m?.nombre ?? "Todas las ciudades"}
        </Texto>
        <Texto v="h1">{sinRivales ? "No hay rivales ahora" : "Buscando rival…"}</Texto>
      </View>

      <View style={styles.radar}>
        {!sinRivales && [0, 800, 1600].map((d) => <Onda key={d} demora={d} c={acento} />)}
        {!sinRivales && (
          <Animated.View style={[styles.barrido, estiloBarrido]}>
            <View style={[styles.haz, { backgroundColor: conAlfa(acento, 0.35), boxShadow: `0px 0px 30px ${acento}` }]} />
          </Animated.View>
        )}
        <View style={[styles.centro, { borderColor: acento, boxShadow: `0px 0px 30px ${conAlfa(acento, 0.5)}` }]}>
          {placa && <AvatarMarco url={placa.avatarUrl} nombre={placa.nombre} marco={placa.marco} tam={86} />}
        </View>
      </View>

      <View style={{ alignItems: "center", gap: 6, paddingHorizontal: 24 }}>
        {sinRivales ? (
          <Texto v="nota" centro>
            Nadie de tu rango está buscando en este momento. Prueba otra ciudad o vuelve en un rato.
          </Texto>
        ) : (
          <>
            <Texto v="mono" tam={28}>
              0:{String(segundos).padStart(2, "0")}
            </Texto>
            <Texto v="nota" centro>
              {esRanked ? `Buscando entre ${elo - rango} y ${elo + rango} de ELO.` : "Buscando a cualquier jugador, de cualquier rango."} Si no aparece nadie, juegas contra el registro de un rival: siempre hay contra quién.
            </Texto>
          </>
        )}
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 16, gap: 8 }}>
        {sinRivales && <Boton3D titulo="Buscar de nuevo" acento={m?.base} onPress={() => router.replace({ pathname: "/duelo/buscar", params: { mundo, ranked } })} />}
        <Boton3D
          titulo={sinRivales ? "Volver" : "Cancelar"}
          variante="secundario"
          onPress={() => {
            cancelado.current = true;
            cancelarBusqueda();
            router.back();
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bgHondo, justifyContent: "space-between" },
  radar: { height: 300, alignItems: "center", justifyContent: "center" },
  onda: { position: "absolute", width: 200, height: 200, borderRadius: 100, borderWidth: 2 },
  barrido: { position: "absolute", width: 260, height: 260, alignItems: "center" },
  haz: { width: 4, height: 130, borderRadius: 2 },
  centro: { width: 104, height: 104, borderRadius: 52, borderWidth: 3, alignItems: "center", justifyContent: "center", backgroundColor: color.surface1 },
});
