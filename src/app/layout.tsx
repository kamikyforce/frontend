'use client'

import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Toast from '@/components/Toast'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)
  const { initializeAuth, isLoading } = useAuthStore()
  
  useEffect(() => {
    // Initialize auth state from persisted storage
    initializeAuth()
    setIsHydrated(true)
  }, [])
  
  // Show spinning loader during hydration to prevent flash
  if (!isHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-600">Carregando...</div>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Event Manager - Sistema de Gerenciamento de Eventos</title>
        <meta name="description" content="Plataforma para criação e gerenciamento de eventos com sistema de reservas" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Toast />
        </AuthProvider>
      </body>
    </html>
  )
}
