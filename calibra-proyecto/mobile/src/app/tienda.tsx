import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { msHastaFinDelEvento } from "@/lib/eventos/dobleExperiencia";
import { useFocusEffect, useRouter } from "expo-router";
import { memo, useCallback, useMemo, useState } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import { CATALOGO_NUEVO, diasHastaFinDeMes } from "@/lib/recompensas/catalogo";
import { probarPaqueteAcierto, sonar, vibrar } from "~/lib/efectos";
import { recargarCosmeticos } from "~/lib/recompensas";
import { fijarChispas, recargarJugador, useJugador } from "~/lib/jugador";
import type { PlacaDatos } from "~/lib/placa";
import { useSesion } from "~/lib/sesion";
import { mensajeError } from "~/lib/supabase";
import {
  aLaVenta,
  CATALOGO,
  cantidadUtilidad,
  cargarTienda,
  COLOR_RAREZA,
  comprar,
  descuentoDeHoy,
  equipar,
  guardarColorNombre,
  loTiene,
  loUsa,
  NOMBRE_RAREZA,
  precioDe,
  rarezaDeItem,
  subirFondo,
  tieneSlug,
  type Categoria,
  type EstadoTienda,
  type ItemTienda,
} from "~/lib/tienda";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import Confeti from "~/ui/Confeti";
import Hoja from "~/ui/Hoja";
import { IconoChispa, IconoCopo, IconoEscudo, IconoRayo, IconoReloj } from "~/ui/Iconos";
import NumeroAnimado from "~/ui/NumeroAnimado";
import { BotonAtras, PantallaApilada } from "~/ui/Pantalla";
import AvatarMarco from "~/ui/placa/AvatarMarco";
import FondoPlaca from "~/ui/placa/FondoPlaca";
import NombreEstilizado from "~/ui/placa/NombreEstilizado";
import { PlacaTarjeta } from "~/ui/placa/Placa";
import VistaCosmetico from "~/ui/recompensas/VistaCosmetico";
import Texto from "~/ui/Texto";
import { brillo, color, conAlfa, fuente } from "~/tema";
import { FUENTE_FAMILIA } from "~/lib/placa";

// Una categoría a la vez (antes la tienda dibujaba todo el catálogo junto y se
// trababa): menos cosas en pantalla, y la grilla entra con un fundido.
type Pestana = "utilidad" | "paquetes" | "marcos" | "nombre" | "fondos" | "partida" | "placa" | "duelos";
const PESTANAS: { id: Pestana; titulo: string }[] = [
  { id: "utilidad", titulo: "Utilidades" },
  { id: "paquetes", titulo: "Paquetes" },
  { id: "marcos", titulo: "Marcos" },
  { id: "partida", titulo: "Partida" },
  { id: "nombre", titulo: "Nombre" },
  { id: "fondos", titulo: "Fondos" },
  { id: "placa", titulo: "Placa" },
  { id: "duelos", titulo: "Duelos" },
];
const CATEGORIAS_DE: Record<Pestana, Categoria[]> = {
  utilidad: ["utilidad"],
  paquetes: ["paquete"],
  marcos: ["marco", "marco_mundo"],
  nombre: ["fuente", "animacion", "color"],
  fondos: ["fondo", "galeria"],
  partida: ["estela", "efecto", "sonido"],
  placa: ["ciudad_placa", "titulo"],
  duelos: ["emote"],
};
// Lo que se ve sobre tu Placa (vista previa con la Placa); el resto, con su muestra.
const SOBRE_PLACA: Categoria[] = ["marco", "marco_mundo", "fuente", "animacion", "fondo", "galeria", "color", "ciudad_placa"];
const NOMBRE_DE_SLUG = (slug: string) => CATALOGO.find((x) => x.item === slug)?.nombre ?? CATALOGO_NUEVO.find((x) => x.item === slug)?.nombre ?? slug;

