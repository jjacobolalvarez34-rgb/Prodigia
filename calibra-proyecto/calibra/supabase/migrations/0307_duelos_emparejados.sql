-- 0307 · Duelos del emparejamiento marcados (2026-10-29)
--
-- Bug «duelo casual leído como reto» (PENDIENTES_2026-10-13 punto 1): cuando el
-- rival te encuentra en la cola, buscar_rival_duelo inserta un duelo donde tú eres
-- el retado. Ese INSERT dispara el aviso en vivo («te retaron») y el push de
-- notify-duelo igual que un reto de un amigo, y el que esperaba lo aceptaba y se
-- trababa. Ahora la fila nace con `emparejado = true` y los avisos la saltan.
--
-- Sin tocar buscar_rival_duelo (0304): esa función borra de duel_queue a los dos
-- jugadores y en la MISMA transacción inserta el duelo (y las rondas de una serie).
-- Un trigger anota en una variable local de la transacción a quién sacó de la cola;
-- otro marca el duelo si el retado acaba de salir de la cola en esa transacción.
-- Un reto de un amigo nunca borra la fila de la cola del retado en su transacción.
--
-- Idempotente. El código funciona sin esta migración (la web y la app anotan el
-- duelo encontrado y tienen una gracia de 30 s; ver lib/duelos/emparejamiento.ts).

alter table public.duels add column if not exists emparejado boolean not null default false;

create or replace function public.anotar_salida_cola_duelo()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  perform set_config(
    'prodigia.salieron_cola',
    coalesce(nullif(current_setting('prodigia.salieron_cola', true), ''), ',') || old.user_id::text || ',',
    true
  );
  return old;
end;
$$;

drop trigger if exists anotar_salida_cola_duelo on public.duel_queue;
create trigger anotar_salida_cola_duelo
  after delete on public.duel_queue
  for each row execute function public.anotar_salida_cola_duelo();

create or replace function public.marcar_duelo_emparejado()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.retado_id is not null
     and position(',' || new.retado_id::text || ',' in coalesce(current_setting('prodigia.salieron_cola', true), '')) > 0 then
    new.emparejado := true;
  end if;
  return new;
end;
$$;

drop trigger if exists marcar_duelo_emparejado on public.duels;
create trigger marcar_duelo_emparejado
  before insert on public.duels
  for each row execute function public.marcar_duelo_emparejado();

comment on column public.duels.emparejado is
  'true si el duelo lo creó el emparejamiento (buscar_rival_duelo) y no un reto: no se avisa como «te retaron» (0307).';
