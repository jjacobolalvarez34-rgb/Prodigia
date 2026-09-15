"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { MUNDOS_LANDING, type MundoLanding } from "@/lib/mundos";

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
// (Fase 7): "¿Ya conoces Prodigia?" (paso 0, sin cambios) → si "No":
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
          <p className="mt-1 text-xs text-texto-secundario/70">{t("grid.pista")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {MUNDOS_LANDING.map((mundo) => (
            <TarjetaCiudadMisteriosa
              key={mundo.slug}
              mundo={mundo}
              descripcion={tHome(`mundos.${mundo.slug}`)}
              onElegir={() => {
                setCiudadElegida(mundo.slug);
                setPaso("mecanismo");
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// Rediseño pedido en vivo (2026-09-15): "prefiero que la lista no
// especifique que ciudades hay, sino que si dejas el mouse encima 0.5s
// aparezca un cuadro que dice qué se estudia ahí; en celular sería
// mantener oprimida la pantalla". La tarjeta ya no muestra nombre ni
// descripción — solo el ícono — y revela ambos en un tooltip flotante
// tras 500ms de hover (desktop) o de mantener presionado (touch). En
// touch, un mantener-presionado NO navega (largoRef corta el click que
// el navegador dispara igual al soltar); un toque rápido sí navega,
// igual que antes.
function TarjetaCiudadMisteriosa({
  mundo,
  descripcion,
  onElegir,
}: {
  mundo: MundoLanding;
  descripcion: string;
  onElegir: () => void;
}) {
  const [tooltip, setTooltip] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const largoRef = useRef(false);

  function cancelarTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function iniciarPresion() {
    largoRef.current = false;
    cancelarTimeout();
    timeoutRef.current = setTimeout(() => {
      largoRef.current = true;
      setTooltip(true);
    }, 500);
  }

  function salirMouse() {
    cancelarTimeout();
    setTooltip(false);
    largoRef.current = false;
  }

  function terminarToque() {
    cancelarTimeout();
    if (largoRef.current) {
      // Fue un mantener-presionado: se queda un instante visible y se
      // cierra solo, sin navegar.
      setTimeout(() => {
        setTooltip(false);
        largoRef.current = false;
      }, 1500);
    }
  }

  function handleClick() {
    if (largoRef.current) {
      // El navegador dispara "click" igual al soltar un touch largo —
      // si el tooltip ya se mostró por mantener presionado, este click
      // no cuenta como elección.
      largoRef.current = false;
      return;
    }
    onElegir();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={iniciarPresion}
      onMouseLeave={salirMouse}
      onTouchStart={iniciarPresion}
      onTouchEnd={terminarToque}
      onTouchCancel={salirMouse}
      className="group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl px-6 py-9 text-center text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:-rotate-1 hover:shadow-xl"
      style={{
        background: `linear-gradient(120deg, ${mundo.colorHex}, color-mix(in oklab, ${mundo.colorHex} 55%, white))`,
      }}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
        <mundo.Icono className="h-6 w-6" />
      </span>
      <span className="font-display text-2xl font-black tracking-widest text-white/60">?</span>

      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl bg-black/85 px-3 py-2.5 text-left shadow-lg backdrop-blur-sm"
          >
            <p className="font-display text-sm font-bold text-white">{mundo.nombre}</p>
            <p className="mt-0.5 text-xs text-white/85">{descripcion}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
