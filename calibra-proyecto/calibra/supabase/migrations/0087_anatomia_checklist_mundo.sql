-- ============================================================
-- Prodigia — Auditoría "checklist de mundo nuevo" (2026-08-23, ver
-- docs/ESPECIFICACION.md). Anatomía repitió el mismo patrón de huecos
-- de integración que Quimia tuvo en su momento — esta migración cierra
-- los puntos que viven en SQL: ranking por mundo, y categoría/catálogo
-- de logros. Los puntos que viven en TypeScript (calibración de
-- skill_levels, world_progress, catálogo de títulos, mapas de nombre
-- en Feed) se corrigieron en el mismo commit, fuera de este archivo.
--
-- Deliberadamente FUERA de alcance acá (documentado, no arreglado):
-- Rankeds/retar-amigo/invitar-por-link para Anatomía. Esos 3 puntos
-- necesitan que AnatomiaSprintRunner/AnatomiaPracticaClient soporten
-- duelos en tiempo real primero (nivelForzado, semillaDuelo, fantasma,
-- progreso en vivo) — hoy no lo soportan en absoluto (a diferencia de
-- los otros 4 mundos). Sumar "anatomia" a los checks de duels/
-- duel_queue/duel_invites sin esa base dejaría aceptar invitaciones que
-- el frontend no puede reproducir — peor que no ofrecer la opción.
-- ============================================================

-- ---------- Ranking por mundo (Global y Amigos) ----------
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
  if p_mundo is not null and p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia') then
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
              and a.problem_type in ('quimia_simbolos', 'quimia_formulas', 'quimia_tabla')
          ), 0)
          when p_mundo = 'anatomia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso')
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

-- ---------- Logros de Anatomía (mismo patrón que 0056 con Quimia) ----------
alter table public.achievements drop constraint achievements_categoria_check;
alter table public.achievements add constraint achievements_categoria_check
  check (categoria in ('racha', 'volumen', 'precision', 'dominio', 'duelos', 'enigmia', 'quimia', 'mundo', 'anatomia'));

insert into public.achievements (slug, nombre, descripcion, categoria, criterio) values
('anatomia-explorador', 'Explorador de Anatomía', 'Probaste los 4 sistemas de Anatomía — óseo, muscular, órganos y nervioso.', 'anatomia', '{"tipo": "anatomia_modos_variados", "valor": 4}'),
('anatomia-nivel-5', 'Manos a la obra', 'Alcanzaste nivel 5 de mundo en Anatomía.', 'anatomia', '{"tipo": "anatomia_nivel_mundo", "valor": 5}'),
('anatomia-100', 'Anatomista de cabecera', 'Resolviste 100 problemas en Anatomía.', 'anatomia', '{"tipo": "anatomia_problemas_totales", "valor": 100}')
on conflict (slug) do nothing;
