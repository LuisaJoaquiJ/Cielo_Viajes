'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ChevronLeft, CheckCircle, XCircle, Plane,
  Users, User, FileText, CreditCard, Plus, Banknote, Edit2, Save, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { bookingsApi, paymentsApi } from '@/lib/api'
import { formatCurrency, formatDate, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/lib/utils'
import type { Booking, BookingStatus, Payment } from '@/types'

const PASSENGER_TYPE_LABELS: Record<string, string> = {
  ADULT: 'Adulto', CHILD: 'Niño', INFANT: 'Infante',
}

const PAYMENT_METHOD_MAP: Record<string, string> = {
  EFECTIVO: 'CASH', TRANSFERENCIA: 'BANK_TRANSFER',
  TARJETA: 'CREDIT_CARD', NEQUI: 'MERCADO_PAGO', DAVIPLATA: 'MERCADO_PAGO',
}

const PAYMENT_METHODS = [
  { value: 'EFECTIVO',      label: 'Efectivo'      },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA',       label: 'Tarjeta'       },
  { value: 'NEQUI',         label: 'Nequi'         },
  { value: 'DAVIPLATA',     label: 'Daviplata'     },
]

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Efectivo', BANK_TRANSFER: 'Transferencia',
  CREDIT_CARD: 'Tarjeta crédito', DEBIT_CARD: 'Tarjeta débito', MERCADO_PAGO: 'Mercado Pago',
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente', APPROVED: 'Aprobado', REJECTED: 'Rechazado',
  REFUNDED: 'Reembolsado', IN_PROCESS: 'En proceso',
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-yellow-50 text-yellow-700 border border-yellow-100',
  APPROVED:   'bg-green-50  text-green-700  border border-green-100',
  REJECTED:   'bg-red-50    text-red-600    border border-red-100',
  REFUNDED:   'bg-slate-100 text-slate-500  border border-slate-200',
  IN_PROCESS: 'bg-sky-50    text-sky-600    border border-sky-100',
}

const ALL_STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED']

