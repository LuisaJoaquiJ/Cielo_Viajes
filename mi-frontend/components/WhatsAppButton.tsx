const WA_NUMBER = '573001234567'
const WA_MESSAGE = '¡Hola! Quiero información sobre los viajes de Cielo ✈️'

export function WhatsAppButton() {
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
      aria-label="Escribir por WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="w-6 h-6 fill-white flex-shrink-0">
        <path d="M16 .5C7.44.5.5 7.44.5 16c0 2.83.74 5.49 2.03 7.8L.5 31.5l7.93-2.08A15.46 15.46 0 0016 31.5C24.56 31.5 31.5 24.56 31.5 16S24.56.5 16 .5zm7.94 22.06c-.33.93-1.94 1.79-2.67 1.9-.68.1-1.54.15-2.48-.16a22.7 22.7 0 01-2.25-.83c-3.95-1.71-6.53-5.7-6.73-5.96-.2-.27-1.6-2.13-1.6-4.06 0-1.93 1.01-2.87 1.37-3.26.36-.39.79-.49 1.05-.49l.76.01c.24.01.57-.09.89.68.33.79 1.13 2.72 1.23 2.92.1.2.17.43.03.69-.13.27-.2.43-.39.66-.2.23-.41.51-.59.69-.19.19-.39.4-.17.78.22.39.99 1.63 2.12 2.64 1.46 1.3 2.68 1.7 3.07 1.89.39.2.62.17.85-.1.23-.27.99-1.15 1.25-1.55.26-.39.52-.33.88-.2.36.14 2.28 1.08 2.67 1.27.39.2.65.3.75.46.1.17.1.98-.23 1.92z"/>
      </svg>

      <span className="font-semibold text-sm hidden sm:block">
        Escríbenos por WhatsApp
      </span>
    </a>
  )
}