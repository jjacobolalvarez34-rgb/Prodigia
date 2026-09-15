-- ====================================================================
-- Prodigia — pedido en vivo (2026-09-15): "en el landing después de
-- ingresar correo... que ingresen la edad, y que si tienen menos de 14
-- años no puedan usar la trastienda" (casino/apuestas — mecánicas tipo
-- gambling, protección real para menores).
--
-- Se pide en los 2 lugares reales donde se crea una cuenta de verdad:
--   1) RegistroForm.tsx (cuenta nueva, /registro): la edad viaja en
--      auth signUp options.data.edad_ingresada — handle_new_user()
--      (trigger que YA existe, dispara al insertar en auth.users) la
--      copia al crear la fila de profiles. Funciona haya o no
--      confirmación de email de por medio (el trigger dispara al
--      INSERT real, antes de esa espera).
--   2) ConvertirCuenta.tsx (invitado → cuenta real): NO dispara
--      handle_new_user (mismo user_id de siempre, updateUser no
--      inserta en auth.users) — ahí se guarda con una RPC aparte
--      (guardar_edad_usuario), llamada con la sesión ya autenticada
--      que existe desde que se creó como invitado.
-- ====================================================================

alter table public.profiles
  add column if not exists edad_ingresada smallint;

create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_edad smallint;
begin
  if new.is_anonymous then
    insert into public.profiles (id, display_name, nombre_generado)
    values (new.id, 'Invitado' || upper(substr(replace(new.id::text, '-', ''), 1, 6)), true);
  else
    -- Rango defensivo: cualquier valor fuera de 1-120 se descarta como
    -- si no se hubiera mandado nada, nunca se confía ciegamente en un
    -- número que viene del cliente.
    v_edad := nullif(new.raw_user_meta_data->>'edad_ingresada', '')::smallint;
    if v_edad is not null and (v_edad < 1 or v_edad > 120) then
      v_edad := null;
    end if;
    insert into public.profiles (id, display_name, edad_ingresada)
    values (new.id, new.raw_user_meta_data->>'name', v_edad);
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- guardar_edad_usuario: para el camino de ConvertirCuenta.tsx (ya hay
-- sesión real, sin pasar por el trigger de arriba). No pisa un valor ya
-- guardado por error/doble submit — una vez puesta, la edad no se
-- vuelve a preguntar.
create or replace function public.guardar_edad_usuario(p_edad integer)
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
  if p_edad < 1 or p_edad > 120 then
    raise exception 'edad invalida';
  end if;
  update public.profiles set edad_ingresada = p_edad where id = v_user and edad_ingresada is null;
end;
$$;

grant execute on function public.guardar_edad_usuario(integer) to authenticated;

notify pgrst, 'reload schema';
