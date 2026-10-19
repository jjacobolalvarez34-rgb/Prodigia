"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { momentoAlineacion } from "@/lib/recompensas/alineacion";
import { sonidoHabilitado } from "@/lib/sonido";
import { RUTAS_DE_JUEGO } from "./CapaAlineacion";

// Video de apertura de la Gran Alineación (aprobado el 2026-10-18; fuente en
// prodigia-marketing/videos/gran-alineacion), igual que en la app: si se entra a la
// web durante el evento, el video tapa el menú; si el evento empieza con la página
// abierta (fuera de una partida), entra con un fundido. Una vez por alineación en
// cada navegador; se salta desde el primer segundo (botón o Esc) y al terminar el
// último cuadro se funde con la página. En pantallas verticales va la versión 9:16.
const EVENTO = "prodigia:repetir-video-alineacion";
const clave = (numero: number) => `prodigia-alineacion-video-${numero}`;
const SALIDA_MS = 650;
const TOPE_MS = 16_000;

// Solo la primera revisión de la visita sale sin fundido.
let primeraRevision = true;

export function repetirVideoAlineacion() {
  window.dispatchEvent(new Event(EVENTO));
}

function visto(numero: number): boolean {
  try {
    return localStorage.getItem(clave(numero)) === "1";
  } catch {
    return false;
  }
}

function marcarVisto(numero: number) {
  try {
    localStorage.setItem(clave(numero), "1");
  } catch {
    // Sin almacenamiento se vuelve a ver en la próxima visita; no pasa nada.
  }
}

function Reproductor({ fundido, onFin }: { fundido: boolean; onFin: () => void }) {
  const t = useTranslations("Alineacion");
  const ref = useRef<HTMLVideoElement>(null);
  const [vertical] = useState(() => window.innerHeight > window.innerWidth);
  const [visible, setVisible] = useState(!fundido);
  const [saliendo, setSaliendo] = useState(false);
  const [saltable, setSaltable] = useState(false);
  const [mudo, setMudo] = useState(false);
  const cerrandoRef = useRef(false);
  const finRef = useRef(onFin);
  useEffect(() => {
    finRef.current = onFin;
  }, [onFin]);

  function cerrar() {
    if (cerrandoRef.current) return;
    cerrandoRef.current = true;
    setSaliendo(true);
    setTimeout(() => finRef.current(), SALIDA_MS);
  }

  useEffect(() => {
    const v = ref.current;
    const entrada = requestAnimationFrame(() => setVisible(true));
    if (v) {
      v.muted = !sonidoHabilitado();
      // Los navegadores no dejan arrancar con sonido sin un toque previo: si lo
      // bloquean, sigue en silencio con un botón para activarlo.
      v.play().catch(() => {
        v.muted = true;
        setMudo(true);
        v.play().catch(() => cerrar());
      });
    }
    const s = setTimeout(() => setSaltable(true), 1000);
    const tope = setTimeout(cerrar, TOPE_MS);
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", tecla);
    return () => {
      cancelAnimationFrame(entrada);
      clearTimeout(s);
      clearTimeout(tope);
      window.removeEventListener("keydown", tecla);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black transition-opacity duration-700 ease-out" style={{ opacity: visible && !saliendo ? 1 : 0 }} role="dialog" aria-label={t("titulo")}>
      <video
        ref={ref}
        src={vertical ? "/videos/gran-alineacion-vertical.mp4" : "/videos/gran-alineacion.mp4"}
        poster={vertical ? "/videos/gran-alineacion-vertical-poster.jpg" : "/videos/gran-alineacion-poster.jpg"}
        playsInline
        preload="auto"
        onEnded={cerrar}
        className="h-full w-full object-cover"
      />
      <div className="absolute right-4 top-4 flex gap-2" style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}>
        {mudo && (
          <button
            type="button"
            onClick={() => {
              if (ref.current) ref.current.muted = false;
              setMudo(false);
            }}
            className="rounded-full border border-[#F6EFE2]/25 bg-[#08080E]/55 px-4 py-1.5 text-sm font-semibold text-[#F6EFE2]/85 backdrop-blur-sm hover:bg-[#08080E]/75"
          >
            {t("activarSonido")}
          </button>
        )}
        {saltable && (
          <button type="button" onClick={cerrar} className="rounded-full border border-[#F6EFE2]/25 bg-[#08080E]/55 px-4 py-1.5 text-sm font-semibold text-[#F6EFE2]/85 backdrop-blur-sm hover:bg-[#08080E]/75">
            {t("saltar")}
          </button>
        )}
      </div>
    </div>
  );
}

export default function VideoAlineacion() {
  const ruta = usePathname() ?? "";
  const enJuego = RUTAS_DE_JUEGO.test(ruta);
  const [video, setVideo] = useState<{ numero: number; fundido: boolean; id: number } | null>(null);

  useEffect(() => {
    if (enJuego) return;
    function revisar() {
      const instantaneo = primeraRevision;
      primeraRevision = false;
      const m = momentoAlineacion(Date.now());
      if (m.momento !== "durante" || visto(m.numero)) return;
      setVideo((v) => v ?? { numero: m.numero, fundido: !instantaneo, id: Date.now() });
    }
    const primera = setTimeout(revisar, 0);
    const id = setInterval(revisar, 30_000);
    return () => {
      clearTimeout(primera);
      clearInterval(id);
    };
  }, [enJuego]);

  // «Ver el video» desde el cartel del Inicio.
  useEffect(() => {
    const repetir = () => setVideo({ numero: momentoAlineacion(Date.now()).numero, fundido: true, id: Date.now() });
    window.addEventListener(EVENTO, repetir);
    return () => window.removeEventListener(EVENTO, repetir);
  }, []);

  if (!video) return null;
  return (
    <Reproductor
      key={video.id}
      fundido={video.fundido}
      onFin={() => {
        marcarVisto(video.numero);
        setVideo(null);
      }}
    />
  );
}
