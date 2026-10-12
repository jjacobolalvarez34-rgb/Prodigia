"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { APP_ANDROID, RUTA_DESCARGA_APK } from "@/lib/appAndroid";

export type Plataforma = "android" | "ios" | "escritorio" | "desconocida";

function leerPlataforma(): Plataforma {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  return "escritorio";
}
const nada = () => () => {};

// En el servidor (y mientras hidrata) es "desconocida": se muestra el botón normal.
export function usePlataforma(): Plataforma {
  return useSyncExternalStore(nada, leerPlataforma, () => "desconocida");
}

// Rediseño 2026-10-12 (pedido: «que se vea menos IA, con la estética de Prodigia»):
// sin holograma, aurora ni texto en degradé. Es la noche de las ciudades de los
// mundos: cielo con estrellas, un horizonte con ventanas encendidas y, encima, el
// teléfono con la pantalla de Hoy tal como es en la app.
const NOCHE = "#080B15";
const PANEL = "#10152A";
const VIOLETA = "#7C5CFF";
const VIOLETA_BASE = "#6C4CF1";
const VIOLETA_LABIO = "#3B2A8F";
const DORADO = "#FFB627";

// Horizonte determinista (mismo dibujo en el servidor y en el cliente).
function edificios(semilla: number, ancho: number, alto: number) {
  let s = semilla;
  const azar = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const lista: { x: number; w: number; h: number; ventanas: { x: number; y: number; luz: boolean; tarda: number }[] }[] = [];
  let x = -4;
  while (x < ancho) {
    const w = 14 + Math.floor(azar() * 20);
    const h = Math.floor(alto * (0.35 + azar() * 0.6));
    const ventanas = [];
    for (let vy = alto - h + 6; vy < alto - 6; vy += 8) {
      for (let vx = x + 4; vx < x + w - 5; vx += 7) {
        const luz = azar() < 0.32;
        ventanas.push({ x: vx, y: vy, luz, tarda: Math.floor(azar() * 3400) });
      }
    }
    lista.push({ x, w, h, ventanas });
    x += w + Math.floor(azar() * 4);
  }
  return lista;
}

