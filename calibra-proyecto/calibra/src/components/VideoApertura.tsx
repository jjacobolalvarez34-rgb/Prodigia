"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { sonidoHabilitado } from "@/lib/sonido";
import { videoAperturaActual } from "@/lib/temas/videosApertura";
import { useRouter, usePathname as usePathnameLocal } from "@/i18n/navigation";
import { decoracionHabilitada } from "@/lib/decoracion";
import { RUTAS_DE_JUEGO } from "./alineacion/CapaAlineacion";
import { useRelojEventos } from "./temas/relojEventos";

// Video de apertura de los eventos (Gran Alineación, Halloween…; cuál toca lo dice
// videoAperturaActual), igual que en la app: si se entra a la web durante el evento,
// el video tapa el menú; si el evento empieza con la página abierta, entra con un
// fundido en el instante exacto (relojEventos) y la web vuelve al Inicio por debajo; en
// una partida se espera a que salga. Una vez por edición en cada navegador; se salta
// desde el primer segundo (botón o Esc). Los videos terminan con ~5 s de la imagen
// final animada, y desde ahí se funde con la página. En pantallas verticales va la
// versión 9:16.
const EVENTO = "prodigia:repetir-video-apertura";
const clave = (c: string) => `prodigia-video-${c}`;
const ENTRADA_MS = 700;
const SALIDA_MS = 650;
// Donde la cinemática no interrumpe: las partidas (y su resultado, que va en la misma
// ruta), Dígitos de π, las lecciones, la primera vez y el acceso. Al salir, la web va al
// Inicio y recién entonces sale el video.
const SIN_INTERRUPCION = new RegExp(`${RUTAS_DE_JUEGO.source}|/(pi|aprender|demo|onboarding|login|registro|recuperar|auth)(/|$)`);
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
  const esperar = SIN_INTERRUPCION.test(ruta);
  const router = useRouter();
  const rutaLocal = usePathnameLocal();
  const rutaRef = useRef(rutaLocal);
  useEffect(() => {
    rutaRef.current = rutaLocal;
  }, [rutaLocal]);
  const reloj = useRelojEventos();
  const [video, setVideo] = useState<{ clave: string | null; archivo: string; fundido: boolean; alInicio: boolean; id: number } | null>(null);

  // Eventos en vivo (2026-10-28): se revisa al entrar, en el instante de cada momento
  // clave y al volver a la pestaña (relojEventos), y al salir de una partida. En una
  // partida o su resultado no se interrumpe: se espera a que salga.
  useEffect(() => {
    if (esperar) return;
    const revisar = () => {
      const instantaneo = primeraRevision;
      primeraRevision = false;
      const v = videoAperturaActual(Date.now(), { temas: decoracionHabilitada() });
      if (!v || visto(v.clave)) return;
      setVideo((actual) => actual ?? { clave: v.clave, archivo: v.archivo, fundido: !instantaneo, alInicio: !instantaneo, id: Date.now() });
    };
    const t = setTimeout(revisar, 0);
    return () => clearTimeout(t);
  }, [reloj, esperar]);

  // Con el video ya en pantalla (tapado el fundido), la web vuelve al Inicio por debajo:
  // al terminar, se ve todo actualizado ahí.
  useEffect(() => {
    if (!video?.alInicio) return;
    const t = setTimeout(() => {
      if (rutaRef.current !== "/") router.push("/");
    }, ENTRADA_MS);
    return () => clearTimeout(t);
  }, [video, router]);

  // «Ver el video» desde un cartel (no cuenta como visto: ya se vio o se eligió verlo).
  useEffect(() => {
    const repetir = (e: Event) => {
      const archivo = (e as CustomEvent<string | undefined>).detail ?? videoAperturaActual(Date.now(), { temas: decoracionHabilitada() })?.archivo;
      if (archivo) setVideo({ clave: null, archivo, fundido: true, alInicio: false, id: Date.now() });
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