const COLORES_NOMBRE = ["#FFFFFF", "#FFB627", "#FF8A3D", "#FF5D5D", "#E36BF2", "#9B85FF", "#4FE0F5", "#3DDC97", "#A8E84A", "#F2C14E"];

function IconoUtilidad({ item }: { item: string }) {
  if (item === "escudo") return <IconoEscudo tam={34} />;
  if (item === "congelamiento") return <IconoCopo tam={32} c="#7FD8FF" />;
  if (item === "boost") return <IconoRayo tam={32} c={color.logro} />;
  if (item === "hielo") return <IconoCopo tam={32} c="#BDEBFF" />;
  if (item === "pista") return <Texto style={{ fontSize: 30 }}>💡</Texto>;
  if (item === "segunda_oportunidad") return <Texto style={{ fontSize: 30 }}>🔁</Texto>;
  if (item === "cofre_hielos")
    return (
      <View style={{ flexDirection: "row" }}>
        <IconoCopo tam={22} c="#BDEBFF" />
        <IconoCopo tam={22} c="#7FD8FF" />
        <IconoCopo tam={22} c="#BDEBFF" />
      </View>
    );
  return <IconoReloj tam={32} c={color.correcto} />;
}

// Lo que muestra cada ítem en su tarjeta: el cosmético puesto sobre algo tuyo.
function Muestra({ it, placa }: { it: ItemTienda; placa: PlacaDatos }) {
  switch (it.categoria) {
    case "utilidad":
      return <IconoUtilidad item={it.item} />;
    case "marco":
    case "marco_mundo":
      return <AvatarMarco url={placa.avatarUrl} nombre={placa.nombre} marco={it.valor} tam={50} animar={false} />;
    case "fuente":
      return <Texto style={{ fontFamily: FUENTE_FAMILIA[it.valor] ?? fuente.display, fontSize: 30, color: color.texto }}>Aa</Texto>;
    case "animacion":
      return <NombreEstilizado texto={placa.nombre.slice(0, 9)} animacion={it.valor} fuente={placa.fuente} tam={16} />;
    case "fondo":
      return (
        <View style={styles.mini}>
          <FondoPlaca fondo={it.valor === "personalizado" ? "ninguno" : it.valor} url={null} velo={false} animar={false} />
          {it.valor === "personalizado" && <Texto style={{ fontFamily: fuente.display, fontSize: 18, color: color.texto }}>GIF</Texto>}
        </View>
      );
    case "galeria":
      return <Image source={{ uri: it.imagen }} style={styles.mini} contentFit="cover" autoplay={false} />;
    case "estela":
    case "efecto":
    case "sonido":
    case "emote":
    case "ciudad_placa":
    case "titulo":
      return <VistaCosmetico categoria={it.categoria} valor={it.valor} tam={50} />;
    case "paquete":
      return (
        <View style={{ alignItems: "center", gap: 2 }}>
          <Texto style={{ fontSize: 30 }}>🎁</Texto>
          <Texto v="nota" tam={10}>
            {it.items?.length ?? 0} cosas
          </Texto>
        </View>
      );
    default:
      return (
        <View style={styles.fila}>
          {COLORES_NOMBRE.slice(1, 5).map((c) => (
            <View key={c} style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c }} />
          ))}
        </View>
      );
  }
}

