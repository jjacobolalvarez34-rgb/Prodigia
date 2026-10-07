import { Redirect, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withDelay, withSpring, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BENEFICIOS_PRO } from "@/lib/pro/beneficios";
import {
  aplicarMundosPendientes,
  convertirInvitado,
  entrarConGoogle,
  guardarMundosPendientes,
  leerCiudadDemo,
  leerMundosPendientes,
  rutaDemo,
} from "~/lib/bienvenida";
import { sonar, vibrar } from "~/lib/efectos";
import { recargarJugador, useJugador } from "~/lib/jugador";
import { useSesion } from "~/lib/sesion";
import { mensajeError, supabase } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import CampoContrasena from "~/ui/CampoContrasena";
import Ciudad from "~/ui/Ciudad";
import Glifos from "~/ui/Glifos";
import Logo from "~/ui/Logo";
import Texto from "~/ui/Texto";
import { color, conAlfa, fuente, MUNDOS, MUNDO_POR_SLUG, radio, type MundoSlug } from "~/tema";

// Lo que sigue a la partida de prueba, igual que /demo/[mundo] de la web:
// resultado → Prodigia Pro → elegir los 2 mundos gratis → crear la cuenta. Los
// mundos se guardan recién con la cuenta hecha; después vienen el Kit del Pionero
// y el recorrido por las pestañas (PrimeraVez).
type Fase = "decidiendo" | "resultado" | "pro" | "mundos" | "cuenta";

export default function Bienvenida() {
  const params = useLocalSearchParams<{ fase?: string; mundo?: string; correctos?: string; total?: string }>();
  const { sesion } = useSesion();
  const { placa, mundos } = useJugador();
  const [fase, setFase] = useState<Fase>(() => (params.fase === "resultado" ? "resultado" : "decidiendo"));
  const [demo, setDemo] = useState<Href | null>(null);
  const [elegidos, setElegidos] = useState<MundoSlug[]>([]);

  useEffect(() => {
    if (fase !== "decidiendo") return;
    let vivo = true;
    (async () => {
      const ciudad = await leerCiudadDemo();
      const pendientes = await leerMundosPendientes();
      if (!vivo) return;
      if (ciudad) setDemo(rutaDemo(ciudad));
      else if (pendientes.length === 2) {
        setElegidos(pendientes as MundoSlug[]);
        setFase("cuenta");
      } else setFase("mundos");
    })();
    return () => {
      vivo = false;
    };
  }, [fase]);

  if (sesion && !sesion.user.is_anonymous && fase !== "cuenta") return <Redirect href="/" />;
  // Un invitado de antes que ya tiene sus mundos: lo atiende «Guarda tu progreso».
  if (placa && mundos.length >= 2 && fase !== "cuenta") return <Redirect href="/" />;
  if (demo) return <Redirect href={demo} />;

  const mundoDemo = MUNDO_POR_SLUG[(params.mundo ?? "numeria") as MundoSlug] ?? MUNDO_POR_SLUG.numeria;

  return (
    <SafeAreaView style={styles.pantalla}>
      <Glifos glifos={MUNDOS.map((m) => m.glifo)} acento={color.primarioNeon} cantidad={12} opacidad={0.06} />
      {fase === "resultado" && (
        <Resultado correctos={Number(params.correctos ?? 0)} total={Number(params.total ?? 5)} acento={mundoDemo.neon} base={mundoDemo.base} onContinuar={() => setFase("pro")} />
      )}
      {fase === "pro" && <PromoPro onContinuar={() => setFase("mundos")} />}
      {fase === "mundos" && (
        <ElegirDos
          inicial={params.mundo ? [params.mundo as MundoSlug] : []}
          onListo={(m) => {
            guardarMundosPendientes(m);
            setElegidos(m);
            setFase("cuenta");
          }}
        />
      )}
      {fase === "cuenta" && <CrearCuenta mundos={elegidos} onCambiarMundos={() => setFase("mundos")} />}
    </SafeAreaView>
  );
}

