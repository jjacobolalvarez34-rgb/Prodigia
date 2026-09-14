-- ====================================================================
-- Prodigia — Tienda: 2 cosméticos nuevos, mismo patrón que fuente_nombre/
-- marco_perfil (columna "equipada" + array "desbloqueadas" + RPC
-- elegir_<cosa> + rama nueva en comprar_item_tienda):
--
--   1) animacion_nombre: una animación CSS sobre el nombre visible
--      (arcoiris, brillo, ondulante, neon) — se ve en todos lados donde
--      ya se ve fuente_nombre (perfil propio/público, rankeds, feed) y
--      además en el chat de clan, que hasta ahora ni mostraba la
--      tipografía comprada.
--   2) fondo_perfil: un fondo decorativo (franja superior de la
--      tarjeta de perfil, no la foto de avatar) — 5 degradés CSS, sin
--      assets de imagen.
--
-- Como comprar_item_tienda/obtener_perfil_publico/ranking_elo_global/
-- ranking_semanal_filtrado/mensajes_de_clan cambian de "returns table"
-- (agregan columnas), van con drop + create, no create or replace
-- (42P13). Todo el código nuevo califica cada columna con el alias de
-- su tabla desde el vamos (pr./p./m.) para no repetir el bug de
-- columna ambigua de 0132/0134/0136/0138/0141.
-- ====================================================================

-- ---------- 1) columnas nuevas en profiles ----------
alter table public.profiles
  add column if not exists animacion_nombre text not null default 'ninguna'
    check (animacion_nombre in ('ninguna', 'arcoiris', 'brillo', 'ondulante', 'neon')),
  add column if not exists animaciones_desbloqueadas text[] not null default array['ninguna'],
  add column if not exists fondo_perfil text not null default 'ninguno'
    check (fondo_perfil in ('ninguno', 'aurora', 'nebulosa', 'dorado', 'oceano', 'bosque')),
  add column if not exists fondos_desbloqueados text[] not null default array['ninguno'];

