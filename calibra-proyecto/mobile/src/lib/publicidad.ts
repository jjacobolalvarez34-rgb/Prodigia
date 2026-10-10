import AsyncStorage from "@react-native-async-storage/async-storage";
import type * as Ads from "react-native-google-mobile-ads";
import { leerJugador } from "./jugador";

// Publicidad (calibra/docs/economy/PLAN_ECONOMIA.md §6), igual que la web
// (calibra/src/lib/publicidad/web.ts):
//   - Solo cuentas gratis. Pro, colegio e invitados no ven ninguna.
//   - Con premio, siempre opcional (Recompensas: duplicar el calendario, cápsula extra).
//   - Una entre partidas cada 3 de práctica, al salir del resultado. Nunca en
//     duelos, diagnóstico ni lecciones (esas pantallas no llaman a esto).
// Mientras no estén los bloques reales de AdMob (EXPO_PUBLIC_ADMOB_*), se usan los
// de prueba de Google, que muestran anuncios de muestra y no cobran.

const CADA_PARTIDAS = 3;
const CLAVE_CONTADOR = "prodigia:publicidad:partidas";
const ESPERA_CARGA_MS = 10000;

let modulo: typeof Ads | null | undefined;
function ads(): typeof Ads | null {
  if (modulo !== undefined) return modulo;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    modulo = require("react-native-google-mobile-ads") as typeof Ads;
  } catch {
    // APK compilado sin el módulo nativo: la app sigue sin anuncios.
    modulo = null;
  }
  return modulo;
}

function idBloque(tipo: "recompensa" | "entrePartidas"): string {
  const m = ads();
  const real = tipo === "recompensa" ? process.env.EXPO_PUBLIC_ADMOB_RECOMPENSA : process.env.EXPO_PUBLIC_ADMOB_ENTRE_PARTIDAS;
  if (!__DEV__ && real) return real;
  return tipo === "recompensa" ? (m?.TestIds.REWARDED ?? "") : (m?.TestIds.INTERSTITIAL ?? "");
}

export function veAnuncios(): boolean {
  const j = leerJugador();
  return j.plan === "free" && !j.esInvitado && !!j.placa;
}

let iniciado: Promise<boolean> | null = null;

// Consentimiento (formulario de Google donde la ley lo pide) y arranque del SDK.
// Se llama al cargar el jugador; no hace nada si la cuenta no ve anuncios.
export function iniciarPublicidad(): Promise<boolean> {
  if (!veAnuncios()) return Promise.resolve(false);
  if (iniciado) return iniciado;
  iniciado = (async () => {
    const m = ads();
    if (!m) return false;
    try {
      await m.AdsConsent.gatherConsent().catch(() => undefined);
      await m.default().setRequestConfiguration({ maxAdContentRating: m.MaxAdContentRating.T });
      await m.default().initialize();
      precargarEntrePartidas();
      return true;
    } catch {
      return false;
    }
  })();
  return iniciado;
}

let entrePartidas: Ads.InterstitialAd | null = null;
let entrePartidasLista = false;

function precargarEntrePartidas() {
  const m = ads();
  if (!m || entrePartidas) return;
  const anuncio = m.InterstitialAd.createForAdRequest(idBloque("entrePartidas"));
  entrePartidas = anuncio;
  entrePartidasLista = false;
  anuncio.addAdEventListener(m.AdEventType.LOADED, () => {
    entrePartidasLista = true;
  });
  anuncio.addAdEventListener(m.AdEventType.ERROR, () => {
    entrePartidas = null;
    entrePartidasLista = false;
  });
  anuncio.load();
}

// Cada partida de práctica terminada (pantalla de resultado, sin duelo).
export async function contarPartida(): Promise<void> {
  if (!veAnuncios()) return;
  const n = Number((await AsyncStorage.getItem(CLAVE_CONTADOR).catch(() => null)) ?? "0") || 0;
  await AsyncStorage.setItem(CLAVE_CONTADOR, String(n + 1)).catch(() => undefined);
}

// Al salir del resultado: si ya van 3 partidas, muestra el anuncio y espera a que
// se cierre. Si no hay uno listo, sigue sin esperar (nunca traba la navegación).
export async function anuncioEntrePartidas(): Promise<void> {
  if (!veAnuncios()) return;
  const n = Number((await AsyncStorage.getItem(CLAVE_CONTADOR).catch(() => null)) ?? "0") || 0;
  if (n < CADA_PARTIDAS) return;
  const m = ads();
  const anuncio = entrePartidas;
  if (!m || !anuncio || !entrePartidasLista) {
    void iniciarPublicidad().then(precargarEntrePartidas);
    return;
  }
  await AsyncStorage.setItem(CLAVE_CONTADOR, "0").catch(() => undefined);
  entrePartidas = null;
  entrePartidasLista = false;
  await new Promise<void>((listo) => {
    anuncio.addAdEventListener(m.AdEventType.CLOSED, () => listo());
    anuncio.addAdEventListener(m.AdEventType.ERROR, () => listo());
    anuncio.show().catch(() => listo());
  });
  precargarEntrePartidas();
}

// Anuncio con premio: true solo si se vio hasta el final.
export async function verAnuncioConPremio(): Promise<boolean> {
  const m = ads();
  if (!m || !(await iniciarPublicidad())) return false;
  const anuncio = m.RewardedAd.createForAdRequest(idBloque("recompensa"));
  return new Promise<boolean>((listo) => {
    let gano = false;
    let terminado = false;
    const terminar = (v: boolean) => {
      if (terminado) return;
      terminado = true;
      anuncio.removeAllListeners();
      listo(v);
    };
    const espera = setTimeout(() => terminar(false), ESPERA_CARGA_MS);
    anuncio.addAdEventListener(m.RewardedAdEventType.LOADED, () => {
      clearTimeout(espera);
      anuncio.show().catch(() => terminar(false));
    });
    anuncio.addAdEventListener(m.RewardedAdEventType.EARNED_REWARD, () => {
      gano = true;
    });
    anuncio.addAdEventListener(m.AdEventType.CLOSED, () => terminar(gano));
    anuncio.addAdEventListener(m.AdEventType.ERROR, () => {
      clearTimeout(espera);
      terminar(false);
    });
    anuncio.load();
  });
}
