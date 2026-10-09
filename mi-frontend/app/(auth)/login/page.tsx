'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight, Plane } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

const schema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

function LoginContent() {
  const router     = useRouter()
  const params     = useSearchParams()
  const { login, isLoading } = useAuthStore()
  const [showPwd, setShowPwd] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password)
      toast.success('¡Bienvenido de vuelta!')

      // ✅ redirigir según rol
      const { user } = useAuthStore.getState()
      if (user?.role === 'ADMIN')      router.push('/admin')
      else if (user?.role === 'AGENT') router.push('/agente')
      else                             router.push(params.get('redirect') ?? '/')
    } catch (err: any) {
      toast.error(err.message ?? 'Credenciales incorrectas')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-soft flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 bg-cielo-dark items-center justify-center relative overflow-hidden">
        <div className="blob w-80 h-80 bg-sky-500 -top-20 -right-20 opacity-20" />
        <div className="blob w-64 h-64 bg-teal-400 bottom-10 left-10 opacity-15" />
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Plane size={30} className="text-white" />
          </div>
          <h2 className="font-display text-5xl font-bold text-white mb-4">Bienvenido<br />a Cielo</h2>
          <p className="text-sky-200/70 font-body leading-relaxed">
            Inicia sesión para acceder a tus reservas, historial de viajes y ofertas exclusivas.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
              <span className="text-white font-display text-lg font-bold">C</span>
            </div>
            <span className="font-display text-xl font-bold text-slate-900">Cielo</span>
          </Link>

          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Iniciar sesión</h1>
          <p className="text-slate-500 font-body text-sm mb-8">¿No tienes cuenta? <Link href="/registro" className="text-sky-600 font-semibold hover:underline">Regístrate gratis</Link></p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" placeholder="tu@email.com" className="input" autoComplete="email" />
              {errors.email && <p className="text-red-500 text-xs font-body mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input {...register('password')} type={showPwd ? 'text' : 'password'} placeholder="••••••••" className="input pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs font-body mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3.5 text-base mt-2 disabled:opacity-70">
              {isLoading ? 'Iniciando sesión...' : <><ArrowRight size={18} /> Iniciar sesión</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <p className="text-slate-500 font-semibold">Cargando...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
