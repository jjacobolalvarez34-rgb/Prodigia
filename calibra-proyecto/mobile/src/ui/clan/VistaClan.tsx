import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  buscarClanes,
  cambiarRol,
  reclamarMision,
  responderInvitacionClan,
  salirDelClan,
  tierDe,
  unirseAClan,
  type DatosClan,
} from "~/lib/clanes";
import { sonar, vibrar } from "~/lib/efectos";
import { fijarChispas } from "~/lib/jugador";
import { mensajeError } from "~/lib/supabase";
import { color, conAlfa, fuente } from "~/tema";
import { mostrarAviso } from "../Aviso";
import Barra from "../Barra";
import Boton3D from "../Boton3D";
import Ciudad from "../Ciudad";
import Confeti from "../Confeti";
import { IconoBuscar, IconoChispa, IconoMapa, IconoMensaje } from "../Iconos";
import { TituloSeccion, Vacio } from "../Pantalla";
import AvatarMarco from "../placa/AvatarMarco";
import Tarjeta from "../Tarjeta";
import Texto from "../Texto";
import Bandera from "./Bandera";

const ROL: Record<string, { texto: string; c: string }> = {
  fundador: { texto: "FUNDADOR", c: color.logro },
  guia: { texto: "GUÍA", c: color.primarioClaro },
  miembro: { texto: "MIEMBRO", c: color.texto2 },
};

