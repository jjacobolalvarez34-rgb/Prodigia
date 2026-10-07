import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInRight, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { bienvenidaVista, crearCuenta, entrarConGoogle, marcarBienvenidaVista } from "~/lib/bienvenida";
import { sonar, vibrar } from "~/lib/efectos";
import { URL_WEB } from "~/lib/entorno";
import { mensajeError, supabase } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import Ciudad from "~/ui/Ciudad";
import Glifos from "~/ui/Glifos";
import Logo from "~/ui/Logo";
import { color, conAlfa, fuente, MUNDOS, radio } from "~/tema";

// Primera vez en la app (docs/PLAN_PRIMERA_VEZ_APP.md, aprobado el 2026-10-07):
// 3 pantallas de bienvenida → una pregunta de prueba → cuenta. Ya no hay modo
// invitado: la cuenta es la misma en la web y en la app, y se puede crear acá
// (correo o Google). Quien ya vio la bienvenida en este teléfono va directo a entrar.
type Paso = "cargando" | "bienvenida" | "prueba" | "cuenta";
type Modo = "crear" | "entrar";

const DIAPOSITIVAS = [
  { titulo: "Tu cabeza, en modo juego.", texto: "13 ciudades, cada una con su tema: cálculo, lógica, mapas, música, código y más." },
  { titulo: "10 preguntas. 60 segundos.", texto: "Partidas cortas que se adaptan a ti: tres seguidas bien y subes de nivel." },
  { titulo: "Reta a tus amigos.", texto: "Duelos en vivo, ligas semanales y rangos de Bronce a Prodigio." },
];

const OPCIONES = [54, 56, 63, 48];

export default function Login() {
  const [paso, setPaso] = useState<Paso>("cargando");
  const [diapositiva, setDiapositiva] = useState(0);
  const [respuesta, setRespuesta] = useState<number | null>(null);
  const [modo, setModo] = useState<Modo>("crear");

  useEffect(() => {
    bienvenidaVista().then((vista) => {
      if (vista) setModo("entrar");
      setPaso(vista ? "cuenta" : "bienvenida");
    });
  }, []);

  function siguiente() {
    vibrar.seleccion();
    if (diapositiva < DIAPOSITIVAS.length - 1) setDiapositiva((d) => d + 1);
    else setPaso("prueba");
  }

  function responder(n: number) {
    if (respuesta !== null) return;
    setRespuesta(n);
    if (n === 56) {
      sonar("acierto1");
      vibrar.exito();
    } else sonar("error");
  }

  function irACuenta() {
    marcarBienvenidaVista();
    setPaso("cuenta");
  }

  if (paso === "cargando") return <View style={styles.pantalla} />;

  return (
    <SafeAreaView style={styles.pantalla}>
      <Glifos glifos={MUNDOS.map((m) => m.glifo)} acento={color.primarioNeon} cantidad={13} opacidad={0.07} />
      {paso === "bienvenida" && (
        <View style={styles.centro}>
          <Pressable onPress={irACuenta} style={styles.saltar} hitSlop={12}>
            <Text style={styles.saltarTexto}>Ya tengo cuenta</Text>
          </Pressable>
          <Animated.View key={diapositiva} entering={FadeInRight.duration(350)} style={styles.diapositiva}>
            {diapositiva === 0 && <Ciudad semilla="prodigia-entrada" acento={color.primarioNeon} alto={170} radio={24} estilo={{ alignSelf: "stretch", borderWidth: 1, borderColor: color.border }} />}
            {diapositiva === 1 && (
              <View style={styles.reloj}>
                <Text style={styles.relojNumero}>60</Text>
                <Text style={styles.relojTexto}>SEGUNDOS</Text>
              </View>
            )}
            {diapositiva === 2 && (
              <View style={styles.versus}>
                <View style={[styles.duelista, { backgroundColor: conAlfa(color.logro, 0.2), borderColor: color.logro }]}>
                  <Text style={styles.duelistaLetra}>L</Text>
                </View>
                <Text style={styles.vs}>VS</Text>
                <View style={[styles.duelista, { backgroundColor: conAlfa(color.primario, 0.2), borderColor: color.primario }]}>
                  <Text style={styles.duelistaLetra}>Tú</Text>
                </View>
              </View>
            )}
            <Text style={styles.tituloDiapositiva}>{DIAPOSITIVAS[diapositiva].titulo}</Text>
            <Text style={styles.textoDiapositiva}>{DIAPOSITIVAS[diapositiva].texto}</Text>
          </Animated.View>
          <View style={styles.puntos}>
            {DIAPOSITIVAS.map((_, i) => (
              <View key={i} style={[styles.punto, i === diapositiva && styles.puntoActivo]} />
            ))}
          </View>
          <Boton3D titulo={diapositiva < DIAPOSITIVAS.length - 1 ? "Siguiente" : "Probar una pregunta"} onPress={siguiente} brillo />
        </View>
      )}

      {paso === "prueba" && (
        <View style={styles.centro}>
          <Animated.View entering={FadeInDown.duration(400)} style={{ alignItems: "center", gap: 6 }}>
            <Text style={styles.etiqueta}>NUMERIA · TU PRIMERA PREGUNTA</Text>
            <Text style={[styles.pregunta, respuesta === 56 && { color: color.correcto }]}>{respuesta === null ? "7 × 8" : "56"}</Text>
          </Animated.View>
          <View style={styles.opciones}>
            {OPCIONES.map((n) => {
              const correcta = respuesta !== null && n === 56;
              const fallada = respuesta === n && n !== 56;
              return (
                <Pressable
                  key={n}
                  onPress={() => responder(n)}
                  style={[styles.opcion, correcta && { borderColor: color.correcto, backgroundColor: conAlfa(color.correcto, 0.15) }, fallada && { borderColor: color.error, backgroundColor: conAlfa(color.error, 0.12) }, respuesta !== null && !correcta && !fallada && { opacity: 0.35 }]}
                >
                  <Text style={[styles.opcionTexto, correcta && { color: color.correcto }, fallada && { color: color.error }]}>{n}</Text>
                </Pressable>
              );
            })}
          </View>
          {respuesta !== null && (
            <Animated.View entering={ZoomIn.duration(300)} style={{ gap: 14, alignSelf: "stretch" }}>
              <Text style={styles.textoDiapositiva}>{respuesta === 56 ? "¡Eso! Así se juega: rápido y sin miedo." : "Era 56. Truco: 5, 6, 7, 8 → 56 = 7 × 8."}</Text>
              <Text style={styles.textoDiapositiva}>Crea tu cuenta y recibe el Kit del Pionero: 1.000 Chispas, un marco y un título que solo da la app.</Text>
              <Boton3D titulo="Crear mi cuenta" onPress={irACuenta} brillo />
            </Animated.View>
          )}
        </View>
      )}

      {paso === "cuenta" && <FormularioCuenta modo={modo} setModo={setModo} />}
    </SafeAreaView>
  );
}

