import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown, useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { sonar, sonarAcierto, vibrar } from "~/lib/efectos";
import { cargarNivelesMundo, mundoJugable } from "~/lib/mundosJugables";
import { useSesion } from "~/lib/sesion";
import { generarZen, MEZCLA, nombreDificultad, prepararZen, PREGUNTAS_ZEN, registrarPartidaZen, temasZen, type PreguntaZen } from "~/lib/zen";
import Boton3D from "~/ui/Boton3D";
import Glifos from "~/ui/Glifos";
import MapaGeografia from "~/ui/MapaGeografia";
import { PantallaApilada } from "~/ui/Pantalla";
import { CuerpoPregunta, esRespuestaCorrecta, OpcionesPregunta, TecladoPregunta, type Feedback } from "~/ui/PreguntaVista";
import { animarAcierto, animarError, opcionesADescartar, Progreso, TarjetaProblema } from "~/ui/Sprint";
import Texto from "~/ui/Texto";
import TextoLatex from "~/ui/TextoLatex";
import { color, conAlfa, fuente, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";

// Modo Zen (calibra/docs/PLAN_MODO_SIN_RELOJ.md): eliges tema y dificultad y
// juegas 10 preguntas sin reloj. Si fallas, puedes intentar otra vez o ver la
// respuesta; las pistas son gratis. No da Chispas ni XP: solo cuenta para la racha.

type Fase = "elegir" | "jugando" | "final";

export default function Zen() {
  const router = useRouter();
  const { mundo: slug } = useLocalSearchParams<{ mundo: string }>();
  const mundo = MUNDO_POR_SLUG[slug as MundoSlug];
  const temas = temasZen(slug ?? "");
  const { sesion } = useSesion();
  const userId = sesion?.user.id;

  const [fase, setFase] = useState<Fase>("elegir");
  const [tema, setTema] = useState<string>(temas[0]?.id ?? MEZCLA);
  const [nivel, setNivel] = useState(3);
  const [niveles, setNiveles] = useState<Record<string, number>>({});
  const [contexto, setContexto] = useState<unknown>(undefined);

  const [pregunta, setPregunta] = useState<PreguntaZen | null>(null);
  const [memorizando, setMemorizando] = useState(false);
  const [respuesta, setRespuesta] = useState("");
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  // "casi" = primer error: se ofrece intentar otra vez o ver la respuesta.
  const [casi, setCasi] = useState(false);
  const [ocultas, setOcultas] = useState<Set<string>>(() => new Set());
  const [pista, setPista] = useState<string | null>(null);
  const [resultados, setResultados] = useState<boolean[]>([]);
  const [falladas, setFalladas] = useState<{ enunciado: string; solucion: string }[]>([]);
  const [racha, setRacha] = useState<number | null>(null);

  const usados = useRef(new Set<string>());
  const sello = useSharedValue(1);
  const sacudida = useSharedValue(0);

  // Niveles actuales (la barra arranca en el del tema elegido) y lo que el mundo
  // necesite para generar (el banco de acertijos de Enigmia).
  useEffect(() => {
    const def = mundoJugable(slug);
    if (def && userId)
      cargarNivelesMundo(def, userId)
        .then((n) => {
          setNiveles(n);
          const primero = def.modos[0]?.id;
          if (primero && n[primero]) setNivel(Math.max(1, Math.min(10, n[primero])));
        })
        .catch(() => undefined);
    prepararZen(slug ?? "").then(setContexto).catch(() => setContexto(null));
  }, [slug, userId]);

  if (!mundo || temas.length === 0) {
    return (
      <PantallaApilada titulo="Modo Zen">
        <Texto v="nota">Esta ciudad todavía no tiene Modo Zen.</Texto>
      </PantallaApilada>
    );
  }

  function siguiente() {
    const q = generarZen(mundo.slug, tema, nivel, usados.current, contexto);
    if (!q) return;
    usados.current.add(q.tipo === "mundo" ? q.p.clave : q.clave);
    setPregunta(q);
    setMemorizando(q.tipo === "mundo" && !!q.p.memoria);
    setRespuesta("");
    setSeleccion(null);
    setFeedback("idle");
    setCasi(false);
    setOcultas(new Set());
    setPista(null);
  }

  function empezar() {
    vibrar.medio();
    usados.current = new Set();
    setResultados([]);
    setFalladas([]);
    setRacha(null);
    setFase("jugando");
    siguiente();
  }

  function solucionDe(q: PreguntaZen): string {
    if (q.tipo === "mapa") return q.nombre;
    const e = q.p.entrada;
    return q.p.solucion ?? (e.tipo === "numero" ? String(e.respuesta).replace(".", ",") : e.respuesta);
  }

  function cerrarPregunta(correcto: boolean) {
    if (!pregunta) return;
    const nuevos = [...resultados, correcto];
    setResultados(nuevos);
    if (!correcto) setFalladas((f) => [...f, { enunciado: pregunta.tipo === "mapa" ? `¿Dónde está ${pregunta.nombre}?` : pregunta.p.enunciado, solucion: solucionDe(pregunta) }]);
  }

  function responder(valor: string) {
    if (!pregunta || feedback !== "idle" || memorizando) return;
    const correcto = pregunta.tipo === "mapa" ? valor === pregunta.id : esRespuestaCorrecta(pregunta.p, valor);
    setSeleccion(valor);
    if (correcto) {
      setFeedback("correcto");
      setCasi(false);
      sonarAcierto(1);
      vibrar.medio();
      animarAcierto(sello);
      cerrarPregunta(true);
      return;
    }
    sonar("error");
    vibrar.error();
    animarError(sacudida);
    if (!casi && feedback === "idle" && !ocultas.has("__reintento__")) {
      // Primer error: se puede volver a intentar (la opción mala queda apagada).
      setCasi(true);
      setOcultas((o) => new Set(o).add(valor).add("__reintento__"));
      return;
    }
    verRespuesta();
  }

  function reintentar() {
    vibrar.seleccion();
    setCasi(false);
    setSeleccion(null);
    setRespuesta("");
  }

  function verRespuesta() {
    setCasi(false);
    setFeedback("incorrecto");
    cerrarPregunta(false);
  }

  async function avanzar() {
    vibrar.seleccion();
    if (resultados.length >= PREGUNTAS_ZEN) {
      setFase("final");
      sonar("recompensa");
      const r = await registrarPartidaZen(mundo.slug, resultados.length);
      setRacha(r);
      return;
    }
    siguiente();
  }

  function darPista() {
    if (!pregunta || pista || pregunta.tipo === "mapa") return;
    vibrar.seleccion();
    const e = pregunta.p.entrada;
    if (e.tipo === "opciones") {
      setOcultas((o) => new Set([...o, ...opcionesADescartar(e.opciones.filter((x) => !o.has(x)), e.respuesta)]));
      setPista("Quitamos dos opciones que no son.");
    } else if (e.tipo === "numero") {
      const s = String(e.respuesta).replace(".", ",");
      setPista(`Empieza con «${s.startsWith("-") ? s.slice(0, 2) : s[0]}» y tiene ${s.replace("-", "").replace(",", "").length} cifras.`);
    } else setPista("Mira bien la forma y la posición.");
  }

  // ---------- Elegir tema y dificultad ----------
  if (fase === "elegir") {
    return (
      <PantallaApilada titulo={`☯ Modo Zen`} subtitulo={`${mundo.nombre} · sin reloj, a tu ritmo`}>
        <View style={[styles.aviso, { borderColor: conAlfa(mundo.neon, 0.5), backgroundColor: conAlfa(mundo.neon, 0.08) }]}>
          <Texto v="nota" tam={12.5}>
            10 preguntas sin reloj. Si fallas, puedes intentar otra vez o ver la respuesta, y las pistas son gratis. No da Chispas: es para practicar, y cuenta para tu racha.
          </Texto>
        </View>
        <Texto v="micro">Tema</Texto>
        <View style={styles.chips}>
          {[...temas, { id: MEZCLA, nombre: "Mezcla", simbolo: "✶" }].map((t) => {
            const activo = tema === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => {
                  vibrar.seleccion();
                  setTema(t.id);
                  if (niveles[t.id]) setNivel(Math.max(1, Math.min(10, niveles[t.id])));
                }}
                style={[styles.chip, activo && { borderColor: mundo.neon, backgroundColor: conAlfa(mundo.neon, 0.16) }]}
              >
                <Texto style={{ fontFamily: fuente.cuerpoFuerte, fontSize: 13, color: activo ? color.texto : color.texto2 }}>
                  {t.simbolo} {t.nombre}
                </Texto>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}>
          <Texto v="micro">Dificultad</Texto>
          <Texto v="fuerte" c={mundo.neon}>
            Nivel {nivel} · {nombreDificultad(nivel)}
          </Texto>
        </View>
        <View style={styles.niveles}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const activo = n === nivel;
            const relleno = n <= nivel;
            return (
              <Pressable
                key={n}
                onPress={() => {
                  vibrar.seleccion();
                  setNivel(n);
                }}
                style={[styles.nivel, relleno && { backgroundColor: conAlfa(mundo.neon, 0.12 + n * 0.05), borderColor: conAlfa(mundo.neon, 0.6) }, activo && { borderColor: mundo.neon, transform: [{ scale: 1.08 }] }]}
                accessibilityLabel={`Nivel ${n}`}
              >
                <Texto v="mono" tam={14} c={relleno ? color.texto : color.texto2}>
                  {n}
                </Texto>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {["Fácil", "Media", "Difícil", "Experto"].map((x) => (
            <Texto key={x} v="nota" tam={10.5}>
              {x}
            </Texto>
          ))}
        </View>
        <Boton3D titulo="☯ Jugar en Zen" acento={mundo.base} brillo onPress={empezar} deshabilitado={contexto === undefined} estilo={{ marginTop: 10 }} />
      </PantallaApilada>
    );
  }

  // ---------- Resumen ----------
  if (fase === "final") {
    const aciertos = resultados.filter(Boolean).length;
    return (
      <PantallaApilada titulo="☯ Partida Zen" subtitulo={mundo.nombre}>
        <Animated.View entering={FadeInDown.duration(350)} style={{ alignItems: "center", gap: 6, paddingVertical: 10 }}>
          <Texto style={{ fontFamily: fuente.display, fontSize: 52, color: mundo.neon }}>
            {aciertos}/{PREGUNTAS_ZEN}
          </Texto>
          <Texto v="h3" centro>
            {aciertos === PREGUNTAS_ZEN ? "¡Perfecto! Prueba un nivel más." : aciertos >= 7 ? "¡Muy bien!" : "Sigue practicando, vas bien."}
          </Texto>
          <Texto v="nota" centro>
            Nivel {nivel} · {temas.find((t) => t.id === tema)?.nombre ?? "Mezcla"}
            {racha != null ? ` · Racha: ${racha} ${racha === 1 ? "día" : "días"} 🔥` : ""}
          </Texto>
        </Animated.View>
        {falladas.length > 0 && (
          <View style={{ gap: 8 }}>
            <Texto v="micro">Para repasar</Texto>
            {falladas.map((f, i) => (
              <View key={i} style={styles.fallada}>
                <TextoLatex v="nota" texto={f.enunciado} />
                <TextoLatex v="fuerte" c={color.correcto} texto={`Era ${f.solucion}`} />
              </View>
            ))}
          </View>
        )}
        <Boton3D titulo="Otra vez" acento={mundo.base} brillo onPress={empezar} />
        {nivel < 10 && (
          <Boton3D
            titulo={`Subir a nivel ${nivel + 1}`}
            variante="secundario"
            onPress={() => {
              setNivel((n) => Math.min(10, n + 1));
              setFase("elegir");
            }}
          />
        )}
        <Boton3D titulo="Cambiar tema o dificultad" variante="secundario" onPress={() => setFase("elegir")} />
        <Boton3D titulo="Probar en contrarreloj" variante="secundario" onPress={() => router.dismissTo(`/${mundo.slug}` as "/numeria")} />
      </PantallaApilada>
    );
  }

  // ---------- Jugando ----------
  if (!pregunta) {
    return (
      <SafeAreaView style={[styles.pantalla, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={mundo.neon} />
      </SafeAreaView>
    );
  }
  const numero = resultados.length + (feedback === "idle" ? 1 : 0);
  const p = pregunta.tipo === "mundo" ? pregunta.p : null;
  const bloqueado = feedback !== "idle" || memorizando || casi;

  return (
    <SafeAreaView style={styles.pantalla}>
      <Glifos glifos={mundo.glifos} acento={mundo.neon} cantidad={5} opacidad={0.08} />
      <View style={styles.cabecera}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Salir del Modo Zen">
          <Texto v="h3" c={color.texto2}>
            ✕
          </Texto>
        </Pressable>
        <Texto v="micro" c={mundo.neon}>
          ☯ Zen · Nv {nivel}
        </Texto>
        <Texto v="mono" tam={13} c={color.texto2}>
          {Math.min(numero, PREGUNTAS_ZEN)} de {PREGUNTAS_ZEN}
        </Texto>
      </View>
      <Progreso resultados={resultados} total={PREGUNTAS_ZEN} acento={mundo.neon} escudos={0} />

      <ScrollView contentContainerStyle={styles.zona} showsVerticalScrollIndicator={false}>
        <TarjetaProblema acento={mundo.neon} combo={0} feedback={feedback} sello={sello} sacudida={sacudida}>
          {p ? (
            <CuerpoPregunta pregunta={p} acento={mundo.neon} memorizando={memorizando} onMemoriaLista={() => setMemorizando(false)} feedback={feedback} respuesta={respuesta} />
          ) : pregunta.tipo === "mapa" ? (
            <View style={{ alignSelf: "stretch", gap: 8 }}>
              <Texto v="h3" centro>
                Toca: {pregunta.nombre}
              </Texto>
              <MapaGeografia continente={pregunta.continente} acento={mundo.neon} objetivoId={pregunta.id} seleccionId={seleccion} respondido={feedback !== "idle"} bloqueado={bloqueado} onElegir={responder} />
              {feedback === "incorrecto" && (
                <Texto v="fuerte" c={color.correcto} centro>
                  Estaba marcado en el mapa: {pregunta.nombre}
                </Texto>
              )}
            </View>
          ) : null}
        </TarjetaProblema>

        {pista && feedback === "idle" && (
          <Animated.View entering={FadeIn.duration(200)}>
            <Texto v="nota" c={color.logro} centro>
              💡 {pista}
            </Texto>
          </Animated.View>
        )}

        {casi && (
          <Animated.View entering={FadeInDown.duration(220)} style={{ gap: 8 }}>
            <Texto v="fuerte" centro>
              Casi. ¿Lo intentas otra vez?
            </Texto>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Boton3D titulo="Intentar de nuevo" acento={mundo.base} onPress={reintentar} estilo={{ flex: 1 }} />
              <Boton3D titulo="Ver respuesta" variante="secundario" onPress={verRespuesta} estilo={{ flex: 1 }} />
            </View>
          </Animated.View>
        )}

        {p && !memorizando && !casi && <OpcionesPregunta pregunta={p} feedback={feedback} seleccion={seleccion} bloqueado={bloqueado} base={mundo.base} onResponder={responder} ocultas={ocultas} />}

        {feedback === "idle" && !memorizando && !casi && pregunta.tipo === "mundo" && !pista && (
          <Pressable onPress={darPista} hitSlop={8} style={styles.pista}>
            <Texto v="fuerte" tam={13} c={color.logro}>
              💡 Pista gratis
            </Texto>
          </Pressable>
        )}

        {feedback !== "idle" && (
          <Animated.View entering={FadeInDown.duration(220)}>
            <Boton3D titulo={resultados.length >= PREGUNTAS_ZEN ? "Ver resumen" : "Siguiente"} acento={mundo.base} brillo onPress={avanzar} />
          </Animated.View>
        )}
      </ScrollView>

      {p && !memorizando && !casi && feedback === "idle" && <TecladoPregunta pregunta={p} bloqueado={bloqueado} respuesta={respuesta} setRespuesta={setRespuesta} base={mundo.base} onListo={() => responder(respuesta)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bgHondo },
  cabecera: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 6, minHeight: 48 },
  zona: { padding: 16, gap: 12, flexGrow: 1, justifyContent: "center" },
  aviso: { padding: 12, borderRadius: 14, borderWidth: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface2 },
  niveles: { flexDirection: "row", gap: 5 },
  nivel: { flex: 1, aspectRatio: 0.8, borderRadius: 10, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface2, alignItems: "center", justifyContent: "center" },
  fallada: { gap: 4, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface1 },
  pista: { alignSelf: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: conAlfa(color.logro, 0.5), backgroundColor: conAlfa(color.logro, 0.1) },
});
