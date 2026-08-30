-- ============================================================
-- Prodigia — Grupo B, Fase 5: perfil público con el mismo nivel de
-- detalle que el propio (rango, nivel por mundo, marco/títulos
-- activos, logros, récords) — de solo lectura, ninguna de estas
-- funciones deja escribir nada.
-- Correr después de 0104_marcos_tematicos_mundo.sql.
-- ============================================================

-- ---------- 1) obtener_perfil_publico: 2 columnas nuevas ----------
-- Última definición real era la de 0066_clan_de_bots.sql (no la de
-- 0040 — esa quedó vieja: iba sin fuente_nombre/titulo_nombre y con
-- color_dial, que 0066 ya había sacado). Se construye sobre ESA base,
-- agregando titulo_activo (slug crudo, para poder resaltar cuál está
-- activo en la lista de títulos_publico) y nivel_cuenta (para la
-- insignia de nivel que ya se ve en el perfil propio) — se preserva el
-- filtro "not es_bot" y titulo_nombre_de tal cual estaban.
drop function if exists public.obtener_perfil_publico(uuid);

create function public.obtener_perfil_publico(p_user_id uuid)
returns table (
  id uuid,
  display_name text,
  avatar_url text,
  marco_perfil text,
  fuente_nombre text,
  titulo_activo text,
  nivel_cuenta integer,
  elo_rating integer,
  puntos_total integer,
  created_at timestamptz,
  titulo_nombre text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'no autenticado';
  end if;

  return query
    select p.id, p.display_name, p.avatar_url, p.marco_perfil, p.fuente_nombre,
      p.titulo_activo, p.nivel_cuenta,
      p.elo_rating, p.puntos_total, p.created_at, public.titulo_nombre_de(p.id)
    from public.profiles p
    where p.id = p_user_id and not p.es_bot;
end;
$$;

grant execute on function public.obtener_perfil_publico(uuid) to authenticated;

-- ---------- 2) progreso_mundos_publico: nivel_mundo por mundo ----------
create function public.progreso_mundos_publico(p_user_id uuid)
returns table (world text, nivel_mundo integer)
language sql
security definer
set search_path = public
as $$
  select w.world, w.nivel_mundo
  from public.world_progress w
  where w.user_id = p_user_id;
$$;

grant execute on function public.progreso_mundos_publico(uuid) to authenticated;

-- ---------- 3) titulos_publico: mismo shape que mis_titulos, parametrizado ----------
create function public.titulos_publico(p_user_id uuid)
returns table (slug text, nombre text, origen text, desbloqueado_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select slug, nombre, origen, desbloqueado_at
  from public.titulos_usuario
  where user_id = p_user_id
  order by desbloqueado_at asc;
$$;

grant execute on function public.titulos_publico(uuid) to authenticated;

-- ---------- 4) logros_publico: catálogo completo + cuáles ya tiene ----------
create function public.logros_publico(p_user_id uuid)
returns table (id uuid, slug text, nombre text, descripcion text, categoria text, desbloqueado boolean)
language sql
security definer
set search_path = public
as $$
  select a.id, a.slug, a.nombre, a.descripcion, a.categoria,
    exists(select 1 from public.user_achievements ua where ua.user_id = p_user_id and ua.achievement_id = a.id)
  from public.achievements a;
$$;

grant execute on function public.logros_publico(uuid) to authenticated;

-- ---------- 5) records_publico: mismos 3 récords de la tarjeta propia ----------
-- Racha máxima vía gaps-and-islands (islas de fechas consecutivas);
-- mejor tiempo, tiempo mínimo entre respuestas correctas; mejor
-- precisión, mejor día con al menos 5 intentos (mismo piso que
-- calcularMejorPrecisionDiaria en src/lib/perfil/records.ts, para no
-- inventar un criterio nuevo en SQL).
create function public.records_publico(p_user_id uuid)
returns table (racha_maxima integer, mejor_tiempo_ms integer, mejor_precision numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_racha integer;
  v_tiempo integer;
  v_precision numeric;
begin
  select coalesce(max(cnt), 0) into v_racha
  from (
    select count(*) as cnt
    from (
      select fecha, fecha - (row_number() over (order by fecha))::int as grupo
      from public.daily_progress
      where user_id = p_user_id and (meta_alcanzada or congelado)
    ) marcados
    group by grupo
  ) islas;

  select min(time_ms) into v_tiempo from public.attempts where user_id = p_user_id and correct = true;

  select max(correctos::numeric / total) into v_precision
  from (
    select count(*) as total, count(*) filter (where correct) as correctos
    from public.attempts
    where user_id = p_user_id
    group by created_at::date
  ) por_dia
  where total >= 5;

  return query select v_racha, v_tiempo, v_precision;
end;
$$;

grant execute on function public.records_publico(uuid) to authenticated;
