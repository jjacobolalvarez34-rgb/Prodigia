import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { mulberry32 } from "@/lib/rng";
import { obtenerDuelo, registrarResultadoDuelo, type InfoDuelo } from "~/lib/competir";
import { useProgresoEnVivo } from "~/lib/duelos";
import { sonar, sonarAcierto, vibrar } from "~/lib/efectos";
import { mundoJugable, problemTypeDe, type PreguntaMundo } from "~/lib/mundosJugables";
import type { Memoria } from "~/lib/mundosJugables/tipos";
import { cerrarPartida, guardarIntentoTipo } from "~/lib/partida";
import { useSesion } from "~/lib/sesion";
import { mensajeError, supabase } from "~/lib/supabase";
import Barra from "~/ui/Barra";
import Boton3D from "~/ui/Boton3D";
import Glifos from "~/ui/Glifos";
import { animarAcierto, animarError, BarraRival, Cabecera, CartelFinal, CuentaInicio, Flotante, Progreso, TarjetaProblema, Teclado, useReloj, useSalida } from "~/ui/Sprint";
import Texto from "~/ui/Texto";
import { textoConFormulas } from "~/ui/TextoMate";
import Carta, { Dorso } from "~/ui/visuales/Carta";
import Esqueleto from "~/ui/visuales/Esqueleto";
import { subindices } from "~/ui/visuales/Molecula";
import VisualPregunta from "~/ui/visuales/VisualPregunta";
import { brillo, color, conAlfa, fuente, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";

const FEEDBACK_OK_MS = 550;
const FEEDBACK_ERROR_MS = 1100;

type Feedback = "idle" | "correcto" | "incorrecto";

function mostrar(texto: string, formato: PreguntaMundo["formato"]): string {
  if (formato === "formulas") return textoConFormulas(texto);
  if (formato === "quimica") return subindices(texto);
  return texto;
}

// Fase de memorizar: la lista entera (Enigmia) o las cartas de a una (Naipia).
function FaseMemoria({ memoria, acento, onListo }: { memoria: Memoria; acento: string; onListo: () => void }) {
  const [visible, setVisible] = useState<number | null>(null);
  const onListoRef = useRef(onListo);
  useEffect(() => {
    onListoRef.current = onListo;
  }, [onListo]);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (memoria.tipo === "lista") {
      timers.push(setTimeout(() => onListoRef.current(), memoria.ms));
    } else {
      const inicio = 900;
      memoria.cartas.forEach((_, i) => timers.push(setTimeout(() => setVisible(i), inicio + i * memoria.msPorCarta)));
      timers.push(setTimeout(() => onListoRef.current(), inicio + memoria.cartas.length * memoria.msPorCarta));
    }
    return () => timers.forEach(clearTimeout);
  }, [memoria]);
  const duracion = memoria.tipo === "lista" ? memoria.ms : 900 + memoria.cartas.length * memoria.msPorCarta;
  return (
    <View style={{ alignItems: "center", gap: 14, alignSelf: "stretch" }}>
      <Texto v="micro" c={acento}>
        Memoriza
      </Texto>
      {memoria.tipo === "lista" ? (
        <View style={styles.lista}>
          {memoria.items.map((it, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(i * 110).duration(260)} style={[styles.itemMemoria, { borderColor: acento }]}>
              <Texto style={{ fontFamily: fuente.display, fontSize: 18, color: acento }}>{it}</Texto>
            </Animated.View>
          ))}
        </View>
      ) : (
        <View style={{ alignItems: "center", gap: 10 }}>
          <View style={{ height: 118, justifyContent: "center" }}>
            {visible == null ? (
              <Dorso tam={78} acento={acento} />
            ) : (
              <Animated.View key={visible} entering={FadeIn.duration(120)}>
                <Carta valor={memoria.cartas[visible].valor} palo={memoria.cartas[visible].palo} tam={78} />
              </Animated.View>
            )}
          </View>
          <Texto v="nota">
            Carta {visible == null ? 0 : visible + 1} de {memoria.cartas.length}
          </Texto>
        </View>
      )}
      <Barra valor={0} duracion={duracion} acento={acento} estilo={{ alignSelf: "stretch" }} />
    </View>
  );
}

