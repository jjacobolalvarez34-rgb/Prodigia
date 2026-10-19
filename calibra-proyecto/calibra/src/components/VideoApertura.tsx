"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { sonidoHabilitado } from "@/lib/sonido";
import { videoAperturaActual } from "@/lib/temas/videosApertura";
import { RUTAS_DE_JUEGO } from "./alineacion/CapaAlineacion";

// Video de apertura de los eventos (Gran Alineación, Halloween…; cuál toca lo dice
// videoAperturaActual), igual que en la app: si se entra a la web durante el evento,
// el video tapa el menú; si el evento empieza con la página abierta (fuera de una
// partida), entra con un fundido. Una vez por edición en cada navegador; se salta
// desde el primer segundo (botón o Esc). Los videos terminan con ~5 s de la imagen
// final animada, y desde ahí se funde con la página. En pantallas verticales va la
// versión 9:16.
const EVENTO = "prodigia:repetir-video-apertura";
const clave = (c: string) => `prodigia-video-${c}`;
const SALIDA_MS = 650;
const TOPE_MS = 24_000;

// Solo la primera revisión de la visita sale sin fundido.
let primeraRevision = true;

// «Ver el video» desde un cartel: sin archivo, el del evento en curso.
export function repetirVideo(archivo?: string) {
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: archivo }));
}

function visto(c: string): boolean {
  try {
    return localStorage.getItem(clave(c)) === "1";
  } catch {
    return false;
  }
}

function marcarVisto(c: string) {
  try {
    localStorage.setItem(clave(c), "1");
  } catch {
    // Sin almacenamiento se vuelve a ver en la próxima visita; no pasa nada.
  }
}

function Reproductor({ archivo, fundido, onFin }: { archivo: string; fundido: boolean; onFin: () => void }) {
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

  const base = `/videos/${archivo}${vertical ? "-vertical" : ""}`;
  return (
    <div className="fixed inset-0 z-[200] bg-black transition-opacity duration-700 ease-out" style={{ opacity: visible && !saliendo ? 1 : 0 }} role="dialog" aria-label={t("video")}>
      <video ref={ref} src={`${base}.mp4`} poster={`${base}-poster.jpg`} playsInline preload="auto" onEnded={cerrar} className="h-full w-full object-cover" />
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

export default function VideoApertura() {
  const ruta = usePathname() ?? "";
  const enJuego = RUTAS_DE_JUEGO.test(ruta);
  const [video, setVideo] = useState<{ clave: string | null; archivo: string; fundido: boolean; id: number } | null>(null);

  useEffect(() => {
    if (enJuego) return;
    function revisar() {
      const instantaneo = primeraRevision;
      primeraRevision = false;
      const v = videoAperturaActual();
      if (!v || visto(v.clave)) return;
      setVideo((actual) => actual ?? { clave: v.clave, archivo: v.archivo, fundido: !instantaneo, id: Date.now() });
    }
    const primera = setTimeout(revisar, 0);
    const id = setInterval(revisar, 30_000);
    return () => {
      clearTimeout(primera);
      clearInterval(id);
    };
  }, [enJuego]);

  // «Ver el video» desde un cartel (no cuenta como visto: ya se vio o se eligió verlo).
  useEffect(() => {
    const repetir = (e: Event) => {
      const archivo = (e as CustomEvent<string | undefined>).detail ?? videoAperturaActual()?.archivo;
      if (archivo) setVideo({ clave: null, archivo, fundido: true, id: Date.now() });
    };
    window.addEventListener(EVENTO, repetir);
    return () => window.removeEventListener(EVENTO, repetir);
  }, []);

  if (!video) return null;
  return (
    <Reproductor
      key={video.id}
      archivo={video.archivo}
      fundido={video.fundido}
      onFin={() => {
        if (video.clave) marcarVisto(video.clave);
        setVideo(null);
      }}
    />
  );
}
