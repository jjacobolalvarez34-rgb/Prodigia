// La tarjeta-imagen del resultado (2026-10-21) para ImageResponse (next/og,
// Satori): solo flexbox y estilos en línea. La usan /api/partida/tarjeta (la
// imagen que se comparte) y la vista previa de /partida/<id> en redes.
// Dos formatos: "post" (1080×1350, la que se comparte) y "og" (1200×630, la
// vista previa de un enlace). Sin emojis ni destellos: el logo de Prodigia.
import type { ReactElement } from "react";
import { COLOR_MUNDO, type MundoDuelo } from "@/lib/duelos/rutas";
import { aciertosTexto, type LadoTarjeta, type TarjetaPartida } from "./compartir";
import type { RespuestaPartida } from "./estadisticas";

export type FormatoTarjeta = "post" | "og";
export const MEDIDAS_TARJETA: Record<FormatoTarjeta, { width: number; height: number }> = {
  post: { width: 1080, height: 1350 },
  og: { width: 1200, height: 630 },
};

export interface TextosTarjeta {
  mundo: string;
  etiqueta: string;
  resultado: string | null;
  aciertos: string;
  precision: string;
  tiempoProm: string;
  exp: string;
  racha: string;
  tu: string;
  rival: string;
  porPregunta: string;
  pie: string;
  fecha: string | null;
}

const FONDO = "#090C14";
const SUPERFICIE = "rgba(255,255,255,0.06)";
const BORDE = "rgba(255,255,255,0.12)";
const TEXTO = "#F4F6FB";
const TEXTO2 = "#A3ACC8";
const CORRECTO = "#3DDC97";
const ERROR = "#FF5D5D";
const LOGRO = "#FFB627";

// El logo (src/app/icon.svg) en línea: la «C» violeta con la chispa dorada.
const LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#A794FF"/><stop offset="50%" stop-color="#E4CBA0"/><stop offset="100%" stop-color="#FFC53D"/></linearGradient></defs><circle cx="50" cy="50" r="34" fill="none" stroke="#7C5CFF" stroke-width="14" stroke-dasharray="158.6 55" stroke-dashoffset="27.5" transform="rotate(82 50 50)"/><g transform="translate(82 44) rotate(14)" fill="url(#g)"><path d="M0,0 C-10,-9 -5,-27 0.5,-36 C4,-24 7,-8 0,0 Z"/><path d="M0,0 C-10,-9 -5,-27 0.5,-36 C4,-24 7,-8 0,0 Z" transform="rotate(180) scale(0.33)"/><path d="M0,0 C-10,-9 -5,-27 0.5,-36 C4,-24 7,-8 0,0 Z" transform="rotate(84) scale(0.2)"/><path d="M0,0 C-10,-9 -5,-27 0.5,-36 C4,-24 7,-8 0,0 Z" transform="rotate(268) scale(0.15)"/></g></svg>';
const LOGO_URI = `data:image/svg+xml;base64,${Buffer.from(LOGO_SVG).toString("base64")}`;

function colorResultado(t: TarjetaPartida, acento: string): string {
  if (t.resultado === "victoria") return LOGRO;
  if (t.resultado === "derrota") return ERROR;
  if (t.resultado === "empate") return "#B9A8FF";
  return acento;
}

function segundos(ms: number | null): string {
  return ms == null ? "—" : `${(ms / 1000).toFixed(1)} s`;
}

function Marca({ tam }: { tam: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: tam * 0.3 }}>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img src={LOGO_URI} width={tam} height={tam} />
      <div style={{ display: "flex", fontSize: tam * 0.62, fontWeight: 700, color: TEXTO, letterSpacing: -1 }}>Prodigia</div>
    </div>
  );
}

function Chip({ texto, acento, tam }: { texto: string; acento: string; tam: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: tam * 0.5,
        padding: `${tam * 0.45}px ${tam * 1.1}px`,
        borderRadius: 999,
        border: `2px solid ${acento}`,
        background: `${acento}26`,
        color: TEXTO,
        fontSize: tam,
      }}
    >
      <div style={{ display: "flex", width: tam * 0.6, height: tam * 0.6, borderRadius: 999, background: acento }} />
      {texto}
    </div>
  );
}

