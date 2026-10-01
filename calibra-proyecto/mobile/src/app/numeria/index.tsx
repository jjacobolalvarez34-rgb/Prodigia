import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { cargarNiveles, OPERACIONES, operacionDisponible, type Operacion } from "~/lib/numeria";
import { useJugador } from "~/lib/jugador";
import { useSesion } from "~/lib/sesion";
import Boton3D from "~/ui/Boton3D";
import HubMundo, { TarjetaTema } from "~/ui/HubMundo";
import { IconoRayo } from "~/ui/Iconos";
import { NUMERIA } from "~/tema";

// Hub de Numeria: eliges una o varias operaciones (o la práctica rápida, que las
// mezcla todas) y arranca el sprint de 10 problemas en 60 segundos.
export default function HubNumeria() {
  const router = useRouter();
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const { esInvitado } = useJugador();
  const [niveles, setNiveles] = useState<Record<Operacion, number> | null>(null);
  const [elegidas, setElegidas] = useState<Operacion[]>(["suma"]);

  useFocusEffect(
    useCallback(() => {
      if (userId) cargarNiveles(userId).then(setNiveles);
    }, [userId])
  );

  function alternar(tipo: Operacion) {
    setElegidas((prev) => (prev.includes(tipo) ? (prev.length > 1 ? prev.filter((t) => t !== tipo) : prev) : [...prev, tipo]));
  }

  const disponibles = OPERACIONES.filter((o) => operacionDisponible(o.tipo, esInvitado)).map((o) => o.tipo);

  return (
    <HubMundo
      mundo={NUMERIA}
      descripcion="Toca uno o varios temas. 10 problemas en 60 segundos: la dificultad se ajusta sola."
      pie={
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Boton3D
            titulo="Rápida"
            variante="secundario"
            icono={<IconoRayo tam={16} c="#FFB627" />}
            estilo={{ flex: 1 }}
            deshabilitado={!niveles}
            onPress={() => router.push({ pathname: "/numeria/sprint", params: { ops: disponibles.join(",") } })}
          />
          <Boton3D
            titulo="Jugar"
            acento={NUMERIA.base}
            brillo
            estilo={{ flex: 1.6 }}
            deshabilitado={!niveles}
            onPress={() => router.push({ pathname: "/numeria/sprint", params: { ops: elegidas.join(",") } })}
          />
        </View>
      }
    >
      {[0, 2].map((fila) => (
        <View key={fila} style={{ flexDirection: "row", gap: 10 }}>
          {OPERACIONES.slice(fila, fila + 2).map((op, i) => {
            const disponible = operacionDisponible(op.tipo, esInvitado);
            return (
              <TarjetaTema
                key={op.tipo}
                indice={fila + i}
                mundo={NUMERIA}
                activo={elegidas.includes(op.tipo)}
                tema={{ id: op.tipo, nombre: op.nombre, simbolo: op.simbolo, nivel: niveles?.[op.tipo] ?? null, bloqueado: !disponible, nota: disponible ? undefined : "Crea una cuenta" }}
                onPress={() => alternar(op.tipo)}
              />
            );
          })}
        </View>
      ))}
    </HubMundo>
  );
}
