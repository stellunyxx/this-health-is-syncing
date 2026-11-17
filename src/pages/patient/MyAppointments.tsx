
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  CheckCircle2,
  CalendarClock,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import {
  getAppointments,
  acceptRescheduledDate,
  requestAnotherDate,
} from '../../data/appointments'
import type { Appointment } from '../../data/appointments'
import AppointmentTimeline from '../../components/AppointmentTimeline'

function getLocalDate() {
  const today = new Date()

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')
}

function MyAppointments() {
  const navigate = useNavigate()

  const [appointments, setAppointments] =
    useState<Appointment[]>([])

  const [editingId, setEditingId] =
    useState<string | null>(null)

  const [suggestedDate, setSuggestedDate] =
    useState('')

  useEffect(() => {
    const refresh = () => {
      setAppointments(
        getAppointments().sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
      )
    }

    refresh()

    window.addEventListener(
      'aio-appointments-updated',
      refresh
    )
    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener(
        'aio-appointments-updated',
        refresh
      )
      window.removeEventListener('storage', refresh)
    }
  }, [])

  function handleAccept(id: string) {
    acceptRescheduledDate(id)
    setEditingId(null)
    setSuggestedDate('')
  }

  function handleRequestAnotherDate(id: string) {
    if (
      !suggestedDate ||
      suggestedDate < getLocalDate()
    ) {
      return
    }

    requestAnotherDate(id, suggestedDate)

    setEditingId(null)
    setSuggestedDate('')
  }

  function statusColor(status: string) {
    switch (status) {
      case 'Approved':
        return 'aio-success'
      case 'Rescheduled':
        return 'border border-amber-200 bg-amber-50 text-amber-800'
      case 'Change Requested':
        return 'border border-blue-200 bg-blue-50 text-blue-800'
      case 'Completed':
        return 'aio-success'
      case 'Declined':
        return 'border border-red-200 bg-red-50 text-red-800'
      default:
        return 'border border-[#E2D3FA] bg-[#EFE5FF] text-[#8451E5]'
    }
  }

  return (
    <main className="theme-patient aio-page px-5 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/patient')}
          className="aio-back-button mb-8"
        >
          <ArrowLeft size={18} />
          Back to facilities
        </button>

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-[var(--color-primary-soft)] p-3 text-[var(--color-primary)]">
            <ClipboardList size={26} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)]">
              My Appointments
            </h1>

            <p className="mt-1 text-[var(--color-text-muted)]">
              Track and manage demonstration appointment requests.
            </p>
          </div>
        </div>

        {/* Appointment Cards */}
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="aio-card p-6"
            >
              {/* Facility and Status */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">
                    {appointment.facilityName}
                  </h2>

                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {appointment.service}
                  </p>
                </div>

                <span
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${statusColor(
                    appointment.status
                  )}`}
                >
                  {appointment.status}
                </span>
              </div>

              {/* Appointment Date */}
              <div className="mt-5 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <CalendarDays size={18} />

                <span>
                  {appointment.status === 'Approved' ||
                  appointment.status === 'Completed'
                    ? 'Confirmed Date:'
                    : 'Original Requested Date:'}
                  {' '}
                  {appointment.date}
                </span>
              </div>

              {/* Facility Proposed New Date */}
              {appointment.status === 'Rescheduled' &&
                appointment.rescheduledDate && (
                  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-2 text-amber-800">
                      <CalendarClock size={20} />

                      <p className="font-semibold">
                        Facility Proposed a New Date
                      </p>
                    </div>

                    <p className="mt-2 text-sm text-[var(--color-text)]">
                      Proposed Date:
                      <span className="ml-2 font-semibold">
                        {appointment.rescheduledDate}
                      </span>
                    </p>

                    <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                      You may accept this date or suggest another one.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleAccept(appointment.id)
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-[#36734D] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2B5F3F]"
                      >
                        <CheckCircle2 size={16} />
                        Accept New Date
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(appointment.id)
                          setSuggestedDate('')
                        }}
                        className="flex items-center gap-2 rounded-lg border border-amber-300 bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
                      >
                        <CalendarClock size={16} />
                        Request Another Date
                      </button>
                    </div>

                    {/* Suggest Another Date Form */}
                    {editingId === appointment.id && (
                      <div className="mt-4 border-t border-amber-200 pt-4">
                        <label
                          htmlFor={`suggested-${appointment.id}`}
                          className="block text-sm font-semibold text-[var(--color-text)]"
                        >
                          Your Preferred New Date
                        </label>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                          The healthcare facility must approve your suggestion.
                        </p>

                        <input
                          id={`suggested-${appointment.id}`}
                          type="date"
                          value={suggestedDate}
                          min={getLocalDate()}
                          onChange={(event) =>
                            setSuggestedDate(event.target.value)
                          }
                          className="mt-3 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                        />

                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            disabled={
                              !suggestedDate ||
                              suggestedDate < getLocalDate()
                            }
                            onClick={() =>
                              handleRequestAnotherDate(
                                appointment.id
                              )
                            }
                            className="aio-btn-primary px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Submit Suggestion
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null)
                              setSuggestedDate('')
                            }}
                            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* Waiting for Facility Review */}
              {appointment.status === 'Change Requested' && (
                <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="font-semibold text-blue-800">
                    Awaiting Facility Review
                  </p>

                  <p className="mt-2 text-sm text-blue-700">
                    Your Suggested Date:
                    <span className="ml-2 font-semibold">
                      {appointment.patientSuggestedDate}
                    </span>
                  </p>

                  <p className="mt-2 text-xs text-blue-700">
                    The healthcare facility will review your proposed date.
                  </p>
                </div>
              )}

              {/* Approved */}
              {appointment.status === 'Approved' && (
                <p className="mt-4 flex items-center gap-2 text-sm font-medium aio-success-text">
                  <CheckCircle2 size={18} />
                  Appointment approved for the displayed date.
                </p>
              )}

              {/* Completed */}
              {appointment.status === 'Completed' && (
                <div className="mt-5 rounded-xl border border-[#C9DFC9] bg-[#EAF3E9] p-4">
                  <p className="flex items-center gap-2 font-semibold text-[#36734D]">
                    <CheckCircle2 size={18} />
                    Consultation Completed
                  </p>

                  <p className="mt-2 text-sm text-[#36734D]">
                    The healthcare facility has marked this
                    consultation as completed.
                  </p>

                  {appointment.completedAt && (
                    <p className="mt-2 text-xs text-[#36734D]">
                      Recorded on:{' '}
                      {new Date(
                        appointment.completedAt
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Request ID */}
              <p className="mt-5 break-all text-xs text-[var(--color-text-muted)]">
                Request ID: {appointment.id}
              </p>

              {/* Appointment Status Timeline */}
              <AppointmentTimeline appointment={appointment} />
            </div>
          ))}

          {/* Empty State */}
          {appointments.length === 0 && (
            <div className="aio-card p-10 text-center">
              <ClipboardList
                size={36}
                className="mx-auto mb-4 text-[var(--color-text-muted)]"
              />

              <p className="font-medium text-[var(--color-text)]">
                No appointment requests yet
              </p>

              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Your demonstration requests will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-center text-xs text-[var(--color-text-muted)]">
          Demo only. All requests stored in this browser are visible
          here until patient authentication is implemented.
        </p>
      </div>
    </main>
  )
}

export default MyAppointments
