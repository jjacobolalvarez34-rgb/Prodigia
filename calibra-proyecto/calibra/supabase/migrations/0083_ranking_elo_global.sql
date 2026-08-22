-- ============================================================
-- Prodigia — Fase 1 de la tanda "Rankeds/Clanes: bugs y ranking
-- visible": auditoría confirmó que un ranking global ordenado por ELO
-- (competitivo, no semanal/XP) nunca se construyó — ni la función SQL
-- ni la pantalla existían, no era un caso de "está pero mal enlazado".
--
-- Mismo criterio de exclusión que ranking_semanal_filtrado (0066): sin
-- invitados, sin Clan de Bots — acá es sobre parados reales entre
-- jugadores reales, no sobre variedad de rivales de práctica.
-- ============================================================

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
