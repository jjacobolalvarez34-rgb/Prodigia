import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import { RANGOS_ELO } from "~/lib/placa";
import { vibrar } from "~/lib/efectos";
import { aclarar, color, conAlfa, fuente, MUNDOS, MUNDO_POR_SLUG, type Mundo, type MundoSlug } from "~/tema";
import Anillo from "../Anillo";
import Barra from "../Barra";
import Boton3D from "../Boton3D";
import Ciudad from "../Ciudad";
import { IconoChispa, IconoLlama } from "../Iconos";
import Logo from "../Logo";
import NumeroAnimado from "../NumeroAnimado";
import Texto from "../Texto";

// La presentación de Prodigia antes de la partida de prueba (igual que la landing
// de la web, VisitanteLanding.tsx, pero con movimiento): cada escena se arma de a
// poco para que se entienda qué es cada cosa.

// Algo que flota suave, para que la escena no se quede quieta.
function Flota({ children, amplitud = 6, duracion = 2200, demora = 0 }: { children: React.ReactNode; amplitud?: number; duracion?: number; demora?: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(demora, withRepeat(withSequence(withTiming(1, { duration: duracion, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: duracion, easing: Easing.inOut(Easing.quad) })), -1)));
  }, [t, duracion, demora]);
  const estilo = useAnimatedStyle(() => ({ transform: [{ translateY: -amplitud * t.value }] }));
  return <Animated.View style={estilo}>{children}</Animated.View>;
}

// ---------- Saludo: "¿Ya conoces Prodigia?" ----------
export function Saludo({ onNuevo, onTengoCuenta }: { onNuevo: () => void; onTengoCuenta: () => void }) {
  const brillo = useSharedValue(0);
  useEffect(() => {
    brillo.set(withDelay(500, withRepeat(withSequence(withTiming(1, { duration: 1600 }), withTiming(0.3, { duration: 1600 })), -1)));
  }, [brillo]);
  const halo = useAnimatedStyle(() => ({ opacity: brillo.value, transform: [{ scale: 0.85 + brillo.value * 0.25 }] }));
  const letras = Array.from("Prodigia");
  return (
    <View style={styles.centro}>
      <View style={{ alignItems: "center", gap: 18 }}>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Animated.View style={[styles.halo, halo]} />
          <Animated.View entering={ZoomIn.duration(700).springify().damping(12)}>
            <Logo tam={92} />
          </Animated.View>
        </View>
        <Animated.View entering={FadeInDown.delay(450).duration(450)}>
          <Texto v="micro" c={color.primarioClaro} centro>
            Bienvenido a
          </Texto>
        </Animated.View>
        <View style={{ flexDirection: "row" }}>
          {letras.map((l, i) => (
            <Animated.Text key={i} entering={FadeInDown.delay(650 + i * 70).springify().damping(14)} style={styles.marca}>
              {l}
            </Animated.Text>
          ))}
        </View>
        <Animated.View entering={FadeIn.delay(1350).duration(500)}>
          <Texto v="cuerpo" c={color.texto2} centro>
            Entrena tu cabeza jugando.
          </Texto>
        </Animated.View>
      </View>
      <Animated.View entering={FadeInUp.delay(1750).duration(450)} style={{ gap: 12, alignSelf: "stretch" }}>
        <Texto v="h3" centro>
          ¿Ya conoces Prodigia?
        </Texto>
        <Boton3D titulo="No, quiero conocerla" brillo onPress={onNuevo} />
        <Boton3D titulo="Sí, ya tengo cuenta" variante="secundario" onPress={onTengoCuenta} />
      </Animated.View>
    </View>
  );
}

