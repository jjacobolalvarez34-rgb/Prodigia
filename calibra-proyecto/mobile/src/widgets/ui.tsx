import { FlexWidget, TextWidget } from "react-native-android-widget";
import type { Resumen } from "~/lib/resumen";

// Widgets de la pantalla de inicio de Android ("Noche de Prodigia": fondo oscuro con
// degradé violeta, la racha en naranja, las Chispas en dorado). Este archivo importa
// el módulo nativo de widgets: solo se carga desde registro.ts / actualizar.ts, que
// lo hacen únicamente en un build propio (nunca en Expo Go).

type Hex = `#${string}`;
const C = {
  fondoDe: "#231A4D" as Hex,
  fondoA: "#090C14" as Hex,
  surface: "#171D34" as Hex,
  surface3: "#1E2542" as Hex,
  borde: "#2E3760" as Hex,
  texto: "#F4F6FB" as Hex,
  texto2: "#8892B0" as Hex,
  racha: "#FF8A3D" as Hex,
  logro: "#FFB627" as Hex,
  neon: "#9B85FF" as Hex,
  numeria: "#6C4CF1" as Hex,
  correcto: "#3DDC97" as Hex,
};

const URI_NUMERIA = "prodigia://numeria";
const URI_AVISOS = "prodigia://avisos";
const URI_APP = "prodigia://";

function formatear(n: number): string {
  return n.toLocaleString("es").replace(/,/g, ".");
}

function Marca() {
  return <TextWidget text="✦ PRODIGIA" style={{ fontSize: 11, color: C.neon, fontWeight: "800", letterSpacing: 0.12 }} />;
}

function SinSesion({ compacto }: { compacto: boolean }) {
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: URI_APP }}
      style={{
        height: "match_parent",
        width: "match_parent",
        borderRadius: 24,
        padding: 16,
        backgroundGradient: { from: C.fondoDe, to: C.fondoA, orientation: "TL_BR" },
        justifyContent: "center",
        alignItems: "center",
        flexGap: 8,
      }}
    >
      <TextWidget text="✦" style={{ fontSize: compacto ? 28 : 34, color: C.logro }} />
      <TextWidget text="Entra a Prodigia" style={{ fontSize: 14, color: C.texto, fontWeight: "700" }} />
      <TextWidget text="para ver tu racha acá" style={{ fontSize: 11, color: C.texto2 }} />
    </FlexWidget>
  );
}

// Widget chico (2×2): la racha, grande, y las Chispas. Tocarlo abre Numeria.
export function WidgetRacha({ resumen }: { resumen: Resumen | null }) {
  if (!resumen) return <SinSesion compacto />;
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: URI_NUMERIA }}
      accessibilityLabel={`Racha de ${resumen.racha} días. Toca para jugar.`}
      style={{
        height: "match_parent",
        width: "match_parent",
        borderRadius: 24,
        padding: 14,
        backgroundGradient: { from: C.fondoDe, to: C.fondoA, orientation: "TL_BR" },
        borderWidth: 1,
        borderColor: C.borde,
        justifyContent: "space-between",
      }}
    >
      <Marca />
      <FlexWidget style={{ flexDirection: "row", alignItems: "center", flexGap: 4 }}>
        <TextWidget text="🔥" style={{ fontSize: 26 }} />
        <TextWidget text={String(resumen.racha)} style={{ fontSize: 38, color: C.racha, fontWeight: "900" }} />
      </FlexWidget>
      <TextWidget text={resumen.racha === 1 ? "día de racha" : "días de racha"} style={{ fontSize: 12, color: C.texto2, fontWeight: "600" }} />
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: C.surface,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 4,
          flexGap: 4,
        }}
      >
        <TextWidget text="⚡" style={{ fontSize: 12 }} />
        <TextWidget text={formatear(resumen.chispas)} style={{ fontSize: 13, color: C.logro, fontWeight: "800" }} />
      </FlexWidget>
    </FlexWidget>
  );
}

