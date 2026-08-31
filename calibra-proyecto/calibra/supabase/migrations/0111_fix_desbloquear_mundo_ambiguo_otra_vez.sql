-- ============================================================
-- Fix urgente: 0110_ocho_mundos.sql reintrodujo el bug de columna
-- ambigua que 0106 ya había arreglado — al reescribir
-- elegir_mundo_inicial/desbloquear_mundo para agregar trigonometria/
-- historia, se copió por error la forma de 0097 (sin qualificar
-- "mundos_desbloqueados"/"puntos_total" en el SELECT inicial), que
-- vuelve a chocar contra el nombre de columna de salida del `returns
-- table`. Mismo síntoma: "no se pudo comprar en este momento".
-- Correr después de 0110_ocho_mundos.sql.
-- ============================================================

create or replace function public.elegir_mundo_inicial(p_mundo text)
returns table (mundos_desbloqueados text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_actuales text[];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia') then
    raise exception 'mundo invalido';
  end if;

  select pr.mundos_desbloqueados into v_actuales from public.profiles pr where pr.id = v_user;

  if cardinality(v_actuales) > 0 then
    raise exception 'ya elegiste tu mundo inicial';
  end if;

  update public.profiles as pr
  set mundos_desbloqueados = array[p_mundo]
  where pr.id = v_user;

  return query
    select pr.mundos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.elegir_mundo_inicial(text) to authenticated;

create or replace function public.desbloquear_mundo(p_mundo text)
returns table (puntos_total integer, mundos_desbloqueados text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_actuales text[];
  v_costo constant integer := 3000;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia') then
    raise exception 'mundo invalido';
  end if;

  select pr.puntos_total, pr.mundos_desbloqueados into v_saldo, v_actuales
  from public.profiles pr where pr.id = v_user;

  if p_mundo = any(v_actuales) then
    raise exception 'ya tenés ese mundo desbloqueado';
  end if;
  if v_saldo < v_costo then
    raise exception 'te faltan Chispas — % cuesta % Chispas', p_mundo, v_costo;
  end if;

  update public.profiles as pr
  set puntos_total = pr.puntos_total - v_costo,
      mundos_desbloqueados = array_append(pr.mundos_desbloqueados, p_mundo)
  where pr.id = v_user;

  return query
    select pr.puntos_total, pr.mundos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.desbloquear_mundo(text) to authenticated;
