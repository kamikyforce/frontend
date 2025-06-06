'use client'

import { Event } from '@/types'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.eventDate)
  const isOnline = !!event.onlineLink
  const spotsLeft = event.availableSpots
  const isFull = spotsLeft === 0

  return (
    <div className="glass rounded-2xl hover:scale-105 transition-all duration-300 border border-white/20 overflow-hidden group float">
      {/* Gradient header */}
      <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white group-hover:gradient-text transition-all duration-300 line-clamp-2">
            {event.name}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
            isOnline 
              ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
              : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
          }`}>
            {isOnline ? '🌐 Online' : '📍 Presencial'}
          </span>
        </div>

        {event.description && (
          <p className="text-white/80 text-sm mb-4 line-clamp-3 leading-relaxed">
            {event.description}
          </p>
        )}

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-white/90 glass px-3 py-2 rounded-lg">
            <span className="text-lg mr-3">📅</span>
            <span className="font-medium">
              {format(eventDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center text-sm text-white/90 glass px-3 py-2 rounded-lg">
              <span className="text-lg mr-3">📍</span>
              <span className="font-medium">{event.location}</span>
            </div>
          )}

          <div className="flex items-center text-sm glass px-3 py-2 rounded-lg">
            <span className="text-lg mr-3">👥</span>
            <span className={`font-semibold ${
              isFull ? 'text-red-300' : 'text-green-300'
            }`}>
              {spotsLeft} {spotsLeft === 1 ? 'vaga disponível' : 'vagas disponíveis'}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Link
            href={`/events/${event.id}`}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 shadow-lg flex items-center space-x-2"
          >
            <span>Ver detalhes</span>
            <span>✨</span>
          </Link>
          
          {isFull && (
            <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-bold border border-red-400/30 backdrop-blur-sm">
              🚫 Esgotado
            </span>
          )}
        </div>
      </div>
    </div>
  )
}