// Tarjeta de la grilla: muestra del cosmético sobre un degradé del color de su
// rareza (los legendarios brillan), nombre, estado (tuyo / en uso) y precio.
// memo: tocar una tarjeta no vuelve a dibujar las demás.
const TarjetaItem = memo(function TarjetaItem({ it, e, placa, ancho, onPress }: { it: ItemTienda; e: EstadoTienda; placa: PlacaDatos; ancho: number; onPress: (it: ItemTienda) => void }) {
  const precio = precioDe(it);
  const rareza = rarezaDeItem(it);
  const c = COLOR_RAREZA[rareza];
  const tiene = loTiene(it, e);
  const usa = loUsa(it, e);
  const cantidad = cantidadUtilidad(it, e);
  const oferta = precio < it.costoBase;
  const alto = rareza === "legendario" || rareza === "epico";
  return (
    <Pressable
      onPress={() => {
        vibrar.seleccion();
        onPress(it);
      }}
      style={({ pressed }) => [
        styles.item,
        { width: ancho, borderColor: usa ? color.correcto : conAlfa(c, rareza === "comun" ? 0.35 : 0.8) },
        alto && { boxShadow: brillo(c, rareza === "legendario" ? 18 : 10, rareza === "legendario" ? 0.4 : 0.25) },
        { transform: [{ scale: pressed ? 0.95 : 1 }] },
      ]}
    >
      <LinearGradient colors={[conAlfa(c, rareza === "comun" ? 0.12 : 0.28), "rgba(18,23,42,0)"]} style={StyleSheet.absoluteFill} />
      <View style={styles.muestra}>
        <Muestra it={it} placa={placa} />
      </View>
      <Texto v="fuerte" tam={11.5} numberOfLines={2} centro style={{ minHeight: 30 }}>
        {it.nombre}
      </Texto>
      {it.categoria === "utilidad" ? (
        <Texto v="nota" tam={10.5}>
          Tienes {cantidad}
        </Texto>
      ) : usa ? (
        <Texto v="fuerte" tam={10.5} c={color.correcto}>
          EN USO
        </Texto>
      ) : tiene ? (
        <Texto v="fuerte" tam={10.5} c={color.primarioClaro}>
          TUYO
        </Texto>
      ) : (
        <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 9.5, letterSpacing: 0.8, color: c }}>{NOMBRE_RAREZA[rareza].toUpperCase()}</Texto>
      )}
      {(!tiene || it.categoria === "utilidad") && (
        <View style={[styles.precio, oferta && { borderColor: color.correcto }]}>
          <IconoChispa tam={12} />
          <Texto v="mono" tam={11.5} c={oferta ? color.correcto : color.texto}>
            {precio.toLocaleString("es")}
          </Texto>
        </View>
      )}
      {it.soloPro && (
        <View style={styles.pro}>
          <Texto style={{ fontFamily: fuente.display, fontSize: 9, color: "#fff" }}>PRO</Texto>
        </View>
      )}
    </Pressable>
  );
});

