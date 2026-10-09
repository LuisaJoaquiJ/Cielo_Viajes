'use client'
import { useState } from 'react'
import { Shield, Headphones, Award, Star } from 'lucide-react'

const tabs = ['¿Por qué Cielo?', 'Testimonios']

const reasons = [
  {
    icon: Shield,
    title: 'Reserva segura',
    desc: 'Pago 100% seguro con protección total. Si algo sale mal, te devolvemos tu dinero.',
    stat: '100%',
    statLabel: 'protegido',
  },
  {
    icon: Headphones,
    title: 'Soporte 24/7',
    desc: 'Estamos contigo antes, durante y después de tu viaje. Siempre disponibles.',
    stat: '24/7',
    statLabel: 'disponible',
  },
  {
    icon: Award,
    title: 'Mejor precio garantizado',
    desc: 'Encontramos el mejor precio o te devolvemos la diferencia. Sin letras pequeñas.',
    stat: '#1',
    statLabel: 'en Colombia',
  },
]

const testimonials = [
  { name: 'Laura M.', city: 'Bogotá', text: '¡El mejor viaje de mi vida! Cartagena fue increíble y todo estuvo perfectamente organizado.', rating: 5, initials: 'LM', trip: 'Cartagena · 7 días' },
  { name: 'Carlos R.', city: 'Medellín', text: 'San Andrés superó todas mis expectativas. El hotel, las excursiones, el servicio — todo impecable.', rating: 5, initials: 'CR', trip: 'San Andrés · 5 días' },
  { name: 'Ana P.', city: 'Cali', text: 'Reservé para toda la familia y fue una experiencia maravillosa. Definitivamente volvería con Cielo.', rating: 5, initials: 'AP', trip: 'Santa Marta · 6 días' },
]

export function TrustTabs() {
  const [active, setActive] = useState(0)

  return (
    <section className="py-24 px-4 bg-cielo-dark overflow-hidden relative">
      {/* Blobs decorativos */}
      <div className="blob w-96 h-96 bg-sky-500 -top-20 -right-20 opacity-15" />
      <div className="blob w-80 h-80 bg-teal-500 -bottom-10 -left-10 opacity-10" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="section-tag text-sky-400 mb-3 block">★ Confianza</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
              Tu viaje, <span className="text-gradient">nuestra pasión</span>
            </h2>
          </div>

          {/* Tabs inline junto al título */}
          <div className="flex bg-white/8 border border-white/10 rounded-2xl p-1 gap-1 self-start md:self-auto">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActive(i)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold font-body transition-all duration-300 whitespace-nowrap ${
                  active === i
                    ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── ¿Por qué Cielo? ── */}
        {active === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-up">
            {reasons.map(({ icon: Icon, title, desc, stat, statLabel }) => (
              <div
                key={title}
                className="relative p-7 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all duration-300 group overflow-hidden"
              >
                {/* Número grande de fondo */}
                <span className="absolute -right-3 -top-2 font-display text-[80px] font-black text-white/5 select-none leading-none group-hover:text-white/8 transition-all">
                  {stat}
                </span>

                {/* Icono */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center mb-6 group-hover:shadow-glow transition-all">
                  <Icon size={20} className="text-white" />
                </div>

                {/* Stat legible */}
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="font-display text-3xl font-black text-white">{stat}</span>
                  <span className="text-sky-400 text-xs font-semibold uppercase tracking-wider">{statLabel}</span>
                </div>

                <h3 className="font-display text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 font-body text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Testimonios ── */}
        {active === 1 && (
          <div className="grid md:grid-cols-3 gap-5 animate-fade-up">
            {testimonials.map(t => (
              <div
                key={t.name}
                className="flex flex-col justify-between p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all duration-300"
              >
                {/* Estrellas */}
                <div>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 font-body text-sm leading-relaxed italic mb-5">
                    "{t.text}"
                  </p>
                </div>

                {/* Footer del testimonio */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white font-body leading-none mb-0.5">{t.name}</p>
                      <p className="text-xs text-slate-500 font-body">{t.city}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-sky-400/80 font-body border border-sky-400/20 bg-sky-400/10 rounded-full px-2.5 py-1 whitespace-nowrap">
                    {t.trip}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}