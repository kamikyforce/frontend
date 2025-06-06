import { Event } from '@/types'

export const generateGoogleCalendarLink = (event: Event): string => {
  const startDate = new Date(event.eventDate)
  
  // Validate the date
  if (isNaN(startDate.getTime())) {
    console.error('Invalid event date:', event.eventDate)
    return '#' // Return a safe fallback
  }
  
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // 2 horas depois
  
  const formatDate = (date: Date) => {
    // Additional safety check
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date provided to formatDate')
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: event.description || '',
    location: event.location || event.onlineLink || '',
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export const generateICalLink = (event: Event): string => {
  const startDate = new Date(event.eventDate)
  
  // Validate the date
  if (isNaN(startDate.getTime())) {
    console.error('Invalid event date:', event.eventDate)
    return '#' // Return a safe fallback
  }
  
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000)
  
  const formatDate = (date: Date) => {
    // Additional safety check
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date provided to formatDate')
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Event App//Event App//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@eventapp.com`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${event.name}`,
    `DESCRIPTION:${event.description || ''}`,
    `LOCATION:${event.location || event.onlineLink || ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icalContent], { type: 'text/calendar' })
  return URL.createObjectURL(blob)
}