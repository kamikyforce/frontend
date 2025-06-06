export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'USER' | 'ADMIN'
  createdAt: string
}

export interface Event {
  id: string
  name: string
  description?: string
  eventDate: string
  location?: string
  onlineLink?: string
  maxCapacity: number
  availableSpots: number
  price?: number  // Add this line
  creatorId: string
  creator?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  _count?: {
    reservations: number
  }
  createdAt: string
  updatedAt: string
}

export interface Reservation {
  id: string
  eventId: string
  userId: string
  reservationDate: string
  status: 'CONFIRMED' | 'CANCELED'
  event: Event
  user?: User
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface CreateEventRequest {
  name: string
  description?: string
  eventDate: string
  location?: string
  onlineLink?: string
  maxCapacity: number
}

export interface EventFilters {
  search?: string
  startDate?: string
  endDate?: string
  location?: string
  page?: number
  limit?: number
}