// ---------- Resultado de la partida de prueba ----------
function Resultado({ correctos, total, acento, base, onContinuar }: { correctos: number; total: number; acento: string; base: string; onContinuar: () => void }) {
  const escala = useSharedValue(0);
  useEffect(() => {
    escala.set(withDelay(200, withSpring(1, { damping: 7, stiffness: 140 })));
    const t = setTimeout(() => {
      sonar(correctos >= Math.ceil(total / 2) ? "recompensa" : "ya");
      vibrar.exito();
    }, 350);
    return () => clearTimeout(t);
  }, [escala, correctos, total]);
  const estilo = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));
  const titulo = correctos === total ? "¡Perfecto!" : correctos >= Math.ceil(total / 2) ? "¡Nada mal para empezar!" : "¡Así se empieza!";
  return (
    <View style={styles.centro}>
      <View style={{ alignItems: "center", gap: 18 }}>
        <Animated.View style={[styles.circuloResultado, { backgroundColor: base, boxShadow: `0px 0px 40px ${conAlfa(acento, 0.6)}` }, estilo]}>
          <Texto style={{ fontFamily: fuente.display, fontSize: 40, color: "#fff" }}>
            {correctos}/{total}
          </Texto>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <Texto v="display" centro>
            {titulo}
          </Texto>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800).duration(400)}>
          <Texto v="cuerpo" c={color.texto2} centro>
            Acertaste {correctos} de {total}. Cada partida que juegues te lleva a tu nivel justo: si te va bien, sube; si fallas, baja un poquito para afianzar.
          </Texto>
        </Animated.View>
      </View>
      <Animated.View entering={FadeInUp.delay(1200).duration(400)} style={{ alignSelf: "stretch" }}>
        <Boton3D titulo="Continuar" brillo onPress={onContinuar} />
      </Animated.View>
    </View>
  );
}

// ---------- Prodigia Pro (FlujoPromoPro.tsx de la web) ----------
function PromoPro({ onContinuar }: { onContinuar: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <Animated.View entering={FadeInDown.duration(400)} style={{ alignItems: "center", gap: 6 }}>
        <Texto v="micro" c={color.logro}>
          Prodigia Pro
        </Texto>
        <Texto v="display" centro>
          Y cuando quieras, Prodigia Pro
        </Texto>
        <Texto v="cuerpo" c={color.texto2} centro>
          Esto es lo que tendrás disponible más adelante, si quieres ir más rápido.
        </Texto>
      </Animated.View>
      <View style={styles.grillaPro}>
        {BENEFICIOS_PRO.map((b, i) => (
          <Animated.View key={b.titulo} entering={ZoomIn.delay(250 + i * 110).springify().damping(13)} style={styles.beneficio}>
            <Texto style={{ fontSize: 26 }}>{b.emoji}</Texto>
            <Texto v="fuerte" tam={13} centro>
              {b.titulo}
            </Texto>
          </Animated.View>
        ))}
      </View>
      <Animated.View entering={FadeInUp.delay(250 + BENEFICIOS_PRO.length * 110).duration(400)}>
        <Boton3D titulo="Continuar" brillo onPress={onContinuar} />
      </Animated.View>
    </ScrollView>
  );
}

