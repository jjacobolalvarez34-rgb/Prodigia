"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Capacitor } from "@capacitor/core";
import { usePathname } from "@/i18n/navigation";
import { URL_APK } from "@/lib/appAndroid";
import PanelDescarga, { FondoAurora } from "./PanelDescarga";

const CLAVE_OCULTO = "prodigia:sticker-app-oculto-hasta";
const CLAVE_ANUNCIO = "prodigia:anuncio-app-visto";
const SIETE_DIAS = 7 * 24 * 60 * 60 * 1000;

// Donde se juega o se estudia el sticker estorba (tapa botones): ahí no aparece.
const RUTAS_SIN_STICKER = /\/(practica|sprint|duelo|duelos|diagnostico|reto|demo|aprender|login|registro|onboarding|descargar|invitado|serie|ranked)/;

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}
function guardar(clave: string, valor: string) {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    /* modo privado */
  }
}

const nada = () => () => {};
const enCliente = () => true;
const enServidor = () => false;
const ocultoPorElUsuario = () => Number(leer(CLAVE_OCULTO) ?? 0) > Date.now();

// Sticker en la esquina («¡Ya hay app!») y anuncio de la app de Android. El
// anuncio se abre solo UNA vez, en la portada; después, desde el sticker.
// Dentro de la app nativa (o sin APK publicado) no se muestra nada.
export default function StickerApp() {
  const t = useTranslations("DescargarApp");
  const pathname = usePathname();
  const montado = useSyncExternalStore(nada, enCliente, enServidor);
  const [oculto, setOculto] = useState(false);
  const [abierto, setAbierto] = useState(false);

  const nativo = montado && Capacitor.isNativePlatform();
  const ocultoGuardado = useSyncExternalStore(nada, ocultoPorElUsuario, enServidor);
  const enJuego = RUTAS_SIN_STICKER.test(pathname);
  const visible = montado && !!URL_APK && !nativo && !enJuego && !oculto && !ocultoGuardado;

  // Anuncio automático: una sola vez, en la portada, después de un momento.
  useEffect(() => {
    if (!montado || !URL_APK || nativo || pathname !== "/" || leer(CLAVE_ANUNCIO)) return;
    const id = setTimeout(() => {
      guardar(CLAVE_ANUNCIO, "1");
      setAbierto(true);
    }, 2500);
    return () => clearTimeout(id);
  }, [montado, nativo, pathname]);

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", alTeclear);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = overflow;
    };
  }, [abierto]);

  if (!montado) return null;

  return (
    <>
      {visible && (
        <div className="fixed bottom-4 left-4 z-40 sm:bottom-6 sm:left-6" style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}>
          <button
            type="button"
            onClick={() => setAbierto(true)}
            className="app-sticker group relative block rounded-2xl p-[3px] shadow-[0_12px_30px_-8px_rgba(124,92,255,0.7)]"
            aria-label={`${t("sticker")} ${t("stickerSub")}`}
          >
            <span className="app-holo absolute inset-0 rounded-2xl" aria-hidden="true" />
            <span className="app-barrido relative flex items-center gap-2 overflow-hidden rounded-[13px] bg-[#0b0820] px-3 py-2 text-left">
              <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" aria-hidden="true">
                <defs>
                  <linearGradient id="sticker-tel" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#a78bfa" />
                    <stop offset="1" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
                <rect x="6" y="2" width="12" height="20" rx="3" fill="url(#sticker-tel)" />
                <rect x="8" y="5" width="8" height="12" rx="1.2" fill="#0b0820" />
                <path d="M12 8.5v5m0 0-2-2m2 2 2-2" stroke="#6ee7b7" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="flex flex-col leading-tight">
                <span className="font-display text-sm font-bold text-white">{t("sticker")}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6ee7b7]">{t("stickerSub")}</span>
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              guardar(CLAVE_OCULTO, String(Date.now() + SIETE_DIAS));
              setOculto(true);
            }}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-white/30 bg-[#0b0820] text-[10px] text-white/80 hover:text-white"
            aria-label={t("ocultar")}
          >
            ✕
          </button>
        </div>
      )}

      {abierto &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setAbierto(false)} role="presentation">
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t("titulo")}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] border border-white/15 px-5 pb-6 pt-8 shadow-[0_30px_80px_-20px_rgba(124,92,255,0.6)] sm:rounded-[2rem]"
              style={{ animation: "app-entrada 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2)" }}
            >
              <FondoAurora />
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                aria-label={t("cerrar")}
              >
                ✕
              </button>
              <div className="relative">
                <PanelDescarga />
                <button type="button" onClick={() => setAbierto(false)} className="mt-4 w-full text-center text-xs font-medium text-white/50 hover:text-white/80">
                  {t("ahoraNo")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
