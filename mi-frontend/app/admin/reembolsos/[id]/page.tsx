'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Trash2, Upload, Download, FileText, CheckCircle, XCircle, Clock, Send, RefreshCw, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { refundsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Plane } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente', IN_REVIEW: 'En revisión',
  SENT: 'Enviado', REFUNDED: 'Reembolsado', REJECTED: 'Rechazado',
}
const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-200',
  IN_REVIEW: 'bg-blue-50 text-blue-700 border border-blue-200',
  SENT:      'bg-purple-50 text-purple-700 border border-purple-200',
  REFUNDED:  'bg-green-50 text-green-700 border border-green-200',
  REJECTED:  'bg-red-50 text-red-600 border border-red-200',
}
const STATUS_ICONS: Record<string, any> = {
  PENDING: Clock, IN_REVIEW: RefreshCw, SENT: Send,
  REFUNDED: CheckCircle, REJECTED: XCircle,
}
const FILE_TYPE_LABELS: Record<string, string> = {
  TICKET: 'Ticket', REEMBOLSO: 'Reembolso', PAGO_CLIENTE: 'Pago cliente',
  COMPROBANTE: 'Comprobante', CORREO: 'Correo', OTRO: 'Otro',
}

type Tab = 'info' | 'trayectos' | 'finanzas' | 'archivos' | 'historial'

