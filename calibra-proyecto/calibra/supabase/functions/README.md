# Edge Functions de avisos push

Mandan notificaciones por Firebase Cloud Messaging (FCM v1) a los dispositivos guardados en
`device_push_tokens` (0114). Las recibe la app móvil (`calibra-proyecto/mobile`) y también el
contenedor Capacitor viejo. Reglas de avisos en `docs/app-nativa/04-BUCLE-DE-ENGANCHE.md` §5.

| Función | Cuándo se dispara | Categoría (0243) | Límite |
|---|---|---|---|
| `notify-mensaje-directo` | Database Webhook: INSERT en `mensajes_directos` | mensajes | 1 cada 30 min por conversación |
| `notify-clan-mensaje` | Database Webhook: INSERT en `clan_mensajes` | mensajes | 1 cada 30 min por persona y clan |
| `notify-duelo` | Database Webhook: INSERT en `duels` | duelos | inmediato |
| `notify-anuncio` | Database Webhook: INSERT en `anuncios` | novedades | tope de retención (2/día) y nunca de 21:00 a 08:00; los `arreglo` no se mandan |
| `racha-en-riesgo` | Programada **cada hora** (cron `5 * * * *`); a cada uno le llega a su hora (zona del teléfono, 0308) | racha | 1 por día de racha + tope de retención (2/día); nunca de 21:00 a 08:00 en su zona |

`_shared/avisos.ts` tiene las reglas comunes (categorías, límite anti-spam en `push_throttle`,
horario silencioso, secreto del webhook). `_shared/fcm.ts` arma y manda el mensaje (canal de
Android, color y etiqueta para agrupar).

## Puesta en marcha

1. Aplicar la migración `0243_app_notificaciones.sql` (antes de desplegar las funciones: sin ella
   siguen funcionando, pero sin categorías ni límites).
2. Secrets del proyecto (Project settings → Edge Functions → Secrets):
   - `FIREBASE_SERVICE_ACCOUNT` — JSON de la service account de Firebase (ya existía).
   - `WEBHOOK_SECRET` — **recomendado** (SEG-04): una clave larga al azar. Si está definida, cada
     función exige el header `x-webhook-secret` con ese valor.
   - `ZONA_HORARIA` — opcional, por defecto `America/Bogota` (para el horario silencioso).
2b. Aplicar `0308_avisos.sql` (zona horaria por dispositivo). Sin ella, `racha-en-riesgo` usa
   `ZONA_HORARIA` para todos. Ojo: la racha se cuenta por día UTC (`current_date`), así que la
   tarea programada debe correr cada hora; una sola corrida diaria a las 19:00 de Colombia ya
   cae en el día UTC siguiente y avisaba a quien sí había jugado.
3. Desplegar: `supabase functions deploy notify-mensaje-directo notify-anuncio notify-clan-mensaje notify-duelo racha-en-riesgo`.
4. Database Webhooks (Database → Webhooks), tipo "Supabase Edge Functions", evento INSERT, uno por
   tabla de la tabla de arriba. Si definiste `WEBHOOK_SECRET`, agregar en cada webhook el header
   `x-webhook-secret` con el mismo valor.
