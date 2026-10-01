import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { cargarNivelesGeografia, CONTINENTES, type Continente } from "~/lib/geografia";
import { useSesion } from "~/lib/sesion";
import HubMundo, { TarjetaTema } from "~/ui/HubMundo";
import Texto from "~/ui/Texto";
import { MUNDO_POR_SLUG } from "~/tema";

const GEOGRAFIA = MUNDO_POR_SLUG.geografia;

// Hub de Geografía: un continente = un sprint de 10 países en el mapa real.
export default function HubGeografia() {
  const router = useRouter();
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const [niveles, setNiveles] = useState<Record<Continente, number> | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (userId) cargarNivelesGeografia(userId).then(setNiveles);
    }, [userId])
  );

  return (
    <HubMundo mundo={GEOGRAFIA} descripcion="Elige un continente: 10 países en 60 segundos, en el mapa real. Cada continente tiene su propio nivel.">
      {[0, 2].map((fila) => (
        <View key={fila} style={{ flexDirection: "row", gap: 10 }}>
          {CONTINENTES.slice(fila, fila + 2).map((c, i) => (
            <TarjetaTema
              key={c.id}
              indice={fila + i}
              mundo={GEOGRAFIA}
              tema={{ id: c.id, nombre: c.nombre, simbolo: c.glifo, nivel: niveles?.[c.id] ?? null, nota: "Toca para jugar" }}
              onPress={() => router.push({ pathname: "/geografia/sprint", params: { continente: c.id } })}
            />
          ))}
        </View>
      ))}
      <Texto v="nota" tam={12}>
        En el mapa: pellizca para acercar y arrastra para moverte. Así los países chicos se tocan fácil.
      </Texto>
    </HubMundo>
  );
}
