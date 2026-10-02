import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { registrarFechaNacimiento } from "~/lib/edad";
import { vibrar } from "~/lib/efectos";
import { mensajeError } from "~/lib/supabase";
import { color, conAlfa, fuente } from "~/tema";
import { mostrarAviso } from "./Aviso";
import Boton3D from "./Boton3D";
import Hoja from "./Hoja";
import Texto from "./Texto";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Pantalla neutral de edad (sin sugerir una respuesta): mes y año de nacimiento.
// Se responde una sola vez; con eso se activan o no los controles para menores de 13.
export default function PreguntaEdad({ visible, onCerrar, onListo }: { visible: boolean; onCerrar: () => void; onListo?: (esMenor: boolean) => void }) {
  const [anioActual] = useState(() => new Date().getFullYear());
  const [mes, setMes] = useState<number | null>(null);
  const [anio, setAnio] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const anios = Array.from({ length: 90 }, (_, i) => anioActual - 4 - i);

  async function confirmar() {
    if (mes == null || anio == null) return;
    setGuardando(true);
    try {
      const menor = await registrarFechaNacimiento(anio, mes);
      vibrar.exito();
      onListo?.(menor);
      onCerrar();
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Hoja visible={visible} onCerrar={onCerrar}>
      <Texto v="h2">¿Cuándo naciste?</Texto>
      <Texto v="nota">Lo usamos para cuidar el chat según tu edad. No se muestra a nadie y no se puede cambiar después.</Texto>
      <Texto v="micro">Mes</Texto>
      <View style={styles.meses}>
        {MESES.map((m, i) => {
          const activo = mes === i + 1;
          return (
            <Pressable
              key={m}
              onPress={() => {
                vibrar.seleccion();
                setMes(i + 1);
              }}
              style={[styles.chip, activo && styles.chipActivo]}
            >
              <Texto style={{ fontFamily: fuente.cuerpoFuerte, fontSize: 13, color: activo ? color.texto : color.texto2 }}>{m}</Texto>
            </Pressable>
          );
        })}
      </View>
      <Texto v="micro">Año</Texto>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {anios.map((a) => {
          const activo = anio === a;
          return (
            <Pressable
              key={a}
              onPress={() => {
                vibrar.seleccion();
                setAnio(a);
              }}
              style={[styles.chip, activo && styles.chipActivo]}
            >
              <Texto style={{ fontFamily: fuente.mono, fontSize: 14, color: activo ? color.texto : color.texto2 }}>{a}</Texto>
            </Pressable>
          );
        })}
      </ScrollView>
      <Boton3D titulo="Confirmar" brillo deshabilitado={mes == null || anio == null} cargando={guardando} onPress={confirmar} />
    </Hoja>
  );
}

const styles = StyleSheet.create({
  meses: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface2 },
  chipActivo: { borderColor: color.primarioNeon, backgroundColor: conAlfa(color.primario, 0.2) },
});
