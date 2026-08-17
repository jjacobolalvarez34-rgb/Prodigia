-- ============================================================
-- Prodigia — reto diario (Fase YY)
-- Correr después de 0023_fix_recursion_grupos.sql
-- Los 5 problemas del día se generan en el cliente/servidor con una
-- semilla determinística por fecha (ver src/lib/retoDiario.ts) — no
-- hace falta guardar el contenido acá, solo si ya lo completaste.
-- ============================================================

create table public.retos_diarios_completados (
  user_id uuid not null references public.profiles(id) on delete cascade,
  fecha date not null,
  correctos smallint not null check (correctos between 0 and 5),
  puntos_bonus integer not null default 0,
  completado_at timestamptz not null default now(),
  primary key (user_id, fecha)
);

alter table public.retos_diarios_completados enable row level security;

create policy "usuarios ven sus retos diarios"
  on public.retos_diarios_completados for select
  using (auth.uid() = user_id);

-- El registro y el pago del bonus pasan por la función de abajo
-- (security definer), no por insert directo del cliente — así queda
-- atómico y valida que la fecha sea realmente hoy.
create function public.completar_reto_diario(p_fecha date, p_correctos smallint)
returns table (puntos_bonus integer, puntos_total integer, ya_completado boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_bonus integer;
  v_existe boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_fecha <> current_date then
    raise exception 'fecha invalida';
  end if;

  select exists(
    select 1 from public.retos_diarios_completados where user_id = v_user and fecha = p_fecha
  ) into v_existe;

  if v_existe then
    return query select 0, (select pr.puntos_total from public.profiles pr where pr.id = v_user), true;
    return;
  end if;

  v_bonus := greatest(0, least(5, p_correctos)) * 15;

  insert into public.retos_diarios_completados (user_id, fecha, correctos, puntos_bonus)
  values (v_user, p_fecha, p_correctos, v_bonus);

  update public.profiles as pr set puntos_total = pr.puntos_total + v_bonus where pr.id = v_user;

  return query select v_bonus, (select pr.puntos_total from public.profiles pr where pr.id = v_user), false;
end;
$$;

grant execute on function public.completar_reto_diario(date, smallint) to authenticated;

insert into public.achievements (slug, nombre, descripcion, categoria, criterio) values
('reto-diario-7', 'Constancia diaria', '7 días seguidos completando el reto diario.', 'racha', '{"tipo": "racha_retos_diarios", "valor": 7}'),
('reto-diario-30', 'Rutina de hierro', '30 días seguidos completando el reto diario.', 'racha', '{"tipo": "racha_retos_diarios", "valor": 30}');
