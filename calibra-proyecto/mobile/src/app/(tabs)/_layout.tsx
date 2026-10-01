import { Tabs } from "expo-router/tabs";
import BarraPestanas from "~/ui/BarraPestanas";
import { color } from "~/tema";

// Las 5 pestañas de la app (03-PANTALLAS-Y-NAVEGACION.md §1). Cada pestaña
// conserva su estado al cambiar de una a otra.
export default function LayoutPestanas() {
  return (
    <Tabs
      tabBar={(props) => <BarraPestanas {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.bg }, animation: "shift" }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="mundos" />
      <Tabs.Screen name="competir" />
      <Tabs.Screen name="social" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
