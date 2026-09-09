"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { RANGOS_ELO, FUENTE_NOMBRE_CLASS, MARCOS_MUNDO, type FuenteNombre } from "@/types/database";
import { IconCandado, IconEscudo } from "@/components/icons";
import Boton from "@/components/Boton";
import GlareHover from "@/components/reactbits/GlareHover";
import BorderGlow from "@/components/reactbits/BorderGlow";
import ScrollFloat from "@/components/reactbits/ScrollFloat";
import { obtenerDescuentoDelDia, precioConDescuento } from "@/lib/descuentoDiario";
import { COSTOS, type ItemComprable } from "@/lib/tienda/costos";

// Fase 7: reusa la paleta de rangos de Rankeds (RANGOS_ELO) en vez de
// inventar colores nuevos — 6 marcos, uno por rango real.
const MARCOS_COMPRABLES = RANGOS_ELO.map((r) => ({
  marco: r.slug,
  item: `marco_${r.slug}` as ItemComprable,
  nombre: r.nombre,
  colorHex: r.colorHex,
}));

// Grupo B, Fase 1: 6 marcos temáticos, uno por mundo — a diferencia de
// MARCOS_COMPRABLES (arriba), exigen además haber alcanzado
// nivel_mundo >= 40 en ese mundo (validado server-side en
// comprar_item_tienda), no solo Chispas.
const NIVEL_MUNDO_REQUERIDO_MARCO = 40;
const MARCOS_MUNDO_COMPRABLES = Object.entries(MARCOS_MUNDO).map(([mundo, { nombre, imagen }]) => ({
  mundo,
  item: `marco_${mundo}` as ItemComprable,
  nombre,
  imagen,
}));

type Contexto = "utilidad" | "fuente" | "marco" | "marco-mundo" | "apuesta";

interface Props {
  puntosIniciales: number;
  escudosIniciales: number;
  congelamientosIniciales: number;
  boostIniciales: number;
  fuenteActual: string;
  fuentesDesbloqueadas: string[];
  marcoActual: string;
  marcosDesbloqueados: string[];
  nivelesMundo: Record<string, number>;
  fechaHoy: string;
}

