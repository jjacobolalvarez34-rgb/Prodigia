"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Boton from "@/components/Boton";
import Avatar from "@/components/Avatar";
import EstandarteClan from "@/components/clanes/EstandarteClan";

export interface MiClan {
  clan_id: string;
  nombre: string;
  tag: string | null;
  color_estandarte: string;
  descripcion: string;
  rol: "lider" | "miembro";
  cantidad_miembros: number;
  nivel_clan: number;
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
  rol: "lider" | "miembro";
  chispas_semana: number;
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

const COLORES_PRESET = ["#6C4CF1", "#0E9F6E", "#1E7A8C", "#C026D3", "#FF8A3D", "#3FB88B", "#FFC53D", "#FF6B6B"];

interface Props {
  miClanInicial: MiClan | null;
  miembrosIniciales: Miembro[];
  misionInicial: Mision | null;
  rankingInicial: ClanRanking[];
}

export default function ClanesClient({ miClanInicial, miembrosIniciales, misionInicial, rankingInicial }: Props) {
  const [miClan, setMiClan] = useState(miClanInicial);
  const [miembros, setMiembros] = useState(miembrosIniciales);
  const [mision, setMision] = useState(misionInicial);
  const [ranking] = useState(rankingInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function recargarMiClan() {
    const supabase = createClient();
    const { data } = await supabase.rpc("mi_clan");
    const fila = (data as MiClan[] | null)?.[0] ?? null;
    setMiClan(fila);
    if (fila) {
      await supabase.rpc("asegurar_mision_semanal", { p_clan_id: fila.clan_id });
      const [{ data: miembrosRows }, { data: misionRows }] = await Promise.all([
        supabase.rpc("miembros_de_clan", { p_clan_id: fila.clan_id }),
        supabase.rpc("mision_actual_de_clan", { p_clan_id: fila.clan_id }),
      ]);
      setMiembros((miembrosRows as Miembro[] | null) ?? []);
      setMision((misionRows as Mision[] | null)?.[0] ?? null);
    } else {
      setMiembros([]);
      setMision(null);
    }
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
        <MiClanView clan={miClan} miembros={miembros} mision={mision} onSalir={salirDelClan} cargando={cargando} />
      ) : (
        <SinClanView onUnido={recargarMiClan} onCreado={recargarMiClan} />
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
  onSalir,
  cargando,
}: {
  clan: MiClan;
  miembros: Miembro[];
  mision: Mision | null;
  onSalir: () => void;
  cargando: boolean;
}) {
  const progresoPct = mision ? Math.min(100, Math.round((mision.progreso_actual / mision.objetivo_cantidad) * 100)) : 0;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-4 rounded-2xl border-2 px-6 py-6" style={{ borderColor: `${clan.color_estandarte}55` }}>
        <EstandarteClan color={clan.color_estandarte} nivel={clan.nivel_clan} size={72} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-bold text-foreground">
            {clan.nombre} {clan.tag && <span className="text-texto-secundario">[{clan.tag}]</span>}
          </p>
          <p className="mt-1 text-sm text-texto-secundario">{clan.descripcion}</p>
          <p className="mt-1 text-xs text-texto-secundario">
            Nivel {clan.nivel_clan} · {clan.cantidad_miembros} {clan.cantidad_miembros === 1 ? "miembro" : "miembros"} ·{" "}
            {clan.rol === "lider" ? "Sos el líder" : "Miembro"}
          </p>
        </div>
      </div>

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
          <Link
            key={m.user_id}
            href={`/perfil/${m.user_id}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 hover:border-primario/40"
          >
            <Avatar url={m.avatar_url} nombre={m.display_name} size={32} />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              {m.display_name ?? "Jugador"}
              {m.rol === "lider" && <span className="ml-1.5 text-xs text-logro">★ líder</span>}
            </span>
            <span className="font-mono text-xs text-texto-secundario">{m.chispas_semana} Exp esta semana</span>
          </Link>
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

function SinClanView({ onUnido, onCreado }: { onUnido: () => void; onCreado: () => void }) {
  const [tab, setTab] = useState<"buscar" | "crear">("buscar");
  const [consulta, setConsulta] = useState("");
  const [resultados, setResultados] = useState<ClanBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [uniendoId, setUniendoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex w-fit gap-1 rounded-full border border-border bg-surface p-1">
        {(["buscar", "crear"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t ? "bg-primario text-white" : "text-texto-secundario hover:text-foreground"
            }`}
          >
            {t === "buscar" ? "Buscar / unirme" : "Crear un clan"}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      {tab === "buscar" ? (
        <div className="flex flex-col gap-3">
          <input
            value={consulta}
            onChange={(e) => buscar(e.target.value)}
            placeholder="Buscar clan por nombre..."
            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none focus:border-primario"
          />
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
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-5 py-5">
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
          <Boton onClick={crear} cargando={creando} className="w-fit">
            Crear clan
          </Boton>
        </div>
      )}
    </section>
  );
}
