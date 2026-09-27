import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mensajeError, supabase } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import { color, radio } from "~/tema";

// Mismo login que la web (LoginForm.tsx): correo O nombre de usuario + contraseña,
// o entrar como invitado. La cuenta es la misma en la web y en la app.
export default function Login() {
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [entrandoInvitado, setEntrandoInvitado] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(e.message === "Invalid login credentials" ? "Usuario o contraseña incorrectos." : mensajeError(e));
      setEnviando(false);
    }
    // Con sesión, el layout cambia solo a la pantalla de inicio.
  }

  async function entrarInvitado() {
    setEntrandoInvitado(true);
    setError(null);
    const { error: e } = await supabase.auth.signInAnonymously();
    if (e) {
      setError(mensajeError(e));
      setEntrandoInvitado(false);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <View style={styles.marca}>
            <Text style={styles.chispa}>✦</Text>
            <Text style={styles.titulo}>Prodigia</Text>
            <Text style={styles.subtitulo}>Tu cabeza, en modo juego.</Text>
          </View>

          <View style={styles.formulario}>
            <TextInput
              style={styles.input}
              placeholder="Correo o nombre de usuario"
              placeholderTextColor={color.texto2}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={identificador}
              onChangeText={setIdentificador}
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={color.texto2}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={entrar}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Boton3D titulo="Entrar" onPress={entrar} cargando={enviando} deshabilitado={!identificador || !password} />
            <View style={styles.separador}>
              <View style={styles.linea} />
              <Text style={styles.o}>o</Text>
              <View style={styles.linea} />
            </View>
            <Boton3D titulo="Entrar como invitado" variante="contorno" onPress={entrarInvitado} cargando={entrandoInvitado} />
            <Text style={styles.nota}>¿Todavía no tienes cuenta? Créala en la web de Prodigia y entra acá con los mismos datos.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.bg },
  contenido: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 40 },
  marca: { alignItems: "center", gap: 6 },
  chispa: { fontSize: 48, color: color.logro },
  titulo: { fontSize: 38, fontWeight: "800", color: color.texto, letterSpacing: -0.5 },
  subtitulo: { fontSize: 15, color: color.texto2 },
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
  error: { color: color.error, fontSize: 14 },
  separador: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 4 },
  linea: { flex: 1, height: 1, backgroundColor: color.border },
  o: { color: color.texto2 },
  nota: { color: color.texto2, fontSize: 13, textAlign: "center", marginTop: 8, lineHeight: 18 },
});
