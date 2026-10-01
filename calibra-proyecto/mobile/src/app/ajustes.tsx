import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import type { ReactNode } from "react";
import { Alert, Pressable, StyleSheet, Switch, View } from "react-native";
import { cambiarAjuste, useAjustes } from "~/lib/ajustes";
import { vibrar } from "~/lib/efectos";
import { URL_WEB } from "~/lib/entorno";
import { limpiarJugador } from "~/lib/jugador";
import { borrarResumen } from "~/lib/resumen";
import { useSesion } from "~/lib/sesion";
import { desconectarPresencia } from "~/lib/social";
import { mensajeError, supabase } from "~/lib/supabase";
import { actualizarWidgets } from "~/widgets/registro";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import { IconoDerecha } from "~/ui/Iconos";
import { PantallaApilada, TituloSeccion } from "~/ui/Pantalla";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color } from "~/tema";

function Fila({ titulo, nota, derecha, onPress }: { titulo: string; nota?: string; derecha?: ReactNode; onPress?: () => void }) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={() => {
        vibrar.seleccion();
        onPress?.();
      }}
      style={({ pressed }) => [styles.fila, pressed && onPress ? { backgroundColor: color.surface2 } : null]}
    >
      <View style={{ flex: 1 }}>
        <Texto v="fuerte">{titulo}</Texto>
        {nota ? (
          <Texto v="nota" tam={12}>
            {nota}
          </Texto>
        ) : null}
      </View>
      {derecha ?? (onPress ? <IconoDerecha tam={16} c={color.texto2} /> : null)}
    </Pressable>
  );
}

export default function Ajustes() {
  const router = useRouter();
  const { sesion } = useSesion();
  const ajustes = useAjustes();
  async function salir() {
    Alert.alert("¿Cerrar sesión?", "Tu progreso queda guardado en tu cuenta.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          await borrarResumen();
          await actualizarWidgets(null);
          desconectarPresencia();
          limpiarJugador();
          await supabase.auth.signOut();
        },
      },
    ]);
  }

  return (
    <PantallaApilada titulo="Ajustes">
      <TituloSeccion>Juego</TituloSeccion>
      <Tarjeta relleno={4}>
        <Fila
          titulo="Sonido"
          nota="Aciertos, monedas, combos"
          derecha={<Switch value={ajustes.sonido} onValueChange={(v) => cambiarAjuste("sonido", v)} trackColor={{ true: color.primario, false: color.surface3 }} thumbColor="#fff" />}
        />
        <Fila
          titulo="Vibración"
          nota="Al tocar teclas y botones"
          derecha={<Switch value={ajustes.haptica} onValueChange={(v) => cambiarAjuste("haptica", v)} trackColor={{ true: color.primario, false: color.surface3 }} thumbColor="#fff" />}
        />
      </Tarjeta>

      <TituloSeccion>Avisos</TituloSeccion>
      <Tarjeta relleno={4}>
        <Fila titulo="Notificaciones" nota="Qué avisos recibir y cuándo" onPress={() => router.push("/ajustes-avisos")} />
      </Tarjeta>

      <TituloSeccion>Cuenta</TituloSeccion>
      <Tarjeta relleno={4}>
        <Fila titulo="Correo" nota={sesion?.user.is_anonymous ? "Invitado (sin correo)" : sesion?.user.email ?? ""} />
        <Fila titulo="Cambiar contraseña" nota="Te mandamos un correo para cambiarla" onPress={async () => {
          if (!sesion?.user.email) return;
          const { error } = await supabase.auth.resetPasswordForEmail(sesion.user.email);
          if (error) mostrarAviso(mensajeError(error), "error");
          else mostrarAviso("Te mandamos un correo para cambiar tu contraseña", "ok");
        }} />
        <Fila titulo="Privacidad" onPress={() => WebBrowser.openBrowserAsync(`${URL_WEB}/privacidad`)} />
        <Fila titulo="Términos" onPress={() => WebBrowser.openBrowserAsync(`${URL_WEB}/terminos`)} />
        <Fila titulo="Eliminar mi cuenta" nota="Se hace desde la web, con tu sesión" onPress={() => WebBrowser.openBrowserAsync(`${URL_WEB}/ajustes`)} />
      </Tarjeta>

      <Boton3D titulo="Cerrar sesión" variante="peligro" onPress={salir} estilo={{ marginTop: 8 }} />
      <Texto v="nota" tam={11} centro>
        Prodigia {Constants.expoConfig?.version ?? ""} · Tu progreso es el mismo en la app y en la web.
      </Texto>
    </PantallaApilada>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 14 },
});