// ---------- Los 2 mundos gratis (FlujoElegirMundos.tsx de la web) ----------
function ElegirDos({ inicial, onListo }: { inicial: MundoSlug[]; onListo: (m: MundoSlug[]) => void }) {
  const [elegidos, setElegidos] = useState<MundoSlug[]>(inicial);
  function alternar(slug: MundoSlug) {
    vibrar.seleccion();
    setElegidos((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : prev.length >= 2 ? prev : [...prev, slug]));
  }
  const faltan = 2 - elegidos.length;
  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <Animated.View entering={FadeInDown.duration(400)} style={{ gap: 6 }}>
        <Texto v="display" centro>
          Elige tus 2 mundos
        </Texto>
        <Texto v="cuerpo" c={color.texto2} centro>
          Todos empiezan bloqueados: los 2 que elijas acá son gratis para siempre. Los demás se desbloquean después con Chispas, jugando.
        </Texto>
      </Animated.View>
      <View style={styles.grilla}>
        {MUNDOS.map((m, i) => {
          const activo = elegidos.includes(m.slug);
          const apagado = !activo && elegidos.length >= 2;
          return (
            <Animated.View key={m.slug} entering={ZoomIn.delay(150 + i * 50).springify().damping(14)} style={{ width: "31%" }}>
              <Pressable
                onPress={() => alternar(m.slug)}
                disabled={apagado}
                style={[styles.mundo, { borderColor: activo ? m.neon : conAlfa(m.neon, 0.3), backgroundColor: activo ? conAlfa(m.base, 0.22) : color.surface1, opacity: apagado ? 0.45 : 1 }, activo && { boxShadow: `0px 0px 18px ${conAlfa(m.neon, 0.45)}` }]}
              >
                <Ciudad semilla={m.slug} acento={m.neon} alto={40} radio={10} apagada={!activo} quieta sinLuna estilo={{ alignSelf: "stretch" }} />
                <Texto style={{ fontFamily: fuente.display, fontSize: m.glifo.length > 2 ? 14 : 20, color: m.neon }}>{m.glifo}</Texto>
                <Texto v="fuerte" tam={12.5} centro>
                  {m.nombre}
                </Texto>
                <Texto v="nota" tam={10.5} c={activo ? m.neon : color.texto2}>
                  {activo ? "Elegido ✓" : "🔒 Bloqueado"}
                </Texto>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
      <Boton3D titulo={faltan === 0 ? "Empezar a jugar" : `Elige ${faltan} más`} brillo deshabilitado={faltan !== 0} onPress={() => onListo(elegidos)} />
    </ScrollView>
  );
}

// ---------- Crear la cuenta (lo jugado como invitado se conserva) ----------
const VENTAJAS = ["Tu partida y tus 2 mundos, guardados", "La misma cuenta en la app y en la web", "Duelos con amigos, clanes y la liga", "Kit del Pionero: 1.000 Chispas, un marco y un título"];

function CrearCuenta({ mundos, onCambiarMundos }: { mundos: MundoSlug[]; onCambiarMundos: () => void }) {
  const router = useRouter();
  const [modo, setModo] = useState<"crear" | "entrar">("crear");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [conGoogle, setConGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);

  async function terminar() {
    await aplicarMundosPendientes();
    await recargarJugador();
    vibrar.exito();
    router.replace("/");
  }

  async function crear() {
    if (nombre.trim().length < 2) {
      setError("Escribe tu nombre (al menos 2 letras).");
      return;
    }
    setEnviando(true);
    setError(null);
    const r = await convertirInvitado(nombre, email, password);
    if (!r.ok) {
      setEnviando(false);
      setError(r.error);
      return;
    }
    if (r.confirmarCorreo) {
      setEnviando(false);
      setConfirmar(true);
      return;
    }
    await supabase.auth.refreshSession();
    await terminar();
  }

  async function entrar() {
    setEnviando(true);
    setError(null);
    let correo = email.trim();
    if (!correo.includes("@")) {
      const { data } = await supabase.rpc("resolver_email_por_usuario", { p_identificador: correo });
      if (!data) {
        setError("Usuario o contraseña incorrectos.");
        setEnviando(false);
        return;
      }
      correo = data as string;
    }
    const { error: e } = await supabase.auth.signInWithPassword({ email: correo, password });
    if (e) {
      setError(e.message === "Invalid login credentials" ? "Usuario o contraseña incorrectos." : mensajeError(e));
      setEnviando(false);
      return;
    }
    await terminar();
  }

  async function yaConfirme() {
    setEnviando(true);
    const { data } = await supabase.auth.refreshSession();
    if (data.session && !data.session.user.is_anonymous) await terminar();
    else {
      setEnviando(false);
      setError("Todavía no vemos la confirmación. Abre el enlace del correo y vuelve a intentar.");
    }
  }

  async function google() {
    setConGoogle(true);
    setError(null);
    const r = await entrarConGoogle();
    if (r.ok) await terminar();
    else {
      setConGoogle(false);
      if (r.error) setError(r.error);
    }
  }

  if (confirmar) {
    return (
      <Animated.View entering={FadeIn} style={styles.centro}>
        <View style={{ alignItems: "center", gap: 14 }}>
          <Logo tam={64} />
          <Texto v="display" centro>
            Revisa tu correo
          </Texto>
          <Texto v="cuerpo" c={color.texto2} centro>
            Te mandamos un enlace a {email.trim()}. Ábrelo para activar tu cuenta y vuelve acá.
          </Texto>
          {error && (
            <Texto c={color.error} centro>
              {error}
            </Texto>
          )}
        </View>
        <Boton3D titulo="Ya lo confirmé" brillo cargando={enviando} onPress={yaConfirme} />
      </Animated.View>
    );
  }

  const creando = modo === "crear";
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.duration(400)} style={{ alignItems: "center", gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {mundos.map((s, i) => {
              const m = MUNDO_POR_SLUG[s];
              return (
                <Animated.View key={s} entering={ZoomIn.delay(150 + i * 150).springify()} style={[styles.chipMundo, { borderColor: m.neon, backgroundColor: conAlfa(m.base, 0.25) }]}>
                  <Texto v="fuerte" tam={12.5} c={m.neon}>
                    {m.glifo} {m.nombre}
                  </Texto>
                </Animated.View>
              );
            })}
          </View>
          <Texto v="display" centro>
            {creando ? "Crea tu cuenta para seguir" : "Entra a tu cuenta"}
          </Texto>
          <Texto v="cuerpo" c={color.texto2} centro>
            {creando ? "Así no pierdes lo que jugaste y tus mundos quedan guardados." : "Con la misma cuenta de la web."}
          </Texto>
        </Animated.View>
        {creando && (
          <View style={styles.ventajas}>
            {VENTAJAS.map((t, i) => (
              <Animated.View key={t} entering={FadeInDown.delay(300 + i * 120).duration(350)} style={{ flexDirection: "row", gap: 8 }}>
                <Texto c={color.correcto}>✓</Texto>
                <Texto v="cuerpo" tam={14} style={{ flex: 1 }}>
                  {t}
                </Texto>
              </Animated.View>
            ))}
          </View>
        )}
        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={{ gap: 12 }}>
          <Boton3D titulo="Continuar con Google" variante="secundario" cargando={conGoogle} onPress={google} />
          <View style={styles.separador}>
            <View style={styles.linea} />
            <Texto v="nota">o con tu correo</Texto>
            <View style={styles.linea} />
          </View>
          {creando && <TextInput style={styles.input} placeholder="Tu nombre" placeholderTextColor={color.texto2} autoCapitalize="words" maxLength={40} value={nombre} onChangeText={setNombre} />}
          <TextInput
            style={styles.input}
            placeholder={creando ? "Correo" : "Correo o nombre de usuario"}
            placeholderTextColor={color.texto2}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <CampoContrasena estilo={styles.input} placeholder={creando ? "Contraseña (mínimo 6 caracteres)" : "Contraseña"} valor={password} onCambio={setPassword} onEnviar={creando ? crear : entrar} />
          {error && <Texto c={color.error}>{error}</Texto>}
          <Boton3D titulo={creando ? "Crear mi cuenta" : "Entrar"} brillo cargando={enviando} deshabilitado={!email || password.length < (creando ? 6 : 1)} onPress={creando ? crear : entrar} />
          <Pressable
            onPress={() => {
              setError(null);
              setModo(creando ? "entrar" : "crear");
            }}
            style={{ alignSelf: "center", padding: 6 }}
          >
            <Texto v="nota" centro>
              {creando ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
              <Texto v="nota" c={color.primarioClaro}>
                {creando ? "Entra" : "Créala"}
              </Texto>
            </Texto>
          </Pressable>
          {creando && (
            <Pressable onPress={onCambiarMundos} style={{ alignSelf: "center", padding: 4 }}>
              <Texto v="nota" tam={12}>
                Cambiar mis 2 mundos
              </Texto>
            </Pressable>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bg },
  centro: { flex: 1, justifyContent: "space-between", padding: 24, paddingTop: 60 },
  contenido: { flexGrow: 1, justifyContent: "center", padding: 22, gap: 18 },
  circuloResultado: { width: 150, height: 150, borderRadius: 75, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.35)" },
  grillaPro: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  beneficio: { width: "47%", alignItems: "center", gap: 6, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface1 },
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 9, justifyContent: "center" },
  mundo: { borderWidth: 1.5, borderRadius: radio.tarjeta, padding: 10, alignItems: "center", gap: 3 },
  chipMundo: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  ventajas: { gap: 8, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: color.border, backgroundColor: conAlfa(color.primario, 0.08) },
  separador: { flexDirection: "row", alignItems: "center", gap: 10 },
  linea: { flex: 1, height: 1, backgroundColor: color.border },
  input: {
    backgroundColor: color.surface1,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radio.boton,
    color: color.texto,
    fontFamily: fuente.cuerpo,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
