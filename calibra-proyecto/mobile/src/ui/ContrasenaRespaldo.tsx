import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { necesitaContrasenaRespaldo } from "@/lib/auth/respaldo";
import { mensajeError, supabase } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import CampoContrasena from "~/ui/CampoContrasena";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, fuente } from "~/tema";

// Contraseña de respaldo para cuentas creadas con Google (igual que en la web,
// calibra/src/components/ContrasenaRespaldo.tsx): si algo pasa con Google, se entra con
// el correo y esta contraseña. Solo aparece si la cuenta entró con Google y no la creó.
export { necesitaContrasenaRespaldo };

export default function ContrasenaRespaldo({ alGuardar }: { alGuardar?: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function guardar() {
    if (password.length < 6) return mostrarAviso("Tiene que tener al menos 6 caracteres.", "error");
    if (password !== confirmar) return mostrarAviso("Las dos contraseñas no coinciden.", "error");
    setEnviando(true);
    const { error } = await supabase.auth.updateUser({ password, data: { password_respaldo: true } });
    setEnviando(false);
    if (error) return mostrarAviso(mensajeError(error), "error");
    mostrarAviso("Listo: ya puedes entrar también con tu correo y esta contraseña.", "ok");
    alGuardar?.();
  }

  return (
    <Tarjeta acento={color.primario} brillo={0.12}>
      <View style={{ gap: 10 }}>
        <Texto v="h3">Crea una contraseña de respaldo</Texto>
        <Texto v="nota">Entraste con Google. Si algún día Google falla o pierdes esa cuenta, con tu correo y esta contraseña sigues entrando a Prodigia.</Texto>
        <CampoContrasena estilo={styles.input} placeholder="Contraseña nueva (mínimo 6)" valor={password} onCambio={setPassword} />
        <CampoContrasena estilo={styles.input} placeholder="Repítela" valor={confirmar} onCambio={setConfirmar} onEnviar={guardar} />
        <Boton3D titulo="Guardar contraseña" cargando={enviando} onPress={guardar} />
      </View>
    </Tarjeta>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: color.border, backgroundColor: color.surface1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: color.texto, fontFamily: fuente.cuerpo, fontSize: 15 },
});
