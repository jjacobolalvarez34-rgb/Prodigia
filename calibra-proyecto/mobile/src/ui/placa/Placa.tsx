import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { vibrar } from "~/lib/efectos";
import { divisionDeElo, infoMarco, rangoDeElo, type PlacaDatos } from "~/lib/placa";
import { brillo, color, conAlfa, fuente } from "~/tema";
import { ciudadDe } from "@/lib/recompensas/catalogo";
import { MUNDO_POR_SLUG, type MundoSlug } from "~/tema";
import Barra from "../Barra";
import Ciudad from "../Ciudad";
import { IconoChispa } from "../Iconos";
import Texto from "../Texto";
import AvatarMarco from "./AvatarMarco";
import FondoPlaca from "./FondoPlaca";
import InsigniaRango from "./InsigniaRango";
import NombreEstilizado from "./NombreEstilizado";

// Ciudad de la Placa: el skyline del mundo elegido, abajo y detrás del contenido.
function CiudadPlaca({ ciudad, alto, quieta }: { ciudad: string | null | undefined; alto: number; quieta?: boolean }) {
  const c = ciudadDe(ciudad);
  if (!c) return null;
  const m = MUNDO_POR_SLUG[c.slug as MundoSlug];
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { justifyContent: "flex-end", opacity: 0.9 }]}>
      <Ciudad semilla={c.slug} acento={m?.neon ?? c.color} alto={alto} radio={0} quieta={quieta} sinAvion={quieta} sinLuna />
    </View>
  );
}

// La Placa en sus cinco tamaños (02-SISTEMA-VISUAL.md §10.2). Tocar la Placa de otro
// jugador, en cualquier variante, abre su Placa Completa.

function colorMarco(p: PlacaDatos): string {
  const info = infoMarco(p.marco);
  return info.tipo === "ninguno" ? rangoDeElo(p.elo).colorHex : info.color;
}

function Estandarte({ clan }: { clan: NonNullable<PlacaDatos["clan"]> }) {
  return (
    <View style={styles.estandarte}>
      <View style={[styles.bandera, { backgroundColor: clan.color }]} />
      <Texto v="fuerte" tam={12} numberOfLines={1}>
        {clan.nombre}
      </Texto>
      {clan.tag ? (
        <Texto v="nota" tam={12}>
          [{clan.tag}]
        </Texto>
      ) : null}
    </View>
  );
}

export interface ExtraCompleta {
  xpNivel?: { actual: number; requerido: number } | null;
  xpHistorica?: number | null;
  posicion?: { pos: number; total: number } | null;
}

