import { useEffect, useState, useSyncExternalStore } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GLOBOS, marcarVista, yaVista, type IdGlobo } from "~/lib/ayudas";
import { leerPrimeraVezActiva, suscribirPrimeraVez } from "~/lib/bienvenida";
import { vibrar } from "~/lib/efectos";
import { color, conAlfa } from "~/tema";
import Texto from "./Texto";

// Globo de 1 o 2 líneas que aparece UNA vez la primera vez que entras a una
// sección (PLAN_PRIMERA_VEZ_APP.md, paso 12). Espera a que termine lo de la
// primera vez (kit, recorrido) y se cierra con un toque. GlobosPorRuta elige cuál.
export default function GloboAyuda({ id, sobrePestanas = true }: { id: IdGlobo; sobrePestanas?: boolean }) {
  const primeraVez = useSyncExternalStore(suscribirPrimeraVez, leerPrimeraVezActiva);
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (primeraVez) return;
    let vivo = true;
    const t = setTimeout(async () => {
      if (vivo && !(await yaVista(`globo:${id}`))) setVisible(true);
    }, 700);
    return () => {
      vivo = false;
      clearTimeout(t);
    };
  }, [primeraVez, id]);

  if (!visible) return null;
  const g = GLOBOS[id];

  function cerrar() {
    vibrar.seleccion();
    marcarVista(`globo:${id}`);
    setVisible(false);
  }

  return (
    <Animated.View entering={FadeInDown.duration(320)} exiting={FadeOut.duration(200)} style={[styles.globo, { bottom: insets.bottom + (sobrePestanas ? 86 : 20) }]}>
      <Pressable onPress={cerrar} style={styles.dentro}>
        <View style={{ flex: 1, gap: 2 }}>
          <Texto v="fuerte" c={color.primarioClaro}>
            💡 {g.titulo}
          </Texto>
          <Texto v="cuerpo" tam={13.5}>
            {g.texto}
          </Texto>
        </View>
        <Texto v="fuerte" tam={13} c={color.primarioClaro}>
          Entendido
        </Texto>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  globo: { position: "absolute", left: 14, right: 14, zIndex: 60, elevation: 60 },
  dentro: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, backgroundColor: color.surface2, borderWidth: 1, borderColor: conAlfa(color.primario, 0.55), boxShadow: `0px 8px 28px ${conAlfa(color.primario, 0.35)}` },
});

// Qué globo corresponde a la pantalla abierta (montado una vez en _layout).
const POR_RUTA: Record<string, IdGlobo> = {
  "(tabs)/mundos": "mundos",
  "(tabs)/competir": "competir",
  "(tabs)/social": "social",
  "(tabs)/perfil": "perfil",
  tienda: "tienda",
  recompensas: "recompensas",
  resultado: "resultado",
  "[mundo]": "mundo",
  numeria: "mundo",
  geografia: "mundo",
};

export function GlobosPorRuta({ segmentos }: { segmentos: string[] }) {
  const clave = segmentos[0] === "(tabs)" ? `(tabs)/${segmentos[1] ?? "index"}` : segmentos.length === 2 && segmentos[1] === "index" ? segmentos[0] : segmentos.length === 1 ? segmentos[0] : "";
  const id = POR_RUTA[clave];
  if (!id) return null;
  return <GloboAyuda key={id} id={id} sobrePestanas={segmentos[0] === "(tabs)"} />;
}
