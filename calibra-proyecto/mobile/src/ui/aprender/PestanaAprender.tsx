import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { cargarCamino, type CaminoMundo, type NodoLeccion } from "~/lib/aprender";
import { useJugador } from "~/lib/jugador";
import { useSesion } from "~/lib/sesion";
import { color, conAlfa, type Mundo } from "~/tema";
import { mostrarAviso } from "../Aviso";
import Barra from "../Barra";
import Boton3D from "../Boton3D";
import Segmentos from "../Segmentos";
import Tarjeta from "../Tarjeta";
import Texto from "../Texto";
import Camino from "./Camino";

// Pestaña "Aprender" del hub de un mundo: Técnicas (gratis) | Clases (Pro, la
// primera de regalo), con el progreso y la ruta de lecciones. Mismo contenido y
// mismas reglas de desbloqueo que /<mundo>/aprender en la web.
export default function PestanaAprender({ mundo }: { mundo: Mundo }) {
  const router = useRouter();
  const { sesion } = useSesion();
  const { plan } = useJugador();
  const userId = sesion?.user.id;
  const esPro = plan === "pro";
  const [camino, setCamino] = useState<CaminoMundo | null | undefined>(undefined);
  const [pestana, setPestana] = useState<"tecnicas" | "clases">("tecnicas");

  useFocusEffect(
    useCallback(() => {
      if (userId) cargarCamino(mundo.slug, userId, esPro).then(setCamino);
    }, [userId, mundo.slug, esPro])
  );

  function abrir(n: NodoLeccion) {
    if (n.bloqueadoPorPlan) {
      router.push("/pro");
      return;
    }
    if (n.estado === "bloqueado") {
      mostrarAviso("Completa la lección anterior de este tema para abrir esta.", "info");
      return;
    }
    router.push({ pathname: "/aprender/[mundo]/[slug]", params: { mundo: mundo.slug, slug: n.slug } });
  }

  if (camino === undefined) {
    return (
      <View style={{ paddingVertical: 40, alignItems: "center" }}>
        <ActivityIndicator color={mundo.neon} />
      </View>
    );
  }
  if (camino === null) {
    return (
      <Tarjeta acento={mundo.neon}>
        <Texto v="h3">Sin lecciones por ahora</Texto>
        <Texto v="nota">Conéctate una vez para descargar las lecciones de {mundo.nombre}; después funcionan sin internet.</Texto>
      </Tarjeta>
    );
  }

  const grupos = pestana === "clases" && camino.clases ? camino.clases : camino.tecnicas;
  const total = camino.nodos.length;
  return (
    <Animated.View entering={FadeIn.duration(250)} style={{ gap: 12 }}>
      <View style={styles.progreso}>
        <View style={{ flex: 1, gap: 6 }}>
          <Texto v="micro">Tu progreso</Texto>
          <Barra valor={total ? camino.dominadas / total : 0} acento={mundo.base} alto={8} />
        </View>
        <Texto v="mono" tam={14} c={mundo.neon}>
          {camino.dominadas}/{total}
        </Texto>
      </View>
      {camino.clases && (
        <Segmentos<"tecnicas" | "clases">
          opciones={[
            { id: "tecnicas", titulo: "Técnicas" },
            { id: "clases", titulo: esPro ? "Clases" : "Clases · Pro" },
          ]}
          valor={pestana}
          onCambio={setPestana}
        />
      )}
      {pestana === "clases" && !esPro && (
        <View style={[styles.pro, { borderColor: conAlfa(color.logro, 0.5) }]}>
          <Texto v="fuerte">Clases paso a paso, con ejemplos resueltos y quiz</Texto>
          <Texto v="nota">La primera es gratis. Todas las demás vienen con Prodigia Pro.</Texto>
          <Boton3D titulo="Ver Prodigia Pro" variante="pro" tamano="sm" onPress={() => router.push("/pro")} />
        </View>
      )}
      <Camino key={pestana} grupos={grupos} mundo={mundo} onElegir={abrir} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  progreso: { flexDirection: "row", alignItems: "center", gap: 12 },
  pro: { gap: 6, padding: 14, borderRadius: 18, borderWidth: 1, backgroundColor: conAlfa(color.logro, 0.08) },
});
