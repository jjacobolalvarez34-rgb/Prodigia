import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { ordenarMisTareas, type MiTarea } from "@/lib/docentes/panel";
import { cargarMisGrupos, cargarMisTareas, salirDeCurso, unirseACurso, type MiGrupo } from "~/lib/curso";
import { vibrar } from "~/lib/efectos";
import { recargarJugador } from "~/lib/jugador";
import { useSesion } from "~/lib/sesion";
import Boton3D from "~/ui/Boton3D";
import TarjetaTarea from "~/ui/curso/TarjetaTarea";
import { PantallaApilada, TituloSeccion } from "~/ui/Pantalla";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, conAlfa, fuente } from "~/tema";

// «Mi curso» (piloto para colegios, 0318), igual que /curso de la web: unirse con el
// código del docente, las tareas y los cursos, y salir de uno. Si el colegio tiene
// licencia, al unirse llega el Pro (se recarga el jugador para verlo al instante).
export default function MiCurso() {
  const { sesion } = useSesion();
  const invitado = !!sesion?.user.is_anonymous;
  const [codigo, setCodigo] = useState("");
  const [uniendo, setUniendo] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [tareas, setTareas] = useState<MiTarea[]>([]);
  const [grupos, setGrupos] = useState<MiGrupo[]>([]);
  const [ahora, setAhora] = useState(() => Date.now());

  const cargar = useCallback(async () => {
    const [t, g] = await Promise.all([cargarMisTareas(), cargarMisGrupos()]);
    setAhora(Date.now());
    setTareas(t);
    setGrupos(g);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  async function unirse() {
    if (codigo.trim().length < 4) return;
    setUniendo(true);
    setMensaje(null);
    const nombre = await unirseACurso(codigo);
    setUniendo(false);
    if (nombre === null) {
      vibrar.error();
      setMensaje({ ok: false, texto: "Ese código no existe. Revísalo con tu docente." });
      return;
    }
    vibrar.exito();
    setMensaje({ ok: true, texto: `Te uniste a ${nombre}.` });
    setCodigo("");
    await cargar();
    recargarJugador();
  }

  function salir(g: MiGrupo) {
    Alert.alert(`¿Salir de ${g.nombre}?`, "Dejas de ver sus tareas. Si el colegio te daba Pro, lo pierdes.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir del curso",
        style: "destructive",
        onPress: async () => {
          await salirDeCurso(g.group_id);
          await cargar();
          recargarJugador();
        },
      },
    ]);
  }

  const ordenadas = ordenarMisTareas(tareas, ahora);

  return (
    <PantallaApilada titulo="Mi curso" subtitulo="Únete al curso de tu docente con el código que te dio y verás aquí tus tareas.">
      {invitado ? (
        <Tarjeta acento={color.logro}>
          <Texto v="cuerpo">Para unirte a un curso necesitas crear tu cuenta.</Texto>
        </Tarjeta>
      ) : (
        <Tarjeta acento={color.primario} brillo={0.15}>
          <Texto v="h3">Unirme a un curso</Texto>
          <View style={styles.fila}>
            <TextInput
              value={codigo}
              onChangeText={(v) => setCodigo(v.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="Código de 6 letras"
              placeholderTextColor={color.texto2}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              onSubmitEditing={unirse}
              style={styles.input}
            />
            <Boton3D titulo={uniendo ? "Uniendo…" : "Unirme"} tamano="sm" deshabilitado={uniendo || codigo.trim().length < 4} onPress={unirse} />
          </View>
          {mensaje && (
            <Texto v="nota" c={mensaje.ok ? color.correcto : color.error}>
              {mensaje.texto}
            </Texto>
          )}
        </Tarjeta>
      )}

      <TituloSeccion>Tus tareas</TituloSeccion>
      {ordenadas.length === 0 ? (
        <Texto v="nota">No tienes tareas por ahora.</Texto>
      ) : (
        ordenadas.map((t) => <TarjetaTarea key={t.tarea_id} tarea={t} ahora={ahora} />)
      )}

      <TituloSeccion>Tus cursos</TituloSeccion>
      {grupos.length === 0 ? (
        <Texto v="nota">Todavía no estás en ningún curso.</Texto>
      ) : (
        grupos.map((g) => (
          <Tarjeta key={g.group_id}>
            <View style={styles.entre}>
              <View style={{ flex: 1, gap: 2 }}>
                <Texto v="fuerte">{g.nombre}</Texto>
                {g.docente_nombre ? (
                  <Texto v="nota" tam={12}>
                    Docente: {g.docente_nombre}
                  </Texto>
                ) : null}
                {g.con_licencia && (
                  <View style={styles.pro}>
                    <Texto v="micro" c={color.primarioClaro}>
                      Tu colegio te da Pro{g.colegio ? ` · ${g.colegio}` : ""}
                    </Texto>
                  </View>
                )}
              </View>
              <Pressable onPress={() => salir(g)} hitSlop={10}>
                <Texto v="nota" tam={12} c={color.error}>
                  Salir
                </Texto>
              </Pressable>
            </View>
          </Tarjeta>
        ))
      )}
    </PantallaApilada>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 10 },
  entre: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: {
    flex: 1,
    backgroundColor: color.surface1,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: 14,
    color: color.texto,
    fontSize: 18,
    letterSpacing: 4,
    fontFamily: fuente.mono,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pro: { alignSelf: "flex-start", marginTop: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: conAlfa(color.primario, 0.2) },
});
