"use client";

import type { ReactNode } from "react";
import { Fragment, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, MotionConfig, animate, motion, useInView } from "framer-motion";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import MamutHerdSello from "@/components/MamutHerdSello";
import { IconCheck, IconRango, IconEscudo, IconJugar, IconLlama } from "@/components/icons";
import { MUNDOS_LANDING } from "@/lib/mundos";
import { preciosPresentacion } from "@/lib/landing/precios";

// Página de presentación pública (2026-11-23: «no hay una página de presentación para
// Prodigia»; después: «diseño profesional, sin exceso de texto, estético, con
// animaciones que no dependan de los efectos reducidos»). La ve quien entra a «/» sin
// sesión, y cualquiera en /conoce. «Jugar» no cambia el flujo de siempre: con onJugar
// (en «/») arranca el tutorial de la partida de prueba de VisitanteLanding; sin él (en
// /conoce) es un link a «/». Los precios salen del catálogo real (pagos/productos.ts).
// MotionConfig reducedMotion="never": las animaciones corren siempre, a pedido.

const SUAVE = [0.16, 1, 0.3, 1] as const;

function BotonJugar({ onJugar, children, grande }: { onJugar?: () => void; children: ReactNode; grande?: boolean }) {
  const clase = `group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primario font-display font-bold text-white shadow-[0_14px_34px_-12px_color-mix(in_oklab,var(--primario)_80%,transparent)] transition-transform hover:-translate-y-0.5 active:translate-y-0 ${
    grande ? "px-8 py-4 text-lg" : "px-5 py-3 text-base"
  }`;
  const contenido = (
    <>
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-white/25"
        animate={{ x: ["0%", "450%"] }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" }}
      />
      <IconJugar className="relative h-5 w-5" />
      <span className="relative">{children}</span>
    </>
  );
  if (onJugar) {
    return (
      <button type="button" onClick={onJugar} className={clase} data-prueba="jugar">
        {contenido}
      </button>
    );
  }
  return (
    <Link href="/" className={clase} data-prueba="jugar">
      {contenido}
    </Link>
  );
}

function Aparece({ children, retraso = 0, className, desde = 24 }: { children: ReactNode; retraso?: number; className?: string; desde?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: desde }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: retraso, ease: SUAVE }}
    >
      {children}
    </motion.div>
  );
}

function Encabezado({ etiqueta, titulo, texto }: { etiqueta: string; titulo: string; texto?: string }) {
  return (
    <Aparece className="mx-auto max-w-2xl text-center">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-primario">{etiqueta}</p>
      <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-foreground sm:text-5xl">{titulo}</h2>
      {texto && <p className="mt-3 text-texto-secundario">{texto}</p>}
    </Aparece>
  );
}

