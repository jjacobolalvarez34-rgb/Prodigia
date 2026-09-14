-- ====================================================================
-- PRODIGIA — FIX P0 (continuación de 0140): "Invitar amigos" tiraba
-- "column reference user_id is ambiguous" apenas se abría la sección
-- dentro de un clan.
--
-- Mismo bug de siempre (0132/0134/0136/0138), esta vez en una función
-- nueva de esta misma sesión: amigos_invitables_a_mi_clan() declara
-- `returns table (user_id uuid, display_name text)`, y su cuerpo tenía
-- una lectura SIN calificar:
--   select clan_id into v_mi_clan from public.clan_membresias
--   where user_id = v_user;
-- "user_id" ahí choca con la variable de salida implícita del mismo
-- nombre. El resto del cuerpo (cm.user_id, ci.clan_id, ci.invitado_id)
-- ya estaba bien calificado — solo faltaba esta línea.
--
-- FIX: calificar con el nombre de la tabla. No cambia el returns
-- table, así que `create or replace` alcanza (sin drop).
-- ====================================================================

create or replace function public.amigos_invitables_a_mi_clan()
returns table (user_id uuid, display_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_mi_clan uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select clan_id into v_mi_clan from public.clan_membresias where clan_membresias.user_id = v_user;
  if v_mi_clan is null then
    return;
  end if;

  return query
    select a.friend_id, a.display_name
    from public.mis_amigos() a
    where not exists (select 1 from public.clan_membresias cm where cm.user_id = a.friend_id)
      and not exists (
        select 1 from public.clan_invitaciones ci
        where ci.clan_id = v_mi_clan and ci.invitado_id = a.friend_id and ci.estado = 'pendiente'
      );
end;
$$;

grant execute on function public.amigos_invitables_a_mi_clan() to authenticated;

notify pgrst, 'reload schema';
