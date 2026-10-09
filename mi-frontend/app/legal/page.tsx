import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LegalSection, isPolicyId } from '@/components/LegalSection'

export const metadata = { title: 'Legal - Cielo Viajes' }

type LegalPageProps = {
  searchParams?: Promise<{
    seccion?: string
  }>
}

export default async function LegalPage({ searchParams }: LegalPageProps) {
  const params = await searchParams
  const activeId = isPolicyId(params?.seccion) ? params.seccion : 'terminos'

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#04060E',
        color: '#fff',
        padding: '48px 20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 1180, margin: '0 auto' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 40,
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,.12)',
            padding: '9px 16px',
            color: 'rgba(255,255,255,.72)',
            fontSize: 14,
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, .75fr) minmax(0, 1.25fr)',
            gap: 40,
            alignItems: 'start',
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 16px',
                color: '#00E5FF',
                fontSize: 12,
                fontWeight: 950,
                letterSpacing: '.24em',
                textTransform: 'uppercase',
              }}
            >
              Centro de informacion
            </p>
            <h1
              style={{
                margin: 0,
                color: '#fff',
                fontSize: 'clamp(38px,5vw,64px)',
                lineHeight: 1.02,
                fontWeight: 950,
              }}
            >
              Claridad para viajar tranquilo
            </h1>
            <p
              style={{
                margin: '20px 0 0',
                maxWidth: 560,
                color: 'rgba(255,255,255,.58)',
                fontSize: 16,
                lineHeight: 1.9,
              }}
            >
              Consulta terminos, privacidad, reembolsos y datos de contacto desde una vista ordenada con la misma identidad visual de Cielo Viajes.
            </p>
          </div>

          <LegalSection activeId={activeId} />
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 960px) {
              main > div > div {
                grid-template-columns: 1fr !important;
              }
            }
          `,
        }}
      />
    </main>
  )
}
