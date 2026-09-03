/**
 * Cabecera fija superior: logo, pestañas de navegación, porcentaje global
 * (opcional), nombre del usuario y botón Salir.
 */
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Header({ progress }: { progress?: number }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-brand to-orange-500 text-white shadow-lg">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2">
        {/* Logo → vuelve al álbum */}
        <Link to="/album" className="text-3xl drop-shadow" aria-label="Inicio">
          ⚽
        </Link>
        <nav className="flex flex-1 items-center gap-1">
          <Tab to="/album">Mi álbum</Tab>
          <Tab to="/faltan">Me faltan</Tab>
          <Tab to="/repetidos">Repetidas</Tab>
        </nav>
        {/* Porcentaje completado (solo si la página lo pasa) */}
        {typeof progress === 'number' && (
          <span className="rounded-full bg-white/25 px-3 py-1 text-sm font-bold tabular-nums">
            {progress}%
          </span>
        )}
        <span className="hidden max-w-28 truncate rounded-full bg-black/15 px-3 py-1 text-sm font-semibold sm:block">
          {user?.displayName ?? user?.username}
        </span>
        <button
          onClick={() => {
            logout()
            navigate('/', { replace: true })
          }}
          className="rounded-xl bg-white/20 px-2 py-1.5 text-sm font-bold hover:bg-white/30 active:scale-95"
          title={`Salir de ${user?.displayName ?? ''}`}
        >
          Salir
        </button>
      </div>
    </header>
  )
}

/** Pestaña resaltada cuando su ruta está activa. */
function Tab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-xl px-3 py-1.5 font-bold transition ${
          isActive ? 'bg-white text-brand shadow' : 'hover:bg-white/20'
        }`
      }
    >
      {children}
    </NavLink>
  )
}
