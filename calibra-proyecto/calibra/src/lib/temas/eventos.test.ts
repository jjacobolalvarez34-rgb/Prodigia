import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOGO_NUEVO } from "@/lib/recompensas/catalogo";
import { inicioEventoMs, rangosDelAnio } from "./calendario";
import { CHISPAS_POR_FICHA, COLECCIONES, EXP_POR_FICHA, FICHAS_MAX_DIA, FONDOS_EVENTO, MARCOS_EVENTO, piezasDeEventos, slugEvento } from "./colecciones";
import { LUGARES_HUEVOS, METAS_MINIEVENTOS, METAS_PI, ofertasEstelaresDe } from "./minieventos";
import { TEMAS } from "./temas";

// La migración 0289 (motor de eventos y colección de Halloween) se GENERA desde
// colecciones.ts y calendario.ts. Para regenerarla:
// EVENTOS_ESCRIBIR_SQL=1 npx vitest run src/lib/temas/eventos.test.ts
const MIGRACIONES = path.resolve(__dirname, "../../../supabase/migrations");
const ARCHIVO = path.join(MIGRACIONES, "0289_eventos_y_halloween.sql");
const sql = (s: string) => `'${s.replace(/'/g, "''")}'`;

// Los valores permitidos vigentes (0275) más los de las colecciones.
function listaDe0275(columna: "marco_perfil" | "fondo_perfil"): string[] {
  const texto = fs.readFileSync(path.join(MIGRACIONES, "0275_tienda_ampliada_mas_cosmeticos.sql"), "utf8");
  const m = texto.match(new RegExp(`check \\(${columna} in \\(([^)]*)\\)\\)`));
  return m![1].split(",").map((x) => x.trim().replace(/^'|'$/g, ""));
}

