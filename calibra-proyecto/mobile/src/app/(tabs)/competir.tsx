import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import {
  cargarCompetitivo,
  ELO_SOLO_TODAS,
  finDeSemanaUtc,
  MUNDOS_DUELO_APP,
  NIVEL_MINIMO_RANKEDS,
  rankingElo,
  rankingReto,
  rankingSemanal,
  rechazarDuelo,
  textoFaltan,
  type DueloPendiente,
  type FilaHistorial,
  type StatsCasual,
} from "~/lib/competir";
import { vibrar } from "~/lib/efectos";
import { useJugador } from "~/lib/jugador";
import { divisionDeElo, imagenRango, rangoDeElo, type PlacaDatos } from "~/lib/placa";
import { claveDe } from "~/lib/retos";
import { useSesion } from "~/lib/sesion";
import { escucharPresencia } from "~/lib/social";
import Barra from "~/ui/Barra";
import Boton3D from "~/ui/Boton3D";
import { IconoCompetir, IconoFantasma } from "~/ui/Iconos";
import { PantallaPestana, TituloSeccion, Vacio } from "~/ui/Pantalla";
import { PlacaFila } from "~/ui/placa/Placa";
import AvatarMarco from "~/ui/placa/AvatarMarco";
import NombreEstilizado from "~/ui/placa/NombreEstilizado";
import Segmentos from "~/ui/Segmentos";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { brillo, color, conAlfa, fuente, MUNDO_POR_SLUG, mundoDe, type MundoSlug } from "~/tema";

type Seccion = "rankeds" | "casual" | "liga" | "semanal";
type Eleccion = MundoSlug | "aleatorio";

function ChipMundo({ id, activo, onPress }: { id: Eleccion; activo: boolean; onPress: () => void }) {
  const m = id === "aleatorio" ? null : MUNDO_POR_SLUG[id];
  const c = m?.neon ?? color.logro;
  return (
    <Pressable
      onPress={() => {
        vibrar.seleccion();
        onPress();
      }}
      style={[styles.chipMundo, activo && { borderColor: c, backgroundColor: conAlfa(c, 0.12), boxShadow: brillo(c, 12, 0.25) }]}
    >
      <View style={[styles.punto, { backgroundColor: c }]} />
      <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 12, color: activo ? color.texto : color.texto2 }}>{m?.nombre ?? "Todas las ciudades"}</Texto>
    </Pressable>
  );
}

function InsigniaHeroe({ elo }: { elo: number }) {
  const rango = rangoDeElo(elo);
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withRepeat(withSequence(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 1500 })), -1));
  }, [t]);
  const halo = useAnimatedStyle(() => ({ opacity: 0.3 + t.value * 0.5, transform: [{ scale: 0.9 + t.value * 0.15 }] }));
  const flota = useAnimatedStyle(() => ({ transform: [{ translateY: -4 * t.value }] }));
  return (
    <View style={{ alignItems: "center", justifyContent: "center", height: 110 }}>
      <Animated.View style={[{ position: "absolute", width: 90, height: 90, borderRadius: 45, boxShadow: `0px 0px 40px ${rango.colorHex}` }, halo]} />
      <Animated.View style={flota}>
        <Image source={{ uri: imagenRango(rango.slug) }} style={{ width: 104, height: 104 }} contentFit="contain" />
      </Animated.View>
    </View>
  );
}

function FilaDuelo({ h, indice }: { h: FilaHistorial; indice: number }) {
  const m = mundoDe(h.mundo);
  const signo = h.empate ? "=" : h.gane ? "✓" : "✗";
  const c = h.empate ? color.texto2 : h.gane ? color.correcto : color.error;
  return (
    <Animated.View entering={FadeInDown.delay(indice * 40)} style={styles.filaDuelo}>
      <Texto v="mono" c={c} style={{ width: 18 }}>
        {signo}
      </Texto>
      <View style={{ flex: 1 }}>
        <Texto v="fuerte" tam={14} numberOfLines={1}>
          {h.rival_nombre ?? "Jugador"} {h.rival_es_bot ? "🤖" : ""}
        </Texto>
        <Texto v="nota" tam={11}>
          {m?.nombre ?? h.mundo} · {h.clasificatorio ? "Ranked" : "Casual"}
        </Texto>
      </View>
      <Texto v="mono" tam={13} c={c}>
        {h.mi_puntaje}–{h.rival_puntaje}
      </Texto>
    </Animated.View>
  );
}

