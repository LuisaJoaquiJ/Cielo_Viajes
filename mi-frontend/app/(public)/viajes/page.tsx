import { Suspense } from 'react'
import { ArrowRight, CalendarDays, Filter, Plane, ShieldCheck } from 'lucide-react'
import TripCatalog from '@/components/trips/TripCatalog'

export const metadata = { title: 'Viajes - Catalogo completo' }

export default function ViajesPage() {
  return (
    <main className="public-dark-shell min-h-screen overflow-hidden">
      <section className="relative px-4 pb-12 pt-28 md:pb-16 md:pt-32">
        <div className="public-hero-gradient absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
        <div className="absolute left-1/2 top-14 h-[420px] w-[820px] -translate-x-1/2 rounded-full border border-cyan-300/10 opacity-70" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="public-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em]">
              <Plane size={15} /> Catalogo de experiencias
            </span>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-[0.98] tracking-tight text-white md:text-7xl">
              Viajes pensados para salir sin complicaciones
            </h1>
            <p className="mt-6 max-w-2xl font-body text-lg leading-8 text-slate-300">
              Explora paquetes seleccionados, compara rutas y encuentra una aventura con el nivel de detalle que merece tu proximo viaje.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#catalogo-viajes" className="public-primary-button inline-flex items-center gap-2 rounded-full px-6 py-3 font-body text-sm font-extrabold transition hover:-translate-y-0.5">
                Ver catalogo <ArrowRight size={17} />
              </a>
              <span className="public-soft-button inline-flex items-center gap-2 rounded-full px-6 py-3 font-body text-sm font-semibold">
                <ShieldCheck size={17} /> Reservas acompanadas
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Filter, value: 'Filtros', label: 'por ciudad, fecha y precio' },
              { icon: CalendarDays, value: 'Fechas', label: 'listas para comparar' },
              { icon: ShieldCheck, value: 'Soporte', label: 'antes y durante tu viaje' },
              { icon: Plane, value: 'Paquetes', label: 'con vuelos y experiencias' },
            ].map((item) => (
              <div key={item.value} className="public-glass-panel rounded-[26px] p-5">
                <item.icon className="mb-5 text-cyan-200" size={24} />
                <div className="font-display text-2xl font-bold text-white">{item.value}</div>
                <p className="mt-1 font-body text-sm leading-6 text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="catalogo-viajes" className="relative">
        <div className="public-content-gradient absolute inset-0" />
        <div className="relative z-10">
          <Suspense fallback={<CatalogSkeleton />}>
            <TripCatalog />
          </Suspense>
        </div>
      </section>
    </main>
  )
}

function CatalogSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-12 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="public-glass-panel h-80 animate-pulse rounded-[28px]" />
      ))}
    </div>
  )
}
