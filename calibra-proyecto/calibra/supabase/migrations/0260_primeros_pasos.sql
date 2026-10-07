-- ============================================================
-- Prodigia — «Primeros pasos» (aprobado por el usuario el 2026-10-07,
-- docs/PLAN_PRIMERA_VEZ_APP.md paso 12).
--
-- Una lista de 8 tareas que enseñan el juego, cada una con un premio pequeño, y un
-- premio grande al completarlas todas (500 Chispas y el título «Bien encaminado»).
-- La base revisa con los datos reales si cada tarea está hecha (nada lo dice el
-- cliente) y cada premio se reclama una sola vez.
--
-- Requiere 0259 (la tarea de la constelación). Idempotente.
-- ============================================================

alter table public.profiles add column if not exists primeros_pasos_reclamados text[] not null default '{}';

-- Tareas, en orden, con su premio (espejo de src/lib/primerosPasos.ts).
create or replace function public.tareas_primeros_pasos()
returns table (tarea text, orden integer, premio text, cantidad integer)
language sql
immutable
as $$
  select t.tarea, t.orden, t.premio, t.cantidad
  from (values
    ('reto_diario', 1, 'chispas', 50),
    ('tecnica', 2, 'chispas', 50),
    ('amigo', 3, 'chispas', 50),
    ('duelo_amigo', 4, 'chispas', 100),
    ('misiones', 5, 'chispas', 100),
    ('constelacion', 6, 'hielo', 1),
    ('placa', 7, 'chispas', 100),
    ('racha', 8, 'chispas', 200),
    ('final', 9, 'chispas', 500)
  ) as t(tarea, orden, premio, cantidad);
$$;

grant execute on function public.tareas_primeros_pasos() to anon, authenticated;

create or replace function public._primer_paso_hecho(p_user uuid, p_tarea text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return case p_tarea
    when 'reto_diario' then exists (select 1 from public.retos_diarios_completados r where r.user_id = p_user)
    when 'tecnica' then exists (select 1 from public.technique_progress tp where tp.user_id = p_user and tp.dominado)
                     or exists (select 1 from public.logic_technique_progress tp where tp.user_id = p_user and tp.dominado)
    when 'amigo' then exists (select 1 from public.friendships f where f.estado = 'aceptada' and (f.user_id = p_user or f.friend_id = p_user))
    when 'duelo_amigo' then exists (
      select 1 from public.duels d
      join public.friendships f on f.estado = 'aceptada'
        and ((f.user_id = d.retador_id and f.friend_id = d.retado_id) or (f.user_id = d.retado_id and f.friend_id = d.retador_id))
      where d.retador_id = p_user
    )
    when 'misiones' then exists (
      select 1 from public.misiones_reclamadas m where m.user_id = p_user group by m.fecha having count(*) >= 3
    )
    when 'constelacion' then exists (select 1 from public.constelaciones_completadas c where c.user_id = p_user)
    when 'placa' then exists (
      select 1 from public.profiles pr
      where pr.id = p_user
        and (pr.avatar_url is not null
             or coalesce(pr.marco_perfil, 'ninguno') not in ('ninguno', 'pionero')
             or coalesce(pr.fondo_perfil, 'ninguno') <> 'ninguno'
             or coalesce(pr.fuente_nombre, 'default') <> 'default'
             or pr.ciudad_placa is not null)
    )
    when 'racha' then public.racha_diaria_de(p_user) >= 3
    when 'final' then (
      select count(*) = 8 from public.profiles pr, unnest(pr.primeros_pasos_reclamados) as r(t)
      where pr.id = p_user and r.t <> 'final'
    )
    else false
  end;
end;
$$;

revoke execute on function public._primer_paso_hecho(uuid, text) from public, anon, authenticated;

create or replace function public.mis_primeros_pasos()
returns table (tarea text, orden integer, premio text, cantidad integer, hecha boolean, reclamada boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_reclamados text[];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select pr.primeros_pasos_reclamados into v_reclamados from public.profiles pr where pr.id = v_user;
  return query
    select t.tarea, t.orden, t.premio, t.cantidad,
           (t.tarea = any(v_reclamados)) or public._primer_paso_hecho(v_user, t.tarea),
           t.tarea = any(v_reclamados)
    from public.tareas_primeros_pasos() t
    order by t.orden;
end;
$$;

revoke execute on function public.mis_primeros_pasos() from public, anon;
grant execute on function public.mis_primeros_pasos() to authenticated;

create or replace function public.reclamar_primer_paso(p_tarea text)
returns table (puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_t record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_t from public.tareas_primeros_pasos() t where t.tarea = p_tarea;
  if not found then
    raise exception 'tarea invalida';
  end if;
  if not public._primer_paso_hecho(v_user, p_tarea) then
    raise exception 'todavia no completaste esa tarea';
  end if;

  update public.profiles as pr
  set primeros_pasos_reclamados = array_append(pr.primeros_pasos_reclamados, p_tarea)
  where pr.id = v_user and not (p_tarea = any(pr.primeros_pasos_reclamados));
  if not found then
    raise exception 'ya reclamaste esa tarea';
  end if;

  if v_t.premio = 'chispas' then
    perform public._dar_chispas(v_user, v_t.cantidad);
  elsif v_t.premio = 'hielo' then
    update public.profiles as pr set hielos_disponibles = pr.hielos_disponibles + v_t.cantidad where pr.id = v_user;
  end if;
  if p_tarea = 'final' then
    perform public.desbloquear_titulo(v_user, 'bien_encaminado', 'Bien encaminado', 'primeros_pasos');
  end if;

  return query select pr.puntos_total from public.profiles pr where pr.id = v_user;
end;
$$;

revoke execute on function public.reclamar_primer_paso(text) from public, anon;
grant execute on function public.reclamar_primer_paso(text) to authenticated;

notify pgrst, 'reload schema';
