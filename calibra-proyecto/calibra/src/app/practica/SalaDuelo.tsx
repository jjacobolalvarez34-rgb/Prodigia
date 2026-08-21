"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ArithmeticProblemType } from "@/types/database";
import Boton from "@/components/Boton";
import PantallaVS from "@/components/duelos/PantallaVS";

const NOMBRES_OPERACION: Record<ArithmeticProblemType, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
};

// Cuánto se espera a que el rival aparezca en la sala antes de ofrecer
// el modo "fantasma" de siempre como respaldo (Fase T3: "podés dejar ese
// código como fallback si el usuario retador nunca conecta").
const TIMEOUT_ESPERA_MS = 45_000;
// Margen entre "ambos están en la sala" y el instante de arranque
// sincronizado — le da tiempo a la cuenta regresiva a mostrarse entera y
// absorbe la latencia de red del broadcast.
const MARGEN_ARRANQUE_MS = 3_500;

type Estado = "conectando" | "esperando" | "cuenta-regresiva" | "agotado";

interface Props {
  duelId: string;
  operacion: ArithmeticProblemType;
  miUserId: string;
  rivalId: string;
  rivalNombre: string;
  miElo: number;
  rivalElo: number;
  miTituloNombre?: string | null;
  rivalTituloNombre?: string | null;
  // Fase 3 de Clanes: un rival del Clan de Bots nunca va a conectarse a
  // esta sala de verdad (no existe ningún segundo cliente real del otro
  // lado) — se salta directo a la cuenta regresiva en vez de pasar por
  // la espera de Presence + el fallback de 45s a "agotado", que sería
  // literalmente lo mismo pero con una demora artificial e innecesaria.
  rivalEsBot?: boolean;
  // Fase 5: si esta ronda es parte de un "todas las ciudades", se
  // muestra "Ronda X/Y" en vez de solo el nombre de la operación.
  serieId?: string | null;
  rondaNumero?: number;
  rondaTotal?: number;
  onEmpezar: () => void;
}

