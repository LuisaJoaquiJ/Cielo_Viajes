'use client'
import { useEffect, useState } from 'react'
import { leadsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Users, Phone, Mail, MapPin, Calendar } from 'lucide-react'

interface Lead {
  id:       string
  nombre:   string
  telefono: string
  email:    string
  destino:  string
  status:   string   // ✅ agregar
  createdAt: string
}

const STATUS_STYLES: Record<string, string> = {
  NUEVO:      'bg-sky-50 text-sky-700',
  CONTACTADO: 'bg-amber-50 text-amber-700',
  CERRADO:    'bg-emerald-50 text-emerald-700',
}

export default function AdminLeadsPage() {
  const [leads, setLeads]     = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<string>('')

  useEffect(() => {
    leadsApi.list({ limit: 100 })
      .then(r => setLeads(r.leads))
      .catch(() => toast.error('Error cargando leads'))
      .finally(() => setLoading(false))
  }, [])

  const handleStatus = async (id: string, status: string) => {
    try {
      await leadsApi.updateStatus(id, status)
      toast.success('Estado actualizado')
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  const filtered = filter ? leads.filter(l => l.status === filter) : leads

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500 font-body mt-1">{leads.length} personas interesadas</p>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 flex-wrap">
          {['', 'NUEVO', 'CONTACTADO', 'CERRADO'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === '' ? 'Todos' : s}
            </button>
          ))}
          <div className="flex items-center gap-2 bg-sky-50 text-sky-700 px-4 py-2 rounded-xl font-semibold text-sm ml-2">
            <Users size={16} />
            {filtered.length} leads
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-body">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>No hay leads registrados aún</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Contacto</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Destino</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(lead => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm font-display">
                        {lead.nombre.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800 font-body">{lead.nombre}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 font-body">
                        <Phone size={13} className="text-slate-400" />
                        <a href={`tel:${lead.telefono}`} className="hover:text-sky-600 transition-colors">
                          {lead.telefono}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 font-body">
                        <Mail size={13} className="text-slate-400" />
                        <a href={`mailto:${lead.email}`} className="hover:text-sky-600 transition-colors">
                          {lead.email}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm font-body">
                      <MapPin size={13} className="text-slate-400" />
                      <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {lead.destino || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 font-body">
                      <Calendar size={13} className="text-slate-400" />
                      {formatDate(lead.createdAt)}
                    </div>
                  </td>

                  {/* ✅ columna estado con selector */}
                  <td className="p-4">
                    <select
                      value={lead.status}
                      onChange={e => handleStatus(lead.id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1.5 rounded-lg border-0 cursor-pointer outline-none ${
                        STATUS_STYLES[lead.status] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <option value="NUEVO">NUEVO</option>
                      <option value="CONTACTADO">CONTACTADO</option>
                      <option value="CERRADO">CERRADO</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}