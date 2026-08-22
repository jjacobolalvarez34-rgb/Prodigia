"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { MUNDOS_LANDING } from "@/lib/mundos";

const CLAVE_CONOCE = "prodigia-conoce-prodigia";

type RespuestaGuardada = "cargando" | "si" | "no" | "ninguna";

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

// Landing pública para visitantes sin sesión (Fases 0 y 1). Fase 0: se
// pregunta una sola vez por navegador si ya conoce Prodigia — la
// respuesta vive en localStorage, nunca en el servidor, porque no hay
// cuenta todavía. "Sí" manda derecho a /login para siempre (no se
// vuelve a preguntar); "No" (o primera visita, sin nada guardado)
// revela el resto de la landing.
export default function VisitanteLanding() {
  const t = useTranslations("Landing");
  const tHome = useTranslations("Home");
  const router = useRouter();
  const guardada = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Elección hecha EN ESTA visita (antes de que localStorage.getItem
  // vuelva a leerse) — así el click en "Sí"/"No" cambia la pantalla al
  // toque, sin depender de que el store se vuelva a leer.
  const [eleccion, setEleccion] = useState<"si" | "no" | null>(null);
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

  // Fase 2: signInAnonymously invisible al elegir un mundo — mismo
  // mecanismo que "Entrar como invitado" en LoginForm.tsx, disparado
  // automáticamente en vez de requerir un click aparte. La ruta /demo/*
  // (a diferencia de /numeria/practica y equivalentes) no exige el
  // onboarding de nombre ni el diagnóstico de nivel, así que el visitante
  // cae derecho en la partida de prueba.
  async function probarMundo(slug: string) {
    setError(null);
    setEntrando(slug);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInAnonymously();
    if (authError) {
      setError(t("errorInvitado"));
      setEntrando(null);
      return;
    }
    router.push(`/demo/${slug}`);
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
        {error && <p className="text-center text-sm text-error">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {MUNDOS_LANDING.map((mundo) => (
            <button
              key={mundo.slug}
              onClick={() => probarMundo(mundo.slug)}
              disabled={entrando !== null}
              className="group flex flex-col gap-3 rounded-2xl px-6 py-7 text-left text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:-rotate-1 hover:shadow-xl disabled:opacity-70"
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
              {entrando === mundo.slug && <p className="text-xs font-medium text-white/90">{t("entrando")}</p>}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
