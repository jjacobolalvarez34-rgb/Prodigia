import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { TICKETS_PRO_INICIALES, leerTicketsPro, usarTicketClase } from "@/lib/aprender/ticketsPro";
import { useSesion } from "~/lib/sesion";
import { supabase } from "~/lib/supabase";
import Boton3D from "~/ui/Boton3D";
import { PantallaApilada } from "~/ui/Pantalla";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, conAlfa } from "~/tema";

// Clase Pro bloqueada (prueba con tickets, migración 0310): la misma pantalla que
// /clase-pro de la web. Muestra cuántos tickets quedan y deja gastar uno en esta
// clase; sin tickets, «Para continuar, hazte Pro». Sin la migración, va a Pro.
export default function ClasePro() {
  const router = useRouter();
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const { id, nombre, mundo, slug } = useLocalSearchParams<{ id: string; nombre: string; mundo: string; slug: string }>();
  const [tickets, setTickets] = useState<number | null | undefined>(undefined);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!userId) return;
    leerTicketsPro(supabase as never, userId).then((n) => {
      if (n === null) router.replace("/pro");
      else setTickets(n);
    });
  }, [userId, router]);

  async function usar() {
    if (!id) return;
    setCargando(true);
    setError(false);
    const r = await usarTicketClase(supabase as never, id);
    if (r?.desbloqueada) {
      router.replace({ pathname: "/aprender/[mundo]/[slug]", params: { mundo, slug } });
      return;
    }
    setCargando(false);
    if (r) setTickets(r.restantes);
    else setError(true);
  }

  const texto =
    tickets === 0 ? "No te quedan tickets de prueba" : tickets === 1 ? "Te queda 1 ticket de prueba" : `Te quedan ${tickets} tickets de prueba`;

  return (
    <PantallaApilada titulo="Clase Pro">
      {tickets === undefined ? (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <ActivityIndicator color={color.logro} />
        </View>
      ) : (
        <Tarjeta acento={color.logro}>
          <View style={{ gap: 14, alignItems: "center" }}>
            <Texto v="micro">Clase Pro</Texto>
            <Texto v="h2" centro>
              {nombre}
            </Texto>
            <View style={styles.fila}>
              {Array.from({ length: Math.max(TICKETS_PRO_INICIALES, tickets ?? 0) }, (_, i) => (
                <View key={i} style={[styles.ticket, i < (tickets ?? 0) ? styles.lleno : styles.vacio]} />
              ))}
            </View>
            <Texto v="fuerte" centro>
              {texto}
            </Texto>
            {(tickets ?? 0) > 0 ? (
              <>
                <Texto v="nota" centro>
                  Usa un ticket para abrir esta clase gratis. Queda abierta para ti para siempre.
                </Texto>
                <Boton3D titulo="Usar 1 ticket" variante="pro" onPress={usar} cargando={cargando} deshabilitado={cargando} />
                <Boton3D titulo="O hazte Pro y ábrelas todas" variante="secundario" tamano="sm" onPress={() => router.push("/pro")} />
              </>
            ) : (
              <>
                <Texto v="h3" centro>
                  Para continuar, hazte Pro
                </Texto>
                <Boton3D titulo="Hazte Pro" variante="pro" onPress={() => router.replace("/pro")} />
              </>
            )}
            {error && (
              <Texto v="nota" c={color.error} centro>
                No se pudo usar el ticket. Inténtalo de nuevo.
              </Texto>
            )}
          </View>
        </Tarjeta>
      )}
    </PantallaApilada>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", gap: 10 },
  ticket: { width: 44, height: 28, borderRadius: 6, borderWidth: 2 },
  lleno: { backgroundColor: color.logro, borderColor: conAlfa("#000000", 0.35) },
  vacio: { borderStyle: "dashed", borderColor: color.border, backgroundColor: "transparent" },
});
