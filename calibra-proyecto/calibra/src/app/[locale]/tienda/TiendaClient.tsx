"use client";

import { useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  RANGOS_ELO,
  FUENTE_NOMBRE_CLASS,
  ANIMACION_NOMBRE_CLASS,
  FONDO_PERFIL_ESTILO,
  MARCOS_MUNDO,
  MARCOS_NEON,
  type FuenteNombre,
  type AnimacionNombre,
  type FondoPerfil,
} from "@/types/database";
import { IconCandado, IconEscudo } from "@/components/icons";
import Boton from "@/components/Boton";
import GlareHover from "@/components/reactbits/GlareHover";
import BorderGlow from "@/components/reactbits/BorderGlow";
import ScrollFloat from "@/components/reactbits/ScrollFloat";
import { obtenerDescuentoDelDia, precioConDescuento } from "@/lib/descuentoDiario";
import { COSTOS, type ItemComprable } from "@/lib/tienda/costos";
import { reproducirTono } from "@/lib/sonido";
import { PRODUCTOS } from "@/lib/pagos/productos";
import { abrirCheckoutPaddle } from "@/lib/pagos/paddleClient";
import { PAGOS_REALES_HABILITADOS } from "@/lib/pagos/flags";
import type { Proveedor, ProductoComprable } from "@/lib/pagos/tipos";

const PACKS_CHISPAS: ProductoComprable[] = ["chispas_1000", "chispas_2500", "chispas_6000", "chispas_15000"];

// Fase 7: reusa la paleta de rangos de Rankeds (RANGOS_ELO) en vez de
// inventar colores nuevos — 6 marcos, uno por rango real.
const MARCOS_COMPRABLES = RANGOS_ELO.map((r) => ({
  marco: r.slug,
  item: `marco_${r.slug}` as ItemComprable,
  colorHex: r.colorHex,
}));

// Pedido 2026-09-22: 3 marcos "neón" animados (mismo mecanismo que
// MARCOS_COMPRABLES — solo Chispas, sin requisito de nivel_mundo — ver
// el comentario largo de MARCOS_NEON en src/types/database.ts). Se
// muestran en la MISMA sección "Herrero de marcos" ("la sección de
// bordes"), no en una vidriera aparte.
const MARCOS_NEON_COMPRABLES = MARCOS_NEON.map((m) => ({
  marco: m.slug,
  item: `marco_${m.slug}` as ItemComprable,
  colorHex: m.colorHex,
}));

// Grupo B, Fase 1: 6 marcos temáticos, uno por mundo — a diferencia de
// MARCOS_COMPRABLES (arriba), exigen además haber alcanzado
// nivel_mundo >= 40 en ese mundo (validado server-side en
// comprar_item_tienda), no solo Chispas.
const NIVEL_MUNDO_REQUERIDO_MARCO = 40;
const MARCOS_MUNDO_COMPRABLES = Object.entries(MARCOS_MUNDO).map(([mundo, { imagen }]) => ({
  mundo,
  item: `marco_${mundo}` as ItemComprable,
  imagen,
}));

type Contexto = "utilidad" | "fuente" | "marco" | "marco-mundo" | "animacion" | "fondo" | "fondo-galeria" | "color-nombre" | "apuesta";

interface Props {
  puntosIniciales: number;
  escudosIniciales: number;
  congelamientosIniciales: number;
  boostIniciales: number;
  hielosIniciales: number;
  tiemposExtraIniciales: number;
  fuenteActual: string;
  fuentesDesbloqueadas: string[];
  marcoActual: string;
  marcosDesbloqueados: string[];
  animacionActual: string;
  animacionesDesbloqueadas: string[];
  fondoActual: string;
  fondosDesbloqueados: string[];
  fondoPerfilUrlActual: string | null;
  fondosGaleria: { slug: string; nombre: string; url: string; costo: number }[];
  fondosGaleriaDesbloqueados: string[];
  colorNombreDesbloqueadoInicial: boolean;
  nivelesMundo: Record<string, number>;
  fechaHoy: string;
  esPro: boolean;
  ocultarTrastienda: boolean;
}

