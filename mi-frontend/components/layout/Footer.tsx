import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#03050c] text-white">
      <div className="h-16 bg-[linear-gradient(180deg,rgba(5,7,17,0)_0%,#03050c_72%)]" />
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />
      <div className="absolute left-1/2 top-0 h-40 w-[720px] -translate-x-1/2 rounded-full bg-cyan-400/5 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
                <span className="text-white font-display text-xl font-bold">C</span>
              </div>
              <span className="font-display text-2xl font-bold">Cielo</span>
            </div>
            <p className="text-slate-400 font-body text-sm leading-relaxed max-w-xs">
              Hacemos realidad tus sueños de viaje. Experiencias únicas, destinos increíbles y recuerdos que duran para siempre.
            </p>
            <div className="flex gap-3 mt-6">
              {['IG', 'FB', 'X'].map((label) => (
                <a key={label} href="#" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-sky-500/30 flex items-center justify-center text-slate-400 hover:text-white transition-all text-xs font-bold">
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Explorar</h4>
            <ul className="space-y-3">
              {[['Viajes', '/viajes'], ['Destinos', '/destinos'], ['Ofertas', '/viajes?isFeatured=true']].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 hover:text-sky-400 font-body text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-slate-400 text-sm font-body">
                <Mail size={14} className="text-sky-400 shrink-0" />
                hola@cielo.com.co
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-sm font-body">
                <Phone size={14} className="text-sky-400 shrink-0" />
                +57 301 234 5678
              </li>
              <li className="flex items-start gap-2 text-slate-400 text-sm font-body">
                <MapPin size={14} className="text-sky-400 shrink-0 mt-0.5" />
                Bogotá, Colombia
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-cyan-200/10 mt-12 mb-6" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-slate-500 font-body">
          <p>© {new Date().getFullYear()} Cielo. Todos los derechos reservados.</p>
          <p>Hecho con ♥ en Colombia</p>
        </div>
      </div>
    </footer>
  )
}