// ---------- Escena 1: las 15 ciudades ----------
function EscenaCiudades() {
  const { width } = useWindowDimensions();
  const radio = Math.min(140, (width - 80) / 2);
  return (
    <View style={{ height: 250, alignItems: "center", justifyContent: "flex-end" }}>
      {MUNDOS.map((m, i) => {
        const ang = Math.PI + (Math.PI * i) / (MUNDOS.length - 1);
        const x = Math.cos(ang) * radio;
        const y = Math.sin(ang) * radio * 0.95;
        return (
          <Animated.View key={m.slug} entering={ZoomIn.delay(250 + i * 90).springify().damping(11)} style={[styles.orbe, { transform: [{ translateX: x }, { translateY: y - 30 }], borderColor: m.neon, backgroundColor: conAlfa(m.base, 0.35), boxShadow: `0px 0px 14px ${conAlfa(m.neon, 0.6)}` }]}>
            <Texto style={{ fontFamily: fuente.display, fontSize: m.glifo.length > 2 ? 10 : 15, color: m.neon }}>{m.glifo}</Texto>
          </Animated.View>
        );
      })}
      <Animated.View entering={FadeInUp.duration(700)} style={{ alignSelf: "stretch" }}>
        <Ciudad semilla="prodigia-entrada" acento={color.primarioNeon} alto={110} radio={20} estilo={{ borderWidth: 1, borderColor: color.border }} />
      </Animated.View>
    </View>
  );
}

// ---------- Escena 2: partidas de 60 segundos ----------
const PREGUNTAS_EJEMPLO = [
  { texto: "7 × 8", mundo: "numeria" as MundoSlug },
  { texto: "¿Capital de Japón?", mundo: "geografia" as MundoSlug },
  { texto: "print(2 ** 3)", mundo: "codia" as MundoSlug },
];

function EscenaPartida() {
  return (
    <View style={{ height: 250, flexDirection: "row", alignItems: "center", gap: 14 }}>
      <Animated.View entering={ZoomIn.duration(500).springify()}>
        <Anillo valor={1} tam={112} grosor={9} acento={color.logro} duracion={2600} demora={300}>
          <NumeroAnimado valor={60} desde={0} duracion={2600} demora={300} v="mono" estilo={{ fontSize: 34, lineHeight: 40 }} />
          <Texto v="micro" c={color.logro}>
            segundos
          </Texto>
        </Anillo>
      </Animated.View>
      <View style={{ flex: 1, gap: 10 }}>
        {PREGUNTAS_EJEMPLO.map((p, i) => {
          const m = MUNDO_POR_SLUG[p.mundo];
          return (
            <Animated.View key={p.texto} entering={FadeInRight.delay(500 + i * 350).springify().damping(15)} style={[styles.preguntaEj, { borderColor: conAlfa(m.neon, 0.6) }]}>
              <Texto v="mono" tam={13} style={{ flex: 1 }} numberOfLines={1}>
                {p.texto}
              </Texto>
              <Animated.View entering={ZoomIn.delay(800 + i * 350).springify()}>
                <Texto v="fuerte" c={color.correcto}>
                  ✓
                </Texto>
              </Animated.View>
            </Animated.View>
          );
        })}
        <Animated.View entering={FadeInUp.delay(1700).duration(400)} style={{ alignSelf: "flex-end" }}>
          <Flota amplitud={5}>
            <Texto v="mono" c={color.correcto}>
              🔥 racha +3 s
            </Texto>
          </Flota>
        </Animated.View>
      </View>
    </View>
  );
}

// ---------- Escena 3: Exp, Chispas y racha ----------
function EscenaPremios() {
  return (
    <View style={{ height: 250, justifyContent: "center", gap: 16 }}>
      <Animated.View entering={FadeInLeft.delay(150).springify().damping(15)} style={styles.filaPremio}>
        <Flota amplitud={4} duracion={1800}>
          <IconoChispa tam={40} />
        </Flota>
        <View style={{ flex: 1 }}>
          <NumeroAnimado valor={250} desde={0} duracion={1600} demora={450} v="mono" c={color.logro} estilo={{ fontSize: 26, lineHeight: 32 }} prefijo="+" />
          <Texto v="nota">Chispas para gastar en la tienda</Texto>
        </View>
      </Animated.View>
      <Animated.View entering={FadeInLeft.delay(550).springify().damping(15)} style={styles.filaPremio}>
        <View style={styles.nivel}>
          <Texto v="mono" tam={15}>
            Nv 4
          </Texto>
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <Texto v="fuerte" tam={14}>
            Subes de nivel en cada ciudad
          </Texto>
          <Barra valor={0.78} demora={900} duracion={1400} colores={[color.primarioBase, color.primarioNeon]} />
        </View>
      </Animated.View>
      <Animated.View entering={FadeInLeft.delay(950).springify().damping(15)} style={styles.filaPremio}>
        <Flota amplitud={3} duracion={900}>
          <IconoLlama tam={40} estado="llamas" />
        </Flota>
        <View style={{ flex: 1 }}>
          <NumeroAnimado valor={7} desde={0} duracion={1200} demora={1200} v="mono" c={color.racha} estilo={{ fontSize: 26, lineHeight: 32 }} sufijo=" días" formato={(n) => String(Math.round(n))} />
          <Texto v="nota">Juega cada día y tu racha crece</Texto>
        </View>
      </Animated.View>
    </View>
  );
}

