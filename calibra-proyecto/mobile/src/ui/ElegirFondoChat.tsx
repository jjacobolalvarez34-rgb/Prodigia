import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONDO_CHAT_POR_SLUG, FONDOS_CHAT } from "@/lib/mensajes/fondosChat";
import { sonar, vibrar } from "~/lib/efectos";
import { fijarChispas, useJugador } from "~/lib/jugador";
import { useSesion } from "~/lib/sesion";
import { comprarFondoChat, misFondosChat, ponerFondoChat } from "~/lib/social";
import { mensajeError } from "~/lib/supabase";
import { color, conAlfa } from "~/tema";
import { mostrarAviso } from "./Aviso";
import Boton3D from "./Boton3D";
import FondoChat from "./FondoChat";
import { IconoChispa } from "./Iconos";
import Texto from "./Texto";

function textoError(e: unknown): string {
  const m = mensajeError(e);
  if (m.includes("chispas insuficientes")) return "Te faltan Chispas para este fondo. Juega unas partidas y vuelve.";
  if (m.includes("ya tienes")) return "Ese fondo ya es tuyo.";
  return m;
}

// Hoja para elegir el fondo de la conversación: los que ya compraste se ponen
// gratis; los demás se compran con Chispas y quedan tuyos para cualquier chat.
export default function ElegirFondoChat({ visible, amigoId, nombreAmigo, actual, onCerrar, onPuesto }: { visible: boolean; amigoId: string; nombreAmigo: string; actual: string | null; onCerrar: () => void; onPuesto: (slug: string | null) => void }) {
  const insets = useSafeAreaInsets();
  const { sesion } = useSesion();
  const { resumen, placa } = useJugador();
  const chispas = resumen?.chispas ?? placa?.chispas ?? 0;
  const [mios, setMios] = useState<string[]>([]);
  const [elegido, setElegido] = useState<string>(actual ?? "ninguno");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    if (visible && sesion) misFondosChat(sesion.user.id).then(setMios);
  }, [visible, sesion]);

  const fondo = FONDO_CHAT_POR_SLUG[elegido];
  const loTengo = elegido === "ninguno" || mios.includes(elegido);

  async function confirmar() {
    setOcupado(true);
    try {
      if (!loTengo && fondo) {
        const saldo = await comprarFondoChat(fondo.slug);
        fijarChispas(saldo);
        setMios((m) => [...m, fondo.slug]);
        sonar("moneda");
      }
      await ponerFondoChat(amigoId, elegido);
      vibrar.exito();
      onPuesto(elegido === "ninguno" ? null : elegido);
      onCerrar();
    } catch (e) {
      mostrarAviso(textoError(e), "error");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onCerrar}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.velo}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCerrar} />
        <Animated.View entering={SlideInDown.springify().damping(18)} style={[styles.hoja, { paddingBottom: insets.bottom + 18 }]}>
          <View style={styles.agarre} />
          <View style={styles.entre}>
            <Texto v="h2">Fondo del chat</Texto>
            <View style={styles.saldo}>
              <IconoChispa tam={14} />
              <Texto v="mono" tam={13}>
                {chispas.toLocaleString("es")}
              </Texto>
            </View>
          </View>
          <Texto v="nota">Lo ven los dos: tú y {nombreAmigo}. Lo que compras queda tuyo para cualquier chat.</Texto>
          <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={styles.grilla} showsVerticalScrollIndicator={false}>
            <Pressable onPress={() => setElegido("ninguno")} style={[styles.opcion, elegido === "ninguno" && styles.elegida]}>
              <View style={[styles.muestra, { backgroundColor: color.bg }]} />
              <Texto v="fuerte" tam={12.5}>
                Sin fondo
              </Texto>
              <Texto v="nota" tam={11}>
                Gratis
              </Texto>
            </Pressable>
            {FONDOS_CHAT.map((f) => {
              const mio = mios.includes(f.slug);
              return (
                <Pressable
                  key={f.slug}
                  onPress={() => {
                    vibrar.seleccion();
                    setElegido(f.slug);
                  }}
                  style={[styles.opcion, elegido === f.slug && styles.elegida]}
                >
                  <View style={styles.muestra}>
                    <FondoChat fondo={f} radio={12} />
                    <View style={[styles.burbuja, { alignSelf: "flex-start" }]} />
                    <View style={[styles.burbuja, { alignSelf: "flex-end", backgroundColor: color.primarioBase }]} />
                  </View>
                  <Texto v="fuerte" tam={12.5}>
                    {f.nombre}
                  </Texto>
                  {mio ? (
                    <Texto v="nota" tam={11} c={color.correcto}>
                      Tuyo ✓
                    </Texto>
                  ) : (
                    <View style={styles.precio}>
                      <IconoChispa tam={11} />
                      <Texto v="mono" tam={11.5} c={chispas >= f.precio ? color.logro : color.texto2}>
                        {f.precio}
                      </Texto>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
          {!loTengo && fondo && (
            <Texto v="nota" tam={12} centro>
              Se descuentan {fondo.precio} Chispas{chispas < fondo.precio ? ` · te faltan ${fondo.precio - chispas}` : ""}.
            </Texto>
          )}
          <Boton3D
            titulo={loTengo ? (elegido === (actual ?? "ninguno") ? "Es el fondo actual" : elegido === "ninguno" ? "Quitar el fondo" : "Poner en este chat") : `Comprar y poner · ${fondo?.precio ?? 0}`}
            variante={loTengo ? "primario" : "logro"}
            brillo
            cargando={ocupado}
            deshabilitado={elegido === (actual ?? "ninguno") || (!loTengo && !!fondo && chispas < fondo.precio)}
            onPress={confirmar}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  velo: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  hoja: { gap: 10, padding: 20, borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border },
  agarre: { alignSelf: "center", width: 42, height: 5, borderRadius: 3, backgroundColor: color.border },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  saldo: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border },
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingVertical: 4 },
  opcion: { width: "31%", gap: 4, padding: 6, borderRadius: 16, borderWidth: 1.5, borderColor: "transparent", alignItems: "center" },
  elegida: { borderColor: color.primarioNeon, backgroundColor: conAlfa(color.primario, 0.12) },
  muestra: { alignSelf: "stretch", height: 84, borderRadius: 12, overflow: "hidden", padding: 8, gap: 6, justifyContent: "center", borderWidth: 1, borderColor: color.border },
  burbuja: { width: "60%", height: 12, borderRadius: 6, backgroundColor: color.surface3 },
  precio: { flexDirection: "row", alignItems: "center", gap: 3 },
});
