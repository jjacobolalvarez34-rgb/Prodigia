import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown, useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ajustarNivel, diagnosticoDe, guardarDiagnostico, NIVEL_INICIAL_DIAGNOSTICO, nivelesIniciales } from "~/lib/diagnostico";
import { sonar, sonarAcierto, vibrar } from "~/lib/efectos";
import type { PreguntaMundo } from "~/lib/mundosJugables";
import { useSesion } from "~/lib/sesion";
import { mensajeError } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import Glifos from "~/ui/Glifos";
import { CuerpoPregunta, esRespuestaCorrecta, OpcionesPregunta, TecladoPregunta, type Feedback } from "~/ui/PreguntaVista";
import { animarAcierto, animarError, TarjetaProblema } from "~/ui/Sprint";
import Texto from "~/ui/Texto";
import { color, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";

type Fase = "intro" | "jugando" | "guardando" | "resultado";

const NOMBRE_NIVEL: Record<string, string> = { nivel: "Nivel", suma: "Suma", resta: "Resta", multiplicacion: "Multiplicación", division: "División" };

// Diagnóstico inicial de un mundo: aparece la primera vez que entras (igual que en
// la web) y fija tu nivel de arranque. Sin reloj; se puede saltar (nivel 3).
export default function DiagnosticoMundo() {
  const router = useRouter();
  const { mundo: slug } = useLocalSearchParams<{ mundo: string }>();
  const mundo = MUNDO_POR_SLUG[slug as MundoSlug];
  const [diag] = useState(() => (mundo ? diagnosticoDe(mundo.slug) : null));
  const { sesion } = useSesion();
  const userId = sesion?.user.id;

  const [fase, setFase] = useState<Fase>("intro");
  const [indice, setIndice] = useState(0);
  const [pregunta, setPregunta] = useState<PreguntaMundo | null>(null);
  const [memorizando, setMemorizando] = useState(false);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [resultado, setResultado] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nivelVisible, setNivelVisible] = useState(NIVEL_INICIAL_DIAGNOSTICO);

  const sello = useSharedValue(1);
  const sacudida = useSharedValue(0);
  const nivelesRef = useRef<Record<string, number>>({});
  const claveRef = useRef("nivel");
  const usadosRef = useRef(new Set<string>());
  const contextoRef = useRef<unknown>(null);
  const mostradaRef = useRef(0);
  const ocupadoRef = useRef(false);

  useEffect(() => {
    if (diag?.preparar) diag.preparar().then((c) => (contextoRef.current = c));
  }, [diag]);

  function siguiente(i: number) {
    if (!diag) return;
    const { pregunta: p, clave } = diag.generar(i, nivelesRef.current, usadosRef.current, contextoRef.current);
    usadosRef.current.add(p.clave);
    claveRef.current = clave;
    setNivelVisible(nivelesRef.current[clave] ?? NIVEL_INICIAL_DIAGNOSTICO);
    setPregunta(p);
    setSeleccion(null);
    setRespuesta("");
    setFeedback("idle");
    if (p.memoria) setMemorizando(true);
    else {
      setMemorizando(false);
      mostradaRef.current = Date.now();
    }
  }

  function empezar() {
    if (!diag) return;
    nivelesRef.current = nivelesIniciales(diag);
    usadosRef.current = new Set();
    setIndice(0);
    setFase("jugando");
    siguiente(0);
  }

  async function guardar(niveles: Record<string, number>, saltado: boolean) {
    if (!diag || !mundo || !userId) return;
    setFase("guardando");
    setError(null);
    try {
      await guardarDiagnostico(mundo.slug, diag, niveles, userId);
      if (saltado) {
        router.replace(`/${mundo.slug}` as Href);
        return;
      }
      setResultado(niveles);
      setFase("resultado");
      sonar("logro");
      vibrar.exito();
    } catch (e) {
      setError(mensajeError(e));
      setResultado(niveles);
      setFase("resultado");
    }
  }

  function responder(valor: string) {
    if (!pregunta || !diag || ocupadoRef.current || memorizando) return;
    ocupadoRef.current = true;
    const timeMs = Date.now() - mostradaRef.current;
    const correcto = esRespuestaCorrecta(pregunta, valor);
    const clave = claveRef.current;
    nivelesRef.current = { ...nivelesRef.current, [clave]: ajustarNivel(nivelesRef.current[clave] ?? NIVEL_INICIAL_DIAGNOSTICO, correcto, timeMs) };
    setSeleccion(valor);
    setFeedback(correcto ? "correcto" : "incorrecto");
    if (correcto) {
      sonarAcierto(0);
      vibrar.medio();
      animarAcierto(sello);
    } else {
      sonar("error");
      vibrar.error();
      animarError(sacudida);
    }
    setTimeout(
      () => {
        ocupadoRef.current = false;
        const sig = indice + 1;
        setIndice(sig);
        if (sig >= diag.total) guardar(nivelesRef.current, false);
        else siguiente(sig);
      },
      correcto ? 600 : 1100
    );
  }

  if (!mundo || !diag) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro]}>
        <Texto v="h3">Este mundo no tiene diagnóstico.</Texto>
        <Boton3D titulo="Volver" variante="secundario" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (fase === "intro") {
    return (
      <SafeAreaView style={styles.pantalla}>
        <Glifos glifos={mundo.glifos} acento={mundo.neon} />
        <ScrollView contentContainerStyle={[styles.zona, { justifyContent: "center" }]}>
          <Animated.View entering={FadeInDown.duration(320)} style={{ gap: 12 }}>
            <Texto v="micro" c={mundo.neon}>
              Bienvenido a {mundo.nombre}
            </Texto>
            <Texto v="h1">Primero, tu nivel</Texto>
            <Texto v="cuerpo" c={color.texto2}>
              Son {diag.total} preguntas de {diag.tema}, sin reloj. Empiezan en nivel {NIVEL_INICIAL_DIAGNOSTICO}: si aciertas rápido sube, si fallas baja. Así tus partidas arrancan a tu medida, no
              demasiado fáciles ni demasiado difíciles.
            </Texto>
          </Animated.View>
          <View style={{ gap: 10, marginTop: 20 }}>
            <Boton3D titulo="Empezar" acento={mundo.base} brillo onPress={empezar} />
            <Boton3D titulo={`Saltar (empiezo en nivel ${NIVEL_INICIAL_DIAGNOSTICO})`} variante="secundario" onPress={() => guardar(nivelesIniciales(diag), true)} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (fase === "guardando") {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro]}>
        <ActivityIndicator color={mundo.neon} size="large" />
        <Texto v="nota">Guardando tu nivel…</Texto>
      </SafeAreaView>
    );
  }

  if (fase === "resultado" && resultado) {
    return (
      <SafeAreaView style={styles.pantalla}>
        <Glifos glifos={mundo.glifos} acento={mundo.neon} />
        <ScrollView contentContainerStyle={[styles.zona, { justifyContent: "center" }]}>
          <Animated.View entering={FadeIn.duration(300)} style={{ gap: 14, alignItems: "center" }}>
            <Texto v="micro" c={mundo.neon}>
              Diagnóstico listo
            </Texto>
            <Texto v="h1" centro>
              {error ? "No se pudo guardar" : "¡Ya tienes tu nivel!"}
            </Texto>
            <View style={styles.niveles}>
              {Object.entries(resultado).map(([k, v]) => (
                <View key={k} style={[styles.nivel, { borderColor: mundo.neon }]}>
                  <Texto v="nota">{NOMBRE_NIVEL[k] ?? k}</Texto>
                  <Texto v="h1" c={mundo.neon}>
                    {v}
                  </Texto>
                </View>
              ))}
            </View>
            {error && (
              <Texto v="nota" c={color.error} centro>
                {error}
              </Texto>
            )}
          </Animated.View>
          <View style={{ gap: 10, marginTop: 20 }}>
            {error ? (
              <Boton3D titulo="Reintentar" acento={mundo.base} brillo onPress={() => guardar(resultado, false)} />
            ) : (
              <Boton3D titulo={`Ir a ${mundo.nombre}`} acento={mundo.base} brillo onPress={() => router.replace(`/${mundo.slug}` as Href)} />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!pregunta) return null;
  const bloqueado = feedback !== "idle" || memorizando;
  return (
    <SafeAreaView style={styles.pantalla}>
      <Glifos glifos={mundo.glifos} acento={mundo.neon} cantidad={6} />
      <View style={styles.cabecera}>
        <Texto v="micro" c={mundo.neon}>
          Diagnóstico · {indice + 1} de {diag.total}
        </Texto>
        <View style={styles.puntos}>
          {Array.from({ length: diag.total }, (_, i) => (
            <View key={i} style={[styles.punto, i < indice && { backgroundColor: mundo.neon }, i === indice && { backgroundColor: mundo.neon, transform: [{ scale: 1.3 }] }]} />
          ))}
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.zona} showsVerticalScrollIndicator={false}>
        <TarjetaProblema acento={mundo.neon} combo={0} feedback={feedback} sello={sello} sacudida={sacudida}>
          <Texto v="micro" c={mundo.neon}>
            Nv {nivelVisible}
          </Texto>
          <CuerpoPregunta
            pregunta={pregunta}
            acento={mundo.neon}
            memorizando={memorizando}
            onMemoriaLista={() => {
              setMemorizando(false);
              mostradaRef.current = Date.now();
            }}
            feedback={feedback}
            respuesta={respuesta}
          />
        </TarjetaProblema>
        {!memorizando && <OpcionesPregunta pregunta={pregunta} feedback={feedback} seleccion={seleccion} bloqueado={bloqueado} base={mundo.base} onResponder={responder} />}
      </ScrollView>
      {!memorizando && <TecladoPregunta pregunta={pregunta} bloqueado={bloqueado} respuesta={respuesta} setRespuesta={setRespuesta} base={mundo.base} onListo={() => responder(respuesta)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bgHondo },
  centro: { alignItems: "center", justifyContent: "center", gap: 14 },
  zona: { padding: 16, gap: 12, flexGrow: 1, justifyContent: "center" },
  cabecera: { paddingHorizontal: 16, paddingTop: 10, gap: 8, alignItems: "center" },
  puntos: { flexDirection: "row", gap: 6 },
  punto: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.surface3 },
  niveles: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  nivel: { minWidth: 110, alignItems: "center", gap: 2, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 18, borderWidth: 2, backgroundColor: color.surface1 },
});
