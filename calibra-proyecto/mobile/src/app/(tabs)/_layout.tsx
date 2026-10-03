import TopTabs from "expo-router/js-top-tabs";
import { useEffect, useState } from "react";
import { cargarEstadoEdad, useEdad } from "~/lib/edad";
import BarraPestanas from "~/ui/BarraPestanas";
import PreguntaEdad from "~/ui/PreguntaEdad";
import { color } from "~/tema";

// Las 5 pestañas de la app (03-PANTALLAS-Y-NAVEGACION.md §1). El contenido NO se
// desliza (chocaba con los carruseles y opciones de cada pestaña): para pasar de
// una a otra se toca o se desliza el dedo sobre la barra de abajo.
// Cada pestaña conserva su estado; las que nunca se abrieron se cargan al llegar.
export default function LayoutPestanas() {
  const edad = useEdad();
  const [cerrada, setCerrada] = useState(false);
  useEffect(() => {
    cargarEstadoEdad();
  }, []);
  return (
    <>
    <TopTabs
      tabBarPosition="bottom"
      tabBar={(props: Parameters<typeof BarraPestanas>[0]) => <BarraPestanas {...props} />}
      screenOptions={{ lazy: true, lazyPreloadDistance: 1, swipeEnabled: false, animationEnabled: true, sceneStyle: { backgroundColor: color.bg } }}
    >
      <TopTabs.Screen name="index" />
      <TopTabs.Screen name="mundos" />
      <TopTabs.Screen name="competir" />
      <TopTabs.Screen name="social" />
      <TopTabs.Screen name="perfil" />
    </TopTabs>
    {/* Una vez por cuenta: la edad para los controles del chat (se puede posponer). */}
    <PreguntaEdad visible={!!edad && !edad.tieneFecha && !cerrada} onCerrar={() => setCerrada(true)} />
    </>
  );
}
