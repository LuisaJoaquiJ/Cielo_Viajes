'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

const schema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName:  z.string().min(2, 'Mínimo 2 caracteres'),
  email:     z.string().email('Email inválido'),
  phone:     z.string().optional(),
  password:  z.string().min(6, 'Mínimo 6 caracteres').regex(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, 'Debe tener mayúscula, minúscula y número'),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const { register: authRegister, isLoading } = useAuthStore()
  const [showPwd, setShowPwd] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await authRegister(data)
      toast.success('¡Cuenta creada! Bienvenido a Cielo')
      router.push('/')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center shadow-glass">
              <span className="text-white font-display text-xl font-bold">C</span>
            </div>
            <span className="font-display text-2xl font-bold text-slate-900">Cielo</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Crea tu cuenta</h1>
          <p className="text-slate-500 font-body text-sm">¿Ya tienes cuenta? <Link href="/login" className="text-sky-600 font-semibold hover:underline">Inicia sesión</Link></p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre</label>
                <input {...register('firstName')} placeholder="Carlos" className="input" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1 font-body">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="label">Apellido</label>
                <input {...register('lastName')} placeholder="Pérez" className="input" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1 font-body">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" placeholder="tu@email.com" className="input" />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-body">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Teléfono <span className="font-normal text-slate-400">(opcional)</span></label>
              <input {...register('phone')} type="tel" placeholder="+57 300 000 0000" className="input" />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input {...register('password')} type={showPwd ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" className="input pr-10" />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-body">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3.5 text-base mt-2 disabled:opacity-70">
              {isLoading ? 'Creando cuenta...' : <><Sparkles size={16} /> Crear cuenta gratis</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
