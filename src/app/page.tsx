'use client'

import { useState, useEffect } from 'react'
import { Event } from '@/types'
import EventCard from '@/components/EventCard'
import { useEventFilters } from '@/hooks/useEventFilters'
import api from '@/lib/axios'
import { toast } from 'react-toastify'

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const { filters, updateFilter, resetFilters, queryString } = useEventFilters()

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/events?${queryString}`)
      // Fix: Access the nested events array
      const eventsData = response.data?.data?.events || []
      setEvents(Array.isArray(eventsData) ? eventsData : [])
    } catch (error: any) {
      console.error('Error fetching events:', error)
      toast.error('Erro ao carregar eventos')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [queryString])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold gradient-text mb-4">
          Eventos Incríveis te Esperam! 🎉
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Descubra experiências únicas e conecte-se com pessoas extraordinárias
        </p>
      </div>
        
      {/* Modern Filters */}
      <div className="glass p-8 rounded-3xl border border-white/20 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-3">🔍</span>
          Encontre seu evento perfeito
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-3">
              🔎 Buscar
            </label>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Nome do evento..."
              className="w-full px-4 py-3 glass rounded-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-3">
              📅 Data Início
            </label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => updateFilter('startDate', e.target.value)}
              className="w-full px-4 py-3 glass rounded-xl border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-3">
              📅 Data Fim
            </label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => updateFilter('endDate', e.target.value)}
              className="w-full px-4 py-3 glass rounded-xl border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
            >
              🗑️ Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{animationDelay: '0.15s'}}></div>
          </div>
        </div>
      ) : !Array.isArray(events) || events.length === 0 ? (
        <div className="text-center py-20">
          <div className="glass p-12 rounded-3xl border border-white/20 max-w-md mx-auto">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-2xl font-bold text-white mb-2">Nenhum evento encontrado</h3>
            <p className="text-white/70">Que tal criar o primeiro evento incrível?</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <span className="mr-3">🎪</span>
              {events.length} {events.length === 1 ? 'Evento Disponível' : 'Eventos Disponíveis'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <div key={event.id} style={{animationDelay: `${index * 0.1}s`}} className="animate-fade-in">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
