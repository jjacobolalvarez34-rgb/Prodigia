import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Rect } from "react-native-svg";
import { mapaClanes, tierDe, unirseAClan, type ClanMapa } from "~/lib/clanes";
import { sonar, vibrar } from "~/lib/efectos";
import { mensajeError, supabase } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import Bandera from "~/ui/clan/Bandera";
import Hoja from "~/ui/Hoja";
import { BotonAtras } from "~/ui/Pantalla";
import Texto from "~/ui/Texto";
import { color, conAlfa, fuente } from "~/tema";

// Mundo de clanes (maqueta 11): un mapa nocturno con una parcela por clan; la altura
// de la ciudad muestra su nivel y el banderín su color. Arrastrar y pellizcar para
// moverse; tocar una parcela abre su resumen. Toque y arrastre son gestos separados
// (lección del bug de la web: un arrastre nunca abre una parcela).

const COLUMNAS = 3;
const ANCHO_P = 104;
const ALTO_P = 96;
const HUECO = 14;
type Filtro = "todos" | "lugar" | "nivel" | "mio";

function Parcela({ c, mio, elegido }: { c: ClanMapa; mio: boolean; elegido: boolean }) {
  const tier = tierDe(c.nivel_clan).tier;
  const edificios = useMemo(() => {
    let s = c.clan_id.split("").reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 9973, 7);
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const lista: { x: number; w: number; h: number }[] = [];
    let x = 4;
    while (x < ANCHO_P - 12) {
      const w = 8 + Math.round(r() * 6);
      lista.push({ x, w, h: 10 + r() * (12 + tier * 9) });
      x += w + 3;
    }
    return lista;
  }, [c.clan_id, tier]);
  return (
    <View style={[styles.parcela, mio && { borderColor: color.racha, borderWidth: 2, boxShadow: `0px 0px 18px ${conAlfa(color.racha, 0.5)}` }, elegido && { borderColor: "#fff" }]}>
      <Svg width={ANCHO_P} height={ALTO_P - 18} style={{ position: "absolute", bottom: 18 }}>
        {edificios.map((e, i) => (
          <Rect key={i} x={e.x} y={ALTO_P - 18 - e.h} width={e.w} height={e.h} rx={1.5} fill="#0B0F1F" />
        ))}
        {edificios.flatMap((e, i) =>
          Array.from({ length: Math.floor(e.h / 7) }, (_, j) => (
            <Rect key={`${i}-${j}`} x={e.x + 2} y={ALTO_P - 18 - e.h + 3 + j * 7} width={2} height={2.5} fill={c.color_estandarte} opacity={(i + j) % 3 === 0 ? 0.25 : 0.9} />
          ))
        )}
      </Svg>
      <View style={{ position: "absolute", top: 6, left: 6 }}>
        <Bandera c={c.color_estandarte} ancho={10} alto={16} quieta />
      </View>
      <View style={styles.pie}>
        <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 9, color: color.texto }} numberOfLines={1}>
          [{c.tag ?? c.nombre.slice(0, 3)}]
        </Texto>
        <Texto style={{ fontFamily: fuente.mono, fontSize: 9, color: c.color_estandarte }}>Nv {c.nivel_clan}</Texto>
      </View>
    </View>
  );
}

