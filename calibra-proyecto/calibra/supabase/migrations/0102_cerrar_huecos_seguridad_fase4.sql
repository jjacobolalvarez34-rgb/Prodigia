-- ============================================================
-- Prioridad máxima (2026-08-30) — cierra los 3 huecos de seguridad
-- documentados en la auditoría de Fase 4 (docs/PROGRESO.md, Décima
-- tercera tanda, Sección 2 + Sección 7). Migración propia, separada de
-- 0094-0101, por seguridad real, no una feature.
--
-- LOS 3 SE REPRODUJERON DE VERDAD ANTES DE ARREGLAR NADA — con las 2
-- cuentas QA propias (QA1 atacante, QA2 víctima), nunca contra cuentas
-- reales. Resultado exacto de la reproducción controlada:
--
--   1. desbloquear_titulo(p_user_id, ...): QA1 llamó al RPC con el
--      user_id de QA2 → el título se insertó en la cuenta de QA2 y,
--      como era su primer título, hasta le pisó titulo_activo
--      (null → el slug inventado por QA1), SIN que QA2 hiciera nada.
--      Confirmado: `select vacío` (sin error) y la fila apareció en
--      titulos_usuario de QA2.
--
--   2. feed_posts INSERT: QA1 posteó tipo='logro' con el achievement_id
--      de un logro que NO tiene (confirmado antes: QA1 no estaba en
--      user_achievements para ese logro) — insert OK, tarjeta falsa
--      creada. Por separado, QA1 también posteó tipo='resultado_duelo'
--      con un duel_id de un duelo AJENO (no jugado por QA1) y un
--      rival_nombre 100% inventado — insert OK también.
--
--   3. duel_results / duel_queue:
--      - duel_results con un duel_id inventado: correctamente
--        RECHAZADO por la policy que ya arregló 0035_auditoria_
--        lanzamiento_rls.sql (valida que sos parte del duelo) — ESTE
--        caso ya estaba cerrado, no hacía falta tocarlo.
--      - duel_results para un duelo REAL donde QA1 sí participa, con
--        puntaje_final=999999 inventado: insert OK — acá sí hay hueco
--        real (podés participar de verdad y aun así fabricar tu propio
--        resultado en vez de que lo calcule registrar_resultado_duelo).
--      - duel_queue con elo_rating=99999 inventado: insert OK — hueco
--        real (buscar_rival_duelo, la única vía legítima, siempre lee
--        el elo_rating REAL de profiles, nunca confía en uno mandado
--        por el cliente — la policy vieja sí lo permitía igual).
--
-- Grep completo sobre src/ confirma que NINGUNA de las 3 tablas recibe
-- un insert directo del cliente para los casos que se cierran acá — a
-- diferencia de feed_posts (logro/desafio/nivel_mundo SÍ se insertan
-- directo desde rutas de API con la sesión normal del usuario, no con
-- una función security definer), así que ahí no se puede sacar la
-- policy entera, hay que hacerla más estricta en vez de borrarla.
-- ============================================================

-- ---------- 1) desbloquear_titulo: ya no callable directo con un p_user_id ajeno ----------
-- OJO — esto no es tan simple como revocar el EXECUTE sin más: releyendo
-- el código real, src/lib/titulos/verificar.ts SÍ llama a
-- `desbloquear_titulo` directo desde la sesión NORMAL del cliente
-- (rpc() con el mismo supabase de la request, no un admin), y eso pasa
-- en 7 rutas de API reales (duelos/resultado, duelos/finalizar-serie,
-- practica/finish, enigmia/finish, enigmia/completar-leccion,
-- aprender/completar, reto-diario/completar) — siempre con
-- `userId = user.id`, nunca con el id de otra cuenta. Revocar el
-- EXECUTE de `authenticated` directo habría roto los títulos de rango/
-- mundo-completado de TODO el mundo, no solo cerrado el hueco.
--
-- La función SIGUE necesitando aceptar un p_user_id que NO sea
-- auth.uid() para el caso legítimo real: cuando alguien se rinde y es
-- el RIVAL el que sube de rango (0088_rendirse_duelo.sql llama
-- `desbloquear_titulo(v_otro_id, ...)` desde adentro de otra función
-- security definer) — sacarle esa capacidad de raíz rompería eso.
--
-- Fix real: revocar el EXECUTE directo de `authenticated` sobre la
-- función de 4 parámetros (las llamadas internas entre funciones
-- security definer siguen andando igual — esos privilegios se evalúan
-- contra el OWNER de la función que llama, nunca contra el rol
-- `authenticated`, así que 0088 no se ve afectado) y agregar un wrapper
-- nuevo, de 3 parámetros, que SIEMPRE usa auth.uid() — ese es el único
-- que queda grantable al cliente. verificar.ts pasa a llamar al
-- wrapper, no a la función original.
revoke execute on function public.desbloquear_titulo(uuid, text, text, text) from authenticated;

