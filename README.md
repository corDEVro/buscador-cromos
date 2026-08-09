# Buscador de Cromos

Seguimiento de tu colección de cromos del **álbum Panini del Mundial 2026** (980 cromos). Consulta rápida de faltantes, estados por cromo y búsqueda por jugador, equipo o código.

## Funcionalidades

- **Catálogo completo**: 48 selecciones × 20 cromos + 20 cromos especiales = 980 cromos.
- **Estados por cromo**: Me falta / Pegado / Repetido (clic para cambiar).
- **Consulta rápida de faltantes**: página `/faltantes`.
- **Búsqueda y filtros**: por jugador, equipo, código (ej. `ESP15`), grupo y estado.
- **Panel de progreso** global y por selección.

## Stack

- Next.js 16 (App Router, Turbopack, TypeScript)
- Prisma 7 con SQLite (driver adapter `better-sqlite3`)
- Tailwind CSS 4

## Puesta en marcha

```bash
npm install
npm run db:migrate   # crea la base de datos SQLite
npm run db:seed      # carga el catálogo (980 cromos)
npm run dev          # http://localhost:3000
```

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Aplica migraciones de Prisma |
| `npm run db:seed` | Carga el catálogo desde `prisma/seed-data.ts` |
| `npm run db:studio` | Navegador visual de la base de datos |

## Estructura

```
prisma/
  schema.prisma        # Esquema de la base de datos
  seed.ts              # Carga el catálogo
  seed-data.ts         # Catálogo fuente: 48 equipos + 20 especiales
src/
  app/
    page.tsx           # Panel de inicio (progreso)
    album/page.tsx     # Álbum interactivo
    faltantes/page.tsx # Consulta rápida de faltantes
    api/stickers/[id]/route.ts  # API para cambiar el estado de un cromo
  components/          # Componentes de UI
  lib/
    prisma.ts          # Cliente Prisma
    albums.ts          # Acceso a datos y estadísticas
    types.ts           # Tipos compartidos
```

## Modelo de datos

- **Album**: colección (ej. `mundial-2026`). Añadir la Liga 26-27 sería crear otro álbum.
- **Team**: selección/equipo dentro de un álbum (con grupo y orden).
- **Sticker**: cromo con código, nombre, categoría (`LOGO`, `PLAYER`, `PHOTO`, `SPECIAL`) y estado (`MISSING`, `OWNED`, `DUPLICATE`).

## API

`PATCH /api/stickers/:id` con `{ "status": "MISSING" | "OWNED" | "DUPLICATE" }` actualiza el estado de un cromo.
