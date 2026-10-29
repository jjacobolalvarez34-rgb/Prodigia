import { Image } from "expo-image";
import { celebracionDe } from "@/lib/temas/celebracion";
import { useTemaHoy } from "~/lib/temporada";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BackHandler, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ResultadoDuelo } from "~/lib/competir";
import { sonar, vibrar } from "~/lib/efectos";
import { recargarJugador, useJugador } from "~/lib/jugador";
import { anuncioEntrePartidas, contarPartida } from "~/lib/publicidad";
import { totalPendientes, usePendientes } from "~/lib/recompensas";
import { useExtrasPartida, type ResultadoPartida } from "~/lib/partida";
import Anillo from "~/ui/Anillo";
import Barra from "~/ui/Barra";
import Boton3D from "~/ui/Boton3D";
import CapsulaNivel from "~/ui/CapsulaNivel";
import ComparativaDuelo from "~/ui/ComparativaDuelo";
import ResultadoVersus from "~/ui/ResultadoVersus";
import Ciudad from "~/ui/Ciudad";
import Confeti from "~/ui/Confeti";
import { IconoCheck, IconoChispa, IconoCometa, IconoLlama, IconoRegalo } from "~/ui/Iconos";
import { COLOR_COMETA } from "@/lib/recompensas/iconoCometa";
import NumeroAnimado from "~/ui/NumeroAnimado";
import RepasoErrores from "~/ui/RepasoErrores";
import PedirAvisos from "~/ui/PedirAvisos";
import Tarjeta from "~/ui/Tarjeta";
import type { FallaRepaso } from "@/lib/practica/repaso";
import { compartirFinPartida } from "@/lib/partidas/compartir";
import type { RespuestaPartida } from "@/lib/partidas/estadisticas";
import CompartirPartida from "~/ui/CompartirPartida";
import Texto from "~/ui/Texto";
import { brillo, color, conAlfa, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";

type Datos = ResultadoPartida & { xp: number; correctos: number; total: number; tiempoMs?: number; duelo?: ResultadoDuelo | null; dueloId?: string | null; rival?: string | null; fallos?: FallaRepaso[]; respuestas?: RespuestaPartida[] };

const TEMAS: Record<string, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
  mezcla: "Práctica rápida",
  america: "América",
  europa: "Europa",
  africa: "África",
  asia_oceania: "Asia y Oceanía",
};

// Cascada de recompensas (02-SISTEMA-VISUAL.md §7.3): resultado → Exp → Chispas que
// vuelan → racha → meta del día → logros → duelo. Cada paso espera al anterior y un
// toque adelanta todo al final. Los números vienen del servidor; acá solo se animan.
const PASOS_MS = [0, 900, 1900, 2900, 3700, 4500, 5300];

function Moneda({ i }: { i: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(i * 90, withTiming(1, { duration: 900, easing: Easing.bezier(0.5, -0.4, 0.7, 1) })));
  }, [t, i]);
  const estilo = useAnimatedStyle(() => ({
    opacity: t.value < 0.85 ? 1 : (1 - t.value) * 6,
    transform: [{ translateX: t.value * (40 + i * 6) }, { translateY: -t.value * 260 }, { scale: 1 - t.value * 0.4 }],
  }));
  return (
    <Animated.View style={[{ position: "absolute", left: 30 + (i % 3) * 10, top: 14 }, estilo]}>
      <IconoChispa tam={16} />
    </Animated.View>
  );
}

function Rayos({ c }: { c: string }) {
  const giro = useSharedValue(0);
  useEffect(() => {
    giro.set(withRepeat(withTiming(1, { duration: 6000, easing: Easing.linear }), -1));
  }, [giro]);
  const estilo = useAnimatedStyle(() => ({ transform: [{ rotate: `${giro.value * 360}deg` }] }));
  return (
    <Animated.View style={[{ position: "absolute", width: 300, height: 300, alignItems: "center", justifyContent: "center" }, estilo]} pointerEvents="none">
      {Array.from({ length: 12 }, (_, i) => (
        <View key={i} style={{ position: "absolute", width: 6, height: 300, backgroundColor: conAlfa(c, 0.12), transform: [{ rotate: `${i * 15}deg` }] }} />
      ))}
    </Animated.View>
  );
}

