import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { URL_WEB } from "~/lib/entorno";
import { LinearGradient } from "expo-linear-gradient";
import { msHastaFinDelEvento } from "@/lib/eventos/dobleExperiencia";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import { CATALOGO_NUEVO, diasHastaFinDeMes, temporadaActual as temporadaDelMes } from "@/lib/recompensas/catalogo";
import { msHastaCambioDiario, PUESTOS, puestoDe, relojHasta, rotacionDelDia, type PuestoId } from "@/lib/tienda/bazar";
import { TEMAS_APP, type TemaApp } from "@/lib/recompensas/temas";
import { probarPaqueteAcierto, sonar, vibrar } from "~/lib/efectos";
import { recargarCosmeticos } from "~/lib/recompensas";
import { fijarChispas, fijarCometas, recargarJugador, useJugador } from "~/lib/jugador";
import { CANJES_COMETAS, canjearCometas, CHISPAS_POR_COMETA } from "~/lib/cometas";
import { COLOR_COMETA } from "@/lib/recompensas/iconoCometa";
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
  cometasDe,
  hoyIso,
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
import { IconoChispa, IconoCometa, IconoCopo, IconoEscudo, IconoRayo, IconoReloj } from "~/ui/Iconos";
import NumeroAnimado from "~/ui/NumeroAnimado";
import { BotonAtras, PantallaApilada } from "~/ui/Pantalla";
import AvatarMarco from "~/ui/placa/AvatarMarco";
import FondoPlaca from "~/ui/placa/FondoPlaca";
import NombreEstilizado from "~/ui/placa/NombreEstilizado";
import Segmentos from "~/ui/Segmentos";
import { PlacaTarjeta } from "~/ui/placa/Placa";
import VistaCosmetico from "~/ui/recompensas/VistaCosmetico";
import Texto from "~/ui/Texto";
import { brillo, color, conAlfa, fuente } from "~/tema";
import { FUENTE_FAMILIA } from "~/lib/placa";

