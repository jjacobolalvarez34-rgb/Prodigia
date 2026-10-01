import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, StyleSheet, View } from "react-native";
import { useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { generarProblema } from "@/lib/practica/problems";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { mulberry32 } from "@/lib/rng";
import { obtenerDuelo, registrarResultadoDuelo, type InfoDuelo } from "~/lib/competir";
import { useProgresoEnVivo } from "~/lib/duelos";
import { sonar, sonarAcierto, vibrar } from "~/lib/efectos";
import { cargarNiveles, guardarIntento, nuevoProblema, textoProblema, type Operacion, type Problem } from "~/lib/numeria";
import { cerrarPartida } from "~/lib/partida";
import { useSesion } from "~/lib/sesion";
import { mensajeError, supabase } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import Glifos from "~/ui/Glifos";
import { animarAcierto, animarError, BarraRival, Cabecera, Flotante, Progreso, TarjetaProblema, Teclado } from "~/ui/Sprint";
import Texto from "~/ui/Texto";
import { color, fuente, NUMERIA } from "~/tema";

const DURACION_MS = 60_000;
const TOTAL = 10;
const FEEDBACK_OK_MS = 420;
const FEEDBACK_ERROR_MS = 1050;

type Feedback = "idle" | "correcto" | "incorrecto";

export default function Sprint() {
  const router = useRouter();
  const { sesion } = useSesion();
  const miId = sesion?.user.id ?? null;
  const params = useLocalSearchParams<{ ops?: string; duelo?: string }>();
  const dueloId = params.duelo ?? null;

  const [duelo, setDuelo] = useState<InfoDuelo | null>(null);
  const [operaciones, setOperaciones] = useState<Operacion[]>(((params.ops ?? "suma").split(",").filter(Boolean) as Operacion[]));
  const [problema, setProblema] = useState<Problem | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [restanteMs, setRestanteMs] = useState(DURACION_MS);
  const [resultados, setResultados] = useState<boolean[]>([]);
  const [combo, setCombo] = useState(0);
  const [flotantes, setFlotantes] = useState<{ id: number; texto: string; c: string }[]>([]);
  const [escudos, setEscudos] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [cerrando, setCerrando] = useState(false);
  const [fantasmaRespondidos, setFantasmaRespondidos] = useState(0);

  const sello = useSharedValue(1);
  const sacudida = useSharedValue(0);
  const pulso = useSharedValue(0);

  const nivelesRef = useRef<Record<Operacion, number> | null>(null);
  const usadosRef = useRef(new Set<string>());
  const rngRef = useRef<(() => number) | null>(null);
  const inicioRef = useRef(0);
  const mostradoEnRef = useRef(0);
  const terminadoRef = useRef(false);
  const ocupadoRef = useRef(false);
  const pendientesRef = useRef<Promise<unknown>[]>([]);
  const xpRef = useRef(0);
  const respuestasRef = useRef<{ correct: boolean; timeMs: number }[]>([]);
  const escudosRef = useRef(0);
  const comboRef = useRef(0);
  const flotanteId = useRef(0);

  const { rival: rivalVivo, emitir } = useProgresoEnVivo(dueloId && duelo && !duelo.rivalYaJugo ? dueloId : null, miId);

  function siguiente(ops: Operacion[]): Problem {
    const niveles = nivelesRef.current!;
    if (rngRef.current) {
      const rng = rngRef.current;
      const tipo = ops[0];
      return generarSinRepetir(() => generarProblema(tipo, niveles[tipo] ?? 1, undefined, rng), (p) => `${p.problemType}:${p.a}${p.symbol}${p.b}`, usadosRef.current);
    }
    return nuevoProblema(ops, niveles, usadosRef.current);
  }

  // Arranque: niveles reales (o el nivel fijo del duelo) → primer problema → reloj.
  useEffect(() => {
    if (!miId) return;
    let cancelado = false;
    (async () => {
      let ops = operaciones;
      let niveles = await cargarNiveles(miId);
      if (dueloId) {
        const d = await obtenerDuelo(dueloId, miId);
        if (!d || d.estado !== "pendiente") {
          Alert.alert("Duelo no disponible", "Este duelo ya terminó.", [{ text: "Volver", onPress: () => router.back() }]);
          return;
        }
        setDuelo(d);
        const op = (d.operacion ?? "suma") as Operacion;
        ops = [op];
        setOperaciones(ops);
        niveles = { ...niveles, [op]: d.nivel };
        rngRef.current = mulberry32(d.semilla);
      } else {
        const { data } = await supabase.from("profiles").select("escudos_extra_pendientes").eq("id", miId).single();
        const extra = (data as { escudos_extra_pendientes: number } | null)?.escudos_extra_pendientes ?? 0;
        if (extra > 0) await supabase.rpc("consumir_escudos_pendientes");
        escudosRef.current = extra;
        setEscudos(extra);
      }
      if (cancelado) return;
      nivelesRef.current = niveles;
      setProblema(siguiente(ops));
      inicioRef.current = Date.now();
      mostradoEnRef.current = Date.now();
      sonar("ya");
    })();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [miId]);

  // Reloj + fantasma (avanza al ritmo exacto de las respuestas guardadas del rival).
  useEffect(() => {
    if (!problema || terminadoRef.current) return;
    const acumulado = (duelo?.rivalRespuestas ?? []).reduce<number[]>((acc, r) => [...acc, (acc[acc.length - 1] ?? 0) + r.timeMs], []);
    const id = setInterval(() => {
      const pasado = Date.now() - inicioRef.current;
      const restante = Math.max(0, DURACION_MS - pasado);
      setRestanteMs(restante);
      if (acumulado.length) setFantasmaRespondidos(acumulado.filter((t) => t <= pasado).length);
      if (restante === 0 && !ocupadoRef.current) {
        clearInterval(id);
        terminar();
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problema !== null]);

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
    Alert.alert(
      "¿Salir de la partida?",
      dueloId ? "Si sales, el duelo queda sin tu resultado." : "Lo que ya respondiste queda guardado, pero la partida no se cierra ni suma al día.",
      [
        { text: "Seguir jugando", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: () => {
            terminadoRef.current = true;
            router.back();
          },
        },
      ]
    );
  }

  async function terminar() {
    if (terminadoRef.current) return;
    terminadoRef.current = true;
    setCerrando(true);
    vibrar.exito();
    await Promise.allSettled(pendientesRef.current);
    try {
      const r = await cerrarPartida(xpRef.current, "numeria", dueloId ?? undefined);
      const correctos = respuestasRef.current.filter((x) => x.correct).length;
      const total = Math.max(TOTAL, respuestasRef.current.length);
      let resultadoDuelo = null;
      if (dueloId && duelo) {
        const tiempos = respuestasRef.current.map((x) => x.timeMs);
        resultadoDuelo = await registrarResultadoDuelo(
          dueloId,
          correctos / total,
          tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : 0,
          xpRef.current,
          respuestasRef.current
        );
        if (duelo.serieId) {
          router.replace({ pathname: "/duelo/serie/[id]", params: { id: duelo.serieId } });
          return;
        }
      }
      router.replace({
        pathname: "/resultado",
        params: {
          mundo: "numeria",
          tema: operaciones.length === 1 ? operaciones[0] : "mezcla",
          repetir: dueloId ? "" : JSON.stringify({ pathname: "/numeria/sprint", params: { ops: operaciones.join(",") } }),
          datos: JSON.stringify({ ...r, xp: xpRef.current, correctos, total, tiempoMs: Date.now() - inicioRef.current, duelo: resultadoDuelo, rival: duelo?.rivalNombre ?? null }),
        },
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
    const n = respuestasRef.current.length;
    emitir({ respondidos: n, correctos: respuestasRef.current.filter((x) => x.correct).length, racha: comboRef.current });

    const guardado = guardarIntento(problema, correcto, timeMs, protegido)
      .then((res) => {
        if (res.xp > 0) {
          xpRef.current += res.xp;
          const fid = ++flotanteId.current;
          setFlotantes((f) => [...f, { id: fid, texto: `+${res.xp}`, c: color.correcto }]);
          setTimeout(() => setFlotantes((f) => f.filter((x) => x.id !== fid)), 1200);
        }
        if (!dueloId && res.nivel != null && nivelesRef.current) {
          const tipo = problema.problemType as Operacion;
          if (res.nivel > problema.nivel) {
            setAviso(`¡Subiste a nivel ${res.nivel}!`);
            sonar("nivel");
            vibrar.fuerte();
            setTimeout(() => setAviso(null), 1500);
          }
          nivelesRef.current = { ...nivelesRef.current, [tipo]: res.nivel };
        }
      })
      .catch(() => undefined);
    pendientesRef.current.push(guardado);

    setTimeout(
      () => {
        ocupadoRef.current = false;
        if (terminadoRef.current) return;
        if (respuestasRef.current.length >= TOTAL || Date.now() - inicioRef.current >= DURACION_MS) {
          terminar();
          return;
        }
        setProblema(siguiente(operaciones));
        setRespuesta("");
        setFeedback("idle");
        mostradoEnRef.current = Date.now();
      },
      correcto ? FEEDBACK_OK_MS : FEEDBACK_ERROR_MS
    );
  }

  if (!problema || cerrando) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro]}>
        <Glifos glifos={NUMERIA.glifos} acento={NUMERIA.neon} />
        <ActivityIndicator color={NUMERIA.neon} size="large" />
        <Texto v="nota">{cerrando ? (dueloId ? "Comparando con tu rival…" : "Guardando tu partida…") : "Preparando problemas…"}</Texto>
      </SafeAreaView>
    );
  }

  const rivalRespondidos = duelo?.rivalYaJugo ? fantasmaRespondidos : rivalVivo?.respondidos ?? null;

  return (
    <SafeAreaView style={styles.pantalla}>
      <Glifos glifos={NUMERIA.glifos} acento={NUMERIA.neon} cantidad={8} pulso={pulso} />
      <Cabecera onSalir={confirmarSalida} restanteMs={restanteMs} totalMs={DURACION_MS} combo={combo} acento={NUMERIA.neon} />
      <Progreso resultados={resultados} total={TOTAL} acento={NUMERIA.neon} escudos={escudos} />
      {duelo && rivalRespondidos != null && (
        <BarraRival nombre={duelo.rivalNombre} respondidos={rivalRespondidos} total={TOTAL} yo={resultados.length} fantasma={duelo.rivalYaJugo} />
      )}

      <View style={styles.zona}>
        <TarjetaProblema acento={NUMERIA.neon} combo={combo} feedback={feedback} sello={sello} sacudida={sacudida}>
          <Texto v="numero" adjustsFontSizeToFit numberOfLines={1}>
            {textoProblema(problema)}
          </Texto>
          <Texto
            style={{
              fontFamily: fuente.mono,
              fontSize: 32,
              letterSpacing: 4,
              minHeight: 40,
              color: feedback === "correcto" ? color.correcto : feedback === "incorrecto" ? color.error : NUMERIA.neon,
              textDecorationLine: feedback === "incorrecto" ? "line-through" : "none",
            }}
          >
            {respuesta === "" ? "_" : respuesta}
          </Texto>
          {feedback === "incorrecto" && (
            <Texto v="fuerte" c={color.correcto}>
              Era {problema.answer}
            </Texto>
          )}
          {flotantes.map((f) => (
            <Flotante key={f.id} texto={f.texto} c={f.c} />
          ))}
        </TarjetaProblema>
        {aviso && (
          <Texto v="h3" c={color.logro} centro>
            {aviso}
          </Texto>
        )}
      </View>

      <View style={styles.teclado}>
        <Teclado
          deshabilitado={feedback !== "idle"}
          onDigito={(d) => setRespuesta((r) => (r.replace("-", "").length >= 7 ? r : r + d))}
          onBorrar={() => setRespuesta((r) => r.slice(0, -1))}
          onMenos={() => setRespuesta((r) => (r.startsWith("-") ? r.slice(1) : "-" + r))}
        />
        <Boton3D titulo="Listo" acento={NUMERIA.base} silencioso deshabilitado={feedback !== "idle" || respuesta === "" || respuesta === "-"} onPress={enviar} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bgHondo },
  centro: { alignItems: "center", justifyContent: "center", gap: 14 },
  zona: { flex: 1, justifyContent: "center", paddingHorizontal: 16, gap: 10 },
  teclado: { paddingHorizontal: 16, paddingBottom: 10, gap: 4 },
});
