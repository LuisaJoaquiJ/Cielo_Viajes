'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { CreditCard, Banknote, Building2, Smartphone, ArrowRight, Lock, CheckCircle2, Users, Calendar, MapPin } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { bookingsApi, paymentsApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Booking, PaymentMethod } from '@/types'

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: LucideIcon; desc: string }[] = [
  { value: 'CREDIT_CARD',   label: 'Tarjeta de crédito',  icon: CreditCard,  desc: 'Visa, Mastercard, AmEx' },
  { value: 'DEBIT_CARD',    label: 'Tarjeta débito',      icon: CreditCard,  desc: 'Todas las entidades' },
  { value: 'MERCADO_PAGO',  label: 'Mercado Pago',        icon: Smartphone,  desc: 'Pago en línea' },
  { value: 'BANK_TRANSFER', label: 'Transferencia',       icon: Building2,   desc: 'PSE / Bancolombia' },
  { value: 'CASH',          label: 'Efectivo',            icon: Banknote,    desc: 'Efecty, Baloto' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const params = useParams<{ bookingId: string }>()
  const bookingId = params.bookingId
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading]   = useState(true)
  const [method, setMethod]     = useState<PaymentMethod>('CREDIT_CARD')
  const [paying, setPaying]     = useState(false)
  const [done, setDone]         = useState(false)

  useEffect(() => {
    bookingsApi.byId(bookingId)
      .then(setBooking)
      .catch(() => router.push('/mi-cuenta/reservas'))
      .finally(() => setLoading(false))
  }, [bookingId, router])

  const handlePay = async () => {
    if (!booking) return
    if (booking.payment) {
      setDone(true)
      toast.success('Pago ya iniciado para esta reserva')
      return
    }

    setPaying(true)
    try {
      await paymentsApi.initiate(booking.id, method)
      setDone(true)
      toast.success('¡Reserva confirmada!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No pudimos procesar el pago')
    } finally { setPaying(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-sky-200 border-t-sky-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-body">Cargando reserva...</p>
      </div>
    </div>
  )

  if (done) return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4">
      <div className="card max-w-md w-full p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-sky-500 flex items-center justify-center mx-auto mb-6 shadow-glow-teal">
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">¡Reserva confirmada!</h1>
        <p className="text-slate-500 font-body mb-2">Tu reserva <strong>#{booking?.bookingCode}</strong> ha sido procesada exitosamente.</p>
        <p className="text-slate-400 font-body text-sm mb-8">Recibirás un correo con todos los detalles de tu viaje.</p>
        <Link href="/mi-cuenta/reservas" className="btn-primary w-full justify-center">
          Ver mis reservas <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )

  if (!booking) return null

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <div className="bg-cielo-dark py-5 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
              <span className="text-white font-display font-bold">C</span>
            </div>
            <span className="font-display text-xl font-bold text-white">Cielo</span>
          </Link>
          <div className="flex items-center gap-2 text-sky-300 text-sm font-body">
            <Lock size={13} /> Pago seguro
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="font-display text-4xl font-bold text-slate-900 mb-2">Completa tu reserva</h1>
        <p className="text-slate-500 font-body mb-8">Elige tu método de pago y confirma tu aventura</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Payment */}
          <div className="lg:col-span-3 space-y-6">
            {/* Passengers */}
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users size={18} className="text-sky-500" /> Pasajeros
              </h2>
              <div className="space-y-3">
                {booking.passengers.map((p, i) => (
                  <div key={p.id ?? i} className="flex items-center justify-between p-3 rounded-xl bg-sky-50 border border-sky-100">
                    <div>
                      <p className="font-semibold text-slate-800 font-body text-sm">
                        {p.firstName || `Pasajero ${i + 1}`} {p.lastName}
                      </p>
                      <p className="text-xs text-slate-500 font-body">{p.type === 'ADULT' ? 'Adulto' : p.type === 'CHILD' ? 'Niño' : 'Infante'}</p>
                    </div>
                    <span className="font-display font-bold text-sky-600">
                      {formatCurrency(p.type === 'CHILD' ? Number(booking.trip.priceChild ?? booking.trip.price) : Number(booking.trip.price))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-sky-500" /> Método de pago
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(m => (
                  <button key={m.value} onClick={() => setMethod(m.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      method === m.value
                        ? 'border-sky-500 bg-sky-50 shadow-glass'
                        : 'border-slate-100 hover:border-sky-200 hover:bg-sky-50/50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${method === m.value ? 'bg-gradient-to-br from-sky-500 to-teal-500' : 'bg-slate-100'}`}>
                      <m.icon size={17} className={method === m.value ? 'text-white' : 'text-slate-500'} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold font-body ${method === m.value ? 'text-sky-700' : 'text-slate-700'}`}>{m.label}</p>
                      <p className="text-xs text-slate-400 font-body">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pay button */}
            <button onClick={handlePay} disabled={paying}
              className="btn-primary w-full justify-center text-base py-4 disabled:opacity-70">
              {paying
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Procesando...</>
                : <><Lock size={16} /> Confirmar y pagar {formatCurrency(booking.totalAmount)}</>
              }
            </button>
            <p className="text-center text-xs text-slate-400 font-body flex items-center justify-center gap-1">
              <Lock size={10} /> Tu pago está protegido con cifrado SSL de 256 bits
            </p>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-2">
            <div className="card p-6 sticky top-6">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-4">Resumen del viaje</h2>

              <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                <Image src={booking.trip.coverImage} alt={booking.trip.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-card" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-display font-bold text-lg leading-tight line-clamp-2">{booking.trip.title}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm font-body">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin size={13} className="text-sky-500" />
                  {booking.trip.destination?.name}, {booking.trip.destination?.country}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={13} className="text-teal-500" />
                  {formatDate(booking.trip.departureDate)} → {formatDate(booking.trip.returnDate)}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users size={13} className="text-teal-500" />
                  {booking.passengers.length} pasajero{booking.passengers.length > 1 ? 's' : ''}
                </div>
              </div>

              <hr className="my-4 border-sky-50" />

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 font-body">Total a pagar</span>
                <span className="font-display text-2xl font-bold text-sky-600">{formatCurrency(booking.totalAmount)}</span>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-100 flex items-start gap-2">
                <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
                <p className="text-xs text-green-700 font-body">Reserva confirmada inmediatamente tras el pago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
