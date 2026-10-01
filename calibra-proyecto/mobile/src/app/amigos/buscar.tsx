import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { invitarAClan } from "~/lib/clanes";
import { sonar } from "~/lib/efectos";
import { useSesion } from "~/lib/sesion";
import { buscarJugadores, misAmigos, pedirAmistad } from "~/lib/social";
import { mensajeError } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import { IconoBuscar } from "~/ui/Iconos";
import { PantallaApilada, Vacio } from "~/ui/Pantalla";
import AvatarMarco from "~/ui/placa/AvatarMarco";
import Texto from "~/ui/Texto";
import { color, fuente } from "~/tema";

// Buscar jugadores por nombre para agregarlos, o (desde el clan) invitar amigos.
export default function Buscar() {
  const router = useRouter();
  const { invitarClan } = useLocalSearchParams<{ invitarClan?: string }>();
  const modoClan = invitarClan === "1";
  const { sesion } = useSesion();
  const miId = sesion?.user.id ?? "";
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState<{ id: string; display_name: string | null }[]>([]);
  const [hechos, setHechos] = useState<Set<string>>(new Set());
  const [ocupado, setOcupado] = useState<string | null>(null);

  useEffect(() => {
    if (!modoClan) return;
    misAmigos().then((a) => setResultados(a.map((p) => ({ id: p.id, display_name: p.nombre }))));
  }, [modoClan]);

  useEffect(() => {
    if (modoClan) return;
    const t = setTimeout(() => {
      buscarJugadores(q).then((r) => setResultados(r.filter((x) => x.id !== miId)));
    }, 250);
    return () => clearTimeout(t);
  }, [q, miId, modoClan]);

  async function accion(id: string) {
    setOcupado(id);
    try {
      if (modoClan) await invitarAClan(id);
      else await pedirAmistad(miId, id);
      sonar("boton");
      setHechos((s) => new Set(s).add(id));
      mostrarAviso(modoClan ? "Invitación enviada" : "Solicitud enviada", "ok");
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    } finally {
      setOcupado(null);
    }
  }

  const visibles = modoClan && q ? resultados.filter((r) => (r.display_name ?? "").toLowerCase().includes(q.toLowerCase())) : resultados;

  return (
    <PantallaApilada titulo={modoClan ? "Invitar al clan" : "Buscar jugadores"}>
      <View style={styles.buscador}>
        <IconoBuscar tam={18} c={color.texto2} />
        <TextInput value={q} onChangeText={setQ} autoFocus placeholder={modoClan ? "Filtrar amigos" : "Nombre del jugador"} placeholderTextColor={color.texto2} style={styles.input} />
      </View>
      {visibles.length === 0 ? (
        <Vacio titulo={modoClan ? "No tienes amigos para invitar" : q.length < 2 ? "Escribe al menos 2 letras" : "No encontramos a nadie"} />
      ) : (
        visibles.map((r, i) => (
          <Animated.View key={r.id} entering={FadeInDown.delay(i * 35)}>
            <Pressable onPress={() => router.push({ pathname: "/jugador/[id]", params: { id: r.id } })} style={styles.fila}>
              <AvatarMarco url={null} nombre={r.display_name ?? "?"} tam={38} animar={false} />
              <Texto style={{ flex: 1, fontFamily: fuente.cuerpoFuerte, fontSize: 15, color: color.texto }} numberOfLines={1}>
                {r.display_name ?? "Jugador"}
              </Texto>
              <Boton3D
                titulo={hechos.has(r.id) ? "Enviado" : modoClan ? "Invitar" : "Agregar"}
                tamano="sm"
                variante={hechos.has(r.id) ? "secundario" : "primario"}
                deshabilitado={hechos.has(r.id)}
                cargando={ocupado === r.id}
                estilo={{ width: 104 }}
                onPress={() => accion(r.id)}
              />
            </Pressable>
          </Animated.View>
        ))
      )}
    </PantallaApilada>
  );
}

const styles = StyleSheet.create({
  buscador: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border, borderRadius: 14, paddingHorizontal: 12 },
  input: { flex: 1, color: color.texto, fontFamily: fuente.cuerpoMedio, fontSize: 15, paddingVertical: 11 },
  fila: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 14, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border },
});