function Dato({ icono, valor, etiqueta, color }: { icono: string; valor: string; etiqueta: string; color: Hex }) {
  return (
    <FlexWidget style={{ flex: 1, backgroundColor: C.surface, borderRadius: 16, paddingVertical: 8, paddingHorizontal: 10, flexGap: 2 }}>
      <TextWidget text={`${icono} ${valor}`} style={{ fontSize: 17, color, fontWeight: "900" }} truncate="END" maxLines={1} />
      <TextWidget text={etiqueta} style={{ fontSize: 10, color: C.texto2, fontWeight: "700" }} />
    </FlexWidget>
  );
}

// Widget mediano (4×2): racha, Chispas, nivel, meta del día, avisos sin leer y un
// botón para jugar.
export function WidgetProgreso({ resumen }: { resumen: Resumen | null }) {
  if (!resumen) return <SinSesion compacto={false} />;
  const pct = Math.max(0, Math.min(100, Math.round((resumen.xpHoy / Math.max(1, resumen.metaDiaria)) * 100)));
  const avisos = resumen.mensajesSinLeer + resumen.novedadesSinLeer;
  const metaCumplida = pct >= 100;

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: URI_APP }}
      style={{
        height: "match_parent",
        width: "match_parent",
        borderRadius: 24,
        padding: 14,
        backgroundGradient: { from: C.fondoDe, to: C.fondoA, orientation: "TL_BR" },
        borderWidth: 1,
        borderColor: C.borde,
        flexGap: 10,
      }}
    >
      <FlexWidget style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "match_parent" }}>
        <Marca />
        {avisos > 0 ? (
          <FlexWidget
            clickAction="OPEN_URI"
            clickActionData={{ uri: URI_AVISOS }}
            style={{ backgroundColor: C.numeria, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}
          >
            <TextWidget text={`🔔 ${avisos} ${avisos === 1 ? "aviso" : "avisos"}`} style={{ fontSize: 11, color: C.texto, fontWeight: "800" }} />
          </FlexWidget>
        ) : (
          <TextWidget text={`Hola, ${resumen.nombre}`} style={{ fontSize: 11, color: C.texto2, fontWeight: "600" }} truncate="END" maxLines={1} />
        )}
      </FlexWidget>

      <FlexWidget style={{ flexDirection: "row", flexGap: 8, width: "match_parent" }}>
        <Dato icono="🔥" valor={String(resumen.racha)} etiqueta="RACHA" color={C.racha} />
        <Dato icono="⚡" valor={formatear(resumen.chispas)} etiqueta="CHISPAS" color={C.logro} />
        <Dato icono="★" valor={String(resumen.nivelCuenta)} etiqueta="NIVEL" color={C.neon} />
      </FlexWidget>

      <FlexWidget style={{ flexGap: 5, width: "match_parent" }}>
        <FlexWidget style={{ flexDirection: "row", justifyContent: "space-between", width: "match_parent" }}>
          <TextWidget text={metaCumplida ? "Meta del día cumplida ✓" : "Meta del día"} style={{ fontSize: 11, color: metaCumplida ? C.correcto : C.texto2, fontWeight: "700" }} />
          <TextWidget text={`${resumen.xpHoy}/${resumen.metaDiaria}`} style={{ fontSize: 11, color: C.texto2, fontWeight: "700" }} />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: "row", height: 8, width: "match_parent", backgroundColor: C.surface3, borderRadius: 4, overflow: "hidden" }}>
          {pct > 0 && <FlexWidget style={{ flex: pct, height: 8, borderRadius: 4, backgroundColor: metaCumplida ? C.correcto : C.neon }} />}
          {pct < 100 && <FlexWidget style={{ flex: 100 - pct, height: 8 }} />}
        </FlexWidget>
      </FlexWidget>

      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: URI_NUMERIA }}
        style={{
          width: "match_parent",
          backgroundColor: C.numeria,
          borderRadius: 14,
          paddingVertical: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TextWidget text="▶  Jugar un sprint de 60 s" style={{ fontSize: 13, color: C.texto, fontWeight: "800" }} />
      </FlexWidget>
    </FlexWidget>
  );
}

export const WIDGETS = {
  Racha: WidgetRacha,
  Progreso: WidgetProgreso,
} as const;

export type NombreWidget = keyof typeof WIDGETS;
