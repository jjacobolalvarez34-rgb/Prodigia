import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Alert, Pressable, StyleSheet, Switch, View } from "react-native";
import { useEffect, useState, type ReactNode } from "react";
import { verTutorialOtraVez } from "~/lib/bienvenida";
import { cambiarAjuste, useAjustes } from "~/lib/ajustes";
import { cargarEstadoEdad, desbloquearJugador, limpiarEstadoEdad, misBloqueados, useEdad, type Bloqueado } from "~/lib/edad";
import { vibrar } from "~/lib/efectos";
import { URL_WEB } from "~/lib/entorno";
import { EQUIPO_LIVIANO } from "~/lib/rendimiento";
import { limpiarJugador } from "~/lib/jugador";
import { borrarResumen } from "~/lib/resumen";
import { useSesion } from "~/lib/sesion";
import { desconectarPresencia } from "~/lib/social";
import { mensajeError, supabase } from "~/lib/supabase";
import { actualizarWidgets } from "~/widgets/registro";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import ContrasenaRespaldo, { necesitaContrasenaRespaldo } from "~/ui/ContrasenaRespaldo";
import { IconoDerecha } from "~/ui/Iconos";
import { TEMAS } from "@/lib/temas/temas";
import type { IdTema } from "@/lib/temas/calendario";
import { temaEnVistaPrevia, verTema } from "~/lib/temporada";
import { PantallaApilada, TituloSeccion } from "~/ui/Pantalla";
import PreguntaEdad from "~/ui/PreguntaEdad";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color } from "~/tema";

function Fila({ titulo, nota, derecha, onPress }: { titulo: string; nota?: string; derecha?: ReactNode; onPress?: () => void }) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={() => {
        vibrar.seleccion();
        onPress?.();
      }}
      style={({ pressed }) => [styles.fila, pressed && onPress ? { backgroundColor: color.surface2 } : null]}
    >
      <View style={{ flex: 1 }}>
        <Texto v="fuerte">{titulo}</Texto>
        {nota ? (
          <Texto v="nota" tam={12}>
            {nota}
          </Texto>
        ) : null}
      </View>
      {derecha ?? (onPress ? <IconoDerecha tam={16} c={color.texto2} /> : null)}
    </Pressable>
  );
}

