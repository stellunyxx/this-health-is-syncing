
import { useEffect, useState } from 'react'
import {
  Database,
  RotateCcw,
  Trash2,
} from 'lucide-react'

import {
  generateDemoAppointments,
  clearGeneratedDemoAppointments,
  countGeneratedDemoAppointments,
} from '../data/demoGenerator'

function DemoDataControls() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const refresh = () => {
      setCount(countGeneratedDemoAppointments())
    }

    refresh()

    window.addEventListener('aio-appointments-updated', refresh)
    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener('aio-appointments-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  function handleGenerate() {
    generateDemoAppointments(80)
    setCount(countGeneratedDemoAppointments())
  }

  function handleClear() {
    clearGeneratedDemoAppointments()
    setCount(countGeneratedDemoAppointments())
  }

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-5">
        {/* Information */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-soft)]">
              <Database
                size={20}
                strokeWidth={1.8}
                className="text-[var(--color-primary)]"
              />
            </span>

            <div>
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                Synthetic Demo Data
              </h2>

              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Demonstration records manager
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
            <span className="font-semibold text-[var(--color-text)]">
              {count}
            </span>{' '}
            generated appointment records currently stored.
            Generate fictional activity to populate the dashboards.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleGenerate}
            className="aio-btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
            <RotateCcw size={16} strokeWidth={1.8} />
            Generate 80 Records
          </button>

          <button
            type="button"
            disabled={count === 0}
            onClick={handleClear}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8C5C9] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold text-[#B34F5A] transition-colors hover:bg-[#FBEDEF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B34F5A] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={16} strokeWidth={1.8} />
            Clear Generated
          </button>
        </div>
      </div>

      {/* Information Note */}
      <div className="mt-5 border-t border-[var(--color-border)] pt-4">
        <p className="text-xs leading-5 text-[var(--color-text-muted)]">
          Generating replaces previously generated records,
          but preserves manually created demonstration appointments.
        </p>
      </div>
    </section>
  )
}

export default DemoDataControls
