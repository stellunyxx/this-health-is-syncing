
import {
  getAppointments,
  getAppointmentHistory,
} from './appointments'

export type NotificationRole = 'Patient' | 'Healthcare Facility'

export type AppNotification = {
  id: string
  role: NotificationRole
  title: string
  message: string
  timestamp: string
  appointmentId: string
  facilityId: number
  read: boolean
}

const READ_KEY = 'aio-demo-read-notifications'
const READ_EVENT = 'aio-notifications-updated'

function getReadIds(): string[] {
  try {
    const stored = localStorage.getItem(READ_KEY)
    if (!stored) return []

    const parsed: unknown = JSON.parse(stored)

    return Array.isArray(parsed)
      ? parsed.filter(
          (value): value is string =>
            typeof value === 'string'
        )
      : []
  } catch {
    return []
  }
}

export function markNotificationRead(id: string) {
  const readIds = new Set(getReadIds())
  readIds.add(id)

  localStorage.setItem(
    READ_KEY,
    JSON.stringify([...readIds])
  )

  window.dispatchEvent(new Event(READ_EVENT))
}

export function markAllNotificationsRead(
  role: NotificationRole,
  facilityId?: number
) {
  const readIds = new Set(getReadIds())

  getNotifications(role, facilityId).forEach(
    (notification) => readIds.add(notification.id)
  )

  localStorage.setItem(
    READ_KEY,
    JSON.stringify([...readIds])
  )

  window.dispatchEvent(new Event(READ_EVENT))
}

export function getNotifications(
  role: NotificationRole,
  facilityId?: number
): AppNotification[] {
  const readIds = new Set(getReadIds())
  const notifications: AppNotification[] = []

  getAppointments().forEach((appointment) => {
    if (
      role === 'Healthcare Facility' &&
      facilityId !== undefined &&
      appointment.facilityId !== facilityId
    ) {
      return
    }

    const events = getAppointmentHistory(appointment)

    events.forEach((event) => {
      // Notify the other side when an action occurs.
      const recipientRole: NotificationRole =
        event.actor === 'Patient'
          ? 'Healthcare Facility'
          : 'Patient'

      if (recipientRole !== role) return

      const title =
        event.action === 'Request Submitted'
          ? 'New Appointment Request'
          : event.action === 'Approved'
            ? 'Appointment Approved'
            : event.action === 'Rescheduled'
              ? 'New Date Proposed'
              : event.action === 'Declined'
                ? 'Appointment Declined'
                : event.action === 'Consultation Completed'
                  ? 'Consultation Completed'
                  : event.action

      const id = `${appointment.id}-${event.id}-${role}`

      notifications.push({
        id,
        role,
        title,
        message: event.description,
        timestamp: event.timestamp,
        appointmentId: appointment.id,
        facilityId: appointment.facilityId,
        read: readIds.has(id),
      })
    })
  })

  return notifications.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() -
      new Date(a.timestamp).getTime()
  )
}
