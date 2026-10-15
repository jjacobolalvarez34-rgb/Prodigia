import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { CAPSULAS, CAPSULAS_CON_COMETAS, COLOR_RAREZA, NOMBRE_RAREZA, type Rareza } from "@/lib/recompensas/catalogo";
import { vibrar } from "~/lib/efectos";
import { fijarCometas } from "~/lib/jugador";
import { comprarCapsulaConCometas, contenidoCapsula, mensajeError, type Capsula as DatosCapsula, type ContenidoCapsula } from "~/lib/recompensas";
import { supabase } from "~/lib/supabase";
import { color } from "~/tema";
import { mostrarAviso } from "../Aviso";
import Boton3D from "../Boton3D";
import { IconoCometa } from "../Iconos";
import AbrirCapsula from "../recompensas/AbrirCapsula";
import Capsula from "../recompensas/Capsula";
import Texto from "../Texto";

// Cápsulas con Cometas (0287), igual que en la web: se compran y se abren al momento,
// con las probabilidades a la vista antes de pagar.
function Tarjeta({ tipo, costo, contenido, ocupado, onComprar }: { tipo: "estelar" | "supernova"; costo: number; contenido: ContenidoCapsula[]; ocupado: boolean; onComprar: () => void }) {
  const abierta = useSharedValue(0);
  const total = contenido.reduce((a, f) => a + f.peso, 0);
  return (
    <View style={styles.tarjeta}>
      <Capsula abierta={abierta} colores={CAPSULAS[tipo].colores} tam={78} />
      <View style={{ flex: 1, gap: 6 }}>
        <Texto v="h3">{CAPSULAS[tipo].nombre}</Texto>
        {contenido.map((f) => {
          const rareza = f.premio.replace("cosmetico_", "") as Rareza;
          return (
            <View key={f.premio} style={styles.fila}>
              <Texto v="nota" tam={12} c={COLOR_RAREZA[rareza]}>
                {NOMBRE_RAREZA[rareza]}
              </Texto>
              <Texto v="mono" tam={12} c={color.texto2}>
                {total ? Math.round((f.peso / total) * 100) : 0} %
              </Texto>
            </View>
          );
        })}
        <Boton3D titulo={`Abrir por ${costo}`} icono={<IconoCometa tam={16} />} tamano="sm" cargando={ocupado} onPress={onComprar} />
      </View>
    </View>
  );
}

export default function CapsulasCometas() {
  const [contenido, setContenido] = useState<Record<string, ContenidoCapsula[]>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [abriendo, setAbriendo] = useState<DatosCapsula | null>(null);

  useEffect(() => {
    Promise.all(CAPSULAS_CON_COMETAS.map(async (c) => [c.tipo, await contenidoCapsula(supabase, c.tipo)] as const)).then((filas) => setContenido(Object.fromEntries(filas)));
  }, []);

  async function comprar(tipo: "estelar" | "supernova") {
    vibrar.medio();
    setOcupado(tipo);
    try {
      const r = await comprarCapsulaConCometas(supabase, tipo);
      fijarCometas(r.cometas);
      setAbriendo({ id: r.id, tipo, mundo: null, detalle: null, creada_at: new Date().toISOString() });
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    } finally {
      setOcupado(null);
    }
  }

  return (
    <View style={{ gap: 10 }}>
      <View style={{ gap: 2 }}>
        <Texto v="micro" c="#B07CFF">
          Con Cometas
        </Texto>
        <Texto v="h2">Cápsulas estelares</Texto>
        <Texto v="nota" tam={12.5}>
          Se abren al momento y siempre traen un cosmético. Si ya lo tienes, se cambia por Chispas.
        </Texto>
      </View>
      {CAPSULAS_CON_COMETAS.map((c) => (
        <Tarjeta key={c.tipo} tipo={c.tipo} costo={c.costo} contenido={contenido[c.tipo] ?? []} ocupado={ocupado === c.tipo} onComprar={() => comprar(c.tipo)} />
      ))}
      {abriendo && <AbrirCapsula capsula={abriendo} onCerrar={() => setAbriendo(null)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", backgroundColor: "#12172A" },
  fila: { flexDirection: "row", justifyContent: "space-between" },
});
