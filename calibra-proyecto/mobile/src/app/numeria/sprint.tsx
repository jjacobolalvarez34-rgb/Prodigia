import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  cargarNiveles,
  DURACION_SPRINT_MS,
  guardarIntento,
  nuevoProblema,
  textoProblema,
  type Operacion,
  type Problem,
} from "~/lib/numeria";
import { cerrarPartida } from "~/lib/partida";
import { useSesion } from "~/lib/sesion";
import { mensajeError } from "~/lib/supabase";
import Teclado from "~/ui/Teclado";
import { color, mono, NUMERIA, radio } from "~/tema";

const FEEDBACK_OK_MS = 450;
const FEEDBACK_ERROR_MS = 1100;

type Feedback = "idle" | "correcto" | "incorrecto";

export default function Sprint() {
  const router = useRouter();
  const { sesion } = useSesion();
  const params = useLocalSearchParams<{ ops?: string }>();
  const operaciones = (params.ops ?? "suma").split(",").filter(Boolean) as Operacion[];

  const [problema, setProblema] = useState<Problem | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [restanteMs, setRestanteMs] = useState(DURACION_SPRINT_MS);
  const [xp, setXp] = useState(0);
  const [correctos, setCorrectos] = useState(0);
  const [total, setTotal] = useState(0);
  const [racha, setRacha] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [cerrando, setCerrando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  const nivelesRef = useRef<Record<Operacion, number> | null>(null);
  const usadosRef = useRef(new Set<string>());
  const inicioRef = useRef(0);
  const mostradoEnRef = useRef(0);
  const terminadoRef = useRef(false);
  const ocupadoRef = useRef(false);
  const pendientesRef = useRef<Promise<unknown>[]>([]);
  const xpRef = useRef(0);
  const totalesRef = useRef({ correctos: 0, total: 0 });

  // Arranque: niveles reales del usuario → primer problema → reloj.
  useEffect(() => {
    if (!sesion?.user.id) return;
    let cancelado = false;
    cargarNiveles(sesion.user.id).then((niveles) => {
      if (cancelado) return;
      nivelesRef.current = niveles;
      const p = nuevoProblema(operaciones, niveles, usadosRef.current);
      setProblema(p);
      inicioRef.current = Date.now();
      mostradoEnRef.current = Date.now();
    });
    return () => {
      cancelado = true;
    };
    // Solo al montar: las operaciones no cambian durante la partida.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion?.user.id]);

  // Reloj.
  useEffect(() => {
    if (!problema || terminadoRef.current) return;
    const id = setInterval(() => {
      const restante = Math.max(0, DURACION_SPRINT_MS - (Date.now() - inicioRef.current));
      setRestanteMs(restante);
      if (restante === 0) {
        clearInterval(id);
        terminar();
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problema !== null]);

  // Botón atrás de Android: confirmar antes de abandonar.
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
    // Esperar a que lleguen todos los intentos a la base antes de cerrar: el XP del
    // día se calcula con lo que está guardado.
    await Promise.allSettled(pendientesRef.current);
    try {
      const r = await cerrarPartida(xpRef.current);
      router.replace({
        pathname: "/resultado",
        params: { mundo: "numeria", datos: JSON.stringify({ ...r, xp: xpRef.current, ...totalesRef.current }) },
      });
    } catch (e) {
      setCerrando(false);
      Alert.alert("No se pudo cerrar la partida", mensajeError(e), [{ text: "Volver", onPress: () => router.back() }]);
    }
  }

  function enviar() {
    if (!problema || respuesta === "" || respuesta === "-" || ocupadoRef.current || terminadoRef.current) return;
    ocupadoRef.current = true;
    const timeMs = Date.now() - mostradoEnRef.current;
    const correcto = Number(respuesta) === problema.answer;

    setFeedback(correcto ? "correcto" : "incorrecto");
    Haptics.notificationAsync(correcto ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    totalesRef.current = {
      correctos: totalesRef.current.correctos + (correcto ? 1 : 0),
      total: totalesRef.current.total + 1,
    };
    setCorrectos(totalesRef.current.correctos);
    setTotal(totalesRef.current.total);
    setRacha((r) => (correcto ? r + 1 : 0));

    const guardado = guardarIntento(problema, correcto, timeMs)
      .then((res) => {
        if (res.xp > 0) {
          xpRef.current += res.xp;
          setXp(xpRef.current);
        }
        if (res.nivel != null && nivelesRef.current) {
          const tipo = problema.problemType as Operacion;
          if (res.nivel > problema.nivel) {
            setAviso(`¡Subiste a nivel ${res.nivel}!`);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setTimeout(() => setAviso(null), 1400);
          }
          nivelesRef.current = { ...nivelesRef.current, [tipo]: res.nivel };
        }
      })
      .catch((e) => setErrorGuardado(mensajeError(e)));
    pendientesRef.current.push(guardado);

    setTimeout(
      () => {
        if (terminadoRef.current || !nivelesRef.current) return;
        setProblema(nuevoProblema(operaciones, nivelesRef.current, usadosRef.current));
        setRespuesta("");
        setFeedback("idle");
        mostradoEnRef.current = Date.now();
        ocupadoRef.current = false;
      },
      correcto ? FEEDBACK_OK_MS : FEEDBACK_ERROR_MS
    );
  }

  if (!problema || cerrando) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro]}>
        <ActivityIndicator color={NUMERIA.neon} size="large" />
        <Text style={styles.cargando}>{cerrando ? "Guardando tu partida…" : "Preparando problemas…"}</Text>
      </SafeAreaView>
    );
  }

  const segundos = Math.ceil(restanteMs / 1000);
  const fraccion = restanteMs / DURACION_SPRINT_MS;
  const bordeTarjeta = feedback === "correcto" ? color.correcto : feedback === "incorrecto" ? color.error : NUMERIA.base;

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
        <View style={[styles.barra, { width: `${fraccion * 100}%`, backgroundColor: segundos <= 10 ? color.error : NUMERIA.neon }]} />
      </View>

      <View style={styles.estado}>
        <Text style={styles.estadoTexto}>
          {correctos}/{total} correctas
        </Text>
        {racha >= 3 && <Text style={[styles.estadoTexto, { color: color.racha }]}>🔥 Racha {racha}</Text>}
        <Text style={styles.estadoTexto}>Nivel {problema.nivel}</Text>
      </View>

      <View style={styles.zonaProblema}>
        <View style={[styles.tarjeta, { borderColor: bordeTarjeta, shadowColor: bordeTarjeta }]}>
          <Text style={styles.problema} adjustsFontSizeToFit numberOfLines={1}>
            {textoProblema(problema)}
          </Text>
          <Text
            style={[
              styles.respuesta,
              feedback === "correcto" && { color: color.correcto },
              feedback === "incorrecto" && { color: color.error, textDecorationLine: "line-through" },
            ]}
          >
            {respuesta === "" ? " " : respuesta}
          </Text>
          {feedback === "incorrecto" && <Text style={styles.solucion}>Era {problema.answer}</Text>}
        </View>
        {aviso && <Text style={[styles.aviso, { color: color.logro }]}>{aviso}</Text>}
        {errorGuardado && <Text style={styles.errorGuardado}>No se pudo guardar un intento: {errorGuardado}</Text>}
      </View>

      <View style={styles.teclado}>
        <Teclado
          acento={NUMERIA.base}
          deshabilitado={feedback !== "idle"}
          puedeEnviar={respuesta !== "" && respuesta !== "-"}
          onDigito={(d) => setRespuesta((r) => (r.replace("-", "").length >= 7 ? r : r + d))}
          onBorrar={() => setRespuesta((r) => r.slice(0, -1))}
          onMenos={() => setRespuesta((r) => (r.startsWith("-") ? r.slice(1) : "-" + r))}
          onEnviar={enviar}
        />
      </View>
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
  estado: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginTop: 12 },
  estadoTexto: { color: color.texto2, fontSize: 13, fontWeight: "600" },
  zonaProblema: { flex: 1, justifyContent: "center", paddingHorizontal: 20, gap: 12 },
  tarjeta: {
    backgroundColor: color.surface1,
    borderRadius: radio.sprint,
    borderWidth: 2,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 10,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  problema: { color: color.texto, fontFamily: mono, fontSize: 52, fontWeight: "800" },
  respuesta: { color: NUMERIA.neon, fontFamily: mono, fontSize: 40, fontWeight: "800", minHeight: 48 },
  solucion: { color: color.correcto, fontSize: 17, fontWeight: "700" },
  aviso: { textAlign: "center", fontSize: 18, fontWeight: "800" },
  errorGuardado: { color: color.error, fontSize: 12, textAlign: "center" },
  teclado: { paddingHorizontal: 16, paddingBottom: 12 },
});