function Paso({ visible, children, indice }: { visible: boolean; children: ReactNode; indice: number }) {
  if (!visible) return null;
  return <Animated.View entering={FadeInDown.delay(indice === 0 ? 0 : 60).duration(300)}>{children}</Animated.View>;
}

export default function Resultado() {
  const temaHoy = useTemaHoy();
  const celebracion = celebracionDe(temaHoy);
  const router = useRouter();
  const pendientesRecompensas = usePendientes();
  const { placa, resumen: resumenJugador } = useJugador();
  const params = useLocalSearchParams<{ mundo?: string; tema?: string; datos?: string; repetir?: string }>();
  const mundo = MUNDO_POR_SLUG[(params.mundo ?? "numeria") as MundoSlug] ?? MUNDO_POR_SLUG.numeria;
  const [d] = useState(() => JSON.parse(params.datos ?? "{}") as Datos);
  const [paso, setPaso] = useState(0);
  // Los logros se terminan de contar con esta pantalla abierta (cierre rápido, 2026-10-28):
  // llegan antes de su paso casi siempre y, si no, aparecen suaves cuando estén.
  const extras = useExtrasPartida(d.cierreId);
  const logros = d.logros?.length ? d.logros : extras.logros;
  const sonoLogro = useRef(false);
  // El duelo puede resolverse con la pantalla abierta (el rival termina después).
  const [duelo, setDuelo] = useState<ResultadoDuelo | null>(d.duelo ?? null);
  // Después de un duelo se vuelve a Competir (o a Social si fue con un amigo), no a la ciudad.
  const tipoSalida = duelo ? (duelo.clasificatorio === false ? "amigos" : "rankeds") : null;
  const salida = useMemo(
    () => (tipoSalida === "amigos" ? { pathname: "/social", params: { seccion: "amigos" } } : tipoSalida === "rankeds" ? { pathname: "/competir", params: { seccion: "rankeds" } } : `/${mundo.slug}`) as Href,
    [tipoSalida, mundo.slug]
  );
  // Cápsula de Chispas al subir de nivel de cuenta: aparece una vez, al llegar a
  // ese paso de la cascada (o al saltar al final).
  const [capsulaCerrada, setCapsulaCerrada] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const precision = d.total > 0 ? d.correctos / d.total : 0;
  const subioMundo = d.nivelMundo != null && d.nivelMundoAnterior != null && d.nivelMundo > d.nivelMundoAnterior;
  const subioRacha = d.rachaDespues > d.rachaAntes;
  const titulo = duelo?.resuelto ? (duelo.gane ? "¡Ganaste el duelo!" : duelo.empate ? "¡Empate!" : "Perdiste el duelo") : duelo ? "¡Terminaste tu parte!" : precision >= 0.9 ? (celebracion?.perfecta ?? "¡Sprint perfecto!") : precision >= 0.7 ? "¡Buen sprint!" : precision >= 0.4 ? "¡Bien jugado!" : "¡A seguir!";
  const ultimoPaso = PASOS_MS.length - 1;

  const esDuelo = !!d.duelo || !!d.dueloId;
  // Anuncio entre partidas (solo cuentas gratis, uno cada 3 de práctica, nunca en
  // duelos): se cuenta al llegar y se muestra al salir.
  const salir = (ir: () => void) => (esDuelo ? ir() : void anuncioEntrePartidas().then(ir));

  useEffect(() => {
    if (!esDuelo) void contarPartida();
  }, [esDuelo]);

  useEffect(() => {
    recargarJugador();
    timers.current = PASOS_MS.map((ms, i) => setTimeout(() => setPaso((p) => Math.max(p, i)), ms));
    return () => timers.current.forEach(clearTimeout);
  }, []);

  // Sonido y vibración de cada paso.
  useEffect(() => {
    if (paso === 0) {
      if (duelo?.resuelto) sonar(duelo.gane ? "victoria" : duelo.empate ? "combo" : "derrota");
      else sonar(precision >= 0.7 ? "victoria" : "recompensa");
      vibrar.exito();
    }
    if (paso === 1 && subioMundo) {
      sonar("nivel");
      vibrar.fuerte();
    }
    if (paso === 3 && subioRacha) {
      sonar("racha");
      vibrar.exito();
    }
  }, [paso]); // eslint-disable-line react-hooks/exhaustive-deps

  // Logro: suena al llegar a su paso, o cuando llega si el paso ya pasó.
  useEffect(() => {
    if (paso >= 5 && logros.length > 0 && !d.nivelCuentaSubio && !sonoLogro.current) {
      sonoLogro.current = true;
      sonar("logro");
      vibrar.fuerte();
    }
  }, [paso, logros.length, d.nivelCuentaSubio]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      salir(() => router.dismissTo(salida));
      return true;
    });
    return () => sub.remove();
  }, [router, salida]); // eslint-disable-line react-hooks/exhaustive-deps

  function saltar() {
    if (paso >= ultimoPaso) return;
    timers.current.forEach(clearTimeout);
    setPaso(ultimoPaso);
  }

  // Economía nueva (0280): lo que suma la partida ya no es la Experiencia.
  const chispasAntes = Math.max(0, (d.chispasTotal ?? 0) - (d.chispasPartida ?? 0) - (d.bonusNivel ?? 0));
  const s = Math.round((d.tiempoMs ?? 0) / 1000);
  const rival = duelo?.oponente_nombre ?? d.rival ?? "tu rival";
  const seg = (ms: number | null | undefined) => (ms == null ? "—" : `${(ms / 1000).toFixed(1)}s`);
  const pct = (p: number | null | undefined) => (p == null ? "—" : `${Math.round(p * 100)}%`);
  const aciertosDe = (p: number | null | undefined) => (p == null ? "—" : `${Math.round(p * d.total)}/${d.total}`);
  // Compartir (2026-10-21): la tarjeta sale de lo que esta pantalla ya tiene.
  const compartir = useMemo(
    () =>
      compartirFinPartida({
        mundo: mundo.slug,
        desde: null,
        sprint: { total: d.total, correctos: d.correctos, xpGanado: d.xp, avgTimeMs: null },
        respuestas: d.respuestas ?? null,
        nombre: placa?.nombre ?? null,
        duelId: d.dueloId ?? null,
        duelo,
        rivalNombre: d.rival ?? null,
      }),
    [mundo.slug, d, placa?.nombre, duelo]
  );

  return (
    <SafeAreaView style={styles.pantalla}>
      {/* La ciudad del mundo de fondo, de noche, abajo de todo el resumen. */}
      <View style={styles.fondoCiudad} pointerEvents="none">
        <Ciudad semilla={mundo.slug} acento={mundo.neon} alto={260} radio={0} densidad={1.2} />
        <LinearGradient colors={[color.bg, "rgba(9,12,20,0.3)", "rgba(9,12,20,0)"]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      </View>
      {(duelo ? duelo.gane : precision >= 0.7) && <Confeti key={duelo?.resuelto ? "duelo" : "sprint"} cantidad={40} />}
      {/* Sin Pressable alrededor: envolver el ScrollView en uno le quitaba el desplazamiento
          y lo de abajo quedaba tapado por los botones. Cualquier toque adelanta la cascada. */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false} onTouchStart={saltar}>
          <Paso visible indice={0}>
            <View style={{ alignItems: "center", gap: 2, marginTop: 6 }}>
              <Texto v="micro" c={mundo.neon}>
                {mundo.nombre} · {TEMAS[params.tema ?? ""] ?? params.tema ?? ""}
                {duelo ? ` · vs ${rival}` : ""}
              </Texto>
              {!duelo && (
                <Animated.View entering={ZoomIn.duration(320)}>
                  <Texto v="display" tam={32} centro>
                    {titulo}
                  </Texto>
                </Animated.View>
              )}
              {/* Halloween: los esqueletos bailan en el resultado (WebP animado ya hecho). */}
              {!duelo && celebracion && temaHoy?.tema.id === "halloween" && (
                <Image source={require("../../assets/emotes/baile-esqueletos-grande.webp")} style={{ width: 280, height: 171 }} contentFit="contain" autoplay />
              )}
            </View>
            {/* En un duelo manda el versus (igual que ResultadoDueloBlock de la web): quién
                ganó, el ELO y tú contra el rival. Tu resumen personal va debajo. */}
            {duelo && (
              <View style={{ marginTop: 10 }}>
                {duelo.resuelto ? (
                  <ResultadoVersus
                    gane={!!duelo.gane}
                    empate={!!duelo.empate}
                    rival={rival}
                    linea={duelo.empate ? `Empataste con ${rival}` : duelo.gane ? `Le ganaste a ${rival}` : `Esta vez ganó ${rival}`}
                    marcador={duelo.mi_puntaje != null && duelo.rival_puntaje != null ? `${duelo.mi_puntaje} – ${duelo.rival_puntaje}` : undefined}
                    eloAnterior={duelo.clasificatorio !== false ? duelo.elo_anterior : null}
                    eloNuevo={duelo.clasificatorio !== false ? duelo.elo_nuevo : null}
                    desglose={
                      duelo.mi_precision != null || duelo.rival_precision != null
                        ? [
                            { etiqueta: "aciertos", mio: aciertosDe(duelo.mi_precision), suyo: aciertosDe(duelo.rival_precision) },
                            { etiqueta: "precisión", mio: pct(duelo.mi_precision), suyo: pct(duelo.rival_precision) },
                            ...(duelo.mi_tiempo_promedio != null || duelo.rival_tiempo_promedio != null
                              ? [{ etiqueta: "tiempo prom.", mio: seg(duelo.mi_tiempo_promedio), suyo: seg(duelo.rival_tiempo_promedio) }]
                              : []),
                          ]
                        : undefined
                    }
                  />
                ) : (
                  <ComparativaDuelo duelId={d.dueloId ?? null} inicial={duelo} rivalNombre={rival} total={d.total} acento={mundo.neon} onResuelto={setDuelo} />
                )}
              </View>
            )}
            {duelo && (
              <Texto v="micro" style={{ marginTop: 14 }}>
                Tu partida
              </Texto>
            )}
            <View style={[styles.fila, { marginTop: duelo ? 6 : 12 }]}>
              {[
                [`${d.correctos}/${d.total}`, "aciertos"],
                [`${Math.round(precision * 100)}%`, "precisión"],
                [s ? `0:${String(Math.min(60, s)).padStart(2, "0")}` : "—", "tiempo"],
              ].map(([v, t], i) => (
                <View key={t} style={{ flex: 1 }}>
                  <Tarjeta indice={i} estilo={{ alignItems: "center", paddingVertical: 10 }}>
                    <Texto v="mono" tam={20}>
                      {v}
                    </Texto>
                    <Texto v="nota" tam={11}>
                      {t}
                    </Texto>
                  </Tarjeta>
                </View>
              ))}
            </View>
          </Paso>

          <Paso visible={paso >= 1} indice={1}>
            <Tarjeta acento={subioMundo ? mundo.neon : undefined} brillo={subioMundo ? 0.35 : 0} sinEntrada>
              {subioMundo && <Rayos c={mundo.neon} />}
              <View style={styles.entre}>
                <NumeroAnimado valor={d.xp} desde={0} v="mono" prefijo="+" sufijo=" Exp" c={mundo.neon} estilo={{ fontSize: 20 }} />
                <Texto v="nota">
                  {mundo.nombre}{" "}
                  <Texto v="mono" tam={13} c={color.texto}>
                    Nv {d.nivelMundo ?? "—"}
                  </Texto>
                </Texto>
              </View>
              {subioMundo && (
                <Animated.View entering={ZoomIn.delay(200).duration(320)}>
                  <Texto v="h3" c={mundo.neon} style={{ marginTop: 6 }}>
                    ¡{mundo.nombre} subió al nivel {d.nivelMundo}!
                  </Texto>
                </Animated.View>
              )}
              <Barra valor={(d.nivelMundo ?? 1) / 100} acento={mundo.base} alto={10} estilo={{ marginTop: 10 }} />
            </Tarjeta>
          </Paso>

          <Paso visible={paso >= 2} indice={2}>
            <View style={styles.fila}>
              <View style={{ flex: 1 }}>
                <Tarjeta sinEntrada acento={color.logro} brillo={0.18} estilo={{ alignItems: "center" }}>
                  {paso === 2 && Array.from({ length: Math.min(8, Math.max(3, Math.round((d.chispasPartida ?? 0) / 3))) }, (_, i) => <Moneda key={i} i={i} />)}
                  <View style={styles.filaCentro}>
                    <IconoChispa tam={22} />
                    <NumeroAnimado valor={d.chispasTotal ?? 0} desde={chispasAntes} v="mono" c={color.logro} estilo={{ fontSize: 18 }} duracion={1100} onTic={() => sonar("moneda")} />
                  </View>
                  <Texto v="nota" tam={11}>
                    Chispas
                  </Texto>
                </Tarjeta>
              </View>
              <View style={{ flex: 1 }}>
                {paso >= 3 && (
                  <Tarjeta sinEntrada acento={subioRacha ? color.racha : undefined} brillo={subioRacha ? 0.3 : 0} estilo={{ alignItems: "center" }}>
                    <Animated.View entering={subioRacha ? ZoomIn.duration(320) : FadeIn} style={styles.filaCentro}>
                      <IconoLlama tam={24} estado={d.rachaDespues >= 7 ? "llamas" : d.rachaDespues > 0 ? "encendida" : "apagada"} />
                      <Texto v="mono" tam={18} c={color.racha}>
                        {d.rachaDespues} {d.rachaDespues === 1 ? "día" : "días"}
                      </Texto>
                    </Animated.View>
                    <Texto v="nota" tam={11}>
                      {subioRacha ? "¡Racha +1!" : "racha"}
                    </Texto>
                  </Tarjeta>
                )}
              </View>
            </View>
          </Paso>

          {d.sinConexion && (
            <Tarjeta sinEntrada acento={color.racha}>
              <Texto v="h3">Jugaste sin conexión</Texto>
              <Texto v="nota">Tu partida quedó guardada en el teléfono. Tu Exp, tu racha y tus niveles se suben solos cuando vuelva internet.</Texto>
            </Tarjeta>
          )}

          <Paso visible={paso >= 4 && !d.sinConexion} indice={4}>
            <Tarjeta sinEntrada>
              <View style={styles.fila}>
                <Anillo valor={(d.xpHoy ?? 0) / Math.max(1, d.metaDiaria ?? 100)} tam={56} grosor={6} acento={d.metaAlcanzada ? color.correcto : color.logro}>
                  {d.metaAlcanzada ? <IconoCheck tam={20} c={color.correcto} /> : <Texto v="mono" tam={11}>{Math.round(((d.xpHoy ?? 0) / Math.max(1, d.metaDiaria ?? 100)) * 100)}%</Texto>}
                </Anillo>
                <View style={{ flex: 1 }}>
                  <Texto v="h3">{d.metaAlcanzada ? "¡Meta del día cumplida!" : "Meta del día"}</Texto>
                  <Texto v="nota">
                    {d.xpHoy ?? 0} / {d.metaDiaria ?? 100} Exp hoy
                  </Texto>
                </View>
              </View>
            </Tarjeta>
          </Paso>

          <Paso visible={paso >= 5} indice={5}>
            <View style={{ gap: 10 }}>
              {totalPendientes(pendientesRecompensas) > 0 && (
                <Pressable onPress={() => router.push("/recompensas")}>
                  <Tarjeta sinEntrada acento={color.logro} brillo={0.3}>
                    <View style={styles.fila}>
                      <IconoRegalo tam={30} c={color.logro} />
                      <View style={{ flex: 1 }}>
                        <Texto v="micro" c={color.logro}>
                          Recompensas
                        </Texto>
                        <Texto v="h3">
                          {pendientesRecompensas.capsulas > 0
                            ? `Tienes ${pendientesRecompensas.capsulas} ${pendientesRecompensas.capsulas === 1 ? "cápsula" : "cápsulas"} por abrir`
                            : "Tienes recompensas por reclamar"}
                        </Texto>
                        <Texto v="nota" tam={12}>
                          Toca para abrirlas
                        </Texto>
                      </View>
                    </View>
                  </Tarjeta>
                </Pressable>
              )}
              {d.nivelCuentaSubio && (
                <Tarjeta sinEntrada acento={color.primario} brillo={0.35}>
                  <View style={styles.fila}>
                    <Animated.View entering={ZoomIn.duration(320)} style={[styles.hex, { boxShadow: brillo(color.primario, 20, 0.5) }]}>
                      <Texto v="mono" tam={18} c="#fff">
                        {d.nivelCuentaNuevo}
                      </Texto>
                    </Animated.View>
                    <View style={{ flex: 1 }}>
                      <Texto v="micro" c={color.primarioClaro}>
                        ¡Subiste de nivel!
                      </Texto>
                      <Texto v="h3">Nivel {d.nivelCuentaNuevo}</Texto>
                      {d.bonusNivel > 0 && <Texto v="nota">+{d.bonusNivel.toLocaleString("es")} Chispas de regalo</Texto>}
                      {(d.cometasNivel ?? 0) > 0 && (
                        <View style={[styles.filaCentro, { justifyContent: "flex-start", marginTop: 2 }]}>
                          <IconoCometa tam={16} />
                          <Texto v="nota" c={COLOR_COMETA}>
                            +{d.cometasNivel} Cometas
                          </Texto>
                        </View>
                      )}
                    </View>
                  </View>
                </Tarjeta>
              )}
              {logros.map((l) => (
                <Animated.View key={l.nombre} entering={FadeIn.duration(350)}>
                  <Tarjeta sinEntrada acento={color.logro} brillo={0.3}>
                    <View style={styles.fila}>
                      <Animated.View entering={ZoomIn.duration(320)} style={styles.medalla}>
                        <IconoCheck tam={20} c="#3A2600" />
                      </Animated.View>
                      <View style={{ flex: 1 }}>
                        <Texto v="micro" c={color.logro}>
                          Logro desbloqueado
                        </Texto>
                        <Texto v="h3">{l.nombre}</Texto>
                        <Texto v="nota" tam={12}>
                          {l.descripcion}
                        </Texto>
                      </View>
                    </View>
                  </Tarjeta>
                </Animated.View>
              ))}
            </View>
          </Paso>
          {paso >= ultimoPaso && (d.fallos?.length ?? 0) > 0 && (
            <Animated.View entering={FadeInDown.duration(300)}>
              <RepasoErrores fallos={d.fallos ?? []} acento={mundo.neon} />
            </Animated.View>
          )}
          {/* Una sola vez: el permiso de avisos, ya con una partida jugada. */}
          {paso >= ultimoPaso && <PedirAvisos racha={resumenJugador?.racha ?? 0} />}
      </ScrollView>

      <View style={styles.pie}>
        {paso >= ultimoPaso ? (
          <Animated.View entering={FadeInDown.duration(300)} style={{ gap: 10 }}>
            {duelo ? (
              <Boton3D titulo={duelo.clasificatorio === false ? "Volver a mis amigos" : "Otro duelo"} acento={mundo.base} brillo onPress={() => router.dismissTo(salida)} />
            ) : (
              <Boton3D titulo="Otra partida" acento={mundo.base} brillo onPress={() => salir(() => (params.repetir ? router.replace(JSON.parse(params.repetir)) : router.back()))} />
            )}
            <CompartirPartida origen={compartir.origen} tarjeta={compartir.tarjeta} acento={mundo.base} />
            {!duelo && (
              <Pressable onPress={() => salir(() => router.dismissTo(`/${mundo.slug}` as "/numeria"))} hitSlop={10}>
                <Texto v="nota" centro>
                  Volver al mundo
                </Texto>
              </Pressable>
            )}
          </Animated.View>
        ) : (
          <Texto v="nota" centro>
            Toca para ver todo
          </Texto>
        )}
      </View>
      {d.nivelCuentaSubio && paso >= 5 && !capsulaCerrada && (
        <CapsulaNivel
          nivel={d.nivelCuentaNuevo}
          bonus={d.bonusNivel ?? 0}
          onCerrar={() => {
            setCapsulaCerrada(true);
            recargarJugador();
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fondoCiudad: { position: "absolute", left: 0, right: 0, bottom: 0, height: 260, opacity: 0.8 },
  pantalla: { flex: 1, backgroundColor: color.bg },
  contenido: { padding: 16, gap: 12, paddingBottom: 40 },
  fila: { flexDirection: "row", alignItems: "center", gap: 10 },
  filaCentro: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pie: { paddingHorizontal: 16, paddingBottom: 14, minHeight: 110, justifyContent: "flex-end" },
  hex: { width: 48, height: 48, borderRadius: 14, backgroundColor: color.primario, alignItems: "center", justifyContent: "center" },
  medalla: { width: 46, height: 46, borderRadius: 23, backgroundColor: color.logro, alignItems: "center", justifyContent: "center", boxShadow: brillo(color.logro, 18, 0.5) },
});
