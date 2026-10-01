import TopTabs from "expo-router/js-top-tabs";
import BarraPestanas from "~/ui/BarraPestanas";
import { color } from "~/tema";

// Las 5 pestañas de la app (03-PANTALLAS-Y-NAVEGACION.md §1). Se puede deslizar el
// dedo entre una y otra (paginador nativo), y la barra de abajo sigue el gesto.
// Cada pestaña conserva su estado; las que nunca se abrieron se cargan al llegar.
export default function LayoutPestanas() {
  return (
    <TopTabs
      tabBarPosition="bottom"
      tabBar={(props: Parameters<typeof BarraPestanas>[0]) => <BarraPestanas {...props} />}
      screenOptions={{ lazy: true, lazyPreloadDistance: 1, swipeEnabled: true, animationEnabled: true, sceneStyle: { backgroundColor: color.bg } }}
    >
      <TopTabs.Screen name="index" />
      <TopTabs.Screen name="mundos" />
      <TopTabs.Screen name="competir" />
      <TopTabs.Screen name="social" />
      <TopTabs.Screen name="perfil" />
    </TopTabs>
  );
}
