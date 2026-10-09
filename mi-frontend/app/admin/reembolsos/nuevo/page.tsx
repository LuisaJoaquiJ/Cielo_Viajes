'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ChevronLeft, Plane, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { refundsApi } from '@/lib/api'

interface Segment {
  origin: string; destination: string; departureDate: string
  ticketPrice: number; refundOptionPrice: number
}

const EMPTY_SEGMENT = (): Segment => ({
  origin: '', destination: '', departureDate: '',
  ticketPrice: 0, refundOptionPrice: 0,
})

export default function NuevoReembolsoPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    passengerName: '', pnr: '', caseNumber: '',
    airline: '', customerPaid: 0, notes: '',
  })
  const [segments, setSegments] = useState<Segment[]>([EMPTY_SEGMENT()])

  const updateForm = (field: string, value: any) =>
    setForm(p => ({ ...p, [field]: value }))

  const updateSegment = (idx: number, field: keyof Segment, value: any) =>
    setSegments(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))

  const addSegment    = () => setSegments(p => [...p, EMPTY_SEGMENT()])
  const removeSegment = (idx: number) => {
    if (segments.length === 1) return
    setSegments(p => p.filter((_, i) => i !== idx))
  }

  const totalTickets  = segments.reduce((acc, s) => acc + Number(s.ticketPrice) + Number(s.refundOptionPrice), 0)
  const moneyAgency   = totalTickets - Number(form.customerPaid)

  const handleSubmit = async () => {
    if (!form.passengerName || !form.pnr || !form.airline) {
      toast.error('Nombre, PNR y aerolínea son requeridos'); return
    }
    const invalidSeg = segments.some(s => !s.origin || !s.destination || !s.departureDate)
    if (invalidSeg) { toast.error('Completa todos los trayectos'); return }

    setSaving(true)
    try {
      const refund = await refundsApi.create({
        ...form,
        customerPaid: Number(form.customerPaid),
        segments: segments.map(s => ({ ...s, ticketPrice: Number(s.ticketPrice), refundOptionPrice: Number(s.refundOptionPrice) })),
      })
      toast.success('Caso creado exitosamente')
      router.push(`/admin/reembolsos/${refund.id}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-4xl font-bold text-slate-900">Nuevo caso</h1>
          <p className="text-slate-500 font-body mt-1">Registra un caso de reembolso</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* Info general */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-slate-900 mb-4">Información general</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 font-body mb-1 block">Nombre completo del pasajero *</label>
              <input className="input w-full" placeholder="Juan Pérez"
                value={form.passengerName} onChange={e => updateForm('passengerName', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 font-body mb-1 block">PNR *</label>
              <input className="input w-full" placeholder="ABC123"
                value={form.pnr} onChange={e => updateForm('pnr', e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 font-body mb-1 block">N° de caso</label>
              <input className="input w-full" placeholder="Opcional"
                value={form.caseNumber} onChange={e => updateForm('caseNumber', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 font-body mb-1 block">Aerolínea *</label>
              <input className="input w-full" placeholder="Avianca, Latam..."
                value={form.airline} onChange={e => updateForm('airline', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 font-body mb-1 block">Pagó el cliente ($)</label>
              <input type="number" className="input w-full" placeholder="0"
                value={form.customerPaid} onChange={e => updateForm('customerPaid', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 font-body mb-1 block">Observaciones</label>
              <textarea className="input w-full resize-none" rows={3} placeholder="Notas internas..."
                value={form.notes} onChange={e => updateForm('notes', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Trayectos */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-slate-900">Trayectos</h2>
            <button onClick={addSegment}
              className="flex items-center gap-2 text-xs text-sky-600 hover:text-sky-700 font-semibold font-body px-3 py-1.5 rounded-lg hover:bg-sky-50 transition-all">
              <Plus size={13} /> Agregar trayecto
            </button>
          </div>

          <div className="space-y-4">
            {segments.map((s, idx) => (
              <div key={idx} className="border border-slate-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 font-body">
                      {s.origin && s.destination ? `${s.origin} → ${s.destination}` : `Trayecto ${idx + 1}`}
                    </span>
                  </div>
                  {segments.length > 1 && (
                    <button onClick={() => removeSegment(idx)} className="p-1 rounded-lg text-red-400 hover:bg-red-50">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-body mb-1 block">Origen *</label>
                    <input className="input w-full" placeholder="BOG" value={s.origin}
                      onChange={e => updateSegment(idx, 'origin', e.target.value.toUpperCase())} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-body mb-1 block">Destino *</label>
                    <input className="input w-full" placeholder="MAD" value={s.destination}
                      onChange={e => updateSegment(idx, 'destination', e.target.value.toUpperCase())} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-body mb-1 block">Fecha de salida *</label>
                    <input type="date" className="input w-full" value={s.departureDate}
                      onChange={e => updateSegment(idx, 'departureDate', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-body mb-1 block">Precio ticket ($)</label>
                    <input type="number" className="input w-full" placeholder="0" value={s.ticketPrice}
                      onChange={e => updateSegment(idx, 'ticketPrice', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-body mb-1 block">Opción reembolsable ($)</label>
                    <input type="number" className="input w-full" placeholder="0" value={s.refundOptionPrice}
                      onChange={e => updateSegment(idx, 'refundOptionPrice', e.target.value)} />
                  </div>
                  <div className="flex items-end">
                    <div className="w-full bg-sky-50 border border-sky-100 rounded-xl p-3">
                      <p className="text-xs text-slate-400 font-body">Total trayecto</p>
                      <p className="font-bold text-sky-600 font-body">
                        ${(Number(s.ticketPrice) + Number(s.refundOptionPrice)).toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen financiero */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-slate-900 mb-4">Resumen financiero</h2>
          <div className="space-y-2 font-body text-sm">
            {[
              ['Total tickets',      `$${totalTickets.toLocaleString('es-CO')}`,              'text-slate-800'],
              ['Pagó el pasajero',   `$${Number(form.customerPaid).toLocaleString('es-CO')}`,  'text-slate-800'],
              ['Puso la agencia',    `$${moneyAgency.toLocaleString('es-CO')}`,                moneyAgency > 0 ? 'text-red-500' : 'text-green-600'],
            ].map(([label, value, color]) => (
              <div key={label} className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">{label}</span>
                <span className={`font-semibold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between pb-8">
          <button onClick={() => router.back()} className="btn-secondary">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary">
            {saving ? 'Guardando...' : <><Save size={15} /> Crear caso</>}
          </button>
        </div>
      </div>
    </div>
  )
}