function Dato({ valor, etiqueta, tam, color = TEXTO }: { valor: string; etiqueta: string; tam: number; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: 1,
        padding: `${tam * 0.5}px ${tam * 0.3}px`,
        borderRadius: tam * 0.6,
        background: SUPERFICIE,
        border: `2px solid ${BORDE}`,
      }}
    >
      <div style={{ display: "flex", fontSize: tam * 1.25, fontWeight: 700, color }}>{valor}</div>
      <div style={{ display: "flex", fontSize: tam * 0.62, color: TEXTO2, marginTop: 4 }}>{etiqueta}</div>
    </div>
  );
}

// Una barra por pregunta: alta si tardó, verde si acertó, roja si no.
function Barras({ respuestas, alto, ancho, acento, max }: { respuestas: RespuestaPartida[]; alto: number; ancho: number; acento: string; max: number }) {
  const lista = respuestas.slice(0, 30);
  const gap = Math.max(4, Math.round(ancho / lista.length / 6));
  const anchoBarra = Math.max(6, Math.floor((ancho - gap * (lista.length - 1)) / lista.length));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap, height: alto, borderBottom: `2px solid ${acento}55` }}>
      {lista.map((r, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            width: anchoBarra,
            height: Math.max(alto * 0.12, (r.timeMs / max) * alto),
            borderRadius: `${Math.min(10, anchoBarra / 2)}px ${Math.min(10, anchoBarra / 2)}px 0 0`,
            background: r.correct ? CORRECTO : ERROR,
          }}
        />
      ))}
    </div>
  );
}

// Sin el detalle por pregunta: un medidor con los aciertos sobre el total.
function Medidor({ correctos, total, ancho, acento }: { correctos: number; total: number; ancho: number; acento: string }) {
  const n = Math.min(30, Math.max(1, total));
  const gap = 8;
  const w = Math.floor((ancho - gap * (n - 1)) / n);
  return (
    <div style={{ display: "flex", gap }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ display: "flex", width: w, height: 22, borderRadius: 8, background: i < correctos ? acento : "rgba(255,255,255,0.1)" }} />
      ))}
    </div>
  );
}

function Lado({ lado, nombre, gana, tam, acento }: { lado: LadoTarjeta; nombre: string; gana: boolean; tam: number; acento: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: tam * 0.2 }}>
      <div style={{ display: "flex", fontSize: tam * 0.75, color: TEXTO2, maxWidth: tam * 9, overflow: "hidden" }}>{nombre}</div>
      <div style={{ display: "flex", fontSize: tam * 2.6, fontWeight: 700, color: gana ? LOGRO : TEXTO, lineHeight: 1 }}>{lado.puntaje ?? "—"}</div>
      <div style={{ display: "flex", fontSize: tam * 0.7, color: acento }}>{aciertosTexto(lado)}</div>
    </div>
  );
}

