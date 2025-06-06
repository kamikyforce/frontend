'use client'
import { useAuthStore } from '@/store/auth'
import { useEffect, useState } from 'react'
import { initSocket } from '@/lib/socket'

export const useAuth = () => {
  const { user, token, isLoading, login, register, logout, updateProfile, initializeAuth } = useAuthStore()
  const [hasInitialized, setHasInitialized] = useState(false)

  // Initialize auth state on mount - ONLY ONCE
  useEffect(() => {
    if (!hasInitialized) {
      console.log('🚀 useAuth hook mounted, initializing...')
      initializeAuth()
      setHasInitialized(true)
    }
  }, [hasInitialized, initializeAuth])

  // Console logging for debugging
  useEffect(() => {
    if (hasInitialized) {
      console.log('🔍 Auth State Debug:')
      console.log('User:', user)
      console.log('User type:', typeof user)
      console.log('Token:', token ? 'Present' : 'Missing')
      console.log('Is Loading:', isLoading)
      console.log('Is Authenticated:', !!user && !!token)
      console.log('Is Admin:', user?.role === 'ADMIN')
      console.log('User Role:', user?.role)
    }
  }, [user, token, isLoading, hasInitialized])

  useEffect(() => {
    // Initialize socket if we have token and user
    if (token && user && hasInitialized && !isLoading) {
      console.log('🔌 Initializing socket with token')
      initSocket(token)
    }
  }, [token, user, hasInitialized, isLoading])

  return {
    user: user || null,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    updateProfile,
  }
}