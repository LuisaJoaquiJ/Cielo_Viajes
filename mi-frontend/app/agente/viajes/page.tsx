'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Eye, Search, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { tripsApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Trip } from '@/types'
import { useRouter } from 'next/navigation'

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: 'bg-green-50 text-green-700 border border-green-200',
  DRAFT:     'bg-slate-50 text-slate-600 border border-slate-200',
  FULL:      'bg-orange-50 text-orange-700 border border-orange-200',
  CANCELLED: 'bg-red-50 text-red-600 border border-red-200',
  COMPLETED: 'bg-sky-50 text-sky-700 border border-sky-200',
}
const STATUS_LABELS: Record<string, string> = {
  PUBLISHED: 'Publicado', DRAFT: 'Borrador', FULL: 'Lleno',
  CANCELLED: 'Cancelado', COMPLETED: 'Completado',
}

export default function AgenteTripsPage() {
  const router = useRouter()
  const [trips, setTrips]     = useState<Trip[]>([])
  const [meta, setMeta]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)

  useEffect(() => {
    setLoading(true)
    tripsApi.adminList({ page, limit: 10, search: search || undefined })
      .then(data => { setTrips(data.trips); setMeta(data.meta) })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [page, search])

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-slate-900">Viajes</h1>
        <p className="text-slate-500 font-body mt-1">{meta?.total ?? 0} viajes disponibles</p>
      </div>

      {/* Búsqueda */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar viajes..." className="input pl-9" />
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-xs text-slate-400 uppercase tracking-wide">
                <th className="px-5 py-4 font-semibold">Viaje</th>
                <th className="px-5 py-4 font-semibold">Precio</th>
                <th className="px-5 py-4 font-semibold">Salida</th>
                <th className="px-5 py-4 font-semibold">Cupos</th>
                <th className="px-5 py-4 font-semibold">Estado</th>
                <th className="px-5 py-4 font-semibold">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-5 py-4">
                        <div className="h-10 bg-slate-50 rounded-lg animate-pulse" />
                      </td>
                    </tr>
                  ))
                : trips.map(trip => (
                    <tr
                      key={trip.id}
                      onClick={() => router.push(`/viajes/${trip.slug}`)}
                      className="hover:bg-sky-50/30 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                            <Image src={trip.coverImage} alt={trip.title} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 line-clamp-1">{trip.title}</p>
                            <p className="text-xs text-slate-400">{trip.destination?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-sky-600">{formatCurrency(trip.price)}</td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(trip.departureDate, 'dd MMM yyyy')}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Users size={13} className={trip.availableSeats === 0 ? 'text-red-400' : 'text-green-500'} />
                          <span className={`text-xs font-semibold ${trip.availableSeats === 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {trip.availableSeats}/{trip.capacity}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge text-xs ${STATUS_COLORS[trip.status]}`}>
                          {STATUS_LABELS[trip.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <a
                          href={`/viajes/${trip.slug}`}
                          target="_blank"
                          onClick={e => e.stopPropagation()}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all inline-flex"
                        >
                          <Eye size={15} />
                        </a>
                      </td>
                    </tr>
                  ))
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