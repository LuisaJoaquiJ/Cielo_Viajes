'use client'
import { useEffect, useState } from 'react'
import { destinationsApi } from '@/lib/api'
import type { Destination } from '@/types'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Globe, MapPin } from 'lucide-react'
import DestinationFormModal from '@/components/admin/DestinationFormModal'

export default function AdminDestinosPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState<Destination | null>(null)
  const [showModal, setShowModal]       = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await destinationsApi.list({ limit: 100 })
      setDestinations(r.destinations)
    } catch { toast.error('Error cargando destinos') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este destino?')) return
    try {
      await destinationsApi.remove(id)
      toast.success('Destino eliminado')
      load()
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Destinos</h1>
          <p className="text-slate-500 font-body mt-1">{destinations.length} destinos registrados</p>
        </div>
        <button
          onClick={() => { setSelected(null); setShowModal(true) }}
          className="btn-primary"
        >
          <Plus size={16} /> Nuevo destino
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {destinations.map(d => (
            <div key={d.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group">
              <div className="relative h-40 overflow-hidden">
                <img
                  src={d.coverImage}
                  alt={d.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-semibold ${
                  d.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
                }`}>
                  {d.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold text-slate-900 text-lg">{d.name}</h3>
                <div className="flex items-center gap-1 text-slate-500 text-sm mt-1 font-body">
                  <MapPin size={13} />
                  <span>{d.city}, {d.country}</span>
                </div>
                <p className="text-slate-600 text-sm mt-2 font-body line-clamp-2">{d.description}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400 font-body flex items-center gap-1">
                    <Globe size={12} /> {d._count?.trips ?? 0} viajes
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelected(d); setShowModal(true) }}
                      className="p-2 rounded-lg hover:bg-sky-50 text-sky-600 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <DestinationFormModal
          destination={selected}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}