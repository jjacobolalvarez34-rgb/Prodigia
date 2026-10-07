import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { cargarMiClan, reclamarMision, type Mision } from "~/lib/clanes";
import { textoVence, cargarCompetitivo, finDeSemanaUtc, rankingSemanal, rechazarDuelo, textoFaltan, type DueloPendiente } from "~/lib/competir";
import { sonar, vibrar } from "~/lib/efectos";
import { fijarChispas, recargarJugador, useJugador } from "~/lib/jugador";
import { progresoMundo, ultimoJugado, type Continuar, type ProgresoMundo } from "~/lib/mundos";
import { mundoDobleExperiencia, msHastaFinDelEvento } from "@/lib/eventos/dobleExperiencia";
import { recargarPendientes, totalPendientes, usePendientes } from "~/lib/recompensas";
import { estadoRetosHoy } from "~/lib/retos";
import { useSesion } from "~/lib/sesion";
import { sincronizar, useSinConexion } from "~/lib/sinConexion";
import { mensajeError, supabase } from "~/lib/supabase";
import Anillo from "~/ui/Anillo";
import { mostrarAviso } from "~/ui/Aviso";
import Barra from "~/ui/Barra";
import Boton3D from "~/ui/Boton3D";
import Ciudad from "~/ui/Ciudad";
import Destacados, { type NovedadDestacada } from "~/ui/Destacados";
import { IconoChispa, IconoCompetir, IconoLlama } from "~/ui/Iconos";
import NumeroAnimado from "~/ui/NumeroAnimado";
import { PantallaPestana, TituloSeccion } from "~/ui/Pantalla";
import PrimerosPasos from "~/ui/PrimerosPasos";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, conAlfa, MUNDO_POR_SLUG, mundoDe } from "~/tema";

