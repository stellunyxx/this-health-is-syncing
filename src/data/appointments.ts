
export type RequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rescheduled'
  | 'Change Requested'
  | 'Declined'
  | 'Completed'

export type AppointmentEvent = {
  id: string
  action: string
  actor: 'Patient' | 'Healthcare Facility'
  timestamp: string
  description: string
}

export type Appointment = {
  id: string
  facilityId: number
  facilityName: string
  patient: string
  service: string
  date: string
  symptoms: string[]
  duration: string
  status: RequestStatus
  createdAt: string
  rescheduledDate?: string
  patientSuggestedDate?: string
  completedAt?: string
  consultationConcern?: string
  history?: AppointmentEvent[]
}

const STORAGE_KEY = 'aio-demo-appointments'
const UPDATE_EVENT = 'aio-appointments-updated'

function createEvent(
  action: string,
  actor: AppointmentEvent['actor'],
  description: string
): AppointmentEvent {
  return {
    id: crypto.randomUUID(),
    action,
    actor,
    description,
    timestamp: new Date().toISOString(),
  }
}

export function getAppointments(): Appointment[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed)
      ? (parsed as Appointment[])
      : []
  } catch {
    return []
  }
}

export function getAppointmentById(
  id: string
): Appointment | undefined {
  return getAppointments().find(
    (appointment) => appointment.id === id
  )
}

export function saveAppointments(
  appointments: Appointment[]
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(appointments)
  )
  window.dispatchEvent(new Event(UPDATE_EVENT))
}

export function addAppointment(
  appointment: Omit<
    Appointment,
    | 'id'
    | 'status'
    | 'createdAt'
    | 'rescheduledDate'
    | 'patientSuggestedDate'
    | 'completedAt'
    | 'consultationConcern'
    | 'history'
  >
): Appointment {
  const createdAt = new Date().toISOString()

  const newAppointment: Appointment = {
    ...appointment,
    id: crypto.randomUUID(),
    status: 'Pending',
    createdAt,
    history: [
      createEvent(
        'Request Submitted',
        'Patient',
        'Appointment request submitted for facility review.'
      ),
    ],
  }

  saveAppointments([...getAppointments(), newAppointment])
  return newAppointment
}

function updateMatchingAppointment(
  id: string,
  updater: (appointment: Appointment) => Appointment
) {
  let changed = false

  const updated = getAppointments().map((appointment) => {
    if (appointment.id !== id) return appointment
    changed = true
    return updater(appointment)
  })

  if (changed) saveAppointments(updated)
}

function appendEvent(
  appointment: Appointment,
  event: AppointmentEvent
): Appointment {
  return {
    ...appointment,
    history: [...(appointment.history ?? []), event],
  }
}

export function getAppointmentHistory(
  appointment: Appointment
): AppointmentEvent[] {
  const history = appointment.history ?? []

  if (history.length > 0) {
    return [...history].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime()
    )
  }

  // Older demo appointments may not have a recorded event history.
  return [
    {
      id: `legacy-${appointment.id}`,
      action: 'Request Submitted',
      actor: 'Patient',
      timestamp: appointment.createdAt,
      description:
        'This request was created before event tracking was enabled.',
    },
  ]
}

export function updateAppointmentStatus(
  id: string,
  status: RequestStatus,
  rescheduledDate?: string
) {
  const appointment = getAppointmentById(id)
  if (!appointment) return

  const allowed =
    (appointment.status === 'Pending' ||
      appointment.status === 'Change Requested') &&
    (status === 'Approved' ||
      status === 'Rescheduled' ||
      status === 'Declined')

  if (!allowed) return

  if (status === 'Rescheduled' && !rescheduledDate) return

  const descriptions: Record<
    'Approved' | 'Rescheduled' | 'Declined',
    string
  > = {
    Approved: 'The healthcare facility approved the appointment.',
    Rescheduled:
      `The healthcare facility proposed ${rescheduledDate} as a new date.`,
    Declined: 'The healthcare facility declined the request.',
  }

  updateMatchingAppointment(id, (current) =>
    appendEvent(
      {
        ...current,
        status,
        rescheduledDate:
          status === 'Rescheduled'
            ? rescheduledDate
            : undefined,
        patientSuggestedDate: undefined,
      },
      createEvent(
        status,
        'Healthcare Facility',
        descriptions[status]
      )
    )
  )
}

export function acceptRescheduledDate(id: string) {
  const appointment = getAppointmentById(id)

  if (
    !appointment ||
    appointment.status !== 'Rescheduled' ||
    !appointment.rescheduledDate
  ) return

  updateMatchingAppointment(id, (current) =>
    appendEvent(
      {
        ...current,
        date: current.rescheduledDate!,
        status: 'Approved',
        rescheduledDate: undefined,
        patientSuggestedDate: undefined,
      },
      createEvent(
        'Proposed Date Accepted',
        'Patient',
        'The patient accepted the facility-proposed appointment date.'
      )
    )
  )
}

export function requestAnotherDate(
  id: string,
  suggestedDate: string
) {
  const appointment = getAppointmentById(id)

  if (
    !appointment ||
    appointment.status !== 'Rescheduled' ||
    !suggestedDate
  ) return

  updateMatchingAppointment(id, (current) =>
    appendEvent(
      {
        ...current,
        status: 'Change Requested',
        patientSuggestedDate: suggestedDate,
        rescheduledDate: undefined,
      },
      createEvent(
        'Another Date Requested',
        'Patient',
        `The patient suggested ${suggestedDate} for facility review.`
      )
    )
  )
}

export function approveSuggestedDate(id: string) {
  const appointment = getAppointmentById(id)

  if (
    !appointment ||
    appointment.status !== 'Change Requested' ||
    !appointment.patientSuggestedDate
  ) return

  updateMatchingAppointment(id, (current) =>
    appendEvent(
      {
        ...current,
        date: current.patientSuggestedDate!,
        status: 'Approved',
        patientSuggestedDate: undefined,
        rescheduledDate: undefined,
      },
      createEvent(
        'Suggested Date Approved',
        'Healthcare Facility',
        'The healthcare facility approved the patient-suggested date.'
      )
    )
  )
}

export function completeConsultation(
  id: string,
  concern: string
) {
  const appointment = getAppointmentById(id)

  if (
    !appointment ||
    appointment.status !== 'Approved' ||
    !concern.trim()
  ) return

  updateMatchingAppointment(id, (current) =>
    appendEvent(
      {
        ...current,
        status: 'Completed',
        completedAt: new Date().toISOString(),
        consultationConcern: concern.trim(),
      },
      createEvent(
        'Consultation Completed',
        'Healthcare Facility',
        'The consultation was marked as completed.'
      )
    )
  )
}