function kilo(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(".0", "")}k` : String(n);
}

interface Props {
  datos: DatosClan;
  miId: string;
  noLeidosClan: number;
  invitaciones: { invitacion_id: string; clan_id: string; nombre: string; tag: string | null; color_estandarte: string; nivel_clan: number; invitador_nombre: string | null }[];
  onCambio: () => void;
}

export default function VistaClan({ datos, miId, noLeidosClan, invitaciones, onCambio }: Props) {
  const router = useRouter();
  const [reclamando, setReclamando] = useState(false);
  const [festejo, setFestejo] = useState(false);
  const [consulta, setConsulta] = useState("");
  const [resultados, setResultados] = useState<Awaited<ReturnType<typeof buscarClanes>>>([]);
  const [uniendo, setUniendo] = useState<string | null>(null);
  const { clan, miembros, mision, rival, xpNivel, ranking } = datos;

  async function reclamar() {
    setReclamando(true);
    try {
      const r = await reclamarMision();
      sonar("recompensa");
      vibrar.exito();
      fijarChispas(r.total);
      setFestejo(true);
      setTimeout(() => setFestejo(false), 3500);
      mostrarAviso(`¡+${r.chispas.toLocaleString("es")} Chispas de la misión!`, "logro");
      onCambio();
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    } finally {
      setReclamando(false);
    }
  }

  async function unirse(id: string) {
    setUniendo(id);
    try {
      await unirseAClan(id);
      sonar("recompensa");
      mostrarAviso("¡Ya eres parte del clan!", "ok");
      onCambio();
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    } finally {
      setUniendo(null);
    }
  }

  if (!clan) {
    return (
      <>
        {invitaciones.map((inv) => (
          <Tarjeta key={inv.invitacion_id} acento={inv.color_estandarte} brillo={0.25}>
            <View style={styles.fila}>
              <Bandera c={inv.color_estandarte} />
              <View style={{ flex: 1 }}>
                <Texto v="h3">
                  {inv.nombre} {inv.tag ? <Texto v="nota">[{inv.tag}]</Texto> : null}
                </Texto>
                <Texto v="nota">{inv.invitador_nombre ?? "Alguien"} te invitó · Nv {inv.nivel_clan}</Texto>
              </View>
            </View>
            <View style={[styles.fila, { marginTop: 10 }]}>
              <Boton3D titulo="No, gracias" variante="secundario" tamano="sm" estilo={{ flex: 1 }} onPress={async () => { await responderInvitacionClan(inv.invitacion_id, false); onCambio(); }} />
              <Boton3D titulo="Unirme" tamano="sm" acento={inv.color_estandarte} estilo={{ flex: 1 }} onPress={async () => {
                try {
                  await responderInvitacionClan(inv.invitacion_id, true);
                  sonar("recompensa");
                  onCambio();
                } catch (e) {
                  mostrarAviso(mensajeError(e), "error");
                }
              }} />
            </View>
          </Tarjeta>
        ))}
        <Tarjeta relleno={0} acento={color.racha} brillo={0.2} onPress={() => router.push("/clan/mundo")}>
          <Ciudad semilla="mundo-clanes" acento={color.racha} alto={120} radio={0} />
          <View style={{ padding: 14, gap: 4 }}>
            <Texto v="micro" c={color.racha}>
              Explora
            </Texto>
            <Texto v="h2">Mundo de clanes</Texto>
            <Texto v="nota">Un mapa nocturno con la ciudad de cada clan. Toca una para conocerla o pedir unirte.</Texto>
          </View>
        </Tarjeta>
        <TituloSeccion>Buscar un clan</TituloSeccion>
        <View style={styles.buscador}>
          <IconoBuscar tam={18} c={color.texto2} />
          <TextInput
            value={consulta}
            onChangeText={async (q) => {
              setConsulta(q);
              setResultados(q.trim() ? await buscarClanes(q) : []);
            }}
            placeholder="Nombre o etiqueta del clan"
            placeholderTextColor={color.texto2}
            style={styles.input}
          />
        </View>
        {resultados.map((c, i) => (
          <Animated.View key={c.id} entering={FadeInDown.delay(i * 40)} style={styles.filaClan}>
            <Bandera c={c.color_estandarte} ancho={16} alto={24} quieta />
            <View style={{ flex: 1 }}>
              <Texto v="fuerte" tam={14}>
                {c.nombre} {c.tag ? <Texto v="nota">[{c.tag}]</Texto> : null}
              </Texto>
              <Texto v="nota" tam={11} numberOfLines={1}>
                {c.cantidad_miembros} miembros · {c.descripcion}
              </Texto>
            </View>
            <Boton3D titulo="Unirme" tamano="sm" estilo={{ width: 96 }} cargando={uniendo === c.id} onPress={() => unirse(c.id)} />
          </Animated.View>
        ))}
        <Boton3D titulo="Crear un clan" variante="secundario" onPress={() => router.push("/clan/crear")} />
        <RankingClanes ranking={ranking} />
      </>
    );
  }

  const tier = tierDe(clan.nivel_clan);
  const avanceNivel = xpNivel ? (clan.xp_acumulado_historico - xpNivel.desde) / Math.max(1, xpNivel.hasta - xpNivel.desde) : 0;
  const yo = miembros.find((m) => m.user_id === miId);
  const puedoGestionar = yo?.rol === "fundador";
  const totalGuerra = rival ? rival.mi_xp_semana + rival.xp_semana : 0;

  return (
    <>
      {/* Ciudad del clan: crece con el nivel y cada miembro tiene su casa encendida. */}
      <Animated.View entering={FadeInDown.duration(300)} style={[styles.heroe, { borderColor: conAlfa(clan.color_estandarte, 0.5), boxShadow: `0px 0px 30px ${conAlfa(clan.color_estandarte, 0.2)}` }]}>
        <Ciudad semilla={`clan-${clan.clan_id}`} acento={clan.color_estandarte} alto={164} radio={0} densidad={0.7 + tier.tier * 0.12} sinLuna />
        <View style={styles.casas}>
          {miembros.slice(0, 8).map((m) => (
            <View key={m.user_id} style={[styles.casa, { borderColor: m.rol === "fundador" ? color.logro : clan.color_estandarte }]}>
              <AvatarMarco url={m.avatar_url} nombre={m.display_name ?? "?"} tam={22} animar={false} />
            </View>
          ))}
        </View>
        <View style={styles.heroeTexto}>
          <Bandera c={clan.color_estandarte} />
          <View style={{ flex: 1 }}>
            <Texto v="h3" tam={17}>
              {clan.nombre} {clan.tag ? <Texto v="nota">[{clan.tag}]</Texto> : null}
            </Texto>
            <Texto v="nota" c="#FFD7B5">
              {tier.nombre} · Nivel {clan.nivel_clan} · {clan.cantidad_miembros}/20
            </Texto>
          </View>
        </View>
        <Pressable onPress={() => router.push("/clan/mundo")} style={styles.chipMundo}>
          <IconoMapa tam={14} c={color.texto} />
          <Texto v="fuerte" tam={11}>
            Mundo
          </Texto>
        </Pressable>
      </Animated.View>

      <Tarjeta indice={1} relleno={12}>
        <View style={styles.entre}>
          <Texto v="micro">Nivel del clan</Texto>
          <Texto v="mono" tam={12} c={color.texto2}>
            {xpNivel ? `${(clan.xp_acumulado_historico - xpNivel.desde).toLocaleString("es")} / ${(xpNivel.hasta - xpNivel.desde).toLocaleString("es")} Exp` : ""}
          </Texto>
        </View>
        <Barra valor={avanceNivel} colores={["#C2410C", "#FF8A3D"]} estilo={{ marginTop: 8 }} />
      </Tarjeta>

      {rival && (
        <Tarjeta indice={2} relleno={12}>
          <Texto v="micro" style={{ marginBottom: 8 }}>
            Guerra de la semana
          </Texto>
          <View style={styles.entre}>
            <Texto v="fuerte" tam={12} c={clan.color_estandarte}>
              [{clan.tag ?? clan.nombre.slice(0, 3)}] {rival.mi_xp_semana.toLocaleString("es")}
            </Texto>
            <Texto v="nota">vs</Texto>
            <Texto v="fuerte" tam={12} c={rival.color_estandarte}>
              {rival.xp_semana.toLocaleString("es")} [{rival.tag ?? rival.nombre.slice(0, 3)}]
            </Texto>
          </View>
          <View style={styles.barraGuerra}>
            <Barra valor={1} colores={[clan.color_estandarte, clan.color_estandarte]} alto={10} estilo={{ flex: Math.max(0.05, totalGuerra ? rival.mi_xp_semana / totalGuerra : 0.5), borderRadius: 0 }} />
            <Barra valor={1} colores={[rival.color_estandarte, rival.color_estandarte]} alto={10} sinDestello estilo={{ flex: Math.max(0.05, totalGuerra ? rival.xp_semana / totalGuerra : 0.5), borderRadius: 0 }} />
          </View>
        </Tarjeta>
      )}

      {mision && (
        <Tarjeta indice={3} relleno={12} acento={mision.completada && !mision.reclamada ? color.logro : undefined} brillo={mision.completada && !mision.reclamada ? 0.3 : 0}>
          <View style={styles.entre}>
            <Texto v="h3" tam={14}>
              Misión semanal · {mision.objetivo_cantidad.toLocaleString("es")} Exp
            </Texto>
            <View style={styles.fila}>
              <IconoChispa tam={14} />
              <Texto v="mono" tam={13} c={color.logro}>
                {mision.recompensa_chispas.toLocaleString("es")}
              </Texto>
            </View>
          </View>
          <Barra valor={mision.progreso_actual / Math.max(1, mision.objetivo_cantidad)} colores={["#B87800", "#FFB627"]} estilo={{ marginVertical: 9 }} />
          <Texto v="nota" tam={12}>
            {Math.min(mision.progreso_actual, mision.objetivo_cantidad).toLocaleString("es")} de {mision.objetivo_cantidad.toLocaleString("es")} Exp entre todo el clan
          </Texto>
          {mision.completada && !mision.reclamada && (
            <Boton3D titulo="Reclamar recompensa" variante="logro" tamano="sm" brillo cargando={reclamando} estilo={{ marginTop: 10 }} onPress={reclamar} />
          )}
          {mision.reclamada && (
            <Texto v="nota" c={color.correcto} style={{ marginTop: 6 }}>
              Ya reclamaste la recompensa de esta semana ✓
            </Texto>
          )}
        </Tarjeta>
      )}

      <Tarjeta indice={4} onPress={() => router.push("/clan/chat")} acento={noLeidosClan > 0 ? color.primario : undefined} brillo={noLeidosClan > 0 ? 0.25 : 0}>
        <View style={styles.entre}>
          <View style={styles.fila}>
            <IconoMensaje tam={20} c={color.primarioClaro} />
            <Texto v="h3">Chat del clan</Texto>
          </View>
          {noLeidosClan > 0 ? (
            <View style={styles.badge}>
              <Texto v="mono" tam={11} c="#fff">
                {noLeidosClan}
              </Texto>
            </View>
          ) : (
            <Texto v="nota">›</Texto>
          )}
        </View>
      </Tarjeta>

      <TituloSeccion>Miembros</TituloSeccion>
      <Tarjeta indice={5} relleno={10}>
        {miembros.map((m, i) => (
          <Animated.View key={m.user_id} entering={FadeInDown.delay(i * 35)}>
            <Pressable
              onPress={() => router.push({ pathname: "/jugador/[id]", params: { id: m.user_id } })}
              onLongPress={() => {
                if (!puedoGestionar || m.user_id === miId || m.rol === "fundador") return;
                const nuevo = m.rol === "guia" ? "miembro" : "guia";
                Alert.alert(m.display_name ?? "Miembro", nuevo === "guia" ? "¿Hacerlo Guía del clan?" : "¿Quitarle el rol de Guía?", [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Sí", onPress: async () => { await cambiarRol(m.user_id, nuevo); onCambio(); } },
                ]);
              }}
              style={styles.miembro}
            >
              <AvatarMarco url={m.avatar_url} nombre={m.display_name ?? "?"} tam={32} animar={false} />
              <Texto v="fuerte" tam={14} style={{ flex: 1 }} numberOfLines={1}>
                {m.display_name ?? "Jugador"}
              </Texto>
              <View style={[styles.rol, { backgroundColor: conAlfa(ROL[m.rol].c, 0.16) }]}>
                <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 9, color: ROL[m.rol].c, letterSpacing: 0.5 }}>{ROL[m.rol].texto}</Texto>
              </View>
              <Texto v="mono" tam={12} c={color.texto2} style={{ width: 46, textAlign: "right" }}>
                {kilo(m.xp_aportado)}
              </Texto>
            </Pressable>
          </Animated.View>
        ))}
        {puedoGestionar && (
          <Texto v="nota" tam={11} centro style={{ marginTop: 6 }}>
            Mantén apretado a un miembro para darle o quitarle el rol de Guía.
          </Texto>
        )}
      </Tarjeta>

      <View style={styles.fila}>
        <Boton3D titulo="Invitar amigos" variante="secundario" tamano="sm" estilo={{ flex: 1 }} onPress={() => router.push({ pathname: "/amigos/buscar", params: { invitarClan: "1" } })} />
        <Boton3D
          titulo="Salir"
          variante="peligro"
          tamano="sm"
          estilo={{ flex: 1 }}
          onPress={() =>
            Alert.alert("¿Salir del clan?", puedoGestionar ? "Eres quien lo fundó: si sales, el clan pasa a otro miembro (o se cierra si quedas solo)." : "Puedes volver a unirte después si hay lugar.", [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Salir",
                style: "destructive",
                onPress: async () => {
                  try {
                    await salirDelClan();
                    onCambio();
                  } catch (e) {
                    mostrarAviso(mensajeError(e), "error");
                  }
                },
              },
            ])
          }
        />
      </View>
      <RankingClanes ranking={ranking} miClan={clan.clan_id} />
      {festejo && <Confeti cantidad={44} />}
    </>
  );
}

function RankingClanes({ ranking, miClan }: { ranking: DatosClan["ranking"]; miClan?: string }) {
  const router = useRouter();
  if (ranking.length === 0) return <Vacio titulo="Ningún clan sumó Exp esta semana" />;
  return (
    <>
      <TituloSeccion>Ranking de clanes de la semana</TituloSeccion>
      {ranking.slice(0, 15).map((c, i) => (
        <Animated.View key={c.clan_id} entering={FadeInDown.delay(i * 35)}>
          <Pressable
            onPress={() => router.push({ pathname: "/clan/[id]", params: { id: c.clan_id } })}
            style={[styles.filaClan, c.clan_id === miClan && { borderColor: conAlfa(c.color_estandarte, 0.8), boxShadow: `0px 0px 16px ${conAlfa(c.color_estandarte, 0.35)}` }]}
          >
            <Texto v="mono" c={i === 0 ? color.logro : i === 1 ? "#C9D3E6" : i === 2 ? "#D4925A" : color.texto2} style={{ width: 22, textAlign: "center" }}>
              {i + 1}
            </Texto>
            <Bandera c={c.color_estandarte} ancho={14} alto={22} quieta />
            <View style={{ flex: 1 }}>
              <Texto v="fuerte" tam={14} numberOfLines={1}>
                {c.nombre} {c.tag ? <Texto v="nota">[{c.tag}]</Texto> : null}
              </Texto>
              <Texto v="nota" tam={11}>
                Nv {c.nivel_clan} · {c.cantidad_miembros} miembros
              </Texto>
            </View>
            <Texto v="mono" tam={13}>
              {kilo(c.xp_semana)}
            </Texto>
          </Pressable>
        </Animated.View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  heroe: { height: 164, borderRadius: 20, overflow: "hidden", borderWidth: 1 },
  heroeTexto: { position: "absolute", left: 12, top: 10, right: 90, flexDirection: "row", alignItems: "center", gap: 8 },
  chipMundo: {
    position: "absolute",
    right: 10,
    top: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 1,
    borderColor: color.border,
  },
  casas: { position: "absolute", left: 10, right: 10, bottom: 8, flexDirection: "row", justifyContent: "space-around" },
  casa: { borderRadius: 14, borderWidth: 2, padding: 1, backgroundColor: "#2A2150", boxShadow: "0px 0px 10px rgba(255,138,61,0.5)" },
  barraGuerra: { flexDirection: "row", height: 10, borderRadius: 999, overflow: "hidden", marginTop: 8 },
  badge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: color.primario, alignItems: "center", justifyContent: "center" },
  miembro: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: color.border },
  rol: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  buscador: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border, borderRadius: 14, paddingHorizontal: 12 },
  input: { flex: 1, color: color.texto, fontFamily: "Inter_500Medium", fontSize: 15, paddingVertical: 11 },
  filaClan: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 14, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border },
});
