import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown, useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import type { FallaRepaso } from "@/lib/practica/repaso";
import { GRUPOS_NUMERIA, LARGOS_ZEN, nivelDePregunta, nivelSugerido, normalizarConfigZen, opcionesZen, opcionVisible, rangosAritmetica, type ConfigZen } from "@/lib/zen/config";
import { estadisticasZen, formatearDuracion, resultadoDe, type RegistroZen, type ResultadoBarra } from "@/lib/zen/estadisticas";
import { sonar, sonarAcierto, vibrar } from "~/lib/efectos";
import { useJugador } from "~/lib/jugador";
import { useSesion } from "~/lib/sesion";
import { cargarNivelesZen, claveZen, fallaZen, generarZen, guardarConfigZen, leerConfigZen, nombreDificultad, prepararZen, registrarPartidaZen, solucionZen, temasZen, type PreguntaZen } from "~/lib/zen";
import Boton3D from "~/ui/Boton3D";
import Glifos from "~/ui/Glifos";
import { IconoBombilla, IconoZen } from "~/ui/Iconos";
import MapaGeografia from "~/ui/MapaGeografia";
import { PantallaApilada } from "~/ui/Pantalla";
import { CuerpoPregunta, esRespuestaCorrecta, OpcionesPregunta, TecladoPregunta, type Feedback } from "~/ui/PreguntaVista";
import RepasoErrores from "~/ui/RepasoErrores";
import Segmentos from "~/ui/Segmentos";
import { animarAcierto, animarError, opcionesADescartar, TarjetaProblema } from "~/ui/Sprint";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, conAlfa, fuente, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";

// Modo Zen (calibra/docs/PLAN_MODO_SIN_RELOJ.md): eliges temas (uno o varios), la
// dificultad (un nivel o un rango que va subiendo), cuántas preguntas y las opciones
// del mundo, y juegas sin reloj. Si fallas, puedes intentar otra vez o ver la
// respuesta; las pistas son gratis. No da Chispas ni XP: solo cuenta para la racha.
// Al final: estadísticas de la sesión, tu ritmo y el repaso de cada pregunta fallada.
// Misma lógica que la web (calibra/src/components/zen/ZenClient.tsx).

type Fase = "elegir" | "jugando" | "final";

const COLOR_BARRA: Record<ResultadoBarra, string> = { primero: color.correcto, segundo: color.logro, fallada: color.error };
const LEYENDA: Record<ResultadoBarra, string> = { primero: "Al primer intento", segundo: "Al segundo intento", fallada: "Fallada" };

