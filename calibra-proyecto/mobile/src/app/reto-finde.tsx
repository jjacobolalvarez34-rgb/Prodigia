import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import Animated, { useSharedValue, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { chispasRetoFinde, ciudadesRetoFinde, INTENTOS_RETO_FINDE, MINIMO_ACIERTOS_PREMIO, msHastaCambioFinde, PREMIOS_RETO_FINDE, proximoSabado } from "@/lib/retoFinde";
import { COLOR_COMETA } from "@/lib/recompensas/iconoCometa";
import { sonar, vibrar } from "~/lib/efectos";
import { fijarChispas, recargarJugador } from "~/lib/jugador";
import { cargarFinde, iniciarFinde, rankingFinde, terminarFinde, type EstadoFinde, type ResultadoFinde } from "~/lib/retoFinde";
import { useSesion } from "~/lib/sesion";
import { mensajeError } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Barra from "~/ui/Barra";
import Boton3D from "~/ui/Boton3D";
import Confeti from "~/ui/Confeti";
import { IconoChispa, IconoCometa } from "~/ui/Iconos";
import { BotonAtras, TituloSeccion } from "~/ui/Pantalla";
import { PlacaFila } from "~/ui/placa/Placa";
import PreguntaReto from "~/ui/PreguntaReto";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, fuente, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";

// Reto de fin de semana (0281), igual que /reto-finde en la web: sábado y domingo,
// 10 preguntas de 3 ciudades iguales para todos, dos intentos; gana quien más acierta
// y, si empatan, quien tardó menos (el tiempo lo mide la base).

const seg = (ms: number | null | undefined) => (ms == null ? "—" : `${(ms / 1000).toFixed(1)} s`);

function textoFalta(ms: number) {
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(h / 24);
  return d > 0 ? `${d} d ${h % 24} h` : `${h} h ${Math.floor((ms % 3_600_000) / 60_000)} min`;
}

export default function RetoFinde() {
  const router = useRouter();
  const { sesion } = useSesion();
  const miId = sesion?.user.id ?? "";
  const [estado, setEstado] = useState<EstadoFinde | null>(null);
  const [fase, setFase] = useState<"intro" | "jugando" | "fin">("intro");
  const [indice, setIndice] = useState(0);
  const [elegida, setElegida] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [inicio, setInicio] = useState<number | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());
  const [resultado, setResultado] = useState<ResultadoFinde | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const sello = useSharedValue(1);
  const sacudida = useSharedValue(0);
  const respuestasRef = useRef<string[]>([]);

  useEffect(() => {
    if (!miId) return;
    cargarFinde(miId)
      .then((e) => {
        setEstado(e);
        if (e.premio) {
          sonar("logro");
          mostrarAviso(`¡Quedaste ${e.premio.puesto}.º el finde pasado! +${e.premio.cometas} Cometas`, "logro");
          recargarJugador();
        }
      })
      .catch((err) => mostrarAviso(mensajeError(err), "error"));
  }, [miId]);

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), fase === "jugando" ? 100 : 30_000);
    return () => clearInterval(id);
  }, [fase]);

  if (!estado) {
    return (
      <SafeAreaView style={[styles.pantalla, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={COLOR_COMETA} size="large" />
      </SafeAreaView>
    );
  }

  const total = estado.preguntas.length;
  const terminados = estado.intentos.filter((i) => i.terminado_at);
  const quedan = INTENTOS_RETO_FINDE - terminados.length;
  const ciudades = ciudadesRetoFinde(estado.sabado ?? proximoSabado());

  async function empezar() {
    setOcupado(true);
    try {
      const r = await iniciarFinde();
      setInicio(r.iniciadoAt);
      setEstado((e) => (e && !e.intentos.some((x) => x.intento === r.intento) ? { ...e, intentos: [...e.intentos, { intento: r.intento, correctos: null, tiempo_ms: null, terminado_at: null }] } : e));
      respuestasRef.current = [];
      setIndice(0);
      setElegida(null);
      setCombo(0);
      sonar("ya");
      setFase("jugando");
    } catch (err) {
      mostrarAviso(mensajeError(err), "error");
    } finally {
      setOcupado(false);
    }
  }

  async function terminar(respuestas: string[]) {
    setOcupado(true);
    try {
      const r = await terminarFinde(respuestas);
      setResultado(r);
      if (r.chispas > 0) fijarChispas(r.puntos_total);
      const ranking = estado?.sabado ? await rankingFinde(estado.sabado) : [];
      setEstado((e) => (e ? { ...e, ranking, intentos: e.intentos.map((x) => (x.intento === r.intento ? { ...x, correctos: r.correctos, tiempo_ms: r.tiempo_ms, terminado_at: new Date().toISOString() } : x)) } : e));
      sonar("logro");
      vibrar.exito();
      setFase("fin");
    } catch (err) {
      mostrarAviso(mensajeError(err), "error");
      setFase("intro");
    } finally {
      setOcupado(false);
    }
  }

  // No se muestra si acertaste hasta el final: corrige el servidor (revisión 2026-10-14).
  function responder(op: string) {
    if (elegida || !estado || ocupado) return;
    vibrar.seleccion();
    respuestasRef.current[indice] = op;
    if (indice + 1 >= total) {
      setElegida(op);
      terminar(respuestasRef.current.slice(0, total));
      return;
    }
    setIndice(indice + 1);
  }

  const ranking = (
    <>
      {estado.ranking.length > 0 && <TituloSeccion>{estado.sabado ? "Ranking de este finde" : "Así terminó el finde pasado"}</TituloSeccion>}
      {estado.ranking.slice(0, 20).map((f, i) => (
        <PlacaFila key={f.placa.id} placa={f.placa} puesto={f.puesto} valor={`${f.correctos}/10 · ${seg(f.tiempoMs)}`} indice={i} resaltar={f.placa.id === miId} />
      ))}
    </>
  );

  if (fase === "jugando") {
    const p = estado.preguntas[indice];
    const m = MUNDO_POR_SLUG[p.mundo as MundoSlug];
    return (
      <SafeAreaView style={styles.pantalla}>
        <View style={styles.cabecera}>
          <View style={{ flex: 1, gap: 4 }}>
            <Barra valor={indice / total} colores={[m?.base ?? "#2AA8D8", COLOR_COMETA]} duracion={400} />
            <Texto v="nota" tam={11} centro>
              Pregunta {indice + 1} de {total}
            </Texto>
          </View>
          <Texto v="mono" tam={16} c={COLOR_COMETA}>
            {seg(inicio ? ahora - inicio : 0)}
          </Texto>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, flexGrow: 1, justifyContent: "center" }}>
          <PreguntaReto pregunta={p} indice={indice} elegida={elegida} combo={combo} sello={sello} sacudida={sacudida} onResponder={responder} />
        </ScrollView>
        {ocupado && (
          <Texto v="nota" centro style={{ paddingBottom: 16 }}>
            Guardando…
          </Texto>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      {fase === "fin" && resultado && resultado.correctos >= 7 && <Confeti cantidad={40} />}
      <View style={{ padding: 16 }}>
        <BotonAtras />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
        {fase === "fin" && resultado ? (
          <Animated.View entering={ZoomIn.duration(320)} style={{ alignItems: "center", gap: 6 }}>
            <Texto v="micro" c={COLOR_COMETA}>
              ¡Terminaste!
            </Texto>
            <Texto style={{ fontFamily: fuente.mono, fontSize: 48, color: color.texto }}>
              {resultado.correctos}/{total}
            </Texto>
            <Texto v="mono" c={color.texto2}>
              {seg(resultado.tiempo_ms)}
            </Texto>
            {resultado.chispas > 0 && (
              <View style={styles.fila}>
                <IconoChispa tam={18} />
                <Texto v="mono" c={color.logro}>
                  +{resultado.chispas} Chispas
                </Texto>
              </View>
            )}
            <Texto v="nota" centro>
              Vas {resultado.puesto}.º con tu mejor intento ({resultado.mejor_correctos}/10 en {seg(resultado.mejor_tiempo_ms)}).
            </Texto>
          </Animated.View>
        ) : (
          <Animated.View entering={ZoomIn.duration(320)} style={{ alignItems: "center", gap: 6 }}>
            <Texto v="micro" c={COLOR_COMETA}>
              Reto de fin de semana
            </Texto>
            <Texto v="display" centro>
              10 preguntas, 3 ciudades
            </Texto>
            <Texto v="nota" centro>
              Las mismas para todos. Tienes dos intentos y cuenta el mejor: gana quien más acierta y, si empatan, quien tardó menos. Terminar el primero da hasta {chispasRetoFinde(10)} Chispas; los mejores puestos ganan Cometas el lunes (con {MINIMO_ACIERTOS_PREMIO} aciertos o más).
            </Texto>
          </Animated.View>
        )}

        <View style={[styles.fila, { justifyContent: "center", flexWrap: "wrap" }]}>
          {ciudades.map((c) => {
            const m = MUNDO_POR_SLUG[c as MundoSlug];
            return (
              <View key={c} style={[styles.ciudad, { borderColor: m?.neon ?? color.border }]}>
                <Texto v="fuerte" tam={13} c={m?.neon}>
                  {m?.nombre ?? c}
                </Texto>
              </View>
            );
          })}
        </View>

        <View style={styles.premios}>
          {PREMIOS_RETO_FINDE.map((p, i) => (
            <Tarjeta key={p.hasta} estilo={{ flex: 1, alignItems: "center", gap: 4, paddingVertical: 10 }}>
              <Texto v="micro">{i === 0 ? "1.º" : `Top ${p.hasta}`}</Texto>
              <View style={styles.fila}>
                <IconoCometa tam={16} />
                <Texto v="mono" tam={14}>
                  {p.cometas}
                </Texto>
              </View>
            </Tarjeta>
          ))}
        </View>

        {estado.sabado ? (
          <>
            {quedan > 0 ? (
              <Boton3D titulo={terminados.length === 0 ? "Empezar (el reloj corre)" : "Usar mi segundo intento"} icono={<IconoCometa tam={18} />} brillo cargando={ocupado} onPress={empezar} />
            ) : (
              <Texto v="nota" centro>
                Ya usaste tus dos intentos. ¡Mira cómo va el ranking!
              </Texto>
            )}
            <Texto v="nota" centro tam={12}>
              {quedan === 1 ? "Te queda 1 intento" : `Te quedan ${quedan} intentos`} · termina en {textoFalta(msHastaCambioFinde(new Date(ahora)))}
            </Texto>
          </>
        ) : (
          <Tarjeta acento={COLOR_COMETA} brillo={0.15}>
            <Texto v="h3" centro>
              Empieza el sábado
            </Texto>
            <Texto v="nota" centro>
              Faltan {textoFalta(msHastaCambioFinde(new Date(ahora)))}.
            </Texto>
          </Tarjeta>
        )}
        {ranking}
        {fase === "fin" && <Boton3D titulo="Listo" variante="secundario" onPress={() => router.back()} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bgHondo },
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  cabecera: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 10 },
  ciudad: { borderWidth: 2, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  premios: { flexDirection: "row", gap: 8 },
});
