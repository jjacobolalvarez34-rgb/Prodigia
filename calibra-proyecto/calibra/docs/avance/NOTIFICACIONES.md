# Notificaciones: inventario y mejoras (2026-10-29)

Pedido: «agregar y mejorar las notificaciones». Este archivo va dejando el avance.

## 1. Inventario (antes)

| Aviso | Dónde | Cuándo | Texto | Al tocar |
|---|---|---|---|---|
| Recordatorio de práctica (local) | `mobile/src/lib/notificaciones.ts` `cambiarRecordatorio` | Todos los días a la hora elegida (trigger DAILY), opt-in | «🔥 Un sprint y listo / 60 segundos de Numeria y tu racha suma un día más.» | `/numeria` |
| Gran Alineación (local) | `programarAvisosAlineacion` | El día anterior y 10 min antes de la próxima | «Mañana: la Gran Alineación…», «En 10 minutos…» | `/mundos` |
| Festividad (local) | `programarAvisosEvento` | Inicio, mitad y último día del evento (`celebracion.ts`) | Frases de `CELEBRACIONES` | `/` (Inicio: no lleva al evento) |
| Reto a duelo (push) | `functions/notify-duelo` | INSERT en `duels` pendiente, no emparejado | «⚔️ Te retaron a un duelo / X te desafió. ¿Aceptas?» | `/duelo/<id>` |
| Reto a duelo (in-app + barra local) | `mobile/src/ui/AvisoDuelo.tsx`, web `NotificacionesDuelo.tsx` | Realtime con la app abierta | Tarjeta con Aceptar/Rechazar + «⚔️ X te retó a un duelo» en la barra | `/duelo/<id>` |
| Mensaje directo (push) | `functions/notify-mensaje-directo` | INSERT, 1 cada 30 min por conversación | «💬 Nombre / vista previa» | `/chat/<id>` |
| Chat del clan (push) | `functions/notify-clan-mensaje` | INSERT, 1 cada 30 min | «X en el clan / vista previa» | `/clan/chat` |
| Anuncio (push) | `functions/notify-anuncio` | INSERT en `anuncios` (no arreglos), fuera de 21-08 | «🎉/✨ Título / descripción» | `/avisos` |
| Racha en riesgo (push) | `functions/racha-en-riesgo` | Programada 1 vez al día | «🔥 Tu racha sigue viva / Llevas N días…» | `/numeria` |
| Centro de avisos | `mobile/src/app/avisos.tsx` | Anuncios recientes (0243) | — | — |
| Ajustes | `mobile/src/app/ajustes-avisos.tsx` | 4 categorías (mensajes, duelos, racha, novedades) + recordatorio | — | — |
| Web | `NativePush.tsx` (solo contenedor Capacitor viejo) | — | La web no tiene ajustes de avisos ni push del navegador | — |

### Fallos encontrados

1. **Nunca se pedía el permiso** salvo entrando a Ajustes → Avisos o al centro de avisos: en Android 13+ casi nadie recibía nada (el comentario decía «después del primer sprint», pero no existía).
2. **Racha en riesgo del servidor con la fecha cambiada**: la racha usa `current_date` (día UTC). Si la tarea corre a las 19:00-20:00 de Colombia (00:00-01:00 UTC) ya es «mañana» en UTC: avisa a quien SÍ jugó y no a quien está por perderla. Además, una sola hora para todo el mundo (de noche en otros países).
3. **Recordatorio diario** salía aunque ya hubieras jugado hoy (trigger DAILY fijo) y con el mismo texto siempre; además, sin tope frente a los demás avisos locales.
4. **Duplicados del reto a duelo** con la app abierta: tarjeta in-app + aviso local en la barra + banner del push del servidor.
5. **Evento**: tocarlo llevaba al Inicio, no al evento. Alineación: solo la próxima, y el aviso del día anterior no aportaba (pedido: 1 h antes y al empezar).
6. **Emojis en títulos** (🔥 ⚔️ 💬 🎉 ✨ 🔧): prohibidos por la regla de estilo (el destello en especial).
7. Tope diario solo en el servidor; los locales (alineación, evento, recordatorio) no contaban.
8. Anuncio creado de noche: no se manda nunca (queda solo en el centro de avisos). Se deja así, documentado.

## 2. Cambios (hechos)

### App (mobile)

- `mobile/src/lib/notificaciones.ts`: **planificador único** de avisos locales (`replanificarAvisos`). Cancela todo lo suyo (prefijo `pg:` y los ids viejos, incluido el DAILY `recordatorio-practica`) y vuelve a programar los próximos 7 días con:
  - horario 08:00-21:00 del teléfono (lo que cae de noche se corre o se descarta según el tipo);
  - **tope de 2 avisos locales por día** por prioridad (recordatorio > racha > Alineación > evento/temporada/guerra > regalos), y dos del mismo día separados al menos 1 h;
  - textos que rotan por día, personalizados (primer nombre, racha, ciudad del jugador, clan), sin emojis.
  - Se rearma al abrir la app, al cambiar ajustes y **después de cada partida** (`jugador.ts` → `actualizarContextoAvisos`): si ya jugaste hoy, el recordatorio y la racha de hoy se cancelan.
