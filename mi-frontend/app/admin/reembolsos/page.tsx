'use client'
import { useState, useEffect } from 'react'
import { Plus, Search, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, DollarSign, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { refundsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_LABELS: Record<string, string> = {
  PENDING:   'Pendiente',
  IN_REVIEW: 'En revisión',
  SENT:      'Enviado',
  REFUNDED:  'Reembolsado',
  REJECTED:  'Rechazado',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-200',
  IN_REVIEW: 'bg-blue-50 text-blue-700 border border-blue-200',
  SENT:      'bg-purple-50 text-purple-700 border border-purple-200',
  REFUNDED:  'bg-green-50 text-green-700 border border-green-200',
  REJECTED:  'bg-red-50 text-red-600 border border-red-200',
}

export default function ReembolsosPage() {
  const [refunds, setRefunds]       = useState<any[]>([])
  const [meta, setMeta]             = useState<any>(null)
  const [stats, setStats]           = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]             = useState(1)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [refundsData, statsData] = await Promise.all([
        refundsApi.list({ page, limit: 15, search: search || undefined, status: statusFilter || undefined }),
        refundsApi.stats(),
      ])
      setRefunds(refundsData.refunds)
      setMeta(refundsData.meta)
      setStats(statsData)
    } catch { toast.error('Error cargando datos') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [page, search, statusFilter])

  const calcTotals = (refund: any) => {
    const totalTickets = refund.segments?.reduce((acc: number, s: any) =>
      acc + Number(s.ticketPrice) + Number(s.refundOptionPrice), 0) ?? 0
    const moneyAgency  = totalTickets - Number(refund.customerPaid)
    const result       = Number(refund.refundReceived) - moneyAgency
    return { totalTickets, moneyAgency, result }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-slate-900">Reembolsos</h1>
          <p className="text-slate-500 font-body mt-1">Gestión de casos de reembolso</p>
        </div>
        <Link href="/admin/reembolsos/nuevo" className="btn-primary">
          <Plus size={16} /> Nuevo caso
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total casos',     value: stats.totalCases,                      icon: DollarSign,   color: 'from-slate-500 to-slate-600'   },
            { label: 'Pendientes',      value: stats.pending,                          icon: Clock,        color: 'from-amber-500 to-amber-600'   },
            { label: 'Reembolsados',    value: stats.refunded,                         icon: CheckCircle,  color: 'from-green-500 to-green-600'   },
            { label: 'Rechazados',      value: stats.rejected,                         icon: XCircle,      color: 'from-red-500 to-red-600'       },
            { label: 'Total recibido',  value: formatCurrency(stats.totalRefunded),    icon: TrendingUp,   color: 'from-sky-500 to-sky-600'       },
            { label: 'Resultado total', value: formatCurrency(stats.totalResult),      icon: stats.totalResult >= 0 ? TrendingUp : TrendingDown,
              color: stats.totalResult >= 0 ? 'from-teal-500 to-teal-600' : 'from-rose-500 to-rose-600' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <s.icon size={16} className="text-white" />
              </div>
              <p className="font-display text-2xl font-bold text-slate-900">{loading ? '—' : s.value}</p>
              <p className="text-slate-400 text-xs font-body mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="card p-4 mb-6 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por pasajero, PNR o caso..." className="input pl-9 w-full" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="input max-w-[180px]">
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-xs text-slate-400 uppercase tracking-wide">
                <th className="px-5 py-4 font-semibold">Pasajero</th>
                <th className="px-5 py-4 font-semibold">PNR</th>
                <th className="px-5 py-4 font-semibold">Aerolínea</th>
                <th className="px-5 py-4 font-semibold">Trayectos</th>
                <th className="px-5 py-4 font-semibold">Pagó cliente</th>
                <th className="px-5 py-4 font-semibold">Reembolso</th>
                <th className="px-5 py-4 font-semibold">Resultado</th>
                <th className="px-5 py-4 font-semibold">Estado</th>
                <th className="px-5 py-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={9} className="px-5 py-4">
                      <div className="h-10 bg-slate-50 rounded-lg animate-pulse" />
                    </td></tr>
                  ))
                : refunds.length === 0
                ? <tr><td colSpan={9} className="px-5 py-16 text-center text-slate-400 font-body">No hay casos registrados</td></tr>
                : refunds.map(r => {
                    const { result } = calcTotals(r)
                    return (
                      <tr key={r.id} className="hover:bg-sky-50/30 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">{r.passengerName}</p>
                          {r.caseNumber && <p className="text-xs text-slate-400">Caso #{r.caseNumber}</p>}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-600">{r.pnr}</td>
                        <td className="px-5 py-4 text-slate-600">{r.airline}</td>
                        <td className="px-5 py-4 text-center font-semibold text-slate-600">{r.segments?.length ?? 0}</td>
                        <td className="px-5 py-4 font-semibold text-slate-700">{formatCurrency(r.customerPaid)}</td>
                        <td className="px-5 py-4 font-semibold text-sky-600">{formatCurrency(r.refundReceived)}</td>
                        <td className="px-5 py-4">
                          <span className={`font-bold text-sm ${result >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {result >= 0 ? '+' : ''}{formatCurrency(result)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`badge text-xs ${STATUS_COLORS[r.status]}`}>
                            {STATUS_LABELS[r.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Link href={`/admin/reembolsos/${r.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all inline-flex">
                            <ArrowRight size={15} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })
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
    </div>
  )
}