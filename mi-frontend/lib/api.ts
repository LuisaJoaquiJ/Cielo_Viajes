import axios, { AxiosError } from 'axios'
import Cookies from 'js-cookie'
import type {
  ApiResponse, AuthResponse, User, Trip, Destination,
  Booking, Payment, Review, TripFilters,
} from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

// ── Axios instance ─────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token')  // 👈 nombre correcto
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message: string }>) => {
    const msg = error.response?.data?.message ?? error.message

    if (error.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('access_token')
      window.location.href = '/login'
    }

    return Promise.reject(new Error(Array.isArray(msg) ? msg[0] : msg))
  },
)

// Helper to unwrap the { success, data } envelope
async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}

// ── Auth ────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    unwrap<AuthResponse>(api.post('/auth/login', { email, password })),

  register: (body: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    unwrap<AuthResponse>(api.post('/auth/register', body)),

  me: () => unwrap<User>(api.get('/auth/me')),

  changePassword: (currentPassword: string, newPassword: string) =>
    unwrap<{ message: string }>(api.patch('/auth/change-password', { currentPassword, newPassword })),
}

// ── Trips ────────────────────────────────────────────────────
export const tripsApi = {
  list: (filters?: TripFilters) =>
    api.get<ApiResponse<{ trips: Trip[]; meta: any }>>('/trips', { params: filters })
      .then(r => r.data.data),

  featured: () =>
    api.get<ApiResponse<Trip[]>>('/trips/featured').then(r => r.data.data),

  bySlug: (slug: string) =>
    unwrap<Trip>(api.get(`/trips/slug/${slug}`)),

  byId: (id: string) =>
    unwrap<Trip>(api.get(`/trips/${id}`)),

  adminList: (filters?: TripFilters) =>
    api.get<ApiResponse<{ trips: Trip[]; meta: any }>>('/trips/admin/all', { params: filters })
      .then(r => r.data.data),

  create: (body: Partial<Trip>) =>

    unwrap<Trip>(api.post('/trips', body)),


  update: (id: string, body: Partial<Trip>) =>
    unwrap<Trip>(api.patch(`/trips/${id}`, body)),

  remove: (id: string) =>
    unwrap<{ message: string }>(api.delete(`/trips/${id}`)),
}

// ── Destinations ─────────────────────────────────────────────
export const destinationsApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<{ destinations: Destination[]; meta: any }>>('/destinations', { params })
      .then(r => r.data.data),

  bySlug: (slug: string) =>
    unwrap<Destination>(api.get(`/destinations/slug/${slug}`)),

  byId: (id: string) =>
    unwrap<Destination>(api.get(`/destinations/${id}`)),

  create: (body: Partial<Destination>) =>
    unwrap<Destination>(api.post('/destinations', body)),

  update: (id: string, body: Partial<Destination>) =>
    unwrap<Destination>(api.patch(`/destinations/${id}`, body)),

  remove: (id: string) =>
    unwrap<{ message: string }>(api.delete(`/destinations/${id}`)),
}

// ── Bookings ─────────────────────────────────────────────────
export const bookingsApi = {
  my: () =>
    api.get<ApiResponse<Booking[]>>('/bookings/my').then(r => r.data.data),

  byId: (id: string) =>
    unwrap<Booking>(api.get(`/bookings/${id}`)),

  create: (body: { tripId: string; clientUserId?: string; passengers: any[]; specialRequests?: string }) =>
    unwrap<Booking>(api.post('/bookings', body)),

  cancel: (id: string, reason?: string) =>
    unwrap<Booking>(api.patch(`/bookings/${id}/cancel`, { reason })),

  // api.ts — reemplaza adminList en paymentsApi
  adminList: (params?: { page?: number; limit?: number; status?: string }) =>
  api.get<ApiResponse<{ bookings: Booking[]; meta: any }>>('/bookings', { params })
    .then(r => r.data.data),

  update: (id: string, body: { status?: string; notes?: string }) =>
    unwrap<Booking>(api.patch(`/bookings/${id}`, body)),
}