// ---------- Escena 4: competir ----------
function EscenaCompetir() {
  return (
    <View style={{ height: 250, justifyContent: "center", gap: 26 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <Animated.View entering={FadeInLeft.delay(150).springify().damping(13)} style={[styles.duelista, { borderColor: color.primarioNeon, backgroundColor: conAlfa(color.primario, 0.22) }]}>
          <Texto style={styles.duelistaLetra}>Tú</Texto>
        </Animated.View>
        <Animated.View entering={ZoomIn.delay(650).springify().damping(8)}>
          <Texto style={styles.vs}>VS</Texto>
        </Animated.View>
        <Animated.View entering={FadeInRight.delay(150).springify().damping(13)} style={[styles.duelista, { borderColor: color.error, backgroundColor: conAlfa(color.error, 0.18) }]}>
          <Texto style={styles.duelistaLetra}>?</Texto>
        </Animated.View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
        {RANGOS_ELO.map((r, i) => (
          <Animated.View key={r.slug} entering={FadeInUp.delay(1000 + i * 120).springify()} style={{ alignItems: "center", gap: 4 }}>
            <View style={[styles.rango, { backgroundColor: r.colorHex, boxShadow: `0px 0px 10px ${conAlfa(r.colorHex, 0.7)}` }]} />
            <Texto v="nota" tam={9.5}>
              {r.nombre}
            </Texto>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const ESCENAS = [
  { Dibujo: EscenaCiudades, titulo: "Una ciudad para cada forma de pensar", texto: "15 ciudades: cálculo, lógica, mapas, química, física, biología, música, código y más. Cada una con su propio día y su propia noche." },
  { Dibujo: EscenaPartida, titulo: "10 preguntas. 60 segundos.", texto: "Partidas cortas que se adaptan a tu nivel. En racha ganas segundos; si respondes rápido, ganas más Exp." },
  { Dibujo: EscenaPremios, titulo: "Juegas y ganas", texto: "Cada partida te da Exp y Chispas. Con las Chispas compras marcos, fondos y ayudas en la tienda." },
  { Dibujo: EscenaCompetir, titulo: "Y cuando quieras, compite", texto: "Duelos en vivo con amigos, rankeds de Bronce a Prodigio, clanes y una liga cada semana." },
];

export function Escenas({ onTerminar, onSaltar }: { onTerminar: () => void; onSaltar: () => void }) {
  const [i, setI] = useState(0);
  const { Dibujo, titulo, texto } = ESCENAS[i];
  function siguiente() {
    vibrar.seleccion();
    if (i < ESCENAS.length - 1) setI(i + 1);
    else onTerminar();
  }
  return (
    <View style={styles.centro}>
      <Pressable onPress={onSaltar} style={styles.saltar} hitSlop={12}>
        <Texto v="nota">Saltar</Texto>
      </Pressable>
      <Animated.View key={i} entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)} style={{ gap: 22 }}>
        <Dibujo />
        <View style={{ gap: 8 }}>
          <Animated.View entering={FadeInDown.delay(200).duration(420)}>
            <Texto v="display" centro tam={28}>
              {titulo}
            </Texto>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(420).duration(420)}>
            <Texto v="cuerpo" c={color.texto2} centro>
              {texto}
            </Texto>
          </Animated.View>
        </View>
      </Animated.View>
      <View style={{ gap: 18 }}>
        <View style={styles.puntos}>
          {ESCENAS.map((_, k) => (
            <View key={k} style={[styles.punto, k === i && styles.puntoActivo, k < i && { backgroundColor: color.primarioClaro }]} />
          ))}
        </View>
        <Boton3D titulo={i < ESCENAS.length - 1 ? "Siguiente" : "Elegir una ciudad para probar"} brillo onPress={siguiente} />
      </View>
    </View>
  );
}

// ---------- Elegir ciudad (tarjetas misteriosas, como la web) ----------
function TarjetaMisteriosa({ m, i, onElegir }: { m: Mundo; i: number; onElegir: () => void }) {
  const [revelada, setRevelada] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (t.current) clearTimeout(t.current);
  }, []);
  return (
    <Animated.View entering={ZoomIn.delay(150 + i * 55).springify().damping(13)} style={styles.celda}>
      <Pressable
        onPress={() => {
          vibrar.seleccion();
          onElegir();
        }}
        onLongPress={() => {
          vibrar.medio();
          setRevelada(true);
          if (t.current) clearTimeout(t.current);
          t.current = setTimeout(() => setRevelada(false), 1800);
        }}
        delayLongPress={350}
        style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.95 : 1 }] }]}
      >
        <LinearGradient colors={[m.base, aclarar(m.base, 0.35)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.misteriosa}>
          <Flota amplitud={3} duracion={1600 + (i % 4) * 300} demora={i * 120}>
            <View style={styles.glifoMisterio}>
              <Texto style={{ fontFamily: fuente.display, fontSize: m.glifo.length > 2 ? 13 : 20, color: "#fff" }}>{m.glifo}</Texto>
            </View>
          </Flota>
          <Texto style={styles.interrogacion}>?</Texto>
          {revelada && (
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={styles.revelado}>
              <Texto v="fuerte" tam={12.5} c="#fff" centro>
                {m.nombre}
              </Texto>
              <Texto v="nota" tam={10.5} c="rgba(255,255,255,0.85)" centro>
                {m.tema}
              </Texto>
            </Animated.View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export function ElegirCiudad({ onElegir }: { onElegir: (slug: MundoSlug) => void }) {
  return (
    <View style={{ gap: 18 }}>
      <Animated.View entering={FadeInDown.duration(450)} style={{ gap: 6 }}>
        <Texto v="display" centro tam={27}>
          Elige una ciudad para probar
        </Texto>
        <Texto v="cuerpo" c={color.texto2} centro>
          Una partida de prueba de 5 preguntas, sin registrarte.
        </Texto>
        <Texto v="nota" centro>
          Mantén presionada una ciudad para ver qué se estudia ahí.
        </Texto>
      </Animated.View>
      <View style={styles.grilla}>
        {MUNDOS.map((m, i) => (
          <TarjetaMisteriosa key={m.slug} m={m} i={i} onElegir={() => onElegir(m.slug)} />
        ))}
      </View>
    </View>
  );
}

// ---------- Cómo funciona la partida (y se revela la ciudad) ----------
const REGLAS = [
  { icono: "⏱️", titulo: "5 preguntas, 30 segundos", texto: "Esta es de prueba. Las de verdad son 10 preguntas en 60 segundos." },
  { icono: "🔥", titulo: "En racha, más tiempo", texto: "Cada respuesta seguida bien te suma segundos al reloj." },
  { icono: "⚡", titulo: "Rápido, más Exp", texto: "Cuanto antes respondes, más Experiencia ganas." },
];

export function Mecanismo({ slug, entrando, error, onEmpezar, onCambiar }: { slug: MundoSlug; entrando: boolean; error: string | null; onEmpezar: () => void; onCambiar: () => void }) {
  const m = MUNDO_POR_SLUG[slug];
  const escala = useSharedValue(0.6);
  useEffect(() => {
    escala.set(withSpring(1, { damping: 9, stiffness: 120 }));
  }, [escala]);
  const estiloRevela = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));
  return (
    <View style={{ gap: 18 }}>
      <Animated.View entering={FadeIn.duration(400)} style={[{ borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: conAlfa(m.neon, 0.6), boxShadow: `0px 0px 30px ${conAlfa(m.neon, 0.35)}` }, estiloRevela]}>
        <Ciudad semilla={m.slug} acento={m.neon} alto={130} radio={0} />
        <View style={styles.cartelCiudad}>
          <Texto v="micro" c={m.neon}>
            Tu ciudad de prueba
          </Texto>
          <Texto v="display" tam={30}>
            {m.nombre}
          </Texto>
          <Texto v="nota">{m.tema}</Texto>
        </View>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(350).duration(400)}>
        <Texto v="h2" centro>
          Cómo funciona una partida
        </Texto>
      </Animated.View>
      <View style={{ gap: 10 }}>
        {REGLAS.map((r, i) => (
          <Animated.View key={r.titulo} entering={FadeInRight.delay(550 + i * 220).springify().damping(15)} style={styles.regla}>
            <Texto style={{ fontSize: 26 }}>{r.icono}</Texto>
            <View style={{ flex: 1 }}>
              <Texto v="fuerte" tam={14.5}>
                {r.titulo}
              </Texto>
              <Texto v="nota" tam={12.5}>
                {r.texto}
              </Texto>
            </View>
          </Animated.View>
        ))}
      </View>
      {error && (
        <Texto c={color.error} centro>
          {error}
        </Texto>
      )}
      <Animated.View entering={FadeInUp.delay(1300).duration(400)} style={{ gap: 10 }}>
        <Boton3D titulo="¡Empezar!" acento={m.base} brillo cargando={entrando} onPress={onEmpezar} />
        <Pressable onPress={onCambiar} style={{ alignSelf: "center", padding: 6 }} disabled={entrando}>
          <Texto v="nota">Elegir otra ciudad</Texto>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: "space-between", padding: 24, paddingTop: 48, gap: 20 },
  halo: { position: "absolute", width: 150, height: 150, borderRadius: 75, backgroundColor: conAlfa(color.primario, 0.18), boxShadow: `0px 0px 60px ${color.primarioNeon}` },
  marca: { fontFamily: fuente.display, fontSize: 52, color: color.texto, letterSpacing: -1.5 },
  saltar: { position: "absolute", top: 14, right: 22, zIndex: 2 },
  orbe: { position: "absolute", bottom: 110, width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  preguntaEj: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1, backgroundColor: color.surface1 },
  filaPremio: { flexDirection: "row", alignItems: "center", gap: 14, padding: 12, borderRadius: 16, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border },
  nivel: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: conAlfa(color.primario, 0.25), borderWidth: 1, borderColor: color.primarioNeon },
  duelista: { width: 92, height: 92, borderRadius: 46, borderWidth: 4, alignItems: "center", justifyContent: "center" },
  duelistaLetra: { fontFamily: fuente.display, fontSize: 30, color: color.texto },
  vs: { fontFamily: fuente.display, fontSize: 40, color: color.logro, fontStyle: "italic" },
  rango: { width: 22, height: 22, borderRadius: 6, transform: [{ rotate: "45deg" }] },
  puntos: { flexDirection: "row", justifyContent: "center", gap: 8 },
  punto: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.border },
  puntoActivo: { width: 26, backgroundColor: color.primario },
  grilla: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10 },
  celda: { width: "30.5%" },
  misteriosa: { height: 104, borderRadius: 18, alignItems: "center", justifyContent: "center", gap: 6, overflow: "hidden" },
  glifoMisterio: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" },
  interrogacion: { fontFamily: fuente.display, fontSize: 18, color: "rgba(255,255,255,0.6)", letterSpacing: 3 },
  revelado: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.82)", alignItems: "center", justifyContent: "center", padding: 6, gap: 2 },
  cartelCiudad: { padding: 14, gap: 2, backgroundColor: color.surface1 },
  regla: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border },
});
