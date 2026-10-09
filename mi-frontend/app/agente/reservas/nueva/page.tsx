'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronLeft, ChevronRight, Plus, Trash2, Users, Plane, CheckCircle, UserCheck, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { tripsApi, bookingsApi, usersApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Trip, User, PassengerType } from '@/types'

interface PassengerForm {
  firstName: string; lastName: string; documentType: string
  documentNumber: string; birthDate: string; type: PassengerType
  nationality: string; phone: string; email: string
}

const EMPTY_PASSENGER = (): PassengerForm => ({
  firstName: '', lastName: '', documentType: 'CC',
  documentNumber: '', birthDate: '', type: 'ADULT',
  nationality: 'Colombia', phone: '', email: '',
})

const DOC_TYPES = ['CC', 'CE', 'PASAPORTE', 'TI', 'NIT']
const PASSENGER_TYPE_LABELS: Record<PassengerType, string> = {
  ADULT: 'Adulto', CHILD: 'Niño', INFANT: 'Infante',
}

export default function NuevaReservaPage() {
  const router = useRouter()
  const [step, setStep]             = useState<1 | 2 | 3>(1)
  const [submitting, setSubmitting] = useState(false)

  // ── Step 1: Viaje ──────────────────────────────────────
  const [search, setSearch]             = useState('')
  const [trips, setTrips]               = useState<Trip[]>([])
  const [loadingTrips, setLoadingTrips] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)

  // ── Step 1: Cliente ────────────────────────────────────
  const [clientQuery, setClientQuery]           = useState('')
  const [clientResults, setClientResults]       = useState<User[]>([])
  const [selectedClient, setSelectedClient]     = useState<User | null>(null)
  const [searchingClient, setSearchingClient]   = useState(false)
  const [showCreateClient, setShowCreateClient] = useState(false)
  const [creatingClient, setCreatingClient]     = useState(false)
  const [newClient, setNewClient] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: ''
  })
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Step 2: Pasajeros ──────────────────────────────────
  const [passengers, setPassengers]           = useState<PassengerForm[]>([EMPTY_PASSENGER()])
  const [specialRequests, setSpecialRequests] = useState('')

  // ── Cargar viajes ──────────────────────────────────────
  useEffect(() => {
    setLoadingTrips(true)
    tripsApi.adminList({ limit: 20, search: search || undefined })
      .then(data => setTrips(data.trips.filter(t => t.status === 'PUBLISHED' && t.availableSeats > 0)))
      .catch(() => {})
      .finally(() => setLoadingTrips(false))
  }, [search])

  // ── Búsqueda cliente con debounce ──────────────────────
  useEffect(() => {
    if (!clientQuery.trim() || clientQuery.length < 2) {
      setClientResults([]); return
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    setSearchingClient(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await usersApi.search(clientQuery)
        setClientResults(data.users)
      } catch { setClientResults([]) }
      finally { setSearchingClient(false) }
    }, 400)
  }, [clientQuery])

  // ── Crear cliente ──────────────────────────────────────
  const handleCreateClient = async () => {
    if (!newClient.firstName || !newClient.lastName || !newClient.email || !newClient.password) {
      toast.error('Nombre, apellido, email y contraseña son requeridos'); return
    }
    setCreatingClient(true)
    try {
      const created = await usersApi.adminCreate({ ...newClient, role: 'CLIENT' })
      setSelectedClient(created)
      setShowCreateClient(false)
      setNewClient({ firstName: '', lastName: '', email: '', phone: '', password: '' })
      toast.success('Cliente creado y seleccionado')
    } catch (err: any) {
      toast.error(err.message)
    } finally { setCreatingClient(false) }
  }

  // ── Pasajeros helpers ──────────────────────────────────
  const updatePassenger = (idx: number, field: keyof PassengerForm, value: string) =>
    setPassengers(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p))

  const addPassenger = () => {
    if (selectedTrip && passengers.length >= selectedTrip.availableSeats) {
      toast.error(`Solo quedan ${selectedTrip.availableSeats} cupos`); return
    }
    setPassengers(prev => [...prev, EMPTY_PASSENGER()])
  }

  const removePassenger = (idx: number) => {
    if (passengers.length === 1) return
    setPassengers(prev => prev.filter((_, i) => i !== idx))
  }

  const validateStep2 = () => {
    for (const [i, p] of passengers.entries()) {
      if (!p.firstName.trim())      { toast.error(`Pasajero ${i + 1}: nombre requerido`);    return false }
      if (!p.lastName.trim())       { toast.error(`Pasajero ${i + 1}: apellido requerido`);  return false }
      if (!p.documentNumber.trim()) { toast.error(`Pasajero ${i + 1}: documento requerido`); return false }
      if (!p.birthDate)             { toast.error(`Pasajero ${i + 1}: fecha requerida`);     return false }
    }
    return true
  }

  const totalAmount = () => {
    if (!selectedTrip) return 0
    return passengers.reduce((acc, p) => {
      if (p.type === 'INFANT') return acc
      if (p.type === 'CHILD')  return acc + (selectedTrip.priceChild ?? selectedTrip.price * 0.7)
      return acc + selectedTrip.price
    }, 0)
  }

  const handleSubmit = async () => {
    if (!selectedTrip) return
    setSubmitting(true)
    const cleanPassengers = passengers.map(p => ({
      firstName: p.firstName, lastName: p.lastName,
      documentType: p.documentType, documentNumber: p.documentNumber,
      birthDate: p.birthDate, type: p.type,
      nationality: p.nationality?.trim() || undefined,
      phone: p.phone?.trim() || undefined,
      email: p.email?.trim() || undefined,
    }))
    try {
      await bookingsApi.create({
        tripId: selectedTrip.id,
        passengers: cleanPassengers,
        specialRequests: specialRequests?.trim() || undefined,
        clientUserId: selectedClient?.id,
      })
      toast.success('Reserva creada exitosamente')
      router.push('/agente/reservas')
    } catch (err: any) {
      toast.error(err.message)
    } finally { setSubmitting(false) }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-slate-900">Nueva reserva</h1>
        <p className="text-slate-500 font-body mt-1">Registra una venta manualmente</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { n: 1, label: 'Viaje y cliente' },
          { n: 2, label: 'Pasajeros'       },
          { n: 3, label: 'Confirmar'       },
        ].map(({ n, label }, idx) => (
          <div key={n} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-body transition-all ${
                step > n ? 'bg-green-500 text-white' : step === n ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {step > n ? <CheckCircle size={14} /> : n}
              </div>
              <span className={`text-sm font-body font-medium hidden sm:block ${step === n ? 'text-slate-800' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {idx < 2 && <div className={`h-px w-8 ${step > n ? 'bg-green-300' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {/* ══════════ STEP 1 ══════════ */}
      {step === 1 && (
        <div className="card p-6 space-y-6">

          {/* Viajes */}
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 mb-3">Seleccionar viaje</h2>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por destino o nombre..." className="input pl-9" />
            </div>

            {loadingTrips ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />)}
              </div>
            ) : trips.length === 0 ? (
              <p className="text-center text-slate-400 font-body py-8">No hay viajes disponibles con cupos</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {trips.map(trip => (
                  <button key={trip.id} onClick={() => setSelectedTrip(trip)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      selectedTrip?.id === trip.id
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <Image src={trip.coverImage} alt={trip.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate font-body">{trip.title}</p>
                      <p className="text-xs text-slate-400 font-body">{formatDate(trip.departureDate, 'dd MMM yyyy')}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sky-600 font-body">{formatCurrency(trip.price)}</p>
                      <p className={`text-xs font-body font-semibold ${trip.availableSeats <= 5 ? 'text-orange-500' : 'text-green-600'}`}>
                        {trip.availableSeats} cupos
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cliente — aparece solo cuando hay viaje seleccionado */}
          {selectedTrip && (
            <div className="border-t border-slate-100 pt-5">
              <h2 className="font-display text-lg font-bold text-slate-900 mb-1">Cliente</h2>
              <p className="text-xs text-slate-400 font-body mb-3">
                Opcional — si no seleccionas uno, la reserva queda a tu nombre
              </p>

              {selectedClient ? (
                // ── Cliente seleccionado ──
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {selectedClient.firstName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{selectedClient.firstName} {selectedClient.lastName}</p>
                      <p className="text-xs text-slate-400">{selectedClient.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedClient(null)}
                    className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-all">
                    <X size={12} /> Cambiar
                  </button>
                </div>

              ) : showCreateClient ? (
                // ── Mini-form crear cliente ──
                <div className="border border-sky-100 bg-sky-50/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-700 font-body">Crear nuevo cliente</p>
                    <button onClick={() => setShowCreateClient(false)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 font-body mb-1 block">Nombre *</label>
                      <input className="input w-full" placeholder="Juan"
                        value={newClient.firstName}
                        onChange={e => setNewClient(p => ({ ...p, firstName: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-body mb-1 block">Apellido *</label>
                      <input className="input w-full" placeholder="Pérez"
                        value={newClient.lastName}
                        onChange={e => setNewClient(p => ({ ...p, lastName: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-body mb-1 block">Email *</label>
                    <input type="email" className="input w-full" placeholder="juan@email.com"
                      value={newClient.email}
                      onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-body mb-1 block">Teléfono</label>
                    <input className="input w-full" placeholder="+57 300 000 0000"
                      value={newClient.phone}
                      onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-body mb-1 block">Contraseña *</label>
                    <input type="password" className="input w-full" placeholder="Mínimo 6 caracteres"
                      value={newClient.password}
                      onChange={e => setNewClient(p => ({ ...p, password: e.target.value }))} />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setShowCreateClient(false)} className="btn-secondary text-sm">Cancelar</button>
                    <button onClick={handleCreateClient} disabled={creatingClient} className="btn-primary text-sm">
                      {creatingClient ? 'Creando...' : 'Crear cliente'}
                    </button>
                  </div>
                </div>

              ) : (
                // ── Buscador ──
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input value={clientQuery} onChange={e => setClientQuery(e.target.value)}
                      placeholder="Buscar cliente por nombre o email..."
                      className="input w-full pl-9" />
                    {searchingClient && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  {clientResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-10 overflow-hidden">
                      {clientResults.map(u => (
                        <button key={u.id}
                          onClick={() => { setSelectedClient(u); setClientQuery(''); setClientResults([]) }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sky-50 transition-colors text-left">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.firstName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-slate-400">{u.email} · {u.role}</p>
                          </div>
                          <UserCheck size={14} className="ml-auto text-sky-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  {clientQuery.length >= 2 && !searchingClient && clientResults.length === 0 && (
                    <p className="text-xs text-slate-400 font-body mt-2 px-1">
                      No encontrado — usa el botón de abajo para crearlo.
                    </p>
                  )}

                  <button
                    onClick={() => { setShowCreateClient(true); setClientQuery(''); setClientResults([]) }}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 hover:border-sky-300 hover:text-sky-500 hover:bg-sky-50/40 transition-all font-body">
                    <Plus size={13} /> Crear nuevo cliente
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button disabled={!selectedTrip} onClick={() => setStep(2)}
              className="btn-primary disabled:opacity-40 flex items-center gap-2">
              Continuar <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════ STEP 2 ══════════ */}
      {step === 2 && selectedTrip && (
        <div className="space-y-4">
          <div className="card p-4 flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
              <Image src={selectedTrip.coverImage} alt={selectedTrip.title} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 font-body truncate">{selectedTrip.title}</p>
              <p className="text-xs text-slate-400 font-body">
                {formatDate(selectedTrip.departureDate, 'dd MMM yyyy')} · {selectedTrip.availableSeats} cupos
                {selectedClient && ` · Cliente: ${selectedClient.firstName} ${selectedClient.lastName}`}
              </p>
            </div>
            <button onClick={() => setStep(1)} className="btn-ghost text-xs flex items-center gap-1">
              <ChevronLeft size={13} /> Cambiar
            </button>
          </div>

          {passengers.map((p, idx) => (
            <div key={idx} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center">
                    <Users size={13} className="text-sky-600" />
                  </div>
                  <h3 className="font-display font-bold text-slate-800">Pasajero {idx + 1}</h3>
                </div>
                {passengers.length > 1 && (
                  <button onClick={() => removePassenger(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 font-body mb-1">Nombre *</label>
                  <input value={p.firstName} onChange={e => updatePassenger(idx, 'firstName', e.target.value)} placeholder="Juan" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 font-body mb-1">Apellido *</label>
                  <input value={p.lastName} onChange={e => updatePassenger(idx, 'lastName', e.target.value)} placeholder="Pérez" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 font-body mb-1">Tipo documento</label>
                  <select value={p.documentType} onChange={e => updatePassenger(idx, 'documentType', e.target.value)} className="input">
                    {DOC_TYPES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 font-body mb-1">N° documento *</label>
                  <input value={p.documentNumber} onChange={e => updatePassenger(idx, 'documentNumber', e.target.value)} placeholder="123456789" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 font-body mb-1">Fecha nacimiento *</label>
                  <input type="date" value={p.birthDate} onChange={e => updatePassenger(idx, 'birthDate', e.target.value)} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 font-body mb-1">Tipo pasajero</label>
                  <select value={p.type} onChange={e => updatePassenger(idx, 'type', e.target.value as PassengerType)} className="input">
                    {(Object.keys(PASSENGER_TYPE_LABELS) as PassengerType[]).map(t => (
                      <option key={t} value={t}>{PASSENGER_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 font-body mb-1">Teléfono</label>
                  <input value={p.phone} onChange={e => updatePassenger(idx, 'phone', e.target.value)} placeholder="+57 300 000 0000" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 font-body mb-1">Email</label>
                  <input type="email" value={p.email} onChange={e => updatePassenger(idx, 'email', e.target.value)} placeholder="juan@email.com" className="input" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 font-body mb-1">Nacionalidad</label>
                  <input value={p.nationality} onChange={e => updatePassenger(idx, 'nationality', e.target.value)} placeholder="Colombia" className="input" />
                </div>
              </div>
            </div>
          ))}

          <button onClick={addPassenger}
            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-sky-300 hover:text-sky-500 hover:bg-sky-50/40 transition-all font-body text-sm flex items-center justify-center gap-2">
            <Plus size={15} /> Agregar pasajero
          </button>

          <div className="card p-5">
            <label className="block text-sm font-semibold text-slate-700 font-body mb-2">Solicitudes especiales</label>
            <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)}
              rows={3} placeholder="Dieta especial, asistencia, alergias..." className="input resize-none" />
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="btn-ghost flex items-center gap-2">
              <ChevronLeft size={16} /> Atrás
            </button>
            <button onClick={() => { if (validateStep2()) setStep(3) }} className="btn-primary flex items-center gap-2">
              Continuar <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════ STEP 3 ══════════ */}
      {step === 3 && selectedTrip && (
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-5">Resumen de la reserva</h2>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl mb-5">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                <Image src={selectedTrip.coverImage} alt={selectedTrip.title} fill className="object-cover" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 font-body">{selectedTrip.title}</p>
                <p className="text-xs text-slate-400 font-body">
                  {formatDate(selectedTrip.departureDate, 'dd MMM yyyy')} → {formatDate(selectedTrip.returnDate, 'dd MMM yyyy')}
                </p>
              </div>
            </div>

            {selectedClient && (
              <div className="flex items-center justify-between py-2 border-b border-slate-50 mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide font-body">Cliente</span>
                <span className="font-semibold text-slate-800 text-sm font-body">
                  {selectedClient.firstName} {selectedClient.lastName}
                </span>
              </div>
            )}

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide font-body mb-3">
              {passengers.length} pasajero{passengers.length > 1 ? 's' : ''}
            </p>
            <div className="space-y-2 mb-5">
              {passengers.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="font-medium text-slate-800 font-body text-sm">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-slate-400 font-body">{p.documentType} {p.documentNumber} · {PASSENGER_TYPE_LABELS[p.type]}</p>
                  </div>
                  <p className="font-semibold text-sky-600 font-body text-sm">
                    {p.type === 'INFANT' ? 'Gratis'
                      : formatCurrency(p.type === 'CHILD'
                          ? (selectedTrip.priceChild ?? selectedTrip.price * 0.7)
                          : selectedTrip.price)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <p className="font-display text-lg font-bold text-slate-900">Total</p>
              <p className="font-display text-2xl font-bold text-sky-600">{formatCurrency(totalAmount())}</p>
            </div>

            {specialRequests && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <p className="text-xs font-semibold text-amber-700 font-body">Solicitudes especiales</p>
                <p className="text-sm text-amber-800 font-body mt-0.5">{specialRequests}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="btn-ghost flex items-center gap-2">
              <ChevronLeft size={16} /> Atrás
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="btn-primary flex items-center gap-2 min-w-[160px] justify-center">
              {submitting
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Plane size={15} /> Crear reserva</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}