function Pendientes({ lista, onCambio }: { lista: DueloPendiente[]; onCambio: () => void }) {
  const router = useRouter();
  if (lista.length === 0) return null;
  return (
    <Tarjeta acento={color.primario} brillo={0.25}>
      <Texto v="micro" c={color.primarioClaro} style={{ marginBottom: 6 }}>
        {lista.length === 1 ? "Te retaron" : `Te retaron ${lista.length} veces`}
      </Texto>
      {lista.map((p) => {
        const m = mundoDe(p.mundo);
        return (
          <View key={p.duel_id} style={[styles.filaDuelo, { borderLeftWidth: 3, borderLeftColor: m?.neon ?? color.primario, paddingLeft: 10 }]}>
            <View style={{ flex: 1 }}>
              <Texto v="fuerte" tam={14}>
                {p.retador_nombre ?? "Alguien"}
              </Texto>
              <Texto v="nota" tam={11}>
                {m?.nombre ?? p.mundo} · {p.retador_elo} ELO
              </Texto>
            </View>
            <Pressable
              onPress={async () => {
                await rechazarDuelo(p.duel_id);
                onCambio();
              }}
              style={styles.miniBoton}
            >
              <Texto v="nota" tam={12}>
                Rechazar
              </Texto>
            </Pressable>
            <Pressable onPress={() => router.push({ pathname: "/duelo/[id]", params: { id: p.duel_id } })} style={[styles.miniBoton, { backgroundColor: m?.base ?? color.primarioBase, borderColor: "transparent" }]}>
              <Texto v="fuerte" tam={12}>
                Jugar
              </Texto>
            </Pressable>
          </View>
        );
      })}
    </Tarjeta>
  );
}

