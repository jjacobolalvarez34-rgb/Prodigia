"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import MamutHerdSello from "@/components/MamutHerdSello";
import { Estrellas, LetreroNeon } from "@/components/landing/neon";
import type { Carta } from "@/lib/practica/naipia";
import {
  MANOS_POR_PARTIDA,
  coincide,
  generarMano,
  jugarCrupier,
  jugarModelo,
  registrarDecision,
  resultado,
  valorMano,
  type Accion,
  type Decision,
  type ManoComun,
} from "@/lib/ganaleModelo/blackjack";
import { Ficha, ManoCartas, NEON_NAIPIA, Pano, conSigno, useFrasesModelo } from "./mesa";

// «Gánale al modelo», modo público (el del QR). Una partida son MANOS_POR_PARTIDA manos;
// el jugador y el modelo juegan cada mano con las mismas cartas (números aleatorios
// comunes) y al final se comparan las fichas. Nada se guarda en el servidor: solo la
// mejor marca de coincidencias con π*, en este navegador.

type Fase = "inicio" | "jugando" | "crupier" | "comparar" | "final";

interface ManoJugada {
  mano: ManoComun;
  jugador: Carta[];
  modelo: Carta[];
  crupier: Carta[];
  decisiones: Decision[];
  tu: number;
  modeloRes: number;
}

const CLAVE_MEJOR = "prodigia-ganale-mejor";

function leerMejor(): { n: number; total: number } | null {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE_MEJOR) ?? "null");
    return v && typeof v.n === "number" && typeof v.total === "number" ? v : null;
  } catch {
    return null;
  }
}

function guardarMejor(n: number, total: number): { n: number; total: number } | null {
  const previa = leerMejor();
  if (total === 0) return previa;
  const mejor = !previa || n / total > previa.n / previa.total || (n / total === previa.n / previa.total && total > previa.total);
  const nueva = mejor ? { n, total } : previa;
  try {
    localStorage.setItem(CLAVE_MEJOR, JSON.stringify(nueva));
  } catch {
    // Sin almacenamiento (modo privado): la marca solo vive en esta partida.
  }
  return nueva;
}

const ANCHO_CARTA = 66;
const PAUSA_CRUPIER_MS = 650;

