import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import Boton from "@/components/Boton";
import PantallaVS from "@/components/duelos/PantallaVS";
import BotonRendirse from "@/components/duelos/BotonRendirse";
import { PREGUNTAR_SEGUIR_MS, type EstadoArranque } from "@/lib/duelos/useArranqueSincronizado";

interface Props {
  estado: EstadoArranque;
  segundos: number | null;
  rivalPresente: boolean;
  miElo: number;
  rivalNombre: string;
  rivalElo: number;
  rivalEsBot?: boolean;
  modo?: "simple" | "mejor_de_3";
  subtitulo?: string;
  // Ya no se usa (el duelo es en vivo: si el rival no llega, se cancela); se
  // deja para no tocar a los que todavía lo pasan.
  onEmpezarAhora?: () => void;
  // Fase 3 ("Rankeds: Rendirse en vez de cancelar por click afuera"):
  // opcional para no romper algún punto de uso viejo que no lo pase
  // todavía, pero todo caller nuevo debería mandarlo — sin duelId no
  // hay botón de Rendirse, que es exactamente el bug que esto resuelve.
  duelId?: string;
  volverA?: string;
}

// Extraído de SalaDuelo.tsx (Numeria) — misma pantalla de espera para
// los 4 mundos (Fase 2 de "Duelos: llevar el progreso en vivo..."), la
// lógica de sincronización vive en useArranqueSincronizado.
export default function SalaEsperaDuelo({
  estado,
  segundos,
  rivalPresente,
  miElo,
  rivalNombre,
  rivalElo,
  rivalEsBot = false,
  modo = "simple",
  subtitulo,
  duelId,
  volverA = "/rankeds",
}: Props) {
  const t = useTranslations("Duelos.salaEspera");
  const router = useRouter();

  function handleRendido() {
    router.push(volverA);
  }

  // A los 30 s sin rival: «¿Quieres seguir esperando?». A los 2 min el hook
  // cancela el reto solo (estado "agotado").
  const [preguntar, setPreguntar] = useState(false);
  useEffect(() => {
    if (estado !== "esperando" || rivalEsBot) return;
    const t = setTimeout(() => setPreguntar(true), PREGUNTAR_SEGUIR_MS);
    return () => clearTimeout(t);
  }, [estado, rivalEsBot]);

  async function cancelarReto() {
    if (duelId) await createClient().rpc("rechazar_duelo", { p_duel_id: duelId });
    router.push(volverA);
  }

  const botonRendirse = duelId && !rivalEsBot && (
    <div className="mx-auto -mt-2 mb-2 flex w-full max-w-md justify-end px-4">
      <BotonRendirse duelId={duelId} onRendido={handleRendido} />
    </div>
  );

  if (estado === "cuenta-regresiva") {
    return (
      <PantallaVS
        miNombre={t("tu")}
        miElo={miElo}
        rivalNombre={rivalNombre}
        rivalElo={rivalElo}
        rivalEsBot={rivalEsBot}
        modo={modo}
        subtitulo={subtitulo}
        segundos={segundos}
      />
    );
  }

  if (estado === "agotado") {
    return (
      <div className="flex flex-1 flex-col">
        <PantallaVS miNombre={t("tu")} miElo={miElo} rivalNombre={rivalNombre} rivalElo={rivalElo} rivalEsBot={rivalEsBot} modo={modo} subtitulo={subtitulo} segundos={null} />
        <div className="mx-auto -mt-10 flex w-full max-w-md flex-col items-center gap-4 px-4 pb-16 text-center">
          <p className="text-sm text-texto-secundario">{t("retoCancelado", { rival: rivalNombre })}</p>
          <Boton onClick={() => router.push(volverA)} className="w-full py-4">
            {t("volver")}
          </Boton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {botonRendirse}
      <PantallaVS miNombre={t("tu")} miElo={miElo} rivalNombre={rivalNombre} rivalElo={rivalElo} rivalEsBot={rivalEsBot} modo={modo} subtitulo={subtitulo} segundos={null} />
      <div className="mx-auto -mt-10 flex w-full max-w-md flex-col items-center gap-3 px-4 pb-16 text-center">
        <div className="flex items-center gap-2 text-sm text-texto-secundario">
          <span className={`h-2 w-2 rounded-full ${estado === "esperando" ? "bg-correcto" : "bg-foreground/20"}`} />
          <span>{t("tuListo")}</span>
          <span className="mx-1">·</span>
          <span className={`h-2 w-2 rounded-full ${rivalPresente ? "bg-correcto" : "bg-foreground/20 animate-pulse"}`} />
          <span>{rivalPresente ? t("rivalListo", { rival: rivalNombre }) : t("esperandoA", { rival: rivalNombre })}</span>
        </div>
        <p className="text-xs text-texto-secundario">{t("arrancaSolo")}</p>
        {preguntar && estado === "esperando" && !rivalPresente && (
          <div className="mt-2 flex w-full flex-col gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{t("seguirEsperandoPregunta", { rival: rivalNombre })}</p>
            <div className="flex gap-2">
              <Boton variante="secundario" onClick={cancelarReto} className="flex-1 py-2">
                {t("cancelarReto")}
              </Boton>
              <Boton onClick={() => setPreguntar(false)} className="flex-1 py-2">
                {t("seguirEsperando")}
              </Boton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
