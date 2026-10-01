import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { obtenerDuelo, registrarResultadoDuelo, type InfoDuelo } from "~/lib/competir";
import { useProgresoEnVivo } from "~/lib/duelos";
import { sonar, sonarAcierto, vibrar } from "~/lib/efectos";
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
import Glifos from "~/ui/Glifos";
import MapaGeografia from "~/ui/MapaGeografia";
import { animarAcierto, animarError, BarraRival, Cabecera, Flotante, Progreso, TarjetaProblema } from "~/ui/Sprint";
import Texto from "~/ui/Texto";
import { brillo, color, conAlfa, fuente, MUNDO_POR_SLUG } from "~/tema";

const GEOGRAFIA = MUNDO_POR_SLUG.geografia;
const FEEDBACK_OK_MS = 650;
const FEEDBACK_ERROR_MS = 1300;

export default function SprintGeografia() {
  const router = useRouter();
  const { sesion } = useSesion();
  const miId = sesion?.user.id ?? null;
  const params = useLocalSearchParams<{ continente?: string; duelo?: string }>();
  const dueloId = params.duelo ?? null;
  const [continente, setContinente] = useState<Continente>((CONTINENTES.some((c) => c.id === params.continente) ? params.continente : "america") as Continente);
  const nombreContinente = CONTINENTES.find((c) => c.id === continente)!.nombre;

  const [duelo, setDuelo] = useState<InfoDuelo | null>(null);
  const [pregunta, setPregunta] = useState<Pregunta | null>(null);
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const [respondido, setRespondido] = useState(false);
  const [restanteMs, setRestanteMs] = useState(DURACION_SPRINT_GEO_MS);
  const [resultados, setResultados] = useState<boolean[]>([]);
  const [combo, setCombo] = useState(0);
  const [escudos, setEscudos] = useState(ESCUDOS_POR_PARTIDA);
  const [aviso, setAviso] = useState<string | null>(null);
  const [cerrando, setCerrando] = useState(false);
  const [flotantes, setFlotantes] = useState<{ id: number; texto: string }[]>([]);
  const [fantasmaRespondidos, setFantasmaRespondidos] = useState(0);

  const sello = useSharedValue(1);
  const sacudida = useSharedValue(0);
  const pulso = useSharedValue(0);

  const continenteRef = useRef(continente);
  const nivelRef = useRef(1);
  const escudosRef = useRef(ESCUDOS_POR_PARTIDA);
  const usadosRef = useRef(new Set<string>());
  const inicioRef = useRef(0);
  const mostradaEnRef = useRef(0);
  const terminadoRef = useRef(false);
  const ocupadoRef = useRef(false);
  const pendientesRef = useRef<Promise<unknown>[]>([]);
  const xpRef = useRef(0);
  const respuestasRef = useRef<{ correct: boolean; timeMs: number }[]>([]);
  const comboRef = useRef(0);
  const flotanteId = useRef(0);

  const { rival: rivalVivo, emitir } = useProgresoEnVivo(dueloId && duelo && !duelo.rivalYaJugo ? dueloId : null, miId);

  function nuevaPregunta() {
    const p = siguientePregunta(continenteRef.current, nivelRef.current, usadosRef.current);
    if (p) usadosRef.current.add(p.id);
    setPregunta(p);
    setSeleccionId(null);
    setRespondido(false);
    mostradaEnRef.current = Date.now();
  }

  useEffect(() => {
    if (!miId) return;
    let cancelado = false;
    (async () => {
      if (dueloId) {
        const d = await obtenerDuelo(dueloId, miId);
        if (!d || d.estado !== "pendiente") {
          Alert.alert("Duelo no disponible", "Este duelo ya terminó.", [{ text: "Volver", onPress: () => router.back() }]);
          return;
        }
        setDuelo(d);
        const c = (d.subTipo as Continente | null) ?? "america";
        continenteRef.current = c;
        setContinente(c);
      }
      const niveles = await cargarNivelesGeografia(miId);
      if (cancelado) return;
      nivelRef.current = niveles[continenteRef.current];
      inicioRef.current = Date.now();
      sonar("ya");
      nuevaPregunta();
    })();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [miId]);

  useEffect(() => {
    if (!pregunta || terminadoRef.current) return;
    const acumulado = (duelo?.rivalRespuestas ?? []).reduce<number[]>((acc, r) => [...acc, (acc[acc.length - 1] ?? 0) + r.timeMs], []);
    const id = setInterval(() => {
      const pasado = Date.now() - inicioRef.current;
      const restante = Math.max(0, DURACION_SPRINT_GEO_MS - pasado);
      setRestanteMs(restante);
      if (acumulado.length) setFantasmaRespondidos(acumulado.filter((t) => t <= pasado).length);
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

  async function terminar() {
    if (terminadoRef.current) return;
    terminadoRef.current = true;
    setCerrando(true);
    vibrar.exito();
    await Promise.allSettled(pendientesRef.current);
    try {
      const r = await cerrarPartida(xpRef.current, "geografia", dueloId ?? undefined);
      const correctos = respuestasRef.current.filter((x) => x.correct).length;
      const total = Math.max(PREGUNTAS_POR_PARTIDA, respuestasRef.current.length);
      let resultadoDuelo = null;
      if (dueloId && duelo) {
        const tiempos = respuestasRef.current.map((x) => x.timeMs);
        resultadoDuelo = await registrarResultadoDuelo(dueloId, correctos / total, tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : 0, xpRef.current, respuestasRef.current);
        if (duelo.serieId) {
          router.replace({ pathname: "/duelo/serie/[id]", params: { id: duelo.serieId } });
          return;
        }
      }
      router.replace({
        pathname: "/resultado",
        params: {
          mundo: "geografia",
          tema: continenteRef.current,
          repetir: dueloId ? "" : JSON.stringify({ pathname: "/geografia/sprint", params: { continente: continenteRef.current } }),
          datos: JSON.stringify({ ...r, xp: xpRef.current, correctos, total, tiempoMs: Date.now() - inicioRef.current, duelo: resultadoDuelo, rival: duelo?.rivalNombre ?? null }),
        },
      });
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
    respuestasRef.current.push({ correct: correcto, timeMs });
    setSeleccionId(id);
    setRespondido(true);
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
    emitir({ respondidos: respuestasRef.current.length, correctos: respuestasRef.current.filter((x) => x.correct).length, racha: comboRef.current });

    // Igual que la web: los primeros 2 errores de la partida no bajan el nivel.
    let protegido = false;
    if (!correcto && escudosRef.current > 0) {
      protegido = true;
      escudosRef.current -= 1;
      setEscudos(escudosRef.current);
    }

    const guardado = guardarIntentoTipo(`geografia_${continenteRef.current}`, pregunta.dificultad, correcto, timeMs, protegido)
      .then((res) => {
        if (res.xp > 0) {
          xpRef.current += res.xp;
          const fid = ++flotanteId.current;
          setFlotantes((f) => [...f, { id: fid, texto: `+${res.xp}` }]);
          setTimeout(() => setFlotantes((f) => f.filter((x) => x.id !== fid)), 1200);
        }
        if (res.nivel != null) {
          if (res.nivel > nivelRef.current) {
            setAviso(`¡Subiste a nivel ${res.nivel} en ${nombreContinente}!`);
            sonar("nivel");
            vibrar.fuerte();
            setTimeout(() => setAviso(null), 1500);
          }
          nivelRef.current = res.nivel;
        }
      })
      .catch(() => undefined);
    pendientesRef.current.push(guardado);

    setTimeout(
      () => {
        ocupadoRef.current = false;
        if (terminadoRef.current) return;
        if (respuestasRef.current.length >= PREGUNTAS_POR_PARTIDA || Date.now() - inicioRef.current >= DURACION_SPRINT_GEO_MS) terminar();
        else nuevaPregunta();
      },
      correcto ? FEEDBACK_OK_MS : FEEDBACK_ERROR_MS
    );
  }

  if (!pregunta || cerrando) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro]}>
        <Glifos glifos={GEOGRAFIA.glifos} acento={GEOGRAFIA.neon} />
        <ActivityIndicator color={GEOGRAFIA.neon} size="large" />
        <Texto v="nota">{cerrando ? (dueloId ? "Comparando con tu rival…" : "Guardando tu partida…") : "Desplegando el mapa…"}</Texto>
      </SafeAreaView>
    );
  }

  const avanzada = esPreguntaAvanzada(pregunta);
  const acerto = respondido && seleccionId === pregunta.id;
  const nombreElegido = respondido && seleccionId && !avanzada ? nombrePais(continente, seleccionId) : null;
  const rivalRespondidos = duelo?.rivalYaJugo ? fantasmaRespondidos : rivalVivo?.respondidos ?? null;
  const feedback = !respondido ? "idle" : acerto ? "correcto" : "incorrecto";

  return (
    <SafeAreaView style={styles.pantalla}>
      <Glifos glifos={GEOGRAFIA.glifos} acento={GEOGRAFIA.neon} cantidad={7} pulso={pulso} />
      <Cabecera onSalir={confirmarSalida} restanteMs={restanteMs} totalMs={DURACION_SPRINT_GEO_MS} combo={combo} acento={GEOGRAFIA.neon} />
      <Progreso resultados={resultados} total={PREGUNTAS_POR_PARTIDA} acento={GEOGRAFIA.neon} escudos={escudos} />
      {duelo && rivalRespondidos != null && (
        <BarraRival nombre={duelo.rivalNombre} respondidos={rivalRespondidos} total={PREGUNTAS_POR_PARTIDA} yo={resultados.length} fantasma={duelo.rivalYaJugo} />
      )}

      <ScrollView contentContainerStyle={styles.zona} scrollEnabled={avanzada}>
        <TarjetaProblema acento={GEOGRAFIA.neon} combo={combo} feedback={feedback} sello={sello} sacudida={sacudida}>
          <Texto v="micro" c={GEOGRAFIA.neon}>
            {nombreContinente}
          </Texto>
          <Texto style={{ fontFamily: fuente.display, fontSize: 23, lineHeight: 29, color: color.texto, textAlign: "center" }}>
            {avanzada ? (
              pregunta.pregunta
            ) : (
              <>
                ¿Dónde está <Texto style={{ fontFamily: fuente.display, fontSize: 23, color: GEOGRAFIA.neon }}>{pregunta.nombre}</Texto>?
              </>
            )}
          </Texto>
          {flotantes.map((f) => (
            <Flotante key={f.id} texto={f.texto} />
          ))}
        </TarjetaProblema>

        {avanzada ? (
          <View style={{ gap: 10 }}>
            {pregunta.opciones.map((o, i) => {
              const esCorrecta = respondido && o.id === pregunta.id;
              const esIncorrecta = respondido && o.id === seleccionId && o.id !== pregunta.id;
              return (
                <Animated.View key={o.id} entering={FadeInDown.delay(i * 60).springify()}>
                  <Pressable
                    disabled={respondido}
                    onPress={() => {
                      vibrar.seleccion();
                      responder(o.id);
                    }}
                    style={({ pressed }) => [
                      styles.opcion,
                      pressed && { transform: [{ scale: 0.97 }] },
                      esCorrecta && { borderColor: color.correcto, backgroundColor: conAlfa(color.correcto, 0.15), boxShadow: brillo(color.correcto, 16, 0.4) },
                      esIncorrecta && { borderColor: color.error, backgroundColor: conAlfa(color.error, 0.15) },
                    ]}
                  >
                    <Texto v="fuerte" centro>
                      {o.texto}
                    </Texto>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        ) : (
          <MapaGeografia continente={continente} acento={GEOGRAFIA.neon} objetivoId={pregunta.id} seleccionId={seleccionId} respondido={respondido} onElegir={responder} />
        )}

        <View style={styles.feedback}>
          {respondido && (
            <Texto v="h3" c={acerto ? color.correcto : color.error} centro>
              {acerto ? "¡Correcto!" : nombreElegido ? `Tocaste ${nombreElegido}. Era ${pregunta.nombre}.` : `Era ${pregunta.nombre}.`}
            </Texto>
          )}
          {aviso && (
            <Texto v="h3" c={color.logro} centro>
              {aviso}
            </Texto>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bgHondo },
  centro: { alignItems: "center", justifyContent: "center", gap: 14 },
  zona: { padding: 16, gap: 12, flexGrow: 1, justifyContent: "center" },
  opcion: { borderWidth: 2, borderColor: color.border, backgroundColor: color.surface1, borderRadius: 16, padding: 16 },
  feedback: { minHeight: 48, gap: 4 },
});
