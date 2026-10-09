'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MapPin, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Trip } from '@/types'

export function ImmersiveTripCard({ trip, priority = false }: { trip: Trip; priority?: boolean }) {
  return (
    <Link
      href={`/viajes/${trip.slug}`}
      className="group relative block w-full h-[340px] rounded-[24px] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_64px_rgba(0,0,0,0.28)]"
    >
      {/* Imagen de fondo */}
      <Image
        src={trip.coverImage}
        alt={trip.title}
        fill
        priority={priority}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Overlay oscuro hacia abajo */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/80" />

      {/* Top: categoría + corazón */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
        <span className="text-[10px] font-medium text-white tracking-wide bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-3 py-1">
          {trip.destination?.country ?? 'Destacado'}
        </span>
        <button
          aria-label="Guardar en favoritos"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-colors"
          onClick={e => e.preventDefault()}
        >
          <Heart size={13} />
        </button>
      </div>

      {/* Rating flotante — mitad derecha */}
      <div className="absolute top-1/2 right-3.5 -translate-y-1/2 text-right z-10">
        <span className="font-display text-[42px] font-black text-white leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
          4.8
        </span>
        <span className="text-lg ml-0.5">⭐</span>
      </div>

      {/* Contenido inferior */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <h3 className="font-display text-[17px] font-bold text-white leading-snug tracking-tight mb-1 line-clamp-2">
          {trip.title}
        </h3>

        <span className="inline-block text-[11px] font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/25 rounded-full px-2.5 py-0.5 mb-2.5">
          {formatCurrency(trip.price)}
        </span>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="flex items-center gap-1 text-[10px] text-white/85 bg-white/15 border border-white/20 rounded-full px-2.5 py-1">
            <MapPin size={9} />
            {trip.destination?.name}, {trip.destination?.country}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-white/85 bg-white/15 border border-white/20 rounded-full px-2.5 py-1">
            <Clock size={9} />
            {trip.durationDays} días
          </span>
          <span className="text-[10px] text-white/85 bg-white/15 border border-white/20 rounded-full px-2.5 py-1">
            🛫 {trip.departureCity}
          </span>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <span className="flex-1 text-center text-[13px] font-semibold text-slate-900 bg-white rounded-full py-2.5 transition-colors group-hover:bg-sky-50">
            Ver viaje
          </span>
          <button
            aria-label="Ver en mapa"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 border border-white/30 text-white hover:bg-white/25 transition-colors flex-shrink-0"
            onClick={e => e.preventDefault()}
          >
            <MapPin size={15} />
          </button>
        </div>
      </div>
    </Link>
  )
}

export function ImmersiveTripCardSkeleton() {
  return (
    <div className="relative w-full h-[340px] rounded-[24px] overflow-hidden animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-900" />
      <div className="absolute top-3.5 left-3.5 h-6 w-20 rounded-full bg-white/20" />
      <div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/20" />
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <div className="h-4 bg-white/20 rounded-full w-4/5" />
        <div className="h-3 bg-white/15 rounded-full w-1/3" />
        <div className="flex gap-1.5 mt-2">
          <div className="h-5 bg-white/15 rounded-full w-24" />
          <div className="h-5 bg-white/15 rounded-full w-16" />
        </div>
        <div className="h-9 bg-white/30 rounded-full w-full mt-1" />
      </div>
    </div>
  )
}