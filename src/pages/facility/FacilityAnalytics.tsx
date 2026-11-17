
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock3,
} from 'lucide-react'

import FacilitySelector from '../../components/FacilitySelector'
import {
  FACILITY_SELECTION_EVENT,
  getSelectedFacilityId,
} from '../../data/facilitySelection'

import { getAppointments } from '../../data/appointments'
import type { Appointment } from '../../data/appointments'

export default function FacilityAnalytics() {
  const navigate = useNavigate()

  const [facilityId, setFacilityId] = useState(
    getSelectedFacilityId
  )

  const [appointments, setAppointments] = useState<Appointment[]>([])

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

  const records = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          Number(appointment.facilityId) === facilityId
      ),
    [appointments, facilityId]
  )

  const serviceCounts = useMemo(() => {
    const counts = new Map<string, number>()

    records.forEach((appointment) => {
      counts.set(
        appointment.service,
        (counts.get(appointment.service) ?? 0) + 1
      )
    })

    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [records])

  const concernCounts = useMemo(() => {
    const counts = new Map<string, number>()

    records
      .filter(
        (appointment) =>
          appointment.status === 'Completed' &&
          appointment.consultationConcern
      )
      .forEach((appointment) => {
        const concern = appointment.consultationConcern!.trim()

        counts.set(concern, (counts.get(concern) ?? 0) + 1)
      })

    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [records])

  const pending = records.filter(
    (appointment) => appointment.status === 'Pending'
  ).length

  const approved = records.filter(
    (appointment) => appointment.status === 'Approved'
  ).length

  const completed = records.filter(
    (appointment) => appointment.status === 'Completed'
  ).length

  function renderBars(
    data: Array<{ name: string; count: number }>,
    emptyMessage: string,
    color: 'purple' | 'green' = 'purple'
  ) {
    const maxCount = Math.max(
      1,
      ...data.map((item) => item.count)
    )

    if (data.length === 0) {
      return (
        <div className="py-10 text-center">
          <BarChart3
            size={28}
            className="mx-auto mb-3 text-[#B9A9CF]"
          />
          <p className="text-sm text-[var(--color-text-muted)]">
            {emptyMessage}
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-5">
        {data.map((item) => (
          <div key={item.name}>
            <div className="mb-2 flex items-start justify-between gap-4 text-sm">
              <span className="font-medium text-[var(--color-text)]">
                {item.name}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-[var(--color-text)]">
                {item.count}
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-[#F0EAF8]">
              <div
                className={`h-full rounded-full ${
                  color === 'green'
                    ? 'bg-[#36734D]'
                    : 'bg-[var(--color-primary)]'
                }`}
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const metrics = [
    {
      label: 'Total Requests',
      value: records.length,
      icon: ClipboardList,
      iconClass: 'text-[var(--color-primary)]',
      iconBackground: 'bg-[var(--color-primary-soft)]',
    },
    {
      label: 'Pending',
      value: pending,
      icon: Clock3,
      iconClass: 'text-amber-700',
      iconBackground: 'bg-amber-50',
    },
    {
      label: 'Approved',
      value: approved,
      icon: CheckCircle2,
      iconClass: 'aio-success-text',
      iconBackground: 'aio-success-bg',
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle2,
      iconClass: 'aio-success-text',
      iconBackground: 'aio-success-bg',
    },
  ]

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

        {/* Header */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3
              size={18}
              className="text-[var(--color-primary)]"
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              Healthcare Facility Portal
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
            Facility Analytics
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Explore appointment demand and consultation activity
            for the selected demonstration healthcare facility.
          </p>
        </header>

        {/* Facility Selector */}
        <div className="mb-8">
          <FacilitySelector />
        </div>

        {/* Summary Metrics */}
        <section className="mb-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                className="aio-card p-5"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <span className="text-sm font-medium text-[var(--color-text-muted)]">
                    {item.label}
                  </span>

                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconBackground}`}
                  >
                    <Icon
                      size={19}
                      className={item.iconClass}
                      strokeWidth={1.9}
                    />
                  </span>
                </div>

                <p className="text-3xl font-bold tabular-nums tracking-tight text-[var(--color-text)]">
                  {item.value}
                </p>
              </div>
            )
          })}
        </section>

        {/* Analytics Charts */}
        <section className="grid gap-5 lg:grid-cols-2">
          {/* Service Demand */}
          <div className="aio-card p-6 sm:p-7">
            <div className="mb-7">
              <div className="mb-2 flex items-center gap-2">
                <BarChart3
                  size={19}
                  className="text-[var(--color-primary)]"
                />
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  Service Demand
                </h2>
              </div>

              <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                Number of appointment requests for each healthcare
                service at this facility.
              </p>
            </div>

            {renderBars(
              serviceCounts,
              'No appointment requests recorded.'
            )}
          </div>

          {/* Consultation Concerns */}
          <div className="aio-card p-6 sm:p-7">
            <div className="mb-7">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2
                  size={19}
                  className="aio-success-text"
                />
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  Consultation Concerns
                </h2>
              </div>

              <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                Recorded concerns from completed consultations,
                grouped by their entered descriptions.
              </p>
            </div>

            {renderBars(
              concernCounts,
              'No completed consultation concerns recorded.',
              'green'
            )}
          </div>
        </section>

        {/* Disclaimer */}
        <p className="mt-8 text-center text-xs leading-5 text-[var(--color-text-muted)]">
          Demonstration only. Analytics use locally stored sample
          records and do not represent real healthcare data.
        </p>
      </div>
    </main>
  )
}