// Sala de espera de un duelo en tiempo real (Fase T3). Usa Supabase
// Realtime — un canal por duelo (`duelo:<id>`), con Presence para saber
// si el rival ya está en esta misma pantalla, y Broadcast para el
// "arranca ya" sincronizado (3-2-1 → mismo instante de reloj para los
// dos, no un botón que cada uno aprieta cuando quiere). Nunca se
// construyó infraestructura de websockets propia — esto es 100% lo que
// Supabase ya provee.
//
// Quién dispara el broadcast de arranque es determinístico (el user_id
// menor en orden alfabético) para que nunca compitan dos "start" con
// horarios distintos — no hace falta coordinación adicional.
export default function SalaDuelo({
  duelId,
  operacion,
  miUserId,
  rivalId,
  rivalNombre,
  miElo,
  rivalElo,
  rivalEsBot = false,
  serieId,
  rondaNumero,
  rondaTotal,
  onEmpezar,
}: Props) {
  const [estado, setEstado] = useState<Estado>("conectando");
  const [rivalPresente, setRivalPresente] = useState(false);
  const [segundos, setSegundos] = useState<number | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const empezoRef = useRef(false);
  const soyHost = miUserId < rivalId;

  function empezarUnaVez() {
    if (empezoRef.current) return;
    empezoRef.current = true;
    onEmpezar();
  }

  function arrancarCuentaRegresiva(startAt: number) {
    setEstado("cuenta-regresiva");
    const tick = () => {
      const faltanMs = startAt - Date.now();
      if (faltanMs <= 0) {
        empezarUnaVez();
        return;
      }
      setSegundos(Math.ceil(faltanMs / 1000));
      requestAnimationFrame(tick);
    };
    tick();
  }

  // Fase 3 de Clanes: contra un bot no hay nadie del otro lado para
  // trackear presencia — arranca directo, sin abrir ningún canal.
  useEffect(() => {
    if (!rivalEsBot) return;
    const startAt = Date.now() + MARGEN_ARRANQUE_MS;
    queueMicrotask(() => arrancarCuentaRegresiva(startAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rivalEsBot]);

  useEffect(() => {
    if (rivalEsBot) return;
    const supabase = createClient();
    const channel = supabase.channel(`duelo:${duelId}`, {
      config: { presence: { key: miUserId } },
    });
    channelRef.current = channel;
    let cancelado = false;

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      if (cancelado) return;
      setRivalPresente(rivalId in state);
    });

    channel.on("broadcast", { event: "start" }, ({ payload }) => {
      if (cancelado || empezoRef.current) return;
      arrancarCuentaRegresiva((payload as { startAt: number }).startAt);
    });

    channel.subscribe(async (status) => {
      if (status !== "SUBSCRIBED" || cancelado) return;
      setEstado("esperando");
      await channel.track({ user_id: miUserId, en: Date.now() });
    });

    const timeoutAgotado = setTimeout(() => {
      if (!cancelado && !empezoRef.current) setEstado((actual) => (actual === "cuenta-regresiva" ? actual : "agotado"));
    }, TIMEOUT_ESPERA_MS);

    return () => {
      cancelado = true;
      clearTimeout(timeoutAgotado);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duelId, miUserId, rivalId]);

  // Apenas los dos están presentes, el host (determinístico por id)
  // dispara el broadcast de arranque — el otro lado lo recibe por el
  // handler de "broadcast" de arriba. El propio host no necesita
  // recibir su propio mensaje (Supabase Broadcast no reenvía al emisor
  // por default): arranca la cuenta regresiva localmente en el mismo
  // momento en que lo manda.
  useEffect(() => {
    if (estado !== "esperando" || !rivalPresente || !soyHost) return;
    const startAt = Date.now() + MARGEN_ARRANQUE_MS;
    channelRef.current?.send({ type: "broadcast", event: "start", payload: { startAt } });
    // El setState de arrancarCuentaRegresiva se difiere a un microtask
    // (en vez de llamarse directo en el cuerpo del efecto) para no
    // encadenar renders sincrónicos — no afecta la precisión del
    // arranque, MARGEN_ARRANQUE_MS ya tiene de sobra para absorber esto.
    queueMicrotask(() => arrancarCuentaRegresiva(startAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, rivalPresente, soyHost]);

  const subtitulo = serieId ? `Ronda ${rondaNumero}/${rondaTotal} · ${NOMBRES_OPERACION[operacion]}` : NOMBRES_OPERACION[operacion];
  const modo = serieId ? "mejor_de_3" : "simple";

  if (estado === "cuenta-regresiva") {
    return (
      <PantallaVS
        miNombre="Vos"
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
        <PantallaVS miNombre="Vos" miElo={miElo} rivalNombre={rivalNombre} rivalElo={rivalElo} rivalEsBot={rivalEsBot} modo={modo} subtitulo={subtitulo} segundos={null} />
        <div className="mx-auto -mt-10 flex w-full max-w-md flex-col items-center gap-4 px-4 pb-16 text-center">
          <p className="text-sm text-texto-secundario">
            {rivalNombre} todavía no se conectó a la sala — podés seguir esperando o arrancar tu parte
            ahora (se resuelve el duelo apenas juegue la suya, como antes).
          </p>
          <Boton onClick={onEmpezar} className="w-full py-4">
            Jugar mi parte ahora
          </Boton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <PantallaVS miNombre="Vos" miElo={miElo} rivalNombre={rivalNombre} rivalElo={rivalElo} rivalEsBot={rivalEsBot} modo={modo} subtitulo={subtitulo} segundos={null} />
      <div className="mx-auto -mt-10 flex w-full max-w-md flex-col items-center gap-3 px-4 pb-16 text-center">
        <div className="flex items-center gap-2 text-sm text-texto-secundario">
          <span className={`h-2 w-2 rounded-full ${estado === "esperando" ? "bg-correcto" : "bg-foreground/20"}`} />
          <span>Vos, listo</span>
          <span className="mx-1">·</span>
          <span className={`h-2 w-2 rounded-full ${rivalPresente ? "bg-correcto" : "bg-foreground/20 animate-pulse"}`} />
          <span>{rivalPresente ? `${rivalNombre}, listo` : `Esperando a ${rivalNombre}…`}</span>
        </div>
        <p className="text-xs text-texto-secundario">Arranca solo apenas estén los dos — no hace falta que apretés nada.</p>
      </div>
    </div>
  );
}
