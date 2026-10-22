import { Canvas, useClock } from "@shopify/react-native-skia";
import { useSegments } from "expo-router";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { Easing, FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming, ZoomIn } from "react-native-reanimated";
import { leerPrimeraVezActiva, suscribirPrimeraVez } from "~/lib/bienvenida";
import { CATALOGO_NUEVO, COLOR_RAREZA, NOMBRE_RAREZA, type Rareza } from "@/lib/recompensas/catalogo";
import { constelacionesPorVer, marcarConstelacionesVistas, NOMBRE_FUGAZ, type ConstelacionCompletada } from "@/lib/recompensas/constelaciones";
import { sonar, vibrar } from "~/lib/efectos";
import { recargarJugador } from "~/lib/jugador";
import { leerAvisoConstelaciones, limpiarAvisoConstelaciones, recargarCosmeticos, suscribirAvisoConstelaciones } from "~/lib/recompensas";
import { useLiviano } from "~/lib/rendimiento";
import { supabase } from "~/lib/supabase";
import { color, conAlfa, fuente, mundoDe, COLOR_NOCHE } from "~/tema";
import Boton3D from "../Boton3D";
import { Destello, Halo, Onda, Particulas, Rayos, tonoHex } from "../fx/capas";
import { crearExplosion } from "../fx/particulas";
import { IconoBombilla, IconoChispa, IconoCopo, IconoEstrellaFugaz, IconoLuna, IconoPieza, IconoPlaneta, IconoReloj } from "../Iconos";
import NumeroAnimado from "../NumeroAnimado";
import Texto, { SobreOscuro } from "../Texto";
import Constelacion from "./Constelacion";
import VistaCosmetico from "./VistaCosmetico";

// Cuando se completa una constelación (0259), se celebra una vez y se muestra al
// volver a las pestañas o a Recompensas (nunca en medio de una partida):
// 1) en el centro, las 7 estrellas se encienden y las líneas se dibujan solas;
// 2) al cerrarse el dibujo, destello y estallido del color de la ciudad;
// 3) la constelación sube y cada premio aparece en el centro, uno por uno, con su
//    propio estallido: las Chispas contando, la pieza de colección con el color de
//    su rareza y, si tocó, la estrella fugaz. Abajo se juntan los que ya salieron.
const LUGARES = new Set(["(tabs)", "recompensas"]);
const DIBUJO_MS = 2600;

interface PremioVista {
  clave: string;
  color: string;
  etiqueta: string;
  mini: ReactNode;
  contenido: ReactNode;
  // 1 normal … 3 enorme: cuántas partículas y cuánto destello.
  nivel: 1 | 2 | 3;
  sonido: "recompensa" | "logro" | "victoria";
}

function piezaDe(slug: string) {
  const it = CATALOGO_NUEVO.find((x) => x.item === slug);
  return { categoria: it?.categoria ?? (slug.startsWith("marco_") ? "marco" : "titulo"), valor: it?.valor ?? slug.replace(/^marco_/, "") };
}

function IconoFugaz({ premio, tam }: { premio: string; tam: number }) {
  if (premio === "hielo") return <IconoCopo tam={tam} c="#BDEBFF" />;
  if (premio === "tiempo_extra") return <IconoReloj tam={tam} c={color.logro} />;
  if (premio === "chispas") return <IconoChispa tam={tam} />;
  return <IconoBombilla tam={tam} c="#C9BDFF" />;
}

