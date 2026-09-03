/**
 * Enrutado principal de la SPA.
 *
 * Rutas:
 *   /           → LoginPage (entrada/registro)
 *   /album      → AlbumPage     🔒 requiere sesión
 *   /faltan     → MissingPage   🔒 requiere sesión
 *   /repetidos  → RepetidosPage 🔒 requiere sesión
 * Cualquier otra URL redirige a /.
 */
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { ReactNode } from 'react'
import LoginPage from './pages/LoginPage'
import AlbumPage from './pages/AlbumPage'
import MissingPage from './pages/MissingPage'
import RepetidosPage from './pages/RepetidosPage'

/** Envoltorio que protege rutas: espera la sesión y redirige a / si no hay usuario. */
function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    // Pantalla de carga mínima mientras se comprueba el token guardado
    return (
      <div className="flex min-h-screen items-center justify-center text-4xl">⚽</div>
    )
  }
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/album"
        element={
          <Protected>
            <AlbumPage />
          </Protected>
        }
      />
      <Route
        path="/faltan"
        element={
          <Protected>
            <MissingPage />
          </Protected>
        }
      />
      <Route
        path="/repetidos"
        element={
          <Protected>
            <RepetidosPage />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
