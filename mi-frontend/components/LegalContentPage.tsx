import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type LegalContentPageProps = {
  title: string
  subtitle: string
  sections: Array<{
    title: string
    body: string
  }>
}

export function LegalContentPage({ title, subtitle, sections }: LegalContentPageProps) {
  return (
    <main className="min-h-screen bg-[#04060E] px-5 py-12 text-white md:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:border-sky-400/40 hover:text-sky-300"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-sky-300">
          Cielo Viajes
        </p>
        <h1 className="font-display text-4xl font-black leading-tight md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/50">
          {subtitle}
        </p>

        <div className="mt-12 space-y-5">
          {sections.map(section => (
            <section key={section.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
              <h2 className="font-display text-2xl font-black">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/55">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
