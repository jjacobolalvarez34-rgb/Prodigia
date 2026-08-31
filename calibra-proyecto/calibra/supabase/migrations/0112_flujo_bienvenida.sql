-- ============================================================
-- Prodigia — Rediseño del flujo de landing/onboarding (Fases 3 y 6):
-- 1) Un invitado (signInAnonymously) nunca elige ni escribe un nombre —
--    se le asigna uno autogenerado en el momento de crear la sesión,
--    sin ningún input suyo. Si más adelante decide poner su nombre real
--    (cambiar_nombre_usuario, ya sea desde /perfil o desde el flujo de
--    "crear cuenta real"), ese cambio sigue siendo gratis — antes el
--    "primer cambio gratis" dependía de display_name = null, lo que
--    rompía en cuanto se le asignaba un nombre autogenerado. La columna
--    nombre_generado distingue "nombre puesto por nosotros" de "nombre
--    elegido por la persona".
-- 2) Elegir el mundo inicial gratis pasa de 1 a 2 mundos — nueva función
--    elegir_mundos_iniciales(text[]) en vez de reusar 2 veces
--    elegir_mundo_inicial (que falla la segunda vez porque ya no tiene
--    mundos_desbloqueados vacío). elegir_mundo_inicial(text) se deja
--    tal cual (sin callers después de este cambio, pero inofensiva).
-- ============================================================

-- ---------- 1) profiles.nombre_generado ----------
alter table public.profiles add column if not exists nombre_generado boolean not null default false;

-- ---------- 2) handle_new_user: nombre autogenerado para invitados ----------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  if new.is_anonymous then
    -- Sufijo de 6 caracteres del propio uuid (no random()): garantiza
    -- unicidad sin depender de reintentos ante una colisión — el uuid
    -- ya es único por definición.
    insert into public.profiles (id, display_name, nombre_generado)
    values (new.id, 'Invitado' || upper(substr(replace(new.id::text, '-', ''), 1, 6)), true);
  else
    insert into public.profiles (id, display_name)
    values (new.id, new.raw_user_meta_data->>'name');
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- ---------- 3) cambiar_nombre_usuario: gratis si el nombre actual es autogenerado ----------
create or replace function public.cambiar_nombre_usuario(p_nombre text)
returns table (display_name text, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_nombre text := trim(p_nombre);
  v_actual text;
  v_generado boolean;
  v_saldo integer;
  v_costo constant integer := 100;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if length(v_nombre) < 2 or length(v_nombre) > 40 then
    raise exception 'el nombre tiene que tener entre 2 y 40 caracteres';
  end if;

  select pr.display_name, pr.nombre_generado, pr.puntos_total into v_actual, v_generado, v_saldo
  from public.profiles pr where pr.id = v_user;

  -- Gratis si nunca tuvo nombre O si el que tiene es el autogenerado de
  -- invitado (nunca lo eligió) — recién cobra Chispas a partir de
  -- reemplazar un nombre que la propia persona puso antes.
  if v_actual is not null and not coalesce(v_generado, false) then
    if v_saldo < v_costo then
      raise exception 'te faltan Chispas — cambiar de nombre cuesta % Chispas', v_costo;
    end if;
  end if;

  begin
    update public.profiles as pr
    set display_name = v_nombre,
        nombre_generado = false,
        puntos_total = case
          when v_actual is not null and not coalesce(v_generado, false) then pr.puntos_total - v_costo
          else pr.puntos_total
        end
    where pr.id = v_user;
  exception
    when unique_violation then
      raise exception 'ese nombre ya lo está usando otra cuenta';
  end;

  return query select pr.display_name, pr.puntos_total from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.cambiar_nombre_usuario(text) to authenticated;

-- ---------- 4) elegir_mundos_iniciales: 2 mundos gratis en vez de 1 ----------
create or replace function public.elegir_mundos_iniciales(p_mundos text[])
returns table (mundos_desbloqueados text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_actuales text[];
  v_validos constant text[] := array['numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
  v_mundo text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if cardinality(p_mundos) <> 2 then
    raise exception 'elegí exactamente 2 mundos';
  end if;
  if p_mundos[1] = p_mundos[2] then
    raise exception 'elegí 2 mundos distintos';
  end if;
  foreach v_mundo in array p_mundos loop
    if not (v_mundo = any(v_validos)) then
      raise exception 'mundo invalido';
    end if;
  end loop;

  select pr.mundos_desbloqueados into v_actuales from public.profiles pr where pr.id = v_user;

  if cardinality(v_actuales) > 0 then
    raise exception 'ya elegiste tus mundos iniciales';
  end if;

  update public.profiles as pr
  set mundos_desbloqueados = p_mundos
  where pr.id = v_user;

  return query
    select pr.mundos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.elegir_mundos_iniciales(text[]) to authenticated;