export function PlacaCompleta({ placa, extra, estilo }: { placa: PlacaDatos; extra?: ExtraCompleta; estilo?: StyleProp<ViewStyle> }) {
  const marco = colorMarco(placa);
  const rango = rangoDeElo(placa.elo);
  const div = divisionDeElo(placa.elo);
  const esGif = placa.fondo === "personalizado" && !!placa.fondoUrl && /\.(gif|webp)(\?|$)/i.test(placa.fondoUrl);
  return (
    <Animated.View entering={FadeInDown.duration(300)} style={[styles.completa, { borderColor: marco, boxShadow: brillo(marco, 28, 0.32) }, estilo]}>
      <FondoPlaca fondo={placa.fondo} url={placa.fondoUrl} acento={marco} />
      <CiudadPlaca ciudad={placa.ciudad} alto={110} />
      {esGif && (
        <View style={styles.gif}>
          <Texto style={{ fontFamily: fuente.mono, fontSize: 9, color: "#fff", letterSpacing: 1 }}>GIF</Texto>
        </View>
      )}
      <View style={styles.completaIn}>
        <AvatarMarco url={placa.avatarUrl} nombre={placa.nombre} marco={placa.marco} tam={78} />
        <View style={{ marginTop: 34, gap: 8 }}>
          <NombreEstilizado texto={placa.nombre} fuente={placa.fuente} animacion={placa.animacion} color={placa.colorNombre} tam={28} animar />
          {placa.titulo ? (
            <View style={styles.chipTitulo}>
              <Texto v="fuerte" tam={11}>
                «{placa.titulo}»
              </Texto>
            </View>
          ) : null}
          <View style={styles.filaDatos}>
            <Texto v="fuerte" tam={13} c={rango.colorHex}>
              ☆ {div.nombre}
            </Texto>
            <Texto v="mono" tam={12}>
              {placa.elo} ELO
            </Texto>
            <View style={styles.filaChispas}>
              <IconoChispa tam={14} />
              <Texto v="mono" tam={12}>
                {placa.chispas.toLocaleString("es")}
              </Texto>
            </View>
          </View>
          <View style={styles.vidrio}>
            <View style={styles.entre}>
              <Texto v="h3">Nivel {placa.nivel}</Texto>
              {extra?.xpNivel ? (
                <Texto v="mono" tam={11}>
                  {extra.xpNivel.actual.toLocaleString("es")}/{extra.xpNivel.requerido.toLocaleString("es")} XP
                </Texto>
              ) : null}
            </View>
            <Barra
              valor={extra?.xpNivel ? extra.xpNivel.actual / Math.max(1, extra.xpNivel.requerido) : 0}
              colores={["#FFFFFF", "#FFFFFF"]}
              fondo="rgba(255,255,255,0.15)"
              alto={6}
              estilo={{ marginVertical: 7 }}
            />
            <Texto v="nota" c="#CFD5E6">
              {extra?.xpHistorica != null ? `${extra.xpHistorica.toLocaleString("es")} XP histórica` : "XP histórica"}
              {extra?.posicion ? ` · #${extra.posicion.pos} de ${extra.posicion.total}` : ""}
            </Texto>
          </View>
          {placa.clan ? <Estandarte clan={placa.clan} /> : null}
        </View>
      </View>
    </Animated.View>
  );
}

