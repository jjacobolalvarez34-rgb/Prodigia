-- ============================================================
-- Prodigia — Fase 5 de la tanda "Rankeds/Clanes: bugs y ranking
-- visible": duplicar el roster del Clan de Bots (18 -> 36) para que
-- jugar seguido contra bots en rangos bajos no se sienta repetitivo.
-- Los 18 nuevos se intercalan con los ELO ya existentes (680-1270)
-- para duplicar la densidad de rivales en Bronce/Plata/Oro
-- específicamente — no se extiende el rango hacia arriba, el pedido
-- fue "más variedad en rangos bajos", no más rango.
--
-- El seed original (0066) tiene un guard idempotente que corta si el
-- Clan de Bots YA existe — por diseño, para no re-sembrar los 18
-- originales en cada corrida. Acá el guard es por bot individual (si
-- ya existe un perfil con ese display_name y es_bot), así esta
-- migración también es segura de correr más de una vez.
-- ============================================================

do $$
declare
  v_clan_id uuid;
  v_instance_id uuid;
  v_bot record;
  v_id uuid;
  v_velocidad_min integer;
  v_velocidad_max integer;
  v_tasa numeric;
begin
  select id into v_clan_id from public.clanes where tipo = 'bots' limit 1;
  if v_clan_id is null then
    raise exception 'no existe el Clan de Bots todavía — correr 0066_clan_de_bots.sql primero';
  end if;

  select instance_id into v_instance_id from auth.users limit 1;
  v_instance_id := coalesce(v_instance_id, '00000000-0000-0000-0000-000000000000'::uuid);

  for v_bot in
    select * from (values
      ('Eco Binario', 700),
      ('Cripta Sol', 740),
      ('Ohm Rayo', 780),
      ('Vector Nix', 815),
      ('Prisma Kilo', 845),
      ('Zeta Cobre', 875),
      ('Runa Diesel', 905),
      ('Cuanto Vela', 935),
      ('Bit Rombo', 965),
      ('Delta Prisma', 995),
      ('Lumen Cripta', 1025),
      ('Ion Kilo', 1055),
      ('Fractal Doce', 1085),
      ('Sigma Ohm', 1120),
      ('Neón Vector', 1160),
      ('Pixel Nova', 1200),
      ('Kappa Cero', 1245),
      ('Radián Binario', 1290)
    ) as t(nombre, elo)
  loop
    if exists (select 1 from public.profiles where display_name = v_bot.nombre and es_bot) then
      continue; -- ya sembrado en una corrida anterior de esta migración
    end if;

    v_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      is_anonymous, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      v_instance_id, v_id, 'authenticated', 'authenticated',
      'bot-' || v_id || '@clandebots.prodigia.internal',
      '!sin-acceso-' || md5(random()::text || clock_timestamp()::text),
      now(), '{"provider": "bot", "providers": ["bot"]}'::jsonb,
      jsonb_build_object('name', v_bot.nombre),
      false, now(), now(),
      '', '', '', ''
    );

    v_velocidad_min := round(4200 - (v_bot.elo - 650) * 2.6)::integer;
    v_velocidad_max := v_velocidad_min + 1100;
    v_tasa := round((0.5 + (v_bot.elo - 650) / 950.0 * 0.4)::numeric, 3);

    update public.profiles
      set elo_rating = v_bot.elo,
          es_bot = true,
          onboarding_completado = true,
          onboarding_enigmia_completado = true,
          onboarding_quimia_completado = true
      where id = v_id;

    insert into public.clan_miembros (perfil_id, clan_id, velocidad_ms_min, velocidad_ms_max, tasa_acierto)
    values (v_id, v_clan_id, v_velocidad_min, v_velocidad_max, v_tasa);
  end loop;
end $$;
