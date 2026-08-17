-- ============================================================
-- Prodigia — detectar "subió de nivel de mundo" (cierre de Fase DD2)
-- Correr después de 0033_nivel_de_mundo.sql
-- registrar_puntos_mundo ya devolvía el nivel nuevo, pero no el nivel
-- ANTERIOR — sin eso el cliente no puede saber si hubo un salto de
-- nivel real para disparar la celebración (gesto del logo). Se
-- recrea (drop+create, cambia el shape de salida) agregando esa
-- columna.
-- ============================================================

drop function if exists public.registrar_puntos_mundo(text, integer);

create function public.registrar_puntos_mundo(p_world text, p_puntos integer)
returns table (world text, puntos_mundo integer, nivel_mundo integer, nivel_anterior integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_puntos integer;
  v_nivel integer;
  v_nivel_anterior integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select w.nivel_mundo into v_nivel_anterior
  from public.world_progress w where w.user_id = v_user and w.world = p_world;
  v_nivel_anterior := coalesce(v_nivel_anterior, 1);

  if p_puntos <= 0 then
    select w.puntos_mundo into v_puntos from public.world_progress w where w.user_id = v_user and w.world = p_world;
    return query select p_world, coalesce(v_puntos, 0), v_nivel_anterior, v_nivel_anterior;
    return;
  end if;

  insert into public.world_progress (user_id, world, puntos_mundo, nivel_mundo, updated_at)
  values (v_user, p_world, p_puntos, 1, now())
  on conflict (user_id, world) do update
    set puntos_mundo = public.world_progress.puntos_mundo + excluded.puntos_mundo,
        updated_at = now()
  returning public.world_progress.puntos_mundo into v_puntos;

  v_nivel := floor((50 + sqrt(2500 + 200 * v_puntos)) / 100)::integer;

  update public.world_progress set nivel_mundo = v_nivel where user_id = v_user and world = p_world;

  return query select p_world, v_puntos, v_nivel, v_nivel_anterior;
end;
$$;

grant execute on function public.registrar_puntos_mundo(text, integer) to authenticated;
