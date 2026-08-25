-- ============================================================
-- Prodigia — Fase 3 (revisión de Términos/Privacidad): auditoría del
-- borrado de cuenta encontró que duels.ganador_id (0016) y
-- duels.abandonado_por (0088) se agregaron con `references
-- public.profiles(id)` SIN especificar on delete — a diferencia de
-- CUALQUIER otra FK de duels hacia profiles, que son todas `on delete
-- cascade`. Sin acción explícita, Postgres usa NO ACTION por default:
-- en la práctica el borrado de cuenta probablemente nunca lo dispara
-- (retador_id/retado_id, que sí cascadean, ya destruyen la fila antes),
-- pero es un supuesto implícito, no una garantía del esquema — y una
-- garantía real es justamente lo que hace falta poder afirmar en la
-- página de Privacidad. Mismo criterio que ya se usa en
-- clanes.owner_id (0068): on delete set null, no cascade — perder al
-- ganador o a quien abandonó un duelo no debería borrar el duelo
-- entero de la otra persona, solo esa referencia puntual.
-- Correr después de 0092_chat_de_clan.sql.
-- ============================================================

alter table public.duels drop constraint if exists duels_ganador_id_fkey;
alter table public.duels add constraint duels_ganador_id_fkey
  foreign key (ganador_id) references public.profiles(id) on delete set null;

alter table public.duels drop constraint if exists duels_abandonado_por_fkey;
alter table public.duels add constraint duels_abandonado_por_fkey
  foreign key (abandonado_por) references public.profiles(id) on delete set null;
