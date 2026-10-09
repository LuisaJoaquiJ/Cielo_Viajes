'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  Award,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import { ContactLeadForm } from '@/components/ContactLeadForm'
import { LegalSection } from '@/components/LegalSection'
import { formatCurrency } from '@/lib/utils'
import type { Trip } from '@/types'

type DestinationCardData = {
  title: string
  location: string
  tag: string
  days: string
  price: string
  rating: string
  image: string
  href: string
  description: string
  seats: string
}

const fallbackExperienceCards: DestinationCardData[] = [
  {
    title: 'Cartagena Sunset Escape',
    location: 'Cartagena, Colombia',
    tag: 'Playas y ciudad amurallada',
    days: '4 dias',
    price: '$ 1.290.000',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1583997052301-0042b33fc598?auto=format&fit=crop&w=900&q=80',
    href: '/viajes',
    description: 'Una escapada disenada para descansar, descubrir y volver con historias nuevas.',
    seats: 'Plan completo',
  },
  {
    title: 'San Andres Blue Week',
    location: 'San Andres, Colombia',
    tag: 'Mar de siete colores',
    days: '5 dias',
    price: '$ 1.780.000',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    href: '/viajes',
    description: 'Una escapada disenada para descansar, descubrir y volver con historias nuevas.',
    seats: 'Plan completo',
  },
  {
    title: 'Eje Cafetero Premium',
    location: 'Quindio, Colombia',
    tag: 'Naturaleza y cafe',
    days: '3 dias',
    price: '$ 890.000',
    rating: '4.7',
    image: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&w=900&q=80',
    href: '/viajes',
    description: 'Una escapada disenada para descansar, descubrir y volver con historias nuevas.',
    seats: 'Plan completo',
  },
  {
    title: 'Santa Marta Tayrona',
    location: 'Magdalena, Colombia',
    tag: 'Selva, playa y descanso',
    days: '4 dias',
    price: '$ 1.150.000',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1541410965313-d53b3c16ef17?auto=format&fit=crop&w=900&q=80',
    href: '/viajes',
    description: 'Una escapada disenada para descansar, descubrir y volver con historias nuevas.',
    seats: 'Plan completo',
  },
]

const supportSteps = [
  {
    number: '01',
    title: 'Requisitos claros',
    text: 'Te contamos documentos, politicas y detalles importantes antes de reservar.',
    color: 'bg-blue-600',
  },
  {
    number: '02',
    title: 'Reserva acompanada',
    text: 'Un asesor revisa fechas, cupos y forma de pago para evitar sorpresas.',
    color: 'bg-orange-500',
  },
  {
    number: '03',
    title: 'Soporte en viaje',
    text: 'Estamos pendientes de ti durante la experiencia y al regresar.',
    color: 'bg-amber-400',
  },
]

const featureCards = [
  { icon: CalendarCheck, title: 'Reserva y relajate', text: 'Organizamos fechas, cupos y plan para que viajes tranquilo.' },
  { icon: ShieldCheck, title: 'Checklist seguro', text: 'Validamos datos clave antes de confirmar tu aventura.' },
  { icon: Award, title: 'Ahorra mas', text: 'Buscamos opciones con buen precio y experiencia completa.' },
]

