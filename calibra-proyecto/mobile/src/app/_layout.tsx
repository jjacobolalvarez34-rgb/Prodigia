import * as Notifications from "expo-notifications";
import { DarkTheme, Stack, ThemeProvider, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { rutaDeAviso, sincronizarAvisos } from "~/lib/notificaciones";
import { cargarResumen } from "~/lib/resumen";
import { ProveedorSesion, useSesion } from "~/lib/sesion";
import PantallaCarga from "~/ui/PantallaCarga";
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

function esperar(ms: number) {
  return new Promise<void>((resolver) => setTimeout(resolver, ms));
}

// Un paso lento (red floja) no puede dejar la pantalla de carga trabada.
function conTiempoLimite<T>(promesa: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([promesa.catch(() => null), esperar(ms).then(() => null)]);
}

// Tiempo mínimo en pantalla: lo justo para leer un pro tip sin que se sienta lento.
const CARGA_MINIMA_MS = 2600;

function Navegacion() {
  const { sesion, cargando } = useSesion();
  const userId = sesion?.user.id;
  const [progreso, setProgreso] = useState(0.1);
  const [etapa, setEtapa] = useState("Encendiendo las luces de la ciudad…");
  const [cargaVisible, setCargaVisible] = useState(true);
  const inicioRef = useRef(0);
  const arrancoRef = useRef(false);
  const sincronizadoRef = useRef<string | null>(null);

  // La pantalla de carga animada reemplaza al splash nativo (mismo fondo) apenas monta.
  useEffect(() => {
    inicioRef.current = Date.now();
    SplashScreen.hideAsync();
  }, []);

  // Arranque con progreso real: sesión → racha y Chispas (también alimenta los
  // widgets) → avisos → listo.
  useEffect(() => {
    if (cargando || arrancoRef.current) return;
    arrancoRef.current = true;
    (async () => {
      setProgreso(0.3);
      if (userId) {
        sincronizadoRef.current = userId;
        setEtapa("Trayendo tu racha y tus Chispas…");
        const resumen = await conTiempoLimite(cargarResumen(), 6000);
        setProgreso(0.65);
        setEtapa("Revisando tus avisos…");
        actualizarWidgets(resumen);
        await conTiempoLimite(sincronizarAvisos(), 4000);
      } else {
        setEtapa("Preparando la entrada…");
      }
      setProgreso(0.88);
      setEtapa("Preparando los 13 mundos…");
      await esperar(Math.max(0, CARGA_MINIMA_MS - (Date.now() - inicioRef.current)));
      setProgreso(1);
      setEtapa("¡Listo!");
    })();
  }, [cargando, userId]);

  // Después de iniciar sesión (o si cambia la cuenta): registrar este teléfono para
  // los avisos y refrescar los widgets.
  useEffect(() => {
    if (!userId || sincronizadoRef.current === userId) return;
    sincronizadoRef.current = userId;
    sincronizarAvisos();
    cargarResumen().then(actualizarWidgets);
  }, [userId]);

  const ocultarCarga = useCallback(() => setCargaVisible(false), []);

  return (
    <>
      {!cargando && <AbrirDesdeAviso />}
      {!cargando && <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg }, animation: "slide_from_right" }}>
        <Stack.Protected guard={!!sesion}>
          <Stack.Screen name="index" />
          <Stack.Screen name="elegir-mundos" />
          <Stack.Screen name="avisos" />
          <Stack.Screen name="ajustes-avisos" />
          <Stack.Screen name="numeria/index" />
          <Stack.Screen name="numeria/sprint" options={{ gestureEnabled: false, animation: "fade" }} />
          <Stack.Screen name="geografia/index" />
          <Stack.Screen name="geografia/sprint" options={{ gestureEnabled: false, animation: "fade" }} />
          <Stack.Screen name="resultado" options={{ gestureEnabled: false, animation: "fade" }} />
        </Stack.Protected>
        <Stack.Protected guard={!sesion}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>}
      {cargaVisible && <PantallaCarga progreso={progreso} etapa={etapa} onTerminada={ocultarCarga} />}
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.bg }}>
      <ThemeProvider value={tema}>
        <ProveedorSesion>
          <StatusBar style="light" />
          <Navegacion />
        </ProveedorSesion>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
