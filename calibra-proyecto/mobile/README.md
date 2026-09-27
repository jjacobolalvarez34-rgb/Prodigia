# Prodigia — app móvil (Expo)

Primera versión jugable de la app nativa descrita en `../calibra/docs/app-nativa/`. Misma cuenta,
mismo progreso y mismas Chispas que la web: habla directo con el mismo Supabase.

## Qué tiene hoy

- Login con correo o nombre de usuario + contraseña, o entrar como invitado.
- Elegir los 2 mundos iniciales (si la cuenta todavía no lo hizo).
- Inicio con racha, Chispas, nivel de cuenta y los 13 mundos.
- **Numeria**: sprint de 60 s con las 4 operaciones, teclado propio con vibración, nivel que se
  ajusta solo, y resultado con Chispas, precisión, meta del día y subidas de nivel.

Los otros 12 mundos aparecen como "Pronto en la app". La Trastienda no está en la app
(política de Google Play para apps con menores, ver PROD-01 en
`../calibra/docs/audits/REVISION-GENERAL-2026-09-26.md`).

## Cómo probarla en tu teléfono (sin instalar Android Studio)

1. Instala **Expo Go** desde Google Play.
2. En esta carpeta: `npm install` (solo la primera vez) y después `npx expo start`.
3. Escanea el código QR que aparece en la terminal con Expo Go. El teléfono y la computadora
   tienen que estar en la misma red Wi-Fi; si no se conecta, usa `npx expo start --tunnel`.

Necesita `mobile/.env.local` con `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`
(los mismos valores que `NEXT_PUBLIC_*` de `../calibra/.env.local`). No se commitea.

## Cómo está armada

- `src/app/` — pantallas (Expo Router, una por archivo).
- `src/lib/numeria.ts` — la partida. **Los problemas los genera el mismo código que la web**:
  `@/lib/...` apunta a `../calibra/src/lib/...` (ver `tsconfig.json` y `metro.config.js`). El
  guardado usa las mismas RPC que `/api/attempts` y `/api/practica/finish` (`insertar_intento`,
  `registrar_xp_diario`, `registrar_progreso_mundo`): el XP y la calibración se deciden en la base.
- `src/ui/` — componentes propios (`Boton3D`, `Teclado`).
- `src/tema.ts` — colores "Noche de Prodigia" y los 13 mundos (base + neón).
- Alias: `~/` = código de la app; `@/` = código de la web (solo lógica pura, nada de React DOM ni Next).

Verificación: `npx tsc --noEmit`, `npx expo lint`, `npx expo export --platform android`.
