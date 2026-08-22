/**
 * Contexto global de autenticación.
 *
 * - Al montar, si hay token en localStorage pregunta al backend (/api/auth/me)
 *   para saber si sigue siendo válido; si no, lo borra.
 * - Expone login/register/logout y el usuario actual a toda la app vía useAuth().
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api, getToken, setToken } from './api'
import type { UserInfo } from './api'

/** Lo que consumen los componentes: usuario actual + acciones de sesión. */
interface AuthState {
  user: UserInfo | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, displayName: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // Restauración de sesión al recargar la página
  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    api.me()
      .then((me) => setUser({ username: me.username, displayName: me.displayName }))
      .catch(() => setToken(null)) // token caducado o inválido: lo descartamos
      .finally(() => setLoading(false))
  }, [])

  /** Llama al backend, guarda el token y fija el usuario. */
  const login = useCallback(async (username: string, password: string) => {
    const res = await api.login(username, password)
    setToken(res.token)
    setUser({ username: res.username, displayName: res.displayName })
  }, [])

  const register = useCallback(async (username: string, password: string, displayName: string) => {
    const res = await api.register(username, password, displayName)
    setToken(res.token)
    setUser({ username: res.username, displayName: res.displayName })
  }, [])

  /** Cierra sesión solo en cliente (el JWT no se puede "revocar" en el backend). */
  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Hook de acceso al contexto; falla si se usa fuera del AuthProvider. */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
