import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, BackHandler, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { MUNDOS_DUELO_APP, obtenerDuelo, rendirseDuelo, type InfoDuelo } from "~/lib/competir";
import { useArranqueSincronizado } from "~/lib/duelos";
import { sonar, vibrar } from "~/lib/efectos";
import { URL_WEB } from "~/lib/entorno";
import { useJugador } from "~/lib/jugador";
import { cargarPlacaPublica, placaBasica, type PlacaDatos } from "~/lib/placa";
import { useSesion } from "~/lib/sesion";
import { mensajeError } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import Glifos from "~/ui/Glifos";
import { PlacaVS } from "~/ui/placa/Placa";
import Texto from "~/ui/Texto";
import { color, fuente, MUNDO_POR_SLUG } from "~/tema";

const OPERACION: Record<string, string> = { suma: "Suma", resta: "Resta", multiplicacion: "Multiplicación", division: "División" };
const CONTINENTE: Record<string, string> = { america: "América", europa: "Europa", africa: "África", asia_oceania: "Asia y Oceanía" };

function NumeroCuenta({ n }: { n: number }) {
  return (
    <Animated.View key={n} entering={ZoomIn.duration(320)} style={{ alignItems: "center" }}>
      <Texto style={{ fontFamily: fuente.mono, fontSize: 84, lineHeight: 96, color: n === 0 ? color.logro : color.texto, textShadowColor: color.primario, textShadowRadius: 24 }}>
        {n === 0 ? "¡YA!" : n}
      </Texto>
    </Animated.View>
  );
}

