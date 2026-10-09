import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Shield,
} from 'lucide-react'

type PolicyId = 'terminos' | 'privacidad' | 'reembolsos' | 'contacto'

type Policy = {
  id: PolicyId
  eyebrow: string
  icon: ReactNode
  title: string
  subtitle: string
  summaryTitle: string
  summary: string
  accentA: string
  accentB: string
  border: string
  shadow: string
  highlights: string[]
  items: Array<{
    title: string
    body: string
  }>
}

const policies: Policy[] = [
  {
    id: 'terminos',
    eyebrow: 'Condiciones de uso',
    icon: <FileText size={22} />,
    title: 'Terminos y Condiciones',
    subtitle: 'Reglas claras para reservar, pagar y usar nuestros servicios.',
    summaryTitle: 'Al contratar con Cielo Viajes',
    summary:
      'Estos terminos explican como funcionan las reservas, pagos, responsabilidades del viajero y ajustes operativos de los planes turisticos.',
    accentA: '#38BDF8',
    accentB: '#22D3EE',
    border: 'rgba(56, 189, 248, 0.34)',
    shadow: 'rgba(56, 189, 248, 0.16)',
    highlights: ['Reservas sujetas a disponibilidad', 'Precio confirmado antes del pago', 'Condiciones de proveedores incluidas'],
    items: [
      {
        title: 'Aceptacion del servicio',
        body: 'Al solicitar, reservar o pagar un servicio con Cielo Viajes, aceptas las condiciones informadas para el plan elegido y las politicas de los proveedores involucrados.',
      },
      {
        title: 'Reservas y pagos',
        body: 'Las reservas dependen de cupos disponibles en hoteles, aerolineas, transportes y operadores. El valor final se confirma antes de recibir el pago o anticipo.',
      },
      {
        title: 'Responsabilidad del viajero',
        body: 'Cada viajero debe entregar informacion real, validar documentos, cumplir requisitos migratorios y revisar horarios, restricciones y condiciones del destino.',
      },
      {
        title: 'Cambios operativos',
        body: 'Los itinerarios pueden ajustarse por clima, disponibilidad, decisiones del proveedor o causas externas. Nuestro equipo informara alternativas cuando aplique.',
      },
    ],
  },
  {
    id: 'privacidad',
    eyebrow: 'Datos personales',
    icon: <Shield size={22} />,
    title: 'Politica de Privacidad',
    subtitle: 'Como recopilamos, usamos y protegemos tu informacion.',
    summaryTitle: 'Tu informacion se usa con proposito',
    summary:
      'Usamos tus datos solo para atender solicitudes, gestionar reservas, comunicar novedades del viaje y cumplir obligaciones relacionadas con el servicio.',
    accentA: '#2DD4BF',
    accentB: '#86EFAC',
    border: 'rgba(45, 212, 191, 0.34)',
    shadow: 'rgba(45, 212, 191, 0.14)',
    highlights: ['No vendemos tus datos', 'Uso limitado al servicio contratado', 'Puedes solicitar actualizacion o eliminacion'],
    items: [
      {
        title: 'Informacion que solicitamos',
        body: 'Podemos recopilar nombre, identificacion, correo, telefono, destino de interes, datos de acompanantes e informacion necesaria para cotizar o reservar.',
      },
      {
        title: 'Finalidad del tratamiento',
        body: 'La informacion se usa para responder solicitudes, emitir confirmaciones, coordinar proveedores, prestar soporte y enviar comunicaciones relacionadas con tu viaje.',
      },
      {
        title: 'Comparticion con terceros',
        body: 'Solo compartimos datos con aerolineas, hoteles, operadores, pasarelas de pago o autoridades cuando sea necesario para prestar el servicio o cumplir la ley.',
      },
      {
        title: 'Derechos del titular',
        body: 'Puedes solicitar consulta, correccion, actualizacion o eliminacion de tus datos escribiendo a nuestros canales oficiales de atencion.',
      },
    ],
  },
  {
    id: 'reembolsos',
    eyebrow: 'Cancelaciones y cambios',
    icon: <RefreshCw size={22} />,
    title: 'Politica de Reembolsos',
    subtitle: 'Criterios para devoluciones, cambios y creditos de viaje.',
    summaryTitle: 'Cada caso se revisa con claridad',
    summary:
      'Las devoluciones se revisan segun fecha de cancelacion, tipo de plan, condiciones de proveedores y pagos ya ejecutados para servicios confirmados.',
    accentA: '#FCD34D',
    accentB: '#FB923C',
    border: 'rgba(251, 191, 36, 0.36)',
    shadow: 'rgba(251, 146, 60, 0.16)',
    highlights: ['Evaluacion caso a caso', 'Tiempos segun proveedor', 'Cambios sujetos a disponibilidad'],
    items: [
      {
        title: 'Cancelaciones del cliente',
        body: 'Las cancelaciones se evaluan segun anticipacion, temporada, servicios ya emitidos y condiciones de hoteles, aerolineas y operadores involucrados.',
      },
      {
        title: 'Cambios de fecha o destino',
        body: 'Los cambios estan sujetos a disponibilidad y pueden generar diferencias tarifarias, penalidades o gastos administrativos informados antes de confirmar.',
      },
      {
        title: 'Cancelacion por parte de Cielo Viajes',
        body: 'Si una salida no puede operar por razones atribuibles a la agencia, se ofrecera reprogramacion, credito de viaje o devolucion segun el caso.',
      },
      {
        title: 'Proceso de devolucion',
        body: 'Cuando aplique un reembolso, informaremos valor aprobado, medio de devolucion y tiempos estimados, que pueden depender de bancos o proveedores externos.',
      },
    ],
  },
  {
    id: 'contacto',
    eyebrow: 'Datos de empresa',
    icon: <Building2 size={22} />,
    title: 'Contacto y Empresa',
    subtitle: 'Canales oficiales y datos principales de Cielo Viajes.',
    summaryTitle: 'Atencion directa y verificable',
    summary:
      'Usa estos datos para comunicarte con nuestro equipo, solicitar soporte de reservas o validar informacion comercial de la agencia.',
    accentA: '#FDA4AF',
    accentB: '#FF7A5C',
    border: 'rgba(253, 164, 175, 0.34)',
    shadow: 'rgba(255, 122, 92, 0.16)',
    highlights: ['Atencion por WhatsApp y correo', 'Oficina principal en Bogota', 'Soporte para reservas y solicitudes'],
    items: [
      {
        title: 'Razon comercial',
        body: 'Cielo Viajes - Agencia de viajes colombiana especializada en paquetes turisticos, reservas, experiencias y acompanamiento al viajero.',
      },
      {
        title: 'WhatsApp directo',
        body: '+57 300 123 4567. Atencion de lunes a sabado, de 8:00 a.m. a 8:00 p.m.',
      },
      {
        title: 'Correo electronico',
        body: 'hola@cieloviajes.com.co. Canal recomendado para solicitudes formales, soporte de reservas y envio de documentos.',
      },
      {
        title: 'Oficina principal',
        body: 'Cra 15 #93-75, Zona Rosa, Bogota D.C., Colombia. Atencion presencial con cita previa.',
      },
    ],
  },
]