function premiosDe(c: ConstelacionCompletada): PremioVista[] {
  const p = c.premio;
  const lista: PremioVista[] = [];
  const multiplicadores = [c.alineacion ? "Gran Alineación ×2" : null, c.de_noche ? "De noche +20 %" : null].filter((x): x is string => !!x);
  lista.push({
    clave: "chispas",
    color: color.logro,
    etiqueta: "Chispas",
    nivel: p.chispas >= 600 ? 3 : 2,
    sonido: "recompensa",
    mini: <IconoChispa tam={18} />,
    contenido: (
      <View style={styles.premio}>
        <View style={[styles.icono, { borderColor: color.logro, boxShadow: `0px 0px 34px ${color.logro}` }]}>
          <IconoChispa tam={56} />
        </View>
        <NumeroAnimado valor={p.chispas} desde={0} prefijo="+" v="mono" c={color.logro} duracion={1300} estilo={styles.cifra} onTic={() => sonar("moneda")} />
        <Texto v="fuerte" c={color.logro}>
          Chispas
        </Texto>
        {multiplicadores.length > 0 && (
          <View style={styles.chips}>
            {multiplicadores.map((m, i) => (
              <Animated.View key={m} entering={ZoomIn.delay(900 + i * 250).springify().damping(9)} style={[styles.chip, { flexDirection: "row", alignItems: "center", gap: 5 }]}>
                {m.startsWith("Gran") ? <IconoPlaneta tam={14} c={color.logro} /> : <IconoLuna tam={14} c="#9FE6FF" />}
                <Texto v="nota" tam={12} c={color.texto}>
                  {m}
                </Texto>
              </Animated.View>
            ))}
          </View>
        )}
      </View>
    ),
  });
  if (p.pieza) {
    const rareza = (p.pieza.rareza ?? "raro") as Rareza;
    const tono = COLOR_RAREZA[rareza] ?? color.primarioClaro;
    const { categoria, valor } = piezaDe(p.pieza.slug);
    const grande = rareza === "legendario" || rareza === "epico";
    lista.push({
      clave: "pieza",
      color: tono,
      etiqueta: "Pieza de colección",
      nivel: grande ? 3 : 2,
      sonido: grande ? "victoria" : "logro",
      mini: <IconoPieza tam={18} c={tono} />,
      contenido: (
        <View style={styles.premio}>
          <View style={[styles.icono, { borderColor: tono, boxShadow: `0px 0px 34px ${tono}` }]}>
            <VistaCosmetico categoria={categoria} valor={valor} tam={70} />
          </View>
          <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 12, letterSpacing: 1.6, color: tono }}>{(NOMBRE_RAREZA[rareza] ?? "").toUpperCase()}</Texto>
          <Texto v="h2" centro>
            {p.pieza.nombre}
          </Texto>
          <Texto v="nota" centro>
            Ya es tuya. Póntela desde la tienda.
          </Texto>
        </View>
      ),
    });
  }
  if (p.fugaz) {
    const fugaz = p.fugaz;
    lista.push({
      clave: "fugaz",
      color: "#9FE6FF",
      etiqueta: "¡Estrella fugaz!",
      nivel: 3,
      sonido: "victoria",
      mini: <IconoEstrellaFugaz tam={18} c="#9FE6FF" />,
      contenido: (
        <View style={styles.premio}>
          <View style={[styles.icono, { borderColor: "#9FE6FF", boxShadow: "0px 0px 34px #9FE6FF" }]}>
            <IconoFugaz premio={fugaz.premio} tam={52} />
          </View>
          <Texto v="h2" centro>
            {NOMBRE_FUGAZ[fugaz.premio] ?? "Premio extra"}
          </Texto>
          <Texto v="nota" centro>
            1 de cada 5 constelaciones trae una.
          </Texto>
        </View>
      ),
    });
  }
  return lista;
}

// Estallido de un premio: rayos girando, halo, onda, partículas y destello, del color del premio.
function Estallido({ cx, cy, ancho, alto, tono, nivel, semilla }: { cx: number; cy: number; ancho: number; alto: number; tono: string; nivel: 1 | 2 | 3; semilla: number }) {
  const liviano = useLiviano();
  const reloj = useClock();
  const opRayos = useSharedValue(0);
  const escalaRayos = useSharedValue(0.5);
  const opHalo = useSharedValue(0);
  const escalaHalo = useSharedValue(0.4);
  const onda = useSharedValue(0);
  const destello = useSharedValue(0);
  const t = useSharedValue(-1);
  const lista = useMemo(
    () => crearExplosion({ cantidad: (liviano ? 26 : 50) + nivel * 18, colores: [tono, tonoHex(tono, 0.5), "#FFFFFF"], velocidad: 460 + nivel * 70, gravedad: 380, vida: 1.8, semilla, tam: 7, radioSalida: 34 }),
    [liviano, nivel, tono, semilla]
  );
  useEffect(() => {
    destello.set(withSequence(withTiming(0.25 + nivel * 0.15, { duration: 70 }), withTiming(0, { duration: 420 })));
    onda.set(withTiming(1, { duration: 700, easing: Easing.linear }));
    t.set(0);
    t.set(withTiming(3, { duration: 3000, easing: Easing.linear }));
    opRayos.set(withSequence(withTiming(1, { duration: 200 }), withDelay(700, withTiming(0.6, { duration: 800 }))));
    escalaRayos.set(withSequence(withTiming(1.2, { duration: 260 }), withSpring(1, { damping: 8 })));
    opHalo.set(withSequence(withTiming(1, { duration: 120 }), withTiming(0.55, { duration: 900 })));
    escalaHalo.set(withSequence(withTiming(1.9, { duration: 200 }), withSpring(1.1, { damping: 10 })));
  }, [nivel, destello, onda, t, opRayos, escalaRayos, opHalo, escalaHalo]);
  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Rayos cx={cx} cy={cy} radio={Math.max(ancho, alto) * 0.6} color={tono} opacidad={opRayos} escala={escalaRayos} reloj={reloj} cantidad={nivel >= 3 ? 16 : 12} />
      <Halo cx={cx} cy={cy} radio={120} color={tono} opacidad={opHalo} escala={escalaHalo} />
      <Onda cx={cx} cy={cy} desde={30} hasta={Math.max(ancho, alto) * 0.5} color={tono} avance={onda} />
      <Particulas lista={lista} tiempo={t} cx={cx} cy={cy} ancho={ancho} alto={alto} brillo={!liviano} />
      <Destello ancho={ancho} alto={alto} opacidad={destello} />
    </Canvas>
  );
}

