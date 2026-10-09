import { LegalContentPage } from '@/components/LegalContentPage'

export const metadata = { title: 'Privacidad - Cielo Viajes' }

export default function PrivacidadPage() {
  return (
    <LegalContentPage
      title="Politica de privacidad"
      subtitle="En Cielo Viajes cuidamos la informacion que nos compartes para cotizar, reservar y acompanarte durante tu experiencia."
      sections={[
        {
          title: 'Datos que recopilamos',
          body: 'Podemos solicitar nombre, correo, telefono, destino de interes e informacion necesaria para gestionar reservas o solicitudes de contacto.',
        },
        {
          title: 'Uso de la informacion',
          body: 'Usamos tus datos para responder solicitudes, gestionar reservas, enviar informacion relacionada con tu viaje y prestar soporte antes, durante y despues de la experiencia.',
        },
        {
          title: 'Proteccion de datos',
          body: 'No vendemos tus datos personales. Solo compartimos informacion cuando es necesaria para operar el servicio contratado o cumplir obligaciones legales.',
        },
      ]}
    />
  )
}
