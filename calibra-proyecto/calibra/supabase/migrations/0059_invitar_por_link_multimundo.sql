-- ============================================================
-- Prodigia — fix: "Invitar por link" seguía siendo Numeria-only
-- (Sección 3). Correr después de 0058_matchmaking_fantasma.sql
--
-- La tanda anterior generalizó "retar a un amigo" (reto directo a una
-- cuenta ya elegida, api/amigos/retar) a los 4 mundos, pero
-- "invitar por link" (para gente sin cuenta todavía, duel_invites +
-- crear_invitacion_duelo/unirse_invitacion_duelo) es un flujo de
-- código completamente distinto que nunca se tocó — confirmado
-- leyendo 0038_duelos_tiempo_real.sql: duel_invites.operation_type es
-- not null con check solo de las 4 operaciones de Numeria, no tiene
-- columna mundo/sub_tipo, y unirse_invitacion_duelo inserta en duels
-- sin pasar mundo (así que siempre cae en el default 'numeria' de esa
-- columna). Mismo patrón que api/amigos/retar/route.ts para la
-- validación mundo/sub_tipo.
-- ============================================================

alter table public.duel_invites add column if not exists mundo text not null default 'numeria';
alter table public.duel_invites add column if not exists sub_tipo text;

alter table public.duel_invites drop constraint if exists duel_invites_mundo_check;
alter table public.duel_invites add constraint duel_invites_mundo_check
  check (mundo in ('numeria', 'geografia', 'enigmia', 'quimia'));

-- operation_type era "not null" porque antes era el único dato posible
-- — ahora en geografia/enigmia/quimia va null y se usa sub_tipo en su
-- lugar (mismo split que ya usa la tabla duels).
alter table public.duel_invites alter column operation_type drop not null;

drop function if exists public.crear_invitacion_duelo(text);

create function public.crear_invitacion_duelo(p_mundo text default 'numeria', p_operation_type text default null, p_sub_tipo text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia') then
    raise exception 'mundo invalido';
  end if;
  if p_mundo = 'numeria' then
    if p_operation_type not in ('suma', 'resta', 'multiplicacion', 'division') then
      raise exception 'operacion invalida';
    end if;
  elsif p_mundo = 'geografia' then
    if p_sub_tipo not in ('america', 'europa', 'africa', 'asia_oceania') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'enigmia' then
    if p_sub_tipo not in ('memoria', 'patrones', 'deduccion', 'computacional') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'quimia' then
    if p_sub_tipo not in ('simbolos', 'formulas', 'tabla') then
      raise exception 'opcion invalida';
    end if;
  end if;

  -- Cancela cualquier invitación propia que haya quedado abierta antes
  -- de crear una nueva — evita que un usuario acumule links viejos
  -- "esperando" sin límite.
  update public.duel_invites set estado = 'cancelada'
  where creador_id = v_user and estado = 'esperando';

  insert into public.duel_invites (creador_id, mundo, operation_type, sub_tipo)
  values (v_user, p_mundo, case when p_mundo = 'numeria' then p_operation_type else null end, case when p_mundo = 'numeria' then null else p_sub_tipo end)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.crear_invitacion_duelo(text, text, text) to authenticated;

drop function if exists public.unirse_invitacion_duelo(uuid);

create function public.unirse_invitacion_duelo(p_invite_id uuid)
returns table (duel_id uuid, mundo text, operation_type text, sub_tipo text, ya_unido boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_invite record;
  v_duel_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_invite from public.duel_invites where id = p_invite_id for update;
  if v_invite.id is null then
    raise exception 'invitacion no encontrada';
  end if;

  if v_invite.estado = 'usada' then
    -- Quien creó el duelo (o el propio invitado) recarga la página
    -- después de unirse — se le devuelve el mismo duelo en vez de
    -- fallar con un error confuso.
    if v_invite.duel_id is not null and (v_invite.creador_id = v_user or exists (
      select 1 from public.duels d where d.id = v_invite.duel_id and (d.retador_id = v_user or d.retado_id = v_user)
    )) then
      return query select v_invite.duel_id, v_invite.mundo, v_invite.operation_type, v_invite.sub_tipo, true;
      return;
    end if;
    raise exception 'invitacion ya usada';
  end if;

  if v_invite.estado <> 'esperando' then
    raise exception 'invitacion no disponible';
  end if;

  if v_invite.creador_id = v_user then
    raise exception 'no podes unirte a tu propia invitacion';
  end if;

  insert into public.duels (retador_id, retado_id, semilla_problemas, mundo, operation_type, sub_tipo)
  values (v_invite.creador_id, v_user, floor(random() * 1000000000)::bigint, v_invite.mundo, v_invite.operation_type, v_invite.sub_tipo)
  returning id into v_duel_id;

  update public.duel_invites set estado = 'usada', duel_id = v_duel_id where id = p_invite_id;

  return query select v_duel_id, v_invite.mundo, v_invite.operation_type, v_invite.sub_tipo, false;
end;
$$;

grant execute on function public.unirse_invitacion_duelo(uuid) to authenticated;
