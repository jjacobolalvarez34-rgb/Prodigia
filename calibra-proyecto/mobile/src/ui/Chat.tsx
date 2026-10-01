import { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { sonar, vibrar } from "~/lib/efectos";
import { color, conAlfa, fuente } from "~/tema";
import { IconoCerrar, IconoEnviar } from "./Iconos";
import AvatarMarco from "./placa/AvatarMarco";
import Texto from "./Texto";

// Chat de la app (mensajes directos y del clan): burbujas que entran con resorte,
// mantener apretado un mensaje para responderlo, y el campo de texto que sube con el
// teclado.
export interface MensajeChat {
  id: string;
  autorId: string;
  autorNombre: string | null;
  autorAvatar: string | null;
  texto: string;
  creado: string;
  citaTexto: string | null;
  citaAutor: string | null;
}

interface Props {
  mensajes: MensajeChat[];
  miId: string;
  mostrarAutor: boolean;
  enviar: (texto: string, respondeA: MensajeChat | null) => Promise<void>;
  vacio: string;
}

function hora(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function Chat({ mensajes, miId, mostrarAutor, enviar, vacio }: Props) {
  const insets = useSafeAreaInsets();
  const [texto, setTexto] = useState("");
  const [cita, setCita] = useState<MensajeChat | null>(null);
  const [enviando, setEnviando] = useState(false);
  const lista = useRef<FlatList<MensajeChat>>(null);
  const invertidos = mensajes.slice().reverse();

  useEffect(() => {
    lista.current?.scrollToOffset({ offset: 0, animated: true });
  }, [mensajes.length]);

  async function mandar() {
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    setEnviando(true);
    try {
      await enviar(limpio, cita);
      sonar("swoosh");
      setTexto("");
      setCita(null);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <FlatList
        ref={lista}
        data={invertidos}
        inverted
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 14, gap: 8 }}
        ListEmptyComponent={
          <Texto v="nota" centro style={{ transform: [{ scaleY: -1 }], paddingVertical: 30 }}>
            {vacio}
          </Texto>
        }
        renderItem={({ item: m, index }) => {
          const mio = m.autorId === miId;
          const anterior = invertidos[index + 1];
          const agrupado = anterior && anterior.autorId === m.autorId;
          return (
            <Animated.View entering={index < 2 ? FadeInUp.springify().damping(15) : undefined} style={[styles.filaMsg, mio ? { justifyContent: "flex-end" } : null]}>
              {!mio && mostrarAutor && (
                <View style={{ width: 30 }}>{!agrupado && <AvatarMarco url={m.autorAvatar} nombre={m.autorNombre ?? "?"} tam={28} animar={false} />}</View>
              )}
              <Pressable
                onLongPress={() => {
                  vibrar.medio();
                  setCita(m);
                }}
                delayLongPress={300}
                style={[styles.burbuja, mio ? styles.mia : styles.suya]}
              >
                {!mio && mostrarAutor && !agrupado && (
                  <Texto v="fuerte" tam={11} c={color.primarioClaro}>
                    {m.autorNombre ?? "Jugador"}
                  </Texto>
                )}
                {m.citaTexto ? (
                  <View style={styles.cita}>
                    <Texto v="fuerte" tam={11} c={mio ? "#E5DEFF" : color.primarioClaro}>
                      {m.citaAutor ?? ""}
                    </Texto>
                    <Texto v="nota" tam={12} numberOfLines={2} c={mio ? "#E5DEFF" : color.texto2}>
                      {m.citaTexto}
                    </Texto>
                  </View>
                ) : null}
                <Texto v="cuerpo" c={mio ? "#FFFFFF" : color.texto}>
                  {m.texto}
                </Texto>
                <Texto v="nota" tam={10} c={mio ? "rgba(255,255,255,0.7)" : color.texto2} style={{ alignSelf: "flex-end" }}>
                  {hora(m.creado)}
                </Texto>
              </Pressable>
            </Animated.View>
          );
        }}
      />
      {cita && (
        <Animated.View entering={ZoomIn.duration(150)} style={styles.respondiendo}>
          <View style={{ flex: 1 }}>
            <Texto v="fuerte" tam={11} c={color.primarioClaro}>
              Respondiendo a {cita.autorId === miId ? "ti" : cita.autorNombre ?? "Jugador"}
            </Texto>
            <Texto v="nota" tam={12} numberOfLines={1}>
              {cita.texto}
            </Texto>
          </View>
          <Pressable onPress={() => setCita(null)} hitSlop={10}>
            <IconoCerrar tam={16} c={color.texto2} />
          </Pressable>
        </Animated.View>
      )}
      <View style={[styles.caja, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escribe un mensaje…"
          placeholderTextColor={color.texto2}
          multiline
          maxLength={500}
          style={styles.input}
        />
        <Pressable onPress={mandar} disabled={!texto.trim() || enviando} style={[styles.enviar, { opacity: texto.trim() ? 1 : 0.4 }]}>
          <IconoEnviar tam={20} c="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  filaMsg: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  burbuja: { maxWidth: "78%", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
  mia: { backgroundColor: color.primarioBase, borderBottomRightRadius: 6, boxShadow: `0px 4px 14px ${conAlfa(color.primario, 0.3)}` },
  suya: { backgroundColor: color.surface2, borderBottomLeftRadius: 6, borderWidth: 1, borderColor: color.border },
  cita: { borderLeftWidth: 3, borderLeftColor: color.primarioClaro, paddingLeft: 8, paddingVertical: 2, marginBottom: 4, backgroundColor: "rgba(0,0,0,0.18)", borderRadius: 6 },
  respondiendo: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 12, padding: 10, borderRadius: 12, backgroundColor: color.surface2, borderLeftWidth: 3, borderLeftColor: color.primario },
  caja: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: color.border, backgroundColor: color.bg },
  input: { flex: 1, maxHeight: 120, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, color: color.texto, fontFamily: fuente.cuerpo, fontSize: 15 },
  enviar: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.primario, alignItems: "center", justifyContent: "center" },
});
