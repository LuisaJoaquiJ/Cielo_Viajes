'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3, Plane, Calendar, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/agente',          icon: BarChart3, label: 'Dashboard' },
  { href: '/agente/viajes',   icon: Plane,     label: 'Viajes'    },
  { href: '/agente/reservas', icon: Calendar,  label: 'Mis ventas'},
]

export default function AgenteLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore()
  const router   = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (user?.role !== 'AGENT' && user?.role !== 'ADMIN') router.push('/')
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || (user?.role !== 'AGENT' && user?.role !== 'ADMIN')) return null

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-60 bg-cielo-dark flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
              <span className="text-white font-display font-bold">C</span>
            </div>
            <span className="font-display text-lg font-bold text-white">Cielo</span>
          </Link>
          <p className="text-sky-400/60 text-xs font-body mt-1">Panel de agente</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/agente' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-body transition-all',
                  active
                    ? 'bg-gradient-to-r from-sky-500/80 to-teal-500/60 text-white shadow-glass'
                    : 'text-slate-400 hover:text-white hover:bg-white/5',
                )}>
                <item.icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.firstName?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold font-body truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-sky-400/60 text-xs font-body">{user?.role}</p>
            </div>
          </div>
          <button onClick={() => { logout(); router.push('/') }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 font-body transition-all">
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}