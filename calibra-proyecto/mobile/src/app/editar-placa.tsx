import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { sonar, vibrar } from "~/lib/efectos";
import { recargarJugador, useJugador } from "~/lib/jugador";
import { cargarTitulos, elegirTitulo, type Titulo } from "~/lib/logros";
import { FUENTE_FAMILIA, type PlacaDatos } from "~/lib/placa";
import { useSesion } from "~/lib/sesion";
import { mensajeError } from "~/lib/supabase";
import { CATALOGO, cambiarNombre, cargarTienda, equipar, loTiene, precioDe, subirAvatar, subirFondo, type Categoria, type EstadoTienda, type ItemTienda } from "~/lib/tienda";
import { mostrarAviso } from "~/ui/Aviso";
import Boton3D from "~/ui/Boton3D";
import { IconoCandado, IconoChispa } from "~/ui/Iconos";
import { PantallaApilada } from "~/ui/Pantalla";
import AvatarMarco from "~/ui/placa/AvatarMarco";
import FondoPlaca from "~/ui/placa/FondoPlaca";
import { PlacaCompleta } from "~/ui/placa/Placa";
import Segmentos from "~/ui/Segmentos";
import Texto from "~/ui/Texto";
import { color, conAlfa, fuente } from "~/tema";

// Editor de placa (03-PANTALLAS §4.11b): la Placa en vivo arriba y abajo las
// pestañas. Lo que no tienes aparece con candado y precio: tocarlo lo prueba sobre
// tu Placa y te lleva a la tienda.
type Pestana = "fondo" | "avatar" | "marco" | "nombre" | "titulo";

