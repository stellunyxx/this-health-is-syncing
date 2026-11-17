
import {
  CheckCircle2,
  Circle,
  Clock3,
  XCircle,
  CalendarClock,
} from 'lucide-react'

import { getAppointmentHistory } from '../data/appointments'
import type { Appointment } from '../data/appointments'

type Props = {
  appointment: Appointment
}

function getEventStyle(action: string) {
  const value = action.toLowerCase()

  if (
    value.includes('declined') ||
    value.includes('rejected')
  ) {
    return {
      text: 'text-red-700',
      background: 'bg-red-50',
      border: 'border-red-200',
      Icon: XCircle,
    }
  }

  if (
    value.includes('rescheduled') ||
    value.includes('proposed')
  ) {
    return {
      text: 'text-amber-700',
      background: 'bg-amber-50',
      border: 'border-amber-200',
      Icon: CalendarClock,
    }
  }

  if (
    value.includes('change requested') ||
    value.includes('change request')
  ) {
    return {
      text: 'text-blue-700',
      background: 'bg-blue-50',
      border: 'border-blue-200',
      Icon: Clock3,
    }
  }

  if (
    value.includes('approved') ||
    value.includes('completed') ||
    value.includes('accepted')
  ) {
    return {
      text: 'aio-success-text',
      background: 'aio-success-bg',
      border: 'aio-success-border',
      Icon: CheckCircle2,
    }
  }

  return {
    text: 'text-[var(--color-primary)]',
    background: 'bg-[var(--color-primary-soft)]',
    border: 'border-[var(--color-border)]',
    Icon: Circle,
  }
}

function AppointmentTimeline({ appointment }: Props) {
  const history = getAppointmentHistory(appointment)

  return (
    <section className="mt-6 border-t border-[var(--color-border)] pt-5">
      <h3 className="mb-6 text-sm font-semibold text-[var(--color-text)]">
        Appointment Status Timeline
      </h3>

      {history.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          No appointment history recorded yet.
        </p>
      ) : (
        <ol className="space-y-0">
          {history.map((event, index) => {
            const isLast = index === history.length - 1
            const style = getEventStyle(event.action)
            const Icon = style.Icon

            return (
              <li key={event.id} className="flex gap-3">
                {/* Timeline Indicator */}
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${style.background} ${style.border}`}
                  >
                    <Icon
                      size={17}
                      className={style.text}
                      strokeWidth={1.9}
                    />
                  </span>

                  {!isLast && (
                    <div className="my-1 min-h-10 w-px flex-1 bg-[var(--color-border)]" />
                  )}
                </div>

                {/* Event Details */}
                <div className={`min-w-0 flex-1 ${isLast ? '' : 'pb-6'}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`text-sm font-semibold ${
                        isLast
                          ? style.text
                          : 'text-[var(--color-text)]'
                      }`}
                    >
                      {event.action}
                    </p>

                    {isLast && (
                      <span className="rounded-md bg-[var(--color-surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-text-muted)]">
                        Latest
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {event.actor} ·{' '}
                    {new Date(event.timestamp).toLocaleString()}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                    {event.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

export default AppointmentTimeline
