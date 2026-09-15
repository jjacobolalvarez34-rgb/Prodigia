"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Boton from "@/components/Boton";
import ScrollFloat from "@/components/reactbits/ScrollFloat";
import Shuffle from "@/components/reactbits/Shuffle";
import DecryptedText from "@/components/reactbits/DecryptedText";
import { FUENTE_NOMBRE_CLASS, ANIMACION_NOMBRE_CLASS, ANIMACIONES_PESADAS, type FuenteNombre, type AnimacionNombre } from "@/types/database";

// Fase 6 (mercado): cambiar de nombre después del primero cuesta
// Chispas — nunca Experiencia, que es semanal/temporal y mediría mal si
// se pudiera gastar. cambiar_nombre_usuario (0054) cobra server-side;
// acá solo se muestra el costo antes de confirmar.
const COSTO_RENOMBRAR = 100;

interface Props {
  nombreActual: string | null;
  fuente?: FuenteNombre;
  animacion?: AnimacionNombre;
}

export default function NombreEditable({ nombreActual, fuente, animacion }: Props) {
  const t = useTranslations("Perfil");
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(nombreActual ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    if (nombre.trim().length < 2) return;
    setGuardando(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("cambiar_nombre_usuario", { p_nombre: nombre.trim() });
    setGuardando(false);
    if (rpcError) {
      setError(rpcError.message ?? t("nombreEditable.errorGuardar"));
      return;
    }
    setEditando(false);
    router.refresh();
  }

  if (!editando) {
    // Fase 10 (Tienda: animaciones adicionales) — mismo componente que
    // ya anima los nombres del ranking (ScrollFloat, /leaderboard),
    // ahora también en tu propio perfil. La tipografía comprada
    // (fuente_nombre) se preserva vía textClassName, mismo mapeo que
    // usa NombreConFuente.tsx.
    const claseFuente = FUENTE_NOMBRE_CLASS[fuente ?? "default"] ?? "";
    const texto = nombreActual ?? t("nombreEditable.jugador");
    // Perfil propio: único lugar (junto al perfil público) con UN
    // nombre en pantalla — acá sí se permite montar el componente
    // pesado de shuffle/decrypted en vez de la clase CSS liviana. Ver
    // el mismo criterio en NombreConFuente.tsx (permitirEfectosPesados).
    return (
      <div className="flex items-center gap-3">
        {animacion && ANIMACIONES_PESADAS.has(animacion) ? (
          animacion === "shuffle" ? (
            <Shuffle
              text={texto}
              tag="h1"
              className={`font-display text-2xl font-bold tracking-tight text-foreground ${claseFuente}`}
            />
          ) : (
            <DecryptedText
              text={texto}
              animateOn="hover"
              className={`font-display text-2xl font-bold tracking-tight text-foreground ${claseFuente}`}
            />
          )
        ) : (
          <ScrollFloat
            tag="h1"
            className="font-display text-2xl font-bold tracking-tight text-foreground"
            textClassName={`${claseFuente} ${ANIMACION_NOMBRE_CLASS[animacion ?? "ninguna"] ?? ""}`}
            animationDuration={0.7}
          >
            {texto}
          </ScrollFloat>
        )}
        <button
          onClick={() => setEditando(true)}
          className="text-xs font-medium text-primario hover:underline"
        >
          {t("nombreEditable.editar")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          minLength={2}
          maxLength={40}
          autoFocus
          className="rounded-lg border border-border bg-background px-3 py-1.5 font-display text-lg font-bold text-foreground outline-none focus:border-primario"
        />
        <Boton onClick={guardar} disabled={nombre.trim().length < 2} cargando={guardando} className="px-3 py-1.5 text-sm">
          {guardando ? t("nombreEditable.guardando") : t("nombreEditable.guardar")}
        </Boton>
        <button
          onClick={() => {
            setNombre(nombreActual ?? "");
            setError(null);
            setEditando(false);
          }}
          className="text-sm text-texto-secundario hover:underline"
        >
          {t("nombreEditable.cancelar")}
        </button>
      </div>
      <p className="text-xs text-texto-secundario">{t("nombreEditable.costoCambiar", { costo: COSTO_RENOMBRAR })}</p>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
