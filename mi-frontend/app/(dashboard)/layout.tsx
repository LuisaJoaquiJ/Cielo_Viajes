'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User, Calendar, LogOut, LayoutDashboard, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/mi-cuenta',          icon: User,     label: 'Mi perfil' },
  { href: '/mi-cuenta/reservas', icon: Calendar, label: 'Mis reservas' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore()
  const router   = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Top bar */}
      <div className="bg-cielo-dark text-white px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
              <span className="text-white font-display font-bold">C</span>
            </div>
            <span className="font-display font-bold text-lg">Cielo</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.firstName?.[0]}
            </div>
            <span className="text-sm font-body text-sky-200">{user?.firstName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="card p-4">
              <div className="text-center py-4 border-b border-sky-50 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <p className="font-bold text-slate-800 font-body">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-500 font-body">{user?.email}</p>
              </div>
              <nav className="space-y-1">
                {navItems.map(item => (
                  <Link key={item.href} href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-body transition-all',
                      pathname === item.href
                        ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-glass'
                        : 'text-slate-700 hover:bg-sky-50',
                    )}>
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                ))}
                <button onClick={() => { logout(); router.push('/') }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-body text-red-500 hover:bg-red-50 transition-all">
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="md:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  )
}
