'use client'

import { useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { destinationsApi } from '@/lib/api'
import type { Destination } from '@/types'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
  description: z.string().min(1),
  coverImage: z.string().min(1),
  images: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isActive: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  destination: Destination | null
  onClose: () => void
  onSaved: () => void
}

export default function DestinationFormModal({
  destination,
  onClose,
  onSaved,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (destination) {
      reset({
        name: destination.name,
        country: destination.country,
        city: destination.city,
        description: destination.description,
        coverImage: destination.coverImage,
        // ✅ Convierte string[] → string separado por comas
        images: Array.isArray(destination.images)
          ? destination.images.join(', ')
          : destination.images || '',
        latitude: destination.latitude ?? undefined,
        longitude: destination.longitude ?? undefined,
        isActive: destination.isActive ?? true,
      })
    } else {
      reset({
        name: '',
        country: '',
        city: '',
        description: '',
        coverImage: '',
        images: '',
        latitude: undefined,
        longitude: undefined,
        isActive: true,
      })
    }
  }, [destination, reset])

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // ✅ Convierte string → string[] antes de enviar
    const payload = {
      ...data,
      images: data.images
        ? data.images.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    }

    try {
      if (destination) {
        await destinationsApi.update(destination.id, payload)
        toast.success('Destino actualizado')
      } else {
        await destinationsApi.create(payload)
        toast.success('Destino creado')
      }
      onSaved()
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">
        <h2 className="text-xl font-bold">
          {destination ? 'Editar destino' : 'Nuevo destino'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

          <input {...register('name')} placeholder="Nombre" className="input" />
          {errors.name && <p className="text-red-500 text-sm">Requerido</p>}

          <input {...register('country')} placeholder="País" className="input" />
          {errors.country && <p className="text-red-500 text-sm">Requerido</p>}

          <input {...register('city')} placeholder="Ciudad" className="input" />
          {errors.city && <p className="text-red-500 text-sm">Requerido</p>}

          <textarea {...register('description')} placeholder="Descripción" className="input" />
          {errors.description && <p className="text-red-500 text-sm">Requerido</p>}

          <input {...register('coverImage')} placeholder="URL imagen de portada" className="input" />
          {errors.coverImage && <p className="text-red-500 text-sm">Requerido</p>}

          {/* ✅ Hint para que el usuario sepa el formato */}
          <div>
            <input
              {...register('images')}
              placeholder="Otras imágenes (separadas por coma)"
              className="input"
            />
            <p className="text-xs text-gray-400 mt-1">
              Ejemplo: https://img1.jpg, https://img2.jpg
            </p>
          </div>

          <input
            type="number"
            step="any"
            {...register('latitude', { valueAsNumber: true })}
            placeholder="Latitud"
            className="input"
          />

          <input
            type="number"
            step="any"
            {...register('longitude', { valueAsNumber: true })}
            placeholder="Longitud"
            className="input"
          />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('isActive')} />
            Activo
          </label>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}