export default function TiendaClient({
  puntosIniciales,
  escudosIniciales,
  congelamientosIniciales,
  boostIniciales,
  fuenteActual,
  fuentesDesbloqueadas,
  marcoActual,
  marcosDesbloqueados,
  nivelesMundo,
  fechaHoy,
}: Props) {
  const t = useTranslations("Tienda");
  const NOMBRES_ITEM: Record<ItemComprable, string> = {
    escudo: t("items.escudo"),
    congelamiento: t("items.congelamiento"),
    boost: t("items.boost"),
    fuente_mono: t("items.fuenteMono"),
    fuente_serif: t("items.fuenteSerif"),
    fuente_manuscrita: t("items.fuenteManuscrita"),
    fuente_impacto: t("items.fuenteImpacto"),
    fuente_script: t("items.fuenteScript"),
    fuente_futurista: t("items.fuenteFuturista"),
    marco_bronce: t("items.marcoBronce"),
    marco_plata: t("items.marcoPlata"),
    marco_oro: t("items.marcoOro"),
    marco_platino: t("items.marcoPlatino"),
    marco_diamante: t("items.marcoDiamante"),
    marco_prodigio: t("items.marcoProdigio"),
    marco_numeria: t("items.marcoNumeria"),
    marco_enigmia: t("items.marcoEnigmia"),
    marco_geografia: t("items.marcoGeografia"),
    marco_quimia: t("items.marcoQuimia"),
    marco_anatomia: t("items.marcoAnatomia"),
    marco_melodia: t("items.marcoMelodia"),
    marco_trigonometria: t("items.marcoTrigonometria"),
    marco_historia: t("items.marcoHistoria"),
    paquete_marcos_mundo: t("items.paqueteMarcosMundo"),
  };
  const FUENTES_COMPRABLES: { fuente: FuenteNombre; item: ItemComprable; nombre: string }[] = [
    { fuente: "mono", item: "fuente_mono", nombre: t("fuentes.mono") },
    { fuente: "serif", item: "fuente_serif", nombre: t("fuentes.serif") },
    { fuente: "manuscrita", item: "fuente_manuscrita", nombre: t("fuentes.manuscrita") },
    { fuente: "impacto", item: "fuente_impacto", nombre: t("fuentes.impacto") },
    { fuente: "script", item: "fuente_script", nombre: t("fuentes.script") },
    { fuente: "futurista", item: "fuente_futurista", nombre: t("fuentes.futurista") },
  ];
  const [puntos, setPuntos] = useState(puntosIniciales);
  const [escudos, setEscudos] = useState(escudosIniciales);
  const [congelamientos, setCongelamientos] = useState(congelamientosIniciales);
  const [boost, setBoost] = useState(boostIniciales);
  const [fuentesDesbl, setFuentesDesbl] = useState(fuentesDesbloqueadas);
  const [fuenteElegida, setFuenteElegida] = useState(fuenteActual);
  const [marcosDesbl, setMarcosDesbl] = useState(marcosDesbloqueados);
  const [marcoElegido, setMarcoElegido] = useState(marcoActual);
  const [confirmando, setConfirmando] = useState<ItemComprable | null>(null);
  const [comprando, setComprando] = useState(false);
  const [cambiandoCosmetico, setCambiandoCosmetico] = useState(false);
  const [error, setError] = useState<{ msg: string; contexto: Contexto } | null>(null);

  const oferta = obtenerDescuentoDelDia(fechaHoy);

  function costoDe(item: ItemComprable): number {
    return precioConDescuento(COSTOS[item], item, fechaHoy);
  }

  async function comprar(item: ItemComprable, contexto: Contexto) {
    setComprando(true);
    setError(null);
    try {
      const res = await fetch("/api/tienda/comprar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError({ msg: data.error ?? t("noSePudoComprar"), contexto });
        return;
      }
      setPuntos(data.puntos_total);
      setEscudos(data.escudos_extra_pendientes);
      setCongelamientos(data.congelamientos_disponibles);
      setBoost(data.boost_multiplicador_pendiente > 1 ? 1 : 0);
      if (Array.isArray(data.fuentes_desbloqueadas)) setFuentesDesbl(data.fuentes_desbloqueadas);
      if (Array.isArray(data.marcos_desbloqueados)) setMarcosDesbl(data.marcos_desbloqueados);
      setConfirmando(null);
    } catch {
      setError({ msg: t("noSePudoComprarConexion"), contexto });
    } finally {
      setComprando(false);
    }
  }

  async function elegirFuente(fuente: string) {
    setCambiandoCosmetico(true);
    setError(null);
    try {
      const res = await fetch("/api/tienda/elegir-fuente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fuente }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError({ msg: data.error ?? t("noSePudoCambiarFuente"), contexto: "fuente" });
      else setFuenteElegida(fuente);
    } catch {
      setError({ msg: t("noSePudoCambiarFuenteConexion"), contexto: "fuente" });
    } finally {
      setCambiandoCosmetico(false);
    }
  }

  async function elegirMarco(marco: string) {
    setCambiandoCosmetico(true);
    setError(null);
    try {
      const res = await fetch("/api/tienda/elegir-marco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marco }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError({ msg: data.error ?? t("noSePudoCambiarMarco"), contexto: "marco" });
      else setMarcoElegido(marco);
    } catch {
      setError({ msg: t("noSePudoCambiarMarcoConexion"), contexto: "marco" });
    } finally {
      setCambiandoCosmetico(false);
    }
  }

  return (
    <div
      className="flex-1"
      style={{ background: "radial-gradient(120% 100% at 50% 0%, #E8C79A 0%, #C97B4A 45%, #8a5a35 100%)" }}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#3D2410] drop-shadow-sm">
            🏺 {t("elBazarDeProdigia")}
          </h1>
          <p className="mt-1 font-mono text-sm font-semibold text-[#5C3A22]">{t("chispasDisponibles", { n: puntos })}</p>
        </div>

        <OfertaDelDia oferta={oferta} nombre={NOMBRES_ITEM[oferta.item as ItemComprable]} />

        <EstanteCategoria titulo={t("puestoDeUtilidad")} franja="#6C4CF1">
          <ItemEstante
            icono={<IconEscudo className="h-6 w-6 text-[#6C4CF1]" />}
            nombre={t("items.escudo")}
            descripcion={t("descripciones.escudo")}
            costo={costoDe("escudo")}
            costoOriginal={COSTOS.escudo}
            cantidad={escudos}
            puntos={puntos}
            confirmando={confirmando === "escudo"}
            comprando={comprando}
            onConfirmar={() => setConfirmando("escudo")}
            onCancelar={() => setConfirmando(null)}
            onComprar={() => comprar("escudo", "utilidad")}
          />
          <ItemEstante
            icono={<span className="text-2xl">❄️</span>}
            nombre={t("items.congelamiento")}
            descripcion={t("descripciones.congelamiento")}
            costo={costoDe("congelamiento")}
            costoOriginal={COSTOS.congelamiento}
            cantidad={congelamientos}
            puntos={puntos}
            confirmando={confirmando === "congelamiento"}
            comprando={comprando}
            onConfirmar={() => setConfirmando("congelamiento")}
            onCancelar={() => setConfirmando(null)}
            onComprar={() => comprar("congelamiento", "utilidad")}
          />
          <ItemEstante
            icono={<span className="text-2xl">⚡</span>}
            nombre={t("items.boost")}
            descripcion={t("descripciones.boost")}
            costo={costoDe("boost")}
            costoOriginal={COSTOS.boost}
            cantidad={boost}
            puntos={puntos}
            confirmando={confirmando === "boost"}
            comprando={comprando}
            onConfirmar={() => setConfirmando("boost")}
            onCancelar={() => setConfirmando(null)}
            onComprar={() => comprar("boost", "utilidad")}
          />
          {error?.contexto === "utilidad" && <p className="text-sm font-medium text-[#5C1A1A]">{error.msg}</p>}
        </EstanteCategoria>

        <EstanteCategoria titulo={t("vidrieraDeTipografias")} franja="#A78355">
          <p className="text-sm text-[#F4E4C1]/90">{t("vidrieraDescripcion")}</p>
          <div className="flex flex-wrap gap-2">
            {(["default", ...FUENTES_COMPRABLES.map((f) => f.fuente)] as FuenteNombre[]).map((fuente) => {
              const desbloqueada = fuentesDesbl.includes(fuente);
              const compra = FUENTES_COMPRABLES.find((f) => f.fuente === fuente);
              const elegida = fuenteElegida === fuente;
              const claseFuente = FUENTE_NOMBRE_CLASS[fuente];
              if (desbloqueada) {
                return (
                  <button
                    key={fuente}
                    onClick={() => elegirFuente(fuente)}
                    disabled={cambiandoCosmetico || elegida}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${claseFuente} ${
                      elegida
                        ? "border-[#3D2410] bg-[#F4E4C1] text-[#3D2410]"
                        : "border-[#F4E4C1]/60 bg-[#3D2410]/30 text-[#F4E4C1] hover:border-[#F4E4C1]"
                    }`}
                  >
                    {fuente === "default" ? t("normal") : compra?.nombre}
                    {elegida && ` · ${t("activa")}`}
                  </button>
                );
              }
              if (!compra) return null;
              const costo = costoDe(compra.item);
              return (
                <button
                  key={fuente}
                  onClick={() => comprar(compra.item, "fuente")}
                  disabled={comprando || puntos < costo}
                  className={`rounded-full border border-dashed border-[#F4E4C1]/50 px-3 py-1.5 text-sm text-[#F4E4C1]/70 disabled:opacity-40 ${claseFuente}`}
                >
                  {t("nombreChispas", { nombre: compra.nombre, costo })}
                </button>
              );
            })}
          </div>
          {error?.contexto === "fuente" && <p className="text-sm font-medium text-[#5C1A1A]">{error.msg}</p>}
        </EstanteCategoria>

        <EstanteCategoria titulo={t("herreroDeMarcos")} franja="#E8B34D">
          <p className="text-sm text-[#F4E4C1]/90">{t("herreroDescripcion")}</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => elegirMarco("ninguno")}
              disabled={cambiandoCosmetico || marcoElegido === "ninguno"}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                marcoElegido === "ninguno"
                  ? "border-[#3D2410] bg-[#F4E4C1] text-[#3D2410]"
                  : "border-[#F4E4C1]/60 bg-[#3D2410]/30 text-[#F4E4C1] hover:border-[#F4E4C1]"
              }`}
            >
              {t("sinMarco")}{marcoElegido === "ninguno" && ` · ${t("activo")}`}
            </button>
            {MARCOS_COMPRABLES.map(({ marco, item, nombre, colorHex }) => {
              const desbloqueado = marcosDesbl.includes(marco);
              const elegido = marcoElegido === marco;
              if (desbloqueado) {
                return (
                  <button
                    key={marco}
                    onClick={() => elegirMarco(marco)}
                    disabled={cambiandoCosmetico || elegido}
                    className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                      elegido ? "bg-[#F4E4C1] text-[#3D2410]" : "bg-[#3D2410]/30 text-[#F4E4C1]"
                    }`}
                    style={{ borderColor: colorHex }}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorHex }} />
                    {nombre}
                    {elegido && ` · ${t("activo")}`}
                  </button>
                );
              }
              const costo = costoDe(item);
              return (
                <button
                  key={marco}
                  onClick={() => comprar(item, "marco")}
                  disabled={comprando || puntos < costo}
                  className="flex items-center gap-1.5 rounded-full border border-dashed border-[#F4E4C1]/50 px-3 py-1.5 text-sm text-[#F4E4C1]/70 disabled:opacity-40"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorHex }} />
                  {t("nombreChispas", { nombre, costo })}
                </button>
              );
            })}
          </div>
          {error?.contexto === "marco" && <p className="text-sm font-medium text-[#5C1A1A]">{error.msg}</p>}
        </EstanteCategoria>

        <EstanteCategoria titulo={t("vidrieraDeMarcosTematicos")} franja="#6C4CF1">
          <p className="text-sm text-[#F4E4C1]/90">{t("vidrieraMarcosTematicosDescripcion", { n: NIVEL_MUNDO_REQUERIDO_MARCO })}</p>
          <div className="flex flex-wrap gap-3">
            {MARCOS_MUNDO_COMPRABLES.map(({ mundo, item, nombre, imagen }) => {
              const desbloqueado = marcosDesbl.includes(mundo);
              const elegido = marcoElegido === mundo;
              const nivelActual = nivelesMundo[mundo] ?? 0;
              const alcanzaNivel = nivelActual >= NIVEL_MUNDO_REQUERIDO_MARCO;

              if (desbloqueado) {
                return (
                  <button
                    key={mundo}
                    onClick={() => elegirMarco(mundo)}
                    disabled={cambiandoCosmetico || elegido}
                    className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                      elegido ? "border-[#3D2410] bg-[#F4E4C1] text-[#3D2410]" : "border-[#F4E4C1]/60 bg-[#3D2410]/30 text-[#F4E4C1]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagen} alt="" width={22} height={22} className="h-[22px] w-[22px]" />
                    {nombre}
                    {elegido && ` · ${t("activo")}`}
                  </button>
                );
              }

              const costo = costoDe(item);
              if (!alcanzaNivel) {
                return (
                  <div
                    key={mundo}
                    className="flex items-center gap-2 rounded-full border border-dashed border-[#F4E4C1]/30 px-3 py-1.5 text-sm text-[#F4E4C1]/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagen} alt="" width={22} height={22} className="h-[22px] w-[22px] grayscale" />
                    {t("requiereNivelMundo", { n: NIVEL_MUNDO_REQUERIDO_MARCO, mundo: nombre })}
                  </div>
                );
              }
              return (
                <button
                  key={mundo}
                  onClick={() => comprar(item, "marco-mundo")}
                  disabled={comprando || puntos < costo}
                  className="flex items-center gap-2 rounded-full border border-dashed border-[#F4E4C1]/50 px-3 py-1.5 text-sm text-[#F4E4C1]/70 disabled:opacity-40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagen} alt="" width={22} height={22} className="h-[22px] w-[22px]" />
                  {t("nombreChispas", { nombre, costo })}
                </button>
              );
            })}
          </div>
          {error?.contexto === "marco-mundo" && <p className="text-sm font-medium text-[#5C1A1A]">{error.msg}</p>}

          <PaqueteMarcosMundo
            marcosDesbl={marcosDesbl}
            nivelesMundo={nivelesMundo}
            puntos={puntos}
            comprando={comprando}
            onComprar={() => comprar("paquete_marcos_mundo", "marco-mundo")}
            costo={costoDe("paquete_marcos_mundo")}
          />
        </EstanteCategoria>

        {/* La puerta del sótano — la Trastienda vive en su propia página
            ( /trastienda ): acá solo queda el cartel que indica el camino. */}
        <Link
          href="/trastienda"
          aria-label={t("entrarALaTrastienda")}
          className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-tt-border bg-tt-surface px-6 py-5 text-left shadow-[0_8px_32px_-8px_rgba(0,0,0,0.55)] transition-colors hover:border-tt-accent/60"
        >
          <span className="flex min-w-0 items-center gap-3">
            <IconCandado className="h-6 w-6 shrink-0 text-tt-text-muted transition-colors group-hover:text-tt-accent" />
            <span className="flex flex-col gap-0.5">
              <span className="font-display text-base font-bold tracking-tight text-tt-text">{t("laTrastienda")}</span>
              <span className="text-sm text-tt-text-muted">{t("sotanoDescripcion")}</span>
            </span>
          </span>
          <span className="shrink-0 font-mono text-lg font-bold leading-none text-tt-accent" aria-hidden>
            ↓
          </span>
        </Link>
      </div>
    </div>
  );
}