export default function Ajustes() {
  const [vistaPrevia, setVistaPrevia] = useState<IdTema | null>(temaEnVistaPrevia());
  const router = useRouter();
  const { sesion } = useSesion();
  const ajustes = useAjustes();
  const edad = useEdad();
  const [pidiendoEdad, setPidiendoEdad] = useState(false);
  const [bloqueados, setBloqueados] = useState<Bloqueado[]>([]);
  const [respaldoListo, setRespaldoListo] = useState(false);
  useEffect(() => {
    cargarEstadoEdad();
    misBloqueados().then(setBloqueados);
  }, []);
  async function salir() {
    Alert.alert("¿Cerrar sesión?", "Tu progreso queda guardado en tu cuenta.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          await borrarResumen();
          await actualizarWidgets(null);
          desconectarPresencia();
          limpiarJugador();
          limpiarEstadoEdad();
          await supabase.auth.signOut();
        },
      },
    ]);
  }

  return (
    <PantallaApilada titulo="Ajustes">
      <TituloSeccion>Juego</TituloSeccion>
      <Tarjeta relleno={4}>
        <Fila
          titulo="Sonido"
          nota="Aciertos, monedas, combos"
          derecha={<Switch value={ajustes.sonido} onValueChange={(v) => cambiarAjuste("sonido", v)} trackColor={{ true: color.primario, false: color.surface3 }} thumbColor="#fff" />}
        />
        <Fila
          titulo="Vibración"
          nota="Al tocar teclas y botones"
          derecha={<Switch value={ajustes.haptica} onValueChange={(v) => cambiarAjuste("haptica", v)} trackColor={{ true: color.primario, false: color.surface3 }} thumbColor="#fff" />}
        />
        <Fila
          titulo="Animaciones"
          nota={ajustes.animaciones === "auto" ? `Automático (${EQUIPO_LIVIANO ? "livianas en este teléfono" : "completas"})` : ajustes.animaciones === "livianas" ? "Livianas: menos efectos, más fluidez" : "Completas: todos los efectos"}
          onPress={() => cambiarAjuste("animaciones", ajustes.animaciones === "auto" ? "livianas" : ajustes.animaciones === "livianas" ? "completas" : "auto")}
          derecha={
            <Texto v="fuerte" tam={13} c={color.primarioClaro}>
              {ajustes.animaciones === "auto" ? "Auto" : ajustes.animaciones === "livianas" ? "Livianas" : "Completas"}
            </Texto>
          }
        />
        <Fila
          titulo="Decoración de temporada"
          nota="En las festividades: copos, adornos en las ciudades, accesorios y bordes. Nunca dentro de una partida."
          derecha={<Switch value={ajustes.decoracion} onValueChange={(v) => {
                cambiarAjuste("decoracion", v);
                void actualizarWidgets();
              }} trackColor={{ true: color.primario, false: color.surface3 }} thumbColor="#fff" />}
        />
        {ajustes.decoracion && (
          <Fila
            titulo="Ver una festividad"
            nota="Vista previa de cada fiesta fuera de su fecha (toca para pasar a la siguiente)"
            onPress={() => {
              const lista = Object.keys(TEMAS) as IdTema[];
              const actual = temaEnVistaPrevia();
              const siguiente = actual === null ? lista[0] : lista.indexOf(actual) + 1 < lista.length ? lista[lista.indexOf(actual) + 1] : null;
              verTema(siguiente);
              setVistaPrevia(siguiente);
              void actualizarWidgets();
            }}
            derecha={
              <Texto v="fuerte" tam={13} c={color.primarioClaro}>
                {vistaPrevia ? TEMAS[vistaPrevia].nombre : "La de hoy"}
              </Texto>
            }
          />
        )}
      </Tarjeta>

      <TituloSeccion>Avisos</TituloSeccion>
      <Tarjeta relleno={4}>
        <Fila titulo="Notificaciones" nota="Qué avisos recibir y cuándo" onPress={() => router.push("/ajustes-avisos")} />
        <Fila
          titulo="Ver el tutorial otra vez"
          nota="El recorrido por las pestañas y las ayudas de cada sección"
          onPress={async () => {
            await verTutorialOtraVez();
            router.replace("/");
          }}
        />
      </Tarjeta>

      <TituloSeccion>Seguridad</TituloSeccion>
      <Tarjeta relleno={4}>
        <Fila
          titulo="Tu edad"
          nota={!edad ? "Sin conexión" : !edad.tieneFecha ? "Sin confirmar: confírmala para usar el chat" : edad.esMenor ? "Menor de 13: chat con frases rápidas" : "Confirmada"}
          onPress={edad && !edad.tieneFecha ? () => setPidiendoEdad(true) : undefined}
        />
        {bloqueados.length === 0 ? (
          <Fila titulo="Jugadores bloqueados" nota="No bloqueaste a nadie. Se bloquea desde el perfil de un jugador." />
        ) : (
          bloqueados.map((b) => (
            <Fila
              key={b.id}
              titulo={b.nombre ?? "Jugador"}
              nota="Bloqueado"
              derecha={
                <Texto v="fuerte" tam={13} c={color.primarioClaro}>
                  Desbloquear
                </Texto>
              }
              onPress={() =>
                desbloquearJugador(b.id)
                  .then(() => {
                    setBloqueados((l) => l.filter((x) => x.id !== b.id));
                    mostrarAviso("Desbloqueado", "ok");
                  })
                  .catch((e) => mostrarAviso(mensajeError(e), "error"))
              }
            />
          ))
        )}
      </Tarjeta>

      <TituloSeccion>Cuenta</TituloSeccion>
      {necesitaContrasenaRespaldo(sesion?.user) && !respaldoListo && <ContrasenaRespaldo alGuardar={() => setRespaldoListo(true)} />}
      <Tarjeta relleno={4}>
        <Fila titulo="Correo" nota={sesion?.user.is_anonymous ? "Invitado (sin correo)" : sesion?.user.email ?? ""} />
        {/* Revisión 2026-10-14: igual que «¿Olvidaste tu contraseña?» del login (preguntas en la web). */}
        <Fila titulo="Cambiar contraseña" nota="Respondes 3 preguntas y eliges una nueva" onPress={() => WebBrowser.openBrowserAsync(`${URL_WEB}/recuperar`)} />
        <Fila titulo="Privacidad" onPress={() => WebBrowser.openBrowserAsync(`${URL_WEB}/privacidad`)} />
        <Fila titulo="Términos" onPress={() => WebBrowser.openBrowserAsync(`${URL_WEB}/terminos`)} />
        <Fila titulo="Eliminar mi cuenta" nota="Se hace desde la web, con tu sesión" onPress={() => WebBrowser.openBrowserAsync(`${URL_WEB}/ajustes`)} />
      </Tarjeta>

      <Boton3D titulo="Cerrar sesión" variante="peligro" onPress={salir} estilo={{ marginTop: 8 }} />
      <PreguntaEdad visible={pidiendoEdad} onCerrar={() => setPidiendoEdad(false)} />
      <Texto v="nota" tam={11} centro>
        Prodigia {Constants.expoConfig?.version ?? ""} · Tu progreso es el mismo en la app y en la web.
      </Texto>
    </PantallaApilada>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 14 },
});
