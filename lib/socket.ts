import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const initSocket = (token: string): Socket => {
  if (socket) {
    socket.disconnect()
  }

  socket = io('https://your-event-api.fly.dev', {
    auth: {
      token,
    },
    autoConnect: true,
  })

  return socket
}

export const getSocket = (): Socket | null => socket

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}