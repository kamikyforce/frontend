'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import axios from '@/lib/axios'
import { Event } from '@/types'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Reservation {
  id: string
  userId: string
  eventId: string
  reservationDate?: string
  reservedAt?: string
  createdAt?: string
  status?: string
  user?: {
    id: string
    firstName?: string
    lastName?: string
    name?: string
    email?: string
  }
}

export default function EventReservationsPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, isAdmin } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'date'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedReservations, setSelectedReservations] = useState<string[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login')
      return
    }
    fetchEventAndReservations()
  }, [isAuthenticated, isAdmin, router, params.id])

  useEffect(() => {
    filterAndSortReservations()
  }, [reservations, searchTerm, sortBy, sortOrder])

  const fetchEventAndReservations = async () => {
    try {
      // Buscar dados do evento
      const eventResponse = await axios.get(`/events/${params.id}`)
      setEvent(eventResponse.data.data)
  
      // Buscar reservas do evento
      const reservationsResponse = await axios.get(`/events/${params.id}/reservations`)
      console.log('Reservations from backend:', reservationsResponse.data.data)
      
      // Mapear os dados para o formato esperado pelo frontend
      const mappedReservations = (reservationsResponse.data.data || []).map((reservation: any) => ({
        ...reservation,
        reservedAt: reservation.reservationDate || reservation.reservedAt || reservation.createdAt,
        user: reservation.user ? {
          ...reservation.user,
          name: reservation.user.name || `${reservation.user.firstName || ''} ${reservation.user.lastName || ''}`.trim() || reservation.user.email
        } : null
      }))
      
      setReservations(mappedReservations)
    } catch (error: any) {
      console.error('Error fetching data:', error)
      if (error.response?.status === 404) {
        toast.error('Evento não encontrado')
      } else {
        toast.error('Erro ao carregar dados')
      }
      router.push('/admin/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortReservations = () => {
    let filtered = reservations.filter(reservation => {
      // Verificar se os dados do usuário existem antes de acessar
      const userName = reservation.user?.name || ''
      const userEmail = reservation.user?.email || ''
      
      return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    })

    filtered.sort((a, b) => {
      let aValue: string | Date
      let bValue: string | Date

      switch (sortBy) {
        case 'name':
          aValue = (a.user?.name || '').toLowerCase()
          bValue = (b.user?.name || '').toLowerCase()
          break
        case 'email':
          aValue = (a.user?.email || '').toLowerCase()
          bValue = (b.user?.email || '').toLowerCase()
          break
        case 'date':
          aValue = new Date(a.reservedAt || 0)
          bValue = new Date(b.reservedAt || 0)
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredReservations(filtered)
  }

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await axios.delete(`/reservations/${reservationId}`)
      toast.success('Reserva cancelada com sucesso!')
      fetchEventAndReservations()
      setShowConfirmDialog(false)
      setReservationToCancel(null)
    } catch (error: any) {
      console.error('Error canceling reservation:', error)
      toast.error(error.response?.data?.error || 'Erro ao cancelar reserva')
    }
  }

  const handleBulkCancel = async () => {
    if (selectedReservations.length === 0) {
      toast.warning('Selecione pelo menos uma reserva para cancelar')
      return
    }

    if (!confirm(`Tem certeza que deseja cancelar ${selectedReservations.length} reserva(s)?`)) {
      return
    }

    try {
      await Promise.all(
        selectedReservations.map(id => axios.delete(`/reservations/${id}`))
      )
      toast.success(`${selectedReservations.length} reserva(s) cancelada(s) com sucesso!`)
      setSelectedReservations([])
      fetchEventAndReservations()
    } catch (error: any) {
      console.error('Error canceling reservations:', error)
      toast.error('Erro ao cancelar algumas reservas')
    }
  }

  const toggleReservationSelection = (reservationId: string) => {
    setSelectedReservations(prev => 
      prev.includes(reservationId)
        ? prev.filter(id => id !== reservationId)
        : [...prev, reservationId]
    )
  }

  const toggleSelectAll = () => {
    setSelectedReservations(
      selectedReservations.length === filteredReservations.length
        ? []
        : filteredReservations.map(r => r.id)
    )
  }

  const exportToCSV = () => {
    if (filteredReservations.length === 0) {
      toast.warning('Não há reservas para exportar')
      return
    }

    const csvContent = [
      ['Nome', 'Email', 'Data da Reserva'].join(','),
      ...filteredReservations.map(reservation => [
        `"${reservation.user?.name || 'Nome não disponível'}"`,
        `"${reservation.user?.email || 'Email não disponível'}"`,
        `"${formatDate(reservation.reservedAt || '')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `reservas-${event?.name?.replace(/[^a-zA-Z0-9]/g, '-') || 'evento'}-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`${filteredReservations.length} reserva(s) exportada(s) para CSV`)
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString === '' || dateString === 'null' || dateString === 'undefined') {
      return 'Data não disponível'
    }
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Data inválida'
      }
      return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR })
    } catch (error) {
      console.error('Error formatting date:', dateString, error)
      return 'Data não disponível'
    }
  }

  const getOccupancyRate = () => {
    if (!event) return 0
    return Math.round(((event.maxCapacity - event.availableSpots) / event.maxCapacity) * 100)
  }

  const getOccupancyColor = () => {
    const rate = getOccupancyRate()
    if (rate >= 90) return 'text-red-400'
    if (rate >= 70) return 'text-yellow-400'
    return 'text-green-400'
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Carregando reservas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4 text-center">
            🎫 Reservas do Evento
          </h1>
          {event && (
            <div className="text-center">
              <h2 className="text-2xl text-white font-semibold mb-2">{event.name}</h2>
              <p className="text-white/80">
                {formatDate(event.eventDate)}
              </p>
            </div>
          )}
        </div>

        {/* Estatísticas Aprimoradas */}
        {event && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass p-6 rounded-xl border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total de Reservas</p>
                  <p className="text-3xl font-bold text-white">{reservations.length}</p>
                </div>
                <span className="text-4xl">🎫</span>
              </div>
            </div>
            
            <div className="glass p-6 rounded-xl border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Vagas Disponíveis</p>
                  <p className="text-3xl font-bold text-white">{event.availableSpots}</p>
                </div>
                <span className="text-4xl">🪑</span>
              </div>
            </div>
            
            <div className="glass p-6 rounded-xl border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Taxa de Ocupação</p>
                  <p className={`text-3xl font-bold ${getOccupancyColor()}`}>
                    {getOccupancyRate()}%
                  </p>
                </div>
                <span className="text-4xl">📊</span>
              </div>
            </div>

            <div className="glass p-6 rounded-xl border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Capacidade Máxima</p>
                  <p className="text-3xl font-bold text-white">{event.maxCapacity}</p>
                </div>
                <span className="text-4xl">👥</span>
              </div>
            </div>
          </div>
        )}

        {/* Controles de Busca e Filtros */}
        <div className="glass p-6 rounded-xl border border-white/20 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Lista de Reservas</h2>
            <div className="flex gap-4">
              {selectedReservations.length > 0 && (
                <button
                  onClick={handleBulkCancel}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  🗑️ Cancelar Selecionadas ({selectedReservations.length})
                </button>
              )}
              <button
                onClick={exportToCSV}
                disabled={filteredReservations.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                📥 Exportar CSV
              </button>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                ← Voltar ao Dashboard
              </button>
            </div>
          </div>

          {/* Busca e Ordenação */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'email' | 'date')}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Ordenar por Data</option>
                <option value="name">Ordenar por Nome</option>
                <option value="email">Ordenar por Email</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Resultados da busca */}
          {searchTerm && (
            <div className="mt-4 text-white/80">
              Mostrando {filteredReservations.length} de {reservations.length} reservas
            </div>
          )}
        </div>

        {/* Lista de Reservas */}
        <div className="glass p-6 rounded-xl border border-white/20">
          {filteredReservations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-white/80 text-lg">
                {searchTerm ? 'Nenhuma reserva encontrada para a busca' : 'Nenhuma reserva encontrada'}
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-blue-400 hover:text-blue-300 underline"
                >
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white font-semibold py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedReservations.length === filteredReservations.length && filteredReservations.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left text-white font-semibold py-3 px-4">Nome</th>
                    <th className="text-left text-white font-semibold py-3 px-4">Email</th>
                    <th className="text-left text-white font-semibold py-3 px-4">Data da Reserva</th>
                    <th className="text-left text-white font-semibold py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedReservations.includes(reservation.id)}
                          onChange={() => toggleReservationSelection(reservation.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-white font-medium">
                          {getUserDisplayName(reservation.user)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-white/80">
                          {reservation.user?.email || 'Email não disponível'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-white/80">
                          {formatDate(reservation.reservedAt || reservation.reservationDate)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => {
                            setReservationToCancel(reservation.id)
                            setShowConfirmDialog(true)
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          🗑️ Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Confirmação */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirmar Cancelamento</h3>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => {
                    setShowConfirmDialog(false)
                    setReservationToCancel(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => reservationToCancel && handleCancelReservation(reservationToCancel)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const getUserDisplayName = (user: Reservation['user']) => {
  if (!user) return 'Usuário não disponível'
  
  // Tentar diferentes campos de nome
  if (user.name) return user.name
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`
  if (user.firstName) return user.firstName
  if (user.email) return user.email.split('@')[0] // Usar parte do email como fallback
  
  return 'Nome não disponível'
}