import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { convertirInvitado } from "~/lib/bienvenida";
import { vibrar } from "~/lib/efectos";
import { recargarJugador } from "~/lib/jugador";
import { supabase } from "~/lib/supabase";
import { color, conAlfa, fuente, radio } from "~/tema";
import Boton3D from "./Boton3D";
import CampoContrasena from "./CampoContrasena";
import Logo from "./Logo";
import Texto from "./Texto";

// La app ya no tiene modo invitado (PLAN_PRIMERA_VEZ_APP.md §3). Quien entró como
// invitado antes de este cambio ve esto al abrir la app: su cuenta pasa a ser real
// y conserva todo lo jugado (igual que ConvertirCuenta.tsx de la web).
export default function GuardaTuProgreso() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  async function guardar() {
    if (nombre.trim().length < 2) {
      setError("Escribe tu nombre (al menos 2 letras).");
      return;
    }
    setGuardando(true);
    setError(null);
    const r = await convertirInvitado(nombre, email, password);
    setGuardando(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    vibrar.exito();
    if (r.confirmarCorreo) setConfirmar(true);
    else await supabase.auth.refreshSession().then(recargarJugador);
  }

  async function salir() {
    setSaliendo(true);
    await supabase.auth.signOut();
  }

  if (confirmar) {
    return (
      <SafeAreaView style={styles.pantalla}>
        <View style={styles.centro}>
          <Logo tam={56} />
          <Texto v="h1" centro>
            Revisa tu correo
          </Texto>
          <Texto v="cuerpo" c={color.texto2} centro>
            Te mandamos un enlace a {email.trim()}. Ábrelo para terminar de guardar tu cuenta; después vuelve a la app.
          </Texto>
          <Boton3D titulo="Ya lo confirmé" brillo onPress={() => supabase.auth.refreshSession().then(recargarJugador)} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: "center", gap: 8 }}>
            <Logo tam={56} />
            <Texto v="h1" centro>
              Guarda tu progreso
            </Texto>
            <Texto v="cuerpo" c={color.texto2} centro>
              La app ahora funciona con cuenta. Lo que jugaste como invitado se queda contigo.
            </Texto>
          </View>
          <View style={styles.caja}>
            {["Tu racha, tus Chispas y tus niveles, a salvo", "Duelos en vivo con tus amigos", "La misma cuenta en la web", "Kit del Pionero: 1.000 Chispas, marco y título exclusivos"].map((t) => (
              <View key={t} style={{ flexDirection: "row", gap: 8 }}>
                <Texto c={color.correcto}>✓</Texto>
                <Texto v="cuerpo" tam={14} style={{ flex: 1 }}>
                  {t}
                </Texto>
              </View>
            ))}
          </View>
          <TextInput style={styles.input} placeholder="Tu nombre" placeholderTextColor={color.texto2} autoCapitalize="words" maxLength={40} value={nombre} onChangeText={setNombre} />
          <TextInput style={styles.input} placeholder="Correo" placeholderTextColor={color.texto2} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" value={email} onChangeText={setEmail} />
          <CampoContrasena estilo={styles.input} placeholder="Contraseña (mínimo 6 caracteres)" valor={password} onCambio={setPassword} onEnviar={guardar} />
          {error && <Texto c={color.error}>{error}</Texto>}
          <Boton3D titulo="Guardar mi cuenta" brillo cargando={guardando} deshabilitado={!email || password.length < 6} onPress={guardar} />
          <Pressable onPress={salir} disabled={saliendo} style={{ alignSelf: "center", padding: 8 }}>
            <Texto v="nota" c={color.texto2} centro>
              Salir sin guardar (se pierde lo jugado como invitado)
            </Texto>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color.bg, zIndex: 140, elevation: 140 },
  centro: { flex: 1, justifyContent: "center", padding: 24, gap: 18 },
  contenido: { flexGrow: 1, justifyContent: "center", padding: 22, gap: 12 },
  caja: { gap: 8, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: color.border, backgroundColor: conAlfa(color.primario, 0.08), marginVertical: 6 },
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
