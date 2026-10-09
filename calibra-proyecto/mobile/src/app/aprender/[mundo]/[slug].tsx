import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInRight, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { agruparVisualesPorPaso, visualesDeContenido } from "@/lib/aprender/visuales";
import { generarProblemaTecnica, type Problem } from "@/lib/practica/problems";
import { cargarCamino, completarLeccion, nodosEnOrden, type NodoLeccion } from "~/lib/aprender";
import { sonar, vibrar } from "~/lib/efectos";
import { recargarJugador, useJugador } from "~/lib/jugador";
import { useSesion } from "~/lib/sesion";
import { mensajeError } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import Confeti from "~/ui/Confeti";
import Glifos from "~/ui/Glifos";
import { BotonAtras } from "~/ui/Pantalla";
import { Teclado } from "~/ui/Sprint";
import Texto from "~/ui/Texto";
import { textoConFormulas } from "~/ui/TextoMate";
import TextoLatex from "~/ui/TextoLatex";
import VisualLeccion from "~/ui/aprender/VisualLeccion";
import { brillo, color, conAlfa, fuente, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";

// Una lección de Aprender (LeccionClient.tsx y Leccion<Mundo>Client.tsx de la web):
// presentación → explicación (pasos con sus visuales animados) → práctica (solo en
// las técnicas de cálculo de Numeria, 4 problemas como en la web) → quiz (si tiene)
// → celebración. La base valida el quiz y el plan (completar_leccion); sin conexión
// se valida acá y se sube después.

type Fase = "presentacion" | "explicacion" | "practica" | "quiz" | "celebracion";
const PROBLEMAS_PRACTICA = 4;
// Las mismas excepciones que la web: estas técnicas de Numeria no tienen práctica.
const SIN_PRACTICA_NUMERIA = new Set([
  "sumar-fracciones-igual-denominador",
  "simplificar-con-mcd",
  "minimo-comun-denominador",
  "comparar-con-producto-cruzado",
  "despejar-paso-a-paso",
  "que-es-una-variable",
  "verificar-sustituyendo",
]);

// Texto de un paso: en Codia los bloques ``` son código; el resto, fórmulas.
function TextoPaso({ texto, mundo }: { texto: string; mundo: MundoSlug }) {
  if (mundo !== "codia" || !texto.includes("```")) return <TextoLatex v="cuerpo" texto={texto} />;
  const partes = texto.split("```");
  return (
    <View style={{ gap: 8 }}>
      {partes.map((parte, i) => {
        if (i % 2 === 0) return parte.trim() ? <TextoLatex key={i} v="cuerpo" texto={parte.trim()} /> : null;
        const salto = parte.indexOf("\n");
        const etiqueta = (salto >= 0 ? parte.slice(0, salto) : parte).trim().toLowerCase().replace(/!$/, "");
        const cuerpo = (salto >= 0 ? parte.slice(salto + 1) : "").replace(/\n$/, "");
        return (
          <ScrollView key={i} horizontal showsHorizontalScrollIndicator={false} style={[styles.codigo, etiqueta === "salida" && styles.salida]}>
            <View>
              {etiqueta && etiqueta !== "salida" ? <Texto v="micro">{etiqueta}</Texto> : null}
              <Texto style={styles.textoCodigo}>{etiqueta === "salida" ? `> ${cuerpo}` : cuerpo}</Texto>
            </View>
          </ScrollView>
        );
      })}
    </View>
  );
}

export default function PantallaLeccion() {
  const router = useRouter();
  const { mundo: slugMundo, slug } = useLocalSearchParams<{ mundo: string; slug: string }>();
  const mundo = MUNDO_POR_SLUG[slugMundo as MundoSlug];
  const { sesion } = useSesion();
  const { plan } = useJugador();
  const userId = sesion?.user.id;
  const [nodo, setNodo] = useState<NodoLeccion | null | undefined>(undefined);
  const [siguiente, setSiguiente] = useState<NodoLeccion | null>(null);
  const [fase, setFase] = useState<Fase>("presentacion");
  const [respuestas, setRespuestas] = useState<string[]>([]);
  const [incorrectas, setIncorrectas] = useState<number[] | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [logros, setLogros] = useState<{ nombre: string; descripcion: string }[]>([]);
  const [sinConexion, setSinConexion] = useState(false);
  // Práctica (Numeria)
  const [problemaIdx, setProblemaIdx] = useState(0);
  const [problema, setProblema] = useState<Problem | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");

  useEffect(() => {
    if (!userId || !mundo) return;
    cargarCamino(mundo.slug, userId, plan === "pro").then((c) => {
      const lista = c ? [...nodosEnOrden(c.tecnicas), ...nodosEnOrden(c.clases ?? [])] : [];
      const i = lista.findIndex((n) => n.slug === slug);
      const n = i >= 0 ? lista[i] : null;
      setNodo(n && n.estado !== "bloqueado" ? n : null);
      setRespuestas((n?.contenido.quiz ?? []).map(() => ""));
      setSiguiente(lista.slice(i + 1).find((x) => x.requierePro === n?.requierePro) ?? null);
    });
  }, [userId, mundo, slug, plan]);

  const pasos = useMemo(() => nodo?.contenido.pasos ?? [], [nodo]);
  const visuales = useMemo(() => visualesDeContenido(nodo?.contenido.visuales), [nodo]);
  const porPaso = useMemo(() => agruparVisualesPorPaso(pasos.length, visuales), [pasos, visuales]);
  const quiz = useMemo(() => nodo?.contenido.quiz ?? [], [nodo]);
  const conPractica = mundo?.slug === "numeria" && !!nodo && !nodo.requierePro && visuales.length === 0 && !SIN_PRACTICA_NUMERIA.has(nodo.slug);

  // Salir a la mitad pide confirmación (como la guardia de salida de la web).
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (fase === "presentacion" || fase === "celebracion") return false;
      Alert.alert("¿Salir de la lección?", "Lo que llevas de esta lección no se guarda.", [
        { text: "Seguir", style: "cancel" },
        { text: "Salir", style: "destructive", onPress: () => router.back() },
      ]);
      return true;
    });
    return () => sub.remove();
  }, [fase, router]);

  async function terminar(r: string[] | null) {
    if (!nodo || !mundo) return;
    setEnviando(true);
    setIncorrectas(null);
    try {
      const res = await completarLeccion(mundo.slug, nodo, r);
      if (!res.aprobado) {
        setIncorrectas(res.incorrectas);
        sonar("error");
        vibrar.error();
        return;
      }
      setLogros(res.logros);
      setSinConexion(!!res.sinConexion);
      sonar("logro");
      vibrar.exito();
      setFase("celebracion");
      recargarJugador();
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    } finally {
      setEnviando(false);
    }
  }

  function despuesDeExplicar() {
    if (conPractica) {
      setProblemaIdx(0);
      setProblema(generarProblemaTecnica(nodo!.slug));
      setRespuesta("");
      setFeedback("idle");
      setFase("practica");
    } else if (quiz.length > 0) setFase("quiz");
    else terminar(null);
  }

  function responderPractica() {
    if (!problema || feedback !== "idle" || respuesta === "" || respuesta === "-") return;
    const bien = Number(respuesta) === problema.answer;
    setFeedback(bien ? "correcto" : "incorrecto");
    if (bien) sonar("acierto0");
    else sonar("error");
    setTimeout(() => {
      if (problemaIdx + 1 >= PROBLEMAS_PRACTICA) {
        if (quiz.length > 0) setFase("quiz");
        else terminar(null);
        return;
      }
      setProblemaIdx((i) => i + 1);
      setProblema(generarProblemaTecnica(nodo!.slug));
      setRespuesta("");
      setFeedback("idle");
    }, bien ? 600 : 1300);
  }

  if (!mundo) return null;
  if (nodo === undefined) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro]}>
        <ActivityIndicator color={mundo.neon} size="large" />
      </SafeAreaView>
    );
  }
  if (nodo === null) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro, { padding: 24 }]}>
        <Texto v="h3" centro>
          Esta lección todavía está bloqueada
        </Texto>
        <Texto v="nota" centro>
          Completa la anterior del mismo tema para abrirla.
        </Texto>
        <Boton3D titulo="Volver" variante="secundario" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <Glifos glifos={mundo.glifos} acento={mundo.neon} cantidad={5} opacidad={0.06} />
      <View style={styles.barra}>
        <BotonAtras />
        <View style={[styles.etiquetaTipo, { backgroundColor: conAlfa(mundo.neon, 0.14) }]}>
          <Texto v="micro" c={mundo.neon}>
            {nodo.requierePro ? "Clase" : "Técnica"} · {mundo.nombre}
          </Texto>
        </View>
      </View>

      {fase === "presentacion" && (
        <Animated.View key="p" entering={FadeIn.duration(300)} style={[styles.centro, { flex: 1, padding: 24, gap: 14 }]}>
          <Animated.View entering={ZoomIn.springify().damping(12)} style={[styles.medalla, { borderColor: mundo.neon, boxShadow: brillo(mundo.neon, 30, 0.5) }]}>
            <Texto style={{ fontFamily: fuente.display, fontSize: 30, color: mundo.neon }}>{mundo.glifo}</Texto>
          </Animated.View>
          <Texto v="h1" centro>
            {textoConFormulas(nodo.nombre)}
          </Texto>
          {nodo.descripcion ? (
            <Texto v="cuerpo" c={color.texto2} centro>
              {textoConFormulas(nodo.descripcion)}
            </Texto>
          ) : null}
          <Boton3D titulo="Ver la explicación" acento={mundo.base} brillo onPress={() => setFase("explicacion")} estilo={{ alignSelf: "stretch", marginTop: 10 }} />
        </Animated.View>
      )}

      {fase === "explicacion" && (
        <ScrollView key="e" contentContainerStyle={styles.contenido}>
          {pasos.map((paso, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(Math.min(i, 5) * 90).duration(320)} style={{ gap: 12 }}>
              <View style={[styles.paso, { borderLeftColor: mundo.neon }]}>
                <Texto style={{ fontFamily: fuente.display, fontSize: 15, color: color.logro }}>{i + 1}</Texto>
                <View style={{ flex: 1 }}>
                  <TextoPaso texto={paso} mundo={mundo.slug} />
                </View>
              </View>
              {(porPaso.get(i) ?? []).map((v, vi) => (
                <VisualLeccion key={vi} visual={v} />
              ))}
            </Animated.View>
          ))}
          <Boton3D
            titulo={conPractica ? "A practicar" : quiz.length > 0 ? "Ir al quiz" : "Marcar como aprendida"}
            acento={mundo.base}
            brillo
            cargando={enviando}
            onPress={despuesDeExplicar}
            estilo={{ marginTop: 8 }}
          />
        </ScrollView>
      )}

      {fase === "practica" && problema && (
        <Animated.View key={`pr${problemaIdx}`} entering={FadeInRight.duration(260)} style={{ flex: 1, padding: 16, gap: 16 }}>
          <View style={styles.puntos}>
            {Array.from({ length: PROBLEMAS_PRACTICA }, (_, i) => (
              <View key={i} style={[styles.puntoPractica, i <= problemaIdx && { backgroundColor: mundo.neon }]} />
            ))}
          </View>
          <View style={[styles.tarjetaPractica, { borderColor: feedback === "correcto" ? color.correcto : feedback === "incorrecto" ? color.error : color.border }]}>
            <Texto style={{ fontFamily: fuente.mono, fontSize: 34, color: color.texto }}>
              {problema.a} <Texto style={{ fontFamily: fuente.mono, fontSize: 34, color: mundo.neon }}>{problema.symbol}</Texto> {problema.b}
            </Texto>
            <Texto style={{ fontFamily: fuente.mono, fontSize: 30, color: feedback === "incorrecto" ? color.error : feedback === "correcto" ? color.correcto : mundo.neon }}>
              {respuesta === "" ? "_" : respuesta}
            </Texto>
            {feedback === "incorrecto" && (
              <Texto v="fuerte" c={color.correcto}>
                Era {problema.answer}
              </Texto>
            )}
          </View>
          <View style={{ flex: 1 }} />
          <Teclado
            deshabilitado={feedback !== "idle"}
            onDigito={(d) => setRespuesta((x) => (x.length >= 7 ? x : x + d))}
            onBorrar={() => setRespuesta((x) => x.slice(0, -1))}
            onMenos={() => setRespuesta((x) => (x.startsWith("-") ? x.slice(1) : "-" + x))}
          />
          <Boton3D titulo="Listo" acento={mundo.base} silencioso deshabilitado={feedback !== "idle" || respuesta === ""} onPress={responderPractica} />
          <Pressable onPress={() => setFase("explicacion")} style={{ alignSelf: "center" }}>
            <Texto v="nota">¿Te trabaste? Volver a la explicación</Texto>
          </Pressable>
        </Animated.View>
      )}

      {fase === "quiz" && (
        <ScrollView key="q" contentContainerStyle={styles.contenido}>
          <Texto v="h2">Quiz</Texto>
          <Texto v="nota">Responde todas para completar la lección.</Texto>
          {quiz.map((q, qi) => {
            const mal = incorrectas?.includes(qi) ?? false;
            return (
              <Animated.View key={qi} entering={FadeInDown.delay(qi * 80).duration(300)} style={[styles.pregunta, mal && { borderColor: color.error }]}>
                <TextoLatex v="fuerte" texto={`${qi + 1}. ${q.pregunta}`} />
                {q.opciones.map((op) => {
                  const elegida = respuestas[qi] === op;
                  return (
                    <Pressable
                      key={op}
                      onPress={() => {
                        vibrar.seleccion();
                        setRespuestas((prev) => prev.map((v, i) => (i === qi ? op : v)));
                      }}
                      style={({ pressed }) => [
                        styles.opcion,
                        elegida && { borderColor: mal ? color.error : mundo.neon, backgroundColor: conAlfa(mal ? color.error : mundo.neon, 0.14) },
                        pressed && { transform: [{ scale: 0.98 }] },
                      ]}
                    >
                      <TextoLatex v="cuerpo" texto={op} />
                    </Pressable>
                  );
                })}
                {mal && (
                  <TextoLatex v="nota" c={color.error} texto={`No es esa.${q.explicacion ? ` ${q.explicacion}` : ""}`} />
                )}
              </Animated.View>
            );
          })}
          <Boton3D
            titulo="Enviar respuestas"
            acento={mundo.base}
            brillo
            cargando={enviando}
            deshabilitado={respuestas.some((r) => r === "")}
            onPress={() => terminar(respuestas)}
          />
        </ScrollView>
      )}

      {fase === "celebracion" && (
        <Animated.View key="c" entering={FadeIn.duration(300)} style={[styles.centro, { flex: 1, padding: 24, gap: 14 }]}>
          <Confeti cantidad={50} />
          <Animated.View entering={ZoomIn.springify().damping(9)} style={[styles.medalla, { backgroundColor: mundo.base, borderColor: color.logro, boxShadow: brillo(color.logro, 36, 0.6) }]}>
            <Texto style={{ fontFamily: fuente.display, fontSize: 34, color: "#fff" }}>✓</Texto>
          </Animated.View>
          <Texto v="h1" centro>
            ¡Lección completada!
          </Texto>
          <Texto v="cuerpo" c={color.texto2} centro>
            {textoConFormulas(nodo.nombre)}
          </Texto>
          {sinConexion && (
            <Texto v="nota" centro>
              La completaste sin conexión: se guarda en tu cuenta cuando vuelva internet.
            </Texto>
          )}
          {logros.map((l) => (
            <Animated.View key={l.nombre} entering={FadeInDown.duration(300)} style={[styles.logro]}>
              <Texto v="micro" c={color.logro}>
                ¡Logro desbloqueado!
              </Texto>
              <Texto v="fuerte">{l.nombre}</Texto>
            </Animated.View>
          ))}
          <View style={{ alignSelf: "stretch", gap: 10, marginTop: 8 }}>
            {siguiente && siguiente.estado !== "completado" && !siguiente.bloqueadoPorPlan && (
              <Boton3D
                titulo={`Siguiente: ${textoConFormulas(siguiente.nombre)}`}
                acento={mundo.base}
                brillo
                onPress={() => router.replace({ pathname: "/aprender/[mundo]/[slug]", params: { mundo: mundo.slug, slug: siguiente.slug } })}
              />
            )}
            <Boton3D titulo="Volver al camino" variante="secundario" onPress={() => router.back()} />
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bgHondo },
  centro: { alignItems: "center", justifyContent: "center" },
  barra: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4 },
  etiquetaTipo: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  medalla: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, alignItems: "center", justifyContent: "center", backgroundColor: color.surface1 },
  contenido: { padding: 16, gap: 16, paddingBottom: 40 },
  paso: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 16, borderLeftWidth: 3, backgroundColor: color.surface1 },
  codigo: { borderRadius: 12, borderWidth: 1, borderColor: color.border, backgroundColor: "#0B0F1E", padding: 10 },
  salida: { borderStyle: "dashed" },
  textoCodigo: { fontFamily: fuente.monoMedio, fontSize: 13, lineHeight: 19, color: color.texto },
  puntos: { flexDirection: "row", gap: 6, alignSelf: "center" },
  puntoPractica: { width: 26, height: 6, borderRadius: 3, backgroundColor: color.surface3 },
  tarjetaPractica: { alignItems: "center", gap: 14, paddingVertical: 34, borderRadius: 26, borderWidth: 2, backgroundColor: color.surface1 },
  pregunta: { gap: 8, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface1 },
  opcion: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 2, borderColor: color.border, backgroundColor: color.bg },
  logro: { alignSelf: "stretch", alignItems: "center", gap: 2, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: conAlfa(color.logro, 0.5), backgroundColor: conAlfa(color.logro, 0.1) },
});
