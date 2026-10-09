import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, MapPin, Plane, Star } from 'lucide-react'
import { destinationsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { Destination, Review, Trip } from '@/types'

interface Props { params: Promise<{ slug: string }> }
type DestinationDetail = Destination & {
  trips?: Trip[]
  reviews?: Review[]
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  try {
    const dest = await destinationsApi.bySlug(slug)
    return { title: dest.name, description: dest.description.slice(0, 160) }
  } catch {
    return { title: 'Destino no encontrado' }
  }
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params
  let dest: DestinationDetail

  try {
    dest = await destinationsApi.bySlug(slug)
  } catch {
    notFound()
  }

  const mapQuery = `${dest.name}, ${dest.city}, ${dest.country}`
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=10&output=embed`

  return (
    <main className="public-dark-shell min-h-screen overflow-hidden">
      <section className="relative min-h-[560px] overflow-hidden">
        <Image src={dest.coverImage} alt={dest.name} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050711] via-[#050711]/55 to-[#050711]/10" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-14">
          <div className="mx-auto max-w-7xl">
            <div className="public-pill mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 font-body text-xs font-bold uppercase tracking-[0.18em]">
              <MapPin size={14} /> {dest.city}, {dest.country}
            </div>
            <h1 className="font-display text-6xl font-bold leading-none text-white md:text-8xl">{dest.name}</h1>
            <p className="mt-6 max-w-2xl font-body text-lg leading-8 text-slate-300">{dest.description}</p>
          </div>
        </div>
      </section>

      <section className="relative px-4 py-14 md:py-18">
        <div className="public-content-gradient absolute inset-0" />
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-8">
            <div className="public-glass-panel rounded-[30px] p-6 md:p-8">
              <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Sobre el destino</span>
              <h2 className="mt-3 font-display text-4xl font-bold text-white">Sobre {dest.name}</h2>
              <p className="mt-5 font-body text-lg leading-8 text-slate-300">{dest.description}</p>
            </div>

            <div className="public-glass-panel rounded-[30px] p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Rutas disponibles</span>
                  <h2 className="mt-3 font-display text-4xl font-bold text-white">Viajes a {dest.name}</h2>
                </div>
                <Plane className="hidden text-cyan-200 md:block" size={34} />
              </div>

              {dest.trips && dest.trips.length > 0 ? (
                <div className="space-y-4">
                  {dest.trips.map((trip) => (
                    <Link
                      key={trip.id}
                      href={`/viajes/${trip.slug}`}
                      className="group grid overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.055] transition hover:-translate-y-1 hover:border-cyan-300/35 md:grid-cols-[190px_1fr]"
                    >
                      <div className="relative h-44 md:h-full">
                        <Image src={trip.coverImage} alt={trip.title} fill className="object-cover transition duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050711]/70 to-transparent" />
                      </div>
                      <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                        <div>
                          <h3 className="font-display text-2xl font-bold text-white transition group-hover:text-cyan-100">{trip.title}</h3>
                          <div className="mt-3 flex flex-wrap gap-4 font-body text-sm text-slate-400">
                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-emerald-300" />{trip.durationDays} dias</span>
                            <span>{trip.capacity - trip.bookedSeats} cupos disponibles</span>
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="font-display text-3xl font-bold text-cyan-200">{formatCurrency(trip.price)}</p>
                          <p className="font-body text-xs text-slate-500">por persona</p>
                          <span className="mt-3 inline-flex items-center gap-1 font-body text-sm font-bold text-cyan-200 transition group-hover:gap-2">
                            Ver <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-5 font-body text-slate-400">
                  Aun no tenemos viajes publicados para este destino.
                </p>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            {typeof dest.latitude === 'number' && typeof dest.longitude === 'number' && (
              <div className="public-glass-panel overflow-hidden rounded-[30px] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Mapa</span>
                    <h3 className="mt-2 font-display text-2xl font-bold text-white">{dest.name}</h3>
                  </div>
                  <MapPin className="text-cyan-200" size={30} />
                </div>
                <div className="h-72 overflow-hidden rounded-[24px] border border-white/10 bg-[#06111e]">
                  <iframe
                    src={mapSrc}
                    title={`Mapa de ${dest.name}`}
                    className="h-full w-full opacity-90 contrast-125 saturate-[0.78] invert-[0.88] hue-rotate-180"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <p className="mt-4 font-body text-sm font-semibold text-slate-300">{dest.city}, {dest.country}</p>
                <p className="mt-1 font-body text-xs text-slate-500">{dest.latitude.toFixed(4)}, {dest.longitude.toFixed(4)}</p>
              </div>
            )}

            {dest.reviews && dest.reviews.length > 0 && (
              <div className="public-glass-panel rounded-[30px] p-6">
                <h3 className="font-display text-2xl font-bold text-white">Opiniones</h3>
                <div className="mt-5 space-y-4">
                  {dest.reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 font-body text-sm font-bold text-slate-950">
                          {review.user.firstName?.[0] ?? 'C'}
                        </div>
                        <div>
                          <p className="font-body text-sm font-bold text-white">{review.user.firstName} {review.user.lastName}</p>
                          <div className="flex">
                            {Array.from({ length: review.rating }).map((_, index) => (
                              <Star key={index} size={11} className="fill-amber-300 text-amber-300" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 font-body text-sm italic leading-6 text-slate-400">&quot;{review.comment}&quot;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}
