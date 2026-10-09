import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeInRight, useSharedValue, withSequence, withTiming, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { rankingReto } from "~/lib/competir";
import { sonar, sonarAcierto, vibrar } from "~/lib/efectos";
import { fijarChispas, useJugador } from "~/lib/jugador";
import type { PlacaDatos } from "~/lib/placa";
import { CLAVE_PROGRESO, cargarReto, completarReto, type EstadoReto, type TipoReto } from "~/lib/retos";
import { useSesion } from "~/lib/sesion";
import { mensajeError } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Barra from "~/ui/Barra";
import Boton3D from "~/ui/Boton3D";
import Confeti from "~/ui/Confeti";
import Glifos from "~/ui/Glifos";
import { IconoCerrar, IconoChispa, IconoLlama } from "~/ui/Iconos";
import { BotonAtras, TituloSeccion } from "~/ui/Pantalla";
import Pentagrama, { FiguraRitmicaIcono } from "~/ui/Pentagrama";
import { PlacaFila } from "~/ui/placa/Placa";
import { animarAcierto, animarError, CartelFinal, TarjetaProblema } from "~/ui/Sprint";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import TextoLatex from "~/ui/TextoLatex";
import { brillo, color, conAlfa, fuente, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";

const CON_FORMULAS = new Set(["calculia", "circuitia", "estadistica", "trigonometria"]);

export default function Reto() {
  const router = useRouter();
  const { tipo: tipoParam } = useLocalSearchParams<{ tipo: string }>();
  const tipo: TipoReto = tipoParam === "semanal" ? "semanal" : "diario";
  const { sesion } = useSesion();
  const miId = sesion?.user.id ?? "";
  const { mundos } = useJugador();
  const [reto, setReto] = useState<EstadoReto | null>(null);
  const [fase, setFase] = useState<"intro" | "jugando" | "fin">("intro");
  const [indice, setIndice] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [elegida, setElegida] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [bonus, setBonus] = useState<number | null>(null);
  const [ranking, setRanking] = useState<{ placa: PlacaDatos; correctos: number }[]>([]);
  const [, setEnviando] = useState(false);
  const [cartel, setCartel] = useState<number | null>(null);
  const sello = useSharedValue(1);
  const sacudida = useSharedValue(0);
  const pulso = useSharedValue(0);
  const aciertosRef = useRef(0);

  useEffect(() => {
    if (!miId || mundos.length === 0) return;
    cargarReto(tipo, miId, mundos).then(async (r) => {
      setReto(r);
      rankingReto(tipo, r.clave).then(setRanking);
      if (r.completado) {
        setFase("fin");
        setAciertos(r.completado.correctos);
        setBonus(r.completado.puntosBonus);
        return;
      }
      try {
        const guardado = await AsyncStorage.getItem(CLAVE_PROGRESO(tipo, r.clave));
        if (guardado) {
          const p = JSON.parse(guardado) as { indice: number; aciertos: number };
          setIndice(p.indice);
          setAciertos(p.aciertos);
          aciertosRef.current = p.aciertos;
        }
      } catch {
        // Sin progreso guardado se arranca de cero.
      }
    });
  }, [miId, mundos, tipo]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (fase !== "jugando") return false;
      salir();
      return true;
    });
    return () => sub.remove();
  });

  function salir() {
    Alert.alert("¿Pausar el reto?", tipo === "semanal" ? "Tu avance queda guardado en este teléfono: sigue cuando quieras." : "Puedes volver a entrar hoy y seguir donde quedaste.", [
      { text: "Seguir", style: "cancel" },
      { text: "Salir", onPress: () => router.back() },
    ]);
  }

  async function terminar(correctos: number) {
    if (!reto) return;
    setEnviando(true);
    // Pantalla de carga como al terminar una partida (pedido 2026-10-09): el cartel
    // queda al menos un momento mientras se guardan y cuentan las recompensas.
    setCartel(0.25);
    sonar("ya");
    vibrar.exito();
    const minimo = new Promise((ok) => setTimeout(ok, 1300));
    try {
      const r = await completarReto(tipo, reto.clave, correctos, miId);
      setCartel(0.75);
      setBonus(r.puntos_bonus);
      fijarChispas(r.puntos_total);
      AsyncStorage.removeItem(CLAVE_PROGRESO(tipo, reto.clave)).catch(() => {});
      await minimo;
      setCartel(1);
      await new Promise((ok) => setTimeout(ok, 250));
      setCartel(null);
      sonar("victoria");
      setFase("fin");
      rankingReto(tipo, reto.clave).then(setRanking);
      r.logros.forEach((l) => mostrarAviso(`Logro: ${l.nombre}`, "logro"));
    } catch (e) {
      setCartel(null);
      mostrarAviso(mensajeError(e), "error");
    } finally {
      setEnviando(false);
    }
  }

  function responder(op: string) {
    if (!reto || elegida) return;
    const p = reto.preguntas[indice];
    const ok = op === p.respuesta;
    setElegida(op);
    if (ok) {
      aciertosRef.current += 1;
      setAciertos(aciertosRef.current);
      setCombo((c) => c + 1);
      sonarAcierto(combo + 1);
      vibrar.medio();
      animarAcierto(sello);
      pulso.set(withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 500 })));
    } else {
      setCombo(0);
      sonar("error");
      vibrar.error();
      animarError(sacudida);
    }
    const siguiente = indice + 1;
    AsyncStorage.setItem(CLAVE_PROGRESO(tipo, reto.clave), JSON.stringify({ indice: siguiente, aciertos: aciertosRef.current })).catch(() => {});
    setTimeout(
      () => {
        if (siguiente >= reto.preguntas.length) {
          terminar(aciertosRef.current);
          return;
        }
        setIndice(siguiente);
        setElegida(null);
      },
      ok ? 650 : 1300
    );
  }

  if (!reto) {
    return (
      <SafeAreaView style={[styles.pantalla, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={color.logro} size="large" />
      </SafeAreaView>
    );
  }

  const total = reto.preguntas.length;
  const etiqueta = tipo === "diario" ? "Reto diario" : "Reto semanal";

  if (fase === "intro") {
    return (
      <SafeAreaView style={styles.pantalla}>
        <Glifos glifos={["✦", "?", "★"]} acento={color.logro} cantidad={10} />
        <View style={{ padding: 16 }}>
          <BotonAtras />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
          <Animated.View entering={ZoomIn.duration(320)} style={{ alignItems: "center", gap: 6 }}>
            <Texto v="micro" c={color.logro}>
              {etiqueta}
            </Texto>
            <Texto v="display" centro>
              {total} preguntas de tus ciudades
            </Texto>
            <Texto v="nota" centro>
              Las mismas para todos {tipo === "diario" ? "hoy" : "esta semana"}. Cada acierto suma Chispas de bonus.
            </Texto>
          </Animated.View>
          <Tarjeta acento={color.racha} brillo={0.2}>
            <View style={styles.fila}>
              <IconoLlama tam={30} estado={reto.racha > 0 ? "llamas" : "apagada"} />
              <View>
                <Texto v="h3">
                  Racha de {reto.racha} {tipo === "diario" ? (reto.racha === 1 ? "día" : "días") : reto.racha === 1 ? "semana" : "semanas"}
                </Texto>
                <Texto v="nota">Complétalo para no cortarla.</Texto>
              </View>
            </View>
          </Tarjeta>
          {indice > 0 && (
            <Tarjeta>
              <Texto v="nota">
                Vas por la pregunta {indice + 1} de {total} ({aciertos} aciertos).
              </Texto>
              <Barra valor={indice / total} colores={["#B87800", "#FFB627"]} estilo={{ marginTop: 8 }} />
            </Tarjeta>
          )}
          <Boton3D titulo={indice > 0 ? "Seguir" : "¡Empezar!"} variante="logro" brillo onPress={() => { sonar("ya"); setFase("jugando"); }} />
          {ranking.length > 0 && (
            <>
              <TituloSeccion>Quiénes ya lo hicieron</TituloSeccion>
              {ranking.slice(0, 10).map((f, i) => (
                <PlacaFila key={f.placa.id} placa={f.placa} puesto={i + 1} valor={`${f.correctos}/${total}`} indice={i} resaltar={f.placa.id === miId} />
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (fase === "fin") {
    return (
      <SafeAreaView style={styles.pantalla}>
        {aciertos / total >= 0.6 && <Confeti cantidad={40} />}
        <View style={{ padding: 16 }}>
          <BotonAtras />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
          <Animated.View entering={ZoomIn.duration(320)} style={{ alignItems: "center", gap: 4 }}>
            <Texto v="micro" c={color.logro}>
              {etiqueta} completado
            </Texto>
            <Texto style={{ fontFamily: fuente.mono, fontSize: 56, color: color.texto }}>
              {aciertos}/{total}
            </Texto>
            {bonus != null && (
              <View style={styles.fila}>
                <IconoChispa tam={20} />
                <Texto v="mono" tam={18} c={color.logro}>
                  +{bonus.toLocaleString("es")} Chispas
                </Texto>
              </View>
            )}
          </Animated.View>
          <TituloSeccion>Ranking</TituloSeccion>
          {ranking.map((f, i) => (
            <PlacaFila key={f.placa.id} placa={f.placa} puesto={i + 1} valor={`${f.correctos}/${total}`} indice={i} resaltar={f.placa.id === miId} />
          ))}
          <Boton3D titulo="Listo" variante="secundario" onPress={() => router.back()} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const p = reto.preguntas[indice];
  const m = MUNDO_POR_SLUG[p.mundo as MundoSlug];
  const formulas = CON_FORMULAS.has(p.mundo);
  const esCodigo = p.mundo === "codia";

  return (
    <SafeAreaView style={styles.pantalla}>
      <Glifos glifos={m?.glifos ?? ["?"]} acento={m?.neon ?? color.logro} cantidad={7} pulso={pulso} />
      <View style={styles.cabecera}>
        <Pressable onPress={salir} hitSlop={12} style={styles.x}>
          <IconoCerrar tam={16} c={color.texto2} />
        </Pressable>
        <View style={{ flex: 1, gap: 4 }}>
          <Barra valor={indice / total} colores={["#B87800", "#FFB627"]} duracion={400} />
          <Texto v="nota" tam={11} centro>
            {indice + 1} de {total} · {aciertos} aciertos
          </Texto>
        </View>
        {combo >= 2 ? (
          <Texto v="mono" c={color.racha}>
            ×{combo}🔥
          </Texto>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, flexGrow: 1, justifyContent: "center" }}>
        <Animated.View key={indice} entering={FadeInRight.duration(300)}>
          <TarjetaProblema acento={m?.neon ?? color.logro} combo={combo} feedback={!elegida ? "idle" : elegida === p.respuesta ? "correcto" : "incorrecto"} sello={sello} sacudida={sacudida}>
            <Texto v="micro" c={m?.neon}>
              {m?.nombre ?? p.mundo}
            </Texto>
            {p.notasMelodia && <Pentagrama notas={p.notasMelodia} disposicion={p.disposicionMelodia} acento={m?.neon} />}
            {p.figuraMelodia && <FiguraRitmicaIcono figura={p.figuraMelodia} acento={m?.neon} />}
            {formulas ? (
              <TextoLatex texto={p.enunciado} centro estilo={{ fontFamily: fuente.display, fontSize: 20, lineHeight: 26, color: color.texto }} />
            ) : (
              <Texto style={{ fontFamily: esCodigo ? fuente.monoMedio : fuente.display, fontSize: esCodigo ? 15 : 20, lineHeight: esCodigo ? 21 : 26, color: color.texto, textAlign: esCodigo ? "left" : "center", alignSelf: "stretch" }}>
                {p.enunciado}
              </Texto>
            )}
          </TarjetaProblema>
        </Animated.View>
        <View style={{ gap: 10 }}>
          {p.opciones.map((op, i) => {
            const correcta = !!elegida && op === p.respuesta;
            const mala = elegida === op && op !== p.respuesta;
            return (
              <Animated.View key={`${indice}-${op}`} entering={FadeInDown.delay(80 + i * 60).duration(300)}>
                <Pressable
                  disabled={!!elegida}
                  onPress={() => {
                    vibrar.seleccion();
                    responder(op);
                  }}
                  style={({ pressed }) => [
                    styles.opcion,
                    pressed && { transform: [{ scale: 0.97 }] },
                    correcta && { borderColor: color.correcto, backgroundColor: conAlfa(color.correcto, 0.15), boxShadow: brillo(color.correcto, 16, 0.35) },
                    mala && { borderColor: color.error, backgroundColor: conAlfa(color.error, 0.15) },
                  ]}
                >
                  {formulas ? (
                    <TextoLatex texto={op} centro estilo={{ fontFamily: fuente.cuerpoFuerte, fontSize: 15, color: color.texto }} />
                  ) : (
                    <Texto style={{ fontFamily: esCodigo ? fuente.monoMedio : fuente.cuerpoFuerte, fontSize: 15, color: color.texto, textAlign: "center" }}>
                      {op}
                    </Texto>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
      {cartel != null && <CartelFinal texto="¡Reto completado!" nota="Contando tus recompensas…" acento={color.logro} progreso={cartel} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bgHondo },
  fila: { flexDirection: "row", alignItems: "center", gap: 10 },
  cabecera: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 6 },
  x: { width: 38, height: 38, borderRadius: 19, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border, alignItems: "center", justifyContent: "center" },
  opcion: { borderWidth: 2, borderColor: color.border, backgroundColor: color.surface1, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 14 },
});
