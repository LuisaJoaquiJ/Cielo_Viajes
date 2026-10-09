'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Compass, Mail, MapPin, Phone, Plane, Search, Send, UserRound } from 'lucide-react'
import type { Destination } from '@/types'

type LeadForm = {
  nombre: string
  telefono: string
  email: string
}

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3.5 font-body text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/55 focus:bg-slate-950/65 focus:ring-4 focus:ring-cyan-300/10'

export function DestinationExplorer({ destinations }: { destinations: Destination[] }) {
  const [query, setQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [selectedId, setSelectedId] = useState(destinations[0]?.id ?? '')
  const [form, setForm] = useState<LeadForm>({ nombre: '', telefono: '', email: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const filteredDestinations = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return destinations

    return destinations.filter((destination) => {
      const haystack = `${destination.name} ${destination.city} ${destination.country} ${destination.description}`.toLowerCase()
      return haystack.includes(value)
    })
  }, [destinations, query])

  const selectedDestination =
    destinations.find((destination) => destination.id === selectedId) ??
    filteredDestinations[0] ??
    destinations[0]

  const hasNoResults = query.trim().length > 0 && filteredDestinations.length === 0
  const handleSelectDestination = (id: string, scrollToMap = false) => {
    setSelectedId(id)
    if (scrollToMap) {
      window.requestAnimationFrame(() => {
        document.getElementById('destination-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSending(true)

    try {
      const response = await fetch('http://localhost:3001/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          telefono: form.telefono,
          email: form.email,
          destino: query.trim(),
        }),
      })

      if (!response.ok) throw new Error('Error enviando solicitud')
      setSent(true)
    } catch {
      alert('No pudimos enviar la solicitud. Intentalo de nuevo.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-10" data-destination-explorer>
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="public-glass-panel rounded-[30px] p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200">
              <Search size={22} />
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold text-white">Busca tu destino</h2>
              <p className="mt-1 font-body text-sm text-slate-400">Filtra por ciudad, pais o experiencia.</p>
            </div>
          </div>

          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault()
              setQuery(searchInputRef.current?.value ?? '')
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-100/55" size={18} />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onInput={(event) => setQuery(event.currentTarget.value)}
                placeholder="Ej: Medellin, playa, Caribe..."
                className={`${inputClass} pl-12`}
              />
            </div>
            <button type="submit" className="public-primary-button rounded-2xl px-6 py-3.5 font-body text-sm font-extrabold transition hover:-translate-y-0.5">
              Buscar
            </button>
          </form>

          {selectedDestination && !hasNoResults && (
            <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
              <p className="font-body text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Seleccionado</p>
              <h3 className="mt-2 font-display text-3xl font-bold text-white" data-selected-name>{selectedDestination.name}</h3>
              <p className="mt-2 flex items-center gap-2 font-body text-sm text-slate-400" data-selected-location>
                <MapPin size={15} className="text-cyan-200" />
                {selectedDestination.city}, {selectedDestination.country}
              </p>
              <p className="mt-3 line-clamp-3 font-body text-sm leading-7 text-slate-300" data-selected-description>{selectedDestination.description}</p>
              <Link
                href={`/destinos/${selectedDestination.slug}`}
                data-selected-link
                className="public-primary-button mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 font-body text-sm font-extrabold transition hover:-translate-y-0.5"
              >
                Ver destino <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {hasNoResults && (
            <DestinationRequest
              query={query}
              form={form}
              sent={sent}
              sending={sending}
              onFormChange={setForm}
              onSubmit={handleSubmit}
            />
          )}
        </div>

        <DestinationMap
          destinations={destinations}
          filteredDestinations={filteredDestinations}
          selectedId={selectedDestination?.id ?? ''}
          onSelect={(id) => handleSelectDestination(id)}
        />
      </div>

      {!hasNoResults && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredDestinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              selected={destination.id === selectedDestination?.id}
              onSelect={() => handleSelectDestination(destination.id, true)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DestinationMap({
  destinations,
  filteredDestinations,
  selectedId,
  onSelect,
}: {
  destinations: Destination[]
  filteredDestinations: Destination[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  const mappableDestinations = destinations.filter(hasCoordinates)

  if (mappableDestinations.length > 0) {
    return (
      <GoogleEmbedDestinationMap
        destinations={mappableDestinations}
        filteredDestinations={filteredDestinations.filter(hasCoordinates)}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    )
  }

  return (
    <VisualDestinationMap
      destinations={destinations}
      filteredDestinations={filteredDestinations}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  )
}

function GoogleEmbedDestinationMap({
  destinations,
  filteredDestinations,
  selectedId,
  onSelect,
}: {
  destinations: Array<Destination & { latitude: number; longitude: number }>
  filteredDestinations: Array<Destination & { latitude: number; longitude: number }>
  selectedId: string
  onSelect: (id: string) => void
}) {
  const selectedDestination = destinations.find((destination) => destination.id === selectedId) ?? filteredDestinations[0] ?? destinations[0]
  const embedQuery = `${selectedDestination.name}, ${selectedDestination.city}, ${selectedDestination.country}`
  const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(embedQuery)}&z=10&output=embed`

  return (
    <div id="destination-map" className="public-glass-panel relative min-h-[520px] overflow-hidden rounded-[30px] p-5 md:p-6">
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div>
          <p className="public-pill inline-flex rounded-full px-4 py-2 font-body text-xs font-bold uppercase tracking-[0.18em]">
            Google Maps
          </p>
          <h3 className="mt-4 font-display text-3xl font-bold text-white">{selectedDestination.name}</h3>
          <p className="mt-2 font-body text-sm text-slate-400">{selectedDestination.city}, {selectedDestination.country}</p>
        </div>
        <Compass className="text-cyan-200" size={34} />
      </div>

      <div className="relative z-10 mt-6 h-[355px] overflow-hidden rounded-[26px] border border-white/10 bg-[#06111e]">
        <iframe
          key={selectedDestination.id}
          src={embedSrc}
          title={`Mapa de ${selectedDestination.name}`}
          className="h-full w-full opacity-90 contrast-125 saturate-[0.78] invert-[0.88] hue-rotate-180"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-inset ring-cyan-200/10" />
      </div>

      <div className="relative z-10 mt-4 grid gap-2 sm:grid-cols-3">
        {destinations.map((destination) => {
          const active = destination.id === selectedDestination.id

          return (
            <button
              key={destination.id}
              type="button"
              onClick={() => onSelect(destination.id)}
              className={`rounded-2xl border px-4 py-3 text-left font-body text-sm font-bold transition ${
                active
                  ? 'border-cyan-300/50 bg-cyan-300/15 text-cyan-100'
                  : 'border-white/10 bg-slate-950/35 text-slate-300 hover:border-cyan-300/25 hover:bg-cyan-300/10'
              }`}
            >
              <span className="block">{destination.name}</span>
              <span className="mt-1 block text-xs font-medium text-slate-500">{destination.city}</span>
              <span className="mt-2 block text-xs font-black uppercase tracking-[0.14em] text-cyan-200">
                {active ? 'Mostrando' : 'Mostrar en mapa'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function VisualDestinationMap({
  destinations,
  filteredDestinations,
  selectedId,
  onSelect,
}: {
  destinations: Destination[]
  filteredDestinations: Destination[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  const visibleIds = new Set(filteredDestinations.map((destination) => destination.id))

  return (
    <div id="destination-map" className="public-glass-panel relative min-h-[420px] overflow-hidden rounded-[30px] p-5 md:p-6">
      <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(189,244,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-6 rounded-full border border-cyan-200/10" />
      <div className="absolute inset-12 rounded-full border border-cyan-200/10" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div>
          <p className="public-pill inline-flex rounded-full px-4 py-2 font-body text-xs font-bold uppercase tracking-[0.18em]">
            Mapa interactivo
          </p>
          <h3 className="mt-4 font-display text-3xl font-bold text-white">Selecciona un punto</h3>
        </div>
        <Compass className="text-cyan-200" size={34} />
      </div>

      <div className="relative z-10 mt-6 h-[315px] overflow-hidden rounded-[26px] border border-white/10 bg-[#06111e]">
        <svg viewBox="0 0 900 460" className="absolute inset-0 h-full w-full opacity-80" aria-hidden="true">
          <path d="M97 190C132 126 232 75 335 94c78 14 108 62 187 55 78-8 107-58 178-45 63 11 110 64 118 123 12 86-61 163-149 167-72 4-101-44-169-33-68 12-84 68-156 72-82 4-158-61-173-137-10-50 2-80-34-95-16-7-30-6-40-11Z" fill="rgba(0,229,255,.09)" />
          <path d="M197 249c26-31 70-39 105-18 42 25 39 73 83 82 38 8 57-25 92-14 39 12 57 68 38 106-24 47-103 49-170 23-78-31-168-113-148-179Z" fill="rgba(168,224,99,.11)" />
          <path d="M545 99c40-35 115-37 160 0 43 36 36 91 2 122-46 42-142 25-170-25-18-31-14-76 8-97Z" fill="rgba(255,122,92,.1)" />
          <path d="M119 308c112-42 198-48 283-31 92 19 145 68 257 50 60-9 102-34 140-61" fill="none" stroke="rgba(189,244,255,.16)" strokeWidth="2" strokeDasharray="8 12" />
          <path d="M86 150c114-42 221-51 334-24 124 30 207 99 393 60" fill="none" stroke="rgba(0,229,255,.16)" strokeWidth="2" strokeDasharray="6 14" />
        </svg>

        {destinations.map((destination, index) => {
          const position = getMarkerPosition(destination, index, destinations.length)
          const active = destination.id === selectedId
          const visible = visibleIds.has(destination.id)

          return (
            <button
              key={destination.id}
              type="button"
              onClick={() => onSelect(destination.id)}
              data-map-select
              data-destination-id={destination.id}
              data-name={destination.name}
              data-city={destination.city}
              data-country={destination.country}
              data-description={destination.description}
              data-slug={destination.slug}
              data-lat={destination.latitude}
              data-lng={destination.longitude}
              className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full transition duration-300 ${
                active ? 'scale-125' : visible ? 'scale-100 hover:scale-110' : 'scale-75 opacity-25'
              }`}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
              aria-label={`Seleccionar ${destination.name}`}
            >
              <span className={`block h-5 w-5 rounded-full border-2 ${active ? 'border-white bg-cyan-300 shadow-[0_0_28px_rgba(0,229,255,.8)]' : 'border-cyan-100/70 bg-cyan-400/70'}`} />
              {active && (
                <span className="absolute left-1/2 top-7 w-max -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/85 px-3 py-1.5 font-body text-xs font-bold text-white shadow-xl">
                  {destination.name}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DestinationRequest({
  query,
  form,
  sent,
  sending,
  onFormChange,
  onSubmit,
}: {
  query: string
  form: LeadForm
  sent: boolean
  sending: boolean
  onFormChange: (form: LeadForm) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  if (sent) {
    return (
      <div className="mt-6 rounded-[24px] border border-emerald-300/20 bg-emerald-300/10 p-5 text-center">
        <CheckCircle2 className="mx-auto text-emerald-300" size={38} />
        <h3 className="mt-3 font-display text-2xl font-bold text-white">Solicitud enviada</h3>
        <p className="mt-2 font-body text-sm leading-6 text-slate-300">Un asesor revisara ese destino y te contactara pronto.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 rounded-[24px] border border-cyan-200/12 bg-slate-950/35 p-5">
      <p className="font-body text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">No lo encontramos</p>
      <h3 className="mt-2 font-display text-2xl font-bold text-white">Solicita &quot;{query.trim()}&quot;</h3>
      <p className="mt-2 font-body text-sm leading-6 text-slate-400">Dejanos tus datos y buscamos una opcion a medida.</p>

      <div className="mt-5 grid gap-3">
        <label className="relative">
          <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-100/50" size={16} />
          <input required className={`${inputClass} pl-11`} placeholder="Nombre completo" value={form.nombre} onChange={(event) => onFormChange({ ...form, nombre: event.target.value })} />
        </label>
        <label className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-100/50" size={16} />
          <input required className={`${inputClass} pl-11`} placeholder="WhatsApp" value={form.telefono} onChange={(event) => onFormChange({ ...form, telefono: event.target.value })} />
        </label>
        <label className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-100/50" size={16} />
          <input required type="email" className={`${inputClass} pl-11`} placeholder="Correo" value={form.email} onChange={(event) => onFormChange({ ...form, email: event.target.value })} />
        </label>
      </div>

      <button disabled={sending} className="public-primary-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 font-body text-sm font-extrabold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
        {sending ? 'Enviando...' : 'Enviar solicitud'} <Send size={16} />
      </button>
    </form>
  )
}

function DestinationCard({
  destination,
  selected,
  onSelect,
}: {
  destination: Destination
  selected: boolean
  onSelect: () => void
}) {
  const tripCount = destination._count?.trips ?? 0

  return (
    <article className={`public-glass-card group relative overflow-hidden rounded-[30px] ${selected ? 'ring-2 ring-cyan-300/45' : ''}`}>
      <button
        type="button"
        onClick={onSelect}
        data-map-select
        data-destination-id={destination.id}
        data-name={destination.name}
        data-city={destination.city}
        data-country={destination.country}
        data-description={destination.description}
        data-slug={destination.slug}
        data-lat={destination.latitude ?? ''}
        data-lng={destination.longitude ?? ''}
        className={`absolute right-4 top-4 z-20 rounded-full border px-3 py-2 font-body text-xs font-bold backdrop-blur-md transition ${
          selected
            ? 'border-cyan-300/45 bg-cyan-300/20 text-cyan-100'
            : 'border-white/15 bg-black/45 text-white/90 hover:bg-cyan-400/20'
        }`}
      >
        {selected ? 'En el mapa' : 'Ver en mapa'}
      </button>
      <Link href={`/destinos/${destination.slug}`} className="block">
        <div className="relative h-72 overflow-hidden">
          <Image
            src={destination.coverImage}
            alt={destination.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040711] via-[#040711]/35 to-transparent" />
          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 font-body text-xs font-bold text-white/90 backdrop-blur-md">
            <MapPin size={13} /> {destination.country}
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h2 className="font-display text-4xl font-bold text-white">{destination.name}</h2>
            <p className="mt-1 flex items-center gap-1 font-body text-sm text-white/70">
              {destination.city}, {destination.country}
            </p>
          </div>
        </div>

        <div className="p-5">
          <p className="line-clamp-3 font-body text-sm leading-7 text-slate-300">{destination.description}</p>
          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-cyan-200">
              <Plane size={13} /> {tripCount} viaje{tripCount !== 1 ? 's' : ''} disponible{tripCount !== 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-1 font-body text-sm font-bold text-white transition group-hover:gap-2">
              Explorar <ArrowRight size={15} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

function getMarkerPosition(destination: Destination, index: number, total: number) {
  if (typeof destination.latitude === 'number' && typeof destination.longitude === 'number') {
    return {
      x: clamp(((destination.longitude + 180) / 360) * 100, 8, 92),
      y: clamp(((90 - destination.latitude) / 180) * 100, 10, 90),
    }
  }

  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2
  return {
    x: 50 + Math.cos(angle) * 28,
    y: 50 + Math.sin(angle) * 25,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function hasCoordinates(destination: Destination): destination is Destination & { latitude: number; longitude: number } {
  return typeof destination.latitude === 'number' && typeof destination.longitude === 'number'
}
