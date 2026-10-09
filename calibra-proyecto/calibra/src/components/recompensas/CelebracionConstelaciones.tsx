"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { reproducirTono } from "@/lib/sonido";
import { CATALOGO_NUEVO, ciudadDe, COLOR_RAREZA, tono, type Rareza } from "@/lib/recompensas/catalogo";
import { constelacionesPorVer, marcarConstelacionesVistas, type ConstelacionCompletada } from "@/lib/recompensas/constelaciones";
import { refrescarCosmeticosWeb } from "@/lib/recompensas/cosmeticosWeb";
import CountUp from "@/components/CountUp";
import Constelacion from "./Constelacion";
import VistaCosmetico from "./VistaCosmetico";

// Constelaciones completadas que todavía no se celebraron (0259): se muestran una
// vez, fuera de las partidas (igual que CelebracionConstelaciones de la app). Se
// revisa al cambiar de página, así la que se completó en la última partida aparece
// al volver al inicio o a los resultados.
// Secuencia: las estrellas se encienden y las líneas se dibujan; al cerrarse el
// dibujo, destello del color de la ciudad; la constelación sube y cada premio sale
// en el centro, uno por uno, con su propio estallido. Abajo se juntan los que salieron.
const NO_INTERRUMPIR = /(practica|sprint|duelo|diagnostico|reto)/;
const DIBUJO_MS = 2600;

interface PremioVista {
  clave: string;
  color: string;
  etiqueta: string;
  mini: ReactNode;
  contenido: ReactNode;
  grande: boolean;
}

const ICONO_FUGAZ: Record<string, string> = { hielo: "❄️", tiempo_extra: "⏱️", pista: "💡", chispas: "⚡" };

