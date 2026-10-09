import { LegalContentPage } from '@/components/LegalContentPage'

export const metadata = { title: 'Terminos y condiciones - Cielo Viajes' }

export default function TerminosPage() {
  return (
    <LegalContentPage
      title="Terminos y condiciones"
      subtitle="Estas condiciones explican como funcionan nuestras reservas, pagos, cambios y responsabilidades generales al contratar servicios con Cielo Viajes."
      sections={[
        {
          title: 'Reservas',
          body: 'Las reservas estan sujetas a disponibilidad de cupos, hoteles, transportes y operadores. El valor final se confirma antes de realizar el pago.',
        },
        {
          title: 'Pagos',
          body: 'El cliente debe cumplir con las fechas y valores acordados. Una reserva puede quedar pendiente hasta que el pago sea validado por nuestro equipo.',
        },
        {
          title: 'Responsabilidad del viajero',
          body: 'Cada viajero debe entregar informacion real, revisar documentos requeridos y cumplir las politicas del destino, aerolineas, hoteles y operadores.',
        },
      ]}
    />
  )
}
