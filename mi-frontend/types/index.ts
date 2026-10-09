// ============================================================
//  CIELO — Shared TypeScript Types
// ============================================================

export type Role = 'CLIENT' | 'AGENT' | 'ADMIN'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED'
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'IN_PROCESS'
export type PaymentMethod  = 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'MERCADO_PAGO' | 'CASH'
export type TripStatus     = 'DRAFT' | 'PUBLISHED' | 'FULL' | 'CANCELLED' | 'COMPLETED'
export type PassengerType  = 'ADULT' | 'CHILD' | 'INFANT'

// ── Users ──────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  role: Role
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

// ── Destinations ───────────────────────────────────────────
export interface Destination {
  id: string
  name: string
  slug: string
  country: string
  city: string
  description: string
  coverImage: string
  images: string[]
  latitude?: number
  longitude?: number
  isActive: boolean
  createdAt: string
  _count?: { trips: number; reviews: number }
}

// ── Trips ──────────────────────────────────────────────────
export interface ItineraryItem {
  id: string
  day: number
  title: string
  description: string
  activities: string[]
  meals: string[]
  accommodation?: string
}

export interface Trip {
  id: string
  title: string
  slug: string
  description: string
  highlights: string[]
  includes: string[]
  excludes: string[]
  coverImage: string
  images: string[]
  departureDate: string
  returnDate: string
  durationDays: number
  price: number
  priceChild?: number
  capacity: number
  bookedSeats: number
  availableSeats: number
  status: TripStatus
  departureCity: string
  isFeatured: boolean
  createdAt: string
  destination: Destination
  itinerary?: ItineraryItem[]
  reviews?: Review[]
  _count?: { bookings: number; reviews: number }
}

// ── Bookings ───────────────────────────────────────────────
export interface Passenger {
  id: string
  firstName: string
  lastName: string
  documentType: string
  documentNumber: string
  birthDate: string
  type: PassengerType
  nationality?: string
  phone?: string
  email?: string
}

export interface Booking {
  id: string
  bookingCode: string
  status: BookingStatus
  totalAmount: number
  specialRequests?: string
  notes?: string
  confirmedAt?: string
  cancelledAt?: string
  cancellationReason?: string
  createdAt: string
  updatedAt: string
  userId: string
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>
  tripId: string
  trip: Trip
  passengers: Passenger[]
  payment?: Payment
}

// ── Payments ───────────────────────────────────────────────
export interface Payment {
  id: string
  amount: number
  currency: string
  status: PaymentStatus
  method?: PaymentMethod
  externalId?: string
  paidAt?: string
  createdAt: string
  bookingId: string
}

// ── Reviews ────────────────────────────────────────────────
export interface Review {
  id: string
  rating: number
  title?: string
  comment: string
  isPublished: boolean
  createdAt: string
  user: Pick<User, 'firstName' | 'lastName' | 'avatar'>
  tripId?: string
  destinationId?: string
}

// ── API Response wrappers ──────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: string
  path: string
}

export interface PaginatedResponse<T> {
  data: Record<string, T[]> & { meta: PaginationMeta }
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

// ── Auth ────────────────────────────────────────────────────
export interface AuthResponse {
  user: User
  access_token: string
}

// ── Query params ────────────────────────────────────────────
export interface TripFilters {
  page?: number
  limit?: number
  search?: string
  destinationId?: string
  departureCity?: string
  isFeatured?: boolean
  departureDateFrom?: string
  departureDateTo?: string
  priceMin?: number
  priceMax?: number
}
