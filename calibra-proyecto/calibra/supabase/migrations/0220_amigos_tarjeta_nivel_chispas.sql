-- ============================================================
-- Prodigia — Amigos: la tarjeta de la cuadrícula de "Tus amigos" muestra
-- nivel de cuenta y chispas totales (pedido en vivo 2026-09-24: "que
-- aparezca una cuadrícula con 2 o 3 personas por fila, con su tarjeta
-- prodigia" — la misma tarjeta resumen de /perfil, que ya muestra Nivel y
-- Chispas totales además de rango).
--
-- mis_amigos() (0197_amigos_placa_y_quitar.sql) ya devuelve fondo, marco,
-- avatar, nombre, fuente, animación, color y rango — le faltaban
-- nivel_cuenta y puntos_total, que SÍ ya expone obtener_perfil_publico
-- (0161_color_nombre_personalizable.sql) leyendo las mismas columnas
-- directas de public.profiles (nada calculado, sin join extra). Mismo
-- cuerpo de 0197, solo se agregan esas 2 columnas.
-- RETURNS TABLE cambia -> hace falta drop, no alcanza con create or
-- replace (mismo criterio que 0161 y 0197).
-- ============================================================

drop function if exists public.mis_amigos();

create function public.mis_amigos()
returns table (
  friend_id uuid,
  display_name text,
  elo_rating integer,
  avatar_url text,
  marco_perfil text,
  fondo_perfil text,
  fondo_perfil_url text,
  titulo_activo text,
  titulo_nombre text,
  color_nombre text,
  fuente_nombre text,
  animacion_nombre text,
  nivel_cuenta integer,
  puntos_total integer
)
language sql
security definer
set search_path = public
as $$
  select
    p.id, p.display_name, p.elo_rating, p.avatar_url, p.marco_perfil,
    p.fondo_perfil, p.fondo_perfil_url, p.titulo_activo,
    public.titulo_nombre_de(p.id), p.color_nombre, p.fuente_nombre,
    p.animacion_nombre, p.nivel_cuenta, p.puntos_total
  from public.friendships f
  join public.profiles p on p.id = (case when f.user_id = auth.uid() then f.friend_id else f.user_id end)
  where (f.user_id = auth.uid() or f.friend_id = auth.uid()) and f.estado = 'aceptada';
$$;

grant execute on function public.mis_amigos() to authenticated;

notify pgrst, 'reload schema';