export default function SprintMundo() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mundo: string; modo?: string; duelo?: string; filtro?: string }>();
  const def = mundoJugable(params.mundo);
  const mundo = MUNDO_POR_SLUG[(params.mundo ?? "historia") as MundoSlug];
  const { sesion } = useSesion();
  const miId = sesion?.user.id ?? null;
  const dueloId = params.duelo ?? null;
  const total = def?.total ?? 10;
  const duracion = def?.duracionMs ?? 60_000;

  const [modo, setModo] = useState(params.modo ?? def?.modos[0]?.id ?? "");
  const [duelo, setDuelo] = useState<InfoDuelo | null>(null);
  const [listo, setListo] = useState(false);
  const [inicio, setInicio] = useState<number | null>(null);
  const [pregunta, setPregunta] = useState<PreguntaMundo | null>(null);
  const [memorizando, setMemorizando] = useState(false);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [resultados, setResultados] = useState<boolean[]>([]);
  const [combo, setCombo] = useState(0);
  const [escudos, setEscudos] = useState(0);
  const [nivelVisible, setNivelVisible] = useState(1);
  const [flotantes, setFlotantes] = useState<{ id: number; texto: string }[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const [final, setFinal] = useState<"tiempo" | "listo" | null>(null);

  const sello = useSharedValue(1);
  const sacudida = useSharedValue(0);
  const pulso = useSharedValue(0);
  const { estiloJuego, estiloTeclado, salir } = useSalida();

  const modoRef = useRef(modo);
  const nivelesRef = useRef<Record<string, number>>({});
  const nivelForzadoRef = useRef<number | null>(null);
  const contextoRef = useRef<unknown>(null);
  const rngRef = useRef<(() => number) | undefined>(undefined);
  const usadosRef = useRef(new Set<string>());
  const mostradoEnRef = useRef(0);
  const inicioRef = useRef(0);
  const terminadoRef = useRef(false);
  const ocupadoRef = useRef(false);
  const pendientesRef = useRef<Promise<unknown>[]>([]);
  const xpRef = useRef(0);
  const respuestasRef = useRef<{ correct: boolean; timeMs: number }[]>([]);
  const escudosRef = useRef(0);
  const comboRef = useRef(0);
  const flotanteId = useRef(0);

  const { rival: rivalVivo, emitir } = useProgresoEnVivo(dueloId && duelo && !duelo.rivalYaJugo ? dueloId : null, miId);

  function nivelPara(m: string) {
    return nivelForzadoRef.current ?? nivelesRef.current[m] ?? 1;
  }

  function nuevaPregunta() {
    if (!def) return;
    const p = def.generar(modoRef.current, nivelPara(modoRef.current), usadosRef.current, contextoRef.current, rngRef.current, params.filtro || undefined, nivelForzadoRef.current == null ? nivelesRef.current : undefined);
    usadosRef.current.add(p.clave);
    if (usadosRef.current.size > 300) usadosRef.current = new Set();
    const modoP = def.modoDePregunta ? def.modoDePregunta(p, modoRef.current) : modoRef.current;
    setNivelVisible(p.nivel ?? nivelPara(modoP));
    setPregunta(p);
    setSeleccion(null);
    setRespuesta("");
    setFeedback("idle");
    if (p.memoria) setMemorizando(true);
    else {
      setMemorizando(false);
      mostradoEnRef.current = Date.now();
    }
  }

  useEffect(() => {
    if (!miId || !def) return;
    let cancelado = false;
    (async () => {
      const [niveles, contexto] = await Promise.all([
        def.cargarNiveles
          ? def.cargarNiveles(miId)
          : Promise.resolve(supabase.from("skill_levels").select("problem_type, nivel").eq("user_id", miId).like("problem_type", `${def.slug}_%`)).then(({ data }) => {
              const r: Record<string, number> = {};
              for (const m of def.modos) r[m.id] = ((data ?? []) as { problem_type: string; nivel: number }[]).find((f) => f.problem_type === problemTypeDe(def, m.id))?.nivel ?? 1;
              return r;
            }),
        def.preparar ? def.preparar() : Promise.resolve(null),
      ]);
      nivelesRef.current = niveles;
      contextoRef.current = contexto;
      if (dueloId) {
        const d = await obtenerDuelo(dueloId, miId);
        if (!d || d.estado !== "pendiente") {
          Alert.alert("Duelo no disponible", "Este duelo ya terminó.", [{ text: "Volver", onPress: () => router.back() }]);
          return;
        }
        setDuelo(d);
        if (d.subTipo && def.modos.some((m) => m.id === d.subTipo)) {
          modoRef.current = d.subTipo;
          setModo(d.subTipo);
        }
        nivelForzadoRef.current = d.nivel || 5;
        rngRef.current = mulberry32(d.semilla);
      } else {
        const { data } = await supabase.from("profiles").select("escudos_extra_pendientes").eq("id", miId).single();
        const extra = (data as { escudos_extra_pendientes: number } | null)?.escudos_extra_pendientes ?? 0;
        if (extra > 0) await supabase.rpc("consumir_escudos_pendientes");
        escudosRef.current = (def.escudosBase ?? 2) + extra;
        setEscudos(escudosRef.current);
      }
      if (cancelado) return;
      setListo(true);
      nuevaPregunta();
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
  const reloj = useReloj(inicio, duracion, alAcabarElTiempo, final !== null, memorizando);

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
    if (terminadoRef.current || !def) return;
    terminadoRef.current = true;
    setFinal(motivo);
    sonar(motivo === "tiempo" ? "cuenta" : "ya");
    vibrar.exito();
    salir();
    const minimo = new Promise((r) => setTimeout(r, 1100));
    await Promise.allSettled(pendientesRef.current);
    try {
      const r = await cerrarPartida(xpRef.current, def.slug, dueloId ?? undefined);
      const correctos = respuestasRef.current.filter((x) => x.correct).length;
      const tot = Math.max(total, respuestasRef.current.length);
      let resultadoDuelo = null;
      if (dueloId && duelo) {
        const tiempos = respuestasRef.current.map((x) => x.timeMs);
        resultadoDuelo = await registrarResultadoDuelo(dueloId, correctos / tot, tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : 0, xpRef.current, respuestasRef.current);
      }
      await minimo;
      if (dueloId && duelo?.serieId) {
        router.replace({ pathname: "/duelo/serie/[id]", params: { id: duelo.serieId } });
        return;
      }
      router.replace({
        pathname: "/resultado",
        params: {
          mundo: def.slug,
          tema: def.modos.find((m) => m.id === modoRef.current)?.nombre ?? "",
          repetir: dueloId ? "" : JSON.stringify({ pathname: "/[mundo]/sprint", params: { mundo: def.slug, modo: modoRef.current, filtro: params.filtro ?? "" } }),
          datos: JSON.stringify({ ...r, xp: xpRef.current, correctos, total: tot, tiempoMs: Math.min(duracion, Date.now() - inicioRef.current), duelo: resultadoDuelo, rival: duelo?.rivalNombre ?? null }),
        },
      });
    } catch (e) {
      Alert.alert("No se pudo cerrar la partida", mensajeError(e), [{ text: "Volver", onPress: () => router.back() }]);
    }
  }

  function responder(valor: string) {
    if (!pregunta || !def || ocupadoRef.current || terminadoRef.current || inicio == null || memorizando) return;
    ocupadoRef.current = true;
    const e = pregunta.entrada;
    const timeMs = Date.now() - mostradoEnRef.current;
    let correcto: boolean;
    if (e.tipo === "numero") {
      const n = Number(valor.replace(",", "."));
      correcto = Number.isFinite(n) && Math.abs(n - e.respuesta) <= e.tolerancia + 1e-9;
    } else if (e.tipo === "esqueleto") correcto = valor === e.objetivo;
    else correcto = valor === e.respuesta;
    setSeleccion(valor);
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

    const modoP = def.modoDePregunta ? def.modoDePregunta(pregunta, modoRef.current) : modoRef.current;
    const nivel = pregunta.nivel ?? nivelPara(modoP);
    const guardado = (def.guardar ? def.guardar(pregunta, modoP, nivel, correcto, timeMs, protegido) : guardarIntentoTipo(problemTypeDe(def, modoP), nivel, correcto, timeMs, protegido))
      .then((res) => {
        if (res.xp > 0) {
          xpRef.current += res.xp;
          const fid = ++flotanteId.current;
          setFlotantes((f) => [...f, { id: fid, texto: `+${res.xp}` }]);
          setTimeout(() => setFlotantes((f) => f.filter((x) => x.id !== fid)), 1100);
        }
        if (nivelForzadoRef.current == null && res.nivel != null) {
          if (res.nivel > (nivelesRef.current[modoP] ?? 1)) {
            setAviso(`¡Subiste a nivel ${res.nivel}!`);
            sonar("nivel");
            vibrar.fuerte();
            setTimeout(() => setAviso(null), 1500);
          }
          nivelesRef.current = { ...nivelesRef.current, [modoP]: res.nivel };
        }
      })
      .catch(() => undefined);
    pendientesRef.current.push(guardado);

    setTimeout(
      () => {
        ocupadoRef.current = false;
        if (terminadoRef.current) return;
        if (respuestasRef.current.length >= total) terminar("listo");
        else if (reloj.restante() <= 0) terminar("tiempo");
        else nuevaPregunta();
      },
      correcto ? FEEDBACK_OK_MS : FEEDBACK_ERROR_MS
    );
  }

  if (!def) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro]}>
        <Texto v="h3">Este mundo todavía no está en la app.</Texto>
      </SafeAreaView>
    );
  }
  if (!pregunta || !listo) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro]}>
        <Glifos glifos={mundo.glifos} acento={mundo.neon} />
        <ActivityIndicator color={mundo.neon} size="large" />
        <Texto v="nota">Preparando preguntas…</Texto>
      </SafeAreaView>
    );
  }

  const e = pregunta.entrada;
  const bloqueado = feedback !== "idle" || inicio == null || final !== null || memorizando;
  const colorEstado = feedback === "correcto" ? color.correcto : feedback === "incorrecto" ? color.error : mundo.neon;
  const opcionesLargas = e.tipo === "opciones" && e.opciones.some((o) => o.length > 16);
  const solucion = pregunta.solucion ?? (e.tipo === "numero" ? String(e.respuesta).replace(".", ",") : e.respuesta);

  return (
    <SafeAreaView style={styles.pantalla}>
      <Glifos glifos={mundo.glifos} acento={mundo.neon} cantidad={7} pulso={pulso} />
      <Animated.View style={[{ flex: 1 }, estiloJuego]}>
        <Cabecera onSalir={confirmarSalida} reloj={reloj} combo={combo} acento={mundo.neon} corriendo={inicio != null && final === null && !memorizando} />
        <Progreso resultados={resultados} total={total} acento={mundo.neon} escudos={escudos} />
        {duelo && (
          <BarraRival nombre={duelo.rivalNombre} total={total} yo={resultados.length} inicio={inicio} respuestasFantasma={duelo.rivalYaJugo ? duelo.rivalRespuestas : null} enVivo={rivalVivo?.respondidos ?? null} />
        )}

        <ScrollView contentContainerStyle={styles.zona} showsVerticalScrollIndicator={false}>
          <TarjetaProblema acento={mundo.neon} combo={combo} feedback={feedback} sello={sello} sacudida={sacudida}>
            <Texto v="micro" c={mundo.neon}>
              {def.modos.find((m) => m.id === modo)?.nombre ?? mundo.nombre} · Nv {nivelVisible}
            </Texto>
            {memorizando && pregunta.memoria ? (
              <FaseMemoria
                key={pregunta.clave}
                memoria={pregunta.memoria}
                acento={mundo.neon}
                onListo={() => {
                  setMemorizando(false);
                  mostradoEnRef.current = Date.now();
                }}
              />
            ) : (
              <>
                {(pregunta.visuales ?? []).map((v, i) => (
                  <VisualPregunta key={i} visual={v} acento={mundo.neon} />
                ))}
                <Texto style={{ fontFamily: fuente.display, fontSize: pregunta.enunciado.length > 90 ? 17 : 20, color: color.texto, textAlign: "center" }}>
                  {mostrar(pregunta.enunciado, pregunta.formato)}
                </Texto>
                {e.tipo === "numero" && (
                  <Texto style={{ fontFamily: fuente.mono, fontSize: 30, letterSpacing: 3, color: colorEstado, textDecorationLine: feedback === "incorrecto" ? "line-through" : "none" }}>
                    {respuesta === "" ? "_" : respuesta}
                  </Texto>
                )}
                {feedback === "incorrecto" && (
                  <Texto v="fuerte" c={color.correcto} centro>
                    Era {mostrar(solucion, pregunta.formato)}
                  </Texto>
                )}
              </>
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

          {!memorizando && e.tipo === "esqueleto" && (
            <Animated.View style={estiloTeclado}>
              <Esqueleto objetivo={e.objetivo} respondido={feedback !== "idle"} seleccion={seleccion} onElegir={(h) => responder(h)} />
            </Animated.View>
          )}

          {!memorizando && e.tipo === "opciones" && (
            <Animated.View style={[opcionesLargas ? styles.listaOpciones : styles.grilla, estiloTeclado]}>
              {e.opciones.map((op, i) => {
                const esCorrecta = feedback !== "idle" && op === e.respuesta;
                const esMala = feedback !== "idle" && op === seleccion && op !== e.respuesta;
                return (
                  <Animated.View key={`${pregunta.clave}-${op}`} entering={FadeInDown.delay(60 + i * 50).duration(260)} style={opcionesLargas ? null : styles.celdaGrilla}>
                    <Pressable
                      disabled={bloqueado}
                      onPress={() => {
                        vibrar.seleccion();
                        responder(op);
                      }}
                      style={({ pressed }) => [
                        styles.opcion,
                        pressed && { transform: [{ scale: 0.97 }], backgroundColor: conAlfa(mundo.base, 0.25) },
                        esCorrecta && { borderColor: color.correcto, backgroundColor: conAlfa(color.correcto, 0.15), boxShadow: brillo(color.correcto, 16, 0.35) },
                        esMala && { borderColor: color.error, backgroundColor: conAlfa(color.error, 0.15) },
                      ]}
                    >
                      <Texto style={{ fontFamily: fuente.cuerpoFuerte, fontSize: op.length > 30 ? 13 : 15, color: color.texto, textAlign: "center" }}>{mostrar(op, pregunta.formato)}</Texto>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </Animated.View>
          )}
        </ScrollView>

        {!memorizando && e.tipo === "numero" && (
          <Animated.View style={[styles.teclado, estiloTeclado]}>
            <Teclado
              deshabilitado={bloqueado}
              teclaIzquierda={e.decimales ? "," : "−"}
              onDigito={(d) => setRespuesta((x) => (x.replace(/[-,]/g, "").length >= 8 ? x : x + d))}
              onBorrar={() => setRespuesta((x) => x.slice(0, -1))}
              onMenos={() => {
                if (e.decimales) setRespuesta((x) => (x.includes(",") ? x : (x === "" || x === "-" ? x + "0" : x) + ","));
                else setRespuesta((x) => (x.startsWith("-") ? x.slice(1) : "-" + x));
              }}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              {e.decimales && e.negativos && (
                <Boton3D titulo="±" variante="secundario" silencioso estilo={{ width: 70 }} deshabilitado={bloqueado} onPress={() => setRespuesta((x) => (x.startsWith("-") ? x.slice(1) : "-" + x))} />
              )}
              <Boton3D titulo="Listo" acento={mundo.base} silencioso estilo={{ flex: 1 }} deshabilitado={bloqueado || respuesta === "" || respuesta === "-"} onPress={() => responder(respuesta)} />
            </View>
          </Animated.View>
        )}
      </Animated.View>

      {!dueloId && inicio == null && <CuentaInicio acento={mundo.neon} onListo={arrancar} />}
      {final && <CartelFinal texto={final === "tiempo" ? "¡Tiempo!" : "¡Listo!"} nota={dueloId ? "Comparando con tu rival…" : "Contando tus recompensas…"} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bgHondo },
  centro: { alignItems: "center", justifyContent: "center", gap: 14 },
  zona: { padding: 16, gap: 12, flexGrow: 1, justifyContent: "center" },
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  celdaGrilla: { width: "48%" },
  listaOpciones: { gap: 9 },
  opcion: { minHeight: 58, borderWidth: 2, borderColor: color.border, backgroundColor: color.surface1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  teclado: { paddingHorizontal: 16, paddingBottom: 10, gap: 6 },
  lista: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  itemMemoria: { borderWidth: 2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
});
