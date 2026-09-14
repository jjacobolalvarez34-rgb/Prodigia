-- ====================================================================
-- Prodigia — Rediseño del "banner de afinidad" del perfil (a pedido
-- del propietario: "no tiene sentido poner el nivel que uno elija...
-- mi idea era mas como elejir la ciudad favorita y que muestre sus
-- estadisticas"). Antes profiles.afinidad_banner guardaba
-- [{ref, nombre, nivel}] con un "nivel" 1-100 tipeado a mano por el
-- usuario, sin relación con nada real. Ahora:
--   - Se saca "nivel" del todo: el nivel SIEMPRE se lee en vivo de
--     world_progress del lado del cliente (BannerHabilidades.tsx),
--     nunca se guarda un número inventado.
--   - "ref" queda acotado a los 8 mundos reales (antes aceptaba
--     cualquier string no vacío, incluyendo los "temas" de Numeria que
--     no tienen un nivel de 100 comparable).
-- guardar_afinidad_banner sigue devolviendo jsonb (mismo tipo de
-- retorno que antes — create or replace alcanza, sin drop).
-- ====================================================================

create or replace function public.guardar_afinidad_banner(p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_arr jsonb := coalesce(p_items, '[]'::jsonb);
  v_item record;
  v_mundos constant text[] := array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if v_arr is null or jsonb_typeof(v_arr) <> 'array' then
    raise exception 'formato invalido';
  end if;
  if jsonb_array_length(v_arr) > 8 then
    raise exception 'demasiados items';
  end if;
  for v_item in select value as v from jsonb_array_elements(v_arr) loop
    if jsonb_typeof(v_item.v) <> 'object'
       or not (v_item.v->>'ref' = any(v_mundos))
       or v_item.v->>'nombre' is null or btrim(v_item.v->>'nombre') = ''
       or length(v_item.v->>'nombre') > 60
    then
      raise exception 'item invalido';
    end if;
  end loop;
  update public.profiles set afinidad_banner = v_arr where id = v_user;
  return v_arr;
end;
$$;

grant execute on function public.guardar_afinidad_banner(jsonb) to authenticated;

notify pgrst, 'reload schema';
