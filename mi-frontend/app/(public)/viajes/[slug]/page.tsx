import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Calendar, CheckCircle2, Clock, MapPin, Plane, Star, Users, XCircle } from 'lucide-react'
import { tripsApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import BookingWidget from '@/components/trips/BookingWidget'
import type { Trip } from '@/types'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  try {
    const trip = await tripsApi.bySlug(slug)
    return { title: trip.title, description: trip.description.slice(0, 160) }
  } catch {
    return { title: 'Viaje no encontrado' }
  }
}

export default async function TripDetailPage({ params }: Props) {
  const { slug } = await params
  let trip: Trip

  try {
    trip = await tripsApi.bySlug(slug)
  } catch {
    notFound()
  }

  return (
    <main className="public-dark-shell min-h-screen overflow-hidden">
      <section className="relative min-h-[640px] overflow-hidden pt-28">
        <Image src={trip.coverImage} alt={trip.title} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050711] via-[#050711]/64 to-[#050711]/15" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-14">
          <div className="mx-auto max-w-7xl">
            <div className="public-pill mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 font-body text-xs font-bold uppercase tracking-[0.18em]">
              <MapPin size={14} />
              {trip.destination?.name}, {trip.destination?.country}
            </div>
            <h1 className="max-w-5xl font-display text-5xl font-bold leading-[0.98] text-white md:text-7xl">
              {trip.title}
            </h1>
            <div className="mt-7 flex flex-wrap gap-4 font-body text-sm font-semibold text-slate-300">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/35 px-4 py-2">
                <Clock size={14} className="text-cyan-200" /> {trip.durationDays} días
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/35 px-4 py-2">
                <Calendar size={14} className="text-cyan-200" /> {formatDate(trip.departureDate)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/35 px-4 py-2">
                <Users size={14} className="text-emerald-300" /> {trip.availableSeats} cupos disponibles
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/35 px-4 py-2">
                <Plane size={14} className="text-emerald-300" /> Salida: {trip.departureCity}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 py-14 md:py-18">
        <div className="public-content-gradient absolute inset-0" />
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-8">
            <section className="public-glass-panel rounded-[30px] p-6 md:p-8">
              <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Resumen</span>
              <h2 className="mt-3 font-display text-4xl font-bold text-white">Acerca del viaje</h2>
              <p className="mt-5 font-body text-lg leading-8 text-slate-300">{trip.description}</p>
            </section>

            {trip.highlights?.length > 0 && (
              <section className="public-glass-panel rounded-[30px] p-6 md:p-8">
                <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Experiencias</span>
                <h2 className="mt-3 font-display text-4xl font-bold text-white">Lo mejor del viaje</h2>
                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {trip.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                      <Star size={17} className="mt-0.5 shrink-0 fill-amber-300 text-amber-300" />
                      <span className="font-body text-sm leading-6 text-slate-300">{highlight}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="public-glass-panel rounded-[30px] p-6 md:p-8">
              <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Detalles</span>
              <h2 className="mt-3 font-display text-4xl font-bold text-white">Qué incluye</h2>
              <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-[24px] border border-emerald-300/15 bg-emerald-300/5 p-5">
                  <h3 className="mb-4 flex items-center gap-2 font-body text-sm font-bold uppercase tracking-[0.14em] text-emerald-300">
                    <CheckCircle2 size={17} /> Incluye
                  </h3>
                  <ul className="space-y-3">
                    {trip.includes?.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 font-body text-sm leading-6 text-slate-300">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-300" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[24px] border border-rose-300/15 bg-rose-300/5 p-5">
                  <h3 className="mb-4 flex items-center gap-2 font-body text-sm font-bold uppercase tracking-[0.14em] text-rose-300">
                    <XCircle size={17} /> No incluye
                  </h3>
                  <ul className="space-y-3">
                    {trip.excludes?.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 font-body text-sm leading-6 text-slate-400">
                        <XCircle size={15} className="mt-0.5 shrink-0 text-rose-300" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {trip.itinerary && trip.itinerary.length > 0 && (
              <section className="public-glass-panel rounded-[30px] p-6 md:p-8">
                <span className="font-body text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Plan de viaje</span>
                <h2 className="mt-3 font-display text-4xl font-bold text-white">Itinerario día a día</h2>
                <div className="mt-8 space-y-0">
                  {trip.itinerary.map((item, index) => (
                    <div key={item.id} className="flex gap-5">
                      <div className="flex flex-col items-center">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 font-body text-sm font-black text-slate-950">
                          {item.day}
                        </div>
                        {index < trip.itinerary!.length - 1 && (
                          <div className="my-2 w-px flex-1 bg-cyan-200/12" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <h3 className="font-display text-2xl font-bold text-white">{item.title}</h3>
                        <p className="mt-2 font-body text-sm leading-7 text-slate-400">{item.description}</p>
                        {item.activities?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {item.activities.map((activity, activityIndex) => (
                              <span key={activityIndex} className="rounded-full border border-cyan-300/15 bg-cyan-300/8 px-3 py-1 font-body text-xs font-semibold text-cyan-100">
                                {activity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingWidget trip={trip} />
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