export default function TiendaClient({
  puntosIniciales,
  escudosIniciales,
  congelamientosIniciales,
  boostIniciales,
  hielosIniciales,
  tiemposExtraIniciales,
  fuenteActual,
  fuentesDesbloqueadas,
  marcoActual,
  marcosDesbloqueados,
  animacionActual,
  animacionesDesbloqueadas,
  fondoActual,
  fondosDesbloqueados,
  fondoPerfilUrlActual,
  fondosGaleria,
  fondosGaleriaDesbloqueados,
  colorNombreDesbloqueadoInicial,
  nivelesMundo,
  fechaHoy,
  esPro,
  ocultarTrastienda,
}: Props) {
  const t = useTranslations("Tienda");
  const tMundos = useTranslations("Mundos.nombres");
  const tRangos = useTranslations("Rankeds.rangos");
  const tMarcosNeon = useTranslations("Tienda.marcosNeon");
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
    marco_neon_violeta: t("marcosNeon.neon_violeta"),
    marco_neon_cian: t("marcosNeon.neon_cian"),
    marco_neon_magenta: t("marcosNeon.neon_magenta"),
    marco_numeria: t("items.marcoNumeria"),
    marco_enigmia: t("items.marcoEnigmia"),
    marco_geografia: t("items.marcoGeografia"),
    marco_quimia: t("items.marcoQuimia"),
    marco_anatomia: t("items.marcoAnatomia"),
    marco_melodia: t("items.marcoMelodia"),
    marco_trigonometria: t("items.marcoTrigonometria"),
    marco_historia: t("items.marcoHistoria"),
    marco_calculia: t("items.marcoCalculia"),
    marco_circuitia: t("items.marcoCircuitia"),
    marco_estadistica: t("items.marcoEstadistica"),
    marco_naipia: t("items.marcoNaipia"),
    marco_codia: t("items.marcoCodia"),
    paquete_marcos_mundo: t("items.paqueteMarcosMundo"),
    animacion_ondulante: t("items.animacionOndulante"),
    animacion_brillo: t("items.animacionBrillo"),
    animacion_arcoiris: t("items.animacionArcoiris"),
    animacion_neon: t("items.animacionNeon"),
    fondo_oceano: t("items.fondoOceano"),
    fondo_bosque: t("items.fondoBosque"),
    fondo_aurora: t("items.fondoAurora"),
    fondo_dorado: t("items.fondoDorado"),
    fondo_nebulosa: t("items.fondoNebulosa"),
    fondo_personalizado: t("items.fondoPersonalizado"),
    color_nombre_personalizado: t("items.colorNombrePersonalizado"),
    animacion_prisma: t("items.animacionPrisma"),
    fondo_prodigio: t("items.fondoProdigio"),
    fuente_urbana: t("items.fuenteUrbana"),
    fuente_elegante: t("items.fuenteElegante"),
    animacion_glitch: t("items.animacionGlitch"),
    animacion_glitch_intenso: t("items.animacionGlitchIntenso"),
    animacion_deconstruccion: t("items.animacionDeconstruccion"),
    animacion_shuffle: t("items.animacionShuffle"),
    animacion_decrypted: t("items.animacionDecrypted"),
    hielo: t("items.hielo"),
    tiempo_extra: t("items.tiempoExtra"),
  };
  const FUENTES_COMPRABLES: { fuente: FuenteNombre; item: ItemComprable; nombre: string }[] = [
    { fuente: "mono", item: "fuente_mono", nombre: t("fuentes.mono") },
    { fuente: "serif", item: "fuente_serif", nombre: t("fuentes.serif") },
    { fuente: "manuscrita", item: "fuente_manuscrita", nombre: t("fuentes.manuscrita") },
    { fuente: "impacto", item: "fuente_impacto", nombre: t("fuentes.impacto") },
    { fuente: "script", item: "fuente_script", nombre: t("fuentes.script") },
    { fuente: "futurista", item: "fuente_futurista", nombre: t("fuentes.futurista") },
    { fuente: "urbana", item: "fuente_urbana", nombre: t("fuentes.urbana") },
    { fuente: "elegante", item: "fuente_elegante", nombre: t("fuentes.elegante") },
  ];
  const ANIMACIONES_COMPRABLES: { animacion: AnimacionNombre; item: ItemComprable; nombre: string; requierePro?: boolean }[] = [
    { animacion: "ondulante", item: "animacion_ondulante", nombre: t("animaciones.ondulante") },
    { animacion: "brillo", item: "animacion_brillo", nombre: t("animaciones.brillo") },
    { animacion: "arcoiris", item: "animacion_arcoiris", nombre: t("animaciones.arcoiris") },
    { animacion: "neon", item: "animacion_neon", nombre: t("animaciones.neon") },
    { animacion: "glitch", item: "animacion_glitch", nombre: t("animaciones.glitch") },
    { animacion: "glitch_intenso", item: "animacion_glitch_intenso", nombre: t("animaciones.glitchIntenso") },
    { animacion: "deconstruccion", item: "animacion_deconstruccion", nombre: t("animaciones.deconstruccion") },
    { animacion: "shuffle", item: "animacion_shuffle", nombre: t("animaciones.shuffle") },
    { animacion: "decrypted", item: "animacion_decrypted", nombre: t("animaciones.decrypted") },
    { animacion: "prisma", item: "animacion_prisma", nombre: t("animaciones.prisma"), requierePro: true },
  ];
  const FONDOS_COMPRABLES: { fondo: FondoPerfil; item: ItemComprable; nombre: string; requierePro?: boolean }[] = [
    { fondo: "oceano", item: "fondo_oceano", nombre: t("fondos.oceano") },
    { fondo: "bosque", item: "fondo_bosque", nombre: t("fondos.bosque") },
    { fondo: "aurora", item: "fondo_aurora", nombre: t("fondos.aurora") },
    { fondo: "dorado", item: "fondo_dorado", nombre: t("fondos.dorado") },
    { fondo: "nebulosa", item: "fondo_nebulosa", nombre: t("fondos.nebulosa") },
    { fondo: "personalizado", item: "fondo_personalizado", nombre: t("fondos.personalizado") },
    { fondo: "prodigio", item: "fondo_prodigio", nombre: t("fondos.prodigio"), requierePro: true },
  ];
  const [puntos, setPuntos] = useState(puntosIniciales);
  const [escudos, setEscudos] = useState(escudosIniciales);
  const [congelamientos, setCongelamientos] = useState(congelamientosIniciales);
  const [boost, setBoost] = useState(boostIniciales);
  const [hielos, setHielos] = useState(hielosIniciales);
  const [tiemposExtra, setTiemposExtra] = useState(tiemposExtraIniciales);
  const [fuentesDesbl, setFuentesDesbl] = useState(fuentesDesbloqueadas);
  const [fuenteElegida, setFuenteElegida] = useState(fuenteActual);
  const [marcosDesbl, setMarcosDesbl] = useState(marcosDesbloqueados);
  const [marcoElegido, setMarcoElegido] = useState(marcoActual);
  const [animacionesDesbl, setAnimacionesDesbl] = useState(animacionesDesbloqueadas);
  const [animacionElegida, setAnimacionElegida] = useState(animacionActual);
  const [fondosDesbl, setFondosDesbl] = useState(fondosDesbloqueados);
  const [fondoElegido, setFondoElegido] = useState(fondoActual);
  const [fondoPerfilUrl, setFondoPerfilUrl] = useState(fondoPerfilUrlActual);
  const [fondosGaleriaDesbl, setFondosGaleriaDesbl] = useState(fondosGaleriaDesbloqueados);
  const [colorNombreDesbl, setColorNombreDesbl] = useState(colorNombreDesbloqueadoInicial);
  const [confirmandoGaleria, setConfirmandoGaleria] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<ItemComprable | null>(null);
  const [comprando, setComprando] = useState(false);
  const [cambiandoCosmetico, setCambiandoCosmetico] = useState(false);
  const [error, setError] = useState<{ msg: string; contexto: Contexto } | null>(null);
  const [proveedorPago, setProveedorPago] = useState<Proveedor>("mercadopago");
  const [comprandoPago, setComprandoPago] = useState<ProductoComprable | null>(null);
  const [errorPago, setErrorPago] = useState<string | null>(null);

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
      if (typeof data.hielos_disponibles === "number") setHielos(data.hielos_disponibles);
      if (typeof data.tiempos_extra_disponibles === "number") setTiemposExtra(data.tiempos_extra_disponibles);
      if (Array.isArray(data.fuentes_desbloqueadas)) setFuentesDesbl(data.fuentes_desbloqueadas);
      if (Array.isArray(data.marcos_desbloqueados)) setMarcosDesbl(data.marcos_desbloqueados);
      if (Array.isArray(data.animaciones_desbloqueadas)) setAnimacionesDesbl(data.animaciones_desbloqueadas);
      if (Array.isArray(data.fondos_desbloqueados)) setFondosDesbl(data.fondos_desbloqueados);
      if (item === "color_nombre_personalizado") setColorNombreDesbl(true);
      setConfirmando(null);
      reproducirTono("compra");
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

  async function elegirAnimacion(animacion: string) {
    setCambiandoCosmetico(true);
    setError(null);
    try {
      const res = await fetch("/api/tienda/elegir-animacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animacion }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError({ msg: data.error ?? t("noSePudoCambiarAnimacion"), contexto: "animacion" });
      else setAnimacionElegida(animacion);
    } catch {
      setError({ msg: t("noSePudoCambiarAnimacionConexion"), contexto: "animacion" });
    } finally {
      setCambiandoCosmetico(false);
    }
  }

  async function elegirFondo(fondo: string) {
    setCambiandoCosmetico(true);
    setError(null);
    try {
      const res = await fetch("/api/tienda/elegir-fondo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fondo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError({ msg: data.error ?? t("noSePudoCambiarFondo"), contexto: "fondo" });
      else setFondoElegido(fondo);
    } catch {
      setError({ msg: t("noSePudoCambiarFondoConexion"), contexto: "fondo" });
    } finally {
      setCambiandoCosmetico(false);
    }
  }

  // Galería de fondos (0152): catálogo ampliable sin deploy — el dueño
  // sube un gif/imagen a Storage y agrega una fila por SQL, sin tocar
  // código. Reusa fondo_perfil='personalizado' + fondo_perfil_url por
  // debajo (mismo mecanismo que "tu propia imagen"), así que elegir un
  // ítem de acá también deja marcado "Personalizado" como elegido en
  // la lista de arriba — es honesto: técnicamente ES lo mismo.
  async function comprarFondoGaleria(slug: string) {
    setComprando(true);
    setError(null);
    try {
      const res = await fetch("/api/tienda/comprar-fondo-galeria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError({ msg: data.error ?? t("noSePudoComprar"), contexto: "fondo-galeria" });
        return;
      }
      setPuntos(data.puntos_total);
      setFondosGaleriaDesbl((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
      setConfirmandoGaleria(null);
      reproducirTono("compra");
    } catch {
      setError({ msg: t("noSePudoComprarConexion"), contexto: "fondo-galeria" });
    } finally {
      setComprando(false);
    }
  }

  async function elegirFondoGaleria(slug: string, url: string) {
    setCambiandoCosmetico(true);
    setError(null);
    try {
      const res = await fetch("/api/tienda/elegir-fondo-galeria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError({ msg: data.error ?? t("noSePudoCambiarFondo"), contexto: "fondo-galeria" });
      else {
        setFondoElegido("personalizado");
        setFondoPerfilUrl(url);
      }
    } catch {
      setError({ msg: t("noSePudoCambiarFondoConexion"), contexto: "fondo-galeria" });
    } finally {
      setCambiandoCosmetico(false);
    }
  }

  // Fase 5 (pagos): Chispas con dinero real. A diferencia de comprar()
  // (que gasta Chispas ya ganadas), esto arranca un checkout real vía
  // /api/pagos/checkout — el otorgamiento de Chispas NUNCA pasa por
  // acá, pasa server-to-server cuando llega el webhook del proveedor
  // (ver src/lib/pagos/servicio.ts). Esta función solo abre el
  // checkout; si el proveedor todavía no está conectado (Fase 2/3 del
  // plan de pagos), la ruta devuelve un 503 con el motivo, que se
  // muestra tal cual.
  async function comprarChispasReales(producto: ProductoComprable) {
    setComprandoPago(producto);
    setErrorPago(null);
    try {
      const res = await fetch("/api/pagos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producto, proveedor: proveedorPago }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorPago(data.error ?? t("pagos.errorGenerico"));
        return;
      }
      if (data.tipo === "redirect") {
        window.location.assign(data.url);
      } else if (data.tipo === "overlay") {
        const abierto = await abrirCheckoutPaddle(data.transactionId, () => window.location.reload());
        if (!abierto) setErrorPago(t("pagos.overlayNoDisponible"));
      }
    } catch {
      setErrorPago(t("pagos.errorConexion"));
    } finally {
      setComprandoPago(null);
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

        {PAGOS_REALES_HABILITADOS && (
        <EstanteCategoria titulo={t("pagos.titulo")} franja="#FFC53D">
          <p className="text-sm text-[#F4E4C1]/90">{t("pagos.descripcion")}</p>
          <div className="flex w-fit gap-1 rounded-full border border-[#F4E4C1]/30 bg-[#3D2410]/30 p-1">
            <button
              onClick={() => setProveedorPago("mercadopago")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                proveedorPago === "mercadopago" ? "bg-[#F4E4C1] text-[#3D2410]" : "text-[#F4E4C1]/70"
              }`}
            >
              {t("pagos.colombia")}
            </button>
            <button
              onClick={() => setProveedorPago("paddle")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                proveedorPago === "paddle" ? "bg-[#F4E4C1] text-[#3D2410]" : "text-[#F4E4C1]/70"
              }`}
            >
              {t("pagos.internacional")}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {PACKS_CHISPAS.map((producto) => {
              const def = PRODUCTOS[producto];
              return (
                <button
                  key={producto}
                  onClick={() => comprarChispasReales(producto)}
                  disabled={comprandoPago !== null}
                  className="flex flex-col items-center gap-0.5 rounded-xl border border-[#F4E4C1]/50 bg-[#3D2410]/30 px-4 py-2.5 text-[#F4E4C1] transition-colors hover:border-[#F4E4C1] disabled:opacity-50"
                >
                  <span className="font-mono text-sm font-bold">{t("pagos.packChispas", { n: def.montoChispas ?? 0 })}</span>
                  <span className="text-xs text-[#F4E4C1]/70">
                    {comprandoPago === producto ? t("pagos.procesando") : t("pagos.precioUsd", { precio: def.precioUsd })}
                  </span>
                </button>
              );
            })}
          </div>
          {errorPago && <p className="text-sm font-medium text-[#5C1A1A]">{errorPago}</p>}
        </EstanteCategoria>
        )}

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
          <ItemEstante
            icono={<span className="text-2xl">🧊</span>}
            nombre={t("items.hielo")}
            descripcion={t("descripciones.hielo")}
            costo={costoDe("hielo")}
            costoOriginal={COSTOS.hielo}
            cantidad={hielos}
            puntos={puntos}
            confirmando={confirmando === "hielo"}
            comprando={comprando}
            onConfirmar={() => setConfirmando("hielo")}
            onCancelar={() => setConfirmando(null)}
            onComprar={() => comprar("hielo", "utilidad")}
          />
          <ItemEstante
            icono={<span className="text-2xl">⏱️</span>}
            nombre={t("items.tiempoExtra")}
            descripcion={t("descripciones.tiempoExtra")}
            costo={costoDe("tiempo_extra")}
            costoOriginal={COSTOS.tiempo_extra}
            cantidad={tiemposExtra}
            puntos={puntos}
            confirmando={confirmando === "tiempo_extra"}
            comprando={comprando}
            onConfirmar={() => setConfirmando("tiempo_extra")}
            onCancelar={() => setConfirmando(null)}
            onComprar={() => comprar("tiempo_extra", "utilidad")}
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
            {[...MARCOS_COMPRABLES, ...MARCOS_NEON_COMPRABLES].map(({ marco, item, colorHex }) => {
              // Los 3 marcos "neón" (pedido 2026-09-22) no son un rango de
              // Rankeds — su nombre sale de Tienda.marcosNeon, no de
              // Rankeds.rangos.
              const esNeon = marco.startsWith("neon_");
              const nombre = esNeon ? tMarcosNeon(marco) : tRangos(marco);
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
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${esNeon ? "marco-neon-perfil" : ""} ${esNeon ? `marco-${marco.replace("_", "-")}` : ""}`}
                      style={{ background: colorHex }}
                    />
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
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${esNeon ? "marco-neon-perfil" : ""} ${esNeon ? `marco-${marco.replace("_", "-")}` : ""}`}
                    style={{ background: colorHex }}
                  />
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
            {MARCOS_MUNDO_COMPRABLES.map(({ mundo, item, imagen }) => {
              const nombre = tMundos(mundo);
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

        <EstanteCategoria titulo={t("vidrieraDeAnimaciones")} franja="#3ddc97">
          <p className="text-sm text-[#F4E4C1]/90">{t("vidrieraAnimacionesDescripcion")}</p>
          <div className="flex flex-wrap gap-2">
            {(["ninguna", ...ANIMACIONES_COMPRABLES.map((a) => a.animacion)] as AnimacionNombre[]).map((animacion) => {
              const desbloqueada = animacionesDesbl.includes(animacion);
              const compra = ANIMACIONES_COMPRABLES.find((a) => a.animacion === animacion);
              const elegida = animacionElegida === animacion;
              const claseAnimacion = ANIMACION_NOMBRE_CLASS[animacion];
              if (desbloqueada) {
                return (
                  <button
                    key={animacion}
                    onClick={() => elegirAnimacion(animacion)}
                    disabled={cambiandoCosmetico || elegida}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      elegida
                        ? "border-[#3D2410] bg-[#F4E4C1] text-[#3D2410]"
                        : "border-[#F4E4C1]/60 bg-[#3D2410]/30 text-[#F4E4C1] hover:border-[#F4E4C1]"
                    }`}
                  >
                    <span className={claseAnimacion} data-text={animacion === "ninguna" ? t("sinAnimacion") : compra?.nombre}>
                      {animacion === "ninguna" ? t("sinAnimacion") : compra?.nombre}
                    </span>
                    {elegida && ` · ${t("activa")}`}
                  </button>
                );
              }
              if (!compra) return null;
              if (compra.requierePro && !esPro) {
                return (
                  <Link
                    key={animacion}
                    href="/pro"
                    className="flex items-center gap-1.5 rounded-full border border-dashed border-[#F4E4C1]/30 px-3 py-1.5 text-sm text-[#F4E4C1]/40"
                  >
                    🔒 <span className={claseAnimacion} data-text={compra.nombre}>{compra.nombre}</span> · {t("exclusivoDePro")}
                  </Link>
                );
              }
              const costo = costoDe(compra.item);
              return (
                <button
                  key={animacion}
                  onClick={() => comprar(compra.item, "animacion")}
                  disabled={comprando || puntos < costo}
                  className="rounded-full border border-dashed border-[#F4E4C1]/50 px-3 py-1.5 text-sm text-[#F4E4C1]/70 disabled:opacity-40"
                >
                  <span className={claseAnimacion} data-text={compra.nombre}>{t("nombreChispas", { nombre: compra.nombre, costo })}</span>
                </button>
              );
            })}
          </div>
          {error?.contexto === "animacion" && <p className="text-sm font-medium text-[#5C1A1A]">{error.msg}</p>}
        </EstanteCategoria>

        <EstanteCategoria titulo={t("vidrieraDeFondos")} franja="#4CC9F0">
          <p className="text-sm text-[#F4E4C1]/90">{t("vidrieraFondosDescripcion")}</p>
          {/* Pedido en vivo (2026-09-15): "agrégales vista previa" — antes
              cada fondo era un puntito de 2.5px de color, casi invisible.
              Ahora usa la misma tarjeta con muestra grande que ya tiene la
              Galería de fondos (abajo), con el degradé real de fondo en
              vez de una miniatura de imagen. */}
          <div className="flex flex-wrap gap-3">
            <div className="flex w-28 flex-col items-center gap-1.5">
              <button
                onClick={() => elegirFondo("ninguno")}
                disabled={cambiandoCosmetico || fondoElegido === "ninguno"}
                className="flex h-20 w-28 items-center justify-center rounded-xl border-2 bg-[#3D2410]/40 text-xs text-[#F4E4C1]/60 disabled:cursor-not-allowed"
                style={{ borderColor: fondoElegido === "ninguno" ? "#F4E4C1" : "rgba(244,228,193,0.3)" }}
              >
                {t("sinFondo")}
              </button>
              <span className="text-center text-xs font-medium text-[#F4E4C1]">{t("sinFondo")}</span>
              {fondoElegido === "ninguno" && (
                <span className="w-full rounded-full border border-[#3D2410] bg-[#F4E4C1] px-2 py-1 text-center text-xs font-semibold text-[#3D2410]">
                  {t("activo")}
                </span>
              )}
            </div>
            {FONDOS_COMPRABLES.map(({ fondo, item, nombre, requierePro }) => {
              const desbloqueado = fondosDesbl.includes(fondo);
              const elegido = fondoElegido === fondo;
              const preview =
                fondo === "personalizado" ? (
                  <span className="text-2xl leading-none">🖼️</span>
                ) : (
                  <div className="h-full w-full" style={{ backgroundImage: FONDO_PERFIL_ESTILO[fondo] }} />
                );
              const previewCard = (
                <div
                  className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-xl border-2 bg-[#3D2410]/40"
                  style={{ borderColor: elegido ? "#F4E4C1" : "rgba(244,228,193,0.3)" }}
                >
                  {preview}
                </div>
              );

              if (requierePro && !esPro) {
                return (
                  <Link key={fondo} href="/pro" className="flex w-28 flex-col items-center gap-1.5">
                    <div className="relative h-20 w-28 overflow-hidden rounded-xl border-2 border-dashed border-[#F4E4C1]/30 opacity-40">
                      {preview}
                    </div>
                    <span className="text-center text-xs font-medium text-[#F4E4C1]/60">🔒 {nombre}</span>
                    <span className="w-full rounded-full border border-[#F4E4C1]/40 px-2 py-1 text-center text-xs text-[#F4E4C1]/70">
                      {t("exclusivoDePro")}
                    </span>
                  </Link>
                );
              }

              const costo = costoDe(item);
              return (
                <div key={fondo} className="flex w-28 flex-col items-center gap-1.5">
                  {previewCard}
                  <span className="text-center text-xs font-medium text-[#F4E4C1]">{nombre}</span>
                  {desbloqueado ? (
                    <button
                      onClick={() => elegirFondo(fondo)}
                      disabled={cambiandoCosmetico || elegido}
                      className={`w-full rounded-full border px-2 py-1 text-xs font-medium transition-colors ${
                        elegido
                          ? "border-[#3D2410] bg-[#F4E4C1] text-[#3D2410]"
                          : "border-[#F4E4C1]/60 bg-[#3D2410]/30 text-[#F4E4C1] hover:border-[#F4E4C1]"
                      }`}
                    >
                      {elegido ? t("activo") : t("elegir")}
                    </button>
                  ) : (
                    <button
                      onClick={() => comprar(item, "fondo")}
                      disabled={comprando || puntos < costo}
                      className="w-full rounded-full border border-dashed border-[#F4E4C1]/50 px-2 py-1 text-xs text-[#F4E4C1]/70 disabled:opacity-40"
                    >
                      {t("nombreChispas", { nombre: t("comprar"), costo })}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {fondoElegido === "personalizado" && (
            <p className="text-xs text-[#F4E4C1]/70">
              {t("subeTuImagenEnPerfil")}{" "}
              <Link href="/perfil" className="underline hover:text-[#F4E4C1]">
                {t("irAPerfil")}
              </Link>
            </p>
          )}
          {error?.contexto === "fondo" && <p className="text-sm font-medium text-[#5C1A1A]">{error.msg}</p>}
        </EstanteCategoria>

        {/* Pedido en vivo (2026-09-15): "¿podrías permitir cambiar el
            color del nombre?" — un único ítem que desbloquea el picker
            (cualquier color, no un catálogo fijo). El color en sí se
            elige en /perfil (ColorNombrePicker.tsx), acá solo se compra
            el desbloqueo. */}
        <EstanteCategoria titulo={t("vidrieraDeColorNombre")} franja="#7C5CFF">
          <p className="text-sm text-[#F4E4C1]/90">{t("vidrieraColorNombreDescripcion")}</p>
          {colorNombreDesbl ? (
            <p className="text-sm text-[#F4E4C1]">
              ✓ {t("colorNombreDesbloqueado")}{" "}
              <Link href="/perfil" className="underline hover:text-white">
                {t("irAPerfil")}
              </Link>
            </p>
          ) : (
            <button
              onClick={() => comprar("color_nombre_personalizado", "color-nombre")}
              disabled={comprando || puntos < costoDe("color_nombre_personalizado")}
              className="w-fit rounded-full border border-dashed border-[#F4E4C1]/50 px-3 py-1.5 text-sm text-[#F4E4C1]/70 disabled:opacity-40"
            >
              {t("nombreChispas", { nombre: t("comprar"), costo: costoDe("color_nombre_personalizado") })}
            </button>
          )}
          {error?.contexto === "color-nombre" && <p className="text-sm font-medium text-[#5C1A1A]">{error.msg}</p>}
        </EstanteCategoria>

        {/* Galería de fondos animados (0152) — pedido en vivo
            (2026-09-15): un catálogo APARTE de los 5 degradés de arriba,
            pensado para gifs/imágenes reales que el dueño va agregando
            sin deploy (sube a Storage, agrega una fila por SQL). Si
            todavía no hay ningún ítem activo, la sección entera no se
            renderiza — nada raro que mostrar en un catálogo vacío. */}
        {fondosGaleria.length > 0 && (
          <EstanteCategoria titulo={t("vidrieraDeFondosGaleria")} franja="#FF5D5D">
            <p className="text-sm text-[#F4E4C1]/90">{t("vidrieraFondosGaleriaDescripcion")}</p>
            <div className="flex flex-wrap gap-3">
              {fondosGaleria.map(({ slug, nombre, url, costo }) => {
                const desbloqueado = fondosGaleriaDesbl.includes(slug);
                const elegido = fondoElegido === "personalizado" && fondoPerfilUrl === url;
                return (
                  <div key={slug} className="flex w-28 flex-col items-center gap-1.5">
                    <div
                      className="h-20 w-28 overflow-hidden rounded-xl border-2 bg-cover bg-center"
                      style={{ backgroundImage: `url(${url})`, borderColor: elegido ? "#F4E4C1" : "rgba(244,228,193,0.3)" }}
                    />
                    <span className="text-center text-xs font-medium text-[#F4E4C1]">{nombre}</span>
                    {desbloqueado ? (
                      <button
                        onClick={() => elegirFondoGaleria(slug, url)}
                        disabled={cambiandoCosmetico || elegido}
                        className={`w-full rounded-full border px-2 py-1 text-xs font-medium transition-colors ${
                          elegido
                            ? "border-[#3D2410] bg-[#F4E4C1] text-[#3D2410]"
                            : "border-[#F4E4C1]/60 bg-[#3D2410]/30 text-[#F4E4C1] hover:border-[#F4E4C1]"
                        }`}
                      >
                        {elegido ? t("activo") : t("elegir")}
                      </button>
                    ) : confirmandoGaleria === slug ? (
                      <div className="flex w-full gap-1">
                        <button
                          onClick={() => comprarFondoGaleria(slug)}
                          disabled={comprando}
                          className="flex-1 rounded-full bg-[#F4E4C1] px-2 py-1 text-xs font-semibold text-[#3D2410] disabled:opacity-60"
                        >
                          {t("confirmar")}
                        </button>
                        <button
                          onClick={() => setConfirmandoGaleria(null)}
                          className="rounded-full border border-[#F4E4C1]/40 px-2 py-1 text-xs text-[#F4E4C1]"
                        >
                          {t("cancelar")}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmandoGaleria(slug)}
                        disabled={puntos < costo}
                        className="w-full rounded-full border border-dashed border-[#F4E4C1]/50 px-2 py-1 text-xs text-[#F4E4C1]/70 disabled:opacity-40"
                      >
                        {t("nombreChispas", { nombre: t("comprar"), costo })}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {error?.contexto === "fondo-galeria" && <p className="text-sm font-medium text-[#5C1A1A]">{error.msg}</p>}
          </EstanteCategoria>
        )}

        {/* La puerta del sótano — la Trastienda vive en su propia página
            ( /trastienda ): acá solo queda el cartel que indica el camino.
            Bug real (2026-09-17): "ocultar doble o nada" en Ajustes decía
            en su descripción que sacaba la Trastienda de la Tienda, pero
            este cartel nunca chequeaba ese flag — solo escondía el
            widget de Doble o Nada DENTRO de /trastienda. Ahora sí se
            oculta acá también, para que el ajuste haga lo que promete. */}
        {!ocultarTrastienda && (
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
        )}
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
          {t("tienes", { n: cantidad })}
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
