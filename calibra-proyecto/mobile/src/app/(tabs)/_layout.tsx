import { Tabs, useNavigation } from "expo-router";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Dimensions, Easing, InteractionManager } from "react-native";
import { leerPrimeraVezActiva, suscribirPrimeraVez } from "~/lib/bienvenida";
import { cargarEstadoEdad, useEdad } from "~/lib/edad";
import BarraPestanas from "~/ui/BarraPestanas";
import PreguntaEdad from "~/ui/PreguntaEdad";
import { color } from "~/tema";

// Las 5 pestañas de la app (03-PANTALLAS-Y-NAVEGACION.md §1). Al cambiar de pestaña
// (tocando la barra o deslizando el dedo sobre ella) SIEMPRE se hace el mismo
// deslizamiento de página, esté la pestaña al lado o a cuatro de distancia: la que
// sale se va hacia un lado y la que entra llega desde el otro, según el orden de la
// barra. Solo esas dos pantallas se animan (en el hilo nativo); las demás quedan
// quietas y congeladas (no se vuelven a pintar mientras no las ves).
const ANCHO = Dimensions.get("window").width;
const DESLIZAR = { animation: "timing" as const, config: { duration: 300, easing: Easing.out(Easing.cubic) } };

type PropsInterpolador = { current: { progress: { interpolate: (c: { inputRange: number[]; outputRange: number[] }) => never } } };
function deslizar({ current }: PropsInterpolador) {
  return {
    sceneStyle: {
      opacity: current.progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.35, 1, 0.35] }),
      transform: [{ translateX: current.progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [-ANCHO, 0, ANCHO] }) }],
    },
  };
}

// Las pestañas que no se abrieron se van montando de a una, ya con la app en reposo,
// para que la primera vez que entras a cada una el deslizamiento no se trabe.
const POR_PRECARGAR = ["mundos", "competir", "social", "perfil"];

export default function LayoutPestanas() {
  const edad = useEdad();
  const navegacion = useNavigation();
  const [cerrada, setCerrada] = useState(false);
  // Espera a que termine lo de la primera vez (kit, recorrido).
  const primeraVez = useSyncExternalStore(suscribirPrimeraVez, leerPrimeraVezActiva);
  useEffect(() => {
    cargarEstadoEdad();
  }, []);
  useEffect(() => {
    const nav = navegacion as unknown as { preload?: (nombre: string) => void };
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const siguiente = () => {
      if (i >= POR_PRECARGAR.length) return;
      InteractionManager.runAfterInteractions(() => {
        try {
          nav.preload?.(POR_PRECARGAR[i]);
        } catch {
          // Si no se puede precargar, se monta al entrar.
        }
        i++;
        t = setTimeout(siguiente, 900);
      });
    };
    t = setTimeout(siguiente, 3000);
    return () => clearTimeout(t);
  }, [navegacion]);
  return (
    <>
      <Tabs
        tabBar={(props) => <BarraPestanas {...(props as unknown as Parameters<typeof BarraPestanas>[0])} />}
        screenOptions={{
          headerShown: false,
          lazy: true,
          freezeOnBlur: true,
          sceneStyle: { backgroundColor: color.bg },
          transitionSpec: DESLIZAR,
          sceneStyleInterpolator: deslizar as never,
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="mundos" />
        <Tabs.Screen name="competir" />
        <Tabs.Screen name="social" />
        <Tabs.Screen name="perfil" />
      </Tabs>
      {/* Una vez por cuenta: la edad para los controles del chat (se puede posponer). */}
      <PreguntaEdad visible={!!edad && !edad.tieneFecha && !cerrada && !primeraVez} onCerrar={() => setCerrada(true)} />
    </>
  );
}

export { default as ErrorBoundary } from "~/ui/PantallaError";
