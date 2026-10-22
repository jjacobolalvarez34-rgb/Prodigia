import {
  ESTILO_MAPA,
  PATH_BANDERIN,
  calcularTerritorios,
  coloresTerritorio,
  esTerritorioNuevo,
  etiquetaTerritorio,
  territorioEnPunto,
} from "@/lib/clanes/territorios";
import { useRouter } from "expo-router";
import { memo, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, G, Path, Pattern, RadialGradient, Rect, Stop, Text as SvgText } from "react-native-svg";
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

// Mundo de clanes como mapa de territorios (pedido del 2026-10-21): cada clan es una
// región irregular que crece con sus miembros y su nivel, y cada clan nuevo funda su
// territorio en la frontera. La geometría es la de la web (@/lib/clanes/territorios),
// así que el mapa se ve igual en los dos lados. Arrastrar y pellizcar para moverse;
// tocar un territorio abre su resumen. Toque y arrastre son gestos separados (lección
// del bug de la web: un arrastre nunca abre un clan).

type Filtro = "todos" | "lugar" | "nivel" | "mio";
const ALTO_CABECERA = 120;
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 5;
/** Píxeles por unidad del mapa por debajo de los cuales los nombres no se leen. */
const ESCALA_LEGIBLE = 0.6;

type Mapa = ReturnType<typeof calcularTerritorios>;

const DibujoMapa = memo(function DibujoMapa({
  mapa,
  clanes,
  escalaBase,
  miClan,
  elegido,
  atenuados,
  ahora,
}: {
  mapa: Mapa;
  clanes: Map<string, ClanMapa>;
  escalaBase: number;
  miClan: string | null;
  elegido: string | null;
  atenuados: Set<string>;
  ahora: number;
}) {
  const { minX, minY, ancho, alto } = mapa.caja;
  const destacados = mapa.territorios.filter((t) => t.clan_id === miClan || t.clan_id === elegido);
  return (
    <Svg width={ancho * escalaBase} height={alto * escalaBase} viewBox={`${minX} ${minY} ${ancho} ${alto}`}>
      <Defs>
        <RadialGradient id="tc-mar" cx="50%" cy="45%" r="60%">
          <Stop offset="0%" stopColor={ESTILO_MAPA.marClaro} />
          <Stop offset="100%" stopColor={ESTILO_MAPA.mar} />
        </RadialGradient>
        <Pattern id="tc-olas" width={46} height={26} patternUnits="userSpaceOnUse">
          <Path d="M2 8q5-4 10 0t10 0M25 20q5-4 10 0t10 0" fill="none" stroke={ESTILO_MAPA.olas} strokeOpacity={0.09} strokeWidth={1.1} strokeLinecap="round" />
        </Pattern>
        <Pattern id="tc-textura" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
          <Circle cx={2} cy={2} r={0.8} fill="#FFFFFF" fillOpacity={0.09} />
          <Path d="M5 6.5h3" stroke="#000000" strokeOpacity={0.12} strokeWidth={0.8} strokeLinecap="round" />
        </Pattern>
        <RadialGradient id="tc-relieve" cx="42%" cy="36%" r="70%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.24} />
          <Stop offset="55%" stopColor="#FFFFFF" stopOpacity={0} />
          <Stop offset="100%" stopColor="#000000" stopOpacity={0.34} />
        </RadialGradient>
      </Defs>

      <Rect x={minX} y={minY} width={ancho} height={alto} fill="url(#tc-mar)" />
      <Rect x={minX} y={minY} width={ancho} height={alto} fill="url(#tc-olas)" />

      {/* Bajíos alrededor de la costa y sombra del relieve. */}
      <G fill="none" stroke={ESTILO_MAPA.bajio} strokeLinejoin="round">
        {mapa.territorios.map((t) => (
          <Path key={`b1${t.clan_id}`} d={t.d} strokeWidth={22} strokeOpacity={0.07} />
        ))}
        {mapa.territorios.map((t) => (
          <Path key={`b2${t.clan_id}`} d={t.d} strokeWidth={9} strokeOpacity={0.12} />
        ))}
      </G>
      <G fill="#000000" fillOpacity={0.42} transform="translate(0 5)">
        {mapa.territorios.map((t) => (
          <Path key={t.clan_id} d={t.d} />
        ))}
      </G>

      {mapa.territorios.map((t) => {
        const c = clanes.get(t.clan_id);
        if (!c || !t.d) return null;
        const col = coloresTerritorio(c.color_estandarte);
        const nuevo = esTerritorioNuevo(c.creado_at, ahora) && c.clan_id !== miClan;
        return (
          <G key={t.clan_id}>
            <Path d={t.d} fill={col.suelo} />
            <Path d={t.d} fill="url(#tc-textura)" />
            <Path d={t.d} fill="url(#tc-relieve)" />
            <Path d={t.d} fill="none" stroke={col.borde} strokeWidth={1.8} strokeLinejoin="round" />
            <Path d={t.d} fill="none" stroke={col.luz} strokeOpacity={0.22} strokeWidth={0.7} strokeLinejoin="round" />
            {nuevo && <Path d={t.d} fill="none" stroke={col.luz} strokeWidth={1.4} strokeDasharray="5 4" strokeOpacity={0.8} />}
            {atenuados.has(t.clan_id) && <Path d={t.d} fill={ESTILO_MAPA.mar} fillOpacity={0.62} />}
          </G>
        );
      })}

      {destacados.map((t) => {
        const c = t.clan_id === elegido ? ESTILO_MAPA.elegido : ESTILO_MAPA.miClan;
        return (
          <G key={`d${t.clan_id}`} fill="none" strokeLinejoin="round">
            <Path d={t.d} stroke={c} strokeWidth={9} strokeOpacity={0.3} />
            <Path d={t.d} stroke={c} strokeWidth={2.6} />
          </G>
        );
      })}

      {mapa.territorios.map((t) => {
        const c = clanes.get(t.clan_id);
        if (!c) return null;
        const col = coloresTerritorio(c.color_estandarte);
        const mio = c.clan_id === miClan;
        const nuevo = esTerritorioNuevo(c.creado_at, ahora);
        const et = etiquetaTerritorio(c.nombre, c.tag, t.radioInterior);
        const { x, y } = t.centro;
        const altoB = et.tam * 1.25;
        const anchoB = (altoB * 22) / 34;
        const yNombre = et.conDetalle ? y + et.tam * 0.55 : y + et.tam * 0.35;
        const sobre = mio ? "TU CLAN" : nuevo ? "NUEVO" : null;
        const apagado = atenuados.has(t.clan_id);
        return (
          <G key={`e${t.clan_id}`} opacity={apagado ? 0.45 : 1}>
            {et.conDetalle && (
              <G transform={`translate(${x - anchoB / 2} ${y - et.tam * 1.15}) scale(${anchoB / 22} ${altoB / 34})`}>
                <Path d={PATH_BANDERIN} fill={col.color} stroke={ESTILO_MAPA.contornoTexto} strokeWidth={2.4} strokeLinejoin="round" />
                <Path d="M0 0H22V9H0Z" fill="#FFFFFF" opacity={0.2} />
              </G>
            )}
            {sobre && et.conDetalle && (
              <Etiqueta x={x} y={y - et.tam * 1.45} tam={et.tam * 0.55} c={mio ? ESTILO_MAPA.miClan : col.luz} f={fuente.mono} trazo={et.tam * 0.2}>
                {sobre}
              </Etiqueta>
            )}
            <Etiqueta x={x} y={yNombre} tam={et.tam} c={ESTILO_MAPA.texto} f={fuente.display} trazo={et.tam * 0.26}>
              {et.texto}
            </Etiqueta>
            {et.conDetalle && (
              <Etiqueta x={x} y={yNombre + et.tam * 0.95} tam={et.tam * 0.6} c={ESTILO_MAPA.textoSuave} f={fuente.cuerpoBold} trazo={et.tam * 0.2}>
                {`Nv ${c.nivel_clan} · ${c.cantidad_miembros}`}
              </Etiqueta>
            )}
          </G>
        );
      })}
    </Svg>
  );
});

