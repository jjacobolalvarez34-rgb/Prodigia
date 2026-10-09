import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, useSharedValue } from "react-native-reanimated";
import {
  CAPSULAS,
  CATALOGO_NUEVO,
  CIUDADES,
  ciudadDe,
  COLOR_RAREZA,
  coloresCapsula,
  NOMBRE_RAREZA,
  PREMIOS_CALENDARIO,
  textoMision,
  textoPremio,
  textoPremioCalendario,
  type Rareza,
  type TipoCapsula,
} from "@/lib/recompensas/catalogo";
import { COMO_SE_ENCIENDEN, ESTRELLAS_POR_CONSTELACION, misConstelaciones, TEXTO_FUGAZ, textoPremioConstelacion, type Constelacion as DatosConstelacion } from "@/lib/recompensas/constelaciones";
import { sonar, vibrar } from "~/lib/efectos";
import { fijarChispas, useJugador } from "~/lib/jugador";
import {
  contenidoCapsula,
  mensajeError,
  miCalendario,
  misCapsulas,
  misColecciones,
  misMisiones,
  misRegalos,
  recargarPendientes,
  reclamarCalendario,
  reclamarMision,
  recibirRegalo,
  revisarRecompensas,
  type Capsula as DatosCapsula,
  type ContenidoCapsula,
  type EstadoCalendario,
  type Mision,
  type PiezaColeccion,
  type Regalo,
} from "~/lib/recompensas";
import { supabase } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Barra from "~/ui/Barra";
import Boton3D from "~/ui/Boton3D";
import Hoja from "~/ui/Hoja";
import { IconoCheck, IconoChispa, IconoCopo, IconoEscudo, IconoReloj } from "~/ui/Iconos";
import { PantallaApilada, TituloSeccion, Vacio } from "~/ui/Pantalla";
import AbrirCapsula from "~/ui/recompensas/AbrirCapsula";
import Capsula from "~/ui/recompensas/Capsula";
import CelebracionPremio from "~/ui/recompensas/CelebracionPremio";
import ContadorAlineacion from "~/ui/ContadorAlineacion";
import Constelacion from "~/ui/recompensas/Constelacion";
import VistaCosmetico from "~/ui/recompensas/VistaCosmetico";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { color, conAlfa, fuente, mundoDe } from "~/tema";

// Recompensas (docs/economy/PROPUESTA_TIENDA_Y_RECOMPENSAS.md, igual que
// /recompensas en la web): constelaciones de las 15 ciudades (0259, en vez de las
// cápsulas), cápsulas que queden por abrir, calendario de 7 días, misiones del día,
// regalos de amigos y colecciones por ciudad. Todo lo decide la base (0249/0259).

function CapsulaQuieta({ tipo, mundo }: { tipo: TipoCapsula; mundo: string | null }) {
  const abierta = useSharedValue(0);
  return <Capsula abierta={abierta} colores={coloresCapsula(tipo, mundo)} tam={54} />;
}

function detalleCapsula(c: DatosCapsula): string {
  const d = c.detalle;
  const ciudad = ciudadDe(c.mundo)?.nombre;
  if (c.tipo === "nivel" && d?.nivel) return `Nivel ${d.nivel}`;
  if (c.tipo === "racha" && d?.dias) return `${d.dias} días de racha`;
  if (c.tipo === "racha") return "Día 7 del calendario";
  if (c.tipo === "ciudad" && d?.dominio) return `Técnicas de ${ciudad}`;
  if (c.tipo === "ciudad" && d?.nivel) return `${ciudad} nivel ${d.nivel}`;
  if (c.tipo.startsWith("liga") && d?.puesto) return `Puesto ${d.puesto} de la liga`;
  if (c.tipo === "coleccion") return `Colección de ${ciudad}`;
  if (c.tipo === "misiones") return "Las 3 misiones de hoy";
  return "Por jugar hoy";
}

