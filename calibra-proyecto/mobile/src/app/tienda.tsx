import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInRight, ZoomIn } from "react-native-reanimated";
import { sonar, vibrar } from "~/lib/efectos";
import { fijarChispas, recargarJugador, useJugador } from "~/lib/jugador";
import type { PlacaDatos } from "~/lib/placa";
import { useSesion } from "~/lib/sesion";
import { mensajeError } from "~/lib/supabase";
import {
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
  rarezaDe,
  subirFondo,
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
import { PantallaApilada, TituloSeccion } from "~/ui/Pantalla";
import AvatarMarco from "~/ui/placa/AvatarMarco";
import FondoPlaca from "~/ui/placa/FondoPlaca";
import NombreEstilizado from "~/ui/placa/NombreEstilizado";
import { PlacaTarjeta } from "~/ui/placa/Placa";
import Tarjeta from "~/ui/Tarjeta";
import Texto from "~/ui/Texto";
import { brillo, color, conAlfa, fuente } from "~/tema";
import { FUENTE_FAMILIA } from "~/lib/placa";

const SECCIONES: { cat: Categoria; titulo: string; nota?: string }[] = [
  { cat: "utilidad", titulo: "Puesto de utilidades", nota: "Para tus partidas y tu racha" },
  { cat: "marco", titulo: "Herrero de marcos" },
  { cat: "marco_mundo", titulo: "Marcos de ciudad", nota: "Se ganan llegando al nivel 40 de cada ciudad" },
  { cat: "fuente", titulo: "Tipografías para tu nombre" },
  { cat: "animacion", titulo: "Animaciones de nombre" },
  { cat: "fondo", titulo: "Fondos de Placa" },
  { cat: "galeria", titulo: "Galería de fondos animados" },
  { cat: "color", titulo: "Color de nombre" },
];

const COLORES_NOMBRE = ["#FFFFFF", "#FFB627", "#FF8A3D", "#FF5D5D", "#E36BF2", "#9B85FF", "#4FE0F5", "#3DDC97", "#A8E84A", "#F2C14E"];

function IconoUtilidad({ item }: { item: string }) {
  if (item === "escudo") return <IconoEscudo tam={34} />;
  if (item === "congelamiento") return <IconoCopo tam={32} c="#7FD8FF" />;
  if (item === "boost") return <IconoRayo tam={32} c={color.logro} />;
  if (item === "hielo") return <IconoCopo tam={32} c="#BDEBFF" />;
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
          <FondoPlaca fondo={it.valor === "personalizado" ? "ninguno" : it.valor} url={null} velo={false} />
          {it.valor === "personalizado" && <Texto style={{ fontFamily: fuente.display, fontSize: 18, color: color.texto }}>GIF</Texto>}
        </View>
      );
    case "galeria":
      return <Image source={{ uri: it.imagen }} style={styles.mini} contentFit="cover" autoplay={false} />;
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

function TarjetaItem({ it, e, placa, indice, onPress }: { it: ItemTienda; e: EstadoTienda; placa: PlacaDatos; indice: number; onPress: () => void }) {
  const precio = precioDe(it);
  const rareza = rarezaDe(it.costoBase);
  const c = COLOR_RAREZA[rareza];
  const tiene = loTiene(it, e);
  const usa = loUsa(it, e);
  const cantidad = cantidadUtilidad(it, e);
  const oferta = precio < it.costoBase;
  return (
    <Animated.View entering={FadeInRight.delay(indice * 45).duration(300)}>
      <Pressable
        onPress={() => {
          vibrar.seleccion();
          onPress();
        }}
        style={({ pressed }) => [
          styles.item,
          { borderColor: usa ? color.correcto : conAlfa(c, rareza === "comun" ? 0.4 : 0.75) },
          rareza === "legendario" && { boxShadow: brillo(c, 16, 0.3) },
          { transform: [{ scale: pressed ? 0.95 : 1 }] },
        ]}
      >
        <View style={[styles.franja, { backgroundColor: c }]} />
        <View style={styles.muestra}>
          <Muestra it={it} placa={placa} />
        </View>
        <Texto v="fuerte" tam={12} numberOfLines={2} centro style={{ minHeight: 32 }}>
          {it.nombre}
        </Texto>
        {it.categoria === "utilidad" ? (
          <Texto v="nota" tam={11}>
            Tienes {cantidad}
          </Texto>
        ) : usa ? (
          <Texto v="fuerte" tam={11} c={color.correcto}>
            EN USO
          </Texto>
        ) : tiene ? (
          <Texto v="fuerte" tam={11} c={color.primarioClaro}>
            TUYO
          </Texto>
        ) : (
          <Texto v="nota" tam={10} c={c}>
            {NOMBRE_RAREZA[rareza].toUpperCase()}
          </Texto>
        )}
        {(!tiene || it.categoria === "utilidad") && (
          <View style={[styles.precio, oferta && { borderColor: color.correcto }]}>
            <IconoChispa tam={13} />
            <Texto v="mono" tam={12} c={oferta ? color.correcto : color.texto}>
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
    </Animated.View>
  );
}

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
      if (elegido.categoria !== "utilidad" && elegido.categoria !== "color" && !(elegido.categoria === "fondo" && elegido.valor === "personalizado")) {
        await equipar(elegido, elegido.categoria).catch(() => {});
      }
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
      await Promise.all([cargar(), recargarJugador()]);
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
  const ninguno: Partial<Record<Categoria, string>> = { marco: "ninguno", marco_mundo: "ninguno", fuente: "default", animacion: "ninguna", fondo: "ninguno", galeria: "ninguno" };

  return (
    <View style={{ flex: 1 }}>
      <PantallaApilada
        titulo="Tienda"
        subtitulo="El bazar de Prodigia"
       
        derecha={
          <View style={styles.saldo}>
            <IconoChispa tam={18} />
            <NumeroAnimado valor={e.chispas} v="mono" onTic={() => sonar("moneda")} />
          </View>
        }
      >
        {itemOferta && (
          <Tarjeta acento={color.correcto} brillo={0.22} onPress={() => { setElegido(itemOferta); setConfirmar(false); }}>
            <View style={styles.fila}>
              <Animated.View entering={ZoomIn.delay(200).duration(320)} style={styles.etiquetaOferta}>
                <Texto style={{ fontFamily: fuente.display, fontSize: 18, color: "#062B1C" }}>−{descuento.porcentaje}%</Texto>
              </Animated.View>
              <View style={{ flex: 1 }}>
                <Texto v="micro" c={color.correcto}>
                  Oferta del vendedor · solo hoy
                </Texto>
                <Texto v="h3">{itemOferta.nombre}</Texto>
                <Texto v="nota">
                  <Texto v="mono" tam={13} c={color.texto2} style={{ textDecorationLine: "line-through" }}>
                    {itemOferta.costoBase.toLocaleString("es")}
                  </Texto>{" "}
                  →{" "}
                  <Texto v="mono" tam={13} c={color.correcto}>
                    {precioDe(itemOferta).toLocaleString("es")}
                  </Texto>
                </Texto>
              </View>
            </View>
          </Tarjeta>
        )}

        {SECCIONES.map((s) => {
          const items = catalogo.filter((x) => x.categoria === s.cat);
          if (items.length === 0) return null;
          return (
            <View key={s.cat} style={{ gap: 8 }}>
              <TituloSeccion>{s.titulo}</TituloSeccion>
              {s.nota ? (
                <Texto v="nota" tam={12} style={{ marginTop: -4 }}>
                  {s.nota}
                </Texto>
              ) : null}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
                {items.map((it, i) => (
                  <TarjetaItem
                    key={it.item}
                    it={it}
                    e={e}
                    placa={placa}
                    indice={i}
                    onPress={() => {
                      setElegido(it);
                      setConfirmar(false);
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          );
        })}
        <Texto v="nota" tam={12} centro style={{ marginTop: 8 }}>
          Las Chispas se ganan jugando. Muy pronto también se podrán conseguir paquetes desde la app.
        </Texto>
      </PantallaApilada>

      <Hoja visible={!!elegido} onCerrar={() => setElegido(null)}>
        {elegido && (
          <>
            {elegido.categoria !== "utilidad" ? (
              <View key={elegido.item} style={{ flexDirection: "row", gap: 10 }}>
                <PlacaTarjeta placa={previa} onPress={() => {}} />
                <View style={{ flex: 1.1, justifyContent: "center", gap: 6 }}>
                  <View style={[styles.rareza, { borderColor: COLOR_RAREZA[rarezaDe(elegido.costoBase)] }]}>
                    <Texto style={{ fontFamily: fuente.cuerpoBold, fontSize: 10, color: COLOR_RAREZA[rarezaDe(elegido.costoBase)], letterSpacing: 1 }}>
                      {NOMBRE_RAREZA[rarezaDe(elegido.costoBase)].toUpperCase()}
                    </Texto>
                  </View>
                  <Texto v="h2">{elegido.nombre}</Texto>
                  {elegido.descripcion ? <Texto v="nota">{elegido.descripcion}</Texto> : <Texto v="nota">Así se ve en tu Placa.</Texto>}
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
  etiquetaOferta: { width: 64, height: 64, borderRadius: 16, backgroundColor: color.correcto, alignItems: "center", justifyContent: "center", transform: [{ rotate: "-6deg" }] },
  item: { width: 116, borderRadius: 16, borderWidth: 1.5, backgroundColor: color.surface1, padding: 10, paddingTop: 14, alignItems: "center", gap: 6, overflow: "hidden" },
  franja: { position: "absolute", top: 0, left: 0, right: 0, height: 3 },
  muestra: { height: 62, alignItems: "center", justifyContent: "center" },
  mini: { width: 74, height: 54, borderRadius: 10, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  precio: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border },
  pro: { position: "absolute", top: 8, right: 8, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6, backgroundColor: color.primario },
  rareza: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  iconoGrande: { width: 70, height: 70, borderRadius: 18, backgroundColor: color.surface2, alignItems: "center", justifyContent: "center" },
  colorBola: { width: 36, height: 36, borderRadius: 18, borderWidth: 3 },
});
