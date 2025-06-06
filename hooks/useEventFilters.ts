import { useState, useMemo } from 'react'
import { EventFilters } from '@/types'

export const useEventFilters = () => {
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    startDate: '',
    endDate: '',
    location: '',
    page: 1,
    limit: 10,
  })

  const updateFilter = (key: keyof EventFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      startDate: '',
      endDate: '',
      location: '',
      page: 1,
      limit: 10,
    })
  }

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.append(key, value.toString())
      }
    })
    
    return params.toString()
  }, [filters])

  return {
    filters,
    updateFilter,
    resetFilters,
    queryString,
  }
}