// ── Payments ──────────────────────────────────────────────────
export const paymentsApi = {
  my: () =>
    api.get<ApiResponse<Payment[]>>('/payments/my').then(r => r.data.data),

  initiate: (bookingId: string, method: string) =>
    unwrap<any>(api.post('/payments/initiate', { bookingId, method })),

  adminList: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ payments: Payment[]; meta: any }>>('/payments', { params })
      .then(r => r.data.data),

  refund: (id: string) =>
    unwrap<Payment>(api.patch(`/payments/${id}/refund`, {})),
}

// ── Users (Admin) ─────────────────────────────────────────────
export const usersApi = {
  adminList: (params?: { page?: number; limit?: number; role?: string }) =>
    api.get<ApiResponse<{ users: User[]; meta: any }>>('/users', { params })
      .then(r => r.data.data),
  adminCreate: (body: { firstName: string; lastName: string; email: string; password: string; phone?: string; role?: string }) =>
    unwrap<User>(api.post('/users', body)),
  updateProfile: (body: Partial<User>) =>
    unwrap<User>(api.patch('/users/me/profile', body)),
  // ✅ agregar
  search: (query: string) =>
    api.get<ApiResponse<{ users: User[]; meta: any }>>('/users', { params: { search: query, limit: 5 } })
      .then(r => r.data.data),

  adminUpdate: (id: string, body: Partial<User>) =>
    unwrap<User>(api.patch(`/users/${id}`, body)),

  adminRemove: (id: string) =>
    unwrap<{ message: string }>(api.delete(`/users/${id}`)),
}

// ── Reviews ───────────────────────────────────────────────────
export const reviewsApi = {
  byTrip: (tripId: string) =>
    api.get<ApiResponse<Review[]>>(`/reviews/trip/${tripId}`).then(r => r.data.data),

  create: (body: { rating: number; comment: string; title?: string; tripId?: string }) =>
    unwrap<Review>(api.post('/reviews', body)),
}
// ── Leads ─────────────────────────────────────────────────
export const leadsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ leads: any[]; meta: any }>>('/leads', { params })
      .then(r => r.data.data),

  adminList: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<{ leads: any[]; meta: any }>>('/leads/admin/all', { params })
      .then(r => r.data.data),

  // ✅ sin unwrap — el backend devuelve el lead directo
  updateStatus: (id: string, status: string) =>
    api.patch(`/leads/${id}`, { status }).then(r => r.data),
}

// ── Refunds ───────────────────────────────────────────────
export const refundsApi = {
  list: (params?: { page?: number; limit?: number; search?: string; status?: string; airline?: string }) =>
    api.get<ApiResponse<{ refunds: any[]; meta: any }>>('/refunds', { params }).then(r => r.data.data),

  stats: () =>
    api.get<ApiResponse<any>>('/refunds/stats').then(r => r.data.data),

  byId: (id: string) =>
    unwrap<any>(api.get(`/refunds/${id}`)),

  create: (body: any) =>
    unwrap<any>(api.post('/refunds', body)),

  update: (id: string, body: any) =>
    unwrap<any>(api.patch(`/refunds/${id}`, body)),

  remove: (id: string) =>
    unwrap<any>(api.delete(`/refunds/${id}`)),

  addSegment: (id: string, body: any) =>
    unwrap<any>(api.post(`/refunds/${id}/segments`, body)),

  removeSegment: (id: string, segmentId: string) =>
    unwrap<any>(api.delete(`/refunds/${id}/segments/${segmentId}`)),

  uploadFile: (id: string, file: File, fileType: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('fileType', fileType)
    return api.post(`/refunds/${id}/files`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  removeFile: (id: string, fileId: string) =>
    unwrap<any>(api.delete(`/refunds/${id}/files/${fileId}`)),

  downloadFile: (id: string, fileId: string) =>
    `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/refunds/${id}/files/${fileId}/download`,
}
export default api