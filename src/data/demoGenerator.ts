
import { facilities } from './facilities'
import {
  getAppointments,
  saveAppointments,
} from './appointments'
import type {
  Appointment,
  AppointmentEvent,
  RequestStatus,
} from './appointments'

const DEMO_PREFIX = 'aio-generated-'

const services = [
  'General Consultation',
  'Primary Care',
  'Maternal Health',
  'Laboratory Services',
]

const concerns = [
  'Routine checkup',
  'Respiratory concern',
  'Maternal health consultation',
  'General wellness',
  'Laboratory follow-up',
]

const statuses: RequestStatus[] = [
  'Pending',
  'Approved',
  'Completed',
  'Completed',
  'Completed',
  'Declined',
]

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function randomPastDate(daysBack: number): Date {
  const date = new Date()
  date.setDate(
    date.getDate() -
      Math.floor(Math.random() * daysBack)
  )
  return date
}

function createEvent(
  action: string,
  actor: AppointmentEvent['actor'],
  timestamp: string,
  description: string
): AppointmentEvent {
  return {
    id: crypto.randomUUID(),
    action,
    actor,
    timestamp,
    description,
  }
}

export function generateDemoAppointments(
  count = 80
): number {
  const existing = getAppointments().filter(
    (appointment) =>
      !appointment.id.startsWith(DEMO_PREFIX)
  )

  const generated: Appointment[] = []

  for (let i = 0; i < count; i++) {
    const facility = facilities[i % facilities.length]
    const created = randomPastDate(30)
    const status = randomItem(statuses)

    const appointmentDate = new Date(created)
    appointmentDate.setDate(
      appointmentDate.getDate() + 2
    )

    if (
      status === 'Completed' &&
      appointmentDate > new Date()
    ) {
      appointmentDate.setDate(
        appointmentDate.getDate() - 3
      )
    }

    const createdAt = created.toISOString()
    const date = appointmentDate
      .toISOString()
      .slice(0, 10)

    const history: AppointmentEvent[] = [
      createEvent(
        'Request Submitted',
        'Patient',
        createdAt,
        'A fictional appointment request was submitted.'
      ),
    ]

    if (status !== 'Pending') {
      const reviewedAt = new Date(created)
      reviewedAt.setHours(reviewedAt.getHours() + 2)

      history.push(
        createEvent(
          status === 'Declined'
            ? 'Declined'
            : 'Approved',
          'Healthcare Facility',
          reviewedAt.toISOString(),
          status === 'Declined'
            ? 'The fictional request was declined.'
            : 'The fictional request was approved.'
        )
      )
    }

    let completedAt: string | undefined
    let consultationConcern: string | undefined

    if (status === 'Completed') {
      const completed = new Date(appointmentDate)
      completed.setHours(10, 0, 0, 0)

      completedAt = completed.toISOString()
      consultationConcern = randomItem(concerns)

      history.push(
        createEvent(
          'Consultation Completed',
          'Healthcare Facility',
          completedAt,
          'The fictional consultation was completed.'
        )
      )
    }

    generated.push({
      id: `${DEMO_PREFIX}${crypto.randomUUID()}`,
      facilityId: facility.id,
      facilityName: facility.name,
      patient: `Demo Patient ${i + 1}`,
      service: randomItem(
        facility.services.length > 0
          ? facility.services
          : services
      ),
      date,
      symptoms: [],
      duration: 'Not specified',
      status,
      createdAt,
      completedAt,
      consultationConcern,
      history,
    })
  }

  saveAppointments([...existing, ...generated])
  return generated.length
}

export function clearGeneratedDemoAppointments() {
  saveAppointments(
    getAppointments().filter(
      (appointment) =>
        !appointment.id.startsWith(DEMO_PREFIX)
    )
  )
}

export function countGeneratedDemoAppointments() {
  return getAppointments().filter(
    (appointment) =>
      appointment.id.startsWith(DEMO_PREFIX)
  ).length
}