// Pantalla VS (02-SISTEMA-VISUAL.md §7.2): las dos Placas entran desde los lados,
// chocan en el centro, destello, y la cuenta 3-2-1 sincronizada con el rival.
export default function Duelo() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const { sesion } = useSesion();
  const miId = sesion?.user.id ?? null;
  const { placa: miPlaca } = useJugador();
  const [info, setInfo] = useState<InfoDuelo | null>(null);
  const [rival, setRival] = useState<PlacaDatos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ultimaCuenta = useRef<number | null>(null);

  useEffect(() => {
    if (!id || !miId) return;
    obtenerDuelo(id, miId).then(async (d) => {
      if (!d) {
        setError("No encontramos este duelo.");
        return;
      }
      setInfo(d);
      const p = d.rivalEsBot ? null : await cargarPlacaPublica(d.rivalId);
      setRival(p ?? placaBasica(d.rivalId, d.rivalNombre, { elo: d.rivalElo, titulo: d.rivalTitulo }));
    });
  }, [id, miId]);

  const enApp = !!info && (MUNDOS_DUELO_APP as string[]).includes(info.mundo);
  const listo = !!info && info.estado === "pendiente" && enApp && !!rival;

  const empezar = useCallback(() => {
    if (!info) return;
    sonar("ya");
    vibrar.fuerte();
    router.replace({ pathname: info.mundo === "geografia" ? "/geografia/sprint" : "/numeria/sprint", params: { duelo: info.duelId } });
  }, [info, router]);

  const { estado, segundos, rivalPresente, empezarAhora } = useArranqueSincronizado({
    duelId: listo ? info!.duelId : null,
    miUserId: miId,
    rivalId: info?.rivalId ?? null,
    sinEspera: !!info && (info.rivalEsBot || info.rivalYaJugo),
    onEmpezar: empezar,
  });

  // Placas que entran y chocan.
  const izq = useSharedValue(-width);
  const der = useSharedValue(width);
  const vs = useSharedValue(0);
  const flash = useSharedValue(0);
  useEffect(() => {
    if (!listo) return;
    sonar("swoosh");
    izq.set(withSpring(0, { damping: 11, stiffness: 120 }));
    der.set(withDelay(120, withSpring(0, { damping: 11, stiffness: 120 })));
    vs.set(withDelay(650, withSequence(withTiming(1.25, { duration: 220, easing: Easing.out(Easing.back(2)) }), withSpring(1, { damping: 8 }))));
    flash.set(withDelay(620, withSequence(withTiming(1, { duration: 80 }), withTiming(0, { duration: 420 }))));
    const t = setTimeout(() => {
      vibrar.fuerte();
      sonar("combo");
    }, 640);
    return () => clearTimeout(t);
  }, [listo, izq, der, vs, flash]);

  useEffect(() => {
    if (segundos != null && segundos !== ultimaCuenta.current && segundos > 0 && segundos <= 3) {
      ultimaCuenta.current = segundos;
      sonar("cuenta");
      vibrar.ligero();
    }
  }, [segundos]);

  const estiloIzq = useAnimatedStyle(() => ({ transform: [{ translateX: izq.value }] }));
  const estiloDer = useAnimatedStyle(() => ({ transform: [{ translateX: der.value }] }));
  const estiloVs = useAnimatedStyle(() => ({ opacity: vs.value > 0 ? 1 : 0, transform: [{ scale: vs.value }, { rotate: "-8deg" }] }));
  const estiloFlash = useAnimatedStyle(() => ({ opacity: flash.value }));

  function rendirse() {
    if (!info) return;
    Alert.alert("¿Rendirte?", info.clasificatorio ? "Pierdes el duelo y el ELO que corresponde." : "El duelo cuenta como perdido.", [
      { text: "Seguir", style: "cancel" },
      {
        text: "Rendirme",
        style: "destructive",
        onPress: async () => {
          try {
            await rendirseDuelo(info.duelId);
            router.replace({ pathname: "/competir", params: { seccion: "rankeds" } });
          } catch (e) {
            mostrarAviso(mensajeError(e), "error");
          }
        },
      },
    ]);
  }

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (estado === "cuenta-regresiva") return true;
      return false;
    });
    return () => sub.remove();
  }, [estado]);

  const m = info ? MUNDO_POR_SLUG[info.mundo] : null;
  const tema = info ? (info.mundo === "numeria" ? OPERACION[info.operacion ?? ""] ?? "Cálculo" : info.mundo === "geografia" ? CONTINENTE[info.subTipo ?? "america"] : m?.nombre) : "";

  if (error || (info && info.estado !== "pendiente")) {
    return (
      <SafeAreaView style={[styles.pantalla, { justifyContent: "center", padding: 24, gap: 14 }]}>
        <Texto v="h2" centro>
          {error ?? "Este duelo ya terminó"}
        </Texto>
        {info?.serieId ? (
          <Boton3D titulo="Ver la serie" onPress={() => router.replace({ pathname: "/duelo/serie/[id]", params: { id: info.serieId! } })} />
        ) : null}
        <Boton3D titulo="Volver" variante="secundario" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (info && !enApp) {
    return (
      <SafeAreaView style={[styles.pantalla, { justifyContent: "center", padding: 24, gap: 14 }]}>
        <Glifos glifos={m?.glifos ?? ["?"]} acento={m?.neon ?? color.primario} />
        <Texto v="micro" centro c={m?.neon}>
          {info.serieId ? `Ronda ${info.rondaNumero} de ${info.rondaTotal}` : "Duelo"}
        </Texto>
        <Texto v="h1" centro>
          Esta ronda es en {m?.nombre}
        </Texto>
        <Texto v="nota" centro>
          {m?.nombre} todavía se juega en la web. Ábrela, juega tu ronda con tu cuenta y vuelve: el resultado se comparte.
        </Texto>
        <Boton3D titulo="Jugar en la web" acento={m?.base} brillo onPress={() => WebBrowser.openBrowserAsync(`${URL_WEB}/rankeds/serie/${info.serieId ?? ""}`)} />
        <Boton3D titulo="Rendirme" variante="secundario" tamano="sm" onPress={rendirse} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.pantalla}>
      <LinearGradient colors={["#1A1540", color.bg, color.bgHondo]} style={StyleSheet.absoluteFill} />
      <Glifos glifos={m?.glifos ?? ["⚔"]} acento={m?.neon ?? color.primario} cantidad={10} />
      <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
        <View style={{ alignItems: "center", paddingTop: 10, gap: 2 }}>
          <Texto v="micro" c={m?.neon}>
            {info?.clasificatorio ? "Rankeds" : "Duelo"} · {m?.nombre ?? ""} {info?.serieId ? `· Ronda ${info.rondaNumero} de ${info.rondaTotal}` : ""}
          </Texto>
          <Texto v="h3">{tema}</Texto>
        </View>

        <View style={{ gap: 18, paddingHorizontal: 16 }}>
          {miPlaca && (
            <Animated.View style={estiloIzq}>
              <PlacaVS placa={miPlaca} lado="yo" />
            </Animated.View>
          )}
          <Animated.View style={[{ alignSelf: "center" }, estiloVs]}>
            <Texto style={{ fontFamily: fuente.display, fontSize: 58, lineHeight: 64, color: color.logro, textShadowColor: color.primario, textShadowRadius: 22, fontStyle: "italic" }}>VS</Texto>
          </Animated.View>
          {rival && (
            <Animated.View style={estiloDer}>
              <PlacaVS placa={rival} lado="rival" />
            </Animated.View>
          )}
          {info?.rivalYaJugo && (
            <Texto v="nota" centro>
              👻 Corres contra el registro exacto de {info.rivalNombre}
            </Texto>
          )}
        </View>

        <View style={{ alignItems: "center", gap: 10, paddingHorizontal: 20, paddingBottom: 18, minHeight: 170, justifyContent: "flex-end" }}>
          {estado === "cuenta-regresiva" && segundos != null && segundos <= 3 ? (
            <NumeroCuenta n={segundos} />
          ) : estado === "cuenta-regresiva" ? (
            <Texto v="h3">¡Prepárate!</Texto>
          ) : estado === "agotado" ? (
            <>
              <Texto v="nota" centro>
                {info?.rivalNombre} no llegó a la sala. Juega tu lado ahora: cuando juegue, correrá contra tu registro.
              </Texto>
              <Boton3D titulo="Empezar ahora" acento={m?.base} brillo onPress={empezarAhora} />
              <Boton3D titulo="Rendirme" variante="secundario" tamano="sm" onPress={rendirse} />
            </>
          ) : (
            <>
              <View style={styles.fila}>
                <View style={[styles.punto, { backgroundColor: rivalPresente ? color.correcto : color.texto2 }]} />
                <Texto v="nota">{rivalPresente ? `${info?.rivalNombre} está en la sala` : `Esperando a ${info?.rivalNombre ?? "tu rival"}…`}</Texto>
              </View>
              <Boton3D titulo="Rendirme" variante="secundario" tamano="sm" onPress={rendirse} />
            </>
          )}
        </View>
      </SafeAreaView>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: "#FFFFFF" }, estiloFlash]} />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bgHondo },
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  punto: { width: 9, height: 9, borderRadius: 5 },
});