export default function RefundDetailPage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [refund, setRefund]     = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<Tab>('info')
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fileType, setFileType] = useState('TICKET')

  // ── Formulario edición ──
  const [editForm, setEditForm] = useState<any>({})

  // ── Nuevo trayecto ──
  const [showSegForm, setShowSegForm] = useState(false)
  const [newSeg, setNewSeg] = useState({
    origin: '', destination: '', departureDate: '',
    ticketPrice: 0, refundOptionPrice: 0,
  })

  const load = async () => {
    setLoading(true)
    try {
      const data = await refundsApi.byId(id)
      setRefund(data)
      setEditForm({
        passengerName:  data.passengerName,
        pnr:            data.pnr,
        caseNumber:     data.caseNumber ?? '',
        airline:        data.airline,
        status:         data.status,
        customerPaid:   Number(data.customerPaid),
        refundReceived: Number(data.refundReceived),
        refundDate:     data.refundDate ? data.refundDate.slice(0, 10) : '',
        notes:          data.notes ?? '',
      })
    } catch { toast.error('Error cargando caso') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  // ── Cálculos ──
  const totalTickets  = refund?.segments?.reduce((acc: number, s: any) =>
    acc + Number(s.ticketPrice) + Number(s.refundOptionPrice), 0) ?? 0
  const moneyAgency   = totalTickets - Number(refund?.customerPaid ?? 0)
  const finalResult   = Number(refund?.refundReceived ?? 0) - moneyAgency

  // ── Guardar cambios ──
  const handleSave = async () => {
    setSaving(true)
    try {
      await refundsApi.update(id, {
        ...editForm,
        customerPaid:   Number(editForm.customerPaid),
        refundReceived: Number(editForm.refundReceived),
        refundDate:     editForm.refundDate || undefined,
      })
      toast.success('Guardado correctamente')
      load()
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  // ── Trayecto ──
  const handleAddSegment = async () => {
    if (!newSeg.origin || !newSeg.destination || !newSeg.departureDate) {
      toast.error('Completa todos los campos del trayecto'); return
    }
    try {
      await refundsApi.addSegment(id, { ...newSeg, ticketPrice: Number(newSeg.ticketPrice), refundOptionPrice: Number(newSeg.refundOptionPrice) })
      toast.success('Trayecto agregado')
      setShowSegForm(false)
      setNewSeg({ origin: '', destination: '', departureDate: '', ticketPrice: 0, refundOptionPrice: 0 })
      load()
    } catch (err: any) { toast.error(err.message) }
  }

  const handleRemoveSegment = async (segId: string) => {
    if (!confirm('¿Eliminar este trayecto?')) return
    try {
      await refundsApi.removeSegment(id, segId)
      toast.success('Trayecto eliminado')
      load()
    } catch (err: any) { toast.error(err.message) }
  }

  // ── Archivos ──
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await refundsApi.uploadFile(id, file, fileType)
      toast.success('Archivo subido')
      load()
    } catch { toast.error('Error subiendo archivo') }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const handleRemoveFile = async (fileId: string) => {
    if (!confirm('¿Eliminar este archivo?')) return
    try {
      await refundsApi.removeFile(id, fileId)
      toast.success('Archivo eliminado')
      load()
    } catch (err: any) { toast.error(err.message) }
  }

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}
    </div>
  )
  if (!refund) return <p className="text-slate-400 text-center py-20">Caso no encontrado</p>

  const StatusIcon = STATUS_ICONS[refund.status] ?? Clock

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 mt-1">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-3xl font-bold text-slate-900">{refund.passengerName}</h1>
            <span className={`badge text-xs flex items-center gap-1 ${STATUS_COLORS[refund.status]}`}>
              <StatusIcon size={11} /> {STATUS_LABELS[refund.status]}
            </span>
          </div>
          <p className="text-slate-400 font-body text-sm mt-1">
            PNR: <span className="font-mono font-semibold">{refund.pnr}</span>
            {refund.caseNumber && ` · Caso #${refund.caseNumber}`}
            {' · '}{refund.airline}
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Guardando...' : <><Save size={14} /> Guardar</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 flex-wrap">
        {([
          ['info', 'Información'],
          ['trayectos', 'Trayectos'],
          ['finanzas', 'Finanzas'],
          ['archivos', `Archivos (${refund.files?.length ?? 0})`],
          ['historial', 'Historial'],
        ] as [Tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold font-body transition-all min-w-[80px] ${
              tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB: Información ── */}
      {tab === 'info' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900">Información general</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 font-body mb-1 block">Nombre del pasajero</label>
              <input className="input w-full" value={editForm.passengerName}
                onChange={e => setEditForm((p: any) => ({ ...p, passengerName: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 font-body mb-1 block">PNR</label>
              <input className="input w-full font-mono" value={editForm.pnr}
                onChange={e => setEditForm((p: any) => ({ ...p, pnr: e.target.value.toUpperCase() }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 font-body mb-1 block">N° de caso</label>
              <input className="input w-full" value={editForm.caseNumber}
                onChange={e => setEditForm((p: any) => ({ ...p, caseNumber: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 font-body mb-1 block">Aerolínea</label>
              <input className="input w-full" value={editForm.airline}
                onChange={e => setEditForm((p: any) => ({ ...p, airline: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 font-body mb-1 block">Estado</label>
              <select className="input w-full" value={editForm.status}
                onChange={e => setEditForm((p: any) => ({ ...p, status: e.target.value }))}>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 font-body mb-1 block">Fecha de reembolso</label>
              <input type="date" className="input w-full" value={editForm.refundDate}
                onChange={e => setEditForm((p: any) => ({ ...p, refundDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 font-body mb-1 block">Pagó el cliente ($)</label>
              <input type="number" className="input w-full" value={editForm.customerPaid}
                onChange={e => setEditForm((p: any) => ({ ...p, customerPaid: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 font-body mb-1 block">Reembolso recibido ($)</label>
              <input type="number" className="input w-full" value={editForm.refundReceived}
                onChange={e => setEditForm((p: any) => ({ ...p, refundReceived: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 font-body mb-1 block">Observaciones</label>
              <textarea className="input w-full resize-none" rows={3} value={editForm.notes}
                onChange={e => setEditForm((p: any) => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Trayectos ── */}
      {tab === 'trayectos' && (
        <div className="space-y-4">
          {refund.segments?.map((s: any) => (
            <div key={s.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                    <Plane size={14} className="text-sky-600" />
                  </div>
                  <p className="font-bold text-slate-800 font-body">{s.origin} → {s.destination}</p>
                </div>
                <button onClick={() => handleRemoveSegment(s.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm font-body">
                {[
                  ['Salida', new Date(s.departureDate).toLocaleDateString('es-CO')],
                  ['Precio ticket', `$${Number(s.ticketPrice).toLocaleString('es-CO')}`],
                  ['Opción reembolsable', `$${Number(s.refundOptionPrice).toLocaleString('es-CO')}`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-slate-400 text-xs">{label}</p>
                    <p className="font-semibold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-body">Total trayecto</span>
                <span className="font-bold text-sky-600 font-body">
                  ${(Number(s.ticketPrice) + Number(s.refundOptionPrice)).toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          ))}

          {/* Agregar trayecto */}
          {showSegForm ? (
            <div className="card p-5 border-2 border-sky-200 space-y-3">
              <h3 className="font-semibold text-slate-800 font-body">Nuevo trayecto</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-body mb-1 block">Origen *</label>
                  <input className="input w-full" placeholder="BOG" value={newSeg.origin}
                    onChange={e => setNewSeg(p => ({ ...p, origin: e.target.value.toUpperCase() }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-body mb-1 block">Destino *</label>
                  <input className="input w-full" placeholder="MAD" value={newSeg.destination}
                    onChange={e => setNewSeg(p => ({ ...p, destination: e.target.value.toUpperCase() }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-body mb-1 block">Fecha salida *</label>
                  <input type="date" className="input w-full" value={newSeg.departureDate}
                    onChange={e => setNewSeg(p => ({ ...p, departureDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-body mb-1 block">Precio ticket ($)</label>
                  <input type="number" className="input w-full" value={newSeg.ticketPrice}
                    onChange={e => setNewSeg(p => ({ ...p, ticketPrice: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-body mb-1 block">Opción reembolsable ($)</label>
                  <input type="number" className="input w-full" value={newSeg.refundOptionPrice}
                    onChange={e => setNewSeg(p => ({ ...p, refundOptionPrice: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowSegForm(false)} className="btn-secondary text-sm">Cancelar</button>
                <button onClick={handleAddSegment} className="btn-primary text-sm">Agregar</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowSegForm(true)}
              className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-sky-300 hover:text-sky-500 hover:bg-sky-50/40 transition-all font-body text-sm flex items-center justify-center gap-2">
              <Plus size={15} /> Agregar trayecto
            </button>
          )}
        </div>
      )}

      {/* ── TAB: Finanzas ── */}
      {tab === 'finanzas' && (
        <div className="space-y-4">
          {/* Trayectos */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-slate-900 mb-4">Desglose de trayectos</h2>
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
                  <th className="pb-3 font-semibold">Ruta</th>
                  <th className="pb-3 font-semibold text-right">Ticket</th>
                  <th className="pb-3 font-semibold text-right">Reembolsable</th>
                  <th className="pb-3 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {refund.segments?.map((s: any) => (
                  <tr key={s.id}>
                    <td className="py-3 font-medium text-slate-800">{s.origin} → {s.destination}</td>
                    <td className="py-3 text-right text-slate-600">{formatCurrency(s.ticketPrice)}</td>
                    <td className="py-3 text-right text-slate-600">{formatCurrency(s.refundOptionPrice)}</td>
                    <td className="py-3 text-right font-semibold text-sky-600">
                      {formatCurrency(Number(s.ticketPrice) + Number(s.refundOptionPrice))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-slate-900 mb-4">Resumen financiero</h2>
            <div className="space-y-3 font-body text-sm">
              {[
                { label: 'Total tickets',       value: totalTickets,                    color: 'text-slate-800' },
                { label: 'Pagó el pasajero',    value: Number(refund.customerPaid),     color: 'text-slate-800' },
                { label: 'Puso la agencia',     value: moneyAgency,                     color: moneyAgency > 0 ? 'text-red-500' : 'text-green-600' },
                { label: 'Reembolso recibido',  value: Number(refund.refundReceived),   color: 'text-sky-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">{label}</span>
                  <span className={`font-semibold ${color}`}>{formatCurrency(value)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t-2 border-slate-200">
                <span className="font-bold text-slate-900">Resultado final</span>
                <span className={`font-bold text-lg ${finalResult >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {finalResult >= 0 ? '+' : ''}{formatCurrency(finalResult)}
                </span>
              </div>
            </div>

            {/* Semáforo */}
            <div className={`mt-4 p-3 rounded-xl flex items-center gap-3 ${
              finalResult > 0 ? 'bg-green-50 border border-green-200'
              : finalResult === 0 ? 'bg-amber-50 border border-amber-200'
              : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`w-4 h-4 rounded-full ${
                finalResult > 0 ? 'bg-green-500' : finalResult === 0 ? 'bg-amber-400' : 'bg-red-500'
              }`} />
              <p className={`text-sm font-semibold font-body ${
                finalResult > 0 ? 'text-green-700' : finalResult === 0 ? 'text-amber-700' : 'text-red-600'
              }`}>
                {finalResult > 0 ? '✓ Ganancia para la agencia'
                : finalResult === 0 ? '→ Sin ganancia ni pérdida'
                : '✗ Pérdida para la agencia'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Archivos ── */}
      {tab === 'archivos' && (
        <div className="space-y-4">
          {/* Upload */}
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold text-slate-900 mb-3">Subir archivo</h2>
            <div className="flex gap-3 flex-wrap">
              <select value={fileType} onChange={e => setFileType(e.target.value)} className="input max-w-[180px]">
                {Object.entries(FILE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleUpload} className="hidden" />
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="btn-primary flex items-center gap-2">
                <Upload size={15} /> {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
              </button>
            </div>
            <p className="text-xs text-slate-400 font-body mt-2">PDF, JPG, PNG, WEBP · Máx 10MB</p>
          </div>

          {/* Lista archivos */}
          {refund.files?.length === 0 ? (
            <p className="text-center text-slate-400 font-body py-10">No hay archivos adjuntos</p>
          ) : (
            <div className="space-y-2">
              {refund.files?.map((f: any) => (
                <div key={f.id} className="card p-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm font-body truncate">{f.fileName}</p>
                    <p className="text-xs text-slate-400 font-body">{FILE_TYPE_LABELS[f.fileType]} · {new Date(f.createdAt).toLocaleDateString('es-CO')}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a href={refundsApi.downloadFile(id, f.id)} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all">
                      <Download size={15} />
                    </a>
                    <button onClick={() => handleRemoveFile(f.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Historial ── */}
      {tab === 'historial' && (
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-slate-900 mb-4">Historial del caso</h2>
          {refund.history?.length === 0 ? (
            <p className="text-slate-400 font-body text-center py-8">Sin movimientos registrados</p>
          ) : (
            <div className="space-y-3">
              {refund.history?.map((h: any) => (
                <div key={h.id} className="flex gap-4 pb-3 border-b border-slate-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={13} className="text-sky-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 font-body">{h.action.replace(/_/g, ' ')}</p>
                    {h.description && <p className="text-xs text-slate-500 font-body mt-0.5">{h.description}</p>}
                    <p className="text-xs text-slate-400 font-body mt-1">
                      {new Date(h.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}