export function HomeSectionsCarousel({ trips }: { trips: Trip[] }) {
  const experienceCards = trips.length > 0
    ? trips.slice(0, 4).map(tripToCard)
    : fallbackExperienceCards
  const [active, setActive] = useState(0)

  function move(direction: 'prev' | 'next') {
    setActive(current => {
      if (direction === 'next') return (current + 1) % experienceCards.length
      return (current - 1 + experienceCards.length) % experienceCards.length
    })
  }

  return (
    <section id="nosotros" className="relative overflow-hidden bg-[#eef3f2] py-16 text-slate-950 md:py-20">
      <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-sky-200/60 blur-3xl" />
      <div className="absolute bottom-16 right-0 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.45em] text-slate-500">Travel support</p>
          <h2 className="font-display text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
            Planifica tu viaje con confianza
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
            Disenamos experiencias claras, visuales y faciles de reservar para que sepas que esperar en cada paso.
          </p>
        </div>

        <div className="grid items-center gap-10 rounded-[2rem] bg-white px-5 py-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)] md:px-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            {supportSteps.map(step => (
              <div key={step.number} className="flex gap-4">
                <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${step.color} text-xs font-black text-white shadow-lg`}>
                  {step.number}
                </div>
                <div>
                  <h3 className="font-display text-lg font-black">{step.title}</h3>
                  <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{step.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative min-h-[320px]">
            <div className="absolute left-[7%] top-10 h-56 w-44 overflow-hidden rounded-full shadow-2xl md:h-72 md:w-56">
              <Image
                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=700&q=80"
                alt="Ala de avion sobre el cielo"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute left-[35%] top-0 h-44 w-44 overflow-hidden rounded-full shadow-2xl md:h-60 md:w-60">
              <Image
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80"
                alt="Paisaje de viaje"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-[8%] h-44 w-44 overflow-hidden rounded-full shadow-2xl md:h-56 md:w-56">
              <Image
                src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=80"
                alt="Destino natural"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute right-[12%] top-8 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl">
              <Plane size={26} />
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-slate-500">Destinos destacados</p>
            <h2 className="font-display text-3xl font-black leading-tight tracking-tight md:text-5xl">
              Experiencias que se sienten inolvidables
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => move('prev')}
              aria-label="Destino anterior"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-950 hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => move('next')}
              aria-label="Destino siguiente"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-950 hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {experienceCards.map((card, index) => (
            <DestinationCard key={card.title} card={card} featured={index === active} />
          ))}
        </div>

        <div className="mt-16 rounded-[2rem] bg-white px-5 py-8 shadow-[0_25px_80px_rgba(15,23,42,0.07)] md:px-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <h2 className="max-w-xl font-display text-3xl font-black leading-tight md:text-4xl">
              Viaja para crear recuerdos alrededor del mundo
            </h2>
            <button className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-black transition hover:border-slate-950 hover:bg-slate-950 hover:text-white">
              Ver todo <ArrowRight size={16} />
            </button>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-full bg-[#f4f7f6] px-7 py-10 text-center shadow-inner">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl">
                  <Icon size={24} />
                </div>
                <h3 className="font-display text-lg font-black">{title}</h3>
                <p className="mx-auto mt-3 max-w-[13rem] text-xs leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] md:p-8">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-sky-300">Legal</p>
            <h2 className="font-display text-3xl font-black leading-tight">Transparencia antes de reservar</h2>
            <p className="mb-6 mt-3 text-sm leading-7 text-slate-400">
              Revisa condiciones, privacidad y reembolsos sin perder el ritmo de la pagina.
            </p>
            <LegalSection />
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)] md:p-8">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-blue-600">Contacto</p>
            <h2 className="font-display text-3xl font-black leading-tight">Hablemos de tu proximo viaje</h2>
            <p className="mb-6 mt-3 text-sm leading-7 text-slate-500">
              Dejanos tus datos y un asesor te contactara en menos de 24 horas.
            </p>
            <ContactLeadForm />
          </div>
        </div>
      </div>
    </section>
  )
}

function tripToCard(trip: Trip): DestinationCardData {
  const destination = trip.destination
  const reviewRatings = trip.reviews?.filter(review => review.isPublished).map(review => review.rating) ?? []
  const averageRating = reviewRatings.length > 0
    ? reviewRatings.reduce((total, rating) => total + rating, 0) / reviewRatings.length
    : 4.8

  return {
    title: trip.title,
    location: [destination?.city || destination?.name, destination?.country].filter(Boolean).join(', '),
    tag: trip.highlights?.[0] || destination?.name || 'Destino destacado',
    days: `${trip.durationDays} dias`,
    price: formatCurrency(trip.price),
    rating: averageRating.toFixed(1),
    image: trip.coverImage || destination?.coverImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80',
    href: `/viajes/${trip.slug}`,
    description: trip.description || 'Una escapada disenada para descansar, descubrir y volver con historias nuevas.',
    seats: `${trip.availableSeats} cupos`,
  }
}

function DestinationCard({
  card,
  featured,
}: {
  card: DestinationCardData
  featured: boolean
}) {
  return (
    <article className={`group relative min-h-[500px] overflow-hidden rounded-[2rem] shadow-[0_35px_80px_rgba(15,23,42,0.2)] transition duration-500 ${
      featured ? 'lg:-mt-8 lg:min-h-[560px]' : 'lg:mt-10'
    }`}>
      <Image src={card.image} alt={card.title} fill className="object-cover transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/85" />
      <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
        <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">
          {card.tag}
        </span>
        <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-md transition hover:bg-white hover:text-rose-500">
          <Heart size={20} />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-6">
        <div className="mb-4 flex items-end justify-between">
          <div className="flex items-center gap-1">
            <span className="text-5xl font-black leading-none">{card.rating}</span>
            <Star size={22} className="mb-1 fill-amber-400 text-amber-400" />
          </div>
          <span className="rounded-full bg-black/35 px-4 py-2 text-sm font-black backdrop-blur-md">{card.price}</span>
        </div>

        <h3 className="font-display text-3xl font-black leading-tight">{card.title}</h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/78">
          {card.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
            <MapPin size={13} /> {card.location}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
            <Users size={13} /> {card.seats}
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-md">{card.days}</span>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href={card.href} className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-sky-100">
            Reservar
          </Link>
          <Link href={card.href} className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-950 transition hover:bg-slate-950 hover:text-white">
            <Search size={19} />
          </Link>
        </div>
      </div>

      {featured && (
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-1">
          {[0, 1, 2].map(dot => (
            <span key={dot} className={`h-1.5 rounded-full bg-white ${dot === 1 ? 'w-6' : 'w-1.5 opacity-70'}`} />
          ))}
        </div>
      )}

      <div className="absolute left-5 top-20 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs font-bold text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100">
        <Sparkles size={14} /> Destino recomendado
      </div>
    </article>
  )
}