- Tipos y a dónde llevan al tocar (`data.ruta`, respetando `AbrirDesdeAviso` de `_layout.tsx`):
  | Tipo | Cuándo | Lleva a |
  |---|---|---|
  | Recordatorio (opt-in, hora elegida) | Una vez por día; hoy no si ya cumpliste la meta; ciudad distinta cada día | `/<ciudad>` |
  | Racha en peligro (respaldo local) | 2 h antes del corte del día UTC (o 20:00 si cae de noche); solo sin push remoto (invitados, sin Google) y sin recordatorio activo | `/<ciudad>` |
  | Gran Alineación | 1 h antes y al empezar (antes: el día antes y 10 min) | `/mundos` |
  | Festividades | Inicio, mitad y último día | `/evento` (antes al Inicio) |
  | Temporada de rankeds (nuevo) | 18:00 del día antes del cierre; y si quedó la recompensa sin reclamar, al día siguiente a las 13:00 | `/competir`, `/` (abre `AnuncioTemporada`) |
  | Guerra de clanes (nuevo, con clan) | Últimas 3 h antes del cierre (lunes 00:00 UTC) y el resultado (1 h después, nunca antes de las 10:00) | `/social?seccion=clan` |
  | Recompensas por reclamar (nuevo) | Si hay cápsulas, regalos, misiones o calendario sin reclamar: al día siguiente a las 13:00 (se cancela si las reclamas) | `/recompensas` |
- **Permiso**: `mobile/src/ui/PedirAvisos.tsx` en la pantalla de resultado, una sola vez, explicando para qué (antes nunca se pedía solo).
- **Duelos sin duplicados**: con la app abierta, el push del servidor del reto ya no se muestra (lo cubre la tarjeta de `AvisoDuelo`); el aviso local del reto lleva id `duelo-<id>` (no se repite) y texto sin emoji con la ciudad.
- `mobile/src/app/ajustes-avisos.tsx`: un interruptor por tipo, en dos grupos («De otras personas»: mensajes, retos; «Tu juego»: racha, Alineación, festividades, temporada, guerra, recompensas, novedades). Los que necesitan cuenta se ven apagados para invitados. Preferencias viejas: si «Novedades» estaba apagada, Alineación y festividades quedan apagadas.
- La zona horaria del teléfono se manda al servidor (`actualizar_zona_push`, 0308; sin la migración se ignora el error).

### Servidor

- `racha-en-riesgo`: arreglado el día UTC; pensada para correr **cada hora**: a cada uno le llega una vez por día a su hora (zona del dispositivo; sin 0308, `ZONA_HORARIA`), nunca de noche, cuando faltan 3 h o menos para el corte (o desde las 19:00 si el corte le cae de noche). Tres textos que rotan, con nombre y racha.
- `notify-duelo`: «Ana te retó a un duelo / Duelo en Quimia…» (sin emoji, con la ciudad).
- `notify-anuncio` y `notify-mensaje-directo`: sin emojis en el título (el ✨ estaba prohibido).
- `_shared/avisos.ts`: `horaEn(zona)`, `enHorarioSilencioso(fecha, zona)`, `NOMBRE_MUNDO`, `primerNombre`.
- Migración `0308_avisos.sql`: `device_push_tokens.zona_horaria` + `actualizar_zona_push`. Validada con pglast.

### Descartados (con criterio: pocos y valiosos)

- «Ciudad de doble Exp de hoy»: no existe ese concepto en el juego (la Exp doble es la Gran Alineación, que ya avisa).
- «Un amigo te superó»: necesita disparadores en el servidor por cada partida y sería ruido; queda para cuando haya un resumen semanal.
- «Constelación casi completa»: ya se ve dentro de la app al terminar; como push sería diario.
- Web: no tiene ajustes de avisos ni push del navegador (solo `NativePush.tsx` del contenedor viejo); no se agregó.

## 3. Para publicar

1. Correr `calibra/supabase/migrations/0308_avisos.sql` (opcional; sin ella todo anda con la zona por defecto).
2. Desplegar: `supabase functions deploy racha-en-riesgo notify-duelo notify-anuncio notify-mensaje-directo` (las 4 importan `_shared/avisos.ts`; `notify-clan-mensaje` también lo importa pero no cambió su comportamiento).
3. Cambiar la programación de `racha-en-riesgo` a **cada hora** (`5 * * * *`).
4. La app: entra con el próximo APK (no se compiló).