// Cuenta de 0 al número cuando entra en pantalla.
function Contador({ hasta, sufijo = "" }: { hasta: number; sufijo?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visto = useInView(ref, { once: true });
  const [valor, setValor] = useState(0);
  useEffect(() => {
    if (!visto) return;
    const c = animate(0, hasta, { duration: 1.4, ease: SUAVE, onUpdate: (v) => setValor(Math.round(v)) });
    return () => c.stop();
  }, [visto, hasta]);
  return (
    <span ref={ref}>
      {valor}
      {sufijo}
    </span>
  );
}

function FondoVivo() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-24 bottom-[-10rem] -z-10 overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
      <motion.div
        className="absolute -left-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-[#6C4CF1]/25 blur-[110px]"
        animate={{ x: [0, 80, -20, 0], y: [0, 40, 90, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-40 top-10 h-[30rem] w-[30rem] rounded-full bg-[#06B6D4]/20 blur-[110px]"
        animate={{ x: [0, -70, 10, 0], y: [0, 60, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-12rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-[#F59E0B]/15 blur-[110px]"
        animate={{ x: [0, 60, -60, 0], y: [0, -40, 0, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(color-mix(in_oklab,var(--foreground)_9%,transparent)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
    </div>
  );
}

// Las 15 ciudades en órbita alrededor del logo.
function Orbita() {
  const n = MUNDOS_LANDING.length;
  return (
    <motion.div
      className="relative mx-auto aspect-square w-full max-w-[460px]"
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: SUAVE, delay: 0.2 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-[34%] rounded-full border-2 border-primario/30"
          animate={{ scale: [1, 2.3], opacity: [0.6, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, delay: i * 1.2, ease: "easeOut" }}
        />
      ))}
      <div className="absolute inset-[12%] rounded-full border border-dashed border-border" />
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="rounded-full bg-background/70 p-4 shadow-[0_20px_60px_-20px_color-mix(in_oklab,var(--primario)_70%,transparent)] backdrop-blur">
          <Logo size={92} colorAro="#6C4CF1" />
        </div>
      </motion.div>
      <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 70, repeat: Infinity, ease: "linear" }}>
        {MUNDOS_LANDING.map((m, i) => {
          const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
          return (
            <span
              key={m.slug}
              className="absolute h-[12.5%] w-[12.5%] -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${50 + Math.cos(ang) * 38}%`, top: `${50 + Math.sin(ang) * 38}%` }}
            >
              <motion.span
                className="flex h-full w-full items-center justify-center rounded-2xl text-white shadow-lg ring-4 ring-background"
                style={{ background: `linear-gradient(135deg, ${m.colorHex}, color-mix(in oklab, ${m.colorHex} 55%, white))` }}
                animate={{ rotate: -360 }}
                transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
              >
                <m.Icono className="h-[46%] w-[46%]" />
              </motion.span>
            </span>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

function TituloHero({ texto }: { texto: string }) {
  const palabras = texto.split(" ");
  return (
    <h1 className="font-display text-5xl font-black leading-[1.02] tracking-tight text-foreground sm:text-7xl">
      {palabras.map((p, i) => (
        <Fragment key={`${p}-${i}`}>
        <span className="inline-block overflow-hidden pb-1 align-bottom">
          <motion.span
            className={`inline-block ${i === palabras.length - 1 || i === palabras.length - 2 ? "bg-gradient-to-r from-primario to-[#06B6D4] bg-clip-text text-transparent" : ""}`}
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 + i * 0.07, ease: SUAVE }}
          >
            {p}
          </motion.span>
        </span>
        {i < palabras.length - 1 && " "}
        </Fragment>
      ))}
    </h1>
  );
}

// Selector de ciudades: los íconos en una grilla y una tarjeta grande con la elegida.
// Se pasea sola cada 2,8 s hasta que alguien toca una.
function SelectorCiudades() {
  const tHome = useTranslations("Home");
  const [i, setI] = useState(0);
  const [tocado, setTocado] = useState(false);
  useEffect(() => {
    if (tocado) return;
    const id = setInterval(() => setI((v) => (v + 1) % MUNDOS_LANDING.length), 2800);
    return () => clearInterval(id);
  }, [tocado]);
  const m = MUNDOS_LANDING[i];

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="grid grid-cols-5 gap-3">
        {MUNDOS_LANDING.map((c, idx) => (
          <motion.button
            key={c.slug}
            type="button"
            onClick={() => {
              setI(idx);
              setTocado(true);
            }}
            aria-label={c.nombre}
            whileHover={{ y: -4, scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className={`relative flex aspect-square items-center justify-center rounded-2xl text-white transition-shadow ${idx === i ? "shadow-[0_12px_30px_-10px_var(--c)] ring-2 ring-offset-2 ring-offset-background" : "opacity-70 hover:opacity-100"}`}
            style={{
              background: `linear-gradient(135deg, ${c.colorHex}, color-mix(in oklab, ${c.colorHex} 55%, white))`,
              ["--c" as string]: c.colorHex,
              ["--tw-ring-color" as string]: c.colorHex,
            }}
          >
            <c.Icono className="h-1/2 w-1/2" />
          </motion.button>
        ))}
      </div>
      <div className="relative min-h-[15rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={m.slug}
            initial={{ opacity: 0, y: 24, rotateX: -12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.45, ease: SUAVE }}
            className="relative overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl"
            style={{ background: `linear-gradient(140deg, ${m.colorHex}, color-mix(in oklab, ${m.colorHex} 45%, #0b0820))` }}
          >
            <motion.div
              className="absolute -right-10 -top-10 opacity-20"
              animate={{ rotate: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <m.Icono className="h-48 w-48" />
            </motion.div>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <m.Icono className="h-7 w-7" />
            </span>
            <p className="mt-6 font-display text-4xl font-black">{m.nombre}</p>
            <p className="mt-2 max-w-sm text-white/85">{tHome(`mundos.${m.slug}`)}</p>
            {!tocado && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-white/60"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.8, ease: "linear" }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Pregunta({ p, r }: { p: string; r: string }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display font-semibold text-foreground"
      >
        {p}
        <motion.span animate={{ rotate: abierta ? 45 : 0 }} className="text-2xl leading-none text-primario">
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {abierta && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: SUAVE }} className="overflow-hidden">
            <p className="px-5 pb-4 text-sm text-texto-secundario">{r}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// El panel del docente en miniatura, con barras que crecen: el dibujo de «Colegios».
function MiniPanel() {
  const barras = [38, 62, 45, 80, 70, 92, 58];
  return (
    <motion.div
      aria-hidden="true"
      className="rounded-3xl bg-white/10 p-5 backdrop-blur"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="grid grid-cols-3 gap-2">
        {["28", "24", "86 %"].map((v, i) => (
          <div key={i} className="rounded-xl bg-white/10 px-3 py-2">
            <div className="h-1.5 w-8 rounded-full bg-white/30" />
            <p className="mt-1.5 font-display text-lg font-black">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex h-28 items-end gap-2">
        {barras.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-md bg-[#7DF0C0]"
            initial={{ height: "8%" }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: false }}
            transition={{ duration: 1, delay: i * 0.08, ease: SUAVE }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {[72, 100, 40].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-white/25" />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
              <motion.div className="h-full rounded-full bg-white/70" initial={{ width: 0 }} whileInView={{ width: `${w}%` }} transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: SUAVE }} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function LandingPublica({ onJugar }: { onJugar?: () => void }) {
  const t = useTranslations("Presentacion");
  const locale = useLocale();
  const precios = preciosPresentacion(locale);
  const itemsGratis = t.raw("precios.gratis.items") as string[];
  const itemsPro = t.raw("precios.proItems") as string[];
  const itemsColegio = t.raw("colegios.items") as string[];
  const faq = t.raw("faq.items") as { p: string; r: string }[];

  return (
    <MotionConfig reducedMotion="never">
      <div className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-background">
        <header className="sticky top-[env(safe-area-inset-top,0px)] z-30 border-b border-border/60 bg-background/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <a href="#inicio" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground">
              <Logo size={28} colorAro="#6C4CF1" />
              Prodigia
            </a>
            <nav className="hidden items-center gap-7 text-sm font-medium text-texto-secundario md:flex">
              <a href="#ciudades" className="transition-colors hover:text-foreground">{t("nav.ciudades")}</a>
              <a href="#como" className="transition-colors hover:text-foreground">{t("nav.comoFunciona")}</a>
              <a href="#precios" className="transition-colors hover:text-foreground">{t("nav.precios")}</a>
              <a href="#colegios" className="transition-colors hover:text-foreground">{t("nav.colegios")}</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold text-primario hover:underline" data-prueba="entrar">
                {t("nav.entrar")}
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main id="inicio" className="flex flex-col gap-28 pb-20 sm:gap-36">
          <section className="relative">
            <FondoVivo />
            <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-14 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-24">
              <div className="flex flex-col items-center gap-7 text-center md:items-start md:text-left">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: SUAVE }}
                  className="inline-flex items-center gap-2 rounded-full border border-primario/25 bg-primario/10 px-3.5 py-1.5 text-xs font-semibold text-primario"
                >
                  <motion.span className="h-2 w-2 rounded-full bg-correcto" animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
                  {t("hero.etiqueta")}
                </motion.span>
                <TituloHero texto={t("hero.titulo")} />
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: SUAVE }}
                  className="max-w-lg text-lg text-texto-secundario"
                >
                  {t("hero.subtitulo")}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.65, ease: SUAVE }}
                  className="flex flex-wrap items-center justify-center gap-3 md:justify-start"
                >
                  <BotonJugar onJugar={onJugar} grande>
                    {t("hero.jugar")}
                  </BotonJugar>
                  <Link
                    href="/login"
                    className="rounded-2xl border border-border bg-surface/60 px-6 py-4 font-display text-base font-semibold text-foreground backdrop-blur transition-colors hover:border-primario/50"
                  >
                    {t("hero.yaTengo")}
                  </Link>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                  <Link href="/descargar" className="text-sm font-medium text-texto-secundario underline-offset-4 hover:text-foreground hover:underline">
                    {t("hero.android")}
                  </Link>
                </motion.div>
              </div>
              <Orbita />
            </div>
          </section>

          <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { n: <Contador hasta={MUNDOS_LANDING.length} />, texto: t("cifras.ciudades") },
                { n: <Contador hasta={60} />, texto: t("cifras.segundos") },
                { n: "1 v 1", texto: t("cifras.duelos") },
                { n: <Contador hasta={2} />, texto: t("cifras.plataformas") },
              ].map((c, i) => (
                <Aparece key={c.texto} retraso={i * 0.08} className="rounded-3xl border border-border bg-surface px-5 py-6 text-center">
                  <p className="font-display text-4xl font-black text-foreground">{c.n}</p>
                  <p className="mt-1 text-xs text-texto-secundario">{c.texto}</p>
                </Aparece>
              ))}
            </div>
          </section>

          <section id="ciudades" className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-12 px-4 sm:px-6">
            <Encabezado etiqueta={t("ciudades.etiqueta")} titulo={t("ciudades.titulo")} texto={t("ciudades.texto")} />
            <Aparece>
              <SelectorCiudades />
            </Aparece>
          </section>

          <section id="como" className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-12 px-4 sm:px-6">
            <Encabezado etiqueta={t("como.etiqueta")} titulo={t("como.titulo")} />
            <div className="relative grid gap-6 md:grid-cols-3">
              <motion.div
                aria-hidden="true"
                className="absolute left-[16%] right-[16%] top-10 hidden h-0.5 origin-left bg-gradient-to-r from-primario via-[#06B6D4] to-correcto md:block"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1.2, ease: SUAVE, delay: 0.2 }}
              />
              {(["paso1", "paso2", "paso3"] as const).map((paso, i) => (
                <Aparece key={paso} retraso={0.15 + i * 0.2} className="relative flex flex-col items-center text-center">
                  <motion.span
                    whileHover={{ rotate: -6, scale: 1.08 }}
                    className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primario font-display text-3xl font-black text-white shadow-[0_16px_40px_-14px_color-mix(in_oklab,var(--primario)_85%,transparent)]"
                  >
                    {i + 1}
                  </motion.span>
                  <h3 className="mt-5 font-display text-2xl font-bold text-foreground">{t(`como.${paso}.titulo`)}</h3>
                  <p className="mt-1 text-texto-secundario">{t(`como.${paso}.texto`)}</p>
                </Aparece>
              ))}
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6">
            <Encabezado etiqueta={t("competir.etiqueta")} titulo={t("competir.titulo")} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["rankeds", <IconRango key="r" className="h-6 w-6" />, "#6C4CF1"],
                  ["amigos", <IconJugar key="a" className="h-6 w-6" />, "#06B6D4"],
                  ["clanes", <IconEscudo key="c" className="h-6 w-6" />, "#0E9F6E"],
                  ["retos", <IconLlama key="l" className="h-6 w-6" />, "#FF8A3D"],
                ] as const
              ).map(([clave, icono, color], i) => (
                <Aparece key={clave} retraso={i * 0.08}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group h-full rounded-3xl border border-border bg-surface p-6 transition-shadow hover:shadow-[0_24px_50px_-28px_var(--c)]"
                    style={{ ["--c" as string]: color }}
                  >
                    <motion.span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                      style={{ background: color }}
                      animate={{ rotate: [0, -8, 8, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 3 + i, ease: "easeInOut" }}
                    >
                      {icono}
                    </motion.span>
                    <h3 className="mt-5 font-display text-xl font-bold text-foreground">{t(`competir.${clave}.titulo`)}</h3>
                    <p className="mt-1 text-sm text-texto-secundario">{t(`competir.${clave}.texto`)}</p>
                  </motion.div>
                </Aparece>
              ))}
            </div>
          </section>

          <section id="precios" className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-12 px-4 sm:px-6">
            <Encabezado etiqueta={t("precios.etiqueta")} titulo={t("precios.titulo")} texto={t("precios.texto")} />
            <div className="grid items-stretch gap-4 lg:grid-cols-3">
              <TarjetaPrecio
                retraso={0}
                nombre={t("precios.gratis.nombre")}
                precio={t("precios.gratis.precio")}
                detalle={t("precios.gratis.detalle")}
                items={itemsGratis}
                accion={<BotonJugar onJugar={onJugar}>{t("precios.gratis.boton")}</BotonJugar>}
              />
              <TarjetaPrecio
                retraso={0.1}
                nombre={t("precios.mensual.nombre")}
                precio={t("precios.mensual.precio", { precio: precios.mensual })}
                detalle={t("precios.mensual.detalle")}
                items={itemsPro}
                accion={<BotonPro texto={t("precios.mensual.boton")} />}
              />
              <TarjetaPrecio
                retraso={0.2}
                destacado={t("precios.anual.destacado")}
                nombre={t("precios.anual.nombre")}
                precio={t("precios.anual.precio", { precio: precios.anual })}
                detalle={t("precios.anual.detalle", { ahorro: precios.ahorro })}
                items={itemsPro}
                accion={<BotonPro texto={t("precios.anual.boton")} lleno />}
              />
            </div>
            <p className="text-center text-sm text-texto-secundario">{t("precios.sueltos", { mundo: precios.mundo, minimo: precios.minimo })}</p>
          </section>

          <section id="colegios" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 sm:px-6">
            <Aparece className="relative grid items-center gap-10 overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,#1E1550,#4B32C3_55%,#6C4CF1)] p-8 text-white sm:p-14 md:grid-cols-[1.15fr_1fr]">
              <motion.div
                aria-hidden="true"
                className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#06B6D4]/30 blur-3xl"
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative flex flex-col gap-5">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">{t("colegios.etiqueta")}</p>
                <h2 className="font-display text-3xl font-black leading-tight tracking-tight sm:text-4xl">{t("colegios.titulo")}</h2>
                <p className="text-white/80">{t("colegios.texto")}</p>
                <ul className="flex flex-col gap-2">
                  {itemsColegio.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-white/90">
                      <IconCheck className="h-4 w-4 shrink-0 text-[#7DF0C0]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/docentes"
                  className="mt-2 w-fit rounded-2xl bg-white px-6 py-3 font-display font-bold text-[#2A1E6B] transition-transform hover:-translate-y-0.5"
                  data-prueba="colegios"
                >
                  {t("colegios.boton")}
                </Link>
              </div>
              <div className="relative">
                <MiniPanel />
              </div>
            </Aparece>
          </section>

          <section className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 sm:px-6">
            <Encabezado etiqueta={t("faq.etiqueta")} titulo={t("faq.titulo")} />
            <div className="flex flex-col gap-3">
              {faq.map((f, i) => (
                <Aparece key={f.p} retraso={i * 0.05} desde={12}>
                  <Pregunta p={f.p} r={f.r} />
                </Aparece>
              ))}
            </div>
          </section>

          <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 text-center sm:px-6">
            <motion.div animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
              <Logo size={64} colorAro="#6C4CF1" />
            </motion.div>
            <Aparece>
              <h2 className="font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">{t("final.titulo")}</h2>
              <p className="mt-3 text-texto-secundario">{t("final.texto")}</p>
            </Aparece>
            <BotonJugar onJugar={onJugar} grande>
              {t("final.boton")}
            </BotonJugar>
          </section>
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 py-8 text-sm text-texto-secundario md:flex-row sm:px-6">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <MamutHerdSello alto={24} />
              <span className="text-xs">{t("pie.hecho")}</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <Link href="/docentes" className="hover:text-foreground">{t("pie.docentes")}</Link>
              <Link href="/descargar" className="hover:text-foreground">{t("pie.descargar")}</Link>
              <Link href="/privacidad" className="hover:text-foreground">{t("pie.privacidad")}</Link>
              <Link href="/terminos" className="hover:text-foreground">{t("pie.terminos")}</Link>
              <span>prodigia.oficial@gmail.com</span>
            </nav>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}

function BotonPro({ texto, lleno }: { texto: string; lleno?: boolean }) {
  return (
    <Link
      href="/pro"
      className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 font-display font-bold transition-transform hover:-translate-y-0.5 ${
        lleno ? "bg-primario text-white" : "border border-primario/40 text-primario"
      }`}
    >
      {texto}
    </Link>
  );
}

function TarjetaPrecio({
  nombre,
  precio,
  detalle,
  items,
  accion,
  destacado,
  retraso,
}: {
  nombre: string;
  precio: string;
  detalle: string;
  items: string[];
  accion: ReactNode;
  destacado?: string;
  retraso: number;
}) {
  return (
    <Aparece retraso={retraso} className="h-full">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className={`relative flex h-full flex-col gap-6 rounded-3xl border bg-surface p-7 ${
          destacado ? "border-primario shadow-[0_28px_60px_-30px_color-mix(in_oklab,var(--primario)_80%,transparent)]" : "border-border"
        }`}
      >
        {destacado && (
          <motion.span
            className="absolute -top-3 left-7 rounded-full bg-primario px-3 py-1 text-xs font-bold text-white"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {destacado}
          </motion.span>
        )}
        <div>
          <p className="font-display text-lg font-bold text-foreground">{nombre}</p>
          <p className="mt-3 font-display text-5xl font-black tracking-tight text-foreground">{precio}</p>
          <p className="mt-1 text-sm text-texto-secundario">{detalle}</p>
        </div>
        <ul className="flex flex-1 flex-col gap-2.5">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
              <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-correcto" />
              {item}
            </li>
          ))}
        </ul>
        {accion}
      </motion.div>
    </Aparece>
  );
}
