import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react'
import { ContactLeadForm } from '@/components/ContactLeadForm'

export const metadata = { title: 'Contacto - Cielo Viajes' }

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-[#04060E] px-5 py-12 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:border-sky-400/40 hover:text-sky-300"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20 md:p-10">
            <h1 className="font-display text-4xl font-black leading-tight md:text-5xl">
              Hablemos de tu viaje
            </h1>
            <p className="mb-8 mt-4 max-w-lg text-base leading-8 text-white/50">
              Un asesor te contacta en menos de 24 horas. Sin compromiso.
            </p>
            <ContactLeadForm />
          </div>

          <aside className="pt-2">
            <p className="mb-5 text-xs font-black uppercase tracking-[0.32em] text-[#FF7A5C]">
              Informacion de contacto
            </p>
            <h2 className="font-display text-4xl font-black leading-tight">
              Siempre listos para ayudarte
            </h2>

            <div className="mt-10 space-y-7">
              <ContactItem
                icon={<Phone size={22} />}
                title="WhatsApp directo"
                body="+57 300 123 4567"
                detail="Lunes a sabado · 8am - 8pm"
                color="#00E5FF"
              />
              <ContactItem
                icon={<Mail size={22} />}
                title="Correo electronico"
                body="hola@cieloviajes.com.co"
                detail="Respuesta en menos de 2 horas"
                color="#FF7A5C"
              />
              <ContactItem
                icon={<MapPin size={22} />}
                title="Oficina Bogota"
                body="Cra 15 #93-75 · Zona Rosa"
                detail="Bogota D.C., Colombia"
                color="#A8E063"
              />
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <a href="https://instagram.com/TU_USUARIO" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-white/80 transition hover:border-white/25 hover:bg-white/5">Instagram</a>
              <a href="https://tiktok.com/@TU_USUARIO" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-white/80 transition hover:border-white/25 hover:bg-white/5">TikTok</a>
              <a href="https://facebook.com/TU_PAGINA" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-white/80 transition hover:border-white/25 hover:bg-white/5">Facebook</a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

function ContactItem({
  icon,
  title,
  body,
  detail,
  color,
}: {
  icon: ReactNode
  title: string
  body: string
  detail: string
  color: string
}) {
  return (
    <div className="flex gap-4">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border"
        style={{ color, borderColor: `${color}44`, background: `${color}18` }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-black text-white">{title}</h3>
        <p className="mt-1 text-sm font-semibold text-white/55">{body}</p>
        <p className="mt-1 text-sm text-white/40">{detail}</p>
      </div>
    </div>
  )
}
