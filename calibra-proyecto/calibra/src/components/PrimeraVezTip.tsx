"use client";

import { useEffect, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PREFIJO = "prodigia-tip-vista-";
const TOUR_KEY = "prodigia-tour-onboarding-visto";

type Listener = () => void;
const listeners = new Set<Listener>();
let cola: string[] = [];

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function tourYaVisto(): boolean {
  try {
    return !!localStorage.getItem(TOUR_KEY);
  } catch {
    return true;
  }
}

function marcarTourVisto() {
  try {
    localStorage.setItem(TOUR_KEY, "1");
  } catch {
    // ver tourYaVisto() arriba
  }
}

function yaVista(tipKey: string): boolean {
  try {
    return !!localStorage.getItem(PREFIJO + tipKey);
  } catch {
    return true; // si localStorage falla, no molestamos con el tip
  }
}

function marcarVista(tipKey: string) {
  try {
    localStorage.setItem(PREFIJO + tipKey, "1");
  } catch {
    // ver yaVista() arriba
  }
  cola = cola.filter((k) => k !== tipKey);
  if (cola.length === 0) marcarTourVisto();
  emitChange();
}

function registrar(tipKey: string) {
  if (tourYaVisto() || yaVista(tipKey) || cola.includes(tipKey)) return;
  cola = [...cola, tipKey];
  emitChange();
}

function desregistrar(tipKey: string) {
  // si se desmonta sin descartarse (ej. el usuario navegó a otra
  // página), libera el turno para no trabar a los demás tips en cola.
  if (cola.includes(tipKey)) {
    cola = cola.filter((k) => k !== tipKey);
    emitChange();
  }
}

function tipActivo(): string | null {
  return cola[0] ?? null;
}

function largoCola(): number {
  return cola.length;
}

interface Props {
  tipKey: string;
  texto: string;
  children: React.ReactNode;
}

// El tour guiado de onboarding (Fase W/EE): una única secuencia, una sola
// vez por cuenta, que recorre los elementos clave de la home de Prodigia
// (Header + grilla de Mundos) con un overlay tipo spotlight — fondo
// oscurecido, el elemento señalado queda "recortado" arriba del overlay.
// A propósito NO se usa en ningún otro lugar de la app: los tips
// dispersos por /numeria y /practica se sacaron porque contradecían el
// criterio de "solo durante el tour inicial".
export default function PrimeraVezTip({ tipKey, texto, children }: Props) {
  const activo = useSyncExternalStore(
    subscribe,
    () => tipActivo(),
    () => null // snapshot de servidor: nunca se muestra en el HTML inicial
  );
  const restantes = useSyncExternalStore(subscribe, () => largoCola(), () => 0);

  useEffect(() => {
    registrar(tipKey);
    return () => desregistrar(tipKey);
  }, [tipKey]);

  const visible = activo === tipKey;

  return (
    <div className="relative inline-block">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/75 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      <div
        className={`relative transition-shadow duration-200 ${
          visible ? "z-50 rounded-xl shadow-[0_0_0_6px_var(--surface),0_0_0_9px_var(--primario)]" : ""
        }`}
      >
        {children}
      </div>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 top-full z-50 mt-4 w-72 -translate-x-1/2 rounded-2xl border border-border bg-surface px-5 py-4 text-left shadow-xl"
          >
            <p key={tipKey} className="text-base font-medium leading-snug text-foreground">
              {texto.split(" ").map((palabra, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.035, ease: "easeOut" }}
                  className="inline-block"
                >
                  {palabra}
                  {i < texto.split(" ").length - 1 ? " " : ""}
                </motion.span>
              ))}
            </p>
            <button
              onClick={() => marcarVista(tipKey)}
              className="mt-3 rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white"
            >
              {restantes > 1 ? "Siguiente" : "Entendido"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
