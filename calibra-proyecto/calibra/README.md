# Prodigia

App de práctica de cálculo mental con dificultad adaptativa, acertijos de lógica
y lecciones de técnicas de cálculo rápido.

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind
- **Supabase** — Postgres + Auth (con Row Level Security)
- **Vercel** — hosting recomendado

## Cómo levantarlo

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear un proyecto en Supabase

1. Andá a [supabase.com](https://supabase.com) → New Project (el free tier alcanza para arrancar).
2. En **Settings → API**, copiá `Project URL` y `anon public key`.
3. Copiá `.env.local.example` a `.env.local` y pegá esos dos valores.

### 3. Correr las migraciones

En el dashboard de Supabase, abrí **SQL Editor**, pegá el contenido de
`supabase/migrations/0001_init.sql` y ejecutalo. Esto crea:

- Las tablas (`profiles`, `attempts`, `techniques`, `technique_progress`, `logic_puzzles`)
- Los índices para que las consultas de progreso sean rápidas
- Las políticas de **Row Level Security** — cada usuario solo puede leer sus
  propios datos, esto es lo que evita que alguien lea los intentos de otro
  usuario con la clave pública.
- Un trigger que crea el `profile` automáticamente cuando alguien se registra.

### 4. Correr en desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Estructura de carpetas

```
src/
  app/
    api/attempts/     → guarda cada respuesta del sprint
    practica/          → pantalla de práctica (a construir)
  lib/supabase/
    client.ts          → cliente para Client Components
    server.ts           → cliente para Server Components / API routes
  types/database.ts    → tipos que reflejan el esquema SQL
  middleware.ts          → refresca la sesión de auth en cada request

supabase/migrations/    → esquema de base de datos versionado
```

## Próximos pasos sugeridos

1. Página de login (`/login`) usando `supabase.auth.signInWithOtp` — magic link,
   sin contraseñas que gestionar.
2. Conectar el mockup de la landing (`calibra.html`) como página real en `/`,
   usando el sprint interactivo pero guardando cada intento vía `POST /api/attempts`.
3. Poblar la tabla `techniques` con las primeras 5-6 lecciones.
4. Deploy a Vercel: conectar el repo, agregar las mismas variables de entorno
   del `.env.local` en el dashboard de Vercel.