export default function MundoClanes() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [clanes, setClanes] = useState<ClanMapa[]>([]);
  const [miClan, setMiClan] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [elegido, setElegido] = useState<ClanMapa | null>(null);
  const [uniendo, setUniendo] = useState(false);

  const escala = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const inicio = useSharedValue({ e: 1, x: 0, y: 0 });

  useEffect(() => {
    mapaClanes().then(setClanes);
    supabase.rpc("mi_clan").then(({ data }) => setMiClan((data as { clan_id: string }[] | null)?.[0]?.clan_id ?? null));
  }, []);

  const lista = useMemo(() => {
    let l = clanes.slice();
    if (filtro === "lugar") l = l.filter((c) => c.cantidad_miembros < c.capacidad);
    if (filtro === "nivel") l = l.sort((a, b) => b.nivel_clan - a.nivel_clan);
    if (filtro === "mio") l = l.filter((c) => c.clan_id === miClan);
    return l;
  }, [clanes, filtro, miClan]);

  const filas = Math.ceil(lista.length / COLUMNAS);
  const anchoMapa = COLUMNAS * (ANCHO_P + HUECO) + HUECO;
  const altoMapa = Math.max(height, filas * (ALTO_P + HUECO) + 300);

  function posicion(i: number) {
    return { x: HUECO + (i % COLUMNAS) * (ANCHO_P + HUECO), y: 170 + Math.floor(i / COLUMNAS) * (ALTO_P + HUECO) };
  }

  function tocar(x: number, y: number) {
    // De la pantalla al mapa: la escala se aplica alrededor del centro de la vista.
    const s = escala.get();
    const mx = width / 2 + (x - tx.get() - width / 2) / s - (width - anchoMapa) / 2;
    const my = altoMapa / 2 + (y - ty.get() - altoMapa / 2) / s;
    const i = lista.findIndex((_, k) => {
      const p = posicion(k);
      return mx >= p.x && mx <= p.x + ANCHO_P && my >= p.y && my <= p.y + ALTO_P;
    });
    if (i >= 0) {
      vibrar.seleccion();
      setElegido(lista[i]);
    }
  }

  const pellizco = Gesture.Pinch()
    .onStart(() => {
      inicio.value = { e: escala.value, x: tx.value, y: ty.value };
    })
    .onUpdate((e) => {
      escala.value = Math.min(3, Math.max(0.6, inicio.value.e * e.scale));
    });
  const arrastre = Gesture.Pan()
    .minDistance(6)
    .onStart(() => {
      inicio.value = { e: escala.value, x: tx.value, y: ty.value };
    })
    .onUpdate((e) => {
      tx.value = inicio.value.x + e.translationX;
      ty.value = inicio.value.y + e.translationY;
    });
  const toque = Gesture.Tap()
    .maxDistance(8)
    .onEnd((e, ok) => {
      if (ok) runOnJS(tocar)(e.absoluteX, e.absoluteY);
    });
  const gestos = Gesture.Race(Gesture.Simultaneous(pellizco, arrastre), toque);

  const estiloMapa = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: escala.value }] }));

  function centrarEnMiClan() {
    const i = lista.findIndex((c) => c.clan_id === miClan);
    escala.set(withSpring(1.4));
    if (i < 0) {
      tx.set(withTiming(0));
      ty.set(withTiming(0));
      return;
    }
    const p = posicion(i);
    const px = p.x + ANCHO_P / 2 + (width - anchoMapa) / 2;
    const py = p.y + ALTO_P / 2;
    tx.set(withSpring(width / 2 - width / 2 - (px - width / 2) * 1.4));
    ty.set(withSpring(height / 2 - altoMapa / 2 - (py - altoMapa / 2) * 1.4));
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#070A14" }}>
      <GestureDetector gesture={gestos}>
        <Animated.View style={[{ width, height: altoMapa }, estiloMapa]}>
          <Svg width={width} height={altoMapa} style={StyleSheet.absoluteFill}>
            {Array.from({ length: Math.ceil(altoMapa / 34) }, (_, i) => (
              <Rect key={`h${i}`} x={0} y={i * 34} width={width} height={1} fill="rgba(124,92,255,0.07)" />
            ))}
            {Array.from({ length: Math.ceil(width / 34) }, (_, i) => (
              <Rect key={`v${i}`} x={i * 34} y={0} width={1} height={altoMapa} fill="rgba(124,92,255,0.07)" />
            ))}
            <Rect x={-20} y={altoMapa * 0.55} width={width + 40} height={26} rx={13} fill="#16406B" opacity={0.7} transform={`rotate(-8 ${width / 2} ${altoMapa * 0.55})`} />
          </Svg>
          <View style={{ position: "absolute", left: (width - anchoMapa) / 2, top: 0, width: anchoMapa }}>
            {lista.map((c, i) => {
              const p = posicion(i);
              return (
                <Animated.View key={c.clan_id} entering={FadeIn.delay(Math.min(i, 20) * 40)} style={{ position: "absolute", left: p.x, top: p.y }}>
                  <Parcela c={c} mio={c.clan_id === miClan} elegido={elegido?.clan_id === c.clan_id} />
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>
      </GestureDetector>

      <SafeAreaView edges={["top"]} style={styles.arriba} pointerEvents="box-none">
        <View style={styles.cabecera}>
          <BotonAtras />
          <View>
            <Texto v="h3">Mundo de clanes</Texto>
            <Texto v="nota" tam={11}>
              {clanes.length} clanes · pellizca para acercar
            </Texto>
          </View>
        </View>
        <View style={styles.filtros}>
          {(
            [
              ["todos", "Todos"],
              ["lugar", "Con lugar"],
              ["nivel", "Más grandes"],
              ["mio", "Mi clan"],
            ] as [Filtro, string][]
          ).map(([id, t]) => (
            <Pressable key={id} onPress={() => setFiltro(id)} style={[styles.chip, filtro === id && { backgroundColor: color.surface3, borderColor: conAlfa(color.primario, 0.5) }]}>
              <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 11, color: filtro === id ? color.texto : color.texto2 }}>{t}</Texto>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
      <View style={styles.zoom}>
        <Pressable style={styles.zoomBoton} onPress={() => escala.set(withSpring(Math.min(3, escala.get() * 1.4)))}>
          <Texto v="h3">+</Texto>
        </Pressable>
        <Pressable style={styles.zoomBoton} onPress={() => escala.set(withSpring(Math.max(0.6, escala.get() / 1.4)))}>
          <Texto v="h3">−</Texto>
        </Pressable>
        <Pressable style={styles.zoomBoton} onPress={centrarEnMiClan}>
          <Texto v="fuerte" tam={13}>
            ◎
          </Texto>
        </Pressable>
      </View>

      <Hoja visible={!!elegido} onCerrar={() => setElegido(null)}>
        {elegido && (
          <>
            <View style={styles.fila}>
              <Bandera c={elegido.color_estandarte} ancho={20} alto={30} />
              <View style={{ flex: 1 }}>
                <Texto v="h3">
                  {elegido.nombre} {elegido.tag ? <Texto v="nota">[{elegido.tag}]</Texto> : null}
                </Texto>
                <Texto v="nota">
                  {tierDe(elegido.nivel_clan).nombre} · Nivel {elegido.nivel_clan} · {elegido.cantidad_miembros}/{elegido.capacidad}
                </Texto>
              </View>
            </View>
            <View style={styles.fila}>
              <Boton3D titulo="Ver ciudad" variante="secundario" tamano="sm" estilo={{ flex: 1 }} onPress={() => { const id = elegido.clan_id; setElegido(null); router.push({ pathname: "/clan/[id]", params: { id } }); }} />
              {!miClan && (
                <Boton3D
                  titulo="Unirme"
                  tamano="sm"
                  acento={elegido.color_estandarte}
                  deshabilitado={elegido.cantidad_miembros >= elegido.capacidad}
                  cargando={uniendo}
                  estilo={{ flex: 1 }}
                  onPress={async () => {
                    setUniendo(true);
                    try {
                      await unirseAClan(elegido.clan_id);
                      sonar("recompensa");
                      setMiClan(elegido.clan_id);
                      mostrarAviso(`¡Ya eres parte de ${elegido.nombre}!`, "logro");
                      setElegido(null);
                    } catch (e) {
                      mostrarAviso(mensajeError(e), "error");
                    } finally {
                      setUniendo(false);
                    }
                  }}
                />
              )}
            </View>
          </>
        )}
      </Hoja>
    </View>
  );
}

const styles = StyleSheet.create({
  arriba: { position: "absolute", left: 0, right: 0, top: 0, backgroundColor: "rgba(7,10,20,0.75)" },
  cabecera: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 6 },
  filtros: { flexDirection: "row", gap: 6, paddingHorizontal: 16, paddingVertical: 10 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface1 },
  zoom: { position: "absolute", right: 12, top: 170, gap: 6 },
  zoomBoton: { width: 38, height: 38, borderRadius: 11, backgroundColor: "rgba(18,23,42,0.92)", borderWidth: 1, borderColor: color.border, alignItems: "center", justifyContent: "center" },
  parcela: { width: ANCHO_P, height: ALTO_P, borderRadius: 14, backgroundColor: "rgba(18,23,42,0.88)", borderWidth: 1, borderColor: color.border, overflow: "hidden" },
  pie: { position: "absolute", left: 0, right: 0, bottom: 0, height: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 6, backgroundColor: "rgba(0,0,0,0.45)" },
  fila: { flexDirection: "row", alignItems: "center", gap: 10 },
});
