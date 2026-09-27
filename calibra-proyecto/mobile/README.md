# Prodigia — app móvil (Expo)

Primera versión jugable de la app nativa descrita en `../calibra/docs/app-nativa/`. Misma cuenta,
mismo progreso y mismas Chispas que la web: habla directo con el mismo Supabase.

## Qué tiene hoy

- Login con correo o nombre de usuario + contraseña, o entrar como invitado.
- Elegir los 2 mundos iniciales (si la cuenta todavía no lo hizo).
- Inicio con racha, Chispas, nivel de cuenta y los 13 mundos.
- **Numeria**: sprint de 60 s con las 4 operaciones, teclado propio con vibración, nivel que se
  ajusta solo, y resultado con Chispas, precisión, meta del día y subidas de nivel.

- **Avisos** (campana del inicio): mensajes sin leer y novedades/eventos de Prodigia en tarjetas por
  tipo; **Ajustes de avisos** para elegir categorías (mensajes, duelos, racha, novedades), un
  recordatorio diario de práctica y agregar los widgets.
- **Destacados** en el inicio: tarjetas de las funciones de Prodigia (Numeria, Aprender, Rankeds,
  Clanes, Reto diario, widgets) y de las novedades pendientes.
- **Notificaciones push** (mensajes directos y de clan, duelos, racha en riesgo, novedades) con un
  canal de Android por categoría. Las mandan las Edge Functions de la web
  (`../calibra/supabase/functions/README.md`). El permiso se pide después de la primera partida.
- **Widgets de Android**: "Racha" (2×2) y "Progreso" (4×3, con meta del día, avisos y botón para
  jugar). Se refrescan al terminar una partida, al abrir la app y cada 30 min.

Los otros 12 mundos aparecen como "Pronto en la app". La Trastienda no está en la app
(política de Google Play para apps con menores, ver PROD-01 en
`../calibra/docs/audits/REVISION-GENERAL-2026-09-26.md`).

## Cómo probarla en tu teléfono (sin instalar Android Studio)

1. Instala **Expo Go** desde Google Play.
2. En esta carpeta: `npm install` (solo la primera vez) y después `npx expo start`.
3. Escanea el código QR que aparece en la terminal con Expo Go. El teléfono y la computadora
   tienen que estar en la misma red Wi-Fi; si no se conecta, usa `npx expo start --tunnel`.

En Expo Go **no** funcionan los widgets ni el push remoto (Expo Go no trae esos módulos nativos);
el resto sí, incluido el recordatorio diario. Para probar todo, instala el APK:

## APK instalable (widgets y push incluidos)

Se compila en la nube de Expo (EAS Build), sin Android Studio. Una sola vez:

```sh
npx eas-cli@latest login      # cuenta gratuita de expo.dev
npx eas-cli@latest init       # vincula esta carpeta a un proyecto de Expo (agrega el projectId a app.json)
```

Y cada vez que quieras un APK nuevo:

```sh
npx eas-cli@latest build -p android --profile preview
```

Al terminar da un link y un QR para descargar el APK e instalarlo en el teléfono (Android pide
permitir "instalar apps de origen desconocido" la primera vez). La URL y la clave publicable de
Supabase van en `eas.json` porque EAS no sube `.env.local`; son públicas por diseño (la web las
entrega igual en su JavaScript).

Para que lleguen los push, además: aplicar la migración `0243_app_notificaciones.sql` y desplegar y
conectar las Edge Functions (`../calibra/supabase/functions/README.md`). El `google-services.json`
es el mismo proyecto de Firebase que ya usaba la app Capacitor (`com.prodigia.app`).

Necesita `mobile/.env.local` con `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`
(los mismos valores que `NEXT_PUBLIC_*` de `../calibra/.env.local`). No se commitea.

## Cómo está armada

- `src/app/` — pantallas (Expo Router, una por archivo).
- `src/lib/numeria.ts` — la partida. **Los problemas los genera el mismo código que la web**:
  `@/lib/...` apunta a `../calibra/src/lib/...` (ver `tsconfig.json` y `metro.config.js`). El
  guardado usa las mismas RPC que `/api/attempts` y `/api/practica/finish` (`insertar_intento`,
  `registrar_xp_diario`, `registrar_progreso_mundo`): el XP y la calibración se deciden en la base.
- `src/ui/` — componentes propios (`Boton3D`, `Teclado`, `Destacados`).
- `src/lib/notificaciones.ts` — permisos, canales, token del dispositivo, categorías y recordatorio.
- `src/lib/resumen.ts` — foto del jugador (racha, Chispas, meta, avisos) que comparten el inicio,
  los avisos y los widgets; se guarda en el teléfono para que el widget se vea sin red.
- `src/widgets/` — diseño de los widgets (`ui.tsx`) y su registro (`registro.tsx`). `index.ts` (la
  entrada de la app) registra el handler: Android puede despertar la app solo para dibujar un widget.
- `src/tema.ts` — colores "Noche de Prodigia" y los 13 mundos (base + neón).
- Alias: `~/` = código de la app; `@/` = código de la web (solo lógica pura, nada de React DOM ni Next).

Verificación: `npx tsc --noEmit`, `npx expo lint`, `npx expo export --platform android`.
