import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  cargarNivelesGeografia,
  CONTINENTES,
  DURACION_SPRINT_GEO_MS,
  ESCUDOS_POR_PARTIDA,
  esPreguntaAvanzada,
  nombrePais,
  PREGUNTAS_POR_PARTIDA,
  siguientePregunta,
  type Continente,
  type Pregunta,
} from "~/lib/geografia";
import { cerrarPartida, guardarIntentoTipo } from "~/lib/partida";
import { useSesion } from "~/lib/sesion";
import { mensajeError } from "~/lib/supabase";
import MapaGeografia from "~/ui/MapaGeografia";
import { color, mono, MUNDOS, radio } from "~/tema";

const GEOGRAFIA = MUNDOS.find((m) => m.slug === "geografia")!;
const FEEDBACK_OK_MS = 650;
const FEEDBACK_ERROR_MS = 1300;

export default function SprintGeografia() {
  const router = useRouter();
  const { sesion } = useSesion();
  const params = useLocalSearchParams<{ continente?: string }>();
  const continente = (CONTINENTES.some((c) => c.id === params.continente) ? params.continente : "america") as Continente;
  const nombreContinente = CONTINENTES.find((c) => c.id === continente)!.nombre;

  const [pregunta, setPregunta] = useState<Pregunta | null>(null);
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const [respondido, setRespondido] = useState(false);
  const [restanteMs, setRestanteMs] = useState(DURACION_SPRINT_GEO_MS);
  const [respondidas, setRespondidas] = useState(0);
  const [xp, setXp] = useState(0);
  const [escudos, setEscudos] = useState(ESCUDOS_POR_PARTIDA);
  const [nivel, setNivel] = useState(1);
  const [aviso, setAviso] = useState<string | null>(null);
  const [cerrando, setCerrando] = useState(false);

  const nivelRef = useRef(1);
  const escudosRef = useRef(ESCUDOS_POR_PARTIDA);
  const usadosRef = useRef(new Set<string>());
  const inicioRef = useRef(0);
  const mostradaEnRef = useRef(0);
  const terminadoRef = useRef(false);
  const ocupadoRef = useRef(false);
  const pendientesRef = useRef<Promise<unknown>[]>([]);
  const xpRef = useRef(0);
  const totalesRef = useRef({ correctos: 0, total: 0 });

  function nuevaPregunta() {
    const p = siguientePregunta(continente, nivelRef.current, usadosRef.current);
    if (p) usadosRef.current.add(p.id);
    setPregunta(p);
    setSeleccionId(null);
    setRespondido(false);
    mostradaEnRef.current = Date.now();
  }

  useEffect(() => {
    if (!sesion?.user.id) return;
    let cancelado = false;
    cargarNivelesGeografia(sesion.user.id).then((niveles) => {
      if (cancelado) return;
      nivelRef.current = niveles[continente];
      setNivel(niveles[continente]);
      inicioRef.current = Date.now();
      nuevaPregunta();
    });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion?.user.id]);

  useEffect(() => {
    if (!pregunta || terminadoRef.current) return;
    const id = setInterval(() => {
      const restante = Math.max(0, DURACION_SPRINT_GEO_MS - (Date.now() - inicioRef.current));
      setRestanteMs(restante);
      if (restante === 0 && !ocupadoRef.current) {
        clearInterval(id);
        terminar();
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pregunta !== null]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      confirmarSalida();
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function confirmarSalida() {
    if (terminadoRef.current) return;
    Alert.alert("¿Salir de la partida?", "Lo que ya respondiste queda guardado, pero la partida no se cierra ni suma al día.", [
      { text: "Seguir jugando", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: () => {
          terminadoRef.current = true;
          router.back();
        },
      },
    ]);
  }

  async function terminar() {
    if (terminadoRef.current) return;
    terminadoRef.current = true;
    setCerrando(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Promise.allSettled(pendientesRef.current);
    try {
      const r = await cerrarPartida(xpRef.current, "geografia");
      router.replace({ pathname: "/resultado", params: { mundo: "geografia", datos: JSON.stringify({ ...r, xp: xpRef.current, ...totalesRef.current }) } });
    } catch (e) {
      setCerrando(false);
      Alert.alert("No se pudo cerrar la partida", mensajeError(e), [{ text: "Volver", onPress: () => router.back() }]);
    }
  }

  function responder(id: string) {
    if (!pregunta || respondido || ocupadoRef.current || terminadoRef.current) return;
    ocupadoRef.current = true;
    const timeMs = Date.now() - mostradaEnRef.current;
    const correcto = id === pregunta.id;
    setSeleccionId(id);
    setRespondido(true);
    Haptics.notificationAsync(correcto ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);

    // Igual que la web: los primeros 2 errores de la partida no bajan el nivel.
    let protegido = false;
    if (!correcto && escudosRef.current > 0) {
      protegido = true;
      escudosRef.current -= 1;
      setEscudos(escudosRef.current);
    }
    totalesRef.current = { correctos: totalesRef.current.correctos + (correcto ? 1 : 0), total: totalesRef.current.total + 1 };
    setRespondidas(totalesRef.current.total);

    const guardado = guardarIntentoTipo(`geografia_${continente}`, pregunta.dificultad, correcto, timeMs, protegido)
      .then((res) => {
        if (res.xp > 0) {
          xpRef.current += res.xp;
          setXp(xpRef.current);
        }
        if (res.nivel != null) {
          if (res.nivel > nivelRef.current) {
            setAviso(`¡Subiste a nivel ${res.nivel} en ${nombreContinente}!`);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setTimeout(() => setAviso(null), 1500);
          }
          nivelRef.current = res.nivel;
          setNivel(res.nivel);
        }
      })
      .catch(() => undefined);
    pendientesRef.current.push(guardado);

    setTimeout(
      () => {
        ocupadoRef.current = false;
        if (terminadoRef.current) return;
        if (totalesRef.current.total >= PREGUNTAS_POR_PARTIDA || Date.now() - inicioRef.current >= DURACION_SPRINT_GEO_MS) terminar();
        else nuevaPregunta();
      },
      correcto ? FEEDBACK_OK_MS : FEEDBACK_ERROR_MS
    );
  }

  if (!pregunta || cerrando) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro]}>
        <ActivityIndicator color={GEOGRAFIA.neon} size="large" />
        <Text style={styles.cargando}>{cerrando ? "Guardando tu partida…" : "Desplegando el mapa…"}</Text>
      </SafeAreaView>
    );
  }

  const segundos = Math.ceil(restanteMs / 1000);
  const avanzada = esPreguntaAvanzada(pregunta);
  const acerto = respondido && seleccionId === pregunta.id;
  const nombreElegido = respondido && seleccionId && !avanzada ? nombrePais(continente, seleccionId) : null;

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.hud}>
        <Pressable onPress={confirmarSalida} hitSlop={12}>
          <Text style={styles.cerrar}>✕</Text>
        </Pressable>
        <View style={styles.hudCentro}>
          <Text style={[styles.reloj, segundos <= 10 && { color: color.error }]}>{segundos}s</Text>
        </View>
        <Text style={styles.xp}>+{xp} ⚡</Text>
      </View>
      <View style={styles.barraFondo}>
        <View style={[styles.barra, { width: `${(restanteMs / DURACION_SPRINT_GEO_MS) * 100}%`, backgroundColor: segundos <= 10 ? color.error : GEOGRAFIA.neon }]} />
      </View>

      <View style={styles.estado}>
        <View style={styles.puntos}>
          {Array.from({ length: PREGUNTAS_POR_PARTIDA }).map((_, i) => (
            <View key={i} style={[styles.punto, i < respondidas && { backgroundColor: GEOGRAFIA.neon }]} />
          ))}
        </View>
        <Text style={styles.estadoTexto}>
          🛡️ {escudos} · Nivel {nivel}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.zona} scrollEnabled={avanzada}>
        <Text style={styles.pregunta}>
          {avanzada ? (
            pregunta.pregunta
          ) : (
            <>
              ¿Dónde está <Text style={{ color: GEOGRAFIA.neon }}>{pregunta.nombre}</Text>?
            </>
          )}
        </Text>

        {avanzada ? (
          <View style={{ gap: 10 }}>
            {pregunta.opciones.map((o) => {
              const esCorrecta = respondido && o.id === pregunta.id;
              const esIncorrecta = respondido && o.id === seleccionId && o.id !== pregunta.id;
              return (
                <Pressable
                  key={o.id}
                  disabled={respondido}
                  onPress={() => responder(o.id)}
                  style={[styles.opcion, esCorrecta && { borderColor: color.correcto, backgroundColor: color.correcto + "22" }, esIncorrecta && { borderColor: color.error, backgroundColor: color.error + "22" }]}
                >
                  <Text style={styles.opcionTexto}>{o.texto}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <MapaGeografia
            continente={continente}
            acento={GEOGRAFIA.neon}
            objetivoId={pregunta.id}
            seleccionId={seleccionId}
            respondido={respondido}
            onElegir={responder}
          />
        )}

        <View style={styles.feedback}>
          {respondido && (
            <Text style={[styles.feedbackTexto, { color: acerto ? color.correcto : color.error }]}>
              {acerto ? "¡Correcto!" : nombreElegido ? `Tocaste ${nombreElegido}. Era ${pregunta.nombre}.` : `Era ${pregunta.nombre}.`}
            </Text>
          )}
          {aviso && <Text style={[styles.feedbackTexto, { color: color.logro }]}>{aviso}</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bgHondo },
  centro: { alignItems: "center", justifyContent: "center", gap: 14 },
  cargando: { color: color.texto2, fontSize: 15 },
  hud: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  cerrar: { color: color.texto2, fontSize: 22, width: 60 },
  hudCentro: { flex: 1, alignItems: "center" },
  reloj: { color: color.texto, fontFamily: mono, fontSize: 24, fontWeight: "800" },
  xp: { color: color.logro, fontFamily: mono, fontSize: 16, fontWeight: "700", width: 60, textAlign: "right" },
  barraFondo: { height: 6, marginHorizontal: 20, borderRadius: 3, backgroundColor: color.surface2, overflow: "hidden" },
  barra: { height: "100%", borderRadius: 3 },
  estado: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginTop: 12 },
  puntos: { flexDirection: "row", gap: 5 },
  punto: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.surface3 },
  estadoTexto: { color: color.texto2, fontSize: 13, fontWeight: "600" },
  zona: { padding: 16, gap: 14, flexGrow: 1, justifyContent: "center" },
  pregunta: { color: color.texto, fontSize: 22, fontWeight: "800", textAlign: "center" },
  opcion: { borderWidth: 2, borderColor: color.border, backgroundColor: color.surface1, borderRadius: radio.boton, padding: 16 },
  opcionTexto: { color: color.texto, fontSize: 16, fontWeight: "700", textAlign: "center" },
  feedback: { minHeight: 48, gap: 4 },
  feedbackTexto: { textAlign: "center", fontSize: 16, fontWeight: "800" },
});
