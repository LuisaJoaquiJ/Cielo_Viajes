'use client'
import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HorizontalScrollProps {
  title: React.ReactNode
  tag: string
  dark?: boolean
  children: React.ReactNode
}

export function HorizontalScroll({ title, tag, dark = false, children }: HorizontalScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft]   = useState(false)
  const [canRight, setCanRight] = useState(true)

  function updateArrows() {
    const el = ref.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    return () => el.removeEventListener('scroll', updateArrows)
  }, [])

  function scroll(dir: 'left' | 'right') {
    ref.current?.scrollBy({ left: dir === 'right' ? 340 : -340, behavior: 'smooth' })
  }

  const ArrowBtn = ({
    dir,
    enabled,
  }: {
    dir: 'left' | 'right'
    enabled: boolean
  }) => (
    <button
      onClick={() => scroll(dir)}
      disabled={!enabled}
      aria-label={dir === 'left' ? 'Anterior' : 'Siguiente'}
      className={`
        w-10 h-10 rounded-xl border flex items-center justify-center
        transition-all duration-200
        ${enabled ? 'cursor-pointer' : 'cursor-default opacity-30'}
        ${dark
          ? enabled
            ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
            : 'bg-white/5  border-white/10 text-white/30'
          : enabled
            ? 'bg-white border-slate-200 shadow-sm hover:bg-sky-50 hover:border-sky-300 text-slate-700'
            : 'bg-slate-50 border-slate-100 text-slate-300'
        }
      `}
    >
      {dir === 'left' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
    </button>
  )

  return (
    <section
      className={`py-20 overflow-hidden ${
        dark ? 'bg-cielo-dark' : 'bg-gradient-soft'
      }`}
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between px-4 md:px-8 mb-10">
          <div>
            <span
              className={`section-tag mb-3 block ${dark ? 'text-sky-400' : ''}`}
            >
              {tag}
            </span>
            <h2
              className={`section-title ${dark ? 'text-white' : ''}`}
            >
              {title}
            </h2>
          </div>

          {/* Flechas */}
          <div className="flex gap-2">
            <ArrowBtn dir="left"  enabled={canLeft} />
            <ArrowBtn dir="right" enabled={canRight} />
          </div>
        </div>

        {/* Track — padding lateral para que la primera card asome limpia */}
        <div
          ref={ref}
          onScroll={updateArrows}
          className="flex gap-5 overflow-x-auto pb-4 px-4 md:px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {children}

          {/* Fade edge derecho — solo estético */}
          <div
            className={`
              flex-shrink-0 w-8 self-stretch
              ${dark ? 'bg-transparent' : 'bg-transparent'}
            `}
            aria-hidden
          />
        </div>

        {/* Barra de progreso sutil */}
        <ProgressBar scrollRef={ref} dark={dark} />
      </div>
    </section>
  )
}

/* Barra de scroll proporcional */
function ProgressBar({
  scrollRef,
  dark,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>
  dark: boolean
}) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function update() {
      const max = el!.scrollWidth - el!.clientWidth
      setProgress(max > 0 ? el!.scrollLeft / max : 0)
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    return () => el.removeEventListener('scroll', update)
  }, [scrollRef])

  return (
    <div className="px-4 md:px-8 mt-6">
      <div
        className={`h-0.5 w-full rounded-full ${
          dark ? 'bg-white/10' : 'bg-slate-200'
        }`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-500 transition-all duration-150"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  )
}