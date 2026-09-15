"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Boton from "@/components/Boton";

const CLAVE_SESSION = "prodigia-pedir-edad-mostrado";

// Pedido en vivo (2026-09-15): "la edad debe ser DESPUÉS de pedir el
// nombre, después de verificar la cuenta" — antes se pedía en el primer
// paso de RegistroForm.tsx/ConvertirCuenta.tsx, junto a email y
// contraseña, justo el paso con más fricción (el que estaba fallando
// por el correo roto). Ahora es un solo lugar, post-login: se monta acá
// (Header.tsx, solo para sesiones reales no-invitado) y se pregunta a
// sí mismo si hace falta — sin necesidad de que cada página que usa
// Header le pase el dato. Solo se muestra una vez por sesión de
// navegador si no se contestó (sessionStorage) — no es tan urgente
// como el recordatorio de invitado, no hace falta insistir en cada
// click, pero vuelve a preguntar la próxima vez que abras la app hasta
// que se conteste (edad_ingresada sigue en null).
export default function PedirEdadModal() {
  const t = useTranslations("Common.pedirEdad");
  const [abierto, setAbierto] = useState(false);
  const [edad, setEdad] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    async function chequear() {
      try {
        if (sessionStorage.getItem(CLAVE_SESSION)) return;
      } catch {
        // sessionStorage no disponible — sigue igual, puede insistir más seguido.
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || user.is_anonymous) return;

      const { data: profile } = await supabase.from("profiles").select("edad_ingresada").eq("id", user.id).single();
      if (cancelado || profile?.edad_ingresada != null) return;

      try {
        sessionStorage.setItem(CLAVE_SESSION, "1");
      } catch {
        // no bloquea mostrar el modal esta vez.
      }
      const id = setTimeout(() => setAbierto(true), 800);
      return () => clearTimeout(id);
    }
    chequear();
    return () => {
      cancelado = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const edadNum = Number(edad);
    if (!edad || !Number.isInteger(edadNum) || edadNum < 1 || edadNum > 120) {
      setError(t("errorInvalida"));
      return;
    }
    setEnviando(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("guardar_edad_usuario", { p_edad: edadNum });
    setEnviando(false);
    if (rpcError) {
      setError(t("errorGenerico"));
      return;
    }
    setAbierto(false);
  }

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setAbierto(false)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-[70] w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl"
          >
            <button
              onClick={() => setAbierto(false)}
              aria-label={t("cerrar")}
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-texto-secundario shadow-md hover:text-foreground"
            >
              ✕
            </button>
            <h2 className="font-display text-lg font-bold text-foreground">{t("titulo")}</h2>
            <p className="mt-1 text-sm text-texto-secundario">{t("subtitulo")}</p>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
              <input
                type="number"
                required
                min={1}
                max={120}
                autoFocus
                value={edad}
                onChange={(ev) => setEdad(ev.target.value)}
                placeholder={t("placeholder")}
                className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primario"
              />
              <Boton type="submit" cargando={enviando} className="w-full">
                {t("boton")}
              </Boton>
              {error && <p className="text-sm text-error">{error}</p>}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
