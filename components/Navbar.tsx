'use client'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, isLoading } = useAuth()
  const router = useRouter()

  // Debug logging for navbar state
  useEffect(() => {
    console.log('🧭 Navbar State:')
    console.log('Is Authenticated:', isAuthenticated)
    console.log('Is Admin:', isAdmin)
    console.log('Is Loading:', isLoading)
    console.log('User:', user)
  }, [isAuthenticated, isAdmin, isLoading, user])

  const handleLogout = () => {
    console.log('🚪 Logout button clicked')
    logout()
    router.push('/login')
  }

  // Show loading state
  if (isLoading) {
    return (
      <nav className="bg-blue-900 border-b border-blue-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-white hover:text-blue-300 transition-colors">
                ✨ Event Manager
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-blue-100">Loading...</span>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-blue-900 border-b border-blue-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white hover:text-blue-300 transition-colors">
              ✨ Event Manager
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/"
                  className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  🎉 Eventos
                </Link>
                <Link
                  href="/my-reservations"
                  className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  🎫 Minhas Reservas
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      href="/events/create"
                      className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      ➕ Criar Evento
                    </Link>
                    <Link
                      href="/admin/dashboard"
                      className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      👑 Admin Panel
                    </Link>
                  </>
                )}
                
                {/* User Profile Section */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-blue-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                      <span className="text-blue-100 font-semibold text-sm">
                        {user?.firstName?.charAt(0)?.toUpperCase() || '👤'}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-blue-200">
                        {user?.email}
                      </p>
                      {isAdmin && (
                        <p className="text-xs text-yellow-300 font-semibold">
                          👑 Admin
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2 shadow-lg"
                  >
                    <span>🚪</span>
                    <span>Sair</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <span>🔐</span>
                  <span>Login</span>
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <span>🚀</span>
                  <span>Registrar</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}