function Fugaz({ ancho }: { ancho: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }));
  }, [p]);
  const estilo = useAnimatedStyle(() => ({
    opacity: p.value > 0 && p.value < 1 ? 1 - p.value * 0.6 : 0,
    transform: [{ translateX: -40 + p.value * (ancho + 80) }, { translateY: p.value * 160 }, { rotate: "25deg" }],
  }));
  return <Animated.View pointerEvents="none" style={[styles.fugaz, estilo]} />;
}

function Una({ c, onSeguir, ultima }: { c: ConstelacionCompletada; onSeguir: () => void; ultima: boolean }) {
  const { width: W, height: H } = useWindowDimensions();
  const m = mundoDe(c.mundo);
  const acento = m?.neon ?? color.primarioClaro;
  const T = Math.min(280, W - 80);
  const premios = useMemo(() => premiosDe(c), [c]);
  // -1 mientras se dibuja; 0..n-1 el premio que está en el centro.
  const [k, setK] = useState(-1);
  const [cerrado, setCerrado] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const encendido = useSharedValue(0);
  const trazo = useSharedValue(0);
  const subir = useSharedValue(0);
  const latido = useSharedValue(1);

  const CY_CIELO = H * 0.42;
  const CY_ARRIBA = Math.max(120, H * 0.18);
  const ESCALA_ARRIBA = 0.5;
  const CY_PREMIO = H * 0.52;

  useEffect(() => {
    const t = timers.current;
    encendido.set(withTiming(7, { duration: 1400, easing: Easing.linear }));
    trazo.set(withDelay(1400, withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) })));
    [0, 1, 2, 3, 4, 5, 6].forEach((i) => t.push(setTimeout(() => sonar("tecla"), i * 200)));
    t.push(
      setTimeout(() => {
        // Se cierra el dibujo: destello, latido y estallido del color de la ciudad.
        sonar("nivel");
        vibrar.fuerte();
        setCerrado(true);
        latido.set(withSequence(withTiming(1.12, { duration: 160 }), withSpring(1, { damping: 7 })));
      }, DIBUJO_MS)
    );
    t.push(setTimeout(() => subir.set(withTiming(1, { duration: 600, easing: Easing.inOut(Easing.cubic) })), DIBUJO_MS + 1200));
    t.push(setTimeout(() => setK(0), DIBUJO_MS + 1600));
    return () => t.forEach(clearTimeout);
  }, [encendido, trazo, subir, latido]);

  useEffect(() => {
    const pr = premios[k];
    if (!pr) return;
    sonar(pr.sonido);
    if (pr.nivel >= 3) vibrar.fuerte();
    else vibrar.exito();
  }, [k, premios]);

  const estiloCielo = useAnimatedStyle(() => ({
    transform: [{ translateY: (CY_ARRIBA - CY_CIELO) * subir.value }, { scale: latido.value * (1 - (1 - ESCALA_ARRIBA) * subir.value) }],
  }));

  const actual = k >= 0 ? premios[k] : null;
  const esUltimo = k === premios.length - 1;

  function avanzar() {
    if (!actual) return;
    if (!esUltimo) setK(k + 1);
    else onSeguir();
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      {cerrado && !actual && <Estallido cx={W / 2} cy={CY_CIELO} ancho={W} alto={H} tono={acento} nivel={2} semilla={c.numero * 7 + 3} />}
      {actual && <Estallido key={actual.clave} cx={W / 2} cy={CY_PREMIO} ancho={W} alto={H} tono={actual.color} nivel={actual.nivel} semilla={k * 13 + 5} />}
      {actual?.clave === "fugaz" && <Fugaz ancho={W} />}

      <Animated.View style={[styles.cielo, { top: CY_CIELO - T / 2 - 30, width: W }, estiloCielo]} pointerEvents="none">
        <Texto v="micro" c={acento} centro>
          CONSTELACIÓN DE {(m?.nombre ?? c.mundo).toUpperCase()} · Nº {c.numero}
        </Texto>
        <View style={{ marginTop: 12, borderRadius: 28, boxShadow: cerrado ? `0px 0px 40px ${conAlfa(acento, 0.55)}` : undefined }}>
          <Constelacion mundo={c.mundo} estrellas={7} tam={T} encendido={encendido} trazo={trazo} radio={28} />
        </View>
      </Animated.View>

      {cerrado && !actual && (
        <Animated.View entering={FadeInUp.duration(380)} style={[styles.centro, { top: CY_CIELO + T / 2 + 10 }]} pointerEvents="none">
          <Texto v="h1" centro>
            ¡Se dibujó en el cielo!
          </Texto>
        </Animated.View>
      )}

      {actual && (
        <Pressable style={StyleSheet.absoluteFill} onPress={avanzar}>
          <View style={[styles.centro, { top: CY_ARRIBA + (T * ESCALA_ARRIBA) / 2 + 8 }]}>
            <Texto v="h3" centro>
              ¡Se dibujó en el cielo!
            </Texto>
            <Texto v="micro" c={actual.color} centro style={{ marginTop: 2 }}>
              {premios.length > 1 ? `${actual.etiqueta} · ${k + 1} de ${premios.length}` : actual.etiqueta}
            </Texto>
          </View>
          <Animated.View key={actual.clave} entering={ZoomIn.springify().damping(9).stiffness(150)} style={[styles.centro, { top: CY_PREMIO - 56 }]}>
            {actual.contenido}
          </Animated.View>
          <View style={styles.pie}>
            <View style={styles.juntados}>
              {premios.slice(0, k + 1).map((p, i) => (
                <Animated.View key={p.clave} entering={ZoomIn.delay(i === k ? 500 : 0).duration(300)} style={[styles.mini, { borderColor: p.color }]}>
                  {p.mini}
                </Animated.View>
              ))}
            </View>
            <Animated.View key={`b${k}`} entering={FadeInDown.delay(700).duration(300)}>
              <Boton3D titulo={!esUltimo ? "Siguiente premio" : ultima ? "¡Genial!" : "Siguiente constelación"} variante="logro" brillo onPress={avanzar} />
            </Animated.View>
          </View>
        </Pressable>
      )}
    </View>
  );
}

