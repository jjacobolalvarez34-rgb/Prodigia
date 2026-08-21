"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface Anuncio {
  id: string;
  tipo: "actualizacion" | "arreglo" | "evento";
  titulo: string;
  descripcion: string;
  fecha: string;
}

const ESTILO_TIPO: Record<Anuncio["tipo"], { etiqueta: string; icono: string; color: string }> = {
  actualizacion: { etiqueta: "Actualización", icono: "🚀", color: "var(--primario)" },
  arreglo: { etiqueta: "Arreglo", icono: "🔧", color: "var(--correcto)" },
  evento: { etiqueta: "Evento", icono: "🎉", color: "var(--logro)" },
};

function formatearFecha(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "long" });
}

// Fase 12: modal de "qué hay de nuevo", mismo patrón de auto-montaje que
// NotificacionesDuelo (vive una sola vez en el layout raíz, chequea la
// sesión por su cuenta — no depende de estar en ninguna pantalla en
// particular). Se muestra un anuncio pendiente a la vez; "Entendido"/
// "Siguiente" marca el actual como leído (nunca vuelve a aparecer, ver
// marcar_anuncio_leido en 0065_anuncios.sql) y pasa al que sigue.
export default function AnunciosModal() {
  const [anuncios, setAnuncios] = useState<Anuncio[] | null>(null);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    let activo = true;
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!activo || !user) return;
      const { data } = await supabase.rpc("anuncios_pendientes");
      if (activo && data) setAnuncios(data as Anuncio[]);
    });

    return () => {
      activo = false;
    };
  }, []);

  const actual = anuncios?.[indice];

  async function avanzar() {
    if (!actual) return;
    const supabase = createClient();
    await supabase.rpc("marcar_anuncio_leido", { p_anuncio_id: actual.id });
    setIndice((i) => i + 1);
  }

  if (!actual) return null;

  const estilo = ESTILO_TIPO[actual.tipo];
  const quedan = (anuncios?.length ?? 0) - indice - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="fondo-anuncio"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
      >
        <motion.div
          key={actual.id}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-[70] w-full max-w-sm rounded-3xl border border-border bg-surface px-6 py-7 text-center shadow-2xl"
        >
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
            style={{ background: `color-mix(in oklab, ${estilo.color} 16%, var(--surface))` }}
          >
            {estilo.icono}
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide" style={{ color: estilo.color }}>
            {estilo.etiqueta} · {formatearFecha(actual.fecha)}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-foreground">{actual.titulo}</h2>
          <p className="mt-2 text-sm leading-relaxed text-texto-secundario">{actual.descripcion}</p>
          <button
            onClick={avanzar}
            className="mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: estilo.color }}
          >
            {quedan > 0 ? `Siguiente (${quedan} más)` : "Entendido"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