// ---------- "vidriera" del descuento del día: trato de vendedor destacado ----------
function OfertaDelDia({
  oferta,
  nombre,
}: {
  oferta: { item: string; porcentaje: number };
  nombre: string;
}) {
  const t = useTranslations("Tienda");
  return (
    <BorderGlow
      backgroundColor="#3D2410"
      borderRadius={20}
      glowRadius={30}
      colors={["#FFC53D", "#E8B34D", "#A794FF"]}
      glowColor="45 85% 60%"
    >
      <div className="flex items-center gap-3 px-5 py-4 text-center">
        <span className="text-2xl">🏷️</span>
        <p className="text-sm font-semibold text-[#F4E4C1]">
          {t("ofertaDelVendedor")} <span className="text-[#FFC53D]">{t("porcentajeMenos", { n: oferta.porcentaje })}</span> {t("enItem", { nombre })}
        </p>
      </div>
    </BorderGlow>
  );
}

// ---------- estante con toldo colgante (Fase 1: ambientación de bazar) ----------
function EstanteCategoria({ titulo, franja, children }: { titulo: string; franja: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl shadow-[0_14px_28px_-14px_rgba(61,36,16,0.55)]">
      <div className="relative">
        <div
          className="h-6 w-full"
          style={{
            background: `repeating-linear-gradient(90deg, ${franja} 0 22px, #F4E4C1 22px 44px)`,
            clipPath:
              "polygon(0 0,100% 0,100% 55%,95.5% 100%,91% 55%,86.5% 100%,82% 55%,77.5% 100%,73% 55%,68.5% 100%,64% 55%,59.5% 100%,55% 55%,50.5% 100%,46% 55%,41.5% 100%,37% 55%,32.5% 100%,28% 55%,23.5% 100%,19% 55%,14.5% 100%,10% 55%,5.5% 100%,1% 55%,0 100%)",
          }}
        />
        <div className="bg-[#3D2410] px-4 py-2">
          <span className="font-display text-sm font-bold uppercase tracking-wide text-[#F4E4C1]">{titulo}</span>
        </div>
      </div>
      <div
        className="flex flex-col gap-4 p-5"
        style={{ background: "linear-gradient(180deg, #C1652F 0%, #A85527 100%)" }}
      >
        {children}
      </div>
      <div
        className="h-3 w-full"
        style={{
          background: "linear-gradient(180deg, #8a5a35, #5C3A22)",
          boxShadow: "inset 0 3px 6px -2px rgba(0,0,0,0.5)",
        }}
      />
    </section>
  );
}

