-- ============================================================
-- Prodigia — Crear un clan cuesta 10 000 Chispas (0278).
--
-- Pedido del 2026-10-13: antes costaba 5000. Se redefine crear_clan desde su
-- versión vigente (0130), cambiando solo el costo. La web y la app muestran el
-- mismo número (COSTO_CREAR_CLAN). Idempotente.
-- ============================================================

create or replace function public.crear_clan(p_nombre text, p_tag text, p_color text, p_descripcion text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
  v_saldo integer;
  v_costo constant integer := 10000;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if exists (select 1 from public.clan_membresias where user_id = v_user) then
    raise exception 'ya estás en un clan — sal del actual antes de crear uno nuevo';
  end if;
  if length(trim(p_nombre)) < 3 then
    raise exception 'el nombre del clan necesita al menos 3 caracteres';
  end if;

  select puntos_total into v_saldo from public.profiles where id = v_user;
  if v_saldo < v_costo then
    raise exception 'te faltan Chispas: crear un clan cuesta % (tienes %)', v_costo, v_saldo;
  end if;

  update public.profiles set puntos_total = puntos_total - v_costo where id = v_user;

  insert into public.clanes (nombre, descripcion, tipo, owner_id, tag, color_estandarte)
  values (trim(p_nombre), coalesce(nullif(trim(p_descripcion), ''), 'Sin descripción todavía.'), 'jugadores', v_user, nullif(trim(p_tag), ''), coalesce(p_color, '#6C4CF1'))
  returning id into v_id;

  insert into public.clan_membresias (clan_id, user_id, rol) values (v_id, v_user, 'fundador');

  return v_id;
end;
$$;

notify pgrst, 'reload schema';
