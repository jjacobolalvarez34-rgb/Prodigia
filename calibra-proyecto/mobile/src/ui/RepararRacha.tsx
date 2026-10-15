import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { sonar, vibrar } from "~/lib/efectos";
import { fijarCometas, recargarJugador } from "~/lib/jugador";
import { estadoRachaReparable, mensajeError, repararRachaConCometas, type RachaReparable } from "~/lib/recompensas";
import { supabase } from "~/lib/supabase";
import { color, conAlfa } from "~/tema";
import { mostrarAviso } from "./Aviso";
import Boton3D from "./Boton3D";
import { IconoCometa, IconoLlama } from "./Iconos";
import Tarjeta from "./Tarjeta";
import Texto from "./Texto";

// Reparar la racha con Cometas (0287), igual que en la web: si se cortó hace poco
// (hasta 3 días) aparece en Hoy con su precio; una vez por semana.
export default function RepararRacha({ indice }: { indice: number }) {
  const [estado, setEstado] = useState<RachaReparable | null>(null);
  const [ocupado, setOcupado] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      estadoRachaReparable(supabase).then((e) => {
        if (vivo) setEstado(e);
      });
      return () => {
        vivo = false;
      };
    }, [])
  );

  if (!estado) return null;
  const espera = estado.disponible_en ? new Date(estado.disponible_en).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" }) : null;

  async function reparar() {
    setOcupado(true);
    try {
      const r = await repararRachaConCometas(supabase);
      fijarCometas(r.cometas);
      sonar("logro");
      vibrar.exito();
      mostrarAviso(`¡Racha reparada! Vas por ${r.racha} días`, "logro");
      setEstado(null);
      await recargarJugador();
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Tarjeta indice={indice} acento={color.racha} brillo={0.3}>
      <View style={styles.fila}>
        <View style={styles.llama}>
          <IconoLlama tam={30} estado="apagada" />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Texto v="h3">Tu racha de {estado.perdida} días se cortó</Texto>
          <Texto v="nota" tam={12.5}>
            {espera
              ? `Ya reparaste una racha esta semana. Vuelve a estar disponible el ${espera}.`
              : `Faltaron ${estado.dias_perdidos} ${estado.dias_perdidos === 1 ? "día" : "días"}. Repárala con Cometas y sigue donde ibas (una vez por semana).`}
          </Texto>
        </View>
      </View>
      {!espera && <Boton3D titulo={`Reparar por ${estado.costo}`} icono={<IconoCometa tam={18} />} tamano="sm" cargando={ocupado} onPress={reparar} estilo={{ marginTop: 10 }} />}
    </Tarjeta>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  llama: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: conAlfa(color.racha, 0.15) },
});
