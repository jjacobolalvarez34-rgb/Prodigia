-- ============================================================
-- Prodigia — Rankeds: "Rechazar" un duelo pendiente (Mi competitivo).
-- El duelo se borra por completo (cascada a duel_results) — desaparece
-- para los dos jugadores, no queda colgado ni para quien retó ni para
-- quien fue retado. Si es una ronda de una serie "todas las ciudades"
-- (serie_id no nulo), se cancelan las 3 rondas juntas — dejar 2 rondas
-- huérfanas de una serie rota no tiene sentido.
-- Correr después de 0046_numeria_operacion_aleatoria.sql
-- ============================================================

create function public.rechazar_duelo(p_duel_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duelo record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_duelo from public.duels where id = p_duel_id;
  if v_duelo.id is null or (v_duelo.retador_id <> v_user and v_duelo.retado_id <> v_user) then
    raise exception 'no autorizado';
  end if;
  if v_duelo.estado <> 'pendiente' then
    raise exception 'el duelo ya no está pendiente';
  end if;

  if v_duelo.serie_id is not null then
    delete from public.duels where serie_id = v_duelo.serie_id;
  else
    delete from public.duels where id = p_duel_id;
  end if;
end;
$$;

grant execute on function public.rechazar_duelo(uuid) to authenticated;
