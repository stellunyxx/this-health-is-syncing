
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ClipboardList,
  History,
  ShieldAlert,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import {
  getAppointments,
  getAppointmentHistory,
} from '../../data/appointments'
import type {
  Appointment,
  AppointmentEvent,
} from '../../data/appointments'

type AuditEntry = AppointmentEvent & {
  appointmentId: string
  facilityName: string
}

function actionColor(action: string) {
  const value = action.toLowerCase()

  if (
    value.includes('completed') ||
    value.includes('approved') ||
    value.includes('accepted')
  ) {
    return 'aio-success'
  }

  if (
    value.includes('declined') ||
    value.includes('rejected')
  ) {
    return 'border border-red-200 bg-red-50 text-red-700'
  }

  if (
    value.includes('rescheduled') ||
    value.includes('proposed')
  ) {
    return 'border border-amber-200 bg-amber-50 text-amber-800'
  }

  if (
    value.includes('change requested') ||
    value.includes('change request')
  ) {
    return 'border border-blue-200 bg-blue-50 text-blue-700'
  }

  return 'border border-[#E2D3FA] bg-[#EFE5FF] text-[#8451E5]'
}

function AuditLogs() {
  const navigate = useNavigate()

  const [appointments, setAppointments] =
    useState<Appointment[]>([])

  useEffect(() => {
    const refresh = () => {
      setAppointments(getAppointments())
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

  const entries = useMemo<AuditEntry[]>(() => {
    return appointments
      .flatMap((appointment) =>
        getAppointmentHistory(appointment).map((event) => ({
          ...event,
          appointmentId: appointment.id,
          facilityName: appointment.facilityName,
        }))
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      )
  }, [appointments])

  return (
    <main className="theme-facility aio-page px-5 py-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/facility')}
          className="aio-back-button mb-7"
        >
          <ArrowLeft size={17} />
          Back to Facility Dashboard
        </button>

        {/* Page Header */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <History
              size={18}
              className="text-[var(--color-primary)]"
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              Healthcare Facility Portal
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
            Appointment Audit Logs
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Review recorded appointment events and status changes
            across demonstration healthcare facilities.
          </p>
        </header>

        {/* Security Notice */}
        <section
          role="note"
          aria-label="Prototype audit log limitations"
          className="mb-7 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4"
        >
          <ShieldAlert
            size={20}
            className="mt-0.5 shrink-0 text-amber-700"
          />

          <div>
            <h2 className="text-sm font-semibold text-amber-900">
              Demonstration Audit Records
            </h2>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              These logs are stored in browser localStorage and
              can be modified or deleted. They are not secure,
              tamper-proof, or suitable for production auditing.
              A real superadmin audit system requires server-side
              access controls and protected storage.
            </p>
          </div>
        </section>

        {/* Audit Table */}
        <section className="aio-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-soft)]">
                <ClipboardList
                  size={19}
                  className="text-[var(--color-primary)]"
                />
              </span>

              <div>
                <h2 className="font-semibold text-[var(--color-text)]">
                  Recorded Events
                </h2>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  Appointment activity history
                </p>
              </div>
            </div>

            <span className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
              {entries.length}{' '}
              {entries.length === 1 ? 'Event' : 'Events'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)]">
                <tr className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  <th
                    scope="col"
                    className="whitespace-nowrap px-5 py-4 font-semibold sm:pl-6"
                  >
                    Timestamp
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 font-semibold"
                  >
                    Action
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 font-semibold"
                  >
                    Actor
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 font-semibold"
                  >
                    Facility
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 font-semibold"
                  >
                    Description
                  </th>
                </tr>
              </thead>

              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={`${entry.appointmentId}-${entry.id}`}
                    className="border-t border-[var(--color-border)] align-top transition-colors hover:bg-[var(--color-surface-muted)]"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-[var(--color-text-muted)] sm:pl-6">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>

                    {/* Colored Action Badge */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex max-w-[190px] rounded-md px-2.5 py-1.5 text-xs font-semibold leading-5 ${actionColor(entry.action)}`}
                      >
                        {entry.action}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-[var(--color-text-muted)]">
                      {entry.actor}
                    </td>

                    <td className="px-5 py-4 font-medium text-[var(--color-text)]">
                      {entry.facilityName}
                    </td>

                    <td className="min-w-[220px] px-5 py-4 leading-6 text-[var(--color-text-muted)]">
                      {entry.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {entries.length === 0 && (
              <div className="flex flex-col items-center justify-center border-t border-[var(--color-border)] px-5 py-14 text-center">
                <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
                  <History
                    size={26}
                    className="text-[var(--color-primary)]"
                    strokeWidth={1.8}
                  />
                </span>

                <p className="font-semibold text-[var(--color-text)]">
                  No recorded events yet
                </p>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
                  Appointment activity will appear here once
                  requests are created or updated.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Footer Note */}
        <p className="mt-7 text-center text-xs leading-5 text-[var(--color-text-muted)]">
          Prototype only. Audit records are locally stored
          demonstration data and do not constitute a secure
          production audit trail.
        </p>
      </div>
    </main>
  )
}

export default AuditLogs
