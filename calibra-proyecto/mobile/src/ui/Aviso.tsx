import { useEffect, useSyncExternalStore } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeOutUp, SlideInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { color, conAlfa } from "~/tema";
import Texto from "./Texto";

// Aviso emergente global (03-PANTALLAS §4.15): errores de red, compras, recompensas.
type Tipo = "ok" | "error" | "info" | "logro";
interface AvisoActual {
  id: number;
  texto: string;
  tipo: Tipo;
}

let actual: AvisoActual | null = null;
let contador = 0;
const oyentes = new Set<() => void>();

export function mostrarAviso(texto: string, tipo: Tipo = "info") {
  actual = { id: ++contador, texto, tipo };
  oyentes.forEach((o) => o());
}

function suscribir(o: () => void) {
  oyentes.add(o);
  return () => oyentes.delete(o);
}

const COLORES: Record<Tipo, string> = { ok: color.correcto, error: color.error, info: color.primario, logro: color.logro };
const ICONOS: Record<Tipo, string> = { ok: "✓", error: "!", info: "i", logro: "★" };

// `simple`: sin animación de entrada (dentro de un Modal de Android las animaciones
// de Reanimated no corren y el aviso quedaría invisible).
export default function AvisoGlobal({ simple = false }: { simple?: boolean }) {
  const insets = useSafeAreaInsets();
  const aviso = useSyncExternalStore(suscribir, () => actual, () => actual);

  useEffect(() => {
    if (!aviso) return;
    const id = aviso.id;
    const t = setTimeout(() => {
      if (actual?.id === id) {
        actual = null;
        oyentes.forEach((o) => o());
      }
    }, 2800);
    return () => clearTimeout(t);
  }, [aviso]);

  if (!aviso) return null;
  const c = COLORES[aviso.tipo];
  return (
    <View pointerEvents="none" style={[styles.capa, { top: insets.top + 8 }]}>
      <Animated.View
        key={aviso.id}
        entering={simple ? undefined : SlideInUp.duration(300)}
        exiting={simple ? undefined : FadeOutUp.duration(200)}
        style={[styles.aviso, { borderColor: conAlfa(c, 0.6), boxShadow: `0px 8px 30px ${conAlfa(c, 0.25)}` }]}
      >
        <View style={[styles.icono, { backgroundColor: c }]}>
          <Texto v="mono" tam={12} c={aviso.tipo === "logro" ? "#1F1400" : "#fff"}>
            {ICONOS[aviso.tipo]}
          </Texto>
        </View>
        <Texto v="fuerte" tam={14} style={{ flex: 1 }}>
          {aviso.texto}
        </Texto>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  capa: { position: "absolute", left: 14, right: 14, zIndex: 100 },
  aviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(18,23,42,0.98)",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  icono: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
});
