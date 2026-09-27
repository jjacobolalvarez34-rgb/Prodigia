import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ProveedorSesion, useSesion } from "~/lib/sesion";
import { color } from "~/tema";

SplashScreen.preventAutoHideAsync();

const tema = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: color.bg, card: color.bg, text: color.texto, border: color.border, primary: color.primario },
};

function Navegacion() {
  const { sesion, cargando } = useSesion();

  useEffect(() => {
    if (!cargando) SplashScreen.hideAsync();
  }, [cargando]);

  if (cargando) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg }, animation: "slide_from_right" }}>
      <Stack.Protected guard={!!sesion}>
        <Stack.Screen name="index" />
        <Stack.Screen name="elegir-mundos" />
        <Stack.Screen name="numeria/index" />
        <Stack.Screen name="numeria/sprint" options={{ gestureEnabled: false, animation: "fade" }} />
        <Stack.Screen name="numeria/resultado" options={{ gestureEnabled: false, animation: "fade" }} />
      </Stack.Protected>
      <Stack.Protected guard={!sesion}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
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
