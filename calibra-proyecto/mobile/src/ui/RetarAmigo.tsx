import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { retarAmigo } from "~/lib/competir";
import { vibrar } from "~/lib/efectos";
import type { PlacaDatos } from "~/lib/placa";
import { useSesion } from "~/lib/sesion";
import { mensajeError } from "~/lib/supabase";
import { color, conAlfa, fuente, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";
import { mostrarAviso } from "./Aviso";
import Boton3D from "./Boton3D";
import Hoja from "./Hoja";
import AvatarMarco from "./placa/AvatarMarco";
import Texto from "./Texto";

// Retar a un amigo (mismo duelo que /api/amigos/retar de la web): eliges ciudad y
// tema, se crea el duelo y juegas tu lado; tu amigo recibe el aviso y juega contra
// tu registro exacto.
const OPCIONES: Record<"numeria" | "geografia", { id: string; nombre: string }[]> = {
  numeria: [
    { id: "suma", nombre: "Suma" },
    { id: "resta", nombre: "Resta" },
    { id: "multiplicacion", nombre: "Multiplicación" },
    { id: "division", nombre: "División" },
  ],
  geografia: [
    { id: "america", nombre: "América" },
    { id: "europa", nombre: "Europa" },
    { id: "africa", nombre: "África" },
    { id: "asia_oceania", nombre: "Asia y Oceanía" },
  ],
};

function Opcion({ texto, activo, c, onPress }: { texto: string; activo: boolean; c: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        vibrar.seleccion();
        onPress();
      }}
      style={[styles.opcion, activo && { borderColor: c, backgroundColor: conAlfa(c, 0.15) }]}
    >
      <Texto style={{ fontFamily: fuente.cuerpoFuerte, fontSize: 13, color: activo ? color.texto : color.texto2 }}>{texto}</Texto>
    </Pressable>
  );
}

export default function RetarAmigo({ amigo, visible, onCerrar }: { amigo: PlacaDatos; visible: boolean; onCerrar: () => void }) {
  const router = useRouter();
  const { sesion } = useSesion();
  const [mundo, setMundo] = useState<"numeria" | "geografia">("numeria");
  const [opcion, setOpcion] = useState("suma");
  const [creando, setCreando] = useState(false);
  const m = MUNDO_POR_SLUG[mundo as MundoSlug];

  async function retar() {
    if (!sesion) return;
    setCreando(true);
    try {
      const id = await retarAmigo(sesion.user.id, amigo.id, mundo, opcion);
      onCerrar();
      router.push({ pathname: "/duelo/[id]", params: { id } });
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    } finally {
      setCreando(false);
    }
  }

  return (
    <Hoja visible={visible} onCerrar={onCerrar}>
      <View style={styles.fila}>
        <AvatarMarco url={amigo.avatarUrl} nombre={amigo.nombre} marco={amigo.marco} tam={44} />
        <View style={{ flex: 1 }}>
          <Texto v="micro">Retar a</Texto>
          <Texto v="h2">{amigo.nombre}</Texto>
        </View>
      </View>
      <Texto v="micro">Ciudad</Texto>
      <View style={styles.fila}>
        {(["numeria", "geografia"] as const).map((id) => (
          <Opcion
            key={id}
            texto={MUNDO_POR_SLUG[id].nombre}
            activo={mundo === id}
            c={MUNDO_POR_SLUG[id].neon}
            onPress={() => {
              setMundo(id);
              setOpcion(OPCIONES[id][0].id);
            }}
          />
        ))}
      </View>
      <Texto v="micro">Tema</Texto>
      <View style={[styles.fila, { flexWrap: "wrap" }]}>
        {OPCIONES[mundo].map((o) => (
          <Opcion key={o.id} texto={o.nombre} activo={opcion === o.id} c={m.neon} onPress={() => setOpcion(o.id)} />
        ))}
      </View>
      <Boton3D titulo="¡Retar!" acento={m.base} brillo cargando={creando} onPress={retar} />
    </Hoja>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  opcion: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface2 },
});
