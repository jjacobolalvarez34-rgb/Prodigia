"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { EMOTES } from "@/lib/recompensas/catalogo";
import { useCosmeticosWeb } from "@/lib/recompensas/cosmeticosWeb";
import { enviarEmote, useEmoteRecibido } from "@/lib/duelos/emotes";

// Fila de emotes durante un duelo en vivo (igual que EmotesDuelo de la app): solo
// los que tienes, con 3 s de pausa entre uno y otro, y la burbuja del que te mandó
// el rival.
export default function EmotesDuelo() {
  const t = useTranslations("Recompensas.emotes");
  const { emotes } = useCosmeticosWeb();
  const recibido = useEmoteRecibido();
  const [espera, setEspera] = useState(false);
  const [enviado, setEnviado] = useState<{ valor: string; id: number } | null>(null);
  const r = recibido ? EMOTES[recibido.valor] : null;
  const yo = enviado ? EMOTES[enviado.valor] : null;
  // Emote animado (el «Baile de esqueletos»): se ve en grande sobre el duelo.
  const grande = (r?.animado && recibido) ? { animado: r.animado, id: `r${recibido.id}`, mio: false } : yo?.animado && enviado ? { animado: yo.animado, id: `y${enviado.id}`, mio: true } : null;
  return (
    <div className="flex flex-col gap-1.5">
      <AnimatePresence>
        {grande && (
          <motion.div key={grande.id} initial={{ scale: 0.5, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ type: "spring", damping: 14 }} className="pointer-events-none fixed inset-x-0 top-1/3 z-50 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/emotes/${grande.animado}-grande.webp`} alt="" className={`w-[min(80vw,420px)] drop-shadow-[0_10px_30px_rgba(0,0,0,.6)] ${grande.mio ? "" : "-scale-x-100"}`} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex min-h-0 justify-between gap-2" aria-live="polite">
        <AnimatePresence>
          {r && (
            <motion.span key={`r${recibido!.id}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, y: -8 }} className="rounded-2xl border-2 border-error bg-surface px-3 py-1 text-sm font-semibold text-foreground">
              {r.emoji} {r.texto}
            </motion.span>
          )}
          {yo && (
            <motion.span key={`y${enviado!.id}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, y: -8 }} className="ml-auto rounded-2xl border-2 border-primario bg-surface px-3 py-1 text-sm font-semibold text-foreground">
              {yo.emoji} {yo.texto}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label={t("titulo")}>
        {emotes
          .filter((e) => EMOTES[e])
          .map((e) => (
            <button
              key={e}
              type="button"
              disabled={espera}
              title={EMOTES[e].texto}
              aria-label={EMOTES[e].texto}
              onClick={() => {
                enviarEmote(e);
                const id = Date.now();
                setEnviado({ valor: e, id });
                setEspera(true);
                setTimeout(() => setEspera(false), 3000);
                setTimeout(() => setEnviado((x) => (x?.id === id ? null : x)), 2500);
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-primario/10 text-lg transition-transform hover:scale-110 disabled:opacity-40"
            >
              {EMOTES[e].animado ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/emotes/${EMOTES[e].animado}-icono.png`} alt="" className="h-7 w-7 object-contain" />
              ) : (
                EMOTES[e].emoji
              )}
            </button>
          ))}
      </div>
    </div>
  );
}
