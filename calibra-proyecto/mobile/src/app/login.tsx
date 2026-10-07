import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { bienvenidaVista, crearCuenta, entrarConGoogle, guardarCiudadDemo, marcarBienvenidaVista } from "~/lib/bienvenida";
import { URL_WEB } from "~/lib/entorno";
import { mensajeError, supabase } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import Glifos from "~/ui/Glifos";
import Logo from "~/ui/Logo";
import CampoContrasena from "~/ui/CampoContrasena";
import { ElegirCiudad, Escenas, Mecanismo, Saludo } from "~/ui/bienvenida/Presentacion";
import { color, fuente, MUNDOS, radio, type MundoSlug } from "~/tema";

// Sin sesión, igual que la landing de la web (VisitanteLanding.tsx): «¿Ya conoces
// Prodigia?» → presentación animada → elegir una ciudad → cómo funciona → partida de
// prueba como invitado (la cuenta se crea después, en /bienvenida). Quien ya pasó
// por acá en este teléfono va directo a entrar.
type Paso = "cargando" | "saludo" | "escenas" | "ciudad" | "mecanismo" | "cuenta";
type Modo = "crear" | "entrar";

export default function Login() {
  const [paso, setPaso] = useState<Paso>("cargando");
  const [modo, setModo] = useState<Modo>("entrar");
  const [ciudad, setCiudad] = useState<MundoSlug | null>(null);
  const [entrando, setEntrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bienvenidaVista().then((vista) => setPaso(vista ? "cuenta" : "saludo"));
  }, []);

  function irACuenta() {
    marcarBienvenidaVista();
    setModo("entrar");
    setPaso("cuenta");
  }

  async function empezarDemo() {
    if (!ciudad) return;
    setEntrando(true);
    setError(null);
    await guardarCiudadDemo(ciudad);
    const { error: e } = await supabase.auth.signInAnonymously();
    if (e) {
      setEntrando(false);
      setError("No pudimos armar la partida de prueba. Revisa tu conexión y prueba de nuevo.");
      return;
    }
    marcarBienvenidaVista();
    // Con la sesión de invitado, el layout pasa solo a /bienvenida → partida de prueba.
  }

  if (paso === "cargando") return <View style={styles.pantalla} />;

  return (
    <SafeAreaView style={styles.pantalla}>
      <Glifos glifos={MUNDOS.map((m) => m.glifo)} acento={color.primarioNeon} cantidad={13} opacidad={0.07} />
      {paso === "saludo" && <Saludo onNuevo={() => setPaso("escenas")} onTengoCuenta={irACuenta} />}
      {paso === "escenas" && <Escenas onTerminar={() => setPaso("ciudad")} onSaltar={() => setPaso("ciudad")} />}
      {paso === "ciudad" && (
        <ScrollView contentContainerStyle={styles.contenido}>
          <ElegirCiudad
            onElegir={(slug) => {
              setCiudad(slug);
              setPaso("mecanismo");
            }}
          />
          <Pressable onPress={irACuenta} style={{ alignSelf: "center", padding: 8 }}>
            <Text style={styles.nota}>
              ¿Ya tienes cuenta? <Text style={styles.enlace}>Entra</Text>
            </Text>
          </Pressable>
        </ScrollView>
      )}
      {paso === "mecanismo" && ciudad && (
        <ScrollView contentContainerStyle={styles.contenido}>
          <Mecanismo slug={ciudad} entrando={entrando} error={error} onEmpezar={empezarDemo} onCambiar={() => setPaso("ciudad")} />
        </ScrollView>
      )}
      {paso === "cuenta" && <FormularioCuenta modo={modo} setModo={setModo} onConocer={() => setPaso("saludo")} />}
    </SafeAreaView>
  );
}

function FormularioCuenta({ modo, setModo, onConocer }: { modo: Modo; setModo: (m: Modo) => void; onConocer: () => void }) {
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
          <CampoContrasena estilo={styles.input} placeholder={creando ? "Contraseña (mínimo 6 caracteres)" : "Contraseña"} valor={password} onCambio={setPassword} onEnviar={creando ? crear : entrar} />
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
          <Pressable onPress={onConocer} style={{ alignSelf: "center", padding: 4 }}>
            <Text style={styles.nota}>
              ¿Eres nuevo? <Text style={styles.enlace}>Conoce Prodigia y juega una partida de prueba</Text>
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
  tituloDiapositiva: { fontFamily: fuente.display, fontSize: 30, color: color.texto, textAlign: "center", letterSpacing: -0.5 },
  textoDiapositiva: { fontFamily: fuente.cuerpo, fontSize: 16, color: color.texto2, textAlign: "center", lineHeight: 23 },
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
