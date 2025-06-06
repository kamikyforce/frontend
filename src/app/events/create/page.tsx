'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useForm } from 'react-hook-form'
import axios from '@/lib/axios'
import { toast } from 'react-toastify'
import { CreateEventRequest } from '@/types'

export default function CreateEventPage() {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventRequest>()

  if (!isAuthenticated || !isAdmin) {
    router.push('/login')
    return null
  }

  const onSubmit = async (data: CreateEventRequest) => {
    setIsLoading(true)
    try {
      await axios.post('/events', data)
      toast.success('Evento criado com sucesso!')
      router.push('/admin/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar evento')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="glass rounded-3xl border border-white/20 p-8">
          <h1 className="text-3xl font-bold gradient-text mb-8 text-center">
            ➕ Criar Novo Evento
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-3">
                📝 Nome do Evento *
              </label>
              <input
                {...register('name', { required: 'Nome é obrigatório' })}
                type="text"
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Digite o nome do evento..."
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-3">
                📄 Descrição
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                placeholder="Descreva o evento..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-3">
                📅 Data e Hora *
              </label>
              <input
                {...register('eventDate', { required: 'Data é obrigatória' })}
                type="datetime-local"
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              {errors.eventDate && (
                <p className="mt-1 text-sm text-red-400">{errors.eventDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-3">
                📍 Local (Presencial)
              </label>
              <input
                {...register('location')}
                type="text"
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Endereço do evento..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-3">
                🌐 Link Online
              </label>
              <input
                {...register('onlineLink')}
                type="url"
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-3">
                👥 Capacidade Máxima *
              </label>
              <input
                {...register('maxCapacity', { 
                  required: 'Capacidade é obrigatória',
                  min: { value: 1, message: 'Capacidade deve ser pelo menos 1' }
                })}
                type="number"
                min="1"
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Ex: 100"
              />
              {errors.maxCapacity && (
                <p className="mt-1 text-sm text-red-400">{errors.maxCapacity.message}</p>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                ❌ Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? '⏳ Criando...' : '✅ Criar Evento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}