export default function CelebracionConstelaciones() {
  const segmentos = useSegments();
  const aviso = useSyncExternalStore(suscribirAvisoConstelaciones, leerAvisoConstelaciones);
  const primeraVez = useSyncExternalStore(suscribirPrimeraVez, leerPrimeraVezActiva);
  const [lista, setLista] = useState<ConstelacionCompletada[]>([]);
  const [i, setI] = useState(0);
  const permitido = LUGARES.has(segmentos[0] ?? "") && !primeraVez;

  useEffect(() => {
    if (!aviso || !permitido || lista.length > 0) return;
    limpiarAvisoConstelaciones();
    constelacionesPorVer(supabase).then((l) => {
      if (l.length > 0) {
        setI(0);
        setLista(l);
      }
    });
  }, [aviso, permitido, lista.length]);

  if (lista.length === 0 || !permitido) return null;
  const actual = lista[i];

  async function seguir() {
    if (i < lista.length - 1) {
      setI(i + 1);
      return;
    }
    // Se recuerda como vista al instante (así no se repite aunque la base tarde) y se cierra.
    const marcado = marcarConstelacionesVistas(supabase, lista);
    setLista([]);
    await marcado;
    recargarJugador();
    const { data } = await supabase.auth.getSession();
    if (data.session) recargarCosmeticos(data.session.user.id);
  }

  return (
    <SobreOscuro>
      <Animated.View entering={FadeIn.duration(300)} style={styles.fondo}>
        <Una key={actual.id} c={actual} onSeguir={seguir} ultima={i === lista.length - 1} />
      </Animated.View>
    </SobreOscuro>
  );
}

const styles = StyleSheet.create({
  fondo: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: conAlfa(COLOR_NOCHE.bgHondo, 0.97), zIndex: 125, elevation: 125 },
  cielo: { position: "absolute", left: 0, alignItems: "center" },
  centro: { position: "absolute", left: 24, right: 24, alignItems: "center" },
  premio: { alignItems: "center", gap: 6 },
  icono: { width: 112, height: 112, borderRadius: 56, borderWidth: 2, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(10,12,24,0.85)" },
  cifra: { fontSize: 52, lineHeight: 60, fontFamily: fuente.display },
  chips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: conAlfa(color.primario, 0.25), borderWidth: 1, borderColor: conAlfa(color.primarioClaro, 0.5) },
  pie: { position: "absolute", left: 24, right: 24, bottom: 36, gap: 14 },
  juntados: { flexDirection: "row", justifyContent: "center", gap: 10 },
  mini: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(10,12,24,0.8)" },
  fugaz: { position: "absolute", top: 60, left: 0, width: 90, height: 3, borderRadius: 2, backgroundColor: "#FFFFFF", boxShadow: `0px 0px 12px ${color.logro}` },
});