export default function Hoy() {
  const router = useRouter();
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const { placa, resumen, mundos, esInvitado } = useJugador();
  const red = useSinConexion();
  const [continuar, setContinuar] = useState<Continuar | null>(null);
  const [progreso, setProgreso] = useState<ProgresoMundo | null>(null);
  const [retos, setRetos] = useState<{ diario: number | null; semanal: number | null } | null>(null);
  const [mision, setMision] = useState<{ clanId: string; tag: string | null; m: Mision } | null>(null);
  const [liga, setLiga] = useState<{ puesto: number; total: number } | null>(null);
  const [pendientes, setPendientes] = useState<DueloPendiente[]>([]);
  const [novedades, setNovedades] = useState<NovedadDestacada[]>([]);
  const [reclamando, setReclamando] = useState(false);
  const [ahora, setAhora] = useState(() => new Date());
  const recompensas = usePendientes();

  const cargar = useCallback(async () => {
    if (!userId) return;
    setAhora(new Date());
    const tareas: Promise<unknown>[] = [
      recargarJugador(),
      ultimoJugado(userId).then(async (c) => {
        setContinuar(c);
        setProgreso(await progresoMundo(userId, c.mundo));
      }),
      Promise.resolve(supabase.rpc("anuncios_pendientes")).then(({ data }) => setNovedades(((data ?? []) as NovedadDestacada[]).slice().reverse())),
    ];
    if (!esInvitado) {
      tareas.push(
        estadoRetosHoy(userId).then(setRetos),
        cargarMiClan().then((d) => setMision(d.clan && d.mision ? { clanId: d.clan.clan_id, tag: d.clan.tag, m: d.mision } : null)),
        rankingSemanal(null, false).then((r) => {
          const i = r.findIndex((f) => f.placa.id === userId);
          setLiga(i >= 0 ? { puesto: i + 1, total: r.length } : { puesto: 0, total: r.length });
        }),
        cargarCompetitivo().then((c) => setPendientes(c.pendientes)),
        recargarPendientes()
      );
    }
    await Promise.allSettled(tareas);
  }, [userId, esInvitado]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  async function reclamar() {
    setReclamando(true);
    try {
      const r = await reclamarMision();
      sonar("recompensa");
      vibrar.exito();
      fijarChispas(r.total);
      mostrarAviso(`¡+${r.chispas.toLocaleString("es")} Chispas para ti!`, "logro");
      await cargar();
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    } finally {
      setReclamando(false);
    }
  }

  // Invitado recién llegado: sigue la bienvenida (partida de prueba → 2 mundos → cuenta).
  if (esInvitado && !placa) return <View style={{ flex: 1, backgroundColor: color.bg }} />;
  if (placa && mundos.length < 2) return <Redirect href={esInvitado ? "/bienvenida" : "/elegir-mundos"} />;

  const nombre = esInvitado ? "Invitado" : placa?.nombre ?? "…";
  const xpHoy = resumen?.xpHoy ?? 0;
  const meta = Math.max(1, resumen?.metaDiaria ?? 100);
  const fraccionMeta = Math.min(1, xpHoy / meta);
  const partidasFaltan = Math.max(0, Math.ceil((meta - xpHoy) / 120));
  const rachaEnRiesgo = (resumen?.racha ?? 0) > 0 && xpHoy === 0 && ahora.getHours() >= 18;
  const mundoContinuar = continuar ? MUNDO_POR_SLUG[continuar.mundo] : null;
  const finLiga = finDeSemanaUtc(ahora);

  let indice = 0;
  return (
    <PantallaPestana>
      <Texto v="h1">Hola, {nombre}</Texto>

      {(red.sinRed || red.pendientes > 0) && (
        <Tarjeta indice={indice++} acento={color.racha} onPress={() => sincronizar()}>
          <Texto v="h3">{red.sinRed ? "Sin conexión" : "Subiendo tu progreso…"}</Texto>
          <Texto v="nota">
            {red.pendientes > 0
              ? `Tienes ${red.pendientes} ${red.pendientes === 1 ? "respuesta guardada" : "respuestas guardadas"} en el teléfono. Se suben solas cuando vuelva internet (toca para intentar ahora).`
              : "Puedes seguir practicando: tus partidas se guardan en el teléfono. Duelos, tienda y chat necesitan internet."}
          </Texto>
        </Tarjeta>
      )}

      {continuar && mundoContinuar && (
        <Tarjeta indice={indice++} relleno={0} acento={mundoContinuar.neon} brillo={0.18}>
          <Ciudad semilla={mundoContinuar.slug} acento={mundoContinuar.neon} alto={84} radio={0} />
          <View style={{ padding: 14, gap: 10 }}>
            <View style={styles.entre}>
              <View>
                <Texto v="micro" c={mundoContinuar.neon}>
                  Continuar
                </Texto>
                <Texto v="h3">
                  {mundoContinuar.nombre} · {continuar.tema}
                </Texto>
              </View>
              <Texto v="mono" tam={13}>
                Nv {progreso?.nivel ?? 1}
              </Texto>
            </View>
            <Barra valor={progreso?.avance ?? 0} acento={mundoContinuar.base} />
            <Boton3D titulo="Jugar" acento={mundoContinuar.base} brillo onPress={() => router.push(continuar.ruta)} />
          </View>
        </Tarjeta>
      )}

      {!esInvitado && (
        <Animated.View entering={FadeInDown.delay(120).duration(300)} style={[styles.fila, { alignItems: "stretch" }]}>
          <PrimerosPasos />
          <Pressable onPress={() => router.push("/recompensas")} style={({ pressed }) => [styles.chico, totalPendientes(recompensas) > 0 && { borderColor: color.logro, boxShadow: `0px 0px 14px ${conAlfa(color.logro, 0.35)}` }, pressed && { transform: [{ scale: 0.97 }] }]}>
            <View style={styles.entre}>
              <Texto v="micro" c={color.logro}>
                Recompensas
              </Texto>
              {totalPendientes(recompensas) > 0 && (
                <View style={styles.insignia}>
                  <Texto v="mono" tam={11} c="#2A1A00">
                    {totalPendientes(recompensas)}
                  </Texto>
                </View>
              )}
            </View>
            <Texto v="fuerte" tam={13.5}>
              {totalPendientes(recompensas) > 0 ? "Para reclamar 🎁" : "Constelaciones 🎁"}
            </Texto>
            <Texto v="nota" tam={11}>
              Misiones y calendario
            </Texto>
          </Pressable>
        </Animated.View>
      )}

      {rachaEnRiesgo && (
        <Tarjeta indice={indice++} acento={color.racha} brillo={0.3} onPress={() => router.push(continuar?.ruta ?? "/numeria")}>
          <View style={styles.fila}>
            <IconoLlama tam={34} estado="llamas" />
            <View style={{ flex: 1 }}>
              <Texto v="h3">¡Tu racha de {resumen?.racha} días está en riesgo!</Texto>
              <Texto v="nota">Juega una partida antes de medianoche para mantenerla.</Texto>
            </View>
          </View>
        </Tarjeta>
      )}

      {pendientes.slice(0, 2).map((p) => {
        const m = mundoDe(p.mundo);
        return (
          <Tarjeta key={p.duel_id} indice={indice++} acento={m?.neon ?? color.primario} brillo={0.3}>
            <View style={styles.fila}>
              <View style={[styles.iconoCirculo, { backgroundColor: (m?.base ?? color.primario) + "44" }]}>
                <IconoCompetir tam={20} c={m?.neon ?? color.primarioClaro} />
              </View>
              <View style={{ flex: 1 }}>
                <Texto v="h3">{p.retador_nombre ?? "Alguien"} te retó</Texto>
                <Texto v="nota">
                  {m?.nombre ?? p.mundo} · {p.retador_elo} ELO{textoVence(p.expira_at) ? ` · ${textoVence(p.expira_at)}` : ""}
                </Texto>
              </View>
            </View>
            <View style={[styles.fila, { marginTop: 10 }]}>
              <Boton3D
                titulo="Rechazar"
                variante="secundario"
                tamano="sm"
                estilo={{ flex: 1 }}
                onPress={async () => {
                  await rechazarDuelo(p.duel_id);
                  setPendientes((l) => l.filter((x) => x.duel_id !== p.duel_id));
                }}
              />
              <Boton3D titulo="Aceptar" tamano="sm" acento={m?.base} estilo={{ flex: 1 }} onPress={() => router.push({ pathname: "/duelo/[id]", params: { id: p.duel_id } })} />
            </View>
          </Tarjeta>
        );
      })}

      <Tarjeta indice={indice++}>
        <View style={styles.fila}>
          <Anillo valor={fraccionMeta} tam={66} grosor={7} acento={fraccionMeta >= 1 ? color.correcto : color.logro}>
            <Texto v="mono" tam={13}>
              {Math.round(fraccionMeta * 100)}%
            </Texto>
          </Anillo>
          <View style={{ flex: 1, gap: 2 }}>
            <Texto v="h3">{fraccionMeta >= 1 ? "¡Meta del día cumplida!" : "Meta diaria"}</Texto>
            <Texto v="nota">
              <NumeroAnimado valor={xpHoy} v="mono" c={color.texto} estilo={{ fontSize: 13 }} /> / {meta} Exp
              {fraccionMeta < 1 ? ` · ${partidasFaltan} ${partidasFaltan === 1 ? "partida" : "partidas"} más` : " · racha a salvo"}
            </Texto>
          </View>
        </View>
      </Tarjeta>

      {(() => {
        const slugDoble = mundoDobleExperiencia();
        const m = MUNDO_POR_SLUG[slugDoble];
        const horas = Math.floor(msHastaFinDelEvento(ahora) / 3_600_000);
        return (
          <Tarjeta
            indice={indice++}
            acento={color.logro}
            brillo={0.12}
            onPress={() => router.push(slugDoble === "numeria" || slugDoble === "geografia" ? `/${slugDoble}` : { pathname: "/[mundo]", params: { mundo: slugDoble } })}
          >
            <View style={styles.fila}>
              <Texto style={{ fontSize: 26 }}>🪂</Texto>
              <View style={{ flex: 1 }}>
                <Texto v="micro" c={color.logro}>
                  Evento de hoy · termina en {horas} h
                </Texto>
                <Texto v="h3">Doble Exp en {m.nombre}</Texto>
              </View>
            </View>
          </Tarjeta>
        );
      })()}

      {!esInvitado && (
        <View style={styles.fila}>
          <View style={{ flex: 1 }}>
            <Tarjeta indice={indice++} acento={color.logro} brillo={retos?.diario == null ? 0.18 : 0} onPress={() => router.push({ pathname: "/reto/[tipo]", params: { tipo: "diario" } })}>
              <Texto v="h3">Reto diario</Texto>
              <Texto v="nota">5 preguntas</Texto>
              <Texto v="mono" tam={13} c={retos?.diario != null ? color.correcto : color.logro} style={{ marginTop: 8 }}>
                {retos?.diario != null ? `HECHO ${retos.diario}/5 ✓` : "JUGAR →"}
              </Texto>
            </Tarjeta>
          </View>
          <View style={{ flex: 1 }}>
            <Tarjeta indice={indice++} onPress={() => router.push({ pathname: "/reto/[tipo]", params: { tipo: "semanal" } })}>
              <Texto v="h3">Reto semanal</Texto>
              <Texto v="nota">
                <Texto v="mono" tam={13}>
                  {retos?.semanal ?? 0}
                </Texto>
                /45
              </Texto>
              <Barra valor={(retos?.semanal ?? 0) / 45} estilo={{ marginTop: 10 }} />
            </Tarjeta>
          </View>
        </View>
      )}

      {mision && (
        <Tarjeta
          indice={indice++}
          acento={mision.m.completada && !mision.m.reclamada ? color.logro : undefined}
          brillo={mision.m.completada && !mision.m.reclamada ? 0.3 : 0}
          onPress={() => router.push({ pathname: "/social", params: { seccion: "clan" } })}
        >
          <View style={styles.entre}>
            <Texto v="h3">Misión del clan</Texto>
            <Texto v="mono" tam={12} c={color.texto2}>
              {Math.min(mision.m.progreso_actual, mision.m.objetivo_cantidad).toLocaleString("es")}/{mision.m.objetivo_cantidad.toLocaleString("es")} Exp
            </Texto>
          </View>
          <Barra valor={mision.m.progreso_actual / Math.max(1, mision.m.objetivo_cantidad)} colores={["#B87800", "#FFB627"]} estilo={{ marginTop: 9 }} />
          {mision.m.completada && !mision.m.reclamada ? (
            <Boton3D
              titulo={`Reclamar ${mision.m.recompensa_chispas.toLocaleString("es")}`}
              icono={<IconoChispa tam={16} />}
              variante="logro"
              tamano="sm"
              cargando={reclamando}
              estilo={{ marginTop: 12 }}
              onPress={reclamar}
            />
          ) : mision.m.reclamada ? (
            <Texto v="nota" c={color.correcto} style={{ marginTop: 6 }}>
              Recompensa reclamada ✓
            </Texto>
          ) : null}
        </Tarjeta>
      )}

      {liga && liga.total > 0 && (
        <Tarjeta indice={indice++} onPress={() => router.push({ pathname: "/competir", params: { seccion: "liga" } })}>
          <View style={styles.entre}>
            <View>
              <Texto v="h3">Liga semanal {liga.puesto > 0 ? `· #${liga.puesto} de ${liga.total}` : ""}</Texto>
              <Texto v="nota">Termina en {textoFaltan(finLiga, ahora)}</Texto>
            </View>
            <Texto v="mono" c={color.primarioClaro}>
              →
            </Texto>
          </View>
        </Tarjeta>
      )}

      {novedades.length > 0 && (
        <>
          <TituloSeccion>Destacados</TituloSeccion>
          <Destacados novedades={novedades} />
        </>
      )}
    </PantallaPestana>
  );
}

const styles = StyleSheet.create({
  insignia: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: "center", justifyContent: "center", backgroundColor: color.logro },
  chico: { flex: 1, gap: 4, padding: 12, borderRadius: 16, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border },
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  iconoCirculo: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
});

export { default as ErrorBoundary } from "~/ui/PantallaError";
