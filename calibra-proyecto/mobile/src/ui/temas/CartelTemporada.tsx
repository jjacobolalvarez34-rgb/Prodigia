import { useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { eventoDeTema, faltaHasta } from "@/lib/temas/eventos";
import { useTemaHoy } from "~/lib/temporada";
import { fuente } from "~/tema";
import Texto from "../Texto";
import EscenaTema from "./EscenaTema";

// Cartel de la festividad en Hoy (igual que la web): nombre, frase de la fase y cuánto
// falta; si la fiesta tiene colección, lleva a la pantalla del evento.
export default function CartelTemporada() {
  const router = useRouter();
  const tema = useTemaHoy();
  const { width } = useWindowDimensions();
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  if (!tema || tema.tema.escala === "tienda") return null;
  const evento = eventoDeTema(tema);
  const decoracion = tema.fase === "decoracion";
  const frase = (decoracion ? tema.tema.frase.decoracion : "") || tema.tema.frase.evento;
  const reloj = decoracion
    ? `Empieza en ${faltaHasta(new Date(Date.parse(`${tema.hoy.rango.desde}T00:00:00Z`) - 1).toISOString().slice(0, 10), ahora)}`
    : `Termina en ${faltaHasta(tema.hoy.rango.hasta, ahora)}`;
  return (
    <Pressable disabled={!evento} onPress={() => router.push("/evento" as Href)} style={({ pressed }) => [styles.caja, pressed && { transform: [{ scale: 0.98 }] }]}>
      <EscenaTema tema={tema.tema} ancho={width - 32} />
      <LinearGradient colors={["rgba(5,6,15,0.9)", "rgba(5,6,15,0.5)", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      <View style={styles.texto}>
        <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 11, letterSpacing: 2.2, color: tema.tema.acento }}>{decoracion ? "SE ACERCA" : "EVENTO"}</Texto>
        <Texto v="h2">{tema.tema.nombre}</Texto>
        <Texto v="nota" tam={12.5} style={{ maxWidth: 230 }}>
          {frase}
        </Texto>
        <View style={styles.reloj}>
          <Texto v="mono" tam={12}>
            {reloj}
          </Texto>
        </View>
      </View>
      {evento && !decoracion && (
        <View style={[styles.boton, { backgroundColor: tema.tema.acento }]}>
          <Texto style={{ fontFamily: fuente.display, fontSize: 13, color: "#05060F" }}>Ver</Texto>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  caja: { minHeight: 132, borderRadius: 22, overflow: "hidden", borderWidth: 2, borderColor: "#05060F", boxShadow: "5px 5px 0px #05060F", flexDirection: "row", alignItems: "center" },
  texto: { flex: 1, gap: 3, padding: 16 },
  reloj: { alignSelf: "flex-start", marginTop: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.1)" },
  boton: { marginRight: 14, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12, borderWidth: 2, borderColor: "#05060F", boxShadow: "3px 3px 0px #05060F" },
});
