"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Carta } from "@/lib/practica/naipia";
import {
  MANOS_POR_PARTIDA,
  jugarCrupier,
  jugarModelo,
  registrarDecision,
  resultado,
  valorMano,
  type Accion,
  type Decision,
  type ManoComun,
} from "@/lib/ganaleModelo/blackjack";
import { limpiarNombre, type MarcadorJugador } from "@/lib/ganaleModelo/sala";
import { Comparacion, FilaMano, Final, Marco, type ManoJugada } from "./JuegoPublico";
import { ManoCartas, Pano, RETRASOS_CRUPIER, RETRASOS_JUGADOR, conSigno, useFrasesModelo } from "./mesa";
import type { CanalSala } from "./useCanalSala";

// El celular dentro de la sala en vivo: el proyector reparte, aquí se juega la misma mano
// que todos y se avisa cada jugada. El proyector destapa al crupier para todos a la vez.

type Fase = "nombre" | "esperando" | "jugando" | "listo" | "crupier" | "comparar" | "final";
interface ManoRecibida {
  id: string;
  n: number;
  mano: ManoComun;
}

const ANCHO_CARTA = 66;
const PAUSA_CRUPIER_MS = 650;

export default function JuegoSala({ sala }: { sala: CanalSala }) {
  const t = useTranslations("GanaleModelo");
  const ts = useTranslations("GanaleModelo.sala");
  const frases = useFrasesModelo();
  const [fase, setFase] = useState<Fase>("nombre");
  const [nombre, setNombre] = useState("");
  const [actual, setActual] = useState<ManoRecibida | null>(null);
  const [jugador, setJugador] = useState<Carta[]>([]);
  const [decisiones, setDecisiones] = useState<Decision[]>([]);
  const [crupierVisto, setCrupierVisto] = useState(1);
  const [jugadas, setJugadas] = useState<ManoJugada[]>([]);
  const [rankingSala, setRankingSala] = useState<MarcadorJugador[] | null>(null);

  const unido = fase !== "nombre";

  function avisar(m: ManoRecibida, nCartas: number, planto: boolean) {
    sala.enviar("aviso", { id: sala.id, nombre: limpiarNombre(nombre), manoId: m.id, nCartas, planto });
  }

  function recibirMano(m: ManoRecibida) {
    if (actual?.id === m.id) return;
    if (m.n === 1) {
      setJugadas([]);
      setRankingSala(null);
    }
    const inicial = m.mano.jugador.slice(0, 2);
    setActual(m);
    setJugador(inicial);
    setDecisiones([]);
    setCrupierVisto(1);
    const con21 = valorMano(inicial).total >= 21;
    setFase(con21 ? "listo" : "jugando");
    if (con21) avisar(m, 2, false);
  }

  function destapar(id: string) {
    if (!actual || actual.id !== id || (fase !== "jugando" && fase !== "listo")) return;
    if (fase === "jugando") {
      // Se acabó el tiempo: te plantas con lo que tienes.
      setDecisiones((v) => [...v, registrarDecision(jugador, actual.mano.crupier[0], "plantarse")]);
    }
    setFase("crupier");
  }

  // Lo que llega del proyector. Se vuelve a registrar en cada render para leer el estado
  // al día (los mensajes llegan en otra tarea, nunca entre la baja y el alta).
  useEffect(() => {
    return sala.escuchar((evento, p) => {
      if (!unido) return;
      if (evento === "mano" || (evento === "estado" && p.mano)) {
        const m = (evento === "mano" ? p : p.mano) as unknown as ManoRecibida;
        if (m && typeof m.id === "string" && m.mano?.jugador?.length) {
          if (evento === "estado" && p.revelado) return;
          recibirMano(m);
        }
      } else if (evento === "crupier" && typeof p.id === "string") destapar(p.id);
      else if (evento === "fin" && Array.isArray(p.ranking)) {
        setRankingSala(p.ranking as MarcadorJugador[]);
        setFase("final");
      }
    });
  });

  function entrar() {
    sala.presentarse(limpiarNombre(nombre));
    setFase("esperando");
    // Por si la mesa ya repartió: pide el estado.
    sala.enviar("hola", { id: sala.id });
  }

  function decidir(accion: Accion) {
    if (!actual || fase !== "jugando") return;
    setDecisiones((v) => [...v, registrarDecision(jugador, actual.mano.crupier[0], accion)]);
    if (accion === "plantarse") {
      avisar(actual, jugador.length, true);
      setFase("listo");
      return;
    }
    const nuevas = [...jugador, actual.mano.jugador[jugador.length]];
    setJugador(nuevas);
    avisar(actual, nuevas.length, false);
    const v = valorMano(nuevas);
    if (v.pasado || v.total >= 21) setFase("listo");
  }

  // El crupier destapa y pide, una carta a la vez, igual que en el proyector.
  useEffect(() => {
    if (fase !== "crupier" || !actual) return;
    const final = jugarCrupier(actual.mano.crupier);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let n = 2; n <= final.length; n++) timers.push(setTimeout(() => setCrupierVisto(n), PAUSA_CRUPIER_MS * (n - 1)));
    timers.push(
      setTimeout(() => {
        const modelo = jugarModelo(actual.mano);
        setJugadas((v) => [
          ...v.filter((j) => j.mano !== actual.mano),
          { mano: actual.mano, jugador, modelo: modelo.cartas, crupier: final, decisiones, tu: resultado(jugador, final), modeloRes: resultado(modelo.cartas, final) },
        ]);
        setFase("comparar");
      }, PAUSA_CRUPIER_MS * final.length + 300),
    );
    return () => timers.forEach(clearTimeout);
  }, [fase, actual, jugador, decisiones]);

  const fichasTu = jugadas.reduce((a, j) => a + j.tu, 0);
  const fichasModelo = jugadas.reduce((a, j) => a + j.modeloRes, 0);
  const ultima = jugadas[jugadas.length - 1];
  const crupierFinal = actual ? jugarCrupier(actual.mano.crupier) : [];
  const puesto = rankingSala ? rankingSala.findIndex((r) => r.id === sala.id) + 1 : 0;

  return (
    <Marco>
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#F4B4B4]">
        <span className="h-2 w-2 rounded-full bg-[#FF5D5D] shadow-[0_0_6px_#FF5D5D]" aria-hidden="true" />
        {ts("enVivo")} · {ts("enSala", { n: sala.jugadores.length })}
      </div>

      {!sala.mesaPresente && unido && <p className="rounded-2xl border border-border bg-surface p-3 text-center text-sm text-texto-secundario">{ts("mesaDesconectada")}</p>}

      {fase === "nombre" && (
        <form
          className="mx-auto flex w-full max-w-sm flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            entrar();
          }}
        >
          <label htmlFor="nombre-sala" className="text-center text-sm text-texto-secundario">
            {ts("nombreEtiqueta")}
          </label>
          <input
            id="nombre-sala"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={18}
            autoComplete="nickname"
            placeholder={ts("nombrePlaceholder")}
            className="rounded-2xl border border-border bg-surface px-4 py-3 text-center text-lg text-foreground outline-none focus:border-[#F25C5C]"
          />
          <button type="submit" className="rounded-full bg-[#B91C1C] px-8 py-4 text-lg font-bold text-white shadow-[0_0_0_2px_#F25C5C55,0_0_22px_#F25C5C44] active:scale-[0.97]">
            {ts("entrar")}
          </button>
        </form>
      )}

      {fase === "esperando" && <p className="text-center text-lg text-texto-secundario">{ts("esperandoMano")}</p>}

      {actual && (fase === "jugando" || fase === "listo" || fase === "crupier") && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm font-semibold text-texto-secundario">
            <span>{t("mano", { n: actual.n, total: MANOS_POR_PARTIDA })}</span>
            <span className="font-mono">{t("marcador", { tu: conSigno(fichasTu), modelo: conSigno(fichasModelo) })}</span>
          </div>
          <Pano leyenda={t("pano")}>
            <div className="flex flex-col gap-16 py-2 sm:gap-20">
              <FilaMano titulo={t("crupier")} total={fase === "crupier" ? frases.totalDe(crupierFinal.slice(0, crupierVisto)) : null}>
                <ManoCartas
                  key={`c-${actual.id}`}
                  etiqueta={t("crupier")}
                  ancho={ANCHO_CARTA}
                  retrasos={RETRASOS_CRUPIER}
                  cartas={fase === "crupier" ? crupierFinal.slice(0, Math.max(2, crupierVisto)) : actual.mano.crupier.slice(0, 2)}
                  oculta={fase !== "crupier" || crupierVisto < 2}
                />
              </FilaMano>
              <FilaMano titulo={t("tu")} total={frases.totalDe(jugador)}>
                <ManoCartas key={`j-${actual.id}`} etiqueta={t("tu")} ancho={ANCHO_CARTA} cartas={jugador} retrasos={RETRASOS_JUGADOR} />
              </FilaMano>
            </div>
          </Pano>
          {fase === "jugando" ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => decidir("pedir")}
                className="rounded-full bg-[#B91C1C] px-6 py-4 text-lg font-bold text-white shadow-[0_0_0_2px_#F25C5C55,0_0_22px_#F25C5C44] transition active:scale-[0.97]"
              >
                {t("pedir")}
              </button>
              <button type="button" onClick={() => decidir("plantarse")} className="rounded-full border-2 border-[#E9D9A6] px-6 py-4 text-lg font-bold text-[#F5EBCB] transition active:scale-[0.97]">
                {t("plantarse")}
              </button>
            </div>
          ) : (
            fase === "listo" && <p className="text-center text-base text-texto-secundario">{ts("esperandoCrupier")}</p>
          )}
        </div>
      )}

      {fase === "comparar" && ultima && actual && <Comparacion jugada={ultima} ultimaMano={actual.n >= MANOS_POR_PARTIDA} indice={actual.n - 1} esperando={ts("esperandoSiguiente")} />}

      {fase === "final" && (
        <Final fichasTu={fichasTu} fichasModelo={fichasModelo} jugadas={jugadas} mejor={null}>
          {puesto > 0 && rankingSala && <p className="font-display text-xl font-bold text-foreground">{ts("tuPuesto", { n: puesto, total: rankingSala.length })}</p>}
          {rankingSala && rankingSala.length > 0 && (
            <ol className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface text-left">
              {rankingSala.slice(0, 5).map((r, i) => (
                <li key={r.id} className={`flex items-center justify-between gap-3 border-b border-border px-4 py-2 last:border-0 ${r.id === sala.id ? "bg-[#F25C5C]/15" : ""}`}>
                  <span className="truncate text-sm text-foreground">
                    <span className="mr-2 font-mono text-texto-secundario">{i + 1}</span>
                    {r.nombre}
                  </span>
                  <span className="font-mono text-sm font-bold text-foreground">{conSigno(r.fichas)}</span>
                </li>
              ))}
            </ol>
          )}
        </Final>
      )}

      {fase === "final" && <p className="text-center text-sm text-texto-secundario">{ts("esperandoSiguiente")}</p>}
    </Marco>
  );
}
