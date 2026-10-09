import { LegalContentPage } from '@/components/LegalContentPage'

export const metadata = { title: 'Reembolsos - Cielo Viajes' }

export default function ReembolsosPage() {
  return (
    <LegalContentPage
      title="Politica de reembolsos"
      subtitle="Nuestra politica busca darte claridad sobre cancelaciones, cambios y devoluciones segun fechas, proveedores y condiciones del viaje."
      sections={[
        {
          title: 'Cancelaciones',
          body: 'Las cancelaciones se revisan segun la anticipacion, el tipo de plan contratado y las politicas de hoteles, aerolineas y operadores involucrados.',
        },
        {
          title: 'Cambios de fecha o destino',
          body: 'Los cambios estan sujetos a disponibilidad y pueden generar costos adicionales. Te recomendamos solicitarlos con la mayor anticipacion posible.',
        },
        {
          title: 'Proceso de devolucion',
          body: 'Cuando aplique un reembolso, nuestro equipo te informara tiempos, valores y medio de devolucion de acuerdo con las condiciones del proveedor.',
        },
      ]}
    />
  )
}
