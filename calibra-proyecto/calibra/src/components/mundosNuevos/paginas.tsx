import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { bloquearInvitado, requireMundoDinamia, requireMundoVitalia, requireUsuario } from "@/lib/auth/guard";
import { CONFIG_MUNDOS_NUEVOS, type SlugMundoNuevo } from "@/lib/mundosNuevos/config";
import { cargarPracticaMundoNuevo } from "@/lib/mundosNuevos/cargarPractica";
import { obtenerCaminoPorTema } from "@/lib/aprender/caminoPorTema";
import { hrefVolverAAprender, partirCaminoPorClases, resolverPestanaInicial } from "@/lib/aprender/clases";
import { agruparNodos } from "@/lib/aprender/grupos";
import type { SincronizarProgresoRow } from "@/lib/mundos/progresoNivel";
import Header from "@/components/Header";
import FondoMundo from "@/components/FondoMundo";
import FondoCursorMundo from "@/components/FondoCursorMundo";
import TopicCard from "@/components/TopicCard";
import NivelMundoBadge from "@/components/NivelMundoBadge";
import NivelMundoProgreso from "@/components/NivelMundoProgreso";
import AvisoPrimeraVez from "@/components/AvisoPrimeraVez";
import AprenderTabs from "@/components/AprenderTabs";
import type { UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import { IconCheck } from "@/components/icons";
import PracticaMundoClient from "./PracticaMundoClient";
import DiagnosticoMundoClient from "./DiagnosticoMundoClient";
import LeccionMundoClient from "./LeccionMundoClient";

// Páginas de los mundos 14 y 15 (Dinamia y Vitalia). Cada ruta de
// src/app/[locale]/<mundo>/ es un archivo corto que llama a una de estas con su
// slug: lo propio de cada mundo vive en src/lib/mundosNuevos/config.ts y en su
// namespace de traducciones.

const REQUIRE = { dinamia: requireMundoDinamia, vitalia: requireMundoVitalia };

const tipos = (slug: SlugMundoNuevo) => CONFIG_MUNDOS_NUEVOS[slug].modos.map((m) => `${slug}_${m}`);

export async function metadataMundo(slug: SlugMundoNuevo, que: "hub" | "elegir" | "aprender" | "diagnostico" | { modo: string }): Promise<Metadata> {
  const tm = await getTranslations(CONFIG_MUNDOS_NUEVOS[slug].ns);
  const t = await getTranslations("MundoNuevo");
  if (que === "hub") return { title: tm("metadata.title"), description: tm("metadata.description") };
  if (que === "elegir") return { title: `${t("elegir.metadata.title")} · ${tm("nombreMundo")}`, description: t("elegir.metadata.description") };
  if (que === "aprender") return { title: tm("aprenderMetadata.title"), description: tm("aprenderMetadata.description") };
  if (que === "diagnostico") return { title: `${t("diagnostico.introTitulo")} · ${tm("nombreMundo")}`, description: tm("diagnosticoIntro") };
  if (!CONFIG_MUNDOS_NUEVOS[slug].modos.includes(que.modo)) return { title: tm("nombreMundo") };
  return { title: `${tm(`modos.${que.modo}`)} · ${tm("nombreMundo")}`, description: tm(`descripciones.${que.modo}`) };
}

function tarjeta(color: string) {
  return {
    borderColor: `color-mix(in oklab, ${color} 35%, transparent)`,
    background: `color-mix(in oklab, ${color} 7%, var(--surface))`,
  };
}

export async function PaginaHubMundo({ slug }: { slug: SlugMundoNuevo }) {
  const cfg = CONFIG_MUNDOS_NUEVOS[slug];
  const tm = await getTranslations(cfg.ns);
  const t = await getTranslations("MundoNuevo.hub");
  const supabase = await createClient();
  const { user, profile } = await REQUIRE[slug](supabase, `/${slug}`);

  const hoyIso = new Date().toISOString().slice(0, 10);
  const [{ data: nivelRows }, { data: dailyHoy }, { data: mundoProgreso }] = await Promise.all([
    supabase.from("skill_levels").select("problem_type, nivel").eq("user_id", user.id).in("problem_type", tipos(slug)),
    supabase.from("daily_progress").select("xp_ganado").eq("user_id", user.id).eq("fecha", hoyIso).maybeSingle(),
    supabase.rpc("sincronizar_progreso_mundo", { p_world: slug }).returns<SincronizarProgresoRow[]>().maybeSingle(),
  ]);
  const nivelDe = (modo: string) => nivelRows?.find((r) => r.problem_type === `${slug}_${modo}`)?.nivel ?? 1;
  const nivelMundo = mundoProgreso?.nivel_mundo ?? 1;
  const metaCumplidaHoy = (dailyHoy?.xp_ganado ?? 0) >= (profile.meta_xp_diaria ?? 500);
  const Icono = cfg.Icono;

  return (
    <>
      <FondoMundo mundo={slug} />
      <FondoCursorMundo mundo={slug} />
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
        <AvisoPrimeraVez avisoKey={`${slug}-intro`} texto={tm("aviso")}>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: cfg.color }}>
              {tm("nombreMundo")}
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{tm("titulo")}</h1>
            <div className="mt-2">
              <NivelMundoBadge nombreMundo={tm("nombreMundo")} nivel={nivelMundo} colorHex={cfg.color} />
            </div>
          </div>
        </AvisoPrimeraVez>

        <NivelMundoProgreso
          nombreMundo={tm("nombreMundo")}
          colorHex={cfg.color}
          progreso={{
            puntos: mundoProgreso?.puntos_mundo ?? 0,
            nivel: nivelMundo,
            fracVolumen: mundoProgreso?.frac_volumen ?? 0,
            fracDominio: mundoProgreso?.frac_dominio ?? 0,
            fracLecciones: mundoProgreso?.frac_lecciones ?? 0,
          }}
        />

        {metaCumplidaHoy && (
          <div className="flex items-center gap-3 rounded-2xl bg-correcto/10 px-5 py-4">
            <IconCheck className="h-5 w-5 shrink-0 text-correcto" />
            <p className="text-sm font-medium text-foreground">{t("metaCumplida")}</p>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          {[
            { href: `/${slug}/elegir`, titulo: t("practicar"), texto: tm("practicarDescripcion") },
            { href: `/${slug}/aprender`, titulo: t("aprenderCard"), texto: tm("aprenderDescripcion") },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="group flex flex-col gap-3 rounded-2xl border-2 px-6 py-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" style={tarjeta(cfg.color)}>
              <span className="flex h-11 w-11 items-center justify-center rounded-full text-white" style={{ background: cfg.color }}>
                <Icono className="h-5 w-5" />
              </span>
              <div>
                <span className="font-display text-xl font-bold text-foreground">{c.titulo}</span>
                <p className="mt-1 text-sm text-texto-secundario">{c.texto}</p>
              </div>
            </Link>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold text-foreground">{t("modosTitulo")}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {cfg.modos.map((m) => (
              <TopicCard key={m} nombre={tm(`modos.${m}`)} Icono={Icono} badge={{ tipo: "nivel", nivel: nivelDe(m) }} colorHex={cfg.color} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export async function PaginaElegirMundo({ slug }: { slug: SlugMundoNuevo }) {
  const cfg = CONFIG_MUNDOS_NUEVOS[slug];
  const tm = await getTranslations(cfg.ns);
  const t = await getTranslations("MundoNuevo.elegir");
  const supabase = await createClient();
  const { user } = await REQUIRE[slug](supabase, `/${slug}/elegir`);
  const { data: nivelRows } = await supabase.from("skill_levels").select("problem_type, nivel").eq("user_id", user.id).in("problem_type", tipos(slug));
  const nivelDe = (modo: string) => nivelRows?.find((r) => r.problem_type === `${slug}_${modo}`)?.nivel ?? 1;
  const Icono = cfg.Icono;

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
          <p className="mt-2 text-sm text-texto-secundario">{t("subtitulo")}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cfg.modos.map((m) => (
            <Link
              key={m}
              href={`/${slug}/practica/${m}`}
              className="flex items-center gap-4 rounded-2xl border-2 border-border bg-surface px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primario/40 hover:shadow-lg"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white" style={{ background: cfg.color }}>
                <Icono className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-foreground">{tm(`modos.${m}`)}</p>
                <p className="text-xs text-texto-secundario">{tm(`descripciones.${m}`)}</p>
              </div>
              <LevelDial nivel={nivelDe(m)} size={44} mostrarEtiqueta={false} colorHex={cfg.color} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export async function PaginaPracticaMundo({ slug, modo, duelo }: { slug: SlugMundoNuevo; modo: string; duelo?: string }) {
  const cfg = CONFIG_MUNDOS_NUEVOS[slug];
  if (!cfg.modos.includes(modo)) notFound();
  const supabase = await createClient();
  const { user } = await REQUIRE[slug](supabase, `/${slug}/practica/${modo}`, Boolean(duelo));
  const datos = await cargarPracticaMundoNuevo(supabase, slug, user.id, modo, duelo);
  return (
    <>
      <Header autenticado />
      <PracticaMundoClient
        slug={slug}
        modo={datos.modo}
        nivelInicial={datos.nivelInicial}
        escudosExtra={datos.escudosExtra}
        hielosDisponibles={datos.hielosDisponibles}
        tiemposExtraDisponibles={datos.tiemposExtraDisponibles}
        boostActivo={datos.boostActivo}
        duelo={datos.dueloInfo}
        miUserId={user.id}
      />
    </>
  );
}

export async function PaginaDiagnosticoMundo({ slug, next }: { slug: SlugMundoNuevo; next?: string }) {
  const supabase = await createClient();
  const { profile } = await requireUsuario(supabase, `/${slug}/diagnostico`);
  const destino = next ?? `/${slug}`;
  if ((profile as unknown as Record<string, unknown>)[`onboarding_${slug}_completado`]) redirect(destino);
  return (
    <>
      <Header autenticado />
      <DiagnosticoMundoClient slug={slug} destino={destino} />
    </>
  );
}

export async function PaginaAprenderMundo({ slug, tab }: { slug: SlugMundoNuevo; tab?: string | string[] }) {
  const cfg = CONFIG_MUNDOS_NUEVOS[slug];
  const tm = await getTranslations(cfg.ns);
  const t = await getTranslations("MundoNuevo.aprender");
  const locale = await getLocale();
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, `/${slug}/aprender`);
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const esPro = profile.plan === "pro";
  const nodos = await obtenerCaminoPorTema(slug, supabase, user.id, esPro);
  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;
  const { tecnicas, clases, hayClases } = partirCaminoPorClases(nodos);
  const proHref = `/pro?next=${encodeURIComponent(`/${slug}/aprender?tab=clases`)}`;
  const unidad = (lista: typeof tecnicas, pestana: "tecnicas" | "clases"): UnidadCaminoGenerico[] =>
    agruparNodos(lista, slug, pestana, locale).map((g) => ({
      id: g.id,
      nombre: g.nombre,
      nodos: g.nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado, ctaPro: n.bloqueadoPorPlan ? { label: t("clases.desbloqueaConPro"), href: proHref } : undefined })),
    }));

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderTabs
          titulo={`${t("titulo")} · ${tm("nombreMundo")}`}
          subtitulo={tm("aprenderSubtitulo")}
          progresoLabel={t("progreso")}
          progresoTexto={t("tecnicas", { n: totalDominadas, total: nodos.length })}
          colorHex={cfg.color}
          basePath={`/${slug}/aprender`}
          tecnicas={unidad(tecnicas, "tecnicas")}
          clases={hayClases ? unidad(clases, "clases") : null}
          esPro={esPro}
          proHref={proHref}
          defaultTab={resolverPestanaInicial(tab, hayClases)}
        />
      </div>
    </>
  );
}

export async function PaginaLeccionMundo({ slug, leccion }: { slug: SlugMundoNuevo; leccion: string }) {
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, `/${slug}/aprender/${leccion}`);
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const nodos = await obtenerCaminoPorTema(slug, supabase, user.id, profile.plan === "pro");
  const nodo = nodos.find((n) => n.slug === leccion);
  if (!nodo) notFound();
  if (nodo.estado === "bloqueado") redirect(hrefVolverAAprender(`/${slug}/aprender`, nodo.requierePro));
  return (
    <>
      <Header autenticado />
      <LeccionMundoClient slug={slug} nodo={nodo} />
    </>
  );
}
