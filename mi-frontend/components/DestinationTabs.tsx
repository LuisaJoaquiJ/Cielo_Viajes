'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Destination } from '@/types'

const categories = [
  { label: '🌊 Playa', filter: 'playa' },
  { label: '🏔️ Montaña', filter: 'montana' },
  { label: '🏙️ Ciudad', filter: 'ciudad' },
  { label: '🌿 Naturaleza', filter: 'naturaleza' },
]

export function DestinationTabs({ destinations }: { destinations: Destination[] }) {
  const [active, setActive] = useState<string | null>(null)

  // Si no hay categorías en los datos, muestra todos con tabs decorativos
  const filtered = active
    ? destinations.filter(d =>
        
        d.name?.toLowerCase().includes(active) ||
        d.country?.toLowerCase().includes(active)
      )
    : destinations

  const display = filtered.length > 0 ? filtered : destinations

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="section-tag mb-3">🌍 Destinos</span>
            <h2 className="section-title">
              Descubre <em className="text-gradient not-italic">Colombia</em>
            </h2>
          </div>

          {/* Tabs de categorías */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActive(null)}
              className={`px-4 py-2 rounded-xl text-sm font-bold font-body transition-all duration-200 ${
                active === null
                  ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              🗺️ Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat.filter}
                onClick={() => setActive(active === cat.filter ? null : cat.filter)}
                className={`px-4 py-2 rounded-xl text-sm font-bold font-body transition-all duration-200 ${
                  active === cat.filter
                    ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de destinos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {display.length > 0
            ? display.map((d: Destination) => (
              <Link
                key={d.id}
                href={`/destinos/${d.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-card hover:-translate-y-2 transition-all duration-300"
              >
                <Image
                  src={d.coverImage}
                  alt={d.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="trip-overlay" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-display font-bold text-lg leading-tight">{d.name}</p>
                  <p className="text-white/70 text-xs font-body">{d.country}</p>
                </div>
              </Link>
            ))
            : Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-sky-50 aspect-[3/4] animate-pulse" />
            ))
          }
        </div>

        <div className="text-center mt-10">
          <Link href="/destinos" className="btn-ghost">
            Ver todos los destinos →
          </Link>
        </div>
      </div>
    </section>
  )
}