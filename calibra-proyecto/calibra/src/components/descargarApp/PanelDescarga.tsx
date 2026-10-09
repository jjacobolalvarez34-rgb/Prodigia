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

// Chispas fijas (mismas en cada render) que salen del botón al descargar.
const CHISPAS = Array.from({ length: 18 }, (_, i) => {
  const ang = (i / 18) * Math.PI * 2;
  const dist = 70 + ((i * 37) % 50);
  return { dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist * 0.8 - 20, color: ["#7c5cff", "#38bdf8", "#34d399", "#facc15", "#f472b6"][i % 5] };
});

function Telefono() {
  return (
    <div className="relative mx-auto h-56 w-32 [perspective:700px]" aria-hidden="true">
      <div className="app-flotar relative h-full w-full">
        <div className="app-holo absolute -inset-[3px] rounded-[1.9rem] opacity-90 blur-[1px]" />
        <div className="absolute inset-0 overflow-hidden rounded-[1.75rem] border border-white/20 bg-[#0b0820]">
          <div className="absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-white/25" />
          <div className="absolute -left-6 top-6 h-28 w-28 rounded-full bg-[#7c5cff]/60 blur-2xl" />
          <div className="absolute -right-8 bottom-4 h-28 w-28 rounded-full bg-[#38bdf8]/50 blur-2xl" />
          <div className="relative flex h-full flex-col items-center justify-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="" className="h-14 w-14 rounded-2xl shadow-[0_0_30px_rgba(124,92,255,0.8)]" />
            <span className="font-display text-sm font-bold tracking-wide text-white">Prodigia</span>
            <div className="mt-2 flex gap-1">
              {["#7c5cff", "#38bdf8", "#34d399", "#facc15"].map((c) => (
                <span key={c} className="h-1.5 w-5 rounded-full" style={{ background: c }} />
              ))}
            </div>
          </div>
          <div className="app-barrido absolute inset-0 overflow-hidden" />
        </div>
      </div>
    </div>
  );
}

function CodigoQr({ url }: { url: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let vivo = true;
    QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#0b0820", light: "#ffffff" } }).then((s) => vivo && setSvg(s));
    return () => {
      vivo = false;
    };
  }, [url]);
  return <div className="h-36 w-36 overflow-hidden rounded-2xl bg-white p-2 shadow-[0_0_40px_rgba(56,189,248,0.35)]" dangerouslySetInnerHTML={svg ? { __html: svg } : undefined} />;
}

// Contenido del anuncio de la app (lo usan el sticker y la página /descargar):
// teléfono flotante, botón que baja el APK al instante, pasos para instalarlo y
// por qué Android avisa. En la computadora muestra un QR para abrirlo en el celular.
export default function PanelDescarga({ titulo = true }: { titulo?: boolean }) {
  const t = useTranslations("DescargarApp");
  const plataforma = usePlataforma();
  const [descargas, setDescargas] = useState(0);
  const urlPagina = typeof window === "undefined" ? "" : `${window.location.origin}/descargar`;

  const boton = (
    <div className="relative">
      <a
        href={RUTA_DESCARGA_APK}
        onClick={() => setDescargas((n) => n + 1)}
        className="app-latido app-barrido relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[linear-gradient(110deg,#7c5cff,#38bdf8_55%,#34d399)] px-6 py-4 font-display text-lg font-bold text-white transition-transform hover:scale-[1.03] active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" />
        </svg>
        {descargas > 0 ? t("descargarOtraVez") : t("descargar")}
      </a>
      {descargas > 0 && (
        <div key={descargas} className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true">
          {CHISPAS.map((c, i) => (
            <span
              key={i}
              className="app-chispa absolute h-2 w-2 rounded-full"
              style={{ background: c.color, ["--dx" as string]: `${c.dx}px`, ["--dy" as string]: `${c.dy}px`, animationDelay: `${(i % 4) * 30}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-5 text-white">
      <Telefono />
      {titulo && (
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#facc15]">{t("etiqueta")}</span>
          <h2 className="bg-[linear-gradient(100deg,#fff,#c4b5fd_40%,#7dd3fc_70%,#6ee7b7)] bg-clip-text font-display text-3xl font-bold leading-tight text-transparent">{t("titulo")}</h2>
          <p className="max-w-sm text-sm text-white/75">{t("sub")}</p>
        </div>
      )}
      <p className="text-center text-xs font-medium text-white/60">{t("datos", { version: APP_ANDROID.version, mb: APP_ANDROID.tamanoMb, android: APP_ANDROID.androidMinimo })}</p>

      {plataforma === "ios" ? (
        <p className="rounded-2xl border border-white/15 bg-white/5 p-4 text-center text-sm text-white/85">{t("ios")}</p>
      ) : plataforma === "escritorio" ? (
        <div className="flex flex-col items-center gap-3">
          <p className="font-display text-lg font-bold">{t("escritorioTitulo")}</p>
          <CodigoQr url={urlPagina} />
          <p className="max-w-xs text-center text-xs text-white/70">{t("escritorio")}</p>
          <a href={RUTA_DESCARGA_APK} className="text-xs font-semibold text-[#7dd3fc] underline underline-offset-4">
            {t("escritorioDirecto")}
          </a>
        </div>
      ) : (
        boton
      )}

      {descargas > 0 && <p className="-mt-2 text-center text-sm font-semibold text-[#6ee7b7]">{t("descargaIniciada")}</p>}

      {plataforma !== "ios" && (
        <ol className="flex flex-col gap-2">
          <li className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">{t("pasosTitulo")}</li>
          {(["paso1", "paso2", "paso3"] as const).map((k, i) => (
            <li key={k} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/85">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7c5cff,#38bdf8)] text-xs font-bold text-white">{i + 1}</span>
              {t(k)}
            </li>
          ))}
        </ol>
      )}

      <details className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/80">
        <summary className="cursor-pointer font-semibold text-white">{t("confianzaTitulo")}</summary>
        <p className="mt-2 text-white/70">{t("confianza")}</p>
      </details>
    </div>
  );
}

// Fondo del anuncio: aurora oscura que se mueve despacio (otra estética que la web).
export function FondoAurora() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[#0b0820]" />
      <div className="app-aurora absolute -left-1/4 -top-1/4 h-[70%] w-[80%] rounded-full bg-[#7c5cff]/45 blur-3xl" />
      <div className="app-aurora absolute -bottom-1/4 -right-1/4 h-[70%] w-[80%] rounded-full bg-[#38bdf8]/35 blur-3xl [animation-delay:-5s]" />
      <div className="app-aurora absolute left-1/4 top-1/3 h-1/2 w-1/2 rounded-full bg-[#f472b6]/20 blur-3xl [animation-delay:-9s]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] [background-size:22px_22px]" />
    </div>
  );
}