function Opcion({ activo, bloqueado, precio, onPress, children, etiqueta }: { activo: boolean; bloqueado?: boolean; precio?: number; onPress: () => void; children: ReactNode; etiqueta: string }) {
  return (
    <Pressable
      onPress={() => {
        vibrar.seleccion();
        onPress();
      }}
      style={({ pressed }) => [styles.opcion, activo && { borderColor: color.primario, boxShadow: `0px 0px 14px ${conAlfa(color.primario, 0.45)}` }, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
    >
      <View style={styles.opcionMuestra}>{children}</View>
      <Texto v="fuerte" tam={11} numberOfLines={1} centro>
        {etiqueta}
      </Texto>
      {bloqueado ? (
        <View style={styles.fila}>
          <IconoCandado tam={11} c={color.texto2} />
          {precio != null && (
            <>
              <IconoChispa tam={11} />
              <Texto v="mono" tam={10}>
                {precio.toLocaleString("es")}
              </Texto>
            </>
          )}
        </View>
      ) : activo ? (
        <Texto v="fuerte" tam={10} c={color.correcto}>
          EN USO
        </Texto>
      ) : null}
    </Pressable>
  );
}

export default function EditarPlaca() {
  const router = useRouter();
  const { sesion } = useSesion();
  const userId = sesion?.user.id;
  const { placa } = useJugador();
  const [pestana, setPestana] = useState<Pestana>("fondo");
  const [e, setE] = useState<EstadoTienda | null>(null);
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [prueba, setPrueba] = useState<Partial<PlacaDatos>>({});
  const [nombre, setNombre] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    if (!userId) return;
    const [t, ti] = await Promise.all([cargarTienda(userId), cargarTitulos(userId)]);
    setE(t);
    setTitulos(ti.filter((x) => x.ganado));
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      cargar();
      setPrueba({});
    }, [cargar])
  );

  if (!placa || !e) {
    return (
      <PantallaApilada titulo="Tu placa">
        <Texto v="nota">Cargando…</Texto>
      </PantallaApilada>
    );
  }

  const vista: PlacaDatos = { ...placa, ...prueba };

  async function aplicar(it: ItemTienda | null, cat: Categoria, ninguno?: string) {
    if (it && !loTiene(it, e!)) {
      // Prueba sin comprar: se ve puesto y se ofrece la tienda.
      mostrarAviso(`Así se ve ${it.nombre}. Cómpralo en la tienda.`, "info");
      return;
    }
    setOcupado(true);
    try {
      await equipar(it, cat, ninguno);
      sonar("boton");
      setPrueba({});
      await Promise.all([recargarJugador(), cargar()]);
    } catch (err) {
      mostrarAviso(mensajeError(err), "error");
    } finally {
      setOcupado(false);
    }
  }

  const items = (cat: Categoria) => CATALOGO.filter((x) => x.categoria === cat);
  const galeria: ItemTienda[] = e.galeria.map((g) => ({ item: `galeria:${g.slug}` as const, nombre: g.nombre, categoria: "galeria" as const, valor: g.slug, costoBase: g.costo, imagen: g.url }));

  return (
    <PantallaApilada
      titulo="Tu placa"
      subtitulo="Así la ven los demás"
      derecha={
        Object.keys(prueba).length > 0 ? (
          <Boton3D titulo="Tienda" tamano="sm" variante="logro" estilo={{ width: 100 }} onPress={() => router.push("/tienda")} />
        ) : null
      }
    >
      <Animated.View key={JSON.stringify(prueba)} entering={FadeIn.duration(200)}>
        <PlacaCompleta placa={vista} estilo={{ minHeight: 300 }} />
      </Animated.View>

      <Segmentos<Pestana>
        opciones={[
          { id: "fondo", titulo: "Fondo" },
          { id: "avatar", titulo: "Avatar" },
          { id: "marco", titulo: "Marco" },
          { id: "nombre", titulo: "Nombre" },
          { id: "titulo", titulo: "Título" },
        ]}
        valor={pestana}
        onCambio={(p) => {
          setPestana(p);
          setPrueba({});
        }}
      />

      {pestana === "fondo" && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            <Opcion etiqueta="Ninguno" activo={placa.fondo === "ninguno"} onPress={() => aplicar(null, "fondo", "ninguno")}>
              <View style={styles.miniFondo}>
                <FondoPlaca fondo="ninguno" url={null} velo={false} />
              </View>
            </Opcion>
            {items("fondo").map((it) => {
              const tiene = loTiene(it, e);
              return (
                <Opcion
                  key={it.item}
                  etiqueta={it.nombre}
                  activo={placa.fondo === it.valor}
                  bloqueado={!tiene}
                  precio={precioDe(it)}
                  onPress={() => {
                    setPrueba({ fondo: it.valor, fondoUrl: it.valor === "personalizado" ? e.fondoUrl : placa.fondoUrl });
                    if (tiene && it.valor !== "personalizado") aplicar(it, "fondo");
                  }}
                >
                  <View style={styles.miniFondo}>
                    <FondoPlaca fondo={it.valor === "personalizado" ? "ninguno" : it.valor} url={null} velo={false} animar={false} />
                  </View>
                </Opcion>
              );
            })}
            {galeria.map((it) => (
              <Opcion
                key={it.item}
                etiqueta={it.nombre}
                activo={placa.fondo === "personalizado" && placa.fondoUrl === it.imagen}
                bloqueado={!loTiene(it, e)}
                precio={it.costoBase}
                onPress={() => {
                  setPrueba({ fondo: "personalizado", fondoUrl: it.imagen ?? null });
                  if (loTiene(it, e)) aplicar(it, "galeria");
                }}
              >
                <View style={styles.miniFondo}>
                  <FondoPlaca fondo="personalizado" url={it.imagen ?? null} velo={false} animar={false} />
                </View>
              </Opcion>
            ))}
          </ScrollView>
          {e.fondos.includes("personalizado") ? (
            <Boton3D
              titulo="Subir mi imagen o GIF"
              variante="secundario"
              cargando={ocupado}
              onPress={async () => {
                if (!userId) return;
                setOcupado(true);
                try {
                  if (await subirFondo(userId)) {
                    sonar("recompensa");
                    await recargarJugador();
                  }
                } catch (err) {
                  mostrarAviso(mensajeError(err), "error");
                } finally {
                  setOcupado(false);
                }
              }}
            />
          ) : (
            <Texto v="nota" tam={12}>
              Con «Fondo personalizado» (tienda) puedes subir tu propia imagen o GIF.
            </Texto>
          )}
        </>
      )}

      {pestana === "avatar" && (
        <View style={{ alignItems: "center", gap: 14 }}>
          <AvatarMarco url={placa.avatarUrl} nombre={placa.nombre} marco={placa.marco} tam={110} />
          <Texto v="nota" centro>
            Una foto o un GIF (PNG, JPG, WEBP o GIF, hasta 2 MB). Se ve en tu Placa, en el ranking y en el chat.
          </Texto>
          <Boton3D
            titulo="Elegir imagen"
            cargando={ocupado}
            onPress={async () => {
              if (!userId) return;
              setOcupado(true);
              try {
                if (await subirAvatar(userId)) {
                  sonar("recompensa");
                  await recargarJugador();
                  mostrarAviso("¡Avatar nuevo!", "ok");
                }
              } catch (err) {
                mostrarAviso(mensajeError(err), "error");
              } finally {
                setOcupado(false);
              }
            }}
          />
        </View>
      )}

      {pestana === "marco" && (
        <View style={styles.grilla}>
          <Opcion etiqueta="Sin marco" activo={placa.marco === "ninguno"} onPress={() => aplicar(null, "marco", "ninguno")}>
            <AvatarMarco url={placa.avatarUrl} nombre={placa.nombre} marco="ninguno" tam={46} animar={false} />
          </Opcion>
          {[...items("marco"), ...items("marco_mundo")].map((it) => {
            const tiene = loTiene(it, e);
            return (
              <Opcion
                key={it.item}
                etiqueta={it.nombre.replace("Marco ", "")}
                activo={placa.marco === it.valor}
                bloqueado={!tiene}
                precio={precioDe(it)}
                onPress={() => {
                  setPrueba({ marco: it.valor });
                  if (tiene) aplicar(it, it.categoria);
                }}
              >
                <AvatarMarco url={placa.avatarUrl} nombre={placa.nombre} marco={it.valor} tam={46} animar={false} />
              </Opcion>
            );
          })}
        </View>
      )}

      {pestana === "nombre" && (
        <>
          <View style={styles.fila}>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder={placa.nombre}
              placeholderTextColor={color.texto2}
              maxLength={40}
              style={styles.input}
            />
            <Boton3D
              titulo="Guardar"
              tamano="sm"
              estilo={{ width: 110 }}
              deshabilitado={nombre.trim().length < 2}
              cargando={ocupado}
              onPress={async () => {
                setOcupado(true);
                try {
                  await cambiarNombre(nombre);
                  sonar("recompensa");
                  setNombre("");
                  await recargarJugador();
                  mostrarAviso("Nombre cambiado", "ok");
                } catch (err) {
                  mostrarAviso(mensajeError(err), "error");
                } finally {
                  setOcupado(false);
                }
              }}
            />
          </View>
          <Texto v="nota" tam={12}>
            Cambiar de nombre cuesta 100 Chispas (el primero es gratis).
          </Texto>
          <Texto v="micro">Tipografía</Texto>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            <Opcion etiqueta="Normal" activo={placa.fuente === "default"} onPress={() => aplicar(null, "fuente", "default")}>
              <Texto style={{ fontFamily: fuente.display, fontSize: 26, color: color.texto }}>Aa</Texto>
            </Opcion>
            {items("fuente").map((it) => (
              <Opcion
                key={it.item}
                etiqueta={it.nombre.replace("Fuente ", "")}
                activo={placa.fuente === it.valor}
                bloqueado={!loTiene(it, e)}
                precio={precioDe(it)}
                onPress={() => {
                  setPrueba({ fuente: it.valor });
                  if (loTiene(it, e)) aplicar(it, "fuente");
                }}
              >
                <Texto style={{ fontFamily: FUENTE_FAMILIA[it.valor], fontSize: 26, color: color.texto }}>Aa</Texto>
              </Opcion>
            ))}
          </ScrollView>
          <Texto v="micro">Animación</Texto>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            <Opcion etiqueta="Ninguna" activo={placa.animacion === "ninguna"} onPress={() => aplicar(null, "animacion", "ninguna")}>
              <Texto v="h3">Aa</Texto>
            </Opcion>
            {items("animacion").map((it) => (
              <Opcion
                key={it.item}
                etiqueta={it.nombre}
                activo={placa.animacion === it.valor}
                bloqueado={!loTiene(it, e)}
                precio={precioDe(it)}
                onPress={() => {
                  setPrueba({ animacion: it.valor });
                  if (loTiene(it, e)) aplicar(it, "animacion");
                }}
              >
                <Texto style={{ fontFamily: fuente.display, fontSize: 18, color: color.primarioClaro }}>✦</Texto>
              </Opcion>
            ))}
          </ScrollView>
        </>
      )}

      {pestana === "titulo" && (
        <View style={{ gap: 8 }}>
          {titulos.length === 0 ? (
            <Texto v="nota">Todavía no ganaste títulos. Se ganan jugando: rachas, duelos, mundos completos…</Texto>
          ) : (
            titulos.map((t) => (
              <Pressable
                key={t.slug}
                onPress={async () => {
                  vibrar.seleccion();
                  try {
                    await elegirTitulo(t.slug);
                    sonar("boton");
                    await Promise.all([recargarJugador(), cargar()]);
                  } catch (err) {
                    mostrarAviso(mensajeError(err), "error");
                  }
                }}
                style={[styles.titulo, t.activo && { borderColor: color.logro, backgroundColor: conAlfa(color.logro, 0.1) }]}
              >
                <Texto v="fuerte">«{t.nombre}»</Texto>
                {t.activo && (
                  <Texto v="fuerte" tam={11} c={color.logro}>
                    EN USO
                  </Texto>
                )}
              </Pressable>
            ))
          )}
        </View>
      )}
    </PantallaApilada>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 6 },
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  opcion: { width: 96, padding: 8, gap: 5, borderRadius: 14, borderWidth: 1.5, borderColor: color.border, backgroundColor: color.surface1, alignItems: "center" },
  opcionMuestra: { height: 56, alignItems: "center", justifyContent: "center" },
  miniFondo: { width: 70, height: 50, borderRadius: 10, overflow: "hidden" },
  input: { flex: 1, backgroundColor: color.surface1, borderWidth: 1, borderColor: color.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, color: color.texto, fontFamily: "Inter_500Medium", fontSize: 15 },
  titulo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface1 },
});