function FormularioCuenta({ modo, setModo }: { modo: Modo; setModo: (m: Modo) => void }) {
  const [nombre, setNombre] = useState("");
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [conGoogle, setConGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState<string | null>(null);

  async function entrar() {
    setEnviando(true);
    setError(null);
    let email = identificador.trim();
    if (!email.includes("@")) {
      const { data } = await supabase.rpc("resolver_email_por_usuario", { p_identificador: email });
      if (!data) {
        setError("Usuario o contraseña incorrectos.");
        setEnviando(false);
        return;
      }
      email = data as string;
    }
    const { error: e } = await supabase.auth.signInWithPassword({ email, password });
    if (e) {
      setError(e.message === "Invalid login credentials" ? "Usuario o contraseña incorrectos." : e.message === "Email not confirmed" ? "Falta confirmar tu correo: abre el enlace que te mandamos." : mensajeError(e));
      setEnviando(false);
    }
    // Con sesión, el layout cambia solo a la pantalla de inicio.
  }

  async function crear() {
    if (nombre.trim().length < 2) {
      setError("Escribe tu nombre (al menos 2 letras).");
      return;
    }
    setEnviando(true);
    setError(null);
    const r = await crearCuenta(nombre, identificador, password);
    setEnviando(false);
    if (!r.ok) setError(r.error);
    else if (r.confirmarCorreo) setConfirmar(identificador.trim());
  }

  async function google() {
    setConGoogle(true);
    setError(null);
    const r = await entrarConGoogle();
    setConGoogle(false);
    if (!r.ok && r.error) setError(r.error);
  }

  if (confirmar) {
    return (
      <Animated.View entering={FadeIn} style={styles.centro}>
        <Logo tam={56} />
        <Text style={styles.tituloDiapositiva}>Revisa tu correo</Text>
        <Text style={styles.textoDiapositiva}>Te mandamos un enlace a {confirmar}. Ábrelo para activar tu cuenta y vuelve acá a entrar con tu correo y contraseña.</Text>
        <Boton3D
          titulo="Ya lo confirmé, entrar"
          onPress={() => {
            setConfirmar(null);
            setModo("entrar");
          }}
        />
      </Animated.View>
    );
  }

  const creando = modo === "crear";
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <View style={styles.marca}>
          <Logo tam={56} />
          <Text style={styles.titulo}>{creando ? "Crea tu cuenta" : "Entra a Prodigia"}</Text>
          <Text style={styles.subtitulo}>{creando ? "Tu progreso queda guardado en la app y en la web." : "Con la misma cuenta de la web."}</Text>
        </View>

        <View style={styles.formulario}>
          <Boton3D titulo="Continuar con Google" variante="secundario" onPress={google} cargando={conGoogle} />
          <View style={styles.separador}>
            <View style={styles.linea} />
            <Text style={styles.o}>o con tu correo</Text>
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
            value={identificador}
            onChangeText={setIdentificador}
          />
          <TextInput
            style={styles.input}
            placeholder={creando ? "Contraseña (mínimo 6 caracteres)" : "Contraseña"}
            placeholderTextColor={color.texto2}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={creando ? crear : entrar}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Boton3D titulo={creando ? "Crear cuenta" : "Entrar"} onPress={creando ? crear : entrar} cargando={enviando} brillo deshabilitado={!identificador || password.length < (creando ? 6 : 1)} />
          {!creando && (
            <Pressable onPress={() => WebBrowser.openBrowserAsync(`${URL_WEB}/recuperar`)} style={{ alignSelf: "center", padding: 6 }}>
              <Text style={styles.enlace}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              setError(null);
              setModo(creando ? "entrar" : "crear");
            }}
            style={{ alignSelf: "center", padding: 8 }}
          >
            <Text style={styles.nota}>
              {creando ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
              <Text style={styles.enlace}>{creando ? "Entra" : "Créala gratis"}</Text>
            </Text>
          </Pressable>
          {creando && <Text style={styles.legal}>Al crear la cuenta aceptas los Términos y la Política de privacidad que leíste al abrir la app.</Text>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bg },
  centro: { flex: 1, justifyContent: "center", padding: 24, gap: 24 },
  saltar: { position: "absolute", top: 12, right: 20 },
  saltarTexto: { fontFamily: fuente.cuerpo, color: color.texto2, fontSize: 14 },
  diapositiva: { alignItems: "center", gap: 14 },
  reloj: { width: 170, height: 170, borderRadius: 85, borderWidth: 8, borderColor: color.logro, alignItems: "center", justifyContent: "center" },
  relojNumero: { fontFamily: fuente.display, fontSize: 64, color: color.texto },
  relojTexto: { fontFamily: fuente.mono, fontSize: 11, letterSpacing: 2, color: color.logro },
  versus: { flexDirection: "row", alignItems: "center", gap: 18, height: 170 },
  duelista: { width: 96, height: 96, borderRadius: 48, borderWidth: 4, alignItems: "center", justifyContent: "center" },
  duelistaLetra: { fontFamily: fuente.display, fontSize: 34, color: color.texto },
  vs: { fontFamily: fuente.display, fontSize: 44, color: color.logro, fontStyle: "italic" },
  tituloDiapositiva: { fontFamily: fuente.display, fontSize: 30, color: color.texto, textAlign: "center", letterSpacing: -0.5 },
  textoDiapositiva: { fontFamily: fuente.cuerpo, fontSize: 16, color: color.texto2, textAlign: "center", lineHeight: 23 },
  puntos: { flexDirection: "row", justifyContent: "center", gap: 8 },
  punto: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.border },
  puntoActivo: { width: 24, backgroundColor: color.primario },
  etiqueta: { fontFamily: fuente.mono, fontSize: 12, letterSpacing: 1.5, color: color.primarioClaro },
  pregunta: { fontFamily: fuente.display, fontSize: 72, color: color.texto },
  opciones: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  opcion: { width: "47%", flexGrow: 1, height: 72, borderRadius: radio.boton, borderWidth: 2, borderColor: color.border, backgroundColor: color.surface1, alignItems: "center", justifyContent: "center" },
  opcionTexto: { fontFamily: fuente.mono, fontSize: 30, color: color.texto },
  contenido: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 28 },
  marca: { alignItems: "center", gap: 8 },
  titulo: { fontSize: 32, fontFamily: fuente.display, color: color.texto, letterSpacing: -0.5 },
  subtitulo: { fontFamily: fuente.cuerpo, fontSize: 15, color: color.texto2, textAlign: "center" },
  formulario: { gap: 12 },
  input: {
    backgroundColor: color.surface1,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radio.boton,
    color: color.texto,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  error: { fontFamily: fuente.cuerpo, color: color.error, fontSize: 14 },
  separador: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 4 },
  linea: { flex: 1, height: 1, backgroundColor: color.border },
  o: { fontFamily: fuente.cuerpo, color: color.texto2, fontSize: 13 },
  nota: { fontFamily: fuente.cuerpo, color: color.texto2, fontSize: 14, textAlign: "center" },
  enlace: { fontFamily: fuente.cuerpo, color: color.primarioClaro, fontSize: 14, fontWeight: "600" },
  legal: { fontFamily: fuente.cuerpo, color: color.texto2, fontSize: 12, textAlign: "center", lineHeight: 17 },
});
