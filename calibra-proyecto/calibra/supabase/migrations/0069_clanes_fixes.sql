-- ============================================================
-- Prodigia — Clanes, Fase 1 de la tanda siguiente: bug crítico real,
-- confirmado con una prueba en vivo (sesión anónima real contra el
-- proyecto, no solo lectura de código): crear_clan() funcionaba de
-- verdad (el insert de clanes + clan_membresias se hacía bien — se
-- confirmó con miembros_de_clan) pero mi_clan() SIEMPRE tiraba error:
--
--   ERROR 42702: column reference "clan_id" is ambiguous
--
-- Causa raíz: mi_clan() es `language plpgsql`, y en plpgsql las
-- columnas de RETURNS TABLE(...) quedan disponibles como variables
-- implícitas dentro del cuerpo de la función — "clan_id" es a la vez
-- una columna de salida de mi_clan() Y una columna real de
-- clan_membresias, así que la referencia sin calificar adentro del
-- subquery de cantidad_miembros quedaba ambigua. Nunca tiraba error al
-- CREAR el clan (esa función no tiene el conflicto) — recién se rompía
-- al intentar LEER "mi clan", que es exactamente el síntoma reportado:
-- "creo el clan pero el perfil no lo refleja y no hay forma de verlo".
-- Correr después de 0068_clanes_reales.sql.
-- ============================================================

create or replace function public.mi_clan()
returns table (
  clan_id uuid, nombre text, tag text, color_estandarte text, descripcion text,
  rol text, cantidad_miembros bigint, nivel_clan integer
)
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

  return query
    select c.id, c.nombre, c.tag, c.color_estandarte, c.descripcion, cm.rol,
      (select count(*) from public.clan_membresias cm2 where cm2.clan_id = c.id),
      public.nivel_clan(c.id)
    from public.clan_membresias cm
    join public.clanes c on c.id = cm.clan_id
    where cm.user_id = v_user;
end;
$$;
