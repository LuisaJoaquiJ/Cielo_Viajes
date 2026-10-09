import { Compass, MapPin, Plane, Sparkles } from 'lucide-react'
import { DestinationExplorer } from '@/components/destinations/DestinationExplorer'
import { destinationsApi } from '@/lib/api'
import type { Destination } from '@/types'

export const metadata = { title: 'Destinos - Explora Colombia y el mundo' }

export default async function DestinosPage() {
  let destinations: Destination[] = []

  try {
    const data = await destinationsApi.list({ limit: 20 })
    destinations = data.destinations ?? []
  } catch {}

  return (
    <main className="public-dark-shell min-h-screen overflow-hidden">
      <section className="relative px-4 pb-14 pt-28 md:pb-20 md:pt-32">
        <div className="public-hero-gradient absolute inset-0" />
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full border border-cyan-300/10" />
        <div className="absolute left-8 top-44 h-48 w-48 rounded-full border border-emerald-300/10" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="public-glass-panel rounded-[32px] p-6 md:p-8">
            <span className="public-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em]">
              <Compass size={15} /> Mapa de destinos
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[0.98] tracking-tight md:text-7xl">
              Destinos para volver a sentir el mundo
            </h1>
            <p className="mt-6 font-body text-lg leading-8 text-slate-300">
              Lugares elegidos por experiencia, conexion y belleza. Entra a cada destino para ver los viajes disponibles y empezar a planear.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: MapPin, value: destinations.length || '20+', label: 'destinos curados' },
              { icon: Plane, value: 'Rutas', label: 'con paquetes activos' },
              { icon: Sparkles, value: 'Premium', label: 'experiencias memorables' },
            ].map((item) => (
              <div key={String(item.value)} className="public-glass-panel rounded-[26px] p-5">
                <item.icon className="mb-6 text-cyan-200" size={24} />
                <div className="font-display text-3xl font-bold text-white">{item.value}</div>
                <p className="mt-1 font-body text-sm leading-6 text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 py-14">
        <div className="public-content-gradient absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-7xl">
          {destinations.length === 0 ? (
            <div className="public-glass-panel mx-auto max-w-xl rounded-[30px] px-6 py-16 text-center">
              <Compass className="mx-auto mb-5 text-cyan-200" size={42} />
              <h3 className="font-display text-3xl font-bold text-white">Proximamente mas destinos</h3>
              <p className="mt-3 font-body text-slate-400">Estamos preparando nuevas rutas para que puedas explorar mas opciones.</p>
            </div>
          ) : (
            <DestinationExplorer destinations={destinations} />
          )}
        </div>
      </section>
    </main>
  )
}
