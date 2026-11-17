
import { facilities } from './facilities'
import type { Appointment } from './appointments'

export type FacilitySummary = {
  facilityId: number
  name: string
  location: string
  latitude: number
  longitude: number
  requests: number
  completed: number
}

export type MonitoringAlert = {
  id: string
  title: string
  description: string
  location: string
  severity: 'Info' | 'Review'
}

export function getFacilitySummaries(
  appointments: Appointment[]
): FacilitySummary[] {
  return facilities.map((facility) => {
    const records = appointments.filter(
      (appointment) =>
        appointment.facilityId === facility.id
    )

    return {
      facilityId: facility.id,
      name: facility.name,
      location: facility.location,
      latitude: facility.latitude,
      longitude: facility.longitude,
      requests: records.length,
      completed: records.filter(
        (appointment) =>
          appointment.status === 'Completed'
      ).length,
    }
  })
}

export function getServiceDistribution(
  appointments: Appointment[]
) {
  const counts = new Map<string, number>()

  appointments.forEach((appointment) => {
    counts.set(
      appointment.service,
      (counts.get(appointment.service) ?? 0) + 1
    )
  })

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export function getConsultationTrends(
  appointments: Appointment[]
) {
  const counts = new Map<string, number>()

  appointments
    .filter(
      (appointment) =>
        appointment.status === 'Completed' &&
        appointment.completedAt
    )
    .forEach((appointment) => {
      const date = appointment.completedAt!.slice(0, 10)

      counts.set(date, (counts.get(date) ?? 0) + 1)
    })

  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
}

export function getMonitoringAlerts(
  summaries: FacilitySummary[]
): MonitoringAlert[] {
  const alerts: MonitoringAlert[] = []

  summaries.forEach((facility) => {
    // Demonstration threshold only.
    // This does not detect actual outbreaks or medical emergencies.
    if (facility.requests >= 5) {
      alerts.push({
        id: `volume-${facility.facilityId}`,
        title: 'Elevated Appointment Volume',
        description:
          `${facility.requests} appointment requests are recorded ` +
          'for this facility. Review service capacity and trends.',
        location: facility.location,
        severity: 'Review',
      })
    }
  })

  return alerts
}
