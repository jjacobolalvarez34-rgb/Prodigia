import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { CAPSULAS, CAPSULAS_CON_COMETAS, COLOR_RAREZA, NOMBRE_RAREZA, type Rareza } from "@/lib/recompensas/catalogo";
import { vibrar } from "~/lib/efectos";
import { fijarCometas } from "~/lib/jugador";
import { useRouter } from "expo-router";
import { comprarCapsulaConCometas, contenidoCapsula, mensajeError, recargarPendientes, type Capsula as DatosCapsula, type ContenidoCapsula } from "~/lib/recompensas";
import AbrirCapsula from "../recompensas/AbrirCapsula";
import { supabase } from "~/lib/supabase";
import { color } from "~/tema";
import { mostrarAviso } from "../Aviso";
import Boton3D from "../Boton3D";
import { IconoCometa } from "../Iconos";
import Capsula from "../recompensas/Capsula";
import Texto from "../Texto";

// Cápsulas premium (0287), igual que en la web: solo con Cometas, y dos modalidades:
// «Abrir ya» (la animación al momento) o «Guardar» (queda en Recompensas para abrirla
// cuando quieras). Las probabilidades se ven antes de pagar.
function Tarjeta({ tipo, costo, contenido, ocupado, onComprar }: { tipo: "estelar" | "supernova"; costo: number; contenido: ContenidoCapsula[]; ocupado: boolean; onComprar: (abrirYa: boolean) => void }) {
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
        <View style={styles.fila}>
          <IconoCometa tam={16} />
          <Texto v="mono" tam={14} style={{ flex: 1, marginLeft: 4 }}>
            {costo}
          </Texto>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Boton3D titulo="Abrir ya" tamano="sm" cargando={ocupado} onPress={() => onComprar(true)} estilo={{ flex: 1 }} />
          <Boton3D titulo="Guardar" variante="secundario" tamano="sm" deshabilitado={ocupado} onPress={() => onComprar(false)} estilo={{ flex: 1 }} />
        </View>
      </View>
    </View>
  );
}

export default function CapsulasCometas() {
  const [contenido, setContenido] = useState<Record<string, ContenidoCapsula[]>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [guardada, setGuardada] = useState<string | null>(null);
  const [abriendo, setAbriendo] = useState<DatosCapsula | null>(null);
  const router = useRouter();

  useEffect(() => {
    Promise.all(CAPSULAS_CON_COMETAS.map(async (c) => [c.tipo, await contenidoCapsula(supabase, c.tipo)] as const)).then((filas) => setContenido(Object.fromEntries(filas)));
  }, []);

  async function comprar(tipo: "estelar" | "supernova", abrirYa: boolean) {
    vibrar.medio();
    setOcupado(tipo);
    try {
      const r = await comprarCapsulaConCometas(supabase, tipo);
      fijarCometas(r.cometas);
      if (abrirYa) {
        setGuardada(null);
        setAbriendo({ id: r.id, tipo, mundo: null, detalle: null, creada_at: new Date().toISOString() });
      } else {
        setGuardada(CAPSULAS[tipo].nombre);
        recargarPendientes();
      }
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
          Premium · solo con Cometas
        </Texto>
        <Texto v="h2">Cápsulas premium</Texto>
        <Texto v="nota" tam={12.5}>
          Siempre traen un cosmético raro, épico o legendario (si ya lo tienes, se cambia por Chispas). Ábrela ya o guárdala en Recompensas para cuando quieras.
        </Texto>
      </View>
      {CAPSULAS_CON_COMETAS.map((c) => (
        <Tarjeta key={c.tipo} tipo={c.tipo} costo={c.costo} contenido={contenido[c.tipo] ?? []} ocupado={ocupado === c.tipo} onComprar={(abrirYa) => comprar(c.tipo, abrirYa)} />
      ))}
      {abriendo && <AbrirCapsula capsula={abriendo} onCerrar={() => setAbriendo(null)} />}
      {guardada && (
        <View style={{ gap: 8 }}>
          <Texto v="fuerte" c={color.correcto} centro>
            ¡{guardada} guardada en tus Recompensas!
          </Texto>
          <Boton3D titulo="Ir a abrirla" variante="secundario" tamano="sm" onPress={() => router.push("/recompensas")} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", backgroundColor: color.surface1 },
  fila: { flexDirection: "row", justifyContent: "space-between" },
});
