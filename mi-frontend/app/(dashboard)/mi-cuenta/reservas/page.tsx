'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Users, ArrowRight, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { bookingsApi } from '@/lib/api'
import { formatCurrency, formatDate, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/lib/utils'
import type { Booking } from '@/types'

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    bookingsApi.my().then(setBookings).finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id: string) => {
    if (!confirm('¿Seguro que deseas cancelar esta reserva?')) return
    setCancelling(id)
    try {
      await bookingsApi.cancel(id)
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b))
      toast.success('Reserva cancelada')
    } catch (err: any) { toast.error(err.message) }
    finally { setCancelling(null) }
  }

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-32 animate-pulse bg-sky-50" />)}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Mis reservas</h1>
        <p className="text-slate-500 font-body text-sm mt-1">{bookings.length} reserva{bookings.length !== 1 ? 's' : ''} en total</p>
      </div>

      {bookings.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">✈️</div>
          <h3 className="font-display text-2xl font-bold text-slate-800 mb-2">¡Aún no tienes reservas!</h3>
          <p className="text-slate-500 font-body mb-6">Explora nuestros destinos y reserva tu próxima aventura.</p>
          <Link href="/viajes" className="btn-primary inline-flex">Ver viajes disponibles <ArrowRight size={16} /></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="card p-0 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-44 h-36 md:h-auto shrink-0">
                  <Image src={booking.trip.coverImage} alt={booking.trip.title} fill className="object-cover" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge text-xs ${BOOKING_STATUS_COLORS[booking.status]}`}>
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </span>
                        <span className="text-xs text-slate-400 font-body">#{booking.bookingCode}</span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-slate-900">{booking.trip.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500 font-body">
                        <span className="flex items-center gap-1"><MapPin size={11} className="text-sky-500" />{booking.trip.destination?.name}</span>
                        <span className="flex items-center gap-1"><Calendar size={11} className="text-teal-500" />{formatDate(booking.trip.departureDate)}</span>
                        <span className="flex items-center gap-1"><Users size={11} className="text-teal-500" />{booking.passengers.length} pasajero{booking.passengers.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-2xl font-bold text-sky-600">{formatCurrency(booking.totalAmount)}</p>
                      {booking.payment && (
                        <p className="text-xs text-slate-400 font-body mt-1">{booking.payment.status === 'APPROVED' ? '✅ Pagado' : '⏳ Pendiente'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    {booking.status === 'PENDING' && (
                      <Link href={`/checkout/${booking.id}`} className="btn-primary text-sm py-2">
                        Completar pago <ArrowRight size={14} />
                      </Link>
                    )}
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <button onClick={() => handleCancel(booking.id)}
                        disabled={cancelling === booking.id}
                        className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-semibold font-body disabled:opacity-50">
                        <X size={14} /> {cancelling === booking.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
