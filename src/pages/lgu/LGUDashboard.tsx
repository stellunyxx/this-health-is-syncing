import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BellRing,
  Building2,
  CheckCircle2,
  ClipboardList,
  MapPinned,
  Stethoscope,
  TrendingUp,
} from 'lucide-react'
import { useNavigate } from 'react-router'

import { getAppointments } from '../../data/appointments'
import type { Appointment } from '../../data/appointments'
import {
  getFacilitySummaries,
  getServiceDistribution,
  getConsultationTrends,
  getMonitoringAlerts,
} from '../../data/monitoring'
import FacilityActivityMap from '../../components/FacilityActivityMap'
import DemoDataControls from '../../components/DemoDataControls'

const panelClass = 'aio-card p-5 sm:p-6'

function LGUDashboard() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [archivedAlerts, setArchivedAlerts] = useState<string[]>([])
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    const refresh = () => setAppointments(getAppointments())
    refresh()
    window.addEventListener('aio-appointments-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('aio-appointments-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const summaries = useMemo(() => getFacilitySummaries(appointments), [appointments])
  const serviceDistribution = useMemo(() => getServiceDistribution(appointments), [appointments])
  const consultationTrends = useMemo(() => getConsultationTrends(appointments), [appointments])
  const alerts = useMemo(() => getMonitoringAlerts(summaries), [summaries])

  const totalRequests = appointments.length
  const completed = appointments.filter((appointment) => appointment.status === 'Completed').length
  const facilitiesWithRecords = summaries.filter((facility) => facility.requests > 0).length
  const activeAlerts = alerts.filter((alert) => !archivedAlerts.includes(alert.id))
  const displayedAlerts = alerts.filter((alert) =>
    showArchived ? archivedAlerts.includes(alert.id) : !archivedAlerts.includes(alert.id)
  )
  const maxServiceCount = Math.max(1, ...serviceDistribution.map((service) => service.count))
  const maxTrendCount = Math.max(1, ...consultationTrends.map((trend) => trend.count))
  const completionRate = totalRequests > 0 ? Math.round((completed / totalRequests) * 100) : 0

  function toggleArchive(id: string) {
    setArchivedAlerts((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
    )
  }

  const metrics = [
    { label: 'Total Requests', value: totalRequests, icon: ClipboardList, iconClass: 'bg-[#F7E3D0] text-[#A4562A]', detail: 'Across all sample facilities' },
    { label: 'Completed Consultations', value: completed, icon: CheckCircle2, iconClass: 'aio-success-bg aio-success-text', detail: `${completionRate}% of requests completed` },
    { label: 'Facilities with Activity', value: facilitiesWithRecords, icon: Building2, iconClass: 'bg-[#F8EDE1] text-[#B96532]', detail: `Of ${summaries.length} sample facilities` },
    { label: 'Active Indicators', value: activeAlerts.length, icon: Activity, iconClass: 'bg-amber-50 text-amber-600', detail: 'Simulated volume-based flags' },
  ]

  return (
    <main className="theme-lgu aio-page px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="aio-back-button"
        >
          <ArrowLeft size={17} />
          Back to Home
        </button>

        <header className="relative overflow-hidden rounded-xl bg-[var(--color-primary)] p-6 text-white  sm:p-8">
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#FCE9DB]">Community health overview</p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">LGU / DRRM Monitoring</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#FCE9DB] sm:text-base">
                Monitor appointment activity, facility utilization, and simulated healthcare indicators in one place.
              </p>
            </div>
            <p className="self-start border-l border-[#DDA780] pl-3 text-sm text-[#FCE9DB]">Prototype data · Not live surveillance</p>
          </div>
        </header>

        <section aria-label="Dashboard metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.label} className="aio-card p-5 ">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">{metric.label}</p>
                  <span className={`inline-flex rounded-lg p-3 ${metric.iconClass}`}><Icon size={20} /></span>
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">{metric.value.toLocaleString()}</p>
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">{metric.detail}</p>
              </div>
            )
          })}
        </section>

        {/* The map component owns its own card, heading and border. */}
        <FacilityActivityMap summaries={summaries} />

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">Facility Overview</h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Requests and completed consultations by facility</p>
            </div>
            <span className="rounded-md bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">{summaries.length} facilities</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {summaries.map((facility) => {
              const rate = facility.requests > 0 ? Math.round((facility.completed / facility.requests) * 100) : 0
              return (
                <div key={facility.facilityId} className="aio-card p-5">
                  <div className="flex items-start gap-3">
                    <span className="rounded-lg bg-[var(--color-surface-muted)] p-3 text-[var(--color-primary)]"><Building2 size={21} /></span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[var(--color-text)]">{facility.name}</h3>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{facility.location}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-[var(--color-surface-muted)] p-3">
                      <p className="text-xs text-[var(--color-primary)]">Requests</p>
                      <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{facility.requests}</p>
                    </div>
                    <div className="rounded-lg bg-[var(--color-surface-muted)] p-3">
                      <p className="text-xs aio-success-text">Completed</p>
                      <p className="mt-1 text-2xl font-bold aio-success-text">{facility.completed}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 flex justify-between text-xs text-[var(--color-text-muted)]">
                      <span>Completion rate</span><span className="font-semibold text-[var(--color-primary)]">{rate}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-md bg-[var(--color-surface-muted)]">
                      <div className="h-full rounded-md bg-[var(--color-primary)] transition-all" style={{ width: `${rate}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className={panelClass}>
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-[var(--color-primary-soft)] p-2.5 text-[var(--color-primary)]"><Stethoscope size={20} /></span>
              <div>
                <h2 className="text-lg font-semibold">Service Demand</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Appointment requests by service</p>
              </div>
            </div>
            <div className="mt-6 space-y-5">
              {serviceDistribution.map((service) => (
                <div key={service.name}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-[var(--color-text)]">{service.name}</span>
                    <span className="font-semibold tabular-nums text-[var(--color-primary)]">{service.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-md bg-[var(--color-surface-muted)]">
                    <div className="h-full rounded-md bg-[var(--color-primary)] transition-all" style={{ width: `${(service.count / maxServiceCount) * 100}%` }} />
                  </div>
                </div>
              ))}
              {serviceDistribution.length === 0 && <div className="rounded-lg bg-[var(--color-surface-muted)] py-10 text-center text-sm text-[var(--color-text-muted)]">No service demand records yet.</div>}
            </div>
          </div>

          <div className={panelClass}>
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-[#E8F3EC] p-2.5 aio-success-text"><TrendingUp size={20} /></span>
              <div>
                <h2 className="text-lg font-semibold">Consultation Trends</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Completed consultations by date</p>
              </div>
            </div>
            <div className="mt-6 max-h-80 space-y-5 overflow-y-auto pr-1">
              {consultationTrends.map((item) => (
                <div key={item.date}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-[var(--color-text)]">{item.date}</span>
                    <span className="font-semibold tabular-nums aio-success-text">{item.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-md bg-[var(--color-surface-muted)]">
                    <div className="h-full rounded-md bg-[#36734D] transition-all" style={{ width: `${(item.count / maxTrendCount) * 100}%` }} />
                  </div>
                </div>
              ))}
              {consultationTrends.length === 0 && <div className="rounded-lg bg-[var(--color-surface-muted)] py-10 text-center text-sm text-[var(--color-text-muted)]">No completed consultations yet.</div>}
            </div>
          </div>
        </section>

        <section className={panelClass}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><BellRing size={20} /></span>
              <div>
                <h2 className="text-lg font-semibold">Monitoring Indicators</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">Simulated flags based on demonstration appointment volume</p>
              </div>
            </div>
            <div className="inline-flex self-start rounded-xl bg-[var(--color-surface-muted)] p-1" role="group" aria-label="Filter monitoring indicators">
              <button type="button" onClick={() => setShowArchived(false)} aria-pressed={!showArchived} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${!showArchived ? 'bg-[var(--color-surface)] text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'}`}>Active ({activeAlerts.length})</button>
              <button type="button" onClick={() => setShowArchived(true)} aria-pressed={showArchived} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${showArchived ? 'bg-[var(--color-surface)] text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'}`}>Archived ({alerts.length - activeAlerts.length})</button>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {displayedAlerts.map((alert) => (
              <div key={alert.id} className="flex flex-col gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <span className="mt-0.5 shrink-0 rounded-xl bg-amber-100 p-2 text-amber-700"><AlertTriangle size={18} /></span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[var(--color-text)]">{alert.title}</h3>
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Simulated</span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">{alert.description}</p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-[var(--color-text-muted)]"><MapPinned size={12} /> {alert.location}</p>
                  </div>
                </div>
                <button type="button" onClick={() => toggleArchive(alert.id)} className="shrink-0 self-start rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-surface-muted)] sm:self-auto">{showArchived ? 'Restore' : 'Archive'}</button>
              </div>
            ))}
            {displayedAlerts.length === 0 && <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">No {showArchived ? 'archived' : 'active'} indicators.</div>}
          </div>
        </section>

        {/* DemoDataControls already provides its own card and heading. */}
        <DemoDataControls />

        <p className="px-3 pb-3 text-center text-xs leading-5 text-[var(--color-text-muted)]">
          All facilities and records shown are fictional or approximate demonstrations. These indicators do not represent actual disease surveillance or emergency alerts.
        </p>
      </div>
    </main>
  )
}

export default LGUDashboard
