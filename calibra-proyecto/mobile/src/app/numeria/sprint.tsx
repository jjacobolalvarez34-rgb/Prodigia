import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, Pressable, StyleSheet, View } from "react-native";
import Animated, { useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { mulberry32 } from "@/lib/rng";
import { obtenerDuelo, registrarResultadoDuelo, type InfoDuelo } from "~/lib/competir";
import { useProgresoEnVivo } from "~/lib/duelos";
import { sonar, sonarAcierto, vibrar } from "~/lib/efectos";
import {
  cargarNivelesNumeria,
  DURACION_SPRINT_MS,
  esCorrecta,
  guardarIntentoNumeria,
  nuevoProblemaNumeria,
  SECCION_POR_ID,
  type ProblemaNumeria,
  type SeccionId,
} from "~/lib/numeria";
import { cerrarPartida } from "~/lib/partida";
import { useSesion } from "~/lib/sesion";
import { mensajeError, supabase } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import Glifos from "~/ui/Glifos";
import {
  animarAcierto,
  animarError,
  BarraRival,
  Cabecera,
  CartelFinal,
  CuentaInicio,
  Flotante,
  Progreso,
  TarjetaProblema,
  Teclado,
  useReloj,
  useSalida,
} from "~/ui/Sprint";
import Texto from "~/ui/Texto";
import { brillo, color, conAlfa, fuente, NUMERIA } from "~/tema";

const TOTAL = 10;
const FEEDBACK_OK_MS = 420;
const FEEDBACK_ERROR_MS = 1050;
// Igual que EnunciadoSprintRunner/FraccionSprintRunner de la web: 2 escudos de base
// en los temas avanzados; en aritmética solo los comprados.
const ESCUDOS_BASE_AVANZADOS = 2;

type Feedback = "idle" | "correcto" | "incorrecto";

export default function Sprint() {
  const router = useRouter();
  const { sesion } = useSesion();
  const miId = sesion?.user.id ?? null;
  const params = useLocalSearchParams<{ seccion?: string; temas?: string; ops?: string; duelo?: string }>();
  const dueloId = params.duelo ?? null;
  const [seccion, setSeccion] = useState<SeccionId>((params.seccion as SeccionId) in SECCION_POR_ID ? (params.seccion as SeccionId) : "aritmetica");
  const [temas, setTemas] = useState<string[]>((params.temas ?? params.ops ?? "suma").split(",").filter(Boolean));

  const [duelo, setDuelo] = useState<InfoDuelo | null>(null);
  const [listo, setListo] = useState(false);
  const [inicio, setInicio] = useState<number | null>(null);
  const [problema, setProblema] = useState<ProblemaNumeria | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [num, setNum] = useState("");
  const [den, setDen] = useState("");
  const [campo, setCampo] = useState<"num" | "den">("num");
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [resultados, setResultados] = useState<boolean[]>([]);
  const [combo, setCombo] = useState(0);
  const [flotantes, setFlotantes] = useState<{ id: number; texto: string }[]>([]);
  const [escudos, setEscudos] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [final, setFinal] = useState<"tiempo" | "listo" | null>(null);

  const sello = useSharedValue(1);
  const sacudida = useSharedValue(0);
  const pulso = useSharedValue(0);
  const { estiloJuego, estiloTeclado, salir } = useSalida();

  const nivelesRef = useRef<Record<string, number>>({});
  const usadosRef = useRef(new Set<string>());
  const rngRef = useRef<(() => number) | undefined>(undefined);
  const seccionRef = useRef(seccion);
  const temasRef = useRef(temas);
  const mostradoEnRef = useRef(0);
  const terminadoRef = useRef(false);
  const ocupadoRef = useRef(false);
  const pendientesRef = useRef<Promise<unknown>[]>([]);
  const xpRef = useRef(0);
  const respuestasRef = useRef<{ correct: boolean; timeMs: number }[]>([]);
  const escudosRef = useRef(0);
  const comboRef = useRef(0);
  const flotanteId = useRef(0);
  const inicioRef = useRef(0);

  const { rival: rivalVivo, emitir } = useProgresoEnVivo(dueloId && duelo && !duelo.rivalYaJugo ? dueloId : null, miId);

  function siguiente(): ProblemaNumeria {
    return nuevoProblemaNumeria(seccionRef.current, temasRef.current, nivelesRef.current, usadosRef.current, rngRef.current);
  }

  // Preparación: niveles reales (o el nivel fijo del duelo) y el primer problema.
  // El reloj arranca recién después de "¿Preparado? 3, 2, 1".
  useEffect(() => {
    if (!miId) return;
    let cancelado = false;
    (async () => {
      const niveles = await cargarNivelesNumeria(miId);
      if (dueloId) {
        const d = await obtenerDuelo(dueloId, miId);
        if (!d || d.estado !== "pendiente") {
          Alert.alert("Duelo no disponible", "Este duelo ya terminó.", [{ text: "Volver", onPress: () => router.back() }]);
          return;
        }
        setDuelo(d);
        const op = d.operacion ?? "suma";
        seccionRef.current = "aritmetica";
        temasRef.current = [op];
        setSeccion("aritmetica");
        setTemas([op]);
        niveles[op] = d.nivel;
        rngRef.current = mulberry32(d.semilla);
      } else {
        const { data } = await supabase.from("profiles").select("escudos_extra_pendientes").eq("id", miId).single();
        const extra = (data as { escudos_extra_pendientes: number } | null)?.escudos_extra_pendientes ?? 0;
        if (extra > 0) await supabase.rpc("consumir_escudos_pendientes");
        escudosRef.current = extra + (seccionRef.current === "aritmetica" ? 0 : ESCUDOS_BASE_AVANZADOS);
        setEscudos(escudosRef.current);
      }
      if (cancelado) return;
      nivelesRef.current = niveles;
      setProblema(siguiente());
      setListo(true);
      // En duelo la cuenta ya pasó en la pantalla VS.
      if (dueloId) arrancar();
    })();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [miId]);

  function arrancar() {
    const ahora = Date.now();
    inicioRef.current = ahora;
    mostradoEnRef.current = ahora;
    setInicio(ahora);
  }

  const alAcabarElTiempo = useCallback(() => {
    if (!ocupadoRef.current) terminar("tiempo");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const reloj = useReloj(inicio, DURACION_SPRINT_MS, alAcabarElTiempo, final !== null);

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
    Alert.alert("¿Salir de la partida?", dueloId ? "Si sales, el duelo queda sin tu resultado." : "Lo que ya respondiste queda guardado, pero la partida no se cierra ni suma al día.", [
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

  async function terminar(motivo: "tiempo" | "listo") {
    if (terminadoRef.current) return;
    terminadoRef.current = true;
    setFinal(motivo);
    sonar(motivo === "tiempo" ? "cuenta" : "ya");
    vibrar.exito();
    salir();
    const minimo = new Promise((r) => setTimeout(r, 1100));
    await Promise.allSettled(pendientesRef.current);
    try {
      const r = await cerrarPartida(xpRef.current, "numeria", dueloId ?? undefined);
      const correctos = respuestasRef.current.filter((x) => x.correct).length;
      const total = Math.max(TOTAL, respuestasRef.current.length);
      let resultadoDuelo = null;
      if (dueloId && duelo) {
        const tiempos = respuestasRef.current.map((x) => x.timeMs);
        resultadoDuelo = await registrarResultadoDuelo(dueloId, correctos / total, tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : 0, xpRef.current, respuestasRef.current);
      }
      await minimo;
      if (dueloId && duelo?.serieId) {
        router.replace({ pathname: "/duelo/serie/[id]", params: { id: duelo.serieId } });
        return;
      }
      const s = SECCION_POR_ID[seccionRef.current];
      const nombreTema = temasRef.current.length === 1 ? s.temas.find((t) => t.id === temasRef.current[0])?.nombre ?? s.nombre : s.nombre;
      router.replace({
        pathname: "/resultado",
        params: {
          mundo: "numeria",
          tema: nombreTema,
          repetir: dueloId ? "" : JSON.stringify({ pathname: "/numeria/sprint", params: { seccion: seccionRef.current, temas: temasRef.current.join(",") } }),
          datos: JSON.stringify({ ...r, xp: xpRef.current, correctos, total, tiempoMs: Math.min(DURACION_SPRINT_MS, Date.now() - inicioRef.current), duelo: resultadoDuelo, rival: duelo?.rivalNombre ?? null }),
        },
      });
    } catch (e) {
      Alert.alert("No se pudo cerrar la partida", mensajeError(e), [{ text: "Volver", onPress: () => router.back() }]);
    }
  }

  function limpiarEntrada() {
    setRespuesta("");
    setNum("");
    setDen("");
    setCampo("num");
  }

  function responder(entrada: { texto: string; num?: string; den?: string; comparacion?: string }) {
    if (!problema || ocupadoRef.current || terminadoRef.current || inicio == null) return;
    ocupadoRef.current = true;
    const timeMs = Date.now() - mostradoEnRef.current;
    const correcto = esCorrecta(problema, entrada);
    respuestasRef.current.push({ correct: correcto, timeMs });
    setFeedback(correcto ? "correcto" : "incorrecto");
    setResultados((r) => [...r, correcto]);
    comboRef.current = correcto ? comboRef.current + 1 : 0;
    setCombo(comboRef.current);

    if (correcto) {
      sonarAcierto(comboRef.current);
      if (comboRef.current === 5 || comboRef.current === 10) {
        sonar("combo");
        vibrar.fuerte();
      } else vibrar.medio();
      animarAcierto(sello);
      pulso.set(withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 500 })));
    } else {
      sonar("error");
      vibrar.error();
      animarError(sacudida);
    }

    let protegido = false;
    if (!correcto && escudosRef.current > 0 && !dueloId) {
      protegido = true;
      escudosRef.current -= 1;
      setEscudos(escudosRef.current);
    }
    emitir({ respondidos: respuestasRef.current.length, correctos: respuestasRef.current.filter((x) => x.correct).length, racha: comboRef.current });

    const actual = problema;
    const guardado = guardarIntentoNumeria(actual, correcto, timeMs, protegido)
      .then((res) => {
        if (res.xp > 0) {
          xpRef.current += res.xp;
          const fid = ++flotanteId.current;
          setFlotantes((f) => [...f, { id: fid, texto: `+${res.xp}` }]);
          setTimeout(() => setFlotantes((f) => f.filter((x) => x.id !== fid)), 1100);
        }
        if (!dueloId && res.nivel != null) {
          if (res.nivel > actual.nivel) {
            setAviso(`¡Subiste a nivel ${res.nivel}!`);
            sonar("nivel");
            vibrar.fuerte();
            setTimeout(() => setAviso(null), 1500);
          }
          nivelesRef.current = { ...nivelesRef.current, [actual.problemType]: res.nivel };
        }
      })
      .catch(() => undefined);
    pendientesRef.current.push(guardado);

    setTimeout(
      () => {
        ocupadoRef.current = false;
        if (terminadoRef.current) return;
        if (respuestasRef.current.length >= TOTAL) {
          terminar("listo");
          return;
        }
        if (Date.now() - inicioRef.current >= DURACION_SPRINT_MS) {
          terminar("tiempo");
          return;
        }
        setProblema(siguiente());
        limpiarEntrada();
        setFeedback("idle");
        mostradoEnRef.current = Date.now();
      },
      correcto ? FEEDBACK_OK_MS : FEEDBACK_ERROR_MS
    );
  }

  if (!problema || !listo) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro]}>
        <Glifos glifos={NUMERIA.glifos} acento={NUMERIA.neon} />
        <ActivityIndicator color={NUMERIA.neon} size="large" />
        <Texto v="nota">Preparando problemas…</Texto>
      </SafeAreaView>
    );
  }

  const r = problema.respuesta;
  const bloqueado = feedback !== "idle" || inicio == null || final !== null;
  const teclaIzquierda = r.tipo === "fraccion" ? "/" : seccion === "decimales" ? "," : "−";
  const colorEstado = feedback === "correcto" ? color.correcto : feedback === "incorrecto" ? color.error : NUMERIA.neon;
  const puedeEnviar = r.tipo === "fraccion" ? num !== "" && den !== "" : respuesta !== "" && respuesta !== "-" && respuesta !== ",";

  function tecla(d: string) {
    if (r.tipo === "fraccion") {
      if (campo === "num") setNum((x) => (x.length >= 4 ? x : x + d));
      else setDen((x) => (x.length >= 4 ? x : x + d));
    } else setRespuesta((x) => (x.replace(/[-,]/g, "").length >= 9 ? x : x + d));
  }
  function borrar() {
    if (r.tipo === "fraccion") {
      if (campo === "den" && den === "") setCampo("num");
      else if (campo === "den") setDen((x) => x.slice(0, -1));
      else setNum((x) => x.slice(0, -1));
    } else setRespuesta((x) => x.slice(0, -1));
  }
  function izquierda() {
    if (r.tipo === "fraccion") setCampo((c) => (c === "num" ? "den" : "num"));
    else if (teclaIzquierda === ",") setRespuesta((x) => (x.includes(",") ? x : (x === "" ? "0" : x) + ","));
    else setRespuesta((x) => (x.startsWith("-") ? x.slice(1) : "-" + x));
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <Glifos glifos={NUMERIA.glifos} acento={NUMERIA.neon} cantidad={8} pulso={pulso} />
      <Animated.View style={[{ flex: 1 }, estiloJuego]}>
        <Cabecera onSalir={confirmarSalida} reloj={reloj} combo={combo} acento={NUMERIA.neon} corriendo={inicio != null && final === null} />
        <Progreso resultados={resultados} total={TOTAL} acento={NUMERIA.neon} escudos={escudos} />
        {duelo && (
          <BarraRival nombre={duelo.rivalNombre} total={TOTAL} yo={resultados.length} inicio={inicio} respuestasFantasma={duelo.rivalYaJugo ? duelo.rivalRespuestas : null} enVivo={rivalVivo?.respondidos ?? null} />
        )}

        <View style={styles.zona}>
          <TarjetaProblema acento={NUMERIA.neon} combo={combo} feedback={feedback} sello={sello} sacudida={sacudida}>
            <Texto v="micro" c={NUMERIA.neon}>
              {SECCION_POR_ID[seccion].temas.find((t) => t.problemType === problema.problemType)?.nombre ?? SECCION_POR_ID[seccion].nombre} · Nv {problema.nivel}
            </Texto>
            {problema.grande ? (
              <Texto v="numero" adjustsFontSizeToFit numberOfLines={1}>
                {problema.texto}
              </Texto>
            ) : (
              <Texto style={{ fontFamily: fuente.display, fontSize: 24, lineHeight: 31, color: color.texto, textAlign: "center" }}>{problema.texto}</Texto>
            )}
            {r.tipo === "fraccion" ? (
              <View style={styles.fraccion}>
                {(["num", "den"] as const).map((c, i) => (
                  <View key={c} style={styles.filaFraccion}>
                    {i === 1 && <Texto style={{ fontFamily: fuente.mono, fontSize: 30, color: color.texto2 }}>/</Texto>}
                    <Pressable onPress={() => setCampo(c)} style={[styles.casilla, campo === c && feedback === "idle" && { borderColor: NUMERIA.neon, boxShadow: brillo(NUMERIA.neon, 10, 0.35) }]}>
                      <Texto style={{ fontFamily: fuente.mono, fontSize: 30, color: colorEstado }}>{(c === "num" ? num : den) || " "}</Texto>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : r.tipo === "numero" ? (
              <Texto
                style={{
                  fontFamily: fuente.mono,
                  fontSize: 32,
                  letterSpacing: 4,
                  minHeight: 40,
                  color: colorEstado,
                  textDecorationLine: feedback === "incorrecto" ? "line-through" : "none",
                }}
              >
                {respuesta === "" ? "_" : respuesta}
              </Texto>
            ) : null}
            {feedback === "incorrecto" && (
              <Texto v="fuerte" c={color.correcto}>
                Era {problema.solucion}
              </Texto>
            )}
            {flotantes.map((f) => (
              <Flotante key={f.id} texto={f.texto} />
            ))}
          </TarjetaProblema>
          {aviso && (
            <Texto v="h3" c={color.logro} centro>
              {aviso}
            </Texto>
          )}
        </View>

        <Animated.View style={[styles.teclado, estiloTeclado]}>
          {r.tipo === "comparar" ? (
            <View style={styles.comparar}>
              {(["<", "=", ">"] as const).map((op) => (
                <Pressable
                  key={op}
                  disabled={bloqueado}
                  onPress={() => {
                    vibrar.seleccion();
                    responder({ texto: "", comparacion: op });
                  }}
                  style={({ pressed }) => [styles.botonComparar, pressed && { transform: [{ scale: 0.95 }], backgroundColor: conAlfa(NUMERIA.base, 0.3) }]}
                >
                  <Texto style={{ fontFamily: fuente.mono, fontSize: 40, color: color.texto }}>{op}</Texto>
                </Pressable>
              ))}
            </View>
          ) : (
            <>
              <Teclado deshabilitado={bloqueado} onDigito={tecla} onBorrar={borrar} onMenos={izquierda} teclaIzquierda={teclaIzquierda} />
              <Boton3D
                titulo="Listo"
                acento={NUMERIA.base}
                silencioso
                deshabilitado={bloqueado || !puedeEnviar}
                onPress={() => responder({ texto: respuesta, num, den })}
              />
            </>
          )}
        </Animated.View>
      </Animated.View>

      {!dueloId && inicio == null && <CuentaInicio acento={NUMERIA.neon} onListo={arrancar} />}
      {final && <CartelFinal texto={final === "tiempo" ? "¡Tiempo!" : "¡Listo!"} nota={dueloId ? "Comparando con tu rival…" : "Contando tus recompensas…"} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bgHondo },
  centro: { alignItems: "center", justifyContent: "center", gap: 14 },
  zona: { flex: 1, justifyContent: "center", paddingHorizontal: 16, gap: 10 },
  teclado: { paddingHorizontal: 16, paddingBottom: 10, gap: 6 },
  fraccion: { flexDirection: "row", alignItems: "center", gap: 6 },
  filaFraccion: { flexDirection: "row", alignItems: "center", gap: 6 },
  casilla: { minWidth: 72, height: 54, borderRadius: 14, borderWidth: 2, borderColor: color.border, backgroundColor: color.surface2, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  comparar: { flexDirection: "row", gap: 10, paddingBottom: 20 },
  botonComparar: { flex: 1, height: 96, borderRadius: 20, borderWidth: 2, borderColor: conAlfa(NUMERIA.neon, 0.5), backgroundColor: color.surface2, alignItems: "center", justifyContent: "center" },
});
