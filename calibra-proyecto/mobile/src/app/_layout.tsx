import { Anton_400Regular } from "@expo-google-fonts/anton/400Regular";
import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue/400Regular";
import { Caveat_700Bold } from "@expo-google-fonts/caveat/700Bold";
import { DancingScript_700Bold } from "@expo-google-fonts/dancing-script/700Bold";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono/500Medium";
import { JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono/700Bold";
import { Orbitron_700Bold } from "@expo-google-fonts/orbitron/700Bold";
import { Pacifico_400Regular } from "@expo-google-fonts/pacifico/400Regular";
import { PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display/700Bold";
import { SpaceGrotesk_600SemiBold } from "@expo-google-fonts/space-grotesk/600SemiBold";
import { SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk/700Bold";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { DarkTheme, Stack, ThemeProvider, useRouter, type Href } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { cargarAjustes } from "~/lib/ajustes";
import { prepararSonidos } from "~/lib/efectos";
import { precargarAprender } from "~/lib/aprender";
import { cargarJugadorGuardado, leerJugador, limpiarJugador, recargarJugador } from "~/lib/jugador";
import { rutaDeAviso, sincronizarAvisos } from "~/lib/notificaciones";
import { ProveedorSesion, useSesion } from "~/lib/sesion";
import { iniciarSincronizacion } from "~/lib/sinConexion";
import { conectarPresencia, desconectarPresencia } from "~/lib/social";
import AvisoGlobal from "~/ui/Aviso";
import AvisoDuelo from "~/ui/AvisoDuelo";
import IntroMarca, { INTRO_ACTIVA } from "~/ui/IntroMarca";
import PantallaCarga from "~/ui/PantallaCarga";
import { color, MUNDOS } from "~/tema";

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
    if (ruta !== "/") router.push(ruta as Href);
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

// Se resuelve cuando termina la intro de Mamut (una vez por arranque de la app).
let finIntro: () => void = () => {};
const introTerminada = INTRO_ACTIVA ? new Promise<void>((resolver) => (finIntro = resolver)) : Promise.resolve();

function Navegacion() {
  const { sesion, cargando } = useSesion();
  const userId = sesion?.user.id;
  const [progreso, setProgreso] = useState(0.1);
  const [etapa, setEtapa] = useState("Encendiendo las luces de la ciudad…");
  const [cargaVisible, setCargaVisible] = useState(true);
  const inicioRef = useRef(0);
  // Intro de Mamut: la pantalla de carga se ve DESPUÉS de la intro, con su tiempo
  // mínimo contado desde ahí (si no, terminaba debajo del video y no se veía).
  const [introVisible, setIntroVisible] = useState(INTRO_ACTIVA);
  // La pantalla de carga se monta recién cuando la intro ya quedó en negro.
  const [introEnNegro, setIntroEnNegro] = useState(!INTRO_ACTIVA);
  const introNegra = useCallback(() => {
    setIntroEnNegro(true);
    inicioRef.current = Date.now();
    finIntro();
  }, []);
  const ocultarIntro = useCallback(() => setIntroVisible(false), []);
  const arrancoRef = useRef(false);
  const sincronizadoRef = useRef<string | null>(null);

  // La pantalla de carga animada reemplaza al splash nativo (mismo fondo) apenas monta.
  useEffect(() => {
    inicioRef.current = Date.now();
    SplashScreen.hideAsync();
  }, []);

  // Arranque con progreso real: ajustes y sonidos → sesión → tu Placa, racha y
  // Chispas (también alimenta los widgets) → avisos → listo.
  useEffect(() => {
    if (cargando || arrancoRef.current) return;
    arrancoRef.current = true;
    (async () => {
      setProgreso(0.22);
      await conTiempoLimite(cargarAjustes(), 1500);
      prepararSonidos();
      setProgreso(0.32);
      if (userId) {
        await cargarJugadorGuardado(userId);
        iniciarSincronizacion();
        sincronizadoRef.current = userId;
        setEtapa("Trayendo tu Placa, tu racha y tus Chispas…");
        await conTiempoLimite(recargarJugador(), 7000);
        conectarPresencia(userId);
        setProgreso(0.68);
        setEtapa("Revisando tus avisos…");
        await conTiempoLimite(sincronizarAvisos(), 4000);
        // Lecciones de los 13 mundos al teléfono (para Aprender sin conexión).
        setTimeout(() => precargarAprender(userId, leerJugador().plan === "pro", MUNDOS.map((m) => m.slug)), 15000);
      } else {
        setEtapa("Preparando la entrada…");
      }
      setProgreso(0.9);
      setEtapa("Preparando los 13 mundos…");
      await introTerminada;
      await esperar(Math.max(0, CARGA_MINIMA_MS - (Date.now() - inicioRef.current)));
      setProgreso(1);
      setEtapa("¡Listo!");
    })();
  }, [cargando, userId]);

  // Después de iniciar sesión (o si cambia la cuenta): registrar este teléfono para
  // los avisos, cargar la Placa y entrar a la presencia en línea.
  useEffect(() => {
    if (!userId) {
      if (sincronizadoRef.current) {
        sincronizadoRef.current = null;
        desconectarPresencia();
        limpiarJugador();
      }
      return;
    }
    if (sincronizadoRef.current === userId) return;
    sincronizadoRef.current = userId;
    sincronizarAvisos();
    recargarJugador();
    conectarPresencia(userId);
  }, [userId]);

  const ocultarCarga = useCallback(() => setCargaVisible(false), []);


  return (
    <>
      {!cargando && <AbrirDesdeAviso />}
      {!cargando && (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg }, animation: "slide_from_right" }}>
          <Stack.Protected guard={!!sesion}>
            <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
            <Stack.Screen name="elegir-mundos" />
            <Stack.Screen name="avisos" />
            <Stack.Screen name="ajustes-avisos" />
            <Stack.Screen name="ajustes" />
            <Stack.Screen name="tienda" options={{ animation: "slide_from_bottom" }} />
            <Stack.Screen name="recompensas" />
            <Stack.Screen name="logros" />
            <Stack.Screen name="editar-placa" options={{ animation: "slide_from_bottom" }} />
            <Stack.Screen name="pro" options={{ animation: "slide_from_bottom" }} />
            <Stack.Screen name="jugador/[id]" />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="amigos/buscar" />
            <Stack.Screen name="clan/chat" />
            <Stack.Screen name="clan/mundo" options={{ animation: "fade" }} />
            <Stack.Screen name="clan/[id]" />
            <Stack.Screen name="clan/crear" options={{ animation: "slide_from_bottom" }} />
            <Stack.Screen name="duelo/buscar" options={{ gestureEnabled: false, animation: "fade" }} />
            <Stack.Screen name="duelo/[id]" options={{ gestureEnabled: false, animation: "fade" }} />
            <Stack.Screen name="duelo/serie/[id]" />
            <Stack.Screen name="reto/[tipo]" options={{ gestureEnabled: false, animation: "fade" }} />
            <Stack.Screen name="numeria/index" />
            <Stack.Screen name="numeria/sprint" options={{ gestureEnabled: false, animation: "fade" }} />
            <Stack.Screen name="geografia/index" />
            <Stack.Screen name="geografia/sprint" options={{ gestureEnabled: false, animation: "fade" }} />
            <Stack.Screen name="resultado" options={{ gestureEnabled: false, animation: "fade" }} />
            <Stack.Screen name="diagnostico/[mundo]" options={{ gestureEnabled: false, animation: "fade" }} />
            <Stack.Screen name="aprender/[mundo]/[slug]" options={{ gestureEnabled: false, animation: "slide_from_right" }} />
            <Stack.Screen name="[mundo]/index" />
            <Stack.Screen name="[mundo]/sprint" options={{ gestureEnabled: false, animation: "fade" }} />
          </Stack.Protected>
          <Stack.Protected guard={!sesion}>
            <Stack.Screen name="login" />
          </Stack.Protected>
        </Stack>
      )}
      {!cargando && userId && !sesion?.user.is_anonymous && <AvisoDuelo userId={userId} />}
      <AvisoGlobal />
      {cargaVisible && introEnNegro && <PantallaCarga progreso={progreso} etapa={etapa} onTerminada={ocultarCarga} />}
      {introVisible && <IntroMarca onNegro={introNegra} onTerminada={ocultarIntro} />}
    </>
  );
}

export default function RootLayout() {
  // Fuentes de la marca + las 8 fuentes de nombre de la tienda (empaquetadas: la
  // Placa de cualquier jugador se ve igual que en la web, sin descargar nada).
  const [fuentesListas, errorFuentes] = useFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
    PlayfairDisplay_700Bold,
    Caveat_700Bold,
    BebasNeue_400Regular,
    Pacifico_400Regular,
    Orbitron_700Bold,
    Anton_400Regular,
    DancingScript_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.bg }}>
      <ThemeProvider value={tema}>
        <ProveedorSesion>
          <StatusBar style="light" />
          {(fuentesListas || errorFuentes) && <Navegacion />}
        </ProveedorSesion>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
