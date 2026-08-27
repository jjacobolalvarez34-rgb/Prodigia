-- ============================================================
-- Fase 12 ("Mundos por Chispas"), con el ajuste pedido después: ya NO
-- hay un mundo gratis fijo (Numeria). Toda cuenta nueva arranca sin
-- ningún mundo desbloqueado y, como parte obligatoria del onboarding
-- (OnboardingForm, paso "mundo"), elige CUÁL de los 6 quiere gratis —
-- ese es el único que no le va a costar Chispas. El resto se compra a
-- 3000 Chispas cada uno — con la referencia de 0054/costos.ts (~120
-- Chispas/partida típica, catálogo completo ~190 partidas) eso son ~25
-- partidas: no se saca en una sola sentada pero tampoco exige semanas,
-- coherente con "utilidad/cosmético medio" de esa escala, no con el
-- techo de prestigio (marco_prodigio/fuente_manuscrita, ~5000).
-- ============================================================

alter table public.profiles
  add column if not exists mundos_desbloqueados text[] not null default array[]::text[];

-- Grandfathering: ninguna cuenta que YA jugaba antes de esta migración
-- debe perder acceso retroactivamente ni tener que "elegir" nada — se
-- le concede TODO lo que ya tenía de hecho. Geografía nunca tuvo
-- diagnóstico propio (siempre estuvo accesible con solo requireUsuario)
-- así que toda cuenta existente ya tenía acceso de hecho a esa Y a
-- Numeria. Esto es un UPDATE de una sola vez sobre las filas que
-- existen HOY — no afecta el default de la columna para cuentas
-- creadas después (que arrancan en array vacío y pasan por el paso
-- nuevo de onboarding).
update public.profiles
set mundos_desbloqueados = array(
  select distinct u from unnest(
    array['numeria', 'geografia']
    || case when onboarding_enigmia_completado then array['enigmia'] else array[]::text[] end
    || case when onboarding_quimia_completado then array['quimia'] else array[]::text[] end
    || case when onboarding_anatomia_completado then array['anatomia'] else array[]::text[] end
    || case when onboarding_melodia_completado then array['melodia'] else array[]::text[] end
  ) as u
);

-- ---------- elegir_mundo_inicial: el mundo gratis del onboarding ----------
-- Único momento en el que un mundo se desbloquea SIN cobrar Chispas —
-- por eso exige que el array esté vacío (cardinality 0, no NULL, por el
-- default de arriba). Una vez usada una vez por cuenta, cualquier otro
-- mundo pasa obligatoriamente por desbloquear_mundo (con costo).
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
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia') then
    raise exception 'mundo invalido';
  end if;

  select mundos_desbloqueados into v_actuales from public.profiles where id = v_user;

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

-- ---------- desbloquear_mundo: comprar cualquier otro mundo ----------
-- El precio NUNCA viaja desde el cliente (a diferencia de
-- comprar_item_tienda, que recibe p_costo ya calculado por la API route
-- — acá ni siquiera eso: el precio vive hardcodeado adentro de esta
-- función, p_mundo es un string opaco que sólo sirve para indexar el
-- catálogo de abajo). Mismo criterio de "nunca confiar en el cliente"
-- que pidió el usuario, llevado un paso más allá. Ahora incluye
-- 'numeria' en la lista válida: para una cuenta que eligió OTRO mundo
-- como el gratis, Numeria es un mundo pago más, como cualquier otro.
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
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia') then
    raise exception 'mundo invalido';
  end if;

  select puntos_total, mundos_desbloqueados into v_saldo, v_actuales
  from public.profiles where id = v_user;

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
