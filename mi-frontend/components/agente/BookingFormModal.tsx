'use client'
import { useState, useEffect, useRef } from 'react'
import { X, UserPlus, Trash2, Search, User, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { tripsApi, bookingsApi, usersApi } from '@/lib/api'
import type { Trip, User as UserType, PassengerType } from '@/types'

interface Passenger {
  firstName:      string
  lastName:       string
  documentType:   string
  documentNumber: string
  birthDate:      string
  type:           PassengerType
  nationality:    string
  phone:          string
  email:          string
}

const EMPTY_PASSENGER: Passenger = {
  firstName: '', lastName: '', documentType: 'CC',
  documentNumber: '', birthDate: '', type: 'ADULT',
  nationality: 'Colombia', phone: '', email: '',
}

interface Props {
  onClose: () => void
  onSaved: () => void
}

export default function BookingFormModal({ onClose, onSaved }: Props) {
  // ── Paso 1 ──
  const [trips, setTrips]               = useState<Trip[]>([])
  const [tripId, setTripId]             = useState('')
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [specialRequests, setSpecialRequests] = useState('')

  // ── Búsqueda de cliente ──
  const [clientQuery, setClientQuery]       = useState('')
  const [clientResults, setClientResults]   = useState<UserType[]>([])
  const [selectedClient, setSelectedClient] = useState<UserType | null>(null)
  const [searchingClient, setSearchingClient] = useState(false)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  // ── Paso 2 ──
  const [passengers, setPassengers] = useState<Passenger[]>([{ ...EMPTY_PASSENGER }])

  // ── General ──
  const [step, setStep]     = useState<1 | 2>(1)
  const [saving, setSaving] = useState(false)

  // Cargar viajes publicados con cupos
  useEffect(() => {
    tripsApi.adminList({ limit: 100 })
      .then(d => setTrips(d.trips.filter(t => t.status === 'PUBLISHED' && t.availableSeats > 0)))
      .catch(() => toast.error('Error cargando viajes'))
  }, [])

  useEffect(() => {
    setSelectedTrip(trips.find(t => t.id === tripId) ?? null)
  }, [tripId, trips])

  // Búsqueda de cliente con debounce
  useEffect(() => {
  if (!clientQuery.trim() || clientQuery.length < 2) {
    setClientResults([])
    return
  }
  if (searchTimeout.current) clearTimeout(searchTimeout.current) // ✅
  setSearchingClient(true)
  searchTimeout.current = setTimeout(async () => {
    try {
      const data = await usersApi.search(clientQuery)
      setClientResults(data.users)
    } catch { setClientResults([]) }
    finally { setSearchingClient(false) }
  }, 400)
}, [clientQuery])

  const selectClient = (u: UserType) => {
    setSelectedClient(u)
    setClientQuery('')
    setClientResults([])
  }

  // ── Pasajeros ──
  const updatePassenger = (i: number, field: keyof Passenger, value: string) =>
    setPassengers(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))

  const addPassenger = () => {
    if (selectedTrip && passengers.length >= selectedTrip.availableSeats) {
      toast.error('No hay cupos suficientes'); return
    }
    setPassengers(prev => [...prev, { ...EMPTY_PASSENGER }])
  }

  const removePassenger = (i: number) => {
    if (passengers.length === 1) return
    setPassengers(prev => prev.filter((_, idx) => idx !== i))
  }

  // ── Submit ──
  const handleSubmit = async () => {
    if (!tripId)          { toast.error('Selecciona un viaje'); return }
    if (!selectedClient)  { toast.error('Selecciona un cliente'); return }
    const invalid = passengers.some(p => !p.firstName || !p.lastName || !p.documentNumber || !p.birthDate)
    if (invalid) { toast.error('Completa todos los campos obligatorios'); return }

    setSaving(true)
    try {
      await bookingsApi.create({
        tripId,
        passengers,
        specialRequests: specialRequests || undefined,
        // ✅ asociar al cliente seleccionado
        clientUserId: selectedClient.id,
      } as any)
      toast.success('Reserva creada exitosamente')
      onSaved()
    } catch (err: any) {
      toast.error(err.message)
    } finally { setSaving(false) }
  }

  const totalAmount = selectedTrip
    ? passengers.reduce((acc, p) =>
        acc + (p.type === 'ADULT' ? selectedTrip.price : (selectedTrip.priceChild ?? selectedTrip.price)), 0)
    : 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">Nueva reserva</h2>
            <p className="text-slate-400 text-sm font-body mt-0.5">
              Paso {step} de 2 — {step === 1 ? 'Viaje y cliente' : 'Datos de pasajeros'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* ══════════ PASO 1 ══════════ */}
          {step === 1 && (
            <>
              {/* Viaje */}
              <div>
                <label className="text-xs font-semibold text-slate-500 font-body mb-1.5 block">
                  Viaje <span className="text-red-400">*</span>
                </label>
                <select value={tripId} onChange={e => setTripId(e.target.value)} className="input w-full">
                  <option value="">Seleccionar viaje...</option>
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title} — {new Date(t.departureDate).toLocaleDateString('es-CO')} ({t.availableSeats} cupos)
                    </option>
                  ))}
                </select>
              </div>

              {/* Info viaje */}
              {selectedTrip && (
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 grid grid-cols-2 gap-2 text-sm font-body">
                  {[
                    ['Destino',    selectedTrip.destination?.name],
                    ['Salida',     new Date(selectedTrip.departureDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })],
                    ['Duración',   `${selectedTrip.durationDays} días`],
                    ['Precio',     `$${selectedTrip.price.toLocaleString('es-CO')}`],
                    ['Cupos',      String(selectedTrip.availableSeats)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between col-span-1">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-semibold text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Búsqueda de cliente ── */}
              <div>
                <label className="text-xs font-semibold text-slate-500 font-body mb-1.5 block">
                  Cliente <span className="text-red-400">*</span>
                </label>

                {/* Cliente ya seleccionado */}
                {selectedClient ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                        {selectedClient.firstName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{selectedClient.firstName} {selectedClient.lastName}</p>
                        <p className="text-xs text-slate-400">{selectedClient.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedClient(null)}
                      className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <X size={12} /> Cambiar
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        value={clientQuery}
                        onChange={e => setClientQuery(e.target.value)}
                        placeholder="Buscar por nombre o email..."
                        className="input w-full pl-9"
                      />
                      {searchingClient && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>

                    {/* Resultados */}
                    {clientResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-card z-10 overflow-hidden">
                        {clientResults.map(u => (
                          <button
                            key={u.id}
                            onClick={() => selectClient(u)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sky-50 transition-colors text-left"
                          >
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
                        No se encontraron usuarios. Puedes crear uno en <span className="text-sky-500 font-semibold">Usuarios → Nuevo usuario</span>.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Solicitudes especiales */}
              <div>
                <label className="text-xs font-semibold text-slate-500 font-body mb-1.5 block">
                  Solicitudes especiales
                </label>
                <textarea
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  placeholder="Alergias, necesidades especiales, preferencias..."
                  className="input w-full resize-none"
                  rows={3}
                />
              </div>
            </>
          )}

          {/* ══════════ PASO 2: Pasajeros ══════════ */}
          {step === 2 && (
            <div className="space-y-5">
              {passengers.map((p, i) => (
                <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 font-body text-sm flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      Pasajero {i + 1}
                    </h3>
                    {passengers.length > 1 && (
                      <button onClick={() => removePassenger(i)} className="p-1 rounded-lg text-red-400 hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 font-body mb-1 block">Nombre <span className="text-red-400">*</span></label>
                      <input className="input w-full" value={p.firstName}
                        onChange={e => updatePassenger(i, 'firstName', e.target.value)} placeholder="Nombre" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-body mb-1 block">Apellido <span className="text-red-400">*</span></label>
                      <input className="input w-full" value={p.lastName}
                        onChange={e => updatePassenger(i, 'lastName', e.target.value)} placeholder="Apellido" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 font-body mb-1 block">Tipo documento</label>
                      <select className="input w-full" value={p.documentType}
                        onChange={e => updatePassenger(i, 'documentType', e.target.value)}>
                        <option value="CC">Cédula (CC)</option>
                        <option value="PASSPORT">Pasaporte</option>
                        <option value="CE">Cédula extranjería</option>
                        <option value="TI">Tarjeta identidad</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-body mb-1 block">N° documento <span className="text-red-400">*</span></label>
                      <input className="input w-full" value={p.documentNumber}
                        onChange={e => updatePassenger(i, 'documentNumber', e.target.value)} placeholder="12345678" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 font-body mb-1 block">Fecha nacimiento <span className="text-red-400">*</span></label>
                      <input type="date" className="input w-full" value={p.birthDate}
                        onChange={e => updatePassenger(i, 'birthDate', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-body mb-1 block">Tipo pasajero</label>
                      <select className="input w-full" value={p.type}
                        onChange={e => updatePassenger(i, 'type', e.target.value as PassengerType)}>
                        <option value="ADULT">Adulto</option>
                        <option value="CHILD">Niño</option>
                        <option value="INFANT">Infante</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 font-body mb-1 block">Teléfono</label>
                      <input className="input w-full" value={p.phone}
                        onChange={e => updatePassenger(i, 'phone', e.target.value)} placeholder="+57 300 000 0000" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-body mb-1 block">Email</label>
                      <input type="email" className="input w-full" value={p.email}
                        onChange={e => updatePassenger(i, 'email', e.target.value)} placeholder="correo@email.com" />
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={addPassenger}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-sky-300 hover:text-sky-500 transition-all text-sm font-body">
                <UserPlus size={15} /> Agregar pasajero
              </button>

              {/* Resumen */}
              {selectedTrip && selectedClient && (
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 font-body text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Cliente</span>
                    <span className="font-semibold text-slate-800">{selectedClient.firstName} {selectedClient.lastName}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Viaje</span>
                    <span className="font-semibold text-slate-800 max-w-[200px] text-right truncate">{selectedTrip.title}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{passengers.length} pasajero(s)</span>
                    <span className="font-bold text-sky-600 text-base">${totalAmount.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-100">
          <button onClick={step === 1 ? onClose : () => setStep(1)} className="btn-secondary">
            {step === 1 ? 'Cancelar' : '← Volver'}
          </button>
          {step === 1 ? (
            <button
              onClick={() => {
                if (!tripId)         { toast.error('Selecciona un viaje'); return }
                if (!selectedClient) { toast.error('Selecciona un cliente'); return }
                setStep(2)
              }}
              className="btn-primary"
            >
              Continuar →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} className="btn-primary">
              {saving ? 'Creando reserva...' : 'Confirmar reserva'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}