// Tienda A + C (2026-10-14, docs/rediseno/tienda.html): en Tienda, la portada muestra lo
// del día (rotación y oferta) y la calle con sus puestos; cada puesto es una grilla con
// sus categorías (src/lib/tienda/bazar.ts, igual que la web). En Inventario, los mismos
// puestos como pestañas.
type Pestana = "cometas" | "temas" | PuestoId;
const PESTANAS: { id: Pestana; titulo: string }[] = [
  { id: "cometas", titulo: "Cometas" },
  ...PUESTOS.map((p) => ({ id: p.id as Pestana, titulo: p.nombre })),
  { id: "temas", titulo: "Temas ✦" },
];
const CATEGORIAS_DE: Record<Pestana, Categoria[]> = {
  cometas: [],
  temas: [],
  ...(Object.fromEntries(PUESTOS.map((p) => [p.id, p.categorias as Categoria[]])) as Record<PuestoId, Categoria[]>),
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
const TarjetaItem = memo(function TarjetaItem({ it, e, placa, ancho, onPress, delDia }: { it: ItemTienda; e: EstadoTienda; placa: PlacaDatos; ancho: number; onPress: (it: ItemTienda) => void; delDia?: boolean }) {
  const precio = precioDe(it);
  const precioCometas = cometasDe(it);
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
        precioCometas != null ? (
          <View style={[styles.precio, { borderColor: conAlfa(COLOR_COMETA, 0.6) }]}>
            <IconoCometa tam={12} />
            <Texto v="mono" tam={11.5}>
              {precioCometas.toLocaleString("es")}
            </Texto>
          </View>
        ) : (
          <View style={[styles.precio, oferta && { borderColor: color.correcto }]}>
            <IconoChispa tam={12} />
            <Texto v="mono" tam={11.5} c={oferta ? color.correcto : color.texto}>
              {precio.toLocaleString("es")}
            </Texto>
          </View>
        )
      )}
      {delDia && (
        <View style={styles.marcaDia}>
          <Texto style={{ fontFamily: fuente.display, fontSize: 8.5, color: "#2A1A00", letterSpacing: 0.6 }}>DEL DÍA</Texto>
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

// Miniatura de un tema (Próximamente): una pantallita con sus colores, la forma de
// sus tarjetas y su botón. Los temas todavía no se venden.
const MiniTema = memo(function MiniTema({ tema, ancho, alto }: { tema: TemaApp; ancho: number; alto: number }) {
  const k = tema.colores;
  const radio = Math.min(tema.radio, 6);
  const tarjeta = (h: number) => (
    <View style={{ height: h }}>
      {tema.sombra === "dura" && <View style={{ position: "absolute", left: 2, top: 2, right: -2, bottom: -2, borderRadius: radio, backgroundColor: k.borde }} />}
      <View style={{ flex: 1, borderRadius: radio, backgroundColor: k.tarjeta, borderWidth: tema.borde, borderColor: k.borde, padding: 4, gap: 3, justifyContent: "center" }}>
        <View style={{ width: "62%", height: 3, borderRadius: 2, backgroundColor: k.texto, opacity: 0.85 }} />
        <View style={{ width: "40%", height: 3, borderRadius: 2, backgroundColor: k.detalle }} />
      </View>
    </View>
  );
  return (
    <View style={{ width: ancho, height: alto, borderRadius: 10, overflow: "hidden", backgroundColor: k.fondo, padding: 7, gap: 5 }}>
      <View style={{ width: "48%", height: 5, borderRadius: 2, backgroundColor: k.texto === k.tarjeta ? k.borde : k.texto, opacity: 0.9 }} />
      {tarjeta(alto * 0.24)}
      {tarjeta(alto * 0.17)}
      <View style={{ flex: 1 }} />
      <View style={{ height: alto * 0.12, borderRadius: radio, backgroundColor: k.acento, borderWidth: tema.borde ? 1 : 0, borderColor: k.borde }} />
    </View>
  );
});

// Toldo de un puesto: rayas de sus dos colores.
function Toldo({ claro, oscuro, alto = 12 }: { claro: string; oscuro: string; alto?: number }) {
  return (
    <View style={{ flexDirection: "row", height: alto, overflow: "hidden", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
      {Array.from({ length: 12 }, (_, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: i % 2 ? oscuro : claro, borderBottomLeftRadius: alto / 2, borderBottomRightRadius: alto / 2 }} />
      ))}
    </View>
  );
}

// Portada del Bazar: lo del día arriba (rotación con su reloj) y la calle abajo.
function PortadaBazar({ catalogo, e, placa, ancho, onPress, onPuesto }: { catalogo: ItemTienda[]; e: EstadoTienda; placa: PlacaDatos; ancho: number; onPress: (it: ItemTienda) => void; onPuesto: (p: Pestana) => void }) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const rot = useMemo(() => rotacionDelDia(hoyIso(), CATALOGO_NUEVO, temporadaDelMes()), []);
  const destacado = catalogo.find((x) => x.item === rot.destacado) ?? null;
  const otros = rot.otros.map((s) => catalogo.find((x) => x.item === s)).filter((x): x is ItemTienda => !!x);
  const anchoPuesto = Math.floor((Dimensions.get("window").width - 32 - 16) / 3);
  return (
    <Animated.View entering={FadeIn.duration(220)} style={{ paddingHorizontal: 16, paddingTop: 12, gap: 14 }}>
      <View style={styles.hoy}>
        <LinearGradient colors={[conAlfa(color.logro, 0.22), "rgba(18,23,42,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={[styles.fila, { justifyContent: "space-between" }]}>
          <Texto v="micro" c={color.logro}>
            Hoy en el Bazar
          </Texto>
          <Texto v="mono" tam={12} c={color.logro}>
            cambia en {relojHasta(msHastaCambioDiario(ahora))}
          </Texto>
        </View>
        {destacado && (
          <Pressable
            onPress={() => {
              vibrar.seleccion();
              onPress(destacado);
            }}
            style={({ pressed }) => [styles.destacado, pressed && { transform: [{ scale: 0.98 }] }]}
          >
            <View style={styles.destacadoMuestra}>
              <Muestra it={destacado} placa={placa} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 10, letterSpacing: 1, color: COLOR_RAREZA[rarezaDeItem(destacado)] }}>{NOMBRE_RAREZA[rarezaDeItem(destacado)].toUpperCase()}</Texto>
              <Texto v="h3" numberOfLines={2}>
                {destacado.nombre}
              </Texto>
              {loTiene(destacado, e) ? (
                <Texto v="fuerte" tam={12} c={color.primarioClaro}>
                  YA ES TUYO
                </Texto>
              ) : cometasDe(destacado) != null ? (
                <View style={[styles.precio, { alignSelf: "flex-start", borderColor: conAlfa(COLOR_COMETA, 0.6) }]}>
                  <IconoCometa tam={13} />
                  <Texto v="mono" tam={13}>
                    {cometasDe(destacado)}
                  </Texto>
                </View>
              ) : (
                <View style={[styles.precio, { alignSelf: "flex-start" }]}>
                  <IconoChispa tam={13} />
                  <Texto v="mono" tam={13}>
                    {precioDe(destacado).toLocaleString("es")}
                  </Texto>
                </View>
              )}
            </View>
          </Pressable>
        )}
        <View style={[styles.grilla, { paddingHorizontal: 0, paddingTop: 0 }]}>
          {otros.map((it) => (
            <TarjetaItem key={it.item} it={it} e={e} placa={placa} ancho={ancho} onPress={onPress} />
          ))}
        </View>
      </View>

      <Texto v="micro" c={color.texto2}>
        La calle · siempre abierta
      </Texto>
      <View style={[styles.fila, { flexWrap: "wrap", gap: 8 }]}>
        {PUESTOS.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => {
              vibrar.seleccion();
              onPuesto(p.id);
            }}
            style={({ pressed }) => [styles.puesto, { width: anchoPuesto }, pressed && { transform: [{ scale: 0.96 }] }]}
          >
            <Toldo claro={p.color} oscuro={p.oscuro} />
            <View style={{ padding: 8, gap: 2 }}>
              <Texto style={{ fontFamily: fuente.display, fontSize: 14, color: p.color, textShadowColor: p.color, textShadowRadius: 8 }}>{p.nombre}</Texto>
              <Texto v="nota" tam={10.5} numberOfLines={1}>
                {p.que}
              </Texto>
            </View>
          </Pressable>
        ))}
      </View>
      <View style={[styles.fila, { gap: 8 }]}>
        <Boton3D titulo="Cometas" icono={<IconoCometa tam={16} />} variante="secundario" tamano="sm" estilo={{ flex: 1 }} onPress={() => onPuesto("cometas")} />
        <Boton3D titulo="Temas ✦" variante="secundario" tamano="sm" estilo={{ flex: 1 }} onPress={() => onPuesto("temas")} />
      </View>
    </Animated.View>
  );
}

