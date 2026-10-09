import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { cargarMiClan, invitacionesClan, type DatosClan } from "~/lib/clanes";
import { sonar, vibrar } from "~/lib/efectos";
import { URL_WEB } from "~/lib/entorno";
import { useJugador } from "~/lib/jugador";
import { placaBasica, type PlacaDatos } from "~/lib/placa";
import { useSesion } from "~/lib/sesion";
import { escucharPresencia, misAmigos, misConversaciones, responderSolicitud, solicitudesPendientes, type Conversacion } from "~/lib/social";
import { mensajeError, supabase } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import VistaClan from "~/ui/clan/VistaClan";
import Bandera from "~/ui/clan/Bandera";
import RetarAmigo from "~/ui/RetarAmigo";
import { IconoBuscar, IconoCompetir, IconoMensaje } from "~/ui/Iconos";
import { PantallaPestana, TituloSeccion, Vacio } from "~/ui/Pantalla";
import AvatarMarco from "~/ui/placa/AvatarMarco";
import { PlacaTarjeta } from "~/ui/placa/Placa";
import Segmentos from "~/ui/Segmentos";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, fuente } from "~/tema";

type Seccion = "inicio" | "amigos" | "mensajes" | "clan";

function hace(fecha: string | null): string {
  if (!fecha) return "";
  const min = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  return `${Math.floor(h / 24)} d`;
}