export default function JuegoPublico() {
  const t = useTranslations("GanaleModelo");
  const frases = useFrasesModelo();
  const [fase, setFase] = useState<Fase>("inicio");
  const [manos, setManos] = useState<ManoComun[]>([]);
  const [indice, setIndice] = useState(0);
  const [jugador, setJugador] = useState<Carta[]>([]);
  const [decisiones, setDecisiones] = useState<Decision[]>([]);
  const [crupierVisto, setCrupierVisto] = useState(1);
  const [jugadas, setJugadas] = useState<ManoJugada[]>([]);
  const [mejor, setMejor] = useState<{ n: number; total: number } | null>(null);

  const mano = manos[indice];
  const crupierFinal = mano ? jugarCrupier(mano.crupier) : [];

  function empezarMano(m: ManoComun) {
    const inicial = m.jugador.slice(0, 2);
    setJugador(inicial);
    setDecisiones([]);
    setCrupierVisto(1);
    // Con 21 de entrada no hay nada que decidir.
    setFase(valorMano(inicial).total >= 21 ? "crupier" : "jugando");
  }

  function empezarPartida() {
    const nuevas = Array.from({ length: MANOS_POR_PARTIDA }, () => generarMano());
    setManos(nuevas);
    setIndice(0);
    setJugadas([]);
    empezarMano(nuevas[0]);
  }

  function decidir(accion: Accion) {
    if (!mano || fase !== "jugando") return;
    const d = registrarDecision(jugador, mano.crupier[0], accion);
    setDecisiones((v) => [...v, d]);
    if (accion === "plantarse") {
      setFase("crupier");
      return;
    }
    const nuevas = [...jugador, mano.jugador[jugador.length]];
    setJugador(nuevas);
    const v = valorMano(nuevas);
    if (v.pasado || v.total >= 21) setFase("crupier");
  }

  // El crupier voltea su oculta y pide, una carta a la vez; después se compara la mano.
  useEffect(() => {
    if (fase !== "crupier" || !mano) return;
    const final = jugarCrupier(mano.crupier);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let n = 2; n <= final.length; n++) timers.push(setTimeout(() => setCrupierVisto(n), PAUSA_CRUPIER_MS * (n - 1)));
    timers.push(
      setTimeout(() => {
        const modelo = jugarModelo(mano);
        setJugadas((v) => [
          ...v,
          { mano, jugador, modelo: modelo.cartas, crupier: final, decisiones, tu: resultado(jugador, final), modeloRes: resultado(modelo.cartas, final) },
        ]);
        setFase("comparar");
      }, PAUSA_CRUPIER_MS * final.length + 300),
    );
    return () => timers.forEach(clearTimeout);
  }, [fase, mano, jugador, decisiones]);

  function siguiente() {
    if (indice + 1 < manos.length) {
      setIndice(indice + 1);
      empezarMano(manos[indice + 1]);
      return;
    }
    const todas = jugadas.flatMap((j) => j.decisiones);
    setMejor(guardarMejor(todas.filter(coincide).length, todas.length));
    setFase("final");
  }

  const fichasTu = jugadas.reduce((a, j) => a + j.tu, 0);
  const fichasModelo = jugadas.reduce((a, j) => a + j.modeloRes, 0);
  const ultima = jugadas[jugadas.length - 1];

  return (
    <MotionConfig reducedMotion="never">
      <div className="noche-prodigia relative flex min-h-screen flex-col overflow-x-clip">
        <Estrellas cantidad={18} />
        <header className="relative z-10 border-b border-border bg-background/90">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground">
              <Logo size={26} colorAro="#7C5CFF" />
              Prodigia
            </Link>
            <span className="flex items-center gap-2 text-xs font-semibold text-[#F4B4B4]">
              <Ficha tam={16} />
              {t("marca")}
            </span>
          </div>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 pb-10 pt-6">
          <h1 className="text-center font-display text-4xl font-bold leading-tight sm:text-6xl">
            <LetreroNeon texto={t("titulo")} color={NEON_NAIPIA} falla={3} retrasoBase={200} />
          </h1>

          {fase === "inicio" && <Inicio onJugar={empezarPartida} />}

          {mano && (fase === "jugando" || fase === "crupier") && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm font-semibold text-texto-secundario">
                <span>{t("mano", { n: indice + 1, total: MANOS_POR_PARTIDA })}</span>
                <span className="font-mono">{t("marcador", { tu: conSigno(fichasTu), modelo: conSigno(fichasModelo) })}</span>
              </div>
              <Pano leyenda={t("pano")}>
                <div className="flex flex-col gap-16 py-2 sm:gap-20">
                  <FilaMano titulo={t("crupier")} total={fase === "crupier" ? frases.totalDe(crupierFinal.slice(0, crupierVisto)) : null}>
                    <ManoCartas
                      etiqueta={t("crupier")}
                      ancho={ANCHO_CARTA}
                      cartas={fase === "crupier" ? crupierFinal.slice(0, Math.max(2, crupierVisto)) : mano.crupier.slice(0, 2)}
                      oculta={fase === "jugando" || crupierVisto < 2}
                    />
                  </FilaMano>
                  <FilaMano titulo={t("tu")} total={frases.totalDe(jugador)}>
                    <ManoCartas etiqueta={t("tu")} ancho={ANCHO_CARTA} cartas={jugador} />
                  </FilaMano>
                </div>
              </Pano>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={fase !== "jugando"}
                  onClick={() => decidir("pedir")}
                  className="rounded-full bg-[#B91C1C] px-6 py-4 text-lg font-bold text-white shadow-[0_0_0_2px_#F25C5C55,0_0_22px_#F25C5C44] transition active:scale-[0.97] disabled:opacity-40"
                >
                  {t("pedir")}
                </button>
                <button
                  type="button"
                  disabled={fase !== "jugando"}
                  onClick={() => decidir("plantarse")}
                  className="rounded-full border-2 border-[#E9D9A6] px-6 py-4 text-lg font-bold text-[#F5EBCB] transition active:scale-[0.97] disabled:opacity-40"
                >
                  {t("plantarse")}
                </button>
              </div>
            </div>
          )}

          {fase === "comparar" && ultima && (
            <Comparacion jugada={ultima} ultimaMano={indice + 1 >= MANOS_POR_PARTIDA} onSiguiente={siguiente} indice={indice} />
          )}

          {fase === "final" && (
            <Final fichasTu={fichasTu} fichasModelo={fichasModelo} jugadas={jugadas} mejor={mejor} onOtra={empezarPartida} />
          )}

          <ComoDecide />
          <Promo />
        </main>

        <footer className="relative z-10 border-t border-border py-5">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 text-xs text-texto-secundario">
            <span>© 2026 Mamut Herd</span>
            <MamutHerdSello alto={22} />
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}

