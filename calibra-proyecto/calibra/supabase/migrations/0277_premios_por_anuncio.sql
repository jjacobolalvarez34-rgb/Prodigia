-- ============================================================
-- Prodigia — Premios por ver un anuncio (0277).
--
-- Decisión del 2026-10-10 (PLAN_ECONOMIA.md §6): anuncios solo en cuentas
-- gratis, siempre opcionales cuando dan premio. Dos premios, una vez por día
-- cada uno:
--   - 'calendario': repite el premio del calendario que reclamaste hoy.
--   - 'capsula': una cápsula extra (la de la partida del día).
-- Pro no ve anuncios: recibe los mismos dos premios con un toque.
--
-- La app (AdMob) y la web (AdSense) llaman a premio_por_anuncio() cuando el
-- anuncio terminó. El tope de uno por día y por tipo lo pone la base, así que
-- llamarla sin ver el anuncio no da más que eso. Cuando haya cuentas reales de
-- AdMob conviene sumar la verificación del lado del servidor (SSV).
-- Requiere 0249 y 0259. Idempotente.
-- ============================================================

create table if not exists public.premios_anuncio (
  user_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null check (tipo in ('calendario', 'capsula')),
  fecha date not null default current_date,
  creado_at timestamptz not null default now(),
  primary key (user_id, tipo, fecha)
);

alter table public.premios_anuncio enable row level security;
drop policy if exists "cada uno ve sus premios por anuncio" on public.premios_anuncio;
create policy "cada uno ve sus premios por anuncio" on public.premios_anuncio for select using (auth.uid() = user_id);
grant select on public.premios_anuncio to authenticated;

-- Qué premios de anuncio ya usaste hoy.
create or replace function public.premios_anuncio_hoy()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(p.tipo), '{}') from public.premios_anuncio p
  where p.user_id = auth.uid() and p.fecha = current_date;
$$;

grant execute on function public.premios_anuncio_hoy() to authenticated;

create or replace function public.premio_por_anuncio(p_tipo text)
returns table (tipo text, premio text, cantidad integer, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_dia smallint;
  v_fecha date;
  v_premio record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_tipo not in ('calendario', 'capsula') then
    raise exception 'premio invalido';
  end if;
  if exists (select 1 from public.profiles pr where pr.id = v_user and pr.plan = 'colegio') then
    raise exception 'no disponible';
  end if;

  if p_tipo = 'calendario' then
    select c.dia, c.ultima_fecha into v_dia, v_fecha from public.calendario_usuario c where c.user_id = v_user;
    if v_fecha is distinct from current_date then
      raise exception 'reclama primero el premio de hoy';
    end if;
  end if;

  insert into public.premios_anuncio (user_id, tipo) values (v_user, p_tipo)
  on conflict do nothing;
  if not found then
    raise exception 'ya usaste este premio hoy';
  end if;

  if p_tipo = 'capsula' then
    insert into public.capsulas_usuario (user_id, tipo, origen) values (v_user, 'diaria', 'anuncio:' || current_date)
    on conflict (user_id, origen) do nothing;
    return query select p_tipo, 'capsula'::text, 1, pr.puntos_total from public.profiles pr where pr.id = v_user;
    return;
  end if;

  -- Mismo premio que reclamar_calendario (0259) para el día que reclamaste hoy.
  select * into v_premio from public.premios_calendario() p where p.dia = v_dia;
  if v_premio.premio = 'chispas' then
    perform public._dar_chispas(v_user, v_premio.cantidad);
  elsif v_premio.premio = 'hielo' then
    update public.profiles as pr set hielos_disponibles = pr.hielos_disponibles + 1 where pr.id = v_user;
  elsif v_premio.premio = 'tiempo_extra' then
    update public.profiles as pr set tiempos_extra_disponibles = pr.tiempos_extra_disponibles + 1 where pr.id = v_user;
  elsif v_premio.premio = 'estrellas' then
    perform public._sumar_estrellas(v_user, public._ciudad_favorita(v_user), v_premio.cantidad, 'anuncio-calendario:' || current_date);
  end if;

  return query select p_tipo, v_premio.premio, v_premio.cantidad, pr.puntos_total from public.profiles pr where pr.id = v_user;
end;
$$;

revoke execute on function public.premio_por_anuncio(text) from public, anon;
grant execute on function public.premio_por_anuncio(text) to authenticated;

notify pgrst, 'reload schema';