// Tarjeta (amigos, miembros de clan, podio): cuadrícula de 2 columnas.
export function PlacaTarjeta({ placa, onPress, pie, indice = 0 }: { placa: PlacaDatos; onPress?: () => void; pie?: ReactNode; indice?: number }) {
  const router = useRouter();
  const marco = colorMarco(placa);
  const rango = rangoDeElo(placa.elo);
  return (
    <Animated.View entering={FadeInDown.delay(indice * 60).duration(300)} style={{ flex: 1 }}>
      <Pressable
        onPress={() => {
          vibrar.seleccion();
          if (onPress) onPress();
          else router.push({ pathname: "/jugador/[id]", params: { id: placa.id } });
        }}
        style={({ pressed }) => [styles.tarjeta, { borderColor: marco, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
      >
        <FondoPlaca fondo={placa.fondo} url={placa.fondoUrl} acento={marco} animar={false} />
        <CiudadPlaca ciudad={placa.ciudad} alto={56} quieta />
        <View style={styles.tarjetaIn}>
          <AvatarMarco url={placa.avatarUrl} nombre={placa.nombre} marco={placa.marco} tam={46} animar={false} />
          <NombreEstilizado texto={placa.nombre} fuente={placa.fuente} animacion={placa.animacion} color={placa.colorNombre} tam={15} estilo={{ textAlign: "center" }} ligero />
          <Texto v="nota" tam={11} c="#D6DBEA" numberOfLines={1}>
            {rango.nombre} · Nv {placa.nivel}
          </Texto>
          {pie}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// Fila (ranking, liga, resultados de duelo).
export function PlacaFila({
  placa,
  puesto,
  valor,
  resaltar,
  indice = 0,
  derecha,
}: {
  placa: PlacaDatos;
  puesto?: number;
  valor?: string;
  resaltar?: boolean;
  indice?: number;
  derecha?: ReactNode;
}) {
  const router = useRouter();
  const colorPuesto = puesto === 1 ? color.logro : puesto === 2 ? "#C9D3E6" : puesto === 3 ? "#D4925A" : color.texto2;
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(indice, 12) * 40).duration(300)}>
      <Pressable
        onPress={() => {
          vibrar.seleccion();
          router.push({ pathname: "/jugador/[id]", params: { id: placa.id } });
        }}
        style={({ pressed }) => [
          styles.fila,
          resaltar && { borderColor: conAlfa(color.primario, 0.7), boxShadow: brillo(color.primario, 18, 0.3) },
          { transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        {puesto != null && (
          <Texto v="mono" c={colorPuesto} style={{ width: 26, textAlign: "center" }}>
            {puesto}
          </Texto>
        )}
        <AvatarMarco url={placa.avatarUrl} nombre={placa.nombre} marco={placa.marco} tam={32} animar={false} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <NombreEstilizado texto={placa.nombre} fuente={placa.fuente} animacion={placa.animacion} color={placa.colorNombre} tam={15} ligero />
          {placa.titulo ? (
            <Texto v="nota" tam={11} numberOfLines={1}>
              «{placa.titulo}»
            </Texto>
          ) : null}
        </View>
        {derecha}
        {valor != null && (
          <Texto v="mono" tam={13}>
            {valor}
          </Texto>
        )}
      </Pressable>
    </Animated.View>
  );
}

// VS (pantalla del duelo): las dos placas entran desde los lados.
export function PlacaVS({ placa, lado }: { placa: PlacaDatos; lado: "yo" | "rival" }) {
  const div = divisionDeElo(placa.elo);
  const acento = lado === "yo" ? color.primarioNeon : color.error;
  return (
    <View style={[styles.vs, { flexDirection: lado === "yo" ? "row" : "row-reverse", borderColor: conAlfa(acento, 0.6), boxShadow: brillo(acento, 28, 0.28) }]}>
      <FondoPlaca fondo={placa.fondo} url={placa.fondoUrl} acento={acento} />
      <AvatarMarco url={placa.avatarUrl} nombre={placa.nombre} marco={placa.marco} tam={56} />
      <View style={{ flex: 1, alignItems: lado === "yo" ? "flex-start" : "flex-end", gap: 2 }}>
        <NombreEstilizado texto={placa.nombre} fuente={placa.fuente} animacion={placa.animacion} color={placa.colorNombre} tam={18} animar />
        {placa.titulo ? (
          <Texto v="nota" tam={11}>
            «{placa.titulo}»
          </Texto>
        ) : null}
        <Texto v="nota">
          {div.nombre} ·{" "}
          <Texto v="mono" tam={13}>
            {placa.elo}
          </Texto>
        </Texto>
      </View>
      <InsigniaRango elo={placa.elo} tam={50} />
    </View>
  );
}

// Mini (HUD, chat): avatar + nombre.
export function PlacaMini({ placa, tam = 34 }: { placa: PlacaDatos; tam?: number }) {
  return <AvatarMarco url={placa.avatarUrl} nombre={placa.nombre} marco={placa.marco} tam={tam} animar={false} />;
}

const styles = StyleSheet.create({
  completa: { borderRadius: 22, borderWidth: 2, overflow: "hidden", minHeight: 360 },
  completaIn: { padding: 16, gap: 4 },
  gif: { position: "absolute", top: 10, right: 12, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: "rgba(0,0,0,0.55)" },
  chipTitulo: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.13)" },
  filaDatos: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" },
  filaChispas: { flexDirection: "row", alignItems: "center", gap: 4 },
  vidrio: { backgroundColor: "rgba(18,23,42,0.6)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", borderRadius: 14, padding: 12 },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  estandarte: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(0,0,0,0.35)",
    maxWidth: "100%",
  },
  bandera: { width: 10, height: 18, borderBottomLeftRadius: 1, borderBottomRightRadius: 1 },
  tarjeta: { borderRadius: 16, borderWidth: 1.5, overflow: "hidden", minHeight: 150 },
  tarjetaIn: { flex: 1, padding: 10, gap: 4, alignItems: "center", justifyContent: "flex-end", paddingTop: 24 },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: color.surface1,
    borderWidth: 1,
    borderColor: color.border,
  },
  vs: { borderRadius: 20, padding: 14, alignItems: "center", gap: 12, backgroundColor: color.surface1, borderWidth: 1.5, overflow: "hidden" },
});
