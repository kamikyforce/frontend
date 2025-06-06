import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthResponse, LoginRequest, RegisterRequest } from '@/types'
import api from '@/lib/axios'
import { initSocket, disconnectSocket } from '@/lib/socket'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  initializeAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      initializeAuth: () => {
        console.log('🔄 Initializing auth state...')
        const state = get()
        console.log('Current state:', state)
        
        // Don't reset the state if we have valid data
        if (state.token && state.user) {
          console.log('✅ Valid auth state found, keeping user logged in')
          // Just initialize socket, don't change the state
          initSocket(state.token)
          return
        }
        
        // Only clear state if both are missing
        if (!state.token && !state.user) {
          console.log('❌ No auth data found')
          set({ user: null, token: null })
        }
      },

      login: async (credentials: LoginRequest) => {
        console.log('🔐 Starting login process...')
        console.log('Login credentials:', credentials)
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', credentials)
          console.log('📡 Full API response:', response.data)
          
          // Handle the correct API response format
          let user, token
          
          if (response.data.success && response.data.data) {
            // Backend returns: { success: true, data: { user: {...}, token: "..." } }
            user = response.data.data.user
            token = response.data.data.token
            console.log('✅ Using nested data format')
          } else if (response.data.user && response.data.token) {
            // Direct format: { user: {...}, token: "..." }
            user = response.data.user
            token = response.data.token
            console.log('✅ Using direct format')
          } else {
            console.error('❌ Unexpected API response format:', response.data)
            throw new Error('Invalid response format from server')
          }
          
          console.log('✅ Login successful!')
          console.log('User data:', user)
          console.log('Token received:', !!token)
          console.log('User role:', user?.role)
          
          if (!user || !token) {
            throw new Error('Missing user data or token in response')
          }
          
          set({ user, token, isLoading: false })
          
          // Inicializar socket
          initSocket(token)
          
          // Salvar token no cookie
          document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 dias
        } catch (error) {
          console.error('❌ Login failed:', error)
          set({ isLoading: false, user: null, token: null })
          throw error
        }
      },

      register: async (userData: RegisterRequest) => {
        console.log('📝 Starting registration process...')
        console.log('Registration data:', userData)
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/register', userData)
          console.log('📡 Full API response:', response.data)
          
          // Handle the correct API response format
          let user, token
          
          if (response.data.success && response.data.data) {
            // Backend returns: { success: true, data: { user: {...}, token: "..." } }
            user = response.data.data.user
            token = response.data.data.token
            console.log('✅ Using nested data format')
          } else if (response.data.user && response.data.token) {
            // Direct format: { user: {...}, token: "..." }
            user = response.data.user
            token = response.data.token
            console.log('✅ Using direct format')
          } else {
            console.error('❌ Unexpected API response format:', response.data)
            throw new Error('Invalid response format from server')
          }
          
          console.log('✅ Registration successful!')
          console.log('User data:', user)
          console.log('Token received:', !!token)
          console.log('User role:', user?.role)
          
          if (!user || !token) {
            throw new Error('Missing user data or token in response')
          }
          
          set({ user, token, isLoading: false })
          
          // Inicializar socket
          initSocket(token)
          
          // Salvar token no cookie
          document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 dias
        } catch (error) {
          console.error('❌ Registration failed:', error)
          set({ isLoading: false, user: null, token: null })
          throw error
        }
      },

      logout: () => {
        console.log('🚪 Logging out user...')
        const currentState = get()
        console.log('Current user before logout:', currentState.user)
        
        set({ user: null, token: null })
        
        // Desconectar socket
        disconnectSocket()
        
        // Remover cookie
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        
        console.log('✅ Logout completed')
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const response = await api.put<User>('/auth/profile', data)
          console.log('✅ Profile updated:', response.data)
          set({ user: response.data })
        } catch (error) {
          console.error('❌ Profile update failed:', error)
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        token: state.token 
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Rehydrating auth storage...')
        if (state) {
          console.log('Rehydrated state:', state)
          // Ensure we don't have undefined values
          if (state.user === undefined) {
            state.user = null
          }
          if (state.token === undefined) {
            state.token = null
          }
          // Don't call initializeAuth here - let useAuth handle it
        }
      },
      // Add this to ensure proper hydration
      skipHydration: false,
    }
  )
)