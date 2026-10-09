import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string, fmt = "d 'de' MMMM, yyyy") {
  return format(parseISO(date), fmt, { locale: es })
}

export function formatCurrency(amount: number, currency = 'COP') {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatShortDate(date: string) {
  return format(parseISO(date), "dd MMM", { locale: es })
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING:   'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
  REFUNDED:  'Reembolsada',
}

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-200',
  CONFIRMED: 'bg-green-50 text-green-700 border border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
  COMPLETED: 'bg-sky-50 text-sky-700 border border-sky-200',
  REFUNDED:  'bg-slate-50 text-slate-600 border border-slate-200',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING:    'Pendiente',
  APPROVED:   'Aprobado',
  REJECTED:   'Rechazado',
  REFUNDED:   'Reembolsado',
  IN_PROCESS: 'En proceso',
}
