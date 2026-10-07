import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeOutUp, SlideInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rechazarDuelo } from "~/lib/competir";
import { sonar, vibrar } from "~/lib/efectos";
import { leerPreferencias, permisoConcedido } from "~/lib/notificaciones";
import { supabase } from "~/lib/supabase";
import { color, conAlfa, mundoDe } from "~/tema";
import Boton3D from "./Boton3D";
import AvatarMarco from "./placa/AvatarMarco";
import Texto from "./Texto";

// Aviso de «te retaron a un duelo» (mismo canal que NotificacionesDuelo.tsx de la
// web: cualquier fila nueva de `duels` donde yo soy el retado). Con la app abierta
// aparece arriba con Aceptar y Rechazar, suena, vibra, y además deja el aviso en la
// barra de notificaciones del teléfono (tocarlo abre el duelo dentro de la app).
// Con la app cerrada, el aviso lo manda el push del servidor (notify-duelo).
interface Reto {
  duelId: string;
  mundo: string;
  retadorNombre: string;
  retadorAvatar: string | null;
}

async function avisoEnLaBarra(r: Reto) {
  try {
    const prefs = await leerPreferencias();
    if (!prefs.categorias.includes("duelos") || !(await permisoConcedido())) return;
    const m = mundoDe(r.mundo);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚔️ ${r.retadorNombre} te retó a un duelo`,
        body: `${m?.nombre ?? "Duelo"} · Toca para aceptarlo`,
        data: { tipo: "duelo", duelId: r.duelId, local: true },
        color: "#FF5D5D",
      },
      trigger: { channelId: "duelos" },
    });
  } catch {
    // Sin permiso o sin canal: queda el aviso dentro de la app.
  }
}

export default function AvisoDuelo({ userId }: { userId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [reto, setReto] = useState<Reto | null>(null);

  useEffect(() => {
    const canal = supabase
      .channel(`retos-a:${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "duels", filter: `retado_id=eq.${userId}` }, async (payload) => {
        const fila = payload.new as { id: string; mundo: string; retador_id: string; estado: string };
        if (fila.estado !== "pendiente") return;
        const { data } = await supabase.from("profiles").select("display_name, avatar_url").eq("id", fila.retador_id).maybeSingle();
        const p = data as { display_name: string | null; avatar_url: string | null } | null;
        const nuevo: Reto = { duelId: fila.id, mundo: fila.mundo, retadorNombre: p?.display_name ?? "Alguien", retadorAvatar: p?.avatar_url ?? null };
        setReto(nuevo);
        sonar("notificacion");
        vibrar.fuerte();
        avisoEnLaBarra(nuevo);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [userId]);

  // Se cierra solo al minuto (el reto sigue en Inicio y en Competir).
  useEffect(() => {
    if (!reto) return;
    const t = setTimeout(() => setReto(null), 60_000);
    return () => clearTimeout(t);
  }, [reto]);

  if (!reto) return null;
  const m = mundoDe(reto.mundo);
  const acento = m?.neon ?? color.primario;
  return (
    <View style={[styles.capa, { top: insets.top + 8 }]} pointerEvents="box-none">
      <Animated.View key={reto.duelId} entering={SlideInUp.springify().damping(16)} exiting={FadeOutUp.duration(200)} style={[styles.tarjeta, { borderColor: conAlfa(acento, 0.7), boxShadow: `0px 10px 34px ${conAlfa(acento, 0.35)}` }]}>
        <View style={styles.fila}>
          <AvatarMarco url={reto.retadorAvatar} nombre={reto.retadorNombre} tam={40} animar={false} />
          <View style={{ flex: 1 }}>
            <Texto v="fuerte" tam={15}>
              ⚔️ {reto.retadorNombre} te retó
            </Texto>
            <Texto v="nota" tam={12} c={acento}>
              {m?.nombre ?? "Duelo"} · tienes 24 horas para aceptarlo
            </Texto>
          </View>
        </View>
        <View style={styles.fila}>
          <Boton3D
            titulo="Rechazar"
            variante="secundario"
            tamano="sm"
            estilo={{ flex: 1 }}
            onPress={async () => {
              const id = reto.duelId;
              setReto(null);
              await rechazarDuelo(id);
            }}
          />
          <Boton3D
            titulo="Aceptar"
            tamano="sm"
            acento={m?.base}
            brillo
            estilo={{ flex: 1 }}
            onPress={() => {
              const id = reto.duelId;
              setReto(null);
              router.push({ pathname: "/duelo/[id]", params: { id } });
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  capa: { position: "absolute", left: 12, right: 12, zIndex: 50 },
  tarjeta: { backgroundColor: color.surface2, borderRadius: 20, borderWidth: 1.5, padding: 14, gap: 12 },
  fila: { flexDirection: "row", alignItems: "center", gap: 10 },
});