function ItemEstante({
  icono,
  nombre,
  descripcion,
  costo,
  costoOriginal,
  cantidad,
  puntos,
  confirmando,
  comprando,
  onConfirmar,
  onCancelar,
  onComprar,
}: {
  icono: ReactNode;
  nombre: string;
  descripcion: string;
  costo: number;
  costoOriginal: number;
  cantidad: number;
  puntos: number;
  confirmando: boolean;
  comprando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
  onComprar: () => void;
}) {
  const t = useTranslations("Tienda");
  const alcanza = puntos >= costo;
  const enOferta = costo < costoOriginal;
  return (
    <GlareHover
      width="100%"
      height="auto"
      background="#F4E4C1"
      borderRadius="14px"
      borderColor="#8a5a35"
      glareColor="#FFC53D"
      glareOpacity={0.35}
      className="!flex !flex-col !gap-3 px-5 py-4 shadow-[0_6px_0_0_#8a5a35]"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/60">{icono}</span>
        <div className="flex-1">
          <p className="font-display font-semibold text-[#3D2410]">{nombre}</p>
          <p className="text-sm text-[#5C3A22]">{descripcion}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#3D2410]/10 px-2.5 py-1 font-mono text-xs text-[#3D2410]">
          {t("tenes", { n: cantidad })}
        </span>
      </div>

      {!confirmando ? (
        <Boton variante="primario" onClick={onConfirmar} disabled={!alcanza} className="self-start px-4 py-2 text-sm">
          {alcanza ? (
            <>
              <ScrollFloat stagger={0.02} animationDuration={0.6}>
                {t("comprarPor", { costo })}
              </ScrollFloat>
              {enOferta && <span className="ml-1 text-white/70 line-through">{costoOriginal}</span>}
            </>
          ) : (
            t("necesitas", { costo })
          )}
        </Boton>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#3D2410]">{t("gastarChispas", { costo })}</span>
          <Boton onClick={onComprar} cargando={comprando} className="px-3 py-1.5 text-sm">
            {t("confirmar")}
          </Boton>
          <button onClick={onCancelar} className="text-sm text-[#5C3A22] hover:underline">
            {t("cancelar")}
          </button>
        </div>
      )}
    </GlareHover>
  );
}

