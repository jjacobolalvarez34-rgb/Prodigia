import * as Notifications from "expo-notifications";
import { DarkTheme, Stack, ThemeProvider, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { rutaDeAviso, sincronizarAvisos } from "~/lib/notificaciones";
import { cargarResumen } from "~/lib/resumen";
import { ProveedorSesion, useSesion } from "~/lib/sesion";
import { actualizarWidgets } from "~/widgets/registro";
import { color } from "~/tema";

SplashScreen.preventAutoHideAsync();

const tema = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: color.bg, card: color.bg, text: color.texto, border: color.border, primary: color.primario },
};

// Al tocar un aviso (con la app abierta, en segundo plano o cerrada) se abre la
// pantalla que corresponde.
function AbrirDesdeAviso() {
  const router = useRouter();
  const { sesion } = useSesion();
  const respuesta = Notifications.useLastNotificationResponse();
  const atendidaRef = useRef<string | null>(null);

  useEffect(() => {
    if (!respuesta || !sesion) return;
    const id = respuesta.notification.request.identifier;
    if (atendidaRef.current === id) return;
    atendidaRef.current = id;
    const ruta = rutaDeAviso(respuesta.notification.request.content.data as Record<string, unknown>);
    if (ruta !== "/") router.push(ruta);
  }, [respuesta, sesion, router]);

  return null;
}

function Navegacion() {
  const { sesion, cargando } = useSesion();
  const userId = sesion?.user.id;

  useEffect(() => {
    if (!cargando) SplashScreen.hideAsync();
  }, [cargando]);

  // Con sesión: registrar este teléfono para los avisos (si ya dio permiso) y
  // refrescar los widgets.
  useEffect(() => {
    if (!userId) return;
    sincronizarAvisos();
    cargarResumen().then(actualizarWidgets);
  }, [userId]);

  if (cargando) return null;

  return (
    <>
      <AbrirDesdeAviso />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg }, animation: "slide_from_right" }}>
        <Stack.Protected guard={!!sesion}>
          <Stack.Screen name="index" />
          <Stack.Screen name="elegir-mundos" />
          <Stack.Screen name="avisos" />
          <Stack.Screen name="ajustes-avisos" />
          <Stack.Screen name="numeria/index" />
          <Stack.Screen name="numeria/sprint" options={{ gestureEnabled: false, animation: "fade" }} />
          <Stack.Screen name="numeria/resultado" options={{ gestureEnabled: false, animation: "fade" }} />
        </Stack.Protected>
        <Stack.Protected guard={!sesion}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={tema}>
      <ProveedorSesion>
        <StatusBar style="light" />
        <Navegacion />
      </ProveedorSesion>
    </ThemeProvider>
  );
}
