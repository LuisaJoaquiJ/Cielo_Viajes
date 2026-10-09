'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plane, Calendar, Users, CreditCard, TrendingUp, ArrowRight } from 'lucide-react'
import { tripsApi, bookingsApi, usersApi, leadsApi } from '@/lib/api' // ✅ importar leadsApi
import { formatCurrency, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/lib/utils'
import type { Booking } from '@/types'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ trips: 0, bookings: 0, users: 0, leads: 0, revenue: 0 })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      tripsApi.adminList({ limit: 1 }),
      bookingsApi.adminList({ limit: 5 }),
      usersApi.adminList({ limit: 1 }),
      leadsApi.adminList({ limit: 1 }), // ✅ agregar la llamada
    ]).then(([tripsData, bookingsData, usersData, leadsData]) => { // ✅ ahora sí 4 valores
      const bookings = bookingsData.bookings ?? []
      const revenue = bookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((acc, b) => acc + Number(b.totalAmount), 0)

      setStats({
        trips:    tripsData.meta?.total    ?? 0,
        bookings: bookingsData.meta?.total ?? 0,
        users:    usersData.meta?.total    ?? 0,
        leads:    leadsData.meta?.total    ?? 0, // ✅ ahora tiene valor real
        revenue,
      })
      setRecentBookings(bookings)
    }).finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Viajes activos', value: stats.trips,                    icon: Plane,      color: 'from-sky-500 to-sky-600',      href: '/admin/viajes'   },
    { label: 'Total reservas', value: stats.bookings,                 icon: Calendar,   color: 'from-teal-500 to-teal-600',    href: '/admin/reservas' },
    { label: 'Usuarios',       value: stats.users,                    icon: Users,      color: 'from-violet-500 to-violet-600',href: '/admin/usuarios' },
    { label: 'Leads',          value: stats.leads,                    icon: CreditCard, color: 'from-pink-500 to-pink-600',    href: '/admin/leads'    },
    { label: 'Ingresos',       value: formatCurrency(stats.revenue),  icon: TrendingUp, color: 'from-amber-500 to-orange-500', href: '/admin/reservas' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 font-body mt-1">Resumen general de Cielo</p>
      </div>

      {/* Stat cards — 5 cards: 2 cols mobile, 3 cols md, 5 cols xl */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
        {statCards.map(s => (
          <Link key={s.label} href={s.href} className="card p-6 hover:shadow-card group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-glass`}>
                <s.icon size={20} className="text-white" />
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-sky-500 transition-colors" />
            </div>
            <p className="font-display text-3xl font-bold text-slate-900">
              {loading
                ? <span className="inline-block w-16 h-7 bg-slate-100 rounded animate-pulse" />
                : s.value}
            </p>
            <p className="text-slate-500 font-body text-sm mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-slate-900">Reservas recientes</h2>
          <Link href="/admin/reservas" className="btn-ghost text-xs">
            Ver todas <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentBookings.length === 0 ? (
          <p className="text-slate-400 font-body text-center py-8">No hay reservas aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
                  <th className="pb-3 font-semibold">Código</th>
                  <th className="pb-3 font-semibold">Cliente</th>
                  <th className="pb-3 font-semibold">Viaje</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentBookings.map(b => (
                  <tr key={b.id} className="hover:bg-sky-50/50 transition-colors">
                    <td className="py-3 font-mono text-xs text-slate-500">#{b.bookingCode.slice(-8)}</td>
                    <td className="py-3 font-medium text-slate-800">{b.user?.firstName} {b.user?.lastName}</td>
                    <td className="py-3 text-slate-600 max-w-[200px] truncate">{b.trip?.title}</td>
                    <td className="py-3 font-bold text-sky-600">{formatCurrency(b.totalAmount)}</td>
                    <td className="py-3">
                      <span className={`badge text-xs ${BOOKING_STATUS_COLORS[b.status]}`}>
                        {BOOKING_STATUS_LABELS[b.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}