// Eventos programados: los de este año y el que viene que tienen colección. `migracion`:
// solo los de las colecciones de esa migración (sin ella, los de 0289).
function eventosProgramados(migracion?: string, anios = [2026, 2027]) {
  return anios.flatMap((anio) =>
    rangosDelAnio(anio)
      .filter((r) => COLECCIONES[r.id] && COLECCIONES[r.id]!.migracion === migracion && r.desde.startsWith(String(anio)))
      .map((r) => ({
        slug: slugEvento(r.id, r.desde),
        tema: r.id,
        desde: r.desde,
        hasta: r.hasta,
        cierre: new Date(Date.parse(`${r.hasta}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10),
        inicio: new Date(inicioEventoMs(r)).toISOString().replace("T", " ").replace(".000Z", "+00"),
      }))
  );
}

function anuncioDe(e: ReturnType<typeof eventosProgramados>[number]): string {
  const t = TEMAS[e.tema];
  const c = COLECCIONES[e.tema]!;
  const titulo = `Evento: ${t.nombre}`;
  const texto = `${t.frase.evento}. Juega en cualquier mundo para ganar ${c.ficha.nombre} y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el ${e.hasta.slice(8, 10)}/${e.hasta.slice(5, 7)}.`;
  return `insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', ${sql(titulo)}, ${sql(texto)}, ${sql(e.desde)}
where not exists (select 1 from public.anuncios a where a.titulo = ${sql(titulo)} and a.fecha = ${sql(e.desde)});`;
}

export function generarSql0289(): string {
  const marcos = [...listaDe0275("marco_perfil"), ...MARCOS_EVENTO.filter((m) => !m.migracion).map((m) => m.slug)];
  const fondos = [...listaDe0275("fondo_perfil"), ...FONDOS_EVENTO.filter((f) => !f.migracion).map((f) => f.valor)];
  const eventos = eventosProgramados();
  // Solo las piezas de 0289 (las que llegaron después tienen su propia migración).
  const piezas = piezasDeEventos().filter((p) => !p.migracion);
  return `-- ============================================================
-- Prodigia — Eventos de las festividades y la colección de Halloween (0289).
--
-- docs/eventos/PLAN_FESTIVIDADES.md (capas 7 y 8) y economy/PLAN_ECONOMIA.md §7:
--   - Cada evento grande tiene su colección: se gana con las Fichas del evento o se
--     compra con Cometas, y no se vende en el Bazar de siempre.
--   - Fichas: 1 cada ${EXP_POR_FICHA} de Exp ganada en los días del evento, hasta ${FICHAS_MAX_DIA} por día. Las
--     calcula la base desde daily_progress (nadie puede inventarlas).
--   - Al cerrar, las Fichas que sobran se cambian por ${CHISPAS_POR_FICHA} Chispas cada una.
--   - Los anuncios con fecha futura quedan programados: se ven desde ese día.
--
-- Se GENERA desde src/lib/temas/colecciones.ts (eventos.test.ts comprueba que
-- coincida). No editar a mano. Requiere 0248, 0249, 0275, 0279 y 0288. Idempotente.
-- ============================================================

-- ---------- Piezas nuevas: valores permitidos y catálogo ----------
alter table public.profiles drop constraint if exists profiles_marco_perfil_check;
alter table public.profiles add constraint profiles_marco_perfil_check
  check (marco_perfil in (${marcos.map(sql).join(", ")}));

alter table public.profiles drop constraint if exists profiles_fondo_perfil_check;
alter table public.profiles add constraint profiles_fondo_perfil_check
  check (fondo_perfil in (${fondos.map(sql).join(", ")}));

insert into public.catalogo_cosmeticos (slug, categoria, valor, nombre, rareza, precio, vendible, en_capsulas, mundo, temporada) values
${piezas.map((p) => `  (${sql(p.item)}, ${sql(p.categoria)}, ${sql(p.valor)}, ${sql(p.nombre)}, ${sql(p.rareza)}, ${({ comun: 400, raro: 1200, epico: 3000, legendario: 6000 } as const)[p.rareza]}, false, false, null, null)`).join(",\n")}
on conflict (slug) do update set categoria = excluded.categoria, valor = excluded.valor, nombre = excluded.nombre, rareza = excluded.rareza, precio = excluded.precio, vendible = excluded.vendible, en_capsulas = excluded.en_capsulas;

-- ---------- Eventos ----------
create table if not exists public.eventos (
  slug text primary key,
  tema text not null,
  desde date not null,
  hasta date not null,
  cierre date not null
);

create table if not exists public.eventos_piezas (
  evento text not null references public.eventos(slug) on delete cascade,
  item text not null references public.catalogo_cosmeticos(slug) on delete cascade,
  fichas integer not null check (fichas > 0),
  cometas integer not null check (cometas > 0),
  primary key (evento, item)
);

create table if not exists public.fichas_canjes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  evento text not null references public.eventos(slug) on delete cascade,
  item text not null,
  fichas integer not null default 0,
  cometas integer not null default 0,
  creado_at timestamptz not null default now()
);
create index if not exists fichas_canjes_user_idx on public.fichas_canjes (user_id, evento);

create table if not exists public.fichas_cierres (
  user_id uuid not null references public.profiles(id) on delete cascade,
  evento text not null references public.eventos(slug) on delete cascade,
  chispas integer not null,
  creado_at timestamptz not null default now(),
  primary key (user_id, evento)
);

alter table public.eventos enable row level security;
alter table public.eventos_piezas enable row level security;
alter table public.fichas_canjes enable row level security;
alter table public.fichas_cierres enable row level security;
drop policy if exists "eventos visibles" on public.eventos;
create policy "eventos visibles" on public.eventos for select using (true);
drop policy if exists "piezas visibles" on public.eventos_piezas;
create policy "piezas visibles" on public.eventos_piezas for select using (true);
drop policy if exists "mis canjes" on public.fichas_canjes;
create policy "mis canjes" on public.fichas_canjes for select using (auth.uid() = user_id);
drop policy if exists "mis cierres" on public.fichas_cierres;
create policy "mis cierres" on public.fichas_cierres for select using (auth.uid() = user_id);
grant select on public.eventos, public.eventos_piezas to anon, authenticated;
grant select on public.fichas_canjes, public.fichas_cierres to authenticated;

insert into public.eventos (slug, tema, desde, hasta, cierre) values
${eventos.map((e) => `  (${sql(e.slug)}, ${sql(e.tema)}, ${sql(e.desde)}, ${sql(e.hasta)}, ${sql(e.cierre)})`).join(",\n")}
on conflict (slug) do update set tema = excluded.tema, desde = excluded.desde, hasta = excluded.hasta, cierre = excluded.cierre;

insert into public.eventos_piezas (evento, item, fichas, cometas) values
${eventos.flatMap((e) => (COLECCIONES[e.tema]?.piezas ?? []).filter((p) => !p.migracion).map((p) => `  (${sql(e.slug)}, ${sql(p.item)}, ${p.fichas}, ${p.cometas})`)).join(",\n")}
on conflict (evento, item) do update set fichas = excluded.fichas, cometas = excluded.cometas;

-- Fichas ganadas: 1 cada ${EXP_POR_FICHA} de Exp por día del evento, hasta ${FICHAS_MAX_DIA} por día.
create or replace function public._fichas_ganadas(p_user uuid, p_evento text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(least(${FICHAS_MAX_DIA}, floor(dp.xp_ganado / ${EXP_POR_FICHA}.0)::integer)), 0)::integer
  from public.daily_progress dp
  join public.eventos e on e.slug = p_evento
  where dp.user_id = p_user and dp.fecha between e.desde and e.hasta;
$$;
revoke execute on function public._fichas_ganadas(uuid, text) from public, anon, authenticated;

create or replace function public.estado_evento(p_evento text)
returns table (ganadas integer, gastadas integer, saldo integer, cerrado boolean, chispas_cierre integer, piezas text[])
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_ganadas integer;
  v_gastadas integer;
begin
  if v_user is null then
    return;
  end if;
  v_ganadas := public._fichas_ganadas(v_user, p_evento);
  select coalesce(sum(c.fichas), 0)::integer into v_gastadas from public.fichas_canjes c where c.user_id = v_user and c.evento = p_evento;
  return query select v_ganadas, v_gastadas, greatest(0, v_ganadas - v_gastadas),
    exists (select 1 from public.fichas_cierres fc where fc.user_id = v_user and fc.evento = p_evento),
    coalesce((select fc.chispas from public.fichas_cierres fc where fc.user_id = v_user and fc.evento = p_evento), 0),
    coalesce((select array_agg(ep.item) from public.eventos_piezas ep where ep.evento = p_evento and public._tiene_cosmetico(v_user, ep.item)), array[]::text[]);
end;
$$;
revoke execute on function public.estado_evento(text) from public, anon;
grant execute on function public.estado_evento(text) to authenticated;

-- Canjear una pieza: con Fichas (mientras dura el evento y el día de cierre) o con Cometas.
create or replace function public.canjear_pieza_evento(p_evento text, p_item text, p_con_cometas boolean)
returns table (saldo integer, cometas integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_e public.eventos%rowtype;
  v_p public.eventos_piezas%rowtype;
  v_saldo integer;
  v_cometas integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_e from public.eventos e where e.slug = p_evento;
  if not found then
    raise exception 'evento invalido';
  end if;
  if current_date < v_e.desde or current_date > v_e.cierre then
    raise exception 'el evento no esta abierto';
  end if;
  select * into v_p from public.eventos_piezas ep where ep.evento = p_evento and ep.item = p_item;
  if not found then
    raise exception 'pieza invalida';
  end if;
  if public._tiene_cosmetico(v_user, p_item) then
    raise exception 'ya tienes esta pieza';
  end if;
  select pr.cometas into v_cometas from public.profiles pr where pr.id = v_user for update;
  if p_con_cometas then
    if coalesce(v_cometas, 0) < v_p.cometas then
      raise exception 'te faltan Cometas para esta pieza';
    end if;
    insert into public.cometas_movimientos (user_id, cantidad, motivo, referencia) values (v_user, -v_p.cometas, 'evento', 'evento:' || p_evento || ':' || p_item);
    update public.profiles as pr set cometas = pr.cometas - v_p.cometas where pr.id = v_user;
    insert into public.fichas_canjes (user_id, evento, item, fichas, cometas) values (v_user, p_evento, p_item, 0, v_p.cometas);
  else
    v_saldo := public._fichas_ganadas(v_user, p_evento) - coalesce((select sum(c.fichas) from public.fichas_canjes c where c.user_id = v_user and c.evento = p_evento), 0);
    if v_saldo < v_p.fichas then
      raise exception 'te faltan fichas para esta pieza';
    end if;
    insert into public.fichas_canjes (user_id, evento, item, fichas, cometas) values (v_user, p_evento, p_item, v_p.fichas, 0);
  end if;
  perform public._dar_cosmetico(v_user, p_item);
  return query select greatest(0, public._fichas_ganadas(v_user, p_evento) - coalesce((select sum(c.fichas) from public.fichas_canjes c where c.user_id = v_user and c.evento = p_evento), 0))::integer,
    pr.cometas from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.canjear_pieza_evento(text, text, boolean) from public, anon;
grant execute on function public.canjear_pieza_evento(text, text, boolean) to authenticated;

-- Después del evento: las Fichas que sobran pasan a Chispas (una vez).
create or replace function public.cerrar_fichas_evento(p_evento text)
returns table (chispas integer, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_e public.eventos%rowtype;
  v_saldo integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_e from public.eventos e where e.slug = p_evento;
  if not found then
    raise exception 'evento invalido';
  end if;
  if current_date <= v_e.hasta then
    raise exception 'el evento sigue abierto';
  end if;
  if exists (select 1 from public.fichas_cierres fc where fc.user_id = v_user and fc.evento = p_evento) then
    raise exception 'ya cambiaste tus fichas';
  end if;
  v_saldo := greatest(0, public._fichas_ganadas(v_user, p_evento) - coalesce((select sum(c.fichas) from public.fichas_canjes c where c.user_id = v_user and c.evento = p_evento), 0));
  insert into public.fichas_cierres (user_id, evento, chispas) values (v_user, p_evento, v_saldo * ${CHISPAS_POR_FICHA});
  perform public._dar_chispas(v_user, v_saldo * ${CHISPAS_POR_FICHA});
  return query select v_saldo * ${CHISPAS_POR_FICHA}, pr.puntos_total from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.cerrar_fichas_evento(text) from public, anon;
grant execute on function public.cerrar_fichas_evento(text) to authenticated;

-- ---------- Anuncios programados: con fecha futura, se ven desde ese día ----------
create or replace function public.anuncios_pendientes()
returns table (id uuid, tipo text, titulo text, descripcion text, fecha date)
language sql
stable
security definer
set search_path = public
as $$
  with mios as (
    select a.id, a.tipo, a.titulo, a.descripcion, a.fecha, a.creado_at
    from public.anuncios a
    where a.activo = true
      and auth.uid() is not null
      and a.fecha <= current_date
      and a.fecha >= (select u.created_at::date from auth.users u where u.id = auth.uid())
      and a.fecha >= current_date - 21
      and not exists (
        select 1 from public.anuncios_leidos l
        where l.anuncio_id = a.id and l.user_id = auth.uid()
      )
    order by a.fecha desc, a.creado_at desc
    limit 3
  )
  select m.id, m.tipo, m.titulo, m.descripcion, m.fecha
  from mios m
  order by m.fecha asc, m.creado_at asc;
$$;
grant execute on function public.anuncios_pendientes() to authenticated;

create or replace function public.anuncios_recientes(p_limite integer default 20)
returns table (out_id uuid, out_tipo text, out_titulo text, out_descripcion text, out_fecha date, out_leido boolean)
language sql
stable
security definer
set search_path = public
as $$
  select a.id, a.tipo, a.titulo, a.descripcion, a.fecha,
    exists (select 1 from public.anuncios_leidos l where l.anuncio_id = a.id and l.user_id = auth.uid())
  from public.anuncios a
  where a.activo = true
    and auth.uid() is not null
    and a.fecha <= current_date
    and a.fecha >= (select u.created_at::date from auth.users u where u.id = auth.uid()) - 30
  order by a.fecha desc, a.creado_at desc
  limit least(greatest(coalesce(p_limite, 20), 1), 50);
$$;
revoke execute on function public.anuncios_recientes(integer) from public, anon;
grant execute on function public.anuncios_recientes(integer) to authenticated;

-- El anuncio de cada evento, programado para el día que empieza (una vez por evento).
${eventos.map(anuncioDe).join("\n")}

notify pgrst, 'reload schema';
`;
}

// La parte de datos de 0309 (colecciones de las fiestas de noviembre a enero) también se
// genera: va entre las marcas «generado» del archivo; el resto (minieventos) es a mano.
const ARCHIVO_0309 = path.join(MIGRACIONES, "0309_colecciones_fiestas.sql");
const INICIO_GEN = "-- >>> generado desde src/lib/temas/colecciones.ts y minieventos.ts (eventos.test.ts) >>>";
const FIN_GEN = "-- <<< generado <<<";

export function generarDatos0309(): string {
  // La restricción de profiles: la de 0289 más los marcos y fondos nuevos (hasta 0309).
  const hasta0309 = (m?: string) => !m || m <= "0309";
  const marcos = [...listaDe0275("marco_perfil"), ...MARCOS_EVENTO.filter((m) => hasta0309(m.migracion)).map((m) => m.slug)];
  const fondos = [...listaDe0275("fondo_perfil"), ...FONDOS_EVENTO.filter((f) => hasta0309(f.migracion)).map((f) => f.valor)];
  const piezas = piezasDeEventos().filter((p) => p.migracion === "0309");
  const eventos = eventosProgramados("0309");
  const ofertas = eventos
    .filter((e) => e.tema === "viernes_estelar")
    .flatMap((e) => ofertasEstelaresDe(e.desde).map((o) => ({ ...o, evento: e.slug })));
  const ts = (ms: number) => new Date(ms).toISOString().replace("T", " ").replace(".000Z", "+00");
  return `${INICIO_GEN}
alter table public.profiles drop constraint if exists profiles_marco_perfil_check;
alter table public.profiles add constraint profiles_marco_perfil_check
  check (marco_perfil in (${marcos.map(sql).join(", ")}));

alter table public.profiles drop constraint if exists profiles_fondo_perfil_check;
alter table public.profiles add constraint profiles_fondo_perfil_check
  check (fondo_perfil in (${fondos.map(sql).join(", ")}));

insert into public.catalogo_cosmeticos (slug, categoria, valor, nombre, rareza, precio, vendible, en_capsulas, mundo, temporada) values
${piezas.map((p) => `  (${sql(p.item)}, ${sql(p.categoria)}, ${sql(p.valor)}, ${sql(p.nombre)}, ${sql(p.rareza)}, ${({ comun: 400, raro: 1200, epico: 3000, legendario: 6000 } as const)[p.rareza]}, false, false, null, null)`).join(",\n")}
on conflict (slug) do update set categoria = excluded.categoria, valor = excluded.valor, nombre = excluded.nombre, rareza = excluded.rareza, precio = excluded.precio, vendible = excluded.vendible, en_capsulas = excluded.en_capsulas;

insert into public.eventos (slug, tema, desde, hasta, cierre, inicio) values
${eventos.map((e) => `  (${sql(e.slug)}, ${sql(e.tema)}, ${sql(e.desde)}, ${sql(e.hasta)}, ${sql(e.cierre)}, ${sql(e.inicio)})`).join(",\n")}
on conflict (slug) do update set tema = excluded.tema, desde = excluded.desde, hasta = excluded.hasta, cierre = excluded.cierre, inicio = excluded.inicio;

insert into public.eventos_piezas (evento, item, fichas, cometas) values
${eventos.flatMap((e) => (COLECCIONES[e.tema]?.piezas ?? []).map((p) => `  (${sql(e.slug)}, ${sql(p.item)}, ${p.fichas}, ${p.cometas})`)).join(",\n")}
on conflict (evento, item) do update set fichas = excluded.fichas, cometas = excluded.cometas;

insert into public.eventos_ofertas (evento, item, desde, hasta, fichas, cometas) values
${ofertas.map((o) => `  (${sql(o.evento)}, ${sql(o.item)}, ${sql(ts(o.desdeMs))}, ${sql(ts(o.hastaMs))}, ${o.fichas}, ${o.cometas})`).join(",\n")}
on conflict (evento, desde) do update set item = excluded.item, hasta = excluded.hasta, fichas = excluded.fichas, cometas = excluded.cometas;

${eventos.map(anuncioDe).join("\n")}
${FIN_GEN}`;
}

// La parte de datos de 0311 (colecciones de las fiestas de febrero a septiembre): igual
// que 0309, más las metas de los minieventos (minievento_metas). Sus eventos empiezan en
// 2027 (los de 2026 ya pasaron).
const ARCHIVO_0311 = path.join(MIGRACIONES, "0311_colecciones_fiestas_2.sql");

export function generarDatos0311(): string {
  const marcos = [...listaDe0275("marco_perfil"), ...MARCOS_EVENTO.map((m) => m.slug)];
  const fondos = [...listaDe0275("fondo_perfil"), ...FONDOS_EVENTO.map((f) => f.valor)];
  const piezas = piezasDeEventos().filter((p) => p.migracion === "0311");
  const eventos = eventosProgramados("0311", [2027, 2028]);
  return `${INICIO_GEN}
alter table public.profiles drop constraint if exists profiles_marco_perfil_check;
alter table public.profiles add constraint profiles_marco_perfil_check
  check (marco_perfil in (${marcos.map(sql).join(", ")}));

alter table public.profiles drop constraint if exists profiles_fondo_perfil_check;
alter table public.profiles add constraint profiles_fondo_perfil_check
  check (fondo_perfil in (${fondos.map(sql).join(", ")}));

insert into public.catalogo_cosmeticos (slug, categoria, valor, nombre, rareza, precio, vendible, en_capsulas, mundo, temporada) values
${piezas.map((p) => `  (${sql(p.item)}, ${sql(p.categoria)}, ${sql(p.valor)}, ${sql(p.nombre)}, ${sql(p.rareza)}, ${({ comun: 400, raro: 1200, epico: 3000, legendario: 6000 } as const)[p.rareza]}, false, false, null, null)`).join(",\n")}
on conflict (slug) do update set categoria = excluded.categoria, valor = excluded.valor, nombre = excluded.nombre, rareza = excluded.rareza, precio = excluded.precio, vendible = excluded.vendible, en_capsulas = excluded.en_capsulas;

insert into public.eventos (slug, tema, desde, hasta, cierre, inicio) values
${eventos.map((e) => `  (${sql(e.slug)}, ${sql(e.tema)}, ${sql(e.desde)}, ${sql(e.hasta)}, ${sql(e.cierre)}, ${sql(e.inicio)})`).join(",\n")}
on conflict (slug) do update set tema = excluded.tema, desde = excluded.desde, hasta = excluded.hasta, cierre = excluded.cierre, inicio = excluded.inicio;

insert into public.eventos_piezas (evento, item, fichas, cometas) values
${eventos.flatMap((e) => (COLECCIONES[e.tema]?.piezas ?? []).map((p) => `  (${sql(e.slug)}, ${sql(p.item)}, ${p.fichas}, ${p.cometas})`)).join(",\n")}
on conflict (evento, item) do update set fichas = excluded.fichas, cometas = excluded.cometas;

insert into public.minievento_metas (tema, clave, mundo, por_dia, meta, fichas) values
${METAS_MINIEVENTOS.map((m) => `  (${sql(m.tema)}, ${sql(m.clave)}, ${m.mundo ? sql(m.mundo) : "null"}, ${m.porDia}, ${m.meta}, ${m.fichas})`).join(",\n")}
on conflict (tema, clave) do update set mundo = excluded.mundo, por_dia = excluded.por_dia, meta = excluded.meta, fichas = excluded.fichas;

${eventos.map(anuncioDe).join("\n")}
${FIN_GEN}`;
}

describe("eventos y colecciones", () => {
  it("la migración 0289 es la que sale de los datos", () => {
    const esperado = generarSql0289();
    if (process.env.EVENTOS_ESCRIBIR_SQL) fs.writeFileSync(ARCHIVO, esperado);
    expect(fs.readFileSync(ARCHIVO, "utf8")).toBe(esperado);
  });

  it("la parte generada de 0309 es la que sale de los datos", () => {
    const esperado = generarDatos0309();
    const texto = fs.readFileSync(ARCHIVO_0309, "utf8");
    const a = texto.indexOf(INICIO_GEN);
    const b = texto.indexOf(FIN_GEN);
    expect(a, "faltan las marcas de lo generado en 0309").toBeGreaterThanOrEqual(0);
    const actual = texto.slice(a, b + FIN_GEN.length);
    if (process.env.EVENTOS_ESCRIBIR_SQL) fs.writeFileSync(ARCHIVO_0309, texto.replace(actual, esperado));
    else expect(actual).toBe(esperado);
  });

  it("las fiestas de noviembre a enero tienen colección y quedan programadas", () => {
    const datos = generarDatos0309();
    for (const tema of ["muertos", "diwali", "viernes_estelar", "navidad", "anio_nuevo"] as const) {
      const c = COLECCIONES[tema]!;
      expect(c.migracion).toBe("0309");
      expect(c.piezas.length).toBeGreaterThanOrEqual(6);
      expect(c.piezas.every((p) => p.migracion === "0309")).toBe(true);
    }
    expect(datos).toContain("('muertos-2026', 'muertos', '2026-11-01', '2026-11-02', '2026-11-03'");
    expect(datos).toContain("('navidad-2026', 'navidad', '2026-12-01', '2026-12-26', '2026-12-27'");
    expect(datos).toContain("('anio_nuevo-2026', 'anio_nuevo', '2026-12-31', '2027-01-02', '2027-01-03'");
    // 0289 sigue igual: no trae nada de 0309.
    expect(generarSql0289()).not.toContain("muertos");
  });

  it("la parte generada de 0311 es la que sale de los datos", () => {
    const esperado = generarDatos0311();
    const texto = fs.readFileSync(ARCHIVO_0311, "utf8");
    const a = texto.indexOf(INICIO_GEN);
    const b = texto.indexOf(FIN_GEN);
    expect(a, "faltan las marcas de lo generado en 0311").toBeGreaterThanOrEqual(0);
    const actual = texto.slice(a, b + FIN_GEN.length);
    if (process.env.EVENTOS_ESCRIBIR_SQL) fs.writeFileSync(ARCHIVO_0311, texto.replace(actual, esperado));
    else expect(actual).toBe(esperado);
  });

  it("las fiestas de febrero a septiembre tienen colección, cierre y minievento en la base", () => {
    const datos = generarDatos0311();
    const texto = fs.readFileSync(ARCHIVO_0311, "utf8");
    for (const tema of ["anio_nuevo_lunar", "amor_amistad", "carnaval", "linternas", "dia_pi", "holi", "pascua", "dia_tierra", "dia_musica", "vuelta_clases"] as const) {
      const c = COLECCIONES[tema]!;
      expect(c.migracion, tema).toBe("0311");
      expect(c.piezas.length).toBeGreaterThanOrEqual(6);
      expect(c.piezas.every((p) => p.migracion === "0311")).toBe(true);
      expect(rangosDelAnio(2027).find((r) => r.id === tema)!.cierre, tema).toBe(true);
      expect(datos).toContain(`'${tema}-2027'`);
    }
    // Las fichas de un solo día alcanzan para casi toda la colección (12 por Exp + minievento).
    expect(COLECCIONES.dia_pi!.piezas.reduce((s, p) => s + p.fichas, 0)).toBeLessThanOrEqual(12 + METAS_PI.reduce((s, m) => s + m.fichas, 0) + 9);
    // Cada tema de las metas tiene un solo mundo (progreso_minievento cuenta uno).
    for (const tema of new Set(METAS_MINIEVENTOS.map((m) => m.tema))) {
      expect(new Set(METAS_MINIEVENTOS.filter((m) => m.tema === tema).map((m) => m.mundo)).size).toBe(1);
    }
    // La base conoce los mismos lugares de los huevos y las mismas metas de π.
    expect(texto).toContain(`array[${LUGARES_HUEVOS.map(sql).join(", ")}]`);
    for (const m of METAS_PI) expect(texto).toContain(`(${m.digitos}, ${m.fichas})`);
    // 0289 y 0309 siguen iguales: no traen nada de 0311.
    expect(generarSql0289()).not.toContain("carnaval");
    expect(generarDatos0309()).not.toContain("evento_farol");
  });

  it("cada pieza de evento está en el catálogo (para el inventario) y no se vende en el Bazar", () => {
    for (const p of piezasDeEventos()) {
      const it = CATALOGO_NUEVO.find((x) => x.item === p.item);
      expect(it, p.item).toBeDefined();
      expect(it!.vendible).toBe(false);
      expect(p.fichas).toBeGreaterThan(0);
      expect(p.cometas).toBeGreaterThan(0);
    }
  });

  it("Halloween 2026 queda programado con su colección", () => {
    const sql0289 = generarSql0289();
    expect(sql0289).toContain("('halloween-2026', 'halloween', '2026-10-24', '2026-10-31', '2026-11-01')");
    expect(COLECCIONES.halloween!.piezas.length).toBeGreaterThanOrEqual(6);
  });
});
