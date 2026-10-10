// Anuncios en la web (docs/economy/PLAN_ECONOMIA.md §6), igual que la app
// (mobile/src/lib/publicidad.ts):
//   - Solo cuentas gratis; nunca dentro de la app nativa (Capacitor).
//   - Con premio, siempre opcional (Recompensas: duplicar el calendario, cápsula extra).
//   - Uno entre partidas cada 3 de práctica, al pedir «Otra partida». Nunca en
//     duelos, diagnóstico ni lecciones.
// Usa AdSense con la Ad Placement API (adBreak). No carga nada hasta que
// NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-…) esté puesta; fuera de producción pide
// anuncios de prueba.

type AdBreak = (opciones: Record<string, unknown>) => void;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    adBreak?: AdBreak;
    adConfig?: AdBreak;
  }
}

const CADA_PARTIDAS = 3;
const CLAVE_CONTADOR = "prodigia:publicidad:partidas";
const ESPERA_MAXIMA_MS = 20000;

let activa = false;
const oyentes = new Set<() => void>();

export function publicidadWebActiva(): boolean {
  return activa;
}

export function suscribirPublicidadWeb(oyente: () => void): () => void {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

// La llama PublicidadWeb (layout raíz) cuando sabe que la cuenta es gratis.
export function activarPublicidadWeb(cliente: string) {
  if (activa || typeof document === "undefined") return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(cliente)}`;
  script.crossOrigin = "anonymous";
  script.dataset.adFrequencyHint = "120s";
  if (process.env.NODE_ENV !== "production") script.dataset.adbreakTest = "on";
  document.head.appendChild(script);
  window.adsbygoogle = window.adsbygoogle || [];
  const empujar: AdBreak = (o) => {
    window.adsbygoogle!.push(o);
  };
  window.adBreak = empujar;
  window.adConfig = empujar;
  window.adConfig({ preloadAdBreaks: "on", sound: "on" });
  activa = true;
  oyentes.forEach((o) => o());
}

function leerContador(): number {
  try {
    return Number(localStorage.getItem(CLAVE_CONTADOR) ?? "0") || 0;
  } catch {
    return 0;
  }
}

function guardarContador(n: number) {
  try {
    localStorage.setItem(CLAVE_CONTADOR, String(n));
  } catch {
    // Sin almacenamiento: no se cuentan partidas y no hay anuncios entre partidas.
  }
}

// Cada partida de práctica terminada (pantalla de resumen, sin duelo).
export function contarPartidaWeb() {
  if (activa) guardarContador(leerContador() + 1);
}

// Al pedir otra partida: si ya van 3, muestra uno y espera a que termine. Si
// Google no tiene uno listo, adBreakDone llega enseguida y se sigue.
export function anuncioEntrePartidasWeb(): Promise<void> {
  const adBreak = window.adBreak;
  if (!activa || !adBreak || leerContador() < CADA_PARTIDAS) return Promise.resolve();
  guardarContador(0);
  return new Promise((listo) => {
    const espera = setTimeout(listo, ESPERA_MAXIMA_MS);
    adBreak({
      type: "next",
      name: "entre-partidas",
      adBreakDone: () => {
        clearTimeout(espera);
        listo();
      },
    });
  });
}

// Anuncio con premio: true solo si se vio hasta el final.
export function anuncioConPremioWeb(): Promise<boolean> {
  const adBreak = window.adBreak;
  if (!activa || !adBreak) return Promise.resolve(false);
  return new Promise((listo) => {
    let vio = false;
    adBreak({
      type: "reward",
      name: "premio-recompensas",
      beforeReward: (mostrar: () => void) => mostrar(),
      adViewed: () => {
        vio = true;
      },
      adDismissed: () => {
        vio = false;
      },
      adBreakDone: () => listo(vio),
    });
  });
}
