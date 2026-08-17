-- ============================================================
-- Prodigia — nivel de mundo, tercer eje de progreso (Fase DD2)
-- Correr después de 0032_algebra_basica.sql
-- Independiente de puntos_total (permanente, de cuenta) y del ranking
-- semanal (temporal) — este es un tercer contador: cuánto sumaste dentro
-- de CADA mundo específicamente, nunca baja, con su propio nivel en
-- curva no lineal (cada nivel pide más puntos que el anterior).
-- ============================================================

create table public.world_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  world text not null check (world in ('numeria', 'enigmia', 'geografia')),
  puntos_mundo integer not null default 0,
  nivel_mundo integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (user_id, world)
);

alter table public.world_progress enable row level security;

create policy "usuarios ven su propio progreso de mundo"
  on public.world_progress for select
  using (auth.uid() = user_id);

-- Curva de nivel tipo RPG: para llegar al nivel N hacen falta
-- 50 × N × (N-1) puntos acumulados (nivel 1 = 0, nivel 2 = 100,
-- nivel 3 = 300, nivel 5 = 1000, nivel 10 = 4500...) — cada nivel pide
-- más que el anterior, no es lineal. Se llama una vez por partida
-- terminada (nunca por intento suelto), sumando los Puntos que esa
-- partida ya le sumó a puntos_total — nunca resta ni se recalcula desde
-- cero, solo acumula.
create function public.registrar_puntos_mundo(p_world text, p_puntos integer)
returns table (world text, puntos_mundo integer, nivel_mundo integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_puntos integer;
  v_nivel integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  if p_puntos <= 0 then
    select w.puntos_mundo, w.nivel_mundo into v_puntos, v_nivel
    from public.world_progress w where w.user_id = v_user and w.world = p_world;
    return query select p_world, coalesce(v_puntos, 0), coalesce(v_nivel, 1);
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

  return query select p_world, v_puntos, v_nivel;
end;
$$;

grant execute on function public.registrar_puntos_mundo(text, integer) to authenticated;
