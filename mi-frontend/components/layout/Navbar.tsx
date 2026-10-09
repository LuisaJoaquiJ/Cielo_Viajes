'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'

const navLinks = [
  { href: '/viajes', label: 'Viajes' },
  { href: '/destinos', label: 'Destinos' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'nav-glass' : 'bg-transparent',
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center shadow-glass">
            <span className="text-white font-display text-lg font-bold leading-none">C</span>
          </div>
          <span className={cn(
            'font-display text-xl font-bold transition-colors',
            scrolled ? 'text-slate-900' : 'text-white drop-shadow'
          )}>
            Cielo
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold font-body transition-all duration-200',
                pathname.startsWith(l.href)
                  ? 'bg-sky-500/10 text-sky-600'
                  : scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white/90 hover:text-white hover:bg-white/10',
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setDropOpen(v => !v)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold font-body transition-all',
                  scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10',
                )}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.firstName?.[0]}
                </div>
                {user.firstName}
                <ChevronDown size={14} />
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-card border border-sky-50 py-2 z-50">
                  <Link href="/mi-cuenta" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 font-body" onClick={() => setDropOpen(false)}>
                    <User size={15} /> Mi perfil
                  </Link>
                  <Link href="/mi-cuenta/reservas" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 font-body" onClick={() => setDropOpen(false)}>
                    <LayoutDashboard size={15} /> Mis reservas
                  </Link>
                  {/* ✅ reemplazar el bloque que tenías */}
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 font-body" onClick={() => setDropOpen(false)}>
                      <LayoutDashboard size={15} /> Panel admin
                    </Link>
                  )}
                  {user.role === 'AGENT' && (
                    <Link href="/agente" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 font-body" onClick={() => setDropOpen(false)}>
                      <LayoutDashboard size={15} /> Panel agente
                    </Link>
                  )}
                  <hr className="my-1 border-sky-50" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-body">
                    <LogOut size={15} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login"
                className={cn('text-sm font-semibold font-body px-4 py-2 rounded-lg transition-all',
                  scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
                )}>
                Iniciar sesión
              </Link>
              <Link href="/registro" className="btn-primary text-sm py-2 px-5">
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(v => !v)}
          className={cn('md:hidden p-2 rounded-lg', scrolled ? 'text-slate-700' : 'text-white')}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-sky-50 px-4 py-4 space-y-2">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-sky-50 font-body">
              {l.label}
            </Link>
          ))}
          <hr className="border-sky-50" />
          {isAuthenticated && user ? (
            <>
              <Link href="/mi-cuenta/reservas" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-sky-50 font-body">Mis reservas</Link>

              {/* ✅ agregar esto */}
              {user.role === 'ADMIN' && (
                <Link href="/admin" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-sky-50 font-body">Panel admin</Link>
              )}
              {user.role === 'AGENT' && (
                <Link href="/agente" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-sky-50 font-body">Panel agente</Link>
              )}
            </>

          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-sky-50 font-body">Iniciar sesión</Link>
              <Link href="/registro" onClick={() => setOpen(false)} className="btn-primary w-full justify-center">Registrarse</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
