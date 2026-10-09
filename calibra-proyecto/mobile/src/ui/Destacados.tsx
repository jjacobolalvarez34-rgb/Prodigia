import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { hayWidgets, URL_WEB } from "~/lib/entorno";
import { anclarWidget } from "~/widgets/registro";
import { color, radio, fuente } from "~/tema";

// Carrusel "Destacados" del inicio: las cosas de Prodigia que vale la pena probar,
// cada una con la luz de su mundo. Lo que todavía no está en la app abre la web.
// Sin ofertas de compra ni urgencias falsas (04-BUCLE-DE-ENGANCHE.md §6) y sin
// enlaces a pagar fuera de Google Play (política de pagos de Play).

interface Destacado {
  id: string;
  etiqueta: string;
  titulo: string;
  texto: string;
  icono: string;
  colores: [string, string];
  acento: string;
  accion: () => void;
}

export interface NovedadDestacada {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: "evento" | "actualizacion" | "arreglo";
}

const ANCHO = 280;

export default function Destacados({ novedades }: { novedades: NovedadDestacada[] }) {
  const router = useRouter();
  const web = (ruta: string) => () => Linking.openURL(`${URL_WEB}${ruta}`);

  const tarjetas: Destacado[] = [
    ...novedades
      .filter((n) => n.tipo !== "arreglo")
      .slice(0, 2)
      .map((n) => ({
        id: `anuncio-${n.id}`,
        etiqueta: n.tipo === "evento" ? "🎉 EVENTO" : "✨ NOVEDAD",
        titulo: n.titulo,
        texto: n.descripcion,
        icono: n.tipo === "evento" ? "🎉" : "✨",
        colores: (n.tipo === "evento" ? ["#5A3A06", "#1A1206"] : ["#3B2C8F", "#140F33"]) as [string, string],
        acento: n.tipo === "evento" ? "#FFB627" : "#9B85FF",
        accion: () => router.push("/avisos"),
      })),
    {
      id: "sprint",
      etiqueta: "NUMERIA",
      titulo: "60 segundos, 4 operaciones",
      texto: "La dificultad se ajusta sola a tu nivel. ¿Cuántas sacas hoy?",
      icono: "÷",
      colores: ["#4A33B8", "#140F33"],
      acento: "#9B85FF",
      accion: () => router.push("/numeria"),
    },
    {
      id: "aprender",
      etiqueta: "APRENDER",
      titulo: "Técnicas y Clases en los 15 mundos",
      texto: "Trucos de cálculo mental, química, música, código… también en inglés.",
      icono: "📚",
      colores: ["#0B5E57", "#08201E"],
      acento: "#2DD4BF",
      accion: web("/aprender"),
    },
    {
      id: "duelos",
      etiqueta: "RANKEDS",
      titulo: "Duelos en vivo",
      texto: "Mide tu velocidad contra otra persona en tiempo real y sube de liga.",
      icono: "⚔️",
      colores: ["#7A1F2B", "#200A0E"],
      acento: "#FF5D5D",
      accion: web("/rankeds"),
    },
    {
      id: "clanes",
      etiqueta: "CLANES",
      titulo: "Tu clan, tu ciudad",
      texto: "Suma Exp con tu clan, cumplan la misión semanal y reclamen las Chispas.",
      icono: "🏰",
      colores: ["#6B3A12", "#1F1106"],
      acento: "#E08A5C",
      accion: web("/clanes"),
    },
    {
      id: "reto",
      etiqueta: "RETO DIARIO",
      titulo: "5 preguntas, un ranking",
      texto: "El mismo reto para todos. Compara tu resultado con tus amigos.",
      icono: "🎯",
      colores: ["#1E6A2A", "#0A1F0D"],
      acento: "#3DDC97",
      accion: web("/reto-diario"),
    },
    ...(hayWidgets
      ? [
          {
            id: "widget",
            etiqueta: "NUEVO EN LA APP",
            titulo: "Tu racha en la pantalla de inicio",
            texto: "Agrega el widget de Prodigia y mira tu racha sin abrir la app.",
            icono: "📱",
            colores: ["#3B2C8F", "#090C14"] as [string, string],
            acento: "#FFB627",
            accion: () => anclarWidget("Progreso"),
          },
        ]
      : []),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={ANCHO + 12}
      decelerationRate="fast"
      contentContainerStyle={styles.fila}
    >
      {tarjetas.map((t) => (
        <Pressable key={t.id} onPress={t.accion} style={({ pressed }) => [pressed && { transform: [{ scale: 0.97 }] }]}>
          <LinearGradient colors={t.colores} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.tarjeta, { borderColor: t.acento + "66" }]}>
            <Text style={styles.iconoFondo}>{t.icono}</Text>
            <Text style={[styles.etiqueta, { color: t.acento }]}>{t.etiqueta}</Text>
            <Text style={styles.titulo} numberOfLines={2}>
              {t.titulo}
            </Text>
            <Text style={styles.texto} numberOfLines={3}>
              {t.texto}
            </Text>
            <View style={[styles.ir, { backgroundColor: t.acento }]}>
              <Text style={styles.irTexto}>›</Text>
            </View>
          </LinearGradient>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fila: { gap: 12, paddingRight: 20 },
  tarjeta: { width: ANCHO, height: 170, borderRadius: radio.tarjeta, borderWidth: 1, padding: 16, overflow: "hidden", gap: 6 },
  iconoFondo: { position: "absolute", right: -6, bottom: -18, fontSize: 96, opacity: 0.16, color: "#FFFFFF" },
  etiqueta: { fontSize: 11, fontFamily: fuente.display, letterSpacing: 1 },
  titulo: { color: color.texto, fontSize: 19, fontFamily: fuente.display, lineHeight: 24, paddingRight: 28 },
  texto: { fontFamily: fuente.cuerpo, color: "#C8CEE0", fontSize: 13, lineHeight: 18, paddingRight: 32 },
  ir: { position: "absolute", right: 14, top: 14, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  irTexto: { color: "#0B0712", fontSize: 20, fontFamily: fuente.display, lineHeight: 22 },
});
