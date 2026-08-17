# Prodigia

App de práctica adaptativa organizada en **mundos temáticos**, cada uno
con su propio ritmo, estética y camino de aprendizaje. Calibración de
dificultad en tiempo real, duelos competitivos con ELO, rachas diarias,
logros y una economía de Puntos — pensada para sentirse como un juego
del que da gusto volver, no como una tarea.

## Mundos

- **Numeria** (violeta) — cálculo mental: Aritmética (suma, resta,
  multiplicación entera/decimal, división), Fracciones, Decimales y
  porcentajes, Potencias y raíces, Álgebra básica. Geometría básica
  queda como "Próximamente".
- **Enigmia** (esmeralda) — acertijos de lógica en 4 categorías:
  Memoria, Patrones, Deducción, Pensamiento computacional. Memoria,
  Patrones y Computacional usan generadores procedurales (contenido
  infinito); Deducción arranca con un set curado a mano.
- **Geografía** (azul océano) — mapas interactivos con datos
  geográficos reales (react-simple-maps + topojson). Continentes
  activos: verificar en el código cuáles están completos al momento de
  leer esto (América y Europa confirmados; África/Asia-Oceanía en
  progreso).

Cada mundo tiene **Practicar** (calibración adaptativa 1-10 por tema) y
**Aprender** (camino de lecciones estilo Duolingo, con técnicas
explicadas paso a paso).

## Sistemas transversales

- **Calibración por tema**: el nivel de dificultad sube y baja en vivo
  según aciertos y velocidad — independiente por operación/tema.
- **Nivel de mundo**: experiencia acumulada permanente por mundo
  (Numeria/Enigmia/Geografía), separada de la calibración y de los
  Puntos de cuenta.
- **Puntos** (permanentes, moneda de la tienda) vs. **Experiencia**
  (semanal, solo para el ranking) — son cosas distintas a propósito.
- **Racha diaria** y **reto diario** (mismo set de problemas para todos,
  seed por fecha).
- **Duelos 1v1** con rating ELO, matchmaking por rango, y sistema de
  "fantasma" (corrés contra el registro exacto de tu rival si ya jugó
  su partida).
- **Grupos** (antes "Profesor"): un profesor crea grupos, ve estadísticas
  agregadas y por alumno.
- **Amigos**, unificado con Grupos bajo "Social".
- **Feed social**: solo tarjetas auto-generadas por el sistema (logros,
  desafíos armados con opciones predefinidas) — sin texto libre, sin
  chat, para no necesitar moderación de contenido.
- **Logros/medallas**, tienda de cosméticos y utilidades (nunca ventaja
  competitiva — eso está reservado exclusivamente al ELO limpio de los
  duelos).
- **Onboarding en capas**: preferencias generales → tour de la app →
  elegir mundo → diagnóstico de nivel específico de ese mundo.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind
- **Supabase** — Postgres + Auth (magic link) + Row Level Security
- **Framer Motion** + componentes de [React Bits](https://reactbits.dev)
  para animaciones
- **Vercel** — hosting

## Cómo levantarlo

### 1. Instalar dependencias
```bash
npm install
```

### 2. Conectar Supabase
Creá un proyecto en [supabase.com](https://supabase.com), copiá `Project
URL` y `anon public key` desde Settings → API, y pegalos en un archivo
`.env.local` (usá `.env.local.example` como base):
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Correr las migraciones
En el SQL Editor de Supabase, corré **todas** las migraciones de
`supabase/migrations/` **en orden numérico**, sin saltarte ninguna —
varias fases de este proyecto dependen de migraciones previas.

### 4. Desarrollo local
```bash
npm run dev
```
Abrí `http://localhost:3000`.

## Estructura

```
src/
  app/              → rutas (una por mundo + sistemas transversales)
  lib/supabase/     → clientes de browser y servidor
  components/       → componentes compartidos (incluye animaciones
                      de React Bits integradas)
  types/            → tipos que reflejan el esquema de la base
  middleware.ts     → refresco de sesión de auth

supabase/migrations/ → esquema de base de datos, versionado y numerado
docs/                 → decisiones de producto, mecánica, y progreso
                        de sesiones de desarrollo (ver PROGRESO.md)
```

## Estado del proyecto

Este es un proyecto en desarrollo activo construido iterativamente. Para
el estado real y actualizado de qué está completo, parcial, o pendiente,
**la fuente de verdad es `docs/PROGRESO.md`** — este README describe la
visión general, no un checklist de completitud verificado línea por
línea.

## Despliegue

Desplegado en Vercel, conectado a este repositorio. Variables de entorno
configuradas en el dashboard de Vercel (mismas que `.env.local`). No
anunciado públicamente todavía — en fase de prueba con un grupo cerrado.