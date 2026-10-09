'use client'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Mail, Phone, Save } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { usersApi } from '@/lib/api'

type ProfileForm = {
  firstName: string
  lastName: string
  phone: string
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuthStore()
  const initials = `${user?.firstName?.[0] ?? 'C'}${user?.lastName?.[0] ?? ''}`
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProfileForm>({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName:  user?.lastName  ?? '',
      phone:     user?.phone     ?? '',
    },
  })

  const onSubmit = async (data: ProfileForm) => {
    try {
      await usersApi.updateProfile(data)
      await refreshUser()
      toast.success('Perfil actualizado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo actualizar el perfil')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Mi perfil</h1>
        <p className="text-slate-500 font-body text-sm mt-1">Administra tu información personal</p>
      </div>

      <div className="card p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 pb-6 border-b border-sky-50 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
            {initials}
          </div>
          <div>
            <p className="font-bold text-slate-800 font-body">{user?.firstName} {user?.lastName}</p>
            <span className={`badge text-xs mt-1 ${user?.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre</label>
              <input {...register('firstName')} className="input" />
            </div>
            <div>
              <label className="label">Apellido</label>
              <input {...register('lastName')} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input value={user?.email} disabled className="input pl-9 bg-slate-50 cursor-not-allowed text-slate-500" />
            </div>
          </div>

          <div>
            <label className="label">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input {...register('phone')} className="input pl-9" placeholder="+57 300 000 0000" />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            <Save size={16} />
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}
