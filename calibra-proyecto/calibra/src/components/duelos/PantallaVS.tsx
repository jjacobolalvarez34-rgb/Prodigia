"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { rangoDeElo } from "@/types/database";
import InsigniaRango from "@/components/InsigniaRango";

interface Props {
  miNombre: string;
  miElo: number;
  rivalNombre: string;
  rivalElo: number;
  rivalEsBot?: boolean;
  // "Sección Rankeds visual" (tanda nocturna): formato mejor-de-3 se
  // anuncia acá con el mismo tratamiento "FT3"/"MD3" de tetr.io — un
  // solo label arriba, el detalle de qué ronda va en `subtitulo`.
  modo?: "simple" | "mejor_de_3";
  subtitulo?: string; // ej. "Suma" o "Ronda 2/3 · Geografía"
  // null = todavía no hay cuenta regresiva (esperando al rival) — se
  // muestra "VS" solo. Un número = cuenta regresiva en curso.
  segundos: number | null;
}

// Pantalla de presentación antes de que arranque un duelo — mismo
// tratamiento visual en TODOS los mundos (Numeria vía SalaDuelo,
// Geografía/Enigmia/Quimia vía su propio PracticaClient). Puramente
// presentacional: quién maneja el reloj/la sincronización real es
// responsabilidad de quien la usa (SalaDuelo ya tiene Presence+Broadcast
// para Numeria; los demás mundos no necesitan esa sincronización real
// porque ya son asincrónicos por diseño, un countdown local alcanza).
export default function PantallaVS({ miNombre, miElo, rivalNombre, rivalElo, rivalEsBot = false, modo = "simple", subtitulo, segundos }: Props) {
  const t = useTranslations("Duelos.pantallaVS");
  const miRango = rangoDeElo(miElo);
  const rivalRango = rangoDeElo(rivalElo);

  // Choque (2026-11-02, como el video de las rankeds y la app): las dos mitades del
  // fondo, cortadas en diagonal y con el color de rango de cada uno, se cierran de
  // golpe (rival desde arriba, tú desde abajo), el VS cae grande y girado, destello y
  // entran los dos jugadores.
  const golpe = { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const };
  return (
    <div className="relative flex min-h-[70vh] flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[58%]"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 80%, 0 100%)", background: `linear-gradient(200deg, color-mix(in oklab, ${rivalRango.colorHex} 55%, var(--background)), var(--background) 92%)` }}
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        transition={golpe}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%]"
        style={{ clipPath: "polygon(0 20%, 100% 0, 100% 100%, 0 100%)", background: `linear-gradient(20deg, color-mix(in oklab, ${miRango.colorHex} 55%, var(--background)), var(--background) 92%)` }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={golpe}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.5, delay: 0.35, times: [0, 0.12, 1] }}
      />

      <div className="relative flex w-full max-w-lg flex-col items-center gap-8">
        {modo === "mejor_de_3" && (
          <span className="rounded-full bg-foreground/[0.1] px-4 py-1 font-display text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            {t("mejorDe3")}
          </span>
        )}
        {subtitulo && <p className="-mt-6 text-xs font-medium uppercase tracking-wide text-foreground/80">{subtitulo}</p>}

        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
          <LadoJugador nombre={rivalNombre} elo={rivalElo} colorHex={rivalRango.colorHex} esBot={rivalEsBot} />
        </motion.div>

        <div className="flex flex-col items-center gap-1">
          <motion.span
            className="font-display text-6xl font-black italic tracking-tighter text-white sm:text-7xl"
            style={{ textShadow: "0 0 40px rgba(255,197,61,0.6)" }}
            initial={{ scale: 3, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.35, ease: [0.7, 0, 0.84, 0] }}
          >
            {t("vs")}
          </motion.span>
          {segundos !== null && (
            <motion.span key={segundos} initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-4xl font-black tabular-nums text-white">
              {segundos}
            </motion.span>
          )}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}>
          <LadoJugador nombre={miNombre} elo={miElo} colorHex={miRango.colorHex} />
        </motion.div>
      </div>
    </div>
  );
}

function LadoJugador({ nombre, elo, colorHex, esBot = false }: { nombre: string; elo: number; colorHex: string; esBot?: boolean }) {
  const t = useTranslations("Duelos.pantallaVS");
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border border-white/20 bg-black/25 px-6 py-3 text-center backdrop-blur-sm">
      <InsigniaRango elo={elo} className="h-16 w-16 sm:h-20 sm:w-20" />
      <p className="max-w-[14rem] truncate font-display text-lg font-bold text-white sm:text-xl">{nombre}</p>
      <p className="font-mono text-sm font-semibold" style={{ color: colorHex }}>
        {t("eloValor", { elo })}
      </p>
      {esBot && (
        <span className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-texto-secundario">
          {t("clanDeBots")}
        </span>
      )}
    </div>
  );
}