create function public.desbloquear_titulo_propio(p_slug text, p_nombre text, p_origen text default 'rango')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'no autenticado';
  end if;
  perform public.desbloquear_titulo(auth.uid(), p_slug, p_nombre, p_origen);
end;
$$;

grant execute on function public.desbloquear_titulo_propio(text, text, text) to authenticated;

-- ---------- 2) feed_posts: INSERT valida contenido, no solo dueño ----------
-- Antes: with check (auth.uid() = user_id) — cualquier tipo, cualquier
-- achievement_id/duel_id/nivel_mundo_valor, sin verificar que sea real.
--
-- Ahora: solo se puede insertar directo (sesión normal del cliente,
-- rutas /api/practica/finish, /api/enigmia/finish, /api/feed/crear-
-- desafio, verificarLogros) para los 3 tipos que de verdad se insertan
-- así en el código real (confirmado por grep en src/):
--   - 'logro': el achievement tiene que ser uno que el usuario YA tenga
--     en user_achievements (se inserta ahí primero, siempre antes del
--     post del feed — confirmado leyendo src/lib/logros/verificar.ts).
--   - 'desafio': ya estaba suficientemente acotado por el CHECK de
--     tabla (operation_type/nivel/cantidad_problemas, todos enum o
--     rango) — no hace falta un chequeo extra acá.
--   - 'nivel_mundo': el nivel declarado no puede superar el nivel real
--     que el usuario tiene guardado en world_progress para ese mundo.
-- 'resultado_duelo', 'subida_rango' y 'desafio_personalizado' quedan
-- afuera del todo — ninguno se inserta nunca desde una sesión normal
-- del cliente (todos pasan por funciones security definer:
-- registrar_resultado_duelo, crear_problema_personalizado, etc., que
-- bypassean RLS por diseño y no necesitan esta policy abierta).
drop policy if exists "usuarios publican sus propias tarjetas" on public.feed_posts;

create policy "usuarios publican sus propias tarjetas"
  on public.feed_posts for insert
  with check (
    auth.uid() = user_id
    and (
      (
        tipo = 'logro'
        and exists (
          select 1 from public.user_achievements ua
          where ua.user_id = auth.uid() and ua.achievement_id = feed_posts.achievement_id
        )
      )
      or tipo = 'desafio'
      or (
        tipo = 'nivel_mundo'
        and exists (
          select 1 from public.world_progress wp
          where wp.user_id = auth.uid()
            and wp.world = feed_posts.mundo
            and wp.nivel_mundo >= feed_posts.nivel_mundo_valor
        )
      )
    )
  );

-- ---------- 3) duel_results: sin policy de INSERT para el cliente ----------
-- Confirmado por grep: ningún lugar de src/ hace
-- .from("duel_results").insert(...) — la única vía real es
-- registrar_resultado_duelo (security definer, ya bypassea RLS). La
-- policy de 0035 ya evitaba el caso "duel_id ajeno", pero seguía
-- dejando fabricar cualquier puntaje/precisión en un duelo propio real
-- — sacarla entera cierra las dos cosas de una, sin romper nada (nada
-- la necesitaba).
drop policy if exists "usuarios insertan su propio resultado de duelo" on public.duel_results;

-- ---------- 4) duel_queue: sin policy de escritura para el cliente ----------
-- Mismo caso: buscar_rival_duelo (la única vía real, security
-- definer) siempre lee el elo_rating REAL desde profiles, nunca confía
-- en uno que mande el cliente — pero la policy "for all" vieja sí
-- dejaba a cualquiera escribir su fila con cualquier elo_rating/mundo/
-- operation_type inventado. Se deja la de SELECT (ver "tu propia cola
-- de búsqueda" en Rankeds), se saca la de escritura.
drop policy if exists "usuarios manejan su propia cola de matchmaking" on public.duel_queue;
