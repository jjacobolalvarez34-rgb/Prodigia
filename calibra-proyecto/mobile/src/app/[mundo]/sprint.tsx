import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, ScrollView, StyleSheet } from "react-native";
import Animated, { useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { mulberry32 } from "@/lib/rng";
import { obtenerDuelo, registrarResultadoDuelo, type InfoDuelo } from "~/lib/competir";
import { useProgresoEnVivo } from "~/lib/duelos";
import { sonar, sonarAcierto, vibrar } from "~/lib/efectos";
import { cargarNivelesMundo, mundoJugable, problemTypeDe, type PreguntaMundo } from "~/lib/mundosJugables";
import { cerrarPartida, guardarIntentoTipo } from "~/lib/partida";
import { useSesion } from "~/lib/sesion";
import { mensajeError, supabase } from "~/lib/supabase";
import Glifos from "~/ui/Glifos";
import { animarAcierto, animarError, BarraRival, Cabecera, CartelFinal, Consumibles, CuentaInicio, Flotante, Progreso, TarjetaProblema, useConsumibles, useReloj, useSalida } from "~/ui/Sprint";
import { CuerpoPregunta, esRespuestaCorrecta, OpcionesPregunta, TecladoPregunta, type Feedback } from "~/ui/PreguntaVista";
import Texto from "~/ui/Texto";
import { color, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";

const FEEDBACK_OK_MS = 550;
const FEEDBACK_ERROR_MS = 1100;

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
        cargarNivelesMundo(def, miId),
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
  const consumibles = useConsumibles(!dueloId && inicio != null);

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
    const timeMs = Date.now() - mostradoEnRef.current;
    const correcto = esRespuestaCorrecta(pregunta, valor);
    setSeleccion(valor);
    const modoP = def.modoDePregunta ? def.modoDePregunta(pregunta, modoRef.current) : modoRef.current;
    const nivel = pregunta.nivel ?? nivelPara(modoP);
    if (correcto) reloj.bonus(nivel, timeMs);
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

  const bloqueado = feedback !== "idle" || inicio == null || final !== null || memorizando;

  return (
    <SafeAreaView style={styles.pantalla}>
      <Glifos glifos={mundo.glifos} acento={mundo.neon} cantidad={7} pulso={pulso} />
      <Animated.View style={[{ flex: 1 }, estiloJuego]}>
        <Cabecera onSalir={confirmarSalida} reloj={reloj} combo={combo} acento={mundo.neon} corriendo={inicio != null && final === null && !memorizando} />
        <Progreso resultados={resultados} total={total} acento={mundo.neon} escudos={escudos} />
        <Consumibles reloj={reloj} consumibles={consumibles} deshabilitado={final !== null || memorizando} />
        {duelo && (
          <BarraRival nombre={duelo.rivalNombre} total={total} yo={resultados.length} inicio={inicio} respuestasFantasma={duelo.rivalYaJugo ? duelo.rivalRespuestas : null} enVivo={rivalVivo?.respondidos ?? null} />
        )}

        <ScrollView contentContainerStyle={styles.zona} showsVerticalScrollIndicator={false}>
          <TarjetaProblema acento={mundo.neon} combo={combo} feedback={feedback} sello={sello} sacudida={sacudida}>
            <Texto v="micro" c={mundo.neon}>
              {def.modos.find((m) => m.id === modo)?.nombre ?? mundo.nombre} · Nv {nivelVisible}
            </Texto>
            <CuerpoPregunta
              pregunta={pregunta}
              acento={mundo.neon}
              memorizando={memorizando}
              onMemoriaLista={() => {
                setMemorizando(false);
                mostradoEnRef.current = Date.now();
              }}
              feedback={feedback}
              respuesta={respuesta}
            />
            {flotantes.map((f) => (
              <Flotante key={f.id} texto={f.texto} />
            ))}
          </TarjetaProblema>
          {aviso && (
            <Texto v="h3" c={color.logro} centro>
              {aviso}
            </Texto>
          )}

          {!memorizando && (
            <OpcionesPregunta pregunta={pregunta} feedback={feedback} seleccion={seleccion} bloqueado={bloqueado} base={mundo.base} onResponder={responder} estilo={estiloTeclado} />
          )}
        </ScrollView>

        {!memorizando && (
          <TecladoPregunta pregunta={pregunta} bloqueado={bloqueado} respuesta={respuesta} setRespuesta={setRespuesta} base={mundo.base} onListo={() => responder(respuesta)} estilo={estiloTeclado} />
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
});
