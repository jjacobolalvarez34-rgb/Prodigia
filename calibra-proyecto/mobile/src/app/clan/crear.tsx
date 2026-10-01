import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { COLORES_CLAN, COSTO_CREAR_CLAN, crearClan } from "~/lib/clanes";
import { sonar, vibrar } from "~/lib/efectos";
import { recargarJugador, useJugador } from "~/lib/jugador";
import { mensajeError } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import Bandera from "~/ui/clan/Bandera";
import Ciudad from "~/ui/Ciudad";
import { IconoChispa } from "~/ui/Iconos";
import { PantallaApilada } from "~/ui/Pantalla";
import Texto from "~/ui/Texto";
import { color, fuente } from "~/tema";

export default function CrearClan() {
  const router = useRouter();
  const { resumen } = useJugador();
  const chispas = resumen?.chispas ?? 0;
  const [nombre, setNombre] = useState("");
  const [tag, setTag] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [c, setC] = useState(COLORES_CLAN[0]);
  const [creando, setCreando] = useState(false);

  async function crear() {
    setCreando(true);
    try {
      await crearClan(nombre.trim(), tag.trim(), c, descripcion.trim());
      sonar("nivel");
      vibrar.exito();
      await recargarJugador();
      mostrarAviso("¡Tu clan ya tiene ciudad!", "logro");
      router.replace({ pathname: "/social", params: { seccion: "clan" } });
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    } finally {
      setCreando(false);
    }
  }

  return (
    <PantallaApilada titulo="Crear un clan">
      <View style={styles.previa}>
        <Ciudad semilla={`nuevo-${nombre}`} acento={c} alto={130} radio={0} densidad={0.7} />
        <View style={styles.previaTexto}>
          <Bandera c={c} />
          <Texto v="h3" tam={17}>
            {nombre || "Tu clan"} {tag ? <Texto v="nota">[{tag}]</Texto> : null}
          </Texto>
        </View>
      </View>
      <TextInput value={nombre} onChangeText={setNombre} placeholder="Nombre del clan" placeholderTextColor={color.texto2} maxLength={30} style={styles.input} />
      <TextInput value={tag} onChangeText={(t) => setTag(t.toUpperCase().slice(0, 5))} placeholder="Etiqueta (hasta 5 letras)" placeholderTextColor={color.texto2} style={styles.input} />
      <TextInput value={descripcion} onChangeText={setDescripcion} placeholder="¿De qué se trata tu clan?" placeholderTextColor={color.texto2} multiline maxLength={160} style={[styles.input, { minHeight: 70 }]} />
      <Texto v="micro">Color del estandarte</Texto>
      <View style={styles.colores}>
        {COLORES_CLAN.map((x) => (
          <Pressable
            key={x}
            onPress={() => {
              vibrar.seleccion();
              setC(x);
            }}
            style={[styles.color, { backgroundColor: x, borderColor: c === x ? "#fff" : "transparent", transform: [{ scale: c === x ? 1.12 : 1 }] }]}
          />
        ))}
      </View>
      <Boton3D
        titulo={`Fundar por ${COSTO_CREAR_CLAN.toLocaleString("es")}`}
        icono={<IconoChispa tam={18} />}
        variante="logro"
        brillo
        deshabilitado={nombre.trim().length < 3 || chispas < COSTO_CREAR_CLAN}
        cargando={creando}
        onPress={crear}
      />
      <Texto v="nota" centro tam={12}>
        {chispas < COSTO_CREAR_CLAN ? `Tienes ${chispas.toLocaleString("es")} Chispas: te faltan ${(COSTO_CREAR_CLAN - chispas).toLocaleString("es")}.` : `Tienes ${chispas.toLocaleString("es")} Chispas.`}
      </Texto>
    </PantallaApilada>
  );
}

const styles = StyleSheet.create({
  previa: { height: 130, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: color.border },
  previaTexto: { position: "absolute", left: 12, top: 10, flexDirection: "row", alignItems: "center", gap: 8 },
  input: { backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: color.texto, fontFamily: fuente.cuerpoMedio, fontSize: 15 },
  colores: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  color: { width: 36, height: 36, borderRadius: 18, borderWidth: 3 },
});
