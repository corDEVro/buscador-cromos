/**
 * ============================================================================
 * Capa de acceso a la API del backend.
 * ----------------------------------------------------------------------------
 * - Tipos que replican los DTOs de Java (Sticker, Team, Series, Stats...).
 * - Gestión del token JWT en localStorage (clave "bc_token").
 * - Objeto `api` con un método por endpoint del backend.
 *
 * La URL base sale de VITE_API_URL; si no está definida se usa '' y las
 * peticiones van a la misma origen (el proxy de Vite en dev, Netlify en prod).
 * ============================================================================
 */

/** Estado de un cromo en tu colección (coincide con el enum StickerStatus). */
export type Status = 'FALTA' | 'PEGADA' | 'REPETIDA'
/** Qué representa la lámina. */
export type Category = 'ESCUDO' | 'ENTRENADOR' | 'JUGADOR'
/** Secciones del álbum (coincide con el enum StickerSection del backend). */
export type Section = 'EQUIPO' | 'ADN_PRIME' | 'FANTASY' | 'DRAFT23' | 'KROMIX' | 'FICHAJES' | 'EXTRA'

/** Una lámina tal y como la devuelve GET /api/catalog. */
export interface Sticker {
  id: number
  code: string
  name: string
  number: number
  slotLabel: string | null
  category: Category
  section: Section
  extra: boolean
  teamCode: string | null
  albumOrder: number
}

export interface Team {
  id: number
  code: string
  name: string
  shortName: string
  color: string
  stickers: Sticker[]
}

/** Serie especial (ADN Prime, Fantasy, Kromix...) con sus láminas. */
export interface Series {
  code: Section
  name: string
  stickers: Sticker[]
}

/** Respuesta completa de GET /api/catalog (se pide una vez por sesión). */
export interface Catalog {
  slug: string
  name: string
  teams: Team[]
  series: Series[]
}

/** Estado anotado de un cromo (GET/PUT de /api/collection). */
export interface EntryDto {
  stickerCode: string
  status: Status
}

/** Progreso de un equipo concreto. */
export interface TeamStats {
  teamCode: string
  teamName: string
  color: string
  total: number
  pegadas: number
}

/** Resumen global para las barras del álbum. */
export interface Stats {
  total: number
  pegadas: number
  repetidas: number
  percent: number
  byTeam: TeamStats[]
}

/** Datos públicos del usuario autenticado. */
export interface UserInfo {
  username: string
  displayName: string
}

const API = import.meta.env.VITE_API_URL ?? ''

/** Clave bajo la que se guarda el JWT en localStorage. */
const TOKEN_KEY = 'bc_token'

/** Lee el token guardado (null si no hay sesión). */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/** Guarda o borra el token (pasar null para cerrar sesión). */
export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

/**
 * Función central de fetch: añade Content-Type y el Bearer token si existe,
 * convierte errores HTTP en Error con mensaje legible para mostrar al usuario
 * y devuelve undefined en respuestas 204 (sin contenido).
 */
async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(API + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) {
    // Intenta extraer "message" del error de Spring; si no, usa el código HTTP
    let message = `Error ${res.status}`
    try {
      const body = await res.json()
      if (typeof body.message === 'string' && body.message) message = body.message
      else if (typeof body.error === 'string' && body.error) message = body.error
    } catch {
      /* sin cuerpo JSON */
    }
    throw new Error(message)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/** Métodos disponibles; cada uno mapea 1 a 1 con un endpoint del backend. */
export const api = {
  /** POST /api/auth/register — crea cuenta y devuelve token + usuario. */
  register(username: string, password: string, displayName: string) {
    return req<{ token: string; username: string; displayName: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, displayName }),
    })
  },
  /** POST /api/auth/login — comprueba credenciales y devuelve token + usuario. */
  login(username: string, password: string) {
    return req<{ token: string; username: string; displayName: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },
  /** GET /api/auth/me — valida el token guardado y devuelve el usuario. */
  me() {
    return req<{ id: number; username: string; displayName: string }>('/api/auth/me')
  },
  /** GET /api/catalog — álbum completo (público). */
  catalog() {
    return req<Catalog>('/api/catalog')
  },
  /** GET /api/collection — estados anotados del usuario. */
  collection() {
    return req<EntryDto[]>('/api/collection')
  },
  /** POST /api/collection/{code}/cycle — avanza FALTA → PEGADA → REPETIDA → FALTA. */
  cycle(code: string) {
    return req<EntryDto>(`/api/collection/${encodeURIComponent(code)}/cycle`, { method: 'POST' })
  },
  /** GET /api/collection/stats — totales y porcentaje para las barras. */
  stats() {
    return req<Stats>('/api/collection/stats')
  },
}
