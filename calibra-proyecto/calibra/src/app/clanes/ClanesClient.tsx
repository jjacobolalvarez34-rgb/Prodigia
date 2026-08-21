"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Boton from "@/components/Boton";
import Avatar from "@/components/Avatar";
import EstandarteClan from "@/components/clanes/EstandarteClan";
import EscenaCiudad from "@/components/clanes/EscenaCiudad";

type Rol = "fundador" | "guia" | "miembro";

const NOMBRE_ROL: Record<Rol, string> = { fundador: "Fundador", guia: "Guía", miembro: "Miembro" };
const COSTO_CREAR_CLAN = 5000;

export interface MiClan {
  clan_id: string;
  nombre: string;
  tag: string | null;
  color_estandarte: string;
  descripcion: string;
  rol: Rol;
  cantidad_miembros: number;
  nivel_clan: number;
  guerras_ganadas: number;
}

export interface ClanRanking {
  clan_id: string;
  nombre: string;
  tag: string | null;
  color_estandarte: string;
  xp_semana: number;
  cantidad_miembros: number;
  nivel_clan: number;
}

export interface ClanBusqueda {
  id: string;
  nombre: string;
  tag: string | null;
  color_estandarte: string;
  descripcion: string;
  cantidad_miembros: number;
}

export interface Miembro {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  rol: Rol;
  chispas_semana: number;
  xp_aportado: number;
  unido_at: string;
}

export interface Mision {
  id: string;
  objetivo_cantidad: number;
  progreso_actual: number;
  recompensa_chispas: number;
  completada: boolean;
  semana_inicio: string;
}

export interface RivalClan {
  clan_id: string;
  nombre: string;
  tag: string | null;
  color_estandarte: string;
  xp_semana: number;
  mi_xp_semana: number;
}

const COLORES_PRESET = ["#6C4CF1", "#0E9F6E", "#1E7A8C", "#C026D3", "#FF8A3D", "#3FB88B", "#FFC53D", "#FF6B6B"];

interface Props {
  miClanInicial: MiClan | null;
  miembrosIniciales: Miembro[];
  misionInicial: Mision | null;
  rankingInicial: ClanRanking[];
  rivalInicial: RivalClan | null;
  miUserId: string;
  misChispas: number;
}

