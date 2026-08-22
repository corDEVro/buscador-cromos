/**
 * Pantalla de entrada: formulario con dos modos, "Entrar" y "Crear cuenta".
 * Si ya hay sesión activa redirige directo al álbum.
 */
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import Footer from '../components/Footer'

export default function LoginPage() {
  const { user, loading, login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Usuario ya autenticado → nada que hacer aquí
  if (!loading && user) return <Navigate to="/album" replace />

  /** Envía el formulario según el modo activo y muestra errores del backend. */
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'login') await login(username.trim(), password)
      // Si no escriben nombre, usamos el propio usuario como displayName
      else await register(username.trim(), password, displayName.trim() || username.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo ha ido mal')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 text-center">
        <div className="text-7xl drop-shadow-md">⚽</div>
        <h1 className="mt-2 text-3xl font-black text-brand-dark sm:text-4xl">Buscador de Cromos</h1>
        <p className="mt-1 font-bold text-slate-500">Liga Este 2026/27 · LaLiga EA Sports</p>
      </div>

      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 shadow-xl ring-4 ring-brand-light"
      >
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m)
                setError(null)
              }}
              className={`rounded-xl px-3 py-2 font-extrabold transition ${
                mode === m ? 'bg-brand text-white shadow' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        {mode === 'register' && (
          <label className="block">
            <span className="mb-1 block text-sm font-extrabold text-slate-600">Tu nombre</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="P. ej.: Pablo"
              maxLength={60}
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-lg font-bold focus:border-brand focus:outline-none"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-extrabold text-slate-600">Usuario</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="usuario"
            autoComplete="username"
            required
            minLength={3}
            maxLength={30}
            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-lg font-bold focus:border-brand focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-extrabold text-slate-600">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={4}
            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-lg font-bold focus:border-brand focus:outline-none"
          />
        </label>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl bg-gradient-to-r from-brand to-orange-500 py-4 text-xl font-black text-white shadow-lg transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? 'Un momento…' : mode === 'login' ? '¡A jugar! ⚽' : 'Crear mi colección 🎉'}
        </button>

        {mode === 'register' && (
          <p className="text-center text-xs leading-relaxed text-slate-400">
            Cada niño (o familia) tendrá su propia colección con su usuario y contraseña.
          </p>
        )}
      </form>

      <Footer />
    </main>
  )
}
