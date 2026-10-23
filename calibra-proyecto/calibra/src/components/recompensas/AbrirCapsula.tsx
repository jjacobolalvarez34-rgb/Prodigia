"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { CATALOGO_NUEVO, ciudadDe, COLOR_RAREZA, coloresCapsula, type Rareza } from "@/lib/recompensas/catalogo";
import { abrirCapsula, type Capsula } from "@/lib/recompensas/api";
import type { PremioGuardado } from "@/lib/recompensas/capsulasSinVer";
import { marcarAbriendoWeb, marcarVistaWeb } from "@/lib/recompensas/capsulasSinVerWeb";
import { refrescarCosmeticosWeb } from "@/lib/recompensas/cosmeticosWeb";
import { createClient } from "@/lib/supabase/client";
import VistaCosmetico from "./VistaCosmetico";
import RevelacionWeb, { type PremioRevelado } from "@/components/fx/RevelacionWeb";

export { DibujoCapsula } from "./DibujoCapsula";

// Abrir una cápsula en la web: la escena (caída, suspenso, estallido) es
// fx/RevelacionWeb, igual que la app (fx/Revelacion); acá solo se pide el premio a
// la base (abrir_capsula, 0249) y se arma cómo se ve.
//
// 2026-10-23: el premio se pide al tocarla y, justo antes, la cápsula se anota en el
// navegador (capsulasSinVer.ts); se borra al ver el premio. Si el jugador se va en
// medio, al volver a Recompensas se le muestra lo que le salió (`guardado`: la misma
// escena, sin pedir nada a la base).

function Premio({ p }: { p: PremioGuardado }) {
  const t = useTranslations("Recompensas");
  if (p.premio === "chispas" || p.convertido) {
    return (
      <div className="flex flex-col items-center gap-2">
        {p.convertido && <p className="text-center text-sm text-texto-secundario">{t("capsulas.yaTenias", { nombre: p.nombre ?? "" })}</p>}
        <p className="rounded-full border border-logro/50 bg-logro/10 px-5 py-2 font-mono text-3xl font-bold text-logro">+{p.cantidad} ✦</p>
      </div>
    );
  }
  if (p.premio === "hielo" || p.premio === "tiempo_extra" || p.premio === "escudo") {
    const icono = p.premio === "hielo" ? "🧊" : p.premio === "escudo" ? "🛡️" : "⏱️";
    return <p className="text-5xl">{icono}</p>;
  }
  const it = CATALOGO_NUEVO.find((x) => x.item === p.slug);
  const rareza = (p.rareza ?? "raro") as Rareza;
  // Un tema de la app (0297) llega con slug tema_<tema>.
  const esTema = p.premio === "tema_app" || !!p.slug?.startsWith("tema_");
  const categoria = it?.categoria ?? (esTema ? "tema" : p.slug?.startsWith("marco_") ? "marco" : "titulo");
  const valor = it?.valor ?? (esTema ? p.slug?.replace(/^tema_/, "") : p.slug?.replace(/^marco_/, "")) ?? "";
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="flex h-24 w-24 items-center justify-center rounded-3xl border-2 bg-surface-2" style={{ borderColor: COLOR_RAREZA[rareza], boxShadow: `0 0 24px ${COLOR_RAREZA[rareza]}88` }}>
        <VistaCosmetico categoria={categoria} valor={valor} tam={64} />
      </span>
      <span className="text-xs font-bold tracking-widest" style={{ color: COLOR_RAREZA[rareza] }}>
        {t(`tienda.rareza.${rareza}`).toUpperCase()}
      </span>
      <p className="font-display text-2xl font-bold text-foreground">{p.nombre}</p>
      <p className="text-sm text-texto-secundario">{esTema ? t("capsulas.temaTuyo") : t("capsulas.esTuyo")}</p>
    </div>
  );
}

const NIVEL_RAREZA: Record<Rareza, PremioRevelado["nivel"]> = { comun: 1, raro: 2, epico: 3, legendario: 4 };

// Color y emoción de cada premio (igual que la app): cosméticos según su rareza;
// Chispas según cuántas son.
function revelado(p: PremioGuardado): Omit<PremioRevelado, "contenido"> {
  if (p.premio === "chispas" || p.convertido) return { color: "#FFB627", nivel: p.cantidad >= 150 ? 3 : p.cantidad >= 60 ? 2 : 1 };
  if (p.premio === "hielo") return { color: "#7FD8FF", nivel: 1 };
  if (p.premio === "escudo") return { color: "#4FE0F5", nivel: 2 };
  if (p.premio === "tiempo_extra") return { color: "#FFB627", nivel: 1 };
  const rareza = (p.rareza ?? "raro") as Rareza;
  return { color: COLOR_RAREZA[rareza], nivel: NIVEL_RAREZA[rareza] ?? 2 };
}

export default function AbrirCapsula({
  capsula,
  guardado,
  onCerrar,
  onChispas,
}: {
  capsula: Capsula;
  // Premio que ya salió y no se llegó a ver (capsulasSinVer.ts): se muestra sin abrir nada.
  guardado?: PremioGuardado;
  // abierta = false si se cerró antes de tocarla (sigue en «Por abrir»).
  onCerrar: (abierta: boolean) => void;
  onChispas?: (total: number) => void;
}) {
  const t = useTranslations("Recompensas.capsulas");
  const ciudad = ciudadDe(capsula.mundo);
  const nombre = t(`nombres.${capsula.tipo}`);
  const chispas = useRef<number | null>(null);
  const pedida = useRef(false);
  return (
    <RevelacionWeb
      colores={coloresCapsula(capsula.tipo, capsula.mundo)}
      etiqueta={ciudad ? `${nombre} · ${ciudad.nombre}` : nombre}
      titulo={guardado ? t("sinVer") : t("abriendo")}
      textoTocar={guardado ? t("sinVer") : t("tocaParaAbrir")}
      textoBoton={t("genial")}
      textoError={t("error")}
      // Antes de tocarla no se pidió nada: se puede cerrar y queda en «Por abrir».
      // Una ya abierta sin ver no se cierra hasta verla (si no, volvería a aparecer).
      textoCerrar={guardado ? undefined : t("cerrar")}
      onVisto={() => marcarVistaWeb(capsula.id)}
      onCerrar={() => {
        // Lo que se recarga (saldo, cosméticos) espera al cierre: recargarlo en medio
        // de la animación la trababa (2026-10-15).
        if (chispas.current != null) onChispas?.(chispas.current);
        refrescarCosmeticosWeb();
        onCerrar(pedida.current || !!guardado);
      }}
      abrir={async () => {
        if (guardado) return { ...revelado(guardado), contenido: <Premio p={guardado} /> };
        pedida.current = true;
        marcarAbriendoWeb(capsula.id);
        const r = await abrirCapsula(createClient(), capsula.id);
        chispas.current = r.puntos_total;
        return { ...revelado(r), contenido: <Premio p={r} /> };
      }}
    />
  );
}
