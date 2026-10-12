import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { FallaRepaso } from "@/lib/practica/repaso";
import { vibrar } from "~/lib/efectos";
import { color, conAlfa, fuente } from "~/tema";
import Boton3D from "./Boton3D";
import Hoja from "./Hoja";
import Tarjeta from "./Tarjeta";
import Texto from "./Texto";
import TextoMate from "./TextoMate";

// Repaso de errores al terminar una partida (pedido 2026-10-12): cada pregunta fallada
// se toca y abre un panel con lo que contestaste, la respuesta correcta y cómo se
// resuelve paso a paso. Los pasos los arma el generador (@/lib/practica/repaso).

function Recuadro({ titulo, valor, tono }: { titulo: string; valor: string; tono: string }) {
  return (
    <View style={[styles.recuadro, { borderColor: conAlfa(tono, 0.45), backgroundColor: conAlfa(tono, 0.1) }]}>
      <Texto v="micro" c={tono}>
        {titulo}
      </Texto>
      <TextoMate texto={valor} v="fuerte" estilo={{ fontSize: 17 }} />
    </View>
  );
}

export default function RepasoErrores({ fallos, acento }: { fallos: FallaRepaso[]; acento: string }) {
  const [abierto, setAbierto] = useState<number | null>(null);
  if (fallos.length === 0) return null;
  const f = abierto != null ? fallos[abierto] : null;

  return (
    <>
      <Tarjeta relleno={12} sinEntrada>
        <View style={styles.cabecera}>
          <Texto v="h3">Repasa tus errores</Texto>
          <Texto v="nota" tam={12}>
            Toca uno para ver cómo se resuelve
          </Texto>
        </View>
        {fallos.map((x, i) => (
          <Pressable
            key={i}
            onPress={() => {
              vibrar.seleccion();
              setAbierto(i);
            }}
            style={({ pressed }) => [styles.fila, i === fallos.length - 1 && { borderBottomWidth: 0 }, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel={`Ver cómo se resuelve la pregunta ${i + 1}`}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <TextoMate texto={x.enunciado} v="fuerte" estilo={{ fontSize: 14 }} />
              <Texto v="nota" tam={12} numberOfLines={1}>
                <Texto v="nota" tam={12} c={color.error} style={{ textDecorationLine: "line-through" }}>
                  {x.tuRespuesta ?? "Sin responder"}
                </Texto>
                {"  →  "}
                <Texto v="nota" tam={12} c={color.correcto}>
                  {x.correcta}
                </Texto>
              </Texto>
            </View>
            <Texto v="mono" c={acento}>
              ›
            </Texto>
          </Pressable>
        ))}
      </Tarjeta>

      <Hoja visible={f != null} onCerrar={() => setAbierto(null)}>
        {f && abierto != null && (
          <>
            <Texto v="micro" c={acento}>
              Pregunta {abierto + 1} de {fallos.length}
            </Texto>
            <TextoMate texto={f.enunciado} v="h3" />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Recuadro titulo="Tu respuesta" valor={f.tuRespuesta ?? "Sin responder"} tono={color.error} />
              <Recuadro titulo="La correcta" valor={f.correcta} tono={color.correcto} />
            </View>
            {f.pasos.length > 0 ? (
              <View style={styles.pasos}>
                <Texto v="micro" c={color.texto2}>
                  Cómo se resuelve
                </Texto>
                {f.pasos.map((p, i) => (
                  <View key={i} style={styles.paso}>
                    <View style={[styles.numero, { backgroundColor: conAlfa(acento, 0.2) }]}>
                      <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 12, color: acento }}>{i + 1}</Texto>
                    </View>
                    <TextoMate texto={p} estilo={{ flex: 1, fontSize: 14.5, lineHeight: 21 }} />
                  </View>
                ))}
              </View>
            ) : (
              <Texto v="nota">Esta pregunta todavía no tiene el paso a paso. Fíjate en la respuesta correcta y vuelve a intentarla en la próxima partida.</Texto>
            )}
            <View style={{ flexDirection: "row", gap: 10 }}>
              {abierto > 0 && <Boton3D titulo="Anterior" variante="secundario" tamano="sm" estilo={{ flex: 1 }} onPress={() => setAbierto(abierto - 1)} />}
              {abierto < fallos.length - 1 ? (
                <Boton3D titulo="Siguiente" tamano="sm" acento={acento} estilo={{ flex: 1 }} onPress={() => setAbierto(abierto + 1)} />
              ) : (
                <Boton3D titulo="Entendido" tamano="sm" acento={acento} estilo={{ flex: 1 }} onPress={() => setAbierto(null)} />
              )}
            </View>
          </>
        )}
      </Hoja>
    </>
  );
}

const styles = StyleSheet.create({
  cabecera: { gap: 2, paddingHorizontal: 2, paddingBottom: 6 },
  fila: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 2, borderBottomWidth: 1, borderBottomColor: color.border },
  recuadro: { flex: 1, gap: 4, padding: 12, borderRadius: 14, borderWidth: 1 },
  pasos: { gap: 10, padding: 14, borderRadius: 16, backgroundColor: color.surface2 },
  paso: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  numero: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", marginTop: 1 },
});
