-- ============================================================
-- Prodigia — Filtro de "usuarios permanentes" en TODOS los
-- rankings públicos (auditoría P0 de usuarios y ranking,
-- 2026-09-08, docs/audits/USER-RANKING-AUDIT.md). Correr después de
-- 0118_niveles_cuenta_recompensas.sql.
--
-- Situación en vivo (verificada contra la DB real, SOLO lectura):
--   * 137 usuarios en auth.users; 87 anónimos (is_anonymous=true).
--   * Los anónimos YA están excluidos en producción por la familia
--     0042/0066/0105+ (verified: 0 anónimos en ranking_semanal,
--     ranking_semanal_filtrado y ranking_elo_global). El bug original
--     de 0042 está resuelto y aplicado.
--   * PERO los rankings filtran únicamente is_anonymous y es_bot.
--     Quedan visibles las CUENTAS INCOMPLETAS: registradas/creadas pero
--     sin nombre (display_name null -> nunca completaron onboarding),
--     o sin email confirmado. En ranking_elo_global (PERSISTENTE,
--     competitivo) hoy aparecen 5 de 14 filas con display_name = null
--     (sophie@cogroupsas, calibra-test-agent, test-fase1, josemito889,
--     bilinpatino). No son jugadores: ocupan posiciones 4/9/12/13/14
--     con ELO de arranque (800) y ensucian el ranking competitivo.
--
-- Criterio aplicado ("usuario permanente"):
--   1. No anónimo (is_anonymous = false)             [ya existía]
--   2. No bot (es_bot = false)                        [ya existía]
--   3. Con identidad: display_name no nulo/no vacío   [NUEVO]
--   4. Cuenta real confirmada: email_confirmed_at no nulo [NUEVO]
--
-- NO se tocan puntos/Chispas/nivel (familias S0/S1/S5/S10): esto es
-- lectura (filtro de visibilidad), no economía. Quién puede competir
-- en Rankeds sigue siendo lo que ya decide guard.ts (cuenta no invitada
-- + nivel_cuenta >= 5) — este filtro NO agrega nivel_cuenta a propósito,
-- solo saca del ranking a quien no tiene cuenta permanente.
--
-- Bonus de endurecimiento: ranking_semanal() (la función que alimenta
-- /api/leaderboard/posicion) se ejecutaba con la ANON KEY sin sesión
-- (grant PUBLIC de default de Postgres, nunca revocado — verificado en
-- vivo: devolvía el ranking semanal completo sin loguearse). Se agrega
-- el guard auth.uid() y se restringe a authenticated.
--
-- Cuentas QA/de prueba (QA Tester, etc.) NO se pueden distinguir por
-- SQL (no hay columna es_qa): quedan documentadas en el audit como
-- contaminación de datos de test, no como bug de código.
-- ============================================================

-- ---------- 1) ranking_elo_global: solo usuarios permanentes ----------
create or replace function public.ranking_elo_global(p_solo_amigos boolean default false)
returns table (
  user_id uuid,
  display_name text,
  elo_rating integer,
  avatar_url text,
  titulo_activo text,
  titulo_nombre text,
  fuente_nombre text
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
      public.titulo_nombre_de(p.id), p.fuente_nombre
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

-- ---------- 2) ranking_semanal_filtrado: solo usuarios permanentes ----------
-- Última definición de referencia: 0109_mundo_historia.sql (8 mundos).
-- Se reproduce tal cual, sumando al WHERE el filtro de usuario permanente.
create or replace function public.ranking_semanal_filtrado(p_mundo text default null, p_solo_amigos boolean default false)
returns table (
  user_id uuid,
  display_name text,
  xp_semana bigint,
  avatar_url text,
  elo_rating integer,
  titulo_activo text,
  titulo_nombre text,
  fuente_nombre text
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
        p.fuente_nombre as fn
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
    select d.uid, d.dn, d.xp, d.av, d.elo, d.ta, public.titulo_nombre_de(d.uid), d.fn
    from datos d
    where d.xp > 0
    order by d.xp desc;
end;
$$;

grant execute on function public.ranking_semanal_filtrado(text, boolean) to authenticated;

-- ---------- 3) ranking_semanal: mismo filtro + guard de autenticación ----------
-- /api/leaderboard/posicion (src/app/api/leaderboard/posicion/route.ts)
-- la llama con sesión. Antes: sin check de auth.uid() ni revoke de
-- PUBLIC -> cualquier persona con la anon key leía el ranking semanal
-- completo sin estar logueada (verificado en vivo).
drop function if exists public.ranking_semanal();

create function public.ranking_semanal()
returns table (
  user_id uuid,
  display_name text,
  xp_semana bigint,
  avatar_url text,
  elo_rating integer,
  titulo_activo text,
  titulo_nombre text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.display_name,
    coalesce(sum(dp.xp_ganado), 0) as xp_semana,
    p.avatar_url,
    p.elo_rating,
    p.titulo_activo,
    public.titulo_nombre_de(p.id)
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.daily_progress dp
    on dp.user_id = p.id
    and dp.fecha >= date_trunc('week', current_date)::date
    and dp.fecha <= current_date
  where coalesce(u.is_anonymous, false) = false
    and not p.es_bot
    and p.display_name is not null
    and btrim(p.display_name) <> ''
    and u.email_confirmed_at is not null
    and auth.uid() is not null
  group by p.id, p.display_name, p.avatar_url, p.elo_rating, p.titulo_activo
  having coalesce(sum(dp.xp_ganado), 0) > 0
  order by xp_semana desc;
$$;

revoke execute on function public.ranking_semanal() from public, anon;
grant execute on function public.ranking_semanal() to authenticated;

-- ---------- 4) posicion_ranking_puntos: mismo filtro ----------
-- Total de jugadores del ranking permanente de Puntos (se usa en
-- /perfil). Antes contaba cuentas incompletas; ahora solo permanentes.
create or replace function public.posicion_ranking_puntos()
returns table (posicion bigint, total_jugadores bigint)
language sql
security definer
set search_path = public
as $$
  with reales as (
    select p.id, p.puntos_total, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    where coalesce(u.is_anonymous, false) = false
      and not p.es_bot
      and p.display_name is not null
      and btrim(p.display_name) <> ''
      and u.email_confirmed_at is not null
  ),
  ranking as (
    select id, row_number() over (order by puntos_total desc, created_at asc) as posicion
    from reales
  )
  select r.posicion, (select count(*) from reales) as total_jugadores
  from ranking r
  where r.id = auth.uid();
$$;

grant execute on function public.posicion_ranking_puntos() to authenticated;