export default function Zen() {
  const router = useRouter();
  const { mundo: slug } = useLocalSearchParams<{ mundo: string }>();
  const mundo = MUNDO_POR_SLUG[slug as MundoSlug];
  const temas = temasZen(slug ?? "");
  const opciones = opcionesZen(slug ?? "");
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  // Igual que la web: el Zen solo en mundos tuyos (o con Pro).
  const { mundos, plan } = useJugador();
  const mundoBloqueado = mundos.length > 0 && plan !== "pro" && !!slug && !mundos.includes(slug);

  const [fase, setFase] = useState<Fase>("elegir");
  const [config, setConfig] = useState<ConfigZen>(() => normalizarConfigZen(slug ?? "", null));
  const [subiendo, setSubiendo] = useState(false);
  const [niveles, setNiveles] = useState<Record<string, number>>({});
  const [contexto, setContexto] = useState<unknown>(undefined);
  const cargada = useRef(false);

  const [pregunta, setPregunta] = useState<PreguntaZen | null>(null);
  const [memorizando, setMemorizando] = useState(false);
  const [respuesta, setRespuesta] = useState("");
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  // "casi" = primer error: se ofrece intentar otra vez o ver la respuesta.
  const [casi, setCasi] = useState(false);
  const [ocultas, setOcultas] = useState<Set<string>>(() => new Set());
  const [pista, setPista] = useState<string | null>(null);
  const [registros, setRegistros] = useState<RegistroZen[]>([]);
  const [fallos, setFallos] = useState<FallaRepaso[]>([]);
  const [racha, setRacha] = useState<number | null>(null);

  const usados = useRef(new Set<string>());
  const intentos = useRef<string[]>([]);
  const inicio = useRef(0);
  const sello = useSharedValue(1);
  const sacudida = useSharedValue(0);

  // La última configuración (guardada en el teléfono); si no hay, el nivel del jugador
  // en el primer tema. Y lo que el mundo necesite para generar (banco de Enigmia).
  useEffect(() => {
    if (!slug) return;
    let vivo = true;
    (async () => {
      const n = userId ? await cargarNivelesZen(slug, userId).catch(() => ({}) as Record<string, number>) : {};
      if (!vivo) return;
      setNiveles(n);
      const inicial = nivelSugerido(normalizarConfigZen(slug, null).temas, n) ?? 3;
      const guardada = await leerConfigZen(slug, inicial);
      if (!vivo) return;
      const c = guardada ?? normalizarConfigZen(slug, null, inicial);
      setConfig(c);
      setSubiendo(c.nivelMax > c.nivelMin);
      cargada.current = true;
    })();
    prepararZen(slug)
      .then((ctx) => vivo && setContexto(ctx))
      .catch(() => vivo && setContexto(null));
    return () => {
      vivo = false;
    };
  }, [slug, userId]);

  useEffect(() => {
    if (cargada.current && slug) guardarConfigZen(slug, config);
  }, [slug, config]);

  // El tiempo de cada respuesta cuenta desde que la pregunta queda a la vista.
  useEffect(() => {
    if (pregunta && !memorizando) inicio.current = Date.now();
  }, [pregunta, memorizando]);

  if (!mundo || temas.length === 0) {
    return (
      <PantallaApilada titulo="Modo Zen">
        <Texto v="nota">Esta ciudad todavía no tiene Modo Zen.</Texto>
      </PantallaApilada>
    );
  }

  if (mundoBloqueado) {
    return (
      <PantallaApilada titulo="Modo Zen">
        <Texto v="nota">El Modo Zen de {mundo.nombre} se abre cuando enciendes la ciudad (o con Prodigia Pro).</Texto>
        <Boton3D titulo="Ver mis mundos" onPress={() => router.replace("/(tabs)/mundos")} />
      </PantallaApilada>
    );
  }

  const nivelActual = nivelDePregunta(config, registros.length);
  const cambiar = (parcial: Partial<ConfigZen>) => setConfig((c) => ({ ...c, ...parcial }));

  function siguiente(indice: number) {
    const q = generarZen(mundo.slug, config, indice, usados.current, contexto);
    if (!q) return;
    usados.current.add(claveZen(q));
    intentos.current = [];
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
    setRegistros([]);
    setFallos([]);
    setRacha(null);
    setFase("jugando");
    siguiente(0);
  }

  function cerrarPregunta(correcto: boolean) {
    if (!pregunta) return;
    const ms = Math.max(0, Date.now() - inicio.current);
    setRegistros((r) => [...r, { correcto, ms, intentos: [...intentos.current], pista: pista != null, nivel: nivelActual }]);
    if (!correcto) setFallos((f) => [...f, fallaZen(pregunta, intentos.current, (pais) => `¿Dónde está ${pais}?`)]);
  }

  function responder(valor: string) {
    if (!pregunta || feedback !== "idle" || memorizando || casi) return;
    const correcto = pregunta.tipo === "mapa" ? valor === pregunta.id : esRespuestaCorrecta(pregunta.p, valor);
    setSeleccion(valor);
    intentos.current.push(valor);
    if (correcto) {
      setFeedback("correcto");
      sonarAcierto(1);
      vibrar.medio();
      animarAcierto(sello);
      cerrarPregunta(true);
      return;
    }
    sonar("error");
    vibrar.error();
    animarError(sacudida);
    if (intentos.current.length < 2) {
      // Primer error: se puede volver a intentar (la opción mala queda apagada).
      setCasi(true);
      setOcultas((o) => new Set(o).add(valor));
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
    if (registros.length >= config.preguntas) {
      setFase("final");
      sonar("recompensa");
      const r = await registrarPartidaZen(mundo.slug, registros.length);
      setRacha(r);
      return;
    }
    siguiente(registros.length);
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

  const resumenTemas = () => {
    if (config.temas.length === temas.length && temas.length > 1) return "Todos los temas";
    if (config.temas.length > 2) return `${config.temas.length} temas`;
    return config.temas.map((id) => temas.find((x) => x.id === id)?.nombre ?? id).join(", ");
  };
  const textoNiveles = config.nivelMax > config.nivelMin ? `Niveles ${config.nivelMin}–${config.nivelMax}` : `Nivel ${config.nivelMin}`;

  // ---------- Elegir temas, opciones y dificultad ----------
  if (fase === "elegir") {
    const alternarTema = (id: string) => {
      const ya = config.temas.includes(id);
      if (ya && config.temas.length === 1) return; // siempre queda al menos uno
      vibrar.seleccion();
      cambiar({ temas: ya ? config.temas.filter((x) => x !== id) : [...config.temas, id] });
    };
    const alternarGrupo = (grupo: string) => {
      const ids = temas.filter((x) => x.grupo === grupo).map((x) => x.id);
      const todos = ids.every((id) => config.temas.includes(id));
      const resto = config.temas.filter((x) => !ids.includes(x));
      if (todos && resto.length === 0) return;
      vibrar.seleccion();
      cambiar({ temas: todos ? resto : [...resto, ...ids] });
    };
    const chipTema = (x: { id: string; nombre: string; simbolo: string }) => {
      const activo = config.temas.includes(x.id);
      return (
        <Pressable key={x.id} onPress={() => alternarTema(x.id)} style={[styles.chip, activo && { borderColor: mundo.neon, backgroundColor: conAlfa(mundo.neon, 0.16) }]} accessibilityRole="checkbox" accessibilityState={{ checked: activo }}>
          <Texto style={{ fontFamily: fuente.mono, fontSize: 11, color: activo ? mundo.neon : color.texto2 }}>{x.simbolo}</Texto>
          <Texto style={{ fontFamily: fuente.cuerpoFuerte, fontSize: 13, color: activo ? color.texto : color.texto2 }}>{x.nombre}</Texto>
        </Pressable>
      );
    };
    const tocarNivel = (n: number) => {
      vibrar.seleccion();
      if (!subiendo) return cambiar({ nivelMin: n, nivelMax: n });
      if (n <= config.nivelMin) return cambiar({ nivelMin: n });
      if (n >= config.nivelMax) return cambiar({ nivelMax: n });
      return n - config.nivelMin <= config.nivelMax - n ? cambiar({ nivelMin: n }) : cambiar({ nivelMax: n });
    };
    const visibles = opciones.filter((o) => opcionVisible(o, config.temas));
    const rangos = mundo.slug === "numeria" ? rangosAritmetica(config) : [];
    const sugerido = nivelSugerido(config.temas, niveles);
    const conRango = subiendo && config.nivelMax > config.nivelMin;
    const AYUDA_GEO: Record<string, string> = {
      nivel: "El mapa de países; desde el nivel 8 también aparecen lugares famosos.",
      mapa: "Siempre tocar el país en el mapa.",
      mixto: "Mitad mapa, mitad lugares famosos (ciudades, ríos, monumentos).",
      lugares: "Solo preguntas de lugares famosos, con opciones.",
    };

    return (
      <PantallaApilada titulo="Modo Zen" subtitulo={`${mundo.nombre} · sin reloj, a tu ritmo`}>
        <View style={[styles.aviso, { borderColor: conAlfa(mundo.neon, 0.5), backgroundColor: conAlfa(mundo.neon, 0.08) }]}>
          <Texto v="nota" tam={12.5}>
            Sin reloj, a tu ritmo. Si fallas, puedes intentar otra vez o ver la respuesta, y las pistas son gratis. No da Chispas: es para practicar, y cuenta para tu racha.
          </Texto>
        </View>

        {/* Temas */}
        <Tarjeta relleno={14} sinEntrada>
          <View style={styles.filaTitulo}>
            <Texto v="micro">Temas</Texto>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Texto v="mono" tam={12} c={color.texto2}>
                {config.temas.length} de {temas.length}
              </Texto>
              {config.temas.length < temas.length && (
                <Pressable
                  hitSlop={8}
                  onPress={() => {
                    vibrar.seleccion();
                    cambiar({ temas: temas.map((x) => x.id) });
                  }}
                >
                  <Texto v="fuerte" tam={12.5} c={mundo.neon}>
                    Elegir todos
                  </Texto>
                </Pressable>
              )}
            </View>
          </View>
          <Texto v="nota" tam={12} style={{ marginBottom: 10 }}>
            Elige uno o varios: las preguntas se reparten entre ellos.
          </Texto>
          {mundo.slug === "numeria" ? (
            <View style={{ gap: 12 }}>
              {GRUPOS_NUMERIA.map((g) => {
                const ids = temas.filter((x) => x.grupo === g.id);
                const todos = ids.every((x) => config.temas.includes(x.id));
                return (
                  <View key={g.id} style={{ gap: 7 }}>
                    <Pressable onPress={() => alternarGrupo(g.id)} style={{ flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start" }} accessibilityRole="checkbox" accessibilityState={{ checked: todos }}>
                      <View style={[styles.simboloGrupo, { backgroundColor: conAlfa(mundo.neon, todos ? 0.26 : 0.1) }]}>
                        <Texto style={{ fontFamily: fuente.mono, fontSize: 11, color: mundo.neon }}>{g.simbolo}</Texto>
                      </View>
                      <Texto v="fuerte" tam={14}>
                        {g.nombre}
                      </Texto>
                    </Pressable>
                    <View style={styles.chips}>{ids.map(chipTema)}</View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.chips}>{temas.map(chipTema)}</View>
          )}
        </Tarjeta>

        {/* Opciones del mundo */}
        {visibles.length > 0 && (
          <Tarjeta relleno={14} sinEntrada>
            <Texto v="micro" style={{ marginBottom: 8 }}>
              Opciones de {mundo.nombre}
            </Texto>
            <View style={{ gap: 12 }}>
              {visibles.map((o) =>
                o.tipo === "interruptor" ? (
                  <Pressable
                    key={o.id}
                    onPress={() => {
                      vibrar.seleccion();
                      cambiar({ opciones: { ...config.opciones, [o.id]: config.opciones[o.id] !== true } });
                    }}
                    style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: config.opciones[o.id] === true }}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Texto v="fuerte" tam={14}>
                        {o.nombre}
                      </Texto>
                      <Texto v="mono" tam={11.5} c={color.texto2}>
                        {o.detalle}
                      </Texto>
                    </View>
                    <View style={[styles.interruptor, { backgroundColor: config.opciones[o.id] === true ? mundo.base : color.surface3 }]}>
                      <View style={[styles.perilla, { alignSelf: config.opciones[o.id] === true ? "flex-end" : "flex-start" }]} />
                    </View>
                  </Pressable>
                ) : (
                  <View key={o.id} style={{ gap: 8 }}>
                    <Texto v="fuerte" tam={14}>
                      {o.nombre}
                    </Texto>
                    <View style={styles.chips}>
                      {o.valores.map((v) => {
                        const activo = config.opciones[o.id] === v.id;
                        return (
                          <Pressable
                            key={v.id}
                            onPress={() => {
                              vibrar.seleccion();
                              cambiar({ opciones: { ...config.opciones, [o.id]: v.id } });
                            }}
                            style={[styles.chip, activo && { borderColor: mundo.neon, backgroundColor: conAlfa(mundo.neon, 0.16) }]}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: activo }}
                          >
                            <Texto style={{ fontFamily: fuente.cuerpoFuerte, fontSize: 13, color: activo ? color.texto : color.texto2 }}>{v.nombre}</Texto>
                          </Pressable>
                        );
                      })}
                    </View>
                    {o.id === "preguntas" && AYUDA_GEO[String(config.opciones.preguntas)] ? (
                      <Texto v="nota" tam={12}>
                        {AYUDA_GEO[String(config.opciones.preguntas)]}
                      </Texto>
                    ) : null}
                  </View>
                )
              )}
            </View>
          </Tarjeta>
        )}

        {/* Dificultad */}
        <Tarjeta relleno={14} sinEntrada>
          <View style={{ gap: 10 }}>
            <Texto v="micro">Dificultad</Texto>
            <Segmentos
              opciones={[
                { id: "fijo", titulo: "Un nivel" },
                { id: "rango", titulo: "Que vaya subiendo" },
              ]}
              valor={subiendo ? "rango" : "fijo"}
              onCambio={(id) => {
                const s = id === "rango";
                setSubiendo(s);
                if (!s) cambiar({ nivelMax: config.nivelMin });
                else if (config.nivelMax === config.nivelMin) cambiar(config.nivelMin >= 10 ? { nivelMin: 8 } : { nivelMax: Math.min(10, config.nivelMin + 3) });
              }}
            />
            <View style={styles.filaTitulo}>
              <Texto style={{ fontFamily: fuente.display, fontSize: 18, color: mundo.neon }}>{conRango ? `Nivel ${config.nivelMin} → ${config.nivelMax}` : `Nivel ${config.nivelMin}`}</Texto>
              <Texto v="nota" tam={12}>
                {conRango ? `${nombreDificultad(config.nivelMin)} → ${nombreDificultad(config.nivelMax)}` : nombreDificultad(config.nivelMin)}
              </Texto>
            </View>
            <View style={styles.niveles}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                const dentro = n >= config.nivelMin && n <= config.nivelMax;
                const borde = n === config.nivelMin || n === config.nivelMax;
                return (
                  <Pressable
                    key={n}
                    onPress={() => tocarNivel(n)}
                    style={[styles.nivel, dentro && { backgroundColor: conAlfa(mundo.neon, 0.12 + n * 0.04), borderColor: conAlfa(mundo.neon, 0.55) }, borde && { borderColor: mundo.neon, transform: [{ scale: 1.08 }] }]}
                    accessibilityLabel={`Nivel ${n}`}
                  >
                    <Texto v="mono" tam={14} c={dentro ? color.texto : color.texto2}>
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
            {subiendo && (
              <Texto v="nota" tam={12}>
                {conRango ? `Empieza en el nivel ${config.nivelMin} y sube poco a poco hasta el ${config.nivelMax}.` : "Toca dos niveles: dónde empieza y hasta dónde sube."}
              </Texto>
            )}
            {sugerido != null && !subiendo && sugerido !== config.nivelMin && (
              <Pressable hitSlop={8} onPress={() => cambiar({ nivelMin: sugerido, nivelMax: sugerido })} style={{ alignSelf: "flex-start" }}>
                <Texto v="fuerte" tam={12.5} c={mundo.neon}>
                  Usar mi nivel ({sugerido})
                </Texto>
              </Pressable>
            )}
            {rangos.length > 0 && (
              <View style={styles.rangos}>
                <Texto v="micro" c={color.texto2}>
                  Números con esta dificultad
                </Texto>
                {rangos.map((r) => (
                  <View key={r.op} style={styles.filaTitulo}>
                    <Texto v="nota" tam={13}>
                      {temas.find((x) => x.id === `aritmetica:${r.op}`)?.nombre ?? r.op}
                    </Texto>
                    <Texto v="mono" tam={13}>
                      {r.desde}
                      {r.hasta ? `  →  ${r.hasta}` : ""}
                    </Texto>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Tarjeta>

        {/* Largo */}
        <Tarjeta relleno={14} sinEntrada>
          <View style={styles.filaTitulo}>
            <View style={{ flex: 1, gap: 2 }}>
              <Texto v="micro">Preguntas</Texto>
              <Texto v="nota" tam={12}>
                Todas cuentan para tu racha.
              </Texto>
            </View>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {LARGOS_ZEN.map((n) => {
                const activo = config.preguntas === n;
                return (
                  <Pressable
                    key={n}
                    onPress={() => {
                      vibrar.seleccion();
                      cambiar({ preguntas: n });
                    }}
                    style={[styles.chip, { minWidth: 44, justifyContent: "center" }, activo && { borderColor: mundo.neon, backgroundColor: conAlfa(mundo.neon, 0.16) }]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: activo }}
                  >
                    <Texto v="mono" tam={14} c={activo ? color.texto : color.texto2}>
                      {n}
                    </Texto>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Tarjeta>

        <Boton3D titulo="Jugar en Zen" icono={<IconoZen tam={18} c="#fff" />} acento={mundo.base} brillo sonido="jugar" onPress={empezar} deshabilitado={contexto === undefined} estilo={{ marginTop: 4 }} />
        <Texto v="nota" tam={11.5} centro>
          Guardamos tu elección para la próxima vez.
        </Texto>
      </PantallaApilada>
    );
  }

  // ---------- Resumen ----------
  if (fase === "final") {
    const e = estadisticasZen(registros);
    const total = registros.length;
    const maxMs = Math.max(1, ...registros.map((r) => r.ms));
    const tiles: { etiqueta: string; valor: string; nota?: string }[] = [
      { etiqueta: "Precisión", valor: `${e.precision}%`, nota: `${e.aciertos} de ${total}` },
      { etiqueta: "Al primer intento", valor: String(e.alPrimero), nota: e.alSegundo > 0 ? `+${e.alSegundo} al segundo intento` : `${e.alPrimero} de ${total}` },
      { etiqueta: "Mejor racha", valor: String(e.rachaMax), nota: e.rachaMax === 1 ? "acierto seguido" : "aciertos seguidos" },
      { etiqueta: "Promedio", valor: formatearDuracion(e.promedioMs), nota: `En total, ${formatearDuracion(e.totalMs)}` },
      { etiqueta: "Más rápida", valor: e.masRapida != null ? formatearDuracion(registros[e.masRapida].ms) : "—", nota: e.masRapida != null ? `Pregunta ${e.masRapida + 1}` : undefined },
      { etiqueta: "Más lenta", valor: e.masLenta != null ? formatearDuracion(registros[e.masLenta].ms) : "—", nota: e.masLenta != null ? `Pregunta ${e.masLenta + 1}` : undefined },
    ];
    return (
      <PantallaApilada titulo="Partida Zen" subtitulo={mundo.nombre}>
        <Animated.View entering={FadeInDown.duration(350)} style={{ alignItems: "center", gap: 6, paddingVertical: 6 }}>
          <Texto style={{ fontFamily: fuente.display, fontSize: 52, color: mundo.neon }}>
            {e.aciertos}/{total}
          </Texto>
          <Texto v="h3" centro>
            {e.aciertos === total ? "¡Perfecto! Prueba un nivel más." : e.precision >= 70 ? "¡Muy bien!" : "Sigue practicando, vas bien."}
          </Texto>
          <Texto v="nota" centro>
            {textoNiveles} · {resumenTemas()}
            {racha != null ? ` · Racha: ${racha} ${racha === 1 ? "día" : "días"}` : ""}
          </Texto>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(320)} style={styles.tiles}>
          {tiles.map((x) => (
            <View key={x.etiqueta} style={styles.tile}>
              <Texto v="micro" tam={10} numberOfLines={1}>
                {x.etiqueta}
              </Texto>
              <Texto style={{ fontFamily: fuente.display, fontSize: 22, color: color.texto }}>{x.valor}</Texto>
              {x.nota ? (
                <Texto v="nota" tam={11.5} numberOfLines={1}>
                  {x.nota}
                </Texto>
              ) : null}
            </View>
          ))}
        </Animated.View>

        {/* Ritmo: una barra por pregunta, alto = tiempo, color = cómo salió */}
        <Animated.View entering={FadeInDown.delay(160).duration(320)}>
          <Tarjeta relleno={14} sinEntrada>
            <View style={styles.filaTitulo}>
              <Texto v="h3">Tu ritmo</Texto>
              <Texto v="nota" tam={12}>
                {e.pistas === 0 ? "Sin pistas" : `${e.pistas} ${e.pistas === 1 ? "pista usada" : "pistas usadas"}`}
              </Texto>
            </View>
            <Texto v="nota" tam={11.5} style={{ marginBottom: 8 }}>
              Cada barra es una pregunta: cuanto más alta, más tiempo te tomó.
            </Texto>
            <View style={styles.grafico}>
              <View pointerEvents="none" style={[styles.lineaPromedio, { bottom: `${(e.promedioMs / maxMs) * 100}%` }]} />
              {registros.map((r, i) => (
                <View key={i} style={{ flex: 1, height: `${Math.max(6, (r.ms / maxMs) * 100)}%`, borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: COLOR_BARRA[resultadoDe(r)], opacity: 0.88 }} />
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 3, marginTop: 4 }}>
              {registros.map((_, i) => (
                <Texto key={i} v="mono" tam={9.5} c={color.texto2} style={{ flex: 1, textAlign: "center" }}>
                  {i + 1}
                </Texto>
              ))}
            </View>
            <View style={styles.leyenda}>
              {(["primero", "segundo", "fallada"] as const).map((k) => (
                <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: COLOR_BARRA[k] }} />
                  <Texto v="nota" tam={11.5}>
                    {LEYENDA[k]}
                  </Texto>
                </View>
              ))}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <View style={{ width: 14, borderTopWidth: 1, borderStyle: "dashed", borderColor: color.texto2 }} />
                <Texto v="nota" tam={11.5}>
                  promedio {formatearDuracion(e.promedioMs)}
                </Texto>
              </View>
            </View>
          </Tarjeta>
        </Animated.View>

        {fallos.length > 0 ? (
          <RepasoErrores fallos={fallos} acento={mundo.neon} />
        ) : (
          <View style={[styles.aviso, { borderColor: conAlfa(color.correcto, 0.45), backgroundColor: conAlfa(color.correcto, 0.1) }]}>
            <Texto v="fuerte" c={color.correcto} centro>
              Ninguna fallada: no hay nada que repasar.
            </Texto>
          </View>
        )}

        <Boton3D titulo="Otra vez" acento={mundo.base} brillo sonido="jugar" onPress={empezar} />
        {config.nivelMax < 10 && (
          <Boton3D
            titulo={config.nivelMax > config.nivelMin ? `Subir un nivel (${config.nivelMin + 1}–${config.nivelMax + 1})` : `Subir a nivel ${config.nivelMin + 1}`}
            variante="secundario"
            onPress={() => {
              cambiar({ nivelMin: Math.min(10, config.nivelMin + 1), nivelMax: Math.min(10, config.nivelMax + 1) });
              setFase("elegir");
            }}
          />
        )}
        <Boton3D titulo="Cambiar temas o dificultad" variante="secundario" onPress={() => setFase("elegir")} />
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
  const numero = registros.length + (feedback === "idle" ? 1 : 0);
  const p = pregunta.tipo === "mundo" ? pregunta.p : null;
  const bloqueado = feedback !== "idle" || memorizando || casi;
  const nivelVisible = feedback === "idle" ? nivelActual : (registros[registros.length - 1]?.nivel ?? nivelActual);

  return (
    <SafeAreaView style={styles.pantalla}>
      <Glifos glifos={mundo.glifos} acento={mundo.neon} cantidad={5} opacidad={0.08} />
      <View style={styles.cabecera}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Salir del Modo Zen">
          <Texto v="h3" c={color.texto2}>
            ✕
          </Texto>
        </Pressable>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <IconoZen tam={14} c={mundo.neon} />
          <Texto v="micro" c={mundo.neon}>
            Zen · Nv {nivelVisible}
          </Texto>
        </View>
        <Texto v="mono" tam={13} c={color.texto2}>
          {Math.min(numero, config.preguntas)} de {config.preguntas}
        </Texto>
      </View>
      <View style={styles.progreso}>
        {Array.from({ length: config.preguntas }, (_, i) => (
          <View key={i} style={[styles.punto, i < registros.length ? { backgroundColor: COLOR_BARRA[resultadoDe(registros[i])] } : i === registros.length ? { backgroundColor: mundo.neon } : null]} />
        ))}
      </View>

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
                  Estaba marcado en el mapa: {solucionZen(pregunta)}
                </Texto>
              )}
            </View>
          ) : null}
        </TarjetaProblema>

        {pista && feedback === "idle" && (
          <Animated.View entering={FadeIn.duration(200)}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "center", gap: 6 }}>
              <IconoBombilla tam={16} c={color.logro} />
              <Texto v="nota" c={color.logro} style={{ flexShrink: 1 }}>
                {pista}
              </Texto>
            </View>
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
          <Pressable onPress={darPista} hitSlop={8} style={[styles.pista, { flexDirection: "row", alignItems: "center", gap: 6 }]}>
            <IconoBombilla tam={15} c={color.logro} />
            <Texto v="fuerte" tam={13} c={color.logro}>
              Pista gratis
            </Texto>
          </Pressable>
        )}

        {feedback !== "idle" && (
          <Animated.View entering={FadeInDown.duration(220)}>
            <Boton3D titulo={registros.length >= config.preguntas ? "Ver resumen" : "Siguiente"} acento={mundo.base} brillo onPress={avanzar} />
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
  progreso: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 6, paddingHorizontal: 18, paddingVertical: 6 },
  punto: { width: 9, height: 9, borderRadius: 5, backgroundColor: color.surface3 },
  zona: { padding: 16, gap: 12, flexGrow: 1, justifyContent: "center" },
  aviso: { padding: 12, borderRadius: 14, borderWidth: 1 },
  filaTitulo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface2 },
  simboloGrupo: { minWidth: 26, height: 24, paddingHorizontal: 5, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  interruptor: { width: 46, height: 26, borderRadius: 13, padding: 3, justifyContent: "center" },
  perilla: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff" },
  niveles: { flexDirection: "row", gap: 5 },
  nivel: { flex: 1, aspectRatio: 0.8, borderRadius: 10, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface2, alignItems: "center", justifyContent: "center" },
  rangos: { gap: 6, padding: 12, borderRadius: 14, backgroundColor: color.surface2 },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: { flexGrow: 1, flexBasis: "30%", minWidth: 100, gap: 2, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface1 },
  grafico: { height: 110, flexDirection: "row", alignItems: "flex-end", gap: 3 },
  lineaPromedio: { position: "absolute", left: 0, right: 0, borderTopWidth: 1, borderStyle: "dashed", borderColor: conAlfa(color.texto2, 0.7) },
  leyenda: { flexDirection: "row", flexWrap: "wrap", columnGap: 14, rowGap: 6, marginTop: 10 },
  pista: { alignSelf: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: conAlfa(color.logro, 0.5), backgroundColor: conAlfa(color.logro, 0.1) },
});
