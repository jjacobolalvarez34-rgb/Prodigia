import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VERSION_TERMINOS } from "@/lib/legal/terminos";
import { vibrar } from "~/lib/efectos";
import { URL_WEB } from "~/lib/entorno";
import { supabase } from "~/lib/supabase";
import { color, conAlfa } from "~/tema";
import Boton3D from "./Boton3D";
import Logo from "./Logo";
import Texto from "./Texto";

// Primera pantalla al instalar (pedido del usuario, 2026-10-06, para Google Play):
// antes de entrar hay que leer y aceptar los Términos y la Política de privacidad.
// Se guarda en el teléfono qué versión se aceptó (VERSION_TERMINOS) y, con sesión,
// también en la cuenta (0257, aceptar_terminos). Si la versión cambia, se vuelve a
// pedir.
const CLAVE = "prodigia:terminos-aceptados";

export async function terminosAceptadosEnEsteTelefono(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE)) === VERSION_TERMINOS;
  } catch {
    return false;
  }
}

// Con sesión: deja la aceptación registrada en la cuenta (si la base todavía no
// tiene 0257, falla en silencio y se reintenta en el próximo arranque).
export async function registrarAceptacionEnLaCuenta() {
  if (!(await terminosAceptadosEnEsteTelefono())) return;
  await supabase.rpc("aceptar_terminos", { p_version: VERSION_TERMINOS }).then(
    () => undefined,
    () => undefined
  );
}

const PUNTOS = [
  "Prodigia es un juego para aprender: practicas, compites en duelos y ganas recompensas que solo se usan dentro del juego.",
  "Guardamos tu cuenta, tu progreso y tus partidas para que puedas jugar en la app y en la web. No vendemos tus datos.",
  "El chat tiene reglas: nada de insultos ni datos personales. Los mensajes se pueden denunciar y se guardan como respaldo.",
  "Si eres menor de edad, usa Prodigia con permiso de tu familia. Algunas funciones dependen de tu edad.",
];

export default function AceptarTerminos({ onAceptar }: { onAceptar: () => void }) {
  const [marcado, setMarcado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function aceptar() {
    setGuardando(true);
    try {
      await AsyncStorage.setItem(CLAVE, VERSION_TERMINOS);
    } catch {
      // Si no se puede guardar, se vuelve a pedir la próxima vez.
    }
    await registrarAceptacionEnLaCuenta();
    vibrar.exito();
    onAceptar();
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={{ alignItems: "center", gap: 8 }}>
          <Logo tam={56} />
          <Texto v="h1" centro>
            Antes de empezar
          </Texto>
          <Texto v="nota" centro>
            Lee y acepta los Términos y la Política de privacidad de Prodigia.
          </Texto>
        </View>
        <View style={styles.caja}>
          {PUNTOS.map((p) => (
            <View key={p} style={styles.punto}>
              <Texto c={color.primarioClaro}>•</Texto>
              <Texto v="cuerpo" tam={14} style={{ flex: 1 }}>
                {p}
              </Texto>
            </View>
          ))}
        </View>
        <Pressable onPress={() => WebBrowser.openBrowserAsync(`${URL_WEB}/terminos`)} style={styles.enlace}>
          <Texto v="fuerte" c={color.primarioClaro}>
            Leer los Términos y condiciones completos ↗
          </Texto>
        </Pressable>
        <Pressable onPress={() => WebBrowser.openBrowserAsync(`${URL_WEB}/privacidad`)} style={styles.enlace}>
          <Texto v="fuerte" c={color.primarioClaro}>
            Leer la Política de privacidad completa ↗
          </Texto>
        </Pressable>
        <Pressable
          onPress={() => {
            vibrar.seleccion();
            setMarcado((m) => !m);
          }}
          style={styles.casilla}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: marcado }}
        >
          <View style={[styles.cuadro, marcado && { backgroundColor: color.primario, borderColor: color.primario }]}>{marcado && <Texto tam={14}>✓</Texto>}</View>
          <Texto v="cuerpo" tam={14} style={{ flex: 1 }}>
            Leí y acepto los Términos y condiciones y la Política de privacidad.
          </Texto>
        </Pressable>
        <Boton3D titulo="Aceptar y continuar" brillo deshabilitado={!marcado} cargando={guardando} onPress={aceptar} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color.bg, zIndex: 150, elevation: 150 },
  contenido: { padding: 20, gap: 14, paddingBottom: 40 },
  caja: { gap: 10, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface1 },
  punto: { flexDirection: "row", gap: 8 },
  enlace: { paddingVertical: 6 },
  casilla: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, backgroundColor: conAlfa(color.primario, 0.1) },
  cuadro: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: color.texto2, alignItems: "center", justifyContent: "center" },
});
