import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  CheckCircle2,
  Clock3,
  FileClock,
} from 'lucide-react'

import FacilitySelector from '../../components/FacilitySelector'
import {
  FACILITY_SELECTION_EVENT,
  getSelectedFacilityId,
} from '../../data/facilitySelection'

import {
  getAppointments,
  updateAppointmentStatus,
  approveSuggestedDate,
  completeConsultation,
} from '../../data/appointments'
import type { Appointment, RequestStatus } from '../../data/appointments'

const STATUSES: Array<RequestStatus | 'All'> = [
  'All',
  'Pending',
  'Approved',
  'Rescheduled',
  'Change Requested',
  'Declined',
  'Completed',
]

function statusStyle(status: RequestStatus) {
  switch (status) {
    case 'Approved':
    case 'Completed':
      return 'aio-success'
    case 'Rescheduled':
      return 'border border-amber-200 bg-amber-50 text-amber-800'
    case 'Change Requested':
      return 'border border-blue-200 bg-blue-50 text-blue-800'
    case 'Declined':
      return 'border border-red-200 bg-red-50 text-red-800'
    default:
      return 'border border-amber-200 bg-amber-50 text-amber-800'
  }
}

function FacilityDashboard() {
  const navigate = useNavigate()

  const [facilityId, setFacilityId] = useState(
    getSelectedFacilityId
  )

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<RequestStatus | 'All'>('All')

  const [proposedDates, setProposedDates] = useState<
    Record<string, string>
  >({})

  const [concerns, setConcerns] = useState<
    Record<string, string>
  >({})

  useEffect(() => {
    const refresh = () => {
      setFacilityId(getSelectedFacilityId())
      setAppointments(getAppointments())
    }

    refresh()

    window.addEventListener('aio-appointments-updated', refresh)
    window.addEventListener(FACILITY_SELECTION_EVENT, refresh)
    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener('aio-appointments-updated', refresh)
      window.removeEventListener(FACILITY_SELECTION_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  useEffect(() => {
    setFilter('All')
    setProposedDates({})
    setConcerns({})
  }, [facilityId])

  const facilityAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          Number(appointment.facilityId) === facilityId
      ),
    [appointments, facilityId]
  )

  const visibleAppointments = useMemo(
    () =>
      facilityAppointments.filter(
        (appointment) =>
          filter === 'All' || appointment.status === filter
      ),
    [facilityAppointments, filter]
  )

  const counts = {
    total: facilityAppointments.length,
    pending: facilityAppointments.filter(
      (appointment) => appointment.status === 'Pending'
    ).length,
    approved: facilityAppointments.filter(
      (appointment) => appointment.status === 'Approved'
    ).length,
    completed: facilityAppointments.filter(
      (appointment) => appointment.status === 'Completed'
    ).length,
  }

  function changeStatus(
    appointment: Appointment,
    status: RequestStatus,
    date?: string
  ) {
    if (status === 'Rescheduled' && !date) {
      window.alert('Please select a proposed date.')
      return
    }

    updateAppointmentStatus(appointment.id, status, date)
    setAppointments(getAppointments())
  }

  function finishConsultation(appointment: Appointment) {
    const concern = concerns[appointment.id]?.trim()

    if (!concern) {
      window.alert('Please enter the consultation concern.')
      return
    }

    completeConsultation(appointment.id, concern)
    setAppointments(getAppointments())
  }

  return (
    <main className="theme-facility aio-page px-4 py-7 sm:px-6 sm:py-9">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="aio-back-button mb-5"
        >
          <ArrowLeft size={17} />
          Back to Home
        </button>

        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
              Healthcare Facility Dashboard
            </h1>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Manage appointment requests for the selected sample facility.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/facility/analytics')}
              className="aio-btn-primary inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold"
            >
              <BarChart3 size={17} />
              Analytics
            </button>

            <button
              onClick={() => navigate('/facility/audit-logs')}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
            >
              <FileClock size={17} />
              Audit Logs
            </button>
          </div>
        </div>

        <div className="mb-7">
          <FacilitySelector />
        </div>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Total Requests',
              value: counts.total,
              icon: ClipboardList,
            },
            {
              label: 'Pending',
              value: counts.pending,
              icon: Clock3,
            },
            {
              label: 'Approved',
              value: counts.approved,
              icon: CheckCircle2,
            },
            {
              label: 'Completed',
              value: counts.completed,
              icon: CheckCircle2,
            },
          ].map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                className="aio-card p-5 sm:p-6"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {item.label}
                  </span>
                  <Icon size={20} className={item.label === 'Approved' || item.label === 'Completed' ? 'text-[#36734D]' : item.label === 'Pending' ? 'text-amber-600' : 'text-[var(--color-primary)]'} />
                </div>
                <p className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
                  {item.value}
                </p>
              </div>
            )
          })}
        </section>

        <section className="aio-card p-5">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              Appointment Requests
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Only requests assigned to the selected facility appear here.
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  filter === status
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] hover:bg-[var(--color-primary-soft)]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {visibleAppointments.map((appointment) => (
              <article
                key={appointment.id}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)]">
                      {appointment.patient}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      {appointment.service}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      Requested date: {appointment.date}
                    </p>
                    {appointment.rescheduledDate && (
                      <p className="mt-1 text-xs text-amber-700">
                        Proposed date: {appointment.rescheduledDate}
                      </p>
                    )}
                    {appointment.patientSuggestedDate && (
                      <p className="mt-1 text-xs text-blue-700">
                        Patient suggested: {appointment.patientSuggestedDate}
                      </p>
                    )}
                  </div>

                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>

                {appointment.status === 'Pending' && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => changeStatus(appointment, 'Approved')}
                      className="inline-flex items-center justify-center rounded-lg bg-[#36734D] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#285A3C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#36734D]"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => changeStatus(appointment, 'Declined')}
                      className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {appointment.status === 'Change Requested' && (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        approveSuggestedDate(appointment.id)
                        setAppointments(getAppointments())
                      }}
                      className="inline-flex items-center justify-center rounded-lg bg-[#36734D] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#285A3C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#36734D]"
                    >
                      Approve Patient's Suggested Date
                    </button>
                  </div>
                )}

                {['Pending', 'Change Requested'].includes(
                  appointment.status
                ) && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      value={proposedDates[appointment.id] ?? ''}
                      onChange={(event) =>
                        setProposedDates((previous) => ({
                          ...previous,
                          [appointment.id]: event.target.value,
                        }))
                      }
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                    />
                    <button
                      onClick={() =>
                        changeStatus(
                          appointment,
                          'Rescheduled',
                          proposedDates[appointment.id]
                        )
                      }
                      className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                    >
                      Propose Another Date
                    </button>
                  </div>
                )}

                {appointment.status === 'Approved' && (
                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Principal consultation concern"
                      value={concerns[appointment.id] ?? ''}
                      onChange={(event) =>
                        setConcerns((previous) => ({
                          ...previous,
                          [appointment.id]: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                    />
                    <button
                      onClick={() => finishConsultation(appointment)}
                      className="inline-flex items-center justify-center rounded-lg bg-[#36734D] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#285A3C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#36734D]"
                    >
                      Complete Consultation
                    </button>
                  </div>
                )}

                {appointment.status === 'Completed' && (
                  <div className="mt-4 rounded-lg border border-[#C9DFC9] bg-[#EAF3E9] p-3 text-sm text-[#36734D]">
                    Consultation recorded
                    {appointment.consultationConcern &&
                      `: ${appointment.consultationConcern}`}
                  </div>
                )}
              </article>
            ))}

            {visibleAppointments.length === 0 && (
              <div className="py-12 text-center">
                <ClipboardList
                  size={32}
                  className="mx-auto mb-3 text-[#B9A5D9]"
                />
                <p className="text-sm text-[var(--color-text-muted)]">
                  No appointments match this facility and filter.
                </p>
              </div>
            )}
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          Demonstration interface only. Records are stored locally in
          this browser.
        </p>
      </div>
    </main>
  )
}

export default FacilityDashboard