function FilaMano({ titulo, total, children }: { titulo: string; total: string | null; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#F5EBCB]">
        <span>{titulo}</span>
        {total && <span className="rounded-full bg-black/35 px-2.5 py-0.5 font-mono text-xs">{total}</span>}
      </div>
      {children}
    </div>
  );
}

function Inicio({ onJugar }: { onJugar: () => void }) {
  const t = useTranslations("GanaleModelo");
  const reglas = t.raw("reglas") as string[];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col gap-6">
      <p className="mx-auto max-w-md text-center text-lg text-texto-secundario">{t("subtitulo")}</p>
      <Pano leyenda={t("pano")}>
        <div className="flex flex-col items-center gap-14 py-4">
          <ManoCartas ancho={58} cartas={[{ valor: "A", palo: "picas" }, { valor: "9", palo: "treboles" }]} oculta />
          <ManoCartas ancho={58} cartas={[{ valor: "A", palo: "corazones" }, { valor: "K", palo: "diamantes" }]} />
        </div>
      </Pano>
      <ul className="mx-auto flex max-w-md flex-col gap-2 text-sm text-texto-secundario">
        {reglas.map((r) => (
          <li key={r} className="flex items-start gap-2">
            <Ficha tam={14} />
            <span>{r}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onJugar}
        className="mx-auto w-full max-w-xs rounded-full bg-[#B91C1C] px-8 py-4 text-xl font-bold text-white shadow-[0_0_0_2px_#F25C5C66,0_0_28px_#F25C5C55] transition active:scale-[0.97]"
      >
        {t("empezar")}
      </button>
    </motion.div>
  );
}

function Etiqueta({ r }: { r: number }) {
  const t = useTranslations("GanaleModelo.resultadoMano");
  const clave = r > 0 ? "gana" : r < 0 ? "pierde" : "empata";
  const color = r > 0 ? "text-[#7BE0A1]" : r < 0 ? "text-[#F28B8B]" : "text-[#E9D9A6]";
  return (
    <span className={`font-mono text-sm font-bold ${color}`}>
      {t(clave)} {conSigno(r)}
    </span>
  );
}

function Comparacion({ jugada, ultimaMano, onSiguiente, indice }: { jugada: ManoJugada; ultimaMano: boolean; onSiguiente: () => void; indice: number }) {
  const t = useTranslations("GanaleModelo");
  const frases = useFrasesModelo();
  const distintas = jugada.decisiones.filter((d) => !coincide(d));
  return (
    <motion.div key={indice} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm font-semibold text-texto-secundario">
        <span>{t("mano", { n: indice + 1, total: MANOS_POR_PARTIDA })}</span>
        <span>{t("mismasCartas")}</span>
      </div>
      <Pano>
        <div className="flex flex-col items-center gap-2 pb-3">
          <span className="text-sm font-semibold text-[#F5EBCB]">
            {t("crupier")} <span className="ml-1 rounded-full bg-black/35 px-2.5 py-0.5 font-mono text-xs">{frases.totalDe(jugada.crupier)}</span>
          </span>
          <ManoCartas ancho={48} cartas={jugada.crupier} />
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-dashed border-[#E9D9A6]/25 pt-3">
          {[
            { titulo: t("tu"), cartas: jugada.jugador, r: jugada.tu },
            { titulo: t("modelo"), cartas: jugada.modelo, r: jugada.modeloRes },
          ].map((lado) => (
            <div key={lado.titulo} className="flex flex-col items-center gap-2">
              <span className="text-sm font-semibold text-[#F5EBCB]">{lado.titulo}</span>
              <ManoCartas ancho={44} cartas={lado.cartas} />
              <span className="rounded-full bg-black/35 px-2.5 py-0.5 font-mono text-xs text-[#F5EBCB]">{frases.totalDe(lado.cartas)}</span>
              <Etiqueta r={lado.r} />
            </div>
          ))}
        </div>
      </Pano>
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 text-sm">
        {distintas.length === 0 ? (
          <p className="text-foreground">{t("coincidio")}</p>
        ) : (
          distintas.map((d, i) => (
            <p key={i} className="text-foreground">
              {frases.explicacion(d)}
            </p>
          ))
        )}
      </div>
      <button
        type="button"
        onClick={onSiguiente}
        className="mx-auto w-full max-w-xs rounded-full bg-[#B91C1C] px-8 py-3.5 text-lg font-bold text-white shadow-[0_0_0_2px_#F25C5C55,0_0_22px_#F25C5C44] transition active:scale-[0.97]"
      >
        {ultimaMano ? t("verFinal") : t("siguiente")}
      </button>
    </motion.div>
  );
}

function Final({
  fichasTu,
  fichasModelo,
  jugadas,
  mejor,
  onOtra,
}: {
  fichasTu: number;
  fichasModelo: number;
  jugadas: ManoJugada[];
  mejor: { n: number; total: number } | null;
  onOtra: () => void;
}) {
  const t = useTranslations("GanaleModelo.final");
  const todas = jugadas.flatMap((j) => j.decisiones);
  const iguales = todas.filter(coincide).length;
  const titulo = fichasTu > fichasModelo ? t("gano") : fichasTu === fichasModelo ? t("empate") : t("perdio");
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5 text-center">
      <p className="font-display text-3xl font-bold text-foreground">{titulo}</p>
      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        {[
          { etiqueta: t("fichasTu"), n: fichasTu, color: "#B91C1C" },
          { etiqueta: t("fichasModelo"), n: fichasModelo, color: "#1F2937" },
        ].map((x) => (
          <div key={x.etiqueta} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4">
            <Ficha color={x.color} tam={34} />
            <span className="font-mono text-3xl font-bold text-foreground">{conSigno(x.n)}</span>
            <span className="text-xs text-texto-secundario">{x.etiqueta}</span>
          </div>
        ))}
      </div>
      {todas.length > 0 && <p className="text-foreground">{t("coincidencias", { n: iguales, total: todas.length })}</p>}
      {mejor && <p className="text-sm text-texto-secundario">{t("mejor", { n: mejor.n, total: mejor.total })}</p>}
      <p className="max-w-md text-sm text-texto-secundario">{t("honesto")}</p>
      <button
        type="button"
        onClick={onOtra}
        className="w-full max-w-xs rounded-full bg-[#B91C1C] px-8 py-3.5 text-lg font-bold text-white shadow-[0_0_0_2px_#F25C5C55,0_0_22px_#F25C5C44] transition active:scale-[0.97]"
      >
        {t("otraVez")}
      </button>
    </motion.div>
  );
}

function ComoDecide() {
  const t = useTranslations("GanaleModelo");
  const lineas = t.raw("comoDecide.lineas") as string[];
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-surface">
      <button type="button" onClick={() => setAbierto(!abierto)} aria-expanded={abierto} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-semibold text-foreground">
        {t("comoDecide.titulo")}
        <span aria-hidden="true" className={`transition-transform ${abierto ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {abierto && (
          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-4">
            {lineas.map((l) => (
              <li key={l} className="pb-2 text-sm text-texto-secundario">
                {l}
              </li>
            ))}
            <li className="pb-4 pt-1 text-sm text-foreground">
              {t("naipia")}{" "}
              <Link href="/naipia" className="font-semibold text-[#F4B4B4] underline underline-offset-4">
                {t("naipiaLink")}
              </Link>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function Promo() {
  const t = useTranslations("GanaleModelo");
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#7C5CFF]/40 p-5 text-center">
      <Logo size={36} colorAro="#7C5CFF" />
      <p className="max-w-md text-sm text-foreground">{t("prodigia")}</p>
      <Link href="/" className="rounded-full border border-[#9B85FF] px-5 py-2 text-sm font-semibold text-[#D9CFFF] shadow-[0_0_16px_#7C5CFF44] hover:text-white">
        {t("prodigiaCta")}
      </Link>
    </div>
  );
}
