'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import axios from '@/lib/axios'
import { Event } from '@/types'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, isAdmin } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventDate: '',
    maxCapacity: 0,
    location: '',
    onlineLink: '',
    isOnline: false
  })

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login')
      return
    }
    fetchEvent()
  }, [isAuthenticated, isAdmin, router, params.id])

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`/events/${params.id}`)
      console.log('Event data received:', response.data)
      const eventData = response.data.data
      setEvent(eventData)
      
      // Preencher formulário com dados do evento
      const eventDate = new Date(eventData.eventDate)
      setFormData({
        name: eventData.name,
        description: eventData.description,
        eventDate: format(eventDate, "yyyy-MM-dd'T'HH:mm"),
        maxCapacity: eventData.maxCapacity,
        location: eventData.location || '',
        onlineLink: eventData.onlineLink || '',
        isOnline: !!eventData.onlineLink
      })
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('Erro ao carregar evento')
      router.push('/admin/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
  
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Nome do evento é obrigatório')
        setSaving(false)
        return
      }
  
      if (!formData.description.trim()) {
        toast.error('Descrição do evento é obrigatória')
        setSaving(false)
        return
      }
  
      if (!formData.eventDate) {
        toast.error('Data do evento é obrigatória')
        setSaving(false)
        return
      }
  
      if (formData.maxCapacity < 1) {
        toast.error('Capacidade máxima deve ser maior que 0')
        setSaving(false)
        return
      }
  
      if (formData.isOnline && !formData.onlineLink.trim()) {
        toast.error('Link da reunião é obrigatório para eventos online')
        setSaving(false)
        return
      }
  
      if (!formData.isOnline && !formData.location.trim()) {
        toast.error('Local do evento é obrigatório para eventos presenciais')
        setSaving(false)
        return
      }
  
      // Validate date is in the future
      const eventDate = new Date(formData.eventDate)
      if (eventDate <= new Date()) {
        toast.error('A data do evento deve ser no futuro')
        setSaving(false)
        return
      }
  
      // Prepare update data - only include fields that have values
      const updateData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        eventDate: new Date(formData.eventDate).toISOString(),
        maxCapacity: Number(formData.maxCapacity)
      }
  
      // Only include location or onlineLink if they have values
      if (formData.isOnline && formData.onlineLink.trim()) {
        updateData.onlineLink = formData.onlineLink.trim()
        // Don't include location for online events
      } else if (!formData.isOnline && formData.location.trim()) {
        updateData.location = formData.location.trim()
        // Don't include onlineLink for in-person events
      }
  
      console.log('Sending update data:', updateData)
      
      const response = await axios.put(`/events/${params.id}`, updateData)
      console.log('Update response:', response.data)
      
      toast.success('Evento atualizado com sucesso!')
      router.push('/admin/dashboard')
    } catch (error: any) {
      console.error('Error updating event:', error)
      
      // Better error handling
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Dados inválidos'
        const details = error.response?.data?.details
        if (details && Array.isArray(details)) {
          toast.error(`Erro de validação: ${details.join(', ')}`)
        } else {
          toast.error(`Erro de validação: ${errorMessage}`)
        }
      } else if (error.response?.status === 404) {
        toast.error('Evento não encontrado')
      } else if (error.response?.status === 403) {
        toast.error('Você não tem permissão para editar este evento')
      } else {
        toast.error('Erro interno do servidor. Tente novamente.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando evento...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Evento não encontrado</h1>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4 text-center">
            ✏️ Editar Evento
          </h1>
          <p className="text-white/80 text-center text-lg">
            Modifique as informações do evento: {event.name}
          </p>
        </div>

        <div className="glass p-8 rounded-xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                Nome do Evento *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o nome do evento"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Descrição *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva o evento"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Data e Hora *
                </label>
                <input
                  type="datetime-local"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Capacidade Máxima *
                </label>
                <input
                  type="number"
                  name="maxCapacity"
                  value={formData.maxCapacity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 100"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isOnline"
                checked={formData.isOnline}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
              />
              <label className="text-white font-semibold">
                Evento Online
              </label>
            </div>

            {formData.isOnline ? (
              <div>
                <label className="block text-white font-semibold mb-2">
                  Link da Reunião *
                </label>
                <input
                  type="url"
                  name="onlineLink"
                  value={formData.onlineLink}
                  onChange={handleInputChange}
                  required={formData.isOnline}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://meet.google.com/..."
                />
              </div>
            ) : (
              <div>
                <label className="block text-white font-semibold mb-2">
                  Local do Evento *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required={!formData.isOnline}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Endereço do evento"
                />
              </div>
            )}

            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>

        {/* Informações do evento atual */}
        <div className="glass p-6 rounded-xl border border-white/20 mt-8">
          <h3 className="text-xl font-bold text-white mb-4">📊 Informações Atuais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
            <div>
              <strong>ID:</strong> {event.id}
            </div>
            <div>
              <strong>Criado em:</strong> {format(new Date(event.createdAt), 'dd/MM/yyyy HH:mm')}
            </div>
            <div>
              <strong>Última atualização:</strong> {format(new Date(event.updatedAt), 'dd/MM/yyyy HH:mm')}
            </div>
            <div>
              <strong>Vagas ocupadas:</strong> {event.maxCapacity - event.availableSpots}/{event.maxCapacity}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}