export default function Social() {
  const router = useRouter();
  const params = useLocalSearchParams<{ seccion?: string }>();
  const { sesion } = useSesion();
  const miId = sesion?.user.id ?? "";
  const { esInvitado } = useJugador();
  // La sección pedida por la ruta manda hasta que el jugador elige otra.
  const [eleccion, setEleccion] = useState<{ desde: string | undefined; valor: Seccion } | null>(null);
  const seccion: Seccion = eleccion && eleccion.desde === params.seccion ? eleccion.valor : ((params.seccion as Seccion) ?? "inicio");
  const setSeccion = (valor: Seccion) => setEleccion({ desde: params.seccion, valor });
  const [amigos, setAmigos] = useState<PlacaDatos[]>([]);
  const [solicitudes, setSolicitudes] = useState<{ user_id: string; display_name: string | null }[]>([]);
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [clan, setClan] = useState<DatosClan | null>(null);
  const [noLeidosClan, setNoLeidosClan] = useState(0);
  const [invitaciones, setInvitaciones] = useState<Awaited<ReturnType<typeof invitacionesClan>>>([]);
  const [enLinea, setEnLinea] = useState<Set<string>>(new Set());
  const [retando, setRetando] = useState<PlacaDatos | null>(null);

  useEffect(() => escucharPresencia((ids) => setEnLinea(new Set(ids))), []);

  const cargar = useCallback(async () => {
    if (!miId || esInvitado) return;
    await Promise.allSettled([
      misAmigos().then(setAmigos),
      solicitudesPendientes().then(setSolicitudes),
      misConversaciones().then(setConversaciones),
      cargarMiClan().then(setClan),
      invitacionesClan().then(setInvitaciones),
      Promise.resolve(supabase.rpc("clan_chat_resumen")).then(({ data }) => setNoLeidosClan(Number((data as { out_no_leidos: number }[] | null)?.[0]?.out_no_leidos ?? 0))),
    ]);
  }, [miId, esInvitado]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  async function responder(deId: string, aceptar: boolean) {
    try {
      await responderSolicitud(miId, deId, aceptar);
      if (aceptar) {
        sonar("recompensa");
        vibrar.exito();
        mostrarAviso("¡Tienen una nueva amistad!", "ok");
      }
      cargar();
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    }
  }

  function invitar() {
    Share.share({ message: `¡Juega conmigo en Prodigia! Aprende jugando en 15 mundos: ${URL_WEB}` });
  }

  if (esInvitado) {
    return (
      <PantallaPestana>
        <Vacio titulo="Lo social es para cuentas" texto="Crea tu cuenta para tener amigos, mensajes y un clan." />
      </PantallaPestana>
    );
  }

  const noLeidosDirectos = conversaciones.reduce((a, c) => a + c.no_leidos, 0);
  const amigosEnLinea = amigos.filter((a) => enLinea.has(a.id));

  const listaConversaciones = (
    <Tarjeta relleno={12}>
      {clan?.clan && (
        <Pressable onPress={() => router.push("/clan/chat")} style={styles.conv}>
          <View style={[styles.avClan, { backgroundColor: clan.clan.color_estandarte + "33" }]}>
            <Bandera c={clan.clan.color_estandarte} ancho={16} alto={24} quieta />
          </View>
          <View style={{ flex: 1 }}>
            <Texto v="h3" tam={14}>
              {clan.clan.nombre} {clan.clan.tag ? `[${clan.clan.tag}]` : ""}
            </Texto>
            <Texto v="nota" numberOfLines={1}>
              Chat del clan
            </Texto>
          </View>
          {noLeidosClan > 0 && (
            <View style={styles.badge}>
              <Texto v="mono" tam={11} c="#fff">
                {noLeidosClan}
              </Texto>
            </View>
          )}
        </Pressable>
      )}
      {conversaciones.length === 0 && !clan?.clan ? (
        <Texto v="nota" centro style={{ paddingVertical: 12 }}>
          Todavía no hay mensajes. Escríbele a un amigo desde su Placa.
        </Texto>
      ) : (
        conversaciones.map((c, i) => (
          <Animated.View key={c.amigo_id} entering={FadeInDown.delay(i * 40)}>
            <Pressable onPress={() => router.push({ pathname: "/chat/[id]", params: { id: c.amigo_id, nombre: c.amigo_nombre ?? "" } })} style={styles.conv}>
              <AvatarMarco url={c.amigo_avatar_url} nombre={c.amigo_nombre ?? "?"} tam={40} animar={false} presencia={enLinea.has(c.amigo_id)} />
              <View style={{ flex: 1 }}>
                <View style={styles.entre}>
                  <Texto v="h3" tam={14} numberOfLines={1} style={{ flex: 1 }}>
                    {c.amigo_nombre ?? "Jugador"}
                  </Texto>
                  <Texto v="nota" tam={11}>
                    {hace(c.ultimo_created_at)}
                  </Texto>
                </View>
                <Texto v="nota" numberOfLines={1} c={c.no_leidos > 0 ? color.texto : color.texto2}>
                  {c.ultimo_remitente_id === miId ? "Tú: " : ""}
                  {c.ultimo_texto ?? ""}
                </Texto>
              </View>
              {c.no_leidos > 0 && (
                <View style={styles.badge}>
                  <Texto v="mono" tam={11} c="#fff">
                    {c.no_leidos}
                  </Texto>
                </View>
              )}
            </Pressable>
          </Animated.View>
        ))
      )}
    </Tarjeta>
  );

  return (
    <View style={{ flex: 1 }}>
      <PantallaPestana>
        <Segmentos<Seccion>
          opciones={[
            { id: "inicio", titulo: "Inicio", insignia: solicitudes.length },
            { id: "amigos", titulo: "Amigos" },
            { id: "mensajes", titulo: "Mensajes", insignia: noLeidosDirectos },
            { id: "clan", titulo: "Clan", insignia: noLeidosClan + invitaciones.length },
          ]}
          valor={seccion}
          onCambio={setSeccion}
        />

        {seccion === "inicio" && (
          <>
            <TituloSeccion>En línea ahora</TituloSeccion>
            {amigosEnLinea.length === 0 ? (
              <Texto v="nota">Ninguno de tus amigos está conectado ahora mismo.</Texto>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
                {amigosEnLinea.map((a, i) => (
                  <Animated.View key={a.id} entering={FadeInRight.delay(i * 60).duration(300)}>
                    <Pressable onPress={() => router.push({ pathname: "/jugador/[id]", params: { id: a.id } })} style={styles.activo}>
                      <AvatarMarco url={a.avatarUrl} nombre={a.nombre} marco={a.marco} tam={50} presencia />
                      <Texto v="fuerte" tam={11} numberOfLines={1}>
                        {a.nombre}
                      </Texto>
                    </Pressable>
                  </Animated.View>
                ))}
              </ScrollView>
            )}

            {solicitudes.map((s, i) => (
              <Tarjeta key={s.user_id} indice={i} acento={color.primario} brillo={0.2}>
                <View style={styles.fila}>
                  <AvatarMarco url={null} nombre={s.display_name ?? "?"} tam={40} animar={false} />
                  <View style={{ flex: 1 }}>
                    <Texto v="h3" tam={14}>
                      {s.display_name ?? "Alguien"} quiere ser tu amigo
                    </Texto>
                  </View>
                </View>
                <View style={[styles.fila, { marginTop: 10 }]}>
                  <Boton3D titulo="Rechazar" variante="secundario" tamano="sm" estilo={{ flex: 1 }} onPress={() => responder(s.user_id, false)} />
                  <Boton3D titulo="Aceptar" tamano="sm" estilo={{ flex: 1 }} onPress={() => responder(s.user_id, true)} />
                </View>
              </Tarjeta>
            ))}

            <TituloSeccion>Conversaciones</TituloSeccion>
            {listaConversaciones}
            <View style={styles.fila}>
              <Boton3D titulo="Buscar jugadores" variante="secundario" tamano="sm" icono={<IconoBuscar tam={16} c={color.texto} />} estilo={{ flex: 1 }} onPress={() => router.push("/amigos/buscar")} />
              <Boton3D titulo="Invitar" variante="secundario" tamano="sm" estilo={{ flex: 1 }} onPress={invitar} />
            </View>
          </>
        )}

        {seccion === "amigos" && (
          <>
            <View style={styles.entre}>
              <Texto v="h2">
                Amigos <Texto v="nota">({amigos.length})</Texto>
              </Texto>
              <Pressable onPress={() => router.push("/amigos/buscar")} style={styles.botonRedondo}>
                <IconoBuscar tam={18} c={color.texto} />
              </Pressable>
            </View>
            {amigos.length === 0 ? (
              <Vacio titulo="Aún no tienes amigos" texto="Busca jugadores por su nombre o invita a alguien a Prodigia.">
                <Boton3D titulo="Invitar amigos" tamano="sm" onPress={invitar} />
              </Vacio>
            ) : (
              <View style={styles.grilla}>
                {Array.from({ length: Math.ceil(amigos.length / 2) }, (_, fila) => (
                  <View key={fila} style={styles.fila}>
                    {amigos.slice(fila * 2, fila * 2 + 2).map((a, j) => (
                      <PlacaTarjeta
                        key={a.id}
                        placa={a}
                        indice={fila * 2 + j}
                        pie={
                          <View style={[styles.fila, { marginTop: 6, gap: 6 }]}>
                            <Pressable onPress={() => setRetando(a)} style={styles.accion}>
                              <IconoCompetir tam={15} c={color.texto} />
                            </Pressable>
                            <Pressable onPress={() => router.push({ pathname: "/chat/[id]", params: { id: a.id, nombre: a.nombre } })} style={styles.accion}>
                              <IconoMensaje tam={15} c={color.texto} />
                            </Pressable>
                          </View>
                        }
                      />
                    ))}
                    {amigos.slice(fila * 2, fila * 2 + 2).length === 1 && <View style={{ flex: 1 }} />}
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {seccion === "mensajes" && listaConversaciones}

        {seccion === "clan" && clan && (
          <VistaClan datos={clan} miId={miId} noLeidosClan={noLeidosClan} invitaciones={invitaciones} onCambio={cargar} />
        )}
      </PantallaPestana>
      <RetarAmigo amigo={retando ?? placaBasica("", "")} visible={!!retando} onCerrar={() => setRetando(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 10 },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  activo: { alignItems: "center", gap: 4, width: 58 },
  conv: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: color.border },
  avClan: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  badge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: color.primario, alignItems: "center", justifyContent: "center" },
  grilla: { gap: 10 },
  accion: { width: 34, height: 30, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.4)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  botonRedondo: { width: 38, height: 38, borderRadius: 19, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border, alignItems: "center", justifyContent: "center" },
  titulo: { fontFamily: fuente.display },
});

export { default as ErrorBoundary } from "~/ui/PantallaError";