export default function ClanesClient({
  miClanInicial,
  miembrosIniciales,
  misionInicial,
  rankingInicial,
  rivalInicial,
  miUserId,
  misChispas,
}: Props) {
  const [miClan, setMiClan] = useState(miClanInicial);
  const [miembros, setMiembros] = useState(miembrosIniciales);
  const [mision, setMision] = useState(misionInicial);
  const [rival, setRival] = useState(rivalInicial);
  const [ranking] = useState(rankingInicial);
  const [chispas, setChispas] = useState(misChispas);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function recargarMiClan() {
    const supabase = createClient();
    const { data } = await supabase.rpc("mi_clan");
    const fila = (data as MiClan[] | null)?.[0] ?? null;
    setMiClan(fila);
    if (fila) {
      await supabase.rpc("asegurar_mision_semanal", { p_clan_id: fila.clan_id });
      const [{ data: miembrosRows }, { data: misionRows }, { data: rivalRows }] = await Promise.all([
        supabase.rpc("miembros_de_clan", { p_clan_id: fila.clan_id }),
        supabase.rpc("mision_actual_de_clan", { p_clan_id: fila.clan_id }),
        supabase.rpc("rival_de_clan", { p_clan_id: fila.clan_id }),
      ]);
      setMiembros((miembrosRows as Miembro[] | null) ?? []);
      setMision((misionRows as Mision[] | null)?.[0] ?? null);
      setRival((rivalRows as RivalClan[] | null)?.[0] ?? null);
    } else {
      setMiembros([]);
      setMision(null);
      setRival(null);
    }
    const { data: perfil } = await supabase.from("profiles").select("puntos_total").eq("id", miUserId).single();
    if (perfil) setChispas(perfil.puntos_total);
  }

  async function salirDelClan() {
    if (!confirm("¿Seguro que querés salir de tu clan?")) return;
    setCargando(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.rpc("salir_del_clan");
    setCargando(false);
    if (err) {
      setError(err.message);
      return;
    }
    await recargarMiClan();
  }

  async function cambiarRol(userId: string, nuevoRol: "guia" | "miembro") {
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.rpc("cambiar_rol_miembro", { p_user_id: userId, p_nuevo_rol: nuevoRol });
    if (err) {
      setError(err.message);
      return;
    }
    if (miClan) {
      const { data } = await supabase.rpc("miembros_de_clan", { p_clan_id: miClan.clan_id });
      setMiembros((data as Miembro[] | null) ?? []);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Clanes</h1>
        <p className="mt-1 text-sm text-texto-secundario">
          Sumate a un grupo, cumplan misiones semanales en equipo y compitan en la guerra de clanes.
        </p>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      {miClan ? (
        <MiClanView
          clan={miClan}
          miembros={miembros}
          mision={mision}
          rival={rival}
          miUserId={miUserId}
          onSalir={salirDelClan}
          onCambiarRol={cambiarRol}
          cargando={cargando}
        />
      ) : (
        <SinClanView onUnido={recargarMiClan} onCreado={recargarMiClan} misChispas={chispas} />
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-foreground">Guerra de clanes — esta semana</h2>
        {ranking.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-texto-secundario">
            Todavía ningún clan sumó Experiencia esta semana — sé el primero.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {ranking.map((c, i) => (
              <div key={c.clan_id} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                <span className="w-6 shrink-0 text-center font-mono text-sm font-bold text-texto-secundario">{i + 1}</span>
                <EstandarteClan color={c.color_estandarte} nivel={c.nivel_clan} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {c.nombre} {c.tag && <span className="text-texto-secundario">[{c.tag}]</span>}
                  </p>
                  <p className="text-xs text-texto-secundario">{c.cantidad_miembros} miembros</p>
                </div>
                <span className="font-mono text-sm font-bold text-foreground">{c.xp_semana} Exp</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MiClanView({
  clan,
  miembros,
  mision,
  rival,
  miUserId,
  onSalir,
  onCambiarRol,
  cargando,
}: {
  clan: MiClan;
  miembros: Miembro[];
  mision: Mision | null;
  rival: RivalClan | null;
  miUserId: string;
  onSalir: () => void;
  onCambiarRol: (userId: string, nuevoRol: "guia" | "miembro") => void;
  cargando: boolean;
}) {
  const progresoPct = mision ? Math.min(100, Math.round((mision.progreso_actual / mision.objetivo_cantidad) * 100)) : 0;
  const soyFundador = clan.rol === "fundador";

  return (
    <section className="flex flex-col gap-5">
      <EscenaCiudad nivelClan={clan.nivel_clan} colorEstandarte={clan.color_estandarte} className="h-44 w-full" />

      <div className="flex items-center gap-4 rounded-2xl border-2 px-6 py-6" style={{ borderColor: `${clan.color_estandarte}55` }}>
        <EstandarteClan color={clan.color_estandarte} nivel={clan.nivel_clan} size={72} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-bold text-foreground">
            {clan.nombre} {clan.tag && <span className="text-texto-secundario">[{clan.tag}]</span>}
          </p>
          <p className="mt-1 text-sm text-texto-secundario">{clan.descripcion}</p>
          <p className="mt-1 text-xs text-texto-secundario">
            Nivel {clan.nivel_clan} · {clan.cantidad_miembros} {clan.cantidad_miembros === 1 ? "miembro" : "miembros"} · Sos{" "}
            {NOMBRE_ROL[clan.rol]}
            {clan.guerras_ganadas > 0 && (
              <> · 🏆 {clan.guerras_ganadas} {clan.guerras_ganadas === 1 ? "guerra ganada" : "guerras ganadas"}</>
            )}
          </p>
        </div>
      </div>

      <Link href="/clanes/mundo" className="w-fit text-xs font-semibold text-primario hover:underline">
        🗺️ Ver el Mundo de Clanes
      </Link>

      {rival && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-5 py-4">
          <div className="flex-1 text-center">
            <p className="text-xs uppercase tracking-wide text-texto-secundario">Tu clan</p>
            <p className="font-mono text-lg font-bold text-foreground">{rival.mi_xp_semana}</p>
          </div>
          <span className="text-xs font-semibold uppercase text-texto-secundario">vs</span>
          <div className="flex-1 text-center">
            <p className="truncate text-xs uppercase tracking-wide text-texto-secundario">
              {rival.nombre} {rival.tag && `[${rival.tag}]`}
            </p>
            <p className="font-mono text-lg font-bold text-foreground">{rival.xp_semana}</p>
          </div>
        </div>
      )}

      {mision && (
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Misión de la semana</h3>
            <span className="text-xs text-texto-secundario">+{mision.recompensa_chispas} Chispas para todos</span>
          </div>
          <p className="text-xs text-texto-secundario">
            Resolver {mision.objetivo_cantidad} problemas entre todo el clan — {mision.progreso_actual}/{mision.objetivo_cantidad}
          </p>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-foreground/10">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progresoPct}%`, background: mision.completada ? "var(--correcto)" : clan.color_estandarte }}
            />
          </div>
          {mision.completada && <p className="text-xs font-semibold text-correcto">¡Misión cumplida! Chispas repartidas.</p>}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground">Miembros</h3>
        {miembros.map((m) => (
          <div key={m.user_id} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5">
            <Link href={`/perfil/${m.user_id}`} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80">
              <Avatar url={m.avatar_url} nombre={m.display_name} size={32} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {m.display_name ?? "Jugador"}
                {m.rol !== "miembro" && (
                  <span className={`ml-1.5 text-xs ${m.rol === "fundador" ? "text-logro" : "text-primario"}`}>
                    {m.rol === "fundador" ? "★ Fundador" : "Guía"}
                  </span>
                )}
              </span>
            </Link>
            <span className="shrink-0 font-mono text-xs text-texto-secundario" title="Aporte histórico al clan">
              {m.xp_aportado} Exp aportada
            </span>
            {soyFundador && m.user_id !== miUserId && (
              <button
                onClick={() => onCambiarRol(m.user_id, m.rol === "guia" ? "miembro" : "guia")}
                className="shrink-0 rounded-lg border border-border px-2 py-1 text-[10px] font-medium text-texto-secundario hover:text-foreground"
              >
                {m.rol === "guia" ? "Bajar a Miembro" : "Nombrar Guía"}
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onSalir}
        disabled={cargando}
        className="w-fit text-xs font-medium text-texto-secundario hover:text-error disabled:opacity-50"
      >
        Salir del clan
      </button>
    </section>
  );
}

function SinClanView({
  onUnido,
  onCreado,
  misChispas,
}: {
  onUnido: () => void;
  onCreado: () => void;
  misChispas: number;
}) {
  const [consulta, setConsulta] = useState("");
  const [resultados, setResultados] = useState<ClanBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [uniendoId, setUniendoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [crearAbierto, setCrearAbierto] = useState(false);

  const [nombre, setNombre] = useState("");
  const [tag, setTag] = useState("");
  const [color, setColor] = useState(COLORES_PRESET[0]);
  const [descripcion, setDescripcion] = useState("");
  const [creando, setCreando] = useState(false);

  async function buscar(q: string) {
    setConsulta(q);
    setBuscando(true);
    const supabase = createClient();
    const { data } = await supabase.rpc("buscar_clanes", { p_query: q });
    setBuscando(false);
    setResultados((data as ClanBusqueda[] | null) ?? []);
  }

  async function unirse(id: string) {
    setUniendoId(id);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.rpc("unirse_a_clan", { p_clan_id: id });
    setUniendoId(null);
    if (err) {
      setError(err.message);
      return;
    }
    onUnido();
  }

  async function crear() {
    if (nombre.trim().length < 3) {
      setError("El nombre necesita al menos 3 caracteres.");
      return;
    }
    if (misChispas < COSTO_CREAR_CLAN) {
      setError(`Te faltan Chispas: crear un clan cuesta ${COSTO_CREAR_CLAN} (tenés ${misChispas}).`);
      return;
    }
    setCreando(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.rpc("crear_clan", {
      p_nombre: nombre,
      p_tag: tag,
      p_color: color,
      p_descripcion: descripcion,
    });
    setCreando(false);
    if (err) {
      setError(err.message);
      return;
    }
    onCreado();
  }

  return (
    <section className="flex flex-col gap-4">
      <Link href="/clanes/mundo" className="w-fit text-xs font-semibold text-primario hover:underline">
        🗺️ Ver el Mundo de Clanes
      </Link>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-foreground">Buscar un clan</p>
        <input
          value={consulta}
          onChange={(e) => buscar(e.target.value)}
          placeholder="Buscar clan por nombre..."
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none focus:border-primario"
        />
        {error && <p className="text-sm text-error">{error}</p>}
        {buscando && <p className="text-xs text-texto-secundario">Buscando…</p>}
        {!buscando && consulta.trim().length > 0 && resultados.length === 0 && (
          <p className="text-xs text-texto-secundario">No encontramos ningún clan con ese nombre.</p>
        )}
        {resultados.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
            <EstandarteClan color={c.color_estandarte} nivel={1} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {c.nombre} {c.tag && <span className="text-texto-secundario">[{c.tag}]</span>}
              </p>
              <p className="truncate text-xs text-texto-secundario">
                {c.cantidad_miembros} miembros · {c.descripcion}
              </p>
            </div>
            <Boton onClick={() => unirse(c.id)} cargando={uniendoId === c.id} className="shrink-0 px-4 py-2 text-xs">
              Unirme
            </Boton>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        <button
          onClick={() => setCrearAbierto((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <span className="text-sm font-semibold text-foreground">
            Crear un clan <span className="font-normal text-texto-secundario">— {COSTO_CREAR_CLAN} Chispas</span>
          </span>
          <span className="text-texto-secundario">{crearAbierto ? "−" : "+"}</span>
        </button>
        {crearAbierto && (
          <div className="flex flex-col gap-3 border-t border-border px-5 py-5">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del clan"
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primario"
            />
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value.toUpperCase().slice(0, 5))}
              placeholder="Tag corto (opcional, ej. PRD)"
              className="w-40 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primario"
            />
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción (opcional)"
              rows={2}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primario"
            />
            <div className="flex items-center gap-2">
              {COLORES_PRESET.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-8 w-8 rounded-full transition-transform"
                  style={{
                    background: c,
                    transform: color === c ? "scale(1.1)" : undefined,
                    boxShadow: color === c ? `0 0 0 2px var(--surface), 0 0 0 4px ${c}` : undefined,
                  }}
                  aria-label={`Elegir color ${c}`}
                />
              ))}
            </div>
            <p className="text-xs text-texto-secundario">
              Tenés {misChispas} Chispas {misChispas < COSTO_CREAR_CLAN && "— no te alcanza todavía"}
            </p>
            <Boton onClick={crear} cargando={creando} disabled={misChispas < COSTO_CREAR_CLAN} className="w-fit">
              Crear clan
            </Boton>
          </div>
        )}
      </div>
    </section>
  );
}
