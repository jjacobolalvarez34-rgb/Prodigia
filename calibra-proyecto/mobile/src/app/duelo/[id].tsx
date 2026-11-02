import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, BackHandler, StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { Defs, LinearGradient as Degradado, Line, Polygon, Stop } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { mundoJugable } from "~/lib/mundosJugables";
import { MUNDOS_DUELO_APP, obtenerDuelo, rechazarDuelo, rendirseDuelo, type InfoDuelo } from "~/lib/competir";
import { useArranqueSincronizado } from "~/lib/duelos";
import { sonar, vibrar } from "~/lib/efectos";
import { URL_WEB } from "~/lib/entorno";
import { useJugador } from "~/lib/jugador";
import { leerProgresoDuelo } from "~/lib/progresoDuelo";
import { cargarPlacaPublica, placaBasica, rangoDeElo, type PlacaDatos } from "~/lib/placa";
import { useSesion } from "~/lib/sesion";
import { mensajeError } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import Glifos from "~/ui/Glifos";
import { PlacaVS } from "~/ui/placa/Placa";
import Texto from "~/ui/Texto";
import { color, fuente, MUNDO_POR_SLUG, conAlfa, temaClaro } from "~/tema";

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

function irAlSprint(info: InfoDuelo, router: ReturnType<typeof useRouter>) {
  if (info.mundo === "numeria" || info.mundo === "geografia") router.replace({ pathname: info.mundo === "geografia" ? "/geografia/sprint" : "/numeria/sprint", params: { duelo: info.duelId } });
  else router.replace({ pathname: "/[mundo]/sprint", params: { mundo: info.mundo, duelo: info.duelId } });
}

