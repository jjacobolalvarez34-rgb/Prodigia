-- ============================================================
-- Prodigia — Fase 7 de "Duelos: llevar el progreso en vivo...":
-- el "Mundo de Clanes" (mapa navegable + sistema de casas), que
-- 0068_clanes_reales.sql había excluido a propósito ("proyecto de
-- diseño técnico aparte, no se toca acá").
--
-- Sistema de casas: capacidad de miembros fija por nivel de clan
-- (capacidad_clan) — "clan lleno" si no hay casas libres, validado
-- server-side en unirse_a_clan (antes no había ningún límite).
-- Correr después de 0075_tienda_fuentes_nuevas.sql.
-- ============================================================

create or replace function public.capacidad_clan(p_nivel integer)
returns integer
language sql
immutable
as $$
  select 10 + (greatest(p_nivel, 1) - 1) * 2;
$$;

grant execute on function public.capacidad_clan(integer) to authenticated;

create or replace function public.unirse_a_clan(p_clan_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_cantidad integer;
  v_capacidad integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if exists (select 1 from public.clan_membresias where user_id = v_user) then
    raise exception 'ya estás en un clan — salí del actual antes de unirte a otro';
  end if;
  if not exists (select 1 from public.clanes where id = p_clan_id and tipo = 'jugadores') then
    raise exception 'clan no encontrado';
  end if;

  select count(*) into v_cantidad from public.clan_membresias where clan_id = p_clan_id;
  v_capacidad := public.capacidad_clan(public.nivel_clan(p_clan_id));
  if v_cantidad >= v_capacidad then
    raise exception 'este clan está lleno — no hay casas libres';
  end if;

  insert into public.clan_membresias (clan_id, user_id, rol) values (p_clan_id, v_user, 'miembro');
end;
$$;

grant execute on function public.unirse_a_clan(uuid) to authenticated;

-- ---------- Mapa: una parcela por clan real, orden de creación ----------
create or replace function public.mapa_clanes()
returns table (
  clan_id uuid, nombre text, tag text, color_estandarte text,
  nivel_clan integer, cantidad_miembros integer, capacidad integer, creado_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select c.id, c.nombre, c.tag, c.color_estandarte,
    public.nivel_clan(c.id),
    (select count(*)::integer from public.clan_membresias cm where cm.clan_id = c.id),
    public.capacidad_clan(public.nivel_clan(c.id)),
    c.creado_at
  from public.clanes c
  where c.tipo = 'jugadores'
  order by c.creado_at asc;
$$;

grant execute on function public.mapa_clanes() to authenticated;

-- ---------- Ciudad: detalle público de un clan (sin importar si sos
-- miembro) — para el panel que se abre al hacer click en su parcela.
create or replace function public.ver_clan_publico(p_clan_id uuid)
returns table (
  clan_id uuid, nombre text, tag text, color_estandarte text, descripcion text,
  nivel_clan integer, cantidad_miembros integer, capacidad integer, guerras_ganadas integer, creado_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select c.id, c.nombre, c.tag, c.color_estandarte, c.descripcion,
    public.nivel_clan(c.id),
    (select count(*)::integer from public.clan_membresias cm where cm.clan_id = c.id),
    public.capacidad_clan(public.nivel_clan(c.id)),
    c.guerras_ganadas,
    c.creado_at
  from public.clanes c
  where c.id = p_clan_id and c.tipo = 'jugadores';
$$;

grant execute on function public.ver_clan_publico(uuid) to authenticated;
