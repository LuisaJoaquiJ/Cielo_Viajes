'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, SlidersHorizontal, X, MapPin, Clock, Users, ArrowRight, Sparkles, Waves } from 'lucide-react'
import { tripsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { Trip, TripFilters } from '@/types'

type CatalogMeta = {
  total: number
  totalPages: number
}

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3.5 font-body text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/55 focus:bg-slate-950/65 focus:ring-4 focus:ring-cyan-300/10'

const labelClass = 'mb-2 block font-body text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/80'

export default function TripCatalog() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [meta, setMeta] = useState<CatalogMeta | null>(null)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<TripFilters>({ page: 1, limit: 9 })
  const [search, setSearch] = useState('')

  const fetchTrips = useCallback(async () => {
    let timeoutId: number | undefined
    setLoading(true)
    try {
      const timeout = new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error('Trips request timed out')), 5500)
      })
      const data = await Promise.race([
        tripsApi.list({ ...filters, search: search || undefined }),
        timeout,
      ])
      setTrips(data.trips)
      setMeta(data.meta)
    } catch {
      setTrips([])
      setMeta(null)
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId)
      setLoading(false)
    }
  }, [filters, search])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchTrips()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [fetchTrips])

  const updateFilter = (key: keyof TripFilters, value: string | number | undefined) => {
    setFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? Number(value) || 1 : 1 }) as TripFilters)
  }

  const clearFilters = () => {
    setFilters({ page: 1, limit: 9 })
    setSearch('')
  }

  const hasActiveFilters = Object.keys(filters).some((key) => key !== 'page' && key !== 'limit' && filters[key as keyof TripFilters])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 text-white md:py-16">
      <div className="public-glass-panel mb-8 rounded-[30px] p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-100/55" size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar viajes, destinos, ciudades..."
              className={`${inputClass} pl-11`}
            />
          </div>
          <button
            onClick={() => setShowFilters((visible) => !visible)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-950/45 px-5 py-3.5 font-body text-sm font-bold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-900/50"
          >
            <SlidersHorizontal size={17} />
            Filtros
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-300 text-xs text-slate-950">!</span>
            )}
          </button>
          <button
            onClick={clearFilters}
            className="public-soft-button inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-body text-sm font-bold transition hover:-translate-y-0.5"
          >
            <X size={15} /> Limpiar
          </button>
        </div>

        {showFilters && (
          <div className="mt-5 grid grid-cols-1 gap-4 border-t border-white/10 pt-5 md:grid-cols-4">
            <div>
              <label className={labelClass}>Ciudad salida</label>
              <input
                className={inputClass}
                placeholder="Bogota, Medellin..."
                value={filters.departureCity ?? ''}
                onChange={(event) => updateFilter('departureCity', event.target.value || undefined)}
              />
            </div>
            <div>
              <label className={labelClass}>Desde</label>
              <input
                type="date"
                className={inputClass}
                value={filters.departureDateFrom ?? ''}
                onChange={(event) => updateFilter('departureDateFrom', event.target.value || undefined)}
              />
            </div>
            <div>
              <label className={labelClass}>Precio minimo</label>
              <input
                type="number"
                className={inputClass}
                placeholder="0"
                value={filters.priceMin ?? ''}
                onChange={(event) => updateFilter('priceMin', event.target.value ? +event.target.value : undefined)}
              />
            </div>
            <div>
              <label className={labelClass}>Precio maximo</label>
              <input
                type="number"
                className={inputClass}
                placeholder="Sin limite"
                value={filters.priceMax ?? ''}
                onChange={(event) => updateFilter('priceMax', event.target.value ? +event.target.value : undefined)}
              />
            </div>
          </div>
        )}
      </div>

      {meta && (
        <p className="mb-6 font-body text-sm text-slate-400">
          {meta.total} viaje{meta.total !== 1 ? 's' : ''} encontrado{meta.total !== 1 ? 's' : ''}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="public-glass-panel h-96 animate-pulse rounded-[30px]" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="public-glass-panel mx-auto max-w-xl rounded-[30px] px-6 py-16 text-center">
          <Waves className="mx-auto mb-5 text-cyan-200" size={42} />
          <h3 className="font-display text-3xl font-bold text-white">No encontramos viajes</h3>
          <p className="mt-3 font-body text-slate-400">Intenta con otros filtros o busca otro destino.</p>
          <button
            onClick={clearFilters}
            className="public-primary-button mt-7 rounded-full px-7 py-3 font-body text-sm font-extrabold transition hover:-translate-y-0.5"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: meta.totalPages }).map((_, index) => {
                const page = index + 1
                return (
                  <button
                    key={page}
                    onClick={() => updateFilter('page', page)}
                    className={`h-11 w-11 rounded-2xl font-body text-sm font-bold transition ${
                      filters.page === page
                        ? 'bg-cyan-300 text-slate-950 shadow-[0_16px_40px_rgba(0,210,255,0.28)]'
                        : 'border border-white/10 bg-slate-950/45 text-slate-300 hover:bg-slate-950/65'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link
      href={`/viajes/${trip.slug}`}
      className="public-glass-card group relative block overflow-hidden rounded-[30px]"
    >
      <div className="relative h-60 overflow-hidden">
        <Image
          src={trip.coverImage}
          alt={trip.title}
          fill
          className="object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040711] via-[#040711]/35 to-transparent" />
        {trip.isFeatured && (
          <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1.5 font-body text-xs font-extrabold text-amber-950 shadow-[0_12px_35px_rgba(251,191,36,0.25)]">
            <Sparkles size={12} /> Destacado
          </div>
        )}
        <div className="absolute bottom-4 right-4 rounded-2xl border border-cyan-300/25 bg-slate-950/70 px-4 py-2 text-right shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <span className="block font-display text-xl font-bold leading-none text-cyan-200">{formatCurrency(trip.price)}</span>
          <span className="font-body text-[10px] uppercase tracking-[0.16em] text-slate-400">por persona</span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center gap-1.5 font-body text-xs text-slate-400">
          <MapPin size={12} className="text-cyan-200" />
          {trip.destination?.name}, {trip.destination?.country}
        </div>
        <h3 className="mb-4 line-clamp-2 font-display text-2xl font-bold leading-tight text-white transition group-hover:text-cyan-100">
          {trip.title}
        </h3>
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex gap-3 font-body text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-emerald-300" />
              {trip.durationDays}d
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} className="text-emerald-300" />
              {trip.availableSeats} cupos
            </span>
          </div>
          <span className="flex items-center gap-1 font-body text-sm font-bold text-cyan-200 transition-all group-hover:gap-2">
            Ver <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  )
}