export default function Tienda() {
  const router = useRouter();
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const { placa } = useJugador();
  const [e, setE] = useState<EstadoTienda | null>(null);
  const [elegido, setElegido] = useState<ItemTienda | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [festejo, setFestejo] = useState(0);
  const [pestana, setPestana] = useState<Pestana>("utilidad");
  const anchoTarjeta = Math.floor((Dimensions.get("window").width - 32 - 20) / 3);
  const elegirItem = useCallback((it: ItemTienda) => {
    setElegido(it);
    setConfirmar(false);
  }, []);

  const cargar = useCallback(async () => {
    if (!userId) return;
    setE(await cargarTienda(userId));
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const catalogo = useMemo<ItemTienda[]>(() => {
    if (!e) return CATALOGO;
    return [
      ...CATALOGO,
      ...e.galeria.map((g) => ({ item: `galeria:${g.slug}` as const, nombre: g.nombre, categoria: "galeria" as const, valor: g.slug, costoBase: g.costo, imagen: g.url })),
    ];
  }, [e]);

  if (!placa || !e) {
    return (
      <PantallaApilada titulo="Tienda">
        <Texto v="nota" centro>
          Abriendo la tienda…
        </Texto>
      </PantallaApilada>
    );
  }

  const descuento = descuentoDeHoy();
  const itemOferta = CATALOGO.find((x) => x.item === descuento.item);

  // Vista previa: tu Placa con el ítem elegido puesto.
  const previa: PlacaDatos = elegido
    ? {
        ...placa,
        marco: elegido.categoria === "marco" || elegido.categoria === "marco_mundo" ? elegido.valor : placa.marco,
        fuente: elegido.categoria === "fuente" ? elegido.valor : placa.fuente,
        animacion: elegido.categoria === "animacion" ? elegido.valor : placa.animacion,
        fondo: elegido.categoria === "fondo" ? elegido.valor : elegido.categoria === "galeria" ? "personalizado" : placa.fondo,
        fondoUrl: elegido.categoria === "galeria" ? elegido.imagen ?? null : elegido.categoria === "fondo" && elegido.valor === "personalizado" ? e.fondoUrl : placa.fondoUrl,
        ciudad: elegido.categoria === "ciudad_placa" ? elegido.valor : placa.ciudad,
      }
    : placa;

  async function hacerCompra() {
    if (!elegido) return;
    if (!confirmar) {
      vibrar.medio();
      setConfirmar(true);
      return;
    }
    setOcupado(true);
    try {
      const total = await comprar(elegido);
      fijarChispas(total);
      sonar("recompensa");
      vibrar.exito();
      setFestejo((n) => n + 1);
      mostrarAviso(`¡${elegido.nombre} es tuyo!`, "logro");
      if (!["utilidad", "color", "paquete", "emote"].includes(elegido.categoria) && !(elegido.categoria === "fondo" && elegido.valor === "personalizado")) {
        await equipar(elegido, elegido.categoria).catch(() => {});
      }
      if (userId) recargarCosmeticos(userId);
      setConfirmar(false);
      await Promise.all([cargar(), recargarJugador()]);
      if (elegido.categoria === "utilidad") setElegido(null);
    } catch (err) {
      mostrarAviso(mensajeError(err), "error");
    } finally {
      setOcupado(false);
    }
  }

  async function usar(it: ItemTienda | null, cat: Categoria, ninguno?: string) {
    setOcupado(true);
    try {
      await equipar(it, cat, ninguno);
      sonar("boton");
      await Promise.all([cargar(), recargarJugador(), userId ? recargarCosmeticos(userId) : Promise.resolve()]);
      mostrarAviso(it ? `Ahora usas ${it.nombre}` : "Listo", "ok");
    } catch (err) {
      mostrarAviso(mensajeError(err), "error");
    } finally {
      setOcupado(false);
    }
  }

  const tiene = elegido ? loTiene(elegido, e) : false;
  const usa = elegido ? loUsa(elegido, e) : false;
  const precio = elegido ? precioDe(elegido) : 0;
  const bloqueoNivel = elegido?.nivelMundo && (e.nivelesMundo[elegido.nivelMundo] ?? 0) < 40;
  const bloqueoPro = elegido?.soloPro && e.plan !== "pro";
  const ninguno: Partial<Record<Categoria, string>> = { marco: "ninguno", marco_mundo: "ninguno", fuente: "default", animacion: "ninguna", fondo: "ninguno", galeria: "ninguno", estela: "clasica", efecto: "chispas", sonido: "clasico" };

  const items = catalogo.filter((x) => CATEGORIAS_DE[pestana].includes(x.categoria) && aLaVenta(x));
  const horasOferta = Math.floor(msHastaFinDelEvento() / 3_600_000);

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.barra}>
          <BotonAtras />
          <View style={{ flex: 1 }}>
            <Texto v="h2">Bazar</Texto>
            <Texto v="nota" tam={12}>
              Cosméticos y ayudas para tus partidas
            </Texto>
          </View>
          <View style={styles.saldo}>
            <IconoChispa tam={18} />
            <NumeroAnimado valor={e.chispas} v="mono" onTic={() => sonar("moneda")} />
          </View>
        </View>
        <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12 }}>
            {itemOferta && (
              <Pressable
                onPress={() => {
                  vibrar.seleccion();
                  setElegido(itemOferta);
                  setConfirmar(false);
                }}
                style={({ pressed }) => [styles.oferta, pressed && { transform: [{ scale: 0.98 }] }]}
              >
                <LinearGradient colors={["#0E3B2C", "#123F3A", "#171D34"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                <View style={styles.ofertaMuestra}>
                  <Muestra it={itemOferta} placa={placa} />
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Texto v="micro" c={color.correcto}>
                    Oferta del día · termina en {horasOferta} h
                  </Texto>
                  <Texto v="h3" numberOfLines={1}>
                    {itemOferta.nombre}
                  </Texto>
                  <View style={styles.fila}>
                    <Texto v="mono" tam={13} c={color.texto2} style={{ textDecorationLine: "line-through" }}>
                      {itemOferta.costoBase.toLocaleString("es")}
                    </Texto>
                    <View style={[styles.precio, { borderColor: color.correcto, backgroundColor: conAlfa(color.correcto, 0.15) }]}>
                      <IconoChispa tam={13} />
                      <Texto v="mono" tam={13} c={color.correcto}>
                        {precioDe(itemOferta).toLocaleString("es")}
                      </Texto>
                    </View>
                  </View>
                </View>
                <View style={styles.etiquetaOferta}>
                  <Texto style={{ fontFamily: fuente.display, fontSize: 17, color: "#062B1C" }}>−{descuento.porcentaje}%</Texto>
                </View>
              </Pressable>
            )}
          </View>

          <View style={styles.chipsCaja}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
              {PESTANAS.map((p) => {
                const activa = p.id === pestana;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => {
                      vibrar.seleccion();
                      setPestana(p.id);
                    }}
                    style={[styles.chip, activa && styles.chipActivo]}
                  >
                    <Texto style={{ fontFamily: fuente.cuerpoFuerte, fontSize: 13, color: activa ? color.texto : color.texto2 }}>{p.titulo}</Texto>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <Animated.View key={pestana} entering={FadeIn.duration(220)} style={styles.grilla}>
            {items.map((it) => (
              <TarjetaItem key={it.item} it={it} e={e} placa={placa} ancho={anchoTarjeta} onPress={elegirItem} />
            ))}
          </Animated.View>
          <Texto v="nota" tam={12} centro style={{ marginTop: 14, paddingHorizontal: 24 }}>
            Las Chispas se ganan jugando. Muy pronto también se podrán conseguir paquetes desde la app.
          </Texto>
        </ScrollView>
      </SafeAreaView>

      <Hoja visible={!!elegido} onCerrar={() => setElegido(null)}>
        {elegido && (
          <>
            {elegido.categoria !== "utilidad" && !SOBRE_PLACA.includes(elegido.categoria) ? (
              <View key={elegido.item} style={[styles.fila, { gap: 14 }]}>
                <View style={[styles.iconoGrande, { width: 96, height: 96 }]}>
                  {elegido.categoria === "paquete" ? <Texto style={{ fontSize: 44 }}>🎁</Texto> : <VistaCosmetico categoria={elegido.categoria} valor={elegido.valor} tam={72} />}
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={[styles.rareza, { borderColor: COLOR_RAREZA[rarezaDeItem(elegido)] }]}>
                    <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 10, color: COLOR_RAREZA[rarezaDeItem(elegido)], letterSpacing: 1 }}>{NOMBRE_RAREZA[rarezaDeItem(elegido)].toUpperCase()}</Texto>
                  </View>
                  <Texto v="h2">{elegido.nombre}</Texto>
                  {elegido.descripcion ? <Texto v="nota">{elegido.descripcion}</Texto> : null}
                  {elegido.categoria === "estela" && <Texto v="nota">La llama de tu racha en las partidas.</Texto>}
                  {elegido.categoria === "efecto" && <Texto v="nota">Lo que estalla cada vez que aciertas.</Texto>}
                  {elegido.categoria === "sonido" && (
                    <Pressable onPress={() => probarPaqueteAcierto(elegido.valor)} style={[styles.precio, { alignSelf: "flex-start" }]}>
                      <Texto v="fuerte" tam={12}>
                        ▶ Escuchar
                      </Texto>
                    </Pressable>
                  )}
                  {elegido.categoria === "paquete" &&
                    (elegido.items ?? []).map((s) => (
                      <Texto key={s} v="nota" c={tieneSlug(s, e) ? color.correcto : color.texto}>
                        {tieneSlug(s, e) ? "✓ " : "• "}
                        {NOMBRE_DE_SLUG(s)}
                      </Texto>
                    ))}
                </View>
              </View>
            ) : elegido.categoria !== "utilidad" ? (
              <View key={elegido.item} style={{ flexDirection: "row", gap: 10 }}>
                <PlacaTarjeta placa={previa} onPress={() => {}} />
                <View style={{ flex: 1.1, justifyContent: "center", gap: 6 }}>
                  <View style={[styles.rareza, { borderColor: COLOR_RAREZA[rarezaDeItem(elegido)] }]}>
                    <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 10, color: COLOR_RAREZA[rarezaDeItem(elegido)], letterSpacing: 1 }}>
                      {NOMBRE_RAREZA[rarezaDeItem(elegido)].toUpperCase()}
                    </Texto>
                  </View>
                  <Texto v="h2">{elegido.nombre}</Texto>
                  {elegido.descripcion ? <Texto v="nota">{elegido.descripcion}</Texto> : <Texto v="nota">Así se ve en tu Placa.</Texto>}
                  {elegido.temporada != null && (
                    <Texto v="fuerte" tam={12} c={color.racha}>
                      Quedan {diasHastaFinDeMes()} días para comprarlo
                    </Texto>
                  )}
                </View>
              </View>
            ) : (
              <View style={[styles.fila, { gap: 14 }]}>
                <View style={styles.iconoGrande}>
                  <IconoUtilidad item={elegido.item} />
                </View>
                <View style={{ flex: 1 }}>
                  <Texto v="h2">{elegido.nombre}</Texto>
                  <Texto v="nota">{elegido.descripcion}</Texto>
                  <Texto v="nota" c={color.texto}>
                    Tienes {cantidadUtilidad(elegido, e)}
                  </Texto>
                </View>
              </View>
            )}

            {elegido.categoria === "color" && tiene ? (
              <View style={[styles.fila, { flexWrap: "wrap", justifyContent: "center" }]}>
                {COLORES_NOMBRE.map((c) => (
                  <Pressable
                    key={c}
                    onPress={async () => {
                      await guardarColorNombre(c);
                      sonar("boton");
                      await recargarJugador();
                      mostrarAviso("Color guardado", "ok");
                    }}
                    style={[styles.colorBola, { backgroundColor: c, borderColor: placa.colorNombre === c ? "#fff" : "transparent" }]}
                  />
                ))}
                <Pressable
                  onPress={async () => {
                    await guardarColorNombre(null);
                    await recargarJugador();
                  }}
                  style={[styles.colorBola, { backgroundColor: color.surface3, alignItems: "center", justifyContent: "center" }]}
                >
                  <Texto v="nota" tam={10}>
                    ✕
                  </Texto>
                </Pressable>
              </View>
            ) : elegido.categoria === "fondo" && elegido.valor === "personalizado" && tiene ? (
              <Boton3D
                titulo="Subir imagen o GIF"
                cargando={ocupado}
                onPress={async () => {
                  if (!userId) return;
                  setOcupado(true);
                  try {
                    const url = await subirFondo(userId);
                    if (url) {
                      sonar("recompensa");
                      await Promise.all([cargar(), recargarJugador()]);
                      mostrarAviso("Tu fondo nuevo ya está en tu Placa", "ok");
                    }
                  } catch (err) {
                    mostrarAviso(mensajeError(err), "error");
                  } finally {
                    setOcupado(false);
                  }
                }}
              />
            ) : tiene && (elegido.categoria === "emote" || elegido.categoria === "paquete") ? (
              <Texto v="nota" centro>
                {elegido.categoria === "emote" ? "Ya lo tienes: aparece en tus duelos." : "Ya tienes todo lo de este paquete."}
              </Texto>
            ) : tiene && elegido.categoria === "titulo" && usa ? (
              <Texto v="nota" centro>
                Lo estás usando en tu Placa.
              </Texto>
            ) : tiene && elegido.categoria !== "utilidad" ? (
              usa ? (
                <Boton3D titulo="Quitar" variante="secundario" cargando={ocupado} onPress={() => usar(null, elegido.categoria, ninguno[elegido.categoria])} />
              ) : (
                <Boton3D titulo="Usar" brillo cargando={ocupado} onPress={() => usar(elegido, elegido.categoria)} />
              )
            ) : bloqueoNivel ? (
              <Texto v="nota" centro>
                Llega al nivel 40 en {elegido.nombre.replace("Marco ", "")} para poder comprarlo (vas en el {e.nivelesMundo[elegido.nivelMundo!] ?? 1}).
              </Texto>
            ) : bloqueoPro ? (
              <Boton3D titulo="Exclusivo de Prodigia Pro" variante="pro" onPress={() => { setElegido(null); router.push("/pro"); }} />
            ) : (
              <>
                <Boton3D
                  titulo={confirmar ? "¿Seguro? Confirmar compra" : `Comprar por ${precio.toLocaleString("es")}`}
                  icono={confirmar ? undefined : <IconoChispa tam={18} />}
                  variante="logro"
                  brillo
                  deshabilitado={e.chispas < precio}
                  cargando={ocupado}
                  onPress={hacerCompra}
                />
                <Texto v="nota" centro tam={12}>
                  {e.chispas < precio
                    ? `Te faltan ${(precio - e.chispas).toLocaleString("es")} Chispas`
                    : `Te quedarán ${(e.chispas - precio).toLocaleString("es")} Chispas`}
                </Texto>
              </>
            )}
          </>
        )}
      </Hoja>
      {festejo > 0 && <Confeti key={festejo} cantidad={36} />}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  saldo: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: color.surface1, borderWidth: 1, borderColor: conAlfa(color.logro, 0.5) },
  etiquetaOferta: { position: "absolute", top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: color.correcto, transform: [{ rotate: "6deg" }] },
  item: { borderRadius: 18, borderWidth: 1.5, backgroundColor: color.surface1, padding: 8, paddingTop: 12, alignItems: "center", gap: 5, overflow: "hidden" },
  barra: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 },
  oferta: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 22, borderWidth: 1.5, borderColor: conAlfa(color.correcto, 0.6), overflow: "hidden", boxShadow: brillo(color.correcto, 22, 0.25) },
  ofertaMuestra: { width: 74, height: 74, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.25)", alignItems: "center", justifyContent: "center" },
  chipsCaja: { paddingVertical: 10, backgroundColor: color.bg, borderBottomWidth: 1, borderBottomColor: color.border },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface1 },
  chipActivo: { borderColor: color.primarioNeon, backgroundColor: conAlfa(color.primario, 0.22) },
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16, paddingTop: 14 },
  muestra: { height: 62, alignItems: "center", justifyContent: "center" },
  mini: { width: 74, height: 54, borderRadius: 10, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  precio: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border },
  pro: { position: "absolute", top: 8, right: 8, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6, backgroundColor: color.primario },
  rareza: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  iconoGrande: { width: 70, height: 70, borderRadius: 18, backgroundColor: color.surface2, alignItems: "center", justifyContent: "center" },
  colorBola: { width: 36, height: 36, borderRadius: 18, borderWidth: 3 },
});