// Dos vistas (pedido 2026-10-10): la Tienda muestra solo lo que todavía no tienes
// (las ayudas siempre, porque se gastan) y el Inventario, todo lo tuyo para usarlo.
type Modo = "tienda" | "inventario";

export default function Tienda() {
  const router = useRouter();
  const params = useLocalSearchParams<{ modo?: string; pestana?: string }>();
  const [modo, setModo] = useState<Modo>(params.modo === "inventario" ? "inventario" : "tienda");
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const { placa, resumen } = useJugador();
  const [e, setE] = useState<EstadoTienda | null>(null);
  const [elegido, setElegido] = useState<ItemTienda | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [festejo, setFestejo] = useState(0);
  // null = portada del Bazar (solo en Tienda).
  const [pestana, setPestana] = useState<Pestana | null>(params.pestana === "cometas" ? "cometas" : null);
  const cometas = resumen?.cometas ?? 0;
  const [canjePendiente, setCanjePendiente] = useState<number | null>(null);
  const [canjeando, setCanjeando] = useState(false);
  const [tema, setTema] = useState<TemaApp | null>(null);
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
      const saldo = await comprar(elegido);
      if (saldo.chispas != null) fijarChispas(saldo.chispas);
      if (saldo.cometas != null) fijarCometas(saldo.cometas);
      sonar("recompensa");
      vibrar.exito();
      setFestejo((n) => n + 1);
      // Comprar no lo pone solo (pedido 2026-10-09): queda en tu colección y lo
      // usas cuando quieras con «Usar».
      mostrarAviso(["utilidad", "paquete", "emote"].includes(elegido.categoria) ? `¡${elegido.nombre} es tuyo!` : `¡${elegido.nombre} es tuyo! Toca «Usar» para ponértelo.`, "logro");
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
  const precioCometas = elegido ? cometasDe(elegido) : null;
  const misCometas = resumen?.cometas ?? 0;
  const bloqueoNivel = elegido?.nivelMundo && (e.nivelesMundo[elegido.nivelMundo] ?? 0) < 40;
  const bloqueoPro = elegido?.soloPro && e.plan !== "pro";
  const ninguno: Partial<Record<Categoria, string>> = { marco: "ninguno", marco_mundo: "ninguno", fuente: "default", animacion: "ninguna", fondo: "ninguno", galeria: "ninguno", estela: "clasica", efecto: "chispas", sonido: "clasico" };

  const pestanas = modo === "inventario" ? PESTANAS.filter((p) => p.id !== "mercado" && p.id !== "temas" && p.id !== "cometas") : PESTANAS;
  const pestanaVista: Pestana | null =
    modo === "inventario" ? (pestanas.some((p) => p.id === pestana) ? (pestana as Pestana) : pestanas[0].id) : pestana;
  const puestoVista = puestoDe(pestanaVista);
  const rotHoy = rotacionDelDia(hoyIso(), CATALOGO_NUEVO, temporadaDelMes());
  const delDia = new Set([rotHoy.destacado, ...rotHoy.otros]);
  const items = catalogo.filter((x) => {
    if (!pestanaVista || !CATEGORIAS_DE[pestanaVista].includes(x.categoria)) return false;
    if (modo === "inventario") return x.categoria === "utilidad" ? (cantidadUtilidad(x, e) ?? 0) > 0 : loTiene(x, e);
    return aLaVenta(x) && !x.especial && (x.categoria === "utilidad" || !loTiene(x, e));
  });
  const horasOferta = Math.floor(msHastaFinDelEvento() / 3_600_000);

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.barra}>
          <BotonAtras />
          <View style={{ flex: 1 }}>
            <Texto v="h2">{modo === "inventario" ? "Inventario" : "Bazar"}</Texto>
            <Texto v="nota" tam={12}>
              {modo === "inventario" ? "Todo lo tuyo: toca algo para usarlo" : "Cosméticos y ayudas para tus partidas"}
            </Texto>
          </View>
          <View style={styles.saldo}>
            <IconoChispa tam={18} />
            <NumeroAnimado valor={e.chispas} v="mono" onTic={() => sonar("moneda")} />
          </View>
        </View>
        <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12, gap: 12 }}>
            <Segmentos<Modo>
              opciones={[
                { id: "tienda", titulo: "Tienda" },
                { id: "inventario", titulo: "Inventario" },
              ]}
              valor={modo}
              onCambio={(m) => {
                vibrar.seleccion();
                setModo(m);
                setElegido(null);
              }}
            />
            {modo === "tienda" && pestanaVista === null && itemOferta && !loTiene(itemOferta, e) && (
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

          {modo === "tienda" ? (
            <View style={[styles.chipsCaja, { paddingHorizontal: 16 }]}>
              {pestanaVista === null ? (
                <Texto v="nota" tam={12}>
                  Elige un puesto de la calle o mira lo de hoy.
                </Texto>
              ) : (
                <View style={[styles.fila, { justifyContent: "space-between" }]}>
                  <Pressable
                    onPress={() => {
                      vibrar.seleccion();
                      setPestana(null);
                    }}
                    hitSlop={10}
                  >
                    <Texto v="fuerte" c={color.texto2}>
                      ← La calle
                    </Texto>
                  </Pressable>
                  <Texto style={{ fontFamily: fuente.display, fontSize: 18, color: puestoVista?.color ?? (pestanaVista === "cometas" ? COLOR_COMETA : color.logro), textShadowColor: puestoVista?.color ?? COLOR_COMETA, textShadowRadius: 10 }}>
                    {puestoVista?.nombre ?? (pestanaVista === "cometas" ? "Cometas" : "Temas")}
                  </Texto>
                </View>
              )}
            </View>
          ) : (
          <View style={styles.chipsCaja}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
              {pestanas.map((p) => {
                const activa = p.id === pestanaVista;
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
          )}
          {puestoVista && modo === "tienda" && <Toldo claro={puestoVista.color} oscuro={puestoVista.oscuro} alto={14} />}

          {pestanaVista === null ? (
            <PortadaBazar catalogo={catalogo} e={e} placa={placa} ancho={anchoTarjeta} onPress={elegirItem} onPuesto={(p) => setPestana(p)} />
          ) : pestanaVista === "cometas" ? (
            <Animated.View key="cometas" entering={FadeIn.duration(220)} style={{ paddingHorizontal: 16, paddingTop: 14, gap: 14 }}>
              <View style={styles.cometasCaja}>
                <IconoCometa tam={52} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Texto v="micro" c={COLOR_COMETA}>
                    Tus Cometas
                  </Texto>
                  <Texto v="mono" tam={28}>
                    {cometas.toLocaleString("es")}
                  </Texto>
                  <Texto v="nota" tam={12}>
                    La moneda premium. Cada Cometa vale {CHISPAS_POR_COMETA} Chispas.
                  </Texto>
                </View>
              </View>
              <Texto v="h3">Cambiar por Chispas</Texto>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {CANJES_COMETAS.map((n) => {
                  const alcanza = cometas >= n;
                  const confirmando = canjePendiente === n;
                  return (
                    <Pressable
                      key={n}
                      disabled={!alcanza || canjeando}
                      onPress={async () => {
                        vibrar.seleccion();
                        if (!confirmando) {
                          setCanjePendiente(n);
                          return;
                        }
                        setCanjeando(true);
                        try {
                          const r = await canjearCometas(n);
                          fijarCometas(r.cometas);
                          fijarChispas(r.chispas);
                          sonar("recompensa");
                          vibrar.exito();
                          mostrarAviso(`+${(n * CHISPAS_POR_COMETA).toLocaleString("es")} Chispas`, "logro");
                          await cargar();
                        } catch (err) {
                          mostrarAviso(mensajeError(err), "error");
                        } finally {
                          setCanjeando(false);
                          setCanjePendiente(null);
                        }
                      }}
                      style={({ pressed }) => [styles.canje, { width: anchoTarjeta * 1.5 + 5 }, confirmando && { borderColor: COLOR_COMETA }, !alcanza && { opacity: 0.45 }, pressed && { transform: [{ scale: 0.96 }] }]}
                    >
                      <View style={styles.fila}>
                        <IconoCometa tam={20} />
                        <Texto v="mono" tam={16}>
                          {n}
                        </Texto>
                      </View>
                      <Texto v="nota" tam={12}>
                        {confirmando ? "Toca otra vez para confirmar" : "se cambian por"}
                      </Texto>
                      <View style={styles.fila}>
                        <IconoChispa tam={16} />
                        <Texto v="mono" tam={16} c={color.logro}>
                          {(n * CHISPAS_POR_COMETA).toLocaleString("es")}
                        </Texto>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <Texto v="nota" tam={12}>
                Consigues Cometas jugando (cada 10 niveles de cuenta, en la liga semanal, con logros y en el reto de fin de semana), con Prodigia Pro (300 al mes) o comprándolos en la web. Comprar desde la app llega con Google Play.
              </Texto>
              {/* Revisión 2026-10-14: la app no tiene cobro todavía (PARIDAD_APP_WEB.md). */}
              <Boton3D titulo="Comprar Cometas en la web" variante="secundario" tamano="sm" onPress={() => WebBrowser.openBrowserAsync(`${URL_WEB}/tienda`)} />
            </Animated.View>
          ) : pestanaVista === "temas" ? (
            <Animated.View key="temas" entering={FadeIn.duration(220)} style={{ paddingHorizontal: 16, paddingTop: 14, gap: 12 }}>
              <View style={styles.avisoTemas}>
                <Texto v="micro" c={color.logro}>
                  Próximamente
                </Texto>
                <Texto v="h3">Cambia el aspecto de toda la app</Texto>
                <Texto v="nota">Colores, letras, tarjetas y botones nuevos para todo Prodigia. Tus mundos, tu progreso y tus cosas quedan iguales.</Texto>
              </View>
              <View style={[styles.grilla, { paddingHorizontal: 0, paddingTop: 0 }]}>
                {TEMAS_APP.map((t) => (
                  <Pressable
                    key={t.slug}
                    onPress={() => {
                      vibrar.seleccion();
                      setTema(t);
                    }}
                    style={({ pressed }) => [styles.item, { width: anchoTarjeta, paddingTop: 8, borderColor: color.border }, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                  >
                    <MiniTema tema={t} ancho={anchoTarjeta - 16} alto={(anchoTarjeta - 16) * 1.3} />
                    <Texto v="fuerte" tam={11.5} numberOfLines={1} centro>
                      {t.nombre}
                    </Texto>
                    <View style={styles.pronto}>
                      <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 9, letterSpacing: 0.8, color: color.logro }}>PRONTO</Texto>
                    </View>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          ) : (
            <Animated.View key={`${modo}-${pestanaVista}`} entering={FadeIn.duration(220)} style={styles.grilla}>
              {items.map((it) => (
                <TarjetaItem key={it.item} it={it} e={e} placa={placa} ancho={anchoTarjeta} onPress={elegirItem} delDia={modo === "tienda" && delDia.has(it.item)} />
              ))}
            </Animated.View>
          )}
          {items.length === 0 && pestanaVista !== null && pestanaVista !== "temas" && pestanaVista !== "cometas" && (
            <View style={{ alignItems: "center", gap: 10, paddingHorizontal: 24, paddingTop: 30 }}>
              <Texto style={{ fontSize: 40 }}>{modo === "inventario" ? "🎒" : "✨"}</Texto>
              <Texto v="nota" centro>
                {modo === "inventario" ? "Todavía no tienes nada de esta sección." : "Ya tienes todo lo de esta sección. Míralo en tu Inventario."}
              </Texto>
              <Boton3D
                titulo={modo === "inventario" ? "Ir a la tienda" : "Ver mi inventario"}
                tamano="sm"
                variante="secundario"
                onPress={() => setModo(modo === "inventario" ? "tienda" : "inventario")}
              />
            </View>
          )}
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
              precioCometas != null ? (
                <>
                  <Boton3D
                    titulo={confirmar ? "¿Seguro? Confirmar compra" : `Comprar por ${precioCometas.toLocaleString("es")} Cometas`}
                    icono={confirmar ? undefined : <IconoCometa tam={18} />}
                    brillo
                    deshabilitado={misCometas < precioCometas}
                    cargando={ocupado}
                    onPress={hacerCompra}
                  />
                  <Texto v="nota" centro tam={12}>
                    {misCometas < precioCometas
                      ? `Lo legendario va con Cometas: te faltan ${(precioCometas - misCometas).toLocaleString("es")}`
                      : `Te quedarán ${(misCometas - precioCometas).toLocaleString("es")} Cometas`}
                  </Texto>
                </>
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
              )
            )}
          </>
        )}
      </Hoja>

      <Hoja visible={!!tema} onCerrar={() => setTema(null)}>
        {tema && (
          <>
            <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
              <MiniTema tema={tema} ancho={96} alto={128} />
              <View style={{ flex: 1, gap: 4 }}>
                <Texto v="micro" c={color.logro}>
                  Tema · Próximamente
                </Texto>
                <Texto v="h2">{tema.nombre}</Texto>
                <Texto v="nota" tam={12}>
                  Inspirado en: {tema.inspiracion}
                </Texto>
              </View>
            </View>
            <Texto v="nota">{tema.descripcion}</Texto>
            <Texto v="nota" tam={12}>
              Cambia solo cómo se ve la app: tus mundos, tu progreso y tus cosas quedan iguales.
            </Texto>
            <Boton3D titulo="Muy pronto" variante="secundario" deshabilitado onPress={() => {}} />
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
  cometasCaja: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: conAlfa(COLOR_COMETA, 0.4), backgroundColor: conAlfa(COLOR_COMETA, 0.07) },
  canje: { alignItems: "center", gap: 6, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: color.border, backgroundColor: color.surface1 },
  avisoTemas: { gap: 4, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: conAlfa(color.logro, 0.35), backgroundColor: conAlfa(color.logro, 0.06) },
  pronto: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, borderWidth: 1, borderColor: conAlfa(color.logro, 0.5) },
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16, paddingTop: 14 },
  marcaDia: { position: "absolute", top: 6, right: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, backgroundColor: color.logro },
  hoy: { borderRadius: 20, padding: 12, gap: 10, overflow: "hidden", borderWidth: 1, borderColor: conAlfa(color.logro, 0.45), backgroundColor: color.surface1 },
  destacado: { flexDirection: "row", gap: 12, alignItems: "center", padding: 10, borderRadius: 16, backgroundColor: conAlfa(color.bgHondo, 0.55) },
  destacadoMuestra: { width: 92, height: 92, borderRadius: 16, alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: color.surface2 },
  puesto: { borderRadius: 12, overflow: "hidden", backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border },
  muestra: { height: 62, alignItems: "center", justifyContent: "center" },
  mini: { width: 74, height: 54, borderRadius: 10, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  precio: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border },
  pro: { position: "absolute", top: 8, right: 8, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6, backgroundColor: color.primario },
  rareza: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  iconoGrande: { width: 70, height: 70, borderRadius: 18, backgroundColor: color.surface2, alignItems: "center", justifyContent: "center" },
  colorBola: { width: 36, height: 36, borderRadius: 18, borderWidth: 3 },
});
