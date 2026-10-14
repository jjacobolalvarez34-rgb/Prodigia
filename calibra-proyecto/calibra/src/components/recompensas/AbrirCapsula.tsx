"use client";

import { useTranslations } from "next-intl";
import { CAPSULAS, CATALOGO_NUEVO, ciudadDe, COLOR_RAREZA, coloresCapsula, type Rareza } from "@/lib/recompensas/catalogo";
import { abrirCapsula, type Capsula, type PremioCapsula } from "@/lib/recompensas/api";
import { refrescarCosmeticosWeb } from "@/lib/recompensas/cosmeticosWeb";
import { createClient } from "@/lib/supabase/client";
import VistaCosmetico from "./VistaCosmetico";
import RevelacionWeb, { type PremioRevelado } from "@/components/fx/RevelacionWeb";

export { DibujoCapsula } from "./DibujoCapsula";

// Abrir una cápsula en la web: la escena (caída, suspenso, estallido) es
// fx/RevelacionWeb, igual que la app (fx/Revelacion); acá solo se pide el premio a
// la base (abrir_capsula, 0249) y se arma cómo se ve.

function Premio({ p }: { p: PremioCapsula }) {
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
  const categoria = it?.categoria ?? (p.slug?.startsWith("marco_") ? "marco" : "titulo");
  const valor = it?.valor ?? p.slug?.replace(/^marco_/, "") ?? "";
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="flex h-24 w-24 items-center justify-center rounded-3xl border-2 bg-surface-2" style={{ borderColor: COLOR_RAREZA[rareza], boxShadow: `0 0 24px ${COLOR_RAREZA[rareza]}88` }}>
        <VistaCosmetico categoria={categoria} valor={valor} tam={64} />
      </span>
      <span className="text-xs font-bold tracking-widest" style={{ color: COLOR_RAREZA[rareza] }}>
        {t(`tienda.rareza.${rareza}`).toUpperCase()}
      </span>
      <p className="font-display text-2xl font-bold text-foreground">{p.nombre}</p>
      <p className="text-sm text-texto-secundario">{t("capsulas.esTuyo")}</p>
    </div>
  );
}

const NIVEL_RAREZA: Record<Rareza, PremioRevelado["nivel"]> = { comun: 1, raro: 2, epico: 3, legendario: 4 };

// Color y emoción de cada premio (igual que la app): cosméticos según su rareza;
// Chispas según cuántas son.
function revelado(p: PremioCapsula): Omit<PremioRevelado, "contenido"> {
  if (p.premio === "chispas" || p.convertido) return { color: "#FFB627", nivel: p.cantidad >= 150 ? 3 : p.cantidad >= 60 ? 2 : 1 };
  if (p.premio === "hielo") return { color: "#7FD8FF", nivel: 1 };
  if (p.premio === "escudo") return { color: "#4FE0F5", nivel: 2 };
  if (p.premio === "tiempo_extra") return { color: "#FFB627", nivel: 1 };
  const rareza = (p.rareza ?? "raro") as Rareza;
  return { color: COLOR_RAREZA[rareza], nivel: NIVEL_RAREZA[rareza] ?? 2 };
}

export default function AbrirCapsula({ capsula, onCerrar, onChispas }: { capsula: Capsula; onCerrar: () => void; onChispas?: (total: number) => void }) {
  const t = useTranslations("Recompensas.capsulas");
  const ciudad = ciudadDe(capsula.mundo);
  const nombre = CAPSULAS[capsula.tipo]?.nombre ?? "";
  return (
    <RevelacionWeb
      colores={coloresCapsula(capsula.tipo, capsula.mundo)}
      etiqueta={ciudad ? `${nombre} · ${ciudad.nombre}` : nombre}
      titulo={t("abriendo")}
      textoTocar={t("tocaParaAbrir")}
      textoBoton={t("genial")}
      textoError={t("error")}
      onCerrar={onCerrar}
      abrir={async () => {
        const r = await abrirCapsula(createClient(), capsula.id);
        onChispas?.(r.puntos_total);
        refrescarCosmeticosWeb();
        return { ...revelado(r), contenido: <Premio p={r} /> };
      }}
    />
  );
}
