"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Capacitor } from "@capacitor/core";
import { usePathname } from "@/i18n/navigation";
import { URL_APK } from "@/lib/appAndroid";
import PanelDescarga, { FondoNoche } from "./PanelDescarga";

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
            className="flex items-center gap-2.5 rounded-2xl border border-[rgba(148,160,214,0.22)] bg-[#10152A] py-2 pl-2 pr-3.5 text-left transition-transform hover:-translate-y-0.5"
            style={{ boxShadow: "0 4px 0 #05070E, 0 14px 24px -12px rgba(0,0,0,0.8)" }}
            aria-label={`${t("sticker")} ${t("stickerSub")}`}
          >
            <svg viewBox="0 0 32 32" className="h-9 w-9 shrink-0" aria-hidden="true">
              <rect width="32" height="32" rx="9" fill="#141A3A" />
              <rect x="4" y="16" width="7" height="16" fill="#0E1329" />
              <rect x="12" y="9" width="8" height="23" fill="#121833" />
              <rect x="21" y="19" width="7" height="13" fill="#0E1329" />
              <rect x="14" y="12" width="2" height="2.5" fill="#9B85FF" />
              <rect x="17" y="16" width="2" height="2.5" fill="#FFB627" />
              <rect x="14" y="20" width="2" height="2.5" fill="#9B85FF" />
              <rect x="6" y="20" width="2" height="2.5" fill="#9B85FF" />
              <rect x="23" y="23" width="2" height="2.5" fill="#9B85FF" />
              <circle cx="25" cy="8" r="2.5" fill="#F3EEDB" />
            </svg>
            <span className="flex flex-col leading-tight">
              <span className="font-display text-sm font-bold text-white">{t("sticker")}</span>
              <span className="text-[11px] font-semibold text-[#FFB627]">{t("stickerSub")}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              guardar(CLAVE_OCULTO, String(Date.now() + SIETE_DIAS));
              setOculto(true);
            }}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-[rgba(148,160,214,0.3)] bg-[#080B15] text-[10px] text-white/80 hover:text-white"
            aria-label={t("ocultar")}
          >
            ✕
          </button>
        </div>
      )}

      {abierto &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(3,4,10,0.75)] p-0 sm:items-center sm:p-6" onClick={() => setAbierto(false)} role="presentation">
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t("titulo")}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[1.75rem] border border-[rgba(148,160,214,0.18)] px-5 pb-6 pt-8 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] sm:rounded-[1.75rem]"
              style={{ animation: "app-entrada 0.35s cubic-bezier(0.2, 0.8, 0.3, 1)" }}
            >
              <FondoNoche />
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(148,160,214,0.22)] bg-[#10152A] text-white/80 hover:text-white"
                aria-label={t("cerrar")}
              >
                ✕
              </button>
              <div className="relative">
                <PanelDescarga />
                <button type="button" onClick={() => setAbierto(false)} className="mt-4 w-full text-center text-sm font-medium text-[#8E97B8] hover:text-white">
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