const legalCss = `
.legal-panel {
  overflow: hidden;
  border-radius: 28px;
  background: #07101d;
  border: 1px solid rgba(255,255,255,.1);
  box-shadow: 0 28px 90px rgba(0,0,0,.45);
  color: #fff;
}
.legal-tabs {
  display: grid;
  grid-template-columns: repeat(4,minmax(0,1fr));
  gap: 8px;
  padding: 8px;
  background: rgba(0,0,0,.24);
  border-bottom: 1px solid rgba(255,255,255,.1);
}
.legal-tab {
  min-height: 82px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.035);
  color: rgba(255,255,255,.62);
  text-decoration: none;
  transition: background .2s ease, border-color .2s ease, transform .2s ease;
}
.legal-tab:hover { background: rgba(255,255,255,.07); color: #fff; transform: translateY(-1px); }
.legal-tab-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: #06101a;
  box-shadow: 0 14px 32px rgba(0,0,0,.28);
}
.legal-tab-title { display: block; color: inherit; font-size: 14px; line-height: 1.15; font-weight: 900; }
.legal-tab-subtitle { display: block; margin-top: 5px; color: rgba(255,255,255,.42); font-size: 12px; line-height: 1.25; }
.legal-content {
  display: grid;
  grid-template-columns: .72fr 1.28fr;
  gap: 32px;
  padding: 32px;
}
.legal-hero-card,
.legal-summary,
.legal-item,
.legal-highlight {
  border: 1px solid rgba(255,255,255,.1);
  background: linear-gradient(135deg, rgba(255,255,255,.09), rgba(255,255,255,.025));
}
.legal-hero-card { border-radius: 26px; padding: 24px; }
.legal-kicker {
  display: inline-flex;
  border-radius: 999px;
  padding: 6px 12px;
  border: 1px solid rgba(255,255,255,.16);
  background: rgba(255,255,255,.06);
  color: rgba(255,255,255,.78);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .16em;
  text-transform: uppercase;
}
.legal-title { margin: 20px 0 0; color: #fff; font-size: clamp(30px,4vw,42px); line-height: 1.03; font-weight: 950; }
.legal-copy { margin: 16px 0 0; color: rgba(255,255,255,.66); font-size: 14px; line-height: 1.85; }
.legal-aside { display: flex; flex-direction: column; gap: 20px; }
.legal-summary { border-radius: 20px; padding: 20px; background: rgba(0,0,0,.24); }
.legal-summary-label { margin: 0; color: rgba(255,255,255,.42); font-size: 11px; font-weight: 900; letter-spacing: .18em; text-transform: uppercase; }
.legal-summary-text { margin: 12px 0 0; color: rgba(255,255,255,.7); font-size: 14px; line-height: 1.8; }
.legal-highlights { display: grid; gap: 10px; }
.legal-highlight { display: flex; gap: 12px; align-items: flex-start; border-radius: 18px; padding: 13px; color: rgba(255,255,255,.7); font-size: 14px; line-height: 1.45; }
.legal-highlight svg { color: #5eead4; flex: 0 0 auto; margin-top: 1px; }
.legal-items { display: grid; gap: 14px; }
.legal-item { border-radius: 20px; padding: 22px; box-shadow: 0 18px 46px rgba(0,0,0,.18); }
.legal-item-row { display: flex; align-items: flex-start; gap: 16px; }
.legal-number {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: #06101a;
  font-size: 14px;
  font-weight: 950;
  box-shadow: 0 12px 24px rgba(0,0,0,.25);
}
.legal-item h3 { margin: 0; color: #fff; font-size: 21px; line-height: 1.2; font-weight: 950; }
.legal-item p { margin: 9px 0 0; color: rgba(255,255,255,.66); font-size: 14px; line-height: 1.8; }
.legal-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 32px;
  border-top: 1px solid rgba(255,255,255,.1);
  background: rgba(0,0,0,.22);
  color: rgba(255,255,255,.45);
  font-size: 12px;
}
.legal-contact-actions { display: grid; gap: 10px; }
.legal-contact-action {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,.14);
  padding: 12px 14px;
  background: rgba(255,255,255,.045);
  color: rgba(255,255,255,.78);
  font-size: 14px;
  font-weight: 900;
  text-decoration: none;
}
@media (max-width: 980px) {
  .legal-tabs { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .legal-content { grid-template-columns: 1fr; padding: 24px; }
}
@media (max-width: 560px) {
  .legal-tabs { grid-template-columns: 1fr; }
  .legal-content { padding: 18px; gap: 22px; }
  .legal-footer { flex-direction: column; padding: 16px 18px; }
  .legal-item-row { gap: 12px; }
}
`