function Estallido({ color, grande }: { color: string; grande: boolean }) {
  const particulas = useMemo(
    () =>
      Array.from({ length: grande ? 26 : 18 }, (_, i) => {
        const a = (i / (grande ? 26 : 18)) * Math.PI * 2 + (i % 3) * 0.2;
        const d = 120 + ((i * 37) % 90);
        return { x: Math.cos(a) * d, y: Math.sin(a) * d, tam: 4 + (i % 4) * 2 };
      }),
    [grande]
  );
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.span
        className="absolute h-[520px] w-[520px] rounded-full opacity-40"
        style={{ background: `repeating-conic-gradient(from 0deg, ${color}55 0deg 8deg, transparent 8deg 24deg)` }}
        initial={{ scale: 0.4, opacity: 0, rotate: 0 }}
        animate={{ scale: 1, opacity: 0.45, rotate: 360 }}
        transition={{ scale: { duration: 0.4 }, opacity: { duration: 0.3 }, rotate: { duration: 16, repeat: Infinity, ease: "linear" } }}
      />
      <motion.span className="absolute h-40 w-40 rounded-full" style={{ background: color }} initial={{ scale: 0.4, opacity: 0.8 }} animate={{ scale: 3.2, opacity: 0 }} transition={{ duration: 0.9 }} />
      {particulas.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ width: p.tam, height: p.tam, background: i % 3 === 0 ? "#fff" : color, boxShadow: `0 0 8px ${color}` }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y + 40, opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export default function CelebracionConstelaciones() {
  const t = useTranslations("Recompensas.constelaciones.celebracion");
  const tRareza = useTranslations("Recompensas.tienda.rareza");
  const tMundos = useTranslations("Mundos.nombres");
  const ruta = usePathname();
  const [lista, setLista] = useState<ConstelacionCompletada[]>([]);
  const [i, setI] = useState(0);
  const [cerrado, setCerrado] = useState(false);
  // -1 mientras se dibuja; 0..n-1 el premio que está en el centro.
  const [k, setK] = useState(-1);

  useEffect(() => {
    if (NO_INTERRUMPIR.test(ruta) || lista.length > 0) return;
    let vivo = true;
    constelacionesPorVer(createClient()).then((l) => {
      if (vivo && l.length > 0) {
        setI(0);
        setLista(l);
      }
    });
    return () => {
      vivo = false;
    };
  }, [ruta, lista.length]);

  const actual = lista[i];
  useEffect(() => {
    if (!actual) return;
    const t1 = setTimeout(() => {
      setCerrado(true);
      reproducirTono("logro");
    }, DIBUJO_MS);
    const t2 = setTimeout(() => setK(0), DIBUJO_MS + 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [actual]);

  const premios = useMemo<PremioVista[]>(() => {
    if (!actual) return [];
    const p = actual.premio;
    const out: PremioVista[] = [];
    const multiplicadores = [actual.alineacion ? t("alineacionCorto") : null, actual.de_noche ? t("nocheCorto") : null].filter((x): x is string => !!x);
    out.push({
      clave: "chispas",
      color: "#FFB627",
      etiqueta: t("etiquetaChispas"),
      grande: p.chispas >= 600,
      mini: "⚡",
      contenido: (
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-logro bg-[#0A0C18]/90 text-6xl shadow-[0_0_34px_#FFB627]">⚡</div>
          <p className="font-display text-6xl font-black tabular-nums text-logro">
            +<CountUp value={p.chispas} />
          </p>
          <p className="font-semibold text-logro">{t("etiquetaChispas")}</p>
          {multiplicadores.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {multiplicadores.map((m, j) => (
                <motion.span key={m} className="rounded-full border border-primario/50 bg-primario/25 px-3 py-1 text-xs text-foreground" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 + j * 0.25, type: "spring", damping: 9 }}>
                  {m}
                </motion.span>
              ))}
            </div>
          )}
        </div>
      ),
    });
    if (p.pieza) {
      const rareza = (p.pieza.rareza ?? "raro") as Rareza;
      const colorRareza = COLOR_RAREZA[rareza] ?? "#B9A8FF";
      const it = CATALOGO_NUEVO.find((x) => x.item === p.pieza!.slug);
      const categoria = it?.categoria ?? (p.pieza.slug.startsWith("marco_") ? "marco" : "titulo");
      const valor = it?.valor ?? p.pieza.slug.replace(/^marco_/, "");
      out.push({
        clave: "pieza",
        color: colorRareza,
        etiqueta: t("etiquetaPieza"),
        grande: rareza === "epico" || rareza === "legendario",
        mini: "🧩",
        contenido: (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 bg-[#0A0C18]/90" style={{ borderColor: colorRareza, boxShadow: `0 0 34px ${colorRareza}` }}>
              <VistaCosmetico categoria={categoria} valor={valor} tam={70} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: colorRareza }}>
              {tRareza(rareza)}
            </p>
            <p className="font-display text-2xl font-bold text-foreground">{p.pieza.nombre}</p>
            <p className="text-sm text-texto-secundario">{t("piezaTuya")}</p>
          </div>
        ),
      });
    }
    if (p.fugaz) {
      const fugaz = p.fugaz;
      out.push({
        clave: "fugaz",
        color: "#9FE6FF",
        etiqueta: t("etiquetaFugaz"),
        grande: true,
        mini: "🌠",
        contenido: (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-[#9FE6FF] bg-[#0A0C18]/90 text-5xl shadow-[0_0_34px_#9FE6FF]">{ICONO_FUGAZ[fugaz.premio] ?? "🌠"}</div>
            <p className="font-display text-2xl font-bold text-foreground">{t(`fugaces.${fugaz.premio}`)}</p>
            <p className="text-sm text-texto-secundario">{t("fugazNota")}</p>
          </div>
        ),
      });
    }
    return out;
  }, [actual, t, tRareza]);

  const premio = k >= 0 ? premios[k] : null;
  useEffect(() => {
    if (premio) reproducirTono(premio.grande ? "logro" : "correcto");
  }, [premio]);

  async function seguir() {
    setCerrado(false);
    setK(-1);
    if (i < lista.length - 1) {
      setI(i + 1);
      return;
    }
    setLista([]);
    await marcarConstelacionesVistas(createClient());
    refrescarCosmeticosWeb();
  }

  function avanzar() {
    if (!premio) return;
    if (k < premios.length - 1) setK(k + 1);
    else seguir();
  }

  const acento = actual ? tono(ciudadDe(actual.mundo)?.color ?? "#6C4CF1", 0.35) : "#B9A8FF";
  const esUltimo = k === premios.length - 1;

  return (
    <AnimatePresence>
      {actual && (
        <motion.div key="fondo" className="fixed inset-0 z-[90] flex flex-col items-center overflow-hidden bg-[#05070D]/95 p-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={avanzar}>
          {cerrado && !premio && (
            <div className="absolute inset-0">
              <Estallido color={acento} grande={false} />
            </div>
          )}
          {premio && (
            <div key={premio.clave} className="absolute inset-x-0 top-[52%] h-0">
              <Estallido color={premio.color} grande={premio.grande} />
            </div>
          )}
          {premio?.clave === "fugaz" && (
            <motion.span
              className="pointer-events-none fixed left-0 top-16 h-[3px] w-24 rounded-full bg-white shadow-[0_0_12px_#FFB627]"
              initial={{ x: -120, y: 0, rotate: 25, opacity: 0 }}
              animate={{ x: "110vw", y: 160, opacity: [0, 1, 0.4] }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          )}

          <motion.div
            key={actual.id}
            className="relative flex flex-col items-center gap-3"
            initial={{ y: "18vh", scale: 1 }}
            animate={premio ? { y: 0, scale: 0.5 } : cerrado ? { y: "18vh", scale: [1, 1.1, 1] } : { y: "18vh", scale: 1 }}
            transition={{ duration: premio ? 0.6 : 0.4, ease: "easeInOut" }}
            style={{ transformOrigin: "top center" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: acento }}>
              {t("de", { ciudad: tMundos(actual.mundo), n: actual.numero })}
            </p>
            <div className="rounded-2xl transition-shadow duration-500" style={{ boxShadow: cerrado ? `0 0 40px ${acento}88` : "none" }}>
              <Constelacion mundo={actual.mundo} estrellas={7} tam={260} celebrar />
            </div>
            {cerrado && !premio && (
              <motion.h2 className="font-display text-3xl font-bold text-foreground" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                {t("titulo")}
              </motion.h2>
            )}
          </motion.div>

          {premio && (
            <>
              <div className="relative -mt-[120px] flex flex-col items-center">
                <h2 className="font-display text-xl font-bold text-foreground">{t("titulo")}</h2>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest" style={{ color: premio.color }}>
                  {premios.length > 1 ? t("deCuantos", { premio: premio.etiqueta, n: k + 1, total: premios.length }) : premio.etiqueta}
                </p>
              </div>
              <motion.div key={premio.clave} className="relative mt-8" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 9, stiffness: 150 }}>
                {premio.contenido}
              </motion.div>
              <div className="absolute inset-x-6 bottom-8 mx-auto flex max-w-sm flex-col gap-4">
                <div className="flex justify-center gap-2">
                  {premios.slice(0, k + 1).map((p, j) => (
                    <motion.span
                      key={p.clave}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 bg-[#0A0C18]/80 text-lg"
                      style={{ borderColor: p.color }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: j === k ? 0.5 : 0 }}
                    >
                      {p.mini}
                    </motion.span>
                  ))}
                </div>
                <motion.button
                  key={`b${k}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    avanzar();
                  }}
                  className="rounded-full bg-logro px-6 py-3 font-bold text-[#2A1A00] transition hover:brightness-110"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {!esUltimo ? t("siguientePremio") : i < lista.length - 1 ? t("siguiente") : t("genial")}
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

