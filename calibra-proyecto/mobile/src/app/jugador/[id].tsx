import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { sonar } from "~/lib/efectos";
import { cargarPlacaPublica, type PlacaDatos } from "~/lib/placa";
import { useSesion } from "~/lib/sesion";
import { estadoAmistad, pedirAmistad, quitarAmigo, responderSolicitud } from "~/lib/social";
import { mensajeError, supabase } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Barra from "~/ui/Barra";
import Boton3D from "~/ui/Boton3D";
import { IconoCompetir, IconoMensaje } from "~/ui/Iconos";
import { PantallaApilada, TituloSeccion } from "~/ui/Pantalla";
import { PlacaCompleta } from "~/ui/placa/Placa";
import RetarAmigo from "~/ui/RetarAmigo";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, MUNDO_POR_SLUG, type MundoSlug } from "~/tema";

type Amistad = "ninguna" | "amigos" | "enviada" | "recibida";

export default function Jugador() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sesion } = useSesion();
  const miId = sesion?.user.id ?? "";
  const [placa, setPlaca] = useState<PlacaDatos | null>(null);
  const [amistad, setAmistad] = useState<Amistad>("ninguna");
  const [mundos, setMundos] = useState<{ world: string; nivel_mundo: number }[]>([]);
  const [duelos, setDuelos] = useState<{ jugados: number; victorias: number; derrotas: number } | null>(null);
  const [logros, setLogros] = useState(0);
  const [retando, setRetando] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    if (!id) return;
    const [p, a, { data: m }, { data: d }, { data: l }] = await Promise.all([
      cargarPlacaPublica(id),
      miId ? estadoAmistad(miId, id) : Promise.resolve("ninguna" as Amistad),
      supabase.rpc("progreso_mundos_publico", { p_user_id: id }),
      supabase.rpc("duelos_stats_publico", { p_user_id: id }),
      supabase.rpc("logros_publico", { p_user_id: id }),
    ]);
    setPlaca(p);
    setAmistad(a);
    setMundos(((m as { world: string; nivel_mundo: number }[] | null) ?? []).sort((x, y) => y.nivel_mundo - x.nivel_mundo));
    setDuelos((d as { jugados: number; victorias: number; derrotas: number }[] | null)?.[0] ?? null);
    setLogros(((l as { desbloqueado: boolean }[] | null) ?? []).filter((x) => x.desbloqueado).length);
  }, [id, miId]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  async function accionAmistad() {
    setOcupado(true);
    try {
      if (amistad === "ninguna") {
        await pedirAmistad(miId, id);
        sonar("boton");
        mostrarAviso("Solicitud enviada", "ok");
      } else if (amistad === "recibida") {
        await responderSolicitud(miId, id, true);
        sonar("recompensa");
        mostrarAviso("¡Ahora son amigos!", "ok");
      } else if (amistad === "amigos") {
        await new Promise<void>((ok, no) =>
          Alert.alert("¿Quitar de tus amigos?", placa?.nombre ?? "", [
            { text: "Cancelar", style: "cancel", onPress: () => no(new Error("cancelado")) },
            { text: "Quitar", style: "destructive", onPress: () => ok() },
          ])
        );
        await quitarAmigo(id);
      }
      await cargar();
    } catch (e) {
      if ((e as Error).message !== "cancelado") mostrarAviso(mensajeError(e), "error");
    } finally {
      setOcupado(false);
    }
  }

  const esYo = id === miId;
  const textoAmistad = { ninguna: "Agregar amigo", amigos: "Amigos ✓", enviada: "Solicitud enviada", recibida: "Aceptar solicitud" }[amistad];

  return (
    <View style={{ flex: 1 }}>
      <PantallaApilada titulo={placa?.nombre ?? "Jugador"}>
        {placa && <PlacaCompleta placa={placa} />}
        {!esYo && placa && (
          <View style={styles.fila}>
            <Boton3D
              titulo={textoAmistad}
              variante={amistad === "amigos" || amistad === "enviada" ? "secundario" : "primario"}
              tamano="sm"
              deshabilitado={amistad === "enviada"}
              cargando={ocupado}
              estilo={{ flex: 1 }}
              onPress={accionAmistad}
            />
            {amistad === "amigos" && (
              <>
                <Boton3D titulo="Retar" tamano="sm" icono={<IconoCompetir tam={16} c="#fff" />} estilo={{ flex: 1 }} onPress={() => setRetando(true)} />
                <Boton3D
                  titulo=""
                  tamano="sm"
                  variante="secundario"
                  icono={<IconoMensaje tam={18} c={color.texto} />}
                  estilo={{ width: 56 }}
                  onPress={() => router.push({ pathname: "/chat/[id]", params: { id, nombre: placa.nombre } })}
                />
              </>
            )}
          </View>
        )}

        <View style={styles.fila}>
          {[
            ["Duelos", duelos ? String(duelos.jugados) : "—"],
            ["Victorias", duelos ? String(duelos.victorias) : "—"],
            ["Logros", String(logros)],
          ].map(([t, v], i) => (
            <View key={t} style={{ flex: 1 }}>
              <Tarjeta indice={i} estilo={{ alignItems: "center", paddingVertical: 10 }}>
                <Texto v="mono" tam={18}>
                  {v}
                </Texto>
                <Texto v="nota" tam={11}>
                  {t}
                </Texto>
              </Tarjeta>
            </View>
          ))}
        </View>

        {mundos.length > 0 && (
          <>
            <TituloSeccion>Ciudades</TituloSeccion>
            <Tarjeta relleno={12}>
              {mundos.slice(0, 6).map((w) => {
                const m = MUNDO_POR_SLUG[w.world as MundoSlug];
                if (!m) return null;
                return (
                  <View key={w.world} style={styles.ciudad}>
                    <Texto v="fuerte" tam={14} style={{ width: 110 }}>
                      {m.nombre}
                    </Texto>
                    <Barra valor={w.nivel_mundo / 100} acento={m.base} alto={6} sinDestello estilo={{ flex: 1 }} />
                    <Texto v="mono" tam={12} c={m.neon} style={{ width: 46, textAlign: "right" }}>
                      Nv {w.nivel_mundo}
                    </Texto>
                  </View>
                );
              })}
            </Tarjeta>
          </>
        )}
      </PantallaApilada>
      {placa && <RetarAmigo amigo={placa} visible={retando} onCerrar={() => setRetando(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  ciudad: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7 },
});