// Pantalla VS (02-SISTEMA-VISUAL.md §7.2): las dos Placas entran desde los lados,
// chocan en el centro, destello, y la cuenta 3-2-1 sincronizada con el rival.
export default function Duelo() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width, height } = useWindowDimensions();
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
        setError("Este reto ya no está disponible. Los duelos son en vivo: se cancelan si nadie los acepta en 2 minutos.");
        return;
      }
      // Reconexión (2026-11-02): si ya ibas a mitad de esta ronda, de vuelta a la
      // partida sin pasar otra vez por el VS ni la cuenta.
      if (d.estado === "pendiente" && (await leerProgresoDuelo(d.duelId))) {
        irAlSprint(d, router);
        return;
      }
      setInfo(d);
      const p = d.rivalEsBot ? null : await cargarPlacaPublica(d.rivalId);
      setRival(p ?? placaBasica(d.rivalId, d.rivalNombre, { elo: d.rivalElo, titulo: d.rivalTitulo }));
    });
  }, [id, miId, router]);

  const enApp = !!info && (MUNDOS_DUELO_APP as string[]).includes(info.mundo);
  const listo = !!info && info.estado === "pendiente" && enApp && !!rival;

  const empezar = useCallback(() => {
    if (!info) return;
    sonar("ya");
    vibrar.fuerte();
    irAlSprint(info, router);
  }, [info, router]);

  const { estado, segundos, rivalPresente, preguntar, seguirEsperando } = useArranqueSincronizado({
    duelId: listo ? info!.duelId : null,
    miUserId: miId,
    rivalId: info?.rivalId ?? null,
    sinEspera: !!info && (info.rivalEsBot || info.rivalYaJugo),
    onEmpezar: empezar,
  });

  // Choque (como el video de las rankeds, 2026-11-02): las dos mitades del fondo,
  // cortadas en diagonal y con el color del rango de cada uno, se cierran de golpe
  // desde arriba y abajo; el VS cae grande y girado, destello, y entran las placas.
  const arriba = useSharedValue(-height);
  const abajo = useSharedValue(height);
  const vs = useSharedValue(0);
  const flash = useSharedValue(0);
  const placas = useSharedValue(0);
  useEffect(() => {
    if (!listo) return;
    sonar("swoosh");
    const golpe = { duration: 450, easing: Easing.out(Easing.exp) };
    arriba.set(withTiming(0, golpe));
    abajo.set(withTiming(0, golpe));
    vs.set(withTiming(1, { duration: 350, easing: Easing.in(Easing.poly(4)) }));
    flash.set(withDelay(350, withSequence(withTiming(0.85, { duration: 60 }), withTiming(0, { duration: 450 }))));
    placas.set(withDelay(300, withTiming(1, { duration: 500, easing: Easing.out(Easing.exp) })));
    const t = setTimeout(() => {
      vibrar.fuerte();
      sonar("jugar");
    }, 350);
    return () => clearTimeout(t);
  }, [listo, arriba, abajo, vs, flash, placas]);

  useEffect(() => {
    if (segundos != null && segundos !== ultimaCuenta.current && segundos > 0 && segundos <= 3) {
      ultimaCuenta.current = segundos;
      sonar("cuenta");
      vibrar.ligero();
    }
  }, [segundos]);

  const estiloArriba = useAnimatedStyle(() => ({ transform: [{ translateY: arriba.value }] }));
  const estiloAbajo = useAnimatedStyle(() => ({ transform: [{ translateY: abajo.value }] }));
  const estiloVs = useAnimatedStyle(() => ({ opacity: vs.value, transform: [{ scale: 3 - 2 * vs.value }, { rotate: `${-12 * (1 - vs.value)}deg` }] }));
  const estiloFlash = useAnimatedStyle(() => ({ opacity: flash.value }));
  const estiloPlacas = useAnimatedStyle(() => ({ opacity: placas.value, transform: [{ scale: 0.85 + 0.15 * placas.value }] }));

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

  async function cancelarReto() {
    if (info) await rechazarDuelo(info.duelId).catch(() => undefined);
    router.back();
  }

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (estado === "cuenta-regresiva") return true;
      return false;
    });
    return () => sub.remove();
  }, [estado]);

  const m = info ? MUNDO_POR_SLUG[info.mundo] : null;
  const tema = info
    ? info.mundo === "numeria"
      ? OPERACION[info.operacion ?? ""] ?? "Cálculo"
      : info.mundo === "geografia"
        ? CONTINENTE[info.subTipo ?? "america"]
        : mundoJugable(info.mundo)?.modos.find((x) => x.id === info.subTipo)?.nombre ?? m?.nombre
    : "";

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

  // Mitades del fondo: la del rival arriba, la tuya abajo, con el corte en diagonal.
  const altoMitad = height * 0.58;
  const colorRival = rival ? rangoDeElo(rival.elo).colorHex : color.error;
  const colorMio = miPlaca ? rangoDeElo(miPlaca.elo).colorHex : color.primario;

  return (
    <View style={styles.pantalla}>
      <LinearGradient colors={[temaClaro ? conAlfa(color.primario, 0.22) : "#1A1540", color.bg, color.bgHondo]} style={StyleSheet.absoluteFill} />
      {listo && (
        <>
          <Animated.View pointerEvents="none" style={[styles.mitad, { top: 0, height: altoMitad }, estiloArriba]}>
            <Svg width={width} height={altoMitad}>
              <Defs>
                <Degradado id="rival" x1="1" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colorRival} stopOpacity={0.55} />
                  <Stop offset="1" stopColor={color.bgHondo} stopOpacity={0.9} />
                </Degradado>
              </Defs>
              <Polygon points={`0,0 ${width},0 ${width},${altoMitad * 0.8} 0,${altoMitad}`} fill="url(#rival)" />
              <Line x1={0} y1={altoMitad} x2={width} y2={altoMitad * 0.8} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={2} />
            </Svg>
          </Animated.View>
          <Animated.View pointerEvents="none" style={[styles.mitad, { bottom: 0, height: altoMitad }, estiloAbajo]}>
            <Svg width={width} height={altoMitad}>
              <Defs>
                <Degradado id="mio" x1="0" y1="1" x2="1" y2="0">
                  <Stop offset="0" stopColor={colorMio} stopOpacity={0.55} />
                  <Stop offset="1" stopColor={color.bgHondo} stopOpacity={0.9} />
                </Degradado>
              </Defs>
              <Polygon points={`0,${altoMitad * 0.2} ${width},0 ${width},${altoMitad} 0,${altoMitad}`} fill="url(#mio)" />
              <Line x1={0} y1={altoMitad * 0.2} x2={width} y2={0} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={2} />
            </Svg>
          </Animated.View>
        </>
      )}
      <Glifos glifos={m?.glifos ?? ["×", "✦"]} acento={m?.neon ?? color.primario} cantidad={8} />
      <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
        <View style={{ alignItems: "center", paddingTop: 10, gap: 2 }}>
          <Texto v="micro" c="#FFFFFF">
            {info?.clasificatorio ? "Rankeds" : "Duelo"} · {m?.nombre ?? ""} {info?.serieId ? `· Ronda ${info.rondaNumero} de ${info.rondaTotal}` : ""}
          </Texto>
          <Texto v="h3">{tema}</Texto>
        </View>

        <View style={{ flex: 1, justifyContent: "space-evenly", paddingHorizontal: 16 }}>
          {rival && (
            <Animated.View style={estiloPlacas}>
              <PlacaVS placa={rival} lado="rival" />
            </Animated.View>
          )}
          <Animated.View style={[{ alignSelf: "center" }, estiloVs]}>
            <Texto style={styles.vs}>VS</Texto>
          </Animated.View>
          {miPlaca && (
            <Animated.View style={estiloPlacas}>
              <PlacaVS placa={miPlaca} lado="yo" />
            </Animated.View>
          )}
          {info?.rivalYaJugo && (
            <Texto v="nota" centro c="#FFFFFF">
              Corres contra el registro exacto de {info.rivalNombre}
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
                {info?.rivalNombre} no entró a la sala en 2 minutos y el reto se canceló. Los duelos son en vivo: pueden intentarlo de nuevo cuando estén los dos.
              </Texto>
              <Boton3D titulo="Volver" acento={m?.base} onPress={() => router.back()} />
            </>
          ) : preguntar ? (
            <>
              <Texto v="h3" centro>
                {info?.rivalNombre} todavía no entra
              </Texto>
              <Texto v="nota" centro>
                ¿Quieres seguir esperando? A los 2 minutos el reto se cancela solo.
              </Texto>
              <View style={[styles.fila, { alignSelf: "stretch" }]}>
                <Boton3D titulo="Cancelar reto" variante="secundario" tamano="sm" estilo={{ flex: 1 }} onPress={cancelarReto} />
                <Boton3D titulo="Seguir esperando" tamano="sm" acento={m?.base} estilo={{ flex: 1 }} onPress={seguirEsperando} />
              </View>
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
  mitad: { position: "absolute", left: 0, right: 0 },
  vs: { fontFamily: fuente.display, fontSize: 84, lineHeight: 92, color: "#FFFFFF", fontStyle: "italic", letterSpacing: -3, textShadowColor: "rgba(255,197,61,0.7)", textShadowRadius: 28 },
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  punto: { width: 9, height: 9, borderRadius: 5 },
});
