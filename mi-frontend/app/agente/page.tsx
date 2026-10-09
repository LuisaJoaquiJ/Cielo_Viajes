'use client'
import { useState, useEffect } from 'react'
import { Plane, Calendar, TrendingUp, Clock, CheckCircle, XCircle, ArrowRight, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { tripsApi, bookingsApi } from '@/lib/api'
import { formatCurrency, formatDate, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/lib/utils'
import type { Booking } from '@/types'

export default function AgenteDashboard() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])

  // Métricas
  const [metrics, setMetrics] = useState({
    totalBookings:     0,
    pendingBookings:   0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0,
    totalRevenue:      0,
    availableTrips:    0,
    totalPassengers:   0,
  })

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Traemos todo en paralelo
        const [tripsData, allBookingsData, recentData] = await Promise.all([
          tripsApi.adminList({ limit: 1 }),
          bookingsApi.adminList({ limit: 1000 }), // para calcular métricas reales
          bookingsApi.adminList({ limit: 6 }),
        ])

        const all = allBookingsData.bookings ?? []

        const pending   = all.filter(b => b.status === 'PENDING')
        const confirmed = all.filter(b => b.status === 'CONFIRMED')
        const cancelled = all.filter(b => b.status === 'CANCELLED')
        const completed = all.filter(b => b.status === 'COMPLETED')

        const revenue = [...confirmed, ...completed]
          .reduce((acc, b) => acc + Number(b.totalAmount), 0)

        const passengers = all.reduce((acc, b) => acc + (b.passengers?.length ?? 0), 0)

        setMetrics({
          totalBookings:     allBookingsData.meta?.total ?? 0,
          pendingBookings:   pending.length,
          confirmedBookings: confirmed.length,
          cancelledBookings: cancelled.length,
          completedBookings: completed.length,
          totalRevenue:      revenue,
          availableTrips:    tripsData.meta?.total ?? 0,
          totalPassengers:   passengers,
        })

        setRecentBookings(recentData.bookings ?? [])
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const statCards = [
    {
      label:    'Ingresos totales',
      value:    formatCurrency(metrics.totalRevenue),
      icon:     TrendingUp,
      color:    'from-sky-500 to-teal-500',
      href:     '/agente/reservas',
      sub:      `${metrics.confirmedBookings + metrics.completedBookings} confirmadas + completadas`,
    },
    {
      label:    'Reservas totales',
      value:    metrics.totalBookings,
      icon:     Calendar,
      color:    'from-violet-500 to-purple-600',
      href:     '/agente/reservas',
      sub:      `${metrics.cancelledBookings} canceladas`,
    },
    {
      label:    'Pasajeros registrados',
      value:    metrics.totalPassengers,
      icon:     Users,
      color:    'from-emerald-500 to-teal-600',
      href:     '/agente/reservas',
      sub:      'en todas las reservas',
    },
    {
      label:    'Viajes disponibles',
      value:    metrics.availableTrips,
      icon:     Plane,
      color:    'from-amber-500 to-orange-500',
      href:     '/agente/viajes',
      sub:      'activos en el sistema',
    },
  ]

  const statusBreakdown = [
    { label: 'Pendientes',  value: metrics.pendingBookings,   color: 'bg-amber-400',  textColor: 'text-amber-700'  },
    { label: 'Confirmadas', value: metrics.confirmedBookings, color: 'bg-sky-500',     textColor: 'text-sky-700'    },
    { label: 'Completadas', value: metrics.completedBookings, color: 'bg-green-500',   textColor: 'text-green-700'  },
    { label: 'Canceladas',  value: metrics.cancelledBookings, color: 'bg-slate-300',   textColor: 'text-slate-500'  },
  ]

  const totalForBar = metrics.totalBookings || 1

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-slate-900">Mi panel</h1>
        <p className="text-slate-500 font-body mt-1">Resumen de tus ventas</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map(s => (
          <Link key={s.label} href={s.href} className="card p-5 hover:shadow-card group transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-glass`}>
                <s.icon size={18} className="text-white" />
              </div>
              <ArrowRight size={14} className="text-slate-300 group-hover:text-sky-500 transition-colors mt-1" />
            </div>
            <p className="font-display text-3xl font-bold text-slate-900 mb-0.5">
              {loading
                ? <span className="inline-block w-16 h-7 bg-slate-100 rounded animate-pulse" />
                : s.value}
            </p>
            <p className="text-slate-700 font-body text-sm font-semibold">{s.label}</p>
            <p className="text-slate-400 font-body text-xs mt-0.5">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Distribución por estado */}
        <div className="card p-6 lg:col-span-1">
          <h2 className="font-display text-lg font-bold text-slate-900 mb-5">Estado de reservas</h2>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-slate-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Barra apilada */}
              <div className="flex h-3 rounded-full overflow-hidden mb-5 gap-0.5">
                {statusBreakdown.map(s => (
                  s.value > 0 && (
                    <div
                      key={s.label}
                      className={`${s.color} transition-all`}
                      style={{ width: `${(s.value / totalForBar) * 100}%` }}
                    />
                  )
                ))}
              </div>

              <div className="space-y-3">
                {statusBreakdown.map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                      <span className="text-sm font-body text-slate-600">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold font-body ${s.textColor}`}>{s.value}</span>
                      <span className="text-xs text-slate-300 font-body">
                        {metrics.totalBookings > 0
                          ? `${Math.round((s.value / metrics.totalBookings) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alerta pendientes */}
              {metrics.pendingBookings > 0 && (
                <Link href="/agente/reservas"
                  className="mt-5 flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl hover:bg-amber-100 transition-all">
                  <Clock size={14} className="text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700 font-body font-medium">
                    {metrics.pendingBookings} reserva{metrics.pendingBookings > 1 ? 's' : ''} pendiente{metrics.pendingBookings > 1 ? 's' : ''} por confirmar
                  </p>
                  <ArrowRight size={12} className="text-amber-400 ml-auto shrink-0" />
                </Link>
              )}
            </>
          )}
        </div>

        {/* Reservas recientes */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-slate-900">Reservas recientes</h2>
            <Link href="/agente/reservas" className="btn-ghost text-xs flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Calendar size={32} className="mb-3 opacity-30" />
              <p className="font-body text-sm">No hay reservas aún</p>
              <Link href="/agente/reservas/nueva" className="btn-primary text-xs mt-4">
                Crear primera reserva
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recentBookings.map(b => (
                <button
                  key={b.id}
                  onClick={() => router.push(`/agente/reservas/${b.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sky-50/50 transition-colors text-left group"
                >
                  {/* Icono estado */}
                  <div className="shrink-0">
                    {b.status === 'CONFIRMED' || b.status === 'COMPLETED'
                      ? <CheckCircle size={16} className="text-green-500" />
                      : b.status === 'CANCELLED'
                      ? <XCircle size={16} className="text-red-400" />
                      : <Clock size={16} className="text-amber-400" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 font-body truncate">
                      {b.user?.firstName} {b.user?.lastName}
                    </p>
                    <p className="text-xs text-slate-400 font-body truncate">{b.trip?.title}</p>
                  </div>

                  {/* Monto + fecha */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-sky-600 font-body">{formatCurrency(b.totalAmount)}</p>
                    <p className="text-xs text-slate-400 font-body">{formatDate(b.createdAt, 'dd MMM')}</p>
                  </div>

                  <ArrowRight size={13} className="text-slate-200 group-hover:text-sky-400 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}