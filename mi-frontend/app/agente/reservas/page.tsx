'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { bookingsApi } from '@/lib/api'
import { formatCurrency, formatDate, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/lib/utils'
import type { Booking, BookingStatus } from '@/types'
import BookingFormModal from '@/components/agente/BookingFormModal'

const STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED']

export default function AgenteReservasPage() {
  const router = useRouter()
  const [bookings, setBookings]         = useState<Booking[]>([])
  const [meta, setMeta]                 = useState<any>(null)
  const [loading, setLoading]           = useState(true)
  const [page, setPage]                 = useState(1)
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')
  const [showForm, setShowForm]         = useState(false)

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const data = await bookingsApi.adminList({ page, limit: 15, status: statusFilter || undefined })
      setBookings(data.bookings ?? [])
      setMeta(data.meta)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchBookings() }, [page, statusFilter])

  const handleUpdateStatus = async (e: React.MouseEvent, id: string, status: BookingStatus) => {
    e.stopPropagation()
    try {
      await bookingsApi.update(id, { status })
      toast.success('Estado actualizado')
      fetchBookings()
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-slate-900">Mis ventas</h1>
          <p className="text-slate-500 font-body mt-1">{meta?.total ?? 0} reservas en total</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nueva reserva
        </button>
      </div>

      {/* Filtro */}
      <div className="card p-4 mb-6">
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as any); setPage(1) }}
          className="input max-w-[200px]"
        >
          <option value="">Todos los estados</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-xs text-slate-400 uppercase tracking-wide">
                <th className="px-5 py-4 font-semibold">Código</th>
                <th className="px-5 py-4 font-semibold">Cliente</th>
                <th className="px-5 py-4 font-semibold">Viaje</th>
                <th className="px-5 py-4 font-semibold">Pasajeros</th>
                <th className="px-5 py-4 font-semibold">Total</th>
                <th className="px-5 py-4 font-semibold">Estado</th>
                <th className="px-5 py-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-5 py-4">
                        <div className="h-10 bg-slate-50 rounded-lg animate-pulse" />
                      </td>
                    </tr>
                  ))
                : bookings.length === 0
                ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-slate-400 font-body">
                        No hay reservas aún
                      </td>
                    </tr>
                  )
                : bookings.map(b => (
                    <tr
                      key={b.id}
                      onClick={() => router.push(`/agente/reservas/${b.id}`)}
                      className="hover:bg-sky-50/30 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">
                        #{b.bookingCode.slice(-8)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">{b.user?.firstName} {b.user?.lastName}</p>
                        <p className="text-xs text-slate-400">{b.user?.email}</p>
                      </td>
                      <td className="px-5 py-4 max-w-[180px]">
                        <p className="font-medium text-slate-700 truncate">{b.trip?.title}</p>
                        <p className="text-xs text-slate-400">{formatDate(b.trip?.departureDate)}</p>
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-slate-600">
                        {b.passengers?.length ?? 0}
                      </td>
                      <td className="px-5 py-4 font-bold text-sky-600">
                        {formatCurrency(b.totalAmount)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge text-xs ${BOOKING_STATUS_COLORS[b.status]}`}>
                          {BOOKING_STATUS_LABELS[b.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {b.status === 'PENDING' && (
                            <button
                              onClick={e => handleUpdateStatus(e, b.id, 'CONFIRMED')}
                              title="Confirmar"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                            <button
                              onClick={e => handleUpdateStatus(e, b.id, 'CANCELLED')}
                              title="Cancelar"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                          {b.status === 'CONFIRMED' && (
                            <button
                              onClick={e => handleUpdateStatus(e, b.id, 'COMPLETED')}
                              className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all font-body"
                            >
                              ✓ Completar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-body">Página {meta.page} de {meta.totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-ghost text-xs py-1.5 disabled:opacity-40">Anterior</button>
              <button disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)} className="btn-ghost text-xs py-1.5 disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <BookingFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchBookings() }}
        />
      )}
    </div>
  )
}