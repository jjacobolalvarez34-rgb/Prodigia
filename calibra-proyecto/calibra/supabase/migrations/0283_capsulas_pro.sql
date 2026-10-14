-- ============================================================
-- Prodigia — Cápsulas Pro (0283).
--
-- Pedido del 2026-10-13: «en Pro sería bueno que recibieran más cápsulas
-- especiales, de las de mayor rango» y (2026-10-14) «Pro también debería darte Cometas
-- gratis». Cápsula nueva 'pro': 55 % cosmético épico,
-- 30 % legendario, 15 % de 150 a 300 Chispas (las probabilidades se ven antes de
-- abrir, como todas). Pro recibe 2 por semana, mientras dure: capsulas_pro_semana()
-- las da una sola vez por semana (origen 'pro:<lunes>:1' y ':2'); la llaman la web
-- y la app al revisar recompensas. La misma función da 300 Cometas por mes de Pro
-- (PLAN_ECONOMIA.md §5; referencia 'pro-cometas:<año-mes>', una vez por mes).
-- Requiere 0249, 0279 y 0280. Idempotente.
-- ============================================================

alter table public.capsulas_usuario drop constraint if exists capsulas_usuario_tipo_check;
alter table public.capsulas_usuario add constraint capsulas_usuario_tipo_check
  check (tipo in ('diaria', 'misiones', 'racha', 'nivel', 'ciudad', 'liga', 'liga_bronce', 'liga_plata', 'liga_oro', 'coleccion', 'pro'));

create or replace function public.contenido_capsula(p_tipo text)
returns table (premio text, peso integer, minimo integer, maximo integer)
language sql
immutable
as $$
  select t.premio, t.peso, t.minimo, t.maximo
  from (values
    ('diaria', 'chispas', 70, 15, 40),
    ('diaria', 'hielo', 10, 1, 1),
    ('diaria', 'tiempo_extra', 10, 1, 1),
    ('diaria', 'escudo', 10, 1, 1),
    ('misiones', 'chispas', 70, 15, 40),
    ('misiones', 'hielo', 10, 1, 1),
    ('misiones', 'tiempo_extra', 10, 1, 1),
    ('misiones', 'escudo', 10, 1, 1),
    ('racha', 'chispas', 60, 60, 160),
    ('racha', 'cosmetico_comun', 25, 1, 1),
    ('racha', 'cosmetico_raro', 15, 1, 1),
    ('nivel', 'chispas', 80, 20, 60),
    ('nivel', 'cosmetico_raro', 20, 1, 1),
    ('ciudad', 'coleccion', 100, 1, 1),
    ('liga', 'chispas', 100, 40, 100),
    ('liga_bronce', 'chispas', 60, 80, 200),
    ('liga_bronce', 'cosmetico_raro', 40, 1, 1),
    ('liga_plata', 'cosmetico_raro', 60, 1, 1),
    ('liga_plata', 'cosmetico_epico', 40, 1, 1),
    ('liga_oro', 'cosmetico_epico', 60, 1, 1),
    ('liga_oro', 'cosmetico_legendario', 40, 1, 1),
    ('coleccion', 'marco_coleccion', 100, 1, 1),
    ('pro', 'cosmetico_epico', 55, 1, 1),
    ('pro', 'cosmetico_legendario', 30, 1, 1),
    ('pro', 'chispas', 15, 150, 300)
  ) as t(tipo, premio, peso, minimo, maximo)
  where t.tipo = p_tipo;
$$;

create or replace function public.capsulas_pro_semana()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_lunes date := date_trunc('week', current_date)::date;
  v_n integer;
begin
  if v_user is null then
    return 0;
  end if;
  if not exists (select 1 from public.profiles pr where pr.id = v_user and pr.plan = 'pro') then
    return 0;
  end if;
  insert into public.capsulas_usuario (user_id, tipo, mundo, origen)
  values (v_user, 'pro', null, 'pro:' || v_lunes || ':1'), (v_user, 'pro', null, 'pro:' || v_lunes || ':2')
  on conflict (user_id, origen) do nothing;
  get diagnostics v_n = row_count;
  perform public._dar_cometas(v_user, 300, 'pro', 'pro-cometas:' || to_char(current_date, 'YYYY-MM'));
  return v_n;
end;
$$;
revoke execute on function public.capsulas_pro_semana() from public, anon;
grant execute on function public.capsulas_pro_semana() to authenticated;

notify pgrst, 'reload schema';