const contactActions = [
  { href: 'https://wa.me/573001234567', label: '+57 300 123 4567', icon: <Phone size={18} /> },
  { href: 'mailto:hola@cieloviajes.com.co', label: 'hola@cieloviajes.com.co', icon: <Mail size={18} /> },
  { href: 'https://maps.google.com/?q=Cra%2015%20%2393-75%20Bogota', label: 'Bogota D.C.', icon: <MapPin size={18} /> },
]

export function isPolicyId(value: string | undefined): value is PolicyId {
  return policies.some(policy => policy.id === value)
}

export function LegalSection({ activeId = 'terminos' }: { activeId?: PolicyId }) {
  const active = policies.find(policy => policy.id === activeId) ?? policies[0]
  const accentGradient = `linear-gradient(135deg, ${active.accentA}, ${active.accentB})`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: legalCss }} />
      <section
        className="legal-panel"
        style={{
          borderColor: active.border,
          boxShadow: `0 28px 90px rgba(0,0,0,.45), 0 0 70px ${active.shadow}`,
        }}
      >
        <div className="legal-tabs">
          {policies.map(policy => {
            const selected = policy.id === active.id

            return (
              <Link
                key={policy.id}
                href={`/legal?seccion=${policy.id}`}
                className="legal-tab"
                style={{
                  borderColor: selected ? policy.border : undefined,
                  background: selected ? 'rgba(255,255,255,.09)' : undefined,
                  color: selected ? '#fff' : undefined,
                  boxShadow: selected ? `0 14px 34px ${policy.shadow}` : undefined,
                }}
              >
                <span
                  className="legal-tab-icon"
                  style={{ background: `linear-gradient(135deg, ${policy.accentA}, ${policy.accentB})` }}
                >
                  {policy.icon}
                </span>
                <span>
                  <span className="legal-tab-title">{policy.title}</span>
                  <span className="legal-tab-subtitle">{policy.eyebrow}</span>
                </span>
              </Link>
            )
          })}
        </div>

        <div className="legal-content">
          <aside className="legal-aside">
            <div className="legal-hero-card" style={{ borderColor: active.border }}>
              <span className="legal-kicker" style={{ borderColor: active.border }}>
                {active.eyebrow}
              </span>
              <h2 className="legal-title">{active.title}</h2>
              <p className="legal-copy">{active.subtitle}</p>
            </div>

            <div className="legal-summary" style={{ borderColor: active.border }}>
              <p className="legal-summary-label">{active.summaryTitle}</p>
              <p className="legal-summary-text">{active.summary}</p>
            </div>

            <div className="legal-highlights">
              {active.highlights.map(item => (
                <div key={item} className="legal-highlight">
                  <CheckCircle2 size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {active.id === 'contacto' && (
              <div className="legal-contact-actions">
                {contactActions.map(action => (
                  <a
                    key={action.label}
                    href={action.href}
                    target={action.href.startsWith('http') ? '_blank' : undefined}
                    rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="legal-contact-action"
                    style={{ borderColor: active.border }}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </a>
                ))}
              </div>
            )}
          </aside>

          <div className="legal-items">
            {active.items.map((item, index) => (
              <article key={item.title} className="legal-item" style={{ borderColor: active.border }}>
                <div className="legal-item-row">
                  <span className="legal-number" style={{ background: accentGradient }}>
                    {index + 1}
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="legal-footer">
          <span>Ultima actualizacion: Mayo 2025</span>
          <span>Informacion oficial de Cielo Viajes.</span>
        </div>
      </section>
    </>
  )
}
