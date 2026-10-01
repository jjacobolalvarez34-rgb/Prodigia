import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { tierDe, unirseAClan, verClanPublico } from "~/lib/clanes";
import { sonar } from "~/lib/efectos";
import { mensajeError, supabase } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import Bandera from "~/ui/clan/Bandera";
import Ciudad from "~/ui/Ciudad";
import { PantallaApilada, TituloSeccion } from "~/ui/Pantalla";
import { PlacaFila } from "~/ui/placa/Placa";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { placaBasica } from "~/lib/placa";
import { conAlfa } from "~/tema";

type Clan = NonNullable<Awaited<ReturnType<typeof verClanPublico>>>;

// La ciudad de otro clan: nivel, miembros y pedir unirse.
export default function ClanPublico() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [clan, setClan] = useState<Clan | null>(null);
  const [miembros, setMiembros] = useState<{ user_id: string; display_name: string | null; avatar_url: string | null; rol: string; xp_aportado: number }[]>([]);
  const [miClan, setMiClan] = useState<string | null>(null);
  const [uniendo, setUniendo] = useState(false);

  const cargar = useCallback(async () => {
    if (!id) return;
    const [c, { data: m }, { data: mio }] = await Promise.all([verClanPublico(id), supabase.rpc("miembros_de_clan", { p_clan_id: id }), supabase.rpc("mi_clan")]);
    setClan(c);
    setMiembros((m as typeof miembros | null) ?? []);
    setMiClan((mio as { clan_id: string }[] | null)?.[0]?.clan_id ?? null);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  if (!clan) {
    return (
      <PantallaApilada titulo="Clan">
        <Texto v="nota">Cargando…</Texto>
      </PantallaApilada>
    );
  }
  const tier = tierDe(clan.nivel_clan);
  const lleno = clan.cantidad_miembros >= clan.capacidad;

  return (
    <PantallaApilada titulo={clan.nombre} subtitulo={`${tier.nombre} · Nivel ${clan.nivel_clan}`} onRefrescar={cargar}>
      <View style={[styles.heroe, { borderColor: conAlfa(clan.color_estandarte, 0.5) }]}>
        <Ciudad semilla={`clan-${clan.clan_id}`} acento={clan.color_estandarte} alto={160} radio={0} densidad={0.7 + tier.tier * 0.12} />
        <View style={styles.heroeTexto}>
          <Bandera c={clan.color_estandarte} />
          <Texto v="h3" tam={17}>
            {clan.nombre} {clan.tag ? <Texto v="nota">[{clan.tag}]</Texto> : null}
          </Texto>
        </View>
      </View>
      <Tarjeta>
        <Texto v="cuerpo">{clan.descripcion || "Este clan todavía no tiene descripción."}</Texto>
        <Texto v="nota" style={{ marginTop: 6 }}>
          {clan.cantidad_miembros}/{clan.capacidad} miembros · 🏆 {clan.guerras_ganadas} guerras ganadas
        </Texto>
      </Tarjeta>
      {!miClan && (
        <Boton3D
          titulo={lleno ? "Clan lleno" : "Unirme"}
          acento={clan.color_estandarte}
          brillo
          deshabilitado={lleno}
          cargando={uniendo}
          onPress={async () => {
            setUniendo(true);
            try {
              await unirseAClan(clan.clan_id);
              sonar("recompensa");
              mostrarAviso(`¡Ya eres parte de ${clan.nombre}!`, "logro");
              await cargar();
            } catch (e) {
              mostrarAviso(mensajeError(e), "error");
            } finally {
              setUniendo(false);
            }
          }}
        />
      )}
      <TituloSeccion>Miembros</TituloSeccion>
      {miembros.map((m, i) => (
        <PlacaFila
          key={m.user_id}
          placa={placaBasica(m.user_id, m.display_name, { avatarUrl: m.avatar_url })}
          indice={i}
          valor={m.rol === "fundador" ? "Fundador" : m.rol === "guia" ? "Guía" : undefined}
        />
      ))}
    </PantallaApilada>
  );
}

const styles = StyleSheet.create({
  heroe: { height: 160, borderRadius: 20, overflow: "hidden", borderWidth: 1 },
  heroeTexto: { position: "absolute", left: 12, top: 10, flexDirection: "row", alignItems: "center", gap: 8 },
});