// ---------- Fase 7: "Colección de Mundos" — los 6 marcos de mundo de una, con descuento ----------
function PaqueteMarcosMundo({
  marcosDesbl,
  nivelesMundo,
  puntos,
  comprando,
  onComprar,
  costo,
}: {
  marcosDesbl: string[];
  nivelesMundo: Record<string, number>;
  puntos: number;
  comprando: boolean;
  onComprar: () => void;
  costo: number;
}) {
  const t = useTranslations("Tienda");
  const mundos = Object.keys(MARCOS_MUNDO);
  const yaCompleto = mundos.every((m) => marcosDesbl.includes(m));
  const alcanzaNivelEnTodos = mundos.every((m) => (nivelesMundo[m] ?? 0) >= NIVEL_MUNDO_REQUERIDO_MARCO);

  if (yaCompleto) {
    return (
      <p className="rounded-xl border border-dashed border-[#F4E4C1]/30 px-3 py-2 text-sm text-[#F4E4C1]/60">
        ✨ {t("paqueteMarcosMundoCompleto")}
      </p>
    );
  }

  return (
    <div className="mt-1 flex flex-col gap-1.5 rounded-xl border border-[#FFC53D]/40 bg-[#3D2410]/40 px-4 py-3">
      <p className="text-sm font-semibold text-[#FFC53D]">🏆 {t("items.paqueteMarcosMundo")}</p>
      <p className="text-xs text-[#F4E4C1]/80">{t("paqueteMarcosMundoDescripcion")}</p>
      {alcanzaNivelEnTodos ? (
        <Boton onClick={onComprar} disabled={comprando || puntos < costo} cargando={comprando} className="mt-1 self-start px-4 py-2 text-sm">
          {t("nombreChispas", { nombre: t("items.paqueteMarcosMundo"), costo })}
        </Boton>
      ) : (
        <p className="mt-1 text-xs text-[#F4E4C1]/50">{t("paqueteMarcosMundoRequisito", { n: NIVEL_MUNDO_REQUERIDO_MARCO })}</p>
      )}
    </div>
  );
}
