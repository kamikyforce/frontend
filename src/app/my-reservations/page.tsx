'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import axios from '@/lib/axios'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Reservation {
  id: string
  eventId: string
  userId: string
  reservationDate: string
  status: 'CONFIRMED' | 'CANCELED'
  event: {
    id: string
    name: string
    description?: string
    eventDate: string
    location?: string
    onlineLink?: string
    maxCapacity: number
    availableSpots: number
  }
  createdAt: string
  updatedAt: string
}

export default function MyReservationsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchReservations()
  }, [isAuthenticated, router])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/my-reservations')
      setReservations(response.data.data || [])
    } catch (err: any) {
      console.error('Error fetching reservations:', err)
      setError(err.response?.data?.error || 'Erro ao carregar reservas')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return
    }

    try {
      await axios.delete(`/reservations/${reservationId}`)
      // Refresh reservations
      fetchReservations()
      alert('Reserva cancelada com sucesso!')
    } catch (err: any) {
      console.error('Error canceling reservation:', err)
      alert(err.response?.data?.error || 'Erro ao cancelar reserva')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500/20 text-green-300 border-green-400/30'
      case 'CANCELED':
        return 'bg-red-500/20 text-red-300 border-red-400/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '✅ Confirmada'
      case 'CANCELED':
        return '❌ Cancelada'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando suas reservas...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Erro ao carregar reservas</h1>
          <p className="text-blue-200 mb-4">{error}</p>
          <button 
            onClick={() => fetchReservations()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg mr-4"
          >
            Tentar novamente
          </button>
          <button 
            onClick={() => router.push('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🎫 Minhas Reservas</h1>
          <p className="text-blue-200">
            Gerencie suas reservas de eventos
          </p>
        </div>

        {reservations.length === 0 ? (
          <div className="bg-blue-800 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-2xl font-bold text-white mb-4">Nenhuma reserva encontrada</h2>
            <p className="text-blue-200 mb-6">
              Você ainda não fez nenhuma reserva. Que tal explorar nossos eventos?
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Explorar Eventos
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {reservations.map((reservation) => {
              const eventDate = new Date(reservation.event.eventDate)
              const isValidDate = !isNaN(eventDate.getTime())
              const isOnline = !!reservation.event.onlineLink
              const isPastEvent = isValidDate && eventDate < new Date()
              
              return (
                <div key={reservation.id} className="bg-blue-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {reservation.event.name}
                      </h3>
                      <div className="flex items-center space-x-4 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                          isOnline 
                            ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                            : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                        }`}>
                          {isOnline ? '🌐 Online' : '📍 Presencial'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(reservation.status)}`}>
                          {getStatusText(reservation.status)}
                        </span>
                        {isPastEvent && (
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-500/20 text-gray-300 border border-gray-400/30">
                            📅 Evento passado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {reservation.event.description && (
                    <p className="text-blue-100 mb-4 leading-relaxed">
                      {reservation.event.description}
                    </p>
                  )}

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-700 p-4 rounded-lg">
                      <h4 className="text-white font-semibold mb-2 flex items-center">
                        <span className="mr-2">📅</span>
                        Data do Evento
                      </h4>
                      <p className="text-blue-100">
                        {isValidDate 
                          ? format(eventDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
                          : reservation.event.eventDate || 'Data não disponível'
                        }
                      </p>
                    </div>

                    {reservation.event.location && (
                      <div className="bg-blue-700 p-4 rounded-lg">
                        <h4 className="text-white font-semibold mb-2 flex items-center">
                          <span className="mr-2">📍</span>
                          Local
                        </h4>
                        <p className="text-blue-100">{reservation.event.location}</p>
                      </div>
                    )}

                    {reservation.event.onlineLink && (
                      <div className="bg-blue-700 p-4 rounded-lg">
                        <h4 className="text-white font-semibold mb-2 flex items-center">
                          <span className="mr-2">🌐</span>
                          Link Online
                        </h4>
                        <a 
                          href={reservation.event.onlineLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:text-blue-200 underline break-all"
                        >
                          {reservation.event.onlineLink}
                        </a>
                      </div>
                    )}

                    <div className="bg-blue-700 p-4 rounded-lg">
                      <h4 className="text-white font-semibold mb-2 flex items-center">
                        <span className="mr-2">📝</span>
                        Reserva feita em
                      </h4>
                      <p className="text-blue-100">
                        {format(new Date(reservation.reservationDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => router.push(`/events/${reservation.event.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Ver Detalhes do Evento
                    </button>

                    {reservation.status === 'CONFIRMED' && !isPastEvent && (
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Cancelar Reserva
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}