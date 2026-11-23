import { useEffect, useState, useSyncExternalStore } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { pasosPara, type IdRecorrido, type PasoRecorrido } from "@/lib/tutorial/recorridos";
import { medirAncla, type Rect } from "~/lib/anclas";
import { leerPrimeraVezActiva, recorridoVisto, suscribirPrimeraVez } from "~/lib/bienvenida";
import { vibrar } from "~/lib/efectos";
import { useTaparFondo } from "~/lib/rendimiento";
import { marcarRecorridoVistoEn, recorridoVistoEn } from "~/lib/tutorial";
import { color, conAlfa } from "~/tema";
import Boton3D from "./Boton3D";
import Texto from "./Texto";

// Tutorial guiado de una sección (docs/PLAN_TUTORIAL_GUIADO.md), con el mismo foco que
// late y la misma tarjeta del recorrido de pestañas. Sale la primera vez que se abre la
// sección (después del recorrido de pestañas y nunca durante la primera vez), se puede
// saltar, y lo visto queda en la cuenta. Reemplaza a los globos de una frase.
type PasoVisible = { paso: PasoRecorrido; rect: Rect | null };

function Foco({ estilo, acento }: { estilo: object; acento: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withRepeat(withSequence(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 800, easing: Easing.inOut(Easing.quad) })), -1));
  }, [t]);
  const pulso = useAnimatedStyle(() => ({ transform: [{ scale: 1 + t.value * 0.04 }], opacity: 0.75 + t.value * 0.25 }));
  return <Animated.View pointerEvents="none" entering={FadeIn.duration(250)} style={[styles.foco, { borderColor: acento, backgroundColor: conAlfa(acento, 0.12), boxShadow: `0px 0px 24px ${acento}` }, estilo, pulso]} />;
}

export default function RecorridoSeccion({ id, acento = color.primarioNeon }: { id: IdRecorrido; acento?: string }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const primeraVez = useSyncExternalStore(suscribirPrimeraVez, leerPrimeraVezActiva);
  const [pasos, setPasos] = useState<PasoVisible[] | null>(null);
  const [i, setI] = useState(0);
  useTaparFondo(!!pasos);

  useEffect(() => {
    if (primeraVez) return;
    let vivo = true;
    const t = setTimeout(async () => {
      // Primero el recorrido de pestañas; después, el de cada sección.
      if (!(await recorridoVisto()) || (await recorridoVistoEn(id))) return;
      const zona = { arriba: insets.top + 8, abajo: height - insets.bottom - 90, ancho: width };
      const lista: PasoVisible[] = [];
      for (const paso of pasosPara(id, "app")) {
        if (!paso.app) lista.push({ paso, rect: null });
        else {
          const rect = await medirAncla(paso.app, zona);
          if (rect) lista.push({ paso, rect });
        }
      }
      if (!vivo) return;
      if (lista.length === 0) {
        marcarRecorridoVistoEn(id);
        return;
      }
      setI(0);
      setPasos(lista);
    }, 900);
    return () => {
      vivo = false;
      clearTimeout(t);
    };
  }, [id, primeraVez, width, height, insets.top, insets.bottom]);

  if (!pasos) return null;
  const { paso, rect } = pasos[Math.min(i, pasos.length - 1)];
  const ultimo = i >= pasos.length - 1;

  function terminar() {
    setPasos(null);
    marcarRecorridoVistoEn(id);
  }
  function siguiente() {
    vibrar.seleccion();
    if (ultimo) terminar();
    else setI(i + 1);
  }

  const tarjeta = (
    <>
      <Texto v="micro" c={acento}>
        {i + 1} DE {pasos.length}
      </Texto>
      <Texto v="h2">{paso.titulo[0]}</Texto>
      <Texto v="cuerpo" c={color.texto2}>
        {paso.texto[0]}
      </Texto>
      <View style={styles.botones}>
        {i > 0 ? (
          <Pressable onPress={() => setI(i - 1)} hitSlop={10}>
            <Texto v="fuerte" c={color.texto2}>
              Atrás
            </Texto>
          </Pressable>
        ) : (
          <View />
        )}
        <Boton3D titulo={ultimo ? "¡Entendido!" : "Siguiente"} tamano="sm" acento={acento} onPress={siguiente} />
      </View>
    </>
  );

  let contenido;
  if (rect) {
    const abajo = rect.y + rect.h + 24;
    const caeAbajo = abajo + 230 < height - insets.bottom;
    contenido = (
      <>
        <Foco key={`f${i}`} acento={acento} estilo={{ left: rect.x - 7, top: rect.y - 7, width: rect.w + 14, height: rect.h + 14, borderRadius: 18 }} />
        <Animated.View key={i} entering={FadeInDown.duration(300)} style={[styles.tarjeta, caeAbajo ? { top: abajo } : { bottom: height - rect.y + 24 }]}>
          {tarjeta}
        </Animated.View>
      </>
    );
  } else {
    contenido = (
      <Animated.View key={i} entering={FadeInDown.duration(300)} style={[styles.tarjeta, { top: height * 0.32 }]}>
        {tarjeta}
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.fondo}>
      <Pressable onPress={terminar} style={[styles.saltar, { top: insets.top + 14 }]} hitSlop={12}>
        <Texto v="nota" c={color.texto2}>
          Saltar
        </Texto>
      </Pressable>
      {contenido}
    </Animated.View>
  );
}

// Qué recorrido corresponde a la pantalla abierta (montado una vez en _layout).
const POR_RUTA: Record<string, IdRecorrido> = {
  "(tabs)/index": "inicio",
  "(tabs)/mundos": "mundos",
  "(tabs)/competir": "competir",
  "(tabs)/social": "social",
  "(tabs)/perfil": "perfil",
  tienda: "tienda",
  recompensas: "recompensas",
  curso: "curso",
  "[mundo]": "ciudad",
  numeria: "ciudad",
  geografia: "ciudad",
};

export function RecorridosPorRuta({ segmentos }: { segmentos: string[] }) {
  const clave = segmentos[0] === "(tabs)" ? `(tabs)/${segmentos[1] ?? "index"}` : segmentos.length === 2 && segmentos[1] === "index" ? segmentos[0] : segmentos.length === 1 ? segmentos[0] : "";
  const id = POR_RUTA[clave];
  if (!id) return null;
  return <RecorridoSeccion key={id} id={id} />;
}

const styles = StyleSheet.create({
  fondo: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: conAlfa(color.bgHondo, 0.8), zIndex: 118, elevation: 118 },
  saltar: { position: "absolute", right: 20 },
  foco: { position: "absolute", borderWidth: 3 },
  tarjeta: { position: "absolute", left: 16, right: 16, gap: 8, padding: 18, borderRadius: 20, backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border },
  botones: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
});
