'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Event } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '@/hooks/useAuth'
import axios from '@/lib/axios'
import { generateGoogleCalendarLink, generateICalLink } from '@/utils/calendar'
import { toast } from 'react-toastify'

export default function EventDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isRegistering, setIsRegistering] = useState(false)

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`/events/${params.id}`)
                console.log('Event data received:', response.data)
                console.log('Event date value:', response.data.data.eventDate)
                console.log('Event date type:', typeof response.data.data.eventDate)
                setEvent(response.data.data)
            } catch (err) {
                setError('Evento não encontrado')
                console.error('Error fetching event:', err)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchEvent()
        }
    }, [params.id])

    const handleRegister = async () => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        setIsRegistering(true)
        try {
            await axios.post(`/events/${params.id}/reserve`)
            // Fix: Use the same data structure as the initial fetch
            const response = await axios.get(`/events/${params.id}`)
            setEvent(response.data.data) // Fix: use response.data.data instead of response.data
            toast.success('Reserva realizada com sucesso!')
        } catch (err: any) {
            console.error('Error registering for event:', err)
            toast.error(err.response?.data?.error || 'Erro ao fazer reserva')
        } finally {
            setIsRegistering(false)
        }
    }

    const handleDownloadICal = () => {
        if (!event || !isEventDateValid) return
        try {
            const icalLink = generateICalLink(event)
            const link = document.createElement('a')
            link.href = icalLink
            link.download = `${event.name}.ics`
            link.click()
        } catch (error) {
            console.error('Error generating iCal:', error)
            toast.error('Erro ao gerar arquivo de calendário')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-blue-900 flex items-center justify-center">
                <div className="text-white text-xl">Carregando...</div>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-blue-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">404 - Evento não encontrado</h1>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                        Voltar para Home
                    </button>
                </div>
            </div>
        )
    }

    // Enhanced date validation with logging
    const isValidDate = (dateString: string | null | undefined): boolean => {
        console.log('Validating date:', dateString)
        if (!dateString || dateString === '' || dateString === 'null' || dateString === 'undefined') {
            console.log('Date is null, undefined, or empty')
            return false
        }
        
        const date = new Date(dateString)
        const isValid = !isNaN(date.getTime())
        console.log('Date validation result:', isValid, 'Parsed date:', date)
        return isValid
    }

    const isEventDateValid = isValidDate(event.eventDate)
    console.log('Final date validation:', isEventDateValid)
    
    // Only create Date object if valid
    const eventDate = isEventDateValid ? new Date(event.eventDate) : null
    const isOnline = !!event.onlineLink
    const spotsLeft = event.availableSpots
    const isFull = spotsLeft === 0

    return (
        <div className="min-h-screen bg-blue-900 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <button
                    onClick={() => router.back()}
                    className="mb-6 text-blue-300 hover:text-white flex items-center space-x-2"
                >
                    <span>←</span>
                    <span>Voltar</span>
                </button>

                <div className="glass rounded-3xl border border-white/20 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>

                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <h1 className="text-4xl font-bold gradient-text">
                                {event.name}
                            </h1>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${
                                isOnline
                                    ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                                    : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                            }`}>
                                {isOnline ? '🌐 Online' : '📍 Presencial'}
                            </span>
                        </div>

                        {event.description && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-white mb-3">📝 Descrição</h2>
                                <p className="text-white/80 leading-relaxed glass p-4 rounded-xl">
                                    {event.description}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="glass p-6 rounded-xl">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <span className="mr-3">📅</span>
                                    Data e Hora
                                </h3>
                                <p className="text-white/90 text-lg">
                                    {isEventDateValid && eventDate ? 
                                        format(eventDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }) : 
                                        `Data inválida (${event.eventDate})`
                                    }
                                </p>
                            </div>

                            <div className="glass p-6 rounded-xl">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <span className="mr-3">👥</span>
                                    Vagas
                                </h3>
                                <p className={`text-lg font-semibold ${
                                    isFull ? 'text-red-300' : 'text-green-300'
                                }`}>
                                    {spotsLeft} {spotsLeft === 1 ? 'vaga disponível' : 'vagas disponíveis'}
                                </p>
                                <p className="text-white/60 text-sm mt-1">
                                    Capacidade máxima: {event.maxCapacity}
                                </p>
                            </div>

                            {event.location && (
                                <div className="glass p-6 rounded-xl">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                        <span className="mr-3">📍</span>
                                        Local
                                    </h3>
                                    <p className="text-white/90">{event.location}</p>
                                </div>
                            )}

                            {event.onlineLink && (
                                <div className="glass p-6 rounded-xl">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                        <span className="mr-3">🌐</span>
                                        Link Online
                                    </h3>
                                    <a
                                        href={event.onlineLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-300 hover:text-blue-200 underline break-all"
                                    >
                                        {event.onlineLink}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Calendar Links - Only show if date is valid */}
                        {isEventDateValid && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <span className="mr-3">📅</span>
                                    Adicionar ao Calendário
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    <a
                                        href={generateGoogleCalendarLink(event)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                                    >
                                        <span>📅</span>
                                        <span>Google Calendar</span>
                                    </a>
                                    <button
                                        onClick={handleDownloadICal}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                                    >
                                        <span>📥</span>
                                        <span>Download iCal</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Registration Button */}
                        <div className="text-center">
                            {isFull ? (
                                <div className="bg-red-500/20 text-red-300 px-6 py-4 rounded-xl border border-red-400/30 backdrop-blur-sm">
                                    <span className="text-2xl mr-3">🚫</span>
                                    <span className="font-semibold">Evento Esgotado</span>
                                </div>
                            ) : (
                                <button
                                    onClick={handleRegister}
                                    disabled={isRegistering || !isAuthenticated}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isRegistering ? (
                                        <span className="flex items-center space-x-2">
                                            <span>⏳</span>
                                            <span>Processando...</span>
                                        </span>
                                    ) : !isAuthenticated ? (
                                        <span className="flex items-center space-x-2">
                                            <span>🔐</span>
                                            <span>Faça login para reservar</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center space-x-2">
                                            <span>🎫</span>
                                            <span>Reservar Vaga</span>
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}