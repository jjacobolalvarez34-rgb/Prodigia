import { useFocusEffect, useRouter, type Href } from "expo-router";
import { useCallback, useState, type ReactNode } from "react";
import { Pressable, Share, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { vibrar } from "~/lib/efectos";
import { URL_WEB } from "~/lib/entorno";
import { recargarJugador, useJugador } from "~/lib/jugador";
import { nivelesDeMundos } from "~/lib/mundos";
import { useSesion } from "~/lib/sesion";
import { supabase } from "~/lib/supabase";
import Barra from "~/ui/Barra";
import { IconoChispa, IconoCompartir, IconoDerecha, IconoEngranaje, IconoLapiz, IconoTienda, IconoTrofeo } from "~/ui/Iconos";
import { PantallaPestana, TituloSeccion } from "~/ui/Pantalla";
import { PlacaCompleta, type ExtraCompleta } from "~/ui/placa/Placa";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, conAlfa, fuente, MUNDOS } from "~/tema";

function BotonIcono({ children, onPress, etiqueta }: { children: ReactNode; onPress: () => void; etiqueta: string }) {
  return (
    <Pressable
      onPress={() => {
        vibrar.seleccion();
        onPress();
      }}
      style={styles.botonIcono}
      accessibilityLabel={etiqueta}
      hitSlop={6}
    >
      {children}
    </Pressable>
  );
}

function Item({ titulo, icono, onPress, extra, indice }: { titulo: string; icono: ReactNode; onPress: () => void; extra?: ReactNode; indice: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(120 + indice * 50)}>
      <Pressable
        onPress={() => {
          vibrar.seleccion();
          onPress();
        }}
        style={({ pressed }) => [styles.item, pressed && { backgroundColor: color.surface2 }]}
      >
        <View style={styles.itemIcono}>{icono}</View>
        <Texto v="fuerte" style={{ flex: 1 }}>
          {titulo}
        </Texto>
        {extra}
        <IconoDerecha tam={16} c={color.texto2} />
      </Pressable>
    </Animated.View>
  );
}

export default function Perfil() {
  const router = useRouter();
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const { placa, plan, esInvitado, resumen } = useJugador();
  const [extra, setExtra] = useState<ExtraCompleta>({});
  const [niveles, setNiveles] = useState<Record<string, number>>({});

  const cargar = useCallback(async () => {
    if (!userId) return;
    await recargarJugador();
    const { data: p } = await supabase.from("profiles").select("nivel_cuenta, xp_historico_total").eq("id", userId).single();
    const nivel = (p as { nivel_cuenta: number } | null)?.nivel_cuenta ?? 1;
    const xp = Number((p as { xp_historico_total: number } | null)?.xp_historico_total ?? 0);
    const [{ data: a }, { data: b }, { data: pos }, nv] = await Promise.all([
      supabase.rpc("xp_requerido_nivel_cuenta", { p_nivel: nivel }),
      supabase.rpc("xp_requerido_nivel_cuenta", { p_nivel: nivel + 1 }),
      supabase.rpc("posicion_ranking_experiencia_historica"),
      nivelesDeMundos(userId),
    ]);
    const umbral = Number(a ?? 0);
    const siguiente = Number(b ?? umbral + 1);
    const fila = (pos as { posicion: number; total_jugadores: number }[] | null)?.[0];
    setExtra({
      xpNivel: { actual: xp - umbral, requerido: Math.max(1, siguiente - umbral) },
      xpHistorica: xp,
      posicion: fila ? { pos: Number(fila.posicion), total: Number(fila.total_jugadores) } : null,
    });
    setNiveles(nv);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const favoritos = MUNDOS.filter((m) => niveles[m.slug])
    .sort((x, y) => (niveles[y.slug] ?? 0) - (niveles[x.slug] ?? 0))
    .slice(0, 4);

  return (
    <PantallaPestana
      onRefrescar={cargar}
      hudDerecha={
        <View style={styles.fila}>
          <BotonIcono etiqueta="Editar placa" onPress={() => router.push("/editar-placa")}>
            <IconoLapiz tam={16} c={color.texto2} />
          </BotonIcono>
          <BotonIcono
            etiqueta="Compartir placa"
            onPress={() => Share.share({ message: `¡Mira mi Placa en Prodigia! ${placa?.nombre ?? ""} · ${URL_WEB}/perfil/${userId}` })}
          >
            <IconoCompartir tam={16} c={color.texto2} />
          </BotonIcono>
        </View>
      }
    >
      {placa && <PlacaCompleta placa={placa} extra={extra} />}

      {esInvitado && (
        <Tarjeta acento={color.logro} brillo={0.25}>
          <Texto v="h3">Guarda tu progreso</Texto>
          <Texto v="nota">Estás como invitado. Crea tu cuenta en la web para no perder tu racha ni tus Chispas.</Texto>
        </Tarjeta>
      )}

      {favoritos.length > 0 && (
        <>
          <TituloSeccion>Ciudades favoritas</TituloSeccion>
          <Tarjeta relleno={12}>
            {favoritos.map((m, i) => (
              <View key={m.slug} style={[styles.ciudad, i === favoritos.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.glifo, { backgroundColor: conAlfa(m.base, 0.25) }]}>
                  <Texto style={{ fontFamily: fuente.mono, color: m.neon, fontSize: 16 }}>{m.glifo}</Texto>
                </View>
                <View style={{ flex: 1, gap: 5 }}>
                  <View style={styles.entre}>
                    <Texto v="fuerte" tam={14}>
                      {m.nombre}
                    </Texto>
                    <Texto v="mono" tam={13} c={m.neon}>
                      Nv {niveles[m.slug]}
                    </Texto>
                  </View>
                  <Barra valor={(niveles[m.slug] ?? 1) / 100} acento={m.base} alto={6} sinDestello />
                </View>
              </View>
            ))}
          </Tarjeta>
        </>
      )}

      <Tarjeta relleno={4} indice={2}>
        <Item indice={0} titulo="Logros y títulos" icono={<IconoTrofeo tam={18} c={color.logro} />} onPress={() => router.push("/logros")} />
        <Item
          indice={1}
          titulo="Tienda"
          icono={<IconoTienda tam={18} c={color.primarioClaro} />}
          onPress={() => router.push("/tienda")}
          extra={
            <View style={styles.fila}>
              <IconoChispa tam={14} />
              <Texto v="mono" tam={12}>
                {(resumen?.chispas ?? placa?.chispas ?? 0).toLocaleString("es")}
              </Texto>
            </View>
          }
        />
        <Item
          indice={2}
          titulo="Prodigia Pro"
          icono={<Texto style={{ fontFamily: fuente.display, color: color.logro, fontSize: 13 }}>PRO</Texto>}
          onPress={() => router.push("/pro" as Href)}
          extra={plan === "pro" ? <Texto v="nota" c={color.correcto}>Activo</Texto> : null}
        />
        <Item indice={3} titulo="Ajustes y cuenta" icono={<IconoEngranaje tam={18} c={color.texto2} />} onPress={() => router.push("/ajustes")} />
      </Tarjeta>
    </PantallaPestana>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 6 },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  botonIcono: { width: 36, height: 36, borderRadius: 18, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border, alignItems: "center", justifyContent: "center" },
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, paddingVertical: 13, borderRadius: 14 },
  itemIcono: { width: 34, height: 34, borderRadius: 10, backgroundColor: color.surface2, alignItems: "center", justifyContent: "center" },
  ciudad: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: color.border },
  glifo: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
