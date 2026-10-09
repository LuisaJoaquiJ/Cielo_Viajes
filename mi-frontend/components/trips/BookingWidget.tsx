'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Users, Calendar, ArrowRight, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { bookingsApi } from '@/lib/api'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import type { Trip } from '@/types'

export default function BookingWidget({ trip }: { trip: Trip }) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [loading, setLoading] = useState(false)

  const total = adults * Number(trip.price) + children * Number(trip.priceChild ?? trip.price)
  const totalPassengers = adults + children

  const handleBook = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/viajes/' + trip.slug)
      return
    }

    if (totalPassengers > trip.availableSeats) {
      toast.error(`Solo quedan ${trip.availableSeats} cupos`)
      return
    }

    setLoading(true)

    try {
      const timestamp = Date.now()
      const passengers = [
        ...Array.from({ length: adults }, (_, index) => ({
          firstName: index === 0 ? user?.firstName ?? 'Pasajero' : `Adulto ${index + 1}`,
          lastName: index === 0 ? user?.lastName ?? 'Principal' : 'Acompanante',
          documentType: 'CC',
          documentNumber: `PENDIENTE-${timestamp}-A${index + 1}`,
          birthDate: '1990-01-01',
          type: 'ADULT' as const,
          phone: index === 0 ? user?.phone : undefined,
          email: index === 0 ? user?.email : undefined,
        })),
        ...Array.from({ length: children }, (_, index) => ({
          firstName: `Nino ${index + 1}`,
          lastName: 'Acompanante',
          documentType: 'CC',
          documentNumber: `PENDIENTE-${timestamp}-N${index + 1}`,
          birthDate: '2015-01-01',
          type: 'CHILD' as const,
        })),
      ]
      const booking = await bookingsApi.create({ tripId: trip.id, passengers })
      router.push(`/checkout/${booking.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No pudimos crear la reserva')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="public-glass-panel rounded-[30px] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
      <div className="mb-6">
        <p className="mb-1 font-body text-sm text-slate-400">Precio por adulto desde</p>
        <p className="font-display text-5xl font-bold text-white drop-shadow-[0_0_22px_rgba(34,211,238,0.18)]">
          {formatCurrency(trip.price)}
        </p>
        {trip.priceChild && (
          <p className="mt-2 font-body text-xs text-slate-400">Niños: {formatCurrency(trip.priceChild)}</p>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <DateBox label="Salida" value={formatShortDate(trip.departureDate)} />
        <DateBox label="Regreso" value={formatShortDate(trip.returnDate)} />
      </div>

      <div className="mb-6 space-y-3">
        <PassengerCounter
          label="Adultos"
          count={adults}
          min={1}
          max={trip.availableSeats - children}
          onChange={setAdults}
        />
        <PassengerCounter
          label="Niños (2-12 años)"
          count={children}
          min={0}
          max={trip.availableSeats - adults}
          onChange={setChildren}
        />
      </div>

      <div className="mb-6 flex items-center gap-2 font-body text-xs text-slate-400">
        <Users size={13} className="text-emerald-300" />
        {trip.availableSeats} cupos disponibles
      </div>

      <div className="mb-4 flex items-center justify-between border-t border-cyan-200/10 py-4">
        <span className="font-body font-semibold text-slate-300">Total estimado</span>
        <span className="font-display text-3xl font-bold text-cyan-100">{formatCurrency(total)}</span>
      </div>

      <button
        onClick={handleBook}
        disabled={loading || trip.availableSeats === 0}
        className="public-primary-button flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-body text-base font-bold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Procesando...' : trip.availableSeats === 0 ? 'Sin cupos disponibles' : (
          <>
            <ArrowRight size={18} /> {isAuthenticated ? 'Reservar ahora' : 'Iniciar sesión para reservar'}
          </>
        )}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 font-body text-xs text-slate-500">
        <Lock size={11} /> Pago 100% seguro y encriptado
      </p>
    </div>
  )
}

function DateBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cyan-200/12 bg-slate-950/40 p-4 text-center">
      <p className="mb-1 flex items-center justify-center gap-1 font-body text-xs text-slate-400">
        <Calendar size={10} /> {label}
      </p>
      <p className="font-body text-sm font-bold text-white">{value}</p>
    </div>
  )
}

function PassengerCounter({
  label,
  count,
  min,
  max,
  onChange,
}: {
  label: string
  count: number
  min: number
  max: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/35 p-4">
      <div>
        <p className="font-body text-sm font-semibold text-white">{label}</p>
        <p className="font-body text-xs text-slate-500">Max. {max}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, count - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-200/15 bg-white/5 text-cyan-100 transition-all hover:border-cyan-200/35 hover:bg-cyan-200/10"
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center font-body font-bold text-white">{count}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, count + 1))}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300 to-blue-500 text-slate-950 shadow-[0_12px_30px_rgba(14,165,233,0.28)] transition-all hover:scale-105"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}
