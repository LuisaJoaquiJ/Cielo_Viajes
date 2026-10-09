'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { X, Save } from 'lucide-react'
import { tripsApi, destinationsApi } from '@/lib/api'
import type { Trip, Destination } from '@/types'

const schema = z.object({
  title:         z.string().min(5),
  description:   z.string().min(10),
  price:         z.coerce.number().positive(),
  priceChild:    z.coerce.number().optional(),
  capacity:      z.coerce.number().int().positive(),
  departureDate: z.string().min(1, 'Requerido'),
  returnDate:    z.string().min(1, 'Requerido'),
  departureCity: z.string().min(2),
  coverImage:    z.string().url('URL de imagen inválida'),
  destinationId: z.string().min(1, 'Requerido'),
  status:        z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'FULL']),
  isFeatured:    z.boolean().optional(),
  highlights:    z.string().min(1, 'Agrega al menos un highlight'),
  includes:      z.string().min(1, 'Agrega al menos un elemento'),
  excludes:      z.string().optional().default(''),
})
type FormData = z.infer<typeof schema>
type FormInput = z.input<typeof schema>

interface Props {
  trip: Trip | null
  onClose: () => void
  onSaved: () => void
}

export default function TripFormModal({ trip, onClose, onSaved }: Props) {
  const [destinations, setDestinations] = useState<Destination[]>([])

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status:     'DRAFT',
      isFeatured: false,
      highlights: '',
      includes:   '',
      excludes:   '',
    },
  })

  // Cargar destinos
  useEffect(() => {
    destinationsApi.list({ limit: 100 })
      .then(r => setDestinations(r.destinations))
      .catch(() => toast.error('Error cargando destinos'))
  }, [])

  // Poblar el form al editar
  useEffect(() => {
    if (trip) {
      reset({
        title:         trip.title,
        description:   trip.description,
        price:         trip.price,
        priceChild:    trip.priceChild,
        capacity:      trip.capacity,
        departureDate: trip.departureDate?.slice(0, 10),
        returnDate:    trip.returnDate?.slice(0, 10),
        departureCity: trip.departureCity,
        coverImage:    trip.coverImage,
        destinationId: trip.destination?.id ?? '',
        status:        trip.status,
        isFeatured:    trip.isFeatured,
        highlights:    trip.highlights?.join(', ') ?? '',
        includes:      trip.includes?.join(', ')   ?? '',
        excludes:      trip.excludes?.join(', ')   ?? '',
      })
    }
  }, [trip, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        departureDate: new Date(data.departureDate).toISOString(),
        returnDate:    new Date(data.returnDate).toISOString(),
        highlights:    data.highlights.split(',').map(s => s.trim()).filter(Boolean),
        includes:      data.includes.split(',').map(s => s.trim()).filter(Boolean),
        excludes:      data.excludes?.split(',').map(s => s.trim()).filter(Boolean) ?? [],
      }
      if (trip) {
        await tripsApi.update(trip.id, payload as any)
        toast.success('Viaje actualizado')
      } else {
        await tripsApi.create(payload as any)
        toast.success('Viaje creado')
      }
      onSaved()
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sky-50">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            {trip ? 'Editar viaje' : 'Nuevo viaje'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

          {/* Title */}
          <div>
            <label className="label">Título del viaje</label>
            <input {...register('title')} className="input" placeholder="Cartagena Mágica — 5 días" />
            {errors.title && <p className="text-red-500 text-xs mt-1 font-body">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="label">Descripción</label>
            <textarea {...register('description')} rows={4} className="input resize-none" placeholder="Describe la experiencia..." />
            {errors.description && <p className="text-red-500 text-xs mt-1 font-body">{errors.description.message}</p>}
          </div>

          {/* Cover image */}
          <div>
            <label className="label">URL imagen principal</label>
            <input {...register('coverImage')} className="input" placeholder="https://..." />
            {errors.coverImage && <p className="text-red-500 text-xs mt-1 font-body">{errors.coverImage.message}</p>}
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Precio adulto (COP)</label>
              <input {...register('price')} type="number" className="input" placeholder="1850000" />
              {errors.price && <p className="text-red-500 text-xs mt-1 font-body">{errors.price.message}</p>}
            </div>
            <div>
              <label className="label">Precio niño (opcional)</label>
              <input {...register('priceChild')} type="number" className="input" placeholder="1350000" />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha salida</label>
              <input {...register('departureDate')} type="date" className="input" />
              {errors.departureDate && <p className="text-red-500 text-xs mt-1 font-body">{errors.departureDate.message}</p>}
            </div>
            <div>
              <label className="label">Fecha regreso</label>
              <input {...register('returnDate')} type="date" className="input" />
              {errors.returnDate && <p className="text-red-500 text-xs mt-1 font-body">{errors.returnDate.message}</p>}
            </div>
          </div>

          {/* City, Capacity, Destination */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Ciudad salida</label>
              <input {...register('departureCity')} className="input" placeholder="Bogotá" />
              {errors.departureCity && <p className="text-red-500 text-xs mt-1 font-body">Requerido</p>}
            </div>
            <div>
              <label className="label">Capacidad</label>
              <input {...register('capacity')} type="number" className="input" placeholder="20" />
              {errors.capacity && <p className="text-red-500 text-xs mt-1 font-body">Requerido</p>}
            </div>
            <div>
              <label className="label">Destino</label>
              <select {...register('destinationId')} className="input">
                <option value="">Selecciona un destino</option>
                {destinations.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.city}
                  </option>
                ))}
              </select>
              {errors.destinationId && <p className="text-red-500 text-xs mt-1 font-body">{errors.destinationId.message}</p>}
            </div>
          </div>

          {/* Highlights */}
          <div>
            <label className="label">
              Highlights <span className="text-slate-400 font-normal text-xs">(separados por coma)</span>
            </label>
            <input {...register('highlights')} className="input" placeholder="Ciudad amurallada, Islas del Rosario, Cena caribeña" />
            {errors.highlights && <p className="text-red-500 text-xs mt-1 font-body">{errors.highlights.message}</p>}
          </div>

          {/* Includes */}
          <div>
            <label className="label">
              Incluye <span className="text-slate-400 font-normal text-xs">(separados por coma)</span>
            </label>
            <input {...register('includes')} className="input" placeholder="Hotel 4 noches, Desayunos, Traslados" />
            {errors.includes && <p className="text-red-500 text-xs mt-1 font-body">{errors.includes.message}</p>}
          </div>

          {/* Excludes */}
          <div>
            <label className="label">
              No incluye <span className="text-slate-400 font-normal text-xs">(separados por coma)</span>
            </label>
            <input {...register('excludes')} className="input" placeholder="Tiquetes aéreos, Gastos personales" />
          </div>

          {/* Status + Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Estado</label>
              <select {...register('status')} className="input">
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="FULL">Lleno</option>
                <option value="CANCELLED">Cancelado</option>
                <option value="COMPLETED">Completado</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input {...register('isFeatured')} type="checkbox" id="featured" className="w-4 h-4 rounded accent-sky-500" />
              <label htmlFor="featured" className="text-sm font-semibold text-slate-700 font-body cursor-pointer">
                Destacar en home
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              <Save size={16} />
              {isSubmitting ? 'Guardando...' : trip ? 'Guardar cambios' : 'Crear viaje'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}