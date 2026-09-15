-- Pedido en vivo (2026-09-15): "la mesa de apuestas muestra juegos que
-- no están ocurriendo... deben estar pasando en este momento". Causa
-- real: fetch_apuestas_disponibles() (0123, retocada en 0126) incluía
-- duelos en estado 'pendiente' — un reto YA MANDADO pero que el otro
-- jugador todavía no aceptó (puede tardar, puede nunca aceptarlo, puede
-- expirar). Eso no es una partida "en curso": apostar sobre un desafío
-- que quizás nunca arranca no es lo que se pidió. Se saca 'pendiente'
-- del filtro — solo quedan duelos con estado = 'en_curso' (ya aceptado,
-- jugándose de verdad en este momento).
create or replace function public.fetch_apuestas_disponibles()
returns table (
  partida_id uuid,
  tipo text,
  estado text,
  operation_type text,
  jugador_a_id uuid,
  jugador_b_id uuid,
  nombre_a text,
  nombre_b text,
  elo_a integer,
  elo_b integer
)
language sql
security definer
set search_path = public
stable
as $$
  select
    d.id as partida_id,
    'duelo'::text as tipo,
    d.estado,
    d.operation_type,
    d.retador_id as jugador_a_id,
    d.retado_id as jugador_b_id,
    pa.display_name as nombre_a,
    pb.display_name as nombre_b,
    pa.elo_rating as elo_a,
    pb.elo_rating as elo_b
  from public.duels d
  join public.profiles pa on pa.id = d.retador_id
  join public.profiles pb on pb.id = d.retado_id
  where d.estado = 'en_curso'
    and auth.uid() not in (d.retador_id, d.retado_id)
    and not pa.es_cuenta_prueba
    and not pb.es_cuenta_prueba
    and not exists (
      select 1 from public.trastienda_apuestas a
      where a.user_id = auth.uid() and a.partida_id = d.id
    )
  order by d.creado_at desc
  limit 20;
$$;

grant execute on function public.fetch_apuestas_disponibles() to authenticated;