// Texto con contorno oscuro para que se lea sobre cualquier color de territorio.
function Etiqueta({ x, y, tam, c, f, trazo, children }: { x: number; y: number; tam: number; c: string; f: string; trazo: number; children: string }) {
  return (
    <>
      <SvgText x={x} y={y} fontSize={tam} fontFamily={f} textAnchor="middle" fill={ESTILO_MAPA.contornoTexto} stroke={ESTILO_MAPA.contornoTexto} strokeWidth={trazo} strokeLinejoin="round" strokeOpacity={0.85}>
        {children}
      </SvgText>
      <SvgText x={x} y={y} fontSize={tam} fontFamily={f} textAnchor="middle" fill={c}>
        {children}
      </SvgText>
    </>
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
  const [ahora] = useState(() => Date.now());

  const escala = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const inicio = useSharedValue({ e: 1, x: 0, y: 0 });

  useEffect(() => {
    mapaClanes().then(setClanes);
    supabase.rpc("mi_clan").then(({ data }) => setMiClan((data as { clan_id: string }[] | null)?.[0]?.clan_id ?? null));
  }, []);

  // El mapa se calcula con todos los clanes (los filtros solo atenúan, no mueven fronteras).
  const mapa = useMemo(() => calcularTerritorios(clanes), [clanes]);
  const porId = useMemo(() => new Map(clanes.map((c) => [c.clan_id, c])), [clanes]);
  const atenuados = useMemo(() => {
    if (filtro === "todos") return new Set<string>();
    let visibles: ClanMapa[] = clanes;
    if (filtro === "lugar") visibles = clanes.filter((c) => c.cantidad_miembros < c.capacidad);
    if (filtro === "nivel") visibles = clanes.slice().sort((a, b) => b.nivel_clan - a.nivel_clan || b.cantidad_miembros - a.cantidad_miembros).slice(0, 10);
    if (filtro === "mio") visibles = clanes.filter((c) => c.clan_id === miClan);
    const ids = new Set(visibles.map((c) => c.clan_id));
    return new Set(clanes.filter((c) => !ids.has(c.clan_id)).map((c) => c.clan_id));
  }, [clanes, filtro, miClan]);

  // Escala inicial: que el mapa entero quepa en la pantalla, sin que los nombres queden diminutos.
  const centroY = (height + ALTO_CABECERA) / 2;
  const escalaBase = Math.min(1.6, Math.max(ESCALA_LEGIBLE, Math.min((width - 24) / mapa.caja.ancho, (height - ALTO_CABECERA - 40) / mapa.caja.alto)));
  const W = mapa.caja.ancho * escalaBase;
  const H = mapa.caja.alto * escalaBase;

  // Si el mapa no entra entero en la pantalla, se abre centrado en mi clan.
  const miTerritorio = miClan ? mapa.territorios.find((x) => x.clan_id === miClan) : undefined;
  const desbordado = W > width || H > height - ALTO_CABECERA;
  const centroMio = miTerritorio
    ? { x: (miTerritorio.centro.x - mapa.caja.minX) * escalaBase - W / 2, y: (miTerritorio.centro.y - mapa.caja.minY) * escalaBase - H / 2 }
    : null;

  function tocar(x: number, y: number) {
    // De la pantalla al mapa: la escala se aplica alrededor del centro del dibujo.
    const s = escala.get();
    const lx = (x - (width / 2 + tx.get())) / s + W / 2;
    const ly = (y - (centroY + ty.get())) / s + H / 2;
    const t = territorioEnPunto(mapa, { x: lx / escalaBase + mapa.caja.minX, y: ly / escalaBase + mapa.caja.minY });
    const c = t ? porId.get(t.clan_id) : null;
    if (c) {
      vibrar.seleccion();
      setElegido(c);
    }
  }

  const pellizco = Gesture.Pinch()
    .onStart(() => {
      inicio.value = { e: escala.value, x: tx.value, y: ty.value };
    })
    .onUpdate((e) => {
      escala.value = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, inicio.value.e * e.scale));
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

  useEffect(() => {
    if (!desbordado || !centroMio) return;
    tx.set(-centroMio.x);
    ty.set(-centroMio.y);
    // Solo al llegar los datos (o cambiar de clan), no en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desbordado, miTerritorio?.clan_id]);

  const estiloMapa = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: escala.value }] }));

  function centrarEnMiClan() {
    const t = mapa.territorios.find((x) => x.clan_id === miClan);
    const s = Math.max(1.8, escala.get());
    escala.set(withSpring(s));
    if (!t) {
      tx.set(withTiming(0));
      ty.set(withTiming(0));
      return;
    }
    const dx = (t.centro.x - mapa.caja.minX) * escalaBase - W / 2;
    const dy = (t.centro.y - mapa.caja.minY) * escalaBase - H / 2;
    tx.set(withSpring(-s * dx));
    ty.set(withSpring(-s * dy));
  }

  return (
    <View style={{ flex: 1, backgroundColor: ESTILO_MAPA.mar }}>
      <GestureDetector gesture={gestos}>
        <View style={StyleSheet.absoluteFill}>
          {clanes.length > 0 && (
            <Animated.View entering={FadeIn.duration(500)} style={[{ position: "absolute", left: (width - W) / 2, top: centroY - H / 2, width: W, height: H }, estiloMapa]}>
              <DibujoMapa mapa={mapa} clanes={porId} escalaBase={escalaBase} miClan={miClan} elegido={elegido?.clan_id ?? null} atenuados={atenuados} ahora={ahora} />
            </Animated.View>
          )}
        </View>
      </GestureDetector>

      <SafeAreaView edges={["top"]} style={styles.arriba} pointerEvents="box-none">
        <View style={styles.cabecera}>
          <BotonAtras />
          <View>
            <Texto v="h3">Mundo de clanes</Texto>
            <Texto v="nota" tam={11}>
              {clanes.length} territorios · pellizca para acercar
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
            <Pressable
              key={id}
              onPress={() => {
                setFiltro(id);
                if (id === "mio") centrarEnMiClan();
              }}
              style={[styles.chip, filtro === id && { backgroundColor: color.surface3, borderColor: conAlfa(color.primario, 0.5) }]}
            >
              <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 11, color: filtro === id ? color.texto : color.texto2 }}>{t}</Texto>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
      <View style={styles.zoom}>
        <Pressable style={styles.zoomBoton} onPress={() => escala.set(withSpring(Math.min(ZOOM_MAX, escala.get() * 1.4)))}>
          <Texto v="h3">+</Texto>
        </Pressable>
        <Pressable style={styles.zoomBoton} onPress={() => escala.set(withSpring(Math.max(ZOOM_MIN, escala.get() / 1.4)))}>
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
  fila: { flexDirection: "row", alignItems: "center", gap: 10 },
});
