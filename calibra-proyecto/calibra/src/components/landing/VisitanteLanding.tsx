"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { MUNDOS_LANDING } from "@/lib/mundos";

const CLAVE_CONOCE = "prodigia-conoce-prodigia";

type RespuestaGuardada = "cargando" | "si" | "no" | "ninguna";
type PasoTutorial = "intro" | "ciudad" | "mecanismo";

function subscribe() {
  return () => {};
}

function getSnapshot(): RespuestaGuardada {
  try {
    const v = localStorage.getItem(CLAVE_CONOCE);
    return v === "si" ? "si" : v === "no" ? "no" : "ninguna";
  } catch {
    return "ninguna";
  }
}

// Snapshot de servidor: mismo criterio que Greeting.tsx — nunca se
// resuelve en el HTML inicial (localStorage no existe en el server), así
// que devuelve un valor neutro y useSyncExternalStore se encarga de
// re-renderizar solo con el valor real apenas hidrata en el cliente.
function getServerSnapshot(): RespuestaGuardada {
  return "cargando";
}

// Landing pública para visitantes sin sesión — rediseño del flujo
// (Fase 7): "¿Ya conocés Prodigia?" (paso 0, sin cambios) → si "No":
// intro corta con la bifurcación real ("Jugar sin tutorial" manda
// directo a /login — mismo destino que "Sí, ya la conozco", porque todo
// lo que sigue es justamente el tutorial; "Hacer el tutorial" sigue acá
// mismo) → elegir ciudad → explicación breve del mecanismo del sprint →
// recién ahí se crea la sesión de invitado y se entra a /demo/[mundo],
// que continúa el resto del flujo (partida de prueba, tour, promo Pro,
// elegir 2 mundos gratis) sin volver a pasar por acá.
export default function VisitanteLanding() {
  const t = useTranslations("Landing");
  const tHome = useTranslations("Home");
  const router = useRouter();
  const guardada = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Elección hecha EN ESTA visita (antes de que localStorage.getItem
  // vuelva a leerse) — así el click en "Sí"/"No" cambia la pantalla al
  // toque, sin depender de que el store se vuelva a leer.
  const [eleccion, setEleccion] = useState<"si" | "no" | null>(null);
  const [paso, setPaso] = useState<PasoTutorial>("intro");
  const [ciudadElegida, setCiudadElegida] = useState<string | null>(null);
  const [entrando, setEntrando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const respuesta = eleccion ?? guardada;

  useEffect(() => {
    if (respuesta === "si") router.replace("/login");
  }, [respuesta, router]);

  function elegir(nueva: "si" | "no") {
    try {
      localStorage.setItem(CLAVE_CONOCE, nueva);
    } catch {
      // Si falla (modo privado, storage lleno), simplemente vuelve a
      // preguntar la próxima visita — no bloquea nada.
    }
    setEleccion(nueva);
    if (nueva === "si") router.push("/login");
  }

  // signInAnonymously invisible recién acá (paso "mecanismo" → arranca
  // la demo) — mismo mecanismo que "Entrar como invitado" en
  // LoginForm.tsx. La ruta /demo/* (a diferencia de /numeria/practica y
  // equivalentes) no exige el onboarding de nombre ni el diagnóstico de
  // nivel, así que el visitante cae derecho en la partida de prueba.
  async function comenzarDemo() {
    if (!ciudadElegida) return;
    setError(null);
    setEntrando(ciudadElegida);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInAnonymously();
    if (authError) {
      setError(t("errorInvitado"));
      setEntrando(null);
      return;
    }
    router.push(`/demo/${ciudadElegida}`);
  }

  if (respuesta === "cargando" || respuesta === "si") return null;

  if (respuesta === "ninguna") {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-5 px-4 py-20 text-center">
        <h1 className="font-display text-xl font-bold text-foreground">{t("pregunta.titulo")}</h1>
        <div className="flex w-full flex-col gap-3">
          <button
            onClick={() => elegir("si")}
            className="rounded-xl bg-primario px-5 py-3 font-display font-semibold text-white"
          >
            {t("pregunta.si")}
          </button>
          <button
            onClick={() => elegir("no")}
            className="rounded-xl border border-border px-5 py-3 font-display font-semibold text-foreground"
          >
            {t("pregunta.no")}
          </button>
        </div>
      </div>
    );
  }

  if (paso === "intro") {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("intro.titulo")}</h1>
        <p className="text-sm text-texto-secundario">{t("intro.texto")}</p>
        <div className="flex w-full flex-col gap-3">
          <button
            onClick={() => setPaso("ciudad")}
            className="rounded-xl bg-primario px-5 py-3 font-display font-semibold text-white"
          >
            {t("intro.hacerTutorial")}
          </button>
          <button
            onClick={() => router.push("/login")}
            className="rounded-xl border border-border px-5 py-3 font-display font-semibold text-foreground"
          >
            {t("intro.sinTutorial")}
          </button>
        </div>
      </div>
    );
  }

  if (paso === "mecanismo" && ciudadElegida) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("mecanismo.titulo")}</h1>
        <p className="text-sm text-texto-secundario">{t("mecanismo.texto")}</p>
        {error && <p className="text-sm text-error">{error}</p>}
        <button
          onClick={comenzarDemo}
          disabled={entrando !== null}
          className="w-full rounded-xl bg-primario px-5 py-3 font-display font-semibold text-white disabled:opacity-70"
        >
          {entrando !== null ? t("entrando") : t("mecanismo.boton")}
        </button>
      </div>
    );
  }

  // paso === "ciudad"
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-14 px-4 py-16 sm:px-6">
      <section className="flex flex-col items-center gap-4 text-center">
        <h1 className="font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {t("hero.titulo")}
        </h1>
        <p className="max-w-lg text-texto-secundario">{t("hero.subtitulo")}</p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="text-center">
          <h2 className="font-display text-lg font-bold text-foreground">{t("grid.titulo")}</h2>
          <p className="text-xs text-texto-secundario">{t("grid.descripcion")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {MUNDOS_LANDING.map((mundo) => (
            <button
              key={mundo.slug}
              onClick={() => {
                setCiudadElegida(mundo.slug);
                setPaso("mecanismo");
              }}
              className="group flex flex-col gap-3 rounded-2xl px-6 py-7 text-left text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:-rotate-1 hover:shadow-xl"
              style={{
                background: `linear-gradient(120deg, ${mundo.colorHex}, color-mix(in oklab, ${mundo.colorHex} 55%, white))`,
              }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                <mundo.Icono className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-lg font-bold">{mundo.nombre}</p>
                <p className="mt-0.5 text-sm text-white/80">{tHome(`mundos.${mundo.slug}`)}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