export function Horizonte({ alto = 70, opacidad = 1 }: { alto?: number; opacidad?: number }) {
  const ancho = 400;
  const lista = edificios(17, ancho, alto);
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} preserveAspectRatio="xMidYMax slice" className="block h-full w-full" style={{ opacity: opacidad }} aria-hidden="true">
      {lista.map((e, i) => (
        <g key={i}>
          <rect x={e.x} y={alto - e.h} width={e.w} height={e.h} fill={i % 2 ? "#121833" : "#0E1329"} />
          {e.ventanas.map((v, j) => (
            <rect
              key={j}
              x={v.x}
              y={v.y}
              width={3}
              height={4}
              fill={v.luz ? (j % 5 === 0 ? DORADO : "#9B85FF") : "#1B2244"}
              className={v.luz && j % 3 === 0 ? "app-ventana" : undefined}
              style={v.luz ? { animationDelay: `${v.tarda}ms` } : undefined}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

// Fondo del anuncio y de /descargar: cielo de noche con pocas estrellas y la ciudad abajo.
export function FondoNoche() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: `radial-gradient(120% 45% at 50% 0%, #141a3a 0%, transparent 70%), ${NOCHE}` }} />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(1.2px 1.2px at 12% 8%, #fff9 50%, transparent 52%), radial-gradient(1px 1px at 34% 4%, #fff7 50%, transparent 52%), radial-gradient(1.3px 1.3px at 61% 11%, #fffa 50%, transparent 52%), radial-gradient(1px 1px at 83% 6%, #fff6 50%, transparent 52%), radial-gradient(1px 1px at 93% 19%, #fff8 50%, transparent 52%), radial-gradient(1px 1px at 6% 24%, #fff5 50%, transparent 52%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-28">
        <Horizonte alto={110} opacidad={0.55} />
      </div>
    </div>
  );
}

// El teléfono muestra la pantalla de Hoy de la app (HUD, Continuar con su ciudad y
// la meta diaria), sin brillos: es lo que la persona va a ver al abrirla.
function Telefono() {
  return (
    <div className="relative mx-auto w-40" aria-hidden="true">
      <div className="rounded-[1.6rem] border-[5px] border-[#1B2140] bg-[#05070E] p-[3px] shadow-[0_18px_30px_-14px_rgba(0,0,0,0.9)]">
        <div className="flex h-64 flex-col gap-1.5 overflow-hidden rounded-[1.2rem] px-2 pb-2 pt-3" style={{ background: NOCHE }}>
          <div className="flex items-center gap-1">
            <span className="h-4 w-4 rounded-full border border-[#E8B34D] bg-[#2b2350]" />
            <span className="flex items-center gap-0.5 rounded-full border border-white/10 bg-[#10152A] px-1.5 py-px font-mono text-[7px] text-white">
              <svg viewBox="0 0 24 24" className="h-2 w-2" aria-hidden="true"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3-1-3 0-6.5 1-9.5z" fill="#FF8A3D" /></svg>12
            </span>
            <span className="flex items-center gap-0.5 rounded-full border border-white/10 bg-[#10152A] px-1.5 py-px font-mono text-[7px] text-white">
              <svg viewBox="0 0 24 24" className="h-2 w-2" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z" fill={DORADO} /></svg>4.820
            </span>
          </div>
          <span className="font-display text-[11px] font-bold text-white">Hola, Martina</span>
          <div className="overflow-hidden rounded-lg border" style={{ borderColor: "rgba(155,133,255,0.45)", background: PANEL }}>
            <div className="h-10" style={{ background: "linear-gradient(180deg,#2a2160,#0b0f1d)" }}>
              <Horizonte alto={40} />
            </div>
            <div className="flex flex-col gap-1 p-1.5">
              <span className="text-[6px] font-bold uppercase tracking-wider" style={{ color: "#9B85FF" }}>
                Continuar
              </span>
              <span className="text-[8px] font-bold text-white">Numeria · Aritmética</span>
              <span className="block h-1 rounded-sm bg-[#1a2140]">
                <span className="block h-full w-3/5 rounded-sm" style={{ background: VIOLETA_BASE }} />
              </span>
              <span className="mt-0.5 block rounded-md py-1 text-center text-[7px] font-bold text-white" style={{ background: VIOLETA_BASE, boxShadow: `0 2px 0 ${VIOLETA_LABIO}` }}>
                Jugar
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 p-1.5" style={{ background: PANEL }}>
            <span className="h-6 w-6 rounded-full border-[3px]" style={{ borderColor: `${DORADO} ${DORADO} #1a2140 #1a2140` }} />
            <span className="flex flex-col">
              <span className="text-[7px] font-bold text-white">Meta diaria</span>
              <span className="font-mono text-[6px] text-white/60">140 / 200 Exp</span>
            </span>
          </div>
          <div className="mt-auto flex justify-between rounded-lg border border-white/10 px-2 py-1" style={{ background: PANEL }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="h-1.5 w-3 rounded-sm" style={{ background: i === 0 ? "#B9A8FF" : "#2a3156" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CodigoQr({ url }: { url: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let vivo = true;
    QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#080B15", light: "#ffffff" } }).then((s) => vivo && setSvg(s));
    return () => {
      vivo = false;
    };
  }, [url]);
  return <div className="h-36 w-36 overflow-hidden rounded-xl bg-white p-2" dangerouslySetInnerHTML={svg ? { __html: svg } : undefined} />;
}

// Contenido del anuncio de la app (lo usan el sticker y la página /descargar):
// teléfono con la pantalla de Hoy, botón que baja el APK al instante, pasos para
// instalarlo y por qué Android avisa. En la computadora muestra un QR.
export default function PanelDescarga({ titulo = true }: { titulo?: boolean }) {
  const t = useTranslations("DescargarApp");
  const plataforma = usePlataforma();
  const [descargas, setDescargas] = useState(0);
  const urlPagina = typeof window === "undefined" ? "" : `${window.location.origin}/descargar`;

  const boton = (
    <a
      href={RUTA_DESCARGA_APK}
      onClick={() => setDescargas((n) => n + 1)}
      className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 font-display text-lg font-bold text-white transition-transform hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-none"
      style={{ background: `linear-gradient(180deg, ${VIOLETA} 0%, ${VIOLETA_BASE} 60%)`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 0 ${VIOLETA_LABIO}` }}
    >
      {descargas > 0 ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" />
        </svg>
      )}
      {descargas > 0 ? t("descargarOtraVez") : t("descargar")}
    </a>
  );

  return (
    <div className="flex flex-col gap-5 text-white">
      <div className="relative -mx-5 -mt-8 overflow-hidden rounded-t-[inherit] px-5 pt-8">
        <Telefono />
        <div className="absolute inset-x-0 bottom-0 h-16">
          <Horizonte alto={64} />
        </div>
        <div className="relative h-3" />
      </div>
      {titulo && (
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ borderColor: `${DORADO}66`, color: DORADO }}>
            {t("etiqueta")}
          </span>
          <h2 className="font-display text-3xl font-bold leading-tight text-white [text-wrap:balance]">{t("titulo")}</h2>
          <p className="max-w-sm text-sm text-[#B4BBD3]">{t("sub")}</p>
        </div>
      )}

      {plataforma === "ios" ? (
        <p className="rounded-2xl border border-white/10 p-4 text-center text-sm text-white/85" style={{ background: PANEL }}>
          {t("ios")}
        </p>
      ) : plataforma === "escritorio" ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 p-4" style={{ background: PANEL }}>
          <p className="font-display text-lg font-bold">{t("escritorioTitulo")}</p>
          <CodigoQr url={urlPagina} />
          <p className="max-w-xs text-center text-xs text-[#B4BBD3]">{t("escritorio")}</p>
          <a href={RUTA_DESCARGA_APK} className="text-xs font-semibold text-[#B9A8FF] underline underline-offset-4">
            {t("escritorioDirecto")}
          </a>
        </div>
      ) : (
        boton
      )}

      <p className="-mt-2 text-center font-mono text-[11px] text-[#8E97B8]">{t("datos", { version: APP_ANDROID.version, mb: APP_ANDROID.tamanoMb, android: APP_ANDROID.androidMinimo })}</p>
      {descargas > 0 && <p className="-mt-3 text-center text-sm font-semibold text-[#3DDC97]">{t("descargaIniciada")}</p>}

      {plataforma !== "ios" && (
        <ol className="flex flex-col rounded-2xl border border-white/10 px-4" style={{ background: PANEL }}>
          <li className="pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8E97B8]">{t("pasosTitulo")}</li>
          {(["paso1", "paso2", "paso3"] as const).map((k, i) => (
            <li key={k} className="flex items-start gap-3 border-b border-white/[0.07] py-3 text-sm text-white/90 last:border-b-0">
              <span className="w-4 shrink-0 font-mono text-sm font-bold" style={{ color: DORADO }}>
                {i + 1}
              </span>
              {t(k)}
            </li>
          ))}
        </ol>
      )}

      <details className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/80" style={{ background: PANEL }}>
        <summary className="cursor-pointer font-semibold text-white">{t("confianzaTitulo")}</summary>
        <p className="mt-2 text-[#B4BBD3]">{t("confianza")}</p>
      </details>
    </div>
  );
}