export function TarjetaImagen({ t, textos, formato }: { t: TarjetaPartida; textos: TextosTarjeta; formato: FormatoTarjeta }): ReactElement {
  const acento = COLOR_MUNDO[t.mundo as MundoDuelo] ?? "#6C4CF1";
  const tonoResultado = colorResultado(t, acento);
  const { width, height } = MEDIDAS_TARJETA[formato];
  const og = formato === "og";
  const u = og ? 30 : 42; // unidad de tamaño de letra
  const pad = og ? 48 : 72;
  const precision = t.yo.precision ?? (t.yo.correctos != null && t.yo.total ? t.yo.correctos / t.yo.total : null);
  const respuestasYo = t.yo.respuestas && t.yo.respuestas.length > 0 ? t.yo.respuestas : null;
  const respuestasRival = t.rival?.respuestas && t.rival.respuestas.length > 0 ? t.rival.respuestas : null;
  const anchoBarras = og ? 480 : width - pad * 2 - 48;

  const encabezado = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Marca tam={og ? 58 : 84} />
      <Chip texto={textos.mundo} acento={acento} tam={og ? 24 : 32} />
    </div>
  );

  const titulo = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: og ? "flex-start" : "center", gap: 6 }}>
      <div style={{ display: "flex", fontSize: u * 0.7, color: TEXTO2, letterSpacing: 4, textTransform: "uppercase" }}>{textos.etiqueta}</div>
      {textos.resultado && <div style={{ display: "flex", fontSize: u * 2, fontWeight: 700, color: tonoResultado, lineHeight: 1.05 }}>{textos.resultado}</div>}
    </div>
  );

  const principal =
    t.tipo === "duelo" && t.rival ? (
      <div style={{ display: "flex", alignItems: "center", gap: u * 0.4 }}>
        <Lado lado={t.yo} nombre={t.yo.nombre ?? textos.tu} gana={t.resultado === "victoria"} tam={u} acento={acento} />
        <div style={{ display: "flex", fontSize: u, color: TEXTO2 }}>vs</div>
        <Lado lado={t.rival} nombre={t.rival.nombre ?? textos.rival} gana={t.resultado === "derrota"} tam={u} acento={acento} />
      </div>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", alignItems: og ? "flex-start" : "center" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <div style={{ display: "flex", fontSize: u * 3.4, fontWeight: 700, color: TEXTO, lineHeight: 1 }}>{aciertosTexto(t.yo)}</div>
          <div style={{ display: "flex", fontSize: u * 0.9, color: acento }}>{textos.aciertos}</div>
        </div>
        {t.yo.nombre && <div style={{ display: "flex", fontSize: u * 0.7, color: TEXTO2, marginTop: 8 }}>{t.yo.nombre}</div>}
      </div>
    );

  const datos = (
    <div style={{ display: "flex", gap: og ? 12 : 18 }}>
      <Dato valor={precision == null ? "—" : `${Math.round(precision * 100)}%`} etiqueta={textos.precision} tam={u * 0.8} />
      <Dato valor={segundos(t.yo.tiempoPromedioMs)} etiqueta={textos.tiempoProm} tam={u * 0.8} />
      <Dato valor={t.yo.puntaje == null ? "—" : `+${t.yo.puntaje}`} etiqueta={textos.exp} tam={u * 0.8} color={LOGRO} />
      {t.rachaMax != null && <Dato valor={String(t.rachaMax)} etiqueta={textos.racha} tam={u * 0.8} color="#FF8A3D" />}
    </div>
  );

  const conRival = !!respuestasRival && !og;
  const maxTiempo = Math.max(1, ...(respuestasYo ?? []).slice(0, 30).map((r) => r.timeMs), ...(conRival ? (respuestasRival ?? []).slice(0, 30).map((r) => r.timeMs) : []));
  const rotulo = (texto: string) => <div style={{ display: "flex", fontSize: u * 0.5, color: TEXTO2 }}>{texto}</div>;
  const barras = respuestasYo ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: og ? 18 : 24, borderRadius: 24, background: SUPERFICIE, border: `2px solid ${BORDE}` }}>
      <div style={{ display: "flex", fontSize: u * 0.55, color: TEXTO2, letterSpacing: 3, textTransform: "uppercase" }}>{textos.porPregunta}</div>
      {conRival && rotulo(t.yo.nombre ?? textos.tu)}
      <Barras respuestas={respuestasYo} alto={og ? 70 : conRival ? 90 : 120} ancho={anchoBarras} acento={acento} max={maxTiempo} />
      {conRival && respuestasRival && rotulo(t.rival?.nombre ?? textos.rival)}
      {conRival && respuestasRival && <Barras respuestas={respuestasRival} alto={90} ancho={anchoBarras} acento={ERROR} max={maxTiempo} />}
    </div>
  ) : t.tipo === "sprint" && t.yo.correctos != null && t.yo.total ? (
    <Medidor correctos={t.yo.correctos} total={t.yo.total} ancho={og ? 520 : width - pad * 2} acento={CORRECTO} />
  ) : null;

  const pie = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: u * 0.6, color: TEXTO2 }}>
      <div style={{ display: "flex" }}>{textos.pie}</div>
      {textos.fecha && <div style={{ display: "flex" }}>{textos.fecha}</div>}
    </div>
  );

  const fondo = {
    width,
    height,
    display: "flex",
    flexDirection: "column" as const,
    padding: pad,
    background: FONDO,
    backgroundImage: `radial-gradient(circle at 85% 0%, ${acento}66 0%, ${FONDO} 55%), radial-gradient(circle at 0% 100%, #6C4CF155 0%, ${FONDO} 50%)`,
    color: TEXTO,
    fontFamily: "Geist",
  };

  if (og) {
    return (
      <div style={{ ...fondo, gap: 28 }}>
        {encabezado}
        <div style={{ display: "flex", flex: 1, gap: 40, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
            {titulo}
            {principal}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 520 }}>
            {datos}
            {barras}
          </div>
        </div>
        {pie}
      </div>
    );
  }

  return (
    <div style={{ ...fondo, justifyContent: "space-between" }}>
      {encabezado}
      <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
        {titulo}
        {principal}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {datos}
        {barras}
      </div>
      {pie}
    </div>
  );
}
