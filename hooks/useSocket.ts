import { useRef, useEffect } from 'react'
import type { Socket } from 'socket.io-client'  // ✅ Built-in types
import { getSocket } from '@/lib/socket'
import { useAuth } from './useAuth'

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null)  // ✅ Proper typing
  const { token } = useAuth()

  useEffect(() => {
    if (token) {
      socketRef.current = getSocket()
      
      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect()
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [token])

  return socketRef.current
}