function Podio({ filas, miId }: { filas: { placa: PlacaDatos; xp: number }[]; miId?: string }) {
  const top = filas.slice(0, 3);
  if (top.length === 0) return null;
  const orden = [top[1], top[0], top[2]].filter(Boolean);
  const alturas = { 1: 92, 2: 70, 3: 56 } as Record<number, number>;
  const colores = { 1: color.logro, 2: "#C9D3E6", 3: "#D4925A" } as Record<number, string>;
  return (
    <View style={styles.podio}>
      {orden.map((f) => {
        const puesto = filas.indexOf(f) + 1;
        return (
          <Animated.View key={f.placa.id} entering={FadeInDown.delay(puesto * 120).springify().damping(13)} style={{ flex: 1, alignItems: "center", gap: 6 }}>
            <AvatarMarco url={f.placa.avatarUrl} nombre={f.placa.nombre} marco={f.placa.marco} tam={puesto === 1 ? 58 : 46} />
            <NombreEstilizado texto={f.placa.nombre} fuente={f.placa.fuente} animacion={f.placa.animacion} tam={13} estilo={{ textAlign: "center", maxWidth: 100 }} />
            <Texto v="mono" tam={12} c={colores[puesto]}>
              {f.xp.toLocaleString("es")}
            </Texto>
            <View
              style={[
                styles.escalon,
                { height: alturas[puesto], borderColor: conAlfa(colores[puesto], 0.6), boxShadow: brillo(colores[puesto], 18, f.placa.id === miId ? 0.5 : 0.2) },
              ]}
            >
              <Texto style={{ fontFamily: fuente.display, fontSize: 26, color: colores[puesto] }}>{puesto}</Texto>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

export default function Competir() {
  const router = useRouter();
  const params = useLocalSearchParams<{ seccion?: string }>();
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const { placa, esInvitado } = useJugador();
  const [eleccion, setEleccion] = useState<{ desde: string | undefined; valor: Seccion } | null>(null);
  const seccion: Seccion = eleccion && eleccion.desde === params.seccion ? eleccion.valor : ((params.seccion as Seccion) ?? "rankeds");
  const setSeccion = (valor: Seccion) => setEleccion({ desde: params.seccion, valor });
  const [historial, setHistorial] = useState<FilaHistorial[]>([]);
  const [pendientes, setPendientes] = useState<DueloPendiente[]>([]);
  const [casual, setCasual] = useState<StatsCasual>({ victorias: 0, derrotas: 0, empates: 0 });
  const [mundoElegido, setMundo] = useState<Eleccion>("numeria");
  const [liga, setLiga] = useState<{ placa: PlacaDatos; xp: number }[]>([]);
  const [ligaAmigos, setLigaAmigos] = useState(false);
  const [ligaMundo, setLigaMundo] = useState<string | null>(null);
  const [ranking, setRanking] = useState<PlacaDatos[]>([]);
  const [retoSemanal, setRetoSemanal] = useState<{ placa: PlacaDatos; correctos: number }[]>([]);
  const [enLinea, setEnLinea] = useState(0);


  useEffect(() => escucharPresencia((ids) => setEnLinea(ids.size)), []);

  const elo = placa?.elo ?? 1000;
  const rangoAlto = elo >= ELO_SOLO_TODAS;

  const cargar = useCallback(async () => {
    if (!userId || esInvitado) return;
    await Promise.allSettled([
      cargarCompetitivo().then((c) => {
        setHistorial(c.historial);
        setPendientes(c.pendientes);
        setCasual(c.casual);
      }),
      rankingElo(false).then((r) => setRanking(r.slice(0, 20))),
    ]);
  }, [userId, esInvitado]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  useEffect(() => {
    if (seccion === "liga") rankingSemanal(ligaMundo, ligaAmigos).then(setLiga);
    if (seccion === "semanal") rankingReto("semanal", claveDe("semanal")).then(setRetoSemanal);
  }, [seccion, ligaMundo, ligaAmigos]);

  // Platino+ solo juega Rankeds en todas las ciudades; Casual nunca es "todas".
  const mundo: Eleccion = seccion === "rankeds" && rangoAlto ? "aleatorio" : seccion === "casual" && mundoElegido === "aleatorio" ? "numeria" : mundoElegido;

  if (esInvitado) {
    return (
      <PantallaPestana>
        <Vacio titulo="Competir es para cuentas" texto="Crea tu cuenta para jugar Rankeds, duelos y la liga semanal. Tu progreso de invitado se conserva." />
      </PantallaPestana>
    );
  }

  const competitivo = historial.filter((h) => h.clasificatorio);
  const victorias = competitivo.filter((h) => h.gane).length;
  const derrotas = competitivo.filter((h) => !h.gane && !h.empate).length;
  const jugados = victorias + derrotas;
  let seguidas = 0;
  for (const h of competitivo) {
    if (h.gane) seguidas++;
    else break;
  }
  const div = divisionDeElo(elo);
  const rango = rangoDeElo(elo);
  const bloqueado = (placa?.nivel ?? 1) < NIVEL_MINIMO_RANKEDS;
  const opcionesRankeds: Eleccion[] = rangoAlto ? ["aleatorio"] : [...MUNDOS_DUELO_APP, "aleatorio"];
  const ahora = new Date();

  return (
    <PantallaPestana
      onRefrescar={cargar}
      hudDerecha={
        enLinea > 0 ? (
          <View style={styles.enLinea}>
            <View style={[styles.punto, { backgroundColor: color.correcto }]} />
            <Texto v="nota" tam={11}>
              {enLinea} en línea
            </Texto>
          </View>
        ) : null
      }
    >
      <Segmentos<Seccion>
        opciones={[
          { id: "rankeds", titulo: "Rankeds", insignia: pendientes.length },
          { id: "casual", titulo: "Casual" },
          { id: "liga", titulo: "Liga" },
          { id: "semanal", titulo: "Semanal" },
        ]}
        valor={seccion}
        onCambio={setSeccion}
      />

      {seccion === "rankeds" && (
        <>
          <Pendientes lista={pendientes} onCambio={cargar} />
          <Tarjeta acento={rango.colorHex} brillo={0.18} estilo={{ alignItems: "center", paddingVertical: 18 }}>
            <InsigniaHeroe elo={elo} />
            <Texto v="h2" tam={20}>
              {div.nombre}
            </Texto>
            <Texto v="nota">
              <Texto v="mono" tam={15} c={color.texto}>
                {elo}
              </Texto>{" "}
              ELO{seguidas >= 2 ? ` · ${seguidas} victorias seguidas 🔥` : ""}
            </Texto>
            {div.siguiente && (
              <>
                <Barra valor={div.progreso} colores={[rango.colorHex, "#FFFFFF"]} estilo={{ alignSelf: "stretch", marginTop: 12, marginBottom: 4 }} />
                <Texto v="nota" tam={11}>
                  {div.faltan} ELO para {div.proximo}
                </Texto>
              </>
            )}
          </Tarjeta>

          <View style={styles.fila}>
            {[
              ["Victorias", String(victorias)],
              ["Derrotas", String(derrotas)],
              ["Ganadas", jugados > 0 ? `${Math.round((victorias / jugados) * 100)}%` : "—"],
            ].map(([t, v], i) => (
              <View key={t} style={{ flex: 1 }}>
                <Tarjeta indice={i} estilo={{ alignItems: "center", paddingVertical: 10 }}>
                  <Texto v="mono" tam={18}>
                    {v}
                  </Texto>
                  <Texto v="nota" tam={11}>
                    {t}
                  </Texto>
                </Tarjeta>
              </View>
            ))}
          </View>

          {bloqueado ? (
            <Tarjeta acento={color.primario}>
              <Texto v="h3">Rankeds se desbloquea en el nivel {NIVEL_MINIMO_RANKEDS}</Texto>
              <Texto v="nota">Vas en el nivel {placa?.nivel ?? 1}. Cada partida te acerca: juega en Numeria o Geografía.</Texto>
              <Barra valor={(placa?.nivel ?? 1) / NIVEL_MINIMO_RANKEDS} estilo={{ marginTop: 10 }} />
            </Tarjeta>
          ) : (
            <>
              <View style={[styles.fila, { flexWrap: "wrap" }]}>
                {opcionesRankeds.map((id) => (
                  <ChipMundo key={id} id={id} activo={mundo === id} onPress={() => setMundo(id)} />
                ))}
              </View>
              {(rangoAlto || mundo === "aleatorio") && (
                <Texto v="nota" tam={12}>
                  {rangoAlto ? "Desde Platino, las Rankeds son en todas las ciudades (mejor de 3). " : "Mejor de 3 en ciudades al azar. "}
                  Las rondas de ciudades que todavía no están en la app se juegan en la web.
                </Texto>
              )}
              <Boton3D
                titulo="Buscar duelo"
                icono={<IconoCompetir tam={20} c="#fff" />}
                brillo
                acento={mundo === "aleatorio" ? color.primarioBase : MUNDO_POR_SLUG[mundo].base}
                onPress={() => router.push({ pathname: "/duelo/buscar", params: { mundo, ranked: "1" } })}
              />
            </>
          )}

          <TituloSeccion>Últimos duelos</TituloSeccion>
          <Tarjeta relleno={10}>
            {historial.length === 0 ? (
              <Texto v="nota" centro style={{ paddingVertical: 10 }}>
                Todavía no jugaste duelos. ¡El primero es el más emocionante!
              </Texto>
            ) : (
              historial.slice(0, 8).map((h, i) => <FilaDuelo key={h.duel_id} h={h} indice={i} />)
            )}
          </Tarjeta>

          <TituloSeccion>Top ELO</TituloSeccion>
          {ranking.slice(0, 10).map((p, i) => (
            <PlacaFila key={p.id} placa={p} puesto={i + 1} valor={String(p.elo)} resaltar={p.id === userId} indice={i} />
          ))}
        </>
      )}

      {seccion === "casual" && (
        <>
          <Tarjeta estilo={{ alignItems: "center", gap: 4 }}>
            <IconoFantasma tam={30} c={color.primarioClaro} />
            <Texto v="h3">Duelo casual</Texto>
            <Texto v="nota" centro>
              Un rival al azar, de cualquier rango, sin ELO en juego. Si no hay nadie, corres contra el registro exacto de un rival: siempre hay contra quién jugar.
            </Texto>
            <Texto v="mono" tam={14} style={{ marginTop: 6 }}>
              {casual.victorias}V · {casual.derrotas}D · {casual.empates}E
            </Texto>
          </Tarjeta>
          <View style={styles.fila}>
            {MUNDOS_DUELO_APP.map((id) => (
              <ChipMundo key={id} id={id} activo={mundo === id} onPress={() => setMundo(id)} />
            ))}
          </View>
          <Boton3D
            titulo="Buscar duelo casual"
            brillo
            acento={mundo === "aleatorio" ? color.primarioBase : MUNDO_POR_SLUG[mundo].base}
            onPress={() => router.push({ pathname: "/duelo/buscar", params: { mundo: mundo === "aleatorio" ? "numeria" : mundo, ranked: "0" } })}
          />
          <Boton3D titulo="Retar a un amigo" variante="secundario" tamano="sm" onPress={() => router.push({ pathname: "/social", params: { seccion: "amigos" } })} />
        </>
      )}

      {seccion === "liga" && (
        <>
          <Tarjeta>
            <View style={styles.entre}>
              <View>
                <Texto v="h3">Liga semanal</Texto>
                <Texto v="nota">Exp ganada esta semana · termina en {textoFaltan(finDeSemanaUtc(ahora), ahora)}</Texto>
              </View>
            </View>
          </Tarjeta>
          <Segmentos<"todos" | "amigos">
            opciones={[
              { id: "todos", titulo: "Todos" },
              { id: "amigos", titulo: "Amigos" },
            ]}
            valor={ligaAmigos ? "amigos" : "todos"}
            onCambio={(v) => setLigaAmigos(v === "amigos")}
          />
          <View style={[styles.fila, { flexWrap: "wrap" }]}>
            <Pressable onPress={() => setLigaMundo(null)} style={[styles.chipMundo, ligaMundo === null && { borderColor: color.primario, backgroundColor: conAlfa(color.primario, 0.12) }]}>
              <Texto v="fuerte" tam={12}>
                Todos los mundos
              </Texto>
            </Pressable>
            {MUNDOS_DUELO_APP.map((id) => (
              <ChipMundo key={id} id={id} activo={ligaMundo === id} onPress={() => setLigaMundo(id)} />
            ))}
          </View>
          {liga.length === 0 ? (
            <Vacio titulo="Todavía nadie sumó Exp esta semana" texto="¡Juega una partida y arranca arriba de todo!" />
          ) : (
            <>
              <Podio filas={liga} miId={userId} />
              {liga.slice(3, 50).map((f, i) => (
                <PlacaFila key={f.placa.id} placa={f.placa} puesto={i + 4} valor={f.xp.toLocaleString("es")} resaltar={f.placa.id === userId} indice={i} />
              ))}
            </>
          )}
        </>
      )}

      {seccion === "semanal" && (
        <>
          <Tarjeta acento={color.logro} brillo={0.22}>
            <Texto v="micro" c={color.logro}>
              Reto semanal
            </Texto>
            <Texto v="h2">45 preguntas de tus ciudades</Texto>
            <Texto v="nota">Las mismas para todos. Puedes dejarlo a la mitad y seguir después. Bonus de Chispas por cada acierto.</Texto>
            <Boton3D titulo="Jugar el reto semanal" variante="logro" estilo={{ marginTop: 12 }} onPress={() => router.push({ pathname: "/reto/[tipo]", params: { tipo: "semanal" } })} />
          </Tarjeta>
          <Tarjeta onPress={() => router.push({ pathname: "/reto/[tipo]", params: { tipo: "diario" } })}>
            <View style={styles.entre}>
              <View>
                <Texto v="h3">Reto diario</Texto>
                <Texto v="nota">5 preguntas, se renueva cada día</Texto>
              </View>
              <Texto v="mono" c={color.logro}>
                JUGAR →
              </Texto>
            </View>
          </Tarjeta>
          <TituloSeccion>Ranking del reto semanal</TituloSeccion>
          {retoSemanal.length === 0 ? (
            <Vacio titulo="Nadie lo completó todavía" texto="Sé la primera persona de la semana." />
          ) : (
            retoSemanal.map((f, i) => <PlacaFila key={f.placa.id} placa={f.placa} puesto={i + 1} valor={`${f.correctos}/45`} resaltar={f.placa.id === userId} indice={i} />)
          )}
        </>
      )}
    </PantallaPestana>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  chipMundo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface1,
  },
  punto: { width: 8, height: 8, borderRadius: 4 },
  filaDuelo: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: color.border },
  miniBoton: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: color.border },
  enLinea: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border },
  podio: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingTop: 8 },
  escalon: { alignSelf: "stretch", borderTopLeftRadius: 14, borderTopRightRadius: 14, borderWidth: 1, borderBottomWidth: 0, backgroundColor: color.surface1, alignItems: "center", justifyContent: "center" },
});
