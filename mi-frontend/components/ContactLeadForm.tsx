'use client'
import { useState } from 'react'
import { ArrowRight, CheckCircle } from 'lucide-react'

export function ContactLeadForm() {
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    destino: '',
  })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('http://localhost:3001/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Error al enviar')

      setSent(true) // ✅ ahora sí
    } catch (error) {
      console.error(error)
      alert('Error enviando formulario')
    } finally {
      setLoading(false)
    }
  }

  // ✅ ESTE return es del componente, no del handleSubmit
  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
        <CheckCircle size={48} className="text-teal-400" />
        <h3 className="font-display text-2xl font-bold text-white">
          ¡Listo! Te contactamos pronto
        </h3>
        <p className="text-slate-400 font-body">
          Uno de nuestros asesores te escribirá en menos de 24 horas.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-xs font-bold text-sky-400 font-body uppercase tracking-widest block mb-1">
          Nombre
        </label>
        <input
          required
          placeholder="Tu nombre completo"
          className="input w-full bg-white/10 border-white/20 text-white"
          value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-sky-400 font-body uppercase tracking-widest block mb-1">
          Teléfono / WhatsApp
        </label>
        <input
          required
          placeholder="+57 300 000 0000"
          className="input w-full bg-white/10 border-white/20 text-white"
          value={form.telefono}
          onChange={e => setForm({ ...form, telefono: e.target.value })}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-sky-400 font-body uppercase tracking-widest block mb-1">
          Email
        </label>
        <input
          required
          type="email"
          placeholder="tu@correo.com"
          className="input w-full bg-white/10 border-white/20 text-white"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-sky-400 font-body uppercase tracking-widest block mb-1">
          ¿A dónde quieres ir?
        </label>
        <input
          placeholder="Ej: Cartagena, San Andrés…"
          className="input w-full bg-white/10 border-white/20 text-white"
          value={form.destino}
          onChange={e => setForm({ ...form, destino: e.target.value })}
        />
      </div>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center text-base py-4"
        >
          {loading ? 'Enviando…' : 'Quiero que me contacten'} <ArrowRight size={18} />
        </button>
      </div>
    </form>
  )
}