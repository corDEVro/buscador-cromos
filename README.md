# ⚽ Buscador Cromos — Liga Este 2026/27

App web para llevar el álbum **Liga Este (Laliga EA Sports 2026/27)** de Ediciones Este: marca qué cromos tienes pegados, cuáles faltan y tus repetidas. Pensada para peques (3–12 años): botones grandes, colores del álbum y cero fricción.

**562 huecos**: 408 de equipos + 85 de series (ADN Prime, Fantasy, Draft 23 y su paralela Kromix) + 69 de Últimos Fichajes (se rellenan con las ediciones de invierno). Los Extra Stickers (Oro/Plata/Bronce) se consultan aparte, no se pegan.

## Producción

| Pieza | URL |
|-------|-----|
| Web   | https://buscador-cromos.netlify.app |
| API   | https://buscador-cromos.onrender.com |

El frontend llama siempre a `/api/*` en su propio dominio; `netlify.toml` hace de proxy hacia Render (mismo origen → cero problemas de CORS).

## Stack

| Capa      | Tecnología |
|-----------|------------|
| Backend   | Java 21 · Spring Boot 4 · Spring Security (JWT) · Flyway |
| Frontend  | React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router |
| BD        | PostgreSQL (Neon en producción, Docker en local) |
| Despliegue| Frontend → Netlify · API → Render |

## Estructura

```
backend/    API REST (puerto 8080)
  src/main/resources/db/migration/V1__schema.sql
  src/main/resources/catalog/liga-este-2026-27.json   ← checklist oficial (562 huecos)
frontend/   SPA React (puerto 5173)
netlify.toml   build del frontend + proxy /api → Render
render.yaml    definición del servicio de Render
```

## Cómo funciona

- Cada usuario tiene su propia colección (registro con usuario y contraseña).
- Estados por cromo: **FALTA → PEGADA → REPETIDA** (tocas la carta y cicla).
- La pestaña «Me faltan» agrupa los cromos que faltan por equipo, con buscador y botón para copiar la lista al portapapeles (ideal para llevársela al kiosco).

### API

```
POST   /api/auth/register        { username, password, displayName? }
POST   /api/auth/login           { username, password }
GET    /api/auth/me
GET    /api/catalog              público
GET    /api/collection           🔒 entradas del usuario
PUT    /api/collection/{code}    🔒 { status }
POST   /api/collection/{code}/cycle 🔒 siguiente estado
DELETE /api/collection/{code}    🔒 resetea a FALTA
GET    /api/collection/stats     🔒 totales + progreso por equipo
```

## Desarrollo local

Requisitos: Java 21, Node 20+, Docker.

```bash
# 1. PostgreSQL local
docker run -d --name cromos-pg -e POSTGRES_USER=cromos -e POSTGRES_PASSWORD=cromos \
  -e POSTGRES_DB=cromos -p 5432:5432 postgres:17-alpine

# 2. Backend  (crea tablas y carga el catálogo solo al arrancar)
cd backend
DATABASE_URL="jdbc:postgresql://localhost:5432/cromos" \
DATABASE_USER=cromos DATABASE_PASS=cromos ./mvnw spring-boot:run

# 3. Frontend (en otra terminal; ya hace proxy de /api al 8080)
cd frontend && npm install && npm run dev
```

Abre http://localhost:5173

## Variables de entorno del backend

| Variable | Ejemplo |
|----------|---------|
| `DATABASE_URL` | `jdbc:postgresql://ep-xxx.neon.tech/cromos?sslmode=require` |
| `DATABASE_USER` | `cromos_owner` |
| `DATABASE_PASS` | `······` |
| `JWT_SECRET` | cadena larga aleatoria (mín. 32 chars) |
| `CORS_ALLOWED_ORIGINS` | `https://tu-sitio.netlify.app` |

> ⚠️ Neon da la URL como `postgresql://user:pass@host/db`. Para `DATABASE_URL` hay que partirla: `jdbc:postgresql://host/db` y poner usuario/contraseña aparte.

## Despliegue (estado actual)

1. **BD** — Neon (Postgres gestionado, TLS obligatorio).
2. **API** — Render, servicio Docker con `backend/Dockerfile`. Redespliega solo con cada `git push`.
3. **Web** — Netlify. Lee `netlify.toml` (build del `frontend/` + proxy `/api`). El proxy ya apunta al backend real.

> Nota Render: en Settings → Build hay que dejar **Dockerfile Path = `./backend/Dockerfile`** y **Docker Build Context Directory = `backend`**, para que los `COPY` del Dockerfile resuelvan bien.

## Seguridad

- Contraseñas con **BCrypt**; login sin pistas sobre usuarios existentes.
- **JWT firmado** (HMAC-SHA512, caduca en 7 días); el usuario siempre se extrae del token → nadie toca la colección de otro.
- Solo son públicos: registro/login, catálogo (lectura) y health-check.
- CORS limitado al dominio de Netlify · sin sesiones/cookies (CSRF no aplica).
- Consultas parametrizadas vía JPA (sin inyección SQL) · secretos solo en variables de entorno de Render.

---

*Checklist transcrito de la colección oficial Liga Este 2026/27 (Ediciones Este). Proyecto familiar, sin ánimo de lucro.*

Hecho con ⚽ por [Cordevro](https://cordevro.netlify.app)
