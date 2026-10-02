import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { faltaDiagnostico } from "~/lib/diagnostico";
import { vibrar } from "~/lib/efectos";
import { cargarNivelesMundo, mundoJugable } from "~/lib/mundosJugables";
import { useSesion } from "~/lib/sesion";
import HubMundo, { TarjetaTema } from "~/ui/HubMundo";
import { Vacio } from "~/ui/Pantalla";
import Texto from "~/ui/Texto";
import { color, conAlfa, fuente, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";

// Hub de cualquier ciudad del registro (Historia, Quimia, Anatomía…): sus modos con
// el nivel de cada uno; tocar un modo arranca el sprint.
export default function HubCiudad() {
  const router = useRouter();
  const { mundo: slug } = useLocalSearchParams<{ mundo: string }>();
  const def = mundoJugable(slug);
  const mundo = MUNDO_POR_SLUG[slug as MundoSlug];
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const [niveles, setNiveles] = useState<Record<string, number> | null>(null);
  const [filtro, setFiltro] = useState(def?.filtro?.opciones[0]?.id ?? "");

  useFocusEffect(
    useCallback(() => {
      if (!userId || !def) return;
      cargarNivelesMundo(def, userId).then(setNiveles);
      faltaDiagnostico(def.slug, userId).then((falta) => falta && router.replace({ pathname: "/diagnostico/[mundo]", params: { mundo: def.slug } }));
    }, [userId, def, router])
  );

  if (!def || !mundo) {
    return <Vacio titulo="Esta ciudad todavía no está en la app" />;
  }

  return (
    <HubMundo mundo={mundo} descripcion={`${mundo.tema}. Elige un modo: ${def.total ?? 10} preguntas en ${Math.round((def.duracionMs ?? 60000) / 1000)} segundos, y cada modo sube de nivel por separado.`}>
      {def.filtro && (
        <View style={{ gap: 8 }}>
          <Texto v="micro">{def.filtro.titulo}</Texto>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {def.filtro.opciones.map((o) => {
              const activo = filtro === o.id;
              return (
                <Pressable
                  key={o.id}
                  onPress={() => {
                    vibrar.seleccion();
                    setFiltro(o.id);
                  }}
                  style={[styles.chip, activo && { borderColor: mundo.neon, backgroundColor: conAlfa(mundo.neon, 0.15) }]}
                >
                  <Texto style={{ fontFamily: fuente.cuerpoFuerte, fontSize: 13, color: activo ? color.texto : color.texto2 }}>{o.nombre}</Texto>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
      {Array.from({ length: Math.ceil(def.modos.length / 2) }, (_, fila) => (
        <View key={fila} style={{ flexDirection: "row", gap: 10 }}>
          {def.modos.slice(fila * 2, fila * 2 + 2).map((m, i) => (
            <TarjetaTema
              key={m.id}
              indice={fila * 2 + i}
              mundo={mundo}
              tema={{ id: m.id, nombre: m.nombre, simbolo: m.simbolo, nivel: niveles?.[m.id] ?? null, nota: m.descripcion }}
              onPress={() => router.push({ pathname: "/[mundo]/sprint", params: { mundo: def.slug, modo: m.id, filtro } })}
            />
          ))}
          {def.modos.slice(fila * 2, fila * 2 + 2).length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
      <Texto v="nota" tam={12}>
        Toca un modo para jugar.
      </Texto>
    </HubMundo>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface2 },
});