export default function AdminReservaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [booking, setBooking]   = useState<Booking | null>(null)
  const [loading, setLoading]   = useState(true)
  const [updating, setUpdating] = useState(false)

  // ── Edición de notas ───────────────────────────────────────
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes]               = useState('')
  const [savingNotes, setSavingNotes]   = useState(false)

  // ── Edición de estado ──────────────────────────────────────
  const [editingStatus, setEditingStatus] = useState(false)
  const [newStatus, setNewStatus]         = useState<BookingStatus>('PENDING')
  const [savingStatus, setSavingStatus]   = useState(false)

  // ── Pagos ──────────────────────────────────────────────────
  const [payments, setPayments]       = useState<Payment[]>([])
  const [loadingPay, setLoadingPay]   = useState(false)
  const [showPayForm, setShowPayForm] = useState(false)
  const [payMethod, setPayMethod]     = useState('EFECTIVO')
  const [registering, setRegistering] = useState(false)

  const fetchBooking = async () => {
    setLoading(true)
    try {
      const data = await bookingsApi.byId(id)
      setBooking(data)
      setNotes(data.notes ?? '')
      setNewStatus(data.status)
    } catch {
      toast.error('No se pudo cargar la reserva')
      router.push('/admin/reservas')
    } finally { setLoading(false) }
  }

  const fetchPayments = async () => {
    setLoadingPay(true)
    try {
      const data = await paymentsApi.adminList({ limit: 50 })
      setPayments(data.payments.filter((p: Payment) => p.bookingId === id))
    } catch {
    } finally { setLoadingPay(false) }
  }

  useEffect(() => { fetchBooking(); fetchPayments() }, [id])

  // ── Cambio rápido de estado ────────────────────────────────
  const handleStatusChange = async (status: BookingStatus) => {
    if (!booking) return
    setUpdating(true)
    try {
      const updated = await bookingsApi.update(booking.id, { status })
      setBooking(updated)
      setNewStatus(updated.status)
      toast.success('Estado actualizado')
    } catch (err: any) { toast.error(err.message) }
    finally { setUpdating(false) }
  }

  // ── Guardar estado desde selector ─────────────────────────
  const handleSaveStatus = async () => {
    if (!booking || newStatus === booking.status) { setEditingStatus(false); return }
    setSavingStatus(true)
    try {
      const updated = await bookingsApi.update(booking.id, { status: newStatus })
      setBooking(updated)
      setEditingStatus(false)
      toast.success('Estado actualizado')
    } catch (err: any) { toast.error(err.message) }
    finally { setSavingStatus(false) }
  }

  // ── Guardar notas ──────────────────────────────────────────
  const handleSaveNotes = async () => {
    if (!booking) return
    setSavingNotes(true)
    try {
      const updated = await bookingsApi.update(booking.id, { notes })
      setBooking(updated)
      setEditingNotes(false)
      toast.success('Notas guardadas')
    } catch (err: any) { toast.error(err.message) }
    finally { setSavingNotes(false) }
  }

  const handleCancel = async () => {
    if (!booking) return
    setUpdating(true)
    try {
      const updated = await bookingsApi.cancel(booking.id)
      setBooking(updated)
      toast.success('Reserva cancelada')
    } catch (err: any) { toast.error(err.message) }
    finally { setUpdating(false) }
  }

  // ── Pago ───────────────────────────────────────────────────
  const handleRegisterPayment = async () => {
    if (!booking) return
    setRegistering(true)
    try {
      await paymentsApi.initiate(booking.id, PAYMENT_METHOD_MAP[payMethod])
      toast.success('Pago registrado')
      setShowPayForm(false)
      setPayMethod('EFECTIVO')
      fetchPayments()
    } catch (err: any) { toast.error(err.message) }
    finally { setRegistering(false) }
  }

  const totalPagado = payments
    .filter(p => (p.status as string) === 'APPROVED')
    .reduce((acc, p) => acc + (p.amount ?? 0), 0)

  const saldo = (booking?.totalAmount ?? 0) - totalPagado

  // ── Skeleton ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-100 rounded-lg" />
        <div className="card p-6 h-40 bg-slate-50 rounded-2xl" />
        <div className="card p-6 h-56 bg-slate-50 rounded-2xl" />
        <div className="card p-6 h-32 bg-slate-50 rounded-2xl" />
      </div>
    )
  }

  if (!booking) return null

  const { trip, user, passengers, status, totalAmount, bookingCode, specialRequests, createdAt } = booking

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Back + Title */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => router.push('/admin/reservas')}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 leading-tight">
            Reserva{' '}
            <span className="font-mono text-sky-600 text-2xl">
              #{bookingCode?.slice(-8) ?? id.slice(-8)}
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-body mt-0.5">
            Creada el {formatDate(createdAt, 'dd MMM yyyy · HH:mm')}
          </p>
        </div>
      </div>

      {/* ── Estado + Acciones ──────────────────────────────── */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {editingStatus ? (
              <div className="flex items-center gap-2">
                <select value={newStatus}
                  onChange={e => setNewStatus(e.target.value as BookingStatus)}
                  className="input text-sm">
                  {ALL_STATUSES.map(s => (
                    <option key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</option>
                  ))}
                </select>
                <button onClick={handleSaveStatus} disabled={savingStatus}
                  className="p-1.5 rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-all">
                  <Save size={14} />
                </button>
                <button onClick={() => { setEditingStatus(false); setNewStatus(status) }}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className={`badge text-sm px-3 py-1 ${BOOKING_STATUS_COLORS[status]}`}>
                  {BOOKING_STATUS_LABELS[status]}
                </span>
                <button onClick={() => setEditingStatus(true)}
                  className="p-1 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all">
                  <Edit2 size={13} />
                </button>
              </div>
            )}
            <span className="text-slate-300 text-lg">·</span>
            <span className="font-display text-2xl font-bold text-sky-600">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {status === 'PENDING' && (
              <button disabled={updating} onClick={() => handleStatusChange('CONFIRMED')}
                className="btn-primary flex items-center gap-1.5 text-sm">
                <CheckCircle size={14} /> Confirmar
              </button>
            )}
            {status === 'CONFIRMED' && (
              <button disabled={updating} onClick={() => handleStatusChange('COMPLETED')}
                className="btn-primary flex items-center gap-1.5 text-sm">
                <Plane size={14} /> Marcar completada
              </button>
            )}
            {(status === 'PENDING' || status === 'CONFIRMED') && (
              <button disabled={updating} onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-body font-medium text-red-500 hover:bg-red-50 border border-red-100 transition-all disabled:opacity-50">
                <XCircle size={14} /> Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Viaje ─────────────────────────────────────────── */}
      {trip && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plane size={15} className="text-sky-500" />
            <h2 className="font-display font-bold text-slate-800 text-base">Viaje</h2>
          </div>
          <div className="flex items-center gap-4">
            {trip.coverImage && (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                <Image src={trip.coverImage} alt={trip.title} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 font-body truncate">{trip.title}</p>
              <p className="text-xs text-slate-400 font-body mt-0.5">
                {formatDate(trip.departureDate, 'dd MMM yyyy')}
                {trip.returnDate && ` → ${formatDate(trip.returnDate, 'dd MMM yyyy')}`}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              ['Destino',     trip.destination?.name ?? '—'],
              ['Duración',    trip.durationDays ? `${trip.durationDays} días` : '—'],
              ['Cupos disp.', trip.availableSeats ?? '—'],
            ].map(([label, value]) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400 font-body">{label}</p>
                <p className="font-semibold text-slate-800 font-body text-sm mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Cliente ───────────────────────────────────────── */}
      {user && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={15} className="text-sky-500" />
            <h2 className="font-display font-bold text-slate-800 text-base">Cliente</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white font-bold shrink-0">
              {user.firstName?.[0] ?? '?'}
            </div>
            <div>
              <p className="font-semibold text-slate-800 font-body">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-slate-400 font-body">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Pasajeros ─────────────────────────────────────── */}
      {passengers && passengers.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-sky-500" />
            <h2 className="font-display font-bold text-slate-800 text-base">
              Pasajeros ({passengers.length})
            </h2>
          </div>
          <div className="space-y-3">
            {passengers.map((p: any, i: number) => (
              <div key={p.id ?? i}
                className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-600 shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 font-body text-sm">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-xs text-slate-400 font-body">
                      {p.documentType} {p.documentNumber}
                      {p.birthDate && ` · Nac. ${formatDate(p.birthDate, 'dd/MM/yyyy')}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-body">
                    {PASSENGER_TYPE_LABELS[p.type] ?? p.type}
                  </span>
                  {p.type !== 'INFANT' && trip && (
                    <p className="text-xs text-sky-600 font-semibold font-body mt-0.5">
                      {formatCurrency(p.type === 'CHILD'
                        ? (trip.priceChild ?? trip.price * 0.7)
                        : trip.price)}
                    </p>
                  )}
                  {p.type === 'INFANT' && (
                    <p className="text-xs text-green-600 font-semibold font-body mt-0.5">Gratis</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
            <p className="font-display font-bold text-slate-900">Total</p>
            <p className="font-display text-xl font-bold text-sky-600">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
      )}

      {/* ── Pagos ─────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard size={15} className="text-sky-500" />
            <h2 className="font-display font-bold text-slate-800 text-base">Pagos</h2>
          </div>
          {!showPayForm && status !== 'CANCELLED' && status !== 'REFUNDED' && (
            <button onClick={() => setShowPayForm(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 px-3 py-1.5 rounded-lg hover:bg-sky-50 transition-all font-body border border-sky-100">
              <Plus size={13} /> Registrar pago
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total reserva', value: formatCurrency(totalAmount),       color: 'text-slate-800' },
            { label: 'Pagado',        value: formatCurrency(totalPagado),        color: 'text-green-600' },
            { label: 'Saldo',         value: formatCurrency(Math.max(0, saldo)), color: saldo > 0 ? 'text-red-500' : 'text-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 font-body">{label}</p>
              <p className={`font-bold font-body text-sm mt-0.5 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {showPayForm && (
          <div className="border border-sky-100 bg-sky-50/40 rounded-xl p-4 mb-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700 font-body">Registrar nuevo pago</p>
            <div>
              <label className="text-xs text-slate-500 font-body mb-1 block">Método de pago</label>
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="input w-full">
                {PAYMENT_METHODS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => { setShowPayForm(false); setPayMethod('EFECTIVO') }}
                className="btn-secondary text-sm">Cancelar</button>
              <button onClick={handleRegisterPayment} disabled={registering}
                className="btn-primary text-sm flex items-center gap-1.5">
                <Banknote size={14} />
                {registering ? 'Registrando...' : 'Confirmar pago'}
              </button>
            </div>
          </div>
        )}

        {loadingPay ? (
          <div className="space-y-2">
            {[1, 2].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)}
          </div>
        ) : payments.length === 0 ? (
          <p className="text-center text-slate-400 font-body text-sm py-6">Sin pagos registrados aún</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p: Payment, i) => (
              <div key={p.id ?? i}
                className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center">
                    <CreditCard size={14} className="text-sky-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 font-body">
                      {PAYMENT_METHOD_LABELS[p.method as string] ?? p.method}
                    </p>
                    <p className="text-xs text-slate-400 font-body">
                      {p.createdAt ? formatDate(p.createdAt, 'dd MMM yyyy · HH:mm') : '—'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  {p.amount != null && (
                    <p className="font-bold text-sky-600 font-body text-sm">{formatCurrency(p.amount)}</p>
                  )}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full font-body ${PAYMENT_STATUS_COLORS[p.status] ?? 'bg-slate-100 text-slate-500'}`}>
                    {PAYMENT_STATUS_LABELS[p.status] ?? p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Notas internas (solo admin) ───────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Edit2 size={15} className="text-sky-500" />
            <h2 className="font-display font-bold text-slate-800 text-base">Notas internas</h2>
          </div>
          {!editingNotes && (
            <button onClick={() => setEditingNotes(true)}
              className="text-xs text-sky-600 hover:text-sky-700 px-3 py-1.5 rounded-lg hover:bg-sky-50 border border-sky-100 transition-all font-body font-semibold flex items-center gap-1.5">
              <Edit2 size={12} /> Editar
            </button>
          )}
        </div>
        {editingNotes ? (
          <div className="space-y-3">
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              rows={4} placeholder="Notas internas del agente o admin..."
              className="input w-full resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setEditingNotes(false); setNotes(booking.notes ?? '') }}
                className="btn-secondary text-sm">Cancelar</button>
              <button onClick={handleSaveNotes} disabled={savingNotes}
                className="btn-primary text-sm flex items-center gap-1.5">
                <Save size={14} />
                {savingNotes ? 'Guardando...' : 'Guardar notas'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600 font-body leading-relaxed min-h-[40px]">
            {booking.notes
              ? booking.notes
              : <span className="text-slate-400 italic">Sin notas aún</span>}
          </p>
        )}
      </div>

      {/* ── Solicitudes especiales ─────────────────────────── */}
      {specialRequests && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={15} className="text-sky-500" />
            <h2 className="font-display font-bold text-slate-800 text-base">Solicitudes especiales</h2>
          </div>
          <p className="text-sm text-slate-600 font-body leading-relaxed bg-amber-50 border border-amber-100 rounded-xl p-3">
            {specialRequests}
          </p>
        </div>
      )}

    </div>
  )
}
