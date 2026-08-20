"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PREFIJO = "prodigia-aviso-";

// No hace falta reaccionar a cambios de localStorage desde otra
// pestaña/instancia — nunca se llama al listener. Solo existe para
// que useSyncExternalStore tenga una subscribe function real,
// sin lo cual no puede leer localStorage de forma segura para SSR
// (mismo motivo por el que PrimeraVezTip.tsx ya lo usaba).
function subscribeNoop() {
  return () => {};
}

function yaVisto(avisoKey: string): boolean {
  try {
    return !!localStorage.getItem(PREFIJO + avisoKey);
  } catch {
    return true; // si localStorage falla, mejor no molestar con el aviso
  }
}

// Sección 10.6: Rankeds, Quimia, Chispas y rangos no existían cuando se
// construyó PrimeraVezTip.tsx (el tour guiado de onboarding, Fase W) —
// pero ESE componente quedó deliberadamente restringido a esa única
// secuencia en la home: Header.tsx documenta que una versión anterior
// mostrada ahí se desactivó por un tip que quedaba "pegado" sin forma
// confiable de reproducirlo. La causa más probable es la cola
// compartida entre instancias (`cola` a nivel de módulo en
// PrimeraVezTip.tsx) — pensada para una sola secuencia en una sola
// página, no para avisos independientes en 4 páginas distintas que se
// montan/desmontan en momentos distintos.
//
// Este componente es deliberadamente más simple y NO comparte ese
// mecanismo: cada aviso es independiente, un solo flag de localStorage
// por `avisoKey`, sin cola ni coordinación entre instancias — evita la
// clase de bug entera en vez de arriesgar reproducirla en 4 lugares
// nuevos. No es un spotlight ni recorre varios elementos, solo un
// globo con un botón "Entendido" pegado al elemento que envuelve.
interface Props {
  avisoKey: string;
  texto: string;
  children: React.ReactNode;
}

export default function AvisoPrimeraVez({ avisoKey, texto, children }: Props) {
  // Snapshot del server: siempre "ya visto" (false), así el HTML inicial
  // nunca muestra el aviso y no hay mismatch de hidratación — recién en
  // el cliente, si localStorage dice que no se vio, se hace visible.
  const noVistoTodavia = useSyncExternalStore(
    subscribeNoop,
    () => !yaVisto(avisoKey),
    () => false
  );
  const [descartadoAhora, setDescartadoAhora] = useState(false);
  const visible = noVistoTodavia && !descartadoAhora;

  function descartar() {
    setDescartadoAhora(true);
    try {
      localStorage.setItem(PREFIJO + avisoKey, "1");
    } catch {
      // localStorage puede fallar (modo privado, cuota) — el aviso ya
      // se ocultó igual por descartadoAhora, solo no queda recordado
      // para la próxima visita.
    }
  }

  return (
    <div className="relative inline-block">
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            // z-50, no z-40: en la home puede coexistir con el tour de
            // onboarding (PrimeraVezTip, tipKey="tour-mundos"), cuyo
            // overlay de fondo completo usa z-40 sin pointer-events:none
            // — con el mismo z-index, el orden en el DOM decide cuál
            // gana, y en la práctica el overlay del tour tapaba el botón
            // "Entendido" de este aviso, dejándolo imposible de cerrar.
            // Confirmado en vivo con Playwright antes de subir el
            // z-index (el click a "Entendido" fallaba con "intercepts
            // pointer events" apuntando exactamente a ese overlay).
            className="absolute left-1/2 top-full z-50 mt-3 w-64 -translate-x-1/2 rounded-2xl border border-border bg-surface px-4 py-3 text-left shadow-xl"
          >
            <p className="text-sm font-medium leading-snug text-foreground">{texto}</p>
            <button onClick={descartar} className="mt-2 rounded-lg bg-primario px-3 py-1.5 text-xs font-semibold text-white">
              Entendido
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