const NOMBRE_CATEGORIA: Record<string, string> = { marco: "Marco", fondo: "Fondo", estela: "Estela", efecto: "Efecto", emote: "Emote", titulo: "Título" };

export default function Recompensas() {
  const router = useRouter();
  const { esInvitado } = useJugador();
  const [capsulas, setCapsulas] = useState<DatosCapsula[] | null>(null);
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [calendario, setCalendario] = useState<EstadoCalendario | null>(null);
  const [regalos, setRegalos] = useState<Regalo[]>([]);
  const [colecciones, setColecciones] = useState<PiezaColeccion[]>([]);
  const [constelaciones, setConstelaciones] = useState<DatosConstelacion[]>([]);
  const [verComo, setVerComo] = useState(false);
  const [abriendo, setAbriendo] = useState<DatosCapsula | null>(null);
  // Premio reclamado (calendario o misión) que se está celebrando.
  const [celebrando, setCelebrando] = useState<{ tipo: "calendario"; dia: number; premio: string; cantidad: number } | { tipo: "mision"; chispas: number; completas: boolean } | null>(null);
  const [verContenido, setVerContenido] = useState<{ capsula: DatosCapsula; filas: ContenidoCapsula[] } | null>(null);
  const [verCiudad, setVerCiudad] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [sinBase, setSinBase] = useState(false);

  const cargar = useCallback(async () => {
    try {
      await revisarRecompensas(supabase);
      const [c, m, cal, r, col, cons] = await Promise.all([misCapsulas(supabase), misMisiones(supabase), miCalendario(supabase), misRegalos(supabase), misColecciones(supabase), misConstelaciones(supabase)]);
      setConstelaciones(cons);
      setCapsulas(c);
      setMisiones(m);
      setCalendario(cal);
      setRegalos(r);
      setColecciones(col);
      setSinBase(!cal && c.length === 0 && m.length === 0);
      recargarPendientes();
    } catch {
      setCapsulas([]);
      setSinBase(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!esInvitado) cargar();
    }, [cargar, esInvitado])
  );

  const porCiudad = useMemo(() => {
    const m = new Map<string, PiezaColeccion[]>();
    for (const p of colecciones) m.set(p.mundo, [...(m.get(p.mundo) ?? []), p]);
    return m;
  }, [colecciones]);

  async function ver(c: DatosCapsula) {
    vibrar.seleccion();
    const filas = await contenidoCapsula(supabase, c.tipo);
    setVerContenido({ capsula: c, filas });
  }

  async function accion(clave: string, f: () => Promise<void>) {
    setOcupado(clave);
    try {
      await f();
      await cargar();
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    } finally {
      setOcupado(null);
    }
  }

  if (esInvitado) {
    return (
      <PantallaApilada titulo="Recompensas">
        <Vacio titulo="Crea tu cuenta" texto="Las cápsulas, misiones y el calendario son para cuentas registradas." />
      </PantallaApilada>
    );
  }

  const totalPeso = verContenido ? verContenido.filas.reduce((a, f) => a + f.peso, 0) : 1;

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <PantallaApilada titulo="Recompensas" subtitulo="Todo se gana jugando">
        {sinBase && (
          <Tarjeta acento={color.racha}>
            <Texto v="h3">Todavía no está listo</Texto>
            <Texto v="nota">Las recompensas se activan apenas el servidor se actualice. Mientras tanto, sigue jugando: lo que hagas hoy cuenta.</Texto>
          </Tarjeta>
        )}

        {constelaciones.length > 0 && (
          <>
            <TituloSeccion>Constelaciones</TituloSeccion>
            <Pressable onPress={() => setVerComo(true)} hitSlop={6}>
              <Texto v="nota" tam={12}>
                Cada partida enciende estrellas en el cielo de su ciudad. Con 7, la constelación se dibuja y te da su premio.{" "}
                <Texto v="nota" tam={12} c={color.primarioClaro}>
                  ¿Cómo funciona?
                </Texto>
              </Texto>
            </Pressable>
            <ContadorAlineacion />
            <View style={styles.grilla}>
              {[...constelaciones]
                .sort((a, b) => Number(b.favorita) - Number(a.favorita) || b.estrellas - a.estrellas)
                .map((c, i) => {
                  const m = mundoDe(c.mundo);
                  return (
                    <Animated.View key={c.mundo} entering={FadeInDown.delay(i * 30).duration(240)} style={[styles.celda, { alignItems: "center" }]}>
                      <Constelacion mundo={c.mundo} estrellas={c.estrellas} tam={98} />
                      <Texto v="fuerte" tam={11.5} centro numberOfLines={1}>
                        {c.de_noche ? "☾ " : ""}
                        {m?.nombre ?? c.mundo}
                        {c.favorita ? " ★" : ""}
                      </Texto>
                      <Texto v="nota" tam={10.5} centro numberOfLines={1}>
                        {c.estrellas}/{ESTRELLAS_POR_CONSTELACION} · {c.chispas_premio} Chispas{c.falta_pieza ? " + pieza" : ""}
                      </Texto>
                    </Animated.View>
                  );
                })}
            </View>
            <Texto v="nota" tam={11}>
              ☾ De noche en esa ciudad: +20 %. ★ Tu ciudad favorita: ahí caen las estrellas de niveles, racha, misiones y liga.
            </Texto>
          </>
        )}

        {(capsulas ?? []).length > 0 && <TituloSeccion>Cápsulas por abrir</TituloSeccion>}
        {(capsulas ?? []).length === 0 ? null : (
          <View style={styles.grilla}>
            {(capsulas ?? []).map((c, i) => (
              <Animated.View key={c.id} entering={FadeInDown.delay(i * 50).duration(260)} style={styles.celda}>
                <Pressable
                  onPress={() => {
                    vibrar.medio();
                    setAbriendo(c);
                  }}
                  style={({ pressed }) => [styles.capsula, { borderColor: conAlfa(coloresCapsula(c.tipo, c.mundo)[0], 0.7) }, pressed && { transform: [{ scale: 0.95 }] }]}
                >
                  <CapsulaQuieta tipo={c.tipo} mundo={c.mundo} />
                  <Texto v="fuerte" tam={11.5} centro numberOfLines={2}>
                    {CAPSULAS[c.tipo]?.nombre ?? "Cápsula"}
                  </Texto>
                  <Texto v="nota" tam={10.5} centro numberOfLines={1}>
                    {detalleCapsula(c)}
                  </Texto>
                </Pressable>
                <Pressable onPress={() => ver(c)} hitSlop={8}>
                  <Texto v="nota" tam={11} c={color.primarioClaro} centro>
                    ¿Qué puede salir?
                  </Texto>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        )}

        <TituloSeccion>Calendario de 7 días</TituloSeccion>
        <Tarjeta>
          <View style={styles.calendario}>
            {PREMIOS_CALENDARIO.map((p) => {
              const hecho = !!calendario && (calendario.reclamado_hoy ? p.dia <= calendario.dia : p.dia < calendario.dia);
              const hoy = !!calendario && p.dia === calendario.dia;
              return (
                <View key={p.dia} style={[styles.dia, hoy && { borderColor: color.logro, backgroundColor: conAlfa(color.logro, 0.12) }, hecho && { opacity: 0.55 }]}>
                  <Texto v="micro" tam={10}>
                    Día {p.dia}
                  </Texto>
                  <View style={{ height: 26, alignItems: "center", justifyContent: "center" }}>
                    {hecho ? (
                      <IconoCheck tam={20} c={color.correcto} />
                    ) : p.premio === "chispas" ? (
                      <IconoChispa tam={20} />
                    ) : p.premio === "hielo" ? (
                      <IconoCopo tam={18} c="#BDEBFF" />
                    ) : p.premio === "tiempo_extra" ? (
                      <IconoReloj tam={18} c={color.logro} />
                    ) : (
                      <Texto style={{ fontSize: 18 }}>✦</Texto>
                    )}
                  </View>
                  <Texto v="nota" tam={9.5} centro numberOfLines={2}>
                    {textoPremioCalendario(p)}
                  </Texto>
                </View>
              );
            })}
          </View>
          {calendario && !calendario.reclamado_hoy ? (
            calendario.puede_reclamar ? (
              <Boton3D
                titulo={`Reclamar el día ${calendario.dia}`}
                variante="logro"
                brillo
                cargando={ocupado === "calendario"}
                onPress={() =>
                  accion("calendario", async () => {
                    const r = await reclamarCalendario(supabase);
                    fijarChispas(r.puntos_total);
                    setCelebrando({ tipo: "calendario", dia: r.dia, premio: r.premio, cantidad: r.cantidad });
                  })
                }
              />
            ) : (
              <Texto v="nota" centro>
                Juega una partida hoy para reclamar el día {calendario.dia}.
              </Texto>
            )
          ) : calendario ? (
            <Texto v="nota" centro>
              Vuelve mañana por el día {calendario.dia === 7 ? 1 : calendario.dia + 1}. Si faltas un día, vuelve a empezar (un congelamiento de racha lo cubre).
            </Texto>
          ) : null}
        </Tarjeta>

        <TituloSeccion>Misiones de hoy</TituloSeccion>
        {misiones.map((m) => {
          const lista = m.progreso >= m.meta;
          return (
            <Tarjeta key={m.tipo} acento={lista && !m.reclamada ? color.correcto : undefined} brillo={lista && !m.reclamada ? 0.2 : 0}>
              <View style={styles.fila}>
                <View style={{ flex: 1, gap: 6 }}>
                  <Texto v="fuerte">{textoMision(m.tipo, m.meta, m.mundo)}</Texto>
                  <Barra valor={m.progreso / m.meta} acento={lista ? color.correcto : color.primario} />
                  <Texto v="nota" tam={11}>
                    {m.progreso} / {m.meta}
                  </Texto>
                </View>
                {m.reclamada ? (
                  <IconoCheck tam={24} c={color.correcto} />
                ) : (
                  <Pressable
                    disabled={!lista || ocupado === m.tipo}
                    onPress={() =>
                      accion(m.tipo, async () => {
                        const r = await reclamarMision(supabase, m.tipo);
                        fijarChispas(r.puntos_total);
                        setCelebrando({ tipo: "mision", chispas: m.recompensa, completas: r.capsula });
                      })
                    }
                    style={[styles.reclamar, !lista && { opacity: 0.4 }]}
                  >
                    <IconoChispa tam={14} />
                    <Texto v="mono" tam={13} c={color.logro}>
                      {m.recompensa}
                    </Texto>
                  </Pressable>
                )}
              </View>
            </Tarjeta>
          );
        })}
        <Texto v="nota" tam={11.5}>
          Completa las 3 y enciendes 2 estrellas en tu ciudad favorita.
        </Texto>

        {regalos.length > 0 && (
          <>
            <TituloSeccion>Regalos de tus amigos</TituloSeccion>
            {regalos.map((r) => (
              <Tarjeta key={r.id} acento={color.logro}>
                <View style={styles.fila}>
                  {r.tipo === "hielo" ? <IconoCopo tam={28} c="#BDEBFF" /> : <IconoEscudo tam={30} />}
                  <View style={{ flex: 1 }}>
                    <Texto v="fuerte">{r.nombre ?? "Un amigo"} te regaló {r.tipo === "hielo" ? "un hielo" : "un escudo"}</Texto>
                  </View>
                  <Boton3D
                    titulo="Recibir"
                    variante="secundario"
                    cargando={ocupado === r.id}
                    onPress={() =>
                      accion(r.id, async () => {
                        await recibirRegalo(supabase, r.id);
                        sonar("recompensa");
                      })
                    }
                  />
                </View>
              </Tarjeta>
            ))}
          </>
        )}

        <TituloSeccion>Colecciones por ciudad</TituloSeccion>
        <Texto v="nota" tam={11.5}>
          6 piezas por ciudad: marco, fondo, estela, efecto, emote y título. Complétala y ganas su marco animado.
        </Texto>
        <View style={styles.grilla}>
          {CIUDADES.map((c) => {
            const piezas = porCiudad.get(c.slug) ?? [];
            const tengo = piezas.filter((p) => p.tengo).length;
            return (
              <Pressable key={c.slug} onPress={() => setVerCiudad(c.slug)} style={({ pressed }) => [styles.ciudad, { borderColor: conAlfa(c.color, tengo === 6 ? 1 : 0.45) }, pressed && { transform: [{ scale: 0.96 }] }]}>
                <Texto style={{ fontFamily: fuente.display, fontSize: 18, color: c.color }}>{c.glifo}</Texto>
                <Texto v="fuerte" tam={11} centro numberOfLines={1}>
                  {c.nombre}
                </Texto>
                <Barra valor={tengo / 6} acento={c.color} alto={5} />
                <Texto v="nota" tam={10}>
                  {tengo}/6
                </Texto>
              </Pressable>
            );
          })}
        </View>
        <View style={{ height: 20 }} />
      </PantallaApilada>

      <Hoja visible={!!verContenido} onCerrar={() => setVerContenido(null)}>
        {verContenido && (
          <View style={{ gap: 10 }}>
            <Texto v="h2">{CAPSULAS[verContenido.capsula.tipo]?.nombre}</Texto>
            <Texto v="nota">Qué puede salir y con qué probabilidad. Si sale algo que ya tienes, se convierte en Chispas. Cada 10 cápsulas sin nada raro, la siguiente trae uno seguro.</Texto>
            {verContenido.filas.map((f) => (
              <View key={f.premio} style={styles.fila}>
                <Texto v="cuerpo" style={{ flex: 1 }}>
                  {textoPremio(f.premio, f.minimo, f.maximo, verContenido.capsula.mundo)}
                </Texto>
                <Texto v="mono" c={color.logro}>
                  {Math.round((f.peso / totalPeso) * 100)} %
                </Texto>
              </View>
            ))}
          </View>
        )}
      </Hoja>

      <Hoja visible={verComo} onCerrar={() => setVerComo(false)}>
        <View style={{ gap: 10 }}>
          <Texto v="h2">Constelaciones</Texto>
          {COMO_SE_ENCIENDEN.map((t) => (
            <View key={t} style={{ flexDirection: "row", gap: 8 }}>
              <Texto c={color.logro}>✦</Texto>
              <Texto v="cuerpo" tam={14} style={{ flex: 1 }}>
                {t}
              </Texto>
            </View>
          ))}
          <Texto v="nota">{TEXTO_FUGAZ}</Texto>
          {constelaciones.length > 0 && (
            <Texto v="nota">
              Ahora mismo, tu próxima en {mundoDe(constelaciones.find((c) => c.favorita)?.mundo ?? "numeria")?.nombre}: {textoPremioConstelacion(constelaciones.find((c) => c.favorita) ?? constelaciones[0], mundoDe(constelaciones.find((c) => c.favorita)?.mundo ?? "numeria")?.nombre ?? "")}.
            </Texto>
          )}
        </View>
      </Hoja>

      <Hoja visible={!!verCiudad} onCerrar={() => setVerCiudad(null)}>
        {verCiudad && (
          <View style={{ gap: 10 }}>
            <Texto v="h2">Colección de {ciudadDe(verCiudad)?.nombre}</Texto>
            {(porCiudad.get(verCiudad) ?? []).map((p) => {
              const it = CATALOGO_NUEVO.find((x) => x.item === p.slug);
              const categoria = it?.categoria ?? p.categoria;
              const valor = it?.valor ?? p.slug.replace(/^marco_/, "");
              return (
                <View key={p.slug} style={[styles.fila, !p.tengo && { opacity: 0.6 }]}>
                  <View style={styles.pieza}>
                    <VistaCosmetico categoria={categoria} valor={valor} tam={36} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Texto v="fuerte">{p.nombre}</Texto>
                    <Texto v="nota" tam={11}>
                      {NOMBRE_CATEGORIA[p.categoria] ?? p.categoria} · <Texto v="nota" tam={11} c={COLOR_RAREZA[p.rareza as Rareza]}>{NOMBRE_RAREZA[p.rareza as Rareza]}</Texto> · {p.vendible ? "en la tienda" : "al completar constelaciones de esta ciudad"}
                    </Texto>
                  </View>
                  {p.tengo ? <IconoCheck tam={22} c={color.correcto} /> : null}
                </View>
              );
            })}
            <Boton3D
              titulo="Ir a la tienda"
              variante="secundario"
              onPress={() => {
                setVerCiudad(null);
                router.push("/tienda");
              }}
            />
          </View>
        )}
      </Hoja>

      {celebrando?.tipo === "calendario" && (
        <CelebracionPremio
          colorPremio={celebrando.premio === "hielo" ? "#7FD8FF" : celebrando.premio === "estrellas" ? "#B07CFF" : color.logro}
          icono={celebrando.premio === "hielo" ? <IconoCopo tam={56} c="#BDEBFF" /> : celebrando.premio === "tiempo_extra" ? <IconoReloj tam={56} c={color.logro} /> : celebrando.premio === "estrellas" ? <Texto style={{ fontSize: 58, color: "#D9C6FF" }}>✦</Texto> : <IconoChispa tam={60} />}
          etiqueta={`Calendario · día ${celebrando.dia}`}
          titulo={celebrando.premio === "estrellas" ? "¡Estrellas para tu ciudad favorita!" : celebrando.premio === "hielo" ? "¡Hielo para tus partidas!" : celebrando.premio === "tiempo_extra" ? "¡Tiempo extra!" : "¡Premio del día!"}
          cantidad={celebrando.cantidad}
          sufijo={celebrando.premio === "chispas" ? "Chispas" : celebrando.premio === "estrellas" ? "estrellas" : undefined}
          nota={celebrando.dia === 7 ? "¡Completaste la semana! Mañana vuelve a empezar." : `Vuelve mañana por el día ${celebrando.dia + 1}.`}
          grande={celebrando.dia === 7}
          onCerrar={() => setCelebrando(null)}
        />
      )}
      {celebrando?.tipo === "mision" && (
        <CelebracionPremio
          icono={<IconoChispa tam={60} />}
          etiqueta={celebrando.completas ? "Las 3 misiones de hoy" : "Misión cumplida"}
          titulo={celebrando.completas ? "¡Día perfecto!" : "¡Misión cumplida!"}
          cantidad={celebrando.chispas}
          sufijo="Chispas"
          nota={celebrando.completas ? "+2 estrellas en tu ciudad favorita." : undefined}
          grande={celebrando.completas}
          onCerrar={() => setCelebrando(null)}
        />
      )}
      {abriendo && (
        <AbrirCapsula
          capsula={abriendo}
          onCerrar={() => {
            setAbriendo(null);
            cargar();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 10 },
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  celda: { width: "31%", gap: 4 },
  capsula: { alignItems: "center", gap: 4, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 18, borderWidth: 1.5, backgroundColor: color.surface1 },
  calendario: { flexDirection: "row", gap: 4, marginBottom: 10 },
  dia: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface2 },
  reclamar: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: conAlfa(color.logro, 0.6), backgroundColor: conAlfa(color.logro, 0.12) },
  ciudad: { width: "31%", alignItems: "center", gap: 3, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 16, borderWidth: 1.5, backgroundColor: color.surface1 },
  pieza: { width: 48, height: 48, borderRadius: 12, backgroundColor: color.surface2, alignItems: "center", justifyContent: "center" },
});
