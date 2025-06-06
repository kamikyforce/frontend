'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import axios from '@/lib/axios'
import { toast } from 'react-toastify'

interface EventReport {
  id: string
  name: string
  maxCapacity: number
  availableSpots: number
  reservedSpots: number
  occupancyRate: number
  eventDate: string
}

export default function AdminReports() {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<EventReport[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    totalEvents: 0,
    totalCapacity: 0,
    totalReserved: 0,
    averageOccupancy: 0
  })

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login')
      return
    }
    fetchReports()
  }, [isAuthenticated, isAdmin, router])

  const fetchReports = async () => {
    try {
      const response = await axios.get('/admin/reports/occupancy')
      const data = response.data.data || []
      setReports(data)
      
      // Calculate summary
      const totalEvents = data.length
      const totalCapacity = data.reduce((sum: number, event: EventReport) => sum + event.maxCapacity, 0)
      const totalReserved = data.reduce((sum: number, event: EventReport) => sum + event.reservedSpots, 0)
      const averageOccupancy = totalEvents > 0 ? (totalReserved / totalCapacity) * 100 : 0
      
      setSummary({
        totalEvents,
        totalCapacity,
        totalReserved,
        averageOccupancy
      })
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Erro ao carregar relatórios')
    } finally {
      setLoading(false)
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
            📊 Relatórios de Ocupação
          </h1>
          <p className="text-white/80 text-center text-lg">
            Análise detalhada da ocupação dos eventos
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total de Eventos</p>
                <p className="text-3xl font-bold text-white">{summary.totalEvents}</p>
              </div>
              <span className="text-4xl">🎉</span>
            </div>
          </div>
          
          <div className="glass p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Capacidade Total</p>
                <p className="text-3xl font-bold text-white">{summary.totalCapacity}</p>
              </div>
              <span className="text-4xl">👥</span>
            </div>
          </div>
          
          <div className="glass p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Reservado</p>
                <p className="text-3xl font-bold text-white">{summary.totalReserved}</p>
              </div>
              <span className="text-4xl">🎫</span>
            </div>
          </div>
          
          <div className="glass p-6 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Ocupação Média</p>
                <p className="text-3xl font-bold text-white">{summary.averageOccupancy.toFixed(1)}%</p>
              </div>
              <span className="text-4xl">📈</span>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="glass p-6 rounded-xl border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">📋 Detalhes por Evento</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-white text-xl">Carregando relatórios...</div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-white/80 text-lg">Nenhum relatório encontrado</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white font-semibold py-3 px-4">Evento</th>
                    <th className="text-left text-white font-semibold py-3 px-4">Capacidade</th>
                    <th className="text-left text-white font-semibold py-3 px-4">Reservado</th>
                    <th className="text-left text-white font-semibold py-3 px-4">Disponível</th>
                    <th className="text-left text-white font-semibold py-3 px-4">Ocupação</th>
                    <th className="text-left text-white font-semibold py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => {
                    const getOccupancyColor = (rate: number) => {
                      if (rate >= 90) return 'text-red-300'
                      if (rate >= 70) return 'text-yellow-300'
                      if (rate >= 50) return 'text-blue-300'
                      return 'text-green-300'
                    }
                    
                    const getStatusColor = (rate: number) => {
                      if (rate >= 100) return 'bg-red-500/20 text-red-300 border-red-400/30'
                      if (rate >= 90) return 'bg-orange-500/20 text-orange-300 border-orange-400/30'
                      if (rate >= 70) return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
                      return 'bg-green-500/20 text-green-300 border-green-400/30'
                    }
                    
                    const getStatusText = (rate: number) => {
                      if (rate >= 100) return '🔴 Esgotado'
                      if (rate >= 90) return '🟠 Quase Cheio'
                      if (rate >= 70) return '🟡 Boa Ocupação'
                      return '🟢 Disponível'
                    }
                    
                    return (
                      <tr key={report.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <p className="text-white font-medium">{report.name}</p>
                        </td>
                        <td className="py-4 px-4 text-white/80">
                          {report.maxCapacity}
                        </td>
                        <td className="py-4 px-4 text-white/80">
                          {report.reservedSpots}
                        </td>
                        <td className="py-4 px-4 text-white/80">
                          {report.availableSpots}
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className={`font-semibold ${getOccupancyColor(report.occupancyRate)}`}>
                              {report.occupancyRate.toFixed(1)}%
                            </p>
                            <div className="w-full bg-white/20 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${
                                  report.occupancyRate >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                  report.occupancyRate >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                  'bg-gradient-to-r from-green-500 to-blue-500'
                                }`}
                                style={{ width: `${Math.min(report.occupancyRate, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(report.occupancyRate)}`}>
                            {getStatusText(report.occupancyRate)}
                          </span>
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