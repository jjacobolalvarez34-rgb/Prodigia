import { StyleSheet, View } from "react-native";
import { estadoVisible, textoRestante, type AccionReto, type RetoChat } from "@/lib/mensajes/retosChat";
import { color, conAlfa, mundoDe, type MundoSlug } from "~/tema";
import Boton3D from "./Boton3D";
import { IconoCompetir, IconoReloj } from "./Iconos";
import { opcionesDe } from "./RetarAmigo";
import Texto from "./Texto";

const TEXTO_ESTADO = {
  pendiente: "Esperando respuesta",
  aceptada: "Aceptado",
  rechazada: "Rechazado",
  cancelada: "Cancelado",
  vencida: "Venció sin respuesta",
} as const;

// Reto a duelo como mensaje del chat (0298), igual que TarjetaRetoChat de la web:
// ciudad y tema, estado, y los botones que correspondan.
export default function RetoChatTarjeta({
  reto,
  mio,
  nombreAmigo,
  ahora,
  ocupado,
  hora,
  onAccion,
  onIrASala,
}: {
  reto: RetoChat;
  mio: boolean;
  nombreAmigo: string;
  ahora: number;
  ocupado: boolean;
  hora: string;
  onAccion: (accion: AccionReto) => void;
  onIrASala: () => void;
}) {
  const m = mundoDe(reto.mundo);
  const acento = m?.neon ?? color.primario;
  const base = m?.base ?? color.primarioBase;
  const opcion = reto.operationType ?? reto.subTipo;
  const tema = opcion && m ? (opcionesDe(m.slug as MundoSlug).find((o) => o.id === opcion)?.nombre ?? null) : null;
  const estado = estadoVisible(reto, ahora);
  const pendiente = estado === "pendiente";
  const cEstado = estado === "aceptada" ? color.correcto : pendiente ? color.logro : color.texto2;

  return (
    <View style={[styles.tarjeta, { borderColor: conAlfa(acento, 0.6) }, pendiente && { boxShadow: `0px 8px 24px ${conAlfa(acento, 0.3)}` }]}>
      <View style={[styles.cabeza, { backgroundColor: conAlfa(acento, 0.14) }]}>
        <View style={[styles.icono, { backgroundColor: base }]}>
          <IconoCompetir tam={20} c="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Texto v="micro">Reto a duelo</Texto>
          <Texto v="fuerte" tam={14} numberOfLines={1}>
            {mio ? `Retaste a ${nombreAmigo}` : `${nombreAmigo} te retó`}
          </Texto>
          <Texto v="fuerte" tam={12} c={acento} numberOfLines={1}>
            {m?.nombre ?? "Duelo"}
            {tema ? ` · ${tema}` : ""}
          </Texto>
        </View>
      </View>
      <View style={styles.cuerpo}>
        <View style={styles.entre}>
          <View style={[styles.chip, { borderColor: conAlfa(cEstado, 0.45), backgroundColor: conAlfa(cEstado, 0.12) }]}>
            {pendiente && <IconoReloj tam={12} c={cEstado} />}
            <Texto v="fuerte" tam={11} c={cEstado}>
              {pendiente ? `Vence en ${textoRestante(reto, ahora)}` : TEXTO_ESTADO[estado]}
            </Texto>
          </View>
          <Texto v="nota" tam={10}>
            {hora}
          </Texto>
        </View>
        {pendiente && !mio && (
          <View style={styles.fila}>
            <Boton3D titulo="Rechazar" variante="secundario" tamano="sm" estilo={{ flex: 1 }} deshabilitado={ocupado} onPress={() => onAccion("rechazar")} />
            <Boton3D titulo="Aceptar" tamano="sm" acento={base} brillo estilo={{ flex: 1 }} cargando={ocupado} onPress={() => onAccion("aceptar")} />
          </View>
        )}
        {pendiente && mio && (
          <>
            <View style={styles.fila}>
              <Boton3D titulo="Cancelar" variante="secundario" tamano="sm" estilo={{ flex: 1 }} deshabilitado={ocupado} onPress={() => onAccion("cancelar")} />
              <Boton3D titulo="Ir a la sala" tamano="sm" acento={base} estilo={{ flex: 1 }} onPress={onIrASala} />
            </View>
            <Texto v="nota" tam={11}>
              Esperando a {nombreAmigo}. Si sales de la sala, el reto se cancela.
            </Texto>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: { width: "85%", maxWidth: 340, borderRadius: 18, borderWidth: 1.5, backgroundColor: color.surface2, overflow: "hidden" },
  cabeza: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10 },
  icono: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cuerpo: { gap: 8, paddingHorizontal: 10, paddingBottom: 10, paddingTop: 8 },
  entre: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  fila: { flexDirection: "row", gap: 8 },
});