-- ---------- 2) elegir_animacion_nombre / elegir_fondo_perfil ----------
create or replace function public.elegir_animacion_nombre(p_animacion text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if not exists (
    select 1 from public.profiles where id = v_user and p_animacion = any(animaciones_desbloqueadas)
  ) then
    raise exception 'animacion no desbloqueada';
  end if;
  update public.profiles set animacion_nombre = p_animacion where id = v_user;
end;
$$;

grant execute on function public.elegir_animacion_nombre(text) to authenticated;

create or replace function public.elegir_fondo_perfil(p_fondo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if not exists (
    select 1 from public.profiles where id = v_user and p_fondo = any(fondos_desbloqueados)
  ) then
    raise exception 'fondo no desbloqueado';
  end if;
  update public.profiles set fondo_perfil = p_fondo where id = v_user;
end;
$$;

grant execute on function public.elegir_fondo_perfil(text) to authenticated;

-- ---------- 3) comprar_item_tienda: 9 items nuevos ----------
drop function if exists public.comprar_item_tienda(text, integer);

create function public.comprar_item_tienda(p_item text, p_costo integer)
returns table (
  puntos_total integer,
  escudos_extra_pendientes smallint,
  congelamientos_disponibles smallint,
  boost_multiplicador_pendiente numeric,
  fuentes_desbloqueadas text[],
  marcos_desbloqueados text[],
  animaciones_desbloqueadas text[],
  fondos_desbloqueados text[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_costo_base integer;
  v_mundo text;
  v_nivel_mundo integer;
  v_mundos constant text[] := array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  v_costo_base := case p_item
    when 'escudo' then 350
    when 'congelamiento' then 450
    when 'boost' then 600
    when 'fuente_mono' then 1000
    when 'fuente_serif' then 1400
    when 'fuente_manuscrita' then 5000
    when 'fuente_impacto' then 1200
    when 'fuente_script' then 1800
    when 'fuente_futurista' then 2500
    when 'marco_bronce' then 1000
    when 'marco_plata' then 1300
    when 'marco_oro' then 1700
    when 'marco_platino' then 2200
    when 'marco_diamante' then 3200
    when 'marco_prodigio' then 5000
    when 'marco_numeria' then 2400
    when 'marco_enigmia' then 2400
    when 'marco_geografia' then 2400
    when 'marco_quimia' then 2400
    when 'marco_anatomia' then 2400
    when 'marco_melodia' then 2400
    when 'marco_trigonometria' then 2400
    when 'marco_historia' then 2400
    when 'paquete_marcos_mundo' then 14500
    when 'animacion_ondulante' then 1200
    when 'animacion_brillo' then 1400
    when 'animacion_arcoiris' then 1800
    when 'animacion_neon' then 2200
    when 'fondo_oceano' then 1600
    when 'fondo_bosque' then 1600
    when 'fondo_aurora' then 1600
    when 'fondo_dorado' then 1800
    when 'fondo_nebulosa' then 2000
    else null
  end;

  if v_costo_base is null then
    raise exception 'item invalido';
  end if;
  if p_costo < ceil(v_costo_base * 0.5) then
    raise exception 'precio invalido';
  end if;

  if p_item in ('marco_numeria', 'marco_enigmia', 'marco_geografia', 'marco_quimia', 'marco_anatomia', 'marco_melodia', 'marco_trigonometria', 'marco_historia') then
    v_mundo := replace(p_item, 'marco_', '');
    select w.nivel_mundo into v_nivel_mundo from public.world_progress w where w.user_id = v_user and w.world = v_mundo;
    if coalesce(v_nivel_mundo, 0) < 40 then
      raise exception 'todavia no alcanzaste suficiente nivel en % para desbloquear este marco', v_mundo;
    end if;
  elsif p_item = 'paquete_marcos_mundo' then
    if exists (
      select 1 from unnest(v_mundos) m
      where coalesce((select w.nivel_mundo from public.world_progress w where w.user_id = v_user and w.world = m), 0) < 40
    ) then
      raise exception 'todavia no alcanzaste nivel 40 en los 8 mundos';
    end if;
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_costo then
    raise exception 'te faltan Chispas para comprar esto';
  end if;

  if p_item = 'escudo' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        escudos_extra_pendientes = pr.escudos_extra_pendientes + 1
    where pr.id = v_user;
  elsif p_item = 'congelamiento' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        congelamientos_disponibles = pr.congelamientos_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'boost' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        boost_multiplicador_pendiente = 1.5
    where pr.id = v_user;
  elsif p_item = 'paquete_marcos_mundo' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        marcos_desbloqueados = (select array(select distinct u from unnest(pr.marcos_desbloqueados || v_mundos) as u))
    where pr.id = v_user;
  elsif p_item like 'marco_%' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        marcos_desbloqueados = case
          when (replace(p_item, 'marco_', '')) = any(pr.marcos_desbloqueados)
            then pr.marcos_desbloqueados
          else array_append(pr.marcos_desbloqueados, replace(p_item, 'marco_', ''))
        end
    where pr.id = v_user;
  elsif p_item like 'animacion_%' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        animaciones_desbloqueadas = case
          when (replace(p_item, 'animacion_', '')) = any(pr.animaciones_desbloqueadas)
            then pr.animaciones_desbloqueadas
          else array_append(pr.animaciones_desbloqueadas, replace(p_item, 'animacion_', ''))
        end
    where pr.id = v_user;
  elsif p_item like 'fondo_%' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        fondos_desbloqueados = case
          when (replace(p_item, 'fondo_', '')) = any(pr.fondos_desbloqueados)
            then pr.fondos_desbloqueados
          else array_append(pr.fondos_desbloqueados, replace(p_item, 'fondo_', ''))
        end
    where pr.id = v_user;
  else
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        fuentes_desbloqueadas = case
          when (replace(p_item, 'fuente_', '')) = any(pr.fuentes_desbloqueadas)
            then pr.fuentes_desbloqueadas
          else array_append(pr.fuentes_desbloqueadas, replace(p_item, 'fuente_', ''))
        end
    where pr.id = v_user;
  end if;

  return query
    select pr.puntos_total, pr.escudos_extra_pendientes, pr.congelamientos_disponibles,
      pr.boost_multiplicador_pendiente, pr.fuentes_desbloqueadas, pr.marcos_desbloqueados,
      pr.animaciones_desbloqueadas, pr.fondos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.comprar_item_tienda(text, integer) to authenticated;

-- ---------- 4) obtener_perfil_publico: + animacion_nombre, fondo_perfil ----------
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
  titulo_nombre text,
  animacion_nombre text,
  fondo_perfil text
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
      p.elo_rating, p.puntos_total, p.created_at, public.titulo_nombre_de(p.id),
      p.animacion_nombre, p.fondo_perfil
    from public.profiles p
    where p.id = p_user_id and not p.es_bot;
end;
$$;

grant execute on function public.obtener_perfil_publico(uuid) to authenticated;

-- ---------- 5) ranking_elo_global / ranking_semanal_filtrado: + animacion_nombre ----------
drop function if exists public.ranking_elo_global(boolean);

create function public.ranking_elo_global(p_solo_amigos boolean default false)
returns table (
  user_id uuid,
  display_name text,
  elo_rating integer,
  avatar_url text,
  titulo_activo text,
  titulo_nombre text,
  fuente_nombre text,
  animacion_nombre text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
begin
  if v_caller is null then
    raise exception 'no autenticado';
  end if;

  return query
    select p.id, p.display_name, p.elo_rating, p.avatar_url, p.titulo_activo,
      public.titulo_nombre_de(p.id), p.fuente_nombre, p.animacion_nombre
    from public.profiles p
    join auth.users u on u.id = p.id
    where coalesce(u.is_anonymous, false) = false
      and not p.es_bot
      and p.display_name is not null
      and btrim(p.display_name) <> ''
      and u.email_confirmed_at is not null
      and (
        not p_solo_amigos
        or p.id = v_caller
        or exists (
          select 1 from public.friendships f
          where f.estado = 'aceptada'
            and ((f.user_id = v_caller and f.friend_id = p.id) or (f.friend_id = v_caller and f.user_id = p.id))
        )
      )
    order by p.elo_rating desc
    limit 100;
end;
$$;

grant execute on function public.ranking_elo_global(boolean) to authenticated;

drop function if exists public.ranking_semanal_filtrado(text, boolean);

create function public.ranking_semanal_filtrado(p_mundo text default null, p_solo_amigos boolean default false)
returns table (
  user_id uuid,
  display_name text,
  xp_semana bigint,
  avatar_url text,
  elo_rating integer,
  titulo_activo text,
  titulo_nombre text,
  fuente_nombre text,
  animacion_nombre text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
begin
  if v_caller is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo is not null and p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia') then
    raise exception 'mundo invalido';
  end if;

  return query
    with datos as (
      select
        p.id as uid,
        p.display_name as dn,
        (case
          when p_mundo is null then coalesce((
            select sum(dp.xp_ganado) from public.daily_progress dp
            where dp.user_id = p.id and dp.fecha >= date_trunc('week', current_date)::date and dp.fecha <= current_date
          ), 0)
          when p_mundo = 'enigmia' then coalesce((
            select sum(la.xp) from public.logic_attempts la
            where la.user_id = p.id and la.created_at >= date_trunc('week', current_date)
          ), 0)
          when p_mundo = 'geografia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date) and a.problem_type = 'geografia'
          ), 0)
          when p_mundo = 'quimia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica')
          ), 0)
          when p_mundo = 'anatomia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso')
          ), 0)
          when p_mundo = 'melodia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto')
          ), 0)
          when p_mundo = 'trigonometria' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('trigonometria_razones', 'trigonometria_circulo', 'trigonometria_identidades', 'trigonometria_leyes')
          ), 0)
          when p_mundo = 'historia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('historia_cronologia', 'historia_personajes', 'historia_causaefecto', 'historia_fechas')
          ), 0)
          else coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra')
          ), 0)
        end)::bigint as xp,
        p.avatar_url as av,
        p.elo_rating as elo,
        p.titulo_activo as ta,
        p.fuente_nombre as fn,
        p.animacion_nombre as an
      from public.profiles p
      join auth.users u on u.id = p.id
      where coalesce(u.is_anonymous, false) = false
        and not p.es_bot
        and p.display_name is not null
        and btrim(p.display_name) <> ''
        and u.email_confirmed_at is not null
        and (
          not p_solo_amigos
          or p.id = v_caller
          or exists (
            select 1 from public.friendships f
            where f.estado = 'aceptada'
              and ((f.user_id = v_caller and f.friend_id = p.id) or (f.friend_id = v_caller and f.user_id = p.id))
          )
        )
    )
    select d.uid, d.dn, d.xp, d.av, d.elo, d.ta, public.titulo_nombre_de(d.uid), d.fn, d.an
    from datos d
    where d.xp > 0
    order by d.xp desc;
end;
$$;

grant execute on function public.ranking_semanal_filtrado(text, boolean) to authenticated;

-- ---------- 6) mensajes_de_clan: + autor_fuente_nombre, autor_animacion_nombre ----------
drop function if exists public.mensajes_de_clan(uuid, integer);

create function public.mensajes_de_clan(p_clan_id uuid, p_limite integer default 100)
returns table (
  id uuid,
  autor_id uuid,
  autor_nombre text,
  autor_avatar_url text,
  texto text,
  created_at timestamptz,
  autor_fuente_nombre text,
  autor_animacion_nombre text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if not exists (select 1 from public.clan_membresias where clan_id = p_clan_id and user_id = v_user) then
    raise exception 'no eres miembro de este clan';
  end if;

  return query
    select m.id, m.autor_id, p.display_name, p.avatar_url, m.texto, m.created_at,
      p.fuente_nombre, p.animacion_nombre
    from public.clan_mensajes m
    join public.profiles p on p.id = m.autor_id
    where m.clan_id = p_clan_id
    order by m.created_at desc
    limit least(coalesce(p_limite, 100), 100);
end;
$$;

grant execute on function public.mensajes_de_clan(uuid, integer) to authenticated;

notify pgrst, 'reload schema';
