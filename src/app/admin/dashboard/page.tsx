'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import axios from '@/lib/axios'
import Link from 'next/link'
import { Event } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'react-toastify'

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalReservations: 0,
    upcomingEvents: 0
  })

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login')
      return
    }
    fetchEvents()
  }, [isAuthenticated, isAdmin, router])

  const fetchEvents = async () => {
    try {
      // Usar endpoint correto /events
      const response = await axios.get('/events')
      console.log('Events response:', response.data)
      
      // Corrigir acesso aos dados aninhados
      const eventsData = response.data?.data?.events || []
      setEvents(Array.isArray(eventsData) ? eventsData : [])
      
      // Calcular estatísticas a partir dos eventos
      calculateStats(eventsData)
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Erro ao carregar eventos')
      setEvents([])
      setStats({ totalEvents: 0, totalReservations: 0, upcomingEvents: 0 })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (eventsData: Event[]) => {
    const now = new Date()
    const upcomingEvents = eventsData.filter((event: Event) => new Date(event.eventDate) > now)
    
    // Calcular total de reservas baseado nas vagas ocupadas
    const totalReservations = eventsData.reduce((sum: number, event: Event) => {
      const occupiedSpots = event.maxCapacity - event.availableSpots
      return sum + occupiedSpots
    }, 0)
    
    setStats({
      totalEvents: eventsData.length,
      totalReservations,
      upcomingEvents: upcomingEvents.length
    })
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) {
      return
    }

    try {
      await axios.delete(`/events/${eventId}`)
      toast.success('Evento excluído com sucesso!')
      fetchEvents() // Recarregar eventos após exclusão
    } catch (error: any) {
      console.error('Error deleting event:', error)
      toast.error(error.response?.data?.error || 'Erro ao excluir evento')
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-blue-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4 text-center">
            👑 Painel Administrativo
          </h1>
          <p className="text-white/80 text-center text-lg">
            Gerencie eventos e visualize estatísticas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total de Eventos</p>
                <p className="text-3xl font-bold text-white">{stats.totalEvents}</p>
              </div>
              <span className="text-4xl">🎉</span>
            </div>
          </div>
          
          <div className="glass p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total de Reservas</p>
                <p className="text-3xl font-bold text-white">{stats.totalReservations}</p>
              </div>
              <span className="text-4xl">🎫</span>
            </div>
          </div>
          
          <div className="glass p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Eventos Futuros</p>
                <p className="text-3xl font-bold text-white">{stats.upcomingEvents}</p>
              </div>
              <span className="text-4xl">📅</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass p-6 rounded-xl border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">🚀 Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/events/create"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg text-center"
            >
              ➕ Criar Evento
            </Link>
            <button
              onClick={() => toast.info('Funcionalidade em desenvolvimento')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg text-center"
            >
              📊 Relatórios
            </button>
            <button
              onClick={() => toast.info('Funcionalidade em desenvolvimento')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg text-center"
            >
              👥 Usuários
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="glass p-6 rounded-xl border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">📋 Todos os Eventos</h2>
            <Link
              href="/events/create"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
            >
              ➕ Novo Evento
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-white text-xl">Carregando eventos...</div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-white/80 text-lg">Nenhum evento encontrado</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white font-semibold py-3 px-4">Nome</th>
                    <th className="text-left text-white font-semibold py-3 px-4">Data</th>
                    <th className="text-left text-white font-semibold py-3 px-4">Vagas</th>
                    <th className="text-left text-white font-semibold py-3 px-4">Status</th>
                    <th className="text-left text-white font-semibold py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const eventDate = new Date(event.eventDate)
                    const isUpcoming = eventDate > new Date()
                    const occupancyRate = ((event.maxCapacity - event.availableSpots) / event.maxCapacity) * 100
                    
                    return (
                      <tr key={event.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white font-medium">{event.name}</p>
                            <p className="text-white/60 text-sm">{event.location || event.onlineLink || 'Local não definido'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-white/80">
                          {format(eventDate, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white">{event.availableSpots}/{event.maxCapacity}</p>
                            <div className="w-full bg-white/20 rounded-full h-2 mt-1">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" 
                                style={{ width: `${occupancyRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isUpcoming 
                              ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                              : 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
                          }`}>
                            {isUpcoming ? '🟢 Ativo' : '🔴 Finalizado'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Link
                              href={`/events/${event.id}`}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              👁️ Ver
                            </Link>
                            <Link
                              href={`/admin/events/${event.id}/edit`}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              ✏️ Editar
                            </Link>
                            <Link
                              href={`/admin/events/${event.id}/reservations`}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              🎫 Reservas
                            </Link>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              🗑️ Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}