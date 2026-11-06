"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

// Pagos en fase de prueba (2026-11-06, antes del directo): mientras Paddle siga en
// sandbox, tocar cualquier botón de compra no abre el pago sino este letrero: todavía no
// hay pagos verificados, y quien está acá es de los primeros testers, así que tiene Pro
// gratis 7 días (activar_pro_tester, 0315). Lo dispara useCheckout (Vitrina.tsx) con el
// evento «prodigia:pagos-en-prueba». Textos en es/en acá mismo (provisorio, hasta que
// los pagos estén reales y este letrero se retire).
export const EVENTO_PAGOS_EN_PRUEBA = "prodigia:pagos-en-prueba";

export function pagosEnPrueba(): boolean {
  return (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "test_").startsWith("test_");
}

type Estado = "listo" | "activando" | "activado" | "ya_pro" | "ya_usado" | "invitado" | "terminado" | "error";

const TEXTOS = {
  es: {
    eyebrow: "Fase de prueba",
    titulo: "Todavía no tenemos los pagos verificados",
    texto: "Por ahora no se puede comprar nada con dinero. Lo bueno: eres de los primeros testers de Prodigia, y los testers juegan con Pro gratis.",
    lista: ["Los 15 mundos abiertos", "Clases y técnicas completas", "Más Chispas en cada partida", "Estadísticas Pro"],
    activar: "Activar mi Pro de tester (7 días)",
    activando: "Activando…",
    activado: "¡Listo! Ya eres Pro de tester.",
    yaPro: "Ya tienes Pro: disfrútalo mientras dure la prueba.",
    yaUsado: "Ya usaste tu Pro de tester. Cuando abramos los pagos te avisamos.",
    invitado: "Crea tu cuenta (es gratis) para activar tu Pro de tester.",
    crearCuenta: "Crear mi cuenta",
    terminado: "La fase de prueba terminó.",
    error: "No se pudo activar. Inténtalo de nuevo en un momento.",
    cerrar: "Seguir jugando",
  },
  en: {
    eyebrow: "Beta",
    titulo: "Payments aren't verified yet",
    texto: "You can't buy anything with money just yet. The good part: you're one of Prodigia's first testers, and testers play with Pro for free.",
    lista: ["All 15 worlds unlocked", "Full lessons and techniques", "More Sparks every game", "Pro stats"],
    activar: "Activate my tester Pro (7 days)",
    activando: "Activating…",
    activado: "Done! You're a Pro tester now.",
    yaPro: "You already have Pro: enjoy it during the beta.",
    yaUsado: "You already used your tester Pro. We'll let you know when payments open.",
    invitado: "Create your free account to activate your tester Pro.",
    crearCuenta: "Create my account",
    terminado: "The beta is over.",
    error: "Couldn't activate it. Try again in a moment.",
    cerrar: "Keep playing",
  },
};

export default function AvisoPagosEnPrueba() {
  const locale = useLocale();
  const tx = locale === "en" ? TEXTOS.en : TEXTOS.es;
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [estado, setEstado] = useState<Estado>("listo");

  useEffect(() => {
    const abrir = () => {
      setEstado("listo");
      setVisible(true);
    };
    window.addEventListener(EVENTO_PAGOS_EN_PRUEBA, abrir);
    return () => window.removeEventListener(EVENTO_PAGOS_EN_PRUEBA, abrir);
  }, []);

  async function activar() {
    setEstado("activando");
    const supabase = createClient();
    const { data: sesion } = await supabase.auth.getUser();
    if (!sesion.user || sesion.user.is_anonymous) {
      setEstado("invitado");
      return;
    }
    const { data, error } = await supabase.rpc("activar_pro_tester");
    if (error) {
      setEstado("error");
      return;
    }
    const r = String(data ?? "");
    if (r === "activado") {
      setEstado("activado");
      setTimeout(() => {
        setVisible(false);
        router.push("/pro/bienvenida?regalo=1");
        router.refresh();
      }, 900);
    } else if (r === "ya_pro" || r === "ya_usado" || r === "invitado" || r === "terminado") setEstado(r);
    else setEstado("error");
  }

  const mensaje: Partial<Record<Estado, string>> = { activado: tx.activado, ya_pro: tx.yaPro, ya_usado: tx.yaUsado, invitado: tx.invitado, terminado: tx.terminado, error: tx.error };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="aviso-pagos-prueba"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setVisible(false)}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm rounded-3xl border-2 border-[#05060F] bg-surface px-6 py-7 text-center shadow-[6px_6px_0_0_#05060F]"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-logro/15">
              <Logo size={44} />
            </div>
            <p className="mt-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-logro">{tx.eyebrow}</p>
            <h2 className="mt-1 font-display text-xl font-bold text-foreground">{tx.titulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-texto-secundario">{tx.texto}</p>
            <ul className="mt-3 flex flex-col gap-1 rounded-xl bg-logro/10 px-4 py-3 text-left text-sm text-foreground">
              {tx.lista.map((l) => (
                <li key={l}>· {l}</li>
              ))}
            </ul>
            {mensaje[estado] && <p className={`mt-3 text-sm font-semibold ${estado === "activado" ? "text-correcto" : estado === "error" ? "text-error" : "text-foreground"}`}>{mensaje[estado]}</p>}
            {estado === "invitado" ? (
              <button type="button" onClick={() => { setVisible(false); router.push("/registro"); }} className="mt-5 w-full rounded-xl border-2 border-[#05060F] bg-logro px-4 py-3 font-display text-base font-bold text-[#1A1206] shadow-[4px_4px_0_0_#05060F] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none">
                {tx.crearCuenta}
              </button>
            ) : (
              (estado === "listo" || estado === "activando" || estado === "error") && (
                <button type="button" disabled={estado === "activando"} onClick={() => void activar()} className="mt-5 w-full rounded-xl border-2 border-[#05060F] bg-logro px-4 py-3 font-display text-base font-bold text-[#1A1206] shadow-[4px_4px_0_0_#05060F] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-60">
                  {estado === "activando" ? tx.activando : tx.activar}
                </button>
              )
            )}
            <button type="button" onClick={() => setVisible(false)} className="mt-2 w-full rounded-xl px-4 py-2 text-sm font-semibold text-texto-secundario hover:text-foreground">
              {tx.cerrar}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
